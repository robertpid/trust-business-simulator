/**
 * TRUST Business Simulator - Capa de Negocio: Motor de Demanda Agregada
 * 
 * Calcula la demanda potencial total de la industria considerando
 * la demanda base del sector, el arquetipo de escala empresarial (SOLID - OCP),
 * la tasa de crecimiento macroeconómica y los eventos de mercado.
 */

import { get_scale_archetype } from '../domain/scale_archetypes.js';
import { Logger } from '../utils/logger.js';

const logger = new Logger('DemandEngine');

export class DemandEngine {
  /**
   * Calcula la demanda total del mercado para una ronda específica.
   * 
   * @param {number} base_demand - Demanda base anual o sectorial de la industria
   * @param {number} [demand_growth_percent=0] - Tasa de crecimiento base macroeconómica (%)
   * @param {number} [round_number=1] - Número de la ronda actual (1-indexed)
   * @param {number} [event_demand_multiplier=1.0] - Multiplicador de shock de demanda
   * @param {string} [company_size='Mediana'] - Escala empresarial ('Micro / MYPE', 'Pequeña', 'Mediana', 'Grande', 'Startup')
   * @returns {number} Demanda total del mercado en unidades enteras
   */
  static calculate_total_market_demand(
    base_demand,
    demand_growth_percent = 0,
    round_number = 1,
    event_demand_multiplier = 1.0,
    company_size = 'Mediana'
  ) {
    if (base_demand <= 0) {
      logger.warn(`Demanda base inválida (${base_demand}), usando 10,000 por defecto`);
      base_demand = 10000;
    }

    const scale_archetype = get_scale_archetype(company_size);
    const growth_rate = demand_growth_percent / 100;
    const compound_growth = Math.pow(1 + growth_rate, Math.max(0, round_number - 1));
    const effective_demand =
      base_demand *
      scale_archetype.demand_scale_factor *
      compound_growth *
      event_demand_multiplier;

    logger.debug('Cálculo de demanda agregada realizado', {
      base_demand,
      company_size,
      scale_factor: scale_archetype.demand_scale_factor,
      round_number,
      effective_demand
    });

    return Math.max(0, Math.round(effective_demand));
  }
}
