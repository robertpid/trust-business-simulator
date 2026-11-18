/**
 * TRUST Business Simulator - Capa de Presentación: Controlador del Panel de Simulación
 * 
 * Gestiona la separación de vistas (Profesor vs. Estudiante por equipo),
 * recolección de decisiones, exportación directa a Excel y renderizado visual.
 */

import { TeamDecision } from '../domain/models.js';
import { get_scale_archetype } from '../domain/constants.js';
import { ReportExporterService } from '../business/report_exporter_service.js';
import { DashboardRenderer } from './dashboard_renderer.js';
import { TeacherAnalyticsRenderer } from './teacher_analytics_renderer.js';
import { ConfigPanelRenderer } from './config_panel_renderer.js';
import { AuthModalController } from './auth_modal_controller.js';
import { UiFeedbackView } from './ui_feedback_view.js';
import { Logger } from '../utils/logger.js';

const logger = new Logger('SimulationDashboardController');

export class SimulationDashboardController {
  constructor({ simulation_service, repository, on_reset_request }) {
    this.service = simulation_service;
    this.repository = repository;
    this.on_reset_request = on_reset_request;
    this.active_role = 'teacher';
    this.saved_team_ids = new Set();
    this.$ = (id) => document.getElementById(id);

    this.auth_controller = new AuthModalController({
      $: this.$,
      on_role_change: (session) => {
        if (session.role === 'teacher') {
          this.active_role = 'teacher';
        } else {
          this.active_role = session.team_id || this.service.config.teams[0]?.id || 'team_1';
        }
        this.apply_role_view();
      }
    });
  }

  init() {
    this.auth_controller.init(this.service.config.teams);
    if (this.auth_controller.session.role === 'student' && this.auth_controller.session.team_id) {
      this.active_role = this.auth_controller.session.team_id;
    } else {
      this.active_role = 'teacher';
    }
    this._bind_tabs();
    this._bind_actions();
    this.render_dashboard();
    logger.info('Controlador del panel de simulación inicializado.');
  }

  _populate_role_selector() {
    this.auth_controller.update_teams(this.service.config.teams);
  }

  apply_role_view() {
    const is_teacher = this.active_role === 'teacher';
    const config = this.service.config;

    // 1. Mostrar u ocultar pestaña exclusiva del Profesor
    const teacher_tab_btn = this.$('tabBtnTeacher');
    if (teacher_tab_btn) {
      teacher_tab_btn.style.display = is_teacher ? 'flex' : 'none';
    }

    // Si pasa a estudiante mientras estaba viendo el panel del profesor, cambiar a Decisiones
    if (!is_teacher && this.$('tab-teacher')?.classList.contains('active')) {
      this.switch_tab('decisions');
    }

    // 2. Botón Cerrar Ronda (Profesor) vs Guardar Decisión (Estudiante)
    const run_btn = this.$('runRound');
    const save_btn = this.$('btnSaveStudentDecision');
    if (run_btn) run_btn.style.display = is_teacher ? 'inline-block' : 'none';
    if (save_btn) save_btn.style.display = is_teacher ? 'none' : 'inline-block';

    // 3. Textos de cabecera de decisiones
    const team_obj = config.teams.find(t => t.id === this.active_role);
    if (this.$('decisionViewKicker')) {
      this.$('decisionViewKicker').textContent = is_teacher
        ? 'PANEL DE CONTROL DOCENTE'
        : `MODO ESTUDIANTE · ${team_obj?.code || ''}`;
    }
    if (this.$('decisionViewTitle')) {
      this.$('decisionViewTitle').textContent = is_teacher
        ? 'Decisiones de todos los equipos'
        : `Decisiones de ${team_obj?.name || 'mi empresa'}`;
    }
    if (this.$('decisionViewDesc')) {
      this.$('decisionViewDesc').textContent = is_teacher
        ? 'Supervisa las decisiones enviadas por los equipos y cierra la ronda cuando estén listos.'
        : 'Ingresa las decisiones confidenciales de tu empresa para esta ronda y presiona Guardar.';
    }

    // 4. Mostrar solo la tarjeta del equipo activo si está en Modo Estudiante
    document.querySelectorAll('.decision-card').forEach(card => {
      const card_team = card.dataset.cardTeam;
      card.style.display = (is_teacher || card_team === this.active_role) ? 'block' : 'none';
    });

    // 5. Actualizar panel visual de configuración según permisos de rol
    ConfigPanelRenderer.render_visual_config(this.$, config, is_teacher ? 'teacher' : 'student');
  }

