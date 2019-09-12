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

Refresh.Web.Color = function (init) {
    var color = {
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

            const hsv = Refresh.Web.ColorMethods.rgbToHsv(this);
            this.h = hsv.h;
            this.s = hsv.s;
            this.v = hsv.v;

            this.hex = Refresh.Web.ColorMethods.rgbToHex(this);
        },

        setHsv: function (h, s, v) {
            this.h = h;
            this.s = s;
            this.v = v;

            const rgb = Refresh.Web.ColorMethods.hsvToRgb(this);
            this.r = rgb.r;
            this.g = rgb.g;
            this.b = rgb.b;

            this.hex = Refresh.Web.ColorMethods.rgbToHex(rgb);
        },

        setHex: function (hex) {
            this.hex = hex;

            const rgb = Refresh.Web.ColorMethods.hexToRgb(this.hex);
            this.r = rgb.r;
            this.g = rgb.g;
            this.b = rgb.b;

            const hsv = Refresh.Web.ColorMethods.rgbToHsv(rgb);
            this.h = hsv.h;
            this.s = hsv.s;
            this.v = hsv.v;
        }
    };

    if (init) {
        if (init.hex)
            color.setHex(init.hex);
        else if (init.r)
            color.setRgb(init.r, init.g, init.b);
        else if (init.h)
            color.setHsv(init.h, init.s, init.v);
    }

    return color;
};

Refresh.Web.ColorMethods = {
    hexToRgb: function (hex) {
        hex = this.validateHex(hex);

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
    },
    validateHex: function (hex) {
        hex = new String(hex).toUpperCase();
        hex = hex.replace(/[^A-F0-9]/g, '0');
        if (hex.length > 6) {
            hex = hex.substring(0, 6);
        }

        return hex;
    },
    webSafeDec: function (dec) {
        dec = Math.round(dec / 51);
        dec *= 51;
        return dec;
    },
    hexToWebSafe: function (hex) {
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
        return intToHex(this.webSafeDec(this.hexToInt(r))) + this.intToHex(this.webSafeDec(this.hexToInt(g))) + this.intToHex(this.webSafeDec(this.hexToInt(b)));
    },
    rgbToWebSafe: function (rgb) {
        return {r: this.webSafeDec(rgb.r), g: this.webSafeDec(rgb.g), b: this.webSafeDec(rgb.b)};
    },
    rgbToHex: function (rgb) {
        return this.intToHex(rgb.r) + this.intToHex(rgb.g) + this.intToHex(rgb.b);
    },
    intToHex: function (dec) {
        let result = (parseInt(dec).toString(16));
        if (result.length === 1) {
            result = ("0" + result);
        }

        return result.toUpperCase();
    },
    hexToInt: function (hex) {
        return (parseInt(hex, 16));
    },
    rgbToHsv: function (rgb) {

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
    },
    hsvToRgb: function (hsv) {

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
    },
    rgbToLab: function (rgb) {
        let r = rgb[0] / 255,
            g = rgb[1] / 255,
            b = rgb[2] / 255,
            x, y, z;

        r = (r > 0.04045) ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
        g = (g > 0.04045) ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
        b = (b > 0.04045) ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

        x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
        y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.00000;
        z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;

        x = (x > 0.008856) ? Math.pow(x, 1 / 3) : (7.787 * x) + 16 / 116;
        y = (y > 0.008856) ? Math.pow(y, 1 / 3) : (7.787 * y) + 16 / 116;
        z = (z > 0.008856) ? Math.pow(z, 1 / 3) : (7.787 * z) + 16 / 116;

        return [(116 * y) - 16, 500 * (x - y), 200 * (y - z)]
    }
};