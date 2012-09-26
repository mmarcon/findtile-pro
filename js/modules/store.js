define(function(){
    'use strict';

    var done, data, callbacks = [], sync, w = window;

    done = function(callback){
        if(data) {
            //Pass a copy
            callback(data.slice());
        }
        else {
            callbacks.push(callback);
        }
    };

    sync = function(){
        var req = new w.XMLHttpRequest();
        req.open('GET', 'data/cities.json', true);
        req.onreadystatechange = function (aEvt) {
            var city, rurl, el;
            if (req.readyState == 4) {
                if(req.status == 200) {
                    data = JSON.parse(req.responseText);
                    if(data && callbacks.length > 0) {
                        callbacks.forEach(function(c){
                            c.call(null, data);
                        });
                        callbacks.length = 0;
                    }
                }
            }
        };
        req.send(null);
    };

    sync();

    return {
        done: done
    };
});