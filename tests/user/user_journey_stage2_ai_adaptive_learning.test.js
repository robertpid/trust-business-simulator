/**
 * TRUST Business Simulator - Pruebas de Usuario Etapa 2:
 * Ambiente de Aprendizaje Adaptativo con los 3 Cerebros de IA Intercomunicados
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { SimulationService } from '../../src/business/simulation_service.js';
import { SimulationConfig, Team, TeamDecision } from '../../src/domain/models.js';

describe('Pruebas de Usuario (User Journey Etapa 2): Aprendizaje Adaptativo Multi-Cerebro IA', () => {
  it('Los 3 Cerebros se comunican entre Ronda 1 y Ronda 2 para diagnosticar, guiar y adaptar el mercado', () => {
    const config = new SimulationConfig({
      name: 'Curso Estrategia con IA Adaptativa',
      industry: 'textile',
      country: 'CO',
      country_name: 'Colombia',
      currency_symbol: '$',
      size: 'Mediana',
      complexity: 2,
      total_rounds: 3,
      events_enabled: true,
      teams: [
        new Team('t_lider', 'Textiles Inteligentes', 'IA-01'),
        new Team('t_aprendiz', 'Confecciones en Aprendizaje', 'IA-02')
      ]
    });

    const sim = new SimulationService(config);

    // RONDA 1: El equipo aprendiz sobreproduce (90,000 uds) con precio elevado (115),
    // quedando con fuerte stock inmovilizado y activando rescate bancario.
    const r1 = sim.execute_round([
      new TeamDecision({ team_id: 't_lider', price: 83, marketing: 14000, quality: 75, service: 70, capacity: 60000 }),
      new TeamDecision({ team_id: 't_aprendiz', price: 115, marketing: 30000, quality: 55, service: 50, capacity: 90000 })
    ]);

    // 1. Verificar que el paquete de intercomunicación de los 3 Cerebros (ai_mesh) está presente
    assert.ok(r1.ai_mesh, 'El resumen de ronda debe incluir la telemetría de la red de 3 cerebros');
    assert.ok(r1.ai_mesh.strategist_benchmark.optimal_price > 0, 'Cerebro 2 calculó el precio óptimo');
    assert.equal(r1.ai_mesh.evaluator_diagnostics.length, 2, 'Cerebro 3 diagnosticó a ambos equipos');

    // 2. El Cerebro 3 detectó la sobreproducción y envió la señal al Cerebro 1 para la Ronda 2
    const signal_after_r1 = r1.ai_mesh.next_world_signal;
    assert.equal(signal_after_r1, 'test_inventory_discipline');
    assert.equal(sim.active_event.triggered_by_signal, 'test_inventory_discipline');
    assert.equal(sim.active_event.id, 'ai_event_demand_contraction');

    // RONDA 2: El equipo aprendiz sigue la guía socrática del Cerebro 3 y el benchmark del Cerebro 2
    const opt = r1.ai_mesh.strategist_benchmark;
    const r2 = sim.execute_round([
      new TeamDecision({ team_id: 't_lider', price: 84, marketing: 14000, quality: 75, service: 70, capacity: 62000 }),
      new TeamDecision({
        team_id: 't_aprendiz',
        price: opt.optimal_price,
        marketing: opt.optimal_marketing,
        quality: opt.optimal_quality,
        service: opt.optimal_service,
        capacity: 30000
      })
    ]);

    const aprendiz_r2 = r2.results.find(r => r.team_id === 't_aprendiz');
    const aprendiz_r1 = r1.results.find(r => r.team_id === 't_aprendiz');

    assert.ok(
      aprendiz_r2.score > aprendiz_r1.score,
      'Al aplicar la guía del Cerebro Estratega y el Coach Socrático, el equipo mejora su score'
    );
  });
});
