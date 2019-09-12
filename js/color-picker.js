/*
 Copyright (c) 2007 John Dyer (http://johndyer.name)
 MIT style license
 */

if (!window.Refresh) Refresh = {};
if (!Refresh.Web) Refresh.Web = {};

Refresh.Web.DefaultColorPickerSettings = {
    startMode: 'h',
    startHex: 'ff0000',
    clientFilesPath: 'images/'
};

// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.
function debounce(func, wait, immediate) {
    let timeout;

    return function () {
        const context = this, args = arguments;
        const later = function () {
            timeout = null;
            if (!immediate) {
                func.apply(context, args);
            }
        };

        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) {
            func.apply(context, args);
        }
    };
}

Refresh.Web.ColorPicker = Class.create();
Refresh.Web.ColorPicker.prototype = {
    initialize: function (id, settings) {
        this.id = id;
        this.settings = Object.extend(Object.extend({}, Refresh.Web.DefaultColorPickerSettings), settings || {});

        // Mode checkbox
        this._basicCheckbox = $(this.id + '-basic-chk');
        this._inspirationsCheckbox = $(this.id + '-inspirations-chk');
        this._teamsCheckbox = $(this.id + '-teams-chk');
        this._schoolsCheckbox = $(this.id + '-schools-chk');
        this._brandsCheckbox = $(this.id + '-brands-chk');
        this._pantoneCheckbox = $(this.id + '-pantone-chk');
        this._uncheckAllCheckbox = $(this.id + '-uncheck-all-chk');

        this._euclideanCheckbox = $(this.id + '-euclidean-chk');
        this._de2000Checkbox = $(this.id + '-de2000-chk');

        this._rangeSelect = $(this.id + '-range-sel');


        // attach radio & check boxes
        this._hueRadio = $(this.id + '-hue-radio');
        this._saturationRadio = $(this.id + '-saturation-radio');
        this._valueRadio = $(this.id + '-brightness-radio');

        this._redRadio = $(this.id + '-red-radio');
        this._greenRadio = $(this.id + '-green-radio');
        this._blueRadio = $(this.id + '-blue-radio');
        //this._webSafeCheck = $(this.id + '_WebSafeCheck');

        this._hueRadio.value = 'h';
        this._saturationRadio.value = 's';
        this._valueRadio.value = 'v';

        this._redRadio.value = 'r';
        this._greenRadio.value = 'g';
        this._blueRadio.value = 'b';

        // attach events to radio & checks

        this._event_onRadioClicked = this._onRadioClicked.bindAsEventListener(this);

        Event.observe(this._hueRadio, 'click', this._event_onRadioClicked);
        Event.observe(this._saturationRadio, 'click', this._event_onRadioClicked);
        Event.observe(this._valueRadio, 'click', this._event_onRadioClicked);

        Event.observe(this._redRadio, 'click', this._event_onRadioClicked);
        Event.observe(this._greenRadio, 'click', this._event_onRadioClicked);
        Event.observe(this._blueRadio, 'click', this._event_onRadioClicked);

        //this._event_webSafeClicked = this._onWebSafeClicked.bindAsEventListener(this);
        //Event.observe( this._webSafeCheck, 'click', this._event_webSafeClicked);

        // attach simple properties
        this._preview = $(this.id + '-preview-panel');
        this._labLabel = $(this.id + '-lab-label');
        this._hslLabel = $(this.id + '-hsl-label');
        this._hsvLabel = $(this.id + '-hsv-label');
        this._cmykLabel = $(this.id + '-cmyk-label');
        this._lrvLabel = $(this.id + '-lrv-label');

        // COLOR NAME & SHADE
        // attach divs
        this._colorChosenText = $(this.id + '-clr-chosen-text');
        this._colorChosen = $(this.id + '-clr-chosen');

        // MAP
        this._mapBase = $(this.id + '-clr-map');
        this._mapBase.style.width = '256px';
        this._mapBase.style.height = '256px';
        this._mapBase.style.padding = 0;
        this._mapBase.style.margin = 0;
        this._mapBase.style.border = 'solid 1px #000';


        this._mapL1 = new Element('img', {src: this.settings.clientFilesPath + 'blank.gif', width: 256, height: 256}); //'blank.gif'});
        this._mapBase.style.margin = 0;
        this._mapL1.style.display = 'block';
        this._mapBase.appendChild(this._mapL1);

        this._mapL2 = new Element('img', {src: this.settings.clientFilesPath + 'blank.gif', width: 256, height: 256}); //'blank.gif'});
        this._mapBase.appendChild(this._mapL2);
        this._mapL2.style.clear = 'both';
        this._mapL2.style.margin = '-256px 0px 0px 0px';
        this._mapL2.setOpacity(.5);
        this._mapL2.style.display = 'block';

        // BAR
        this._bar = $(this.id + '-clr-bar');
        this._bar.style.width = '20px';
        this._bar.style.height = '256px';
        this._bar.style.padding = 0;
        this._bar.style.margin = '0px 10px';
        this._bar.style.border = 'solid 1px #000';

        this._barL1 = new Element('img', {
            src: this.settings.clientFilesPath + 'blank.gif',
            width: 20,
            height: 256
        });
        this._barL1.style.margin = '0px';
        this._barL1.style.display = 'block';
        this._bar.appendChild(this._barL1);

        this._barL2 = new Element('img', {
            src: this.settings.clientFilesPath + 'blank.gif',
            width: 20,
            height: 256
        });
        this._barL2.style.margin = '-256px 0px 0px 0px';
        this._barL2.style.display = 'block';
        this._bar.appendChild(this._barL2);

        this._barL3 = new Element('img', {
            src: this.settings.clientFilesPath + 'blank.gif',
            width: 20,
            height: 256
        });
        this._barL3.style.margin = '-256px 0px 0px 0px';
        this._barL3.style.backgroundColor = '#FF0000';
        this._barL3.style.display = 'block';
        this._bar.appendChild(this._barL3);

        this._barL4 = new Element('img', {
            src: this.settings.clientFilesPath + 'bar-brightness.png',
            width: 20,
            height: 256
        });
        this._barL4.style.margin = '-256px 0px 0px 0px';
        this._barL4.style.display = 'block';
        this._bar.appendChild(this._barL4);

        // attach map slider
        this._map = new Refresh.Web.Slider(this._mapL2, {
            xMaxValue: 255,
            yMinValue: 255,
            arrowImage: this.settings.clientFilesPath + 'mappoint.gif'
        });

        // attach color slider
        this._slider = new Refresh.Web.Slider(this._barL4, {
            xMinValue: 1,
            xMaxValue: 1,
            yMinValue: 255,
            arrowImage: this.settings.clientFilesPath + 'rangearrows.gif'
        });

        // attach color values
        this._cvp = new Refresh.Web.ColorValuePicker(this.id);

        // link up events
        const cp = this;

        this._uncheckAllCheckbox.onchange = function () {

            if (cp._uncheckAllCheckbox.checked) {
                cp._inspirationsCheckbox.checked = false;
                cp._pantoneCheckbox.checked = false;
                cp._basicCheckbox.checked = false;
                cp._schoolsCheckbox.checked = false;
                cp._teamsCheckbox.checked = false;
                cp._brandsCheckbox.checked = false;
                cp.textValuesChanged();
            } else {
                return false;
            }
        };

        this._inspirationsCheckbox.onchange = function () {
            cp.textValuesChanged();
        };

        this._pantoneCheckbox.onchange = function () {
            cp.textValuesChanged();
        };

        this._basicCheckbox.onchange = function () {
            cp.textValuesChanged();
        };

        this._schoolsCheckbox.onchange = function () {
            cp.textValuesChanged();
        };

        this._teamsCheckbox.onchange = function () {
            cp.textValuesChanged();
        };

        this._brandsCheckbox.onchange = function () {
            cp.textValuesChanged();
        };

        this._rangeSelect.onchange = function () {
            cp.textValuesChanged();
        };

        this._slider.onValuesChanged = function () {
            cp.sliderValueChanged()
        };

        this._map.onValuesChanged = function () {
            cp.mapValueChanged();
        };

        this._cvp.onValuesChanged = function () {
            cp.textValuesChanged();
        };

        // browser!
        this.isLessThanIe7 = false;
        const version = parseFloat(navigator.appVersion.split("MSIE")[1]);
        if ((version < 7) && (document.body.filters)) {
            this.isLessThanIe7 = true;
        }

        // initialize values
        this.setColorMode(this.settings.startMode);
        if (this.settings.startHex) {
            this._cvp._hexInput.value = this.settings.startHex;
        }

        this.color = null;

        this._cvp.setValuesFromHex();
        this.positionMapAndSliderArrows();
        this.updateVisuals();

        // End initializing
    },
    show: function () {
        this._map.Arrow.style.display = '';
        this._slider.Arrow.style.display = '';
        this._map.setPositioningVariables();
        this._slider.setPositioningVariables();
        this.positionMapAndSliderArrows();
    },
    hide: function () {
        this._map.Arrow.style.display = 'none';
        this._slider.Arrow.style.display = 'none';
    },
    _onRadioClicked: function (e) {
        this.setColorMode(e.target.value);
    },
    _onWebSafeClicked: function (e) {
        // reset
        this.setColorMode(this.colorMode);
    },
    textValuesChanged: function () {
        if (this._inspirationsCheckbox.checked || this._pantoneCheckbox.checked ||
            this._basicCheckbox.checked || this._teamsCheckbox.checked ||
            this._schoolsCheckbox.checked || this._brandsCheckbox.checked) {
            this._uncheckAllCheckbox.checked = false;
        }

        this.positionMapAndSliderArrows();
        this.updateVisuals();
    },
    setColorMode: function (colorMode) {

        this.color = this._cvp.color;

        // reset all images
        function resetImage(cp, img) {
            cp.setAlpha(img, 100);
            img.style.backgroundColor = '';
            img.src = cp.settings.clientFilesPath + 'blank.gif';
            img.style.filter = '';
        }

        resetImage(this, this._mapL1);
        resetImage(this, this._mapL2);
        resetImage(this, this._barL1);
        resetImage(this, this._barL2);
        resetImage(this, this._barL3);
        resetImage(this, this._barL4);

        this._hueRadio.checked = false;
        this._saturationRadio.checked = false;
        this._valueRadio.checked = false;
        this._redRadio.checked = false;
        this._greenRadio.checked = false;
        this._blueRadio.checked = false;


        switch (colorMode) {
            case 'h':
                this._hueRadio.checked = true;

                // MAP
                // put a color layer on the bottom
                this._mapL1.style.backgroundColor = '#' + this.color.hex;

                // add a hue map on the top
                this._mapL2.style.backgroundColor = 'transparent';
                this.setImage(this._mapL2, this.settings.clientFilesPath + 'map-hue.png');
                this.setAlpha(this._mapL2, 100);

                // SLIDER
                // simple hue map
                this.setImage(this._barL4, this.settings.clientFilesPath + 'bar-hue.png');

                this._map.settings.xMaxValue = 100;
                this._map.settings.yMaxValue = 100;
                this._slider.settings.yMaxValue = 359;

                break;

            case 's':
                this._saturationRadio.checked = true;

                // MAP
                // bottom has saturation map
                this.setImage(this._mapL1, this.settings.clientFilesPath + 'map-saturation.png');

                // top has overlay
                this.setImage(this._mapL2, this.settings.clientFilesPath + 'map-saturation-overlay.png');
                this.setAlpha(this._mapL2, 0);

                // SLIDER
                // bottom: color
                this.setBackground(this._barL3, this.color.hex);

                // top: graduated overlay
                this.setImage(this._barL4, this.settings.clientFilesPath + 'bar-saturation.png');


                this._map.settings.xMaxValue = 359;
                this._map.settings.yMaxValue = 100;
                this._slider.settings.yMaxValue = 100;

                break;

            case 'v':
                this._valueRadio.checked = true;

                // MAP
                // bottom: nothing

                // top
                this.setBackground(this._mapL1, '000');
                this.setImage(this._mapL2, this.settings.clientFilesPath + 'map-brightness.png');

                // SLIDER
                // bottom
                this._barL3.style.backgroundColor = '#' + this.color.hex;

                // top
                this.setImage(this._barL4, this.settings.clientFilesPath + 'bar-brightness.png');


                this._map.settings.xMaxValue = 359;
                this._map.settings.yMaxValue = 100;
                this._slider.settings.yMaxValue = 100;
                break;

            case 'r':
                this._redRadio.checked = true;
                this.setImage(this._mapL2, this.settings.clientFilesPath + 'map-red-max.png');
                this.setImage(this._mapL1, this.settings.clientFilesPath + 'map-red-min.png');

                this.setImage(this._barL4, this.settings.clientFilesPath + 'bar-red-tl.png');
                this.setImage(this._barL3, this.settings.clientFilesPath + 'bar-red-tr.png');
                this.setImage(this._barL2, this.settings.clientFilesPath + 'bar-red-br.png');
                this.setImage(this._barL1, this.settings.clientFilesPath + 'bar-red-bl.png');

                break;

            case 'g':
                this._greenRadio.checked = true;
                this.setImage(this._mapL2, this.settings.clientFilesPath + 'map-green-max.png');
                this.setImage(this._mapL1, this.settings.clientFilesPath + 'map-green-min.png');

                this.setImage(this._barL4, this.settings.clientFilesPath + 'bar-green-tl.png');
                this.setImage(this._barL3, this.settings.clientFilesPath + 'bar-green-tr.png');
                this.setImage(this._barL2, this.settings.clientFilesPath + 'bar-green-br.png');
                this.setImage(this._barL1, this.settings.clientFilesPath + 'bar-green-bl.png');

                break;

            case 'b':
                this._blueRadio.checked = true;
                this.setImage(this._mapL2, this.settings.clientFilesPath + 'map-blue-max.png');
                this.setImage(this._mapL1, this.settings.clientFilesPath + 'map-blue-min.png');

                this.setImage(this._barL4, this.settings.clientFilesPath + 'bar-blue-tl.png');
                this.setImage(this._barL3, this.settings.clientFilesPath + 'bar-blue-tr.png');
                this.setImage(this._barL2, this.settings.clientFilesPath + 'bar-blue-br.png');
                this.setImage(this._barL1, this.settings.clientFilesPath + 'bar-blue-bl.png');

                //this.setImage(this._barL4, this.settings.clientFilesPath + 'bar-hue.png');

                break;

            default:
                alert('invalid mode');
                break;
        }

        switch (colorMode) {
            case 'h':
            case 's':
            case 'v':

                this._map.settings.xMinValue = 1;
                this._map.settings.yMinValue = 1;
                this._slider.settings.yMinValue = 1;
                break;

            case 'r':
            case 'g':
            case 'b':

                this._map.settings.xMinValue = 0;
                this._map.settings.yMinValue = 0;
                this._slider.settings.yMinValue = 0;

                this._map.settings.xMaxValue = 255;
                this._map.settings.yMaxValue = 255;
                this._slider.settings.yMaxValue = 255;
                break;
        }

        this.colorMode = colorMode;

        this.positionMapAndSliderArrows();
        this.updateMapVisuals();
        this.updateSliderVisuals();
    },
    mapValueChanged: function () {
        // update values

        switch (this.colorMode) {
            case 'h':
                this._cvp._saturationInput.value = this._map.xValue;
                this._cvp._valueInput.value = 100 - this._map.yValue;
                break;

            case 's':
                this._cvp._hueInput.value = this._map.xValue;
                this._cvp._valueInput.value = 100 - this._map.yValue;
                break;

            case 'v':
                this._cvp._hueInput.value = this._map.xValue;
                this._cvp._saturationInput.value = 100 - this._map.yValue;
                break;

            case 'r':
                this._cvp._blueInput.value = this._map.xValue;
                this._cvp._greenInput.value = 256 - this._map.yValue;
                break;

            case 'g':
                this._cvp._blueInput.value = this._map.xValue;
                this._cvp._redInput.value = 256 - this._map.yValue;
                break;

            case 'b':
                this._cvp._redInput.value = this._map.xValue;
                this._cvp._greenInput.value = 256 - this._map.yValue;
                break;
        }

        switch (this.colorMode) {
            case 'h':
            case 's':
            case 'v':
                this._cvp.setValuesFromHsv();
                break;

            case 'r':
            case 'g':
            case 'b':
                this._cvp.setValuesFromRgb();
                break;
        }

        this.updateVisuals();
    },
    sliderValueChanged: function () {

        switch (this.colorMode) {
            case 'h':
                this._cvp._hueInput.value = 360 - this._slider.yValue;
                break;

            case 's':
                this._cvp._saturationInput.value = 100 - this._slider.yValue;
                break;

            case 'v':
                this._cvp._valueInput.value = 100 - this._slider.yValue;
                break;

            case 'r':
                this._cvp._redInput.value = 255 - this._slider.yValue;
                break;

            case 'g':
                this._cvp._greenInput.value = 255 - this._slider.yValue;
                break;

            case 'b':
                this._cvp._blueInput.value = 255 - this._slider.yValue;
                break;
        }

        switch (this.colorMode) {
            case 'h':
            case 's':
            case 'v':
                this._cvp.setValuesFromHsv();
                break;

            case 'r':
            case 'g':
            case 'b':
                this._cvp.setValuesFromRgb();
                break;
        }

        this.updateVisuals();
    },
    positionMapAndSliderArrows: function () {
        this.color = this._cvp.color;

        // Slider
        let sliderValue = 0;
        switch (this.colorMode) {
            case 'h':
                sliderValue = 360 - this.color.h;
                break;

            case 's':
                sliderValue = 100 - this.color.s;
                break;

            case 'v':
                sliderValue = 100 - this.color.v;
                break;

            case 'r':
                sliderValue = 255 - this.color.r;
                break;

            case 'g':
                sliderValue = 255 - this.color.g;
                break;

            case 'b':
                sliderValue = 255 - this.color.b;
                break;
        }

        this._slider.yValue = sliderValue;
        this._slider.setArrowPositionFromValues();

        // color map
        let mapXValue = 0;
        let mapYValue = 0;
        switch (this.colorMode) {
            case 'h':
                mapXValue = this.color.s;
                mapYValue = 100 - this.color.v;
                break;

            case 's':
                mapXValue = this.color.h;
                mapYValue = 100 - this.color.v;
                break;

            case 'v':
                mapXValue = this.color.h;
                mapYValue = 100 - this.color.s;
                break;

            case 'r':
                mapXValue = this.color.b;
                mapYValue = 256 - this.color.g;
                break;

            case 'g':
                mapXValue = this.color.b;
                mapYValue = 256 - this.color.r;
                break;

            case 'b':
                mapXValue = this.color.r;
                mapYValue = 256 - this.color.g;
                break;
        }
        this._map.xValue = mapXValue;
        this._map.yValue = mapYValue;
        this._map.setArrowPositionFromValues();
    },
    updateVisuals: function () {

        this.updatePreview();
        this.updateMapVisuals();
        this.updateSliderVisuals();
    },
    updatePreview: debounce(function () {
        this._preview.style.backgroundColor = '#' + this._cvp.color.hex;

        const rgb = [
            this._cvp.color.r,
            this._cvp.color.g,
            this._cvp.color.b
        ];

        const lab = ntc.rgb2lab(rgb);
        this._labLabel.innerText = [
            lab[0].toFixed(2),
            lab[1].toFixed(2),
            lab[2].toFixed(2)
        ].join(', ');

        const hsl = ntc.rgb2hsl(rgb);
        this._hslLabel.innerText = [
            hsl[0].toFixed(1),
            hsl[1].toFixed(1),
            hsl[2].toFixed(1)
        ].join(', ');

        const hsv = ntc.rgb2hsv(rgb);
        this._hsvLabel.innerText = [
            hsv[0].toFixed(1),
            hsv[1].toFixed(1),
            hsv[2].toFixed(1)
        ].join(', ');

        const cmyk = ntc.rgb2cmyk(rgb);
        this._cmykLabel.innerText = [
            (cmyk[0] * 100).toFixed(1),
            (cmyk[1] * 100).toFixed(1),
            (cmyk[2] * 100).toFixed(1),
            (cmyk[3] * 100).toFixed(1)
        ].join(', ');

        let boxes = $$('.fpt-tv .result');
        for (let i = 0; i < boxes.length; i++) {
            const box = boxes[i];
            const hex2 = box.readAttribute('data-hex') || '';
            const labels = box.select('.dist');

            if (labels.length > 0) {
                if (hex2 !== '') {
                    const lab2 = ntc.hex2lab(hex2);

                    // Delta-E 2000
                    const df = ntc.dE2000(lab, lab2);
                    labels[0].innerHTML = '(ΔE = ' + (df === false ? '--' : df.toFixed(2)) + ')';
                } else {
                    labels[0].innerHTML = '';
                }
            }
        }

        // COLOR NAME & SHADE
        let names = [];
        if (this._inspirationsCheckbox.checked) {
            for (let i = 0; i < COLORS['inspirations'].length; i++) {
                names = names.concat(COLORS['inspirations'][i].colors);
            }
        }

        if (this._teamsCheckbox.checked) {
            for (let i = 0; i < COLORS['teams'].length; i++) {
                names = names.concat(COLORS['teams'][i].colors);
            }
        }

        if (this._brandsCheckbox.checked) {
            for (let i = 0; i < COLORS['brands'].length; i++) {
                names = names.concat(COLORS['brands'][i].colors);
            }
        }

        if (this._pantoneCheckbox.checked) {
            names = names.concat(COLORS['pantone']);
        }

        if (this._basicCheckbox.checked) {
            names = names.concat(COLORS['basic']);
        }

        //----------------------------------------------------------------------------------------------------------
        // Find the match color here
        //----------------------------------------------------------------------------------------------------------
        let match = {
            euclidean: {
                count: 1,
                items: [{
                    hex: '#000000',
                    name: 'Invalid #' + this._cvp.color.hex,
                    distance: false,
                }]
            },
            de2000: {
                count: 1,
                items: [{
                    hex: '#000000',
                    name: 'Invalid #' + this._cvp.color.hex,
                    distance: false,
                }]
            },
            found: false
        };

        if (names.length > 0) {
            const range = this._rangeSelect.value;
            match = ntc.similar('#' + this._cvp.color.hex, names, range);
        }

        boxes = $('euclidean-results').select('.result');
        for (let i = 0; i < match.euclidean.items.length; i++) {
            if (i < boxes.length) {
                const box = boxes[i];
                const item = match.euclidean.items[i];
                item.shade = item.shade || {
                    name: 'Undefined',
                    hex: '#000000'
                };

                if (!item.rgb) {
                    item.rgb = ['--', '--', '--'];
                }

                const name = item.name + (item.distance > 0 ? '<sup>approx.</sup>' : '');
                box.innerHTML = '<table><tr><td>' +
                    '<div class="hex">' + item.hex + '<sup><a style="text-decoration: none" href="https://encycolorpedia.com/' +
                    item.hex.slice(1) + '">more</a></sup></div>' +
                    '<div class="rgb">(' + item.rgb.join(', ') + ')</div>' +
                    '<div title="' + item.name + '"class="box" style="background-color: ' +
                    item.hex + ';">&nbsp;</div>' +
                    '<div class="name">' + name + '</div>' +
                    '<div class="dist">(ΔE = ' + (item.distance === false ? '--' : item.distance.toFixed(2)) + ')</div>' +
                    '<div title="' + (item.shade ? item.shade.name : 'Undefined') + '" class="shade" style="background-color: ' +
                    (item.shade ? item.shade.hex : '#000000') + ';">&nbsp;</div>' +
                    '</td></tr></table>';
                box.writeAttribute('data-hex', item.hex);
                box.writeAttribute('data-lab', item.lab);
                box.writeAttribute('data-rgb', item.rgb);
            }
        }

        for (let i = match.euclidean.items.length; i < boxes.length; i++) {
            const box = boxes[i];
            box.innerHTML = '';
            box.writeAttribute('data-hex', '');
            box.writeAttribute('data-lab', '');
            box.writeAttribute('data-rgb', '');
        }

        boxes = $('de2000-results').select('.result');
        for (let i = 0; i < match.de2000.items.length; i++) {
            if (i < boxes.length) {
                const box = boxes[i];
                const item = match.de2000.items[i];

                if (!item.rgb) {
                    item.rgb = ['--', '--', '--'];
                }

                const palette = item.palette ? (item.palette.name + ' - ') : '';
                const name = item.name + (item.distance > 0 ? '<sup>approx.</sup>' : '');
                box.innerHTML = '<table><tr><td>' +
                    '<div class="hex">' + item.hex + '<sup><a style="text-decoration: none" href="https://encycolorpedia.com/' +
                    item.hex.slice(1) + '">more</a></sup></div>' +
                    '<div class="rgb">(' + item.rgb.join(', ') + ')</div>' +
                    '<div title="' + palette + item.name + '"class="box" style="background-color: ' +
                    item.hex + ';">&nbsp;</div>' +
                    '<div class="name">' + name + '</div>' +
                    '<div class="dist">(ΔE = ' + (item.distance === false ? '--' : item.distance.toFixed(2)) + ')</div>' +
                    '<div title="' + (item.shade ? item.shade.name : 'Undefined') + '" class="shade" style="background-color: ' +
                    (item.shade ? item.shade.hex : '#000000') + ';">&nbsp;</div>' +
                    '</td></tr></table>';

                box.writeAttribute('data-hex', item.hex);
                box.writeAttribute('data-lab', item.lab);
                box.writeAttribute('data-rgb', item.rgb);
            }
        }

        for (let i = match.de2000.items.length; i < boxes.length; i++) {
            const box = boxes[i];
            box.innerHTML = '';
            box.writeAttribute('data-hex', '');
            box.writeAttribute('data-lab', '');
            box.writeAttribute('data-rgb', '');
        }

        //--------------------------------------------------------------------------------------------------------------
        // Related colors
        //--------------------------------------------------------------------------------------------------------------
        const palettes = {};
        for (let i = 0; i < match.euclidean.items.length; i++) {
            if (match.euclidean.items[i].palette && !(match.euclidean.items[i].palette.key in palettes)) {
                palettes[match.euclidean.items[i].palette.name] = match.euclidean.items[i].palette;
            }
        }

        for (let i = 0; i < match.de2000.items.length; i++) {
            if (match.de2000.items[i].palette && !(match.de2000.items[i].palette.key in palettes)) {
                palettes[match.de2000.items[i].palette.name] = match.de2000.items[i].palette;
            }
        }

        let clear = 0;
        const relatedDiv = $('related-results');
        const MAX_COUNT = 20;

        // Clear all
        relatedDiv.innerText = '';

        for (let key in palettes) {
            const palette = palettes[key];

            const paletteDiv = new Element('div', {'class': 'color-palette'});
            const titleDiv = new Element('div', {'class': 'title'});
            titleDiv.innerHTML = palette.name;
            paletteDiv.insert(titleDiv);

            for (let i = 0; i < MAX_COUNT; i++) {
                const box = new Element('div', {'class': 'result'});

                if (i < palette.colors.length) {
                    const item = palette.colors[i];

                    box.setAttribute('data-hex', item.hex);
                    box.setAttribute('data-lab', item.lab);
                    box.setAttribute('data-rgb', item.rgb);

                    if (!item.shade) {
                        item.shade = ntc.shade(item.hex);
                    }

                    const df = ntc.dE2000(lab, item.lab);
                    const name = item.name;
                    box.innerHTML = '<table><tr><td>' +
                        '<div class="hex">' + item.hex + '<sup><a style="text-decoration: none" href="https://encycolorpedia.com/' +
                        item.hex.slice(1) + '">more</a></sup></div>' +
                        '<div class="rgb">(' + item.rgb.join(', ') + ')</div>' +
                        '<div title="' + item.name + '"class="box" style="background-color: ' + item.hex + ';">&nbsp;</div>' +
                        '<div class="name">' + name + '</div>' +
                        '<div class="dist">(ΔE = ' + df.toFixed(2) + ')</div>' +
                        '<div title="' + (item.shade ? item.shade.name : 'Undefined') + '" class="shade" style="background-color: ' +
                        (item.shade ? item.shade.hex : '#000000') + ';">&nbsp;</div>' +
                        '</td></tr></table>';
                }

                paletteDiv.insert(box);
            }

            relatedDiv.insert(paletteDiv);
        }
    }, 500),
    // END updatePreview
    updateMapVisuals: function () {

        this.color = this._cvp.color;

        switch (this.colorMode) {
            case 'h':
                // fake color with only hue
                const color = new Refresh.Web.Color({h: this.color.h, s: 100, v: 100});
                this.setBackground(this._mapL1, color.hex);
                break;

            case 's':
                this.setAlpha(this._mapL2, 100 - this.color.s);
                break;

            case 'v':
                this.setAlpha(this._mapL2, this.color.v);
                break;

            case 'r':
                this.setAlpha(this._mapL2, this.color.r / 256 * 100);
                break;

            case 'g':
                this.setAlpha(this._mapL2, this.color.g / 256 * 100);
                break;

            case 'b':
                this.setAlpha(this._mapL2, this.color.b / 256 * 100);
                break;
        }
    },
    updateSliderVisuals: function () {

        this.color = this._cvp.color;

        switch (this.colorMode) {
            case 'h':
                break;

            case 's':
                const saturatedColor = new Refresh.Web.Color({h: this.color.h, s: 100, v: this.color.v});
                this.setBackground(this._barL3, saturatedColor.hex);
                break;

            case 'v':
                const valueColor = new Refresh.Web.Color({h: this.color.h, s: this.color.s, v: 100});
                this.setBackground(this._barL3, valueColor.hex);
                break;

            case 'r':
            case 'g':
            case 'b':

                let h = 0;
                let v = 0;

                if (this.colorMode === 'r') {
                    h = this._cvp._blueInput.value;
                    v = this._cvp._greenInput.value;
                } else if (this.colorMode === 'g') {
                    h = this._cvp._blueInput.value;
                    v = this._cvp._redInput.value;
                } else if (this.colorMode === 'b') {
                    h = this._cvp._redInput.value;
                    v = this._cvp._greenInput.value;
                }

                const horzPer = (h / 256) * 100;
                const vertPer = (v / 256) * 100;

                const horzPerRev = ((256 - h) / 256) * 100;
                const vertPerRev = ((256 - v) / 256) * 100;

                this.setAlpha(this._barL4, (vertPer > horzPerRev) ? horzPerRev : vertPer);
                this.setAlpha(this._barL3, (vertPer > horzPer) ? horzPer : vertPer);
                this.setAlpha(this._barL2, (vertPerRev > horzPer) ? horzPer : vertPerRev);
                this.setAlpha(this._barL1, (vertPerRev > horzPerRev) ? horzPerRev : vertPerRev);

                break;
        }
    },
    setBackground: function (el, c) {
        try {
            el.style.backgroundColor = '#' + c;
        } catch (e) {
        }
    },
    setImage: function (img, src) {

        if (src.indexOf('png') && this.isLessThanIe7) {
            img.pngSrc = src;
            img.src = this.settings.clientFilesPath + 'blank.gif';
            img.style.filter = 'progid:DXImageTransform.Microsoft.AlphaImageLoader(src=\'' + src + '\');';

        } else {
            img.src = src;
        }
    },
    setAlpha: function (obj, alpha) {
        if (this.isLessThanIe7) {
            let src = obj.pngSrc;
            // exception for the hue map
            if (src !== null && src.indexOf('map-hue') === -1)
                obj.style.filter = 'progid:DXImageTransform.Microsoft.AlphaImageLoader(src=\'' + src + '\') progid:DXImageTransform.Microsoft.Alpha(opacity=' + alpha + ')';
        } else {
            obj.setOpacity(alpha / 100);
        }
    }
};
