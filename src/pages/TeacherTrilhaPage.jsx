import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import TeacherLayout from '../components/teacher/TeacherLayout'
import AulaEditor    from '../components/teacher/AulaEditor'
import SpotlightTour from '../components/ui/SpotlightTour'
import { Toast }     from '../components/ui/Toast'
import Icon          from '../components/ui/Icon'
import { useAulas }  from '../hooks/useAulas'
import { useToast }  from '../hooks/useToast'
import { useAuth }   from '../context/AuthContext'
import { getTrilhaById } from '../api/services/trilhaService'
import styles from './TeacherTrilhaPage.module.css'

const TOUR_KEY = (userId) => `plut_tour_trilha_${userId}`

const TOUR_STEPS = [
  {
    target: 'trilha-header',
    title: 'Sua trilha de estudo',
    description: 'Aqui ficam as informações da trilha: nome, disciplina, nível e visibilidade. Clique em editar para alterar qualquer dado.',
  },
  {
    target: 'add-aula-btn',
    title: 'Adicione aulas',
    description: 'As aulas compõem a trilha. Clique aqui para criar uma nova aula com conteúdo, vídeos e exercícios.',
    placement: 'bottom',
  },
  {
    target: 'aulas-section',
    title: 'Lista de aulas',
    description: 'Suas aulas aparecem aqui em ordem. Clique em qualquer aula para editar o conteúdo ou reordenar os blocos.',
  },
]

const SUBJECT_ICON = {
  Matemática: 'math',    Português: 'book',    Química: 'flask',
  Biologia: 'dna',       Física: 'zap',        Geografia: 'globe',
  História: 'scroll',    Inglês: 'globe',       Artes: 'palette',
  Informática: 'monitor', Filosofia: 'brain',  Sociologia: 'scale',
}

const BLOCK_LABEL = {
  explicacao:   'Explicação',
  video:        'Vídeo',
  questionario: 'Questionário',
  texto_livre:  'Texto livre',
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
  const { user } = useAuth()

  // Tour
  const [tourActive, setTourActive] = useState(() => {
    try { return localStorage.getItem(TOUR_KEY(user?.id)) !== 'true' } catch { return false }
  })

  // Tour do editor de aulas — só na primeira aula criada
  const AULA_TOUR_KEY = 'plut_tour_aula_editor'
  const [aulaTourActive, setAulaTourActive] = useState(false)

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
  const [modalMode,  setModalMode]  = useState(null)
  const [editTarget, setEditTarget] = useState(null)
  const [saving,     setSaving]     = useState(false)

  // ── Delete confirm state (por card) ───────────────────────────────────────
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const [deletingId,      setDeletingId]      = useState(null)

  // ── Handlers ──────────────────────────────────────────────────────────────
  function openCreate() {
    setEditTarget(null)
    setModalMode('create')
    // Ativa o tour do editor na primeira aula
    try {
      if (localStorage.getItem(AULA_TOUR_KEY) !== 'true') setAulaTourActive(true)
    } catch {}
  }
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
          <Icon name="warning" size={32} style={{ opacity: .4 }} />
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

  const iconName = SUBJECT_ICON[trilha.disciplina] || 'bookOpen'

  return (
    <TeacherLayout>
      <Toast toasts={toasts} onDismiss={dismiss} />

      <SpotlightTour
        steps={TOUR_STEPS}
        active={tourActive && !!trilha}
        onFinish={() => setTourActive(false)}
        storageKey={TOUR_KEY(user?.id)}
      />

      {/* Tour do editor de aulas — fora do modal para evitar conflito de z-index */}
      <SpotlightTour
        steps={[
          { target: 'ae-titulo',    title: 'Título da aula',      description: 'Dê um nome claro. Ex: "Aula 1 — Introdução ao tema".' },
          { target: 'ae-blocos',    title: 'Blocos de conteúdo',  description: 'Cada aula tem blocos. Explicações, vídeos e questionários no mesmo lugar.' },
          { target: 'ae-add-bloco', title: 'Adicionar bloco',     description: 'Clique para adicionar mais blocos: explicação, vídeo, questionário ou texto livre.', placement: 'top' },
          { target: 'ae-salvar',    title: 'Salvar aula',         description: 'Quando terminar, clique em "Criar aula" para salvar na trilha.', placement: 'top' },
        ]}
        active={aulaTourActive}
        onFinish={() => {
          setAulaTourActive(false)
          try { localStorage.setItem(AULA_TOUR_KEY, 'true') } catch {}
        }}
        storageKey={AULA_TOUR_KEY}
      />

      {/* ── Modal criar / editar aula ── */}
      {modalMode && (
        <>
          <AulaModal
            title={modalMode === 'edit' ? 'Editar aula' : 'Nova aula'}
            onClose={closeModal}
          >
            <AulaEditor
              initialData={editTarget}
              onSave={handleSave}
              onCancel={closeModal}
              saving={saving}
            />
          </AulaModal>
        </>
      )}

      <div className={styles.page}>

        <button className={styles.back} onClick={() => navigate('/teacher-dashboard')}>
          <Icon name="chevronLeft" size={14} /> Minhas trilhas
        </button>

        {/* ── Header da trilha ── */}
        <header className={styles.header} data-tour="trilha-header">
          <span className={styles.emoji}>
            <Icon name={iconName} size={28} />
          </span>
          <div className={styles.headerInfo}>
            <div className={styles.headerTop}>
              <h1 className={styles.title}>{trilha.nome}</h1>
              <div className={styles.badges}>
                {trilha.disciplina && <span className={styles.badge}>{trilha.disciplina}</span>}
                {trilha.nivel      && <span className={styles.badge}>{trilha.nivel}</span>}
                {trilha.tipo && (
                  <span className={`${styles.badge} ${trilha.tipo === 'PUBLICA' ? styles.badgePublic : styles.badgePrivate}`}>
                    <Icon name={trilha.tipo === 'PUBLICA' ? 'globe' : 'lock'} size={11} style={{display:'inline',verticalAlign:'middle',marginRight:4}} />
                    {trilha.tipo === 'PUBLICA' ? 'Pública' : 'Privada'}
                  </span>
                )}
              </div>
            </div>
            {trilha.descricao && <p className={styles.desc}>{trilha.descricao}</p>}
          </div>
        </header>

        {/* ── Seção de aulas ── */}
        <section className={styles.section} data-tour="aulas-section">
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Aulas</h2>
              <p className={styles.sectionSub}>
                {loading ? 'Carregando...' : `${aulas.length} aula${aulas.length !== 1 ? 's' : ''}`}
              </p>
            </div>
            <button className={styles.addBtn} onClick={openCreate} data-tour="add-aula-btn">
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
              <Icon name="inbox" size={32} style={{ opacity: .3 }} />
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
                const isDeleting   = deletingId      === aula.id
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
                        {isDeleting ? <Icon name="hourglass" size={14} /> : <><Icon name="pencil" size={13} /> Editar</>}
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
                          {isDeleting ? <Icon name="hourglass" size={14} /> : <Icon name="close" size={14} />}
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
