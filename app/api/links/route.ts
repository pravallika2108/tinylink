import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';

function generateCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url, code } = body;
    
    // Validate URL
    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    // Generate or validate code
    let shortCode = code;
    if (!shortCode) {
      shortCode = generateCode();
      // Ensure uniqueness
      let attempts = 0;
      while (attempts < 10) {
        const existing = await sql`SELECT code FROM links WHERE code = ${shortCode}`;
        if (existing.length === 0) break;
        shortCode = generateCode();
        attempts++;
      }
    } else {
      // Validate custom code
      if (!/^[A-Za-z0-9]{6,8}$/.test(shortCode)) {
        return NextResponse.json({ error: 'Code must be 6-8 alphanumeric characters' }, { status: 400 });
      }
      
      // Check if code exists
      const existing = await sql`SELECT code FROM links WHERE code = ${shortCode}`;
      if (existing.length > 0) {
        return NextResponse.json({ error: 'Code already exists' }, { status: 409 });
      }
    }

    // Insert link
    const result = await sql`
      INSERT INTO links (code, target_url, clicks, last_clicked)
      VALUES (${shortCode}, ${url}, 0, NULL)
      RETURNING code, target_url, clicks, last_clicked, created_at
    `;

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Error creating link:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const links = await sql`
      SELECT code, target_url, clicks, last_clicked, created_at
      FROM links
      ORDER BY created_at DESC
    `;
    return NextResponse.json(links);
  } catch (error) {
    console.error('Error fetching links:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}