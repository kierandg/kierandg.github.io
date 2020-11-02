/*

 +-----------------------------------------------------------------+
 |   Created by Chirag Mehta - http://chir.ag/tech/download/ntc    |
 |-----------------------------------------------------------------|
 |               ntc js (Name that Color JavaScript)               |
 +-----------------------------------------------------------------+

 All the functions, code, lists etc. have been written specifically
 for the Name that Color JavaScript by Chirag Mehta unless otherwise
 specified.

 This script is released under the: Creative Commons License:
 Attribution 2.5 http://creativecommons.org/licenses/by/2.5/
 */

const ntc = {
    init: function () {
        ['basic', 'pantone'].forEach(function (cat) {
            const colors = COLORS[cat];
            for (let i = 0; i < colors.length; i++) {
                colors[i].hex = colors[i].hex.toUpperCase();

                const rgb = ntc.hex2rgb(colors[i].hex);
                const hsl = ntc.hex2hsl(colors[i].hex);
                const lab = ntc.rgb2lab(rgb);

                colors[i].rgb = rgb;
                colors[i].hsl = hsl;
                colors[i].lab = lab;

                // if(!colors[i].shade) {
                //     colors[i].shade = ntc.shade(colors[i].hex);
                // }
            }
        });

        ['inspirations', 'teams', 'brands'].forEach(function (cat) {
            const palettes = COLORS[cat];
            for (let i = 0; i < palettes.length; i++) {
                for (let j = 0; j < palettes[i].colors.length; j++) {
                    palettes[i].colors[j].hex = palettes[i].colors[j].hex.toUpperCase();

                    const rgb = ntc.hex2rgb(palettes[i].colors[j].hex);
                    const hsl = ntc.hex2hsl(palettes[i].colors[j].hex);
                    const lab = ntc.rgb2lab(rgb);

                    palettes[i].colors[j].rgb = rgb;
                    palettes[i].colors[j].hsl = hsl;
                    palettes[i].colors[j].lab = lab;

                    // if(!palettes[i].colors[j].shade) {
                    //     palettes[i].colors[j].shade = ntc.shade(palettes[i].colors[j].hex);
                    // }
                }

                const key = palettes[i].colors.map(x => x.hex).sort().toString().toUpperCase();
                const colors = palettes[i].colors.map(x => {
                    return {
                        hex: x.hex,
                        name: x.name,
                        hsl: x.hsl,
                        lab: x.lab.map(x => Math.round(x * 100) / 100),
                        rgb: x.rgb,
                    };
                });

                // Palette
                for (let j = 0; j < palettes[i].colors.length; j++) {
                    palettes[i].colors[j].palette = {
                        name: palettes[i].name,
                        key,
                        colors
                    };
                }
            }
        });
    },

    name: function (color, names = null) {
        return this.similar(color, names, 0)
    },

    similar: function (color, names = [], range = 0) {
        range = Number(range);
        color = color.toUpperCase();
        if (color.length < 3 || color.length > 7) {
            return {
                euclidean: {
                    count: 1,
                    items: [{
                        hex: '#000000',
                        name: 'Invalid: ' + color,
                        distance: false,   // exactly match
                    }]
                },
                de2000: {
                    count: 1,
                    items: [{
                        hex: '#000000',
                        name: 'Invalid: ' + color,
                        distance: false,   // exactly match
                    }]
                },
                found: false
            };
        }

        if (color.length % 3 === 0) {
            color = "#" + color;
        }

        if (color.length === 4) {
            color = "#" + color.substr(1, 1) + color.substr(1, 1) + color.substr(2, 1) +
                color.substr(2, 1) + color.substr(3, 1) + color.substr(3, 1);
        }

        // Convert to RGB
        const rgb = ntc.hex2rgb(color);
        // Convert to CIE-LAB
        const lab = ntc.rgb2lab(rgb);

        // Color names
        names = names || [];

        let closestE = -1, minE = -1;
        let closestDe = -1, minDe = -1;

        let rsE = [], rsDe = [];
        const MAX_COUNT = 20;

        for (let i = 0; i < names.length; i++) {
            // Exactly hex color match
            if (color === names[i].hex) {
                closestE = i;
                minE = 0;

                closestDe = i;
                minDe = 0;

                rsE.push({
                    index: i,
                    distance: 0
                });

                rsDe.push({
                    index: i,
                    distance: 0
                });

                // OK found the closest
                if (range === 0) {
                    continue;
                }
            }

            // Find closest
            //-----------------------------------------------------------------
            // Euclidean distance (RGB)
            const dfE = ntc.euclidean(rgb, names[i].rgb);
            if (minE < 0 || minE > dfE) {
                minE = dfE;
                closestE = i;
            }

            if (dfE <= range) {
                rsE.push({
                    index: i,
                    distance: dfE
                });
            }

            //-----------------------------------------------------------------
            // Delta-E 2000
            const dfDe = ntc.dE2000(lab, names[i].lab);
            if (minDe < 0 || minDe > dfDe) {
                minDe = dfDe;
                closestDe = i;
            }

            if (dfDe <= range) {
                rsDe.push({
                    index: i,
                    distance: dfDe
                });
            }

            //-----------------------------------------------------------------
            // Sort result array
            rsE.sort(function (x, y) {
                return x.distance - y.distance;
            });

            rsE = rsE.slice(0, MAX_COUNT);

            rsDe.sort(function (x, y) {
                return x.distance - y.distance;
            });

            rsDe = rsDe.slice(0, MAX_COUNT);
        }

        if (closestDe < 0) {
            closestDe = closestE;
            minDe = ntc.dE2000(lab, names[closestE].lab);
        }

        if (closestE < 0) {
            return {
                euclidean: {
                    count: 1,
                    items: [{
                        hex: '#000000',
                        name: 'Invalid: ' + color,
                        distance: false,   // exactly match
                    }]
                },
                de2000: {
                    count: 1,
                    items: [{
                        hex: '#000000',
                        name: 'Invalid: ' + color,
                        distance: false,   // exactly match
                    }]
                },
                found: false,
                range: range
            }
        }

        if (range === 0) {
            if (rsE.length === 0) {
                rsE.push({
                    index: closestE,
                    distance: minE
                });
            }

            if (rsDe.length === 0) {
                rsDe.push({
                    index: closestDe,
                    distance: minDe
                });
            }
        }

        //--------------------------------------------------------------------------------------------------------------
        // Euclidean distance method
        const euclidean = {
            count: rsE.length,
            items: []
        };

        let guard = {};
        for (let i = 0; i < rsE.length; i++) {
            const index = rsE[i].index;
            const df = rsE[i].distance;
            //const key = names[index].hex.toUpperCase();
            const key = names[index].hex + ':' +
                (names[index].palette ? names[index].palette.name : '--') + ':' + names[index].name;
            console.log(key);

            if (!(key in guard)) {
                euclidean.items.push({
                    hex: names[index].hex,
                    name: names[index].name,
                    rgb: names[index].rgb,
                    hsl: names[index].hsl,
                    lab: names[index].lab.map(x => x.toFixed(2)),
                    palette: names[index].palette,
                    shade: ntc.shade(names[index].hex),
                    distance: df,
                });

                guard[key] = true;
            }
        }

        // delta-E 2000 distance method
        const de2000 = {
            count: rsDe.length,
            items: []
        };

        // Clear guard unique
        guard = {};
        for (let i = 0; i < rsDe.length; i++) {
            const index = rsDe[i].index;
            const df = rsDe[i].distance;
            //const key = names[index].hex.toUpperCase();
            const key = names[index].hex + ':' +
                (names[index].palette ? names[index].palette.name : '--') + ':' + names[index].name;

            if (!(key in guard)) {
                de2000.items.push({
                    hex: names[index].hex,
                    name: names[index].name,
                    rgb: names[index].rgb,
                    hsl: names[index].hsl,
                    lab: names[index].lab.map(x => x.toFixed(2)),
                    palette: names[index].palette,
                    shade: ntc.shade(names[index].hex),
                    distance: df,
                });

                guard[key] = true;
            }
        }

        return {
            euclidean,
            de2000,
            found: rsE.length > 0 || rsDe.length > 0,
            range: range
        };
    },
    hex2lab: function (color) {
        return this.rgb2lab(this.hex2rgb(color));
    },
    hex2rgb: function (color) {
        const match = /^#?([a-fA-F\d]{2})([a-fA-F\d]{2})([a-fA-F\d]{2})$/.exec(color);

        if (match !== null) {
            return [
                parseInt(match[1], 16),
                parseInt(match[2], 16),
                parseInt(match[3], 16)
            ];
        }

        return [-1, -1, -1];
    },
    hex2hsl: function (color) {
        const rgb = ntc.hex2rgb(color);
        const r = rgb[0] / 255;
        const g = rgb[1] / 255;
        const b = rgb[2] / 255;

        if (r < 0) {
            return [-1, -1, -1];
        }

        let h, s;

        const min = Math.min(r, g, b);
        const max = Math.max(r, g, b);
        const l = (min + max) / 2;

        if (max === min) {
            h = s = 0; // achromatic
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

            switch (max) {
                case r:
                    h = (g - b) / d + (g < b ? 6 : 0);
                    break;

                case g:
                    h = (b - r) / d + 2;
                    break;

                case b:
                    h = (r - g) / d + 4;
                    break;
            }

            h /= 6;
        }

        return [h * 360, s * 100, l * 100];
    },
    cmyk2rgb(cmyk) {
        const r = 255 - ((Math.min(1, cmyk[0] * (1 - cmyk[3]) + cmyk[3])) * 255);
        const g = 255 - ((Math.min(1, cmyk[1] * (1 - cmyk[3]) + cmyk[3])) * 255);
        const b = 255 - ((Math.min(1, cmyk[2] * (1 - cmyk[3]) + cmyk[3])) * 255);

        return [r, g, b];
    },
    // https://www.w3schools.com/lib/w3color.js
    rgb2cmyk(rgb) {
        let c, m, y, k;
        const r = rgb[0] / 255;
        const g = rgb[1] / 255;
        const b = rgb[2] / 255;

        max = Math.max(r, g, b);
        k = 1 - max;
        if (parseInt(k) === 1) {
            c = 0;
            m = 0;
            y = 0;
        } else {
            c = (1 - r - k) / (1 - k);
            m = (1 - g - k) / (1 - k);
            y = (1 - b - k) / (1 - k);
        }

        return [c, m, y, k];
    },
    rgb2hsl: function (rgb) {
        const r = rgb[0] / 255;
        const g = rgb[1] / 255;
        const b = rgb[2] / 255;

        if (r < 0) {
            return [-1, -1, -1];
        }

        let h, s;

        const min = Math.min(r, g, b);
        const max = Math.max(r, g, b);
        const l = (min + max) / 2;

        if (max === min) {
            h = s = 0; // achromatic
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

            switch (max) {
                case r:
                    h = (g - b) / d + (g < b ? 6 : 0);
                    break;

                case g:
                    h = (b - r) / d + 2;
                    break;

                case b:
                    h = (r - g) / d + 4;
                    break;
            }

            h /= 6;
        }

        return [h * 360, s * 100, l * 100];
    },
    rgb2hsv: function (rgb) {
        const r = rgb[0] / 255;
        const g = rgb[1] / 255;
        const b = rgb[2] / 255;

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

        let v = max;
        let s = (max) ? ((max - min) / max) : 0;
        let h = 0;

        if (!s) {
            h = 0;
        } else {
            const delta = max - min;
            if (r === max) {
                h = (g - b) / delta;
            } else if (g === max) {
                h = 2 + (b - r) / delta;
            } else {
                h = 4 + (r - g) / delta;
            }

            h = h * 60;
            if (h < 0) {
                h += 360;
            }
        }

        s = s * 100;
        v = v * 100;

        return [h, s, v];
    },
    hsv2rgb: function (hsv) {
        let h = hsv[0];
        let s = hsv[1];
        let v = hsv[2];

        let r = 0;
        let g = 0;
        let b = 0;

        if (s === 0) {
            if (v === 0) {
                r = g = b = 0;
            } else {
                r = g = b = Math.trunc(v * 255 / 100);
            }
        } else {
            if (h === 360) {
                h = 0;
            }

            h /= 60;

            // 100 scale
            s = s / 100;
            v = v / 100;

            const i = Math.trunc(h);
            const f = h - i;
            const p = v * (1 - s);
            const q = v * (1 - (s * f));
            const t = v * (1 - (s * (1 - f)));

            switch (i) {
                case 0:
                    r = v;
                    g = t;
                    b = p;
                    break;

                case 1:
                    r = q;
                    g = v;
                    b = p;
                    break;

                case 2:
                    r = p;
                    g = v;
                    b = t;
                    break;

                case 3:
                    r = p;
                    g = q;
                    b = v;
                    break;

                case 4:
                    r = t;
                    g = p;
                    b = v;
                    break;

                case 5:
                    r = v;
                    g = p;
                    b = q;

                    break;
            }

            r = Math.trunc(r * 255);
            g = Math.trunc(g * 255);
            b = Math.trunc(b * 255);
        }

        return [r, g, b];
    },
    lab2rgb(lab) {
        let y = (lab[0] + 16) / 116,
            x = lab[1] / 500 + y,
            z = y - lab[2] / 200,
            r, g, b;

        x = 0.95047 * ((x * x * x > 0.008856) ? x * x * x : (x - 16 / 116) / 7.787);
        y = 1.00000 * ((y * y * y > 0.008856) ? y * y * y : (y - 16 / 116) / 7.787);
        z = 1.08883 * ((z * z * z > 0.008856) ? z * z * z : (z - 16 / 116) / 7.787);

        r = x * 3.2406 + y * -1.5372 + z * -0.4986;
        g = x * -0.9689 + y * 1.8758 + z * 0.0415;
        b = x * 0.0557 + y * -0.2040 + z * 1.0570;

        r = (r > 0.0031308) ? (1.055 * Math.pow(r, 1 / 2.4) - 0.055) : 12.92 * r;
        g = (g > 0.0031308) ? (1.055 * Math.pow(g, 1 / 2.4) - 0.055) : 12.92 * g;
        b = (b > 0.0031308) ? (1.055 * Math.pow(b, 1 / 2.4) - 0.055) : 12.92 * b;

        return [Math.max(0, Math.min(1, r)) * 255,
            Math.max(0, Math.min(1, g)) * 255,
            Math.max(0, Math.min(1, b)) * 255]
    },
    rgb2lab(rgb) {
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
    },
    deg2rad(deg) {
        return (deg * (Math.PI / 180.0));
    },
    rad2deg(rad) {
        return ((180.0 / Math.PI) * rad);
    },
    // Formula: http://www.w3.org/TR/2008/REC-WCAG20-20081211/#relativeluminancedef
    luminance(rgb) {
        const rgba = [rgb[0], rgb[1], rgb[2]].map(function (v) {
            v /= 255;
            return v <= 0.03928
                ? v / 12.92
                : Math.pow((v + 0.055) / 1.055, 2.4);
        });

        return rgba[0] * 0.2126 + rgba[1] * 0.7152 + rgba[2] * 0.0722;
    },
    // Simple Euclidean distance
    euclidean(rgb1, rgb2) {
        // Convert to HSL (normalized)
        const hsl1 = ntc.rgb2hsl(rgb1);
        const hsl2 = ntc.rgb2hsl(rgb2);

        const dRgb = Math.pow(rgb1[0] - rgb2[0], 2) +
            Math.pow(rgb1[1] - rgb2[1], 2) +
            Math.pow(rgb1[2] - rgb2[2], 2);

        // Euclidean distance (HSL after normalize)
        const dHsl = Math.pow(hsl1[0] - hsl2[0], 2) +
            Math.pow(hsl1[1] - hsl2[1], 2) +
            Math.pow(hsl1[2] - hsl2[2], 2);

        return Math.sqrt(dRgb) + Math.sqrt(dHsl) * 2;
    },
    // http://www.ece.rochester.edu/~gsharma/ciede2000/
    dE2000(lab1, lab2) {
        // RGB/CIE L*a*b*
        // 8-bit images: L ← L ∗ 255 / 100, a ← a + 128, b ← b + 128
        /*
         * "For these and all other numerical/graphical delta E00 values
         * reported in this article, we set the parametric weighting factors
         * to unity(i.e., kL = kC = kH = 1.0)." (Page 27).
         */
        const kL = 1.0, kC = 1.0, kH = 1.0;
        const deg360InRad = ntc.deg2rad(360.0);
        const deg180InRad = ntc.deg2rad(180.0);
        const pow25To7 = 6103515625.0;
        /* pow(25, 7) */

        /*
         * Step 1
         */
        /* Equation 2 */
        const C1 = Math.sqrt((lab1[1] * lab1[1]) + (lab1[2] * lab1[2]));
        const C2 = Math.sqrt((lab2[1] * lab2[1]) + (lab2[2] * lab2[2]));

        /* Equation 3 */
        const barC = (C1 + C2) / 2.0;

        /* Equation 4 */
        const G = 0.5 * (1 - Math.sqrt(Math.pow(barC, 7) / (Math.pow(barC, 7) + pow25To7)));

        /* Equation 5 */
        const a1Prime = (1.0 + G) * lab1[1];
        const a2Prime = (1.0 + G) * lab2[1];

        /* Equation 6 */
        const CPrime1 = Math.sqrt((a1Prime * a1Prime) + (lab1[2] * lab1[2]));
        const CPrime2 = Math.sqrt((a2Prime * a2Prime) + (lab2[2] * lab2[2]));

        /* Equation 7 */
        let hPrime1 = 0;
        if (lab1[2] === 0 && a1Prime === 0) {
            hPrime1 = 0.0;
        } else {
            hPrime1 = Math.atan2(lab1[2], a1Prime);
            /*
             * This must be converted to a hue angle in degrees between 0
             * and 360 by addition of 2􏰏 to negative hue angles.
             */
            if (hPrime1 < 0) {
                hPrime1 += deg360InRad;
            }
        }

        let hPrime2 = 0;
        if (lab2[2] === 0 && a2Prime === 0) {
            hPrime2 = 0.0;
        } else {
            hPrime2 = Math.atan2(lab2[2], a2Prime);
            /*
             * This must be converted to a hue angle in degrees between 0
             * and 360 by addition of 2 to negative hue angles.
             */
            if (hPrime2 < 0) {
                hPrime2 += deg360InRad;
            }
        }

        /*
         * Step 2
         */
        /* Equation 8 */
        const deltaLPrime = lab2[0] - lab1[0];

        /* Equation 9 */
        const deltaCPrime = CPrime2 - CPrime1;

        /* Equation 10 */
        let deltahPrime = 0;
        const CPrimeProduct = CPrime1 * CPrime2;

        if (CPrimeProduct === 0) {
            deltahPrime = 0;
        } else {
            /* avoid the fabs() call */
            deltahPrime = hPrime2 - hPrime1;
            if (deltahPrime < -deg180InRad) {
                deltahPrime += deg360InRad;
            } else if (deltahPrime > deg180InRad) {
                deltahPrime -= deg360InRad;
            }
        }

        /* Equation 11 */
        const deltaHPrime = 2.0 * Math.sqrt(CPrimeProduct) *
            Math.sin(deltahPrime / 2.0);

        /*
         * Step 3
         */
        /* Equation 12 */
        const barLPrime = (lab1[0] + lab2[0]) / 2.0;

        /* Equation 13 */
        const barCPrime = (CPrime1 + CPrime2) / 2.0;

        /* Equation 14 */
        let barhPrime = 0;
        const hPrimeSum = hPrime1 + hPrime2;

        if (CPrime1 * CPrime2 === 0) {
            barhPrime = hPrimeSum;
        } else {
            if (Math.abs(hPrime1 - hPrime2) <= deg180InRad) {
                barhPrime = hPrimeSum / 2.0;
            } else {
                if (hPrimeSum < deg360InRad) {
                    barhPrime = (hPrimeSum + deg360InRad) / 2.0;
                } else {
                    barhPrime = (hPrimeSum - deg360InRad) / 2.0;
                }
            }
        }

        /* Equation 15 */
        const T = 1.0 - (0.17 * Math.cos(barhPrime - ntc.deg2rad(30.0))) +
            (0.24 * Math.cos(2.0 * barhPrime)) +
            (0.32 * Math.cos((3.0 * barhPrime) + ntc.deg2rad(6.0))) -
            (0.20 * Math.cos((4.0 * barhPrime) - ntc.deg2rad(63.0)));

        /* Equation 16 */
        const deltaTheta = ntc.deg2rad(30.0) *
            Math.exp(-Math.pow((barhPrime - ntc.deg2rad(275.0)) / ntc.deg2rad(25.0), 2.0));

        /* Equation 17 */
        const RC = 2.0 * Math.sqrt(Math.pow(barCPrime, 7.0) /
            (Math.pow(barCPrime, 7.0) + pow25To7));

        /* Equation 18 */
        const SL = 1 + ((0.015 * Math.pow(barLPrime - 50.0, 2.0)) /
            Math.sqrt(20 + Math.pow(barLPrime - 50.0, 2.0)));

        /* Equation 19 */
        const SC = 1 + (0.045 * barCPrime);

        /* Equation 20 */
        const SH = 1 + (0.015 * barCPrime * T);

        /* Equation 21 */
        const RT = (-Math.sin(2.0 * deltaTheta)) * RC;

        /* Equation 22 */
        return Math.sqrt(
            Math.pow(deltaLPrime / (kL * SL), 2.0) +
            Math.pow(deltaCPrime / (kC * SC), 2.0) +
            Math.pow(deltaHPrime / (kH * SH), 2.0) +
            (RT * (deltaCPrime / (kC * SC)) * (deltaHPrime / (kH * SH))));
    },

    shade: function (clr) {
        let name = 'Undefined';
        let hex = '#000000';

        // Convert to CIE-LAB
        const lab = ntc.hex2lab(clr);

        let closestIndex = -1;
        let minDiff = -1;
        for (let i = 0; i < ntc.shades.length; i++) {
            // Exactly hex color match
            if (clr === ntc.shades[i].hex) {
                closestIndex = i;
                minDiff = 0;
                break;
            }

            // Delta-E 2000
            const slab = ntc.hex2lab(ntc.shades[i].hex);
            const diff = ntc.dE2000(lab, slab);
            if (minDiff < 0 || minDiff > diff) {
                minDiff = diff;
                closestIndex = i;
            }
        }

        if (closestIndex >= 0) {
            hex = ntc.shades[closestIndex].hex;
            name = ntc.shades[closestIndex].name;
        }

        return {
            hex,
            name
        };
    },

    shades: [
        {hex: '#FF0000', name: 'Red'},
        {hex: '#FF4500', name: 'Red‒Orange'},
        {hex: '#964B00', name: 'Brown (Orange + Red + Black)'},
        {hex: '#FF7F00', name: 'Orange'},
        {hex: '#FFBF00', name: 'Orange‒Yellow (Amber)'},
        {hex: '#FFFF00', name: 'Yellow'},
        {hex: '#7FFF00', name: 'Yellow‒Green (Chartreuse green)'},
        {hex: '#BFFF00', name: 'Lime'},
        {hex: '#008000', name: 'Green'},
        {hex: '#008080', name: 'Teal (Dark cyan)'},
        {hex: '#00FFFF', name: 'Cyan (Blue‒Green)'},
        {hex: '#007FFF', name: 'Azure (Cyan‒Blue)'},
        {hex: '#0000FF', name: 'Blue'},
        {hex: '#BF00FF', name: 'Blue‒Purple (Violet)'},
        {hex: '#800080', name: 'Purple'},
        {hex: '#FF00FF', name: 'Magenta'},
        {hex: '#FF007F', name: 'Rose (Magenta‒Pink)'},
        {hex: '#000000', name: 'Black'},
        {hex: '#808080', name: 'Grey'},
        {hex: '#FFFFFF', name: 'White'}
    ],

    // Hue, Saturation, Value (Brightness)
    // H = 0-360, S = 0-100 and V/B = 0-100
    // Black: V/B < 20 (0-100)
    // White: S < 10 (0-100) & V/B > 75 (0-100)
    hsvRanges: [
        [0, 27, 35, 28, 255, 255, 'Red'],           // Red lower 0°-28° (0-360)
        [28, 27, 35, 40, 255, 255, 'Brown'],        // Brown 28°-40° (0-360)
        [40, 27, 35, 46, 255, 255, 'Orange'],       // Orange 40°-46° (0-360)
        [46, 27, 35, 64, 255, 255, 'Yellow'],       // Yellow 46°-68° (0-360)
        [68, 27, 35, 146, 255, 255, 'Green'],       // Green 68°-146° (0-360)
        [146, 27, 35, 204, 255, 255, 'Aqua'],       // Aqua 146°-204° (0-360)
        [204, 27, 35, 254, 255, 255, 'Blue'],       // Aqua-Blue, Blue 204°-254° (0-360)
        [254, 27, 35, 298, 255, 255, 'Magenta'],    // Magenta 254°-298° (0-360)
        [254, 27, 35, 350, 255, 255, 'Pink'],       // Pink 298°-350° (0-360)
        [350, 27, 35, 360, 255, 255, 'Red'],        // Red upper 350°-360° (0-360)
        [0, 0, 0, 180, 255, 35, 'Black'],           // Black
        [0, 0, 190, 170, 27, 255, 'White'],         // White (not blue) 0°-170° (0-360) & 230°-360° (0-360)
        [230, 0, 190, 360, 27, 255, 'White'],
        [170, 0, 190, 230, 27, 255, 'Blue'],        // Aqua-Blue, Blue 204°-254° (0-360)
    ],
};

// Initialize color database

if (!window.COLORS) {
    COLORS = {};
}

requirejs([
    'js/colors/color-brands.js',
    'js/colors/color-teams.js',
    'js/colors/color-basic.js',
    'js/colors/color-inspirations.js',
    'js/colors/color-pantone.js'
], function () {
    ntc.init();
});