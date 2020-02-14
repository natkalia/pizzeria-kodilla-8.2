import { select } from '../settings.js';

class Carousel {
  constructor(wrapper) {
    this.getElements(wrapper);
    this.initCarousel();
  }

  getElements(wrapper) {
    this.dom = {};
    this.dom.wrapper = wrapper;
    this.dom.items = this.dom.wrapper.querySelectorAll(select.carousel.items);
    this.dom.dots = this.dom.wrapper.querySelectorAll(select.carousel.dots);
  }

  initCarousel() {
    this.active = 0;
    this.last = this.dom.items.length - 1;
    /* set automatic carousel items change */
    setInterval(() => {
      this.active === this.last ? this.active = 0 : this.active++;
      this.setActive();
    }, 3000);
  }

  setActive() {
    /* set item active */
    this.dom.items.forEach((item, i) => {
      i === this.active ? item.classList.add('active') : item.classList.remove('active');
    });
    /* set nav dot active */
    this.dom.dots.forEach((dot, i) => {
      i === this.active ? dot.classList.add('active') : dot.classList.remove('active');
    });
  }
}

export default Carousel;
