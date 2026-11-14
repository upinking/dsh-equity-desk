// Pure-ish trading engine for the simulated brokerage account.
// The host owns network calls and persistence; this module owns account rules.

import {
  DEFAULT_WATCHLIST,
  INDEX_DEFS,
  MARKET_META,
  allMarketSessions,
  calculateFees,
  currencyOf,
  formatSymbol,
  fxRateForMarket,
  lotForQuote,
  marketDate,
  marketMeta,
  marketSession,
  normalizeOrderPrice,
  normalizePrice,
  round2,
  roundTo,
} from './market.js';

export const LOAN_RATE = 0.0688;
export const LOAN_OVERDUE_RATE = 0.1288;
export const LOAN_TERM_DAYS = 180;
export const MIN_LOAN = 1000;
const MAX_HISTORY = 800;

export function nowIso(now = new Date()) {
  return new Date(now).toISOString();
}

export function makeId(prefix, now = new Date()) {
  const random = Math.random().toString(36).slice(2, 7);
  const stamp = new Date(now).toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
  return `${prefix}-${stamp}-${random}`;
}

export function createInitialState(now = new Date()) {
  const at = nowIso(now);
  return {
    version: 1,
    createdAt: at,
    updatedAt: at,
    initialCapital: 1_000_000,
    cash: 1_000_000,
    reservedCash: 0,
    reservedCredit: 0,
    positions: {},
    orders: [],
    trades: [],
    loans: [],
    flows: [
      { id: makeId('F', now), at, type: 'initial', amountCny: 1_000_000, note: '初始资金' },
    ],
    depositsCny: 0,
    withdrawalsCny: 0,
    realizedPnlCny: 0,
    totalFeesCny: 0,
    watchlist: DEFAULT_WATCHLIST.map(row => ({ ...row })),
    settings: {
      offHoursFill: false,
      slippageBps: 2,
      autoRefreshSec: 15,
      maxLeverage: 1.5,
      commissionBps: 2.5,
      minCommission: 5,
    },
    dayBaseline: null,
    orderSeq: 0,
    loanSeq: 0,
  };
}

export function normalizeState(raw, now = new Date()) {
  const base = createInitialState(now);
  if (!raw || typeof raw !== 'object') return base;
  const state = {
    ...base,
    ...raw,
    settings: { ...base.settings, ...(raw.settings || {}) },
    watchlist: Array.isArray(raw.watchlist) && raw.watchlist.length ? raw.watchlist.map(row => ({ ...row })) : base.watchlist,
    positions: raw.positions && typeof raw.positions === 'object' ? raw.positions : {},
    orders: Array.isArray(raw.orders) ? raw.orders : [],
    trades: Array.isArray(raw.trades) ? raw.trades : [],
    loans: Array.isArray(raw.loans) ? raw.loans : [],
    flows: Array.isArray(raw.flows) ? raw.flows : base.flows,
  };
  // All persisted numbers are sanitized so a malformed file cannot poison totals.
  for (const key of ['cash', 'reservedCash', 'reservedCredit', 'depositsCny', 'withdrawalsCny', 'realizedPnlCny', 'totalFeesCny']) {
    state[key] = Number.isFinite(Number(state[key])) ? Number(state[key]) : base[key];
  }
  state.initialCapital = Number(state.initialCapital) || 1_000_000;
  state.settings.maxLeverage = Math.min(10, Math.max(1, Number(state.settings.maxLeverage) || 1.5));
  // Scrub wording left in accounts created before the desk was renamed.
  for (const flow of state.flows) {
    if (typeof flow.note === 'string') flow.note = flow.note.replaceAll('模拟', '').replaceAll('虚拟资金', '资金');
  }
  for (const order of state.orders) {
    if (order?.source === '模拟撮合') order.source = '撮合引擎';
  }
  for (const pos of Object.values(state.positions)) {
    pos.qty = Math.max(0, Math.floor(Number(pos.qty) || 0));
    pos.frozenQty = Math.max(0, Math.floor(Number(pos.frozenQty) || 0));
    pos.costCny = Math.max(0, Number(pos.costCny) || 0);
    pos.avgCostCny = pos.qty ? pos.costCny / pos.qty : 0;
    pos.lots = Array.isArray(pos.lots) ? pos.lots : [];
  }
  return state;
}

export function netContributions(state) {
  return round2(Number(state.initialCapital) + Number(state.depositsCny || 0) - Number(state.withdrawalsCny || 0));
}

export function totalLoanPrincipal(state) {
  return round2((state.loans || []).filter(loan => loan.status === 'active').reduce((sum, loan) => sum + Number(loan.principal || 0), 0));
}

export function totalLoanInterest(state) {
  return round2((state.loans || []).filter(loan => loan.status === 'active').reduce((sum, loan) => sum + Number(loan.accruedInterest || 0), 0));
}

export const LEVERAGE_TIERS = [
  { value: 1, label: '1x', annualRate: 0, call: 1.5, liquidation: 1.3 },
  { value: 1.5, label: '1.5x', annualRate: 0.0688, call: 1.5, liquidation: 1.3 },
  { value: 2, label: '2x', annualRate: 0.0688, call: 1.5, liquidation: 1.3 },
  { value: 3, label: '3x', annualRate: 0.0888, call: 1.35, liquidation: 1.2 },
  { value: 5, label: '5x', annualRate: 0.1188, call: 1.2, liquidation: 1.1 },
  { value: 10, label: '10x', annualRate: 0.1588, call: 1.08, liquidation: 1.04 },
];

export function maxLeverage(state) {
  return Math.max(1, Math.min(10, Number(state.settings?.maxLeverage) || 1.5));
}

export function leveragePolicy(state) {
  const value = maxLeverage(state);
  const tier = LEVERAGE_TIERS.find(row => row.value >= value) || LEVERAGE_TIERS[LEVERAGE_TIERS.length - 1];
  return { ...tier, value };
}

export function creditLimit(state) {
  return Math.max(0, round2(netContributions(state) * (maxLeverage(state) - 1)));
}

export function creditAvailable(state) {
  return Math.max(0, round2(creditLimit(state) - totalLoanPrincipal(state) - Number(state.reservedCredit || 0)));
}

