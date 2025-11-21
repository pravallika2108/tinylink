import { NextResponse } from "next/server";
import sql from "@/lib/db";

const CODE_REGEX = /^[A-Za-z0-9]{6,8}$/;

export async function GET() {
  const links = await sql`
    SELECT * FROM links ORDER BY created_at DESC
  `;
  return NextResponse.json(links);
}

export async function POST(req: Request) {
  const { url, code } = await req.json();

  // Validate URL format
  try {
    new URL(url);
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  let short = code;

  // Validate custom code if provided
  if (short) {
    if (!CODE_REGEX.test(short)) {
      return NextResponse.json(
        { error: "Code must match [A-Za-z0-9]{6,8}" },
        { status: 400 }
      );
    }

    const exists = await sql`
      SELECT 1 FROM links WHERE code = ${short}
    `;
    if (exists.length > 0)
      return NextResponse.json({ error: "Code exists" }, { status: 409 });
  } else {
    // Auto-generate code if not supplied
    short = Math.random().toString(36).slice(2, 8);
  }

  // Insert record
  await sql`
    INSERT INTO links (code, url)
    VALUES (${short}, ${url})
  `;

  return NextResponse.json({
    code: short,
    url,
    clicks: 0,
    lastClickedAt: null,
  });
}
