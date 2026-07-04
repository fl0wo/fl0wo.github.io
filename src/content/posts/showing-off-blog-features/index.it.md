---
title: 'Demo delle funzionalita del blog'
published: 2025-07-20
draft: true
tags: ['astro', 'demo', 'markdown']
toc: true
coverImage:
  src: './cover.jpg'
  alt: 'Una persona con capelli corti e folti e occhiali da vista siede a una postazione ordinata, usando una app di ingrandimento per navigare una pagina web. La postura e corretta e rilassata. Sulla scrivania: un computer, un mouse, una grande lampada da scrivania e un piccolo quaderno.'
---

Dato che il post non ha una descrizione nel frontmatter, viene usato il primo paragrafo.

## Temi

> Usa il tuo tema editor preferito per il tuo blog!

I temi del sito arrivano dai temi Shiki integrati in Expressive Code. Puoi vederli [qui](https://expressive-code.com/guides/themes/#available-themes). Un sito puo avere uno o piu temi, definiti in `src/site.config.ts`. Ci sono tre modalita tra cui scegliere:

1. `single`: scegli un solo tema per il sito. Semplice.
2. `light-dark-auto`: scegli due temi da usare in modalita chiara e scura. L'header includera un pulsante per passare tra light/dark/auto. Per esempio, potresti scegliere `github-dark` e `github-light` con default `"auto"` e l'esperienza seguira subito il tema del sistema operativo dell'utente.
3. `select`: scegli due o piu temi per il sito e includi un pulsante nell'header per cambiare tra questi. Puoi includere quanti temi Shiki di Expressive Code vuoi. Lascia che gli utenti trovino il loro preferito!

> Quando l'utente cambia tema, la preferenza viene salvata in `localStorage` per persistere durante la navigazione.

## Blocchi di codice

Guardiamo qualche stile di blocco codice:

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

E anche un po' di codice inline: `1 + 2 = 3`. O magari anche `(= (+ 1 2) 3)`.

Vedi la [documentazione di Expressive Code](https://expressive-code.com/key-features/syntax-highlighting/) per maggiori informazioni sulle feature disponibili come wrapping del testo, evidenziazione delle linee, diffs, ecc.

## Elementi Markdown di base

- Elemento lista 1
- Elemento lista 2

**Testo in grassetto**

_Testo in corsivo_

~~Testo barrato~~

[Link](https://www.example.com)

> Nella vita, come nell'arte, alcuni finali sono agrodolci. Soprattutto quando si parla d'amore. A volte il destino fa incontrare due amanti solo per separarli. A volte l'eroe fa finalmente la scelta giusta, ma il tempismo e sbagliato. E, come si dice, il tempismo e tutto.
>
> \- Gossip Girl

| Nome    | Eta | Citta       |
| ------- | --- | ----------- |
| Alice   | 30  | New York    |
| Bob     | 25  | Los Angeles |
| Charlie | 35  | Chicago     |

---

## Immagini

Le immagini possono includere una stringa titolo dopo l'URL per essere renderizzate come `<figure>` con una `<figcaption>`.

![Pixel art of a tree](./PixelatedGreenTreeSide.png 'Pixel art renders poorly without proper CSS')

```md title="Pixel art markdown" wrap
![Pixel art of a tree](./PixelatedGreenTreeSide.png 'Pixel art renders poorly without proper CSS')
```

Ho anche aggiunto un tag speciale per pixel art che applica il CSS corretto per renderizzarla bene. Basta aggiungere `#pixelated` alla fine dell'alt.

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

## Chat con personaggi

```md title="Custom character chat" wrap
:::duck
**Did you know?** You can easily create custom character chats for your blog with MultiTerm!
:::
```

:::duck
**Lo sapevi?** Puoi creare facilmente chat con personaggi custom per il tuo blog con MultiTerm!
:::

### Aggiungere il tuo personaggio

Per aggiungere il tuo personaggio, prima aggiungi un'immagine nella directory `/public` al livello principale del repo MultiTerm clonato. Astro non puo ottimizzare automaticamente gli asset immagine dai plugin Markdown, quindi assicurati di comprimere l'immagine in una dimensione adatta al web (<100kb).

Consiglio la web app gratuita di Google [Squoosh](https://squoosh.app) per creare file webp molto piccoli. I personaggi qui sono stati ridimensionati a 300 pixel di larghezza ed esportati in webp con qualita 75% usando Squoosh.

Dopo aver aggiunto l'immagine, aggiorna l'opzione `characters` in `site.config.ts` con il nuovo file immagine e riavvia il server di sviluppo.

### Conversazioni tra personaggi

Quando ci sono piu chat con personaggi di fila, l'ordine dell'immagine e del fumetto si inverte per dare alla chat un aspetto piu botta e risposta.

```md title="Sequential character chats"
:::owl
This is a cool feature!
:::

:::unicorn
I agree!
:::
```

:::owl
Questa feature e forte!
:::

:::unicorn
Sono d'accordo!
:::

Puoi specificare l'allineamento (`left` o `right`) per sovrascrivere l'ordine predefinito `left, right, left, ...`.

```md wrap title="Character chats with specific alignment"
:::unicorn{align="right"}
Over here, to the right!
:::
```

:::unicorn{align="right"}
Qui, a destra!
:::

## GitHub Cards

Le card GitHub overview sono fortemente ispirate da [Astro Cactus](https://github.com/chrismwilliams/astro-theme-cactus).

```md title="GitHub repo card example in markdown"
::github{repo="stelcodes/multiterm-astro"}
```

::github{repo="stelcodes/multiterm-astro"}

```md wrap=true title="GitHub user card example in markdown"
::github{user="withastro"}
```

::github{user="withastro"}

## Emoji :star_struck:

Le emoji possono essere aggiunte in Markdown inserendo un carattere emoji letterale o uno shortcode GitHub. Puoi esplorare un database non ufficiale [qui](https://emojibase.dev/emojis?shortcodePresets=github).

```md title="Example markdown with GitHub emoji shortcodes"
Good morning! :sleeping: :coffee: :pancakes:
```

Buongiorno! :sleeping: :coffee: :pancakes:

> Tutte le emoji \(sia letterali sia con shortcode\) sono rese piu accessibili avvolgendole in un tag `span` cosi:
>
> ```html
> <span role="img" aria-label="coffee">☕️</span>
> ```
>
> Al momento della scrittura, [emoji v16](https://emojipedia.org/emoji-16.0) non e ancora supportata. Queste emoji possono essere incluse letteralmente ma non hanno shortcode e non verranno wrappate.

## Supporto matematico LaTeX/KaTeX

Puoi anche mostrare matematica inline tramite [remark-math e rehype-katex](https://github.com/remarkjs/remark-math).

```txt title="Rendering inline math with KaTeX"
Make those equations pretty! $ \frac{a}{b} \cdot b = a $
```

Rendi belle quelle equazioni! $ \frac{a}{b} \cdot b = a $

Consulta la [documentazione KaTeX](https://katex.org/docs/supported) per scoprire la sintassi.

```md title="Rendering a block of KaTeX" wrap
$$
a + ar + ar^2 + ar^3 + \dots + ar^{n-1} = \displaystyle\sum_{k=0}^{n - 1}ar^k = a \bigg(\dfrac{1 - r^n}{1 -r}\bigg)
$$
```

$$
a + ar + ar^2 + ar^3 + \dots + ar^{n-1} = \displaystyle\sum_{k=0}^{n - 1}ar^k = a \bigg(\dfrac{1 - r^n}{1 -r}\bigg)
$$

## Elementi HTML

<button>Un pulsante</button>

### Fieldset con input

<fieldset>
    <input type="text" placeholder="Scrivi qualcosa"><br>
    <input type="number" placeholder="Inserisci un numero"><br>
    <input type="text" value="Valore input"><br>
    <select>
        <option value="1">Opzione 1</option>
        <option value="2">Opzione 2</option>
        <option value="3">Opzione 3</option>
    </select><br>
    <textarea placeholder="Inserisci un commento..."></textarea><br>
    <label><input type="checkbox"> Ho capito<br></label>
    <button type="submi">Invia</button>
</fieldset>

### Form con label

<form>
<label>
    <input type="radio" name="fruit" value="apple">
    Mela
</label><br>

<label>
    <input type="radio" name="fruit" value="banana">
    Banana
</label><br>

<label>
    <input type="radio" name="fruit" value="orange">
    Arancia
</label><br>

<label>
    <input type="radio" name="fruit" value="grape">
    Uva
</label><br>

<label>
    <input type="checkbox" name="terms" value="agree">
    Accetto i termini e le condizioni
</label><br>
