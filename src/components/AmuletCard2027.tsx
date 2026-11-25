import type { ChartModel } from '../lib/chart';
import AmuletLockscreen2027 from './AmuletLockscreen2027';
import type { NewYear2027Content } from '../lib/newyear2027';
import { STAR_HANJA } from '../lib/terms';
import { starVisual } from '../lib/starPalette';
import type { ThemeId } from '../lib/theme';
import {
  AMULET_FONTS,
  CARD,
  CAT_PORTRAIT,
  CONSTELLATION_STARS,
  LAYOUT,
  adviceLayout,
  amuletLines,
  amuletPalette,
  chipLayout,
  cloudBandTiles,
  cloudTilePaths,
  constellationPaths,
  cornerMotifPaths,
  estimateWidth,
  fitFont,
  hanjiFibers,
  petalsPath,
  raysPath,
  scallopPath,
  stardustDots,
} from '../lib/amuletArt';

type Props = {
  chart: ChartModel;
  content: NewYear2027Content;
  theme: ThemeId;
  className?: string;
};

/** 작은 마름모 (✧ 대신 그립니다 — 어떤 기기에서도 글자 깨짐 없이) */
function Diamond({ x, y, r, fill }: { x: number; y: number; r: number; fill: string }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(45)`}>
      <rect x={-r} y={-r} width={r * 2} height={r * 2} fill={fill} />
    </g>
  );
}

/**
 * 별빛 고양이 수호 초상 — 금박 이중 테두리 안에 오드아이 고양이를 앉힙니다.
 * 화면(SVG)과 저장 이미지(canvas)가 같은 자리·같은 반지름을 씁니다.
 */
function CatPortrait({ uid }: { uid: string }) {
  const { cx, cy, r, ring, url } = CAT_PORTRAIT;
  return (
    <g>
      <defs>
        <clipPath id={`${uid}-cat`}>
          <circle cx={cx} cy={cy} r={r} />
        </clipPath>
        <radialGradient id={`${uid}-cat-shade`} gradientUnits="userSpaceOnUse" cx={cx} cy={cy - 10} r={r * 1.4}>
          <stop offset="55%" stopColor="rgba(253,247,234,0)" />
          <stop offset="100%" stopColor="rgba(253,247,234,0.34)" />
        </radialGradient>
      </defs>
      <circle cx={cx} cy={cy} r={r + ring + 2} fill="rgba(255,252,243,0.5)" />
      <image
        href={url}
        x={cx - r}
        y={cy - r}
        width={r * 2}
        height={r * 2}
        preserveAspectRatio="xMidYMid slice"
        clipPath={`url(#${uid}-cat)`}
        opacity={0.94}
      />
      <circle cx={cx} cy={cy} r={r} fill={`url(#${uid}-cat-shade)`} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e9d8b4" strokeWidth={1} opacity={0.85} />
      <circle cx={cx} cy={cy} r={r + ring} fill="none" stroke={`url(#${uid}-frame)`} strokeWidth={1.2} opacity={0.9} />
    </g>
  );
}

/**
 * 2027 정미년 부적 카드 (화면용 SVG)
 * 한지 바탕 · 구름문 · 연꽃 메달리온 · 금박 이중 프레임 · 인장.
 * 저장 이미지(amuletCard.ts, canvas)가 같은 팔레트·문양 path·LAYOUT 좌표를 그대로 씁니다.
 * 모바일에서 확대 없이 읽히도록 한글 본문을 크게 잡았습니다.
 */
