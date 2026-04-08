/**
 * Class Service — Persistent Mock Database
 * 
 * Manages all class-related operations with full localStorage persistence.
 * Data persists across page reloads and behaves like a real backend.
 * 
 * Usage:
 *   import { classService } from './classService'
 *   const classData = await classService.createClass(professorId, classData)
 *   const turma = await classService.getClassById(classId)
 *   await classService.addMessageToMural(classId, userId, autorNome, texto)
 * 
 * Data Structure:
 *   - Classes stored in localStorage with full mural (messages + activities)
 *   - Each class includes members list and timestamps
 *   - All operations are async (for future backend compatibility)
 *   - Network delay simulated in mock mode
 */

import { USE_MOCK, simulateNetworkDelay, ENDPOINTS } from './config'

// ─────────────────────────────────────────────────────────────────────────────
// LOCAL STORAGE PERSISTENCE
// ─────────────────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'sc_classes_db'
const STORAGE_KEY_ENROLLMENTS = 'sc_class_enrollments'

/**
 * Read all classes from localStorage.
 * Returns { [classId]: classObject }
 */
function readClassesDB() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    return JSON.parse(raw)
  } catch (err) {
    console.error('[classService] Failed to read classes from localStorage:', err)
    return {}
  }
}

/**
 * Write all classes to localStorage.
 * @param {Record<string, Object>} db - { [classId]: classObject }
 */
function writeClassesDB(db) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
  } catch (err) {
    console.error('[classService] Failed to write classes to localStorage:', err)
    throw new Error('Erro ao salvar turma. Tente novamente.')
  }
}

/**
 * Read member enrollments (which classes each user is in).
 * Returns { [userId]: [classIds...] }
 */
function readEnrollmentsDB() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ENROLLMENTS)
    if (!raw) return {}
    return JSON.parse(raw)
  } catch (err) {
    console.error('[classService] Failed to read enrollments:', err)
    return {}
  }
}

/**
 * Write member enrollments to localStorage.
 */
function writeEnrollmentsDB(db) {
  try {
    localStorage.setItem(STORAGE_KEY_ENROLLMENTS, JSON.stringify(db))
  } catch (err) {
    console.error('[classService] Failed to write enrollments:', err)
    throw new Error('Erro ao atualizar inscrição. Tente novamente.')
  }
}

/**
 * Initialize database with seed data (called once if empty).
 */
function initializeSeedData() {
  const classes = readClassesDB()
  if (Object.keys(classes).length > 0) return  // Already has data

  const seedClasses = {
    'class-001': {
      id: 'class-001',
      codigo: 'MAT-3A-7X2K',
      nome: '3º A — Matemática',
      disciplina: 'Matemática',
      descricao: 'Funções, geometria analítica e preparação para o ENEM.',
      tipo: 'PUBLICA',
      nivel: 'Médio',
      professorId: 'user-002',
      professorNome: 'Prof. Carlos Lima',
      criadaEm: new Date('2026-01-15').toISOString(),
      membros: [
        { id: 'user-002', nome: 'Prof. Carlos Lima', role: 'teacher' },
      ],
      mural: [],
      materiais: [],
    },
    'class-002': {
      id: 'class-002',
      codigo: 'QUI-2B-9PNR',
      nome: '2º B — Química',
      disciplina: 'Química',
      descricao: 'Química orgânica e reações de oxirredução.',
      tipo: 'PRIVADA',
      nivel: 'Médio',
      professorId: 'user-003',
      professorNome: 'Prof. Ana Souza',
      criadaEm: new Date('2026-01-10').toISOString(),
      membros: [
        { id: 'user-003', nome: 'Prof. Ana Souza', role: 'teacher' },
      ],
      mural: [],
      materiais: [],
    },
  }

  writeClassesDB(seedClasses)
}

// ─────────────────────────────────────────────────────────────────────────────
// MOCK IMPLEMENTATIONS (WITH LOCALSTORAGE PERSISTENCE)
// ─────────────────────────────────────────────────────────────────────────────

