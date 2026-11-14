// Market rules, quote parsing and fee schedules for the simulated trading desk.
// All prices in this module are native-currency numbers; callers convert to CNY.

export const MARKET_META = {
  A: {
    label: 'A股',
    short: '沪深',
    timezone: 'Asia/Shanghai',
    currency: 'CNY',
    currencySymbol: '¥',
    lot: 100,
    priceDigits: 2,
    sessions: [[570, 690], [780, 900]],
    auction: [555, 570],
    source: '腾讯证券',
  },
  HK: {
    label: '港股',
    short: '香港',
    timezone: 'Asia/Hong_Kong',
    currency: 'HKD',
    currencySymbol: 'HK$',
    lot: 100,
    priceDigits: 3,
    sessions: [[570, 720], [780, 960]],
    auction: [540, 570],
    source: '腾讯证券',
  },
  US: {
    label: '美股',
    short: '美国',
    timezone: 'America/New_York',
    currency: 'USD',
    currencySymbol: '$',
    lot: 1,
    priceDigits: 2,
    sessions: [[570, 960]],
    auction: null,
    source: '腾讯证券',
  },
};

export const INDEX_DEFS = [
  { secid: '1.000001', quoteCode: 'sh000001', symbol: '000001', name: '上证指数', market: 'A', currency: 'CNY', assetType: 'index' },
  { secid: '0.399001', quoteCode: 'sz399001', symbol: '399001', name: '深证成指', market: 'A', currency: 'CNY', assetType: 'index' },
  { secid: '100.HSI', quoteCode: 'hkHSI', symbol: 'HSI', name: '恒生指数', market: 'HK', currency: 'HKD', assetType: 'index' },
  { secid: '100.IXIC', quoteCode: 'usIXIC', symbol: 'IXIC', name: '纳斯达克', market: 'US', currency: 'USD', assetType: 'index' },
];

export const DEFAULT_WATCHLIST = [
  { secid: '1.600519', quoteCode: 'sh600519', symbol: '600519', name: '贵州茅台', market: 'A', currency: 'CNY', assetType: 'stock', lotSize: 100 },
  { secid: '0.300750', quoteCode: 'sz300750', symbol: '300750', name: '宁德时代', market: 'A', currency: 'CNY', assetType: 'stock', lotSize: 100 },
  { secid: '116.00700', quoteCode: 'hk00700', symbol: '00700', name: '腾讯控股', market: 'HK', currency: 'HKD', assetType: 'stock', lotSize: 100 },
  { secid: '105.AAPL', quoteCode: 'usAAPL', symbol: 'AAPL', name: '苹果', market: 'US', currency: 'USD', assetType: 'stock', lotSize: 1 },
  { secid: '105.NVDA', quoteCode: 'usNVDA', symbol: 'NVDA', name: '英伟达', market: 'US', currency: 'USD', assetType: 'stock', lotSize: 1 },
  { secid: '116.09988', quoteCode: 'hk09988', symbol: '09988', name: '阿里巴巴-W', market: 'HK', currency: 'HKD', assetType: 'stock', lotSize: 100 },
];

const KNOWN_INDEX_CODES = new Set(INDEX_DEFS.map(row => row.quoteCode));

export function marketMeta(market) {
  return MARKET_META[market] || MARKET_META.A;
}

