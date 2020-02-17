import { settings, select, classNames, templates, attributesNames } from '../settings.js';
import CartProduct from './CartProduct.js';
import utils from '../utils.js';

class Cart {
  constructor(element) {
    this.products = [];
    this.deliveryFee = settings.cart.defaultDeliveryFee;
    this.getElements(element);
    this.initActions();
    /* check if any products left in cart and if to allow sending order */
    this.ifSendOrder();
  }
  getElements(element) {
    this.dom = {};
    this.dom.wrapper = element;
    this.dom.toggleTrigger = this.dom.wrapper.querySelector(select.cart.toggleTrigger);
    this.dom.productList = this.dom.wrapper.querySelector(select.cart.productList);
    this.dom.form = this.dom.wrapper.querySelector(select.cart.form);
    this.dom.formSubmit = this.dom.wrapper.querySelector(select.cart.formSubmit);
    this.dom.formAttribute = this.dom.wrapper.querySelector(attributesNames.cart.buttonDisabled);
    this.dom.phone = this.dom.wrapper.querySelector(select.cart.phone);
    this.dom.address = this.dom.wrapper.querySelector(select.cart.address);
    this.renderTotalsKeys = ['totalNumber', 'totalPrice', 'subtotalPrice', 'deliveryFee'];
    for(let key of this.renderTotalsKeys){
      this.dom[key] = this.dom.wrapper.querySelectorAll(select.cart[key]);
    }
  }
  initActions() {
    this.dom.toggleTrigger.addEventListener('click', () =>
      this.dom.wrapper.classList.toggle(classNames.cart.wrapperActive));

    this.dom.productList.addEventListener('click', () => {
      this.update();
    });

    this.dom.productList.addEventListener('remove', (e) =>
      this.remove(e.detail.cartProduct));

    this.dom.productList.addEventListener('edit', (e) =>
      this.edit(e.detail.cartProduct));

    this.dom.form.addEventListener('submit', (e) => {
      e.preventDefault();
      /* additional validation to deny sending order if no products in cart */
      this.products.length >= 1 ? this.sendOrder() : alert('Cannot send empty order');
    });

    /* prevent user from sending order by pressing enter in input in cart */
    this.dom.form.addEventListener('keypress', (e) => {
      if (event.keyCode === 13) {
        e.preventDefault();
        // alert('Please press ORDER button to send your order!');
      }
    });
  }
  add(menuProduct) {

    /* generate html */
    const generatedHTML = templates.cartProduct(menuProduct);

    /* create DOM element based on  HTML code */
    const generatedDOM = utils.createDOMFromHTML(generatedHTML);

    /* insert new DOM element to product list in cart */
    this.dom.productList.append(generatedDOM);

    this.products.push(new CartProduct(menuProduct, generatedDOM));

    this.update();
  }
  update() {

    /* check if any any products left in cart and if no, zero delivery fee */
    this.ifDeliveryFee();

    /* calculate total products, sub/total prices, delivery fee, for cart */
    this.totalNumber = 0;
    this.subtotalPrice = 0;
    this.products.forEach(product => {
      this.subtotalPrice += product.price;
      // TODO: check why sometimes string after update in cart
      product.amount = parseInt(product.amount);
      this.totalNumber = this.totalNumber + product.amount;
    });
    this.totalPrice = this.subtotalPrice + this.deliveryFee;

    /* render updated totals data in cart */
    for (let key of this.renderTotalsKeys) {
      for (let element of this.dom[key]) {
        element.innerHTML = this[key];
      }
    }

    /* check if any products left in cart and if to allow sending order */
    this.ifSendOrder();
  }
  remove(cartProduct) {
    /* find current product in array and delete it from array and cart html code */
    const index = this.products.indexOf(cartProduct);
    this.products.splice(index, 1);
    cartProduct.dom.wrapper.remove();
    /* update total amounts in cart after deleting product */
    this.update();
  }
  edit(cartProduct) {
    /* TODO: add logic for editing - now only copied from remove */
    const index = this.products.indexOf(cartProduct);
    this.products.splice(index, 1);
    cartProduct.dom.wrapper.remove();
    this.update();
  }
  sendOrder() {
    const url = settings.db.url + '/' + settings.db.order;
    const payload = {
      address: this.dom.address.value,
      phone: this.dom.phone.value,
      totalNumber: this.totalNumber,
      deliveryFee: this.deliveryFee,
      subtotalPrice: this.subtotalPrice,
      totalPrice: this.totalPrice,
      params: this.params,
      products: []
    };

    this.products.forEach(product => {
      const newProduct = product.getData();
      payload.products.push(newProduct);
    });

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };
    fetch(url, options)
      .then(res => res.json()
        .then(res => console.log('order was sent to endpoint', res)));
  }
  ifSendOrder() {
    /* check if there are any products in cart left and add/remove disabled in form/button */
    if (this.products.length <= 0) {
      this.dom.formSubmit.setAttribute(attributesNames.cart.buttonDisabled, 'true');
      this.dom.formSubmit.setAttribute('title', 'Sorry, you cannot send an empty order');
    } else {
      this.dom.formSubmit.removeAttribute(attributesNames.cart.buttonDisabled);
      this.dom.formSubmit.removeAttribute('title');
    }
  }
  ifDeliveryFee() {
    this.products.length <= 0 ?
      this.deliveryFee = 0 :
      this.deliveryFee = settings.cart.defaultDeliveryFee;
  }
}

export default Cart;
