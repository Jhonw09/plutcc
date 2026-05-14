import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import TeacherLayout from '../components/teacher/TeacherLayout'
import AulaEditor    from '../components/teacher/AulaEditor'
import { Toast }     from '../components/ui/Toast'
import Icon          from '../components/ui/Icon'
import { useAulas }  from '../hooks/useAulas'
import { useToast }  from '../hooks/useToast'
import { getTrilhaById } from '../api/services/trilhaService'
import styles from './TeacherTrilhaPage.module.css'

const SUBJECT_EMOJI = {
  Matemática: '📐', Português: '📖', Química: '⚗️', Biologia: '🧬',
  Física: '⚡', Geografia: '🌍', História: '📜', Inglês: '🌐',
  Artes: '🎨', Informática: '💻', Filosofia: '🧠', Sociologia: '⚖️',
}

const BLOCK_LABEL = {
  explicacao:   '📖 Explicação',
  video:        '🎥 Vídeo',
  questionario: '❓ Questionário',
  texto_livre:  '✏️ Texto livre',
}

// ── Modal wrapper ─────────────────────────────────────────────────────────────
function AulaModal({ title, children, onClose }) {
  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modalCard} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{title}</h2>
          <button className={styles.modalClose} onClick={onClose} aria-label="Fechar">✕</button>
        </div>
        <div className={styles.modalBody}>{children}</div>
      </div>
    </div>
  )
}

