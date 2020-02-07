import { select, classNames, templates } from '../settings.js';
import AmountWidget from './AmountWidget.js';
import utils from '../utils.js';

class Product {
  constructor (id, data) {
    this.id = id;
    this.data = data;
    this.renderInMenu();
    this.getElements();
    this.initAccordion();
    this.initOrderForm();
    this.initAmountWidget();
    this.processOrder();
  }
  renderInMenu() {
    /* generate html for product */
    const generatedHTML = templates.menuProduct(this.data);

    /* create DOM element based on  HTML code */
    this.element = utils.createDOMFromHTML(generatedHTML);

    /* find menu container */
    const menuContainer = document.querySelector(select.containerOf.menu);

    /* insert new DOM element to found menu container */
    menuContainer.appendChild(this.element);
  }
  getElements() {
    this.accordionTrigger = this.element.querySelector(select.menuProduct.clickable);
    this.form = this.element.querySelector(select.menuProduct.form);
    this.formInputs = this.form.querySelectorAll(select.all.formInputs);
    this.cartButton = this.element.querySelector(select.menuProduct.cartButton);
    this.priceElem = this.element.querySelector(select.menuProduct.priceElem);
    this.imageWrapper = this.element.querySelector(select.menuProduct.imageWrapper);
    this.amountWidgetElem = this.element.querySelector(select.menuProduct.amountWidget);
  }
  initAccordion() {
    /* find the clickable trigger (the element that should react to clicking) */
    const clickedMenuProduct = this.element.querySelector(select.menuProduct.clickable);

    /* add click event listener with handler related to active class toggle */
    clickedMenuProduct.addEventListener('click', (e) => {
      e.preventDefault();
      /* toggle active class on element of thisProduct */
      this.element.classList.toggle('active');
      /* find all active products */
      const allActiveProducts = document.querySelectorAll(select.all.menuProductsActive);
      /* for each active product
      if the active product isn't the element of thisProduct
      remove class active for the active product*/
      allActiveProducts.forEach(product => {
        if (product !== this.element) {
          product.classList.remove('active');
        }
      });
    });
  }
  initOrderForm() {
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.processOrder();
    });
    for(let input of this.formInputs){
      input.addEventListener('change', () => {
        this.processOrder();
      });
    }
    this.cartButton.addEventListener('click', (e) => {
      e.preventDefault();
      this.processOrder();
      this.addToCart();
    });
  }
  initAmountWidget() {
    this.amountWidget = new AmountWidget(this.amountWidgetElem);
    this.amountWidgetElem.addEventListener('updated', () =>
      this.processOrder());
  }
  processOrder() {
    const formData = utils.serializeFormToObject(this.form);

    this.params = {};

    /* get initial total price from data object of this product,
    to be replaced with calculation of price from data object */
    let price = this.data.price;

    /* loop through params in data object of current product - can be one or more params */
    let params = this.data.params;
    for (let param in params) {

      /* get options from current param in current product and loop through them */
      const options = params[param].options;
      for (let option in options) {

        /* compare each option from options in data object if user checked it in user form */
        const ifChecked = formData.hasOwnProperty(param) && formData[param].includes(option);
        const ifDefault = options[option].hasOwnProperty('default') && options[option].default;

        /* increase total price by option's price, if option is checked but not default in data object,
        or decrease if option is not checked but it is marked as default in data object */
        if (ifChecked && !ifDefault) {
          price += options[option].price;
        } else if (!ifChecked && ifDefault) {
          price -= options[option].price;
        }

        /* check for checked options - for cart */
        if (ifChecked) {
          if (!this.params[param]) {
            this.params[param] = {
              label: params[param].label,
              options: {},
            };
          }
          this.params[param].options[option] = options[option].label;
        }

        /* images feature */
        const image = this.imageWrapper.querySelector(`.${param}-${option}`);
        if (image) {
          ifChecked ?
            image.classList.add(classNames.menuProduct.imageVisible) :
            image.classList.remove(classNames.menuProduct.imageVisible);
        }
      }
    }

    /* multiply price by amount */
    this.priceSingle = price;
    this.price = this.priceSingle * this.amountWidget.value;

    /* show price in html element of product */
    this.priceElem.innerHTML = this.price;
  }
  addToCart() {
    this.name = this.data.name;
    this.amount = this.amountWidget.value;

    // app.cart.add(this);
    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        product: this
      }
    });
    this.element.dispatchEvent(event);
  }
}

export default Product;
