/**
 * TRUST Business Simulator - Capa de Dominio: Barril de Constantes y Catálogos
 * 
 * Re-exporta los catálogos modulares del dominio cumpliendo SRP y OCP.
 */

export { INDUSTRIES } from './industry_catalog.js';
export { COUNTRIES, resolve_country_profile } from './country_catalog.js';
export { COMPANY_SCALES, get_scale_archetype } from './scale_archetypes.js';
export {
  COMPLEXITY_LEVELS,
  MACRO_PRESETS,
  EVALUATION_PRESETS,
  MARKET_EVENTS,
  DEFAULT_NEUTRAL_EVENT
} from './scenario_presets.js';
