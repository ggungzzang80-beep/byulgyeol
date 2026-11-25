/**
 * 별의 속삭임(캐릭터) 테마 전용 '쉬운 말' 사전 (friendly.ts)
 * ------------------------------------------------------------------
 * 2026-11-25 @kooleumi8 피드백 4번: 한자·명리·자미두수 용어를 그대로 두면
 * 처음 보는 사람이 한 번에 이해하지 못합니다. 캐릭터 테마에서는 같은 값을
 * 따뜻하고 직관적인 일상어로 바꿔 보여 줍니다.
 *   - 부처궁 → 사랑·인연의 방      - 관록궁 → 일·커리어의 방
 *   - 대한   → 10년 큰 흐름        - 유년   → 올해 흐름
 *   - 주성   → 메인 별             - 보좌성·잡성 → 함께 빛나는 보조 별
 *   - 장생   → 새싹이 트는 기운     - 함     → 도움이 필요한 자리
 *   - 화권   → 주도권의 별빛        - 신해궁 → 신해(11번째) 방
 *
 * 자미원(미스틱) 테마는 기존 용어를 그대로 씁니다 — 이 파일은 캐릭터 테마에서만
 * 호출합니다.
 */

/** 궁 이름 → 캐릭터 테마의 방 이름 */
export const ROOM: Record<string, string> = {
  명궁: '나라는 방',
  형제궁: '가까운 사람의 방',
  부처궁: '사랑·인연의 방',
  자녀궁: '창작·즐거움의 방',
  재백궁: '돈의 방',
  질액궁: '몸·건강의 방',
  천이궁: '바깥 활동의 방',
  노복궁: '함께하는 사람의 방',
  관록궁: '일·커리어의 방',
  전택궁: '집·터전의 방',
  복덕궁: '마음의 방',
  부모궁: '윗사람·배움의 방',
};

/** 좁은 칸(별지도 셀·칩)에 쓰는 짧은 이름 */
export const ROOM_SHORT: Record<string, string> = {
  명궁: '나',
  형제궁: '가까운 사람',
  부처궁: '사랑·인연',
  자녀궁: '창작·즐거움',
  재백궁: '돈',
  질액궁: '몸·건강',
  천이궁: '바깥 활동',
  노복궁: '함께하는 사람',
  관록궁: '일·커리어',
  전택궁: '집·터전',
  복덕궁: '마음',
  부모궁: '윗사람·배움',
};

/** 별지도 칸(좁은 사각형)에 넣는 아주 짧은 이름 */
export const ROOM_CELL: Record<string, string> = {
  명궁: '나',
  형제궁: '친구',
  부처궁: '사랑',
  자녀궁: '창작',
  재백궁: '돈',
  질액궁: '건강',
  천이궁: '바깥',
  노복궁: '동료',
  관록궁: '일',
  전택궁: '집',
  복덕궁: '마음',
  부모궁: '배움',
};

export function roomCell(name: string): string {
  return ROOM_CELL[name] ?? name;
}

export function roomOf(name: string): string {
  return ROOM[name] ?? name;
}

export function roomShort(name: string): string {
  return ROOM_SHORT[name] ?? name;
}

/** 사화(四化) → 별빛 이름 */
export const MUTAGEN_LIGHT: Record<string, string> = {
  화록: '복이 들어오는 별빛',
  화권: '주도권의 별빛',
  화과: '이름이 남는 별빛',
  화기: '조심해서 다스릴 별빛',
};

export const MUTAGEN_SHORT: Record<string, string> = {
  화록: '복',
  화권: '주도',
  화과: '이름',
  화기: '조심',
};

export function mutagenLight(m?: string): string {
  return m ? MUTAGEN_LIGHT[m] ?? m : '';
}

export function mutagenShort(m?: string): string {
  return m ? MUTAGEN_SHORT[m] ?? m : '';
}

/** 별의 밝기(廟旺) → 그 자리에서 별이 어떤 얼굴인지 */
export const BRIGHT_LIGHT: Record<string, string> = {
  묘: '가장 잘 빛나는 자리',
  왕: '기세가 좋은 자리',
  득: '무난하게 힘을 받는 자리',
  리: '조건이 맞으면 빛나는 자리',
  평: '평범하게 굴러가는 자리',
  불: '살짝 힘이 눌린 자리',
  함: '도움이 필요한 자리',
};

export function brightLight(b?: string): string {
  return b ? BRIGHT_LIGHT[b] ?? '' : '';
}

/** 십이신(十二神) → 계절에 비유한 기운 */
export const STAGE_LIGHT: Record<string, string> = {
  장생: '새싹이 트는 기운',
  목욕: '흔들리며 배우는 기운',
  관대: '옷을 갖춰 입는 기운',
  임관: '자리를 얻는 기운',
  제왕: '정점에 서는 기운',
  쇠: '내려놓고 정리하는 기운',
  병: '점검하고 회복할 기운',
  사: '끊어내는 기운',
  묘: '갈무리하는 기운',
  절: '비워야 채워지는 기운',
  태: '씨앗을 품은 기운',
  양: '길러지는 기운',
};

export function stageLight(stage?: string): string {
  return stage ? STAGE_LIGHT[stage] ?? '' : '';
}

/** 오행국 → 몸에 붙은 결 */
export const ELEMENT_LIGHT: Record<string, string> = {
  수이국: '물처럼 흐르는 결',
  목삼국: '나무처럼 자라는 결',
  금사국: '쇠처럼 벼려지는 결',
  토오국: '흙처럼 중심을 잡는 결',
  화육국: '불처럼 타오르는 결',
};

/** 오행국 → 짧은 결 (별지도 가운데 칸) */
export const ELEMENT_SHORT: Record<string, string> = {
  수이국: '물의 결',
  목삼국: '나무의 결',
  금사국: '쇠의 결',
  토오국: '흙의 결',
  화육국: '불의 결',
};

export function elementShort(name?: string): string {
  return name ? ELEMENT_SHORT[name] ?? name : '';
}

export function elementLight(name?: string): string {
  return name ? ELEMENT_LIGHT[name] ?? name : '';
}

/**
 * 궁의 지지·간지 이름 — 바둑판 칸의 '신해궁' 처럼 읽히지 않게
 * '신해(11번째) 방' 으로 바꿔 줍니다.
 */
export function branchRoom(stem: string, branch: string, index: number): string {
  return `${stem}${branch}(${index + 1}번째) 방`;
}

/** 캐릭터 테마에서 이름을 존중해 부르는 표현 — '이름 님의' */
export function possessiveName(name?: string): string {
  const n = (name ?? '').trim();
  return n ? `${n} 님의` : '나의';
}
