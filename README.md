# 股票交易台 · DSH Equity Desk

![股票交易台界面概览](docs/preview.svg)

一个运行在 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) 里的本机股票交易台：接入公开行情，提供 A股 / 港股 / 美股的委托、成交、持仓、费用、融资与杠杆管理。

> **重要说明：这是本机模拟账本，不连接任何券商，不发送真实委托，也不处理真实资金。**
> 行情来自公开接口，可能延迟、缺失或中断；杠杆和强制平仓会放大风险。仅用于学习、研究与界面体验，不构成投资建议。

## 功能

- **真实公开行情**：A股 / 港股 / 美股报价，腾讯证券公开行情与 Nasdaq 历史 K 线；Frankfurter / ECB 汇率。
- **按市场规则撮合**：A股 T+1、每手 100 股、涨跌停校验；港股按行情返回的每手股数；美股 1 股起；A股红涨绿跌。
- **费用模型**：A股佣金（最低 5 元）、过户费、卖出印花税；港股佣金/印花税/交易费/证监会征费/结算费；美股 SEC / TAF；非人民币成交计换汇成本。
- **委托与风控**：市价/限价、冻结资金与股份、撤单、休市暂存、开盘自动撮合、滑点、30 天有效委托。
- **杠杆融资**：1x / 1.5x / 2x / 3x / 5x / 10x 六档；融资买入自动补足现金缺口；按档年化 6.88%–15.88% 计息；维持担保比例和强平逻辑。
- **发现公司**：自选行情右上角「发现」打开公司库，按 A股 / 港股 / 美股 / 科技 / 消费 / 新能源 / 金融 / 医药 / 高股息筛选 44 家公司，一键加入自选。
- **图表与界面**：分时 / 日 K / 周 K / 月 K、MA5/MA20、五档盘口、价格提醒、持仓分析、成交单 CSV 导出；按 DSH 容器宽度自适应，深色/浅色主题。
- **本机持久化**：账户状态保存在 `~/.dsh/stock-desk/state.json`，关闭 DSH 后再次打开仍然保留。

## 环境要求

- DeepSeek Harness `>=0.2.2-rc.3 <0.3.0`（开发者预览期，升级 DSH 前请先查看兼容性）
- Node.js 20+
- 可访问腾讯证券、Nasdaq、Frankfurter 公开接口的网络环境

## 安装

### 从 GitHub Release / tarball

下载 Release 里的 `dsh-equity-desk-0.1.0.tgz`，然后在普通 DSH profile 中安装：

```bash
dsh plugin --profile <profile> add /path/to/dsh-equity-desk-0.1.0.tgz
```

重启 DSH 后，左侧栏会出现「股票交易台」。

### 从 GitHub 源码安装

```bash
dsh plugin --profile <profile> add "github:upinking/dsh-equity-desk#v0.1.0"
```

源码安装不需要构建步骤。Desktop 托管的 profile 请通过 DSH 的插件管理界面安装，不要直接用 CLI 改 Desktop profile。

### 通过「发现」索引安装

在 DSH 的「插件 → 发现 → 添加索引源」中添加：

```text
https://upinking.github.io/dsh-equity-desk/index.json
```

然后搜索「股票交易台」安装。索引是第三方内容，安装前请确认来源。

> 不要与旧的 `dsh-stock-desk` 本地包同时启用；两者使用同一个侧栏面板 ID，会互相覆盖。

## 使用

1. 打开左侧栏的「股票交易台」。
2. 在自选行情里选择标的，或用搜索框添加代码/名称/拼音。
3. 点「发现」从分类公司库中添加更多公司；自选上限 30 只。
4. 在右侧交易卡选择买入/卖出、限价/市价、数量和资金方式，确认后由本机撮合引擎处理。
5. 「融资」页可设置杠杆上限、借款/还款；「持仓 / 委托 / 成交 / 分析 / 资金 / 设置」查看账户。

## 数据与隐私

- 行情：腾讯证券公开接口（A股 / 港股 / 美股）与 Nasdaq 历史接口。
- 汇率：Frankfurter / ECB。
- 账户、委托、成交、融资和自选 **只写入本机** `~/.dsh/stock-desk/state.json`，不上传到本插件作者的服务器。
- 插件会向上述公开行情/汇率接口发起网络请求；不会连接券商，不会发送真实委托。
- 公开接口可能变更或限制访问；行情延迟、缺失和接口不可用都可能发生。

## 风险提示

本插件不提供投资建议。融资、杠杆、强平和行情延迟都可能造成损失；本项目仅用于学习、研究和产品原型，不应作为真实交易依据。请勿将本机账本中的数字误认为真实资产。

## 开发

```text
index.js            Host 半片：JSON API、行情抓取、状态持久化、鉴权
lib/market.js       市场时段、腾讯行情解析、费用与交易规则
lib/engine.js       账户、委托撮合、T+1、融资与快照计算
client.js           浏览器半片：侧栏入口与交易台 UI
cordis.patch.yml    DSH bundle patch
```

本地开发 profile 可以用：

```bash
dsh plugin --profile <dev-profile> add /path/to/dsh-equity-desk-release
```

## License

MIT。见 [LICENSE](LICENSE)。
