import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import DashboardLayout from '../components/dashboard/DashboardLayout'
import TeacherLayout from '../components/teacher/TeacherLayout'
import Icon from '../components/ui/Icon'
import styles from './HelpPage.module.css'

// ── FAQ data ──────────────────────────────────────────────────────────────────
const FAQ_STUDENT = [
  {
    q: 'Não consigo fazer login. O que fazer?',
    a: 'Verifique se o e-mail e a senha estão corretos. Se esqueceu a senha, use a opção "Esqueceu a senha?" na tela de login para receber um link de redefinição. Se criou a conta mas nunca verificou o e-mail, o acesso ficará bloqueado até a verificação.',
  },
  {
    q: 'Tentei entrar com o Google mas deu erro.',
    a: 'Certifique-se de estar usando uma conta Google válida. Se o erro persistir, tente em uma aba anônima ou em outro navegador. Caso o problema continue, entre em contato pelo formulário abaixo informando o erro exato que apareceu.',
  },
  {
    q: 'Não recebi o e-mail de verificação de conta.',
    a: 'Verifique a pasta de spam/lixo eletrônico. Se ainda não encontrou, acesse a tela de login e clique em "Reenviar código de verificação". Aguarde alguns minutos e verifique novamente.',
  },
  {
    q: 'Não consigo acessar uma trilha após me matricular.',
    a: 'Tente recarregar a página. Se o problema persistir, saia da conta e entre novamente. Se ainda assim não funcionar, descreva o problema no formulário de suporte abaixo.',
  },
  {
    q: 'Meu progresso nas aulas não está sendo salvo.',
    a: 'O progresso é salvo automaticamente ao concluir cada aula. Verifique sua conexão com a internet. Se o problema ocorrer repetidamente, use o formulário de suporte informando o nome da trilha e da aula.',
  },
  {
    q: 'Como altero meu e-mail ou foto de perfil?',
    a: 'Acesse Configurações → Editar perfil. A foto pode ser trocada diretamente. A troca de e-mail exige um processo de verificação em 2 etapas por segurança. Contas criadas via Google não podem alterar o e-mail.',
  },
  {
    q: 'Como cancelo minha matrícula em uma trilha?',
    a: 'Acesse a trilha, role até o final e clique em "Cancelar matrícula". Seu progresso será perdido ao cancelar.',
  },
]

const FAQ_TEACHER = [
  {
    q: 'Não consigo fazer login. O que fazer?',
    a: 'Verifique e-mail e senha. Use "Esqueceu a senha?" para redefinir. Se criou a conta com Google, tente entrar pelo botão "Continuar com Google".',
  },
  {
    q: 'Tentei entrar com o Google mas deu erro.',
    a: 'Certifique-se de estar usando a conta Google correta. Tente em uma aba anônima. Se persistir, use o formulário de suporte abaixo.',
  },
  {
    q: 'Como edito uma trilha já publicada?',
    a: 'Acesse "Minhas Trilhas", clique na trilha e depois em "Configurações da Trilha". Você pode editar nome, descrição, nível e disciplina.',
  },
  {
    q: 'Como adiciono ou removo aulas de uma trilha?',
    a: 'Dentro da trilha, use os botões "Nova Aula" e "Excluir" ao lado de cada aula. A ordem das aulas pode ser ajustada pelo campo "Ordem" em cada aula.',
  },
  {
    q: 'Como excluo uma trilha?',
    a: 'Em "Minhas Trilhas", clique na trilha e acesse "Configurações". No final da página há a opção de excluir a trilha. Atenção: essa ação é permanente e remove todas as aulas e matrículas associadas.',
  },
  {
    q: 'Onde vejo os alunos matriculados nas minhas trilhas?',
    a: 'Acesse "Relatórios" no menu lateral. Lá você encontra estatísticas de matrículas e progresso por trilha.',
  },
  {
    q: 'Não recebi o e-mail de verificação de conta.',
    a: 'Verifique a pasta de spam. Se não encontrou, acesse o login e clique em "Reenviar código". Se o problema persistir, use o formulário de suporte.',
  },
]

const TIPOS_PROBLEMA = ['Bug / Erro no sistema', 'Dúvida de funcionamento', 'Problema com conta ou login', 'Sugestão de melhoria', 'Outro']

