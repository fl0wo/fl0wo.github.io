---
title: '干净的日志是智能体的基础设施'
published: 2026-07-07
draft: false 
tags: ['agentic-coding', 'observability', 'cloudflare', 'mcp', 'logging', 'debugging']
toc: true
coverImage:
  src: './blog2.png'
  alt: '素描风格插画:一个机器人将左侧杂乱嘈杂的原始生产日志倒入可观测性过滤漏斗,在右侧转化为字段一致、干净的结构化日志事件,下方是显示事件趋势、错误率和热门端点的智能体可观测性仪表盘'
---

编程智能体能读代码,能跑测试,能查文档。而且,只要你给它访问权限,它还能通过可观测性 MCP 服务器检查生产日志。

最后这一点比乍听起来重要得多。生产日志不再只是给人类盯着仪表盘眯眼看的东西,它现在是一个接口——你的智能体可以对它进行查询、过滤、分组、关联和推理。

这意味着,糟糕的日志不再只是让人烦躁而已。

糟糕的日志会让你的智能体变笨。

## 你的日志有了新读者

多年来,关于日志的建议都是写给人类看的:

- 让错误信息可读。
- 包含足够的上下文。
- 避免记录敏感信息。
- 不要在生产环境刷屏。

这些依然成立。但智能体调试引入了第二类读者:一个由 LLM 驱动的调查员,借助 Cloudflare Workers Observability MCP 这样的工具,从生产遥测数据中寻找答案。

这个智能体在一些人类做起来很慢的事情上极其出色:

- 在一整周的日志里搜索一个罕见的短语。
- 按端点、钱包、用户分群、服务商、路由或状态码对错误分组。
- 跨 API 请求、Durable Object 告警、cron 任务和 webhook 重建时间线。
- 对比事故前后的行为差异。
- 从代码中形成假设,再用生产环境的证据去验证。

但它也很容易被误导。如果你的日志充满噪音、缺乏结构、塞满原始载荷,或者缺少关联字段,智能体就会把上下文预算浪费在垃圾上。它找到的是最响亮的东西,而不是最相关的东西。

你的日志质量,决定了你的智能体的视力。

## 一起小事故(已匿名化)

想象一个简单的流程:

1. 用户把一种资产兑换成另一种。
2. 兑换完成后,系统立即尝试提现新资产。
3. 交易所接受了提现请求,并返回一个外部引用 ID。
4. 本地交易记录随后显示为失败。

人类可能会从 API 响应查起。交易所拒绝了吗?地址填错了?网络不支持?还是手续费计算导致提现金额不足?

一个拥有生产可观测性的智能体可以做得更好——但前提是日志的形态适合调查。

有用的时间线应该长这样:

```txt
11:52:48  withdraw.execute.started
          walletId=... quoteId=... exchange=... asset=... network=... amount=...

11:52:49  withdraw.transaction.persisted
          recordId=... externalRefId=... status=pending

11:53:20  withdraw.native_poll.scheduled
          recordId=... externalRefId=...

11:54:51  withdraw.native_poll.status_changed
          recordId=... previousStatus=pending currentStatus=failed providerRawStatus=...
```

这是可调试的。智能体可以搜索 `recordId`,按 `providerRawStatus` 分组,检查同一资产/网络组合的所有失败案例,并判断失败状态究竟来自交易所、本地后处理层、webhook 重试,还是后台轮询器。

再对比一下常见的生产日志大杂烩:

```txt
Direct execution [abc123] { giant workflow params object... }
balancesWithNetworkInfo [...]
sortedBalances [...]
[WebhookEndpoints] Found 7 active endpoints
[WebhookEndpoints] Endpoint 0 events=[...]
[TenantDO] Alarm triggered
Error: failed
```

智能体依然可以搜索这些内容,但一切都得靠推断。更糟的是,成功路径上那些喧闹的日志,会把真正重要的那一行淹没掉。

