# Authentication Debugging Guide

Use these console logs to understand what's happening during auth operations.

## 🟢 Successful Login Sequence

```
✅ User clicks login button with: joao@example.com / 123456

[AuthContext] Starting login flow for: joao@example.com
    → Context began login process

[authService.login] Calling: https://api.example.com/api/v1/auth/login
    → About to send POST request

[authService.login] Response status: 200
    → Server responded successfully

[authService.login] Success. User: {
  id: "user-001",
  nome: "João Silva",
  role: "ALUNO"
}
    → Server returned valid user data

[AuthContext] Processing auth response: {
  id: "user-001",
  nome: "João Silva",
  role: "ALUNO"
}
    → Context processing backend response

[AuthContext] Normalized user data: {
  id: "user-001",
  name: "João Silva",
  role: "student"
}
    → Normalized "ALUNO" role to "student" (frontend uses lowercase)

[AuthContext] Persisting user to localStorage: {
  id: "user-001",
  name: "João Silva",
  role: "student"
}
    → Saving to localStorage key: "sc_user"

✅ Dashboard loads, user appears in top-right corner
```

---

## 🔴 Failed Login - Invalid Credentials

```
❌ User clicks login with: joao@example.com / wrongpassword

[AuthContext] Starting login flow for: joao@example.com
    → Context began login process

[authService.login] Calling: https://api.example.com/api/v1/auth/login
    → About to send POST request with wrong password

[authService.login] Response status: 401
    → Server rejected due to authentication failure

[authService.login] Invalid credentials
    → This is expected for wrong password

[AuthContext] Login failed: E-mail ou senha incorretos.
    → Error caught and user-friendly message prepared

❌ Modal stays open with error message:
   "E-mail ou senha incorretos."
```

---

## 🔴 Failed Login - Backend Not Reached

```
❌ Clicking login shows no response, hangs, or shows network error

Possible Cause: Backend URL is wrong or backend is offline

Debugging:
1. Check config.js line 16: export const API_BASE = ...
2. Should be: https://yourbackend.com/api/v1
3. NOT: http://localhost/api/v1 (unless dev on same machine)

Check Network Tab (F12 → Network):
- Look for POST request to /api/v1/auth/login
- If missing: backend URL is wrong
- If shown but error: backend is offline

Expected Network Tab:
  ✅ POST https://api.example.com/api/v1/auth/login 200 OK {id, nome, role}
  
Wrong Network Tab:
  ❌ Failed to fetch (CORS error)
  ❌ POST http://localhost/api/v1/auth/login 404 Not Found
  ❌ No request shown at all
```

---

## 🟢 Successful Signup Sequence

```
✅ User fills signup form and clicks "Cadastrar"

[AuthContext] Starting signup flow for: maria@example.com
    → Signup initiated

[authService.signup] Calling: https://api.example.com/api/v1/usuarios
    → POST request sending account creation payload

[authService.signup] Response status: 201
    → Server created the account

[authService.signup] Account created. Auto-logging in...
    → Now auto-logging in with same credentials

[authService.login] Calling: https://api.example.com/api/v1/auth/login
    → Auto-login request

[authService.login] Response status: 200
[authService.login] Success. User: {id: "user-new456", nome: "Maria", role: "PROFESSOR"}
    → Auto-login succeeded

[AuthContext] Processing auth response: {...}
[AuthContext] Normalized user data: {id: "user-new456", name: "Maria", role: "teacher"}
[AuthContext] Persisting user to localStorage: {...}

✅ Dashboard loads for new user
```

---

## 🔴 Failed Signup - Email Already Exists

```
❌ User tries to signup with email that exists in backend

[AuthContext] Starting signup flow for: joao@example.com
[authService.signup] Calling: https://api.example.com/api/v1/usuarios
[authService.signup] Response status: 409
    → 409 = Conflict (email already exists)

[authService.signup] Email already exists
    → Backend detected duplicate

[AuthContext] Signup failed: Este e-mail já está cadastrado.
    → User sees Portuguese error message

❌ Signup modal shows: "Este e-mail já está cadastrado."
```

---

## 🟢 Session Restoration (F5 Refresh)

```
✅ User logged in, presses F5 to refresh

[AuthContext] Restored user from localStorage: {
  id: "user-001",
  name: "João Silva",
  role: "student"
}
    → Session restored from localStorage, NO new API call needed

✅ Dashboard loads immediately
✅ User stays logged in
✅ No login screen shown
```

