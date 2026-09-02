// Thin client for the FastAPI + Supabase backend (`app/`). Uses the native
// `fetch` API only — no new dependency is needed for this.

const API_BASE_URL: string =
(import.meta as { env?: { VITE_API_BASE_URL?: string } }).env?.VITE_API_BASE_URL ??
'http://localhost:8000';

export interface BackendChemical {
  id: number;
  name: string;
  cas_number: string | null;
  category: string | null;
  safety_classification: string | null;
  quantity: number | null;
  unit: string | null;
  location: string | null;
  expiry_date: string | null;
  hazard_level: string | null;
}

export interface BackendTransaction {
  id: number;
  chemical_id: number;
  container_id: number | null;
  transaction_type: string;
  quantity: number;
  performed_by: string | null;
  purpose: string | null;
  location: string | null;
  notes: string | null;
  timestamp: string | null;
  chemical_name: string | null;
  unit: string | null;
}

export interface UsagePayload {
  quantity: number;
  performed_by: string;
  purpose: string;
  notes?: string;
  timestamp?: string;
}

export interface UsageResult {
  transaction: BackendTransaction;
  chemical: BackendChemical;
}

class ApiError extends Error {}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...init
    });
  } catch {
    throw new ApiError('Could not reach the inventory server. Is the backend running?');
  }

  if (!res.ok) {
    let detail: unknown = res.statusText;
    try {
      const body = await res.json();
      detail = body.error ?? body.detail ?? detail;
    } catch {
      // response wasn't JSON — fall back to statusText
    }
    throw new ApiError(typeof detail === 'string' ? detail : JSON.stringify(detail));
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const api = {
  listChemicals: () => request<BackendChemical[]>('/chemicals'),
  listTransactions: () => request<BackendTransaction[]>('/transactions'),
  recordUsage: (chemicalId: number, payload: UsagePayload) =>
  request<UsageResult>(`/chemicals/${chemicalId}/usage`, {
    method: 'POST',
    body: JSON.stringify(payload)
  })
};
