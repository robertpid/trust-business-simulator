/**
 * TRUST Business Simulator - Capa de Dominio: Presets de Escenario y Eventos
 * 
 * Define los niveles de complejidad pedagógica, presets macroeconómicos,
 * perfiles de evaluación y el catálogo de eventos de mercado.
 */

export const COMPLEXITY_LEVELS = Object.freeze({
  1: {
    level: 1,
    name: 'Nivel 1 — Fundamentos',
    desc: 'Decisiones esenciales para comprender la relación entre precio, demanda, costos y resultado.',
    modules: ['Comercial', 'Marketing básico', 'Compras/Producción', 'Personas', 'Inventario', 'Caja', 'Estado de resultados']
  },
  2: {
    level: 2,
    name: 'Nivel 2 — Gestión empresarial',
    desc: 'Añade capacidad, calidad, inversiones, capital de trabajo, financiamiento, ratios y logística.',
    modules: ['Comercial', 'Marketing', 'Operaciones', 'Inventarios', 'Calidad', 'Inversiones', 'Personas', 'Finanzas', 'Capital de trabajo', 'Logística', 'Ratios']
  },
  3: {
    level: 3,
    name: 'Nivel 3 — Dirección estratégica',
    desc: 'Añade múltiples mercados, comercio exterior, divisas, I+D, riesgo y decisiones estratégicas.',
    modules: ['Comercial', 'Marketing', 'Operaciones', 'Calidad', 'Inversiones', 'Personas', 'Finanzas avanzadas', 'Logística', 'Comercio exterior', 'Tipo de cambio', 'I+D', 'Riesgo', 'Estrategia']
  }
});

export const MACRO_PRESETS = Object.freeze({
  Estable: { inflation: 3.0, gdp: 3.2, interest: 8.5, demand_growth: 5.0 },
  Crecimiento: { inflation: 4.0, gdp: 5.5, interest: 9.0, demand_growth: 9.0 },
  Volátil: { inflation: 7.0, gdp: 2.0, interest: 13.0, demand_growth: 3.0 },
  Recesivo: { inflation: 6.0, gdp: -2.0, interest: 14.0, demand_growth: -5.0 }
});

export const EVALUATION_PRESETS = Object.freeze({
  Equilibrado: { finance: 20, marketing: 20, operations: 20, people: 20, strategy: 20 },
  Finanzas: { finance: 45, marketing: 15, operations: 15, people: 10, strategy: 15 },
  Comercial: { finance: 20, marketing: 45, operations: 10, people: 10, strategy: 15 },
  Operaciones: { finance: 20, marketing: 10, operations: 45, people: 10, strategy: 15 },
  Personas: { finance: 15, marketing: 10, operations: 15, people: 45, strategy: 15 },
  Estratégico: { finance: 20, marketing: 20, operations: 20, people: 10, strategy: 30 }
});

export const MARKET_EVENTS = Object.freeze([
  {
    id: 'event_raw_materials',
    name: 'Aumento de materias primas',
    text: 'Incrementa el costo variable de toda la industria.',
    cost_multiplier: 1.12,
    demand_multiplier: 1.00
  },
  {
    id: 'event_demand_expansion',
    name: 'Expansión de la demanda',
    text: 'El mercado crece por encima de lo previsto.',
    cost_multiplier: 1.00,
    demand_multiplier: 1.15
  },
  {
    id: 'event_economic_contraction',
    name: 'Contracción económica',
    text: 'Se reduce la demanda agregada.',
    cost_multiplier: 1.00,
    demand_multiplier: 0.88
  },
  {
    id: 'event_wage_pressure',
    name: 'Presión salarial',
    text: 'Aumentan los costos asociados a personal.',
    cost_multiplier: 1.04,
    demand_multiplier: 1.00
  },
  {
    id: 'event_logistics_shock',
    name: 'Shock de eficiencia logística',
    text: 'La disponibilidad efectiva se reduce temporalmente.',
    cost_multiplier: 1.03,
    demand_multiplier: 0.97
  },
  {
    id: 'event_baseline',
    name: 'Sin evento extraordinario',
    text: 'La ronda sigue el escenario base.',
    cost_multiplier: 1.00,
    demand_multiplier: 1.00
  }
]);

export const DEFAULT_NEUTRAL_EVENT = MARKET_EVENTS[MARKET_EVENTS.length - 1];