  _bind_tabs() {
    document.querySelectorAll('.tab').forEach(tab_btn => {
      tab_btn.onclick = () => this.switch_tab(tab_btn.dataset.tab);
    });
  }

  _bind_actions() {
    const run_btn = this.$('runRound');
    if (run_btn) run_btn.onclick = () => this.handle_run_round();

    const save_student_btn = this.$('btnSaveStudentDecision');
    if (save_student_btn) {
      save_student_btn.onclick = () => {
        this.saved_team_ids.add(this.active_role);
        this._update_team_saved_badges();
        const team = this.service.config.teams.find(t => t.id === this.active_role);
        UiFeedbackView.success(`Decisión de ${team?.name || 'tu equipo'} guardada y lista para la ronda.`);
      };
    }

    const excel_btn = this.$('btnExportExcel');
    if (excel_btn) excel_btn.onclick = () => this.handle_export_excel();

    const reset_btn = this.$('btnReset');
    if (reset_btn) {
      reset_btn.onclick = () => {
        if (confirm('¿Deseas reiniciar la simulación actual y regresar al configurador docente?')) {
          if (this.on_reset_request) this.on_reset_request();
        }
      };
    }
  }

  _update_team_saved_badges() {
    document.querySelectorAll('[data-saved-badge]').forEach(badge => {
      const team_id = badge.dataset.savedBadge;
      const is_saved = this.saved_team_ids.has(team_id);
      badge.textContent = is_saved ? '✅ Decisión lista' : '⏳ Pendiente';
    });
  }

  handle_export_excel() {
    const xls = ReportExporterService.generate_excel_sheet(this.service.config, this.service.history);
    const filename = `Reporte_Excel_${this.service.config.industry}_Ronda_${this.service.history.length}.xls`;
    ReportExporterService.trigger_browser_download(filename, xls, 'application/vnd.ms-excel;charset=utf-8;');
    UiFeedbackView.success('Archivo Excel (.xls) descargado exitosamente.');
  }

