import { createContext, useContext, type ReactNode } from 'react';

export type ThemeId = 'mystic' | 'character';

export const THEME_IDS: ThemeId[] = ['mystic', 'character'];

export function readThemeFromUrl(): ThemeId {
  // 2026-11 개편: 기본 진입 화면은 '별의 속삭임'(캐릭터) 테마.
  // 미스틱은 ?theme=mystic 으로만 열립니다.
  const value = new URLSearchParams(window.location.search).get('theme');
  return value === 'mystic' ? 'mystic' : 'character';
}

export type ThemeCopy = {
  brand: { name: string; hanja: string; en: string; line: string };
  nav: { chart: string; reports: string; guide: string };
  headerCta: string;
  form: {
    eyebrow: string;
    title: string;
    desc: string;
    namePlaceholder: string;
    submit: string;
    sample: string;
    timeHint: string;
    solar: string;
    lunar: string;
    female: string;
    male: string;
  };
  chart: {
    soulSection: string;
    soulLabel: string;
    identityLabel: string;
    strength: string;
    caution: string;
    numbersTitle: string;
    numbersNote: string;
    yearNote: (decadal: string, palace: string) => string;
    boardSection: string;
    boardTitle: (name: string) => string;
    boardHint: string;
    boardNote: string;
    teaserFree: string;
    teaserTitle: (year: number) => string;
    teaserSub: string;
    teaserCta: string;
    teaserNote: string;
    productsSection: string;
    save: string;
    saveBusy: string;
    share: string;
    reset: string;
    premium: string;
    detailNext: string;
    detailUnlock: string;
    shareTitle: string;
    shareTagline: string;
    toastSaved: string;
    toastSaveFail: string;
    toastCopied: string;
    toastCancel: string;
    soulBubble: (star: string) => string;
  };
  report: {
    unlocked: string;
    title: (name: string) => string;
    sectionPersonality: string;
    sectionScores: string;
    sectionYear: string;
    sectionPalaces: string;
    sectionMonthly: string;
    palacesTitle: string;
    palacesDesc: string;
    monthlyTitle: string;
    monthlyDesc: string;
    summary: string;
    upgradeNote: string;
  };
  checkout: {
    eyebrow: string;
    period: string;
    periodValue: string;
    amount: string;
    partner: string;
    method: string;
    agree: string;
    note: string;
    /** 결제 연동 전(미리보기 빌드)에 보여 줄 안내 */
    previewNote: string;
    cancel: string;
    pay: (price: string) => string;
    processing: string;
    done: string;
    order: string;
  };
  compat: {
    unlocked: string;
    kicker: string;
    score: string;
    back: string;
    top: string;
  };
};

