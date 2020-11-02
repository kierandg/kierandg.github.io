/*
 Copyright (c) 2007 John Dyer (http://johndyer.name)
 MIT style license
 */

if (!window.kd) {
    kd = {};
}

kd.Color = function (input) {
    const color = {
        r: 0,
        g: 0,
        b: 0,

        h: 0,
        s: 0,
        v: 0,

        hex: '',

        setRgb: function (r, g, b) {
            this.r = r;
            this.g = g;
            this.b = b;

            const hsv = kd.Color.rgbToHsv(this);
            this.h = hsv.h;
            this.s = hsv.s;
            this.v = hsv.v;

            this.hex = kd.Color.rgbToHex(this);
        },

        setHsv: function (h, s, v) {
            this.h = h;
            this.s = s;
            this.v = v;

            const rgb = kd.Color.hsvToRgb(this);
            this.r = rgb.r;
            this.g = rgb.g;
            this.b = rgb.b;

            this.hex = kd.Color.rgbToHex(rgb);
        },

        setHex: function (hex) {
            this.hex = hex;

            const rgb = kd.Color.hexToRgb(this.hex);
            this.r = rgb.r;
            this.g = rgb.g;
            this.b = rgb.b;

            const hsv = kd.Color.rgbToHsv(rgb);
            this.h = hsv.h;
            this.s = hsv.s;
            this.v = hsv.v;
        }
    };

    if (input) {
        if (input.hex)
            color.setHex(input.hex);
        else if (input.r)
            color.setRgb(input.r, input.g, input.b);
        else if (input.h)
            color.setHsv(input.h, input.s, input.v);
    }

    return color;
};

kd.Color.hexToRgb = function (hex) {
    hex = kd.Color.validateHex(hex);

    let r = '00', g = '00', b = '00';

    /*
     if (hex.length == 3) {
     r = hex.substring(0,1);
     g = hex.substring(1,2);
     b = hex.substring(2,3);
     } else if (hex.length == 6) {
     r = hex.substring(0,2);
     g = hex.substring(2,4);
     b = hex.substring(4,6);
     */
    if (hex.length === 6) {
        r = hex.substring(0, 2);
        g = hex.substring(2, 4);
        b = hex.substring(4, 6);
    } else {
        if (hex.length > 4) {
            r = hex.substring(0, hex.length - 4);
            hex = hex.substring(hex.length - 4);
        }

        if (hex.length > 2) {
            g = hex.substring(0, hex.length - 2);
            hex = hex.substring(hex.length - 2);
        }

        if (hex.length > 0) {
            b = hex.substring(0, hex.length);
        }
    }

    return {r: this.hexToInt(r), g: this.hexToInt(g), b: this.hexToInt(b)};
};

kd.Color.validateHex = function (hex) {
    hex = String(hex).toUpperCase();
    hex = hex.replace(/[^A-F0-9]/g, '0');
    if (hex.length > 6) {
        hex = hex.substring(0, 6);
    }

    return hex;
};

kd.Color.webSafeDec = function (dec) {
    dec = Math.round(dec / 51);
    dec *= 51;
    return dec;
};

kd.Color.hexToWebSafe = function (hex) {
    let r, g, b;

    if (hex.length === 3) {
        r = hex.substring(0, 1);
        g = hex.substring(1, 1);
        b = hex.substring(2, 1);
    } else {
        r = hex.substring(0, 2);
        g = hex.substring(2, 4);
        b = hex.substring(4, 6);
    }
    return intToHex(kd.Color.webSafeDec(kd.Color.hexToInt(r))) +
        kd.Color.intToHex(kd.Color.webSafeDec(kd.Color.hexToInt(g))) +
        kd.Color.intToHex(kd.Color.webSafeDec(kd.Color.hexToInt(b)));
};

kd.Color.rgbToWebSafe = function (rgb) {
    return {r: kd.Color.webSafeDec(rgb.r), g: kd.Color.webSafeDec(rgb.g), b: kd.Color.webSafeDec(rgb.b)};
};

kd.Color.rgbToHex = function (rgb) {
    return kd.Color.intToHex(rgb.r) + kd.Color.intToHex(rgb.g) + kd.Color.intToHex(rgb.b);
};

kd.Color.intToHex = function (dec) {
    let result = (parseInt(dec).toString(16));
    if (result.length === 1) {
        result = ("0" + result);
    }

    return result.toUpperCase();
};

kd.Color.hexToInt = function (hex) {
    return (parseInt(hex, 16));
};

kd.Color.rgbToHsv = function (rgb) {

    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;

    let hsv = {h: 0, s: 0, v: 0};

    let min = 0;
    let max = 0;

    if (r >= g && r >= b) {
        max = r;
        min = (g > b) ? b : g;
    } else if (g >= b && g >= r) {
        max = g;
        min = (r > b) ? b : r;
    } else {
        max = b;
        min = (g > r) ? r : g;
    }

    hsv.v = max;
    hsv.s = (max) ? ((max - min) / max) : 0;

    if (!hsv.s) {
        hsv.h = 0;
    } else {
        const delta = max - min;
        if (r === max) {
            hsv.h = (g - b) / delta;
        } else if (g === max) {
            hsv.h = 2 + (b - r) / delta;
        } else {
            hsv.h = 4 + (r - g) / delta;
        }

        hsv.h = parseInt(hsv.h * 60);
        if (hsv.h < 0) {
            hsv.h += 360;
        }
    }

    hsv.s = parseInt(hsv.s * 100);
    hsv.v = parseInt(hsv.v * 100);

    return hsv;
};

kd.Color.hsvToRgb = function (hsv) {

    let rgb = {r: 0, g: 0, b: 0};

    let h = hsv.h;
    let s = hsv.s;
    let v = hsv.v;

    if (s === 0) {
        if (v === 0) {
            rgb.r = rgb.g = rgb.b = 0;
        } else {
            rgb.r = rgb.g = rgb.b = parseInt(v * 255 / 100);
        }
    } else {
        if (h === 360) {
            h = 0;
        }
        h /= 60;

        // 100 scale
        s = s / 100;
        v = v / 100;

        const i = parseInt(h);
        const f = h - i;
        const p = v * (1 - s);
        const q = v * (1 - (s * f));
        const t = v * (1 - (s * (1 - f)));
        switch (i) {
            case 0:
                rgb.r = v;
                rgb.g = t;
                rgb.b = p;
                break;
            case 1:
                rgb.r = q;
                rgb.g = v;
                rgb.b = p;
                break;
            case 2:
                rgb.r = p;
                rgb.g = v;
                rgb.b = t;
                break;
            case 3:
                rgb.r = p;
                rgb.g = q;
                rgb.b = v;
                break;
            case 4:
                rgb.r = t;
                rgb.g = p;
                rgb.b = v;
                break;
            case 5:
                rgb.r = v;
                rgb.g = p;
                rgb.b = q;
                break;
        }

        rgb.r = parseInt(rgb.r * 255);
        rgb.g = parseInt(rgb.g * 255);
        rgb.b = parseInt(rgb.b * 255);
    }

    return rgb;
};

kd.ColorValuePicker = Class.create();
kd.ColorValuePicker.prototype = {
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

        this.color = new kd.Color();

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

        const rgb = kd.Color.hexToRgb(hex);
        // Re-set
        e.target.value = kd.Color.rgbToHex(rgb);

        const boxes = $('diff-results').select('.result');
        const id = Number(e.target.id.substr('picker-diff-hex-'.length));
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

        const rgb = kd.Color.hexToRgb(hex);
        // Re-set
        e.target.value = kd.Color.rgbToHex(rgb);
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
