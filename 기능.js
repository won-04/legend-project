/* ================================
   요소 찾기
================================ */

// 검색 관련
const searchBox = document.querySelector(".search-box");            // 검색창 (겉 상자)
const searchInput = document.querySelector(".search-box input");    // 검색 입력칸
const searchBtn = document.querySelector(".search-word");           // 검색(돋보기) 버튼
const resultList = document.querySelector(".result-list");          // 검색 결과 목록

// 사이드바 / 아이콘바
const sidebar = document.querySelector(".sidebar");                 // 사이드바 패널
const iconBar = document.querySelector(".icon-bar");                // 왼쪽 아이콘 바
const iconBtns = document.querySelectorAll(".icon-list button");    // 기능 아이콘 버튼 전부
const panels = document.querySelectorAll(".panel");                 // 기능 아이콘에 연결된 패널 전부

// 음식 테마 카테고리
const categoryChips = document.querySelectorAll(".category-chip");  // 카테고리 칩 전부
const categoryBar = document.querySelector(".category-bar");        // 카테고리 바 전체
const categoryMore = document.querySelector(".category-more");      // +N / 접기 버튼


/* ================================
   함수 정의
================================ */

// 검색 실행: 입력값을 읽어 결과 패널을 연다
function search() {
  const keyword = searchInput.value.trim();

  // TODO: 여기서 검색 API를 호출해 resultList를 채우면 됨
  console.log("검색어:", keyword);

  openPanel();
}

// 검색 결과 패널 열기 (+ 결과가 없을 때 안내 문구 표시)
function openPanel() {
  sidebar.classList.add("open");

  // 아직 API가 없으므로, 입력이 비어 있으면 안내 문구만 보여줌
  if (searchInput.value.trim() === "") {
    resultList.innerHTML = "<li>검색 결과가 없습니다.</li>";
  }
}

// 검색 결과 패널만 닫기 (full 사이드바는 유지)
function closePanel() {
  sidebar.classList.remove("open");
}

// 사이드바 완전히 닫기 (결과 패널 + full 모드 + 강조/열린 패널까지 전부 초기화)
function closeSidebar() {
  sidebar.classList.remove("open", "full");

  // 아이콘 강조 해제
  iconBtns.forEach(function (btn) {
    btn.classList.remove("active");
  });

  // 열려 있던 기능 패널 닫기
  panels.forEach(function (panel) {
    panel.classList.remove("active");
  });
}


/* ================================
   1. 검색 이벤트
================================ */

// 검색창 포커스 → 결과 패널 바로 열기
searchInput.addEventListener("focus", openPanel);

// 돋보기 버튼 클릭 → 검색
searchBtn.addEventListener("click", search);

// 글자를 입력할 때마다 검색
searchInput.addEventListener("input", search);

// Enter 입력 → 검색
searchInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    search();
  }
});


/* ================================
   2. 아이콘 바 이벤트
================================ */

// 기능 아이콘 클릭 → full 모드 + 해당 패널만 표시 + 아이콘 강조
iconBtns.forEach(function (btn) {
  btn.addEventListener("click", function () {

    // 사이드바를 전체 모드(full)로
    sidebar.classList.add("full");

    // 모든 패널 숨기고, 클릭한 버튼에 연결된 패널만 표시
    panels.forEach(function (panel) {
      panel.classList.remove("active");
    });

    const target = btn.dataset.panel;          // data-panel 값 = 패널 id
    const panel = document.getElementById(target);
    if (panel) {
      panel.classList.add("active");
    }

    // 현재 클릭한 아이콘만 강조 (나머지는 해제)
    iconBtns.forEach(function (other) {
      other.classList.remove("active");
    });
    btn.classList.add("active");
  });
});


/* ================================
   3. 클릭 위치에 따른 닫기 처리
================================ */

document.addEventListener("click", function (event) {
  const insideSidebar = sidebar.contains(event.target);     // 사이드바 안?
  const insideIconBar = iconBar.contains(event.target);     // 아이콘바 안?
  const insideSearch = searchBox.contains(event.target);    // 검색창 안?
  const insideResult = resultList.contains(event.target);   // 결과 목록 안?

  // 경우 1: 완전 바깥(지도 등) 클릭 → 전부 닫기
  if (!insideSidebar && !insideIconBar) {
    closeSidebar();
    return;
  }

  // 경우 2: 사이드바 안이지만 검색창/결과 목록이 아닌 곳 클릭
  //         → 결과 패널만 닫기 (full은 유지)
  if (insideSidebar && !insideSearch && !insideResult) {
    closePanel();
  }
});


/* ================================
   4. 음식 테마 카테고리
================================ */

// 칩 클릭 → 하나만 선택되도록 강조 (다시 누르면 해제)
categoryChips.forEach(function (chip) {
  chip.addEventListener("click", function () {

    // 이미 선택된 칩을 다시 누르면 선택 해제
    if (chip.classList.contains("active")) {
      chip.classList.remove("active");
      console.log("카테고리 해제");
      return;
    }

    // 나머지 칩 해제 후 이 칩만 선택
    categoryChips.forEach(function (other) {
      other.classList.remove("active");
    });
    chip.classList.add("active");

    // TODO: 선택한 카테고리로 지도/검색 필터 연동
    console.log("선택한 카테고리:", chip.textContent.trim());
  });
});

// +N 더보기 버튼: 숨겨둔 칩 펼치기 / 다시 접기
if (categoryMore) {
  const hiddenCount = categoryBar.querySelectorAll(".extra").length;   // 접혀 있는 칩 개수

  categoryMore.addEventListener("click", function () {
    categoryBar.classList.toggle("expanded");

    // 펼침 → '접기', 접힘 → '+N' 으로 글자 전환
    const expanded = categoryBar.classList.contains("expanded");
    categoryMore.textContent = expanded ? "접기" : "+" + hiddenCount;
  });
}


/* ================================
   5. 랜덤 추천 단계 이동
================================ */

// 진행 순서: step1 → step2 → step3 → step4 → step5
const stepOrder = ["step1", "step2", "step3", "step4", "step5"];

// 현재 step을 숨기고 다음 step을 표시
function changeStep(currentStep, nextStep) {
  document.getElementById(currentStep).classList.remove("active");
  document.getElementById(nextStep).classList.add("active");
}

// 각 step 안의 버튼을 '다음 step으로 이동'에 한 번에 연결
// (step1의 '시작하기'부터 step4의 종류 선택 버튼까지 동일하게 처리됨)
stepOrder.forEach(function (stepId, index) {
  const nextStep = stepOrder[index + 1];

  // 마지막 단계(step5)는 다음이 없으므로 건너뜀
  if (!nextStep) return;

  document.querySelectorAll("#" + stepId + " button").forEach(function (button) {
    button.addEventListener("click", function () {
      changeStep(stepId, nextStep);
    });
  });
});
