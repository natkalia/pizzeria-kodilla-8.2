/* eslint-disable no-debugger */
import { templates, select, settings, classNames } from '../settings.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';
import utils from '../utils.js';

class Booking {
  constructor(element) {
    this.render(element);
    this.getElements();
    this.initWidgets();
    this.getData();
    this.selectTable();
    this.isTimeUpdated();
  }
  getElements() {
    this.dom.peopleAmount = this.dom.wrapper.querySelector(select.booking.peopleAmount);
    this.dom.hoursAmount = this.dom.wrapper.querySelector(select.booking.hoursAmount);
    this.dom.datePicker = this.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
    this.dom.datePicker.input = this.dom.wrapper.querySelector(select.widgets.datePicker.input);
    this.dom.hourPicker = this.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);
    this.dom.hourPicker.input = this.dom.wrapper.querySelector(select.widgets.hourPicker.output);
    this.dom.tables = this.dom.wrapper.querySelectorAll(select.booking.tables);
  }
  initWidgets() {
    this.peopleAmount = new AmountWidget(this.dom.peopleAmount);
    this.hoursAmount = new AmountWidget(this.dom.hoursAmount);
    this.datePicker = new DatePicker(this.dom.datePicker);
    this.hourPicker = new HourPicker(this.dom.hourPicker);

    this.dom.wrapper.addEventListener('updated', () => {
      this.updateDOM();
    });
  }
  getData() {
    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(this.datePicker.minDate);
    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(this.datePicker.maxDate);

    const params = {
      booking: [
        startDateParam,
        endDateParam,
      ],
      eventsCurrent: [
        settings.db.notRepeatParam,
        startDateParam,
        endDateParam
      ],
      eventsRepeat: [
        settings.db.repeatParam,
        endDateParam
      ]
    };

    const urls = {
      /* endpoint for list of bookings
      e.g. //localhost:3131/booking/date_gte */
      booking:       `${settings.db.url}/${settings.db.booking}?${params.booking.join('&')}`,
      /* endpoint for list of one off events */
      eventsCurrent: `${settings.db.url}/${settings.db.event}?${params.eventsCurrent.join('&')}`,
      /* endpoint for list of repeating events */
      eventsRepeat:  `${settings.db.url}/${settings.db.event}?${params.eventsRepeat.join('&')}`,
    };

    /* fetch events from fake API based on params criteria */
    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat)
    ])
      .then(allResponses => {
        const bookingsResponse = allResponses[0];
        const eventsCurrentResponse = allResponses[1];
        const eventsRepeatResponse = allResponses[2];
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json()
        ]);
      })
      .then(([bookings, eventsCurrent, eventsRepeat]) => {
        // console.log(bookings);
        // console.log(eventsCurrent);
        // console.log(eventsRepeat);
        this.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }
  parseData(bookings, eventsCurrent, eventsRepeat) {
    /* create simplified object to check booked tables */
    this.booked = {};

    for(let item of bookings) {
      this.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    for(let item of eventsCurrent) {
      this.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = this.datePicker.minDate;
    const maxDate = this.datePicker.maxDate;

    for(let item of eventsRepeat) {
      if(item.repeat == 'daily') {
        for(let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)) {
          this.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
        }
      }
    }
    this.updateDOM();
  }
  makeBooked(date, hour, duration, table) {
    /* check if date of event already exists in object booked
    if not create object with key with date  */
    if(typeof this.booked[date] == 'undefined') {
      this.booked[date] = {};
    }

    /* hour from format in API to format in booked object
    e.g. from 12:30 to 12.5 */
    const startHour = utils.hourToNumber(hour);

    /* block number of 0.5 hours depending on duration of booking */
    for(let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5) {
      /* check if hour of event already exists in object booked
      if not create array with start hour */
      if(typeof this.booked[date][hourBlock] == 'undefined') {
        this.booked[date][hourBlock] = [];
      }
      /* assign booked table to hour, date */
      this.booked[date][hourBlock].push(table);
    }
  }
  updateDOM() {
    this.date = this.datePicker.value;
    this.hour = utils.hourToNumber(this.hourPicker.value);

    /* all tables free at given date */
    let allAvailable = false;

    if (
      /* check if object or array exists
      if not set allAvailable to true */
      typeof this.booked[this.date] == 'undefined'
      ||
      typeof this.booked[this.date][this.hour] == 'undefined'
    ) {
      allAvailable = true;
    }
    /* iterate through visible tables */
    for(let table of this.dom.tables) {
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if(!isNaN(tableId)) {
        tableId = parseInt(tableId);
      }

      if(
        !allAvailable
        &&
        this.booked[this.date][this.hour].includes(tableId)
      ) {
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    }

  }
  render(element) {
    const generatedHTML = templates.bookingWidget();
    this.dom = {};
    this.dom.wrapper = element;
    this.dom.wrapper.innerHTML = generatedHTML;
  }
  selectTable() {
    this.dom.tables.forEach(() => addEventListener('click', (e) => {
      const clickedTable = e.target;
      clickedTable.classList.toggle(classNames.booking.tableSelected);
    }));
  }
  isTimeUpdated() {
    /* if user resets date, reset table selection */
    this.dom.datePicker.input.addEventListener('change', () => {
      this.resetSelectedTables();
    });
    this.dom.hourPicker.addEventListener('updated', () => {
      this.resetSelectedTables();
    });
  }
  resetSelectedTables() {
    this.dom.tables.forEach(table => {
      table.classList.contains(classNames.booking.tableSelected) ?
        table.classList.toggle(classNames.booking.tableSelected) :
        null;
    });
  }

}

export default Booking;