---

## 🔴 Session Not Restoring

```
❌ After login, F5 shows login screen again

Debugging:
1. Check localStorage was actually saved
   → F12 → Application → Local Storage → sc_user
   → Should show JSON with user data
   
2. If localStorage is empty:
   [AuthContext] Persisting user to localStorage: ...
   → Log should show, but doesn't

3. If localStorage shows invalid data:
   {"id": undefined, "name": "João"}
   → validateId() in readStorage() returned null

Solution:
   Check AuthContext line 18-27 readStorage():
   - Make sure STORAGE_KEYS.user is "sc_user"
   - Make sure JSON.parse doesn't throw
   - Make sure returned object has .id property
```

---

## 🔴 Response Missing Required Fields

```
❌ Sudden error after login: "Resposta do servidor inválida..."

[authService.login] Response status: 200
[authService.login] Invalid response - missing required fields: {
  nome: "João Silva",
  role: "ALUNO"
  // Missing: id
}
    → Backend returned data without 'id' field

[AuthContext] Login failed: Resposta do servidor inválida. Contate o suporte.

Solution:
   Backend developer must add 'id' field to login response
   Response MUST include: { id, nome, role }
```

---

## 🔴 Role Mapping Error

```
❌ Dashboard loads but sidebar shows wrong role

Normal flow:
  Backend returns: role: "PROFESSOR"
  → ROLE_MAP["PROFESSOR"] = "teacher"
  → Frontend displays teacher panel

Error flow:
  Backend returns: role: "PROF"  (typo!)
  → ROLE_MAP["PROF"] = undefined
  → Falls back to: "student"
  → Wrong permissions!

Debugging:
  Check console: [AuthContext] Normalized user data: {...role...}
  Should show: role: "student" | "teacher" | "admin"
  
  If shows weird value, check ROLE_MAP in config.js:
  export const ROLE_MAP = {
    ADMIN:     'admin',
    PROFESSOR: 'teacher',
    ALUNO:     'student',
  }
  
  Make sure backend role matches these keys exactly.
```

---

## 🟡 Logout

```
User clicks logout

[AuthContext] Logging out user: user-001
    → Logout initiated

✅ localStorage.removeItem("sc_user")
    → Session cleared

✅ setUser(null)
    → React state cleared

✅ Redirected to landing page

✅ F5 refresh shows login screen (not logged in)
```

---

## Common Issues & Solutions

| Issue | Console Log | Fix |
|-------|-------------|-----|
| Never reaches backend | No `[authService.login]` logs | Check VITE_API_URL env variable |
| 401 error on valid password | `Response status: 401` | Backend credential check failed, verify database |
| Blank response | No success/error logs | Backend endpoint not implemented |
| Wrong user loads | Different user.id in logs | localStorage has stale data, clear and re-login |
| Role wrong | role: "student" when should be "teacher" | Backend returned wrong role or typo in ROLE_MAP |
| Can't login but classes load | Classes load fine but auth fails | Classes use localStorage, auth uses backend - separate |
| CORS error | Network tab shows failed request | Backend not allowing requests from frontend origin |

---

## How to Read Logs in DevTools

1. **Open DevTools:** F12 or right-click → Inspect
2. **Go to Console tab** (not Network, Application, etc.)
3. **Filter logs:** Type `authService` in search box
4. Watch sequence during login/signup
5. Use timestamps to correlate with user actions
6. Look for `[AuthContext]` and `[authService]` tags

### Example: Filtering to Auth Logs Only
```
In Console search: [auth
Results: Shows only logs containing "[auth"
```

---

## Permanent Debugging: How to Keep Logs After Deployment

The logging is intentional and helpful. You can:

1. **Keep them:** Users never see console unless they F12
2. **Add a feature flag:** `?debug=true` in URL to enable console logs
3. **Send to backend:** POST logs to monitoring service
4. **Remove later:** Delete all `console.log` lines

For now, keeping them is GOOD for finding production issues.

---

## Performance Note

Logging adds ~milliseconds. For production deployment:
- Logs are hidden in console (user never sees)
- Search/Filter is user's responsibility
- No performance impact if user doesn't open DevTools
- Recommend keeping for first 2-3 weeks, then remove if desired

