/**
 * TRUST Business Simulator - Etapa 2: Orquestador Multi-Cerebro IA (AIBrainOrchestrator)
 * 
 * Implementa el patrón Mediador e Inyección de Dependencias (SOLID - SRP / DIP)
 * conectando los 3 Cerebros a través del Grafo Causal Económico (EconomicCausalGraph)
 * y la Base de Datos Vectorial en Memoria (VectorMemoryStore).
 */

import { WorldBrainAI } from './world_brain_ai.js';
import { StrategistBrainAI } from './strategist_brain_ai.js';
import { EvaluatorCoachBrainAI } from './evaluator_coach_brain_ai.js';
import { EconomicCausalGraph } from './economic_causal_graph.js';
import { VectorMemoryStore } from '../../persistence/vector_memory_store.js';

export class AIBrainOrchestrator {
  /**
   * @param {Object} [options]
   * @param {VectorMemoryStore} [options.vector_store]
   * @param {EconomicCausalGraph} [options.causal_graph]
   */
  constructor({ vector_store = null, causal_graph = null } = {}) {
    this.vector_store = vector_store || new VectorMemoryStore();
    this.causal_graph = causal_graph || new EconomicCausalGraph();
    this.last_coach_signal = 'balanced_progression';
    this.last_benchmark = null;
    this.last_diagnostics = [];
    this.communication_log = [];
  }

  /**
   * Paso 1: El Cerebro del Mundo genera el evento y propaga su onda en el Grafo Causal.
   */
  prepare_world_event(config, round_number) {
    return WorldBrainAI.generate_contextual_event({
      config,
      round_number,
      coach_signal: this.last_coach_signal,
      causal_graph: this.causal_graph
    });
  }

  /**
   * Paso 2 y 3: El Cerebro Estratega calcula el vector óptimo, el Cerebro Evaluador
   * ejecuta búsqueda k-NN y rastreo causal, e indexa al ganador en la Base Vectorial.
   */
  run_post_round_mesh({
    config,
    industry,
    round_number,
    active_event,
    total_demand,
    total_sales,
    ranked_results,
    average_initial_inventory = 0
  }) {
    const optimal_benchmark = StrategistBrainAI.compute_optimal_benchmark({
      industry,
      config,
      active_event,
      total_demand,
      average_initial_inventory,
      vector_store: this.vector_store
    });

    const team_diagnostics = EvaluatorCoachBrainAI.diagnose_teams(
      ranked_results,
      optimal_benchmark,
      this.vector_store,
      this.causal_graph
    );

    // Aprendizaje Episódico: Guardar el vector del ganador de la ronda en la Base Vectorial
    if (team_diagnostics.length > 0 && ranked_results[0].margin > 0) {
      this.vector_store.upsert_vector(
        `episodic_${config.industry}_r${round_number}_${ranked_results[0].team_id}`,
        team_diagnostics[0].state_vector,
        {
          type: 'episodic_winner',
          title: `Ganador R${round_number} (${ranked_results[0].team_name})`,
          industry: config.industry,
          score: ranked_results[0].score
        }
      );
    }

    const next_world_signal = EvaluatorCoachBrainAI.compute_next_world_signal(
      ranked_results,
      total_demand
    );

    const coach_feedback = EvaluatorCoachBrainAI.build_integrated_feedback({
      ranked_results,
      total_demand,
      total_sales,
      active_event,
      optimal_benchmark,
      team_diagnostics,
      next_world_signal
    });

    const mesh_packet = {
      round_number,
      world_event: active_event,
      strategist_benchmark: optimal_benchmark,
      evaluator_diagnostics: team_diagnostics,
      previous_signal: this.last_coach_signal,
      next_world_signal,
      episodic_vectors_count: this.vector_store.records.size
    };

    this.last_benchmark = optimal_benchmark;
    this.last_diagnostics = team_diagnostics;
    this.last_coach_signal = next_world_signal;
    this.communication_log.push(mesh_packet);

    return {
      coach_feedback,
      ai_mesh: mesh_packet
    };
  }
}
