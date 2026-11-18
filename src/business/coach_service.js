/**
 * TRUST Business Simulator - Capa de Negocio: Coach Pedagógico (Etapa 3)
 * 
 * Genera diagnósticos cualitativos automatizados incluyendo alertas de
 * inventarios/bodegaje, quiebres de stock, rescate bancario por iliquidez y segmentos.
 */

export class CoachService {
  /**
   * Genera la lectura pedagógica y retroalimentación para la discusión de la ronda.
   */
  static generate_debriefing_feedback({
    ranked_results,
    total_demand,
    total_sales,
    active_event
  }) {
    if (!ranked_results || ranked_results.length === 0) {
      return '<p>No hay datos disponibles para emitir retroalimentación.</p>';
    }

    const leader = ranked_results[0];
    const trailing = ranked_results[ranked_results.length - 1];
    const unmet_demand = Math.max(0, total_demand - total_sales);
    const unmet_ratio = total_demand > 0 ? (unmet_demand / total_demand) * 100 : 0;

    const leader_seg = leader.segments ? ` (fuerte en segmento <em>${leader.segments.dominant_segment}</em>)` : '';
    let lead_summary = `<strong>${leader.team_name}</strong> lidera el ranking de esta ronda con un score de <strong>${leader.score.toFixed(1)}</strong> pts${leader_seg}. Logró una cuota de mercado del <strong>${(leader.market_share * 100).toFixed(1)}%</strong> con un margen operativo del <strong>${(leader.margin * 100).toFixed(1)}%</strong> y una utilización de capacidad del <strong>${(leader.capacity_utilization * 100).toFixed(1)}%</strong>.`;

    let industry_diagnostic = '';
    if (unmet_ratio > 10) {
      industry_diagnostic = `<br><br><strong>Alerta de Mercado (Quiebre de Stock):</strong> Existe un <strong>${unmet_ratio.toFixed(1)}% de demanda insatisfecha</strong> en la industria (${Math.round(unmet_demand).toLocaleString('es-PE')} unidades sin atender).`;
    } else {
      industry_diagnostic = `<br><br><strong>Condición de Capacidad e Inventarios:</strong> La industria abasteció el <strong>${((total_sales / total_demand) * 100).toFixed(1)}%</strong> de la demanda total.`;
    }

    const rescued_teams = ranked_results.filter(r => r.emergency_loan > 0);
    let liquidity_alert = '';
    if (rescued_teams.length > 0) {
      const names = rescued_teams.map(r => `${r.team_name} (${Math.round(r.emergency_loan).toLocaleString('es-PE')})`).join(', ');
      liquidity_alert = `<br><br><strong>Alerta Financiera TOPSIM (Crédito de Emergencia):</strong> Se activó rescate bancario por iliquidez para: <strong>${names}</strong>. El déficit de caja genera intereses punitivos (+12% anual).`;
    }

    let trailing_advice = '';
    if (trailing && trailing.team_id !== leader.team_id) {
      const is_capacity_constrained = trailing.stockout_units > 0;
      const is_demand_deficient = trailing.sales < trailing.capacity * 0.70;

      let diagnosis_detail = '';
      if (is_demand_deficient) {
        diagnosis_detail = `Su principal cuello de botella fue <em>falta de atracción comercial</em> (acumuló ${Math.round(trailing.ending_inventory || 0).toLocaleString('es-PE')} uds en inventario con costo de bodegaje). Deberá evaluar precio, marketing y propuesta de valor.`;
      } else if (is_capacity_constrained) {
        diagnosis_detail = `Generó atractivo pero sufrió <em>quiebre de stock</em> (${Math.round(trailing.stockout_units).toLocaleString('es-PE')} uds perdidas por falta de capacidad).`;
      } else {
        diagnosis_detail = `Deberá revisar su estructura de costos y equilibrio entre volumen y margen operativo (margen: ${(trailing.margin * 100).toFixed(1)}%).`;
      }

      trailing_advice = `<br><br><strong>Área de oportunidad para ${trailing.team_name}:</strong> ${diagnosis_detail}`;
    }

    let event_context = '';
    if (active_event && active_event.name !== 'Sin evento extraordinario') {
      event_context = `<br><br><strong>Impacto del Entorno:</strong> El evento <em>"${active_event.name}"</em> influyó directamente en los costos y la demanda general.`;
    }

    const pedagogical_conclusion = `<br><br><strong>Lectura para discusión en clase:</strong> Compare la correlación entre precio, rotación de inventarios, flujo de caja y posicionamiento por segmento. El simulador busca contrastar la hipótesis estratégica de cada equipo contra la dinámica real del mercado.`;

    return `${lead_summary}${industry_diagnostic}${liquidity_alert}${trailing_advice}${event_context}${pedagogical_conclusion}`;
  }
}
