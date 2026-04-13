================================================================================
                          QUICK REFERENCE GUIDE
                    Service Architecture & API Layer
================================================================================


MOST COMMON TASKS
================================================================================

TASK: Sign up / Login (In Component)
──────────────────────────────────────

import { useAuth } from '../context/AuthContext'

export default function LoginForm() {
  const { login, signup } = useAuth()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [error, setError] = useState(null)

  async function handleLogin() {
    try {
      const user = await login({ email, senha })
      console.log('Logged in:', user)
      // Navigate to dashboard
    } catch (err) {
      setError(err.message)  // Already Portuguese
    }
  }

  return (
    <form onSubmit={handleLogin}>
      {error && <Alert>{error}</Alert>}
      {/* ... inputs ... */}
    </form>
  )
}

✓ No changes needed — works same as before


TASK: Join a Class (In Component)
──────────────────────────────────

import { useClass } from '../hooks/useClass'

export default function JoinClassModal() {
  const { joinClass, loading, error } = useClass()
  const [codigo, setCodigo] = useState('')

  async function handleJoin() {
    try {
      const classData = await joinClass(codigo)
      console.log('Joined:', classData)
      // Add to list, close modal, etc.
    } catch (err) {
      // Error already in `error` state
      // Just display it:
      // {error && <Alert>{error}</Alert>}
    }
  }

  return (
    <Modal>
      {error && <Alert variant="error">{error}</Alert>}
      <input
        type="text"
        value={codigo}
        onChange={e => setCodigo(e.target.value)}
        placeholder="Código da turma"
      />
      <button onClick={handleJoin} disabled={loading}>
        {loading ? 'Entrando...' : 'Entrar'}
      </button>
    </Modal>
  )
}


TASK: Get User's Classes (In Component)
────────────────────────────────────────

import { useClass } from '../hooks/useClass'

export default function ClassesList() {
  const { getMyClasses, loading } = useClass()
  const [classes, setClasses] = useState([])

  useEffect(() => {
    getMyClasses()
      .then(setClasses)
      .catch(err => console.error(err))
  }, [])

  return loading ? <Spinner /> : <Classes data={classes} />
}


TASK: Switch from Mock to Real Backend
───────────────────────────────────────

File: src/api/services/config.js

Before (mock mode):
  export const USE_MOCK = true

After (real backend):
  export const USE_MOCK = false

That's it! No component changes needed.


TASK: Add a New Service
───────────────────────

1. Create: src/api/services/myNewService.js

   // Mock implementation
   async function mockFetchData(userId, params) {
     await simulateNetworkDelay()
     if (!userId) throw new Error('Sessão inválida...')
     return mockDatabase.filter(...)
   }

   // Real implementation
   async function realFetchData(userId, params) {
     if (!userId) throw new Error('Sessão inválida...')
     const res = await fetch(ENDPOINTS.myNewEndpoint, {
       method: 'GET',
       headers: { 'Content-Type': 'application/json' },
     })
     if (!res.ok) throw new Error('Erro ao...')
     return res.json()
   }

   // Public API
   export const myNewService = {
     fetchData: (userId, params) =>
       USE_MOCK ? mockFetchData(userId, params)
                : realFetchData(userId, params),
   }

2. Add endpoint: src/api/services/config.js

   export const ENDPOINTS = {
     // ... existing
     myNewEndpoint: `${API_BASE}/my-endpoint`,
   }

3. Create hook (optional): src/hooks/useMyNew.js

   export function useMyNew() {
     const { user } = useAuth()
     const [loading, setLoading] = useState(false)
     const [error, setError] = useState(null)

     const fetchData = useCallback(async (params) => {
       setLoading(true)
       try {
         return await myNewService.fetchData(user?.id, params)
       } catch (err) {
         setError(err.message)
         throw err
       } finally {
         setLoading(false)
       }
     }, [user?.id])

     return { fetchData, loading, error }
   }

