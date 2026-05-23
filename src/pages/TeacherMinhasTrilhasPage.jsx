import { useState, useMemo } from 'react'
import { useNavigate }     from 'react-router-dom'
import TeacherLayout       from '../components/teacher/TeacherLayout'
import CreateTrilhaModal   from '../components/teacher/CreateTrilhaModal'
import { ConfirmModal }    from '../components/ui/ConfirmModal'
import { Toast }           from '../components/ui/Toast'
import Icon                from '../components/ui/Icon'
import { useToast }        from '../hooks/useToast'
import { useTrilhas }      from '../hooks/useTrilhas'
import { useAuth }         from '../context/AuthContext'
import styles from './TeacherMinhasTrilhasPage.module.css'

const NIVEL_LABEL = {
  BASICO: 'Básico', INTERMEDIARIO: 'Intermediário', AVANCADO: 'Avançado',
  Fundamental: 'Fundamental', Médio: 'Médio', Vestibular: 'Vestibular',
}
const NIVEL_STYLE = {
  BASICO:        { color: '#4ade80', bg: 'rgba(34,197,94,.12)',  border: 'rgba(34,197,94,.25)'  },
  INTERMEDIARIO: { color: '#fbbf24', bg: 'rgba(245,158,11,.12)', border: 'rgba(245,158,11,.25)' },
  AVANCADO:      { color: '#f87171', bg: 'rgba(239,68,68,.12)',  border: 'rgba(239,68,68,.25)'  },
  Fundamental:   { color: '#4ade80', bg: 'rgba(34,197,94,.12)',  border: 'rgba(34,197,94,.25)'  },
  Médio:         { color: '#fbbf24', bg: 'rgba(245,158,11,.12)', border: 'rgba(245,158,11,.25)' },
  Vestibular:    { color: '#f87171', bg: 'rgba(239,68,68,.12)',  border: 'rgba(239,68,68,.25)'  },
}
const SUBJECT_ICON = {
  Matemática: 'math', Português: 'book', Química: 'flask', Biologia: 'dna',
  Física: 'zap', Geografia: 'globe', História: 'scroll', Inglês: 'globe',
  Artes: 'palette', Informática: 'monitor', Filosofia: 'brain', Sociologia: 'scale',
}

function Sk() {
  return <div className={styles.skeleton} />
}

