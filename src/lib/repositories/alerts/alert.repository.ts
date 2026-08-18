import type {
  Alert,
  CreateAlertInput,
} from "../../../types/alert";

export interface AlertRepository {
  getAlerts(
    userId: string
  ): Promise<Alert[]>;

  getAlert(
    userId: string,
    alertId: string
  ): Promise<Alert | null>;

  getActiveAlertsByTicker(
    ticker: string
  ): Promise<Alert[]>;

  createAlert(
    userId: string,
    input: CreateAlertInput
  ): Promise<Alert>;

  updateAlert(
    userId: string,
    alertId: string,
    updates: Partial<CreateAlertInput> & {
      is_active?: boolean;
    }
  ): Promise<Alert>;

  updateAlertTriggerState(
    userId: string,
    alertId: string,
    currentValue: number
  ): Promise<Alert | null>;

  deleteAlert(
    userId: string,
    alertId: string
  ): Promise<void>;
}