export function marketDate(market, now = new Date()) {
  const meta = marketMeta(market);
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: meta.timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

export function zonedParts(date, timezone) {
  const fmt = new Intl.DateTimeFormat('en-GB', {
    timeZone: timezone,
    weekday: 'short',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  });
  const parts = Object.fromEntries(fmt.formatToParts(date).filter(part => part.type !== 'literal').map(part => [part.type, part.value]));
  return {
    weekday: parts.weekday,
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
    second: Number(parts.second),
    minuteOfDay: Number(parts.hour) * 60 + Number(parts.minute),
    date: `${parts.year}-${parts.month}-${parts.day}`,
    time: `${parts.hour}:${parts.minute}:${parts.second}`,
  };
}

/** Session status for one market. Holiday calendars are not inferred. */
export function marketSession(market, now = new Date()) {
  const meta = marketMeta(market);
  const parts = zonedParts(now, meta.timezone);
  const weekday = parts.weekday !== 'Sat' && parts.weekday !== 'Sun';
  const minutes = parts.minuteOfDay;
  let status = 'closed';
  let label = '已收盘';
  let tradeable = false;
  if (weekday) {
    const [auctionStart, auctionEnd] = meta.auction || [0, 0];
    if (meta.auction && minutes >= auctionStart && minutes < auctionEnd) {
      status = 'auction';
      label = '集合竞价';
    }
    for (const [start, end] of meta.sessions) {
      if (minutes >= start && minutes < end) {
        status = 'open';
        label = '交易中';
        tradeable = true;
        break;
      }
      if (minutes >= (meta.sessions[0]?.[0] ?? 570) && minutes < (meta.sessions[meta.sessions.length - 1]?.[1] ?? 900)) {
        if (status !== 'auction') {
          status = 'break';
          label = '午间休市';
        }
      }
    }
    if (!tradeable && status === 'closed') {
      if (minutes < (meta.auction?.[0] ?? meta.sessions[0][0])) {
        label = '未开盘';
      } else if (minutes >= (meta.sessions[meta.sessions.length - 1]?.[1] ?? 900)) {
        label = '已收盘';
      }
    }
  } else {
    label = '周末休市';
  }
  return {
    market,
    status,
    label,
    tradeable,
    weekday,
    date: parts.date,
    time: parts.time,
    timezone: meta.timezone,
    localLabel: `${parts.date} ${parts.time.slice(0, 5)}`,
  };
}

export function allMarketSessions(now = new Date()) {
  return Object.fromEntries(Object.keys(MARKET_META).map(market => [market, marketSession(market, now)]));
}

export function normalizePrice(value, market) {
  const digits = marketMeta(market).priceDigits;
  if (!Number.isFinite(value)) return 0;
  return Number(value.toFixed(digits));
}

export function round2(value) {
  if (!Number.isFinite(value)) return 0;
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function roundTo(value, digits = 2) {
  if (!Number.isFinite(value)) return 0;
  const factor = 10 ** digits;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

export function fxRateForMarket(market, fx = {}) {
  if (market === 'HK') return Number(fx.hkdCny) || 0.91;
  if (market === 'US') return Number(fx.usdCny) || 7.1;
  return 1;
}

export function currencyOf(market) {
  return marketMeta(market).currency;
}

/** Board lot. A-shares are always 100; HK quotes carry their own board lot. */
export function lotForQuote(quote = {}) {
  if (quote.market === 'A') return 100;
  if (quote.market === 'HK') return Math.max(1, Math.floor(Number(quote.lotSize) || 100));
  return 1;
}

export function formatSymbol(market, symbol) {
  if (market === 'A') return symbol;
  if (market === 'HK') return String(symbol).padStart(5, '0');
  return String(symbol).toUpperCase();
}

/** Fee schedule, deliberately close to the real retail schedules. */
export function calculateFees({ market, side, qty, price, fxRate = 1, settings = {} }) {
  const grossNative = Number(price) * Number(qty);
  const grossCny = grossNative * Number(fxRate || 1);
  const breakdown = [];
  let feeCny = 0;
  const add = (label, native, rate = fxRate) => {
    const value = Number(native) || 0;
    const cny = value * Number(rate || 1);
    if (cny <= 0) return;
    breakdown.push({ label, amount: round2(value), currency: currencyOf(market), cny: round2(cny) });
    feeCny += cny;
  };

  if (market === 'A') {
    const commissionBps = Number(settings.commissionBps) || 2.5;
    const minCommission = Number(settings.minCommission) || 5;
    add('佣金', Math.max(minCommission, grossNative * commissionBps / 10000));
    add('过户费', grossNative * 0.00001);
    if (side === 'sell') add('印花税', grossNative * 0.0005);
  } else if (market === 'HK') {
    add('佣金', Math.max(3, grossNative * 0.0003));
    add('印花税', Math.max(1, Math.ceil(grossNative * 0.001)));
    add('交易费', grossNative * 0.0000565);
    add('证监会征费', grossNative * 0.000027);
    add('会计局征费', grossNative * 0.0000015);
    add('结算费', Math.min(100, Math.max(2, grossNative * 0.00002)));
  } else if (market === 'US') {
    if (side === 'sell') {
      add('SEC 费', grossNative * 0.0000278);
      add('TAF 费', Math.min(8.3, Math.max(0.01, Number(qty) * 0.000166)));
    }
  }
  if (market !== 'A') add('换汇成本', grossCny * 0.001, 1);

  return {
    grossNative,
    grossCny: round2(grossCny),
    feeCny: round2(feeCny),
    breakdown,
  };
}

export function normalizeOrderPrice(value, market) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) return null;
  return normalizePrice(numeric, market);
}

function toNumber(value) {
  const n = Number(String(value ?? '').replace(/,/g, ''));
  return Number.isFinite(n) ? n : 0;
}

function normalizeTime(raw, market) {
  const text = String(raw || '').trim();
  if (!text) return null;
  if (/^\d{14}$/.test(text)) {
    return `${text.slice(0, 4)}-${text.slice(4, 6)}-${text.slice(6, 8)} ${text.slice(8, 10)}:${text.slice(10, 12)}:${text.slice(12, 14)}`;
  }
  if (/^\d{4}\/\d{2}\/\d{2}/.test(text)) {
    return text.replaceAll('/', '-');
  }
  if (market === 'US' && /^\d{4}-\d{2}-\d{2}/.test(text)) return text;
  return text;
}

/**
 * Parse the Tencent quote wire format (GBK-decoded text).
 * Returns entries keyed by Tencent quote code, e.g. sh600519 / hk00700 / usAAPL.
 */
export function parseTencentQuotes(text) {
  const out = {};
  if (!text) return out;
  const re = /v_([A-Za-z0-9_.]+)="([^"]*)";/g;
  let match;
  while ((match = re.exec(text))) {
    const quoteCode = match[1];
    const fields = match[2].split('~');
    if (fields.length < 10) continue;
    const prefix = quoteCode.slice(0, 2).toLowerCase();
    const market = prefix === 'sh' || prefix === 'sz' || prefix === 'bj' ? 'A' : prefix === 'hk' ? 'HK' : prefix === 'us' ? 'US' : null;
    if (!market) continue;
    const meta = marketMeta(market);
    const price = toNumber(fields[3]);
    const prevClose = toNumber(fields[4]);
    if (!price) continue;
    const open = toNumber(fields[5]);
    const high = toNumber(fields[33]);
    const low = toNumber(fields[34]);
    const change = fields[31] !== undefined && fields[31] !== '' ? toNumber(fields[31]) : price - prevClose;
    const changePct = fields[32] !== undefined && fields[32] !== '' ? toNumber(fields[32]) : prevClose ? ((price - prevClose) / prevClose) * 100 : 0;
    const rawVolume = toNumber(fields[6] || fields[36]);
    const volume = market === 'A' ? rawVolume * 100 : rawVolume;
    const amount = market === 'A' ? toNumber(fields[37]) * 10000 : toNumber(fields[37]);
    const bidLevels = [];
    const askLevels = [];
    if (market === 'A') {
      for (let i = 0; i < 5; i += 1) {
        const bidPrice = toNumber(fields[9 + i * 2]);
        const bidVolume = toNumber(fields[10 + i * 2]) * 100;
        const askPrice = toNumber(fields[19 + i * 2]);
        const askVolume = toNumber(fields[20 + i * 2]) * 100;
        if (bidPrice) bidLevels.push({ price: bidPrice, volume: bidVolume });
        if (askPrice) askLevels.push({ price: askPrice, volume: askVolume });
      }
    } else if (market === 'US') {
      const bid = toNumber(fields[9]);
      const ask = toNumber(fields[19]);
      if (bid) bidLevels.push({ price: bid, volume: toNumber(fields[10]) });
      if (ask) askLevels.push({ price: ask, volume: toNumber(fields[20]) });
    }
    const symbol = market === 'A' ? (fields[2] || quoteCode.slice(2)) : (fields[2] || quoteCode.slice(2)).replace(/\.(OQ|N|AM|PK)$/i, '');
    const name = fields[1] || symbol;
    const lotSize = market === 'HK' ? Math.max(1, toNumber(fields[60]) || 100) : market === 'A' ? 100 : 1;
    out[quoteCode] = {
      quoteCode,
      symbol,
      name,
      market,
      currency: meta.currency,
      price: normalizePrice(price, market),
      prevClose: normalizePrice(prevClose, market),
      open: normalizePrice(open, market),
      high: normalizePrice(high, market),
      low: normalizePrice(low, market),
      change: roundTo(change, market === 'HK' ? 3 : 2),
      changePct: roundTo(changePct, 2),
      volume,
      amount,
      turnoverRate: toNumber(fields[38]),
      pe: market === 'A' ? toNumber(fields[39]) : toNumber(fields[39]),
      limitUp: market === 'A' ? toNumber(fields[47]) || null : null,
      limitDown: market === 'A' ? toNumber(fields[48]) || null : null,
      lotSize,
      bidLevels,
      askLevels,
      quoteTime: normalizeTime(fields[30], market),
      // A-share quotes include the trading date; this is useful for holiday hints.
      quoteDate: normalizeTime(fields[30], market)?.slice(0, 10) || null,
      source: '腾讯证券',
      isIndex: KNOWN_INDEX_CODES.has(quoteCode) || /指数/.test(name),
    };
  }
  return out;
}

/** A regular-expression-only search fallback for when the search API is unavailable. */
export function fallbackSearch(query) {
  const needle = String(query || '').trim().toLowerCase();
  if (!needle) return [];
  return DEFAULT_WATCHLIST
    .filter(row => `${row.name} ${row.symbol} ${row.quoteCode}`.toLowerCase().includes(needle))
    .map(row => ({ ...row, exchange: row.market === 'A' ? '沪深' : row.market === 'HK' ? '港交所' : '美国' }));
}

export function marketName(market) {
  return marketMeta(market).label;
}
