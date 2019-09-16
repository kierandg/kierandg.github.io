/*
 Copyright (c) 2007 John Dyer (http://johndyer.name)
 MIT style license
 */

if (!window.Refresh) {
    Refresh = {};
}

if (!Refresh.Web) {
    Refresh.Web = {};
}

Refresh.Web.ColorValuePicker = Class.create();
Refresh.Web.ColorValuePicker.prototype = {
    initialize: function (id) {

        this.id = id;
        this.onValuesChanged = null;

        this._hueInput = $(this.id + '-hue');
        this._valueInput = $(this.id + '-brightness');
        this._saturationInput = $(this.id + '-saturation');
        this._redInput = $(this.id + '-red');
        this._greenInput = $(this.id + '-green');
        this._blueInput = $(this.id + '-blue');
        this._hexInput = $(this.id + '-hex');

        this._diffHexInput1 = $(this.id + '-diff-hex-1');
        this._diffHexInput2 = $(this.id + '-diff-hex-2');
        this._diffHexInput3 = $(this.id + '-diff-hex-3');
        this._diffHexInput4 = $(this.id + '-diff-hex-4');

        // Events
        this.hsvKeyUpEventListener = this._onHsvKeyUp.bindAsEventListener(this);
        this._hsvBlurEventListener = this._onHsvBlur.bindAsEventListener(this);

        this._rgbKeyUpEventListener = this._onRgbKeyUp.bindAsEventListener(this);
        this._rgbBlurEventListener = this._onRgbBlur.bindAsEventListener(this);

        this._hexKeyUpEventListener = this._onHexKeyUp.bindAsEventListener(this);
        this._hexBlurEventListener = this._onHexBlur.bindAsEventListener(this);

        this._diffHexBlurEventListener = this._onDiffHexBlur.bindAsEventListener(this);

        // HSB
        Event.observe(this._hueInput, 'keyup', this.hsvKeyUpEventListener);
        Event.observe(this._valueInput, 'keyup', this.hsvKeyUpEventListener);
        Event.observe(this._saturationInput, 'keyup', this.hsvKeyUpEventListener);
        Event.observe(this._hueInput, 'blur', this._hsvBlurEventListener);
        Event.observe(this._valueInput, 'blur', this._hsvBlurEventListener);
        Event.observe(this._saturationInput, 'blur', this._hsvBlurEventListener);

        // RGB
        Event.observe(this._redInput, 'keyup', this._rgbKeyUpEventListener);
        Event.observe(this._greenInput, 'keyup', this._rgbKeyUpEventListener);
        Event.observe(this._blueInput, 'keyup', this._rgbKeyUpEventListener);
        Event.observe(this._redInput, 'blur', this._rgbBlurEventListener);
        Event.observe(this._greenInput, 'blur', this._rgbBlurEventListener);
        Event.observe(this._blueInput, 'blur', this._rgbBlurEventListener);

        // Hexa
        Event.observe(this._hexInput, 'keyup', this._hexKeyUpEventListener);
        Event.observe(this._hexInput, 'blur', this._hexBlurEventListener);

        // Diff hex
        Event.observe(this._diffHexInput1, 'blur', this._diffHexBlurEventListener);
        Event.observe(this._diffHexInput2, 'blur', this._diffHexBlurEventListener);
        Event.observe(this._diffHexInput3, 'blur', this._diffHexBlurEventListener);
        Event.observe(this._diffHexInput4, 'blur', this._diffHexBlurEventListener);

        this.color = new Refresh.Web.Color();

        // get an initial value
        if (this._hexInput.value !== '') {
            this.color.setHex(this._hexInput.value);
        }

        // set the others based on initial value
        this._hexInput.value = this.color.hex;

        this._redInput.value = this.color.r;
        this._greenInput.value = this.color.g;
        this._blueInput.value = this.color.b;

        this._hueInput.value = this.color.h;
        this._saturationInput.value = this.color.s;
        this._valueInput.value = this.color.v;

    },
    _onHsvKeyUp: function (e) {
        if (e.target.value === '') {
            return;
        }

        this.validateHsv(e);
        this.setValuesFromHsv();
        if (this.onValuesChanged) {
            this.onValuesChanged(this);
        }
    },
    _onRgbKeyUp: function (e) {
        if (e.target.value === '') {
            return;
        }

        this.validateRgb(e);
        this.setValuesFromRgb();
        if (this.onValuesChanged) {
            this.onValuesChanged(this);
        }
    },
    _onHexKeyUp: function (e) {
        if (e.target.value === '') {
            return;
        }

        this.validateHex(e);
        this.setValuesFromHex();
        if (this.onValuesChanged) {
            this.onValuesChanged(this);
        }
    },
    _onDiffHexBlur: function (e) {
        let hex = e.target.value;
        let r = 0, g = 0, b = 0;
        if (e.target.value.length === 3) {
            r = hex.substring(0, 1);
            g = hex.substring(1, 2);
            b = hex.substring(2, 3);

            r = r + r;
            g = g + g;
            b = b + b;

            hex = r + g + b;
        }

        const rgb = Refresh.Web.ColorMethods.hexToRgb(hex);
        // Re-set
        e.target.value = Refresh.Web.ColorMethods.rgbToHex(rgb);

        const boxes = $('diff-results').select('.result');
        const id = Number(e.target.id.substr('pdt-diff-hex-'.length));
        if (isNaN(id)) {
            return;
        }

        const box = boxes[id - 1];
        box.innerHTML = '<table><tr><td>' +
            '<div class="hex">#' + hex.toUpperCase() + '</div>' +
            '<div class="rgb">(' + [rgb.r, rgb.g, rgb.b].join(', ') + ')</div>' +
            '<div title="' + '' + '"class="box" style="background-color: #' + hex.toUpperCase() + ';">&nbsp;</div>' +
            '<div class="name">' + '' + '</div>' +
            '<div class="dist">(ΔE = ' + (0 === false ? '--' : '00') + ')</div>' +
            '<div title="' + ('' ? '' : 'Undefined') + '" class="shade" style="background-color: ' +
            ('' ? '' : '#000000') + ';">&nbsp;</div>' +
            '</td></tr></table>';
        box.writeAttribute('data-hex', hex.toUpperCase());
        //box.writeAttribute('data-lab', item.lab);
        box.writeAttribute('data-rgb', [rgb.r, rgb.g, rgb.b].join(','));
    },
    _onHsvBlur: function (e) {
        if (e.target.value === '') {
            this.setValuesFromRgb();
        }
    },
    _onRgbBlur: function (e) {
        if (e.target.value === '') {
            this.setValuesFromHsv();
        }
    },
    _onHexBlur: function (e) {
        if (e.target.value === '') {
            this.setValuesFromHsv();
        }

        let hex = e.target.value;
        let r, g, b;
        if (e.target.value.length === 3) {
            r = hex.substring(0, 1);
            g = hex.substring(1, 2);
            b = hex.substring(2, 3);

            r = r + r;
            g = g + g;
            b = b + b;

            hex = r + g + b;
        }

        const rgb = Refresh.Web.ColorMethods.hexToRgb(hex);
        // Re-set
        e.target.value = Refresh.Web.ColorMethods.rgbToHex(rgb);
    },
    validateRgb: function (e) {
        if (!this._keyNeedsValidation(e)) {
            return e;
        }

        this._redInput.value = this._setValueInRange(this._redInput.value, 0, 255);
        this._greenInput.value = this._setValueInRange(this._greenInput.value, 0, 255);
        this._blueInput.value = this._setValueInRange(this._blueInput.value, 0, 255);
    },
    validateHsv: function (e) {
        if (!this._keyNeedsValidation(e)) {
            return e;
        }

        this._hueInput.value = this._setValueInRange(this._hueInput.value, 0, 359);
        this._saturationInput.value = this._setValueInRange(this._saturationInput.value, 0, 100);
        this._valueInput.value = this._setValueInRange(this._valueInput.value, 0, 100);
    },
    validateHex: function (e) {
        if (!this._keyNeedsValidation(e)) {
            return e;
        }

        let hex = String(e.target.value).toUpperCase();

        if (hex.startsWith('#')) {
            hex = hex.substring(1, 7);
        }

        hex = hex.replace(/[^A-F0-9]/g, '0');

        if (hex.length > 6) {
            hex = hex.substring(0, 6);
        }

        // Set value
        e.target.value = hex;
        return hex;
    },
    _keyNeedsValidation: function (e) {
        return !(e.keyCode === 9 || // TAB
            e.keyCode === 16 ||     // Shift
            e.keyCode === 38 ||     // Up arrow
            e.keyCode === 29 ||     // Right arrow
            e.keyCode === 40 ||     // Down arrow
            e.keyCode === 37 ||     // Left arrow
            (e.ctrlKey && (e.keyCode === 'c'.charCodeAt() || e.keyCode === 'v'.charCodeAt())));


    },
    _setValueInRange: function (value, min, max) {
        if (value === '' || isNaN(value)) {
            return min;
        }

        value = parseInt(value);
        if (value > max) {
            return max;
        }

        if (value < min) {
            return min;
        }

        return value;
    },
    setValuesFromRgb: function () {
        this.color.setRgb(this._redInput.value, this._greenInput.value, this._blueInput.value);
        this._hexInput.value = this.color.hex;
        this._hueInput.value = this.color.h;
        this._saturationInput.value = this.color.s;
        this._valueInput.value = this.color.v;
    },
    setValuesFromHsv: function () {
        this.color.setHsv(this._hueInput.value, this._saturationInput.value, this._valueInput.value);

        this._hexInput.value = this.color.hex;
        this._redInput.value = this.color.r;
        this._greenInput.value = this.color.g;
        this._blueInput.value = this.color.b;
    },
    setValuesFromHex: function () {
        this.color.setHex(this._hexInput.value);

        this._redInput.value = this.color.r;
        this._greenInput.value = this.color.g;
        this._blueInput.value = this.color.b;

        this._hueInput.value = this.color.h;
        this._saturationInput.value = this.color.s;
        this._valueInput.value = this.color.v;
    }
};
