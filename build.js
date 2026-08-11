const fs = require('fs');
const path = require('path');

// =============================================================================
// FUNZIONE DI SICUREZZA: legge un file e, se manca, si ferma con un messaggio
// chiaro invece di far crashare lo script con un errore criptico di Node.
// =============================================================================
function leggiFileObbligatorio(percorso, descrizione) {
    if (!fs.existsSync(percorso)) {
        console.error(`❌ ERRORE: non trovo ${descrizione}.`);
        console.error(`   Percorso cercato: ${percorso}`);
        process.exit(1);
    }
    return fs.readFileSync(percorso, 'utf8');
}

// 1. Carica i componenti comuni dalle loro cartelle
const percorsoHeader = path.join(__dirname, 'components/header.html');
const percorsoFooter = path.join(__dirname, 'components/footer.html');
const header = leggiFileObbligatorio(percorsoHeader, 'il file "components/header.html"');
const footer = leggiFileObbligatorio(percorsoFooter, 'il file "components/footer.html"');

// =============================================================================
// MODELLO CONDIVISO DELLA SEZIONE <head>
// -----------------------------------------------------------------------------
// Un unico file (components/head.html) contiene l'intera intestazione <head>
// comune a tutte le pagine (meta, preload dei font, foglio di stile, icone...).
// Le tre parti che cambiano da pagina a pagina sono scritte come "segnaposto":
//   {{TITOLO}}   {{DESCRIZIONE}}   {{CANONICO}}
// e vengono riempite, per ciascuna pagina, con i valori della tabella qui sotto.
// =============================================================================
const percorsoHead = path.join(__dirname, 'components/head.html');
const modelloHead = leggiFileObbligatorio(percorsoHead, 'il file "components/head.html"');

// -----------------------------------------------------------------------------
// TABELLA DEI METADATI PER PAGINA  ← è QUI che si modificano titoli e descrizioni
// -----------------------------------------------------------------------------
// Per ogni pagina bastano tre valori:
//   • "titolo"      alimenta <title> + og:title + twitter:title
//   • "descrizione" alimenta la description + og:description + twitter:description
//   • "canonico"    alimenta <link canonical> + og:url
// Così un titolo si scrive UNA volta sola, in un solo punto, invece che sparso
// in più righe di <head> ripetute in ogni pagina.
const metadatiPagine = {
    '404.html': {
        titolo:      "Pagina non trovata — PostiPerfetti",
        descrizione: "La pagina che cerchi non esiste o è stata spostata.",
        canonico:    "https://postiperfetti.it/404.html"
    },
    'index.html': {
        titolo:      "PostiPerfetti | Software gratuito e open-source per i posti in classe",
        descrizione: "Software gratuito e open-source per assegnare i posti degli studenti in classe rispettando vincoli, rotazioni e privacy.",
        canonico:    "https://postiperfetti.it/"
    },
    'come-funziona.html': {
        titolo:      "Funzionamento — PostiPerfetti",
        descrizione: "Il flusso semplice di PostiPerfetti: prepara la classe, imposta i vincoli, genera i posti e salva le rotazioni.",
        canonico:    "https://postiperfetti.it/come-funziona.html"
    },
    'guida.html': {
        titolo:      "Guida — PostiPerfetti",
        descrizione: "Guida visiva e operativa per creare una classe, impostare i vincoli, generare i posti e gestire lo Storico di PostiPerfetti.",
        canonico:    "https://postiperfetti.it/guida.html"
    },
    'download.html': {
        titolo:      "Download — PostiPerfetti",
        descrizione: "Scarica PostiPerfetti per Windows e Linux: software gratuito e open-source per assegnare i posti in classe.",
        canonico:    "https://postiperfetti.it/download.html"
    },
    'autore.html': {
        titolo:      "Autore — PostiPerfetti",
        descrizione: "Chi ha creato PostiPerfetti: un insegnante, non un'azienda. La storia del programma, nato dal vibe coding e pensato per essere gratuito e open-source.",
        canonico:    "https://postiperfetti.it/autore.html"
    },
    'privacy.html': {
        titolo:      "Privacy e Open Source — PostiPerfetti",
        descrizione: "PostiPerfetti non accede alla rete: i dati della classe restano sul computer del docente. Progetto gratuito, open-source, licenza GNU GPLv3.",
        canonico:    "https://postiperfetti.it/privacy.html"
    },
    'screenshot.html': {
        titolo:      "Screenshot — PostiPerfetti",
        descrizione: "Tutte le schermate di PostiPerfetti: editor studenti, aula, report, storico, statistiche e tema chiaro/scuro.",
        canonico:    "https://postiperfetti.it/screenshot.html"
    }
};