当智能体调查生产环境时,日志噪音不是审美问题,而是实打实的运维拖累。

## 什么样的日志对智能体友好?

对智能体友好的日志有五个特性。

### 1. 稳定的事件名

每个重要事件都应该有一个稳定、低基数的名字:

```ts
logInfo('withdraw.execute.started', {
  walletId,
  quoteId,
  exchange,
  asset,
  network,
  amount,
})
```

优先用它,而不是:

```ts
console.log(`Starting withdrawal for ${walletId} on ${exchange}`)
```

散文式的版本只在被读到的那一次是可读的,结构化的版本则永远可搜索。

稳定的事件名让智能体可以提出这样的问题:

- 给我看这个时间点附近所有的 `withdraw.execute.started` 事件。
- 按 `currentStatus` 统计 `withdraw.native_poll.status_changed` 的数量。
- 找出过去七天里每一条 `webhook.delivery.max_attempts`。
- 按路由路径对比 `api.request.failed`。

好的事件名是无聊的。这正是重点。

使用一套可预测的命名空间:

```txt
api.request.failed
api.request.slow
withdraw.execute.started
withdraw.execute.completed
withdraw.error
withdraw.native_poll.status_changed
webhook.delivery.failed_attempt
webhook.delivery.max_attempts
provider.withdraw_info.live_fallback
```

事件名应该说明发生了什么,而不是包含发生变化的数据。变化的值放进字段里。

### 2. 处处都有关联字段

没有抓手,智能体就无法重建时间线。

对于交易类系统,同一批字段应该贯穿请求、持久化、轮询、webhook 和错误日志:

```ts
{
  orgId,
  projectId,
  walletId,
  quoteId,
  transactionId,
  recordId,
  exchange,
  asset,
  network,
}
```

不需要每条日志都带上全部字段。但每条日志都应该包含足够的信息,让它能与下一步关联起来。

通常最有价值的字段是:

- 租户或组织 ID。
- 用户或钱包 ID。
- 请求 ID、报价 ID、订单 ID、交易 ID,或幂等键。
- 交易所/服务商名称。
- 资产和网络。
- 路由路径,而非原始 URL。
- 外部服务商引用 ID。
- 状态变更时的前一个状态和后一个状态。

对于后台系统,还要带上调度身份:

```ts
logInfo('withdraw.native_poll.scheduled', {
  recordId,
  walletId,
  quoteId,
  exchange,
  asset,
  refid,
  nextPollAt,
})
```

这让智能体能够回答那个真正的问题:「API 返回之后,这个东西到底经历了什么?」

### 3. 记录状态转换,而不是每一步

不要记录每一次心跳。

要记录每一次有意义的状态转换。

好的:

```txt
withdraw.execute.started
withdraw.execute.completed
withdraw.transaction.persisted
withdraw.native_poll.status_changed
withdraw.error
webhook.delivery.max_attempts
```

通常是噪音的:

```txt
Alarm triggered
Processing 12 pending items
Found endpoint 0
Found endpoint 1
Broadcasted to 0 listeners
Balance array after enrichment: [...]
Successfully refreshed balances
```

这里的区分标准不是「成功日志坏,错误日志好」。当成功日志标记了一个边界时,它是有用的:

- 一笔交易订单被接受了。
- 一笔提现被提交了。
- 一条交易记录被持久化了。
- 轮询器观察到了服务商的终态。
- 一个 webhook 在多次重试后最终送达了。

但紧凑循环或高频告警里成功路径上的碎碎念,会主导查询结果。

一个简单的经验法则:如果一条日志无助于重建事故时间线,它多半就不该以 `info` 级别出现在生产环境里。

### 4. 结构化的错误,不带原始载荷

智能体需要错误上下文。它们不需要密钥、地址、API 响应、cookie、签名、token,或完整的 webhook 载荷。

千万不要这样:

```ts
console.error('Withdrawal failed:', rawProviderResponse)
```

