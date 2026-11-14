window.__ModuleLoader__.load({
  id: 'dsh-equity-desk',
  factory(require) {
    const React = require('react');
    const h = React.createElement;
    const { useCallback, useEffect, useMemo, useRef, useState } = React;

    const API = '/stock-desk/api';
    const PANEL_ID = 'stock-desk';
    const RANGES = [
      { label: '1月', count: 30 },
      { label: '3月', count: 66 },
      { label: '6月', count: 120 },
      { label: '1年', count: 250 },
    ];
    const CHART_MODES = [
      { id: 'minute', label: '分时' },
      { id: 'day', label: '日K' },
      { id: 'week', label: '周K' },
      { id: 'month', label: '月K' },
    ];
    const CURRENCY_SYMBOL = { CNY: '¥', HKD: 'HK$', USD: '$' };

    const DISCOVER_CATEGORIES = [
      { id: 'all', label: '全部' },
      { id: 'A', label: 'A股' },
      { id: 'HK', label: '港股' },
      { id: 'US', label: '美股' },
      { id: 'tech', label: '科技' },
      { id: 'consumer', label: '消费' },
      { id: 'energy', label: '新能源' },
      { id: 'finance', label: '金融' },
      { id: 'health', label: '医药' },
      { id: 'dividend', label: '高股息' },
    ];
    const DISCOVER_TAG_LABELS = { tech: '科技', consumer: '消费', energy: '新能源', finance: '金融', health: '医药', dividend: '高股息' };
    const DISCOVER_COMPANIES = [
      { secid: '1.600519', quoteCode: 'sh600519', symbol: '600519', name: '贵州茅台', market: 'A', currency: 'CNY', lotSize: 100, assetType: 'stock', tags: ['consumer', 'dividend'] },
      { secid: '0.300750', quoteCode: 'sz300750', symbol: '300750', name: '宁德时代', market: 'A', currency: 'CNY', lotSize: 100, assetType: 'stock', tags: ['energy'] },
      { secid: '0.002594', quoteCode: 'sz002594', symbol: '002594', name: '比亚迪', market: 'A', currency: 'CNY', lotSize: 100, assetType: 'stock', tags: ['energy', 'consumer'] },
      { secid: '1.600036', quoteCode: 'sh600036', symbol: '600036', name: '招商银行', market: 'A', currency: 'CNY', lotSize: 100, assetType: 'stock', tags: ['finance', 'dividend'] },
      { secid: '1.601318', quoteCode: 'sh601318', symbol: '601318', name: '中国平安', market: 'A', currency: 'CNY', lotSize: 100, assetType: 'stock', tags: ['finance', 'dividend'] },
      { secid: '0.000858', quoteCode: 'sz000858', symbol: '000858', name: '五粮液', market: 'A', currency: 'CNY', lotSize: 100, assetType: 'stock', tags: ['consumer', 'dividend'] },
      { secid: '1.600900', quoteCode: 'sh600900', symbol: '600900', name: '长江电力', market: 'A', currency: 'CNY', lotSize: 100, assetType: 'stock', tags: ['dividend'] },
      { secid: '1.601899', quoteCode: 'sh601899', symbol: '601899', name: '紫金矿业', market: 'A', currency: 'CNY', lotSize: 100, assetType: 'stock', tags: ['dividend'] },
      { secid: '1.601012', quoteCode: 'sh601012', symbol: '601012', name: '隆基绿能', market: 'A', currency: 'CNY', lotSize: 100, assetType: 'stock', tags: ['energy'] },
      { secid: '0.300059', quoteCode: 'sz300059', symbol: '300059', name: '东方财富', market: 'A', currency: 'CNY', lotSize: 100, assetType: 'stock', tags: ['finance', 'tech'] },
      { secid: '0.300760', quoteCode: 'sz300760', symbol: '300760', name: '迈瑞医疗', market: 'A', currency: 'CNY', lotSize: 100, assetType: 'stock', tags: ['health'] },
      { secid: '0.002475', quoteCode: 'sz002475', symbol: '002475', name: '立讯精密', market: 'A', currency: 'CNY', lotSize: 100, assetType: 'stock', tags: ['tech', 'consumer'] },
      { secid: '1.600887', quoteCode: 'sh600887', symbol: '600887', name: '伊利股份', market: 'A', currency: 'CNY', lotSize: 100, assetType: 'stock', tags: ['consumer', 'dividend'] },
      { secid: '0.002415', quoteCode: 'sz002415', symbol: '002415', name: '海康威视', market: 'A', currency: 'CNY', lotSize: 100, assetType: 'stock', tags: ['tech'] },
      { secid: '1.600941', quoteCode: 'sh600941', symbol: '600941', name: '中国移动', market: 'A', currency: 'CNY', lotSize: 100, assetType: 'stock', tags: ['tech', 'dividend'] },
      { secid: '116.00700', quoteCode: 'hk00700', symbol: '00700', name: '腾讯控股', market: 'HK', currency: 'HKD', lotSize: 100, assetType: 'stock', tags: ['tech', 'consumer'] },
      { secid: '116.09988', quoteCode: 'hk09988', symbol: '09988', name: '阿里巴巴-W', market: 'HK', currency: 'HKD', lotSize: 100, assetType: 'stock', tags: ['tech', 'consumer'] },
      { secid: '116.03690', quoteCode: 'hk03690', symbol: '03690', name: '美团-W', market: 'HK', currency: 'HKD', lotSize: 100, assetType: 'stock', tags: ['tech', 'consumer'] },
      { secid: '116.01810', quoteCode: 'hk01810', symbol: '01810', name: '小米集团-W', market: 'HK', currency: 'HKD', lotSize: 100, assetType: 'stock', tags: ['tech', 'consumer'] },
      { secid: '116.01211', quoteCode: 'hk01211', symbol: '01211', name: '比亚迪股份', market: 'HK', currency: 'HKD', lotSize: 500, assetType: 'stock', tags: ['energy'] },
      { secid: '116.09618', quoteCode: 'hk09618', symbol: '09618', name: '京东集团-SW', market: 'HK', currency: 'HKD', lotSize: 50, assetType: 'stock', tags: ['tech', 'consumer'] },
      { secid: '116.01024', quoteCode: 'hk01024', symbol: '01024', name: '快手-W', market: 'HK', currency: 'HKD', lotSize: 100, assetType: 'stock', tags: ['tech'] },
      { secid: '116.01299', quoteCode: 'hk01299', symbol: '01299', name: '友邦保险', market: 'HK', currency: 'HKD', lotSize: 200, assetType: 'stock', tags: ['finance'] },
      { secid: '116.00005', quoteCode: 'hk00005', symbol: '00005', name: '汇丰控股', market: 'HK', currency: 'HKD', lotSize: 400, assetType: 'stock', tags: ['finance', 'dividend'] },
      { secid: '116.00883', quoteCode: 'hk00883', symbol: '00883', name: '中国海洋石油', market: 'HK', currency: 'HKD', lotSize: 1000, assetType: 'stock', tags: ['dividend'] },
      { secid: '116.00388', quoteCode: 'hk00388', symbol: '00388', name: '香港交易所', market: 'HK', currency: 'HKD', lotSize: 100, assetType: 'stock', tags: ['finance'] },
      { secid: '116.02269', quoteCode: 'hk02269', symbol: '02269', name: '药明生物', market: 'HK', currency: 'HKD', lotSize: 500, assetType: 'stock', tags: ['health'] },
      { secid: '105.AAPL', quoteCode: 'usAAPL', symbol: 'AAPL', name: '苹果', market: 'US', currency: 'USD', lotSize: 1, assetType: 'stock', tags: ['tech', 'consumer'] },
      { secid: '105.NVDA', quoteCode: 'usNVDA', symbol: 'NVDA', name: '英伟达', market: 'US', currency: 'USD', lotSize: 1, assetType: 'stock', tags: ['tech'] },
      { secid: '105.MSFT', quoteCode: 'usMSFT', symbol: 'MSFT', name: '微软', market: 'US', currency: 'USD', lotSize: 1, assetType: 'stock', tags: ['tech'] },
      { secid: '105.TSLA', quoteCode: 'usTSLA', symbol: 'TSLA', name: '特斯拉', market: 'US', currency: 'USD', lotSize: 1, assetType: 'stock', tags: ['energy', 'tech'] },
      { secid: '105.AMZN', quoteCode: 'usAMZN', symbol: 'AMZN', name: '亚马逊', market: 'US', currency: 'USD', lotSize: 1, assetType: 'stock', tags: ['tech', 'consumer'] },
      { secid: '105.GOOGL', quoteCode: 'usGOOGL', symbol: 'GOOGL', name: '谷歌-A', market: 'US', currency: 'USD', lotSize: 1, assetType: 'stock', tags: ['tech'] },
      { secid: '105.META', quoteCode: 'usMETA', symbol: 'META', name: 'Meta', market: 'US', currency: 'USD', lotSize: 1, assetType: 'stock', tags: ['tech'] },
      { secid: '105.AVGO', quoteCode: 'usAVGO', symbol: 'AVGO', name: '博通', market: 'US', currency: 'USD', lotSize: 1, assetType: 'stock', tags: ['tech'] },
      { secid: '105.TSM', quoteCode: 'usTSM', symbol: 'TSM', name: '台积电', market: 'US', currency: 'USD', lotSize: 1, assetType: 'stock', tags: ['tech'] },
      { secid: '105.NFLX', quoteCode: 'usNFLX', symbol: 'NFLX', name: '奈飞', market: 'US', currency: 'USD', lotSize: 1, assetType: 'stock', tags: ['tech', 'consumer'] },
      { secid: '105.AMD', quoteCode: 'usAMD', symbol: 'AMD', name: '超微半导体', market: 'US', currency: 'USD', lotSize: 1, assetType: 'stock', tags: ['tech'] },
      { secid: '105.JPM', quoteCode: 'usJPM', symbol: 'JPM', name: '摩根大通', market: 'US', currency: 'USD', lotSize: 1, assetType: 'stock', tags: ['finance', 'dividend'] },
      { secid: '105.KO', quoteCode: 'usKO', symbol: 'KO', name: '可口可乐', market: 'US', currency: 'USD', lotSize: 1, assetType: 'stock', tags: ['consumer', 'dividend'] },
      { secid: '105.LLY', quoteCode: 'usLLY', symbol: 'LLY', name: '礼来', market: 'US', currency: 'USD', lotSize: 1, assetType: 'stock', tags: ['health'] },
      { secid: '105.UNH', quoteCode: 'usUNH', symbol: 'UNH', name: '联合健康', market: 'US', currency: 'USD', lotSize: 1, assetType: 'stock', tags: ['health', 'dividend'] },
      { secid: '105.XOM', quoteCode: 'usXOM', symbol: 'XOM', name: '埃克森美孚', market: 'US', currency: 'USD', lotSize: 1, assetType: 'stock', tags: ['dividend'] },
      { secid: '105.WMT', quoteCode: 'usWMT', symbol: 'WMT', name: '沃尔玛', market: 'US', currency: 'USD', lotSize: 1, assetType: 'stock', tags: ['consumer', 'dividend'] },
    ];

    const CSS = `
      .sd-root {
        --sd-bg: #f3f1ea;
        --sd-bg-deep: #e9e5da;
        --sd-card: #fffdf8;
        --sd-card-2: #faf8f1;
        --sd-text: #1d211e;
        --sd-muted: #737a73;
        --sd-faint: #9aa198;
        --sd-line: #e4dfd2;
        --sd-line-strong: #d4cebe;
        --sd-accent: #145c4b;
        --sd-accent-2: #0f493c;
        --sd-accent-soft: #e8f0eb;
        --sd-gold: #a97a36;
        --sd-gold-soft: #f4ead8;
        --sd-up: #c93f37;
        --sd-up-soft: #fbecea;
        --sd-down: #0d8662;
        --sd-down-soft: #e8f5ef;
        --sd-warn: #ad6e20;
        --sd-warn-soft: #fbf1df;
        --sd-danger: #b62f2a;
        --sd-shadow: 0 18px 50px rgba(36, 42, 36, .08), 0 2px 7px rgba(36, 42, 36, .04);
        --sd-radius: 16px;
        --sd-font: "SF Pro Text", -apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
        --sd-display: "Iowan Old Style", "Songti SC", "Noto Serif CJK SC", Georgia, serif;
        --sd-mono: "SF Mono", "JetBrains Mono", "Roboto Mono", Menlo, Consolas, monospace;
        color-scheme: light;
        height: 100%;
        container-type: inline-size;
        container-name: stockdesk;
        overflow-y: auto;
        overflow-x: hidden;
        color: var(--sd-text);
        font-family: var(--sd-font);
        background:
          radial-gradient(1000px 500px at 88% -15%, rgba(169, 122, 54, .10), transparent 65%),
          radial-gradient(800px 520px at 10% 0%, rgba(20, 92, 75, .08), transparent 65%),
          var(--sd-bg);
        scrollbar-width: thin;
        scrollbar-color: var(--sd-line-strong) transparent;
      }
      .sd-root * { box-sizing: border-box; }
      .sd-root button, .sd-root input, .sd-root select, .sd-root textarea { font: inherit; color: inherit; }
      .sd-root button { cursor: pointer; }
      .sd-root button:disabled { cursor: not-allowed; }
      .sd-root ::selection { background: rgba(169, 122, 54, .22); }
      .sd-root, .sd-root * { -webkit-tap-highlight-color: transparent; }
      body[data-ds-dark-theme] .sd-root {
        --sd-bg: #0d1210;
        --sd-bg-deep: #101813;
        --sd-card: #141b17;
        --sd-card-2: #17201b;
        --sd-text: #f1eee4;
        --sd-muted: #98a39b;
        --sd-faint: #6d786f;
        --sd-line: #29332d;
        --sd-line-strong: #39453e;
        --sd-accent: #7fd4b7;
        --sd-accent-2: #a5e6d0;
        --sd-accent-soft: #1a2e26;
        --sd-gold: #d8b47d;
        --sd-gold-soft: #2d261b;
        --sd-up: #ff6d63;
        --sd-up-soft: #341b1a;
        --sd-down: #3dd2a0;
        --sd-down-soft: #152b23;
        --sd-warn: #eab66d;
        --sd-warn-soft: #2f2415;
        --sd-danger: #ff7c74;
        --sd-shadow: 0 22px 60px rgba(0, 0, 0, .28), 0 1px 0 rgba(255, 255, 255, .03);
        color-scheme: dark;
        background:
          radial-gradient(900px 520px at 90% -10%, rgba(216, 180, 125, .07), transparent 60%),
          radial-gradient(800px 560px at 6% 0%, rgba(127, 212, 183, .06), transparent 65%),
          var(--sd-bg);
      }
      .sd-shell {
        width: min(100%, 1760px);
        margin: 0 auto;
        padding: max(18px, calc(var(--dsh-frame-top-clearance, 0px) + 10px)) 24px 36px;
        min-height: 100%;
      }
      .sd-hero {
        position: relative;
        overflow: hidden;
        border-radius: 22px;
        padding: 24px 26px 22px;
        color: #f6f1e5;
        background:
          linear-gradient(118deg, rgba(255,255,255,.04), transparent 38%),
          linear-gradient(135deg, #10251e 0%, #18352a 52%, #10221c 100%);
        box-shadow: 0 24px 60px rgba(12, 29, 22, .20);
        border: 1px solid rgba(255,255,255,.08);
      }
      .sd-hero::before {
        content: "";
        position: absolute;
        inset: 0;
        background-image: linear-gradient(rgba(255,255,255,.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.035) 1px, transparent 1px);
        background-size: 44px 44px;
        mask-image: linear-gradient(to bottom, rgba(0,0,0,.7), transparent 85%);
        pointer-events: none;
      }
      .sd-hero::after {
        content: "";
        position: absolute;
        width: 520px;
        height: 520px;
        border-radius: 50%;
        right: -180px;
        top: -280px;
        border: 1px solid rgba(216, 180, 125, .24);
        box-shadow: 0 0 0 38px rgba(216, 180, 125, .04), 0 0 0 90px rgba(216, 180, 125, .025);
        pointer-events: none;
      }
      .sd-hero-top { display: flex; align-items: flex-start; gap: 24px; position: relative; z-index: 1; }
      .sd-brand { display: flex; gap: 14px; align-items: center; min-width: 0; }
      .sd-logo {
        width: 46px; height: 46px; flex: 0 0 46px;
        border-radius: 13px;
        display: grid; place-items: center;
        color: #15372b;
        background: linear-gradient(145deg, #f0d8a8, #c79a55);
        box-shadow: inset 0 1px 0 rgba(255,255,255,.65), 0 8px 24px rgba(0,0,0,.2);
      }
      .sd-brand-copy { min-width: 0; }
      .sd-brand-title { font-family: var(--sd-display); font-size: 23px; letter-spacing: .02em; line-height: 1.15; display: flex; gap: 10px; align-items: baseline; }
      .sd-brand-title b { font-weight: 600; }
      .sd-brand-title em { font-style: normal; font-size: 10px; letter-spacing: .22em; color: #d9bd8a; font-family: var(--sd-font); font-weight: 600; }
      .sd-brand-sub { margin-top: 6px; color: rgba(246, 241, 229, .58); font-size: 12px; letter-spacing: .03em; }
      .sd-brand-sub .dot { display: inline-block; margin: 0 7px; opacity: .45; }
      .sd-hero-spacer { flex: 1; }
      .sd-hero-right { display: flex; flex-direction: column; align-items: flex-end; gap: 13px; }
      .sd-clocks { display: flex; gap: 8px; flex-wrap: wrap; justify-content: flex-end; }
      .sd-clock {
        display: inline-flex; align-items: center; gap: 7px;
        padding: 6px 10px; border-radius: 999px;
        border: 1px solid rgba(255,255,255,.13);
        background: rgba(255,255,255,.045);
        color: rgba(246, 241, 229, .72);
        font-size: 11px; white-space: nowrap;
      }
      .sd-clock b { color: #f6f1e5; font-weight: 500; letter-spacing: .04em; }
      .sd-dot { width: 6px; height: 6px; border-radius: 50%; background: #98a29b; box-shadow: 0 0 0 3px rgba(152,162,155,.12); }
      .sd-dot.is-open { background: #62d6a3; box-shadow: 0 0 0 3px rgba(98,214,163,.14); animation: sdPulse 2.2s infinite; }
      @keyframes sdPulse { 0%,100% { box-shadow: 0 0 0 3px rgba(98,214,163,.10); } 50% { box-shadow: 0 0 0 6px rgba(98,214,163,.02); } }
      .sd-hero-actions { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; justify-content: flex-end; }
      .sd-ghost {
        border: 1px solid rgba(255,255,255,.18);
        background: rgba(255,255,255,.055);
        color: rgba(250,247,239,.9);
        height: 34px; padding: 0 12px;
        border-radius: 9px; display: inline-flex; align-items: center; gap: 7px;
        font-size: 12px; transition: background .18s ease, border-color .18s ease, transform .18s ease;
      }
      .sd-ghost:hover { background: rgba(255,255,255,.11); border-color: rgba(255,255,255,.28); }
      .sd-ghost:active { transform: translateY(1px); }
      .sd-ghost.is-gold { color: #f0d3a0; border-color: rgba(216,180,125,.28); background: rgba(216,180,125,.08); }
      .sd-icon-btn {
        width: 34px; height: 34px; display: inline-grid; place-items: center;
        border-radius: 9px; border: 1px solid rgba(255,255,255,.16);
        background: rgba(255,255,255,.055); color: rgba(250,247,239,.9);
        transition: background .18s ease;
      }
      .sd-icon-btn:hover { background: rgba(255,255,255,.12); }
      .sd-hero-note {
        display: inline-flex; align-items: center; gap: 7px;
        color: rgba(246,241,229,.58); font-size: 10px; letter-spacing: .11em; text-transform: uppercase;
        border: 1px solid rgba(255,255,255,.11); border-radius: 999px; padding: 6px 10px;
        background: rgba(255,255,255,.03);
      }
      .sd-hero-foot {
        display: flex; align-items: center; gap: 12px; justify-content: space-between;
        margin-top: 16px; padding-top: 13px; border-top: 1px solid rgba(255,255,255,.09);
        position: relative; z-index: 1; flex-wrap: wrap;
      }
      .sd-hero-meta {
        display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap;
        color: rgba(246,241,229,.38); font-size: 9.5px; line-height: 1.5;
        margin-top: 9px; position: relative; z-index: 1;
      }
      .sd-hero-stats {
        margin-top: 26px; padding-top: 20px;
        border-top: 1px solid rgba(255,255,255,.12);
        display: grid; grid-template-columns: 1.25fr 1fr 1fr 1fr 1fr 1.1fr;
        gap: 0; position: relative; z-index: 1;
      }
      .sd-hero-stat { padding: 0 20px; border-left: 1px solid rgba(255,255,255,.1); min-width: 0; }
      .sd-hero-stat:first-child { padding-left: 0; border-left: 0; }
      .sd-hero-stat:last-child { padding-right: 0; }
      .sd-stat-label { color: rgba(246, 241, 229, .56); font-size: 11px; letter-spacing: .05em; display: flex; align-items: center; gap: 6px; white-space: nowrap; }
      .sd-stat-value { margin-top: 7px; font-family: var(--sd-mono); font-size: 21px; line-height: 1.18; letter-spacing: -.03em; white-space: nowrap; font-weight: 500; }
      .sd-hero-stat:first-child .sd-stat-value { font-size: 27px; color: #f5e6c9; }
      .sd-stat-sub { margin-top: 4px; font-size: 11px; color: rgba(246, 241, 229, .45); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .sd-hero-stat.is-up .sd-stat-value, .sd-root .is-up { color: var(--sd-up); }
      .sd-hero-stat.is-down .sd-stat-value, .sd-root .is-down { color: var(--sd-down); }
      .sd-hero-stat.is-up .sd-stat-value { color: #ff938b; }
      .sd-hero-stat.is-down .sd-stat-value { color: #6ee0b6; }
      .sd-hero-stat.is-up .sd-stat-sub, .sd-hero-stat.is-down .sd-stat-sub { color: rgba(246,241,229,.55); }
      .sd-shell-body { margin-top: 14px; display: grid; gap: 14px; }
      .sd-banner {
        display: flex; align-items: center; gap: 10px;
        padding: 10px 13px; border-radius: 11px;
        border: 1px solid var(--sd-line); background: var(--sd-card);
        font-size: 12px; color: var(--sd-muted);
        box-shadow: 0 3px 12px rgba(36,42,36,.03);
      }
      .sd-banner .sd-banner-main { flex: 1; min-width: 0; color: var(--sd-text); }
      .sd-banner .sd-banner-main b { font-weight: 600; }
      .sd-banner.is-warn { background: var(--sd-warn-soft); border-color: color-mix(in srgb, var(--sd-warn) 26%, var(--sd-line)); color: var(--sd-warn); }
      .sd-banner.is-danger { background: color-mix(in srgb, var(--sd-danger) 9%, var(--sd-card)); border-color: color-mix(in srgb, var(--sd-danger) 25%, var(--sd-line)); color: var(--sd-danger); }
      .sd-banner.is-info { background: var(--sd-accent-soft); border-color: color-mix(in srgb, var(--sd-accent) 18%, var(--sd-line)); }
      .sd-banner .sd-mini-btn {
        flex: none; height: 28px; padding: 0 10px; border-radius: 7px;
        border: 1px solid currentColor; background: transparent; color: inherit; font-size: 11px;
      }
      .sd-main-grid { display: grid; grid-template-columns: 286px minmax(0, 1fr) 344px; gap: 14px; align-items: start; min-width: 0; }
      .sd-center-col, .sd-right-col { min-width: 0; display: grid; gap: 14px; }
      .sd-card {
        background: var(--sd-card);
        border: 1px solid var(--sd-line);
        border-radius: var(--sd-radius);
        box-shadow: 0 5px 24px rgba(36,42,36,.035);
        min-width: 0;
      }
      .sd-card-head { display: flex; align-items: center; gap: 10px; padding: 15px 16px 11px; }
      .sd-card-title { font-size: 13px; font-weight: 600; letter-spacing: .01em; display: flex; align-items: center; gap: 7px; }
      .sd-card-sub { color: var(--sd-faint); font-size: 10.5px; margin-left: auto; white-space: nowrap; }
      .sd-card-body { padding: 0 16px 16px; }
      .sd-section-rule { height: 1px; background: var(--sd-line); margin: 0 16px; }
      .sd-watch-card { position: sticky; top: 12px; overflow: hidden; }
      .sd-search-wrap { padding: 0 12px 12px; position: relative; }
      .sd-search {
        height: 34px; border-radius: 9px;
        border: 1px solid var(--sd-line);
        background: var(--sd-card-2);
        display: flex; align-items: center; gap: 8px; padding: 0 10px;
        transition: border-color .16s ease, background .16s ease;
      }
      .sd-search:focus-within { border-color: var(--sd-accent); background: var(--sd-card); }
      .sd-search svg { color: var(--sd-faint); flex: none; }
      .sd-search input { border: 0; outline: 0; background: transparent; width: 100%; font-size: 12px; min-width: 0; }
      .sd-search input::placeholder { color: var(--sd-faint); }
      .sd-search-clear { border: 0; background: transparent; color: var(--sd-faint); padding: 2px; display: grid; place-items: center; }
      .sd-search-results {
        position: absolute; left: 12px; right: 12px; top: 47px; z-index: 30;
        background: var(--sd-card); border: 1px solid var(--sd-line-strong);
        border-radius: 11px; box-shadow: var(--sd-shadow); overflow: hidden;
        max-height: 310px; overflow-y: auto;
      }
      .sd-search-empty { padding: 15px; color: var(--sd-muted); font-size: 11.5px; text-align: center; }
      .sd-result {
        display: flex; align-items: center; gap: 9px; width: 100%;
        padding: 9px 10px; border: 0; border-bottom: 1px solid var(--sd-line);
        background: transparent; text-align: left;
      }
      .sd-result:last-child { border-bottom: 0; }
      .sd-result:hover { background: var(--sd-card-2); }
      .sd-result-main { flex: 1; min-width: 0; }
      .sd-result-name { font-size: 12px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .sd-result-code { color: var(--sd-faint); font-family: var(--sd-mono); font-size: 10px; margin-top: 2px; }
      .sd-add-chip { width: 22px; height: 22px; border-radius: 6px; border: 1px solid var(--sd-line-strong); background: var(--sd-card); display: grid; place-items: center; color: var(--sd-muted); flex: none; }
      .sd-add-chip:hover { color: var(--sd-accent); border-color: var(--sd-accent); }
      .sd-index-list { padding: 0 12px 10px; display: grid; gap: 2px; }
      .sd-index-row {
        display: grid; grid-template-columns: minmax(0,1fr) auto auto;
        gap: 8px; align-items: center; padding: 8px 7px;
        border: 0; background: transparent; border-radius: 8px; text-align: left;
      }
      .sd-index-row:hover { background: var(--sd-card-2); }
      .sd-index-name { font-size: 11.5px; color: var(--sd-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .sd-index-price { font-family: var(--sd-mono); font-size: 11.5px; }
      .sd-index-pct { font-family: var(--sd-mono); font-size: 10.5px; width: 49px; text-align: right; }
      .sd-watch-list { padding: 0 8px 8px; }
      .sd-watch-strip { position: relative; min-width: 0; }
      .sd-watch-arrow { display: none; }
      .sd-watch-head-actions { margin-left: auto; display: flex; align-items: center; gap: 6px; }
      .sd-watch-head-actions .sd-card-sub { margin-left: 0; }
      .sd-watch-discover { height: 22px; padding: 0 7px; border-radius: 6px; border: 1px solid var(--sd-line-strong); background: var(--sd-card-2); color: var(--sd-muted); display: inline-flex; align-items: center; gap: 4px; font-size: 9.5px; white-space: nowrap; }
      .sd-watch-discover:hover { color: var(--sd-accent); border-color: var(--sd-accent); }
      .sd-watch-row {
        position: relative; display: grid; grid-template-columns: minmax(0, 1fr) auto;
        gap: 9px; align-items: center; padding: 9px 8px; border-radius: 9px;
        border: 1px solid transparent; cursor: pointer; transition: background .14s ease, border-color .14s ease;
      }
      .sd-watch-row:hover { background: var(--sd-card-2); }
      .sd-watch-row.is-active { background: var(--sd-accent-soft); border-color: color-mix(in srgb, var(--sd-accent) 14%, var(--sd-line)); }
      .sd-watch-row-main { min-width: 0; }
      .sd-watch-name { font-size: 12.5px; font-weight: 500; display: flex; align-items: center; gap: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .sd-watch-code { margin-top: 3px; color: var(--sd-faint); font-family: var(--sd-mono); font-size: 9.5px; display: flex; align-items: center; gap: 5px; }
      .sd-watch-side { text-align: right; }
      .sd-watch-price { font-family: var(--sd-mono); font-size: 12px; }
      .sd-watch-pct { font-family: var(--sd-mono); font-size: 10.5px; margin-top: 3px; }
      .sd-watch-remove {
        position: absolute; right: 5px; top: 5px; width: 16px; height: 16px; border: 0; border-radius: 50%;
        display: none; align-items: center; justify-content: center; background: var(--sd-line); color: var(--sd-muted); padding: 0;
      }
      .sd-watch-row:hover .sd-watch-remove { display: flex; }
      .sd-tag { display: inline-flex; align-items: center; height: 16px; padding: 0 5px; border-radius: 4px; font-size: 8.5px; font-weight: 600; letter-spacing: .03em; color: var(--sd-muted); background: var(--sd-bg-deep); white-space: nowrap; }
      .sd-tag.is-a { color: #9b5e1e; background: #f6ead6; }
      .sd-tag.is-hk { color: #346c8e; background: #e6f0f5; }
      .sd-tag.is-us { color: #5c4c91; background: #eeebf7; }
      body[data-ds-dark-theme] .sd-tag.is-a { color: #e0b77e; background: #2d261b; }
      body[data-ds-dark-theme] .sd-tag.is-hk { color: #8cbcd4; background: #1a2a31; }
      body[data-ds-dark-theme] .sd-tag.is-us { color: #b9ade6; background: #252038; }
      .sd-add-row { padding: 0 12px 13px; }
      .sd-add-btn {
        width: 100%; height: 31px; border-radius: 8px;
        border: 1px dashed var(--sd-line-strong); background: transparent;
        color: var(--sd-muted); font-size: 11px; display: inline-flex; align-items: center; justify-content: center; gap: 6px;
      }
      .sd-add-btn:hover { color: var(--sd-accent); border-color: var(--sd-accent); }
      .sd-quote-card { overflow: hidden; }
      .sd-quote-head { padding: 19px 20px 14px; display: flex; gap: 18px; align-items: flex-start; flex-wrap: wrap; }
      .sd-quote-title-wrap { min-width: 0; flex: 1 1 210px; }
      .sd-quote-title { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
      .sd-quote-title h2 { margin: 0; font-family: var(--sd-display); font-size: 22px; font-weight: 600; letter-spacing: .01em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }
      .sd-quote-sub { margin-top: 5px; display: flex; align-items: center; gap: 8px; color: var(--sd-muted); font-size: 11px; flex-wrap: wrap; }
      .sd-quote-price-wrap { display: flex; align-items: baseline; gap: 12px; flex-wrap: wrap; justify-content: flex-end; flex: 0 1 auto; min-width: 0; }
      .sd-big-price { font-family: var(--sd-mono); font-size: 34px; line-height: 1; letter-spacing: -.05em; font-weight: 500; }
      .sd-big-change { font-family: var(--sd-mono); font-size: 12px; display: flex; flex-direction: column; gap: 3px; align-items: flex-end; }
      .sd-quote-actions { display: flex; gap: 6px; margin-left: 4px; align-items: flex-start; }
      .sd-square-btn { width: 30px; height: 30px; display:inline-grid; place-items:center; border-radius: 8px; border:1px solid var(--sd-line); background:var(--sd-card); color:var(--sd-muted); }
      .sd-square-btn:hover { color: var(--sd-accent); border-color: var(--sd-accent); }
      .sd-quote-stats {
        display: grid; grid-template-columns: repeat(6, minmax(0,1fr));
        border-top: 1px solid var(--sd-line); background: var(--sd-card-2);
      }
      .sd-quote-stat { padding: 10px 13px 11px; border-left: 1px solid var(--sd-line); min-width: 0; }
      .sd-quote-stat:first-child { border-left: 0; }
      .sd-quote-stat span { display: block; color: var(--sd-faint); font-size: 9.5px; margin-bottom: 4px; letter-spacing: .02em; }
      .sd-quote-stat b { display: block; font-family: var(--sd-mono); font-size: 11.5px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .sd-chart-card { overflow: hidden; }
      .sd-chart-head { display: flex; align-items: center; gap: 8px; padding: 14px 16px 7px; flex-wrap: wrap; }
      .sd-chart-title { font-size: 12px; font-weight: 600; display: flex; align-items: center; gap: 7px; }
      .sd-chart-head .sd-spacer { flex: 1; }
      .sd-range-tabs { display: flex; gap: 2px; padding: 2px; border-radius: 7px; background: var(--sd-card-2); border: 1px solid var(--sd-line); }
      .sd-range {
        border: 0; background: transparent; height: 23px; padding: 0 8px; border-radius: 5px;
        color: var(--sd-muted); font-size: 10px; font-family: var(--sd-mono);
      }
      .sd-range:hover { color: var(--sd-text); }
      .sd-range.is-active { background: var(--sd-card); color: var(--sd-text); box-shadow: 0 1px 3px rgba(0,0,0,.08); font-weight: 600; }
      .sd-chart-source { font-size: 9.5px; color: var(--sd-faint); margin-left: 5px; }
      .sd-chart-wrap { position: relative; padding: 0 6px 2px; min-height: 255px; }
      .sd-chart-svg { width: 100%; display: block; overflow: visible; touch-action: pan-y; }
      .sd-chart-empty { min-height: 255px; display: grid; place-items: center; color: var(--sd-faint); font-size: 11.5px; text-align: center; padding: 30px; }
      .sd-chart-empty b { display: block; color: var(--sd-muted); font-size: 12.5px; margin-bottom: 5px; }
      .sd-chart-tip {
        position: absolute; z-index: 4; pointer-events: none;
        min-width: 142px; padding: 9px 10px; border-radius: 8px;
        background: rgba(20, 30, 25, .94); color: #f4efe5; font-size: 10px;
        box-shadow: 0 10px 26px rgba(0,0,0,.26); border: 1px solid rgba(255,255,255,.12);
        transform: translate(-50%, 0);
      }
      .sd-chart-tip .d { color: rgba(255,255,255,.55); margin-bottom: 5px; font-family: var(--sd-mono); }
      .sd-chart-tip .r { display: flex; justify-content: space-between; gap: 15px; margin-top: 2px; }
      .sd-chart-tip .r span { color: rgba(255,255,255,.5); }
      .sd-chart-tip .r b { font-weight: 500; font-family: var(--sd-mono); }
      .sd-chart-legend { display: flex; gap: 12px; padding: 0 18px 10px; color: var(--sd-faint); font-size: 9.5px; align-items: center; }
      .sd-chart-legend i { display:inline-block; width: 12px; height: 1px; background: var(--sd-gold); vertical-align: middle; margin-right: 4px; }
      .sd-chart-legend i.ma20 { background: #6d89a8; }
      .sd-depth-card .sd-card-head { padding-bottom: 7px; }
      .sd-depth { padding: 0 16px 13px; display: flex; flex-direction: column; gap: 1px; }
      .sd-depth-row { display: grid; grid-template-columns: 38px minmax(0, 1fr) minmax(0, auto); align-items: center; gap: 8px; height: 21px; font-family: var(--sd-mono); font-size: 10.5px; position: relative; min-width: 0; }
      .sd-depth-row .lab { color: var(--sd-faint); font-family: var(--sd-font); font-size: 9.5px; }
      .sd-depth-row .bar { position: absolute; right: 68px; left: 46px; height: 14px; opacity: .1; border-radius: 2px; max-width: calc(100% - 114px); }
      .sd-depth-row.is-ask .bar { background: var(--sd-up); }
      .sd-depth-row.is-bid .bar { background: var(--sd-down); }
      .sd-depth-row .px { position: relative; z-index: 1; }
      .sd-depth-row .qty { position: relative; z-index: 1; color: var(--sd-muted); font-size: 9.5px; max-width: 64px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .sd-depth-mid { display: flex; justify-content: space-between; align-items: center; padding: 7px 0; margin: 3px 0; border-top: 1px dashed var(--sd-line); border-bottom: 1px dashed var(--sd-line); font-size: 9.5px; color: var(--sd-faint); }
      .sd-depth-mid b { font-family: var(--sd-mono); font-size: 12px; color: var(--sd-text); font-weight: 500; }
      .sd-depth-empty { color: var(--sd-faint); font-size: 10.5px; line-height: 1.65; padding: 6px 0 9px; }
      .sd-trade-card { overflow: hidden; }
      .sd-trade-tabs { display: grid; grid-template-columns: 1fr 1fr; margin: 0 14px; border-bottom: 1px solid var(--sd-line); }
      .sd-trade-tab { position: relative; height: 38px; border: 0; background: transparent; color: var(--sd-muted); font-size: 12.5px; font-weight: 500; }
      .sd-trade-tab.is-active { color: var(--sd-text); }
      .sd-trade-tab.is-buy.is-active { color: var(--sd-up); }
      .sd-trade-tab.is-sell.is-active { color: var(--sd-down); }
      .sd-trade-tab.is-active::after { content: ""; position: absolute; left: 20%; right: 20%; bottom: -1px; height: 2px; background: currentColor; border-radius: 2px; }
      .sd-trade-body { padding: 12px 14px 14px; }
      .sd-field { margin-bottom: 10px; }
      .sd-field-label { display: flex; align-items: center; gap: 6px; font-size: 10px; color: var(--sd-muted); margin-bottom: 5px; }
      .sd-field-label .right { margin-left: auto; color: var(--sd-faint); font-family: var(--sd-mono); font-size: 9.5px; }
      .sd-input-shell {
        height: 36px; border: 1px solid var(--sd-line); border-radius: 8px; background: var(--sd-card-2);
        display: flex; align-items: center; gap: 7px; padding: 0 9px;
        transition: border-color .15s ease, background .15s ease;
      }
      .sd-input-shell:focus-within { border-color: var(--sd-accent); background: var(--sd-card); }
      .sd-input-shell.is-error { border-color: var(--sd-danger); }
      .sd-input-shell span.prefix { color: var(--sd-faint); font-size: 10px; font-family: var(--sd-mono); }
      .sd-input-shell input { width: 100%; min-width: 0; border: 0; outline: 0; background: transparent; font-family: var(--sd-mono); font-size: 14px; text-align: right; letter-spacing: -.02em; }
      .sd-input-shell input::-webkit-outer-spin-button, .sd-input-shell input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
      .sd-input-shell .suffix { color: var(--sd-faint); font-size: 9.5px; white-space: nowrap; }
      .sd-step-btn { width: 19px; height: 19px; border-radius: 5px; border: 1px solid var(--sd-line); background: var(--sd-card); display: grid; place-items: center; color: var(--sd-muted); padding: 0; flex: none; }
      .sd-step-btn:hover { color: var(--sd-text); border-color: var(--sd-line-strong); }
      .sd-seg { display: grid; grid-template-columns: 1fr 1fr; gap: 3px; padding: 3px; border-radius: 8px; border: 1px solid var(--sd-line); background: var(--sd-card-2); }
      .sd-seg button { height: 27px; border: 0; border-radius: 6px; background: transparent; color: var(--sd-muted); font-size: 11px; }
      .sd-seg button.is-active { background: var(--sd-card); color: var(--sd-text); font-weight: 600; box-shadow: 0 1px 3px rgba(0,0,0,.07); }
      .sd-quick { display: flex; gap: 5px; margin-top: 6px; }
      .sd-quick button { flex: 1; height: 23px; border-radius: 5px; border: 1px solid var(--sd-line); background: transparent; color: var(--sd-muted); font-size: 9.5px; font-family: var(--sd-mono); }
      .sd-quick button:hover { color: var(--sd-accent); border-color: var(--sd-accent); }
      .sd-estimate { border-top: 1px dashed var(--sd-line); margin-top: 11px; padding-top: 10px; display: grid; gap: 5px; font-size: 10px; color: var(--sd-muted); }
      .sd-estimate .r { display: flex; justify-content: space-between; gap: 10px; }
      .sd-estimate .r b { color: var(--sd-text); font-weight: 500; font-family: var(--sd-mono); font-size: 10.5px; }
      .sd-estimate .r.is-total { margin-top: 2px; padding-top: 7px; border-top: 1px solid var(--sd-line); font-size: 10.5px; }
      .sd-estimate .r.is-total b { font-size: 13px; }
      .sd-margin-row { display: flex; align-items: center; gap: 10px; margin: 3px 0 9px; padding: 9px 10px; border: 1px solid color-mix(in srgb, var(--sd-gold) 26%, var(--sd-line)); border-radius: 8px; background: var(--sd-gold-soft); }
      .sd-margin-row .copy { flex: 1; min-width: 0; }
      .sd-margin-row b { display: block; font-size: 10.5px; font-weight: 600; color: var(--sd-text); }
      .sd-margin-row span { display: block; margin-top: 3px; color: var(--sd-muted); font-size: 9px; line-height: 1.5; }
      .sd-leverage-row { display: flex; gap: 5px; }
      .sd-leverage-row button { flex: 1; height: 28px; border: 1px solid var(--sd-line); border-radius: 6px; background: var(--sd-card-2); color: var(--sd-muted); font-size: 10px; font-family: var(--sd-mono); }
      .sd-leverage-row button.is-active { border-color: var(--sd-gold); background: var(--sd-gold-soft); color: var(--sd-text); font-weight: 600; }
      .sd-trade-hint { display: inline-flex; align-items: center; gap: 5px; height: 18px; padding: 0 6px; border-radius: 4px; font-size: 8.5px; background: var(--sd-accent-soft); color: var(--sd-accent); font-weight: 500; }
      .sd-trade-hint.is-wait { background: var(--sd-warn-soft); color: var(--sd-warn); }
      .sd-trade-submit { width: 100%; height: 39px; margin-top: 10px; border-radius: 8px; border: 0; font-size: 12px; font-weight: 600; letter-spacing: .02em; color: #fff; transition: filter .15s ease, transform .1s ease; }
      .sd-trade-submit.is-buy { background: linear-gradient(180deg, #d94f45, #bf352d); box-shadow: 0 7px 16px rgba(191,53,45,.2); }
      .sd-trade-submit.is-sell { background: linear-gradient(180deg, #14956e, #0b7657); box-shadow: 0 7px 16px rgba(11,118,87,.18); }
      .sd-trade-submit:hover:not(:disabled) { filter: brightness(1.04); }
      .sd-trade-submit:active:not(:disabled) { transform: translateY(1px); }
      .sd-trade-submit:disabled { opacity: .45; box-shadow: none; }
      .sd-trade-note { margin-top: 9px; color: var(--sd-faint); font-size: 9.5px; line-height: 1.6; }
      .sd-trade-note b { color: var(--sd-muted); font-weight: 500; }
      .sd-blotter { margin-top: 2px; overflow: hidden; }
      .sd-blotter-head { display: flex; align-items: center; gap: 5px; padding: 9px 13px 0; border-bottom: 1px solid var(--sd-line); overflow-x: auto; scrollbar-width: none; }
      .sd-blotter-head::-webkit-scrollbar { display: none; }
      .sd-blotter-tab { position: relative; height: 39px; padding: 0 13px; border: 0; background: transparent; color: var(--sd-muted); font-size: 11.5px; white-space: nowrap; display: inline-flex; align-items: center; gap: 6px; }
      .sd-blotter-tab:hover { color: var(--sd-text); }
      .sd-blotter-tab.is-active { color: var(--sd-text); font-weight: 600; }
      .sd-blotter-tab.is-active::after { content: ""; position: absolute; left: 13px; right: 13px; bottom: -1px; height: 2px; background: var(--sd-accent); border-radius: 2px; }
      .sd-count { min-width: 17px; height: 16px; border-radius: 5px; background: var(--sd-bg-deep); color: var(--sd-muted); font-size: 9px; display: inline-grid; place-items: center; padding: 0 4px; font-family: var(--sd-mono); }
      .sd-blotter-head .sd-spacer { flex: 1; }
      .sd-section-tools { display: flex; align-items: center; gap: 7px; padding-right: 2px; }
      .sd-small-btn { height: 27px; padding: 0 9px; border-radius: 6px; border: 1px solid var(--sd-line); background: transparent; color: var(--sd-muted); display: inline-flex; align-items: center; gap: 5px; font-size: 10px; white-space: nowrap; }
      .sd-small-btn:hover { color: var(--sd-text); border-color: var(--sd-line-strong); }
      .sd-small-btn.is-accent { color: var(--sd-accent); border-color: color-mix(in srgb, var(--sd-accent) 26%, var(--sd-line)); background: var(--sd-accent-soft); }
      .sd-table-wrap { overflow-x: auto; }
      .sd-table { width: 100%; border-collapse: collapse; min-width: 720px; }
      .sd-table th { text-align: left; font-weight: 400; color: var(--sd-faint); font-size: 9.5px; letter-spacing: .03em; padding: 9px 13px; border-bottom: 1px solid var(--sd-line); white-space: nowrap; background: var(--sd-card-2); }
      .sd-table th.num, .sd-table td.num { text-align: right; }
      .sd-table td { padding: 10px 13px; border-bottom: 1px solid var(--sd-line); font-size: 11px; vertical-align: middle; }
      .sd-table tr:last-child td { border-bottom: 0; }
      .sd-table tbody tr { transition: background .12s ease; }
      .sd-table tbody tr:hover { background: var(--sd-card-2); }
      .sd-table .mono { font-family: var(--sd-mono); font-variant-numeric: tabular-nums; }
      .sd-table .strong { font-weight: 500; }
      .sd-table .muted { color: var(--sd-faint); font-size: 9.5px; }
      .sd-security-cell { display: flex; flex-direction: column; gap: 3px; min-width: 120px; }
      .sd-security-cell .name { font-weight: 500; display: flex; align-items: center; gap: 6px; }
      .sd-security-cell .code { color: var(--sd-faint); font-family: var(--sd-mono); font-size: 9px; }
      .sd-action-link { border: 0; background: transparent; color: var(--sd-accent); font-size: 10px; padding: 2px 0; white-space: nowrap; }
      .sd-action-link:hover { text-decoration: underline; }
      .sd-action-link.is-danger { color: var(--sd-danger); }
      .sd-status { display: inline-flex; align-items: center; gap: 4px; height: 20px; padding: 0 7px; border-radius: 5px; font-size: 9px; white-space: nowrap; }
      .sd-status.is-pending { color: var(--sd-warn); background: var(--sd-warn-soft); }
      .sd-status.is-filled { color: var(--sd-accent); background: var(--sd-accent-soft); }
      .sd-status.is-cancelled { color: var(--sd-faint); background: var(--sd-bg-deep); }
      .sd-status.is-rejected { color: var(--sd-danger); background: color-mix(in srgb, var(--sd-danger) 10%, transparent); }
      .sd-side-chip { display: inline-flex; height: 19px; align-items: center; padding: 0 6px; border-radius: 4px; font-size: 9px; font-weight: 600; }
      .sd-side-chip.is-buy { color: var(--sd-up); background: var(--sd-up-soft); }
      .sd-side-chip.is-sell { color: var(--sd-down); background: var(--sd-down-soft); }
      .sd-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 34px 20px 38px; gap: 8px; color: var(--sd-faint); }
      .sd-empty-icon { width: 42px; height: 42px; border-radius: 13px; border: 1px solid var(--sd-line); background: var(--sd-card-2); display: grid; place-items: center; color: var(--sd-muted); margin-bottom: 2px; }
      .sd-empty b { color: var(--sd-text); font-size: 12px; font-weight: 500; }
      .sd-empty span { font-size: 10.5px; line-height: 1.6; max-width: 310px; }
      .sd-empty .sd-small-btn { margin-top: 4px; }
      .sd-fin-grid { display: grid; grid-template-columns: 1.05fr .95fr; gap: 14px; padding: 14px; }
      .sd-fin-stats { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-bottom: 13px; }
      .sd-mini-stat { border: 1px solid var(--sd-line); border-radius: 10px; padding: 10px 11px; background: var(--sd-card-2); min-width: 0; }
      .sd-mini-stat span { color: var(--sd-faint); font-size: 9px; display: block; margin-bottom: 5px; white-space: nowrap; }
      .sd-mini-stat b { display: block; font-family: var(--sd-mono); font-size: 13px; font-weight: 500; white-space: nowrap; letter-spacing: -.02em; }
      .sd-fin-card-title { font-size: 11px; font-weight: 600; margin-bottom: 9px; display: flex; align-items: center; gap: 6px; }
      .sd-fin-card-sub { color: var(--sd-faint); font-size: 9.5px; line-height: 1.6; margin-top: 8px; }
      .sd-risk-box { border: 1px solid var(--sd-line); border-radius: 10px; padding: 12px; background: var(--sd-card-2); }
      .sd-risk-top { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
      .sd-risk-top span { color: var(--sd-faint); font-size: 9.5px; }
      .sd-risk-top b { font-family: var(--sd-mono); font-size: 17px; font-weight: 500; }
      .sd-risk-track { position: relative; height: 6px; border-radius: 99px; background: linear-gradient(90deg, var(--sd-danger) 0 15%, var(--sd-warn) 15% 30%, var(--sd-down) 30% 100%); margin: 14px 0 7px; opacity: .8; }
      .sd-risk-marker { position: absolute; top: -4px; width: 2px; height: 14px; background: var(--sd-text); border-radius: 2px; box-shadow: 0 0 0 2px var(--sd-card-2); }
      .sd-risk-scale { display: flex; justify-content: space-between; color: var(--sd-faint); font-family: var(--sd-mono); font-size: 8.5px; }
      .sd-input-row { display: flex; gap: 7px; }
      .sd-input-row .sd-input-shell { flex: 1; }
      .sd-input-row .sd-small-btn { height: 36px; }
      .sd-ref-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin-top: 7px; }
      .sd-ref-row button { height: 25px; border-radius: 5px; border: 1px solid var(--sd-line); background: transparent; color: var(--sd-muted); font-size: 9.5px; font-family: var(--sd-mono); }
      .sd-toggle-row { display: flex; align-items: flex-start; gap: 12px; padding: 12px 0; border-bottom: 1px solid var(--sd-line); }
      .sd-toggle-row:last-child { border-bottom: 0; }
      .sd-toggle-copy { flex: 1; min-width: 0; }
      .sd-toggle-copy b { display: block; font-size: 11.5px; font-weight: 500; margin-bottom: 3px; }
      .sd-toggle-copy span { display: block; color: var(--sd-faint); font-size: 9.5px; line-height: 1.6; }
      .sd-root .sd-switch { position: relative; width: 48px; height: 28px; border-radius: 99px; border: 0; padding: 0; background: var(--sd-line-strong); transition: background .18s ease; flex: none; display: block; }
      .sd-root .sd-switch span { position: absolute; top: 3px; left: 3px; width: 22px; height: 22px; border-radius: 50%; background: var(--sd-card); box-shadow: inset 0 0 0 1px rgba(0,0,0,.05); transition: transform .18s ease; }
      .sd-root .sd-switch.is-on { background: var(--sd-accent); }
      .sd-root .sd-switch.is-on span { transform: translateX(20px); }
      .sd-root .sd-switch:focus-visible { outline: 2px solid var(--sd-accent); outline-offset: 2px; }
      .sd-settings-grid { display: grid; grid-template-columns: 1.1fr .9fr; gap: 14px; padding: 14px; }
      .sd-settings-card { border: 1px solid var(--sd-line); border-radius: 11px; padding: 13px 14px; background: var(--sd-card); }
      .sd-settings-card + .sd-settings-card { margin-top: 10px; }
      .sd-form-row { display: flex; align-items: center; gap: 12px; padding: 9px 0; border-bottom: 1px solid var(--sd-line); }
      .sd-form-row:last-child { border-bottom: 0; padding-bottom: 0; }
      .sd-form-row .sd-form-label { flex: 1; font-size: 10.5px; color: var(--sd-muted); }
      .sd-select { height: 30px; border-radius: 7px; border: 1px solid var(--sd-line); background: var(--sd-card-2); color: var(--sd-text); padding: 0 8px; font-size: 10.5px; min-width: 112px; }
      .sd-danger-text { color: var(--sd-danger); }
      .sd-fineprint { color: var(--sd-faint); font-size: 9px; line-height: 1.7; }
      .sd-fineprint a { color: var(--sd-accent); text-decoration: none; }
      .sd-analysis-grid { display: grid; grid-template-columns: 1.08fr .92fr; gap: 14px; padding: 14px; }
      .sd-analysis-card { border: 1px solid var(--sd-line); border-radius: 11px; background: var(--sd-card); padding: 13px 14px; }
      .sd-analysis-card + .sd-analysis-card { margin-top: 10px; }
      .sd-analysis-title { font-size: 11px; font-weight: 600; display: flex; align-items: center; gap: 6px; margin-bottom: 11px; }
      .sd-analysis-title span { margin-left: auto; color: var(--sd-faint); font-size: 9px; font-weight: 400; }
      .sd-alloc-row { display: grid; grid-template-columns: 52px minmax(0,1fr) 86px; gap: 9px; align-items: center; padding: 5px 0; font-size: 10px; }
      .sd-alloc-label { color: var(--sd-muted); white-space: nowrap; }
      .sd-alloc-track { height: 5px; border-radius: 99px; background: var(--sd-bg-deep); overflow: hidden; }
      .sd-alloc-fill { display: block; height: 100%; border-radius: inherit; background: var(--sd-accent); }
      .sd-alloc-fill.is-hk { background: var(--sd-gold); }
      .sd-alloc-fill.is-us { background: #6d89a8; }
      .sd-alloc-fill.is-cash { background: var(--sd-faint); }
      .sd-alloc-value { text-align: right; font-size: 9.5px; color: var(--sd-muted); font-family: var(--sd-mono); white-space: nowrap; }
      .sd-alloc-value b { display: block; color: var(--sd-text); font-size: 10.5px; font-weight: 500; }
      .sd-analysis-stats { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 7px; }
      .sd-analysis-stat { border: 1px solid var(--sd-line); border-radius: 8px; background: var(--sd-card-2); padding: 9px 10px; min-width: 0; }
      .sd-analysis-stat span { display: block; font-size: 8.5px; color: var(--sd-faint); margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .sd-analysis-stat b { display: block; font-size: 12px; font-family: var(--sd-mono); font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .sd-holdings-list { display: grid; gap: 7px; }
      .sd-holding-row { display: grid; grid-template-columns: minmax(0,1fr) 80px 56px; gap: 8px; align-items: center; font-size: 10px; }
      .sd-holding-name { min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .sd-holding-name small { color: var(--sd-faint); font-family: var(--sd-mono); font-size: 8.5px; margin-left: 5px; }
      .sd-holding-bar { height: 4px; border-radius: 99px; background: var(--sd-bg-deep); overflow: hidden; }
      .sd-holding-bar i { display: block; height: 100%; background: var(--sd-accent); border-radius: inherit; }
      .sd-holding-value { text-align: right; color: var(--sd-muted); font-family: var(--sd-mono); font-size: 9px; white-space: nowrap; }
      @container stockdesk (max-width: 860px) { .sd-analysis-grid { grid-template-columns: 1fr; padding: 11px; } }
      .sd-footer { display: flex; align-items: flex-start; gap: 14px; justify-content: space-between; padding: 2px 3px 0; color: var(--sd-faint); font-size: 9.5px; line-height: 1.65; flex-wrap: wrap; }
      .sd-footer b { color: var(--sd-muted); font-weight: 500; }
      .sd-loading { display: grid; gap: 14px; }
      .sd-skeleton { border-radius: var(--sd-radius); background: linear-gradient(100deg, var(--sd-card) 30%, var(--sd-card-2) 50%, var(--sd-card) 70%); background-size: 200% 100%; animation: sdShimmer 1.8s linear infinite; border: 1px solid var(--sd-line); }
      @keyframes sdShimmer { from { background-position: 200% 0; } to { background-position: -200% 0; } }
      .sd-loading-copy { text-align: center; color: var(--sd-muted); font-size: 11px; padding: 8px; letter-spacing: .04em; }
      .sd-fatal { margin-top: 20px; padding: 34px; text-align: center; background: var(--sd-card); border: 1px solid var(--sd-line); border-radius: 18px; }
      .sd-fatal b { display: block; font-family: var(--sd-display); font-size: 20px; margin-bottom: 7px; }
      .sd-fatal p { color: var(--sd-muted); font-size: 11px; margin: 0 0 14px; }
      .sd-primary-btn { height: 34px; padding: 0 14px; border-radius: 8px; border: 0; background: var(--sd-accent); color: #fff; font-size: 11px; }
      [data-ds-dark-theme] .sd-primary-btn { color: #09221a; }
      .sd-modal-layer {
        position: fixed; inset: 0; z-index: 80; display: grid; place-items: center; padding: 20px;
        background: rgba(10, 16, 13, .48); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
        animation: sdFadeIn .16s ease;
      }
      @keyframes sdFadeIn { from { opacity: 0; } to { opacity: 1; } }
      .sd-modal {
        width: 100%; max-height: min(86vh, 720px); overflow-y: auto;
        background: var(--sd-card); border: 1px solid var(--sd-line-strong);
        border-radius: 17px; box-shadow: 0 34px 80px rgba(0,0,0,.26);
        animation: sdModalIn .2s cubic-bezier(.16,1,.3,1);
      }
      @keyframes sdModalIn { from { opacity: 0; transform: translateY(9px) scale(.99); } to { opacity: 1; transform: none; } }
      .sd-modal-head { display: flex; gap: 14px; align-items: flex-start; padding: 18px 20px 12px; border-bottom: 1px solid var(--sd-line); }
      .sd-modal-title { font-family: var(--sd-display); font-size: 19px; font-weight: 600; line-height: 1.2; }
      .sd-modal-sub { margin-top: 4px; color: var(--sd-faint); font-size: 10px; line-height: 1.55; }
      .sd-modal-close { margin-left: auto; width: 26px; height: 26px; border-radius: 6px; border: 0; background: var(--sd-card-2); color: var(--sd-muted); display: grid; place-items: center; flex: none; }
      .sd-modal-body { padding: 16px 20px 18px; }
      .sd-modal-foot { display: flex; gap: 8px; justify-content: flex-end; padding: 12px 20px 16px; border-top: 1px solid var(--sd-line); }
      .sd-modal-btn { height: 34px; padding: 0 16px; border-radius: 8px; border: 1px solid var(--sd-line); background: var(--sd-card); color: var(--sd-muted); font-size: 11px; }
      .sd-modal-btn:hover { color: var(--sd-text); }
      .sd-modal-btn.is-primary { border-color: transparent; background: var(--sd-accent); color: #fff; }
      [data-ds-dark-theme] .sd-modal-btn.is-primary { color: #09221a; }
      .sd-modal-btn.is-buy { border-color: transparent; background: var(--sd-up); color: #fff; }
      .sd-modal-btn.is-sell { border-color: transparent; background: var(--sd-down); color: #fff; }
      .sd-modal-btn:disabled { opacity: .5; }
      .sd-confirm-list { display: grid; gap: 8px; padding: 12px; border-radius: 10px; background: var(--sd-card-2); border: 1px solid var(--sd-line); }
      .sd-confirm-row { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; font-size: 10.5px; color: var(--sd-muted); }
      .sd-confirm-row b { color: var(--sd-text); font-weight: 500; font-family: var(--sd-mono); font-size: 11px; text-align: right; }
      .sd-confirm-row.is-total { border-top: 1px dashed var(--sd-line); padding-top: 8px; margin-top: 2px; }
      .sd-confirm-row.is-total b { font-size: 14px; }
      .sd-modal-error { margin-top: 10px; padding: 8px 10px; border-radius: 7px; background: color-mix(in srgb, var(--sd-danger) 9%, transparent); color: var(--sd-danger); font-size: 10px; line-height: 1.55; }
      .sd-modal-note { margin-top: 12px; color: var(--sd-faint); font-size: 9.5px; line-height: 1.65; }
      .sd-modal-note b { color: var(--sd-warn); font-weight: 500; }
      .sd-discover-tabs { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 10px; }
      .sd-discover-tab { height: 27px; padding: 0 10px; border-radius: 99px; border: 1px solid var(--sd-line); background: var(--sd-card-2); color: var(--sd-muted); font-size: 10px; }
      .sd-discover-tab:hover { color: var(--sd-text); }
      .sd-discover-tab.is-active { border-color: color-mix(in srgb, var(--sd-accent) 32%, var(--sd-line)); background: var(--sd-accent-soft); color: var(--sd-accent); font-weight: 600; }
      .sd-discover-hint { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 8px; color: var(--sd-faint); font-size: 9.5px; }
      .sd-discover-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 7px; max-height: 390px; overflow-y: auto; overscroll-behavior: contain; padding-right: 2px; scrollbar-width: thin; scrollbar-color: var(--sd-line-strong) transparent; }
      .sd-discover-grid::-webkit-scrollbar { width: 6px; }
      .sd-discover-grid::-webkit-scrollbar-thumb { background: var(--sd-line-strong); border-radius: 99px; }
      .sd-discover-grid::-webkit-scrollbar-track { background: transparent; }
      .sd-discover-item { display: flex; align-items: center; gap: 8px; min-width: 0; padding: 9px 9px 9px 10px; border: 1px solid var(--sd-line); border-radius: 9px; background: var(--sd-card-2); }
      .sd-discover-main { flex: 1; min-width: 0; }
      .sd-discover-name { display: flex; align-items: center; gap: 5px; min-width: 0; font-size: 12px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .sd-discover-name .sd-tag { flex: none; }
      .sd-discover-symbol { color: var(--sd-faint); font-family: var(--sd-mono); font-size: 9px; font-weight: 400; }
      .sd-discover-meta { display: flex; align-items: center; gap: 5px; margin-top: 4px; min-width: 0; color: var(--sd-faint); font-size: 9px; white-space: nowrap; overflow: hidden; }
      .sd-discover-meta .sd-tag { height: 15px; padding: 0 4px; font-size: 8px; }
      .sd-discover-quote { margin-left: auto; font-family: var(--sd-mono); font-size: 9.5px; white-space: nowrap; }
      .sd-discover-add { flex: none; height: 26px; padding: 0 8px; border-radius: 6px; border: 1px solid var(--sd-line-strong); background: var(--sd-card); color: var(--sd-muted); font-size: 9.5px; white-space: nowrap; }
      .sd-discover-add:hover:not(:disabled) { color: var(--sd-accent); border-color: var(--sd-accent); }
      .sd-discover-add.is-added { color: var(--sd-faint); border-color: var(--sd-line); background: transparent; }
      .sd-discover-empty { padding: 30px 10px; color: var(--sd-faint); font-size: 11px; text-align: center; }
      @container stockdesk (max-width: 620px) { .sd-discover-grid { grid-template-columns: 1fr; } }
      .sd-radio-line { display: flex; gap: 8px; margin-bottom: 10px; }
      .sd-radio-line button { flex: 1; height: 31px; border-radius: 7px; border: 1px solid var(--sd-line); background: var(--sd-card-2); color: var(--sd-muted); font-size: 10.5px; }
      .sd-radio-line button.is-active { border-color: var(--sd-accent); color: var(--sd-accent); background: var(--sd-accent-soft); font-weight: 600; }
      .sd-alert-row { display: flex; align-items: center; gap: 8px; padding: 7px 0; border-bottom: 1px solid var(--sd-line); font-size: 9.5px; }
      .sd-alert-row:last-child { border-bottom: 0; }
      .sd-alert-row b { color: var(--sd-text); font-weight: 500; }
      .sd-alert-row .price { margin-left: auto; font-family: var(--sd-mono); color: var(--sd-muted); }
      .sd-alert-row button { border: 0; background: transparent; color: var(--sd-faint); padding: 2px; }
      .sd-alert-row button:hover { color: var(--sd-danger); }
      .sd-toasts { position: fixed; z-index: 120; right: 22px; bottom: 22px; display: flex; flex-direction: column; gap: 8px; pointer-events: none; }
      .sd-toast {
        pointer-events: auto; min-width: 230px; max-width: 360px; padding: 10px 12px;
        border-radius: 9px; background: #19211d; color: #f1eee4; border: 1px solid rgba(255,255,255,.12);
        box-shadow: 0 14px 34px rgba(0,0,0,.25); font-size: 10.5px; line-height: 1.55;
        display: flex; align-items: flex-start; gap: 8px; animation: sdToastIn .22s cubic-bezier(.16,1,.3,1);
      }
      @keyframes sdToastIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
      .sd-toast .ic { color: #8ee1bd; margin-top: 1px; flex: none; }
      .sd-toast.is-error .ic { color: #ff8b83; }
      .sd-toast .x { margin-left: auto; border: 0; background: transparent; color: rgba(255,255,255,.4); padding: 0; }
      .sd-toast .x:hover { color: #fff; }
      .sd-sr { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
      .sd-spin { animation: sdSpin 1s linear infinite; }
      @keyframes sdSpin { to { transform: rotate(360deg); } }
      .sd-num { font-family: var(--sd-mono); font-variant-numeric: tabular-nums; }
      .sd-nowrap { white-space: nowrap; }
      .sd-soft-link { color: var(--sd-accent); text-decoration: none; }
      .sd-soft-link:hover { text-decoration: underline; }
      .sd-divider { width: 1px; height: 12px; background: var(--sd-line); }
      @media (max-width: 1320px) {
        .sd-main-grid { grid-template-columns: 264px minmax(0,1fr) 320px; }
        .sd-hero-stat { padding: 0 14px; }
        .sd-stat-value { font-size: 19px; }
        .sd-hero-stat:first-child .sd-stat-value { font-size: 24px; }
        .sd-quote-price-wrap { gap: 9px; }
        .sd-big-price { font-size: 30px; }
      }
      @media (max-width: 1120px) {
        .sd-main-grid { grid-template-columns: minmax(0,1fr) 322px; }
        .sd-watch-card { grid-column: 1 / -1; position: static; order: 3; }
        .sd-watch-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(215px, 1fr)); gap: 3px; }
        .sd-index-list { grid-template-columns: repeat(4, 1fr); display: grid; gap: 4px; }
        .sd-index-row { border: 1px solid var(--sd-line); border-radius: 8px; grid-template-columns: minmax(0,1fr) auto; }
        .sd-index-pct { display: none; }
        .sd-add-row { display: none; }
        .sd-hero { padding: 22px; }
        .sd-hero-note {
        display: inline-flex; align-items: center; gap: 7px;
        color: rgba(246,241,229,.58); font-size: 10px; letter-spacing: .11em; text-transform: uppercase;
        border: 1px solid rgba(255,255,255,.11); border-radius: 999px; padding: 6px 10px;
        background: rgba(255,255,255,.03);
      }
      .sd-hero-foot {
        display: flex; align-items: center; gap: 12px; justify-content: space-between;
        margin-top: 16px; padding-top: 13px; border-top: 1px solid rgba(255,255,255,.09);
        position: relative; z-index: 1; flex-wrap: wrap;
      }
      .sd-hero-meta {
        display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap;
        color: rgba(246,241,229,.38); font-size: 9.5px; line-height: 1.5;
        margin-top: 9px; position: relative; z-index: 1;
      }
      .sd-hero-stats { grid-template-columns: repeat(3, 1fr); row-gap: 16px; }
        .sd-hero-stat { padding: 0 14px; }
        .sd-hero-stat:nth-child(4) { padding-left: 0; border-left: 0; }
        .sd-hero-stat:nth-child(4), .sd-hero-stat:nth-child(5), .sd-hero-stat:nth-child(6) { border-top: 1px solid rgba(255,255,255,.10); padding-top: 15px; }
        .sd-quote-stats { grid-template-columns: repeat(3, 1fr); }
        .sd-quote-stat:nth-child(4) { border-left: 0; }
        .sd-quote-stat:nth-child(n+4) { border-top: 1px solid var(--sd-line); }
        .sd-fin-grid, .sd-settings-grid { grid-template-columns: 1fr; }
      }
      @media (max-width: 820px) {
        .sd-shell { padding: max(14px, calc(var(--dsh-frame-top-clearance, 0px) + 8px)) 12px 24px; }
        .sd-hero { border-radius: 17px; padding: 17px 15px 16px; }
        .sd-hero-top { gap: 12px; flex-wrap: wrap; }
        .sd-hero-right { flex-direction: row; width: 100%; align-items: center; justify-content: space-between; flex-wrap: wrap; }
        .sd-brand-title { font-size: 20px; }
        .sd-brand-title em { display: none; }
        .sd-logo { width: 38px; height: 38px; flex-basis: 38px; border-radius: 11px; }
        .sd-hero-note {
        display: inline-flex; align-items: center; gap: 7px;
        color: rgba(246,241,229,.58); font-size: 10px; letter-spacing: .11em; text-transform: uppercase;
        border: 1px solid rgba(255,255,255,.11); border-radius: 999px; padding: 6px 10px;
        background: rgba(255,255,255,.03);
      }
      .sd-hero-foot {
        display: flex; align-items: center; gap: 12px; justify-content: space-between;
        margin-top: 16px; padding-top: 13px; border-top: 1px solid rgba(255,255,255,.09);
        position: relative; z-index: 1; flex-wrap: wrap;
      }
      .sd-hero-meta {
        display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap;
        color: rgba(246,241,229,.38); font-size: 9.5px; line-height: 1.5;
        margin-top: 9px; position: relative; z-index: 1;
      }
      .sd-hero-stats { grid-template-columns: 1fr 1fr; margin-top: 18px; padding-top: 14px; }
        .sd-hero-stat { padding: 0 12px; }
        .sd-hero-stat:nth-child(3) { border-left: 0; }
        .sd-hero-stat:nth-child(4), .sd-hero-stat:nth-child(5), .sd-hero-stat:nth-child(6) { border-top: 1px solid rgba(255,255,255,.10); padding-top: 12px; }
        .sd-hero-stat:nth-child(3), .sd-hero-stat:nth-child(5) { border-left: 1px solid rgba(255,255,255,.10); }
        .sd-hero-stat:nth-child(4) { padding-left: 0; }
        .sd-main-grid { grid-template-columns: 1fr; }
        .sd-watch-card { order: 0; }
        .sd-right-col { order: 0; }
        .sd-quote-head { padding: 15px 14px 11px; flex-wrap: wrap; gap: 12px; }
        .sd-quote-price-wrap { width: 100%; justify-content: space-between; }
        .sd-big-price { font-size: 30px; }
        .sd-quote-actions { margin-left: auto; }
        .sd-quote-stats { grid-template-columns: repeat(3, 1fr); }
        .sd-main-grid .sd-trade-card { order: -1; }
        .sd-fin-stats { grid-template-columns: 1fr 1fr; }
        .sd-index-list { grid-template-columns: 1fr 1fr; }
        .sd-table th, .sd-table td { padding-left: 10px; padding-right: 10px; }
        .sd-blotter-head { padding-left: 7px; }
        .sd-blotter-tab { padding: 0 10px; font-size: 11px; }
        .sd-blotter-tab.is-active::after { left: 10px; right: 10px; }
        .sd-fin-grid, .sd-settings-grid { padding: 11px; }
        .sd-alert-row { display: flex; align-items: center; gap: 8px; padding: 7px 0; border-bottom: 1px solid var(--sd-line); font-size: 9.5px; }
      .sd-alert-row:last-child { border-bottom: 0; }
      .sd-alert-row b { color: var(--sd-text); font-weight: 500; }
      .sd-alert-row .price { margin-left: auto; font-family: var(--sd-mono); color: var(--sd-muted); }
      .sd-alert-row button { border: 0; background: transparent; color: var(--sd-faint); padding: 2px; }
      .sd-alert-row button:hover { color: var(--sd-danger); }
      .sd-toasts { right: 12px; left: 12px; bottom: 12px; align-items: stretch; }
        .sd-toast { min-width: 0; max-width: none; }
      }
      @media (max-width: 540px) {
        .sd-brand-sub { display: none; }
        .sd-hero-note { display: none; }
        .sd-clocks { gap: 4px; }
        .sd-clock { padding: 5px 8px; font-size: 10px; }
        .sd-clock .mk { display: none; }
        .sd-stat-value { font-size: 17px !important; }
        .sd-quote-stats { grid-template-columns: 1fr 1fr; }
        .sd-quote-stat:nth-child(3), .sd-quote-stat:nth-child(5) { border-left: 0; }
        .sd-quote-stat:nth-child(4) { border-left: 1px solid var(--sd-line); }
        .sd-quote-stat:nth-child(n+3) { border-top: 1px solid var(--sd-line); }
        .sd-settings-grid, .sd-fin-grid { padding: 9px; }
        .sd-fin-stats { grid-template-columns: 1fr; }
        .sd-hero-stat { padding: 0 9px; }
        .sd-hero-stat:nth-child(3), .sd-hero-stat:nth-child(5) { border-left: 1px solid rgba(255,255,255,.10); }
        .sd-hero-stat:nth-child(2) { border-left: 1px solid rgba(255,255,255,.10); }
        .sd-hero-note {
        display: inline-flex; align-items: center; gap: 7px;
        color: rgba(246,241,229,.58); font-size: 10px; letter-spacing: .11em; text-transform: uppercase;
        border: 1px solid rgba(255,255,255,.11); border-radius: 999px; padding: 6px 10px;
        background: rgba(255,255,255,.03);
      }
      .sd-hero-foot {
        display: flex; align-items: center; gap: 12px; justify-content: space-between;
        margin-top: 16px; padding-top: 13px; border-top: 1px solid rgba(255,255,255,.09);
        position: relative; z-index: 1; flex-wrap: wrap;
      }
      .sd-hero-meta {
        display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap;
        color: rgba(246,241,229,.38); font-size: 9.5px; line-height: 1.5;
        margin-top: 9px; position: relative; z-index: 1;
      }
      .sd-hero-stats { column-gap: 0; }
      }
      @media (prefers-reduced-motion: reduce) {
        .sd-root *, .sd-root *::before, .sd-root *::after { animation-duration: .001ms !important; transition-duration: .001ms !important; }
      }

      /* The DSH sidebar shrinks the plugin's content box. Lay this desk out by
         container width, not by viewport width. */
      @container stockdesk (max-width: 1240px) {
        .sd-main-grid { grid-template-columns: minmax(0, 1fr) 324px; }
        .sd-watch-card {
          grid-column: 1 / -1;
          order: 0;
          position: static;
          display: grid;
          grid-template-columns: 196px minmax(0, 1fr);
          grid-template-rows: auto auto;
          align-items: stretch;
          overflow: hidden;
        }
        .sd-watch-card .sd-card-head { grid-column: 1; grid-row: 1; padding: 10px 8px 3px 14px; }
        .sd-watch-card .sd-search-wrap { grid-column: 2; grid-row: 1; padding: 7px 14px 3px 8px; }
        .sd-watch-card .sd-search-results { top: 41px; }
        .sd-watch-card .sd-section-rule { display: none; }
        .sd-watch-card .sd-index-list { display: none; }
        .sd-watch-card .sd-watch-strip { grid-column: 1 / -1; grid-row: 2; min-width: 0; }
        .sd-watch-card .sd-watch-list {
          display: flex; align-items: stretch; gap: 6px;
          padding: 4px 14px 8px;
          overflow-x: auto; overscroll-behavior-x: contain;
          scrollbar-width: thin; scrollbar-color: var(--sd-line-strong) transparent;
          touch-action: pan-x;
        }
        .sd-watch-card .sd-watch-list::-webkit-scrollbar { height: 6px; display: block; }
        .sd-watch-card .sd-watch-list::-webkit-scrollbar-thumb { background: var(--sd-line-strong); border-radius: 99px; }
        .sd-watch-card .sd-watch-list::-webkit-scrollbar-track { background: transparent; }
        .sd-watch-card .sd-watch-arrow {
          display: grid; place-items: center; position: absolute; top: 50%; z-index: 4;
          width: 27px; height: 27px; padding: 0; border-radius: 50%;
          border: 1px solid var(--sd-line-strong); background: var(--sd-card); color: var(--sd-text);
          box-shadow: 0 4px 12px rgba(20,30,25,.14); transform: translateY(-50%);
          transition: opacity .15s ease, transform .15s ease;
        }
        .sd-watch-card .sd-watch-arrow:hover { background: var(--sd-card-2); }
        .sd-watch-card .sd-watch-arrow.is-left { left: 5px; }
        .sd-watch-card .sd-watch-arrow.is-right { right: 5px; }
        .sd-watch-card .sd-watch-arrow.is-off { opacity: 0; pointer-events: none; }
        .sd-watch-card .sd-watch-strip::before,
        .sd-watch-card .sd-watch-strip::after {
          content: ""; position: absolute; top: 0; bottom: 8px; width: 24px;
          z-index: 2; pointer-events: none; opacity: 0; transition: opacity .15s ease;
        }
        .sd-watch-card .sd-watch-strip::before { left: 0; background: linear-gradient(90deg, var(--sd-card), transparent); }
        .sd-watch-card .sd-watch-strip::after { right: 0; background: linear-gradient(270deg, var(--sd-card), transparent); }
        .sd-watch-card .sd-watch-strip.has-left::before { opacity: 1; }
        .sd-watch-card .sd-watch-strip.has-right::after { opacity: 1; }
        .sd-watch-card .sd-watch-row {
          flex: 0 0 176px; min-width: 0;
          border: 1px solid var(--sd-line);
          padding: 8px 9px; border-radius: 8px;
          grid-template-columns: minmax(0,1fr) auto;
        }
        .sd-watch-card .sd-watch-row.is-active { border-color: color-mix(in srgb, var(--sd-accent) 26%, var(--sd-line)); }
        .sd-watch-card .sd-add-row,
        .sd-watch-card .sd-watch-footer { display: none; }
        .sd-hero-stat { padding-left: 10px; padding-right: 10px; }
        .sd-hero-stat:first-child { padding-left: 0; }
        .sd-hero-stat:first-child .sd-stat-value { font-size: clamp(18px, 2.3cqw, 24px); }
        .sd-stat-value { font-size: clamp(15px, 1.8cqw, 18px); min-width: 0; overflow: hidden; text-overflow: ellipsis; }
        .sd-stat-label, .sd-stat-sub { overflow: hidden; text-overflow: ellipsis; }
        .sd-hero-note { display: none; }
        .sd-quote-stats { grid-template-columns: repeat(3, minmax(0,1fr)); }
        .sd-quote-stat:nth-child(n+4) { border-top: 1px solid var(--sd-line); }
        .sd-quote-stat:nth-child(3n+1) { border-left: 0; }
        .sd-quote-stat:nth-child(4) { border-left: 0; }
        .sd-quote-stat b { white-space: normal; overflow: visible; text-overflow: clip; }
        .sd-right-col { min-width: 0; }
        .sd-right-col > * { min-width: 0; }
      }
      @container stockdesk (max-width: 860px) {
        .sd-main-grid { grid-template-columns: minmax(0, 1fr); }
        .sd-watch-card { grid-template-columns: 170px minmax(0, 1fr); grid-template-rows: auto auto; }
        .sd-watch-card .sd-card-head { grid-column: 1; grid-row: 1; padding: 9px 8px 4px 14px; }
        .sd-watch-card .sd-search-wrap { grid-column: 2; grid-row: 1; padding: 6px 14px 4px 8px; }
        .sd-watch-card .sd-search-results { top: 39px; }
        .sd-watch-card .sd-index-list { display: none; }
        .sd-watch-card .sd-watch-strip { grid-column: 1 / -1; grid-row: 2; }
        .sd-watch-card .sd-watch-list { grid-column: 1 / -1; grid-row: 2; padding: 0 14px 11px; }
        .sd-watch-card .sd-watch-row { flex-basis: 166px; }
        .sd-center-col, .sd-right-col { grid-column: 1; }
        .sd-quote-head { padding: 15px 14px 11px; gap: 10px; }
        .sd-quote-price-wrap { width: 100%; justify-content: flex-start; }
        .sd-big-price { font-size: 31px; }
        .sd-quote-actions { margin-left: auto; }
        .sd-quote-stats { grid-template-columns: repeat(3, minmax(0,1fr)); }
        .sd-hero { border-radius: 17px; padding: 17px 15px 16px; }
        .sd-brand-title { font-size: 20px; }
        .sd-brand-title em { display: none; }
        .sd-brand-sub { display: none; }
        .sd-hero-stats { grid-template-columns: repeat(3, minmax(0,1fr)); margin-top: 18px; padding-top: 14px; }
        .sd-hero-stat { padding: 0 11px; border-top: 0; }
        .sd-hero-stat:nth-child(3n+1) { padding-left: 0; border-left: 0; }
        .sd-hero-stat:nth-child(n+4) { padding-top: 12px; border-top: 1px solid rgba(255,255,255,.10); }
        .sd-stat-value { font-size: 18px; }
        .sd-hero-stat:first-child .sd-stat-value { font-size: 23px; }
        .sd-hero-top { flex-wrap: wrap; gap: 12px; }
        .sd-hero-foot { gap: 9px; }
        .sd-clocks { gap: 4px; }
        .sd-clock { padding: 5px 8px; font-size: 10px; }
        .sd-clock .mk { display: none; }
        .sd-hero-actions { width: 100%; justify-content: flex-start; }
        .sd-fin-grid, .sd-settings-grid { grid-template-columns: 1fr; padding: 11px; }
        .sd-fin-stats { grid-template-columns: 1fr 1fr; }
        .sd-blotter-head { padding-left: 7px; }
        .sd-blotter-tab { padding: 0 10px; font-size: 11px; }
        .sd-blotter-tab.is-active::after { left: 10px; right: 10px; }
        .sd-table th, .sd-table td { padding-left: 10px; padding-right: 10px; }
        .sd-alert-row { display: flex; align-items: center; gap: 8px; padding: 7px 0; border-bottom: 1px solid var(--sd-line); font-size: 9.5px; }
      .sd-alert-row:last-child { border-bottom: 0; }
      .sd-alert-row b { color: var(--sd-text); font-weight: 500; }
      .sd-alert-row .price { margin-left: auto; font-family: var(--sd-mono); color: var(--sd-muted); }
      .sd-alert-row button { border: 0; background: transparent; color: var(--sd-faint); padding: 2px; }
      .sd-alert-row button:hover { color: var(--sd-danger); }
      .sd-toasts { right: 12px; left: 12px; bottom: 12px; align-items: stretch; }
        .sd-toast { min-width: 0; max-width: none; }
      }
      @container stockdesk (max-width: 620px) {
        .sd-shell { padding: max(12px, calc(var(--dsh-frame-top-clearance, 0px) + 8px)) 10px 22px; }
        .sd-quote-stats { grid-template-columns: repeat(2, minmax(0,1fr)); }
        .sd-quote-stat:nth-child(2n) { border-left: 1px solid var(--sd-line); }
        .sd-quote-stat:nth-child(2n+1) { border-left: 0; }
        .sd-quote-stat:nth-child(n+3) { border-top: 1px solid var(--sd-line); }
        .sd-hero-stats { grid-template-columns: repeat(2, minmax(0,1fr)); }
        .sd-hero-stat { padding: 0 9px; border-top: 0; border-left: 1px solid rgba(255,255,255,.10); }
        .sd-hero-stat:nth-child(2n+1) { padding-left: 0; border-left: 0; }
        .sd-hero-stat:nth-child(n+3) { padding-top: 12px; border-top: 1px solid rgba(255,255,255,.10); }
        .sd-fin-stats { grid-template-columns: 1fr; }
        .sd-hero-actions .sd-ghost { flex: 1; justify-content: center; }
        .sd-watch-card .sd-watch-row { flex-basis: 158px; }
      }
    `;

    function cx(...items) {
      return items.filter(Boolean).join(' ');
    }

    function fmtMoney(value, digits = 2) {
      const number = Number(value);
      if (!Number.isFinite(number)) return '—';
      return number.toLocaleString('zh-CN', { minimumFractionDigits: digits, maximumFractionDigits: digits });
    }

    function round2(value) {
      const number = Number(value);
      if (!Number.isFinite(number)) return 0;
      return Math.round((number + Number.EPSILON) * 100) / 100;
    }

    function fmtCny(value, digits = 2) {
      const number = Number(value);
      if (!Number.isFinite(number)) return '—';
      const sign = number < 0 ? '-' : '';
      return `${sign}¥${fmtMoney(Math.abs(number), digits)}`;
    }

    function fmtSignedCny(value, digits = 2) {
      const number = Number(value);
      if (!Number.isFinite(number)) return '—';
      return `${number > 0 ? '+' : number < 0 ? '-' : ''}¥${fmtMoney(Math.abs(number), digits)}`;
    }

    function fmtHeroCny(value) {
      const number = Number(value);
      if (!Number.isFinite(number)) return '—';
      const sign = number < 0 ? '-' : '';
      const abs = Math.abs(number);
      if (abs >= 1e8) return `${sign}¥${(abs / 1e8).toFixed(2)}亿`;
      if (abs >= 1e4) return `${sign}¥${(abs / 1e4).toFixed(2)}万`;
      return `${sign}¥${fmtMoney(abs, 2)}`;
    }

    function fmtNative(value, currency = 'CNY', digits = 2) {
      const number = Number(value);
      if (!Number.isFinite(number)) return '—';
      return `${CURRENCY_SYMBOL[currency] || currency}${fmtMoney(number, digits)}`;
    }

    function fmtPrice(value, currency = 'CNY') {
      return fmtNative(value, currency, currency === 'CNY' ? 2 : currency === 'HKD' ? 3 : 2);
    }

    function fmtPct(value, digits = 2) {
      const number = Number(value);
      if (!Number.isFinite(number)) return '—';
      return `${number > 0 ? '+' : ''}${number.toFixed(digits)}%`;
    }

    function fmtPctSmart(value) {
      const number = Number(value);
      if (!Number.isFinite(number)) return '—';
      if (number !== 0 && Math.abs(number) < 0.01) return `${number > 0 ? '+' : ''}${number.toFixed(4)}%`;
      return fmtPct(number);
    }

    function toneOf(value) {
      const number = Number(value);
      if (!Number.isFinite(number) || Math.abs(number) < 0.0001) return '';
      return number > 0 ? 'is-up' : 'is-down';
    }

    function fmtCompact(value) {
      const number = Number(value);
      if (!Number.isFinite(number)) return '—';
      if (Math.abs(number) >= 1e12) return `${(number / 1e12).toFixed(2)}万亿`;
      if (Math.abs(number) >= 1e8) return `${(number / 1e8).toFixed(2)}亿`;
      if (Math.abs(number) >= 1e4) return `${(number / 1e4).toFixed(2)}万`;
      return fmtMoney(number, 0);
    }

    function fmtTime(value) {
      if (!value) return '—';
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return String(value);
      return new Intl.DateTimeFormat('zh-CN', {
        timeZone: 'Asia/Shanghai',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hourCycle: 'h23',
      }).format(date).replaceAll('/', '-');
    }

    function fmtShortTime(value) {
      if (!value) return '—';
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return String(value);
      return new Intl.DateTimeFormat('zh-CN', {
        timeZone: 'Asia/Shanghai',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hourCycle: 'h23',
      }).format(date);
    }

    function fmtDate(value) {
      if (!value) return '—';
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return String(value);
      return new Intl.DateTimeFormat('zh-CN', {
        timeZone: 'Asia/Shanghai',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(date).replaceAll('/', '-');
    }

    function todayDateKey() {
      return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
    }

    function marketLabel(market) {
      return market === 'A' ? 'A股' : market === 'HK' ? '港股' : market === 'US' ? '美股' : market;
    }

    function marketClass(market) {
      return market === 'A' ? 'is-a' : market === 'HK' ? 'is-hk' : 'is-us';
    }

    function lotFor(quote) {
      if (!quote) return 1;
      if (quote.market === 'A') return 100;
      if (quote.market === 'HK') return Math.max(1, Number(quote.lotSize) || 100);
      return 1;
    }

    function fxFor(market, fx) {
      if (market === 'HK') return Number(fx?.hkdCny) || 0.91;
      if (market === 'US') return Number(fx?.usdCny) || 7.1;
      return 1;
    }

    function feeEstimate({ market, side, qty, price, fxRate }) {
      const grossNative = Number(price) * Number(qty);
      const grossCny = grossNative * Number(fxRate || 1);
      let fee = 0;
      if (market === 'A') {
        fee += Math.max(5, grossNative * 0.00025);
        fee += grossNative * 0.00001;
        if (side === 'sell') fee += grossNative * 0.0005;
      } else if (market === 'HK') {
        fee += Math.max(3, grossNative * 0.0003);
        fee += Math.max(1, Math.ceil(grossNative * 0.001));
        fee += grossNative * 0.0000565;
        fee += grossNative * 0.000027;
        fee += grossNative * 0.0000015;
        fee += Math.min(100, Math.max(2, grossNative * 0.00002));
        fee += grossCny * 0.001;
      } else if (market === 'US') {
        if (side === 'sell') {
          fee += grossNative * 0.0000278;
          fee += Math.min(8.3, Math.max(0.01, Number(qty) * 0.000166));
        }
        fee += grossCny * 0.001;
      }
      return Math.round(fee * 100) / 100;
    }

    function Icon({ name, size = 16, strokeWidth = 1.8, className = '', fill = 'none' }) {
      const props = {
        width: size,
        height: size,
        viewBox: '0 0 24 24',
        fill,
        stroke: 'currentColor',
        strokeWidth,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        className,
        'aria-hidden': 'true',
      };
      const shapes = {
        chart: [h('path', { key: 'a', d: 'M4 19V5' }), h('path', { key: 'b', d: 'M4 19h16' }), h('path', { key: 'c', d: 'm7 15 3-4 3 2 4-6' })],
        candles: [
          h('path', { key: 'a', d: 'M7 4v3M7 17v3M17 4v5M17 15v5' }),
          h('rect', { key: 'b', x: 5, y: 7, width: 4, height: 10, rx: 1 }),
          h('rect', { key: 'c', x: 15, y: 9, width: 4, height: 6, rx: 1 }),
        ],
        wallet: [h('path', { key: 'a', d: 'M4 7.5A2.5 2.5 0 0 1 6.5 5H18a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6.5A2.5 2.5 0 0 1 4 17.5z' }), h('path', { key: 'b', d: 'M4 8h16' }), h('path', { key: 'c', d: 'M16 13h2' })],
        briefcase: [h('rect', { key: 'a', x: 3, y: 7, width: 18, height: 13, rx: 2 }), h('path', { key: 'b', d: 'M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18M10 12v2h4v-2' })],
        bank: [h('path', { key: 'a', d: 'm3 9 9-5 9 5' }), h('path', { key: 'b', d: 'M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 21h18' })],
        receipt: [h('path', { key: 'a', d: 'M6 3h12v18l-3-2-3 2-3-2-3 2z' }), h('path', { key: 'b', d: 'M9 8h6M9 12h6M9 16h3' })],
        gear: [h('circle', { key: 'a', cx: 12, cy: 12, r: 3 }), h('path', { key: 'b', d: 'M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 1.55V21a2 2 0 1 1-4 0v-.09A1.7 1.7 0 0 0 9 19.4a1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.55-1H3a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.6h.09A1.7 1.7 0 0 0 10 3.05V3a2 2 0 1 1 4 0v.09A1.7 1.7 0 0 0 15 4.6a1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 9v.09A1.7 1.7 0 0 0 20.95 10H21a2 2 0 1 1 0 4h-.09A1.7 1.7 0 0 0 19.4 15z' })],
        refresh: [h('path', { key: 'a', d: 'M20 11a8.1 8.1 0 0 0-15.5-2M4 4v5h5' }), h('path', { key: 'b', d: 'M4 13a8.1 8.1 0 0 0 15.5 2M20 20v-5h-5' })],
        search: [h('circle', { key: 'a', cx: 11, cy: 11, r: 7 }), h('path', { key: 'b', d: 'm20 20-3.5-3.5' })],
        plus: [h('path', { key: 'a', d: 'M12 5v14M5 12h14' })],
        minus: [h('path', { key: 'a', d: 'M5 12h14' })],
        x: [h('path', { key: 'a', d: 'M6 6l12 12M18 6 6 18' })],
        arrowUp: [h('path', { key: 'a', d: 'M12 19V5M6 11l6-6 6 6' })],
        arrowDown: [h('path', { key: 'a', d: 'M12 5v14M18 13l-6 6-6-6' })],
        arrowRight: [h('path', { key: 'a', d: 'M5 12h14M13 6l6 6-6 6' })],
        arrowUpRight: [h('path', { key: 'a', d: 'M7 17 17 7M7 7h10v10' })],
        arrowDownRight: [h('path', { key: 'a', d: 'M7 7l10 10M17 7v10H7' })],
        chevronDown: [h('path', { key: 'a', d: 'm6 9 6 6 6-6' })],
        chevronLeft: [h('path', { key: 'a', d: 'm15 18-6-6 6-6' })],
        chevronRight: [h('path', { key: 'a', d: 'm9 18 6-6-6-6' })],
        alert: [h('path', { key: 'a', d: 'M10.3 3.8 2.6 17a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 3.8a2 2 0 0 0-3.4 0z' }), h('path', { key: 'b', d: 'M12 9v4M12 17h.01' })],
        check: [h('path', { key: 'a', d: 'm5 12 4 4L19 6' })],
        star: [h('path', { key: 'a', d: 'm12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-2.9-5.6 2.9 1.1-6.2L3 9.6l6.2-.9z' })],
        clock: [h('circle', { key: 'a', cx: 12, cy: 12, r: 8 }), h('path', { key: 'b', d: 'M12 7v5l3 2' })],
        bell: [h('path', { key: 'a', d: 'M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4' })],
        info: [h('circle', { key: 'a', cx: 12, cy: 12, r: 9 }), h('path', { key: 'b', d: 'M12 11v5M12 8h.01' })],
        shield: [h('path', { key: 'a', d: 'M12 3 4.5 6v5.5c0 4.5 3.2 7.8 7.5 9.5 4.3-1.7 7.5-5 7.5-9.5V6z' }), h('path', { key: 'b', d: 'm9 12 2 2 4-4' })],
        coins: [h('ellipse', { key: 'a', cx: 12, cy: 6, rx: 8, ry: 3 }), h('path', { key: 'b', d: 'M4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6' }), h('path', { key: 'c', d: 'M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6' })],
        download: [h('path', { key: 'a', d: 'M12 3v12M7 10l5 5 5-5M4 21h16' })],
        trash: [h('path', { key: 'a', d: 'M4 7h16M10 11v6M14 11v6M6 7l1 14h10l1-14M9 7V4h6v3' })],
        lock: [h('rect', { key: 'a', x: 4, y: 10, width: 16, height: 11, rx: 2 }), h('path', { key: 'b', d: 'M8 10V7a4 4 0 0 1 8 0v3' })],
        layers: [h('path', { key: 'a', d: 'm12 3 9 5-9 5-9-5z' }), h('path', { key: 'b', d: 'm3 12 9 5 9-5M3 16l9 5 9-5' })],
        send: [h('path', { key: 'a', d: 'M21 3 10 14M21 3l-7 18-4-7-7-4z' })],
        dot: [h('circle', { key: 'a', cx: 12, cy: 12, r: 4, fill: 'currentColor', stroke: 'none' })],
      };
      return h('svg', props, shapes[name] || shapes.info);
    }

    function Spinner({ size = 14 }) {
      return h(Icon, { name: 'refresh', size, className: 'sd-spin' });
    }

    function MarketTag({ market, assetType }) {
      return h('span', { className: cx('sd-tag', marketClass(market)) }, assetType === 'index' ? '指数' : marketLabel(market));
    }

    function Change({ value, suffix = '%', digits = 2, className = '' }) {
      const n = Number(value);
      const arrow = n > 0 ? 'arrowUpRight' : n < 0 ? 'arrowDownRight' : 'minus';
      return h('span', { className: cx('sd-num', toneOf(n), className), style: { display: 'inline-flex', alignItems: 'center', gap: '2px', whiteSpace: 'nowrap' } },
        h(Icon, { name: arrow, size: 10 }),
        suffix ? fmtPct(n, digits) : `${n > 0 ? '+' : ''}${fmtMoney(n, digits)}`);
    }

    function EmptyState({ icon = 'receipt', title, hint, action }) {
      return h('div', { className: 'sd-empty' },
        h('div', { className: 'sd-empty-icon' }, h(Icon, { name: icon, size: 19 })),
        h('b', null, title),
        hint ? h('span', null, hint) : null,
        action || null);
    }

    function Switch({ checked, onChange, label }) {
      return h('button', {
        type: 'button',
        role: 'switch',
        'aria-checked': checked ? 'true' : 'false',
        'aria-label': label,
        className: cx('sd-switch', checked && 'is-on'),
        style: {
          position: 'relative',
          width: 48,
          height: 28,
          padding: 0,
          margin: 0,
          border: 0,
          borderRadius: 999,
          boxSizing: 'border-box',
          appearance: 'none',
          WebkitAppearance: 'none',
          display: 'block',
          flex: 'none',
          lineHeight: 0,
          background: checked ? 'var(--sd-accent)' : 'var(--sd-line-strong)',
          cursor: 'pointer',
        },
        onClick: () => onChange(!checked),
      }, h('span', {
        style: {
          position: 'absolute',
          top: 3,
          left: checked ? 23 : 3,
          width: 22,
          height: 22,
          margin: 0,
          padding: 0,
          borderRadius: '50%',
          boxSizing: 'border-box',
          display: 'block',
          background: 'var(--sd-card)',
          boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.05)',
          transform: 'none',
          transition: 'left .18s ease',
        },
      }));
    }

    function ToolButton({ icon, children, className = '', ...props }) {
      if (children) return h('button', { type: 'button', className: cx('sd-small-btn', className), ...props }, h(Icon, { name: icon, size: 12 }), children);
      return h('button', { type: 'button', className: cx('sd-square-btn', className), 'aria-label': props.title || icon, ...props }, h(Icon, { name: icon, size: 14 }));
    }

    function Modal({ title, subtitle, children, footer, onClose, width = 480 }) {
      useEffect(() => {
        const handler = event => { if (event.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
      }, [onClose]);
      return h('div', {
        className: 'sd-modal-layer',
        role: 'dialog',
        'aria-modal': 'true',
        onMouseDown: event => { if (event.target === event.currentTarget) onClose(); },
      }, h('div', { className: 'sd-modal', style: { maxWidth: width } },
        h('div', { className: 'sd-modal-head' },
          h('div', null,
            h('div', { className: 'sd-modal-title' }, title),
            subtitle ? h('div', { className: 'sd-modal-sub' }, subtitle) : null),
          h('button', { type: 'button', className: 'sd-modal-close', onClick: onClose, 'aria-label': '关闭' }, h(Icon, { name: 'x', size: 13 }))),
        h('div', { className: 'sd-modal-body' }, children),
        footer ? h('div', { className: 'sd-modal-foot' }, footer) : null));
    }

    function Toasts({ items, dismiss }) {
      return h('div', { className: 'sd-toasts', 'aria-live': 'polite' },
        items.map(item => h('div', { key: item.id, className: cx('sd-toast', item.kind === 'error' && 'is-error') },
          h('span', { className: 'ic' }, h(Icon, { name: item.kind === 'error' ? 'alert' : 'check', size: 14 })),
          h('span', { style: { flex: 1 } }, item.text),
          h('button', { type: 'button', className: 'x', onClick: () => dismiss(item.id), 'aria-label': '关闭提示' }, h(Icon, { name: 'x', size: 11 })))));
    }

    function CandleChart({ state, currency, onRange, range, viewHeight = 330 }) {
      const [hover, setHover] = useState(null);
      const wrapRef = useRef(null);
      const candles = state.candles || [];
      const loading = state.loading;
      const error = state.error;

      const geometry = useMemo(() => {
        if (!candles.length) return null;
        const width = 820;
        const height = Math.max(280, Number(viewHeight) || 330);
        const pad = { left: 48, right: 18, top: 18, bottom: 34 };
        const plotW = width - pad.left - pad.right;
        const plotH = height - pad.top - pad.bottom;
        const priceH = plotH * 0.76;
        const volH = plotH * 0.18;
        const min = Math.min(...candles.map(c => c.low));
        const max = Math.max(...candles.map(c => c.high));
        const padPrice = (max - min || max * 0.01) * 0.08;
        const lo = min - padPrice;
        const hi = max + padPrice;
        const x = i => pad.left + (i + 0.5) * (plotW / candles.length);
        const y = price => pad.top + (hi - price) / (hi - lo) * priceH;
        const maxVol = Math.max(...candles.map(c => c.volume || 0), 1);
        const volY = v => pad.top + priceH + 22 + volH - (v / maxVol) * volH;
        const bodyW = Math.max(1.2, Math.min(9, (plotW / candles.length) * 0.64));
        const ma = period => candles.map((c, i) => {
          if (i < period - 1) return null;
          let sum = 0;
          for (let j = i - period + 1; j <= i; j += 1) sum += candles[j].close;
          return { x: x(i), y: y(sum / period) };
        }).filter(Boolean);
        const ticks = [0, 0.5, 1].map(t => lo + (hi - lo) * t);
        const dateTicks = [0, Math.floor((candles.length - 1) / 3), Math.floor((candles.length - 1) * 2 / 3), candles.length - 1];
        return { width, height, pad, plotW, plotH, priceH, volH, lo, hi, x, y, volY, bodyW, ma5: ma(5), ma20: ma(20), ticks, dateTicks, maxVol };
      }, [candles, viewHeight]);

      function move(event) {
        if (!geometry || !wrapRef.current) return;
        const rect = wrapRef.current.getBoundingClientRect();
        const relative = (event.clientX - rect.left) / rect.width * geometry.width;
        const ratio = Math.max(0, Math.min(1, (relative - geometry.pad.left) / geometry.plotW));
        setHover(Math.min(candles.length - 1, Math.floor(ratio * candles.length)));
      }

      if (loading) {
        return h('div', { className: 'sd-chart-wrap' }, h('div', { className: 'sd-chart-empty' }, h(Spinner, { size: 18 }), h('span', { style: { marginLeft: 8 } }, '正在读取历史行情…')));
      }
      if (error) {
        return h('div', { className: 'sd-chart-wrap' }, h('div', { className: 'sd-chart-empty' }, h('b', null, '历史行情暂不可用'), error));
      }
      if (!candles.length || !geometry) {
        return h('div', { className: 'sd-chart-wrap' }, h('div', { className: 'sd-chart-empty' }, h('b', null, '暂无图表'), '该证券暂时没有历史行情。'));
      }
      const hovered = hover !== null ? candles[hover] : null;
      const tipLeft = hovered ? Math.max(15, Math.min(85, ((geometry.x(hover) / geometry.width) * 100))) : 0;
      const tipTop = hovered ? Math.max(12, (geometry.y(hovered.high) / geometry.height) * 100 - 4) : 0;

      return h('div', { className: 'sd-chart-wrap', ref: wrapRef, onMouseMove: move, onMouseLeave: () => setHover(null) },
        h('svg', { className: 'sd-chart-svg', viewBox: `0 0 ${geometry.width} ${geometry.height}`, preserveAspectRatio: 'xMidYMid meet', role: 'img', 'aria-label': 'K线图' },
          geometry.ticks.map((tick, i) => h('g', { key: `tick-${i}` },
            h('line', { x1: geometry.pad.left, x2: geometry.width - geometry.pad.right, y1: geometry.y(tick), y2: geometry.y(tick), stroke: 'var(--sd-line)', strokeDasharray: '2 5' }),
            h('text', { x: 8, y: geometry.y(tick) + 3, fill: 'var(--sd-faint)', fontSize: 9, fontFamily: 'var(--sd-mono)' }, tick >= 1000 ? tick.toFixed(0) : tick.toFixed(2)))),
          h('line', { x1: geometry.pad.left, x2: geometry.width - geometry.pad.right, y1: geometry.pad.top + geometry.priceH + 22, y2: geometry.pad.top + geometry.priceH + 22, stroke: 'var(--sd-line)' }),
          candles.map((candle, i) => {
            const up = candle.close >= candle.open;
            const color = up ? 'var(--sd-up)' : 'var(--sd-down)';
            const bodyTop = geometry.y(Math.max(candle.open, candle.close));
            const bodyBottom = geometry.y(Math.min(candle.open, candle.close));
            const bodyHeight = Math.max(1, bodyBottom - bodyTop);
            return h('g', { key: candle.date },
              h('line', { x1: geometry.x(i), x2: geometry.x(i), y1: geometry.y(candle.high), y2: geometry.y(candle.low), stroke: color, strokeWidth: 0.8, opacity: .8 }),
              h('rect', { x: geometry.x(i) - geometry.bodyW / 2, y: bodyTop, width: geometry.bodyW, height: bodyHeight, fill: up ? color : color, opacity: up ? .92 : .92, rx: 0.7 }),
              h('rect', { x: geometry.x(i) - geometry.bodyW / 2, y: geometry.volY(candle.volume || 0), width: geometry.bodyW, height: Math.max(0.7, geometry.pad.top + geometry.priceH + 22 + geometry.volH - geometry.volY(candle.volume || 0)), fill: color, opacity: .3, rx: 0.6 }));
          }),
          geometry.ma5.length ? h('polyline', { points: geometry.ma5.map(p => `${p.x},${p.y}`).join(' '), fill: 'none', stroke: 'var(--sd-gold)', strokeWidth: 1.2, opacity: .8 }) : null,
          geometry.ma20.length ? h('polyline', { points: geometry.ma20.map(p => `${p.x},${p.y}`).join(' '), fill: 'none', stroke: '#7895b5', strokeWidth: 1.1, opacity: .75 }) : null,
          geometry.dateTicks.map((index, i) => h('text', {
            key: `date-${i}`,
            x: Math.max(geometry.pad.left + 8, Math.min(geometry.width - geometry.pad.right - 36, geometry.x(index))),
            y: geometry.height - 8,
            fill: 'var(--sd-faint)',
            fontSize: 8.5,
            fontFamily: 'var(--sd-mono)',
          }, candles[index]?.date?.slice(5) || '')),
          hovered ? h('line', { x1: geometry.x(hover), x2: geometry.x(hover), y1: geometry.pad.top, y2: geometry.pad.top + geometry.priceH, stroke: 'var(--sd-muted)', strokeDasharray: '3 3', opacity: .5 }) : null),
        h('div', { className: 'sd-chart-legend' },
          h('span', null, h('i', null), 'MA5'),
          h('span', null, h('i', { className: 'ma20' }), 'MA20'),
          h('span', { style: { marginLeft: 'auto' } }, state.source ? `来源 ${state.source}` : '')),
        hovered ? h('div', { className: 'sd-chart-tip', style: { left: `${tipLeft}%`, top: `${tipTop}%` } },
          h('div', { className: 'd' }, hovered.date),
          h('div', { className: 'r' }, h('span', null, '开'), h('b', null, fmtPrice(hovered.open, currency))),
          h('div', { className: 'r' }, h('span', null, '高'), h('b', null, fmtPrice(hovered.high, currency))),
          h('div', { className: 'r' }, h('span', null, '低'), h('b', null, fmtPrice(hovered.low, currency))),
          h('div', { className: 'r' }, h('span', null, '收'), h('b', null, fmtPrice(hovered.close, currency))),
          h('div', { className: 'r' }, h('span', null, '量'), h('b', null, fmtCompact(hovered.volume)))) : null);
    }


    function aggregateCandles(candles, mode) {
      if (mode === 'day' || !candles.length) return candles;
      const groups = new Map();
      for (const candle of candles) {
        const date = new Date(`${candle.date}T00:00:00Z`);
        if (Number.isNaN(date.getTime())) continue;
        let key;
        if (mode === 'month') {
          key = candle.date.slice(0, 7);
        } else {
          const offset = (date.getUTCDay() + 6) % 7;
          date.setUTCDate(date.getUTCDate() - offset);
          key = date.toISOString().slice(0, 10);
        }
        if (!groups.has(key)) groups.set(key, { date: candle.date, open: candle.open, close: candle.close, high: candle.high, low: candle.low, volume: 0 });
        const row = groups.get(key);
        row.close = candle.close;
        row.high = Math.max(row.high, candle.high);
        row.low = Math.min(row.low, candle.low);
        row.volume += Number(candle.volume) || 0;
        row.date = candle.date;
      }
      return [...groups.values()];
    }

    function MinuteChart({ state, currency, prevClose, viewHeight = 330 }) {
      const [hover, setHover] = useState(null);
      const wrapRef = useRef(null);
      const points = state.points || [];
      if (state.loading) {
        return h('div', { className: 'sd-chart-wrap' }, h('div', { className: 'sd-chart-empty' }, h(Spinner, { size: 18 }), h('span', { style: { marginLeft: 8 } }, '正在读取分时行情…')));
      }
      if (state.error) {
        return h('div', { className: 'sd-chart-wrap' }, h('div', { className: 'sd-chart-empty' }, h('b', null, '分时数据暂不可用'), state.error));
      }
      if (points.length < 2) {
        return h('div', { className: 'sd-chart-wrap' }, h('div', { className: 'sd-chart-empty' }, h('b', null, '暂无分时'), '切换到日 K 查看该证券的走势。'));
      }
      const width = 820;
      const height = Math.max(280, Number(viewHeight) || 330);
      const pad = { left: 48, right: 18, top: 18, bottom: 34 };
      const plotW = width - pad.left - pad.right;
      const plotH = height - pad.top - pad.bottom;
      const closes = points.map(point => point.price);
      const reference = Number(prevClose) || closes[0];
      const min = Math.min(...closes, reference);
      const max = Math.max(...closes, reference);
      const extra = (max - min || max * 0.01) * 0.12;
      const lo = min - extra;
      const hi = max + extra;
      const x = i => pad.left + (i / (points.length - 1)) * plotW;
      const y = price => pad.top + (hi - price) / (hi - lo) * plotH;
      const line = points.map((point, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(2)},${y(point.price).toFixed(2)}`).join(' ');
      const area = `${line} L${x(points.length - 1).toFixed(2)},${(pad.top + plotH).toFixed(2)} L${pad.left},${(pad.top + plotH).toFixed(2)} Z`;
      const ticks = [0, 0.25, 0.5, 0.75, 1].map(ratio => lo + (hi - lo) * ratio);
      const timeIndexes = [0, Math.floor((points.length - 1) * 0.25), Math.floor((points.length - 1) * 0.5), Math.floor((points.length - 1) * 0.75), points.length - 1];
      const hovered = hover === null ? null : points[hover];
      const last = points[points.length - 1];
      const positive = last.price >= reference;
      const lineColor = positive ? 'var(--sd-up)' : 'var(--sd-down)';
      const tipLeft = hovered ? Math.max(12, Math.min(88, x(hover) / width * 100)) : 0;

      function move(event) {
        if (!wrapRef.current) return;
        const rect = wrapRef.current.getBoundingClientRect();
        const relative = (event.clientX - rect.left) / rect.width * width;
        const ratio = Math.max(0, Math.min(1, (relative - pad.left) / plotW));
        setHover(Math.min(points.length - 1, Math.round(ratio * (points.length - 1))));
      }

      return h('div', { className: 'sd-chart-wrap', ref: wrapRef, onMouseMove: move, onMouseLeave: () => setHover(null) },
        h('svg', { className: 'sd-chart-svg', viewBox: `0 0 ${width} ${height}`, preserveAspectRatio: 'xMidYMid meet', role: 'img', 'aria-label': '分时图' },
          h('defs', null,
            h('linearGradient', { id: 'sd-minute-fill', x1: '0', y1: '0', x2: '0', y2: '1' },
              h('stop', { offset: '0%', stopColor: lineColor, stopOpacity: '0.18' }),
              h('stop', { offset: '100%', stopColor: lineColor, stopOpacity: '0' }))),
          ticks.map((tick, index) => h('g', { key: `tick-${index}` },
            h('line', { x1: pad.left, x2: width - pad.right, y1: y(tick), y2: y(tick), stroke: 'var(--sd-line)', strokeDasharray: '2 5' }),
            h('text', { x: 8, y: y(tick) + 3, fill: 'var(--sd-faint)', fontSize: 9, fontFamily: 'var(--sd-mono)' }, tick >= 1000 ? tick.toFixed(0) : tick.toFixed(2)))),
          h('line', { x1: pad.left, x2: width - pad.right, y1: y(reference), y2: y(reference), stroke: 'var(--sd-muted)', strokeDasharray: '4 4', opacity: .55 }),
          h('text', { x: width - pad.right + 4, y: y(reference) + 3, fill: 'var(--sd-faint)', fontSize: 8, fontFamily: 'var(--sd-mono)' }, prevClose ? Number(prevClose).toFixed(2) : ''),
          h('path', { d: area, fill: 'url(#sd-minute-fill)' }),
          h('path', { d: line, fill: 'none', stroke: lineColor, strokeWidth: 1.6 }),
          h('circle', { cx: x(points.length - 1), cy: y(last.price), r: 3, fill: lineColor, stroke: 'var(--sd-card)', strokeWidth: 2 }),
          timeIndexes.map((index, idx) => h('text', { key: `time-${idx}`, x: x(index), y: height - 8, fill: 'var(--sd-faint)', fontSize: 8.5, fontFamily: 'var(--sd-mono)', textAnchor: idx === 0 ? 'start' : idx === timeIndexes.length - 1 ? 'end' : 'middle' }, points[index]?.time || '')),
          hovered ? h('line', { x1: x(hover), x2: x(hover), y1: pad.top, y2: pad.top + plotH, stroke: 'var(--sd-muted)', strokeDasharray: '3 3', opacity: .5 }) : null),
        h('div', { className: 'sd-chart-legend' },
          h('span', null, `昨收 ${prevClose ? fmtPrice(prevClose, currency) : '—'}`),
          h('span', { style: { marginLeft: 'auto' } }, state.source ? `来源 ${state.source}` : '')),
        hovered ? h('div', { className: 'sd-chart-tip', style: { left: `${tipLeft}%`, top: '18%' } },
          h('div', { className: 'd' }, hovered.time),
          h('div', { className: 'r' }, h('span', null, '价格'), h('b', null, fmtPrice(hovered.price, currency))),
          h('div', { className: 'r' }, h('span', null, '涨跌'), h('b', { className: toneOf(hovered.price - reference) }, fmtPct((hovered.price - reference) / reference * 100)))) : null);
    }

    function Depth({ quote }) {
      if (!quote) return h('div', { className: 'sd-depth-empty' }, '选择证券后显示盘口。');
      const bids = quote.bidLevels || [];
      const asks = quote.askLevels || [];
      if (!bids.length && !asks.length) {
        return h('div', { className: 'sd-depth-empty' },
          h('div', null, '该市场公开行情暂无五档盘口。'),
          h('div', { style: { marginTop: 6 } }, '市价单将按盘口最优价加滑点撮合。'));
      }
      const maxQty = Math.max(...bids.map(row => row.volume || 0), ...asks.map(row => row.volume || 0), 1);
      const levels = [...asks.slice(0, 5).reverse(), null, ...bids.slice(0, 5)];
      return h('div', { className: 'sd-depth' },
        levels.map((level, index) => {
          if (!level) {
            return h('div', { className: 'sd-depth-mid', key: 'mid' },
              h('span', null, '最新'),
              h('b', null, fmtPrice(quote.price, quote.currency)),
              h('span', null, quote.quoteTime || '—'));
          }
          const isAsk = index < asks.length;
          return h('div', { className: cx('sd-depth-row', isAsk ? 'is-ask' : 'is-bid'), key: `${isAsk ? 'a' : 'b'}-${index}` },
            h('span', { className: 'lab' }, isAsk ? `卖 ${asks.length - index}` : `买 ${index - asks.length}`),
            h('span', { className: 'bar', style: { width: `${Math.min(100, (level.volume || 0) / maxQty * 100)}%` } }),
            h('span', { className: 'px', style: { color: isAsk ? 'var(--sd-up)' : 'var(--sd-down)' } }, fmtPrice(level.price, quote.currency)),
            h('span', { className: 'qty' }, fmtCompact(level.volume)));
        }));
    }

    function Hero({ data, refreshing, onRefresh, onTransfer, onSettings, onFinancing, onEnableOffHours }) {
      const account = data.account;
      const metrics = [
        { label: '总资产', value: fmtHeroCny(account.totalAssets), sub: `净资产 ${fmtCny(account.netAssets)}`, main: true },
        { label: '可用资金', value: fmtHeroCny(account.availableCash), sub: account.reservedCash > 0 ? `冻结 ${fmtCny(account.reservedCash)}` : '可随时买入' },
        { label: '持仓市值', value: fmtHeroCny(account.marketValueCny), sub: `${account.positionCount} 只持仓 · ${account.pendingCount} 笔待成交` },
        { label: '今日盈亏', value: fmtHeroCny(account.dayPnl).replace(/^¥/, '¥'), sub: fmtPctSmart(account.dayPnlPct), tone: toneOf(account.dayPnl) },
        { label: '累计收益', value: fmtHeroCny(account.totalPnl), sub: fmtPctSmart(account.totalPnlPct), tone: toneOf(account.totalPnl) },
        { label: '杠杆 / 负债', value: `${Number(account.leverage || 1).toFixed(2)}x`, sub: `负债 ${fmtHeroCny(account.liabilities)}` },
      ];
      const markets = ['A', 'HK', 'US'];
      const allClosed = markets.every(market => !data.session[market]?.tradeable);
      return h('header', { className: 'sd-hero' },
        h('div', { className: 'sd-hero-top' },
          h('div', { className: 'sd-brand' },
            h('div', { className: 'sd-logo' }, h(Icon, { name: 'candles', size: 24, strokeWidth: 1.65 })),
            h('div', { className: 'sd-brand-copy' },
              h('div', { className: 'sd-brand-title' }, h('b', null, '股票交易台'), h('em', null, 'EQUITY TRADING')),
              h('div', { className: 'sd-brand-sub' }, '实时行情 · 专业交易 ', h('span', { className: 'dot' }, '·'), ' 一站式账户管理'))),
          h('div', { className: 'sd-hero-spacer' }),
          h('span', { className: 'sd-hero-note' }, h(Icon, { name: 'shield', size: 11 }), 'LIVE MARKET DATA')),
        h('div', { className: 'sd-hero-stats' }, metrics.map(metric => h('div', {
          key: metric.label,
          className: cx('sd-hero-stat', metric.tone),
          onClick: metric.label === '杠杆 / 负债' ? onFinancing : undefined,
          style: metric.label === '杠杆 / 负债' ? { cursor: 'pointer' } : undefined,
        },
        h('div', { className: 'sd-stat-label' }, metric.label),
        h('div', { className: 'sd-stat-value' }, metric.value),
        h('div', { className: 'sd-stat-sub' }, metric.sub)))),
        h('div', { className: 'sd-hero-foot' },
          h('div', { className: 'sd-clocks' },
            markets.map(market => {
              const session = data.session[market];
              return h('span', { key: market, className: 'sd-clock', title: `${marketLabel(market)}：${session?.label || '—'}（${session?.localLabel || ''}）` },
                h('i', { className: cx('sd-dot', session?.tradeable && 'is-open') }),
                h('span', { className: 'mk' }, market === 'A' ? '沪深' : market === 'HK' ? '港股' : '美股'),
                h('b', null, session?.label || '—'));
            }),
            h('span', { className: 'sd-clock', title: `汇率：USD/CNY ${data.fx.usdCny}，HKD/CNY ${data.fx.hkdCny}` },
              h(Icon, { name: 'coins', size: 11 }),
              h('b', null, `USD ${Number(data.fx.usdCny).toFixed(3)}`),
              h('span', { style: { opacity: .5 } }, '/'),
              h('b', null, `HKD ${Number(data.fx.hkdCny).toFixed(3)}`))),
          h('div', { className: 'sd-hero-actions' },
            h('button', { type: 'button', className: 'sd-ghost is-gold', onClick: onTransfer }, h(Icon, { name: 'bank', size: 13 }), '银证转账'),
            h('button', { type: 'button', className: 'sd-ghost', onClick: onSettings }, h(Icon, { name: 'gear', size: 13 }), '设置'),
            h('button', { type: 'button', className: 'sd-icon-btn', onClick: onRefresh, title: '刷新行情', 'aria-label': '刷新行情' }, refreshing ? h(Spinner, { size: 14 }) : h(Icon, { name: 'refresh', size: 14 })))),
        h('div', { className: 'sd-hero-meta' },
          h('span', null, allClosed ? '全部市场休市 · 行情为最近收盘价' : `${data.sessionSummary} · 行情时间 ${data.at ? fmtShortTime(data.at) : '—'}`),
          h('span', null, `更新于 ${fmtShortTime(data.at)} · 行情 ${data.meta?.quoteSource || '腾讯证券'} · 汇率 ${data.fx.source === 'frankfurter' ? 'ECB' : '内置'}`)));
    }

    function WatchPanel({ data, selected, onSelect, onRemove, query, setQuery, results, searching, onAdd, searchOpen, setSearchOpen, inputRef, onSearchFocus, onDiscover }) {
      const account = data.account;
      const wrapRef = useRef(null);
      const listRef = useRef(null);
      const [watchScroll, setWatchScroll] = useState({ left: false, right: false });
      useEffect(() => {
        if (!searchOpen) return undefined;
        const onDown = event => {
          if (!wrapRef.current?.contains(event.target)) setSearchOpen(false);
        };
        document.addEventListener('mousedown', onDown);
        return () => document.removeEventListener('mousedown', onDown);
      }, [searchOpen, setSearchOpen]);
      useEffect(() => {
        const node = listRef.current;
        if (!node) return undefined;
        let timer = 0;
        const update = () => {
          const el = listRef.current;
          if (!el) return;
          const left = el.scrollLeft > 2;
          const right = el.scrollLeft + el.clientWidth < el.scrollWidth - 2;
          setWatchScroll(current => current.left === left && current.right === right ? current : { left, right });
        };
        const schedule = () => {
          clearTimeout(timer);
          timer = setTimeout(update, 30);
        };
        update();
        node.addEventListener('scroll', update, { passive: true });
        const observer = new ResizeObserver(schedule);
        observer.observe(node);
        window.addEventListener('resize', schedule);
        timer = setTimeout(update, 100);
        return () => {
          node.removeEventListener('scroll', update);
          observer.disconnect();
          window.removeEventListener('resize', schedule);
          clearTimeout(timer);
        };
      }, [data.watchlist.length]);
      const scrollWatch = direction => {
        const node = listRef.current;
        if (!node) return;
        node.scrollBy({ left: direction * Math.max(220, Math.round(node.clientWidth * 0.72)), behavior: 'smooth' });
      };
      return h('aside', { className: 'sd-card sd-watch-card' },
        h('div', { className: 'sd-card-head' },
          h('div', { className: 'sd-card-title' }, h(Icon, { name: 'star', size: 13 }), '自选行情'),
          h('div', { className: 'sd-watch-head-actions' },
            h('span', { className: 'sd-card-sub' }, `${data.watchlist.length} / 30`),
            h('button', { type: 'button', className: 'sd-watch-discover', onClick: onDiscover, title: '发现更多公司' }, h(Icon, { name: 'plus', size: 10 }), '发现'))),
        h('div', { className: 'sd-search-wrap', ref: wrapRef },
          h('div', { className: 'sd-search' },
            h(Icon, { name: 'search', size: 13 }),
            h('input', {
              ref: inputRef,
              value: query,
              onFocus: onSearchFocus,
              onChange: event => { setQuery(event.target.value); setSearchOpen(true); },
              onKeyDown: event => { if (event.key === 'Escape') { setSearchOpen(false); setQuery(''); } },
              placeholder: '搜索代码、名称或拼音…',
              'aria-label': '搜索证券',
            }),
            searching ? h(Spinner, { size: 12 }) : query ? h('button', { type: 'button', className: 'sd-search-clear', onClick: () => { setQuery(''); setSearchOpen(false); }, 'aria-label': '清空搜索' }, h(Icon, { name: 'x', size: 11 })) : null),
          searchOpen && query.trim() ? h('div', { className: 'sd-search-results' },
            searching && !results.length ? h('div', { className: 'sd-search-empty' }, '正在查找…') : null,
            !searching && !results.length ? h('div', { className: 'sd-search-empty' }, '没有找到匹配的 A股 / 港股 / 美股') : null,
            results.map(item => {
              const exists = data.watchlist.some(row => row.secid === item.secid);
              return h('button', { type: 'button', key: item.secid, className: 'sd-result', onClick: () => onAdd(item) },
                h('div', { className: 'sd-result-main' },
                  h('div', { className: 'sd-result-name' }, item.name),
                  h('div', { className: 'sd-result-code' }, `${item.symbol} · ${item.exchange || marketLabel(item.market)}`)),
                h('span', { className: 'sd-add-chip' }, h(Icon, { name: exists ? 'check' : 'plus', size: 11 })));
            })) : null),
        h('div', { className: 'sd-section-rule' }),
        h('div', { className: 'sd-index-list' },
          data.indices.map(entry => {
            const quote = entry.quote;
            return h('button', { type: 'button', key: entry.secid, className: 'sd-index-row', onClick: () => onSelect(entry.secid) },
              h('span', { className: 'sd-index-name' }, entry.name),
              h('span', { className: cx('sd-index-price', toneOf(quote?.changePct)) }, quote ? fmtMoney(quote.price, quote.market === 'A' ? 2 : 2) : '—'),
              h('span', { className: cx('sd-index-pct', toneOf(quote?.changePct)) }, quote ? fmtPct(quote.changePct) : '—'));
          })),
        h('div', { className: 'sd-section-rule' }),
        h('div', { className: cx('sd-watch-strip', watchScroll.left && 'has-left', watchScroll.right && 'has-right') },
          h('button', {
            type: 'button',
            className: cx('sd-watch-arrow', 'is-left', !watchScroll.left && 'is-off'),
            onClick: () => scrollWatch(-1),
            disabled: !watchScroll.left,
            title: '向左查看更多自选',
            'aria-label': '向左滚动自选',
          }, h(Icon, { name: 'chevronLeft', size: 14 })),
          h('div', { className: 'sd-watch-list', ref: listRef },
          data.watchlist.length ? data.watchlist.map(entry => {
            const quote = entry.quote;
            const active = selected === entry.secid;
            return h('div', {
              key: entry.secid,
              role: 'button',
              tabIndex: 0,
              className: cx('sd-watch-row', active && 'is-active'),
              onClick: () => onSelect(entry.secid),
              onKeyDown: event => { if (event.key === 'Enter' || event.key === ' ') onSelect(entry.secid); },
            },
            h('div', { className: 'sd-watch-row-main' },
              h('div', { className: 'sd-watch-name' }, entry.name, h(MarketTag, { market: entry.market })),
              h('div', { className: 'sd-watch-code' }, entry.symbol, h('span', { style: { opacity: .45 } }, entry.exchange || ''))),
            h('div', { className: 'sd-watch-side' },
              h('div', { className: 'sd-watch-price' }, quote ? fmtPrice(quote.price, quote.currency) : '—'),
              h('div', { className: cx('sd-watch-pct', toneOf(quote?.changePct)) }, quote ? fmtPct(quote.changePct) : '—')),
            h('button', {
              type: 'button',
              className: 'sd-watch-remove',
              title: '移出自选',
              'aria-label': `移出 ${entry.name}`,
              onClick: event => { event.stopPropagation(); onRemove(entry); },
            }, h(Icon, { name: 'x', size: 9 })));
          }) : h('div', { style: { padding: '18px 8px' } }, h(EmptyState, { icon: 'star', title: '自选还是空的', hint: '搜索一只股票，把它放进自选。' }))),
          h('button', {
            type: 'button',
            className: cx('sd-watch-arrow', 'is-right', !watchScroll.right && 'is-off'),
            onClick: () => scrollWatch(1),
            disabled: !watchScroll.right,
            title: '向右查看更多自选',
            'aria-label': '向右滚动自选',
          }, h(Icon, { name: 'chevronRight', size: 14 }))),
        h('div', { className: 'sd-add-row' },
          h('button', { type: 'button', className: 'sd-add-btn', onClick: () => inputRef.current?.focus() }, h(Icon, { name: 'plus', size: 12 }), '添加自选')),
        h('div', { className: 'sd-section-rule' }),
        h('div', { className: 'sd-watch-footer', style: { padding: '11px 14px 13px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 9.5, color: 'var(--sd-faint)' } },
          h('span', null, h('i', { className: cx('sd-dot', data.session.A?.tradeable && 'is-open'), style: { display: 'inline-block', marginRight: 5, verticalAlign: 'middle' } }), '行情更新中'),
          h('span', null, `现金 ${fmtCny(account.availableCash, 0)}`)));
    }

    function QuotePanel({ entry, quote, onOpen, onToggleWatch, onAlert, watched }) {
      if (!entry) {
        return h('section', { className: 'sd-card sd-quote-card' },
          h('div', { className: 'sd-empty' }, h(EmptyState, { icon: 'chart', title: '选择一只证券', hint: '从左侧自选或搜索开始。' })));
      }
      const price = quote?.price;
      const changePct = quote?.changePct;
      const meta = [
        { label: '今开', value: quote ? fmtPrice(quote.open, quote.currency) : '—' },
        { label: '最高', value: quote ? fmtPrice(quote.high, quote.currency) : '—' },
        { label: '最低', value: quote ? fmtPrice(quote.low, quote.currency) : '—' },
        { label: '昨收', value: quote ? fmtPrice(quote.prevClose, quote.currency) : '—' },
        { label: '成交量', value: quote ? fmtCompact(quote.volume) : '—' },
        { label: '成交额', value: quote ? fmtCompact(quote.amount) : '—' },
        { label: '换手率', value: quote?.turnoverRate ? `${Number(quote.turnoverRate).toFixed(2)}%` : '—' },
        { label: '市盈率', value: quote?.pe ? quote.pe.toFixed(2) : '—' },
        { label: '涨停', value: quote?.limitUp ? fmtPrice(quote.limitUp, quote.currency) : '—' },
        { label: '跌停', value: quote?.limitDown ? fmtPrice(quote.limitDown, quote.currency) : '—' },
        { label: '每手', value: quote ? `${quote.lotSize || lotFor(quote)} 股` : '—' },
        { label: '币种', value: quote?.currency || entry.currency || 'CNY' },
      ];
      return h('section', { className: 'sd-card sd-quote-card' },
        h('div', { className: 'sd-quote-head' },
          h('div', { className: 'sd-quote-title-wrap' },
            h('div', { className: 'sd-quote-title' },
              h('h2', null, entry.name || quote?.name),
              h(MarketTag, { market: entry.market, assetType: entry.assetType }),
              h('span', { className: 'sd-tag', style: { fontFamily: 'var(--sd-mono)', letterSpacing: '.02em' } }, entry.symbol)),
            h('div', { className: 'sd-quote-sub' },
              h('span', null, entry.market === 'A' ? '沪深交易所' : entry.market === 'HK' ? '香港交易所' : '美国市场'),
              h('span', { className: 'sd-divider' }),
              h('span', null, quote?.quoteTime ? `行情时间 ${quote.quoteTime}` : '等待行情'),
              entry.assetType === 'index' ? h('span', { className: 'sd-tag' }, '仅观察') : null)),
          h('div', { className: 'sd-quote-price-wrap' },
            h('div', { className: 'sd-big-price' }, quote ? fmtPrice(price, quote.currency) : '—'),
            h('div', { className: cx('sd-big-change', toneOf(changePct)) },
              h('span', null, quote ? `${changePct > 0 ? '+' : ''}${Number(quote.change).toFixed(quote.market === 'HK' ? 3 : 2)}` : '—'),
              h('span', null, quote ? fmtPct(changePct) : '—')),
            h('div', { className: 'sd-quote-actions' },
              h('button', { type: 'button', className: 'sd-square-btn', title: watched ? '移出自选' : '加入自选', onClick: onToggleWatch, 'aria-label': watched ? '移出自选' : '加入自选' },
                h(Icon, { name: 'star', size: 14, ...(watched ? { fill: 'currentColor' } : {}) })),
              h('button', { type: 'button', className: 'sd-square-btn', title: '设置价格提醒', onClick: onAlert, 'aria-label': '设置价格提醒' }, h(Icon, { name: 'bell', size: 14 })),
              h('button', { type: 'button', className: 'sd-square-btn', title: '展开详情', onClick: onOpen, 'aria-label': '展开详情' }, h(Icon, { name: 'arrowUpRight', size: 14 }))))),
        h('div', { className: 'sd-quote-stats' }, meta.map(item => h('div', { key: item.label, className: 'sd-quote-stat' },
          h('span', null, item.label),
          h('b', { className: cx(item.label === '涨跌' && toneOf(quote?.changePct)) }, item.value)))));
    }

    function executablePrice(quote, side) {
      if (!quote) return 0;
      const book = side === 'buy' ? quote.askLevels?.[0]?.price : quote.bidLevels?.[0]?.price;
      return Number(book) || Number(quote.price) || 0;
    }

    function TradeTicket({ entry, quote, account, fx, busy, offHoursFill, marketOpen, onSubmitIntent, slippage }) {
      const [side, setSide] = useState('buy');
      const [orderType, setOrderType] = useState('limit');
      const [price, setPrice] = useState('');
      const [qty, setQty] = useState('');
      const [useMargin, setUseMargin] = useState(false);
      const [error, setError] = useState('');
      const lot = lotFor(quote);
      const currency = quote?.currency || entry?.currency || 'CNY';
      const isIndex = entry?.assetType === 'index' || quote?.assetType === 'index';
      const available = Number(account.availableCash) || 0;
      const fxRate = fxFor(quote?.market || entry?.market, fx);
      const isA = (quote?.market || entry?.market) === 'A';
      const currentPrice = Number(quote?.price) || 0;
      const effectivePrice = orderType === 'limit' ? (Number(price) || currentPrice) : currentPrice;
      const quantity = Number(qty) || 0;
      const grossCny = effectivePrice * quantity * fxRate;
      const fees = quantity > 0 ? feeEstimate({ market: quote?.market || entry?.market, side, qty: quantity, price: effectivePrice, fxRate }) : 0;
      const totalCny = side === 'buy' ? grossCny + fees : grossCny - fees;
      const bestAsk = Number(quote?.askLevels?.[0]?.price) || currentPrice;
      const bestBid = Number(quote?.bidLevels?.[0]?.price) || currentPrice;
      const canTradeNow = Boolean(marketOpen) || Boolean(offHoursFill);
      const marketable = orderType === 'market' || (side === 'buy' ? effectivePrice >= bestAsk : effectivePrice <= bestBid);
      const canFillNow = canTradeNow && marketable;
      const marginAvailable = Math.max(0, Number(account.creditAvailable) || 0);
      const marginBorrow = side === 'buy' && useMargin ? round2(Math.max(0, totalCny - available)) : 0;
      const buyingPower = side === 'buy' && useMargin ? available + marginAvailable : available;

      useEffect(() => {
        setSide('buy');
        setUseMargin(false);
        setOrderType('limit');
        setError('');
        if (quote) {
          setPrice(String(executablePrice(quote, 'buy')));
          setQty(String(lotFor(quote)));
        } else {
          setPrice('');
          setQty('');
        }
        // The selected security defines the ticket defaults; quote ticks must
        // not overwrite a price the person is currently editing.
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [entry?.secid]);

      useEffect(() => {
        if (!quote) return;
        if (!price) setPrice(String(quote.price));
        if (!qty) setQty(String(lotFor(quote)));
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [quote?.price, quote?.lotSize]);

      function setQuantity(value) {
        setQty(String(Math.max(0, Math.floor(Number(value) || 0))));
        setError('');
      }

      function maxBuy() {
        const per = effectivePrice * fxRate * 1.006;
        return per > 0 ? Math.max(0, Math.floor(buyingPower / per / lot) * lot) : 0;
      }

      function changePrice(delta) {
        if (!quote) return;
        const current = Number(price) || quote.price;
        const digits = currency === 'HKD' ? 3 : 2;
        const next = Math.max(0, current + delta);
        setPrice(next.toFixed(digits).replace(/\.?0+$/, ''));
      }

      function submit() {
        setError('');
        if (!quote) { setError('暂时没有行情，无法下单。'); return; }
        if (isIndex) { setError('指数仅供观察，不能直接交易。'); return; }
        if (!quantity || quantity <= 0) { setError('请填写有效的委托数量。'); return; }
        if (quantity % lot !== 0) { setError(`每手 ${lot} 股，请按整手下单。`); return; }
        if (orderType === 'limit' && (!Number(price) || Number(price) <= 0)) { setError('请填写有效的限价。'); return; }
        if (side === 'buy' && !useMargin && totalCny > available + 0.01) { setError(`可用资金不足，预计需要 ${fmtCny(totalCny)}。`); return; }
        if (side === 'buy' && useMargin && marginBorrow > marginAvailable + 0.01) { setError(`融资额度不足，还需 ${fmtCny(marginBorrow - marginAvailable)}。`); return; }
        if (side === 'sell') {
          const avail = entry?.position?.availableQty || 0;
          if (quantity > avail) { setError(`可卖数量不足（可卖 ${fmtQty(avail)} 股${isA ? '，T+1 部分今日不可卖' : ''}）。`); return; }
        }
        if (side === 'buy' && isA && quote.limitUp && Number(price) > quote.limitUp + 0.001) { setError(`限价不能高于涨停价 ${fmtPrice(quote.limitUp, currency)}。`); return; }
        if (side === 'buy' && isA && quote.limitDown && Number(price) < quote.limitDown - 0.001 && orderType === 'limit') { setError(`限价不能低于跌停价 ${fmtPrice(quote.limitDown, currency)}。`); return; }
        onSubmitIntent({
          side,
          orderType,
          qty: quantity,
          limitPrice: orderType === 'limit' ? Number(price) : undefined,
          funding: side === 'buy' && useMargin ? 'margin' : 'cash',
          entry,
          quote,
          summary: { quantity, orderType, price: effectivePrice, fees, totalCny, fxRate, currency, funding: side === 'buy' && useMargin ? 'margin' : 'cash', marginBorrow },
        });
      }

      if (!entry) return null;
      if (isIndex) {
        return h('aside', { className: 'sd-card sd-trade-card' },
          h('div', { className: 'sd-card-head' }, h('div', { className: 'sd-card-title' }, h(Icon, { name: 'layers', size: 13 }), '交易'), h('span', { className: 'sd-card-sub' }, '指数仅观察')),
          h('div', { className: 'sd-empty' }, h('div', { className: 'sd-empty-icon' }, h(Icon, { name: 'lock', size: 18 })), h('b', null, '指数不能直接交易'), h('span', null, '在左侧搜索一只个股或 ETF，添加自选后即可交易。')));
      }
      if (!quote) {
        return h('aside', { className: 'sd-card sd-trade-card' },
          h('div', { className: 'sd-card-head' }, h('div', { className: 'sd-card-title' }, h(Icon, { name: 'receipt', size: 13 }), '快速下单')),
          h('div', { className: 'sd-empty' }, h(Spinner, { size: 17 }), h('span', null, '等待该证券的实时行情…')));
      }

      const holding = entry.position || null;
      const sellAvail = holding ? holding.availableQty : 0;
      return h('aside', { className: 'sd-card sd-trade-card' },
        h('div', { className: 'sd-trade-tabs' },
          h('button', { type: 'button', className: cx('sd-trade-tab', 'is-buy', side === 'buy' && 'is-active'), onClick: () => { setSide('buy'); setError(''); if (orderType === 'limit' && quote) setPrice(String(executablePrice(quote, 'buy'))); } }, '买入'),
          h('button', { type: 'button', className: cx('sd-trade-tab', 'is-sell', side === 'sell' && 'is-active'), onClick: () => { setSide('sell'); setUseMargin(false); setError(''); if (orderType === 'limit' && quote) setPrice(String(executablePrice(quote, 'sell'))); } }, '卖出')),
        h('div', { className: 'sd-trade-body' },
          h('div', { className: 'sd-field' },
            h('div', { className: 'sd-field-label' }, '委托方式', h('span', { className: 'right' }, quote.market === 'A' ? 'T+1' : 'T+0')),
            h('div', { className: 'sd-seg' },
              h('button', { type: 'button', className: orderType === 'limit' ? 'is-active' : '', onClick: () => { setOrderType('limit'); setError(''); } }, '限价'),
              h('button', { type: 'button', className: orderType === 'market' ? 'is-active' : '', onClick: () => { setOrderType('market'); setError(''); } }, '市价'))),
          h('div', { style: { display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, color: 'var(--sd-faint)', fontSize: 9 } }, h('span', { className: cx('sd-trade-hint', !canFillNow && 'is-wait') }, canFillNow ? '可立即成交' : !canTradeNow ? '休市 · 待开盘' : '排队等待'), h('span', null, orderType === 'market' ? '按盘口最优价成交' : canFillNow ? `对手价 ${fmtPrice(side === 'buy' ? bestAsk : bestBid, currency)}` : !canTradeNow ? '开盘后自动尝试撮合' : `对手价 ${fmtPrice(side === 'buy' ? bestAsk : bestBid, currency)}，可改价`)),
          side === 'buy' && Number(account.creditLimit) > 0 ? h('div', { className: 'sd-margin-row' },
            h('div', { className: 'copy' },
              h('b', null, '融资买入'),
              h('span', null, `现金不足部分自动融资，当前可用额度 ${fmtCny(marginAvailable)}。`)),
            h(Switch, { checked: useMargin, label: '融资买入', onChange: value => { setUseMargin(value); setError(''); } })) : null,
          orderType === 'limit' ? h('div', { className: 'sd-field' },
            h('div', { className: 'sd-field-label' }, '委托价格', h('span', { className: 'right' }, quote.quoteTime ? `行情 ${quote.quoteTime.slice(11)}` : '')),
            h('div', { className: 'sd-input-shell' },
              h('button', { type: 'button', className: 'sd-step-btn', onClick: () => changePrice(currency === 'HKD' ? -0.05 : -0.01), 'aria-label': '降低价格' }, h(Icon, { name: 'minus', size: 10 })),
              h('span', { className: 'prefix' }, CURRENCY_SYMBOL[currency]),
              h('input', { type: 'number', inputMode: 'decimal', value: price, step: currency === 'HKD' ? '0.001' : '0.01', onChange: event => { setPrice(event.target.value); setError(''); }, 'aria-label': '委托价格' }),
              h('span', { className: 'suffix' }, currency),
              h('button', { type: 'button', className: 'sd-step-btn', onClick: () => changePrice(currency === 'HKD' ? 0.05 : 0.01), 'aria-label': '提高价格' }, h(Icon, { name: 'plus', size: 10 }))),
            h('div', { className: 'sd-quick' }, ['买一', '卖一', '最新'].map((label, index) => h('button', {
              type: 'button',
              key: label,
              onClick: () => {
                const p = index === 0 ? (quote.bidLevels?.[0]?.price || quote.price) : index === 1 ? (quote.askLevels?.[0]?.price || quote.price) : quote.price;
                setPrice(String(p));
              },
            }, label))),
            quote.limitUp ? h('div', { style: { display: 'flex', justifyContent: 'space-between', fontSize: 9, color: 'var(--sd-faint)', marginTop: 5 } },
              h('span', null, `涨停 ${fmtPrice(quote.limitUp, currency)}`),
              h('span', null, `跌停 ${fmtPrice(quote.limitDown, currency)}`)) : null) : h('div', { className: 'sd-field' },
            h('div', { className: 'sd-field-label' }, '市价委托', h('span', { className: 'right' }, `滑点 ${Number(slippage) || 0}bp`)),
            h('div', { className: 'sd-input-shell', style: { background: 'var(--sd-card)', borderStyle: 'dashed' } },
              h('span', { style: { fontSize: 11, color: 'var(--sd-muted)' } }, '按盘口最优价 / 最新价撮合'),
              h('span', { className: 'suffix' }, '市价'))),
          h('div', { className: 'sd-field' },
            h('div', { className: 'sd-field-label' }, '委托数量', h('span', { className: 'right' }, side === 'buy' ? `可买约 ${fmtQty(maxBuy())} 股` : `可卖 ${fmtQty(sellAvail)} 股`)),
            h('div', { className: 'sd-input-shell' },
              h('button', { type: 'button', className: 'sd-step-btn', onClick: () => setQuantity(Math.max(0, quantity - lot)), 'aria-label': '减少数量' }, h(Icon, { name: 'minus', size: 10 })),
              h('input', { type: 'number', inputMode: 'numeric', value: qty, step: String(lot), onChange: event => setQuantity(event.target.value), 'aria-label': '委托数量' }),
              h('span', { className: 'suffix' }, '股'),
              h('button', { type: 'button', className: 'sd-step-btn', onClick: () => setQuantity(quantity + lot), 'aria-label': '增加数量' }, h(Icon, { name: 'plus', size: 10 }))),
            h('div', { className: 'sd-quick' }, (side === 'buy' ? [0.25, 0.5, 1] : [0.25, 0.5, 1]).map(fraction => h('button', {
              type: 'button', key: fraction, onClick: () => {
                if (side === 'buy') setQuantity(fraction === 1 ? maxBuy() : Math.floor(maxBuy() * fraction / lot) * lot);
                else setQuantity(Math.floor(sellAvail * fraction / lot) * lot);
              },
            }, fraction === 1 ? (side === 'buy' ? '最大可买' : '全部') : `${fraction * 100}%`))),
            isA ? h('div', { style: { color: 'var(--sd-faint)', fontSize: 9, marginTop: 5, lineHeight: 1.5 } }, 'A股 T+1：今日买入的股份下一个交易日可卖。') : null),
          h('div', { className: 'sd-estimate' },
            h('div', { className: 'r' }, h('span', null, side === 'buy' ? '预计成交金额' : '预计成交金额'), h('b', null, fmtCny(grossCny))),
            h('div', { className: 'r' }, h('span', null, `预计费用${quote.market === 'A' ? '（佣金/过户费/印花税）' : '（含换汇成本）'}`), h('b', null, fmtCny(fees))),
            side === 'buy' && useMargin ? h('div', { className: 'r' }, h('span', null, '其中融资'), h('b', { className: 'is-up' }, fmtCny(marginBorrow))) : null,
            h('div', { className: 'r is-total' }, h('span', null, side === 'buy' ? '预计支出' : '预计到账'), h('b', { className: toneOf(side === 'sell' ? 1 : 0) }, fmtCny(totalCny)))),
          error ? h('div', { style: { marginTop: 8, color: 'var(--sd-danger)', fontSize: 10, lineHeight: 1.5 } }, error) : null,
          h('button', {
            type: 'button',
            className: cx('sd-trade-submit', side === 'buy' ? 'is-buy' : 'is-sell'),
            disabled: busy || !quote || isIndex,
            onClick: submit,
          }, busy ? h(Spinner, { size: 14 }) : `${side === 'buy' ? '买入' : '卖出'} ${entry.name}`),
          h('div', { className: 'sd-trade-note' },
            offHoursFill ? '盘后撮合已开启：使用最近成交价。' : '休市时委托会暂存，开盘后自动尝试撮合。',
            h('br'),
            h('b', null, '委托将按交易规则撮合。'))));
    }


    function fmtQty(value) {
      const n = Number(value);
      if (!Number.isFinite(n)) return '—';
      return n.toLocaleString('zh-CN', { maximumFractionDigits: 0 });
    }

    function PositionsTab({ data, onSelect, onTrade }) {
      const positions = data.positions;
      if (!positions.length) {
        return h(EmptyState, {
          icon: 'briefcase',
          title: '还没有持仓',
          hint: '从左侧挑一只股票，按整手买入。A股 T+1，今天买入的股份明天才能卖。',
          action: h('button', { type: 'button', className: 'sd-small-btn is-accent', onClick: onTrade }, '去挑一只股票'),
        });
      }
      return h('div', { className: 'sd-table-wrap' },
        h('table', { className: 'sd-table' },
          h('thead', null, h('tr', null,
            ['证券', '持仓 / 可用', '成本 / 现价', '市值', '浮动盈亏', '今日', '仓位', '操作'].map((label, i) => h('th', { key: label, className: i > 0 ? 'num' : '' }, label)))),
          h('tbody', null, positions.map(pos => h('tr', { key: pos.secid },
            h('td', null, h('div', { className: 'sd-security-cell' },
              h('div', { className: 'name' }, pos.name, h(MarketTag, { market: pos.market })),
              h('div', { className: 'code' }, pos.symbol))),
            h('td', { className: 'num mono' }, h('div', { className: 'strong' }, fmtQty(pos.qty)), h('div', { className: 'muted' }, `可用 ${fmtQty(pos.availableQty)}`)),
            h('td', { className: 'num mono' }, h('div', null, fmtCny(pos.avgCostCny)), h('div', { className: 'muted' }, fmtPrice(pos.lastPrice, pos.currency))),
            h('td', { className: 'num mono strong' }, fmtCny(pos.marketValueCny)),
            h('td', { className: 'num mono' }, h('div', { className: cx('strong', toneOf(pos.pnlCny)) }, fmtSignedCny(pos.pnlCny)), h('div', { className: cx('muted', toneOf(pos.pnlPct)) }, fmtPct(pos.pnlPct))),
            h('td', { className: 'num mono' }, h('div', { className: cx(toneOf(pos.dayPnlCny)) }, fmtSignedCny(pos.dayPnlCny))),
            h('td', { className: 'num mono' }, h('div', null, `${Number(pos.weight || 0).toFixed(1)}%`), h('div', { className: 'sd-weight-bar', style: { width: '42px', height: 3, borderRadius: 3, background: 'var(--sd-line)', marginLeft: 'auto', marginTop: 4, overflow: 'hidden' } }, h('span', { style: { display: 'block', height: '100%', width: `${Math.min(100, Number(pos.weight || 0))}%`, background: 'var(--sd-accent)' } }))),
            h('td', { className: 'num' }, h('button', { type: 'button', className: 'sd-action-link', onClick: () => onTrade(pos.secid) }, '交易')))))));
    }

    function OrdersTab({ data, onCancel }) {
      const orders = data.orders;
      if (!orders.length) {
        return h(EmptyState, {
          icon: 'receipt',
          title: '还没有委托',
          hint: '限价单会留在委托簿里等待价格触发，休市时提交的委托会在开盘后尝试撮合。',
        });
      }
      const sorted = [...orders].sort((a, b) => (a.status === 'pending' ? -1 : 0) - (b.status === 'pending' ? -1 : 0) || new Date(b.createdAt) - new Date(a.createdAt));
      return h('div', { className: 'sd-table-wrap' },
        h('table', { className: 'sd-table' },
          h('thead', null, h('tr', null,
            ['时间', '证券', '方向', '类型 / 价格', '数量', '成交价', '状态', '费用', '操作'].map((label, i) => h('th', { key: label, className: i >= 4 ? 'num' : '' }, label)))),
          h('tbody', null, sorted.map(order => h('tr', { key: order.id },
            h('td', { className: 'mono muted' }, fmtTime(order.createdAt)),
            h('td', null, h('div', { className: 'sd-security-cell' },
              h('div', { className: 'name' }, order.name, h(MarketTag, { market: order.market })),
              h('div', { className: 'code' }, `${order.symbol} · ${order.id}`))),
            h('td', null, h('span', { className: cx('sd-side-chip', order.side === 'buy' ? 'is-buy' : 'is-sell') }, order.sideLabel)),
            h('td', { className: 'num' }, h('div', { className: 'mono' }, order.typeLabel), h('div', { className: 'muted mono' }, order.limitPrice ? fmtPrice(order.limitPrice, order.currency) : '按市价')),
            h('td', { className: 'num mono' }, fmtQty(order.qty)),
            h('td', { className: 'num mono' }, order.fillPrice ? h('div', null, fmtPrice(order.fillPrice, order.currency)) : h('span', { className: 'muted' }, '—')),
            h('td', { className: 'num' }, h('span', { className: cx('sd-status', `is-${order.status}`) }, order.statusLabel)),
            h('td', { className: 'num mono muted' }, order.feesCny ? fmtCny(order.feesCny) : '—'),
            h('td', { className: 'num' }, order.status === 'pending'
              ? h('button', { type: 'button', className: 'sd-action-link is-danger', onClick: () => onCancel(order) }, '撤单')
              : h('span', { className: 'muted' }, order.rejectReason ? order.rejectReason.slice(0, 12) : '—')))))));
    }

    function TradesTab({ data, onExport, exporting }) {
      const trades = data.trades;
      return h('div', null,
        h('div', { style: { display: 'flex', justifyContent: 'flex-end', padding: '0 13px 8px' } },
          h('button', { type: 'button', className: 'sd-small-btn', onClick: onExport, disabled: exporting },
            exporting ? h(Spinner, { size: 12 }) : h(Icon, { name: 'download', size: 12 }), '导出成交单')),
        trades.length ? h('div', { className: 'sd-table-wrap' },
          h('table', { className: 'sd-table' },
            h('thead', null, h('tr', null,
              ['成交时间', '证券', '方向', '数量', '成交价', '成交金额', '费用', '已实现盈亏'].map((label, i) => h('th', { key: label, className: i >= 3 ? 'num' : '' }, label)))),
            h('tbody', null, trades.map(trade => h('tr', { key: trade.id },
              h('td', { className: 'mono muted' }, fmtTime(trade.at)),
              h('td', null, h('div', { className: 'sd-security-cell' },
                h('div', { className: 'name' }, trade.name, h(MarketTag, { market: trade.market }), trade.funding === 'margin' ? h('span', { className: 'sd-tag', style: { color: 'var(--sd-up)', background: 'var(--sd-up-soft)' } }, '融资') : null),
                h('div', { className: 'code' }, `${trade.symbol} · ${trade.orderId}`))),
              h('td', null, h('span', { className: cx('sd-side-chip', trade.side === 'buy' ? 'is-buy' : 'is-sell') }, trade.side === 'buy' ? '买入' : '卖出')),
              h('td', { className: 'num mono' }, fmtQty(trade.qty)),
              h('td', { className: 'num mono' }, fmtPrice(trade.price, trade.currency)),
              h('td', { className: 'num mono' }, fmtCny(trade.grossCny)),
              h('td', { className: 'num mono muted' }, fmtCny(trade.feesCny)),
              h('td', { className: 'num mono' }, trade.side === 'sell' ? h('span', { className: toneOf(trade.realizedPnlCny) }, fmtSignedCny(trade.realizedPnlCny)) : h('span', { className: 'muted' }, '—'))))))) :
          h(EmptyState, { icon: 'receipt', title: '还没有成交记录', hint: '成交之后，这里会留下完整的回单、费用与已实现盈亏。' }));
    }

    function RiskGauge({ ratio, callRatio = 1.5, liquidationRatio = 1.3 }) {
      const scaleMax = 3;
      const pct = ratio === null || ratio === undefined ? 0 : Math.max(0, Math.min(100, ((Number(ratio) - 1) / (scaleMax - 1)) * 100));
      const ratioText = ratio === null ? '无负债' : Number(ratio) > scaleMax ? `>${scaleMax * 100}%` : `${(Number(ratio) * 100).toFixed(0)}%`;
      return h('div', null,
        h('div', { className: 'sd-risk-top' },
          h('span', null, '维持担保比例'),
          h('b', { className: ratio === null ? '' : ratio < liquidationRatio ? 'sd-danger-text' : ratio < callRatio ? 'is-up' : 'is-down' }, ratioText)),
        h('div', { className: 'sd-risk-track', style: { background: `linear-gradient(90deg, var(--sd-danger) 0 ${Math.max(0, Math.min(100, (liquidationRatio - 1) / 2 * 100))}%, var(--sd-warn) ${Math.max(0, Math.min(100, (liquidationRatio - 1) / 2 * 100))}% ${Math.max(0, Math.min(100, (callRatio - 1) / 2 * 100))}%, var(--sd-down) ${Math.max(0, Math.min(100, (callRatio - 1) / 2 * 100))}% 100%)` } },
          ratio !== null ? h('span', { className: 'sd-risk-marker', style: { left: `calc(${pct}% - 1px)` } }) : null),
        h('div', { className: 'sd-risk-scale' },
          h('span', null, `强平 ${(liquidationRatio * 100).toFixed(0)}%`),
          h('span', null, `警戒 ${(callRatio * 100).toFixed(0)}%`),
          h('span', null, '充足')));
        }

    function FinancingTab({ data, onBorrow, onRepay, onTransfer, onLeverage }) {
      const account = data.account;
      const riskCall = Number(account.riskCallRatio) || 1.5;
      const riskLiq = Number(account.riskLiquidationRatio) || 1.3;
      const [amount, setAmount] = useState('');
      const maxCredit = Number(account.creditAvailable) || 0;
      const active = data.loans.filter(loan => loan.status === 'active');
      const paid = data.loans.filter(loan => loan.status !== 'active');
      const quick = [10000, 50000, 100000].filter(value => value <= maxCredit);
      return h('div', { className: 'sd-fin-grid' },
        h('div', null,
          h('div', { className: 'sd-fin-stats' },
            h('div', { className: 'sd-mini-stat' }, h('span', null, '融资总额度'), h('b', null, fmtCny(account.creditLimit, 0))),
            h('div', { className: 'sd-mini-stat' }, h('span', null, '当前杠杆'), h('b', { className: Number(account.leverage) > 1.5 ? 'is-up' : '' }, `${Number(account.leverage || 1).toFixed(2)}x`)),
            h('div', { className: 'sd-mini-stat' }, h('span', null, '可用额度'), h('b', { className: 'is-down' }, fmtCny(maxCredit, 0)))),
          h('div', { className: 'sd-risk-box' },
            h(RiskGauge, { ratio: account.maintenanceRatio, callRatio: riskCall, liquidationRatio: riskLiq }),
            h('div', { className: 'sd-fin-card-sub' }, account.maintenanceRatio === null
              ? '没有融资负债，账户保持无杠杆。'
              : account.maintenanceRatio < riskLiq
                ? `已低于 ${(riskLiq * 100).toFixed(0)}% 强平线，新增买入已被风控限制，请尽快补充保证金或还款。`
                : account.maintenanceRatio < riskCall
                  ? `低于 ${(riskCall * 100).toFixed(0)}% 警戒线。注意行情波动，避免触发追保。`
                  : '担保比例安全。融资利息按日计提，随时可以提前还款。')),
          h('div', { className: 'sd-fineprint', style: { marginTop: 8 } }, `可用融资 ${fmtCny(account.creditAvailable)} · 已用融资 ${fmtCny(account.creditUsed)} · 挂单冻结额度 ${fmtCny(account.creditReserved)}`),
          h('div', { className: 'sd-settings-card', style: { marginTop: 10 } },
            h('div', { className: 'sd-fin-card-title' }, h(Icon, { name: 'layers', size: 13 }), '杠杆上限'),
            h('div', { className: 'sd-leverage-row' },
              (data.meta.leverageTiers || [{ value: 1 }, { value: 1.5 }, { value: 2 }, { value: 3 }, { value: 5 }, { value: 10 }]).map(tier => h('button', { type: 'button', key: tier.value, className: Number(account.maxLeverage) === tier.value ? 'is-active' : '', onClick: () => onLeverage(tier.value) }, `${tier.value}x`))),
            h('div', { className: 'sd-fin-card-sub' }, `当前综合杠杆 ${Number(account.leverage || 1).toFixed(2)}x · 本档年化 ${(data.meta.loanRate * 100).toFixed(2)}% · 警戒 ${(riskCall * 100).toFixed(0)}% / 强平 ${(riskLiq * 100).toFixed(0)}%。`),
            h('div', { className: 'sd-fineprint', style: { marginTop: 4 } }, Number(account.maxLeverage) >= 5 ? '高杠杆档位波动会被放大，请控制仓位。' : '高杠杆档位利率更高、警戒线更严格。'),
            h('div', { className: 'sd-fineprint', style: { marginTop: 5 } }, `挂单占用融资额度 ${fmtCny(account.creditReserved)} · 累计利息 ${fmtCny(account.loanInterest)}`)),
          h('div', { className: 'sd-settings-card' },
            h('div', { className: 'sd-fin-card-title' }, h(Icon, { name: 'coins', size: 13 }), '融资借款'),
            h('div', { className: 'sd-input-row' },
              h('div', { className: 'sd-input-shell' },
                h('span', { className: 'prefix' }, '¥'),
                h('input', { type: 'number', inputMode: 'decimal', value: amount, onChange: event => setAmount(event.target.value), placeholder: '输入借款金额', 'aria-label': '借款金额' }),
                h('span', { className: 'suffix' }, 'CNY')),
              h('button', { type: 'button', className: 'sd-small-btn is-accent', onClick: () => onBorrow(Number(amount) || 0), disabled: !maxCredit }, '借入')),
            h('div', { className: 'sd-ref-row' },
              quick.map(value => h('button', { type: 'button', key: value, onClick: () => setAmount(String(value)) }, fmtCny(value, 0))),
              h('button', { type: 'button', onClick: () => setAmount(String(maxCredit)) }, '全部额度')),
            h('div', { className: 'sd-fin-card-sub' }, `年化 ${(data.meta.loanRate * 100).toFixed(2)}% · 按日计息 · ${data.meta.loanTermDays} 天到期 · 随时提前还款。`),
            amount && Number(amount) > 0 ? h('div', { className: 'sd-analysis-stats', style: { marginTop: 9 } },
              h('div', { className: 'sd-analysis-stat' }, h('span', null, '预计日息'), h('b', null, fmtCny(Number(amount) * data.meta.loanRate / 365))),
              h('div', { className: 'sd-analysis-stat' }, h('span', null, '30 天利息'), h('b', null, fmtCny(Number(amount) * data.meta.loanRate * 30 / 365))),
              h('div', { className: 'sd-analysis-stat' }, h('span', null, '到期利息'), h('b', null, fmtCny(Number(amount) * data.meta.loanRate * data.meta.loanTermDays / 365)))) : null,
            h('div', { className: 'sd-fineprint', style: { marginTop: 6 } }, '融资买入会放大波动。利息按实际占用天数计提，请留意维持担保比例。'))),
        h('div', null,
          h('div', { className: 'sd-card-head', style: { padding: '2px 0 9px' } },
            h('div', { className: 'sd-card-title' }, h(Icon, { name: 'wallet', size: 13 }), '我的融资'),
            h('span', { className: 'sd-card-sub' }, active.length ? `${active.length} 笔计息中` : '无负债')),
          active.length ? h('div', { style: { display: 'grid', gap: 8 } }, active.map(loan => h('div', { key: loan.id, className: 'sd-settings-card', style: { padding: '11px 12px' } },
            h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 } },
              h('div', null, h('div', { style: { fontSize: 11.5, fontWeight: 600, letterSpacing: '.03em' } }, loan.id), h('div', { className: 'sd-fineprint', style: { marginTop: 3 } }, `到期 ${fmtDate(loan.dueAt)} · ${loan.daysLeft} 天 · 年化 ${(Number(loan.annualRate) * 100).toFixed(2)}%`)),
              h('div', { style: { textAlign: 'right' } }, h('div', { className: 'sd-num', style: { fontSize: 14, fontWeight: 500 } }, fmtCny(loan.principal)), h('div', { className: 'sd-fineprint' }, `利息 ${fmtCny(loan.accruedInterest)}`))),
            h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 9, paddingTop: 8, borderTop: '1px solid var(--sd-line)' } },
              h('span', { className: 'sd-fineprint' }, `合计应还 ${fmtCny(loan.totalDue)} · 到期预计利息 ${fmtCny(loan.principal * loan.annualRate * Math.max(0, loan.daysLeft) / 365)}`),
              h('button', { type: 'button', className: 'sd-small-btn', onClick: () => onRepay(loan) }, '还款'))))) : h(EmptyState, {
            icon: 'shield',
            title: '没有融资负债',
            hint: '借入资金会增加可用现金，也会按日累计利息。没有杠杆，也是一种仓位。',
          }),
          paid.length ? h('div', { style: { marginTop: 10 } }, h('div', { className: 'sd-fineprint', style: { marginBottom: 5 } }, '已结清'), paid.slice(0, 5).map(loan => h('div', { key: loan.id, style: { display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--sd-line)', fontSize: 9.5, color: 'var(--sd-faint)' } },
            h('span', null, loan.id),
            h('span', null, `本金 ${fmtCny(loan.principal)}`),
            h('span', { className: 'is-down' }, '已结清')))) : null,
          h('button', { type: 'button', className: 'sd-small-btn', style: { marginTop: 12 }, onClick: onTransfer }, h(Icon, { name: 'bank', size: 12 }), '银证转账')));
    }

    function CashTab({ data, onTransfer }) {
      const flowLabels = {
        initial: '初始资金',
        deposit: '银行转入',
        withdraw: '转出至银行',
        loan: '融资借入',
        loan_repay: '融资还款',
      };
      const flows = data.flows || [];
      return h('div', { className: 'sd-fin-grid' },
        h('div', null,
          h('div', { className: 'sd-fin-stats' },
            h('div', { className: 'sd-mini-stat' }, h('span', null, '可用现金'), h('b', { className: 'is-down' }, fmtCny(data.account.availableCash))),
            h('div', { className: 'sd-mini-stat' }, h('span', null, '冻结资金'), h('b', null, fmtCny(data.account.reservedCash))),
            h('div', { className: 'sd-mini-stat' }, h('span', null, '累计净投入'), h('b', null, fmtCny(data.account.netContributions)))),
          h('div', { className: 'sd-settings-card' },
            h('div', { className: 'sd-fin-card-title' }, h(Icon, { name: 'bank', size: 13 }), '银证转账'),
            h('div', { style: { display: 'flex', gap: 8 } },
              h('button', { type: 'button', className: 'sd-small-btn is-accent', onClick: () => onTransfer('in') }, '银行转入'),
              h('button', { type: 'button', className: 'sd-small-btn', onClick: () => onTransfer('out') }, '转出至银行')),
            h('div', { className: 'sd-fin-card-sub' }, '转入会增加账户本金和融资额度；转出会检查可用资金和担保比例。')),
          h('div', { className: 'sd-fineprint', style: { marginTop: 10 } }, '资金转入转出会同步更新本机账户余额，不连接外部银行系统。')),
        h('div', null,
          h('div', { className: 'sd-card-head', style: { padding: '2px 0 9px' } },
            h('div', { className: 'sd-card-title' }, h(Icon, { name: 'receipt', size: 13 }), '资金流水'),
            h('span', { className: 'sd-card-sub' }, `共 ${flows.length} 条`)),
          flows.length ? h('div', { style: { maxHeight: 360, overflowY: 'auto', border: '1px solid var(--sd-line)', borderRadius: 10 } },
            flows.map(flow => h('div', { key: flow.id, style: { display: 'flex', alignItems: 'center', gap: 10, padding: '9px 11px', borderBottom: '1px solid var(--sd-line)' } },
              h('div', { style: { flex: 1, minWidth: 0 } }, h('div', { style: { fontSize: 10.5 } }, flowLabels[flow.type] || flow.type), h('div', { className: 'sd-fineprint' }, `${fmtTime(flow.at)} · ${flow.note || ''}`)),
              h('div', { className: 'sd-num', style: { fontSize: 11, color: Number(flow.amountCny) > 0 ? 'var(--sd-down)' : 'var(--sd-text)' } }, `${Number(flow.amountCny) > 0 ? '+' : ''}${fmtCny(flow.amountCny)}`)))) : h(EmptyState, { icon: 'receipt', title: '还没有资金流水' })));
    }

    function AnalysisTab({ data, alerts, onRemoveAlert }) {
      const account = data.account;
      const positions = data.positions || [];
      const marketValues = { A: 0, HK: 0, US: 0 };
      for (const pos of positions) marketValues[pos.market] = (marketValues[pos.market] || 0) + Number(pos.marketValueCny || 0);
      const totalAssets = Math.max(1, account.totalAssets);
      const allocations = [
        { key: 'A', label: 'A股', value: marketValues.A },
        { key: 'HK', label: '港股', value: marketValues.HK },
        { key: 'US', label: '美股', value: marketValues.US },
        { key: 'cash', label: '现金', value: account.cash },
      ];
      const unrealized = positions.reduce((sum, pos) => sum + Number(pos.pnlCny || 0), 0);
      const sells = data.trades.filter(trade => trade.side === 'sell');
      const wins = sells.filter(trade => Number(trade.realizedPnlCny) > 0).length;
      const winRate = sells.length ? wins / sells.length * 100 : null;
      const topWeight = positions.length ? Math.max(...positions.map(pos => Number(pos.weight) || 0)) : 0;
      const topHoldings = [...positions].sort((a, b) => Number(b.marketValueCny) - Number(a.marketValueCny)).slice(0, 6);
      const feeTotal = account.totalFeesCny;
      return h('div', { className: 'sd-analysis-grid' },
        h('div', null,
          h('div', { className: 'sd-analysis-card' },
            h('div', { className: 'sd-analysis-title' }, h(Icon, { name: 'layers', size: 13 }), '资产分布', h('span', null, `总资产 ${fmtHeroCny(totalAssets)}`)),
            allocations.map(row => h('div', { className: 'sd-alloc-row', key: row.key },
              h('span', { className: 'sd-alloc-label' }, row.label),
              h('div', { className: 'sd-alloc-track' }, h('i', { className: cx('sd-alloc-fill', row.key === 'HK' && 'is-hk', row.key === 'US' && 'is-us', row.key === 'cash' && 'is-cash'), style: { width: `${Math.min(100, row.value / totalAssets * 100)}%` } })),
              h('span', { className: 'sd-alloc-value' }, h('b', null, `${(row.value / totalAssets * 100).toFixed(1)}%`), fmtCny(row.value, 0))))),
          h('div', { className: 'sd-analysis-card' },
            h('div', { className: 'sd-analysis-title' }, h(Icon, { name: 'briefcase', size: 13 }), '持仓集中度', h('span', null, `${positions.length} 只持仓`)),
            positions.length ? h('div', { className: 'sd-holdings-list' }, topHoldings.map(pos => h('div', { className: 'sd-holding-row', key: pos.secid },
              h('span', { className: 'sd-holding-name' }, pos.name, h('small', null, pos.symbol)),
              h('div', { className: 'sd-holding-bar' }, h('i', { style: { width: `${Math.min(100, Number(pos.weight) || 0)}%` } })),
              h('span', { className: 'sd-holding-value' }, `${(Number(pos.weight) || 0).toFixed(1)}%`)))) : h('div', { className: 'sd-fineprint' }, '还没有持仓，资产全部为现金。'),
            h('div', { style: { display: 'flex', justifyContent: 'space-between', marginTop: 11, paddingTop: 9, borderTop: '1px solid var(--sd-line)', fontSize: 9.5, color: 'var(--sd-muted)' } },
              h('span', null, '最大单一持仓'),
              h('b', { className: 'sd-num', style: { fontWeight: 500 } }, `${topWeight.toFixed(1)}%`)))),
        h('div', null,
          h('div', { className: 'sd-analysis-card' },
            h('div', { className: 'sd-analysis-title' }, h(Icon, { name: 'chart', size: 13 }), '收益结构'),
            h('div', { className: 'sd-analysis-stats' },
              h('div', { className: 'sd-analysis-stat' }, h('span', null, '累计收益'), h('b', { className: toneOf(account.totalPnl) }, fmtSignedCny(account.totalPnl))),
              h('div', { className: 'sd-analysis-stat' }, h('span', null, '已实现盈亏'), h('b', { className: toneOf(account.realizedPnlCny) }, fmtSignedCny(account.realizedPnlCny))),
              h('div', { className: 'sd-analysis-stat' }, h('span', null, '浮动盈亏'), h('b', { className: toneOf(unrealized) }, fmtSignedCny(unrealized))),
              h('div', { className: 'sd-analysis-stat' }, h('span', null, '累计费用'), h('b', null, fmtCny(feeTotal))))),
          h('div', { className: 'sd-analysis-card' },
            h('div', { className: 'sd-analysis-title' }, h(Icon, { name: 'receipt', size: 13 }), '交易画像'),
            h('div', { className: 'sd-analysis-stats' },
              h('div', { className: 'sd-analysis-stat' }, h('span', null, '成交笔数'), h('b', null, String(data.trades.length))),
              h('div', { className: 'sd-analysis-stat' }, h('span', null, '卖出胜率'), h('b', null, winRate === null ? '—' : `${winRate.toFixed(0)}%`)),
              h('div', { className: 'sd-analysis-stat' }, h('span', null, '待成交委托'), h('b', null, String(account.pendingCount))),
              h('div', { className: 'sd-analysis-stat' }, h('span', null, '维持担保比例'), h('b', { className: account.riskLevel === 'danger' ? 'sd-danger-text' : '' }, account.maintenanceRatio === null ? '无负债' : `${(account.maintenanceRatio * 100).toFixed(0)}%`)))),
          h('div', { className: 'sd-analysis-card' },
            h('div', { className: 'sd-analysis-title' }, h(Icon, { name: 'bell', size: 13 }), '价格提醒', h('span', null, `${alerts.length} 条`)),
            alerts.length ? alerts.map(alert => h('div', { className: 'sd-alert-row', key: alert.id },
              h('b', null, alert.name),
              h('span', null, `${alert.direction === 'above' ? '≥' : '≤'} ${CURRENCY_SYMBOL[alert.currency] || ''}${Number(alert.target).toFixed(2)}`),
              h('button', { type: 'button', onClick: () => onRemoveAlert(alert.id), 'aria-label': '删除提醒' }, h(Icon, { name: 'x', size: 10 })))) : h('div', { className: 'sd-fineprint' }, '暂无价格提醒。在个股详情右上角点击铃铛即可设置。')),
          h('div', { className: 'sd-analysis-card' },
            h('div', { className: 'sd-analysis-title' }, h(Icon, { name: 'shield', size: 13 }), '账户风险'),
            h('div', { className: 'sd-fineprint' },
              positions.length ? `当前最大持仓占比 ${topWeight.toFixed(1)}%，${topWeight > 50 ? '集中度偏高，注意单一标的波动风险。' : '仓位分散度尚可。'}` : '当前无持仓，账户无市场风险。',
              h('br'),
              `当前综合杠杆 ${Number(account.leverage || 1).toFixed(2)}x，融资负债 ${fmtCny(account.liabilities)}，维持担保比例 ${account.maintenanceRatio === null ? '—' : `${(account.maintenanceRatio * 100).toFixed(0)}%`}。`,
              h('br'),
              `累计交易费用 ${fmtCny(feeTotal)}，费用会直接减少账户收益。`))));
    }

    function SettingsTab({ data, onSave, onReset, saving }) {
      const [draft, setDraft] = useState(data.settings);
      const settingsKey = JSON.stringify(data.settings);
      useEffect(() => { setDraft(data.settings); }, [settingsKey]);
      const changed = JSON.stringify(draft) !== JSON.stringify(data.settings);
      return h('div', { className: 'sd-settings-grid' },
        h('div', null,
          h('div', { className: 'sd-settings-card' },
            h('div', { className: 'sd-fin-card-title' }, h(Icon, { name: 'clock', size: 13 }), '交易与行情'),
            h('div', { className: 'sd-toggle-row' },
              h('div', { className: 'sd-toggle-copy' }, h('b', null, '休市时也允许盘后撮合'), h('span', null, '周末或盘后也能以最近收盘价成交。开启后会绕过交易所时段。')),
              h(Switch, { checked: Boolean(draft.offHoursFill), label: '盘后撮合', onChange: value => setDraft({ ...draft, offHoursFill: value }) })),
            h('div', { className: 'sd-form-row' },
              h('span', { className: 'sd-form-label' }, '行情刷新间隔'),
              h('select', { className: 'sd-select', value: draft.autoRefreshSec, onChange: event => setDraft({ ...draft, autoRefreshSec: Number(event.target.value) }) },
                [5, 10, 15, 30, 60].map(sec => h('option', { key: sec, value: sec }, `${sec} 秒`)))),
            h('div', { className: 'sd-form-row' },
              h('span', { className: 'sd-form-label' }, '市价单滑点'),
              h('select', { className: 'sd-select', value: draft.slippageBps, onChange: event => setDraft({ ...draft, slippageBps: Number(event.target.value) }) },
                [0, 2, 5, 10, 20].map(bps => h('option', { key: bps, value: bps }, `${bps} bp`)))),
            h('div', { style: { display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 } },
              h('button', { type: 'button', className: 'sd-small-btn', onClick: () => setDraft(data.settings), disabled: !changed }, '还原'),
              h('button', { type: 'button', className: 'sd-small-btn is-accent', onClick: () => onSave(draft), disabled: !changed || saving }, saving ? h(Spinner, { size: 12 }) : h(Icon, { name: 'check', size: 12 }), '保存设置'))),
          h('div', { className: 'sd-settings-card' },
            h('div', { className: 'sd-fin-card-title' }, h(Icon, { name: 'info', size: 13 }), '规则说明'),
            h('div', { className: 'sd-fineprint' },
              'A股：每手 100 股，T+1，佣金最低 5 元，卖出收 0.05% 印花税，过户费 0.001%。',
              h('br'),
              '港股：按报价返回的每手股数，佣金 0.03%（最低 3 港元），买卖双边印花税 0.1%，另计交易费、证监会征费与结算费。',
              h('br'),
              '美股：1 股起，佣金 0，卖出计 SEC 与 TAF 费用。非人民币成交按实时汇率折算，并计 0.10% 换汇成本。',
              h('br'),
              `融资：当前档位年化 ${(data.meta.loanRate * 100).toFixed(2)}%，按日单利，180 天到期；维持担保比例低于 ${(Number(data.account.riskLiquidationRatio || 1.3) * 100).toFixed(0)}% 时会触发强平并自动偿还融资。`,
              h('br'),
              '休市判断按周末与交易时段计算，暂不包含交易所法定节假日。'))),
        h('div', null,
          h('div', { className: 'sd-settings-card' },
            h('div', { className: 'sd-fin-card-title' }, h(Icon, { name: 'shield', size: 13 }), '数据与安全'),
            h('div', { className: 'sd-fineprint' },
              `行情：${data.meta.quoteSource}，历史行情来自腾讯证券 / Nasdaq。`,
              h('br'),
              `汇率：${data.fx.source === 'frankfurter' ? 'Frankfurter / ECB' : '内置兜底汇率'}，USD/CNY ${data.fx.usdCny}，HKD/CNY ${data.fx.hkdCny}。`),
            h('div', { style: { marginTop: 10, padding: '8px 9px', borderRadius: 7, background: 'var(--sd-accent-soft)', color: 'var(--sd-accent)', fontSize: 9.5, lineHeight: 1.6 } },
              '本机账户。所有资金、持仓、委托、融资和利息仅保存在这台电脑上，行情与账户数据均在本机处理。')),
          h('div', { className: 'sd-settings-card', style: { borderColor: 'color-mix(in srgb, var(--sd-danger) 22%, var(--sd-line))' } },
            h('div', { className: 'sd-fin-card-title', style: { color: 'var(--sd-danger)' } }, h(Icon, { name: 'alert', size: 13 }), '重置账户'),
            h('div', { className: 'sd-fineprint' }, '清空持仓、委托、成交、融资和资金流水，恢复 100 万初始资金。自选列表会保留。'),
            h('button', { type: 'button', className: 'sd-small-btn is-danger', style: { marginTop: 10, color: 'var(--sd-danger)', borderColor: 'color-mix(in srgb, var(--sd-danger) 28%, var(--sd-line))' }, onClick: onReset }, '重置账户'))));
    }

    function StockApp() {
      const [data, setData] = useState(null);
      const dataRef = useRef(null);
      const [loading, setLoading] = useState(true);
      const [fatal, setFatal] = useState(null);
      const [loadError, setLoadError] = useState(null);
      const [refreshing, setRefreshing] = useState(false);
      const [selected, setSelected] = useState(() => { try { return localStorage.getItem('sd.selected') || null; } catch { return null; } });
      const selectedRef = useRef(null);
      const [tab, setTab] = useState(() => { try { return localStorage.getItem('sd.tab') || 'positions'; } catch { return 'positions'; } });
      const [chartRange, setChartRange] = useState(() => { try { return Number(localStorage.getItem('sd.range')) || 66; } catch { return 66; } });
      const [chartMode, setChartMode] = useState(() => { try { return localStorage.getItem('sd.mode') || 'day'; } catch { return 'day'; } });
      const [chartNonce, setChartNonce] = useState(0);
      const [chart, setChart] = useState({ loading: false, candles: [], points: [], error: null, source: null });
      const [chartViewHeight, setChartViewHeight] = useState(330);
      const [layoutNonce, setLayoutNonce] = useState(0);
      const [alerts, setAlerts] = useState(() => { try { const raw = JSON.parse(localStorage.getItem('sd.alerts') || '[]'); return Array.isArray(raw) ? raw : []; } catch { return []; } });
      const [query, setQuery] = useState('');
      const [searchOpen, setSearchOpen] = useState(false);
      const [searching, setSearching] = useState(false);
      const [results, setResults] = useState([]);
      const searchSeq = useRef(0);
      const inputRef = useRef(null);
      const [toasts, setToasts] = useState([]);
      const toastSeq = useRef(0);
      const toastTimers = useRef(new Map());
      const inFlight = useRef(false);
      const [busy, setBusy] = useState(false);
      const [exporting, setExporting] = useState(false);
      const [savingSettings, setSavingSettings] = useState(false);
      const [modal, setModal] = useState(null);
      const [modalBusy, setModalBusy] = useState(false);
      const [modalError, setModalError] = useState('');
      const [lastUpdated, setLastUpdated] = useState(null);

      const notify = useCallback((text, kind = 'success') => {
        const id = ++toastSeq.current;
        setToasts(current => [...current.slice(-3), { id, text, kind }]);
        const timer = setTimeout(() => {
          setToasts(current => current.filter(item => item.id !== id));
          toastTimers.current.delete(id);
        }, 4800);
        toastTimers.current.set(id, timer);
      }, []);

      useEffect(() => () => {
        for (const timer of toastTimers.current.values()) clearTimeout(timer);
      }, []);

      const applySnapshot = useCallback((snapshot) => {
        if (!snapshot) return;
        dataRef.current = snapshot;
        setData(snapshot);
        setLastUpdated(new Date());
        const pool = [
          ...(snapshot.watchlist || []),
          ...(snapshot.positions || []),
          ...(snapshot.indices || []),
        ];
        if (!selectedRef.current || !pool.some(item => item.secid === selectedRef.current)) {
          const first = snapshot.watchlist?.[0]?.secid || snapshot.positions?.[0]?.secid || snapshot.indices?.[0]?.secid || null;
          selectedRef.current = first;
          setSelected(first);
        }
        if (Array.isArray(snapshot.notifications)) {
          snapshot.notifications.forEach(item => notify(item.text, item.kind === 'error' ? 'error' : 'success'));
        }
      }, [notify]);

      const loadState = useCallback(async ({ quiet = false } = {}) => {
        if (inFlight.current) return;
        inFlight.current = true;
        if (!quiet) setRefreshing(true);
        try {
          const response = await fetch(`${API}/state`, { headers: { accept: 'application/json' }, cache: 'no-store' });
          const body = await response.json().catch(() => ({}));
          if (!response.ok || body.error) throw new Error(body.error || `行情服务返回 ${response.status}`);
          applySnapshot(body);
          setLoadError(null);
          setFatal(null);
        } catch (error) {
          setLoadError(error.message || '行情加载失败');
          if (!dataRef.current) setFatal(error.message || '行情加载失败');
        } finally {
          inFlight.current = false;
          setRefreshing(false);
          setLoading(false);
        }
      }, [applySnapshot]);

      useEffect(() => {
        loadState();
      }, [loadState]);

      useEffect(() => {
        const seconds = Math.max(5, Math.min(300, Number(data?.settings?.autoRefreshSec) || 15));
        const interval = setInterval(() => {
          if (document.visibilityState === 'visible') loadState({ quiet: true });
        }, seconds * 1000);
        const onVisible = () => { if (document.visibilityState === 'visible') loadState({ quiet: true }); };
        document.addEventListener('visibilitychange', onVisible);
        return () => {
          clearInterval(interval);
          document.removeEventListener('visibilitychange', onVisible);
        };
      }, [data?.settings?.autoRefreshSec, loadState]);

      useEffect(() => {
        selectedRef.current = selected;
      }, [selected]);

      useEffect(() => {
        try { localStorage.setItem('sd.selected', selected || ''); } catch {}
      }, [selected]);
      useEffect(() => {
        try { localStorage.setItem('sd.tab', tab); } catch {}
      }, [tab]);
      useEffect(() => {
        try { localStorage.setItem('sd.range', String(chartRange)); } catch {}
      }, [chartRange]);
      useEffect(() => {
        try { localStorage.setItem('sd.mode', chartMode); } catch {}
      }, [chartMode]);

      useEffect(() => {
        const onResize = () => setLayoutNonce(value => value + 1);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
      }, []);

      useEffect(() => {
        if (typeof ResizeObserver === 'undefined') return undefined;
        let timer = 0;
        let retries = [];
        const measure = () => {
          const root = document.querySelector('.sd-root');
          const center = root?.querySelector('.sd-center-col');
          const right = root?.querySelector('.sd-right-col');
          const quote = root?.querySelector('.sd-quote-card');
          const card = root?.querySelector('.sd-chart-card');
          const wrap = root?.querySelector('.sd-chart-wrap');
          if (!root || !center || !right || !quote || !card || !wrap) {
            setChartViewHeight(330);
            return;
          }
          if (root.clientWidth <= 860) {
            setChartViewHeight(330);
            return;
          }
          const rightH = right.getBoundingClientRect().height;
          const quoteH = quote.getBoundingClientRect().height;
          const chromeH = Math.max(70, card.getBoundingClientRect().height - wrap.getBoundingClientRect().height);
          const legendH = wrap.querySelector('.sd-chart-legend')?.getBoundingClientRect().height || 0;
          const contentW = Math.max(1, wrap.clientWidth - 12);
          const targetSvg = rightH - quoteH - 14 - chromeH - legendH - 2;
          if (targetSvg < 220) {
            setChartViewHeight(330);
            return;
          }
          const next = Math.max(330, Math.min(920, Math.round(820 * targetSvg / contentW)));
          setChartViewHeight(current => Math.abs(current - next) < 2 ? current : next);
        };
        const schedule = () => {
          clearTimeout(timer);
          timer = setTimeout(measure, 16);
        };
        const root = document.querySelector('.sd-root');
        if (!root) return undefined;
        const observer = new ResizeObserver(schedule);
        [root, root.querySelector('.sd-center-col'), root.querySelector('.sd-right-col'), root.querySelector('.sd-quote-card')]
          .filter(Boolean).forEach(node => observer.observe(node));
        window.addEventListener('resize', schedule);
        schedule();
        retries = [120, 500, 1200, 2200].map(ms => setTimeout(schedule, ms));
        return () => {
          observer.disconnect();
          window.removeEventListener('resize', schedule);
          clearTimeout(timer);
          retries.forEach(clearTimeout);
        };
      }, [data, chartMode, selected?.secid, tab, layoutNonce]);

      useEffect(() => {
        try { localStorage.setItem('sd.alerts', JSON.stringify(alerts)); } catch {}
      }, [alerts]);
      useEffect(() => {
        if (!data || !alerts.length) return;
        const pool = [...(data.watchlist || []), ...(data.positions || []), ...(data.indices || [])];
        const remaining = [];
        let changed = false;
        for (const alert of alerts) {
          const quote = pool.find(item => item.secid === alert.secid)?.quote;
          if (!quote) { remaining.push(alert); continue; }
          const hit = alert.direction === 'above' ? quote.price >= Number(alert.target) : quote.price <= Number(alert.target);
          if (hit) { notify(`价格提醒：${alert.name} 已${alert.direction === 'above' ? '突破' : '跌破'} ${fmtPrice(alert.target, quote.currency)}`, 'success'); changed = true; }
          else remaining.push(alert);
        }
        if (changed) setAlerts(remaining);
      }, [data, alerts, notify]);

      const positionMap = useMemo(() => {
        const map = new Map();
        (data?.positions || []).forEach(position => map.set(position.secid, position));
        return map;
      }, [data]);

      const watchlist = useMemo(() => (data?.watchlist || []).map(entry => ({
        ...entry,
        position: positionMap.get(entry.secid) || null,
      })), [data, positionMap]);

      const pool = useMemo(() => {
        const positions = (data?.positions || []).map(position => ({ ...position, position }));
        const indices = data?.indices || [];
        const seen = new Set();
        return [...watchlist, ...positions, ...indices].filter(item => {
          if (seen.has(item.secid)) return false;
          seen.add(item.secid);
          return true;
        });
      }, [watchlist, data]);

      const selectedEntry = useMemo(() => pool.find(item => item.secid === selected) || pool[0] || null, [pool, selected]);
      const selectedQuote = selectedEntry?.quote || null;
      const watched = Boolean(data?.watchlist?.some(item => item.secid === selectedEntry?.secid));

      const search = useCallback(async value => {
        const q = value.trim();
        if (!q) {
          setResults([]);
          setSearching(false);
          return;
        }
        const seq = ++searchSeq.current;
        setSearching(true);
        try {
          const response = await fetch(`${API}/search?q=${encodeURIComponent(q)}`, { headers: { accept: 'application/json' } });
          const body = await response.json().catch(() => ({}));
          if (!response.ok || body.error) throw new Error(body.error || '搜索失败');
          if (seq === searchSeq.current) setResults(body.results || []);
        } catch {
          if (seq === searchSeq.current) setResults([]);
        } finally {
          if (seq === searchSeq.current) setSearching(false);
        }
      }, []);

      useEffect(() => {
        if (!query.trim()) {
          setResults([]);
          setSearching(false);
          return undefined;
        }
        const timer = setTimeout(() => search(query), 280);
        return () => clearTimeout(timer);
      }, [query, search]);

      useEffect(() => {
        if (!selectedEntry?.secid) return undefined;
        let cancelled = false;
        setChart(current => ({ ...current, loading: true, error: null, candles: [], points: [] }));
        const params = new URLSearchParams({
          secid: selectedEntry.secid,
          quoteCode: selectedEntry.quoteCode || '',
          symbol: selectedEntry.symbol || '',
          name: selectedEntry.name || '',
          market: selectedEntry.market || 'A',
          assetType: selectedEntry.assetType || 'stock',
          count: String(chartMode === 'day' ? chartRange : 320),
        });
        const endpoint = chartMode === 'minute' ? 'intraday' : 'kline';
        fetch(`${API}/${endpoint}?${params.toString()}`, { headers: { accept: 'application/json' } })
          .then(async response => {
            const body = await response.json().catch(() => ({}));
            if (!response.ok || body.error) throw new Error(body.error || '暂无行情');
            if (cancelled) return;
            if (chartMode === 'minute') {
              setChart({ loading: false, candles: [], points: body.points || [], error: null, source: body.source || '' });
            } else {
              const candles = chartMode === 'day' ? (body.candles || []) : aggregateCandles(body.candles || [], chartMode);
              setChart({ loading: false, candles, points: [], error: null, source: body.source || '' });
            }
          })
          .catch(error => {
            if (cancelled) return;
            setChart({ loading: false, candles: [], points: [], error: error.message || '暂无行情', source: '' });
          });
        return () => { cancelled = true; };
      }, [selectedEntry?.secid, selectedEntry?.quoteCode, chartRange, chartMode, chartNonce]);

      const post = useCallback(async (path, payload = {}) => {
        const response = await fetch(`${API}${path}`, {
          method: 'POST',
          headers: { 'content-type': 'application/json', accept: 'application/json' },
          body: JSON.stringify(payload),
        });
        const body = await response.json().catch(() => ({}));
        if (!response.ok || body.error) throw new Error(body.error || `请求失败（${response.status}）`);
        if (body.snapshot) applySnapshot(body.snapshot);
        return body;
      }, [applySnapshot]);

      const select = useCallback(secid => {
        selectedRef.current = secid;
        setSelected(secid);
      }, []);

      const scrollToDesk = useCallback(target => {
        const node = document.querySelector(target);
        if (node) node.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, []);

      const refresh = useCallback(() => {
        setChartNonce(value => value + 1);
        loadState();
      }, [loadState]);

      const toggleWatch = useCallback(async () => {
        if (!selectedEntry || selectedEntry.assetType === 'index') return;
        if (watched) {
          try {
            const body = await post('/watchlist', { action: 'remove', secid: selectedEntry.secid });
            notify(body.message || '已移出自选');
          } catch (error) { notify(error.message, 'error'); }
        } else {
          try {
            const body = await post('/watchlist', { item: selectedEntry });
            select(selectedEntry.secid);
            notify(body.message || '已加入自选');
          } catch (error) { notify(error.message, 'error'); }
        }
      }, [selectedEntry, watched, post, notify, select]);

      const removeWatch = useCallback(async item => {
        if (busy) return;
        setBusy(true);
        try {
          const body = await post('/watchlist', { action: 'remove', secid: item.secid });
          notify(body.message || '已移出自选');
        } catch (error) { notify(error.message, 'error'); }
        finally { setBusy(false); }
      }, [busy, post, notify]);

      const addSearchResult = useCallback(async item => {
        setSearchOpen(false);
        setQuery('');
        if (dataRef.current?.watchlist?.some(row => row.secid === item.secid)) {
          select(item.secid);
          return;
        }
        setBusy(true);
        try {
          const body = await post('/watchlist', { item });
          select(item.secid);
          notify(body.message || '已加入自选');
        } catch (error) { notify(error.message, 'error'); }
        finally { setBusy(false); }
      }, [post, notify, select]);

      const openOrder = useCallback(payload => {
        setModal({ type: 'order', payload });
        setModalError('');
      }, []);

      const openBorrow = useCallback(amount => {
        if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
          notify('请先填写借款金额', 'error');
          return;
        }
        setModal({ type: 'borrow', amount: Number(amount) });
        setModalError('');
      }, [notify]);

      const openRepay = useCallback(loan => {
        setModal({ type: 'repay', loan, amount: String(loan.totalDue) });
        setModalError('');
      }, []);

      const openAlert = useCallback(() => {
        if (!selectedEntry?.quote) return;
        const base = Number(selectedEntry.quote.price) || 0;
        setModal({ type: 'alert', entry: selectedEntry, direction: 'above', price: (base * 1.01).toFixed(2) });
        setModalError('');
      }, [selectedEntry]);

      const openTransfer = useCallback(direction => {
        setModal({ type: 'transfer', direction: direction || 'in', amount: '' });
        setModalError('');
      }, []);

      const openCancel = useCallback(order => {
        setModal({ type: 'cancel', order });
        setModalError('');
      }, []);

      const openReset = useCallback(() => {
        setModal({ type: 'reset', confirm: '' });
        setModalError('');
      }, []);

      const openSettings = useCallback(() => {
        setTab('settings');
        setTimeout(() => scrollToDesk('.sd-blotter'), 30);
      }, [scrollToDesk]);

      const openDiscover = useCallback(() => {
        setModal({ type: 'discover', category: 'all' });
        setModalError('');
      }, []);

      const enableOffHours = useCallback(async () => {
        try {
          const body = await post('/settings', { offHoursFill: true, autoRefreshSec: dataRef.current?.settings?.autoRefreshSec || 15, slippageBps: dataRef.current?.settings?.slippageBps ?? 2 });
          notify('已开启盘后撮合');
        } catch (error) { notify(error.message, 'error'); }
      }, [post, notify]);

      const changeLeverage = useCallback(async value => {
        try {
          const body = await post('/leverage', { maxLeverage: value });
          notify(body.message || `杠杆上限已调整为 ${value.toFixed(1)}x`);
        } catch (error) { notify(error.message, 'error'); }
      }, [post, notify]);

      const saveSettings = useCallback(async draft => {
        setSavingSettings(true);
        try {
          const body = await post('/settings', draft);
          notify(body.message || '设置已保存');
        } catch (error) { notify(error.message, 'error'); }
        finally { setSavingSettings(false); }
      }, [post, notify]);

      const addAlert = useCallback(() => {
        if (!modal?.entry) return;
        const target = Number(modal.price);
        if (!Number.isFinite(target) || target <= 0) { setModalError('请填写有效的提醒价格'); return; }
        const quote = modal.entry.quote || {};
        setAlerts(current => [...current, {
          id: `A-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          secid: modal.entry.secid,
          symbol: modal.entry.symbol,
          name: modal.entry.name,
          currency: quote.currency || modal.entry.currency || 'CNY',
          direction: modal.direction,
          target,
          createdAt: new Date().toISOString(),
        }]);
        notify(`已设置提醒：${modal.entry.name} ${modal.direction === 'above' ? '≥' : '≤'} ${target}`);
        setModal(null);
      }, [modal, notify]);

      const confirmModal = useCallback(async () => {
        if (!modal) return;
        setModalBusy(true);
        setModalError('');
        try {
          if (modal.type === 'order') {
            const body = await post('/order', {
              secid: modal.payload.entry.secid,
              side: modal.payload.side,
              orderType: modal.payload.orderType,
              qty: modal.payload.qty,
              limitPrice: modal.payload.limitPrice,
              funding: modal.payload.funding,
            });
            notify(body.message || '委托已提交');
            const status = body.order?.status;
            setModal(null);
            if (status === 'pending') setTab('orders');
          } else if (modal.type === 'cancel') {
            const body = await post('/order/cancel', { orderId: modal.order.id });
            notify(body.message || '已撤单');
            setModal(null);
          } else if (modal.type === 'borrow') {
            const body = await post('/loan', { amount: modal.amount });
            notify(body.message || '借款到账');
            setModal(null);
            setTab('financing');
          } else if (modal.type === 'repay') {
            const body = await post('/loan/repay', { loanId: modal.loan.id, amount: modal.amount });
            notify(body.message || '还款成功');
            setModal(null);
          } else if (modal.type === 'transfer') {
            const body = await post('/transfer', { direction: modal.direction, amount: modal.amount });
            notify(body.message || '转账成功');
            setModal(null);
          } else if (modal.type === 'reset') {
            if (modal.confirm !== '重置') throw new Error('请输入“重置”两个字以确认');
            const body = await post('/reset', {});
            notify(body.message || '账户已重置');
            setModal(null);
          }
        } catch (error) {
          setModalError(error.message || '操作失败');
        } finally {
          setModalBusy(false);
        }
      }, [modal, post, notify]);

      const exportTrades = useCallback(async () => {
        setExporting(true);
        try {
          const response = await fetch(`${API}/export`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: '{}',
          });
          if (!response.ok) throw new Error('导出失败');
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `stock-desk-trades-${todayDateKey()}.csv`;
          document.body.appendChild(link);
          link.click();
          link.remove();
          URL.revokeObjectURL(url);
          notify('成交单已导出');
        } catch (error) { notify(error.message, 'error'); }
        finally { setExporting(false); }
      }, [notify]);

      if (loading && !data) {
        return h('div', { className: 'sd-root' },
          h('style', null, CSS),
          h('div', { className: 'sd-shell' },
            h('div', { className: 'sd-loading' },
              h('div', { className: 'sd-skeleton', style: { height: 248 } }),
              h('div', { className: 'sd-skeleton', style: { height: 380 } }),
              h('div', { className: 'sd-loading-copy' }, '正在连接行情与交易账户…'))));
      }

      if (fatal && !data) {
        return h('div', { className: 'sd-root' },
          h('style', null, CSS),
          h('div', { className: 'sd-shell' },
            h('div', { className: 'sd-fatal' },
              h('b', null, '交易台暂时打不开'),
              h('p', null, fatal),
              h('button', { type: 'button', className: 'sd-primary-btn', onClick: refresh }, '重新连接'))));
      }

      if (!data) return null;

      const tabs = [
        { id: 'positions', label: '持仓', count: data.positions.length },
        { id: 'orders', label: '委托', count: data.account.pendingCount },
        { id: 'trades', label: '成交', count: data.trades.length },
        { id: 'analysis', label: '分析' },
        { id: 'financing', label: '融资', count: data.loans.filter(loan => loan.status === 'active').length },
        { id: 'cash', label: '资金' },
        { id: 'settings', label: '设置' },
      ];
      const allClosed = !['A', 'HK', 'US'].some(market => data.session[market]?.tradeable);
      const riskBanner = data.account.liabilities > 0 && data.account.riskLevel !== 'safe' ? h('div', { className: cx('sd-banner', data.account.riskLevel === 'danger' ? 'is-danger' : 'is-warn') },
        h(Icon, { name: 'alert', size: 14 }),
        h('div', { className: 'sd-banner-main' },
          data.account.riskLevel === 'danger'
            ? h('span', null, h('b', null, `维持担保比例低于 ${(Number(data.account.riskLiquidationRatio || 1.3) * 100).toFixed(0)}%。`), '新增买入已被限制，建议立即还款或转入保证金。')
            : h('span', null, h('b', null, `维持担保比例低于 ${(Number(data.account.riskCallRatio || 1.5) * 100).toFixed(0)}% 警戒线。`), '市场波动可能触发追保，请留意融资负债。')),
        h('button', { type: 'button', className: 'sd-mini-btn', onClick: () => { setTab('financing'); setTimeout(() => scrollToDesk('.sd-blotter'), 30); } }, '查看融资')) : null;
      const marketBanner = allClosed && !data.settings.offHoursFill ? h('div', { className: 'sd-banner is-info' },
        h(Icon, { name: 'clock', size: 14 }),
        h('div', { className: 'sd-banner-main' }, h('b', null, '当前全部市场休市。'), ' 现在下的委托会暂存在委托簿，开盘后自动按最新行情撮合。'),
        h('button', { type: 'button', className: 'sd-mini-btn', onClick: enableOffHours }, '开启盘后撮合')) : data.settings.offHoursFill && allClosed ? h('div', { className: 'sd-banner is-warn' },
        h(Icon, { name: 'info', size: 14 }),
        h('div', { className: 'sd-banner-main' }, h('b', null, '盘后撮合已开启。'), ' 成交使用最近收盘行情。')) : null;

      const modalContent = () => {
        if (!modal) return null;
        if (modal.type === 'order') {
          const { payload } = modal;
          const summary = payload.summary;
          const sideLabel = payload.side === 'buy' ? '买入' : '卖出';
          return h(Modal, {
            title: `确认${sideLabel} ${payload.entry.name}`,
            subtitle: '委托提交后由撮合引擎按行情处理。',
            onClose: () => !modalBusy && setModal(null),
            footer: h(React.Fragment, null,
              h('button', { type: 'button', className: 'sd-modal-btn', onClick: () => setModal(null), disabled: modalBusy }, '取消'),
              h('button', { type: 'button', className: cx('sd-modal-btn', payload.side === 'buy' ? 'is-buy' : 'is-sell'), onClick: confirmModal, disabled: modalBusy }, modalBusy ? '提交中…' : `确认${sideLabel}`)),
          },
          h('div', { className: 'sd-confirm-list' },
            h('div', { className: 'sd-confirm-row' }, h('span', null, '证券'), h('b', null, `${payload.entry.name} ${payload.entry.symbol}`)),
            h('div', { className: 'sd-confirm-row' }, h('span', null, '方向 / 类型'), h('b', null, `${sideLabel} · ${payload.orderType === 'limit' ? '限价' : '市价'}`)),
            payload.side === 'buy' ? h('div', { className: 'sd-confirm-row' }, h('span', null, '资金方式'), h('b', null, payload.funding === 'margin' ? '融资买入' : '现金买入')) : null,
            h('div', { className: 'sd-confirm-row' }, h('span', null, '数量'), h('b', null, `${fmtQty(summary.quantity)} 股`)),
            h('div', { className: 'sd-confirm-row' }, h('span', null, '委托价格'), h('b', null, payload.orderType === 'limit' ? fmtPrice(summary.price, summary.currency) : '市价（含滑点）')),
            h('div', { className: 'sd-confirm-row' }, h('span', null, '预计成交金额'), h('b', null, fmtCny(summary.totalCny - (payload.side === 'buy' ? summary.fees : -summary.fees)))),
            h('div', { className: 'sd-confirm-row' }, h('span', null, '预计费用'), h('b', null, fmtCny(summary.fees))),
            payload.funding === 'margin' && summary.marginBorrow > 0 ? h('div', { className: 'sd-confirm-row' }, h('span', null, '预计融资补足'), h('b', null, fmtCny(summary.marginBorrow))) : null,
            h('div', { className: 'sd-confirm-row is-total' }, h('span', null, payload.side === 'buy' ? '预计支出' : '预计到账'), h('b', null, fmtCny(summary.totalCny)))),
          h('div', { className: 'sd-modal-note' }, allClosed && !data.settings.offHoursFill
            ? '当前休市，委托会进入委托簿，开盘后自动尝试撮合。'
            : '成交价可能因行情变动与预估不同，最终以成交回单为准。',
          modalError ? h('div', { className: 'sd-modal-error' }, modalError) : null));
        }
        if (modal.type === 'cancel') {
          return h(Modal, {
            title: '撤销委托',
            subtitle: '撤销后冻结的资金或股份会立即释放。',
            onClose: () => !modalBusy && setModal(null),
            footer: h(React.Fragment, null,
              h('button', { type: 'button', className: 'sd-modal-btn', onClick: () => setModal(null), disabled: modalBusy }, '再想想'),
              h('button', { type: 'button', className: 'sd-modal-btn is-primary', onClick: confirmModal, disabled: modalBusy }, modalBusy ? '处理中…' : '确认撤单')),
          },
          h('div', { className: 'sd-confirm-list' },
            h('div', { className: 'sd-confirm-row' }, h('span', null, '委托编号'), h('b', null, modal.order.id)),
            h('div', { className: 'sd-confirm-row' }, h('span', null, '证券'), h('b', null, `${modal.order.name} ${modal.order.symbol}`)),
            h('div', { className: 'sd-confirm-row' }, h('span', null, '数量'), h('b', null, `${fmtQty(modal.order.qty)} 股`))),
          modalError ? h('div', { className: 'sd-modal-error' }, modalError) : null);
        }
        if (modal.type === 'borrow') {
          return h(Modal, {
            title: '融资借款',
            subtitle: `年化 ${(data.meta.loanRate * 100).toFixed(2)}%，按日计息，随时可还。`,
            onClose: () => !modalBusy && setModal(null),
            footer: h(React.Fragment, null,
              h('button', { type: 'button', className: 'sd-modal-btn', onClick: () => setModal(null), disabled: modalBusy }, '取消'),
              h('button', { type: 'button', className: 'sd-modal-btn is-primary', onClick: confirmModal, disabled: modalBusy }, modalBusy ? '处理中…' : '确认借入')),
          },
          h('div', { className: 'sd-confirm-list' },
            h('div', { className: 'sd-confirm-row' }, h('span', null, '借款金额'), h('b', null, fmtCny(modal.amount))),
            h('div', { className: 'sd-confirm-row' }, h('span', null, '预计每日利息'), h('b', null, fmtCny(modal.amount * data.meta.loanRate / 365))),
            h('div', { className: 'sd-confirm-row' }, h('span', null, '期限'), h('b', null, `${data.meta.loanTermDays} 天，可提前还款`)),
            h('div', { className: 'sd-confirm-row is-total' }, h('span', null, '到账后可用资金'), h('b', null, fmtCny(data.account.availableCash + modal.amount)))),
          h('div', { className: 'sd-modal-note' }, h('b', null, '融资有风险。'), ` 利息按实际天数计入负债，维持担保比例低于 ${(riskCall * 100).toFixed(0)}% 警戒线时会限制新增买入。`),
          modalError ? h('div', { className: 'sd-modal-error' }, modalError) : null);
        }
        if (modal.type === 'repay') {
          const loan = modal.loan;
          const amount = Number(modal.amount) || 0;
          return h(Modal, {
            title: '归还融资',
            subtitle: '先还利息，再还本金。',
            onClose: () => !modalBusy && setModal(null),
            footer: h(React.Fragment, null,
              h('button', { type: 'button', className: 'sd-modal-btn', onClick: () => setModal(null), disabled: modalBusy }, '取消'),
              h('button', { type: 'button', className: 'sd-modal-btn is-primary', onClick: confirmModal, disabled: modalBusy || amount <= 0 }, modalBusy ? '处理中…' : '确认还款')),
          },
          h('div', { className: 'sd-confirm-list' },
            h('div', { className: 'sd-confirm-row' }, h('span', null, '借款编号'), h('b', null, loan.id)),
            h('div', { className: 'sd-confirm-row' }, h('span', null, '本金'), h('b', null, fmtCny(loan.principal))),
            h('div', { className: 'sd-confirm-row' }, h('span', null, '应计利息'), h('b', null, fmtCny(loan.accruedInterest))),
            h('div', { className: 'sd-confirm-row is-total' }, h('span', null, '合计应还'), h('b', null, fmtCny(loan.totalDue)))),
          h('div', { style: { display: 'flex', gap: 7, marginTop: 12 } },
            h('div', { className: 'sd-input-shell', style: { flex: 1 } },
              h('span', { className: 'prefix' }, '¥'),
              h('input', { type: 'number', value: modal.amount, onChange: event => setModal({ ...modal, amount: event.target.value }), 'aria-label': '还款金额' }),
              h('span', { className: 'suffix' }, 'CNY')),
            h('button', { type: 'button', className: 'sd-small-btn', onClick: () => setModal({ ...modal, amount: String(loan.totalDue) }) }, '全部结清')),
          modalError ? h('div', { className: 'sd-modal-error' }, modalError) : null);
        }
        if (modal.type === 'transfer') {
          return h(Modal, {
            title: '银证转账',
            subtitle: '转入会增加本金与融资额度；转出需要满足担保比例。',
            onClose: () => !modalBusy && setModal(null),
            footer: h(React.Fragment, null,
              h('button', { type: 'button', className: 'sd-modal-btn', onClick: () => setModal(null), disabled: modalBusy }, '取消'),
              h('button', { type: 'button', className: 'sd-modal-btn is-primary', onClick: confirmModal, disabled: modalBusy || !(Number(modal.amount) > 0) }, modalBusy ? '处理中…' : '确认转账')),
          },
          h('div', { className: 'sd-radio-line' },
            h('button', { type: 'button', className: modal.direction === 'in' ? 'is-active' : '', onClick: () => setModal({ ...modal, direction: 'in' }) }, '银行 → 证券'),
            h('button', { type: 'button', className: modal.direction === 'out' ? 'is-active' : '', onClick: () => setModal({ ...modal, direction: 'out' }) }, '证券 → 银行')),
          h('div', { className: 'sd-input-shell' },
            h('span', { className: 'prefix' }, '¥'),
            h('input', { type: 'number', placeholder: '输入转账金额', value: modal.amount, onChange: event => setModal({ ...modal, amount: event.target.value }), autoFocus: true, 'aria-label': '转账金额' }),
            h('span', { className: 'suffix' }, 'CNY')),
          h('div', { className: 'sd-modal-note' }, `当前可用资金 ${fmtCny(data.account.availableCash)}。`, modal.direction === 'out' && data.account.liabilities > 0 ? ` 转出后担保比例低于 ${(Number(data.account.riskCallRatio || 1.5) * 100).toFixed(0)}% 将被拒绝。` : ''),
          modalError ? h('div', { className: 'sd-modal-error' }, modalError) : null);
        }
        if (modal.type === 'discover') {
          const category = modal.category || 'all';
          const companies = DISCOVER_COMPANIES.filter(company => category === 'all' || company.market === category || company.tags.includes(category));
          const poolMap = new Map([...(data.watchlist || []), ...(data.positions || []), ...(data.indices || [])].map(item => [item.secid, item]));
          const limitReached = data.watchlist.length >= 30;
          return h(Modal, {
            title: '发现公司',
            subtitle: `按市场或主题挑选，自选上限 30 只 · 已选 ${data.watchlist.length} 只。`,
            width: 660,
            onClose: () => setModal(null),
            footer: h(React.Fragment, null,
              h('button', { type: 'button', className: 'sd-modal-btn', onClick: () => { setModal(null); setTimeout(() => inputRef.current?.focus(), 60); } }, '搜索其他公司'),
              h('button', { type: 'button', className: 'sd-modal-btn is-primary', onClick: () => setModal(null) }, '完成')),
          },
          h('div', { className: 'sd-discover-tabs' },
            DISCOVER_CATEGORIES.map(item => h('button', {
              type: 'button',
              key: item.id,
              className: cx('sd-discover-tab', category === item.id && 'is-active'),
              onClick: () => setModal({ ...modal, category: item.id }),
            }, item.label))),
          h('div', { className: 'sd-discover-hint' },
            h('span', null, `${companies.length} 家公司 · 加入后自动加载行情`),
            limitReached ? h('span', { style: { color: 'var(--sd-warn)' } }, '自选已满') : null),
          companies.length ? h('div', { className: 'sd-discover-grid' },
            companies.map(company => {
              const added = data.watchlist.some(row => row.secid === company.secid);
              const quote = poolMap.get(company.secid)?.quote;
              return h('div', { key: company.secid, className: 'sd-discover-item' },
                h('div', { className: 'sd-discover-main' },
                  h('div', { className: 'sd-discover-name' },
                    company.name,
                    h(MarketTag, { market: company.market }),
                    h('span', { className: 'sd-discover-symbol' }, company.symbol)),
                  h('div', { className: 'sd-discover-meta' },
                    company.tags.slice(0, 2).map(tag => h('span', { key: tag, className: 'sd-tag' }, DISCOVER_TAG_LABELS[tag] || tag)),
                    h('span', { className: cx('sd-discover-quote', quote && toneOf(quote.changePct)) },
                      quote ? `${fmtPrice(quote.price, quote.currency)} ${fmtPct(quote.changePct)}` : added ? '行情加载中' : '加入后加载行情'))),
                h('button', {
                  type: 'button',
                  className: cx('sd-discover-add', added && 'is-added'),
                  disabled: added || busy || (limitReached && !added),
                  onClick: () => { if (!added && !limitReached) addSearchResult(company); },
                }, added ? '已添加' : busy ? '添加中…' : '＋ 自选'));
            })) : h('div', { className: 'sd-discover-empty' }, '这个分类暂时没有推荐公司。'),
          modalError ? h('div', { className: 'sd-modal-error' }, modalError) : null);
        }
        if (modal.type === 'alert') {
          return h(Modal, {
            title: `价格提醒 · ${modal.entry.name}`,
            subtitle: '当最新价触及目标价时，会在交易台内提醒你。',
            onClose: () => setModal(null),
            footer: h(React.Fragment, null,
              h('button', { type: 'button', className: 'sd-modal-btn', onClick: () => setModal(null) }, '取消'),
              h('button', { type: 'button', className: 'sd-modal-btn is-primary', onClick: addAlert }, '保存提醒')),
          },
          h('div', { className: 'sd-radio-line' },
            h('button', { type: 'button', className: modal.direction === 'above' ? 'is-active' : '', onClick: () => setModal({ ...modal, direction: 'above', price: (Number(modal.entry.quote?.price || 0) * 1.01).toFixed(2) }) }, '价格突破上方'),
            h('button', { type: 'button', className: modal.direction === 'below' ? 'is-active' : '', onClick: () => setModal({ ...modal, direction: 'below', price: (Number(modal.entry.quote?.price || 0) * 0.99).toFixed(2) }) }, '价格跌破下方')),
          h('div', { className: 'sd-input-shell' },
            h('span', { className: 'prefix' }, CURRENCY_SYMBOL[modal.entry.quote?.currency || 'CNY']),
            h('input', { type: 'number', value: modal.price, onChange: event => setModal({ ...modal, price: event.target.value }), autoFocus: true, 'aria-label': '提醒价格' }),
            h('span', { className: 'suffix' }, modal.entry.quote?.currency || 'CNY')),
          h('div', { className: 'sd-modal-note' }, `当前最新价 ${fmtPrice(modal.entry.quote?.price, modal.entry.quote?.currency || 'CNY')}。提醒仅在交易台页面打开时触发。`),
          modalError ? h('div', { className: 'sd-modal-error' }, modalError) : null);
        }
        if (modal.type === 'reset') {
          return h(Modal, {
            title: '重置账户',
            subtitle: '这会清空除自选列表以外的全部账户数据，且无法撤销。',
            onClose: () => !modalBusy && setModal(null),
            footer: h(React.Fragment, null,
              h('button', { type: 'button', className: 'sd-modal-btn', onClick: () => setModal(null), disabled: modalBusy }, '取消'),
              h('button', { type: 'button', className: 'sd-modal-btn is-buy', onClick: confirmModal, disabled: modalBusy || modal.confirm !== '重置' }, modalBusy ? '重置中…' : '确认重置')),
          },
          h('div', { className: 'sd-modal-note', style: { marginTop: 0 } }, '在下方输入“重置”两个字以确认：'),
          h('div', { className: 'sd-input-shell', style: { marginTop: 8 } },
            h('input', { type: 'text', value: modal.confirm, onChange: event => setModal({ ...modal, confirm: event.target.value }), placeholder: '重置', autoFocus: true, 'aria-label': '确认文字' })),
          modalError ? h('div', { className: 'sd-modal-error' }, modalError) : null);
        }
        return null;
      };

      return h('div', { className: 'sd-root' },
        h('style', null, CSS),
        h('div', { className: 'sd-shell' },
          h(Hero, {
            data,
            refreshing,
            onRefresh: refresh,
            onTransfer: () => openTransfer('in'),
            onSettings: openSettings,
            onFinancing: () => { setTab('financing'); setTimeout(() => scrollToDesk('.sd-blotter'), 30); },
            onEnableOffHours: enableOffHours,
          }),
          h('div', { className: 'sd-shell-body' },
            riskBanner,
            data.dataWarning ? h('div', { className: 'sd-banner is-warn' },
              h(Icon, { name: 'alert', size: 14 }),
              h('div', { className: 'sd-banner-main' }, data.dataWarning),
              h('button', { type: 'button', className: 'sd-mini-btn', onClick: refresh }, '重试')) : null,
            loadError && !data.dataWarning ? h('div', { className: 'sd-banner is-warn' },
              h(Icon, { name: 'alert', size: 14 }),
              h('div', { className: 'sd-banner-main' }, `刷新失败：${loadError}`),
              h('button', { type: 'button', className: 'sd-mini-btn', onClick: refresh }, '重试')) : null,
            marketBanner,
            h('div', { className: 'sd-main-grid' },
              h(WatchPanel, {
                data,
                selected: selectedEntry?.secid,
                onSelect: select,
                onRemove: removeWatch,
                query,
                setQuery,
                results,
                searching,
                onAdd: addSearchResult,
                searchOpen,
                setSearchOpen,
                inputRef,
                onSearchFocus: () => { if (query.trim()) setSearchOpen(true); },
                onDiscover: openDiscover,
              }),
              h('div', { className: 'sd-center-col' },
                h(QuotePanel, {
                  entry: selectedEntry,
                  quote: selectedQuote,
                  watched,
                  onToggleWatch: toggleWatch,
                  onAlert: openAlert,
                  onOpen: () => scrollToDesk('.sd-trade-card'),
                }),
                h('section', { className: 'sd-card sd-chart-card' },
                  h('div', { className: 'sd-chart-head' },
                    h('div', { className: 'sd-chart-title' }, h(Icon, { name: 'chart', size: 13 }), chartMode === 'minute' ? '分时走势' : chartMode === 'day' ? '日 K 线' : chartMode === 'week' ? '周 K 线' : '月 K 线'),
                    selectedQuote ? h('span', { className: 'sd-chart-source' }, `${selectedEntry.symbol} · ${marketLabel(selectedEntry.market)}`) : null,
                    h('span', { className: 'sd-spacer' }),
                    h('div', { className: 'sd-range-tabs' }, CHART_MODES.map(mode => h('button', {
                      type: 'button', key: mode.id, className: cx('sd-range', chartMode === mode.id && 'is-active'), onClick: () => setChartMode(mode.id),
                    }, mode.label))),
                    chartMode === 'day' ? h('div', { className: 'sd-range-tabs' }, RANGES.map(range => h('button', {
                      type: 'button', key: range.count, className: cx('sd-range', chartRange === range.count && 'is-active'), onClick: () => setChartRange(range.count),
                    }, range.label))) : null),
                  chartMode === 'minute'
                    ? h(MinuteChart, { state: chart, currency: selectedQuote?.currency || selectedEntry.currency, prevClose: selectedQuote?.prevClose, viewHeight: chartViewHeight })
                    : h(CandleChart, { state: chart, currency: selectedQuote?.currency || selectedEntry.currency, range: chartRange, onRange: setChartRange, viewHeight: chartViewHeight }),
                  h('div', { className: 'sd-chart-legend', style: { paddingTop: 4 } },
                    h('span', null, chartMode === 'minute' ? '价格走势 · 分时' : chartMode === 'day' ? '红涨绿跌 · 前复权日线' : chartMode === 'week' ? '由日线聚合 · 周线' : '由日线聚合 · 月线'),
                    h('span', { style: { marginLeft: 'auto' } }, chart.error ? '' : chartMode === 'minute' ? `${chart.points.length} 个分时点` : `最近 ${chart.candles.length} 根 K 线`)),
                )),
              h('div', { className: 'sd-right-col' },
                h(TradeTicket, {
                  entry: selectedEntry,
                  quote: selectedQuote,
                  account: data.account,
                  fx: data.fx,
                  marketOpen: Boolean(data.session[selectedEntry.market]?.tradeable),
                  onSubmitIntent: openOrder,
                  busy: modalBusy,
                  offHoursFill: data.settings.offHoursFill,
                  slippage: data.settings.slippageBps,
                }),
                h('section', { className: 'sd-card sd-depth-card' },
                  h('div', { className: 'sd-card-head' },
                    h('div', { className: 'sd-card-title' }, h(Icon, { name: 'layers', size: 13 }), '五档盘口'),
                    h('span', { className: 'sd-card-sub' }, selectedQuote ? '盘口参考' : '—')),
                  h(Depth, { quote: selectedQuote })))),
            h('section', { className: 'sd-card sd-blotter' },
              h('div', { className: 'sd-blotter-head' },
                tabs.map(item => h('button', {
                  type: 'button', key: item.id, className: cx('sd-blotter-tab', tab === item.id && 'is-active'), onClick: () => setTab(item.id),
                }, item.label, item.count !== undefined ? h('span', { className: 'sd-count' }, item.count) : null)),
                h('span', { className: 'sd-spacer' }),
                h('div', { className: 'sd-section-tools' },
                  h('span', { style: { color: 'var(--sd-faint)', fontSize: 9, whiteSpace: 'nowrap' } }, lastUpdated ? `更新 ${fmtShortTime(lastUpdated)}` : ''),
                  h('button', { type: 'button', className: 'sd-small-btn', onClick: refresh, disabled: refreshing }, refreshing ? h(Spinner, { size: 12 }) : h(Icon, { name: 'refresh', size: 12 }), '刷新'))),
              tab === 'positions' ? h(PositionsTab, { data, onSelect: select, onTrade: secid => { if (secid) select(secid); setTimeout(() => scrollToDesk('.sd-trade-card'), 30); } }) : null,
              tab === 'orders' ? h(OrdersTab, { data, onCancel: openCancel }) : null,
              tab === 'trades' ? h(TradesTab, { data, onExport: exportTrades, exporting }) : null,
              tab === 'analysis' ? h(AnalysisTab, { data, alerts, onRemoveAlert: id => setAlerts(current => current.filter(alert => alert.id !== id)) }) : null,
              tab === 'financing' ? h(FinancingTab, { data, onBorrow: openBorrow, onRepay: openRepay, onTransfer: () => openTransfer('in'), onLeverage: changeLeverage }) : null,
              tab === 'cash' ? h(CashTab, { data, onTransfer: openTransfer }) : null,
              tab === 'settings' ? h(SettingsTab, { data, onSave: saveSettings, onReset: openReset, saving: savingSettings }) : null),
            h('footer', { className: 'sd-footer' },
              h('span', null, h('b', null, '股票交易台'), ' · 实时行情 · 本机账本。不连接券商、不发送真实委托；行情可能延迟，不构成投资建议。'),
              h('span', null, '行情：腾讯证券公开接口 · 历史：腾讯证券 / Nasdaq · 汇率：Frankfurter / ECB'))),
        ),
        h(Toasts, { items: toasts, dismiss: id => setToasts(current => current.filter(item => item.id !== id)) }),
        modalContent());
    }

    function StockIcon({ size = 22 }) {
      return h('svg', {
        width: size,
        height: size,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 1.7,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        'aria-hidden': 'true',
      },
      h('path', { d: 'M4 19h16' }),
      h('path', { d: 'M6.5 15.5 10 12l2.6 2.2L18.5 8' }),
      h('path', { d: 'M15.2 8h3.3v3.3' }),
      h('path', { d: 'M8 5v2M8 17v2' }),
      h('rect', { x: 6.5, y: 7, width: 3, height: 7, rx: 1 }));
    }

    const inject = ['slots'];

    function apply(ctx) {
      ctx.effect(() => {
        const main = ctx.slots.inject('main', () => ctx.slots.register({
          name: 'main',
          key: PANEL_ID,
        }, StockApp));
        const sidebar = ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
          name: 'sidebar.panellist',
          id: PANEL_ID,
          order: 12,
          label: '股票交易台',
        }, StockIcon));
        return () => {
          if (typeof sidebar === 'function') sidebar();
          if (typeof main === 'function') main();
        };
      }, 'dsh-stock-desk: panel entry');
    }

    return { inject, apply, StockApp };
  },
});
