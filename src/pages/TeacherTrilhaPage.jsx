import { useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import TeacherLayout from '../components/teacher/TeacherLayout'
import AulaEditor from '../components/teacher/AulaEditor'
import Icon from '../components/ui/Icon'
import { useAulas } from '../hooks/useAulas'
import styles from './TeacherTrilhaPage.module.css'

const SUBJECT_EMOJI = {
  Matemática: '📐', Português: '📖', Química: '⚗️', Biologia: '🧬',
  Física: '⚡', Geografia: '🌍', História: '📜', Inglês: '🌐',
  Artes: '🎨', Informática: '💻', Filosofia: '🧠', Sociologia: '⚖️',
}

const TIPO_LABEL = { texto: '📄 Texto', video: '🎥 Vídeo' }

const BLOCK_LABEL = {
  explicacao:   '📖 Explicação',
  video:        '🎥 Vídeo',
  questionario: '❓ Questionário',
  texto_livre:  '✏️ Texto livre',
}

export default function TeacherTrilhaPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { state: trilha } = useLocation()

  const { aulas, loading, error, createAula, updateAula, deleteAula } = useAulas(id)

  const [editorOpen, setEditorOpen] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [saving, setSaving]         = useState(false)

  if (!trilha) {
    return (
      <TeacherLayout>
        <div className={styles.centered}>
          <span>⚠️</span>
          <p>Trilha não encontrada.</p>
          <button className={styles.backBtn} onClick={() => navigate('/teacher-dashboard')}>
            Voltar ao dashboard
          </button>
        </div>
      </TeacherLayout>
    )
  }

  const emoji = SUBJECT_EMOJI[trilha.disciplina] || '📚'

  function openCreate() { setEditTarget(null); setEditorOpen(true) }
  function openEdit(aula) { setEditTarget(aula); setEditorOpen(true) }
  function closeEditor() { setEditorOpen(false); setEditTarget(null) }

  async function handleSave(formData) {
    setSaving(true)
    try {
      if (editTarget) {
        await updateAula(editTarget.id, { ...formData, trilhaId: Number(id) })
      } else {
        await createAula({ ...formData, trilhaId: Number(id) })
      }
      closeEditor()
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(aulaId) {
    await deleteAula(aulaId)
  }

  return (
    <TeacherLayout>
      <div className={styles.page}>

        <button className={styles.back} onClick={() => navigate('/teacher-dashboard')}>
          <Icon name="chevronLeft" size={14} /> Minhas trilhas
        </button>

        <header className={styles.header}>
          <span className={styles.emoji}>{emoji}</span>
          <div className={styles.headerInfo}>
            <div className={styles.headerTop}>
              <h1 className={styles.title}>{trilha.nome}</h1>
              <div className={styles.badges}>
                {trilha.disciplina && <span className={styles.badge}>{trilha.disciplina}</span>}
                {trilha.nivel      && <span className={styles.badge}>{trilha.nivel}</span>}
                {trilha.tipo && (
                  <span className={`${styles.badge} ${trilha.tipo === 'PUBLICA' ? styles.badgePublic : styles.badgePrivate}`}>
                    {trilha.tipo === 'PUBLICA' ? '🌐 Pública' : '🔒 Privada'}
                  </span>
                )}
              </div>
            </div>
            {trilha.descricao && <p className={styles.desc}>{trilha.descricao}</p>}
          </div>
        </header>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Aulas</h2>
              <p className={styles.sectionSub}>
                {aulas.length === 0 ? 'Nenhuma aula ainda.' : `${aulas.length} aula${aulas.length !== 1 ? 's' : ''}`}
              </p>
            </div>
            {!editorOpen && (
              <button className={styles.addBtn} onClick={openCreate}>
                <Icon name="plus" size={15} /> Adicionar aula
              </button>
            )}
          </div>

          {error && (
            <div className={styles.errorBanner}>
              <Icon name="warning" size={15} /> {error}
            </div>
          )}

          {editorOpen && (
            <AulaEditor
              initialData={editTarget}
              onSave={handleSave}
              onCancel={closeEditor}
              saving={saving}
            />
          )}

          {!editorOpen && aulas.length === 0 && (
            <div className={styles.empty}>
              <span className={styles.emptyIcon}>📭</span>
              <p className={styles.emptyText}>Nenhuma aula ainda. Comece adicionando conteúdo.</p>
              <button className={styles.addBtn} onClick={openCreate}>
                <Icon name="plus" size={15} /> Adicionar aula
              </button>
            </div>
          )}

          {aulas.length > 0 && (
            <div className={styles.aulasList}>
              {aulas.map((aula, index) => (
                <div key={aula.id} className={styles.aulaCard}>
                  <div className={styles.aulaNum}>{index + 1}</div>
                  <div className={styles.aulaBody}>
                    <div className={styles.aulaTop}>
                      <span className={styles.aulaTitle}>{aula.titulo}</span>
                      <div className={styles.aulaBlocos}>
                        {(aula.blocos ?? []).map((b, i) => (
                          <span key={i} className={styles.aulaTipo}>{BLOCK_LABEL[b.tipo] ?? b.tipo}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className={styles.aulaActions}>
                    <button
                      className={styles.editBtn}
                      onClick={() => openEdit(aula)}
                      aria-label="Editar aula"
                    >
                      ✏️
                    </button>
                    <button
                      className={styles.deleteBtn}
                      onClick={() => handleDelete(aula.id)}
                      aria-label="Remover aula"
                    >
                      <Icon name="close" size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </TeacherLayout>
  )
}
