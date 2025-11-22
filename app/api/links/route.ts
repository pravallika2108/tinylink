import { NextResponse } from "next/server";
import  {sql}  from "@/lib/db";

const CODE_REGEX = /^[A-Za-z0-9]{6,8}$/;

export async function POST(req: Request) {

  const { url, code } = await req.json();


  try {
    new URL(url);
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  
  const finalCode =
    code || Math.random().toString(36).substring(2, 10).slice(0, 6);

  if (code && !CODE_REGEX.test(code)) {
    return NextResponse.json(
      { error: "Code must be 6–8 alphanumeric characters" },
      { status: 400 }
    );
  }


  try {
    await sql`
      INSERT INTO links (code, url)
      VALUES (${finalCode}, ${url})
    `;
  } catch (e) {
    
    return NextResponse.json({ error: "Code already exists" }, { status: 409 });
  }


  return NextResponse.json({ code: finalCode, url }, { status: 201 });
}

// list all links
export async function GET() {
  const rows = await sql`SELECT * FROM links ORDER BY created_at DESC`;
  return NextResponse.json(rows);
}
