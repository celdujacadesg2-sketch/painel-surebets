export function hasActiveAccess(user: {
  trialEndsAt: Date | null;
  subscriptionEndsAt: Date | null;
  isBlocked: boolean;
  role: string;
}): boolean {
  if (user.isBlocked) return false;
  if (user.role === 'ADMIN') return true;

  const now = new Date();
  
  // Check trial
  if (user.trialEndsAt && user.trialEndsAt > now) {
    return true;
  }
  
  // Check subscription
  if (user.subscriptionEndsAt && user.subscriptionEndsAt > now) {
    return true;
  }
  
  return false;
}

export function getRemainingTrialDays(trialEndsAt: Date | null): number {
  if (!trialEndsAt) return 0;
  
  const now = new Date();
  const diff = trialEndsAt.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  
  return days > 0 ? days : 0;
}

export function getAccessStatus(user: {
  trialEndsAt: Date | null;
  subscriptionEndsAt: Date | null;
  isBlocked: boolean;
  role: string;
}): {
  hasAccess: boolean;
  status: 'trial' | 'subscribed' | 'expired' | 'blocked' | 'admin';
  daysRemaining?: number;
} {
  if (user.isBlocked) {
    return { hasAccess: false, status: 'blocked' };
  }
  
  if (user.role === 'ADMIN') {
    return { hasAccess: true, status: 'admin' };
  }

  const now = new Date();
  
  // Check trial first
  if (user.trialEndsAt && user.trialEndsAt > now) {
    return {
      hasAccess: true,
      status: 'trial',
      daysRemaining: getRemainingTrialDays(user.trialEndsAt),
    };
  }
  
  // Check subscription
  if (user.subscriptionEndsAt && user.subscriptionEndsAt > now) {
    const diff = user.subscriptionEndsAt.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    return {
      hasAccess: true,
      status: 'subscribed',
      daysRemaining: days,
    };
  }
  
  return { hasAccess: false, status: 'expired' };
}
