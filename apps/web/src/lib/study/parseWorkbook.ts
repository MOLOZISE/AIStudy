import { createHash } from 'node:crypto';
import * as XLSX from 'xlsx';

export const STUDY_SHEETS = {
  concepts: '01_개념마스터',
  seeds: '02_출제포인트표',
  questions: '05_정식문제은행',
  examSets: '07_모의고사_세트매핑',
} as const;

export interface ParsedStudyConcept {
  externalId: string;
  parentExternalId?: string;
  title: string;
  description?: string;
  orderIndex: number;
  raw: Record<string, string>;
}

export interface ParsedStudySeed {
  externalId: string;
  conceptExternalId?: string;
  title?: string;
  content?: string;
  raw: Record<string, string>;
}

export interface ParsedStudyQuestion {
  externalId: string;
  conceptExternalId?: string;
  seedExternalId?: string;
  questionNo?: string;
  type: string;
  prompt: string;
  choices: string[];
  answer: string;
  explanation?: string;
  difficulty?: string;
  rowHash: string;
  raw: Record<string, string>;
}

export interface ParsedStudyExamSet {
  externalId: string;
  title: string;
  description?: string;
  items: Array<{ questionExternalId: string; position: number; points?: string; raw: Record<string, string> }>;
}

export interface StudyImportRowError {
  sheet: string;
  row: number;
  field?: string;
  errorCode?: string;
  message: string;
  rawValue?: unknown;
  severity: 'error' | 'warning';
  raw?: Record<string, string>;
}

export interface ParsedStudyWorkbook {
  sheetNames: string[];
  concepts: ParsedStudyConcept[];
  seeds: ParsedStudySeed[];
  questions: ParsedStudyQuestion[];
  examSets: ParsedStudyExamSet[];
  errors: StudyImportRowError[];
  preview?: {
    totalRows: number;
    successRows: number;
    errorRows: number;
    warningRows: number;
    sheets: { name: string; status: 'required' | 'recommended' | 'optional'; found: boolean }[];
  };
}

const HEADER_ALIASES: Record<string, string> = {
  conceptid: 'concept_id',
  '개념id': 'concept_id',
  '개념아이디': 'concept_id',
  '개념코드': 'concept_id',
  parentconceptid: 'parent_concept_id',
  '상위개념id': 'parent_concept_id',
  '상위개념코드': 'parent_concept_id',
  title: 'title',
  name: 'title',
  '개념명': 'title',
  '개념': 'title',
  description: 'description',
  '설명': 'description',
  '내용': 'content',
  order: 'order',
  '순서': 'order',
  seedid: 'seed_id',
  '출제포인트id': 'seed_id',
  '출제포인트코드': 'seed_id',
  '포인트id': 'seed_id',
  '출제포인트': 'title',
  questionid: 'question_id',
  'question_id': 'question_id',
  '문항id': 'question_id',
  '문제id': 'question_id',
  '문항코드': 'question_id',
  questionno: 'question_no',
  '문항번호': 'question_no',
  '문제번호': 'question_no',
  type: 'type',
  '유형': 'type',
  prompt: 'prompt',
  question: 'prompt',
  '문제': 'prompt',
  '문항': 'prompt',
  '문제본문': 'prompt',
  answer: 'answer',
  '정답': 'answer',
  explanation: 'explanation',
  '해설': 'explanation',
  difficulty: 'difficulty',
  '난이도': 'difficulty',
  setid: 'set_id',
  '세트id': 'set_id',
  '모의고사id': 'set_id',
  settitle: 'set_title',
  '세트명': 'set_title',
  '모의고사명': 'set_title',
  position: 'position',
  '번호': 'position',
  points: 'points',
  '배점': 'points',
};

