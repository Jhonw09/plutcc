import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import styles from './PublicHelpPage.module.css'
import privStyles from './PrivacidadePage.module.css'

export default function DireitosTitularPage() {
  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.hero}>
          <h1 className={styles.heroTitle}>Seus Direitos de Privacidade</h1>
          <p className={styles.heroSub}>
            Como exercer seus direitos previstos na LGPD (Lei nº 13.709/2018).
          </p>
        </div>

        <div className={`${styles.container} ${privStyles.doc}`}>

          <Link to="/" className={privStyles.backHome}>← Voltar para a página inicial</Link>

          <section className={privStyles.section}>
            <h2>Direitos previstos na LGPD</h2>
            <p>
              O art. 18 da Lei Geral de Proteção de Dados Pessoais garante a você, como
              titular dos dados, os seguintes direitos:
            </p>
            <ul>
              <li>
                <strong>Confirmação e acesso:</strong> saber se tratamos seus dados e obter
                uma cópia das informações que mantemos sobre você.
              </li>
              <li>
                <strong>Correção:</strong> solicitar a atualização de dados incompletos,
                inexatos ou desatualizados. Você também pode corrigir nome e e-mail
                diretamente nas configurações da sua conta.
              </li>
              <li>
                <strong>Anonimização, bloqueio ou eliminação:</strong> solicitar a remoção
                de dados desnecessários ou tratados em desconformidade com a lei.
              </li>
              <li>
                <strong>Portabilidade:</strong> solicitar a transferência dos seus dados a
                outro fornecedor de serviço.
              </li>
              <li>
                <strong>Eliminação de dados tratados com consentimento:</strong> quando o
                tratamento se basear em consentimento, você pode revogá-lo e solicitar a
                eliminação dos dados correspondentes.
              </li>
              <li>
                <strong>Informação sobre compartilhamento:</strong> saber com quais entidades
                públicas ou privadas compartilhamos seus dados.
              </li>
              <li>
                <strong>Revogação de consentimento:</strong> retirar consentimentos
                anteriormente concedidos.
              </li>
              <li>
                <strong>Oposição:</strong> opor-se a tratamentos realizados com base em
                outras hipóteses legais, em caso de descumprimento da LGPD.
              </li>
            </ul>
          </section>

          <section className={privStyles.section}>
            <h2>O que você pode fazer diretamente na plataforma</h2>
            <ul>
              <li>Alterar nome e e-mail em <strong>Configurações → Editar perfil</strong>.</li>
              <li>Alterar senha em <strong>Configurações → Segurança</strong>.</li>
              <li>Habilitar ou desabilitar MFA em <strong>Configurações → Segurança</strong>.</li>
              <li>Excluir sua conta em <strong>Configurações → Excluir conta</strong>.</li>
            </ul>
          </section>

          <section className={privStyles.section}>
            <h2>Como enviar uma solicitação formal</h2>
            <p>
              Para solicitações que não podem ser atendidas diretamente pela plataforma,
              entre em contato pelo e-mail:
            </p>
            <p>
              <strong>[EMAIL DE PRIVACIDADE — preencher]</strong>
            </p>
            <p>Inclua na mensagem:</p>
            <ul>
              <li>Seu nome completo e e-mail cadastrado.</li>
              <li>O direito que deseja exercer (ex: acesso, correção, eliminação).</li>
              <li>Qualquer informação adicional que ajude a identificar sua solicitação.</li>
            </ul>
            <p>
              Responderemos no prazo previsto pela LGPD. Algumas solicitações podem não ser
              atendidas integralmente quando houver obrigação legal de retenção dos dados ou
              outro fundamento que justifique sua manutenção.
            </p>
            <div className={privStyles.placeholder}>
              ⚠️ Pendência: definir e-mail de privacidade e prazo interno de resposta antes
              de publicar.
            </div>
          </section>

          <section className={privStyles.section}>
            <h2>Autoridade Nacional de Proteção de Dados (ANPD)</h2>
            <p>
              Se considerar que seus direitos não foram atendidos adequadamente, você pode
              apresentar reclamação à ANPD pelo site{' '}
              <a href="https://www.gov.br/anpd" target="_blank" rel="noopener noreferrer">
                www.gov.br/anpd
              </a>.
            </p>
          </section>

          <div className={privStyles.nav}>
            <Link to="/privacidade" className={privStyles.navLink}>→ Política de Privacidade</Link>
            <Link to="/cookies" className={privStyles.navLink}>→ Cookies e Armazenamento</Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
