---
title: 'Imparare la codebase è infrastruttura per agenti'
published: 2026-07-08
draft: true
tags: ['agentic-coding', 'codebase-learning', 'developer-tools', 'ai-agents', 'software-engineering']
toc: true
---

I coding agent stanno diventando così bravi che la parte strana non è più se sanno scrivere codice.

Sanno farlo.

La parte più strana è cosa succede allo sviluppatore quando lo fanno.

Quando un modello inizia a fare scelte implementative migliori, non solo a scrivere codice sintatticamente corretto, il workflow cambia. Non è più solo autocomplete. Diventa qualcosa di più simile a lavorare con un senior engineer che sa pianificare, delegare, rifattorizzare e ripulire il lavoro di altri modelli.

È potente.

Ma crea anche una nuova modalità di fallimento.

Leggi meno codice.

All'inizio, sembra proprio il punto della questione. Meno implementazione manuale. Meno scavare tra i file. Meno noioso lavoro di raccordo. Più velocità di prodotto.

Ma leggere codice non è mai stato solo un mezzo per produrre codice.

Leggere codice era il modo in cui imparavi la codebase.

Il prossimo collo di bottiglia nell'agentic coding non è solo la context window del modello.

È la context window dell'umano.

## Il nuovo workflow di coding

Il workflow emergente assomiglia più o meno a questo:

- Usa un modello forte come orchestratore.
- Usa modelli più economici o più veloci come worker di implementazione.
- Lascia che l'orchestratore pianifichi, riveda, rifattorizzi e guidi.
- Lascia che i modelli da lavoro scrivano la maggior parte del codice.
- Lascia che l'umano descriva l'intento, approvi la direzione e intervenga quando conta il gusto.

Ha senso.

Il modello da lavoro può generare molto codice. Può risolvere la maggior parte dei task di implementazione. Può andare avanti a lungo senza bloccarsi.

L'orchestratore può comportarsi più come uno sviluppatore senior. Può prendere decisioni di design migliori, accorgersi quando una modifica sta accumulando troppo debito e rifattorizzare l'implementazione in qualcosa di più pulito.

Il risultato è un workflow in cui viene scritto molto codice senza che l'umano tocchi ogni file.

Non è automaticamente un male.

Anzi, potrebbe essere la forma corretta dello sviluppo software del futuro.

Ma cambia quello che l'umano fa.

L'umano non scrive più principalmente il codice.

L'umano guida il sistema che scrive il codice.

E guidare richiede contesto.

## Il vecchio meccanismo di sicurezza

Prima degli agenti, il workflow era più lento.

Aprivi i file. Trovavi il componente rilevante. Leggevi il codice circostante. Notavi il naming strano. Imparavi dove viveva lo stato. Scoprivi la vecchia astrazione che non piaceva a nessuno ma da cui tutti dipendevano ancora.

Poi facevi la modifica.

Quel processo sembrava inefficiente perché gran parte di esso non era direttamente produttivo.

Ma aveva un effetto collaterale importante: caricava la codebase nella tua testa.

Imparavi:

- Dove stanno le cose.
- Come si chiamano le cose.
- Quali componenti possiedono quali responsabilità.
- Quali astrazioni sono reali e quali sono accidentali.
- Quali parti della codebase sono pulite.
- Quali parti sono maledette.
- Quali tradeoff erano intenzionali.
- Quali tradeoff sono solo danni storici.

Quella conoscenza rendeva migliori i tuoi prompt futuri prima ancora che i prompt esistessero.

Rendeva migliori le tue pull request future.

Rendeva migliore il tuo giudizio di prodotto.

La codebase ti insegnava mentre ci lavoravi sopra.

## La nuova modalità di fallimento

Con gli agenti, il loop può diventare:

```txt
describe intent
agent searches code
agent edits files
agent runs tests
agent summarizes changes
human skims diff
human approves
```

Quel loop è veloce.

Ma rimuove anche molto apprendimento accidentale.

Puoi rilasciare la feature senza mai costruire un vero modello mentale del codice che hai appena cambiato.

Le prime volte va bene. Il modello aveva abbastanza contesto. Il diff sembrava ragionevole. I test passavano. Il prodotto andava avanti.

Poi la codebase continua a cambiare.

