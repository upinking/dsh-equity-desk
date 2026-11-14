// Host half of the stock desk: persistence, live quote access and small JSON API.
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import {
  INDEX_DEFS,
  calculateFees,
  fallbackSearch,
  lotForQuote,
  marketSession,
  parseTencentQuotes,
  round2,
  roundTo,
} from './lib/market.js';
import {
  availableQty,
  borrow,
  buildQuoteMap,
  buildSnapshot,
  cancelOrder,
  createInitialState,
  enforceLiquidation,
  exportStateCsv,
  httpError,
  mergeQuote,
  LEVERAGE_TIERS,
  netContributions,
  normalizeState,
  placeOrder,
  processPendingOrders,
  repayLoan,
  totalLoanPrincipal,
  transfer,
} from './lib/engine.js';

const PREFIX = '/stock-desk';
const MAX_BODY = 1_000_000;
const QUOTE_TTL = 2_500;
const FX_TTL = 6 * 60 * 60 * 1000;
const KLINE_TTL = 3 * 60 * 1000;
const DATA_DIR = join(process.env.DSH_HOME || join(homedir(), '.dsh'), 'stock-desk');
const STATE_FILE = join(DATA_DIR, 'state.json');
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

const quoteCache = { at: 0, raw: null, error: null };
const klineCache = new Map();
const intradayCache = new Map();
const fxCache = {
  at: 0,
  data: { usdCny: 7.1, hkdCny: 0.91, source: 'fallback', date: null, stale: true },
};

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.setHeader('cache-control', 'no-store');
  res.setHeader('x-content-type-options', 'nosniff');
  res.end(JSON.stringify(body));
}

function text(res, status, body, contentType = 'text/plain; charset=utf-8') {
  res.statusCode = status;
  res.setHeader('content-type', contentType);
  res.setHeader('cache-control', 'no-store');
  res.end(body);
}

async function readBody(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY) throw httpError(413, '请求内容过大');
    chunks.push(chunk);
  }
  if (!size) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw httpError(400, '请求不是有效的 JSON');
  }
}

async function readJsonFile(file) {
  const text = await readFile(file, 'utf8');
  return JSON.parse(text);
}

class StateStore {
  constructor(file) {
    this.file = file;
    this.state = null;
    this.tail = Promise.resolve();
  }

  async load() {
    if (this.state) return this.state;
    await mkdir(dirname(this.file), { recursive: true });
    try {
      const raw = await readJsonFile(this.file);
      this.state = normalizeState(raw);
    } catch (error) {
      if (error?.code !== 'ENOENT') {
        const broken = `${this.file}.broken-${Date.now()}`;
        try { await rename(this.file, broken); } catch {}
      }
      this.state = createInitialState();
      await this.save();
    }
    return this.state;
  }

  async save() {
    await mkdir(dirname(this.file), { recursive: true });
    const temporary = `${this.file}.${process.pid}.tmp`;
    await writeFile(temporary, `${JSON.stringify(this.state, null, 2)}\n`, { mode: 0o600 });
    await rename(temporary, this.file);
  }

  async exclusive(fn) {
    const previous = this.tail;
    let release;
    this.tail = new Promise(resolve => { release = resolve; });
    await previous.catch(() => {});
    try {
      const state = await this.load();
      return await fn(state);
    } finally {
      release();
    }
  }
}

const store = new StateStore(STATE_FILE);

async function fetchWithTimeout(url, options = {}, timeout = 9_000) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'user-agent': UA,
      accept: '*/*',
      ...(options.headers || {}),
    },
    signal: AbortSignal.timeout(timeout),
  });
  if (!response.ok) throw new Error(`行情服务返回 HTTP ${response.status}`);
  return response;
}

