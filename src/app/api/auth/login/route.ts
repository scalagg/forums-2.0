import { getIronSession } from "iron-session";
import { sessionOptions } from "@/libs/session/iron";
import { NextRequest, NextResponse } from "next/server";
import { Login } from "@/services/forum/account/AccountService";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();
  const [user, status, error] = await Login({ username, password });
  if (!user) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }
  const session = await getIronSession(cookies(), sessionOptions) as any;
  session.username = user.username;
  session.uuid = user.uuid;
  session.email = user.email;
  session.isLoggedIn = true;
  await session.save();
  return NextResponse.json(session);
}