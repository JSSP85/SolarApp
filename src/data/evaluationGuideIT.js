export const evaluationGuideIT = {
  title: "GUIDA DI VALUTAZIONE FORNITORI",
  subtitle: "Matrice di Criteri per Punteggio Oggettivo",
  
  instructions: {
    title: "ISTRUZIONI GENERALI",
    content: "Questa guida fornisce criteri specifici per valutare i fornitori su ogni KPI. L'ispettore deve rivedere ogni criterio e assegnare il punteggio che meglio riflette la situazione attuale del fornitore.",
    
    scoringScale: {
      title: "SCALA DI PUNTEGGIO",
      levels: [
        { score: 1, label: "Non Accettabile/Rifiuto", description: "Carenze critiche che impediscono un'operazione adeguata" },
        { score: 2, label: "Miglioramento/Aggiornamento Richiesto", description: "Conformità parziale, richiede azioni correttive" },
        { score: 3, label: "Accettabile", description: "Soddisfa i requisiti minimi previsti" },
        { score: 4, label: "Eccellente (Benchmark)", description: "Supera le aspettative, modello da seguire" }
      ]
    }
  },
  
  kpis: [
    {
      id: "kpi1",
      title: "KPI1 - CAPACITÀ PRODUTTIVA E ATTREZZATURE",
      levels: [
        {
          score: 1,
          label: "NON ACCETTABILE/RIFIUTO",
          criteria: [
            "Capacità produttiva insufficiente per soddisfare i volumi richiesti (< 50% del necessario)",
            "Attrezzature obsolete o in cattive condizioni (più del 30% fuori servizio)",
            "Non esiste un piano di manutenzione preventiva",
            "Strutture inadeguate o non sicure",
            "Nessun backup per attrezzature critiche",
            "Tecnologia incompatibile con le specifiche tecniche richieste"
          ]
        },
        {
          score: 2,
          label: "MIGLIORAMENTO/AGGIORNAMENTO RICHIESTO",
          criteria: [
            "Capacità produttiva discreta (50-80% del richiesto) con limitazioni frequenti",
            "Attrezzature funzionali ma obsolete (5-10 anni senza aggiornamento)",
            "Manutenzione reattiva senza programma formale",
            "Alcune macchine critiche senza backup",
            "Strutture di base che richiedono miglioramenti",
            "Problemi occasionali di capacità in alta stagione"
          ]
        },
        {
          score: 3,
          label: "ACCETTABILE",
          criteria: [
            "Capacità produttiva adeguata (80-100% del richiesto)",
            "Attrezzature in buone condizioni e funzionali",
            "Programma di manutenzione preventiva stabilito e documentato",
            "Backup per attrezzature critiche",
            "Strutture appropriate e organizzate",
            "Tecnologia attuale (meno di 5 anni)",
            "Può soddisfare i picchi di domanda stagionali"
          ]
        },
        {
          score: 4,
          label: "ECCELLENTE (BENCHMARK)",
          criteria: [
            "Capacità produttiva superiore (>120% del richiesto)",
            "Attrezzature all'avanguardia e altamente efficienti",
            "Sistema di manutenzione predittiva implementato (TPM, Industry 4.0)",
            "Ridondanza completa nelle linee critiche",
            "Strutture moderne con certificazioni (ISO, ecc.)",
            "Investimento continuo nell'innovazione tecnologica",
            "Flessibilità per cambiamenti di produzione rapidi",
            "Automazione e digitalizzazione avanzata"
          ]
        }
      ]
    },
    {
      id: "kpi2",
      title: "KPI2 - SISTEMA DI CONTROLLO QUALITÀ",
      levels: [
        {
          score: 1,
          label: "NON ACCETTABILE/RIFIUTO",
          criteria: [
            "Nessun sistema di controllo qualità documentato",
            "Nessun personale dedicato alla qualità",
            "Nessuna attrezzatura di misurazione o calibrazione",
            "Tasso di difetti >5% nelle consegne",
            "Nessuna tracciabilità del prodotto",
            "Non esiste procedura per non conformità",
            "Nessun registro di ispezione"
          ]
        },
        {
          score: 2,
          label: "MIGLIORAMENTO/AGGIORNAMENTO RICHIESTO",
          criteria: [
            "Sistema qualità di base senza certificazione",
            "Personale qualità limitato o senza formazione formale",
            "Attrezzature di misurazione obsolete o non calibrate",
            "Tasso di difetti tra 2-5%",
            "Ispezione principalmente sul prodotto finale",
            "Procedure qualità non standardizzate",
            "Risposta lenta alle non conformità"
          ]
        },
        {
          score: 3,
          label: "ACCETTABILE",
          criteria: [
            "Sistema di gestione qualità certificato (ISO 9001 o equivalente)",
            "Team qualità formato e dedicato",
            "Attrezzature di misurazione calibrate e aggiornate",
            "Tasso di difetti <2%",
            "Ispezione nei punti critici del processo",
            "Procedure documentate e seguite",
            "Tracciabilità completa dei lotti",
            "Audit interni regolari"
          ]
        },
        {
          score: 4,
          label: "ECCELLENTE (BENCHMARK)",
          criteria: [
            "Certificazioni multiple (ISO 9001, IATF 16949, secondo l'industria)",
            "Sistema qualità integrato con produzione (SPC, Lean Six Sigma)",
            "Laboratorio proprio con accreditamento",
            "Tasso di difetti <0.5%",
            "Controllo statistico di processo implementato",
            "Cultura di qualità preventiva (Poka-Yoke, FMEA)",
            "Sistema di miglioramento continuo attivo con KPI",
            "Innovazione nei metodi di qualità"
          ]
        }
      ]
    },
    {
      id: "kpi3",
      title: "KPI3 - GESTIONE MATERIE PRIME E TRACCIABILITÀ",
      levels: [
        {
          score: 1,
          label: "NON ACCETTABILE/RIFIUTO",
          criteria: [
            "Nessun controllo dell'inventario di materie prime",
            "Nessuna verifica dei materiali in entrata",
            "Nessun sistema di tracciabilità",
            "Stoccaggio inadeguato o non sicuro",
            "Frequente mancanza di materiali critici",
            "Nessun metodo FIFO/FEFO"
          ]
        },
        {
          score: 2,
          label: "MIGLIORAMENTO/AGGIORNAMENTO RICHIESTO",
          criteria: [
            "Controllo inventario manuale o di base",
            "Ispezione irregolare dei materiali in entrata",
            "Tracciabilità parziale (solo grandi lotti)",
            "Stoccaggio di base senza condizioni controllate",
            "Stock di sicurezza insufficiente",
            "FIFO applicato in modo inconsistente"
          ]
        },
        {
          score: 3,
          label: "ACCETTABILE",
          criteria: [
            "Sistema di inventario computerizzato",
            "Ispezione di ricevimento documentata",
            "Tracciabilità completa da lotto a prodotto finale",
            "Stoccaggio adeguato con condizioni controllate",
            "Livelli di stock ottimali (analisi ABC)",
            "FIFO/FEFO implementato in modo consistente",
            "Identificazione chiara dei materiali"
          ]
        },
        {
          score: 4,
          label: "ECCELLENTE (BENCHMARK)",
          criteria: [
            "Sistema WMS integrato con ERP",
            "Ispezione automatizzata con tecnologia avanzata",
            "Tracciabilità digitale in tempo reale (blockchain, RFID)",
            "Magazzini certificati con monitoraggio ambientale continuo",
            "Pianificazione materiali ottimizzata (MRP II)",
            "Gestione lean degli inventari (JIT, Kanban)",
            "Certificazioni dei materiali (sostenibilità)",
            "Analisi predittiva della domanda"
          ]
        }
      ]
    },
    {
      id: "kpi4",
      title: "KPI4 - RISORSE UMANE E COMPETENZE",
      levels: [
        {
          score: 1,
          label: "NON ACCETTABILE/RIFIUTO",
          criteria: [
            "Alto turnover del personale (>30% annuale)",
            "Nessun programma di formazione",
            "Personale senza certificazioni richieste",
            "Organigramma indefinito o caotico",
            "Condizioni di lavoro scadenti",
            "Non conformità alle normative sul lavoro"
          ]
        },
        {
          score: 2,
          label: "MIGLIORAMENTO/AGGIORNAMENTO RICHIESTO",
          criteria: [
            "Turnover moderato-alto (15-30% annuale)",
            "Formazione sporadica e non strutturata",
            "Certificazioni scadute o in corso",
            "Organigramma di base ma funzionale",
            "Valutazioni delle prestazioni irregolari",
            "Dipendenza da personale chiave senza successione pianificata"
          ]
        },
        {
          score: 3,
          label: "ACCETTABILE",
          criteria: [
            "Turnover controllato (<15% annuale)",
            "Piano di formazione annuale documentato",
            "Personale certificato secondo i requisiti",
            "Organigramma chiaro con linee di autorità definite",
            "Valutazioni delle prestazioni annuali formali",
            "Condizioni di lavoro adeguate e sicure",
            "Piano di successione per posizioni critiche",
            "Matrice delle competenze documentata"
          ]
        },
        {
          score: 4,
          label: "ECCELLENTE (BENCHMARK)",
          criteria: [
            "Basso turnover (<5% annuale) e alto impegno del personale",
            "Programma completo di sviluppo del talento",
            "Certificazioni internazionali del personale",
            "Struttura organizzativa ottimizzata",
            "Valutazione a 360° e gestione per competenze",
            "Programmi di benessere ed engagement",
            "Percorso di carriera definito",
            "Team multifunzionali e polivalenti",
            "Cultura di innovazione e miglioramento continuo"
          ]
        }
      ]
    },
    {
      id: "kpi5",
      title: "KPI5 - PIANIFICAZIONE LOGISTICA E CONSEGNE",
      levels: [
        {
          score: 1,
          label: "NON ACCETTABILE/RIFIUTO",
          criteria: [
            "Consegne in ritardo >20% delle volte",
            "Nessun sistema di pianificazione delle consegne",
            "Nessun tracciamento degli ordini",
            "Imballaggio inadeguato che causa danni frequenti",
            "Nessuna opzione di trasporto di backup",
            "Mancanza di comunicazione sui ritardi",
            "Documentazione errata o mancante"
          ]
        },
        {
          score: 2,
          label: "MIGLIORAMENTO/AGGIORNAMENTO RICHIESTO",
          criteria: [
            "Consegne in ritardo 10-20% delle volte",
            "Pianificazione di base senza strumenti formali",
            "Tracciamento manuale e reattivo",
            "Imballaggio standard ma con danni occasionali",
            "Dipendenza da un singolo trasportatore",
            "Comunicazione irregolare sullo stato degli ordini",
            "Conformità delle quantità variabile"
          ]
        },
        {
          score: 3,
          label: "ACCETTABILE",
          criteria: [
            "Consegna puntuale >90% (OTD >90%)",
            "Sistema di pianificazione documentato",
            "Tracciamento ordini in sistema computerizzato",
            "Imballaggio adeguato secondo le specifiche",
            "Multiple opzioni di trasporto",
            "Comunicazione proattiva di qualsiasi deviazione",
            "Conformità esatta delle quantità",
            "Documentazione completa e corretta",
            "Flessibilità per cambiamenti urgenti"
          ]
        },
        {
          score: 4,
          label: "ECCELLENTE (BENCHMARK)",
          criteria: [
            "Consegna puntuale >98% (OTD >98%)",
            "Sistema di pianificazione integrato (ERP, TMS)",
            "Tracciamento in tempo reale con visibilità cliente",
            "Imballaggio ottimizzato e sostenibile",
            "Rete logistica robusta con multiple opzioni",
            "Portale cliente per gestione ordini",
            "Conformità perfetta con consegne JIT",
            "Documentazione digitale e automatizzata (EDI)",
            "Certificazioni logistiche (C-TPAT, AEO)",
            "Programma di miglioramento continuo nella logistica"
          ]
        }
      ]
    }
  ],
  
  methodology: {
    title: "METODOLOGIA DI VALUTAZIONE",
    steps: [
      {
        title: "1. PREPARAZIONE",
        items: [
          "Rivedere questa guida prima dell'audit",
          "Preparare checklist con criteri specifici",
          "Rivedere la storia del fornitore se esiste"
        ]
      },
      {
        title: "2. DURANTE L'AUDIT",
        items: [
          "Marcare criteri soddisfatti/non soddisfatti",
          "Richiedere evidenza oggettiva (documenti, registri, osservazione diretta)",
          "Scattare fotografie quando rilevante",
          "Intervistare il personale chiave"
        ]
      },
      {
        title: "3. ASSEGNAZIONE DEL PUNTEGGIO",
        items: [
          "Contare quanti criteri il fornitore soddisfa ad ogni livello",
          "Se soddisfa >80% dei criteri di un livello, quel punteggio può essere assegnato",
          "In caso di dubbio tra due livelli, assegnare il livello inferiore",
          "Se i criteri critici non sono soddisfatti, non può ottenere un punteggio superiore"
        ]
      },
      {
        title: "4. DOCUMENTAZIONE",
        items: [
          "Giustificare il punteggio assegnato con evidenze specifiche",
          "Documentare i risultati e le opportunità di miglioramento",
          "Stabilire un piano d'azione per i punteggi 1 e 2"
        ]
      },
      {
        title: "5. FOLLOW-UP",
        items: [
          "Per punteggio 1: Piano d'azione immediato o cambio fornitore",
          "Per punteggio 2: Piano di miglioramento con timeline definita (3-6 mesi)",
          "Per punteggio 3: Miglioramento continuo e mantenimento",
          "Per punteggio 4: Condividere le migliori pratiche, fornitore strategico"
        ]
      }
    ]
  },
  
  decisionMatrix: {
    title: "MATRICE DI DECISIONE RAPIDA",
    critical: {
      title: "CRITERI CRITICI",
      subtitle: "Se uno fallisce, il punteggio massimo è 1:",
      items: [
        "Non conformità alle normative legali",
        "Rischio di sicurezza per il personale o il prodotto",
        "Incapacità di soddisfare le specifiche tecniche critiche",
        "Mancanza di tracciabilità nelle industrie regolamentate"
      ]
    },
    benchmark: {
      title: "CRITERI PER BENCHMARK (PUNTEGGIO 4)",
      items: [
        "Certificazioni internazionali vigenti",
        "Tecnologia all'avanguardia",
        "Prestazioni superiori nelle metriche chiave (>95%)",
        "Innovazione dimostrabile",
        "Riconoscimento dell'industria"
      ]
    }
  },
  
  globalScore: {
    title: "PUNTEGGIO GLOBALE DEL FORNITORE",
    subtitle: "Media dei 5 KPI:",
    ranges: [
      { range: "1.0 - 1.9", class: "CRITICO", description: "Non accettabile, cercare alternative", color: "#ef4444" },
      { range: "2.0 - 2.9", class: "RICHIEDE MIGLIORAMENTO", description: "Fornitore in sviluppo con piano d'azione", color: "#f59e0b" },
      { range: "3.0 - 3.5", class: "ACCETTABILE", description: "Fornitore affidabile per operazioni regolari", color: "#10b981" },
      { range: "3.6 - 4.0", class: "STRATEGICO", description: "Fornitore di classe mondiale, partner di lungo termine", color: "#3b82f6" }
    ]
  },
  
  additionalNotes: {
    title: "NOTE AGGIUNTIVE",
    items: [
      "Questa guida dovrebbe essere rivista e aggiornata annualmente",
      "Possono essere aggiunti criteri specifici secondo l'industria",
      "I punteggi devono essere coerenti tra i valutatori",
      "Si raccomanda che due valutatori eseguano audit indipendentemente e confrontino i risultati",
      "Mantenere un registro storico delle valutazioni per vedere l'evoluzione del fornitore"
    ]
  }
};