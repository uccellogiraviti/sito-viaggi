/**
 * app.js - Controller Principale dell'Applicazione
 * Creato per il sito web personale di Giuseppe Ricatti
 * 
 * Funzionalità:
 * 1. Modifica ed Eliminazione Tappe affidabile (risolve completamente il problema della modifica schede)
 * 2. Controllo dinamico Viaggi in Programma vs Viaggi Effettuati in base alla data odierna
 * 3. Sezioni dedicate e ordinate:
 *    - Viaggi in Programma: ordinati dal prossimo all'ultimo in programma (ascendente)
 *    - Viaggi Effettuati: ordinati dal più recente al meno recente (discendente)
 * 4. Selettore Multi-Paese (consente di selezionare e colorare più nazioni per singola tappa)
 * 5. Sezione dedicata "Città Esplorate & Toccate" con ricerca e posizionamento su mappa
 * 6. Sezione e Gestione completa "Travel Wish List (Cosa Voglio Fare)"
 * 7. Importatore automatico da Flighty (CSV) e TripAdvisor
 */

if (typeof window === "undefined") { var window = typeof globalThis !== "undefined" ? globalThis : this; }

class TravelApp {
  constructor() {
    this.currentFilters = {
      search: "",
      year: "all",
      continent: "all",
      companion: "all",
      category: "all",
      sort: "smart"
    };
    this.currentGalleryTab = "all"; // "all" | "upcoming" | "past"
    this.currentCitiesFilter = {
      search: "",
      continent: "all"
    };
    this.editingTripId = null;
    this.currentTheme = "amber";
    this.selectedCountries = []; // Array di { name, code, flag, continent }
    this.citiesDisplayLimit = 60;
    this.currentHomeZone = "all"; // Filtro zone archivio passati in home
  }

  switchHomeZone(zoneName) {
    this.currentHomeZone = zoneName;
    const tabsContainer = document.getElementById("home-zone-tabs");
    if (tabsContainer) {
      tabsContainer.querySelectorAll(".gallery-tab-btn").forEach(btn => {
        btn.classList.toggle("active", btn.getAttribute("data-zone") === zoneName);
      });
    }
    this.renderHomeDirectories();
  }

  init() {
    // 0. Tema Colore
    this.initTheme();

    // 1. Mappa Leaflet (se presente nella pagina)
    if (window.travelMap) {
      window.travelMap.init();
    }

    // 2. Multi-Country Picker
    this.initMultiCountryPicker();

    // 3. Statistiche con animazione
    this.renderStats();

    // 4. Popola filtri per anni
    this.populateFilterOptions();

    // 5. Gestione parametri URL (?anno=..., ?area=..., ?tab=..., ?cerca=...)
    this.handleUrlParameters();

    // 6. Renderizza Hub Directory nella Home (per anni e per aree geografiche)
    this.renderHomeDirectories();

    // 7. Renderizza Galleria Viaggi (se presente in pagina)
    this.renderGallery();

    // 8. Renderizza Sezione Città Visitate (se presente in pagina)
    this.renderCitiesSection();

    // 9. Renderizza Travel Wish List (se presente in pagina)
    this.renderBucketList();

    // 10. Event Listener
    this.setupEventListeners();

    // 11. Gestione Header dinamico allo scroll
    this.handleScrollNavbar();
  }

  // ==========================================================================
  // TEMA COLORE DINAMICO (ZERO VERDE)
  // ==========================================================================
  initTheme() {
    const savedTheme = localStorage.getItem("giuseppe_theme") || "amber";
    this.setTheme(savedTheme, false);
  }

  setTheme(themeName, shouldRefreshMap = true) {
    this.currentTheme = themeName;
    try {
      localStorage.setItem("giuseppe_theme", themeName);
    } catch (e) {}

    document.body.classList.remove("theme-sapphire", "theme-platinum", "theme-terracotta");
    if (themeName !== "amber") {
      document.body.classList.add(`theme-${themeName}`);
    }

    document.querySelectorAll(".theme-dot").forEach(dot => {
      dot.classList.toggle("active", dot.dataset.theme === themeName);
    });

    if (shouldRefreshMap && window.travelMap) {
      setTimeout(() => {
        window.travelMap.refreshMap();
      }, 50);
    }
  }

  // ==========================================================================
  // STATISTICHE & CONTATORI
  // ==========================================================================
  animateCounter(elementId, targetValue, isDecimal = false, suffix = "") {
    const el = document.getElementById(elementId);
    if (!el) return;

    const duration = 1000;
    const startTime = performance.now();
    const endValue = parseFloat(targetValue);

    const update = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 4);
      const current = isDecimal 
        ? (endValue * ease).toFixed(1) 
        : Math.round(endValue * ease);

