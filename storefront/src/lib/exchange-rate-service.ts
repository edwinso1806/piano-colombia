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

/**
 * Normaliza y calcula el precio en USD real de una partitura.
 * Corrige valores en centavos (ej: 900 -> 9.00 USD) o valores de prueba desfasados,
 * garantizando que la conversión sea matemáticamente fidedigna a la TRM oficial.
 */
export function getRealisticScorePriceUSD(
  priceCOP: number,
  rawPriceUSD?: number | null,
  exchangeRate: number = DEFAULT_COP_USD_RATE
): number {
  const safeCop = Number(priceCOP) || 0;
  const calculatedUsd = convertCopToUsd(safeCop > 0 ? safeCop : 45000, exchangeRate);

  if (rawPriceUSD === undefined || rawPriceUSD === null || rawPriceUSD <= 0) {
    return calculatedUsd;
  }

  let candidate = Number(rawPriceUSD);
  if (isNaN(candidate) || candidate <= 0) {
    return calculatedUsd;
  }

  // Si el valor guardado está en centavos (ej: 900 para $9.00 USD, 1100 para $11.00 USD)
  if (candidate >= 100) {
    candidate = Number((candidate / 100).toFixed(2));
  }

  // Validar si el precio en USD candidato guarda proporción con el precio en COP
  const ratio = calculatedUsd > 0 ? candidate / calculatedUsd : 1;
  if (ratio >= 0.4 && ratio <= 2.5) {
    return candidate % 1 === 0 ? candidate : Number(candidate.toFixed(2));
  }

  return calculatedUsd % 1 === 0 ? calculatedUsd : Number(calculatedUsd.toFixed(2));
}
