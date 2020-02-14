
import { select } from '../settings.js';
import Carousel from './Carousel.js';

class Main {
  constructor(element) {
    this.getElements(element);
    this.initCarousel();
  }

  getElements(element) {
    this.dom = {};
    this.dom.wrapper = element;
    /* get boxes with links on main page */
    this.dom.navBoxes = this.dom.wrapper.querySelectorAll(select.main.boxes);
    /* get links in these boxes */
    this.dom.mainLinks = this.dom.wrapper.querySelectorAll(select.main.links);

    /* listen for click and redirect based on href id*/
    this.dom.navBoxes.forEach(link => {
      link.addEventListener('click', (e) => {
        /* prevent browser from opening new tab */
        e.preventDefault();
        /* get link from box */
        const clickedLink = link.querySelector(select.main.links);
        /* get page id from href */
        const id = clickedLink.getAttribute('href').substring(1);
        /* run activatePage with found id to dispatch event to app.js */
        this.activatePage(id);
      });
    });
  }

  activatePage(id) {
    /* this event and id of chosen page will be used in app.js */
    const event = new CustomEvent('activatePage', {
      bubbles: true,
      detail: {
        id
      },
    });
    this.dom.wrapper.dispatchEvent(event);
  }

  initCarousel() {
    this.element = this.dom.wrapper.querySelector(select.main.carousel);
    this.carousel = new Carousel(this.element);
  }
}

export default Main;
