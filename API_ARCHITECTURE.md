================================================================================
                        API & SERVICE LAYER ARCHITECTURE
================================================================================

TABLE OF CONTENTS
================================================================================
1. Overview
2. Directory Structure
3. How It Works
4. Service Patterns
5. Mock vs. Real Backend
6. Switching from Mock to Real Backend
7. Adding New Services
8. Error Handling
9. Usage Examples
10. Configuration Reference


================================================================================
1. OVERVIEW
================================================================================

The new service architecture decouples the data layer from the UI layer. This
allows you to:

- Test with mock data before the backend is ready
- Switch to real APIs without changing components
- Maintain consistent error handling and types
- Easily add new services following the same pattern
- Keep the UI completely unaware of backend details

CORE PRINCIPLE:
  Services abstract WHAT the data is.
  Components only care THAT the data exists.
  Services handle HOW to get it (mock or real).


================================================================================
2. DIRECTORY STRUCTURE
================================================================================

src/api/
├── config.js                  ← OLD: Backend URL config (still valid)
├── services/
│   ├── config.js              ← NEW: Mock vs. real toggle + shared config
│   ├── authService.js         ← NEW: Auth operations (login, signup, etc.)
│   └── classService.js        ← NEW: Class operations (join, leave, etc.)
│
src/context/
├── AuthContext.jsx            ← UPDATED: Now uses authService instead of fetch
│
src/hooks/
├── useAuth.js                 ← EXISTING: Access auth context
├── useClass.js                ← NEW: Access class service with loading/error
└── ... (other hooks)


================================================================================
3. HOW IT WORKS
================================================================================

FLOW DIAGRAM:

  UI Component
       ↓
  useClass() hook
       ↓
  classService.joinClass()
       ↓
  Check: USE_MOCK === true?
       ↙                 ↘
   YES                    NO
    ↓                      ↓
Return Mock Data    Make Real API Call
(with simulated    (fetch to backend)
network delay)
    ↓                      ↓
   Result                Result
    ↓                      ↓
  Component updates & renders

EXECUTION PATH (MOCK):

  // In component:
  const { joinClass } = useClass()

  // User clicks "Join Class"
  await joinClass('ABC123')
    ↓
  classService.joinClass(userId, { codigo: 'ABC123' })
    ↓
  Check: USE_MOCK === true? → YES
    ↓
  mockJoinClass(userId, { codigo: 'ABC123' })
    ↓
  await simulateNetworkDelay() [300–800ms]
    ↓
  Find class by codigo in mockClasses array
    ↓
  Add enrollment to mockEnrollments
    ↓
  Return class data
    ↓
  Component gets result

EXECUTION PATH (REAL):

  Same as above, but at "Check: USE_MOCK === true?" → NO
    ↓
  realJoinClass(userId, { codigo: 'ABC123' })
    ↓
  await fetch(ENDPOINTS.joinClass, { method: 'POST', ... })
    ↓
  Backend processes request
    ↓
  Return class data
    ↓
  Component gets result


================================================================================
4. SERVICE PATTERNS
================================================================================

Each service follows a consistent pattern:

┌─────────────────────────────────────────────────────────────────────────────┐
│ PATTERN: authService (Example)                                             │
└─────────────────────────────────────────────────────────────────────────────┘

export const authService = {
  login: (credentials) => 
    USE_MOCK ? mockLogin(credentials) : realLogin(credentials),

  signup: (credentials) => 
    USE_MOCK ? mockSignup(credentials) : realSignup(credentials),

  // ... other methods
}

This pattern offers:
  - Centralized toggle between mock and real
  - Identical function signatures for both implementations
  - Type consistency (same data structure returned)
  - Easy to test both paths


MOCK IMPLEMENTATION STRUCTURE:

async function mockJoinClass(userId, { codigo }) {
  await simulateNetworkDelay()      // ← Simulate network
  
  // Validation
  if (!userId) throw new Error('...')
  if (!classData) throw new Error('...')
  
  // Business logic
  mockEnrollments[userId].push(classData.id)
  
  // Return data
  return { ...classData }
}

REAL IMPLEMENTATION STRUCTURE:

async function realJoinClass(userId, { codigo }) {
  if (!userId) throw new Error('...')
  
  const res = await fetch(ENDPOINTS.joinClass, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ codigo }),
  })
  
  if (!res.ok) {
    if (res.status === 404) throw new Error('Código inválido.')
    throw new Error('Erro desconhecido.')
  }
  
  return res.json()
}

CONSISTENCY RULES:
  1. Same function signature for mock and real
  2. Same error messages (user-friendly Portuguese)
  3. Same return data structure
  4. Same validation rules
  5. Network delay only in mock (not real)


================================================================================
5. MOCK VS. REAL BACKEND
================================================================================

MOCK MODE (for frontend-first development):

Location: src/api/services/config.js
Code:     export const USE_MOCK = true

Behavior:
  - All services return mock data
  - Network delay simulated (300–800ms random)
  - No backend needed
  - Perfect for UI development/testing
  - Data persists in memory (resets on page refresh)

