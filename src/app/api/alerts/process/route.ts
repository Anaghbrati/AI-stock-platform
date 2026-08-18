
import {
  NextResponse,
} from "next/server";

import {
  createClient,
} from "../../../../lib/supabase/server";

import {
  processUserAlerts,
} from "../../../../lib/services/alert-trigger.service";

export async function POST() {
  try {
    const supabase =
      await createClient();

    /*
     * Never accept userId from the
     * request body.
     *
     * The authenticated user comes
     * directly from Supabase.
     */

    const {
      data: {
        user,
      },
      error: authError,
    } =
      await supabase.auth.getUser();

    if (
      authError ||
      !user
    ) {
      return NextResponse.json(
        {
          error:
            "Authentication required",
        },
        {
          status: 401,
        }
      );
    }

    const result =
      await processUserAlerts(
        user.id
      );

    return NextResponse.json(
      {
        success: true,
        ...result,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Alert processing error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to process alerts",
      },
      {
        status: 500,
      }
    );
  }
}
