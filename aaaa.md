<div style="display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 200px 0 20px 0;">

<div style="font-size: 24px; margin-bottom: 12px;"><strong>Amazon Q</strong></div>
<div style="background: rgba(128, 128, 128, 0.15); border: 1px solid rgba(128, 128, 128, 0.25); border-radius: 8px; padding: 8px; margin: 4px 0; text-align: center;">
<div style="font-size: 14px; margin-bottom: 4px;"><strong>Did you know?</strong></div>
<div>Pinned context is always included in future chat messages</div>
</div>

Select code & ask me to explain, debug or optimize it, or type `/` for quick actions

</div>

---

Analise meu projeto TCC de plataforma de trilhas de estudo.

Quero que você identifique:

* funcionalidades já existentes
* páginas do aluno
* páginas do professor
* dashboards
* fluxo das trilhas
* estrutura do front-end
* estrutura do back-end
* componentes reutilizáveis
* funcionalidades incompletas
* funcionalidades desnecessárias
* possíveis simplificações pro MVP

Me responda de forma objetiva e técnica.

Liste:

1. O que já está pronto
2. O que ainda falta
3. O que está complexo demais
4. O que vale a pena manter
5. O que vale remover
6. Sugestões de dashboard simples e coerente
7. Sugestões de melhorias rápidas com alto impacto visual
Considere que:

é um TCC
faltam poucos dias
o foco é trilhas de estudo, não plataforma escolar
queremos algo funcional, coerente e apresentável
evitar features complexas desnecessárias

---

Vou escanear o projeto completo antes de responder.

---


Agora tenho uma visão completa do projeto. Aqui está a análise técnica:

---

## 1. O que já está pronto ✅

**Back-end (API real conectada):**
- Auth: login, signup, logout, update, delete, changePassword
- CRUD completo de Trilhas (criar, editar, excluir, listar por professor, listar públicas)
- CRUD completo de Aulas com sistema de blocos (explicação, vídeo, questionário, texto livre)
- Matrículas: matricular, desmatricular, verificar, listar por aluno/trilha, resumo do professor

**Páginas funcionais:**
- Landing page completa (hero, features, planos, depoimentos, etc.)
- Dashboard do aluno — card de trilha em destaque, stats, meta semanal, atividade recente
- Minhas Trilhas — lista com filtros (todas/andamento/concluídas) + explorar com busca e categoria
- Detalhe da trilha — matrícula/desmatrícula, lista de aulas, CTA
- Trilha do aluno — lista de aulas, modal de conteúdo, modal de exercício com feedback
- Dashboard do professor — stats reais (trilhas + alunos matriculados), lista de trilhas, criar/editar/excluir
- Trilha do professor — gerenciar aulas (criar, editar, excluir, reordenar blocos)
- Relatórios do professor — gráfico de barras, tabela de alunos, histórico
- Dashboard admin — stats, atividade recente, status do sistema
- Desempenho do aluno — gráfico semanal, meta circular, histórico

**Componentes reutilizáveis sólidos:**
- Button, InputField, Tag, Toast, ConfirmModal, Icon, Avatar
- AulaEditor (editor de blocos completo)
- CreateTrilhaModal (criar/editar trilha)
- ProtectedRoute com roles (student/teacher/admin)
- Layouts separados: DashboardLayout, TeacherLayout, AdminLayout

---

## 2. O que ainda falta ⚠️

**Crítico para o TCC:**
- Progresso das aulas está em **localStorage** — não persiste no backend. O hook `useTrilhasAluno` já documenta os endpoints necessários mas não os implementa
- `ExplorarTrilhas` (/explorar) navega direto para `/dashboard/trilha/:id` sem passar pela página de detalhe/matrícula — aluno entra na trilha sem estar matriculado
- Níveis inconsistentes: o modal de criação usa `Fundamental/Médio/Vestibular`, mas o backend retorna `BASICO/INTERMEDIARIO/AVANCADO` — os cards mostram o valor bruto do backend

**Menor:**
- Dados de desempenho, atividade recente e meta semanal são todos mock (`studentDashboard.js`, `teacherDashboard.js`)
- Tabela de alunos em relatórios do professor é mock — não usa `getAlunosDaTrilha`

