/**
 * TRUST Business Simulator - Capa de Dominio: Arquetipos de Escala Empresarial
 * 
 * Implementa el Principio Abierto/Cerrado (SOLID - OCP):
 * Cada tamaño empresarial encapsula sus propios multiplicadores económicos
 * (escala de demanda, estructura de costos fijos, presupuesto comercial base,
 * prima de riesgo crediticio y agilidad operativa) sin requerir condicionales
 * rígidos en los motores contables o de demanda.
 */

export const COMPANY_SCALES = Object.freeze({
  'Micro / MYPE': {
    id: 'Micro / MYPE',
    name: 'Microempresa / MYPE',
    description: 'Operación local ágil con bajos costos fijos de estructura, pero menor escala de producción y mayor costo de financiamiento bancario.',
    demand_scale_factor: 0.15,
    fixed_cost_multiplier: 0.06,
    default_marketing_budget: 1500,
    people_cost_unit: 55,
    credit_spread_percent: 6.5,
    agility_bonus: 1.08
  },
  'Pequeña': {
    id: 'Pequeña',
    name: 'Pequeña Empresa (Pyme)',
    description: 'Estructura formal en consolidación regional. Costos fijos moderados y capacidad de adaptación rápida a nichos de mercado.',
    demand_scale_factor: 0.45,
    fixed_cost_multiplier: 0.65,
    default_marketing_budget: 5500,
    people_cost_unit: 260,
    credit_spread_percent: 3.5,
    agility_bonus: 1.04
  },
  'Mediana': {
    id: 'Mediana',
    name: 'Mediana Empresa',
    description: 'Escala industrial estándar con equilibrio entre costos fijos operativos, acceso a canales comerciales y crédito corporativo.',
    demand_scale_factor: 1.00,
    fixed_cost_multiplier: 1.00,
    default_marketing_budget: 12000,
    people_cost_unit: 420,
    credit_spread_percent: 1.0,
    agility_bonus: 1.00
  },
  'Grande': {
    id: 'Grande',
    name: 'Gran Corporación',
    description: 'Alta capacidad instalada, fuertes gastos fijos de planta, acceso a tasas de interés preferenciales y marketing masivo.',
    demand_scale_factor: 1.80,
    fixed_cost_multiplier: 1.60,
    default_marketing_budget: 28000,
    people_cost_unit: 650,
    credit_spread_percent: -1.0,
    agility_bonus: 0.96
  },
  'Startup': {
    id: 'Startup',
    name: 'Startup / Alto Crecimiento',
    description: 'Estructura física liviana enfocada en talento, digitalización e innovación rápida con alta sensibilidad al crecimiento.',
    demand_scale_factor: 0.35,
    fixed_cost_multiplier: 0.35,
    default_marketing_budget: 8000,
    people_cost_unit: 380,
    credit_spread_percent: 4.5,
    agility_bonus: 1.12
  }
});

/**
 * Obtiene el arquetipo de escala empresarial aplicando fallback seguro a 'Mediana'.
 * @param {string} scale_id
 * @returns {Object}
 */
export function get_scale_archetype(scale_id) {
  return COMPANY_SCALES[scale_id] || COMPANY_SCALES['Mediana'];
}