  switch_tab(tab_name) {
    document.querySelectorAll('.tab').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tab_name);
    });
    document.querySelectorAll('.tabpane').forEach(pane => {
      pane.classList.toggle('active', pane.id === `tab-${tab_name}`);
    });
  }

  render_dashboard() {
    const config = this.service.config;
    if (!config) return;

    this.$('setupView').classList.remove('active');
    this.$('simView').classList.add('active');

    this.$('simTitle').textContent = config.name;
    const industry = this.service.get_current_industry();
    const scale = get_scale_archetype(config.size);
    this.$('simMeta').textContent = `${industry.name} · ${scale.name} · ${config.country_name || config.country} (${config.currency_symbol}) · Nivel ${config.complexity}`;
    this.$('currentRound').textContent = Math.min(this.service.current_round, config.total_rounds);
    this.$('roundUnit').textContent = config.round_duration;

    this.render_round_event();
    this.render_decision_cards();
    this.render_teacher_analytics();
    this.apply_role_view();

    if (this.service.last_summary) {
      this.render_results(this.service.last_summary);
      this.render_history();
    }
  }

  render_round_event() {
    const config = this.service.config;
    const event = this.service.active_event;
    const is_surprise = config.surprise_events && event.name !== 'Sin evento extraordinario';
    const event_title = is_surprise ? 'Evento revelado al cierre' : event.name;
    const event_description = is_surprise ? '' : ` — ${event.text}`;
    const macro_info = ` · Inflación: ${config.macro.inflation}% · PIB: ${config.macro.gdp}%`;

    this.$('roundEvent').innerHTML = `<strong>Entorno de la ronda:</strong> ${event_title}${event_description}${macro_info}`;
  }

  render_decision_cards() {
    const config = this.service.config;
    const sym = config.currency_symbol || '$';
    const container = this.$('decisionCards');

    container.innerHTML = config.teams.map((team, index) => {
      const defaults = this.service.generate_default_decision(index);
      const team_state = this.service.team_states.get(team.id);
      const init_inv = team_state ? team_state.ending_inventory : 0;
      const cash_avail = team_state?.finance ? Math.round(team_state.finance.cash).toLocaleString('es-PE') : '0';
      const is_saved = this.saved_team_ids.has(team.id);

      const is_level_3 = config.complexity === 3;
      const dynamic_field_label = is_level_3 ? 'Innovación (0-100)' : 'Personas (0-100)';
      const dynamic_field_key = is_level_3 ? 'innovation' : 'people';
      const dynamic_field_value = is_level_3 ? defaults.innovation : defaults.people;

      return `
        <div class="decision-card" data-card-team="${team.id}">
          <div class="row-between">
            <div><h4>${team.name}</h4><span class="muted">${team.code}</span></div>
            <div class="chips" style="margin:0">
              <span class="chip" data-saved-badge="${team.id}">${is_saved ? '✅ Decisión lista' : '⏳ Pendiente'}</span>
              <span class="chip">Stock: ${init_inv.toLocaleString('es-PE')} uds · Caja: ${sym} ${cash_avail}</span>
            </div>
          </div>
          <div class="inputs">
            <label>Precio (${sym})<input data-field="price" type="number" step="0.01" value="${defaults.price}"></label>
            <label>Marketing (${sym})<input data-field="marketing" type="number" step="100" value="${defaults.marketing}"></label>
            <label>Calidad (0-100)<input data-field="quality" type="number" min="0" max="100" value="${defaults.quality}"></label>
            <label>Servicio (0-100)<input data-field="service" type="number" min="0" max="100" value="${defaults.service}"></label>
            <label>Capacidad prod. (uds)<input data-field="capacity" type="number" step="50" value="${defaults.capacity}"></label>
            <label>${dynamic_field_label}<input data-field="${dynamic_field_key}" type="number" min="0" max="100" value="${dynamic_field_value}"></label>
          </div>
          <label class="topgap">Justificación estratégica
            <textarea data-field="reason" placeholder="¿Por qué tomaron estas decisiones?">${defaults.reason}</textarea>
          </label>
        </div>
      `;
    }).join('');
  }

  collect_decisions_from_ui() {
    const cards = document.querySelectorAll('.decision-card');
    return Array.from(cards).map(card => {
      const decision_data = { team_id: card.dataset.cardTeam };
      card.querySelectorAll('[data-field]').forEach(input => {
        decision_data[input.dataset.field] = input.tagName === 'TEXTAREA' ? input.value : Number(input.value);
      });
      if (!('innovation' in decision_data)) decision_data.innovation = 50;
      if (!('people' in decision_data)) decision_data.people = 50;
      return new TeamDecision(decision_data);
    });
  }

  handle_run_round() {
    try {
      const decisions = this.collect_decisions_from_ui();
      const summary = this.service.execute_round(decisions);

      this.saved_team_ids.clear();
      this.repository.save_history(this.service.history);
      this.render_results(summary);
      this.render_history();
      this.render_decision_cards();
      this.render_teacher_analytics();
      this.apply_role_view();

      this.$('currentRound').textContent = Math.min(this.service.current_round, this.service.config.total_rounds);
      this.render_round_event();
      this.switch_tab('results');

      UiFeedbackView.success(`¡Ronda ${summary.round_number} simulada exitosamente!`);
    } catch (err) {
      logger.error('Error al ejecutar la ronda', err);
      UiFeedbackView.error(err.message || 'Ocurrió un error inesperado al simular la ronda.');
    }
  }

  render_results(summary) {
    const sym = this.service.config.currency_symbol || '$';
    const money = (n) => `${sym} ${Math.round(n).toLocaleString('es-PE')}`;
    DashboardRenderer.render_industry_kpis(this.$, summary, money);
    DashboardRenderer.render_benchmarking_table(this.$, summary, money);
    DashboardRenderer.render_finance_ops_table(this.$, summary, money);
    this.$('coachText').innerHTML = summary.coach_feedback;
  }

  render_history() {
    DashboardRenderer.render_history_cards(this.$, this.service.config.teams, this.service.history);
  }

  render_teacher_analytics() {
    TeacherAnalyticsRenderer.render_ai_brains_telemetry(this.$, this.service);
    TeacherAnalyticsRenderer.render_academic_grades_table(this.$, this.service.config, this.service.history);
  }
}
