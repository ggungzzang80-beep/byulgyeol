/**
 * 명반 계산 엔진 (chart.ts)
 * ------------------------------------------------------------------
 * 사용자 입력 → 한국어 명반 모델.
 *
 * - 계산: iztro 2.6.5 (자미두수 오픈소스 엔진, 음양력·윤달·시진 보정 포함)
 * - 음력 입력: korean-lunar-calendar 로 한국 음력 → 양력 변환 후 계산
 *   (한국 음력은 KST 기준이라 중국 음력과 드물게 하루 어긋날 수 있어,
 *    음력으로 입력한 경우 입력값을 그대로 표기하고 보정 메모를 남깁니다)
 * - 화면 표기: 모든 명칭을 terms.ts 의 한국어 사전으로 변환 (중국어 노출 0)
 */
import {
  BRANCHES_KR,
  BRIGHTNESS_KR,
  FIVE_ELEMENTS_KR,
  PALACE_BY_CN,
  SIGN_KR,
  STEMS_KR,
  TWELVE_STAGES_KR,
  ZODIAC_KR,
  krMutagen,
  krStar,
  timeLabel,
} from './terms';

/* 계산 엔진(iztro · 음력 변환)은 첫 입력 시점에 동적 import 합니다.
   첫 화면(랜딩)은 엔진 번들을 싣지 않아 훨씬 가볍게 뜸니다. */
type AstroModule = typeof import('iztro');
type LunarModule = typeof import('korean-lunar-calendar');

/** horoscope() 결과 중 화면에서 쓰는 부분만 추린 타입 */
type HoroscopeLike = {
  yearly?: {
    index?: number;
    heavenlyStem: string;
    earthlyBranch: string;
    mutagen: string[];
    palaceNames: Record<string, string>;
  };
};

export type Gender = 'male' | 'female';
export type CalendarType = 'solar' | 'lunar';

export type BirthInput = {
  name: string;
  year: number;
  month: number;
  day: number;
  calendar: CalendarType;
  isLeap: boolean;
  timeIndex: number; // 0~12
  timeKnown: boolean;
  gender: Gender;
};

export type StarView = {
  name: string; // 한국어 별 이름
  cn: string; // 원본(내부 계산용, 화면 노출 금지)
  brightness?: string; // 묘/왕/득/리/평/불/함
  mutagen?: string; // 화록/화권/화과/화기
};

export type PalaceView = {
  index: number;
  name: string; // 명궁, 재백궁 ...
  hanja: string;
  cn: string;
  domain: string;
  reading: string;
  stem: string;
  branch: string;
  isBodyPalace: boolean;
  major: StarView[];
  minor: StarView[];
  adj: StarView[];
  decadalRange: [number, number];
  decadalStem: string;
  decadalBranch: string;
  stage: string; // 십이신
};

/** 2027 정미년(丁未) 신년 운세용 값 — 유년 명궁·사화·나이 */
export type Year2027 = {
  year: 2027;
  stemBranch: string; // 정미
  hanja: string; // 丁未
  /** 2027년 유년 명궁이 되는 명반 궁 이름 (예: 재백궁) */
  palaceName: string;
  palaceDomain: string;
  palaceIndex: number;
  mutagen: StarView[]; // 2027 유년 사화 4개
  age: number; // 2027년 한국식 나이
  /** 명반 궁 index → 2027년에 그 궁이 맡는 이름(중국어, 내부 계산용) */
  palaceRoles: string[];
};

export type ChartModel = {
  name: string;
  gender: Gender;
  calendar: CalendarType;
  solarText: string; // 1992. 3. 15.
  lunarText: string; // 음력 1992. 2. 12.
  isLeapMonth: boolean;
  note?: string;
  timeText: string;
  timeKnown: boolean;
  zodiac: string;
  sign: string;
  fiveElements: string;
  soulStar: string;
  bodyStar: string;
  soulBranch: string;
  bodyBranch: string;
  palaces: PalaceView[];
  soulPalace: PalaceView;
  bodyPalace: PalaceView;
  primaryStar: string; // 명궁 대표 주성
  primaryBrightness?: string;
  primaryMutagen?: string;
  borrowedFrom?: string; // 명궁이 비었을 때 빌려온 궁
  decadal: { range: [number, number]; name: string; branch: string };
  yearly: {
    year: number;
    stemBranch: string;
    palaceName: string;
    mutagen: StarView[]; // 유년 사화 4개
    age: number;
  };
  /** 2027 정미년 신년 운세 (유년 명궁·사화) */
  year2027: Year2027;
  /** 같은 입력이면 항상 같은 값이 나오는 결정적 시드 */
  seed: number;
};

const CN_STEM_BRANCH = (sb: string[]) => `${STEMS_KR[sb[0]] ?? ''}${BRANCHES_KR[sb[1]] ?? ''}`;

function pad(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}

function hashSeed(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h) % 100000;
}

