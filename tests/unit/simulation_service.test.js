/**
 * TRUST Business Simulator - Pruebas Unitarias: Orquestador de Simulación
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { SimulationService } from '../../src/business/simulation_service.js';
import { SimulationConfig, Team, TeamDecision } from '../../src/domain/models.js';

describe('Capa de Negocio: SimulationService', () => {
  function create_test_config() {
    return new SimulationConfig({
      name: 'Simulación de Prueba',
      industry: 'textile',
      teams: [
        new Team('t1', 'Empresa 1', 'EQ-01'),
        new Team('t2', 'Empresa 2', 'EQ-02'),
        new Team('t3', 'Empresa 3', 'EQ-03')
      ],
      total_rounds: 3
    });
  }

  it('Debe inicializar la simulación en la ronda 1 y generar decisiones por defecto', () => {
    const config = create_test_config();
    const service = new SimulationService(config);

    assert.equal(service.current_round, 1);
    assert.equal(service.history.length, 0);

    const default_dec = service.generate_default_decision(0);
    assert.ok(default_dec.price > 0);
    assert.ok(default_dec.capacity > 0);
  });

  it('Debe ejecutar una ronda completa, generar resultados clasificados y avanzar el contador de ronda', () => {
    const config = create_test_config();
    const service = new SimulationService(config);

    const decisions = [
      new TeamDecision({ team_id: 't1', price: 80, marketing: 15000, quality: 75, service: 70, capacity: 45000 }),
      new TeamDecision({ team_id: 't2', price: 90, marketing: 10000, quality: 65, service: 65, capacity: 40000 }),
      new TeamDecision({ team_id: 't3', price: 85, marketing: 12000, quality: 70, service: 65, capacity: 42000 })
    ];

    const summary = service.execute_round(decisions);

    assert.equal(summary.round_number, 1);
    assert.equal(summary.results.length, 3);
    assert.ok(summary.total_market_demand > 0);
    assert.ok(summary.total_market_sales > 0);
    assert.ok(summary.total_market_revenue > 0);
    assert.ok(summary.coach_feedback.length > 50);

    // Debe haber avanzado a ronda 2
    assert.equal(service.current_round, 2);
    assert.equal(service.history.length, 1);
  });

  it('Debe bloquear la ejecución si se excede el total de rondas programadas', () => {
    const config = create_test_config();
    config.total_rounds = 1;
    const service = new SimulationService(config);

    const decisions = [
      new TeamDecision({ team_id: 't1', price: 85, marketing: 10000, quality: 70, service: 70, capacity: 40000 }),
      new TeamDecision({ team_id: 't2', price: 85, marketing: 10000, quality: 70, service: 70, capacity: 40000 }),
      new TeamDecision({ team_id: 't3', price: 85, marketing: 10000, quality: 70, service: 70, capacity: 40000 })
    ];

    // Ronda 1: OK
    service.execute_round(decisions);

    // Intento Ronda 2 cuando total_rounds = 1: Error
    assert.throws(() => {
      service.execute_round(decisions);
    }, /completado las 1 rondas/);
  });
});
