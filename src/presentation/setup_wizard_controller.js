/**
 * TRUST Business Simulator - Capa de Presentación: Controlador del Asistente Docente
 * 
 * Coordina los 6 pasos del asistente, la selección de escala empresarial,
 * el soporte global de países, la sincronización en vivo con datos macro de Internet
 * y la selección individual de eventos de mercado.
 */

import {
  INDUSTRIES,
  MARKET_EVENTS,
  resolve_country_profile,
  get_scale_archetype
} from '../domain/constants.js';
import { Team, MacroParameters, EvaluationWeights, SimulationConfig } from '../domain/models.js';
import { validate_evaluation_weights } from '../domain/validators.js';
import { MacroEconomicService } from '../business/macro_data_provider.js';
import { WizardStepRenderer } from './wizard_step_renderer.js';
import { UiFeedbackView } from './ui_feedback_view.js';
import { Logger } from '../utils/logger.js';

const logger = new Logger('SetupWizardController');

export class SetupWizardController {
  constructor({ on_simulation_start, macro_service = null }) {
    this.on_simulation_start = on_simulation_start;
    this.macro_service = macro_service || new MacroEconomicService();
    this.current_step = 1;
    this.total_steps = 6;
    this.selected_complexity = 2;
    this.teams = [];
    this.selected_event_ids = new Set(
      MARKET_EVENTS.filter(e => e.id !== 'event_baseline').map(e => e.id)
    );
    this.active_macro_source = 'Catálogo Económico Base';
    this.active_macro_year = '2026';

    this.$ = (id) => document.getElementById(id);
  }

  init() {
    WizardStepRenderer.populate_dropdowns(this.$);
    this._sync_industry_and_scale();
    this._sync_country();
    this._render_complexity();
    WizardStepRenderer.render_progress(this.$, this.current_step, this.total_steps);
    WizardStepRenderer.render_macro_presets(this.$, (name, p) => {
      this._apply_macro_values(new MacroParameters({
        ...p,
        source: `Preset ${name}`,
        reference_year: '2026'
      }), this._get_current_country_profile().name);
    });
    WizardStepRenderer.render_evaluation_presets(this.$, (p) => {
      this.$('wFin').value = p.finance;
      this.$('wMkt').value = p.marketing;
      this.$('wOps').value = p.operations;
      this.$('wPeople').value = p.people;
      this.$('wStrat').value = p.strategy;
      this.check_weights();
    });
    this._render_events_selector();
    this.generate_teams();
    this._bind_events();
    this.check_weights();

    logger.info('Controlador del asistente docente inicializado.');
  }

  _render_events_selector() {
    WizardStepRenderer.render_events_catalog(this.$, this.selected_event_ids, (event_id) => {
      if (this.selected_event_ids.has(event_id)) {
        this.selected_event_ids.delete(event_id);
      } else {
        this.selected_event_ids.add(event_id);
      }
      this._render_events_selector();
    });
  }

  _bind_events() {
    this.$('industry').onchange = () => this._sync_industry_and_scale();
    this.$('size').onchange = () => this._sync_industry_and_scale();
    this.$('country').onchange = () => this._sync_country();
    this.$('generateTeams').onclick = () => this.generate_teams();
    this.$('teamCount').onchange = () => this.generate_teams();

    const sync_btn = this.$('btnSyncLiveMacro');
    if (sync_btn) sync_btn.onclick = () => this.sync_live_macro_from_internet();

    const custom_name_el = this.$('customCountryName');
    if (custom_name_el) custom_name_el.onchange = () => this.sync_live_macro_from_internet();

    this.$('nextBtn').onclick = () => {
      if (this.current_step < this.total_steps) {
        this.current_step++;
        this._show_step();
      } else {
        this._handle_start_simulation();
      }
    };

    this.$('prevBtn').onclick = () => {
      if (this.current_step > 1) {
        this.current_step--;
        this._show_step();
      }
    };

    ['wFin', 'wMkt', 'wOps', 'wPeople', 'wStrat'].forEach(id => {
      const el = this.$(id);
      if (el) el.oninput = () => this.check_weights();
    });
  }

  _sync_industry_and_scale() {
    const ind = INDUSTRIES[this.$('industry').value];
    const scale = get_scale_archetype(this.$('size').value);
    if (!ind) return;
    this.$('sector').value = ind.sector;
    WizardStepRenderer.render_industry_and_scale_note(this.$, ind, scale);
  }

  _get_current_country_profile() {
    const country_id = this.$('country').value;
    const custom_name = this.$('customCountryName')?.value || '';
    const custom_symbol = this.$('customCurrencySymbol')?.value || '';
    const custom_currency = this.$('customCurrencyName')?.value || '';
    return resolve_country_profile(country_id, {
      custom_name,
      custom_symbol,
      custom_currency
    });
  }

  _sync_country() {
    const is_custom = this.$('country').value === 'CUSTOM';
    const custom_box = this.$('customCountryFields');
    if (custom_box) custom_box.style.display = is_custom ? 'grid' : 'none';

    const profile = this._get_current_country_profile();
    this.$('currency').value = profile.currency;

    if (profile.baseline_macro) {
      this._apply_macro_values(new MacroParameters({
        ...profile.baseline_macro,
        source: `Catálogo Base (${profile.name})`,
        reference_year: '2026'
      }), profile.name);
    }
  }