const CHOICE_ALIASES: Record<string, string> = {
  choice1: 'choice_1', choice2: 'choice_2', choice3: 'choice_3',
  choice4: 'choice_4', choice5: 'choice_5', choice6: 'choice_6',
  option1: 'choice_1', option2: 'choice_2', option3: 'choice_3',
  option4: 'choice_4', option5: 'choice_5', option6: 'choice_6',
  '선택지1': 'choice_1', '선지1': 'choice_1', '보기1': 'choice_1',
  '선택지2': 'choice_2', '선지2': 'choice_2', '보기2': 'choice_2',
  '선택지3': 'choice_3', '선지3': 'choice_3', '보기3': 'choice_3',
  '선택지4': 'choice_4', '선지4': 'choice_4', '보기4': 'choice_4',
  '선택지5': 'choice_5', '선지5': 'choice_5', '보기5': 'choice_5',
  '선택지6': 'choice_6', '선지6': 'choice_6', '보기6': 'choice_6',
};

const CHOICE_KEYS = ['choice_1', 'choice_2', 'choice_3', 'choice_4', 'choice_5', 'choice_6'];

function normalizeHeader(value: string): string {
  const compact = value.toLowerCase().replace(/[\s_\-./()[\]]/g, '');
  return CHOICE_ALIASES[compact] ?? HEADER_ALIASES[compact] ?? compact;
}

function cellText(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (value instanceof Date) return value.toISOString();
  return String(value).trim();
}

function getRows(workbook: XLSX.WorkBook, sheetName: string): Array<{ rowNumber: number; values: Record<string, string> }> {
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) return [];

  const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: '',
    blankrows: false,
    raw: false,
  });

  if (raw.length === 0) return [];

  // Normalize headers from first row keys
  const headerMap: Record<string, string> = {};
  for (const key of Object.keys(raw[0])) {
    headerMap[key] = normalizeHeader(key);
  }

  return raw.map((row, index) => {
    const values: Record<string, string> = {};
    for (const [orig, normalized] of Object.entries(headerMap)) {
      const text = cellText(row[orig]);
      if (text) values[normalized] = text;
    }
    return { rowNumber: index + 2, values };
  }).filter((r) => Object.keys(r.values).length > 0);
}

function getValue(row: Record<string, string>, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = row[key];
    if (value) return value;
  }
  return undefined;
}

function fallbackId(prefix: string, rowNumber: number): string {
  return `${prefix}_${rowNumber}`;
}

function stableRowHash(row: Record<string, string>): string {
  const stable = JSON.stringify(Object.keys(row).sort().map((key) => [key, row[key]]));
  return createHash('sha256').update(stable).digest('hex').slice(0, 64);
}

function parseConcepts(
  rows: Array<{ rowNumber: number; values: Record<string, string> }>,
  errors: StudyImportRowError[],
): ParsedStudyConcept[] {
  return rows.flatMap((row) => {
    const externalId = getValue(row.values, ['concept_id', 'id']) ?? fallbackId('concept', row.rowNumber);
    const title = getValue(row.values, ['title', 'content']);
    if (!title) {
      errors.push({
        sheet: STUDY_SHEETS.concepts,
        row: row.rowNumber,
        field: 'title',
        errorCode: 'MISSING_REQUIRED_VALUE',
        message: '개념명 또는 제목이 없습니다.',
        severity: 'error',
        raw: row.values,
      });
      return [];
    }
    return [{
      externalId,
      parentExternalId: getValue(row.values, ['parent_concept_id']),
      title,
      description: getValue(row.values, ['description', 'content']),
      orderIndex: Number(getValue(row.values, ['order']) ?? row.rowNumber) || row.rowNumber,
      raw: row.values,
    }];
  });
}

function parseSeeds(
  rows: Array<{ rowNumber: number; values: Record<string, string> }>,
  errors: StudyImportRowError[],
): ParsedStudySeed[] {
  return rows.flatMap((row) => {
    const externalId = getValue(row.values, ['seed_id', 'id']) ?? fallbackId('seed', row.rowNumber);
    const title = getValue(row.values, ['title']);
    const content = getValue(row.values, ['content', 'description']);
    if (!title && !content) {
      errors.push({
        sheet: STUDY_SHEETS.seeds,
        row: row.rowNumber,
        errorCode: 'MISSING_REQUIRED_VALUE',
        message: '출제포인트 내용이 없습니다.',
        severity: 'error',
        raw: row.values,
      });
      return [];
    }
    return [{ externalId, conceptExternalId: getValue(row.values, ['concept_id']), title, content, raw: row.values }];
  });
}