/** 한국 음력 → 양력 */
export async function lunarToSolar(
  year: number,
  month: number,
  day: number,
  isLeap: boolean,
): Promise<{ year: number; month: number; day: number } | null> {
  try {
    const mod = (await import('korean-lunar-calendar')) as LunarModule;
    const Ctor = (mod as unknown as { default?: unknown }).default ?? mod;
    const cal = new (Ctor as new () => {
      setLunarDate: (y: number, m: number, d: number, leap: boolean) => void;
      getSolarCalendar: () => { year: number; month: number; day: number };
    })();
    cal.setLunarDate(year, month, day, isLeap);
    const s = cal.getSolarCalendar();
    if (!s || !s.year || !s.month || !s.day) return null;
    return { year: s.year, month: s.month, day: s.day };
  } catch {
    return null;
  }
}

function mapStar(s: { name: string; brightness?: string; mutagen?: string }): StarView {
  return {
    name: krStar(s.name),
    cn: s.name,
    brightness: s.brightness ? (BRIGHTNESS_KR[s.brightness] ?? undefined) : undefined,
    mutagen: s.mutagen ? krMutagen(s.mutagen) : undefined,
  };
}

export async function buildChart(input: BirthInput): Promise<ChartModel> {
  const astroMod = (await import('iztro')) as AstroModule;
  const astro = astroMod.astro;

  let solar = { year: input.year, month: input.month, day: input.day };
  let note: string | undefined;

  if (input.calendar === 'lunar') {
    const converted = await lunarToSolar(input.year, input.month, input.day, input.isLeap);
    if (!converted) {
      throw new Error('음력 날짜를 양력으로 변환하지 못했습니다. 날짜를 확인해 주세요.');
    }
    solar = converted;
    note = '한국 음력 기준으로 양력 변환 후 계산했습니다.';
  }

  const astrolabe = astro.bySolar(
    `${solar.year}-${solar.month}-${solar.day}`,
    input.timeIndex,
    input.gender,
    true,
  );

  const palaces: PalaceView[] = astrolabe.palaces.map((p) => {
    const meta = PALACE_BY_CN[p.name];
    return {
      index: p.index,
      name: meta?.key ?? '명궁',
      hanja: meta?.hanja ?? '',
      cn: p.name,
      domain: meta?.domain ?? '',
      reading: meta?.reading ?? '',
      stem: STEMS_KR[p.heavenlyStem] ?? '',
      branch: BRANCHES_KR[p.earthlyBranch] ?? '',
      isBodyPalace: p.isBodyPalace,
      major: p.majorStars.map(mapStar),
      minor: p.minorStars.map(mapStar),
      adj: p.adjectiveStars.map(mapStar),
      decadalRange: p.decadal.range as [number, number],
      decadalStem: STEMS_KR[p.decadal.heavenlyStem] ?? '',
      decadalBranch: BRANCHES_KR[p.decadal.earthlyBranch] ?? '',
      stage: TWELVE_STAGES_KR[p.changsheng12] ?? '장생',
    };
  });

  const soulPalace = palaces.find((p) => p.cn === '命宫') ?? palaces[7];
  const bodyPalaceCn = astrolabe.palaces.find((p) => p.isBodyPalace)?.name;
  const bodyPalace = palaces.find((p) => p.cn === bodyPalaceCn) ?? soulPalace;

  // 명궁이 비어 있으면(공궁) 천이궁의 주성을 빌려 성향을 읽는 전통 기법을 적용합니다.
  let primary = soulPalace.major[0];
  let borrowedFrom: string | undefined;
  if (!primary) {
    const opposite = palaces.find((p) => p.cn === '迁移');
    if (opposite?.major[0]) {
      primary = opposite.major[0];
      borrowedFrom = '천이궁';
    }
  }
  if (!primary) primary = { name: '무주성', cn: '' };

  const now = new Date();
  const nominalAge = now.getFullYear() - input.year + 1;
  let horoscope: HoroscopeLike | null = null;
  try {
    horoscope = astrolabe.horoscope(
      `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`,
    ) as unknown as HoroscopeLike;
  } catch {
    horoscope = null;
  }

  const mutagenStars: StarView[] = (horoscope?.yearly?.mutagen ?? []).map((cn: string, i: number) => ({
    name: krStar(cn),
    cn,
    mutagen: ['화록', '화권', '화과', '화기'][i],
  }));

  /* 2027 정미년(丁未) 유년 명궁·사화 — 신년 부적·신년 리포트가 쓰는 값.
     계산 엔진에 2027년 날짜를 넣어 뽑으므로 해마다 값이 아니라 명반에 따라 달라집니다. */
  let horoscope2027: HoroscopeLike | null = null;
  try {
    horoscope2027 = astrolabe.horoscope('2027-06-01') as unknown as HoroscopeLike;
  } catch {
    horoscope2027 = null;
  }

  const mutagen2027: StarView[] = (horoscope2027?.yearly?.mutagen ?? []).map((cn: string, i: number) => ({
    name: krStar(cn),
    cn,
    mutagen: ['화록', '화권', '화과', '화기'][i],
  }));

  const palaceRoles: string[] = (() => {
    const names = horoscope2027?.yearly?.palaceNames as unknown;
    if (!names) return [];
    if (Array.isArray(names)) return names.map((n) => String(n));
    // 엔진 버전에 따라 { 궁이름: index } 형태로 올 수 있어 index 기준 배열로 바꿔 둡니다.
    const arr: string[] = [];
    Object.entries(names as Record<string, string | number>).forEach(([key, value]) => {
      const idx = typeof value === 'number' ? value : Number(key);
      if (Number.isFinite(idx)) arr[idx] = String(typeof value === 'number' ? key : value);
    });
    return arr;
  })();

  const idx2027 =
    typeof horoscope2027?.yearly?.index === 'number' ? horoscope2027.yearly.index : soulPalace.index;
  const palace2027 = palaces[idx2027] ?? soulPalace;
  const age2027 = 2027 - input.year + 1;

  const currentDecadal =
    palaces.find((p) => nominalAge >= p.decadalRange[0] && nominalAge <= p.decadalRange[1]) ??
    soulPalace;

  const yearlyPalaceCn = horoscope?.yearly?.palaceNames
    ? Object.entries(horoscope.yearly.palaceNames).find(([, v]) => v === '命宫')?.[0]
    : undefined;
  const yearlyPalaceIndex =
    horoscope?.yearly && typeof horoscope.yearly.index === 'number'
      ? horoscope.yearly.index
      : undefined;
  const yearlyPalace =
    palaces[yearlyPalaceIndex ?? Number(yearlyPalaceCn ?? currentDecadal.index)] ?? soulPalace;

  const lunarRaw = (astrolabe.rawDates?.lunarDate ?? {}) as {
    lunarYear?: number;
    lunarMonth?: number;
    lunarDay?: number;
    isLeap?: boolean;
  };

  const lunarText =
    input.calendar === 'lunar'
      ? `음력 ${input.year}. ${input.month}. ${input.day}.${input.isLeap ? ' (윤달)' : ''}`
      : `음력 ${lunarRaw.lunarYear ?? input.year}. ${lunarRaw.lunarMonth ?? 1}. ${lunarRaw.lunarDay ?? 1}.${lunarRaw.isLeap ? ' (윤달)' : ''}`;

  const seed = hashSeed(
    `${solar.year}-${solar.month}-${solar.day}-${input.timeIndex}-${input.gender}-${input.year}`,
  );

  return {
    name: input.name.trim(),
    gender: input.gender,
    calendar: input.calendar,
    solarText: `${solar.year}. ${solar.month}. ${solar.day}.`,
    lunarText,
    isLeapMonth: Boolean(lunarRaw.isLeap),
    note,
    timeText: input.timeKnown ? timeLabel(input.timeIndex) : '시간 모름 (정오 기준)',
    timeKnown: input.timeKnown,
    zodiac: ZODIAC_KR[astrolabe.zodiac] ?? '원숭이',
    sign: SIGN_KR[astrolabe.sign] ?? '',
    fiveElements: FIVE_ELEMENTS_KR[astrolabe.fiveElementsClass] ?? '토오국',
    soulStar: krStar(astrolabe.soul),
    bodyStar: krStar(astrolabe.body),
    soulBranch: BRANCHES_KR[astrolabe.earthlyBranchOfSoulPalace] ?? '',
    bodyBranch: BRANCHES_KR[astrolabe.earthlyBranchOfBodyPalace] ?? '',
    palaces,
    soulPalace,
    bodyPalace,
    primaryStar: primary.name,
    primaryBrightness: primary.brightness,
    primaryMutagen: primary.mutagen,
    borrowedFrom,
    year2027: {
      year: 2027,
      stemBranch: horoscope2027
        ? CN_STEM_BRANCH([horoscope2027.yearly!.heavenlyStem, horoscope2027.yearly!.earthlyBranch])
        : '정미',
      hanja: '丁未',
      palaceName: palace2027.name,
      palaceDomain: palace2027.domain,
      palaceIndex: idx2027,
      mutagen: mutagen2027,
      age: age2027 > 0 ? age2027 : 0,
      palaceRoles,
    },
    decadal: {
      range: currentDecadal.decadalRange,
      name: `${currentDecadal.decadalStem}${currentDecadal.decadalBranch}`,
      branch: currentDecadal.branch,
    },
    yearly: {
      year: now.getFullYear(),
      stemBranch: horoscope
        ? CN_STEM_BRANCH([horoscope.yearly!.heavenlyStem, horoscope.yearly!.earthlyBranch])
        : '',
      palaceName: yearlyPalace.name,
      mutagen: mutagenStars,
      age: nominalAge,
    },
    seed,
  };
}
