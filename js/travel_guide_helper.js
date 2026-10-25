/**
 * travel_guide_helper.js - Assistente Completo per Itinerari, Documenti, Abbigliamento e Gadget
 * Creato per il Diario di Bordo di Giuseppe Ricatti
 */

(function(window) {
  "use strict";

  // ==========================================================================
  // 0. RISOLUZIONE COORDINATE BASE REALI (MAI PIÙ FALLBACK SU ROMA!)
  // ==========================================================================
  function resolveTripCoordinates(trip) {
    if (!trip) return [48.8566, 2.3522]; // Default Parigi Europa se nullo

    // 1. Se ha coordinate valide diverse da [0,0]
    if (trip.coordinates && Array.isArray(trip.coordinates) && trip.coordinates.length === 2) {
      if (trip.coordinates[0] !== 0 || trip.coordinates[1] !== 0) {
        return trip.coordinates;
      }
    }

    // 2. Se in window.CITY_COORDINATES
    const cityCoords = window.CITY_COORDINATES || {};
    const checkNames = [trip.mainCity, trip.city, trip.country];
    for (let rawName of checkNames) {
      if (!rawName) continue;
      // Controlla nomi multipli (es. "Shanghai & Zurigo" -> "Shanghai")
      const parts = rawName.split(/[,/&–-]/).map(s => s.trim());
      for (let p of parts) {
        if (cityCoords[p]) return cityCoords[p];
      }
      if (cityCoords[rawName]) return cityCoords[rawName];
    }

    // 3. Coordinate note di emergenza per le mete dei viaggi di Giuseppe
    const KNOWN_COORDS = {
      "Punta Cana": [18.5820, -68.4055],
      "Sharm el-Sheikh": [27.9158, 34.3299],
      "Stoccolma": [59.3293, 18.0686],
      "Parigi": [48.8566, 2.3522],
      "Rodi": [36.4349, 28.2175],
      "Dublino": [53.3498, -6.2603],
      "Atene": [37.9838, 23.7275],
      "Madrid": [40.4168, -3.7038],
      "Valencia": [39.4699, -0.3763],
      "Londra": [51.5074, -0.1278],
      "Shanghai": [31.2304, 121.4737],
      "Zurigo": [47.3769, 8.5417],
      "New York": [40.7128, -74.0060],
      "Boston": [42.3601, -71.0589],
      "Miami": [25.7617, -80.1918],
      "Los Angeles": [34.0522, -118.2437],
      "San Francisco": [37.7749, -122.4194],
      "Cancun": [21.1619, -86.8515],
      "San Paolo": [-23.5505, -46.6333],
      "Rio de Janeiro": [-22.9068, -43.1729],
      "Cagliari": [39.2238, 9.1217],
      "Lampedusa": [35.5069, 12.6074],
      "Firenze": [43.7696, 11.2558],
      "Venezia": [45.4408, 12.3155],
      "Napoli": [40.8518, 14.2681],
      "Bari": [41.1171, 16.8719],
      "Bangkok": [13.7444, 100.5558],
      "Koh Samui": [9.4975, 99.9328],
      "Samui": [9.4975, 99.9328],
      "Chiang Mai": [18.7883, 98.9853],
      "Chiang Rai": [19.8242, 99.7632],
      "Seoul": [37.5615, 126.9768],
      "Seul": [37.5615, 126.9768],
      "Thailandia": [13.7444, 100.5558],
      "Corea": [37.5615, 126.9768],
      "Shenzhen": [22.5431, 114.0579],
      "Hong Kong": [22.3193, 114.1694],
      "Macao": [22.1987, 113.5439],
      "Guilin": [25.2736, 110.2902],
      "Yangshuo": [24.7766, 110.4580],
      "Zhangjiajie": [29.3458, 110.5478],
      "Chongqing": [29.5583, 106.5772],
      "Chengdu": [30.6586, 104.0818],
      "Leshan": [29.5539, 103.7744],
      "Xi'an": [34.2612, 108.9423],
      "Pechino": [39.9042, 116.4074],
      "Beijing": [39.9042, 116.4074],
      "Cina": [31.2304, 121.4737]
    };

    for (let cName of Object.keys(KNOWN_COORDS)) {
      if ((trip.city && trip.city.includes(cName)) || (trip.country && trip.country.includes(cName))) {
        return KNOWN_COORDS[cName];
      }
    }

    return [51.5074, -0.1278]; // Default Londra se sconosciuto
  }

  // ==========================================================================
  // 1. DATABASE DOCUMENTI NECESSARI PER PAESE & DESTINAZIONE
  // ==========================================================================
  const TRAVEL_DOCUMENTS_DB = {
    "GBR": {
      country: "Regno Unito",
      currency: "Sterlina Britannica (GBP - £)",
      passports: {
        title: "Passaporto Obbligatorio",
        desc: "Dal 1° ottobre 2021 non è più consentito entrare con la sola carta d'identità. È necessario il passaporto con validità residua per tutto il periodo di soggiorno previsto.",
        badge: "Obbligatorio"
      },
      visa: {
        title: "Autorizzazione ETA (Electronic Travel Authorisation)",
        desc: "In vigore da inizio 2025/2026 per tutti i cittadini europei in visita turistica fino a 6 mesi. Va richiesta online prima della partenza tramite app ufficiale o sito gov.uk (£10, valida 2 anni per ingressi multipli).",
        badge: "ETA Richiesta"
      },
      health: {
        title: "Copertura Sanitaria & Assicurazione",
        desc: "La TEAM (Tessera Europea Assicurazione Malattia italiana) continua a essere valida per cure d'emergenza necessarie grazie all'accordo post-Brexit, ma si raccomanda una polizza privata con massimale per rimpatrio e annullamento.",
        badge: "TEAM + Polizza Privata"
      },
      payments: {
        title: "Valuta & Pagamenti Elettronici",
        desc: "Il Regno Unito è quasi al 100% cashless. Carte di debito/credito contactless, Apple Pay e Google Pay sono accettati ovunque (compresi metropolitana, bus a due piani TfL e mercati). Il contante è ormai raramente necessario.",
        badge: "Totalmente Cashless"
      },
      driving: {
        title: "Guida a Sinistra",
        desc: "Guida a sinistra con volante a destra. La patente di guida italiana in corso di validità è pienamente riconosciuta.",
        badge: "Guida a Sinistra"
      },
      farnesina: {
        title: "Registrazione Viaggiare Sicuri",
        desc: "Si consiglia di registrare il viaggio sul portale del Ministero degli Esteri 'Dove Siamo nel Mondo' prima del decollo.",
        badge: "Consigliato"
      }
    },

    "CHN": {
      country: "Cina",
      currency: "Renminbi Yuan Cinese (CNY - ¥)",
      passports: {
        title: "Passaporto con Validità Minima 6 Mesi",
        desc: "Il passaporto deve avere almeno 6 mesi di validità residua dalla data prevista di ingresso e almeno due pagine consecutive interamente libere per i timbri doganali.",
        badge: "Validità 6+ Mesi"
      },
      visa: {
        title: "Esenzione Visto / Visto Turistico L",
        desc: "Per i cittadini italiani è attiva l'esenzione unilaterale dal visto per soggiorni turistici e affari fino a 15/30 giorni. Per soggiorni superiori ai 30 giorni è obbligatorio il Visto Turistico L rilasciato dal CVASC con biometrica.",
        badge: "Esenzione <30gg o Visto L"
      },
      health: {
        title: "Assicurazione Sanitaria ad Alto Massimale",
        desc: "La sanità per stranieri in Cina è interamente a pagamento nei reparti internazionali VIP degli ospedali. È indispensabile stipulare una polizza sanitaria di viaggio con massimale minimo di 200.000€ comprensivo di rimpatrio aereo d'urgenza.",
        badge: "Assicurazione Alta Copertura"
      },
      payments: {
        title: "App Alipay & WeChat Pay (Indispensabili)",
        desc: "La Cina non usa quasi più contanti né carte Visa/Mastercard tradizionali nei negozi. Prima di partire è FONDAMENTALE scaricare 'Alipay' o 'WeChat' e collegare la propria carta di credito/debito internazionale.",
        badge: "Alipay / WeChat Pay"
      },
      connectivity: {
        title: "VPN Internazionale Attiva",
        desc: "In Cina Google, WhatsApp, Instagram, Facebook e gran parte dei siti occidentali sono bloccati dal 'Great Firewall'. È indispensabile acquistare una eSIM con roaming dati non censurato (es. Airalo/Holafly) oppure installare una VPN affidabile PRIMA di atterrare.",
        badge: "eSIM Roaming o VPN"
      },
      farnesina: {
        title: "Registrazione Farnesina",
        desc: "Iscrizione caldamente raccomandata su d通貨ovesiamosulmondo.it per le comunicazioni d'emergenza del Consolato Generale a Shanghai.",
        badge: "Consigliato"
      }
    },

    "USA": {
      country: "Stati Uniti d'America",
      currency: "Dollaro Statunitense (USD - $)",
      passports: {
        title: "Passaporto Elettronico E-Passport",
        desc: "Passaporto elettronico con microchip sulla copertina. Validità residua per tutta la durata del soggiorno.",
        badge: "E-Passport Obbligatorio"
      },
      visa: {
        title: "ESTA (Electronic System for Travel Authorization)",
        desc: "Richiesta online sul sito ufficiale della U.S. Customs and Border Protection almeno 72 ore prima del volo. Valida per 2 anni e per soggiorni fino a 90 giorni.",
        badge: "ESTA Obbligatorio"
      },
      health: {
        title: "Assicurazione Sanitaria Illimitata",
        desc: "Le spese mediche negli USA sono esorbitanti (un semplice accesso al pronto soccorso può superare i 5.000$). Una polizza sanitaria con massimale illimitato o superiore a 1.000.000$ è considerata imprescindibile.",
        badge: "Massimale Illimitato"
      },
      payments: {
        title: "Carte di Credito Fisiche",
        desc: "Oltre a Apple Pay/Google Pay, molti noleggi auto e hotel negli Stati Uniti richiedono TASSATIVAMENTE una carta di credito fisica con numeri in rilievo per il deposito cauzionale.",
        badge: "Carta di Credito Fisica"
      },
      farnesina: {
        title: "Registrazione Viaggiare Sicuri",
        desc: "Registrazione consigliata sul portale della Farnesina.",
        badge: "Consigliato"
      }
    },

    "THA": {
      country: "Thailandia",
      currency: "Baht Thailandese (THB - ฿)",
      passports: {
        title: "Passaporto con Validità Minima 6 Mesi",
        desc: "Il passaporto deve avere almeno 6 mesi di validità residua dalla data di ingresso e pagine libere per i timbri.",
        badge: "Validità 6+ Mesi"
      },
      visa: {
        title: "Esenzione Visto Turistico (Fino a 60 Giorni)",
        desc: "I cittadini italiani possono entrare in Thailandia per turismo senza visto preventivo fino a 60 giorni. È richiesto il biglietto aereo di uscita.",
        badge: "Esenzione Visto 60gg"
      },
      health: {
        title: "Assicurazione Sanitaria ad Alta Copertura",
        desc: "Vivamente raccomandata una polizza sanitaria privata che copra ricoveri negli ospedali internazionali (es. Bangkok Hospital) e rimpatrio.",
        badge: "Assicurazione Consigliata"
      },
      payments: {
        title: "Contanti Baht (THB) & Bancomat / Carte",
        desc: "Il contante è indispensabile per street food, mercati tradizionali e tuk-tuk. Carte Visa/Mastercard accettate in hotel e centri commerciali.",
        badge: "Contanti + Carte"
      },
      farnesina: {
        title: "Registrazione Viaggiare Sicuri",
        desc: "Registrazione raccomandata sul portale d'emergenza del Ministero degli Esteri.",
        badge: "Consigliato"
      }
    },

    "KOR": {
      country: "Corea del Sud",
      currency: "Won Sudcoreano (KRW - ₩)",
      passports: {
        title: "Passaporto in Corso di Validità",
        desc: "Passaporto elettronico con validità residua per tutta la durata del soggiorno previsto.",
        badge: "Passaporto Valido"
      },
      visa: {
        title: "Autorizzazione K-ETA (o Esenzione Temporanea)",
        desc: "Verificare sul sito ufficiale k-eta.go.kr se è attiva la deroga temporanea per l'Italia o se è richiesta la compilazione del modulo K-ETA prima del volo.",
        badge: "K-ETA Elettronico"
      },
      health: {
        title: "Assicurazione Sanitaria di Viaggio",
        desc: "La sanità sudcoreana è di altissimo livello ma a pagamento per gli stranieri. Consigliata assicurazione con massimale elevato.",
        badge: "Assicurazione Privata"
      },
      payments: {
        title: "Pagamenti Cashless & T-Money Card",
        desc: "Seoul è quasi al 100% cashless. Carte di credito accettate ovunque. Per metro, autobus e taxi è comodissima la tessera ricaricabile T-Money.",
        badge: "Cashless & T-Money"
      },
      farnesina: {
        title: "Registrazione Viaggiare Sicuri",
        desc: "Registrazione consigliata sul portale della Farnesina.",
        badge: "Consigliato"
      }
    },

    "THA_KOR": {
      country: "Thailandia & Corea del Sud",
      currency: "Baht Thailandese (THB) & Won Sudcoreano (KRW)",
      passports: {
        title: "Passaporto con Validità Minima 6 Mesi",
        desc: "Passaporto obbligatorio con almeno 6 mesi di validità residua sia per l'ingresso in Thailandia che per la prosecuzione verso la Corea del Sud.",
        badge: "Validità 6+ Mesi"
      },
      visa: {
        title: "Esenzione Visto Thai + K-ETA Corea del Sud",
        desc: "Esenzione visto fino a 60 giorni per la Thailandia; verifica K-ETA o esenzione promozionale per la Corea del Sud prima del decollo.",
        badge: "Regime Turistico Combinato"
      },
      health: {
        title: "Assicurazione Sanitaria Multipaese",
        desc: "Polizza sanitaria di viaggio con copertura per entrambi i paesi (Sud-Est Asiatico ed Estremo Oriente) comprensiva di rimpatrio.",
        badge: "Copertura Globale Asia"
      },
      payments: {
        title: "Baht in Contanti (Thai) + Carte & T-Money (Corea)",
        desc: "Contanti THB indispensabili per bancarelle e mercati in Thailandia; carte di credito e carta trasporti T-Money per muoversi agevolmente a Seoul.",
        badge: "Misto Contanti & Cashless"
      },
      farnesina: {
        title: "Registrazione Viaggiare Sicuri",
        desc: "Registrazione consigliata sul portale 'Dove Siamo nel Mondo' per entrambe le tappe.",
        badge: "Consigliato"
      }
    },
    "DOM": {
      country: "Repubblica Dominicana",
      currency: "Peso Dominicano (DOP) & Dollaro USA (USD)",
      passports: {
        title: "Passaporto Valido",
        desc: "Passaporto con validità residua minima di almeno 6 mesi alla data di ingresso.",
        badge: "Validità 6+ Mesi"
      },
      visa: {
        title: "E-Ticket Doganale & Tassa Turistica",
        desc: "Compilazione del modulo elettronico obbligatorio e-Ticket sia per l'ingresso che per l'uscita. La tassa turistica di 10$ è solitamente già inclusa nel biglietto aereo.",
        badge: "E-Ticket Elettronico"
      },
      health: {
        title: "Assicurazione Sanitaria Privata",
        desc: "Copertura assicurativa privata vivamente raccomandata per cliniche private a Santo Domingo e Punta Cana.",
        badge: "Assicurazione Consigliata"
      },
      payments: {
        title: "Dollari USA & Contanti",
        desc: "Nei resort e nelle zone turistiche il Dollaro USA è ampiamente accettato. Consigliato avere contanti di piccolo taglio per mance e mercati locali.",
        badge: "USD & Contanti"
      }
    },

    "EU_DEFAULT": {
      country: "Unione Europea / Area Schengen",
      currency: "Euro (EUR - €) o Valuta Locale",
      passports: {
        title: "Carta d'Identità o Passaporto",
        desc: "È sufficiente la carta d'identità italiana valida per l'espatrio o il passaporto in corso di validità per tutta l'Area Schengen e l'UE.",
        badge: "Carta d'Identità Valida"
      },
      visa: {
        title: "Nessun Visto Richiesto",
        desc: "Libera circolazione dei cittadini dell'Unione Europea ai sensi degli accordi comunitari.",
        badge: "Libera Circolazione"
      },
      health: {
        title: "Tessera Sanitaria TEAM Attiva",
        desc: "La Tessera Sanitaria Italiana (TEAM) garantisce assistenza medica diretta e pronto soccorso alle medesime condizioni dei residenti del paese ospitante.",
        badge: "TEAM Inclusa"
      },
      payments: {
        title: "Pagamenti Contactless & Zero Commissioni Euro",
        desc: "Nessuna commissione per i pagamenti in Euro. Carte contactless accettate ovunque.",
        badge: "Contactless UE"
      }
    }
  };

  // ==========================================================================
  // 2. DATABASE CLIMA & ABBIGLIAMENTO PER PAESE E PERIODO
  // ==========================================================================
  const TRAVEL_CLOTHING_DB = {
    "GBR_WINTER": {
      season: "Inverno Britannico (Dicembre - Febbraio)",
      tempRange: "2°C - 8°C",
      weatherDesc: "Freddo umido, frequente pioggerellina leggera ('drizzle') e giornate con luce naturale ridotta (tramonto intorno alle 15:55 a dicembre).",
      clothing: [
        "Cappotto pesante, parka imbottito o piumino antivento con trattamento idrorepellente",
        "Maglioni caldi in lana merino o maglie tecniche a strati ('vestirsi a cipolla')",
        "Pantaloni resistenti e comodi (jeans pesanti o velluto a coste)",
        "Intimo termico leggero per le giornate più rigide o visite serali ai mercatini all'aperto",
        "Sciarpa avvolgente, berretto in lana e guanti con polpastrelli touch-screen",
        "Ombrello compatto pieghevole antivento e calzini termici imbottiti"
      ],
      shoes: [
        "Stivaletti comodi da camminata con suola antiscivolo (Chelsea boots o scarponcini impermeabili tipo Gore-Tex)",
        "Sneakers robuste impermeabilizzate per lunghe camminate (15-20 km al giorno a piedi tra parchi e musei)"
      ],
      dressCode: "Stile smart-casual sobrio per ristoranti e musical nel West End; abbigliamento pratico e caldo per mercatini e Winter Wonderland."
    },

    "THA_KOR_SUMMER": {
      season: "Estate Tropicale Thailandese & Clima Estivo a Seoul (Agosto)",
      tempRange: "26°C - 35°C in Thailandia (umidità 85%) / 24°C - 32°C a Seoul",
      weatherDesc: "Caldo tropicale umido con possibili rovesci monsonici pomeridiani in Thailandia (Bangkok, Samui, Chiang Mai) e clima caldo-umido estivo a Seoul. Aria condizionata molto fredda in aeroporti, treni e centri commerciali.",
      clothing: [
        "Abiti ultra-leggeri e traspiranti in cotone o lino (t-shirt, camicie fresche)",
        "Pantaloni lunghi leggeri o pareo/sarong per accedere ai Templi Reali thailandesi (spalle e ginocchia coperte obbligatorie)",
        "Costumi da bagno, abbigliamento da spiaggia e teli mare per il soggiorno al Pure Sunset Beach Resort di Koh Samui",
        "K-way compatto o poncho antipioggia leggero per i rapidi acquazzoni tropicali",
        "Felpa leggera o giacca antivento per i voli lunghi e l'aria condizionata forte a bordo",
        "Outfit smart-casual per le serate nei quartieri alla moda di Myeongdong, Gangnam o rooftop a Bangkok"
      ],
      shoes: [
        "Sneakers comode e traspiranti facili da togliere (obbligatorio togliere le scarpe in templi e residenze tradizionali)",
        "Sandali ergonomici da camminata e ciabatte infradito per la spiaggia di Lipa Noi a Samui"
      ],
      dressCode: "Rispettoso nei templi buddisti (niente canotte né pantaloncini corti); casual e alla moda nei quartieri di Seoul (Hongdae, Gangnam)."
    },
    "CHN_SUMMER": {
      season: "Estate Subtropicale Asiatica (Luglio - Agosto)",
      tempRange: "29°C - 38°C (Percepiti oltre 42°C per afa)",
      weatherDesc: "Caldo torrido subtropicale con tasso di umidità superiore all'80%, frequenti temporali monsonici pomeridiani e drastici sbalzi termici per l'aria condizionata fortissima nei locali.",
      clothing: [
        "Abiti ultra-leggeri, traspiranti e ad asciugatura rapida in lino o cotone fine",
        "Magliette a maniche corte chiare e pantaloncini leggeri",
        "Camicia leggera a maniche lunghe o cardigan/felpina leggera (INDISPENSABILE per non prendere freddo nell'aria condizionata della metropolitana e dei centri commerciali)",
        "Cappello a tesa larga o visiera protettiva e occhiali da sole con filtro UV400",
        "K-way compatto o poncho antipioggia leggero per improvvisi rovesci estivi",
        "Ombrellino parasole anti-UV (usato comunemente in Asia sia per il sole che per la pioggia)"
      ],
      shoes: [
        "Scarpe da ginnastica traspiranti con tomaia in mesh ultra-ventilata",
        "Sandali ergonomici da camminata con suola ammortizzata (evitare scarpe chiuse rigide che non traspirano)"
      ],
      dressCode: "Per i templi buddisti o taoisti: spalle e ginocchia coperte. Per i rooftop e skybar di Pudong: look elegante o smart-chic serale."
    },

    "MEDITERRANEAN_SUMMER": {
      season: "Estate Mediterranea (Giugno - Settembre)",
      tempRange: "24°C - 34°C",
      weatherDesc: "Clima soleggiato, caldo e ventilato lungo la costa, ideale per mare, passeggiate e cene all'aperto.",
      clothing: [
        "Abiti estivi leggeri, camicie di lino, t-shirt in cotone",
        "Costumi da bagno, pareo e teli mare in microfibra",
        "Occhiali da sole polarizzati e cappello di paglia o panama",
        "Crema solare alta protezione (SPF 50+) e doposole idratante",
        "Felpa leggera o giacchino antivento per la brezza marina serale"
      ],
      shoes: [
        "Sneakers estive leggere",
        "Sandali in cuoio e infradito per la spiaggia",
        "Scarpette da scoglio se presenti fondali rocciosi o calette"
      ],
      dressCode: "Casual per la spiaggia; elegante e fresco per ristoranti di pesce e lounge bar sul mare."
    },

    "DEFAULT_TEMPERATE": {
      season: "Mezza Stagione / Clima Temperato",
      tempRange: "14°C - 22°C",
      weatherDesc: "Temperature miti e gradevoli durante il giorno con serate fresche.",
      clothing: [
        "Giacca mezza stagione (trench, giubbotto in pelle o bomber leggero)",
        "Maglie a maniche lunghe, t-shirt di base e cardigan",
        "Pantaloni chinos o jeans comodi",
        "Foulard leggero per il vento serale"
      ],
      shoes: [
        "Sneakers versatili da camminata",
        "Scarpe casual eleganti per la sera"
      ],
      dressCode: "Casual chic adatto sia alla visita della città che a eventi e musei."
    }
  };

  // ==========================================================================
  // 3. DATABASE GADGET, PRESE ELETTRICHE & ACCESSORI DI VIAGGIO
  // ==========================================================================
  const TRAVEL_GADGETS_DB = {
    "GBR": {
      country: "Regno Unito",
      plugs: {
        type: "Tipo G (3 Lamelle Rettangolari a Triangolo)",
        voltage: "230 V, frequenza 50 Hz",
        adapterNeeded: "SÌ, indispensabile per prese italiane a 2 o 3 poli.",
        note: "Le prese britanniche sono dotate di interruttore ON/OFF sul muro: ricordarsi di accenderlo prima di ricaricare!"
      },
      mustHave: [
        "Adattatore da viaggio universale UK (Tipo G) con prese USB / USB-C integrate",
        "Power bank omologato aereo (10.000 - 20.000 mAh, max 100 Wh) da portare sempre nel bagaglio a mano",
        "Apple AirTag o SmartTag per tracciare il bagaglio da stiva e lo zaino durante gli scali",
        "Ombrello tascabile antivento ad apertura automatica",
        "Custodia impermeabile o zainetto idrorepellente per fotocamera e dispositivi"
      ],
      healthKit: [
        "Tachipirina / Paracetamolo (500mg/1000mg)",
        "Antinfiammatorio (Ibuprofene)",
        "Cerotti 'Compeed' per vesciche da camminata",
        "Disinfettante mani tascabile e salviette rinfrescanti"
      ]
    },

    "CHN": {
      country: "Cina",
      plugs: {
        type: "Tipo A, Tipo C e Tipo I (Due lamelle piatte o tre lamelle inclinate)",
        voltage: "220 V, frequenza 50 Hz",
        adapterNeeded: "SÌ, consigliato adattatore universale multi-standard.",
        note: "Negli hotel moderni di Shanghai si trovano prese combo (Tipo A + C), ma un adattatore universale garantisce totale compatibilità."
      },
      mustHave: [
        "eSIM dati internazionale con roaming senza censura (es. Airalo / Holafly) o VPN premium pre-installata su smartphone e laptop",
        "Smartphone con app Alipay e WeChat già configurate e verificate con passaporto",
        "Power bank certificato con marcatura chiara dei Wattora (in Cina la sicurezza aeroportuale controlla severamente che non superi i 100 Wh e che la scritta sia leggibile)",
        "Mini ventilatore portatile USB ricaricabile (salvavita contro l'afa estiva)",
        "Fazzoletti di carta tascabili (spesso non presenti nei bagni pubblici tradizionali)"
      ],
      healthKit: [
        "Fermenti lattici ad alta concentrazione (da iniziare prima di partire)",
        "Antidiarroico (Imodio/Loperamide) e sali minerali per reidratazione",
        "Antistaminico e cerotti per vesciche",
        "Spray repellente zanzare per escursioni in parchi e canali"
      ]
    },

    "THA": {
      country: "Thailandia",
      plugs: {
        type: "Tipo A, B, C e O (220 V, 50 Hz)",
        voltage: "220 V, frequenza 50 Hz",
        adapterNeeded: "Le spine italiane a 2 poli entrano spesso senza adattatore, ma un adattatore universale è consigliato per prese a 3 poli.",
        note: "Tensione 220V compatibile con tutti i dispositivi elettronici italiani."
      },
      mustHave: [
        "Adattatore universale da viaggio compatto",
        "Power bank omologato IATA (da tenere nel bagaglio a mano durante i voli)",
        "Sacca impermeabile (Dry Bag) per escursioni in barca longtail e mare",
        "Spray repellente insetti tropicali ad alta efficacia (DEET)",
        "Zainetto leggero per le escursioni giornaliere"
      ],
      healthKit: [
        "Fermenti lattici ad alta concentrazione",
        "Antidiarroico (Imodium) e sali reidratanti",
        "Paracetamolo e cerotti per vesciche",
        "Crema solare protettiva ad alto fattore (SPF 50+)"
      ]
    },

    "KOR": {
      country: "Corea del Sud",
      plugs: {
        type: "Tipo C ed F (Schuko standard tedesco a due poli rotondi)",
        voltage: "220 V, frequenza 60 Hz",
        adapterNeeded: "Compatibilità diretta per le spine standard a 2 poli rotondi.",
        note: "Le normali prese europee a 2 poli funzionano perfettamente a Seoul."
      },
      mustHave: [
        "Carta ricaricabile T-Money (acquistabile nei convenience store GS25/CU per metro e taxi)",
        "eSIM o Pocket Wi-Fi per connessione dati ad altissima velocità",
        "App Naver Map o KakaoMap (Google Maps ha funzionalità a piedi limitate in Corea)",
        "Power bank portatile con cavo USB-C rapido",
        "Portatessere tascabile per la metro"
      ],
      healthKit: [
        "Kit pronto soccorso base, paracetamolo e antinfiammatorio",
        "Cerotti da camminata",
        "Salviette rinfrescanti"
      ]
    },

    "THA_KOR": {
      country: "Thailandia & Corea del Sud",
      plugs: {
        type: "Tipo A, B, C, O (Thailandia) / Tipo C ed F Schuko (Corea del Sud)",
        voltage: "220 V, 50/60 Hz",
        adapterNeeded: "Consigliato adattatore universale multi-standard per coprire entrambi i paesi.",
        note: "Gli hotel DAVAA Bangkok, Moose Chiang Mai e Hotel Gracery Seoul dispongono di prese moderne compatibili."
      },
      mustHave: [
        "Adattatore da viaggio universale multi-porta",
        "Power bank 10.000 - 20.000 mAh (obbligatorio a bordo nel bagaglio a mano per regole IATA)",
        "Carta T-Money per i trasporti a Seoul",
        "Dry Bag impermeabile per le escursioni in barca a Damnoen Saduak e Ang Thong",
        "AirTag per tracciare i bagagli da stiva sui 5 voli del viaggio"
      ],
      healthKit: [
        "Repellente zanzare per la Thailandia tropicale",
        "Fermenti lattici e kit disturbi gastrointestinali",
        "Protezione solare SPF 50+ e doposole idratante",
        "Cerotti 'Compeed' per le lunghe camminate nei mercati e a Seoul"
      ]
    },
    "DEFAULT": {
      country: "Mondo / Standard Globale",
      plugs: {
        type: "Standard Locale o Europeo (Tipo C / F)",
        voltage: "220-240 V, 50 Hz",
        adapterNeeded: "Consigliato avere sempre un adattatore universale da viaggio compatto all-in-one.",
        note: "Un adattatore universale consente di collegare qualsiasi spina italiana a prese di tutto il mondo."
      },
      mustHave: [
        "Adattatore da viaggio universale multi-paese",
        "Power bank compatto da 10.000 o 20.000 mAh con ricarica rapida",
        "Organizzatori valigia a compressione (Packing Cubes) per ottimizzare lo spazio",
        "Cuffie con cancellazione del rumore per i voli a lungo e medio raggio",
        "Cuscino da viaggio ergonomico per il collo"
      ],
      healthKit: [
        "Kit pronto soccorso base: termometro digitale, cerotti, disinfettante",
        "Antidolorifico e farmaci abituali",
        "Fermenti lattici e compresse per disturbi gastrointestinali"
      ]
    }
  };

  // ==========================================================================
  // 4. ITINERARI DETTAGLIATI CON COORDINATE GEOGRAFICHE PER OGNI ATTIVITÀ
  // ==========================================================================
  const UPCOMING_TRIP_ITINERARIES = {
    "trip-real-49": {
      "destination": "Thailandia (Bangkok, Koh Samui, Chiang Mai) & Corea del Sud (Seoul)",
      "theme": "Templi Millenari, Spiagge Tropicali, K-Culture & Metropoli Asiatica",
      "flightInfo": "Thai Airways Airbus A350 (TG941/940), Bangkok Airways (PG), Eastar Jet 737 MAX (ZE4)",
      "days": [
            {
                  "dayNumber": 1,
                  "date": "Mercoledì 5 Agosto 2026",
                  "title": "Partenza da Milano Malpensa verso Bangkok",
                  "summary": "Decollo alle ore 14:05 da Milano Malpensa con volo intercontinentale Thai Airways TG941 su Airbus A350 verso Bangkok Suvarnabhumi. Posti assegnati al ponte superiore: 32J, 32K, 32L.",
                  "schedule": [
                        {
                              "id": "act-49-1-1",
                              "time": "11:30",
                              "title": "Arrivo a Milano Malpensa (MXP) & Check-in",
                              "desc": "Consegna bagagli da stiva ai banchi Thai Airways (franchigia 3 bagagli da 23 kg + 3 bagagli a mano da 7 kg 25x45x55 cm). Codice PNR: ODPYI - 7GH. Costo tratta: 1.518,00 €.",
                              "icon": "🛫",
                              "locationName": "Aeroporto di Milano Malpensa Terminal 1",
                              "coords": [
                                    45.6306,
                                    8.7281
                              ],
                              "flag": "🇹🇭"
                        },
                        {
                              "id": "act-49-1-2",
                              "time": "14:05",
                              "title": "Decollo Volo Thai Airways TG941",
                              "desc": "Volo di 10 ore e 50 minuti diretto a Bangkok. Servizio pasti a bordo e intrattenimento multimediale sui posti ponte superiore 32J, 32K, 32L.",
                              "icon": "✈️",
                              "locationName": "Volo Thai Airways TG941 MXP-BKK",
                              "coords": [
                                    45.6306,
                                    8.7281
                              ],
                              "flag": "🇹🇭"
                        }
                  ]
            },
            {
                  "dayNumber": 2,
                  "date": "Giovedì 6 Agosto 2026",
                  "title": "Arrivo a Bangkok & Check-in DAVAA Hotel Sukhumvit",
                  "summary": "Atterraggio mattutino alle 05:55 a Bangkok Suvarnabhumi, trasferimento a Sukhumvit, sistemazione al DAVAA Hotel Bangkok e prima immersione nella metropoli.",
                  "schedule": [
                        {
                              "id": "act-49-2-1",
                              "time": "05:55",
                              "title": "Atterraggio a Bangkok Suvarnabhumi (BKK)",
                              "desc": "Arrivo in Thailandia, controllo passaporti con timbro di esenzione turistica e ritiro dei 3 bagagli da stiva.",
                              "icon": "🛬",
                              "locationName": "Aeroporto di Bangkok Suvarnabhumi (BKK)",
                              "coords": [
                                    13.69,
                                    100.7501
                              ],
                              "flag": "🇹🇭"
                        },
                        {
                              "id": "act-49-2-2",
                              "time": "08:30",
                              "title": "Trasferimento a Sukhumvit Soi 11 & Deposito Bagagli",
                              "desc": "Arrivo al DAVAA Hotel Bangkok (43 Soi Sukhumvit 11, Klongtoey Nua, Wattana, Bangkok 10110). Consegna bagagli prima del check-in.",
                              "icon": "🏨",
                              "locationName": "DAVAA Hotel Bangkok (Sukhumvit 11)",
                              "coords": [
                                    13.7444,
                                    100.5558
                              ],
                              "flag": "🇹🇭"
                        },
                        {
                              "id": "act-49-2-3",
                              "time": "14:00",
                              "title": "Check-in DAVAA Hotel Bangkok (PIN: 6031)",
                              "desc": "Assegnazione camere per il soggiorno di 4 notti (costo totale: 304,80 €, colazione inclusa, PNR: 442650080, PIN: 6031). Relax e rinfresco.",
                              "icon": "🔑",
                              "locationName": "DAVAA Hotel Bangkok - Camere",
                              "coords": [
                                    13.7444,
                                    100.5558
                              ],
                              "flag": "🇹🇭"
                        },
                        {
                              "id": "act-49-2-4",
                              "time": "18:30",
                              "title": "Passeggiata Serale e Cena a Sukhumvit Soi 11",
                              "desc": "Primo assaggio di street food thailandese autentico e atmosfera cosmopolita tra le luci di Sukhumvit.",
                              "icon": "🍜",
                              "locationName": "Sukhumvit Soi 11 Street Market",
                              "coords": [
                                    13.746,
                                    100.5565
                              ],
                              "flag": "🇹🇭"
                        }
                  ]
            },
            {
                  "dayNumber": 3,
                  "date": "Venerdì 7 Agosto 2026",
                  "title": "Escursione Mercati Galleggianti, Treno Maeklong & Corgi Café",
                  "summary": "Grande escursione guidata di un'intera giornata (06:30 - 18:00, costo 167,70 €) al mercato della ferrovia di Maeklong, al mercato galleggiante di Damnoen Saduak e visita speciale al Corgi Café (30,00 €).",
                  "schedule": [
                        {
                              "id": "act-49-3-1",
                              "time": "06:30",
                              "title": "Partenza Tour Guidato dal DAVAA Hotel",
                              "desc": "Incontro con la guida privata e partenza in van climatizzato per l'escursione di un'intera giornata (Costo escursione: 167,70 €).",
                              "icon": "🚐",
                              "locationName": "Pick-up DAVAA Hotel Sukhumvit",
                              "coords": [
                                    13.7444,
                                    100.5558
                              ],
                              "flag": "🇹🇭"
                        },
                        {
                              "id": "act-49-3-2",
                              "time": "08:30",
                              "title": "Mercato della Ferrovia di Maeklong (Talad Rom Hub)",
                              "desc": "Spettacolo unico al mondo: i commercianti ritirano tende e ceste di frutta pochi secondi prima che il treno transiti sfiorando le bancarelle.",
                              "icon": "🚆",
                              "locationName": "Maeklong Railway Market",
                              "coords": [
                                    13.4075,
                                    99.9987
                              ],
                              "flag": "🇹🇭"
                        },
                        {
                              "id": "act-49-3-3",
                              "time": "10:30",
                              "title": "Mercato Galleggiante di Damnoen Saduak",
                              "desc": "Navigazione su barca tradizionale in legno lungo i canali tra venditori galleggianti di cocco fresco, mango sticky rice e zuppe noodles fumanti.",
                              "icon": "🛶",
                              "locationName": "Damnoen Saduak Floating Market",
                              "coords": [
                                    13.5197,
                                    99.9599
                              ],
                              "flag": "🇹🇭"
                        },
                        {
                              "id": "act-49-3-4",
                              "time": "13:00",
                              "title": "Pranzo Tradizionale Thai lungo il Canale",
                              "desc": "Sosta gastronomica con piatti tradizionali thai cucinati sul momento dalle piroghe galleggianti.",
                              "icon": "🍲",
                              "locationName": "Ristorante lungo i canali di Damnoen Saduak",
                              "coords": [
                                    13.521,
                                    99.9605
                              ],
                              "flag": "🇹🇭"
                        },
                        {
                              "id": "act-49-3-5",
                              "time": "15:30",
                              "title": "Corgi in the Garden Tour & Café",
                              "desc": "Visita speciale e pausa relax al celebre café dei cagnolini Corgi (Costo attività: 30,00 €) con coccole e foto ricordo divertenti.",
                              "icon": "🐕",
                              "locationName": "Corgi in the Garden Café Bangkok",
                              "coords": [
                                    13.7788,
                                    100.4144
                              ],
                              "flag": "🇹🇭"
                        },
                        {
                              "id": "act-49-3-6",
                              "time": "18:00",
                              "title": "Rientro al DAVAA Hotel Bangkok & Serata a Sukhumvit",
                              "desc": "Termine dell'escursione, rientro in hotel e cena rilassante nei pressi di Sukhumvit 11.",
                              "icon": "🌆",
                              "locationName": "DAVAA Hotel Bangkok (Sukhumvit 11)",
                              "coords": [
                                    13.7444,
                                    100.5558
                              ],
                              "flag": "🇹🇭"
                        }
                  ]
            },
            {
                  "dayNumber": 4,
                  "date": "Sabato 8 Agosto 2026",
                  "title": "I Grandi Templi Reali di Bangkok & Wat Arun",
                  "summary": "Immersione nell'arte sacra buddhista: il Grande Palazzo Reale con il Wat Phra Kaew, il maestoso Buddha Sdraiato del Wat Pho, il traghetto sul Chao Phraya e il Wat Arun.",
                  "schedule": [
                        {
                              "id": "act-49-4-1",
                              "time": "09:00",
                              "title": "Grande Palazzo Reale & Wat Phra Kaew",
                              "desc": "La residenza storica dei re del Siam e il venerato tempio del Buddha di Smeraldo, capolavoro di guglie dorate e mosaici policromi.",
                              "icon": "👑",
                              "locationName": "Grand Palace & Wat Phra Kaew",
                              "coords": [
                                    13.75,
                                    100.4915
                              ],
                              "flag": "🇹🇭"
                        },
                        {
                              "id": "act-49-4-2",
                              "time": "12:30",
                              "title": "Wat Pho: Il Buddha Sdraiato Gigante",
                              "desc": "La spettacolare statua dorata lunga 46 metri con piedi intarsiati in madreperla e culla del massaggio tradizionale thai.",
                              "icon": "🧘",
                              "locationName": "Wat Pho (Tempio del Buddha Sdraiato)",
                              "coords": [
                                    13.7465,
                                    100.4933
                              ],
                              "flag": "🇹🇭"
                        },
                        {
                              "id": "act-49-4-3",
                              "time": "15:30",
                              "title": "Traghetto sul Chao Phraya & Wat Arun",
                              "desc": "Attraversamento panoramico del fiume verso il Tempio dell'Alba, decorato da migliaia di pezzi di porcellana cinese scintillante.",
                              "icon": "🛕",
                              "locationName": "Wat Arun (Tempio dell'Alba)",
                              "coords": [
                                    13.7437,
                                    100.4889
                              ],
                              "flag": "🇹🇭"
                        },
                        {
                              "id": "act-49-4-4",
                              "time": "19:00",
                              "title": "ICONSIAM & Spettacolo sul Fiume",
                              "desc": "Cena affacciata sul fiume Chao Phraya presso l'avveniristico centro ICONSIAM con spettacolo di fontane danzanti illuminate.",
                              "icon": "⛲",
                              "locationName": "ICONSIAM Riverside Bangkok",
                              "coords": [
                                    13.7267,
                                    100.5107
                              ],
                              "flag": "🇹🇭"
                        }
                  ]
            },
            {
                  "dayNumber": 5,
                  "date": "Domenica 9 Agosto 2026",
                  "title": "Mercato di Chatuchak, Massaggio Tradizionale & Skyline",
                  "summary": "Visita all'incredibile Chatuchak Weekend Market con oltre 15.000 bancarelle, pomeriggio di autentico relax con massaggio thailandese e rooftop serale.",
                  "schedule": [
                        {
                              "id": "act-49-5-1",
                              "time": "10:00",
                              "title": "Chatuchak Weekend Market",
                              "desc": "Il più grande mercato all'aperto dell'Asia: artigianato in legno, sete thai, oli essenziali, spezie e abbigliamento locale.",
                              "icon": "🛍️",
                              "locationName": "Chatuchak Weekend Market",
                              "coords": [
                                    13.7999,
                                    100.5505
                              ],
                              "flag": "🇹🇭"
                        },
                        {
                              "id": "act-49-5-2",
                              "time": "15:00",
                              "title": "Massaggio Tradizionale Thailandese a Sukhumvit",
                              "desc": "Seduta rilassante e rigenerante di massaggio tradizionale thailandese a due passi dall'hotel.",
                              "icon": "💆",
                              "locationName": "Centro Benessere Sukhumvit Soi 11",
                              "coords": [
                                    13.745,
                                    100.556
                              ],
                              "flag": "🇹🇭"
                        },
                        {
                              "id": "act-49-5-3",
                              "time": "19:00",
                              "title": "Cocktail al Tramonto su Rooftop Bar & Preparativi Volo",
                              "desc": "Aperitivo con vista spettacolare a 360° sui grattacieli di Bangkok illuminati e preparativi bagagli per Koh Samui.",
                              "icon": "🍸",
                              "locationName": "Rooftop Skybar Sukhumvit",
                              "coords": [
                                    13.742,
                                    100.554
                              ],
                              "flag": "🇹🇭"
                        }
                  ]
            },
            {
                  "dayNumber": 6,
                  "date": "Lunedì 10 Agosto 2026",
                  "title": "Volo su Koh Samui & Check-in Pure Sunset Beach Resort",
                  "summary": "Check-out dal DAVAA Hotel, volo mattutino Bangkok Airways (06:55-07:55) verso l'isola tropicale di Koh Samui e sistemazione al Pure Sunset Beach Resort a Lipa Noi.",
                  "schedule": [
                        {
                              "id": "act-49-6-1",
                              "time": "05:00",
                              "title": "Check-out DAVAA Hotel & Transfer Aeroporto BKK",
                              "desc": "Saluto a Bangkok e trasferimento veloce verso l'aeroporto Suvarnabhumi per il volo interno.",
                              "icon": "🚕",
                              "locationName": "DAVAA Hotel Sukhumvit 11",
                              "coords": [
                                    13.7444,
                                    100.5558
                              ],
                              "flag": "🇹🇭"
                        },
                        {
                              "id": "act-49-6-2",
                              "time": "06:55",
                              "title": "Volo Bangkok Airways BKK ➔ Koh Samui USM",
                              "desc": "Volo di 1h00 con Bangkok Airways (costo: 553,59 €, PNR: QGIIYI - PG9). Posti assegnati: 24A, 24B, 24C. Franchigia: 3 bagagli da stiva 20 kg + 3 a mano 7 kg.",
                              "icon": "✈️",
                              "locationName": "Volo Bangkok Airways BKK-USM",
                              "coords": [
                                    13.69,
                                    100.7501
                              ],
                              "flag": "🇹🇭"
                        },
                        {
                              "id": "act-49-6-3",
                              "time": "07:55",
                              "title": "Atterraggio all'Aeroporto di Koh Samui (USM)",
                              "desc": "Arrivo nell'aeroporto-giardino tropicale a cielo aperto più bello del mondo tra palme e padiglioni in bambù.",
                              "icon": "🛬",
                              "locationName": "Samui International Airport (USM)",
                              "coords": [
                                    9.5478,
                                    100.0623
                              ],
                              "flag": "🇹🇭"
                        },
                        {
                              "id": "act-49-6-4",
                              "time": "14:00",
                              "title": "Check-in Pure Sunset Beach Resort (PIN: 7155)",
                              "desc": "Sistemazione per 5 notti (costo totale: 648,80 €, colazione inclusa, PNR: 479188432, PIN: 7155) affacciati sulla spiaggia incontaminata di Lipa Noi.",
                              "icon": "🏖️",
                              "locationName": "Pure Sunset Beach Resort - Lipa Noi Beach",
                              "coords": [
                                    9.4975,
                                    99.9328
                              ],
                              "flag": "🇹🇭"
                        },
                        {
                              "id": "act-49-6-5",
                              "time": "17:30",
                              "title": "Tramonto Dorato sulla Spiaggia di Lipa Noi",
                              "desc": "Spettacolo mozzafiato del sole che si tuffa nel Golfo del Siam con colori infuocati sulla celebre spiaggia del tramonto.",
                              "icon": "🌅",
                              "locationName": "Lipa Noi Sunset Point",
                              "coords": [
                                    9.496,
                                    99.9315
                              ],
                              "flag": "🇹🇭"
                        }
                  ]
            },
            {
                  "dayNumber": 7,
                  "date": "Martedì 11 Agosto 2026",
                  "title": "Tempio del Grande Buddha & Fisherman's Village Bophut",
                  "summary": "Visita ai santuari sacri di Wat Phra Yai e Wat Plai Laem, seguita dal suggestivo villaggio di pescatori di Bophut con cena in riva al mare.",
                  "schedule": [
                        {
                              "id": "act-49-7-1",
                              "time": "10:00",
                              "title": "Wat Phra Yai (Grande Buddha) & Wat Plai Laem",
                              "desc": "La colossale statua dorata del Buddha alta 12 metri sulla penisola rocciosa di Koh Faan e il tempio con la dea Guanyin dalle 18 braccia.",
                              "icon": "🛕",
                              "locationName": "Wat Phra Yai & Wat Plai Laem",
                              "coords": [
                                    9.5707,
                                    100.0604
                              ],
                              "flag": "🇹🇭"
                        },
                        {
                              "id": "act-49-7-2",
                              "time": "16:30",
                              "title": "Passeggiata a Fisherman's Village Bophut",
                              "desc": "Il fascino delle antiche case coloniali cinesi in legno trasformate in boutique esclusive, botteghe artigiane e beach lounge bar.",
                              "icon": "🏮",
                              "locationName": "Fisherman's Village Bophut",
                              "coords": [
                                    9.5593,
                                    100.0306
                              ],
                              "flag": "🇹🇭"
                        },
                        {
                              "id": "act-49-7-3",
                              "time": "19:30",
                              "title": "Cena a Bordo Spiaggia a Bophut",
                              "desc": "Cena a base di pesce freschissimo, gamberoni tigre e curry di cocco con tavoli illuminati da candele direttamente sulla sabbia.",
                              "icon": "🦞",
                              "locationName": "Ristorante sulla spiaggia di Bophut",
                              "coords": [
                                    9.5598,
                                    100.0312
                              ],
                              "flag": "🇹🇭"
                        }
                  ]
            },
            {
                  "dayNumber": 8,
                  "date": "Mercoledì 12 Agosto 2026",
                  "title": "Escursione al Parco Nazionale Marino di Ang Thong",
                  "summary": "Tour in motoscafo veloce attraverso le 42 isole calcaree del Parco di Ang Thong tra kayak marino, snorkeling e la terrazza panoramica della Laguna Verde Smeraldo.",
                  "schedule": [
                        {
                              "id": "act-49-8-1",
                              "time": "08:00",
                              "title": "Partenza Motoscafo per l'Arcipelago di Ang Thong",
                              "desc": "Navigazione verso le scogliere calcaree ricoperte di fitta giungla tropicale del Parco Nazionale Marino.",
                              "icon": "🚤",
                              "locationName": "Imbarco Tour Ang Thong Marine Park",
                              "coords": [
                                    9.62,
                                    99.67
                              ],
                              "flag": "🇹🇭"
                        },
                        {
                              "id": "act-49-8-2",
                              "time": "10:30",
                              "title": "Kayak Marino tra le Grotte & Snorkeling",
                              "desc": "Esplorazione in kayak tra faraglioni e calette solitarie con snorkeling su fondali ricchi di pesci pappagallo e coralli.",
                              "icon": "🤿",
                              "locationName": "Koh Mae Ko (Laguna di Ang Thong)",
                              "coords": [
                                    9.625,
                                    99.675
                              ],
                              "flag": "🇹🇭"
                        },
                        {
                              "id": "act-49-8-3",
                              "time": "12:30",
                              "title": "Punto Panoramico della Laguna Smeraldo (Talay Nai)",
                              "desc": "Salita sul sentiero panoramico con vista mozzafiato sul lago salato interno verde smeraldo circondato da pareti di roccia.",
                              "icon": "🏞️",
                              "locationName": "Talay Nai Emerald Lake Viewpoint",
                              "coords": [
                                    9.615,
                                    99.668
                              ],
                              "flag": "🇹🇭"
                        },
                        {
                              "id": "act-49-8-4",
                              "time": "17:30",
                              "title": "Rientro al Pure Sunset Beach Resort",
                              "desc": "Rientro al resort a Lipa Noi per un bagno rilassante in piscina e cena tropicale serale.",
                              "icon": "🌅",
                              "locationName": "Pure Sunset Beach Resort",
                              "coords": [
                                    9.4975,
                                    99.9328
                              ],
                              "flag": "🇹🇭"
                        }
                  ]
            },
            {
                  "dayNumber": 9,
                  "date": "Giovedì 13 Agosto 2026",
                  "title": "Giornata Relax & Mare Cristallino a Lipa Noi Beach",
                  "summary": "Totale relax tropicale sotto le palme da cocco di Lipa Noi Beach, massaggi in riva al mare e aperitivo al calar del sole.",
                  "schedule": [
                        {
                              "id": "act-49-9-1",
                              "time": "10:00",
                              "title": "Bagni nelle Acque Calme di Lipa Noi Beach",
                              "desc": "Mattinata di sole e mare cristallino nella baia più tranquilla e riparata dell'isola.",
                              "icon": "🏊",
                              "locationName": "Lipa Noi Beachfront",
                              "coords": [
                                    9.496,
                                    99.9315
                              ],
                              "flag": "🇹🇭"
                        },
                        {
                              "id": "act-49-9-2",
                              "time": "15:00",
                              "title": "Massaggio con Olio di Cocco sotto le Palme",
                              "desc": "Trattamento benessere tradizionale rilassante con brezza marina e profumo di cocco.",
                              "icon": "🥥",
                              "locationName": "Pure Sunset Beach Spa & Gazebo",
                              "coords": [
                                    9.4975,
                                    99.9328
                              ],
                              "flag": "🇹🇭"
                        },
                        {
                              "id": "act-49-9-3",
                              "time": "19:00",
                              "title": "Sunset Cocktail & Cena Romantica sulla Spiaggia",
                              "desc": "Brindisi al tramonto con fiaccole accese sulla spiaggia e cucina thailandese d'autore.",
                              "icon": "🍹",
                              "locationName": "Pure Sunset Restaurant & Bar",
                              "coords": [
                                    9.497,
                                    99.932
                              ],
                              "flag": "🇹🇭"
                        }
                  ]
            },
            {
                  "dayNumber": 10,
                  "date": "Venerdì 14 Agosto 2026",
                  "title": "Chaweng Beach & Ultimo Tramonto a Koh Samui",
                  "summary": "Escursione alla celebre spiaggia orientale di Chaweng, shopping di artigianato locale e preparazione bagagli per il volo su Chiang Mai.",
                  "schedule": [
                        {
                              "id": "act-49-10-1",
                              "time": "11:00",
                              "title": "Spiaggia Bianca & Baia di Chaweng",
                              "desc": "Passeggiata lungo la spiaggia di sabbia bianca borotalco di Chaweng, tra sport acquatici e vivaci beach club.",
                              "icon": "🏖️",
                              "locationName": "Chaweng Beach Koh Samui",
                              "coords": [
                                    9.5284,
                                    100.0577
                              ],
                              "flag": "🇹🇭"
                        },
                        {
                              "id": "act-49-10-2",
                              "time": "16:00",
                              "title": "Piscina al Tramonto & Preparazione Valigie",
                              "desc": "Ultime ore di relax a Lipa Noi e organizzazione dei bagagli per il trasferimento aereo del giorno seguente.",
                              "icon": "🧳",
                              "locationName": "Pure Sunset Beach Resort",
                              "coords": [
                                    9.4975,
                                    99.9328
                              ],
                              "flag": "🇹🇭"
                        },
                        {
                              "id": "act-49-10-3",
                              "time": "19:30",
                              "title": "Cena d'Addio alle Isole a Lipa Noi",
                              "desc": "Cena celebrativa con piatti a base di frutti di mare e brindisi all'indimenticabile soggiorno a Samui.",
                              "icon": "🥂",
                              "locationName": "Lipa Noi Beachside Dining",
                              "coords": [
                                    9.498,
                                    99.9335
                              ],
                              "flag": "🇹🇭"
                        }
                  ]
            },
            {
                  "dayNumber": 11,
                  "date": "Sabato 15 Agosto 2026",
                  "title": "Volo su Chiang Mai & Check-in Moose Hotel",
                  "summary": "Check-out da Koh Samui, volo diretto Bangkok Airways (08:55-10:40) verso Chiang Mai nel cuore del nord della Thailandia, check-in al Moose Hotel e Night Bazaar.",
                  "schedule": [
                        {
                              "id": "act-49-11-1",
                              "time": "07:00",
                              "title": "Check-out dal Resort & Transfer Aeroporto USM",
                              "desc": "Saluto a Lipa Noi e arrivo all'aeroporto tropicale di Koh Samui.",
                              "icon": "🚐",
                              "locationName": "Samui Airport (USM)",
                              "coords": [
                                    9.5478,
                                    100.0623
                              ],
                              "flag": "🇹🇭"
                        },
                        {
                              "id": "act-49-11-2",
                              "time": "08:55",
                              "title": "Volo Bangkok Airways USM ➔ Chiang Mai CNX",
                              "desc": "Volo di 1h45 verso la capitale culturale del nord (costo: 423,59 €, PNR: DVYHSY - PG9). Posti assegnati: 16A, 16B, 16C. Arrivo previsto ore 10:40.",
                              "icon": "✈️",
                              "locationName": "Volo Bangkok Airways USM-CNX",
                              "coords": [
                                    18.7677,
                                    98.964
                              ],
                              "flag": "🇹🇭"
                        },
                        {
                              "id": "act-49-11-3",
                              "time": "14:00",
                              "title": "Check-in Moose Hotel Chiang Mai (PIN: 4129)",
                              "desc": "Sistemazione per 4 notti presso il Moose Hotel (351 Rachadamnoen Road, costo totale: 255,80 €, PNR: 481792377, PIN: 4129) nel centro storico.",
                              "icon": "🏨",
                              "locationName": "Moose Hotel Chiang Mai (Rachadamnoen Road)",
                              "coords": [
                                    18.7883,
                                    98.9853
                              ],
                              "flag": "🇹🇭"
                        },
                        {
                              "id": "act-49-11-4",
                              "time": "16:30",
                              "title": "Visita al Tempio Dorato Wat Phra Singh",
                              "desc": "Esplorazione del venerato tempio del XIV secolo con il santuario Lai Kam affrescato con scene di vita tradizionale Lanna.",
                              "icon": "🛕",
                              "locationName": "Wat Phra Singh Chiang Mai",
                              "coords": [
                                    18.7884,
                                    98.9814
                              ],
                              "flag": "🇹🇭"
                        },
                        {
                              "id": "act-49-11-5",
                              "time": "19:30",
                              "title": "Street Food al Night Bazaar & Degustazione Khao Soi",
                              "desc": "Immersione nei profumi del Night Bazaar e assaggio del famoso Khao Soi (zuppa di noodle al curry con latte di cocco e noodle croccanti).",
                              "icon": "🍜",
                              "locationName": "Chiang Mai Night Bazaar",
                              "coords": [
                                    18.7865,
                                    99.0003
                              ],
                              "flag": "🇹🇭"
                        }
                  ]
            },
            {
                  "dayNumber": 12,
                  "date": "Domenica 16 Agosto 2026",
                  "title": "Il Tempio Sacro di Doi Suthep & Sunday Walking Street",
                  "summary": "Ascesa alla montagna sacra per visitare il Wat Phra That Doi Suthep con vista panoramica sulla valle, l'antico Wat Chedi Luang e il celebre mercato serale.",
                  "schedule": [
                        {
                              "id": "act-49-12-1",
                              "time": "09:00",
                              "title": "Wat Phra That Doi Suthep",
                              "desc": "Salita della maestosa scalinata dei draghi Naga (306 gradini) fino allo spettacolare chedi dorato a oltre 1.000 metri di quota con vista su tutta Chiang Mai.",
                              "icon": "⛰️",
                              "locationName": "Wat Phra That Doi Suthep",
                              "coords": [
                                    18.8049,
                                    98.9215
                              ],
                              "flag": "🇹🇭"
                        },
                        {
                              "id": "act-49-12-2",
                              "time": "13:00",
                              "title": "Pranzo Tradizionale con Cucina Lanna",
                              "desc": "Sosta in un caratteristico ristorante con giardino tropicale per gustare spiedini satay, salsiccia del nord (Sai Oua) e riso glutinoso.",
                              "icon": "🥗",
                              "locationName": "Ristorante Tradizionale Lanna Chiang Mai",
                              "coords": [
                                    18.791,
                                    98.975
                              ],
                              "flag": "🇹🇭"
                        },
                        {
                              "id": "act-49-12-3",
                              "time": "15:30",
                              "title": "Wat Chedi Luang & La Grande Pagoda di Mattoni",
                              "desc": "L'imponente pagoda del 1441 parzialmente restaurata, custode storica della leggenda del Buddha di Smeraldo.",
                              "icon": "🏛️",
                              "locationName": "Wat Chedi Luang",
                              "coords": [
                                    18.7869,
                                    98.9873
                              ],
                              "flag": "🇹🇭"
                        },
                        {
                              "id": "act-49-12-4",
                              "time": "18:30",
                              "title": "Sunday Walking Street su Rachadamnoen Road",
                              "desc": "L'intera Rachadamnoen Road proprio davanti al Moose Hotel diventa una fiera pedonale di artigianato artistico, lampade in seta e musica acustica.",
                              "icon": "🏮",
                              "locationName": "Sunday Walking Street Market",
                              "coords": [
                                    18.7883,
                                    98.9853
                              ],
                              "flag": "🇹🇭"
                        }
                  ]
            },
            {
                  "dayNumber": 13,
                  "date": "Lunedì 17 Agosto 2026",
                  "title": "Grande Escursione a Chiang Rai: Tempio Bianco & Tempio Blu",
                  "summary": "Escursione guidata con pick-up diretto al Moose Hotel (Costo 261,38 €): sorgenti termali, il surreale Tempio Bianco (Wat Rong Khun), il Tempio Blu (Wat Rong Suea Ten) e la Casa Nera.",
                  "schedule": [
                        {
                              "id": "act-49-13-1",
                              "time": "07:00",
                              "title": "Pick-up al Moose Hotel con Guida Privata",
                              "desc": "Incontro nella hall del Moose Hotel con la guida autorizzata e partenza verso la provincia di Chiang Rai (Costo escursione: 261,38 €).",
                              "icon": "🚐",
                              "locationName": "Pick-up Moose Hotel Chiang Mai",
                              "coords": [
                                    18.7883,
                                    98.9853
                              ],
                              "flag": "🇹🇭"
                        },
                        {
                              "id": "act-49-13-2",
                              "time": "09:30",
                              "title": "Sosta alle Sorgenti Termali di Mae Kachan",
                              "desc": "Pausa rinfrescante alle sorgenti calde geologiche naturali dove l'acqua zampilla a oltre 90°C.",
                              "icon": "♨️",
                              "locationName": "Mae Kachan Hot Springs",
                              "coords": [
                                    19.1172,
                                    99.5167
                              ],
                              "flag": "🇹🇭"
                        },
                        {
                              "id": "act-49-13-3",
                              "time": "11:00",
                              "title": "Il Tempio Bianco di Chiang Rai (Wat Rong Khun)",
                              "desc": "Visita all'incredibile capolavoro dell'artista Chalermchai Kositpipat: una struttura candida ricoperta di frammenti di specchio che riflettono la luce del sole, simbolo della purezza del Buddha.",
                              "icon": "✨",
                              "locationName": "Wat Rong Khun (White Temple)",
                              "coords": [
                                    19.8242,
                                    99.7632
                              ],
                              "flag": "🇹🇭"
                        },
                        {
                              "id": "act-49-13-4",
                              "time": "13:00",
                              "title": "Pranzo a Buffet con Specialità Tipiche",
                              "desc": "Pranzo a buffet compreso nell'escursione con piatti tipici thailandesi freschi.",
                              "icon": "🍲",
                              "locationName": "Ristorante Tradizionale a Chiang Rai",
                              "coords": [
                                    19.826,
                                    99.765
                              ],
                              "flag": "🇹🇭"
                        },
                        {
                              "id": "act-49-13-5",
                              "time": "14:30",
                              "title": "Il Tempio Blu (Wat Rong Suea Ten)",
                              "desc": "Straordinario tempio moderno dalle intense tonalità blu zaffiro e oro zecchino con un candido Buddha gigante in porcellana bianca all'interno.",
                              "icon": "🔷",
                              "locationName": "Wat Rong Suea Ten (Blue Temple)",
                              "coords": [
                                    19.9234,
                                    99.8419
                              ],
                              "flag": "🇹🇭"
                        },
                        {
                              "id": "act-49-13-6",
                              "time": "16:00",
                              "title": "Museo della Casa Nera (Baan Dam)",
                              "desc": "Il complesso di oltre 40 costruzioni in legno scuro tradizionale ideato dall'artista Thawan Duchanee con collezioni d'arte e architettura Lanna.",
                              "icon": "🖤",
                              "locationName": "Baan Dam Museum (Black House)",
                              "coords": [
                                    19.9922,
                                    99.8606
                              ],
                              "flag": "🇹🇭"
                        },
                        {
                              "id": "act-49-13-7",
                              "time": "19:30",
                              "title": "Rientro al Moose Hotel a Chiang Mai",
                              "desc": "Ritorno in hotel dopo un'indimenticabile giornata di arte contemporanea e spiritualità.",
                              "icon": "🏨",
                              "locationName": "Moose Hotel Chiang Mai",
                              "coords": [
                                    18.7883,
                                    98.9853
                              ],
                              "flag": "🇹🇭"
                        }
                  ]
            },
            {
                  "dayNumber": 14,
                  "date": "Martedì 18 Agosto 2026",
                  "title": "Artigianato a Baan Kang Wat & Preparativi per Seoul",
                  "summary": "Visita all'ecovillaggio creativo di Baan Kang Wat, relax tra le botteghe artigiane della Città Vecchia e preparazione al grande volo notturno per la Corea del Sud.",
                  "schedule": [
                        {
                              "id": "act-49-14-1",
                              "time": "10:00",
                              "title": "Villaggio Artistico Baan Kang Wat",
                              "desc": "Comunità ecologica e artigianale immersa nel verde con atelier di ceramica, legatoria e caffè immersi nella foresta.",
                              "icon": "🌿",
                              "locationName": "Baan Kang Wat Community Art Village",
                              "coords": [
                                    18.7766,
                                    98.9515
                              ],
                              "flag": "🇹🇭"
                        },
                        {
                              "id": "act-49-14-2",
                              "time": "14:30",
                              "title": "Passeggiata nei Giardini dei Templi della Città Vecchia",
                              "desc": "Ultime passeggiate rilassanti tra i vicoli ombreggiati e sosta in una caffetteria specialty thai.",
                              "icon": "☕",
                              "locationName": "Città Vecchia di Chiang Mai",
                              "coords": [
                                    18.788,
                                    98.984
                              ],
                              "flag": "🇹🇭"
                        },
                        {
                              "id": "act-49-14-3",
                              "time": "19:30",
                              "title": "Cena Tradizionale di Saluto alla Thailandia",
                              "desc": "Brindisi all'avventura thailandese e sistemazione finale dei bagagli prima del transfer serale in aeroporto.",
                              "icon": "🥢",
                              "locationName": "Rachadamnoen Road Dining",
                              "coords": [
                                    18.7883,
                                    98.9853
                              ],
                              "flag": "🇹🇭"
                        }
                  ]
            },
            {
                  "dayNumber": 15,
                  "date": "Mercoledì 19 - Giovedì 20 Agosto 2026",
                  "title": "Volo Notturno su Seoul & Check-in Hotel Gracery Seoul",
                  "summary": "Volo notturno Eastar Jet da Chiang Mai a Seoul Incheon (23:20-07:10, 840,37 €), arrivo in Corea del Sud, treno AREX e check-in all'Hotel Gracery Seoul a Sejong-daero.",
                  "schedule": [
                        {
                              "id": "act-49-15-1",
                              "time": "20:30",
                              "title": "Check-out Moose Hotel & Transfer Aeroporto CNX",
                              "desc": "Saluto a Chiang Mai e trasferimento per l'aeroporto internazionale di Chiang Mai.",
                              "icon": "🚕",
                              "locationName": "Chiang Mai International Airport (CNX)",
                              "coords": [
                                    18.7677,
                                    98.964
                              ],
                              "flag": "🇹🇭"
                        },
                        {
                              "id": "act-49-15-2",
                              "time": "23:20",
                              "title": "Decollo Volo Eastar Jet ZE CNX ➔ Seoul ICN",
                              "desc": "Volo notturno internazionale di 5h50 (costo: 840,37 €, PNR: GGPMK - ZE4). Posti assegnati: 10C, 10D, 10E. Franchigia: 3 bagagli da stiva 15 kg + 3 a mano 10 kg.",
                              "icon": "✈️",
                              "locationName": "Volo Eastar Jet CNX-ICN",
                              "coords": [
                                    18.7677,
                                    98.964
                              ],
                              "flag": "🇰🇷"
                        },
                        {
                              "id": "act-49-15-3",
                              "time": "07:10",
                              "title": "Atterraggio a Seoul Incheon (Corea del Sud! 🇰🇷)",
                              "desc": "Arrivo a Seoul, controlli doganali e acquisto delle carte ricaricabili T-Money per i trasporti urbani.",
                              "icon": "🛬",
                              "locationName": "Incheon International Airport (ICN)",
                              "coords": [
                                    37.4602,
                                    126.4407
                              ],
                              "flag": "🇰🇷"
                        },
                        {
                              "id": "act-49-15-4",
                              "time": "09:30",
                              "title": "Treno Espresso AREX verso Seoul Station",
                              "desc": "Treno diretto ad alta velocità che collega l'aeroporto di Incheon al cuore di Seoul in soli 43 minuti.",
                              "icon": "🚆",
                              "locationName": "Seoul Station AREX Terminal",
                              "coords": [
                                    37.5559,
                                    126.9723
                              ],
                              "flag": "🇰🇷"
                        },
                        {
                              "id": "act-49-15-5",
                              "time": "10:30",
                              "title": "Arrivo all'Hotel Gracery Seoul & Deposito Bagagli",
                              "desc": "Arrivo all'Hotel Gracery Seoul (12 Sejong-daero 12-gil, Jung-gu, Seoul 04526). Deposito valigie prima del check-in.",
                              "icon": "🏨",
                              "locationName": "Hotel Gracery Seoul (Jung-gu, Sejong-daero)",
                              "coords": [
                                    37.5615,
                                    126.9768
                              ],
                              "flag": "🇰🇷"
                        },
                        {
                              "id": "act-49-15-6",
                              "time": "12:00",
                              "title": "Pranzo Tradizionale a Namdaemun: Bibimbap & Mandu",
                              "desc": "Primo autentico pasto coreano nel mercato storico di Namdaemun tra ciotole sfrigolanti di dolsot bibimbap e ravioli mandu.",
                              "icon": "🥟",
                              "locationName": "Namdaemun Traditional Market",
                              "coords": [
                                    37.5592,
                                    126.9776
                              ],
                              "flag": "🇰🇷"
                        },
                        {
                              "id": "act-49-15-7",
                              "time": "15:00",
                              "title": "Check-in Hotel Gracery Seoul (PIN: 6227)",
                              "desc": "Assegnazione camere per il soggiorno di 7 notti (costo totale: 782,10 €, PNR: 48944512, PIN: 6227, pagato senza pasti). Rinfresco e riposo.",
                              "icon": "🔑",
                              "locationName": "Hotel Gracery Seoul - Camere",
                              "coords": [
                                    37.5615,
                                    126.9768
                              ],
                              "flag": "🇰🇷"
                        },
                        {
                              "id": "act-49-15-8",
                              "time": "17:30",
                              "title": "Passeggiata a Cheonggyecheon & Piazza Gwanghwamun",
                              "desc": "Passeggiata lungo il torrente cittadino rigenerato fino alla statua del Re Sejong e del Generale Yi Sun-sin.",
                              "icon": "🌊",
                              "locationName": "Cheonggyecheon Stream & Gwanghwamun",
                              "coords": [
                                    37.5695,
                                    126.9782
                              ],
                              "flag": "🇰🇷"
                        },
                        {
                              "id": "act-49-15-9",
                              "time": "19:30",
                              "title": "Street Food Serale a Myeongdong",
                              "desc": "Tteokbokki piccanti, spiedini di pollo yakitori coreani, formaggio grigliato e dolci hotteok tra i fiumi di luci al neon.",
                              "icon": "🍢",
                              "locationName": "Myeongdong Street Food Night Market",
                              "coords": [
                                    37.5636,
                                    126.985
                              ],
                              "flag": "🇰🇷"
                        }
                  ]
            },
            {
                  "dayNumber": 16,
                  "date": "Venerdì 21 Agosto 2026",
                  "title": "Palazzo Gyeongbokgung, Hanok Village & N Seoul Tower",
                  "summary": "La magnificenza della dinastia Joseon: cambio della guardia a Gyeongbokgung, le dimore storiche di Bukchon Hanok e vista tramonto dalla N Seoul Tower.",
                  "schedule": [
                        {
                              "id": "act-49-16-1",
                              "time": "09:30",
                              "title": "Palazzo Gyeongbokgung & Cambio della Guardia",
                              "desc": "Il palazzo principale dei re Joseon con la cerimonia solenne dei guardiani reali in costumi tradizionali e il padiglione Gyeonghoeru sul lago.",
                              "icon": "🏯",
                              "locationName": "Gyeongbokgung Palace",
                              "coords": [
                                    37.5796,
                                    126.977
                              ],
                              "flag": "🇰🇷"
                        },
                        {
                              "id": "act-49-16-2",
                              "time": "12:00",
                              "title": "Bukchon Hanok Village",
                              "desc": "Passeggiata tra i vicoli acciottolati e le case tradizionali coreane hanok in legno con tetti curvi e cortili intimi.",
                              "icon": "🏡",
                              "locationName": "Bukchon Hanok Village",
                              "coords": [
                                    37.5826,
                                    126.9837
                              ],
                              "flag": "🇰🇷"
                        },
                        {
                              "id": "act-49-16-3",
                              "time": "14:00",
                              "title": "Tè Tradizionale Coreano a Insadong",
                              "desc": "Sosta rilassante in un'antica casa da tè in legno a Insadong tra infusi di zenzero, giuggiole e dolcetti di riso.",
                              "icon": "🍵",
                              "locationName": "Insadong Traditional Art Street",
                              "coords": [
                                    37.5744,
                                    126.9856
                              ],
                              "flag": "🇰🇷"
                        },
                        {
                              "id": "act-49-16-4",
                              "time": "17:00",
                              "title": "Funivia e Tramonto alla N Seoul Tower",
                              "desc": "Salita sul Monte Namsan e terrazza panoramica della torre a 480 metri di quota con vista a 360° sull'infinita metropoli illuminata.",
                              "icon": "🗼",
                              "locationName": "N Seoul Tower (Namsan Mountain)",
                              "coords": [
                                    37.5512,
                                    126.9882
                              ],
                              "flag": "🇰🇷"
                        },
                        {
                              "id": "act-49-16-5",
                              "time": "20:00",
                              "title": "Autentico Korean Barbecue (K-BBQ) con Samgyeopsal",
                              "desc": "Cena tipica K-BBQ con carne grigliata al tavolo su brace a carbone, foglie di perilla, kimchi fermentato e salse ssamjang.",
                              "icon": "🥩",
                              "locationName": "Ristorante K-BBQ Myeongdong",
                              "coords": [
                                    37.562,
                                    126.984
                              ],
                              "flag": "🇰🇷"
                        }
                  ]
            },
            {
                  "dayNumber": 17,
                  "date": "Sabato 22 Agosto 2026",
                  "title": "Dongdaemun Design Plaza, Gwangjang Market & Hongdae",
                  "summary": "L'avveniristica architettura di Zaha Hadid a Dongdaemun, il leggendario street food del mercato Gwangjang e la movida giovane di Hongdae.",
                  "schedule": [
                        {
                              "id": "act-49-17-1",
                              "time": "10:00",
                              "title": "Dongdaemun Design Plaza (DDP) di Zaha Hadid",
                              "desc": "La gigantesca astronave d'argento curva in alluminio e cemento: capolavoro mondiale del design e sede della Seoul Fashion Week.",
                              "icon": "🛸",
                              "locationName": "Dongdaemun Design Plaza (DDP)",
                              "coords": [
                                    37.567,
                                    127.0095
                              ],
                              "flag": "🇰🇷"
                        },
                        {
                              "id": "act-49-17-2",
                              "time": "13:00",
                              "title": "Pranzo al Mercato Tradizionale di Gwangjang",
                              "desc": "I celebri banchi di Bindaetteok (pancake di soia macinata croccanti) e Mayak Gimbap resi famosi dai documentari gastronomici.",
                              "icon": "🥞",
                              "locationName": "Gwangjang Traditional Food Market",
                              "coords": [
                                    37.5701,
                                    126.9998
                              ],
                              "flag": "🇰🇷"
                        },
                        {
                              "id": "act-49-17-3",
                              "time": "16:00",
                              "title": "Shopping K-Fashion e Cosmetica K-Beauty",
                              "desc": "Visita ai megastore e ai negozi monomarca di moda asiatica di Dongdaemun e Myeongdong.",
                              "icon": "🛍️",
                              "locationName": "Dongdaemun Fashion District",
                              "coords": [
                                    37.568,
                                    127.008
                              ],
                              "flag": "🇰🇷"
                        },
                        {
                              "id": "act-49-17-4",
                              "time": "20:30",
                              "title": "Serata e Spettacoli Busking a Hongdae",
                              "desc": "L'epicentro della cultura giovanile di Seoul: band indie che suonano dal vivo sui marciapiedi, crew di ballo K-Pop e locali underground.",
                              "icon": "🎸",
                              "locationName": "Hongdae Youth Street",
                              "coords": [
                                    37.5563,
                                    126.9237
                              ],
                              "flag": "🇰🇷"
                        }
                  ]
            },
            {
                  "dayNumber": 18,
                  "date": "Domenica 23 Agosto 2026",
                  "title": "Gangnam Style, Starfield Library & Tempio Bongeunsa",
                  "summary": "Oltre il fiume Han nel lussuoso quartiere di Gangnam: la spettacolare Starfield Library del COEX, la statua di Gangnam Style, K-Star Road e il millenario tempio Bongeunsa.",
                  "schedule": [
                        {
                              "id": "act-49-18-1",
                              "time": "10:00",
                              "title": "Arrivo a Gangnam & Statua 'Gangnam Style'",
                              "desc": "Le iconiche mani incrociate giganti dedicate al fenomeno globale di Psy davanti al centro espositivo COEX.",
                              "icon": "🕺",
                              "locationName": "Gangnam Style Monument at COEX",
                              "coords": [
                                    37.5118,
                                    127.0592
                              ],
                              "flag": "🇰🇷"
                        },
                        {
                              "id": "act-49-18-2",
                              "time": "11:30",
                              "title": "Starfield Library al COEX Mall",
                              "desc": "La biblioteca futuristica più fotografata al mondo con pareti di libri monumentali alte 13 metri e lucernari di vetro sul soffitto.",
                              "icon": "📚",
                              "locationName": "Starfield Library COEX",
                              "coords": [
                                    37.5118,
                                    127.0592
                              ],
                              "flag": "🇰🇷"
                        },
                        {
                              "id": "act-49-18-3",
                              "time": "14:00",
                              "title": "K-Star Road & Apgujeong Rodeo",
                              "desc": "Il viale delle star della musica K-Pop con le sculture GangnamDol personalizzate per BTS, EXO, Blackpink e le boutique di lusso.",
                              "icon": "⭐",
                              "locationName": "K-Star Road Apgujeong",
                              "coords": [
                                    37.527,
                                    127.04
                              ],
                              "flag": "🇰🇷"
                        },
                        {
                              "id": "act-49-18-4",
                              "time": "16:30",
                              "title": "Tempio Buddista di Bongeunsa",
                              "desc": "Oasi spirituale fondata nel 794 d.C. con la statua del Buddha Maitreya di 23 metri incorniciata dai grattacieli futuristici di Gangnam.",
                              "icon": "🛕",
                              "locationName": "Bongeunsa Buddhist Temple",
                              "coords": [
                                    37.5146,
                                    127.0573
                              ],
                              "flag": "🇰🇷"
                        },
                        {
                              "id": "act-49-18-5",
                              "time": "19:30",
                              "title": "Chimaek: Pollo Fritto Coreano & Birra a Garosu-gil",
                              "desc": "Cena tradizionale con il celebre 'Chimaek' (pollo fritto extra-croccante glassato alla soia e aglio o piccante con birra fresca).",
                              "icon": "🍗",
                              "locationName": "Garosu-gil Dining Boulevard",
                              "coords": [
                                    37.52,
                                    127.023
                              ],
                              "flag": "🇰🇷"
                        }
                  ]
            },
            {
                  "dayNumber": 19,
                  "date": "Lunedì 24 Agosto 2026",
                  "title": "Palazzo Changdeokgung, Giardino Segreto & Fontane di Banpo",
                  "summary": "Visita al palazzo patrimonio UNESCO di Changdeokgung con il suo magico Giardino Segreto (Huwon) e spettacolo serale delle fontane arcobaleno sul fiume Han.",
                  "schedule": [
                        {
                              "id": "act-49-19-1",
                              "time": "09:30",
                              "title": "Giardino Segreto (Huwon) di Changdeokgung",
                              "desc": "Tour esclusivo del maestoso giardino reale con laghetti di loto, padiglioni Buyongjeong e alberi secolari inserito nel Patrimonio UNESCO.",
                              "icon": "🌸",
                              "locationName": "Changdeokgung Secret Garden (Huwon)",
                              "coords": [
                                    37.5794,
                                    126.991
                              ],
                              "flag": "🇰🇷"
                        },
                        {
                              "id": "act-49-19-2",
                              "time": "13:00",
                              "title": "Pranzo tra i Vicoli Artistici di Samcheong-dong",
                              "desc": "Passeggiata tra botteghe di ceramica, gallerie indipendenti e ristoranti ricavati all'interno di antichi hanok.",
                              "icon": "🥢",
                              "locationName": "Samcheong-dong Cultural Area",
                              "coords": [
                                    37.584,
                                    126.982
                              ],
                              "flag": "🇰🇷"
                        },
                        {
                              "id": "act-49-19-3",
                              "time": "16:00",
                              "title": "Museo Nazionale della Corea",
                              "desc": "Il più grande polo museale del paese che custodisce capolavori millenari, corone in oro della dinastia Silla e pagode in pietra.",
                              "icon": "🏛️",
                              "locationName": "National Museum of Korea",
                              "coords": [
                                    37.524,
                                    126.9803
                              ],
                              "flag": "🇰🇷"
                        },
                        {
                              "id": "act-49-19-4",
                              "time": "19:30",
                              "title": "Banpo Bridge Moonlight Rainbow Fountain",
                              "desc": "Il ponte a fontana più lungo del mondo con 380 ugelli d'acqua sincronizzati su musica e fasci di luce colorata sul fiume Han.",
                              "icon": "🌈",
                              "locationName": "Banpo Bridge Moonlight Fountain",
                              "coords": [
                                    37.51,
                                    126.996
                              ],
                              "flag": "🇰🇷"
                        }
                  ]
            },
            {
                  "dayNumber": 20,
                  "date": "Martedì 25 Agosto 2026",
                  "title": "Quartieri Creativi di Hongdae & Parco Hangang a Yeouido",
                  "summary": "Esplorazione della Seoul contemporanea: boutique vintage, caffè a tema, giro in bicicletta sul fiume Han al Parco Yeouido e cena K-BBQ.",
                  "schedule": [
                        {
                              "id": "act-49-20-1",
                              "time": "11:00",
                              "title": "Boutique Creative & Photo-Booth K-Photo a Hongdae",
                              "desc": "I famosi caffè di design e i negozi di cartoleria coreana d'autore.",
                              "icon": "📸",
                              "locationName": "Hongik University Creative Quarter",
                              "coords": [
                                    37.5563,
                                    126.9237
                              ],
                              "flag": "🇰🇷"
                        },
                        {
                              "id": "act-49-20-2",
                              "time": "14:30",
                              "title": "Bicicletta e Relax al Parco Hangang di Yeouido",
                              "desc": "Noleggio bici per costeggiare il grande fiume Han all'ombra dei grattacieli finanziari di Yeouido Island.",
                              "icon": "🚴",
                              "locationName": "Yeouido Hangang Park",
                              "coords": [
                                    37.5283,
                                    126.9344
                              ],
                              "flag": "🇰🇷"
                        },
                        {
                              "id": "act-49-20-3",
                              "time": "19:30",
                              "title": "Cena con Costolette Galbi & Kimchi Jjigae",
                              "desc": "Cena tradizionale con carne di manzo marinata e speziata alla soia e stufato di kimchi fumante.",
                              "icon": "🍲",
                              "locationName": "Ristorante Galbi Tradizionale Mapo",
                              "coords": [
                                    37.558,
                                    126.925
                              ],
                              "flag": "🇰🇷"
                        }
                  ]
            },
            {
                  "dayNumber": 21,
                  "date": "Mercoledì 26 Agosto 2026",
                  "title": "Mercato del Pesce di Noryangjin & Shopping Finale",
                  "summary": "Visita all'incredibile mercato ittico di Noryangjin, ultimi acquisti di souvenir e K-Beauty a Myeongdong e Lotte Department Store, preparazione valigie.",
                  "schedule": [
                        {
                              "id": "act-49-21-1",
                              "time": "10:30",
                              "title": "Mercato Ittico Tradizionale di Noryangjin",
                              "desc": "Uno dei più vasti mercati del pesce dell'Asia: centinaia di vasche con granchi giganti reali, gamberi e frutti di mare preparati sul momento.",
                              "icon": "🦀",
                              "locationName": "Noryangjin Fisheries Wholesale Market",
                              "coords": [
                                    37.5144,
                                    126.9408
                              ],
                              "flag": "🇰🇷"
                        },
                        {
                              "id": "act-49-21-2",
                              "time": "14:30",
                              "title": "Shopping Finale a Myeongdong & Lotte Department Store",
                              "desc": "Acquisto di souvenir tipici, tè verde dell'isola di Jeju, maschere per il viso e snack coreani.",
                              "icon": "🎁",
                              "locationName": "Lotte Department Store Main & Myeongdong",
                              "coords": [
                                    37.5636,
                                    126.985
                              ],
                              "flag": "🇰🇷"
                        },
                        {
                              "id": "act-49-21-3",
                              "time": "18:00",
                              "title": "Rientro all'Hotel Gracery Seoul & Preparazione Bagagli",
                              "desc": "Sistemazione delle valigie nel rispetto delle franchigie aeree per il grande viaggio di rientro intercontinentale.",
                              "icon": "🧳",
                              "locationName": "Hotel Gracery Seoul",
                              "coords": [
                                    37.5615,
                                    126.9768
                              ],
                              "flag": "🇰🇷"
                        },
                        {
                              "id": "act-49-21-4",
                              "time": "20:30",
                              "title": "Cena d'Addio a Seoul con Soju & Makgeolli",
                              "desc": "Ultima serata speciale nella capitale coreana con brindisi a base di vino di riso e soju tradizionale.",
                              "icon": "🍶",
                              "locationName": "Sejong-daero Traditional Dining",
                              "coords": [
                                    37.561,
                                    126.978
                              ],
                              "flag": "🇰🇷"
                        }
                  ]
            },
            {
                  "dayNumber": 22,
                  "date": "Giovedì 27 Agosto 2026",
                  "title": "Check-out Hotel Gracery & Volo Seoul ➔ Bangkok",
                  "summary": "Check-out dall'Hotel Gracery Seoul, treno AREX per Incheon, decollo volo Thai Airways TG657 (17:25-21:15) verso Bangkok Suvarnabhumi per il transito.",
                  "schedule": [
                        {
                              "id": "act-49-22-1",
                              "time": "10:30",
                              "title": "Check-out Hotel Gracery Seoul (PIN: 6227)",
                              "desc": "Saluto alla Corea del Sud e check-out definitivo dalle camere dell'Hotel Gracery su Sejong-daero.",
                              "icon": "🔑",
                              "locationName": "Hotel Gracery Seoul (12 Sejong-daero 12-gil)",
                              "coords": [
                                    37.5615,
                                    126.9768
                              ],
                              "flag": "🇰🇷"
                        },
                        {
                              "id": "act-49-22-2",
                              "time": "12:30",
                              "title": "Treno AREX Express verso l'Aeroporto ICN",
                              "desc": "Treno veloce verso il Terminal Internazionale dell'aeroporto di Seoul Incheon.",
                              "icon": "🚆",
                              "locationName": "Incheon International Airport Terminal",
                              "coords": [
                                    37.4602,
                                    126.4407
                              ],
                              "flag": "🇰🇷"
                        },
                        {
                              "id": "act-49-22-3",
                              "time": "14:30",
                              "title": "Check-in ai Banchi Thai Airways & Controlli",
                              "desc": "Imbarco bagagli da stiva con etichette fino a Milano Malpensa. Franchigia 3x23kg stiva + 3x7kg cabina.",
                              "icon": "🛄",
                              "locationName": "Incheon Airport Departure Gates",
                              "coords": [
                                    37.4602,
                                    126.4407
                              ],
                              "flag": "🇹🇭 🇰🇷"
                        },
                        {
                              "id": "act-49-22-4",
                              "time": "17:25",
                              "title": "Decollo Volo Thai Airways TG657 ICN ➔ BKK",
                              "desc": "Volo internazionale di 5 ore e 50 minuti verso Bangkok. Arrivo previsto all'aeroporto Suvarnabhumi alle 21:15.",
                              "icon": "✈️",
                              "locationName": "Volo Thai Airways TG657 ICN-BKK",
                              "coords": [
                                    37.4602,
                                    126.4407
                              ],
                              "flag": "🇹🇭 🇰🇷"
                        },
                        {
                              "id": "act-49-22-5",
                              "time": "21:15",
                              "title": "Arrivo a Bangkok Suvarnabhumi (BKK) & Transito",
                              "desc": "Transito passeggeri all'aeroporto Suvarnabhumi di Bangkok in attesa della coincidenza notturna per l'Italia.",
                              "icon": "🛬",
                              "locationName": "Bangkok Suvarnabhumi Airport Transit Hall",
                              "coords": [
                                    13.69,
                                    100.7501
                              ],
                              "flag": "🇹🇭"
                        }
                  ]
            },
            {
                  "dayNumber": 23,
                  "date": "Venerdì 28 Agosto 2026",
                  "title": "Volo Notturno Bangkok ➔ Milano Malpensa & Rientro a Casa",
                  "summary": "Decollo alle ore 00:40 da Bangkok BKK con volo Thai Airways TG940 (Airbus A350, posti ponte superiore 32J, 32K, 32L, 1.272,99 €) e atterraggio a Milano Malpensa alle 07:35.",
                  "schedule": [
                        {
                              "id": "act-49-23-1",
                              "time": "00:40",
                              "title": "Decollo Volo Thai Airways TG940 BKK ➔ MXP",
                              "desc": "Volo intercontinentale di 11 ore e 55 minuti su Airbus A350-900 (costo: 1.272,99 €, PNR: ODPYI - TG9). Posti assegnati al ponte superiore: 32J, 32K, 32L.",
                              "icon": "🛫",
                              "locationName": "Volo Thai Airways TG940 BKK-MXP",
                              "coords": [
                                    13.69,
                                    100.7501
                              ],
                              "flag": "🇹🇭 🇮🇹"
                        },
                        {
                              "id": "act-49-23-2",
                              "time": "07:35",
                              "title": "Atterraggio a Milano Malpensa (MXP)",
                              "desc": "Arrivo al Terminal 1 di Milano Malpensa, ritiro dei bagagli e rientro a casa dopo 24 giorni straordinari tra Thailandia e Corea del Sud!",
                              "icon": "🛬",
                              "locationName": "Aeroporto di Milano Malpensa Terminal 1",
                              "coords": [
                                    45.6306,
                                    8.7281
                              ],
                              "flag": "🇮🇹"
                        }
                  ]
            }
      ]
},

    // VIAGGIO 51: LONDRA (04/12/2026 - 07/12/2026)
    "trip-real-51": {
      destination: "Londra, Regno Unito",
      theme: "Magia del Natale Londinese & Luci d'Autore",
      flightInfo: "Volo MXP ➔ LTN Wizz Air A321neo (W4 6301) / Ritorno LTN ➔ MXP (W4 6304)",
      days: [
        {
          dayNumber: 1,
          date: "Venerdì 4 Dicembre 2026",
          title: "Arrivo a Londra, Check-in & Prime Luci di Covent Garden",
          summary: "Volo mattutino per Luton, arrivo a St Pancras, sistemazione e passeggiata tra le luci dorate e le boutique di Covent Garden e Carnaby Street.",
          schedule: [
            { id: "act-51-1-1", time: "09:20", title: "Arrivo all'Aeroporto di Londra Luton (LTN)", desc: "Atterraggio a bordo dell'Airbus A321neo e passaggio ai varchi elettronici ePassport con ETA.", icon: "🛬", locationName: "Aeroporto di Londra Luton", coords: [51.8747, -0.3683] },
            { id: "act-51-1-2", time: "10:30", title: "Treno Thameslink verso St Pancras International", desc: "Navetta DART e treno veloce verso il cuore monumentale di Londra.", icon: "🚆", locationName: "St Pancras International Station", coords: [51.5314, -0.1261] },
            { id: "act-51-1-3", time: "13:00", title: "Pranzo Gourmet al Seven Dials Market", desc: "Sosta golosa nel mercato coperto coperto con street food d'autore e formaggi caldi.", icon: "🍔", locationName: "Seven Dials Market", coords: [51.5139, -0.1268] },
            { id: "act-51-1-4", time: "14:30", title: "Covent Garden & Grande Albero di Natale", desc: "L'albero gigante di Natale di 18 metri, oltre 115.000 luci LED e campane monumentali.", icon: "🎄", locationName: "Piazza di Covent Garden", coords: [51.5117, -0.1226] },
            { id: "act-51-1-5", time: "16:45", title: "Installazioni di Luce a Carnaby Street", desc: "Le celebri luminarie al neon aeree e passeggiata nel quartiere artistico di Soho.", icon: "✨", locationName: "Carnaby Street", coords: [51.5132, -0.1388] },
            { id: "act-51-1-6", time: "19:30", title: "Cena Tradizionale in Pub Vittoriano a Soho", desc: "Fish & Chips d'autore, birra Ale tradizionale britannica e atmosfera d'epoca.", icon: "🍺", locationName: "Old Compton Street, Soho", coords: [51.5135, -0.1340] }
          ]
        },
        {
          dayNumber: 2,
          date: "Sabato 5 Dicembre 2026",
          title: "Icone di Westminster, Mercatini sul Tamigi & Regent Street",
          summary: "Dal Big Ben e Buckingham Palace fino ai mercatini di Natale affacciati sul fiume Tamigi e allo spettacolo degli Angeli di Regent Street.",
          schedule: [
            { id: "act-51-2-1", time: "09:30", title: "Big Ben & Palazzo di Westminster", desc: "Scorci iconici del Big Ben restaurato e della storica abbazia reale di Westminster.", icon: "🏛️", locationName: "Big Ben & Parliament Square", coords: [51.5007, -0.1246] },
            { id: "act-51-2-2", time: "11:00", title: "Passeggiata a St. James's Park & Buckingham Palace", desc: "Passeggiata tra i viali alberati popolati da scoiattoli fino alla residenza reale.", icon: "👑", locationName: "Buckingham Palace", coords: [51.5014, -0.1419] },
            { id: "act-51-2-3", time: "12:45", title: "Pranzo al Tradizionale Borough Market", desc: "Il mercato alimentare più amato sul Tamigi: formaggi, panini caldi, tartufi e dolci.", icon: "🧀", locationName: "Borough Market", coords: [51.5055, -0.0910] },
            { id: "act-51-2-4", time: "14:30", title: "Tower Bridge & Mercatino 'Winter by the River'", desc: "Chalet in legno natalizi sul fiume Tamigi con artigianato, vin brulé e vista sul ponte.", icon: "🌉", locationName: "Tower Bridge & Southwark", coords: [51.5055, -0.0754] },
            { id: "act-51-2-5", time: "17:00", title: "L'Angelo di Luce su Regent Street", desc: "'The Spirit of Christmas', i maestosi angeli scintillanti dorati su tutta la curva di Regent Street.", icon: "👼", locationName: "Regent Street Curve", coords: [51.5097, -0.1370] },
            { id: "act-51-2-6", time: "19:00", title: "Aperitivo Panoramico allo Sky Garden", desc: "Giardino pensile a 150 metri d'altezza con vista spettacolare a 360° sulla City illuminata.", icon: "🍸", locationName: "Sky Garden (Walkie Talkie)", coords: [51.5111, -0.0837] }
          ]
        },
        {
          dayNumber: 3,
          date: "Domenica 6 Dicembre 2026",
          title: "Tesori Culturali & Il Villaggio delle Favole a Winter Wonderland",
          summary: "Mattina al British Museum, pomeriggio interamente dedicato al leggendario Winter Wonderland di Hyde Park e vetrine scintillanti di Harrods.",
          schedule: [
            { id: "act-51-3-1", time: "09:00", title: "Great Court & Collezioni del British Museum", desc: "La magnifica cupola di vetro di Norman Foster, la Stele di Rosetta e i capolavori antichi.", icon: "🏛️", locationName: "The British Museum", coords: [51.5194, -0.1270] },
            { id: "act-51-3-2", time: "12:30", title: "Brunch Tradizionale a Marylebone", desc: "Atmosfera rilassata tra boulangerie artigianali e caffè storici.", icon: "🥐", locationName: "Marylebone High Street", coords: [51.5204, -0.1517] },
            { id: "act-51-3-3", time: "14:30", title: "Ingresso ad Hyde Park: Winter Wonderland", desc: "Il più celebre parco a tema natalizio europeo con oltre 100 attrazioni e sculture di ghiaccio.", icon: "🎡", locationName: "Hyde Park Winter Wonderland", coords: [51.5073, -0.1657] },
            { id: "act-51-3-4", time: "17:00", title: "Pattinaggio sul Ghiaccio attorno al Gazebo Reale", desc: "L'Ice Rink illuminato da migliaia di microluci con musica dal vivo in sottofondo.", icon: "⛸️", locationName: "Winter Wonderland Ice Rink", coords: [51.5085, -0.1670] },
            { id: "act-51-3-5", time: "22:00", title: "Vetrine Natalizie e Facciata di Harrods", desc: "La storica facciata monumentale illuminata da migliaia di lampadine dorate a Knightsbridge.", icon: "🛍️", locationName: "Harrods, Knightsbridge", coords: [51.4994, -0.1632] }
          ]
        },
        {
          dayNumber: 4,
          date: "Lunedì 7 Dicembre 2026",
          title: "Camden Lock, Shopping Finale a Oxford Street & Volo di Rientro",
          summary: "I murales e le chiuse di Camden Town, acquisti natalizi su Oxford Street e partenza serale verso Malpensa.",
          schedule: [
            { id: "act-51-4-1", time: "09:45", title: "Camden Market & Regent's Canal", desc: "I canali d'acqua storici, i negozi di artigianato vintage e i pontili di Camden Lock.", icon: "⛵", locationName: "Camden Market & Lock", coords: [51.5414, -0.1465] },
            { id: "act-51-4-2", time: "12:30", title: "Shopping Natalizio a Liberty London & Oxford Street", desc: "Il palazzo a graticcio Tudor per decorazioni uniche e la via dello shopping londinese.", icon: "🎁", locationName: "Liberty London & Oxford Street", coords: [51.5137, -0.1402] },
            { id: "act-51-4-3", time: "17:00", title: "Ritorno in Aeroporto a Londra Luton (LTN)", desc: "Arrivo con Thameslink, controlli di sicurezza e gate per il volo di rientro serale W4 6304.", icon: "🛫", locationName: "London Luton Airport Gates", coords: [51.8747, -0.3683] }
          ]
        }
      ]
    },

    // VIAGGIO 52: SHANGHAI & ZURIGO (22/07/2027 - 16/08/2027)
    "trip-real-52": {
      "destination": "Cina (Shanghai, Shenzhen, Yangshuo, Zhangjiajie, Chongqing, Chengdu, Xi'an, Pechino) con Hong Kong & Macao",
      "theme": "Grand Tour della Cina: Megacittà, Montagne di Avatar, Treni Proiettile Fuxing & Maglev",
      "flightInfo": "Swiss International Air Lines A350-900 / A320neo (LX188/LX189 / LX1613/LX1622), China Railway AV (350 km/h), Maglev (430 km/h)",
      "days": [
            {
                  "dayNumber": 1,
                  "date": "Giovedì 22 Luglio 2027",
                  "title": "Partenza da Milano Malpensa via Zurigo verso Shanghai",
                  "summary": "Partenza alle ore 10:45 da Milano Malpensa con volo Swiss LX1613 verso Zurigo (1h10m, 205 km) e coincidenza LX188 su Airbus A350-900 verso Shanghai Pudong (11h35m, 9027 km). Costo A/R: 1.350,00 €.",
                  "schedule": [
                        {
                              "id": "act-52-1-1",
                              "time": "08:30",
                              "title": "Milano Malpensa Terminal 1: Check-in & Bagagli",
                              "desc": "Check-in ai banchi Swiss International Air Lines (franchigia bagaglio da stiva + bagaglio a mano + accessorio personale, PNR: LX1613). Costo volo A/R: 1.350,00 €.",
                              "icon": "🛫",
                              "locationName": "Milano Malpensa Terminal 1",
                              "coords": [
                                    45.6306,
                                    8.7281
                              ],
                              "flag": "🇮🇹",
                              "transport": {
                                    "type": "flight",
                                    "icon": "✈️",
                                    "label": "Volo Swiss LX1613"
                              }
                        },
                        {
                              "id": "act-52-1-2",
                              "time": "10:45",
                              "title": "Volo Swiss LX1613 MXP ➔ ZRH",
                              "desc": "Volo di 1 ora e 10 minuti da Milano Malpensa all'Aeroporto di Zurigo Kloten (ZRH).",
                              "icon": "✈️",
                              "locationName": "In volo verso Zurigo",
                              "coords": [
                                    46.5,
                                    8.6
                              ],
                              "flag": "🇨🇭",
                              "transport": {
                                    "type": "flight",
                                    "icon": "✈️",
                                    "label": "Volo Swiss LX1613 (205 km)"
                              }
                        },
                        {
                              "id": "act-52-1-3",
                              "time": "13:15",
                              "title": "Decollo Volo Intercontinentale Swiss LX188 ZRH ➔ PVG",
                              "desc": "Volo transcontinentale di 11 ore e 35 minuti a bordo dell'Airbus A350-900 verso la Cina. Pasti a bordo e notte in volo.",
                              "icon": "✈️",
                              "locationName": "Aeroporto di Zurigo Kloten (ZRH)",
                              "coords": [
                                    47.4582,
                                    8.5555
                              ],
                              "flag": "🇨🇳",
                              "transport": {
                                    "type": "flight",
                                    "icon": "✈️",
                                    "label": "Volo Swiss A350-900 (9.027 km)"
                              }
                        }
                  ]
            },
            {
                  "dayNumber": 2,
                  "date": "Venerdì 23 Luglio 2027",
                  "title": "Arrivo a Shanghai, Passeggiata sul Bund & Treno Notturno per Shenzhen",
                  "summary": "Atterraggio alle 06:50 a Shanghai Pudong, prima passeggiata sul lungofiume The Bund ammirando i grattacieli di Pudong. In serata partenza con Treno Notturno Soft Sleeper verso Shenzhen.",
                  "schedule": [
                        {
                              "id": "act-52-2-1",
                              "time": "06:50",
                              "title": "Atterraggio a Shanghai Pudong (PVG) & Formalità Doganali",
                              "desc": "Arrivo in Cina, controllo passaporti con esenzione visto turistico e ritiro bagagli.",
                              "icon": "🛬",
                              "locationName": "Shanghai Pudong International Airport (PVG)",
                              "coords": [
                                    31.1443,
                                    121.8083
                              ],
                              "flag": "🇨🇳",
                              "transport": {
                                    "type": "metro",
                                    "icon": "🚇",
                                    "label": "Metro Linea 2 verso il centro"
                              }
                        },
                        {
                              "id": "act-52-2-2",
                              "time": "11:00",
                              "title": "Passeggiata sul Bund & Skyline di Pudong",
                              "desc": "Scorcio iconico sugli edifici storici in stile coloniale neoclassico da un lato e i vertiginosi grattacieli di Pudong (Shanghai Tower, Jin Mao, World Financial Center) dall'altro.",
                              "icon": "🏙️",
                              "locationName": "The Bund (Waitan), Shanghai",
                              "coords": [
                                    31.2402,
                                    121.4905
                              ],
                              "flag": "🇨🇳",
                              "transport": {
                                    "type": "walk",
                                    "icon": "🚶",
                                    "label": "A piedi sul lungofiume"
                              }
                        },
                        {
                              "id": "act-52-2-3",
                              "time": "20:00",
                              "title": "Treno Notturno China Railway Shanghai ➔ Shenzhen",
                              "desc": "Partenza in treno notturno con sistemazione in cuccetta morbida di 1ª classe 'Soft Sleeper' (costo: 140,00 €, durata: 13h30m, 1600 km, prenotato su Trip.com). Notte in treno.",
                              "icon": "🚆",
                              "locationName": "Stazione Ferroviaria di Shanghai",
                              "coords": [
                                    31.2494,
                                    121.4557
                              ],
                              "flag": "🇨🇳",
                              "transport": {
                                    "type": "train_sleeper",
                                    "icon": "🚆",
                                    "label": "Treno Notturno Soft Sleeper (1.600 km)"
                              }
                        }
                  ]
            },
            {
                  "dayNumber": 3,
                  "date": "Sabato 24 Luglio 2027",
                  "title": "Arrivo a Shenzhen, Check-in & Mercato Elettronica Huaqiangbei",
                  "summary": "Arrivo in treno notturno a Shenzhen alle 09:30, check-in al Grand Skylight Hotel Shenzhen (PIN: 4801, 2 notti, 120,00 €) e visita al mega distretto dell'elettronica di Huaqiangbei.",
                  "schedule": [
                        {
                              "id": "act-52-3-1",
                              "time": "09:30",
                              "title": "Arrivo alla Stazione di Shenzhen",
                              "desc": "Arrivo nella Silicon Valley d'Asia tra grattacieli modernissimi e architetture avveniristiche.",
                              "icon": "🛬",
                              "locationName": "Shenzhen Railway Station",
                              "coords": [
                                    22.5317,
                                    114.1189
                              ],
                              "flag": "🇨🇳",
                              "transport": {
                                    "type": "metro",
                                    "icon": "🚇",
                                    "label": "Metropolitana di Shenzhen"
                              }
                        },
                        {
                              "id": "act-52-3-2",
                              "time": "14:00",
                              "title": "Check-in Grand Skylight Hotel Shenzhen (PIN: 4801)",
                              "desc": "Sistemazione per 2 notti al Grand Skylight Hotel (Shennan Rd, PNR: 4427741, costo totale: 120,00 €, PIN: 4801).",
                              "icon": "🏨",
                              "locationName": "Grand Skylight Hotel Shenzhen",
                              "coords": [
                                    22.5431,
                                    114.0579
                              ],
                              "flag": "🇨🇳",
                              "transport": {
                                    "type": "walk",
                                    "icon": "🚶",
                                    "label": "Arrivo in hotel"
                              }
                        },
                        {
                              "id": "act-52-3-3",
                              "time": "16:00",
                              "title": "Mercato dell'Elettronica di Huaqiangbei & Grattacielo Ping An",
                              "desc": "Visita all'incredibile mecca mondiale dei componenti elettronici, gadget futuristici e robotica, con vista sul Ping An Finance Centre (599 m).",
                              "icon": "📱",
                              "locationName": "Huaqiangbei Electronic Market",
                              "coords": [
                                    22.5482,
                                    114.086
                              ],
                              "flag": "🇨🇳",
                              "transport": {
                                    "type": "walk",
                                    "icon": "🚶",
                                    "label": "Tour a piedi a Huaqiangbei"
                              }
                        }
                  ]
            },
            {
                  "dayNumber": 4,
                  "date": "Domenica 25 Luglio 2027",
                  "title": "Escursione a Hong Kong in Treno AV & Victoria Peak",
                  "summary": "Treno AV Shenzhen ➔ Hong Kong (11:00-11:15, 15,00 €). Salita al leggendario Victoria Peak con lo storico Peak Tram (25,00 €), distretto di Central e rientro serale a Shenzhen (15,00 €).",
                  "schedule": [
                        {
                              "id": "act-52-4-1",
                              "time": "11:00",
                              "title": "Treno AV China Railway Shenzhen ➔ Hong Kong",
                              "desc": "Treno ad alta velocità che attraversa il confine in soli 15 minuti arrivando a Hong Kong West Kowloon (costo: 15,00 €, 38 km, 2ª classe).",
                              "icon": "🚄",
                              "locationName": "West Kowloon High Speed Rail Station HK",
                              "coords": [
                                    22.3045,
                                    114.1668
                              ],
                              "flag": "🇭🇰",
                              "transport": {
                                    "type": "train_bullet",
                                    "icon": "🚄",
                                    "label": "Treno AV China Railway (15 min)"
                              }
                        },
                        {
                              "id": "act-52-4-2",
                              "time": "14:00",
                              "title": "Victoria Peak con lo Storico Peak Tram",
                              "desc": "Salita con la storica funicolare Peak Tram (costo: 25,00 €) fino al punto più alto dell'isola per una vista spettacolare sui grattacieli e su Victoria Harbour.",
                              "icon": "🚡",
                              "locationName": "Victoria Peak & Sky Terrace 428",
                              "coords": [
                                    22.2713,
                                    114.1499
                              ],
                              "flag": "🇭🇰",
                              "transport": {
                                    "type": "cablecar",
                                    "icon": "🚠",
                                    "label": "Peak Tram Funicolare"
                              }
                        },
                        {
                              "id": "act-52-4-3",
                              "time": "17:30",
                              "title": "Passeggiata tra i Grattacieli di Central",
                              "desc": "Esplorazione del distretto finanziario di Central, scala mobile coperta Mid-Levels e quartiere SoHo.",
                              "icon": "🏙️",
                              "locationName": "Central District Hong Kong",
                              "coords": [
                                    22.2819,
                                    114.1582
                              ],
                              "flag": "🇭🇰",
                              "transport": {
                                    "type": "walk",
                                    "icon": "🚶",
                                    "label": "Passeggiata a Central"
                              }
                        },
                        {
                              "id": "act-52-4-4",
                              "time": "20:45",
                              "title": "Treno AV di Rientro Hong Kong ➔ Shenzhen",
                              "desc": "Treno proiettile di rientro a Shenzhen (20:45-21:00, costo: 15,00 €, 38 km). Notte al Grand Skylight Hotel.",
                              "icon": "🚄",
                              "locationName": "Shenzhen Futian / North Station",
                              "coords": [
                                    22.5431,
                                    114.0579
                              ],
                              "flag": "🇨🇳",
                              "transport": {
                                    "type": "train_bullet",
                                    "icon": "🚄",
                                    "label": "Treno AV China Railway (15 min)"
                              }
                        }
                  ]
            },
            {
                  "dayNumber": 5,
                  "date": "Lunedì 26 Luglio 2027",
                  "title": "Hong Kong: Star Ferry, Tsim Sha Tsui & Mercati di Mong Kok",
                  "summary": "Seconda giornata a Hong Kong: treno AV mattutino (09:00-09:15, 15,00 €), traversata con lo storico battello Star Ferry, Avenue of Stars e street market di Mong Kok. Rientro serale a Shenzhen (15,00 €).",
                  "schedule": [
                        {
                              "id": "act-52-5-1",
                              "time": "09:00",
                              "title": "Treno AV Shenzhen ➔ Hong Kong West Kowloon",
                              "desc": "Treno rapido transfrontaliero verso Hong Kong (costo: 15,00 €, 38 km).",
                              "icon": "🚄",
                              "locationName": "Hong Kong West Kowloon",
                              "coords": [
                                    22.3045,
                                    114.1668
                              ],
                              "flag": "🇭🇰",
                              "transport": {
                                    "type": "train_bullet",
                                    "icon": "🚄",
                                    "label": "Treno AV China Railway"
                              }
                        },
                        {
                              "id": "act-52-5-2",
                              "time": "11:30",
                              "title": "Traversata Panoramica con lo Storico Star Ferry",
                              "desc": "Navigazione romantica e suggestiva sul canale di Victoria Harbour a bordo dello storico battello verde e bianco attivo dal 1888.",
                              "icon": "⛴️",
                              "locationName": "Star Ferry Pier Tsim Sha Tsui",
                              "coords": [
                                    22.2936,
                                    114.1685
                              ],
                              "flag": "🇭🇰",
                              "transport": {
                                    "type": "ferry",
                                    "icon": "⛴️",
                                    "label": "Star Ferry Battello Storico"
                              }
                        },
                        {
                              "id": "act-52-5-3",
                              "time": "14:30",
                              "title": "Avenue of Stars & Vista Panoramica di Kowloon",
                              "desc": "Passeggiata sul lungomare di Tsim Sha Tsui con la statua di Bruce Lee e le impronte delle star del cinema di Hong Kong.",
                              "icon": "⭐",
                              "locationName": "Avenue of Stars, Tsim Sha Tsui",
                              "coords": [
                                    22.2931,
                                    114.1738
                              ],
                              "flag": "🇭🇰",
                              "transport": {
                                    "type": "walk",
                                    "icon": "🚶",
                                    "label": "Passeggiata a piedi"
                              }
                        },
                        {
                              "id": "act-52-5-4",
                              "time": "17:30",
                              "title": "I Mercati di Mong Kok: Ladies Market & Sneaker Street",
                              "desc": "Tuffo nella vivace atmosfera di Kowloon tra banchi di street food, lanterne rosse e negozi caratteristici.",
                              "icon": "🏮",
                              "locationName": "Ladies' Market, Mong Kok",
                              "coords": [
                                    22.3193,
                                    114.1694
                              ],
                              "flag": "🇭🇰",
                              "transport": {
                                    "type": "metro",
                                    "icon": "🚇",
                                    "label": "MTR Metropolitana di HK"
                              }
                        },
                        {
                              "id": "act-52-5-5",
                              "time": "20:45",
                              "title": "Treno AV di Rientro a Shenzhen",
                              "desc": "Rientro a Shenzhen in treno AV (20:45-21:00, 15,00 €).",
                              "icon": "🚄",
                              "locationName": "Grand Skylight Hotel Shenzhen",
                              "coords": [
                                    22.5431,
                                    114.0579
                              ],
                              "flag": "🇨🇳",
                              "transport": {
                                    "type": "train_bullet",
                                    "icon": "🚄",
                                    "label": "Treno AV China Railway"
                              }
                        }
                  ]
            },
            {
                  "dayNumber": 6,
                  "date": "Martedì 27 Luglio 2027",
                  "title": "Escursione a Macao in Traghetto TurboJET: Rovine di San Paolo & Cotai Strip",
                  "summary": "Traghetto veloce TurboJET da Shenzhen Shekou a Macao Taipa (08:30-09:30, 25,00 €, 60 km). Visita al centro storico portoghese (Rovine di San Paolo) e ai mega resort della Cotai Strip. Traghetto di rientro alle 19:30 (25,00 €).",
                  "schedule": [
                        {
                              "id": "act-52-6-1",
                              "time": "08:30",
                              "title": "Traghetto Veloce TurboJET Shenzhen Shekou ➔ Macao",
                              "desc": "Navigazione sull'aliscafo veloce che attraversa il delta del Fiume delle Perle (costo: 25,00 €, durata: 1h00m, 60 km).",
                              "icon": "⛴️",
                              "locationName": "Macau Taipa Ferry Terminal",
                              "coords": [
                                    22.1643,
                                    113.5786
                              ],
                              "flag": "🇲🇴",
                              "transport": {
                                    "type": "ferry",
                                    "icon": "⛴️",
                                    "label": "Aliscafo TurboJET (60 km)"
                              }
                        },
                        {
                              "id": "act-52-6-2",
                              "time": "11:00",
                              "title": "Rovine della Cattedrale di San Paolo & Centro Portoghese",
                              "desc": "La celebre facciata in pietra scolpita del 1602 dai gesuiti, la Fortezza del Monte e la pavimentazione a onde di Largo do Senado (Patrimonio UNESCO).",
                              "icon": "🏛️",
                              "locationName": "Ruins of St. Paul's, Macao",
                              "coords": [
                                    22.1977,
                                    113.5409
                              ],
                              "flag": "🇲🇴",
                              "transport": {
                                    "type": "walk",
                                    "icon": "🚶",
                                    "label": "Tour a piedi nel centro storico"
                              }
                        },
                        {
                              "id": "act-52-6-3",
                              "time": "15:00",
                              "title": "Cotai Strip & The Venetian Macao",
                              "desc": "La sfavillante Strip asiatica con i canali veneziani ricostruiti al coperto con gondole, la Torre Eiffel in scala e spettacoli di luci.",
                              "icon": "🎰",
                              "locationName": "Cotai Strip & The Venetian Macao",
                              "coords": [
                                    22.1481,
                                    113.562
                              ],
                              "flag": "🇲🇴",
                              "transport": {
                                    "type": "metro",
                                    "icon": "🚇",
                                    "label": "Macau LRT / Navetta"
                              }
                        },
                        {
                              "id": "act-52-6-4",
                              "time": "19:30",
                              "title": "Traghetto TurboJET di Rientro Macao ➔ Shenzhen Shekou",
                              "desc": "Navigazione notturna di rientro (19:30-20:30, costo: 25,00 €, 60 km). Notte a Shenzhen.",
                              "icon": "⛴️",
                              "locationName": "Shenzhen Shekou Cruise Homeport",
                              "coords": [
                                    22.4795,
                                    113.9142
                              ],
                              "flag": "🇨🇳",
                              "transport": {
                                    "type": "ferry",
                                    "icon": "⛴️",
                                    "label": "Aliscafo TurboJET (60 km)"
                              }
                        }
                  ]
            },
            {
                  "dayNumber": 7,
                  "date": "Mercoledì 28 Luglio 2027",
                  "title": "Treno AV per Yangshuo, Check-in Mountain Retreat & Tour in Bici",
                  "summary": "Treno AV China Railway da Shenzhen North a Guilin/Yangshuo (09:30-12:30, 3h00m, 550 km, 45,00 €). Check-in allo Yangshuo Mountain Retreat (PIN: 3345, 2 notti, 208,00 €) e noleggio biciclette verso la Collina della Luna (Moon Hill).",
                  "schedule": [
                        {
                              "id": "act-52-7-1",
                              "time": "09:30",
                              "title": "Treno AV China Railway Shenzhen North ➔ Yangshuo",
                              "desc": "Viaggio in treno ad alta velocità di 3 ore attraverso la campagna del Guangxi (costo: 45,00 €, 550 km, 2ª classe).",
                              "icon": "🚄",
                              "locationName": "Yangshuo High Speed Railway Station",
                              "coords": [
                                    24.8967,
                                    110.6698
                              ],
                              "flag": "🇨🇳",
                              "transport": {
                                    "type": "train_bullet",
                                    "icon": "🚄",
                                    "label": "Treno AV China Railway (550 km)"
                              }
                        },
                        {
                              "id": "act-52-7-2",
                              "time": "14:00",
                              "title": "Check-in Yangshuo Mountain Retreat / Mo Mountain Inn (PIN: 3345)",
                              "desc": "Sistemazione per 2 notti affacciati sul fiume Yulong tra maestosi pinnacoli carsici (costo totale: 208,00 €, PNR: 4784144, PIN: 3345).",
                              "icon": "🏞️",
                              "locationName": "Yangshuo Mountain Retreat (Fiume Yulong)",
                              "coords": [
                                    24.7766,
                                    110.458
                              ],
                              "flag": "🇨🇳",
                              "transport": {
                                    "type": "walk",
                                    "icon": "🚶",
                                    "label": "Arrivo al lodge"
                              }
                        },
                        {
                              "id": "act-52-7-3",
                              "time": "15:30",
                              "title": "Noleggio Bici ed E-Bike tra le Risaie & Moon Hill",
                              "desc": "Pedalata tra sentieri di campagna, bufali d'acqua, canne di bambù e scalata fino all'arco naturale roccioso della Collina della Luna.",
                              "icon": "🚲",
                              "locationName": "Moon Hill (Collina della Luna) Yangshuo",
                              "coords": [
                                    24.7335,
                                    110.4673
                              ],
                              "flag": "🇨🇳",
                              "transport": {
                                    "type": "bike",
                                    "icon": "🚲",
                                    "label": "Bicicletta ed e-bike tra le risaie"
                              }
                        }
                  ]
            },
            {
                  "dayNumber": 8,
                  "date": "Giovedì 29 Luglio 2027",
                  "title": "Crociera sul Fiume Li, Zattere di Bambù & Spettacolo sull'Acqua",
                  "summary": "Navigazione da favola sul Fiume Li su zattere di bambù tra i monti carsici della banconota da 20 Yuan (costo: 120,00 €), borgo storico di Xingping e spettacolo serale Impression Sanjie Liu.",
                  "schedule": [
                        {
                              "id": "act-52-8-1",
                              "time": "09:30",
                              "title": "Crociera su Zattera Tradizionale di Bambù sul Fiume Li",
                              "desc": "Navigazione silenziosa e suggestiva tra i picchi calcarei avvolti dalla nebbia nel tratto più spettacolare tra Yangdi e Xingping.",
                              "icon": "🛶",
                              "locationName": "Fiume Li (Tratto Yangdi - Xingping)",
                              "coords": [
                                    24.9189,
                                    110.5367
                              ],
                              "flag": "🇨🇳",
                              "transport": {
                                    "type": "ferry",
                                    "icon": "⛴️",
                                    "label": "Zattera di bambù sul Fiume Li"
                              }
                        },
                        {
                              "id": "act-52-8-2",
                              "time": "13:00",
                              "title": "Il Punto Panoramico della Banconota da 20 Yuan",
                              "desc": "Visita allo scorcio panoramico esatto di Xingping immortalato sulla celebre banconota da 20 Renminbi.",
                              "icon": "💴",
                              "locationName": "Xingping Ancient Town 20 Yuan Point",
                              "coords": [
                                    24.9255,
                                    110.528
                              ],
                              "flag": "🇨🇳",
                              "transport": {
                                    "type": "walk",
                                    "icon": "🚶",
                                    "label": "Passeggiata a Xingping"
                              }
                        },
                        {
                              "id": "act-52-8-3",
                              "time": "19:30",
                              "title": "Spettacolo Teatrale sull'Acqua 'Impression Sanjie Liu'",
                              "desc": "Straordinario show di luci e canti diretto da Zhang Yimou con oltre 600 attori che recitano direttamente sulla superficie dell'acqua con le colline carsiche illuminate sullo sfondo.",
                              "icon": "🎭",
                              "locationName": "Impression Sanjie Liu Natural Theater",
                              "coords": [
                                    24.7672,
                                    110.505
                              ],
                              "flag": "🇨🇳",
                              "transport": {
                                    "type": "walk",
                                    "icon": "🚶",
                                    "label": "Rientro al lodge"
                              }
                        }
                  ]
            },
            {
                  "dayNumber": 9,
                  "date": "Venerdì 30 Luglio 2027",
                  "title": "Treno AV Guilin ➔ Zhangjiajie & Check-in Atour Hotel Wulingyuan",
                  "summary": "Trasferimento in treno ad alta velocità attraverso lo Hunan da Guilin a Zhangjiajie (09:00-14:00, 5h00m, 700 km, 145,00 €). Check-in Atour Hotel Wulingyuan (PIN: 8396, 3 notti, 95,00 €).",
                  "schedule": [
                        {
                              "id": "act-52-9-1",
                              "time": "09:00",
                              "title": "Treno AV China Railway Guilin ➔ Zhangjiajie West",
                              "desc": "Viaggio attraverso paesaggi montuosi spettacolari verso il Parco di Avatar (costo: 145,00 €, durata: 5h00m, 700 km).",
                              "icon": "🚄",
                              "locationName": "Zhangjiajie West Railway Station",
                              "coords": [
                                    29.1388,
                                    110.432
                              ],
                              "flag": "🇨🇳",
                              "transport": {
                                    "type": "train_bullet",
                                    "icon": "🚄",
                                    "label": "Treno AV China Railway (700 km)"
                              }
                        },
                        {
                              "id": "act-52-9-2",
                              "time": "14:00",
                              "title": "Check-in Atour Hotel Zhangjiajie / Wulingyuan (PIN: 8396)",
                              "desc": "Sistemazione per 3 notti a ridosso dell'ingresso del Parco Nazionale (costo totale: 95,00 €, PNR: 4899981, PIN: 8396).",
                              "icon": "🏨",
                              "locationName": "Atour Hotel Wulingyuan",
                              "coords": [
                                    29.3458,
                                    110.5478
                              ],
                              "flag": "🇨🇳",
                              "transport": {
                                    "type": "walk",
                                    "icon": "🚶",
                                    "label": "Arrivo in hotel"
                              }
                        },
                        {
                              "id": "act-52-9-3",
                              "time": "16:30",
                              "title": "Passeggiata Orientativa a Wulingyuan",
                              "desc": "Primo sguardo alle pareti di quarzo e arenaria che si innalzano verticali verso le nuvole e cena tipica dello Hunan.",
                              "icon": "🌄",
                              "locationName": "Wulingyuan Town Scenic Area",
                              "coords": [
                                    29.348,
                                    110.542
                              ],
                              "flag": "🇨🇳",
                              "transport": {
                                    "type": "walk",
                                    "icon": "🚶",
                                    "label": "A piedi a Wulingyuan"
                              }
                        }
                  ]
            },
            {
                  "dayNumber": 10,
                  "date": "Sabato 31 Luglio 2027",
                  "title": "Montagne Hallelujah di Avatar & Ascensore di Cristallo Bailong",
                  "summary": "Intera giornata nel Parco Nazionale Forestale di Zhangjiajie (costo: 90,00 €): salita con l'ascensore a vetri Bailong (326 m) e trekking a Yuanjiajie tra le colonne sospese che hanno ispirato il film Avatar.",
                  "schedule": [
                        {
                              "id": "act-52-10-1",
                              "time": "08:30",
                              "title": "Ascensore Bailong: 326 Metri di Cristallo sulla Roccia",
                              "desc": "Salita vertiginosa in soli 88 secondi all'interno dell'ascensore panoramico all'aperto più alto del mondo incastonato nella scogliera.",
                              "icon": "🛗",
                              "locationName": "Bailong Elevator (Ascensore dei Cento Draghi)",
                              "coords": [
                                    29.3528,
                                    110.4578
                              ],
                              "flag": "🇨🇳",
                              "transport": {
                                    "type": "cablecar",
                                    "icon": "🚠",
                                    "label": "Ascensore Panoramico Bailong"
                              }
                        },
                        {
                              "id": "act-52-10-2",
                              "time": "10:30",
                              "title": "Yuanjiajie & La Montagna Hallelujah di Avatar",
                              "desc": "La colonna di pietra 'Pilastro del Cielo del Sud' (alta 1.080 m), ribattezzata Avatar Hallelujah Mountain, sospesa sopra un oceano di nebbia.",
                              "icon": "🪐",
                              "locationName": "Avatar Hallelujah Mountain (Yuanjiajie)",
                              "coords": [
                                    29.3508,
                                    110.4352
                              ],
                              "flag": "🇨🇳",
                              "transport": {
                                    "type": "walk",
                                    "icon": "🚶",
                                    "label": "Trekking sui ponti sospesi di roccia"
                              }
                        },
                        {
                              "id": "act-52-10-3",
                              "time": "14:30",
                              "title": "Ponte Sospeso di Vetro sul Gran Canyon di Zhangjiajie",
                              "desc": "Passeggiata adrenalinica sul ponte di cristallo lungo 430 metri sospeso a 300 metri d'altezza sopra il canyon verdeggiante.",
                              "icon": "🌉",
                              "locationName": "Zhangjiajie Glass Bridge Grand Canyon",
                              "coords": [
                                    29.4005,
                                    110.7012
                              ],
                              "flag": "🇨🇳",
                              "transport": {
                                    "type": "walk",
                                    "icon": "🚶",
                                    "label": "Passerella di cristallo trasparente"
                              }
                        }
                  ]
            },
            {
                  "dayNumber": 11,
                  "date": "Domenica 1 Agosto 2027",
                  "title": "Montagna Tianmen: Funivia Record, Passerella di Vetro & 999 Gradini",
                  "summary": "Escursione alla leggendaria Montagna Tianmen (costo: 100,00 €): funivia di 7.5 km, la passerella di vetro trasparente Cliff Walk a picco sul vuoto e la scalinata dei 999 gradini della Porta del Paradiso.",
                  "schedule": [
                        {
                              "id": "act-52-11-1",
                              "time": "09:00",
                              "title": "Funivia della Montagna Tianmen (7.455 Metri)",
                              "desc": "La funivia passeggeri ad alta quota più lunga del mondo che sale direttamente dal centro città fino a 1.400 metri di quota.",
                              "icon": "🚡",
                              "locationName": "Tianmen Mountain Cableway Base",
                              "coords": [
                                    29.1235,
                                    110.485
                              ],
                              "flag": "🇨🇳",
                              "transport": {
                                    "type": "cablecar",
                                    "icon": "🚠",
                                    "label": "Funivia Panoramica Tianmen (7,5 km)"
                              }
                        },
                        {
                              "id": "act-52-11-2",
                              "time": "11:30",
                              "title": "Skywalk: La Passerella di Vetro a Picco sul Baratro",
                              "desc": "Camminata mozzafiato con calzari speciali sul pavimento di vetro spesso 6 cm affacciato su 1.000 metri di precipizio verticale.",
                              "icon": "🧗",
                              "locationName": "Tianmen Mountain Glass Skywalk",
                              "coords": [
                                    29.0514,
                                    110.4782
                              ],
                              "flag": "🇨🇳",
                              "transport": {
                                    "type": "walk",
                                    "icon": "🚶",
                                    "label": "Passerella a strapiombo"
                              }
                        },
                        {
                              "id": "act-52-11-3",
                              "time": "15:00",
                              "title": "Porta del Paradiso & La Scalinata dei 999 Gradini",
                              "desc": "L'immenso arco naturale di roccia (alto 131 metri) scavato nel monte e la vertiginosa 'Scala verso il Paradiso' composta da 999 gradini.",
                              "icon": "⛩️",
                              "locationName": "Tianmen Cave (Heaven's Gate)",
                              "coords": [
                                    29.0538,
                                    110.482
                              ],
                              "flag": "🇨🇳",
                              "transport": {
                                    "type": "walk",
                                    "icon": "🚶",
                                    "label": "Discesa dei 999 gradini"
                              }
                        }
                  ]
            },
            {
                  "dayNumber": 12,
                  "date": "Lunedì 2 Agosto 2027",
                  "title": "Treno AV per Chongqing & Spettacolo Serale a Hongyadong",
                  "summary": "Treno AV da Zhangjiajie a Chongqing North (09:00-13:00, 4h00m, 600 km, 65,00 €). Check-in Chongqing Glenview IT / Marriott (PIN: 7920, 2 notti, 260,11 €). Serata tra le terrazze a pagoda di Hongyadong e hotpot piccante.",
                  "schedule": [
                        {
                              "id": "act-52-12-1",
                              "time": "09:00",
                              "title": "Treno AV China Railway Zhangjiajie ➔ Chongqing North",
                              "desc": "Treno veloce di 4 ore verso la megalopoli cyberpunk di Chongqing sul Fiume Azzurro (costo: 65,00 €, 600 km, 2ª classe).",
                              "icon": "🚄",
                              "locationName": "Chongqing North Railway Station",
                              "coords": [
                                    29.6105,
                                    106.5512
                              ],
                              "flag": "🇨🇳",
                              "transport": {
                                    "type": "train_bullet",
                                    "icon": "🚄",
                                    "label": "Treno AV China Railway (600 km)"
                              }
                        },
                        {
                              "id": "act-52-12-2",
                              "time": "15:00",
                              "title": "Check-in Chongqing Glenview IT / Marriott Hotel (PIN: 7920)",
                              "desc": "Sistemazione per 2 notti nella penisola centrale di Yuzhong (costo totale: 260,11 €, PNR: 4784407, PIN: 7920).",
                              "icon": "🏨",
                              "locationName": "Glenview IT Hotel Chongqing (Jiefangbei)",
                              "coords": [
                                    29.5583,
                                    106.5772
                              ],
                              "flag": "🇨🇳",
                              "transport": {
                                    "type": "walk",
                                    "icon": "🚶",
                                    "label": "Arrivo in hotel"
                              }
                        },
                        {
                              "id": "act-52-12-3",
                              "time": "19:30",
                              "title": "Hongyadong Illuminata & Hotpot Tradizionale del Sichuan",
                              "desc": "L'incredibile complesso di 11 piani su palafitta aggrappato alla scogliera sul fiume Jialing, illuminato da miriadi di luci dorate (identico al palazzo di Spirited Away). Cena con hotpot super piccante.",
                              "icon": "🏮",
                              "locationName": "Hongyadong Scenic Area, Chongqing",
                              "coords": [
                                    29.5639,
                                    106.5794
                              ],
                              "flag": "🇨🇳",
                              "transport": {
                                    "type": "walk",
                                    "icon": "🚶",
                                    "label": "A piedi a Hongyadong"
                              }
                        }
                  ]
            },
            {
                  "dayNumber": 13,
                  "date": "Martedì 3 Agosto 2027",
                  "title": "Chongqing Cyberpunk: Monorotaia Liziba & Funivia Fiume Yangtze",
                  "summary": "Esplorazione della città verticale 3D: la stazione della monorotaia Liziba che passa dentro a un palazzo residenziale di 19 piani, la funivia sul fiume Yangtze e i ponti multilivello.",
                  "schedule": [
                        {
                              "id": "act-52-13-1",
                              "time": "10:00",
                              "title": "Stazione Liziba: Il Treno che Attraversa il Palazzo",
                              "desc": "La famosa fermata della Linea 2 di Chongqing dove la monorotaia passa esattamente tra il 6° e l'8° piano di un condominio abitato senza produrre vibrazioni.",
                              "icon": "🚝",
                              "locationName": "Liziba Monorail Station",
                              "coords": [
                                    29.5534,
                                    106.536
                              ],
                              "flag": "🇨🇳",
                              "transport": {
                                    "type": "metro",
                                    "icon": "🚇",
                                    "label": "Monorotaia Linea 2 di Chongqing"
                              }
                        },
                        {
                              "id": "act-52-13-2",
                              "time": "14:30",
                              "title": "Funivia Storica sul Fiume Yangtze (Yangtze River Cableway)",
                              "desc": "Traversata aerea sul gigantesco fiume Yangtze con vista mozzafiato sui grattacieli e sulle navi da crociera fluviali.",
                              "icon": "🚠",
                              "locationName": "Yangtze River Cableway Station",
                              "coords": [
                                    29.558,
                                    106.586
                              ],
                              "flag": "🇨🇳",
                              "transport": {
                                    "type": "cablecar",
                                    "icon": "🚠",
                                    "label": "Funivia del Fiume Yangtze"
                              }
                        },
                        {
                              "id": "act-52-13-3",
                              "time": "18:00",
                              "title": "Jiefangbei & Skyline di Raffles City",
                              "desc": "Passeggiata serale attorno alla torre dell'orologio di Jiefangbei e al futuristico complesso Raffles City a forma di vele sul fiume.",
                              "icon": "🏙️",
                              "locationName": "Raffles City Chongqing & Jiefangbei",
                              "coords": [
                                    29.5658,
                                    106.5865
                              ],
                              "flag": "🇨🇳",
                              "transport": {
                                    "type": "walk",
                                    "icon": "🚶",
                                    "label": "Passeggiata urbana"
                              }
                        }
                  ]
            },
            {
                  "dayNumber": 14,
                  "date": "Mercoledì 4 Agosto 2027",
                  "title": "Treno AV per Chengdu, Vicoli Kuanzhai & Jinli Street",
                  "summary": "Treno AV veloce Chongqing ➔ Chengdu East (09:00-10:30, 1h30m, 300 km, 50,00 €). Check-in SSAW Boutique Hotel Chunxi Rd (PIN: 4525, 3 notti, 292,20 €). Pomeriggio nei vicoli storici Kuanzhai Xiangzi e Jinli Street.",
                  "schedule": [
                        {
                              "id": "act-52-14-1",
                              "time": "09:00",
                              "title": "Treno AV China Railway Chongqing ➔ Chengdu East",
                              "desc": "Treno proiettile di solo 1h30m che collega le due metropoli del Sichuan (costo: 50,00 €, 300 km, 2ª classe).",
                              "icon": "🚄",
                              "locationName": "Chengdu East Railway Station",
                              "coords": [
                                    30.6288,
                                    104.1415
                              ],
                              "flag": "🇨🇳",
                              "transport": {
                                    "type": "train_bullet",
                                    "icon": "🚄",
                                    "label": "Treno AV China Railway (300 km)"
                              }
                        },
                        {
                              "id": "act-52-14-2",
                              "time": "14:00",
                              "title": "Check-in SSAW Boutique Hotel Chengdu Chunxi Rd (PIN: 4525)",
                              "desc": "Sistemazione per 3 notti vicino alla via pedonale dello shopping di Chunxi Road (costo totale: 292,20 €, PNR: 4945890, PIN: 4525).",
                              "icon": "🏨",
                              "locationName": "SSAW Boutique Hotel Chengdu (Chunxi Rd)",
                              "coords": [
                                    30.6586,
                                    104.0818
                              ],
                              "flag": "🇨🇳",
                              "transport": {
                                    "type": "walk",
                                    "icon": "🚶",
                                    "label": "Arrivo in hotel"
                              }
                        },
                        {
                              "id": "act-52-14-3",
                              "time": "16:00",
                              "title": "Vicoli Kuanzhai Xiangzi & Jinli Ancient Street",
                              "desc": "Vicoli storici della dinastia Qing con cortili tradizionali, botteghe artigiane, tè al gelsomino e teatrini d'opera con cambio veloce delle maschere (Bian Lian).",
                              "icon": "🏮",
                              "locationName": "Kuanzhai Alley & Jinli Street Chengdu",
                              "coords": [
                                    30.648,
                                    104.049
                              ],
                              "flag": "🇨🇳",
                              "transport": {
                                    "type": "walk",
                                    "icon": "🚶",
                                    "label": "Passeggiata tra i vicoli tradizionali"
                              }
                        }
                  ]
            },
            {
                  "dayNumber": 15,
                  "date": "Giovedì 5 Agosto 2027",
                  "title": "Base dei Panda Giganti di Chengdu & Cultura del Tè",
                  "summary": "Visita all'alba alla Base di Ricerca e Riproduzione del Panda Gigante di Chengdu (costo: 20,00 €) nel momento della colazione con canne di bambù. Pomeriggio rilassante nelle storiche case da tè del People's Park.",
                  "schedule": [
                        {
                              "id": "act-52-15-1",
                              "time": "08:00",
                              "title": "Base di Riproduzione del Panda Gigante di Chengdu",
                              "desc": "Visita mattutina per osservare i panda giganti e i panda rossi nel loro habitat naturale mentre masticano bambù fresco e giocano negli spazi aperti (costo: 20,00 €).",
                              "icon": "🐼",
                              "locationName": "Chengdu Giant Panda Breeding Research Base",
                              "coords": [
                                    30.7339,
                                    104.1444
                              ],
                              "flag": "🇨🇳",
                              "transport": {
                                    "type": "metro",
                                    "icon": "🚇",
                                    "label": "Navetta e Metro Panda Line"
                              }
                        },
                        {
                              "id": "act-52-15-2",
                              "time": "14:30",
                              "title": "People's Park & Storica Casa da Tè Heming",
                              "desc": "Relax tra i viali del parco pubblico più amato di Chengdu: tè verde servito in tazze gaiwan tradizionali, partite a mahjong e massaggiatori auricolari tradizionali.",
                              "icon": "🍵",
                              "locationName": "Heming Teahouse (People's Park) Chengdu",
                              "coords": [
                                    30.657,
                                    104.058
                              ],
                              "flag": "🇨🇳",
                              "transport": {
                                    "type": "walk",
                                    "icon": "🚶",
                                    "label": "Passeggiata nel parco"
                              }
                        }
                  ]
            },
            {
                  "dayNumber": 16,
                  "date": "Venerdì 6 Agosto 2027",
                  "title": "Escursione in Treno AV a Leshan: Il Buddha Gigante di Pietra (71 Metri)",
                  "summary": "Escursione in treno AV a Leshan (08:00-09:00, 17,00 €). Visita al colossale Buddha Gigante scolpito nella scogliera (costo: 35,00 €) e battello fluviale. Rientro serale in treno a Chengdu (16:00-17:00, 17,00 €).",
                  "schedule": [
                        {
                              "id": "act-52-16-1",
                              "time": "08:00",
                              "title": "Treno AV China Railway Chengdu ➔ Leshan",
                              "desc": "Treno veloce di 1 ora verso la città di Leshan (costo: 17,00 €, 130 km, 2ª classe).",
                              "icon": "🚄",
                              "locationName": "Leshan Railway Station",
                              "coords": [
                                    29.5695,
                                    103.712
                              ],
                              "flag": "🇨🇳",
                              "transport": {
                                    "type": "train_bullet",
                                    "icon": "🚄",
                                    "label": "Treno AV China Railway (130 km)"
                              }
                        },
                        {
                              "id": "act-52-16-2",
                              "time": "10:00",
                              "title": "Il Buddha Gigante di Leshan (Dafo)",
                              "desc": "La statua in pietra di Buddha più grande al mondo (71 metri d'altezza e spalle larghe 28 m), scolpita nell'VIII secolo direttamente nella parete rocciosa alla confluenza dei fiumi Dadu, Min e Qingyi.",
                              "icon": "🛕",
                              "locationName": "Leshan Giant Buddha Scenic Area",
                              "coords": [
                                    29.5539,
                                    103.7744
                              ],
                              "flag": "🇨🇳",
                              "transport": {
                                    "type": "ferry",
                                    "icon": "⛴️",
                                    "label": "Battello panoramico sui fiumi"
                              }
                        },
                        {
                              "id": "act-52-16-3",
                              "time": "16:00",
                              "title": "Treno AV di Rientro Leshan ➔ Chengdu East",
                              "desc": "Treno proiettile di ritorno a Chengdu (16:00-17:00, costo: 17,00 €, 130 km). Notte all'hotel SSAW Chunxi Rd.",
                              "icon": "🚄",
                              "locationName": "Chengdu East Railway Station",
                              "coords": [
                                    30.6288,
                                    104.1415
                              ],
                              "flag": "🇨🇳",
                              "transport": {
                                    "type": "train_bullet",
                                    "icon": "🚄",
                                    "label": "Treno AV China Railway (130 km)"
                              }
                        }
                  ]
            },
            {
                  "dayNumber": 17,
                  "date": "Sabato 7 Agosto 2027",
                  "title": "Treno AV per Xi'an, Check-in Mercure & Quartiere Musulmano",
                  "summary": "Treno AV attraverso le montagne Qinling da Chengdu a Xi'an North (09:00-12:30, 3h30m, 650 km, 85,00 €). Check-in Mercure Hotel Bell Tower (PIN: 2064, 2 notti, 91,23 €) e street food nel Quartiere Musulmano.",
                  "schedule": [
                        {
                              "id": "act-52-17-1",
                              "time": "09:00",
                              "title": "Treno AV China Railway Chengdu ➔ Xi'an North",
                              "desc": "Viaggio spettacolare sulla linea ad alta velocità Xi'an-Chengdu che buca le montagne Qinling (costo: 85,00 €, 650 km, 2ª classe).",
                              "icon": "🚄",
                              "locationName": "Xi'an North Railway Station",
                              "coords": [
                                    34.3758,
                                    108.9385
                              ],
                              "flag": "🇨🇳",
                              "transport": {
                                    "type": "train_bullet",
                                    "icon": "🚄",
                                    "label": "Treno AV China Railway (650 km)"
                              }
                        },
                        {
                              "id": "act-52-17-2",
                              "time": "14:00",
                              "title": "Check-in Mercure Hotel Xi'an Downtown / Bell Tower (PIN: 2064)",
                              "desc": "Sistemazione per 2 notti in posizione centrale vicino alla Torre della Campana (costo totale: 91,23 €, PNR: 4290389, PIN: 2064).",
                              "icon": "🏨",
                              "locationName": "Mercure Hotel Xi'an Bell Tower",
                              "coords": [
                                    34.2612,
                                    108.9423
                              ],
                              "flag": "🇨🇳",
                              "transport": {
                                    "type": "walk",
                                    "icon": "🚶",
                                    "label": "Arrivo in hotel"
                              }
                        },
                        {
                              "id": "act-52-17-3",
                              "time": "17:30",
                              "title": "Quartiere Musulmano (Muslim Quarter) & Torri Bell e Drum",
                              "desc": "Passeggiata sensoriale tra i banchi di spezie, spiedini di agnello alla griglia, panini roujiamo e la suggestiva Grande Moschea in legno in stile cinese.",
                              "icon": "🥙",
                              "locationName": "Muslim Quarter (Huimin Jie) Xi'an",
                              "coords": [
                                    34.2645,
                                    108.9378
                              ],
                              "flag": "🇨🇳",
                              "transport": {
                                    "type": "walk",
                                    "icon": "🚶",
                                    "label": "A piedi nel quartiere musulmano"
                              }
                        }
                  ]
            },
            {
                  "dayNumber": 18,
                  "date": "Domenica 8 Agosto 2027",
                  "title": "L'Esercito di Terracotta & Bicicletta sulle Mura Antiche di Xi'an",
                  "summary": "Mattinata al Mausoleo dell'Imperatore Qin per ammirare l'incredibile Esercito di Terracotta (costo: 45,00 €). Nel pomeriggio giro in bicicletta sulle monumentali mura fortificate di Xi'an.",
                  "schedule": [
                        {
                              "id": "act-52-18-1",
                              "time": "08:30",
                              "title": "Mausoleo dell'Imperatore Qin & Esercito di Terracotta",
                              "desc": "La più straordinaria scoperta archeologica del XX secolo: 3 fosse con oltre 8.000 soldati, arcieri e cavalli di terracotta a grandezza naturale, ciascuno con tratti del viso unici (costo: 45,00 €).",
                              "icon": "🏺",
                              "locationName": "Terracotta Warriors Museum (Lintong)",
                              "coords": [
                                    34.3841,
                                    109.2785
                              ],
                              "flag": "🇨🇳",
                              "transport": {
                                    "type": "metro",
                                    "icon": "🚇",
                                    "label": "Metro Linea 9 + Navetta turistica"
                              }
                        },
                        {
                              "id": "act-52-18-2",
                              "time": "16:00",
                              "title": "Giro in Bicicletta sulle Antiche Mura di Xi'an",
                              "desc": "Noleggio bici in cima ai bastioni medievali della dinastia Ming larghi 12-14 metri per percorrere l'intero anello di 14 km affacciati sui quartieri storici.",
                              "icon": "🚲",
                              "locationName": "Xi'an Ancient City Wall (Porta Sud Yongning)",
                              "coords": [
                                    34.2505,
                                    108.9423
                              ],
                              "flag": "🇨🇳",
                              "transport": {
                                    "type": "bike",
                                    "icon": "🚲",
                                    "label": "Bicicletta sulle Mura Ming (14 km)"
                              }
                        }
                  ]
            },
            {
                  "dayNumber": 19,
                  "date": "Lunedì 9 Agosto 2027",
                  "title": "Pagoda della Grande Oca Selvatica & Treno Notturno per Pechino",
                  "summary": "Visita mattutina alla monumentale Pagoda della Grande Oca Selvatica a Xi'an. In serata partenza con Treno Notturno Soft Sleeper (20:00-08:30, 105,00 €, 1200 km) verso la capitale Pechino.",
                  "schedule": [
                        {
                              "id": "act-52-19-1",
                              "time": "10:00",
                              "title": "Pagoda della Grande Oca Selvatica (Dayanta)",
                              "desc": "La celebre pagoda in mattoni costruita nel 652 d.C. dal monaco Xuanzang per conservare i sutra sacri portati a piedi dall'India lungo la Via della Seta.",
                              "icon": "🛕",
                              "locationName": "Giant Wild Goose Pagoda, Xi'an",
                              "coords": [
                                    34.2185,
                                    108.9642
                              ],
                              "flag": "🇨🇳",
                              "transport": {
                                    "type": "metro",
                                    "icon": "🚇",
                                    "label": "Metropolitana di Xi'an"
                              }
                        },
                        {
                              "id": "act-52-19-2",
                              "time": "20:00",
                              "title": "Treno Notturno China Railway Xi'an ➔ Pechino West",
                              "desc": "Viaggio notturno di 12h30m in cuccetta morbida di 1ª classe 'Soft Sleeper' verso la capitale (costo: 105,00 €, 1200 km, prenotato su Trip.com). Notte a bordo.",
                              "icon": "🚆",
                              "locationName": "Xi'an Railway Station",
                              "coords": [
                                    34.2778,
                                    108.9567
                              ],
                              "flag": "🇨🇳",
                              "transport": {
                                    "type": "train_sleeper",
                                    "icon": "🚆",
                                    "label": "Treno Notturno Soft Sleeper (1.200 km)"
                              }
                        }
                  ]
            },
            {
                  "dayNumber": 20,
                  "date": "Martedì 10 Agosto 2027",
                  "title": "Arrivo a Pechino, Piazza Tiananmen & Città Proibita",
                  "summary": "Arrivo a Pechino West alle 08:30, check-in al Peace Hotel Wangfujing (PIN: 6724, 4 notti, 440,00 €). Visita a Piazza Tiananmen e ai grandiosi cortili della Città Proibita (costo: 25,00 €).",
                  "schedule": [
                        {
                              "id": "act-52-20-1",
                              "time": "08:30",
                              "title": "Arrivo alla Stazione di Pechino West (Beijing West)",
                              "desc": "Arrivo nella monumentale capitale della Repubblica Popolare Cinese.",
                              "icon": "🛬",
                              "locationName": "Beijing West Railway Station",
                              "coords": [
                                    39.8953,
                                    116.3218
                              ],
                              "flag": "🇨🇳",
                              "transport": {
                                    "type": "metro",
                                    "icon": "🚇",
                                    "label": "Metro Linea 7/9 verso Wangfujing"
                              }
                        },
                        {
                              "id": "act-52-20-2",
                              "time": "14:00",
                              "title": "Check-in Peace Hotel Beijing / Novotel Wangfujing (PIN: 6724)",
                              "desc": "Sistemazione per 4 notti nel prestigioso distretto di Wangfujing (costo totale: 440,00 €, PNR: 4991780, PIN: 6724).",
                              "icon": "🏨",
                              "locationName": "Peace Hotel Beijing (Wangfujing)",
                              "coords": [
                                    39.9142,
                                    116.4116
                              ],
                              "flag": "🇨🇳",
                              "transport": {
                                    "type": "walk",
                                    "icon": "🚶",
                                    "label": "Arrivo in hotel"
                              }
                        },
                        {
                              "id": "act-52-20-3",
                              "time": "15:00",
                              "title": "Piazza Tiananmen & Città Proibita (Gugong)",
                              "desc": "L'immensa Piazza Tiananmen con la Porta della Pace Celeste e il ritratto di Mao, seguito dall'ingresso alla Città Proibita con la Sala dell'Armonia Suprema (costo: 25,00 €).",
                              "icon": "🏯",
                              "locationName": "Piazza Tiananmen & Città Proibita",
                              "coords": [
                                    39.9163,
                                    116.3972
                              ],
                              "flag": "🇨🇳",
                              "transport": {
                                    "type": "walk",
                                    "icon": "🚶",
                                    "label": "Tour a piedi nella Città Proibita"
                              }
                        }
                  ]
            },
            {
                  "dayNumber": 21,
                  "date": "Mercoledì 11 Agosto 2027",
                  "title": "Escursione alla Grande Muraglia Cinese (Mutianyu) con Funivia & Toboga",
                  "summary": "Escursione fuori città alla spettacolare sezione Mutianyu della Grande Muraglia (costo: 110,00 €): salita in funivia panoramica, camminata sui bastioni fortificati e divertente discesa in toboga.",
                  "schedule": [
                        {
                              "id": "act-52-21-1",
                              "time": "08:00",
                              "title": "Partenza in Bus per la Grande Muraglia a Mutianyu",
                              "desc": "Trasferimento verso le colline boscose a nord di Pechino (costo tour: 110,00 €).",
                              "icon": "🚌",
                              "locationName": "Mutianyu Great Wall Visitor Center",
                              "coords": [
                                    40.4319,
                                    116.5704
                              ],
                              "flag": "🇨🇳",
                              "transport": {
                                    "type": "bus",
                                    "icon": "🚌",
                                    "label": "Minivan/Bus verso Mutianyu (70 km)"
                              }
                        },
                        {
                              "id": "act-52-21-2",
                              "time": "10:30",
                              "title": "Salita in Funivia & Passeggiata sui Bastioni di Mutianyu",
                              "desc": "Salita in funivia e camminata tra le antiche torri di guardia in pietra della dinastia Ming che serpeggiano sui crinali delle montagne a perdita d'occhio.",
                              "icon": "🧱",
                              "locationName": "Grande Muraglia Cinese - Sezione Mutianyu",
                              "coords": [
                                    40.4377,
                                    116.562
                              ],
                              "flag": "🇨🇳",
                              "transport": {
                                    "type": "cablecar",
                                    "icon": "🚠",
                                    "label": "Funivia per i bastioni superiori"
                              }
                        },
                        {
                              "id": "act-52-21-3",
                              "time": "14:00",
                              "title": "Discesa Adrenalinica su Bob / Toboga su Rotaia",
                              "desc": "Emozionante discesa a tutta velocità sui carrelli su pista metallica a canalone che scende dai bastioni fino alla valle.",
                              "icon": "🛷",
                              "locationName": "Mutianyu Toboggan Ride",
                              "coords": [
                                    40.4325,
                                    116.568
                              ],
                              "flag": "🇨🇳",
                              "transport": {
                                    "type": "ride",
                                    "icon": "🛷",
                                    "label": "Discesa in Toboga"
                              }
                        }
                  ]
            },
            {
                  "dayNumber": 22,
                  "date": "Giovedì 12 Agosto 2027",
                  "title": "Tempio del Cielo, Palazzo d'Estate & Anatra Laccata",
                  "summary": "I grandi capolavori imperiali: il Tempio del Cielo con la Sala della Preghiera per i Buoni Raccolti, il Palazzo d'Estate sul lago Kunming (costo: 30,00 €) e cena con celebre anatra alla pechinese.",
                  "schedule": [
                        {
                              "id": "act-52-22-1",
                              "time": "09:30",
                              "title": "Tempio del Cielo (Tiantan)",
                              "desc": "Il capolavoro dell'architettura circolare in legno a triplo tetto blu zaffiro dove gli imperatori Ming e Qing officiavano i riti propiziatori per il raccolto.",
                              "icon": "⛩️",
                              "locationName": "Tempio del Cielo (Tiantan Park)",
                              "coords": [
                                    39.8822,
                                    116.4066
                              ],
                              "flag": "🇨🇳",
                              "transport": {
                                    "type": "metro",
                                    "icon": "🚇",
                                    "label": "Metro Linea 5"
                              }
                        },
                        {
                              "id": "act-52-22-2",
                              "time": "14:00",
                              "title": "Palazzo d'Estate & Lago Kunming",
                              "desc": "La tenuta imperiale estiva dell'Imperatrice Cixi con la Collina della Longevità, il Corridoio Dipinto di 728 metri, il Ponte dei 17 Archi e la Barca di Marmo.",
                              "icon": "⛵",
                              "locationName": "Summer Palace (Yiheyuan) Kunming Lake",
                              "coords": [
                                    39.9998,
                                    116.2755
                              ],
                              "flag": "🇨🇳",
                              "transport": {
                                    "type": "ferry",
                                    "icon": "⛴️",
                                    "label": "Barca sul Lago Kunming"
                              }
                        },
                        {
                              "id": "act-52-22-3",
                              "time": "19:30",
                              "title": "Cena Imperiale con Anatra Laccata alla Pechinese",
                              "desc": "Degustazione della leggendaria anatra laccata tagliata al tavolo in fette sottili con pelle croccante, cipollotto, cetriolo e crepes al vapore.",
                              "icon": "🦆",
                              "locationName": "Ristorante Tradizionale Wangfujing",
                              "coords": [
                                    39.914,
                                    116.411
                              ],
                              "flag": "🇨🇳",
                              "transport": {
                                    "type": "walk",
                                    "icon": "🚶",
                                    "label": "A piedi a Wangfujing"
                              }
                        }
                  ]
            },
            {
                  "dayNumber": 23,
                  "date": "Venerdì 13 Agosto 2027",
                  "title": "I Vicoli Hutong con Risciò, Torre del Tamburo & Shichahai",
                  "summary": "Passeggiata nei vicoli storici Hutong a bordo di risciò a pedali, salita alla Torre della Campana e del Tamburo, laghetto Shichahai e shopping serale lungo via Wangfujing.",
                  "schedule": [
                        {
                              "id": "act-52-23-1",
                              "time": "10:30",
                              "title": "Tour in Risciò a Pedali nei Vicoli Hutong di Nanluoguxiang",
                              "desc": "Giro tra le tradizionali corti siheyuan in mattoni grigi, botteghe artigiane e giardini segreti conservati intatti dal tempo.",
                              "icon": "🛺",
                              "locationName": "Nanluoguxiang Hutong District",
                              "coords": [
                                    39.9378,
                                    116.4025
                              ],
                              "flag": "🇨🇳",
                              "transport": {
                                    "type": "bike",
                                    "icon": "🚲",
                                    "label": "Risciò tradizionale nei vicoli"
                              }
                        },
                        {
                              "id": "act-52-23-2",
                              "time": "15:00",
                              "title": "Lago Shichahai & Torre del Tamburo e della Campana",
                              "desc": "Passeggiata attorno ai laghi orlati di salici piangenti e spettacolo dei tamburi imperiali sulla torre storica.",
                              "icon": "🥁",
                              "locationName": "Drum Tower (Gulou) & Shichahai Lake",
                              "coords": [
                                    39.9405,
                                    116.3955
                              ],
                              "flag": "🇨🇳",
                              "transport": {
                                    "type": "walk",
                                    "icon": "🚶",
                                    "label": "Passeggiata a Shichahai"
                              }
                        },
                        {
                              "id": "act-52-23-3",
                              "time": "19:00",
                              "title": "Shopping Finale e Street Food a Wangfujing",
                              "desc": "Ultimi acquisti di tè cinese pregiato, sete e souvenir lungo il celebre viale pedonale.",
                              "icon": "🛍️",
                              "locationName": "Wangfujing Pedestrian Street",
                              "coords": [
                                    39.9142,
                                    116.4116
                              ],
                              "flag": "🇨🇳",
                              "transport": {
                                    "type": "walk",
                                    "icon": "🚶",
                                    "label": "A piedi su Wangfujing"
                              }
                        }
                  ]
            },
            {
                  "dayNumber": 24,
                  "date": "Sabato 14 Agosto 2027",
                  "title": "Treno Proiettile Fuxing a 350 km/h Pechino ➔ Shanghai & The Bund",
                  "summary": "Treno superveloce China Railway Fuxing Bullet Train Pechino South ➔ Shanghai Hongqiao (10:00-14:30, 4h30m, 1318 km, 112,00 € a 350 km/h). Check-in SSAW Hotel Bund (PIN: 7545, 2 notti, 205,00 €) e luci notturne sul Bund.",
                  "schedule": [
                        {
                              "id": "act-52-24-1",
                              "time": "10:00",
                              "title": "Treno Proiettile Fuxing CR400 a 350 km/h Pechino ➔ Shanghai",
                              "desc": "Esperienza tecnologica sbalorditiva: 1.318 km percorsi in sole 4 ore e 30 minuti a una velocità di crociera fissa di 350 km/h (costo: 112,00 €, 2ª classe Fuxing).",
                              "icon": "🚄",
                              "locationName": "Shanghai Hongqiao High Speed Railway Station",
                              "coords": [
                                    31.1945,
                                    121.3175
                              ],
                              "flag": "🇨🇳",
                              "transport": {
                                    "type": "train_bullet",
                                    "icon": "🚄",
                                    "label": "Treno Proiettile Fuxing (350 km/h - 1.318 km)"
                              }
                        },
                        {
                              "id": "act-52-24-2",
                              "time": "15:30",
                              "title": "Check-in SSAW Boutique Hotel Shanghai Bund (PIN: 7545)",
                              "desc": "Sistemazione per 2 notti al SSAW Boutique Hotel Bund (399 Henan S Rd, costo totale: 205,00 €, PNR: 4945890, PIN: 7545).",
                              "icon": "🏨",
                              "locationName": "SSAW Boutique Hotel Shanghai Bund (399 Henan S Rd)",
                              "coords": [
                                    31.2295,
                                    121.488
                              ],
                              "flag": "🇨🇳",
                              "transport": {
                                    "type": "walk",
                                    "icon": "🚶",
                                    "label": "Arrivo in hotel"
                              }
                        },
                        {
                              "id": "act-52-24-3",
                              "time": "19:30",
                              "title": "Spettacolo di Luci Notturne sul Bund & Pudong",
                              "desc": "Passeggiata notturna sul lungofiume affacciati sulle torri illuminate di Pudong con i fasci laser e la Shanghai Tower.",
                              "icon": "✨",
                              "locationName": "The Bund Promenade at Night",
                              "coords": [
                                    31.2402,
                                    121.4905
                              ],
                              "flag": "🇨🇳",
                              "transport": {
                                    "type": "walk",
                                    "icon": "🚶",
                                    "label": "Passeggiata serale"
                              }
                        }
                  ]
            },
            {
                  "dayNumber": 25,
                  "date": "Domenica 15 Agosto 2027",
                  "title": "Giardino Yu, Città Vecchia & Concessione Francese",
                  "summary": "Ultima giornata piena a Shanghai: visita all'antico Giardino Yu Ming con laghetti di carpe (costo: 15,00 €), passeggiata sotto i platani della Concessione Francese e shopping su Nanjing Road.",
                  "schedule": [
                        {
                              "id": "act-52-25-1",
                              "time": "09:30",
                              "title": "Giardino Yu (Yu Garden) & Città Vecchia",
                              "desc": "Il magnifico giardino classico cinese del 1559 con padiglioni sull'acqua, ponti a zig-zag a nove svolte e antiche case da tè (costo: 15,00 €).",
                              "icon": "🏮",
                              "locationName": "Yu Garden & Yuyuan Bazaar",
                              "coords": [
                                    31.2272,
                                    121.4922
                              ],
                              "flag": "🇨🇳",
                              "transport": {
                                    "type": "walk",
                                    "icon": "🚶",
                                    "label": "A piedi a Yu Garden"
                              }
                        },
                        {
                              "id": "act-52-25-2",
                              "time": "14:00",
                              "title": "Viali Alberati della Concessione Francese & Xintiandi",
                              "desc": "Passeggiata tra i platani secolari, le ville d'epoca e i cortili Shikumen restaurati di Xintiandi e Tianzifang.",
                              "icon": "🌳",
                              "locationName": "Concessione Francese di Shanghai & Xintiandi",
                              "coords": [
                                    31.2198,
                                    121.4746
                              ],
                              "flag": "🇨🇳",
                              "transport": {
                                    "type": "metro",
                                    "icon": "🚇",
                                    "label": "Metropolitana di Shanghai"
                              }
                        },
                        {
                              "id": "act-52-25-3",
                              "time": "19:00",
                              "title": "Shopping Finale e Cena su Nanjing Road Pedestrian Street",
                              "desc": "Cena d'addio alla Cina con ravioli Xiao Long Bao fumanti e shopping tra le insegne al neon della via pedonale più vivace della città.",
                              "icon": "🥟",
                              "locationName": "Nanjing Road East Pedestrian Street",
                              "coords": [
                                    31.2384,
                                    121.4827
                              ],
                              "flag": "🇨🇳",
                              "transport": {
                                    "type": "walk",
                                    "icon": "🚶",
                                    "label": "Passeggiata su Nanjing Road"
                              }
                        }
                  ]
            },
            {
                  "dayNumber": 26,
                  "date": "Lunedì 16 Agosto 2027",
                  "title": "Treno a Levitazione Magnetica Maglev a 430 km/h & Voli di Rientro",
                  "summary": "Transfer per l'aeroporto di Pudong sul Treno a Levitazione Magnetica Transrapid Maglev (08:30-08:45, 8 minuti a 430 km/h!, costo 10,00 €). Volo Swiss LX189 PVG ➔ ZRH (09:40-15:55, 12h15m) e volo LX1622 ZRH ➔ MXP (17:35-18:35). Atterraggio a Milano Malpensa alle 18:35.",
                  "schedule": [
                        {
                              "id": "act-52-26-1",
                              "time": "08:30",
                              "title": "Treno a Levitazione Magnetica Shanghai Maglev (430 km/h)",
                              "desc": "Il treno commerciale più veloce del mondo a levitazione magnetica che percorre 30 km fino all'Aeroporto di Pudong in soli 8 minuti a 430 km/h! (costo: 10,00 €).",
                              "icon": "🚝",
                              "locationName": "Shanghai Maglev Train (Longyang Rd - Pudong)",
                              "coords": [
                                    31.2038,
                                    121.5583
                              ],
                              "flag": "🇨🇳",
                              "transport": {
                                    "type": "train_maglev",
                                    "icon": "🚝",
                                    "label": "Treno Maglev Levitazione Magnetica (430 km/h)"
                              }
                        },
                        {
                              "id": "act-52-26-2",
                              "time": "09:40",
                              "title": "Decollo Volo Swiss LX189 Shanghai PVG ➔ Zurigo ZRH",
                              "desc": "Volo intercontinentale di 12 ore e 15 minuti su Airbus A350-900 verso Zurigo (9.027 km).",
                              "icon": "🛫",
                              "locationName": "Shanghai Pudong International Airport",
                              "coords": [
                                    31.1443,
                                    121.8083
                              ],
                              "flag": "🇨🇳",
                              "transport": {
                                    "type": "flight",
                                    "icon": "✈️",
                                    "label": "Volo Swiss A350-900 (9.027 km)"
                              }
                        },
                        {
                              "id": "act-52-26-3",
                              "time": "15:55",
                              "title": "Transito a Zurigo Kloten & Imbarco per Malpensa",
                              "desc": "Transito passeggeri all'aeroporto di Zurigo e imbarco sul volo per Milano Malpensa LX1622.",
                              "icon": "🛬",
                              "locationName": "Zurich Kloten Airport Gates",
                              "coords": [
                                    47.4582,
                                    8.5555
                              ],
                              "flag": "🇨🇭",
                              "transport": {
                                    "type": "flight",
                                    "icon": "✈️",
                                    "label": "Transito aeroportuale"
                              }
                        },
                        {
                              "id": "act-52-26-4",
                              "time": "18:35",
                              "title": "Atterraggio a Milano Malpensa (MXP) & Rientro a Casa",
                              "desc": "Atterraggio a Milano Malpensa al termine di uno straordinario viaggio di 26 giorni attraverso tutta la Cina!",
                              "icon": "🛬",
                              "locationName": "Aeroporto di Milano Malpensa Terminal 1",
                              "coords": [
                                    45.6306,
                                    8.7281
                              ],
                              "flag": "🇮🇹",
                              "transport": {
                                    "type": "flight",
                                    "icon": "✈️",
                                    "label": "Volo Swiss LX1622 (205 km)"
                              }
                        }
                  ]
            }
      ]
},

  };

  // ==========================================================================
  // 5. METODI DI INTERFACCIA GLOBALE
  // ==========================================================================
  const TravelGuideHelper = {
    // Risoluzione coordinate della destinazione
    getTripBaseCoordinates(trip) {
      return resolveTripCoordinates(trip);
    },

    // Recupera la documentazione per una determinata nazione
    getDocuments(trip) {
      if (!trip) return TRAVEL_DOCUMENTS_DB["EU_DEFAULT"];
      if (trip.id === "trip-real-49" || (trip.country && trip.country.includes("Thailandia") && trip.country.includes("Corea"))) {
        return TRAVEL_DOCUMENTS_DB["THA_KOR"];
      }
      const code = (trip.countryCode || "").toUpperCase();
      if (TRAVEL_DOCUMENTS_DB[code]) {
        return TRAVEL_DOCUMENTS_DB[code];
      }
      if (trip.continent === "Europa") {
        return TRAVEL_DOCUMENTS_DB["EU_DEFAULT"];
      }
      return {
        country: trip.country,
        currency: "Valuta Locale & Carta di Credito",
        passports: {
          title: "Passaporto con Validità Minima 6 Mesi",
          desc: "Per viaggi extra-europei è requisito standard internazionale possedere un passaporto con almeno 6 mesi di validità residua oltre la data prevista per il rientro.",
          badge: "Validità 6+ Mesi"
        },
        visa: {
          title: "Verifica Visto d'Ingresso",
          desc: "Verificare sul sito ufficiale della Farnesina (viaggiaresicuri.it) se per la destinazione è richiesto visto preventivo, eVisa elettronico o visto rilasciato all'arrivo.",
          badge: "Da Verificare"
        },
        health: {
          title: "Assicurazione Viaggio Internazionale",
          desc: "Polizza sanitaria privata con copertura spese mediche, ricovero ospedaliero e rimpatrio d'urgenza caldamente consigliata.",
          badge: "Assicurazione Obbligatoria/Consigliata"
        },
        payments: {
          title: "Carte Internazionali & Contanti",
          desc: "Combinazione consigliata di carte multivaluta (es. Revolut/Wise), carte di credito tradizionali per depositi cauzionali e una scorta di contante in valuta forte.",
          badge: "Multivaluta"
        },
        farnesina: {
          title: "Registrazione Viaggiare Sicuri",
          desc: "Iscrizione consigliata sul portale 'Dove Siamo nel Mondo' prima del viaggio.",
          badge: "Consigliato"
        }
      };
    },

    // Recupera i consigli sull'abbigliamento in base al paese e al periodo (mese)
    getClothingGuide(trip) {
      if (!trip) return TRAVEL_CLOTHING_DB["DEFAULT_TEMPERATE"];
      if (trip.id === "trip-real-49" || (trip.country && trip.country.includes("Thailandia") && trip.country.includes("Corea"))) {
        return TRAVEL_CLOTHING_DB["THA_KOR_SUMMER"];
      }
      const code = (trip.countryCode || "").toUpperCase();
      const month = trip.startDate ? parseInt(trip.startDate.split("-")[1], 10) : 6;

      if (code === "GBR" && (month >= 11 || month <= 3)) {
        return TRAVEL_CLOTHING_DB["GBR_WINTER"];
      }
      if ((code === "CHN" || code === "JPN" || code === "HKG") && (month >= 6 && month <= 9)) {
        return TRAVEL_CLOTHING_DB["CHN_SUMMER"];
      }
      if (trip.continent === "Africa" || code === "DOM" || code === "EGY" || (trip.continent === "Europa" && (month >= 6 && month <= 8))) {
        return TRAVEL_CLOTHING_DB["MEDITERRANEAN_SUMMER"];
      }
      return TRAVEL_CLOTHING_DB["DEFAULT_TEMPERATE"];
    },

    // Recupera la lista dei gadget e specifiche elettriche per il paese
    getGadgets(trip) {
      if (!trip) return TRAVEL_GADGETS_DB["DEFAULT"];
      if (trip.id === "trip-real-49" || (trip.country && trip.country.includes("Thailandia") && trip.country.includes("Corea"))) {
        return TRAVEL_GADGETS_DB["THA_KOR"];
      }
      const code = (trip.countryCode || "").toUpperCase();
      if (TRAVEL_GADGETS_DB[code]) {
        return TRAVEL_GADGETS_DB[code];
      }
      return TRAVEL_GADGETS_DB["DEFAULT"];
    },

    // Recupera o genera l'itinerario giorno per giorno e ora per ora per qualsiasi viaggio
    getItinerary(trip) {
      if (!trip) return null;

      // Se esiste personalizzazione in localStorage
      const customKey = "giuseppe_custom_itinerary_" + trip.id;
      try {
        const stored = localStorage.getItem(customKey);
        if (stored) {
          return JSON.parse(stored);
        }
      } catch (e) {}

      // Se è presente nei nostri itinerari dettagliati
      if (UPCOMING_TRIP_ITINERARIES[trip.id]) {
        return UPCOMING_TRIP_ITINERARIES[trip.id];
      }

      // Generazione automatica intelligente con coordinate reali basate sulla città del viaggio
      const baseCoords = resolveTripCoordinates(trip);
      const duration = trip.durationDays || 3;
      const start = new Date(trip.startDate || Date.now());
      const days = [];
      const highlights = (trip.highlights && trip.highlights.length > 0) 
        ? trip.highlights 
        : ["Centro Storico & Piazze", "Monumenti Principali", "Quartiere Culturale & Musei", "Punto Panoramico & Tramonto"];

      for (let i = 1; i <= duration; i++) {
        const curDate = new Date(start);
        curDate.setDate(curDate.getDate() + (i - 1));
        const dateStr = curDate.toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
        const dayDateCap = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);

        const highlightForDay = highlights[(i - 1) % highlights.length] || `Esplorazione di ${trip.city || trip.country}`;

        let dayTitle = `Giorno ${i}: Esplorazione di ${trip.mainCity || trip.city}`;
        let summary = `Giornata dedicata alla scoperta dei punti più suggestivi, tra monumenti e tradizioni locali.`;

        if (i === 1) {
          dayTitle = `Giorno 1: Arrivo & Prime Tappe`;
          summary = `Arrivo alla destinazione, sistemazione in alloggio e primo tour a piedi orientativo.`;
        } else if (i === duration) {
          dayTitle = `Giorno ${i}: Ultime Visite & Rientro`;
          summary = `Ultime visite mattutine, shopping di prodotti locali e preparativi di rientro.`;
        } else {
          dayTitle = `Giorno ${i}: ${highlightForDay}`;
          summary = `Focus principale su ${highlightForDay}, con visite approfondite ed esperienze caratteristiche.`;
        }

        // Punti orari con coordinate reali intorno alla città
        const sched = [
          {
            id: `act-${trip.id}-${i}-1`,
            time: "09:00",
            title: `Partenza Tour & ${highlightForDay}`,
            desc: `Visita guidata ed esplorazione mattutina delle bellezze di ${trip.city || trip.country}.`,
            icon: "🏛️",
            locationName: highlightForDay,
            coords: [baseCoords[0] + 0.006 * i, baseCoords[1] + 0.005 * i]
          },
          {
            id: `act-${trip.id}-${i}-2`,
            time: "13:00",
            title: "Sosta Gastronomica & Cucina Tradizionale",
            desc: `Degustazione dei piatti tipici e specialità culinarie locali.`,
            icon: "🍽️",
            locationName: `Ristorante Tipico a ${trip.city || trip.country}`,
            coords: [baseCoords[0] + 0.002 * i, baseCoords[1] - 0.004 * i]
          },
          {
            id: `act-${trip.id}-${i}-3`,
            time: "15:30",
            title: `Passeggiata Panoramica nei Quartieri Storici`,
            desc: `Esplorazione a piedi tra piazze e punti panoramici.`,
            icon: "📸",
            locationName: `Quartiere Storico di ${trip.city || trip.country}`,
            coords: [baseCoords[0] - 0.005 * i, baseCoords[1] + 0.007 * i]
          },
          {
            id: `act-${trip.id}-${i}-4`,
            time: "19:00",
            title: "Tramonto & Atmosfera Serale",
            desc: `Relax con vista sul paesaggio al calar del sole e cena tipica.`,
            icon: "🌇",
            locationName: `Belvedere / Centro Serale`,
            coords: [baseCoords[0] - 0.003 * i, baseCoords[1] - 0.006 * i]
          }
        ];

        days.push({
          dayNumber: i,
          date: dayDateCap,
          title: dayTitle,
          summary: summary,
          schedule: sched
        });
      }

      return {
        destination: `${trip.city || trip.country}, ${trip.country}`,
        theme: trip.category || "Viaggio ed Esplorazione",
        flightInfo: trip.description || "Itinerario programmato",
        days: days
      };
    },

    // Salva un itinerario personalizzato modificato dall'utente
    saveCustomItinerary(tripId, itineraryData) {
      if (!tripId || !itineraryData) return false;
      const customKey = "giuseppe_custom_itinerary_" + tripId;
      try {
        localStorage.setItem(customKey, JSON.stringify(itineraryData));
        return true;
      } catch (e) {
        return false;
      }
    },

    // Ripristina l'itinerario predefinito
    resetCustomItinerary(tripId) {
      if (!tripId) return false;
      const customKey = "giuseppe_custom_itinerary_" + tripId;
      try {
        localStorage.removeItem(customKey);
        return true;
      } catch (e) {
        return false;
      }
    },

    // RECUPERA I PUNTI MAPPA FILTRATI PER IL GIORNO SELEZIONATO O TUTTI I GIORNI
    getWaypointsForDay(trip, daySelection = "all") {
      if (!trip) return [];
      const flagEmoji = (window.getTripFlags ? window.getTripFlags(trip) : trip.flag) || "📍";
      const baseCoords = resolveTripCoordinates(trip);
      const itinerary = this.getItinerary(trip);

      // SE VIAGGIO HA ITINERARIO GIORNO PER GIORNO (Next Stop o Generato)
      if (itinerary && itinerary.days && itinerary.days.length > 0) {
        let targetDays = itinerary.days;
        if (daySelection !== "all") {
          targetDays = itinerary.days.filter(d => String(d.dayNumber) === String(daySelection));
        }

        const waypoints = [];
        targetDays.forEach(day => {
          (day.schedule || []).forEach((item, sIdx) => {
            if (item.coords && Array.isArray(item.coords) && item.coords.length === 2) {
              waypoints.push({
                activityId: item.id || `act-${day.dayNumber}-${sIdx}`,
                name: item.locationName || item.title,
                time: item.time,
                title: item.title,
                desc: item.desc,
                coords: item.coords,
                flag: item.flag || flagEmoji,
                icon: item.icon || "📍",
                dayNumber: day.dayNumber,
                order: sIdx + 1,
                transport: item.transport || null,
                category: item.category || "attraction"
              });
            }
          });
        });

        if (waypoints.length > 0) {
          return waypoints;
        }
      }

      // SE VIAGGIO PASSATO DELL'ARCHIVIO O SENZA ITINERARIO ORARIO
      // Costruisce i punti dalle coordinate e dai momenti salienti reali della destinazione
      const pastWaypoints = [];
      pastWaypoints.push({
        activityId: `highlight-${trip.id}-0`,
        name: trip.city || trip.mainCity || trip.country,
        time: "Tappa Base",
        title: `${trip.country} — ${trip.city}`,
        desc: trip.description || `Soggiorno e visite a ${trip.city || trip.country}.`,
        coords: baseCoords,
        flag: flagEmoji,
        icon: "📍",
        dayNumber: 1,
        order: 1
      });

      if (trip.highlights && Array.isArray(trip.highlights)) {
        trip.highlights.forEach((h, idx) => {
          const angle = (idx * (2 * Math.PI / trip.highlights.length));
          const offsetLat = Math.sin(angle) * 0.045;
          const offsetLng = Math.cos(angle) * 0.055;
          pastWaypoints.push({
            activityId: `highlight-${trip.id}-${idx + 1}`,
            name: h,
            time: `Esperienza #${idx + 1}`,
            title: h,
            desc: `Momento saliente documentato nel diario di viaggio.`,
            coords: [baseCoords[0] + offsetLat, baseCoords[1] + offsetLng],
            flag: flagEmoji,
            icon: "⭐",
            dayNumber: idx + 1,
            order: idx + 2
          });
        });
      }

      if (daySelection !== "all") {
        const filtered = pastWaypoints.filter(w => String(w.dayNumber) === String(daySelection));
        return filtered.length > 0 ? filtered : pastWaypoints;
      }

      return pastWaypoints;
    }
  };

  window.TravelGuideHelper = TravelGuideHelper;
})(typeof window !== "undefined" ? window : globalThis);
