import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const result = await sql`
      SELECT code, target_url, clicks, last_clicked, created_at
      FROM links
      WHERE code = ${code}
    `;
    
    if (result.length === 0) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 });
    }
    
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Error fetching link:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const result = await sql`
      DELETE FROM links WHERE code = ${code}
      RETURNING code
    `;
    
    if (result.length === 0) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting link:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}