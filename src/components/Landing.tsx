import type { BirthInput } from '../lib/chart';
import type { ProductId } from '../lib/products';
import type { SystemId } from '../lib/systems';
import { useTheme } from '../lib/theme';
import type { BirthDraft } from './BirthForm';
import type { MutableRefObject } from 'react';
import MysticLanding from './MysticLanding';
import CharacterLanding from './CharacterLanding';

type Props = {
  onSubmit: (input: BirthInput) => void;
  draftRef?: MutableRefObject<BirthDraft | null>;
  onProduct: (id: ProductId) => void;
  /** 랜딩의 2027 신년 부적 배너 */
  onNewYear: () => void;
  system: SystemId;
  onSystemChange: (system: SystemId) => void;
  /** 랜딩 마법사 단계 (0 인트로 · 1 입력 · 2 별 이야기) */
  step: number;
  onStep: (step: number) => void;
};

/** 두 테마는 완전히 다른 랜딩을 씁니다. 계산·결제·리포트 화면은 하나를 공유합니다. */
export default function Landing(props: Props) {
  const { theme } = useTheme();
  return theme === 'character' ? <CharacterLanding {...props} /> : <MysticLanding {...props} />;
}
