/**
 * TRUST Business Simulator - Capa de Negocio: Proveedor de Datos Macroeconómicos en Vivo
 * 
 * Aplica los principios SOLID (Liskov Substitution y Dependency Inversion) para
 * consultar indicadores macroeconómicos reales en Internet (World Bank Open Data API
 * y REST Countries API) con fallback resiliente a datos curados locales.
 */

import { COUNTRIES, resolve_country_profile } from '../domain/country_catalog.js';
import { MacroParameters } from '../domain/entities.js';
import { Logger } from '../utils/logger.js';

const logger = new Logger('MacroDataProvider');

/**
 * Contrato base para proveedores de datos macroeconómicos (SOLID - LSP / ISP).
 */
export class IMacroDataProvider {
  /**
   * @param {string} country_query - Código ISO ('PE', 'CO') o nombre ('Bolivia')
   * @returns {Promise<MacroParameters|null>}
   */
  async fetch_macro_indicators(country_query) {
    throw new Error('Método fetch_macro_indicators debe ser implementado por la subclase');
  }
}

/**
 * Proveedor en vivo que consulta World Bank Open Data API y RestCountries en Internet.
 */
export class WorldBankLiveProvider extends IMacroDataProvider {
  /**
   * @param {Function} [fetch_client] - Inyección de dependencia para fetch (facilita tests)
   * @param {number} [timeout_ms=4500]
   */
  constructor(fetch_client = null, timeout_ms = 4500) {
    super();
    this.fetch_client = fetch_client || (typeof fetch !== 'undefined' ? fetch.bind(globalThis) : null);
    this.timeout_ms = timeout_ms;
  }

  async _fetch_json(url) {
    if (!this.fetch_client) return null;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeout_ms);
    try {
      const response = await this.fetch_client(url, { signal: controller.signal });
      if (!response.ok) return null;
      return await response.json();
    } catch (err) {
      logger.debug(`Fallo de red consultando ${url}`, { error: err.message });
      return null;
    } finally {
      clearTimeout(timer);
    }
  }

  _extract_latest_value(wb_payload) {
    if (!Array.isArray(wb_payload) || !Array.isArray(wb_payload[1])) return null;
    const valid_entry = wb_payload[1].find(item => item && item.value !== null && !isNaN(item.value));
    if (!valid_entry) return null;
    return {
      value: Number(Number(valid_entry.value).toFixed(1)),
      year: String(valid_entry.date || '2025')
    };
  }

  /**
   * Resuelve código ISO y divisa de cualquier país por nombre usando REST Countries API.
   * @param {string} country_name
   * @returns {Promise<{iso3: string, name: string, currency: string, symbol: string}|null>}
   */
  async resolve_custom_country_online(country_name) {
    const clean = String(country_name || '').trim();
    if (!clean) return null;
    const url = `https://restcountries.com/v3.1/name/${encodeURIComponent(clean)}?fields=cca2,cca3,name,currencies`;
    const data = await this._fetch_json(url);
    if (!Array.isArray(data) || data.length === 0) return null;

    const match = data[0];
    const currencies = match.currencies ? Object.entries(match.currencies) : [];
    const [curr_code, curr_info] = currencies[0] || ['USD', { name: 'Dólar', symbol: '$' }];
    const symbol = curr_info.symbol || '$';
    return {
      id: match.cca2 || clean.slice(0, 2).toUpperCase(),
      iso3: match.cca3 || 'WLD',
      name: match.name?.common || clean,
      currency: `${curr_code} — ${curr_info.name || curr_code} (${symbol})`,
      symbol
    };
  }

  async fetch_macro_indicators(country_query) {
    if (!this.fetch_client) return null;

    const catalog_entry = COUNTRIES[country_query];
    let iso_code = catalog_entry ? catalog_entry.iso3 : String(country_query || '').trim().toUpperCase();

    if (!catalog_entry && iso_code.length > 3) {
      const resolved = await this.resolve_custom_country_online(country_query);
      if (resolved) iso_code = resolved.iso3;
    }

    if (!iso_code || iso_code === 'CUSTOM' || iso_code === 'WLD') return null;

    const base_url = `https://api.worldbank.org/v2/country/${encodeURIComponent(iso_code)}/indicator`;
    const [inf_raw, gdp_raw, int_raw] = await Promise.all([
      this._fetch_json(`${base_url}/FP.CPI.TOTL.ZG?format=json&per_page=5`),
      this._fetch_json(`${base_url}/NY.GDP.MKTP.KD.ZG?format=json&per_page=5`),
      this._fetch_json(`${base_url}/FR.INR.LEND?format=json&per_page=5`)
    ]);

    const inf = this._extract_latest_value(inf_raw);
    const gdp = this._extract_latest_value(gdp_raw);
    const interest = this._extract_latest_value(int_raw);

    if (!inf && !gdp) return null;

    const fallback_base = catalog_entry?.baseline_macro || COUNTRIES.CUSTOM.baseline_macro;
    const final_gdp = gdp ? gdp.value : fallback_base.gdp;
    const final_inf = inf ? inf.value : fallback_base.inflation;
    const final_int = interest ? interest.value : Math.max(2.5, Number((final_inf + 3.5).toFixed(1)));
    const demand_growth = Number(Math.max(-8.0, Math.min(15.0, final_gdp * 1.15 + 0.8)).toFixed(1));
    const ref_year = (gdp && gdp.year) || (inf && inf.year) || '2025';

    return new MacroParameters({
      inflation: final_inf,
      gdp: final_gdp,
      interest: final_int,
      demand_growth,
      source: 'World Bank Open Data (Internet)',
      reference_year: ref_year
    });
  }
}

/**
 * Proveedor local de respaldo basado en el catálogo económico curado.
 */
export class CuratedFallbackMacroProvider extends IMacroDataProvider {
  async fetch_macro_indicators(country_query) {
    const profile = resolve_country_profile(country_query);
    const base = profile.baseline_macro || COUNTRIES.CUSTOM.baseline_macro;
    return new MacroParameters({
      inflation: base.inflation,
      gdp: base.gdp,
      interest: base.interest,
      demand_growth: base.demand_growth,
      source: `Catálogo Económico Base (${profile.name})`,
      reference_year: '2026'
    });
  }
}

/**
 * Servicio orquestador con cadena de responsabilidad (Live -> Fallback).
 */
export class MacroEconomicService {
  constructor(providers = null) {
    this.live_provider = new WorldBankLiveProvider();
    this.fallback_provider = new CuratedFallbackMacroProvider();
    this.providers = providers || [this.live_provider, this.fallback_provider];
  }

  async get_country_macro(country_query) {
    for (const provider of this.providers) {
      try {
        const result = await provider.fetch_macro_indicators(country_query);
        if (result) {
          logger.info(`Datos macroeconómicos obtenidos para "${country_query}" vía ${result.source}`);
          return result;
        }
      } catch (err) {
        logger.warn(`Proveedor macro falló para ${country_query}`, err);
      }
    }
    return this.fallback_provider.fetch_macro_indicators('PE');
  }
}
