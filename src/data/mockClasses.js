/**
 * Mock class registry — keyed by join code.
 * When the backend is ready, replace the JoinClassModal lookup with
 * GET /api/v1/turmas/codigo/:code
 */
export const MOCK_CLASSES = {
  'MAT-3A-7X2K': {
    id:         1,
    codigo:     'MAT-3A-7X2K',
    nome:       '3º A — Matemática',
    disciplina: 'Matemática',
    descricao:  'Funções, geometria analítica e preparação para o ENEM.',
    tipo:       'PUBLICA',
    nivel:      'Médio',
    professor:  'Prof. Carlos Lima',
    alunoIds:   [10, 11, 12, 13, 14],
  },
  'QUI-2B-9PNR': {
    id:         2,
    codigo:     'QUI-2B-9PNR',
    nome:       '2º B — Química',
    disciplina: 'Química',
    descricao:  'Química orgânica e reações de oxirredução.',
    tipo:       'PRIVADA',
    nivel:      'Médio',
    professor:  'Prof. Ana Souza',
    alunoIds:   [10, 15, 16],
  },
  'POR-1C-4MKW': {
    id:         3,
    codigo:     'POR-1C-4MKW',
    nome:       '1º C — Português',
    disciplina: 'Português',
    descricao:  'Interpretação textual, gramática e redação.',
    tipo:       'PUBLICA',
    nivel:      'Médio',
    professor:  'Prof. Beatriz Nunes',
    alunoIds:   [11, 17, 18, 19],
  },
  'BIO-VES-2ZQJ': {
    id:         4,
    codigo:     'BIO-VES-2ZQJ',
    nome:       'Biologia — Vestibular',
    disciplina: 'Biologia',
    descricao:  'Genética, ecologia e evolução para vestibulares.',
    tipo:       'PUBLICA',
    nivel:      'Vestibular',
    professor:  'Prof. Marcos Oliveira',
    alunoIds:   [],
  },
}
