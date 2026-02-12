

# TaskBoard MVP Implementation Plan

This plan restructures the entire frontend to match the detailed specification. It covers routing, state architecture, landing page revamp, role-based UI, board enhancements, dashboard widgets, accessibility, and responsive layout. Work is organized into 7 phases.

---

## Phase 1: Routing and App Shell

**Goal:** Replace the current conditional rendering in `App.tsx` with `react-router-dom` routes and a shared authenticated layout shell.

**Files to create/modify:**
- `src/App.tsx` -- Replace with `<BrowserRouter>` + route definitions
- `src/layouts/AppShell.tsx` -- New: authenticated layout with top nav (workspace switcher, search placeholder, user menu, activity bell placeholder)
- `src/components/guards/RouteGuard.tsx` -- New: redirect to `/` if not authenticated
- `src/components/guards/withRole.tsx` -- New: HOC that hides/disables content based on role

**Route map:**

```text
/                           LandingPage (public)
/login                      Login modal (or redirect to / with modal open)
/signup                     Signup modal (same approach)
/app                        AppShell (authed)
  /app/dashboard            DashboardPage
  /app/workspaces/:id/board BoardPage
  /app/workspaces/:id/archived ArchivedPage (empty state, disabled restore)
  /app/settings             UserSettingsPage
```

**AppShell top nav includes:**
- Logo + workspace switcher dropdown (reads from `workspaceStore`)
- Global search input (placeholder, filters `taskStore` later)
- Activities dropdown (existing component, moved here)
- User dropdown (existing component, moved here)

---

## Phase 2: Zustand Store Refactor

**Goal:** Align stores with the specified slice architecture. Add `uiStore`, expand `workspaceStore`, add selection/optimistic state to `taskStore`, and add feature flags + roles to `authStore`.

### `src/stores/authStore.ts` changes:
- Add `roles: WorkspaceRole[]` (array of roles the user holds across workspaces)
- Add `featureFlags: Record<string, boolean>` (e.g., `{ bulkOps: true }`)
- Keep existing theme, activities, stats

### `src/stores/workspaceStore.ts` changes:
- Add `columns` array to current workspace (dynamic, not just the 4 fixed ones)
- Add `invites` array (mock data)
- `setActivePreset` should actually update `columns` immediately
- Add `renameColumn`, `addColumn`, `removeColumn` actions (guarded by role in UI)

### `src/stores/taskStore.ts` changes:
- Add `selection: Set<string>` for bulk select
- Add `toggleSelection(id)`, `selectAll(status)`, `clearSelection()` actions
- Add `optimisticMoves: Map<string, { original: Task }>` for rollback support
- Keep existing filter selectors as standalone pure functions

### `src/stores/uiStore.ts` (new):
- `theme` (move from authStore)
- `toasts` (managed by sonner, but track here if needed)
- `activeModal: string | null`
- `activeSidePanel: string | null`
- `rolePreviewToggle: 'manager' | 'employee'`
- `density: 'compact' | 'cozy'` (placeholder for settings)

### `src/api/` directory (new):
- `src/api/types.ts` -- DTO interfaces for Task, Workspace, User, Column
- `src/api/client.ts` -- `ApiClient` interface with methods per resource
- `src/api/mockClient.ts` -- Implementation that reads/writes Zustand stores
- `src/api/httpClient.ts` -- Stub with `TODO` comments for real endpoints
- `src/api/index.ts` -- Exports active client based on `USE_MOCK` flag

---

## Phase 3: Landing Page Revamp

**Goal:** Rebuild the landing page per the exact spec.

**Changes to `src/pages/LandingPage.tsx`:**

1. **Hero section:**
   - Rotating headline: "Manage projects with `<DynamicPhrases/>`"
   - Phrases: clarity, speed, focus, confidence, simplicity -- rotate every 2.5s
   - Pause on hover AND keyboard focus
   - Respect `prefers-reduced-motion`: show static "clarity" if reduced motion
   - Main CTA: "Try Demo" (primary), secondary: "Contact" (outline)
   
