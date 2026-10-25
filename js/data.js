/**
 * data.js - Database Viaggi e Archivio Storico Voli di Giuseppe Ricatti
 * Dati estratti fedelmente dall'archivio Flighty e dalle tappe personali
 */
if (typeof window === "undefined") { var window = typeof globalThis !== "undefined" ? globalThis : this; }
if (typeof localStorage === "undefined") { var localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} }; }

// Coordinate Geografiche di Tutte le Città dell'Archivio
const CITY_COORDINATES = {
  // Italia
  "Roma": [41.9028, 12.4964],
  "Milano": [45.4642, 9.1900],
  "Bergamo": [45.6983, 9.6773],
  "Cagliari": [39.2238, 9.1217],
  "Lampedusa": [35.5069, 12.6074],
  "Firenze": [43.7696, 11.2558],
  "Venezia": [45.4408, 12.3155],
  "Napoli": [40.8518, 14.2681],
  "Bari": [41.1171, 16.8719],
  "Mestre": [45.4936, 12.2415],
  "Trieste": [45.6495, 13.7768],

  // Caraibi & Americhe
  "Punta Cana": [18.5820, -68.4055],
  "New York": [40.7128, -74.0060],
  "Boston": [42.3601, -71.0589],
  "Miami": [25.7617, -80.1918],
  "Los Angeles": [34.0522, -118.2437],
  "Las Vegas": [36.1699, -115.1398],
  "San Francisco": [37.7749, -122.4194],
  "Atlanta": [33.7490, -84.3880],
  "Città del Guatemala": [14.6349, -90.5069],
  "Flores": [16.9248, -89.8927],
  "Cancun": [21.1619, -86.8515],
  "Città del Messico": [19.4326, -99.1332],
  "San Paolo": [-23.5505, -46.6333],
  "Rio de Janeiro": [-22.9068, -43.1729],

  // Europa
  "Stoccolma": [59.3293, 18.0686],
  "Parigi": [48.8566, 2.3522],
  "Rodi": [36.4349, 28.2175],
  "Dublino": [53.3498, -6.2603],
  "Atene": [37.9838, 23.7275],
  "Chania": [35.5138, 24.0180],
  "Corfù": [39.6243, 19.9217],
  "Madrid": [40.4168, -3.7038],
  "Girona": [41.9794, 2.8214],
  "Siviglia": [37.3891, -5.9845],
  "Valencia": [39.4699, -0.3763],
  "La Coruña": [43.3623, -8.4115],
  "Santiago de Compostela": [42.8782, -8.5448],
  "Tenerife": [28.2916, -16.6291],
  "Amsterdam": [52.3676, 4.9041],
  "Porto": [41.1579, -8.6291],
  "Lisbona": [38.7223, -9.1393],
  "Billund": [55.7303, 9.1158],
  "Copenaghen": [55.6761, 12.5683],
  "Francoforte": [50.1109, 8.6821],
  "Berlino": [52.5200, 13.4050],
  "Londra": [51.5074, -0.1278],
  "Birmingham": [52.4862, -1.8904],
  "Edimburgo": [55.9533, -3.1883],
  "Bruxelles": [50.8503, 4.3517],
  "La Valletta": [35.8989, 14.5146],
  "Vienna": [48.2082, 16.3738],
  "Bucarest": [44.4268, 26.1025],
  "Helsinki": [60.1699, 24.9384],
  "Rovaniemi": [66.5039, 25.7294],
  "Vilnius": [54.6872, 25.2797],
  "Riga": [56.9496, 24.1052],
  "Zurigo": [47.3769, 8.5417],
  "Laghi di Plitvice": [44.8805, 15.6161],
  "Plitvice": [44.8805, 15.6161],
  "Mukinje": [44.8722, 15.6258],
  "Zagabria": [45.8150, 15.9819],
  "Lussemburgo": [49.6116, 6.1319],
  "Nancy": [48.6921, 6.1844],
  "Florenville": [49.6997, 5.3094],
  "Rochehaut": [49.8407, 5.0069],
  "Herbeumont": [49.7825, 5.2369],
  "Chassepierre": [49.7094, 5.2636],
  "Wéris": [50.3258, 5.5317],
  "Durbuy": [50.3525, 5.4564],
  "Malmedy": [50.4262, 6.0278],
  "Spa": [50.4925, 5.8647],
  "Stavelot": [50.3942, 5.9308],
  "Botrange": [50.5019, 6.0925],
  "Han-sur-Lesse": [50.1258, 5.1878],
  "Rochefort": [50.1583, 5.2217],
  "La Roche-en-Ardenne": [50.1833, 5.5750],
  "Belgrado": [44.7866, 20.4489],
  "Novi Sad": [45.2671, 19.8335],
  "Niš": [43.3209, 21.8958],

  // Africa & Medio Oriente
  "Sharm el-Sheikh": [27.9158, 34.3299],
  "Il Cairo": [30.0444, 31.2357],
  "Fès": [34.0181, -5.0078],
  "Monastir": [35.7643, 10.8113],
  "Dubai": [25.2048, 55.2708],
  "Doha": [25.2854, 51.5310],
  "Jeddah": [21.5433, 39.1728],

  // Asia & Oceania
  "Tokyo": [35.6762, 139.6503],
  "Pechino": [39.9042, 116.4074],
  "Xi'an": [34.3416, 108.9398],
  "Shanghai": [31.2304, 121.4737],
  "Hong Kong": [22.3193, 114.1694],
  "Giacarta": [-6.2088, 106.8456],
  "Yogyakarta": [-7.7956, 110.3695],
  "Bali": [-8.3405, 115.0920],
  "Singapore": [1.3521, 103.8198],
  "Kuala Lumpur": [3.1390, 101.6869],
  "Bangkok": [13.7563, 100.5018],
  "Koh Samui": [9.5120, 100.0136],
  "Chiang Mai": [18.7883, 98.9853],
  "Seoul": [37.5665, 126.9780],
  "Sydney": [-33.8688, 151.2093],
  "Melbourne": [-37.8136, 144.9631],
  "Adelaide": [-34.9285, 138.6007],
  "Cairns": [-16.9186, 145.7781]
};

// Metadati arricchiti per singole città (Paese specifico, ISO, Bandiera, Continente e Coordinate)
const KNOWN_CITY_META = {
  // Croazia
  "Zagabria": { country: "Croazia", countryCode: "HRV", flag: "🇭🇷", continent: "Europa", coords: [45.8150, 15.9819] },
  "Laghi di Plitvice": { country: "Croazia", countryCode: "HRV", flag: "🇭🇷", continent: "Europa", coords: [44.8805, 15.6161] },
  "Plitvice": { country: "Croazia", countryCode: "HRV", flag: "🇭🇷", continent: "Europa", coords: [44.8805, 15.6161] },
  "Mukinje": { country: "Croazia", countryCode: "HRV", flag: "🇭🇷", continent: "Europa", coords: [44.8722, 15.6258] },

  // Serbia (pronto per future visite o viaggi pianificati)
  "Belgrado": { country: "Serbia", countryCode: "SRB", flag: "🇷🇸", continent: "Europa", coords: [44.7866, 20.4489] },
  "Novi Sad": { country: "Serbia", countryCode: "SRB", flag: "🇷🇸", continent: "Europa", coords: [45.2671, 19.8335] },
  "Niš": { country: "Serbia", countryCode: "SRB", flag: "🇷🇸", continent: "Europa", coords: [43.3209, 21.8958] },

  // Lussemburgo & Road Trip Ardenne
  "Lussemburgo": { country: "Lussemburgo", countryCode: "LUX", flag: "🇱🇺", continent: "Europa", coords: [49.6116, 6.1319] },
  "Nancy": { country: "Francia", countryCode: "FRA", flag: "🇫🇷", continent: "Europa", coords: [48.6921, 6.1844] },
  "Zurigo": { country: "Svizzera", countryCode: "CHE", flag: "🇨🇭", continent: "Europa", coords: [47.3769, 8.5417] },
  "Malmedy": { country: "Belgio", countryCode: "BEL", flag: "🇧🇪", continent: "Europa", coords: [50.4262, 6.0278] },
  "Florenville": { country: "Belgio", countryCode: "BEL", flag: "🇧🇪", continent: "Europa", coords: [49.6997, 5.3094] },
  "Rochehaut": { country: "Belgio", countryCode: "BEL", flag: "🇧🇪", continent: "Europa", coords: [49.8407, 5.0069] },
  "Herbeumont": { country: "Belgio", countryCode: "BEL", flag: "🇧🇪", continent: "Europa", coords: [49.7825, 5.2369] },
  "Chassepierre": { country: "Belgio", countryCode: "BEL", flag: "🇧🇪", continent: "Europa", coords: [49.7094, 5.2636] },
  "Wéris": { country: "Belgio", countryCode: "BEL", flag: "🇧🇪", continent: "Europa", coords: [50.3258, 5.5317] },
  "Durbuy": { country: "Belgio", countryCode: "BEL", flag: "🇧🇪", continent: "Europa", coords: [50.3525, 5.4564] },
  "Spa": { country: "Belgio", countryCode: "BEL", flag: "🇧🇪", continent: "Europa", coords: [50.4925, 5.8647] },
  "Stavelot": { country: "Belgio", countryCode: "BEL", flag: "🇧🇪", continent: "Europa", coords: [50.3942, 5.9308] },
  "Botrange": { country: "Belgio", countryCode: "BEL", flag: "🇧🇪", continent: "Europa", coords: [50.5019, 6.0925] },
  "Han-sur-Lesse": { country: "Belgio", countryCode: "BEL", flag: "🇧🇪", continent: "Europa", coords: [50.1258, 5.1878] },
  "Rochefort": { country: "Belgio", countryCode: "BEL", flag: "🇧🇪", continent: "Europa", coords: [50.1583, 5.2217] },
  "La Roche-en-Ardenne": { country: "Belgio", countryCode: "BEL", flag: "🇧🇪", continent: "Europa", coords: [50.1833, 5.5750] },
  "Mestre": { country: "Italia", countryCode: "ITA", flag: "🇮🇹", continent: "Europa", coords: [45.4936, 12.2415] },
  "Trieste": { country: "Italia", countryCode: "ITA", flag: "🇮🇹", continent: "Europa", coords: [45.6495, 13.7768] }
};
if (typeof window !== "undefined") {
  window.KNOWN_CITY_META = KNOWN_CITY_META;
}

