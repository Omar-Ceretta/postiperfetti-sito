/* =============================================================================
 * PostiPerfetti — Logica JavaScript unificata (Versione Completa e Ultra-Robusta)
 * ============================================================================= */

function inizializzaSito() {

    // =========================================================================
    // 0) ALTEZZA REALE DELLA BARRA IN ALTO (STICKY)
    //    ---------------------------------------------------------------------
    //    La barra in alto è "sticky": resta agganciata sopra al contenuto
    //    mentre la pagina scorre. Su smartphone il menu va a capo su più righe,
    //    quindi la barra diventa MOLTO più alta che su PC. Qui la misuriamo
    //    "dal vivo" e salviamo la sua altezza in una variabile CSS
    //    (--altezza-intestazione). Così gli "stacchi" usati quando si salta a
    //    una sezione (Guida e Privacy) si adattano SEMPRE all'altezza reale, su
    //    qualunque schermo, senza numeri fissi da ritoccare a mano se un domani
    //    il menu cambia (es. quando aggiungeremo la voce "Autore").
    // =========================================================================

    // Restituisce, in pixel, quanto è alta ORA la barra .intestazione.
    // Se la barra non c'è, ripiega su 96 (valore prudente).
    function altezzaIntestazione() {
        const barra = document.querySelector(".intestazione");
        return barra ? barra.offsetHeight : 96;  // offsetHeight include bordi e padding
    }

    // Scrive l'altezza misurata nella variabile CSS globale, così il foglio
    // di stile può usarla con var(--altezza-intestazione).
    function aggiornaAltezzaIntestazione() {
        document.documentElement.style.setProperty(
            "--altezza-intestazione", altezzaIntestazione() + "px"
        );
    }

    aggiornaAltezzaIntestazione();                                   // subito all'avvio
    window.addEventListener("resize", aggiornaAltezzaIntestazione);  // rotazione / ridimensionamento
    window.addEventListener("load", aggiornaAltezzaIntestazione);    // a caricamento completo (font/immagini)

    // =========================================================================
    // 0-bis) MENU MOBILE A COMPARSA (hamburger)
    //    ---------------------------------------------------------------------
    //    Sotto i 768px il menu + il bottone Download vivono dentro un
    //    pannello nascosto di default (vedi CSS): questo pulsante lo
    //    apre/chiude, e aggiorna aria-expanded per l'accessibilità (screen
    //    reader) oltre che per le due iconcine (barre / X) gestite in CSS.
    // =========================================================================
    const interruttoreMenu = document.getElementById("menu-interruttore");
    const pannelloMenu = document.getElementById("menu-mobile");

    if (interruttoreMenu && pannelloMenu) {

        function chiudiMenuMobile() {
            pannelloMenu.classList.remove("aperto");
            interruttoreMenu.setAttribute("aria-expanded", "false");
            interruttoreMenu.setAttribute("aria-label", "Apri il menu");
        }

        interruttoreMenu.addEventListener("click", function() {
            const aperto = pannelloMenu.classList.toggle("aperto");
            interruttoreMenu.setAttribute("aria-expanded", aperto ? "true" : "false");
            interruttoreMenu.setAttribute("aria-label", aperto ? "Chiudi il menu" : "Apri il menu");
        });

        // Cliccando su una voce di menu (o sul bottone Download) il pannello
        // si richiude da solo, così non resta aperto dopo la navigazione.
        pannelloMenu.querySelectorAll("a").forEach(function(link) {
            link.addEventListener("click", chiudiMenuMobile);
        });

        // Se lo schermo torna largo (es. si ruota il tablet, o si allarga
        // la finestra), richiudiamo il pannello: da desktop il menu torna
        // in riga automaticamente via CSS, ma senza questo la classe
        // "aperto" resterebbe attiva e potrebbe confondere se si restringe
        // di nuovo la finestra.
        window.addEventListener("resize", function() {
            if (window.innerWidth > 768) {
                chiudiMenuMobile();
            }
        });

        // Escape richiude il menu mobile e restituisce il focus al pulsante.
        document.addEventListener("keydown", function(e) {
            if (e.key === "Escape" && pannelloMenu.classList.contains("aperto")) {
                chiudiMenuMobile();
                interruttoreMenu.focus();
            }
        });

        // Progressive enhancement: fino a questo punto il markup mantiene visibile
        // una navigazione di riserva e tiene nascosto l'hamburger. Solo dopo aver
        // installato con successo tutti i gestori sostituiamo il fallback col menu JS.
        interruttoreMenu.hidden = false;
        document.documentElement.classList.add("menu-js-attivo");
    }

    // =========================================================================
    // 0-ter) COMPARSA GRADUALE ALLO SCROLL (card e sezioni)
    //    ---------------------------------------------------------------------
    //    Invece di modificare l'HTML di ogni pagina aggiungendo a mano la
    //    classe "rivela" a ogni card, la assegniamo qui via JS a un elenco
    //    di selettori comuni a tutte le pagine. Poi un IntersectionObserver
    //    osserva quando ciascun elemento entra nello schermo e aggiunge la
    //    classe "visibile" (quella che fa la vera animazione, in CSS).
    //    Ogni elemento si anima una volta sola: dopo essere comparso,
    //    smettiamo di osservarlo (non deve "sparire e ricomparire" scrollando
    //    su e giù, sarebbe fastidioso).
    // =========================================================================
    const selettoriDaRivelare = [
        ".card",
        ".scheda-screenshot",
        ".cta-pannello",
        ".autore-card",
        ".sostegno-scatola"
    ].join(", ");

    const elementiDaRivelare = document.querySelectorAll(selettoriDaRivelare);

    if (elementiDaRivelare.length && "IntersectionObserver" in window) {

        elementiDaRivelare.forEach(function(el, indice) {
            el.classList.add("rivela");
            // Piccolo sfasamento temporale tra un elemento e il successivo
            // nella stessa "riga" di griglia, per un effetto a cascata
            // invece che tutti insieme di scatto. Il resto (%3) evita
            // ritardi troppo lunghi se ci sono molti elementi in fila.
            el.style.transitionDelay = (indice % 3) * 0.08 + "s";
        });

        const osservatoreScroll = new IntersectionObserver(function(voci, osservatore) {
            voci.forEach(function(voce) {
                if (voce.isIntersecting) {
                    voce.target.classList.add("visibile");
                    osservatore.unobserve(voce.target); // una volta sola
                }
            });
        }, {
            threshold: 0.15,        // si attiva quando il 15% dell'elemento è visibile
            rootMargin: "0px 0px -40px 0px"  // anticipa leggermente, non a filo del bordo
        });

        elementiDaRivelare.forEach(function(el) {
            osservatoreScroll.observe(el);
        });
    }

    // =========================================================================
    // 0-quater) BANNER "ZERO COOKIE" CHIUDIBILE (Specifico per index.html)
    //    ---------------------------------------------------------------------
    //    Click su "OK" → il banner si comprime con una piccola animazione e
    //    resta chiuso. Salviamo la scelta in localStorage: se l'utente
    //    ricarica la pagina o torna più avanti, il banner non ricompare.
    //    (localStorage è memoria SOLO nel browser dell'utente: non è un
    //    cookie, non viene mai inviata al server, resta coerente con lo
    //    spirito "zero tracciamento" del sito.)
    // =========================================================================
    const notaPrivacy = document.getElementById("nota-privacy");
    const notaPrivacyChiudi = document.getElementById("nota-privacy-chiudi");
    const CHIAVE_NOTA_PRIVACY = "postiperfetti_nota_privacy_chiusa";

    if (notaPrivacy && notaPrivacyChiudi) {

        // Se era già stata chiusa in una visita precedente, la nascondiamo
        // subito, senza animazione (non deve "ricomparire e richiudersi"
        // a ogni caricamento).
        try {
            if (localStorage.getItem(CHIAVE_NOTA_PRIVACY) === "true") {
                notaPrivacy.style.display = "none";
            }
        } catch (e) {
            // Storage disabilitato o non disponibile: il banner resta comunque usabile.
        }

        notaPrivacyChiudi.addEventListener("click", function() {
            notaPrivacy.classList.add("nascosta");
            try {
                localStorage.setItem(CHIAVE_NOTA_PRIVACY, "true");
            } catch (e) {
                // Nessun blocco: la preferenza semplicemente non verrà ricordata.
            }

            // Dopo la transizione CSS (0.35s) la togliamo anche dal flusso
            // della pagina, così non lascia uno spazio vuoto residuo.
            setTimeout(function() {
                notaPrivacy.style.display = "none";
            }, 350);
        });
    }

    // =========================================================================
    // 1) GESTIONE PRIVACY (Specifico per privacy.html)
    // =========================================================================
    const btnPrivacy = document.getElementById("btn-approfondisci");
    const boxPrivacy = document.getElementById("approfondimento-privacy");

    if (btnPrivacy && boxPrivacy) {
        btnPrivacy.addEventListener("click", function() {
            const isAperto = boxPrivacy.classList.contains("visibile");

            if (isAperto) {
                boxPrivacy.classList.remove("visibile");
                btnPrivacy.textContent = "🔍 Per approfondire...";
                btnPrivacy.setAttribute("aria-expanded", "false");
            } else {
                boxPrivacy.classList.add("visibile");
                btnPrivacy.textContent = "Nascondi approfondimento";
                btnPrivacy.setAttribute("aria-expanded", "true");

                setTimeout(function() {
                    // Stacco = altezza reale della barra sticky + 16px di respiro.
                    // Riusa la misura della Sezione 0: resta corretto su ogni schermo.
                    const margineMenuSticky = altezzaIntestazione() + 16;
                    const posizioneAssoluta = boxPrivacy.getBoundingClientRect().top + window.scrollY;

                    window.scrollTo({
                        top: posizioneAssoluta - margineMenuSticky,
                        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"
                    });
                }, 50);
            }
        });
    }

    // Se si arriva da un link con #approfondimento-privacy (es. dalla pagina
    // "Autore"), apriamo automaticamente la sezione e scorriamo fino a lei,
    // simulando un clic sul pulsante "Per approfondire...".
    if (window.location.hash === "#approfondimento-privacy" && btnPrivacy) {
        btnPrivacy.click();
    }

    // =========================================================================
    // 2) GESTIONE LIGHTBOX UNIFICATA (Screenshot e Guida)
    // =========================================================================
    const overlay = document.getElementById('lightbox-overlay');
    const btnChiudi = document.getElementById('lightbox-chiudi');
    const imgLightbox = document.getElementById('lightbox-immagine');
    const videoLightbox = document.getElementById('lightbox-video');
    const btnTema = document.getElementById('lightbox-tema');
    const suggerimento = document.getElementById('lightbox-suggerimento');
    const titoloLightbox = document.getElementById('lightbox-titolo');

    if (overlay) {

        // Ricorda QUALE elemento (miniatura/bottone) ha aperto la lightbox,
        // per ridargli il focus da tastiera quando si chiude.
        let triggerCheHaAperto = null;
        let timerCambioTema = null;
        let statoInertSfondo = [];

        function impostaSfondoInerte(attivo) {
            if (attivo) {
                statoInertSfondo = Array.from(document.body.children)
                .filter(function(el) {
                    return el !== overlay && !el.contains(overlay);
                })
                .map(function(el) {
                    const precedente = Boolean(el.inert);
                    el.inert = true;
                    return { el: el, precedente: precedente };
                });
            } else {
                statoInertSfondo.forEach(function(voce) {
                    voce.el.inert = voce.precedente;
                });
                statoInertSfondo = [];
            }
        }

        // --- FUNZIONE DI CHIUSURA CONDIVISA ---
        function chiudiLightbox() {
            overlay.classList.remove('visibile');
            overlay.setAttribute('aria-hidden', 'true');
            impostaSfondoInerte(false);

            if (timerCambioTema) {
                clearTimeout(timerCambioTema);
                timerCambioTema = null;
            }

            if (imgLightbox) {
                imgLightbox.src = "";
                imgLightbox.alt = "";
                imgLightbox.hidden = false;   // pronto per la prossima immagine
                imgLightbox.style.opacity = '1';
            }

            // Se era aperto un VIDEO: fermalo, svuotalo e nascondilo, così non
            // continua a girare in sottofondo dopo la chiusura.
            if (videoLightbox) {
                videoLightbox.pause();
                videoLightbox.src = "";
                videoLightbox.hidden = true;
            }

            // Si nasconde di nuovo il pulsante tema e il suggerimento, così
            // non restano visibili per errore alla prossima apertura.
            if (btnTema) {
                btnTema.hidden = true;
            }
            if (suggerimento) {
                suggerimento.hidden = true;
                suggerimento.textContent = "";
            }

            // Riporta il focus da tastiera sull'elemento che aveva aperto la
            // lightbox (così chi naviga con Tab non si ritrova "perso" a fondo
            // pagina). Poi azzera il riferimento.
            if (triggerCheHaAperto) {
                triggerCheHaAperto.focus();
                triggerCheHaAperto = null;
            }
        }

        // --- APERTURA DEL LIGHTBOX (stesso comportamento per Guida e Screenshot) ---
        const triggersLightbox = document.querySelectorAll('.link-zoom-trigger, .anteprima-bottone');

        triggersLightbox.forEach(function(trigger) {
            trigger.addEventListener('click', function(e) {
                // Evita il "salto" in cima alla pagina per i link della Guida (href="#")
                if (trigger.tagName === 'A') {
                    e.preventDefault();
                }

                const immagineChiara = trigger.getAttribute('data-chiaro');
                const immagineScura = trigger.getAttribute('data-scuro');
                const titolo = trigger.getAttribute('data-titolo') || "";
                const testoSuggerimento = trigger.getAttribute('data-suggerimento');

                if (imgLightbox) {

                    if (immagineChiara && immagineScura) {
                        // Screenshot con doppia versione: si apre sempre partendo dal tema chiaro
                        imgLightbox.src = immagineChiara;
                        imgLightbox.alt = titolo + " (tema chiaro)";

                        if (btnTema) {
                            btnTema.hidden = false;
                            btnTema.classList.remove('tema-scuro');
                            btnTema.dataset.chiaro = immagineChiara;
                            btnTema.dataset.scuro = immagineScura;
                            btnTema.dataset.titolo = titolo;
                            btnTema.dataset.temaAttuale = 'chiaro';
                            btnTema.setAttribute('aria-label', 'Passa al tema scuro');
                            btnTema.setAttribute('aria-pressed', 'false');
                        }
                    } else {
                        // Media singolo: può essere un'IMMAGINE oppure un VIDEO
                        // (.mp4/.webm). Scegliamo l'elemento giusto guardando
                        // l'estensione del file indicato in data-full.
                        const percorso = trigger.getAttribute('data-full') || "";
                        const eVideo = /\.(mp4|webm)$/i.test(percorso);

                        if (eVideo && videoLightbox) {
                            // VIDEO: nascondo l'immagine, mostro e avvio il video
                            imgLightbox.hidden = true;
                            imgLightbox.src = "";
                            videoLightbox.src = percorso;
                            videoLightbox.hidden = false;
                            videoLightbox.currentTime = 0;
                            videoLightbox.loop = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
                            videoLightbox.play().catch(function () {});  // avvio richiesto dal clic dell'utente; il video resta volutamente senza controlli
                        } else {
                            // IMMAGINE (comportamento di sempre)
                            if (videoLightbox) {
                                videoLightbox.pause();
                                videoLightbox.hidden = true;
                                videoLightbox.src = "";
                            }
                            imgLightbox.hidden = false;
                            imgLightbox.src = percorso;
                            imgLightbox.alt = titolo;
                        }

                        if (btnTema) {
                            btnTema.hidden = true;
                        }
                    }

                    // Il suggerimento compare solo se il trigger ha un
                    // data-suggerimento impostato (per ora solo la card
                    // "Tema chiaro e scuro"); altrimenti resta nascosto.
                    if (suggerimento) {
                        if (testoSuggerimento) {
                            suggerimento.textContent = testoSuggerimento;
                            suggerimento.hidden = false;
                        } else {
                            suggerimento.hidden = true;
                            suggerimento.textContent = "";
                        }
                    }
                }

                if (titoloLightbox) {
                    titoloLightbox.textContent = titolo ? "Anteprima: " + titolo : "Anteprima ingrandita";
                }
                overlay.setAttribute('aria-hidden', 'false');
                overlay.classList.add('visibile');
                impostaSfondoInerte(true);

                // Accessibilità: memorizza il trigger e sposta il focus da
                // tastiera SUL pulsante di chiusura, cioè dentro il popup.
                triggerCheHaAperto = trigger;
                if (btnChiudi) {
                    btnChiudi.focus();
                }
            });
        });

        // --- INTERRUTTORE TEMA CHIARO / SCURO ---
        if (btnTema) {
            btnTema.addEventListener('click', function(e) {
                // Il pulsante sta dentro il wrapper, non sull'overlay: il click
                // non farebbe comunque chiudere la lightbox, ma preveniamo ogni
                // ambiguità fermando qui la propagazione dell'evento.
                e.preventDefault();
                e.stopPropagation();

                const temaAttuale = btnTema.dataset.temaAttuale;
                const nuovoTema = (temaAttuale === 'chiaro') ? 'scuro' : 'chiaro';
                const nuovaImmagine = btnTema.dataset[nuovoTema];
                const titolo = btnTema.dataset.titolo || "";

                if (imgLightbox && nuovaImmagine) {
                    // Piccola dissolvenza: si abbassa l'opacità, si cambia la
                    // sorgente, poi si torna visibili (vedi transition nel CSS).
                    imgLightbox.style.opacity = '0';
                    if (timerCambioTema) {
                        clearTimeout(timerCambioTema);
                    }
                    timerCambioTema = setTimeout(function() {
                        imgLightbox.src = nuovaImmagine;
                        imgLightbox.alt = titolo + " (tema " + nuovoTema + ")";
                        imgLightbox.style.opacity = '1';
                        timerCambioTema = null;
                    }, 150);
                }

                btnTema.dataset.temaAttuale = nuovoTema;
                btnTema.classList.toggle('tema-scuro', nuovoTema === 'scuro');
                btnTema.setAttribute('aria-pressed', nuovoTema === 'scuro' ? 'true' : 'false');
                btnTema.setAttribute('aria-label', nuovoTema === 'chiaro' ? 'Passa al tema scuro' : 'Passa al tema chiaro');
            });
        }

        // --- EVENTI DI CHIUSURA CONDIVISI ---
        if (btnChiudi) {
            btnChiudi.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                chiudiLightbox();
            });
        }

        // Chiusura cliccando lo sfondo scuro circostante
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) {
                chiudiLightbox();
            }
        });

        // Chiusura col tasto ESC + "focus-trap" col tasto Tab
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && overlay.classList.contains('visibile')) {
                chiudiLightbox();
            }

            // Focus-trap: mentre la lightbox è aperta, il tasto Tab NON deve
            // uscire dal popup verso la pagina sotto (che è coperta). Facciamo
            // "girare in tondo" il focus tra i soli pulsanti visibili del popup.
            if (e.key === 'Tab' && overlay.classList.contains('visibile')) {
                // Pulsanti focalizzabili ORA nel popup: il pulsante tema c'è
                // solo per gli screenshot a doppia versione, quindi lo contiamo
                // solo quando è visibile (non "hidden").
                const focalizzabili = Array.from(overlay.querySelectorAll(
                    'button:not([hidden]), a[href]:not([hidden]), [tabindex]:not([tabindex="-1"]):not([hidden])'
                )).filter(function(el) {
                    return !el.disabled && el.getClientRects().length > 0;
                });
                if (focalizzabili.length === 0) {
                    return;
                }
                const primo = focalizzabili[0];
                const ultimo = focalizzabili[focalizzabili.length - 1];

                if (e.shiftKey && document.activeElement === primo) {
                    // Shift+Tab dal primo elemento: si torna all'ultimo
                    e.preventDefault();
                    ultimo.focus();
                } else if (!e.shiftKey && document.activeElement === ultimo) {
                    // Tab dall'ultimo elemento: si torna al primo
                    e.preventDefault();
                    primo.focus();
                }
            }
        });
    }

    // =========================================================================
    // 4) INDICE LATERALE DELLA GUIDA (scroll-spy)
    //    ---------------------------------------------------------------------
    //    Evidenzia, nell'indice a lato della pagina "Guida", la voce della
    //    sezione che si sta leggendo mentre si scorre. La logica sta nella
    //    funzione inizializzaIndiceGuida(), in fondo al file: la chiamiamo qui
    //    così vive con tutto il resto. Sulle pagine SENZA indice la funzione
    //    si accorge da sola che non c'è nulla da fare e si ferma.
    // =========================================================================
    inizializzaIndiceGuida();
}

