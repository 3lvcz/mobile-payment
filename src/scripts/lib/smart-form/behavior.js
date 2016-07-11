import Emitter from '../emitter';
import * as util from '../util';
import {BACKSPACE, DELETE} from '../keys';
import {isIE9} from '../ua';
import SmartForm from './';

const testElement = document.createElement('input');

let focusQueue = [];

export default class Behavior extends Emitter {
    /**
     * @constructor
     * @param {HTMLInputElement} element
     * @param {Object} opts
     * @param {string} opts.type
     * @param {string} [opts.shareWith]
     */
    constructor(element, opts) {
        super();

        this._element = element;
        this._lastValue = element.value;
        this._shareWith = opts.shareWith || null;
        this._placeholder = null;

        this._bindEvents();
        this._emulatePlaceholder();
    }

    // ######
    // PUBLIC
    // ######

    /**
     * Input element name.
     *
     * @public
     * @returns {string}
     */
    get name() {
        return this._element.name;
    }

    /**
     * Input element attribute value.
     *
     * @public
     * @param {string} attribute
     * @returns {string|null}
     */
    getAttribute(attribute) {
        return this._element.getAttribute(attribute);
    }

    /**
     * Whether input element has a given attribute.
     *
     * @public
     * @param {string} attribute
     * @returns {boolean}
     */
    hasAttribute(attribute) {
        return util.hasAttribute(this._element, attribute);
    }

    /**
     * Removes given attribute from input element.
     *
     * @public
     * @param {string} attribute
     */
    removeAttribute(attribute) {
        this._element.removeAttribute(attribute);
    }

    /**
     * Wraps input element with given element.
     *
     * @public
     * @param {HTMLElement} element
     */
    wrap(element) {
        util.wrap(this._element, element);
    }
    
    /**
     * Focusing input element.
     *
     * @public
     */
    focus() {
        if (!isIE9) {
            this._element.focus();
            return;
        }

        // IE9 has problems with fast switching focuses

        focusQueue.push(this);

        util.async(() => {
            if (!focusQueue.length) {
                return;
            }

            const last = focusQueue.pop();

            focusQueue = [];

            last._element.focus();
        });
    }

    /**
     * Public method to extract input value to outside environment.
     * (NumberBehavior should return number, not a string,
     * DateBehavior - Date etc.)
     * Should not be overrided! Override #parse method.
     *
     * @public
     * @returns {*}
     */
    read() {
        return this.parse(this._element.value);
    }

    /**
     * Public method to write value from outside to the input "right-way".
     * Should not be overrided! Override #stringify method.
     *
     * @public
     * @param {*} value
     */
    write(value) {
        this._element.value = this.stringify(value);

        this._onChange();
    }

    /**
     * Prepends given string to the current principal value.
     *
     * @param {string} str
     */
    prepend(str) {
        this._element.value = str + this.principalValue();

        this._onChange();
    }

    /**
     * Removes given amount of characters from the
     * right side of the current principal value.
     *
     * @param {number} amount
     */
    truncateEnd(amount) {
        this._element.value = this.principalValue().slice(0, -amount);

        this._onChange();
    }

    /**
     * Whether input element has no value.
     *
     * @public
     * @returns {boolean}
     */
    isEmpty() {
        return !this._element.value;
    }

    /**
     * Whether input element value is full
     * (it's not always equivalent to #isValid)
     *
     * @public
     * @returns {boolean}
     */
    isFull() {
        return false;
    }

    /**
     * Whether input element value is valid.
     *
     * @public
     * @returns {boolean}
     */
    isValid() {
        return !this.hasAttribute('required') || !!this._element.value;
    }

    /**
     * Field name, with which current field shares its value.
     *
     * @public
     * @returns {string|null}
     */
    get sharedWith() {
        return this._shareWith;
    }

    // #########
    // PROTECTED
    // #########

    /**
     * Original element value string.
     *
     * @protected
     * @returns {string}
     */
    value() {
        return this._element.value;
    }

    /**
     * Returns significant/principal part of a string: basically,
     * a part, that user typed, for example, when behavior uses a
     * special output format (mask for example), and output is differs
     * from what user typing, in this case, #principalValue should be
     * overrided (see MaskedBehavior)
     *
     * @protected
     * @returns {string}
     */
    principalValue() {
        return this.value();
    }

    /**
     * Sets the caret to given 0-based index position.
     *
     * @protected
     * @param {number} index
     */
    setCaret(index) {
        util.setCaret(this._element, index);
    }

    /**
     * Caret current position.
     *
     * @protected
     * @returns {number}
     */
    getCaret() {
        return util.getCaret(this._element);
    }

    /**
     * Parsing string to "Behavior-value-type".
     * (this method is for #read and should return
     * string/number/date/etc. - depends on concrete behavior)
     *
     * @protected
     * @param {string} value
     * @returns {*}
     */
    parse(value) {
        return value;
    }

    /**
     * Stringifies "Behavior-value-type" value to a string.
     * (this method takes string/number/date/etc. - depends on
     * concrete behavior and should return a string, with which
     * #write() would operate)
     *
     * @protected
     * @param {*} value
     * @returns {string}
     */
    stringify(value) {
        return value + '';
    }

