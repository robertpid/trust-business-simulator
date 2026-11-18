/**
 * TRUST Business Simulator - Capa de Dominio: Entidades Base
 * 
 * Define las entidades fundamentales: Team, TeamDecision, MacroParameters y EvaluationWeights.
 */

export class Team {
  /**
   * @param {string} id - Identificador único de equipo (ej. 'team_1')
   * @param {string} name - Nombre descriptivo (ej. 'Empresa Alfa')
   * @param {string} code - Código académico/organizacional (ej. 'EQ-01')
   */
  constructor(id, name, code) {
    this.id = String(id);
    this.name = String(name || '').trim();
    this.code = String(code || '').trim();
  }

  toJSON() {
    return { id: this.id, name: this.name, code: this.code };
  }

  static fromJSON(data) {
    return new Team(data.id, data.name, data.code);
  }
}

export class TeamDecision {
  /**
   * @param {Object} params
   */
  constructor({
    team_id,
    price,
    marketing,
    quality,
    service,
    capacity,
    people = 50,
    innovation = 50,
    reason = ''
  }) {
    this.team_id = String(team_id);
    this.price = Number(price);
    this.marketing = Number(marketing);
    this.quality = Number(quality);
    this.service = Number(service);
    this.capacity = Number(capacity);
    this.people = Number(people);
    this.innovation = Number(innovation);
    this.reason = String(reason || '').trim();
  }

  toJSON() {
    return {
      team_id: this.team_id,
      price: this.price,
      marketing: this.marketing,
      quality: this.quality,
      service: this.service,
      capacity: this.capacity,
      people: this.people,
      innovation: this.innovation,
      reason: this.reason
    };
  }

  static fromJSON(data) {
    return new TeamDecision(data);
  }
}

export class MacroParameters {
  /**
   * @param {Object} params
   * @param {number} [params.inflation=3.0] - Tasa de inflación anual (%)
   * @param {number} [params.gdp=3.2] - Crecimiento económico anual PIB (%)
   * @param {number} [params.interest=8.5] - Tasa de interés anual (%)
   * @param {number} [params.demand_growth=5.0] - Crecimiento tendencial de demanda (%)
   * @param {string} [params.source='Preset'] - Fuente del dato macroeconómico
   * @param {string} [params.reference_year='2026'] - Año de referencia
   */
  constructor({
    inflation = 3.0,
    gdp = 3.2,
    interest = 8.5,
    demand_growth = 5.0,
    source = 'Preset',
    reference_year = '2026'
  } = {}) {
    this.inflation = Number(inflation);
    this.gdp = Number(gdp);
    this.interest = Number(interest);
    this.demand_growth = Number(demand_growth);
    this.source = String(source);
    this.reference_year = String(reference_year);
  }

  toJSON() {
    return {
      inflation: this.inflation,
      gdp: this.gdp,
      interest: this.interest,
      demand_growth: this.demand_growth,
      source: this.source,
      reference_year: this.reference_year
    };
  }

  static fromJSON(data = {}) {
    return new MacroParameters(data);
  }
}

export class EvaluationWeights {
  constructor({ finance = 20, marketing = 20, operations = 20, people = 20, strategy = 20 } = {}) {
    this.finance = Number(finance);
    this.marketing = Number(marketing);
    this.operations = Number(operations);
    this.people = Number(people);
    this.strategy = Number(strategy);
  }

  get total() {
    return this.finance + this.marketing + this.operations + this.people + this.strategy;
  }

  isValid() {
    return Math.abs(this.total - 100) < 0.001;
  }

  toArray() {
    return [this.finance, this.marketing, this.operations, this.people, this.strategy];
  }

  toJSON() {
    return {
      finance: this.finance,
      marketing: this.marketing,
      operations: this.operations,
      people: this.people,
      strategy: this.strategy
    };
  }

  static fromJSON(data = {}) {
    return new EvaluationWeights(data);
  }
}
