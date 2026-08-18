export type AlertType =
  | "PRICE_ABOVE"
  | "PRICE_BELOW"
  | "PERCENT_CHANGE";

export interface Alert {
  id: string;
  user_id: string;
  ticker: string;
  alert_type: AlertType;
  target_value: number;
  current_value: number | null;
  is_active: boolean;
  is_triggered: boolean;
  triggered_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateAlertInput {
  ticker: string;
  alert_type: AlertType;
  target_value: number;
}