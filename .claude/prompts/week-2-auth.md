# Week 2: Authentication + Profiles Implementation

> **For Claude Code / Codex**: Copy entire prompt below and paste into Claude Code chat

---

## 🎯 Objective

Implement complete authentication flow + user profiles (Week 2 MVP).

**User Stories**:
1. User can sign up with email → verification → login
2. User creates profile (name, department, job title)
3. Sessions persist (logout clears session)
4. Protected routes require authentication
5. Profile can be edited and viewed

---

## 📋 Implementation Plan

### Phase 1: Backend (tRPC API)

**File**: `packages/api/src/routers/auth.ts` (new)

```typescript
// MUST HAVE:
// 1. Zod schemas: signupInput, loginInput, updateProfileInput
// 2. Procedures:
//    - signup(email, password, displayName) -> { user, token }
//    - login(email, password) -> { user, token }
//    - logout() -> { success: true }
//    - getMe() -> { user: Profile } (protectedProcedure)
//    - updateProfile(department?, jobTitle?, avatarUrl?) -> { user: Profile } (protectedProcedure)
// 3. JSDoc on each procedure explaining purpose
```

**Implementation Details**:
- Use Supabase Auth (already configured in context.ts)
- Hash passwords via Supabase (handled by Auth service)
- Return JWT token from signup/login
- protectedProcedure ensures auth on getMe/updateProfile
- No manual password hashing - delegate to Supabase

**Register router**: Add `auth: authRouter` to `packages/api/src/routers/index.ts`

---

### Phase 2: Database (Drizzle ORM)

**File**: `packages/db/src/schema/index.ts`

**Status**: ✓ Already defined
- ✓ `profiles` table with all fields
- ✓ RLS policies for auth
- ✓ Email unique constraint

**Action**: Verify via `pnpm db:studio` that profiles table exists in Supabase.

---

### Phase 3: Frontend (React + Next.js)

**Auth Pages**:

1. **`apps/web/src/app/(auth)/layout.tsx`** (new)
   - Redirect logged-in users to `/feed`
   - Simple centered layout for auth forms

2. **`apps/web/src/app/(auth)/signup/page.tsx`** (new)
   - Form: email, password, confirm password, displayName
   - Validation: email format, password min 8 chars, displayName required
   - Error handling: duplicate email, weak password
   - Success: redirect to login with message "Check your email for verification"
   - Link to login page

3. **`apps/web/src/app/(auth)/login/page.tsx`** (new)
   - Form: email, password
   - Error handling: invalid credentials
   - Success: set token in localStorage, redirect to `/feed`
   - Link to signup page
   - Loading state during request

**Protected Layout**:

4. **`apps/web/src/app/(main)/layout.tsx`** (new)
   - Redirect to `/login` if no token
   - Header with:
     - Logo/title
     - User menu dropdown (avatar, view profile, logout)
     - Logout button
   - Sidebar placeholder (channels added Week 3)
   - `{children}` for page content

5. **`apps/web/src/app/(main)/profile/page.tsx`** (new, shows current user)
   - Display: email, displayName, department, jobTitle, avatar
   - Edit form with same fields
   - Save button (mutations)
   - Success toast notification
   - Avatar upload (Supabase Storage)

6. **`apps/web/src/app/layout.tsx`** (modify)
   - Add tRPC provider (if not already)
   - Add React Query provider
   - Global styles import

**Components**:

7. **`apps/web/src/components/LoginForm.tsx`** (reusable)
   - Email + password fields
   - Submit button
   - Loading state
   - Error message display
   - Uses `trpc.auth.login.useMutation()`

8. **`apps/web/src/components/SignupForm.tsx`** (reusable)
   - Email + password + confirm password + displayName
   - Password strength indicator (optional nice-to-have)
   - Uses `trpc.auth.signup.useMutation()`

9. **`apps/web/src/components/UserMenu.tsx`** (reusable)
   - Dropdown with: View Profile, Settings, Logout
   - Uses `trpc.auth.logout.useMutation()`

**Session Management**:

10. **`apps/web/src/lib/auth.ts`** (new)
    - `getToken()`: retrieve from localStorage
    - `setToken(token)`: store to localStorage
    - `clearToken()`: remove from localStorage
    - `isAuthenticated()`: check if token exists

11. **Update `apps/web/src/lib/trpc.ts`**
    - Ensure tRPC client includes Authorization header
    - Get token from localStorage for each request
    - Pass to `httpBatchLink({ headers() })`

---

## ✅ Acceptance Criteria

