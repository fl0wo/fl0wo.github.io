---
title: 'عرض ميزات المدونة'
published: 2025-07-20
draft: true
tags: ['astro', 'demo', 'markdown']
toc: true
coverImage:
  src: './cover.jpg'
  alt: 'شخص ذو شعر قصير وكثيف ونظارات طبية يجلس امام محطة عمل منظمة، ويستخدم تطبيق تكبير للتنقل في صفحة ويب. وضعيته صحيحة ومسترخية. على المكتب: كمبيوتر، ماوس، مصباح مكتب كبير ودفتر صغير.'
---

بما ان التدوينة لا تحتوي على description في frontmatter، يتم استخدام الفقرة الاولى.

## الثيمات

> استخدم ثيم المحرر المفضل لديك في مدونتك!

ثيمات الموقع تأتي من ثيمات Shiki المدمجة في Expressive Code. يمكنك رؤيتها [هنا](https://expressive-code.com/guides/themes/#available-themes). يمكن للموقع ان يحتوي على ثيم واحد او اكثر، ويتم تعريفها في `src/site.config.ts`. توجد ثلاث طرق للاختيار:

1. `single`: اختر ثيما واحدا للموقع. بسيط.
2. `light-dark-auto`: اختر ثيمين للموقع لاستخدامهما في الوضع الفاتح والداكن. سيحتوي ال header على زر للتبديل بين light/dark/auto. مثلا يمكنك اختيار `github-dark` و `github-light` مع default بقيمة `"auto"` وستطابق تجربة المستخدم ثيم نظام التشغيل مباشرة.
3. `select`: اختر ثيمين او اكثر للموقع واضف زرا في ال header للتغيير بينها. يمكنك اضافة اي عدد من ثيمات Shiki من Expressive Code. دع المستخدمين يجدون ثيمهم المفضل!

> عندما يغير المستخدم الثيم، يتم حفظ تفضيله في `localStorage` ليستمر اثناء التنقل بين الصفحات.

## كتل الكود

لنر بعض انماط كتل الكود:

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

وهناك ايضا كود inline: `1 + 2 = 3`. او ربما حتى `(= (+ 1 2) 3)`.

راجع [وثائق Expressive Code](https://expressive-code.com/key-features/syntax-highlighting/) لمزيد من المعلومات حول الميزات المتاحة مثل التفاف النص، تمييز الاسطر، diffs، وغيرها.

## عناصر Markdown الاساسية

- عنصر قائمة 1
- عنصر قائمة 2

**نص عريض**

_نص مائل_

~~نص مشطوب~~

[رابط](https://www.example.com)

> في الحياة كما في الفن، بعض النهايات حلوة ومرة. خصوصا عندما يتعلق الامر بالحب. احيانا يجمع القدر عاشقين فقط ليفرقهما. واحيانا يتخذ البطل اخيرا القرار الصحيح، لكن التوقيت يكون خاطئا. وكما يقال، التوقيت هو كل شيء.
>
> \- Gossip Girl

| الاسم   | العمر | المدينة     |
| ------- | ----- | ----------- |
| Alice   | 30    | New York    |
| Bob     | 25    | Los Angeles |
| Charlie | 35    | Chicago     |

---

## الصور

يمكن للصور ان تتضمن نص title بعد ال URL ليتم عرضها ك `<figure>` مع `<figcaption>`.

![Pixel art of a tree](./PixelatedGreenTreeSide.png 'Pixel art renders poorly without proper CSS')

```md title="Pixel art markdown" wrap
![Pixel art of a tree](./PixelatedGreenTreeSide.png 'Pixel art renders poorly without proper CSS')
```

اضفت ايضا tag خاصا ل pixel art يضيف CSS الصحيح لعرضها بشكل مناسب. فقط اضف `#pixelated` في نهاية نص alt.

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

## محادثات الشخصيات

```md title="Custom character chat" wrap
:::duck
**Did you know?** You can easily create custom character chats for your blog with MultiTerm!
:::
```

:::duck
**هل تعلم؟** يمكنك بسهولة انشاء محادثات شخصيات مخصصة لمدونتك باستخدام MultiTerm!
:::

### اضافة شخصيتك

لاضافة شخصيتك، اضف اولا ملف صورة الى directory `/public` في المستوى الاعلى من repo MultiTerm المستنسخ. لا يستطيع Astro تحسين image assets تلقائيا من Markdown plugins، لذلك تاكد من ضغط الصورة الى حجم مناسب للويب (<100kb).

انصح بتطبيق Google المجاني [Squoosh](https://squoosh.app) لانشاء ملفات webp صغيرة جدا. تم تغيير حجم الشخصيات هنا الى عرض 300 pixels وتصديرها الى webp بجودة 75% باستخدام Squoosh.

بعد اضافة الصورة، حدث خيار `characters` في `site.config.ts` بملف الصورة الجديد واعد تشغيل development server.

### محادثات الشخصيات

عندما توجد عدة محادثات شخصيات متتالية، ينعكس ترتيب صورة الشخصية وفقاعة الكلام ليمنح المحادثة مظهرا اقرب الى اخذ ورد.

```md title="Sequential character chats"
:::owl
This is a cool feature!
:::

:::unicorn
I agree!
:::
```

:::owl
هذه ميزة رائعة!
:::

:::unicorn
اتفق!
:::

يمكنك تحديد المحاذاة (`left` او `right`) لتجاوز الترتيب الافتراضي `left, right, left, ...`.

```md wrap title="Character chats with specific alignment"
:::unicorn{align="right"}
Over here, to the right!
:::
```

:::unicorn{align="right"}
هنا، الى اليمين!
:::

## GitHub Cards

بطاقات GitHub overview مستوحاة بقوة من [Astro Cactus](https://github.com/chrismwilliams/astro-theme-cactus).

```md title="GitHub repo card example in markdown"
::github{repo="stelcodes/multiterm-astro"}
```

::github{repo="stelcodes/multiterm-astro"}

```md wrap=true title="GitHub user card example in markdown"
::github{user="withastro"}
```

::github{user="withastro"}

## Emoji :star_struck:

يمكن اضافة emoji في Markdown عبر كتابة حرف emoji حرفيا او shortcode من GitHub. يمكنك تصفح قاعدة بيانات غير رسمية [هنا](https://emojibase.dev/emojis?shortcodePresets=github).

```md title="Example markdown with GitHub emoji shortcodes"
Good morning! :sleeping: :coffee: :pancakes:
```

صباح الخير! :sleeping: :coffee: :pancakes:

> يتم جعل كل ال emoji \(سواء الحرفية او shortcoded\) اكثر اتاحة عبر لفها داخل tag `span` هكذا:
>
> ```html
> <span role="img" aria-label="coffee">☕️</span>
> ```
>
> وقت الكتابة، [emoji v16](https://emojipedia.org/emoji-16.0) غير مدعومة بعد. يمكن تضمين هذه ال emoji حرفيا لكنها لا تملك shortcodes ولن يتم لفها.

## دعم LaTeX/KaTeX Math

يمكنك ايضا عرض math inline عبر [remark-math و rehype-katex](https://github.com/remarkjs/remark-math).

```txt title="Rendering inline math with KaTeX"
Make those equations pretty! $ \frac{a}{b} \cdot b = a $
```

اجعل هذه المعادلات جميلة! $ \frac{a}{b} \cdot b = a $

راجع [وثائق KaTeX](https://katex.org/docs/supported) لتتعلم الصياغة.

```md title="Rendering a block of KaTeX" wrap
$$
a + ar + ar^2 + ar^3 + \dots + ar^{n-1} = \displaystyle\sum_{k=0}^{n - 1}ar^k = a \bigg(\dfrac{1 - r^n}{1 -r}\bigg)
$$
```

$$
a + ar + ar^2 + ar^3 + \dots + ar^{n-1} = \displaystyle\sum_{k=0}^{n - 1}ar^k = a \bigg(\dfrac{1 - r^n}{1 -r}\bigg)
$$

## عناصر HTML

<button>زر</button>

### Fieldset مع inputs

<fieldset>
    <input type="text" placeholder="اكتب شيئا"><br>
    <input type="number" placeholder="ادخل رقما"><br>
    <input type="text" value="قيمة input"><br>
    <select>
        <option value="1">الخيار 1</option>
        <option value="2">الخيار 2</option>
        <option value="3">الخيار 3</option>
    </select><br>
    <textarea placeholder="ادخل تعليقا..."></textarea><br>
    <label><input type="checkbox"> افهم ذلك<br></label>
    <button type="submi">ارسال</button>
</fieldset>

### Form مع Labels

<form>
<label>
    <input type="radio" name="fruit" value="apple">
    تفاح
</label><br>

<label>
    <input type="radio" name="fruit" value="banana">
    موز
</label><br>

<label>
    <input type="radio" name="fruit" value="orange">
    برتقال
</label><br>

<label>
    <input type="radio" name="fruit" value="grape">
    عنب
</label><br>

<label>
    <input type="checkbox" name="terms" value="agree">
    اوافق على الشروط والاحكام
</label><br>
