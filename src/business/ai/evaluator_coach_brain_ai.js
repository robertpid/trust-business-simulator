/**
 * TRUST Business Simulator - Etapa 2: CEREBRO 3 - Evaluador y Coach Socrático (EvaluatorCoachBrainAI)
 * 
 * Combina Búsqueda Vectorial k-NN (VectorMemoryStore) y Rastreo de Grafo Causal
 * (EconomicCausalGraph) presentando resultados en lenguaje sencillo y ejecutivo
 * para docentes y estudiantes.
 */

import { VectorMemoryStore } from '../../persistence/vector_memory_store.js';
import { EconomicCausalGraph } from './economic_causal_graph.js';

const SIGNAL_LABELS_ES = Object.freeze({
  challenge_high_margins: 'Mayor exigencia en costos para la siguiente ronda (los equipos lograron márgenes amplios)',
  test_inventory_discipline: 'Prueba de control de inventarios para la siguiente ronda (hay mercadería acumulada en almacén)',
  stabilize_or_demand_stimulus: 'Impulso de demanda en la siguiente ronda (para facilitar recuperación de liquidez)',
  balanced_progression: 'Evolución equilibrada del mercado para la siguiente ronda'
});

export class EvaluatorCoachBrainAI {
  static translate_signal(signal) {
    return SIGNAL_LABELS_ES[signal] || SIGNAL_LABELS_ES.balanced_progression;
  }

  static diagnose_teams(
    ranked_results,
    optimal_benchmark,
    vector_store = new VectorMemoryStore(),
    causal_graph = new EconomicCausalGraph()
  ) {
    return ranked_results.map(r => {
      const price_gap_pct = optimal_benchmark.optimal_price > 0
        ? ((r.price - optimal_benchmark.optimal_price) / optimal_benchmark.optimal_price) * 100
        : 0;

      const team_vector = VectorMemoryStore.encode_team_state_vector(r, optimal_benchmark);
      const nearest_matches = vector_store.query_nearest(team_vector, 1, 'academic_archetype');
      const matched_case = nearest_matches[0];
      const optimal_alignment = optimal_benchmark.optimal_vector
        ? VectorMemoryStore.cosine_similarity(team_vector, optimal_benchmark.optimal_vector)
        : 0.85;

      const causal_trace = causal_graph.trace_team_causal_chain(r, optimal_benchmark);

      let detected_bias = matched_case ? matched_case.detected_bias : 'Estrategia competitiva equilibrada';
      let socratic_question = matched_case
        ? matched_case.socratic_question
        : '¿Cómo defenderán su posición actual si los competidores imitan su precio y calidad?';

      if (r.emergency_loan > 0) {
        detected_bias = 'Crisis de liquidez (Rescate Bancario)';
        socratic_question = '¿Qué ajuste entre precio, producción y marketing les permitirá recuperar efectivo para pagar el sobregiro bancario?';
      } else if (r.margin < 0 && price_gap_pct < -10) {
        detected_bias = 'Guerra de precios destructiva';
        socratic_question = '¿Vender más barato realmente compensó la caída en la ganancia por unidad y los gastos fijos?';
      } else if ((r.ending_inventory || 0) > r.capacity * 0.30) {
        detected_bias = 'Sobreproducción y mercadería acumulada en bodega';
        socratic_question = `Tienen ${Math.round(r.ending_inventory).toLocaleString('es-PE')} unidades guardadas sin vender. ¿Conviene producir menos en la próxima ronda para ahorrar costos y vender ese stock?`;
      } else if ((r.stockout_units || 0) > 0) {
        detected_bias = 'Quiebre de stock (Faltó mercadería para vender)';
        socratic_question = `Se quedaron sin producto para atender ${Math.round(r.stockout_units).toLocaleString('es-PE')} unidades que el público quería comprar. ¿Ampliarán su capacidad o subirán ligeramente el precio?`;
      }

      return {
        team_id: r.team_id,
        team_name: r.team_name,
        rank: r.rank,
        price_gap_pct: Number(price_gap_pct.toFixed(1)),
        state_vector: team_vector,
        matched_academic_case: matched_case?.title || 'Gestión Estándar',
        vector_similarity: matched_case?.similarity || 0,
        optimal_alignment,
        causal_chain: causal_trace.causal_chain_text,
        detected_bias,
        socratic_question
      };
    });
  }

