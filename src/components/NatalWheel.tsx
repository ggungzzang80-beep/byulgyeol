import { SIGNS, type WesternModel } from '../lib/western';

type Props = {
  model?: WesternModel;
  size?: number;
  className?: string;
  showPlanets?: boolean;
};

/**
 * 출생 천궁도 휠.
 * 어센던트가 왼쪽(9시 방향)에 오도록 황경을 배치합니다.
 * model 이 없으면 12자리 링만 그립니다(랜딩 장식).
 */
export default function NatalWheel({ model, size = 260, className = '', showPlanets = true }: Props) {
  const c = size / 2;
  const outer = c - 3;
  const ring = outer * 0.8;
  const houseRing = outer * 0.58;
  const planetRing = outer * 0.68;

  const ascLon = model ? model.rising.index * 30 + model.risingDegree : 0;
  const toAngle = (lon: number) => ((lon - ascLon) + 180) * (Math.PI / 180);
  const point = (lon: number, r: number): [number, number] => [
    c + r * Math.cos(toAngle(lon)),
    c - r * Math.sin(toAngle(lon)),
  ];

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      style={{ width: size, height: size }}
      role="img"
      aria-label={model ? `${model.name || '나'}의 출생 천궁도` : '출생 천궁도 예시'}
    >
      <circle cx={c} cy={c} r={outer} fill="none" stroke="var(--line-strong)" strokeWidth="1" />
      <circle cx={c} cy={c} r={ring} fill="none" stroke="var(--line)" strokeWidth="0.8" />
      <circle cx={c} cy={c} r={houseRing} fill="none" stroke="var(--line)" strokeWidth="0.8" />

      {/* 12자리 눈금 + 글리프 */}
      {SIGNS.map((s) => {
        const mid = s.index * 30 + 15;
        const [gx, gy] = point(mid, (outer + ring) / 2);
        const [x1, y1] = point(s.index * 30, houseRing);
        const [x2, y2] = point(s.index * 30, outer);
        return (
          <g key={s.index}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--line)" strokeWidth="0.7" opacity="0.7" />
            <text
              x={gx}
              y={gy}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={size * 0.055}
              fill={model && s.index === model.sun.signIndex ? 'var(--accent)' : 'var(--muted)'}
              opacity={0.95}
            >
              {s.glyph}
            </text>
          </g>
        );
      })}

      {/* 하우스 컷 */}
      {Array.from({ length: 12 }, (_, i) => {
        const [x1, y1] = point(i * 30, houseRing);
        const [x2, y2] = point(i * 30, ring);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--line)" strokeWidth="0.7" />;
      })}

      {/* ASC – DSC 축 */}
      {model && (
        <>
          <line
            x1={point(ascLon, houseRing)[0]}
            y1={point(ascLon, houseRing)[1]}
            x2={point(ascLon + 180, houseRing)[0]}
            y2={point(ascLon + 180, houseRing)[1]}
            stroke="var(--accent)"
            strokeWidth="1"
            opacity="0.55"
          />
          <text
            x={c - houseRing - 8}
            y={c}
            textAnchor="end"
            dominantBaseline="central"
            fontSize={size * 0.045}
            fill="var(--accent)"
          >
            ASC
          </text>
        </>
      )}

      {/* 행성 */}
      {showPlanets &&
        model?.planets.map((p, i) => {
          const r = planetRing - (i % 3) * (size * 0.055);
          const [px, py] = point(p.longitude, r);
          return (
            <g key={p.key}>
              <circle cx={px} cy={py} r={size * 0.028} fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth="0.7" />
              <text
                x={px}
                y={py}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={size * 0.032}
                fill="var(--accent-deep)"
              >
                {p.glyph}
              </text>
            </g>
          );
        })}

      {model && (
        <text
          x={c}
          y={c + size * 0.02}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={size * 0.07}
          fill="var(--accent)"
          opacity="0.85"
        >
          {model.sun.glyphSign}
        </text>
      )}
    </svg>
  );
}
