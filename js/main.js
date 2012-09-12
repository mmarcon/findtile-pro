(function(doc){
    'use strict';

    Array.prototype.randomElement = Array.prototype.randomElement || function(){
        return this[Math.floor(Math.random()*this.length)];
    };
    Array.prototype.shuffle = Array.prototype.shuffle || function(){
        for(var j, x, i = this.length; i; j = Math.floor(Math.random() * i), x = this[--i], this[i] = this[j], this[j] = x);
    };

    var init, locationFound, locationNotFound, cities, attachEventHandlers,
        API = {
            id: 'C2Cse_31xwvbccaAIAaP',
            token: 'fjFdGyRjstwqr9iJxLwQ-g',
            baseURL: 'http://m.nok.it/?app_id={ID}&token={TOKEN}&c={LAT},{LON}&nord&nodot&t=1&h=200&w=200'
        },
        overlay = doc.querySelector('.overlay'),
        correct;

    init = function(){
        //app lives here
        attachEventHandlers();
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(locationFound, locationNotFound);
        }
        else {
            locationNotFound();
        }
    };

    locationFound = function(position){
        var lat = position.coords.latitude,
            lon = position.coords.longitude,
            img = [],
            url = API.baseURL.replace('{ID}', API.id).replace('{TOKEN}', API.token),
            req;

        //Get map tiles
        img.push(url.replace('{LAT}', lat).replace('{LON}', lon));

        req = new XMLHttpRequest();
        req.open('GET', 'data/cities.json', true);
        req.onreadystatechange = function (aEvt) {
            var city, el;
            if (req.readyState == 4) {
                if(req.status == 200) {
                    cities = JSON.parse(req.responseText);
                    cities.shuffle();
                    city = cities.randomElement();
                    console.log(city);
                    img.push(url.replace('{LAT}', city.lat).replace('{LON}', city.lon));
                    cities.shuffle();
                    city = cities.randomElement();
                    console.log(city);
                    img.push(url.replace('{LAT}', city.lat).replace('{LON}', city.lon));
                    correct = img[0];
                    img.shuffle();
                    img.forEach(function(image, index){
                        el = doc.createElement('img');
                        el.width = 200;
                        el.height = 200;
                        el.src = image;
                        el.onload = function(){
                            this.style.display = 'block';
                        };
                        doc.querySelector('.tile' + (index + 1)).appendChild(el);
                    });

                    if (localStorage.getItem('findtile')) {
                        overlay.style.display = 'block';
                        doc.querySelector('.error.cheating').style.display = 'block';
                    }
                    else {
                        //for cheaters
                        localStorage.setItem('findtile', true);
                    }
                }
                else {
                    overlay.style.display = 'block';
                    doc.querySelector('.error.nodata').style.display = 'block';
                }
            }
        };
        req.send(null);
    };

    locationNotFound = function(){
        overlay.style.display = 'block';
        doc.querySelector('.error.nolocation').style.display = 'block';
    };

    attachEventHandlers = function(){
        Array.prototype.forEach.call(doc.querySelectorAll('.error span'), function(e){
            e.addEventListener('click', function(){
                this.parentNode.style.display = 'none';
                overlay.style.display = 'none';
            }, false);
        });
        Array.prototype.forEach.call(doc.querySelectorAll('ol li'), function(li){
            li.addEventListener('click', function(e) {
                if (this.querySelector('img').src === correct) {
                    this.classList.add('correct');
                }
                else {
                    this.classList.add('wrong');
                }
            });
        });
    };

    if(doc.addEventListener) {
        doc.addEventListener('DOMContentLoaded', init, false);
    }
    else {
        window.onload = init;
    }
})(document);

