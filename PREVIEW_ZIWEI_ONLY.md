# 자미두수 단독 오픈 프리뷰 (VITE_ZIWEI_ONLY)

2026-11-19 · 박진영(@kooleumi8) 님 측 확정 우선순위 2번 작업.
라이브(`ggungzzang2/byulgyeol` `main` → `gh-pages`)는 **아직 건드리지 않았습니다.**

## 1. 무엇을 숨겼나 (코드·데이터는 그대로)

빌드 스위치 하나로 켜고 끕니다. `src/config/env.ts`

```
VITE_ZIWEI_ONLY=true   # 자미두수 단독 프리뷰 빌드
VITE_ZIWEI_ONLY=false  # (기본) 지금 라이브와 같은 2체계 화면
```

| 화면 | 단독 빌드에서 달라지는 점 |
| --- | --- |
| 랜딩(별의 속삭임·자미원) | 체계 선택 탭 숨김, 상품이 자미두수 3권만, '내일의 운세' 중복 배너 제거, 커피 한 잔 값 문구 중복 제거, 월간 편지 안내에서 서양·통합 문구 제거 |
| 결과 화면 | 체계 탭·서양 상품 묶음·'서양 네이탈 통합 준비 중' 안내 숨김 |
| 결제창 | 자미두수 단일 레인(체계 선택 3버튼 숨김), 상품 목록에서 서양·시너스트리·통합 제외 |
| 주소 진입 | `?system=western` 으로도 서양 화면에 들어갈 수 없음 |

서양 점성술 화면(`WesternLanding`, `WesternView`, `WesternReport`, `Synastry*`), 계산(`lib/western.ts`), 상품 데이터(`products.ts`)는 **전부 그대로 남아 있습니다.** 스위치를 지우고 다시 빌드하면 원래 화면이 됩니다.

## 2. 빌드·확인

```bash
cd /workspace/projects/ziwei-app
npm run build:ziwei-only      # VITE_ZIWEI_ONLY=true + base '/'
npm run preview               # http://127.0.0.1:4173/
```

검증(로컬):

- `npm run build` (타입체크 포함) 통과 — 단독 빌드·기본 빌드 모두
- Playwright 검증 `node scripts/verify-ziwei-only.mjs only|full` → 단독 6/6, 기본 3/3 통과, 콘솔 에러 0
- 예시 명반 → 결과 → 궁합 무료 점수 → 프리미엄 결제창 흐름 콘솔 에러 0
- 모바일(390×844) 문서 높이: 별의 속삭임 6,588 → 4,993px(−1,595), 자미원 8,611 → 7,019px(−1,592)

## 3. 프리뷰 공개 방식 (라이브에 영향 없이)

GitHub Pages 설정 확인 결과: `gh-pages` 브랜치 `/` 를 그대로 서빙(legacy build), 사이트는 저장소당 1개.

**권장 — 같은 사이트의 `/preview/` 하위 경로**

```bash
VITE_ZIWEI_ONLY=true VITE_BASE_PATH=/byulgyeol/preview/ npm run build
# gh-pages 체크아웃에 dist 내용을 preview/ 아래로 복사해 커밋·푸시
```

→ `https://ggungzzang2.github.io/byulgyeol/preview/` (루트 라이브는 그대로)
로컬에서 같은 구조(`/byulgyeol/preview/`)로 띄워 HTTP 200·콘솔 에러 0 확인했습니다.

### 2026-11-19 배포 완료 상태

- 공개 주소: **https://ggungzzang2.github.io/byulgyeol/preview/** (자미원은 `?theme=mystic`)
- `gh-pages` 브랜치 커밋 `d91e0ea` — 루트 22개 파일은 손대지 않고 `preview/` 22개 파일만 추가·교체
- 배포 빌드 소스: `preview/ziwei-only` 브랜치 `47036dc`
  (4acb455 박아름 님 요청 2건 + 자미원 하단 안내에서 '천궁도' 문구 제거)
- 검증(390×844 라이브): 정상 로드·서양 점성술 탭/문구 0건·보라 카드 제목 흰색 대비 6.23:1·
  자미원 "계산합니다. 성격의" 띄어쓰기 정상·콘솔 에러 0건. 캡처 `downloads/byulgyeol_preview_live_check.png`

재배포는 같은 방식으로 하면 됩니다: `VITE_ZIWEI_ONLY=true VITE_BASE_PATH=/byulgyeol/preview/ npm run build`
→ `gh-pages` 체크아웃에서 `preview/` 를 통째로 지우고 `dist/` 내용으로 교체 → 커밋·푸시.
**루트 라이브 배포 때 `preview/` 를 지우지 않도록 주의하세요.** (이 저장소에는 배포 스크립트가 없어
수동으로 올린 이력만 있습니다 — 루트를 `dist` 로 통째로 바꾸면 `preview/` 가 사라집니다.)

주의: 현재 `.deploy/deploy.sh` 는 배포 때 `gh-pages` 를 `dist` 로 **force-push** 하므로 `preview/` 가 지워집니다. 프리뷰를 계속 살려 두려면 배포 스크립트에 `preview/` 보존 한 줄을 넣거나, 프리뷰가 끝나면 다시 올리면 됩니다.

**대안**

1. 새 저장소 `byulgyeol-preview` + Pages → `https://ggungzzang2.github.io/byulgyeol-preview/` (새 저장소 생성 승인 필요)
2. Cloudflare Pages 직접 업로드(`wrangler pages deploy`) → 계정 인증이 있어야 가능, 아직 미확인
3. 별도 프리뷰 브랜치만으로는 공개 불가 — Pages 사이트가 저장소당 하나라 `gh-pages` 외 브랜치는 서빙되지 않습니다.

## 4. 되돌리기

- 빌드: `npm run build` (스위치 없이) → 지금 라이브와 동일
- 코드: `preview/ziwei-only` 브랜치의 커밋을 쓰지 않으면 `main` 은 그대로입니다.
