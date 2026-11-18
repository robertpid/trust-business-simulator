/**
 * TRUST Business Simulator - Etapa 4: Servicio Exportador de Reportes a Excel
 * 
 * Genera libros y tablas listas para abrir directamente en Microsoft Excel (.xls / .csv)
 * con las calificaciones académicas, ventas, utilidades, inventarios y flujo de caja.
 */

import { AcademicAnalyticsService } from './academic_analytics_service.js';

export class ReportExporterService {
  static _escape_csv(value) {
    const str = String(value ?? '').replace(/"/g, '""');
    return `"${str}"`;
  }

  /**
   * Genera el contenido CSV compatible con Excel (con BOM UTF-8).
   */
  static generate_academic_csv(config, history = []) {
    const grades = AcademicAnalyticsService.compute_academic_grades(config, history);

    const headers = [
      'Puesto',
      'Codigo_Equipo',
      'Nombre_Empresa',
      'Rondas_Jugadas',
      'Score_Promedio',
      'Tendencia_Aprendizaje',
      'Solvencia_Pct',
      'Nota_Vigesimal_20',
      'Nota_Centesimal_100',
      'Caja_Final',
      'Patrimonio_Final',
      'Estrategia_Observada',
      'Alineacion_Pct',
      'Diagnostico_Operativo'
    ];

    const rows = grades.map(g => [
      g.rank,
      g.team_code,
      g.team_name,
      g.rounds_played,
      g.average_score,
      g.score_trend,
      `${g.solvency_rate_pct}%`,
      g.grade_20,
      g.grade_100,
      g.final_cash,
      g.final_equity,
      g.matched_academic_case,
      `${g.vector_similarity_pct}%`,
      g.causal_chain
    ].map(val => this._escape_csv(val)).join(','));

    return '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  }

  /**
   * Genera una hoja de cálculo enriquecida para Microsoft Excel (.xls) con diseño de tabla.
   */
  static generate_excel_sheet(config, history = []) {
    const grades = AcademicAnalyticsService.compute_academic_grades(config, history);
    const last_round = history.length > 0 ? history[history.length - 1] : null;

    const grades_rows = grades.map(g => `
      <tr>
        <td>${g.rank}</td>
        <td>${g.team_code}</td>
        <td><b>${g.team_name}</b></td>
        <td>${g.rounds_played}</td>
        <td>${g.average_score.toFixed(1)}</td>
        <td>${g.score_trend >= 0 ? '+' : ''}${g.score_trend.toFixed(1)}</td>
        <td>${g.solvency_rate_pct}%</td>
        <td style="background:#f3ffd0;font-weight:bold">${g.grade_20.toFixed(1)}</td>
        <td><b>${g.grade_100.toFixed(1)}</b></td>
        <td>${g.final_cash}</td>
        <td>${g.final_equity}</td>
        <td>${g.matched_academic_case}</td>
        <td>${g.causal_chain}</td>
      </tr>
    `).join('');

    const round_rows = (last_round?.results || []).map(r => `
      <tr>
        <td>${r.rank}</td>
        <td><b>${r.team_name}</b></td>
        <td>${(r.market_share * 100).toFixed(1)}%</td>
        <td>${Math.round(r.sales)}</td>
        <td>${Math.round(r.revenue)}</td>
        <td>${Math.round(r.profit)}</td>
        <td>${Math.round(r.net_profit ?? r.profit)}</td>
        <td>${(r.margin * 100).toFixed(1)}%</td>
        <td>${Math.round(r.ending_inventory || 0)}</td>
        <td>${Math.round(r.stockout_units || 0)}</td>
        <td>${Math.round(r.cash || 0)}</td>
        <td>${Math.round(r.emergency_loan || 0)}</td>
      </tr>
    `).join('');

    return `\uFEFF<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
      <head><meta charset="UTF-8"></head>
      <body>
        <h2>TRUST Business Simulator - Acta de Calificaciones (${config?.name || 'Simulación'})</h2>
        <p><b>País:</b> ${config?.country_name || config?.country} | <b>Moneda:</b> ${config?.currency} | <b>Escala:</b> ${config?.size}</p>
        <table border="1" cellpadding="6" cellspacing="0">
          <thead style="background:#121412;color:#ffffff;font-weight:bold">
            <tr>
              <th>Puesto</th><th>Código</th><th>Empresa</th><th>Rondas</th><th>Puntaje Prom.</th>
              <th>Evolución</th><th>Solvencia</th><th>Nota (0-20)</th><th>Nota (0-100)</th>
              <th>Caja Final</th><th>Patrimonio</th><th>Estrategia</th><th>Diagnóstico Operativo</th>
            </tr>
          </thead>
          <tbody>${grades_rows}</tbody>
        </table>
        <br/>
        <h3>Resultados Operativos y Financieros de la Última Ronda</h3>
        <table border="1" cellpadding="6" cellspacing="0">
          <thead style="background:#232723;color:#ffffff;font-weight:bold">
            <tr>
              <th>Puesto</th><th>Empresa</th><th>Cuota</th><th>Ventas (uds)</th><th>Ingresos</th>
              <th>Utilidad Operativa</th><th>Utilidad Neta</th><th>Margen</th><th>Stock Final</th>
              <th>Quiebre Stock</th><th>Caja Final</th><th>Crédito Emergencia</th>
            </tr>
          </thead>
          <tbody>${round_rows}</tbody>
        </table>
      </body>
    </html>`;
  }

  static generate_audit_json(config, history = []) {
    const grades = AcademicAnalyticsService.compute_academic_grades(config, history);
    return JSON.stringify({
      exported_at: new Date().toISOString(),
      simulator_version: 'TRUST Business Simulator V1.0',
      configuration: config ? config.toJSON() : null,
      academic_grades: grades,
      rounds_history: history
    }, null, 2);
  }

  static trigger_browser_download(filename, content, mime_type = 'application/vnd.ms-excel;charset=utf-8;') {
    if (typeof document === 'undefined') return false;
    const blob = new Blob([content], { type: mime_type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  }
}
