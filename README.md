# Sito Web Personale & Travel Journal - Giuseppe Ricatti

Un'applicazione web moderna, minimale e professionale creata da zero per tracciare le nazioni e città visitate nel mondo, con cartografia interattiva, date, compagni di viaggio e diario fotografico.

---

## 🌟 Caratteristiche Principali

1. **Mappa del Mondo Interattiva (CartoDB Dark Matter + GeoJSON)**:
   - **Nazioni Visitate**: evidenziate con un bagliore verde smeraldo (`#10b981`) semi-trasparente e contorni luminosi.
   - **Città Esplorate**: contrassegnate con marker HTML personalizzati a impulsi radar (`pulse-ring`), visualizzando foto, periodo e compagni di viaggio al click.
   - **Nazioni da Esplorare**: colorazione scura minimale (`#111827`), con possibilità di cliccare su qualsiasi paese per registrare un nuovo viaggio.
   - **Toolbar e Filtri**: selezione rapida per continente (Europa, Asia, Americhe, Africa, Oceania), zoom con reset e barra di ricerca istantanea con autocompletamento.

2. **Dashboard Statistiche Animate (Hero Section)**:
   - Contatori dinamici:
     - **Paesi Visitati**
     - **% del Mondo Esplorato** (calcolata sui 195 paesi ufficiali)
     - **Città Toccate**
     - **Viaggi Archiviati**
     - **Continenti Esplorati**

3. **Sezione "Chi Sono e Cosa Voglio Fare"**:
   - Biografia e filosofia di viaggio personale.
   - Tag identificativi del tuo stile (Zaino in Spalla, On the Road, Storia & Cultura, Natura, Street Food).
   - **Travel Bucket List**: i tuoi prossimi traguardi (Lofoten in Norvegia, Patagonia, Safari in Namibia, Cammino di Santiago) con pulsante per convertirli direttamente in viaggi fatti.

4. **Diario & Galleria dei Viaggi**:
   - Tutte le date esatte dei viaggi inseriti e consultabili.
   - **Con chi li hai fatti**: compagni di viaggio ben visibili in ogni scheda (es. *In solitaria*, *Con amici*, *In coppia*, *In famiglia*).
   - **Periodo e durata**: date formattate in italiano e calcolo automatico dei giorni di viaggio.
   - Filtri avanzati: ricerca libera per parola chiave, filtro per anno, filtro per compagni, filtro per categoria e ordinamento cronologico.
   - Tasto rapido **🗺️ Mappa** per centrare all'istante la mappa sul paese/città del viaggio selezionato.

5. **Aggiunta Viaggi Dinamica ("Mano a Mano")**:
   - Modale accessibile con il pulsante `+ Aggiungi Viaggio`.
   - Selezione del paese con bandiera emoji e geocoding automatico per posizionare il radar marker sulla città.
   - Persistenza automatica in `localStorage` nel browser (nessun database esterno o server richiesto).
   - Funzione di **Esportazione Backup JSON** e **Importazione Backup JSON** per salvare i tuoi viaggi o trasferirli su altri dispositivi.

---

## 📁 Struttura dei File

```
Antigravity/
├── index.html                  # Reindirizzamento rapido alla cartella Sito
└── Sito/
    ├── index.html              # Struttura semantica HTML5 completa
    ├── css/
    │   └── style.css           # Design System Vanilla CSS (Dark theme, glassmorphism, responsive)
    ├── js/
    │   ├── data.js             # Database iniziale, coordinate città e TravelDataManager (localStorage)
    │   ├── map.js              # Gestore Leaflet, layer GeoJSON paesi e marker radar città
    │   └── app.js              # Controller applicativo, filtri, modali e animazioni
    └── data/
        ├── countries-data.js   # Poligoni GeoJSON mondiali pre-caricati (offline-ready)
        └── countries.geojson   # File GeoJSON grezzo Natural Earth 110m
```

---

## 🚀 Come Aprire ed Eseguire il Sito

Il sito è stato progettato con tecnologie web pure (HTML5, Vanilla CSS3, JavaScript ES6) e **non richiede Node.js, npm o build step**.

Puoi aprirlo in qualsiasi momento:
- Facendo doppio click su `Sito/index.html`.
- Oppure da terminale eseguendo:
  ```bash
  open Sito/index.html
  ```
