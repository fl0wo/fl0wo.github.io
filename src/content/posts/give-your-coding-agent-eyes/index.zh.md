---
title: '给你的编程智能体一双眼睛:Cloudflare Skills、可观测性 MCP 与本地优先的 TDD'
published: 2026-07-04
draft: false
tags: ['claude-code', 'cloudflare', 'agentic-coding', 'tdd', 'observability', 'vitest']
toc: true
coverImage:
  src: './blog1.png'
  alt: '素描风格插画:一个机器人雕塑家正在雕刻大理石胸像,左侧是带有日志、指标和追踪的 Cloudflare 可观测性仪表盘,右侧是显示测试全部通过、mock 和 SQLite 数据库的本地优先 TDD 面板'
---

编程智能体不知疲倦、速度飞快——但默认是「瞎」的。这篇文章讲的是我在自己的 Cloudflare Workers 项目里接入的两条反馈回路,它们让 Claude Code 能够*看见*我的代码究竟做了什么:一条是它可以自行查询的生产日志,另一条是能在几秒内模拟整个平台——Durable Objects、SQLite、R2、第三方 API——的本地测试套件。这是我在智能体编程领域找到的最接近「银弹」的东西。

## 失明的雕塑家

最近我看了 Salvatore Sanfilippo(antirez)的一个视频——[*"Il trucco decisivo (davvero) per lavorare coi coding agent"*](https://youtu.be/TJ6ruN-o0PA)——它把我几个月来一直在琢磨却说不清楚的东西讲透了。这个比喻的功劳完全归他;如果你懂意大利语,强烈建议去看看。

他的论证是这样的。关于编程智能体,你听过的所有标准建议无非是:写精确的规格说明、用非强制性的语言分享你的设计直觉、保持代码库整洁、在注释里写清代码中的*张力*而不只是机械描述。全对,也全都有用。但 LLM 智能体有一个几乎没人谈起的特性,而它恰恰是改变一切的那个:**韧性(tenacity)**。智能体会尝试、重试、再重试,速度快到没有任何人类能够匹敌。每次失败的尝试只消耗它几秒钟,而不是一个下午的干劲。

接下来是他那个让我念念不忘的比喻。想象一位不知疲倦的工匠站在一块大理石前。他甚至可以时间倒流:凿错了,倒回去,重来,永无止境。他的工具很粗糙——他没法像米开朗基罗那样雕刻,只能扔石头——但他从不停歇,也永不疲倦。只要尝试的次数足够多,他终究能做出些了不起的东西。

除非他是瞎的。

如果这位工匠*看不见*大理石,那么再多的韧性和时间倒流都无济于事。他的每次尝试都无法从上一次的结果中获得任何信息。他只是在往黑暗里扔石头。

这就是没有反馈回路的编程智能体。也正因如此,我不再优化我的提示词,转而开始优化智能体的*感官*。

## 两种视力

一个编程智能体需要看见两样不同的东西:

1. **代码实际做了什么**——生产环境的行为:错误、日志、时间线、11:51 那个失败的请求以及它前后发生的一切。
2. **代码将会做什么**——它刚刚做出的改动在上线前会产生什么后果:流程还能不能跑通,数据库最终状态对不对,我们调用第三方 API 的方式是不是和我们以为的一致。

在 Cloudflare 上,这两件事现在都是智能体可以*自主*完成的,不需要我在仪表盘里点来点去,也不需要我看护一个 staging 环境。前者来自 [Cloudflare 的 skills 和 MCP 服务器](https://developers.cloudflare.com/agent-setup/claude-code/);后者来自 `@cloudflare/vitest-pool-workers` 以及一套刻意采用本地优先架构的测试体系。

下面我用自己项目里的真实材料(略作匿名化处理)来展示这两条回路:这是一个跑在 Workers 上、对接加密货币交易所的多租户平台——Hono API、带 SQLite 的 Durable Objects、R2、D1、drizzle-orm,应有尽有。

## 第一部分:让智能体读懂生产环境

### 配置

Cloudflare 为 Claude Code 提供了官方 skills——针对 Workers、Durable Objects、wrangler、Agents SDK 等的上下文指导模块。它们遵循「检索优先」的理念:与其相信模型在 2024 年记住的平台知识,skill 会告诉它去查最新资料。

:::tip
在 Claude Code 里安装这些 skills 只需要两条命令:

```shell
/plugin marketplace add cloudflare/skills
/plugin install cloudflare@cloudflare
```
:::

::github{repo="cloudflare/skills"}

接下来才是真正给我的智能体装上生产环境「眼睛」的部分:**Workers Observability MCP 服务器**。一条命令:

```shell title="添加可观测性 MCP 服务器"
claude mcp add cloudflare-observability --transport http https://observability.mcp.cloudflare.com/mcp
```

通过 `/mcp` 完成认证(它会针对你的 Cloudflare 账号运行自己的 OAuth 流程),然后你的智能体就能查询你的 Workers 在过去七天里输出的每一行日志:过滤器、全文检索、分组统计、百分位计算。这不是靠 `wrangler tail` 守株待兔盼着 bug 再现——而是*历史*生产遥测数据,以结构化形式随时可查。

### 实战故事

下面这件事让我彻底信服。我们用于连接用户交易所账户的 OAuth 流程在生产环境开始报错:

```txt
OAuth completion failed: <Exchange> API error: Temporary lockout
```

HTTP 400,连接被报告为失败。但奇怪的是……API key *确实*在交易所那边创建成功了,权限范围也完全正确。用户在自己的账户里都能看到它。有个东西在把成功说成失败。

换作以前的我,得在仪表盘里耗上一整晚:按 URL 过滤、眯着眼对时间戳、点开十五条日志、手工关联。这次我只是把一条示例日志粘贴进 Claude Code,让它去调查。

它自主完成的那一系列动作,才是真正有意思的地方:

**首先,它在碰日志之前先读了代码。** 它定位到了确切的抛错位置:我们的回调创建了 API key 之后,立刻调用交易所的私有余额接口作为「验证」步骤——并把*任何*错误都当作致命错误处理。钱包从未被持久化。key 在交易所那边好端端地存在着;是我们自己把它扔掉了,还告诉用户失败了。

**接着,它去日志里验证假设。** 我给的示例日志里有一个 ULID 格式的 ID。智能体从中解码出了时间戳(ULID 内嵌毫秒级时间——说实话我之前都不知道),得到了准确的失败时刻,然后查询了它前后的一个时间窗口:

```json title="One of the agent's observability queries (simplified)"
{
  "view": "events",
  "timeframe": { "from": "…T10:30:00Z", "to": "…T12:10:00Z" },
  "parameters": {
    "filters": [
      { "key": "$metadata.service", "operation": "eq", "value": "workers-prod" },
      { "key": "$metadata.level",   "operation": "eq", "value": "error" }
    ],
    "needle": { "value": "lockout" }
  }
}
```

**然后它拉远视角,做了分组统计。** 它没有死盯着单个事件,而是按 `$metadata.trigger` 对整周的数据做了分组计数。结果就是铁证:「Temporary lockout」这个错误压根不是 OAuth 的问题。它出现在*四个互不相关的子系统*里——余额刷新接口、充值地址接口、一个 cron 任务、一个做提现轮询的 Durable Object alarm。这是交易所那边账户级别的限流状态,在 OAuth 回调运行之前就已经存在了。一把崭新的、完全有效的 API key,一头撞进了一间早已上锁的房间。

它重建出来的时间线读起来就像侦探的白板:

```txt title="The timeline the agent reconstructed from production logs"
11:39  burst of "Invalid key" errors    (a stored wallet with a dead key, hammered by balance refresh)
11:45  cron job hits "Temporary lockout"  ← account already locked, before any OAuth
11:51  OAuth connect: key created OK → balance verification → "Temporary lockout" → 400
11:56  user retries → 500 "Missing idempotency key"   ← a *second*, unrelated bug
11:57  user retries → 500
11:57  user retries → 500
```

一路查下来,它还顺手发现了两个我没让它找的 bug:重试路径之所以返回 500,是因为缺了一个 cookie 而错误处理没有覆盖这种情况(所以前端组件连失败消息都没收到);另外一个 `* * * * *` 的 cron 每分钟往日志里灌几百条无害的警告——这件事的代价比以前更大了,因为日志噪音现在不仅拖累我,也会拖累*智能体*的查询。

最终的根因比想象中还要精彩:每当账户从新设备或新 IP 连接时,交易所会对私有 API 调用施加约 15 分钟的安全冷却期——而 OAuth 连接*从定义上就是*一次新设备连接。我们那套「创建后立即同步验证」的设计,在首次连接时是结构性必然失败的。修复方案不是加重试逻辑,而是立即持久化 key,把余额检查推迟到冷却期之后。

整个过程我一次都没打开 Cloudflare 仪表盘。智能体从代码中形成假设,拿生产遥测数据检验,再修正。这就是 antirez 笔下那位不知疲倦的雕塑家——而且有了眼睛。

## 踩坑实录

三个一定会咬你一口的坑,写在这里让你免遭其害:

:::caution
**你的 wrangler 登录凭证查不了可观测性 API。** 在安装 MCP 服务器之前,我的智能体试图直接用 `wrangler login` 的 OAuth token 调 REST 接口,结果只得到一句干巴巴的 `code: 10000, Authentication error`。这是 Cloudflare 表达「token 有效,但缺权限」的迷惑方式:wrangler 的 token 只携带 wrangler 自己申请的 scope(`workers:write`、`workers_tail:read` 等),而遥测查询接口需要的是 **Workers Observability: Read**。MCP 服务器用自带的 OAuth 流程申请正确的 scope,完全绕开了这个问题。如果你想直接用 `curl` 裸调,请创建一个专用的 API token。
:::

**会话中途添加的 MCP 服务器需要重连。** `claude mcp add` 会更新配置,但正在运行的 Claude Code 会话看不到新服务器的工具,除非你在*那个*会话里执行 `/mcp`(或者重启会话)。我在这上面一头雾水地浪费了十分钟。

**日志卫生如今直接决定智能体的表现。** 在一个嘈杂的服务上做全文检索,返回的就是噪音。我第一次「把故障前后的所有日志都给我看看」的查询,结果 100% 是 cron 警告。如果你想让智能体从你的日志里排障,就得把日志垃圾当作一个有实际代价的 bug 来对待。

## 第二部分:本地优先的 TDD 是智能体的另一只眼

生产环境的视力告诉你哪里出了问题。第二条回路——让智能体不只是会诊断、而是真正*高产*的那条——是一套它能自己运行、答案诚实、几秒出结果的测试套件。

在 Cloudflare 上,解锁这一切的是 [`@cloudflare/vitest-pool-workers`](https://developers.cloudflare.com/workers/testing/vitest-integration/):你的测试不是跑在 Node 里配一堆平台 API 的 mock——而是跑在 **workerd** 里,也就是真正的 Workers 运行时,由 Miniflare *根据你真实的 `wrangler.jsonc`* 启动。Durable Objects 及其 SQLite 存储、R2、D1、KV、限流器:全是真实实现,全在本地,全在进程内。

```ts title="vitest.config.mts (the core of it)"
export default defineWorkersConfig({
  test: {
    sequence: { concurrent: false },
    poolOptions: {
      workers: {
        isolatedStorage: false,
        wrangler: { configPath: './wrangler.jsonc' },  // ← the whole platform, in-process
        moduleRules: [{ type: 'Text', include: ['**/*.sql'] }],
      },
    },
  },
})
```

下面看看这在我的代码库里实际带来了什么。

### 测试里的数据库*就是*生产数据库

我系统里的每个租户都是一个 Durable Object,其 `ctx.storage` 的 SQLite 由 drizzle-orm 管理。迁移在 DO 构造函数中执行:

```ts title="TenantDurableObject.ts"
import { drizzle } from 'drizzle-orm/durable-sqlite';
import { migrate } from 'drizzle-orm/durable-sqlite/migrator';
import migrations from '../generated-migrations';

constructor(ctx: DurableObjectState, env: Env) {
  this.db = drizzle(ctx.storage, { schema: tenantSchema });
  ctx.blockConcurrencyWhile(() => migrate(this.db, migrations));
}
```

因为 vitest 在 Miniflare 下启动的是同一个 DO 类,本地测试数据库拥有和生产环境*一模一样*的 schema——相同的迁移、相同的引擎,不存在「用 SQLite 味儿模拟我们的 Postgres」这种事。(有个小麻烦:Workers 沙箱无法从磁盘读文件,所以需要一个小小的构建步骤,在测试套件运行前把 `.sql` 迁移文件代码生成为一个 JS 字符串模块。难看,但有效。)

### 用 `runInDurableObject` 做白盒断言

`cloudflare:test` 暴露了一个神奇的后门:伸进 Durable Object 实例的*内部*,直接对它的私有状态做断言。

```ts title="Asserting on the DO's internal SQLite"
const identities = await runInDurableObject(orgDb, async (instance: TenantDurableObject) => {
  const db = (instance as any).db;
  return db.select().from(cexIdentities).all();
});
expect(identities).toHaveLength(0);
```

这就是「接口返回了 200」和「那一行确实落库了,而且密钥是加密存储的」之间的区别。我的测试套件在 46 个测试文件里用到了它。

### 第三方 API 变成硬性断言

交易所集成里最让人提心吊胆的是出站调用——也是智能体最爱产生幻觉的部分。`cloudflare:test` 的 `fetchMock` 把它变成了一份契约:

```ts title="Mocking the exchange, strictly"
beforeEach(() => {
  fetchMock.activate();
  fetchMock.disableNetConnect();   // any unmocked outbound call = test failure
});

fetchMock.get('https://api.exchange.example')
  .intercept({ method: 'POST', path: '/oauth/token' })
  .reply(200, oauthTokenSuccessFixture);

// …run the flow…

fetchMock.assertNoPendingInterceptors();  // every expected call actually happened
```

`disableNetConnect()` 意味着智能体*不可能*意外地拿真实互联网做测试,幻觉出来的多余 API 调用会大声失败,而不是悄无声息地「差不多能跑」。`assertNoPendingInterceptors()` 则意味着*缺失*的调用同样会失败。这个 mock 不是桩(stub),而是一份规格说明。

### 黄金回路

把这些组合起来,一个测试就能贯穿整条垂直链路:mock 交易所的三个接口 → 调用真实的 Hono 路由 → 断言 HTTP 响应、mock 契约,*以及* Durable Object 的 SQLite 状态:

```ts title="The full-stack test an agent can iterate against"
it('completes OAuth → API key → balance → wallet storage', async () => {
  fetchMock.get(EXCHANGE).intercept({ path: '/oauth/token', method: 'POST' }).reply(200, tokenFixture);
  fetchMock.get(EXCHANGE).intercept({ path: '/oauth/api-key', method: 'POST' }).reply(200, keyFixture);
  fetchMock.get(EXCHANGE).intercept({ path: '/private/Balance', method: 'POST' }).reply(200, balanceFixture);

  const response = await app.request(callbackUrl, { headers }, env);

  expect(response.status).toBe(200);
  fetchMock.assertNoPendingInterceptors();

  const wallet = await runInDurableObject(orgDb, (i: TenantDurableObject) => i.getWallet('wallet-123'));
  expect(wallet).toMatchObject({ exchange: 'exchange', type: 'long-living' });
  expect(wallet!.apiSecret).not.toBe(keyFixture.result.secret); // encrypted at rest
});
```

为什么这*对智能体尤其*重要?回到雕塑家的比喻:

- **速度喂养韧性。** `npx vitest run test/oauth2/callback.test.ts` 让智能体在几秒内得到覆盖全栈的红绿裁决。每一块扔出去的石头都能被即时评估。五十次迭代只花几分钟,而不是几天。
- **确定性保证反馈诚实。** 没有不稳定的 staging,没有共享环境漂移,没有「在我机器上是好的」。Miniflare 的状态在每次运行开始时都会被清空。
- **严格性抓住幻觉。** `disableNetConnect` + `assertNoPendingInterceptors` 的组合是一台反幻觉装置:智能体没法凭空捏造一个「大概存在」的 API 交互——契约是可执行的。
- **完全自助。** 智能体不需要请我在 UI 上点点点来验证。它写出失败的测试,让它通过,再把输出展示给我。TDD 从来都是一门关于反馈回路的修行;智能体只不过是第一批韧性强到足以把它用到极致的开发者。

(坦白说:在一个年轻的平台上如此彻底地本地优先是有代价的。我目前上线用的是社区打过补丁的 drizzle-orm 和 better-auth 分支,才能让适配器正常工作。这是早期采用者税。)

## 诚实的 100 倍

「100 倍」是个很大的说法,所以让我精确地定位它。它指的不是打字速度。它是*迭代次数* × *反馈真实度*的乘积,具体长这样:

| 任务 | 我手动来 | 有眼睛的智能体 |
| --- | --- | --- |
| 「生产环境这个 400 是怎么来的?」 | 运气好的话,在仪表盘里翻 30–60 分钟 | 一条提示词;智能体关联代码和一整周的日志,给出时间线,外加两个附赠 bug |
| 「我刚才是不是把提现流程搞坏了?」 | 部署到 staging,在组件里点一遍 | `vitest run`——几秒内全栈裁决,连 DO 状态都包括 |
| 「我们调交易所 API 的方式对吗?」 | 再读一遍他们的文档,然后祈祷 | `assertNoPendingInterceptors()`——契约就是测试 |
| 「这个平台 API 还是我记忆中的样子吗?」 | 切标签页去翻文档 | Cloudflare skill 检索最新文档,而不是相信训练数据 |

智能体一直都很有韧性,一直都很快。这些从来不是瓶颈——视力才是。接上它可以自行查询的生产遥测,再给它一个可以随时模拟的本地世界,那位站在大理石前不知疲倦的工匠,终于能看清每块石头落在哪里了。

现在,他开始雕刻了。

## 致谢与链接

- Salvatore Sanfilippo(antirez),[*Il trucco decisivo (davvero) per lavorare coi coding agent*](https://youtu.be/TJ6ruN-o0PA)——启发本文的「失明雕塑家」比喻。Grazie。
- [cloudflare/skills](https://github.com/cloudflare/skills)——面向 Claude Code 及其他智能体的官方 Agent Skills。
- [Cloudflare 面向 Claude Code 的智能体配置指南](https://developers.cloudflare.com/agent-setup/claude-code/)——skills + MCP 服务器,包括 [Observability MCP 服务器](https://observability.mcp.cloudflare.com/mcp)。
- [Workers 的 Vitest 集成](https://developers.cloudflare.com/workers/testing/vitest-integration/)——`@cloudflare/vitest-pool-workers`、`runInDurableObject`、`fetchMock`。
