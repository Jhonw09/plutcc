import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import styles from './PublicHelpPage.module.css'

const TOPICS = [
  {
    icon: '🎓',
    title: 'O que é o StudyConnect?',
    body: 'O StudyConnect é uma plataforma de estudos que conecta alunos e professores. Alunos podem se matricular em trilhas de aprendizado criadas por professores, acompanhar seu progresso e tirar dúvidas diretamente nas aulas.',
  },
  {
    icon: '🚀',
    title: 'Como começar como aluno',
    body: 'Crie sua conta gratuitamente, confirme seu e-mail e faça login. Explore as trilhas disponíveis, matricule-se nas que interessam e comece a estudar no seu próprio ritmo.',
  },
  {
    icon: '📚',
    title: 'Como começar como professor',
    body: 'Crie sua conta selecionando "Sou Professor", confirme seu e-mail e acesse seu painel. Crie suas trilhas, adicione aulas e compartilhe conhecimento com alunos de todo o Brasil.',
  },
  {
    icon: '🗺️',
    title: 'Trilhas de aprendizado',
    body: 'As trilhas são sequências de aulas organizadas por professores em torno de um tema ou disciplina. Cada trilha tem seu próprio ritmo e você pode acompanhar seu progresso a qualquer momento.',
  },
]

export default function PublicHelpPage() {
  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.hero}>
          <h1 className={styles.heroTitle}>Como podemos ajudar?</h1>
          <p className={styles.heroSub}>Informações básicas sobre o StudyConnect para você começar.</p>
        </div>

        <div className={styles.container}>
          <div className={styles.grid}>
            {TOPICS.map(t => (
              <div key={t.title} className={styles.card}>
                <span className={styles.cardIcon}>{t.icon}</span>
                <h2 className={styles.cardTitle}>{t.title}</h2>
                <p className={styles.cardBody}>{t.body}</p>
              </div>
            ))}
          </div>

          <div className={styles.cta}>
            <p>Já tem conta? Acesse a central de ajuda completa com FAQ e suporte técnico dentro da plataforma.</p>
            <div className={styles.ctaActions}>
              <Link to="/login" className={styles.ctaBtn}>Fazer login</Link>
              <Link to="/contato" className={styles.ctaLink}>Falar com suporte</Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
