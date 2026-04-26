# Task FIX-1: QuestionEditor Type Compatibility Fix

**Priority**: CRITICAL 🔴  
**Duration**: 30 minutes - 1 hour  
**Risk**: Low (isolated fix)  
**Related**: AUDIT-1 finding BUG-1

## Problem

In `QuestionEditor.tsx`, the dropdown allows selecting "객관식 (단일 선택)" (`multiple_choice_single`) but:
1. **Validation** (line 56) only checks `type === 'multiple_choice'`
2. **UI** (line 187) only shows choices input when `type === 'multiple_choice'`

**Consequence**: User selects "객관식 (단일 선택)" → Choices input **does not appear** → User cannot enter/edit choices → **Data loss or silent validation failure**.

## Root Cause

Type mismatch between:
- Dropdown `value="multiple_choice_single"` (line 168)
- Validation logic `type === 'multiple_choice'` (line 56)
- UI condition `type === 'multiple_choice'` (line 187)

Schema supports 4 types: `multiple_choice_single`, `true_false`, `short_answer`, `essay_self_review`
But code only handles `multiple_choice`.

## Required Changes

### 1. Fix Validation (Line 56)

**Before**:
```typescript
if (type === 'multiple_choice') {
  const filledChoices = choices.filter((c) => c.trim());
  if (filledChoices.length < 2) {
    setErrorMessage('선택지를 최소 2개 이상 입력하세요.');
    return;
  }
}
```

**After**:
```typescript
// For both objective question types, require choices
if (['multiple_choice', 'multiple_choice_single'].includes(type)) {
  const filledChoices = choices.filter((c) => c.trim());
  if (filledChoices.length < 2) {
    setErrorMessage('선택지를 최소 2개 이상 입력하세요.');
    return;
  }
}
```

**OR (More robust)**:
```typescript
if (type.startsWith('multiple_choice')) {
  // Handle both multiple_choice and multiple_choice_single
  const filledChoices = choices.filter((c) => c.trim());
  if (filledChoices.length < 2) {
    setErrorMessage('선택지를 최소 2개 이상 입력하세요.');
    return;
  }
}
```

### 2. Fix Choices UI (Line 187)

**Before**:
```typescript
{type === 'multiple_choice' && (
  <div>
    <label>선택지</label>
    {/* choices inputs */}
  </div>
)}
```

**After**:
```typescript
{type.startsWith('multiple_choice') && (
  <div>
    <label>선택지</label>
    {/* choices inputs */}
  </div>
)}
```

**OR (Alternative: Explicit array)**:
```typescript
{['multiple_choice', 'multiple_choice_single'].includes(type) && (
  <div>
    <label>선택지</label>
    {/* choices inputs */}
  </div>
)}
```

### 3. Fix Answer Validation (Line 216 placeholder text)

**Current**:
```typescript
placeholder="예: 1, 2, 3 또는 정답 텍스트"
```

**Consider**: Add help text based on type:
```typescript
placeholder={
  type.startsWith('multiple_choice')
    ? "예: 1, 2, 3 또는 정답 텍스트"
    : type === 'true_false'
      ? "예: true, false, O, X"
      : "자유로운 정답 텍스트"
}
```

### 4. Optional: Improve Type Dropdown Label

**Current** (line 163):
```typescript
<select
  value={type}
  onChange={(e) => setType(e.target.value)}
```

**Consider**: Add description or grouping:
```typescript
<select
  value={type}
  onChange={(e) => setType(e.target.value)}
  title="문제 유형을 선택하세요. 객관식을 선택하면 선택지가 필요합니다."
```

## Files to Modify

- `apps/web/src/components/study/QuestionEditor.tsx`
  - Line 56: Fix validation condition
  - Line 187: Fix UI render condition
  - Line 216: Optional - improve placeholder text

## Testing Steps

1. Open workbook editor
2. Create or edit a question
3. From dropdown, select "객관식 (단일 선택)"
4. Verify: Choices input field **appears**
5. Try submit without choices: Get error "선택지를 최소 2개 이상 입력하세요."
6. Add 2+ choices and answer
7. Save: Should succeed without error
8. Re-open: Choices should be populated correctly
9. Try "OX 문제" (true_false): Choices should appear, but accept any answer
10. Try "단답형" (short_answer): Choices should **NOT appear**
11. Try "주관식" (essay_self_review): Choices should **NOT appear**

## Validation

```bash
pnpm lint       # Should pass
pnpm type-check # Should pass
pnpm build      # Should pass
```

## Rollback Plan

If any issue:
1. Revert to previous QuestionEditor.tsx
2. Existing questions not affected (they have data already)
3. New questions will use legacy "multiple_choice" type only

## Non-Requirements

- Do NOT refactor other parts of QuestionEditor
- Do NOT add new UI elements
- Do NOT change question data structure
- Do NOT modify tRPC API

## Sign-Off Criteria

- [ ] multiple_choice_single shows choices input
- [ ] Validation prevents submit without choices
- [ ] true_false, short_answer, essay_self_review still work
- [ ] Existing questions don't break
- [ ] lint/type-check/build pass
- [ ] Question save succeeds for all 4 types

---

**Next Step**: After FIX-1 passes validation, proceed to FIX-2 (admin auth UX).