async function mockCreateClass(professorId, { nome, disciplina, descricao, tipo, nivel, professorNome }) {
  await simulateNetworkDelay()

  if (!professorId) throw new Error('Sessão inválida. Faça login novamente.')
  if (!nome?.trim()) throw new Error('Nome da turma é obrigatório.')
  if (!disciplina) throw new Error('Disciplina é obrigatória.')
  if (!nivel) throw new Error('Nível é obrigatório.')

  // Generate unique class code
  const codigo = generateClassCode(disciplina)

  const db = readClassesDB()
  
  // Check if code already exists (unlikely but possible)
  if (Object.values(db).some(c => c.codigo === codigo)) {
    throw new Error('Erro ao gerar código. Tente novamente.')
  }

  const classId = `class-${Date.now()}`
  const displayName = professorNome || `Professor ${classId}`
  
  const newClass = {
    id: classId,
    codigo,
    nome: nome.trim(),
    disciplina,
    descricao: descricao?.trim() || '',
    tipo,
    nivel,
    professorId,
    professorNome: displayName,
    criadaEm: new Date().toISOString(),
    membros: [
      { id: professorId, nome: displayName, role: 'teacher' },
    ],
    mural: [
      {
        id: `post-${Date.now()}`,
        tipo: 'sistema',
        autor: 'Sistema',
        texto: `Turma criada com sucesso! Selecione a aba "Membros" para ver o código da turma.`,
        createdAt: new Date().toISOString(),
      },
    ],
    materiais: [],
  }

  db[classId] = newClass

  writeClassesDB(db)

  return newClass
}

async function mockGetClassById(classId) {
  await simulateNetworkDelay()

  if (!classId) throw new Error('ID da turma inválido.')

  const db = readClassesDB()
  const classData = db[classId]

  if (!classData) throw new Error('Turma não encontrada.')

  return classData
}

async function mockGetClassesByUser(userId, role) {
  await simulateNetworkDelay()

  if (!userId) throw new Error('Sessão inválida. Faça login novamente.')

  const db = readClassesDB()

  if (role === 'teacher' || role === 'admin') {
    // Teachers see classes they created
    return Object.values(db).filter(c => c.professorId === userId)
  }

  // Students see classes they're enrolled in
  const enrollments = readEnrollmentsDB()
  const myClassIds = enrollments[userId] || []
  return myClassIds.map(id => db[id]).filter(Boolean)
}

async function mockJoinClass(userId, { codigo, userName }) {
  await simulateNetworkDelay()

  if (!userId) throw new Error('Sessão inválida. Faça login novamente.')
  if (!codigo) throw new Error('Código da turma é obrigatório.')

  const db = readClassesDB()
  const classData = Object.values(db).find(c => c.codigo === codigo.toUpperCase())

  if (!classData) throw new Error('Código de turma inválido.')

  // Check if already a member
  if (classData.membros.some(m => m.id === userId)) {
    throw new Error('Você já está inscrito nesta turma.')
  }

  // Add user to class members
  classData.membros.push({
    id: userId,
    nome: userName || `Aluno ${userId}`,
    role: 'student',
  })

  // Add class to user enrollments
  const enrollments = readEnrollmentsDB()
  if (!enrollments[userId]) enrollments[userId] = []
  enrollments[userId].push(classData.id)

  writeClassesDB(db)
  writeEnrollmentsDB(enrollments)

  return classData
}

async function mockLeaveClass(userId, classId) {
  await simulateNetworkDelay()

  if (!userId) throw new Error('Sessão inválida. Faça login novamente.')
  if (!classId) throw new Error('ID da turma inválido.')

  const db = readClassesDB()
  const classData = db[classId]

  if (!classData) throw new Error('Turma não encontrada.')

  // Remove from members
  const memberIndex = classData.membros.findIndex(m => m.id === userId)
  if (memberIndex === -1) throw new Error('Você não está inscrito nesta turma.')

  classData.membros.splice(memberIndex, 1)

  // Remove from enrollments
  const enrollments = readEnrollmentsDB()
  if (enrollments[userId]) {
    const idx = enrollments[userId].indexOf(classId)
    if (idx !== -1) enrollments[userId].splice(idx, 1)
  }

  writeClassesDB(db)
  writeEnrollmentsDB(enrollments)

  return { success: true }
}

async function mockAddMessageToMural(classId, userId, autorNome, texto) {
  await simulateNetworkDelay()

  if (!classId) throw new Error('ID da turma inválido.')
  if (!userId) throw new Error('Sessão inválida. Faça login novamente.')
  if (!texto?.trim()) throw new Error('Mensagem não pode estar vazia.')

  const db = readClassesDB()
  const classData = db[classId]

  if (!classData) throw new Error('Turma não encontrada.')

  // Verify user is a member
  if (!classData.membros.some(m => m.id === userId)) {
    throw new Error('Você não é membro desta turma.')
  }

  const post = {
    id: `post-${Date.now()}-${Math.random()}`,
    tipo: 'mensagem',
    autor: autorNome || userId,
    autorId: userId,
    texto: texto.trim(),
    createdAt: new Date().toISOString(),
    comentarios: [],
  }

  classData.mural.push(post)
  writeClassesDB(db)

  return post
}