Example mock database:

  const mockUsers = [
    {
      id: 'user-001',
      nome: 'João Silva',
      email: 'joao@example.com',
      senha: '123456',
      tipoUsuario: 'ALUNO',
      ativo: true,
    },
    // ... more users
  ]

Common credentials for testing:
  - Student: joao@example.com / 123456 (tipoUsuario: ALUNO)
  - Teacher: maria@example.com / 123456 (tipoUsuario: PROFESSOR)
  - Admin: admin@example.com / 123456 (tipoUsuario: ADMIN)


REAL MODE (for backend integration):

Location: src/api/services/config.js
Code:     export const USE_MOCK = false

Behavior:
  - All services make real fetch() calls to backend
  - No network delay simulation
  - Backend must be running (localhost:8080 in dev)
  - Data persisted in database
  - Error handling matches HTTP status codes


================================================================================
6. SWITCHING FROM MOCK TO REAL BACKEND
================================================================================

STEP-BY-STEP MIGRATION

1. Backend is ready
   - Verify all API endpoints match ENDPOINTS in config.js
   - Verify response format matches mock return values
   - Test endpoints manually (Postman, curl, etc.)

2. Switch the toggle
   - Open src/api/services/config.js
   - Change: export const USE_MOCK = false
   - Save

3. Start backend server
   - $ cd /path/to/backend
   - $ npm run dev  (or equivalent)
   - Backend listens on http://localhost:8080

4. Start frontend
   - $ npm run dev
   - Frontend proxies /api requests to backend

5. Test the flow
   - Sign up with new account
   - Join a class
   - Verify localStorage gets updated
   - Refresh page—session persists

6. Debug if needed
   - Check browser console for errors
   - Check Network tab in DevTools (see actual fetch calls)
   - Check backend logs for server errors
   - Ensure CORS is configured if needed


EXPECTED BEHAVIOR CHANGES (Mock → Real):

Before (Mock):
  - Instant response (after 300–800ms simulated delay)
  - Error messages are predetermined
  - No network errors possible
  - Data lost on refresh

After (Real):
  - May see actual latency (network dependent)
  - Error messages from backend
  - Network errors possible (timeout, CORS, etc.)
  - Data persisted in database


================================================================================
7. ADDING NEW SERVICES
================================================================================

EXAMPLE: Adding classContentService for exercises/materials

1. Create src/api/services/classContentService.js

2. Follow the pattern:

   // ─ Mock implementation ─
   async function mockGetExercises(userId, classId) {
     await simulateNetworkDelay()
     if (!userId) throw new Error('...')
     // Return mock exercises
     return mockExercises.filter(e => e.classId === classId)
   }

   // ─ Real implementation ─
   async function realGetExercises(userId, classId) {
     if (!userId) throw new Error('...')
     const res = await fetch(`${ENDPOINTS.exercises}/${classId}`)
     if (!res.ok) throw new Error('...')
     return res.json()
   }

   // ─ Public API ─
   export const classContentService = {
     getExercises: (userId, classId) =>
       USE_MOCK ? mockGetExercises(userId, classId)
                : realGetExercises(userId, classId),
   }

3. Add endpoints to ENDPOINTS in config.js:

   export const ENDPOINTS = {
     // ... existing
     exercises: `${API_BASE}/exercicios`,
   }

4. Create useClassContent hook if needed (optional):

   export function useClassContent() {
     const { user } = useAuth()
     // Similar pattern to useClass hook
     return { getExercises, loading, error, ... }
   }

5. Use in component:

   import { useClassContent } from '../hooks/useClassContent'

   function ExercisesPage() {
     const { getExercises, loading } = useClassContent()
     useEffect(() => {
       getExercises(classId).then(setExercises)
     }, [])
   }


================================================================================
8. ERROR HANDLING
================================================================================

PHILOSOPHY:
  - Services throw user-friendly Portuguese error messages
  - Components don't try-catch—they trust services
  - AuthContext & hooks catch errors and expose via state
  - UI displays error messages to users


ERROR FLOW (Mock):

  mockJoinClass()
    ↓
  Validation: codigo invalid?
    ↓ YES → throw new Error('Código de turma inválido.')
    ↓
  Component handles catch block
    ↓
  Display error toast

ERROR FLOW (Real):

  realJoinClass()
    ↓
  fetch() call
    ↓
  res.ok = false?
    ↓ 404 → throw new Error('Código de turma inválido.')
    ↓ 409 → throw new Error('Você já está inscrito nesta turma.')
    ↓ other → throw new Error('Não foi possível entrar na turma. Tente novamente.')
    ↓
  Component handles catch block
    ↓
  Display error toast

COMPONENT USAGE:

  function JoinClassModal() {
    const { joinClass, error, clearError } = useClass()

    async function handleJoin(codigo) {
      try {
        await joinClass(codigo)
        // Success—close modal
      } catch (err) {
        // Error already in `error` state
        // Show toast: error
      }
    }

    useEffect(() => clearError(), [])

    return (
      <Modal>
        {error && <Alert variant="error">{error}</Alert>}
        {/* ... form ... */}
      </Modal>
    )
  }


