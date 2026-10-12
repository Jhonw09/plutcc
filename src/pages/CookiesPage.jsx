import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import styles from './PublicHelpPage.module.css'
import privStyles from './PrivacidadePage.module.css'
import { useCookieConsent } from '../context/CookieConsentContext'

export default function CookiesPage() {
  const { openPreferences } = useCookieConsent()

  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.hero}>
          <h1 className={styles.heroTitle}>Cookies e Armazenamento</h1>
          <p className={styles.heroSub}>
            O que o StudyConnect armazena no seu navegador e por quê.
          </p>
        </div>

        <div className={`${styles.container} ${privStyles.doc}`}>

          <Link to="/" className={privStyles.backHome}>← Voltar para a página inicial</Link>

          <section className={privStyles.section}>
            <h2>O que são cookies?</h2>
            <p>
              Cookies são pequenos arquivos de texto que um site pode salvar no seu navegador.
              Eles permitem que o site reconheça seu dispositivo em visitas futuras ou mantenha
              informações entre páginas.
            </p>
            <p>
              Além de cookies, os navegadores modernos oferecem outros mecanismos de
              armazenamento local, como <strong>localStorage</strong> e{' '}
              <strong>sessionStorage</strong>, que funcionam de forma diferente dos cookies
              e não são enviados automaticamente ao servidor.
            </p>
          </section>

          <section className={privStyles.section}>
            <h2>O que o StudyConnect usa</h2>

            <h3>localStorage (persiste entre sessões)</h3>
            <table className={privStyles.table ?? ''} style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', marginBottom: '12px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--text)', fontWeight: 600 }}>Chave</th>
                  <th style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--text)', fontWeight: 600 }}>Finalidade</th>
                  <th style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--text)', fontWeight: 600 }}>Categoria</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '8px 12px' }}><code>sc_user</code></td>
                  <td style={{ padding: '8px 12px' }}>Dados básicos da sessão (id, nome, papel). Permite manter o login entre abas.</td>
                  <td style={{ padding: '8px 12px' }}>Essencial</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '8px 12px' }}><code>sc_cookie_consent</code></td>
                  <td style={{ padding: '8px 12px' }}>Registro da sua escolha de preferências de cookies.</td>
                  <td style={{ padding: '8px 12px' }}>Essencial</td>
                </tr>
              </tbody>
            </table>

            <h3>sessionStorage (apagado ao fechar a aba)</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', marginBottom: '12px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--text)', fontWeight: 600 }}>Chave</th>
                  <th style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--text)', fontWeight: 600 }}>Finalidade</th>
                  <th style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--text)', fontWeight: 600 }}>Categoria</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['sc_access_token', 'Token JWT de autenticação. Apagado ao fechar a aba.', 'Essencial'],
                  ['sc_token_expires_at', 'Timestamp de expiração do token.', 'Essencial'],
                  ['sc_mfa_pending_email', 'E-mail temporário durante verificação MFA.', 'Essencial'],
                  ['sc_dashboard_entered', 'Flag de navegação interna.', 'Essencial'],
                ].map(([key, desc, cat]) => (
                  <tr key={key} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '8px 12px' }}><code>{key}</code></td>
                    <td style={{ padding: '8px 12px' }}>{desc}</td>
                    <td style={{ padding: '8px 12px' }}>{cat}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h3>Cookies de terceiros</h3>
            <p>
              O StudyConnect não define cookies próprios de rastreamento ou publicidade.
              No entanto, serviços externos carregados pela plataforma podem definir seus
              próprios cookies:
            </p>
            <ul>
              <li>
                <strong>Google Identity Services</strong> (login com Google): pode definir
                cookies para gerenciar o estado de autenticação com o Google. Esses cookies
                são controlados pelo Google, não pelo StudyConnect.
              </li>
              <li>
                <strong>Google Fonts</strong>: o navegador faz requisição aos servidores do
                Google para carregar a fonte Inter. O Google pode registrar o endereço IP
                conforme sua política de privacidade.
              </li>
            </ul>
            <p>
              Não foram identificados cookies de analytics, publicidade ou rastreamento
              comportamental no código atual do StudyConnect.
            </p>
          </section>

          <section className={privStyles.section}>
            <h2>Armazenamento essencial vs. rastreamento opcional</h2>
            <p>
              Todo o armazenamento próprio do StudyConnect é <strong>estritamente necessário</strong>{' '}
              para o funcionamento da plataforma: manter a sessão autenticada, lembrar suas
              preferências e garantir a segurança do acesso.
            </p>
            <p>
              Não utilizamos rastreamento comportamental, publicidade direcionada ou analytics
              de terceiros que exijam consentimento separado.
            </p>
          </section>

          <section className={privStyles.section}>
            <h2>Como alterar suas preferências</h2>
            <p>
              Você pode rever ou atualizar suas preferências de cookies a qualquer momento:
            </p>
            <button
              onClick={openPreferences}
              style={{
                marginTop: '8px',
                padding: '10px 20px',
                background: 'var(--accent)',
                color: '#fff',
                border: 'none',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'var(--font)',
              }}
            >
              Gerenciar preferências de cookies
            </button>
            <p style={{ marginTop: '12px' }}>
              Você também pode limpar os dados armazenados diretamente nas configurações do
              seu navegador (Configurações → Privacidade → Limpar dados de navegação).
            </p>
          </section>

          <div className={privStyles.nav}>
            <Link to="/privacidade" className={privStyles.navLink}>→ Política de Privacidade</Link>
            <Link to="/direitos-titular" className={privStyles.navLink}>→ Exercer meus direitos</Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