function TrilhaCard({ trilha, onEdit, onDelete, deleting }) {
  const navigate = useNavigate()
  const nivel    = NIVEL_STYLE[trilha.nivel] ?? NIVEL_STYLE['BASICO']
  const nivelLbl = NIVEL_LABEL[trilha.nivel] ?? trilha.nivel
  const icon     = SUBJECT_ICON[trilha.disciplina] ?? 'bookOpen'
  const isPublic = trilha.tipo === 'PUBLICA'

  return (
    <div className={`${styles.card} ${deleting ? styles.cardDeleting : ''}`}>
      {/* Faixa lateral colorida */}
      <div className={`${styles.cardStrip} ${isPublic ? styles.stripPublic : styles.stripPrivate}`} />

      <div className={styles.cardBody}>
        {/* Header do card */}
        <div className={styles.cardTop}>
          <span className={styles.cardIcon}>
            <Icon name={icon} size={20} />
          </span>
          <div className={styles.cardMeta}>
            <h3 className={styles.cardName}>{trilha.nome}</h3>
            <span className={styles.cardDisciplina}>{trilha.disciplina}</span>
          </div>
          <div className={styles.cardBadges}>
            {trilha.nivel && (
              <span className={styles.badge} style={{ color: nivel.color, background: nivel.bg, borderColor: nivel.border }}>
                {nivelLbl}
              </span>
            )}
            <span className={`${styles.badge} ${isPublic ? styles.badgePublic : styles.badgePrivate}`}>
              <Icon name={isPublic ? 'globe' : 'lock'} size={10} />
              {isPublic ? 'Pública' : 'Privada'}
            </span>
          </div>
        </div>

        {/* Descrição */}
        {trilha.descricao && (
          <p className={styles.cardDesc}>{trilha.descricao}</p>
        )}

        {/* Footer */}
        <div className={styles.cardFooter}>
          <div className={styles.cardStats}>
            <span className={styles.cardStat}>
              <Icon name="users" size={12} />
              {trilha.alunoIds?.length ?? 0} aluno{(trilha.alunoIds?.length ?? 0) !== 1 ? 's' : ''}
            </span>
          </div>
          <div className={styles.cardActions}>
            <button
              className={styles.btnEdit}
              onClick={() => onEdit(trilha)}
              disabled={deleting}
            >
              <Icon name="pencil" size={13} /> Editar
            </button>
            <button
              className={styles.btnManage}
              onClick={() => navigate(`/professor/trilha/${trilha.id}`, { state: trilha })}
              disabled={deleting}
            >
              Gerenciar <Icon name="chevronRight" size={13} />
            </button>
            <button
              className={styles.btnDelete}
              onClick={() => onDelete(trilha.id, trilha.nome)}
              disabled={deleting}
              title="Excluir trilha"
            >
              {deleting ? <Icon name="hourglass" size={13} /> : <Icon name="trash" size={13} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const FILTERS = [
  { key: 'todas',   label: 'Todas'   },
  { key: 'publica', label: 'Públicas' },
  { key: 'privada', label: 'Privadas' },
]

export default function TeacherMinhasTrilhasPage() {
  const { user }  = useAuth()
  const { toasts, toast, dismiss } = useToast()
  const { trilhas, loading, error, createTrilha, deleteTrilha } = useTrilhas()

  const [search,       setSearch]       = useState('')
  const [filter,       setFilter]       = useState('todas')
  const [modalOpen,    setModalOpen]    = useState(false)
  const [editTarget,   setEditTarget]   = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deletingId,   setDeletingId]   = useState(null)

  const filtered = useMemo(() => {
    let list = trilhas
    if (filter === 'publica') list = list.filter(t => t.tipo === 'PUBLICA')
    if (filter === 'privada') list = list.filter(t => t.tipo === 'PRIVADA')
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(t =>
        t.nome?.toLowerCase().includes(q) ||
        t.disciplina?.toLowerCase().includes(q) ||
        t.descricao?.toLowerCase().includes(q)
      )
    }
    return list
  }, [trilhas, filter, search])

  async function handleCreate(data) {
    try {
      await createTrilha(data)
      toast('Trilha criada com sucesso!', 'success')
      setModalOpen(false)
    } catch (err) {
      toast(err.message || 'Erro ao criar trilha.', 'error')
      throw err
    }
  }

  function handleEdit(updated) {
    toast(`Trilha "${updated.nome}" atualizada.`, 'success')
    setEditTarget(null)
    setModalOpen(false)
  }

  async function handleDeleteConfirm() {
    const { id, nome } = deleteTarget
    setDeletingId(id)
    setDeleteTarget(null)
    try {
      await deleteTrilha(id)
      toast(`Trilha "${nome}" excluída.`, 'success')
    } catch (err) {
      toast(err.message || 'Erro ao excluir trilha.', 'error')
    } finally {
      setDeletingId(null)
    }
  }

  function openEdit(t) { setEditTarget(t); setModalOpen(true) }
  function closeModal() { setModalOpen(false); setEditTarget(null) }

  return (
    <TeacherLayout>
      {modalOpen && (
        <CreateTrilhaModal
          onClose={closeModal}
          onCreate={handleCreate}
          onEdit={handleEdit}
          initialData={editTarget}
        />
      )}
      {deleteTarget && (
        <ConfirmModal
          title="Excluir trilha"
          message={`Tem certeza que deseja excluir "${deleteTarget.nome}"? Esta ação não pode ser desfeita.`}
          confirmLabel="Excluir trilha"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
      <Toast toasts={toasts} onDismiss={dismiss} />

      <div className={styles.page}>

        {/* ── Header ── */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Minhas trilhas</h1>
            <p className={styles.sub}>
              {loading ? 'Carregando...' : `${trilhas.length} trilha${trilhas.length !== 1 ? 's' : ''} criada${trilhas.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <button className={styles.btnPrimary} onClick={() => { setEditTarget(null); setModalOpen(true) }}>
            <Icon name="plus" size={15} /> Nova trilha
          </button>
        </div>

        {/* ── Busca + filtros ── */}
        <div className={styles.toolbar}>
          <div className={styles.searchWrap}>
            <span className={styles.searchIcon}><Icon name="search" size={14} /></span>
            <input
              className={styles.searchInput}
              placeholder="Buscar por nome, disciplina ou descrição…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button className={styles.searchClear} onClick={() => setSearch('')}>
                <Icon name="close" size={11} />
              </button>
            )}
          </div>
          <div className={styles.filters}>
            {FILTERS.map(f => (
              <button
                key={f.key}
                className={`${styles.filterBtn} ${filter === f.key ? styles.filterActive : ''}`}
                onClick={() => setFilter(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Conteúdo ── */}
        {loading ? (
          <div className={styles.grid}>
            {[0,1,2,3].map(i => <Sk key={i} />)}
          </div>
        ) : error ? (
          <div className={styles.errorBanner}>
            <Icon name="alertCircle" size={15} /> {error}
          </div>
        ) : filtered.length === 0 ? (
          <div className={styles.empty}>
            <Icon name="school" size={40} style={{ opacity: .2 }} />
            {trilhas.length === 0 ? (
              <>
                <p className={styles.emptyTitle}>Nenhuma trilha criada ainda</p>
                <p className={styles.emptySub}>Crie sua primeira trilha e comece a compartilhar conhecimento.</p>
                <button className={styles.btnPrimary} onClick={() => setModalOpen(true)}>
                  <Icon name="plus" size={14} /> Criar primeira trilha
                </button>
              </>
            ) : (
              <>
                <p className={styles.emptyTitle}>Nenhuma trilha encontrada</p>
                <p className={styles.emptySub}>Tente ajustar os filtros ou a busca.</p>
                <button className={styles.btnOutline} onClick={() => { setSearch(''); setFilter('todas') }}>
                  Limpar filtros
                </button>
              </>
            )}
          </div>
        ) : (
          <div className={styles.grid}>
            {filtered.map(t => (
              <TrilhaCard
                key={t.id}
                trilha={t}
                onEdit={openEdit}
                onDelete={(id, nome) => setDeleteTarget({ id, nome })}
                deleting={deletingId === t.id}
              />
            ))}
          </div>
        )}

      </div>
    </TeacherLayout>
  )
}
