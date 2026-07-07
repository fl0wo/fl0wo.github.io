---
title: 'Log puliti sono infrastruttura per agenti'
published: 2026-07-07 
draft: false
tags: ['agentic-coding', 'observability', 'cloudflare', 'mcp', 'logging', 'debugging']
toc: true
coverImage:
  src: './blog2.png'
  alt: 'Illustrazione in stile schizzo di un robot che versa un groviglio di log di produzione grezzi e rumorosi in un imbuto-filtro di observability, trasformandoli a destra in eventi di log strutturati e puliti con campi coerenti, sopra una dashboard di observability per agenti con eventi nel tempo, tasso di errore e principali endpoint'
---

I coding agent sanno leggere il codice. Sanno eseguire i test. Sanno cercare nella documentazione. E, se gli dai accesso, sanno ispezionare i log di produzione tramite i server MCP di observability.

Quest'ultima parte è più importante di quanto sembri a prima vista. I log di produzione non sono più solo per umani che strizzano gli occhi davanti alle dashboard. Adesso sono un'interfaccia che il tuo agente può interrogare, filtrare, raggruppare, correlare e su cui può ragionare.

Il che significa che i log fatti male non sono più soltanto fastidiosi.

I log fatti male rendono il tuo agente peggiore.

## Il nuovo consumatore dei tuoi log

Per anni, i consigli sul logging sono stati scritti per gli umani:

- Rendi leggibili gli errori.
- Includi abbastanza contesto.
- Evita di loggare i segreti.
- Non spammare in produzione.

Tutto ancora vero. Ma il debugging agentico aggiunge un secondo consumatore: un investigatore guidato da un LLM che usa strumenti come il Workers Observability MCP di Cloudflare per rispondere a domande a partire dalla telemetria di produzione.

Quell'agente è eccellente in alcune cose in cui gli umani sono lenti:

- Cercare una frase rara in una settimana di log.
- Raggruppare gli errori per endpoint, wallet, segmento utente, provider, route o status.
- Ricostruire timeline attraverso richieste API, alarm di Durable Object, cron job e webhook.
- Confrontare il comportamento prima e dopo un incidente.
- Formulare un'ipotesi dal codice, poi verificarla contro le evidenze di produzione.

Ma è anche facile da fuorviare. Se i tuoi log sono rumorosi, non strutturati, pieni di payload grezzi o privi di campi di correlazione, l'agente spende il suo budget di contesto in spazzatura. Trova la cosa più rumorosa invece di quella rilevante.

La qualità dei tuoi log diventa la qualità degli occhi del tuo agente.

## Un piccolo incidente, anonimizzato

Immagina un flusso semplice:

1. Un utente scambia un asset con un altro.
2. Subito dopo il trade, il sistema prova a prelevare il nuovo asset.
3. L'exchange accetta la richiesta di prelievo e restituisce un reference ID esterno.
4. La transazione locale, più tardi, risulta fallita.

Un umano probabilmente partirebbe dalla risposta dell'API. L'exchange l'ha rifiutata? L'indirizzo era sbagliato? Il network non era supportato? Il calcolo della fee ha lasciato il prelievo sottofinanziato?

Un agente con observability sulla produzione può fare di meglio, ma solo se i log hanno una forma pensata per l'indagine.

La timeline utile dovrebbe apparire così:

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

Questo è debuggabile. L'agente può cercare per `recordId`, raggruppare per `providerRawStatus`, ispezionare tutti i fallimenti per la stessa coppia asset/network e verificare se lo status fallito è arrivato dall'exchange, dal layer locale di post-processing, da un retry di webhook o da un poller in background.

Ora confrontalo con la solita brodaglia di log di produzione:

```txt
Direct execution [abc123] { giant workflow params object... }
balancesWithNetworkInfo [...]
sortedBalances [...]
[WebhookEndpoints] Found 7 active endpoints
[WebhookEndpoints] Endpoint 0 events=[...]
[TenantDO] Alarm triggered
Error: failed
```

L'agente può ancora cercarci dentro, ma deve dedurre tutto. Peggio: i log rumorosi del percorso di successo seppelliscono l'unica riga che conta.

Quando gli agenti indagano in produzione, il rumore nei log non è un problema estetico. È attrito operativo.

## Cosa rende un log agent-friendly?

I log agent-friendly hanno cinque proprietà.

### 1. Nomi di evento stabili

Ogni evento importante dovrebbe avere un nome stabile e a bassa cardinalità:

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

Preferiscilo a:

```ts
console.log(`Starting withdrawal for ${walletId} on ${exchange}`)
```

La versione in prosa è leggibile una volta. La versione strutturata è ricercabile per sempre.

Nomi di evento stabili permettono all'agente di chiedere:

- Mostrami tutti gli eventi `withdraw.execute.started` intorno a quest'ora.
- Conta i `withdraw.native_poll.status_changed` per `currentStatus`.
- Trova ogni `webhook.delivery.max_attempts` negli ultimi sette giorni.
- Confronta gli `api.request.failed` per route path.

I buoni nomi di evento sono noiosi. È proprio quello il punto.

