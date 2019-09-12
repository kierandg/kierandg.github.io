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