/* global flatpickr */
import utils from '../utils.js';
import { select, settings } from '../settings.js';
import BaseWidget from './BaseWidget.js';

class DatePicker extends BaseWidget {
  constructor(wrapper) {
    super(wrapper, utils.dateToStr(new Date()));
    this.dom.input = this.dom.wrapper.querySelector(select.widgets.datePicker.input);
    this.initPlugin();
  }
  initPlugin() {
    this.minDate = new Date(this.value);
    /* get data from the future which is after min date
    by adding number of days */
    this.maxDate = utils.addDays(this.minDate, settings.datePicker.maxDaysInFuture);
    /* init flatpickr */
    flatpickr(this.dom.input, {
      defaultDate: this.minDate,
      minDate: this.minDate,
      maxDate: this.maxDate,
      'locale': {
        'firstDayOfWeek': 1 // start week on Monday
      },
      'disable': [
        function(date) {
          return (date.getDay() === 1); // disable Mondays when restaurant is closed
        }
      ],
      onChange: (selectedDates, dateStr) => {
        /* use setter to set value from input in datepicker */
        this.value = dateStr;
      },
    });
  }
  /* overwrite method from BaseWidget */
  parseValue(value) {
    return value;
  }
  /* overwrite method from BaseWidget */
  isValid() {
    return true;
  }
  /* overwrite method from BaseWidget */
  renderValue() {
    return true;
  }
}

export default DatePicker;