Usa un namespace prevedibile:

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

Il nome dovrebbe dire cosa è successo, non includere i dati che cambiano. Metti i valori variabili nei campi.

### 2. Campi di correlazione ovunque

Un agente non può ricostruire una timeline senza appigli.

Per i sistemi transazionali, gli stessi campi dovrebbero comparire nei log di richiesta, persistenza, polling, webhook ed errore:

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

Non serve ogni campo su ogni log. Ma ogni log dovrebbe includerne abbastanza da potersi agganciare allo step successivo.

I campi più preziosi di solito sono:

- ID del tenant o dell'organizzazione.
- ID dell'utente o del wallet.
- Request ID, quote ID, order ID, transaction ID o chiave di idempotenza.
- Nome dell'exchange/provider.
- Asset e network.
- Route path, non URL grezzo.
- Reference ID esterno del provider.
- Status precedente e successivo quando lo stato cambia.

Per i sistemi in background, includi anche l'identità di scheduling:

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

Questo permette all'agente di rispondere alla vera domanda: "Che fine ha fatto questa cosa dopo che l'API ha risposto?"

### 3. Log per le transizioni di stato, non per ogni passaggio

Non loggare ogni battito di ciglia.

Logga ogni transizione di stato significativa.

Bene:

```txt
withdraw.execute.started
withdraw.execute.completed
withdraw.transaction.persisted
withdraw.native_poll.status_changed
withdraw.error
webhook.delivery.max_attempts
```

Di solito rumore:

```txt
Alarm triggered
Processing 12 pending items
Found endpoint 0
Found endpoint 1
Broadcasted to 0 listeners
Balance array after enrichment: [...]
Successfully refreshed balances
```

La distinzione non è "log di successo cattivi, log di errore buoni". I log di successo sono utili quando marcano un confine:

- Un ordine di trade è stato accettato.
- Un prelievo è stato inviato.
- Una riga di transazione è stata persistita.
- Un poller ha osservato uno status terminale del provider.
- Un webhook è stato finalmente consegnato dopo i retry.

Ma le chiacchiere del percorso di successo dentro loop stretti o alarm frequenti domineranno i risultati delle query.

Una regola semplice: se il log non aiuterebbe a ricostruire la timeline di un incidente, probabilmente non ha posto in produzione a livello `info`.

### 4. Errori strutturati senza payload grezzi

Gli agenti hanno bisogno del contesto dell'errore. Non hanno bisogno di segreti, indirizzi, risposte API, cookie, firme, token o payload di webhook completi.

Mai fare questo:

```ts
console.error('Withdrawal failed:', rawProviderResponse)
```

Fai questo:

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

Persisti le risposte grezze del provider dove serve, dietro i tuoi normali controlli di accesso ai dati. Mantieni i log sicuri e compatti.

Questo conta per due ragioni:

1. I log tendono a fluire in molti sistemi con molti lettori.
2. Gli agenti sono bravissimi nel pattern matching, ma ogni oggetto grezzo in più brucia contesto e aumenta la probabilità di estrarre il segnale sbagliato.

Sanifica al confine del logger, non in ogni call site. Un piccolo logger condiviso dovrebbe oscurare chiavi come:

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

Rimuovi anche le query string dai campi URL. Gli URL dei webhook, i callback OAuth e gli URL dei provider trasportano spesso dati sensibili o ad alta cardinalità.

### 5. Bassa cardinalità di default

Gli agenti raggruppano spesso i log. Nomi di evento e campi ad alta cardinalità rendono il raggruppamento inutile.

Evita nomi di evento come:

```txt
withdraw.failed.ASSET.NETWORK.wallet_123
```

Usa:

```ts
logError('withdraw.error', {
  asset: 'ASSET',
  network: 'Ethereum',
  walletId: 'wallet_123',
})
```

Il nome dell'evento dovrebbe essere stabile. I campi dovrebbero variare.

Per i path, logga i route pattern invece dei path grezzi:

```txt
/v0/wallet/transaction/:id
```

invece di:

```txt
/v0/wallet/transaction/transaction_123
```

Questo permette all'agente di raggruppare i fallimenti per endpoint invece di produrre un gruppo per ogni UUID.

## Un contratto di logging pratico

Ecco il contratto di logging che ora voglio in qualsiasi API su Workers che un agente dovrà debuggare in futuro.

### Middleware API

Al bordo dell'app:

- Logga i 500 che non lanciano eccezioni come `api.request.failed`.
- Logga gli errori inattesi lanciati come `api.request.error`.
- Logga le richieste riuscite ma lente come `api.request.slow`.
- Includi metodo, route path, status, durata, gli ID del tenant, l'ID di wallet/utente se disponibile e il Ray ID di Cloudflare se presente.

Non riabilitare il logging generico delle richieste a meno che tu non abbia il sampling e una ragione chiara. I log con una riga per richiesta possono sommergere tutto il resto.

### Command handler

All'inizio di un'operazione importante:

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

Al completamento:

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

Sugli errori attesi del provider:

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

