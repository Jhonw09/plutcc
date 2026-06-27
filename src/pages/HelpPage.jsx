import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import DashboardLayout from '../components/dashboard/DashboardLayout'
import TeacherLayout from '../components/teacher/TeacherLayout'
import Icon from '../components/ui/Icon'
import styles from './HelpPage.module.css'

const FAQ_STUDENT = [
  {
    q: 'Não consigo fazer login. O que fazer?',
    a: 'Verifique se o e-mail e a senha estão corretos. Se esqueceu a senha, use a opção "Esqueceu a senha?" na tela de login para receber um link de redefinição. Se seu e-mail nunca foi verificado, o acesso ficará bloqueado até a verificação.',
  },
  {
    q: 'Tentei entrar com o Google mas deu erro.',
    a: 'Certifique-se de estar usando uma conta Google válida. Tente em uma aba anônima ou em outro navegador. Se o erro persistir, entre em contato pelo formulário abaixo informando o erro exato que apareceu.',
  },
  {
    q: 'Não recebi o e-mail de verificação.',
    a: 'Verifique a pasta de spam/lixo eletrônico. Se não encontrou, acesse a tela de login e clique em "Reenviar código de verificação". Aguarde alguns minutos e verifique novamente.',
  },
  {
    q: 'Esqueci minha senha. Como redefinir?',
    a: 'Na tela de login, clique em "Esqueceu a senha?". Informe seu e-mail cadastrado e você receberá um link para criar uma nova senha. Contas criadas pelo Google não possuem senha local.',
  },
  {
    q: 'Não consigo acessar uma trilha após me matricular.',
    a: 'Tente recarregar a página (F5). Se o problema persistir, saia da conta e entre novamente. Se ainda assim não funcionar, descreva o problema no formulário de suporte abaixo.',
  },
  {
    q: 'Meu progresso nas aulas não está sendo salvo.',
    a: 'O progresso é salvo automaticamente ao concluir cada aula. Verifique sua conexão com a internet. Se o problema ocorrer repetidamente, use o formulário de suporte informando o nome da trilha e da aula.',
  },
  {
    q: 'Como altero meu e-mail ou foto de perfil?',
    a: 'Acesse Configurações → Editar perfil. A foto pode ser trocada diretamente. A troca de e-mail exige verificação em 2 etapas por segurança. Contas criadas via Google não podem alterar o e-mail.',
  },
  {
    q: 'Como cancelo minha matrícula em uma trilha?',
    a: 'Acesse a trilha, role até o final e clique em "Cancelar matrícula". Atenção: seu progresso será perdido ao cancelar.',
  },
]

const FAQ_TEACHER = [
  {
    q: 'Não consigo fazer login. O que fazer?',
    a: 'Verifique e-mail e senha. Use "Esqueceu a senha?" para redefinir. Se criou a conta com Google, entre pelo botão "Continuar com Google".',
  },
  {
    q: 'Tentei entrar com o Google mas deu erro.',
    a: 'Certifique-se de estar usando a conta Google correta. Tente em uma aba anônima. Se persistir, use o formulário de suporte abaixo informando o erro exato.',
  },
  {
    q: 'Não recebi o e-mail de verificação.',
    a: 'Verifique a pasta de spam. Se não encontrou, acesse a tela de login e clique em "Reenviar código". Se o problema persistir, use o formulário de suporte.',
  },
  {
    q: 'Esqueci minha senha. Como redefinir?',
    a: 'Na tela de login, clique em "Esqueceu a senha?" e informe seu e-mail. Você receberá um link de redefinição. Contas Google não possuem senha local.',
  },
  {
    q: 'Como edito uma trilha já publicada?',
    a: 'Acesse "Minhas Trilhas", clique na trilha e depois em "Configurações da Trilha". Você pode editar nome, descrição, nível e disciplina.',
  },
  {
    q: 'Como adiciono ou removo aulas de uma trilha?',
    a: 'Dentro da trilha, use os botões "Nova Aula" e "Excluir" ao lado de cada aula. A ordem pode ser ajustada pelo campo "Ordem" em cada aula.',
  },
  {
    q: 'Como excluo uma trilha?',
    a: 'Em "Minhas Trilhas", clique na trilha e acesse "Configurações". No final da página há a opção de excluir. Atenção: essa ação é permanente e remove todas as aulas e matrículas associadas.',
  },
  {
    q: 'Onde vejo os alunos matriculados nas minhas trilhas?',
    a: 'Acesse "Relatórios" no menu lateral. Lá você encontra estatísticas de matrículas e progresso por trilha.',
  },
]

const TIPOS_PROBLEMA = [
  'Bug / Erro no sistema',
  'Dúvida de funcionamento',
  'Problema com conta ou login',
  'Sugestão de melhoria',
  'Outro',
]

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`${styles.faqItem} ${open ? styles.faqItemOpen : ''}`}>
      <button className={styles.faqBtn} onClick={() => setOpen(o => !o)} aria-expanded={open}>
        <span className={styles.faqQ}>{q}</span>
        <svg
          className={`${styles.faqChevron} ${open ? styles.faqChevronOpen : ''}`}
          width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6"/>
        </svg>
      </button>
      {open && <div className={styles.faqBody}>{a}</div>}
    </div>
  )
}

