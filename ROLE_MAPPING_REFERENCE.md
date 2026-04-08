# Role Mapping Reference

## The Three Role Types

Your system uses roles at two levels:

### Backend Roles (What server sends)
```
ADMIN      ← Admin users
PROFESSOR  ← Teachers
ALUNO      ← Students ("aluno" = student in Portuguese)
```

### Frontend Roles (What React uses)
```
admin      ← Admins
teacher    ← Teachers
student    ← Students
```

## The Mapping

```javascript
// In src/api/services/config.js
export const ROLE_MAP = {
  ADMIN:     'admin',      // Backend ADMIN    → Frontend admin
  PROFESSOR: 'teacher',    // Backend PROFESSOR → Frontend teacher
  ALUNO:     'student',    // Backend ALUNO    → Frontend student
}
```

## How It Works in Login Flow

```
1. User logs in
2. Backend returns response:
   { id: "123", nome: "João", role: "ALUNO" }

3. authService.login() returns this as-is

4. AuthContext.loginWithData() processes it:
   const userData = {
     id: data.id,                           // "123"
     name: data.nome,                       // "João"
     role: ROLE_MAP[data.role] ?? 'student' // ALUNO → student
     tipoUsuario: data.role,                // "ALUNO" (kept for API requests)
     email: email
   }

5. React state gets:
   user.role = "student" (lowercase, frontend format)

6. UI uses:
   user.role === 'student' ? <StudentUI /> : <TeacherUI />
```

## Real Example

### Student Login
```
Backend Response:
  { id: "001", nome: "João Silva", role: "ALUNO" }
            ↓
Mapping:
  ROLE_MAP["ALUNO"] = "student"
            ↓
Frontend State:
  {
    id: "001",
    name: "João Silva",
    role: "student",          ← Always lowercase!
    tipoUsuario: "ALUNO",     ← Kept for API
    email: "joao@example.com"
  }
            ↓
React Components:
  user.role === "student" ✅ true
  ROLE_ROUTES[user?.role] = "/student-dashboard"
```

### Teacher Login
```
Backend Response:
  { id: "002", nome: "Maria Santos", role: "PROFESSOR" }
            ↓
Mapping:
  ROLE_MAP["PROFESSOR"] = "teacher"
            ↓
Frontend State:
  {
    id: "002",
    name: "Maria Santos",
    role: "teacher",          ← Always lowercase!
    tipoUsuario: "PROFESSOR", ← Kept for API
    email: "maria@example.com"
  }
            ↓
React Components:
  user.role === "teacher" ✅ true
  ROLE_ROUTES[user?.role] = "/teacher-dashboard"
```

### Admin Login
```
Backend Response:
  { id: "003", nome: "Admin System", role: "ADMIN" }
            ↓
Mapping:
  ROLE_MAP["ADMIN"] = "admin"
            ↓
Frontend State:
  {
    id: "003",
    name: "Admin System",
    role: "admin",            ← Always lowercase!
    tipoUsuario: "ADMIN",     ← Kept for API
    email: "admin@example.com"
  }
            ↓
React Components:
  user.role === "admin" ✅ true
  ROLE_ROUTES[user?.role] = "/admin-dashboard"
```

## Where Roles Are Used

### 1. Navigation Routes
```javascript
// In src/constants/routes.js
export const ROLE_ROUTES = {
  student: '/student-dashboard',  // or '/dashboard'
  teacher: '/teacher-dashboard',
  admin: '/admin-dashboard',
}
```

### 2. Protected Routes
```javascript
<Route path="/teacher-dashboard" element={
  <ProtectedRoute role="teacher">
    <TeacherDashboardPage />
  </ProtectedRoute>
} />

// When user has role "student" trying to access "teacher" route:
if (role && user.role !== role) return <Navigate to="/" replace />
// Redirects to landing
```

### 3. Conditional UI
```javascript
{user?.role === 'teacher' && (
  <Button onClick={() => setClassModalOpen(true)}>
    + Criar turma
  </Button>
)}

{user?.role === 'student' && (
  <Button onClick={() => setJoinModalOpen(true)}>
    + Entrar em uma turma
  </Button>
)}
```

### 4. API Requests
```javascript
// When updating user (profile edit)
// Still use original backend role:
await authService.updateUser(user.id, {
  nome: newName,
  email: newEmail,
  tipoUsuario: user.tipoUsuario  // ← "ALUNO" not "student"
})
```

## CRITICAL: Remember Both!

```javascript
// ✅ CORRECT - Using for UI logic:
if (user.role === 'teacher') { ... }  // Lowercase for frontend

// ✅ CORRECT - Using for API calls:
tipoUsuario: user.tipoUsuario  // "PROFESSOR" uppercase for backend

// ❌ WRONG - Using uppercase in UI:
if (user.role === 'PROFESSOR') { ... }  // Won't work, it's "teacher"

// ❌ WRONG - Using lowercase in API:
tipoUsuario: user.role  // Sends "teacher" instead of "PROFESSOR"
```

## What If Backend Returns Wrong Role

```javascript
// Scenario: Backend returns role: "PROF" (typo)

Backend Response:
  { id: "002", nome: "Maria", role: "PROF" }

Mapping:
  ROLE_MAP["PROF"] = undefined  // No mapping for "PROF"

Fallback:
  ROLE_MAP[data.role] ?? 'student'  // Returns 'student'

Result:
  user.role = 'student'  // Wrong! Should be 'teacher'
  
Debug:
  Check console for:
  [authService.login] Success. User: {...role: "PROF"...}
  [AuthContext] Normalized user data: {...role: "student"...}
```

## Testing Role Mapping

### Test Each Role

1. **Student Role**
   - Login as: email that backend returns role: "ALUNO"
   - Check console: `[AuthContext] Normalized...role: "student"`
   - Should see student dashboard
   - Cannot access `/teacher-dashboard`

2. **Teacher Role**
   - Login as: email that backend returns role: "PROFESSOR"
   - Check console: `[AuthContext] Normalized...role: "teacher"`
   - Should see teacher dashboard
   - Can create classes
   - Cannot access `/student-dashboard`

3. **Admin Role**
   - Login as: email that backend returns role: "ADMIN"
   - Check console: `[AuthContext] Normalized...role: "admin"`
   - Should see admin dashboard
   - Can access all areas

## Current Route Configuration

```javascript
// In src/constants/routes.js
export const ROLE_ROUTES = {
  student: '/dashboard',              // Student sees this
  teacher: '/teacher-dashboard',      // Teacher sees this
  admin: '/admin-dashboard',          // Admin sees this
}

export const DEFAULT_ROUTE = '/'      // If role undefined

export const ROLE_REDIRECTS = {
  student: '/dashboard',
  teacher: '/teacher-dashboard',
  admin: '/admin-dashboard',
}
```

## Summary Table

| Backend | Frontend | Usage | Example |
|---------|----------|-------|---------|
| ALUNO | student | UI logic, routes | `user.role === 'student'` |
| PROFESSOR | teacher | UI logic, routes | `user.role === 'teacher'` |
| ADMIN | admin | UI logic, routes | `user.role === 'admin'` |
| N/A | N/A | API calls | `tipoUsuario: user.tipoUsuario` |

---

## Key Takeaway

- **Frontend always uses lowercase** (student, teacher, admin)
- **Backend always uses uppercase** (ALUNO, PROFESSOR, ADMIN)
- **Mapping happens automatically** in loginWithData()
- **API calls use original tipoUsuario** (keeps uppercase)
- **If wrong role shows**, check ROLE_MAP or backend response