/** Simple interest, actual/365. Overdue loans switch to the penalty rate. */
export function accrueLoans(state, now = new Date()) {
  let changed = false;
  const nowMs = new Date(now).getTime();
  for (const loan of state.loans) {
    if (loan.status !== 'active' || !Number(loan.principal)) continue;
    const last = new Date(loan.lastAccruedAt || loan.startAt || now).getTime();
    const elapsedDays = Math.max(0, (nowMs - last) / 86_400_000);
    if (elapsedDays < 1e-9) continue;
    const overdue = loan.dueAt && nowMs > new Date(loan.dueAt).getTime();
    const rate = overdue ? LOAN_OVERDUE_RATE : (Number(loan.annualRate) || LOAN_RATE);
    const interest = Number(loan.principal) * rate * elapsedDays / 365;
    loan.accruedInterest = roundTo(Number(loan.accruedInterest || 0) + interest, 6);
    loan.lastAccruedAt = new Date(now).toISOString();
    changed = true;
  }
  return changed;
}

function baseQuoteFields(entry) {
  return {
    secid: entry.secid,
    quoteCode: entry.quoteCode,
    symbol: entry.symbol,
    name: entry.name,
    market: entry.market,
    currency: entry.currency || currencyOf(entry.market),
    assetType: entry.assetType || 'stock',
    lotSize: entry.lotSize || (entry.market === 'A' ? 100 : entry.market === 'HK' ? 100 : 1),
  };
}

export function mergeQuote(entry, rawQuote, fx) {
  if (!rawQuote) return null;
  const fxRate = fxRateForMarket(entry.market, fx);
  return {
    ...baseQuoteFields(entry),
    ...rawQuote,
    secid: entry.secid,
    quoteCode: entry.quoteCode,
    name: rawQuote.name || entry.name,
    symbol: rawQuote.symbol || entry.symbol,
    market: entry.market,
    currency: currencyOf(entry.market),
    assetType: entry.assetType || (rawQuote.isIndex ? 'index' : 'stock'),
    lotSize: entry.market === 'A' ? 100 : rawQuote.lotSize || entry.lotSize || 1,
    fxRate,
    priceCny: roundTo((rawQuote.price || 0) * fxRate, 4),
    prevCloseCny: roundTo((rawQuote.prevClose || 0) * fxRate, 4),
    qtyDigits: entry.market === 'US' ? 0 : 0,
  };
}

export function buildQuoteMap(entries, rawQuotes, fx) {
  const map = {};
  for (const entry of entries) {
    const raw = rawQuotes[entry.quoteCode];
    if (!raw) continue;
    map[entry.secid] = mergeQuote(entry, raw, fx);
  }
  return map;
}

function quoteMeta(quote) {
  return {
    secid: quote.secid,
    quoteCode: quote.quoteCode,
    symbol: quote.symbol,
    name: quote.name,
    market: quote.market,
    currency: quote.currency,
    assetType: quote.assetType,
    lotSize: quote.lotSize,
  };
}

function todayBuyQty(position, market, now) {
  if (market !== 'A') return 0;
  const today = marketDate('A', now);
  return (position.lots || []).filter(lot => lot.date === today).reduce((sum, lot) => sum + Math.max(0, Number(lot.qty) || 0), 0);
}

export function availableQty(position, market, now = new Date()) {
  const qty = Math.max(0, Math.floor(Number(position?.qty) || 0));
  const frozen = Math.max(0, Math.floor(Number(position?.frozenQty) || 0));
  return Math.max(0, qty - frozen - todayBuyQty(position, market, now));
}

function consumeLots(position, qty, market, now) {
  let remaining = qty;
  const today = marketDate('A', now);
  position.lots = (position.lots || []).filter(lot => {
    if (remaining <= 0) return true;
    if (market === 'A' && lot.date === today) return true;
    const take = Math.min(remaining, Math.max(0, Number(lot.qty) || 0));
    lot.qty -= take;
    remaining -= take;
    return lot.qty > 0;
  });
  return remaining === 0;
}

function pushHistory(list, row, max = MAX_HISTORY) {
  list.unshift(row);
  if (list.length > max) list.length = max;
}

function nextOrderId(state, now) {
  state.orderSeq = (Number(state.orderSeq) || 0) + 1;
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const get = type => parts.find(part => part.type === type)?.value || '';
  return `O${get('year')}${get('month')}${get('day')}-${String(state.orderSeq).padStart(4, '0')}`;
}

function nextTradeId(state, now) {
  return makeId('T', now);
}

function nextLoanId(state, now) {
  state.loanSeq = (Number(state.loanSeq) || 0) + 1;
  return `L${new Date(now).getFullYear()}-${String(state.loanSeq).padStart(4, '0')}`;
}

function orderExpiry(now) {
  const expiry = new Date(now);
  expiry.setDate(expiry.getDate() + 30);
  return expiry.toISOString();
}

function slippagePrice(quote, side, settings) {
  const bps = Math.max(0, Math.min(100, Number(settings.slippageBps) || 0));
  const base = side === 'buy'
    ? (quote.askLevels?.[0]?.price || quote.price)
    : (quote.bidLevels?.[0]?.price || quote.price);
  const factor = side === 'buy' ? 1 + bps / 10_000 : 1 - bps / 10_000;
  let price = base * factor;
  if (quote.market === 'A') {
    if (quote.limitUp) price = Math.min(price, quote.limitUp);
    if (quote.limitDown) price = Math.max(price, quote.limitDown);
  }
  return normalizePrice(price, quote.market);
}

function marketable(order, quote, settings) {
  if (order.orderType === 'market') return true;
  const limit = Number(order.limitPrice);
  if (order.side === 'buy') {
    const ask = quote.askLevels?.[0]?.price;
    return (ask ? ask <= limit : quote.price <= limit);
  }
  const bid = quote.bidLevels?.[0]?.price;
  return (bid ? bid >= limit : quote.price >= limit);
}

function fillPriceFor(order, quote, settings) {
  if (order.orderType === 'market') return slippagePrice(quote, order.side, settings);
  const limit = Number(order.limitPrice);
  if (order.side === 'buy') {
    const ask = quote.askLevels?.[0]?.price;
    return normalizePrice(Math.min(limit, ask || quote.price), quote.market);
  }
  const bid = quote.bidLevels?.[0]?.price;
  return normalizePrice(Math.max(limit, bid || quote.price), quote.market);
}

function rejectOrder(state, order, reason, now) {
  order.status = 'rejected';
  order.rejectedAt = nowIso(now);
  order.rejectReason = reason;
  releaseReservation(state, order);
}