要这样:

```ts
logError('withdraw.error', {
  code: serializedError.code,
  errorMessage: serializedError.message,
  hasRawResponse: Boolean(serializedError.rawResponse),
  walletId,
  quoteId,
  exchange,
  asset,
  network,
})
```

原始的服务商响应可以在合适的地方持久化,置于你常规的数据访问控制之下。让日志保持安全、紧凑。

这件事重要有两个原因:

1. 日志往往会流入很多系统,被很多读者看到。
2. 智能体非常擅长模式匹配,但每多一个原始对象都在消耗上下文,并增加提取出错误信号的概率。

在日志器的边界做脱敏,而不是在每个调用点。一个小小的共享日志器应该对这些键做脱敏:

```txt
address
apiKey
apiSecret
authorization
cookie
password
privateKey
rawResponse
secret
signature
token
twofa
```

同时要去掉 URL 字段里的查询字符串。webhook URL、OAuth 回调和服务商 URL 常常携带敏感或高基数的数据。

### 5. 默认低基数

智能体经常对日志分组。高基数的日志名和字段会让分组变得毫无意义。

避免这样的事件名:

```txt
withdraw.failed.ASSET.NETWORK.wallet_123
```

用这样的:

```ts
logError('withdraw.error', {
  asset: 'ASSET',
  network: 'Ethereum',
  walletId: 'wallet_123',
})
```

事件名应该稳定,变化的应该是字段。

对于路径,记录路由模式而不是原始路径:

```txt
/v0/wallet/transaction/:id
```

而不是:

```txt
/v0/wallet/transaction/transaction_123
```

这让智能体可以按端点对失败分组,而不是每个 UUID 各成一组。

## 一份实用的日志契约

以下是我如今希望任何一个日后会被智能体调试的 Workers API 都遵守的日志契约。

### API 中间件

在应用的边缘:

- 非抛出的 500 记为 `api.request.failed`。
- 抛出的意外错误记为 `api.request.error`。
- 慢的成功请求记为 `api.request.slow`。
- 包含方法、路由路径、状态码、耗时、租户 ID、钱包/用户 ID(如可用),以及 Cloudflare Ray ID(如存在)。

除非你有采样机制和明确的理由,否则不要重新启用泛化的请求日志。一请求一行的日志能把其他一切都淹没掉。

### 命令处理器

在重要操作的开始:

```ts
logInfo('withdraw.execute.started', {
  quoteId,
  walletId,
  exchange,
  asset,
  network,
  amount,
  dryRun,
})
```

在完成时:

```ts
logInfo('withdraw.execute.completed', {
  quoteId,
  recordId,
  walletId,
  exchange,
  asset,
  network,
  transactionId,
})
```

在预期内的服务商错误上:

```ts
logError('trade.order.failed', {
  walletId,
  exchange,
  routeId,
  side,
  type,
  volume,
  error,
})
```

避免倾倒完整的请求体或响应体。

### Durable Object 与告警

Durable Object 的告警往往是最严重的噪音源。它们运行频繁,而记录每一轮执行的诱惑总是存在:

```txt
Alarm triggered
Processing 10 retries
No webhook endpoints found
Item already terminal
```

其中大部分都应该消失。

保留:

- 重试次数耗尽。
- 状态发生变更。
- 服务商轮询失败。
- webhook 投递永久失败。
- 密钥解密失败。
- 意外的持久化失败。

删掉:

- 告警已触发。
- 无事可做。
- 已经调度过了。
- 已经是终态。
- 没有订阅者。
- 广播成功。

告警本身不是故事,状态转换才是故事。

### Webhook

webhook 系统需要日志,但不是每个内部分支都需要。

有用的:

```txt
webhook.delivery.failed_attempt
webhook.delivery.max_attempts
webhook.endpoint.secret_missing
webhook.endpoint.secret_decrypt_failed
```

通常是噪音的:

