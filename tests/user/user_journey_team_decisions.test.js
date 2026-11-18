/**
 * TRUST Business Simulator - Pruebas de Usuario: Toma de Decisiones Estratégicas
 * 
 * Simula a 4 equipos de estudiantes ingresando distintas hipótesis estratégicas:
 * - Equipo 1: Liderazgo en Costos (precio bajo, alta capacidad, marketing masivo)
 * - Equipo 2: Diferenciación Premium (precio alto, máxima calidad y servicio, marketing de marca)
 * - Equipo 3: Estrategia de Enfoque / Equilibrada (precios promedio, capacidad ajustada)
 * - Equipo 4: Error Estratégico (precio excesivo con calidad baja y sin marketing)
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { TeamDecision } from '../../src/domain/models.js';
import { validate_team_decision } from '../../src/domain/validators.js';

describe('Pruebas de Usuario (User Journey): Toma de Decisiones por Equipos', () => {
  it('Equipos de Estudiantes: Deben poder ingresar sus decisiones estratégicas y justificación', () => {
    // Equipo 1: Liderazgo en costos
    const decision_team_1 = new TeamDecision({
      team_id: 'team_1',
      price: 10.50,
      marketing: 20000,
      quality: 55,
      service: 50,
      capacity: 55000,
      people: 45,
      innovation: 40,
      reason: 'Estrategia de penetración de mercado con precios accesibles y producción a escala.'
    });

    // Equipo 2: Enfoque Premium
    const decision_team_2 = new TeamDecision({
      team_id: 'team_2',
      price: 16.00,
      marketing: 25000,
      quality: 92,
      service: 88,
      capacity: 35000,
      people: 75,
      innovation: 80,
      reason: 'Diferenciación de alto valor percibido, insumos orgánicos y servicio premium.'
    });

    // Equipo 3: Equilibrado
    const decision_team_3 = new TeamDecision({
      team_id: 'team_3',
      price: 12.00,
      marketing: 12000,
      quality: 70,
      service: 65,
      capacity: 40000,
      people: 55,
      innovation: 50,
      reason: 'Posicionamiento balanceado siguiendo los estándares medios de la industria.'
    });

    // Equipo 4: Error estratégico
    const decision_team_4 = new TeamDecision({
      team_id: 'team_4',
      price: 19.50,
      marketing: 1000,
      quality: 40,
      service: 35,
      capacity: 20000,
      people: 30,
      innovation: 30,
      reason: 'Maximizar margen unitario sin gastar en marketing ni insumos.'
    });

    // Validar todas las decisiones
    const decisions = [decision_team_1, decision_team_2, decision_team_3, decision_team_4];
    decisions.forEach(d => {
      assert.doesNotThrow(() => validate_team_decision(d));
      assert.ok(d.reason.length > 10, 'La justificación estratégica debe quedar registrada');
    });
  });
});