// Sostituisce TUTTE le occorrenze di un segnaposto (non solo la prima). Usa
// split+join: è "letterale", quindi simboli come  |  —  '  non creano problemi
// (a differenza di replace con espressioni regolari, dove andrebbero protetti).
function sostituisciTutte(testo, segnaposto, valore) {
    return testo.split(segnaposto).join(valore);
}

// Compone il <head> di UNA pagina, riempiendo i segnaposto del modello con i
// valori della tabella. Se una pagina usa il segnaposto ma non è in tabella,
// avvisa (invece di fallire in silenzio) e lascia vuoti quei campi.
function componiHead(nomeFile) {
    const dati = metadatiPagine[nomeFile];
    if (!dati) {
        console.warn(`⚠️  Attenzione: "${nomeFile}" usa <!-- COMPONENT:HEAD --> ma non è ` +
                     `nella tabella "metadatiPagine": titolo e descrizione resteranno vuoti.`);
        return sostituisciTutte(sostituisciTutte(sostituisciTutte(
            modelloHead, '{{TITOLO}}', ''), '{{DESCRIZIONE}}', ''), '{{CANONICO}}', '');
    }
    let head = sostituisciTutte(modelloHead, '{{TITOLO}}', dati.titolo);
    head = sostituisciTutte(head, '{{DESCRIZIONE}}', dati.descrizione);
    head = sostituisciTutte(head, '{{CANONICO}}', dati.canonico);
    return head;
}

// 2. Definisce il percorso della cartella sorgente
const cartellaSorgente = path.join(__dirname, 'src');

if (!fs.existsSync(cartellaSorgente)) {
    console.error(`❌ ERRORE: non trovo la cartella sorgente "src/".`);
    console.error(`   Percorso cercato: ${cartellaSorgente}`);
    process.exit(1);
}

// 3. Legge dinamicamente il contenuto della cartella src/
const tuttiIFile = fs.readdirSync(cartellaSorgente);

// 4. Filtra tenendo solo i file con estensione .html
const pagine = tuttiIFile.filter(file => file.endsWith('.html'));

// =============================================================================
// FUNZIONE "MENU ATTIVO": evidenzia, nell'header, il link della pagina che
// si sta generando in questo momento (es. in privacy.html, il link "Privacy"
// riceve la classe "attivo").
//
// Questa funzione UNICA gestisce sia la Home (dove il link da evidenziare è
// il logo) sia tutte le altre pagine (dove il link da evidenziare sta nel
// menu, o è il bottone "Download"): si accorge da sola se il link ha già
// un attributo "class" oppure no, e si comporta di conseguenza
// — SENZA MAI creare due attributi "class" sullo stesso tag.
// =============================================================================
function evidenziaPaginaCorrente(headerHtml, nomeFile) {
    // Costruisce un "cercatore" (espressione regolare) che trova l'intero tag
    // <a ...> che punta a questa pagina, qualunque sia l'ordine dei suoi
    // attributi. Il nome del file viene "protetto" (escape) nel caso
    // contenesse simboli speciali per le espressioni regolari (come il punto).
    // La home si raggiunge con href="/" (non "index.html"), così Google non
    // vede due indirizzi diversi per la stessa pagina. Per la home cerchiamo
    // quindi il link "/"; per tutte le altre pagine, il nome del file.
    const hrefDaCercare = (nomeFile === 'index.html') ? '/' : nomeFile;
    const nomeFileProtetto = hrefDaCercare.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const cercaTag = new RegExp('<a\\s+([^>]*?href="' + nomeFileProtetto + '"[^>]*)>', 'i');

    const trovato = headerHtml.match(cercaTag);

    if (!trovato) {
        // Nessun link nell'header punta a questa pagina: probabilmente è normale
        // (non tutte le pagine hanno per forza un link dedicato), ma è meglio
        // avvisare chi lancia la build, invece di fallire in silenzio come
        // accadeva prima.
        console.warn(`\n⚠️  Nessun link a "${nomeFile}" nell'header. ` +
                      `Questa pagina non entrerà nel menu.\n`);
        return headerHtml;
    }

    const tagOriginale = trovato[0];      // l'intero tag, es: <a class="btn btn-primario" href="download.html">
    let attributi = trovato[1];           // solo gli attributi, senza "<a " e ">"

    // Aggiunge "aria-current" solo se non è già presente (per sicurezza)
    if (!/aria-current\s*=/.test(attributi)) {
        attributi += ' aria-current="page"';
    }

    // Aggiunge la classe "attivo": se esiste già un attributo class, la
    // AFFIANCA alle classi esistenti (es. "btn btn-primario" diventa
    // "btn btn-primario attivo"). Se non esiste, ne crea uno nuovo.
    // In OGNI caso il tag finale avrà un solo attributo "class".
    if (/class\s*=\s*"([^"]*)"/.test(attributi)) {
        attributi = attributi.replace(/class\s*=\s*"([^"]*)"/, (corrispondenza, classiEsistenti) => {
            const listaClassi = classiEsistenti.split(/\s+/).filter(Boolean);
            if (!listaClassi.includes('attivo')) {
                listaClassi.push('attivo');
            }
            return `class="${listaClassi.join(' ')}"`;
        });
    } else {
        attributi += ' class="attivo"';
    }

    const tagNuovo = `<a ${attributi}>`;
    return headerHtml.replace(tagOriginale, tagNuovo);
}