function uniqueEntries(entries) {
  const map = new Map();
  for (const entry of entries) {
    if (!entry?.secid || !entry?.quoteCode) continue;
    if (!map.has(entry.secid)) map.set(entry.secid, {
      secid: entry.secid,
      quoteCode: entry.quoteCode,
      symbol: entry.symbol,
      name: entry.name,
      market: entry.market,
      currency: entry.currency,
      assetType: entry.assetType || 'stock',
      lotSize: entry.lotSize || (entry.market === 'A' ? 100 : entry.market === 'HK' ? 100 : 1),
    });
  }
  return [...map.values()];
}

function entriesForState(state) {
  return uniqueEntries([
    ...INDEX_DEFS,
    ...state.watchlist,
    ...Object.values(state.positions),
    ...state.orders.filter(order => order.status === 'pending'),
  ]);
}

function entriesForOrder(state, secid) {
  const found = [
    ...state.watchlist,
    ...Object.values(state.positions),
    ...state.orders,
  ].find(row => row.secid === secid);
  return found ? uniqueEntries([found])[0] : null;
}

async function fetchTencentRaw(entries) {
  if (!entries.length) return { raw: {}, error: null, stale: false };
  const codes = [...new Set(entries.map(entry => entry.quoteCode).filter(Boolean))];
  if (!codes.length) return { raw: {}, error: null, stale: false };
  const chunks = [];
  for (let i = 0; i < codes.length; i += 60) chunks.push(codes.slice(i, i + 60));
  const raw = {};
  for (const chunk of chunks) {
    const response = await fetchWithTimeout(`https://qt.gtimg.cn/q=${encodeURIComponent(chunk.join(','))}`, {
      headers: { referer: 'https://gu.qq.com/' },
    });
    const buffer = Buffer.from(await response.arrayBuffer());
    const decoded = new TextDecoder('gbk').decode(buffer);
    Object.assign(raw, parseTencentQuotes(decoded));
  }
  return { raw, error: null, stale: false };
}

async function getQuotes(entries) {
  const now = Date.now();
  const codesNeeded = entries.map(entry => entry.quoteCode);
  const cacheCovers = quoteCache.raw && codesNeeded.every(code => quoteCache.raw[code]);
  if (cacheCovers && now - quoteCache.at < QUOTE_TTL) {
    return { raw: quoteCache.raw, error: quoteCache.error, stale: false };
  }
  try {
    const result = await fetchTencentRaw(entries);
    quoteCache.at = now;
    quoteCache.raw = result.raw;
    quoteCache.error = null;
    return result;
  } catch (error) {
    const fallback = quoteCache.raw || {};
    return {
      raw: fallback,
      error: error.message || '行情获取失败',
      stale: true,
    };
  }
}

async function getFx() {
  const now = Date.now();
  if (now - fxCache.at < FX_TTL) return fxCache.data;
  try {
    const response = await fetchWithTimeout('https://api.frankfurter.app/latest?from=USD&to=CNY,HKD', {}, 8_000);
    const payload = await response.json();
    const usdCny = Number(payload?.rates?.CNY);
    const hkdUsd = Number(payload?.rates?.HKD);
    if (!usdCny || !hkdUsd) throw new Error('汇率数据不完整');
    fxCache.data = {
      usdCny: roundTo(usdCny, 4),
      hkdCny: roundTo(usdCny / hkdUsd, 4),
      source: 'frankfurter',
      date: payload.date || null,
      stale: false,
    };
    fxCache.at = now;
  } catch {
    fxCache.data = { ...fxCache.data, stale: true };
    fxCache.at = now;
  }
  return fxCache.data;
}

