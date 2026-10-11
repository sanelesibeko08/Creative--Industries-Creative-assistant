import { NextRequest, NextResponse } from "next/server";
import { UpdatePreferencesSchema } from "@/lib/validators";
import { getPreferences, setPreferences } from "@/lib/db/preferences";
import type { PreferenceKey } from "@/lib/db/preferences";

// GET /api/preferences — read current preferences
export async function GET() {
  try {
    const prefs = await getPreferences();
    return NextResponse.json({ preferences: prefs });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to read preferences" },
      { status: 500 },
    );
  }
}

// PATCH /api/preferences — update one or more preferences
export async function PATCH(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = UpdatePreferencesSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues.map((i) => i.message).join(", ") },
      { status: 400 },
    );
  }

  try {
    await setPreferences(parsed.data as Partial<Record<PreferenceKey, string>>);
    const updated = await getPreferences();
    return NextResponse.json({ preferences: updated });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update preferences" },
      { status: 500 },
    );
  }
}
