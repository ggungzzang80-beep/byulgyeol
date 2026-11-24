/**
 * 사업자 정보 · 정책 문서 (legal.ts)
 * ------------------------------------------------------------------
 * 전자상거래법이 요구하는 사업자 정보 표시와, 결제 심사에 필요한
 * 이용약관 · 개인정보처리방침 · 환불/청약철회 정책을 한 곳에서 관리합니다.
 *
 * 값은 빌드 시 환경변수(VITE_BIZ_*)로 덮어쓸 수 있습니다.
 *   VITE_BIZ_COMPANY          상호 (기본: 모브릭)
 *   VITE_BIZ_REG_NO           사업자등록번호 (기본: 409-37-46363)
 *   VITE_BIZ_CEO              대표자명 (기본: 박진영)
 *   VITE_BIZ_TELECOM_NO       통신판매업 신고번호 (발급 후 기입)
 *   VITE_BIZ_ADDRESS          사업장 주소
 *   VITE_BIZ_PHONE            대표 전화번호 (기본: 010-9573-5868)
 *   VITE_BIZ_EMAIL            고객센터 이메일 (기본: ggungzzang80@naver.com)
 *   VITE_BIZ_PRIVACY_OFFICER  개인정보 보호책임자명 (기본: 박진영)
 *   VITE_BIZ_HOSTING          호스팅 제공자 (기본: Cloudflare, Inc.)
 *   VITE_BIZ_EFFECTIVE_DATE   정책 시행일 (기본: 2026-11-18)
 *
 * 아직 확정되지 않은 항목(통신판매업 신고번호)은 발급 후 환경변수만 채우면
 * 푸터와 정책 문서에 동시에 반영됩니다.
 */

const env = import.meta.env as Record<string, string | undefined>;

function value(keys: string[], fallback: string): string {
  for (const key of keys) {
    const raw = env[key];
    if (typeof raw === 'string' && raw.trim().length > 0) return raw.trim();
  }
  return fallback;
}

/**
 * 확인되지 않은 항목에 쓰는 표기 — 빈칸이나 '-' 대신 '무엇이 비어 있는지' 보이게 합니다.
 * QA(2026-11-24 4번): 화면에 환경변수 이름(VITE_BIZ_*)이 그대로 노출되지 않도록
 * 변수명은 코드 주석에만 남기고, 표기는 사람이 읽는 문장으로 씁니다.
 */
export const PENDING = '확인 후 기입';
export const PENDING_PHONE = '확인 후 기입';
export const PENDING_TELECOM_NO = '신고 준비 중';
export const BUSINESS = {
  company: value(['VITE_BIZ_COMPANY'], '모브릭'),
  registrationNo: value(['VITE_BIZ_REG_NO'], '409-37-46363'),
  representative: value(['VITE_BIZ_CEO', 'VITE_BIZ_REPRESENTATIVE'], '박진영'),
  mailOrderNo: value(['VITE_BIZ_TELECOM_NO', 'VITE_BIZ_MAIL_ORDER_NO'], PENDING_TELECOM_NO),
  address: value(['VITE_BIZ_ADDRESS'], '인천광역시 검단구 고산후로95번길 24, 4층 401호 -X245호(당하동, 그린프라자)'),
  tel: value(['VITE_BIZ_PHONE', 'VITE_BIZ_TEL'], '010-9573-5868'),
  email: value(['VITE_BIZ_EMAIL'], 'ggungzzang80@naver.com'),
  privacyOfficer: value(['VITE_BIZ_PRIVACY_OFFICER'], '박진영'),
  hosting: value(['VITE_BIZ_HOSTING'], 'Cloudflare, Inc.'),
  effectiveDate: value(['VITE_BIZ_EFFECTIVE_DATE'], '2026-11-18'),
} as const;

/** 푸터에 표시할 사업자 정보 행 (라벨 + 값) */
export function businessRows(): Array<{ label: string; value: string; pending: boolean }> {
  const rows: Array<[string, string]> = [
    ['상호', BUSINESS.company],
    ['대표자', BUSINESS.representative],
    ['사업자등록번호', BUSINESS.registrationNo],
    ['통신판매업 신고번호', BUSINESS.mailOrderNo],
    ['사업장 주소', BUSINESS.address],
    ['대표 전화', BUSINESS.tel],
    ['고객센터 이메일', BUSINESS.email],
    ['개인정보 보호책임자', BUSINESS.privacyOfficer],
    ['호스팅 제공자', BUSINESS.hosting],
  ];
  return rows.map(([label, v]) => ({
    label,
    value: v,
    pending: v.startsWith('확인 후 기입'),
  }));
}

