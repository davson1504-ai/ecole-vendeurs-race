import { NextResponse } from 'next/server';
export const dynamic='force-dynamic';
export async function GET(){const url=process.env.NEXT_PUBLIC_SUPABASE_URL;const key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;if(!url||!key)return NextResponse.json({ok:false,service:'supabase'},{status:503});try{const response=await fetch(`${url.replace(/\/$/,'')}/rest/v1/courses?select=id&limit=1`,{headers:{apikey:key},cache:'no-store'});return NextResponse.json({ok:response.ok,service:'supabase'},{status:response.ok?200:502})}catch{return NextResponse.json({ok:false,service:'supabase'},{status:502})}}
