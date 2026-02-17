import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { pbkdf2Sync } from "crypto";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function hashPassword(password: string, salt: string): string {
  return pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
}

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  if (!username || !password) {
    return NextResponse.json({ error: "Username and password required" }, { status: 400 });
  }

  const cleanUsername = username.trim().toLowerCase();

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
}
