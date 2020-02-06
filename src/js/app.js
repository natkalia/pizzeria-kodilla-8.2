import { settings, select } from './settings.js';
import Product from './components/Product.js';
import Cart from './components/Cart.js';

const app = {
  initMenu() {
    for(let productData in this.data.products) {
      new Product(this.data.products[productData].id, this.data.products[productData]);
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
    console.log('*** App starting ***');
    this.initData();
    this.initCart();
  },
};
app.init();
