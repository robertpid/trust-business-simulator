/**
 * TRUST Business Simulator - Pruebas de Usuario: Simulación de Ronda y Benchmarking
 * 
 * Simula el momento en que el docente o los participantes ejecutan la ronda
 * y analizan los resultados de benchmarking, ranking y la retroalimentación del coach pedagógico.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { SimulationService } from '../../src/business/simulation_service.js';
import { SimulationConfig, Team, TeamDecision, MacroParameters, EvaluationWeights } from '../../src/domain/models.js';

describe('Pruebas de Usuario (User Journey): Simulación de Ronda y Benchmarking', () => {
  it('Usuario: Al simular la ronda, debe obtener KPIs consolidados, ranking justo y diagnóstico pedagógico', () => {
    // 1. Configuración de mercado
    const config = new SimulationConfig({
      name: 'Seminario de Competitividad 2026',
      industry: 'food',
      country: 'CO',
      currency: 'COP — Peso colombiano ($)',
      currency_symbol: '$',
      size: 'Mediana',
      complexity: 2,
      total_rounds: 3,
      macro: new MacroParameters({ inflation: 3.5, demand_growth: 4.0 }),
      weights: new EvaluationWeights({ finance: 35, marketing: 25, operations: 15, people: 10, strategy: 15 }),
      teams: [
        new Team('team_1', 'NutriFood S.A.', 'EQ-01'),
        new Team('team_2', 'Alimentos Premium', 'EQ-02'),
        new Team('team_3', 'Equilibrada Corp', 'EQ-03'),
        new Team('team_4', 'Mala Estrategia', 'EQ-04')
      ]
    });

    const service = new SimulationService(config);

    // 2. Decisiones de los 4 equipos
    const decisions = [
      new TeamDecision({
        team_id: 'team_1',
        price: 13.0,
        marketing: 18000,
        quality: 75,
        service: 70,
        capacity: 45000
      }),
      new TeamDecision({
        team_id: 'team_2',
        price: 15.0,
        marketing: 22000,
        quality: 90,
        service: 85,
        capacity: 40000
      }),
      new TeamDecision({
        team_id: 'team_3',
        price: 13.5,
        marketing: 15000,
        quality: 75,
        service: 70,
        capacity: 40000
      }),
      new TeamDecision({
        team_id: 'team_4',
        price: 5.0, // Vender bajo costo variable con gasto excesivo
        marketing: 35000,
        quality: 20,
        service: 20,
        capacity: 50000
      })
    ];

    // 3. Ejecución de la ronda
    const summary = service.execute_round(decisions);

    // Verificaciones de usuario:
    // a) KPIs de industria presentes
    assert.ok(summary.total_market_demand > 100000, 'La demanda total debe ser superior a 100k');
    assert.ok(summary.total_market_sales > 0);
    assert.ok(summary.total_market_revenue > 0);

    // b) Tabla de ranking completa y ordenada
    assert.equal(summary.results.length, 4);
    assert.equal(summary.results[0].rank, 1);
    assert.equal(summary.results[3].rank, 4);
    assert.ok(summary.results[0].score >= summary.results[1].score);
    assert.ok(summary.results[1].score >= summary.results[2].score);
    assert.ok(summary.results[2].score >= summary.results[3].score);

    // c) El equipo con peor estrategia ('Mala Estrategia') debe quedar último
    const worst_team = summary.results[3];
    assert.equal(worst_team.team_id, 'team_4');

    // d) El coach pedagógico debe emitir retroalimentación que mencione al líder y al colero
    assert.ok(summary.coach_feedback.includes(summary.results[0].team_name), 'El coach debe destacar al líder');
    assert.ok(summary.coach_feedback.includes(worst_team.team_name), 'El coach debe analizar al colero');
    assert.ok(summary.coach_feedback.includes('Lectura para discusión'));
  });
});
