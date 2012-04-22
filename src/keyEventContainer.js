/**
 * User: ryuone
 * Date: 12/02/09
 * License: MIT License
 */
(function(window, undefined){
    "use strict";
    var keyCodes = {};
    var keyEventTypes = "keydown keyup keypress".split(" ");
    var class2type = [];
    var keyEventContainerInstance = null;
    var keyCodeActionTable = Object.create(null);
    var executeContainerObjs = [];

    var defaultOnMethodOption = Object.create(null);

    var EmitState = {
        before_emit: 1,
        after_emit: 2
    };

    if(!window.implementer) window.implementer = {};

    // ***********************
    // Constructor
    var library = window.implementer.keyEventContainer = function(){
        if(keyEventContainerInstance){
            return keyEventContainerInstance;
        }
        if(this === window.implementer){
            return (keyEventContainerInstance = new window.implementer.keyEventContainer());
        }else{
            this.constructor = window.implementer.keyEventContainer;
        }
    };

    // ***********************
    // Not instance method.
    library.start = function(){
        for(var i=0, imax=keyEventTypes.length; i<imax; i++){
            bind(keyEventTypes[i], keyEventControl);
        }
    };
    library.stop = function(){
        for(var i=0, imax=keyEventTypes.length; i<imax; i++){
            unbind(keyEventTypes[i], keyEventControl);
        }
    };

    // ***********************
    // instance method.
    library.prototype = {
        on : function(bindKeys, fn, props) {
            var containerObj;
            var bindKeysList;

            if(!props){
                props = Object.create(null);
            }
            hashUpdate(defaultOnMethodOption, props);

            bindKeysList = bindKeys.replace(/^\s+|\s+$/g, "").split(/[\s]+/);
            for (var i = 0, imax = bindKeysList.length; i < imax; i++) {
                containerObj = getBindCodeContainerObject(bindKeysList[i].toUpperCase(), props);
                containerObj.func = fn;
                if(!keyCodeActionTable[containerObj.uniqKeyword]){
                    keyCodeActionTable[containerObj.uniqKeyword] = [];
                }
                keyCodeActionTable[containerObj.uniqKeyword].push(containerObj);
            }

        },
        off : function(bindKeys, props){
            var containerObj;
            var bindKeysList;

            if(!props){
                props = Object.create(null);
            }
            hashUpdate(defaultOnMethodOption, props);

            bindKeysList = bindKeys.replace(/^\s+|\s+$/g, "").split(/[\s]+/);
            for (var i = 0, imax = bindKeysList.length; i < imax; i++) {
                containerObj = getBindCodeContainerObject(bindKeysList[i].toUpperCase(), props);
                if(keyCodeActionTable[containerObj.uniqKeyword]){
                    keyCodeActionTable[containerObj.uniqKeyword].pop();
                }
            }
        }
    };

    // ***********************
    // Private functions
    function keyEventControl(e){
        var i, imax;
        var eventType = e.type;
        var keycode = getEventkeyCode(e, eventType);
        var uniqKeyword = getUniqkeyword(e, String.fromCharCode(keycode), eventType);

        if(keyCodeActionTable[uniqKeyword]){
            for(i=0, imax=keyCodeActionTable[uniqKeyword].length; i<imax; i++){
                if(keyCodeActionTable[uniqKeyword][i].emitState === EmitState.before_emit){
                    executeContainerObjs.push(keyCodeActionTable[uniqKeyword][i]);
                }
            }
        }

        for(i=0, imax=executeContainerObjs.length; i<imax; i++){
            if(executeContainerObjs[i].emitState === EmitState.before_emit ||
                eventType === "keypress" && executeContainerObjs[i].eventType === "keypress"){
                executeContainerObjs[i].func(e);
                if(executeContainerObjs[i].preventDefault === true){
                    if(e.preventDefault){
                        e.preventDefault();
                    }else{
                        e.returnValue = false;
                    }
                }
                if(executeContainerObjs[i].stopPropagation === true){
                    if(e.stopPropagation){
                        e.stopPropagation();
                    }else{
                        e.cancelBubble = false;
                    }
                }
            }
            executeContainerObjs[i].emitState = EmitState.after_emit;
        }
        if(eventType === "keyup"){
            for(i=0, imax=executeContainerObjs.length; i<imax; i++){
                executeContainerObjs[i].emitState = EmitState.before_emit;
            }
            executeContainerObjs = [];
        }
    }
    function getBindCodeContainerObject(bindKey, props){
        var obj = Object.create(null);
        hashUpdate({keyword:null,
            keywordCode:-1,
            shiftKey: false,
            altKey: false,
            ctrlKey: false,
            uniqKeyword: "",
            emitState: EmitState.before_emit
        },obj);
        hashUpdate(props, obj);

        var keywordList = bindKey.split(/[\+]+/);
        for(var i=0, imax=keywordList.length; i<imax; i++){
            var keyword = keywordList[i];
            var keywordCode = getKeyCode(keyword);
            if(keywordCode && obj.keyCode === undefined){
                obj.keyword = keyword;
                obj.keywordCode = keywordCode;
            }
            switch(keyword){
                case "SHIFT":
                    obj.shiftKey = true;
                    break;
                case "CTRL":
                    obj.ctrlKey = true;
                    break;
                case "ALT":
                    obj.altKey = true;
                    break;
            }
        }
        obj.uniqKeyword = getUniqkeyword(obj, obj.keyword, props.eventType);

        return obj;
    }
    function getUniqkeyword(obj, keyword, evenTtype){
        return (obj.shiftKey === true ? "1" : "0") +
            (obj.altKey === true ? "1" : "0") +
            (obj.ctrlKey === true ? "1" : "0") +
            keyword + evenTtype;
    }
    function toArray(arr){
        return Array.prototype.slice.call(arr);
    }
    function byId(id){
        return document.getElementByid(id);
    }
    function $(qs){
        return document.querySelector(qs);
    }
    function $$(qs){
        return toArray(document.querySelectorAll(qs));
    }
    function bind(type, fn){
        if(window.addEventListener){
            window.addEventListener(type, fn, false);
        }else if(window.attachEvent){
            window.attachEvent("on" + type, fn);
        }
    }
    function unbind(type, fn){
        if(window.removeEventListener){
            window.removeEventListener(type, fn, false);
        }else if(window.detachEvent){
            window.detachEvent("on" + type, fn);
        }
    }
    function getDataType(data){
        return class2type[Object.prototype.toString.call(data)];
    }
    function getEventkeyCode(e, eventType){
        var keycode = e.keyCode;
        if(eventType === "keypress"){
            keycode = getKeyCode(String.fromCharCode(e.charCode).toUpperCase());
        }
        return keycode;
    }
    function getKeyCode(ascii){
        var code = keyCodes[ascii];
        if(code){ return code; }
        return null;
    }
    function hashUpdate(from, to){
        if(getDataType(to) !== "object"){
            throw new TypeError("Argument must be an object. [" + to.toString() + "]");
        }
        for(var i in from){
            if(Object.prototype.hasOwnProperty.call(from, i)){
                if(!Object.prototype.hasOwnProperty.call(to, i)){
                    to[i] = from[i];
                }
            }
        }
    }

    // ****************************
    // Execute in this context;
    // ****************************
    (function(){
        var classList = "Boolean Number String Function Array Date RegExp Object".split(" ");
        for(var i=0, imax=classList.length; i<imax; i++){
            class2type[ "[object " + classList[i] + "]" ] = classList[i].toLowerCase();
        }
    })();

    (function() {
        var codeList;
        codeList = [
            ["0".charCodeAt(0), "9".charCodeAt(0)],
            ["A".charCodeAt(0), "Z".charCodeAt(0)]
        ];
        for(var i=0,imax=codeList.length; i<imax; i++){
            for (var j = codeList[i][0]; j <= codeList[i][1]; j++) {
                keyCodes[String.fromCharCode(j)] = j;
            }
        }
        keyCodes["SPACE"] = 32;
        keyCodes["LEFT"] = 37;
        keyCodes["UP"] = 38;
        keyCodes["RIGHT"] = 39;
        keyCodes["DOWN"] = 40;

        keyCodes["COMMA"] = 188;
        keyCodes["PERIOD"] = 190;
        keyCodes["FORWARD_SLASH"] = 191;
    })();

    (function(){
        defaultOnMethodOption['eventType'] = 'keydown';
        defaultOnMethodOption['preventDefault'] = false;
        defaultOnMethodOption['stopPropagation'] = false;
    })();

    (function(){
        library.start();
    })();
})(window);