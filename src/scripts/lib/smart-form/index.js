import {isEdge} from '../ua';
import * as util from '../util';
import Emitter from '../emitter';
import Dictionary from '../dictionary';
import Behavior from './behavior';

const behaviors = {};
const testElement = document.createElement('input');

export default class SmartForm extends Emitter {
    /**
     * @constructor
     * @param {HTMLFormElement} element
     * @param {Object}          opts
     */
	constructor(element, opts) {
		super();

		if (!element) {
			this.emit('error', 'No element provided.');
			return;
		}

		if (!util.isTag(element, 'form')) {
			this.emit('error', 'Only <form> is supported.');
			return;
		}

		this._element = element;

		this._initFields(opts || {});

        this._bindEvents();

		this._emulateAutofocus();
	}

	static registerBehavior(type, ConcreteBehavior) {
		if (behaviors[type]) {
			this.emit('error', `Behavior "${type}" already defined`);
			return;
		}

		behaviors[type] = ConcreteBehavior;
	}

    /**
     * @public
     * @param {string} fieldName
     * @returns {Behavior|null}
     */
    getField(fieldName) {
        return this._fields.get(fieldName);
    }

    /**
     * @public
     * @returns {boolean}
     */
    isValid() {
        return this._fields.every(field => field.isValid());
    }

    /**
     * @private
     * @param {Object} fields
     */
	_initFields(fields) {
		this._fields = new Dictionary('name');

		Object.keys(fields).forEach(fieldName => {
            const params = fields[fieldName];

			if (!params) {
				this.emit('error', 'Invalid field options');
				return;
			}

			if (this._fields.get(fieldName)) {
				this.emit('error', `Field name "${fieldName}" already used`);
				return;
			}

			if (!params.type) {
				this.emit('error', 'Field must provide behavior type');
				return;
			}

			const element = this._element.elements[fieldName];

			if (!element) {
				this.emit('error', `No <input> with name "${fieldName}"`);
				return;
			}

			if (!util.isTag(element, 'input')) {
				this.emit('error', 'Only <input> as field is supported');
				return;
			}

            if (params.shareWith) {
                const shareWith = this._element.elements[params.shareWith];

                if (!shareWith) {
                    this.emit('error', `No share <input> with name "${params.shareWith}"`);
                }

                if (!util.isTag(shareWith, 'input')) {
                    this.emit('error', 'Only <input> as share field is supported');
                }
            }

			const ConcreteBehavior = behaviors[params.type];

			if (!ConcreteBehavior) {
				this.emit('error', `Unsupported behavior type "${params.type}"`);
				return;
			}

            const field = new ConcreteBehavior(element, params);

            field.on('error', err => {
                this.emit('error:field', field.name, err);
            });

            this._fields.add(field);
		});
	}

    /**
     * @private
     */
    _bindEvents() {
        this._fields.forEach(field => {
            const fieldName = field.name;
            
            field.on('change', () => {
                const newValue = field.read();
                
                this.emit('change:' + fieldName, newValue);
                this.emit('change', fieldName, newValue);
            });

            field.on('empty', () => {
                this.emit('empty:' + fieldName);
                this.emit('empty', fieldName);
            });

            field.on('full', () => {
                this.emit('full:' + fieldName);
                this.emit('full', fieldName);
            });

            field.on('focus', () => {
                this.emit('focus:' + fieldName);
                this.emit('focus', fieldName);
            });

            field.on('blur', () => {
                this.emit('blur:' + fieldName);
                this.emit('blur', fieldName);
            });
            
            field.on('shared:prepend', value => {
                const shareWith = this._fields.get(field.sharedWith);

                shareWith.focus();

                shareWith.prepend(value);
            });
            
            field.on('sharer:truncate', amount => {
                const sharer = this._fields.find(f => f.sharedWith === field.name);
                
                if (sharer) {
                    sharer.focus();
                    
                    sharer.truncateEnd(amount);
                }
            });
            
            field.on('invalid', value => {
                this.emit('invalid:' + fieldName, value);
                this.emit('invalid', fieldName, value);
            });
        });
    }

    /**
     * @private
     */
	_emulateAutofocus() {
		var hasNativeSupport = 'autofocus' in testElement;

		if (hasNativeSupport && !SmartForm.FORCE_EMULATE_AUTOFOCUS) {
			return;
		}

		var requireFocus = this._fields.find(field =>
			field.hasAttribute('autofocus'));

		if (requireFocus) {
			requireFocus.focus();
		}
	}
}

// MS Edge has a problem, when focusing on empty input with a placeholder,
// if text-align is not 'left' - it places cursor to the left anyway!
// open issue: https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/4468563/
SmartForm.FORCE_EMULATE_PLACEHOLDERS = isEdge;
SmartForm.FORCE_EMULATE_AUTOFOCUS = false;
