import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { randomBytes, pbkdf2Sync } from "crypto";

function hashPassword(password: string, salt: string): string {
  return pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
}

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  if (!username || typeof username !== "string" || username.trim().length < 2) {
    return NextResponse.json({ error: "Username must be at least 2 characters" }, { status: 400 });
  }
  if (!password || typeof password !== "string" || password.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
  }

  const cleanUsername = username.trim().toLowerCase();
  const supabase = getSupabase();

  // Check if username is taken
  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", cleanUsername)
    .single();

  if (existing) {
    return NextResponse.json({ error: "Username already taken" }, { status: 409 });
  }

  // Hash password
  const salt = randomBytes(32).toString("hex");
  const password_hash = hashPassword(password, salt);
  const id = randomBytes(16).toString("hex");

  // Create profile
  const { error } = await supabase.from("profiles").insert({
    id,
    username: cleanUsername,
    password_hash,
    salt,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    user: { id, username: cleanUsername },
  });
}
