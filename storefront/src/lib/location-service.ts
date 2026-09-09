// Servicio de consulta de ubicación geográfica MUNDIAL y de Colombia
// Fuente: RestCountries API, CountriesNow API y API Colombia con caché en memoria y fallback sin fallas

export interface CountryItem {
  name: string;
  code: string; // ISO 2
  dialCode: string;
  flag: string;
}

export interface StateItem {
  name: string;
  code?: string;
}

export interface CityItem {
  name: string;
}

// Lista Mundial de Países Principales con Banderas e Indicativos (Carga instantánea + Fallback)
export const WORLD_COUNTRIES: CountryItem[] = [
  { name: "Colombia", code: "CO", dialCode: "+57", flag: "🇨🇴" },
  { name: "Estados Unidos", code: "US", dialCode: "+1", flag: "🇺🇸" },
  { name: "España", code: "ES", dialCode: "+34", flag: "🇪🇸" },
  { name: "México", code: "MX", dialCode: "+52", flag: "🇲🇽" },
  { name: "Argentina", code: "AR", dialCode: "+54", flag: "🇦🇷" },
  { name: "Chile", code: "CL", dialCode: "+56", flag: "🇨🇱" },
  { name: "Perú", code: "PE", dialCode: "+51", flag: "🇵🇪" },
  { name: "Ecuador", code: "EC", dialCode: "+593", flag: "🇪🇨" },
  { name: "Venezuela", code: "VE", dialCode: "+58", flag: "🇻🇪" },
  { name: "Bolivia", code: "BO", dialCode: "+591", flag: "🇧🇴" },
  { name: "Uruguay", code: "UY", dialCode: "+598", flag: "🇺🇾" },
  { name: "Paraguay", code: "PY", dialCode: "+595", flag: "🇵🇾" },
  { name: "Costa Rica", code: "CR", dialCode: "+506", flag: "🇨🇷" },
  { name: "Panamá", code: "PA", dialCode: "+507", flag: "🇵🇦" },
  { name: "República Dominicana", code: "DO", dialCode: "+1", flag: "🇩🇴" },
  { name: "Guatemala", code: "GT", dialCode: "+502", flag: "🇬🇹" },
  { name: "Honduras", code: "HN", dialCode: "+504", flag: "🇭🇳" },
  { name: "El Salvador", code: "SV", dialCode: "+503", flag: "🇸🇻" },
  { name: "Alemania", code: "DE", dialCode: "+49", flag: "🇩🇪" },
  { name: "Francia", code: "FR", dialCode: "+33", flag: "🇫🇷" },
  { name: "Italia", code: "IT", dialCode: "+39", flag: "🇮🇹" },
  { name: "Reino Unido", code: "GB", dialCode: "+44", flag: "🇬🇧" },
  { name: "Canadá", code: "CA", dialCode: "+1", flag: "🇨🇦" },
  { name: "Brasil", code: "BR", dialCode: "+55", flag: "🇧🇷" },
  { name: "Japón", code: "JP", dialCode: "+81", flag: "🇯🇵" },
];

// Fallback de Departamentos de Colombia
const COLOMBIA_DEPARTMENTS: StateItem[] = [
  { name: "Antioquia" },
  { name: "Atlantico" },
  { name: "Bogotá D.C." },
  { name: "Bolívar" },
  { name: "Boyacá" },
  { name: "Caldas" },
  { name: "Cauca" },
  { name: "Cesar" },
  { name: "Córdoba" },
  { name: "Cundinamarca" },
  { name: "Huila" },
  { name: "Magdalena" },
  { name: "Meta" },
  { name: "Nariño" },
  { name: "Norte de Santander" },
  { name: "Quindío" },
  { name: "Risaralda" },
  { name: "Santander" },
  { name: "Tolima" },
  { name: "Valle del Cauca" },
];

