/**
 * TRUST Business Simulator - Capa de Presentación: Renderizador de Pasos del Asistente
 * 
 * Aplica el Principio de Responsabilidad Única (SOLID - SRP) separando la
 * generación de plantillas DOM de la lógica de control del asistente docente.
 */

import {
  INDUSTRIES,
  COUNTRIES,
  COMPANY_SCALES,
  COMPLEXITY_LEVELS,
  MACRO_PRESETS,
  EVALUATION_PRESETS,
  MARKET_EVENTS
} from '../domain/constants.js';
import { AccountingEngine } from '../business/accounting_engine.js';

export class WizardStepRenderer {
  /**
   * Pobla los selectores de Industria, País y Escala Empresarial.
   */
  static populate_dropdowns($) {
    const ind_select = $('industry');
    if (ind_select) {
      ind_select.innerHTML = '';
      Object.values(INDUSTRIES).forEach(ind => {
        ind_select.add(new Option(ind.name, ind.id));
      });
      ind_select.value = 'textile';
    }

    const country_select = $('country');
    if (country_select) {
      country_select.innerHTML = '';
      Object.values(COUNTRIES).forEach(c => {
        country_select.add(new Option(c.name, c.id));
      });
      country_select.value = 'PE';
    }

    const size_select = $('size');
    if (size_select) {
      size_select.innerHTML = '';
      Object.values(COMPANY_SCALES).forEach(scale => {
        size_select.add(new Option(scale.name, scale.id));
      });
      size_select.value = 'Mediana';
    }
  }

  static render_industry_and_scale_note($, industry, scale_archetype) {
    if (!industry || !scale_archetype) return;
    const scaled_demand = Math.round(industry.base_demand * scale_archetype.demand_scale_factor);
    const fixed_cost = Math.round(AccountingEngine.get_fixed_cost_by_size(scale_archetype.id));
    const spread_sign = scale_archetype.credit_spread_percent >= 0 ? '+' : '';

    const note_el = $('industryNote');
    if (note_el) {
      note_el.innerHTML = `
        <div><strong>ADN Sectorial (${industry.name}):</strong> ${industry.note}</div>
        <div style="margin-top:6px">
          <strong>Escala (${scale_archetype.name}):</strong> ${scale_archetype.description}
          · Demanda ajustada: <strong>${scaled_demand.toLocaleString('es-PE')}</strong> uds/ronda
          · Costo fijo base: <strong>${fixed_cost.toLocaleString('es-PE')}</strong>
          · Spread crediticio: <strong>${spread_sign}${scale_archetype.credit_spread_percent}%</strong>.
        </div>
      `;
    }
  }

  static render_progress($, current_step, total_steps) {
    const progress_el = $('progress');
    if (!progress_el) return;
    progress_el.innerHTML = Array.from(
      { length: total_steps },
      (_, i) => `<div class="${i < current_step ? 'active' : ''}"></div>`
    ).join('');
  }

  static render_complexity($, selected_complexity, on_select) {
    const container = $('complexityCards');
    if (!container) return;
    container.innerHTML = Object.values(COMPLEXITY_LEVELS).map(lvl => `
      <div class="complex-card ${lvl.level === selected_complexity ? 'selected' : ''}" data-cx="${lvl.level}">
        <h4>${lvl.name}</h4>
        <p>${lvl.desc}</p>
      </div>
    `).join('');

    container.querySelectorAll('.complex-card').forEach(card => {
      card.onclick = () => on_select(Number(card.dataset.cx));
    });

    const lvl = COMPLEXITY_LEVELS[selected_complexity];
    if (lvl && $('moduleChips')) {
      $('moduleChips').innerHTML = lvl.modules.map(m => `<span class="chip">${m}</span>`).join('');
    }
  }

  static render_teams_editor($, teams) {
    const editor = $('teamsEditor');
    if (!editor) return;
    editor.innerHTML = teams.map((t, i) => `
      <div class="team-edit">
        <strong>Equipo ${i + 1}</strong>
        <label>Nombre
          <input data-team-idx="${i}" data-field="name" value="${t.name}">
        </label>
        <label>Código de acceso
          <input data-team-idx="${i}" data-field="code" value="${t.code}">
        </label>
      </div>
    `).join('');

    editor.querySelectorAll('[data-team-idx]').forEach(input => {
      input.oninput = () => {
        const idx = Number(input.dataset.teamIdx);
        const field = input.dataset.field;
        teams[idx][field] = input.value;
      };
    });
  }

