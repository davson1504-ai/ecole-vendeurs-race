export function safeNextPath(value: FormDataEntryValue | string | null | undefined, fallback='/dashboard') {
  const next=String(value??'').trim()||fallback;
  if(!next.startsWith('/')||next.startsWith('//')) return fallback;
  return next;
}
