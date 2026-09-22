/* =====================================================
   오늘 뭐먹지 - 통합 스크립트
   민 / 지 / 원 세 사람의 파일을 하나로 합친 버전
   ===================================================== */


/* =====================================================
   0. 요소 찾기
   ===================================================== */

// 검색 패널 관련
const searchPanel = document.getElementById("search-panel");   // 슬라이드 패널 전체
const panelBody = document.getElementById("panel-body");       // 실제 내용이 그려질 영역
const toggleBtn = document.getElementById("panel-toggle-btn"); // 패널 오른쪽 개폐 버튼

// 검색창 관련
const searchForm = document.getElementById("search-form");                  // 검색 <form>
const searchInput = document.querySelector(".search-input");               // 검색 입력칸

// 사이드바 메뉴 (메뉴 바 버튼 + 기능 아이콘 + 하단 그룹 전부)
const menuBtns = document.querySelectorAll(".menu-bar-btn, .menu-btn");

// 음식 종류 필터 버튼
const filterBtns = document.querySelectorAll(".filter-btn");

// 지도 영역 (여기를 클릭하면 패널이 닫힘)
const mapArea = document.getElementById("map");


/* =====================================================
   1. 패널 열기 / 닫기
   ===================================================== */

/**
 * 패널의 열림 상태를 한 곳에서 관리한다.
 * 토글 버튼, 지도 클릭, 메뉴 클릭 등 어디서 호출하더라도
 * 화살표 방향과 검색창 모양이 항상 상태와 일치하게 만든다.
 *
 * @param {boolean} isOpen - true면 열기, false면 닫기
 */
function setPanelOpen(isOpen) {
    // 패널 슬라이드
    searchPanel.classList.toggle("closed", !isOpen);

    // 검색창 스타일 전환용 (열림: 테두리 / 닫힘: 그림자)
    document.body.classList.toggle("panel-open", isOpen);

    // 화면 낭독기용 상태값 + 버튼 설명 갱신
    toggleBtn.setAttribute("aria-expanded", String(isOpen));
    toggleBtn.setAttribute("aria-label", isOpen ? "검색 패널 닫기" : "검색 패널 열기");

    // 패널이 닫히면 사이드바 메뉴 강조도 함께 해제
    if (!isOpen) {
        clearActiveMenu();
    }
}

// 패널이 현재 열려 있는지 확인
function isPanelOpen() {
    return !searchPanel.classList.contains("closed");
}

// 오른쪽 중앙 토글 버튼 (지 파일 기능)
toggleBtn.addEventListener("click", function () {
    setPanelOpen(!isPanelOpen());
});

// 지도 영역 클릭 → 패널 닫기 (민 파일 기능)
// 네이버 지도가 붙은 뒤에는 initMap() 안에서 지도 클릭 이벤트로 처리한다.
// (그냥 DOM click을 쓰면 지도를 드래그만 해도 패널이 닫혀버림)


/* =====================================================
   2. 사이드바 메뉴
   ===================================================== */

// 모든 메뉴의 강조 표시를 해제
function clearActiveMenu() {
    menuBtns.forEach(function (btn) {
        btn.classList.remove("active");
    });
}

// 클릭한 메뉴 하나만 강조
function setActiveMenu(clickedBtn) {
    clearActiveMenu();
    clickedBtn.classList.add("active");
}

// data-panel 값 → 해당 화면을 그리는 함수 연결표
const panelContents = {
    "default": renderDefault,
    "ranking": renderRanking,
    "today": renderToday,
    "editor-pick": renderEditorPick,
    "hidden-report": renderHiddenReport,
    "bookmark": renderBookmark,
};

menuBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
        const type = btn.dataset.panel;

        // data-panel이 없는 버튼(마이페이지·설정)은 강조만 하고 끝냄
        // TODO: 마이페이지 / 설정 화면이 정해지면 여기에 연결
        if (!type) {
            setActiveMenu(btn);
            return;
        }

        setActiveMenu(btn);
        setPanelOpen(true);

        // 연결표에 등록된 함수 실행
        const render = panelContents[type];
        if (render) {
            render();
        }
    });
});


/* =====================================================
   3. 음식 종류 필터
   ===================================================== */

filterBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
        // 하나만 선택되도록 나머지 강조 해제
        filterBtns.forEach(function (other) {
            other.classList.remove("active");
        });
        btn.classList.add("active");

        // TODO: 선택한 카테고리로 지도/목록을 실제로 걸러내는 처리
        console.log("선택한 카테고리:", btn.dataset.category);
    });
});


/* =====================================================
   4. 검색
   ===================================================== */

