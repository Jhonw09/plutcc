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
import TrailDuvidas        from '../components/teacher/TrailDuvidas'
import TrailEstatisticas   from '../components/teacher/TrailEstatisticas'
import TrailConfiguracoes  from '../components/teacher/TrailConfiguracoes'
import { updateTrilha, deleteTrilha } from '../api/services/trilhaService'
import styles from './TeacherTrilhaPage.module.css'

const TRILHA_TOUR_KEY  = (userId) => `plut_tour_trilha_${userId}`
const DASH_CARD_KEY    = (userId) => `plut_dash_card_${userId}`

const TRILHA_TOUR_STEPS = [
  {
    target: 'trilha-header',
    title: 'Sua trilha de estudo',
    description: 'Aqui ficam as informações da trilha: nome, disciplina, nível e visibilidade.',
    tab: 'aulas',
  },
  {
    target: 'add-aula-btn',
    title: 'Adicione aulas',
    description: 'Clique aqui para criar uma nova aula com conteúdo, vídeos e exercícios.',
    tab: 'aulas',
  },
  {
    target: 'aulas-section',
    title: 'Lista de aulas',
    description: 'Suas aulas aparecem aqui em ordem. Clique em qualquer aula para editar o conteúdo.',
    tab: 'aulas',
  },
  {
    target: 'duvidas-toolbar',
    title: 'Dúvidas dos alunos',
    description: 'Aqui você vê todas as dúvidas enviadas pelos alunos. Filtre por pendentes ou respondidas e responda diretamente nesta tela.',
    tab: 'duvidas',
  },
  {
    target: 'estatisticas-metrics',
    title: 'Estatísticas da trilha',
    description: 'Acompanhe alunos matriculados, aulas concluídas, dúvidas enviadas e taxa de conclusão em tempo real.',
    tab: 'estatisticas',
  },
  {
    target: 'configuracoes-geral',
    title: 'Configurações',
    description: 'Edite o nome, descrição e visibilidade da trilha. Na zona de perigo você pode excluí-la permanentemente.',
    tab: 'configuracoes',
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

  const [activeTab, setActiveTab] = useState('aulas')

  const [trilhaTourActive, setTrilhaTourActive] = useState(() => {
    try { return localStorage.getItem(TRILHA_TOUR_KEY(user?.id)) !== 'true' } catch { return false }
  })
  const [tourTab, setTourTab] = useState(null)

  function handleTourStep(step) {
    if (step.tab) { setActiveTab(step.tab); setTourTab(step.tab) }
  }

  const [showFirstAulaCard, setShowFirstAulaCard] = useState(false)
  const [showDashboardCard, setShowDashboardCard] = useState(false)

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

  const aulasPublicadas = aulas.filter(a => a.status !== 'RASCUNHO')
  const aulasRascunho   = aulas.filter(a => a.status === 'RASCUNHO')

  function handleTrilhaTourFinish() {
    setTrilhaTourActive(false)
    setTourTab(null)
    setActiveTab('aulas')
    if (aulas.length === 0) setShowFirstAulaCard(true)
  }

  // ── Modal state ───────────────────────────────────────────────────────────
  const [modalMode,  setModalMode]  = useState(null)
  const [editTarget, setEditTarget] = useState(null)
  const [saving,     setSaving]     = useState(false)
  const [forceAulaTour, setForceAulaTour] = useState(false)

  // ── Delete confirm state (por card) ───────────────────────────────────────
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const [deletingId,      setDeletingId]      = useState(null)

  // ── Handlers ──────────────────────────────────────────────────────────────
  function openCreate(forceTour = false) {
    setEditTarget(null)
    setModalMode('create')
    setForceAulaTour(forceTour)
  }
  function openEdit(aula) { setEditTarget(aula); setModalMode('edit') }
  function closeModal() { setModalMode(null); setEditTarget(null) }

  async function handleSave(formData) {
    setSaving(true)
    try {
      if (modalMode === 'edit') {
        await updateAula(editTarget.id, { ...formData, trilhaId: Number(id) })
        const label = formData.status === 'RASCUNHO' ? 'Rascunho salvo!' : 'Aula atualizada com sucesso!'
        toast(label, 'success')
      } else {
        await createAula({ ...formData, trilhaId: Number(id) })
        const label = formData.status === 'RASCUNHO' ? 'Rascunho salvo!' : 'Aula criada com sucesso!'
        toast(label, 'success')
        // primeira aula criada (ou rascunho) — mostra card de ir para dashboard
        try {
          if (localStorage.getItem(DASH_CARD_KEY(user?.id)) !== 'true') {
            localStorage.setItem(DASH_CARD_KEY(user?.id), 'true')
            setShowDashboardCard(true)
          }
        } catch {}
      }
      closeModal()
    } catch (err) {
      toast(err.message || 'Erro ao salvar aula.', 'error')
    } finally {
      setSaving(false)
    }
  }

  // ── Handlers de configurações da trilha ─────────────────────────────────
  async function handleUpdateTrilha(data) {
    const updated = await updateTrilha(id, { ...trilha, ...data })
    setTrilha(updated)
  }

  async function handleDeleteTrilha() {
    await deleteTrilha(id)
    navigate('/teacher-dashboard')
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
        steps={TRILHA_TOUR_STEPS}
        active={trilhaTourActive && !!trilha}
        onFinish={handleTrilhaTourFinish}
        storageKey={TRILHA_TOUR_KEY(user?.id)}
        onStep={handleTourStep}
      />

      {/* ── Card de transição: criar primeira aula ── */}
      {showFirstAulaCard && (
        <div className={styles.firstAulaBackdrop}>
          <div className={styles.firstAulaCard}>
            <div className={styles.firstAulaIcon}>
              <Icon name="fileText" size={28} />
            </div>
            <h2 className={styles.firstAulaTitle}>Vamos criar sua primeira aula?</h2>
            <p className={styles.firstAulaDesc}>
              Sua trilha está pronta. Agora adicione conteúdo — cada aula pode ter explicações, vídeos e exercícios.
            </p>
            <div className={styles.firstAulaActions}>
              <button
                className={styles.firstAulaBtnSecondary}
                onClick={() => setShowFirstAulaCard(false)}
              >
                Agora não
              </button>
              <button
                className={styles.firstAulaBtnPrimary}
                onClick={() => { setShowFirstAulaCard(false); openCreate(true) }}
              >
                <Icon name="plus" size={14} /> Criar primeira aula
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Card de transição: conhecer o restante do site ── */}
      {showDashboardCard && (
        <div className={styles.firstAulaBackdrop}>
          <div className={styles.firstAulaCard}>
            <div className={styles.firstAulaIcon}>
              <Icon name="sparkles" size={28} />
            </div>
            <h2 className={styles.firstAulaTitle}>Vamos conhecer o restante do site?</h2>
            <p className={styles.firstAulaDesc}>
              Sua primeira aula foi criada. Agora veja o painel completo — lá você acompanha seus alunos, trilhas e muito mais.
            </p>
            <div className={styles.firstAulaActions}>
              <button
                className={styles.firstAulaBtnSecondary}
                onClick={() => setShowDashboardCard(false)}
              >
                Agora não
              </button>
              <button
                className={styles.firstAulaBtnPrimary}
                onClick={() => navigate('/teacher-dashboard')}
              >
                <Icon name="arrow" size={14} /> Vamos lá
              </button>
            </div>
          </div>
        </div>
      )}

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
              forceTour={forceAulaTour}
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

        {/* ── Abas ── */}
        <nav className={styles.tabs} data-tour="trilha-tabs">
          {['aulas', 'duvidas', 'estatisticas', 'configuracoes'].map(tab => (
            <button
              key={tab}
              data-tour={`tab-${tab}`}
              className={[
                styles.tab,
                activeTab === tab ? styles.tabActive : '',
                tourTab === tab ? styles.tabTourActive : '',
              ].join(' ')}
              onClick={() => { setActiveTab(tab); setTourTab(null) }}
            >
              {{ aulas: 'Aulas', duvidas: 'Dúvidas', estatisticas: 'Estatísticas', configuracoes: 'Configurações' }[tab]}
            </button>
          ))}
        </nav>

        {/* ── Conteúdo das abas ── */}
        {activeTab === 'duvidas'       && <TrailDuvidas />}
        {activeTab === 'estatisticas'  && <TrailEstatisticas />}
        {activeTab === 'configuracoes' && (
          <TrailConfiguracoes
            trilha={trilha}
            onUpdate={handleUpdateTrilha}
            onDelete={handleDeleteTrilha}
          />
        )}

        {/* ── Seção de aulas ── */}
        {activeTab === 'aulas' && <section className={styles.section} data-tour="aulas-section">
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Aulas</h2>
              <p className={styles.sectionSub}>
                {loading ? 'Carregando...' : (
                  <>
                    {aulasPublicadas.length} publicada{aulasPublicadas.length !== 1 ? 's' : ''}
                    {aulasRascunho.length > 0 && (
                      <span className={styles.draftCount}> · {aulasRascunho.length} rascunho{aulasRascunho.length !== 1 ? 's' : ''}</span>
                    )}
                  </>
                )}
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
                const isDraft      = aula.status === 'RASCUNHO'
                return (
                  <div
                    key={aula.id}
                    className={`${styles.aulaCard} ${isDeleting ? styles.aulaCardDeleting : ''} ${isDraft ? styles.aulaCardDraft : ''}`}
                  >
                    {/* Número */}
                    <div className={styles.aulaIndex}>{index + 1}</div>

                    {/* Info principal — clicável para editar */}
                    <button
                      className={styles.aulaCardMain}
                      onClick={() => !isDeleting && !isConfirming && openEdit(aula)}
                      disabled={isDeleting}
                      aria-label={`Editar aula ${aula.titulo}`}
                    >
                      <div className={styles.aulaTitleRow}>
                        <span className={styles.aulaTitle}>{aula.titulo}</span>
                        <span className={isDraft ? styles.statusDraft : styles.statusPublished}>
                          {isDraft ? 'Rascunho' : 'Publicada'}
                        </span>
                      </div>
                      {(aula.blocos ?? []).length > 0 && (
                        <div className={styles.aulaBlocos}>
                          {(aula.blocos ?? []).map((b, i) => (
                            <span key={i} className={styles.aulaTipo}>
                              {BLOCK_LABEL[b.tipo] ?? b.tipo}
                            </span>
                          ))}
                        </div>
                      )}
                    </button>

                    {/* Ações */}
                    <div className={styles.aulaActions}>
                      {isConfirming ? (
                        <div className={styles.deleteConfirm}>
                          <span className={styles.deleteConfirmText}>Excluir?</span>
                          <button className={styles.deleteConfirmYes} onClick={() => handleDeleteConfirm(aula.id)}>Sim</button>
                          <button className={styles.deleteConfirmNo}  onClick={() => setConfirmDeleteId(null)}>Não</button>
                        </div>
                      ) : (
                        <>
                          <button
                            className={styles.manageBtn}
                            onClick={() => !isDeleting && openEdit(aula)}
                            disabled={isDeleting}
                          >
                            {isDeleting ? <Icon name="hourglass" size={13} /> : <><Icon name="pencil" size={13} /> Gerenciar</>}
                          </button>
                          <button
                            className={styles.deleteBtn}
                            onClick={() => setConfirmDeleteId(aula.id)}
                            disabled={isDeleting}
                            aria-label="Excluir aula"
                            title="Excluir aula"
                          >
                            <Icon name="close" size={13} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>}

      </div>
    </TeacherLayout>
  )
}
