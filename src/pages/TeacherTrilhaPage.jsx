import { useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import TeacherLayout from '../components/teacher/TeacherLayout'
import Icon from '../components/ui/Icon'
import { useAulas } from '../hooks/useAulas'
import styles from './TeacherTrilhaPage.module.css'

const SUBJECT_EMOJI = {
  Matemática: '📐', Português: '📖', Química: '⚗️', Biologia: '🧬',
  Física: '⚡', Geografia: '🌍', História: '📜', Inglês: '🌐',
  Artes: '🎨', Informática: '💻', Filosofia: '🧠', Sociologia: '⚖️',
}

const TIPO_LABEL = { texto: '📄 Texto', video: '🎥 Vídeo' }
const EMPTY_FORM = { titulo: '', tipo: 'texto', conteudo: '' }

export default function TeacherTrilhaPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { state: trilha } = useLocation()

  const { aulas, loading, error, createAula, deleteAula } = useAulas(id)

  const [formOpen, setFormOpen]   = useState(false)
  const [form, setForm]           = useState(EMPTY_FORM)
  const [formError, setFormError] = useState('')
  const [saving, setSaving]       = useState(false)

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

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setFormError('')
  }

  async function handleSave() {
    if (!form.titulo.trim())   { setFormError('O título é obrigatório.');   return }
    if (!form.conteudo.trim()) { setFormError('O conteúdo é obrigatório.'); return }

    setSaving(true)
    try {
      await createAula({ ...form, trilhaId: Number(id) })
      setForm(EMPTY_FORM)
      setFormOpen(false)
    } catch (err) {
      setFormError(err.message || 'Erro ao salvar aula.')
    } finally {
      setSaving(false)
    }
  }

  function handleCancel() {
    setForm(EMPTY_FORM)
    setFormError('')
    setFormOpen(false)
  }

  async function handleDelete(aulaId) {
    try {
      await deleteAula(aulaId)
    } catch {
      // error already set in hook
    }
  }

  return (
    <TeacherLayout>
      <div className={styles.page}>

        {/* ── Breadcrumb ── */}
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
                {loading
                  ? 'Carregando...'
                  : aulas.length === 0
                    ? 'Nenhuma aula ainda.'
                    : `${aulas.length} aula${aulas.length !== 1 ? 's' : ''}`}
              </p>
            </div>
            {!formOpen && (
              <button className={styles.addBtn} onClick={() => setFormOpen(true)}>
                <Icon name="plus" size={15} /> Adicionar aula
              </button>
            )}
          </div>

          {/* ── Erro de carregamento ── */}
          {error && (
            <div className={styles.errorBanner}>
              <Icon name="warning" size={15} /> {error}
            </div>
          )}

          {/* ── Formulário inline ── */}
          {formOpen && (
            <div className={styles.form}>
              <h3 className={styles.formTitle}>Nova aula</h3>

              <div className={styles.field}>
                <label className={styles.label}>Título</label>
                <input
                  className={styles.input}
                  name="titulo"
                  placeholder="Ex: Introdução à álgebra"
                  value={form.titulo}
                  onChange={handleChange}
                  autoFocus
                  disabled={saving}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Tipo</label>
                <select className={styles.select} name="tipo" value={form.tipo} onChange={handleChange} disabled={saving}>
                  <option value="texto">📄 Texto</option>
                  <option value="video">🎥 Vídeo</option>
                </select>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>
                  {form.tipo === 'video' ? 'Link do vídeo' : 'Conteúdo'}
                </label>
                {form.tipo === 'video' ? (
                  <input
                    className={styles.input}
                    name="conteudo"
                    placeholder="https://youtube.com/..."
                    value={form.conteudo}
                    onChange={handleChange}
                    disabled={saving}
                  />
                ) : (
                  <textarea
                    className={styles.textarea}
                    name="conteudo"
                    placeholder="Escreva o conteúdo da aula aqui..."
                    value={form.conteudo}
                    onChange={handleChange}
                    rows={5}
                    disabled={saving}
                  />
                )}
              </div>

              {formError && <p className={styles.error}>{formError}</p>}

              <div className={styles.formActions}>
                <button className={styles.cancelBtn} onClick={handleCancel} disabled={saving}>
                  Cancelar
                </button>
                <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
                  {saving ? 'Salvando...' : 'Salvar aula'}
                </button>
              </div>
            </div>
          )}

          {/* ── Loading state ── */}
          {loading && !formOpen && (
            <div className={styles.empty}>
              <span className={styles.emptyIcon}>⏳</span>
              <p className={styles.emptyText}>Carregando aulas...</p>
            </div>
          )}

          {/* ── Empty state ── */}
          {!loading && aulas.length === 0 && !formOpen && (
            <div className={styles.empty}>
              <span className={styles.emptyIcon}>📭</span>
              <p className={styles.emptyText}>Nenhuma aula ainda. Comece adicionando conteúdo.</p>
              <button className={styles.addBtn} onClick={() => setFormOpen(true)}>
                <Icon name="plus" size={15} /> Adicionar aula
              </button>
            </div>
          )}

          {/* ── Lista de aulas ── */}
          {!loading && aulas.length > 0 && (
            <div className={styles.aulasList}>
              {aulas.map((aula, index) => (
                <div key={aula.id} className={styles.aulaCard}>
                  <div className={styles.aulaNum}>{index + 1}</div>
                  <div className={styles.aulaBody}>
                    <div className={styles.aulaTop}>
                      <span className={styles.aulaTitle}>{aula.titulo}</span>
                      <span className={styles.aulaTipo}>{TIPO_LABEL[aula.tipo] ?? aula.tipo}</span>
                    </div>
                    <p className={styles.aulaConteudo}>
                      {aula.tipo === 'video'
                        ? <a href={aula.conteudo} target="_blank" rel="noreferrer" className={styles.aulaLink}>{aula.conteudo}</a>
                        : aula.conteudo}
                    </p>
                  </div>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => handleDelete(aula.id)}
                    aria-label="Remover aula"
                  >
                    <Icon name="close" size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </TeacherLayout>
  )
}