searchForm.addEventListener("submit", function (event) {
    event.preventDefault();   // 폼 제출 시 새로고침 방지

    const keyword = searchInput.value.trim();

    // 패널을 열고 결과 영역을 채운다
    setPanelOpen(true);
    renderSearchResult(keyword);
});


/* =====================================================
   5. 화면 그리기 함수들
   지금은 자리만 잡아둔 상태이고,
   지도/검색 API가 붙으면 이 안쪽만 채우면 된다.
   ===================================================== */

// 안내 문구 한 줄을 패널에 표시하는 공통 함수
function renderMessage(title, message) {
    panelBody.innerHTML =
        "<h3>" + title + "</h3>" +
        '<p class="panel-empty">' + message + "</p>";
}

// 메뉴 바 버튼 → 기본 화면
function renderDefault() {
    renderMessage("추천", "메뉴를 골라 원하는 맛집을 찾아보세요.");
}

// 추천 랭킹
function renderRanking() {
    // TODO: 랭킹 데이터를 불러와 목록으로 그리기
    renderMessage("추천 랭킹", "랭킹 목록을 준비하고 있습니다.");
}

// 오늘의 추천
function renderToday() {
    // TODO: 오늘의 추천 결과 그리기
    renderMessage("오늘의 추천", "오늘의 추천을 준비하고 있습니다.");
}

// 에디터픽
function renderEditorPick() {
    // TODO: 에디터가 고른 맛집 목록 그리기
    renderMessage("에디터픽", "에디터가 고른 맛집을 준비하고 있습니다.");
}

// 숨.맛.공 (숨은 맛집 공유)
function renderHiddenReport() {
    // TODO: 사용자가 공유한 숨은 맛집 목록 그리기
    renderMessage("숨.맛.공", "숨은 맛집 목록을 준비하고 있습니다.");
}

// 북마크
function renderBookmark() {
    // TODO: 저장한 맛집 목록 그리기
    renderMessage("북마크", "저장한 맛집이 아직 없습니다.");
}

// 검색 결과
function renderSearchResult(keyword) {
    // 검색어 없이 그냥 눌렀을 때
    if (keyword === "") {
        renderMessage("검색", "검색어를 입력해 주세요.");
        return;
    }

    // TODO: 검색 API를 호출해 결과 목록으로 교체
    renderMessage(
        "'" + keyword + "' 검색 결과",
        "검색 결과를 불러오는 기능은 아직 연결되지 않았습니다."
    );
}


/* =====================================================
   6. 네이버 지도
   ===================================================== */

// 다른 기능(마커, 검색 결과 표시 등)에서도 쓸 수 있게 밖에 둔다
let map = null;

// 지도 스크립트 불러오기
// Client ID는 JS/config.local.js 의 window.NAVER_MAP_KEY_ID 에서 읽는다
function loadNaverMap() {
    const keyId = window.NAVER_MAP_KEY_ID;

    if (!keyId) {
        console.error("네이버 지도 Client ID가 없습니다. JS/config.local.js 파일을 확인하세요.");
        return;
    }

    const script = document.createElement("script");
    script.src = "https://oapi.map.naver.com/openapi/v3/maps.js"
        + "?ncpKeyId=" + encodeURIComponent(keyId)
        + "&callback=initMap";
    script.onerror = function () {
        console.error("네이버 지도 스크립트를 불러오지 못했습니다. 인터넷 연결을 확인하세요.");
    };
    document.head.appendChild(script);
}

// 스크립트 로드가 끝나면 네이버가 이 함수를 호출한다 (callback=initMap)
window.initMap = function () {
    // "지도가 들어갈 영역" 안내 문구 제거
    mapArea.innerHTML = "";
    // 안내 문구 가운데 정렬용 flex 해제 (지도가 영역을 꽉 채우도록)
    mapArea.style.display = "block";

    map = new naver.maps.Map(mapArea, {
        center: new naver.maps.LatLng(37.5503, 127.0731),  // 세종대 부근
        zoom: 16,
    });

    // 지도 클릭 → 패널 닫기 (드래그할 때는 실행되지 않음)
    naver.maps.Event.addListener(map, "click", function () {
        setPanelOpen(false);
    });
};

// Client ID 인증 실패 시 네이버가 호출하는 함수
window.navermap_authFailure = function () {
    console.error("네이버 지도 인증 실패: Client ID와 콘솔에 등록한 Web 서비스 URL을 확인하세요.");
};


/* =====================================================
   7. 첫 화면 상태
   ===================================================== */

// 처음 들어오면 패널은 닫아두고 지도부터 보여준다.
setPanelOpen(false);
loadNaverMap();
