import { signInWithApple, signInWithGoogle } from '@/app/(auth)/actions';

function GoogleLogo() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06L5.84 9.9C6.71 7.3 9.14 5.38 12 5.38z" />
    </svg>
  );
}

function AppleLogo() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
      <path d="M16.365 1.43c0 1.14-.42 2.13-1.25 2.96-.9.9-1.95 1.42-3.06 1.34-.13-1.08.36-2.18 1.17-3.03.86-.9 2.2-1.55 3.14-1.27ZM20.91 17.1c-.42.96-.62 1.39-1.16 2.24-.75 1.14-1.8 2.57-3.1 2.59-1.16.02-1.46-.75-3.04-.74-1.58.01-1.91.77-3.07.75-1.3-.02-2.3-1.3-3.05-2.44-2.09-3.2-2.31-6.95-1.02-8.95.92-1.43 2.37-2.27 3.74-2.27 1.39 0 2.27.76 3.42.76 1.11 0 1.79-.76 3.39-.76 1.21 0 2.49.66 3.41 1.8-2.99 1.64-2.5 5.91.48 7.02Z" />
    </svg>
  );
}

type Props = {
  next?: string;
};

export function SocialAuthButtons({ next = '/dashboard' }: Props) {
  return (
    <div className="grid gap-3">
      <form action={signInWithGoogle}>
        <input type="hidden" name="next" value={next} />
        <button type="submit" className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white px-4 py-3 font-bold text-[#071b3a] transition hover:bg-slate-50">
          <GoogleLogo />
          Continuer avec Google
        </button>
      </form>
      <form action={signInWithApple}>
        <input type="hidden" name="next" value={next} />
        <button type="submit" className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-900 bg-slate-950 px-4 py-3 font-bold text-white transition hover:bg-black">
          <AppleLogo />
          Continuer avec Apple
        </button>
      </form>
    </div>
  );
}
