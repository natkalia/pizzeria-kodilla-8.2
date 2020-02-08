/* global rangeSlider */
import BaseWidget from './BaseWidget.js';
import { select, settings } from '../settings.js';
import utils from '../utils.js';

class HourPicker extends BaseWidget {
  constructor(wrapper) {
    super(wrapper, settings.hours.open);
    this.dom.input = this.dom.wrapper.querySelector(select.widgets.hourPicker.input);
    this.dom.output = this.dom.wrapper.querySelector(select.widgets.hourPicker.output);
    /* here (via setter in BaseWidget) we parseValue from 12 to 12:00
    use isValid, and use renderValue to render result in output */
    this.value = this.dom.input.value;
    this.initPlugin();
  }
  initPlugin() {
    rangeSlider.create(this.dom.input);
    this.dom.input.addEventListener('input', () => {
      this.value = this.dom.input.value;
    });
  }
  parseValue(value) {
    /* change format of hour e.g. from 12 to 12:00 */
    return utils.numberToHour(value);
  }
  isValid() {
    return true;
  }
  renderValue() {
    /* get value from widget (via getter in BaseWidget) and render */
    this.dom.output.innerHTML = this.value;
  }
}

export default HourPicker;
