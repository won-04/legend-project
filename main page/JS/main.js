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

        // [Modified] 선택한 종류로 다시 조회
        currentCategory = btn.dataset.category;
        setPanelOpen(true);
        renderDefault();
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

/* [Modified] ===== 5-1. Supabase DB ===== */

// DB 연결 객체 (window.supabase와 이름이 겹치지 않게 db 사용)
let db = null;

// 현재 선택한 음식 종류 (필터 버튼 data-category 값)
let currentCategory = "all";

// 마지막 요청 번호 (늦게 도착한 이전 응답 무시용)
let lastRequestId = 0;

// DB 연결 객체 생성 (URL·키: JS/config.local.js)
function initSupabase() {
    if (!window.supabase) {
        console.error("Supabase 라이브러리를 불러오지 못했습니다. index.html의 script 태그를 확인하세요.");
        return;
    }
    if (!window.SUPABASE_URL || !window.SUPABASE_KEY) {
        console.error("Supabase URL 또는 키가 없습니다. JS/config.local.js 파일을 확인하세요.");
        return;
    }
    db = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_KEY);
}

// 식당 목록 조회 (category가 "all"이면 전체) → 실패 시 null
async function fetchRestaurants(category) {
    let query = db
        .from("restaurants")
        .select("name, category, rating, recommend_count, lat, lng, menus(id, name)")   // [Modified] lat, lng 추가
        .order("recommend_count", { ascending: false })                       // 추천 많은 순
        .order("id", { referencedTable: "menus" });                           // 메뉴는 입력 순서대로

    if (category !== "all") {
        query = query.eq("category", category);   // where category = ...
    }

    const { data, error } = await query;   // 응답이 올 때까지 기다림
    if (error) {
        console.error("식당 목록 조회 실패:", error.message);
        return null;
    }

    // DB 열 이름 → 화면용 이름으로 변환
    return data.map(function (row) {
        return {
            name: row.name,
            category: row.category,
            rating: row.rating === null ? null : Number(row.rating),
            recommendCount: row.recommend_count,
            lat: row.lat,   // [Modified] 위도 (없으면 null)
            lng: row.lng,   // [Modified] 경도
            menus: row.menus.map(function (menu) {
                return menu.name;
            }),
        };
    });
}

// 식당 카드 하나 생성
// [Modified] 새 함수
function createRestaurantCard(item) {
    const card = document.createElement("article");
    card.className = "restaurant-card";

    const name = document.createElement("h4");
    name.className = "restaurant-name";
    name.textContent = item.name;   // HTML로 해석하지 않고 글자로만 넣음

    // [Modified] 별점 + 추천수 한 줄 배치
    const meta = document.createElement("div");
    meta.className = "restaurant-meta";

    const rating = document.createElement("span");
    rating.className = "restaurant-rating";
    // [Modified] 별점 없는 식당(null) 처리
    if (item.rating === null) {
        rating.textContent = "★ -";
        rating.setAttribute("aria-label", "별점 없음");
    } else {
        rating.textContent = "★ " + item.rating.toFixed(1);   // 소수 첫째 자리까지
        rating.setAttribute("aria-label", "별점 " + item.rating.toFixed(1) + "점");
    }

    const recommend = document.createElement("span");
    recommend.className = "restaurant-recommend";
    recommend.textContent = "추천 " + item.recommendCount.toLocaleString();   // 1000 → 1,000

    meta.appendChild(rating);
    meta.appendChild(recommend);

    // 대표 메뉴 목록
    const menuList = document.createElement("ul");
    menuList.className = "restaurant-menus";
    item.menus.forEach(function (menu) {
        const li = document.createElement("li");
        li.textContent = menu;
        menuList.appendChild(li);
    });

    card.appendChild(name);
    card.appendChild(meta);     // [Modified] rating → meta
    card.appendChild(menuList);

    // [Modified] 카드 클릭 → 지도 이동
    card.tabIndex = 0;                          // Tab 키로 선택 가능
    card.setAttribute("role", "button");        // 화면 낭독기에 버튼으로 안내
    card.addEventListener("click", function () {
        moveToRestaurant(item);
    });
    card.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {            // 키보드 Enter도 클릭과 동일
            moveToRestaurant(item);
        }
    });

    return card;
}

// [Modified] 선택한 식당 표시용 마커 (하나를 위치만 바꿔 재사용)
let selectedMarker = null;

// 식당 위치로 지도 이동 + 마커 표시
// [Modified] 새 함수
function moveToRestaurant(item) {
    if (!map) {
        console.error("지도가 아직 준비되지 않았습니다.");
        return;
    }
    if (item.lat === null || item.lng === null) {
        alert("'" + item.name + "'은(는) 아직 위치 정보가 없습니다.");
        return;
    }

    const position = new naver.maps.LatLng(item.lat, item.lng);
    map.setCenter(position);   // 지도 중심 이동
    map.setZoom(17);           // 가게가 잘 보이게 확대

    if (selectedMarker === null) {
        selectedMarker = new naver.maps.Marker({ position: position, map: map });   // 첫 클릭: 마커 생성
    } else {
        selectedMarker.setPosition(position);   // 이후: 위치만 이동
    }
}

// 제목 + 식당 카드 목록 표시
// [Modified] 새 함수
function renderRestaurantList(title, list) {
    panelBody.innerHTML = "";   // 이전 내용 제거

    const heading = document.createElement("h3");
    heading.textContent = title;
    panelBody.appendChild(heading);

    // 빈 목록 처리
    if (list.length === 0) {
        const empty = document.createElement("p");
        empty.className = "panel-empty";
        empty.textContent = "표시할 식당이 없습니다.";
        panelBody.appendChild(empty);
        return;
    }

    const listEl = document.createElement("div");
    listEl.className = "restaurant-list";
    list.forEach(function (item) {
        listEl.appendChild(createRestaurantCard(item));
    });
    panelBody.appendChild(listEl);

    panelBody.scrollTop = 0;    // 새 목록은 맨 위부터 표시
}

// 기본 화면: DB에서 식당 목록 조회 후 표시
// [Modified] 임시 배열 → DB 조회
async function renderDefault() {
    const title = "주변 맛집";

    if (!db) {
        renderMessage(title, "DB에 연결되지 않았습니다. 콘솔(F12)을 확인하세요.");
        return;
    }

    const requestId = ++lastRequestId;   // 이번 요청 번호
    renderMessage(title, "불러오는 중...");

    const list = await fetchRestaurants(currentCategory);

    if (requestId !== lastRequestId) {
        return;   // 그사이 다른 필터를 눌렀으면 이 결과는 버림
    }
    if (list === null) {
        renderMessage(title, "식당 목록을 불러오지 못했습니다.");
        return;
    }
    renderRestaurantList(title, list);
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

    // [Modified] 개발용: 클릭한 위치의 좌표 출력 (데이터 입력 후 삭제)
    naver.maps.Event.addListener(map, "click", function (e) {
        console.log("lat:", e.coord.lat(), "lng:", e.coord.lng());   // e.coord: 클릭 지점 좌표
    });
}

// 인증 실패 시 자동 호출
window.navermap_authFailure = function () {
    console.error("네이버 지도 인증 실패: Client ID와 콘솔에 등록한 Web 서비스 URL을 확인하세요.");
};


/* ===== 7. 시작 ===== */

// 패널은 닫고 지도부터 표시
setPanelOpen(false);
initSupabase();     // [Modified] DB 연결 (renderDefault보다 먼저)
renderDefault();    // [Modified] 토글 버튼으로 열어도 목록이 보이도록 미리 그림
loadNaverMap();
