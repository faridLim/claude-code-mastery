# 계획: Todo App UI 전면 재설계용

## Context
현재 UI는 보라색 그라데이션 배경에 단순 리스트 형태로, 사용자가 제공한 참고 이미지(HealDocs 스타일)처럼
좌측 사이드바 + 카드 그리드 형태의 현대적인 대시보드 UI로 전면 재설계한다.

**참고 이미지 특징:**
- 흰색 배경, 좌측 사이드바 (네비게이션 + 항목 목록)
- 상단 헤더: 날짜, 검색창, 추가 버튼
- "진행중" / "완료" 탭 전환
- 카드 그리드 (3열): 각기 다른 파스텔 색상 배경, 제목, 설명, 시간, "..." 메뉴

---

## 수정 파일

| 파일 | 변경 내용 |
|------|-----------|
| `index.html` | 전면 재설계 — 사이드바 + 메인 레이아웃 |
| `css/styles.css` | 그라데이션 배경 제거, 사이드바/카드/헤더 스타일 |
| `js/app.js` | `createBucketItemHTML()` 카드 형태로 교체, 사이드바 렌더링 추가 |

`js/storage.js` 는 변경 없음.

---

## 구현 상세

### 1. index.html — 전면 재설계

```
body: flex, white bg
├── 사이드바 (w-64, fixed, 좌측)
│   ├── 앱 로고 + 이름 "Todo List"
│   ├── 네비게이션 메뉴 (Overview, Todo List)
│   └── 현재 항목 목록 (id="sidebarList")
└── 메인 콘텐츠 (ml-64, flex-1)
    ├── 헤더
    │   ├── 날짜 (오늘 날짜 동적 표시)
    │   ├── 검색창 (id="searchInput")
    │   └── "+ 추가" 버튼 → 추가 폼 토글
    ├── 추가 폼 (id="addForm", 기본 hidden)
    ├── 탭 (id="activeTab" / id="completedTab")
    └── 카드 그리드 (id="bucketListContainer", grid-cols-3)
```

- 기존 통계 섹션, 별도 필터 섹션 제거
- 모달(#editModal)은 유지

### 2. css/styles.css

- `body` 배경: 그라데이션 → `background: #f8f9fc` (연한 회색)
- 사이드바: `width: 256px`, 흰색, 우측 border, 고정
- 카드 색상 팔레트 (`.card-color-0` ~ `.card-color-4`): 파란색, 초록색, 노란색, 보라색, 붉은색 파스텔
- 카드 hover: 살짝 올라오는 shadow
- 헤더: 흰색 배경, 하단 border
- 탭 버튼: 활성 탭은 파란 underline
- `filter-btn.active` 기존 스타일 제거

### 3. js/app.js — 주요 변경

**`cacheElements()` 추가:**
- `searchInput`, `addFormContainer`, `activeTab`, `completedTab`, `sidebarList`

**`bindEvents()` 추가:**
- 검색 입력 → `handleSearch()`
- 탭 클릭 → `handleFilter()`
- "+ 추가" 버튼 → 폼 토글

**`createBucketItemHTML(item, colorIndex)` 교체:**
```
<div class="card card-color-{N}">
  <div class="card-header">
    <span class="card-menu-btn">···</span> 드롭다운 → 수정/삭제/완료토글
  </div>
  <h3>{title}</h3>
  <p class="card-date">{createdAt}</p>
</div>
```

**`renderSidebar()` 신규:**
- 사이드바의 `#sidebarList` 에 항목명 간략 표시

**`handleSearch(e)` 신규:**
- `searchInput.value`로 항목 제목 필터링 후 `render()`

**`render()` 수정:**
- `currentFilter` = `'active'` or `'completed'` (기존 `'all'` 탭 제거)
- 카드 그리드 렌더링
- `renderSidebar()` 호출

**기존 `handleFilter()`:**
- 탭 클릭 시 `active`/`completed` 전환만 처리

---

## 데이터 흐름 (변경 없음)

사용자 액션 → BucketListApp 이벤트 핸들러 → BucketStorage 뮤테이션 → localStorage → `render()`

---

## 검증

1. `python -m http.server 8000` 후 `http://localhost:8000` 접속
2. 확인 항목:
   - [ ] 사이드바 고정, 항목 목록 표시
   - [ ] 헤더 날짜 오늘 날짜로 표시
   - [ ] "+ 추가" 클릭 시 입력 폼 표시
   - [ ] 항목 추가 → 카드 그리드에 표시, 사이드바에도 반영
   - [ ] 탭 전환 (진행중 / 완료) 정상 동작
   - [ ] 검색창 입력 시 카드 필터링
   - [ ] 카드 "···" 메뉴 → 수정/삭제/완료 동작
   - [ ] 수정 모달 정상 동작
   - [ ] 모바일 반응형 (사이드바 숨김)
