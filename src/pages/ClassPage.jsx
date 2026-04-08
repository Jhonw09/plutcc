import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AppLayout        from '../components/layout/AppLayout'
import DashboardSidebar from '../components/dashboard/DashboardSidebar'
import TeacherSidebar   from '../components/teacher/TeacherSidebar'
import DashboardHeader  from '../components/dashboard/DashboardHeader'
import { Avatar }       from '../components/ui/Avatar'
import { Button }       from '../components/ui/Button'
import { InputField }   from '../components/ui/InputField'
import { ConfirmModal } from '../components/ui/ConfirmModal'
import { useAuth }      from '../context/AuthContext'
import { useClass }     from '../hooks/useClass'
import { ROLE_ROUTES }  from '../constants/routes'
import { typeBadgeStyle } from '../utils/subjectColors'
import { Tag } from '../components/ui/Tag'
import styles      from './ClassPage.module.css'
import modalStyles from '../components/teacher/CreateClassModal.module.css'

// ── Default fallback for UI when data not yet loaded ────────────────────────
const MOCK = {
  id:       'loading',
  nome:     '...',
  codigo:   'CARREGANDO...',
  tipo:     'PUBLICA',
  nivel:    'Médio',
  disciplina: 'Carregando',
  professor: 'Professor',
  membros:  [],
  mural:    [],
}

const SUBJECT_EMOJI = {
  Matemática: '📐', Português: '📖', Química: '⚗️', Biologia: '🧬',
  Física: '⚡', Geografia: '🌍', História: '📜', Inglês: '🌐',
  Artes: '🎨', Informática: '💻', Filosofia: '🧠', Sociologia: '⚖️',
}

const TABS = [
  { id: 'mural',      label: '📋 Mural'      },
  { id: 'materiais',  label: '📚 Materiais'  },
  { id: 'atividades', label: '📝 Atividades' },
  { id: 'membros',    label: '👥 Membros'    },
]

// ── Helpers ───────────────────────────────────────────────────────────────

function formatTime(iso) {
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000)
  if (diff < 60)    return 'agora mesmo'
  if (diff < 3600)  return `há ${Math.floor(diff / 60)} min`
  if (diff < 86400) return `há ${Math.floor(diff / 3600)}h`
  return new Date(iso).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })
}

// ── Shared UI ─────────────────────────────────────────────────────────────

function EmptyState({ icon, text }) {
  return (
    <div className={styles.emptyState}>
      <span className={styles.emptyIcon}>{icon}</span>
      <p className={styles.emptyText}>{text}</p>
    </div>
  )
}

function ModalShell({ title, icon, sub, onClose, children }) {
  return (
    <div className={modalStyles.backdrop} onClick={onClose}>
      <div
        className={modalStyles.card}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button className={modalStyles.closeBtn} onClick={onClose} aria-label="Fechar">✕</button>
        <div className={modalStyles.header}>
          <span className={modalStyles.headerIcon}>{icon}</span>
          <div>
            <h2 className={modalStyles.title}>{title}</h2>
            <p className={modalStyles.sub}>{sub}</p>
          </div>
        </div>
        {children}
      </div>
    </div>
  )
}

// ── PostItem ──────────────────────────────────────────────────────────────

