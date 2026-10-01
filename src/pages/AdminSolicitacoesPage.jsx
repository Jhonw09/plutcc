import { useState, useEffect, useCallback } from 'react'
import AdminLayout from '../components/admin/AdminLayout'
import Icon from '../components/ui/Icon'
import { Toast } from '../components/ui/Toast'
import { useToast } from '../hooks/useToast'
import { solicitacaoService } from '../api/services/solicitacaoService'
import styles from './AdminSolicitacoesPage.module.css'

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function DetailModal({ solicitacaoId, onClose, onAprovar, onReprovar, submitting }) {
  const [detalhe, setDetalhe] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')
  const [showReprovar, setShowReprovar] = useState(false)
  const [motivo, setMotivo] = useState('')
  const [showConfirmAprovar, setShowConfirmAprovar] = useState(false)

  useEffect(() => {
    solicitacaoService.buscarPorId(solicitacaoId)
      .then(setDetalhe)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [solicitacaoId])

  function handleBackdrop(e) {
    if (e.target === e.currentTarget) onClose()
  }

  async function handleAprovar() {
    await onAprovar(solicitacaoId)
    setShowConfirmAprovar(false)
  }

  async function handleReprovar() {
    if (!motivo.trim()) return
    await onReprovar(solicitacaoId, motivo.trim())
    setShowReprovar(false)
  }

  return (
    <div className={styles.backdrop} onClick={handleBackdrop}>
      <div className={styles.modal} role="dialog" aria-modal="true">
        <div className={styles.modalHeader}>
          <span className={styles.modalTitle}>Analisar solicitação</span>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Fechar">
            <Icon name="x" size={16} />
          </button>
        </div>

        {loading && <div className={styles.modalLoading}>Carregando...</div>}
        {error   && <div className={styles.modalError}><Icon name="alertCircle" size={13} /> {error}</div>}

        {detalhe && !loading && (
          <div className={styles.modalBody}>
            <div className={styles.fieldGroup}>
              <span className={styles.fieldLabel}>Nome</span>
              <span className={styles.fieldValue}>{detalhe.usuarioNome ?? '—'}</span>
            </div>
            <div className={styles.fieldGroup}>
              <span className={styles.fieldLabel}>E-mail</span>
              <span className={styles.fieldValue}>{detalhe.usuarioEmail ?? '—'}</span>
            </div>
            <div className={styles.fieldGroup}>
              <span className={styles.fieldLabel}>Tipo de comprovante</span>
              <span className={styles.fieldValue}>{detalhe.tipoComprovante ?? '—'}</span>
            </div>
            <div className={styles.fieldGroup}>
              <span className={styles.fieldLabel}>Data da solicitação</span>
              <span className={styles.fieldValue}>{formatDate(detalhe.dataSolicitacao)}</span>
            </div>
            <div className={styles.fieldGroup}>
              <span className={styles.fieldLabel}>Status</span>
              <span className={`${styles.badge} ${styles[detalhe.status?.toLowerCase()]}`}>{detalhe.status}</span>
            </div>
            <div className={styles.fieldGroup}>
              <span className={styles.fieldLabel}>Documento</span>
              <div className={styles.docRow}>
                <a
                  href={detalhe.comprovanteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.docLink}
                >
                  <Icon name="externalLink" size={13} /> Abrir documento
                </a>
                <span className={styles.docWarning}>
                  O documento foi fornecido pelo candidato através de um link externo.
                </span>
              </div>
            </div>

            {detalhe.status === 'PENDENTE' && (
              <div className={styles.modalActions}>
                {!showConfirmAprovar && !showReprovar && (
                  <>
                    <button
                      className={styles.btnAprovar}
                      onClick={() => setShowConfirmAprovar(true)}
                      disabled={!!submitting}
                    >
                      <Icon name="checkCircle" size={14} /> Aprovar solicitação
                    </button>
                    <button
                      className={styles.btnReprovar}
                      onClick={() => setShowReprovar(true)}
                      disabled={!!submitting}
                    >
                      <Icon name="xCircle" size={14} /> Reprovar solicitação
                    </button>
                  </>
                )}

                {showConfirmAprovar && (
                  <div className={styles.confirmBox}>
                    <p className={styles.confirmText}>Tem certeza que deseja aprovar esta solicitação?</p>
                    <div className={styles.confirmActions}>
                      <button className={styles.btnSecondary} onClick={() => setShowConfirmAprovar(false)} disabled={!!submitting}>
                        Cancelar
                      </button>
                      <button className={styles.btnAprovar} onClick={handleAprovar} disabled={submitting === solicitacaoId}>
                        {submitting === solicitacaoId ? 'Aprovando...' : 'Confirmar aprovação'}
                      </button>
                    </div>
                  </div>
                )}

                {showReprovar && (
                  <div className={styles.reprovarBox}>
                    <label className={styles.reprovarLabel} htmlFor="motivo">
                      Motivo da reprovação <span className={styles.required}>*</span>
                    </label>
                    <textarea
                      id="motivo"
                      className={styles.reprovarTextarea}
                      placeholder="Ex: O comprovante não foi considerado válido."
                      value={motivo}
                      onChange={e => setMotivo(e.target.value)}
                      rows={3}
                    />
                    <div className={styles.confirmActions}>
                      <button className={styles.btnSecondary} onClick={() => { setShowReprovar(false); setMotivo('') }} disabled={!!submitting}>
                        Cancelar
                      </button>
                      <button
                        className={styles.btnReprovar}
                        onClick={handleReprovar}
                        disabled={!motivo.trim() || submitting === `r_${solicitacaoId}`}
                      >
                        {submitting === `r_${solicitacaoId}` ? 'Reprovando...' : 'Confirmar reprovação'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function AdminSolicitacoesPage() {
  const [lista,      setLista]      = useState([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState('')
  const [selectedId, setSelectedId] = useState(null)
  const [submitting, setSubmitting] = useState(null)
  const { toasts, toast, dismiss }  = useToast()

  const carregar = useCallback(() => {
    setLoading(true)
    setError('')
    solicitacaoService.listarPendentes()
      .then(setLista)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { carregar() }, [carregar])

  async function handleAprovar(id) {
    setSubmitting(id)
    try {
      await solicitacaoService.aprovar(id)
      setLista(prev => prev.filter(s => s.id !== id))
      setSelectedId(null)
      toast('Solicitação aprovada com sucesso.', 'success')
    } catch (e) {
      toast(e.message, 'error')
    } finally {
      setSubmitting(null)
    }
  }

  async function handleReprovar(id, motivo) {
    setSubmitting(`r_${id}`)
    try {
      await solicitacaoService.reprovar(id, motivo)
      setLista(prev => prev.filter(s => s.id !== id))
      setSelectedId(null)
      toast('Solicitação reprovada.', 'success')
    } catch (e) {
      toast(e.message, 'error')
    } finally {
      setSubmitting(null)
    }
  }

  return (
    <AdminLayout>
      <div className={styles.page}>
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.title}>Solicitações de professores</h1>
            <p className={styles.sub}>Analise e aprove ou reprove candidatos a professor</p>
          </div>
          {!loading && (
            <span className={styles.counter}>
              <Icon name="clock" size={13} />
              {lista.length} pendente{lista.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {error && (
          <div className={styles.errorBanner}>
            <Icon name="alertCircle" size={13} /> {error}
          </div>
        )}

        <div className={styles.card}>
          {loading ? (
            <div className={styles.empty}>Carregando solicitações...</div>
          ) : lista.length === 0 ? (
            <div className={styles.empty}>
              <Icon name="checkCircle" size={28} />
              <span>Nenhuma solicitação pendente no momento.</span>
            </div>
          ) : (
            <div className={styles.list}>
              {lista.map(s => (
                <div key={s.id} className={styles.item}>
                  <div className={styles.itemAvatar}>
                    {(s.usuarioNome ?? '?').charAt(0).toUpperCase()}
                  </div>
                  <div className={styles.itemInfo}>
                    <span className={styles.itemNome}>{s.usuarioNome ?? '—'}</span>
                    <span className={styles.itemEmail}>{s.usuarioEmail ?? '—'}</span>
                    <div className={styles.itemMeta}>
                      <span className={styles.itemTipo}>{s.tipoComprovante ?? '—'}</span>
                      <span className={styles.itemDot}>·</span>
                      <span className={styles.itemData}>{formatDate(s.dataSolicitacao)}</span>
                    </div>
                  </div>
                  <span className={`${styles.badge} ${styles.pendente}`}>PENDENTE</span>
                  <button
                    className={styles.btnAnalisar}
                    onClick={() => setSelectedId(s.id)}
                  >
                    Analisar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedId && (
          <DetailModal
            solicitacaoId={selectedId}
            onClose={() => setSelectedId(null)}
            onAprovar={handleAprovar}
            onReprovar={handleReprovar}
            submitting={submitting}
          />
        )}

        <Toast toasts={toasts} onDismiss={dismiss} />
      </div>
    </AdminLayout>
  )
}