const RATE_LIMIT_MS = 5 * 60 * 1000 // 5 minutos

function getRateLimitKey(userId) {
  return `support_last_sent_${userId}`
}

function getRemainingCooldown(userId) {
  const last = localStorage.getItem(getRateLimitKey(userId))
  if (!last) return 0
  const diff = RATE_LIMIT_MS - (Date.now() - Number(last))
  return diff > 0 ? diff : 0
}

function SupportForm() {
  const { user } = useAuth()
  const [form, setForm]     = useState({ tipo: TIPOS_PROBLEMA[0], mensagem: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [sent, setSent]     = useState(false)
  const [apiErr, setApiErr] = useState('')
  const [cooldown, setCooldown] = useState(() => getRemainingCooldown(user?.id))

  useEffect(() => {
    if (!cooldown) return
    const interval = setInterval(() => {
      const remaining = getRemainingCooldown(user?.id)
      setCooldown(remaining)
      if (!remaining) clearInterval(interval)
    }, 1000)
    return () => clearInterval(interval)
  }, [cooldown, user?.id])

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }))
    if (errors[field]) setErrors(e => ({ ...e, [field]: '' }))
  }

  function validate() {
    const e = {}
    if (!form.mensagem.trim() || form.mensagem.trim().length < 20)
      e.mensagem = 'Descreva o problema com pelo menos 20 caracteres.'
    return e
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setApiErr('')

    const remaining = getRemainingCooldown(user?.id)
    if (remaining > 0) {
      const mins = Math.ceil(remaining / 60000)
      setApiErr(`Aguarde ${mins} min antes de enviar outra mensagem.`)
      return
    }

    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    try {
      await new Promise(r => setTimeout(r, 800))
      localStorage.setItem(getRateLimitKey(user?.id), String(Date.now()))
      setCooldown(RATE_LIMIT_MS)
      setSent(true)
    } catch {
      setApiErr('Não foi possível enviar. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className={styles.formSuccess}>
        <span className={styles.successIcon}>✅</span>
        <h3>Mensagem enviada!</h3>
        <p>Nossa equipe responderá no e-mail <strong>{user?.email}</strong> em até 2 dias úteis.</p>
      </div>
    )
  }

  const cooldownMins = Math.ceil(cooldown / 60000)

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className={styles.formGrid}>
        <div className={styles.field} style={{ gridColumn: '1 / -1' }}>
          <label className={styles.label}>Tipo de problema</label>
          <select className={styles.select} value={form.tipo} onChange={e => set('tipo', e.target.value)}>
            {TIPOS_PROBLEMA.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div className={styles.field} style={{ gridColumn: '1 / -1' }}>
          <label className={styles.label}>Descreva o problema</label>
          <textarea
            className={`${styles.textarea} ${errors.mensagem ? styles.inputError : ''}`}
            value={form.mensagem}
            onChange={e => set('mensagem', e.target.value)}
            placeholder="Seja detalhado: o que aconteceu, em qual página, qual erro apareceu..."
          />
          {errors.mensagem && <span className={styles.fieldError}>{errors.mensagem}</span>}
        </div>
      </div>

      {apiErr && <p className={styles.formError}><Icon name="alertCircle" size={13} /> {apiErr}</p>}

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
        <button type="submit" className={styles.submitBtn} disabled={loading || cooldown > 0}>
          {cooldown > 0 ? `Aguarde ${cooldownMins}min` : loading ? 'Enviando…' : 'Enviar mensagem'}
        </button>
      </div>
    </form>
  )
}

export default function HelpPage() {
  const { user } = useAuth()
  const isTeacher = user?.role === 'teacher'
  const Layout = isTeacher ? TeacherLayout : DashboardLayout
  const faq    = isTeacher ? FAQ_TEACHER   : FAQ_STUDENT

  return (
    <Layout>
      <div className={styles.page}>

        <div className={styles.header}>
          <h1 className={styles.title}>Central de Ajuda</h1>
          <p className={styles.sub}>Encontre respostas rápidas ou fale diretamente com nossa equipe.</p>
        </div>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}><Icon name="alertCircle" size={17} /></span>
            <div>
              <h2 className={styles.sectionTitle}>Perguntas frequentes</h2>
              <p className={styles.sectionSub}>Respostas para os problemas mais comuns</p>
            </div>
          </div>
          <div className={styles.faqList}>
            {faq.map(item => <FaqItem key={item.q} {...item} />)}
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}><Icon name="mail" size={17} /></span>
            <div>
              <h2 className={styles.sectionTitle}>Fale com o suporte</h2>
              <p className={styles.sectionSub}>Não encontrou o que precisava? Nossa equipe responde em até 2 dias úteis</p>
            </div>
          </div>
          <div className={styles.formCard}>
            <SupportForm />
          </div>
        </section>

      </div>
    </Layout>
  )
}
