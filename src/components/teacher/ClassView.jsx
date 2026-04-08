import { useState } from 'react'
import styles from './ClassView.module.css'

const SUBJECT_EMOJI = {
  Matemática: '📐', Português: '📖', Química: '⚗️', Biologia: '🧬',
  Física: '⚡', Geografia: '🌍', História: '📜', Inglês: '🌐',
  Artes: '🎨', Informática: '💻', Filosofia: '🧠', Sociologia: '⚖️',
}

const LEVEL_COLOR = { Fundamental: '#86efac', Médio: '#93c5fd', Vestibular: '#fbbf24' }

const TABS = [
  { id: 'mural',       label: '📋 Mural'      },
  { id: 'materiais',   label: '📚 Materiais'  },
  { id: 'atividades',  label: '📝 Atividades' },
  { id: 'membros',     label: '👥 Membros'    },
]

// ── Tab placeholder content ──────────────────────────────────────────────────

function MuralTab({ classe }) {
  return (
    <div className={styles.tabContent}>
      <div className={styles.postComposer}>
        <span className={styles.composerAvatar}>✏️</span>
        <div className={styles.composerInput}>Compartilhe algo com a turma…</div>
      </div>
      <div className={styles.emptyFeed}>
        <span className={styles.emptyIcon}>📭</span>
        <p className={styles.emptyTitle}>Nenhuma publicação ainda</p>
        <p className={styles.emptyDesc}>
          Use o campo acima para fazer um anúncio ou compartilhar material com os alunos de <strong>{classe.nome}</strong>.
        </p>
      </div>
    </div>
  )
}

function MateriaisTab() {
  return (
    <div className={styles.tabContent}>
      <div className={styles.emptyFeed}>
        <span className={styles.emptyIcon}>📂</span>
        <p className={styles.emptyTitle}>Nenhum material publicado</p>
        <p className={styles.emptyDesc}>Adicione arquivos, links ou vídeos para seus alunos acessarem.</p>
      </div>
    </div>
  )
}

function AtividadesTab() {
  return (
    <div className={styles.tabContent}>
      <div className={styles.emptyFeed}>
        <span className={styles.emptyIcon}>📝</span>
        <p className={styles.emptyTitle}>Nenhuma atividade criada</p>
        <p className={styles.emptyDesc}>Crie tarefas, provas ou questionários para esta turma.</p>
      </div>
    </div>
  )
}

function MembrosTab({ classe }) {
  return (
    <div className={styles.tabContent}>
      <div className={styles.membersSection}>
        <span className={styles.membersSectionLabel}>Professor</span>
        <div className={styles.memberRow}>
          <span className={styles.memberAvatar} style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
            P
          </span>
          <span className={styles.memberName}>Você</span>
          <span className={styles.memberBadge}>Professor</span>
        </div>
      </div>

      <div className={styles.membersSection}>
        <span className={styles.membersSectionLabel}>
          Alunos · {classe.alunoIds.length}
        </span>
        {classe.alunoIds.length === 0 ? (
          <div className={styles.emptyFeed} style={{ padding: '24px 0 8px' }}>
            <span className={styles.emptyIcon}>👤</span>
            <p className={styles.emptyTitle}>Nenhum aluno ainda</p>
            <p className={styles.emptyDesc}>
              Compartilhe o código <code className={styles.inlineCode}>{classe.codigo}</code> para que alunos entrem na turma.
            </p>
          </div>
        ) : (
          classe.alunoIds.map(id => (
            <div key={id} className={styles.memberRow}>
              <span className={styles.memberAvatar}>{String(id)[0]}</span>
              <span className={styles.memberName}>Aluno #{id}</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// ── Main component ───────────────────────────────────────────────────────────

export default function ClassView({ classe, onBack }) {
  const [activeTab, setActiveTab] = useState('mural')
  const isPublic = classe.tipo === 'PUBLICA'

  return (
    <div className={styles.wrap}>

      {/* ── Back breadcrumb ── */}
      <button className={styles.backBtn} onClick={onBack}>
        ← Voltar para todas as turmas
      </button>

      {/* ── Class header ── */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.headerIcon}>
            {SUBJECT_EMOJI[classe.disciplina] ?? '📚'}
          </span>
          <div className={styles.headerMeta}>
            <h2 className={styles.headerTitle}>{classe.nome}</h2>
            <div className={styles.headerPills}>
              <span
                className={styles.levelPill}
                style={{ color: LEVEL_COLOR[classe.nivel] ?? 'var(--text-muted)', borderColor: LEVEL_COLOR[classe.nivel] ?? 'var(--border)' }}
              >
                {classe.nivel}
              </span>
              <span className={`${styles.typePill} ${isPublic ? styles.public : styles.private}`}>
                {isPublic ? '🌐 Pública' : '🔒 Privada'}
              </span>
              {classe.descricao && (
                <span className={styles.descPill}>{classe.descricao}</span>
              )}
            </div>
          </div>
        </div>

        <div className={styles.headerRight}>
          <div className={styles.codeBox}>
            <span className={styles.codeLabel}>Código da turma</span>
            <code className={styles.code}>{classe.codigo}</code>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className={styles.tabs} role="tablist">
        {TABS.map(t => (
          <button
            key={t.id}
            role="tab"
            aria-selected={activeTab === t.id}
            className={`${styles.tab} ${activeTab === t.id ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Tab panels ── */}
      {activeTab === 'mural'      && <MuralTab      classe={classe} />}
      {activeTab === 'materiais'  && <MateriaisTab  />}
      {activeTab === 'atividades' && <AtividadesTab />}
      {activeTab === 'membros'    && <MembrosTab    classe={classe} />}

    </div>
  )
}