async function snapshotPayload(state) {
  const entries = entriesForState(state);
  const [quoteResult, fx] = await Promise.all([getQuotes(entries), getFx()]);
  const quoteMap = buildQuoteMap(entries, quoteResult.raw, fx);
  const risk = enforceLiquidation(state, quoteMap, fx, new Date());
  const notifications = processPendingOrders(state, quoteMap, fx, new Date());
  const snapshot = buildSnapshot(state, quoteMap, fx, new Date());
  const allNotifications = [];
  if (risk?.triggered) {
    for (const text of risk.notifications) allNotifications.push({ kind: 'error', text });
    snapshot.marginCall = { triggered: true, beforeRatio: risk.beforeRatio, afterRatio: risk.afterRatio, sold: risk.sold, repaid: risk.repaid };
  }
  for (const { order, result } of notifications) {
    allNotifications.push({
      kind: 'fill',
      text: result.filled
        ? `${order.name} ${order.side === 'buy' ? '买入' : '卖出'} ${order.qty} 股已成交`
        : `${order.name} 的委托已撤单：${order.rejectReason || '未能成交'}`,
    });
  }
  if (allNotifications.length) snapshot.notifications = allNotifications;
  snapshot.dataWarning = quoteResult.error ? `行情暂时不可用，显示最近一次缓存行情（${quoteResult.error}）` : null;
  snapshot.quoteStale = Boolean(quoteResult.stale);
  await store.save();
  return snapshot;
}

async function resolveEntry(secid, query) {
  const state = await store.load();
  let entry = entriesForState(state).find(row => row.secid === secid);
  if (!entry && query.quoteCode) {
    entry = {
      secid,
      quoteCode: query.quoteCode,
      symbol: query.symbol || '',
      name: query.name || '',
      market: query.market,
      currency: query.market === 'A' ? 'CNY' : query.market === 'HK' ? 'HKD' : 'USD',
      assetType: query.assetType || 'stock',
    };
  }
  if (!entry) throw httpError(404, '找不到该证券');
  return entry;
}

async function resolveKline(secid, query) {
  const entry = await resolveEntry(secid, query);
  const count = Math.max(20, Math.min(320, Math.floor(Number(query.count) || 90)));
  const cacheKey = `${entry.secid}:${count}`;
  const cached = klineCache.get(cacheKey);
  if (cached && Date.now() - cached.at < KLINE_TTL) return cached.payload;

  let payload;
  if (entry.market === 'US') {
    payload = await fetchNasdaqKline(entry, count);
  } else {
    payload = await fetchTencentKline(entry, count);
  }
  payload.name = payload.name || entry.name;
  payload.secid = entry.secid;
  payload.market = entry.market;
  payload.currency = entry.currency;
  klineCache.set(cacheKey, { at: Date.now(), payload });
  return payload;
}

async function fetchTencentKline(entry, count) {
  const quoteCode = entry.quoteCode;
  const url = `https://web.ifzq.gtimg.cn/appstock/app/fqkline/get?param=${encodeURIComponent(`${quoteCode},day,,,${count},qfq`)}`;
  const response = await fetchWithTimeout(url, { headers: { referer: 'https://gu.qq.com/' } });
  const payload = await response.json();
  const bucket = payload?.data?.[quoteCode];
  const rows = bucket?.qfqday || bucket?.day || [];
  const candles = rows.map(row => ({
    date: row[0],
    open: Number(row[1]),
    close: Number(row[2]),
    high: Number(row[3]),
    low: Number(row[4]),
    volume: Number(row[5]),
  })).filter(row => row.date && Number.isFinite(row.close) && row.close > 0);
  if (!candles.length) throw httpError(502, '该证券暂时没有历史行情');
  return { candles, source: '腾讯证券' };
}