// Esegue la funzione quando il browser ha caricato il DOM
window.addEventListener("DOMContentLoaded", inizializzaSito);

// =========================================================================
// 3) FUNZIONE COPIA EMAIL (Specifico per autore.html)
// =========================================================================
function copiaEmail() {
    const email = "ceretta.omar@ictombologalliera.edu.it";

    // Mostra "Indirizzo copiato" SOLO quando la copia è andata a buon fine.
    function mostraConferma() {
        const msg = document.getElementById("copiato");
        if (msg) {
            const testo = msg.querySelector(".copiato-testo");
            if (testo) {
                testo.textContent = "";
                requestAnimationFrame(function() {
                    testo.textContent = "Indirizzo copiato negli appunti";
                });
            }
            msg.classList.add("visibile");
            setTimeout(function() {
                msg.classList.remove("visibile");
            }, 2000);
        }
    }

    // Metodo di RISERVA per browser vecchi o contesti senza HTTPS: crea una
    // casella di testo invisibile, ci mette l'email, la seleziona e usa il
    // vecchio comando "copy". Torna true se è riuscito, false altrimenti.
    function copiaConMetodoVecchio() {
        try {
            const casella = document.createElement("textarea");
            casella.value = email;
            casella.setAttribute("readonly", "");
            casella.style.position = "absolute";
            casella.style.left = "-9999px";
            document.body.appendChild(casella);
            casella.select();
            const riuscito = document.execCommand("copy");
            document.body.removeChild(casella);
            return riuscito;
        } catch (e) {
            return false;
        }
    }

    // Metodo MODERNO: esiste solo in contesti sicuri (HTTPS o localhost). Se
    // c'è, lo proviamo; se fallisce ripieghiamo sul metodo vecchio. Se non
    // c'è affatto, andiamo diretti al metodo vecchio.
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email)
        .then(mostraConferma)
        .catch(function() {
            if (copiaConMetodoVecchio()) {
                mostraConferma();
            }
        });
    } else {
        if (copiaConMetodoVecchio()) {
            mostraConferma();
        }
    }
}

