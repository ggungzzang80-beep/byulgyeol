import { starVisual } from '../lib/starPalette';

type Props = {
  star: string;
  className?: string;
  /** 문양 선 색 (기본: 주성 강조색) */
  color?: string;
  opacity?: number;
};

/**
 * 주성 상징 문양 (SVG).
 * 카드(canvas)와 같은 path 를 써서 웹과 이미지의 문양이 일치합니다.
 */
export default function StarEmblem({ star, className, color, opacity = 0.5 }: Props) {
  const v = starVisual(star);
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      stroke={color ?? v.accent}
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity={opacity}
      aria-hidden="true"
    >
      {v.emblem.map((prim, i) =>
        prim.mode === 'fill' ? (
          <path key={i} d={prim.d} fill={color ?? v.accent} stroke="none" fillOpacity={0.75} />
        ) : (
          <path key={i} d={prim.d} />
        ),
      )}
    </svg>
  );
}