async function mockAddActivityToMural(classId, userId, autorNome, { titulo, instrucoes, dataEntrega }) {
  await simulateNetworkDelay()

  if (!classId) throw new Error('ID da turma inválido.')
  if (!userId) throw new Error('Sessão inválida. Faça login novamente.')
  if (!titulo?.trim()) throw new Error('Título da atividade é obrigatório.')
  if (!instrucoes?.trim()) throw new Error('Instruções são obrigatórias.')

  const db = readClassesDB()
  const classData = db[classId]

  if (!classData) throw new Error('Turma não encontrada.')

  // Verify user is professor
  if (!classData.membros.some(m => m.id === userId && m.role === 'teacher')) {
    throw new Error('Apenas professores podem criar atividades.')
  }

  const post = {
    id: `post-${Date.now()}-${Math.random()}`,
    tipo: 'atividade',
    autor: autorNome || userId,
    autorId: userId,
    titulo: titulo.trim(),
    instrucoes: instrucoes.trim(),
    dataEntrega: dataEntrega || null,
    createdAt: new Date().toISOString(),
    comentarios: [],
  }

  classData.mural.push(post)
  writeClassesDB(db)

  return post
}

async function mockGetClassMembers(classId) {
  await simulateNetworkDelay()

  if (!classId) throw new Error('ID da turma inválido.')

  const db = readClassesDB()
  const classData = db[classId]

  if (!classData) throw new Error('Turma não encontrada.')

  return classData.membros
}

async function mockAddCommentToPost(classId, postId, userId, autorNome, texto) {
  await simulateNetworkDelay()

  if (!classId) throw new Error('ID da turma inválido.')
  if (!postId) throw new Error('ID da publicação inválido.')
  if (!userId) throw new Error('Sessão inválida. Faça login novamente.')
  if (!texto?.trim()) throw new Error('Comentário não pode estar vazio.')

  const db = readClassesDB()
  const classData = db[classId]

  if (!classData) throw new Error('Turma não encontrada.')

  // Find the post in the mural
  const post = classData.mural.find(p => p.id === postId)
  if (!post) throw new Error('Publicação não encontrada.')

  // Verify user is a member
  if (!classData.membros.some(m => m.id === userId)) {
    throw new Error('Você não é membro desta turma.')
  }

  // Initialize comentarios array if missing (defensive)
  if (!post.comentarios) {
    post.comentarios = []
  }

  // Create comment object
  const comment = {
    id: `comment-${Date.now()}-${Math.random()}`,
    autor: autorNome || userId,
    autorId: userId,
    texto: texto.trim(),
    createdAt: new Date().toISOString(),
  }

  // Add comment to post
  post.comentarios.push(comment)
  writeClassesDB(db)

  return comment
}

async function mockDeleteCommentFromPost(classId, postId, commentId, userId) {
  await simulateNetworkDelay()

  if (!classId) throw new Error('ID da turma inválido.')
  if (!postId) throw new Error('ID da publicação inválido.')
  if (!commentId) throw new Error('ID do comentário inválido.')

  const db = readClassesDB()
  const classData = db[classId]

  if (!classData) throw new Error('Turma não encontrada.')

  // Find the post in the mural
  const post = classData.mural.find(p => p.id === postId)
  if (!post) throw new Error('Publicação não encontrada.')

  // Initialize comentarios array if missing (defensive)
  if (!post.comentarios) {
    post.comentarios = []
  }

  // Find and remove comment
  const commentIndex = post.comentarios.findIndex(c => c.id === commentId)
  if (commentIndex === -1) throw new Error('Comentário não encontrado.')

  // Get user's role from class members
  const userMember = classData.membros.find(m => m.id === userId)
  const userRole = userMember?.role

  // Verify permission: user is either the author OR a teacher
  const comment = post.comentarios[commentIndex]
  const isAuthor = comment.autorId === userId
  const isTeacher = userRole === 'teacher'

  // DEBUG: Log permission check
  console.log('[classService] deleteCommentFromPost permission check:', {
    userId,
    userRole,
    userMember: userMember ? { id: userMember.id, nome: userMember.nome, role: userMember.role } : 'NOT_FOUND',
    commentId,
    comments: post.comentarios.map(c => ({ id: c.id, autorId: c.autorId, autor: c.autor })),
    comment: { id: comment.id, autorId: comment.autorId, autor: comment.autor },
    isAuthor,
    isTeacher,
    allowed: isAuthor || isTeacher,
  })

  if (!isAuthor && !isTeacher) {
    throw new Error('Você não pode deletar este comentário.')
  }

  post.comentarios.splice(commentIndex, 1)
  writeClassesDB(db)

  return { success: true }
}

