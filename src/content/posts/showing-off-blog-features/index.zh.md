---
title: '展示博客功能'
published: 2025-07-20
draft: true
tags: ['astro', 'demo', 'markdown']
toc: true
coverImage:
  src: './cover.jpg'
  alt: '一个短而浓密头发、戴着近视眼镜的人坐在整洁的工作台前，使用放大应用浏览网页。姿势端正而放松。桌上有一台电脑、一个鼠标、一盏大台灯和一个小笔记本。'
---

因为这篇文章的 frontmatter 里没有 description，所以会使用第一段文字。

## 主题

> 为你的博客使用你最喜欢的编辑器主题！

网站主题来自 Expressive Code 内置的 Shiki themes。你可以在[这里](https://expressive-code.com/guides/themes/#available-themes)查看。一个网站可以有一个或多个主题，在 `src/site.config.ts` 中定义。有三种主题模式可以选择：

1. `single`: 为网站选择单个主题。简单。
2. `light-dark-auto`: 选择两个主题，分别用于 light 和 dark mode。header 会包含一个按钮，用来在 light/dark/auto 之间切换。比如你可以选择 `github-dark` 和 `github-light`，默认值为 `"auto"`，用户体验会立即匹配他们操作系统的主题。
3. `select`: 为网站选择两个或更多主题，并在 header 中加入按钮，让用户可以在这些主题之间切换。你可以加入任意数量的 Expressive Code Shiki themes。让用户找到他们最喜欢的主题！

> 当用户切换主题时，他们的偏好会存储在 `localStorage` 中，以便在页面导航之间保持。

## 代码块

看看几种代码块样式：

```python
def hello_world():
    print("Hello, world!")

hello_world()
```

```python title="hello.py"
def hello_world():
    print("Hello, world!")

hello_world()
```

```shell
python hello.py
```

还有一些 inline code: `1 + 2 = 3`。或者甚至是 `(= (+ 1 2) 3)`。

查看 [Expressive Code Docs](https://expressive-code.com/key-features/syntax-highlighting/) 了解更多可用功能，比如文本换行、行高亮、diffs 等。

## 基础 Markdown 元素

- 列表项 1
- 列表项 2

**粗体文本**

_斜体文本_

~~删除线文本~~

[链接](https://www.example.com)

> 在生活中，就像在艺术中，有些结局苦乐参半。尤其当它与爱有关。有时命运让两个相爱的人相遇，只是为了再把他们分开。有时英雄终于做出了正确选择，但时机错了。正如人们所说，时机就是一切。
>
> \- Gossip Girl

| 名字    | 年龄 | 城市        |
| ------- | --- | ----------- |
| Alice   | 30  | New York    |
| Bob     | 25  | Los Angeles |
| Charlie | 35  | Chicago     |

---

## 图片

图片可以在 URL 后加入 title 字符串，从而渲染为带 `<figcaption>` 的 `<figure>`。

![Pixel art of a tree](./PixelatedGreenTreeSide.png 'Pixel art renders poorly without proper CSS')

```md title="Pixel art markdown" wrap
![Pixel art of a tree](./PixelatedGreenTreeSide.png 'Pixel art renders poorly without proper CSS')
```

我还添加了一个特殊 tag，用于为 pixel art 加上正确的 CSS，让它显示得更好。只需要把 `#pixelated` 加在 alt 字符串的末尾。

![Pixel art of a tree #pixelated](./PixelatedGreenTreeSide.png 'But adding #pixelated to the end of the alt string fixes this')

```md title="Pixel art markdown with #pixelated" wrap
![Pixel art of a tree #pixelated](./PixelatedGreenTreeSide.png 'But adding #pixelated to the end of the alt string fixes this')
```

## Admonitions

```md title="Admonition example in markdown"
:::note
testing123
:::
```

:::note
testing123
:::

:::tip
testing123
:::

:::important
testing123
:::

:::caution
testing123
:::

:::warning
testing123
:::

## 角色聊天

```md title="Custom character chat" wrap
:::duck
**Did you know?** You can easily create custom character chats for your blog with MultiTerm!
:::
```

:::duck
**你知道吗？** 你可以用 MultiTerm 轻松为博客创建自定义角色聊天！
:::

### 添加你自己的角色

要添加你自己的角色，先把图片文件放到克隆的 MultiTerm repo 顶层 `/public` 目录中。Astro 无法自动优化来自 markdown plugins 的 image assets，所以请确保把图片压缩到适合网页的大小 (<100kb)。

我推荐 Google 免费的 [Squoosh](https://squoosh.app) web app，用来创建非常小的 webp 文件。这里的角色图片已经被调整到 300 pixels 宽，并使用 Squoosh 以 75% quality 导出为 webp。

添加图片后，在 `site.config.ts` 中更新 `characters` option，填入新图片文件，然后重启 development server。

### 角色对话

当连续出现多个角色聊天时，聊天图片和气泡的顺序会反转，让对话更像来回交流。

```md title="Sequential character chats"
:::owl
This is a cool feature!
:::

:::unicorn
I agree!
:::
```

:::owl
这是一个很酷的功能！
:::

:::unicorn
我同意！
:::

你可以指定对齐方式 (`left` 或 `right`) 来覆盖默认的 `left, right, left, ...` 顺序。

```md wrap title="Character chats with specific alignment"
:::unicorn{align="right"}
Over here, to the right!
:::
```

:::unicorn{align="right"}
在这里，在右边！
:::

## GitHub Cards

GitHub overview cards 很大程度上受到 [Astro Cactus](https://github.com/chrismwilliams/astro-theme-cactus) 启发。

```md title="GitHub repo card example in markdown"
::github{repo="stelcodes/multiterm-astro"}
```

::github{repo="stelcodes/multiterm-astro"}

```md wrap=true title="GitHub user card example in markdown"
::github{user="withastro"}
```

::github{user="withastro"}

## Emoji :star_struck:

可以通过输入字面 emoji 字符或 GitHub shortcode 在 markdown 中添加 emoji。你可以在[这里](https://emojibase.dev/emojis?shortcodePresets=github)浏览一个非官方数据库。

```md title="Example markdown with GitHub emoji shortcodes"
Good morning! :sleeping: :coffee: :pancakes:
```

早上好！ :sleeping: :coffee: :pancakes:

> 所有 emoji（无论是字面字符还是 shortcode）都会通过像这样包裹在 `span` tag 中来提升可访问性：
>
> ```html
> <span role="img" aria-label="coffee">☕️</span>
> ```
>
> 在写作时，[emoji v16](https://emojipedia.org/emoji-16.0) 还不受支持。这些 emoji 可以直接写入，但它们没有 shortcode，也不会被包裹。

## LaTeX/KaTeX 数学支持

你也可以通过 [remark-math 和 rehype-katex](https://github.com/remarkjs/remark-math) 显示 inline math。

```txt title="Rendering inline math with KaTeX"
Make those equations pretty! $ \frac{a}{b} \cdot b = a $
```

让这些公式更漂亮！ $ \frac{a}{b} \cdot b = a $

查看 [KaTeX docs](https://katex.org/docs/supported) 学习语法。

```md title="Rendering a block of KaTeX" wrap
$$
a + ar + ar^2 + ar^3 + \dots + ar^{n-1} = \displaystyle\sum_{k=0}^{n - 1}ar^k = a \bigg(\dfrac{1 - r^n}{1 -r}\bigg)
$$
```

$$
a + ar + ar^2 + ar^3 + \dots + ar^{n-1} = \displaystyle\sum_{k=0}^{n - 1}ar^k = a \bigg(\dfrac{1 - r^n}{1 -r}\bigg)
$$

## HTML 元素

<button>一个按钮</button>

### 带输入的 Fieldset

<fieldset>
    <input type="text" placeholder="输入一些内容"><br>
    <input type="number" placeholder="输入数字"><br>
    <input type="text" value="输入值"><br>
    <select>
        <option value="1">选项 1</option>
        <option value="2">选项 2</option>
        <option value="3">选项 3</option>
    </select><br>
    <textarea placeholder="输入评论..."></textarea><br>
    <label><input type="checkbox"> 我理解<br></label>
    <button type="submi">提交</button>
</fieldset>

### 带标签的表单

<form>
<label>
    <input type="radio" name="fruit" value="apple">
    苹果
</label><br>

<label>
    <input type="radio" name="fruit" value="banana">
    香蕉
</label><br>

<label>
    <input type="radio" name="fruit" value="orange">
    橙子
</label><br>

<label>
    <input type="radio" name="fruit" value="grape">
    葡萄
</label><br>

<label>
    <input type="checkbox" name="terms" value="agree">
    我同意条款和条件
</label><br>
