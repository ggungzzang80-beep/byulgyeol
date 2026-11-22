import { useMemo, useState, type MutableRefObject } from 'react';
import type { BirthInput, Gender } from '../lib/chart';
import { TIME_OPTIONS } from '../lib/terms';
import { THEME_ART, useTheme } from '../lib/theme';
import { StarMark } from './ui';

/** 폼에 지금 적힌 값 — 랜딩의 '부적 받기'가 바로 계산에 쓸 수 있게 밖으로 흘려보냅니다. */
export type BirthDraft = {
  input: BirthInput;
  /** 생년월일(년·월·일)이 모두 채워졌는지 */
  complete: boolean;
};

type Props = {
  onSubmit: (input: BirthInput) => void;
  onSample: () => void;
  /** 최신 입력값을 즉시 읽어 갈 수 있는 참조 — 배너 버튼이 렌더 지연 없이 바로 씁니다. */
  draftRef?: MutableRefObject<BirthDraft | null>;
  variant?: 'hero' | 'inline';
  /** 어느 체계를 계산하는 폼인지 — 제목·버튼 문구가 달라집니다. */
  mode?: 'ziwei' | 'western';
};


const WESTERN_FORM = {
  eyebrow: '出生天宮圖 · 무료 계산',
  title: '태어난 하늘의 좌표를 알려주세요',
  titleChar: '태어난 하늘의 좌표를 알려줘',
  desc: '같은 생년월일시로 태양·달·어센던트와 행성의 하우스를 그립니다.',
  submit: '내 천궁도 열기',
  sample: '예시 천궁도로 먼저 보기',
  timeHint: '시간을 모르면 어센던트와 하우스가 정오 기준으로 계산됩니다.',
  nameLabel: '천궁도에 새길 이름',
};

const YEARS = Array.from({ length: 2015 - 1930 + 1 }, (_, i) => 2015 - i);
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const daysIn = (y: number, m: number) => new Date(y, m, 0).getDate();