function releaseReservation(state, order) {
  if (order.reservedCny) {
    state.reservedCash = Math.max(0, round2(Number(state.reservedCash || 0) - Number(order.reservedCny)));
    order.reservedCny = 0;
  }
  if (order.reservedCredit) {
    state.reservedCredit = Math.max(0, round2(Number(state.reservedCredit || 0) - Number(order.reservedCredit)));
    order.reservedCredit = 0;
  }
  if (order.reservedQty) {
    const pos = state.positions[order.secid];
    if (pos) pos.frozenQty = Math.max(0, Math.floor(Number(pos.frozenQty || 0) - Number(order.reservedQty)));
    order.reservedQty = 0;
  }
}

function ensurePosition(state, quote) {
  let pos = state.positions[quote.secid];
  if (!pos) {
    pos = {
      secid: quote.secid,
      quoteCode: quote.quoteCode,
      symbol: quote.symbol,
      name: quote.name,
      market: quote.market,
      currency: quote.currency,
      assetType: quote.assetType,
      qty: 0,
      frozenQty: 0,
      costCny: 0,
      avgCostCny: 0,
      lots: [],
      lastPriceNative: quote.price,
      lastPriceCny: quote.priceCny,
      prevCloseNative: quote.prevClose,
      lastQuoteAt: quote.quoteTime || null,
      openedAt: nowIso(),
      lastTradeAt: null,
    };
    state.positions[quote.secid] = pos;
  }
  return pos;
}

function createLoan(state, value, now, meta = {}) {
  const principal = round2(Number(value));
  if (!Number.isFinite(principal) || principal <= 0) return null;
  const id = nextLoanId(state, now);
  const due = new Date(now);
  due.setDate(due.getDate() + LOAN_TERM_DAYS);
  const loan = {
    id,
    principal,
    annualRate: leveragePolicy(state).annualRate,
    startAt: nowIso(now),
    dueAt: due.toISOString(),
    lastAccruedAt: nowIso(now),
    accruedInterest: 0,
    status: 'active',
    ...(meta.orderId ? { orderId: meta.orderId } : {}),
    ...(meta.note ? { note: meta.note } : {}),
  };
  state.loans.unshift(loan);
  state.cash = round2(Number(state.cash) + principal);
  pushHistory(state.flows, {
    id: makeId('F', now),
    at: nowIso(now),
    type: 'loan',
    amountCny: principal,
    note: meta.note ? `${meta.note} ${id}` : `融资借入 ${id}`,
  });
  return loan;
}

function executeFill(state, order, quote, fx, now) {
  if (order.status !== 'pending') return { filled: false };
  const price = fillPriceFor(order, quote, state.settings);
  if (!price) return { filled: false };
  const fxRate = fxRateForMarket(order.market, fx);
  const grossNative = price * order.qty;
  const grossCny = round2(grossNative * fxRate);
  const fees = calculateFees({
    market: order.market,
    side: order.side,
    qty: order.qty,
    price,
    fxRate,
    settings: state.settings,
  });
  const totalCny = round2(grossCny + fees.feeCny);

  if (order.side === 'buy') {
    const reservedAfter = Math.max(0, round2(Number(state.reservedCash || 0) - Number(order.reservedCny || 0)));
    const creditAfter = Math.max(0, round2(Number(state.reservedCredit || 0) - Number(order.reservedCredit || 0)));
    let borrowed = 0;
    if (order.funding === 'margin') {
      const cashAvailable = round2(Number(state.cash) - reservedAfter);
      const shortfall = round2(Math.max(0, totalCny - cashAvailable));
      if (shortfall > 0) {
        const creditLeft = round2(creditLimit(state) - totalLoanPrincipal(state) - creditAfter);
        if (shortfall > creditLeft + 0.01) {
          rejectOrder(state, order, '融资额度不足以完成成交，委托已自动撤单', now);
          return { filled: false, rejected: true };
        }
        const loan = createLoan(state, shortfall, now, { orderId: order.id, note: `融资买入 ${order.name}` });
        if (loan) borrowed = shortfall;
      }
    }
    if (Number(state.cash) - totalCny < reservedAfter - 0.01) {
      rejectOrder(state, order, '可用资金不足以完成成交，委托已自动撤单', now);
      return { filled: false, rejected: true };
    }
    state.reservedCash = reservedAfter;
    state.reservedCredit = creditAfter;
    order.reservedCredit = 0;
    order.marginBorrowedCny = round2(Number(order.marginBorrowedCny || 0) + borrowed);
    state.cash = round2(Number(state.cash) - totalCny);
    const pos = ensurePosition(state, quote);
    const oldCost = Number(pos.costCny) || 0;
    pos.qty += order.qty;
    pos.costCny = round2(oldCost + totalCny);
    pos.avgCostCny = pos.qty ? roundTo(pos.costCny / pos.qty, 6) : 0;
    pos.lots.push({ qty: order.qty, date: marketDate(order.market, now), at: nowIso(now), price });
    pos.lastPriceNative = price;
    pos.lastPriceCny = roundTo(price * fxRate, 4);
    pos.prevCloseNative = quote.prevClose;
    pos.lastQuoteAt = quote.quoteTime || null;
    pos.lastTradeAt = nowIso(now);
    order.grossCny = grossCny;
    order.feesCny = fees.feeCny;
    order.feeBreakdown = fees.breakdown;
    order.netCny = totalCny;
    order.fillPrice = price;
    order.fillPriceCny = roundTo(price * fxRate, 4);
    order.fxRate = fxRate;
    order.filledAt = nowIso(now);
    order.status = 'filled';
    state.totalFeesCny = round2(Number(state.totalFeesCny || 0) + fees.feeCny);
    pushHistory(state.trades, {
      id: nextTradeId(state, now),
      orderId: order.id,
      at: nowIso(now),
      side: 'buy',
      secid: order.secid,
      symbol: order.symbol,
      name: order.name,
      market: order.market,
      currency: order.currency,
      qty: order.qty,
      price,
      priceCny: roundTo(price * fxRate, 4),
      fxRate,
      grossCny,
      feesCny: fees.feeCny,
      netCny: totalCny,
      realizedPnlCny: 0,
      orderType: order.orderType,
      funding: order.funding || 'cash',
      marginBorrowedCny: order.marginBorrowedCny || 0,
    });
    return { filled: true, price, grossCny, feesCny: fees.feeCny, totalCny };
  }

  // Sell
  const pos = state.positions[order.secid];
  if (!pos || pos.qty < order.qty) {
    rejectOrder(state, order, '持仓不足，委托已自动撤单', now);
    return { filled: false, rejected: true };
  }
  const basis = round2((Number(pos.avgCostCny) || 0) * order.qty);
  const netCny = round2(grossCny - fees.feeCny);
  const realized = round2(netCny - basis);
  state.cash = round2(Number(state.cash) + netCny);
  state.reservedCash = Math.max(0, round2(Number(state.reservedCash || 0) - Number(order.reservedCny || 0)));
  if (order.reservedCredit) {
    state.reservedCredit = Math.max(0, round2(Number(state.reservedCredit || 0) - Number(order.reservedCredit)));
    order.reservedCredit = 0;
  }
  if (order.reservedQty) {
    pos.frozenQty = Math.max(0, Math.floor(Number(pos.frozenQty || 0) - Number(order.reservedQty)));
    order.reservedQty = 0;
  }
  consumeLots(pos, order.qty, order.market, now);
  pos.qty -= order.qty;
  pos.costCny = round2(Math.max(0, Number(pos.costCny) - basis));
  if (pos.qty <= 0) {
    delete state.positions[order.secid];
  } else {
    pos.avgCostCny = roundTo(pos.costCny / pos.qty, 6);
    pos.lastPriceNative = price;
    pos.lastPriceCny = roundTo(price * fxRate, 4);
    pos.prevCloseNative = quote.prevClose;
    pos.lastTradeAt = nowIso(now);
  }
  state.realizedPnlCny = round2(Number(state.realizedPnlCny || 0) + realized);
  state.totalFeesCny = round2(Number(state.totalFeesCny || 0) + fees.feeCny);
  order.grossCny = grossCny;
  order.feesCny = fees.feeCny;
  order.feeBreakdown = fees.breakdown;
  order.netCny = netCny;
  order.fillPrice = price;
  order.fillPriceCny = roundTo(price * fxRate, 4);
  order.fxRate = fxRate;
  order.filledAt = nowIso(now);
  order.status = 'filled';
  pushHistory(state.trades, {
    id: nextTradeId(state, now),
    orderId: order.id,
    at: nowIso(now),
    side: 'sell',
    secid: order.secid,
    symbol: order.symbol,
    name: order.name,
    market: order.market,
    currency: order.currency,
    qty: order.qty,
    price,
    priceCny: roundTo(price * fxRate, 4),
    fxRate,
    grossCny,
    feesCny: fees.feeCny,
    netCny,
    realizedPnlCny: realized,
    orderType: order.orderType,
    funding: order.funding || 'cash',
  });
  return { filled: true, price, grossCny, feesCny: fees.feeCny, netCny, realized };
}