  static render_macro_presets($, on_preset_select) {
    const container = $('macroPresets');
    if (!container) return;
    container.innerHTML = Object.keys(MACRO_PRESETS).map(key => `
      <button type="button" class="preset ${key === 'Estable' ? 'selected' : ''}" data-macro="${key}">${key}</button>
    `).join('');

    container.querySelectorAll('[data-macro]').forEach(btn => {
      btn.onclick = () => {
        container.querySelectorAll('[data-macro]').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        on_preset_select(btn.dataset.macro, MACRO_PRESETS[btn.dataset.macro]);
      };
    });
  }

  static render_evaluation_presets($, on_eval_select) {
    const container = $('evaluationPresets');
    if (!container) return;
    container.innerHTML = Object.keys(EVALUATION_PRESETS).map(key => `
      <button type="button" class="preset ${key === 'Equilibrado' ? 'selected' : ''}" data-eval="${key}">${key}</button>
    `).join('');

    container.querySelectorAll('[data-eval]').forEach(btn => {
      btn.onclick = () => {
        container.querySelectorAll('[data-eval]').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        on_eval_select(EVALUATION_PRESETS[btn.dataset.eval]);
      };
    });
  }

  /**
   * Renderiza las tarjetas de eventos como opciones seleccionables (Sí/No) por el profesor.
   */
  static render_events_catalog($, selected_event_ids, on_toggle_event) {
    const container = $('eventCatalog');
    if (!container) return;

    const selectable_events = MARKET_EVENTS.filter(e => e.id !== 'event_baseline');
    container.innerHTML = selectable_events.map(e => {
      const is_checked = selected_event_ids.has(e.id);
      const cost_pct = Math.round((e.cost_multiplier - 1) * 100);
      const dem_pct = Math.round((e.demand_multiplier - 1) * 100);
      const cost_badge = cost_pct !== 0 ? `<span class="chip">Costos: ${cost_pct > 0 ? '+' : ''}${cost_pct}%</span>` : '';
      const dem_badge = dem_pct !== 0 ? `<span class="chip">Demanda: ${dem_pct > 0 ? '+' : ''}${dem_pct}%</span>` : '';

      return `
        <div class="event-item selectable ${is_checked ? 'selected' : ''}" data-event-id="${e.id}">
          <div class="row-between">
            <h4>${e.name}</h4>
            <label class="toggle" style="margin:0">
              <input type="checkbox" data-event-check="${e.id}" ${is_checked ? 'checked' : ''} />
              <span>${is_checked ? 'Incluido' : 'Omitido'}</span>
            </label>
          </div>
          <p style="margin-top:6px">${e.text}</p>
          <div class="chips" style="margin-top:8px">${cost_badge}${dem_badge}</div>
        </div>
      `;
    }).join('');

    container.querySelectorAll('[data-event-id]').forEach(card => {
      card.onclick = (ev) => {
        if (ev.target.tagName === 'INPUT') return;
        const id = card.dataset.eventId;
        on_toggle_event(id);
      };
    });

    container.querySelectorAll('[data-event-check]').forEach(chk => {
      chk.onchange = () => on_toggle_event(chk.dataset.eventCheck);
    });
  }

  static render_macro_source_badge($, macro_params, country_name) {
    const badge_el = $('macroSourceInfo');
    if (!badge_el || !macro_params) return;
    badge_el.innerHTML = `
      <strong>Fuente Económica Activa (${country_name}):</strong> ${macro_params.source}
      · Año ref: <strong>${macro_params.reference_year}</strong>
      · Inflación: <strong>${macro_params.inflation}%</strong>
      · PIB: <strong>${macro_params.gdp}%</strong>
      · Tasa Interés: <strong>${macro_params.interest}%</strong>
    `;
  }
}
