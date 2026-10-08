---
title: 'Non siamo più attaccati al nostro codice'
published: 2026-10-08
draft: false
tags: ['agentic-coding', 'ai-agents', 'software-engineering', 'system-design', 'teamwork']
toc: true
---

“Qualcuno” ha twittato che prima dell'era della programmazione agentica gli sviluppatori erano estremamente gelosi del proprio codice e non riuscivano a separarlo dal proprio ego.

Ora che gli agenti stanno entrando in gioco, questo è cambiato.

<blockquote class="twitter-tweet" data-dnt="true" data-theme="dark" data-align="center"><p lang="en" dir="ltr">It was almost impossible for a programmer who wrote all their code by hand to divorce their ego from the output. Now agents are delivering what decades of agile admonishing about “collective ownership” never could. What a gift!</p>&mdash; DHH (@dhh) <a href="https://x.com/dhh/status/2107375021572444355">October 6, 2026</a></blockquote>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

Ricordo come, qualche anno fa, per portare in produzione una nuova funzionalità o un nuovo prodotto bisognasse conoscere ogni singolo dettaglio della sua implementazione, fino all'ultimo bit, e alcuni di questi potevano richiedere sessioni di lavoro complicate di giorni, settimane o mesi.

Quando il mio codice finalmente funzionava, significava molto, perché era il risultato di fatica, frustrazione e piccole vittorie lungo il percorso.

Se qualcuno proponeva di sostituirlo (radicalmente) con un approccio (completamente) diverso, la risposta era quasi sempre “Ci ho passato troppo tempo; funziona; non dovremmo toccarlo”

Così le discussioni sul refactoring del codice creavano sempre tensione, perché sotto sotto nascondevano ore e ore di notti insonni e fatica.

Ora, dato che sono gli agenti a scrivere la maggior parte delle implementazioni, questa pressione non c'è più.

Se un collega mi dice di aver trovato un modo migliore per realizzare una funzionalità che ho rilasciato il mese scorso, non ho molti motivi per difenderla.

L'ho descritta, l'ho verificata, ma non ci ho sofferto sopra.

L'attaccamento in sé non è sparito; si sposta semplicemente su qualcosa di più importante: il design architetturale, lo stack tecnologico, la definizione dell'infrastruttura, le operations, il prodotto, ecc.

Quelle decisioni richiedono ancora un ragionamento vero, e sono quelle che difenderei in una review.

Il codice in sé è solo un modo per esprimere quelle idee.

Quindi le decisioni che hanno portato a quel codice: è lì il posto giusto per l'attaccamento.

Questo apre le porte a molta più sperimentazione e a una maggiore capacità di cambiare e adattarsi in modo più flessibile, senza dover abbattere il muro dell'ego degli ingegneri.

C'è però un rischio da tenere a mente.

Non essere attaccati al codice può anche voler dire non capirlo.

Sostituire parti di codice si può fare in sicurezza solo se gli ingegneri sanno cosa deve fare il sistema e hanno test che dimostrano che la sostituzione lo fa ancora.
