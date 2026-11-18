/**
 * TRUST Business Simulator - Etapa 2: CEREBRO 2 - El Estratega (StrategistBrainAI)
 * 
 * Calcula la Frontera Eficiente / Decisión Óptima de Referencia (Benchmark)
 * combinando optimización microeconómica y búsqueda vectorial de casos exitosos
 * en VectorMemoryStore.
 */

import { get_scale_archetype } from '../../domain/scale_archetypes.js';
import { AccountingEngine } from '../accounting_engine.js';
import { VectorMemoryStore } from '../../persistence/vector_memory_store.js';

export class StrategistBrainAI {
  /**
   * Calcula el vector de decisiones óptimas y consulta la memoria vectorial.
   */
  static compute_optimal_benchmark({
    industry,
    config,
    active_event,
    total_demand,
    average_initial_inventory = 0,
    vector_store = new VectorMemoryStore()
  }) {
    const archetype = get_scale_archetype(config.size);
    const num_teams = Math.max(2, config.teams.length);
    const w = industry.weights;

    const effective_var_cost = AccountingEngine.calculate_effective_variable_cost(
      industry.variable_cost,
      config.macro.inflation,
      active_event.cost_multiplier
    );

    const cost_pressure = effective_var_cost / industry.variable_cost;
    const price_elasticity_factor = w.price >= 0.30
      ? 0.97
      : w.price <= 0.15
        ? 1.08
        : 1.02;

    const raw_optimal_price = industry.base_price * price_elasticity_factor * Math.pow(cost_pressure, 0.65);
    const min_profitable_price = effective_var_cost * 1.45;
    const optimal_price = Number(Math.max(min_profitable_price, raw_optimal_price).toFixed(2));

    const optimal_quality = Math.min(92, Math.max(60, Math.round(55 + w.quality * 100)));
    const optimal_service = Math.min(92, Math.max(58, Math.round(52 + w.service * 105)));

    const mkt_multiplier = 0.85 + w.marketing * 1.5;
    const optimal_marketing = Math.round(archetype.default_marketing_budget * mkt_multiplier);

    const target_demand_per_team = (total_demand / num_teams) * (1 + (active_event.demand_multiplier - 1) * 0.5);
    const optimal_capacity = Math.max(
      Math.round(target_demand_per_team * 0.25),
      Math.round(target_demand_per_team * 1.05 - average_initial_inventory)
    );

    const optimal_people = 60;
    const optimal_innovation = config.complexity === 3 ? 72 : 55;

    const optimal_vector = [
      0.55,
      Number((optimal_quality / 100).toFixed(2)),
      Number((optimal_service / 100).toFixed(2)),
      0.65,
      0.95,
      0.05,
      1.00,
      0.85
    ];

    const nearest_archetypes = vector_store.query_nearest(optimal_vector, 1, 'academic_archetype');
    const best_archetype = nearest_archetypes[0];
    const posture = best_archetype
      ? best_archetype.title
      : 'Equilibrio Comercial y Alta Disponibilidad';

    const clean_title = best_archetype ? best_archetype.title : 'Equilibrio Comercial';

    return {
      optimal_price,
      optimal_marketing,
      optimal_quality,
      optimal_service,
      optimal_capacity,
      optimal_people,
      optimal_innovation,
      optimal_vector,
      effective_var_cost: Number(effective_var_cost.toFixed(2)),
      recommended_posture: posture,
      strategic_thesis: `Enfoque ideal: <strong>${clean_title}</strong> · Precio sugerido: <strong>${config.currency_symbol} ${optimal_price}</strong> · Producción recomendada: <strong>${optimal_capacity.toLocaleString('es-PE')} uds</strong> · Marketing sugerido: <strong>${config.currency_symbol} ${optimal_marketing.toLocaleString('es-PE')}</strong> · Calidad meta: <strong>${optimal_quality}/100</strong>.`
    };
  }
}
