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
      this.initAccordion();
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
