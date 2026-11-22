import { useEffect, useMemo, useState } from 'react';
import type { BirthInput, ChartModel, Gender } from '../lib/chart';
import { buildChart } from '../lib/chart';
import { compatibility, profileOf } from '../lib/content';
import { findProduct, productPrice } from '../lib/products';
import { TIME_OPTIONS } from '../lib/terms';
import { useTheme } from '../lib/theme';
import FreeOpenMeter from './FreeOpenMeter';
import { LockIcon, StarMark } from './ui';

type Props = {
  chart: ChartModel;
  /** 심층 궁합 리포트(유료) 결제 모달로 넘길 때 — 입력값을 그대로 넘겨 재입력을 없앱니다. */
  onUpgrade: (partner: BirthInput) => void;
  onClose: () => void;
};

const YEARS = Array.from({ length: 2015 - 1930 + 1 }, (_, i) => 2015 - i);
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const daysIn = (y: number, m: number) => new Date(y, m, 0).getDate();

/**
 * 궁합 무료 프리뷰 — 상대방 생년월일만 넣으면 궁합 점수와 한 줄 케미를 무료로 보여주고,
 * 구체적인 관계 해석·끌림 포인트·갈등 주의점은 유료 심층 리포트로 이어 줍니다.
 */
export default function CompatPreview({ chart, onUpgrade, onClose }: Props) {
  const { theme } = useTheme();
  const isCharacter = theme === 'character';
  const compatProduct = findProduct('compat');
  const price = productPrice(compatProduct, theme).toLocaleString('ko-KR');

  const [name, setName] = useState('');
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [time, setTime] = useState('unknown');
  const [gender, setGender] = useState<Gender>('male');
  const [stage, setStage] = useState<'form' | 'loading' | 'result'>('form');
  const [partner, setPartner] = useState<ChartModel | null>(null);
  const [error, setError] = useState<string | null>(null);

  const days = useMemo(() => {
    const y = Number(year) || 2000;
    const m = Number(month) || 1;
    return Array.from({ length: daysIn(y, m) }, (_, i) => i + 1);
  }, [year, month]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const partnerInput = (): BirthInput => ({
    name: name.trim(),
    year: Number(year),
    month: Number(month),
    day: Number(day),
    calendar: 'solar',
    isLeap: false,
    timeIndex: time === 'unknown' ? 6 : Number(time),
    timeKnown: time !== 'unknown',
    gender,
  });

  const calculate = async () => {
    if (!year || !month || !day) {
      setError(isCharacter ? '상대방의 태어난 날도 알려줘!' : '상대방의 생년월일을 선택해 주세요.');
      return;
    }
    setError(null);
    setStage('loading');
    try {
      const built = await buildChart(partnerInput());
      setPartner(built);
      setStage('result');
    } catch {
      setStage('form');
      setError(
        isCharacter
          ? '상대방의 별을 그리지 못했어. 생년월일을 확인해 줘!'
          : '상대방의 명반을 계산하지 못했습니다. 생년월일을 확인해 주세요.',
      );
    }
  };

  const reset = () => {
    setPartner(null);
    setStage('form');
  };

  const compat = partner ? compatibility(chart.primaryStar, partner.primaryStar) : null;
  const oneLine = compat ? `${compat.body.split('. ')[0].trim().replace(/\.$/, '')}.` : '';
  const nameB = partner?.name?.trim() || (isCharacter ? '상대' : '상대방');
  const warn = isCharacter ? '#d97d9a' : '#d98a7a';

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6"
      style={{ background: 'rgba(10,8,20,0.55)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="무료 궁합 점수"
        className="t-card animate-rise max-h-[92vh] w-full max-w-[460px] overflow-y-auto !rounded-b-none sm:!rounded-b-[26px]"
        style={{ background: 'var(--card-2)' }}
      >
        {/* 헤더 */}
        <div className="flex items-start justify-between gap-3 px-6 pb-4 pt-5" style={{ borderBottom: '1px solid var(--line)' }}>
          <div className="min-w-0">
            <p className="eyebrow">{isCharacter ? '궁합 미리보기' : '무료 궁합 프리뷰'}</p>
            <p
              className="mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12.5px] font-semibold"
              style={{ background: 'var(--accent-soft)', color: 'var(--accent-deep)', border: '1px solid var(--line-strong)' }}
            >
              <span aria-hidden="true">✧</span>
              {isCharacter ? '점수는 무료, 해석은 심층에서' : '점수 무료 · 심층 해석은 유료'}
            </p>
            <h3 className="t-title mt-2 text-[20px] leading-snug">
              {chart.name ? `${chart.name} 님과 ` : ''}
              {isCharacter ? '누구의 궁합을 볼까?' : '두 사람의 궁합'}
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="닫기"
            className="-mr-1 -mt-1 rounded-full p-2 transition t-muted"
            style={{ background: 'var(--field-bg)' }}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5">
          {stage !== 'result' && (
            <div className="rounded-2xl p-4" style={{ border: '1px solid var(--line)' }}>
              <p className="mb-3 text-[13px] font-semibold tracking-[0.08em] t-muted">
                {isCharacter ? '상대방 정보 (친구·연인)' : '상대방 정보'}
              </p>
              <input
                className="t-field mb-2 !text-[15px]"
                placeholder={isCharacter ? '이름 (선택)' : '이름 (선택)'}
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={12}
              />
              <div className="grid grid-cols-3 gap-2">
                <select
                  aria-label="상대방 태어난 해"
                  className="t-field num !text-[15px]"
                  value={year}
                  onChange={(e) => {
                    setYear(e.target.value);
                    setDay('');
                  }}
                >
                  <option value="">YYYY</option>
                  {YEARS.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
                <select
                  aria-label="상대방 태어난 달"
                  className="t-field num !text-[15px]"
                  value={month}
                  onChange={(e) => {
                    setMonth(e.target.value);
                    setDay('');
                  }}
                >
                  <option value="">MM</option>
                  {MONTHS.map((m) => (
                    <option key={m} value={m}>
                      {m}월
                    </option>
                  ))}
                </select>
                <select
                  aria-label="상대방 태어난 날"
                  className="t-field num !text-[15px]"
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                >
                  <option value="">DD</option>
                  {days.map((d) => (
                    <option key={d} value={d}>
                      {d}일
                    </option>
                  ))}
                </select>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <select
                  aria-label="상대방 태어난 시간"
                  className="t-field !text-[15px]"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                >
                  <option value="unknown">{isCharacter ? '시간 모름' : '시간 모름'}</option>
                  {TIME_OPTIONS.map((t) => (
                    <option key={t.index} value={t.index}>
                      {t.label} {t.range}
                    </option>
                  ))}
                </select>
                <select
                  aria-label="상대방 성별"
                  className="t-field !text-[15px]"
                  value={gender}
                  onChange={(e) => setGender(e.target.value as Gender)}
                >
                  <option value="female">여성</option>
                  <option value="male">남성</option>
                </select>
              </div>
              <p className="mt-2 text-[13px] leading-[1.7] t-faint">
                {isCharacter
                  ? '생년월일만 있으면 바로 점수가 나와. 시간을 모르면 정오 기준으로 계산해.'
                  : '생년월일만 있으면 바로 계산됩니다. 시간을 모르면 정오 기준으로 계산합니다.'}
              </p>
              {error && (
                <p className="mt-2 text-[13.5px]" style={{ color: warn }}>
                  {error}
                </p>
              )}
              <button
                onClick={calculate}
                disabled={stage === 'loading'}
                className="t-btn t-btn-primary mt-3 w-full py-3 text-[15px]"
              >
                {stage === 'loading' ? (
                  <>
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-[1.5px] border-current border-t-transparent" />
                    {isCharacter ? '별을 맞춰보는 중…' : '계산 중…'}
                  </>
                ) : (
                  <>
                    <StarMark className="h-3.5 w-3.5" />
                    {isCharacter ? '무료로 궁합 점수 보기' : '무료 궁합 점수 보기'}
                  </>
                )}
              </button>
            </div>
          )}

          {stage === 'result' && partner && compat && (
            <div className="animate-rise">
              {/* 무료 점수 */}
              <div className="flex flex-col items-center gap-5 sm:flex-row sm:gap-7">
                <div className="relative flex h-[112px] w-[112px] shrink-0 items-center justify-center">
                  <svg viewBox="0 0 120 120" className="absolute inset-0 h-full w-full -rotate-90">
                    <circle cx="60" cy="60" r="52" fill="none" stroke="var(--line)" strokeWidth="6" />
                    <circle
                      cx="60"
                      cy="60"
                      r="52"
                      fill="none"
                      stroke="var(--accent)"
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={`${(compat.score / 100) * 327} 327`}
                    />
                  </svg>
                  <div className="text-center">
                    <p className="num t-title text-[30px] leading-none">{compat.score}</p>
                    <p className="mt-1 text-[12.5px] t-faint">궁합 지수</p>
                  </div>
                </div>
                <div className="min-w-0 text-center sm:text-left">
                  <p className="text-[12.5px] tracking-[0.16em]" style={{ color: 'var(--accent-deep)' }}>
                    무료 공개 30% · 두 사람의 케미
                  </p>
                  <h4 className="t-title mt-1.5 text-[20px] leading-snug">
                    {chart.primaryStar}
                    {isCharacter ? '별' : '성'} × {partner.primaryStar}
                    {isCharacter ? '별' : '성'}
                  </h4>
                  <p className="mt-2 text-[14.5px] leading-[1.8] t-body">{oneLine}</p>
                </div>
              </div>

              {/* 두 사람 별 */}
              <div className="mt-4 grid grid-cols-2 gap-2">
                {[
                  { label: chart.name || (isCharacter ? '나' : '나'), star: chart.primaryStar, line: profileOf(chart.primaryStar).identity },
                  { label: nameB, star: partner.primaryStar, line: profileOf(partner.primaryStar).identity },
                ].map((p) => (
                  <div key={p.label} className="rounded-2xl px-3 py-2.5" style={{ background: 'var(--field-bg)', border: '1px solid var(--line)' }}>
                    <p className="truncate text-[12.5px] t-faint">{p.label}</p>
                    <p className="mt-0.5 t-title text-[16px]">
                      {p.star}
                      {isCharacter ? '별' : '성'}
                    </p>
                    <p className="mt-0.5 text-[13px] leading-[1.6] t-muted">{p.line}</p>
                  </div>
                ))}
              </div>

              {/* 잠긴 심층 */}
              <div className="mt-4">
                <FreeOpenMeter
                  freePercent={30}
                  onDark={false}
                  openItems={['궁합 점수', '한 줄 케미', '두 사람 수호별']}
                  lockedItems={[
                    '왜 이 조합이 이렇게 흘러가는지',
                    '끌림 포인트와 살리는 법',
                    '반복되는 부딪힘과 넘는 법',
                    '함께할 때의 역할 나누기',
                  ]}
                  volume="한 번 결제로 관계 해석 전체가 열려"
                  product={compatProduct}
                />
              </div>

              <button
                onClick={() => onUpgrade(partnerInput())}
                className="t-btn t-btn-gold mt-3 w-full py-3 text-[14.5px]"
              >
                <LockIcon className="h-3.5 w-3.5" />
                {isCharacter ? `${price}원으로 심층 궁합 보기` : `${price}원 결제하고 심층 궁합 보기`}
              </button>
              <button onClick={reset} className="mt-2 w-full text-center text-[13.5px] t-faint">
                {isCharacter ? '다른 사람으로 다시 보기' : '다른 상대방으로 다시 보기'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
