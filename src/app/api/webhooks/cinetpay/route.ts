import { NextResponse } from 'next/server';
const disabled=()=>NextResponse.json({ok:false,status:'disabled',message:'Paiement réel indisponible dans cette version.'},{status:503});
export async function GET(){return disabled()}
export async function POST(){return disabled()}
