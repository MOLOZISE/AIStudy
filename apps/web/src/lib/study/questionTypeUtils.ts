export type NormalizedQuestionType =
  | 'multiple_choice_single'
  | 'true_false'
  | 'short_answer'
  | 'essay_self_review';

export function normalizeQuestionType(type: string | null | undefined): NormalizedQuestionType {
  switch ((type ?? '').toLowerCase()) {
    case 'multiple_choice':
    case 'multiple_choice_single':
    case 'choice':
    case '객관식':
      return 'multiple_choice_single';
    case 'true_false':
    case 'ox':
    case 'o/x':
      return 'true_false';
    case 'short_answer':
    case '단답형':
      return 'short_answer';
    case 'essay':
    case 'essay_self_review':
    case '주관식':
      return 'essay_self_review';
    default:
      return 'multiple_choice_single';
  }
}
