/**
 * TRUST Business Simulator - Capa de Dominio: Catálogo de Industrias
 * 
 * Define los sectores económicos y sus elasticidades competitivas base.
 */

export const INDUSTRIES = Object.freeze({
  textile: {
    id: 'textile',
    name: 'Textil y confecciones',
    sector: 'Manufactura',
    note: 'Precio, producción, inventario, calidad y tendencia.',
    base_demand: 120000,
    base_price: 85,
    variable_cost: 38,
    weights: { price: 0.35, quality: 0.25, marketing: 0.20, service: 0.05, availability: 0.15 }
  },
  food: {
    id: 'food',
    name: 'Alimentos procesados',
    sector: 'Manufactura / Alimentos',
    note: 'Costos, capacidad, inocuidad, distribución y demanda.',
    base_demand: 150000,
    base_price: 12,
    variable_cost: 5.8,
    weights: { price: 0.25, quality: 0.30, marketing: 0.20, service: 0.05, availability: 0.20 }
  },
  cafe: {
    id: 'cafe',
    name: 'Cafeterías',
    sector: 'Servicios / Alimentos',
    note: 'Precio, experiencia, personal, calidad y capacidad de atención.',
    base_demand: 50000,
    base_price: 16,
    variable_cost: 6.5,
    weights: { price: 0.20, quality: 0.25, marketing: 0.20, service: 0.25, availability: 0.10 }
  },
  restaurant: {
    id: 'restaurant',
    name: 'Restaurantes',
    sector: 'Servicios / Alimentos',
    note: 'Capacidad, personal, insumos, desperdicios y satisfacción.',
    base_demand: 30000,
    base_price: 42,
    variable_cost: 18,
    weights: { price: 0.15, quality: 0.30, marketing: 0.15, service: 0.30, availability: 0.10 }
  },
  retail: {
    id: 'retail',
    name: 'Comercio minorista',
    sector: 'Comercio',
    note: 'Compras, precios, inventario, surtido y promociones.',
    base_demand: 100000,
    base_price: 55,
    variable_cost: 33,
    weights: { price: 0.35, quality: 0.10, marketing: 0.15, service: 0.15, availability: 0.25 }
  },
  ecommerce: {
    id: 'ecommerce',
    name: 'Comercio electrónico',
    sector: 'Comercio digital',
    note: 'Marketing digital, conversión, inventario, logística y servicio.',
    base_demand: 90000,
    base_price: 70,
    variable_cost: 40,
    weights: { price: 0.25, quality: 0.10, marketing: 0.25, service: 0.20, availability: 0.20 }
  },
  consulting: {
    id: 'consulting',
    name: 'Consultoría empresarial',
    sector: 'Servicios profesionales',
    note: 'Talento, productividad, tarifas, reputación y utilización.',
    base_demand: 6000,
    base_price: 1200,
    variable_cost: 520,
    weights: { price: 0.10, quality: 0.35, marketing: 0.10, service: 0.35, availability: 0.10 }
  },
  saas: {
    id: 'saas',
    name: 'Software SaaS',
    sector: 'Tecnología',
    note: 'Captación, producto, precio, retención e innovación.',
    base_demand: 25000,
    base_price: 55,
    variable_cost: 9,
    weights: { price: 0.15, quality: 0.20, marketing: 0.20, service: 0.15, availability: 0.30 }
  },
  agro: {
    id: 'agro',
    name: 'Agroindustria',
    sector: 'Agroindustrial',
    note: 'Rendimiento, calidad, costos, estacionalidad y comercialización.',
    base_demand: 110000,
    base_price: 18,
    variable_cost: 9,
    weights: { price: 0.25, quality: 0.35, marketing: 0.10, service: 0.05, availability: 0.25 }
  },
  cosmetics: {
    id: 'cosmetics',
    name: 'Cosméticos y cuidado personal',
    sector: 'Manufactura / Consumo',
    note: 'Marca, innovación, calidad, marketing y canales.',
    base_demand: 80000,
    base_price: 48,
    variable_cost: 19,
    weights: { price: 0.15, quality: 0.30, marketing: 0.30, service: 0.05, availability: 0.20 }
  }
});
