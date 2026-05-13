# Plano de Migração — Aulas com Blocos (Frontend → Backend)

## Objetivo

Migrar o sistema de aulas com blocos do mock (`useAulas.js`) para o backend de forma segura, incremental e sem gargalos futuros.

---

## Fase 0 — Contrato e Tipagem

### 0.1 Contrato do JSON (obrigatório desde o início)

Todo payload de blocos deve seguir este formato. O campo `versao` é **obrigatório**, não opcional — garante compatibilidade futura sem quebrar dados antigos.

```json
{
  "versao": 1,
  "blocos": [
    { "ordem": 1, "tipo": "EXPLICACAO", "conteudo": "## Texto markdown" },
    { "ordem": 2, "tipo": "VIDEO",      "conteudo": "https://youtube.com/watch?v=..." },
    {
      "ordem": 3,
      "tipo": "QUESTIONARIO",
      "pergunta": "Qual é o objetivo?",
      "alternativas": ["Opção A", "Opção B"],
      "correta": 0
    }
  ]
}
```

> O campo `ordem` é obrigatório desde o início. Adicioná-lo depois exige migração de todos os dados existentes.

### Tipos válidos

| Tipo          | Campos obrigatórios                          |
|---------------|----------------------------------------------|
| `EXPLICACAO`  | `conteudo`                                   |
| `VIDEO`       | `conteudo` (URL válida)                      |
| `QUESTIONARIO`| `pergunta`, `alternativas` (≥2), `correta`   |
| `TEXTO_LIVRE` | `conteudo`                                   |

---

### 0.2 ENUM no backend

```java
public enum TipoBloco {
    EXPLICACAO,
    VIDEO,
    QUESTIONARIO,
    TEXTO_LIVRE
}
```

---

### 0.3 DTOs tipados

Usar DTOs separados por tipo evita campos opcionais misturados e torna a validação explícita:

```java
// DTO base
public abstract class BlocoDTO {
    @NotNull
    private Integer ordem;
    @NotNull
    private TipoBloco tipo;
}

// Subtipos
public class BlocoExplicacaoDTO extends BlocoDTO {
    @NotBlank private String conteudo;
}

public class BlocoVideoDTO extends BlocoDTO {
    @NotBlank @URL private String conteudo;
}

public class BlocoQuestionarioDTO extends BlocoDTO {
    @NotBlank private String pergunta;
    @Size(min = 2) private List<@NotBlank String> alternativas;
    @NotNull @Min(0) private Integer correta;
}
```

> Usar herança de DTO + Bean Validation elimina a necessidade de validação manual por `if/else`.

---

### 0.4 DTO do envelope

```java
public class BlocosEnvelopeDTO {
    @NotNull
    @Min(1)
    private Integer versao;

    @NotNull
    @Size(min = 1, max = 50) // limite explícito de blocos por aula
    private List<BlocoDTO> blocos;
}
```

---

## Fase 1 — Backend

### 1.1 Entidade Aula

```java
@Column(columnDefinition = "TEXT", nullable = false)
private String blocos; // JSON serializado do BlocosEnvelopeDTO
```

> Evitar `@Lob` — comportamento inconsistente entre MySQL, PostgreSQL e H2. Usar `columnDefinition = "TEXT"` diretamente.

---

### 1.2 ObjectMapper como Bean Spring (obrigatório)

Nunca instanciar `new ObjectMapper()` diretamente. Injetar o bean gerenciado pelo Spring para respeitar configurações globais (timezone, módulos, etc.):

```java
@Service
public class BlocoService {

    private final ObjectMapper mapper; // injetado, não instanciado

    public BlocoService(ObjectMapper mapper) {
        this.mapper = mapper;
    }

    public BlocosEnvelopeDTO parseBlocos(String json) {
        try {
            return mapper.readValue(json, BlocosEnvelopeDTO.class);
        } catch (JsonProcessingException e) {
            log.error("Erro ao parsear blocos: {}", e.getMessage());
            throw new IllegalArgumentException("JSON de blocos inválido", e);
        }
    }

    public String stringifyBlocos(BlocosEnvelopeDTO envelope) {
        try {
            return mapper.writeValueAsString(envelope);
        } catch (JsonProcessingException e) {
            log.error("Erro ao serializar blocos: {}", e.getMessage());
            throw new IllegalStateException("Erro ao serializar blocos", e);
        }
    }
}
```

---

### 1.3 Validação no Service (não no Controller)

```java
public void validarBlocos(BlocosEnvelopeDTO envelope) {
    if (envelope.getVersao() == null || envelope.getVersao() < 1)
        throw new IllegalArgumentException("Campo 'versao' obrigatório e deve ser >= 1");

    if (envelope.getBlocos() == null || envelope.getBlocos().isEmpty())
        throw new IllegalArgumentException("Aula deve ter ao menos 1 bloco");

    if (envelope.getBlocos().size() > 50)
        throw new IllegalArgumentException("Limite de 50 blocos por aula excedido");

    // Validar ordenação sem gaps
    List<Integer> ordens = envelope.getBlocos().stream()
        .map(BlocoDTO::getOrdem).sorted().toList();
    for (int i = 0; i < ordens.size(); i++) {
        if (ordens.get(i) != i + 1)
            throw new IllegalArgumentException("Campo 'ordem' deve ser sequencial sem gaps");
    }
}
```

---

### 1.4 Limite de tamanho do payload

No `application.properties`:

```properties
spring.servlet.multipart.max-request-size=512KB
spring.servlet.multipart.max-file-size=512KB
```