// =========================================================================
// INDICE LATERALE DELLA GUIDA (scroll-spy)  —  usato solo da guida.html
// -------------------------------------------------------------------------
// Man mano che si scorre la pagina "Guida", evidenzia nell'indice a lato la
// voce della sezione che si sta leggendo. Se la pagina non ha l'indice
// (.guida-indice), esce subito: quindi è innocua ovunque venga eseguita.
// =========================================================================
function inizializzaIndiceGuida() {
    const indice = document.querySelector('.guida-indice');
    if (!indice) return;   // pagina senza indice: niente da fare

    // Raccoglie le voci dell'indice e la sezione a cui ciascuna punta
    const voci = Array.from(indice.querySelectorAll('a[href^="#"]'))
    .map(link => ({
        link,
        sezione: document.getElementById(decodeURIComponent(link.hash.slice(1)))
    }))
    .filter(voce => voce.sezione);

    if (!voci.length) return;

    let voceAttiva = null;
    let aggiornamentoPrenotato = false;

    // Accende UNA voce (e spegne le altre), aggiornando anche l'accessibilità
    const seleziona = (link) => {
        if (voceAttiva === link) return;

        voci.forEach(({ link: voce }) => {
            const attiva = voce === link;
            voce.classList.toggle('attivo', attiva);

            if (attiva) {
                voce.setAttribute('aria-current', 'step');
            } else {
                voce.removeAttribute('aria-current');
            }
        });

        voceAttiva = link;
    };

    // Decide quale voce è "corrente" in base a quanto si è scrollato
    const aggiornaDaScroll = () => {
        aggiornamentoPrenotato = false;

        const intestazione = document.querySelector('.intestazione');
        const fondoIntestazione = intestazione
        ? intestazione.getBoundingClientRect().bottom
        : 0;

        // La sezione diventa attiva quando il suo titolo supera questa linea
        const lineaLettura = fondoIntestazione + Math.min(window.innerHeight * 0.20, 150);
        const prima = voci[0].sezione.getBoundingClientRect();
        const ultima = voci[voci.length - 1].sezione.getBoundingClientRect();

        // Fuori dall'area coperta dall'indice non resta selezionata alcuna voce
        if (lineaLettura < prima.top || lineaLettura > ultima.bottom) {
            seleziona(null);
            return;
        }

        let corrente = voci[0];

        for (const voce of voci) {
            if (voce.sezione.getBoundingClientRect().top <= lineaLettura) {
                corrente = voce;
            } else {
                break;
            }
        }

        seleziona(corrente.link);
    };

    // "Prenota" l'aggiornamento al prossimo frame: evita calcoli a raffica
    // mentre si scorre (più fluido e leggero)
    const prenotaAggiornamento = () => {
        if (aggiornamentoPrenotato) return;
        aggiornamentoPrenotato = true;
        window.requestAnimationFrame(aggiornaDaScroll);
    };

    // Cliccando una voce, la si accende subito (senza aspettare lo scroll)
    voci.forEach(({ link }) => {
        link.addEventListener('click', () => seleziona(link));
    });

    window.addEventListener('scroll', prenotaAggiornamento, { passive: true });
    window.addEventListener('resize', prenotaAggiornamento);
    window.addEventListener('hashchange', prenotaAggiornamento);

    prenotaAggiornamento();
}
