/**
 * TRUST Business Simulator - Capa de Negocio: Motor de Atracción Competitiva
 * 
 * Implementa el modelo de atracción competitiva (Multiplicative Competitive Interaction Model - MCI).
 * La cuota de mercado de cada empresa es proporcional a su atractivo relativo en la industria,
 * ponderado por las elasticidades de la industria (Precio, Calidad, Marketing, Servicio y Disponibilidad).
 */

import { Logger } from '../utils/logger.js';

const logger = new Logger('AttractionEngine');

export class AttractionEngine {
  /**
   * Calcula el precio promedio de la industria entre todos los competidores.
   * @param {Array<import('../domain/models.js').TeamDecision>} decisions
   * @returns {number}
   */
  static calculate_average_price(decisions) {
    if (!decisions || decisions.length === 0) return 0;
    const sum = decisions.reduce((acc, d) => acc + d.price, 0);
    return sum / decisions.length;
  }

  /**
   * Calcula el puntaje de atractivo individual de un equipo.
   * 
   * @param {Object} params
   * @param {import('../domain/models.js').TeamDecision} params.decision - Decisión tomada por el equipo
   * @param {number} params.average_price - Precio promedio de la industria
   * @param {number} params.total_demand - Demanda agregada proyectada
   * @param {number} params.num_teams - Número de competidores
   * @param {Object} params.industry_weights - Ponderaciones de la industria {price, quality, marketing, service, availability}
   * @param {number} params.complexity_level - Nivel de complejidad (1, 2 o 3)
   * @returns {number} Puntaje de atracción no normalizado
   */
  static calculate_individual_attractiveness({
    decision,
    average_price,
    total_demand,
    num_teams,
    industry_weights,
    complexity_level = 2
  }) {
    // 1. Sensibilidad a precio: relación precio promedio vs precio propio (acotado entre 0.25 y 1.80)
    const price_ratio = average_price > 0 && decision.price > 0 ? average_price / decision.price : 1;
    const price_score = Math.max(0.25, Math.min(1.8, price_ratio));

    // 2. Efecto de marketing comercial con rendimientos decrecientes logarítmicos
    const marketing_score = 0.7 + Math.log10(1 + Math.max(0, decision.marketing)) / 6;

    // 3. Calidad percibida (escala 0.5 a 1.5)
    const quality_score = 0.5 + decision.quality / 100;

    // 4. Nivel de servicio al cliente (escala 0.5 a 1.5)
    const service_score = 0.5 + decision.service / 100;

    // 5. Disponibilidad operativa (relación entre capacidad propia y demanda media por competidor)
    const average_capacity_target = total_demand / Math.max(1, num_teams);
    const capacity_ratio = average_capacity_target > 0 ? decision.capacity / average_capacity_target : 1;
    const availability_score = 0.5 + Math.min(1.0, capacity_ratio) / 2;

    // 6. Factor de innovación en Nivel 3 (escala 0.75 a 1.25)
    const innovation_score = 0.75 + decision.innovation / 200;
    const innovation_factor = complexity_level === 3 ? innovation_score : 1.0;

    const w = industry_weights;
    const attractiveness =
      Math.pow(price_score, w.price) *
      Math.pow(quality_score, w.quality) *
      Math.pow(marketing_score, w.marketing) *
      Math.pow(service_score, w.service) *
      Math.pow(availability_score, w.availability) *
      innovation_factor;

    return Math.max(0.0001, attractiveness);
  }

  /**
   * Procesa todas las decisiones y calcula la cuota de mercado (Market Share) para cada equipo.
   * 
   * @param {Array<import('../domain/models.js').TeamDecision>} decisions
   * @param {number} total_demand
   * @param {Object} industry_weights
   * @param {number} complexity_level
   * @returns {Array<{ team_id: string, attractiveness: number, market_share: number }>}
   */
  static calculate_market_shares(decisions, total_demand, industry_weights, complexity_level = 2) {
    if (!decisions || decisions.length === 0) return [];

    const average_price = this.calculate_average_price(decisions);
    const num_teams = decisions.length;

    const attractiveness_list = decisions.map(decision => {
      const attractiveness = this.calculate_individual_attractiveness({
        decision,
        average_price,
        total_demand,
        num_teams,
        industry_weights,
        complexity_level
      });
      return { team_id: decision.team_id, attractiveness };
    });

    const total_attractiveness = attractiveness_list.reduce((acc, item) => acc + item.attractiveness, 0);

    return attractiveness_list.map(item => ({
      team_id: item.team_id,
      attractiveness: item.attractiveness,
      market_share: total_attractiveness > 0 ? item.attractiveness / total_attractiveness : 1 / num_teams
    }));
  }
}
