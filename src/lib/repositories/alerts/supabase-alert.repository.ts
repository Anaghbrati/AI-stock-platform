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
  async getAlerts(userId: string): Promise<Alert[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("alerts")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch alerts:", error);
      throw new Error(error.message);
    }

    return (data ?? []) as Alert[];
  }

  /**
   * Returns only alerts that can still trigger.
   * The database does the filtering, so the engine does not
   * waste CPU/network bandwidth on already-triggered alerts.
   */
  async getActiveAlerts(): Promise<Alert[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("alerts")
      .select("*")
      .eq("is_active", true)
      .eq("is_triggered", false);

    if (error) {
      console.error("Failed to fetch active alerts:", error);
      throw new Error(error.message);
    }

    return (data ?? []) as Alert[];
  }

  async getAlert(
    userId: string,
    alertId: string
  ): Promise<Alert | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("alerts")
      .select("*")
      .eq("id", alertId)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error("Failed to fetch alert:", error);
      throw new Error(error.message);
    }

    return data as Alert | null;
  }

  async createAlert(
    userId: string,
    input: CreateAlertInput
  ): Promise<Alert> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("alerts")
      .insert({
        user_id: userId,
        ticker: input.ticker.trim().toUpperCase(),
        alert_type: input.alert_type,
        target_value: input.target_value,
        current_value: null,
        is_active: true,
        is_triggered: false,
        triggered_at: null,
      })
      .select("*")
      .single();

    if (error) {
      console.error("Failed to create alert:", error);
      throw new Error(error.message);
    }

    return data as Alert;
  }

  async updateAlert(
    userId: string,
    alertId: string,
    updates: Partial<CreateAlertInput> & { is_active?: boolean }
  ): Promise<Alert> {
    const supabase = await createClient();
    const updateData: Record<string, unknown> = {};

    if (updates.ticker !== undefined) {
      updateData.ticker = updates.ticker.trim().toUpperCase();
    }
    if (updates.alert_type !== undefined) {
      updateData.alert_type = updates.alert_type;
    }
    if (updates.target_value !== undefined) {
      updateData.target_value = updates.target_value;
    }
    if (updates.is_active !== undefined) {
      updateData.is_active = updates.is_active;
      // Reactivating an edited alert should make it eligible again.
      if (updates.is_active) {
        updateData.is_triggered = false;
        updateData.triggered_at = null;
      }
    }

    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("alerts")
      .update(updateData)
      .eq("id", alertId)
      .eq("user_id", userId)
      .select("*")
      .single();

    if (error) {
      console.error("Failed to update alert:", error);
      throw new Error(error.message);
    }

    return data as Alert;
  }

  /**
   * Atomic trigger transition.
   * The is_active=true predicate prevents a second concurrent
   * worker from triggering the same alert twice.
   */
  async updateAlertTriggerState(
    userId: string,
    alertId: string,
    currentValue: number
  ): Promise<Alert> {
    const supabase = await createClient();
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("alerts")
      .update({
        current_value: currentValue,
        is_triggered: true,
        is_active: false,
        triggered_at: now,
        updated_at: now,
      })
      .eq("id", alertId)
      .eq("user_id", userId)
      .eq("is_active", true)
      .eq("is_triggered", false)
      .select("*")
      .maybeSingle();

    if (error) {
      console.error("Failed to update triggered alert:", error);
      throw new Error(error.message);
    }

    // null means another worker already triggered it.
    if (!data) {
      const existing = await this.getAlert(userId, alertId);
      if (!existing) {
        throw new Error("Alert not found");
      }
      return existing;
    }

    return data as Alert;
  }

  async deleteAlert(userId: string, alertId: string): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase
      .from("alerts")
      .delete()
      .eq("id", alertId)
      .eq("user_id", userId);

    if (error) {
      console.error("Failed to delete alert:", error);
      throw new Error(error.message);
    }
  }
}
