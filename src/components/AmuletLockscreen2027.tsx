import type { ChartModel } from '../lib/chart';
import type { NewYear2027Content } from '../lib/newyear2027';
import { AMULET_FONTS, cornerMotifPaths, estimateWidth } from '../lib/amuletArt';
import {
  LOCK_ART,
  LOCK_CARD,
  LOCK_LAYOUT,
  amuletLockArtUrl,
  amuletLockThemeFor,
  lockAdviceLayout,
  lockChipLayout,
  lockLines,
  type AmuletLockTheme,
} from '../lib/amuletLockscreen';

type Props = {
  chart: ChartModel;
  content: NewYear2027Content;
  className?: string;
  /** 부적 배경 장면 — 지정하지 않으면 수호별에 맞는 장면을 자동으로 고릅니다. */
  artTheme?: AmuletLockTheme;
};

/**
 * 2027 부적 — 폰 잠금화면(9:16) 카드 · 화면용 SVG.
 * 하온과 오드아이 별빛 고양이 일러스트 위에 금박 제목·2027 배지·키워드·조언을 올립니다.
 * 저장 이미지(amuletLockscreen.ts, canvas 1080×1920)와 같은 좌표·문구를 씁니다.
 * (2026-11-25 @kooleumi8 피드백 6번 · 굿즈/원석 칸 없음)
 */
