/* 오늘 뭐먹지 - 메인 스크립트 */


/* ===== 0. 요소 ===== */

// 검색 패널
const searchPanel = document.getElementById("search-panel");
const panelBody = document.getElementById("panel-body");       // 내용 영역
const toggleBtn = document.getElementById("panel-toggle-btn"); // 열기/닫기 버튼

// 검색창
const searchForm = document.getElementById("search-form");
const searchInput = document.querySelector(".search-input");

// 사이드바 버튼 전체
const menuBtns = document.querySelectorAll(".menu-bar-btn, .menu-btn");

// 음식 종류 필터
const filterBtns = document.querySelectorAll(".filter-btn");

// 지도 영역
const mapArea = document.getElementById("map");


/* ===== 1. 패널 열기 / 닫기 ===== */

/**
 * 패널 상태를 한 곳에서 변경 (화살표·검색창·메뉴 강조도 함께 맞춤)
 * @param {boolean} isOpen - true: 열기, false: 닫기
 */
function setPanelOpen(isOpen) {
    searchPanel.classList.toggle("closed", !isOpen);

    // 검색창 스타일 전환 (열림: 테두리 / 닫힘: 그림자)
    document.body.classList.toggle("panel-open", isOpen);

    // 접근성 속성
    toggleBtn.setAttribute("aria-expanded", String(isOpen));
    toggleBtn.setAttribute("aria-label", isOpen ? "검색 패널 닫기" : "검색 패널 열기");

    if (!isOpen) {
        clearActiveMenu();
    }
}

function isPanelOpen() {
    return !searchPanel.classList.contains("closed");
}

toggleBtn.addEventListener("click", function () {
    setPanelOpen(!isPanelOpen());
});


/* ===== 2. 사이드바 메뉴 ===== */

function clearActiveMenu() {
    menuBtns.forEach(function (btn) {
        btn.classList.remove("active");
    });
}

function setActiveMenu(clickedBtn) {
    clearActiveMenu();
    clickedBtn.classList.add("active");
}

// data-panel 값 → 화면 그리기 함수
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

        // data-panel 없는 버튼(MY·설정)은 강조만
        // TODO: 마이페이지 / 설정 화면 연결
        if (!type) {
            setActiveMenu(btn);
            return;
        }

        setActiveMenu(btn);
        setPanelOpen(true);

        const render = panelContents[type];
        if (render) {
            render();
        }
    });
});


/* ===== 3. 음식 종류 필터 ===== */

filterBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
        // 하나만 선택
        filterBtns.forEach(function (other) {
            other.classList.remove("active");
        });
        btn.classList.add("active");

        // TODO: 카테고리별 필터링
        console.log("선택한 카테고리:", btn.dataset.category);
    });
});


/* ===== 4. 검색 ===== */

searchForm.addEventListener("submit", function (event) {
    event.preventDefault();   // 새로고침 방지

    const keyword = searchInput.value.trim();

    setPanelOpen(true);
    renderSearchResult(keyword);
});


/* ===== 5. 화면 그리기 (API 연결 시 내부만 채우면 됨) ===== */

// 제목 + 안내 문구 표시
function renderMessage(title, message) {
    panelBody.innerHTML =
        "<h3>" + title + "</h3>" +
        '<p class="panel-empty">' + message + "</p>";
}

// 기본 화면 (메뉴 바 버튼)
function renderDefault() {
    renderMessage("추천", "메뉴를 골라 원하는 맛집을 찾아보세요.");
}

// 추천 랭킹
function renderRanking() {
    // TODO: 랭킹 목록
    renderMessage("추천 랭킹", "랭킹 목록을 준비하고 있습니다.");
}

// 오늘의 추천
function renderToday() {
    // TODO: 오늘의 추천 결과
    renderMessage("오늘의 추천", "오늘의 추천을 준비하고 있습니다.");
}

// 에디터픽
function renderEditorPick() {
    // TODO: 에디터픽 목록
    renderMessage("에디터픽", "에디터가 고른 맛집을 준비하고 있습니다.");
}

// 숨.맛.공 (숨은 맛집 공유)
function renderHiddenReport() {
    // TODO: 공유된 숨은 맛집 목록
    renderMessage("숨.맛.공", "숨은 맛집 목록을 준비하고 있습니다.");
}

// 북마크
function renderBookmark() {
    // TODO: 저장한 맛집 목록
    renderMessage("북마크", "저장한 맛집이 아직 없습니다.");
}

// 검색 결과
function renderSearchResult(keyword) {
    if (keyword === "") {
        renderMessage("검색", "검색어를 입력해 주세요.");
        return;
    }

    // TODO: 검색 API 결과로 교체
    renderMessage(
        "'" + keyword + "' 검색 결과",
        "검색 결과를 불러오는 기능은 아직 연결되지 않았습니다."
    );
}


/* ===== 6. 네이버 지도 ===== */

// 지도 객체 (마커 등 다른 기능에서 사용)
let map = null;

// 지도 스크립트 로드 (Client ID: JS/config.local.js)
function loadNaverMap() {
    const keyId = window.NAVER_MAP_KEY_ID;

    if (!keyId) {
        console.error("네이버 지도 Client ID가 없습니다. JS/config.local.js 파일을 확인하세요.");
        return;
    }

    const script = document.createElement("script");
    script.src = "https://oapi.map.naver.com/openapi/v3/maps.js"
        + "?ncpKeyId=" + encodeURIComponent(keyId);
    script.onload = function () {
        waitForNaver(0);
    };
    script.onerror = function () {
        console.error("네이버 지도 스크립트를 불러오지 못했습니다. 인터넷 연결을 확인하세요.");
    };
    document.head.appendChild(script);
}

// naver 객체가 준비될 때까지 대기 (최대 5초)
function waitForNaver(tries) {
    if (window.naver && naver.maps && naver.maps.Map) {
        initMap();
        return;
    }

    if (tries >= 50) {
        console.error("네이버 지도를 준비하지 못했습니다. Client ID 발급 메뉴와 Web 서비스 URL을 확인하세요.");
        return;
    }

    setTimeout(function () {
        waitForNaver(tries + 1);
    }, 100);
}

// 지도 생성
function initMap() {
    // 안내 문구 제거 + 지도가 영역을 꽉 채우도록 flex 해제
    mapArea.innerHTML = "";
    mapArea.style.display = "block";

    map = new naver.maps.Map(mapArea, {
        center: new naver.maps.LatLng(37.5503, 127.0731),  // 세종대 부근
        zoom: 16,
    });

    // 지도 클릭 → 패널 닫기 (드래그는 제외)
    naver.maps.Event.addListener(map, "click", function () {
        setPanelOpen(false);
    });
}

// 인증 실패 시 자동 호출
window.navermap_authFailure = function () {
    console.error("네이버 지도 인증 실패: Client ID와 콘솔에 등록한 Web 서비스 URL을 확인하세요.");
};


/* ===== 7. 시작 ===== */

// 패널은 닫고 지도부터 표시
setPanelOpen(false);
loadNaverMap();