- [ ] Signup flow works: email → verification → can login
- [ ] Login persists session (refresh page, still logged in)
- [ ] Logout clears session (can't access protected routes)
- [ ] Profile page shows user info (email, name, dept, title)
- [ ] Profile can be edited and persists
- [ ] Protected routes redirect to `/login` if not authenticated
- [ ] All forms have error messages
- [ ] No TypeScript errors: `pnpm type-check` passes
- [ ] No console errors in browser

---

## 🔍 Reference Files

**Existing patterns to follow**:
- `packages/api/src/context.ts` - How auth context works
- `packages/api/src/trpc.ts` - protectedProcedure vs publicProcedure
- `packages/db/src/schema/index.ts` - profiles table structure
- `packages/types/src/index.ts` - Profile interface (if needed)
- `apps/web/src/lib/supabase.ts` - Supabase client setup

**Examples in codebase**:
- `packages/api/src/routers/posts.ts` - tRPC router pattern (study this!)
- `apps/web/src/app/page.tsx` - Simple page structure

---

## 📝 Git Workflow

**Branch**: Create if not on feature branch
```bash
git checkout -b feature/week-2-auth
```

**During development**:
- Commit frequently (small logical units)
- `git commit -m "feat: add signup form"`
- `git commit -m "feat: implement auth tRPC router"`
- `git commit -m "feat: add session persistence"`

**End of week**:
```bash
git commit -m "feat: complete auth + profiles (Week 2)

- Supabase Auth: signup/login/logout
- Profile CRUD with Drizzle
- Session persistence via JWT in localStorage
- Protected routes & pages
- Form validation + error handling
- Auth-protected tRPC procedures

Completes Week 2 checklist.
"
git push origin feature/week-2-auth
# Create PR or push to main for auto-deploy
```

---

## 🧪 Manual Testing Checklist

1. **Signup**:
   - [ ] Visit `/signup`
   - [ ] Fill form (email, password, display name)
   - [ ] Click signup
   - [ ] See "Check email" message
   - [ ] Open Supabase Auth → Users → verify email link works
   - [ ] Can login with credentials

2. **Login**:
   - [ ] Visit `/login`
   - [ ] Enter email/password
   - [ ] Click login
   - [ ] Redirects to `/feed` (or /)
   - [ ] Token in localStorage (DevTools → Application → Local Storage)

3. **Session Persistence**:
   - [ ] Logged in, refresh page
   - [ ] Still logged in (not redirected to login)

4. **Profile**:
   - [ ] Visit `/profile`
   - [ ] See user info (email, name, dept, title)
   - [ ] Edit field, click save
   - [ ] Refreshes, change persists
   - [ ] See success toast

5. **Logout**:
   - [ ] Click logout from user menu
   - [ ] Redirected to `/login`
   - [ ] Token removed from localStorage
   - [ ] Can't access `/feed` (redirects to login)

6. **Errors**:
   - [ ] Signup with existing email → error "Email already registered"
   - [ ] Login with wrong password → error "Invalid credentials"
   - [ ] Submit form with empty field → validation error
   - [ ] No console errors (DevTools → Console)

---

## 🚀 Success Metrics

- **Code Quality**:
  - ✓ `pnpm type-check` passes (no TypeScript errors)
  - ✓ `pnpm lint` passes
  - ✓ All tRPC inputs have Zod schemas

- **Functionality**:
  - ✓ Full auth flow works (signup → verify → login)
  - ✓ Session persists across page refreshes
  - ✓ Protected routes are actually protected
  - ✓ Profile can be viewed and edited

- **UX**:
  - ✓ Form validation messages are clear
  - ✓ Loading states visible during API calls
  - ✓ Error messages are helpful (not generic)
  - ✓ Mobile responsive (test at 375px)

---

## ⚠️ Common Pitfalls

| Issue | Solution |
|-------|----------|
| Token not sent to tRPC | Check `trpc.ts` - ensure `headers()` includes Authorization |
| Session not persisting | Verify localStorage key is correct (`supabase_token`?) |
| "Cannot read property 'user' of null" | Check auth context in tRPC - may not be extracting token |
| Form validation not working | Ensure Zod schema is passed to `.input()` in procedure |
| Redirect loop (login → feed → login) | Check auth guard logic - may be inverted |

---

## 📚 Resources

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [tRPC Protected Procedures](https://trpc.io/docs/server/authorization)
- [Zod Validation](https://zod.dev/)
- [React Hook Form](https://react-hook-form.com/) (recommended for forms)

---

## Next: Week 3

Once Week 2 is complete:
- [ ] All auth tests pass
- [ ] Branch merged to main
- [ ] Deploy to Vercel succeeds
- **Ready for**: Week 3 - Channels + Posts CRUD

---

**Estimation**: 1-2 days with Claude Code assistance  
**AI Dev Notes**: This week focuses on auth patterns (Supabase + tRPC). Study `packages/api/src/routers/posts.ts` for tRPC pattern reference before starting.