/**
 * Validate and place a simulated order. The caller must supply a fresh quote
 * map keyed by secid and the write-through state object.
 */
export function placeOrder(state, input, quoteMap, fx, now = new Date()) {
  const side = input?.side === 'sell' ? 'sell' : input?.side === 'buy' ? 'buy' : null;
  if (!side) throw httpError(400, '买卖方向不正确');
  const quote = quoteMap?.[String(input?.secid || '')];
  if (!quote) throw httpError(400, '暂时没有该证券的行情，无法下单');
  if (quote.assetType === 'index') throw httpError(400, '指数不能直接交易，请选择个股');
  const orderType = input?.orderType === 'limit' ? 'limit' : 'market';
  const funding = side === 'buy' && input?.funding === 'margin' ? 'margin' : 'cash';
  const qty = Math.floor(Number(input?.qty));
  if (!Number.isFinite(qty) || qty <= 0) throw httpError(400, '请填写有效的委托数量');
  const lot = lotForQuote(quote);
  if (qty % lot !== 0) throw httpError(400, `${quote.market === 'HK' ? '港股按每手' : quote.market === 'A' ? 'A股按每手' : '美股最小'} ${lot} 股下单`);

  if (qty > 1_000_000_000) throw httpError(400, '委托数量过大');

  let limitPrice = null;
  if (orderType === 'limit') {
    limitPrice = normalizeOrderPrice(input?.limitPrice, quote.market);
    if (!limitPrice) throw httpError(400, '请填写有效的限价');
    if (quote.market === 'A') {
      if (quote.limitUp && limitPrice > quote.limitUp + 0.001) throw httpError(400, `委托价高于涨停价 ${quote.limitUp}`);
      if (quote.limitDown && limitPrice < quote.limitDown - 0.001) throw httpError(400, `委托价低于跌停价 ${quote.limitDown}`);
    }
  }

  const session = marketSession(quote.market, now);
  const canFill = session.tradeable || Boolean(state.settings.offHoursFill);
  const existing = state.positions[quote.secid];
  const available = existing ? availableQty(existing, quote.market, now) : 0;

  if (side === 'sell') {
    if (!existing) throw httpError(400, '当前没有该证券持仓');
    if (qty > available) throw httpError(400, `可卖数量不足（可卖 ${available} 股，T+1 买入部分今日不可卖）`);
    const fullPosition = qty === existing.qty;
    if (quote.market !== 'US' && !fullPosition && qty % lot !== 0) throw httpError(400, '零股只能一次性全部卖出');
  } else {
    const liabilities = totalLoanPrincipal(state) + totalLoanInterest(state);
    const totalAssets = accountAssets(state, quoteMap, fx);
    const policy = leveragePolicy(state);
    if (liabilities > 0 && totalAssets / liabilities < policy.liquidation) {
      throw httpError(400, `维持担保比例低于 ${(policy.liquidation * 100).toFixed(0)}%，已限制新增买入`);
    }
  }

  const estimatePrice = orderType === 'limit' ? limitPrice : slippagePrice(quote, side, state.settings);
  const fxRate = fxRateForMarket(quote.market, fx);
  const grossCny = round2(estimatePrice * qty * fxRate);
  const estimateFees = calculateFees({ market: quote.market, side, qty, price: estimatePrice, fxRate, settings: state.settings });
  const reserve = side === 'buy' ? round2(grossCny + estimateFees.feeCny + (orderType === 'market' ? grossCny * 0.005 : 0)) : round2(estimateFees.feeCny);

  let cashReserve = 0;
  let creditReserve = 0;
  if (side === 'buy') {
    const free = round2(Number(state.cash) - Number(state.reservedCash || 0));
    if (funding === 'cash') {
      if (reserve > free) throw httpError(400, `可用资金不足，本次委托预计需要 ${formatCny(reserve)}`);
      cashReserve = reserve;
    } else {
      cashReserve = round2(Math.min(free, reserve));
      creditReserve = round2(Math.max(0, reserve - cashReserve));
      const availableCredit = creditAvailable(state);
      if (creditReserve > availableCredit + 0.01) {
        throw httpError(400, `融资额度不足，本次委托还需 ${formatCny(creditReserve - availableCredit)}`);
      }
      if (creditReserve > 0) {
        const policy = leveragePolicy(state);
        const liabilities = totalLoanPrincipal(state) + totalLoanInterest(state) + creditReserve;
        const postAssets = accountAssets(state, quoteMap, fx) + creditReserve - estimateFees.feeCny;
        if (liabilities > 0 && postAssets / liabilities < policy.call) {
          throw httpError(400, `融资后维持担保比例将低于 ${(policy.call * 100).toFixed(0)}% 警戒线，无法提交`);
        }
      }
    }
  }

  const id = nextOrderId(state, now);
  const order = {
    id,
    createdAt: nowIso(now),
    updatedAt: nowIso(now),
    status: 'pending',
    side,
    secid: quote.secid,
    quoteCode: quote.quoteCode,
    symbol: formatSymbol(quote.market, quote.symbol),
    name: quote.name,
    market: quote.market,
    currency: quote.currency,
    assetType: quote.assetType,
    orderType,
    qty,
    limitPrice,
    lotSize: lot,
    referencePrice: quote.price,
    funding,
    reservedCny: 0,
    reservedCredit: 0,
    reservedQty: 0,
    marginBorrowedCny: 0,
    expiresAt: orderExpiry(now),
    sessionAtPlacement: session.status,
    source: '撮合引擎',
  };

  if (side === 'buy') {
    order.reservedCny = cashReserve;
    order.reservedCredit = creditReserve;
    state.reservedCash = round2(Number(state.reservedCash || 0) + cashReserve);
    state.reservedCredit = round2(Number(state.reservedCredit || 0) + creditReserve);
  } else {
    order.reservedQty = qty;
    existing.frozenQty = Math.floor(Number(existing.frozenQty || 0) + qty);
  }

  pushHistory(state.orders, order, 400);
  let fillResult = null;
  if (canFill && marketable(order, quote, state.settings)) {
    fillResult = executeFill(state, order, quote, fx, now);
  }
  order.updatedAt = nowIso(now);
  state.updatedAt = nowIso(now);
  let message;
  if (order.status === 'filled') {
    const verb = side === 'buy' ? (order.funding === 'margin' ? '融资买入' : '买入') : '卖出';
    message = `${verb}成交：${order.name} ${qty} 股 @ ${formatNative(order.fillPrice, order.currency)}${order.marginBorrowedCny ? `，融资 ${formatCny(order.marginBorrowedCny)}` : ''}`;
  } else if (order.status === 'rejected') {
    message = order.rejectReason || '委托未能成交';
  } else if (session.tradeable) {
    const verb = side === 'buy' ? (order.funding === 'margin' ? '融资买入' : '买入') : '卖出';
    message = `${verb}委托已提交，等待价格触发`;
  } else if (state.settings.offHoursFill) {
    message = `${side === 'buy' ? '买入' : '卖出'}委托已提交，等待撮合`;
  } else {
    message = `${session.label}，委托已暂存，开盘后自动撮合`;
  }
  return { order, message, fill: fillResult };
}

