const testElement = document.createElement('input');

let domIsReady = false;

/**
 * Executes fn after current flow.
 *
 * @param {Function} fn
 */
export function async(fn) {
	setTimeout(fn, 0);
}

/**
 * Executes callback after document is loaded.
 *
 * @param {Function} callback
 */
export function onDomReady(callback) {
	if (domIsReady) {
		async(callback);
		return;
	}

	document.addEventListener('DOMContentLoaded', callback);
}

/**
 * Checks, if attribute is exists on element.
 *
 * @param {HTMLElement} element
 * @param {string} attribute
 * @returns {boolean}
 */
export function hasAttribute(element, attribute) {
	return element.getAttribute(attribute) !== null;
}

/**
 * Checks that given object is an any HTMLElement
 * or has particular tagName (if second argument is provided).
 * 
 * @param {HTMLElement} obj
 * @param {string} [tagName] Case is ignored.
 * @returns {boolean}
 */
export function isTag(obj, tagName) {
	if (!obj || !obj.nodeName) {
		return false;
	}

	if (tagName) {
		return obj.nodeName.toLowerCase() === tagName.toLowerCase();
	}

	return true;
}

/**
 * Adds a class to an element (one class name, no spaces).
 *
 * @param {HTMLElement} element
 * @param {string} className
 */
export const addClass = (function() {
	return testElement.classList
		? (element, className) => element.classList.add(className)
		: (element, className) => {
			element.className = element.className
				.split(/\s+/)
				.concat(className)
				.join(' ');
		};
}());

/**
 * Removes a class of an element (one class name, no spaces).
 * 
 * @param {HTMLElement} element
 * @param {string} className
 */
export const removeClass = (function() {
	return testElement.classList
		? (element, className) => element.classList.remove(className)
		: (element, className) => {
			element.className = element.className
				.split(/\s+/)
				.filter(c => c !== className)
				.join(' ');
		};
}());

/**
 * Toggles a class of an element (one class name, no spaces).
 * 
 * @param {HTMLElement} element
 * @param {string} className
 * @param {boolean} enable
 */
export function toggleClass(element, className, enable) {
	if (enable) {
		addClass(element, className);
	} else {
		removeClass(element, className);
	}
}

/**
 * Move caret to given 0-based index position.
 *
 * @param {HTMLInputElement} element
 * @param {number} index
 */
export const setCaret = (function() {
    return !testElement.createTextRange
        ? (element, index) => {
            element.setSelectionRange(index, index);
            element.focus();
        }
        : (element, index) => {
            const range = element.createTextRange();
            range.move('character', index);
            range.select();
            element.focus();
        };
}());

/**
 * Get caret 0-based index position.
 *
 * @param {HTMLInputElement} element
 * @returns {number|null}
 */
export const getCaret = (function() {
    return !document.selection
        ? element => element.selectionStart
        : element => {
            const range = document.selection.createRange();
            range.moveStart('character', -element.value.length);
            return range.text.length;
        };
}());

/**
 * Wraps a targetElement within wrapElement.
 * 
 * @param {HTMLElement} targetElement
 * @param {HTMLElement} wrapElement
 * @return {void}
 */
export function wrap(targetElement, wrapElement) {
	var container = targetElement.parentNode;

	container.replaceChild(wrapElement, targetElement);

	wrapElement.appendChild(targetElement);
}
