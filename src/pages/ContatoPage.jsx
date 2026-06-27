import { useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import styles from './PublicHelpPage.module.css'

export default function ContatoPage() {
  const [form, setForm]   = useState({ nome: '', email: '', mensagem: '' })
  const [errors, setErrors] = useState({})
  const [sent, setSent]   = useState(false)
  const [loading, setLoading] = useState(false)

  function set(f, v) { setForm(p => ({ ...p, [f]: v })); if (errors[f]) setErrors(e => ({ ...e, [f]: '' })) }

  function validate() {
    const e = {}
    if (!form.nome.trim()) e.nome = 'Informe seu nome.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'E-mail inválido.'
    if (form.mensagem.trim().length < 20) e.mensagem = 'Mínimo 20 caracteres.'
    return e
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    await new Promise(r => setTimeout(r, 700))
    setLoading(false)
    setSent(true)
  }

  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.hero}>
          <h1 className={styles.heroTitle}>Entre em contato</h1>
          <p className={styles.heroSub}>Tem alguma dúvida ou sugestão? Fale com a gente.</p>
        </div>

        <div className={styles.container}>
          <div className={styles.contactCard}>
            {sent ? (
              <div className={styles.sentBox}>
                <span style={{ fontSize: 40 }}>✅</span>
                <h2>Mensagem enviada!</h2>
                <p>Responderemos no e-mail <strong>{form.email}</strong> em até 2 dias úteis.</p>
                <Link to="/" className={styles.ctaBtn} style={{ display: 'inline-block', marginTop: 8 }}>Voltar ao início</Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className={styles.contactForm}>
                <div className={styles.contactField}>
                  <label className={styles.contactLabel}>Nome</label>
                  <input className={`${styles.contactInput} ${errors.nome ? styles.inputErr : ''}`}
                    value={form.nome} onChange={e => set('nome', e.target.value)} placeholder="Seu nome" />
                  {errors.nome && <span className={styles.fieldErr}>{errors.nome}</span>}
                </div>
                <div className={styles.contactField}>
                  <label className={styles.contactLabel}>E-mail</label>
                  <input className={`${styles.contactInput} ${errors.email ? styles.inputErr : ''}`}
                    type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="seu@email.com" />
                  {errors.email && <span className={styles.fieldErr}>{errors.email}</span>}
                </div>
                <div className={styles.contactField}>
                  <label className={styles.contactLabel}>Mensagem</label>
                  <textarea className={`${styles.contactTextarea} ${errors.mensagem ? styles.inputErr : ''}`}
                    value={form.mensagem} onChange={e => set('mensagem', e.target.value)}
                    placeholder="Como podemos ajudar?" />
                  {errors.mensagem && <span className={styles.fieldErr}>{errors.mensagem}</span>}
                </div>
                <button type="submit" className={styles.ctaBtn} disabled={loading}>
                  {loading ? 'Enviando…' : 'Enviar mensagem'}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
