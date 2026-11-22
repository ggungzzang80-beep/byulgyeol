import { useState } from 'react';
import { LEGAL_LINK_LABEL, LEGAL_ORDER, businessRows, type LegalDocId } from '../config/legal';
import { useTheme } from '../lib/theme';
import LegalModal from './LegalModal';

/**
 * 사업자 푸터 — 모든 화면 하단에 붙습니다.
 * 전자상거래법이 요구하는 사업자 정보와, 결제 심사에 필요한 정책 3종 링크를
 * 한 블록에 모았습니다. 값은 src/config/legal.ts (VITE_BIZ_*)에서 옵니다.
 */
export default function LegalFooter() {
  const { copy, theme } = useTheme();
  const [openDoc, setOpenDoc] = useState<LegalDocId | null>(null);
  const rows = businessRows();
  const isCharacter = theme === 'character';

  return (
    <>
      <footer
        id="legal"
        className="relative z-10 mt-14"
        style={{ borderTop: '1px solid var(--line-soft)', background: 'color-mix(in srgb, var(--card) 55%, transparent)' }}
      >
        <div className="mx-auto max-w-5xl px-5 pb-24 pt-8 sm:px-8 sm:pb-16">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="t-display text-[16px]" style={{ color: 'var(--text)' }}>
                {copy.brand.name}
              </p>
              <p className="mt-1 text-[12.5px] leading-[1.7] t-faint">
                {isCharacter
                  ? '오락과 자기 이해를 돕는 디지털 콘텐츠예요. 미래를 확정하지 않고, 중요한 결정의 근거로 쓰지 않아요.'
                  : '오락과 자기 이해를 돕는 디지털 콘텐츠입니다. 미래를 확정하지 않으며 중요한 결정의 근거로 쓰지 않습니다.'}
              </p>
            </div>
            <nav aria-label="정책 문서" className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
              {LEGAL_ORDER.map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setOpenDoc(id)}
                  className="text-[13px] underline decoration-dotted underline-offset-4 transition t-muted hover:opacity-80"
                >
                  {LEGAL_LINK_LABEL[id]}
                </button>
              ))}
            </nav>
          </div>

          <div className="mt-5 h-px w-full" style={{ background: 'var(--line-soft)' }} />

          <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-1.5 text-[13px] leading-[1.75] sm:grid-cols-2 lg:grid-cols-3">
            {rows.map((row) => (
              <div key={row.label} className="flex gap-2">
                <dt className="shrink-0 t-faint">{row.label}</dt>
                <dd
                  className={row.pending ? 't-faint opacity-70' : 't-muted'}
                  style={row.pending ? { fontStyle: 'italic' } : undefined}
                >
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-4 flex flex-col gap-1 text-[12.5px] leading-[1.8] t-faint">
            <p>
              {isCharacter
                ? '결제는 페이앱(PayApp)을 통해 처리되고, 디지털 리포트는 결제 확인 즉시 열려 청약 철회가 제한돼요. 자세한 기준은 환불 정책에서 확인할 수 있어.'
                : '결제는 페이앱(PayApp)을 통해 처리됩니다. 디지털 리포트는 결제 확인 즉시 제공되어 청약 철회가 제한되며, 자세한 기준은 환불 및 청약철회 정책을 따릅니다.'}
            </p>
            <p>
              © {new Date().getFullYear()} {rows[0]?.value ?? ''}. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {openDoc && <LegalModal doc={openDoc} onClose={() => setOpenDoc(null)} />}
    </>
  );
}