function PostItem({ post, user, isTeacher, classId, onCommentAdded, onDelete }) {
  const { addCommentToPost, deleteCommentFromPost, loading: commenting } = useClass()
  const [draft,          setDraft]          = useState('')
  const [showCommentBox, setShowCommentBox] = useState(false)
  const [commentError,   setCommentError]   = useState(null)

  // Load comments from post (from localStorage via classService)
  const comments = post.comentarios ?? []

  async function submitComment(e) {
    e.preventDefault()
    const text = draft.trim()
    if (!text) return

    setCommentError(null)
    try {
      await addCommentToPost(classId, post.id, text)
      setDraft('')
      // Trigger refetch to get updated comments
      if (onCommentAdded) onCommentAdded()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao comentar'
      setCommentError(msg)
    }
  }

  async function deleteComment(commentId) {
    setCommentError(null)
    try {
      // DEBUG: Log user and comment info
      console.log('[PostItem] deleteComment called:', {
        userId: user?.id,
        userRole: user?.role,
        userName: user?.name,
        classId,
        postId: post.id,
        commentId,
        comments: comments.map(c => ({ id: c.id, autorId: c.autorId, autor: c.autor })),
        isTeacher,
      })

      await deleteCommentFromPost(classId, post.id, commentId)
      // Trigger refetch to get updated comments
      if (onCommentAdded) onCommentAdded()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao deletar comentário'
      console.error('[PostItem] deleteComment failed:', msg)
      setCommentError(msg)
    }
  }

  const isSystem = post.type === 'system'

  return (
    <div className={`${styles.postCard} ${isSystem ? styles.postCardSystem : ''}`}>

      {/* Header */}
      <div className={styles.postHeader}>
        <Avatar
          initial={isSystem ? '📢' : post.initial}
          bg={isSystem ? 'rgba(34,197,94,0.12)' : 'var(--accent-soft)'}
          color={isSystem ? 'var(--success)' : 'var(--accent)'}
          size={38}
        />
        <div className={styles.postMeta}>
          <span className={styles.postAuthor}>
            {isSystem ? 'StudyConnect' : post.author}
          </span>
          <span className={styles.postTime}>{formatTime(post.createdAt)}</span>
        </div>

        {/* Delete post — teacher only, not on system posts */}
        {isTeacher && !isSystem && (
          <button
            className={styles.postDeleteBtn}
            onClick={() => onDelete(post.id)}
            aria-label="Excluir publicação"
            title="Excluir publicação"
          >
            🗑
          </button>
        )}
      </div>

      {/* Body */}
      <p className={styles.postBody}>{post.text}</p>

      {/* Comment toggle — hidden on system posts */}
      {!isSystem && (
        <button
          className={styles.commentToggle}
          onClick={() => setShowCommentBox(v => !v)}
          disabled={commenting}
        >
          💬 {comments.length > 0
            ? `${comments.length} comentário${comments.length !== 1 ? 's' : ''}`
            : 'Comentar'}
        </button>
      )}

      {/* Error message for comments */}
      {commentError && (
        <div style={{ color: 'var(--error)', fontSize: '0.85rem', marginBottom: '0.5rem', padding: '0.5rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '0.25rem' }}>
          {commentError}
        </div>
      )}

      {/* Comment list */}
      {comments.length > 0 && (
        <div className={styles.commentList}>
          {comments.map(c => (
            <div key={c.id} className={styles.commentRow}>
              <Avatar
                initial={(c.autor?.[0] ?? 'U').toUpperCase()}
                bg="var(--surface-3)"
                color="var(--text-secondary)"
                size={28}
              />
              <div className={styles.commentBubble}>
                <span className={styles.commentAuthor}>{c.autor}</span>
                <span className={styles.commentText}>{c.texto}</span>
              </div>
              <span className={styles.commentTime}>{formatTime(c.createdAt)}</span>
              {/* Delete comment — show only if user is author OR user is teacher */}
              {(c.autorId === user?.id || isTeacher) && (
                <button
                  className={styles.commentDeleteBtn}
                  onClick={() => deleteComment(c.id)}
                  aria-label="Excluir comentário"
                  title={c.autorId === user?.id ? 'Excluir seu comentário' : 'Excluir comentário'}
                  disabled={commenting}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Comment composer */}
      {showCommentBox && !isSystem && (
        <form className={styles.commentComposer} onSubmit={submitComment}>
          <Avatar
            initial={(user?.name ?? 'V')[0].toUpperCase()}
            bg="var(--surface-3)"
            color="var(--text-secondary)"
            size={28}
          />
          <input
            className={styles.commentInput}
            placeholder="Escreva um comentário…"
            value={draft}
            onChange={e => { setDraft(e.target.value); setCommentError(null) }}
            autoFocus
            disabled={commenting}
          />
          <button
            type="submit"
            className={styles.commentSubmit}
            disabled={!draft.trim() || commenting}
          >
            {commenting ? 'Enviando...' : 'Enviar'}
          </button>
        </form>
      )}
    </div>
  )
}

// ── MuralTab ──────────────────────────────────────────────────────────────

function MuralTab({ classData, classId, isTeacher, user, onPostAdded }) {
  const { addMessageToMural, loading: posting, error: postError } = useClass()
  const [composerOpen, setComposerOpen] = useState(false)
  const [draft,        setDraft]        = useState('')
  const [postingError, setPostingError] = useState(null)

  async function handlePublish() {
    const text = draft.trim()
    if (!text) return
    
    setPostingError(null)
    try {
      await addMessageToMural(classId, text)
      setDraft('')
      setComposerOpen(false)
      if (onPostAdded) onPostAdded()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao publicar'
      setPostingError(msg)
    }
  }

  function handleKeyDown(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') handlePublish()
    if (e.key === 'Escape') { setComposerOpen(false); setDraft('') }
  }

  // Transform mural items (tipo='mensagem' or tipo='sistema') into readable post format
  const posts = (classData?.mural ?? [])
    .filter(item => item.tipo === 'mensagem' || item.tipo === 'sistema')
    .map(item => ({
      id: item.id,
      author: item.autor,
      initial: (item.autor?.[0] ?? 'U').toUpperCase(),
      text: item.texto,
      type: item.tipo === 'sistema' ? 'system' : 'normal',
      createdAt: item.createdAt,
      comentarios: item.comentarios ?? [],
    }))

  return (
    <div className={styles.muralWrap}>

      {/* Teacher composer */}
      {isTeacher && (
        <div className={styles.composerCard}>
          {!composerOpen ? (
            <button
              className={styles.composerCollapsed}
              onClick={() => setComposerOpen(true)}
            >
              <Avatar
                initial={(user?.name ?? 'P')[0].toUpperCase()}
                bg="var(--accent-soft)"
                color="var(--accent)"
                size={36}
              />
              <span className={styles.composerPlaceholder}>
                Compartilhe algo com a turma…
              </span>
            </button>
          ) : (
            <div className={styles.composerExpanded}>
              <div className={styles.composerTop}>
                <Avatar
                  initial={(user?.name ?? 'P')[0].toUpperCase()}
                  bg="var(--accent-soft)"
                  color="var(--accent)"
                  size={36}
                />
                <textarea
                  className={styles.composerTextarea}
                  placeholder="Escreva um anúncio, tarefa ou aviso para a turma…"
                  value={draft}
                  onChange={e => { setDraft(e.target.value); setPostingError(null) }}
                  onKeyDown={handleKeyDown}
                  rows={4}
                  autoFocus
                  disabled={posting}
                />
              </div>
              {(postingError || postError) && (
                <div style={{ color: 'var(--error)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                  {postingError || postError}
                </div>
              )}
              <div className={styles.composerActions}>
                <span className={styles.composerHint}>Ctrl + Enter para publicar</span>
                <button
                  className={styles.composerCancel}
                  onClick={() => { setComposerOpen(false); setDraft(''); setPostingError(null) }}
                  disabled={posting}
                >
                  Cancelar
                </button>
                <Button
                  variant="primary"
                  onClick={handlePublish}
                  disabled={!draft.trim() || posting}
                >
                  {posting ? 'Publicando...' : 'Publicar'}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Feed */}
      {posts.length === 0 ? (
        <EmptyState
          icon="📭"
          text="Nenhuma publicação ainda. Comece a conversa!"
        />
      ) : (
        <div className={styles.postList}>
          {posts.map(p => (
            <PostItem
              key={p.id}
              post={p}
              user={user}
              isTeacher={isTeacher}
              classId={classId}
              onCommentAdded={onPostAdded}
              onDelete={() => {}} // TODO: implement delete via service
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ── ActivityCard ──────────────────────────────────────────────────────────

function ActivityCard({ activity, isTeacher, onDelete, disciplina, nivel }) {
  return (
    <div className={styles.activityCard}>
      <div className={styles.activityCardHeader}>
        <span className={styles.activityIcon}>📝</span>
        <div className={styles.activityMeta}>
          <span className={styles.activityTitle}>{activity.title}</span>
          {activity.description && (
            <span className={styles.activityDesc}>{activity.description}</span>
          )}
          <div className={styles.activityTags}>
            <Tag value={disciplina} />
            <Tag value={nivel} />
          </div>
        </div>
        <div className={styles.activityRight}>
          {activity.dueDate && (
            <span className={styles.activityDue}>
              📅 {new Date(activity.dueDate + 'T00:00:00').toLocaleDateString('pt-BR', {
                day: 'numeric', month: 'short',
              })}
            </span>
          )}
          <span className={styles.activityStatus}>Aberta</span>
          {isTeacher && (
            <button
              className={styles.activityDeleteBtn}
              onClick={() => onDelete(activity.id)}
              aria-label="Excluir atividade"
              title="Excluir atividade"
            >
              🗑
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── CreateActivityModal ───────────────────────────────────────────────────

function CreateActivityModal({ onClose, onCreate }) {
  const [title,       setTitle]       = useState('')
  const [description, setDescription] = useState('')
  const [dueDate,     setDueDate]     = useState('')
  const [error,       setError]       = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim()) { setError('Informe o título da atividade.'); return }
    onCreate({ title: title.trim(), description: description.trim(), dueDate })
    onClose()
  }

  return (
    <ModalShell
      title="Criar atividade"
      icon="📝"
      sub="Crie uma tarefa ou prova para esta turma."
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} noValidate className={modalStyles.form}>
        <InputField
          id="act-title"
          label="Título"
          placeholder="Ex: Lista de exercícios — Funções"
          value={title}
          onChange={e => { setTitle(e.target.value); setError('') }}
          error={error}
          autoFocus
        />
        <InputField
          id="act-desc"
          label="Descrição (opcional)"
          placeholder="Instruções para os alunos"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
        <div className={modalStyles.fieldWrap}>
          <label htmlFor="act-due" className={modalStyles.label}>
            Data de entrega (opcional)
          </label>
          <input
            id="act-due"
            type="date"
            className={modalStyles.select}
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
          />
        </div>
        <div className={modalStyles.actions}>
          <Button variant="outline" type="button" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" type="submit">Criar atividade</Button>
        </div>
      </form>
    </ModalShell>
  )
}

// ── AtividadesTab ─────────────────────────────────────────────────────────

function AtividadesTab({ classData, classId, isTeacher, onAddPost, disciplina, nivel }) {
  const { addActivityToMural, loading: posting } = useClass()
  const [actModalOpen, setActModalOpen] = useState(false)
  const [postingError, setPostingError] = useState(null)

  async function handleCreate(fields) {
    setPostingError(null)
    try {
      await addActivityToMural(classId, {
        titulo: fields.title,
        instrucoes: fields.description,
        dataEntrega: fields.dueDate || null,
      })
      setActModalOpen(false)
      if (onAddPost) onAddPost()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao criar atividade'
      setPostingError(msg)
    }
  }

  // Filter mural to only get activities (tipo === 'atividade')
  const activities = (classData?.mural ?? [])
    .filter(item => item.tipo === 'atividade')
    .map(item => ({
      id: item.id,
      title: item.titulo,
      description: item.instrucoes,
      dueDate: item.dataEntrega,
      createdAt: item.createdAt,
    }))

  return (
    <>
      {actModalOpen && (
        <CreateActivityModal
          onClose={() => {
            setActModalOpen(false)
            setPostingError(null)
          }}
          onCreate={handleCreate}
        />
      )}

      {isTeacher && (
        <div className={styles.tabActions}>
          <Button variant="primary" onClick={() => setActModalOpen(true)} disabled={posting}>
            {posting ? 'Criando...' : '+ Criar atividade'}
          </Button>
        </div>
      )}

      {postingError && (
        <div style={{ color: 'var(--error)', fontSize: '0.85rem', marginBottom: '1rem', padding: '0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '0.5rem' }}>
          {postingError}
        </div>
      )}

      {activities.length === 0 ? (
        <EmptyState
          icon="📝"
          text={
            isTeacher
              ? 'Nenhuma atividade criada ainda. Crie uma nova atividade para os alunos.'
              : 'Nenhuma atividade disponível ainda. As atividades do professor aparecerão aqui.'
          }
        />
      ) : (
        <div className={styles.activityList}>
          {activities.map(a => (
            <ActivityCard
              key={a.id}
              activity={a}
              isTeacher={isTeacher}
              onDelete={() => {}}  // TODO: implement delete via service
              disciplina={disciplina}
              nivel={nivel}
            />
          ))}
        </div>
      )}
    </>
  )
}

// ── MateriaisTab ──────────────────────────────────────────────────────────

function MateriaisTab({ classData }) {
  const materiais = classData?.materiais ?? []

  return (
    <div>
      {materiais.length === 0 ? (
        <EmptyState
          icon="📂"
          text="Nenhum material publicado ainda. Materiais adicionados pelo professor aparecerão aqui."
        />
      ) : (
        <div className={styles.activityList}>
          {materiais.map(m => (
            <div key={m.id} className={styles.materialItem} style={{ padding: '1.25rem', borderRadius: '0.75rem', backgroundColor: 'var(--surface-2)', marginBottom: '1rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '1.5rem', minWidth: '2rem', textAlign: 'center' }}>📄</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text)' }}>{m.nome}</div>
                {m.descricao && (
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{m.descricao}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── MembrosTab ────────────────────────────────────────────────────────────

function MembrosTab({ classData, classId, isTeacher, onMemberRemoved }) {
  const { removeMember, loading: removing } = useClass()
  const [removingId, setRemovingId] = useState(null)
  const [removeErrorMsg, setRemoveErrorMsg] = useState(null)
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, studentId: null, studentName: null })
  
  const membres = classData?.membros ?? []
  
  // Find professor data
  const professorMember = membres.find(m => m.role === 'teacher')
  const professorName = professorMember?.nome ?? classData?.professorNome ?? 'Professor'
  const professorInitial = (professorName?.[0] ?? 'P').toUpperCase()

  // Get students
  const students = membres.filter(m => m.role === 'student')

  function handleRemoveStudent(studentId, studentName) {
    // Open the confirmation modal instead of using window.confirm()
    setConfirmModal({ isOpen: true, studentId, studentName })
  }

  async function confirmRemoveStudent() {
    const { studentId } = confirmModal
    setConfirmModal({ isOpen: false, studentId: null, studentName: null })
    
    setRemovingId(studentId)
    setRemoveErrorMsg(null)

    try {
      await removeMember(classId, studentId)
      // Trigger refetch to update members list
      if (onMemberRemoved) onMemberRemoved()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao remover aluno'
      setRemoveErrorMsg(msg)
    } finally {
      setRemovingId(null)
    }
  }

  function cancelRemoveStudent() {
    setConfirmModal({ isOpen: false, studentId: null, studentName: null })
  }

  return (
    <div className={styles.membersWrap}>
      {/* Confirm modal for removing student */}
      {confirmModal.isOpen && (
        <ConfirmModal
          title="Remover aluno"
          message={`Tem certeza que deseja remover ${confirmModal.studentName} da turma? Esta ação não pode ser desfeita.`}
          confirmLabel="Remover"
          onConfirm={confirmRemoveStudent}
          onCancel={cancelRemoveStudent}
        />
      )}

      {removeErrorMsg && (
        <div style={{ color: 'var(--error)', fontSize: '0.85rem', marginBottom: '1rem', padding: '0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '0.5rem' }}>
          {removeErrorMsg}
        </div>
      )}

      <div className={styles.membersGroup}>
        <span className={styles.membersGroupLabel}>Professor</span>
        <div className={styles.memberRow}>
          <Avatar initial={professorInitial} bg="var(--accent-soft)" color="var(--accent)" size={38} />
          <div className={styles.memberInfo}>
            <span className={styles.memberName}>{professorName}</span>
            <span className={styles.memberRole}>Professor</span>
          </div>
          <span className={styles.memberBadge}>Professor</span>
        </div>
      </div>

      <div className={styles.membersGroup}>
        <span className={styles.membersGroupLabel}>Alunos · {students.length}</span>
        {students.length === 0 ? (
          <EmptyState
            icon="👤"
            text={`Nenhum aluno entrou ainda. Compartilhe o código ${classData?.codigo ?? '...'} para que alunos entrem na turma.`}
          />
        ) : (
          students.map((s) => (
            <div key={s.id} className={styles.memberRow}>
              <Avatar initial={(s.nome?.[0] ?? 'A').toUpperCase()} bg="var(--surface-3)" color="var(--text-secondary)" size={38} />
              <div className={styles.memberInfo}>
                <span className={styles.memberName}>{s.nome}</span>
                <span className={styles.memberRole}>Aluno</span>
              </div>
              {/* Remove button — teacher only */}
              {isTeacher && (
                <button
                  className={styles.memberRemoveBtn}
                  onClick={() => handleRemoveStudent(s.id, s.nome)}
                  aria-label="Remover aluno"
                  title="Remover aluno da turma"
                  disabled={removingId === s.id || removing}
                >
                  {removingId === s.id ? '⏳' : '🗑'}
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────

export default function ClassPage() {
  const { id }    = useParams()
  const { user }  = useAuth()
  const navigate  = useNavigate()
  const isTeacher = user?.role === 'teacher'

  // Service hook
  const { getClassById, error } = useClass()

  // State
  const [classData, setClassData] = useState(MOCK)
  const [activeTab, setActiveTab] = useState('mural')
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const isPublic  = classData?.tipo === 'PUBLICA'
  const backPath  = ROLE_ROUTES[user?.role] ?? '/dashboard'
  const Sidebar   = isTeacher ? TeacherSidebar : DashboardSidebar

  // Fetch class data on mount and when refreshTrigger changes
  useEffect(() => {
    if (!id) return
    
    (async () => {
      try {
        const data = await getClassById(id)
        setClassData(data)
      } catch (err) {
        console.error('Erro ao carregar turma:', err)
        // Keep showing MOCK or previously loaded data
      }
    })()
  }, [id, getClassById, refreshTrigger])

  if (error) {
    return (
      <AppLayout sidebar={Sidebar} header={DashboardHeader}>
        <div className={styles.page}>
          <button className={styles.backBtn} onClick={() => navigate(backPath)}>
            ← Voltar ao painel
          </button>
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--error)' }}>
            <p>❌ Erro ao carregar turma</p>
            <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>{error}</p>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout sidebar={Sidebar} header={DashboardHeader}>
      <div className={styles.page}>

        {/* Back */}
        <button className={styles.backBtn} onClick={() => navigate(backPath)}>
          ← Voltar ao painel
        </button>

        {/* Class header */}
        <div className={styles.classHeader}>
          <div className={styles.classHeaderLeft}>
            <span className={styles.classIcon}>
              {SUBJECT_EMOJI[classData?.disciplina] ?? '📚'}
            </span>
            <div className={styles.classMeta}>
              <h1 className={styles.className}>{classData?.nome}</h1>
              <div className={styles.classPills}>
                <Tag value={classData?.disciplina} size="md" />
                <Tag value={classData?.nivel} size="md" />
              </div>
              {classData?.descricao && (
                <p className={styles.classDesc}>{classData.descricao}</p>
              )}
            </div>
          </div>

          <div className={styles.classHeaderRight}>
            {/* Type badge — top-right, filled soft color, separate from subject/level */}
            <span className={styles.typeBadge} style={typeBadgeStyle(classData?.tipo)}>
              {isPublic ? '🌐 Pública' : '🔒 Privada'}
            </span>
            <div className={styles.codeBox}>
              <span className={styles.codeLabel}>Código</span>
              <code className={styles.code}>{classData?.codigo ?? 'CARREGANDO...'}</code>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className={styles.tabBar} role="tablist">
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

        {/* Tab content — conditionally render based on activeTab */}
        <div className={styles.tabContent}>
          {activeTab === 'mural' && (
            <MuralTab
              classData={classData}
              classId={id}
              isTeacher={isTeacher}
              user={user}
              onPostAdded={() => setRefreshTrigger(prev => prev + 1)}
            />
          )}

          {activeTab === 'atividades' && (
            <AtividadesTab
              classData={classData}
              classId={id}
              isTeacher={isTeacher}
              user={user}
              onAddPost={() => setRefreshTrigger(prev => prev + 1)}
              disciplina={classData?.disciplina ?? 'Disciplina'}
              nivel={classData?.nivel ?? 'Nível'}
            />
          )}

          {activeTab === 'materiais' && (
            <MateriaisTab
              classData={classData}
              classId={id}
              isTeacher={isTeacher}
            />
          )}

          {activeTab === 'membros' && (
            <MembrosTab
              classData={classData}
              classId={id}
              user={user}
              isTeacher={isTeacher}
              onMemberRemoved={() => setRefreshTrigger(prev => prev + 1)}
            />
          )}
        </div>

      </div>
    </AppLayout>
  )
}
