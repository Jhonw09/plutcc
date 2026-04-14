# Migração: Aulas com Blocos (Mock → Backend)

## Contexto

Atualmente, a estrutura de aulas usa dados mockados em `src/hooks/useAulas.js`.
Cada aula possui um array de **blocos** que representa o conteúdo estruturado da aula.

### Estrutura atual de uma aula (mock)

```json
{
  "id": 1,
  "titulo": "Aula 1 — Introdução ao tema",
  "trilhaId": 1,
  "blocos": [
    { "id": 1, "tipo": "explicacao", "conteudo": "## Objetivos\n..." },
    { "id": 2, "tipo": "video", "conteudo": "https://youtube.com/..." },
    {
      "id": 3,
      "tipo": "questionario",
      "pergunta": "Qual é a capital do Brasil?",
      "alternativas": ["Brasília", "São Paulo", "Rio de Janeiro", "Salvador"],
      "correta": 0
    },
    { "id": 4, "tipo": "texto_livre", "conteudo": "Observações extras..." }
  ]
}
```

### Tipos de bloco (futuro enum)

| Valor          | Descrição                        |
|----------------|----------------------------------|
| `EXPLICACAO`   | Conteúdo teórico (suporta Markdown) |
| `VIDEO`        | Link de vídeo (YouTube, etc.)    |
| `QUESTIONARIO` | Pergunta com alternativas        |
| `TEXTO_LIVRE`  | Anotações ou instruções extras   |

---

## Estratégia Recomendada — Coluna JSON (Opção Simples)

Salvar o array `blocos` como uma coluna `TEXT` na tabela `aulas`, serializando o JSON inteiro.
Ideal para o estágio atual do projeto — zero tabelas novas, implementação rápida.

### 1. Entidade `Aula` (Java)

Adicionar o campo `blocos`:

```java
@Column(columnDefinition = "TEXT")
private String blocos; // JSON serializado do array de blocos
```

### 2. DTO

```java
public class AulaDTO {
    private Long id;
    private String titulo;
    private Long trilhaId;
    private String blocos; // JSON string
}
```

### 3. Endpoint esperado pelo frontend

O frontend já usa `aulaService.js` com os seguintes endpoints:

| Método | Rota                          | Descrição               |
|--------|-------------------------------|-------------------------|
| GET    | `/api/v1/aulas/trilha/{id}`   | Listar aulas da trilha  |
| POST   | `/api/v1/aulas`               | Criar aula              |
| PUT    | `/api/v1/aulas/{id}`          | Atualizar aula          |
| DELETE | `/api/v1/aulas/{id}`          | Excluir aula            |

### 4. Payload esperado (POST/PUT)

```json
{
  "titulo": "Aula 1 — Introdução",
  "trilhaId": 1,
  "blocos": "[{\"id\":1,\"tipo\":\"explicacao\",\"conteudo\":\"...\"}]"
}
```

---

## Estratégia Alternativa — Tabelas Separadas (Opção Estruturada)

Usar quando precisar de queries/analytics sobre os blocos (ex: relatórios, contagem de questionários).

### Modelo de dados

```
aulas
  id          BIGINT PK
  titulo      VARCHAR
  trilha_id   BIGINT FK
  ordem       INT

bloco_aula
  id          BIGINT PK
  aula_id     BIGINT FK
  tipo        ENUM('EXPLICACAO','VIDEO','QUESTIONARIO','TEXTO_LIVRE')
  conteudo    TEXT
  ordem       INT

alternativa
  id          BIGINT PK
  bloco_id    BIGINT FK
  texto       VARCHAR
  correta     BOOLEAN
```

---

## Migração do Frontend (quando o backend estiver pronto)

Apenas **substituir as funções mock** no `useAulas.js` pelas chamadas reais do `aulaService.js`.

### Antes (mock)
```js
async function mockCreate(data) {
  const aula = { ...data, id: nextId++ }
  mockAulas = [...mockAulas, aula]
  return aula
}
```

### Depois (real)
```js
import { createAula as apiCreateAula } from '../api/services/aulaService'

const createAulaHandler = useCallback(async (aulaData) => {
  const newAula = await apiCreateAula({ ...aulaData, trilhaId })
  setAulas(prev => [...prev, newAula])
  return newAula
}, [trilhaId])
```

O `AulaEditor` e os componentes de bloco **não precisam de nenhuma alteração**.

---

## Arquivos relevantes

| Arquivo | Descrição |
|---|---|
| `src/hooks/useAulas.js` | Hook com mock — substituir pelas chamadas reais |
| `src/api/services/aulaService.js` | Serviço já implementado com todos os endpoints |
| `src/components/teacher/AulaEditor.jsx` | Editor de aulas com sistema de blocos |
| `src/components/teacher/AulaEditor.module.css` | Estilos do editor |
| `src/pages/TeacherTrilhaPage.jsx` | Página que usa o editor |
