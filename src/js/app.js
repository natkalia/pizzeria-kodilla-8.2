import { settings, select, classNames, templates } from './settings.js';
import Product from './components/Product.js';
import Cart from './components/Cart.js';

const app = {
  initMenu: function() {
    for(let productData in this.data.products) {
      new Product(this.data.products[productData].id, this.data.products[productData]);
    }
  },
  initData: function() {
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
  initCart: function() {
    const cartElem = document.querySelector(select.containerOf.cart);
    this.cart = new Cart(cartElem);
    /* catch even add to cart and add product from event to cart */
    this.productList = document.querySelector(select.containerOf.menu);
    this.productList.addEventListener('add-to-cart', (e) => {
      app.cart.add(e.detail.product);
    });
  },
  init: function() {
    console.log('*** App starting ***');
    console.log('thisApp:', this);
    console.log('classNames:', classNames);
    console.log('templates:', templates);
    this.initData();
    this.initCart();
  },
};
app.init();