```txt
Querying endpoints
Found 3 endpoints
Endpoint 0 has event=true
Delivery succeeded
Scheduled retry for 2026-...
```

数据库里已经有投递记录了。日志应该突出那些值得智能体去调查的情况。

## 改造前后

之前:

```ts
console.log('balancesWithNetworkInfo', balancesWithNetworkInfo)
console.log('enrichedBalances', enrichedBalances)
console.log('sortedBalances', sortedBalances)
console.error(`Failed to store transaction ${txid}:`, err)
console.log('[TenantDO] Alarm triggered')
console.log(`[WebhookEndpoints] Found ${endpoints.length} active endpoints`)
```

之后:

```ts
logWarn('wallet.balance.refresh_failed', {
  walletId,
  exchange,
  error,
})

logInfo('withdraw.transaction.persisted', {
  recordId,
  walletId,
  quoteId,
  exchange,
  asset,
  network,
  transactionId,
})

logWarn('webhook.delivery.max_attempts', {
  deliveryId,
  endpointId,
  webhookEvent,
  eventId,
  attemptCount,
  responseStatus,
  errorMessage,
})
```

第二个版本文字更少,信息更多。

这就是核心诀窍。

## 智能体的调试回路

一旦日志干净了,调试回路就变了。

你不再是这样问智能体:

> 能看看这一个错误,猜猜发生了什么吗?

而是可以这样问:

> 在生产日志里搜索这个交易 ID,重建时间线,把过去七天里类似的失败分组,并按资产/网络对比服务商的原始状态。

接下来智能体可以:

1. 阅读相关的代码路径。
2. 按稳定的事件名查询日志。
3. 沿关联字段透视数据。
4. 判断失败来自请求处理、服务商提交、本地持久化、后台轮询,还是 webhook 投递。
5. 找出相似的案例。
6. 给出结论:这是代码 bug、服务商行为、用户配置问题,还是产品预期的缺失。

这与在仪表盘里探洞是性质完全不同的工作流。

但它只在日志配合的前提下才成立。

## 智能体就绪日志检查清单

在上线一个新工作流之前,过一遍这份清单:

- 每个主要操作是否都有 `started` 事件和终态事件?
- 状态转换是否连同前一个状态和后一个状态一起记录?
- 我能否用共享 ID 把 API 日志、数据库记录、后台任务和 webhook 关联起来?
- 路由路径是否已归一化?
- 是否包含了服务商引用 ID?
- 原始的服务商载荷是否已排除在日志之外?
- 地址、token、密钥、签名、cookie 和 authorization 值是否已在中心化位置脱敏?
- 高频成功路径的日志是否已删除或采样?
- 重试耗尽和永久失败的状态是否有日志?
- 按事件名分组日志,能否得到一个有意义的分布?
- 如果智能体搜索某一笔交易,它找到的会是故事,还是只有噪音?

## 先删什么

如果你的生产日志已经很吵了,从这里下手:

1. 删掉纯映射/归一化函数里的日志。
2. 删掉打印完整数组或完整对象的日志。
3. 删掉高频路径里的「成功做了 X」,除非它标记了一个事务边界。
4. 删掉告警、轮询器、队列和 cron 任务里的「无事可做」日志。
5. 删掉循环内部逐端点/逐条目的日志。
6. 删掉原始请求/响应的倾倒。
7. 把散文式的错误信息替换成结构化的事件名和字段。

你不需要一个庞大的可观测性工程。你需要的是几个稳定的事件,以及把其余日志删掉的自律。

## 转变

可观测性曾经是人类事后消费的东西。

现在它是开发环境的一部分。一个拥有 MCP 访问权限的编程智能体可以调查生产环境、验证假设、发现跨系统的模式——但前提是生产环境发出的信号是它能理解的。

干净的日志不只是更好看的日志。

干净的日志是智能体的基础设施。

它们是你给智能体一双眼睛的方式。
