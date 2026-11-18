/**
 * TRUST Business Simulator - Capa de Negocio: Motor de Evaluación y Scoring
 * 
 * Implementa el cálculo del Balanced Scorecard multidimensional:
 * 1. Finanzas (rentabilidad y margen operativo)
 * 2. Mercado / Comercial (cuota de mercado alcanzada)
 * 3. Operaciones (eficiencia de uso de capacidad)
 * 4. Personas (inversión y clima del talento)
 * 5. Estratégico (consistencia entre margen, calidad e innovación)
 */

import { Logger } from '../utils/logger.js';

const logger = new Logger('EvaluationEngine');

export class EvaluationEngine {
  /**
   * Calcula los 5 pilares de desempeño en escala normalizada [0, 1].
   * 
   * @param {Object} params
   * @param {number} params.margin - Margen de utilidad operativa (-1 a 1+)
   * @param {number} params.market_share - Cuota de mercado alcanzada (0 a 1)
   * @param {number} params.sales - Unidades vendidas
   * @param {number} params.capacity - Capacidad disponible
   * @param {number} params.people - Nivel de inversión en talento (0 - 100)
   * @param {number} params.quality - Nivel de calidad (0 - 100)
   * @param {number} params.innovation - Nivel de innovación (0 - 100)
   * @returns {Object} Desglose de puntuaciones normalizadas
   */
  static compute_dimension_scores({
    margin,
    market_share,
    sales,
    capacity,
    people,
    quality,
    innovation
  }) {
    // 1. Dimensión Financiera: Margen operativo normalizado (meta 20% margen)
    const finance_score = Math.max(0, Math.min(1.0, (margin + 0.10) / 0.30));

    // 2. Dimensión Comercial: Cuota de mercado
    const market_score = Math.max(0, Math.min(1.0, market_share));

    // 3. Dimensión Operativa: Utilización de la capacidad instalada
    const operations_score = capacity > 0 ? Math.max(0, Math.min(1.0, sales / capacity)) : 0;

    // 4. Dimensión de Personas: Índice de gestión del talento (saturación en 60 puntos)
    const people_score = Math.max(0, Math.min(1.0, people / 60));

    // 5. Dimensión Estratégica: Síntesis balanceada de margen (55%), calidad (20%) e innovación (25%)
    const strategy_margin = Math.max(0, Math.min(1.0, (margin + 0.15) / 0.35));
    const strategy_quality = Math.min(1.0, quality / 100);
    const strategy_innovation = Math.min(1.0, innovation / 100);
    const strategy_score = strategy_margin * 0.55 + strategy_quality * 0.20 + strategy_innovation * 0.25;

    return {
      finance: finance_score,
      marketing: market_score,
      operations: operations_score,
      people: people_score,
      strategy: strategy_score
    };
  }

  /**
   * Pondera las 5 dimensiones con los pesos de evaluación configurados.
   * 
   * @param {Object} dimension_scores - { finance, marketing, operations, people, strategy }
   * @param {import('../domain/models.js').EvaluationWeights} weights - Ponderaciones que suman 100
   * @returns {number} Score global (típicamente entre 0 y 100)
   */
  static compute_overall_score(dimension_scores, weights) {
    const total_score =
      dimension_scores.finance * weights.finance +
      dimension_scores.marketing * weights.marketing +
      dimension_scores.operations * weights.operations +
      dimension_scores.people * weights.people +
      dimension_scores.strategy * weights.strategy;

    return Math.max(0, total_score);
  }

  /**
   * Ordena los resultados de los equipos de mayor a menor puntaje y asigna puestos de ranking.
   * @param {Array<Object>} team_results
   * @returns {Array<Object>}
   */
  static rank_team_results(team_results) {
    const sorted = [...team_results].sort((a, b) => b.score - a.score);
    return sorted.map((item, index) => ({
      ...item,
      rank: index + 1
    }));
  }
}
