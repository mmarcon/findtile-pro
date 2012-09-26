define(function(){
    'use strict';

    var API = {
            id: 'C2Cse_31xwvbccaAIAaP',
            token: 'fjFdGyRjstwqr9iJxLwQ-g',
            baseURL: 'http://m.nok.it/?app_id={ID}&token={TOKEN}&c={LAT},{LON}&nord&nodot&t=1&h=200&w=200&z={ZOOM}'
        }, getTileUrl,
        url = API.baseURL.replace('{ID}', API.id).replace('{TOKEN}', API.token);

    getTileUrl = function(lat, lon, zoom) {
        zoom = zoom || 9;
        return url.replace('{LAT}', lat).replace('{LON}', lon).replace('{ZOOM}', zoom);
    };

    return {
        getTileUrl: getTileUrl
    };
});