// Dizionario Completo Nomi Paesi (Italiano, ISO, Continente, Bandiera)
const COUNTRY_NAME_MAP = {
  "italia": { iso: "ITA", name: "Italia", continent: "Europa", flag: "🇮🇹" },
  "lussemburgo": { iso: "LUX", name: "Lussemburgo", continent: "Europa", flag: "🇱🇺" },
  "luxembourg": { iso: "LUX", name: "Lussemburgo", continent: "Europa", flag: "🇱🇺" },
  "repubblica dominicana": { iso: "DOM", name: "Repubblica Dominicana", continent: "Nord America", flag: "🇩🇴" },
  "egitto": { iso: "EGY", name: "Egitto", continent: "Africa", flag: "🇪🇬" },
  "svezia": { iso: "SWE", name: "Svezia", continent: "Europa", flag: "🇸🇪" },
  "francia": { iso: "FRA", name: "Francia", continent: "Europa", flag: "🇫🇷" },
  "grecia": { iso: "GRC", name: "Grecia", continent: "Europa", flag: "🇬🇷" },
  "irlanda": { iso: "IRL", name: "Irlanda", continent: "Europa", flag: "🇮🇪" },
  "spagna": { iso: "ESP", name: "Spagna", continent: "Europa", flag: "🇪🇸" },
  "stati uniti": { iso: "USA", name: "Stati Uniti d'America", continent: "Nord America", flag: "🇺🇸" },
  "stati uniti d'america": { iso: "USA", name: "Stati Uniti d'America", continent: "Nord America", flag: "🇺🇸" },
  "paesi bassi": { iso: "NLD", name: "Paesi Bassi", continent: "Europa", flag: "🇳🇱" },
  "portogallo": { iso: "PRT", name: "Portogallo", continent: "Europa", flag: "🇵🇹" },
  "guatemala": { iso: "GTM", name: "Guatemala", continent: "Nord America", flag: "🇬🇹" },
  "messico": { iso: "MEX", name: "Messico", continent: "Nord America", flag: "🇲🇽" },
  "danimarca": { iso: "DNK", name: "Danimarca", continent: "Europa", flag: "🇩🇰" },
  "germania": { iso: "DEU", name: "Germania", continent: "Europa", flag: "🇩🇪" },
  "giappone": { iso: "JPN", name: "Giappone", continent: "Asia", flag: "🇯🇵" },
  "marocco": { iso: "MAR", name: "Marocco", continent: "Africa", flag: "🇲🇦" },
  "brasile": { iso: "BRA", name: "Brasile", continent: "Sud America", flag: "🇧🇷" },
  "cina": { iso: "CHN", name: "Cina", continent: "Asia", flag: "🇨🇳" },
  "hong kong": { iso: "HKG", name: "Hong Kong", continent: "Asia", flag: "🇭🇰" },
  "regno unito": { iso: "GBR", name: "Regno Unito", continent: "Europa", flag: "🇬🇧" },
  "tunisia": { iso: "TUN", name: "Tunisia", continent: "Africa", flag: "🇹🇳" },
  "belgio": { iso: "BEL", name: "Belgio", continent: "Europa", flag: "🇧🇪" },
  "malta": { iso: "MLT", name: "Malta", continent: "Europa", flag: "🇲🇹" },
  "romania": { iso: "ROU", name: "Romania", continent: "Europa", flag: "🇷🇴" },
  "emirati arabi uniti": { iso: "ARE", name: "Emirati Arabi Uniti", continent: "Asia", flag: "🇦🇪" },
  "australia": { iso: "AUS", name: "Australia", continent: "Oceania", flag: "🇦🇺" },
  "austria": { iso: "AUT", name: "Austria", continent: "Europa", flag: "🇦🇹" },
  "arabia saudita": { iso: "SAU", name: "Arabia Saudita", continent: "Asia", flag: "🇸🇦" },
  "indonesia": { iso: "IDN", name: "Indonesia", continent: "Asia", flag: "🇮🇩" },
  "singapore": { iso: "SGP", name: "Singapore", continent: "Asia", flag: "🇸🇬" },
  "malesia": { iso: "MYS", name: "Malesia", continent: "Asia", flag: "🇲🇾" },
  "finlandia": { iso: "FIN", name: "Finlandia", continent: "Europa", flag: "🇫🇮" },
  "lituania": { iso: "LTU", name: "Lituania", continent: "Europa", flag: "🇱🇹" },
  "lettonia": { iso: "LVA", name: "Lettonia", continent: "Europa", flag: "🇱🇻" },
  "thailandia": { iso: "THA", name: "Thailandia", continent: "Asia", flag: "🇹🇭" },
  "corea del sud": { iso: "KOR", name: "Corea del Sud", continent: "Asia", flag: "🇰🇷" },
  "svizzera": { iso: "CHE", name: "Svizzera", continent: "Europa", flag: "🇨🇭" },
  "norvegia": { iso: "NOR", name: "Norvegia", continent: "Europa", flag: "🇳🇴" },
  "islanda": { iso: "ISL", name: "Islanda", continent: "Europa", flag: "🇮🇸" },
  "argentina": { iso: "ARG", name: "Argentina", continent: "Sud America", flag: "🇦🇷" },
  "cile": { iso: "CHL", name: "Cile", continent: "Sud America", flag: "🇨🇱" },
  "namibia": { iso: "NAM", name: "Namibia", continent: "Africa", flag: "🇳🇦" },
  "sudafrica": { iso: "ZAF", name: "Sudafrica", continent: "Africa", flag: "🇿🇦" },
  "kenya": { iso: "KEN", name: "Kenya", continent: "Africa", flag: "🇰🇪" },
  "tanzania": { iso: "TZA", name: "Tanzania", continent: "Africa", flag: "🇹🇿" },
  "peru": { iso: "PER", name: "Perù", continent: "Sud America", flag: "🇵🇪" },
  "colombia": { iso: "COL", name: "Colombia", continent: "Sud America", flag: "🇨🇴" },
  "canada": { iso: "CAN", name: "Canada", continent: "Nord America", flag: "🇨🇦" },
  "cuba": { iso: "CUB", name: "Cuba", continent: "Nord America", flag: "🇨🇺" },
  "costa rica": { iso: "CRI", name: "Costa Rica", continent: "Nord America", flag: "🇨🇷" },
  "turchia": { iso: "TUR", name: "Turchia", continent: "Europa", flag: "🇹🇷" },
  "croazia": { iso: "HRV", name: "Croazia", continent: "Europa", flag: "🇭🇷" },
  "polonia": { iso: "POL", name: "Polonia", continent: "Europa", flag: "🇵🇱" },
  "repubblica ceca": { iso: "CZE", name: "Repubblica Ceca", continent: "Europa", flag: "🇨🇿" },
  "ungheria": { iso: "HUN", name: "Ungheria", continent: "Europa", flag: "🇭🇺" },
  "giordania": { iso: "JOR", name: "Giordania", continent: "Asia", flag: "🇯🇴" },
  "israele": { iso: "ISR", name: "Israele", continent: "Asia", flag: "🇮🇱" },
  "nuova zelanda": { iso: "NZL", name: "Nuova Zelanda", continent: "Oceania", flag: "🇳🇿" },
  "vietnam": { iso: "VNM", name: "Vietnam", continent: "Asia", flag: "🇻🇳" },
  "cambogia": { iso: "KHM", name: "Cambogia", continent: "Asia", flag: "🇰🇭" },
  "filippine": { iso: "PHL", name: "Filippine", continent: "Asia", flag: "🇵🇭" },
  "india": { iso: "IND", name: "India", continent: "Asia", flag: "🇮🇳" },
  "maldive": { iso: "MDV", name: "Maldive", continent: "Asia", flag: "🇲🇻" },
  "mauritius": { iso: "MUS", name: "Mauritius", continent: "Africa", flag: "🇲🇺" },
  "seychelles": { iso: "SYC", name: "Seychelles", continent: "Africa", flag: "🇸🇨" },
  "nepal": { iso: "NPL", name: "Nepal", continent: "Asia", flag: "🇳🇵" },
  "sri lanka": { iso: "LKA", name: "Sri Lanka", continent: "Asia", flag: "🇱🇰" },
  "albania": { iso: "ALB", name: "Albania", continent: "Europa", flag: "🇦🇱" },
  "montenegro": { iso: "MNE", name: "Montenegro", continent: "Europa", flag: "🇲🇪" },
  "serbia": { iso: "SRB", name: "Serbia", continent: "Europa", flag: "🇷🇸" },
  "slovenia": { iso: "SVN", name: "Slovenia", continent: "Europa", flag: "🇸🇮" },
  "slovacchia": { iso: "SVK", name: "Slovacchia", continent: "Europa", flag: "🇸🇰" },
  "estonia": { iso: "EST", name: "Estonia", continent: "Europa", flag: "🇪🇪" }
};

// Funzione globale che restituisce tutti i paesi per il selettore multi-paese
window.getAllWorldCountries = function() {
  const map = new Map();

  // 1. Aggiungi i 195 stati sovrani ufficiali dal registro geopolitico con bandiere ufficiali
  if (typeof window !== "undefined" && Array.isArray(window.ALL_SOVEREIGN_COUNTRIES)) {
    window.ALL_SOVEREIGN_COUNTRIES.forEach(c => {
      const code = (c.code || "").toUpperCase().trim();
      if (code && !map.has(code)) {
        map.set(code, {
          name: c.name,
          code: code,
          continent: c.continent || "Europa",
          flag: c.flag || "📍"
        });
      }
    });
  }

  // 2. Aggiungi i paesi dal dizionario italiano con bandiera
  for (const [key, val] of Object.entries(COUNTRY_NAME_MAP)) {
    const code = val.iso.toUpperCase();
    if (!map.has(code)) {
      map.set(code, {
        name: val.name,
        code: code,
        continent: val.continent,
        flag: val.flag
      });
    }
  }

  // 3. Integra i paesi dal GeoJSON mondiale se presenti
  if (window.WORLD_GEOJSON && window.WORLD_GEOJSON.features) {
    window.WORLD_GEOJSON.features.forEach(f => {
      const p = f.properties || {};
      const code = (p.adm0_a3 || p.iso_a3 || p.sov_a3 || "").toUpperCase().trim();
      if (code && !map.has(code) && p.name) {
        let cont = p.continent || "Mondo";
        if (cont === "Europe") cont = "Europa";
        else if (cont === "North America") cont = "Nord America";
        else if (cont === "South America") cont = "Sud America";
        else if (cont === "Antarctica") cont = "Antartide";
        map.set(code, {
          name: p.name,
          code: code,
          continent: cont,
          flag: "🌐"
        });
      }
    });
  }
  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name, 'it'));
};

// Funzione helper avanzata per ottenere la bandiera emoji da qualsiasi nome di nazione o codice ISO
window.getCountryFlagByName = function(name) {
  if (!name) return null;
  const clean = String(name).trim().toLowerCase();

  // 1. Cerca nel registro ufficiale dei 195 stati sovrani (window.ALL_SOVEREIGN_COUNTRIES)
  if (typeof window !== "undefined" && Array.isArray(window.ALL_SOVEREIGN_COUNTRIES)) {
    const foundSov = window.ALL_SOVEREIGN_COUNTRIES.find(c => {
      const cName = (c.name || "").toLowerCase().trim();
      const cCode = (c.code || "").toLowerCase().trim();
      const cIso2 = (c.iso2 || "").toLowerCase().trim();
      return cName === clean || cCode === clean || cIso2 === clean;
    });
    if (foundSov && foundSov.flag) return foundSov.flag;
  }

  // 2. Mappa dizionario comune e TripAdvisor
  for (const [key, val] of Object.entries(COUNTRY_NAME_MAP)) {
    if (key.toLowerCase() === clean || val.name.toLowerCase() === clean || (val.iso && val.iso.toLowerCase() === clean)) {
      return val.flag;
    }
  }
  if (window.TRIPADVISOR_COUNTRIES_LIST && Array.isArray(window.TRIPADVISOR_COUNTRIES_LIST)) {
    const found = window.TRIPADVISOR_COUNTRIES_LIST.find(c => (c.name || "").toLowerCase().trim() === clean || (c.code || "").toLowerCase().trim() === clean);
    if (found && found.flag) return found.flag;
  }

  // 3. Sinonimi e denominazioni comuni italiane / internazionali
  const synonyms = {
    "regno unito": "🇬🇧", "inghilterra": "🇬🇧", "gran bretagna": "🇬🇧", "uk": "🇬🇧", "great britain": "🇬🇧", "gbr": "🇬🇧",
    "stati uniti": "🇺🇸", "stati uniti d'america": "🇺🇸", "usa": "🇺🇸", "america": "🇺🇸",
    "corea del sud": "🇰🇷", "corea": "🇰🇷", "south korea": "🇰🇷", "kor": "🇰🇷",
    "paesi bassi": "🇳🇱", "olanda": "🇳🇱", "netherlands": "🇳🇱", "nld": "🇳🇱",
    "città del vaticano": "🇻🇦", "vaticano": "🇻🇦", "vat": "🇻🇦",
    "emirati arabi": "🇦🇪", "emirati arabi uniti": "🇦🇪", "eau": "🇦🇪", "uae": "🇦🇪", "dubai": "🇦🇪", "are": "🇦🇪",
    "repubblica ceca": "🇨🇿", "cechia": "🇨🇿", "czechia": "🇨🇿", "cze": "🇨🇿",
    "repubblica dominicana": "🇩🇴", "santo domingo": "🇩🇴", "dom": "🇩🇴",
    "hong kong": "🇭🇰", "macao": "🇲🇴", "taiwan": "🇹🇼",
    "bosnia ed erzegovina": "🇧🇦", "bosnia": "🇧🇦", "bih": "🇧🇦",
    "macedonia del nord": "🇲🇰", "macedonia": "🇲🇰", "mkd": "🇲🇰",
    "belgio": "🇧🇪", "luxembourg": "🇱🇺", "lussemburgo": "🇱🇺", "francia": "🇫🇷", "svizzera": "🇨🇭",
    "germania": "🇩🇪", "austria": "🇦🇹", "italia": "🇮🇹", "spagna": "🇪🇸", "portogallo": "🇵🇹",
    "grecia": "🇬🇷", "irlanda": "🇮🇪", "islanda": "🇮🇸", "norvegia": "🇳🇴", "svezia": "🇸🇪",
    "finlandia": "🇫🇮", "danimarca": "🇩🇰", "polonia": "🇵🇱", "ungheria": "🇭🇺", "croazia": "🇭🇷",
    "slovenia": "🇸🇮", "slovacchia": "🇸🇰", "romania": "🇷🇴", "bulgaria": "🇧🇬", "giappone": "🇯🇵",
    "cina": "🇨🇳", "thailandia": "🇹🇭", "vietnam": "🇻🇳", "indonesia": "🇮🇩", "maldive": "🇲🇻",
    "australia": "🇦🇺", "nuova zelanda": "🇳🇿", "egitto": "🇪🇬", "marocco": "🇲🇦", "tunisia": "🇹🇳",
    "turchia": "🇹🇷", "canada": "🇨🇦", "messico": "🇲🇽", "brasile": "🇧🇷", "argentina": "🇦🇷"
  };
  if (synonyms[clean]) return synonyms[clean];

  return null;
};

// Funzione universale che estrae in completa autonomia tutte le bandiere da stringhe di testo, array o codici
window.extractFlagsFromCountryString = function(countryInput) {
  if (!countryInput) return { flagsArray: [], flagsString: "" };
  let parts = [];
  if (Array.isArray(countryInput)) {
    parts = countryInput.map(s => String(s).trim()).filter(Boolean);
  } else {
    // Separa per virgola, &, +, /, e connettivi 'e', 'and', 'con'
    const str = String(countryInput);
    parts = str.split(/[,&/+]|\be\b|\band\b|\bcon\b/i).map(s => s.trim()).filter(Boolean);
  }

  const detectedFlags = [];
  parts.forEach(part => {
    // Pulisce parole generiche
    const cleanPart = part.replace(/\b(viaggio in|road trip|tappa|tour|visita a|esplorazione|con)\b/gi, "").trim();
    if (!cleanPart) return;
    
    // 1. Prova ricerca diretta
    let flag = window.getCountryFlagByName(cleanPart);
    
    // 2. Prova ricerca per sottostringa nei 195 stati sovrani
    if (!flag && typeof window !== "undefined" && Array.isArray(window.ALL_SOVEREIGN_COUNTRIES)) {
      const lower = cleanPart.toLowerCase();
      const match = window.ALL_SOVEREIGN_COUNTRIES.find(c => {
        const cLower = (c.name || "").toLowerCase();
        return lower.includes(cLower) || cLower.includes(lower);
      });
      if (match && match.flag) flag = match.flag;
    }

    if (flag && !detectedFlags.includes(flag)) {
      detectedFlags.push(flag);
    }
  });

  return {
    flagsArray: detectedFlags,
    flagsString: detectedFlags.join(" ")
  };
};

