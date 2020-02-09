import { templates, select } from '../settings.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking {
  constructor(element) {
    this.render(element);
    this.initWidgets();
  }
  render(element) {
    const generatedHTML = templates.bookingWidget();
    this.dom = {};
    this.dom.wrapper = element;
    this.dom.wrapper.innerHTML = generatedHTML;
    this.dom.peopleAmount =
      this.dom.wrapper.querySelector(select.booking.peopleAmount);
    this.dom.hoursAmount =
      this.dom.wrapper.querySelector(select.booking.hoursAmount);
    this.dom.datePicker =
      this.dom.datePicker =
      this.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
    this.dom.hourPicker =
      this.dom.hourPicker =
      this.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);
  }
  initWidgets() {
    this.peopleAmount = new AmountWidget(this.dom.peopleAmount);
    this.hoursAmount = new AmountWidget(this.dom.hoursAmount);
    this.datePicker = new DatePicker(this.dom.datePicker);
    this.hourPicker = new HourPicker(this.dom.hourPicker);
  }
}

export default Booking;