  async sync_live_macro_from_internet() {
    const sync_btn = this.$('btnSyncLiveMacro');
    if (sync_btn) {
      sync_btn.disabled = true;
      sync_btn.textContent = '⏳ Consultando datos reales...';
    }

    try {
      const is_custom = this.$('country').value === 'CUSTOM';
      const query = is_custom ? (this.$('customCountryName')?.value || 'PE') : this.$('country').value;

      if (is_custom && query.length > 2) {
        const online_country = await this.macro_service.live_provider.resolve_custom_country_online(query);
        if (online_country) {
          if (this.$('customCurrencySymbol')) this.$('customCurrencySymbol').value = online_country.symbol;
          if (this.$('customCurrencyName')) this.$('customCurrencyName').value = online_country.currency;
          this.$('currency').value = online_country.currency;
        }
      }

      const macro_data = await this.macro_service.get_country_macro(query);
      const profile = this._get_current_country_profile();
      this._apply_macro_values(macro_data, profile.name);
      UiFeedbackView.success(`Economía de ${profile.name} sincronizada (${macro_data.source}).`);
    } catch (err) {
      logger.error('Error sincronizando macroeconomía en vivo', err);
      UiFeedbackView.warning('Se aplicaron datos de respaldo local para el país seleccionado.');
    } finally {
      if (sync_btn) {
        sync_btn.disabled = false;
        sync_btn.textContent = '🌐 Sincronizar economía real de Internet';
      }
    }
  }

  _apply_macro_values(macro_params, country_name) {
    this.$('inflation').value = macro_params.inflation;
    this.$('gdp').value = macro_params.gdp;
    this.$('interest').value = macro_params.interest;
    this.$('demandGrowth').value = macro_params.demand_growth;
    this.active_macro_source = macro_params.source;
    this.active_macro_year = macro_params.reference_year;
    WizardStepRenderer.render_macro_source_badge(this.$, macro_params, country_name);
  }

  _show_step() {
    document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
    this.$(`step${this.current_step}`)?.classList.add('active');
    document.querySelectorAll('.rail-step').forEach((x, i) => {
      x.classList.toggle('active', i === this.current_step - 1);
    });
    this.$('prevBtn').disabled = this.current_step === 1;
    this.$('nextBtn').textContent = this.current_step === this.total_steps ? 'Crear simulación →' : 'Continuar →';
    WizardStepRenderer.render_progress(this.$, this.current_step, this.total_steps);
  }

  _render_complexity() {
    WizardStepRenderer.render_complexity(this.$, this.selected_complexity, (lvl) => {
      this.selected_complexity = lvl;
      this._render_complexity();
    });
  }

  generate_teams() {
    const count = Math.max(2, Math.min(12, Number(this.$('teamCount').value) || 4));
    this.teams = Array.from({ length: count }, (_, i) => new Team(
      `team_${i + 1}`,
      `Empresa ${String.fromCharCode(65 + i)}`,
      `EQ-${String(i + 1).padStart(2, '0')}`
    ));
    WizardStepRenderer.render_teams_editor(this.$, this.teams);
  }

  check_weights() {
    const weights = new EvaluationWeights({
      finance: Number(this.$('wFin').value) || 0,
      marketing: Number(this.$('wMkt').value) || 0,
      operations: Number(this.$('wOps').value) || 0,
      people: Number(this.$('wPeople').value) || 0,
      strategy: Number(this.$('wStrat').value) || 0
    });
    const validation = validate_evaluation_weights(weights);
    const feedback_el = this.$('weightsCheck');
    feedback_el.className = `validation ${validation.valid ? 'good' : 'bad'}`;
    feedback_el.textContent = validation.message;
    return validation.valid;
  }

  _handle_start_simulation() {
    if (!this.check_weights()) {
      UiFeedbackView.error('Las ponderaciones de evaluación deben sumar exactamente 100%.');
      return;
    }
    const profile = this._get_current_country_profile();
    const config = new SimulationConfig({
      name: this.$('simName').value,
      industry: this.$('industry').value,
      country: profile.id,
      country_name: profile.name,
      currency: profile.currency,
      currency_symbol: profile.symbol,
      size: this.$('size').value,
      complexity: this.selected_complexity,
      round_duration: this.$('roundDuration').value,
      total_rounds: Number(this.$('rounds').value),
      practice_rounds: Number(this.$('practiceRounds').value),
      macro: new MacroParameters({
        inflation: Number(this.$('inflation').value),
        gdp: Number(this.$('gdp').value),
        interest: Number(this.$('interest').value),
        demand_growth: Number(this.$('demandGrowth').value),
        source: this.active_macro_source,
        reference_year: this.active_macro_year
      }),
      events_enabled: this.$('eventsEnabled').checked,
      surprise_events: this.$('surpriseEvents').checked,
      selected_event_ids: Array.from(this.selected_event_ids),
      weights: new EvaluationWeights({
        finance: Number(this.$('wFin').value),
        marketing: Number(this.$('wMkt').value),
        operations: Number(this.$('wOps').value),
        people: Number(this.$('wPeople').value),
        strategy: Number(this.$('wStrat').value)
      }),
      weights_visible: this.$('weightsVisible').checked,
      teams: this.teams
    });

    if (this.on_simulation_start) this.on_simulation_start(config);
  }
}
