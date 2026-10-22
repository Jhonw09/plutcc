import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import {
  buildDeletionProofBody,
  isCredentialConfirmationFailure,
  validateLoginResponse,
} from '../src/api/authContracts.js'

const webApiClientPath = new URL('../src/api/apiClient.js', import.meta.url)

test('deletion requests contain exactly one supported identity proof', () => {
  assert.deepEqual(buildDeletionProofBody({ senha: 'correct horse' }), { senha: 'correct horse' })
  assert.deepEqual(buildDeletionProofBody({ googleIdToken: 'signed-token' }, '123456'), {
    googleIdToken: 'signed-token',
    codigoMfa: '123456',
  })
  assert.throws(() => buildDeletionProofBody({}), /exatamente um método/)
  assert.throws(() => buildDeletionProofBody({ senha: 'secret', googleIdToken: 'token' }), /exatamente um método/)
})

test('Web login accepts additive onboardingRequired without changing session validation', () => {
  const response = {
    id: 7,
    nome: 'Aluno',
    role: 'ALUNO',
    accessToken: 'jwt',
    expiresIn: 3600,
    onboardingRequired: true,
  }
  assert.equal(validateLoginResponse(response, 'invalid'), response)
  assert.throws(() => validateLoginResponse({ onboardingRequired: true }, 'invalid'), /invalid/)
})

test('failed Google reauthentication does not clear a valid Web session', () => {
  assert.equal(
    isCredentialConfirmationFailure(
      'POST',
      '/api/v1/auth/account-deletion/challenge',
      'A conta Google não corresponde à sessão autenticada.',
    ),
    true,
  )
  assert.equal(
    isCredentialConfirmationFailure('DELETE', '/api/v1/auth/account-deletion', 'Autenticacao obrigatoria.'),
    false,
  )
})

test('Web uses the authenticated self-deletion contract', async () => {
  const [web, authService] = await Promise.all([
    readFile(webApiClientPath, 'utf8'),
    readFile(new URL('../src/api/services/authService.js', import.meta.url), 'utf8'),
  ])
  for (const route of [
    '/auth/account-security',
    '/auth/account-deletion/challenge',
    '/auth/account-deletion',
  ]) {
    assert.ok(web.includes(route), `Web route missing: ${route}`)
  }
  assert.match(web, /accountDeletion:\s*`\$\{API_BASE\}\/auth\/account-deletion`/)
  assert.match(authService, /return api\(ENDPOINTS\.accountDeletionChallenge/)
  assert.match(authService, /api\(ENDPOINTS\.accountDeletionChallenge/)
  assert.match(authService, /api\(ENDPOINTS\.accountDeletion,/)
  assert.match(authService, /buildDeletionProofBody\(proof, codigoMfa\)/)
})

test('Web signup and legacy email verification keep their existing request shapes', async () => {
  const [webApi, webAuth] = await Promise.all([
    readFile(webApiClientPath, 'utf8'),
    readFile(new URL('../src/api/services/authService.js', import.meta.url), 'utf8'),
  ])
  assert.match(webApi, /signup:\s*`\$\{API_BASE\}\/usuarios`/)
  assert.match(webApi, /verifyEmail:\s*`\$\{API_BASE\}\/auth\/verify-email`/)
  assert.match(webAuth, /body: JSON\.stringify\(\{ email, code \}\)/)
  assert.match(webAuth, /api\(ENDPOINTS\.signup,/)
})
