import { settings, select } from '../settings.js';
import BaseWidget from './BaseWidget.js';

class AmountWidget extends BaseWidget {
  constructor(element) {
    super(element,
      element.getAttribute(settings.amountWidget.defaultValueAttribute) ||
      settings.amountWidget.defaultValue);
    this.getElements(element);

    this.initActions();
  }
  getElements() {
    this.dom.input =
      this.dom.wrapper
        .querySelector(select.widgets.amount.input);
    this.dom.linkDecrease =
      this.dom.wrapper
        .querySelector(select.widgets.amount.linkDecrease);
    this.dom.linkIncrease =
      this.dom.wrapper
        .querySelector(select.widgets.amount.linkIncrease);
  }
  isValid(value) {
    /* use data from properties (as inserted in html attributes)
    or use data from settings object */
    const dataMinValue =
      this.dom.wrapper
        .getAttribute(settings.amountWidget.defaultMinAttribute) ||
        settings.amountWidget.defaultMin;

    const dataMaxValue =
      this.dom.wrapper
        .getAttribute(settings.amountWidget.defaultMaxAttribute) ||
        settings.amountWidget.defaultMax;

    return !isNaN(value)
      && value >= dataMinValue
      && value <= dataMaxValue;
  }
  renderValue() {
    this.dom.input.value = this.value;
  }
  initActions() {
    this.dom.input.addEventListener('change', () =>
      this.value = this.dom.input.value);

    this.dom.linkDecrease.addEventListener('click', (e) => {
      e.preventDefault();
      this.value--;
    });

    this.dom.linkIncrease.addEventListener('click', (e) => {
      e.preventDefault();
      this.value++;
    });
  }
}

export default AmountWidget;
