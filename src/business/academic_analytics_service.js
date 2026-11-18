/**
 * TRUST Business Simulator - Etapa 4: Servicio de Analíticas Académicas y Calificación Docente
 * 
 * Aplica el Principio de Responsabilidad Única (SOLID - SRP) para evaluar el
 * desempeño longitudinal de cada equipo a lo largo de la simulación:
 * - Promedio ponderado de Score y curva de aprendizaje (evolución R1 -> RN)
 * - Consistencia financiera (rondas sin rescate bancario)
 * - Calificación universitaria sugerida en escala vigesimal (0-20) y centesimal (0-100)
 * - Síntesis del Arquetipo Vectorial (k-NN) y Ruta del Grafo Causal
 */

export class AcademicAnalyticsService {
  /**
   * Genera el boletín de calificaciones y analíticas pedagógicas por equipo.
   * 
   * @param {import('../domain/models.js').SimulationConfig} config
   * @param {Array<import('../domain/models.js').RoundSummary>} history
   * @returns {Array<Object>} Lista de analíticas por equipo ordenada por nota final
   */
  static compute_academic_grades(config, history = []) {
    if (!config || !Array.isArray(config.teams)) return [];

    const rounds_played = history.length;
    if (rounds_played === 0) {
      return config.teams.map((team, idx) => ({
        rank: idx + 1,
        team_id: team.id,
        team_name: team.name,
        team_code: team.code,
        rounds_played: 0,
        average_score: 0,
        score_trend: 0,
        solvency_rate_pct: 100,
        grade_100: 0,
        grade_20: 0,
        final_cash: 0,
        final_equity: 0,
        matched_academic_case: 'Sin rondas ejecutadas',
        vector_similarity_pct: 0,
        optimal_alignment_pct: 0,
        causal_chain: 'Pendiente de primera ronda',
        socratic_question: 'Configure y ejecute la Ronda 1 para obtener diagnóstico.'
      }));
    }

    const last_round = history[rounds_played - 1];
    const last_diagnostics = last_round.ai_mesh?.evaluator_diagnostics || [];
    const diag_map = new Map(last_diagnostics.map(d => [d.team_id, d]));

    const raw_analytics = config.teams.map(team => {
      const team_round_records = history
        .map(h => h.results.find(r => r.team_id === team.id || r.team_name === team.name))
        .filter(Boolean);

      const count = Math.max(1, team_round_records.length);
      const scores = team_round_records.map(r => r.score);
      const average_score = scores.reduce((a, b) => a + b, 0) / count;

      const first_score = scores[0] || 0;
      const last_score = scores[scores.length - 1] || 0;
      const score_trend = count > 1 ? last_score - first_score : 0;

      const solvent_rounds = team_round_records.filter(r => (r.emergency_loan || 0) === 0).length;
      const solvency_rate_pct = (solvent_rounds / count) * 100;

      // Bonificación por curva de aprendizaje positiva (hasta +5 pts) y solvencia
      const learning_bonus = score_trend > 0 ? Math.min(5, score_trend * 0.35) : Math.max(-4, score_trend * 0.20);
      const solvency_factor = solvency_rate_pct === 100 ? 2.0 : (solvency_rate_pct - 100) * 0.08;

      const grade_100 = Math.max(40, Math.min(100, Number((average_score + learning_bonus + solvency_factor).toFixed(1))));
      const grade_20 = Number(((grade_100 / 100) * 20).toFixed(1));

      const latest_result = team_round_records[team_round_records.length - 1] || {};
      const latest_diag = diag_map.get(team.id) || {};

      return {
        team_id: team.id,
        team_name: team.name,
        team_code: team.code,
        rounds_played: team_round_records.length,
        average_score: Number(average_score.toFixed(1)),
        score_trend: Number(score_trend.toFixed(1)),
        solvency_rate_pct: Number(solvency_rate_pct.toFixed(0)),
        grade_100,
        grade_20,
        final_cash: Math.round(latest_result.cash || 0),
        final_equity: Math.round(latest_result.equity || 0),
        matched_academic_case: latest_diag.matched_academic_case || 'Caso Estándar',
        vector_similarity_pct: Number(((latest_diag.vector_similarity || 0) * 100).toFixed(1)),
        optimal_alignment_pct: Number(((latest_diag.optimal_alignment || 0) * 100).toFixed(1)),
        causal_chain: latest_diag.causal_chain || 'Sin trazabilidad disponible',
        socratic_question: latest_diag.socratic_question || ''
      };
    });

    raw_analytics.sort((a, b) => b.grade_100 - a.grade_100);
    return raw_analytics.map((item, index) => ({
      ...item,
      rank: index + 1
    }));
  }
}
