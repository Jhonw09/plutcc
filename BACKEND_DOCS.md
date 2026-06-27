# Documentação do Backend — Plut (Camada de Integração API)

> Este documento descreve toda a lógica da camada de comunicação com o backend: cliente HTTP, serviços, hooks e contexto de autenticação.

---

## Sumário

1. [Visão Geral](#1-visão-geral)
2. [Configuração e Variáveis de Ambiente](#2-configuração-e-variáveis-de-ambiente)
3. [Cliente HTTP — `apiClient.js`](#3-cliente-http--apiclientjs)
4. [Serviços](#4-serviços)
   - [authService](#41-authservice)
   - [trilhaService](#42-trilhaservice)
   - [aulaService](#43-aulaservice)
   - [matriculaService](#44-matriculaservice)
   - [progressoService](#45-progressoservice)
   - [duvidaService](#46-duvidaservice)
   - [perfilService](#47-perfilservice)
   - [ticketService](#48-ticketservice)
   - [adminService](#49-adminservice)
5. [Contexto de Autenticação — `AuthContext`](#5-contexto-de-autenticação--authcontext)
6. [Hooks de Estado](#6-hooks-de-estado)
7. [Proteção de Rotas](#7-proteção-de-rotas)
8. [Mapeamento de Rotas por Perfil](#8-mapeamento-de-rotas-por-perfil)
9. [Constantes e Chaves de Armazenamento](#9-constantes-e-chaves-de-armazenamento)
10. [Fluxos Completos](#10-fluxos-completos)

---

## 1. Visão Geral

O projeto é um SPA (Single Page Application) em React/Vite. Toda comunicação com o servidor ocorre via chamadas REST a uma API Java Spring Boot. A camada de integração está organizada em três níveis:

```
apiClient.js          → cliente HTTP base (fetch + tratamento de erros)
  └── services/       → funções que encapsulam cada recurso da API
        └── hooks/    → estado React reativo sobre os serviços
              └── context/AuthContext → sessão global do usuário
```

---

## 2. Configuração e Variáveis de Ambiente

| Variável | Desenvolvimento | Produção |
|---|---|---|
| `VITE_API_URL` | `http://localhost:8080` | URL do servidor de produção |
| `VITE_GOOGLE_CLIENT_ID` | ID do app Google OAuth | ID do app Google OAuth |

A URL base da API é montada como:

```
BASE_URL = VITE_API_URL + /api/v1
```

Todos os endpoints são construídos a partir desse prefixo em `apiClient.js`.

---

## 3. Cliente HTTP — `apiClient.js`

Arquivo: `src/api/apiClient.js`

### 3.1 Função `api(url, options)`

É o único ponto de saída de todas as chamadas HTTP da aplicação.

**Lógica:**
1. Faz `fetch` com `Content-Type: application/json` adicionado automaticamente.
2. Se `res.ok === false`, lê o body da resposta e tenta extrair `error` ou `message` do JSON.
3. Cria um `Error` com `.status` (código HTTP) anexado — isso permite que os serviços façam tratamento granular por código.
4. Se status `204 No Content` ou body vazio, retorna `null` sem tentar fazer parse.
5. Se o body não for JSON válido, retorna `null` silenciosamente.

### 3.2 `ENDPOINTS`

Objeto centralizado com todos os endpoints da API. Endpoints com parâmetros de rota são funções:

```js
trilhaById: (id) => `${API_BASE}/trilhas/${id}`
```

Isso garante que nenhuma URL seja construída manualmente nos serviços.

### 3.3 `ROLE_MAP`

Traduz os papéis do backend para os papéis usados no frontend:

| Backend | Frontend |
|---|---|
| `ADMIN` | `admin` |
| `PROFESSOR` | `teacher` |
| `ALUNO` | `student` |

---

## 4. Serviços

Cada serviço encapsula chamadas a um recurso específico da API. Todos usam `api()` internamente e convertem erros HTTP em mensagens amigáveis em português.

### 4.1 `authService`

Arquivo: `src/api/services/authService.js`

| Função | Método HTTP | Endpoint | Lógica |
|---|---|---|---|
| `login({ email, senha })` | POST | `/auth/login` | Retorna dados do usuário. Lança erros específicos para 401, 403 (conta suspensa) e 400. |
| `signup({ nome, email, senha, tipoUsuario })` | POST | `/usuarios` | Cria conta sem fazer login — usuário precisa verificar e-mail. |
| `updateUser(userId, dados)` | PUT | `/usuarios/:id` | Atualiza nome, email e foto. Inclui senha somente se fornecida. |
| `changePassword(userId, dados)` | PUT | `/usuarios/:id` | Mesmo endpoint que updateUser, mas o chamador garante que `senha` está presente. |
| `deleteUser(userId)` | DELETE | `/usuarios/:id` | Remove conta permanentemente. |
| `verifyEmail(email, code)` | POST | `/auth/verify-email` | Confirma código de verificação enviado por e-mail no cadastro. |
| `resendVerification(email)` | POST | `/auth/resend-verification` | Reenvia código de verificação. |
| `forgotPassword(email)` | POST | `/auth/forgot-password` | Silencioso — nunca revela se o e-mail existe. |
| `resetPassword(token, novaSenha)` | POST | `/auth/reset-password` | Redefine senha via token do link de e-mail. |
| `googleLogin(idToken)` | POST | `/auth/google` | Autentica via Google OAuth2. Recebe o `idToken` do Google SDK no frontend. |
| `requestEmailChange(usuarioId, emailNovo)` | POST | `/auth/email-change/request` | Etapa 1 da troca de e-mail: envia link de confirmação para o e-mail atual. |
| `confirmEmailChange(token)` | GET | `/auth/email-change/confirm?token=` | Etapa 2: usuário clica no link; o backend confirma e envia OTP pro novo e-mail. |
| `verifyEmailChange(usuarioId, otp)` | POST | `/auth/email-change/verify` | Etapa 3: valida o OTP recebido no novo e-mail, completando a troca. |

**Fluxo de troca de e-mail (3 etapas):**
```
1. requestEmailChange → envia link pro e-mail atual
2. confirmEmailChange(token) → usuário clica no link
3. verifyEmailChange(otp) → usuário digita o código recebido no novo e-mail
```

---

### 4.2 `trilhaService`

Arquivo: `src/api/services/trilhaService.js`

| Função | Método | Endpoint | Lógica |
|---|---|---|---|
| `createTrilha(data)` | POST | `/trilhas` | Valida `professorId`, `nome` e `nivel` antes de enviar. |
| `updateTrilha(id, data)` | PUT | `/trilhas/:id` | Atualiza metadados da trilha. |
| `getTrilhas()` | GET | `/trilhas` | Retorna todas as trilhas (usada pelo admin). |
| `getTrilhaById(id)` | GET | `/trilhas/:id` | Retorna uma trilha específica. |
| `getMyTrilhas(professorId)` | GET | `/trilhas?professorId=` | Filtra trilhas pelo professor — garante isolamento. |
| `getTrilhasPublicas()` | GET | `/trilhas` | Busca todas e filtra `tipo !== 'PRIVADA'` no cliente. |
| `deleteTrilha(id)` | DELETE | `/trilhas/:id` | Remove trilha e todo seu conteúdo. |

---

### 4.3 `aulaService`

Arquivo: `src/api/services/aulaService.js`

As aulas possuem um sistema de blocos de conteúdo (estrutura rich-text). O backend armazena o conteúdo como JSON string no campo `conteudo`.

**Conversão de formato (envelope):**

- `toEnvelope(blocos[])` → converte array flat em `{ versao: 1, blocos: [...] }` atribuindo `ordem` sequencial a cada bloco.
- `fromEnvelope(envelope)` → converte de volta para array ordenado por `ordem`.
- `parseConteudo(conteudo)` → faz parse seguro do campo `conteudo` (aceita string JSON ou objeto).

| Função | Método | Endpoint | Lógica |
|---|---|---|---|
| `createAula(data)` | POST | `/aulas` | Converte `blocos[]` para envelope JSON antes de enviar. |
| `getAulasByTrilha(trilhaId)` | GET | `/aulas/trilha/:id` | Retorna aulas com `blocos[]` já desserializados. |
| `getAulaById(id)` | GET | `/aulas/:id` | Retorna aula com `blocos[]` desserializados. |
| `updateAula(id, data)` | PUT | `/aulas/:id` | Re-converte `blocos[]` para envelope antes de enviar. |
| `deleteAula(id)` | DELETE | `/aulas/:id` | Remove aula. |

---

### 4.4 `matriculaService`

Arquivo: `src/api/services/matriculaService.js`

| Função | Método | Endpoint | Lógica |
|---|---|---|---|
| `matricular(alunoId, trilhaId)` | POST | `/matriculas` | Retorna 409 se já matriculado. |
| `desmatricular(alunoId, trilhaId)` | DELETE | `/matriculas/:trilhaId/aluno/:alunoId` | |
| `getMatriculasDoAluno(alunoId)` | GET | `/matriculas/aluno/:id` | Retorna todas as matrículas do aluno. |
| `getAlunosDaTrilha(trilhaId)` | GET | `/matriculas/trilha/:id` | Retorna lista de alunos matriculados. |
| `getResumoProfessor(professorId)` | GET | `/matriculas/professor/:id/resumo` | Resumo agregado para o dashboard do professor. |
| `verificarMatricula(alunoId, trilhaId)` | GET | `/matriculas/existe?alunoId=&trilhaId=` | Normaliza resposta: aceita `boolean`, `{ matriculado }` ou `{ existe }`. |

---

### 4.5 `progressoService`

Arquivo: `src/api/services/progressoService.js`

| Função | Método | Endpoint | Lógica |
|---|---|---|---|
| `concluirAula(alunoId, aulaId)` | POST | `/progresso/concluir` | Registra aula como concluída. |
| `getAulasConcluidasAluno(alunoId)` | GET | `/progresso/aluno/:id/ids` | Retorna `Long[]` de aulaIds — leve para cálculos de progresso. |
| `getProgressoCompleto(alunoId)` | GET | `/progresso/aluno/:id` | Retorna `[{ aulaId, concluidaEm }]` — usado na página de Desempenho. |
| `getProgressoTrilha(trilhaId, alunoId)` | GET | `/progresso/trilha/:trilhaId/aluno/:alunoId` | Retorna `{ aulasConcluidas, totalAulas, percentual }`. |

---

### 4.6 `duvidaService`

Arquivo: `src/api/services/duvidaService.js`

| Função | Método | Endpoint | Lógica |
|---|---|---|---|
| `getDuvidasByTrilha(trilhaId)` | GET | `/duvidas/trilha/:id` | Lista dúvidas de toda a trilha (visão professor). |
| `getDuvidasByAlunoEAula(alunoId, aulaId)` | GET | `/duvidas/aluno/:alunoId/aula/:aulaId` | Dúvidas de um aluno em uma aula específica. |
| `criarDuvida(alunoId, aulaId, trilhaId, mensagem)` | POST | `/duvidas` | Cria nova dúvida. |
| `responderDuvida(id, resposta)` | PUT | `/duvidas/:id/responder` | Professor responde a dúvida. |
| `resolverDuvida(id)` | PUT | `/duvidas/:id/resolver` | Marca dúvida como resolvida. |
| `getEstatisticasTrilha(trilhaId)` | GET | `/matriculas/trilha/:id/estatisticas` | Retorna `{ totalAlunos, ... }` — usado pelo admin e professor. |

---

### 4.7 `perfilService`

Arquivo: `src/api/services/perfilService.js`

Gerencia o perfil de aprendizado do aluno (interesses, dificuldades, meta semanal).

| Função | Método | Endpoint | Lógica |
|---|---|---|---|
| `getPerfil(alunoId)` | GET | `/perfil-aprendizado/:id` | Retorna `null` se 404 (perfil ainda não criado). |
| `createPerfil(data)` | POST | `/perfil-aprendizado` | Cria perfil no onboarding. |
| `updatePerfil(alunoId, data)` | PUT | `/perfil-aprendizado/:id` | Atualiza perfil existente. |

---

### 4.8 `ticketService`

Arquivo: `src/api/services/ticketService.js`

| Função | Método | Endpoint | Lógica |
|---|---|---|---|
| `criarTicket({ usuarioId, nome, email, tipo, mensagem })` | POST | `/tickets` | Retorna 429 se usuário enviar muitos tickets. |
| `getTickets()` | GET | `/tickets` | Lista todos os tickets (admin). |
| `responderTicket(id, resposta)` | POST | `/tickets/:id/responder` | Admin responde ticket. |
| `fecharTicket(id)` | POST | `/tickets/:id/fechar` | Admin fecha ticket. |

---

### 4.9 `adminService`

Arquivo: `src/api/services/adminService.js`

| Função | Método | Endpoint | Lógica |
|---|---|---|---|
| `getAdminResumo()` | GET | `/admin/resumo` | KPIs do painel admin. |
| `getUsuarios()` | GET | `/usuarios` | Lista todos os usuários. |
| `toggleAtivo(usuario)` | PUT | `/usuarios/:id` | Inverte o campo `ativo` — suspende ou reativa conta. |
| `getTrilhasAdmin()` | GET | `/trilhas` | Busca todas as trilhas e enriquece cada uma com `totalAlunos` via `getEstatisticasTrilha`. |
| `getDuvidasAdmin(trilhaId)` | GET | `/duvidas/trilha/:id` | Dúvidas de uma trilha para visão admin. |

**Lógica de enriquecimento em `getTrilhasAdmin`:**
Faz `Promise.all` para buscar estatísticas de todas as trilhas em paralelo. Se alguma falhar, usa `totalAlunos: 0` como fallback — não bloqueia a listagem inteira.

---

## 5. Contexto de Autenticação — `AuthContext`

Arquivo: `src/context/AuthContext.jsx`

É o estado global de sessão do usuário, fornecido via React Context.

### 5.1 Persistência

A sessão é salva em `localStorage` com a chave `sc_user`. Na inicialização do app, `readStorage()` lê e valida o item — se estiver malformado ou sem `id`, é removido automaticamente.

### 5.2 Estrutura do objeto `user`

```js
{
  id,           // Long do banco
  name,         // nome do usuário
  avatar,       // primeira letra do nome (uppercase)
  role,         // 'student' | 'teacher' | 'admin'
  tipoUsuario,  // 'ALUNO' | 'PROFESSOR' | 'ADMIN' (valor original do backend)
  email,
  fotoUrl,
  isGoogleUser, // boolean — controla se exige senha nas operações
  ativo,        // boolean — conta suspensa não persiste sessão
}
```

### 5.3 Funções expostas pelo contexto

| Função | Lógica |
|---|---|
| `login({ email, senha })` | Chama `authService.login`, normaliza dados e persiste. |
| `loginWithGoogle(idToken)` | Chama `authService.googleLogin`, mesma normalização. |
| `signup(dados)` | Cria conta mas não inicia sessão (aguarda verificação de e-mail). |
| `updateUser({ nome, email, senha, fotoUrl })` | Para usuários normais, revalida a senha atual antes de salvar. Usuários Google pulam essa etapa. |
| `changePassword({ senhaAtual, senha })` | Valida `senhaAtual` via `authService.login` antes de alterar. |
| `deleteUser()` | Exclui conta e limpa sessão. |
| `logout()` | Chama `clearSession()`. |

### 5.4 `clearSession()`

Remove `sc_user` do `localStorage` e `sc_dashboard_entered` do `sessionStorage`, e seta `user = null`.

---

## 6. Hooks de Estado

### `useAulas(trilhaId)`

Gerencia CRUD de aulas de uma trilha. Trata 404 como "trilha sem aulas ainda" (não exibe erro).
Após `deleteAula`, recarrega do backend para garantir sincronismo.

### `useMatricula(trilhaId)`

Verifica no mount se o aluno já está matriculado. Expõe `matricular()` e `desmatricular()` com estado de loading separado (`loadingAction`).

### `useMatriculasTrilha(trilhaId)`

Lista os alunos de uma trilha. Usado na visão do professor.

### `useMinhasTrilhas()`

Combina duas chamadas paralelas (`getMatriculasDoAluno` + `getTrilhasPublicas`) para montar a lista de trilhas do aluno.
Após isso, busca as aulas de cada trilha em paralelo para calcular o progresso real.

Função `getProgresso(trilhaId)`:
```
aulas concluídas da trilha / total de aulas da trilha × 100
```

### `useTrilhas()`

Para professores. Carrega as trilhas do professor logado via `getMyTrilhas(user.id)`.
`deleteTrilha` usa **optimistic update**: remove da lista imediatamente e faz rollback com `loadTrilhas()` se a API falhar.

### `useTrilhasAluno()`

Mantém um `Set<number>` de IDs de aulas concluídas (fonte única de verdade para progresso).
Usa `useRef(loadedRef)` para evitar múltiplos fetches em re-renders.

`concluirAula` usa **optimistic update**: adiciona ao Set imediatamente e reverte se a API falhar.

Expõe três calculadoras de progresso:
- `getProgresso(trilhaId, aulas[])` — recebe objetos de aula
- `getProgressoByIds(aulaIds[])` — recebe array de IDs
- `getAulasConcluidas()` — retorna o Set completo

### `usePerfilAprendizado()`

Detecta automaticamente se deve chamar `createPerfil` ou `updatePerfil` com base em `perfil !== null`.
Derivados expostos: `metaSemanal`, `interesses[]`, `dificuldades[]` (parseados do campo CSV do backend).

---

## 7. Proteção de Rotas

Arquivo: `src/components/ProtectedRoute.jsx`

Três verificações em cascata:

1. `!user` → redireciona para `/` (não autenticado)
2. `user.ativo === false` → redireciona para `/conta-suspensa`
3. `role && user.role !== role` → redireciona para `/` (papel incorreto)

No `App.jsx` há três wrappers de conveniência:
- `<S>` → `role="student"`
- `<T>` → `role="teacher"`
- `<A>` → `role="admin"`

---

## 8. Mapeamento de Rotas por Perfil

| Perfil | Rota base | Acesso |
|---|---|---|
| Aluno | `/dashboard` | Trilhas, desempenho, dúvidas, configurações |
| Professor | `/teacher-dashboard` | Minhas trilhas, relatórios, configurações |
| Admin | `/admin` | Usuários, trilhas, tickets, relatórios |

Rotas públicas: `/`, `/login`, `/cadastro`, `/ajuda`, `/contato`, `/sobre`, `/redefinir-senha`, `/confirmar-troca-email`.

---

## 9. Constantes e Chaves de Armazenamento

**`STORAGE_KEYS`** (`src/constants/storageKeys.js`):

| Chave | Storage | Uso |
|---|---|---|
| `sc_user` | localStorage | Sessão do usuário (persiste entre abas e recargas) |
| `sc_dashboard_entered` | sessionStorage | Controla animação de entrada no dashboard (limpo no logout) |

---

## 10. Fluxos Completos

### Login
```
LoginPage → AuthContext.login → authService.login → POST /auth/login
  ├── 200: normaliza dados, persiste em localStorage, redireciona por role
  ├── 401: "E-mail ou senha incorretos"
  └── 403: redireciona para /conta-suspensa
```

### Cadastro
```
CadastroPage → AuthContext.signup → authService.signup → POST /usuarios
  └── 200: exibe tela de verificação de e-mail (não faz login)
```

### Conclusão de aula
```
StudentTrilhaPage → useTrilhasAluno.concluirAula(trilhaId, aulaId)
  ├── Optimistic: adiciona aulaId ao concluidasSet imediatamente
  ├── POST /progresso/concluir
  └── Falha: remove aulaId do Set (rollback)
```

### Matrícula em trilha
```
TrilhaDetalhePage → useMatricula.matricular()
  ├── POST /matriculas { alunoId, trilhaId }
  ├── 200: setMatriculado(true)
  └── 409: "Você já está matriculado"
```

### Cálculo de progresso
```
useMinhasTrilhas.getProgresso(trilhaId):
  1. Pega aulaIds da trilha (aulasMap[trilhaId])
  2. Filtra quais estão no concluidasSet (via useTrilhasAluno)
  3. (concluídas / total) × 100
```