Alcune modifiche le fai tu. Alcune gli agenti. Alcune altre persone che usano agenti. Il sistema cresce. Le astrazioni si spostano. Compaiono nuove convenzioni. Quelle vecchie decadono. I componenti si muovono. Le responsabilità si dividono. Lo stato migra da un layer a un altro.

Conosci ancora il prodotto.

Ma sai sempre meno di come il prodotto è rappresentato nel codice.

A un certo punto il problema non è che l'agente non sa scrivere il codice.

Il problema è che tu non sai cosa chiedere.

## La qualità dei prompt decade con il contesto umano

I buoni prompt non sono parole magiche.

I buoni prompt sono contesto compresso.

Un prompt debole dice:

```txt
Make the sidebar work with team workspaces.
```

Un prompt più forte dice:

```txt
The sidebar is currently user-scoped, but navigation needs to become workspace-scoped.

Keep the Sidebar component presentational.
Move workspace resolution into the navigation provider.
Preserve the command palette behavior.
Do not duplicate route filtering logic.
Update the empty state for users with access to multiple workspaces.
```

Il secondo prompt non è migliore perché è più lungo.

È migliore perché l'umano capisce la codebase.

Sa dove dovrebbe vivere la responsabilità. Sa quale astrazione non va duplicata. Sa quale feature adiacente dipende dallo stesso stato. Conosce la vecchia intenzione e quella nuova.

Questa è la parte che gli agenti non eliminano.

Rendono più facile implementare una direzione.

Non eliminano il bisogno di scegliere la direzione.

Se l'umano perde la mappa, la guida peggiora.

E quando la guida peggiora, alla fine peggiora anche il prodotto.

## Il problema si sposta

Molta infrastruttura per agenti è concentrata sul dare più contesto al modello.

È utile.

Gli agenti devono cercare nel repo. Devono leggere i file. Devono ispezionare le trace. Devono eseguire i test. Devono recuperare l'intento architetturale da qualunque artefatto esista.

Ma c'è un altro problema di contesto.

Anche l'umano ha bisogno di contesto.

Non ogni dettaglio. Non ogni riga. Non ogni funzione helper.

Ma abbastanza per prendere buone decisioni.

Abbastanza per sapere:

- Qual è la forma di questa feature?
- Cosa possiede questo stato?
- Cosa sta cercando di essere questo componente?
- Quali parti sono legacy?
- Quali astrazioni sono portanti?
- Quali nomi contano?
- Quali decisioni sono ancora valide?
- Quali decisioni sono state prese per requisiti che non esistono più?

L'agente ha bisogno di contesto per agire.

L'umano ha bisogno di contesto per giudicare.

Sono due prodotti diversi.

## Il layer mancante è l'apprendimento della codebase

Lo strumento mancante non è solo una code search migliore.

Non è solo documentazione migliore.

È un insegnante della codebase.

Qualcosa che insegna continuamente all'umano come funziona il sistema.

Non in astratto.

Non come un README gigante che marcisce lentamente.

Ma come un layer di spiegazione vivo attaccato alla codebase.

Un buon insegnante della codebase dovrebbe rispondere a domande come:

- Quali sono i concetti principali in quest'area?
- Da dove viene questa UI?
- Quale componente possiede questo comportamento?
- Perché questo flusso è diviso tra questi file?
- Cosa è cambiato di recente?
- Qual è la direzione prevista?
- Cosa non dovrei toccare con leggerezza?
- Qual è il vecchio design da cui stiamo cercando di migrare?

Non serve solo per l'onboarding di nuovi ingegneri.

Serve agli ingegneri esistenti che usano gli agenti abbastanza da non assorbire più naturalmente la codebase attraverso l'implementazione manuale.

Più codice scrive l'agente, più questo diventa importante.

## Documentazione per l'umano, non per l'agente

C'è la tentazione di risolvere il problema infilando più documentazione nel contesto dell'agente.

Questo aiuta l'agente.

Non aiuta davvero l'umano.

L'umano non ha bisogno di un dump di contesto gonfio prima di ogni task. L'umano ha bisogno di una mappa navigabile.

Un layer utile di apprendimento della codebase dovrebbe essere ottimizzato per la progressive disclosure.

Parti dall'alto livello:

- Cos'è questa feature?
- Quali sono i concetti fondamentali?
- Quali sono i flussi principali?

