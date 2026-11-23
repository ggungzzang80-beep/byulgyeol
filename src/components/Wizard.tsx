import { useEffect, useRef, type ReactNode } from 'react';
import { ArrowIcon } from './ui';

export type WizardStep = {
  id: string;
  /** 진행 표시줄에 쓰는 짧은 이름 */
  label: string;
  /** 이 단계의 내용 */
  body: ReactNode;
  /** '다음' 버튼 문구를 바꿀 때 */
  nextLabel?: string;
};

type Props = {
  steps: WizardStep[];
  index: number;
  onIndexChange: (index: number) => void;
  /** 마지막 단계에서 '다음'을 눌렀을 때 (없으면 마지막 단계에서 버튼을 숨김) */
  onFinish?: () => void;
  finishLabel?: string;
  /** 현재 단계의 '다음'이 폼 제출이면 그 form 의 id */
  submitFormId?: string;
  /** 진행 표시줄 위에 붙는 머리말 (예: 인사 문구) */
  eyebrow?: ReactNode;
  /** 단계 카드 아래 여백용 안내 */
  footerNote?: ReactNode;
  className?: string;
};

/**
 * 단계(카드 전환)형 마법사.
 * - 긴 스크롤 페이지 대신 한 번에 한 단계만 보여 주고, 이전/다음으로 넘깁니다.
 * - 단계 표시(번호·이름·진행선)는 눌러서 바로 이동할 수 있습니다.
 * - 바뀔 때 카드가 살짝 떠오르며 나타나고, 화면은 단계 상단으로 돌아갑니다.
 */
export default function Wizard({
  steps,
  index,
  onIndexChange,
  onFinish,
  finishLabel = '완료',
  submitFormId,
  eyebrow,
  footerNote,
  className = '',
}: Props) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const isLast = index >= steps.length - 1;
  const step = steps[index];

  const go = (next: number) => {
    const clamped = Math.max(0, Math.min(steps.length - 1, next));
    if (clamped === index) return;
    onIndexChange(clamped);
  };

  /* 단계가 바뀌면 그 단계 상단이 화면에 오도록 (탭·모두 보기 등 어디서 넘어와도) */
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 84;
    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
  }, [index]);

  return (
    <div className={`wizard ${className}`}>
      <div className="wizard-head">
        {eyebrow && <div className="wizard-eyebrow">{eyebrow}</div>}
        <ol className="wizard-steps" aria-label="진행 단계">
          {steps.map((s, i) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => go(i)}
                aria-current={i === index ? 'step' : undefined}
                className={`wizard-step ${i === index ? 'is-active' : ''} ${i < index ? 'is-done' : ''}`}
              >
                <span className="wizard-step__no" aria-hidden="true">
                  {i < index ? '✓' : i + 1}
                </span>
                {s.label}
              </button>
            </li>
          ))}
        </ol>
        <div className="wizard-track" role="presentation">
          <span style={{ width: `${((index + 1) / steps.length) * 100}%` }} />
        </div>
      </div>

      <div ref={stageRef} className="wizard-stage" key={step.id}>
        {step.body}
      </div>

      {footerNote}

      <div className="wizard-bar">
        <div className="wizard-bar__inner">
          <button
            type="button"
            className="t-btn t-btn-ghost wizard-bar__prev"
            onClick={() => go(index - 1)}
            disabled={index === 0}
            aria-label="이전 단계"
          >
            <ArrowIcon className="h-3.5 w-3.5 rotate-180" />
            이전
          </button>

          <div className="wizard-bar__meta">
            <span className="wizard-bar__count num">
              {index + 1} / {steps.length}
            </span>
            <span className="wizard-bar__label">{step.label}</span>
          </div>

          {isLast ? (
            onFinish && (
              <button type="button" className="t-btn t-btn-primary wizard-bar__next" onClick={onFinish}>
                {finishLabel}
                <ArrowIcon className="h-3.5 w-3.5" />
              </button>
            )
          ) : (
            <button
              type="button"
              className="t-btn t-btn-primary wizard-bar__next"
              onClick={() => {
                if (submitFormId) {
                  const form = document.getElementById(submitFormId) as HTMLFormElement | null;
                  form?.requestSubmit();
                  return;
                }
                go(index + 1);
              }}
            >
              {step.nextLabel ?? '다음'}
              <ArrowIcon className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
