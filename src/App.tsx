import { useCallback, useEffect, useRef, useState } from 'react';
import type { BirthInput, ChartModel } from './lib/chart';
import { buildChart } from './lib/chart';
import type { WesternModel } from './lib/western';
import { buildWestern } from './lib/western';
import { PRODUCTS, findProduct, type Product, type ProductId } from './lib/products';
import { readSystemFromUrl, writeSystemToUrl, type SystemId } from './lib/systems';
import { ThemeProvider, readThemeFromUrl, type ThemeId } from './lib/theme';
import Landing from './components/Landing';
import type { BirthDraft } from './components/BirthForm';
import ChartView from './components/ChartView';
import CheckoutModal from './components/CheckoutModal';
import PremiumReport from './components/PremiumReport';
import CompatReport from './components/CompatReport';
import CompatPreview from './components/CompatPreview';
import WesternView from './components/WesternView';
import WesternReport from './components/WesternReport';
import SynastryPreview from './components/SynastryPreview';
import SynastryReport from './components/SynastryReport';
import NewYearReport from './components/NewYearReport';
import ThemeToggle from './components/ThemeToggle';
import LegalFooter from './components/LegalFooter';
import { PAYMENTS_LIVE, ZIWEI_ONLY } from './config/env';
import {
  clearPendingOrder,
  cleanReturnUrl,
  fetchOrderStatus,
  readPendingOrder,
  readReturnedOrderId,
  verifyUnlockToken,
} from './lib/payments';

type View = 'landing' | 'chart' | 'report' | 'compat' | 'western' | 'westernReport' | 'synastry' | 'newyear2027';

