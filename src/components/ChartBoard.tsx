import { useState } from 'react';
import type { ChartModel, PalaceView } from '../lib/chart';
import { useTheme } from '../lib/theme';
import { StarMark } from './ui';

/** 전통 명반 배치: 인(寅)이 좌하단에서 시계방향으로 12궁이 돌아갑니다. */
const POS: Record<number, [number, number]> = {
  0: [4, 1],
  1: [3, 1],
  2: [2, 1],
  3: [1, 1],
  4: [1, 2],
  5: [1, 3],
  6: [1, 4],
  7: [2, 4],
  8: [3, 4],
  9: [4, 4],
  10: [4, 3],
  11: [4, 2],
};

type Props = {
  chart: ChartModel;
  selected: PalaceView;
  onSelect: (p: PalaceView) => void;
};

export default function ChartBoard({ chart, selected, onSelect }: Props) {
  const { theme, copy } = useTheme();
  const [hovered, setHovered] = useState<number | null>(null);
  const warn = theme === 'character' ? '#d97d9a' : '#d98a7a';

  return (
    <div className="t-card overflow-hidden">
      <div className="chart-board">
        {chart.palaces.map((p) => {
          const [row, col] = POS[p.index] ?? [1, 1];
          const active = selected.index === p.index;
          return (
            <button
              key={p.index}
              type="button"
              onClick={() => onSelect(p)}
              onMouseEnter={() => setHovered(p.index)}
              onMouseLeave={() => setHovered(null)}
              aria-pressed={active}
              style={{ gridRowStart: row, gridColumnStart: col }}
              className={`pcell ${active ? 'is-active' : ''}`}
            >
              <div className="flex min-w-0 items-start justify-between gap-0.5">
                <span className="pcell__stem num shrink-0">
                  {p.stem}
                  {p.branch}
                </span>
                <span className="flex min-w-0 flex-col items-end gap-0.5">
                  <span className={`pcell__name ${p.name === '명궁' ? 'is-soul' : ''}`}>{p.name}</span>
                  {p.isBodyPalace && <span className="pcell__meta">신궁</span>}
                </span>
              </div>

              <div className="mt-1 flex min-w-0 flex-1 flex-col justify-center pb-0.5">
                {p.major.length ? (
                  <div className="flex flex-col gap-0.5">
                    {p.major.map((s) => (
                      <span key={s.cn} className="flex min-w-0 flex-wrap items-baseline gap-x-1">
                        <span className="pcell__star">{s.name}</span>
                        {s.brightness && <span className="pcell__meta">{s.brightness}</span>}
                        {s.mutagen && (
                          <span
                            className="pcell__tiny"
                            style={{
                              background: s.mutagen === '화기' ? 'rgba(217,138,122,0.18)' : 'var(--accent-soft)',
                              color: s.mutagen === '화기' ? warn : 'var(--accent-deep)',
                            }}
                          >
                            {s.mutagen.replace('화', '')}
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="pcell__meta">주성 없음</span>
                )}

                <div className="pcell__minor mt-1 hidden flex-wrap gap-x-1 sm:flex">
                  {p.minor.slice(0, 3).map((s) => (
                    <span key={s.cn} style={s.mutagen === '화기' ? { color: warn } : undefined}>
                      {s.name}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pcell__meta mt-1 hidden items-center justify-between sm:flex">
                <span className="num">
                  {p.decadalRange[0]}–{p.decadalRange[1]}
                </span>
                <span>{p.stage}</span>
              </div>
            </button>
          );
        })}

        {/* 중앙 정보 */}
        <div className="board-center relative">
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.14]" aria-hidden="true">
            <StarMark className="h-12 w-12 sm:h-20 sm:w-20" />
          </div>
          <div className="min-w-0">
            <div className="flex items-baseline justify-between gap-1">
              <span className="text-[12px] tracking-[0.24em] sm:text-[12.5px]" style={{ color: 'var(--accent-deep)' }}>
                命盤
              </span>
              <span className="num text-[12px] t-faint sm:text-[12.5px]">{chart.fiveElements}</span>
            </div>
            <p className="t-title mt-1 truncate text-[15px] leading-tight sm:text-[21px]">
              {chart.name ? `${chart.name} 님` : theme === 'character' ? '나의 별지도' : '나의 명반'}
            </p>
            <p className="num mt-0.5 truncate text-[12px] t-muted sm:text-[13px]">{chart.solarText}</p>
            <p className="num mt-0.5 hidden truncate text-[12.5px] t-faint sm:block">{chart.lunarText}</p>
            <p className="num mt-0.5 truncate text-[12px] t-faint sm:hidden">{chart.timeText.split(' ')[0]}</p>
          </div>

          <div className="mt-1 space-y-1 sm:space-y-1.5">
            <div className="flex items-center gap-1.5">
              <span className="shrink-0 text-[12px] tracking-[0.1em] t-faint sm:text-[12.5px]">명궁</span>
              <span className="h-px flex-1" style={{ background: 'var(--line)' }} />
              <span className="truncate text-[12.5px] font-semibold t-body sm:text-[15px]">
                {chart.primaryStar}성
                {chart.primaryBrightness && (
                  <span className="ml-0.5 text-[10.5px] font-normal t-faint sm:text-[12px]">{chart.primaryBrightness}</span>
                )}
              </span>
            </div>
            <div className="hidden items-center gap-1.5 sm:flex">
              <span className="shrink-0 text-[12.5px] tracking-[0.1em] t-faint">신궁</span>
              <span className="h-px flex-1" style={{ background: 'var(--line)' }} />
              <span className="truncate text-[13.5px] t-muted">
                {chart.bodyPalace.name} · {chart.bodyStar}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="shrink-0 text-[12px] tracking-[0.1em] t-faint sm:text-[12.5px]">유년</span>
              <span className="h-px flex-1" style={{ background: 'var(--line)' }} />
              <span className="num truncate text-[12.5px] t-muted sm:text-[14px]">
                {chart.yearly.year} {chart.yearly.stemBranch}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 범례 */}
      <div
        className="flex flex-wrap items-center gap-x-3 gap-y-1.5 px-3 py-2.5 text-[12.5px] sm:gap-x-4 sm:px-4 sm:py-2.5 sm:text-[13px]"
        style={{ borderTop: '1px solid var(--line)', background: 'var(--field-bg)' }}
      >
        {[
          { k: '록', label: '화록' },
          { k: '권', label: '화권' },
          { k: '과', label: '화과' },
        ].map((m) => (
          <span key={m.k} className="flex items-center gap-1 t-muted">
            <span className="rounded-[3px] px-1 text-[12px] leading-[14px]" style={{ background: 'var(--accent-soft)', color: 'var(--accent-deep)' }}>
              {m.k}
            </span>
            {m.label}
          </span>
        ))}
        <span className="flex items-center gap-1 t-muted">
          <span className="rounded-[3px] px-1 text-[12px] leading-[14px]" style={{ background: 'rgba(217,138,122,0.16)', color: warn }}>
            기
          </span>
          화기
        </span>
        <span className="mt-1 w-full text-[13px] leading-[1.6] t-muted sm:ml-auto sm:mt-0 sm:w-auto sm:text-[13px]">
          {copy.chart.boardNote}
        </span>
      </div>
    </div>
  );
}
