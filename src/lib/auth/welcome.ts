export function shouldShowFirstLoginWelcome(input:{role:string;onboardingComplete:boolean;seenAt:string|null}){return input.role==='apprenant'&&!input.onboardingComplete&&!input.seenAt}
export function shouldShowOnboardingReminder(input:{role:string;onboardingComplete:boolean;seenAt:string|null}){return input.role==='apprenant'&&!input.onboardingComplete&&Boolean(input.seenAt)}
