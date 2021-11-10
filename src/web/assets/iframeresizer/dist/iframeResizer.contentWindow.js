!function(undefined){if("undefined"!=typeof window){var autoResize=!0,base=10,bodyBackground="",bodyMargin=0,bodyMarginStr="",bodyObserver=null,bodyPadding="",calculateWidth=!1,doubleEventList={resize:1,click:1},eventCancelTimer=128,firstRun=!0,height=1,heightCalcModeDefault="bodyOffset",heightCalcMode="bodyOffset",initLock=!0,initMsg="",inPageLinks={},interval=32,intervalTimer=null,logging=!1,mouseEvents=!1,msgID="[iFrameSizer]",msgIdLen=msgID.length,myID="",resetRequiredMethods={max:1,min:1,bodyScroll:1,documentElementScroll:1},resizeFrom="child",sendPermit=!0,target=window.parent,targetOriginDefault="*",tolerance=0,triggerLocked=!1,triggerLockedTimer=null,throttledTimer=16,width=1,widthCalcModeDefault="scroll",widthCalcMode="scroll",win=window,onMessage=function(){warn("onMessage function not defined")},onReady=function(){},onPageInfo=function(){},customCalcMethods={height:function(){return warn("Custom height calculation function not defined"),document.documentElement.offsetHeight},width:function(){return warn("Custom width calculation function not defined"),document.body.scrollWidth}},eventHandlersByName={},passiveSupported=!1;try{var options=Object.create({},{passive:{get:function(){passiveSupported=!0}}});window.addEventListener("test",noop,options),window.removeEventListener("test",noop,options)}catch(error){}var getHeight={bodyOffset:function getBodyOffsetHeight(){return document.body.offsetHeight+getComputedStyle("marginTop")+getComputedStyle("marginBottom")},offset:function(){return getHeight.bodyOffset()},bodyScroll:function getBodyScrollHeight(){return document.body.scrollHeight},custom:function getCustomWidth(){return customCalcMethods.height()},documentElementOffset:function getDEOffsetHeight(){return document.documentElement.offsetHeight},documentElementScroll:function getDEScrollHeight(){return document.documentElement.scrollHeight},max:function getMaxHeight(){return Math.max.apply(null,getAllMeasurements(getHeight))},min:function getMinHeight(){return Math.min.apply(null,getAllMeasurements(getHeight))},grow:function growHeight(){return getHeight.max()},lowestElement:function getBestHeight(){return Math.max(getHeight.bodyOffset()||getHeight.documentElementOffset(),getMaxElement("bottom",getAllElements()))},taggedElement:function getTaggedElementsHeight(){return getTaggedElements("bottom","data-iframe-height")}},getWidth={bodyScroll:function getBodyScrollWidth(){return document.body.scrollWidth},bodyOffset:function getBodyOffsetWidth(){return document.body.offsetWidth},custom:function getCustomWidth(){return customCalcMethods.width()},documentElementScroll:function getDEScrollWidth(){return document.documentElement.scrollWidth},documentElementOffset:function getDEOffsetWidth(){return document.documentElement.offsetWidth},scroll:function getMaxWidth(){return Math.max(getWidth.bodyScroll(),getWidth.documentElementScroll())},max:function getMaxWidth(){return Math.max.apply(null,getAllMeasurements(getWidth))},min:function getMinWidth(){return Math.min.apply(null,getAllMeasurements(getWidth))},rightMostElement:function rightMostElement(){return getMaxElement("right",getAllElements())},taggedElement:function getTaggedElementsWidth(){return getTaggedElements("right","data-iframe-width")}},sizeIFrameThrottled=throttle(sizeIFrame);addEventListener(window,"message",receiver),addEventListener(window,"readystatechange",chkLateLoaded),chkLateLoaded()}function noop(){}function addEventListener(el,evt,func,options){el.addEventListener(evt,func,!!passiveSupported&&(options||{}))}function removeEventListener(el,evt,func){el.removeEventListener(evt,func,!1)}function capitalizeFirstLetter(string){return string.charAt(0).toUpperCase()+string.slice(1)}function throttle(func){var context,args,result,timeout=null,previous=0,later=function(){previous=Date.now(),timeout=null,result=func.apply(context,args),timeout||(context=args=null)};return function(){var now=Date.now();previous||(previous=now);var remaining=throttledTimer-(now-previous);return context=this,args=arguments,remaining<=0||remaining>throttledTimer?(timeout&&(clearTimeout(timeout),timeout=null),previous=now,result=func.apply(context,args),timeout||(context=args=null)):timeout||(timeout=setTimeout(later,remaining)),result}}function formatLogMsg(msg){return msgID+"["+myID+"] "+msg}function log(msg){logging&&"object"==typeof window.console&&console.log(formatLogMsg(msg))}function warn(msg){"object"==typeof window.console&&console.warn(formatLogMsg(msg))}function init(){readDataFromParent(),log("Initialising iFrame ("+window.location.href+")"),readDataFromPage(),setMargin(),setBodyStyle("background",bodyBackground),setBodyStyle("padding",bodyPadding),injectClearFixIntoBodyElement(),checkHeightMode(),checkWidthMode(),stopInfiniteResizingOfIFrame(),setupPublicMethods(),setupMouseEvents(),startEventListeners(),inPageLinks=setupInPageLinks(),sendSize("init","Init message from host page"),onReady()}function readDataFromParent(){function strBool(str){return"true"===str}var data=initMsg.substr(msgIdLen).split(":");myID=data[0],bodyMargin=void 0!==data[1]?Number(data[1]):bodyMargin,calculateWidth=void 0!==data[2]?strBool(data[2]):calculateWidth,logging=void 0!==data[3]?strBool(data[3]):logging,interval=void 0!==data[4]?Number(data[4]):interval,autoResize=void 0!==data[6]?strBool(data[6]):autoResize,bodyMarginStr=data[7],heightCalcMode=void 0!==data[8]?data[8]:heightCalcMode,bodyBackground=data[9],bodyPadding=data[10],tolerance=void 0!==data[11]?Number(data[11]):tolerance,inPageLinks.enable=void 0!==data[12]&&strBool(data[12]),resizeFrom=void 0!==data[13]?data[13]:resizeFrom,widthCalcMode=void 0!==data[14]?data[14]:widthCalcMode,mouseEvents=void 0!==data[15]?Boolean(data[15]):mouseEvents}function depricate(key){var splitName=key.split("Callback");if(2===splitName.length){var name="on"+splitName[0].charAt(0).toUpperCase()+splitName[0].slice(1);this[name]=this[key],delete this[key],warn("Deprecated: '"+key+"' has been renamed '"+name+"'. The old method will be removed in the next major version.")}}function readDataFromPage(){function readData(){var data=window.iFrameResizer;log("Reading data from page: "+JSON.stringify(data)),Object.keys(data).forEach(depricate,data),onMessage="onMessage"in data?data.onMessage:onMessage,onReady="onReady"in data?data.onReady:onReady,targetOriginDefault="targetOrigin"in data?data.targetOrigin:targetOriginDefault,heightCalcMode="heightCalculationMethod"in data?data.heightCalculationMethod:heightCalcMode,widthCalcMode="widthCalculationMethod"in data?data.widthCalculationMethod:widthCalcMode}function setupCustomCalcMethods(calcMode,calcFunc){return"function"==typeof calcMode&&(log("Setup custom "+calcFunc+"CalcMethod"),customCalcMethods[calcFunc]=calcMode,calcMode="custom"),calcMode}"iFrameResizer"in window&&Object===window.iFrameResizer.constructor&&(readData(),heightCalcMode=setupCustomCalcMethods(heightCalcMode,"height"),widthCalcMode=setupCustomCalcMethods(widthCalcMode,"width")),log("TargetOrigin for parent set to: "+targetOriginDefault)}function chkCSS(attr,value){return-1!==value.indexOf("-")&&(warn("Negative CSS value ignored for "+attr),value=""),value}function setBodyStyle(attr,value){void 0!==value&&""!==value&&"null"!==value&&(document.body.style[attr]=value,log("Body "+attr+' set to "'+value+'"'))}function setMargin(){void 0===bodyMarginStr&&(bodyMarginStr=bodyMargin+"px"),setBodyStyle("margin",chkCSS("margin",bodyMarginStr))}function stopInfiniteResizingOfIFrame(){document.documentElement.style.height="",document.body.style.height="",log('HTML & body height set to "auto"')}function manageTriggerEvent(options){var listener={add:function(eventName){function handleEvent(){sendSize(options.eventName,options.eventType)}eventHandlersByName[eventName]=handleEvent,addEventListener(window,eventName,handleEvent,{passive:!0})},remove:function(eventName){var handleEvent=eventHandlersByName[eventName];delete eventHandlersByName[eventName],removeEventListener(window,eventName,handleEvent)}};options.eventNames&&Array.prototype.map?(options.eventName=options.eventNames[0],options.eventNames.map(listener[options.method])):listener[options.method](options.eventName),log(capitalizeFirstLetter(options.method)+" event listener: "+options.eventType)}function manageEventListeners(method){manageTriggerEvent({method:method,eventType:"Animation Start",eventNames:["animationstart","webkitAnimationStart"]}),manageTriggerEvent({method:method,eventType:"Animation Iteration",eventNames:["animationiteration","webkitAnimationIteration"]}),manageTriggerEvent({method:method,eventType:"Animation End",eventNames:["animationend","webkitAnimationEnd"]}),manageTriggerEvent({method:method,eventType:"Input",eventName:"input"}),manageTriggerEvent({method:method,eventType:"Mouse Up",eventName:"mouseup"}),manageTriggerEvent({method:method,eventType:"Mouse Down",eventName:"mousedown"}),manageTriggerEvent({method:method,eventType:"Orientation Change",eventName:"orientationchange"}),manageTriggerEvent({method:method,eventType:"Print",eventName:["afterprint","beforeprint"]}),manageTriggerEvent({method:method,eventType:"Ready State Change",eventName:"readystatechange"}),manageTriggerEvent({method:method,eventType:"Touch Start",eventName:"touchstart"}),manageTriggerEvent({method:method,eventType:"Touch End",eventName:"touchend"}),manageTriggerEvent({method:method,eventType:"Touch Cancel",eventName:"touchcancel"}),manageTriggerEvent({method:method,eventType:"Transition Start",eventNames:["transitionstart","webkitTransitionStart","MSTransitionStart","oTransitionStart","otransitionstart"]}),manageTriggerEvent({method:method,eventType:"Transition Iteration",eventNames:["transitioniteration","webkitTransitionIteration","MSTransitionIteration","oTransitionIteration","otransitioniteration"]}),manageTriggerEvent({method:method,eventType:"Transition End",eventNames:["transitionend","webkitTransitionEnd","MSTransitionEnd","oTransitionEnd","otransitionend"]}),"child"===resizeFrom&&manageTriggerEvent({method:method,eventType:"IFrame Resized",eventName:"resize"})}function checkCalcMode(calcMode,calcModeDefault,modes,type){return calcModeDefault!==calcMode&&(calcMode in modes||(warn(calcMode+" is not a valid option for "+type+"CalculationMethod."),calcMode=calcModeDefault),log(type+' calculation method set to "'+calcMode+'"')),calcMode}function checkHeightMode(){heightCalcMode=checkCalcMode(heightCalcMode,"bodyOffset",getHeight,"height")}function checkWidthMode(){widthCalcMode=checkCalcMode(widthCalcMode,"scroll",getWidth,"width")}function startEventListeners(){!0===autoResize?(manageEventListeners("add"),setupMutationObserver()):log("Auto Resize disabled")}function disconnectMutationObserver(){null!==bodyObserver&&bodyObserver.disconnect()}function stopEventListeners(){manageEventListeners("remove"),disconnectMutationObserver(),clearInterval(intervalTimer)}function injectClearFixIntoBodyElement(){var clearFix=document.createElement("div");clearFix.style.clear="both",clearFix.style.display="block",clearFix.style.height="0",document.body.appendChild(clearFix)}function setupInPageLinks(){function getPagePosition(){return{x:void 0!==window.pageXOffset?window.pageXOffset:document.documentElement.scrollLeft,y:void 0!==window.pageYOffset?window.pageYOffset:document.documentElement.scrollTop}}function getElementPosition(el){var elPosition=el.getBoundingClientRect(),pagePosition=getPagePosition();return{x:parseInt(elPosition.left,10)+parseInt(pagePosition.x,10),y:parseInt(elPosition.top,10)+parseInt(pagePosition.y,10)}}function findTarget(location){function jumpToTarget(target){var jumpPosition=getElementPosition(target);log("Moving to in page link (#"+hash+") at x: "+jumpPosition.x+" y: "+jumpPosition.y),sendMsg(jumpPosition.y,jumpPosition.x,"scrollToOffset")}var hash=location.split("#")[1]||location,hashData=decodeURIComponent(hash),target=document.getElementById(hashData)||document.getElementsByName(hashData)[0];void 0!==target?jumpToTarget(target):(log("In page link (#"+hash+") not found in iFrame, so sending to parent"),sendMsg(0,0,"inPageLink","#"+hash))}function checkLocationHash(){var hash=window.location.hash,href=window.location.href;""!==hash&&"#"!==hash&&findTarget(href)}function bindAnchors(){function setupLink(el){function linkClicked(e){e.preventDefault(),findTarget(this.getAttribute("href"))}"#"!==el.getAttribute("href")&&addEventListener(el,"click",linkClicked)}Array.prototype.forEach.call(document.querySelectorAll('a[href^="#"]'),setupLink)}function bindLocationHash(){addEventListener(window,"hashchange",checkLocationHash)}function initCheck(){setTimeout(checkLocationHash,128)}function enableInPageLinks(){Array.prototype.forEach&&document.querySelectorAll?(log("Setting up location.hash handlers"),bindAnchors(),bindLocationHash(),initCheck()):warn("In page linking not fully supported in this browser! (See README.md for IE8 workaround)")}return inPageLinks.enable?enableInPageLinks():log("In page linking not enabled"),{findTarget:findTarget}}function setupMouseEvents(){function sendMouse(e){sendMsg(0,0,e.type,e.screenY+":"+e.screenX)}function addMouseListener(evt,name){log("Add event listener: "+name),addEventListener(window.document,evt,sendMouse)}!0===mouseEvents&&(addMouseListener("mouseenter","Mouse Enter"),addMouseListener("mouseleave","Mouse Leave"))}function setupPublicMethods(){log("Enable public methods"),win.parentIFrame={autoResize:function autoResizeF(resize){return!0===resize&&!1===autoResize?(autoResize=!0,startEventListeners()):!1===resize&&!0===autoResize&&(autoResize=!1,stopEventListeners()),sendMsg(0,0,"autoResize",JSON.stringify(autoResize)),autoResize},close:function closeF(){sendMsg(0,0,"close")},getId:function getIdF(){return myID},getPageInfo:function getPageInfoF(callback){"function"==typeof callback?(onPageInfo=callback,sendMsg(0,0,"pageInfo")):(onPageInfo=function(){},sendMsg(0,0,"pageInfoStop"))},moveToAnchor:function moveToAnchorF(hash){inPageLinks.findTarget(hash)},reset:function resetF(){resetIFrame("parentIFrame.reset")},scrollTo:function scrollToF(x,y){sendMsg(y,x,"scrollTo")},scrollToOffset:function scrollToF(x,y){sendMsg(y,x,"scrollToOffset")},sendMessage:function sendMessageF(msg,targetOrigin){sendMsg(0,0,"message",JSON.stringify(msg),targetOrigin)},setHeightCalculationMethod:function setHeightCalculationMethodF(heightCalculationMethod){heightCalcMode=heightCalculationMethod,checkHeightMode()},setWidthCalculationMethod:function setWidthCalculationMethodF(widthCalculationMethod){widthCalcMode=widthCalculationMethod,checkWidthMode()},setTargetOrigin:function setTargetOriginF(targetOrigin){log("Set targetOrigin: "+targetOrigin),targetOriginDefault=targetOrigin},size:function sizeF(customHeight,customWidth){var valString;sendSize("size","parentIFrame.size("+((customHeight||"")+(customWidth?","+customWidth:""))+")",customHeight,customWidth)}}}function initInterval(){0!==interval&&(log("setInterval: "+interval+"ms"),intervalTimer=setInterval((function(){sendSize("interval","setInterval: "+interval)}),Math.abs(interval)))}function setupBodyMutationObserver(){function addImageLoadListners(mutation){function addImageLoadListener(element){!1===element.complete&&(log("Attach listeners to "+element.src),element.addEventListener("load",imageLoaded,!1),element.addEventListener("error",imageError,!1),elements.push(element))}"attributes"===mutation.type&&"src"===mutation.attributeName?addImageLoadListener(mutation.target):"childList"===mutation.type&&Array.prototype.forEach.call(mutation.target.querySelectorAll("img"),addImageLoadListener)}function removeFromArray(element){elements.splice(elements.indexOf(element),1)}function removeImageLoadListener(element){log("Remove listeners from "+element.src),element.removeEventListener("load",imageLoaded,!1),element.removeEventListener("error",imageError,!1),removeFromArray(element)}function imageEventTriggered(event,type,typeDesc){removeImageLoadListener(event.target),sendSize(type,typeDesc+": "+event.target.src)}function imageLoaded(event){imageEventTriggered(event,"imageLoad","Image loaded")}function imageError(event){imageEventTriggered(event,"imageLoadFailed","Image load failed")}function mutationObserved(mutations){sendSize("mutationObserver","mutationObserver: "+mutations[0].target+" "+mutations[0].type),mutations.forEach(addImageLoadListners)}function createMutationObserver(){var target=document.querySelector("body"),config={attributes:!0,attributeOldValue:!1,characterData:!0,characterDataOldValue:!1,childList:!0,subtree:!0};return observer=new MutationObserver(mutationObserved),log("Create body MutationObserver"),observer.observe(target,config),observer}var elements=[],MutationObserver=window.MutationObserver||window.WebKitMutationObserver,observer=createMutationObserver();return{disconnect:function(){"disconnect"in observer&&(log("Disconnect body MutationObserver"),observer.disconnect(),elements.forEach(removeImageLoadListener))}}}function setupMutationObserver(){var forceIntervalTimer=0>interval;window.MutationObserver||window.WebKitMutationObserver?forceIntervalTimer?initInterval():bodyObserver=setupBodyMutationObserver():(log("MutationObserver not supported in this browser!"),initInterval())}function getComputedStyle(prop,el){var retVal=0;return el=el||document.body,retVal=null!==(retVal=document.defaultView.getComputedStyle(el,null))?retVal[prop]:0,parseInt(retVal,10)}function chkEventThottle(timer){timer>throttledTimer/2&&log("Event throttle increased to "+(throttledTimer=2*timer)+"ms")}function getMaxElement(side,elements){for(var elementsLength=elements.length,elVal=0,maxVal=0,Side=capitalizeFirstLetter(side),timer=Date.now(),i=0;i<elementsLength;i++)(elVal=elements[i].getBoundingClientRect()[side]+getComputedStyle("margin"+Side,elements[i]))>maxVal&&(maxVal=elVal);return timer=Date.now()-timer,log("Parsed "+elementsLength+" HTML elements"),log("Element position calculated in "+timer+"ms"),chkEventThottle(timer),maxVal}function getAllMeasurements(dimensions){return[dimensions.bodyOffset(),dimensions.bodyScroll(),dimensions.documentElementOffset(),dimensions.documentElementScroll()]}function getTaggedElements(side,tag){function noTaggedElementsFound(){return warn("No tagged elements ("+tag+") found on page"),document.querySelectorAll("body *")}var elements=document.querySelectorAll("["+tag+"]");return 0===elements.length&&noTaggedElementsFound(),getMaxElement(side,elements)}function getAllElements(){return document.querySelectorAll("body *")}function sizeIFrame(triggerEvent,triggerEventDesc,customHeight,customWidth){function resizeIFrame(){sendMsg(height=currentHeight,width=currentWidth,triggerEvent)}function isSizeChangeDetected(){function checkTolarance(a,b){var retVal;return!(Math.abs(a-b)<=tolerance)}return currentHeight=void 0!==customHeight?customHeight:getHeight[heightCalcMode](),currentWidth=void 0!==customWidth?customWidth:getWidth[widthCalcMode](),checkTolarance(height,currentHeight)||calculateWidth&&checkTolarance(width,currentWidth)}function isForceResizableEvent(){return!(triggerEvent in{init:1,interval:1,size:1})}function isForceResizableCalcMode(){return heightCalcMode in resetRequiredMethods||calculateWidth&&widthCalcMode in resetRequiredMethods}function logIgnored(){log("No change in size detected")}function checkDownSizing(){isForceResizableEvent()&&isForceResizableCalcMode()?resetIFrame(triggerEventDesc):triggerEvent in{interval:1}||logIgnored()}var currentHeight,currentWidth;isSizeChangeDetected()||"init"===triggerEvent?(lockTrigger(),resizeIFrame()):checkDownSizing()}function sendSize(triggerEvent,triggerEventDesc,customHeight,customWidth){function recordTrigger(){triggerEvent in{reset:1,resetPage:1,init:1}||log("Trigger event: "+triggerEventDesc)}function isDoubleFiredEvent(){return triggerLocked&&triggerEvent in doubleEventList}isDoubleFiredEvent()?log("Trigger event cancelled: "+triggerEvent):(recordTrigger(),"init"===triggerEvent?sizeIFrame(triggerEvent,triggerEventDesc,customHeight,customWidth):sizeIFrameThrottled(triggerEvent,triggerEventDesc,customHeight,customWidth))}function lockTrigger(){triggerLocked||(triggerLocked=!0,log("Trigger event lock on")),clearTimeout(triggerLockedTimer),triggerLockedTimer=setTimeout((function(){triggerLocked=!1,log("Trigger event lock off"),log("--")}),128)}function triggerReset(triggerEvent){height=getHeight[heightCalcMode](),width=getWidth[widthCalcMode](),sendMsg(height,width,triggerEvent)}function resetIFrame(triggerEventDesc){var hcm=heightCalcMode;heightCalcMode="bodyOffset",log("Reset trigger event: "+triggerEventDesc),lockTrigger(),triggerReset("reset"),heightCalcMode=hcm}function sendMsg(height,width,triggerEvent,msg,targetOrigin){function setTargetOrigin(){void 0===targetOrigin?targetOrigin=targetOriginDefault:log("Message targetOrigin: "+targetOrigin)}function sendToParent(){var size,message=myID+":"+(height+":"+width)+":"+triggerEvent+(void 0!==msg?":"+msg:"");log("Sending message to host page ("+message+")"),target.postMessage(msgID+message,targetOrigin)}setTargetOrigin(),sendToParent()}function receiver(event){var processRequestFromParent={init:function initFromParent(){initMsg=event.data,target=event.source,init(),firstRun=!1,setTimeout((function(){initLock=!1}),128)},reset:function resetFromParent(){initLock?log("Page reset ignored by init"):(log("Page size reset by host page"),triggerReset("resetPage"))},resize:function resizeFromParent(){sendSize("resizeParent","Parent window requested size check")},moveToAnchor:function moveToAnchorF(){inPageLinks.findTarget(getData())},inPageLink:function inPageLinkF(){this.moveToAnchor()},pageInfo:function pageInfoFromParent(){var msgBody=getData();log("PageInfoFromParent called from parent: "+msgBody),onPageInfo(JSON.parse(msgBody)),log(" --")},message:function messageFromParent(){var msgBody=getData();log("onMessage called from parent: "+msgBody),onMessage(JSON.parse(msgBody)),log(" --")}};function isMessageForUs(){return msgID===(""+event.data).substr(0,msgIdLen)}function getMessageType(){return event.data.split("]")[1].split(":")[0]}function getData(){return event.data.substr(event.data.indexOf(":")+1)}function isMiddleTier(){return!("undefined"!=typeof module&&module.exports)&&"iFrameResize"in window||"jQuery"in window&&"iFrameResize"in window.jQuery.prototype}function isInitMsg(){return event.data.split(":")[2]in{true:1,false:1}}function callFromParent(){var messageType=getMessageType();messageType in processRequestFromParent?processRequestFromParent[messageType]():isMiddleTier()||isInitMsg()||warn("Unexpected message ("+event.data+")")}function processMessage(){!1===firstRun?callFromParent():isInitMsg()?processRequestFromParent.init():log('Ignored message of type "'+getMessageType()+'". Received before initialization.')}isMessageForUs()&&processMessage()}function chkLateLoaded(){"loading"!==document.readyState&&window.parent.postMessage("[iFrameResizerChild]Ready","*")}}();