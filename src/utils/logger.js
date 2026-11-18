/**
 * TRUST Business Simulator - Utilidad de Logging
 * 
 * Proporciona trazabilidad modular con niveles de severidad
 * (DEBUG, INFO, WARN, ERROR) para auditoría del sistema de simulación.
 */

export const LogLevel = Object.freeze({
  DEBUG: 10,
  INFO: 20,
  WARN: 30,
  ERROR: 40
});

export class Logger {
  /**
   * @param {string} context - Nombre del módulo o capa origen del log.
   * @param {number} min_level - Nivel mínimo de severidad para registrar.
   */
  constructor(context = 'App', min_level = LogLevel.INFO) {
    this.context = context;
    this.min_level = min_level;
  }

  /**
   * Formatea el mensaje con timestamp ISO y contexto.
   * @private
   * @param {string} level_name
   * @param {string} message
   * @param {any} [extra]
   * @returns {string}
   */
  _format(level_name, message, extra = null) {
    const timestamp = new Date().toISOString();
    const extra_str = extra ? ` | Details: ${JSON.stringify(extra)}` : '';
    return `[${timestamp}] [${level_name.padEnd(5)}] [${this.context}]: ${message}${extra_str}`;
  }

  debug(message, extra = null) {
    if (this.min_level <= LogLevel.DEBUG) {
      console.debug(this._format('DEBUG', message, extra));
    }
  }

  info(message, extra = null) {
    if (this.min_level <= LogLevel.INFO) {
      console.info(this._format('INFO', message, extra));
    }
  }

  warn(message, extra = null) {
    if (this.min_level <= LogLevel.WARN) {
      console.warn(this._format('WARN', message, extra));
    }
  }

  error(message, error = null) {
    if (this.min_level <= LogLevel.ERROR) {
      const details = error instanceof Error ? { message: error.message, stack: error.stack } : error;
      console.error(this._format('ERROR', message, details));
    }
  }
}

export const default_logger = new Logger('SimulatorRoot', LogLevel.INFO);