      el.textContent = current + suffix;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = targetValue + suffix;
      }
    };
    requestAnimationFrame(update);
  }

  renderStats() {
    if (!window.travelManager) return;
    const stats = window.travelManager.getStats();

    this.animateCounter("stat-countries", stats.countriesCount);
    this.animateCounter("stat-percentage", stats.worldPercentage, true, "%");
    this.animateCounter("stat-cities", stats.citiesCount);
    this.animateCounter("stat-trips", stats.pastTripsCount);
    this.animateCounter("stat-upcoming", stats.upcomingTripsCount);
    this.animateCounter("stat-continents", stats.continentsCount, false, " / 7");

    const mapBadge = document.getElementById("map-stat-badge");
    if (mapBadge) {
      mapBadge.textContent = `${stats.countriesCount} Nazioni • ${stats.citiesCount} Città Esplorate • ${stats.upcomingTripsCount} in Programma`;
    }

    // Aggiorna dinamicamente i conteggi città tra parentesi per ciascun continente
    this.updateContinentCounts();
  }

  // ==========================================================================
  // CONTEGGIO CITTÀ DINAMICO PER CONTINENTE TRA PARENTESI
  // Aggiornato in tempo reale ad ogni aggiunta, modifica o eliminazione
  // ==========================================================================
  updateContinentCounts() {
    if (!window.travelManager) return;
    const cities = window.travelManager.getCities();

    const counts = {
      all: cities.length,
      Europa: 0,
      Asia: 0,
      Americhe: 0,
      Africa: 0,
      Oceania: 0
    };

    cities.forEach(c => {
      const cont = c.continent || "";
      if (cont === "Europa") {
        counts.Europa++;
      } else if (cont === "Asia") {
        counts.Asia++;
      } else if (cont === "Americhe" || cont === "Nord America" || cont === "Sud America") {
        counts.Americhe++;
      } else if (cont === "Africa") {
        counts.Africa++;
      } else if (cont === "Oceania" || cont === "Australia") {
        counts.Oceania++;
      }
    });

    const continentLabels = {
      all: "Tutti",
      Europa: "Europa",
      Asia: "Asia",
      Americhe: "Americhe",
      Africa: "Africa",
      Oceania: "Oceania"
    };

    // 1. Aggiorna i bottoni filtri nella barra della mappa (#map-continent-filters)
    const mapFilters = document.getElementById("map-continent-filters");
    if (mapFilters) {
      mapFilters.querySelectorAll(".continent-btn").forEach(btn => {
        const key = btn.getAttribute("data-continent");
        if (key && counts[key] !== undefined) {
          const baseName = continentLabels[key] || key;
          btn.textContent = `${baseName} (${counts[key]})`;
        }
      });
    }

    // 2. Aggiorna i bottoni filtri nella sezione Città Visitate (#cities-continent-filters)
    const citiesFilters = document.getElementById("cities-continent-filters");
    if (citiesFilters) {
      citiesFilters.querySelectorAll(".continent-btn").forEach(btn => {
        const key = btn.getAttribute("data-continent");
        if (key && counts[key] !== undefined) {
          const baseName = continentLabels[key] || key;
          btn.textContent = `${baseName} (${counts[key]})`;
        }
      });
    }

    // 3. Aggiorna l'etichetta Continenti nella dashboard delle statistiche (senza città tra parentesi)
    const contLabel = document.getElementById("stat-continents-label");
    if (contLabel) {
      contLabel.textContent = "Continenti";
    }
  }

  populateFilterOptions() {
    if (!window.travelManager) return;
    const trips = window.travelManager.getTrips();
    const yearSelect = document.getElementById("filter-year");
    if (!yearSelect) return;

    const years = new Set();
    trips.forEach(t => {
      if (t.startDate) {
        const y = new Date(t.startDate).getFullYear();
        if (!isNaN(y)) years.add(y);
      }
    });

    const sortedYears = Array.from(years).sort((a, b) => b - a);
    let optionsHtml = '<option value="all">Tutti gli anni</option>';
    sortedYears.forEach(y => {
      const selected = (this.currentFilters.year === String(y)) ? 'selected' : '';
      optionsHtml += `<option value="${y}" ${selected}>${y}</option>`;
    });
    yearSelect.innerHTML = optionsHtml;

    const contSelect = document.getElementById("filter-continent");
    if (contSelect && this.currentFilters.continent !== "all") {
      contSelect.value = this.currentFilters.continent;
    }
  }

  // ==========================================================================
  // GESTIONE PARAMETRI URL MULTI-PAGINA (?anno=..., ?area=..., ?cerca=...)
  // ==========================================================================
  handleUrlParameters() {
    try {
      const params = new URLSearchParams(window.location.search);

      // 1. Filtro Anno per viaggi.html (es. viaggi.html?anno=2024)
      if (params.has("anno")) {
        const year = params.get("anno");
        this.currentFilters.year = year;
        const yearSelect = document.getElementById("filter-year");
        if (yearSelect) yearSelect.value = year;
        this.showActiveFilterBanner(`Anno ${year}`);
      }

      // 2. Filtro Area Geografica per viaggi.html e citta.html (es. viaggi.html?area=Asia)
      if (params.has("area")) {
        const area = params.get("area");
        this.currentFilters.continent = area;
        const contSelect = document.getElementById("filter-continent");
        if (contSelect) contSelect.value = area;

        this.currentCitiesFilter.continent = area;
        const parent = document.getElementById("cities-continent-filters");
        if (parent) {
          parent.querySelectorAll(".continent-btn").forEach(b => {
            b.classList.toggle("active", b.getAttribute("data-continent") === area);
          });
        }
        this.showActiveFilterBanner(`Area Geografica: ${area}`);
      }

      // 3. Filtro Tab (es. viaggi.html?tab=upcoming)
      if (params.has("tab")) {
        const tab = params.get("tab");
        if (["all", "upcoming", "past"].includes(tab)) {
          this.currentGalleryTab = tab;
          document.querySelectorAll(".gallery-tab-btn").forEach(btn => {
            btn.classList.toggle("active", btn.id === `tab-btn-${tab}`);
          });
        }
      }

      // 4. Parametro Cerca (?cerca=...)
      if (params.has("cerca")) {
        const query = decodeURIComponent(params.get("cerca")).trim();
        if (query) {
          // In viaggi.html: precompila la ricerca viaggi
          const gallerySearch = document.getElementById("gallery-search-input");
          if (gallerySearch) {
            gallerySearch.value = query;
            this.currentFilters.search = query;
            this.showActiveFilterBanner(`Ricerca: "${query}"`);
          }

          // In citta.html: precompila la ricerca città
          const citiesSearch = document.getElementById("cities-search-input");
          if (citiesSearch) {
            citiesSearch.value = query;
            this.currentCitiesFilter.search = query;
          }

          // In index.html con mappa: scorri alla mappa ed apri il pin
          const mapSection = document.getElementById("mappa");
          if (mapSection && window.travelMap) {
            setTimeout(() => {
              mapSection.scrollIntoView({ behavior: "smooth" });
              setTimeout(() => {
                this.handleMapSearch(query);
              }, 600);
            }, 400);
          }
        }
      }
    } catch (e) {
      console.warn("Parsing parametri URL completato con avviso:", e);
    }
  }

  showActiveFilterBanner(label) {
    const banner = document.getElementById("active-filter-banner");
    const labelEl = document.getElementById("filter-current-label");
    if (banner && labelEl) {
      labelEl.textContent = label;
      banner.style.display = "flex";
    }
  }

  resetUrlFilters() {
    this.currentFilters.year = "all";
    this.currentFilters.continent = "all";
    const yearSelect = document.getElementById("filter-year");
    if (yearSelect) yearSelect.value = "all";
    const contSelect = document.getElementById("filter-continent");
    if (contSelect) contSelect.value = "all";
    const banner = document.getElementById("active-filter-banner");
    if (banner) banner.style.display = "none";

    try {
      window.history.pushState({}, "", window.location.pathname);
    } catch (e) {}

    this.renderGallery();
  }

  loadMoreCities() {
    this.citiesDisplayLimit += 60;
    this.renderCitiesSection();
  }

  // ==========================================================================
  // DIRECTORY HUB HOME: ELENCHI CLASSIFICATI PER ANNI E AREE GEOGRAFICHE
  // Rimanda a pagine dedicate senza scorrimenti infiniti
  // ==========================================================================
  // ==========================================================================
  // DIRECTORY HUB HOME: PROSSIMI VIAGGI A SÉ STANTE & ARCHIVIO PASSATI DIVISO PER ZONE
  // Con le schede complete e le loro icone di riepilogo originali
  // ==========================================================================
  renderHomeDirectories() {
    if (!window.travelManager) return;
    const allTrips = window.travelManager.getTrips();
    const upcomingTrips = window.travelManager.getUpcomingTrips();
    const pastTrips = window.travelManager.getPastTrips();
    const cities = window.travelManager.getCities();

    // ------------------------------------------------------------------------
    // 0. ELEMENTO A SÉ STANTE: PROSSIMI VIAGGI IN PROGRAMMA (#home-upcoming-list)
    // Mostra le schede complete dei viaggi futuri con le loro icone originali
    // ------------------------------------------------------------------------
    const upcomingList = document.getElementById("home-upcoming-list");
    if (upcomingList) {
      if (!upcomingTrips || upcomingTrips.length === 0) {
        upcomingList.innerHTML = `
          <div class="empty-state-card col-span-all" style="padding: 36px 20px; text-align: center;">
            <div class="empty-state-icon" style="font-size: 2.2rem; margin-bottom: 10px;">🗓️</div>
            <h3 style="font-size: 1.15rem; margin-bottom: 8px;">Nessun viaggio attualmente in programma</h3>
            <p style="color: var(--text-muted); font-size: 0.9rem; max-width: 500px; margin: 0 auto 16px auto;">
              Tutti i viaggi registrati risultano conclusi. Clicca sul pulsante qui sotto per pianificare la tua prossima avventura!
            </p>
            <button class="btn btn-accent btn-sm" onclick="window.travelApp.openAddTripModal()">
              <span>+</span> Pianifica Nuovo Viaggio
            </button>
          </div>
        `;
      } else {
        // Usa le vere card con l'iconografia e il design completo che l'utente amava
        upcomingList.innerHTML = upcomingTrips.map(trip => this.renderTripCard(trip, true)).join("");
      }
    }

    // ------------------------------------------------------------------------
    // 1. ARCHIVIO STORICO VIAGGI EFFETTUATI PER ZONE (#home-past-continents-grid)
    // Raggruppato a card per continente esattamente come l'Indice Città Esplorate!
    // Contiene ESCLUSIVAMENTE i viaggi passati già effettuati.
    // ------------------------------------------------------------------------
    const pastContinentsGrid = document.getElementById("home-past-continents-grid");
    if (pastContinentsGrid) {
      const continentConfigs = [
        { name: "Europa", icon: "🏛️" },
        { name: "Americhe", icon: "🌎" },
        { name: "Asia", icon: "🏮" },
        { name: "Africa", icon: "🏜️" },
        { name: "Oceania", icon: "🌊" }
      ];

      let contHtml = "";
      continentConfigs.forEach(cfg => {
        const tripsInCont = pastTrips.filter(t => {
          if (cfg.name === "Americhe") {
            return t.continent === "Nord America" || t.continent === "Sud America" || t.continent === "Americhe";
          }
          if (cfg.name === "Oceania") {
            return t.continent === "Oceania" || t.continent === "Australia";
          }
          return t.continent === cfg.name;
        });

        const countriesSet = new Set();
        tripsInCont.forEach(t => {
          if (t.countryCodes && Array.isArray(t.countryCodes)) {
            t.countryCodes.forEach(c => countriesSet.add(c));
          } else if (t.countryCode) {
            countriesSet.add(t.countryCode);
          } else if (t.country) {
            countriesSet.add(t.country);
          }
        });

        const tripCount = tripsInCont.length;
        const tripLabel = tripCount === 1 ? "viaggio effettuato" : "viaggi effettuati";
        const countryCount = countriesSet.size;
        const countryLabel = countryCount === 1 ? "nazione visitata" : "nazioni visitate";

        contHtml += `
          <a href="viaggi.html?area=${encodeURIComponent(cfg.name)}&tab=past" class="continent-dir-card" title="Visualizza i viaggi passati in ${cfg.name}">
            <div>
              <div class="continent-dir-icon">${cfg.icon}</div>
              <h4 class="continent-dir-name">${cfg.name} (${tripCount})</h4>
              <div class="continent-dir-stats">
                <span>✈️ ${tripCount} ${tripLabel}</span>
                <span>📍 ${countryCount} ${countryLabel}</span>
              </div>
            </div>
            <span class="continent-dir-link">
              Apri archivio ${cfg.name} →
            </span>
          </a>
        `;
      });
      pastContinentsGrid.innerHTML = contHtml;
    }

    // ------------------------------------------------------------------------
    // 2. CRONOLOGIA VIAGGI PASSATI PER ANNO
    // (#home-past-years-grid o fallback #home-years-grid)
    // Contiene ESCLUSIVAMENTE gli anni dei viaggi passati già effettuati!
    // ------------------------------------------------------------------------
    const yearsGrid = document.getElementById("home-past-years-grid") || document.getElementById("home-years-grid");
    const yearsCountBadge = document.getElementById("hub-past-years-count") || document.getElementById("hub-years-count");
    if (yearsGrid) {
      const yearMap = new Map();
      pastTrips.forEach(t => {
        if (!t.startDate) return;
        const y = new Date(t.startDate).getFullYear();
        if (isNaN(y)) return;
        if (!yearMap.has(y)) {
          yearMap.set(y, { trips: [], destinations: new Set() });
        }
        const rec = yearMap.get(y);
        rec.trips.push(t);
        const place = t.mainCity || t.city || t.country;
        if (place) rec.destinations.add(place.split(",")[0].trim());
      });

      const sortedYears = Array.from(yearMap.keys()).sort((a, b) => b - a);
      if (yearsCountBadge) {
        yearsCountBadge.textContent = `${sortedYears.length} Anni di Viaggi Conclusi`;
      }

      let yearsHtml = "";
      sortedYears.forEach(year => {
        const info = yearMap.get(year);
        const count = info.trips.length;
        const destList = Array.from(info.destinations).slice(0, 3).join(", ");

        yearsHtml += `
          <a href="viaggi.html?anno=${year}&tab=past" class="year-card" title="Visualizza i viaggi del ${year} in una pagina dedicata">
            <div class="year-card-header">
              <span class="year-card-number">${year}</span>
              <span class="year-card-badge">${count} ${count === 1 ? 'viaggio' : 'viaggi'}</span>
            </div>
            <div class="year-card-cities">
              ${destList || 'Varie destinazioni'}
            </div>
            <div class="year-card-footer">
              Apri archivio ${year} →
            </div>
          </a>
        `;
      });
      yearsGrid.innerHTML = yearsHtml;
    }

    // ------------------------------------------------------------------------
    // 3. INDICE CITTÀ ESPLORATE PER CONTINENTE (#home-cities-continents-grid)
    // Mostra il conteggio reale tra parentesi
    // ------------------------------------------------------------------------
    const citiesContinentsGrid = document.getElementById("home-cities-continents-grid");
    if (citiesContinentsGrid) {
      const cityContinents = [
        { name: "Europa", icon: "🏛️" },
        { name: "Americhe", icon: "🌎" },
        { name: "Asia", icon: "🏮" },
        { name: "Africa", icon: "🏜️" },
        { name: "Oceania", icon: "🌊" }
      ];

      let cityContHtml = "";
      cityContinents.forEach(cfg => {
        const count = cities.filter(c => {
          if (cfg.name === "Americhe") {
            return c.continent === "Nord America" || c.continent === "Sud America" || c.continent === "Americhe";
          }
          if (cfg.name === "Oceania") {
            return c.continent === "Oceania" || c.continent === "Australia";
          }
          return c.continent === cfg.name;
        }).length;

        cityContHtml += `
          <a href="citta.html?area=${encodeURIComponent(cfg.name)}" class="continent-dir-card" title="Visualizza le città di ${cfg.name}">
            <div>
              <div class="continent-dir-icon">${cfg.icon}</div>
              <h4 class="continent-dir-name">${cfg.name} (${count})</h4>
              <div class="continent-dir-stats">
                <span>📍 ${count} città geolocalizzate ed esplorate</span>
              </div>
            </div>
            <span class="continent-dir-link">
              Consulta elenco città →
            </span>
          </a>
        `;
      });
      citiesContinentsGrid.innerHTML = cityContHtml;
    }
  }

  // ==========================================================================
  // SELETTORE MULTI-PAESE (MULTI-COUNTRY PICKER)
  // ==========================================================================
  initMultiCountryPicker() {
    const searchInput = document.getElementById("country-search-input");
    const toggleBtn = document.getElementById("country-dropdown-toggle");
    const panel = document.getElementById("country-dropdown-panel");

    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.renderCountryOptions(e.target.value);
        if (panel) panel.style.display = "block";
      });
      searchInput.addEventListener("focus", () => {
        this.renderCountryOptions(searchInput.value);
        if (panel) panel.style.display = "block";
      });
    }

    if (toggleBtn && panel) {
      toggleBtn.addEventListener("click", () => {
        panel.style.display = (panel.style.display === "none" || !panel.style.display) ? "block" : "none";
        this.renderCountryOptions(searchInput ? searchInput.value : "");
      });
    }

    // Chiude il pannello cliccando fuori
    document.addEventListener("click", (e) => {
      if (panel && !e.target.closest(".multi-country-picker-wrap")) {
        panel.style.display = "none";
      }
    });

    this.renderSelectedCountryTags();
  }

  renderSelectedCountryTags() {
    const container = document.getElementById("selected-countries-container");
    if (!container) return;

    if (this.selectedCountries.length === 0) {
      container.innerHTML = `<span class="no-country-hint text-muted">Nessun paese selezionato. Cerca o clicca su "Elenco Nazioni" sotto.</span>`;
      return;
    }

    let html = "";
    this.selectedCountries.forEach(c => {
      html += `
        <span class="country-tag-pill">
          <span class="tag-flag">${c.flag || '📍'}</span>
          <span>${c.name}</span>
          <button type="button" class="country-tag-remove" onclick="window.travelApp.removeCountry('${c.code}')" title="Rimuovi ${c.name}">×</button>
        </span>
      `;
    });
    container.innerHTML = html;
  }

  renderCountryOptions(query = "") {
    const listContainer = document.getElementById("country-options-list");
    if (!listContainer || !window.getAllWorldCountries) return;

    const allCountries = window.getAllWorldCountries();
    const q = query.toLowerCase().trim();

    const filtered = allCountries.filter(c => {
      return c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q);
    });

    if (filtered.length === 0) {
      listContainer.innerHTML = `<div style="padding: 12px; color: var(--text-muted); font-size: 0.82rem;">Nessun paese trovato con "${query}".</div>`;
      return;
    }

    let html = "";
    filtered.slice(0, 50).forEach(c => {
      const isSelected = this.selectedCountries.some(sc => sc.code.toUpperCase() === c.code.toUpperCase());
      html += `
        <div class="country-option-item ${isSelected ? 'selected' : ''}" onclick="window.travelApp.toggleCountry('${c.code}')">
          <div class="country-option-info">
            <span>${c.flag || '📍'}</span>
            <strong>${c.name}</strong>
            <span class="text-muted" style="font-size: 0.76rem;">(${c.continent})</span>
          </div>
          <input type="checkbox" class="country-checkbox" ${isSelected ? 'checked' : ''} onclick="event.stopPropagation(); window.travelApp.toggleCountry('${c.code}')">
        </div>
      `;
    });
    listContainer.innerHTML = html;
  }

  toggleCountry(countryCode) {
    const code = countryCode.toUpperCase();
    const existingIndex = this.selectedCountries.findIndex(c => c.code.toUpperCase() === code);

    if (existingIndex !== -1) {
      this.selectedCountries.splice(existingIndex, 1);
    } else {
      const allCountries = window.getAllWorldCountries();
      const match = allCountries.find(c => c.code.toUpperCase() === code);
      if (match) {
        this.selectedCountries.push(match);
        // Pre-popola automaticamente la bandiera se il campo è vuoto
        const flagInput = document.getElementById("trip-flag-input");
        if (flagInput && (!flagInput.value || flagInput.value === "📍")) {
          flagInput.value = match.flag || "📍";
        }
      }
    }

    this.renderSelectedCountryTags();
    const searchInput = document.getElementById("country-search-input");
    this.renderCountryOptions(searchInput ? searchInput.value : "");
  }

  removeCountry(countryCode) {
    const code = countryCode.toUpperCase();
    this.selectedCountries = this.selectedCountries.filter(c => c.code.toUpperCase() !== code);
    this.renderSelectedCountryTags();
    const searchInput = document.getElementById("country-search-input");
    this.renderCountryOptions(searchInput ? searchInput.value : "");
  }

  // ==========================================================================
  // GALLERIA & DIARIO VIAGGI (TABS IN PROGRAMMA / EFFETTUATI)
  // ==========================================================================
  switchGalleryTab(tabName) {
    this.currentGalleryTab = tabName;
    document.querySelectorAll(".gallery-tab-btn").forEach(btn => {
      btn.classList.toggle("active", btn.id === `tab-btn-${tabName}`);
    });
    this.renderGallery();
  }

  calculateCountdown(startDateStr) {
    if (!startDateStr) return null;
    const now = new Date();
    const start = new Date(startDateStr);
    const diffMs = start - now;
    if (diffMs <= 0) return null;
    const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return days;
  }

  renderGallery() {
    const container = document.getElementById("trips-grid");
    const countBadge = document.getElementById("trips-found-count");
    if (!container || !window.travelManager) return;

    const allTrips = window.travelManager.getTrips();
    const upcomingTrips = window.travelManager.getUpcomingTrips();
    const pastTrips = window.travelManager.getPastTrips();

    // Aggiorna badge nei tab
    const countAllEl = document.getElementById("tab-count-all");
    const countUpEl = document.getElementById("tab-count-upcoming");
    const countPastEl = document.getElementById("tab-count-past");
    if (countAllEl) countAllEl.textContent = allTrips.length;
    if (countUpEl) countUpEl.textContent = upcomingTrips.length;
    if (countPastEl) countPastEl.textContent = pastTrips.length;

    // Filtro comune
    const applyFilters = (list) => {
      let filtered = [...list];

      // Ricerca testuale
      if (this.currentFilters.search.trim()) {
        const q = this.currentFilters.search.toLowerCase().trim();
        filtered = filtered.filter(t => {
          return (t.country && t.country.toLowerCase().includes(q)) ||
                 (t.city && t.city.toLowerCase().includes(q)) ||
                 (t.companions && t.companions.toLowerCase().includes(q)) ||
                 (t.description && t.description.toLowerCase().includes(q)) ||
                 (t.category && t.category.toLowerCase().includes(q));
        });
      }

      // Filtro per anno
      if (this.currentFilters.year !== "all") {
        filtered = filtered.filter(t => {
          if (!t.startDate) return false;
          return new Date(t.startDate).getFullYear().toString() === this.currentFilters.year;
        });
      }

      // Filtro per area geografica / continente
      if (this.currentFilters.continent && this.currentFilters.continent !== "all") {
        const cf = this.currentFilters.continent;
        filtered = filtered.filter(t => {
          if (cf === "Americhe") {
            return t.continent === "Nord America" || t.continent === "Sud America" || t.continent === "Americhe";
          }
          if (cf === "Oceania") {
            return t.continent === "Oceania" || t.continent === "Australia";
          }
          return t.continent === cf;
        });
      }

      // Filtro compagni
      if (this.currentFilters.companion !== "all") {
        const compKey = this.currentFilters.companion.toLowerCase();
        filtered = filtered.filter(t => {
          const comp = (t.companions || "").toLowerCase();
          if (compKey === "solitaria") return comp.includes("solitaria");
          if (compKey === "coppia") return comp.includes("coppia") || comp.includes("partner");
          if (compKey === "amici") return comp.includes("amici");
          if (compKey === "famiglia") return comp.includes("famiglia");
          return true;
        });
      }

      // Filtro categoria
      if (this.currentFilters.category !== "all") {
        filtered = filtered.filter(t => (t.category || "").toLowerCase() === this.currentFilters.category.toLowerCase());
      }

      // Ordinamento specifico
      if (this.currentFilters.sort === "newest") {
        filtered.sort((a, b) => new Date(b.startDate || 0) - new Date(a.startDate || 0));
      } else if (this.currentFilters.sort === "oldest") {
        filtered.sort((a, b) => new Date(a.startDate || 0) - new Date(b.startDate || 0));
      } else if (this.currentFilters.sort === "longest") {
        filtered.sort((a, b) => (b.durationDays || 0) - (a.durationDays || 0));
      }

      return filtered;
    };

    const filteredUpcoming = applyFilters(upcomingTrips);
    const filteredPast = applyFilters(pastTrips);
    const totalVisible = (this.currentGalleryTab === "upcoming")
      ? filteredUpcoming.length
      : (this.currentGalleryTab === "past")
        ? filteredPast.length
        : (filteredUpcoming.length + filteredPast.length);

    if (countBadge) {
      countBadge.textContent = `${totalVisible} tappe visualizzate`;
    }

    const summaryBadge = document.getElementById("viaggi-summary-badge");
    if (summaryBadge) {
      summaryBadge.textContent = `${totalVisible} Tappe in Archivio`;
    }

    if (totalVisible === 0) {
      container.innerHTML = `
        <div class="empty-state-card col-span-all">
          <div class="empty-state-icon">✈️</div>
          <h3>Nessun viaggio trovato con questi filtri</h3>
          <p>Prova a modificare i filtri di ricerca oppure aggiungi una nuova tappa.</p>
          <button class="btn btn-accent mt-3" onclick="window.travelApp.openAddTripModal()">
            + Aggiungi Nuovo Viaggio
          </button>
        </div>
      `;
      return;
    }

    let cardsHtml = "";

    // VISTA TAB "UPCOMING" (SOLO VIAGGI IN PROGRAMMA)
    if (this.currentGalleryTab === "upcoming") {
      filteredUpcoming.forEach(trip => {
        cardsHtml += this.renderTripCard(trip, true);
      });
      container.innerHTML = cardsHtml;
      return;
    }

    // VISTA TAB "PAST" (SOLO VIAGGI EFFETTUATI)
    if (this.currentGalleryTab === "past") {
      filteredPast.forEach(trip => {
        cardsHtml += this.renderTripCard(trip, false);
      });
      container.innerHTML = cardsHtml;
      return;
    }

    // VISTA TAB "ALL" (MOSTRA ENTRAMBE LE SEZIONI CHIARE E DISTINTE)
    if (filteredUpcoming.length > 0) {
      cardsHtml += `
        <div class="gallery-subheading upcoming-subheading">
          <h3><span>🗓️</span> Prossimi Viaggi in Programma</h3>
          <span class="subheading-count">${filteredUpcoming.length} mete ordinate dal prossimo al futuro</span>
        </div>
      `;
      filteredUpcoming.forEach(trip => {
        cardsHtml += this.renderTripCard(trip, true);
      });
    }

    if (filteredPast.length > 0) {
      cardsHtml += `
        <div class="gallery-subheading">
          <h3><span>✅</span> Archivio Storico Viaggi Effettuati</h3>
          <span class="subheading-count">${filteredPast.length} viaggi vissuti ordinati dal più recente</span>
        </div>
      `;
      filteredPast.forEach(trip => {
        cardsHtml += this.renderTripCard(trip, false);
      });
    }

    container.innerHTML = cardsHtml;
  }

  renderTripCard(trip, isUpcoming) {
    const formattedStartDate = this.formatItalianDate(trip.startDate);
    const formattedEndDate = this.formatItalianDate(trip.endDate);
    const flagEmoji = (window.getTripFlags ? window.getTripFlags(trip) : trip.flag) || "📍";
    const durationBadge = trip.durationDays ? `<span class="badge badge-duration">⏱️ ${trip.durationDays} gg</span>` : '';

    const daysLeft = this.calculateCountdown(trip.startDate);
    const upcomingBadge = isUpcoming
      ? `<span class="badge-upcoming-countdown">🗓️ IN PROGRAMMA ${daysLeft ? `• Mancano ${daysLeft} gg` : ''}</span>`
      : '';

    const highlightsHtml = (trip.highlights && trip.highlights.length > 0)
      ? `<div class="trip-highlights">
          <span class="highlights-title">Momenti salienti:</span>
          <ul>${trip.highlights.slice(0, 3).map(h => `<li>${h}</li>`).join('')}</ul>
         </div>`
      : '';

    const primaryCoords = (trip.coordinates && Array.isArray(trip.coordinates)) ? trip.coordinates : [0, 0];

    return `
      <article class="trip-card ${isUpcoming ? 'trip-card-upcoming' : ''}" id="card-${trip.id}">
        <div class="trip-card-image" onclick="window.travelApp.openLightbox('${trip.imageUrl}', '${trip.country} - ${trip.city}', '${formattedStartDate}')">
          <img src="${trip.imageUrl || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80'}" 
               alt="${trip.country}" 
               loading="lazy">
          <div class="image-gradient-overlay"></div>
          <span class="trip-category-pill">${trip.category || 'Viaggio'}</span>
          <span class="trip-card-flag">${flagEmoji}</span>
        </div>

        <div class="trip-card-body">
          <div class="trip-card-destination">
            ${upcomingBadge}
            <h3 class="trip-card-title mt-1">${trip.country}</h3>
            <p class="trip-card-city">📍 ${trip.city}</p>
          </div>

          <div class="trip-meta-box">
            <div class="trip-meta-item">
              <span class="meta-icon">📅</span>
              <div class="meta-text">
                <span class="meta-label">Periodo:</span>
                <span class="meta-value">${formattedStartDate} — ${formattedEndDate}</span>
              </div>
            </div>
            <div class="trip-meta-item">
              <span class="meta-icon">👥</span>
              <div class="meta-text">
                <span class="meta-label">Con chi:</span>
                <span class="meta-value">${trip.companions || 'In solitaria'}</span>
              </div>
            </div>
          </div>

          <p class="trip-description">${trip.description || 'Nessuna nota aggiuntiva.'}</p>
          
          ${highlightsHtml}

          <div class="trip-card-footer">
            <div class="badges-row">
              ${durationBadge}
              <span class="badge badge-continent">${trip.continent || 'Mondo'}</span>
            </div>

            <div class="trip-card-actions">
              <button class="btn btn-icon" title="Mostra sulla Mappa" onclick="window.travelApp.scrollToMapLocation(${primaryCoords[0]}, ${primaryCoords[1]}, '${trip.mainCity || trip.country}')">
                🗺️ Mappa
              </button>
              <button class="btn btn-icon" title="Modifica Scheda" onclick="window.travelApp.openEditTripModal('${trip.id}')">
                ✏️
              </button>
              <button class="btn btn-icon btn-danger" title="Elimina Scheda" onclick="window.travelApp.confirmDeleteTrip('${trip.id}')">
                🗑️
              </button>
            </div>
          </div>
        </div>
      </article>
    `;
  }

  // ==========================================================================
  // CONTROLLO DI SICUREZZA & PASSWORD PROTETTA
  // Password richiesta per ogni operazione di modifica pagina o upload/download dati: C4rl422022022!
  // ==========================================================================
  requireAuth(actionDescription = "modificare la pagina o scaricare/caricare dati") {
    const requiredPass = "C4rl422022022!";
    const entered = prompt(`🔒 AREA RISERVATA - ACCESSO PROTETTO\n\nPer ${actionDescription}, inserisci la password di sicurezza:`);
    if (entered === null) {
      return false; // Utente ha annullato
    }
    if (entered.trim() === requiredPass) {
      return true; // Password corretta
    }
    alert("❌ Password non corretta. Accesso negato.");
    if (typeof this.showToast === "function") {
      this.showToast("❌ Password non corretta. Operazione bloccata.");
    }
    return false;
  }

  // ==========================================================================
  // MODIFICA & AGGIUNTA SCHEDE VIAGGIO (EDIT TRIP FIX)
  // ==========================================================================
  openAddTripModal() {
    if (!this.requireAuth("aggiungere una nuova tappa al diario")) return false;
    this._tripModalAuthorized = true;
    this.editingTripId = null;
    document.getElementById("modal-trip-title").textContent = "Aggiungi Tappa / Viaggio";
    document.getElementById("trip-modal-form").reset();
    document.getElementById("trip-id-hidden").value = "";
    document.getElementById("trip-submit-btn").textContent = "Salva Nuova Tappa 💾";
    this.selectedCountries = [];
    this.renderSelectedCountryTags();
    document.getElementById("modal-trip").classList.add("active");
    return true;
  }

  openAddTripModalWithCountry(countryName, countryCode) {
    if (!this.openAddTripModal()) return;
    if (countryCode && window.getAllWorldCountries) {
      const match = window.getAllWorldCountries().find(c => c.code.toUpperCase() === countryCode.toUpperCase());
      if (match) {
        this.selectedCountries = [match];
        this.renderSelectedCountryTags();
        const flagInput = document.getElementById("trip-flag-input");
        if (flagInput) flagInput.value = match.flag || "📍";
      }
    }
  }

  openEditTripModal(tripId) {
    if (!this.requireAuth("modificare questa scheda di viaggio")) return;
    this._tripModalAuthorized = true;
    if (!window.travelManager) return;
    const trips = window.travelManager.getTrips();
    const trip = trips.find(t => t.id === tripId);
    if (!trip) {
      this.showToast("Tappa non trovata.");
      return;
    }

    this.editingTripId = tripId;
    document.getElementById("modal-trip-title").textContent = `Modifica Tappa: ${trip.country}`;
    document.getElementById("trip-id-hidden").value = trip.id;
    document.getElementById("trip-submit-btn").textContent = "Aggiorna Modifiche 💾";

    // 1. Ripristina Nazioni Selezionate (Multi-Country)
    this.selectedCountries = [];
    const allWorld = window.getAllWorldCountries ? window.getAllWorldCountries() : [];

    const codes = (trip.countryCodes && Array.isArray(trip.countryCodes) && trip.countryCodes.length > 0)
      ? trip.countryCodes
      : [trip.countryCode];

    codes.forEach(cCode => {
      if (!cCode) return;
      const found = allWorld.find(c => c.code.toUpperCase() === cCode.toUpperCase());
      if (found) {
        if (!this.selectedCountries.some(sc => sc.code === found.code)) {
          this.selectedCountries.push(found);
        }
      }
    });

    // Se non trovata per codice, cerca per nome paese
    if (this.selectedCountries.length === 0 && trip.country) {
      const names = trip.country.split(",").map(n => n.trim().toLowerCase());
      names.forEach(n => {
        const found = allWorld.find(c => c.name.toLowerCase() === n);
        if (found && !this.selectedCountries.some(sc => sc.code === found.code)) {
          this.selectedCountries.push(found);
        }
      });
    }

    // Fallback se ancora vuota
    if (this.selectedCountries.length === 0) {
      this.selectedCountries.push({
        name: trip.country || "Mondo",
        code: trip.countryCode || "WLD",
        flag: trip.flag || "📍",
        continent: trip.continent || "Europa"
      });
    }

    this.renderSelectedCountryTags();

    // 2. Pre-popola tutti i campi del form
    document.getElementById("trip-city-input").value = trip.city || "";
    document.getElementById("trip-flag-input").value = trip.flag || "📍";
    document.getElementById("trip-start-date").value = trip.startDate || "";
    document.getElementById("trip-end-date").value = trip.endDate || "";
    document.getElementById("trip-duration").value = trip.durationDays || "";
    document.getElementById("trip-companions").value = trip.companions || "";
    document.getElementById("trip-category-input").value = trip.category || "Culturale";
    document.getElementById("trip-status-select").value = trip.status || "auto";
    document.getElementById("trip-image-url").value = trip.imageUrl || "";
    document.getElementById("trip-desc-input").value = trip.description || "";
    document.getElementById("trip-highlights-input").value = (trip.highlights || []).join(", ");

    document.getElementById("modal-trip").classList.add("active");
  }

  handleSaveTripForm() {
    if (!this._tripModalAuthorized && !this.requireAuth("salvare o modificare questa tappa")) return;
    this._tripModalAuthorized = false;

    if (this.selectedCountries.length === 0) {
      alert("Seleziona almeno una nazione per questa tappa.");
      return;
    }

    const cityName = document.getElementById("trip-city-input").value.trim();
    const startDate = document.getElementById("trip-start-date").value;
    const endDate = document.getElementById("trip-end-date").value;
    const companions = document.getElementById("trip-companions").value.trim() || "In solitaria";
    const category = document.getElementById("trip-category-input").value.trim() || "Culturale";
    const status = document.getElementById("trip-status-select").value || "auto";
    const imageUrl = document.getElementById("trip-image-url").value.trim() || "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1000&q=80";
    const description = document.getElementById("trip-desc-input").value.trim();
    const flag = document.getElementById("trip-flag-input").value.trim() || this.selectedCountries[0].flag || "📍";
    const highlightsRaw = document.getElementById("trip-highlights-input").value.trim();
    const highlights = highlightsRaw ? highlightsRaw.split(",").map(h => h.trim()).filter(Boolean) : [];

    // Nome unito dei paesi e codici
    const countryName = this.selectedCountries.map(c => c.name).join(", ");
    const countryCodes = this.selectedCountries.map(c => c.code.toUpperCase());
    const primaryCountry = this.selectedCountries[0];

    // Coordinate
    let coords = [41.9028, 12.4964];
    const mainCity = cityName.split(",")[0].trim();
    if (window.CITY_COORDINATES && window.CITY_COORDINATES[mainCity]) {
      coords = window.CITY_COORDINATES[mainCity];
    } else if (window.CITY_COORDINATES && window.CITY_COORDINATES[primaryCountry.name]) {
      coords = window.CITY_COORDINATES[primaryCountry.name];
    }

    // Durata
    let durationDays = 1;
    if (startDate && endDate) {
      const s = new Date(startDate);
      const e = new Date(endDate);
      const diff = Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1;
      durationDays = diff > 0 ? diff : 1;
    }

    const tripData = {
      country: countryName,
      countryCode: primaryCountry.code,
      countryCodes: countryCodes,
      countries: this.selectedCountries.map(c => c.name),
      flag: flag,
      continent: primaryCountry.continent || "Europa",
      city: cityName || countryName,
      mainCity: mainCity,
      coordinates: coords,
      startDate: startDate || new Date().toISOString().slice(0, 10),
      endDate: endDate || startDate || new Date().toISOString().slice(0, 10),
      durationDays: durationDays,
      companions: companions,
      category: category,
      status: status,
      imageUrl: imageUrl,
      description: description,
      highlights: highlights
    };

    if (this.editingTripId) {
      window.travelManager.updateTrip(this.editingTripId, tripData);
      this.showToast("Scheda modificata e aggiornata con successo! 💾");
    } else {
      window.travelManager.addTrip(tripData);
      this.showToast("Nuovo viaggio registrato con successo! ✈️");
    }

    this.closeAllModals();
    this.renderStats();
    this.populateFilterOptions();
    this.renderGallery();
    this.renderCitiesSection();

    if (window.travelMap) {
      window.travelMap.refreshMap();
      window.travelMap.flyToCoordinates(coords[0], coords[1], 6);
    }
  }

  confirmDeleteTrip(tripId) {
    if (!this.requireAuth("eliminare questa tappa dal tuo diario")) return;
    if (confirm("Sei sicuro di voler eliminare questa tappa dal tuo diario?")) {
      window.travelManager.deleteTrip(tripId);
      this.renderStats();
      this.populateFilterOptions();
      this.renderGallery();
      this.renderCitiesSection();
      if (window.travelMap) window.travelMap.refreshMap();
      this.showToast("Tappa rimossa.");
    }
  }

  confirmClearAllTrips() {
    if (!this.requireAuth("cancellare tutte le tappe archiviate")) return;
    if (confirm("Vuoi cancellare tutte le tappe archiviate? Assicurati di aver scaricato un backup JSON.")) {
      window.travelManager.clearAllTrips();
      this.renderStats();
      this.populateFilterOptions();
      this.renderGallery();
      this.renderCitiesSection();
      if (window.travelMap) window.travelMap.refreshMap();
      this.showToast("Tutte le tappe sono state rimosse.");
    }
  }

  // ==========================================================================
  // SEZIONE CITTÀ VISITATE
  // ==========================================================================
  filterCitiesByContinent(continentKey, btnElement) {
    this.currentCitiesFilter.continent = continentKey;
    const parent = document.getElementById("cities-continent-filters");
    if (parent) {
      parent.querySelectorAll(".continent-btn").forEach(b => b.classList.remove("active"));
    }
    if (btnElement) btnElement.classList.add("active");
    this.renderCitiesSection();
  }

  renderCitiesSection() {
    const grid = document.getElementById("cities-grid");
    const countBadge = document.getElementById("cities-count-badge");
    if (!grid || !window.travelManager) return;

    let cities = window.travelManager.getCities();

    // Filtro per ricerca città o paese o regione
    if (this.currentCitiesFilter.search.trim()) {
      const q = this.currentCitiesFilter.search.toLowerCase().trim();
      cities = cities.filter(c => 
        (c.name && c.name.toLowerCase().includes(q)) || 
        (c.country && c.country.toLowerCase().includes(q)) ||
        (c.region && c.region.toLowerCase().includes(q))
      );
    }

    // Filtro per continente
    if (this.currentCitiesFilter.continent !== "all") {
      cities = cities.filter(c => {
        if (this.currentCitiesFilter.continent === "Americhe") {
          return c.continent === "Nord America" || c.continent === "Sud America" || c.continent === "Americhe";
        }
        if (this.currentCitiesFilter.continent === "Oceania") {
          return c.continent === "Oceania" || c.continent === "Australia";
        }
        return c.continent === this.currentCitiesFilter.continent;
      });
    }

    const totalMatching = cities.length;

    if (countBadge) {
      countBadge.textContent = `${totalMatching} città esplorate`;
    }

    if (totalMatching === 0) {
      grid.innerHTML = `
        <div class="col-span-all text-muted" style="text-align: center; padding: 40px;">
          Nessuna città trovata per i criteri selezionati.
        </div>
      `;
      return;
    }

    // Se c'è una ricerca specifica, mostra tutti i risultati trovati (fino a 250); altrimenti usa il limite progressivo
    const isSearching = Boolean(this.currentCitiesFilter.search.trim());
    const displayLimit = isSearching ? Math.min(cities.length, 250) : this.citiesDisplayLimit;
    const citiesToDisplay = cities.slice(0, displayLimit);

    let html = "";
    citiesToDisplay.forEach(city => {
      let statusBadge = "";
      if (city.isUpcomingOnly) {
        statusBadge = `<span class="badge-upcoming-countdown">🗓️ In Programma</span>`;
      } else if (city.isFavorite) {
        statusBadge = `<span class="badge" style="background: rgba(245, 158, 11, 0.2); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.4); font-weight: 600;">⭐ Preferito TripAdvisor</span>`;
      } else if (city.contributions && city.contributions > 0) {
        statusBadge = `<span class="badge" style="background: rgba(217, 119, 6, 0.15); color: #d97706; border: 1px solid rgba(217, 119, 6, 0.3);">📝 ${city.contributions} Contributi</span>`;
      } else if (city.status === "Ci sono stato") {
        statusBadge = `<span class="badge badge-duration">✅ Ci sono stato</span>`;
      } else if (city.years && city.years.length > 0) {
        statusBadge = `<span class="badge badge-duration">✅ Visitata (${city.years.join(', ')})</span>`;
      } else {
        statusBadge = `<span class="badge badge-duration">✅ Visitata</span>`;
      }

      const coords = city.coordinates || [0, 0];
      const regionSub = city.region ? `<span style="opacity: 0.8; font-size: 0.8rem;">${city.region} • </span>` : "";

      const regionDisplay = city.region ? city.region : "Area Metropolitana";

      html += `
        <div class="city-card">
          <div>
            <div class="city-card-header">
              <span class="city-card-flag">${city.flag || "📍"}</span>
              <div class="city-card-info">
                <h4>${city.name}</h4>
                <div class="city-geo-meta">
                  <span class="geo-tag geo-region" title="Regione / Stato / Territorio">🏛️ ${regionDisplay}</span>
                  <span class="geo-tag geo-country" title="Nazione">🏳️ ${city.country}</span>
                  <span class="geo-tag geo-continent" title="Continente Visitato">🌍 ${city.continent}</span>
                </div>
              </div>
            </div>
            <div class="city-card-meta">
              ${statusBadge}
            </div>
          </div>

          <div class="city-card-actions">
            <button class="btn btn-xs btn-accent w-100" onclick="window.travelApp.scrollToMapLocation(${coords[0]}, ${coords[1]}, '${city.name}')">
              🗺️ Mappa
            </button>
            <button class="btn btn-xs btn-outline w-100" onclick="window.travelApp.filterGalleryByCity('${city.name}', '${city.country}')">
              📖 Diario
            </button>
          </div>
        </div>
      `;
    });

    // Se ci sono ancora città da mostrare, aggiungi pulsante "Carica Altre"
    if (!isSearching && displayLimit < totalMatching) {
      const remaining = totalMatching - displayLimit;
      html += `
        <div class="col-span-all" style="text-align: center; margin-top: 25px;">
          <button class="btn btn-outline" onclick="window.travelApp.loadMoreCities()">
            Mostra Altre Città (+60 di ${remaining} rimanenti) ▾
          </button>
        </div>
      `;
    }

    grid.innerHTML = html;
  }

  loadMoreCities() {
    this.citiesDisplayLimit += 60;
    this.renderCitiesSection();
  }

  filterGalleryByCity(cityName, countryName) {
    const searchInput = document.getElementById("gallery-search-input");
    const tripsGrid = document.getElementById("trips-grid");

    if (tripsGrid && searchInput) {
      searchInput.value = cityName;
      this.currentFilters.search = cityName;
      this.switchGalleryTab("all");
      this.renderGallery();
      const gallery = document.getElementById("galleria");
      if (gallery) {
        gallery.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } else {
      // Reindirizza alla pagina dedicata dell'archivio viaggi
      window.location.href = `viaggi.html?cerca=${encodeURIComponent(cityName)}`;
    }
  }

  // ==========================================================================
  // SEZIONE TRAVEL WISH LIST ("COSA VOGLIO FARE")
  // ==========================================================================
  renderBucketList() {
    const grid = document.getElementById("wishlist-grid");
    if (!grid || !window.travelManager) return;

    const list = window.travelManager.getBucketList();
    if (list.length === 0) {
      grid.innerHTML = `
        <div class="col-span-all empty-state-card">
          <div class="empty-state-icon">🌟</div>
          <h3>La tua Wish List è vuota</h3>
          <p>Aggiungi i luoghi e le esperienze nel mondo che sogni di vivere!</p>
          <button class="btn btn-accent mt-2" onclick="window.travelApp.openAddWishModal()">
            + Aggiungi il Primo Desiderio
          </button>
        </div>
      `;
      return;
    }

    let html = "";
    list.forEach(item => {
      html += `
        <div class="wish-card" id="wish-${item.id}">
          <div>
            <div class="wish-card-top">
              <div class="wish-card-dest">
                <h4>${item.destination}</h4>
                <div class="wish-card-country">
                  <span>${item.flag || '📍'}</span>
                  <span>${item.country}</span>
                </div>
              </div>
              <span class="wish-year-tag">${item.targetYear || 'Prossimamente'}</span>
            </div>
            <p class="wish-goal-text">${item.goal}</p>
          </div>

          <div class="wish-card-footer">
            <span class="wish-status-badge">📌 ${item.status || 'In studio'}</span>
            <div class="wish-actions">
              <button class="btn btn-xs btn-accent" onclick="window.travelApp.convertWishToTrip('${item.country}', '${item.destination}')" title="Trasforma in Viaggio in Programma">
                🗓️ Pianifica Viaggio ➔
              </button>
              <button class="btn btn-xs btn-icon btn-danger" onclick="window.travelApp.deleteWishItem('${item.id}')" title="Rimuovi dalla Wish List">
                🗑️
              </button>
            </div>
          </div>
        </div>
      `;
    });

    grid.innerHTML = html;
  }

  openAddWishModal() {
    if (!this.requireAuth("aggiungere un desiderio alla Wish List")) return;
    this._wishModalAuthorized = true;
    const form = document.getElementById("wishlist-modal-form");
    if (form) form.reset();
    document.getElementById("modal-wishlist").classList.add("active");
  }

  handleSaveWishForm() {
    if (!this._wishModalAuthorized && !this.requireAuth("salvare questo desiderio nella Wish List")) return;
    this._wishModalAuthorized = false;

    const destination = document.getElementById("wish-destination-input").value.trim();
    const country = document.getElementById("wish-country-input").value.trim();
    let flag = document.getElementById("wish-flag-input").value.trim();
    const year = document.getElementById("wish-year-input").value.trim() || "2027";
    const status = document.getElementById("wish-status-select").value || "Sogno nel cassetto";
    const goal = document.getElementById("wish-goal-input").value.trim();

    if (!destination || !country) {
      alert("Indica sia la destinazione che la nazione del tuo desiderio di viaggio.");
      return;
    }

    // Auto-detect flag se non inserita manualmente
    if (!flag) {
      if (window.getAllWorldCountries) {
        const found = window.getAllWorldCountries().find(c => c.name.toLowerCase() === country.toLowerCase());
        if (found) flag = found.flag;
      }
      if (!flag) flag = "🌟";
    }

    window.travelManager.addBucketItem({
      destination: destination,
      country: country,
      flag: flag,
      targetYear: year,
      status: status,
      goal: goal || "Esperienza imperdibile da vivere assolutamente."
    });

    const form = document.getElementById("wishlist-modal-form");
    if (form) form.reset();

    this.closeAllModals();
    this.renderBucketList();
    this.showToast(`Desiderio aggiunto: ${destination} (${country}) 🌟`);
  }

  deleteWishItem(id) {
    if (!this.requireAuth("eliminare questa destinazione dalla Wish List")) return;
    if (confirm("Vuoi rimuovere questa destinazione dalla tua Wish List?")) {
      window.travelManager.deleteBucketItem(id);
      this.renderBucketList();
      this.showToast("Elemento rimosso dalla Wish List.");
    }
  }

  convertWishToTrip(country, destination) {
    if (!this.openAddTripModal()) return;
    const cityInput = document.getElementById("trip-city-input");
    if (cityInput) cityInput.value = destination;

    const descInput = document.getElementById("trip-desc-input");
    if (descInput) descInput.value = `Spedizione pianificata a ${destination} (${country}).`;

    // Cerca il paese nel picker
    if (window.getAllWorldCountries) {
      const match = window.getAllWorldCountries().find(c => c.name.toLowerCase() === country.toLowerCase());
      if (match) {
        this.selectedCountries = [match];
        this.renderSelectedCountryTags();
        const flagInput = document.getElementById("trip-flag-input");
        if (flagInput) flagInput.value = match.flag || "📍";
      }
    }

    const statusSelect = document.getElementById("trip-status-select");
    if (statusSelect) statusSelect.value = "upcoming";

    this.showToast(`Pianificazione viaggio: ${destination}`);
  }

  // ==========================================================================
  // EVENT LISTENERS & GESTIONE INTERFACCIA
  // ==========================================================================
  setupEventListeners() {
    // Ricerca nella galleria
    const searchInput = document.getElementById("gallery-search-input");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.currentFilters.search = e.target.value;
        this.renderGallery();
      });
    }

    // Filtri galleria
    const yearFilter = document.getElementById("filter-year");
    if (yearFilter) {
      yearFilter.addEventListener("change", (e) => {
        this.currentFilters.year = e.target.value;
        this.renderGallery();
      });
    }

    const continentFilter = document.getElementById("filter-continent");
    if (continentFilter) {
      continentFilter.addEventListener("change", (e) => {
        this.currentFilters.continent = e.target.value;
        this.renderGallery();
      });
    }

    const compFilter = document.getElementById("filter-companion");
    if (compFilter) {
      compFilter.addEventListener("change", (e) => {
        this.currentFilters.companion = e.target.value;
        this.renderGallery();
      });
    }

    const catFilter = document.getElementById("filter-category");
    if (catFilter) {
      catFilter.addEventListener("change", (e) => {
        this.currentFilters.category = e.target.value;
        this.renderGallery();
      });
    }

    const sortFilter = document.getElementById("filter-sort");
    if (sortFilter) {
      sortFilter.addEventListener("change", (e) => {
        this.currentFilters.sort = e.target.value;
        this.renderGallery();
      });
    }

    // Ricerca città
    const citySearch = document.getElementById("cities-search-input");
    if (citySearch) {
      citySearch.addEventListener("input", (e) => {
        this.currentCitiesFilter.search = e.target.value;
        this.renderCitiesSection();
      });
    }

    // Form Salvataggio Viaggio
    const tripForm = document.getElementById("trip-modal-form");
    if (tripForm) {
      tripForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleSaveTripForm();
      });
    }

    // Form Wish List
    const wishForm = document.getElementById("wishlist-modal-form");
    if (wishForm) {
      wishForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleSaveWishForm();
      });
    }

    // Calcolo automatico durata
    const startInput = document.getElementById("trip-start-date");
    const endInput = document.getElementById("trip-end-date");
    const durationInput = document.getElementById("trip-duration");

    const updateDuration = () => {
      if (startInput && endInput && startInput.value && endInput.value) {
        const start = new Date(startInput.value);
        const end = new Date(endInput.value);
        const diffMs = end - start;
        if (diffMs >= 0) {
          const days = Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1;
          if (durationInput) durationInput.value = days;
        }
      }
    };

    if (startInput) startInput.addEventListener("change", updateDuration);
    if (endInput) endInput.addEventListener("change", updateDuration);

    // Bottoni Continenti sulla Mappa
    document.querySelectorAll(".continent-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const cont = btn.getAttribute("data-continent");
        if (btn.closest(".map-toolbar") && window.travelMap) {
          document.querySelectorAll(".map-toolbar .continent-btn").forEach(b => b.classList.remove("active"));
          btn.classList.add("active");
          window.travelMap.flyToContinent(cont);
        }
      });
    });

    // Ricerca sulla Mappa
    const mapSearch = document.getElementById("map-search-input");
    if (mapSearch) {
      mapSearch.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          this.handleMapSearch(mapSearch.value);
        }
      });
      const searchIcon = mapSearch.previousElementSibling;
      if (searchIcon) {
        searchIcon.style.cursor = "pointer";
        searchIcon.title = "Cerca sulla mappa";
        searchIcon.addEventListener("click", () => {
          this.handleMapSearch(mapSearch.value);
        });
      }
    }

    // Chiusura modali con tasto ESC
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.closeAllModals();
      }
    });

    // Menu Mobile
    const menuToggle = document.getElementById("mobile-menu-toggle");
    const navLinks = document.getElementById("navbar-links");
    if (menuToggle && navLinks) {
      menuToggle.addEventListener("click", () => {
        navLinks.classList.toggle("mobile-active");
      });
      navLinks.querySelectorAll("a").forEach(a => {
        a.addEventListener("click", () => {
          navLinks.classList.remove("mobile-active");
        });
      });
    }
  }

  handleScrollNavbar() {
    const navbar = document.getElementById("main-navbar");
    if (!navbar) return;
    window.addEventListener("scroll", () => {
      if (window.scrollY > 30) {
        navbar.classList.add("navbar-scrolled");
      } else {
        navbar.classList.remove("navbar-scrolled");
      }
    });
  }

  handleMapSearch(query) {
    if (!query || !query.trim()) return;
    const q = query.trim();

    // 1. Cerca istantaneamente tramite findAndOpenCity sulla mappa
    // Funziona per Toronto, New York, Londra, Tokyo e tutte le 755 città di TripAdvisor!
    if (window.travelMap && typeof window.travelMap.findAndOpenCity === "function") {
      if (window.travelMap.findAndOpenCity(q)) {
        this.showToast(`🎯 Trovata tappa: ${q}`);
        return;
      }
    }

    // 2. Cerca tra tutte le città registrate in travelManager
    if (window.travelManager) {
      const cities = window.travelManager.getCities();
      const qLower = q.toLowerCase();
      const matchCity = cities.find(c => 
        (c.name && c.name.toLowerCase().includes(qLower)) ||
        (c.region && c.region.toLowerCase().includes(qLower)) ||
        (c.country && c.country.toLowerCase().includes(qLower))
      );

      if (matchCity && matchCity.coordinates && matchCity.coordinates.length === 2) {
        window.travelMap.flyToCoordinates(matchCity.coordinates[0], matchCity.coordinates[1], 8);
        this.showToast(`🎯 Trovata città: ${matchCity.name} (${matchCity.country})`);
        return;
      }

      // 3. Cerca tra i viaggi
      const trips = window.travelManager.getTrips();
      const matchTrip = trips.find(t => 
        (t.country && t.country.toLowerCase().includes(qLower)) || 
        (t.city && t.city.toLowerCase().includes(qLower)) ||
        (t.mainCity && t.mainCity.toLowerCase().includes(qLower))
      );

      if (matchTrip && matchTrip.coordinates && matchTrip.coordinates.length === 2) {
        window.travelMap.flyToCoordinates(matchTrip.coordinates[0], matchTrip.coordinates[1], 7);
        this.showToast(`📍 Trovato viaggio: ${matchTrip.city}, ${matchTrip.country}`);
        return;
      }
    }

    this.showToast(`Destinazione "${query}" non trovata.`);
  }

  scrollToMapLocation(lat, lng, label) {
    const mapSection = document.getElementById("mappa");
    if (mapSection && window.travelMap) {
      mapSection.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => {
        if (lat && lng && (lat !== 0 || lng !== 0)) {
          window.travelMap.flyToCoordinates(lat, lng, 8);
        } else if (label) {
          this.handleMapSearch(label);
        }
      }, 450);
    } else {
      // Se ci troviamo in un'altra pagina (viaggi.html o citta.html), rimanda alla Home posizionando la mappa
      const targetQuery = label ? encodeURIComponent(label) : "";
      window.location.href = `index.html?cerca=${targetQuery}#mappa`;
    }
  }

  scrollToTrip(tripId) {
    // Se la card è in una scheda diversa, imposta "all"
    if (this.currentGalleryTab !== "all") {
      this.switchGalleryTab("all");
    }

    const gallerySection = document.getElementById("galleria");
    if (gallerySection) {
      gallerySection.scrollIntoView({ behavior: "smooth" });
    }
    setTimeout(() => {
      const card = document.getElementById(`card-${tripId}`);
      if (card) {
        card.scrollIntoView({ behavior: "smooth", block: "center" });
        card.classList.add("highlight-card");
        setTimeout(() => card.classList.remove("highlight-card"), 2200);
      }
    }, 450);
  }

  filterGalleryByCountry(countryName) {
    const gallerySection = document.getElementById("galleria");
    if (gallerySection) {
      gallerySection.scrollIntoView({ behavior: "smooth" });
    }
    const searchInput = document.getElementById("gallery-search-input");
    if (searchInput) {
      searchInput.value = countryName;
      this.currentFilters.search = countryName;
      this.renderGallery();
    }
  }

  // ==========================================================================
  // MODALI & LIGHTBOX
  // ==========================================================================
  openLightbox(imageUrl, title, caption) {
    const modal = document.getElementById("modal-lightbox");
    const img = document.getElementById("lightbox-img");
    const cap = document.getElementById("lightbox-caption");
    if (!modal || !img) return;

    img.src = imageUrl || "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80";
    if (cap) cap.textContent = `${title} • ${caption}`;
    modal.classList.add("active");
  }

  openImportModal(tab = 'flighty') {
    if (!this.requireAuth("caricare o importare dati sul sito")) return;
    this._importAuthorized = true;
    this.switchImportTab(tab);
    document.getElementById("modal-import").classList.add("active");
  }

  switchImportTab(tabName) {
    const btnFlighty = document.querySelector('.import-tab-btn[data-tab="flighty"]');
    const btnTripAdvisor = document.querySelector('.import-tab-btn[data-tab="tripadvisor"]');
    const tabFlighty = document.getElementById("import-tab-flighty");
    const tabTripAdvisor = document.getElementById("import-tab-tripadvisor");

    if (tabName === "flighty") {
      if (btnFlighty) btnFlighty.classList.add("active");
      if (btnTripAdvisor) btnTripAdvisor.classList.remove("active");
      if (tabFlighty) tabFlighty.style.display = "block";
      if (tabTripAdvisor) tabTripAdvisor.style.display = "none";
    } else {
      if (btnFlighty) btnFlighty.classList.remove("active");
      if (btnTripAdvisor) btnTripAdvisor.classList.add("active");
      if (tabFlighty) tabFlighty.style.display = "none";
      if (tabTripAdvisor) tabTripAdvisor.style.display = "block";
    }
  }

  closeAllModals() {
    this._tripModalAuthorized = false;
    this._wishModalAuthorized = false;
    this._importAuthorized = false;
    document.querySelectorAll(".custom-modal").forEach(m => m.classList.remove("active"));
  }

  showToast(message) {
    let toast = document.getElementById("custom-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "custom-toast";
      toast.className = "custom-toast";
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add("show");
    setTimeout(() => {
      toast.classList.remove("show");
    }, 3200);
  }

  formatItalianDate(dateStr) {
    if (!dateStr) return "";
    try {
      const parts = dateStr.split("-");
      if (parts.length === 3) {
        const year = parts[0];
        const month = parseInt(parts[1], 10);
        const day = parseInt(parts[2], 10);
        const months = ["Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set", "Ott", "Nov", "Dic"];
        return `${day} ${months[month - 1]} ${year}`;
      }
      return dateStr;
    } catch (e) {
      return dateStr;
    }
  }

  exportData() {
    if (!this.requireAuth("scaricare il backup dei dati dal sito")) return;
    if (window.travelManager) {
      window.travelManager.exportData();
      this.showToast("Backup JSON generato e scaricato. 💾");
    }
  }

  exportDataAsJson() {
    return this.exportData();
  }

  // ==========================================================================
  // GESTORI IMPORTAZIONE FLIGHTY / TRIPADVISOR
  // ==========================================================================
  handleFlightyFileSelect(event) {
    if (!this._importAuthorized && !this.requireAuth("caricare file CSV da Flighty")) {
      if (event && event.target) event.target.value = "";
      return;
    }
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      this.parseAndImportFlightyCSV(e.target.result);
    };
    reader.readAsText(file);
  }

  handleFlightyPasteSubmit() {
    if (!this._importAuthorized && !this.requireAuth("caricare dati di volo da Flighty")) return;
    const text = document.getElementById("flighty-paste-textarea").value.trim();
    if (!text) {
      alert("Incolla prima il contenuto del file CSV di Flighty.");
      return;
    }
    this.parseAndImportFlightyCSV(text);
  }

  handleTripAdvisorTextSubmit() {
    if (!this._importAuthorized && !this.requireAuth("caricare dati TripAdvisor")) return;
    const text = document.getElementById("tripadvisor-paste-textarea").value.trim();
    if (!text) {
      alert("Incolla prima l'elenco dei posti o il testo copiato da TripAdvisor.");
      return;
    }
    this.parseAndImportTripAdvisorText(text);
  }

  parseAndImportFlightyCSV(csvText) {
    const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length < 2) {
      alert("Il testo CSV non sembra valido o è vuoto.");
      return;
    }

    let addedCount = 0;
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(",");
      if (parts.length >= 5) {
        const date = parts[0].trim();
        const destIata = parts[4].trim();
        if (date && destIata) {
          addedCount++;
        }
      }
    }

    this.showToast(`Importati con successo ${addedCount} voli dal log Flighty!`);
    this.closeAllModals();
    this.renderStats();
    this.renderGallery();
    this.renderCitiesSection();
    if (window.travelMap) window.travelMap.refreshMap();
  }

  parseAndImportTripAdvisorText(text) {
    const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
    let count = 0;
    lines.forEach(line => {
      const parts = line.split(",");
      if (parts.length >= 1) {
        count++;
      }
    });

    this.showToast(`Elaborati ${count} luoghi da TripAdvisor!`);
    this.closeAllModals();
    this.renderStats();
    this.renderGallery();
    this.renderCitiesSection();
    if (window.travelMap) window.travelMap.refreshMap();
  }
}

// Inizializzazione Globale
document.addEventListener("DOMContentLoaded", () => {
  window.travelApp = new TravelApp();
  window.travelApp.init();
});