function normalizeAnswer(answer: string, choices: string[]): { normalized: string; valid: boolean } {
  if (!answer) return { normalized: '', valid: false };

  const clean = answer.trim();

  // Case 1: 숫자 1-6
  const numMatch = clean.match(/^[1-6]$/);
  if (numMatch) return { normalized: numMatch[0], valid: choices.length >= parseInt(numMatch[0]) };

  // Case 2: 알파벳 A-F / a-f
  const alphaMatch = clean.match(/^[A-Fa-f]$/);
  if (alphaMatch) {
    const idx = alphaMatch[0].toUpperCase().charCodeAt(0) - 65 + 1; // A=1, B=2, ...
    return { normalized: String(idx), valid: choices.length >= idx };
  }

  // Case 3: 한글 ㄱ-ㄹ
  const korMatch = clean.match(/^[ㄱㄴㄷㄹ]$/);
  if (korMatch) {
    const idx = ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ'].indexOf(korMatch[0]) + 1;
    return { normalized: String(idx), valid: choices.length >= idx };
  }

  // Case 4: choice_1, choice_2, ...
  const choiceMatch = clean.toLowerCase().match(/^choice_?([1-6])$/);
  if (choiceMatch) {
    const idx = parseInt(choiceMatch[1]);
    return { normalized: String(idx), valid: choices.length >= idx };
  }

  // Case 5: 선택지 텍스트와 일치
  const choiceIdx = choices.findIndex((c) => c.trim() === clean);
  if (choiceIdx >= 0) return { normalized: String(choiceIdx + 1), valid: true };

  // 판별 불가
  return { normalized: clean, valid: false };
}

function parseQuestions(
  rows: Array<{ rowNumber: number; values: Record<string, string> }>,
  errors: StudyImportRowError[],
): ParsedStudyQuestion[] {
  return rows.flatMap((row) => {
    const externalId = getValue(row.values, ['question_id', 'id']) ?? fallbackId('question', row.rowNumber);
    const prompt = getValue(row.values, ['prompt', 'content']);
    const rawAnswer = getValue(row.values, ['answer']);

    if (!prompt) {
      errors.push({
        sheet: STUDY_SHEETS.questions,
        row: row.rowNumber,
        field: 'prompt',
        errorCode: 'MISSING_REQUIRED_VALUE',
        message: '문제 본문(prompt)이 없습니다.',
        severity: 'error',
        raw: row.values,
      });
      return [];
    }

    if (!rawAnswer) {
      errors.push({
        sheet: STUDY_SHEETS.questions,
        row: row.rowNumber,
        field: 'answer',
        errorCode: 'MISSING_REQUIRED_VALUE',
        message: '정답(answer)이 없습니다.',
        severity: 'error',
        raw: row.values,
      });
      return [];
    }

    const choices = CHOICE_KEYS.map((key) => row.values[key]).filter((v): v is string => Boolean(v));
    const normalized = normalizeAnswer(rawAnswer, choices);

    if (!normalized.valid && choices.length > 0) {
      errors.push({
        sheet: STUDY_SHEETS.questions,
        row: row.rowNumber,
        field: 'answer',
        errorCode: 'INVALID_ANSWER',
        message: `정답 '${rawAnswer}'을(를) 선택지와 매칭할 수 없습니다. (선택지 개수: ${choices.length})`,
        rawValue: rawAnswer,
        severity: 'error',
        raw: row.values,
      });
      return [];
    }

    const difficulty = getValue(row.values, ['difficulty']);
    if (difficulty && !['상', '중', '하'].includes(difficulty)) {
      errors.push({
        sheet: STUDY_SHEETS.questions,
        row: row.rowNumber,
        field: 'difficulty',
        errorCode: 'INVALID_DIFFICULTY',
        message: `난이도 '${difficulty}'는 지원되지 않습니다. (상/중/하만 가능)`,
        rawValue: difficulty,
        severity: 'warning',
        raw: row.values,
      });
    }

    return [{
      externalId,
      conceptExternalId: getValue(row.values, ['concept_id']),
      seedExternalId: getValue(row.values, ['seed_id']),
      questionNo: getValue(row.values, ['question_no']),
      type: getValue(row.values, ['type']) ?? (choices.length > 0 ? 'multiple_choice' : 'short_answer'),
      prompt,
      choices,
      answer: normalized.normalized,
      explanation: getValue(row.values, ['explanation']),
      difficulty: difficulty || undefined,
      rowHash: stableRowHash(row.values),
      raw: row.values,
    }];
  });
}

