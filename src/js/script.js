/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
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
        input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
  };

  class Product {
    constructor (id, data) {
      this.id = id;
      this.data = data;
      this.renderInMenu();
      this.getElements();
      this.initAccordion();
      this.initOrderForm();
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
      // console.log('initOrderForm', this);
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
      });
    }
    processOrder() {
      const formData = utils.serializeFormToObject(this.form);

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

          /* images feature */
          const image = this.imageWrapper.querySelector(`.${param}-${option}`);
          if (ifChecked && image !== null) {
            image.classList.add(classNames.menuProduct.imageVisible);
          } else if (!ifChecked && image !== null) {
            image.classList.remove(classNames.menuProduct.imageVisible);
          }
        }
      }
      this.priceElem.innerHTML = price;
    }
  }

  const app = {
    initMenu: function(){
      for(let productData in this.data.products) {
        new Product(productData, this.data.products[productData]);
      }
    },
    initData: function() {
      this.data = dataSource;
    },
    init: function(){
      console.log('*** App starting ***');
      console.log('thisApp:', this);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);
      this.initData();
      this.initMenu();
    },
  };
  app.init();
}
