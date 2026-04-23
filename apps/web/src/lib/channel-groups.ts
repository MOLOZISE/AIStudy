export type BoardSectionKey =
  | 'announcement'
  | 'company'
  | 'subsidiary'
  | 'lifestyle'
  | 'career'
  | 'anonymous';

export type BoardSectionFilter = 'all' | BoardSectionKey;
export type SpaceFilter = 'all' | 'joined' | 'discoverable';

export const BOARD_SECTION_LIMIT = 3;
export const SPACE_SECTION_LIMIT = 3;

export const BOARD_SECTION_ORDER: Array<{
  key: BoardSectionKey;
  label: string;
  shortLabel: string;
  accent: string;
  description: string;
}> = [
  {
    key: 'announcement',
    label: '공지/필독',
    shortLabel: '공지',
    accent: 'slate',
    description: '중요 공지와 필수 확인 글',
  },
  {
    key: 'company',
    label: '전사 게시판',
    shortLabel: '전사',
    accent: 'slate',
    description: '회사 전반의 이야기와 소통',
  },
  {
    key: 'subsidiary',
    label: '그룹사 게시판',
    shortLabel: '그룹사',
    accent: 'blue',
    description: '계열사별 소식과 이야기',
  },
  {
    key: 'lifestyle',
    label: '생활/재미',
    shortLabel: '생활',
    accent: 'orange',
    description: '맛집, 취미, 여행, 소소한 재미',
  },
  {
    key: 'career',
    label: '업무/커리어',
    shortLabel: '업무',
    accent: 'green',
    description: '실무 팁, 커리어 이야기, 노하우',
  },
  {
    key: 'anonymous',
    label: '익명 게시판',
    shortLabel: '익명',
    accent: 'purple',
    description: '편하게 묻고 말하는 익명 공간',
  },
];

export const BOARD_SECTION_TABS: Array<{ key: BoardSectionFilter; label: string }> = [
  { key: 'all', label: '전체' },
  ...BOARD_SECTION_ORDER.map((section) => ({ key: section.key, label: section.label })),
];

export const SPACE_FILTER_TABS: Array<{ key: SpaceFilter; label: string }> = [
  { key: 'all', label: '전체' },
  { key: 'joined', label: '참여 중' },
  { key: 'discoverable', label: '참여 가능' },
];

export function normalizeBoardSection(value: string | null | undefined): BoardSectionKey | null {
  switch (value) {
    case 'announcement':
    case 'company':
    case 'subsidiary':
    case 'lifestyle':
    case 'career':
    case 'anonymous':
      return value;
    default:
      return null;
  }
}

export function getBoardSectionConfig(key: BoardSectionKey) {
  return BOARD_SECTION_ORDER.find((section) => section.key === key) ?? BOARD_SECTION_ORDER[1];
}

export function getBoardSectionHref(key: BoardSectionFilter) {
  return key === 'all' ? '/boards' : `/boards?section=${key}`;
}

export function getSpaceFilterHref(key: SpaceFilter) {
  return key === 'all' ? '/spaces' : `/spaces?view=${key}`;
}

export function formatChannelHighlight(title?: string | null) {
  if (!title) return '';
  return title.length > 28 ? `${title.slice(0, 28)}…` : title;
}