Poi lascia che l'umano scenda nel dettaglio:

- Quali file la implementano?
- Quali componenti sono coinvolti?
- Quali servizi vengono chiamati?
- Dove vive lo stato?
- Quali sono gli edge case?

Poi scendi più in basso solo quando serve:

- Perché esiste questa funzione?
- Quali assunzioni fa?
- Cosa si rompe se la cambio?

La maggior parte delle volte, all'umano non serve il livello più basso.

Gli serve il livello sopra il codice.

Gli servono le intenzioni.

## L'albero della conoscenza

Una forma pratica è un albero di file Markdown.

Non un documento gigante.

Non README sparsi.

Un albero di conoscenza strutturato.

Per esempio:

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

La cima dell'albero dovrebbe essere leggibile in un minuto.

Ogni pagina dovrebbe puntare a pagine più profonde.

Ogni pagina più profonda dovrebbe spiegare una cosa in modo chiaro.

Il punto non è documentare ogni riga di codice.

Il punto è preservare la mappa che l'umano un tempo costruiva manualmente leggendo il codice.

## Preferisci le intenzioni ai riassunti

La documentazione generata fatta male assomiglia a questo:

```txt
This file exports a React component called Sidebar.
It imports useWorkspace, Link, cn, and NavigationItem.
It renders a list of navigation items.
```

È tecnicamente vero.

Ed è anche in gran parte inutile.

Il codice lo dice già.

La documentazione utile spiega l'intento:

```txt
Sidebar is intentionally presentational.

It receives the resolved navigation model from WorkspaceNavigationProvider
and should not decide which workspace is active.

This keeps route ownership in one place and prevents the command palette,
sidebar, and mobile nav from each implementing their own filtering logic.
```

Questa è la conoscenza di cui l'umano ha bisogno.

Non solo cosa fa il codice.

Perché il codice ha quella forma.

## Fai in modo che la UI spieghi il codice

Per i product engineer, molto dell'apprendimento della codebase parte dall'interfaccia.

Vedi un bottone.

Vuoi sapere dove vive.

Vedi una pagina.

Vuoi sapere quali componenti la compongono.

Vedi un comportamento strano.

Vuoi sapere quale transizione di stato l'ha causato.

Un insegnante della codebase dovrebbe collegare la UI al codice.

Per esempio, immagina un overlay di sviluppo che ti permette di ispezionare una pagina e vedere:

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

Uno strumento del genere cambia il modo in cui scrivi i prompt.

Invece di dire:

```txt
Change the settings page so members are easier to invite.
```

Puoi dire:

```txt
In WorkspaceSettingsPage, update WorkspaceMembersPanel so the invite flow is primary.

Keep pending invite modal state local to the members panel.
Do not move billing logic.
Preserve the selected settings tab in the URL.
```

Il secondo prompt non è solo più specifico.

È ancorato alla codebase.

## Traccia le decisioni, non solo i file

La maggior parte della conoscenza di una codebase non è conoscenza dei file.

È conoscenza delle decisioni.

Le domande importanti di solito sono:

- Perché questo stato sta qui?
- Perché questa feature è divisa qui?
- Perché questo servizio possiede questa operazione?
- Perché non stiamo usando il componente condiviso?
- Perché questo è ancora duplicato?

Gli agenti spesso possono inferire queste risposte dal codice, ma l'inferenza non è la stessa cosa della conoscenza.

Se la decisione conta, scrivila.

Una nota di decisione può essere piccola:

```md
# Decision: Workspace Navigation Owns Route Filtering

Date: 2026-07-08

Workspace navigation owns route filtering because the sidebar,
mobile navigation, and command palette all need the same visibility rules.

Do not duplicate filtering in individual components.

If workspace roles become more complex, extend the navigation model instead
of adding per-component permission checks.
```

Questa non è burocrazia.

È infrastruttura di guida.

La prossima volta che un umano chiede a un agente di cambiare la navigazione, l'umano può recuperare rapidamente l'intenzione e scrivere il prompt a partire da essa.

## Tieni traccia del debito

Gli agenti sanno aggirare il debito tecnico in modo molto efficace.

A volte troppo efficace.

Un modello forte può girare intorno alle cattive astrazioni, rattoppare codice fragile e far passare i test. Utile nel breve termine. Ma può anche nascondere il fatto che il sistema sta diventando più difficile da capire.

