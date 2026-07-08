---
title: '代码库学习是智能体的基础设施'
published: 2026-07-08
draft: false
tags: ['agentic-coding', 'codebase-learning', 'developer-tools', 'ai-agents', 'software-engineering']
toc: true
---

编程智能体已经足够好了,以至于奇怪的地方不再是它们能不能写代码。

它们能。

更奇怪的是,当它们写代码时,开发者身上发生了什么。

当一个模型开始做出更好的实现决策,而不只是写出语法正确的代码时,工作流就变了。它不再只是自动补全,而更像是与一位能规划、能分派任务、能重构、还能替其他模型收拾残局的资深工程师共事。

这很强大。

但它也带来了一种新的失败模式。

你读的代码变少了。

一开始,这感觉正是意义所在。更少的手工实现。更少地翻文件。更少无聊的胶水代码。更快的产品速度。

但读代码从来不只是为了产出代码。

读代码是你学习代码库的方式。

智能体编程的下一个瓶颈,不只是模型的上下文窗口。

而是人类的上下文窗口。

## 新的编程工作流

正在形成的工作流大致是这样的:

- 用一个强模型做编排者。
- 用更便宜或更快的模型做实现工人。
- 让编排者规划、审查、重构、掌舵。
- 让干活的模型写大部分代码。
- 让人类描述意图、批准方向,并在品味重要时介入。

这是合理的。

干活的模型能生成大量代码。它能解决大多数实现任务。它能长时间持续工作而不卡住。

编排者则更像一位资深开发者。它能做出更好的设计决策,注意到某个改动正在累积过多的债务,并把实现重构成更干净的样子。

结果就是一个大量代码被写出来、而人类却没碰过每个文件的工作流。

这不一定是坏事。

事实上,这也许正是未来软件开发的正确形态。

但它改变了人类在做的事。

人类不再主要负责写代码。

人类在掌舵那个写代码的系统。

而掌舵需要上下文。

## 旧的安全机制

在智能体出现之前,工作流更慢。

你打开文件。你找到相关组件。你读周围的代码。你注意到奇怪的命名。你搞清楚状态放在哪里。你发现那个没人喜欢、但所有人仍然依赖的旧抽象。

然后你才做改动。

这个过程感觉低效,因为其中很多环节并不直接产出。

但它有一个重要的副作用:它把代码库装进了你的脑子。

你学到了:

- 东西在哪里。
- 东西叫什么。
- 哪些组件拥有哪些职责。
- 哪些抽象是真实的,哪些是偶然形成的。
- 代码库的哪些部分是干净的。
- 哪些部分是被诅咒的。
- 哪些取舍是有意为之。
- 哪些取舍只是历史遗留的伤害。

这些知识在提示词还不存在的年代,就已经让你未来的提示词更好了。

它让你未来的 pull request 更好。

它让你的产品判断力更好。

代码库在你工作时,一直在教你。

## 新的失败模式

有了智能体,循环可能变成:

```txt
describe intent
agent searches code
agent edits files
agent runs tests
agent summarizes changes
human skims diff
human approves
```

这个循环很快。

它也移除了大量偶然发生的学习。

你可能在从未真正建立起对刚改过的代码的心智模型的情况下,就把功能发布了。

头几次没问题。模型有足够的上下文。diff 看起来合理。测试通过了。产品向前推进了。

然后代码库继续变化。

有些改动是你做的。有些是智能体做的。有些是其他用智能体的人做的。系统在增长。抽象在移动。新的约定出现。旧的约定衰败。组件迁移。职责拆分。状态从一层挪到另一层。

你仍然了解产品。

但你对产品在代码中如何被表示,知道得越来越少。

最终,问题不是智能体写不出代码。

问题是你不知道该要求什么。

## 提示词质量随人类上下文而衰减

好的提示词不是魔法咒语。

好的提示词是压缩后的上下文。

弱的提示词说:

```txt
Make the sidebar work with team workspaces.
```

更强的提示词说:

```txt
The sidebar is currently user-scoped, but navigation needs to become workspace-scoped.

Keep the Sidebar component presentational.
Move workspace resolution into the navigation provider.
Preserve the command palette behavior.
Do not duplicate route filtering logic.
Update the empty state for users with access to multiple workspaces.
```

第二个提示词更好,不是因为它更长。

它更好,是因为写它的人理解这个代码库。

他们知道职责应该放在哪里。他们知道哪个抽象不应该被重复。他们知道哪个相邻功能依赖同一份状态。他们知道旧的意图和新的意图。

这正是智能体无法移除的部分。

它们让实现一个方向变得更容易。

它们并没有移除选择方向的必要。

如果人类丢了地图,掌舵就会变差。

而当掌舵变差,产品最终也会变差。

