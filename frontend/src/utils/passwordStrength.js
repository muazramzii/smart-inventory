// src/utils/passwordStrength.js
// ----------------------------------------------------------------------------
// Shared 0-5 password strength score, used by both the change-password form
// and the admin user-creation form so the scoring can't drift out of sync.
// ----------------------------------------------------------------------------

export function scorePassword(password) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

export const STRENGTH_LABELS = ['Too short', 'Weak', 'Fair', 'Good', 'Strong', 'Excellent'];

export function strengthColorClass(score) {
  if (score <= 1) return 'bg-red-500';
  if (score <= 2) return 'bg-amber-500';
  if (score <= 3) return 'bg-yellow-500';
  if (score <= 4) return 'bg-green-500';
  return 'bg-emerald-600';
}