const MYSTIC: ThemeCopy = {
  brand: { name: '자미원', hanja: '紫微垣', en: 'JA MI WON', line: '천문이 읽고, 별이 말하다' },
  nav: { chart: '명반', reports: '세 개의 문', guide: '안내' },
  headerCta: '무료로 명반 보기',
  form: {
    eyebrow: '3초 만에 명반 열기',
    title: '생년월일시를 알려주세요',
    desc: '한 번의 입력으로 열두 궁과 열네 주성이 당신의 자리에 놓입니다.',
    namePlaceholder: '리포트에 새길 이름',
    submit: '내 명반 열기',
    sample: '예시 명반으로 먼저 보기',
    timeHint: '시간을 모르면 명궁이 달라질 수 있습니다. 모르는 경우 정오(오시)로 계산합니다.',
    solar: '양력',
    lunar: '음력',
    female: '여성',
    male: '남성',
  },
  chart: {
    soulSection: '내 명궁의 주성',
    soulLabel: '命宮 · 명궁',
    identityLabel: '이 사람의 결',
    strength: '강점',
    caution: '주의',
    numbersTitle: '이 명반의 세 가지 숫자',
    numbersNote: '각 궁의 주성·보좌성·사화를 점수화한 값입니다. 100점은 없습니다 — 다 좋은 명반은 없으니까요.',
    yearNote: (decadal, palace) => `올해 대한은 ${decadal}, 유년 명궁은 ${palace}입니다.`,
    boardSection: '12궁 명반',
    boardTitle: (name) => (name ? `${name} 님의 하늘` : '나의 하늘'),
    boardHint: '궁을 누르면 그 자리의 주성·보좌성·사화 해설이 열립니다.',
    boardNote: '궁을 누르면 해설이 열립니다',
    teaserFree: '무료 공개 30%',
    teaserTitle: (year) => `${year}년, 가장 조심해야 할 궁`,
    teaserSub: '그리고 아직 말하지 않은 한 줄',
    teaserCta: '잠금 해제하고 전체 보기',
    teaserNote:
      '왜 그런지, 언제인지, 무엇을 하면 되는지는 프리미엄 리포트에서 12궁 전체로 이어집니다.',
    productsSection: '리포트 5종',
    save: '이미지 저장',
    saveBusy: '만드는 중…',
    share: '공유하기',
    reset: '다시 입력',
    premium: '프리미엄 리포트',
    detailNext: '이 궁의 다음 3년',
    detailUnlock: '프리미엄 리포트에서 열기',
    shareTitle: '자미원 · 나의 명반',
    shareTagline: '자미원 · 紫微垣 — 별이 그린 나의 명반',
    toastSaved: '요약 카드를 저장했습니다. (1080×1350)',
    toastSaveFail: '이미지 저장에 실패했습니다. 다시 시도해 주세요.',
    toastCopied: '공유 문구를 복사했습니다. 원하는 곳에 붙여넣으세요.',
    toastCancel: '공유를 취소했습니다.',
    soulBubble: (star) =>
      `${star}성이 앉은 자리. 이 별은 늘 같은 지점에서 당신의 선택을 멈추게 합니다.`,
  },
  report: {
    unlocked: '잠금 해제됨',
    title: (name) => `${name ? name + ' 님의' : '나의'} 인생 사용설명서`,
    sectionPersonality: '성격 · 나라는 사람',
    sectionScores: '운의 지수',
    sectionYear: '지금의 흐름',
    sectionPalaces: '12궁 전체 해설',
    sectionMonthly: '월별 액션 가이드',
    palacesTitle: '열두 개의 방',
    palacesDesc:
      '인생의 열두 영역을 각각의 방으로 봅니다. 방마다 앉은 별이 다르고, 그 별이 그 방에서 어떤 얼굴로 등장하는지가 이 리포트의 핵심입니다.',
    monthlyTitle: '달마다 하나씩',
    monthlyDesc: '흐름이 열리는 달, 결정을 미룰 달을 미리 표시했습니다.',
    summary: '한 문장으로 정리하면',
    upgradeNote: '이미 결제한 금액은 그대로 사용됩니다.',
  },
  checkout: {
    eyebrow: '결제 확인',
    period: '이용 기간',
    periodValue: '영구 소장 (재열람 가능)',
    amount: '결제 금액',
    partner: '상대방 정보',
    method: '결제 수단',
    agree: '디지털 콘텐츠가 즉시 제공되어 청약 철회가 제한됨을 확인했고, 이에 동의합니다.',
    note: '결제는 페이앱(PayApp)을 통해 처리됩니다. 결제가 확인되면 잠긴 리포트가 바로 열리고, 거래 내역은 결제 시 입력한 휴대폰 번호로 확인할 수 있습니다.',
    previewNote: '결제 연동 준비 중인 미리보기 화면입니다. 지금은 결제 없이 잠금이 해제된 리포트가 열립니다.',
    cancel: '취소',
    pay: (price) => `${price}원 결제하고 리포트 열기`,
    processing: '결제 확인 중',
    done: '잠금 해제 완료',
    order: '명반',
  },
  compat: {
    unlocked: '잠금 해제됨',
    kicker: '두 사람 자미두수 궁합',
    score: '궁합 지수',
    back: '명반으로',
    top: '우리가 오래 가는 조건',
  },
};