/**
 * Remove a member from a class (teacher only).
 * @param {string} classId
 * @param {string} memberIdToRemove - ID of the member to remove
 * @param {string} userId - ID of the user performing the action (must be teacher)
 */
async function mockRemoveMember(classId, memberIdToRemove, userId) {
  await simulateNetworkDelay()

  if (!classId) throw new Error('ID da turma inválido.')
  if (!memberIdToRemove) throw new Error('ID do aluno inválido.')
  if (!userId) throw new Error('Sessão inválida. Faça login novamente.')

  const db = readClassesDB()
  const classData = db[classId]

  if (!classData) throw new Error('Turma não encontrada.')

  // Verify user is the teacher of this class
  if (classData.professorId !== userId) {
    throw new Error('Apenas o professor pode remover alunos.')
  }

  // Find and verify the member to remove is a student (not teacher)
  const memberIndex = classData.membros.findIndex(m => m.id === memberIdToRemove)
  if (memberIndex === -1) throw new Error('Aluno não encontrado.')

  const memberToRemove = classData.membros[memberIndex]
  if (memberToRemove.role === 'teacher') {
    throw new Error('Não é possível remover o professor da turma.')
  }

  // Remove the member
  classData.membros.splice(memberIndex, 1)

  // Also remove from enrollments tracking
  const enrollments = readEnrollmentsDB()
  if (enrollments[memberIdToRemove]) {
    enrollments[memberIdToRemove] = enrollments[memberIdToRemove].filter(id => id !== classId)
  }

  writeClassesDB(db)
  writeEnrollmentsDB(enrollments)

  return { success: true }
}

async function realRemoveMember(classId, memberIdToRemove, userId) {
  if (!userId) {
    console.error('[classService] user.id is missing — aborting API call.')
    throw new Error('Sessão inválida. Faça login novamente.')
  }

  const res = await fetch(`${ENDPOINTS.classes}/${classId}/members/${memberIdToRemove}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  })

  if (!res.ok) {
    if (res.status === 404) throw new Error('Aluno não encontrado.')
    if (res.status === 403) throw new Error('Apenas o professor pode remover alunos.')
    throw new Error('Não foi possível remover aluno. Tente novamente.')
  }

  return res.json()
}

/**
 * Generate a unique class code like "MAT-3A-7X2K".
 */
function generateClassCode(disciplina) {
  const prefix = (disciplina || 'TUR')
    .slice(0, 3)
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const rand = (n) =>
    Array.from({ length: n }, () =>
      chars[Math.floor(Math.random() * chars.length)]
    ).join('')

  return `${prefix}-${rand(2)}${Math.floor(Math.random() * 9 + 1)}-${rand(4)}`
}

// ─────────────────────────────────────────────────────────────────────────────
// REAL API IMPLEMENTATIONS
// ─────────────────────────────────────────────────────────────────────────────

async function realCreateClass(professorId, classData) {
  if (!professorId) {
    console.error('[classService] user.id is missing — aborting API call.')
    throw new Error('Sessão inválida. Faça login novamente.')
  }

  const res = await fetch(ENDPOINTS.createClass || `${ENDPOINTS.classes}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ professorId, ...classData }),
  })

  if (!res.ok) {
    if (res.status === 400) throw new Error('Dados da turma inválidos.')
    throw new Error('Não foi possível criar a turma. Tente novamente.')
  }

  return res.json()
}

