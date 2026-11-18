/**
 * TRUST Business Simulator - Pruebas Unitarias: Capa de Dominio y Validadores
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  Team,
  TeamDecision,
  MacroParameters,
  EvaluationWeights,
  SimulationConfig
} from '../../src/domain/models.js';

import {
  validate_evaluation_weights,
  validate_simulation_config,
  validate_team_decision,
  DomainValidationError
} from '../../src/domain/validators.js';

describe('Capa de Dominio: Modelos y Entidades', () => {
  it('Debe instanciar Team correctamente y serializar a JSON', () => {
    const team = new Team('team_1', 'Empresa Alfa', 'EQ-01');
    assert.equal(team.id, 'team_1');
    assert.equal(team.name, 'Empresa Alfa');
    assert.equal(team.code, 'EQ-01');

    const json = team.toJSON();
    assert.deepEqual(json, { id: 'team_1', name: 'Empresa Alfa', code: 'EQ-01' });

    const restored = Team.fromJSON(json);
    assert.equal(restored.name, 'Empresa Alfa');
  });

  it('Debe instanciar TeamDecision con valores por defecto válidos', () => {
    const decision = new TeamDecision({
      team_id: 'team_1',
      price: 85.5,
      marketing: 10000,
      quality: 70,
      service: 60,
      capacity: 35000
    });

    assert.equal(decision.price, 85.5);
    assert.equal(decision.marketing, 10000);
    assert.equal(decision.people, 50); // Default
    assert.equal(decision.innovation, 50); // Default
    assert.equal(decision.reason, '');
  });

  it('Debe validar que las ponderaciones de evaluación sumen 100%', () => {
    const valid_weights = new EvaluationWeights({
      finance: 30,
      marketing: 20,
      operations: 20,
      people: 15,
      strategy: 15
    });

    assert.equal(valid_weights.total, 100);
    assert.equal(valid_weights.isValid(), true);

    const validation = validate_evaluation_weights(valid_weights);
    assert.equal(validation.valid, true);

    const invalid_weights = new EvaluationWeights({
      finance: 20,
      marketing: 20,
      operations: 20,
      people: 20,
      strategy: 10 // Suma 90%
    });

    assert.equal(invalid_weights.isValid(), false);
    const invalid_validation = validate_evaluation_weights(invalid_weights);
    assert.equal(invalid_validation.valid, false);
    assert.match(invalid_validation.message, /suman 90%/);
  });
});

describe('Capa de Dominio: Validadores de Reglas de Negocio', () => {
  it('Debe lanzar error si la configuración de simulación tiene menos de 2 equipos', () => {
    const config = new SimulationConfig({
      name: 'Simulación Inválida',
      industry: 'textile',
      teams: [new Team('t1', 'Único Equipo', 'EQ-01')]
    });

    assert.throws(() => {
      validate_simulation_config(config);
    }, DomainValidationError);
  });

  it('Debe lanzar error si hay nombres de equipos duplicados', () => {
    const config = new SimulationConfig({
      name: 'Simulación Duplicados',
      industry: 'textile',
      teams: [
        new Team('t1', 'Empresa Alfa', 'EQ-01'),
        new Team('t2', 'empresa alfa', 'EQ-02') // Duplicado case-insensitive
      ]
    });

    assert.throws(() => {
      validate_simulation_config(config);
    }, /Nombre de equipo duplicado/);
  });

  it('Debe validar decisiones operativas válidas e invalidar precios negativos', () => {
    const valid_decision = new TeamDecision({
      team_id: 't1',
      price: 50,
      marketing: 5000,
      quality: 80,
      service: 70,
      capacity: 25000
    });

    assert.equal(validate_team_decision(valid_decision), true);

    const invalid_price = new TeamDecision({
      team_id: 't1',
      price: -10,
      marketing: 5000,
      quality: 80,
      service: 70,
      capacity: 25000
    });

    assert.throws(() => {
      validate_team_decision(invalid_price);
    }, /El precio debe ser un número positivo/);

    const invalid_quality = new TeamDecision({
      team_id: 't1',
      price: 50,
      marketing: 5000,
      quality: 150, // Fuera de rango 0-100
      service: 70,
      capacity: 25000
    });

    assert.throws(() => {
      validate_team_decision(invalid_quality);
    }, /La calidad debe estar en una escala de 0 a 100/);
  });
});