async function fetchNasdaqKline(entry, count) {
  const end = new Date();
  const start = new Date(end.getTime() - Math.max(120, count * 2) * 86_400_000);
  const fmt = date => date.toISOString().slice(0, 10);
  const symbol = encodeURIComponent(entry.symbol);
  const url = `https://api.nasdaq.com/api/quote/${symbol}/historical?assetclass=stocks&fromdate=${fmt(start)}&todate=${fmt(end)}&limit=${count}`;
  try {
    const response = await fetchWithTimeout(url, {
      headers: {
        accept: 'application/json, text/plain, */*',
        referer: `https://www.nasdaq.com/market-activity/stocks/${entry.symbol.toLowerCase()}/historical`,
      },
    });
    const payload = await response.json();
    const rows = payload?.data?.tradesTable?.rows || [];
    const candles = rows.map(row => {
      const [month, day, year] = String(row.date || '').split('/');
      const value = text => Number(String(text || '').replace(/[$,]/g, ''));
      return {
        date: `${year}-${month}-${day}`,
        open: value(row.open),
        close: value(row.close),
        high: value(row.high),
        low: value(row.low),
        volume: value(row.volume),
      };
    }).filter(row => /^\d{4}-\d{2}-\d{2}$/.test(row.date) && Number.isFinite(row.close) && row.close > 0)
      .sort((a, b) => a.date.localeCompare(b.date));
    if (!candles.length) throw new Error('Nasdaq returned no rows');
    return { candles, source: 'Nasdaq' };
  } catch {
    // Tencent's US endpoint is thin, but it is better than no chart at all.
    try {
      return await fetchTencentKline(entry, 20);
    } catch {
      throw httpError(502, '该美股暂时没有可用的历史行情');
    }
  }
}


function parseMinuteRows(rows) {
  return (rows || []).map(row => {
    const parts = String(row || '').trim().split(/\s+/);
    if (parts.length < 2) return null;
    const clock = parts[0];
    const price = Number(parts[1]);
    if (!/^\d{4}$/.test(clock) || !Number.isFinite(price) || price <= 0) return null;
    return {
      time: `${clock.slice(0, 2)}:${clock.slice(2)}`,
      price: roundTo(price, 4),
      volume: Number(parts[2]) || 0,
      amount: Number(parts[3]) || 0,
    };
  }).filter(Boolean).sort((a, b) => a.time.localeCompare(b.time));
}

async function fetchTencentMinute(entry) {
  const url = `https://web.ifzq.gtimg.cn/appstock/app/minute/query?code=${encodeURIComponent(entry.quoteCode)}`;
  const response = await fetchWithTimeout(url, { headers: { referer: 'https://gu.qq.com/' } }, 9_000);
  const payload = await response.json();
  const bucket = payload?.data?.[entry.quoteCode];
  const rows = bucket?.data?.data || [];
  const points = parseMinuteRows(rows);
  return { points, date: bucket?.data?.date || null, source: '腾讯证券' };
}

async function fetchNasdaqMinute(entry) {
  const now = new Date();
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(now);
  const get = type => parts.find(part => part.type === type)?.value || '';
  const date = `${get('year')}-${get('month')}-${get('day')}`;
  const url = `https://api.nasdaq.com/api/quote/${encodeURIComponent(entry.symbol)}/chart?assetclass=stocks&fromdate=${date}&todate=${date}`;
  const response = await fetchWithTimeout(url, {
    headers: {
      accept: 'application/json, text/plain, */*',
      referer: `https://www.nasdaq.com/market-activity/stocks/${entry.symbol.toLowerCase()}/intraday`,
    },
  }, 9_000);
  const payload = await response.json();
  const chart = payload?.data?.chart || [];
  const points = chart.map(row => {
    const timestamp = Number(row?.x);
    if (!Number.isFinite(timestamp)) return null;
    const price = Number(row?.y);
    if (!Number.isFinite(price) || price <= 0) return null;
    const time = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'America/New_York', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
    }).format(new Date(timestamp));
    return { time, price: roundTo(price, 4), volume: Number(row?.z?.volume) || 0, amount: 0 };
  }).filter(Boolean);
  return { points, date, source: 'Nasdaq' };
}

async function resolveIntraday(secid, query) {
  const entry = await resolveEntry(secid, query);
  const cacheKey = entry.secid;
  const cached = intradayCache.get(cacheKey);
  if (cached && Date.now() - cached.at < 45_000) return cached.payload;
  let payload = null;
  try {
    const tencent = await fetchTencentMinute(entry);
    if (tencent.points.length >= 2) payload = { ...tencent, market: entry.market, name: entry.name };
  } catch {}
  if (!payload && entry.market === 'US') {
    try {
      const nasdaq = await fetchNasdaqMinute(entry);
      if (nasdaq.points.length >= 5) payload = { ...nasdaq, market: entry.market, name: entry.name };
    } catch {}
  }
  if (!payload) throw httpError(502, entry.market === 'US' ? '美股分时数据暂不可用' : '该证券暂时没有分时行情');
  intradayCache.set(cacheKey, { at: Date.now(), payload });
  return payload;
}

