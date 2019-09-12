(function () {

    const PART_COUNT = 3;
    const DEBUG = false;
    let cats, parts, alliterateCheckbox;

    // Underscore.js integration
    _.mixin(s.exports());

    rxt.importTags();
    const bind = rx.bind;

    const partIndices = (function () {
        const results = [];
        for (let i = 0, max = PART_COUNT - 1; 0 <= max ? i <= max : i >= max; 0 <= max ? i++ : i--) {
            results.push(i);
        }

        return results;
    }).apply(this);

    if (!window.NAMES) {
        NAMES = {};
    }

    // Load categories
    requirejs([
        'js/names/name-adjectives.js',
        'js/names/name-animals.js',
        'js/names/name-asian-surnames.js',
        'js/names/name-baby-animals.js',
        'js/names/name-california-cities.js',
        'js/names/name-cat-breeds.js',
        'js/names/name-colors-extended.js',
        'js/names/name-color-terms.js',
        'js/names/name-colors.js',
        'js/names/name-culinary-fruits.js',
        'js/names/name-dinosaurs.js',
        'js/names/name-dog-breeds.js',
        'js/names/name-elements.js',
        'js/names/name-endangered-species.js',
        'js/names/name-fishes.js',
        'js/names/name-flowers.js',
        'js/names/name-foods.js',
        'js/names/name-gemstones.js',
        'js/names/name-greek-gods.js',
        'js/names/name-imperial-units.js',
        'js/names/name-impressive-chemicals.js',
        'js/names/name-impressive-words.js',
        'js/names/name-kingdom-animalia.js',
        'js/names/name-vegetables.js',
        'js/names/name-metals.js',
        'js/names/name-mountains.js',
        'js/names/name-national-capitals.js',
        'js/names/name-outer-space.js',
        'js/names/name-plants.js',
        'js/names/name-si-prefixes.js',
        'js/names/name-si-units.js',
        'js/names/name-squamata.js',
        'js/names/name-us-submarines.js'
    ], function () {

        cats = window.NAMES;
        parts = rx.array(_(cats).chain().keys().sample(PART_COUNT).value());

        const finalName = bind(function () {
            const catKeys = parts ? parts.all() : void 0;
            if (!(parts ? typeof parts.all === "function" ? catKeys ? catKeys.length : void 0 : void 0 : void 0)) {
                console.log(parts, 'is not cool');
                return " ";
            }

            let ref;
            const alliterate = (alliterateCheckbox ? typeof alliterateCheckbox.rx === "function" ?
                (ref = alliterateCheckbox.rx('checked')) ? typeof ref.get === "function" ? ref.get() : void 0 : void 0 : void 0 : void 0) || false;
            let firstChar = false;

            return parts.all().map(function (key) {
                const category = cats[key];

                const names = category ? category["values"] : void 0;
                if (!(names ? names.length : void 0)) {
                    return "";
                }

                const rnd = _.chain(names).filter(function (input) {
                    if (!alliterate || !firstChar) {
                        return true;
                    } else {
                        return input.charAt(0).toUpperCase() === firstChar;
                    }
                }).sample(1).first().value();

                if (!firstChar) {
                    firstChar = rnd.charAt(0).toUpperCase();
                }

                return rnd;
            }).join(" ").split(" ").map(_.capitalize).join(" ");
        });

        jQuery(function ($) {

            if (DEBUG) {
                window.n = parts;
                window.f = finalName;
            }

            $('body').addClass('js');
            $('#selects').append(selects(parts, finalName));
            $('#final-name').append(span(finalName));
        });
    });

    const selects = function (partOpts, resultName) {
        return section({
            "class": 'card'
        }, [
            form({
                "class": 'card-body form-inline text-center',
                submit: function (ev) {
                    ev.preventDefault();
                    return resultName.refresh();
                }
            }, partIndices.map(function (i) {
                return div({
                    "class": 'form-horizontal'
                }, [
                    select({
                        "class": 'form-control',
                        change: function () {
                            return partOpts.splice(i, 1, this.val());
                        }
                    }, [
                        option({
                            value: ''
                        }, '– NA –')
                    ].concat(optionsFor(cats, partOpts.at(i)))),
                    small({
                        "class": 'form-text text-muted',
                    }, bind(function () {
                        return [sourceInfo(cats, partOpts.at(i))];
                    }))
                ]);
            }).concat([
                div({
                    "class": 'form-horizontal'
                }, [
                    button({
                        "class": 'btn btn-primary',
                        type: 'submit'
                    }, [
                        i({
                            "class": "icon-random"
                        }, ' '), "Generate!"
                    ]), small({
                        "class": 'form-text text-muted'
                    }, "Click it again!")
                ]), div({
                    "class": 'form-horizontal'
                }, [
                    label({
                        "for": 'alliterate'
                    }, [
                        alliterateCheckbox = input({
                            "class": "form-control",
                            "type": 'checkbox',
                            "id": 'alliterate'
                        }), " Alliterate"
                    ]), small({
                        "class": 'form-text text-muted'
                    }, "Same first characters")
                ])
            ]))
        ]);
    };

    const optionsFor = function (list, selected) {
        return _(list).chain().pairs().sortBy(function (x) {
            return x[0];
        }).map(function (arr) {
            const key = arr[0];
            const cat = arr[1];
            return option({
                value: key,
                selected: key === selected
            }, cat.name);
        }).value();
    };

    const sourceInfo = function (list, selected) {
        if (!selected || '' === selected) {
            return "(Will be ignored)";
        }

        const sl = list ? list[selected] : void 0;
        if (!sl) {
            return console.log(selected, "is not a section of", list);
        }

        return a({
            href: sl.source
        }, "Source");
    };
}).call(this);
