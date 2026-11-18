/**
 * TRUST Business Simulator - Capa de Negocio: Motor de Segmentos de Clientes (Etapa 3)
 * 
 * Desagrega el comportamiento competitivo en tres segmentos estilo Markstrat / Cesim:
 * 1. Segmento Económico (Sensible al precio y disponibilidad)
 * 2. Segmento Masivo (Ponderaciones centrales de la industria)
 * 3. Segmento Premium (Sensible a calidad, servicio y marca)
 */

import { AttractionEngine } from './attraction_engine.js';

export const CUSTOMER_SEGMENTS = Object.freeze({
  budget: {
    id: 'budget',
    name: 'Económico / Precio',
    market_proportion: 0.35,
    weights: { price: 0.55, quality: 0.10, marketing: 0.10, service: 0.05, availability: 0.20 }
  },
  mainstream: {
    id: 'mainstream',
    name: 'Masivo / Estándar',
    market_proportion: 0.40,
    weights: null // Usa las elasticidades nativas de la industria seleccionada
  },
  premium: {
    id: 'premium',
    name: 'Premium / Calidad',
    market_proportion: 0.25,
    weights: { price: 0.05, quality: 0.45, marketing: 0.20, service: 0.25, availability: 0.05 }
  }
});

export class SegmentEngine {
  /**
   * Calcula las cuotas conquistadas por cada equipo en los 3 segmentos de clientes.
   * 
   * @param {Array<import('../domain/models.js').TeamDecision>} decisions
   * @param {number} total_demand
   * @param {Object} industry_weights
   * @param {number} [complexity_level=2]
   * @returns {Map<string, {budget_share: number, mainstream_share: number, premium_share: number, dominant_segment: string}>}
   */
  static evaluate_segments(decisions, total_demand, industry_weights, complexity_level = 2) {
    const result_map = new Map();
    if (!decisions || decisions.length === 0) return result_map;

    const budget_shares = AttractionEngine.calculate_market_shares(
      decisions,
      total_demand * CUSTOMER_SEGMENTS.budget.market_proportion,
      CUSTOMER_SEGMENTS.budget.weights,
      complexity_level
    );

    const mainstream_shares = AttractionEngine.calculate_market_shares(
      decisions,
      total_demand * CUSTOMER_SEGMENTS.mainstream.market_proportion,
      industry_weights,
      complexity_level
    );

    const premium_shares = AttractionEngine.calculate_market_shares(
      decisions,
      total_demand * CUSTOMER_SEGMENTS.premium.market_proportion,
      CUSTOMER_SEGMENTS.premium.weights,
      complexity_level
    );

    const b_map = new Map(budget_shares.map(s => [s.team_id, s.market_share]));
    const m_map = new Map(mainstream_shares.map(s => [s.team_id, s.market_share]));
    const p_map = new Map(premium_shares.map(s => [s.team_id, s.market_share]));

    for (const d of decisions) {
      const b = b_map.get(d.team_id) || 0;
      const m = m_map.get(d.team_id) || 0;
      const p = p_map.get(d.team_id) || 0;

      let dominant = CUSTOMER_SEGMENTS.mainstream.name;
      if (b >= m && b >= p) dominant = CUSTOMER_SEGMENTS.budget.name;
      else if (p >= m && p > b) dominant = CUSTOMER_SEGMENTS.premium.name;

      result_map.set(d.team_id, {
        budget_share: b,
        mainstream_share: m,
        premium_share: p,
        dominant_segment: dominant
      });
    }

    return result_map;
  }
}
