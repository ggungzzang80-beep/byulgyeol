/**
 * AI 리포트 생성 인터페이스 (aiReport.ts)
 * ------------------------------------------------------------------
 * 지금은 앱 안의 결정적 콘텐츠 엔진(content.ts)으로 리포트가 나옵니다.
 * 사용자가 Gemini / OpenAI / Claude API 키를 연결하면, 같은 명반 데이터를
 * 프롬프트로 바꿔 실시간 생성으로 갈아끼울 수 있도록 인터페이스만 분리해 두었습니다.
 *
 * 사용법
 *   .env.local 에 아래 중 하나를 넣으면 자동으로 AI 생성 경로가 켜집니다.
 *     VITE_AI_PROVIDER=gemini
 *     VITE_AI_API_KEY=...
 *     VITE_AI_MODEL=gemini-2.0-flash       (선택)
 *
 * ⚠️ 운영 배포 시 주의
 *   VITE_ 로 시작하는 값은 브라우저 번들에 그대로 노출됩니다.
 *   실제 서비스에서는 이 파일의 `callProvider` 를 자체 서버(프록시) 호출로 바꾸고
 *   API 키는 서버 환경변수로 옮기는 것을 권장합니다. 요금 폭탄과 키 유출을 막는
 *   가장 확실한 방법입니다. (아래 `callProvider` 한 함수만 교체하면 됩니다.)
 */
import type { ChartModel } from '../lib/chart';
import { buildTeaser, deepProfileOf, monthlyGuide, palaceReadings, palaceScore, profileOf } from '../lib/content';

export type ReportTier = 'basic' | 'premium' | 'compat';

export type ReportPromptInput = {
  tier: ReportTier;
  chart: ChartModel;
  partner?: ChartModel;
  userName?: string;
};

export type AiReportConfig = {
  provider: 'gemini' | 'openai' | 'claude';
  apiKey: string;
  model: string;
  maxTokens: number;
};

const SYSTEM_PROMPT = `당신은 한국의 자미두수(紫微斗數) 상담가입니다.
- 고객에게 '당신'으로 말하며, 옛날 철학원 말투가 아니라 현대적이고 담백한 에세이 톤으로 씁니다.
- 추상어("운이 좋다/나쁘다", "에너지", "흐름")로 끝내지 않습니다. 반드시 무엇을·어디서·어떤 직함/전공/상황인지 구체적으로 씁니다.
- 진로는 산업과 직함으로, 전공은 실제 학과명으로, 배우자는 첫인상·직업·만나는 장소로, 돈은 새는 상황과 대략의 금액대로 씁니다.
- 명반 데이터에 없는 사실을 지어내지는 않되, 데이터에서 나온 구체적 장면은 과감하게 제시합니다.
- 단정적 예언('반드시 ~한다') 대신 '~할 확률이 높습니다', '~패턴이 반복됩니다'로 씁니다.
- 의료·법률·투자에 대한 확정적 조언은 하지 않습니다.
- 소제목을 쓰고, 한 문단은 3문장을 넘기지 않습니다.`;

