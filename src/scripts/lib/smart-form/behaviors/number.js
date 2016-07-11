import Behavior from '../behavior';

export default class NumberBehavior extends Behavior {
    /**
     * @override
     * @param {number} [opts.min]
     * @param {number} [opts.max]
     */
    constructor(element, opts) {
        super(element, opts);

        const min = +opts.min;
        const max = +opts.max;

        this._min = !isNaN(min) ? min : -Infinity;
        this._max = !isNaN(max) ? max : Infinity;

        if (this._min >= this._max) {
            this.emit('error', 'min >= max');
        }
    }

    /**
     * @override
     */
    isFull() {
        const hasMin = isFinite(this._min);
        const hasMax = isFinite(this._max);
    
        if (!hasMin && !hasMax) {
            return false;
        }
    
        const maxLen = Math.max(
            hasMin ? this._min.toString().length : 0,
            hasMax ? this._max.toString().length : 0);
    
        return this.value().length === maxLen;
    }

    /**
     * @override
     */
    isValid() {
        return super.isValid() && this._validate(this.value());
    }

    /**
     * @override
     */
    parse(value) {
        return +value;
    }

    /**
     * @override
     */
    format(value) {
        return value.trim();
    }

    /**
     * @override
     */
    shouldUpdate(newValue, oldValue) {
        if (!super.shouldUpdate(newValue, oldValue)) {
            return false;
        }

        // it can display no_value, so empty string - is ok
        if (newValue === '' || newValue === '-' && this._min < 0) {
            return true;
        }

        return this._validate(newValue);
    }

    /**
     * @private
     * @param {string} strValue
     * @returns {boolean}
     */
    _validate(strValue) {
        var value = this.parse(strValue);

        // TODO: .isFinite() is necessary here ???
        return !isNaN(value) &&
                isFinite(value) &&
                value >= this._min &&
                value <= this._max;
    }
}
