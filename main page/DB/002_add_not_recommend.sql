-- 비추천수 열 추가 (001 실행 후 한 번만 실행, 기존 식당은 0으로 채워짐)
alter table restaurants
    add column not_recommend_count int not null default 0;
 
