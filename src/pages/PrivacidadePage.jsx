import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import styles from './PublicHelpPage.module.css'
import privStyles from './PrivacidadePage.module.css'

// ─────────────────────────────────────────────────────────────────────────────
// NOTAS INTERNAS DE REVISÃO (não renderizadas ao usuário)
//
// PENDÊNCIAS QUE EXIGEM DECISÃO INSTITUCIONAL ANTES DA PUBLICAÇÃO FINAL:
//
// [P1] CONTROLADOR: A FIEB foi indicada como responsável, mas a vinculação
//      formal do StudyConnect à FIEB como controlador de dados ainda não foi
//      confirmada institucionalmente. Manter como "desenvolvido em parceria com
//      a FIEB" até confirmação.
//
// [P2] CONTATO DE PRIVACIDADE: studyconnect2026@gmail.com foi indicado como
//      contato pretendido, mas está condicionado à autorização da FIEB e à
//      existência de equipe responsável pelo atendimento. Não publicar como
//      canal oficial até essa confirmação. Exibido ao usuário como "em
//      definição".
//
// [P3] ENCARREGADO (DPO): A LGPD exige indicação de encarregado para
//      controladores de médio/grande porte ou que tratem dados sensíveis em
//      escala. Não foi identificado encarregado designado. Verificar obrigação
//      com assessoria jurídica.
//
// [P4] BASES LEGAIS: As bases indicadas na seção 8 são uma proposta técnica
//      baseada no código. Precisam de validação jurídica antes de serem
//      publicadas como definitivas.
//
// [P5] PRAZOS DE RETENÇÃO: O código confirma exclusão imediata de dados
//      vinculados ao usuário quando a conta é deletada (ver UsuarioService).
//      Porém: (a) tokens expirados (email_verification_token,
//      password_reset_token, mfa_code) não têm rotina de limpeza automática
//      confirmada no código — permanecem no banco até sobrescrita ou exclusão
//      da conta; (b) logs do Render, Vercel e Somee têm retenção própria não
//      controlada pelo StudyConnect; (c) backups do Somee têm política própria
//      não verificada. Definir e documentar prazos formais.
//
// [P6] EXCLUSÃO DE CONTA GOOGLE: O fluxo deleteWithAuth exige senha, mas
//      contas Google não têm senha no sistema (senha = null). Portanto, a
//      exclusão de conta via interface não está disponível para usuários Google
//      — eles precisam solicitar por e-mail. Isso está refletido na seção 12.
//
// [P7] DATA DE VIGÊNCIA: Manter como "a definir" até a data real de publicação
//      ser estabelecida. Não usar data fictícia.
//
// [P8] CONFORMIDADE LGPD: Esta política não representa declaração de
//      conformidade integral. Revisão jurídica é necessária antes da
//      publicação em produção.
// ─────────────────────────────────────────────────────────────────────────────

const VERSAO = '1.0-rascunho'
// [P7] Atualizar para a data real de publicação antes de ir a produção.
const VIGENCIA = 'a definir'