function parseExamSets(
  rows: Array<{ rowNumber: number; values: Record<string, string> }>,
  errors: StudyImportRowError[],
): ParsedStudyExamSet[] {
  const sets = new Map<string, ParsedStudyExamSet>();
  for (const row of rows) {
    const externalId = getValue(row.values, ['set_id', 'id']) ?? fallbackId('set', row.rowNumber);
    const questionExternalId = getValue(row.values, ['question_id']);
    if (!questionExternalId) {
      errors.push({
        sheet: STUDY_SHEETS.examSets,
        row: row.rowNumber,
        field: 'question_id',
        errorCode: 'MISSING_REQUIRED_VALUE',
        message: '세트 문항 question_id가 없습니다.',
        severity: 'error',
        raw: row.values,
      });
      continue;
    }
    const current = sets.get(externalId) ?? {
      externalId,
      title: getValue(row.values, ['set_title', 'title']) ?? externalId,
      description: getValue(row.values, ['description']),
      items: [],
    };
    current.items.push({
      questionExternalId,
      position: Number(getValue(row.values, ['position']) ?? current.items.length + 1) || current.items.length + 1,
      points: getValue(row.values, ['points']),
      raw: row.values,
    });
    sets.set(externalId, current);
  }
  return [...sets.values()];
}

function validateSheets(sheetNames: string[], errors: StudyImportRowError[]): void {
  const REQUIRED_SHEETS = Object.values(STUDY_SHEETS);
  const found = new Set(sheetNames);

  for (const required of REQUIRED_SHEETS) {
    if (!found.has(required)) {
      errors.push({
        sheet: 'workbook',
        row: 0,
        errorCode: 'MISSING_REQUIRED_SHEET',
        message: `필수 시트 '${required}'을(를) 찾을 수 없습니다.`,
        severity: 'error',
      });
    }
  }
}