  static compute_next_world_signal(ranked_results, total_demand) {
    if (!ranked_results || ranked_results.length === 0) return 'balanced_progression';
    if (ranked_results.some(r => r.emergency_loan > 0)) return 'stabilize_or_demand_stimulus';

    const total_inventory = ranked_results.reduce((acc, r) => acc + (r.ending_inventory || 0), 0);
    if (total_demand > 0 && total_inventory > total_demand * 0.25) return 'test_inventory_discipline';

    const avg_margin = ranked_results.reduce((acc, r) => acc + r.margin, 0) / ranked_results.length;
    if (avg_margin > 0.20) return 'challenge_high_margins';

    return 'balanced_progression';
  }

  static build_integrated_feedback({
    ranked_results,
    total_demand,
    total_sales,
    optimal_benchmark,
    team_diagnostics,
    next_world_signal
  }) {
    if (!ranked_results || ranked_results.length === 0) {
      return '<p>No hay datos disponibles para emitir retroalimentación.</p>';
    }

    const leader = ranked_results[0];
    const leader_diag = team_diagnostics[0];
    const trailing = ranked_results[ranked_results.length - 1];
    const trailing_diag = team_diagnostics[team_diagnostics.length - 1];
    const unmet_demand = Math.max(0, total_demand - total_sales);
    const unmet_ratio = total_demand > 0 ? (unmet_demand / total_demand) * 100 : 0;

    const leader_seg = leader.segments ? ` destacando en clientes de perfil <strong>${leader.segments.dominant_segment}</strong>` : '';
    const lead_html = `<div class="coach-block"><strong>🏆 Resumen de la Ronda:</strong> <strong>${leader.team_name}</strong> lideró la ronda con <strong>${leader.score.toFixed(1)} pts</strong>${leader_seg}, logrando el <strong>${(leader.market_share * 100).toFixed(1)}%</strong> de cuota de mercado y un margen de ganancia del <strong>${(leader.margin * 100).toFixed(1)}%</strong> (Estrategia observada: <strong>${leader_diag?.matched_academic_case}</strong>).</div>`;

    const market_html = unmet_ratio > 10
      ? `<div class="coach-block"><strong>📦 Abastecimiento del Mercado:</strong> Quedó un <strong>${unmet_ratio.toFixed(1)}% de clientes sin atender</strong> (${Math.round(unmet_demand).toLocaleString('es-PE')} unidades). Las empresas que amplíen capacidad podrán capturar esas ventas.</div>`
      : `<div class="coach-block"><strong>📦 Abastecimiento del Mercado:</strong> Las empresas lograron cubrir el <strong>${((total_sales / total_demand) * 100).toFixed(1)}%</strong> de toda la demanda de los clientes.</div>`;

    const rescued = ranked_results.filter(r => r.emergency_loan > 0);
    const rescue_html = rescued.length > 0
      ? `<div class="coach-block" style="color:var(--danger)"><strong>🚨 Alerta Financiera (Sobregiro Bancario):</strong> Se activó Crédito de Emergencia por falta de liquidez en: <strong>${rescued.map(r => r.team_name).join(', ')}</strong>.</div>`
      : '';

    const strategist_html = optimal_benchmark
      ? `<div class="coach-block"><strong>💡 Orientación Estratégica de Mercado:</strong> ${optimal_benchmark.strategic_thesis}</div>`
      : '';

    const trailing_html = trailing && trailing.team_id !== leader.team_id && trailing_diag
      ? `<div class="coach-block"><strong>🎯 Análisis para ${trailing.team_name} (${trailing_diag.detected_bias}):</strong><br>• <strong>Diagnóstico:</strong> ${trailing_diag.causal_chain}<br>• <strong>Pregunta para el debate:</strong> <em>"${trailing_diag.socratic_question}"</em></div>`
      : '';

    const next_step_es = this.translate_signal(next_world_signal);
    const mesh_html = `<div class="coach-block"><strong>📈 Lectura para discusión y Próxima Ronda:</strong> ${next_step_es}. Se recomienda evaluar el impacto de costos y rotación de inventarios para la próxima toma de decisiones.</div>`;

    return `${lead_html}${market_html}${rescue_html}${strategist_html}${trailing_html}${mesh_html}`;
  }
}