export default function App() {
  const [theme, setThemeState] = useState<ThemeId>(() => readThemeFromUrl());
  const [system, setSystemState] = useState<SystemId>(() => readSystemFromUrl());
  const [view, setView] = useState<View>('landing');
  /** 랜딩 마법사 단계 — 0 인트로 · 1 입력 · 2 별 이야기 */
  const [landingStep, setLandingStep] = useState(0);
  /** 결과 마법사 단계 — 0 수호별 · 1 12개 별방 · 2 올해의 흐름 · 3 2027 부적 · 4 별 이야기 */
  const [chartStep, setChartStep] = useState(0);
  const [chart, setChart] = useState<ChartModel | null>(null);
  /** 결제 후 돌아왔을 때 리포트를 다시 그리기 위한 입력값 (화면 상태로만 보관) */
  const [birthInput, setBirthInput] = useState<BirthInput | null>(null);
  const [western, setWestern] = useState<WesternModel | null>(null);
  const [partner, setPartner] = useState<ChartModel | null>(null);
  const [checkout, setCheckout] = useState<Product | null>(null);
  const [pendingProduct, setPendingProduct] = useState<ProductId | null>(null);
  /** 궁합 무료 프리뷰(점수 먼저) — 결제 전 단계 */
  const [compatPreview, setCompatPreview] = useState(false);
  /** 시너스트리(서양 점성술 두 사람 궁합) 무료 프리뷰 — 결제 전 단계 */
  const [synastryPreview, setSynastryPreview] = useState(false);
  /** 시너스트리 상대방 천궁도와 열람 여부 */
  const [partnerWestern, setPartnerWestern] = useState<WesternModel | null>(null);
  const [synastryPaid, setSynastryPaid] = useState(false);
  /** 프리뷰에서 입력한 상대방 정보 — 결제 모달에 그대로 넘겨 재입력을 없앱니다. */
  const [partnerDraft, setPartnerDraft] = useState<BirthInput | null>(null);
  const [synastryDraft, setSynastryDraft] = useState<BirthInput | null>(null);
  const [ziweiTier, setZiweiTier] = useState<'none' | 'basic' | 'premium'>('none');
  const [westernPaid, setWesternPaid] = useState(false);
  const [hasBundle, setHasBundle] = useState(false);
  /** 2027 정미년 신년 정밀 리포트 열람 여부 (결제 후 열림) */
  const [newYearUnlocked, setNewYearUnlocked] = useState(false);
  /** 랜딩의 2027 부적 버튼으로 들어왔을 때 결과 화면에서 부적 섹션으로 이동 */
  const [focusNewYear, setFocusNewYear] = useState(false);
  const [focusAi, setFocusAi] = useState(false);
  /** 랜딩 상단 폼에 지금 적힌 값 — '부적 받기'를 눌렀을 때 바로 계산에 씁니다. */
  const landingDraftRef = useRef<BirthDraft | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const setTheme = useCallback((next: ThemeId) => {
    setThemeState(next);
    const url = new URL(window.location.href);
    url.searchParams.set('theme', next);
    window.history.replaceState({}, '', url);
  }, []);

  const setSystem = useCallback(
    (next: SystemId) => {
      /* 자미두수 단독 빌드 — 서양 점성술로는 넘어가지 않습니다. */
      if (ZIWEI_ONLY) return;
      setSystemState(next);
      writeSystemToUrl(next);
      // 결과 화면을 보고 있으면 같은 입력의 다른 체계 결과로 바로 넘어갑니다.
      setView((current) => {
        if (current === 'chart' || current === 'report') return next === 'western' ? 'western' : 'chart';
        if (current === 'western' || current === 'westernReport') return next === 'ziwei' ? 'chart' : 'western';
        return current;
      });
    },
    [],
  );

  useEffect(() => {
    document.title =
      system === 'western'
        ? '서양 점성술 · 출생 천궁도로 읽는 나의 좌표'
        : theme === 'character'
          ? '별의 속삭임 · 별빛 가디언이 읽어주는 나만의 사용설명서'
          : '자미원 紫微垣 · 천문이 읽고, 별이 말하다';
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'character' ? '#F7EFFF' : '#090812');
    document.documentElement.style.background = theme === 'character' ? '#F7EFFF' : '#090812';
  }, [theme, system]);

  const flash = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 3200);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [view]);

  const openChart = async (input: BirthInput, target?: SystemId) => {
    try {
      // 두 체계는 같은 입력에서 동시에 계산됩니다. 화면은 고른 체계만 보여줍니다.
      const [built, west] = await Promise.all([buildChart(input), buildWestern(input)]);
      const wanted = target ?? system;
      setBirthInput(input);
      setChart(built);
      setWestern(west);
      setChartStep(0);
      setView(wanted === 'western' ? 'western' : 'chart');
      if (pendingProduct) {
        const id = pendingProduct;
        setPendingProduct(null);
        // 궁합은 결제 전에 무료 점수부터 보여 줍니다.
        if (id === 'compat') window.setTimeout(() => setCompatPreview(true), 400);
        else window.setTimeout(() => setCheckout(findProduct(id)), 500);
      }
    } catch (err) {
      flash(err instanceof Error ? err.message : '명반을 계산하지 못했어요. 입력값을 확인해 주세요.');
    }
  };

  const handleProductFromLanding = (id: ProductId) => {
    const product = findProduct(id);
    /* 자미두수 단독 빌드 — 서양·통합 상품 동선은 열지 않습니다(화면에도 오르지 않음). */
    if (ZIWEI_ONLY && product.system !== 'ziwei') return;
    // 시너스트리 상품은 천궁도가 있으면 무료 점수 프리뷰부터 엽니다.
    if (id === 'synastry') {
      if (western) {
        setSynastryPreview(true);
        return;
      }
      if (system !== 'western') setSystem('western');
      document.getElementById('western-chart')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      flash(
        theme === 'character'
          ? '먼저 네 천궁도를 그리면 상대와의 궁합 점수를 바로 볼 수 있어!'
          : '먼저 내 천궁도를 열면 두 사람의 궁합 점수를 무료로 볼 수 있습니다.',
      );
      return;
    }
    // 궁합 상품은 결과가 있으면 무료 점수 → 유료 심층 동선으로 안내합니다.
    if (id === 'compat' && chart) {
      setCompatPreview(true);
      return;
    }
    if (id === 'compat' && !chart) {
      setPendingProduct('compat');
      if (system === 'western') document.getElementById('western-chart')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      else setLandingStep(1);
      flash(
        theme === 'character'
          ? '먼저 네 별지도를 그리면 궁합 점수를 바로 볼 수 있어!'
          : '먼저 명반을 열면 궁합 점수를 무료로 볼 수 있습니다.',
      );
      return;
    }
    // 서양 점성술 상품은 동양 결과가 없어도 결제 동선이 열립니다.
    const needsChart = product.system !== 'western' || !western;
    if (!needsChart && western) {
      setCheckout(product);
      return;
    }
    setPendingProduct(id);
    if (chart) {
      setCheckout(product);
      setPendingProduct(null);
      return;
    }
    if (system === 'western') document.getElementById('western-chart')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    else setLandingStep(1);
    flash(
      theme === 'character'
        ? '먼저 태어난 순간을 알려주면, 바로 이어서 열어줄게!'
        : '먼저 생년월일시를 입력하면 바로 이어서 열어드리겠습니다.',
    );
  };

  const handleUnlock = (id: ProductId) => {
    setFocusAi(false);
    // 2027 신년 리포트는 전용 화면으로 이어집니다 (결제 확인 후 바로 열림).
    if (id === 'newyear2027') {
      if (newYearUnlocked) {
        setCheckout(null);
        setView('newyear2027');
        return;
      }
      setCheckout(findProduct('newyear2027'));
      return;
    }
    // 궁합은 결제창보다 무료 점수 프리뷰를 먼저 엽니다.
    if (id === 'compat') {
      setCheckout(null);
      setCompatPreview(true);
      return;
    }
    // 시너스트리도 결제창보다 무료 점수 프리뷰를 먼저 엽니다. (이미 결제한 상대가 있으면 바로 리포트)
    if (id === 'synastry') {
      setCheckout(null);
      if (synastryPaid && partnerWestern) {
        setView('synastry');
        return;
      }
      setSynastryPreview(true);
      return;
    }
    if (id === 'western' && westernPaid) {
      setView('westernReport');
      return;
    }
    if ((id === 'premium' || id === 'basic') && ziweiTier !== 'none') {
      setView('report');
      return;
    }
    if (id === 'bundle' && hasBundle) {
      setView('report');
      return;
    }
    setCheckout(findProduct(id));
  };

  /** 무료 결과의 'AI 심층 리포트' 버튼: 결제 후 리포트의 핀셋 해설로 바로 이동 */
  const handleAiReport = () => {
    setFocusAi(true);
    setCheckout(findProduct(theme === 'character' ? 'basic' : 'premium'));
  };

  /**
   * 결제 확인 후 리포트를 여는 공통 처리.
   * 페이앱 결제창에서 돌아온 경우(복원)에도 같은 함수를 씁니다.
   */
  const applyPaid = useCallback(
    async (id: ProductId, partnerInput?: BirthInput) => {
      if (id === 'compat') {
        if (!partnerInput) return;
        try {
          setPartner(await buildChart(partnerInput));
          setView('compat');
        } catch {
          flash('상대방 명반을 계산하지 못했어요. 생년월일을 확인해 주세요.');
        }
        return;
      }

      if (id === 'synastry') {
        if (!partnerInput) return;
        try {
          setPartnerWestern(await buildWestern(partnerInput));
          setSynastryPaid(true);
          setView('synastry');
        } catch {
          flash('상대방 천궁도를 계산하지 못했어요. 생년월일을 확인해 주세요.');
        }
        return;
      }

      if (id === 'western') {
        setWesternPaid(true);
        setSystemState('western');
        writeSystemToUrl('western');
        setView('westernReport');
        return;
      }

      if (id === 'newyear2027') {
        setNewYearUnlocked(true);
        setView('newyear2027');
        return;
      }

      if (id === 'bundle') {
        setHasBundle(true);
        setWesternPaid(true);
        setZiweiTier('premium');
        setView(system === 'western' ? 'westernReport' : 'report');
        return;
      }

      setZiweiTier(id === 'basic' ? 'basic' : 'premium');
      setView('report');
    },
    [system, flash],
  );

  const handlePaid = async (partnerInput?: BirthInput) => {
    if (!checkout || !chart) return;
    const id = checkout.id;
    setCheckout(null);
    await applyPaid(id, partnerInput);
  };

  /**
   * 페이앱 결제창에서 돌아왔을 때 — 주문 상태를 확인하고 리포트를 엽니다.
   * 통보(feedback)가 아직 도착하지 않았을 수 있어 몇 차례 다시 확인합니다.
   */
  useEffect(() => {
    if (!PAYMENTS_LIVE) return;
    let cancelled = false;
    const pending = readPendingOrder();
    if (!pending) {
      cleanReturnUrl();
      return;
    }

    const refreshThemeFromUrl = () => {
      const next = readThemeFromUrl();
      setThemeState(next);
    };

    const confirm = async () => {
      for (let attempt = 0; attempt < 8; attempt += 1) {
        if (cancelled) return;
        try {
          const status = await fetchOrderStatus(pending.orderId);
          if (cancelled) return;
          if (status.status === 'canceled') {
            clearPendingOrder();
            cleanReturnUrl();
            flash('결제가 취소되었습니다. 필요하면 다시 결제해 주세요.');
            return;
          }
          if (status.status === 'paid' && status.token) {
            const verified = await verifyUnlockToken(status.token, pending.productId);
            if (cancelled) return;
            if (!verified.valid) {
              flash('결제는 확인되었지만 열람 권한 확인에 실패했습니다. 고객센터로 문의해 주세요.');
              return;
            }
            const [built, west] = await Promise.all([buildChart(pending.input), buildWestern(pending.input)]);
            if (cancelled) return;
            setBirthInput(pending.input);
            setChart(built);
            setWestern(west);
            refreshThemeFromUrl();
            await applyPaid(pending.productId, pending.partnerInput ?? undefined);
            clearPendingOrder();
            cleanReturnUrl();
            flash('결제가 확인되어 리포트를 열었습니다.');
            return;
          }
        } catch {
          /* 통보 지연·네트워크 오류 — 다음 차례에 다시 확인합니다. */
        }
        await new Promise((resolve) => window.setTimeout(resolve, 2500));
      }
    };

    if (readReturnedOrderId()) flash('결제를 확인하고 있어요. 잠시만 기다려 주세요.');
    void confirm();
    return () => {
      cancelled = true;
    };
    // 결제 복원은 앱이 처음 뜰 때 한 번만 시도합니다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * 랜딩의 2027 신년 부적 배너.
   * 상단 폼에 생년월일이 이미 적혀 있으면 그 값으로 바로 계산해 부적 화면으로 넘어가고,
   * 실제로 비어 있을 때만 입력으로 안내합니다.
   */
  const handleNewYearFromLanding = () => {
    /* 폼이 마지막으로 그린 값을 그대로 읽습니다 (상태 반영을 기다리지 않음) */
    const draft = landingDraftRef.current;
    if (draft?.complete) {
      /* 부적은 자미두수 화면입니다 — 서양 탭에서 눌러도 자미두수로 돌아옵니다. */
      if (system === 'western') {
        setSystemState('ziwei');
        writeSystemToUrl('ziwei');
      }
      setFocusNewYear(true);
      if (chart) {
        setView('chart');
        return;
      }
      void openChart(draft.input, 'ziwei');
      return;
    }

    setFocusNewYear(false);
    setLandingStep(1);
    window.setTimeout(() => {
      const yearSelect = document.getElementById('birth-year') as HTMLSelectElement | null;
      yearSelect?.focus({ preventScroll: true });
    }, 420);
    flash(
      theme === 'character'
        ? '생년월일만 알려주면 2027 부적을 바로 그려줄게!'
        : '생년월일을 입력하시면 2027 부적을 바로 그려드립니다.',
    );
  };

  return (
    <ThemeProvider theme={theme} setTheme={setTheme}>
      <div className={`theme theme-${theme}`}>
        {view === 'landing' && (
          <Landing
            onSubmit={openChart}
            draftRef={landingDraftRef}
            onProduct={handleProductFromLanding}
            onNewYear={handleNewYearFromLanding}
            system={system}
            onSystemChange={setSystem}
            step={landingStep}
            onStep={setLandingStep}
          />
        )}

        {view === 'chart' && chart && (
          <ChartView
            chart={chart}
            system={system}
            onSystemChange={setSystem}
            newYearUnlocked={newYearUnlocked}
            focusNewYear={focusNewYear}
            onFocusNewYearHandled={() => setFocusNewYear(false)}
            step={chartStep}
            onStep={setChartStep}
            onReset={() => {
              setBirthInput(null);
              setChart(null);
              setWestern(null);
              setPartner(null);
              setPartnerWestern(null);
              setSynastryPaid(false);
              setZiweiTier('none');
              setWesternPaid(false);
              setHasBundle(false);
              setNewYearUnlocked(false);
              setLandingStep(0);
              setChartStep(0);
              setView('landing');
            }}
            onUnlock={handleUnlock}
            onAiReport={handleAiReport}
            onCompatPreview={() => {
              setCheckout(null);
              setCompatPreview(true);
            }}
          />
        )}

        {view === 'newyear2027' && chart && (
          <NewYearReport chart={chart} onBack={() => setView('chart')} />
        )}

        {view === 'western' && western && (
          <WesternView
            model={western}
            onSystemChange={setSystem}
            onReset={() => {
              setBirthInput(null);
              setChart(null);
              setWestern(null);
              setPartner(null);
              setPartnerWestern(null);
              setSynastryPaid(false);
              setZiweiTier('none');
              setWesternPaid(false);
              setHasBundle(false);
              setView('landing');
            }}
            onUnlock={handleUnlock}
            onSynastry={() => {
              if (synastryPaid && partnerWestern) {
                setView('synastry');
                return;
              }
              setSynastryPreview(true);
            }}
          />
        )}

        {view === 'report' && chart && (
          <PremiumReport
            chart={chart}
            tier={ziweiTier === 'basic' ? 'basic' : 'premium'}
            focusAi={focusAi}
            onBack={() => setView('chart')}
            onCompat={() => handleUnlock('compat')}
            onUpgrade={() => handleUnlock('premium')}
            onBundle={() => handleUnlock('bundle')}
          />
        )}

        {view === 'westernReport' && western && (
          <WesternReport
            model={western}
            hasBundle={hasBundle}
            onBack={() => setView('western')}
            onOpenZiwei={() => setView(chart && ziweiTier !== 'none' ? 'report' : 'chart')}
            onBundle={() => handleUnlock('bundle')}
          />
        )}

        {view === 'compat' && chart && partner && (
          <CompatReport
            chart={chart}
            partner={partner}
            onBack={() => setView('chart')}
            onPremium={() => handleUnlock('premium')}
          />
        )}

        {compatPreview && chart && (
          <CompatPreview
            chart={chart}
            onClose={() => setCompatPreview(false)}
            onUpgrade={(input) => {
              setPartnerDraft(input);
              setCompatPreview(false);
              setCheckout(findProduct('compat'));
            }}
          />
        )}

        {view === 'synastry' && western && partnerWestern && (
          <SynastryReport
            model={western}
            partner={partnerWestern}
            onBack={() => setView('western')}
            onAgain={() => {
              setSynastryPaid(false);
              setPartnerWestern(null);
              setSynastryPreview(true);
            }}
          />
        )}

        {synastryPreview && western && (
          <SynastryPreview
            model={western}
            onClose={() => setSynastryPreview(false)}
            onUpgrade={(input) => {
              setSynastryDraft(input);
              setSynastryPreview(false);
              setCheckout(findProduct('synastry'));
            }}
          />
        )}

        {checkout && chart && (
          <CheckoutModal
            product={checkout}
            chartName={chart.name}
            birthInput={birthInput}
            initialPartner={checkout.id === 'compat' ? partnerDraft : checkout.id === 'synastry' ? synastryDraft : null}
            onClose={() => setCheckout(null)}
            onPaid={handlePaid}
            onSelect={(id) => setCheckout(findProduct(id))}
          />
        )}

        {toast && (
          <div
            className="fixed bottom-20 left-1/2 z-[60] max-w-[90vw] -translate-x-1/2 animate-rise rounded-full px-5 py-3 text-center text-[13.5px] shadow-lg"
            style={{
              background: 'var(--panel-bg)',
              color: 'var(--panel-text)',
              border: '1px solid var(--panel-line)',
            }}
          >
            {toast}
          </div>
        )}

        <LegalFooter />

        <ThemeToggle />
      </div>
    </ThemeProvider>
  );
}