const CHARACTER: ThemeCopy = {
  brand: { name: '별의 속삭임', hanja: '별빛 가디언', en: 'WHISPER OF STARS', line: '별빛 가디언이 읽어주는 나만의 사용설명서' },
  nav: { chart: '내 별', reports: '별 이야기', guide: '안내' },
  headerCta: '별 읽으러 가기',
  form: {
    eyebrow: '너의 별 만나러 가기',
    title: '별이 태어난 순간을 알려줘',
    desc: '생년월일시만 있으면, 가디언이 너의 별지도를 그려줄게.',
    namePlaceholder: '별지도에 새길 이름 (선택)',
    submit: '내 별지도 열기',
    sample: '예시 별지도 먼저 보기',
    timeHint: '시간을 모르면 별의 자리가 조금 달라질 수 있어. 모르면 정오 기준으로 그려줄게!',
    solar: '양력',
    lunar: '음력',
    female: '여성',
    male: '남성',
  },
  chart: {
    soulSection: '너의 수호별',
    soulLabel: '수호별 · 命宮',
    identityLabel: '너라는 별',
    strength: '이런 때 빛나',
    caution: '이건 조심',
    numbersTitle: '별빛 지수 3가지',
    numbersNote: '별이 놓인 자리로 계산한 지수야. 높낮이보다 "어디에 힘을 줄지" 보는 지도라고 생각해 줘!',
    yearNote: (decadal, palace) => `올해의 큰 별은 ${decadal}, 올해 네 별방은 ${palace}이야.`,
    boardSection: '12개의 별방',
    boardTitle: (name) => (name ? `${name}의 별지도` : '나의 별지도'),
    boardHint: '별방을 누르면 그 방에 사는 별 이야기가 열려.',
    boardNote: '별방을 누르면 이야기가 열려',
    teaserFree: '무료 공개 30%',
    teaserTitle: (year) => `${year}년, 조심해야 할 별방`,
    teaserSub: '아직 안 알려준 이야기',
    teaserCta: '전체 별 이야기 열기',
    teaserNote: '왜 그런지, 언제인지, 뭘 하면 좋은지는 전체 이야기에서 12개 별방으로 이어져.',
    productsSection: '별 이야기 5종',
    save: '카드 저장',
    saveBusy: '그리는 중…',
    share: '공유하기',
    reset: '다시 입력',
    premium: '전체 별 보기',
    detailNext: '이 별방의 다음 3년',
    detailUnlock: '전체 이야기 열기',
    shareTitle: '별의 속삭임 · 나의 별지도',
    shareTagline: '별의 속삭임 — 별빛 가디언이 읽어주는 나만의 사용설명서',
    toastSaved: '별 카드를 저장했어! (1080×1350)',
    toastSaveFail: '카드를 저장하지 못했어. 한 번만 다시 해볼게!',
    toastCopied: '공유 문구를 복사했어. 원하는 곳에 붙여넣어 줘!',
    toastCancel: '공유를 그만뒀어.',
    soulBubble: (star) => `${star}별이 너의 수호별이야. 오늘도 살짝 너를 응원하고 있어 ✨`,
  },
  report: {
    unlocked: '별 이야기 열림',
    title: (name) => `${name ? name + '의' : '나의'} 별 사용설명서`,
    sectionPersonality: '너라는 별',
    sectionScores: '별빛 지수',
    sectionYear: '지금 너의 하늘',
    sectionPalaces: '12개 별방 이야기',
    sectionMonthly: '달마다 별 처방',
    palacesTitle: '열두 개의 별방',
    palacesDesc: '네 안에 열두 개의 방이 있고, 방마다 다른 별이 살고 있어. 그 별이 어떤 얼굴로 너를 돕는지 하나씩 알려줄게.',
    monthlyTitle: '달마다 하나씩',
    monthlyDesc: '별이 힘을 주는 달, 조금 쉬어갈 달을 미리 표시해 뒀어.',
    summary: '한 문장으로 정리하면',
    upgradeNote: '이미 결제한 금액은 그대로 쓸 수 있어.',
  },
  checkout: {
    eyebrow: '별 이야기 열기',
    period: '볼 수 있는 기간',
    periodValue: '계속 보관 (언제든 다시 보기)',
    amount: '결제 금액',
    partner: '상대방 정보',
    method: '결제 수단',
    agree: '결제하면 디지털 콘텐츠가 바로 열리고, 그때부터 청약 철회가 제한되는 것에 동의해.',
    note: '결제는 페이앱(PayApp)을 통해 안전하게 처리돼. 결제가 끝나면 잠긴 이야기가 바로 열리고, 거래 내역은 결제할 때 적은 번호로 확인할 수 있어.',
    previewNote: '지금은 결제 연결 전 미리보기 화면이야. 결제 없이 잠긴 이야기가 열려.',
    cancel: '그만두기',
    pay: (price) => `${price}원 결제하고 내 별 이야기 열기`,
    processing: '결제 확인 중',
    done: '별 이야기 열렸어!',
    order: '별지도',
  },
  compat: {
    unlocked: '이야기 열림',
    kicker: '두 사람의 별 이야기',
    score: '궁합 지수',
    back: '별지도로',
    top: '우리가 오래 가는 조건',
  },
};