## 问题在转移

大量智能体基础设施都聚焦于给模型更多上下文。

这是有用的。

智能体需要搜索仓库。需要读文件。需要检查追踪数据。需要跑测试。需要从现存的各种产物中恢复架构意图。

但还有另一个上下文问题。

人类也需要上下文。

不是每个细节。不是每一行。不是每个辅助函数。

而是足以做出好决策的量。

足以知道:

- 这个功能的形状是什么?
- 这份状态归谁所有?
- 这个组件想成为什么?
- 哪些部分是遗留代码?
- 哪些抽象是承重的?
- 哪些名字是重要的?
- 哪些决策仍然有效?
- 哪些决策是为已经不存在的需求做的?

智能体需要上下文才能行动。

人类需要上下文才能判断。

这是两种不同的产品。

## 缺失的一层是代码库学习

缺失的工具不只是更好的代码搜索。

也不只是更好的文档。

而是一位代码库老师。

一个持续教人类系统如何运作的东西。

不是抽象地教。

不是一份缓慢腐烂的巨型 README。

而是一个附着在代码库上的、活的解释层。

一位好的代码库老师应该能回答这样的问题:

- 这个区域的主要概念是什么?
- 这个 UI 来自哪里?
- 哪个组件拥有这个行为?
- 为什么这条流程被拆分在这些文件里?
- 最近改了什么?
- 预期的方向是什么?
- 什么东西我不该随手去碰?
- 我们正在试图迁移离开的旧设计是什么?

这不只是为了给新工程师做入职培训。

它是为那些已经大量使用智能体、以至于不再通过手工实现自然吸收代码库的现有工程师准备的。

智能体写的代码越多,这件事就越重要。

## 为人类而写的文档,而不是为智能体

有一种诱惑:把更多文档塞进智能体的上下文里来解决这个问题。

这对智能体有帮助。

但它并不能完全帮到人类。

人类不需要在每个任务前先接收一份臃肿的上下文倾泻。人类需要一张可导航的地图。

一个有用的代码库学习层,应该为渐进式披露而优化。

先从高层开始:

- 这个功能是什么?
- 核心概念是什么?
- 主要流程是什么?

然后让人类逐层下钻:

- 哪些文件实现了它?
- 涉及哪些组件?
- 调用了哪些服务?
- 状态放在哪里?
- 有哪些边界情况?

只在需要时才下到更低层:

- 这个函数为什么存在?
- 它做了哪些假设?
- 我改动它会弄坏什么?

大多数时候,人类不需要最低的那一层。

他们需要的是代码之上的那一层。

他们需要的是意图。

## 知识树

一种实用的形态是一棵 Markdown 文件树。

不是一份巨型文档。

不是散落各处的 README。

而是一棵结构化的知识树。

例如:

```txt
/codebase
  /map.md
  /glossary.md
  /features
    /workspace-navigation
      overview.md
      concepts.md
      ui.md
      state.md
      backend.md
      decisions.md
      debts.md
      files.md
    /billing-settings
      overview.md
      concepts.md
      ui.md
      provider-integrations.md
      decisions.md
      debts.md
      files.md
  /components
    /app-shell.md
    /command-palette.md
    /data-table.md
  /changes
    /2026-07-08-workspace-navigation.md
    /2026-07-02-billing-provider-refactor.md
```

树的顶层应该一分钟内就能读完。

每一页都应该指向更深的页面。

每个更深的页面都应该把一件事讲清楚。

重点不是给每一行代码写文档。

重点是保住那张人类过去靠读代码手工构建出来的地图。

## 优先记录意图,而非摘要

糟糕的生成式文档长这样:

```txt
This file exports a React component called Sidebar.
It imports useWorkspace, Link, cn, and NavigationItem.
It renders a list of navigation items.
```

这在技术上是对的。

但它也几乎毫无用处。

代码本身已经说明了这些。

有用的文档解释意图:

```txt
Sidebar is intentionally presentational.

It receives the resolved navigation model from WorkspaceNavigationProvider
and should not decide which workspace is active.

This keeps route ownership in one place and prevents the command palette,
sidebar, and mobile nav from each implementing their own filtering logic.
```

这才是人类需要的知识。

不只是代码在做什么。

而是代码为什么长成这个形状。

## 让 UI 解释代码

对产品工程师来说,大量的代码库学习是从界面开始的。

你看到一个按钮。

你想知道它住在哪里。

你看到一个页面。

你想知道哪些组件组成了它。

你看到一个奇怪的行为。

你想知道是哪个状态转换导致的。

代码库老师应该把 UI 和代码连接起来。

比如,想象一个开发覆盖层,让你可以检查一个页面并看到:

```txt
Page
  WorkspaceSettingsPage
  app/workspaces/[workspaceId]/settings/page.tsx

Sections
  WorkspaceMembersPanel
  WorkspaceBillingPanel
  WorkspaceDangerZone

Data
  getWorkspaceSettings()
  getWorkspaceMembers()
  getBillingSubscription()

State ownership
  Server state: workspace settings
  Client state: pending invite modal
  URL state: selected settings tab
```

这种工具会改变你写提示词的方式。

你不再说:

```txt
Change the settings page so members are easier to invite.
```

而可以说:

```txt
In WorkspaceSettingsPage, update WorkspaceMembersPanel so the invite flow is primary.

Keep pending invite modal state local to the members panel.
Do not move billing logic.
Preserve the selected settings tab in the URL.
```

第二个提示词不只是更具体。

它锚定在代码库里。

## 追踪决策,而不只是文件

大多数代码库知识不是文件知识。

而是决策知识。

重要的问题通常是:

- 为什么这份状态在这里?
- 为什么这个功能在这里被拆分?
- 为什么这个服务拥有这个操作?
- 为什么我们不用那个共享组件?
- 为什么这里仍然是重复的?

智能体通常可以从代码中推断出这些答案,但推断不等于知识。

如果决策重要,就把它写下来。

一条决策记录可以很小:

```md
# Decision: Workspace Navigation Owns Route Filtering

Date: 2026-07-08

Workspace navigation owns route filtering because the sidebar,
mobile navigation, and command palette all need the same visibility rules.

Do not duplicate filtering in individual components.

If workspace roles become more complex, extend the navigation model instead
of adding per-component permission checks.
```

这不是官僚主义。

这是掌舵的基础设施。

下一次有人要求智能体修改导航时,人类可以迅速找回当初的意图,并据此写出提示词。

## 记录债务

智能体绕过技术债务的能力非常强。

有时强得过头了。

一个强模型可以绕开糟糕的抽象、给脆弱的代码打补丁、让测试通过。短期看这很有用。但它也可能掩盖一个事实:系统正变得越来越难以推理。

债务应该是学习层的一部分。

不是作为耻辱。

而是作为地图数据。

例如:

```md
# Known Debt: Billing Settings

- Billing provider logic is still partially mixed into the UI layer.
- Subscription status names are provider-shaped, not domain-shaped.
- There are two sources of truth for trial expiration.
- The current migration direction is to introduce BillingAccount as the domain object.
```

这能帮助人类掌舵。

弱的提示词说:

```txt
Add support for annual plans.
```

更强的提示词说:

```txt
Add support for annual plans, but do not deepen the provider-shaped status model.

Use this as a step toward BillingAccount becoming the domain object.
Avoid adding new subscription status branching inside the UI components.
```

只有当人类了解这些债务时,这样的提示词才有可能写出来。

## 智能体应该更新这位老师

学习层不能指望人类在每次改动后都写出完美的文档。

那注定会失败。

智能体应该把更新代码库老师作为开发循环的一部分。

在一次有意义的改动之后,智能体应该产出一份知识 diff:

- 更新功能概览
- 更新受影响的组件
- 新增决策记录
- 新增已知债务
- 把旧意图标记为已废弃
- 链接改动的文件

pull request 应该同时包含代码和解释。

不是一篇长文。

而是一次对地图的小型、结构化的更新。

例如:

```md
# Change: Workspace-Scoped Navigation

Changed
- Navigation is now resolved per workspace.
- Sidebar remains presentational.
- Command palette now consumes the same navigation model.

Why
- Users can belong to multiple workspaces.
- Navigation visibility depends on workspace role.

Do not
- Add workspace filtering inside individual nav components.
- Duplicate role checks in the command palette.

Files
- app/workspaces/[workspaceId]/layout.tsx
- components/navigation/sidebar.tsx
- components/navigation/command-palette.tsx
- lib/navigation/workspace-navigation.ts
```

这让智能体的工作在日后对人类保持可读。

它也让未来的提示词写得更好。

## 审查也在改变

代码审查同样在改变。

在旧的工作流里,审查主要围绕 diff。

有了智能体,审查必须把知识层也包含进来。

对于有意义的改动,审查者应该问:

- 代码改动是否符合预期的架构?
- 智能体是创建了新抽象,还是加深了旧抽象?
- 有没有概念被重命名?
- 状态的所有权有没有转移?
- 文档树更新了吗?
- 决策记录变了吗?
- 已知债务变了吗?
- 未来的人类知道该如何围绕这个区域写提示词吗?

最后一个问题很重要。

一个代码库可以通过所有测试,却依然变得更难掌舵。

## 这不是要完全不读代码

目标不是彻底停止读代码。

那是幻想。