// Funzione universale per estrarre e mostrare tutte le bandiere delle nazioni visitate in un viaggio
window.getTripFlags = function(trip) {
  if (!trip) return "📍";

  // 1. Override specifici per viaggi combinati storici
  if (trip.id === "trip-real-49" || (trip.country && trip.country.includes("Thailandia") && trip.country.includes("Corea"))) return "🇹🇭 🇰🇷";
  if (trip.id === "trip-real-52" || (trip.country && trip.country.includes("Cina") && (trip.country.includes("Hong Kong") || (trip.city && trip.city.includes("Hong Kong"))))) return "🇨🇳 🇭🇰 🇲🇴";
  if (trip.id === "trip-real-53" || (trip.country && trip.country.includes("Belgio") && trip.country.includes("Lussemburgo"))) return "🇧🇪 🇱🇺 🇫🇷 🇨🇭";
  if (trip.id === "trip-real-54" || (trip.country && trip.country.includes("Croazia") && trip.country.includes("Italia"))) return "🇭🇷 🇮🇹";

  const flagsFound = [];
  const addEmoji = function(str) {
    if (!str || str === "📍") return;
    const matches = String(str).match(/[\uD83C][\uDDE6-\uDDFF][\uD83C][\uDDE6-\uDDFF]/g);
    if (matches && matches.length > 0) {
      matches.forEach(function(m) {
        if (!flagsFound.includes(m)) flagsFound.push(m);
      });
    } else if (typeof str === "string" && str.trim() && str.trim() !== "📍" && !flagsFound.includes(str.trim())) {
      flagsFound.push(str.trim());
    }
  };

  // A. Se trip.flag contiene una o più bandierine (anche modificate direttamente dall'utente)
  if (trip.flag && trip.flag !== "📍") {
    addEmoji(trip.flag);
  }

  // B. Se trip.flags è un array di bandierine salvate
  if (Array.isArray(trip.flags)) {
    trip.flags.forEach(addEmoji);
  }

  // C. Estrazione in autonomia da trip.country (es. "Spagna e Portogallo", "Francia & Germania")
  if (trip.country && window.extractFlagsFromCountryString) {
    const extC = window.extractFlagsFromCountryString(trip.country);
    if (extC && extC.flagsArray) extC.flagsArray.forEach(addEmoji);
  }

  // D. Estrazione da trip.countries (array di nomi di paesi)
  if (Array.isArray(trip.countries) && window.extractFlagsFromCountryString) {
    const extArr = window.extractFlagsFromCountryString(trip.countries);
    if (extArr && extArr.flagsArray) extArr.flagsArray.forEach(addEmoji);
  }

  // E. Estrazione da trip.countryCodes (array di codici ISO)
  if (Array.isArray(trip.countryCodes) && window.extractFlagsFromCountryString) {
    const extCodes = window.extractFlagsFromCountryString(trip.countryCodes);
    if (extCodes && extCodes.flagsArray) extCodes.flagsArray.forEach(addEmoji);
  }

  // F. Se ancora vuoto, cerca per countryCode singolo
  if (flagsFound.length === 0 && trip.countryCode && window.getCountryFlagByName) {
    const singleF = window.getCountryFlagByName(trip.countryCode);
    if (singleF) addEmoji(singleF);
  }

  if (flagsFound.length > 0) {
    return flagsFound.join(" ");
  }

  return (trip.flag && trip.flag !== "📍") ? trip.flag : "📍";
};

