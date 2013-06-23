goog.provide('bad.utils');

bad.utils.getIconString = function(string, icon) {
    return goog.dom.createDom('span', {},
        goog.dom.createDom('i', icon), string);
};
