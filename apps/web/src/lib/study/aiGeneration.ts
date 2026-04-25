'use server';

import { db, studyAiGenerationJobs } from '@repo/db';
import { eq } from 'drizzle-orm';
import type { AiGeneratedWorkbookDraft, AiGenerationJobStatus } from '@repo/types';

export async function extractPdfText(pdfBuffer: Buffer): Promise<string> {
  // PDF 파싱 라이브러리가 없으므로 mock/fallback 구현
  // 실제 구현에서는 pdfjs-dist, pdf-parse 등 사용 가능

  // 간단한 mock: PDF에서 기본 텍스트만 추출하는 척함
  const text = pdfBuffer.toString('utf-8', 0, Math.min(2000, pdfBuffer.length));

  // PDF 바이너리에서 텍스트 영역만 추출하는 간단한 로직
  // 실제 구현은 proper PDF 라이브러리 필요
  const matches = text.match(/[\x20-\x7E\n\r]+/g) || [];
  const extractedText = matches.join(' ').substring(0, 30000);

  if (extractedText.trim().length < 50) {
    throw new Error('PDF에서 충분한 텍스트를 추출할 수 없습니다. PDF 파일을 확인해주세요.');
  }

  return extractedText;
}

export async function generateWorkbookDraft(
  _jobId: string,
  _userId: string,
  extractedText: string
): Promise<AiGeneratedWorkbookDraft> {
  // AI 호출 (실제 환경에서는 OpenAI/Claude API 사용)
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    // API key가 없으면 mock draft 생성
    return generateMockDraft(extractedText);
  }

  try {
    return await generateDraftWithLLM(extractedText, apiKey);
  } catch (error) {
    console.warn('LLM 호출 실패, mock draft 생성:', error);
    return generateMockDraft(extractedText);
  }
}

async function generateDraftWithLLM(
  extractedText: string,
  apiKey: string
): Promise<AiGeneratedWorkbookDraft> {
  // OpenAI API 호출
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `당신은 교육 콘텐츠 전문가입니다. 제공되는 자료를 바탕으로 AIStudy 포맷에 맞는 문제은행을 JSON으로 생성해주세요.

다음 JSON 스키마로 응답해주세요:
{
  "workbook": {"title": "string", "description": "string", "category": "string", "difficulty": "easy|medium|hard"},
  "concepts": [{"externalId": "c1", "title": "string", "orderIndex": 0}],
  "seeds": [{"externalId": "s1", "conceptExternalId": "c1", "title": "string"}],
  "questions": [{"externalId": "q1", "conceptExternalId": "c1", "type": "multiple_choice_single|true_false|short_answer", "prompt": "string", "choices": ["a","b","c","d"], "answer": "a", "explanation": "string", "difficulty": "easy|medium|hard"}],
  "examSets": []
}

요구사항:
- 제공 자료에만 기반하여 문제 생성
- 최소 5개 이상의 문제 생성
- externalId는 중복 없이 생성 (c1, c2, ... q1, q2, ...)
- 객관식은 4개 선지 포함
- 각 문제마다 명확한 해설 작성`,
        },
        {
          role: 'user',
          content: `다음 자료를 바탕으로 문제은행을 생성해주세요:\n\n${extractedText.substring(0, 3000)}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  const data = await response.json() as any;

  if (!response.ok || !data.choices?.[0]?.message?.content) {
    throw new Error('LLM 응답 오류');
  }

  try {
    const content = data.choices[0].message.content;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('JSON 파싱 실패');

    const draft = JSON.parse(jsonMatch[0]) as AiGeneratedWorkbookDraft;
    return draft;
  } catch (error) {
    console.error('JSON 파싱 오류:', error);
    throw new Error('AI 생성 결과 파싱 실패');
  }
}

function generateMockDraft(extractedText: string): AiGeneratedWorkbookDraft {
  // LLM API 키가 없을 때 mock draft 생성
  const title = extractedText.split(/[.!?\n]/)[0]?.substring(0, 50) || '자동 생성된 문제집';

  return {
    workbook: {
      title: `[Mock] ${title}`,
      description: '이것은 mock 생성 결과입니다. 실제 LLM 연동 후 재생성해주세요.',
      category: '일반',
      difficulty: 'medium',
    },
    concepts: [
      { externalId: 'c1', title: '개념 1', orderIndex: 0 },
      { externalId: 'c2', title: '개념 2', orderIndex: 1 },
    ],
    seeds: [
      { externalId: 's1', conceptExternalId: 'c1', title: '씨드 1' },
      { externalId: 's2', conceptExternalId: 'c2', title: '씨드 2' },
    ],
    questions: [
      {
        externalId: 'q1',
        conceptExternalId: 'c1',
        type: 'multiple_choice_single',
        prompt: '다음 중 옳은 것은?',
        choices: ['선지 1', '선지 2', '선지 3', '선지 4'],
        answer: '선지 1',
        explanation: '제공된 자료에 기반하여 생성되어야 합니다.',
        difficulty: 'easy',
      },
      {
        externalId: 'q2',
        conceptExternalId: 'c1',
        type: 'true_false',
        prompt: '참 또는 거짓',
        choices: ['참', '거짓'],
        answer: '참',
        explanation: '실제 내용으로 검수 필요합니다.',
        difficulty: 'medium',
      },
      {
        externalId: 'q3',
        conceptExternalId: 'c2',
        type: 'short_answer',
        prompt: '단답형 문제',
        choices: [],
        answer: '답안',
        explanation: 'Mock 데이터이므로 실제 LLM 호출 후 재생성 필요',
        difficulty: 'medium',
      },
    ],
    examSets: [],
  };
}

export async function updateJobStatus(
  jobId: string,
  status: AiGenerationJobStatus,
  progress: number,
  resultPayload?: Record<string, unknown>,
  errorPayload?: Record<string, unknown>
) {
  return db.update(studyAiGenerationJobs)
    .set({
      status,
      progress,
      resultPayload,
      errorPayload,
      updatedAt: new Date(),
    })
    .where(eq(studyAiGenerationJobs.id, jobId));
}
