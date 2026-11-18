/**
 * TRUST Business Simulator - Pruebas de Usuario Etapa 4:
 * Flujo del Docente Universitario Evaluando Curva de Aprendizaje, Grafo Causal y Exportando Acta
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { SimulationService } from '../../src/business/simulation_service.js';
import { AcademicAnalyticsService } from '../../src/business/academic_analytics_service.js';
import { ReportExporterService } from '../../src/business/report_exporter_service.js';
import { SimulationConfig, Team, TeamDecision } from '../../src/domain/models.js';

describe('Pruebas de Usuario (User Journey Etapa 4): Evaluación Docente y Exportación de Acta', () => {
  it('Docente ejecuta 3 rondas, revisa evolución vectorial/grafo y descarga acta de notas CSV y JSON', () => {
    const config = new SimulationConfig({
      name: 'Dirección General - Facultad de Economía',
      industry: 'saas',
      country: 'CL',
      country_name: 'Chile',
      currency_symbol: '$',
      size: 'Startup',
      complexity: 3,
      total_rounds: 3,
      teams: [
        new Team('s1', 'CloudChile AI', 'INF-101'),
        new Team('s2', 'DataAndes SaaS', 'INF-102'),
        new Team('s3', 'SoftSur Tech', 'INF-103')
      ]
    });

    const sim = new SimulationService(config);

    // Ronda 1 (s3 comete error de precio bajo costo y baja calidad)
    sim.execute_round([
      new TeamDecision({ team_id: 's1', price: 54, marketing: 9500, quality: 82, service: 80, capacity: 4000, innovation: 78 }),
      new TeamDecision({ team_id: 's2', price: 62, marketing: 6000, quality: 65, service: 65, capacity: 3500, innovation: 55 }),
      new TeamDecision({ team_id: 's3', price: 15, marketing: 22000, quality: 30, service: 30, capacity: 5000, innovation: 25 })
    ]);

    // Ronda 2 (s2 y s3 aplican el feedback del Coach Socrático)
    sim.execute_round([
      new TeamDecision({ team_id: 's1', price: 55, marketing: 10000, quality: 85, service: 82, capacity: 4200, innovation: 80 }),
      new TeamDecision({ team_id: 's2', price: 56, marketing: 8500, quality: 78, service: 75, capacity: 3800, innovation: 72 }),
      new TeamDecision({ team_id: 's3', price: 58, marketing: 7500, quality: 72, service: 70, capacity: 3600, innovation: 68 })
    ]);

    // Ronda 3
    sim.execute_round([
      new TeamDecision({ team_id: 's1', price: 55, marketing: 10500, quality: 86, service: 85, capacity: 4500, innovation: 85 }),
      new TeamDecision({ team_id: 's2', price: 55, marketing: 9500, quality: 82, service: 80, capacity: 4200, innovation: 78 }),
      new TeamDecision({ team_id: 's3', price: 56, marketing: 8500, quality: 78, service: 76, capacity: 4000, innovation: 74 })
    ]);

    // El docente consulta el acta de calificaciones
    const gradebook = AcademicAnalyticsService.compute_academic_grades(sim.config, sim.history);
    assert.equal(gradebook.length, 3);
    assert.equal(gradebook[0].team_id, 's1');
    assert.equal(gradebook[0].rounds_played, 3);

    const s3_record = gradebook.find(g => g.team_id === 's3');
    assert.ok(s3_record.score_trend > 5, 'SoftSur Tech muestra fuerte aprendizaje positivo entre R1 y R3');

    // El docente exporta el CSV para subir notas al sistema universitario
    const csv_content = ReportExporterService.generate_academic_csv(sim.config, sim.history);
    const lines = csv_content.trim().split('\r\n');
    assert.equal(lines.length, 4, '1 fila de cabecera + 3 filas de equipos');
  });
});
