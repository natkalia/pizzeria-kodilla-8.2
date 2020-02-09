class BaseWidget {
  constructor(wrapperElement, initialValue) {
    this.dom = {};
    this.dom.wrapper = wrapperElement;

    /* problem with using setter due to order of methods
    we must assume that this value is correct
    and assign it to private property directly */
    this._correctValue = initialValue;
  }
  set value(value) {
    /* normalize new value to integer */
    const newValue = this.parseValue(value);

    /* check if amount in input from user is a new value
    and if in min/max range
    if yes then change value and input value
    if no leave old value */
    const condition =
      (newValue !== this.getValue) &&
      this.isValid(newValue);

    if (condition) {
      this._correctValue = newValue;
      this.announce();
    }
    this.renderValue();
  }
  get value() {
    return this._correctValue;
  }
  setValue(value) {
    /* redirect to setter to make sure it is used
    even if code still uses .getValue instead of .value */
    this.value = value;
  }
  getValue() {
    /* redirect to getter to make sure it is used
    even if code still uses .getValue instead of .value */
    return this.value;
  }
  parseValue(value) {
    return parseInt(value);
  }
  isValid(value) {
    return !isNaN(value);
  }
  renderValue() {
    this.dom.wrapper.innerHTML = this.value;
  }
  announce() {
    const event = new CustomEvent('updated', {
      bubbles: true
    });
    this.dom.wrapper.dispatchEvent(event);
  }
}

export default BaseWidget;
