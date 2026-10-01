import { useState } from 'react'
import Icon from '../ui/Icon'
import { regenerarCodigoAcesso } from '../../api/services/trilhaService'
import styles from './TrailConfiguracoes.module.css'

export default function TrailConfiguracoes({ trilha, onUpdate, onDelete }) {
  const [nome,      setNome]      = useState(trilha.nome      ?? '')
  const [descricao, setDescricao] = useState(trilha.descricao ?? '')
  const [tipo,      setTipo]      = useState(trilha.tipo      ?? 'PUBLICA')
  const [saving,    setSaving]    = useState(false)
  const [saveMsg,   setSaveMsg]   = useState(null)
  const [confirmDelete,    setConfirmDelete]    = useState(false)
  const [deleting,         setDeleting]         = useState(false)
  const [codigo,           setCodigo]           = useState(trilha.codigoAcesso ?? null)
  const [copiado,          setCopiado]          = useState(false)
  const [confirmRegen,     setConfirmRegen]     = useState(false)
  const [regenLoading,     setRegenLoading]     = useState(false)

  const dirty = nome !== trilha.nome || descricao !== (trilha.descricao ?? '') || tipo !== trilha.tipo

  async function handleSave() {
    if (!nome.trim()) return
    setSaving(true)
    setSaveMsg(null)
    try {
      const updated = await onUpdate({ nome: nome.trim(), descricao: descricao.trim(), tipo })
      // Se mudou para PRIVADA e veio código novo do backend, atualiza
      if (updated?.codigoAcesso) setCodigo(updated.codigoAcesso)
      if (tipo === 'PUBLICA') setCodigo(null)
      setSaveMsg({ type: 'success', text: 'Alterações salvas com sucesso!' })
    } catch (err) {
      setSaveMsg({ type: 'error', text: err.message || 'Erro ao salvar.' })
    } finally {
      setSaving(false)
    }
  }

  async function handleRegenerar() {
    setRegenLoading(true)
    try {
      const data = await regenerarCodigoAcesso(trilha.id)
      setCodigo(data.codigoAcesso)
      setConfirmRegen(false)
      setSaveMsg({ type: 'success', text: 'Código regenerado com sucesso!' })
    } catch (err) {
      setSaveMsg({ type: 'error', text: err.message || 'Erro ao regenerar código.' })
    } finally {
      setRegenLoading(false)
    }
  }

  function handleCopiar() {
    if (!codigo) return
    navigator.clipboard.writeText(codigo).then(() => {
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    })
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      await onDelete()
    } catch (err) {
      setSaveMsg({ type: 'error', text: err.message || 'Erro ao excluir trilha.' })
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  return (
    <div className={styles.container}>

      {/* Informações gerais */}
      <div className={styles.section} data-tour="configuracoes-geral">
        <div className={styles.sectionHead}>
          <div className={styles.sectionIcon}><Icon name="fileText" size={16} /></div>
          <div>
            <h3 className={styles.sectionTitle}>Informações gerais</h3>
            <p className={styles.sectionSub}>Nome e descrição exibidos para os alunos</p>
          </div>
        </div>

        <div className={styles.fields}>
          <div className={styles.field}>
            <label className={styles.label}>Nome da trilha</label>
            <input
              className={styles.input}
              value={nome}
              onChange={e => setNome(e.target.value)}
              placeholder="Ex: Matemática do Zero"
              maxLength={100}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Descrição</label>
            <textarea
              className={styles.textarea}
              value={descricao}
              onChange={e => setDescricao(e.target.value)}
              placeholder="Descreva o conteúdo e objetivos da trilha..."
              rows={4}
              maxLength={500}
            />
            <span className={styles.charCount}>{descricao.length}/500</span>
          </div>
        </div>
      </div>

      {/* Visibilidade */}
      <div className={styles.section}>
        <div className={styles.sectionHead}>
          <div className={styles.sectionIcon}><Icon name="globe" size={16} /></div>
          <div>
            <h3 className={styles.sectionTitle}>Visibilidade</h3>
            <p className={styles.sectionSub}>Controle quem pode encontrar e acessar esta trilha</p>
          </div>
        </div>

        <div className={styles.visibilityOptions}>
          <button
            className={`${styles.visOption} ${tipo === 'PUBLICA' ? styles.visOptionActive : ''}`}
            onClick={() => setTipo('PUBLICA')}
          >
            <div className={styles.visOptionIcon} data-active={tipo === 'PUBLICA'}>
              <Icon name="globe" size={18} />
            </div>
            <div className={styles.visOptionInfo}>
              <span className={styles.visOptionTitle}>Pública</span>
              <span className={styles.visOptionDesc}>Qualquer aluno pode encontrar e se matricular</span>
            </div>
            <div className={`${styles.visRadio} ${tipo === 'PUBLICA' ? styles.visRadioActive : ''}`} />
          </button>

          <button
            className={`${styles.visOption} ${tipo === 'PRIVADA' ? styles.visOptionActive : ''}`}
            onClick={() => setTipo('PRIVADA')}
          >
            <div className={styles.visOptionIcon} data-active={tipo === 'PRIVADA'}>
              <Icon name="lock" size={18} />
            </div>
            <div className={styles.visOptionInfo}>
              <span className={styles.visOptionTitle}>Privada</span>
              <span className={styles.visOptionDesc}>Somente alunos com o link podem acessar</span>
            </div>
            <div className={`${styles.visRadio} ${tipo === 'PRIVADA' ? styles.visRadioActive : ''}`} />
          </button>
        </div>
      </div>

      {/* Feedback + salvar */}
      {saveMsg && (
        <div className={saveMsg.type === 'success' ? styles.msgSuccess : styles.msgError}>
          <Icon name={saveMsg.type === 'success' ? 'checkCircle' : 'alertCircle'} size={14} />
          {saveMsg.text}
        </div>
      )}

      <div className={styles.saveRow}>
        <button
          className={styles.saveBtn}
          onClick={handleSave}
          disabled={saving || !dirty || !nome.trim()}
        >
          {saving ? 'Salvando...' : <><Icon name="check" size={14} /> Salvar alterações</>}
        </button>
        {!dirty && <span className={styles.savedHint}>Sem alterações pendentes</span>}
      </div>

      {/* Código de acesso — apenas para trilhas privadas */}
      {tipo === 'PRIVADA' && (
        <div className={styles.section}>
          <div className={styles.sectionHead}>
            <div className={styles.sectionIcon}>
              <Icon name="lock" size={16} />
            </div>
            <div>
              <h3 className={styles.sectionTitle}>Código de acesso</h3>
              <p className={styles.sectionSub}>Compartilhe este código com os alunos que devem ter acesso à trilha</p>
            </div>
          </div>

          {codigo ? (
            <div className={styles.codigoWrap}>
              <div className={styles.codigoBox}>
                <span className={styles.codigoText}>{codigo}</span>
                <button
                  className={styles.copiBtn}
                  onClick={handleCopiar}
                  title="Copiar código"
                  type="button"
                >
                  <Icon name={copiado ? 'check' : 'copy'} size={14} />
                  {copiado ? 'Copiado!' : 'Copiar'}
                </button>
              </div>
              <p className={styles.codigoHint}>
                O aluno informa este código na página da trilha para obter acesso.
              </p>
              {!confirmRegen ? (
                <button
                  className={styles.regenBtn}
                  onClick={() => setConfirmRegen(true)}
                  type="button"
                >
                  <Icon name="refresh" size={13} /> Regenerar código
                </button>
              ) : (
                <div className={styles.deleteConfirm}>
                  <span className={styles.deleteConfirmText}>Alunos com o código antigo perderão acesso?</span>
                  <button
                    className={styles.deleteConfirmYes}
                    onClick={handleRegenerar}
                    disabled={regenLoading}
                    type="button"
                  >
                    {regenLoading ? 'Gerando...' : 'Sim, regenerar'}
                  </button>
                  <button
                    className={styles.deleteConfirmNo}
                    onClick={() => setConfirmRegen(false)}
                    disabled={regenLoading}
                    type="button"
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          ) : (
            <p className={styles.codigoHint}>
              Código não disponível. Salve as alterações ou regenere o código.
            </p>
          )}
        </div>
      )}

      {/* Zona de perigo */}
      <div className={styles.dangerSection}>
        <div className={styles.sectionHead}>
          <div className={`${styles.sectionIcon} ${styles.sectionIconDanger}`}><Icon name="warning" size={16} /></div>
          <div>
            <h3 className={`${styles.sectionTitle} ${styles.sectionTitleDanger}`}>Zona de perigo</h3>
            <p className={styles.sectionSub}>Ações irreversíveis — tome cuidado</p>
          </div>
        </div>

        <div className={styles.dangerBody}>
          <div className={styles.dangerInfo}>
            <span className={styles.dangerLabel}>Excluir trilha</span>
            <span className={styles.dangerDesc}>
              Remove permanentemente a trilha e todas as aulas. Esta ação não pode ser desfeita.
            </span>
          </div>

          {!confirmDelete ? (
            <button className={styles.deleteBtn} onClick={() => setConfirmDelete(true)}>
              <Icon name="trash" size={14} /> Excluir trilha
            </button>
          ) : (
            <div className={styles.deleteConfirm}>
              <span className={styles.deleteConfirmText}>Tem certeza? Esta ação é irreversível.</span>
              <button className={styles.deleteConfirmYes} onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Excluindo...' : 'Sim, excluir'}
              </button>
              <button className={styles.deleteConfirmNo} onClick={() => setConfirmDelete(false)} disabled={deleting}>
                Cancelar
              </button>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
