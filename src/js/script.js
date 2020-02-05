/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product',
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input.amount',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: '.cart__total-number',
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    cart: {
      wrapperActive: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    },
    cart: {
      defaultDeliveryFee: 20,
    },
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
  };

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
    getElements(){
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
        /*  for each active product
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
      this.amountWidgetElem.addEventListener('updated', () => {
        this.processOrder();
      });
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
      this.price = this.priceSingle * this.amountWidget.getAmountValue;

      /* show price in html element of product */
      this.priceElem.innerHTML = this.price;
    }
    addToCart() {
      this.name = this.data.name;
      this.amount = this.amountWidget.getAmountValue;
      app.cart.add(this);
    }
  }

  class AmountWidget {
    constructor(element) {
      this.getElements(element);

      /* check if there is default amount in product object inserted in html
      if yes get default amount value from attribute in amount widget
      if no get default amount value from settings */
      const ifDefaultAmount = !!this.element.getAttribute('data-default');

      this.input.value = ifDefaultAmount ?
        this.element.getAttribute('data-default') :
        settings.amountWidget.defaultValue;

      /* set amount value in object from input */
      this.setAmountValue = this.input.value;

      this.initActions();
    }
    getElements(element) {
      this.element = element;
      this.input = this.element.querySelector(select.widgets.amount.input);
      this.linkDecrease = this.element.querySelector(select.widgets.amount.linkDecrease);
      this.linkIncrease = this.element.querySelector(select.widgets.amount.linkIncrease);
    }

    /* setter */
    set setAmountValue(value){

      /* check for boolean if product object has amount properties: default/min/max */
      const ifMinAmount = !!this.element.getAttribute('data-min');
      const ifMaxAmount = !!this.element.getAttribute('data-max');

      /* if yes, use data from properties (as inserted in html attributes)
      if no, use data from settings object */
      const dataMinValue = ifMinAmount ? this.element.getAttribute('data-min') : settings.amountWidget.defaultMin;
      const dataMaxValue = ifMaxAmount ? this.element.getAttribute('data-max') : settings.amountWidget.defaultMax;

      /* normalize new value to integer */
      const newValue = parseInt(value);

      /* check if amount in input from user is a new value and if in min/max range */
      const validateAmount = (newValue !== this.getAmountValue) &&
                             (newValue >= dataMinValue) &&
                             (newValue <= dataMaxValue);
      /* if yes then change value and input value */
      if (validateAmount) {
        this._value = newValue;
        this.announce();
      }
      /* if not then leave old value */
      this.input.value = this.getAmountValue;
    }

    /* getter */
    get getAmountValue() {
      return this._value;
    }

    initActions() {
      this.input.addEventListener('change', () => {
        this.setAmountValue = this.input.value;
      });
      this.linkDecrease.addEventListener('click', (e) => {
        e.preventDefault();
        this.setAmountValue = this.getAmountValue - 1;
      });
      this.linkIncrease.addEventListener('click', (e) => {
        e.preventDefault();
        this.setAmountValue = this.getAmountValue + 1;
      });
    }
    announce() {
      const event = new CustomEvent('updated', {
        bubbles: true
      });
      this.element.dispatchEvent(event);
    }
  }

  class Cart {
    constructor(element) {
      this.products = [];
      this.deliveryFee = settings.cart.defaultDeliveryFee;
      this.getElements(element);
      this.initActions();
    }
    getElements(element) {
      this.dom = {};
      this.dom.wrapper = element;
      this.dom.toggleTrigger = this.dom.wrapper.querySelector(select.cart.toggleTrigger);
      this.dom.productList = this.dom.wrapper.querySelector(select.cart.productList);
      this.renderTotalsKeys = ['totalNumber', 'totalPrice', 'subtotalPrice', 'deliveryFee'];
      for(let key of this.renderTotalsKeys){
        this.dom[key] = this.dom.wrapper.querySelectorAll(select.cart[key]);
      }
    }
    initActions() {
      this.dom.toggleTrigger.addEventListener('click', () => {
        this.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      });

      this.dom.productList.addEventListener('click', () => {
        this.update();
      });

      this.dom.productList.addEventListener('remove', (e) => {
        this.remove(e.detail.cartProduct);
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
      const thisCart = this;
      /* calculate total products, sub/total prices, delivery fee, for cart */
      thisCart.totalNumber = 0;
      thisCart.subtotalPrice = 0;
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
    }
    remove(cartProduct) {
      /* find current product in array and delete it from array and cart html code */
      const index = this.products.indexOf(cartProduct);
      this.products.splice(index, 1);
      cartProduct.dom.wrapper.remove();
      /* update total amounts in cart after deleting product */
      this.update();
    }
  }

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
      this.amountWidget.setAmountValue = this.amount;
      this.amountWidget.input.value = this.amount;
      this.dom.amountWidget.addEventListener('click', () => {
        this.amountWidget.setAmountValue = this.amountWidget.input.value;
        this.amount = this.amountWidget.getAmountValue;
        this.price = this.priceSingle * this.amount;
        this.dom.price.innerHTML = this.price;
      });
    }
    remove() {
      const thisCartProduct = this;
      const event = new CustomEvent('remove', {
        bubbles: true,
        /* information about instance of product to be sent to event handler */
        detail: {
          cartProduct: thisCartProduct
        },
      });
      this.dom.wrapper.dispatchEvent(event);
    }
    initActions() {
      this.dom.edit.addEventListener('click', (e) => {
        e.preventDefault();
      });

      this.dom.remove.addEventListener('click', (e) => {
        e.preventDefault();
        this.remove();
      });
    }
  }

  const app = {
    initMenu: function() {
      for(let productData in this.data.products) {
        new Product(productData, this.data.products[productData]);
      }
    },
    initData: function() {
      this.data = dataSource;
    },
    initCart: function() {
      const cartElem = document.querySelector(select.containerOf.cart);
      this.cart = new Cart(cartElem);
    },
    init: function() {
      console.log('*** App starting ***');
      console.log('thisApp:', this);
      console.log('classNames:', classNames);
      console.log('templates:', templates);
      this.initData();
      this.initMenu();
      this.initCart();
    },
  };
  app.init();
}
