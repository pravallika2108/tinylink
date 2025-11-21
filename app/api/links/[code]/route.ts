import { NextResponse } from "next/server";
import sql from "@/lib/db";

// GET a single link
export async function GET(req: Request) {
  const code = new URL(req.url).pathname.split("/").pop();

  if (!code) return NextResponse.json({ error: "Code required" }, { status: 400 });

  const link = await sql`SELECT * FROM links WHERE code = ${code} LIMIT 1`;

  if (!link[0]) return NextResponse.json({ error: "Link not found" }, { status: 404 });

  return NextResponse.json(link[0]);
}

// DELETE a link
export async function DELETE(req: Request) {
  const code = new URL(req.url).pathname.split("/").pop();

  if (!code) return NextResponse.json({ error: "Code required" }, { status: 400 });

  await sql`DELETE FROM links WHERE code = ${code}`;

  return NextResponse.json({ ok: true });
}
