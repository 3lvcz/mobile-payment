/**
 * Simple pub/sub implementation.
 */
export default class Emitter {
	/**
	 * @constructor
	 */
	constructor() {
		this._listeners = {};
	}

    /**
     * @param {string} event
     * @param {Function} handler
     * @returns {Emitter}
     */
	on(event, handler) {
		if (!this._listeners[event]) {
			this._listeners[event] = [];
		}

		this._listeners[event].push(handler);

		return this;
	}

    /**
     * @param {string} event
     * @param {Function} handler
     * @returns {Emitter}
     */
	off(event, handler) {
		if (this._listeners[event]) {
			this._listeners[event] = this._listeners[event]
				.filter(listener => listener !== handler);
		}

		return this;
	}

    /**
     * @param {string} event
     * @param {Function} handler
     * @returns {Emitter}
     */
	once(event, handler) {
		var emitter = this;

		this.on(event, function onceHandler(...data) {
			emitter.off(event, onceHandler);
			handler.apply(emitter, data);
		});

		return this;
	}

    /**
     * @param {string} event
     * @param {...*} data
     * @returns {Emitter}
     */
	emit(event, ...data) {
		var emitter = this;

		if (this._listeners[event]) {
			this._listeners[event]
				.forEach(listener => listener.apply(emitter, data));
		}

		return this;
	}
}
