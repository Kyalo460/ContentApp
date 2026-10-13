import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, email, username, display_name, avatar_url, bio, is_admin")
      .not("username", "is", null)
      .order("username", { ascending: true });

    if (error) {
      throw error;
    }

    const creators = (data || []).map((p) => ({
      id: p.id,
      email: p.email,
      username: p.username,
      displayName: p.display_name || p.username,
      avatarUrl: p.avatar_url,
      bio: p.bio,
      isAdmin: p.is_admin,
    }));

    return NextResponse.json({ creators });
  } catch (error) {
    console.error("Fetch creators error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch creators",
      },
      { status: 500 },
    );
  }
}
