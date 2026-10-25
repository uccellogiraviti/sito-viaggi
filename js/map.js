/**
 * map.js - Gestione Mappa Interattiva del Mondo Leaflet & GeoJSON
 * Creato per il sito web personale di Giuseppe Ricatti
 * 
 * FIX: Utilizza Esri Dark Gray Canvas / Vector (100% Gratuito, Nessuna API Key Richiesta)
 * per eliminare completamente il messaggio "API key required" di CartoDB.
 */

class TravelMap {
  constructor(containerId = "world-map") {
    this.containerId = containerId;
    this.map = null;
    this.geojsonLayer = null;
    this.markersLayer = null;
    this.visitedCountryCodes = new Set();
    this.upcomingCountryCodes = new Set();
    this.visitedCountriesMap = new Map(); // ISO -> Array di viaggi passati / consolidati
    this.upcomingCountriesMap = new Map(); // ISO -> Array di viaggi futuri / in programma
    this.cityMarkersMap = new Map(); // cityName -> { marker, city, lat, lng }
    this.activeContinent = "all";
    this.currentTileLayer = null;

    // Centri e zoom per i continenti
    this.continentViews = {
      "all": { center: [20, 10], zoom: 2.2 },
      "Europa": { center: [50, 15], zoom: 4.0 },
      "Asia": { center: [34, 100], zoom: 3.2 },
      "Americhe": { center: [15, -80], zoom: 2.6 },
      "Africa": { center: [2, 20], zoom: 3.0 },
      "Oceania": { center: [-25, 135], zoom: 3.6 }
    };
  }

