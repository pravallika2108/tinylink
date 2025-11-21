import { NextResponse } from "next/server";
import sql from "@/lib/db";

export async function GET(req: Request) {
  const { pathname } = new URL(req.url);
  const code = pathname.slice(1); // remove leading "/"

  const link = await sql`SELECT * FROM links WHERE code = ${code} LIMIT 1`;

  if (!link[0]) {
    return NextResponse.json({ error: "Link not found" }, { status: 404 });
  }

  // Update clicks and last_clicked_at
  await sql`
    UPDATE links
    SET clicks = clicks + 1, last_clicked_at = now()
    WHERE code = ${code}
  `;

  return NextResponse.redirect(link[0].url, 302);
}