// =============================================================================
// CARTELLA DI PUBBLICAZIONE PULITA
// -----------------------------------------------------------------------------
// Gli HTML restano generati anche nella root per non cambiare il flusso di
// lavoro locale già in uso; in più, ogni build ricrea `dist/` con SOLI file
// pubblicabili. In questo modo Netlify (o un upload manuale) può puntare a
// `dist/` senza esporre src/, components/ e build.js.
// =============================================================================
const cartellaPubblicazione = path.join(__dirname, 'dist');
fs.rmSync(cartellaPubblicazione, { recursive: true, force: true });
fs.mkdirSync(cartellaPubblicazione, { recursive: true });

// 5. Cicla per elaborare ogni pagina trovata automaticamente
pagine.forEach(file => {
    const sentieroSorgente = path.join(cartellaSorgente, file);
    const sentieroDestinazione = path.join(__dirname, file);
    const sentieroPubblicazione = path.join(cartellaPubblicazione, file);

    let html = fs.readFileSync(sentieroSorgente, 'utf8');

    // Genera una copia dell'header personalizzata solo per questa pagina
    const headerPersonalizzato = evidenziaPaginaCorrente(header, file);

    // Se la pagina usa il segnaposto dell'head condiviso, lo componiamo e lo
    // inseriamo. Se in futuro venisse aggiunta una pagina con un <head>
    // autonomo, l'assenza del segnaposto la lascerebbe semplicemente intatta.
    const segnapostoHead = '<' + '!-- COMPONENT:HEAD --' + '>';
    if (html.includes(segnapostoHead)) {
        html = html.replace(segnapostoHead, componiHead(file));
    }

    // Sostituzione dei segnaposto nel file finale (stringhe spezzate anti-parsing)
    html = html.replace('<' + '!-- COMPONENT:HEADER --' + '>', headerPersonalizzato);
    html = html.replace('<' + '!-- COMPONENT:FOOTER --' + '>', footer);

    // Scrive sia nella root (compatibilità con il flusso locale esistente)
    // sia nella cartella dist/ destinata alla pubblicazione.
    fs.writeFileSync(sentieroDestinazione, html, 'utf8');
    fs.writeFileSync(sentieroPubblicazione, html, 'utf8');
    console.log(`✓ Pagina generata: ${file}`);
});

// Copia in dist/ soltanto asset e file statici necessari al sito pubblico.
const cartellePubbliche = ['css', 'js', 'fonts', 'img'];
const filePubblici = ['_redirects', 'manifest.json', 'robots.txt', 'sitemap.xml', 'humans.txt'];

cartellePubbliche.forEach(nome => {
    const origine = path.join(__dirname, nome);
    if (fs.existsSync(origine)) {
        fs.cpSync(origine, path.join(cartellaPubblicazione, nome), { recursive: true });
    }
});

filePubblici.forEach(nome => {
    const origine = path.join(__dirname, nome);
    if (fs.existsSync(origine)) {
        fs.copyFileSync(origine, path.join(cartellaPubblicazione, nome));
    }
});

console.log(`\n🎉 Build completata! Elaborate ${pagine.length} pagine.\n`);
console.log('📦 Cartella pronta per la pubblicazione: dist/');