No Controller, validar tamanho do JSON antes do parse:

```java
private static final int MAX_BLOCOS_JSON_BYTES = 65_536; // 64KB

if (blocoJson.getBytes(StandardCharsets.UTF_8).length > MAX_BLOCOS_JSON_BYTES)
    throw new IllegalArgumentException("Payload de blocos excede o limite de 64KB");
```

---

### 1.5 Resposta da API (JSON real, não string)

```json
{
  "id": 1,
  "titulo": "Aula 1",
  "trilhaId": 1,
  "blocos": {
    "versao": 1,
    "blocos": [
      { "ordem": 1, "tipo": "EXPLICACAO", "conteudo": "..." }
    ]
  }
}
```

> O backend faz o parse e retorna o objeto desserializado — o frontend nunca recebe uma string JSON dentro de um campo JSON.

---

## Fase 2 — Migração do Frontend

### 2.1 Feature flag via variável de ambiente

```
# .env.development
VITE_USE_API=false

# .env.production
VITE_USE_API=true
```

```js
// useAulas.js
const USE_API = import.meta.env.VITE_USE_API === 'true'
```

> Usar variável de ambiente permite rollback sem novo deploy — basta alterar a variável na plataforma (Vercel, etc.) e fazer redeploy do build.

---

### 2.2 Substituir mock por API

Arquivo: `src/hooks/useAulas.js`

```js
import { createAula, getAulasByTrilha, updateAula, deleteAula } from '../api/services/aulaService'

const USE_API = import.meta.env.VITE_USE_API === 'true'

// Substituições:
// mockGetAulas  → getAulasByTrilha(trilhaId)
// mockCreate    → createAula(data)
// mockUpdate    → updateAula(id, data)
// mockDelete    → deleteAula(id)
```

O `aulaService.js` já existe e já tem todos os endpoints implementados. Apenas trocar as chamadas no hook.

---

### 2.3 Compatibilidade do AulaEditor

- `AulaEditor.jsx` não deve ser alterado
- A estrutura de blocos retornada pela API deve ser idêntica à do mock:
  ```js
  { id, ordem, tipo, conteudo, pergunta?, alternativas?, correta? }
  ```
- O backend deve garantir essa forma na resposta — não o frontend

---

## Fase 3 — Testes

### 3.1 Casos obrigatórios

| Cenário                          | Esperado                        |
|----------------------------------|---------------------------------|
| Criar aula com múltiplos blocos  | 201 com blocos retornados       |
| Editar bloco existente           | 200 com dados atualizados       |
| Deletar aula                     | 204 sem corpo                   |
| Questionário sem `correta`       | 400 com mensagem clara          |
| JSON inválido no campo `blocos`  | 400 com mensagem clara          |
| Tipo inexistente                 | 400 com mensagem clara          |
| Payload acima de 64KB            | 413 ou 400                      |
| `versao` ausente                 | 400 com mensagem clara          |

---

### 3.2 Logs estruturados

```java
// Falha de parse
log.error("Falha ao parsear blocos da aula id={}: {}", aulaId, e.getMessage());

// Falha de validação
log.warn("Blocos inválidos na aula id={}: {}", aulaId, motivo);
```

> Logar `aulaId` junto ao erro facilita rastreamento em produção.

---

## Fase 4 — Evolução para modelo relacional (quando necessário)

Migrar para tabelas **somente se** houver necessidade real de:

- Analytics por bloco (ex: taxa de acerto por questão)
- Progresso individual do aluno por bloco
- Queries complexas sobre conteúdo
- Relatórios agregados

### Gatilho concreto para migrar

> Migrar quando qualquer um destes critérios for atingido:
> - Mais de 500 aulas no banco
> - Necessidade de query sobre conteúdo de blocos
> - Relatório de progresso por bloco solicitado

### Estratégia de migração futura

1. Ler todos os registros com JSON existente
2. Usar o campo `versao` para aplicar o parser correto por versão
3. Converter para tabelas (`aula`, `bloco_aula`, `alternativa`)
4. Manter o campo `blocos` como fallback por 1 sprint
5. Remover o campo após validação completa

---

## Riscos e mitigação

| Risco                          | Solução                                              |
|--------------------------------|------------------------------------------------------|
| JSON inválido                  | Parse com tratamento de exceção + log com `aulaId`   |
| Dados inconsistentes           | DTO tipado por subtipo + Bean Validation             |
| Payload gigante                | Limite de 64KB no Controller + max 50 blocos no DTO  |
| Rollback em produção           | `VITE_USE_API` via variável de ambiente              |
| Schema evoluindo sem controle  | Campo `versao` obrigatório desde o início            |
| ObjectMapper mal configurado   | Injetar bean Spring, nunca `new ObjectMapper()`      |
| Migração futura sem critério   | Gatilho definido explicitamente (ver Fase 4)         |

---

## Resumo

| O que fazer agora                          | Por quê                                      |
|--------------------------------------------|----------------------------------------------|
| Campo `versao` obrigatório no JSON         | Evita quebra silenciosa ao evoluir o schema  |
| Campo `ordem` obrigatório desde o início   | Evita migração de dados depois               |
| DTOs separados por tipo de bloco           | Validação explícita sem `if/else` manual     |
| `ObjectMapper` injetado via Spring         | Respeita configurações globais               |
| `VITE_USE_API` via `.env`                  | Rollback sem novo deploy                     |
| Limite de 64KB e 50 blocos                 | Previne payloads abusivos                    |
| Gatilho definido para migração relacional  | Evita migração prematura ou nunca feita      |