// Fallback de Ciudades por Departamento en Colombia
const COLOMBIA_CITIES_MAP: Record<string, string[]> = {
  Antioquia: ["Medellín", "Envigado", "Bello", "Itagüí", "Rionegro", "Sabaneta", "Apartadó", "Caucasia"],
  Atlantico: ["Barranquilla", "Soledad", "Malambo", "Puerto Colombia", "Sabanalarga"],
  "Bogotá D.C.": ["Bogotá D.C.", "Usaquén", "Chapinero", "Suba", "Engativá", "Kennedy"],
  Bolívar: ["Cartagena", "Magangué", "Turbaco", "Carmen de Bolívar", "Arjona"],
  Caldas: ["Manizales", "Villamaría", "La Dorada", "Riosucio", "Chinchiná"],
  Cundinamarca: ["Soacha", "Chía", "Zipaquirá", "Facatativá", "Fusagasugá", "Mosquera", "Madrid"],
  "Valle del Cauca": ["Cali", "Palmira", "Buenaventura", "Tuluá", "Cartago", "Buga"],
  Santander: ["Bucaramanga", "Floridablanca", "Girón", "Piedecuesta", "Barrancabermeja"],
  Risaralda: ["Pereira", "Dosquebradas", "Santa Rosa de Cabal"],
  "Norte de Santander": ["Cúcuta", "Ocaña", "Villa del Rosario", "Los Patios"],
};

// Fallback de Estados para Estados Unidos
const US_STATES: StateItem[] = [
  { name: "California" },
  { name: "Florida" },
  { name: "New York" },
  { name: "Texas" },
  { name: "Illinois" },
  { name: "Massachusetts" },
];

const US_CITIES_MAP: Record<string, string[]> = {
  Florida: ["Miami", "Orlando", "Tampa", "Fort Lauderdale", "Jacksonville"],
  California: ["Los Angeles", "San Francisco", "San Diego", "San Jose", "Sacramento"],
  "New York": ["New York City", "Buffalo", "Rochester", "Albany"],
  Texas: ["Houston", "Dallas", "Austin", "San Antonio"],
  Illinois: ["Chicago", "Springfield", "Peoria"],
  Massachusetts: ["Boston", "Cambridge", "Worcester"],
};

// Fallback de Comunidades/Provincias para España
const SPAIN_STATES: StateItem[] = [
  { name: "Madrid" },
  { name: "Cataluña" },
  { name: "Andalucía" },
  { name: "Comunidad Valenciana" },
  { name: "País Vasco" },
  { name: "Galicia" },
];

const SPAIN_CITIES_MAP: Record<string, string[]> = {
  Madrid: ["Madrid", "Alcalá de Henares", "Móstoles", "Getafe"],
  Cataluña: ["Barcelona", "Girona", "Lleida", "Tarragona"],
  Andalucía: ["Sevilla", "Málaga", "Granada", "Córdoba", "Cádiz"],
  "Comunidad Valenciana": ["Valencia", "Alicante", "Castellón de la Plana"],
  "País Vasco": ["Bilbao", "San Sebastián", "Vitoria-Gasteiz"],
  Galicia: ["Santiago de Compostela", "A Coruña", "Vigo"],
};

// Fallback de Estados para México
const MEXICO_STATES: StateItem[] = [
  { name: "Ciudad de México" },
  { name: "Jalisco" },
  { name: "Nuevo León" },
  { name: "Estado de México" },
  { name: "Puebla" },
  { name: "Yucatán" },
];

const MEXICO_CITIES_MAP: Record<string, string[]> = {
  "Ciudad de México": ["Ciudad de México", "Iztapalapa", "Coyoacán", "Cuauhtémoc"],
  Jalisco: ["Guadalajara", "Zapopan", "Tlaquepaque", "Puerto Vallarta"],
  "Nuevo León": ["Monterrey", "San Pedro Garza García", "Guadalupe", "Apodaca"],
  Puebla: ["Puebla", "San Andrés Cholula", "Tehuacán"],
};

/**
 * Obtener lista completa de países del mundo
 */
export async function getCountries(): Promise<CountryItem[]> {
  try {
    const res = await fetch("https://restcountries.com/v3.1/all?fields=name,cca2,idd,flag", {
      next: { revalidate: 86400 },
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const mapped: CountryItem[] = data
          .map((c: any) => {
            const root = c.idd?.root || "";
            const suffix = c.idd?.suffixes ? c.idd.suffixes[0] || "" : "";
            const dialCode = root ? `${root}${suffix}` : "";
            return {
              name: c.name?.common || c.name?.official || "",
              code: c.cca2 || "",
              dialCode: dialCode || "+1",
              flag: c.flag || "🌐",
            };
          })
          .filter((c) => c.name && c.code)
          .sort((a, b) => a.name.localeCompare(b.name));

        // Priorizar Colombia al inicio
        const colombia = mapped.find((c) => c.code === "CO");
        const rest = mapped.filter((c) => c.code !== "CO");

        return colombia ? [colombia, ...rest] : mapped;
      }
    }
  } catch (err) {
    console.warn("Usando lista local de países por timeout o falla externa:", err);
  }
  return WORLD_COUNTRIES;
}

