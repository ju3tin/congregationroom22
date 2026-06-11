import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = cookies();
    
    // Clear the session cookie (adjust name based on your auth library)
    cookieStore.delete("next-auth.session-token");   // NextAuth
    // cookieStore.delete("session");                // If using custom session

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  }
}