Evita di scaricare interi body di richiesta o di risposta.

### Durable Object e alarm

Gli alarm dei Durable Object sono spesso i peggiori colpevoli. Girano di frequente, e la tentazione è loggare ogni passaggio:

```txt
Alarm triggered
Processing 10 retries
No webhook endpoints found
Item already terminal
```

Gran parte di quella roba dovrebbe sparire.

Tieni:

- Retry esauriti.
- Status cambiato.
- Polling del provider fallito.
- Consegna del webhook fallita definitivamente.
- Decifratura del segreto fallita.
- Fallimento inatteso di persistenza.

Butta:

- Alarm scattato.
- Niente da fare.
- Già schedulato.
- Già terminale.
- Nessun subscriber.
- Broadcast riuscito.

L'alarm non è la storia. La transizione di stato è la storia.

### Webhook

I sistemi di webhook hanno bisogno di log, ma non per ogni ramo interno.

Utile:

```txt
webhook.delivery.failed_attempt
webhook.delivery.max_attempts
webhook.endpoint.secret_missing
webhook.endpoint.secret_decrypt_failed
```

Di solito rumore:

```txt
Querying endpoints
Found 3 endpoints
Endpoint 0 has event=true
Delivery succeeded
Scheduled retry for 2026-...
```

Il database ha già i record delle consegne. I log dovrebbero evidenziare le condizioni che un agente dovrebbe indagare.

## Prima e dopo

Prima:

```ts
console.log('balancesWithNetworkInfo', balancesWithNetworkInfo)
console.log('enrichedBalances', enrichedBalances)
console.log('sortedBalances', sortedBalances)
console.error(`Failed to store transaction ${txid}:`, err)
console.log('[TenantDO] Alarm triggered')
console.log(`[WebhookEndpoints] Found ${endpoints.length} active endpoints`)
```

Dopo:

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

La seconda versione ha meno testo e più informazione.

È questo il trucco fondamentale.

## Il loop di debugging dell'agente

Una volta che i log sono puliti, il loop di debugging cambia.

Invece di chiedere a un agente:

> Puoi guardare questo singolo errore e indovinare cos'è successo?

Puoi chiedere:

> Cerca nei log di produzione questo transaction ID, ricostruisci la timeline, raggruppa i fallimenti simili degli ultimi sette giorni e confronta i raw status del provider per asset/network.

L'agente può quindi:

1. Leggere i percorsi di codice rilevanti.
2. Interrogare i log per nome di evento stabile.
3. Fare pivot sui campi di correlazione.
4. Identificare se il fallimento è arrivato dalla gestione della richiesta, dall'invio al provider, dalla persistenza locale, dal polling in background o dalla consegna dei webhook.
5. Trovare casi simili.
6. Suggerire se si tratta di un bug nel codice, di un comportamento del provider, di un problema di configurazione dell'utente o di un'aspettativa di prodotto mancante.

È un workflow qualitativamente diverso dallo speleologare nelle dashboard.

Funziona solo se i log collaborano.

## Una checklist per log agent-ready

Usala prima di rilasciare un nuovo workflow:

- Ogni operazione importante ha un evento `started` e uno terminale?
- Le transizioni di stato sono loggate con status precedente e successivo?
- Posso unire log delle API, record del database, job in background e webhook tramite ID condivisi?
- I route path sono normalizzati?
- I reference ID dei provider sono inclusi?
- I payload grezzi dei provider sono esclusi dai log?
- Indirizzi, token, segreti, firme, cookie e valori di authorization vengono oscurati centralmente?
- I log ad alto volume del percorso di successo sono rimossi o campionati?
- L'esaurimento dei retry e gli stati di fallimento permanente vengono loggati?
- Posso raggruppare i log per nome di evento e ottenere una distribuzione significativa?
- Se un agente cercasse una singola transazione, troverebbe la storia o solo il rumore?

## Cosa rimuovere per primo

Se i tuoi log di produzione sono già rumorosi, parti da qui:

1. Rimuovi i log dalle funzioni pure di mapping/normalizzazione.
2. Rimuovi i log che stampano interi array o interi oggetti.
3. Rimuovi i "successfully did X" nei percorsi frequenti, a meno che non marchino un confine transazionale.
4. Rimuovi i log "niente da fare" da alarm, poller, code e cron job.
5. Rimuovi i log per-endpoint/per-item dentro i loop.
6. Rimuovi i dump grezzi di richieste/risposte.
7. Sostituisci gli errori in prosa con nomi di evento e campi strutturati.

Non ti serve un gigantesco progetto di observability. Ti servono pochi eventi stabili e la disciplina di cancellare il resto.

## Il cambio di prospettiva

L'observability era qualcosa che gli umani consumavano a cose fatte.

Ora fa parte dell'ambiente di sviluppo. Un coding agent con accesso MCP può indagare la produzione, validare ipotesi e trovare pattern attraverso i sistemi — ma solo se la produzione emette un segnale che può capire.

I log puliti non sono solo log più belli.

I log puliti sono infrastruttura per agenti.

Sono il modo in cui dai occhi al tuo agente.