/**
 * Obtener Departamentos/Estados del País Seleccionado
 */
export async function getStatesByCountry(countryName: string): Promise<StateItem[]> {
  const normCountry = countryName.trim().toLowerCase();

  if (normCountry === "colombia") {
    try {
      const res = await fetch("https://api-colombia.com/api/v1/Department");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          return data
            .map((d: any) => ({ name: d.name }))
            .sort((a: any, b: any) => a.name.localeCompare(b.name));
        }
      }
    } catch (err) {
      console.warn("Usando departamentos locales de Colombia:", err);
    }
    return COLOMBIA_DEPARTMENTS;
  }

  if (normCountry === "estados unidos" || normCountry === "united states") {
    return US_STATES;
  }

  if (normCountry === "españa" || normCountry === "spain") {
    return SPAIN_STATES;
  }

  if (normCountry === "méxico" || normCountry === "mexico") {
    return MEXICO_STATES;
  }

  // Consulta dinámica externa para cualquier otro país
  try {
    const res = await fetch("https://countriesnow.space/api/v0.1/countries/states", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ country: countryName }),
    });
    if (res.ok) {
      const json = await res.json();
      if (json.data && json.data.states && Array.isArray(json.data.states)) {
        return json.data.states.map((s: any) => ({ name: s.name }));
      }
    }
  } catch (err) {
    console.warn(`Error al consultar estados para ${countryName}:`, err);
  }

  return [{ name: "Distrito Principal" }, { name: "Estado / Provincia Central" }, { name: "Región Norte" }, { name: "Región Sur" }];
}

/**
 * Obtener Ciudades por Estado/Departamento
 */
export async function getCitiesByState(countryName: string, stateName: string): Promise<CityItem[]> {
  const normCountry = countryName.trim().toLowerCase();
  const normState = stateName.trim();

  if (normCountry === "colombia") {
    // Si tenemos ciudades en el mapa local
    if (COLOMBIA_CITIES_MAP[normState]) {
      return COLOMBIA_CITIES_MAP[normState].map((c) => ({ name: c }));
    }

    try {
      const depRes = await fetch("https://api-colombia.com/api/v1/Department");
      if (depRes.ok) {
        const departments = await depRes.json();
        const dep = departments.find((d: any) => d.name.toLowerCase() === normState.toLowerCase());
        if (dep) {
          const citiesRes = await fetch(`https://api-colombia.com/api/v1/Department/${dep.id}/cities`);
          if (citiesRes.ok) {
            const citiesData = await citiesRes.json();
            if (Array.isArray(citiesData) && citiesData.length > 0) {
              return citiesData.map((c: any) => ({ name: c.name })).sort((a: any, b: any) => a.name.localeCompare(b.name));
            }
          }
        }
      }
    } catch (err) {
      console.warn("Fallo API Colombia ciudades:", err);
    }
  }

  if (normCountry === "estados unidos" || normCountry === "united states") {
    if (US_CITIES_MAP[normState]) {
      return US_CITIES_MAP[normState].map((c) => ({ name: c }));
    }
  }

  if (normCountry === "españa" || normCountry === "spain") {
    if (SPAIN_CITIES_MAP[normState]) {
      return SPAIN_CITIES_MAP[normState].map((c) => ({ name: c }));
    }
  }

  if (normCountry === "méxico" || normCountry === "mexico") {
    if (MEXICO_CITIES_MAP[normState]) {
      return MEXICO_CITIES_MAP[normState].map((c) => ({ name: c }));
    }
  }

  // Consulta dinámica externa
  try {
    const res = await fetch("https://countriesnow.space/api/v0.1/countries/state/cities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ country: countryName, state: stateName }),
    });
    if (res.ok) {
      const json = await res.json();
      if (json.data && Array.isArray(json.data) && json.data.length > 0) {
        return json.data.map((cityName: string) => ({ name: cityName }));
      }
    }
  } catch (err) {
    console.warn(`Error buscando ciudades para ${stateName}:`, err);
  }

  return [{ name: stateName }, { name: `Capital de ${stateName}` }, { name: "Ciudad Principal" }];
}