export function cancelOrder(state, orderId, now = new Date()) {
  const order = state.orders.find(row => row.id === orderId);
  if (!order) throw httpError(404, '找不到这笔委托');
  if (order.status !== 'pending') throw httpError(400, '这笔委托已不能撤销');
  releaseReservation(state, order);
  order.status = 'cancelled';
  order.cancelledAt = nowIso(now);
  order.updatedAt = nowIso(now);
  order.rejectReason = '客户撤单';
  state.updatedAt = nowIso(now);
  return { order, message: `已撤销委托 ${order.id}` };
}

/** Try pending orders against the latest quotes. Called before each snapshot. */
export function processPendingOrders(state, quoteMap, fx, now = new Date()) {
  const touched = [];
  for (const order of state.orders) {
    if (order.status !== 'pending') continue;
    if (order.expiresAt && new Date(order.expiresAt).getTime() < new Date(now).getTime()) {
      releaseReservation(state, order);
      order.status = 'cancelled';
      order.cancelledAt = nowIso(now);
      order.updatedAt = nowIso(now);
      order.rejectReason = '委托已过期';
      touched.push({ order, result: { filled: false, expired: true } });
      continue;
    }
    const quote = quoteMap[order.secid];
    if (!quote) continue;
    const session = marketSession(order.market, now);
    const canFill = session.tradeable || Boolean(state.settings.offHoursFill);
    if (!canFill) continue;
    if (!marketable(order, quote, state.settings)) continue;
    const result = executeFill(state, order, quote, fx, now);
    order.updatedAt = nowIso(now);
    if (result.filled) touched.push({ order, result });
    if (result.rejected) touched.push({ order, result });
  }
  return touched;
}


/**
 * Simplified forced liquidation: if maintenance falls below the tier's
 * liquidation line, cancel pending orders, sell positions and use the proceeds
 * to repay margin debt until the account is back above the warning line.
 */