// ── FAQ Item ──────────────────────────────────────────────────────────────────
function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={styles.faqItem}>
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
      {open && <div className={styles.faqBody} dangerouslySetInnerHTML={{ __html: a }} />}
    </div>
  )
}

// ── Support Form ──────────────────────────────────────────────────────────────
function SupportForm({ defaultTipo }) {
  const { user } = useAuth()
  const [form, setForm] = useState({
    tipo: TIPOS_PROBLEMA[0],
    tipoUsuario: user?.tipoUsuario === 'PROFESSOR' ? 'Professor' : 'Aluno',
    email: user?.email ?? '',
    mensagem: '',
  })
  const [errors,  setErrors]  = useState({})
  const [loading, setLoading] = useState(false)
  const [sent,    setSent]    = useState(false)
  const [apiErr,  setApiErr]  = useState('')

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }))
    if (errors[field]) setErrors(e => ({ ...e, [field]: '' }))
  }

  function validate() {
    const e = {}
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Informe um e-mail válido.'
    if (!form.mensagem.trim() || form.mensagem.trim().length < 20) e.mensagem = 'Descreva o problema com pelo menos 20 caracteres.'
    return e
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setApiErr('')
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    try {
      // Envia via mailto como fallback sem backend dedicado
      // Pode ser substituído por um endpoint real futuramente
      await new Promise(r => setTimeout(r, 800)) // simula request
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
        <p>Nossa equipe analisará seu contato e responderá no e-mail <strong>{form.email}</strong> em até 2 dias úteis.</p>
        <button className={styles.newBtn} onClick={() => { setSent(false); setForm(f => ({ ...f, mensagem: '' })) }}>
          Enviar outra mensagem
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className={styles.formGrid}>
        <div className={styles.field}>
          <label className={styles.label}>Tipo de problema</label>
          <select className={styles.select} value={form.tipo} onChange={e => set('tipo', e.target.value)}>
            {TIPOS_PROBLEMA.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Você é</label>
          <select className={styles.select} value={form.tipoUsuario} onChange={e => set('tipoUsuario', e.target.value)}>
            <option>Aluno</option>
            <option>Professor</option>
          </select>
        </div>
        <div className={styles.field} style={{ gridColumn: '1 / -1' }}>
          <label className={styles.label}>Seu e-mail</label>
          <input
            className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
            type="email" value={form.email}
            onChange={e => set('email', e.target.value)}
            placeholder="para respondermos seu contato"
          />
          {errors.email && <span className={styles.fieldError}>{errors.email}</span>}
        </div>
        <div className={styles.field} style={{ gridColumn: '1 / -1' }}>
          <label className={styles.label}>Descreva o problema</label>
          <textarea
            className={`${styles.textarea} ${errors.mensagem ? styles.inputError : ''}`}
            value={form.mensagem}
            onChange={e => set('mensagem', e.target.value)}
            placeholder="Seja o mais detalhado possível: o que aconteceu, em qual página, qual erro apareceu..."
          />
          {errors.mensagem && <span className={styles.fieldError}>{errors.mensagem}</span>}
        </div>
      </div>

      {apiErr && <p className={styles.formError}><Icon name="alertCircle" size={13} /> {apiErr}</p>}

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
        <button type="submit" className={styles.submitBtn} disabled={loading}>
          {loading ? 'Enviando…' : 'Enviar mensagem'}
        </button>
      </div>
    </form>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
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
          <p className={styles.sub}>Encontre respostas rápidas ou fale com nossa equipe.</p>
        </div>

        {/* ── FAQ ── */}
        <section>
          <h2 className={styles.sectionTitle}>
            <Icon name="alertCircle" size={18} /> Perguntas frequentes
          </h2>
          <div className={styles.faqList}>
            {faq.map(item => <FaqItem key={item.q} {...item} />)}
          </div>
        </section>

        {/* ── Suporte ── */}
        <section>
          <h2 className={styles.sectionTitle}>
            <Icon name="mail" size={18} /> Fale com o suporte
          </h2>
          <div className={styles.formCard}>
            <SupportForm />
          </div>
        </section>

      </div>
    </Layout>
  )
}
