import { NextResponse } from "next/server";

import { createClient } from "../../../lib/supabase/server";

import {
  getAlerts,
  createAlert,
} from "../../../lib/services/alert.service";

import type {
  CreateAlertInput,
} from "../../../types/alert";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    /*
     * Optional ticker filter.
     *
     * Example:
     *
     * /api/alerts?ticker=RELIANCE.NS
     *
     * If ticker is not provided, return all alerts.
     */

    const { searchParams } = new URL(request.url);

    const tickerParam =
      searchParams.get("ticker");

    const ticker = tickerParam
      ?.trim()
      .toUpperCase();

    const alerts = await getAlerts(user.id);

    /*
     * Filter on the API layer when a ticker
     * was supplied.
     *
     * This allows the stock page to ask:
     *
     * "Does this user already have an alert
     * for RELIANCE.NS?"
     */

    const filteredAlerts = ticker
      ? alerts.filter(
          (alert) =>
            alert.ticker?.trim().toUpperCase() ===
            ticker
        )
      : alerts;

    return NextResponse.json(
      {
        alerts: filteredAlerts,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "GET /api/alerts error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch alerts",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(
  request: Request
) {
  try {
    const supabase =
      await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          error: "Invalid JSON body",
        },
        {
          status: 400,
        }
      );
    }

    if (
      typeof body !== "object" ||
      body === null
    ) {
      return NextResponse.json(
        {
          error: "Invalid request body",
        },
        {
          status: 400,
        }
      );
    }

    const data =
      body as Record<string, unknown>;

    const input: CreateAlertInput = {
      ticker:
        typeof data.ticker === "string"
          ? data.ticker
          : "",

      alert_type:
        data.alert_type as CreateAlertInput["alert_type"],

      target_value:
        typeof data.target_value ===
        "number"
          ? data.target_value
          : Number(
              data.target_value
            ),
    };

    const alert =
      await createAlert(
        user.id,
        input
      );

    /*
     * IMPORTANT:
     *
     * Return the complete created alert.
     *
     * The frontend will immediately store
     * this object and display it without
     * requiring another request.
     */

    return NextResponse.json(
      {
        alert,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "POST /api/alerts error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to create alert";

    const isValidationError =
      message.includes("required") ||
      message.includes("valid") ||
      message.includes("greater than") ||
      message.includes("empty");

    return NextResponse.json(
      {
        error: message,
      },
      {
        status: isValidationError
          ? 400
          : 500,
      }
    );
  }
}