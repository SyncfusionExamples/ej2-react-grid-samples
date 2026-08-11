interface GridState {
  skip?: number;
  take?: number;
  sorted?: any[];
  where?: any;
  search?: any;
}

interface GridDataResponse {
  result: any[];
  count: number;
}

export class GridApiService {
  private baseUrl: string;
  private primaryKey: string;

  constructor(baseUrl: string, primaryKey: string = 'id') {
    this.baseUrl = baseUrl;
    this.primaryKey = primaryKey;
  }

  /**
   * Fetch data from the server based on grid state
   */
  async fetchData(gridState: GridState): Promise<GridDataResponse> {
    const stateWithCount = { requiresCounts: true, ...gridState };
    const url = `${this.baseUrl}?gridState=${encodeURIComponent(JSON.stringify(stateWithCount))}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    return await response.json();
  }

  /**
   * Create a new record
   */
  async createRecord(data: any): Promise<any> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Create operation failed');
    }

    return await response.json();
  }

  /**
   * Update an existing record
   */
  async updateRecord(id: any, data: any): Promise<any> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Update operation failed');
    }

    return await response.json();
  }

  /**
   * Delete a record
   */
  async deleteRecord(id: any): Promise<any> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Delete operation failed');
    }

    return await response.json();
  }

  /**
   * Extract record ID from data
   */
  extractRecordId(data: any): any {
    if (Array.isArray(data)) {
      return data[0]?.[this.primaryKey];
    }
    return data?.[this.primaryKey];
  }

  /**
   * Get primary key field name
   */
  getPrimaryKey(): string {
    return this.primaryKey;
  }
}
