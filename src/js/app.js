import { settings, select, classNames } from './settings.js';
import Product from './components/Product.js';
import Cart from './components/Cart.js';
import Booking from './components/Booking.js';
import Main from './components/Main.js';

const app = {
  initBooking() {
    /* get container of booking widget */
    const booking = document.querySelector(select.containerOf.booking);
    new Booking(booking);
  },
  initMenu() {
    for(let productData in this.data.products) {
      new Product(this.data.products[productData].id, this.data.products[productData]);
    }
  },
  initMain() {
    this.mainElement = document.querySelector(select.containerOf.main);
    this.main = new Main(this.mainElement);

    /* catch custom event from Main.js navigation to activate
    chosen page based on event payload with id */
    this.mainElement.addEventListener('activatePage', (e) => {
      this.activatePage(e.detail.id);
      /* change url hash to make sure that after refresh
      user remains on the same page
      add slash to prevent scrolling down */
      window.location.hash = `#/${e.detail.id}`;
    });
  },
  initPages() {
    /* get one container with all pages and its children e.g. order, booking */
    this.pages = document.querySelector(select.containerOf.pages).children;
    /* find all nav links in header navigation to pages */
    this.navLinks = document.querySelectorAll(select.nav.links);
    /* activate one (first) page as initial page, based on id in url */
    const idFromHash = window.location.hash.substring(2);
    /* check if id is matching to existing page
    if yes redirect to new page
    if not to default page */
    let pageMatchingHash = false || this.pages[0].id;
    for(let page of this.pages) {
      if (page.id === idFromHash) {
        pageMatchingHash = page.id;
        break;
      }
    }
    this.activatePage(pageMatchingHash);

    /* loop to add listeners for links to pages in navigation */
    for(let link of this.navLinks) {
      link.addEventListener('click', (e) => {
        /* prevent browser from opening new tab */
        e.preventDefault();
        /* get page id from href */
        const id = e.target.getAttribute('href').substring(1);
        /* run activatePage with found id */
        this.activatePage(id);
        /* change url hash to make sure that after refresh
        user remains on the same page
        add slash to prevent scrolling down */
        window.location.hash = `#/${id}`;
      });
    }
  },
  activatePage(pageId) {
    /* loop through all containers of pages from this.pages
    add class active to page with page id from argument
    remove class active from non-matching pages */
    for(let page of this.pages) {
      page.classList.toggle(
        classNames.pages.active,
        page.id === pageId
      );
    }
    /* loop through nav links and add/remove class active */
    for(let link of this.navLinks) {
      link.classList.toggle(
        classNames.nav.active,
        link.getAttribute('href') === `#${pageId}`
      );
    }
  },
  initData() {
    this.data = {};
    const url = settings.db.url + '/' + settings.db.product;
    fetch(url)
      .then(res => {
        return res.json();
      })
      .then(res => {
        this.data.products = res;
        this.initMenu();
      });
  },
  initCart() {
    const cartElem = document.querySelector(select.containerOf.cart);
    this.cart = new Cart(cartElem);
    /* catch even add to cart and add product from event to cart */
    this.productList = document.querySelector(select.containerOf.menu);
    this.productList.addEventListener('add-to-cart', (e) => {
      this.cart.add(e.detail.product);
    });
  },
  init() {
    this.initPages();
    this.initData();
    this.initCart();
    this.initBooking();
    this.initMain();
  },
};
app.init();
