import { settings, select } from '../settings.js';

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
    this.input.addEventListener('change', () =>
      this.setAmountValue = this.input.value);

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

export default AmountWidget;
