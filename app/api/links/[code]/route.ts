import { NextResponse } from "next/server";
import {sql} from "@/lib/db"

// GET /api/links/:code — stats for a single link
export async function GET(_: Request, { params }: any) {
  
  const rows = await sql`SELECT * FROM links WHERE code = ${params.code} LIMIT 1`;

  
  if (rows.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(rows[0]);
}


export async function DELETE(_: Request, { params }: any) {
  
  const res = await sql`DELETE FROM links WHERE code = ${params.code} RETURNING *`;

  
  if (res.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

 
  return NextResponse.json({ ok: true });
}