export default function AmuletLockscreen2027({ chart, content, className, artTheme }: Props) {
  const L = LOCK_LAYOUT;
  const T = lockLines(chart, content);
  const theme = artTheme ?? amuletLockThemeFor(chart.primaryStar, chart.fiveElements);
  const A = { ...LOCK_ART, url: amuletLockArtUrl(theme) };
  const { cx } = LOCK_CARD;

  const chips = lockChipLayout(content.keywords);
  const advice = lockAdviceLayout(content.advice);

  const brandW = estimateWidth(T.brand, L.brand.size) + L.brand.tracking * Math.max(0, T.brand.length - 1);
  const dl = cx - brandW / 2 - L.brandRule.diamondGap;
  const dr = cx + brandW / 2 + L.brandRule.diamondGap;

  const yearW = estimateWidth(T.badgeYear, L.badge.font);
  const hanjaW = estimateWidth(T.badgeHanja, L.badge.hanja);
  const badgeTotal = yearW + L.badge.gap + hanjaW;
  const badgeStart = cx - badgeTotal / 2;

  const uid = 'amulet-lock';

  return (
    <svg
      viewBox={`0 0 ${LOCK_CARD.w} ${LOCK_CARD.h}`}
      className={className}
      role="img"
      aria-label={`2027 정미년 부적 카드 — ${chart.primaryStar}별, ${theme.label} 배경, 하온과 별빛 고양이`}
      style={{ display: 'block', width: '100%', height: 'auto' }}
    >
      <defs>
        <linearGradient id={`${uid}-paper`} x1="0" y1="0" x2="0.22" y2="1">
          <stop offset="0%" stopColor="#fdf7ea" />
          <stop offset="55%" stopColor="#f7ecd8" />
          <stop offset="100%" stopColor="#eedcc0" />
        </linearGradient>

        <linearGradient id={`${uid}-gold`} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor="#f4e1b2" />
          <stop offset="46%" stopColor="#b98a34" />
          <stop offset="100%" stopColor="#7d5718" />
        </linearGradient>

        <linearGradient id={`${uid}-band`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(253,247,234,0.93)" />
          <stop offset="35%" stopColor="rgba(250,241,226,0.97)" />
          <stop offset="100%" stopColor="rgba(244,232,210,0.99)" />
        </linearGradient>

        <linearGradient id={`${uid}-top`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={`rgba(${theme.scrim.rgb},${theme.scrim.top})`} />
          <stop offset="62%" stopColor={`rgba(${theme.scrim.rgb},${theme.scrim.mid})`} />
          <stop offset="100%" stopColor={`rgba(${theme.scrim.rgb},0)`} />
        </linearGradient>

        <clipPath id={`${uid}-art`}>
          <rect x={A.x} y={A.y} width={A.w} height={A.h} rx={A.r} />
        </clipPath>

        <clipPath id={`${uid}-band-clip`}>
          <rect x={A.x} y={L.band.y} width={A.w} height={L.band.h} />
        </clipPath>
      </defs>

      {/* 한지 바탕 */}
      <rect width={LOCK_CARD.w} height={LOCK_CARD.h} fill={`url(#${uid}-paper)`} />

      {/* 일러스트 — 하온 + 오드아이 별빛 고양이 */}
      <g clipPath={`url(#${uid}-art)`}>
        <image
          href={A.url}
          x={A.x}
          y={A.y}
          width={A.w}
          height={A.h}
          preserveAspectRatio="xMidYMid slice"
        />
        {/* 위쪽 하늘 — 금박 글자가 읽히도록 장면 밝기에 맞춰 덮습니다 */}
        <rect x={A.x} y={A.y} width={A.w} height={theme.scrim.height} fill={`url(#${uid}-top)`} />
      </g>

      {/* 아래 한지 띠 */}
      <g clipPath={`url(#${uid}-band-clip)`}>
        <rect x={A.x} y={L.band.y} width={A.w} height={L.band.h} fill={`url(#${uid}-band)`} />
        {/* 한지 섬유 결 */}
        <g stroke="rgba(150,112,58,0.10)" strokeWidth={0.4} strokeLinecap="round">
          {Array.from({ length: 26 }, (_, i) => {
            const x = A.x + ((i * 79 + 23) % A.w);
            const y = L.band.y + 8 + ((i * 37) % (L.band.h - 16));
            return <line key={i} x1={x} y1={y} x2={x + 8 + (i % 7)} y2={y + ((i % 5) - 2) * 1.2} />;
          })}
        </g>
      </g>

      {/* 금박 이중 테두리 */}
      <g fill="none">
        <rect
          x={14}
          y={14}
          width={LOCK_CARD.w - 28}
          height={LOCK_CARD.h - 28}
          rx={20}
          stroke={`url(#${uid}-gold)`}
          strokeWidth={2.2}
        />
        <rect
          x={21}
          y={21}
          width={LOCK_CARD.w - 42}
          height={LOCK_CARD.h - 42}
          rx={15}
          stroke="rgba(172,130,64,0.5)"
          strokeWidth={0.7}
        />
      </g>

      {/* 모서리 구름 장식 */}
      <g fill="none" stroke={`url(#${uid}-gold)`} strokeWidth={1.15} strokeLinecap="round" strokeLinejoin="round" opacity={0.9}>
        {[
          'translate(22,22) scale(0.62)',
          `translate(${LOCK_CARD.w - 22},22) scale(-0.62,0.62)`,
          `translate(22,${LOCK_CARD.h - 22}) scale(0.62,-0.62)`,
          `translate(${LOCK_CARD.w - 22},${LOCK_CARD.h - 22}) scale(-0.62,-0.62)`,
        ].map((t) => (
          <g key={t} transform={t}>
            {cornerMotifPaths().map((d, i) => (
              <path key={i} d={d} />
            ))}
          </g>
        ))}
      </g>

      {/* 띠 위쪽 금선 */}
      <g fill="none" stroke="rgba(150,112,58,0.55)" strokeWidth={0.8}>
        <line x1={A.x + 10} y1={L.band.y} x2={cx - 16} y2={L.band.y} />
        <line x1={cx + 16} y1={L.band.y} x2={A.x + A.w - 10} y2={L.band.y} />
      </g>
      <g transform={`translate(${cx} ${L.band.y}) rotate(45)`}>
        <rect x={-2.8} y={-2.8} width={5.6} height={5.6} fill="#b9892f" />
      </g>

      {/* 머리글 — 브랜드 */}
      <g>
        <line
          x1={L.brandRule.edgeX}
          y1={L.brandRule.y}
          x2={dl - L.brandRule.lineGap}
          y2={L.brandRule.y}
          stroke="rgba(240,214,160,0.7)"
          strokeWidth={0.7}
        />
        <line
          x1={dr + L.brandRule.lineGap}
          y1={L.brandRule.y}
          x2={LOCK_CARD.w - L.brandRule.edgeX}
          y2={L.brandRule.y}
          stroke="rgba(240,214,160,0.7)"
          strokeWidth={0.7}
        />
        {[dl, dr].map((x) => (
          <g key={x} transform={`translate(${x} ${L.brandRule.y}) rotate(45)`}>
            <rect
              x={-L.brandRule.diamondR}
              y={-L.brandRule.diamondR}
              width={L.brandRule.diamondR * 2}
              height={L.brandRule.diamondR * 2}
              fill="#e9c98a"
            />
          </g>
        ))}
        <text
          x={cx}
          y={L.brand.y}
          textAnchor="middle"
          fill="#fff7e8"
          fontFamily={AMULET_FONTS.serif}
          fontSize={L.brand.size}
          fontWeight={600}
          letterSpacing={L.brand.tracking}
          style={{ filter: 'drop-shadow(0 1px 3px rgba(16,10,30,0.55))' }}
        >
          {T.brand}
        </text>
        <text
          x={cx}
          y={L.eyebrow.y}
          textAnchor="middle"
          fill="#f0d9a8"
          fontFamily={AMULET_FONTS.sans}
          fontSize={L.eyebrow.size}
          letterSpacing={L.eyebrow.tracking}
        >
          {T.eyebrow}
        </text>
      </g>

      {/* 2027 · 丁未 배지 */}
      <g>
        <rect
          x={cx - L.badge.w / 2}
          y={L.badge.cy - L.badge.h / 2}
          width={L.badge.w}
          height={L.badge.h}
          rx={L.badge.h / 2}
          fill="rgba(20,14,40,0.52)"
          stroke="rgba(233,201,138,0.85)"
          strokeWidth={0.9}
        />
        <text
          x={badgeStart}
          y={L.badge.cy + L.badge.font * 0.35}
          fill="#ffeecb"
          fontFamily={AMULET_FONTS.serif}
          fontSize={L.badge.font}
          fontWeight={700}
        >
          {T.badgeYear}
        </text>
        <rect
          x={badgeStart + yearW + L.badge.gap / 2 - 0.4}
          y={L.badge.cy - 8}
          width={0.8}
          height={16}
          fill="rgba(233,201,138,0.75)"
        />
        <text
          x={badgeStart + yearW + L.badge.gap}
          y={L.badge.cy + L.badge.hanja * 0.35}
          fill="#ffeecb"
          fontFamily={AMULET_FONTS.serif}
          fontSize={L.badge.hanja}
          fontWeight={500}
        >
          {T.badgeHanja}
        </text>
      </g>

      {/* 해의 이름 · 이름 · 수호별 */}
      <text
        x={cx}
        y={L.yearLine.y}
        textAnchor="middle"
        fill="#fff7e8"
        fontFamily={AMULET_FONTS.serif}
        fontSize={L.yearLine.size}
        fontWeight={600}
        letterSpacing={L.yearLine.tracking}
        style={{ filter: 'drop-shadow(0 1px 4px rgba(16,10,30,0.5))' }}
      >
        {T.yearLine}
      </text>
      <text
        x={cx}
        y={L.owner.y}
        textAnchor="middle"
        fill="rgba(255,247,232,0.92)"
        fontFamily={AMULET_FONTS.serif}
        fontSize={L.owner.size}
        fontWeight={500}
      >
        {T.owner}
      </text>
      <text
        x={cx}
        y={L.star.y}
        textAnchor="middle"
        fill="rgba(255,247,232,0.78)"
        fontFamily={AMULET_FONTS.sans}
        fontSize={L.star.size}
        letterSpacing={0.5}
      >
        {T.star}
      </text>

      {/* 인장 */}
      <g transform={`translate(${L.seal.x} ${L.seal.y}) rotate(-5)`}>
        <rect
          x={-L.seal.box / 2}
          y={-L.seal.box / 2}
          width={L.seal.box}
          height={L.seal.box}
          rx={4}
          fill="#9d3a33"
        />
        <rect
          x={-L.seal.box / 2 + 4}
          y={-L.seal.box / 2 + 4}
          width={L.seal.box - 8}
          height={L.seal.box - 8}
          rx={2.5}
          fill="none"
          stroke="rgba(255,236,228,0.7)"
          strokeWidth={0.9}
        />
        <text
          x={0}
          y={8}
          textAnchor="middle"
          fill="#fdeee6"
          fontFamily={AMULET_FONTS.serif}
          fontSize={L.seal.font}
          fontWeight={700}
        >
          {T.seal}
        </text>
      </g>

      {/* 키워드 칩 */}
      <g>
        {content.keywords.map((k, i) => {
          const w = chips.widths[i];
          const x = chips.startX + chips.widths.slice(0, i).reduce((a, b) => a + b, 0) + L.chips.gap * i;
          return (
            <g key={k}>
              <rect
                x={x}
                y={L.chips.y}
                width={w}
                height={L.chips.h}
                rx={L.chips.h / 2}
                fill="rgba(255,252,244,0.7)"
                stroke="rgba(178,138,74,0.55)"
                strokeWidth={0.8}
              />
              <g transform={`translate(${x + L.chips.dotX} ${L.chips.y + L.chips.h / 2}) rotate(45)`}>
                <rect x={-L.chips.dotR} y={-L.chips.dotR} width={L.chips.dotR * 2} height={L.chips.dotR * 2} fill="#b9892f" />
              </g>
              <text
                x={x + L.chips.textX}
                y={L.chips.y + L.chips.baseline}
                fill="#43304f"
                fontFamily={AMULET_FONTS.round}
                fontSize={chips.font}
              >
                {k}
              </text>
            </g>
          );
        })}
      </g>

      {/* 한 줄 조언 */}
      <g fill="#43304f" fontFamily={AMULET_FONTS.serif} fontSize={advice.size} textAnchor="middle">
        {advice.lines.map((line, i) => (
          <text key={i} x={cx} y={L.advice.y + i * L.advice.lh}>
            {line}
          </text>
        ))}
      </g>

      {/* 푸터 */}
      <text
        x={L.footer.insets}
        y={L.footer.textY}
        fill="rgba(67,48,79,0.72)"
        fontFamily={AMULET_FONTS.sans}
        fontSize={L.footer.size}
      >
        {T.footerDate}
      </text>
      <text
        x={LOCK_CARD.w - L.footer.insets}
        y={L.footer.textY}
        textAnchor="end"
        fill="#8a6323"
        fontFamily={AMULET_FONTS.serif}
        fontSize={L.footer.brandSize}
        fontWeight={600}
        letterSpacing={0.8}
      >
        {T.brand}
      </text>
      <text
        x={cx}
        y={L.disclaimer.y}
        textAnchor="middle"
        fill="rgba(67,48,79,0.62)"
        fontFamily={AMULET_FONTS.sans}
        fontSize={L.disclaimer.size}
      >
        {T.disclaimer}
      </text>
    </svg>
  );
}
