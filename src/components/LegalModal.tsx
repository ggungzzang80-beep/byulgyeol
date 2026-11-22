import { useEffect, useRef } from 'react';
import { LEGAL_DOCS, type LegalDocId } from '../config/legal';

type Props = {
  doc: LegalDocId;
  onClose: () => void;
};

/**
 * 정책 문서 모달 — 푸터와 결제 화면의 링크에서 바로 엽니다.
 * 문서가 길어서 본문만 스크롤되고, 제목과 닫기 버튼은 위에 고정됩니다.
 */
export default function LegalModal({ doc, onClose }: Props) {
  const content = LEGAL_DOCS[doc];
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus({ preventScroll: true });
    if (panelRef.current) panelRef.current.scrollTop = 0;
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [doc, onClose]);

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-6"
      style={{ background: 'rgba(10,8,20,0.62)', backdropFilter: 'blur(5px)', WebkitBackdropFilter: 'blur(5px)' }}
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`legal-title-${doc}`}
        tabIndex={-1}
        className="t-card animate-rise max-h-[92vh] w-full max-w-[620px] overflow-y-auto !rounded-b-none outline-none sm:!rounded-b-[26px]"
        style={{ background: 'var(--card-2)' }}
      >
        <div
          className="sticky top-0 z-10 flex items-start justify-between gap-3 px-6 pb-4 pt-5"
          style={{ background: 'var(--card-2)', borderBottom: '1px solid var(--line)' }}
        >
          <div className="min-w-0">
            <p className="eyebrow">POLICY · {content.updated}</p>
            <h2 id={`legal-title-${doc}`} className="t-title mt-2 text-[19px] leading-snug">
              {content.title}
            </h2>
            <p className="mt-1 text-[13px] leading-[1.7] t-muted">{content.summary}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="정책 문서 닫기"
            className="-mr-1 -mt-1 shrink-0 rounded-full p-2 transition t-muted"
            style={{ background: 'var(--field-bg)' }}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5">
          {content.sections.map((section) => (
            <section key={section.title} className="mb-5 last:mb-0">
              <h3 className="text-[14px] font-semibold tracking-[0.02em]" style={{ color: 'var(--accent-deep)' }}>
                {section.title}
              </h3>
              {section.blocks.map((block, i) =>
                block.kind === 'p' ? (
                  <p key={i} className="mt-1.5 text-[13.5px] leading-[1.95] t-body">
                    {block.text}
                  </p>
                ) : (
                  <ul key={i} className="mt-1.5 space-y-1">
                    {block.items.map((item) => (
                      <li key={item} className="flex gap-1.5 text-[13.5px] leading-[1.9] t-body">
                        <span aria-hidden="true" className="mt-[7px] h-[3px] w-[3px] shrink-0 rounded-full" style={{ background: 'var(--accent)' }} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ),
              )}
            </section>
          ))}
        </div>

        <div className="sticky bottom-0 px-6 py-4" style={{ background: 'var(--card-2)', borderTop: '1px solid var(--line)' }}>
          <button type="button" onClick={onClose} className="t-btn t-btn-soft w-full py-3 text-[14px]">
            확인했습니다
          </button>
        </div>
      </div>
    </div>
  );
}
