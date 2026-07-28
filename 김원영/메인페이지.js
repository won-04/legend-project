// 검색 패널(왼쪽에서 열리는 패널) 관련 DOM 요소
const searchPanel = document.querySelector(".search-panel")
// 검색어를 입력하는 <form> 태그
const searchForm = document.getElementById("search")
// 검색어 입력창
const searchInput = document.querySelector(".searchbox-input")
// 패널 닫기 버튼
const closeBtn = document.querySelector(".panel-close")
// 패널 안에서 콘텐츠(결과)가 실제로 그려질 영역
const resultSection = document.getElementById("search-result")

// data-panel 속성을 가진 메뉴 링크들 (에디터픽, 히든리포트 등 패널 여는 버튼들)
const panelLinks = document.querySelectorAll(".menu a[data-panel]")
// 북마크 / 마이페이지 / 설정 버튼 (패널은 안 열지만 active 표시는 필요한 메뉴)
const bookmarkBtn = document.querySelector(".bookmark a")
const mypageBtn = document.querySelector(".mypage a")
const settingBtn = document.querySelector(".setting a")
// active 클래스를 관리해야 하는 모든 메뉴 링크를 하나의 배열로 합침
const allMenuLinks = [...panelLinks, bookmarkBtn, mypageBtn, settingBtn]


// 패널 타입(type)별로 실행할 렌더링 함수를 매핑해둔 객체
// key: data-panel 값, value: 해당 콘텐츠를 그리는 함수
const panelContents = {
    "default": () =>renderDefaultPicks(),
    "editor-pick": () =>renderEditorPicks(),
    "hidden-report": () =>renderHiddenReports(),
}

// 클릭된 버튼에만 active 클래스를 주고 나머지는 전부 제거
function setActiveLink(clickedBtn){
    allMenuLinks.forEach(function(link){
        link.classList.remove("active")
    })
    clickedBtn.classList.add("active")
}

/* 왼쪽 패널 열고 닫는 함수*/
// type: 어떤 콘텐츠를 보여줄지 구분하는 값 ("search-result" 또는 panelContents의 key)
// keyword: 검색일 경우에만 사용되는 검색어
function openPanel(type,keyword){
    // 패널을 화면에 보이게 함 (CSS에서 .active일 때 슬라이드 인 되도록 처리돼 있을 것)
    searchPanel.classList.add("active")

    if(type === "search-result"){
        // 검색 결과 렌더링
        renderSearchResult(keyword)
    }
    else if(panelContents[type]){
        // panelContents에 등록된 타입이면 해당 함수 실행
        panelContents[type]()
    }
}

// 패널을 닫는 함수
// type, data 파라미터는 현재 함수 내부에서 사용되지 않음 (필요 없다면 삭제해도 무방)
function closePanel(type,data){
    searchPanel.classList.remove("active")

    // 패널이 닫힐 때 모든 메뉴의 active 표시도 함께 제거
    allMenuLinks.forEach(function(link){
        link.classList.remove("active")
    })
}

// 패널을 여는 메뉴 링크들(에디터픽, 히든리포트 등)에 클릭 이벤트 등록
panelLinks.forEach(function(btn){
    btn.addEventListener("click",function(e){
        e.preventDefault() // <a> 태그 기본 이동 동작 막기
        setActiveLink(btn) // 클릭한 링크에 active 표시
        openPanel(btn.dataset.panel) // data-panel 값으로 패널 열기
    })
})

// 북마크 / 마이페이지 / 설정 버튼은 패널은 열지 않고 active 표시만 함
;[bookmarkBtn, mypageBtn, settingBtn].forEach(function(btn){
    btn.addEventListener("click", function(e){
        e.preventDefault()
        setActiveLink(btn)
    })
})

/* 닫기버튼 */
closeBtn.addEventListener("click",function(){
    closePanel()
})

/*검색도 같은 패널을 열되, 검색 전용 콘텐츠 렌더링 */
searchForm.addEventListener("submit",function(e){
    e.preventDefault() // 폼 제출 시 페이지 새로고침 방지
    const keyword = searchInput.value.trim() // 앞뒤 공백 제거한 검색어
    openPanel("search-result",keyword) // "search-result" 타입으로 패널 열기 + 검색어 전달
})

/* 콘텐츠 렌더링 함수들
   - 아래 4개 함수가 실제로 resultSection.innerHTML에
     각 상황에 맞는 HTML을 채워 넣는 역할을 함 (현재는 구현 전 상태)

function renderDefaultPicks(){
    // 기본(default) 추천 콘텐츠를 그리는 부분 - 구현 필요
    resultSection.innerHTML =
}

function renderEditorPicks(){
    // 에디터 픽 콘텐츠를 그리는 부분 - 구현 필요
    resultSection.innerHTML =
}
function renderHiddenReports(){
    // 히든 리포트 콘텐츠를 그리는 부분 - 구현 필요
    resultSection.innerHTML =
}
function renderSearchResult(){
    // 검색 결과를 그리는 부분 - keyword 파라미터를 받지만 현재 사용 안 함, 구현 필요
    resultSection.innerHTML =
} */
