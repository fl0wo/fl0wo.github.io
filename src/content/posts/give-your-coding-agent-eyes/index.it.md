---
title: 'Dai occhi al tuo coding agent: Cloudflare Skills, Observability MCP e TDD local-first'
published: 2026-07-04
draft: false
tags: ['claude-code', 'cloudflare', 'agentic-coding', 'tdd', 'observability', 'vitest']
toc: true
coverImage:
  src: './blog1.png'
  alt: 'Illustrazione in stile schizzo di un robot scultore che scolpisce un busto di marmo, affiancato a sinistra da una dashboard di observability Cloudflare con log, metriche e trace e a destra da un pannello di TDD local-first con test superati, mock e un database SQLite'
---

I coding agent sono instancabili e veloci — e ciechi, di default. Questo post parla dei due feedback loop che ho cablato nel mio progetto su Cloudflare Workers perché Claude Code possa *vedere* cosa fa il mio codice: log di produzione che può interrogare da solo, e una test suite locale che simula l'intera piattaforma — Durable Objects, SQLite, R2, API di terze parti — in pochi secondi. È la cosa più vicina a una pallottola d'argento che abbia trovato per l'agentic coding.

## Lo scultore cieco

Di recente ho guardato un video di Salvatore Sanfilippo (antirez) — [*"Il trucco decisivo (davvero) per lavorare coi coding agent"*](https://youtu.be/TJ6ruN-o0PA) — che mette in parole qualcosa attorno a cui giravo da mesi. Tutto il merito dell'inquadratura è suo; andate a vederlo.

Il suo ragionamento è questo. Avete già sentito tutti i consigli standard sui coding agent: scrivere spec precise, condividere le proprie intuizioni di design in linguaggio non vincolante, tenere il codebase pulito, commentare le *tensioni* del codice e non solo la meccanica. Tutto vero, tutto utile. Ma c'è una proprietà degli agenti LLM di cui quasi nessuno parla, ed è quella che cambia tutto: la **tenacia**. Un agente prova, riprova, e riprova ancora, a una velocità che nessun umano può eguagliare. Ogni tentativo fallito gli costa secondi, non un pomeriggio di motivazione.

Poi arriva la sua metafora, che non riesco a togliermi dalla testa. Immaginate un operaio instancabile davanti a un blocco di marmo. Può persino viaggiare indietro nel tempo: scheggia il marmo nel punto sbagliato, riavvolge, riprova, all'infinito. I suoi strumenti sono rozzi — non sa scolpire come Michelangelo, sa solo lanciare sassi — ma non si ferma mai e non si stanca mai. Con abbastanza tentativi, arriverà da qualche parte di notevole.

A meno che non sia cieco.

Se l'operaio non può *vedere* il marmo, nessuna quantità di tenacia o di viaggi nel tempo lo aiuta. I suoi tentativi non sono informati dai risultati di quelli precedenti. Sta solo lanciando sassi nel buio.

Ecco cos'è il vostro coding agent senza feedback loop. Ed ecco perché ho smesso di ottimizzare i miei prompt e ho iniziato a ottimizzare i *sensi* del mio agente.

## Due tipi di vista

Un coding agent ha bisogno di vedere due cose diverse:

1. **Cosa ha fatto davvero il codice** — il comportamento in produzione: errori, log, timeline, la richiesta fallita alle 11:51 e tutto quello che le è successo intorno.
2. **Cosa farà il codice** — le conseguenze della modifica appena fatta, prima che vada in produzione: il flusso funziona ancora, il database è finito nello stato giusto, abbiamo chiamato l'API di terze parti nel modo in cui pensiamo di averlo fatto.

Su Cloudflare, entrambe sono ormai cose che l'agente può fare *da solo*, senza che io clicchi tra le dashboard o faccia da babysitter a un ambiente di staging. La prima arriva dalle [skill e dai server MCP di Cloudflare](https://developers.cloudflare.com/agent-setup/claude-code/); la seconda da `@cloudflare/vitest-pool-workers` e da un'architettura di test deliberatamente local-first.

Ve le mostro entrambe, con materiale reale (leggermente anonimizzato) dal mio progetto: una piattaforma multi-tenant su Workers che si integra con exchange crypto — API in Hono, Durable Objects con SQLite, R2, D1, drizzle-orm, il pacchetto completo.

## Parte 1: lasciate che l'agente legga la produzione

### Setup

Cloudflare pubblica skill ufficiali per Claude Code — moduli di guida contestuale per Workers, Durable Objects, wrangler, l'Agents SDK e altro. Seguono una filosofia retrieval-first: invece di fidarsi di quello che il modello ha memorizzato sulla piattaforma nel 2024, la skill gli dice di andare a controllare.

:::tip
Installare le skill richiede due comandi dentro Claude Code:

```shell
/plugin marketplace add cloudflare/skills
/plugin install cloudflare@cloudflare
```
:::

::github{repo="cloudflare/skills"}

Poi c'è la parte che ha dato al mio agente occhi veri sulla produzione: il **server MCP Workers Observability**. Un solo comando:

```shell title="Aggiungere il server MCP di observability"
claude mcp add cloudflare-observability --transport http https://observability.mcp.cloudflare.com/mcp
```

Autenticatevi via `/mcp` (esegue un suo flow OAuth verso il vostro account Cloudflare), e il vostro agente può ora interrogare ogni riga di log emessa dai vostri Workers negli ultimi sette giorni: filtri, ricerche full-text, group-by, calcoli di percentili. Non `wrangler tail` sperando che il bug si ripresenti — telemetria di produzione *storica*, interrogabile in forma strutturata.

### La storia di guerra

Ecco cosa mi ha convinto. Il nostro flow OAuth per collegare l'account exchange di un utente ha iniziato a fallire in produzione con:

```txt
OAuth completion failed: <Exchange> API error: Temporary lockout
```

HTTP 400, connessione segnalata come fallita. Solo che… la API key sull'exchange *era stata creata*, con gli scope corretti. L'utente la vedeva nel proprio account. Qualcosa dichiarava un fallimento su un successo.

Il me di una volta avrebbe passato la serata nella dashboard: filtrare per URL, strizzare gli occhi sui timestamp, aprire quindici log, correlare a mano. Invece ho incollato una singola riga di log di esempio in Claude Code e gli ho chiesto di indagare.

Quello che ha fatto, in autonomia, è la parte interessante:

**Prima ha letto il codice, ancora prima di toccare i log.** Ha rintracciato il punto esatto del throw: la nostra callback creava la API key, poi chiamava immediatamente l'endpoint privato dei balance dell'exchange come step di "verifica" — e trattava *qualsiasi* errore come fatale. Il wallet non veniva mai persistito. La chiave esisteva sull'exchange; noi la buttavamo via e dicevamo all'utente che era andata male.

**Poi è andato sui log per testare l'ipotesi.** Il mio log di esempio aveva uno ULID come ID. L'agente ne ha decodificato il timestamp (gli ULID incorporano i millisecondi — sinceramente non lo sapevo), ha ottenuto il momento esatto del fallimento e ha interrogato una finestra intorno a esso:

```json title="Una delle query di observability dell'agente (semplificata)"
{
  "view": "events",
  "timeframe": { "from": "…T10:30:00Z", "to": "…T12:10:00Z" },
  "parameters": {
    "filters": [
      { "key": "$metadata.service", "operation": "eq", "value": "workers-prod" },
      { "key": "$metadata.level",   "operation": "eq", "value": "error" }
    ],
    "needle": { "value": "lockout" }
  }
}
```

**Poi ha allargato lo sguardo e ha raggruppato.** Invece di fissare i singoli eventi, ha eseguito un conteggio raggruppato per `$metadata.trigger` sull'intera settimana. Il risultato era la pistola fumante: l'errore "Temporary lockout" non era affatto un problema di OAuth. Compariva in *quattro sottosistemi scollegati* — l'endpoint di refresh dei balance, un endpoint per gli indirizzi di deposito, un cron job, un alarm di un Durable Object che faceva polling sui prelievi. Era uno stato di throttling a livello di account lato exchange, preesistente ancora prima che la callback OAuth venisse eseguita. Una API key nuova di zecca e perfettamente valida era entrata in una stanza chiusa a chiave.

La timeline ricostruita sembrava la lavagna di un detective:

```txt title="La timeline che l'agente ha ricostruito dai log di produzione"
11:39  burst of "Invalid key" errors    (a stored wallet with a dead key, hammered by balance refresh)
11:45  cron job hits "Temporary lockout"  ← account already locked, before any OAuth
11:51  OAuth connect: key created OK → balance verification → "Temporary lockout" → 400
11:56  user retries → 500 "Missing idempotency key"   ← a *second*, unrelated bug
11:57  user retries → 500
11:57  user retries → 500
```

Strada facendo ha trovato due bug bonus di cui non gli avevo chiesto nulla: il percorso di retry restituiva 500 perché mancava un cookie e l'error handler non copriva il caso (quindi il widget non riceveva nemmeno il messaggio di errore), e un cron `* * * * *` stava inondando i log con centinaia di warning innocui al minuto — cosa che pesa più di prima, perché il rumore nei log ora degrada anche le query *dell'agente*, non solo le mie.

La root cause finale si è rivelata ancora migliore: l'exchange applica un cooldown di sicurezza di ~15 minuti sulle chiamate API private ogni volta che un account si connette da un nuovo dispositivo o IP — che è *letteralmente ciò che è una connect OAuth*. Il nostro design "verifica sincrona subito dopo la creazione" era strutturalmente destinato a fallire alle prime connessioni. Il fix non era la retry logic; era persistere subito la chiave e rimandare il check dei balance a dopo il cooldown.

Non ho mai aperto la dashboard di Cloudflare. L'agente ha formulato ipotesi dal codice, le ha testate contro la telemetria di produzione, e le ha riviste. È lo scultore instancabile di antirez — con gli occhi.

## Trappole imparate sul campo

Tre cose che vi morderanno, così non devono farlo:

:::caution
**Il vostro login wrangler non può interrogare l'API di observability.** Prima di installare il server MCP, il mio agente ha provato l'endpoint REST direttamente con il token OAuth di `wrangler login` e ha ricevuto un secco `code: 10000, Authentication error`. È il modo confuso di Cloudflare per dire "token valido, permesso mancante": il token di wrangler porta solo gli scope che wrangler richiede (`workers:write`, `workers_tail:read`, …), e l'endpoint di query della telemetria ha bisogno di **Workers Observability: Read**. Il server MCP aggira il problema alla radice eseguendo il proprio flow OAuth con gli scope giusti. Se invece volete accesso raw via `curl`, create un API token dedicato.
:::

**I server MCP aggiunti a metà sessione richiedono una riconnessione.** `claude mcp add` aggiorna la configurazione, ma una sessione di Claude Code già in esecuzione non vedrà i tool del nuovo server finché non eseguite `/mcp` in *quella* sessione (o la riavviate). Ci ho perso dieci minuti di confusione.

**L'igiene dei log ora è performance dell'agente.** Una ricerca full-text su un servizio rumoroso restituisce il rumore. La mia prima query "mostrami tutto quello che è successo intorno al fallimento" è tornata al 100% fatta di warning del cron. Se volete che gli agenti facciano debugging dai vostri log, trattate lo spam nei log come un bug con un costo reale.

## Parte 2: il TDD local-first è l'altro occhio dell'agente

La vista sulla produzione vi dice cosa è andato storto. Il secondo loop — quello che rende l'agente *produttivo* e non solo diagnostico — è una test suite che può eseguire da solo, che risponde con sincerità, in pochi secondi.

La svolta su Cloudflare è [`@cloudflare/vitest-pool-workers`](https://developers.cloudflare.com/workers/testing/vitest-integration/): i vostri test non girano in Node con API di piattaforma mockate — girano dentro **workerd**, il runtime reale dei Workers, avviato da Miniflare *a partire dal vostro vero `wrangler.jsonc`*. Durable Objects, il loro storage SQLite, R2, D1, KV, rate limiter: tutte implementazioni reali, tutte locali, tutte in-process.

```ts title="vitest.config.mts (il cuore della configurazione)"
export default defineWorkersConfig({
  test: {
    sequence: { concurrent: false },
    poolOptions: {
      workers: {
        isolatedStorage: false,
        wrangler: { configPath: './wrangler.jsonc' },  // ← the whole platform, in-process
        moduleRules: [{ type: 'Text', include: ['**/*.sql'] }],
      },
    },
  },
})
```

Ecco cosa rende possibile, in pratica, nel mio codebase.

### Il database nei vostri test *è* il database di produzione

Ogni tenant nel mio sistema è un Durable Object il cui SQLite in `ctx.storage` è gestito da drizzle-orm. Le migrazioni girano nel costruttore del DO:

```ts title="TenantDurableObject.ts"
import { drizzle } from 'drizzle-orm/durable-sqlite';
import { migrate } from 'drizzle-orm/durable-sqlite/migrator';
import migrations from '../generated-migrations';

constructor(ctx: DurableObjectState, env: Env) {
  this.db = drizzle(ctx.storage, { schema: tenantSchema });
  ctx.blockConcurrencyWhile(() => migrate(this.db, migrations));
}
```

Poiché vitest avvia la stessa classe DO sotto Miniflare, il database di test locale ha *esattamente* lo schema di produzione — stesse migrazioni, stesso engine, niente "mock in salsa SQLite del nostro Postgres". (Un dettaglio scomodo: la sandbox dei Workers non può leggere file dal disco, quindi un piccolo build step genera i file di migrazione `.sql` come modulo JS di stringhe prima che la suite parta. Brutto, ma efficace.)

### Asserzioni white-box con `runInDurableObject`

`cloudflare:test` espone una scappatoia magica: entrare *dentro* un'istanza di Durable Object ed eseguire asserzioni sul suo stato privato.

```ts title="Asserzioni sullo SQLite interno del DO"
const identities = await runInDurableObject(orgDb, async (instance: TenantDurableObject) => {
  const db = (instance as any).db;
  return db.select().from(cexIdentities).all();
});
expect(identities).toHaveLength(0);
```

È la differenza tra "l'endpoint ha risposto 200" e "la riga è davvero arrivata, con il secret cifrato at rest". La mia suite lo usa in 46 file di test.

### Le API di terze parti diventano asserzioni rigide

La parte più spaventosa di un'integrazione con un exchange sono le chiamate in uscita — la parte che gli agenti adorano allucinare. `fetchMock` di `cloudflare:test` la trasforma in un contratto:

```ts title="Mockare l'exchange, in modo rigoroso"
beforeEach(() => {
  fetchMock.activate();
  fetchMock.disableNetConnect();   // any unmocked outbound call = test failure
});

fetchMock.get('https://api.exchange.example')
  .intercept({ method: 'POST', path: '/oauth/token' })
  .reply(200, oauthTokenSuccessFixture);

// …run the flow…

fetchMock.assertNoPendingInterceptors();  // every expected call actually happened
```

`disableNetConnect()` significa che l'agente *non può* testare per sbaglio contro la rete vera, e una chiamata API extra allucinata fallisce rumorosamente invece di funzionare-più-o-meno in silenzio. `assertNoPendingInterceptors()` significa che anche una chiamata *mancante* fallisce. Il mock non è uno stub; è una spec.

### Il loop d'oro

Messo tutto insieme, un solo test esercita l'intera verticale: mock dei tre endpoint dell'exchange → invocazione della vera route Hono → asserzioni sulla risposta HTTP, sul contratto dei mock *e* sullo stato SQLite del Durable Object:

```ts title="Il test full-stack su cui un agente può iterare"
it('completes OAuth → API key → balance → wallet storage', async () => {
  fetchMock.get(EXCHANGE).intercept({ path: '/oauth/token', method: 'POST' }).reply(200, tokenFixture);
  fetchMock.get(EXCHANGE).intercept({ path: '/oauth/api-key', method: 'POST' }).reply(200, keyFixture);
  fetchMock.get(EXCHANGE).intercept({ path: '/private/Balance', method: 'POST' }).reply(200, balanceFixture);

  const response = await app.request(callbackUrl, { headers }, env);

  expect(response.status).toBe(200);
  fetchMock.assertNoPendingInterceptors();

  const wallet = await runInDurableObject(orgDb, (i: TenantDurableObject) => i.getWallet('wallet-123'));
  expect(wallet).toMatchObject({ exchange: 'exchange', type: 'long-living' });
  expect(wallet!.apiSecret).not.toBe(keyFixture.result.secret); // encrypted at rest
});
```

Perché questo conta *specificamente per gli agenti*? Torniamo allo scultore:

- **La velocità alimenta la tenacia.** `npx vitest run test/oauth2/callback.test.ts` dà all'agente un verdetto rosso/verde sull'intero stack in pochi secondi. Ogni sasso lanciato viene valutato all'istante. Cinquanta iterazioni costano minuti, non giorni.
- **Il determinismo mantiene il feedback sincero.** Niente staging flaky, niente drift di ambienti condivisi, niente "sulla mia macchina funzionava". Lo stato di Miniflare viene azzerato all'inizio di ogni run.
- **Il rigore cattura le allucinazioni.** La combinazione `disableNetConnect` + `assertNoPendingInterceptors` è un dispositivo anti-allucinazione: l'agente non può inventarsi un'interazione API che "probabilmente esiste" — il contratto è eseguibile.
- **È self-serve.** L'agente non mi chiede di cliccare in una UI per verificare. Scrive il test che fallisce, lo fa passare, e mi mostra l'output. Il TDD è sempre stato una disciplina di feedback loop; gli agenti sono semplicemente i primi sviluppatori abbastanza tenaci da sfruttarlo fino in fondo.

(Parentesi di onestà: essere così local-first su una piattaforma giovane ha dei costi. Al momento vado in produzione con fork community patchati di drizzle-orm e better-auth per far comportare bene gli adapter. Tassa da early adopter.)

## Il 100x onesto

"100x" è un'affermazione grossa, quindi lasciatemela collocare con precisione. Non è velocità di battitura. È il prodotto di *numero di iterazioni* × *sincerità del feedback*, e in pratica è questo:

| Task | Io, a mano | Agente con gli occhi |
| --- | --- | --- |
| "Perché questo 400 in prod?" | 30–60 min di speleologia nella dashboard, se va bene | Un prompt; l'agente correla codice + una settimana di log, restituisce una timeline e due bug bonus |
| "Ho appena rotto il flusso dei prelievi?" | Deploy su staging, click manuali nel widget | `vitest run` — verdetto full-stack in secondi, stato del DO incluso |
| "Chiamiamo l'API dell'exchange correttamente?" | Rileggere la loro documentazione, sperare | `assertNoPendingInterceptors()` — il contratto è un test |
| "Questa API di piattaforma ha ancora la forma che ricordo?" | Cambiare tab verso i docs | La skill Cloudflare recupera i docs attuali invece di fidarsi dei dati di training |

L'agente è sempre stato tenace. È sempre stato veloce. Non erano mai quelli il collo di bottiglia — lo era la vista. Cablate una telemetria di produzione che può interrogare e un mondo locale che può simulare, e l'operaio instancabile davanti al marmo finalmente guarda dove atterra ogni sasso.

Adesso scolpisce.

## Crediti e link

- Salvatore Sanfilippo (antirez), [*Il trucco decisivo (davvero) per lavorare coi coding agent*](https://youtu.be/TJ6ruN-o0PA) — la metafora dello scultore cieco che ha ispirato questo post. Grazie.
- [cloudflare/skills](https://github.com/cloudflare/skills) — le Agent Skills ufficiali per Claude Code e altri agenti.
- [Guida Cloudflare all'agent setup per Claude Code](https://developers.cloudflare.com/agent-setup/claude-code/) — skill + server MCP, incluso l'[Observability MCP server](https://observability.mcp.cloudflare.com/mcp).
- [Integrazione Vitest per Workers](https://developers.cloudflare.com/workers/testing/vitest-integration/) — `@cloudflare/vitest-pool-workers`, `runInDurableObject`, `fetchMock`.