/* ------------------------------------------------------------------ */
/* 정책 문서 3종                                                       */
/* ------------------------------------------------------------------ */

export type LegalDocId = 'terms' | 'privacy' | 'refund';

export type LegalBlock =
  | { kind: 'p'; text: string }
  | { kind: 'ul'; items: string[] };

export type LegalSection = { title: string; blocks: LegalBlock[] };

export type LegalDoc = {
  id: LegalDocId;
  /** 푸터·모달에 쓰는 이름 */
  title: string;
  /** 한 줄 요약 */
  summary: string;
  updated: string;
  sections: LegalSection[];
};

const SERVICE = '별의 속삭임';
const UPDATED = BUSINESS.effectiveDate;

const COMPANY_BLOCK: LegalSection = {
  title: '사업자 정보',
  blocks: [
    {
      kind: 'ul',
      items: [
        `상호: ${BUSINESS.company}`,
        `대표자: ${BUSINESS.representative}`,
        `사업자등록번호: ${BUSINESS.registrationNo}`,
        `통신판매업 신고번호: ${BUSINESS.mailOrderNo}`,
        `사업장 주소: ${BUSINESS.address}`,
        `대표 전화: ${BUSINESS.tel}`,
        `고객센터 이메일: ${BUSINESS.email}`,
        `개인정보 보호책임자: ${BUSINESS.privacyOfficer}`,
        `호스팅 제공자: ${BUSINESS.hosting}`,
      ],
    },
  ],
};

