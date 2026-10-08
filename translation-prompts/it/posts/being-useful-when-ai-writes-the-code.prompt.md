Target language: Italian (Italiano)
Target locale: it-IT
Text direction: ltr
Expected destination path: src/content/posts/being-useful-when-ai-writes-the-code/index.it.md

Translate the source file below from English into the target language.
Return only the translated file content. Do not wrap the whole answer in Markdown fences. Do not add explanations.

Rules:
- Translate human-readable prose only.
- Preserve every frontmatter key and data type.
- Preserve Markdown and MDX syntax.
- Preserve code fences, inline code, raw HTML tags, directives, image URLs, local file paths, external URLs, and technical identifiers.
- Preserve the slug and do not rename files.
- Preserve image paths exactly, including relative paths such as ./cover.jpg.
- Keep dates, booleans, arrays, and nested frontmatter objects valid.

Source file:
```markdown
---
title: 'Being Useful When AI Writes the Code'
published: 2026-09-12
draft: false
tags: ['agentic-coding', 'ai-agents', 'software-engineering', 'testing', 'system-design']
toc: true
---

I'm against reading AI-generated code by default. If every generated line needs my review, my reading speed becomes the limit of the process. For a broken piece of implementation, I'd often rather clarify what it should do and have it rewritten than spend longer figuring out why it was written incorrectly. I'd still inspect code in exceptional cases, especially high-risk logic or failures I can't explain otherwise.

I also still like writing code by hand. There are things I'd write just for the satisfaction of making them myself. But when the priority is shipping production software quickly, that preference isn't a good enough reason to do the implementation manually.

So where should a developer spend their time?

First, deciding what we can avoid building. A feature we can drop, an abstraction we don't need, a service that doesn't need to be separate. AI makes me more willing to attempt complicated things, but I still have to account for the complexity afterward.

Then there's understanding the system. I need a precise mental map of what calls what, where state lives, which service owns which responsibility, and how failures move through the workflow. Without that, how would I give AI useful instructions? I'd be asking for changes without understanding what they affect. For now, I consider those decisions my responsibility.

The part that needs the most explanation is verification. If I'm not reading every line, I need another way to establish whether the implementation behaves correctly. I want a modular system, plenty of integration tests, focused unit tests, and end-to-end tests for important flows. I'd rather design for this from the beginning than retrofit it later.

Those tests also need an execution environment that lets me run them at different levels. I should be able to test one service without running the entire system, and separately test the orchestrators that coordinate several services. For a workflow that retries after a timeout, for example, I want to verify whether that retry can repeat an action that should happen only once. Deciding what the tests must prove is still work I need to do.

I also need to distinguish decisions I can change tomorrow from decisions I'll be stuck with. Replacing a small function and moving an entire system to another programming language are very different commitments. The second deserves attention before implementation starts, regardless of how quickly AI can generate it.

And sometimes I need to stop development. The next feature can wait while we fix what's becoming fragile or difficult to test. Explaining that to a PM requires more than saying "technical debt." Which changes have become risky? What keeps breaking? What would consolidating the current system actually improve?

This is why I think communication becomes a bigger part of the job. Having the system in my head helps me prompt an LLM, but other developers and PMs need to understand my reasoning too. When I think we should simplify something, change direction, or stop adding features, I need to explain why using specifics from the system we're building.

```