Il debito dovrebbe far parte del layer di apprendimento.

Non come vergogna.

Come dato della mappa.

Per esempio:

```md
# Known Debt: Billing Settings

- Billing provider logic is still partially mixed into the UI layer.
- Subscription status names are provider-shaped, not domain-shaped.
- There are two sources of truth for trial expiration.
- The current migration direction is to introduce BillingAccount as the domain object.
```

Questo aiuta l'umano a guidare.

Un prompt debole dice:

```txt
Add support for annual plans.
```

Un prompt più forte dice:

```txt
Add support for annual plans, but do not deepen the provider-shaped status model.

Use this as a step toward BillingAccount becoming the domain object.
Avoid adding new subscription status branching inside the UI components.
```

Quel prompt è possibile solo se l'umano conosce il debito.

## L'agente dovrebbe aggiornare l'insegnante

Il layer di apprendimento non può dipendere da umani che scrivono documentazione perfetta dopo ogni modifica.

Fallirà.

L'agente dovrebbe aggiornare l'insegnante della codebase come parte del ciclo di sviluppo.

Dopo una modifica significativa, l'agente dovrebbe produrre un knowledge diff:

- Overview della feature aggiornata
- Componenti coinvolti aggiornati
- Nuova nota di decisione aggiunta
- Nuovo debito noto aggiunto
- Vecchia intenzione marcata come deprecata
- File modificati collegati

La pull request dovrebbe includere sia il codice sia la spiegazione.

Non un saggio gigante.

Un piccolo aggiornamento strutturato alla mappa.

Per esempio:

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

Questo rende il lavoro dell'agente leggibile per l'umano in seguito.

E rende anche migliore il prompting futuro.

## Cambia anche la review

Anche la code review cambia.

Nel vecchio workflow, la review riguardava soprattutto il diff.

Con gli agenti, la review deve includere il layer di conoscenza.

Per le modifiche significative, chi fa la review dovrebbe chiedersi:

- La modifica al codice corrisponde all'architettura prevista?
- L'agente ha creato una nuova astrazione o ne ha approfondita una vecchia?
- Qualche concetto è stato rinominato?
- La ownership dello stato si è spostata?
- L'albero della documentazione è stato aggiornato?
- Il decision record è cambiato?
- Il debito noto è cambiato?
- Un umano futuro saprebbe come scrivere prompt su quest'area?

Quest'ultima domanda conta.

Una codebase può passare i test e diventare comunque più difficile da guidare.

## Non si tratta di non leggere codice

L'obiettivo non è smettere del tutto di leggere codice.

Quella è una fantasia.

A volte devi ispezionare l'implementazione esatta. A volte l'astrazione perde. A volte il riassunto del modello è sbagliato. A volte l'unico modo per capire un bug è leggere la funzione ed eseguire il test.

L'obiettivo è diverso.

Leggi il codice quando il codice è il livello di dettaglio giusto.

Non costringere gli umani a riscoprire l'intera architettura dai file grezzi ogni volta che devono prendere una decisione di prodotto.

Una mappa non sostituisce il territorio.

Ma senza una mappa, ogni viaggio parte da zero.

## Un contratto pratico per l'insegnante della codebase

Per ogni feature importante, punta a un piccolo insieme di documenti vivi.

### A livello di feature

Spiega:

- Cosa fa la feature.
- I principali flussi utente.
- I concetti di dominio fondamentali.
- L'attuale intenzione di prodotto.
- I principali entry point.
- I file importanti.
- Gli edge case noti.

Evita:

- Ripetere la struttura ovvia del codice.
- Elencare ogni import.
- Scrivere prosa generata che non dice nulla.
- Mischiare intenzioni superate con quelle attuali.

### A livello di componente

Spiega:

- Cosa possiede il componente.
- Cosa il componente non deve possedere.
- Quali prop sono concetti di dominio.
- Quale stato è locale.
- Quale stato viene dalla URL, dal server o dal provider.
- Quali altri componenti dipendono dallo stesso modello.

Evita:

- Trattare ogni componente allo stesso modo.
- Documentare componenti presentazionali banali.
- Descrivere il JSX riga per riga.

### A livello di decisione

Spiega:

