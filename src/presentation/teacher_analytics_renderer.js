/**
 * TRUST Business Simulator - Capa de Presentación: Renderizador del Panel Docente e IA (Etapa 4)
 * 
 * Presenta la guía de los 3 Cerebros de IA y el Acta de Calificación Universitaria
 * en lenguaje claro, ejecutivo y amigable para el profesor.
 */

import { AcademicAnalyticsService } from '../business/academic_analytics_service.js';
import { EvaluatorCoachBrainAI } from '../business/ai/evaluator_coach_brain_ai.js';

export class TeacherAnalyticsRenderer {
  /**
   * Renderiza el resumen ejecutivo de los 3 Cerebros de IA para el profesor.
   * @param {Function} $
   * @param {import('../business/simulation_service.js').SimulationService} service
   */
  static render_ai_brains_telemetry($, service) {
    const container = $('aiBrainsTelemetry');
    if (!container) return;

    const last_summary = service.last_summary;
    const mesh = last_summary?.ai_mesh;
    const sym = service.config?.currency_symbol || '$';

    if (!mesh) {
      container.innerHTML = `
        <div class="industry-note">
          <strong>Asistente Docente de IA listo:</strong> Ejecute la primera ronda para ver la jugada ideal recomendada para su clase, los efectos económicos del entorno y el acta de calificaciones automáticas.
        </div>
      `;
      return;
    }

    const ev = mesh.world_event || {};
    const bench = mesh.strategist_benchmark || {};
    const chain_html = Array.isArray(ev.causal_propagation) && ev.causal_propagation.length > 0
      ? ev.causal_propagation.map(c => `• ${c.from_label} ${c.mechanism} (${c.to_label})`).join('<br>')
      : '• Escenario estable sin choques externos en esta ronda.';

    const next_signal_es = EvaluatorCoachBrainAI.translate_signal(mesh.next_world_signal);

    container.innerHTML = `
      <div class="grid3">
        <div class="event-item">
          <span class="section-kicker">1. ENTORNO DEL MERCADO</span>
          <h4>🌍 ${ev.name || 'Escenario Base'}</h4>
          <p>${ev.ai_rationale || ''}</p>
          <div style="margin-top:8px;font-size:12px;color:#42473f"><strong>Efecto en cadena:</strong><br>${chain_html}</div>
        </div>
        <div class="event-item">
          <span class="section-kicker">2. JUGADA IDEAL DE LA RONDA</span>
          <h4>💡 Referencia para el Profesor</h4>
          <p>Valores óptimos calculados según los costos y la demanda de esta ronda:</p>
          <div style="margin-top:8px;font-size:12px;color:#42473f">
            <strong>Precio Ideal:</strong> ${sym} ${bench.optimal_price}<br>
            <strong>Producción Ideal:</strong> ${(bench.optimal_capacity || 0).toLocaleString('es-PE')} unidades<br>
            <strong>Marketing Sugerido:</strong> ${sym} ${(bench.optimal_marketing || 0).toLocaleString('es-PE')}<br>
            <strong>Calidad Meta:</strong> ${bench.optimal_quality} / 100
          </div>
        </div>
        <div class="event-item">
          <span class="section-kicker">3. PRÓXIMO PASO PEDAGÓGICO</span>
          <h4>🎯 Ajuste Dinámico de la Clase</h4>
          <p>El sistema analiza cómo jugaron los alumnos y adapta el reto de la siguiente ronda:</p>
          <div style="margin-top:8px;font-size:12px;color:#42473f">
            <strong>Recomendación activa:</strong> ${next_signal_es}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Renderiza la tabla de calificaciones universitarias en lenguaje sencillo.
   */
  static render_academic_grades_table($, config, history) {
    const table_el = $('teacherGradesTable');
    if (!table_el) return;

    const grades = AcademicAnalyticsService.compute_academic_grades(config, history);

    table_el.innerHTML = `
      <thead>
        <tr>
          <th scope="col">Equipo y Código</th>
          <th scope="col">Puntaje Prom.</th>
          <th scope="col">Evolución</th>
          <th scope="col">Solvencia</th>
          <th scope="col">Nota (0-20)</th>
          <th scope="col">Nota (0-100)</th>
          <th scope="col">Estrategia</th>
          <th scope="col">Diagnóstico Operativo</th>
        </tr>
      </thead>
      <tbody>
        ${grades.map((g, i) => `
          <tr class="${i === 0 ? 'rank1' : ''}">
            <th scope="row"><strong>#${g.rank}</strong> ${g.team_name} <span class="muted">(${g.team_code})</span></th>
            <td data-label="Puntaje Prom.">${g.average_score.toFixed(1)}</td>
            <td data-label="Evolución" style="color:${g.score_trend >= 0 ? 'var(--good)' : 'var(--danger)'}">${g.score_trend >= 0 ? '+' : ''}${g.score_trend.toFixed(1)} pts</td>
            <td data-label="Solvencia">${g.solvency_rate_pct}%</td>
            <td data-label="Nota (0-20)"><strong>${g.grade_20.toFixed(1)}</strong> / 20</td>
            <td data-label="Nota (0-100)"><strong>${g.grade_100.toFixed(1)}</strong></td>
            <td data-label="Estrategia"><span class="chip">${g.matched_academic_case}</span></td>
            <td data-label="Diagnóstico" style="font-size:11px;text-align:left;line-height:1.4">${g.causal_chain}</td>
          </tr>
        `).join('')}
      </tbody>
    `;
  }
}