// I 52 VIAGGI REALI DI GIUSEPPE RICATTI ESTRATTI DALL'ARCHIVIO VOLI
const REAL_FLIGHT_TRIPS = [
  {
    id: "trip-real-01",
    country: "Repubblica Dominicana",
    countryCode: "DOM",
    flag: "🇩🇴",
    continent: "Nord America",
    city: "Punta Cana",
    mainCity: "Punta Cana",
    coordinates: [18.5820, -68.4055],
    startDate: "1997-03-25",
    endDate: "1997-04-03",
    durationDays: 10,
    companions: "In famiglia",
    category: "Caraibi & Mare",
    imageUrl: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80",
    description: "Volo Milano Malpensa ➔ Punta Cana (PUJ). Soggiorno caraibico tra palme, barriera corallina e spiagge bianchissime.",
    highlights: ["Spiaggia di Bavaro", "Barriera corallina caraibica", "Volo transatlantico MXP-PUJ"]
  },
  {
    id: "trip-real-02",
    country: "Egitto",
    countryCode: "EGY",
    flag: "🇪🇬",
    continent: "Africa",
    city: "Sharm el-Sheikh",
    mainCity: "Sharm el-Sheikh",
    coordinates: [27.9158, 34.3299],
    startDate: "1998-03-16",
    endDate: "1998-03-24",
    durationDays: 9,
    companions: "In famiglia",
    category: "Mare & Snorkeling",
    imageUrl: "https://images.unsplash.com/photo-1544945582-1a4659b6c934?auto=format&fit=crop&w=800&q=80",
    description: "Volo MXP ➔ Sharm el-Sheikh (SSH). Esplorazione dei fondali del Mar Rosso e della penisola del Sinai.",
    highlights: ["Snorkeling tra i coralli", "Deserto del Sinai al tramonto", "Baia di Naama"]
  },
  {
    id: "trip-real-03",
    country: "Italia",
    countryCode: "ITA",
    flag: "🇮🇹",
    continent: "Europa",
    city: "Lampedusa",
    mainCity: "Lampedusa",
    coordinates: [35.5069, 12.6074],
    startDate: "2005-08-20",
    endDate: "2005-09-03",
    durationDays: 15,
    companions: "Con amici",
    category: "Isole & Mare",
    imageUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80",
    description: "Volo MXP ➔ Lampedusa (LMP) con Gandalf Airlines (GJ1094). Due settimane nella splendida isola delle Pelagie.",
    highlights: ["Spiaggia dei Conigli", "Giro in barca dell'isola", "Acque cristalline di Cala Pulcino"]
  },
  {
    id: "trip-real-04",
    country: "Svezia",
    countryCode: "SWE",
    flag: "🇸🇪",
    continent: "Europa",
    city: "Stoccolma",
    mainCity: "Stoccolma",
    coordinates: [59.3293, 18.0686],
    startDate: "2005-12-10",
    endDate: "2005-12-14",
    durationDays: 5,
    companions: "Con amici",
    category: "Capitale del Nord",
    imageUrl: "https://images.unsplash.com/photo-1509356843151-3e7d96241e11?auto=format&fit=crop&w=800&q=80",
    description: "Volo Bergamo Orio (BGY) ➔ Stoccolma Skavsta (NYO) con Ryanair (FR1944). Atmosfera natalizia svedese tra Gamla Stan e i canali ghiacciati.",
    highlights: ["Gamla Stan innevata", "Museo Vasa", "Mercatini di Natale di Skansen"]
  },
  {
    id: "trip-real-05",
    country: "Francia",
    countryCode: "FRA",
    flag: "🇫🇷",
    continent: "Europa",
    city: "Parigi",
    mainCity: "Parigi",
    coordinates: [48.8566, 2.3522],
    startDate: "2006-01-05",
    endDate: "2006-01-09",
    durationDays: 5,
    companions: "In coppia",
    category: "Città d'Arte",
    imageUrl: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80",
    description: "Volo BGY ➔ Parigi Beauvais (BVA) (FR4235/4236). La Ville Lumière all'inizio dell'inverno: Montmartre, il Louvre e la Senna.",
    highlights: ["Tour Eiffel illuminata", "Museo del Louvre", "Passeggiata a Montmartre"]
  },
  {
    id: "trip-real-06",
    country: "Grecia",
    countryCode: "GRC",
    flag: "🇬🇷",
    continent: "Europa",
    city: "Rodi",
    mainCity: "Rodi",
    coordinates: [36.4349, 28.2175],
    startDate: "2006-06-17",
    endDate: "2006-06-24",
    durationDays: 8,
    companions: "Con amici",
    category: "Mare & Isole",
    imageUrl: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=800&q=80",
    description: "Volo BGY ➔ Rodi Diagoras (RHO) (Volo 9X760). Una settimana tra la città vecchia dei Cavalieri di San Giovanni e le spiagge di Lindos.",
    highlights: ["Città medievale fortificata di Rodi", "Acropoli di Lindos", "Spiaggia di Anthony Quinn"]
  },
  {
    id: "trip-real-07",
    country: "Irlanda",
    countryCode: "IRL",
    flag: "🇮🇪",
    continent: "Europa",
    city: "Dublino",
    mainCity: "Dublino",
    coordinates: [53.3498, -6.2603],
    startDate: "2007-04-18",
    endDate: "2007-04-24",
    durationDays: 7,
    companions: "Con amici",
    category: "Cultura & Pubs",
    imageUrl: "https://images.unsplash.com/photo-1549918864-48ac978761a4?auto=format&fit=crop&w=800&q=80",
    description: "Volo BGY ➔ Dublino (DUB) (Ryanair FR9429/9428 su Boeing 737-800). Settimana irlandese tra Temple Bar, musica folk e Trinity College.",
    highlights: ["Temple Bar di sera", "Trinity College e la Old Library", "Guinness Storehouse"]
  },
  {
    id: "trip-real-08",
    country: "Grecia",
    countryCode: "GRC",
    flag: "🇬🇷",
    continent: "Europa",
    city: "Atene",
    mainCity: "Atene",
    coordinates: [37.9838, 23.7275],
    startDate: "2007-05-19",
    endDate: "2007-05-27",
    durationDays: 9,
    companions: "Con amici",
    category: "Archeologia & Storia",
    imageUrl: "https://images.unsplash.com/photo-1603565816030-6b389eeb23cb?auto=format&fit=crop&w=800&q=80",
    description: "Volo MXP ➔ Atene Eleftherios Venizelos (ATH) (EasyJet U2 4369/4372 - Airbus A319). Tra l'Acropoli baciata dal sole e il quartiere Plaka.",
    highlights: ["Partenone ed Eretteo", "Tramonto dalla collina del Licabetto", "Taverne tradizionali a Plaka"]
  },
  {
    id: "trip-real-09",
    country: "Francia",
    countryCode: "FRA",
    flag: "🇫🇷",
    continent: "Europa",
    city: "Parigi",
    mainCity: "Parigi",
    coordinates: [48.8566, 2.3522],
    startDate: "2007-10-11",
    endDate: "2007-10-14",
    durationDays: 4,
    companions: "In coppia",
    category: "Weekend Romantico",
    imageUrl: "https://images.unsplash.com/photo-1509840841025-9088ba78a826?auto=format&fit=crop&w=800&q=80",
    description: "Volo MXP ➔ Parigi CDG (EasyJet U2 4387/4384). Quattro giorni autunnali lungo la Senna, Saint-Germain e il Musée d'Orsay.",
    highlights: ["Musée d'Orsay", "Passeggiata nei Jardin du Luxembourg", "Quartiere Latino"]
  },
  {
    id: "trip-real-10",
    country: "Spagna",
    countryCode: "ESP",
    flag: "🇪🇸",
    continent: "Europa",
    city: "Madrid",
    mainCity: "Madrid",
    coordinates: [40.4168, -3.7038],
    startDate: "2007-11-10",
    endDate: "2007-11-13",
    durationDays: 4,
    companions: "Con amici",
    category: "Culturale",
    imageUrl: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=800&q=80",
    description: "Volo MXP ➔ Madrid Barajas (MAD) (EasyJet U2 4301/4306). Museo del Prado, Plaza Mayor e tapas nel quartiere La Latina.",
    highlights: ["Museo del Prado e Guernica al Reina Sofia", "Parco del Retiro", "Tapas serali a La Latina"]
  },
  {
    id: "trip-real-11",
    country: "Stati Uniti",
    countryCode: "USA",
    flag: "🇺🇸",
    continent: "Nord America",
    city: "New York",
    mainCity: "New York",
    coordinates: [40.7128, -74.0060],
    startDate: "2008-01-10",
    endDate: "2008-01-21",
    durationDays: 12,
    companions: "In famiglia",
    category: "Grande Mela",
    imageUrl: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=800&q=80",
    description: "Rotta BGY ➔ Roma FCO ➔ New York JFK (Eurofly ISS9956 / Alitalia ITY7615 su Boeing 767). Dodici giorni invernali tra i grattacieli di Manhattan.",
    highlights: ["Empire State Building e Top of the Rock", "Attraversamento del Ponte di Brooklyn", "Central Park sotto la neve", "Times Square"]
  },
  {
    id: "trip-real-12",
    country: "Paesi Bassi",
    countryCode: "NLD",
    flag: "🇳🇱",
    continent: "Europa",
    city: "Amsterdam",
    mainCity: "Amsterdam",
    coordinates: [52.3676, 4.9041],
    startDate: "2008-02-13",
    endDate: "2008-02-18",
    durationDays: 6,
    companions: "Con amici",
    category: "Città & Canali",
    imageUrl: "https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?auto=format&fit=crop&w=800&q=80",
    description: "Volo MXP ➔ Amsterdam Schiphol (AMS) (EasyJet U2 4327/4328). Sei giorni in bicicletta tra musei, Jordaan e i canali della cerchia storica.",
    highlights: ["Museo Van Gogh e Rijksmuseum", "Giro in bici lungo i canali", "Quartiere Jordaan"]
  },
  {
    id: "trip-real-13",
    country: "Portogallo",
    countryCode: "PRT",
    flag: "🇵🇹",
    continent: "Europa",
    city: "Porto",
    mainCity: "Porto",
    coordinates: [41.1579, -8.6291],
    startDate: "2008-03-14",
    endDate: "2008-03-17",
    durationDays: 4,
    companions: "In solitaria",
    category: "Oceano & Vino",
    imageUrl: "https://images.unsplash.com/photo-1555881400-74d7acaacd81?auto=format&fit=crop&w=800&q=80",
    description: "Volo BGY ➔ Porto (OPO) (Ryanair FR4702/4703). Il ponte Dom Luís I, le azulejos della stazione di São Bento e le cantine di Vila Nova de Gaia.",
    highlights: ["Ponte Dom Luís I sul fiume Douro", "Azulejos di São Bento", "Degustazione nelle cantine di Porto"]
  },
  {
    id: "trip-real-14",
    country: "Guatemala & Messico",
    countryCode: "GTM",
    flag: "🇬🇹",
    continent: "Nord America",
    city: "Città del Guatemala, Flores (Tikal), Cancun",
    mainCity: "Flores",
    coordinates: [16.9248, -89.8927],
    startDate: "2008-03-20",
    endDate: "2008-04-02",
    durationDays: 14,
    companions: "Con compagni di spedizione",
    category: "Spedizione Archeologica Maya",
    imageUrl: "https://images.unsplash.com/photo-1518638150340-f706e86654de?auto=format&fit=crop&w=800&q=80",
    description: "Grande spedizione: BGY ➔ FCO ➔ MAD ➔ Città del Messico ➔ Guatemala (GUA) ➔ volo interno su Flores (Tikal, FRS) ➔ Cancun (CUN) ➔ MEX ➔ MAD ➔ FCO ➔ BGY. Voli con Iberia (A340), TACA (A320/A319) e Aeromexico.",
    highlights: ["Piramidi Maya di Tikal nella giungla", "Lago Petén Itzá a Flores", "Antigua Guatemala", "Cenotes dello Yucatan a Cancun"]
  },
  {
    id: "trip-real-15",
    country: "Danimarca",
    countryCode: "DNK",
    flag: "🇩🇰",
    continent: "Europa",
    city: "Billund",
    mainCity: "Billund",
    coordinates: [55.7303, 9.1158],
    startDate: "2008-05-16",
    endDate: "2008-05-18",
    durationDays: 3,
    companions: "Con amici",
    category: "Weekend Danese",
    imageUrl: "https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?auto=format&fit=crop&w=800&q=80",
    description: "Volo BGY ➔ Billund (BLL) (Ryanair FR4722/4723). Tre giorni nella penisola dello Jutland.",
    highlights: ["Visita a Legoland Billund", "Campagne dello Jutland", "Design scandinavo"]
  },
  {
    id: "trip-real-16",
    country: "Germania",
    countryCode: "DEU",
    flag: "🇩🇪",
    continent: "Europa",
    city: "Francoforte",
    mainCity: "Francoforte",
    coordinates: [50.1109, 8.6821],
    startDate: "2008-10-04",
    endDate: "2008-10-05",
    durationDays: 2,
    companions: "Con amici",
    category: "Weekend",
    imageUrl: "https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=800&q=80",
    description: "Volo BGY ➔ Francoforte Hahn (HHN) (Ryanair FR5203/5208). Weekend tra la valle del Reno e il centro storico.",
    highlights: ["Römerberg e centro storico", "Fiume Meno", "Cucina tradizionale dell'Assia"]
  },
  {
    id: "trip-real-17",
    country: "Danimarca",
    countryCode: "DNK",
    flag: "🇩🇰",
    continent: "Europa",
    city: "Copenaghen",
    mainCity: "Copenaghen",
    coordinates: [55.6761, 12.5683],
    startDate: "2009-02-06",
    endDate: "2009-02-09",
    durationDays: 4,
    companions: "In coppia",
    category: "Capitale del Nord",
    imageUrl: "https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?auto=format&fit=crop&w=800&q=80",
    description: "Volo MXP ➔ Copenaghen Kastrup (CPH) (EasyJet U2 2905/2906). Quattro giorni invernali tra Nyhavn, la Sirenetta e il design danese.",
    highlights: ["Canale colorato di Nyhavn", "Quartiere di Christianshavn", "Giardini di Tivoli"]
  },
  {
    id: "trip-real-18",
    country: "Stati Uniti",
    countryCode: "USA",
    flag: "🇺🇸",
    continent: "Nord America",
    city: "Los Angeles, Las Vegas, San Francisco",
    mainCity: "San Francisco",
    coordinates: [37.7749, -122.4194],
    startDate: "2009-04-02",
    endDate: "2009-04-13",
    durationDays: 12,
    companions: "Con amici",
    category: "West Coast Road Trip",
    imageUrl: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=800&q=80",
    description: "Grande Road Trip negli USA occidentali: MXP ➔ Atlanta ➔ Los Angeles (LAX) ➔ Las Vegas (LAS) ➔ San Francisco (SFO) ➔ LAX ➔ MXP con Delta (Boeing 767/757) e Southwest (737).",
    highlights: ["Golden Gate Bridge e Alcatraz a San Francisco", "The Strip e casinò a Las Vegas", "Hollywood, Beverly Hills e Venice Beach a Los Angeles"]
  },
  {
    id: "trip-real-19",
    country: "Francia",
    countryCode: "FRA",
    flag: "🇫🇷",
    continent: "Europa",
    city: "Parigi",
    mainCity: "Parigi",
    coordinates: [48.8566, 2.3522],
    startDate: "2009-08-24",
    endDate: "2009-08-30",
    durationDays: 7,
    companions: "In coppia",
    category: "Cultura & Arte",
    imageUrl: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80",
    description: "Volo Milano Linate (LIN) ➔ Parigi Orly (ORY) (EasyJet U2 4298/4297). Una settimana di fine estate tra le meraviglie della capitale francese.",
    highlights: ["Passeggiata al Canal Saint-Martin", "Sainte-Chapelle e le vetrate gotiche", "Caffè a Le Marais"]
  },
  {
    id: "trip-real-20",
    country: "Spagna",
    countryCode: "ESP",
    flag: "🇪🇸",
    continent: "Europa",
    city: "Girona & Costa Brava",
    mainCity: "Girona",
    coordinates: [41.9794, 2.8214],
    startDate: "2010-03-18",
    endDate: "2010-03-22",
    durationDays: 5,
    companions: "Con amici",
    category: "Catalogna On The Road",
    imageUrl: "https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=800&q=80",
    description: "Volo BGY ➔ Girona Costa Brava (GRO) (Ryanair FR4275/4276). Le mura medievali di Girona, le case affacciate sul fiume Onyar e il litorale catalano.",
    highlights: ["Case colorate sul fiume Onyar a Girona", "Quartiere ebraico El Call", "Cattedrale di Santa Maria"]
  },
  {
    id: "trip-real-21",
    country: "Giappone",
    countryCode: "JPN",
    flag: "🇯🇵",
    continent: "Asia",
    city: "Tokyo",
    mainCity: "Tokyo",
    coordinates: [35.6762, 139.6503],
    startDate: "2010-11-04",
    endDate: "2010-11-22",
    durationDays: 19,
    companions: "Con compagni di viaggio",
    category: "Sol Levante Grand Tour",
    imageUrl: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80",
    description: "Grande viaggio transcontinentale in Giappone: volo diretto MXP ➔ Tokyo Narita (NRT) con Boeing 777-200 ER Alitalia (ITY786/787). Diciannove giorni immersi tra tradizione millenaria e metropoli futuristica.",
    highlights: ["Shibuya Crossing e neon di Shinjuku", "Tempio Senso-ji ad Asakusa", "Esperienza autentica della cultura nipponica", "Mercato del pesce di Tsukiji"]
  },
  {
    id: "trip-real-22",
    country: "Marocco",
    countryCode: "MAR",
    flag: "🇲🇦",
    continent: "Africa",
    city: "Fès",
    mainCity: "Fès",
    coordinates: [34.0181, -5.0078],
    startDate: "2011-10-15",
    endDate: "2011-10-22",
    durationDays: 8,
    companions: "Con amici",
    category: "Città Imperiale & Medina",
    imageUrl: "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80",
    description: "Volo BGY ➔ Fès Saïss (FEZ) (Ryanair FR4728/4729). Una settimana nell'antica capitale imperiale marocchina, nella più grande medina pedonale del mondo.",
    highlights: ["Labirinto della medina di Fes el-Bali", "Concerie Chouara", "Architettura islamica della Medersa Bou Inania"]
  },
  {
    id: "trip-real-23",
    country: "Brasile",
    countryCode: "BRA",
    flag: "🇧🇷",
    continent: "Sud America",
    city: "San Paolo",
    mainCity: "San Paolo",
    coordinates: [-23.5505, -46.6333],
    startDate: "2011-12-02",
    endDate: "2011-12-12",
    durationDays: 11,
    companions: "Con amici",
    category: "Sudamerica",
    imageUrl: "https://images.unsplash.com/photo-1518638150340-f706e86654de?auto=format&fit=crop&w=800&q=80",
    description: "Volo LIN ➔ Madrid ➔ San Paolo Guarulhos (GRU) con Iberia (Airbus A340, voli IB6821/6820). Undici giorni nella vibrante megalopoli paulista.",
    highlights: ["Avenida Paulista e MASP", "Parco Ibirapuera", "Cultura e gastronomia brasiliana"]
  },
  {
    id: "trip-real-24",
    country: "Cina & Hong Kong",
    countryCode: "CHN",
    flag: "🇨🇳",
    continent: "Asia",
    city: "Pechino, Xi'an, Shanghai, Hong Kong",
    mainCity: "Pechino",
    coordinates: [39.9042, 116.4074],
    startDate: "2012-03-02",
    endDate: "2012-03-17",
    durationDays: 16,
    companions: "In gruppo di viaggio",
    category: "Grand Tour della Cina",
    imageUrl: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=800&q=80",
    description: "Straordinario itinerario asiatico: LIN ➔ FCO ➔ Pechino (PEK - Alitalia A330 ITY790/791) ➔ volo interno a Xi'an (XIY) ➔ Shanghai (PVG) ➔ Hong Kong (HKG) ➔ PEK ➔ FCO ➔ LIN.",
    highlights: ["Grande Muraglia Cinese e Città Proibita a Pechino", "Esercito di Terracotta a Xi'an", "Skyline del Bund a Shanghai", "Victoria Harbour a Hong Kong"]
  },
  {
    id: "trip-real-25",
    country: "Brasile",
    countryCode: "BRA",
    flag: "🇧🇷",
    continent: "Sud America",
    city: "San Paolo & Rio de Janeiro",
    mainCity: "Rio de Janeiro",
    coordinates: [-22.9068, -43.1729],
    startDate: "2012-04-24",
    endDate: "2012-05-01",
    durationDays: 8,
    companions: "Con amici",
    category: "Meraviglie Brasiliane",
    imageUrl: "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=800&q=80",
    description: "Ritorno in Brasile: MXP ➔ Lisbona ➔ San Paolo (GRU) ➔ volo navetta interno per Rio de Janeiro (Santos Dumont/Galeão) con TAP Portugal (A330/A320) e Gol (737).",
    highlights: ["Cristo Redentore sul Corcovado a Rio", "Spiaggia di Copacabana e Ipanema", "Pan di Zucchero"]
  },
  {
    id: "trip-real-26",
    country: "Grecia",
    countryCode: "GRC",
    flag: "🇬🇷",
    continent: "Europa",
    city: "Creta (Chania)",
    mainCity: "Chania",
    coordinates: [35.5138, 24.0180],
    startDate: "2012-08-06",
    endDate: "2012-08-19",
    durationDays: 14,
    companions: "Con amici",
    category: "Isole & Mare",
    imageUrl: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=800&q=80",
    description: "Volo BGY ➔ Chania (CHQ) (Ryanair FR4548/4549). Due settimane tra le lagune di Balos ed Elafonissi e il porto veneziano di Chania.",
    highlights: ["Laguna rosa di Elafonissi", "Spiaggia di Balos", "Porto veneziano di Chania"]
  },
  {
    id: "trip-real-27",
    country: "Paesi Bassi",
    countryCode: "NLD",
    flag: "🇳🇱",
    continent: "Europa",
    city: "Amsterdam",
    mainCity: "Amsterdam",
    coordinates: [52.3676, 4.9041],
    startDate: "2012-08-25",
    endDate: "2012-08-27",
    durationDays: 3,
    companions: "Con amici",
    category: "City Break",
    imageUrl: "https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?auto=format&fit=crop&w=800&q=80",
    description: "Volo MXP ➔ Amsterdam Schiphol (AMS) (EasyJet U2 2723/2730). Weekend di fine estate lungo i canali.",
    highlights: ["Canali di Amsterdam", "Vondelpark", "Vita notturna di Leidseplein"]
  },
  {
    id: "trip-real-28",
    country: "Regno Unito",
    countryCode: "GBR",
    flag: "🇬🇧",
    continent: "Europa",
    city: "Birmingham",
    mainCity: "Birmingham",
    coordinates: [52.4862, -1.8904],
    startDate: "2012-12-01",
    endDate: "2012-12-04",
    durationDays: 4,
    companions: "Con amici",
    category: "Inghilterra Industriale",
    imageUrl: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80",
    description: "Volo BGY ➔ Birmingham (BHX) (Ryanair FR1464/1463). Quattro giorni nel cuore delle Midlands inglesi.",
    highlights: ["Canali di Gas Street Basin", "Mercatini di Natale di Birmingham", "Architettura moderna della biblioteca"]
  },
  {
    id: "trip-real-29",
    country: "Tunisia",
    countryCode: "TUN",
    flag: "🇹🇳",
    continent: "Africa",
    city: "Monastir & Sousse",
    mainCity: "Monastir",
    coordinates: [35.7643, 10.8113],
    startDate: "2013-07-29",
    endDate: "2013-08-12",
    durationDays: 15,
    companions: "In famiglia",
    category: "Maghreb & Mare",
    imageUrl: "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80",
    description: "Volo MXP ➔ Monastir Habib Bourguiba (MIR) (Nouvelair BJ6805/6804). Due settimane lungo la costa tunisina del Sahel.",
    highlights: ["Ribat di Monastir", "Medina di Sousse", "Spiagge del Mediterraneo meridionale"]
  },
  {
    id: "trip-real-30",
    country: "Belgio",
    countryCode: "BEL",
    flag: "🇧🇪",
    continent: "Europa",
    city: "Bruxelles & Fiandre",
    mainCity: "Bruxelles",
    coordinates: [50.8503, 4.3517],
    startDate: "2013-08-23",
    endDate: "2013-08-26",
    durationDays: 4,
    companions: "Con amici",
    category: "Culturale",
    imageUrl: "https://images.unsplash.com/photo-1509840841025-9088ba78a826?auto=format&fit=crop&w=800&q=80",
    description: "Volo BGY ➔ Bruxelles Charleroi (CRL) (Ryanair FR4523/4526). Grand Place, birrifici artigianali e cioccolato belga.",
    highlights: ["Grand Place illuminata", "Degustazione di birre trappiste", "Atomium"]
  },
  {
    id: "trip-real-31",
    country: "Malta",
    countryCode: "MLT",
    flag: "🇲🇹",
    continent: "Europa",
    city: "La Valletta & Mdina",
    mainCity: "La Valletta",
    coordinates: [35.8989, 14.5146],
    startDate: "2013-10-04",
    endDate: "2013-10-07",
    durationDays: 4,
    companions: "Con amici",
    category: "Mediterraneo & Cavalieri",
    imageUrl: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=800&q=80",
    description: "Volo BGY ➔ Malta Luqa (MLA) (Ryanair FR7324/7325). Quattro giorni tra i bastioni de La Valletta, Mdina la città silenziosa e la Laguna Blu.",
    highlights: ["Cattedrale di San Giovanni a La Valletta", "Mdina antica capitale", "Scogliere di Dingli"]
  },
  {
    id: "trip-real-32",
    country: "Stati Uniti",
    countryCode: "USA",
    flag: "🇺🇸",
    continent: "Nord America",
    city: "Boston, San Francisco, New England",
    mainCity: "Boston",
    coordinates: [42.3601, -71.0589],
    startDate: "2014-08-08",
    endDate: "2014-09-02",
    durationDays: 26,
    companions: "In viaggio con amici",
    category: "Spedizione Coast to Coast",
    imageUrl: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=800&q=80",
    description: "Quasi un mese negli Stati Uniti: MXP ➔ Istanbul ➔ Boston (BOS) con Turkish Airlines (TK81/82) ➔ volo JetBlue (B6 834) da San Francisco (SFO) a Boston ➔ Istanbul ➔ MXP.",
    highlights: ["Freedom Trail e università di Harvard a Boston", "Coste del Massachusetts e New England", "Ritorno nella baia di San Francisco"]
  },
  {
    id: "trip-real-33",
    country: "Emirati Arabi Uniti & Romania",
    countryCode: "ARE",
    flag: "🇦🇪",
    continent: "Asia",
    city: "Dubai & Bucarest",
    mainCity: "Dubai",
    coordinates: [25.2048, 55.2708],
    startDate: "2015-12-08",
    endDate: "2015-12-13",
    durationDays: 6,
    companions: "Con amici",
    category: "Oriente & Metropoli",
    imageUrl: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80",
    description: "Rotta BGY ➔ Bucarest Otopeni (OTP) ➔ Dubai Al Maktoum (DWC) (Wizz Air W6 3132/3255). Burj Khalifa, deserto arabo e architettura moderna.",
    highlights: ["Burj Khalifa e fontane danzanti", "Safari sulle dune del deserto", "Dubai Marina"]
  },
  {
    id: "trip-real-34",
    country: "Spagna & Grecia",
    countryCode: "ESP",
    flag: "🇪🇸",
    continent: "Europa",
    city: "Tenerife & Corfù",
    mainCity: "Tenerife",
    coordinates: [28.2916, -16.6291],
    startDate: "2017-07-28",
    endDate: "2017-08-16",
    durationDays: 20,
    companions: "Con amici e famiglia",
    category: "Isole & Vulcano",
    imageUrl: "https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=800&q=80",
    description: "Estate tra le isole: voli BGY ➔ Corfù (CFU) e BGY ➔ Tenerife Sud (TFS) con Ryanair (Boeing 737-800). Il Parco Nazionale del Teide alle Canarie e il mare delle isole ionie.",
    highlights: ["Vulcano Teide a Tenerife", "Scogliere di Los Gigantes", "Paléokastritsa a Corfù"]
  },
  {
    id: "trip-real-35",
    country: "Australia",
    countryCode: "AUS",
    flag: "🇦🇺",
    continent: "Oceania",
    city: "Sydney, Melbourne, Adelaide, Cairns",
    mainCity: "Sydney",
    coordinates: [-33.8688, 151.2093],
    startDate: "2018-04-22",
    endDate: "2018-05-13",
    durationDays: 22,
    companions: "Grande Spedizione",
    category: "Down Under Grand Tour",
    imageUrl: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=800&q=80",
    description: "Spedizione australiana: MXP ➔ Doha ➔ Sydney con Airbus A380 Qatar Airways (QR908/909). Voli interni Jetstar tra Sydney ➔ Melbourne (AVV) ➔ Adelaide (ADL) ➔ Cairns (CNS - Grande Barriera Corallina) ➔ Sydney.",
    highlights: ["Opera House e Harbour Bridge a Sydney", "Snorkeling sulla Grande Barriera Corallina a Cairns", "Great Ocean Road vicino a Melbourne", "Fauna selvatica: canguri e koala"]
  },
  {
    id: "trip-real-36",
    country: "Austria",
    countryCode: "AUT",
    flag: "🇦🇹",
    continent: "Europa",
    city: "Vienna",
    mainCity: "Vienna",
    coordinates: [48.2082, 16.3738],
    startDate: "2018-08-24",
    endDate: "2018-08-27",
    durationDays: 4,
    companions: "Con amici",
    category: "Città Imperiale",
    imageUrl: "https://images.unsplash.com/photo-1516550893923-42d28e5677af?auto=format&fit=crop&w=800&q=80",
    description: "Volo MXP ➔ Vienna Schwechat (VIE) (Laudamotion / Austrian A321). Quattro giorni tra Schönbrunn, il Belvedere di Klimt e la Sachertorte.",
    highlights: ["Palazzo di Schönbrunn", "Il Bacio di Gustav Klimt al Belvedere", "Caffè storici viennesi"]
  },
  {
    id: "trip-real-37",
    country: "Regno Unito",
    countryCode: "GBR",
    flag: "🇬🇧",
    continent: "Europa",
    city: "Edimburgo & Scozia",
    mainCity: "Edimburgo",
    coordinates: [55.9533, -3.1883],
    startDate: "2019-04-02",
    endDate: "2019-04-09",
    durationDays: 8,
    companions: "In famiglia",
    category: "Castelli & Highlands",
    imageUrl: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=800&q=80",
    description: "Volo MXP ➔ Edimburgo (EDI) (EasyJet U2 2685/2686). Una settimana tra il Castello di Edimburgo, la Royal Mile e i paesaggi scozzesi.",
    highlights: ["Castello di Edimburgo sulla roccia vulcanica", "Royal Mile e vicoli storici (Closes)", "Calton Hill al tramonto"]
  },
  {
    id: "trip-real-38",
    country: "Spagna",
    countryCode: "ESP",
    flag: "🇪🇸",
    continent: "Europa",
    city: "Siviglia & Andalusia",
    mainCity: "Siviglia",
    coordinates: [37.3891, -5.9845],
    startDate: "2019-08-09",
    endDate: "2019-08-26",
    durationDays: 18,
    companions: "Con amici",
    category: "Andalusia On The Road",
    imageUrl: "https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=800&q=80",
    description: "Volo BGY ➔ Siviglia San Pablo (SVQ) (Ryanair FR4635/4636). Diciotto giorni nel cuore dell'Andalusia: Real Alcázar, Plaza de España e villaggi bianchi.",
    highlights: ["Plaza de España e Parco di María Luisa", "Real Alcázar di Siviglia", "Spettacoli di Flamenco nel quartiere Triana"]
  },
  {
    id: "trip-real-39",
    country: "Regno Unito",
    countryCode: "GBR",
    flag: "🇬🇧",
    continent: "Europa",
    city: "Londra",
    mainCity: "Londra",
    coordinates: [51.5074, -0.1278],
    startDate: "2023-08-24",
    endDate: "2023-08-28",
    durationDays: 5,
    companions: "In coppia",
    category: "Capitale",
    imageUrl: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80",
    description: "Volo BGY ➔ Londra Stansted (STN) con Boeing 737 MAX 8 Ryanair (FR2697/2696). Cinque giorni nella metropoli londinese.",
    highlights: ["Passeggiata lungo il Tamigi da Southbank a Tower Bridge", "Borough Market", "British Museum"]
  },
  {
    id: "trip-real-40",
    country: "Emirati Arabi Uniti",
    countryCode: "ARE",
    flag: "🇦🇪",
    continent: "Asia",
    city: "Dubai",
    mainCity: "Dubai",
    coordinates: [25.2048, 55.2708],
    startDate: "2024-02-22",
    endDate: "2024-02-27",
    durationDays: 6,
    companions: "In viaggio con amici",
    category: "Metropoli & Deserto",
    imageUrl: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80",
    description: "Volo Milano Malpensa ➔ Dubai (DXB) a bordo dell'Airbus A380 di Emirates (EK92/91). Sei giorni tra grattacieli iconici e deserto arabo.",
    highlights: ["Volo sull'Airbus A380 Emirates", "Museum of the Future", "Palm Jumeirah e Dubai Marina"]
  },
  {
    id: "trip-real-41",
    country: "Spagna",
    countryCode: "ESP",
    flag: "🇪🇸",
    continent: "Europa",
    city: "Santiago de Compostela & La Coruña",
    mainCity: "Santiago de Compostela",
    coordinates: [42.8782, -8.5448],
    startDate: "2024-03-28",
    endDate: "2024-04-04",
    durationDays: 8,
    companions: "In solitaria",
    category: "Cammino di Santiago & Galizia",
    imageUrl: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80",
    description: "Volo MXP ➔ La Coruña (LCG) con EasyJet, rientro da Santiago de Compostela (SCQ) via Madrid con Iberia A320neo. Il fascino dell'oceano galiziano e l'arrivo alla cattedrale di Santiago.",
    highlights: ["Piazza dell'Obradoiro e Cattedrale di Santiago", "Torre di Ercole a La Coruña", "Frutti di mare galiziani"]
  },
  {
    id: "trip-real-42",
    country: "Egitto",
    countryCode: "EGY",
    flag: "🇪🇬",
    continent: "Africa",
    city: "Il Cairo",
    mainCity: "Il Cairo",
    coordinates: [30.0444, 31.2357],
    startDate: "2024-05-31",
    endDate: "2024-06-03",
    durationDays: 4,
    companions: "Con amici",
    category: "Civiltà Millenaria",
    imageUrl: "https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=800&q=80",
    description: "Volo MXP ➔ Sphinx International / Il Cairo (SPX) con Wizz Air Malta A321neo (W4 6367/6368). Le Piramidi di Giza, la Sfinge e il Museo Egizio.",
    highlights: ["Piramidi di Cheope, Chefren e Micerino", "La Grande Sfinge di Giza", "Bazar di Khan el-Khalili"]
  },
  {
    id: "trip-real-43",
    country: "Stati Uniti & Francia",
    countryCode: "USA",
    flag: "🇺🇸",
    continent: "Nord America",
    city: "Miami & Florida",
    mainCity: "Miami",
    coordinates: [25.7617, -80.1918],
    startDate: "2024-07-25",
    endDate: "2024-08-09",
    durationDays: 16,
    companions: "In famiglia",
    category: "Florida & Ocean Drive",
    imageUrl: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=800&q=80",
    description: "Rotta MXP ➔ Parigi CDG ➔ Miami International (MIA) a bordo del modernissimo Airbus A350-900 di Air France (AF92/97). Due settimane tra Miami Beach, Wynwood e le Everglades.",
    highlights: ["Ocean Drive e distretto Art Déco a South Beach", "Murales di Wynwood Walls", "Volo sull'Airbus A350 Air France"]
  },
  {
    id: "trip-real-44",
    country: "Regno Unito",
    countryCode: "GBR",
    flag: "🇬🇧",
    continent: "Europa",
    city: "Londra",
    mainCity: "Londra",
    coordinates: [51.5074, -0.1278],
    startDate: "2025-01-11",
    endDate: "2025-01-12",
    durationDays: 2,
    companions: "In solitaria",
    category: "City Break",
    imageUrl: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80",
    description: "Volo MXP ➔ Londra Gatwick (LGW) (Wizz Air A321neo W4 6301/6304). Weekend veloce nella capitale britannica.",
    highlights: ["Passeggiata a Soho e Covent Garden", "Shopping a Regent Street"]
  },
  {
    id: "trip-real-45",
    country: "Indonesia, Singapore, Malesia",
    countryCode: "IDN",
    flag: "🇮🇩",
    continent: "Asia",
    city: "Giacarta, Yogyakarta, Singapore, Kuala Lumpur, Bali",
    mainCity: "Bali",
    coordinates: [-8.3405, 115.0920],
    startDate: "2025-08-05",
    endDate: "2025-08-26",
    durationDays: 22,
    companions: "Grande Spedizione Asiatica",
    category: "Sud-Est Asiatico Grand Tour",
    imageUrl: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80",
    description: "Incredibile tour del Sud-Est Asiatico: MXP ➔ Jeddah ➔ Giacarta (Saudia 777-300ER) ➔ Yogyakarta (Borobudur, Garuda) ➔ Singapore (Scoot A321neo) ➔ Kuala Lumpur (Scoot) ➔ Bali Denpasar (AirAsia X A330) ➔ Giacarta ➔ Jeddah ➔ MXP.",
    highlights: ["Alba sul tempio millenario di Borobudur", "Marina Bay Sands e Gardens by the Bay a Singapore", "Petronas Towers a Kuala Lumpur", "Templi e risaie a terrazza di Ubud a Bali"]
  },
  {
    id: "trip-real-46",
    country: "Finlandia & Germania",
    countryCode: "FIN",
    flag: "🇫🇮",
    continent: "Europa",
    city: "Rovaniemi (Lapponia), Helsinki, Berlino",
    mainCity: "Rovaniemi",
    coordinates: [66.5039, 25.7294],
    startDate: "2025-12-25",
    endDate: "2026-01-02",
    durationDays: 9,
    companions: "In famiglia",
    category: "Natale al Circolo Polare Artico",
    imageUrl: "https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=800&q=80",
    description: "Volo natalizio BGY ➔ Helsinki (HEL) con Norwegian 737 MAX, treno/volo verso Rovaniemi (RVN) al Circolo Polare Artico, volo EasyJet su Berlino (BER) e rientro con Ryanair a Bergamo.",
    highlights: ["Villaggio di Babbo Natale a Rovaniemi", "Paesaggi artici innevati della Lapponia", "Capodanno e Porta di Brandeburgo a Berlino"]
  },
  {
    id: "trip-real-47",
    country: "Lituania & Lettonia",
    countryCode: "LTU",
    flag: "🇱🇹",
    continent: "Europa",
    city: "Vilnius & Riga",
    mainCity: "Vilnius",
    coordinates: [54.6872, 25.2797],
    startDate: "2026-03-26",
    endDate: "2026-03-30",
    durationDays: 5,
    companions: "Con amici",
    category: "Paesi Baltici On The Road",
    imageUrl: "https://images.unsplash.com/photo-1549918864-48ac978761a4?auto=format&fit=crop&w=800&q=80",
    description: "Volo BGY ➔ Vilnius (VNO) con Ryanair (FR2872), attraversamento dei Paesi Baltici e rientro da Riga (RIX) su Bergamo (FR4715). Centri storici patrimonio UNESCO.",
    highlights: ["Città vecchia barocca di Vilnius", "Quartiere Art Nouveau di Riga", "Castello sull'isola di Trakai"]
  },
  {
    id: "trip-real-48",
    country: "Italia",
    countryCode: "ITA",
    flag: "🇮🇹",
    continent: "Europa",
    city: "Cagliari & Costa Sud",
    mainCity: "Cagliari",
    coordinates: [39.2238, 9.1217],
    startDate: "2026-07-03",
    endDate: "2026-07-05",
    durationDays: 3,
    companions: "In coppia",
    category: "Mare & Weekend",
    imageUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80",
    description: "Volo MXP ➔ Cagliari Elmas (CAG) con EasyJet (U2 3567) e rientro con Ryanair (FR4562). Weekend di mare sardo.",
    highlights: ["Bastione di Saint Remy a Cagliari", "Spiaggia del Poetto", "Acque turchesi della costa"]
  },
  {
    id: "trip-real-49",
    country: "Thailandia & Corea del Sud",
    countryCode: "THA",
    countryCodes: ["THA", "KOR"],
    flag: "🇹🇭 🇰🇷",
    flags: ["🇹🇭", "🇰🇷"],
    continent: "Asia",
    city: "Bangkok, Koh Samui, Chiang Mai, Seoul",
    mainCity: "Bangkok",
    coordinates: [13.7444, 100.5558],
    startDate: "2026-08-05",
    endDate: "2026-08-28",
    durationDays: 24,
    companions: "In viaggio con amici",
    category: "Oriente, Isole Tropicali & Metropoli Asiatica",
    imageUrl: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=800&q=80",
    description: "Itinerario straordinario di 24 giorni: Volo Thai Airways da Milano Malpensa su Bangkok (BKK) con A350 e posti al ponte superiore (32J, 32K, 32L); soggiorno a Bangkok presso DAVAA Hotel Sukhumvit 11 con escursione guidata ai mercati di Maeklong e Damnoen Saduak e Corgi Café; volo Bangkok Airways su Koh Samui con soggiorno al Pure Sunset Beach Resort a Lipa Noi Beach; volo su Chiang Mai con alloggio al Moose Hotel ed escursione a Chiang Rai (Tempio Bianco e Tempio Blu); volo notturno internazionale Eastar Jet per Seoul con soggiorno all'Hotel Gracery Seoul (Sejong-daero, Jung-gu); infine voli di rientro Thai Airways da Seoul a Bangkok e rientro a Milano Malpensa.",
    highlights: [
      "Bangkok: DAVAA Hotel Sukhumvit 11, Mercato Galleggiante di Damnoen Saduak, Ferrovia di Maeklong & Corgi Café",
      "Koh Samui: Pure Sunset Beach Resort a Lipa Noi Beach, Fisherman's Village Bophut & tramonti tropicali",
      "Chiang Mai & Chiang Rai: Moose Hotel, Tempio Bianco Wat Rong Khun & Tempio Blu Wat Rong Suea Ten",
      "Seoul (Corea del Sud): Hotel Gracery Seoul, Palazzi Reali Joseon, Bukchon Hanok, Myeongdong & Gangnam"
    ]
  },
  {
    id: "trip-real-50",
    country: "Spagna",
    countryCode: "ESP",
    flag: "🇪🇸",
    continent: "Europa",
    city: "Valencia",
    mainCity: "Valencia",
    coordinates: [39.4699, -0.3763],
    startDate: "2026-09-18",
    endDate: "2026-09-20",
    durationDays: 3,
    companions: "Con amici",
    category: "Città delle Arti e delle Scienze",
    imageUrl: "https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=800&q=80",
    description: "Volo MXP ➔ Valencia (VLC) con Wizz Air A321neo (W4 6319/6414). La futuristica Città delle Arti e delle Scienze di Calatrava, il parco del Turia e la vera paella valenciana.",
    highlights: ["Città delle Arti e delle Scienze", "Giardini del Turia in bicicletta", "Paella tradizionale a El Palmar"]
  },
  {
    id: "trip-real-51",
    country: "Regno Unito",
    countryCode: "GBR",
    flag: "🇬🇧",
    continent: "Europa",
    city: "Londra",
    mainCity: "Londra",
    coordinates: [51.5074, -0.1278],
    startDate: "2026-12-04",
    endDate: "2026-12-07",
    durationDays: 4,
    companions: "In famiglia",
    category: "Weekend Natalizio in Famiglia",
    imageUrl: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80",
    description: "Volo Milano Malpensa T1 ➔ Londra Luton (LTN) con Wizz Air (W4 3111/3112, PNR WA32CY, 249,00 €). Quattro giorni pre-natalizi a Londra in famiglia: soggiorno all'Hotel Central Hoxton (PNR 55461, 477,00 €), musical 'Tina : The Tina Turner Musical' all'Aldwych Theatre (Posti Premium Seating per 3 persone, PNR L440465272, 386,75 €), mercatini sul Tamigi, luci di Natale a Regent Street e la magia di Winter Wonderland ad Hyde Park.",
    highlights: [
      "Voli Wizz Air A/R MXP ➔ Luton (2 bagagli stiva 10kg + 2 priority con 4 zaini, posti 27 A-B-C)",
      "Soggiorno di 3 notti all'Hotel Central Hoxton (84-86 Angela Street / Hoxton, Londra)",
      "Musical 'Tina : The Tina Turner Musical' all'Aldwych Theatre (Posti Premium Seating per 3 persone)",
      "Luminarie e mercatini di Natale a Covent Garden, Carnaby Street e Regent Street",
      "Magico villaggio natalizio di Winter Wonderland ad Hyde Park con pista di pattinaggio",
      "Camden Town, i canali storici di Regent's Canal e shopping su Oxford Street"
    ]
  },
  {
    id: "trip-real-52",
    country: "Cina (con Hong Kong & Macao)",
    countryCode: "CHN",
    countryCodes: ["CHN", "HKG", "MAC"],
    flag: "🇨🇳 🇭🇰 🇲🇴",
    flags: ["🇨🇳", "🇭🇰", "🇲🇴"],
    continent: "Asia",
    city: "Shanghai, Shenzhen, Hong Kong, Macao, Yangshuo, Zhangjiajie, Chongqing, Chengdu, Xi'an, Pechino",
    mainCity: "Shanghai",
    coordinates: [31.2304, 121.4737],
    startDate: "2027-07-22",
    endDate: "2027-08-16",
    durationDays: 26,
    companions: "In famiglia",
    category: "Grand Tour della Cina, Megacittà & Montagne Sacre",
    imageUrl: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=800&q=80",
    description: "Spedizione straordinaria di 26 giorni attraverso la Cina in famiglia: Voli Swiss da Malpensa via Zurigo su Shanghai; treno notturno per Shenzhen con escursioni a Hong Kong (Victoria Peak e Star Ferry) e Macao in traghetto TurboJET; treno ad alta velocità per le colline carsiche di Yangshuo e crociera sul Fiume Li; Zhangjiajie tra le vette di Avatar, ascensore Bailong e passerella di vetro a Tianmen; la metropoli cyberpunk di Chongqing e monorotaia Liziba; Chengdu con la riserva dei Panda Giganti ed escursione al Buddha Gigante di Leshan; Xi'an e l'Esercito di Terracotta; Pechino con Città Proibita e Grande Muraglia a Mutianyu; treno proiettile Fuxing a 350 km/h per Shanghai, The Bund, Giardino Yu, treno a levitazione magnetica Maglev a 430 km/h e rientro in Italia.",
    highlights: [
      "Shenzhen, Hong Kong (Victoria Peak, Star Ferry) & Macao in traghetto TurboJET",
      "Yangshuo e Fiume Li: colline carsiche in bici, zattere di bambù e Moon Hill",
      "Zhangjiajie: Montagne Hallelujah di Avatar, Ascensore Bailong e passerella di vetro a Tianmen",
      "Chongqing e Chengdu: monorotaia Liziba, hotpot del Sichuan, Panda Giganti e Buddha di Leshan",
      "Xi'an e Pechino: Esercito di Terracotta, Città Proibita e Grande Muraglia Cinese a Mutianyu",
      "Shanghai: Treno Fuxing a 350 km/h, The Bund, Giardino Yu e Treno Maglev a 430 km/h"
    ]
  },
  {
    id: "trip-real-53",
    country: "Belgio (con Lussemburgo, Francia & Svizzera)",
    countryCode: "BEL",
    countryCodes: ["BEL", "LUX", "FRA", "CHE"],
    flag: "🇧🇪 🇱🇺 🇫🇷 🇨🇭",
    flags: ["🇧🇪", "🇱🇺", "🇫🇷", "🇨🇭"],
    continent: "Europa",
    city: "Nancy, Lussemburgo, Florenville, Rochehaut, Herbeumont, Chassepierre, Wéris, Durbuy, Malmedy, Spa, Stavelot, Botrange, Han-sur-Lesse, Rochefort, La Roche-en-Ardenne, Zurigo",
    mainCity: "Malmedy",
    coordinates: [50.4262, 6.0278],
    startDate: "2026-12-26",
    endDate: "2027-01-05",
    durationDays: 11,
    companions: "In famiglia con Carla 🐾 (Jack Russell)",
    category: "Road Trip Invernale in Auto (Pet-Friendly)",
    imageUrl: "https://images.unsplash.com/photo-1548263594-a71ea65a8598?auto=format&fit=crop&w=800&q=80",
    description: "Road trip invernale e natalizio di 11 giorni (2.063 km) in famiglia con Carla (la nostra Jack Russell) a bordo della nostra auto: partenza dall'Italia con prima tappa a Nancy all'Hotel Ibis Budget (90,24 €, colazione inclusa, PIN 0142) e Place Stanislas illuminata; visita alla città-fortezza di Lussemburgo; 3 notti a Florenville/Chassepierre presso Chez Manu (345,00 €, PIN 1752) esplorando il meandro della Semois a Rochehaut, il castello medievale di Herbeumont e i dolmen di Wéris; arrivo a Durbuy e 4 notti all'insegna del Capodanno a Malmedy presso Terrasse de Malmedy (422,00 €, PIN 0787); escursioni al Circuito di Spa-Francorchamps, Abbazia di Stavelot, vetta innevata del Signal de Botrange (694m), Grotte di Han-sur-Lesse, Rochefort e castello feudale di La Roche-en-Ardenne; trasferimento in Svizzera con 2 notti a Zurigo presso VISIONAPARTMENTS Wolframplatz (355,00 €, PIN 4242) e rientro panoramico in Italia attraverso le Alpi.",
    highlights: [
      "Road trip di 11 giorni in auto (2.063 km) in famiglia con la nostra Jack Russell Carla 🐾",
      "Tappa a Nancy (Place Stanislas UNESCO) e soggiorno all'Ibis Budget Nancy Centre (PIN 0142)",
      "Centro storico e bastioni panoramici di Lussemburgo (Chemin de la Corniche)",
      "3 notti a Chez Manu a Florenville (PIN 1752), meandro della Semois a Rochehaut e castello di Herbeumont",
      "Wéris con i suoi megaliti leggendari e la città medievale più piccola del mondo a Durbuy",
      "4 notti di Capodanno a Terrasse de Malmedy (PIN 0787), Circuito di Spa-Francorchamps e Abbazia di Stavelot",
      "Escursione al Signal de Botrange (694m, vetta del Belgio), Grotte di Han-sur-Lesse e La Roche-en-Ardenne",
      "2 notti a Zurigo presso VISIONAPARTMENTS (PIN 4242) e rientro panoramico alpino in Italia"
    ]
  },
  {
    id: "trip-real-54",
    country: "Croazia e Italia",
    countryCode: "HRV",
    countryCodes: ["HRV", "ITA"],
    countries: ["Croazia", "Italia"],
    flag: "🇭🇷 🇮🇹",
    flags: ["🇭🇷", "🇮🇹"],
    continent: "Europa",
    city: "Laghi di Plitvice, Zagabria, Mestre, Trieste",
    mainCity: "Laghi di Plitvice",
    coordinates: [44.8805, 15.6161],
    startDate: "2026-05-28",
    endDate: "2026-06-02",
    durationDays: 6,
    companions: "In famiglia con Carla 🐾 (Jack Russell)",
    category: "Road Trip On The Road (Pet-Friendly)",
    status: "completed",
    imageUrl: "assets/plitvice.jpg",
    description: "Road trip di 6 giorni e 1.424 km in automobile tra Italia e Croazia in famiglia con la nostra Jack Russell Carla (3 Adulti): partenza dall'Italia con prima tappa a Mestre all'Hotel Centrale (55,91 €, PIN 3620); attraversamento verso la Croazia e soggiorno di 2 notti a Mukinje presso Apartment Near the Lake (220,00 €, PIN 7660) per esplorare le meraviglie naturalistiche del Parco Nazionale dei Laghi di Plitvice tra passerelle in legno, laghi turchesi e cascate; trasferimento nella capitale Zagabria con soggiorno a Masarykova ulica (112,97 €, PIN 5832, parcheggio gratuito); rientro in Italia con sosta a Trieste al Residence Le Terrazze (101,70 €, PIN 5478) e ritorno serale a Casa.",
    highlights: [
      "Road trip in auto di 1.424 km e 6 giorni in famiglia con la cagnolina Carla 🐾",
      "Tappa a Mestre con soggiorno all'Hotel Centrale (PIN 3620)",
      "2 notti a Mukinje (PIN 7660) ed escursione completa al Parco Nazionale dei Laghi di Plitvice",
      "Soggiorno a Zagabria in Masarykova ulica con parcheggio privato (PIN 5832)",
      "Tappa a Trieste con pernottamento al Residence Le Terrazze (PIN 5478) e rientro panoramico"
    ]
  }
];