---

## 3. O que está complexo demais 🔴

- **Landing page** — 12+ seções (Logos, Schools, Stats, Testimonials, Plans, Resources, VideoSection, HowItWorks, Features, CtaBanner, Subjects). Para um TCC de trilhas de estudo, metade disso não agrega
- **Admin dashboard** — escolas, financeiro, tickets, usuários são completamente mock e irrelevantes para o foco do projeto
- **ExplorarTrilhas** é uma página separada que duplica exatamente o que MinhasTrilhasPage já faz na seção "Explorar trilhas"
- **BlogPage** — existe mas não tem conteúdo real
- **AulaEditor** com 4 tipos de bloco + reordenação é robusto, mas o bloco `texto_livre` é redundante com `explicacao`
- Múltiplos arquivos de documentação (7 arquivos `.md`/`.txt`) que não são código

---

## 4. O que vale a pena manter ✅

- Todo o fluxo trilha: criar → adicionar aulas → aluno se matricula → conclui aulas com exercícios
- AulaEditor com blocos (diferencial visual forte para apresentação)
- Sistema de roles com ProtectedRoute
- Toast + ConfirmModal (UX polida)
- DashboardPage do aluno (card de destaque + stats + meta)
- TeacherDashboardPage (stats reais + lista de trilhas)
- TrilhaDetalhePage (matrícula/desmatrícula bem implementada)
- StudentTrilhaPage com modal de exercício e feedback de certo/errado

---

## 5. O que vale remover 🗑️

| Item | Motivo |
|---|---|
| `/explorar` (ExplorarTrilhas) | Duplicata de MinhasTrilhasPage |
| Admin dashboard inteiro | 100% mock, fora do escopo |
| BlogPage | Vazia, sem propósito |
| Landing: Logos, Schools, Stats, Testimonials, Plans, Resources | Não é plataforma comercial |
| Rotas placeholder do aluno: disciplinas, exercícios, simulados, metas | Todas "Em breve", poluem a sidebar |
| Rotas placeholder do professor: alunos, atividades, calendário | Idem |
| Bloco `texto_livre` no AulaEditor | Redundante com `explicacao` |
| 7 arquivos `.md` de documentação interna | Não são entregáveis do TCC |

---

## 6. Dashboard simples e coerente 📊

**Aluno** — já está bom, só trocar os mocks:
```
[Card: Continuar trilha em destaque + progresso real]
[3 stats: Em andamento | Concluídas | Disponíveis]  ← já real
[Meta semanal mock] → substituir por contagem de aulas concluídas na semana
[Atividade recente mock] → substituir por últimas aulas concluídas (localStorage já tem isso)
```

**Professor** — simplificar para:
```
[Stats: Trilhas criadas | Alunos matriculados]  ← já real via API
[Lista de trilhas com botão "Gerenciar"]        ← já real
[Remover: gráfico de engajamento mock, alunos em risco mock, atividade recente mock]
```

---

## 7. Melhorias rápidas com alto impacto visual ⚡

1. **Corrigir os níveis** — mapear `BASICO→Básico`, `INTERMEDIARIO→Intermediário`, `AVANCADO→Avançado` em um único utilitário. Atualmente os cards mostram "BASICO" em maiúsculas

2. **Corrigir o bug do ExplorarTrilhas** — mudar `navigate('/dashboard/trilha/${trilha.id}')` para `navigate('/dashboard/trilha-detalhe/${trilha.id}')` — 1 linha

3. **Persistir progresso no backend** — implementar as 3 chamadas já documentadas no `useTrilhasAluno.js`. Sem isso, o progresso some ao trocar de dispositivo/navegador

4. **Remover sidebar items "Em breve"** do aluno e professor — a sidebar com 8 itens onde 5 são "🚧 Em breve" passa impressão de projeto incompleto. Deixar só o que funciona

5. **Consistência de níveis no CreateTrilhaModal** — trocar `Fundamental/Médio/Vestibular` por `BASICO/INTERMEDIARIO/AVANCADO` para alinhar com o backend

6. **Substituir atividade recente mock** — usar as aulas concluídas do localStorage para gerar um histórico real. Os dados já existem, só falta renderizar