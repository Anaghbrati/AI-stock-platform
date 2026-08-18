import {
  SupabaseAlertRepository,
} from "../repositories/alerts/supabase-alert.repository";

import type {
  Alert,
  CreateAlertInput,
} from "../../types/alert";

const alertRepository =
  new SupabaseAlertRepository();

export async function getAlerts(
  userId: string
): Promise<Alert[]> {
  if (!userId) {
    throw new Error(
      "Authenticated user is required"
    );
  }

  return alertRepository.getAlerts(
    userId
  );
}

export async function getAlert(
  userId: string,
  alertId: string
): Promise<Alert | null> {
  if (!userId) {
    throw new Error(
      "Authenticated user is required"
    );
  }

  if (!alertId) {
    throw new Error(
      "Alert ID is required"
    );
  }

  return alertRepository.getAlert(
    userId,
    alertId
  );
}

export async function createAlert(
  userId: string,
  input: CreateAlertInput
): Promise<Alert> {
  if (!userId) {
    throw new Error(
      "Authenticated user is required"
    );
  }

  if (!input.ticker?.trim()) {
    throw new Error(
      "Ticker is required"
    );
  }

  if (!input.alert_type) {
    throw new Error(
      "Alert type is required"
    );
  }

  if (
    typeof input.target_value !==
      "number" ||
    !Number.isFinite(
      input.target_value
    )
  ) {
    throw new Error(
      "Target value must be a valid number"
    );
  }

  if (input.target_value <= 0) {
    throw new Error(
      "Target value must be greater than zero"
    );
  }

  return alertRepository.createAlert(
    userId,
    {
      ...input,
      ticker:
        input.ticker
          .trim()
          .toUpperCase(),
    }
  );
}

export async function updateAlert(
  userId: string,
  alertId: string,
  updates: Partial<CreateAlertInput> & {
    is_active?: boolean;
  }
): Promise<Alert> {
  if (!userId) {
    throw new Error(
      "Authenticated user is required"
    );
  }

  if (!alertId) {
    throw new Error(
      "Alert ID is required"
    );
  }

  if (
    updates.target_value !==
      undefined &&
    (
      typeof updates.target_value !==
        "number" ||
      !Number.isFinite(
        updates.target_value
      ) ||
      updates.target_value <= 0
    )
  ) {
    throw new Error(
      "Target value must be a valid positive number"
    );
  }

  if (
    updates.ticker !== undefined &&
    !updates.ticker.trim()
  ) {
    throw new Error(
      "Ticker cannot be empty"
    );
  }

  return alertRepository.updateAlert(
    userId,
    alertId,
    {
      ...updates,
      ticker:
        updates.ticker
          ?.trim()
          .toUpperCase(),
    }
  );
}

export async function updateAlertTriggerState(
  userId: string,
  alertId: string,
  currentValue: number
): Promise<Alert | null> {
  if (!userId) {
    throw new Error(
      "Authenticated user is required"
    );
  }

  if (!alertId) {
    throw new Error(
      "Alert ID is required"
    );
  }

  if (
    typeof currentValue !== "number" ||
    !Number.isFinite(currentValue)
  ) {
    throw new Error(
      "Current value must be a valid number"
    );
  }

  return alertRepository.updateAlertTriggerState(
    userId,
    alertId,
    currentValue
  );
}

export async function deleteAlert(
  userId: string,
  alertId: string
): Promise<void> {
  if (!userId) {
    throw new Error(
      "Authenticated user is required"
    );
  }

  if (!alertId) {
    throw new Error(
      "Alert ID is required"
    );
  }

  await alertRepository.deleteAlert(
    userId,
    alertId
  );
}