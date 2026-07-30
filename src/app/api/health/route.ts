import { NextResponse } from 'next/server';
export async function GET() {
  return NextResponse.json({ ok: true, app: 'Ecole des Vendeurs de Race', timestamp: new Date().toISOString() });
}
