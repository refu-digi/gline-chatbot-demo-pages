// メインJavaScript
console.log('Theme loaded');

// ハンバーガーメニュー
document.addEventListener('DOMContentLoaded', function() {
  const hamburgerBtn = document.querySelector('.l-header__hamburger');
  const menu = document.querySelector('.l-header__menu');
  const overlay = document.querySelector('.l-header__menu-overlay');

  // メニューを開く
  function openMenu() {
    menu.classList.add('is-open');
    hamburgerBtn.classList.add('is-active');
    document.body.style.overflow = 'hidden';
  }

  // メニューを閉じる
  function closeMenu() {
    menu.classList.remove('is-open');
    hamburgerBtn.classList.remove('is-active');
    document.body.style.overflow = '';
  }

  // イベントリスナー
  if (hamburgerBtn) {
    hamburgerBtn.addEventListener('click', function() {
      if (menu.classList.contains('is-open')) {
        closeMenu();
      } else {
        openMenu();
      }
    });
  }

  if (overlay) {
    overlay.addEventListener('click', closeMenu);
  }

  // ESCキーでメニューを閉じる
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && menu.classList.contains('is-open')) {
      closeMenu();
    }
  });
});

// ニュースリストスライダー（Splide）
document.addEventListener('DOMContentLoaded', function() {
  if (document.querySelector('.p-front-news__news-swiper')) {
    new Splide('.p-front-news__news-swiper', {
      type: 'loop',
      perPage: 4,
      perMove: 1,
      gap: '30px',
      padding: { left: '12.5%', right: '12.5%' },
      pagination: '.p-front-news__news-pagination',
      arrows: true,
      focus: 0,
      trimSpace: false,
      breakpoints: {
        768: {
          perPage: 2,
          gap: '20px',
          padding: 0,
        },
      },
    }).mount();
  }
  
  // 社長ブログスライダー（Splide）
  if (document.querySelector('.p-front-ceoblog__ceoblog-swiper')) {
    new Splide('.p-front-ceoblog__ceoblog-swiper', {
      type: 'loop',
      perPage: 4,
      perMove: 1,
      gap: '30px',
      padding: { left: '12.5%', right: '12.5%' },
      pagination: '.p-front-ceoblog__ceoblog-pagination',
      arrows: true,
      focus: 0,
      trimSpace: false,
      breakpoints: {
        768: {
          perPage: 2,
          gap: '20px',
          padding: 0,
        },
      },
    }).mount();
  }
  
  // 会社概要 YouTube動画スライダー（カスタム実装）
  if (document.querySelector('.p-company__cont04-slider')) {
    const slider = document.querySelector('.p-company__cont04-slider');
    const wrapper = slider.querySelector('.swiper-wrapper');
    const slides = Array.from(slider.querySelectorAll('.swiper-slide'));
    const prevBtn = slider.querySelector('.swiper-button-prev');
    const nextBtn = slider.querySelector('.swiper-button-next');
    
    let currentIndex = 0;
    const totalSlides = slides.length;
    
    // 最初と最後にクローンを追加して無限ループを実現
    const firstClone = slides[0].cloneNode(true);
    const lastClone = slides[totalSlides - 1].cloneNode(true);
    wrapper.appendChild(firstClone);
    wrapper.insertBefore(lastClone, slides[0]);
    
    // 初期位置を調整（クローンを考慮）
    currentIndex = 1;
    
    function updateSlider(transition = true) {
      const slideWidth = slides[0].offsetWidth;
      const gap = 30;
      const offset = -(currentIndex * (slideWidth + gap));
      
      if (transition) {
        wrapper.style.transition = 'transform 0.5s ease';
      } else {
        wrapper.style.transition = 'none';
      }
      
      wrapper.style.transform = `translateX(${offset}px)`;
    }
    
    function nextSlide() {
      currentIndex++;
      updateSlider(true);
      
      // 最後のクローンに到達したら、瞬時に最初の実スライドに戻る
      if (currentIndex === totalSlides + 1) {
        setTimeout(() => {
          currentIndex = 1;
          updateSlider(false);
        }, 500);
      }
    }
    
    function prevSlide() {
      currentIndex--;
      updateSlider(true);
      
      // 最初のクローンに到達したら、瞬時に最後の実スライドに戻る
      if (currentIndex === 0) {
        setTimeout(() => {
          currentIndex = totalSlides;
          updateSlider(false);
        }, 500);
      }
    }
    
    if (prevBtn) prevBtn.addEventListener('click', prevSlide);
    if (nextBtn) nextBtn.addEventListener('click', nextSlide);
    
    // リサイズ時に位置を再計算
    window.addEventListener('resize', () => updateSlider(false));
    
    updateSlider(false);
  }
});


// サイドテキストの無限スクロール
document.addEventListener('DOMContentLoaded', function() {
  const scrollElements = document.querySelectorAll('.p-front-recruit__side-text-scroll, .p-gline-story01__side-text-scroll, .p-gline-story02__side-text-scroll, .p-gline-story03__side-text-scroll, .p-gline-story04__side-text-scroll');
  
  scrollElements.forEach(function(scrollElement) {
    const originalText = scrollElement.querySelector('p');
    if (!originalText) return;
    
    // テキストを20個複製
    for (let i = 0; i < 19; i++) {
      const clonedText = originalText.cloneNode(true);
      scrollElement.appendChild(clonedText);
    }
    
    let currentPosition = 0;
    const speed = 1; // スクロール速度（px/frame）
    
    function animate() {
      currentPosition += speed;
      
      const firstElement = scrollElement.firstElementChild;
      const firstElementHeight = firstElement.offsetHeight;
      
      // 最初の要素が完全に上に消えたら、最後に移動
      if (currentPosition >= firstElementHeight) {
        scrollElement.appendChild(firstElement);
        currentPosition = 0;
      }
      
      scrollElement.style.transform = `translateY(-${currentPosition}px)`;
      requestAnimationFrame(animate);
    }
    
    animate();
  });
});

// View More 機能
document.addEventListener('DOMContentLoaded', function() {
  const viewMoreElements = document.querySelectorAll('.view-more');
  
  // モーダルを作成
  const modal = document.createElement('div');
  modal.className = 'view-more-modal';
  const modalImg = document.createElement('img');
  modalImg.className = 'view-more-modal__img';
  modal.appendChild(modalImg);
  document.body.appendChild(modal);
  
  viewMoreElements.forEach(function(element) {
    const btn = element.querySelector('.view-more__btn');
    const img = element.querySelector('img:not(.view-more__btn img)');
    
    if (!btn || !img) return;
    
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      modalImg.src = img.src;
      modal.classList.add('is-active');
      document.body.style.overflow = 'hidden';
    });
  });
  
  // モーダルをクリックで閉じる
  modal.addEventListener('click', function() {
    modal.classList.remove('is-active');
    document.body.style.overflow = '';
  });
});
