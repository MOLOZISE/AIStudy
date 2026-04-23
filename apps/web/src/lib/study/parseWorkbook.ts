import ExcelJS from 'exceljs';

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
  message: string;
  raw?: Record<string, string>;
}

export interface ParsedStudyWorkbook {
  sheetNames: string[];
  concepts: ParsedStudyConcept[];
  seeds: ParsedStudySeed[];
  questions: ParsedStudyQuestion[];
  examSets: ParsedStudyExamSet[];
  errors: StudyImportRowError[];
}

type RowRecord = {
  rowNumber: number;
  values: Record<string, string>;
};

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

const CHOICE_KEYS = ['choice_1', 'choice_2', 'choice_3', 'choice_4', 'choice_5', 'choice_6'];
const CHOICE_ALIASES: Record<string, string> = {
  choice1: 'choice_1',
  choice2: 'choice_2',
  choice3: 'choice_3',
  choice4: 'choice_4',
  choice5: 'choice_5',
  choice6: 'choice_6',
  option1: 'choice_1',
  option2: 'choice_2',
  option3: 'choice_3',
  option4: 'choice_4',
  option5: 'choice_5',
  option6: 'choice_6',
  '선택지1': 'choice_1',
  '선지1': 'choice_1',
  '보기1': 'choice_1',
  '선택지2': 'choice_2',
  '선지2': 'choice_2',
  '보기2': 'choice_2',
  '선택지3': 'choice_3',
  '선지3': 'choice_3',
  '보기3': 'choice_3',
  '선택지4': 'choice_4',
  '선지4': 'choice_4',
  '보기4': 'choice_4',
  '선택지5': 'choice_5',
  '선지5': 'choice_5',
  '보기5': 'choice_5',
  '선택지6': 'choice_6',
  '선지6': 'choice_6',
  '보기6': 'choice_6',
};

function normalizeHeader(value: string): string {
  const compact = value.toLowerCase().replace(/[\s_\-./()[\]]/g, '');
  return CHOICE_ALIASES[compact] ?? HEADER_ALIASES[compact] ?? compact;
}

function asCellText(value: ExcelJS.CellValue): string {
  if (value === null || value === undefined) return '';
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'object') {
    if ('text' in value && typeof value.text === 'string') return value.text.trim();
    if ('result' in value) return asCellText(value.result as ExcelJS.CellValue);
    if ('richText' in value && Array.isArray(value.richText)) {
      return value.richText.map((part) => part.text).join('').trim();
    }
    return String(value).trim();
  }
  return String(value).trim();
}

function getValue(row: Record<string, string>, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = row[key];
    if (value) return value;
  }
  return undefined;
}

function getRows(workbook: ExcelJS.Workbook, sheetName: string): RowRecord[] {
  const sheet = workbook.getWorksheet(sheetName);
  if (!sheet) return [];

  let headerRowNumber = 1;
  let headers: string[] = [];

  sheet.eachRow((row, rowNumber) => {
    if (headers.length > 0) return;
    const values = row.values as ExcelJS.CellValue[];
    const current = values.slice(1).map(asCellText);
    const meaningful = current.filter(Boolean);
    if (meaningful.length >= 2) {
      headerRowNumber = rowNumber;
      headers = current.map(normalizeHeader);
    }
  });

  if (headers.length === 0) return [];

  const rows: RowRecord[] = [];
  for (let rowNumber = headerRowNumber + 1; rowNumber <= sheet.rowCount; rowNumber += 1) {
    const row = sheet.getRow(rowNumber);
    const values = row.values as ExcelJS.CellValue[];
    const record: Record<string, string> = {};
    headers.forEach((header, index) => {
      if (!header) return;
      const text = asCellText(values[index + 1]);
      if (text) record[header] = text;
    });

    if (Object.keys(record).length > 0) rows.push({ rowNumber, values: record });
  }

  return rows;
}

function fallbackId(prefix: string, rowNumber: number): string {
  return `${prefix}_${rowNumber}`;
}

function stableRowHash(row: Record<string, string>): string {
  return JSON.stringify(Object.keys(row).sort().map((key) => [key, row[key]]));
}