export default function PrivacidadePage() {
  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.hero}>
          <h1 className={styles.heroTitle}>Política de Privacidade</h1>
          <p className={styles.heroSub}>
            Versão {VERSAO}
            {VIGENCIA !== 'a definir'
              ? ` — em vigor desde ${VIGENCIA}`
              : ' — documento em revisão, ainda não publicado oficialmente'}
          </p>
        </div>

        <div className={`${styles.container} ${privStyles.doc}`}>

          <Link to="/" className={privStyles.backHome}>← Voltar para a página inicial</Link>

          {/* ── Aviso de rascunho ── */}
          <div className={privStyles.draftNotice}>
            Este documento está em fase de revisão e ainda não foi publicado oficialmente.
            Algumas informações dependem de confirmação institucional e de validação jurídica
            antes da publicação final.
          </div>

          {/* ── 1. Responsável ── */}
          <section className={privStyles.section}>
            <h2>1. Quem é responsável pelo StudyConnect</h2>
            <p>
              O StudyConnect é um projeto acadêmico desenvolvido em parceria com a{' '}
              <strong>Fundação Instituto de Educação de Barueri (FIEB)</strong>, inscrita
              sob o CNPJ <strong>65.700.239/0001-10</strong>, com sede na Avenida Andrômeda,
              500, Alphaville Empresarial, Barueri – SP, CEP 06473-000.
            </p>
            <p>
              Para questões relacionadas a dados pessoais, entre em contato pelos canais
              disponíveis na <Link to="/contato">página de contato</Link>.
            </p>
            {/* [P1][P2][P3] */}
            <div className={privStyles.placeholder}>
              ⚠️ Pendência institucional: a vinculação formal da FIEB como controladora de
              dados, o canal oficial de privacidade e a eventual designação de encarregado
              (DPO) ainda precisam ser confirmados pela instituição antes da publicação.
            </div>
          </section>

          {/* ── 2. Dados do cadastro ── */}
          <section className={privStyles.section}>
            <h2>2. Dados tratados no cadastro e na conta</h2>
            <p>
              Ao criar uma conta por e-mail e senha, os seguintes dados são coletados e
              armazenados no banco de dados:
            </p>
            <ul>
              <li>
                <strong>Nome completo</strong> — identificação na plataforma.
              </li>
              <li>
                <strong>Endereço de e-mail</strong> — autenticação, comunicações
                transacionais e verificação de conta. Normalizado para letras minúsculas
                antes do armazenamento.
              </li>
              <li>
                <strong>Senha</strong> — armazenada exclusivamente como hash BCrypt. O
                valor original nunca é armazenado nem registrado em logs.
              </li>
              <li>
                <strong>Tipo de usuário</strong> (ALUNO, PROFESSOR ou ADMIN) — controle
                de acesso e funcionalidades disponíveis.
              </li>
              <li>
                <strong>Status da conta</strong> (ativo/suspenso) — gestão administrativa.
                Novas contas por e-mail iniciam como inativas até a verificação do e-mail.
              </li>
              <li>
                <strong>URL de foto de perfil</strong> — opcional, fornecida pelo próprio
                usuário ou obtida do Google no login com Google.
              </li>
              <li>
                <strong>Flag de MFA habilitado</strong> — indica se a autenticação
                multifator está ativa para a conta.
              </li>
            </ul>
          </section>

          {/* ── 3. Login ── */}
          <section className={privStyles.section}>
            <h2>3. Login convencional e login com Google</h2>

            <p>
              No <strong>login por e-mail e senha</strong>, as credenciais são enviadas ao
              servidor via HTTPS para autenticação. A senha é comparada ao hash armazenado
              e nunca é registrada em logs.
            </p>

            <p>
              No <strong>login com Google</strong> (Google Identity Services), o Google
              gera um token de identidade (ID token) no navegador do usuário. Esse token é
              enviado ao servidor do StudyConnect, que o valida diretamente com a API do
              Google (<code>oauth2.googleapis.com/tokeninfo</code>). O StudyConnect recebe
              do Google: nome, endereço de e-mail, identificador único do Google (sub) e
              URL da foto de perfil. A senha da conta Google nunca é transmitida ao
              StudyConnect.
            </p>

            <p>
              Contas criadas via Google não possuem senha no StudyConnect. Por isso, o
              fluxo de exclusão de conta pela interface (que exige confirmação de senha)
              não está disponível para esse tipo de conta. Usuários Google que desejarem
              excluir sua conta devem entrar em contato pelos canais indicados na{' '}
              <Link to="/direitos-titular">página de direitos</Link>.
            </p>

            <p>
              O Google pode registrar dados de uso conforme sua própria política de
              privacidade (
              <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
                policies.google.com/privacy
              </a>).
            </p>
          </section>

          {/* ── 4. E-mails e tokens ── */}
          <section className={privStyles.section}>
            <h2>4. E-mails transacionais, verificação, MFA e troca de e-mail</h2>
            <ul>
              <li>
                <strong>Verificação de e-mail:</strong> após o cadastro, um código numérico
                de 6 dígitos é gerado com validade de 15 minutos e enviado ao endereço
                informado. O código é armazenado temporariamente no banco (tabela
                <code> email_verification_token</code>). Após a verificação, o registro é
                marcado como verificado, mas não é excluído automaticamente — permanece no
                banco até que a conta seja excluída ou o código seja sobrescrito por um
                novo envio.
              </li>
              <li>
                <strong>Recuperação de senha:</strong> ao solicitar redefinição, um token
                UUID é gerado com validade de 30 minutos e enviado por e-mail como link.
                O token é armazenado na tabela <code>password_reset_token</code>. Após o
                uso, é marcado como utilizado, mas não é excluído automaticamente do banco.
              </li>
              <li>
                <strong>Autenticação multifator (MFA):</strong> quando habilitado pelo
                usuário, um código de 6 dígitos é gerado com validade de 5 minutos e
                enviado por e-mail a cada login. O código é armazenado como hash BCrypt na
                tabela <code>mfa_code</code>. Após uso ou expiração, é marcado como
                utilizado. Após 5 tentativas incorretas, é invalidado automaticamente.
              </li>
              <li>
                <strong>Troca de e-mail:</strong> o processo exige confirmação no e-mail
                atual e verificação no novo endereço, por meio de tokens temporários.
              </li>
            </ul>
            <p>
              Os e-mails transacionais são enviados por meio do serviço{' '}
              <strong>Brevo</strong> (anteriormente Sendinblue). O endereço de e-mail do
              destinatário e o conteúdo da mensagem são processados pelo Brevo conforme
              sua própria política de privacidade.
            </p>
            {/* [P5] */}
            <div className={privStyles.placeholder}>
              ⚠️ Pendência: tokens expirados ou utilizados (verificação de e-mail,
              recuperação de senha, MFA) não possuem rotina de limpeza automática
              confirmada no código atual. Eles permanecem no banco até que a conta seja
              excluída ou o registro seja sobrescrito. Definir e implementar política de
              purga periódica.
            </div>
          </section>

          {/* ── 5. Dados acadêmicos ── */}
          <section className={privStyles.section}>
            <h2>5. Dados acadêmicos</h2>
            <p>Durante o uso da plataforma, são armazenados:</p>
            <ul>
              <li>
                <strong>Trilhas de aprendizado</strong> — criadas por professores, incluindo
                nome, descrição, disciplina e nível.
              </li>
              <li>
                <strong>Aulas</strong> — título, tipo, conteúdo e ordem dentro da trilha.
              </li>
              <li>
                <strong>Matrículas</strong> — vínculo entre aluno e trilha, com data de
                matrícula.
              </li>
              <li>
                <strong>Progresso em aulas</strong> — registro de aulas concluídas por
                aluno.
              </li>
              <li>
                <strong>Dúvidas</strong> — perguntas postadas por alunos em aulas, com
                respostas de professores.
              </li>
              <li>
                <strong>Perfil de aprendizado</strong> — preferências de estudo informadas
                voluntariamente no onboarding.
              </li>
            </ul>
            <p>
              Esses dados são utilizados para fornecer as funcionalidades da plataforma e
              permitir que professores acompanhem o desempenho de seus alunos.
            </p>
          </section>

          {/* ── 6. Solicitações e tickets ── */}
          <section className={privStyles.section}>
            <h2>6. Solicitações de professor e tickets de suporte</h2>
            <ul>
              <li>
                <strong>Solicitação de professor:</strong> coletamos o tipo de comprovante
                selecionado e a URL do documento informada pelo usuário. Esses dados são
                usados exclusivamente para análise e aprovação pelo administrador da
                plataforma.
              </li>
              <li>
                <strong>Tickets de suporte:</strong> coletamos o conteúdo da mensagem e
                os dados de identificação do usuário para responder à solicitação.
              </li>
            </ul>
          </section>

          {/* ── 7. Finalidades ── */}
          <section className={privStyles.section}>
            <h2>7. Finalidades do tratamento</h2>
            <ul>
              <li>Criar e gerenciar contas de usuário.</li>
              <li>Autenticar o acesso à plataforma com segurança.</li>
              <li>
                Enviar comunicações transacionais necessárias ao funcionamento do serviço
                (verificação de e-mail, recuperação de senha, códigos MFA).
              </li>
              <li>
                Fornecer as funcionalidades educacionais (trilhas, aulas, progresso,
                dúvidas).
              </li>
              <li>
                Permitir que professores gerenciem conteúdo e acompanhem o desempenho de
                alunos matriculados em suas trilhas.
              </li>
              <li>Administrar a plataforma e atender solicitações de suporte.</li>
              <li>Cumprir obrigações legais aplicáveis.</li>
            </ul>
          </section>

          {/* ── 8. Base legal ── */}
          <section className={privStyles.section}>
            <h2>8. Base legal</h2>
            <p>
              As bases legais abaixo são uma proposta técnica baseada na análise do código.
              Estão sujeitas a validação jurídica antes da publicação oficial.
            </p>
            <ul>
              <li>
                <strong>Execução de contrato ou procedimentos preliminares (art. 7º, V,
                LGPD):</strong> tratamento necessário para fornecer os serviços solicitados
                pelo usuário ao criar a conta e usar a plataforma (autenticação, trilhas,
                progresso, dúvidas, suporte).
              </li>
              <li>
                <strong>Legítimo interesse (art. 7º, IX, LGPD):</strong> segurança da
                plataforma, prevenção de fraudes, integridade dos dados e proteção dos
                demais usuários.
              </li>
              <li>
                <strong>Cumprimento de obrigação legal (art. 7º, II, LGPD):</strong> quando
                exigido por lei ou por determinação de autoridade competente.
              </li>
            </ul>
            {/* [P4] */}
            <div className={privStyles.placeholder}>
              ⚠️ Pendência jurídica: as bases legais acima precisam ser validadas por
              assessoria jurídica antes da publicação. Em particular: (a) verificar se
              alguma finalidade exige consentimento explícito; (b) confirmar se a base de
              legítimo interesse é adequada para cada caso; (c) avaliar se o contexto
              acadêmico implica bases legais específicas.
            </div>
          </section>

          {/* ── 9. Serviços externos ── */}
          <section className={privStyles.section}>
            <h2>9. Serviços externos</h2>
            <p>
              O StudyConnect utiliza os seguintes serviços que podem ter acesso a dados
              pessoais ou técnicos:
            </p>
            <ul>
              <li>
                <strong>Google Identity Services:</strong> autenticação via conta Google.
                O StudyConnect recebe nome, e-mail, identificador Google e foto de perfil.
                O Google pode registrar dados de uso conforme sua política de privacidade.
              </li>
              <li>
                <strong>Google Fonts:</strong> o navegador faz requisição aos servidores
                do Google para carregar a fonte Inter. O Google pode registrar o endereço
                IP do visitante conforme sua política de privacidade.
              </li>
              <li>
                <strong>Brevo (Sendinblue):</strong> envio de e-mails transacionais.
                Processa o endereço de e-mail do destinatário e o conteúdo da mensagem.
              </li>
              <li>
                <strong>Vercel:</strong> hospedagem do frontend (interface do usuário).
                Pode registrar logs de acesso contendo endereço IP, user-agent e URLs
                acessadas, conforme sua política de privacidade.
              </li>
              <li>
                <strong>Render:</strong> hospedagem do backend (servidor da aplicação).
                Pode registrar logs de acesso e de aplicação conforme sua política de
                privacidade.
              </li>
              <li>
                <strong>Somee:</strong> serviço de hospedagem do banco de dados SQL Server.
                Os dados pessoais dos usuários são armazenados neste serviço. A Somee pode
                manter backups conforme sua própria política, sobre a qual o StudyConnect
                não tem controle direto.
              </li>
              <li>
                <strong>UptimeRobot:</strong> serviço de monitoramento de disponibilidade.
                Realiza requisições periódicas ao endpoint de saúde do backend
                (<code>/health</code>) para verificar se o serviço está respondendo. Essas
                requisições podem registrar o endereço IP do servidor e timestamps de
                acesso nos logs do UptimeRobot. O UptimeRobot não tem acesso a dados de
                usuários. O monitoramento reduz o tempo de inatividade, mas não garante
                disponibilidade permanente.
              </li>
            </ul>
            <p>
              Não vendemos dados pessoais a terceiros. O compartilhamento com os serviços
              acima ocorre exclusivamente para viabilizar o funcionamento da plataforma.
            </p>
          </section>

          {/* ── 10. Armazenamento no navegador ── */}
          <section className={privStyles.section}>
            <h2>10. Armazenamento no navegador</h2>
            <p>
              O StudyConnect utiliza os seguintes mecanismos de armazenamento no navegador.
              Nenhum deles é um cookie próprio da plataforma.
            </p>

            <h3>localStorage (persiste entre sessões até logout ou limpeza manual)</h3>
            <ul>
              <li>
                <code>sc_user</code> — dados básicos da sessão: id, nome, papel, e-mail,
                flag de conta Google e flag de MFA habilitado. Removido no logout.
              </li>
              <li>
                <code>sc_cookie_consent</code> — registro da escolha de preferências de
                cookies, com versão e data/hora da decisão.
              </li>
            </ul>

            <h3>sessionStorage (apagado ao fechar a aba ou o navegador)</h3>
            <ul>
              <li>
                <code>sc_access_token</code> — token JWT de autenticação. Contém id,
                e-mail e papel do usuário, assinado com chave secreta. Expira em até 15
                minutos (configurável).
              </li>
              <li>
                <code>sc_token_expires_at</code> — timestamp de expiração do token JWT.
              </li>
              <li>
                <code>sc_mfa_pending_email</code> — e-mail temporário armazenado durante
                o fluxo de verificação MFA. Removido após a conclusão ou abandono do
                fluxo.
              </li>
              <li>
                <code>sc_dashboard_entered</code> — flag de navegação interna, sem dados
                pessoais.
              </li>
            </ul>

            <h3>Cookies</h3>
            <p>
              O StudyConnect não define cookies próprios de autenticação, rastreamento ou
              publicidade. O Google Identity Services (login com Google) pode definir
              cookies próprios no domínio do Google, fora do controle do StudyConnect.
              O Google Fonts pode registrar requisições nos servidores do Google.
            </p>
            <p>
              Consulte a <Link to="/cookies">Página de Cookies</Link> para mais detalhes.
            </p>
          </section>

          {/* ── 11. Segurança ── */}
          <section className={privStyles.section}>
            <h2>11. Segurança e controle de acesso</h2>
            <p>As seguintes medidas técnicas estão implementadas no código:</p>
            <ul>
              <li>
                Senhas armazenadas exclusivamente como hash BCrypt (não reversível).
              </li>
              <li>
                Autenticação via JWT com expiração de até 15 minutos, armazenado apenas
                em sessionStorage (não em cookies).
              </li>
              <li>
                Autenticação multifator (MFA) por e-mail, disponível opcionalmente para
                todos os usuários e obrigatória para administradores.
              </li>
              <li>
                Controle de acesso por papel (ALUNO, PROFESSOR, ADMIN) verificado no
                servidor a cada requisição.
              </li>
              <li>
                Comunicação entre frontend e backend via HTTPS.
              </li>
              <li>
                Tokens temporários com expiração definida para operações sensíveis
                (verificação de e-mail: 15 min; recuperação de senha: 30 min; MFA: 5 min).
              </li>
              <li>
                Limite de tentativas para códigos MFA (5 tentativas antes do bloqueio
                automático do código).
              </li>
              <li>
                Rate limiting em endpoints de autenticação para reduzir ataques de força
                bruta.
              </li>
            </ul>
            <p>
              Adotamos medidas técnicas razoáveis para proteger os dados. Nenhum sistema é
              absolutamente seguro. Em caso de incidente de segurança relevante que afete
              dados pessoais, notificaremos os titulares afetados conforme exigido pela
              LGPD.
            </p>
          </section>

          {/* ── 12. Retenção ── */}
          <section className={privStyles.section}>
            <h2>12. Retenção e eliminação de dados</h2>

            <p>
              <strong>Exclusão de conta:</strong> quando um usuário exclui sua conta pela
              plataforma, o sistema remove, na mesma transação: tokens de troca de e-mail,
              matrículas, progresso em aulas, dúvidas postadas, perfil de aprendizado,
              solicitações de professor, códigos MFA e o registro do usuário. Para
              professores e administradores, as trilhas criadas e as turmas associadas
              também são removidas.
            </p>

            <p>
              <strong>Contas Google:</strong> o fluxo de exclusão pela interface exige
              confirmação de senha, que contas Google não possuem. Usuários que fizeram
              cadastro exclusivamente via Google devem solicitar a exclusão pelos canais
              indicados na <Link to="/direitos-titular">página de direitos</Link>.
            </p>

            <p>
              <strong>Dados que podem permanecer após a exclusão da conta:</strong>
            </p>
            <ul>
              <li>
                Tokens expirados ou utilizados (verificação de e-mail, recuperação de
                senha, MFA) não possuem rotina de limpeza automática confirmada no código
                atual. Podem permanecer no banco até que sejam sobrescritos ou até que
                uma rotina de purga seja implementada.
              </li>
              <li>
                Logs de acesso registrados pelo Render (backend), Vercel (frontend) e
                Somee (banco de dados) têm retenção própria de cada serviço, fora do
                controle direto do StudyConnect.
              </li>
              <li>
                Backups do banco de dados mantidos pelo Somee têm política própria não
                verificada.
              </li>
            </ul>

            {/* [P5] */}
            <div className={privStyles.placeholder}>
              ⚠️ Pendência: definir e documentar formalmente os prazos de retenção para
              cada categoria de dado (tokens temporários, logs, backups). Implementar
              rotina de purga periódica de tokens expirados. Verificar a política de
              retenção de backups do Somee.
            </div>
          </section>

          {/* ── 13. Direitos ── */}
          <section className={privStyles.section}>
            <h2>13. Seus direitos como titular</h2>
            <p>
              Nos termos do art. 18 da LGPD, você pode solicitar, a qualquer momento:
            </p>
            <ul>
              <li>Confirmação da existência de tratamento dos seus dados.</li>
              <li>Acesso aos dados que mantemos sobre você.</li>
              <li>Correção de dados incompletos, inexatos ou desatualizados.</li>
              <li>
                Anonimização, bloqueio ou eliminação de dados desnecessários ou tratados
                em desconformidade com a lei.
              </li>
              <li>Portabilidade dos dados a outro fornecedor de serviço.</li>
              <li>Eliminação dos dados tratados com base em consentimento.</li>
              <li>Informação sobre compartilhamento com terceiros.</li>
              <li>Revogação de consentimento, quando aplicável.</li>
            </ul>
            <p>
              Algumas solicitações podem não ser atendidas integralmente quando houver
              obrigação legal de retenção dos dados ou outro fundamento que justifique
              sua manutenção.
            </p>
            <p>
              Veja como exercer seus direitos na{' '}
              <Link to="/direitos-titular">página de direitos do titular</Link>.
            </p>
          </section>

          {/* ── 14. Alterações ── */}
          <section className={privStyles.section}>
            <h2>14. Alterações nesta política</h2>
            <p>
              Alterações relevantes serão comunicadas por e-mail ou por aviso na plataforma
              com antecedência razoável. A data de vigência e a versão serão atualizadas no
              topo desta página.
            </p>
          </section>

          {/* ── 15. Vigência ── */}
          <section className={privStyles.section}>
            <h2>15. Vigência e versão</h2>
            {VIGENCIA === 'a definir' ? (
              <p>
                Esta política está na versão <strong>{VERSAO}</strong> e ainda não foi
                publicada oficialmente. A data de vigência será definida na publicação.
              </p>
            ) : (
              <p>
                Esta política está em vigor desde <strong>{VIGENCIA}</strong> — Versão{' '}
                <strong>{VERSAO}</strong>.
              </p>
            )}
          </section>

          <div className={privStyles.nav}>
            <Link to="/cookies" className={privStyles.navLink}>→ Página de Cookies</Link>
            <Link to="/direitos-titular" className={privStyles.navLink}>→ Exercer meus direitos</Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
