import * as util from './lib/util';
import SmartForm from './lib/smart-form';

import MaskedBehavior from './lib/smart-form/behaviors/masked';
import NumberBehavior from './lib/smart-form/behaviors/number';

SmartForm.registerBehavior('masked', MaskedBehavior);
SmartForm.registerBehavior('number', NumberBehavior);

util.onDomReady(() => {
	const paymentForm = document.querySelector('.payment-form');

	const smartForm = new SmartForm(paymentForm, {
        phone_code: {
            type: 'masked',
            mask: 'ddd',
            shareWith: 'phone_number'
        },
        phone_number: {
            type: 'masked',
            mask: 'ddd - dd - dd'
        },
        sum: {
            type: 'number',
            min: 1,
            max: 5000
        }
	});

    const paymentSumText = document.querySelector('#sum_field_postfix');
    const submitButton = document.querySelector('#submit');

    const phoneNumber = smartForm.getField('phone_number');
    const sum = smartForm.getField('sum');

	updateSubmit();

	smartForm.on('change', updateSubmit);
	smartForm.on('change:sum', updateSumText);

	smartForm.on('full:phone_code', () => phoneNumber.focus());
	smartForm.on('full:phone_number', () => sum.focus());

    // #########
    // DEBUGGING
    // #########
    
    smartForm.on('error', err => console.error(err));
    smartForm.on('error:field', (fieldName, err) => console.error(fieldName, err));
    smartForm.on('invalid', (fieldName, value) => console.info(`${fieldName} invalid value: "${value}"`));

	// ##############
	// EVENT HANDLERS
	// ##############

	function updateSubmit() {
		submitButton.disabled = !smartForm.isValid();
	}

	function updateSumText(value) {
		if (/(^|[^1])[2-4]$/.test(value)) {
			paymentSumText.textContent = 'рубля';
		} else if (/(^|[^1])1$/.test(value)) {
			paymentSumText.textContent = 'рубль';
		} else {
			paymentSumText.textContent = 'рублей';
		}
	}
});
