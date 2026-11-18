/**
 * TRUST Business Simulator - Capa de Persistencia: Repositorio de Simulación
 * 
 * Gestiona el ciclo de vida de almacenamiento de la configuración y resultados históricos.
 */

import { LocalStorageAdapter } from './storage_adapter.js';
import { SimulationConfig } from '../domain/models.js';
import { Logger } from '../utils/logger.js';

const logger = new Logger('SimulationRepository');

export class SimulationRepository {
  /**
   * @param {import('./storage_adapter.js').IStorageAdapter} [storage_adapter]
   */
  constructor(storage_adapter = null) {
    this.storage = storage_adapter || new LocalStorageAdapter();
    this.STORAGE_KEY_CONFIG = 'trust_sim_config_v1';
    this.STORAGE_KEY_HISTORY = 'trust_sim_history_v1';
  }

  /**
   * Guarda la configuración de la simulación activa.
   * @param {SimulationConfig|Object} config
   */
  save_config(config) {
    try {
      const serialized = JSON.stringify(config);
      this.storage.setItem(this.STORAGE_KEY_CONFIG, serialized);
      logger.info('Configuración de simulación guardada correctamente.');
    } catch (err) {
      logger.error('Error al guardar configuración de simulación', err);
      throw err;
    }
  }

  /**
   * Recupera la configuración guardada, o null si no existe.
   * @returns {SimulationConfig|null}
   */
  get_config() {
    try {
      const raw = this.storage.getItem(this.STORAGE_KEY_CONFIG);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return SimulationConfig.fromJSON(parsed);
    } catch (err) {
      logger.error('Error al recuperar configuración guardada', err);
      return null;
    }
  }

  /**
   * Guarda el historial acumulado de rondas.
   * @param {Array<Object>} history
   */
  save_history(history) {
    try {
      const serialized = JSON.stringify(history);
      this.storage.setItem(this.STORAGE_KEY_HISTORY, serialized);
    } catch (err) {
      logger.error('Error al guardar historial de rondas', err);
      throw err;
    }
  }

  /**
   * Recupera el historial guardado.
   * @returns {Array<Object>}
   */
  get_history() {
    try {
      const raw = this.storage.getItem(this.STORAGE_KEY_HISTORY);
      return raw ? JSON.parse(raw) : [];
    } catch (err) {
      logger.error('Error al recuperar historial', err);
      return [];
    }
  }

  /**
   * Limpia toda la información de simulación guardada.
   */
  clear_simulation() {
    this.storage.removeItem(this.STORAGE_KEY_CONFIG);
    this.storage.removeItem(this.STORAGE_KEY_HISTORY);
    logger.info('Datos de simulación eliminados del almacenamiento.');
  }
}