export const THEME_COPY: Record<ThemeId, ThemeCopy> = {
  mystic: MYSTIC,
  character: CHARACTER,
};

type ThemeContextValue = {
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
  copy: ThemeCopy;
};

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'mystic',
  setTheme: () => undefined,
  copy: MYSTIC,
});

export function ThemeProvider({
  theme,
  setTheme,
  children,
}: {
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
  children: ReactNode;
}) {
  return (
    <ThemeContext.Provider value={{ theme, setTheme, copy: THEME_COPY[theme] }}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

/** 테마별 아트워크 경로 (GitHub Pages 서브경로 배포 대응) */
const ART = `${import.meta.env.BASE_URL}art/`;

export type ThemeArt = {
  /** 메인 비주얼 */
  hero: string;
  alt: string;
  /** 작은 원형 아바타 (얼굴 크롭) */
  avatar: string;
  /** 클로즈업 인사 이미지 — 캐릭터 소개·부적 안내 */
  greeting: string;
  /** 장면 이미지 — 캐릭터 안내 비주얼 */
  scenes: Array<{ id: string; src: string; alt: string }>;
};

/**
 * 캐릭터 테마의 메인 캐릭터 — '하온 + 오드아이 별빛 고양이'
 * (밤하늘 발코니 / 카페 창가 / 서재 — 세 장면은 같은 인물·같은 고양이)
 */
export const THEME_ART: Record<ThemeId, ThemeArt> = {
  mystic: {
    hero: `${ART}mystic-card.webp`,
    alt: '금박 성좌가 빛나는 자미두수 타로 카드',
    avatar: `${ART}mystic-card.webp`,
    greeting: `${ART}mystic-card.webp`,
    scenes: [],
  },
  character: {
    hero: `${ART}haon-hero.webp`,
    alt: '별이 쏟아지는 밤 발코니에 기대어 오드아이 흰 고양이와 함께 서 있는 하온',
    avatar: `${ART}haon-avatar.webp`,
    greeting: `${ART}haon-face-cat.webp`,
    scenes: [
      { id: 'cafe', src: `${ART}haon-cafe.webp`, alt: '카페 창가에서 고양이와 마주 보는 하온' },
      { id: 'night', src: `${ART}haon-night.webp`, alt: '별이 쏟아지는 밤 발코니의 하온과 고양이' },
      { id: 'study', src: `${ART}haon-study.webp`, alt: '서재에서 안경을 쓰고 책을 읽는 하온과 잠든 고양이' },
    ],
  },
};
