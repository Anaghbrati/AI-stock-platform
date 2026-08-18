
import { createClient } from "../../supabase/server";

import type {
  Alert,
  CreateAlertInput,
} from "../../../types/alert";

import type {
  AlertRepository,
} from "./alert.repository";

export class SupabaseAlertRepository
  implements AlertRepository
{
  // ========================================
  // GET ALL ALERTS
  // ========================================

  async getAlerts(
    userId: string
  ): Promise<Alert[]> {
    const supabase =
      await createClient();

    const { data, error } =
      await supabase
        .from("alerts")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", {
          ascending: false,
        });

    if (error) {
      console.error(
        "Failed to fetch alerts:",
        {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        }
      );

      throw new Error(error.message);
    }

    return (data ?? []) as Alert[];
  }

  // ========================================
  // GET SINGLE ALERT
  // ========================================

  async getAlert(
    userId: string,
    alertId: string
  ): Promise<Alert | null> {
    const supabase =
      await createClient();

    const { data, error } =
      await supabase
        .from("alerts")
        .select("*")
        .eq("id", alertId)
        .eq("user_id", userId)
        .maybeSingle();

    if (error) {
      console.error(
        "Failed to fetch alert:",
        {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        }
      );

      throw new Error(error.message);
    }

    return data as Alert | null;
  }

  // ========================================
  // GET ACTIVE ALERTS BY TICKER
  // ========================================
  //
  // Used by the Alert Trigger Engine.
  //
  // Only loads alerts that:
  //
  // 1. Match the ticker
  // 2. Are active
  // 3. Have not already triggered
  //
  // This keeps the trigger query small and fast.
  //
  // ========================================

  async getActiveAlertsByTicker(
    ticker: string
  ): Promise<Alert[]> {
    const supabase =
      await createClient();

    const normalizedTicker =
      ticker.trim().toUpperCase();

    if (!normalizedTicker) {
      return [];
    }

    const { data, error } =
      await supabase
        .from("alerts")
        .select("*")
        .eq("ticker", normalizedTicker)
        .eq("is_active", true)
        .eq("is_triggered", false)
        .order("created_at", {
          ascending: true,
        });

    if (error) {
      console.error(
        "Failed to fetch active alerts:",
        {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        }
      );

      throw new Error(error.message);
    }

    return (data ?? []) as Alert[];
  }

  // ========================================
  // CREATE ALERT
  // ========================================

  async createAlert(
    userId: string,
    input: CreateAlertInput
  ): Promise<Alert> {
    const supabase =
      await createClient();

    const { data, error } =
      await supabase
        .from("alerts")
        .insert({
          user_id: userId,

          ticker:
            input.ticker
              .trim()
              .toUpperCase(),

          alert_type:
            input.alert_type,

          target_value:
            input.target_value,

          current_value: null,

          is_active: true,

          is_triggered: false,

          triggered_at: null,
        })
        .select("*")
        .single();

    if (error) {
      console.error(
        "Failed to create alert:",
        {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        }
      );

      throw new Error(error.message);
    }

    return data as Alert;
  }

  // ========================================
  // UPDATE ALERT
  // ========================================

  async updateAlert(
    userId: string,
    alertId: string,
    updates: Partial<CreateAlertInput> & {
      is_active?: boolean;
    }
  ): Promise<Alert> {
    const supabase =
      await createClient();

    const updateData: Record<
      string,
      unknown
    > = {};

    if (
      updates.ticker !== undefined
    ) {
      updateData.ticker =
        updates.ticker
          .trim()
          .toUpperCase();
    }

    if (
      updates.alert_type !==
      undefined
    ) {
      updateData.alert_type =
        updates.alert_type;
    }

    if (
      updates.target_value !==
      undefined
    ) {
      updateData.target_value =
        updates.target_value;
    }

    if (
      updates.is_active !==
      undefined
    ) {
      updateData.is_active =
        updates.is_active;
    }

    updateData.updated_at =
      new Date().toISOString();

    const { data, error } =
      await supabase
        .from("alerts")
        .update(updateData)
        .eq("id", alertId)
        .eq("user_id", userId)
        .select("*")
        .single();

    if (error) {
      console.error(
        "Failed to update alert:",
        {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        }
      );

      throw new Error(error.message);
    }

    return data as Alert;
  }

  // ========================================
  // UPDATE TRIGGER STATE
  // ========================================
  //
  // Used by the Alert Trigger Engine.
  //
  // The additional active/triggered filters
  // prevent the same alert from being triggered
  // multiple times by concurrent requests.
  //
  // ========================================

  async updateAlertTriggerState(
    userId: string,
    alertId: string,
    currentValue: number
  ): Promise<Alert> {
    const supabase =
      await createClient();

    const now =
      new Date().toISOString();

    const {
      data,
      error,
    } = await supabase
      .from("alerts")
      .update({
        current_value:
          currentValue,

        is_triggered:
          true,

        is_active:
          false,

        triggered_at:
          now,

        updated_at:
          now,
      })
      .eq("id", alertId)
      .eq("user_id", userId)

      // Prevent duplicate triggering.
      .eq("is_active", true)
      .eq("is_triggered", false)

      .select("*")
      .single();

    if (error) {
      console.error(
        "Failed to update triggered alert:",
        {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        }
      );

      throw new Error(error.message);
    }

    return data as Alert;
  }

  // ========================================
  // DELETE ALERT
  // ========================================

  async deleteAlert(
    userId: string,
    alertId: string
  ): Promise<void> {
    const supabase =
      await createClient();

    const { error } =
      await supabase
        .from("alerts")
        .delete()
        .eq("id", alertId)
        .eq("user_id", userId);

    if (error) {
      console.error(
        "Failed to delete alert:",
        {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        }
      );

      throw new Error(error.message);
    }
  }
}