export default function AmuletCard2027({ chart, content, theme, className }: Props) {
  /* 별의 속삭임(캐릭터)은 9:16 잠금화면 카드로 그립니다 (2026-11-25 피드백 6번).
     자미원(미스틱) 카드는 기존 그대로입니다. */
  if (theme === 'character') {
    return <AmuletLockscreen2027 chart={chart} content={content} className={className} />;
  }
  const p = amuletPalette(theme, chart.primaryStar);
  const v = starVisual(chart.primaryStar);
  const L = amuletLines(chart, content, theme);
  const isMystic = theme === 'mystic';
  const uid = `amulet-${theme}`;

  const { cx } = CARD;
  const { medal, chips, advice, stoneLabel, gem, stoneName, stoneNote, seal, footer, side, hanja } = LAYOUT;
  const cy = medal.cy;

  /* 키워드 칩 (화면·이미지 공용 배치) */
  const chip = chipLayout(content.keywords);
  /* 브랜드 이름 폭에 맞춰 양옆 장식선을 붙입니다 */
  const brandW =
    estimateWidth(L.brand, LAYOUT.brand.size) + LAYOUT.brand.tracking * Math.max(0, L.brand.length - 1);
  const diamondLeft = cx - brandW / 2 - LAYOUT.brandRule.diamondGap;
  const diamondRight = cx + brandW / 2 + LAYOUT.brandRule.diamondGap;
  const stoneNameSize = fitFont(content.stone.name, stoneName.maxWidth, stoneName.size);
  const stoneNoteSize = fitFont(L.stoneNote, stoneNote.maxWidth, stoneNote.size);

  const adviceFit = adviceLayout(content.advice);
  const adviceLines = adviceFit.lines;
  const starHanja = (STAR_HANJA[chart.primaryStar] ?? '').split('').slice(0, 2);
  const sideLeft = starHanja;
  const sideRight = L.sideRight.split('');
  const sideY = (count: number, i: number) => cy - ((count - 1) * side.gap) / 2 + i * side.gap;

  /* 수호 원석 — 다면 컷 보석 */
  const gemR = gem.r;
  const hex = Array.from({ length: 6 }, (_, i) => {
    const a = ((-90 + i * 60) * Math.PI) / 180;
    return [gem.x + Math.cos(a) * gemR, gem.y + Math.sin(a) * gemR * 0.95] as [number, number];
  });
  const hexPath = hex.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`).join(' ') + ' Z';

  return (
    <svg
      viewBox={`0 0 ${CARD.w} ${CARD.h}`}
      className={className}
      role="img"
      aria-label={`2027 정미년 신년 부적 카드 — ${chart.primaryStar}성`}
      style={{ display: 'block', width: '100%', height: 'auto' }}
    >
      <defs>
        <linearGradient id={`${uid}-paper`} x1="0" y1="0" x2="0.22" y2="1">
          <stop offset="0%" stopColor={p.paper[0]} />
          <stop offset="52%" stopColor={p.paper[1]} />
          <stop offset="100%" stopColor={p.paper[2]} />
        </linearGradient>

        <radialGradient id={`${uid}-glow`} gradientUnits="userSpaceOnUse" cx={cx} cy={170} r={330}>
          <stop offset="0%" stopColor={p.paperGlow} />
          <stop offset="100%" stopColor={isMystic ? 'rgba(112,90,190,0)' : 'rgba(255,240,214,0)'} />
        </radialGradient>

        <radialGradient id={`${uid}-vignette`} gradientUnits="userSpaceOnUse" cx={cx} cy={405} r={500}>
          <stop offset="55%" stopColor="rgba(0,0,0,0)" />
          <stop offset="100%" stopColor={p.vignette} />
        </radialGradient>

        <radialGradient id={`${uid}-starwash`} gradientUnits="userSpaceOnUse" cx={430} cy={650} r={260}>
          <stop offset="0%" stopColor={p.starWash} />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </radialGradient>

        <linearGradient id={`${uid}-gold`} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor={p.gold[0]} />
          <stop offset="46%" stopColor={p.gold[1]} />
          <stop offset="100%" stopColor={p.gold[2]} />
        </linearGradient>

        <linearGradient id={`${uid}-frame`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={p.frame[0]} />
          <stop offset="46%" stopColor={p.frame[1]} />
          <stop offset="100%" stopColor={p.frame[2]} />
        </linearGradient>

        <radialGradient
          id={`${uid}-medallion`}
          gradientUnits="userSpaceOnUse"
          cx={cx}
          cy={cy - 40}
          r={medal.r + 24}
        >
          <stop offset="0%" stopColor={p.medallionFill} />
          <stop offset="100%" stopColor={isMystic ? 'rgba(255,255,255,0.02)' : 'rgba(252,244,228,0.9)'} />
        </radialGradient>

        <radialGradient id={`${uid}-gem`} gradientUnits="userSpaceOnUse" cx={gem.x - 5} cy={gem.y - 6} r={gemR * 1.6}>
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="38%" stopColor={content.stone.colorHex} />
          <stop offset="100%" stopColor={isMystic ? 'rgba(8,6,14,0.96)' : 'rgba(86,64,38,0.94)'} />
        </radialGradient>

        <linearGradient
          id={`${uid}-hanja`}
          gradientUnits="userSpaceOnUse"
          x1={0}
          y1={cy - 66}
          x2={0}
          y2={cy + 84}
        >
          <stop offset="0%" stopColor={p.hanjaGold[0]} />
          <stop offset="42%" stopColor={p.hanjaGold[1]} />
          <stop offset="100%" stopColor={p.hanjaGold[2]} />
        </linearGradient>

        {/* 한지 섬유 */}
        <pattern id={`${uid}-fiber`} width={140} height={140} patternUnits="userSpaceOnUse">
          {hanjiFibers()
            .filter(([x, y]) => x < 140 && y < 140)
            .map(([x, y, len, rot, a], i) => (
              <line
                key={i}
                x1={x}
                y1={y}
                x2={x + len}
                y2={y + len * Math.tan((rot * Math.PI) / 180)}
                stroke={p.fiber}
                strokeWidth={0.55}
                strokeOpacity={Math.min(0.55, a * 1.6)}
                strokeLinecap="round"
              />
            ))}
        </pattern>
      </defs>

      {/* 한지 바탕 */}
      <rect width={CARD.w} height={CARD.h} fill={`url(#${uid}-paper)`} />
      <rect width={CARD.w} height={CARD.h} fill={`url(#${uid}-glow)`} />
      <rect width={CARD.w} height={CARD.h} fill={`url(#${uid}-starwash)`} />
      <rect width={CARD.w} height={CARD.h} fill={`url(#${uid}-fiber)`} />

      {/* 미스틱 — 별자리 새김 */}
      {isMystic && (
        <g>
          <path d={constellationPaths()} fill="none" stroke={p.pattern} strokeWidth={0.7} strokeLinejoin="round" />
          {CONSTELLATION_STARS.map(([x, y, r], i) => (
            <circle key={i} cx={x} cy={y} r={r} fill={p.gold[1]} fillOpacity={0.55} />
          ))}
        </g>
      )}

      {/* 캐릭터 — 별빛 고양이 수호 초상 (왼쪽 위 여백) */}
      {!isMystic && <CatPortrait uid={uid} />}

      {/* 별가루 */}
      <g>
        {stardustDots().map(([x, y, r, a], i) => (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={r}
            fill={i % 4 === 0 ? p.gold[1] : isMystic ? 'rgba(255,250,238,1)' : '#fffdf6'}
            fillOpacity={isMystic ? Math.min(0.95, a + 0.1) : a}
          />
        ))}
      </g>

      {/* 구름 띠 — 제목 아래 */}
      <g fill="none" stroke={p.pattern} strokeWidth={0.8} strokeLinecap="round">
        {cloudBandTiles(46, CARD.w - 46).map(({ x, alpha }) =>
          alpha <= 0.02 ? null : (
            <g key={x} transform={`translate(${x} ${LAYOUT.cloudBand.y})`} opacity={alpha * (isMystic ? 0.95 : 0.9)}>
              {cloudTilePaths().map((d, i) => (
                <path key={i} d={d} />
              ))}
            </g>
          ),
        )}
      </g>

      {/* 가장자리 눌린 결 */}
      <rect width={CARD.w} height={CARD.h} fill={`url(#${uid}-vignette)`} />

      {/* 금박 이중 프레임 */}
      <g fill="none">
        <rect
          x={22}
          y={22}
          width={CARD.w - 44}
          height={CARD.h - 44}
          rx={18}
          stroke={`url(#${uid}-frame)`}
          strokeWidth={2.4}
        />
        <rect x={30} y={30} width={CARD.w - 60} height={CARD.h - 60} rx={13} stroke={p.frameSoft} strokeWidth={0.8} />
        <rect
          x={36}
          y={36}
          width={CARD.w - 72}
          height={CARD.h - 72}
          rx={10}
          stroke={p.frameSoft}
          strokeWidth={0.4}
          strokeDasharray="1 5"
          opacity={0.7}
        />
      </g>

      {/* 모서리 구름 장식 */}
      <g fill="none" stroke={`url(#${uid}-frame)`} strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round">
        {[
          'translate(32,32)',
          `translate(${CARD.w - 32},32) scale(-1,1)`,
          `translate(32,${CARD.h - 32}) scale(1,-1)`,
          `translate(${CARD.w - 32},${CARD.h - 32}) scale(-1,-1)`,
        ].map((t) => (
          <g key={t} transform={t}>
            {cornerMotifPaths().map((d, i) => (
              <path key={i} d={d} />
            ))}
          </g>
        ))}
      </g>

      {/* 머리글 — 브랜드 */}
      <g>
        <line
          x1={LAYOUT.brandRule.edgeX}
          y1={LAYOUT.brandRule.y}
          x2={diamondLeft - LAYOUT.brandRule.lineGap}
          y2={LAYOUT.brandRule.y}
          stroke={p.frameSoft}
          strokeWidth={0.7}
        />
        <line
          x1={diamondRight + LAYOUT.brandRule.lineGap}
          y1={LAYOUT.brandRule.y}
          x2={CARD.w - LAYOUT.brandRule.edgeX}
          y2={LAYOUT.brandRule.y}
          stroke={p.frameSoft}
          strokeWidth={0.7}
        />
        <Diamond x={diamondLeft} y={LAYOUT.brandRule.y} r={LAYOUT.brandRule.diamondR} fill={p.gold[1]} />
        <Diamond x={diamondRight} y={LAYOUT.brandRule.y} r={LAYOUT.brandRule.diamondR} fill={p.gold[1]} />
        <text
          x={cx}
          y={LAYOUT.brand.y}
          textAnchor="middle"
          fill={p.ink}
          fontFamily={AMULET_FONTS.serif}
          fontSize={LAYOUT.brand.size}
          fontWeight={600}
          letterSpacing={LAYOUT.brand.tracking}
        >
          {L.brand}
        </text>
        <text
          x={cx}
          y={LAYOUT.eyebrow.y}
          textAnchor="middle"
          fill={p.goldSolid}
          fontFamily={AMULET_FONTS.sans}
          fontSize={LAYOUT.eyebrow.size}
          letterSpacing={LAYOUT.eyebrow.tracking}
        >
          {L.eyebrow}
        </text>
      </g>

      {/* 세로 한자 — 왼쪽: 명궁 주성 / 오른쪽: 守護符 */}
      <g fill={p.gold[1]} fontFamily={AMULET_FONTS.serif} fontSize={side.size} opacity={0.9}>
        {sideLeft.map((ch, i) => (
          <text key={`l${i}`} x={side.x} y={sideY(sideLeft.length, i)} textAnchor="middle">
            {ch}
          </text>
        ))}
        {sideRight.map((ch, i) => (
          <text key={`r${i}`} x={CARD.w - side.x} y={sideY(sideRight.length, i)} textAnchor="middle">
            {ch}
          </text>
        ))}
      </g>
      <g stroke={p.frameSoft} strokeWidth={0.5} opacity={0.85}>
        <line
          x1={side.ruleX}
          y1={sideY(sideLeft.length, 0) - 16}
          x2={side.ruleX}
          y2={sideY(sideLeft.length, sideLeft.length - 1) + 12}
        />
        <line
          x1={CARD.w - side.ruleX}
          y1={sideY(sideRight.length, 0) - 16}
          x2={CARD.w - side.ruleX}
          y2={sideY(sideRight.length, sideRight.length - 1) + 12}
        />
      </g>

      {/* 연꽃 메달리온 + 丁未 */}
      <g>
        <g fill="none" stroke={p.medallionLine} strokeLinecap="round">
          <path
            d={raysPath(cx, cy, medal.r + medal.rayPad, medal.r + medal.rayLen, 72)}
            strokeWidth={0.9}
          />
          <circle cx={cx} cy={cy} r={medal.r} strokeWidth={1.3} fill={`url(#${uid}-medallion)`} />
          <circle cx={cx} cy={cy} r={medal.r - 7} strokeWidth={0.5} />
          <path
            d={petalsPath(cx, cy, medal.inner - 18, medal.r - 10, 14)}
            stroke={p.patternStrong}
            strokeWidth={0.8}
          />
          <path d={scallopPath(cx, cy, medal.inner - 30, 26)} stroke={p.pattern} strokeWidth={0.7} />
          <circle cx={cx} cy={cy} r={medal.inner - 32} strokeWidth={0.5} stroke={p.pattern} />
        </g>

        {/* 주성 문양 워터마크 */}
        <g opacity={isMystic ? 0.1 : 0.07} transform={`translate(${cx - 75} ${cy - 75}) scale(1.5)`}>
          {v.emblem.map((prim, i) => (
            <path key={i} d={prim.d} fill="none" stroke={v.accent} strokeWidth={prim.mode === 'fill' ? 1.1 : 1.5} strokeLinecap="round" />
          ))}
        </g>

        {/* 丁 未 — 금박 음각 (그림자 한 겹 + 금박 한 겹) */}
        <g fontFamily={AMULET_FONTS.serif} fontSize={hanja.size} fontWeight={700} textAnchor="middle">
          <text x={cx + 0.8} y={cy + hanja.up + 1} fill={p.hanjaShadow}>
            {content.hanja.charAt(0)}
          </text>
          <text x={cx} y={cy + hanja.up} fill={`url(#${uid}-hanja)`}>
            {content.hanja.charAt(0)}
          </text>
          <text x={cx + 0.8} y={cy + hanja.down + 1} fill={p.hanjaShadow}>
            {content.hanja.charAt(1)}
          </text>
          <text x={cx} y={cy + hanja.down} fill={`url(#${uid}-hanja)`}>
            {content.hanja.charAt(1)}
          </text>
        </g>

        {/* 글자 양옆 장식 */}
        <g stroke={p.frameSoft} strokeWidth={0.8} fill="none">
          <path d={`M ${cx - 72} ${cy - 34} L ${cx - 54} ${cy - 34}`} />
          <path d={`M ${cx + 54} ${cy - 34} L ${cx + 72} ${cy - 34}`} />
          <path d={`M ${cx - 72} ${cy + 32} L ${cx - 54} ${cy + 32}`} />
          <path d={`M ${cx + 54} ${cy + 32} L ${cx + 72} ${cy + 32}`} />
        </g>
      </g>

      {/* 해의 이름 */}
      <text
        x={cx}
        y={LAYOUT.yearLine.y}
        textAnchor="middle"
        fill={p.ink}
        fontFamily={AMULET_FONTS.serif}
        fontSize={LAYOUT.yearLine.size}
        fontWeight={600}
        letterSpacing={LAYOUT.yearLine.tracking}
      >
        {L.yearLine}
      </text>
      <text
        x={cx}
        y={LAYOUT.owner.y}
        textAnchor="middle"
        fill={p.inkSoft}
        fontFamily={AMULET_FONTS.serif}
        fontSize={LAYOUT.owner.size}
        fontWeight={500}
      >
        {L.owner}
      </text>
      <text
        x={cx}
        y={LAYOUT.star.y}
        textAnchor="middle"
        fill={p.inkSoft}
        fontFamily={AMULET_FONTS.sans}
        fontSize={LAYOUT.star.size}
        letterSpacing={0.6}
      >
        {L.star}
      </text>

      {/* 키워드 칩 */}
      <g>
        {content.keywords.map((k, i) => {
          const w = chip.widths[i];
          const x = chip.startX + chip.widths.slice(0, i).reduce((a, b) => a + b, 0) + chips.gap * i;
          return (
            <g key={k}>
              <rect
                x={x}
                y={chips.y}
                width={w}
                height={chips.h}
                rx={chips.h / 2}
                fill={p.chipFill}
                stroke={p.chipLine}
                strokeWidth={0.8}
              />
              <Diamond x={x + chips.dotX} y={chips.y + chips.h / 2} r={chips.dotR} fill={p.gold[1]} />
              <text
                x={x + chips.textX}
                y={chips.y + chips.baseline}
                fill={p.ink}
                fontFamily={AMULET_FONTS.round}
                fontSize={chip.font}
              >
                {k}
              </text>
            </g>
          );
        })}
      </g>

      {/* 조언 — 두세 줄 */}
      <g fill={p.ink} fontFamily={AMULET_FONTS.serif} fontSize={adviceFit.size} textAnchor="middle">
        {adviceLines.map((line, i) => (
          <text key={i} x={cx} y={advice.y + i * advice.lh}>
            {line}
          </text>
        ))}
      </g>

      {/* 구분선 */}
      <g stroke={p.frameSoft} strokeWidth={0.7} fill="none">
        <line x1={LAYOUT.divider.inset} y1={LAYOUT.divider.y} x2={cx - 18} y2={LAYOUT.divider.y} />
        <line x1={cx + 18} y1={LAYOUT.divider.y} x2={CARD.w - LAYOUT.divider.inset} y2={LAYOUT.divider.y} />
      </g>
      <g transform={`translate(${cx} ${LAYOUT.divider.y}) rotate(45)`}>
        <rect x={-4} y={-4} width={8} height={8} fill="none" stroke={p.gold[1]} strokeWidth={0.9} />
        <circle cx={0} cy={0} r={1.3} fill={p.gold[1]} />
      </g>

      {/* 보완 기운 · 수호 원석 */}
      <text
        x={cx}
        y={stoneLabel.y}
        textAnchor="middle"
        fill={p.goldSolid}
        fontFamily={AMULET_FONTS.sans}
        fontSize={stoneLabel.size}
        fontWeight={500}
        letterSpacing={stoneLabel.tracking}
      >
        {L.stoneLabel}
      </text>

      <g>
        <path d={hexPath} fill={`url(#${uid}-gem)`} stroke={p.gold[1]} strokeWidth={0.7} strokeOpacity={0.55} />
        <g stroke={isMystic ? 'rgba(255,255,255,0.42)' : 'rgba(255,255,255,0.7)'} strokeWidth={0.45} fill="none">
          {hex.map(([x, y], i) => (
            <line key={i} x1={gem.x} y1={gem.y} x2={x} y2={y} />
          ))}
        </g>
        <path
          d={`M ${gem.x} ${gem.y - gemR * 0.95} L ${hex[1][0].toFixed(1)} ${hex[1][1].toFixed(1)} L ${gem.x} ${gem.y} L ${hex[5][0].toFixed(1)} ${hex[5][1].toFixed(1)} Z`}
          fill="rgba(255,255,255,0.32)"
        />
        <text x={stoneName.x} y={stoneName.y} fill={p.ink} fontFamily={AMULET_FONTS.serif} fontSize={stoneNameSize} fontWeight={600}>
          {content.stone.name}
        </text>
        <text x={stoneNote.x} y={stoneNote.y} fill={p.inkSoft} fontFamily={AMULET_FONTS.sans} fontSize={stoneNoteSize}>
          {L.stoneNote}
        </text>
      </g>

      {/* 인장 */}
      <g transform={`translate(${seal.x} ${seal.y}) rotate(-5)`}>
        <rect x={-seal.box / 2} y={-seal.box / 2} width={seal.box} height={seal.box} rx={4} fill={p.sealBg} />
        <rect
          x={-seal.box / 2 + 4}
          y={-seal.box / 2 + 4}
          width={seal.box - 8}
          height={seal.box - 8}
          rx={2.5}
          fill="none"
          stroke={p.sealLine}
          strokeWidth={0.9}
        />
        <text
          x={0}
          y={9}
          textAnchor="middle"
          fill={p.sealText}
          fontFamily={AMULET_FONTS.serif}
          fontSize={seal.font}
          fontWeight={700}
        >
          {L.seal}
        </text>
      </g>

      {/* 푸터 */}
      <line x1={footer.x0} y1={footer.lineY} x2={footer.x1} y2={footer.lineY} stroke={p.frameSoft} strokeWidth={0.5} />
      <text x={footer.x0} y={footer.textY} fill={p.inkSoft} fontFamily={AMULET_FONTS.sans} fontSize={footer.size}>
        {L.footerDate}
      </text>
      <text
        x={footer.x1}
        y={footer.textY}
        textAnchor="end"
        fill={`url(#${uid}-gold)`}
        fontFamily={AMULET_FONTS.serif}
        fontSize={footer.brandSize}
        fontWeight={600}
        letterSpacing={1}
      >
        {L.brand}
      </text>
      <text
        x={cx}
        y={footer.disclaimerY}
        textAnchor="middle"
        fill={p.inkSoft}
        fontFamily={AMULET_FONTS.sans}
        fontSize={footer.disclaimerSize}
      >
        {L.disclaimerLines[0]}
      </text>
      <text
        x={cx}
        y={footer.disclaimerY2}
        textAnchor="middle"
        fill={p.inkSoft}
        fontFamily={AMULET_FONTS.sans}
        fontSize={footer.disclaimerSize}
      >
        {L.disclaimerLines[1]}
      </text>
    </svg>
  );
}
