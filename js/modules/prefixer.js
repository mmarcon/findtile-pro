define(function(){
    'use strict';

    var ontransitionendPrefixed = function(){
        var eventName = 'transitionend';
        if(!!navigator.appVersion.match(/chrome/i) || !!navigator.appVersion.match(/safari/i)) {
            eventName = 'webkitTransitionEnd';
        }
        return eventName;
    };

    return {
        ontransitionend: ontransitionendPrefixed()
    };
});