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

define(['modules/cookies', 'firebase'], function(cookies){
    'use strict';

    var User, U,
        _generateID;

    User = function(){
        this.id = _generateID();
        this.firebaseRef = new Firebase('http://gamma.firebase.com/mmarcon/findtilepro/users/' + this.id);
        this.attachEventHandlers();
        this.data = null;
        this.callbacks = [];
    };

    U = User.prototype;

    U.attachEventHandlers = function(){
        this.firebaseRef.on('value', (function(snapshot){
            var remoteUser = snapshot.val();
            if(!remoteUser || !remoteUser.name || typeof remoteUser.score !== 'number' || typeof remoteUser.maxscore !== 'number') {
                this.data = {score:0, name: 'unknown', maxscore: 0};
                this.firebaseRef.set(this.data);
                this.callbacks.forEach(function(c){
                    c.call(this);
                });
                this.callbacks.length = 0;
            }
            else {
                this.data = remoteUser;
                if(this.data.score > this.data.maxscore) {
                    this.firebaseRef.child('maxscore').set(this.data.score);
                }
                this.callbacks.forEach(function(c){
                    c.call(this);
                });
                this.callbacks.length = 0;
            }
            console.log(this.toString());
        }).bind(this));
    };

    U.setName = function(name, callback){
        this.firebaseRef.child('name').set(name, callback);
    };

    U.resetScore = function(callback){
        this.data.score = 0;
        this.firebaseRef.child('score').set(this.data.score, callback);
    };

    U.incrementScore = function(callback){
        this.firebaseRef.child('score').set(this.data.score + 1, callback);
    };

    U.toString = function(){
        return '[' + this.id + '] Name:' + (this.data && this.data.name) + ', Score:' + (this.data && this.data.score);
    };

    U.done = function(callback) {
        if(this.data) {
            callback.call(this);
        }
        else {
            this.callbacks.push(callback);
        }
    };

    _generateID = function(){
        var savedID = cookies.getItem('findtileid');
        if(!savedID) {
            savedID = 'user-' + Math.random().toFixed(8).replace(/\./, '') + '-'
                    + Math.sqrt(Date.now()).toString().replace(/^\d+\./, '');
            cookies.setItem('findtileid', savedID);
        }
        return savedID;
    };

    return User;
});