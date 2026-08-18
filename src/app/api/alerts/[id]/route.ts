import { NextResponse } from "next/server";

import { createClient } from "../../../../lib/supabase/server";

import {
  getAlert,
  updateAlert,
  deleteAlert,
} from "../../../../lib/services/alert.service";

import type {
  AlertType,
} from "../../../../types/alert";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

// ========================================
// GET /api/alerts/[id]
// ========================================

export async function GET(
  request: Request,
  { params }: RouteContext
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          error: "Alert ID is required",
        },
        {
          status: 400,
        }
      );
    }

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

    const alert =
      await getAlert(
        user.id,
        id
      );

    if (!alert) {
      return NextResponse.json(
        {
          error: "Alert not found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(
      {
        alert,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "GET /api/alerts/[id] error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch alert",
      },
      {
        status: 500,
      }
    );
  }
}

// ========================================
// PATCH /api/alerts/[id]
// ========================================

export async function PATCH(
  request: Request,
  { params }: RouteContext
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          error: "Alert ID is required",
        },
        {
          status: 400,
        }
      );
    }

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

    // ======================================
    // PARSE BODY
    // ======================================

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          error:
            "Invalid JSON request body",
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
          error:
            "Request body must be an object",
        },
        {
          status: 400,
        }
      );
    }

    const {
      ticker,
      alert_type,
      target_value,
      is_active,
    } = body as {
      ticker?: unknown;
      alert_type?: unknown;
      target_value?: unknown;
      is_active?: unknown;
    };

    // ======================================
    // BUILD UPDATE OBJECT
    // ======================================

    const updates: {
      ticker?: string;
      alert_type?: AlertType;
      target_value?: number;
      is_active?: boolean;
    } = {};

    // ======================================
    // TICKER
    // ======================================

    if (ticker !== undefined) {
      if (
        typeof ticker !== "string" ||
        !ticker.trim()
      ) {
        return NextResponse.json(
          {
            error:
              "Ticker must be a valid string",
          },
          {
            status: 400,
          }
        );
      }

      updates.ticker =
        ticker.trim().toUpperCase();
    }

    // ======================================
    // ALERT TYPE
    // ======================================

    if (alert_type !== undefined) {
      const validAlertTypes: AlertType[] =
        [
          "PRICE_ABOVE",
          "PRICE_BELOW",
          "PERCENT_CHANGE",
        ];

      if (
        typeof alert_type !==
          "string" ||
        !validAlertTypes.includes(
          alert_type as AlertType
        )
      ) {
        return NextResponse.json(
          {
            error:
              "Invalid alert type",
          },
          {
            status: 400,
          }
        );
      }

      updates.alert_type =
        alert_type as AlertType;
    }

    // ======================================
    // TARGET VALUE
    // ======================================

    if (
      target_value !== undefined
    ) {
      if (
        typeof target_value !==
          "number" ||
        !Number.isFinite(
          target_value
        )
      ) {
        return NextResponse.json(
          {
            error:
              "Target value must be a valid number",
          },
          {
            status: 400,
          }
        );
      }

      updates.target_value =
        target_value;
    }

    // ======================================
    // ACTIVE STATUS
    // ======================================

    if (
      is_active !== undefined
    ) {
      if (
        typeof is_active !==
        "boolean"
      ) {
        return NextResponse.json(
          {
            error:
              "is_active must be a boolean",
          },
          {
            status: 400,
          }
        );
      }

      updates.is_active =
        is_active;
    }

    // ======================================
    // NOTHING TO UPDATE
    // ======================================

    if (
      Object.keys(updates)
        .length === 0
    ) {
      return NextResponse.json(
        {
          error:
            "No valid fields provided",
        },
        {
          status: 400,
        }
      );
    }

    // ======================================
    // UPDATE
    // ======================================

    const alert =
      await updateAlert(
        user.id,
        id,
        updates
      );

    return NextResponse.json(
      {
        alert,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "PATCH /api/alerts/[id] error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to update alert",
      },
      {
        status: 500,
      }
    );
  }
}

// ========================================
// DELETE /api/alerts/[id]
// ========================================

export async function DELETE(
  request: Request,
  { params }: RouteContext
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          error: "Alert ID is required",
        },
        {
          status: 400,
        }
      );
    }

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

    // ======================================
    // VERIFY ALERT EXISTS
    // ======================================

    const existingAlert =
      await getAlert(
        user.id,
        id
      );

    if (!existingAlert) {
      return NextResponse.json(
        {
          error: "Alert not found",
        },
        {
          status: 404,
        }
      );
    }

    // ======================================
    // DELETE
    // ======================================

    await deleteAlert(
      user.id,
      id
    );

    return NextResponse.json(
      {
        success: true,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "DELETE /api/alerts/[id] error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete alert",
      },
      {
        status: 500,
      }
    );
  }
}