4. Use in components:

   const { fetchData, loading } = useMyNew()
   await fetchData(params)


AVAILABLE SERVICES
================================================================================

authService

  ✓ authService.login({ email, senha })
  ✓ authService.signup({ nome, email, senha, tipoUsuario })
  ✓ authService.updateUser(userId, { nome, email, tipoUsuario })
  ✓ authService.changePassword(userId, { nome, email, tipoUsuario, senha })
  ✓ authService.deleteUser(userId)


classService

  ✓ classService.joinClass(userId, { codigo })
  ✓ classService.leaveClass(userId, classId)
  ✓ classService.getMyClasses(userId)
  ✓ classService.getAllClasses(userId)



To understand how it works:
  ✓ Read: API_ARCHITECTURE.md

To use in components:
  ✓ Import: useAuth, useClass from hooks
  ✓ No fetch() calls in components!

To add new features:
  ✓ Create service in: src/api/services/
  ✓ Add endpoints in: src/api/services/config.js
  ✓ Create hook in: src/hooks/ (optional)

To switch backends:
  ✓ Edit: src/api/services/config.js line 6
  ✓ Toggle USE_MOCK from true to false

If something breaks:
  ✓ Check: src/context/AuthContext.jsx (auth logic)
  ✓ Check: src/api/services/authService.js (login impl)
  ✓ Check: src/api/services/classService.js (class impl)
  ✓ Check: Browser console for errors


COMMON PATTERNS
================================================================================

Pattern 1: Use from Context (Auth)
──────────────────────────────────

  const { user, login, signup, logout } = useAuth()
  // No loading/error state—managed by context
  // Perfect for auth-related operations


Pattern 2: Use from Hook (Classes)
──────────────────────────────────

  const { joinClass, loading, error } = useClass()
  // Has loading/error state—good for UI feedback
  // Perfect for data fetching operations


Pattern 3: Direct Service Usage (Advanced)
───────────────────────────────────────────

  import { classService } from '../api/services/classService'
  
  // Manually manage loading/error
  const [classes, setClasses] = useState([])
  
  useEffect(() => {
    classService.getMyClasses(userId)
      .then(setClasses)
      .catch(setError)
  }, [userId])


ERROR MESSAGES (They're Portuguese!)
================================================================================

Auth Errors:
  "E-mail ou senha incorretos."
  "Este e-mail já está cadastrado."
  "Este e-mail já está em uso."
  "Sessão inválida. Faça login novamente."

Class Errors:
  "Código de turma inválido."
  "Você já está inscrito nesta turma."
  "Você não está inscrito nesta turma."

Generic:
  "Erro no servidor. Tente novamente."
  "Não foi possível [action]. Tente novamente."

Just display them to users—no translation needed!


DEBUGGING
================================================================================

Mock not working?
  → Check: USE_MOCK = true in src/api/services/config.js
  → Check: Browser console for JS errors
  → Check: Network tab—should see NO fetch calls in mock mode

Real backend not working?
  → Check: USE_MOCK = false in src/api/services/config.js
  → Check: Backend running on localhost:8080
  → Check: Network tab—see fetch calls + response
  → Check: Backend logs for server errors
  → Check: CORS headers if seeing network errors

Data not persisting?
  → Mock: Expected (in-memory, resets on refresh)
  → Real: Check backend database, check Network tab

Error message not showing?
  → Check: Component has try-catch around service call
  → Check: Error state displayed in JSX
  → Check: Browser console—error might be logged there


INFO: All services return Promises (use await or .then())
INFO: All errors are strings (already user-friendly)
INFO: No TypeScript needed (JSDoc comments work)
INFO: Mock mode simulates network delay (300–800ms)


================================================================================

Need more context? Read: API_ARCHITECTURE.md
Need to refactor again? Read: REFACTORING_SUMMARY.txt
Need original project info? Read: ONBOARDING.txt

Questions? Check the service files directly—they're well-commented!
