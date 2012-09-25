/*
 * Copyright 2012 Massimiliano Marcon (http://marcon.me)
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
 
define(['modules/store', 'modules/nokiamaps', 'modules/prefixer', 'modules/user'], function(store, nokiamaps, prefixer, User){
    'use strict';

    Array.prototype.randomElement = Array.prototype.randomElement || function(){
        return this[Math.floor(Math.random()*this.length)];
    };
    Array.prototype.shuffle = Array.prototype.shuffle || function(){
        for(var j, x, i = this.length; i; j = Math.floor(Math.random() * i), x = this[--i], this[i] = this[j], this[j] = x);
    };

    var doc = document,
        init, locationFound, locationNotFound, cities, attachEventHandlers, loadNextLevel, startGame, updateScore,
        layDownLevel, overlay = doc.querySelector('.overlay'),
        answers,
        text = {
            correct: 'Well done, that is indeed correct!',
            wrong: 'GAME OVER :( Unfortunately you picked the wrong tile. ' +
                   'That one is ${CITY}, and you can learn more about it ' +
                   '<a href="http://en.wikipedia.com/wiki/${W_CITY}" target="_blank">on Wikipedia</a>.'
        }, cityArray, levelNumber = 1, user = new User();

    var LevelHelper = {
        makeLevel: function(cities){
            var level = {};
            cities.shuffle();
            level.t0 = cities.randomElement();
            cities.shuffle();
            level.t1 = cities.randomElement();
            cities.shuffle();
            level.t2 = cities.randomElement();
            return level;
        },
        makeFirstLevel: function(cities, here){
            var level = {};
            level.t0 = {
                lat: here.lat,
                lon: here.lon
            };
            cities.shuffle();
            level.t1 = cities.randomElement();
            cities.shuffle();
            level.t2 = cities.randomElement();
            return level;
        },
        makeURLMaker: function(zoom){
            return function(city){
                return nokiamaps.getTileUrl(city.lat, city.lon, zoom);
            };
        }
    };

    init = function(){
        //app lives here
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(locationFound, locationNotFound);
        }
        else {
            locationNotFound();
        }
    };

    locationFound = function(position){
        var lat = position.coords.latitude,
            lon = position.coords.longitude;

        attachEventHandlers(lat, lon);

        user.done(function(){
            var overlay = doc.querySelector('.overlay');
            overlay.style.display = 'none';
            overlay.children[0].style.display = 'none';
            if(user.data.name && user.data.name !== 'unknown') {
                doc.querySelector('form').style.display = 'none';
                startGame(lat, lon);
            }
        });
    };

    updateScore = function(to){
        doc.querySelector('.score span').textContent = to+'';
    };

    startGame = function(lat, lon) {
        user.resetScore();
        updateScore(0);
        doc.querySelector('form').style.display = 'none';
        store.done(function(cities){
            var level = LevelHelper.makeFirstLevel(cities, {lat: lat, lon: lon});
            doc.querySelector('header').classList.add('collapsed');
            doc.querySelector('.level').style.display = 'block';
            doc.querySelector('ol').style.display = 'block';
            cityArray = cities;
            layDownLevel(level);
        });
    };

    layDownLevel = function(level){
        var rurl, el, img = [], URLMaker = LevelHelper.makeURLMaker(Math.max(9, Math.floor(Math.random() * 14))), li;
        
        answers = {};

        rurl = URLMaker(level.t0);
        img.push(rurl);
        answers.correct = rurl;
        doc.querySelector('.where').textContent = level.t0.city ? decodeURIComponent(level.t0.city) : 'your current location';
        doc.querySelector('.level-number').textContent = levelNumber;
        rurl = URLMaker(level.t1);
        img.push(rurl);
        answers[rurl] = level.t1;
        rurl = URLMaker(level.t2);
        img.push(rurl);
        answers[rurl] = level.t2;

        img.shuffle();
        img.forEach(function(image, index){
            el = doc.createElement('img');
            el.width = 200;
            el.height = 200;
            el.src = image;
            el.onload = function(){
                this.style.display = 'block';
                this.parentNode.classList.add('back');
            };
            li = doc.querySelector('.tile' + (index + 1));
            //Seems more reliable to do this here.
            li.innerHTML = null;
            li.appendChild(el);
        });
    };

    locationNotFound = function(){
        overlay.style.display = 'block';
        doc.querySelector('.error.nolocation').style.display = 'block';
    };

    loadNextLevel = function(){
        var level = LevelHelper.makeLevel(cityArray), ol, count = 3, listener, levelElement;
        ol = doc.querySelector('ol');
        levelElement  = doc.querySelector('.level');

        listener = function(e){
            var t = e.target;
            if(t.tagName.match(/li/i)) {
                if(--count === 0) {
                    layDownLevel(level);
                    levelElement.style.visibility = 'visible';
                    ol.removeEventListener(prefixer.ontransitionend, listener, true);
                }
            }
        };
        ol.addEventListener(prefixer.ontransitionend, listener, true);

        [].forEach.call(ol.children, function(li){
            li.classList.remove('correct');
            li.classList.remove('wrong');
            li.classList.remove('back');
        });

        levelElement.style.visibility = 'hidden';
    };

    attachEventHandlers = function(lat, lon){
        [].forEach.call(doc.querySelectorAll('.error span'), function(e){
            e.addEventListener('click', function(){
                this.parentNode.style.display = 'none';
                overlay.style.display = 'none';
            }, false);
        });
        [].forEach.call(doc.querySelectorAll('ol li'), function(li){
            li.addEventListener('click', function(e) {
                var src = this.querySelector('img').src,
                    result = document.querySelector('.result');
                [].forEach.call(this.parentNode.children, function(l){
                    l.classList.remove('correct');
                    l.classList.remove('wrong');
                });
                if (src === answers.correct) {
                    this.classList.add('correct');
                    result.classList.remove('wrong');
                    result.classList.add('correct');
                    result.innerHTML = text.correct;
                    user.incrementScore(function(){
                        updateScore(user.data.score);
                    });
                    setTimeout(function(){
                        levelNumber++;
                        result.innerHTML = null;
                        loadNextLevel();
                    }, 2000);
                }
                else {
                    this.classList.add('wrong');
                    result.classList.remove('correct');
                    result.classList.add('wrong');
                    result.innerHTML = text.wrong.replace('${CITY}', decodeURIComponent(answers[src].city))
                                               .replace('${W_CITY}', answers[src].wikipedia);
                    user.resetScore();
                    updateScore(0);
                }
            });
        });
        doc.querySelector('form').addEventListener('submit', function(e){
            e.preventDefault();
            var name = this.querySelector('#name').value || 'Anonymous';
            user.setName(name, startGame.bind(null, lat, lon));
        }, false);
    };

    return {
        init: init
    };
});

