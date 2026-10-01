export const STORAGE_KEYS = {
  user:                'sc_user',
  accessToken:         'sc_access_token',
  tokenExpiresAt:      'sc_token_expires_at',
  dashboardEntered:    'sc_dashboard_entered',
  mfaPendingEmail:     'sc_mfa_pending_email',
  pendingTeacherIntent: (userId) => `sc_pending_teacher_intent_${userId}`,
}
