import { select } from '../settings.js';
import AmountWidget from './AmountWidget.js';

class CartProduct {
  constructor(menuProduct, element) {
    this.id = menuProduct.id;
    this.name = menuProduct.name;
    this.price = menuProduct.price;
    this.amount = menuProduct.amount;
    this.priceSingle = menuProduct.priceSingle;
    /* quasi-clone object */
    this.params = JSON.parse(JSON.stringify(menuProduct.params));
    this.getElements(element);
    this.initAmountWidget();
    this.initActions();
  }
  getElements(element) {
    this.dom = {};
    this.dom.wrapper = element;
    this.dom.price = this.dom.wrapper.querySelector(select.cartProduct.price);
    this.dom.amountWidget = this.dom.wrapper.querySelector(select.cartProduct.amountWidget);
    this.dom.edit = this.dom.wrapper.querySelector(select.cartProduct.edit);
    this.dom.remove = this.dom.wrapper.querySelector(select.cartProduct.remove);
  }
  initAmountWidget() {
    this.amountWidget = new AmountWidget(this.dom.amountWidget);
    this.amountWidget.value = this.amount;
    this.amountWidget.dom.input.value = this.amount;
    this.dom.amountWidget.addEventListener('click', () => {
      this.amountWidget.value = this.amountWidget.dom.input.value;
      this.amount = this.amountWidget.value;
      this.price = this.priceSingle * this.amount;
      this.dom.price.innerHTML = this.price;
    });
  }
  remove() {
    const event = new CustomEvent('remove', {
      bubbles: true,
      /* information about instance of product to be sent to event handler */
      detail: {
        cartProduct: this
      },
    });
    this.dom.wrapper.dispatchEvent(event);
  }
  edit() {
    const event = new CustomEvent('edit', {
      bubbles: true,
      /* information about instance of product to be sent to event handler */
      detail: {
        cartProduct: this
      },
    });
    this.dom.wrapper.dispatchEvent(event);
  }
  initActions() {
    this.dom.edit.addEventListener('click', (e) => {
      e.preventDefault();
      this.edit();
    });

    this.dom.remove.addEventListener('click', (e) => {
      e.preventDefault();
      this.remove();
    });
  }
  getData() {
    const data = {
      id: this.id,
      amount: this.amount,
      priceSingle: this.priceSingle,
      price: this.price,
      params: this.params
    };
    return data;
  }
}

export default CartProduct;