export const LEGAL_DOCS: Record<LegalDocId, LegalDoc> = {
  terms: {
    id: 'terms',
    title: '이용약관',
    summary: '서비스 이용 조건, 결제·환불, 책임 범위를 정한 기본 약속입니다.',
    updated: UPDATED,
    sections: [
      {
        title: '제1조 (목적)',
        blocks: [
          {
            kind: 'p',
            text: `이 약관은 ${BUSINESS.company}(이하 "회사")가 운영하는 ${SERVICE}(이하 "서비스")의 이용과 관련하여 회사와 이용자 사이의 권리·의무 및 책임 사항을 정하는 것을 목적으로 합니다.`,
          },
        ],
      },
      {
        title: '제2조 (정의)',
        blocks: [
          {
            kind: 'ul',
            items: [
              '"서비스"란 회사가 웹사이트를 통해 제공하는 동양 전통 자미두수·서양 점성술 기반의 디지털 리포트와 그 부가 콘텐츠를 말합니다.',
              '"이용자"란 이 약관에 따라 서비스를 이용하는 자를 말합니다.',
              '"유료 콘텐츠"란 결제 후 열람할 수 있는 디지털 리포트를 말합니다.',
              '"무료 콘텐츠"란 결제 없이 열람할 수 있는 명반·천궁도 요약, 미리보기, 카드 이미지 등을 말합니다.',
            ],
          },
        ],
      },
      {
        title: '제3조 (약관의 효력과 변경)',
        blocks: [
          {
            kind: 'p',
            text: '이 약관은 서비스 화면에 게시함으로써 효력이 발생합니다. 회사는 관련 법령을 위반하지 않는 범위에서 약관을 변경할 수 있으며, 변경하는 경우 적용일자와 변경 사유를 최소 7일 전(이용자에게 불리한 변경은 30일 전)에 서비스 화면에 공지합니다. 변경된 약관에 동의하지 않는 이용자는 이용을 중단할 수 있습니다.',
          },
        ],
      },
      {
        title: '제4조 (서비스의 내용)',
        blocks: [
          {
            kind: 'ul',
            items: [
              '생년월일시를 기반으로 한 12궁 명반·출생 천궁도 계산과 무료 요약 제공',
              '유료 디지털 리포트(핀셋 리포트, 전체 리포트, 궁합 리포트, 시너스트리 리포트, 통합 리포트, 신년 리포트) 열람',
              '공유용 카드 이미지 생성 및 저장',
              '기타 회사가 정하는 부가 콘텐츠',
            ],
          },
          {
            kind: 'p',
            text: '서비스는 오락과 자기 이해를 돕는 콘텐츠이며, 의료·법률·투자·진로 등 중요한 결정의 근거로 제공되지 않습니다.',
          },
        ],
      },
      {
        title: '제5조 (이용계약의 성립)',
        blocks: [
          {
            kind: 'p',
            text: '이용계약은 이용자가 유료 콘텐츠의 결제를 완료하고 회사가 이를 확인한 때 성립합니다. 회사는 결제 오류, 시스템 장애, 결제수단의 승인 거절 등 정상적인 서비스 제공이 어려운 경우 결제를 취소하고 그 사실을 안내할 수 있습니다.',
          },
        ],
      },
      {
        title: '제6조 (결제)',
        blocks: [
          {
            kind: 'ul',
            items: [
              '유료 콘텐츠의 결제는 회사가 위탁한 전자결제대행사(페이앱(PayApp))를 통해 처리됩니다.',
              '결제 수단과 승인 절차는 전자결제대행사 및 카드사·금융기관의 정책에 따릅니다.',
              '표시된 금액은 부가세를 포함한 최종 결제 금액입니다.',
              '결제 확인이 완료되면 유료 콘텐츠가 즉시 열람 가능 상태로 전환됩니다.',
            ],
          },
        ],
      },
      {
        title: '제7조 (청약철회 및 환불)',
        blocks: [
          {
            kind: 'p',
            text: '청약철회와 환불에 관한 구체적인 기준은 「환불 및 청약철회 정책」에서 정합니다. 유료 콘텐츠는 그 성질상 열람이 시작된 후에는 청약철회가 제한되며, 회사는 결제 전에 이 사실을 고지하고 이용자의 동의를 받습니다.',
          },
        ],
      },
      {
        title: '제8조 (이용자의 의무)',
        blocks: [
          {
            kind: 'ul',
            items: [
              '이용자는 타인의 정보를 도용하거나 허위 정보를 입력해서는 안 됩니다.',
              '리포트와 카드 이미지는 개인적 이용을 위한 것이며, 회사의 사전 동의 없이 복제·배포·판매하거나 2차적 저작물로 이용할 수 없습니다.',
              '서비스의 정상 운영을 방해하는 행위, 자동화된 수단으로 대량 요청하는 행위를 해서는 안 됩니다.',
            ],
          },
        ],
      },
      {
        title: '제9조 (서비스의 변경·중단)',
        blocks: [
          {
            kind: 'p',
            text: '회사는 서비스의 내용을 변경하거나 일부 또는 전부를 중단할 수 있습니다. 회사의 사정으로 유료 콘텐츠를 제공할 수 없게 된 경우 회사는 해당 이용자에게 그 사실을 알리고 결제 금액을 환불합니다.',
          },
        ],
      },
      {
        title: '제10조 (지식재산권)',
        blocks: [
          {
            kind: 'p',
            text: '서비스에 사용된 문구·해설·이미지·캐릭터·화면 구성 등 일체의 콘텐츠에 대한 저작권은 회사에 있습니다. 이용자는 회사가 허용한 범위에서만 이를 이용할 수 있습니다.',
          },
        ],
      },
      {
        title: '제11조 (책임의 제한)',
        blocks: [
          {
            kind: 'p',
            text: '서비스가 제공하는 해설은 전통 상담 문화와 계산 결과를 바탕으로 한 해석이며, 미래의 결과를 확정하거나 보장하지 않습니다. 이용자가 서비스의 내용을 참고해 내린 결정과 그 결과에 대해서는 이용자에게 책임이 있으며, 회사는 고의 또는 중대한 과실이 없는 한 그로 인한 손해를 배상하지 않습니다.',
          },
          {
            kind: 'p',
            text: '회사는 천재지변, 통신 장애, 전자결제대행사의 장애 등 회사의 합리적인 통제를 벗어난 사유로 발생한 손해에 대해서는 책임을 지지 않습니다.',
          },
        ],
      },
      {
        title: '제12조 (분쟁의 해결)',
        blocks: [
          {
            kind: 'p',
            text: '회사와 이용자는 서비스 이용과 관련한 분쟁을 원만하게 해결하기 위해 성실히 노력합니다. 협의가 이루어지지 않는 경우 관할 법원은 관련 법령이 정한 바에 따릅니다.',
          },
        ],
      },
      {
        title: '부칙',
        blocks: [{ kind: 'p', text: `이 약관은 ${UPDATED}부터 시행합니다.` }],
      },
      COMPANY_BLOCK,
    ],
  },

  privacy: {
    id: 'privacy',
    title: '개인정보처리방침',
    summary: '무엇을 왜 수집하고, 어디에 보관하며, 언제 파기하는지 정리했습니다.',
    updated: UPDATED,
    sections: [
      {
        title: '1. 총칙',
        blocks: [
          {
            kind: 'p',
            text: `${BUSINESS.company}(이하 "회사")는 ${SERVICE}을 운영하면서 이용자의 개인정보를 소중히 다루며, 「개인정보 보호법」 등 관련 법령을 준수합니다. 이 방침은 회사가 어떤 개인정보를 어떤 목적으로 수집·이용하고, 어떻게 보관·파기하는지를 안내합니다.`,
          },
        ],
      },
      {
        title: '2. 수집하는 개인정보 항목과 수집 방법',
        blocks: [
          {
            kind: 'ul',
            items: [
              '필수(무료 이용 시): 생년월일, 태어난 시간(모르는 경우 정오 기준), 성별, 양력·음력 구분, 이름(선택)',
              '필수(유료 결제 시): 휴대폰 번호(결제 요청·거래 확인용)',
              '선택(궁합·시너스트리 리포트): 상대방의 생년월일, 태어난 시간, 성별',
              '자동 수집: 접속 기록(IP 주소), 브라우저 정보, 결제 처리 과정에서 전자결제대행사가 생성하는 거래 식별 정보',
            ],
          },
          {
            kind: 'p',
            text: '회사는 이름·연락처처럼 리포트 계산에 필요하지 않은 정보를 입력받지 않도록 설계했으며, 입력하지 않아도 무료 서비스를 이용할 수 있습니다.',
          },
        ],
      },
      {
        title: '3. 개인정보의 처리 목적',
        blocks: [
          {
            kind: 'ul',
            items: [
              '명반·천궁도 계산과 디지털 리포트 생성·제공',
              '유료 콘텐츠 결제 요청, 결제 확인, 잠금 해제 처리',
              '환불·청약철회 처리와 문의 응대',
              '서비스 오류 분석과 안정성 개선(개인을 식별하지 않는 통계 형태)',
            ],
          },
          {
            kind: 'p',
            text: '수집한 정보는 위 목적 외에는 이용하지 않으며, 목적이 변경되는 경우 관련 법령에 따라 별도의 동의를 받습니다.',
          },
        ],
      },
      {
        title: '4. 보유 및 이용 기간',
        blocks: [
          {
            kind: 'ul',
            items: [
              '생년월일시·성별 등 리포트 계산 정보: 브라우저 안에서만 계산에 사용되며 회사 서버에 저장하지 않습니다.',
              '결제 주문 정보(주문번호·상품·결제금액·결제 상태·휴대폰 번호): 결제 확인과 환불 대응을 위해 결제일로부터 5년간 보관 후 파기합니다. (전자상거래법상 계약·결제 기록 보존 기간)',
              '문의 응대 기록: 처리 완료 후 3년',
              '접속 기록: 3개월',
            ],
          },
        ],
      },
      {
        title: '5. 개인정보의 제3자 제공',
        blocks: [
          {
            kind: 'p',
            text: '회사는 이용자의 개인정보를 제3자에게 제공하지 않습니다. 다만 법령에 따라 수사기관 등이 적법한 절차로 요구하는 경우에는 그 범위에서 제공할 수 있습니다.',
          },
        ],
      },
      {
        title: '6. 개인정보 처리의 위탁',
        blocks: [
          {
            kind: 'ul',
            items: [
              '페이앱(PayApp): 결제 요청, 승인, 취소 등 전자결제 처리 — 위탁 항목: 상품명, 결제금액, 휴대폰 번호',
              `${BUSINESS.hosting}: 웹사이트 호스팅과 결제 확인 서버 운영 — 위탁 항목: 접속 기록, 결제 주문 정보`,
            ],
          },
          {
            kind: 'p',
            text: '회사는 위탁 계약 시 개인정보 보호 관련 법령 준수를 명시하고 있으며, 위탁 업무의 내용이 변경되면 이 방침을 통해 공개합니다.',
          },
        ],
      },
      {
        title: '7. 개인정보의 파기 절차와 방법',
        blocks: [
          {
            kind: 'ul',
            items: [
              '파기 사유가 발생하면 보관 기간이 끝난 날로부터 지체 없이(5일 이내) 파기합니다.',
              '전자적 파일은 복구할 수 없는 방법으로 삭제하고, 종이 문서는 분쇄하거나 소각합니다.',
              '법령에 따라 보존해야 하는 기록은 별도의 저장 공간에 분리 보관한 뒤 기간이 끝나면 파기합니다.',
            ],
          },
        ],
      },
      {
        title: '8. 이용자의 권리와 행사 방법',
        blocks: [
          {
            kind: 'ul',
            items: [
              '이용자는 언제든지 자신의 개인정보 열람·정정·삭제·처리 정지를 요구할 수 있습니다.',
              '요청 방법: 고객센터 이메일로 요청 — 회사는 본인 확인 후 10일 이내에 처리하고 결과를 알립니다.',
              '브라우저의 저장 공간(로컬 스토리지)을 비우면 기기에 저장된 결제 대기 정보가 삭제됩니다.',
            ],
          },
        ],
      },
      {
        title: '9. 쿠키와 브라우저 저장소',
        blocks: [
          {
            kind: 'p',
            text: '회사는 로그인 없이 동작하는 서비스를 위해 브라우저 저장 공간(로컬 스토리지)을 사용합니다. 이곳에는 결제 대기 주문 번호와 열람 상태만 저장되며, 광고나 행태 추적을 위한 쿠키는 사용하지 않습니다.',
          },
        ],
      },
      {
        title: '10. 개인정보의 안전성 확보 조치',
        blocks: [
          {
            kind: 'ul',
            items: [
              '결제 확인은 서버 간 통신으로 처리하고, 위·변조 여부를 검증한 뒤에만 콘텐츠를 열어 줍니다.',
              '결제 키와 검증 키는 서버에만 보관하며 웹사이트 화면에는 노출되지 않습니다.',
              '개인정보 취급 인원을 최소화하고 정기적으로 접근 권한을 점검합니다.',
            ],
          },
        ],
      },
      {
        title: '11. 개인정보 보호책임자',
        blocks: [
          {
            kind: 'ul',
            items: [
              `개인정보 보호책임자: ${BUSINESS.privacyOfficer}`,
              `문의: ${BUSINESS.email}`,
            ],
          },
          {
            kind: 'p',
            text: '개인정보와 관련한 문의·불만·피해 구제는 위 연락처로 접수할 수 있으며, 회사는 접수 후 10일 이내에 답변합니다. 개인정보 침해에 대한 신고나 상담이 필요한 경우 개인정보침해신고센터(privacy.kisa.or.kr, 국번 없이 118)에 문의할 수 있습니다.',
          },
        ],
      },
      {
        title: '12. 방침의 변경',
        blocks: [
          {
            kind: 'p',
            text: '이 방침이 변경되는 경우 회사는 변경 내용과 시행일을 서비스 화면에 최소 7일 전에 공지합니다. 이용자에게 중대한 영향을 미치는 변경은 30일 전에 알립니다.',
          },
        ],
      },
      {
        title: '시행일',
        blocks: [{ kind: 'p', text: `이 방침은 ${UPDATED}부터 적용됩니다.` }],
      },
      COMPANY_BLOCK,
    ],
  },

  refund: {
    id: 'refund',
    title: '환불 및 청약철회 정책',
    summary: '디지털 콘텐츠의 청약철회 기한과 환불 절차를 안내합니다.',
    updated: UPDATED,
    sections: [
      {
        title: '1. 적용 범위',
        blocks: [
          {
            kind: 'p',
            text: `이 정책은 ${BUSINESS.company}가 ${SERVICE}에서 판매하는 유료 디지털 콘텐츠(리포트 열람 권한)에 적용됩니다. 무료 콘텐츠에는 적용되지 않습니다.`,
          },
        ],
      },
      {
        title: '2. 콘텐츠의 성격',
        blocks: [
          {
            kind: 'p',
            text: '유료 콘텐츠는 결제가 확인되는 즉시 화면에 열리는 디지털 콘텐츠입니다. 실물 상품의 배송이 없으며, 파일이나 인쇄물을 따로 발송하지 않습니다.',
          },
        ],
      },
      {
        title: '3. 청약철회 가능 기간',
        blocks: [
          {
            kind: 'ul',
            items: [
              '이용자는 결제일로부터 7일 이내에 청약철회를 요청할 수 있습니다.',
              '단, 유료 콘텐츠의 열람이 시작된 경우에는 청약철회가 제한됩니다.',
              '결제 후 7일이 지나기 전이라도 리포트를 한 번이라도 열어 본 경우에는 같은 기준이 적용됩니다.',
            ],
          },
        ],
      },
      {
        title: '4. 청약철회 제한 사전 고지와 동의',
        blocks: [
          {
            kind: 'p',
            text: '회사는 결제 화면에서 "디지털 콘텐츠가 즉시 제공되어 청약 철회가 제한된다"는 사실을 고지하고, 이용자가 동의 체크를 한 경우에만 결제를 진행합니다. 이 동의가 없는 경우 회사는 결제를 진행하지 않습니다.',
          },
          {
            kind: 'p',
            text: '다음의 경우에는 열람이 시작되었더라도 전액 환불합니다.',
          },
          {
            kind: 'ul',
            items: [
              '결제한 리포트가 열리지 않거나 오류로 내용을 확인할 수 없는 경우',
              '결제한 것과 다른 상품이 열린 경우',
              '중복 결제가 발생한 경우',
              '회사의 사정으로 서비스를 제공할 수 없게 된 경우',
            ],
          },
        ],
      },
      {
        title: '5. 환불 요청 방법',
        blocks: [
          {
            kind: 'ul',
            items: [
              `고객센터 이메일(${BUSINESS.email})로 주문 정보(결제일, 결제 금액, 휴대폰 번호)와 환불 사유를 보내 주세요.`,
              '본인 확인 후 처리 결과를 회신합니다.',
              '결제 취소는 페이앱(PayApp)을 통해 이루어지며, 카드사·금융기관의 처리 일정에 따라 카드 매출 취소가 반영되기까지 영업일 기준 3~7일이 걸릴 수 있습니다.',
            ],
          },
        ],
      },
      {
        title: '6. 환불 처리 기한',
        blocks: [
          {
            kind: 'p',
            text: '회사는 환불 사유를 확인한 날로부터 3영업일 이내에 결제 취소를 요청합니다. 이용자가 결제한 수단으로 환불하는 것이 원칙이며, 부득이한 경우 이용자에게 안내하고 동의를 받은 뒤 다른 방법으로 환불합니다.',
          },
        ],
      },
      {
        title: '7. 부분 환불',
        blocks: [
          {
            kind: 'p',
            text: '통합 리포트처럼 두 개 이상의 콘텐츠가 묶인 상품은 이미 열람한 부분을 제외한 나머지에 대해 부분 환불을 요청할 수 있습니다. 부분 환불 금액은 열람한 상품의 개별 판매가를 기준으로 계산합니다.',
          },
        ],
      },
      {
        title: '8. 문의처',
        blocks: [
          {
            kind: 'ul',
            items: [
              `상호: ${BUSINESS.company}`,
              `고객센터 이메일: ${BUSINESS.email}`,
              `대표 전화: ${BUSINESS.tel}`,
            ],
          },
        ],
      },
      {
        title: '시행일',
        blocks: [{ kind: 'p', text: `이 정책은 ${UPDATED}부터 적용됩니다.` }],
      },
    ],
  },
};

export const LEGAL_ORDER: LegalDocId[] = ['terms', 'privacy', 'refund'];

/** 결제 화면 동의 문구에 붙는 정책 링크 이름 */
export const LEGAL_LINK_LABEL: Record<LegalDocId, string> = {
  terms: '이용약관',
  privacy: '개인정보처리방침',
  refund: '환불 정책',
};
