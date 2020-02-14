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
  }
  render(element) {
    const generatedHTML = templates.bookingWidget();
    this.dom = {};
    this.dom.wrapper = element;
    this.dom.wrapper.innerHTML = generatedHTML;
  }
  getElements() {
    this.dom.peopleAmount = this.dom.wrapper.querySelector(select.booking.peopleAmount);
    this.dom.hoursAmount = this.dom.wrapper.querySelector(select.booking.hoursAmount);
    this.dom.datePicker = this.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
    this.dom.datePicker.input = this.dom.wrapper.querySelector(select.widgets.datePicker.input);
    this.dom.hourPicker = this.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);
    this.dom.hourPicker.input = this.dom.wrapper.querySelector(select.widgets.hourPicker.output);
    this.dom.tables = this.dom.wrapper.querySelectorAll(select.booking.tables);
    this.dom.phone = this.dom.wrapper.querySelector(select.booking.phone);
    this.dom.address = this.dom.wrapper.querySelector(select.booking.address);
    this.dom.form = this.dom.wrapper.querySelector(select.booking.form);
    this.dom.formSubmit = this.dom.wrapper.querySelector(select.booking.formSubmit);
    this.dom.starters = this.dom.wrapper.querySelectorAll(select.booking.starters);
  }
  initWidgets() {
    this.peopleAmount = new AmountWidget(this.dom.peopleAmount);
    this.hoursAmount = new AmountWidget(this.dom.hoursAmount);
    this.datePicker = new DatePicker(this.dom.datePicker);
    this.hourPicker = new HourPicker(this.dom.hourPicker);

    this.dom.wrapper.addEventListener('updated', (e) => {
      /* TODO: do it better */
      e.target.classList.contains('range-slider') ? null : this.bookHourPicker();
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
      /* endpoint for list of bookings */
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
        // console.log('bookings from API', bookings);
        // console.log('eventsCurrent from API', eventsCurrent);
        // console.log('eventsRepeat from API', eventsRepeat);
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

    /* iterate to book repeating events starting from its starting date */
    const maxDate = this.datePicker.maxDate;
    for(let item of eventsRepeat) {
      if(item.repeat === 'daily') {
        let loopDate = new Date(item.date);
        for(loopDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)) {
          this.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
        }
      }
    }
    this.bookHourPicker();
    this.updateDOM();
  }
  bookHourPicker() {
    /* TODO: double check if no possibility to book same table
    for the same hour second time because in this method
    we refer to array length */

    /* TODO: maybe refactor in other place that this.booked will already
    before include empty string if there are no bookings
    because now we need it here */

    this.dom.slider = this.dom.wrapper.querySelector(select.widgets.hourPicker.slider);
    const hours = this.booked[this.datePicker.value];
    let gradient = [];

    /* iterate over each hour to check which tables are booked for how long
    and create color for gradient for each 0.5 hour */
    for(let startHour = 12; startHour < 24; startHour += 0.5) {

      /* TODO: Math.ceil for easier debugging,
      can be deleted later on */
      const fromPercent = Math.ceil(((startHour - 12) * 100) / 12);
      const toPercent = Math.ceil((((startHour - 12) + 0.5) * 100) / 12);

      if (!hours || !hours[startHour]) {
        // console.log('no booking at ', startHour);
        gradient.push(`green ${fromPercent}%, green ${toPercent}%`);
      } else if(hours[startHour].length === 1) {
        // console.log('1 table at', startHour);
        gradient.push(`green ${fromPercent}%, green ${toPercent}%`);
      } else if (hours[startHour].length === 2) {
        // console.log('2 tables at ', startHour);
        gradient.push(`yellow ${fromPercent}%, yellow ${toPercent}%`);
      } else if (hours[startHour].length === 3) {
        // console.log('3 tables at ', startHour);
        gradient.push(`red ${fromPercent}%, red ${toPercent}%`);
      }
    }
    gradient = gradient.join();
    this.dom.slider.style.background = `linear-gradient(to right, ${gradient})`;
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
    for(
      let hourBlock = startHour;
      hourBlock < startHour + duration;
      hourBlock += 0.5) {
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
  selectTable() {
    for(let table of this.dom.tables) {
      table.addEventListener('click', (e) => {
        const clickedTable = e.target;
        this.dom.tables.forEach(table => table.classList.remove('selected'));
        if (!clickedTable.classList.contains('booked')) {
          clickedTable.classList.add('selected');
          this.table = clickedTable;
        }
      });
    }
    this.isTimeUpdated();
    this.isBookingSubmitted();
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
  sendBooking() {
    const url = settings.db.url + '/' + settings.db.booking;

    /* get data from booking form and serialize for payload */
    const date = this.dom.datePicker.input.value;
    const hour = utils.numberToHour(this.hour);
    const address = this.dom.address.value;
    const phone = this.dom.phone.value;
    const tableId = parseInt(this.table.getAttribute(settings.booking.tableIdAttribute));
    const people = this.peopleAmount.value;
    const duration = this.hoursAmount.value;

    const starters = [];

    this.dom.starters.forEach(starter =>
      starter.checked ? starters.push(starter.value) : null);

    const payload = {
      date: date,
      hour: hour,
      address: address,
      phone: phone,
      table: tableId,
      repeat: false,
      ppl: people,
      duration: duration,
      starters: starters,
    };

    /* provide options for fetch */
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    /* send booking form to fake API */
    fetch(url, options)
      .then(res => res.json()
        .then(res => console.log('booking was sent to endpoint', res)));

    this.updateAfterBooking(
      this.dom.datePicker.input.value,
      utils.numberToHour(this.hour),
      this.hoursAmount.value,
      parseInt(this.table.getAttribute(settings.booking.tableIdAttribute)));
  }
  isBookingSubmitted() {
    this.dom.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.sendBooking();
    });
  }
  isComplete() {
    /* TODO: add additional validation to deny sending booking if incomplete
    use it in isBookingSubmitted before sendBooking */
  }
  updateAfterBooking(date, hour, duration, table) {
    /* mark new booked table as booked on restaurant map */
    this.makeBooked(date, hour, duration, table);
    this.updateDOM();
    this.resetSelectedTables();
    /* update range slider to show effect of latest booking */
    this.bookHourPicker();
  }
}

export default Booking;
