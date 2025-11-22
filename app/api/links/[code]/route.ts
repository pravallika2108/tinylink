import { NextResponse } from "next/server";
import {sql} from "@/lib/db"

// GET /api/links/:code — stats for a single link
export async function GET(_: Request, { params }: any) {
  // 1️⃣ Query the link from database
  const rows = await sql`SELECT * FROM links WHERE code = ${params.code} LIMIT 1`;

  // 2️⃣ If not found, return 404
  if (rows.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // 3️⃣ Return the link info
  return NextResponse.json(rows[0]);
}

// DELETE /api/links/:code — delete a link
export async function DELETE(_: Request, { params }: any) {
  // 1️⃣ Delete the row and return the deleted row
  const res = await sql`DELETE FROM links WHERE code = ${params.code} RETURNING *`;

  // 2️⃣ If no row deleted, return 404
  if (res.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // 3️⃣ Return success
  return NextResponse.json({ ok: true });
}