2. **Nav bar (top-right):** Sign in, Try Demo, Contact
   - Remove: "Try Free" mid-hero, "Book personalized demo" footer section, "Trusted by 10,000" badge

3. **Replace pricing section with "How it works":**
   - 4 steps with animated dot traveling along a horizontal line (desktop)
   - Steps auto-advance every 3s; hover/focus pins a step
   - Respect `prefers-reduced-motion`
   - Copy: "Describe needs" -> "We research" -> "Ranked & validated" -> "Start conversations"

4. **Contact modal** (not page jump):
   - Fields: Your name*, Work email*, Company name (optional), What are you looking for? (optional)
   - Validate required + email format (zod schema)
   - Submit to `/api/contact` (mock stub); show success state inside modal, then close

5. **Responsive:** `max-w-[1200px] px-6 md:px-10`, `min-h-svh` sections, `w-full sm:w-auto` buttons

**New components:**
- `src/components/landing/DynamicPhrases.tsx`
- `src/components/landing/HowItWorks.tsx`
- `src/components/landing/ContactModal.tsx`

---

## Phase 4: Board Enhancements

**Goal:** Templates that actually update columns, editable columns (role-gated), bulk ops with undo, and full-card drag handle (already done).

### Templates (`BoardPresets.tsx` + `workspaceStore`):
- Selecting a preset calls `workspaceStore.applyPreset(presetId)` which updates `columns` array
- Prepare mock API call signature: `POST /workspaces/:id/applyPreset`
- Board columns render dynamically from `workspaceStore.columns` instead of hardcoded `COLUMNS`

### Editable columns (Manager-only):
- `src/components/board/EditableColumnHeader.tsx` -- New
- If role is `owner` or `manager`: show rename (inline edit), add column (+), remove column (x) buttons
- Others see a lock icon with tooltip; controls `aria-disabled`
- Prepare API stubs: `POST /columns`, `PATCH /columns/:id`, `DELETE /columns/:id`

### Bulk actions:
- Task cards get a checkbox (visible on hover, always visible when any card is selected)
- Cmd/Ctrl+click toggles selection via `taskStore.toggleSelection`
- `BulkActions` bar shows: move-to dropdown, priority dropdown, delete button
- On delete/move: show undo toast (sonner) with 5s timer; revert via `optimisticMoves` map if clicked

### Keyboard DnD:
- Add `KeyboardSensor` to `useSensors` in `KanbanBoard.tsx`
- Ensure focus management after drop (focus the moved card)
- Add ARIA labels: `aria-roledescription="sortable task"`, `aria-label={task.title}`

---

## Phase 5: Dashboard Widgets (Insights)

**Goal:** Role-aware dashboard with derived stats from mock task data.

**Manager widgets** (in `ManagerDashboardWidgets`):
- Throughput (weekly): count of tasks moved to Completed per week (simple bar/number)
- Cycle time: avg days Ready -> Completed (number + trend arrow placeholder)
- WIP by assignee: In Progress count per user (horizontal bar)
- Overdue: due date < today and not completed (counter + collapsible list)
- Due soon: due within 7 days (list)
- Unassigned: tasks without assignee (counter + quick-assign placeholder)
- Completion ratio: Completed / Total over last 14 days

**Employee widgets** (in `EmployeeDashboardWidgets`):
- Assigned to me (count)
- Due this week (list)
- In Progress (list)
- Recently updated tasks (list)

All derived from `useTaskStore` selectors -- no backend needed.

---

## Phase 6: Team Management & Archived Workspaces

### Team management panel (`WorkspacePage` collaborators view):
- Member rows with inline-editable role dropdown
- Guard: manager cannot remove owner; viewer/contributor cannot change roles
- Wire to mock API stubs

### Archived workspaces route:
- `src/pages/ArchivedPage.tsx` -- New
- Route: `/app/workspaces/:id/archived`
- If no archived items: restore buttons disabled with `aria-disabled`, show empty state
- Empty state component: icon + "No archived tasks" message

---

## Phase 7: Accessibility, Responsiveness & Polish