export function enforceLiquidation(state, quoteMap, fx, now = new Date()) {
  accrueLoans(state, now);
  const policy = leveragePolicy(state);
  const liabilitiesBefore = round2(totalLoanPrincipal(state) + totalLoanInterest(state));
  if (liabilitiesBefore <= 0) return null;
  let ratio = accountAssets(state, quoteMap, fx) / liabilitiesBefore;
  if (ratio >= policy.liquidation) return null;
  const notifications = [];
  for (const order of state.orders) {
    if (order.status !== 'pending') continue;
    releaseReservation(state, order);
    order.status = 'cancelled';
    order.cancelledAt = nowIso(now);
    order.updatedAt = nowIso(now);
    order.rejectReason = '风险强平，委托取消';
    notifications.push(`${order.name} 的待成交委托已因风险强平取消`);
  }
  const beforeRatio = ratio;
  let sold = 0;
  let repaid = 0;
  const positions = Object.values(state.positions)
    .filter(pos => pos.qty > 0)
    .sort((a, b) => Number(b.qty) * Number(b.lastPriceCny || 0) - Number(a.qty) * Number(a.lastPriceCny || 0));
  for (const pos of positions) {
    if (!state.positions[pos.secid]) continue;
    const quote = quoteMap[pos.secid];
    if (!quote) {
      notifications.push(`${pos.name} 缺少行情，未能完成强平`);
      continue;
    }
    const price = normalizePrice((quote.bidLevels?.[0]?.price || quote.price) * 0.99, pos.market);
    const fxRate = fxRateForMarket(pos.market, fx);
    const qty = pos.qty;
    const grossCny = round2(price * qty * fxRate);
    const fees = calculateFees({ market: pos.market, side: 'sell', qty, price, fxRate, settings: state.settings });
    const netCny = round2(grossCny - fees.feeCny);
    const basis = round2(Number(pos.costCny) || 0);
    const realized = round2(netCny - basis);
    const tradeId = makeId('T', now);
    state.cash = round2(Number(state.cash) + netCny);
    state.totalFeesCny = round2(Number(state.totalFeesCny || 0) + fees.feeCny);
    state.realizedPnlCny = round2(Number(state.realizedPnlCny || 0) + realized);
    pushHistory(state.trades, {
      id: tradeId,
      orderId: `RISK-${tradeId.slice(-5)}`,
      at: nowIso(now),
      side: 'sell',
      secid: pos.secid,
      symbol: pos.symbol,
      name: pos.name,
      market: pos.market,
      currency: pos.currency,
      qty,
      price,
      priceCny: roundTo(price * fxRate, 4),
      fxRate,
      grossCny,
      feesCny: fees.feeCny,
      netCny,
      realizedPnlCny: realized,
      orderType: 'market',
      funding: 'cash',
      forced: true,
    });
    delete state.positions[pos.secid];
    sold += 1;
    notifications.push(`风险强平：已卖出 ${pos.name} ${qty} 股 @ ${formatNative(price, pos.currency)}`);
    for (const loan of [...state.loans].filter(row => row.status === 'active')) {
      const due = round2(Number(loan.principal) + Number(loan.accruedInterest || 0));
      const pay = round2(Math.min(Number(state.cash), due));
      if (pay <= 0) break;
      const result = repayLoan(state, { loanId: loan.id, amount: pay }, now);
      repaid = round2(repaid + result.paid);
    }
    const remainingLiabilities = round2(totalLoanPrincipal(state) + totalLoanInterest(state));
    if (remainingLiabilities <= 0.01) break;
    ratio = accountAssets(state, quoteMap, fx) / remainingLiabilities;
    if (ratio >= policy.call) break;
  }
  const liabilitiesAfter = round2(totalLoanPrincipal(state) + totalLoanInterest(state));
  const assetsAfter = accountAssets(state, quoteMap, fx);
  const afterRatio = liabilitiesAfter > 0 ? roundTo(assetsAfter / liabilitiesAfter, 4) : null;
  if (sold) notifications.push(`强平完成：卖出 ${sold} 只持仓，自动偿还融资 ${formatCny(repaid)}`);
  else notifications.push('已触发强平线，但没有可执行的持仓或行情');
  state.updatedAt = nowIso(now);
  return { triggered: true, beforeRatio: roundTo(beforeRatio, 4), afterRatio, sold, repaid, notifications };
}

export function borrow(state, { amount } = {}, now = new Date()) {
  const value = round2(Number(amount));
  if (!Number.isFinite(value) || value < MIN_LOAN) throw httpError(400, `单笔融资不得低于 ${formatCny(MIN_LOAN)}`);
  accrueLoans(state, now);
  const available = creditAvailable(state);
  if (value > available) throw httpError(400, `可用融资额度只有 ${formatCny(available)}`);
  if (totalLoanPrincipal(state) + value > creditLimit(state)) throw httpError(400, '超过融资额度上限');
  const loan = createLoan(state, value, now);
  state.updatedAt = nowIso(now);
  return { loan, message: `已借入 ${formatCny(value)}，按日计息，随时可还` };
}

export function repayLoan(state, { loanId, amount } = {}, now = new Date()) {
  accrueLoans(state, now);
  const loan = state.loans.find(row => row.id === loanId && row.status === 'active');
  if (!loan) throw httpError(404, '找不到可还款的融资');
  const totalDue = round2(Number(loan.principal) + Number(loan.accruedInterest || 0));
  let pay = amount === undefined || amount === null || amount === '' ? totalDue : round2(Number(amount));
  if (!Number.isFinite(pay) || pay <= 0) throw httpError(400, '请填写有效的还款金额');
  pay = Math.min(pay, totalDue);
  if (pay > Number(state.cash)) throw httpError(400, `可用资金不足，当前可用 ${formatCny(state.cash)}`);
  const interestPaid = Math.min(pay, Number(loan.accruedInterest || 0));
  const principalPaid = round2(pay - interestPaid);
  state.cash = round2(Number(state.cash) - pay);
  loan.accruedInterest = round2(Math.max(0, Number(loan.accruedInterest || 0) - interestPaid));
  loan.principal = round2(Math.max(0, Number(loan.principal) - principalPaid));
  loan.lastAccruedAt = nowIso(now);
  if (loan.principal <= 0.005 && loan.accruedInterest <= 0.005) {
    loan.principal = 0;
    loan.accruedInterest = 0;
    loan.status = 'paid';
    loan.paidAt = nowIso(now);
  }
  pushHistory(state.flows, { id: makeId('F', now), at: nowIso(now), type: 'loan_repay', amountCny: -pay, note: `融资还款 ${loan.id}` });
  state.updatedAt = nowIso(now);
  return {
    loan,
    paid: pay,
    interestPaid: round2(interestPaid),
    principalPaid: round2(principalPaid),
    message: `已还款 ${formatCny(pay)}${loan.status === 'paid' ? '，该笔融资已结清' : ''}`,
  };
}

