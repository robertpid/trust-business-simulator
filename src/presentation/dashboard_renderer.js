/**
 * TRUST Business Simulator - Capa de Presentación: Renderizador del Tablero de Simulación
 * 
 * Aplica el Principio de Responsabilidad Única (SOLID - SRP) separando la
 * generación de tablas de benchmarking, finanzas/operaciones y sparklines del controlador.
 */

export class DashboardRenderer {
  /**
   * Renderiza los KPIs consolidados de la industria.
   */
  static render_industry_kpis($, summary, money) {
    $('industryKpis').innerHTML = `
      <div class="kpi"><span>Demanda industria</span><strong>${Math.round(summary.total_market_demand).toLocaleString('es-PE')}</strong></div>
      <div class="kpi"><span>Ventas atendidas</span><strong>${Math.round(summary.total_market_sales).toLocaleString('es-PE')}</strong></div>
      <div class="kpi"><span>Ingresos industria</span><strong>${money(summary.total_market_revenue)}</strong></div>
      <div class="kpi"><span>Utilidad operativa</span><strong>${money(summary.total_market_profit)}</strong></div>
    `;
  }

  /**
   * Renderiza la tabla principal de Ranking y Estado de Resultados.
   */
  static render_benchmarking_table($, summary, money) {
    $('resultsTable').innerHTML = `
      <thead>
        <tr>
          <th scope="col">Puesto y Equipo</th>
          <th scope="col">Cuota</th>
          <th scope="col">Ventas</th>
          <th scope="col">Ingresos</th>
          <th scope="col">EBIT (Operativa)</th>
          <th scope="col">Utilidad Neta</th>
          <th scope="col">Margen</th>
          <th scope="col">Score</th>
        </tr>
      </thead>
      <tbody>
        ${summary.results.map((r, i) => `
          <tr class="${i === 0 ? 'rank1' : ''}">
            <th scope="row"><strong>#${r.rank}</strong> ${r.team_name}</th>
            <td data-label="Cuota">${(r.market_share * 100).toFixed(1)}%</td>
            <td data-label="Ventas">${Math.round(r.sales).toLocaleString('es-PE')}</td>
            <td data-label="Ingresos">${money(r.revenue)}</td>
            <td data-label="EBIT">${money(r.profit)}</td>
            <td data-label="Utilidad Neta">${money(r.net_profit ?? r.profit)}</td>
            <td data-label="Margen">${(r.margin * 100).toFixed(1)}%</td>
            <td data-label="Score"><strong>${r.score.toFixed(1)}</strong></td>
          </tr>
        `).join('')}
      </tbody>
    `;
  }

  /**
   * Renderiza la tabla operativa y financiera de Etapa 3 (Inventarios, Liquidez y Segmentos).
   */
  static render_finance_ops_table($, summary, money) {
    const fin_table = $('financeOpsTable');
    if (!fin_table) return;

    fin_table.innerHTML = `
      <thead>
        <tr>
          <th scope="col">Equipo</th>
          <th scope="col">Segmento Líder</th>
          <th scope="col">Stock Final</th>
          <th scope="col">Quiebre Stock</th>
          <th scope="col">Costo Bodega</th>
          <th scope="col">Caja Final</th>
          <th scope="col">Crédito Emergencia</th>
          <th scope="col">Patrimonio</th>
        </tr>
      </thead>
      <tbody>
        ${summary.results.map(r => `
          <tr>
            <th scope="row">${r.team_name}</th>
            <td data-label="Segmento Líder"><span class="chip">${r.segments?.dominant_segment || 'Masivo'}</span></td>
            <td data-label="Stock Final">${Math.round(r.ending_inventory || 0).toLocaleString('es-PE')} uds</td>
            <td data-label="Quiebre Stock">${Math.round(r.stockout_units || 0).toLocaleString('es-PE')} uds</td>
            <td data-label="Costo Bodega">${money(r.holding_cost || 0)}</td>
            <td data-label="Caja Final">${money(r.cash || 0)}</td>
            <td data-label="Crédito Emergencia" style="color:${r.emergency_loan > 0 ? 'var(--danger)' : 'inherit'};font-weight:${r.emergency_loan > 0 ? '800' : '400'}">${r.emergency_loan > 0 ? '🚨 ' + money(r.emergency_loan) : 'Sin sobregiro'}</td>
            <td data-label="Patrimonio">${money(r.equity || 0)}</td>
          </tr>
        `).join('')}
      </tbody>
    `;
  }

  /**
   * Renderiza los sparklines de evolución histórica por equipo.
   */
  static render_history_cards($, teams, history) {
    const container = $('historyCards');
    if (!container) return;

    container.innerHTML = teams.map(team => {
      const scores = history.map(h => {
        const item = h.results.find(r => r.team_id === team.id || r.team_name === team.name);
        return item ? item.score : 0;
      });
      const max_score = Math.max(1, ...scores);
      return `
        <div class="history-card">
          <h4>${team.name}</h4>
          <div class="spark">
            ${scores.map((s, idx) => `
              <div class="bar ${idx === scores.length - 1 ? 'last' : ''}" 
                   style="height: ${Math.max(5, (s / max_score) * 100)}%" 
                   title="Ronda ${idx + 1}: ${s.toFixed(1)} pts">
              </div>
            `).join('')}
          </div>
          <p class="muted">Evolución de Score: ${scores.map(s => s.toFixed(1)).join(' · ')}</p>
        </div>
      `;
    }).join('');
  }
}