export default function TeacherTrilhaPage() {
  const { id }     = useParams()
  const navigate   = useNavigate()
  const { state: trilhaFromNav } = useLocation()
  const { toasts, toast, dismiss } = useToast()

  // ── Trilha ────────────────────────────────────────────────────────────────
  const [trilha,      setTrilha]      = useState(trilhaFromNav ?? null)
  const [trilhaError, setTrilhaError] = useState(null)

  useEffect(() => {
    setTrilha(trilhaFromNav ?? null)
    getTrilhaById(id)
      .then(setTrilha)
      .catch(() => setTrilhaError('Trilha não encontrada.'))
  }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Aulas ─────────────────────────────────────────────────────────────────
  const { aulas, loading, error, createAula, updateAula, deleteAula } = useAulas(id)

  // ── Modal state ───────────────────────────────────────────────────────────
  // mode: null | 'create' | 'edit'
  const [modalMode,  setModalMode]  = useState(null)
  const [editTarget, setEditTarget] = useState(null)
  const [saving,     setSaving]     = useState(false)

  // ── Delete confirm state (por card) ───────────────────────────────────────
  const [confirmDeleteId, setConfirmDeleteId] = useState(null) // id aguardando confirmação
  const [deletingId,      setDeletingId]      = useState(null) // id sendo deletado

  // ── Handlers ──────────────────────────────────────────────────────────────
  function openCreate() { setEditTarget(null); setModalMode('create') }
  function openEdit(aula) { setEditTarget(aula); setModalMode('edit') }
  function closeModal() { setModalMode(null); setEditTarget(null) }

  async function handleSave(formData) {
    setSaving(true)
    try {
      if (modalMode === 'edit') {
        await updateAula(editTarget.id, { ...formData, trilhaId: Number(id) })
        toast('Aula atualizada com sucesso!', 'success')
      } else {
        await createAula({ ...formData, trilhaId: Number(id) })
        toast('Aula criada com sucesso!', 'success')
      }
      closeModal()
    } catch (err) {
      toast(err.message || 'Erro ao salvar aula.', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteConfirm(aulaId) {
    setConfirmDeleteId(null)
    setDeletingId(aulaId)
    try {
      await deleteAula(aulaId)
      toast('Aula excluída.', 'success')
    } catch (err) {
      toast(err.message || 'Erro ao excluir aula.', 'error')
    } finally {
      setDeletingId(null)
    }
  }

  // ── Error / loading states ────────────────────────────────────────────────
  if (trilhaError) {
    return (
      <TeacherLayout>
        <div className={styles.centered}>
          <span>⚠️</span>
          <p>{trilhaError}</p>
          <button className={styles.backBtn} onClick={() => navigate('/teacher-dashboard')}>
            Voltar ao dashboard
          </button>
        </div>
      </TeacherLayout>
    )
  }

  if (!trilha) {
    return (
      <TeacherLayout>
        <div className={styles.centered}><p>Carregando trilha...</p></div>
      </TeacherLayout>
    )
  }

  const emoji = SUBJECT_EMOJI[trilha.disciplina] || '📚'

  return (
    <TeacherLayout>
      <Toast toasts={toasts} onDismiss={dismiss} />

      {/* ── Modal criar / editar aula ── */}
      {modalMode && (
        <AulaModal
          title={modalMode === 'edit' ? '✏️ Editar aula' : '📝 Nova aula'}
          onClose={closeModal}
        >
          <AulaEditor
            initialData={editTarget}
            onSave={handleSave}
            onCancel={closeModal}
            saving={saving}
          />
        </AulaModal>
      )}

      <div className={styles.page}>

        <button className={styles.back} onClick={() => navigate('/teacher-dashboard')}>
          <Icon name="chevronLeft" size={14} /> Minhas trilhas
        </button>

        {/* ── Header da trilha ── */}
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

        {/* ── Seção de aulas ── */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Aulas</h2>
              <p className={styles.sectionSub}>
                {loading ? 'Carregando...' : `${aulas.length} aula${aulas.length !== 1 ? 's' : ''}`}
              </p>
            </div>
            <button className={styles.addBtn} onClick={openCreate}>
              <Icon name="plus" size={15} /> Adicionar aula
            </button>
          </div>

          {error && (
            <div className={styles.errorBanner}>
              <Icon name="warning" size={15} /> {error}
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className={styles.loadingList}>
              {[1, 2, 3].map(i => <div key={i} className={styles.skeletonCard} />)}
            </div>
          )}

          {/* Empty — só após fetch concluir */}
          {!loading && aulas.length === 0 && (
            <div className={styles.empty}>
              <span className={styles.emptyIcon}>📭</span>
              <p className={styles.emptyText}>Nenhuma aula ainda. Comece adicionando conteúdo.</p>
              <button className={styles.addBtn} onClick={openCreate}>
                <Icon name="plus" size={15} /> Adicionar aula
              </button>
            </div>
          )}

          {/* Lista de aulas */}
          {!loading && aulas.length > 0 && (
            <div className={styles.aulasList}>
              {aulas.map((aula, index) => {
                const isDeleting  = deletingId      === aula.id
                const isConfirming = confirmDeleteId === aula.id
                return (
                  <div
                    key={aula.id}
                    className={`${styles.aulaCard} ${isDeleting ? styles.aulaCardDeleting : ''}`}
                  >
                    {/* Clique no card abre edição */}
                    <button
                      className={styles.aulaCardMain}
                      onClick={() => !isDeleting && !isConfirming && openEdit(aula)}
                      disabled={isDeleting}
                      aria-label={`Editar aula ${aula.titulo}`}
                    >
                      <span className={styles.aulaNum}>{index + 1}</span>
                      <div className={styles.aulaBody}>
                        <span className={styles.aulaTitle}>{aula.titulo}</span>
                        <div className={styles.aulaBlocos}>
                          {(aula.blocos ?? []).map((b, i) => (
                            <span key={i} className={styles.aulaTipo}>
                              {BLOCK_LABEL[b.tipo] ?? b.tipo}
                            </span>
                          ))}
                        </div>
                      </div>
                      <span className={styles.aulaEditHint}>
                        {isDeleting ? '⏳' : '✏️ Editar'}
                      </span>
                    </button>

                    {/* Área de delete — separada do clique de edição */}
                    <div className={styles.aulaDeleteArea}>
                      {isConfirming ? (
                        <div className={styles.deleteConfirm}>
                          <span className={styles.deleteConfirmText}>Excluir esta aula?</span>
                          <button
                            className={styles.deleteConfirmYes}
                            onClick={() => handleDeleteConfirm(aula.id)}
                          >
                            Excluir
                          </button>
                          <button
                            className={styles.deleteConfirmNo}
                            onClick={() => setConfirmDeleteId(null)}
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <button
                          className={styles.deleteBtn}
                          onClick={() => setConfirmDeleteId(aula.id)}
                          disabled={isDeleting}
                          aria-label="Excluir aula"
                          title="Excluir aula"
                        >
                          {isDeleting ? '⏳' : <Icon name="close" size={14} />}
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

      </div>
    </TeacherLayout>
  )
}
