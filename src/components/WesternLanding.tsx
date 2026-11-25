import type { BirthInput } from '../lib/chart';
import {
  WESTERN_PRODUCTS,
  productBadge,
  productCta,
  productPoints,
  productPriceInfo,
  productScopeShort,
  productTagline,
  type ProductId,
} from '../lib/products';
import { useTheme } from '../lib/theme';
import BirthForm from './BirthForm';
import NatalWheel from './NatalWheel';
import PriceTag from './PriceTag';
import { SectionLabel, StarMark } from './ui';

type Props = {
  onSubmit: (input: BirthInput) => void;
  onProduct: (id: ProductId) => void;
};

/** 서양 점성술 랜딩 — 두 테마가 같은 화면을 쓰되 말투만 달라집니다. */
export default function WesternLanding({ onSubmit, onProduct }: Props) {
  const { theme } = useTheme();
  const isCharacter = theme === 'character';

  const t = {
    eyebrow: 'WESTERN · 出生天宮圖',
    h1a: isCharacter ? '태어난 하늘 그대로,' : '태어난 하늘의 좌표가',
    h1b: isCharacter ? '별자리가 궁금하신가요?' : '성격의 지도가 됩니다',
    desc: isCharacter
      ? '생년월일시로 태양·달·어센던트, 그리고 행성 7개의 하우스를 그려요. 자미두수와는 다른 체계예요 — 12개 별방이 아니라 출생 천궁도 하나로 읽어요.'
      : '생년월일시로 태양·달·어센던트와 행성 7개의 하우스를 계산합니다. 자미두수와는 다른 체계 — 12궁 명반이 아니라 출생 천궁도(네이탈 차트)로 읽습니다.',
    cta: isCharacter ? '내 천궁도 열기' : '무료로 천궁도 보기',
  };

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-24 top-8 h-[320px] w-[320px] rounded-full opacity-70" style={{ background: 'radial-gradient(closest-side, rgba(143,111,224,0.28), transparent 70%)' }} />
        <div className="relative mx-auto max-w-5xl px-5 pt-8 sm:px-8 sm:pt-12">
          <div className="grid items-center gap-6 sm:grid-cols-[1.05fr_0.95fr] sm:gap-8">
            <div className="animate-rise">
              <span className="t-chip !py-1.5 !text-[12.5px]" style={{ color: 'var(--accent-deep)' }}>
                <span aria-hidden="true">✶</span> {t.eyebrow}
              </span>
              <h1 className="t-display mt-4 text-[26px] leading-[1.45] sm:text-[38px]">
                {t.h1a}
                <br />
                {t.h1b}
                <span className="ml-1 align-middle text-[18px]" style={{ color: 'var(--accent)' }} aria-hidden="true">
                  ✶
                </span>
              </h1>
              <p className="mt-3 max-w-[360px] text-[14.5px] leading-[1.9] t-muted">{t.desc}</p>

              <div className="mt-5 flex flex-wrap items-center gap-2.5">
                <a href="#western-chart" className="t-btn t-btn-primary px-5 py-3 text-[14px]">
                  {t.cta}
                  <span aria-hidden="true">→</span>
                </a>
              </div>

              <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-[13px] t-faint">
                <span>✧ 태양 · 달 · 어센던트</span>
                <span>✧ 행성 7개</span>
                <span>✧ 12하우스</span>
              </div>
            </div>

            <div className="relative mx-auto flex flex-col items-center">
              <div
                className="rounded-[28px] p-3"
                style={{ background: 'var(--field-bg)', border: '1px solid var(--line)' }}
              >
                <NatalWheel size={236} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 세 개의 좌표 */}
      <section className="mx-auto mt-10 max-w-5xl px-5 sm:px-8">
        <SectionLabel index="✶">THREE POINTS</SectionLabel>
        <h2 className="t-display mt-3 text-[22px] leading-[1.45] sm:text-[24px]">
          {isCharacter ? '태양 · 달 · 어센던트, 세 개만 봐도 달라' : '태양 · 달 · 어센던트, 세 좌표가 기본입니다'}
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {[
            {
              glyph: '☉',
              label: '태양 자리',
              means: '나의 중심과 의지',
              body: isCharacter
                ? '겉으로 보이는 성격이 아니라, 결국 어떤 사람이 되려는지를 보여줘요.'
                : '겉으로 드러난 성격이 아니라, 결국 어떤 사람이 되려는지.',
            },
            {
              glyph: '☾',
              label: '달 자리',
              means: '감정과 안전 욕구',
              body: isCharacter
                ? '혼자 있을 때의 기분, 위로받고 싶은 방식이 여기에 있어요.'
                : '혼자 있을 때의 기분과 위로받는 방식이 여기에 있습니다.',
            },
            {
              glyph: 'ASC',
              label: '어센던트',
              means: '첫인상과 시작 방식',
              body: isCharacter
                ? '처음 만난 사람이 느끼는 나의 온도예요. 태어난 시간까지 알아야 정확해져요.'
                : '처음 만난 사람이 느끼는 인상. 태어난 시간까지 알아야 정확해집니다.',
            },
          ].map((c) => (
            <div key={c.label} className="t-card p-5">
              <div className="flex items-center justify-between">
                <span className="text-[22px]" style={{ color: 'var(--accent)' }} aria-hidden="true">
                  {c.glyph}
                </span>
              </div>
              <p className="t-title mt-3 text-[17px]">{c.label}</p>
              <p className="mt-0.5 text-[12.5px] tracking-[0.12em] t-faint">{c.means}</p>
              <p className="mt-2 text-[13.5px] leading-[1.85] t-muted">{c.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 입력 */}
      <section id="western-chart" className="mx-auto mt-12 max-w-5xl scroll-mt-20 px-5 sm:px-8">
        <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div className="order-2 lg:order-1">
            <SectionLabel index="✶">YOUR SKY</SectionLabel>
            <h2 className="t-display mt-3 text-[23px] leading-[1.5]">
              {isCharacter ? (
                <>
                  하늘은 이미 그려져 있어요.
                  <br />
                  <span style={{ color: 'var(--accent)' }}>좌표만</span> 알려 주세요.
                </>
              ) : (
                <>
                  하늘은 이미 그려져 있습니다.
                  <br />
                  <span style={{ color: 'var(--accent)' }}>좌표만</span> 알려주세요.
                </>
              )}
            </h2>
            <p className="mt-3 max-w-[330px] text-[14px] leading-[1.9] t-muted">
              {isCharacter
                ? '자미두수와 같은 생년월일시를 써서, 이번에는 서양 방식으로 다시 그려요. 태어난 시간을 모르면 어센던트는 정오 기준으로 계산돼요.'
                : '자미두수와 같은 생년월일시를 사용하되, 계산과 해석은 서양 방식으로 다시 합니다. 시간을 모르면 어센던트는 정오 기준입니다.'}
            </p>
            <div className="mt-5 space-y-2.5">
              {[
                isCharacter ? '태양·달·어센던트 세 좌표' : '태양·달·어센던트 세 좌표',
                isCharacter ? '행성 7개의 자리와 하우스' : '행성 7개의 자리와 12하우스',
                isCharacter ? '금전·연애·일 3지수와 주요 각' : '금전·연애·일 3지수와 주요 각',
              ].map((line, i) => (
                <p key={line} className="flex items-center gap-2 text-[13.5px] t-muted">
                  <span
                    className="flex h-5 w-5 items-center justify-center rounded-full text-[12px]"
                    style={{ background: 'var(--accent-soft)', color: 'var(--accent-deep)' }}
                  >
                    {i + 1}
                  </span>
                  {line}
                </p>
              ))}
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <BirthForm onSubmit={onSubmit} mode="western" />
          </div>
        </div>
      </section>

      {/* 두 체계 비교 */}
      <section className="mx-auto mt-12 max-w-5xl px-5 sm:px-8">
        <div className="t-card p-5 sm:p-7">
          <div className="flex items-center gap-2">
            <StarMark className="h-3 w-3" />
            <h2 className="t-display text-[19px]">두 체계는 이렇게 다릅니다</h2>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl p-4" style={{ background: 'var(--field-bg)', border: '1px solid var(--line)' }}>
              <p className="text-[12.5px] tracking-[0.16em] t-faint">東洋 · 자미두수</p>
              <p className="t-title mt-1.5 text-[16px]">{isCharacter ? '12개 별방 · 14개의 별' : '12궁 명반 · 14주성'}</p>
              <ul className="mt-2 space-y-1 text-[13px] leading-[1.75] t-muted">
                {isCharacter ? (
                  <>
                    <li>· 생년월일시로 열두 칸 별지도를 세움</li>
                    <li>· 별이 앉은 방으로 읽음</li>
                    <li>· 별빛 네 개 · 10년 흐름 · 올해 흐름</li>
                    <li>· 해석 단위: 나라는 방·돈의 방·사랑의 방 같은 12개 별방</li>
                  </>
                ) : (
                  <>
                    <li>· 생년월일시로 12칸 명반을 세움</li>
                    <li>· 별(주성)이 앉은 자리로 읽음</li>
                    <li>· 사화·대한·유년의 흐름</li>
                    <li>· 해석 단위: 명궁·재백궁·부처궁 같은 12궁</li>
                  </>
                )}
              </ul>
            </div>
            <div className="rounded-2xl p-4" style={{ background: 'var(--accent-soft)', border: '1px solid var(--line-strong)' }}>
              <p className="text-[12.5px] tracking-[0.16em]" style={{ color: 'var(--accent-deep)' }}>
                西洋 · 점성술
              </p>
              <p className="t-title mt-1.5 text-[16px]">출생 천궁도 · 행성 하우스</p>
              <ul className="mt-2 space-y-1 text-[13px] leading-[1.75] t-muted">
                <li>· 태어난 순간의 하늘을 그대로 그림</li>
                <li>· 태양·달·어센던트 + 행성 7개</li>
                <li>· 행성이 놓인 하우스·각(애스펙트)</li>
                <li>· 해석 단위: 1~12하우스(삶의 영역)</li>
              </ul>
            </div>
          </div>
          <p className="mt-3 text-[13px] leading-[1.8] t-faint">
            같은 사람을 두 방식으로 읽기 때문에 결과가 다르게 나오는 게 정상입니다. 한쪽만 사도 되고, 두 리포트를
            함께 보는 통합 리포트도 있습니다.
          </p>
        </div>
      </section>

      {/* 상품 */}
      <section id="western-reports" className="mx-auto mt-12 max-w-5xl scroll-mt-20 px-5 sm:px-8">
        <SectionLabel index="✶">WESTERN REPORTS</SectionLabel>
        <h2 className="t-display mt-3 text-[23px]">
          {isCharacter ? '서양 점성술 리포트' : '서양 점성술 리포트 세 가지'}
        </h2>
        <p className="mt-2 max-w-[380px] text-[14px] leading-[1.9] t-muted">
          자미두수 리포트와는 별개 상품이에요. 여기서 결제하는 것은 <b style={{ color: 'var(--accent-deep)' }}>천궁도</b> 리포트예요.
        </p>

        <div className="mt-5 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {WESTERN_PRODUCTS.map((p) => (
            <div
              key={p.id}
              className="flex flex-col p-5"
              style={
                p.id === 'bundle'
                  ? { borderRadius: '24px', background: 'var(--panel-bg, #12101f)', border: '1px solid var(--line-strong)' }
                  : { borderRadius: '24px', background: 'var(--card-2)', border: '1px solid var(--line)' }
              }
            >
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="t-title text-[17px]">{p.name}</h3>
                {productBadge(p, theme) && <span className="t-chip !text-[12.5px]">{productBadge(p, theme)}</span>}
              </div>
              <p className="mt-1 text-[13px] t-muted">{productTagline(p, theme)}</p>
              <div className="mt-3">
                <PriceTag product={p} variant="card" />
              </div>
              <ul className="mt-3 flex-1 space-y-1.5 text-[13px] leading-relaxed t-muted">
                {productPoints(p, theme).slice(0, 4).map((pt) => (
                  <li key={pt} className="flex gap-1.5">
                    <span style={{ color: 'var(--accent)' }}>✧</span>
                    {pt}
                  </li>
                ))}
              </ul>
              {productScopeShort(p, theme) && (
                <p className="mt-2 text-[12.5px] leading-[1.65] t-faint">{productScopeShort(p, theme)}</p>
              )}
              <button onClick={() => onProduct(p.id)} className="t-btn t-btn-primary mt-4 w-full py-2.5 text-[13.5px]">
                {productCta(p, theme)}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto mt-12 max-w-5xl px-5 sm:px-8">
        <div className="t-card p-5 sm:p-7">
          <h2 className="t-display text-[19px]">서양 점성술, 이건 알아두세요</h2>
          <div className="mt-3 divide-y" style={{ borderColor: 'var(--line)' }}>
            {[
              {
                q: '자미두수랑 같은 입력인가요?',
                a: '네. 생년월일시 하나로 두 체계를 모두 계산합니다. 다만 해석 방식이 완전히 달라서 결과 화면도 따로 나옵니다.',
              },
              {
                q: '태어난 시간을 모르면?',
                a: '태양·달·행성 자리는 그대로 나오고, 어센던트와 하우스만 정오 기준으로 계산됩니다. 시간을 알면 훨씬 정확해집니다.',
              },
              {
                q: '출생지는 어디로 계산하나요?',
                a: '지금은 서울(37.57°N, 126.98°E) 기준입니다. 국내 출생이면 오차가 작지만, 해외 출생이면 어센던트가 달라질 수 있습니다.',
              },
              {
                q: '결제하면 뭐가 열려요?',
                a: '태양·달·어센던트 해설, 행성 7개의 자리와 하우스, 12하우스 전체 풀이, 주요 각 해석까지 열립니다. 자미두수 리포트는 별도 상품입니다.',
              },
            ].map((f) => (
              <details key={f.q} className="group py-3.5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-[14.5px] font-medium t-body">
                  {f.q}
                  <span className="text-[16px] transition group-open:rotate-45" style={{ color: 'var(--accent)' }}>
                    +
                  </span>
                </summary>
                <p className="mt-2 pr-6 text-[13.5px] leading-[1.9] t-muted">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
