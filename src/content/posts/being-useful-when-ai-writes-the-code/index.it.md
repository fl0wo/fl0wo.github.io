---
title: "Essere utili quando è l'IA a scrivere il codice"
published: 2026-09-12
draft: false
tags: ['agentic-coding', 'ai-agents', 'software-engineering', 'testing', 'system-design']
toc: true
---

Per impostazione predefinita, sono contrario a leggere il codice generato dall'IA. Se ogni riga generata richiede la mia revisione, la mia velocità di lettura diventa il limite del processo. Davanti a un pezzo di implementazione rotto, spesso preferisco chiarire cosa dovrebbe fare e farlo riscrivere, piuttosto che passare più tempo a capire perché è stato scritto male. Continuerei comunque a ispezionare il codice nei casi eccezionali, soprattutto per la logica ad alto rischio o per i fallimenti che non riesco a spiegare altrimenti.

Mi piace ancora scrivere codice a mano. Ci sono cose che scriverei solo per la soddisfazione di farle da solo. Ma quando la priorità è rilasciare software di produzione in fretta, quella preferenza non è una ragione sufficiente per fare l'implementazione manualmente.

Quindi, dove dovrebbe spendere il proprio tempo uno sviluppatore?

Prima di tutto, nel decidere cosa possiamo evitare di costruire. Una feature che possiamo eliminare, un'astrazione di cui non abbiamo bisogno, un servizio che non ha bisogno di essere separato. L'IA mi rende più disposto a tentare cose complicate, ma della complessità devo comunque rendere conto dopo.

Poi c'è la comprensione del sistema. Ho bisogno di una mappa mentale precisa di cosa chiama cosa, dove vive lo stato, quale servizio possiede quale responsabilità e come i fallimenti si propagano attraverso il workflow. Senza questo, come potrei dare all'IA istruzioni utili? Chiederei modifiche senza capire cosa toccano. Per ora, considero quelle decisioni una mia responsabilità.

La parte che richiede più spiegazioni è la verifica. Se non leggo ogni riga, mi serve un altro modo per stabilire se l'implementazione si comporta correttamente. Voglio un sistema modulare, molti test di integrazione, unit test mirati e test end-to-end per i flussi importanti. Preferisco progettare per questo fin dall'inizio piuttosto che aggiungerlo in seguito.

Quei test hanno anche bisogno di un ambiente di esecuzione che mi permetta di eseguirli a livelli diversi. Dovrei poter testare un singolo servizio senza avviare l'intero sistema, e testare separatamente gli orchestratori che coordinano più servizi. Per un workflow che riprova dopo un timeout, ad esempio, voglio verificare se quel retry può ripetere un'azione che dovrebbe avvenire una sola volta. Decidere cosa i test devono dimostrare resta un lavoro che devo fare io.

Devo anche distinguere le decisioni che posso cambiare domani da quelle con cui resterò bloccato. Sostituire una piccola funzione e migrare un intero sistema a un altro linguaggio di programmazione sono impegni molto diversi. Il secondo merita attenzione prima che l'implementazione inizi, indipendentemente da quanto velocemente l'IA possa generarlo.

E a volte devo fermare lo sviluppo. La prossima feature può aspettare mentre sistemiamo ciò che sta diventando fragile o difficile da testare. Spiegarlo a un PM richiede più che dire "debito tecnico". Quali modifiche sono diventate rischiose? Cosa continua a rompersi? Cosa migliorerebbe davvero consolidare il sistema attuale?

Per questo penso che la comunicazione diventi una parte più grande del lavoro. Avere il sistema in testa mi aiuta a scrivere prompt per un LLM, ma anche gli altri sviluppatori e i PM devono capire il mio ragionamento. Quando penso che dovremmo semplificare qualcosa, cambiare direzione o smettere di aggiungere feature, devo spiegare perché usando dettagli specifici del sistema che stiamo costruendo.