- Quale decisione è stata presa.
- Perché è stata presa.
- Quali alternative sono state scartate.
- Cosa renderebbe la decisione non più valida.
- Dove la decisione è implementata.

Evita:

- Trasformare le note di decisione in verbali di riunione.
- Mantenere decisioni dopo che non sono più vere.
- Nascondere l'incertezza.

### A livello di debito

Spiega:

- Cosa è scomodo.
- Perché esiste.
- Su cosa non costruire.
- In quale direzione dovrebbe muoversi il codice.
- Quale modifica futura lo ripagherebbe.

Evita:

- Lamentele vaghe.
- Colpe.
- Wishlist giganti di refactor.
- Note di debito senza valore di guida.

### A livello di modifica

Spiega:

- Cosa è cambiato.
- Perché è cambiato.
- Quali intenzioni sono cambiate.
- Quali file contano.
- Quali prompt sarebbero migliori la prossima volta.
- Quali documenti sono stati aggiornati.

Evita:

- Il rumore da riassunto di commit.
- Le spiegazioni tipo "Updated code".
- I riassunti generati e mai aggiornati.

## Checklist per codebase agentiche pronte per l'umano

Prima di affidarti pesantemente agli agenti in una codebase, chiediti:

- Uno sviluppatore può capire il sistema ad alto livello senza leggere ogni file?
- Esiste un glossario per i concetti di dominio?
- Uno sviluppatore può mappare un elemento visibile della UI al suo componente?
- Uno sviluppatore può trovare dove è posseduto lo stato?
- Uno sviluppatore può vedere quali astrazioni sono intenzionali?
- Uno sviluppatore può vedere quali astrazioni sono legacy?
- Le decisioni importanti sono scritte da qualche parte?
- I debiti noti sono scritti come note di guida?
- L'agente aggiorna la documentazione dopo le modifiche significative?
- Le modifiche alla documentazione vengono riviste insieme a quelle al codice?
- L'umano può recuperare rapidamente abbastanza contesto per scrivere un buon prompt?
- L'umano può accorgersi quando l'agente si sta muovendo nella direzione sbagliata?
- Il layer di conoscenza è organizzato per feature, concetto e intenzione?
- Il dettaglio di basso livello è disponibile senza gonfiare il livello alto?
- Un nuovo sviluppatore saprebbe cosa non toccare con leggerezza?
- Una versione futura di te capirebbe perché questo codice ha questa forma?

Il punto non è la copertura della documentazione.

Il punto è la qualità della guida.

## Il tradeoff

L'agentic coding crea un tradeoff reale.

Se leggi ogni riga, rinunci a gran parte della velocità che gli agenti offrono.

Se non leggi quasi nulla, perdi lentamente la capacità di guidare.

La risposta non è tornare al coding manuale.

La risposta non è nemmeno fidarsi ciecamente dell'agente.

La risposta è un layer di apprendimento della codebase:

- Mappe leggibili dagli umani.
- Spiegazioni a livello di feature.
- Note di ownership dei componenti.
- Decision record.
- Debito noto.
- Navigazione dalla UI al codice.
- Riassunti delle modifiche.
- Dettaglio progressivo.
- Documentazione aggiornata dagli agenti.
- Intenzioni rivedibili.

Questo dà all'umano abbastanza contesto per guidare il sistema senza costringerlo a ricostruirlo manualmente da zero.

## Il cambiamento

Lo sviluppo software un tempo insegnava allo sviluppatore facendogli scrivere il codice.

L'agentic coding rompe questo default.

Il codice ora può essere scritto senza che l'umano lo impari tutto.

Questa è l'opportunità.

Ed è anche il rischio.

Lo sviluppatore del futuro non è solo uno scrittore di prompt. Lo sviluppatore del futuro è un custode di intenzioni. Decide cosa deve diventare il sistema, quali astrazioni devono sopravvivere, quali debiti vanno ripagati e in quale direzione devono muoversi gli agenti.

Ma non puoi custodire ciò che non capisci.

L'apprendimento della codebase non è teatro della documentazione.

È il modo in cui tieni l'umano nel loop senza costringerlo a leggere ogni riga.

È il modo in cui fai scrivere agli agenti più codice senza far capire agli umani meno software.

Il tuo agente può avere una context window più grande.

Il tuo prodotto dipende ancora da quella umana.
