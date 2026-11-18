/**
 * TRUST Business Simulator - Pruebas de Usuario: Ciclo de Vida Completo y Persistencia
 * 
 * Simula el ciclo de vida continuo de un curso académico:
 * 1. Inicio de la simulación
 * 2. Ejecución consecutiva de múltiples rondas (R1 -> R2 -> R3)
 * 3. Adaptación ante eventos de incertidumbre de mercado
 * 4. Persistencia del estado y recuperación ante recarga
 * 5. Visualización del histórico de evolución de los equipos
 * 6. Reinicio seguro de la simulación
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { SimulationService } from '../../src/business/simulation_service.js';
import { SimulationRepository } from '../../src/persistence/simulation_repository.js';
import { InMemoryStorageAdapter } from '../../src/persistence/storage_adapter.js';
import { SimulationConfig, Team, TeamDecision } from '../../src/domain/models.js';

describe('Pruebas de Usuario (User Journey): Ciclo de Vida Completo y Persistencia', () => {
  it('Ciclo Completo: Ejecución de 3 rondas consecutivas, persistencia y recuperación', () => {
    const memory_storage = new InMemoryStorageAdapter();
    const repository = new SimulationRepository(memory_storage);

    // 1. Configuración de la simulación
    const config = new SimulationConfig({
      id: 'sim_course_full',
      name: 'MBA Dirección Estratégica 2026',
      industry: 'textile',
      country: 'PE',
      currency: 'PEN — Sol peruano (S/)',
      currency_symbol: 'S/',
      size: 'Grande',
      complexity: 3,
      total_rounds: 3,
      teams: [
        new Team('t1', 'Textil Andina', 'MBA-01'),
        new Team('t2', 'Moda Global', 'MBA-02'),
        new Team('t3', 'Confecciones del Sur', 'MBA-03')
      ]
    });

    const service = new SimulationService(config);
    repository.save_config(config);

    // 2. Ronda 1
    const r1_decisions = [
      new TeamDecision({ team_id: 't1', price: 82, marketing: 16000, quality: 75, service: 70, capacity: 48000, innovation: 60 }),
      new TeamDecision({ team_id: 't2', price: 88, marketing: 14000, quality: 70, service: 65, capacity: 45000, innovation: 55 }),
      new TeamDecision({ team_id: 't3', price: 85, marketing: 12000, quality: 65, service: 60, capacity: 42000, innovation: 50 })
    ];

    const r1_summary = service.execute_round(r1_decisions);
    assert.equal(r1_summary.round_number, 1);
    assert.equal(service.current_round, 2);
    repository.save_history(service.history);

    // 3. Ronda 2 (Equipos ajustan precios e innovación)
    const r2_decisions = [
      new TeamDecision({ team_id: 't1', price: 84, marketing: 18000, quality: 80, service: 75, capacity: 50000, innovation: 70 }),
      new TeamDecision({ team_id: 't2', price: 86, marketing: 16000, quality: 75, service: 70, capacity: 46000, innovation: 65 }),
      new TeamDecision({ team_id: 't3', price: 80, marketing: 15000, quality: 68, service: 65, capacity: 45000, innovation: 55 })
    ];

    const r2_summary = service.execute_round(r2_decisions);
    assert.equal(r2_summary.round_number, 2);
    assert.equal(service.current_round, 3);
    repository.save_history(service.history);

    // 4. Ronda 3 (Ronda final)
    const r3_decisions = [
      new TeamDecision({ team_id: 't1', price: 85, marketing: 20000, quality: 85, service: 80, capacity: 52000, innovation: 80 }),
      new TeamDecision({ team_id: 't2', price: 85, marketing: 18000, quality: 78, service: 75, capacity: 48000, innovation: 70 }),
      new TeamDecision({ team_id: 't3', price: 78, marketing: 18000, quality: 70, service: 68, capacity: 48000, innovation: 60 })
    ];

    const r3_summary = service.execute_round(r3_decisions);
    assert.equal(r3_summary.round_number, 3);
    assert.equal(service.history.length, 3);
    repository.save_history(service.history);

    // 5. Verificar Recuperación y Persistencia (Simulando recarga de página)
    const restored_config = repository.get_config();
    const restored_history = repository.get_history();

    assert.equal(restored_config.name, 'MBA Dirección Estratégica 2026');
    assert.equal(restored_history.length, 3);
    assert.equal(restored_history[0].round_number, 1);
    assert.equal(restored_history[2].round_number, 3);

    // 6. Reinicio de la simulación
    repository.clear_simulation();
    assert.equal(repository.get_config(), null);
    assert.deepEqual(repository.get_history(), []);
  });
});