### Accessibility checklist:
- Consistent button padding: `py-2.5 px-4`
- Focus styles: visible `ring-2 ring-ring` on all interactive elements
- `aria-pressed` on toggles (RoleToggle, theme buttons)
- `prefers-reduced-motion`: disable auto-rotations, no continuous motion
- Modal focus trap (already handled by Radix Dialog)
- Esc closes modals/panels
- DnD keyboard fallback (KeyboardSensor)
- ARIA labels on all interactive elements
- Color-contrast safe badges (already using HSL variables)

### Responsive audit (breakpoints: 360, 390, 768, 1024, 1280, 1536, 1920+):
- Landing page: `max-w-[1200px] px-6 md:px-10`, `min-h-svh` sections
- Board: horizontal scroll on mobile, columns `min-w-[280px]`
- Dashboard: grid wraps `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`
- Settings: sidebar collapses to tabs on mobile
- All pages use `min-h-svh` to eliminate dead whitespace

### Empty states:
- `src/components/ui/EmptyState.tsx` -- New reusable component (icon + heading + description + optional CTA)
- Used in: empty columns, no workspaces, no archived items, no search results, no tasks assigned

### Error handling:
- Toast on async failures (sonner)
- Rollback on optimistic DnD failures
- Form validation errors inline

---

## Technical Details

### File creation summary (approximately 15 new files):

```text
src/layouts/AppShell.tsx
src/components/guards/RouteGuard.tsx
src/components/guards/withRole.tsx
src/stores/uiStore.ts
src/api/types.ts
src/api/client.ts
src/api/mockClient.ts
src/api/httpClient.ts
src/api/index.ts
src/components/landing/DynamicPhrases.tsx
src/components/landing/HowItWorks.tsx
src/components/landing/ContactModal.tsx
src/components/board/EditableColumnHeader.tsx
src/components/ui/EmptyState.tsx
src/pages/ArchivedPage.tsx
```

### Files modified (approximately 12):

```text
src/App.tsx (full rewrite to router)
src/stores/authStore.ts (add roles, featureFlags)
src/stores/workspaceStore.ts (add columns, column CRUD, preset application)
src/stores/taskStore.ts (add selection, optimistic state)
src/pages/LandingPage.tsx (full revamp)
src/pages/DashboardPage.tsx (integrate with router, use workspaceStore)
src/pages/WorkspacePage.tsx (renamed to BoardPage, use dynamic columns)
src/pages/UserSettingsPage.tsx (route-based, responsive sidebar)
src/components/board/KanbanBoard.tsx (keyboard sensor, dynamic columns)
src/components/board/KanbanColumn.tsx (editable header, checkboxes)
src/components/board/TaskCard.tsx (selection checkbox, ARIA)
src/components/board/BulkActions.tsx (undo toast)
```

### Role permission matrix:

```text
Action                  Owner  Manager  Contributor  Viewer
-------------------------------------------------------
Create task               Y      Y          Y          N
Edit task                 Y      Y          Y          N
Delete task               Y      Y          N          N
Move task (DnD)           Y      Y          Y          N
Manage columns            Y      Y          N          N
Manage members            Y      Y          N          N
Remove member             Y      Y*         N          N
Change roles              Y      N          N          N
Archive workspace         Y      N          N          N
Delete workspace          Y      N          N          N
Apply board preset        Y      Y          N          N
View board                Y      Y          Y          Y
View insights             Y      Y          Y          Y

* Manager cannot remove Owner
```

### QA verification checklist:
1. Navigate all routes; confirm guards redirect unauthenticated users
2. Landing page: verify phrase rotation pauses on hover; test with `prefers-reduced-motion`
3. Contact modal: submit with invalid email, verify validation; submit valid, verify success state
4. Login -> Dashboard: create workspace, verify it appears in list
5. Enter workspace -> Board: drag task between columns, verify instant UI update
6. Keyboard: Tab to a card, use keyboard to move it
7. Select multiple cards with Cmd+click, bulk move, verify undo toast works
8. Toggle Manager/Employee view, verify correct widgets display
9. Settings: edit name, change theme, verify persistence
10. Test at 360px, 768px, 1280px viewport widths
11. Verify all empty states render correctly (empty board, no workspaces, no archived items)

