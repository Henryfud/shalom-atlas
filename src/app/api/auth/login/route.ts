import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { pbkdf2Sync } from "crypto";

function hashPassword(password: string, salt: string): string {
  return pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
}

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password required" }, { status: 400 });
    }

    const cleanUsername = username.trim().toLowerCase();
    const supabase = getSupabase();

    // Look up user
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("username", cleanUsername)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
    }

    // Verify password
    const hash = hashPassword(password, profile.salt);
    if (hash !== profile.password_hash) {
      return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
    }

    return NextResponse.json({
      user: {
        id: profile.id,
        username: profile.username,
        wallet_address: profile.wallet_address,
        trust_level: profile.trust_level,
        created_at: profile.created_at,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
