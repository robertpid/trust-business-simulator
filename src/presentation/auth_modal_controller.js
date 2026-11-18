/**
 * TRUST Business Simulator - Capa de Presentación: Controlador de Autenticación y Roles
 * 
 * Gestiona el inicio de sesión y cambio de roles entre Profesor (Control Total)
 * y Estudiante/Alumno (Acceso exclusivo a su empresa y privacidad de decisiones).
 */

import { Logger } from '../utils/logger.js';
import { UiFeedbackView } from './ui_feedback_view.js';

const logger = new Logger('AuthModalController');
const SESSION_STORAGE_KEY = 'trust_sim_user_session';

export class AuthModalController {
  /**
   * @param {Object} options
   * @param {Function} options.on_role_change
   * @param {Function} options.$
   */
  constructor({ on_role_change, $ }) {
    this.on_role_change = on_role_change;
    this.$ = $;
    this.session = this._load_session();
    this.teams = [];
    this.selected_role_tab = this.session.role || 'teacher';
  }

  /**
   * Carga la sesión previa almacenada o establece profesor por defecto.
   * @private
   */
  _load_session() {
    try {
      const saved = localStorage.getItem(SESSION_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignorar fallo de storage
    }
    return { role: 'teacher', team_id: null, team_name: null, student_name: '' };
  }

  /**
   * Guarda la sesión activa en almacenamiento local.
   * @private
   */
  _save_session(session) {
    this.session = session;
    try {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    } catch (err) {
      logger.warn('No se pudo persistir la sesión de usuario', err);
    }
    this.update_session_badges();
    if (typeof this.on_role_change === 'function') {
      this.on_role_change(this.session);
    }
  }

  /**
   * Inicializa los componentes visuales del modal de autenticación.
   * @param {Array<Object>} teams
   */
  init(teams = []) {
    this.teams = teams;
    this._render_modal();
    this._bind_events();
    this.update_session_badges();
    logger.info('Controlador de autenticación inicializado.');
  }

  /**
   * Actualiza el listado de equipos disponibles para el login de alumnos.
   * @param {Array<Object>} teams
   */
  update_teams(teams = []) {
    this.teams = teams;
    const select = this.$('authTeamSelect');
    if (!select) return;

    select.innerHTML = '';
    if (teams.length === 0) {
      select.add(new Option('Sin equipos configurados aún', ''));
      return;
    }

    teams.forEach(t => {
      select.add(new Option(`${t.name} (${t.code})`, t.id));
    });

    if (this.session.team_id && teams.some(t => t.id === this.session.team_id)) {
      select.value = this.session.team_id;
    }
  }

  /**
   * Renderiza el modal de login en el contenedor del documento.
   * @private
   */
  _render_modal() {
    let backdrop = this.$('authBackdrop');
    if (backdrop) return;

    backdrop = document.createElement('div');
    backdrop.id = 'authBackdrop';
    backdrop.className = 'auth-backdrop';
    backdrop.innerHTML = `
      <div class="auth-card" role="dialog" aria-modal="true" aria-labelledby="authTitle">
        <div class="row-between" style="margin-bottom:12px">
          <div>
            <span class="section-kicker">CONTROL DE ACCESO</span>
            <h3 id="authTitle" style="margin:4px 0">Iniciar Sesión</h3>
          </div>
          <button id="btnCloseAuthModal" type="button" class="ghost" aria-label="Cerrar modal" style="padding:6px 10px;font-size:16px">✕</button>
        </div>
        <p class="muted" style="margin-top:0">Selecciona el perfil con el que deseas interactuar en el simulador:</p>

        <div class="auth-roles">
          <div id="choiceTeacher" class="role-choice ${this.selected_role_tab === 'teacher' ? 'selected' : ''}" tabindex="0">
            <strong>👨‍🏫 Profesor</strong>
            <small>Control total, mercado, rondas y actas</small>
          </div>
          <div id="choiceStudent" class="role-choice ${this.selected_role_tab === 'student' ? 'selected' : ''}" tabindex="0">
            <strong>🎓 Alumno</strong>
            <small>Decisiones y finanzas de mi empresa</small>
          </div>
        </div>

        <form id="authTeacherForm" style="display:${this.selected_role_tab === 'teacher' ? 'block' : 'none'}">
          <label>PIN o Contraseña Docente
            <input type="password" id="authTeacherPin" placeholder="Ingrese PIN (o deje en blanco)" autocomplete="current-password" />
          </label>
          <div class="info-line" style="margin:12px 0;font-size:12px">
            El perfil docente puede crear mercados, simular rondas, revisar todos los equipos y generar el informe oficial de notas.
          </div>
          <button type="submit" class="secondary" style="width:100%;padding:12px">Ingresar como Profesor</button>
        </form>

        <form id="authStudentForm" style="display:${this.selected_role_tab === 'student' ? 'block' : 'none'}">
          <label>Selecciona tu Empresa / Equipo
            <select id="authTeamSelect" required aria-label="Equipo de estudiante"></select>
          </label>
          <label class="topgap">Nombre del Estudiante (Opcional)
            <input type="text" id="authStudentName" placeholder="Ej: María Gómez" />
          </label>
          <div class="info-line" style="margin:12px 0;font-size:12px">
            Acceso privado. Solo podrás consultar y modificar las decisiones operativas y balances de tu propia empresa.
          </div>
          <button type="submit" class="secondary" style="width:100%;padding:12px">Ingresar a mi Empresa</button>
        </form>
      </div>
    `;
    document.body.appendChild(backdrop);
    this.update_teams(this.teams);
  }

  /**
   * Asocia los eventos de la interfaz del modal.
   * @private
   */
  _bind_events() {
    this.$('choiceTeacher').onclick = () => this._switch_tab('teacher');
    this.$('choiceStudent').onclick = () => this._switch_tab('student');
    this.$('btnCloseAuthModal').onclick = () => this.close();

    const backdrop = this.$('authBackdrop');
    backdrop.onclick = (e) => {
      if (e.target === backdrop) this.close();
    };

    this.$('authTeacherForm').onsubmit = (e) => {
      e.preventDefault();
      this._login_teacher();
    };

    this.$('authStudentForm').onsubmit = (e) => {
      e.preventDefault();
      this._login_student();
    };

    const topbar_btn = this.$('btnOpenLoginModal');
    if (topbar_btn) topbar_btn.onclick = () => this.open();

    const sim_switch_btn = this.$('btnSimSwitchUser');
    if (sim_switch_btn) sim_switch_btn.onclick = () => this.open();
  }

  _switch_tab(role) {
    this.selected_role_tab = role;
    this.$('choiceTeacher')?.classList.toggle('selected', role === 'teacher');
    this.$('choiceStudent')?.classList.toggle('selected', role === 'student');
    if (this.$('authTeacherForm')) this.$('authTeacherForm').style.display = role === 'teacher' ? 'block' : 'none';
    if (this.$('authStudentForm')) this.$('authStudentForm').style.display = role === 'student' ? 'block' : 'none';
  }

  _login_teacher() {
    this._save_session({
      role: 'teacher',
      team_id: null,
      team_name: null,
      student_name: ''
    });
    this.close();
    UiFeedbackView.success('Sesión iniciada como Profesor (Control Total).');
  }

  _login_student() {
    const team_id = this.$('authTeamSelect')?.value;
    if (!team_id) {
      UiFeedbackView.error('Debes seleccionar un equipo para ingresar como estudiante.');
      return;
    }
    const team = this.teams.find(t => t.id === team_id);
    const student_name = this.$('authStudentName')?.value.trim() || '';

    this._save_session({
      role: 'student',
      team_id,
      team_name: team ? `${team.name} (${team.code})` : 'Mi Empresa',
      student_name
    });
    this.close();
    UiFeedbackView.success(`Sesión iniciada como Estudiante: ${this.session.team_name}`);
  }

  open() {
    const backdrop = this.$('authBackdrop');
    if (backdrop) backdrop.classList.add('open');
  }

  close() {
    const backdrop = this.$('authBackdrop');
    if (backdrop) backdrop.classList.remove('open');
  }

  update_session_badges() {
    const is_teacher = this.session.role === 'teacher';
    const label = is_teacher
      ? '👨‍🏫 Profesor (Control Total)'
      : `🎓 Alumno: ${this.session.team_name || 'Mi Empresa'}`;

    const top_badge = this.$('currentUserBadge');
    if (top_badge) top_badge.textContent = label;

    const sim_tag = this.$('simUserSessionTag');
    if (sim_tag) sim_tag.textContent = label;
  }
}
