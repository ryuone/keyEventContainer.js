/**
 * User: ryuone
 * Date: 12/02/09
 * License: MIT License
 */
var kec = implementer.keyEventContainer();
var kec2 = implementer.keyEventContainer();

window.addEventListener("load", function(){
    var buttonOn = document.querySelector('input[name="btnOn"]');
    var buttonOff = document.querySelector('input[name="btnOff"]');
    var buttonStart = document.querySelector('input[name="btnStart"]');
    var buttonStop = document.querySelector('input[name="btnStop"]');

    buttonOn.addEventListener("click",function(){
        kec.on("ctrl+c", function(){
            console.log("ctrl+c v1 keyup");
        }, {eventType:"keyup"});

        kec.on("ctrl+c", function(){
            console.log("ctrl+c v2 keydown");
        });
        kec.on("c", function(e){
            console.log("c v3 keypress");
        }, {eventType:"keypress"});

        kec.on("c", function(e){
            console.log("c v4 keydown" + Date.now());
        }, {eventType:"keydown"});

        kec.on("c", function(e){
            console.log("c v4 keyup" + Date.now());
        }, {eventType:"keyup"});
    });
    buttonOff.addEventListener("click", function(){
        kec.off("c", {eventType:"keyup"});
        kec.off("c", {eventType:"keypress"});
        kec.off("c", {eventType:"keydown"});
        kec.off("ctrl+c", {eventType:"keyup"});
        kec.off("ctrl+c", {eventType:"keydown"});
    });
    buttonStart.addEventListener("click",function(){
        implementer.keyEventContainer.start();
    });
    buttonStop.addEventListener("click",function(){
        implementer.keyEventContainer.stop();
    });
});
