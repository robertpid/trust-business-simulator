/**
 * TRUST Business Simulator - Capa de Dominio: Barril de Modelos
 * 
 * Re-exporta las entidades y modelos de simulación cumpliendo SRP (< 300 líneas).
 */

export { Team, TeamDecision, MacroParameters, EvaluationWeights } from './entities.js';
export { SimulationConfig, TeamRoundResult, RoundSummary } from './simulation_models.js';