CONSISTENT ERROR MESSAGES (Portuguese):

Auth Errors:
  - "E-mail ou senha incorretos."
  - "Este e-mail já está cadastrado."
  - "Este e-mail já está em uso."
  - "Sessão inválida. Faça login novamente."

Class Errors:
  - "Código de turma inválido."
  - "Você já está inscrito nesta turma."
  - "Você não está inscrito nesta turma."

Generic Errors (should rarely see these):
  - "Erro no servidor. Tente novamente."
  - "Não foi possível [action]. Tente novamente."


================================================================================
9. USAGE EXAMPLES
================================================================================

EXAMPLE 1: Component using AuthContext (unchanged)

  import { useAuth } from '../context/AuthContext'

  function LoginForm() {
    const { login } = useAuth()

    async function handleSubmit(email, senha) {
      try {
        const user = await login({ email, senha })
        console.log('Logged in:', user)
        // Redirect to dashboard
      } catch (err) {
        console.error(err.message)  // Already user-friendly
        // Show error toast
      }
    }

    return <form onSubmit={handleSubmit}>...</form>
  }


EXAMPLE 2: Component using classService via hook (New!)

  import { useClass } from '../hooks/useClass'

  function JoinClassModal({ onClose, onJoin }) {
    const { joinClass, loading, error, clearError } = useClass()
    const [codigo, setCodigo] = useState('')

    async function handleJoin() {
      try {
        const classData = await joinClass(codigo)
        onJoin(classData)
      } catch (err) {
        // Error already in `error` state
      }
    }

    return (
      <Modal onClose={onClose}>
        {error && <Alert variant="error">{error}</Alert>}
        <input
          type="text"
          value={codigo}
          onChange={e => setCodigo(e.target.value)}
          placeholder="Código da turma"
        />
        <button
          onClick={handleJoin}
          disabled={loading}
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </Modal>
    )
  }


EXAMPLE 3: Direct service usage (rare, advanced)

  import { classService } from '../api/services/classService'
  import { useAuth } from '../context/AuthContext'

  function SomeComponent() {
    const { user } = useAuth()
    const [classes, setClasses] = useState([])

    useEffect(() => {
      classService.getMyClasses(user?.id)
        .then(setClasses)
        .catch(err => console.error(err))
    }, [user?.id])

    return <div>{/* ... */}</div>
  }

  // Equivalent to using hook:
  // const { getMyClasses } = useClass()
  // useEffect(() => {
  //   getMyClasses().then(setClasses).catch(...)
  // }, [])


================================================================================
10. CONFIGURATION REFERENCE
================================================================================

KEY CONFIGURATION FILES

src/api/services/config.js
  ├─ USE_MOCK (true|false)
  │  Toggle between mock and real backend
  │  When true: services return mock data
  │  When false: services make real fetch() calls
  │
  ├─ simulateNetworkDelay()
  │  Waits 300–800ms (random)
  │  Only used in mock mode
  │
  ├─ ENDPOINTS
  │  Backend API endpoint URLs
  │  Used when USE_MOCK=false
  │  Example: login, signup, userById, classes, etc.
  │
  ├─ API_BASE
  │  Base URL for all endpoints
  │  Dev: '' (uses Vite proxy to localhost:8080)
  │  Prod: Uses VITE_API_URL env var
  │
  └─ ROLE_MAP
     Maps backend roles to frontend roles
     ADMIN → admin
     PROFESSOR → teacher
     ALUNO → student

src/api/config.js (Original, still used)
  └─ OLD configuration—can be deprecated
     Currently: ENDPOINTS, API_BASE defined here
     NEW location: src/api/services/config.js
     Can safely remove old file or keep as reference

Environment Variables (.env)

  VITE_API_URL=https://api.example.com
    - Backend URL for production
    - Optional in dev (uses Vite proxy)
    - Must be set for production builds
    - Example: On Render → https://app-backend.onrender.com


SWITCHING BACKENDS CHECKLIST

☐ Backend API is ready
☐ All endpoints in ENDPOINTS match backend API
☐ Response formats match mock return values
☐ Set USE_MOCK = false in config.js
☐ Backend running on localhost:8080 (dev) or set VITE_API_URL (prod)
☐ Test login/signup flow
☐ Test class operations
☐ Check localStorage persists correctly
☐ Verify error handling matches expectations
☐ Test on production build if applicable


================================================================================
SUMMARY
================================================================================

The new service architecture provides:

✓ Separation of concerns (data vs UI)
✓ Frontend-first development (mock before backend)
✓ Easy backend switching (one toggle)
✓ Consistent error handling
✓ Extensible pattern (add new services easily)
✓ Type safety (same signatures for mock & real)
✓ No component changes needed when switching backends
✓ Clear data flow (service → hook → component)

Next Steps:
  1. Test mock mode with current setup
  2. When backend is ready, flip USE_MOCK to false
  3. Update ENDPOINTS to match real API
  4. Add new services as backend expands

Questions? Check the component examples or read the service files.
