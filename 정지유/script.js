// 1. 하단 패널 열고 닫기 로직
const searchPanel = document.getElementById('search-panel');
const toggleBtn = document.getElementById('panel-toggle-btn');

toggleBtn.addEventListener('click', () => {
    searchPanel.classList.toggle('closed');
            
    if (searchPanel.classList.contains('closed')) {
        toggleBtn.innerText = '▶';
    } else {
        toggleBtn.innerText = '◀';
    }
});

// 2. 카테고리 필터 버튼 활성화 로직
const filterBtns = document.querySelectorAll('.filter-btn');

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    });
});