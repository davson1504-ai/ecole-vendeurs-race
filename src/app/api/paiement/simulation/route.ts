import { NextResponse } from 'next/server';
export async function POST(){return NextResponse.json({ok:false,status:'disabled',message:'La simulation de paiement est désactivée.'},{status:503})}
export async function GET(){return NextResponse.json({ok:false,status:'disabled'},{status:405})}
