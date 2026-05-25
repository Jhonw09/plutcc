import { useState } from 'react'
import Icon from '../components/ui/Icon'
import styles from './OnboardingPerfilPage.module.css'

const DISCIPLINAS = [
  'Matemática','Português','Física','Química','Biologia',
  'História','Geografia','Inglês','Filosofia','Informática',
]

const STEPS = [
  {
    id: 'objetivo',
    icon: 'target',
    title: 'Qual é o seu objetivo?',
    sub: 'Isso nos ajuda a personalizar sua experiência.',
    type: 'single',
    options: [
      { value: 'ENEM',        label: 'ENEM',              emoji: '📝' },
      { value: 'VESTIBULAR',  label: 'Vestibular',        emoji: '🎓' },
      { value: 'REFORCO',     label: 'Reforço escolar',   emoji: '📚' },
      { value: 'FACULDADE',   label: 'Faculdade',         emoji: '🏛️' },
    ],
  },
  {
    id: 'nivel',
    icon: 'barChart',
    title: 'Qual é o seu nível atual?',
    sub: 'Seja honesto — isso ajuda a encontrar trilhas certas.',
    type: 'single',
    options: [
      { value: 'BASICO',        label: 'Básico',        emoji: '🌱' },
      { value: 'INTERMEDIARIO', label: 'Intermediário', emoji: '🌿' },
      { value: 'AVANCADO',      label: 'Avançado',      emoji: '🌳' },
    ],
  },
  {
    id: 'horasSemana',
    icon: 'clock',
    title: 'Quantas horas por semana você pode estudar?',
    sub: 'Seja realista para montar uma meta alcançável.',
    type: 'single',
    options: [
      { value: 1,  label: 'Menos de 1h',  emoji: '⚡' },
      { value: 3,  label: '1h a 3h',      emoji: '🕐' },
      { value: 5,  label: '3h a 5h',      emoji: '🕓' },
      { value: 10, label: 'Mais de 5h',   emoji: '🔥' },
    ],
  },
  {
    id: 'ritmo',
    icon: 'zap',
    title: 'Como você prefere estudar?',
    sub: 'Seu ritmo define como vamos sugerir conteúdo.',
    type: 'single',
    options: [
      { value: 'LEVE',     label: 'Leve — poucos conteúdos por vez',      emoji: '🐢' },
      { value: 'MODERADO', label: 'Moderado — equilíbrio entre quantidade e qualidade', emoji: '🚶' },
      { value: 'INTENSO',  label: 'Intenso — quanto mais, melhor',        emoji: '🏃' },
    ],
  },
  {
    id: 'interesses',
    icon: 'bookOpen',
    title: 'Quais matérias você mais gosta?',
    sub: 'Selecione quantas quiser.',
    type: 'multi',
    options: DISCIPLINAS.map(d => ({ value: d, label: d })),
  },
  {
    id: 'dificuldades',
    icon: 'alertCircle',
    title: 'Em quais matérias você tem mais dificuldade?',
    sub: 'Vamos priorizar trilhas que te ajudem a superar.',
    type: 'multi',
    options: DISCIPLINAS.map(d => ({ value: d, label: d })),
  },
]

function deriveMetaSemanal(horasSemana, ritmo) {
  const base = horasSemana <= 1 ? 2 : horasSemana <= 3 ? 4 : horasSemana <= 5 ? 6 : 10
  if (ritmo === 'INTENSO')  return base + 2
  if (ritmo === 'LEVE')     return Math.max(1, base - 2)
  return base
}

export default function OnboardingPerfilPage({ firstName, onComplete }) {
  const [step,    setStep]    = useState(0)
  const [answers, setAnswers] = useState({})
  const [saving,  setSaving]  = useState(false)

  const current = STEPS[step]
  const total   = STEPS.length
  const pct     = Math.round(((step) / total) * 100)

  function select(value) {
    if (current.type === 'single') {
      setAnswers(prev => ({ ...prev, [current.id]: value }))
    } else {
      setAnswers(prev => {
        const arr = prev[current.id] ?? []
        return {
          ...prev,
          [current.id]: arr.includes(value)
            ? arr.filter(v => v !== value)
            : [...arr, value],
        }
      })
    }
  }

  function isSelected(value) {
    if (current.type === 'single') return answers[current.id] === value
    return (answers[current.id] ?? []).includes(value)
  }

  const canAdvance = current.type === 'single'
    ? answers[current.id] != null
    : (answers[current.id]?.length ?? 0) > 0

  async function handleFinish() {
    setSaving(true)
    const metaSemanal = deriveMetaSemanal(answers.horasSemana, answers.ritmo)
    await onComplete({
      objetivo:     answers.objetivo,
      nivel:        answers.nivel,
      horasSemana:  answers.horasSemana,
      metaSemanal,
      ritmo:        answers.ritmo,
      interesses:   (answers.interesses  ?? []).join(','),
      dificuldades: (answers.dificuldades ?? []).join(','),
    })
    setSaving(false)
  }

  return (
    <div className={styles.screen}>
      <div className={styles.logo}>
        <svg width="140" height="22" viewBox="0 0 160 26" fill="none">
          <text x="0"  y="21" fontFamily="Inter,sans-serif" fontWeight="900" fontSize="22" fill="#FFFFFF">Study</text>
          <text x="68" y="21" fontFamily="Inter,sans-serif" fontWeight="900" fontSize="22" fill="#6C5CE7">Connect</text>
        </svg>
      </div>

      <div className={styles.progressBar}>
        <div className={styles.progressFill} style={{ width: `${pct}%` }} />
      </div>

      <div className={styles.wrap}>
        <div className={styles.card} key={step}>
          <div className={styles.cardIcon}>
            <Icon name={current.icon} size={26} />
          </div>

          <p className={styles.stepLabel}>Passo {step + 1} de {total}</p>

          {step === 0 && (
            <p className={styles.welcome}>Olá, <span className={styles.accent}>{firstName}</span> 👋</p>
          )}

          <h2 className={styles.title}>{current.title}</h2>
          <p className={styles.sub}>{current.sub}</p>

          <div className={`${styles.options} ${current.type === 'multi' ? styles.optionsGrid : ''}`}>
            {current.options.map(opt => (
              <button
                key={opt.value}
                className={`${styles.option} ${isSelected(opt.value) ? styles.optionActive : ''}`}
                onClick={() => select(opt.value)}
              >
                {opt.emoji && <span className={styles.optionEmoji}>{opt.emoji}</span>}
                <span className={styles.optionLabel}>{opt.label}</span>
                {isSelected(opt.value) && (
                  <span className={styles.optionCheck}><Icon name="check" size={12} /></span>
                )}
              </button>
            ))}
          </div>

          <div className={styles.nav}>
            {step > 0 && (
              <button className={styles.btnBack} onClick={() => setStep(s => s - 1)}>
                ← Voltar
              </button>
            )}
            {step < total - 1 ? (
              <button
                className={styles.btnNext}
                onClick={() => setStep(s => s + 1)}
                disabled={!canAdvance}
              >
                Próximo →
              </button>
            ) : (
              <button
                className={styles.btnFinish}
                onClick={handleFinish}
                disabled={!canAdvance || saving}
              >
                {saving ? 'Salvando…' : <><Icon name="sparkles" size={14} /> Começar a estudar</>}
              </button>
            )}
          </div>
        </div>
      </div>

      <p className={styles.counter}>{step + 1} de {total}</p>
    </div>
  )
}
