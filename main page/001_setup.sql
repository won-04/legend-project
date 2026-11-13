-- ===== 1. 테이블 생성 =====

-- 식당
create table restaurants (
    id              bigint generated always as identity primary key,  -- 자동 증가 번호
    name            text not null,
    category        text not null
                    check (category in ('korean', 'chinese', 'western', 'japanese', 'cafe')),  -- 필터 버튼 값만 허용
    rating          numeric(2, 1) check (rating between 0 and 5),     -- 0.0 ~ 5.0
    recommend_count int not null default 0,
    lat             double precision,   -- 위도 (마커용, 지금은 비워 둠)
    lng             double precision    -- 경도
);

-- 대표 메뉴 (식당 1 : 메뉴 N)
create table menus (
    id            bigint generated always as identity primary key,
    restaurant_id bigint not null references restaurants (id) on delete cascade,  -- 식당 삭제 시 메뉴도 삭제
    name          text not null
);


-- ===== 2. 접근 규칙 (RLS) =====

-- 규칙 기능 켜기 (켜는 순간 규칙이 없으면 아무것도 못 함)
alter table restaurants enable row level security;
alter table menus enable row level security;

-- 읽기만 누구나 허용 (추가·수정·삭제는 규칙이 없으므로 차단)
create policy "누구나 식당 읽기" on restaurants
    for select to anon, authenticated using (true);

create policy "누구나 메뉴 읽기" on menus
    for select to anon, authenticated using (true);


-- ===== 3. 임시 데이터 =====

insert into restaurants (name, category, rating, recommend_count) values
    ('군자골 김치찌개',     'korean',   4.6, 128),
    ('어린이대공원 반점',   'chinese',  4.2,  57),
    ('세종 파스타 하우스',  'western',  4.4,  93),
    ('광진 돈카츠',         'japanese', 4.7, 211),
    ('능동로 국밥',         'korean',   4.1,  40),
    ('모퉁이 카페',         'cafe',     4.5,  76),
    ('화양 마라탕',         'chinese',  3.9,  35),
    ('학생회관 뒤 덮밥집',  'japanese', 4.3, 102);

-- 식당 이름으로 id를 찾아 메뉴 연결
insert into menus (restaurant_id, name)
select r.id, m.menu
from (values
    ('군자골 김치찌개',    '김치찌개'),   ('군자골 김치찌개',    '제육볶음'),   ('군자골 김치찌개',    '계란말이'),
    ('어린이대공원 반점',  '짜장면'),     ('어린이대공원 반점',  '짬뽕'),       ('어린이대공원 반점',  '탕수육'),
    ('세종 파스타 하우스', '까르보나라'), ('세종 파스타 하우스', '토마토 파스타'),
    ('광진 돈카츠',        '등심카츠'),   ('광진 돈카츠',        '치즈카츠'),   ('광진 돈카츠',        '냉모밀'),
    ('능동로 국밥',        '순대국밥'),   ('능동로 국밥',        '돼지국밥'),
    ('모퉁이 카페',        '아메리카노'), ('모퉁이 카페',        '바닐라라떼'), ('모퉁이 카페',        '크로플'),
    ('화양 마라탕',        '마라탕'),     ('화양 마라탕',        '꿔바로우'),
    ('학생회관 뒤 덮밥집', '규동'),       ('학생회관 뒤 덮밥집', '사케동'),     ('학생회관 뒤 덮밥집', '가라아게')
) as m (restaurant_name, menu)
join restaurants r on r.name = m.restaurant_name;