  init() {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    // Inizializza mappa Leaflet
    this.map = L.map(this.containerId, {
      center: [20, 10],
      zoom: 2.2,
      minZoom: 1.8,
      maxZoom: 14,
      zoomControl: false,
      worldCopyJump: true,
      attributionControl: false
    });

    // Controllo Zoom personalizzato in basso a destra
    L.control.zoom({ position: 'bottomright' }).addTo(this.map);

    // Carica Tessere Cartografiche Gratuite e Senza API Key (Esri World Dark Gray Base)
    // Non richiede API key, non presenta watermark e offre un look scuro ultra-minimale
    this.currentTileLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
      attribution: '&copy; Esri, HERE, Garmin, NGA, USGS',
      maxZoom: 16
    }).addTo(this.map);

    // Gruppo Layer per i Pin delle Città
    this.markersLayer = L.layerGroup().addTo(this.map);

    // Aggiorna l'elenco dei paesi visitati dai dati correnti
    this.refreshVisitedData();

    // Carica il GeoJSON dei Paesi
    this.renderGeoJson();

    // Renderizza i Marker delle città visitate
    this.renderCityMarkers();

    // Forza ricalcolo dimensioni
    setTimeout(() => {
      if (this.map) this.map.invalidateSize();
    }, 250);

    window.addEventListener("resize", () => {
      if (this.map) this.map.invalidateSize();
    });

    window.addEventListener("orientationchange", () => {
      setTimeout(() => {
        if (this.map) this.map.invalidateSize();
      }, 200);
    });
  }

  refreshVisitedData() {
    this.visitedCountryCodes.clear();
    this.upcomingCountryCodes.clear();
    this.visitedCountriesMap.clear();
    this.upcomingCountriesMap.clear();

    const trips = (window.travelManager && typeof window.travelManager.getTrips === "function")
      ? window.travelManager.getTrips()
      : [];

    trips.forEach(trip => {
      const isUp = window.travelManager ? window.travelManager.isUpcoming(trip) : false;
      const codes = (trip.countryCodes && Array.isArray(trip.countryCodes) && trip.countryCodes.length > 0)
        ? trip.countryCodes
        : [trip.countryCode];

      codes.forEach(rawCode => {
        if (!rawCode) return;
        const code = rawCode.toUpperCase().trim();
        if (isUp) {
          if (!this.upcomingCountriesMap.has(code)) {
            this.upcomingCountriesMap.set(code, []);
          }
          this.upcomingCountriesMap.get(code).push(trip);
          this.upcomingCountryCodes.add(code);
        } else {
          if (!this.visitedCountriesMap.has(code)) {
            this.visitedCountriesMap.set(code, []);
          }
          this.visitedCountriesMap.get(code).push(trip);
          this.visitedCountryCodes.add(code);
        }
      });
    });

    // Includi i 49 Paesi Ufficiali Certificati da TripAdvisor (UccelloGiraviti)
    if (typeof window !== "undefined" && Array.isArray(window.TRIPADVISOR_COUNTRIES_LIST)) {
      window.TRIPADVISOR_COUNTRIES_LIST.forEach(c => {
        if (c.code) {
          const code = c.code.toUpperCase().trim();
          this.visitedCountryCodes.add(code);
        }
      });
    }

    // Se un paese è già stato consolidato/visitato nel passato, la priorità assoluta è "Visitato"
    this.visitedCountryCodes.forEach(code => {
      this.upcomingCountryCodes.delete(code);
    });
  }

  renderGeoJson() {
    if (!window.WORLD_GEOJSON) {
      console.warn("Dati GeoJSON mondiali non trovati.");
      return;
    }

    if (this.geojsonLayer) {
      this.map.removeLayer(this.geojsonLayer);
    }

    this.geojsonLayer = L.geoJSON(window.WORLD_GEOJSON, {
      style: (feature) => this.getCountryStyle(feature),
      onEachFeature: (feature, layer) => this.bindCountryEvents(feature, layer)
    }).addTo(this.map);
  }

  getCountryCodeFromFeature(feature) {
    if (!feature || !feature.properties) return null;
    const p = feature.properties;
    return (p.adm0_a3 || p.iso_a3 || p.sov_a3 || p.brk_a3 || "").toUpperCase().trim();
  }

  isCountryVisited(feature) {
    const code = this.getCountryCodeFromFeature(feature);
    if (code && this.visitedCountryCodes.has(code)) return true;

    // Fallback su confronto nome paese verificando SOLO i viaggi passati / consolidati
    const name = (feature.properties.name || "").toLowerCase().trim();
    for (const [vCode, trips] of this.visitedCountriesMap.entries()) {
      if (this.visitedCountryCodes.has(vCode)) {
        if (trips.some(t => {
          if (window.travelManager && window.travelManager.isUpcoming(t)) return false;
          const cName = (t.country || "").toLowerCase().trim();
          return cName === name;
        })) {
          return true;
        }
      }
    }
    return false;
  }

  isCountryUpcoming(feature) {
    // Se la nazione è già consolidata / visitata, ha priorità assoluta il colore visitato
    if (this.isCountryVisited(feature)) return false;

    const code = this.getCountryCodeFromFeature(feature);
    if (code && this.upcomingCountryCodes.has(code)) return true;

    const name = (feature.properties.name || "").toLowerCase().trim();
    for (const [uCode, trips] of this.upcomingCountriesMap.entries()) {
      if (this.upcomingCountryCodes.has(uCode)) {
        if (trips.some(t => {
          if (window.travelManager && !window.travelManager.isUpcoming(t)) return false;
          const cName = (t.country || "").toLowerCase().trim();
          return cName === name;
        })) {
          return true;
        }
      }
    }
    return false;
  }

  getAccentColor() {
    if (typeof window !== "undefined" && typeof getComputedStyle === "function") {
      const col = getComputedStyle(document.body).getPropertyValue('--accent-theme').trim();
      if (col) return col;
    }
    return "#f59e0b";
  }

  getCountryStyle(feature) {
    const isVisited = this.isCountryVisited(feature);
    const isUpcoming = !isVisited && this.isCountryUpcoming(feature);
    const accent = this.getAccentColor();

    if (isVisited) {
      return {
        fillColor: accent,             // Colore d'accento ambra/oro (zero verde)
        fillOpacity: 0.42,
        color: accent,                 // Bordo definito
        weight: 1.3,
        dashArray: "",
        className: "visited-country"
      };
    } else if (isUpcoming) {
      return {
        fillColor: "#38bdf8",          // Ciano/Azzurro cielo per i viaggi futuri in programma
        fillOpacity: 0.22,
        color: "#38bdf8",
        weight: 1.5,
        dashArray: "4, 4",             // Linea tratteggiata elegante per mete programmate
        className: "upcoming-country"
      };
    } else {
      return {
        fillColor: "#111622",          // Sfondo scuro coerente con Esri
        fillOpacity: 0.20,
        color: "rgba(255, 255, 255, 0.08)", // Linee di confine sottili e minimali
        weight: 0.6,
        dashArray: "",
        className: "unvisited-country"
      };
    }
  }

  bindCountryEvents(feature, layer) {
    const isVisited = this.isCountryVisited(feature);
    const isUpcoming = !isVisited && this.isCountryUpcoming(feature);
    const countryName = feature.properties.name || "Nazione";
    const code = this.getCountryCodeFromFeature(feature);
    const trips = isVisited
      ? (this.visitedCountriesMap.get(code) || [])
      : (this.upcomingCountriesMap.get(code) || []);

    // Costruzione badge e stato tooltip
    let badgeClass = "badge-unvisited";
    let badgeText = "Da esplorare";
    if (isVisited) {
      badgeClass = "badge-visited";
      badgeText = "✅ Visitato";
    } else if (isUpcoming) {
      badgeClass = "badge-upcoming";
      badgeText = "🗓️ In Programma";
    }

    let tooltipContent = `
      <div class="map-tooltip">
        <div class="tooltip-header">
          <span class="tooltip-title">${countryName}</span>
          <span class="tooltip-badge ${badgeClass}">
            ${badgeText}
          </span>
        </div>
    `;

    if (isVisited && trips.length > 0) {
      const pastTrips = trips.filter(t => !window.travelManager.isUpcoming(t));
      const latestTrip = pastTrips[0] || trips[0];
      const cities = Array.from(new Set(trips.map(t => t.mainCity || t.city).filter(Boolean))).join(", ");
      tooltipContent += `
        <div class="tooltip-body">
          <p><span class="label">Città esplorate:</span> ${cities}</p>
          <p><span class="label">Data visita:</span> ${latestTrip.startDate || ''}</p>
          <p><span class="label">Con chi:</span> ${latestTrip.companions || 'In solitaria'}</p>
        </div>
        <div class="tooltip-footer">Clicca per aprire nel diario →</div>
      `;
    } else if (isUpcoming && trips.length > 0) {
      const upTrip = trips.find(t => window.travelManager.isUpcoming(t)) || trips[0];
      tooltipContent += `
        <div class="tooltip-body">
          <p><span class="label">Viaggio programmato:</span> ${upTrip.city || upTrip.country}</p>
          <p><span class="label">Partenza prevista:</span> ${upTrip.startDate || ''}</p>
          <p><span class="label">Compagni:</span> ${upTrip.companions || 'In solitaria'}</p>
        </div>
        <div class="tooltip-footer">Clicca per visualizzare i dettagli in programma →</div>
      `;
    } else {
      tooltipContent += `
        <div class="tooltip-body">
          <p class="text-muted">Nessun viaggio ancora registrato.</p>
        </div>
        <div class="tooltip-footer">+ Clicca per aggiungere questo paese</div>
      `;
    }
    tooltipContent += `</div>`;

    layer.bindTooltip(tooltipContent, {
      sticky: true,
      direction: 'top',
      className: 'custom-leaflet-tooltip',
      opacity: 0.98
    });

    layer.on({
      mouseover: (e) => {
        const target = e.target;
        const accent = this.getAccentColor();
        if (isVisited) {
          target.setStyle({
            fillOpacity: 0.65,
            weight: 1.8,
            color: "#fbbf24"
          });
        } else if (isUpcoming) {
          target.setStyle({
            fillOpacity: 0.45,
            weight: 1.8,
            color: "#7dd3fc"
          });
        } else {
          target.setStyle({
            fillOpacity: 0.35,
            weight: 1.0,
            color: "rgba(255, 255, 255, 0.3)"
          });
        }
        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
          target.bringToFront();
          if (this.markersLayer) {
            this.markersLayer.bringToFront();
          }
        }
      },
      mouseout: (e) => {
        this.geojsonLayer.resetStyle(e.target);
      },
      click: () => {
        if (isVisited || isUpcoming) {
          window.travelApp.filterGalleryByCountry(countryName);
        } else {
          window.travelApp.openAddTripModalWithCountry(countryName, code);
        }
      }
    });
  }

  renderCityMarkers() {
    this.markersLayer.clearLayers();
    this.cityMarkersMap.clear();
    if (!window.travelManager) return;

    const allCities = window.travelManager.getCities();

    allCities.forEach(city => {
      if (!city.coordinates || !Array.isArray(city.coordinates) || city.coordinates.length !== 2) return;
      const [lat, lng] = city.coordinates;
      if (typeof lat !== "number" || typeof lng !== "number" || isNaN(lat) || isNaN(lng)) return;

      const cityName = city.name || "Città";
      const isUp = Boolean(city.isUpcomingOnly);
      const isFav = Boolean(city.isFavorite);
      const contribs = city.contributions || 0;
      const regionSub = city.region ? `${city.region}, ` : "";

      // TUTTI I PIN NORMALIZZATI (Design Unico & Elegante)
      // Visitati: Ambra/Oro Caldo | In Programma: Ciano Elettrico
      const pinTypeClass = isUp ? "pin-upcoming" : (isFav ? "pin-favorite" : "pin-visited");

      const customIcon = L.divIcon({
        className: "unified-city-marker-wrapper",
        html: `
          <div class="unified-city-marker ${pinTypeClass}" title="${cityName}">
            <div class="unified-pin-glow"></div>
            <div class="unified-pin-dot"></div>
          </div>
        `,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      });

      const marker = L.marker([lat, lng], { icon: customIcon });

      let statusBadge = "";
      if (isUp) {
        statusBadge = `<span class="badge-upcoming-countdown">🗓️ In Programma</span>`;
      } else if (isFav) {
        statusBadge = `<span class="badge badge-accent">⭐ Preferito TripAdvisor</span>`;
      } else if (contribs > 0) {
        statusBadge = `<span class="badge" style="background: rgba(217, 119, 6, 0.2); color: #d97706; font-weight: 600;">📝 ${contribs} Contributi TripAdvisor</span>`;
      } else {
        statusBadge = `<span class="badge badge-duration">✅ Tappa Visitata</span>`;
      }

      const popupContent = `
        <div class="city-popup-card">
          <div class="popup-content" style="padding-top: 14px;">
            <span class="popup-flag" style="font-size: 1.8rem; margin-bottom: 6px; display: inline-block;">${city.flag || '📍'}</span>
            <h4>${cityName}</h4>
            <p class="popup-country" style="color: var(--text-muted); font-size: 0.8rem; margin-bottom: 8px;">${regionSub}${city.country} • ${city.continent}</p>
            <div style="margin-bottom: 10px;">${statusBadge}</div>
            <button class="btn btn-xs btn-accent w-100" onclick="window.travelApp.filterGalleryByCity('${cityName}', '${city.country}')">
              📖 Cerca nel Diario di Viaggio
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, {
        className: "custom-leaflet-popup",
        maxWidth: 260,
        closeButton: true
      });

      marker.bindTooltip(`<b>${city.flag || '📍'} ${cityName}</b> (${city.country})`, {
        direction: 'top',
        offset: [0, -8],
        className: 'city-mini-tooltip'
      });

      this.markersLayer.addLayer(marker);

      // Indicizza per ricerca istantanea
      const normKey = cityName.toLowerCase().trim();
      this.cityMarkersMap.set(normKey, { marker, city, lat, lng });
    });
  }

  findAndOpenCity(cityName) {
    if (!cityName) return false;
    const q = cityName.toLowerCase().trim();

    // 1. Corrispondenza esatta sul nome della città (es. "Toronto", "Tokyo", "Londra")
    if (this.cityMarkersMap.has(q)) {
      const item = this.cityMarkersMap.get(q);
      this.map.flyTo([item.lat, item.lng], 9, { duration: 1.2 });
      setTimeout(() => { item.marker.openPopup(); }, 1250);
      return true;
    }

    // 2. Corrispondenza parziale sul nome della città
    for (const [key, item] of this.cityMarkersMap.entries()) {
      if (key.includes(q) || q.includes(key)) {
        this.map.flyTo([item.lat, item.lng], 9, { duration: 1.2 });
        setTimeout(() => { item.marker.openPopup(); }, 1250);
        return true;
      }
    }

    // 3. Corrispondenza su paese o regione (es. "Canada", "Ontario", "Giappone")
    for (const [key, item] of this.cityMarkersMap.entries()) {
      const country = (item.city.country || "").toLowerCase();
      const region = (item.city.region || "").toLowerCase();
      if (country === q || country.includes(q) || (region && region.includes(q))) {
        this.map.flyTo([item.lat, item.lng], 8, { duration: 1.2 });
        setTimeout(() => { item.marker.openPopup(); }, 1250);
        return true;
      }
    }
    return false;
  }

  flyToContinent(continentKey) {
    this.activeContinent = continentKey;
    const view = this.continentViews[continentKey] || this.continentViews["all"];
    this.map.flyTo(view.center, view.zoom, {
      duration: 1.4,
      easeLinearity: 0.25
    });
  }

  flyToCoordinates(lat, lng, zoomLevel = 6) {
    this.map.flyTo([lat, lng], zoomLevel, {
      duration: 1.5,
      easeLinearity: 0.25
    });
  }

  resetView() {
    this.flyToContinent("all");
  }

  refreshMap() {
    this.refreshVisitedData();
    this.renderGeoJson();
    this.renderCityMarkers();
  }
}

// Istanza globale
window.travelMap = new TravelMap("world-map");