/** 명반을 프롬프트용 텍스트로 직렬화 */
export function chartToPromptText(chart: ChartModel): string {
  const deep = deepProfileOf(chart.primaryStar);
  const palaceLines = chart.palaces.map((p) => {
    const majors = p.major.map((s) => `${s.name}(${s.brightness ?? '-'}${s.mutagen ? ',' + s.mutagen : ''})`).join(' ');
    const minors = p.minor.map((s) => s.name).join(' ');
    return `- ${p.name}(${p.stem}${p.branch}) 주성:${majors || '없음'} 보좌:${minors || '없음'} 대한:${p.decadalRange[0]}~${p.decadalRange[1]}세`;
  });

  const scores = {
    금전: palaceScore(chart.palaces.find((p) => p.name === '재백궁')),
    연애: palaceScore(chart.palaces.find((p) => p.name === '부처궁')),
    일: palaceScore(chart.palaces.find((p) => p.name === '관록궁')),
  };

  return [
    `이름: ${chart.name || '익명'}`,
    `성별: ${chart.gender === 'female' ? '여성' : '남성'}`,
    `양력: ${chart.solarText} / ${chart.timeText}`,
    `음력: ${chart.lunarText}`,
    `띠: ${chart.zodiac} / 오행국: ${chart.fiveElements} / 명궁 주성: ${chart.primaryStar}`,
    `명궁: ${chart.soulPalace.name}(${chart.soulPalace.stem}${chart.soulPalace.branch}) / 신궁: ${chart.bodyPalace.name}`,
    `현재 대한: ${chart.decadal.range[0]}~${chart.decadal.range[1]}세(${chart.decadal.name})`,
    `올해(${chart.yearly.year}) 유년 간지: ${chart.yearly.stemBranch}, 유년 사화: ${chart.yearly.mutagen.map((m) => `${m.name}(${m.mutagen})`).join(', ')}`,
    `지수: 금전 ${scores.금전} / 연애 ${scores.연애} / 일 ${scores.일}`,
    '(지수는 위 세 가지만 씁니다. 건강 지수나 다른 지수를 새로 만들지 마세요.)',
    '',
    '12궁:',
    ...palaceLines,
    '',
    '[핀셋 소재 — 이 사람을 구체적으로 해석할 때 쓸 사실]',
    `- 어울리는 전공: ${deep.majors.join(', ')}`,
    `- 어울리는 직업군: ${deep.careers.join(', ')}`,
    `- 끌리는 연애 타입: ${deep.loveType}`,
    `- 배우자상: ${deep.spouse}`,
    `- 돈이 새는 상황: ${deep.moneyLeak}`,
    `- 돈이 들어오는 경로: ${deep.moneyFlow}`,
    `- 결정의 순간: ${deep.decisive}`,
  ].join('\n');
}

/** 티어별 요청 사항 */
const TIER_TASK: Record<ReportTier, string> = {
  basic:
    '성격의 핵심, 어울리는 전공·직업군 3개, 돈이 새는 구체적 상황, 끌리는 연애 타입을 네 챕터로 정리해 주세요. 각 챕터에 실제 학과명·직함·금액대를 최소 하나씩 넣으세요.',
  premium:
    '12궁 전체 해설(궁별 3~4문장)과 지수 해석, 현재 대한·올해 유년 흐름, 월별 액션 가이드 12개에 더해 다음을 반드시 포함하세요. (1) 진로: 산업과 직함 3개와 그 이유 (2) 전공·자격: 실제 학과명과 자격증 (3) 배우자상: 첫인상·성격·직업·만나는 장소 (4) 재물: 돈이 들어오는 경로와 새는 상황 3개(금액대) (5) 올해 결정 3가지. 목록과 짧은 문단을 섞어 구체적으로 쓰세요.',
  compat:
    '두 사람의 명궁 주성을 중심으로 감정의 결, 생활 리듬, 오래 가는 조건을 3개 챕터로 비교하세요. 갈등은 실제 장면(돈 관리, 집안일, 연락 빈도, 가족 행사)으로, 해법은 역할 분담으로 구체적으로 쓰세요.',
};

export function buildPrompt(input: ReportPromptInput): { system: string; user: string } {
  const { tier, chart, partner } = input;
  const user = [
    '[명반 데이터 A]',
    chartToPromptText(chart),
    partner ? '\n[명반 데이터 B]' : '',
    partner ? chartToPromptText(partner) : '',
    '',
    '[요청]',
    TIER_TASK[tier],
    '마지막에 3문장 이내의 요약을 붙여 주세요.',
  ]
    .filter(Boolean)
    .join('\n');
  return { system: SYSTEM_PROMPT, user };
}

export function readAiConfig(): AiReportConfig | null {
  const env = import.meta.env as Record<string, string | undefined>;
  const provider = env.VITE_AI_PROVIDER as AiReportConfig['provider'] | undefined;
  const apiKey = env.VITE_AI_API_KEY;
  if (!provider || !apiKey) return null;
  const defaultModel =
    provider === 'gemini' ? 'gemini-2.0-flash' : provider === 'openai' ? 'gpt-4o-mini' : 'claude-3-5-sonnet-latest';
  return {
    provider,
    apiKey,
    model: env.VITE_AI_MODEL || defaultModel,
    maxTokens: 4096,
  };
}

