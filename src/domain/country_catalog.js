/**
 * TRUST Business Simulator - Capa de Dominio: Catálogo Global de Países y Divisas
 * 
 * Soporta un catálogo internacional preconfigurado y permite registrar
 * o resolver cualquier país personalizado ingresado por el docente (SOLID - OCP).
 */

export const COUNTRIES = Object.freeze({
  PE: { id: 'PE', iso3: 'PER', name: 'Perú', currency: 'PEN — Sol peruano (S/)', symbol: 'S/', region: 'LATAM', baseline_macro: { inflation: 2.8, gdp: 3.1, interest: 6.25, demand_growth: 4.2 } },
  CO: { id: 'CO', iso3: 'COL', name: 'Colombia', currency: 'COP — Peso colombiano ($)', symbol: '$', region: 'LATAM', baseline_macro: { inflation: 5.4, gdp: 2.6, interest: 9.75, demand_growth: 3.8 } },
  CL: { id: 'CL', iso3: 'CHL', name: 'Chile', currency: 'CLP — Peso chileno ($)', symbol: '$', region: 'LATAM', baseline_macro: { inflation: 3.9, gdp: 2.5, interest: 5.5, demand_growth: 3.5 } },
  MX: { id: 'MX', iso3: 'MEX', name: 'México', currency: 'MXN — Peso mexicano ($)', symbol: '$', region: 'LATAM', baseline_macro: { inflation: 4.4, gdp: 2.3, interest: 10.25, demand_growth: 3.6 } },
  AR: { id: 'AR', iso3: 'ARG', name: 'Argentina', currency: 'ARS — Peso argentino ($)', symbol: '$', region: 'LATAM', baseline_macro: { inflation: 45.0, gdp: 3.5, interest: 38.0, demand_growth: 2.5 } },
  BR: { id: 'BR', iso3: 'BRA', name: 'Brasil', currency: 'BRL — Real brasileño (R$)', symbol: 'R$', region: 'LATAM', baseline_macro: { inflation: 4.2, gdp: 2.9, interest: 10.75, demand_growth: 4.0 } },
  EC: { id: 'EC', iso3: 'ECU', name: 'Ecuador', currency: 'USD — Dólar estadounidense (US$)', symbol: '$', region: 'LATAM', baseline_macro: { inflation: 1.9, gdp: 1.8, interest: 8.5, demand_growth: 2.8 } },
  BO: { id: 'BO', iso3: 'BOL', name: 'Bolivia', currency: 'BOB — Boliviano (Bs)', symbol: 'Bs', region: 'LATAM', baseline_macro: { inflation: 4.8, gdp: 1.9, interest: 7.5, demand_growth: 2.5 } },
  UY: { id: 'UY', iso3: 'URY', name: 'Uruguay', currency: 'UYU — Peso uruguayo ($U)', symbol: '$U', region: 'LATAM', baseline_macro: { inflation: 4.9, gdp: 3.2, interest: 8.5, demand_growth: 3.9 } },
  PY: { id: 'PY', iso3: 'PRY', name: 'Paraguay', currency: 'PYG — Guaraní (₲)', symbol: '₲', region: 'LATAM', baseline_macro: { inflation: 3.8, gdp: 4.0, interest: 6.0, demand_growth: 4.8 } },
  CR: { id: 'CR', iso3: 'CRI', name: 'Costa Rica', currency: 'CRC — Colón costarricense (₡)', symbol: '₡', region: 'LATAM', baseline_macro: { inflation: 1.8, gdp: 4.3, interest: 4.75, demand_growth: 4.5 } },
  PA: { id: 'PA', iso3: 'PAN', name: 'Panamá', currency: 'USD — Dólar / Balboa (B/.)', symbol: 'B/.', region: 'LATAM', baseline_macro: { inflation: 1.5, gdp: 3.8, interest: 6.5, demand_growth: 4.4 } },
  DO: { id: 'DO', iso3: 'DOM', name: 'República Dominicana', currency: 'DOP — Peso dominicano (RD$)', symbol: 'RD$', region: 'LATAM', baseline_macro: { inflation: 3.6, gdp: 5.0, interest: 7.0, demand_growth: 5.5 } },
  GT: { id: 'GT', iso3: 'GTM', name: 'Guatemala', currency: 'GTQ — Quetzal (Q)', symbol: 'Q', region: 'LATAM', baseline_macro: { inflation: 3.4, gdp: 3.5, interest: 5.0, demand_growth: 4.1 } },
  US: { id: 'US', iso3: 'USA', name: 'Estados Unidos', currency: 'USD — Dólar estadounidense (US$)', symbol: '$', region: 'NAM', baseline_macro: { inflation: 2.6, gdp: 2.4, interest: 4.75, demand_growth: 3.2 } },
  CA: { id: 'CA', iso3: 'CAN', name: 'Canadá', currency: 'CAD — Dólar canadiense (C$)', symbol: 'C$', region: 'NAM', baseline_macro: { inflation: 2.2, gdp: 1.9, interest: 3.75, demand_growth: 2.8 } },
  ES: { id: 'ES', iso3: 'ESP', name: 'España', currency: 'EUR — Euro (€)', symbol: '€', region: 'EU', baseline_macro: { inflation: 2.4, gdp: 2.7, interest: 3.25, demand_growth: 3.1 } },
  DE: { id: 'DE', iso3: 'DEU', name: 'Alemania', currency: 'EUR — Euro (€)', symbol: '€', region: 'EU', baseline_macro: { inflation: 2.1, gdp: 1.1, interest: 3.25, demand_growth: 2.0 } },
  FR: { id: 'FR', iso3: 'FRA', name: 'Francia', currency: 'EUR — Euro (€)', symbol: '€', region: 'EU', baseline_macro: { inflation: 2.0, gdp: 1.3, interest: 3.25, demand_growth: 2.2 } },
  GB: { id: 'GB', iso3: 'GBR', name: 'Reino Unido', currency: 'GBP — Libra esterlina (£)', symbol: '£', region: 'EU', baseline_macro: { inflation: 2.5, gdp: 1.5, interest: 4.75, demand_growth: 2.4 } },
  IT: { id: 'IT', iso3: 'ITA', name: 'Italia', currency: 'EUR — Euro (€)', symbol: '€', region: 'EU', baseline_macro: { inflation: 1.8, gdp: 1.0, interest: 3.25, demand_growth: 1.9 } },
  CN: { id: 'CN', iso3: 'CHN', name: 'China', currency: 'CNY — Yuan renminbi (¥)', symbol: '¥', region: 'ASIA', baseline_macro: { inflation: 0.9, gdp: 4.8, interest: 3.45, demand_growth: 5.2 } },
  JP: { id: 'JP', iso3: 'JPN', name: 'Japón', currency: 'JPY — Yen japonés (¥)', symbol: '¥', region: 'ASIA', baseline_macro: { inflation: 2.3, gdp: 1.0, interest: 0.5, demand_growth: 1.6 } },
  KR: { id: 'KR', iso3: 'KOR', name: 'Corea del Sur', currency: 'KRW — Won surcoreano (₩)', symbol: '₩', region: 'ASIA', baseline_macro: { inflation: 2.1, gdp: 2.3, interest: 3.25, demand_growth: 3.0 } },
  IN: { id: 'IN', iso3: 'IND', name: 'India', currency: 'INR — Rupia india (₹)', symbol: '₹', region: 'ASIA', baseline_macro: { inflation: 4.6, gdp: 6.8, interest: 6.5, demand_growth: 7.2 } },
  CUSTOM: { id: 'CUSTOM', iso3: 'WLD', name: 'Otro país (Personalizado)', currency: 'USD — Moneda personalizada ($)', symbol: '$', region: 'GLOBAL', baseline_macro: { inflation: 3.0, gdp: 3.0, interest: 7.0, demand_growth: 4.0 } }
});

/**
 * Resuelve un perfil de país del catálogo o construye uno dinámico para cualquier país del mundo.
 * @param {string} country_id
 * @param {Object} [custom_overrides]
 * @returns {Object}
 */
export function resolve_country_profile(country_id, custom_overrides = {}) {
  const base = COUNTRIES[country_id] || COUNTRIES.CUSTOM;
  if (country_id !== 'CUSTOM' && COUNTRIES[country_id] && !custom_overrides.custom_name) {
    return base;
  }

  const name = (custom_overrides.custom_name || base.name).trim();
  const symbol = (custom_overrides.custom_symbol || base.symbol || '$').trim();
  const currency = (custom_overrides.custom_currency || `${symbol} — Moneda de ${name}`).trim();
  const iso_code = (custom_overrides.custom_iso || country_id || 'WLD').toUpperCase().trim();

  return {
    ...base,
    id: iso_code,
    iso3: iso_code,
    name,
    currency,
    symbol
  };
}