async function searchSecurities(query) {
  const value = String(query || '').trim().slice(0, 40);
  if (!value) return [];
  const url = `https://searchapi.eastmoney.com/api/suggest/get?input=${encodeURIComponent(value)}&type=14&token=D43BF722C8E33BDC906FB84D85E326E8&count=16`;
  try {
    const response = await fetchWithTimeout(url, { headers: { referer: 'https://quote.eastmoney.com/' } }, 7_000);
    const payload = await response.json();
    const rows = payload?.QuotationCodeTable?.Data || [];
    const mapped = rows.map(normalizeSearchRow).filter(Boolean);
    const seen = new Set();
    return mapped.filter(row => {
      const key = `${row.secid}:${row.symbol}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, 12);
  } catch {
    return fallbackSearch(value);
  }
}

function normalizeSearchRow(row) {
  const code = String(row?.Code || '').trim();
  const market = String(row?.MktNum || '');
  if (!code) return null;
  const base = {
    symbol: code,
    name: String(row.Name || '').trim(),
    lotSize: 100,
    assetType: 'stock',
  };
  if (row.Classify === 'AStock' && (market === '1' || market === '0')) {
    const prefix = market === '1' ? 'sh' : 'sz';
    return {
      ...base,
      secid: `${market}.${code}`,
      quoteCode: `${prefix}${code}`,
      market: 'A',
      currency: 'CNY',
      exchange: row.SecurityTypeName || (market === '1' ? '沪A' : '深A'),
    };
  }
  if (row.Classify === 'HK' && market === '116') {
    return {
      ...base,
      secid: `116.${code}`,
      quoteCode: `hk${code}`,
      market: 'HK',
      currency: 'HKD',
      exchange: '港交所',
    };
  }
  if (row.Classify === 'UsStock' && ['105', '106', '107'].includes(market)) {
    return {
      ...base,
      secid: `${market}.${code}`,
      quoteCode: `us${code}`,
      market: 'US',
      currency: 'USD',
      exchange: row.JYS === 'NASDAQ' ? '纳斯达克' : row.JYS === 'NYSE' ? '纽交所' : '美交所',
    };
  }
  return null;
}

async function handleApi(req, res, url) {
  const route = url.pathname.slice(PREFIX.length) || '/';
  if (route === '/api/health') {
    return json(res, 200, {
      ok: true,
      now: new Date().toISOString(),
      dataDir: DATA_DIR,
      quoteSource: '腾讯证券',
    });
  }

  if (route === '/api/state' && req.method === 'GET') {
    return store.exclusive(async state => json(res, 200, await snapshotPayload(state)));
  }

  if (route === '/api/search' && req.method === 'GET') {
    const results = await searchSecurities(url.searchParams.get('q') || '');
    return json(res, 200, { results, query: url.searchParams.get('q') || '' });
  }

  if (route === '/api/kline' && req.method === 'GET') {
    const secid = String(url.searchParams.get('secid') || '');
    if (!secid) throw httpError(400, '缺少证券标识');
    const payload = await resolveKline(secid, {
      quoteCode: url.searchParams.get('quoteCode') || '',
      symbol: url.searchParams.get('symbol') || '',
      name: url.searchParams.get('name') || '',
      market: url.searchParams.get('market') || '',
      assetType: url.searchParams.get('assetType') || 'stock',
      count: url.searchParams.get('count') || '120',
    });
    return json(res, 200, payload);
  }

  if (route === '/api/intraday' && req.method === 'GET') {
    const secid = String(url.searchParams.get('secid') || '');
    if (!secid) throw httpError(400, '缺少证券标识');
    const payload = await resolveIntraday(secid, {
      quoteCode: url.searchParams.get('quoteCode') || '',
      symbol: url.searchParams.get('symbol') || '',
      name: url.searchParams.get('name') || '',
      market: url.searchParams.get('market') || '',
      assetType: url.searchParams.get('assetType') || 'stock',
    });
    return json(res, 200, payload);
  }

  if (req.method !== 'POST') throw httpError(405, '不支持该请求方式');
  const body = await readBody(req);

  if (route === '/api/order') {
    return store.exclusive(async state => {
      const secid = String(body.secid || '');
      const entry = entriesForOrder(state, secid);
      if (!entry) throw httpError(400, '该证券不在自选或持仓中');
      const entries = entriesForState(state);
      const [quoteResult, fx] = await Promise.all([getQuotes(entries), getFx()]);
      const quoteMap = buildQuoteMap(entries, quoteResult.raw, fx);
      const result = placeOrder(state, { ...body, secid }, quoteMap, fx, new Date());
      await store.save();
      const snapshot = await snapshotPayload(state);
      return json(res, 200, { ok: true, message: result.message, order: result.order, snapshot });
    });
  }

  if (route === '/api/order/cancel') {
    return store.exclusive(async state => {
      const result = cancelOrder(state, String(body.orderId || ''), new Date());
      await store.save();
      return json(res, 200, { ok: true, message: result.message, snapshot: await snapshotPayload(state) });
    });
  }

  if (route === '/api/loan') {
    return store.exclusive(async state => {
      const result = borrow(state, { amount: body.amount }, new Date());
      await store.save();
      return json(res, 200, { ok: true, message: result.message, loan: result.loan, snapshot: await snapshotPayload(state) });
    });
  }

  if (route === '/api/loan/repay') {
    return store.exclusive(async state => {
      const result = repayLoan(state, { loanId: body.loanId, amount: body.amount }, new Date());
      await store.save();
      return json(res, 200, { ok: true, message: result.message, paid: result.paid, snapshot: await snapshotPayload(state) });
    });
  }

  if (route === '/api/transfer') {
    return store.exclusive(async state => {
      const entries = entriesForState(state);
      const [quoteResult, fx] = await Promise.all([getQuotes(entries), getFx()]);
      const quoteMap = buildQuoteMap(entries, quoteResult.raw, fx);
      const result = transfer(state, { direction: body.direction, amount: body.amount }, quoteMap, fx, new Date());
      await store.save();
      return json(res, 200, { ok: true, message: result.message, snapshot: await snapshotPayload(state) });
    });
  }

  if (route === '/api/leverage') {
    return store.exclusive(async state => {
      const value = round2(Number(body.maxLeverage));
      const allowed = LEVERAGE_TIERS.map(row => row.value);
      if (!Number.isFinite(value) || !allowed.includes(value)) throw httpError(400, '不支持的杠杆档位');
      const nextLimit = round2(netContributions(state) * (value - 1));
      if (totalLoanPrincipal(state) + Number(state.reservedCredit || 0) > nextLimit + 0.01) throw httpError(400, '当前融资余额或挂单占用超过新的杠杆上限，请先还款或撤单');
      state.settings.maxLeverage = value;
      state.updatedAt = new Date().toISOString();
      await store.save();
      return json(res, 200, { ok: true, message: `杠杆上限已调整为 ${value.toFixed(2)}x`, snapshot: await snapshotPayload(state) });
    });
  }

  if (route === '/api/settings') {
    return store.exclusive(async state => {
      const patch = body || {};
      if (typeof patch.offHoursFill === 'boolean') state.settings.offHoursFill = patch.offHoursFill;
      if (Number.isFinite(Number(patch.slippageBps))) state.settings.slippageBps = Math.max(0, Math.min(50, Number(patch.slippageBps)));
      if (Number.isFinite(Number(patch.autoRefreshSec))) state.settings.autoRefreshSec = Math.max(5, Math.min(300, Math.floor(Number(patch.autoRefreshSec))));
      state.updatedAt = new Date().toISOString();
      await store.save();
      return json(res, 200, { ok: true, message: '设置已保存', snapshot: await snapshotPayload(state) });
    });
  }

  if (route === '/api/watchlist') {
    return store.exclusive(async state => {
      if (body.action === 'remove') {
        const secid = String(body.secid || '');
        state.watchlist = state.watchlist.filter(row => row.secid !== secid);
        state.updatedAt = new Date().toISOString();
        await store.save();
        return json(res, 200, { ok: true, message: '已移出自选', snapshot: await snapshotPayload(state) });
      }
      const item = body.item;
      if (!item || !item.secid || !item.quoteCode) throw httpError(400, '证券信息不完整');
      if (!['A', 'HK', 'US'].includes(item.market)) throw httpError(400, '不支持的市场');
      if (state.watchlist.length >= 30 && !state.watchlist.some(row => row.secid === item.secid)) {
        throw httpError(400, '自选最多 30 只');
      }
      let entry = {
        secid: String(item.secid),
        quoteCode: String(item.quoteCode),
        symbol: String(item.symbol || ''),
        name: String(item.name || ''),
        market: item.market,
        currency: item.currency || (item.market === 'A' ? 'CNY' : item.market === 'HK' ? 'HKD' : 'USD'),
        assetType: 'stock',
        lotSize: Number(item.lotSize) || (item.market === 'A' ? 100 : item.market === 'HK' ? 100 : 1),
      };
      try {
        const result = await fetchTencentRaw([entry]);
        const quote = result.raw[entry.quoteCode];
        if (quote) {
          entry = {
            ...entry,
            name: quote.name || entry.name,
            symbol: quote.symbol || entry.symbol,
            lotSize: quote.market === 'HK' ? quote.lotSize : entry.lotSize,
          };
        }
      } catch {}
      if (!state.watchlist.some(row => row.secid === entry.secid)) state.watchlist.push(entry);
      state.updatedAt = new Date().toISOString();
      await store.save();
      return json(res, 200, { ok: true, message: `已加入自选：${entry.name}`, snapshot: await snapshotPayload(state) });
    });
  }

  if (route === '/api/reset') {
    return store.exclusive(async state => {
      const watchlist = state.watchlist;
      const fresh = createInitialState(new Date());
      fresh.watchlist = watchlist;
      Object.keys(state).forEach(key => delete state[key]);
      Object.assign(state, fresh);
      await store.save();
      return json(res, 200, { ok: true, message: '账户已重置为 100 万初始资金', snapshot: await snapshotPayload(state) });
    });
  }

  if (route === '/api/export') {
    const state = await store.load();
    res.statusCode = 200;
    res.setHeader('content-type', 'text/csv; charset=utf-8');
    res.setHeader('content-disposition', 'attachment; filename="stock-desk-trades.csv"');
    res.end(`\ufeff${exportStateCsv(state)}`);
    return;
  }

  throw httpError(404, '接口不存在');
}

export const name = 'dsh-stock-desk';

export default {
  inject: ['webServer', 'connection'],
  apply(ctx) {
    ctx.effect(() => ctx.webServer.register({
      kind: 'prefix',
      path: PREFIX,
      handler: async (req, res) => {
        try {
          const connection = ctx.get('connection');
          const rejection = typeof connection?.requestRejection === 'function'
            ? await connection.requestRejection({ headers: req.headers })
            : 403;
          if (rejection) {
            json(res, rejection, { error: '未授权' });
            return;
          }
          const url = new URL(req.url || '/', 'http://127.0.0.1');
          await handleApi(req, res, url);
        } catch (error) {
          if (res.headersSent) {
            res.end();
            return;
          }
          const status = Number(error?.status) || 500;
          json(res, status, { error: error?.message || '服务器内部错误' });
        }
      },
    }), 'dsh-stock-desk: /stock-desk routes');
  },
};