有时你需要检查具体的实现。有时抽象会泄漏。有时模型的摘要是错的。有时理解一个 bug 的唯一方式,就是读那个函数、跑那个测试。

目标是不同的。

当代码是正确的细节层级时,就去读代码。

不要强迫人类每次需要做产品决策时,都从原始文件里重新发现整个架构。

地图不能替代疆域。

但没有地图,每一次出发都从零开始。

## 一份实用的代码库老师契约

对每个重要功能,目标是维护一小组活的文档。

### 在功能层面

解释:

- 这个功能做什么。
- 主要的用户流程。
- 核心的领域概念。
- 当前的产品意图。
- 主要的入口点。
- 重要的文件。
- 已知的边界情况。

避免:

- 重复显而易见的代码结构。
- 罗列每一个 import。
- 写空洞无物的生成式文字。
- 把过时的意图和当前的意图混在一起。

### 在组件层面

解释:

- 组件拥有什么。
- 组件绝不能拥有什么。
- 哪些 props 是领域概念。
- 哪些状态是本地的。
- 哪些状态来自 URL、服务器或 provider。
- 哪些其他组件依赖同一个模型。

避免:

- 对每个组件一视同仁。
- 给琐碎的展示型组件写文档。
- 逐行描述 JSX。

### 在决策层面

解释:

- 做了什么决策。
- 为什么这么做。
- 拒绝了哪些替代方案。
- 什么情况会让这个决策失效。
- 这个决策在哪里被实现。

避免:

- 把决策记录变成会议纪要。
- 在决策不再成立后仍然保留它。
- 隐藏不确定性。

### 在债务层面

解释:

- 哪里别扭。
- 它为什么存在。
- 什么东西不该在其之上继续构建。
- 代码应该朝什么方向演进。
- 哪个未来的改动能偿还它。

避免:

- 含糊的抱怨。
- 指责。
- 巨型重构愿望清单。
- 没有掌舵价值的债务记录。

### 在变更层面

解释:

- 改了什么。
- 为什么改。
- 哪些意图变了。
- 哪些文件重要。
- 下次哪些提示词会写得更好。
- 更新了哪些文档。

避免:

- 提交摘要式的噪音。
- 「更新了代码」式的解释。
- 陈旧的生成式摘要。

## 面向人类的智能体代码库清单

在一个代码库里重度依赖智能体之前,先问:

- 开发者能在不读每个文件的情况下理解顶层系统吗?
- 领域概念有词汇表吗?
- 开发者能把一个可见的 UI 元素映射到它的组件吗?
- 开发者能找到状态归谁所有吗?
- 开发者能看出哪些抽象是有意为之的吗?
- 开发者能看出哪些抽象是遗留的吗?
- 重要的决策被写下来了吗?
- 已知的债务被写成掌舵笔记了吗?
- 智能体会在有意义的改动之后更新文档吗?
- 文档改动和代码改动一起被审查吗?
- 人类能快速找回足够的上下文来写出好的提示词吗?
- 人类能察觉智能体正朝错误方向前进吗?
- 知识层是按功能、概念和意图组织的吗?
- 低层细节可以获取,同时又不让顶层变得臃肿吗?
- 一个新开发者会知道什么不该随手去碰吗?
- 未来的你会明白这段代码为什么长成这个形状吗?

重点不是文档覆盖率。

重点是掌舵质量。

## 取舍

智能体编程带来了一个真实的取舍。

如果你读每一行代码,你就放弃了智能体提供的大部分速度。

如果你几乎什么都不读,你就会慢慢失去掌舵的能力。

答案不是回到手工编码。

答案也不是盲目信任智能体。

答案是一个代码库学习层:

- 人类可读的地图。
- 功能层面的解释。
- 组件所有权笔记。
- 决策记录。
- 已知债务。
- 从 UI 到代码的导航。
- 变更摘要。
- 渐进式的细节。
- 由智能体更新的文档。
- 可审查的意图。

这让人类有足够的上下文去引导系统,而不必被迫从零手工重建这个系统。

## 转变

软件开发过去是通过让开发者写代码来教开发者的。

智能体编程打破了这个默认。

代码现在可以在人类没有学到全部内容的情况下被写出来。

这是机会。

也是风险。

未来的开发者不只是提示词的书写者。未来的开发者是意图的守护者。他们决定系统应该成为什么、哪些抽象应该存活、哪些债务应该偿还、智能体应该朝哪个方向前进。

但你无法守护你不理解的东西。

代码库学习不是文档表演。

它是让人类留在循环中、又不必读每一行代码的方式。

它是让智能体写更多代码、又不让人类理解更少软件的方式。

你的智能体可以有更大的上下文窗口。

而你的产品,依然取决于人类的那一个。
