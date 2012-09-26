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

define("modules/store",[],function(){"use strict";var e,t,n=[],r,i=window;return e=function(e){t?e(t.slice()):n.push(e)},r=function(){var e=new i.XMLHttpRequest;e.open("GET","data/cities.json",!0),e.onreadystatechange=function(r){var i,s,o;e.readyState==4&&e.status==200&&(t=JSON.parse(e.responseText),t&&n.length>0&&(n.forEach(function(e){e.call(null,t)}),n.length=0))},e.send(null)},r(),{done:e}}),define("modules/nokiamaps",[],function(){"use strict";var e={id:"C2Cse_31xwvbccaAIAaP",token:"fjFdGyRjstwqr9iJxLwQ-g",baseURL:"http://m.nok.it/?app_id={ID}&token={TOKEN}&c={LAT},{LON}&nord&nodot&t=1&h=200&w=200&z={ZOOM}"},t,n=e.baseURL.replace("{ID}",e.id).replace("{TOKEN}",e.token);return t=function(e,t,r){return r=r||9,n.replace("{LAT}",e).replace("{LON}",t).replace("{ZOOM}",r)},{getTileUrl:t}}),define("modules/prefixer",[],function(){"use strict";var e=function(){var e="transitionend";if(!!navigator.appVersion.match(/chrome/i)||!!navigator.appVersion.match(/safari/i))e="webkitTransitionEnd";return e};return{ontransitionend:e()}}),define("modules/cookies",{getItem:function(e){return!e||!this.hasItem(e)?null:unescape(document.cookie.replace(new RegExp("(?:^|.*;\\s*)"+escape(e).replace(/[\-\.\+\*]/g,"\\$&")+"\\s*\\=\\s*((?:[^;](?!;))*[^;]?).*"),"$1"))},setItem:function(e,t,n,r,i,s){if(!e||/^(?:expires|max\-age|path|domain|secure)$/i.test(e))return;var o="";if(n)switch(n.constructor){case Number:o=n===Infinity?"; expires=Tue, 19 Jan 2038 03:14:07 GMT":"; max-age="+n;break;case String:o="; expires="+n;break;case Date:o="; expires="+n.toGMTString()}document.cookie=escape(e)+"="+escape(t)+o+(i?"; domain="+i:"")+(r?"; path="+r:"")+(s?"; secure":"")},removeItem:function(e,t){if(!e||!this.hasItem(e))return;document.cookie=escape(e)+"=; expires=Thu, 01 Jan 1970 00:00:00 GMT"+(t?"; path="+t:"")},hasItem:function(e){return(new RegExp("(?:^|;\\s*)"+escape(e).replace(/[\-\.\+\*]/g,"\\$&")+"\\s*\\=")).test(document.cookie)}}),define("modules/user",["modules/cookies","firebase"],function(e){"use strict";var t,n,r;return t=function(){this.id=r(),this.firebaseRef=new Firebase("http://gamma.firebase.com/mmarcon/findtilepro/users/"+this.id),this.attachEventHandlers(),this.data=null,this.callbacks=[]},n=t.prototype,n.attachEventHandlers=function(){this.firebaseRef.on("value",function(e){var t=e.val();!t||!t.name||typeof t.score!="number"||typeof t.maxscore!="number"?(this.data={score:0,name:"unknown",maxscore:0},this.firebaseRef.set(this.data),this.callbacks.forEach(function(e){e.call(this)}),this.callbacks.length=0):(this.data=t,this.data.score>this.data.maxscore&&this.firebaseRef.child("maxscore").set(this.data.score),this.callbacks.forEach(function(e){e.call(this)}),this.callbacks.length=0),console.log(this.toString())}.bind(this))},n.setName=function(e,t){this.firebaseRef.child("name").set(e,t)},n.resetScore=function(e){this.data.score=0,this.firebaseRef.child("score").set(this.data.score,e)},n.incrementScore=function(e){this.firebaseRef.child("score").set(this.data.score+1,e)},n.toString=function(){return"["+this.id+"] Name:"+(this.data&&this.data.name)+", Score:"+(this.data&&this.data.score)},n.done=function(e){this.data?e.call(this):this.callbacks.push(e)},r=function(){var t=e.getItem("findtileid");return t||(t="user-"+Math.random().toFixed(8).replace(/\./,"")+"-"+Math.sqrt(Date.now()).toString().replace(/^\d+\./,""),e.setItem("findtileid",t)),t},t}),define("modules/game",["modules/store","modules/nokiamaps","modules/prefixer","modules/user"],function(e,t,n,r){"use strict";Array.prototype.randomElement=Array.prototype.randomElement||function(){return this[Math.floor(Math.random()*this.length)]},Array.prototype.shuffle=Array.prototype.shuffle||function(){for(var e,t,n=this.length;n;e=Math.floor(Math.random()*n),t=this[--n],this[n]=this[e],this[e]=t);};var i=document,s,o,u,a,f,l,c,h,p,d=i.querySelector(".overlay"),v,m={correct:"Well done, that is indeed correct!",wrong:'GAME OVER :( Unfortunately you picked the wrong tile. That one is ${CITY}, and you can learn more about it <a href="http://en.wikipedia.com/wiki/${W_CITY}" target="_blank">on Wikipedia</a>.'},g,y=1,b=new r,w={makeLevel:function(e){var t={};return e.shuffle(),t.t0=e.randomElement(),e.shuffle(),t.t1=e.randomElement(),e.shuffle(),t.t2=e.randomElement(),t},makeFirstLevel:function(e,t){var n={};return n.t0={lat:t.lat,lon:t.lon},e.shuffle(),n.t1=e.randomElement(),e.shuffle(),n.t2=e.randomElement(),n},makeURLMaker:function(e){return function(n){return t.getTileUrl(n.lat,n.lon,e)}}};return s=function(){navigator.geolocation?navigator.geolocation.getCurrentPosition(o,u):u()},o=function(e){var t=e.coords.latitude,n=e.coords.longitude;f(t,n),b.done(function(){var e=i.querySelector(".overlay");e.style.display="none",e.children[0].style.display="none",b.data.name&&b.data.name!=="unknown"&&(i.querySelector("form").style.display="none",c(t,n))})},h=function(e){i.querySelector(".score span").textContent=e+""},c=function(t,n){b.resetScore(),h(0),i.querySelector("form").style.display="none",e.done(function(e){var r=w.makeFirstLevel(e,{lat:t,lon:n});i.querySelector("header").classList.add("collapsed"),i.querySelector(".level").style.display="block",i.querySelector("ol").style.display="block",g=e,p(r)})},p=function(e){var t,n,r=[],s=w.makeURLMaker(Math.max(9,Math.floor(Math.random()*14))),o;v={},t=s(e.t0),r.push(t),v.correct=t,i.querySelector(".where").textContent=e.t0.city?decodeURIComponent(e.t0.city):"your current location",i.querySelector(".level-number").textContent=y,t=s(e.t1),r.push(t),v[t]=e.t1,t=s(e.t2),r.push(t),v[t]=e.t2,r.shuffle(),r.forEach(function(e,t){n=i.createElement("img"),n.width=200,n.height=200,n.src=e,n.onload=function(){this.style.display="block",this.parentNode.classList.add("back")},o=i.querySelector(".tile"+(t+1)),o.innerHTML=null,o.appendChild(n)})},u=function(){d.style.display="block",i.querySelector(".error.nolocation").style.display="block"},l=function(){var e=w.makeLevel(g),t,r=3,s,o;t=i.querySelector("ol"),o=i.querySelector(".level"),s=function(i){var u=i.target;u.tagName.match(/li/i)&&--r===0&&(p(e),o.style.visibility="visible",t.removeEventListener(n.ontransitionend,s,!0))},t.addEventListener(n.ontransitionend,s,!0),[].forEach.call(t.children,function(e){e.classList.remove("correct"),e.classList.remove("wrong"),e.classList.remove("back")}),o.style.visibility="hidden"},f=function(e,t){[].forEach.call(i.querySelectorAll(".error span"),function(e){e.addEventListener("click",function(){this.parentNode.style.display="none",d.style.display="none"},!1)}),[].forEach.call(i.querySelectorAll("ol li"),function(e){e.addEventListener("click",function(e){var t=this.querySelector("img").src,n=document.querySelector(".result");[].forEach.call(this.parentNode.children,function(e){e.classList.remove("correct"),e.classList.remove("wrong")}),t===v.correct?(this.classList.add("correct"),n.classList.remove("wrong"),n.classList.add("correct"),n.innerHTML=m.correct,b.incrementScore(function(){h(b.data.score)}),setTimeout(function(){y++,n.innerHTML=null,l()},2e3)):(this.classList.add("wrong"),n.classList.remove("correct"),n.classList.add("wrong"),n.innerHTML=m.wrong.replace("${CITY}",decodeURIComponent(v[t].city)).replace("${W_CITY}",v[t].wikipedia),b.resetScore(),h(0))})}),i.querySelector("form").addEventListener("submit",function(n){n.preventDefault();var r=this.querySelector("#name").value||"Anonymous";b.setName(r,c.bind(null,e,t))},!1)},{init:s}}),require(["modules/game"],function(e){"use strict";e.init()}),define("main",function(){})