/**
 * TRUST Business Simulator - Capa de Negocio: Motor de Inventarios y Bodegaje (Etapa 3)
 * 
 * Implementa la dinámica operativa estilo TOPSIM / Cesim:
 * - Acumulación de stock entre rondas (Inventario Inicial + Producción - Ventas = Inventario Final)
 * - Costo de almacenamiento/bodegaje por unidades no vendidas
 * - Detección y cuantificación de quiebre de stock (Demanda insatisfecha por falta de unidades)
 */

export class InventoryEngine {
  /**
   * Tasa estándar de costo de almacenamiento por ronda sobre el costo variable unitario (12%).
   */
  static DEFAULT_HOLDING_RATE = 0.12;

  /**
   * Calcula el balance físico de unidades, costos de bodegaje y quiebres de stock.
   * 
   * @param {Object} params
   * @param {number} [params.initial_inventory=0] - Unidades en almacén al inicio de la ronda
   * @param {number} params.production_capacity - Unidades producidas/habilitadas en la ronda
   * @param {number} params.potential_demand - Demanda de clientes conquistada en la ronda
   * @param {number} params.unit_variable_cost - Costo unitario de producción/insumos
   * @param {number} [params.holding_cost_rate=0.12] - Porcentaje de costo de bodegaje por unidad sobrante
   * @returns {Object} Estado físico y valorizado del inventario
   */
  static compute_inventory_flow({
    initial_inventory = 0,
    production_capacity,
    potential_demand,
    unit_variable_cost,
    holding_cost_rate = InventoryEngine.DEFAULT_HOLDING_RATE
  }) {
    const safe_initial = Math.max(0, Math.round(initial_inventory));
    const safe_capacity = Math.max(0, Number(production_capacity) || 0);
    const available_units = safe_initial + safe_capacity;

    // Las ventas reales están limitadas por el total de unidades disponibles (Stock inicial + Capacidad)
    const sales_units = Math.min(potential_demand, available_units);

    // Unidades que no se lograron vender quedan en almacén para la siguiente ronda
    const ending_inventory = Math.max(0, Math.round(available_units - sales_units));

    // Unidades que el mercado quería comprar pero la empresa no pudo abastecer (Quiebre de Stock)
    const stockout_units = Math.max(0, Math.round(potential_demand - available_units));

    // Costo de bodegaje y capital inmovilizado por mantener stock sin vender
    const holding_cost = Math.round(ending_inventory * unit_variable_cost * holding_cost_rate);

    // Valor contable del inventario final para el Activo Corriente del Balance General
    const inventory_value = Math.round(ending_inventory * unit_variable_cost);

    return {
      initial_inventory: safe_initial,
      available_units,
      sales_units,
      ending_inventory,
      stockout_units,
      holding_cost,
      inventory_value
    };
  }
}
