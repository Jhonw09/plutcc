import { useState } from 'react'
import styles from './Plans.module.css'

const plans = [
  {
    id: 'free',
    name: 'Gratuito',
    monthlyPrice: 0,
    desc: 'Para começar a estudar',
    features: [
      { ok: true,  text: 'Acesso a videoaulas básicas' },
      { ok: true,  text: '50 questões por mês' },
      { ok: true,  text: 'Relatório básico de desempenho' },
      { ok: true,  text: 'App mobile' },
      { ok: false, text: 'Simulados completos' },
      { ok: false, text: 'Trilhas personalizadas com IA' },
      { ok: false, text: 'Conteúdo offline' },
      { ok: false, text: 'Suporte prioritário' },
    ],
    cta: 'Começar grátis',
    ctaStyle: 'outline',
  },
  {
    id: 'student',
    name: 'Estudante',
    monthlyPrice: 29.90,
    desc: 'Para quem quer ir mais longe',
    badge: 'Mais popular',
    features: [
      { ok: true, text: 'Todas as videoaulas' },
      { ok: true, text: 'Questões ilimitadas' },
      { ok: true, text: 'Simulados ENEM e vestibulares' },
      { ok: true, text: 'Trilhas personalizadas com IA' },
      { ok: true, text: 'Relatórios detalhados' },
      { ok: true, text: 'Conteúdo offline' },
      { ok: true, text: 'App mobile premium' },
      { ok: true, text: 'Suporte prioritário' },
    ],
    cta: 'Assinar agora',
    ctaStyle: 'primary',
  },
  {
    id: 'school',
    name: 'Escola',
    monthlyPrice: null,
    desc: 'Para instituições de ensino',
    features: [
      { ok: true, text: 'Tudo do plano Estudante' },
      { ok: true, text: 'Painel do professor' },
      { ok: true, text: 'Envio de tarefas e provas' },
      { ok: true, text: 'Relatórios por turma' },
      { ok: true, text: 'Integração com sistema escolar' },
      { ok: true, text: 'Treinamento para professores' },
      { ok: true, text: 'Gerente de conta dedicado' },
      { ok: true, text: 'SLA garantido' },
    ],
    cta: 'Falar com vendas',
    ctaStyle: 'accent',
  },
]

export default function Plans() {
  const [annual, setAnnual] = useState(false)

  return (
    <section className={styles.section} id="planos">
      <div className={styles.container}>
        <div className={styles.header}>
          <span className="section-tag blue">Planos</span>
          <h2 className="section-title">Escolha o plano ideal para você</h2>
          <p className="section-sub">Comece grátis e evolua conforme sua necessidade. Cancele quando quiser.</p>

          <div className={styles.toggle}>
            <span className={!annual ? styles.toggleOn : styles.toggleOff}>Mensal</span>
            <button
              className={styles.toggleSwitch}
              onClick={() => setAnnual(!annual)}
              aria-label="Alternar período"
            >
              <span className={styles.toggleThumb} style={{ transform: annual ? 'translateX(22px)' : 'translateX(2px)' }} />
            </button>
            <span className={annual ? styles.toggleOn : styles.toggleOff}>
              Anual
              <span className={styles.discount}>Economize 20%</span>
            </span>
          </div>
        </div>

        <div className={styles.grid}>
          {plans.map((p) => {
            const price = p.monthlyPrice === null ? null
              : annual && p.monthlyPrice > 0 ? p.monthlyPrice * 0.8
              : p.monthlyPrice
            return (
              <div key={p.id} className={`${styles.card} ${p.badge ? styles.featured : ''}`}>
                {p.badge && <div className={styles.badge}>{p.badge}</div>}

                <div className={styles.planTop}>
                  <h3 className={styles.planName}>{p.name}</h3>
                  <div className={styles.planPrice}>
                    {price === null ? (
                      <span className={styles.priceCustom}>Sob consulta</span>
                    ) : price === 0 ? (
                      <span className={styles.priceFree}>Grátis</span>
                    ) : (
                      <>
                        <span className={styles.priceCurrency}>R$</span>
                        <span className={styles.priceValue}>{price.toFixed(2).replace('.', ',')}</span>
                        <span className={styles.pricePer}>/mês</span>
                      </>
                    )}
                  </div>
                  {annual && price !== null && price > 0 && (
                    <span className={styles.annualNote}>Cobrado anualmente</span>
                  )}
                  <p className={styles.planDesc}>{p.desc}</p>
                </div>

                <ul className={styles.featureList}>
                  {p.features.map((f, i) => (
                    <li key={i} className={f.ok ? styles.featureOk : styles.featureNo}>
                      <span className={styles.featureIcon}>{f.ok ? '✓' : '✕'}</span>
                      {f.text}
                    </li>
                  ))}
                </ul>

                <a
                  href="#"
                  className={`${styles.cta} ${
                    p.ctaStyle === 'primary' ? styles.ctaPrimary :
                    p.ctaStyle === 'accent'  ? styles.ctaPrimary  :
                    styles.ctaOutline
                  }`}
                >
                  {p.cta}
                </a>
              </div>
            )
          })}
        </div>

        <p className={styles.note}>
          ✅ Sem taxa de adesão &nbsp;·&nbsp; ✅ Cancele quando quiser &nbsp;·&nbsp; ✅ Pagamento seguro
        </p>
      </div>
    </section>
  )
}
