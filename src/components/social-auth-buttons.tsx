type SocialAuthButtonsProps = {
  mode?: "signin" | "signup";
};

function GoogleLogo() {
  return (
    <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303C33.653 32.657 29.223 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917Z"
      />
      <path
        fill="#FF3D00"
        d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691Z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44Z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917Z"
      />
    </svg>
  );
}

function AppleLogo() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" fill="currentColor">
      <path d="M16.365 1.43c0 1.14-.47 2.21-1.19 3.02-.77.87-2.04 1.55-3.1 1.46-.14-1.1.4-2.25 1.1-3.05.79-.9 2.14-1.56 3.19-1.43Zm3.6 16.64c-.63 1.38-.94 1.99-1.76 3.21-1.14 1.7-2.75 3.82-4.74 3.84-1.78.02-2.24-1.11-4.65-1.1-2.41.01-2.91 1.13-4.69 1.11-1.99-.02-3.5-1.94-4.64-3.64-3.18-4.75-3.51-10.32-1.55-13.28 1.39-2.09 3.58-3.32 5.65-3.32 2.11 0 3.44 1.13 5.19 1.13 1.7 0 2.73-1.13 5.18-1.13 1.85 0 3.82 1.01 5.2 2.76-4.57 2.5-3.83 9.02.81 10.42Z" transform="scale(.9) translate(1.2 -.7)" />
    </svg>
  );
}

export function SocialAuthButtons({ mode = "signin" }: SocialAuthButtonsProps) {
  const googleLabel = mode === "signup" ? "S’inscrire avec Google" : "Continuer avec Google";
  const appleLabel = mode === "signup" ? "S’inscrire avec Apple / iCloud" : "Continuer avec Apple / iCloud";

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">ou</span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          className="inline-flex h-12 items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-extrabold text-slate-900 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
        >
          <GoogleLogo />
          <span>{googleLabel}</span>
        </button>

        <button
          type="button"
          className="inline-flex h-12 items-center justify-center gap-3 rounded-2xl border border-slate-900 bg-slate-950 px-4 text-sm font-extrabold text-white shadow-sm transition hover:bg-slate-800"
        >
          <AppleLogo />
          <span>{appleLabel}</span>
        </button>
      </div>

      <p className="text-center text-xs text-slate-500">
        Les connexions Google et Apple seront branchées avec Supabase OAuth à l’étape suivante.
      </p>
    </div>
  );
}