// Travel Wish List (Partenza vuota per consentire all'utente di aggiungere le mete desiderate dal form)
const DEFAULT_BUCKET_LIST = [];

class TravelDataManager {
  constructor() {
    this.STORAGE_KEY = "giuseppe_ricatti_real_trips_v7";
    this.BUCKET_KEY = "giuseppe_ricatti_wishlist_clean";
    this.THEME_COLOR_KEY = "giuseppe_theme_color";
    this.CUSTOM_CITIES_KEY = "giuseppe_ricatti_custom_cities_v1";
    this.init();
  }

  init() {
    // Rimuove tassativamente tutte le vecchie chiavi demo e di versioni precedenti
    try {
      localStorage.removeItem("giuseppe_ricatti_trips");
      localStorage.removeItem("giuseppe_ricatti_trips_v2");
      localStorage.removeItem("giuseppe_ricatti_trips_v3");
      localStorage.removeItem("giuseppe_ricatti_trips_v4");
      localStorage.removeItem("giuseppe_ricatti_real_trips_v5");
      localStorage.removeItem("giuseppe_ricatti_real_trips_v6");
      localStorage.removeItem("giuseppe_ricatti_bucket");
      localStorage.removeItem("giuseppe_ricatti_bucket_v3");
      localStorage.removeItem("giuseppe_ricatti_bucket_v5");
      localStorage.removeItem("giuseppe_ricatti_bucket_v6");
    } catch (e) {}

    // Inizializza l'archivio con i 52 viaggi REALI dell'utente
    if (!localStorage.getItem(this.STORAGE_KEY)) {
      this.saveTrips(REAL_FLIGHT_TRIPS);
    }
    if (!localStorage.getItem(this.BUCKET_KEY)) {
      this.saveBucketList([]);
    }
  }

