export function buildDeletionProofBody(proof, codigoMfa) {
  const hasPassword = typeof proof?.senha === 'string' && proof.senha.length > 0
  const hasGoogleToken = typeof proof?.googleIdToken === 'string' && proof.googleIdToken.length > 0

  if (hasPassword === hasGoogleToken) {
    throw new Error('Confirme sua conta com exatamente um método de autenticação.')
  }

  return {
    ...(hasPassword ? { senha: proof.senha } : {}),
    ...(hasGoogleToken ? { googleIdToken: proof.googleIdToken } : {}),
    ...(typeof codigoMfa === 'string' && codigoMfa.length > 0 ? { codigoMfa } : {}),
  }
}

export function validateLoginResponse(data, message) {
  if (!data?.id || !data?.nome || !data?.role || !data?.accessToken || !data?.expiresIn) {
    throw new Error(message)
  }
  return data
}

export function isCredentialConfirmationFailure(method, path, message) {
  const isConfirmationRequest = (
    method === 'POST'
    && (
      /\/api\/v1\/usuarios\/\d+\/delete-challenge$/.test(path)
      || path === '/api/v1/auth/account-deletion/challenge'
    )
  ) || (
    method === 'DELETE'
    && (
      /\/api\/v1\/usuarios\/\d+$/.test(path)
      || path === '/api/v1/auth/account-deletion'
    )
  )

  return isConfirmationRequest && [
    'Senha incorreta.',
    'Código inválido ou expirado.',
    'Token Google invalido.',
    'A conta Google não corresponde à sessão autenticada.',
    'Reautentique-se com o Google para confirmar esta operação.',
  ].includes(message)
}