export const isAiConfigured = () => readAiConfig() !== null;

/**
 * 프로바이더 호출 — 운영에서는 이 함수만 서버 프록시 호출로 바꾸면 됩니다.
 */
async function callProvider(
  config: AiReportConfig,
  prompt: { system: string; user: string },
): Promise<string> {
  if (config.provider === 'gemini') {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent?key=${config.apiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: prompt.system }] },
        contents: [{ role: 'user', parts: [{ text: prompt.user }] }],
        generationConfig: { maxOutputTokens: config.maxTokens, temperature: 0.8 },
      }),
    });
    if (!res.ok) throw new Error(`Gemini ${res.status}`);
    const data = await res.json();
    return data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? '').join('') ?? '';
  }

  if (config.provider === 'openai') {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        max_tokens: config.maxTokens,
        temperature: 0.8,
        messages: [
          { role: 'system', content: prompt.system },
          { role: 'user', content: prompt.user },
        ],
      }),
    });
    if (!res.ok) throw new Error(`OpenAI ${res.status}`);
    const data = await res.json();
    return data?.choices?.[0]?.message?.content ?? '';
  }

  // claude
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': config.apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: config.model,
      max_tokens: config.maxTokens,
      system: prompt.system,
      messages: [{ role: 'user', content: prompt.user }],
    }),
  });
  if (!res.ok) throw new Error(`Claude ${res.status}`);
  const data = await res.json();
  return data?.content?.map((c: { text?: string }) => c.text ?? '').join('') ?? '';
}

export type AiReportResult =
  | { ok: true; markdown: string; source: 'ai' }
  | { ok: false; reason: string; source: 'local' };

/**
 * 리포트 생성 진입점.
 * 키가 없으면 조용히 { ok:false } 를 돌려주고, 화면은 로컬 엔진 결과를 씁니다.
 */
export async function generateAiReport(input: ReportPromptInput): Promise<AiReportResult> {
  const config = readAiConfig();
  if (!config) return { ok: false, reason: 'AI 키가 설정되지 않았습니다.', source: 'local' };
  try {
    const markdown = await callProvider(config, buildPrompt(input));
    if (!markdown.trim()) return { ok: false, reason: '빈 응답', source: 'local' };
    return { ok: true, markdown, source: 'ai' };
  } catch (err) {
    return {
      ok: false,
      reason: err instanceof Error ? err.message : 'AI 호출 실패',
      source: 'local',
    };
  }
}

/** 로컬 엔진 결과를 화면과 같은 형태로 뽑아두는 헬퍼 (마크다운 미리보기용) */
export function localReportPreview(chart: ChartModel): string {
  const profile = profileOf(chart.primaryStar);
  const deep = deepProfileOf(chart.primaryStar);
  const teaser = buildTeaser(chart);
  const months = monthlyGuide(chart);
  return [
    `## ${chart.primaryStar}성의 사람`,
    profile.identity,
    '',
    '## 진로 · 전공',
    `- 전공: ${deep.majors.join(', ')}`,
    `- 직업군: ${deep.careers.join(', ')}`,
    '',
    '## 배우자상',
    deep.spouse,
    '',
    '## 재물',
    `- 들어오는 경로: ${deep.moneyFlow}`,
    `- 새는 상황: ${deep.moneyLeak}`,
    '',
    '## 올해의 주의점',
    `- 재물: ${teaser.money}`,
    `- 연애: ${teaser.love}`,
    '',
    '## 12궁 요약',
    ...chart.palaces.map((p) => `- ${p.name}: ${palaceReadings(p).paragraphs[0]}`),
    '',
    '## 월별 가이드',
    ...months.map((m) => `- ${m.month}월(${m.theme}): ${m.action}`),
  ].join('\n');
}
