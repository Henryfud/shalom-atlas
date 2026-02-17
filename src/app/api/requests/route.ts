import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { type, message } = await req.json();

    if (!type || !["city", "name", "idea"].includes(type)) {
      return NextResponse.json({ error: "Invalid request type" }, { status: 400 });
    }

    if (!message || typeof message !== "string" || message.trim().length < 2) {
      return NextResponse.json({ error: "Message must be at least 2 characters" }, { status: 400 });
    }

    if (message.trim().length > 500) {
      return NextResponse.json({ error: "Message too long (max 500 characters)" }, { status: 400 });
    }

    const supabase = getSupabase();

    const { error } = await supabase.from("requests").insert({
      type,
      message: message.trim(),
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
