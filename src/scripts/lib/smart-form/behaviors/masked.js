import Behavior from '../behavior';
import {BACKSPACE} from '../../keys';

const tokens = {
	'd': /\d/,
    'a': /[a-zа-яё]/i,
    '*': /[\da-zа-яё]/i
};

export default class MaskedBehavior extends Behavior {
    /**
     * @override
     * @param {string} opts.mask
     */
    constructor(element, opts) {
        super(element, opts);

        if (!opts.mask) {
            this.emit('error', 'Masked behavior requires "mask" option');
        }

        if (typeof opts.mask !== 'string') {
            this.emit('error', '"mask" must be a string');
        }

        this._mask = opts.mask;
    }

    isFull() {
        return this.value().length === this._mask.length;
    }

    /**
     * @override
     */
    isValid() {
        const value = this.value();
        const mlen = this._mask.length;

        if (value.length !== mlen) {
            return false;
        }

        return this._match(value, mlen);
    }

    /**
     * @override
     */
    principalValue() {
        return this._applyMask(this.value()).unmasked;
    }

    /**
     * @override
     */
    format(value) {
        return this._applyMask(value).masked;
    }

    /**
     * @override
     */
    share(value) {
        const {unused, unmasked} = this._applyMask(value);
        return {
            value: unmasked,
            share: unused
        };
    }

    /**
     * @override
     */
    canShare(value) {
        const {unused} = this._applyMask(value);

        return unused.length > 0;
    }

    /**
     * @override
     */
    shouldUpdate(newValue, oldValue) {
        const newUnmasked = this._applyMask(newValue).unmasked;
        const oldUnmasked = this._applyMask(oldValue).unmasked;

        // if user typed value itself (without mask) is changed
        return newUnmasked !== oldUnmasked;
    }

    /**
     * @override
     */
    onCustomEvent(evt) {
        const {keyCode} = evt;
        const caret = this.getCaret();

        if (keyCode === BACKSPACE && caret > 1 && !tokens[this._mask[caret - 1]]) {
            evt.preventDefault();

            const result = this._applyMask(this._element.value);

            const newValue = this._element.value = this._applyMask(
                result.unmasked.slice(0, -1)).masked;

            this._lastValue = newValue;

            this.emit('change', newValue);
        }
    }

    /**
     * @override
     */
    customEvents() {
        return ['keydown'];
    }

    /**
     * @private
     * @param {string} value
     * @param {number} length
     * @returns {boolean}
     */
    _match(value, length) {
        const mlen = this._mask.length;

        if (length > mlen) {
            length = mlen;
        }

        if (value.length !== length) {
            return false;
        }

        for (let i = 0; i < length; i++) {
            const vchar = value[i];
            const mchar = this._mask[i];
            const token = tokens[mchar];

            if (token && !token.test(vchar) || !token && vchar !== mchar) {
                return false;
            }
        }

        return true;
    }

    /**
     * @private
     * @param {string} value
     * @returns {{masked: string, unmasked: string, unused: string}}
     */
    _applyMask(value) {
        const masked = [];
        const unmasked = [];
        const unused = [];

        for (var i = 0, j = 0; i < value.length && j < this._mask.length; /* empty */) {
            const mchar = this._mask[j];
            const vchar = value[i];
            const token = tokens[mchar];

            if (!token) {
                masked.push(mchar);
                j++;
                continue;
            }

            if (token.test(vchar)) {
                unmasked.push(vchar);
                masked.push(vchar);
                j++;
            }

            i++;
        }

        while (i < value.length) {
            unused.push(value[i]);
            i++;
        }

        while (j < this._mask.length && !tokens[this._mask[j]]) {
            masked.push(this._mask[j]);
            j++;
        }

        return {
            masked: masked.join(''),
            unmasked: unmasked.join(''),
            unused: unused.join('')
        };
    }
}
