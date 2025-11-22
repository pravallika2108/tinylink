import { sql } from "@/lib/db";

export async function GET(_: Request, { params }: any) {
  // 1️⃣ Get the link from the database
  const rows = await sql`SELECT * FROM links WHERE code = ${params.code} LIMIT 1`;

  // 2️⃣ If not found, return 404
  if (rows.length === 0) {
    return new Response("Not Found", { status: 404 });
  }

  const link = rows[0];

  // 3️⃣ Increment clicks and update last_clicked
  await sql`
    UPDATE links
    SET clicks = clicks + 1, last_clicked = NOW()
    WHERE code = ${params.code}
  `;

  // 4️⃣ Redirect to the original URL
  return Response.redirect(link.url, 302);
}