async function realGetClassById(classId) {
  if (!classId) throw new Error('ID da turma inválido.')

  const res = await fetch(`${ENDPOINTS.classes}/${classId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  })

  if (!res.ok) {
    if (res.status === 404) throw new Error('Turma não encontrada.')
    throw new Error('Não foi possível carregar a turma.')
  }

  return res.json()
}

async function realGetClassesByUser(userId, role) {
  if (!userId) {
    console.error('[classService] user.id is missing — aborting API call.')
    throw new Error('Sessão inválida. Faça login novamente.')
  }

  const endpoint = role === 'teacher'
    ? `${ENDPOINTS.myClasses}?role=teacher`
    : `${ENDPOINTS.myClasses}`

  const res = await fetch(endpoint, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  })

  if (!res.ok) {
    throw new Error('Não foi possível carregar suas turmas.')
  }

  return res.json()
}

async function realJoinClass(userId, { codigo, userName }) {
  if (!userId) {
    console.error('[classService] user.id is missing — aborting API call.')
    throw new Error('Sessão inválida. Faça login novamente.')
  }

  const res = await fetch(ENDPOINTS.joinClass, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ codigo, userName }),
  })

  if (!res.ok) {
    if (res.status === 404) throw new Error('Código de turma inválido.')
    if (res.status === 409) throw new Error('Você já está inscrito nesta turma.')
    throw new Error('Não foi possível entrar na turma. Tente novamente.')
  }

  return res.json()
}

async function realLeaveClass(userId, classId) {
  if (!userId) {
    console.error('[classService] user.id is missing — aborting API call.')
    throw new Error('Sessão inválida. Faça login novamente.')
  }

  const res = await fetch(ENDPOINTS.leaveClass(classId), {
    method: 'POST',
  })

  if (!res.ok) {
    if (res.status === 404) throw new Error('Turma não encontrada.')
    throw new Error('Não foi possível sair da turma. Tente novamente.')
  }

  return res.json()
}

async function realAddMessageToMural(classId, userId, autorNome, texto) {
  if (!userId) {
    console.error('[classService] user.id is missing — aborting API call.')
    throw new Error('Sessão inválida. Faça login novamente.')
  }

  const res = await fetch(`${ENDPOINTS.classes}/${classId}/mural/mensagem`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ texto }),
  })

  if (!res.ok) {
    if (res.status === 404) throw new Error('Turma não encontrada.')
    throw new Error('Não foi possível adicionar mensagem. Tente novamente.')
  }

  return res.json()
}

async function realAddActivityToMural(classId, userId, autorNome, activityData) {
  if (!userId) {
    console.error('[classService] user.id is missing — aborting API call.')
    throw new Error('Sessão inválida. Faça login novamente.')
  }

  const res = await fetch(`${ENDPOINTS.classes}/${classId}/mural/atividade`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(activityData),
  })

  if (!res.ok) {
    if (res.status === 404) throw new Error('Turma não encontrada.')
    if (res.status === 403) throw new Error('Apenas professores podem criar atividades.')
    throw new Error('Não foi possível criar atividade. Tente novamente.')
  }

  return res.json()
}

async function realGetClassMembers(classId) {
  if (!classId) throw new Error('ID da turma inválido.')

  const res = await fetch(`${ENDPOINTS.classes}/${classId}/membros`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  })

  if (!res.ok) {
    if (res.status === 404) throw new Error('Turma não encontrada.')
    throw new Error('Não foi possível carregar membros da turma.')
  }

  return res.json()
}

async function realAddCommentToPost(classId, postId, userId, autorNome, texto) {
  if (!userId) {
    console.error('[classService] user.id is missing — aborting API call.')
    throw new Error('Sessão inválida. Faça login novamente.')
  }

  const res = await fetch(`${ENDPOINTS.classes}/${classId}/mural/${postId}/comentarios`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ texto }),
  })

  if (!res.ok) {
    if (res.status === 404) throw new Error('Publicação não encontrada.')
    throw new Error('Não foi possível adicionar comentário. Tente novamente.')
  }

  return res.json()
}

async function realDeleteCommentFromPost(classId, postId, commentId, userId) {
  if (!userId) {
    console.error('[classService] user.id is missing — aborting API call.')
    throw new Error('Sessão inválida. Faça login novamente.')
  }

  const res = await fetch(`${ENDPOINTS.classes}/${classId}/mural/${postId}/comentarios/${commentId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  })

  if (!res.ok) {
    if (res.status === 404) throw new Error('Comentário não encontrado.')
    if (res.status === 403) throw new Error('Você não pode deletar este comentário.')
    throw new Error('Não foi possível deletar comentário. Tente novamente.')
  }

  return res.json()
}

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC API (Dynamic routing between mock & real)
// ─────────────────────────────────────────────────────────────────────────────

// Initialize seed data on module load (mock mode only)
if (USE_MOCK) {
  try {
    initializeSeedData()
  } catch (err) {
    console.warn('[classService] Failed to initialize seed data:', err)
  }
}

