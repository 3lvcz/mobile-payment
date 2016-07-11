export default class Dictionary {
    /**
     * @constructor
     * @param {string} key
     * @param {Object[]} [items]
     */
    constructor(key, items) {
        this._key = key;
        this._items = [];
        this._hash = {};

        (items || []).forEach(this.add.bind(this));
    }

    /**
     * @param {Object} item
     */
    add(item) {
        const key = this._key;
        const itemKey = item[key];

        if (this._hash[itemKey]) {
            this._items = this._items.map(it => {
                return it[key] === itemKey ? item : it;
            });
        } else {
            this._items.push(item);
        }

        this._hash[itemKey] = item;
    }

    /**
     * @param {string} key
     * @returns {*|null}
     */
    get(key) {
        return this._hash[key] || null;
    }

    /**
     * @param {Object} item
     */
    remove(item) {
        const key = this._key;
        const itemKey = item[key];

        this._items = this._items.filter(it => it[key] !== itemKey);

        delete this._hash[itemKey];
    }

    /**
     * @param {Function} fn
     * @returns {boolean}
     */
    every(fn) {
        return this._items.every(fn);
    }

    /**
     * @param {Function} fn
     * @param {*} [thisArg]
     */
    forEach(fn, thisArg) {
        this._items.forEach(fn, thisArg);
    }

    /**
     * @param {Function} fn
     * @param {*} [thisArg]
     * @returns {*}
     */
    find(fn, thisArg) {
        return this._items.filter(fn, thisArg)[0];
    }
}