function detectDuplicates(
  concepts: ParsedStudyConcept[],
  seeds: ParsedStudySeed[],
  questions: ParsedStudyQuestion[],
  examSets: ParsedStudyExamSet[],
  errors: StudyImportRowError[],
): void {
  // concept_id 중복
  const conceptIds = new Map<string, number>();
  for (const concept of concepts) {
    const count = (conceptIds.get(concept.externalId) ?? 0) + 1;
    conceptIds.set(concept.externalId, count);
    if (count > 1) {
      errors.push({
        sheet: STUDY_SHEETS.concepts,
        row: 0,
        field: 'concept_id',
        errorCode: 'DUPLICATE_ID',
        message: `concept_id '${concept.externalId}'이(가) 중복됩니다. (${count}회)`,
        rawValue: concept.externalId,
        severity: 'error',
      });
    }
  }

  // seed_id 중복
  const seedIds = new Map<string, number>();
  for (const seed of seeds) {
    const count = (seedIds.get(seed.externalId) ?? 0) + 1;
    seedIds.set(seed.externalId, count);
    if (count > 1) {
      errors.push({
        sheet: STUDY_SHEETS.seeds,
        row: 0,
        field: 'seed_id',
        errorCode: 'DUPLICATE_ID',
        message: `seed_id '${seed.externalId}'이(가) 중복됩니다. (${count}회)`,
        rawValue: seed.externalId,
        severity: 'error',
      });
    }
  }

  // question_id 중복
  const questionIds = new Map<string, number>();
  for (const question of questions) {
    const count = (questionIds.get(question.externalId) ?? 0) + 1;
    questionIds.set(question.externalId, count);
    if (count > 1) {
      errors.push({
        sheet: STUDY_SHEETS.questions,
        row: 0,
        field: 'question_id',
        errorCode: 'DUPLICATE_ID',
        message: `question_id '${question.externalId}'이(가) 중복됩니다. (${count}회)`,
        rawValue: question.externalId,
        severity: 'error',
      });
    }
  }

  // set_id 중복
  const setIds = new Map<string, number>();
  for (const set of examSets) {
    const count = (setIds.get(set.externalId) ?? 0) + 1;
    setIds.set(set.externalId, count);
    if (count > 1) {
      errors.push({
        sheet: STUDY_SHEETS.examSets,
        row: 0,
        field: 'set_id',
        errorCode: 'DUPLICATE_ID',
        message: `set_id '${set.externalId}'이(가) 중복됩니다. (${count}회)`,
        rawValue: set.externalId,
        severity: 'error',
      });
    }
  }

  // set_id + question_id 중복 (같은 세트 내 같은 문제)
  for (const set of examSets) {
    const itemMap = new Map<string, number>();
    for (const item of set.items) {
      const key = item.questionExternalId;
      const count = (itemMap.get(key) ?? 0) + 1;
      itemMap.set(key, count);
      if (count > 1) {
        errors.push({
          sheet: STUDY_SHEETS.examSets,
          row: 0,
          field: 'set_id + question_id',
          errorCode: 'DUPLICATE_ID',
          message: `세트 '${set.externalId}'에서 문제 '${key}'이(가) 중복됩니다.`,
          rawValue: `${set.externalId}:${key}`,
          severity: 'warning',
        });
      }
    }
  }
}

export async function parseStudyWorkbook(buffer: Buffer): Promise<ParsedStudyWorkbook> {
  const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true });

  const errors: StudyImportRowError[] = [];

  // Sheet validation
  validateSheets(workbook.SheetNames, errors);

  const concepts = parseConcepts(getRows(workbook, STUDY_SHEETS.concepts), errors);
  const seeds = parseSeeds(getRows(workbook, STUDY_SHEETS.seeds), errors);
  const questions = parseQuestions(getRows(workbook, STUDY_SHEETS.questions), errors);
  const examSets = parseExamSets(getRows(workbook, STUDY_SHEETS.examSets), errors);

  if (questions.length === 0) {
    errors.push({
      sheet: STUDY_SHEETS.questions,
      row: 0,
      errorCode: 'MISSING_REQUIRED_VALUE',
      message: '05_정식문제은행 시트에서 import 가능한 문항을 찾지 못했습니다.',
      severity: 'error',
    });
  }

  // Duplicate detection
  detectDuplicates(concepts, seeds, questions, examSets, errors);

  // Build preview
  const errorRows = errors.filter((e) => e.severity === 'error').length;
  const warningRows = errors.filter((e) => e.severity === 'warning').length;
  const totalRows = concepts.length + seeds.length + questions.length + examSets.flatMap((s) => s.items).length;
  const successRows = totalRows - errorRows;

  const REQUIRED_SHEETS_LIST = Object.values(STUDY_SHEETS);
  const OPTIONAL_SHEETS = ['00_문제집정보', '03_자료출처', '04_문제초안', '06_해설보강', '08_태그_난이도_메타', '09_QC_검수결과'];
  const found = new Set(workbook.SheetNames);

  const preview = {
    totalRows,
    successRows: Math.max(0, successRows),
    errorRows,
    warningRows,
    sheets: [
      ...REQUIRED_SHEETS_LIST.map((name) => ({ name, status: 'required' as const, found: found.has(name) })),
      ...OPTIONAL_SHEETS.map((name) => ({ name, status: 'optional' as const, found: found.has(name) })),
    ],
  };

  return {
    sheetNames: workbook.SheetNames,
    concepts,
    seeds,
    questions,
    examSets,
    errors,
    preview,
  };
}