export const classService = {
  /**
   * Create a new class.
   * @param {string} professorId - Teacher's user ID
   * @param {Object} classData - { nome, disciplina, descricao, tipo, nivel }
   * @returns {Promise<{id, codigo, nome, membros, mural, ...}>}
   */
  createClass: (professorId, classData) =>
    USE_MOCK ? mockCreateClass(professorId, classData) : realCreateClass(professorId, classData),

  /**
   * Get a specific class by ID.
   * @param {string} classId
   * @returns {Promise<{id, codigo, nome, membros, mural, ...}>}
   */
  getClassById: (classId) =>
    USE_MOCK ? mockGetClassById(classId) : realGetClassById(classId),

  /**
   * Get classes for a user (by role).
   * Students: classes they're enrolled in
   * Teachers: classes they created
   * @param {string} userId
   * @param {string} role - 'student' | 'teacher' | 'admin'
   * @returns {Promise<Array<{id, codigo, nome, ...}>>}
   */
  getClassesByUser: (userId, role) =>
    USE_MOCK ? mockGetClassesByUser(userId, role) : realGetClassesByUser(userId, role),

  /**
   * Join a class using a code.
   * @param {string} userId
   * @param {Object} payload - { codigo }
   * @returns {Promise<{id, codigo, nome, membros, mural, ...}>}
   */
  joinClass: (userId, payload) =>
    USE_MOCK ? mockJoinClass(userId, payload) : realJoinClass(userId, payload),

  /**
   * Leave a class.
   * @param {string} userId
   * @param {string} classId
   * @returns {Promise<{success: true}>}
   */
  leaveClass: (userId, classId) =>
    USE_MOCK ? mockLeaveClass(userId, classId) : realLeaveClass(userId, classId),

  /**
   * Add a message to the class mural.
   * @param {string} classId
   * @param {string} userId
   * @param {string} autorNome - Author's display name
   * @param {string} texto - Message text
   * @returns {Promise<{id, tipo, autor, texto, createdAt, ...}>}
   */
  addMessageToMural: (classId, userId, autorNome, texto) =>
    USE_MOCK
      ? mockAddMessageToMural(classId, userId, autorNome, texto)
      : realAddMessageToMural(classId, userId, autorNome, texto),

  /**
   * Add an activity to the class mural.
   * @param {string} classId
   * @param {string} userId
   * @param {string} autorNome - Author's display name
   * @param {Object} activityData - { titulo, instrucoes, dataEntrega }
   * @returns {Promise<{id, tipo, autor, titulo, instrucoes, ...}>}
   */
  addActivityToMural: (classId, userId, autorNome, activityData) =>
    USE_MOCK
      ? mockAddActivityToMural(classId, userId, autorNome, activityData)
      : realAddActivityToMural(classId, userId, autorNome, activityData),

  /**
   * Get all members of a class.
   * @param {string} classId
   * @returns {Promise<Array<{id, nome, role}>>}
   */
  getClassMembers: (classId) =>
    USE_MOCK ? mockGetClassMembers(classId) : realGetClassMembers(classId),

  /**
   * Add a comment to a mural post.
   * @param {string} classId
   * @param {string} postId
   * @param {string} userId
   * @param {string} autorNome - Author's display name
   * @param {string} texto - Comment text
   * @returns {Promise<{id, autor, texto, createdAt, ...}>}
   */
  addCommentToPost: (classId, postId, userId, autorNome, texto) =>
    USE_MOCK
      ? mockAddCommentToPost(classId, postId, userId, autorNome, texto)
      : realAddCommentToPost(classId, postId, userId, autorNome, texto),

  /**
   * Delete a comment from a mural post.
   * @param {string} classId
   * @param {string} postId
   * @param {string} commentId
   * @param {string} userId
   * @returns {Promise<{success: true}>}
   */
  deleteCommentFromPost: (classId, postId, commentId, userId) =>
    USE_MOCK
      ? mockDeleteCommentFromPost(classId, postId, commentId, userId)
      : realDeleteCommentFromPost(classId, postId, commentId, userId),

  /**
   * Remove a member (student) from a class (teacher only).
   * @param {string} classId
   * @param {string} memberIdToRemove
   * @param {string} userId - Must be the class teacher
   * @returns {Promise<{success: true}>}
   */
  removeMember: (classId, memberIdToRemove, userId) =>
    USE_MOCK
      ? mockRemoveMember(classId, memberIdToRemove, userId)
      : realRemoveMember(classId, memberIdToRemove, userId),
}
