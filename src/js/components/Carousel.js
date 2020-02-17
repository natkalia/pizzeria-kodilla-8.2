/* global Swiper */

class Carousel {
  constructor(wrapper) {
    this.getElements(wrapper);
    this.initCarousel();
  }

  getElements(wrapper) {
    this.dom = {};
    this.dom.wrapper = wrapper;
  }

  initCarousel() {
    /* initialize Swiper */
    new Swiper ('.swiper-container', {
      loop: true,
      centeredSlides: true,
      autoplay: {
        delay: 3000,
        disableOnInteraction: false,
      },
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
      },
    });

    /* use swiper on main page */
    const mainSwiper = this.dom.wrapper.querySelector('.swiper-container').swiper;
    mainSwiper.slideNext();
  }
}

export default Carousel;
