import { NextResponse } from "next/server";
import  {sql}  from "@/lib/db";

const CODE_REGEX = /^[A-Za-z0-9]{6,8}$/;

export async function POST(req: Request) {
  // 1️⃣ Parse request body
  const { url, code } = await req.json();

  // 2️⃣ Validate URL
  try {
    new URL(url);
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  // 3️⃣ Generate random code if not provided
  const finalCode =
    code || Math.random().toString(36).substring(2, 10).slice(0, 6);

  // 4️⃣ Validate custom code if provided
  if (code && !CODE_REGEX.test(code)) {
    return NextResponse.json(
      { error: "Code must be 6–8 alphanumeric characters" },
      { status: 400 }
    );
  }

  // 5️⃣ Insert into database
  try {
    await sql`
      INSERT INTO links (code, url)
      VALUES (${finalCode}, ${url})
    `;
  } catch (e) {
    // 6️⃣ If duplicate code, return 409
    return NextResponse.json({ error: "Code already exists" }, { status: 409 });
  }

  // 7️⃣ Return success response
  return NextResponse.json({ code: finalCode, url }, { status: 201 });
}

// ➤ GET /api/links — list all links
export async function GET() {
  const rows = await sql`SELECT * FROM links ORDER BY created_at DESC`;
  return NextResponse.json(rows);
}
