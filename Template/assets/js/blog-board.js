/**
 * 블로그 게시판 로더
 * JSON 파일에서 블로그 포스트를 로드하고 카테고리 필터링 기능을 제공합니다
 */

(function($) {
    'use strict';

    let allPosts = [];
    let currentFilter = '*';
    let currentPage = 1;
    const postsPerPage = 6;

    // 카테고리 매핑
    const categoryMap = {
        'planning': 'planning',
        'design': 'design',
        'development': 'development',
        'publishing': 'publishing',
        'youtube': 'youtube',
        'ai-project': 'ai-project',
        'daily-life': 'daily-life',
        'hobby': 'hobby'
    };

    // 블로그 포스트를 로드하는 함수
    function loadBlogPosts() {
        $.getJSON('assets/data/blog-posts.json', function(posts) {
            allPosts = posts;
            
            // 날짜순으로 정렬 (최신순)
            allPosts.sort(function(a, b) {
                return new Date(b.date) - new Date(a.date);
            });

            // URL 파라미터에서 카테고리 확인
            const urlParams = new URLSearchParams(window.location.search);
            const categoryParam = urlParams.get('category');
            if (categoryParam && categoryMap[categoryParam]) {
                currentFilter = '.' + categoryMap[categoryParam];
                $('.filter-button-group button[data-filter="' + currentFilter + '"]').addClass('active');
                $('.filter-button-group button[data-filter="*"]').removeClass('active');
            }

            renderPosts();
            updateCategoryCounts();
        }).fail(function() {
            console.error('블로그 포스트를 불러올 수 없습니다.');
            $('#blog-posts-container').html('<div class="col-12 text-center"><p>블로그 포스트를 불러올 수 없습니다.</p></div>');
        });
    }

    // 포스트를 렌더링하는 함수
    function renderPosts() {
        const container = $('#blog-posts-container');
        container.empty();

        // 필터링된 포스트 가져오기
        let filteredPosts = allPosts;
        if (currentFilter !== '*') {
            const category = currentFilter.replace('.', '');
            filteredPosts = allPosts.filter(function(post) {
                return post.category === category;
            });
        }

        // 페이지네이션
        const startIndex = (currentPage - 1) * postsPerPage;
        const endIndex = startIndex + postsPerPage;
        const paginatedPosts = filteredPosts.slice(startIndex, endIndex);

        if (paginatedPosts.length === 0) {
            container.html('<div class="col-12 text-center"><p>표시할 게시글이 없습니다.</p></div>');
            return;
        }

        paginatedPosts.forEach(function(post, index) {
            const delay = (index + 1) * 0.1;
            const formattedDate = formatDate(post.date);
            const categoryClass = categoryMap[post.category] || '';

            const postHtml = `
                <article class="tj-post ${categoryClass} wow fadeInUp" data-wow-delay="${delay}s">
                    <div class="tj-post__thumb">
                        <a href="${post.link}">
                            <img src="${post.image}" alt="${post.title}" />
                        </a>
                        <a href="blog.html?category=${post.category}" class="category">${post.categoryLabel}</a>
                    </div>
                    <div class="tj-post__content">
                        <div class="tj-post__meta entry-meta">
                            <span><i class="fa-light fa-calendar-days"></i> ${formattedDate}</span>
                            <span><i class="fa-light fa-tag"></i> ${post.tags.join(', ')}</span>
                        </div>
                        <h3 class="tj-post__title entry-title">
                            <a href="${post.link}">${post.title}</a>
                        </h3>
                        <div class="tj-post__excerpt">
                            <p>${post.excerpt}</p>
                        </div>
                        <div class="tj-post__btn">
                            <a href="${post.link}" class="tj-btn-primary">더 보기</a>
                        </div>
                    </div>
                </article>
            `;

            container.append(postHtml);
        });

        // 페이지네이션 업데이트
        updatePagination(filteredPosts.length);

        // WOW.js 재초기화
        if (typeof WOW !== 'undefined') {
            new WOW().init();
        }
    }

    // 페이지네이션 업데이트
    function updatePagination(totalPosts) {
        const totalPages = Math.ceil(totalPosts / postsPerPage);
        const pagination = $('#blog-pagination');

        if (totalPages <= 1) {
            pagination.hide();
            return;
        }

        pagination.show();
        let paginationHtml = '<ul>';

        // 이전 버튼
        if (currentPage > 1) {
            paginationHtml += `<li><a class="page-numbers" href="#" data-page="${currentPage - 1}"><i class="fal fa-arrow-left"></i></a></li>`;
        }

        // 페이지 번호
        for (let i = 1; i <= totalPages; i++) {
            if (i === currentPage) {
                paginationHtml += `<li><span class="page-numbers current">${i}</span></li>`;
            } else {
                paginationHtml += `<li><a class="page-numbers" href="#" data-page="${i}">${i}</a></li>`;
            }
        }

        // 다음 버튼
        if (currentPage < totalPages) {
            paginationHtml += `<li><a class="page-numbers" href="#" data-page="${currentPage + 1}"><i class="fal fa-arrow-right"></i></a></li>`;
        }

        paginationHtml += '</ul>';
        pagination.html(paginationHtml);
    }

    // 카테고리별 포스트 수 업데이트
    function updateCategoryCounts() {
        const categories = {
            'planning': allPosts.filter(p => p.category === 'planning').length,
            'design': allPosts.filter(p => p.category === 'design').length,
            'development': allPosts.filter(p => p.category === 'development').length,
            'publishing': allPosts.filter(p => p.category === 'publishing').length,
            'youtube': allPosts.filter(p => p.category === 'youtube').length,
            'ai-project': allPosts.filter(p => p.category === 'ai-project').length,
            'daily-life': allPosts.filter(p => p.category === 'daily-life').length,
            'hobby': allPosts.filter(p => p.category === 'hobby').length
        };

        // 사이드바 카테고리 업데이트
        const categoryList = $('.widget_categories ul');
        if (categoryList.length) {
            categoryList.html(`
                <li><a href="blog.html?category=planning">기획</a> (${categories.planning})</li>
                <li><a href="blog.html?category=design">디자인</a> (${categories.design})</li>
                <li><a href="blog.html?category=development">개발</a> (${categories.development})</li>
                <li><a href="blog.html?category=publishing">출판</a> (${categories.publishing})</li>
                <li><a href="blog.html?category=youtube">유튜브</a> (${categories.youtube})</li>
                <li><a href="blog.html?category=ai-project">AI 프로젝트</a> (${categories['ai-project']})</li>
                <li><a href="blog.html?category=daily-life">일상</a> (${categories['daily-life']})</li>
                <li><a href="blog.html?category=hobby">취미</a> (${categories.hobby})</li>
            `);
        }
    }

    // 날짜 포맷팅 함수
    function formatDate(dateString) {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}. ${month}. ${day}`;
    }

    // 페이지 로드 시 실행
    $(document).ready(function() {
        if ($('#blog-posts-container').length) {
            loadBlogPosts();

            // 카테고리 필터 버튼 클릭 이벤트
            $('.filter-button-group button').on('click', function() {
                const filter = $(this).attr('data-filter');
                currentFilter = filter;
                currentPage = 1;

                // 활성 버튼 업데이트
                $('.filter-button-group button').removeClass('active');
                $(this).addClass('active');

                // URL 업데이트
                if (filter === '*') {
                    window.history.pushState({}, '', 'blog.html');
                } else {
                    const category = filter.replace('.', '');
                    window.history.pushState({}, '', 'blog.html?category=' + category);
                }

                renderPosts();
            });

            // 페이지네이션 클릭 이벤트
            $(document).on('click', '.page-numbers', function(e) {
                e.preventDefault();
                const page = $(this).data('page');
                if (page) {
                    currentPage = page;
                    renderPosts();
                    $('html, body').animate({
                        scrollTop: $('#blog-posts-container').offset().top - 100
                    }, 500);
                }
            });
        }
    });

})(jQuery);
