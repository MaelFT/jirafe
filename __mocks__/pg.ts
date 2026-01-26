/**
 * Mock du module pg (PostgreSQL) pour les tests
 */

export class Pool {
  private mockData: any = {}

  constructor(config?: any) {}

  async query(text: string, params?: any[]): Promise<any> {
    // Mock simplifié - retourne des données par défaut
    return {
      rows: [],
      rowCount: 0,
    }
  }

  async end() {
    return Promise.resolve()
  }
}

// Export les types nécessaires
export interface QueryResult<T = any> {
  rows: T[]
  rowCount: number
}


