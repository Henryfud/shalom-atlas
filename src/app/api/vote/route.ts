import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getCurrentPeriodId } from "@/lib/periods";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const DAILY_CAP = 500;

export async function POST(req: NextRequest) {
  // Get auth token from request
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "") ?? "";

  const {
    data: { user },
  } = await supabase.auth.getUser(token);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { hex_id, mode, vote_value } = body;

  if (!hex_id || !mode || vote_value === undefined) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  if (!["jewish", "goy"].includes(mode)) {
    return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
  }

  if (vote_value < -2 || vote_value > 2) {
    return NextResponse.json({ error: "Vote value must be between -2 and 2" }, { status: 400 });
  }

  const periodId = getCurrentPeriodId();
  const today = new Date().toISOString().slice(0, 10);

  // Check daily cap
  const { data: dailyData } = await supabase
    .from("daily_points")
    .select("points_earned")
    .eq("user_id", user.id)
    .eq("date", today)
    .single();

  const currentDaily = dailyData?.points_earned ?? 0;
  if (currentDaily >= DAILY_CAP) {
    return NextResponse.json({ error: "Daily points cap reached (500)" }, { status: 429 });
  }

  // Check if user already voted this period
  const { data: existingVote } = await supabase
    .from("votes")
    .select("id")
    .eq("user_id", user.id)
    .eq("hex_id", hex_id)
    .eq("mode", mode)
    .eq("period_id", periodId)
    .single();

  if (existingVote) {
    return NextResponse.json({ error: "Already voted on this cell this period" }, { status: 409 });
  }

  // Check if this is the first vote on this cell
  const { count: priorVotes } = await supabase
    .from("votes")
    .select("*", { count: "exact", head: true })
    .eq("hex_id", hex_id)
    .eq("mode", mode);

  const isFirst = (priorVotes ?? 0) === 0;
  const pointsEarned = isFirst ? 2 : 1;

  // Insert vote
  const { error: voteError } = await supabase.from("votes").insert({
    user_id: user.id,
    hex_id,
    mode,
    vote_value,
    period_id: periodId,
  });

  if (voteError) {
    return NextResponse.json({ error: voteError.message }, { status: 500 });
  }

  // Update daily points
  const newDaily = currentDaily + pointsEarned;
  await supabase
    .from("daily_points")
    .upsert({ user_id: user.id, date: today, points_earned: newDaily });

  return NextResponse.json({
    success: true,
    points_earned: pointsEarned,
    daily_total: newDaily,
  });
}
