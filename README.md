# 🌐 Sito ufficiale di «PostiPerfetti»

Questo repository contiene i sorgenti del sito ufficiale di **«PostiPerfetti»**, software gratuito e *open source* pensato per aiutare i docenti ad assegnare e ruotare i posti degli studenti in classe, tenendo conto di vincoli, preferenze e storico delle disposizioni.

Sito: https://postiperfetti.it

Il programma «PostiPerfetti» è un progetto distinto dal sito e viene distribuito con licenza **GNU GPLv3**.

------

## ⌗ Struttura del repository

```text
components/   componenti HTML condivisi (head, header, footer)
css/          foglio di stile
fonts/        font utilizzati dal sito e relativa licenza
img/          immagini, icone e risorse grafiche
js/           JavaScript del sito
src/          sorgenti HTML delle singole pagine
build.js      script che genera le pagine complete
*.html        pagine generate e pronte per essere visualizzate
```

------

## ✰ Modificare il sito

Il sito non usa framework, package manager o dipendenze JavaScript esterne.

Il flusso di lavoro è semplice:

1. la modifica dei file sorgente avviene in `src/`, `components/`, `css/`, `js/` o negli asset;
2. dalla cartella principale viene eseguito:

   ```bash
   node build.js
   ```

3. lo script aggiorna gli HTML generati nella root e ricrea `dist/`;
4. si può controllare localmente il risultato;
5. è possibile quindi caricare nel repository i file sorgente modificati e gli HTML rigenerati;
6. per la pubblicazione sul server (**Netlifly.com**, nel caso specifico) viene usato direttamente il contenuto di `dist/`.

## ⟳ Build

È sufficiente avere **Node.js** installato. `build.js` usa esclusivamente moduli inclusi in Node.js.

Durante la build vengono:

- inseriti i componenti HTML condivisi;
- generati i metadati specifici delle pagine;
- evidenziata la voce di navigazione corrente;
- aggiornati gli HTML nella root;
- ricreata la cartella `dist/` con i soli file destinati alla pubblicazione.

------

## ☑ Repository del programma

Il codice dell'applicazione «PostiPerfetti» è mantenuto separatamente dal sito web, all'indirizzo:

https://github.com/Omar-Ceretta/PostiPerfetti

------

## © Licenza del sito

Salvo dove indicato diversamente, i **materiali originali di questo repository** sono messi a disposizione con licenza **Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)**.

In sintesi, è consentito condividere e adattare il materiale, purché:

- venga attribuita correttamente la paternità;
- non ne venga fatto uso commerciale;
- eventuali versioni derivate siano condivise con la stessa licenza.

I materiali di terzi, in particolare i font e le risorse espressamente accreditate, conservano le rispettive licenze. Vedi [LICENSE.md](LICENSE.md), [CREDITS.md](CREDITS.md), `fonts/LICENSE` e `img/LICENCE`.

La licenza del sito è distinta dalla **GNU GPLv3** usata per il programma «PostiPerfetti».

------

## 💬  Autore

Prof. **Omar Ceretta**  
Docente e autore di «PostiPerfetti»

© 2026 Omar Ceretta
