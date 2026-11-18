/**
 * TRUST Business Simulator - Capa de Dominio: Validadores de Reglas de Negocio
 * 
 * Asegura la integridad del dominio antes de iniciar la simulación o calcular rondas.
 */

import { INDUSTRIES } from './constants.js';

export class DomainValidationError extends Error {
  constructor(message, field = null) {
    super(message);
    this.name = 'DomainValidationError';
    this.field = field;
  }
}

/**
 * Valida que las ponderaciones de evaluación sumen exactamente 100%.
 * @param {import('./models.js').EvaluationWeights|Object} weights
 * @returns {{ valid: boolean, sum: number, message: string }}
 */
export function validate_evaluation_weights(weights) {
  const sum = Number(weights.finance || 0) +
              Number(weights.marketing || 0) +
              Number(weights.operations || 0) +
              Number(weights.people || 0) +
              Number(weights.strategy || 0);

  const is_valid = Math.abs(sum - 100) < 0.001;
  return {
    valid: is_valid,
    sum,
    message: is_valid
      ? 'Ponderaciones correctas: 100%.'
      : `Las ponderaciones suman ${sum}%. Deben sumar exactamente 100%.`
  };
}

/**
 * Valida la configuración global de una simulación.
 * @param {import('./models.js').SimulationConfig} config
 * @throws {DomainValidationError}
 */
export function validate_simulation_config(config) {
  if (!config) {
    throw new DomainValidationError('La configuración de la simulación no puede ser nula.');
  }

  if (!config.name || config.name.trim().length < 3) {
    throw new DomainValidationError('El nombre de la simulación debe tener al menos 3 caracteres.', 'name');
  }

  if (!INDUSTRIES[config.industry]) {
    throw new DomainValidationError(`La industria seleccionada "${config.industry}" no es válida.`, 'industry');
  }

  if (!Array.isArray(config.teams) || config.teams.length < 2 || config.teams.length > 12) {
    throw new DomainValidationError('Debe haber entre 2 y 12 equipos competidores.', 'teams');
  }

  // Validar nombres y códigos no duplicados
  const names = new Set();
  const codes = new Set();
  for (const team of config.teams) {
    if (!team.name || team.name.trim().length === 0) {
      throw new DomainValidationError(`El equipo ${team.id} tiene un nombre vacío.`, 'teams');
    }
    if (names.has(team.name.toLowerCase())) {
      throw new DomainValidationError(`Nombre de equipo duplicado: "${team.name}".`, 'teams');
    }
    names.add(team.name.toLowerCase());

    if (team.code) {
      if (codes.has(team.code.toUpperCase())) {
        throw new DomainValidationError(`Código de equipo duplicado: "${team.code}".`, 'teams');
      }
      codes.add(team.code.toUpperCase());
    }
  }

  // Validar ponderaciones
  const weights_validation = validate_evaluation_weights(config.weights);
  if (!weights_validation.valid) {
    throw new DomainValidationError(weights_validation.message, 'weights');
  }

  if (config.total_rounds < 1 || config.total_rounds > 24) {
    throw new DomainValidationError('El total de rondas debe estar entre 1 y 24.', 'total_rounds');
  }

  return true;
}

/**
 * Valida la decisión operativa de un equipo para una ronda dada.
 * @param {import('./models.js').TeamDecision} decision
 * @throws {DomainValidationError}
 */
export function validate_team_decision(decision) {
  if (!decision) {
    throw new DomainValidationError('La decisión del equipo no puede ser nula.');
  }

  if (typeof decision.price !== 'number' || isNaN(decision.price) || decision.price <= 0) {
    throw new DomainValidationError(`El precio debe ser un número positivo mayor que 0. Valor: ${decision.price}`, 'price');
  }

  if (typeof decision.marketing !== 'number' || isNaN(decision.marketing) || decision.marketing < 0) {
    throw new DomainValidationError('El presupuesto de marketing no puede ser negativo.', 'marketing');
  }

  if (typeof decision.quality !== 'number' || decision.quality < 0 || decision.quality > 100) {
    throw new DomainValidationError('La calidad debe estar en una escala de 0 a 100.', 'quality');
  }

  if (typeof decision.service !== 'number' || decision.service < 0 || decision.service > 100) {
    throw new DomainValidationError('El servicio debe estar en una escala de 0 a 100.', 'service');
  }

  if (typeof decision.capacity !== 'number' || isNaN(decision.capacity) || decision.capacity <= 0) {
    throw new DomainValidationError('La capacidad operativa debe ser mayor que 0.', 'capacity');
  }

  if (typeof decision.people !== 'number' || decision.people < 0 || decision.people > 100) {
    throw new DomainValidationError('El índice de personas debe estar entre 0 y 100.', 'people');
  }

  if (typeof decision.innovation !== 'number' || decision.innovation < 0 || decision.innovation > 100) {
    throw new DomainValidationError('El índice de innovación debe estar entre 0 y 100.', 'innovation');
  }

  return true;
}
