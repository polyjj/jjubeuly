/**
 * 블로그 포스트 로더
 * JSON 파일에서 최신 블로그 포스트를 로드하여 표시합니다
 */

(function($) {
    'use strict';

    // 블로그 포스트를 로드하는 함수
    function loadLatestBlogPosts(limit = 6) {
        $.getJSON('assets/data/blog-posts.json', function(posts) {
            // 날짜순으로 정렬 (최신순)
            posts.sort(function(a, b) {
                return new Date(b.date) - new Date(a.date);
            });

            // 최신 포스트만 선택
            const latestPosts = posts.slice(0, limit);
            const container = $('#latest-blog-posts');
            
            container.empty();

            latestPosts.forEach(function(post, index) {
                const delay = (index + 1) * 0.1;
                const formattedDate = formatDate(post.date);
                
                const postHtml = `
                    <div class="col-lg-4 col-md-6">
                        <div class="blog-item wow fadeInUp" data-wow-delay="${delay}s">
                            <div class="blog-thumb">
                                <a href="${post.link}">
                                    <img src="${post.image}" alt="${post.title}" />
                                </a>
                                <a href="blog.html?category=${post.category}" class="category">${post.categoryLabel}</a>
                            </div>
                            <div class="blog-content">
                                <div class="blog-meta">
                                    <ul class="ul-reset">
                                        <li><i class="fa-light fa-calendar-days"></i> ${formattedDate}</li>
                                        <li><i class="fa-light fa-tag"></i> ${post.tags.join(', ')}</li>
                                    </ul>
                                </div>
                                <h3 class="blog-title">
                                    <a href="${post.link}">${post.title}</a>
                                </h3>
                                <p class="blog-excerpt">${post.excerpt}</p>
                            </div>
                        </div>
                    </div>
                `;
                
                container.append(postHtml);
            });

            // WOW.js 재초기화 (새로 추가된 요소에 애니메이션 적용)
            if (typeof WOW !== 'undefined') {
                new WOW().init();
            }
        }).fail(function() {
            console.error('블로그 포스트를 불러올 수 없습니다.');
            $('#latest-blog-posts').html('<div class="col-12 text-center"><p>블로그 포스트를 불러올 수 없습니다.</p></div>');
        });
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
        if ($('#latest-blog-posts').length) {
            loadLatestBlogPosts(6);
        }
    });

})(jQuery);
