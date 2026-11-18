/**
 * TRUST Business Simulator - Capa de Presentación: Renderizador Visual de Configuración
 * 
 * Reemplaza el bloque de código JSON bruto por un tablero visual moderno,
 * ejecutivo y fácil de leer para el profesor y los estudiantes.
 */

import {
  INDUSTRIES,
  COMPLEXITY_LEVELS,
  MARKET_EVENTS,
  get_scale_archetype
} from '../domain/constants.js';

export class ConfigPanelRenderer {
  /**
   * Renderiza el panel visual de configuración vigente.
   * @param {Function} $
   * @param {import('../domain/models.js').SimulationConfig} config
   * @param {string} [active_role='teacher'] - 'teacher' | 'student'
   */
  static render_visual_config($, config, active_role = 'teacher') {
    const container = $('configVisualPanel');
    if (!container || !config) return;

    const industry = INDUSTRIES[config.industry] || INDUSTRIES.textile;
    const scale = get_scale_archetype(config.size);
    const complexity = COMPLEXITY_LEVELS[config.complexity] || COMPLEXITY_LEVELS[2];

    const selected_events = config.events_enabled
      ? MARKET_EVENTS.filter(e =>
          e.id !== 'event_baseline' &&
          (!Array.isArray(config.selected_event_ids) || config.selected_event_ids.includes(e.id))
        )
      : [];

    const show_weights = active_role === 'teacher' || config.weights_visible;
    const w = config.weights;

    const weights_html = show_weights
      ? `
        <div class="grid3" style="margin-top:12px">
          <div class="event-item"><strong>Finanzas:</strong> ${w.finance}%</div>
          <div class="event-item"><strong>Mercado:</strong> ${w.marketing}%</div>
          <div class="event-item"><strong>Operaciones:</strong> ${w.operations}%</div>
          <div class="event-item"><strong>Personas:</strong> ${w.people}%</div>
          <div class="event-item"><strong>Estrategia:</strong> ${w.strategy}%</div>
        </div>
      `
      : `<p class="muted" style="margin-top:10px">🔒 Las ponderaciones exactas de evaluación están ocultas para los estudiantes por decisión del profesor.</p>`;

    const events_html = !config.events_enabled || selected_events.length === 0
      ? `<span class="chip">Escenario Estable (Sin eventos extraordinarios)</span>`
      : selected_events.map(e => `<span class="chip">✔ ${e.name}</span>`).join('');

    container.innerHTML = `
      <div class="grid3">
        <div class="card">
          <span class="section-kicker">UNIVERSO ECONÓMICO</span>
          <h3>${config.name}</h3>
          <p class="muted">${industry.name} (${industry.sector})</p>
          <div class="chips" style="margin-top:12px">
            <span class="chip">🌍 País: ${config.country_name || config.country}</span>
            <span class="chip">💱 Moneda: ${config.currency}</span>
            <span class="chip">🏢 Escala: ${scale.name}</span>
          </div>
        </div>

        <div class="card">
          <span class="section-kicker">REGLAS DE LA PARTIDA</span>
          <h3>${complexity.name}</h3>
          <p class="muted">${complexity.desc}</p>
          <div class="chips" style="margin-top:12px">
            <span class="chip">⏱️ Duración: ${config.round_duration}</span>
            <span class="chip">🔄 Total Rondas: ${config.total_rounds}</span>
            <span class="chip">🎯 Rondas Práctica: ${config.practice_rounds}</span>
          </div>
        </div>

        <div class="card">
          <span class="section-kicker">ENTORNO MACROECONÓMICO</span>
          <h3>Variables del País</h3>
          <p class="muted">Fuente: ${config.macro.source} (${config.macro.reference_year})</p>
          <div class="chips" style="margin-top:12px">
            <span class="chip">📈 Inflación: ${config.macro.inflation}%</span>
            <span class="chip">📊 Crecimiento PIB: ${config.macro.gdp}%</span>
            <span class="chip">🏦 Tasa Interés: ${config.macro.interest}%</span>
            <span class="chip">🛒 Crecimiento Demanda: ${config.macro.demand_growth}%</span>
          </div>
        </div>
      </div>

      <div class="card topgap">
        <span class="section-kicker">CRITERIOS DE CALIFICACIÓN</span>
        <h3>Ponderaciones de Evaluación</h3>
        ${weights_html}
      </div>

      <div class="grid3 topgap">
        <div class="card">
          <span class="section-kicker">INCERTIDUMBRE DE MERCADO</span>
          <h3>Eventos Habilitados por el Profesor</h3>
          <p class="muted">${config.surprise_events ? 'Modo sorpresa activo (se revelan al cierre de ronda)' : 'Eventos visibles al inicio de la ronda'}</p>
          <div class="chips" style="margin-top:12px">${events_html}</div>
        </div>

        <div class="card" style="grid-column: span 2">
          <span class="section-kicker">PARTICIPANTES</span>
          <h3>Equipos Competidores (${config.teams.length} empresas)</h3>
          <div class="grid3" style="margin-top:12px">
            ${config.teams.map((t, idx) => `
              <div class="event-item">
                <h4>${idx + 1}. ${t.name}</h4>
                <p>Código de equipo: <strong>${t.code}</strong></p>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }
}