export function transfer(state, { direction, amount } = {}, quoteMap = {}, fx = {}, now = new Date()) {
  const value = round2(Number(amount));
  if (!Number.isFinite(value) || value <= 0) throw httpError(400, '请填写有效的转账金额');
  if (value > 50_000_000) throw httpError(400, '单笔银证转账上限为 5,000 万');
  if (direction === 'in') {
    state.cash = round2(Number(state.cash) + value);
    state.depositsCny = round2(Number(state.depositsCny || 0) + value);
    pushHistory(state.flows, { id: makeId('F', now), at: nowIso(now), type: 'deposit', amountCny: value, note: '银行转入' });
    state.updatedAt = nowIso(now);
    return { message: `已从银行转入 ${formatCny(value)}` };
  }
  if (direction !== 'out') throw httpError(400, '转账方向不正确');
  const free = round2(Number(state.cash) - Number(state.reservedCash || 0));
  if (value > free) throw httpError(400, `可转出资金不足，当前可用 ${formatCny(free)}`);
  const assets = accountAssets(state, quoteMap, fx);
  const liabilities = totalLoanPrincipal(state) + totalLoanInterest(state);
  if (liabilities > 0) {
    const policy = leveragePolicy(state);
    const after = (assets - value) / liabilities;
    if (after < policy.call) throw httpError(400, `转出后维持担保比例将降至 ${(after * 100).toFixed(0)}%，低于 ${(policy.call * 100).toFixed(0)}% 警戒线`);
  }
  state.cash = round2(Number(state.cash) - value);
  state.withdrawalsCny = round2(Number(state.withdrawalsCny || 0) + value);
  pushHistory(state.flows, { id: makeId('F', now), at: nowIso(now), type: 'withdraw', amountCny: -value, note: '转出至银行' });
  state.updatedAt = nowIso(now);
  return { message: `已向银行转出 ${formatCny(value)}` };
}

function accountAssets(state, quoteMap, fx) {
  let marketValue = 0;
  for (const pos of Object.values(state.positions)) {
    const quote = quoteMap[pos.secid];
    const priceCny = quote?.priceCny ?? Number(pos.lastPriceCny) ?? 0;
    marketValue += Number(pos.qty) * priceCny;
  }
  return round2(Number(state.cash) + marketValue);
}

function positionSnapshot(state, pos, quoteMap, now, totalMarketValue) {
  const quote = quoteMap[pos.secid];
  const fxRate = fxRateForMarket(pos.market, { usdCny: quote?.fxRate || 0, hkdCny: quote?.fxRate || 0 }) || 1;
  const nativePrice = quote?.price ?? (Number(pos.lastPriceNative) || 0);
  const priceCny = quote?.priceCny ?? (Number(pos.lastPriceCny) || 0);
  const marketValueCny = round2(pos.qty * priceCny);
  const pnlCny = round2(marketValueCny - Number(pos.costCny || 0));
  const prevCloseNative = quote?.prevClose ?? (Number(pos.prevCloseNative) || nativePrice);
  const today = marketDate(pos.market, now);
  const todayQty = (pos.lots || []).filter(lot => lot.date === today).reduce((sum, lot) => sum + (Number(lot.qty) || 0), 0);
  const heldFromBefore = Math.max(0, pos.qty - todayQty);
  const dayPnlCny = round2(heldFromBefore * (nativePrice - prevCloseNative) * fxRate + todayQty * (priceCny - Number(pos.avgCostCny || 0)));
  return {
    secid: pos.secid,
    quoteCode: pos.quoteCode,
    symbol: pos.symbol,
    name: quote?.name || pos.name,
    market: pos.market,
    currency: pos.currency,
    assetType: pos.assetType || 'stock',
    qty: pos.qty,
    availableQty: availableQty(pos, pos.market, now),
    frozenQty: Math.max(0, Number(pos.frozenQty) || 0),
    avgCostCny: round2(pos.avgCostCny),
    costCny: round2(pos.costCny),
    lastPrice: nativePrice,
    lastPriceCny: roundTo(priceCny, 4),
    marketValueCny,
    pnlCny,
    pnlPct: pos.costCny ? roundTo((pnlCny / Number(pos.costCny)) * 100, 2) : 0,
    dayPnlCny,
    weight: totalMarketValue ? roundTo((marketValueCny / totalMarketValue) * 100, 2) : 0,
    quote: quote || null,
    lots: (pos.lots || []).map(lot => ({ ...lot })),
    openedAt: pos.openedAt,
    lastTradeAt: pos.lastTradeAt,
  };
}

function orderSnapshot(order) {
  return {
    ...order,
    sideLabel: order.side === 'buy' ? (order.funding === 'margin' ? '融资买入' : '买入') : '卖出',
    fundingLabel: order.funding === 'margin' ? '融资' : '现金',
    typeLabel: order.orderType === 'limit' ? '限价' : '市价',
    statusLabel: ({
      pending: '待成交',
      filled: '已成交',
      cancelled: '已撤单',
      rejected: '已拒绝',
    })[order.status] || order.status,
  };
}

function loanSnapshot(loan, now) {
  const dueAt = new Date(loan.dueAt).getTime();
  const daysLeft = Math.ceil((dueAt - new Date(now).getTime()) / 86_400_000);
  return {
    ...loan,
    totalDue: round2(Number(loan.principal) + Number(loan.accruedInterest || 0)),
    daysLeft,
    overdue: loan.status === 'active' && daysLeft < 0,
    statusLabel: loan.status === 'paid' ? '已结清' : daysLeft < 0 ? '已逾期' : '计息中',
  };
}

