import { NextRequest, NextResponse } from 'next/server';
export async function GET() { return NextResponse.json({ ok: true, message: 'Webhook CinetPay accessible.' }); }
export async function POST(request: NextRequest) {
  const contentType = request.headers.get('content-type') || '';
  const token = request.headers.get('x-token');
  let payload: Record<string, unknown> = {};
  if (contentType.includes('application/json')) payload = await request.json();
  else payload = Object.fromEntries((await request.formData()).entries());
  console.log('Webhook CinetPay reçu', { hasToken: Boolean(token), payload });
  return NextResponse.json({ ok: true });
}
