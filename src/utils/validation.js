export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const PASSWORD_REQUIREMENTS = [
  {
    id: 'minLength',
    label: 'No minimo 8 caracteres',
    isValid: password => password.length >= 8,
  },
  {
    id: 'uppercase',
    label: 'Pelo menos uma letra maiuscula',
    isValid: password => /[A-Z]/.test(password),
  },
  {
    id: 'lowercase',
    label: 'Pelo menos uma letra minuscula',
    isValid: password => /[a-z]/.test(password),
  },
  {
    id: 'number',
    label: 'Pelo menos um numero',
    isValid: password => /\d/.test(password),
  },
  {
    id: 'special',
    label: 'Pelo menos um caractere especial',
    isValid: password => /[^A-Za-z0-9]/.test(password),
  },
]

export function isValidEmail(email) {
  return EMAIL_RE.test(email)
}

export function getPasswordChecks(password = '') {
  return PASSWORD_REQUIREMENTS.map(requirement => ({
    ...requirement,
    valid: requirement.isValid(password),
  }))
}

export function isStrongPassword(password = '') {
  return getPasswordChecks(password).every(check => check.valid)
}

export function getPasswordValidationMessage(password = '') {
  const missing = getPasswordChecks(password).filter(check => !check.valid)
  if (!missing.length) return ''
  return `A senha deve conter: ${missing.map(check => check.label.toLowerCase()).join(', ')}.`
}
