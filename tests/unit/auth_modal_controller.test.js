/**
 * TRUST Business Simulator - Pruebas Unitarias: AuthModalController
 * 
 * Verifica el sistema de inicio de sesión y separación de roles (Profesor / Estudiante).
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { AuthModalController } from '../../src/presentation/auth_modal_controller.js';

describe('Capa de Presentación: AuthModalController (Login y Roles)', () => {
  let fake_storage;
  let mock_elements;

  beforeEach(() => {
    fake_storage = {};
    mock_elements = {};

    globalThis.localStorage = {
      getItem: (key) => fake_storage[key] || null,
      setItem: (key, val) => { fake_storage[key] = String(val); },
      removeItem: (key) => { delete fake_storage[key]; }
    };
  });

  function get_mock_$(id) {
    if (!mock_elements[id]) {
      mock_elements[id] = {
        id,
        style: {},
        classList: {
          classes: new Set(),
          add(c) { this.classes.add(c); },
          remove(c) { this.classes.delete(c); },
          contains(c) { return this.classes.has(c); },
          toggle(c, force) { if (force) this.add(c); else this.remove(c); }
        },
        options: [],
        add(opt) { this.options.push(opt); },
        value: '',
        textContent: '',
        innerHTML: ''
      };
    }
    return mock_elements[id];
  }

  it('Debe inicializarse con perfil de Profesor por defecto si no hay sesión previa', () => {
    let triggered_session = null;
    const auth = new AuthModalController({
      $: get_mock_$,
      on_role_change: (s) => { triggered_session = s; }
    });

    assert.equal(auth.session.role, 'teacher');
    assert.equal(auth.session.team_id, null);
  });

  it('Debe permitir iniciar sesión como Alumno vinculado a un equipo específico', () => {
    const teams = [
      { id: 'eq1', name: 'Empresa A', code: 'EQ-01' },
      { id: 'eq2', name: 'Empresa B', code: 'EQ-02' }
    ];

    let last_session = null;
    const auth = new AuthModalController({
      $: get_mock_$,
      on_role_change: (s) => { last_session = s; }
    });

    auth.teams = teams;
    const select = get_mock_$('authTeamSelect');
    select.value = 'eq1';

    const name_input = get_mock_$('authStudentName');
    name_input.value = 'Carlos Ramos';

    auth._login_student();

    assert.equal(auth.session.role, 'student');
    assert.equal(auth.session.team_id, 'eq1');
    assert.match(auth.session.team_name, /Empresa A/);
    assert.equal(last_session.role, 'student');
  });

  it('Debe permitir al usuario cambiar de nuevo a rol de Profesor', () => {
    let last_session = null;
    const auth = new AuthModalController({
      $: get_mock_$,
      on_role_change: (s) => { last_session = s; }
    });

    auth._login_teacher();

    assert.equal(auth.session.role, 'teacher');
    assert.equal(auth.session.team_id, null);
    assert.equal(last_session.role, 'teacher');
  });

  it('Debe actualizar los distintivos y etiquetas visuales de cabecera', () => {
    const auth = new AuthModalController({
      $: get_mock_$,
      on_role_change: () => {}
    });

    auth._save_session({
      role: 'student',
      team_id: 'eq2',
      team_name: 'Empresa B (EQ-02)',
      student_name: 'Ana'
    });

    const badge = get_mock_$('currentUserBadge');
    const tag = get_mock_$('simUserSessionTag');

    assert.match(badge.textContent, /Empresa B/);
    assert.match(tag.textContent, /Empresa B/);
  });
});