    /**
     * If behavior uses a special output format (mask for example),
     * this method should be overrided. String 'value' it takes is a
     * result of user typing (or #write call). It should also return a
     * string, which will be written to the input followed by 'change' event.
     * (see #_onChange)
     *
     * @protected
     * @param {string} value
     * @returns {string}
     */
    format(value) {
        return value;
    }

    /**
     * If behavior has `shareWith` field, this method is called to define,
     * which part of the `value` this field should display on its own input,
     * and which part it should give to its 'shareWith'-friend.
     * (see MaskedBehavior)
     *
     * @protected
     * @param {string} value
     * @returns {{share: string, value: string}}
     */
    share(value) {
        return {
            share: '',
            value: value
        };
    }

    /**
     *
     * 
     * @protected
     * @param {string} value
     * @returns {boolean}
     */
    canShare(value) {
        return false;
    }

    /**
     * Whether input element should be updated with given 'newValue'.
     *
     * @protected
     * @param {string} newValue
     * @param {string} oldValue
     * @returns {boolean}
     */
    shouldUpdate(newValue, oldValue) {
        return true;
    }

    /**
     * Binding for each event mentioned in array #customEvents returns.
     *
     * @protected
     * @param {Event} evt
     */
    onCustomEvent(evt) { /*...*/ }

    /**
     * Additional events the behavior must handle.
     *
     * @protected
     * @returns {string[]}
     */
    customEvents() {
        return [];
    }

    /**
     * Show/hide emulated placeholder (if exists).
     *
     * @protected
     * @param {boolean} show
     */
    showPlaceholder(show) {
        show = show === true;

        if (this._placeholder) {
            util.toggleClass(this._placeholder, 'smart-form__field-placeholder--hidden', !show);
        }
    }

    // #######
    // PRIVATE
    // #######

    /**
     * Called after input element updates its value.
     *
     * @private
     * @params {KeyboardEvent|undefined} [evt]
     */
    _onChange() {
        const newValue = this._element.value;
        const oldValue = this._lastValue;
        
        if (this._shareWith && this.canShare(newValue)) {
            const {share, value} = this.share(newValue);
            const formatted = this.format(value);

            this._element.value = formatted;
            this._lastValue = formatted;
            
            this.emit('change', formatted);

            if (this.isEmpty()) {
                this.emit('empty');

            } else if (this.isFull()) {
                this.emit('full');
            }

            this.emit('shared:prepend', share);
            
            return;
        }
        
        if (this.shouldUpdate(newValue, oldValue)) {
            const formatted = this.format(newValue);

            this._element.value = formatted;
            this._lastValue = formatted;

            this.emit('change', formatted);

            if (this.isEmpty()) {
                this.emit('empty');

            } else if (this.isFull()) {
                this.emit('full');
            }

            return;
        }

        this._element.value = oldValue;

        this.emit('invalid', newValue);

        if (this.isEmpty()) {
            this.emit('empty');

        } else if (this.isFull()) {
            this.emit('full');
        }
    }

    /**
     * @private
     */
    _bindEvents() {
        this._element.addEventListener('focus', () => this.emit('focus'));
        this._element.addEventListener('blur', () => this.emit('blur'));

        this._element.addEventListener('input', this._onChange.bind(this));

        // IE9 does not emit 'input' event, if user
        // press Backspace or Delete, but emit 'keyup'
        if (isIE9) {
            this._element.addEventListener('keyup', evt => {
                if (evt.keyCode === BACKSPACE || evt.keyCode === DELETE) {
                    this._onChange();
                }
            });
        }

        this._element.addEventListener('keydown', evt => {
            if (evt.keyCode === BACKSPACE && this.isEmpty()) {
                evt.preventDefault();

                this.emit('empty');

                // ask form to switch to the 'sharer', if exists,
                // and remove its last symbol
                this.emit('sharer:truncate', 1);
            }
        });

        // if behavior requires to handle other events
        this.customEvents().forEach(event =>
            this._element.addEventListener(event, this.onCustomEvent.bind(this)));
    }

    /**
     * @private
     */
    _emulatePlaceholder() {
        const hasNativeSupport = 'placeholder' in testElement;

        if (hasNativeSupport && !SmartForm.FORCE_EMULATE_PLACEHOLDERS) {
            return;
        }

        if (!this.hasAttribute('placeholder')) {
            return;
        }

        // ##################
        // INSERT PLACEHOLDER
        // ##################

        const wrap = document.createElement('div');
        wrap.className = 'smart-form__field-wrap';

        const placeholder = document.createElement('span');
        placeholder.className = 'smart-form__field-placeholder';
        placeholder.textContent = this.getAttribute('placeholder');

        this.wrap(wrap);
        wrap.appendChild(placeholder);

        // #################################
        // CONTROL OF PLACEHOLDER VISIBILITY
        // AND EVENT DELEGATION
        // #################################

        placeholder.addEventListener('click', this.focus.bind(this));

        this._placeholder = placeholder;

        this.showPlaceholder(this.isEmpty());

        this.on('change', () => this.showPlaceholder(this.isEmpty()));

        this.on('blur', () => this.showPlaceholder(this.isEmpty()));

        if (SmartForm.FORCE_EMULATE_PLACEHOLDERS) {
            this.removeAttribute('placeholder');
        }
    }
}
