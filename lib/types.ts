export type Status = 'Pending staff review' | 'In progress' | 'Completed';
export type RequestRow = {
  session_id: string;
  customer_name: string;
  location: string;
  property_type: string;
  service_type: string;
  issue_description: string;
  unit_count: string;
  ac_type: string;
  preferred_window: string;
  photo_note: string;
  summary: string;
  status: Status;
  updated_at: string;
};
export const statuses: Status[] = ['Pending staff review', 'In progress', 'Completed'];
export function normalizeRequest(obj: unknown): RequestRow | null {
  if (!obj || typeof obj !== 'object') return null;
  const o = obj as Record<string,unknown>;
  const str = (key: string) => String(o[key] ?? '').trim();
  if (!str('session_id')) return null;
  const status = statuses.includes(str('status') as Status) ? str('status') as Status : 'Pending staff review';
  return { session_id: str('session_id'), customer_name: str('customer_name'), location: str('location'),
    property_type: str('property_type'), service_type: str('service_type'), issue_description: str('issue_description'),
    unit_count: str('unit_count'), ac_type: str('ac_type'), preferred_window: str('preferred_window'),
    photo_note: str('photo_note'), summary: str('summary'), status, updated_at: str('updated_at') };
}
