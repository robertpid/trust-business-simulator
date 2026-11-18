/**
 * TRUST Business Simulator - Pruebas Unitarias Etapa 2:
 * Red de 3 Cerebros de IA con Base de Datos Vectorial (k-NN) y Grafo Causal Económico
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { VectorMemoryStore } from '../../src/persistence/vector_memory_store.js';
import { EconomicCausalGraph } from '../../src/business/ai/economic_causal_graph.js';
import { WorldBrainAI } from '../../src/business/ai/world_brain_ai.js';
import { StrategistBrainAI } from '../../src/business/ai/strategist_brain_ai.js';
import { AIBrainOrchestrator } from '../../src/business/ai/ai_brain_orchestrator.js';
import { SimulationConfig, Team } from '../../src/domain/models.js';
import { INDUSTRIES } from '../../src/domain/constants.js';

function build_sample_config(size = 'Mediana') {
  return new SimulationConfig({
    name: 'Test 3 Cerebros Graph+Vector',
    industry: 'textile',
    country: 'PE',
    country_name: 'Perú',
    size,
    teams: [
      new Team('t1', 'Alfa', 'EQ-01'),
      new Team('t2', 'Beta', 'EQ-02')
    ]
  });
}

describe('Etapa 2 - Motor de Base de Datos Vectorial (VectorMemoryStore)', () => {
  it('Debe calcular la Similitud del Coseno exactamente y recuperar el arquetipo más cercano (k-NN)', () => {
    const v1 = [0.5, 0.8, 0.8, 0.6, 0.9, 0.1, 1.0, 0.8];
    assert.equal(VectorMemoryStore.cosine_similarity(v1, v1), 1.0);

    const store = new VectorMemoryStore();
    // Vector similar a Diferenciación Premium de Porter
    const query_prem = [0.68, 0.92, 0.89, 0.80, 0.88, 0.05, 1.00, 0.86];
    const nearest = store.query_nearest(query_prem, 1, 'academic_archetype');

    assert.equal(nearest.length, 1);
    assert.equal(nearest[0].id, 'arch_porter_differentiation');
    assert.ok(nearest[0].similarity > 0.98, `Similitud coseno debe ser > 98%, fue ${nearest[0].similarity}`);
  });
});

describe('Etapa 2 - Motor de Grafo Causal Económico (EconomicCausalGraph)', () => {
  it('Debe propagar ondas causales multi-salto (BFS) y rastrear cadena causa-efecto', () => {
    const graph = new EconomicCausalGraph();
    const chain = graph.propagate_shock('macro_inflation', 0.25, 3);

    assert.ok(chain.length >= 3, 'El shock debe propagarse a través de múltiples saltos en el grafo');
    assert.equal(chain[0].from_node, 'macro_inflation');
    assert.equal(chain[0].to_node, 'unit_var_cost');

    const trace = graph.trace_team_causal_chain(
      { price: 110, market_share: 0.18, capacity: 50000, ending_inventory: 25000, emergency_loan: 12000, margin: -0.05 },
      { optimal_price: 85 }
    );
    assert.match(trace.causal_chain_text, /──►/);
    assert.match(trace.causal_chain_text, /Crédito de Emergencia/);
  });
});

describe('Etapa 2 - Los 3 Cerebros de IA Conectados a Grafo y Base Vectorial', () => {
  it('Cerebro 1 (WorldBrainAI) propaga shocks en el grafo según la señal del Cerebro 3', () => {
    const config = build_sample_config();
    const ev = WorldBrainAI.generate_contextual_event({
      config,
      round_number: 2,
      coach_signal: 'challenge_high_margins'
    });

    assert.equal(ev.id, 'ai_event_supply_pressure');
    assert.ok(Array.isArray(ev.causal_propagation) && ev.causal_propagation.length > 0);
  });

  it('Cerebro 2 (StrategistBrainAI) calcula la decisión óptima y el vector de referencia', () => {
    const config = build_sample_config('Mediana');
    const event = { cost_multiplier: 1.0, demand_multiplier: 1.0 };

    const bench = StrategistBrainAI.compute_optimal_benchmark({
      industry: INDUSTRIES.textile,
      config,
      active_event: event,
      total_demand: 120000,
      average_initial_inventory: 0
    });

    assert.equal(bench.optimal_vector.length, 8);
    assert.match(bench.recommended_posture, /Michael Porter|Liderazgo/);
  });

  it('Malla AIBrainOrchestrator: Evalúa en < 5ms, diagnostica con vectores/grafo y guarda memoria episódica', () => {
    const orchestrator = new AIBrainOrchestrator();
    const initial_vector_count = orchestrator.vector_store.records.size;
    const config = build_sample_config();
    const event = orchestrator.prepare_world_event(config, 1);

    const mock_results = [
      {
        team_id: 't1',
        team_name: 'Alfa',
        rank: 1,
        price: 84,
        marketing: 14000,
        capacity: 60000,
        quality: 85,
        service: 85,
        sales: 58000,
        capacity_utilization: 0.96,
        ending_inventory: 2000,
        stockout_units: 0,
        emergency_loan: 0,
        margin: 0.22,
        market_share: 0.55,
        score: 82.5
      },
      {
        team_id: 't2',
        team_name: 'Beta',
        rank: 2,
        price: 42,
        marketing: 10000,
        capacity: 60000,
        quality: 50,
        service: 50,
        sales: 60000,
        capacity_utilization: 1.0,
        ending_inventory: 0,
        stockout_units: 0,
        emergency_loan: 45000,
        margin: -0.25,
        market_share: 0.45,
        score: 38.0
      }
    ];

    const t0 = performance.now();
    const mesh_output = orchestrator.run_post_round_mesh({
      config,
      industry: INDUSTRIES.textile,
      round_number: 1,
      active_event: event,
      total_demand: 120000,
      total_sales: 118000,
      ranked_results: mock_results
    });
    const elapsed_ms = performance.now() - t0;

    assert.ok(elapsed_ms < 15, `El motor híbrido Grafo+Vector debe ser ultra rápido (<15ms), tardó ${elapsed_ms.toFixed(2)}ms`);
    assert.equal(orchestrator.vector_store.records.size, initial_vector_count + 1, 'Debe indexar al ganador en la memoria episódica');
    assert.equal(mesh_output.ai_mesh.evaluator_diagnostics[1].detected_bias, 'Crisis de liquidez (Rescate Bancario)');
    assert.match(mesh_output.ai_mesh.evaluator_diagnostics[1].causal_chain, /──►/);
    assert.match(mesh_output.coach_feedback, /Diagnóstico|Análisis/);
    assert.match(mesh_output.coach_feedback, /Estrategia observada/);
  });
});