export function buildSnapshot(state, quoteMap, fx, now = new Date()) {
  accrueLoans(state, now);
  const marketValueCny = round2(Object.values(state.positions).reduce((sum, pos) => {
    const quote = quoteMap[pos.secid];
    const priceCny = quote?.priceCny ?? (Number(pos.lastPriceCny) || 0);
    // Keep last-known values so the account remains legible if a quote is missing.
    if (quote) {
      const posRef = state.positions[pos.secid];
      posRef.lastPriceNative = quote.price;
      posRef.lastPriceCny = quote.priceCny;
      posRef.prevCloseNative = quote.prevClose;
      posRef.lastQuoteAt = quote.quoteTime;
    }
    return sum + Number(pos.qty) * priceCny;
  }, 0));
  const totalAssets = round2(Number(state.cash) + marketValueCny);
  const loanPrincipal = totalLoanPrincipal(state);
  const loanInterest = totalLoanInterest(state);
  const liabilities = round2(loanPrincipal + loanInterest);
  const netAssets = round2(totalAssets - liabilities);
  const contributions = netContributions(state);
  const totalPnl = round2(netAssets - contributions);
  const contributionsForPct = Math.abs(contributions) > 0.01 ? contributions : 1;
  const positions = Object.values(state.positions)
    .filter(pos => pos.qty > 0)
    .map(pos => positionSnapshot(state, pos, quoteMap, now, marketValueCny))
    .sort((a, b) => b.marketValueCny - a.marketValueCny);

  // Daily P&L: mark-to-market against the first snapshot of the local day,
  // excluding external bank transfers made after that baseline.
  const today = marketDate('A', now);
  if (!state.dayBaseline || state.dayBaseline.date !== today) {
    state.dayBaseline = { date: today, at: nowIso(now), netAssets };
  }
  const baselineAt = new Date(state.dayBaseline.at).getTime();
  const externalFlow = round2((state.flows || [])
    .filter(row => new Date(row.at).getTime() > baselineAt && ['deposit', 'withdraw'].includes(row.type))
    .reduce((sum, row) => sum + Number(row.amountCny || 0), 0));
  const dayPnl = round2(netAssets - Number(state.dayBaseline.netAssets || netAssets) - externalFlow);
  const dayBaseForPct = Math.abs(Number(state.dayBaseline.netAssets) || netAssets) || 1;

  const sessions = allMarketSessions(now);
  const openMarkets = Object.values(sessions).filter(row => row.tradeable).map(row => row.market);
  const credit = creditLimit(state);
  const creditLeft = creditAvailable(state);
  const usedCredit = totalLoanPrincipal(state);
  const creditReserved = round2(state.reservedCredit || 0);
  const leverage = netAssets > 0 ? roundTo(totalAssets / netAssets, 4) : null;
  const maintenanceRatio = liabilities > 0 ? roundTo(totalAssets / liabilities, 4) : null;
  const policy = leveragePolicy(state);
  const riskLevel = maintenanceRatio === null ? 'none' : maintenanceRatio < policy.liquidation ? 'danger' : maintenanceRatio < policy.call ? 'warn' : 'safe';

  const watchlist = state.watchlist.map(entry => {
    const quote = quoteMap[entry.secid];
    return {
      ...entry,
      quote: quote || null,
      lastPrice: quote?.price ?? null,
      changePct: quote?.changePct ?? null,
    };
  });

  const pendingOrders = state.orders.filter(order => order.status === 'pending');
  const indexRows = INDEX_DEFS.map(entry => {
    const quote = quoteMap[entry.secid];
    return { ...entry, quote: quote || null };
  });

  return {
    at: nowIso(now),
    session: sessions,
    sessionSummary: openMarkets.length ? `${openMarkets.map(market => MARKET_META[market].label).join('、')}开市` : '全部休市',
    account: {
      initialCapital: round2(state.initialCapital),
      cash: round2(state.cash),
      availableCash: round2(Number(state.cash) - Number(state.reservedCash || 0)),
      reservedCash: round2(state.reservedCash),
      marketValueCny,
      totalAssets,
      loanPrincipal,
      loanInterest,
      liabilities,
      netAssets,
      netContributions: contributions,
      totalPnl,
      totalPnlPct: roundTo((totalPnl / contributionsForPct) * 100, 4),
      dayPnl,
      dayPnlPct: roundTo((dayPnl / dayBaseForPct) * 100, 4),
      realizedPnlCny: round2(state.realizedPnlCny),
      totalFeesCny: round2(state.totalFeesCny),
      creditLimit: credit,
      creditAvailable: creditLeft,
      creditUsed: usedCredit,
      creditReserved,
      buyingPower: round2(Number(state.cash) - Number(state.reservedCash || 0) + creditLeft),
      leverage,
      maxLeverage: maxLeverage(state),
      maintenanceRatio,
      riskLevel,
      riskCallRatio: policy.call,
      riskLiquidationRatio: policy.liquidation,
      leverageTier: policy.label,
      loanRate: policy.annualRate,
      positionCount: positions.length,
      pendingCount: pendingOrders.length,
      tradeCount: state.trades.length,
    },
    positions,
    orders: state.orders.slice(0, 120).map(orderSnapshot),
    trades: state.trades.slice(0, 160),
    loans: state.loans.slice(0, 30).map(loan => loanSnapshot(loan, now)),
    flows: state.flows.slice(0, 120),
    watchlist,
    indices: indexRows,
    settings: { ...state.settings },
    fx: {
      usdCny: roundTo(fx.usdCny || 0, 4),
      hkdCny: roundTo(fx.hkdCny || 0, 4),
      source: fx.source || 'fallback',
      date: fx.date || null,
      stale: Boolean(fx.stale),
    },
    meta: {
      quoteSource: '腾讯证券公开行情',
      fxSource: fx.source === 'frankfurter' ? 'Frankfurter / ECB' : '内置汇率',
      disclaimer: '行情来自公开接口，可能延迟；本工具不构成投资建议。',
      loanRate: policy.annualRate,
      loanTermDays: LOAN_TERM_DAYS,
      leverageTiers: LEVERAGE_TIERS,
      note: '休市订单将在下一个可交易时段按最新行情撮合。',
    },
  };
}

export function httpError(status, message) {
  const error = new Error(message);
  error.status = status;
  error.expose = true;
  return error;
}

export function formatCny(value) {
  return `¥${Number(value || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatNative(value, currency = 'CNY') {
  const amount = Number(value || 0);
  const digits = currency === 'HKD' ? 3 : 2;
  return `${currency === 'USD' ? '$' : currency === 'HKD' ? 'HK$' : '¥'}${amount.toLocaleString('zh-CN', { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;
}

export function exportStateCsv(state) {
  const header = ['成交时间', '订单号', '方向', '代码', '名称', '市场', '数量', '成交价', '币种', '汇率', '成交金额(CNY)', '费用(CNY)', '已实现盈亏(CNY)', '订单类型'];
  const rows = state.trades.map(trade => [
    trade.at,
    trade.orderId,
    trade.side === 'buy' ? '买入' : '卖出',
    trade.symbol,
    trade.name,
    trade.market,
    trade.qty,
    trade.price,
    trade.currency,
    trade.fxRate,
    trade.grossCny,
    trade.feesCny,
    trade.realizedPnlCny || 0,
    trade.orderType === 'limit' ? '限价' : '市价',
  ]);
  return [header, ...rows].map(row => row.map(value => `"${String(value ?? '').replaceAll('"', '""')}"`).join(',')).join('\n');
}
