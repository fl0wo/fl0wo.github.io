Target language: Italian (Italiano)
Target locale: it-IT
Text direction: ltr
Expected destination path: src/content/posts/were-not-attached-to-our-code-anymore/index.it.md

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
title: "We're Not Attached to Our Code Anymore"
published: 2026-10-08
draft: false
tags: ['agentic-coding', 'ai-agents', 'software-engineering', 'system-design', 'teamwork']
toc: true
---

“Someone” tweeted that before the agentic-programming era, devs were extremely jealous of their code and couldn’t separate their ego from it.

Now that agents are coming into play, that’s changed.

<blockquote class="twitter-tweet" data-dnt="true" data-theme="dark" data-align="center"><p lang="en" dir="ltr">It was almost impossible for a programmer who wrote all their code by hand to divorce their ego from the output. Now agents are delivering what decades of agile admonishing about “collective ownership” never could. What a gift!</p>&mdash; DHH (@dhh) <a href="https://x.com/dhh/status/2107375021572444355">October 6, 2026</a></blockquote>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

I remember how, a few years ago, in order to ship a new feature or product in production, you had to know all the single details of its implementation, down to the bit, and some of them could require complicated working sessions of days, weeks, or months.

When my code finally worked, it meant a lot, as that was a result of effort, frustration, and small wins along the path.

If someone suggested (radically) replacing it with a (completely) different approach, the answer was mostly “I spent too much time; it works; we shouldn’t touch it”

So conversations about code refactoring always created tension, because under the hood, it was hiding hours and hours of sleepless nights and effort.

Now, because agents write most of the implementations, this pressure is not there anymore.

If a colleague tells me they found a better way to build a feature I shipped last month, I don’t have much reason to defend it.

I described it, I verified it, but I didn’t suffer through it.

The attachment itself is not gone; it simply shifts to something more important: the architectural design, the tech stack, infrastructure definition, operations, product, etc.

Those decisions still require real thinking, and they’re what I’d argue for in a review.

Code itself is just a way to express those ideas.

So the decisions that led to that code, that’s the right place for attachment to be.

This opens the doors for a lot more experimenting, and wider ability to change/adapt in a more flexible way, without having to break the engineers’ ego-wall.

There’s a risk to keep in mind tho.

Not being attached to code can also mean not understanding it.

Applying swaps to code can be done safely only if engineers know what the system is supposed to do and has tests that prove the replacement still does it.

```
