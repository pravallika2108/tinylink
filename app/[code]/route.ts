import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    
    console.log('Redirect request for code:', code);
    
    // Fetch link
    const result = await sql`
      SELECT target_url FROM links WHERE code = ${code}
    `;
    
    console.log('Query result:', result);
    
    if (result.length === 0) {
      return new NextResponse('Link not found', { status: 404 });
    }
    
    const targetUrl = result[0].target_url;
    console.log('Redirecting to:', targetUrl);
    
    // Update click count (don't await to make redirect faster)
    sql`
      UPDATE links
      SET clicks = clicks + 1, last_clicked = NOW()
      WHERE code = ${code}
    `.catch(err => console.error('Error updating clicks:', err));
    
    // Redirect (302) using NextResponse.redirect
    return NextResponse.redirect(targetUrl, { status: 302 });
  } catch (error: any) {
    console.error('Error redirecting:', error);
    console.error('Error message:', error.message);
    return new NextResponse('Internal server error', { status: 500 });
  }
}