goog.provide('bad.utils');
goog.require('goog.ui.Css3ButtonRenderer');
goog.require('goog.ui.CustomButton');

/**
 * @param {string} string
 * @param {string} icon
 * @return {!Element}
 */
bad.utils.getIconString = function(string, icon) {
    return goog.dom.createDom('span', {},
        goog.dom.createDom('i', icon), string);
};

/**
 * Make a default button.
 * @param {!string} elId The element id that will be decorated.
 * @param {Function=} opt_callback The callback function to execute on
 *      button action.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
 * @return {goog.ui.CustomButton}
 */
bad.utils.makeButton = function(elId, opt_callback, opt_domHelper) {
    var button = new goog.ui.CustomButton('',
        goog.ui.Css3ButtonRenderer.getInstance(), opt_domHelper);
    button.setSupportedState(goog.ui.Component.State.FOCUSED, false);
    button.decorate(goog.dom.getElement(elId));
    if (opt_callback) {
        button.getHandler().listen(
            button,
            goog.ui.Component.EventType.ACTION,
            function() {
                opt_callback();
            }, undefined, button
        );
    }
    return button;
};

bad.utils.makeMenu =
    function(menuItems, domHelper, handler, scope, opt_rend, opt_itemRend, opt_sticky) {

    // Menu
    var menu = new goog.ui.Menu(domHelper, opt_rend);
    goog.array.forEach(menuItems, function(arr) {
        var item;
        if (arr[0]) {
            var name =  bad.utils.getIconString(arr[0], arr[1]);
            item = new goog.ui.MenuItem(name, arr[2], domHelper, opt_itemRend);
        } else {
            item = new goog.ui.MenuSeparator(domHelper);
        }
        menu.addChild(item, true);
    }, scope);

    handler.listen(
        menu,
        goog.ui.Component.EventType.ACTION,
        function(e) {
            var activeMenuItem = e.target;
            e.stopPropagation();
            activeMenuItem.getModel()();
            if(opt_sticky) {
                activeMenuItem.getParent().forEachChild(function(child) {
                        child.removeClassName('flat-menuitem-stickey-select');
                    }
                );
                activeMenuItem.addClassName('flat-menuitem-stickey-select');
            }
        }
    );
    return menu;
};

/**
 *
 * @param {number=} opt_start
 * @return {function(): number}
 */
bad.utils.privateCounter = function(opt_start) {
    var c = opt_start ? opt_start : 0;

    /**
     * @return {number}
     */
    return function() {
        c = c + 1;
        return c;
    };
};

/**
 * Returns a pseudo random string. Good for ids.
 * @return {string}
 */
bad.utils.makeId = function() {
    return Math.floor(Math.random() * 2147483648).toString(36);
};

/**
 * Private function that will always return the same random string each time
 * it is called.
 * @return {string}
 */
bad.utils.privateRandom = function() {
    var c = bad.utils.makeId();

    /**
     * @return {string}
     */
    return (function() {
        return c;
    })();
};
