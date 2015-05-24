var isLink = function(el){return (typeof el=='object') && (el.tagName.toLowerCase() == 'a')};
var getClosestVerticalLink = function(element, deep){
    return isLink(element) && element
        || element.parentElement && getClosestVerticalLink(element.parentElement, deep - 1);
};
module.exports = getClosestVerticalLink;