/**
 * Servicio de Tasa de Cambio TRM (USD / COP) para Piano Colombia.
 * Consulta la tasa de cambio en tiempo real mediante API pública de divisas,
 * con almacenamiento en caché local (1 hora) y valor de respaldo (fallback).
 */

const DEFAULT_COP_USD_RATE = 3900;
const CACHE_KEY = "piano_colombia_trm_rate";
const CACHE_TIME_KEY = "piano_colombia_trm_time";
const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hora en milisegundos

let memoryCachedRate: number | null = null;

export async function getUsdCopExchangeRate(): Promise<{ rate: number; isLive: boolean }> {
  // 1. Verificar caché en memoria
  if (memoryCachedRate && memoryCachedRate > 0) {
    return { rate: memoryCachedRate, isLive: true };
  }

  // 2. Verificar caché en localStorage del navegador
  if (typeof window !== "undefined") {
    try {
      const storedRate = localStorage.getItem(CACHE_KEY);
      const storedTime = localStorage.getItem(CACHE_TIME_KEY);

      if (storedRate && storedTime) {
        const elapsed = Date.now() - parseInt(storedTime, 10);
        if (elapsed < CACHE_DURATION_MS) {
          const parsedRate = parseFloat(storedRate);
          if (parsedRate > 2000 && parsedRate < 10000) {
            memoryCachedRate = parsedRate;
            return { rate: parsedRate, isLive: true };
          }
        }
      }
    } catch {
      // Ignorar restricciones de almacenamiento
    }
  }

  // 3. Consultar API pública de tasa de cambio oficial
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD", {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.rates && typeof data.rates.COP === "number") {
        const rate = Math.round(data.rates.COP);
        memoryCachedRate = rate;
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem(CACHE_KEY, rate.toString());
            localStorage.setItem(CACHE_TIME_KEY, Date.now().toString());
          } catch {}
        }
        return { rate, isLive: true };
      }
    }
  } catch (err) {
    console.warn("Aviso: No se pudo consultar la TRM en vivo de la API, usando tasa de respaldo:", err);
  }

  // 4. Fallback si falla la solicitud o no hay red
  return { rate: DEFAULT_COP_USD_RATE, isLive: false };
}

export function convertCopToUsd(copAmount: number, rate: number = DEFAULT_COP_USD_RATE): number {
  if (!copAmount || copAmount <= 0 || !rate || rate <= 0) return 0;
  return Number((copAmount / rate).toFixed(2));
}

export function convertUsdToCop(usdAmount: number, rate: number = DEFAULT_COP_USD_RATE): number {
  if (!usdAmount || usdAmount <= 0 || !rate || rate <= 0) return 0;
  return Math.round(usdAmount * rate);
}
