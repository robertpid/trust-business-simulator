/**
 * TRUST Business Simulator - Punto de Entrada Principal (Main Orchestrator)
 * 
 * Conecta las capas de la arquitectura N-capas:
 * 1. Dominio (Domain)
 * 2. Lógica de Negocio (Business)
 * 3. Persistencia (Persistence)
 * 4. Presentación (Presentation)
 */

import { SimulationService } from './business/simulation_service.js';
import { SimulationRepository } from './persistence/simulation_repository.js';
import { SetupWizardController } from './presentation/setup_wizard_controller.js';
import { SimulationDashboardController } from './presentation/simulation_dashboard_controller.js';
import { UiFeedbackView } from './presentation/ui_feedback_view.js';
import { Logger } from './utils/logger.js';

const logger = new Logger('MainApp');

export class SimulatorApplication {
  constructor() {
    this.repository = new SimulationRepository();
    this.simulation_service = null;
    this.wizard_controller = null;
    this.dashboard_controller = null;
  }

  /**
   * Arranca el ciclo de vida de la aplicación.
   */
  start() {
    logger.info('Iniciando TRUST Business Simulator V0.3...');

    // Verificar si existe una sesión previa guardada
    const saved_config = this.repository.get_config();
    const saved_history = this.repository.get_history();

    if (saved_config) {
      try {
        this.simulation_service = new SimulationService(saved_config);
        if (saved_history && saved_history.length > 0) {
          this.simulation_service.restore_history(saved_history);
        }
        this._boot_dashboard();
        UiFeedbackView.info(`Simulación restaurada: "${saved_config.name}"`);
        return;
      } catch (err) {
        logger.warn('No se pudo restaurar la simulación previa, iniciando configurador.', err);
        this.repository.clear_simulation();
      }
    }

    this._boot_setup_wizard();
  }

  _boot_setup_wizard() {
    document.getElementById('setupView').classList.add('active');
    document.getElementById('simView').classList.remove('active');

    const badge = document.getElementById('currentUserBadge');
    if (badge) badge.textContent = '👨‍🏫 Configuración Docente';
    const switch_btn = document.getElementById('btnOpenLoginModal');
    if (switch_btn) switch_btn.style.display = 'none';

    this.wizard_controller = new SetupWizardController({
      on_simulation_start: (config) => {
        this._start_new_simulation(config);
      }
    });

    this.wizard_controller.init();
  }

  _start_new_simulation(config) {
    try {
      this.simulation_service = new SimulationService(config);
      this.repository.save_config(config);
      this.repository.save_history([]);

      this._boot_dashboard();
      UiFeedbackView.success('¡Mercado y simulación creados exitosamente!');
    } catch (err) {
      logger.error('Error al iniciar la simulación', err);
      UiFeedbackView.error(err.message);
    }
  }

  _boot_dashboard() {
    const switch_btn = document.getElementById('btnOpenLoginModal');
    if (switch_btn) switch_btn.style.display = 'inline-block';

    this.dashboard_controller = new SimulationDashboardController({
      simulation_service: this.simulation_service,
      repository: this.repository,
      on_reset_request: () => {
        this.reset();
      }
    });

    this.dashboard_controller.init();
  }

  reset() {
    this.repository.clear_simulation();
    window.location.reload();
  }
}

// Iniciar aplicación si estamos en navegador
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    const app = new SimulatorApplication();
    app.start();
    window.__TRUST_SIM_APP__ = app;
  });
}