export default function BirthForm({ onSubmit, onSample, draftRef, variant = 'hero', mode = 'ziwei' }: Props) {
  const { theme, copy } = useTheme();
  const isCharacter = theme === 'character';
  const isWestern = mode === 'western';
  const label = {
    eyebrow: isWestern ? WESTERN_FORM.eyebrow : copy.form.eyebrow,
    title: isWestern ? (isCharacter ? WESTERN_FORM.titleChar : WESTERN_FORM.title) : copy.form.title,
    desc: isWestern ? WESTERN_FORM.desc : copy.form.desc,
    submit: isWestern ? WESTERN_FORM.submit : copy.form.submit,
    sample: isWestern ? WESTERN_FORM.sample : copy.form.sample,
    timeHint: isWestern ? WESTERN_FORM.timeHint : copy.form.timeHint,
    nameLabel: isWestern ? WESTERN_FORM.nameLabel : isCharacter ? '별지도에 새길 이름' : '이름',
  };
  const [name, setName] = useState('');
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [calendar, setCalendar] = useState<'solar' | 'lunar'>('solar');
  const [isLeap, setIsLeap] = useState(false);
  const [timeIndex, setTimeIndex] = useState('');
  const [gender, setGender] = useState<Gender>('female');
  const [error, setError] = useState<string | null>(null);

  const days = useMemo(() => {
    const y = Number(year) || 2000;
    const m = Number(month) || 1;
    const max = calendar === 'lunar' ? 30 : daysIn(y, m);
    return Array.from({ length: max }, (_, i) => i + 1);
  }, [year, month, calendar]);

  /** 지금 폼에 적힌 값 — 상단 폼을 다시 누르지 않아도 부적/명반을 바로 계산할 수 있게 밖에 알립니다. */
  const draftInput = useMemo<BirthDraft>(() => {
    const timeKnown = timeIndex !== 'unknown' && timeIndex !== '';
    return {
      input: {
        name,
        year: Number(year) || 0,
        month: Number(month) || 0,
        day: Number(day) || 0,
        calendar,
        isLeap: calendar === 'lunar' ? isLeap : false,
        timeIndex: timeKnown ? Number(timeIndex) : 6,
        timeKnown,
        gender,
      },
      complete: Boolean(year && month && day),
    };
  }, [name, year, month, day, calendar, isLeap, timeIndex, gender]);

  /* 배너의 '부적 받기'가 같은 화면에서 렌더 지연 없이 읽어 갈 수 있게 최신값을 남깁니다. */
  if (draftRef) draftRef.current = draftInput;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!year || !month || !day) {
      setError(isCharacter ? '태어난 날을 먼저 알려줘!' : '생년월일을 선택해 주세요.');
      return;
    }
    setError(null);
    onSubmit(draftInput.input);
  };

  return (
    <form
      onSubmit={submit}
      className={`${variant === 'hero' ? 't-card p-6 sm:p-8' : 't-card p-6 sm:p-7'} relative overflow-hidden`}
    >
      {isCharacter && (
        <>
          <div
            className="pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full opacity-60 blur-2xl"
            style={{ background: 'radial-gradient(closest-side,#e9d9ff,#ffe3d1 70%,transparent)' }}
          />
          <div className="pointer-events-none absolute right-5 top-4 flex items-center gap-1 text-[12.5px] text-[#b09ccc]">
            <span>✦</span>
            <span>✧</span>
          </div>
        </>
      )}

      <div className="relative mb-6 flex items-start justify-between gap-3">
        <div>
          <p className="eyebrow">{label.eyebrow}</p>
          <h2 className="t-title mt-2 text-[23px] leading-snug sm:text-[23px]">
            {label.title}
            {isCharacter && <span className="ml-1 align-middle text-[17px] text-[#c7a7f0]">✧</span>}
          </h2>
          <p className="mt-1.5 text-[14px] leading-relaxed t-muted">{label.desc}</p>
        </div>
        {isCharacter ? (
          <span className="guardian-avatar mt-1 hidden h-11 w-11 shrink-0 sm:block">
            <img src={THEME_ART.character.avatar} alt="" className="h-full w-full object-cover" />
          </span>
        ) : (
          <span
            className="mt-1 hidden h-10 w-10 shrink-0 items-center justify-center rounded-full sm:flex"
            style={{ border: '1px solid var(--line-strong)', color: 'var(--accent)' }}
          >
            <StarMark className="h-4 w-4" />
          </span>
        )}
      </div>

      <div className="relative space-y-4">
        <div>
          <label className="t-field-label" htmlFor="name">
            {label.nameLabel} <span className="opacity-60">(선택)</span>
          </label>
          <input
            id="name"
            className="t-field"
            placeholder={copy.form.namePlaceholder}
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={12}
          />
        </div>

        <div>
          <span className="t-field-label">{isCharacter ? '태어난 날' : '생년월일'}</span>
          <div className="grid grid-cols-[1.2fr_1fr_1fr] gap-2">
            <select
              id="birth-year"
              aria-label="년"
              className="t-field num"
              value={year}
              onChange={(e) => setYear(e.target.value)}
            >
              <option value="">YYYY</option>
              {YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}년
                </option>
              ))}
            </select>
            <select
              aria-label="월"
              className="t-field num"
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
            <select aria-label="일" className="t-field num" value={day} onChange={(e) => setDay(e.target.value)}>
              <option value="">DD</option>
              {days.map((d) => (
                <option key={d} value={d}>
                  {d}일
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3.5">
          <div>
            <span className="t-field-label">{isCharacter ? '달력' : '양력 / 음력'}</span>
            <div className="t-seg">
              <button
                type="button"
                className={calendar === 'solar' ? 'is-active' : ''}
                onClick={() => setCalendar('solar')}
              >
                {copy.form.solar}
              </button>
              <button
                type="button"
                className={calendar === 'lunar' ? 'is-active' : ''}
                onClick={() => setCalendar('lunar')}
              >
                {copy.form.lunar}
              </button>
            </div>
          </div>
          <div>
            <span className="t-field-label">{isCharacter ? '성별' : '성별'}</span>
            <div className="t-seg">
              <button
                type="button"
                className={gender === 'female' ? 'is-active' : ''}
                onClick={() => setGender('female')}
              >
                {copy.form.female}
              </button>
              <button
                type="button"
                className={gender === 'male' ? 'is-active' : ''}
                onClick={() => setGender('male')}
              >
                {copy.form.male}
              </button>
            </div>
          </div>
        </div>

        {calendar === 'lunar' && (
          <label className="flex cursor-pointer items-center gap-2 text-[14px] t-muted">
            <input
              type="checkbox"
              checked={isLeap}
              onChange={(e) => setIsLeap(e.target.checked)}
              className="h-4 w-4 rounded"
              style={{ accentColor: 'var(--accent)' }}
            />
            윤달입니다
          </label>
        )}

        <div>
          <label className="t-field-label" htmlFor="time">
            {isCharacter ? '별이 뜬 시간' : '태어난 시간'} <span className="opacity-60">(12시진)</span>
          </label>
          <select id="time" className="t-field" value={timeIndex} onChange={(e) => setTimeIndex(e.target.value)}>
            <option value="">{isCharacter ? '몇 시쯤 태어났는지 알려줘' : '시진을 선택해 주세요'}</option>
            {TIME_OPTIONS.map((t) => (
              <option key={t.index} value={t.index}>
                {t.label} · {t.range}
              </option>
            ))}
            <option value="unknown">{isCharacter ? '시간 모름 (정오 기준)' : '시간 모름 (정오 기준으로 계산)'}</option>
          </select>
          <p className="mt-2 text-[13px] leading-relaxed t-faint">{label.timeHint}</p>
        </div>
      </div>

      {error && <p className="relative mt-4 text-[14px] text-[#d98a7a]">{error}</p>}

      <button type="submit" className="t-btn t-btn-primary relative mt-6 w-full py-3.5 text-[16px]">
        {label.submit}
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M5 12h13M13 6.5L18.5 12 13 17.5" />
        </svg>
      </button>

      <button
        type="button"
        onClick={onSample}
        className="relative mt-3 w-full text-center text-[14px] underline decoration-1 underline-offset-4 transition t-muted"
        style={{ textDecorationColor: 'var(--line-strong)' }}
      >
        {label.sample}
      </button>
    </form>
  );
}
