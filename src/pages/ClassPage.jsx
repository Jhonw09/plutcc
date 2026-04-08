import { useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import AppLayout        from '../components/layout/AppLayout'
import DashboardSidebar from '../components/dashboard/DashboardSidebar'
import TeacherSidebar   from '../components/teacher/TeacherSidebar'
import DashboardHeader  from '../components/dashboard/DashboardHeader'
import { Avatar }       from '../components/ui/Avatar'
import { Button }       from '../components/ui/Button'
import { InputField }   from '../components/ui/InputField'
import { useAuth }      from '../context/AuthContext'
import { ROLE_ROUTES }  from '../constants/routes'
import { typeBadgeStyle } from '../utils/subjectColors'
import { Tag } from '../components/ui/Tag'
import styles      from './ClassPage.module.css'
import modalStyles from '../components/teacher/CreateClassModal.module.css'

// ── Mock class data — replace with GET /api/v1/turmas/:id ────────────────
const MOCK = {
  nome:       'Turma de Exemplo',
  disciplina: 'Matemática',
  tipo:       'PUBLICA',
  nivel:      'Médio',
  codigo:     'MAT-EX-0001',
  professor:  'Prof. Carlos Lima',
  descricao:  'Funções, geometria analítica e preparação para o ENEM.',
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

function makePost(user, text, type = 'normal') {
  return {
    id:        Date.now() + Math.random(),
    author:    user?.name ?? 'Professor',
    initial:   (user?.name ?? 'P')[0].toUpperCase(),
    text,
    type,       // 'normal' | 'system'
    createdAt: new Date().toISOString(),
  }
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

function PostItem({ post, user, isTeacher, onDelete }) {
  const [draft,          setDraft]          = useState('')
  const [comments,       setComments]       = useState([])
  const [showCommentBox, setShowCommentBox] = useState(false)

  function submitComment(e) {
    e.preventDefault()
    const text = draft.trim()
    if (!text) return
    setComments(prev => [...prev, {
      id:        Date.now(),
      author:    user?.name ?? 'Você',
      initial:   (user?.name ?? 'V')[0].toUpperCase(),
      text,
      createdAt: new Date().toISOString(),
    }])
    setDraft('')
  }

  function deleteComment(id) {
    setComments(prev => prev.filter(c => c.id !== id))
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
        >
          💬 {comments.length > 0
            ? `${comments.length} comentário${comments.length !== 1 ? 's' : ''}`
            : 'Comentar'}
        </button>
      )}

      {/* Comment list */}
      {comments.length > 0 && (
        <div className={styles.commentList}>
          {comments.map(c => (
            <div key={c.id} className={styles.commentRow}>
              <Avatar
                initial={c.initial}
                bg="var(--surface-3)"
                color="var(--text-secondary)"
                size={28}
              />
              <div className={styles.commentBubble}>
                <span className={styles.commentAuthor}>{c.author}</span>
                <span className={styles.commentText}>{c.text}</span>
              </div>
              <span className={styles.commentTime}>{formatTime(c.createdAt)}</span>
              {/* Delete comment — available to everyone for their own UX */}
              <button
                className={styles.commentDeleteBtn}
                onClick={() => deleteComment(c.id)}
                aria-label="Excluir comentário"
                title="Excluir comentário"
              >
                ✕
              </button>
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
            onChange={e => setDraft(e.target.value)}
            autoFocus
          />
          <button
            type="submit"
            className={styles.commentSubmit}
            disabled={!draft.trim()}
          >
            Enviar
          </button>
        </form>
      )}
    </div>
  )
}

// ── MuralTab ──────────────────────────────────────────────────────────────

function MuralTab({ posts, setPosts, isTeacher, user }) {
  const [composerOpen, setComposerOpen] = useState(false)
  const [draft,        setDraft]        = useState('')

  function handlePublish() {
    const text = draft.trim()
    if (!text) return
    setPosts(prev => [makePost(user, text), ...prev])
    setDraft('')
    setComposerOpen(false)
  }

  function handleKeyDown(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') handlePublish()
    if (e.key === 'Escape') { setComposerOpen(false); setDraft('') }
  }

  function deletePost(id) {
    setPosts(prev => prev.filter(p => p.id !== id))
  }

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
                  onChange={e => setDraft(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={4}
                  autoFocus
                />
              </div>
              <div className={styles.composerActions}>
                <span className={styles.composerHint}>Ctrl + Enter para publicar</span>
                <button
                  className={styles.composerCancel}
                  onClick={() => { setComposerOpen(false); setDraft('') }}
                >
                  Cancelar
                </button>
                <Button
                  variant="primary"
                  onClick={handlePublish}
                  disabled={!draft.trim()}
                >
                  Publicar
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
          text="Nenhuma publicação ainda. Quando o backend estiver conectado, as publicações e comentários da turma aparecerão aqui."
        />
      ) : (
        <div className={styles.postList}>
          {posts.map(p => (
            <PostItem
              key={p.id}
              post={p}
              user={user}
              isTeacher={isTeacher}
              onDelete={deletePost}
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

function AtividadesTab({ isTeacher, user, onAddPost, disciplina, nivel }) {
  const [activities,   setActivities]   = useState([])
  const [actModalOpen, setActModalOpen] = useState(false)

  function handleCreate(fields) {
    const newActivity = { id: Date.now(), ...fields }
    setActivities(prev => [newActivity, ...prev])

    // Inject a system post into the Mural so students are notified
    onAddPost(makePost(
      user,
      `📝 Nova atividade criada: "${fields.title}"${fields.dueDate
        ? ` — entrega em ${new Date(fields.dueDate + 'T00:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}`
        : ''}.`,
      'system',
    ))
  }

  function deleteActivity(id) {
    setActivities(prev => prev.filter(a => a.id !== id))
  }

  return (
    <>
      {actModalOpen && (
        <CreateActivityModal
          onClose={() => setActModalOpen(false)}
          onCreate={handleCreate}
        />
      )}

      {isTeacher && (
        <div className={styles.tabActions}>
          <Button variant="primary" onClick={() => setActModalOpen(true)}>
            + Criar atividade
          </Button>
        </div>
      )}

      {activities.length === 0 ? (
        <EmptyState
          icon="📝"
          text={
            isTeacher
              ? 'Nenhuma atividade criada ainda. Quando o backend estiver conectado, as atividades aparecerão aqui.'
              : 'Nenhuma atividade disponível ainda. Quando o backend estiver conectado, as atividades aparecerão aqui.'
          }
        />
      ) : (
        <div className={styles.activityList}>
          {activities.map(a => (
            <ActivityCard
              key={a.id}
              activity={a}
              isTeacher={isTeacher}
              onDelete={deleteActivity}
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

function MateriaisTab() {
  return (
    <EmptyState
      icon="📂"
      text="Nenhum material publicado ainda. Materiais adicionados pelo professor aparecerão aqui."
    />
  )
}

// ── MembrosTab ────────────────────────────────────────────────────────────

function MembrosTab({ classe, user, isTeacher }) {
  const students = [] // TODO: GET /api/v1/turmas/:id/alunos

  // If the viewer is the teacher, use the live auth name.
  // Otherwise fall back to whatever the class data says (future: backend will
  // return the real teacher name as part of GET /api/v1/turmas/:id).
  const teacherName    = isTeacher ? (user?.name ?? classe.professor) : classe.professor
  const teacherInitial = teacherName?.[0]?.toUpperCase() ?? 'P'

  return (
    <div className={styles.membersWrap}>
      <div className={styles.membersGroup}>
        <span className={styles.membersGroupLabel}>Professor</span>
        <div className={styles.memberRow}>
          <Avatar initial={teacherInitial} bg="var(--accent-soft)" color="var(--accent)" size={38} />
          <div className={styles.memberInfo}>
            <span className={styles.memberName}>{teacherName}</span>
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
            text={`Nenhum aluno entrou ainda. Compartilhe o código ${classe.codigo} para que alunos entrem na turma.`}
          />
        ) : (
          students.map((s, i) => (
            <div key={i} className={styles.memberRow}>
              <Avatar initial={s.name[0]} bg="var(--surface-3)" color="var(--text-secondary)" size={38} />
              <div className={styles.memberInfo}>
                <span className={styles.memberName}>{s.name}</span>
              </div>
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
  const location  = useLocation()
  const isTeacher = user?.role === 'teacher'

  // ── Lifted state — shared between MuralTab and AtividadesTab ──
  const [posts,      setPosts]      = useState([])
  const [activeTab,  setActiveTab]  = useState('mural')

  // Prefer data passed via navigation state; fall back to MOCK on direct URL visit.
  // TODO: replace MOCK fallback with fetch(`/api/v1/turmas/${id}`)
  const classe   = { ...MOCK, ...location.state, id }
  const isPublic  = classe.tipo === 'PUBLICA'
  const backPath  = ROLE_ROUTES[user?.role] ?? '/dashboard'
  const Sidebar   = isTeacher ? TeacherSidebar : DashboardSidebar

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
              {SUBJECT_EMOJI[classe.disciplina] ?? '📚'}
            </span>
            <div className={styles.classMeta}>
              <h1 className={styles.className}>{classe.nome}</h1>
              <div className={styles.classPills}>
                <Tag value={classe.disciplina} size="md" />
                <Tag value={classe.nivel} size="md" />
              </div>
              {classe.descricao && (
                <p className={styles.classDesc}>{classe.descricao}</p>
              )}
            </div>
          </div>

          <div className={styles.classHeaderRight}>
            {/* Type badge — top-right, filled soft color, separate from subject/level */}
            <span className={styles.typeBadge} style={typeBadgeStyle(classe.tipo)}>
              {isPublic ? '🌐 Pública' : '🔒 Privada'}
            </span>
            <div className={styles.codeBox}>
              <span className={styles.codeLabel}>Código</span>
              <code className={styles.code}>{classe.codigo}</code>
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

        {/* Tab content */}
        <div className={styles.tabContent}>
          {activeTab === 'mural' && (
            <MuralTab
              posts={posts}
              setPosts={setPosts}
              isTeacher={isTeacher}
              user={user}
            />
          )}
          {activeTab === 'materiais'  && <MateriaisTab />}
          {activeTab === 'atividades' && (
            <AtividadesTab
              isTeacher={isTeacher}
              user={user}
              onAddPost={post => setPosts(prev => [post, ...prev])}
              disciplina={classe.disciplina}
              nivel={classe.nivel}
            />
          )}
          {activeTab === 'membros' && (
            <MembrosTab classe={classe} user={user} isTeacher={isTeacher} />
          )}
        </div>

      </div>
    </AppLayout>
  )
}
