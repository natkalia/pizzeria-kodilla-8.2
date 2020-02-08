import { templates, select } from '../settings.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';

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
  }
  initWidgets() {
    this.peopleAmount = new AmountWidget(this.dom.peopleAmount);
    this.hoursAmount = new AmountWidget(this.dom.hoursAmount);
    this.datePicker = new DatePicker(this.dom.datePicker);
  }
}

export default Booking;
