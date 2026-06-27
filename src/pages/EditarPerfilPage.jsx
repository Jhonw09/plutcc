import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { isValidEmail } from '../utils/validation'
import { authService } from '../api/services/authService'
import DashboardLayout from '../components/dashboard/DashboardLayout'
import TeacherLayout from '../components/teacher/TeacherLayout'
import Icon from '../components/ui/Icon'
import { InputField } from '../components/ui/InputField'
import styles from './EditarPerfilPage.module.css'

const MAX_SIZE_MB = 2

function resizeImage(file, maxSize = 256) {
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const scale = Math.min(maxSize / img.width, maxSize / img.height, 1)
      canvas.width  = Math.round(img.width  * scale)
      canvas.height = Math.round(img.height * scale)
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/jpeg', 0.85))
    }
    img.src = url
  })
}

export default function EditarPerfilPage() {
  const { user, updateUser } = useAuth()
  const navigate = useNavigate()

  const isTeacher = user?.role === 'teacher'
  const Layout    = isTeacher ? TeacherLayout : DashboardLayout
  const backRoute = isTeacher ? '/teacher-dashboard/configuracoes' : '/dashboard/configuracoes'

  // ── Campos principais ──
  const [nome,    setNome]    = useState(user?.name  ?? '')
  const [senha,   setSenha]   = useState('')
  const [fotoUrl, setFotoUrl] = useState(user?.fotoUrl ?? null)
  const [saving,  setSaving]  = useState(false)
  const [error,   setError]   = useState('')
  const [success, setSuccess] = useState(false)
  const [imgError,setImgError]= useState('')

  // ── Fluxo de troca de e-mail ──
  const [emailNovo,    setEmailNovo]    = useState('')
  const [emailStep,    setEmailStep]    = useState('idle') // idle | sent | otp
  const [otp,          setOtp]          = useState('')
  const [emailLoading, setEmailLoading] = useState(false)
  const [emailError,   setEmailError]   = useState('')
  const [emailSuccess, setEmailSuccess] = useState('')

  const fileInputRef = useRef(null)
  const initials = nome.trim().charAt(0).toUpperCase() || '?'

  // ── Upload de foto ──
  async function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setImgError('')
    if (!file.type.startsWith('image/')) { setImgError('Selecione uma imagem válida (JPG, PNG, WebP).'); return }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) { setImgError(`A imagem deve ter no máximo ${MAX_SIZE_MB}MB.`); return }
    const base64 = await resizeImage(file, 256)
    setFotoUrl(base64)
  }

  function handleRemoveFoto() {
    setFotoUrl(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // ── Salvar nome + foto ──
  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!nome.trim()) return setError('O nome é obrigatório.')
    if (!user.isGoogleUser && !senha) return setError('Confirme sua senha para salvar.')
    setSaving(true)
    try {
      await updateUser({ nome: nome.trim(), email: user.email, senha, fotoUrl })
      setSenha('')
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err.message || 'Erro ao salvar perfil.')
    } finally {
      setSaving(false)
    }
  }

  // ── Etapa 1: solicitar troca de e-mail ──
  async function handleRequestEmailChange(e) {
    e.preventDefault()
    setEmailError('')
    if (!emailNovo.trim() || !isValidEmail(emailNovo.trim())) { setEmailError('Informe um e-mail válido.'); return }
    if (emailNovo.trim().toLowerCase() === user.email?.toLowerCase()) { setEmailError('O novo e-mail deve ser diferente do atual.'); return }
    setEmailLoading(true)
    try {
      await authService.requestEmailChange(user.id, emailNovo.trim())
      setEmailStep('sent')
      setEmailSuccess('')
      setEmailError('')
    } catch (err) {
      setEmailError(err.message || 'Erro ao solicitar troca.')
    } finally {
      setEmailLoading(false)
    }
  }

  // ── Etapa 2: verificar OTP ──
  async function handleVerifyOtp(e) {
    e.preventDefault()
    setEmailError('')
    if (!otp || otp.length !== 6) { setEmailError('Insira o código de 6 dígitos.'); return }
    setEmailLoading(true)
    try {
      await authService.verifyEmailChange(user.id, otp)
      setEmailStep('idle')
      setEmailNovo('')
      setOtp('')
      setEmailSuccess('E-mail alterado com sucesso! Faça login novamente para atualizar sua sessão.')
    } catch (err) {
      setEmailError(err.message || 'Código inválido.')
    } finally {
      setEmailLoading(false)
    }
  }

  return (
    <Layout>
      <div className={styles.page}>

        <div className={styles.header}>
          <button className={styles.backBtn} onClick={() => navigate(backRoute)}>
            <Icon name="chevronLeft" size={16} /> Voltar
          </button>
          <div>
            <h1 className={styles.title}>Editar perfil</h1>
            <p className={styles.sub}>Atualize suas informações pessoais.</p>
          </div>
        </div>

        <div className={styles.body}>

          {/* ── Avatar ── */}
          <div className={styles.avatarSection}>
            <div className={styles.avatarBig}>
              {fotoUrl
                ? <img src={fotoUrl} alt={nome} className={styles.avatarImg} referrerPolicy="no-referrer" />
                : <span>{initials}</span>
              }
            </div>
            <div className={styles.avatarInfo}>
              <p className={styles.avatarName}>{user?.name}</p>
              <p className={styles.avatarRole}>
                {user?.isGoogleUser ? 'Conta Google' : user?.tipoUsuario === 'PROFESSOR' ? 'Professor' : 'Aluno'}
              </p>
              {user?.isGoogleUser && (
                <span className={styles.googleBadge}>
                  <svg width="13" height="13" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  </svg>
                  Autenticado via Google
                </span>
              )}
              <div className={styles.avatarActions}>
                <button type="button" className={styles.uploadBtn} onClick={() => fileInputRef.current?.click()}>
                  <Icon name="upload" size={13} />
                  {fotoUrl ? 'Trocar foto' : 'Adicionar foto'}
                </button>
                {fotoUrl && (
                  <button type="button" className={styles.removeBtn} onClick={handleRemoveFoto}>
                    Remover
                  </button>
                )}
              </div>
              {imgError && <p className={styles.imgError}>{imgError}</p>}
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
            </div>
          </div>

          {/* ── Nome + senha ── */}
          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            <InputField
              id="nome" label="Nome completo"
              value={nome} onChange={e => { setNome(e.target.value); setError('') }}
              placeholder="Seu nome completo" disabled={saving}
            />

            {/* E-mail atual — somente leitura */}
            <div>
              <InputField
                id="emailAtual" label="E-mail atual"
                value={user?.email ?? ''} disabled
                placeholder="—"
              />
              {user?.isGoogleUser && (
                <p className={styles.fieldHint}>
                  <Icon name="lock" size={12} /> E-mail não pode ser alterado em contas Google.
                </p>
              )}
            </div>

            {!user.isGoogleUser && (
              <InputField
                id="senha" label="Confirme sua senha para salvar" type="password"
                value={senha} onChange={e => { setSenha(e.target.value); setError('') }}
                placeholder="••••••••" disabled={saving}
              />
            )}

            {error   && <p className={styles.errorMsg}><Icon name="alertCircle" size={13} /> {error}</p>}
            {success && <p className={styles.successMsg}><span>✓</span> Perfil atualizado com sucesso!</p>}

            <div className={styles.actions}>
              <button type="button" className={styles.cancelBtn} onClick={() => navigate(backRoute)} disabled={saving}>
                Cancelar
              </button>
              <button type="submit" className={`${styles.saveBtn} ${success ? styles.btnSaved : ''}`} disabled={saving}>
                {saving ? 'Salvando…' : success ? '✓ Salvo' : 'Salvar alterações'}
              </button>
            </div>
          </form>

          {/* ── Troca de e-mail (apenas usuários não-Google) ── */}
          {!user.isGoogleUser && (
            <div className={styles.emailChangeSection}>
              <h3 className={styles.sectionTitle}>Alterar e-mail</h3>
              <p className={styles.sectionSub}>
                A troca de e-mail exige confirmação em 2 etapas por segurança.
              </p>

              {emailSuccess && (
                <p className={styles.successMsg} style={{ marginBottom: 8 }}>
                  <span>✓</span> {emailSuccess}
                </p>
              )}

              {/* Etapa 1 — solicitar */}
              {emailStep === 'idle' && (
                <form onSubmit={handleRequestEmailChange} className={styles.form} noValidate>
                  <InputField
                    id="emailNovo" label="Novo e-mail"
                    type="email" value={emailNovo}
                    onChange={e => { setEmailNovo(e.target.value); setEmailError('') }}
                    placeholder="novo@email.com" disabled={emailLoading}
                  />
                  {emailError && <p className={styles.errorMsg}><Icon name="alertCircle" size={13} /> {emailError}</p>}
                  <div className={styles.actions}>
                    <button type="submit" className={styles.saveBtn} disabled={emailLoading}>
                      {emailLoading ? 'Enviando…' : 'Solicitar troca'}
                    </button>
                  </div>
                </form>
              )}

              {/* Etapa 1b — aguardando confirmação no e-mail atual */}
              {emailStep === 'sent' && (
                <div className={styles.stepBox}>
                  <p className={styles.stepText}>
                    ✉️ Enviamos um aviso para <strong>{user.email}</strong>.<br />
                    Clique no link do e-mail para continuar. Após confirmar, volte aqui e insira o código enviado para <strong>{emailNovo}</strong>.
                  </p>
                  <button type="button" className={styles.uploadBtn} style={{ marginTop: 12 }}
                    onClick={() => { setEmailStep('otp'); setEmailError('') }}>
                    Já confirmei, inserir código
                  </button>
                  <button type="button" className={styles.removeBtn} style={{ marginTop: 8, display: 'block' }}
                    onClick={() => { setEmailStep('idle'); setEmailError('') }}>
                    Cancelar
                  </button>
                </div>
              )}

              {/* Etapa 2 — OTP */}
              {emailStep === 'otp' && (
                <form onSubmit={handleVerifyOtp} className={styles.form} noValidate>
                  <InputField
                    id="otp" label={`Código enviado para ${emailNovo}`}
                    type="text" inputMode="numeric"
                    value={otp}
                    onChange={e => { setOtp(e.target.value.replace(/\D/g, '').slice(0, 6)); setEmailError('') }}
                    placeholder="000000" disabled={emailLoading}
                  />
                  {emailError && <p className={styles.errorMsg}><Icon name="alertCircle" size={13} /> {emailError}</p>}
                  <div className={styles.actions}>
                    <button type="button" className={styles.cancelBtn}
                      onClick={() => { setEmailStep('idle'); setOtp(''); setEmailError('') }}>
                      Cancelar
                    </button>
                    <button type="submit" className={styles.saveBtn} disabled={emailLoading || otp.length !== 6}>
                      {emailLoading ? 'Verificando…' : 'Confirmar'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

        </div>
      </div>
    </Layout>
  )
}
