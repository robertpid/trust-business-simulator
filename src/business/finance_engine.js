/**
 * TRUST Business Simulator - Capa de Negocio: Motor Financiero, Flujo de Caja y Balance (Etapa 3)
 * 
 * Implementa las reglas financieras de nivel TOPSIM / Cesim:
 * - Estado de Flujo de Caja (impacto del capital de trabajo e inventarios en la liquidez)
 * - Balance General continuo (Efectivo, Inventario Valorizado, Activo Fijo, Deuda, Patrimonio)
 * - Crédito de Emergencia Bancario (Sobregiro automático con sobretasa punitiva ante iliquidez)
 */

import { get_scale_archetype } from '../domain/scale_archetypes.js';
import { AccountingEngine } from './accounting_engine.js';

export class FinanceEngine {
  /**
   * Sobretasa anual punitiva para créditos de emergencia por iliquidez (+12.0%).
   */
  static EMERGENCY_SPREAD_PENALTY = 12.0;

  /**
   * Crea el Balance General inicial para una empresa al comenzar la Ronda 1.
   * @param {string} [company_size='Mediana']
   * @returns {Object}
   */
  static create_initial_financial_state(company_size = 'Mediana') {
    const scale = get_scale_archetype(company_size).fixed_cost_multiplier;
    const cash = Math.round(120000 * scale);
    const fixed_assets = Math.round(350000 * scale);
    const bank_debt = Math.round(100000 * scale);
    const inventory_value = 0;
    const emergency_loan = 0;
    const equity = cash + fixed_assets - bank_debt;

    return {
      cash,
      inventory_value,
      fixed_assets,
      bank_debt,
      emergency_loan,
      equity
    };
  }

  /**
   * Calcula el cierre financiero de la ronda: Intereses, Impuestos, Flujo de Caja,
   * Rescate por Iliquidez (Crédito de Emergencia) y Balance General actualizado.
   * 
   * @param {Object} params
   * @param {Object} [params.previous_state] - Estado financiero al cierre de la ronda anterior
   * @param {number} params.operating_profit - Utilidad operativa (EBIT) antes de bodegaje e intereses
   * @param {number} [params.inventory_value=0] - Valor contable del inventario final
   * @param {number} [params.holding_cost=0] - Costo de almacenamiento/bodegaje de la ronda
   * @param {number} [params.base_interest_rate=8.5] - Tasa de referencia anual (%)
   * @param {string} [params.company_size='Mediana'] - Escala empresarial
   * @returns {Object}
   */
  static compute_financial_statement({
    previous_state = null,
    operating_profit,
    inventory_value = 0,
    holding_cost = 0,
    base_interest_rate = 8.5,
    company_size = 'Mediana'
  }) {
    const prev = previous_state || this.create_initial_financial_state(company_size);

    const annual_rate = AccountingEngine.get_effective_interest_rate(base_interest_rate, company_size);
    const quarterly_regular_rate = (annual_rate / 100) / 4;
    const quarterly_emergency_rate = ((annual_rate + FinanceEngine.EMERGENCY_SPREAD_PENALTY) / 100) / 4;

    // 1. Gastos financieros (deuda bancaria + interés punitivo de sobregiro anterior)
    const financial_interest = Math.round(
      prev.bank_debt * quarterly_regular_rate +
      prev.emergency_loan * quarterly_emergency_rate
    );

    // 2. Utilidad antes de impuestos (EBT), Impuesto a la Renta (25%) y Utilidad Neta
    const ebt = operating_profit - holding_cost - financial_interest;
    const income_tax = ebt > 0 ? Math.round(ebt * 0.25) : 0;
    const net_profit = Math.round(ebt - income_tax);

    // 3. Flujo de Caja Operativo (ajuste por variación de capital de trabajo en inventarios)
    const inventory_cash_delta = inventory_value - (prev.inventory_value || 0);
    const operating_cash_flow = Math.round(net_profit - inventory_cash_delta);

    // 4. Posición de liquidez y amortización o activación de Crédito de Emergencia
    let raw_cash = prev.cash + operating_cash_flow - prev.emergency_loan;
    let emergency_loan = 0;
    let final_cash = raw_cash;

    if (raw_cash < 0) {
      emergency_loan = Math.abs(Math.round(raw_cash));
      final_cash = 0;
    }

    const total_assets = final_cash + inventory_value + prev.fixed_assets;
    const total_debt = prev.bank_debt + emergency_loan;
    const equity = total_assets - total_debt;
    const solvency_ratio = total_assets > 0 ? Number((equity / total_assets).toFixed(2)) : 0;

    return {
      financial_interest,
      income_tax,
      net_profit,
      operating_cash_flow,
      cash: final_cash,
      inventory_value,
      fixed_assets: prev.fixed_assets,
      bank_debt: prev.bank_debt,
      emergency_loan,
      total_assets,
      total_debt,
      equity,
      solvency_ratio,
      triggered_emergency_loan: emergency_loan > 0
    };
  }
}