function parseConcepts(rows: RowRecord[], errors: StudyImportRowError[]): ParsedStudyConcept[] {
  return rows.flatMap((row) => {
    const externalId = getValue(row.values, ['concept_id', 'id']) ?? fallbackId('concept', row.rowNumber);
    const title = getValue(row.values, ['title', 'content']);
    if (!title) {
      errors.push({ sheet: STUDY_SHEETS.concepts, row: row.rowNumber, message: '개념명 또는 제목이 없습니다.', raw: row.values });
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

function parseSeeds(rows: RowRecord[], errors: StudyImportRowError[]): ParsedStudySeed[] {
  return rows.flatMap((row) => {
    const externalId = getValue(row.values, ['seed_id', 'id']) ?? fallbackId('seed', row.rowNumber);
    const title = getValue(row.values, ['title']);
    const content = getValue(row.values, ['content', 'description']);
    if (!title && !content) {
      errors.push({ sheet: STUDY_SHEETS.seeds, row: row.rowNumber, message: '출제포인트 내용이 없습니다.', raw: row.values });
      return [];
    }

    return [{
      externalId,
      conceptExternalId: getValue(row.values, ['concept_id']),
      title,
      content,
      raw: row.values,
    }];
  });
}

function parseQuestions(rows: RowRecord[], errors: StudyImportRowError[]): ParsedStudyQuestion[] {
  return rows.flatMap((row) => {
    const externalId = getValue(row.values, ['question_id', 'id']) ?? fallbackId('question', row.rowNumber);
    const prompt = getValue(row.values, ['prompt', 'content']);
    const answer = getValue(row.values, ['answer']);
    if (!prompt || !answer) {
      errors.push({ sheet: STUDY_SHEETS.questions, row: row.rowNumber, message: '문제 본문 또는 정답이 없습니다.', raw: row.values });
      return [];
    }

    const choices = CHOICE_KEYS.map((key) => row.values[key]).filter((value): value is string => Boolean(value));

    return [{
      externalId,
      conceptExternalId: getValue(row.values, ['concept_id']),
      seedExternalId: getValue(row.values, ['seed_id']),
      questionNo: getValue(row.values, ['question_no']),
      type: getValue(row.values, ['type']) ?? (choices.length > 0 ? 'multiple_choice' : 'short_answer'),
      prompt,
      choices,
      answer,
      explanation: getValue(row.values, ['explanation']),
      difficulty: getValue(row.values, ['difficulty']),
      rowHash: stableRowHash(row.values),
      raw: row.values,
    }];
  });
}

function parseExamSets(rows: RowRecord[], errors: StudyImportRowError[]): ParsedStudyExamSet[] {
  const sets = new Map<string, ParsedStudyExamSet>();

  for (const row of rows) {
    const externalId = getValue(row.values, ['set_id', 'id']) ?? fallbackId('set', row.rowNumber);
    const questionExternalId = getValue(row.values, ['question_id']);
    if (!questionExternalId) {
      errors.push({ sheet: STUDY_SHEETS.examSets, row: row.rowNumber, message: '세트 문항 question_id가 없습니다.', raw: row.values });
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

export async function parseStudyWorkbook(buffer: Buffer): Promise<ParsedStudyWorkbook> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer as unknown as Parameters<typeof workbook.xlsx.load>[0]);

  const errors: StudyImportRowError[] = [];
  const concepts = parseConcepts(getRows(workbook, STUDY_SHEETS.concepts), errors);
  const seeds = parseSeeds(getRows(workbook, STUDY_SHEETS.seeds), errors);
  const questions = parseQuestions(getRows(workbook, STUDY_SHEETS.questions), errors);
  const examSets = parseExamSets(getRows(workbook, STUDY_SHEETS.examSets), errors);

  if (questions.length === 0) {
    errors.push({
      sheet: STUDY_SHEETS.questions,
      row: 0,
      message: '05_정식문제은행 시트에서 import 가능한 문항을 찾지 못했습니다.',
    });
  }

  return {
    sheetNames: workbook.worksheets.map((sheet) => sheet.name),
    concepts,
    seeds,
    questions,
    examSets,
    errors,
  };
}