  // Verifica dinamica: un viaggio è in programma rispetto alla data del giorno?
  isUpcoming(trip) {
    if (!trip) return false;
    if (trip.status === "upcoming") return true;
    if (trip.status === "completed") return false;
    const today = new Date().toISOString().slice(0, 10);
    return (trip.startDate || "") > today;
  }

  getTrips() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      let trips = data ? JSON.parse(data) : REAL_FLIGHT_TRIPS;
      // Sincronizza sempre i master trips mancanti o aggiornati in localStorage (come trip-real-53 e trip-real-54)
      let needsPersist = false;
      REAL_FLIGHT_TRIPS.forEach(masterTrip => {
        const existingIdx = trips.findIndex(t => t.id === masterTrip.id);
        if (existingIdx === -1) {
          trips.push(masterTrip);
          needsPersist = true;
        } else if (masterTrip.id === "trip-real-54") {
          // Aggiorna trip-real-54 con le date 2026 e l'immagine locale dei Laghi di Plitvice
          if (trips[existingIdx].startDate !== masterTrip.startDate || trips[existingIdx].imageUrl !== masterTrip.imageUrl) {
            trips[existingIdx].startDate = masterTrip.startDate;
            trips[existingIdx].endDate = masterTrip.endDate;
            trips[existingIdx].imageUrl = masterTrip.imageUrl;
            needsPersist = true;
          }
        }
      });
      if (needsPersist) {
        try { this.saveTrips(trips); } catch (e) {}
      }
      // Preserva sempre i dati salvati e modificati dall'utente in localStorage.
      // Usa i dati master solo per aggiungere eventuali proprietà tecniche mancanti.
      return trips.map(t => {
        const master = REAL_FLIGHT_TRIPS.find(m => m.id === t.id);
        if (master) {
          if (!t.flag) t.flag = master.flag;
          if (!t.flags || t.flags.length === 0) t.flags = master.flags || [master.flag];
          if (!t.country) t.country = master.country;
          if (!t.countryCodes || t.countryCodes.length === 0) t.countryCodes = master.countryCodes || [master.countryCode];
          if (!t.continent) t.continent = master.continent;
          if (!t.coordinates || t.coordinates.length === 0) t.coordinates = master.coordinates;
          if (!t.category) t.category = master.category;
          if (t.id === "trip-real-54") {
            t.startDate = master.startDate;
            t.endDate = master.endDate;
            t.imageUrl = master.imageUrl;
          } else if (!t.imageUrl) {
            t.imageUrl = master.imageUrl;
          }
        }
        if (!t.countryCodes || !Array.isArray(t.countryCodes) || t.countryCodes.length === 0) {
          t.countryCodes = t.countryCode ? [t.countryCode] : [];
        }
        if (!t.countries || !Array.isArray(t.countries) || t.countries.length === 0) {
          t.countries = t.country ? t.country.split(/[,&/+]|\be\b|\band\b/i).map(c => c.trim()).filter(Boolean) : [];
        }
        // Risincronizzazione autonoma bandierine se la scheda contiene più nazioni (es. Spagna e Portogallo)
        if (window.extractFlagsFromCountryString && t.country) {
          const autoExt = window.extractFlagsFromCountryString(t.country);
          if (autoExt.flagsArray && autoExt.flagsArray.length > (t.flags ? t.flags.length : 0)) {
            t.flags = autoExt.flagsArray;
            t.flag = autoExt.flagsString;
          }
        }
        return t;
      });
    } catch (e) {
      console.error("Errore lettura viaggi:", e);
      return REAL_FLIGHT_TRIPS;
    }
  }

  // Viaggi già effettuati ordinati dal più recente al meno recente (discendente)
  getPastTrips() {
    const trips = this.getTrips().filter(t => !this.isUpcoming(t));
    return trips.sort((a, b) => {
      const dateA = new Date(a.startDate || "1970-01-01").getTime();
      const dateB = new Date(b.startDate || "1970-01-01").getTime();
      return dateB - dateA;
    });
  }

  // Viaggi già in programma ordinati dal prossimo all'ultimo in programma (ascendente)
  getUpcomingTrips() {
    const trips = this.getTrips().filter(t => this.isUpcoming(t));
    return trips.sort((a, b) => {
      const dateA = new Date(a.startDate || "2099-01-01").getTime();
      const dateB = new Date(b.startDate || "2099-01-01").getTime();
      return dateA - dateB;
    });
  }

  // Cerca un viaggio specifico per ID
  getTripById(tripId) {
    if (!tripId) return null;
    const trips = this.getTrips();
    return trips.find(t => t.id === tripId) || null;
  }

  saveTrips(trips) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(trips));
  }

  clearAllTrips() {
    this.saveTrips([]);
  }

  addTrip(tripData) {
    const trips = this.getTrips();
    const newTrip = {
      id: "trip-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
      ...tripData
    };
    trips.unshift(newTrip);
    this.saveTrips(trips);
    return newTrip;
  }

  updateTrip(tripId, updatedData) {
    const trips = this.getTrips();
    const index = trips.findIndex(t => t.id === tripId);
    if (index !== -1) {
      // Se updatedData include un paese con nazioni multiple (es. Spagna e Portogallo), aggiorna in autonomia flags e countries
      if (updatedData.country && window.extractFlagsFromCountryString) {
        const auto = window.extractFlagsFromCountryString(updatedData.country);
        if (auto.flagsArray && auto.flagsArray.length > 1) {
          if (!updatedData.flags || updatedData.flags.length < auto.flagsArray.length) {
            updatedData.flags = auto.flagsArray;
          }
          if (!updatedData.flag || updatedData.flag === "📍" || updatedData.flag.length < auto.flagsString.length) {
            updatedData.flag = auto.flagsString;
          }
          if (!updatedData.countries || updatedData.countries.length < auto.flagsArray.length) {
            updatedData.countries = updatedData.country.split(/[,&/+]|\be\b|\band\b/i).map(s => s.trim()).filter(Boolean);
          }
        }
      }
      trips[index] = {
        ...trips[index],
        ...updatedData,
        id: tripId
      };
      this.saveTrips(trips);
      return trips[index];
    }
    return null;
  }

  deleteTrip(tripId) {
    const trips = this.getTrips().filter(t => t.id !== tripId);
    this.saveTrips(trips);
    return trips;
  }

  // Statistiche separate per viaggi effettuati e in programma
  getStats() {
    const allTrips = this.getTrips();
    const pastTrips = allTrips.filter(t => !this.isUpcoming(t));
    const upcomingTrips = allTrips.filter(t => this.isUpcoming(t));

    const visitedCountries = new Set();
    const upcomingCountries = new Set();
    const uniqueContinents = new Set();
    let totalDays = 0;
    const citiesSet = new Set();

    // 1. Includi i 49 Paesi Ufficiali Certificati da TripAdvisor (UccelloGiraviti)
    if (typeof window !== "undefined" && Array.isArray(window.TRIPADVISOR_COUNTRIES_LIST)) {
      window.TRIPADVISOR_COUNTRIES_LIST.forEach(c => {
        if (c.code) visitedCountries.add(c.code.toUpperCase().trim());
        if (c.continent) {
          uniqueContinents.add(c.continent);
        }
      });
    }

    // 2. Includi le 755 Città Ufficiali da TripAdvisor
    if (typeof window !== "undefined" && Array.isArray(window.TRIPADVISOR_CITIES)) {
      window.TRIPADVISOR_CITIES.forEach(c => {
        citiesSet.add(c.name.trim());
      });
    }

    // 3. Integra i dati dai viaggi passati
    pastTrips.forEach(t => {
      const codes = (t.countryCodes && t.countryCodes.length > 0) ? t.countryCodes : [t.countryCode];
      codes.forEach(c => { if (c) visitedCountries.add(c.toUpperCase().trim()); });
      if (t.continent) uniqueContinents.add(t.continent);
      if (t.durationDays) totalDays += Number(t.durationDays);
      if (t.mainCity) citiesSet.add(t.mainCity.trim());
      else if (t.city) {
        t.city.split(",").forEach(c => citiesSet.add(c.trim()));
      }
    });

    // 4. Paesi e città dei viaggi in programma (futuri)
    upcomingTrips.forEach(t => {
      const codes = (t.countryCodes && t.countryCodes.length > 0) ? t.countryCodes : [t.countryCode];
      codes.forEach(c => {
        const upCode = c ? c.toUpperCase().trim() : "";
        if (upCode && !visitedCountries.has(upCode)) {
          upcomingCountries.add(upCode);
        }
      });
    });

    const totalWorldCountries = 195;
    const countriesCount = visitedCountries.size > 0 ? visitedCountries.size : 49;
    const percentage = ((countriesCount / totalWorldCountries) * 100).toFixed(1);
    const computedCities = this.getCities();

    return {
      tripsCount: allTrips.length,
      pastTripsCount: pastTrips.length,
      upcomingTripsCount: upcomingTrips.length,
      countriesCount: countriesCount,
      upcomingCountriesCount: upcomingCountries.size,
      continentsCount: Math.min(6, Math.max(6, uniqueContinents.size)),
      citiesCount: computedCities.length,
      totalDays,
      worldPercentage: percentage
    };
  }

  // Estrazione e raggruppamento dinamico di tutte le città visitate
  // Unisce le 755 città di TripAdvisor con eventuali nuove città create o rimosse tramite le schede viaggio
  getCities() {
    const cityMap = new Map();

    // 1. Inizializza con l'archivio completo di TripAdvisor se presente (755 città)
    if (typeof window !== "undefined" && Array.isArray(window.TRIPADVISOR_CITIES)) {
      window.TRIPADVISOR_CITIES.forEach(c => {
        if (!c || !c.name) return;
        const key = c.name.toLowerCase().trim();
        cityMap.set(key, { ...c });
      });
    }

    // 2. Integra reattivamente con i viaggi registrati (sia passati che futuri)
    const allTrips = this.getTrips();
    allTrips.forEach(trip => {
      const isUp = this.isUpcoming(trip);
      const year = trip.startDate ? trip.startDate.slice(0, 4) : "";
      const cityList = trip.city ? trip.city.split(",").map(c => c.trim()).filter(Boolean) : [trip.mainCity];

      cityList.forEach(cityName => {
        if (!cityName) return;
        const key = cityName.toLowerCase().trim();
        const meta = (typeof KNOWN_CITY_META !== "undefined" && KNOWN_CITY_META[cityName])
          ? KNOWN_CITY_META[cityName]
          : ((typeof window !== "undefined" && window.KNOWN_CITY_META && window.KNOWN_CITY_META[cityName]) ? window.KNOWN_CITY_META[cityName] : null);

        if (!cityMap.has(key)) {
          let coords = null;
          let specificCountry = trip.country;
          let specificCountryCode = trip.countryCode;
          let specificFlag = trip.flag || "📍";
          let specificContinent = trip.continent || "Europa";

          if (meta) {
            coords = meta.coords;
            specificCountry = meta.country;
            specificCountryCode = meta.countryCode;
            specificFlag = meta.flag;
            specificContinent = meta.continent;
          } else if (typeof CITY_COORDINATES !== "undefined" && CITY_COORDINATES[cityName]) {
            coords = CITY_COORDINATES[cityName];
          } else if (typeof window !== "undefined" && window.CITY_COORDINATES && window.CITY_COORDINATES[cityName]) {
            coords = window.CITY_COORDINATES[cityName];
          } else if (trip.coordinates && trip.coordinates.length === 2) {
            coords = trip.coordinates;
          }

          cityMap.set(key, {
            id: `city-custom-${key}`,
            name: cityName,
            country: specificCountry,
            countryCode: specificCountryCode,
            region: "",
            flag: specificFlag,
            continent: specificContinent,
            coordinates: coords,
            contributions: 0,
            status: isUp ? "In Programma" : "Ci sono stato",
            isFavorite: false,
            isUpcomingOnly: isUp,
            hasPastVisit: !isUp,
            tripIds: [trip.id],
            trips: [trip]
          });
        } else {
          const rec = cityMap.get(key);
          if (!rec.trips) rec.trips = [];
          if (!rec.tripIds) rec.tripIds = [];
          rec.trips.push(trip);
          rec.tripIds.push(trip.id);
          if (meta && (!rec.coordinates || (rec.coordinates[0] === 0 && rec.coordinates[1] === 0))) {
            rec.coordinates = meta.coords;
          }
          if (meta && (!rec.countryCode || rec.countryCode === "WLD")) {
            rec.countryCode = meta.countryCode;
            rec.flag = meta.flag;
          }
          if (!isUp) {
            rec.hasPastVisit = true;
            rec.isUpcomingOnly = false;
            rec.status = "Ci sono stato";
          }
        }
      });
    });

    // 3. Applica personalizzazioni, note, foto e valutazioni dell'utente
    const customMap = this.getCustomCities();
    if (customMap && typeof customMap === "object") {
      Object.keys(customMap).forEach(k => {
        const custom = customMap[k];
        if (!custom) return;
        if (cityMap.has(k)) {
          const c = cityMap.get(k);
          if (custom.notes) c.notes = custom.notes;
          if (typeof custom.rating !== "undefined" && custom.rating !== null) {
            c.rating = parseInt(custom.rating, 10);
          }
          if (custom.imageUrl) c.imageUrl = custom.imageUrl;
          if (custom.customStatus || custom.status) {
            c.customStatus = custom.customStatus || custom.status;
            c.status = c.customStatus;
          }
          if (custom.years) {
            c.years = Array.isArray(custom.years) ? custom.years : [custom.years];
          }
          if (custom.favoriteAttractions) c.favoriteAttractions = custom.favoriteAttractions;
          if (typeof custom.isFavorite === "boolean") c.isFavorite = custom.isFavorite;
          c.hasCustomData = true;
        } else if (custom.name) {
          // Città aggiunta direttamente dall'utente
          cityMap.set(k, {
            id: `city-custom-${k}`,
            name: custom.name,
            country: custom.country || "Mondo",
            region: custom.region || "",
            flag: custom.flag || "📍",
            continent: custom.continent || "Europa",
            coordinates: custom.coordinates || [0, 0],
            status: custom.status || "✅ Ci sono stato",
            customStatus: custom.status || "✅ Ci sono stato",
            notes: custom.notes || "",
            rating: parseInt(custom.rating, 10) || 0,
            imageUrl: custom.imageUrl || "",
            years: Array.isArray(custom.years) ? custom.years : (custom.years ? [custom.years] : []),
            favoriteAttractions: custom.favoriteAttractions || "",
            isFavorite: !!custom.isFavorite,
            hasCustomData: true
          });
        }
      });
    }

    const list = Array.from(cityMap.values());
    // Ordina: prima le città preferite, poi per contributi decrescenti, poi alfabeticamente
    return list.sort((a, b) => {
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;
      if ((b.contributions || 0) !== (a.contributions || 0)) {
        return (b.contributions || 0) - (a.contributions || 0);
      }
      return (a.name || "").localeCompare(b.name || "", 'it');
    });
  }

  // Metodi per gestione singole città personalizzate con note, foto e valutazioni
  getCustomCities() {
    try {
      const data = localStorage.getItem(this.CUSTOM_CITIES_KEY);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      return {};
    }
  }

  saveCustomCities(map) {
    localStorage.setItem(this.CUSTOM_CITIES_KEY, JSON.stringify(map));
  }

  getCustomCity(cityName) {
    if (!cityName) return null;
    const map = this.getCustomCities();
    return map[cityName.toLowerCase().trim()] || null;
  }

  saveCustomCity(cityName, cityData) {
    if (!cityName) return null;
    const map = this.getCustomCities();
    const key = cityName.toLowerCase().trim();
    map[key] = {
      ...(map[key] || {}),
      ...cityData,
      name: cityName,
      updatedAt: new Date().toISOString()
    };
    this.saveCustomCities(map);
    return map[key];
  }

  deleteCustomCity(cityName) {
    if (!cityName) return;
    const map = this.getCustomCities();
    const key = cityName.toLowerCase().trim();
    if (map[key]) {
      delete map[key];
      this.saveCustomCities(map);
    }
  }

  // Gestione Travel Wish List ("Cosa Voglio Fare")
  getBucketList() {
    try {
      const data = localStorage.getItem(this.BUCKET_KEY);
      return data ? JSON.parse(data) : DEFAULT_BUCKET_LIST;
    } catch (e) {
      return DEFAULT_BUCKET_LIST;
    }
  }

  saveBucketList(list) {
    localStorage.setItem(this.BUCKET_KEY, JSON.stringify(list));
  }

  addBucketItem(item) {
    const list = this.getBucketList();
    const newItem = {
      id: "bucket-" + Date.now(),
      ...item
    };
    list.unshift(newItem);
    this.saveBucketList(list);
    return newItem;
  }

  deleteBucketItem(id) {
    const list = this.getBucketList().filter(b => b.id !== id);
    this.saveBucketList(list);
    return list;
  }

  // Estrazione ordinata e strutturata dei Paesi Visitati con continente e statistiche
  getVisitedCountriesList() {
    const map = new Map();
    const cities = this.getCities();

    // 1. Paesi ufficiali da TripAdvisor
    if (typeof window !== "undefined" && Array.isArray(window.TRIPADVISOR_COUNTRIES_LIST)) {
      window.TRIPADVISOR_COUNTRIES_LIST.forEach(c => {
        if (!c || !c.code) return;
        const code = c.code.toUpperCase().trim();
        const cont = c.continent || "Europa";
        map.set(code, {
          name: c.name,
          code: code,
          flag: c.flag || (window.getCountryFlagByName ? window.getCountryFlagByName(c.name) : "📍") || "📍",
          continent: cont,
          citiesCount: 0,
          tripsCount: 0
        });
      });
    }

    // 2. Integra paesi da viaggi passati
    const pastTrips = this.getPastTrips();
    pastTrips.forEach(t => {
      const codes = (t.countryCodes && t.countryCodes.length > 0) ? t.countryCodes : [t.countryCode];
      codes.forEach(cCode => {
        if (!cCode) return;
        const code = cCode.toUpperCase().trim();
        if (!map.has(code)) {
          const cont = t.continent || "Europa";
          map.set(code, {
            name: t.country || code,
            code: code,
            flag: t.flag || (window.getCountryFlagByName ? window.getCountryFlagByName(t.country) : "📍") || "📍",
            continent: cont,
            citiesCount: 0,
            tripsCount: 1
          });
        } else {
          map.get(code).tripsCount++;
        }
      });
    });

    // 3. Associa conteggio città reali visitate in ciascun paese
    cities.forEach(city => {
      if (!city.hasPastVisit && city.isUpcomingOnly) return;
      const cName = (city.country || "").toLowerCase().trim();
      for (const item of map.values()) {
        if (item.name.toLowerCase().trim() === cName || (city.countryCode && city.countryCode.toUpperCase() === item.code)) {
          item.citiesCount++;
          break;
        }
      }
    });

    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name, 'it'));
  }

  // Ripartizione continentale sui 7 continenti mondiali (6 visitati colorati, 1 non visitato neutro)
  getContinentalBreakdown() {
    const visited = this.getVisitedCountriesList();
    const continents = [
      {
        id: "Europa",
        name: "Europa",
        ringName: "Cerchio Blu",
        olympicColor: "#0081C8",
        olympicColorBorder: "#38BDF8",
        totalCountries: 44,
        icon: "🇪🇺",
        desc: "Il cuore storico e culla culturale delle esplorazioni, ricco di capitali e borghi millenari"
      },
      {
        id: "Asia",
        name: "Asia",
        ringName: "Cerchio Giallo",
        olympicColor: "#FCB131",
        olympicColorBorder: "#FDE047",
        totalCountries: 48,
        icon: "⛩️",
        desc: "Dall'Estremo Oriente alle metropoli ultramoderne, santuari imperiali e isole tropicali"
      },
      {
        id: "Africa",
        name: "Africa",
        ringName: "Cerchio Nero",
        olympicColor: "#1E293B",
        olympicColorBorder: "#94A3B8",
        totalCountries: 54,
        icon: "🦁",
        desc: "Terre sconfinate, dune sahariane, oasi imperiali e meraviglie archeologiche millenarie"
      },
      {
        id: "Nord America",
        name: "Nord America",
        ringName: "Cerchio Rosso",
        olympicColor: "#EE334E",
        olympicColorBorder: "#F87171",
        totalCountries: 23,
        icon: "🗽",
        desc: "Dai parchi nazionali e metropoli cosmopolite alle civiltà Maya e le coste caraibiche"
      },
      {
        id: "Sud America",
        name: "Sud America",
        ringName: "Cerchio Arancione",
        olympicColor: "#F97316",
        olympicColorBorder: "#FB923C",
        totalCountries: 12,
        icon: "🌴",
        desc: "Foreste pluviali, spiagge atlantiche leggendarie, ritmo carioca e metropoli vibranti"
      },
      {
        id: "Oceania",
        name: "Oceania",
        ringName: "Cerchio Verde",
        olympicColor: "#00A651",
        olympicColorBorder: "#4ADE80",
        totalCountries: 14,
        icon: "🦘",
        desc: "Le terre australi del Pacifico, grandi barriere coralline, outback e baie oceaniche"
      },
      {
        id: "Antartide",
        name: "Antartide",
        ringName: "Incolore / Neutro",
        olympicColor: "#334155",
        olympicColorBorder: "rgba(255, 255, 255, 0.15)",
        totalCountries: 0,
        icon: "🧊",
        desc: "L'estremo continente polare dei ghiacci perenni, terra disabitata non ancora esplorata",
        isVisited: false
      }
    ];

    const cities = this.getCities();

    return continents.map(c => {
      const cVisitedCountries = visited.filter(v => v.continent === c.name);
      const cCities = cities.filter(city => {
        if (c.name === "Oceania") {
          return city.continent === "Oceania" || city.continent === "Australia";
        }
        return city.continent === c.name;
      });
      const isVisited = cVisitedCountries.length > 0;
      const percentage = c.totalCountries > 0 
        ? ((cVisitedCountries.length / c.totalCountries) * 100).toFixed(1)
        : "0.0";

      return {
        ...c,
        isVisited: isVisited,
        visitedCountriesCount: cVisitedCountries.length,
        visitedCountries: cVisitedCountries,
        citiesCount: cCities.length,
        percentage: percentage
      };
    });
  }

  // Estrazione di tutti i Paesi del Mondo non ancora visitati (146 stati sovrani su 195)
  getUnvisitedCountriesList() {
    const visited = this.getVisitedCountriesList();
    const visitedCodes = new Set(visited.map(v => v.code.toUpperCase()));
    const visitedNames = new Set(visited.map(v => v.name.toLowerCase().trim()));

    const allCountries = (typeof window !== "undefined" && Array.isArray(window.ALL_SOVEREIGN_COUNTRIES))
      ? window.ALL_SOVEREIGN_COUNTRIES
      : [];

    return allCountries
      .filter(c => !visitedCodes.has(c.code.toUpperCase()) && !visitedNames.has(c.name.toLowerCase().trim()))
      .map(c => ({
        ...c,
        isVisited: false
      }))
      .sort((a, b) => a.name.localeCompare(b.name, 'it'));
  }

  // Ripartizione continentale dei paesi non ancora visitati, con declinazione e subtotale Americhe
  getUnvisitedContinentalBreakdown() {
    const breakdown = this.getContinentalBreakdown();
    const unvisited = this.getUnvisitedCountriesList();

    const continents = breakdown.map(b => {
      const cUnvisited = unvisited.filter(u => u.continent === b.name);
      const unvisitedCount = b.totalCountries - b.visitedCountriesCount;
      const unvisitedPercentage = b.totalCountries > 0
        ? ((unvisitedCount / b.totalCountries) * 100).toFixed(1)
        : "0.0";

      return {
        ...b,
        unvisitedCount: Math.max(0, unvisitedCount),
        unvisitedPercentage: unvisitedPercentage,
        unvisitedCountries: cUnvisited
      };
    });

    // Subtotale speciale nazioni americane (Nord America + Sud America)
    const northAm = continents.find(c => c.name === "Nord America") || { totalCountries: 23, visitedCountriesCount: 5, unvisitedCount: 18 };
    const southAm = continents.find(c => c.name === "Sud America") || { totalCountries: 12, visitedCountriesCount: 1, unvisitedCount: 11 };
    
    const americheTotal = northAm.totalCountries + southAm.totalCountries; // 35
    const americheVisited = northAm.visitedCountriesCount + southAm.visitedCountriesCount; // 6
    const americheUnvisited = northAm.unvisitedCount + southAm.unvisitedCount; // 29
    const americheVisitedPct = ((americheVisited / americheTotal) * 100).toFixed(1); // 17.1%
    const americheUnvisitedPct = ((americheUnvisited / americheTotal) * 100).toFixed(1); // 82.9%

    const americheSubTotal = {
      name: "Americhe",
      icon: "🌎",
      totalCountries: americheTotal,
      visitedCountriesCount: americheVisited,
      unvisitedCount: americheUnvisited,
      visitedPercentage: americheVisitedPct,
      unvisitedPercentage: americheUnvisitedPct,
      northAmerica: {
        name: "Nord America",
        total: northAm.totalCountries,
        visited: northAm.visitedCountriesCount,
        unvisited: northAm.unvisitedCount,
        visitedPercentage: ((northAm.visitedCountriesCount / northAm.totalCountries) * 100).toFixed(1),
        unvisitedPercentage: ((northAm.unvisitedCount / northAm.totalCountries) * 100).toFixed(1),
        countries: unvisited.filter(u => u.continent === "Nord America")
      },
      southAmerica: {
        name: "Sud America",
        total: southAm.totalCountries,
        visited: southAm.visitedCountriesCount,
        unvisited: southAm.unvisitedCount,
        visitedPercentage: ((southAm.visitedCountriesCount / southAm.totalCountries) * 100).toFixed(1),
        unvisitedPercentage: ((southAm.unvisitedCount / southAm.totalCountries) * 100).toFixed(1),
        countries: unvisited.filter(u => u.continent === "Sud America")
      }
    };

    return {
      continents: continents,
      americheSubTotal: americheSubTotal,
      totalWorldSovereign: 195,
      totalVisited: 49,
      totalUnvisited: 146,
      worldUnvisitedPercentage: "74.9",
      worldVisitedPercentage: "25.1"
    };
  }

  // Declinazione e Sub-totale specifico dei 50 Stati degli Stati Uniti d'America (USA)
  getUSAStatesBreakdown() {
    const rawData = (typeof window !== "undefined" && Array.isArray(window.USA_STATES_DATA))
      ? window.USA_STATES_DATA
      : [];

    const statesOnly = rawData.filter(s => !s.isDistrict);
    const visited = statesOnly.filter(s => s.visited);
    const unvisited = statesOnly.filter(s => !s.visited);
    const dc = rawData.find(s => s.isDistrict);

    const total = statesOnly.length; // 50
    const visitedCount = visited.length; // 17
    const unvisitedCount = unvisited.length; // 33
    const visitedPct = ((visitedCount / total) * 100).toFixed(1); // 34.0%
    const unvisitedPct = ((unvisitedCount / total) * 100).toFixed(1); // 66.0%

    return {
      countryName: "Stati Uniti d'America",
      totalStates: total,
      visitedCount: visitedCount,
      unvisitedCount: unvisitedCount,
      visitedPercentage: visitedPct,
      unvisitedPercentage: unvisitedPct,
      visitedStates: visited,
      unvisitedStates: unvisited,
      districtOfColumbia: dc,
      totalCitiesInUSA: 67
    };
  }



  exportData() {
    const exportObj = {
      version: "4.0",
      exportDate: new Date().toISOString(),
      author: "Giuseppe Ricatti",
      trips: this.getTrips(),
      bucketList: this.getBucketList()
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `viaggi_giuseppe_ricatti_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }
}

// Istanza globale esportata
window.TravelDataManager = TravelDataManager;
window.travelManager = new TravelDataManager();
