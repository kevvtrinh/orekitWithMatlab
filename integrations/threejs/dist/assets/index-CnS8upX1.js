(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))r(o);new MutationObserver(o=>{for(const l of o)if(l.type==="childList")for(const c of l.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&r(c)}).observe(document,{childList:!0,subtree:!0});function t(o){const l={};return o.integrity&&(l.integrity=o.integrity),o.referrerPolicy&&(l.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?l.credentials="include":o.crossOrigin==="anonymous"?l.credentials="omit":l.credentials="same-origin",l}function r(o){if(o.ep)return;o.ep=!0;const l=t(o);fetch(o.href,l)}})();function ov(s){return s&&s.__esModule&&Object.prototype.hasOwnProperty.call(s,"default")?s.default:s}var Qc={exports:{}},mt={};/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var Mm;function lv(){if(Mm)return mt;Mm=1;var s=Symbol.for("react.element"),e=Symbol.for("react.portal"),t=Symbol.for("react.fragment"),r=Symbol.for("react.strict_mode"),o=Symbol.for("react.profiler"),l=Symbol.for("react.provider"),c=Symbol.for("react.context"),d=Symbol.for("react.forward_ref"),p=Symbol.for("react.suspense"),m=Symbol.for("react.memo"),x=Symbol.for("react.lazy"),y=Symbol.iterator;function g(F){return F===null||typeof F!="object"?null:(F=y&&F[y]||F["@@iterator"],typeof F=="function"?F:null)}var M={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},E=Object.assign,R={};function v(F,Z,Ne){this.props=F,this.context=Z,this.refs=R,this.updater=Ne||M}v.prototype.isReactComponent={},v.prototype.setState=function(F,Z){if(typeof F!="object"&&typeof F!="function"&&F!=null)throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,F,Z,"setState")},v.prototype.forceUpdate=function(F){this.updater.enqueueForceUpdate(this,F,"forceUpdate")};function _(){}_.prototype=v.prototype;function b(F,Z,Ne){this.props=F,this.context=Z,this.refs=R,this.updater=Ne||M}var N=b.prototype=new _;N.constructor=b,E(N,v.prototype),N.isPureReactComponent=!0;var C=Array.isArray,I=Object.prototype.hasOwnProperty,P={current:null},O={key:!0,ref:!0,__self:!0,__source:!0};function T(F,Z,Ne){var qe,ke={},ie=null,_e=null;if(Z!=null)for(qe in Z.ref!==void 0&&(_e=Z.ref),Z.key!==void 0&&(ie=""+Z.key),Z)I.call(Z,qe)&&!O.hasOwnProperty(qe)&&(ke[qe]=Z[qe]);var he=arguments.length-2;if(he===1)ke.children=Ne;else if(1<he){for(var Ie=Array(he),Je=0;Je<he;Je++)Ie[Je]=arguments[Je+2];ke.children=Ie}if(F&&F.defaultProps)for(qe in he=F.defaultProps,he)ke[qe]===void 0&&(ke[qe]=he[qe]);return{$$typeof:s,type:F,key:ie,ref:_e,props:ke,_owner:P.current}}function D(F,Z){return{$$typeof:s,type:F.type,key:Z,ref:F.ref,props:F.props,_owner:F._owner}}function z(F){return typeof F=="object"&&F!==null&&F.$$typeof===s}function k(F){var Z={"=":"=0",":":"=2"};return"$"+F.replace(/[=:]/g,function(Ne){return Z[Ne]})}var K=/\/+/g;function ce(F,Z){return typeof F=="object"&&F!==null&&F.key!=null?k(""+F.key):Z.toString(36)}function me(F,Z,Ne,qe,ke){var ie=typeof F;(ie==="undefined"||ie==="boolean")&&(F=null);var _e=!1;if(F===null)_e=!0;else switch(ie){case"string":case"number":_e=!0;break;case"object":switch(F.$$typeof){case s:case e:_e=!0}}if(_e)return _e=F,ke=ke(_e),F=qe===""?"."+ce(_e,0):qe,C(ke)?(Ne="",F!=null&&(Ne=F.replace(K,"$&/")+"/"),me(ke,Z,Ne,"",function(Je){return Je})):ke!=null&&(z(ke)&&(ke=D(ke,Ne+(!ke.key||_e&&_e.key===ke.key?"":(""+ke.key).replace(K,"$&/")+"/")+F)),Z.push(ke)),1;if(_e=0,qe=qe===""?".":qe+":",C(F))for(var he=0;he<F.length;he++){ie=F[he];var Ie=qe+ce(ie,he);_e+=me(ie,Z,Ne,Ie,ke)}else if(Ie=g(F),typeof Ie=="function")for(F=Ie.call(F),he=0;!(ie=F.next()).done;)ie=ie.value,Ie=qe+ce(ie,he++),_e+=me(ie,Z,Ne,Ie,ke);else if(ie==="object")throw Z=String(F),Error("Objects are not valid as a React child (found: "+(Z==="[object Object]"?"object with keys {"+Object.keys(F).join(", ")+"}":Z)+"). If you meant to render a collection of children, use an array instead.");return _e}function Q(F,Z,Ne){if(F==null)return F;var qe=[],ke=0;return me(F,qe,"","",function(ie){return Z.call(Ne,ie,ke++)}),qe}function ue(F){if(F._status===-1){var Z=F._result;Z=Z(),Z.then(function(Ne){(F._status===0||F._status===-1)&&(F._status=1,F._result=Ne)},function(Ne){(F._status===0||F._status===-1)&&(F._status=2,F._result=Ne)}),F._status===-1&&(F._status=0,F._result=Z)}if(F._status===1)return F._result.default;throw F._result}var $={current:null},Y={transition:null},ae={ReactCurrentDispatcher:$,ReactCurrentBatchConfig:Y,ReactCurrentOwner:P};function oe(){throw Error("act(...) is not supported in production builds of React.")}return mt.Children={map:Q,forEach:function(F,Z,Ne){Q(F,function(){Z.apply(this,arguments)},Ne)},count:function(F){var Z=0;return Q(F,function(){Z++}),Z},toArray:function(F){return Q(F,function(Z){return Z})||[]},only:function(F){if(!z(F))throw Error("React.Children.only expected to receive a single React element child.");return F}},mt.Component=v,mt.Fragment=t,mt.Profiler=o,mt.PureComponent=b,mt.StrictMode=r,mt.Suspense=p,mt.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=ae,mt.act=oe,mt.cloneElement=function(F,Z,Ne){if(F==null)throw Error("React.cloneElement(...): The argument must be a React element, but you passed "+F+".");var qe=E({},F.props),ke=F.key,ie=F.ref,_e=F._owner;if(Z!=null){if(Z.ref!==void 0&&(ie=Z.ref,_e=P.current),Z.key!==void 0&&(ke=""+Z.key),F.type&&F.type.defaultProps)var he=F.type.defaultProps;for(Ie in Z)I.call(Z,Ie)&&!O.hasOwnProperty(Ie)&&(qe[Ie]=Z[Ie]===void 0&&he!==void 0?he[Ie]:Z[Ie])}var Ie=arguments.length-2;if(Ie===1)qe.children=Ne;else if(1<Ie){he=Array(Ie);for(var Je=0;Je<Ie;Je++)he[Je]=arguments[Je+2];qe.children=he}return{$$typeof:s,type:F.type,key:ke,ref:ie,props:qe,_owner:_e}},mt.createContext=function(F){return F={$$typeof:c,_currentValue:F,_currentValue2:F,_threadCount:0,Provider:null,Consumer:null,_defaultValue:null,_globalName:null},F.Provider={$$typeof:l,_context:F},F.Consumer=F},mt.createElement=T,mt.createFactory=function(F){var Z=T.bind(null,F);return Z.type=F,Z},mt.createRef=function(){return{current:null}},mt.forwardRef=function(F){return{$$typeof:d,render:F}},mt.isValidElement=z,mt.lazy=function(F){return{$$typeof:x,_payload:{_status:-1,_result:F},_init:ue}},mt.memo=function(F,Z){return{$$typeof:m,type:F,compare:Z===void 0?null:Z}},mt.startTransition=function(F){var Z=Y.transition;Y.transition={};try{F()}finally{Y.transition=Z}},mt.unstable_act=oe,mt.useCallback=function(F,Z){return $.current.useCallback(F,Z)},mt.useContext=function(F){return $.current.useContext(F)},mt.useDebugValue=function(){},mt.useDeferredValue=function(F){return $.current.useDeferredValue(F)},mt.useEffect=function(F,Z){return $.current.useEffect(F,Z)},mt.useId=function(){return $.current.useId()},mt.useImperativeHandle=function(F,Z,Ne){return $.current.useImperativeHandle(F,Z,Ne)},mt.useInsertionEffect=function(F,Z){return $.current.useInsertionEffect(F,Z)},mt.useLayoutEffect=function(F,Z){return $.current.useLayoutEffect(F,Z)},mt.useMemo=function(F,Z){return $.current.useMemo(F,Z)},mt.useReducer=function(F,Z,Ne){return $.current.useReducer(F,Z,Ne)},mt.useRef=function(F){return $.current.useRef(F)},mt.useState=function(F){return $.current.useState(F)},mt.useSyncExternalStore=function(F,Z,Ne){return $.current.useSyncExternalStore(F,Z,Ne)},mt.useTransition=function(){return $.current.useTransition()},mt.version="18.3.1",mt}var Em;function Hg(){return Em||(Em=1,Qc.exports=lv()),Qc.exports}var ui=Hg();const st=ov(ui);var Sl={},Jc={exports:{}},Xn={},jc={exports:{}},ef={};/**
 * @license React
 * scheduler.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var Tm;function uv(){return Tm||(Tm=1,function(s){function e(Y,ae){var oe=Y.length;Y.push(ae);e:for(;0<oe;){var F=oe-1>>>1,Z=Y[F];if(0<o(Z,ae))Y[F]=ae,Y[oe]=Z,oe=F;else break e}}function t(Y){return Y.length===0?null:Y[0]}function r(Y){if(Y.length===0)return null;var ae=Y[0],oe=Y.pop();if(oe!==ae){Y[0]=oe;e:for(var F=0,Z=Y.length,Ne=Z>>>1;F<Ne;){var qe=2*(F+1)-1,ke=Y[qe],ie=qe+1,_e=Y[ie];if(0>o(ke,oe))ie<Z&&0>o(_e,ke)?(Y[F]=_e,Y[ie]=oe,F=ie):(Y[F]=ke,Y[qe]=oe,F=qe);else if(ie<Z&&0>o(_e,oe))Y[F]=_e,Y[ie]=oe,F=ie;else break e}}return ae}function o(Y,ae){var oe=Y.sortIndex-ae.sortIndex;return oe!==0?oe:Y.id-ae.id}if(typeof performance=="object"&&typeof performance.now=="function"){var l=performance;s.unstable_now=function(){return l.now()}}else{var c=Date,d=c.now();s.unstable_now=function(){return c.now()-d}}var p=[],m=[],x=1,y=null,g=3,M=!1,E=!1,R=!1,v=typeof setTimeout=="function"?setTimeout:null,_=typeof clearTimeout=="function"?clearTimeout:null,b=typeof setImmediate<"u"?setImmediate:null;typeof navigator<"u"&&navigator.scheduling!==void 0&&navigator.scheduling.isInputPending!==void 0&&navigator.scheduling.isInputPending.bind(navigator.scheduling);function N(Y){for(var ae=t(m);ae!==null;){if(ae.callback===null)r(m);else if(ae.startTime<=Y)r(m),ae.sortIndex=ae.expirationTime,e(p,ae);else break;ae=t(m)}}function C(Y){if(R=!1,N(Y),!E)if(t(p)!==null)E=!0,ue(I);else{var ae=t(m);ae!==null&&$(C,ae.startTime-Y)}}function I(Y,ae){E=!1,R&&(R=!1,_(T),T=-1),M=!0;var oe=g;try{for(N(ae),y=t(p);y!==null&&(!(y.expirationTime>ae)||Y&&!k());){var F=y.callback;if(typeof F=="function"){y.callback=null,g=y.priorityLevel;var Z=F(y.expirationTime<=ae);ae=s.unstable_now(),typeof Z=="function"?y.callback=Z:y===t(p)&&r(p),N(ae)}else r(p);y=t(p)}if(y!==null)var Ne=!0;else{var qe=t(m);qe!==null&&$(C,qe.startTime-ae),Ne=!1}return Ne}finally{y=null,g=oe,M=!1}}var P=!1,O=null,T=-1,D=5,z=-1;function k(){return!(s.unstable_now()-z<D)}function K(){if(O!==null){var Y=s.unstable_now();z=Y;var ae=!0;try{ae=O(!0,Y)}finally{ae?ce():(P=!1,O=null)}}else P=!1}var ce;if(typeof b=="function")ce=function(){b(K)};else if(typeof MessageChannel<"u"){var me=new MessageChannel,Q=me.port2;me.port1.onmessage=K,ce=function(){Q.postMessage(null)}}else ce=function(){v(K,0)};function ue(Y){O=Y,P||(P=!0,ce())}function $(Y,ae){T=v(function(){Y(s.unstable_now())},ae)}s.unstable_IdlePriority=5,s.unstable_ImmediatePriority=1,s.unstable_LowPriority=4,s.unstable_NormalPriority=3,s.unstable_Profiling=null,s.unstable_UserBlockingPriority=2,s.unstable_cancelCallback=function(Y){Y.callback=null},s.unstable_continueExecution=function(){E||M||(E=!0,ue(I))},s.unstable_forceFrameRate=function(Y){0>Y||125<Y?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):D=0<Y?Math.floor(1e3/Y):5},s.unstable_getCurrentPriorityLevel=function(){return g},s.unstable_getFirstCallbackNode=function(){return t(p)},s.unstable_next=function(Y){switch(g){case 1:case 2:case 3:var ae=3;break;default:ae=g}var oe=g;g=ae;try{return Y()}finally{g=oe}},s.unstable_pauseExecution=function(){},s.unstable_requestPaint=function(){},s.unstable_runWithPriority=function(Y,ae){switch(Y){case 1:case 2:case 3:case 4:case 5:break;default:Y=3}var oe=g;g=Y;try{return ae()}finally{g=oe}},s.unstable_scheduleCallback=function(Y,ae,oe){var F=s.unstable_now();switch(typeof oe=="object"&&oe!==null?(oe=oe.delay,oe=typeof oe=="number"&&0<oe?F+oe:F):oe=F,Y){case 1:var Z=-1;break;case 2:Z=250;break;case 5:Z=1073741823;break;case 4:Z=1e4;break;default:Z=5e3}return Z=oe+Z,Y={id:x++,callback:ae,priorityLevel:Y,startTime:oe,expirationTime:Z,sortIndex:-1},oe>F?(Y.sortIndex=oe,e(m,Y),t(p)===null&&Y===t(m)&&(R?(_(T),T=-1):R=!0,$(C,oe-F))):(Y.sortIndex=Z,e(p,Y),E||M||(E=!0,ue(I))),Y},s.unstable_shouldYield=k,s.unstable_wrapCallback=function(Y){var ae=g;return function(){var oe=g;g=ae;try{return Y.apply(this,arguments)}finally{g=oe}}}}(ef)),ef}var wm;function cv(){return wm||(wm=1,jc.exports=uv()),jc.exports}/**
 * @license React
 * react-dom.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var Am;function fv(){if(Am)return Xn;Am=1;var s=Hg(),e=cv();function t(n){for(var i="https://reactjs.org/docs/error-decoder.html?invariant="+n,a=1;a<arguments.length;a++)i+="&args[]="+encodeURIComponent(arguments[a]);return"Minified React error #"+n+"; visit "+i+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}var r=new Set,o={};function l(n,i){c(n,i),c(n+"Capture",i)}function c(n,i){for(o[n]=i,n=0;n<i.length;n++)r.add(i[n])}var d=!(typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"),p=Object.prototype.hasOwnProperty,m=/^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/,x={},y={};function g(n){return p.call(y,n)?!0:p.call(x,n)?!1:m.test(n)?y[n]=!0:(x[n]=!0,!1)}function M(n,i,a,u){if(a!==null&&a.type===0)return!1;switch(typeof i){case"function":case"symbol":return!0;case"boolean":return u?!1:a!==null?!a.acceptsBooleans:(n=n.toLowerCase().slice(0,5),n!=="data-"&&n!=="aria-");default:return!1}}function E(n,i,a,u){if(i===null||typeof i>"u"||M(n,i,a,u))return!0;if(u)return!1;if(a!==null)switch(a.type){case 3:return!i;case 4:return i===!1;case 5:return isNaN(i);case 6:return isNaN(i)||1>i}return!1}function R(n,i,a,u,f,h,w){this.acceptsBooleans=i===2||i===3||i===4,this.attributeName=u,this.attributeNamespace=f,this.mustUseProperty=a,this.propertyName=n,this.type=i,this.sanitizeURL=h,this.removeEmptyString=w}var v={};"children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ").forEach(function(n){v[n]=new R(n,0,!1,n,null,!1,!1)}),[["acceptCharset","accept-charset"],["className","class"],["htmlFor","for"],["httpEquiv","http-equiv"]].forEach(function(n){var i=n[0];v[i]=new R(i,1,!1,n[1],null,!1,!1)}),["contentEditable","draggable","spellCheck","value"].forEach(function(n){v[n]=new R(n,2,!1,n.toLowerCase(),null,!1,!1)}),["autoReverse","externalResourcesRequired","focusable","preserveAlpha"].forEach(function(n){v[n]=new R(n,2,!1,n,null,!1,!1)}),"allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function(n){v[n]=new R(n,3,!1,n.toLowerCase(),null,!1,!1)}),["checked","multiple","muted","selected"].forEach(function(n){v[n]=new R(n,3,!0,n,null,!1,!1)}),["capture","download"].forEach(function(n){v[n]=new R(n,4,!1,n,null,!1,!1)}),["cols","rows","size","span"].forEach(function(n){v[n]=new R(n,6,!1,n,null,!1,!1)}),["rowSpan","start"].forEach(function(n){v[n]=new R(n,5,!1,n.toLowerCase(),null,!1,!1)});var _=/[\-:]([a-z])/g;function b(n){return n[1].toUpperCase()}"accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height".split(" ").forEach(function(n){var i=n.replace(_,b);v[i]=new R(i,1,!1,n,null,!1,!1)}),"xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(n){var i=n.replace(_,b);v[i]=new R(i,1,!1,n,"http://www.w3.org/1999/xlink",!1,!1)}),["xml:base","xml:lang","xml:space"].forEach(function(n){var i=n.replace(_,b);v[i]=new R(i,1,!1,n,"http://www.w3.org/XML/1998/namespace",!1,!1)}),["tabIndex","crossOrigin"].forEach(function(n){v[n]=new R(n,1,!1,n.toLowerCase(),null,!1,!1)}),v.xlinkHref=new R("xlinkHref",1,!1,"xlink:href","http://www.w3.org/1999/xlink",!0,!1),["src","href","action","formAction"].forEach(function(n){v[n]=new R(n,1,!1,n.toLowerCase(),null,!0,!0)});function N(n,i,a,u){var f=v.hasOwnProperty(i)?v[i]:null;(f!==null?f.type!==0:u||!(2<i.length)||i[0]!=="o"&&i[0]!=="O"||i[1]!=="n"&&i[1]!=="N")&&(E(i,a,f,u)&&(a=null),u||f===null?g(i)&&(a===null?n.removeAttribute(i):n.setAttribute(i,""+a)):f.mustUseProperty?n[f.propertyName]=a===null?f.type===3?!1:"":a:(i=f.attributeName,u=f.attributeNamespace,a===null?n.removeAttribute(i):(f=f.type,a=f===3||f===4&&a===!0?"":""+a,u?n.setAttributeNS(u,i,a):n.setAttribute(i,a))))}var C=s.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,I=Symbol.for("react.element"),P=Symbol.for("react.portal"),O=Symbol.for("react.fragment"),T=Symbol.for("react.strict_mode"),D=Symbol.for("react.profiler"),z=Symbol.for("react.provider"),k=Symbol.for("react.context"),K=Symbol.for("react.forward_ref"),ce=Symbol.for("react.suspense"),me=Symbol.for("react.suspense_list"),Q=Symbol.for("react.memo"),ue=Symbol.for("react.lazy"),$=Symbol.for("react.offscreen"),Y=Symbol.iterator;function ae(n){return n===null||typeof n!="object"?null:(n=Y&&n[Y]||n["@@iterator"],typeof n=="function"?n:null)}var oe=Object.assign,F;function Z(n){if(F===void 0)try{throw Error()}catch(a){var i=a.stack.trim().match(/\n( *(at )?)/);F=i&&i[1]||""}return`
`+F+n}var Ne=!1;function qe(n,i){if(!n||Ne)return"";Ne=!0;var a=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{if(i)if(i=function(){throw Error()},Object.defineProperty(i.prototype,"props",{set:function(){throw Error()}}),typeof Reflect=="object"&&Reflect.construct){try{Reflect.construct(i,[])}catch(se){var u=se}Reflect.construct(n,[],i)}else{try{i.call()}catch(se){u=se}n.call(i.prototype)}else{try{throw Error()}catch(se){u=se}n()}}catch(se){if(se&&u&&typeof se.stack=="string"){for(var f=se.stack.split(`
`),h=u.stack.split(`
`),w=f.length-1,U=h.length-1;1<=w&&0<=U&&f[w]!==h[U];)U--;for(;1<=w&&0<=U;w--,U--)if(f[w]!==h[U]){if(w!==1||U!==1)do if(w--,U--,0>U||f[w]!==h[U]){var B=`
`+f[w].replace(" at new "," at ");return n.displayName&&B.includes("<anonymous>")&&(B=B.replace("<anonymous>",n.displayName)),B}while(1<=w&&0<=U);break}}}finally{Ne=!1,Error.prepareStackTrace=a}return(n=n?n.displayName||n.name:"")?Z(n):""}function ke(n){switch(n.tag){case 5:return Z(n.type);case 16:return Z("Lazy");case 13:return Z("Suspense");case 19:return Z("SuspenseList");case 0:case 2:case 15:return n=qe(n.type,!1),n;case 11:return n=qe(n.type.render,!1),n;case 1:return n=qe(n.type,!0),n;default:return""}}function ie(n){if(n==null)return null;if(typeof n=="function")return n.displayName||n.name||null;if(typeof n=="string")return n;switch(n){case O:return"Fragment";case P:return"Portal";case D:return"Profiler";case T:return"StrictMode";case ce:return"Suspense";case me:return"SuspenseList"}if(typeof n=="object")switch(n.$$typeof){case k:return(n.displayName||"Context")+".Consumer";case z:return(n._context.displayName||"Context")+".Provider";case K:var i=n.render;return n=n.displayName,n||(n=i.displayName||i.name||"",n=n!==""?"ForwardRef("+n+")":"ForwardRef"),n;case Q:return i=n.displayName||null,i!==null?i:ie(n.type)||"Memo";case ue:i=n._payload,n=n._init;try{return ie(n(i))}catch{}}return null}function _e(n){var i=n.type;switch(n.tag){case 24:return"Cache";case 9:return(i.displayName||"Context")+".Consumer";case 10:return(i._context.displayName||"Context")+".Provider";case 18:return"DehydratedFragment";case 11:return n=i.render,n=n.displayName||n.name||"",i.displayName||(n!==""?"ForwardRef("+n+")":"ForwardRef");case 7:return"Fragment";case 5:return i;case 4:return"Portal";case 3:return"Root";case 6:return"Text";case 16:return ie(i);case 8:return i===T?"StrictMode":"Mode";case 22:return"Offscreen";case 12:return"Profiler";case 21:return"Scope";case 13:return"Suspense";case 19:return"SuspenseList";case 25:return"TracingMarker";case 1:case 0:case 17:case 2:case 14:case 15:if(typeof i=="function")return i.displayName||i.name||null;if(typeof i=="string")return i}return null}function he(n){switch(typeof n){case"boolean":case"number":case"string":case"undefined":return n;case"object":return n;default:return""}}function Ie(n){var i=n.type;return(n=n.nodeName)&&n.toLowerCase()==="input"&&(i==="checkbox"||i==="radio")}function Je(n){var i=Ie(n)?"checked":"value",a=Object.getOwnPropertyDescriptor(n.constructor.prototype,i),u=""+n[i];if(!n.hasOwnProperty(i)&&typeof a<"u"&&typeof a.get=="function"&&typeof a.set=="function"){var f=a.get,h=a.set;return Object.defineProperty(n,i,{configurable:!0,get:function(){return f.call(this)},set:function(w){u=""+w,h.call(this,w)}}),Object.defineProperty(n,i,{enumerable:a.enumerable}),{getValue:function(){return u},setValue:function(w){u=""+w},stopTracking:function(){n._valueTracker=null,delete n[i]}}}}function je(n){n._valueTracker||(n._valueTracker=Je(n))}function Vt(n){if(!n)return!1;var i=n._valueTracker;if(!i)return!0;var a=i.getValue(),u="";return n&&(u=Ie(n)?n.checked?"true":"false":n.value),n=u,n!==a?(i.setValue(n),!0):!1}function ct(n){if(n=n||(typeof document<"u"?document:void 0),typeof n>"u")return null;try{return n.activeElement||n.body}catch{return n.body}}function wt(n,i){var a=i.checked;return oe({},i,{defaultChecked:void 0,defaultValue:void 0,value:void 0,checked:a??n._wrapperState.initialChecked})}function xt(n,i){var a=i.defaultValue==null?"":i.defaultValue,u=i.checked!=null?i.checked:i.defaultChecked;a=he(i.value!=null?i.value:a),n._wrapperState={initialChecked:u,initialValue:a,controlled:i.type==="checkbox"||i.type==="radio"?i.checked!=null:i.value!=null}}function _t(n,i){i=i.checked,i!=null&&N(n,"checked",i,!1)}function Ht(n,i){_t(n,i);var a=he(i.value),u=i.type;if(a!=null)u==="number"?(a===0&&n.value===""||n.value!=a)&&(n.value=""+a):n.value!==""+a&&(n.value=""+a);else if(u==="submit"||u==="reset"){n.removeAttribute("value");return}i.hasOwnProperty("value")?Jt(n,i.type,a):i.hasOwnProperty("defaultValue")&&Jt(n,i.type,he(i.defaultValue)),i.checked==null&&i.defaultChecked!=null&&(n.defaultChecked=!!i.defaultChecked)}function Qt(n,i,a){if(i.hasOwnProperty("value")||i.hasOwnProperty("defaultValue")){var u=i.type;if(!(u!=="submit"&&u!=="reset"||i.value!==void 0&&i.value!==null))return;i=""+n._wrapperState.initialValue,a||i===n.value||(n.value=i),n.defaultValue=i}a=n.name,a!==""&&(n.name=""),n.defaultChecked=!!n._wrapperState.initialChecked,a!==""&&(n.name=a)}function Jt(n,i,a){(i!=="number"||ct(n.ownerDocument)!==n)&&(a==null?n.defaultValue=""+n._wrapperState.initialValue:n.defaultValue!==""+a&&(n.defaultValue=""+a))}var Yt=Array.isArray;function Ct(n,i,a,u){if(n=n.options,i){i={};for(var f=0;f<a.length;f++)i["$"+a[f]]=!0;for(a=0;a<n.length;a++)f=i.hasOwnProperty("$"+n[a].value),n[a].selected!==f&&(n[a].selected=f),f&&u&&(n[a].defaultSelected=!0)}else{for(a=""+he(a),i=null,f=0;f<n.length;f++){if(n[f].value===a){n[f].selected=!0,u&&(n[f].defaultSelected=!0);return}i!==null||n[f].disabled||(i=n[f])}i!==null&&(i.selected=!0)}}function Gt(n,i){if(i.dangerouslySetInnerHTML!=null)throw Error(t(91));return oe({},i,{value:void 0,defaultValue:void 0,children:""+n._wrapperState.initialValue})}function W(n,i){var a=i.value;if(a==null){if(a=i.children,i=i.defaultValue,a!=null){if(i!=null)throw Error(t(92));if(Yt(a)){if(1<a.length)throw Error(t(93));a=a[0]}i=a}i==null&&(i=""),a=i}n._wrapperState={initialValue:he(a)}}function gn(n,i){var a=he(i.value),u=he(i.defaultValue);a!=null&&(a=""+a,a!==n.value&&(n.value=a),i.defaultValue==null&&n.defaultValue!==a&&(n.defaultValue=a)),u!=null&&(n.defaultValue=""+u)}function Et(n){var i=n.textContent;i===n._wrapperState.initialValue&&i!==""&&i!==null&&(n.value=i)}function L(n){switch(n){case"svg":return"http://www.w3.org/2000/svg";case"math":return"http://www.w3.org/1998/Math/MathML";default:return"http://www.w3.org/1999/xhtml"}}function S(n,i){return n==null||n==="http://www.w3.org/1999/xhtml"?L(i):n==="http://www.w3.org/2000/svg"&&i==="foreignObject"?"http://www.w3.org/1999/xhtml":n}var q,ne=function(n){return typeof MSApp<"u"&&MSApp.execUnsafeLocalFunction?function(i,a,u,f){MSApp.execUnsafeLocalFunction(function(){return n(i,a,u,f)})}:n}(function(n,i){if(n.namespaceURI!=="http://www.w3.org/2000/svg"||"innerHTML"in n)n.innerHTML=i;else{for(q=q||document.createElement("div"),q.innerHTML="<svg>"+i.valueOf().toString()+"</svg>",i=q.firstChild;n.firstChild;)n.removeChild(n.firstChild);for(;i.firstChild;)n.appendChild(i.firstChild)}});function le(n,i){if(i){var a=n.firstChild;if(a&&a===n.lastChild&&a.nodeType===3){a.nodeValue=i;return}}n.textContent=i}var Se={animationIterationCount:!0,aspectRatio:!0,borderImageOutset:!0,borderImageSlice:!0,borderImageWidth:!0,boxFlex:!0,boxFlexGroup:!0,boxOrdinalGroup:!0,columnCount:!0,columns:!0,flex:!0,flexGrow:!0,flexPositive:!0,flexShrink:!0,flexNegative:!0,flexOrder:!0,gridArea:!0,gridRow:!0,gridRowEnd:!0,gridRowSpan:!0,gridRowStart:!0,gridColumn:!0,gridColumnEnd:!0,gridColumnSpan:!0,gridColumnStart:!0,fontWeight:!0,lineClamp:!0,lineHeight:!0,opacity:!0,order:!0,orphans:!0,tabSize:!0,widows:!0,zIndex:!0,zoom:!0,fillOpacity:!0,floodOpacity:!0,stopOpacity:!0,strokeDasharray:!0,strokeDashoffset:!0,strokeMiterlimit:!0,strokeOpacity:!0,strokeWidth:!0},Re=["Webkit","ms","Moz","O"];Object.keys(Se).forEach(function(n){Re.forEach(function(i){i=i+n.charAt(0).toUpperCase()+n.substring(1),Se[i]=Se[n]})});function fe(n,i,a){return i==null||typeof i=="boolean"||i===""?"":a||typeof i!="number"||i===0||Se.hasOwnProperty(n)&&Se[n]?(""+i).trim():i+"px"}function pe(n,i){n=n.style;for(var a in i)if(i.hasOwnProperty(a)){var u=a.indexOf("--")===0,f=fe(a,i[a],u);a==="float"&&(a="cssFloat"),u?n.setProperty(a,f):n[a]=f}}var be=oe({menuitem:!0},{area:!0,base:!0,br:!0,col:!0,embed:!0,hr:!0,img:!0,input:!0,keygen:!0,link:!0,meta:!0,param:!0,source:!0,track:!0,wbr:!0});function Xe(n,i){if(i){if(be[n]&&(i.children!=null||i.dangerouslySetInnerHTML!=null))throw Error(t(137,n));if(i.dangerouslySetInnerHTML!=null){if(i.children!=null)throw Error(t(60));if(typeof i.dangerouslySetInnerHTML!="object"||!("__html"in i.dangerouslySetInnerHTML))throw Error(t(61))}if(i.style!=null&&typeof i.style!="object")throw Error(t(62))}}function Pe(n,i){if(n.indexOf("-")===-1)return typeof i.is=="string";switch(n){case"annotation-xml":case"color-profile":case"font-face":case"font-face-src":case"font-face-uri":case"font-face-format":case"font-face-name":case"missing-glyph":return!1;default:return!0}}var Ae=null;function Ze(n){return n=n.target||n.srcElement||window,n.correspondingUseElement&&(n=n.correspondingUseElement),n.nodeType===3?n.parentNode:n}var et=null,it=null,V=null;function we(n){if(n=Fa(n)){if(typeof et!="function")throw Error(t(280));var i=n.stateNode;i&&(i=Fo(i),et(n.stateNode,n.type,i))}}function de(n){it?V?V.push(n):V=[n]:it=n}function Ce(){if(it){var n=it,i=V;if(V=it=null,we(n),i)for(n=0;n<i.length;n++)we(i[n])}}function Le(n,i){return n(i)}function ge(){}var He=!1;function ze(n,i,a){if(He)return n(i,a);He=!0;try{return Le(n,i,a)}finally{He=!1,(it!==null||V!==null)&&(ge(),Ce())}}function Dt(n,i){var a=n.stateNode;if(a===null)return null;var u=Fo(a);if(u===null)return null;a=u[i];e:switch(i){case"onClick":case"onClickCapture":case"onDoubleClick":case"onDoubleClickCapture":case"onMouseDown":case"onMouseDownCapture":case"onMouseMove":case"onMouseMoveCapture":case"onMouseUp":case"onMouseUpCapture":case"onMouseEnter":(u=!u.disabled)||(n=n.type,u=!(n==="button"||n==="input"||n==="select"||n==="textarea")),n=!u;break e;default:n=!1}if(n)return null;if(a&&typeof a!="function")throw Error(t(231,i,typeof a));return a}var At=!1;if(d)try{var En={};Object.defineProperty(En,"passive",{get:function(){At=!0}}),window.addEventListener("test",En,En),window.removeEventListener("test",En,En)}catch{At=!1}function ti(n,i,a,u,f,h,w,U,B){var se=Array.prototype.slice.call(arguments,3);try{i.apply(a,se)}catch(xe){this.onError(xe)}}var zr=!1,ps=null,Vr=!1,Hr=null,yu={onError:function(n){zr=!0,ps=n}};function vo(n,i,a,u,f,h,w,U,B){zr=!1,ps=null,ti.apply(yu,arguments)}function xo(n,i,a,u,f,h,w,U,B){if(vo.apply(this,arguments),zr){if(zr){var se=ps;zr=!1,ps=null}else throw Error(t(198));Vr||(Vr=!0,Hr=se)}}function Ln(n){var i=n,a=n;if(n.alternate)for(;i.return;)i=i.return;else{n=i;do i=n,i.flags&4098&&(a=i.return),n=i.return;while(n)}return i.tag===3?a:null}function ms(n){if(n.tag===13){var i=n.memoizedState;if(i===null&&(n=n.alternate,n!==null&&(i=n.memoizedState)),i!==null)return i.dehydrated}return null}function ga(n){if(Ln(n)!==n)throw Error(t(188))}function yo(n){var i=n.alternate;if(!i){if(i=Ln(n),i===null)throw Error(t(188));return i!==n?null:n}for(var a=n,u=i;;){var f=a.return;if(f===null)break;var h=f.alternate;if(h===null){if(u=f.return,u!==null){a=u;continue}break}if(f.child===h.child){for(h=f.child;h;){if(h===a)return ga(f),n;if(h===u)return ga(f),i;h=h.sibling}throw Error(t(188))}if(a.return!==u.return)a=f,u=h;else{for(var w=!1,U=f.child;U;){if(U===a){w=!0,a=f,u=h;break}if(U===u){w=!0,u=f,a=h;break}U=U.sibling}if(!w){for(U=h.child;U;){if(U===a){w=!0,a=h,u=f;break}if(U===u){w=!0,u=h,a=f;break}U=U.sibling}if(!w)throw Error(t(189))}}if(a.alternate!==u)throw Error(t(190))}if(a.tag!==3)throw Error(t(188));return a.stateNode.current===a?n:i}function Gr(n){return n=yo(n),n!==null?_a(n):null}function _a(n){if(n.tag===5||n.tag===6)return n;for(n=n.child;n!==null;){var i=_a(n);if(i!==null)return i;n=n.sibling}return null}var Wr=e.unstable_scheduleCallback,va=e.unstable_cancelCallback,So=e.unstable_shouldYield,Su=e.unstable_requestPaint,qt=e.unstable_now,Mu=e.unstable_getCurrentPriorityLevel,xa=e.unstable_ImmediatePriority,A=e.unstable_UserBlockingPriority,X=e.unstable_NormalPriority,re=e.unstable_LowPriority,ee=e.unstable_IdlePriority,j=null,Te=null;function Oe(n){if(Te&&typeof Te.onCommitFiberRoot=="function")try{Te.onCommitFiberRoot(j,n,void 0,(n.current.flags&128)===128)}catch{}}var Ee=Math.clz32?Math.clz32:ot,Ge=Math.log,$e=Math.LN2;function ot(n){return n>>>=0,n===0?32:31-(Ge(n)/$e|0)|0}var lt=64,Ye=4194304;function yt(n){switch(n&-n){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return n&4194240;case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:return n&130023424;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 1073741824;default:return n}}function Ft(n,i){var a=n.pendingLanes;if(a===0)return 0;var u=0,f=n.suspendedLanes,h=n.pingedLanes,w=a&268435455;if(w!==0){var U=w&~f;U!==0?u=yt(U):(h&=w,h!==0&&(u=yt(h)))}else w=a&~f,w!==0?u=yt(w):h!==0&&(u=yt(h));if(u===0)return 0;if(i!==0&&i!==u&&!(i&f)&&(f=u&-u,h=i&-i,f>=h||f===16&&(h&4194240)!==0))return i;if(u&4&&(u|=a&16),i=n.entangledLanes,i!==0)for(n=n.entanglements,i&=u;0<i;)a=31-Ee(i),f=1<<a,u|=n[a],i&=~f;return u}function Wt(n,i){switch(n){case 1:case 2:case 4:return i+250;case 8:case 16:case 32:case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return i+5e3;case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:return-1;case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function bt(n,i){for(var a=n.suspendedLanes,u=n.pingedLanes,f=n.expirationTimes,h=n.pendingLanes;0<h;){var w=31-Ee(h),U=1<<w,B=f[w];B===-1?(!(U&a)||U&u)&&(f[w]=Wt(U,i)):B<=i&&(n.expiredLanes|=U),h&=~U}}function nn(n){return n=n.pendingLanes&-1073741825,n!==0?n:n&1073741824?1073741824:0}function Ue(){var n=lt;return lt<<=1,!(lt&4194240)&&(lt=64),n}function _n(n){for(var i=[],a=0;31>a;a++)i.push(n);return i}function ht(n,i,a){n.pendingLanes|=i,i!==536870912&&(n.suspendedLanes=0,n.pingedLanes=0),n=n.eventTimes,i=31-Ee(i),n[i]=a}function Bn(n,i){var a=n.pendingLanes&~i;n.pendingLanes=i,n.suspendedLanes=0,n.pingedLanes=0,n.expiredLanes&=i,n.mutableReadLanes&=i,n.entangledLanes&=i,i=n.entanglements;var u=n.eventTimes;for(n=n.expirationTimes;0<a;){var f=31-Ee(a),h=1<<f;i[f]=0,u[f]=-1,n[f]=-1,a&=~h}}function kn(n,i){var a=n.entangledLanes|=i;for(n=n.entanglements;a;){var u=31-Ee(a),f=1<<u;f&i|n[u]&i&&(n[u]|=i),a&=~f}}var pt=0;function Vi(n){return n&=-n,1<n?4<n?n&268435455?16:536870912:4:1}var Rt,Bt,di,Pt,hi,wi=!1,Xr=[],ar=null,or=null,lr=null,ya=new Map,Sa=new Map,ur=[],b_="mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(" ");function sh(n,i){switch(n){case"focusin":case"focusout":ar=null;break;case"dragenter":case"dragleave":or=null;break;case"mouseover":case"mouseout":lr=null;break;case"pointerover":case"pointerout":ya.delete(i.pointerId);break;case"gotpointercapture":case"lostpointercapture":Sa.delete(i.pointerId)}}function Ma(n,i,a,u,f,h){return n===null||n.nativeEvent!==h?(n={blockedOn:i,domEventName:a,eventSystemFlags:u,nativeEvent:h,targetContainers:[f]},i!==null&&(i=Fa(i),i!==null&&Bt(i)),n):(n.eventSystemFlags|=u,i=n.targetContainers,f!==null&&i.indexOf(f)===-1&&i.push(f),n)}function P_(n,i,a,u,f){switch(i){case"focusin":return ar=Ma(ar,n,i,a,u,f),!0;case"dragenter":return or=Ma(or,n,i,a,u,f),!0;case"mouseover":return lr=Ma(lr,n,i,a,u,f),!0;case"pointerover":var h=f.pointerId;return ya.set(h,Ma(ya.get(h)||null,n,i,a,u,f)),!0;case"gotpointercapture":return h=f.pointerId,Sa.set(h,Ma(Sa.get(h)||null,n,i,a,u,f)),!0}return!1}function ah(n){var i=Yr(n.target);if(i!==null){var a=Ln(i);if(a!==null){if(i=a.tag,i===13){if(i=ms(a),i!==null){n.blockedOn=i,hi(n.priority,function(){di(a)});return}}else if(i===3&&a.stateNode.current.memoizedState.isDehydrated){n.blockedOn=a.tag===3?a.stateNode.containerInfo:null;return}}}n.blockedOn=null}function Mo(n){if(n.blockedOn!==null)return!1;for(var i=n.targetContainers;0<i.length;){var a=Tu(n.domEventName,n.eventSystemFlags,i[0],n.nativeEvent);if(a===null){a=n.nativeEvent;var u=new a.constructor(a.type,a);Ae=u,a.target.dispatchEvent(u),Ae=null}else return i=Fa(a),i!==null&&Bt(i),n.blockedOn=a,!1;i.shift()}return!0}function oh(n,i,a){Mo(n)&&a.delete(i)}function L_(){wi=!1,ar!==null&&Mo(ar)&&(ar=null),or!==null&&Mo(or)&&(or=null),lr!==null&&Mo(lr)&&(lr=null),ya.forEach(oh),Sa.forEach(oh)}function Ea(n,i){n.blockedOn===i&&(n.blockedOn=null,wi||(wi=!0,e.unstable_scheduleCallback(e.unstable_NormalPriority,L_)))}function Ta(n){function i(f){return Ea(f,n)}if(0<Xr.length){Ea(Xr[0],n);for(var a=1;a<Xr.length;a++){var u=Xr[a];u.blockedOn===n&&(u.blockedOn=null)}}for(ar!==null&&Ea(ar,n),or!==null&&Ea(or,n),lr!==null&&Ea(lr,n),ya.forEach(i),Sa.forEach(i),a=0;a<ur.length;a++)u=ur[a],u.blockedOn===n&&(u.blockedOn=null);for(;0<ur.length&&(a=ur[0],a.blockedOn===null);)ah(a),a.blockedOn===null&&ur.shift()}var gs=C.ReactCurrentBatchConfig,Eo=!0;function D_(n,i,a,u){var f=pt,h=gs.transition;gs.transition=null;try{pt=1,Eu(n,i,a,u)}finally{pt=f,gs.transition=h}}function N_(n,i,a,u){var f=pt,h=gs.transition;gs.transition=null;try{pt=4,Eu(n,i,a,u)}finally{pt=f,gs.transition=h}}function Eu(n,i,a,u){if(Eo){var f=Tu(n,i,a,u);if(f===null)Vu(n,i,u,To,a),sh(n,u);else if(P_(f,n,i,a,u))u.stopPropagation();else if(sh(n,u),i&4&&-1<b_.indexOf(n)){for(;f!==null;){var h=Fa(f);if(h!==null&&Rt(h),h=Tu(n,i,a,u),h===null&&Vu(n,i,u,To,a),h===f)break;f=h}f!==null&&u.stopPropagation()}else Vu(n,i,u,null,a)}}var To=null;function Tu(n,i,a,u){if(To=null,n=Ze(u),n=Yr(n),n!==null)if(i=Ln(n),i===null)n=null;else if(a=i.tag,a===13){if(n=ms(i),n!==null)return n;n=null}else if(a===3){if(i.stateNode.current.memoizedState.isDehydrated)return i.tag===3?i.stateNode.containerInfo:null;n=null}else i!==n&&(n=null);return To=n,null}function lh(n){switch(n){case"cancel":case"click":case"close":case"contextmenu":case"copy":case"cut":case"auxclick":case"dblclick":case"dragend":case"dragstart":case"drop":case"focusin":case"focusout":case"input":case"invalid":case"keydown":case"keypress":case"keyup":case"mousedown":case"mouseup":case"paste":case"pause":case"play":case"pointercancel":case"pointerdown":case"pointerup":case"ratechange":case"reset":case"resize":case"seeked":case"submit":case"touchcancel":case"touchend":case"touchstart":case"volumechange":case"change":case"selectionchange":case"textInput":case"compositionstart":case"compositionend":case"compositionupdate":case"beforeblur":case"afterblur":case"beforeinput":case"blur":case"fullscreenchange":case"focus":case"hashchange":case"popstate":case"select":case"selectstart":return 1;case"drag":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"mousemove":case"mouseout":case"mouseover":case"pointermove":case"pointerout":case"pointerover":case"scroll":case"toggle":case"touchmove":case"wheel":case"mouseenter":case"mouseleave":case"pointerenter":case"pointerleave":return 4;case"message":switch(Mu()){case xa:return 1;case A:return 4;case X:case re:return 16;case ee:return 536870912;default:return 16}default:return 16}}var cr=null,wu=null,wo=null;function uh(){if(wo)return wo;var n,i=wu,a=i.length,u,f="value"in cr?cr.value:cr.textContent,h=f.length;for(n=0;n<a&&i[n]===f[n];n++);var w=a-n;for(u=1;u<=w&&i[a-u]===f[h-u];u++);return wo=f.slice(n,1<u?1-u:void 0)}function Ao(n){var i=n.keyCode;return"charCode"in n?(n=n.charCode,n===0&&i===13&&(n=13)):n=i,n===10&&(n=13),32<=n||n===13?n:0}function Ro(){return!0}function ch(){return!1}function Kn(n){function i(a,u,f,h,w){this._reactName=a,this._targetInst=f,this.type=u,this.nativeEvent=h,this.target=w,this.currentTarget=null;for(var U in n)n.hasOwnProperty(U)&&(a=n[U],this[U]=a?a(h):h[U]);return this.isDefaultPrevented=(h.defaultPrevented!=null?h.defaultPrevented:h.returnValue===!1)?Ro:ch,this.isPropagationStopped=ch,this}return oe(i.prototype,{preventDefault:function(){this.defaultPrevented=!0;var a=this.nativeEvent;a&&(a.preventDefault?a.preventDefault():typeof a.returnValue!="unknown"&&(a.returnValue=!1),this.isDefaultPrevented=Ro)},stopPropagation:function(){var a=this.nativeEvent;a&&(a.stopPropagation?a.stopPropagation():typeof a.cancelBubble!="unknown"&&(a.cancelBubble=!0),this.isPropagationStopped=Ro)},persist:function(){},isPersistent:Ro}),i}var _s={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(n){return n.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},Au=Kn(_s),wa=oe({},_s,{view:0,detail:0}),I_=Kn(wa),Ru,Cu,Aa,Co=oe({},wa,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:Pu,button:0,buttons:0,relatedTarget:function(n){return n.relatedTarget===void 0?n.fromElement===n.srcElement?n.toElement:n.fromElement:n.relatedTarget},movementX:function(n){return"movementX"in n?n.movementX:(n!==Aa&&(Aa&&n.type==="mousemove"?(Ru=n.screenX-Aa.screenX,Cu=n.screenY-Aa.screenY):Cu=Ru=0,Aa=n),Ru)},movementY:function(n){return"movementY"in n?n.movementY:Cu}}),fh=Kn(Co),U_=oe({},Co,{dataTransfer:0}),F_=Kn(U_),O_=oe({},wa,{relatedTarget:0}),bu=Kn(O_),B_=oe({},_s,{animationName:0,elapsedTime:0,pseudoElement:0}),k_=Kn(B_),z_=oe({},_s,{clipboardData:function(n){return"clipboardData"in n?n.clipboardData:window.clipboardData}}),V_=Kn(z_),H_=oe({},_s,{data:0}),dh=Kn(H_),G_={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},W_={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},X_={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};function Y_(n){var i=this.nativeEvent;return i.getModifierState?i.getModifierState(n):(n=X_[n])?!!i[n]:!1}function Pu(){return Y_}var q_=oe({},wa,{key:function(n){if(n.key){var i=G_[n.key]||n.key;if(i!=="Unidentified")return i}return n.type==="keypress"?(n=Ao(n),n===13?"Enter":String.fromCharCode(n)):n.type==="keydown"||n.type==="keyup"?W_[n.keyCode]||"Unidentified":""},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:Pu,charCode:function(n){return n.type==="keypress"?Ao(n):0},keyCode:function(n){return n.type==="keydown"||n.type==="keyup"?n.keyCode:0},which:function(n){return n.type==="keypress"?Ao(n):n.type==="keydown"||n.type==="keyup"?n.keyCode:0}}),K_=Kn(q_),$_=oe({},Co,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0}),hh=Kn($_),Z_=oe({},wa,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:Pu}),Q_=Kn(Z_),J_=oe({},_s,{propertyName:0,elapsedTime:0,pseudoElement:0}),j_=Kn(J_),e0=oe({},Co,{deltaX:function(n){return"deltaX"in n?n.deltaX:"wheelDeltaX"in n?-n.wheelDeltaX:0},deltaY:function(n){return"deltaY"in n?n.deltaY:"wheelDeltaY"in n?-n.wheelDeltaY:"wheelDelta"in n?-n.wheelDelta:0},deltaZ:0,deltaMode:0}),t0=Kn(e0),n0=[9,13,27,32],Lu=d&&"CompositionEvent"in window,Ra=null;d&&"documentMode"in document&&(Ra=document.documentMode);var i0=d&&"TextEvent"in window&&!Ra,ph=d&&(!Lu||Ra&&8<Ra&&11>=Ra),mh=" ",gh=!1;function _h(n,i){switch(n){case"keyup":return n0.indexOf(i.keyCode)!==-1;case"keydown":return i.keyCode!==229;case"keypress":case"mousedown":case"focusout":return!0;default:return!1}}function vh(n){return n=n.detail,typeof n=="object"&&"data"in n?n.data:null}var vs=!1;function r0(n,i){switch(n){case"compositionend":return vh(i);case"keypress":return i.which!==32?null:(gh=!0,mh);case"textInput":return n=i.data,n===mh&&gh?null:n;default:return null}}function s0(n,i){if(vs)return n==="compositionend"||!Lu&&_h(n,i)?(n=uh(),wo=wu=cr=null,vs=!1,n):null;switch(n){case"paste":return null;case"keypress":if(!(i.ctrlKey||i.altKey||i.metaKey)||i.ctrlKey&&i.altKey){if(i.char&&1<i.char.length)return i.char;if(i.which)return String.fromCharCode(i.which)}return null;case"compositionend":return ph&&i.locale!=="ko"?null:i.data;default:return null}}var a0={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function xh(n){var i=n&&n.nodeName&&n.nodeName.toLowerCase();return i==="input"?!!a0[n.type]:i==="textarea"}function yh(n,i,a,u){de(u),i=No(i,"onChange"),0<i.length&&(a=new Au("onChange","change",null,a,u),n.push({event:a,listeners:i}))}var Ca=null,ba=null;function o0(n){Bh(n,0)}function bo(n){var i=Es(n);if(Vt(i))return n}function l0(n,i){if(n==="change")return i}var Sh=!1;if(d){var Du;if(d){var Nu="oninput"in document;if(!Nu){var Mh=document.createElement("div");Mh.setAttribute("oninput","return;"),Nu=typeof Mh.oninput=="function"}Du=Nu}else Du=!1;Sh=Du&&(!document.documentMode||9<document.documentMode)}function Eh(){Ca&&(Ca.detachEvent("onpropertychange",Th),ba=Ca=null)}function Th(n){if(n.propertyName==="value"&&bo(ba)){var i=[];yh(i,ba,n,Ze(n)),ze(o0,i)}}function u0(n,i,a){n==="focusin"?(Eh(),Ca=i,ba=a,Ca.attachEvent("onpropertychange",Th)):n==="focusout"&&Eh()}function c0(n){if(n==="selectionchange"||n==="keyup"||n==="keydown")return bo(ba)}function f0(n,i){if(n==="click")return bo(i)}function d0(n,i){if(n==="input"||n==="change")return bo(i)}function h0(n,i){return n===i&&(n!==0||1/n===1/i)||n!==n&&i!==i}var pi=typeof Object.is=="function"?Object.is:h0;function Pa(n,i){if(pi(n,i))return!0;if(typeof n!="object"||n===null||typeof i!="object"||i===null)return!1;var a=Object.keys(n),u=Object.keys(i);if(a.length!==u.length)return!1;for(u=0;u<a.length;u++){var f=a[u];if(!p.call(i,f)||!pi(n[f],i[f]))return!1}return!0}function wh(n){for(;n&&n.firstChild;)n=n.firstChild;return n}function Ah(n,i){var a=wh(n);n=0;for(var u;a;){if(a.nodeType===3){if(u=n+a.textContent.length,n<=i&&u>=i)return{node:a,offset:i-n};n=u}e:{for(;a;){if(a.nextSibling){a=a.nextSibling;break e}a=a.parentNode}a=void 0}a=wh(a)}}function Rh(n,i){return n&&i?n===i?!0:n&&n.nodeType===3?!1:i&&i.nodeType===3?Rh(n,i.parentNode):"contains"in n?n.contains(i):n.compareDocumentPosition?!!(n.compareDocumentPosition(i)&16):!1:!1}function Ch(){for(var n=window,i=ct();i instanceof n.HTMLIFrameElement;){try{var a=typeof i.contentWindow.location.href=="string"}catch{a=!1}if(a)n=i.contentWindow;else break;i=ct(n.document)}return i}function Iu(n){var i=n&&n.nodeName&&n.nodeName.toLowerCase();return i&&(i==="input"&&(n.type==="text"||n.type==="search"||n.type==="tel"||n.type==="url"||n.type==="password")||i==="textarea"||n.contentEditable==="true")}function p0(n){var i=Ch(),a=n.focusedElem,u=n.selectionRange;if(i!==a&&a&&a.ownerDocument&&Rh(a.ownerDocument.documentElement,a)){if(u!==null&&Iu(a)){if(i=u.start,n=u.end,n===void 0&&(n=i),"selectionStart"in a)a.selectionStart=i,a.selectionEnd=Math.min(n,a.value.length);else if(n=(i=a.ownerDocument||document)&&i.defaultView||window,n.getSelection){n=n.getSelection();var f=a.textContent.length,h=Math.min(u.start,f);u=u.end===void 0?h:Math.min(u.end,f),!n.extend&&h>u&&(f=u,u=h,h=f),f=Ah(a,h);var w=Ah(a,u);f&&w&&(n.rangeCount!==1||n.anchorNode!==f.node||n.anchorOffset!==f.offset||n.focusNode!==w.node||n.focusOffset!==w.offset)&&(i=i.createRange(),i.setStart(f.node,f.offset),n.removeAllRanges(),h>u?(n.addRange(i),n.extend(w.node,w.offset)):(i.setEnd(w.node,w.offset),n.addRange(i)))}}for(i=[],n=a;n=n.parentNode;)n.nodeType===1&&i.push({element:n,left:n.scrollLeft,top:n.scrollTop});for(typeof a.focus=="function"&&a.focus(),a=0;a<i.length;a++)n=i[a],n.element.scrollLeft=n.left,n.element.scrollTop=n.top}}var m0=d&&"documentMode"in document&&11>=document.documentMode,xs=null,Uu=null,La=null,Fu=!1;function bh(n,i,a){var u=a.window===a?a.document:a.nodeType===9?a:a.ownerDocument;Fu||xs==null||xs!==ct(u)||(u=xs,"selectionStart"in u&&Iu(u)?u={start:u.selectionStart,end:u.selectionEnd}:(u=(u.ownerDocument&&u.ownerDocument.defaultView||window).getSelection(),u={anchorNode:u.anchorNode,anchorOffset:u.anchorOffset,focusNode:u.focusNode,focusOffset:u.focusOffset}),La&&Pa(La,u)||(La=u,u=No(Uu,"onSelect"),0<u.length&&(i=new Au("onSelect","select",null,i,a),n.push({event:i,listeners:u}),i.target=xs)))}function Po(n,i){var a={};return a[n.toLowerCase()]=i.toLowerCase(),a["Webkit"+n]="webkit"+i,a["Moz"+n]="moz"+i,a}var ys={animationend:Po("Animation","AnimationEnd"),animationiteration:Po("Animation","AnimationIteration"),animationstart:Po("Animation","AnimationStart"),transitionend:Po("Transition","TransitionEnd")},Ou={},Ph={};d&&(Ph=document.createElement("div").style,"AnimationEvent"in window||(delete ys.animationend.animation,delete ys.animationiteration.animation,delete ys.animationstart.animation),"TransitionEvent"in window||delete ys.transitionend.transition);function Lo(n){if(Ou[n])return Ou[n];if(!ys[n])return n;var i=ys[n],a;for(a in i)if(i.hasOwnProperty(a)&&a in Ph)return Ou[n]=i[a];return n}var Lh=Lo("animationend"),Dh=Lo("animationiteration"),Nh=Lo("animationstart"),Ih=Lo("transitionend"),Uh=new Map,Fh="abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");function fr(n,i){Uh.set(n,i),l(i,[n])}for(var Bu=0;Bu<Fh.length;Bu++){var ku=Fh[Bu],g0=ku.toLowerCase(),_0=ku[0].toUpperCase()+ku.slice(1);fr(g0,"on"+_0)}fr(Lh,"onAnimationEnd"),fr(Dh,"onAnimationIteration"),fr(Nh,"onAnimationStart"),fr("dblclick","onDoubleClick"),fr("focusin","onFocus"),fr("focusout","onBlur"),fr(Ih,"onTransitionEnd"),c("onMouseEnter",["mouseout","mouseover"]),c("onMouseLeave",["mouseout","mouseover"]),c("onPointerEnter",["pointerout","pointerover"]),c("onPointerLeave",["pointerout","pointerover"]),l("onChange","change click focusin focusout input keydown keyup selectionchange".split(" ")),l("onSelect","focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" ")),l("onBeforeInput",["compositionend","keypress","textInput","paste"]),l("onCompositionEnd","compositionend focusout keydown keypress keyup mousedown".split(" ")),l("onCompositionStart","compositionstart focusout keydown keypress keyup mousedown".split(" ")),l("onCompositionUpdate","compositionupdate focusout keydown keypress keyup mousedown".split(" "));var Da="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),v0=new Set("cancel close invalid load scroll toggle".split(" ").concat(Da));function Oh(n,i,a){var u=n.type||"unknown-event";n.currentTarget=a,xo(u,i,void 0,n),n.currentTarget=null}function Bh(n,i){i=(i&4)!==0;for(var a=0;a<n.length;a++){var u=n[a],f=u.event;u=u.listeners;e:{var h=void 0;if(i)for(var w=u.length-1;0<=w;w--){var U=u[w],B=U.instance,se=U.currentTarget;if(U=U.listener,B!==h&&f.isPropagationStopped())break e;Oh(f,U,se),h=B}else for(w=0;w<u.length;w++){if(U=u[w],B=U.instance,se=U.currentTarget,U=U.listener,B!==h&&f.isPropagationStopped())break e;Oh(f,U,se),h=B}}}if(Vr)throw n=Hr,Vr=!1,Hr=null,n}function kt(n,i){var a=i[qu];a===void 0&&(a=i[qu]=new Set);var u=n+"__bubble";a.has(u)||(kh(i,n,2,!1),a.add(u))}function zu(n,i,a){var u=0;i&&(u|=4),kh(a,n,u,i)}var Do="_reactListening"+Math.random().toString(36).slice(2);function Na(n){if(!n[Do]){n[Do]=!0,r.forEach(function(a){a!=="selectionchange"&&(v0.has(a)||zu(a,!1,n),zu(a,!0,n))});var i=n.nodeType===9?n:n.ownerDocument;i===null||i[Do]||(i[Do]=!0,zu("selectionchange",!1,i))}}function kh(n,i,a,u){switch(lh(i)){case 1:var f=D_;break;case 4:f=N_;break;default:f=Eu}a=f.bind(null,i,a,n),f=void 0,!At||i!=="touchstart"&&i!=="touchmove"&&i!=="wheel"||(f=!0),u?f!==void 0?n.addEventListener(i,a,{capture:!0,passive:f}):n.addEventListener(i,a,!0):f!==void 0?n.addEventListener(i,a,{passive:f}):n.addEventListener(i,a,!1)}function Vu(n,i,a,u,f){var h=u;if(!(i&1)&&!(i&2)&&u!==null)e:for(;;){if(u===null)return;var w=u.tag;if(w===3||w===4){var U=u.stateNode.containerInfo;if(U===f||U.nodeType===8&&U.parentNode===f)break;if(w===4)for(w=u.return;w!==null;){var B=w.tag;if((B===3||B===4)&&(B=w.stateNode.containerInfo,B===f||B.nodeType===8&&B.parentNode===f))return;w=w.return}for(;U!==null;){if(w=Yr(U),w===null)return;if(B=w.tag,B===5||B===6){u=h=w;continue e}U=U.parentNode}}u=u.return}ze(function(){var se=h,xe=Ze(a),ye=[];e:{var ve=Uh.get(n);if(ve!==void 0){var Fe=Au,Ve=n;switch(n){case"keypress":if(Ao(a)===0)break e;case"keydown":case"keyup":Fe=K_;break;case"focusin":Ve="focus",Fe=bu;break;case"focusout":Ve="blur",Fe=bu;break;case"beforeblur":case"afterblur":Fe=bu;break;case"click":if(a.button===2)break e;case"auxclick":case"dblclick":case"mousedown":case"mousemove":case"mouseup":case"mouseout":case"mouseover":case"contextmenu":Fe=fh;break;case"drag":case"dragend":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"dragstart":case"drop":Fe=F_;break;case"touchcancel":case"touchend":case"touchmove":case"touchstart":Fe=Q_;break;case Lh:case Dh:case Nh:Fe=k_;break;case Ih:Fe=j_;break;case"scroll":Fe=I_;break;case"wheel":Fe=t0;break;case"copy":case"cut":case"paste":Fe=V_;break;case"gotpointercapture":case"lostpointercapture":case"pointercancel":case"pointerdown":case"pointermove":case"pointerout":case"pointerover":case"pointerup":Fe=hh}var We=(i&4)!==0,en=!We&&n==="scroll",J=We?ve!==null?ve+"Capture":null:ve;We=[];for(var G=se,te;G!==null;){te=G;var Me=te.stateNode;if(te.tag===5&&Me!==null&&(te=Me,J!==null&&(Me=Dt(G,J),Me!=null&&We.push(Ia(G,Me,te)))),en)break;G=G.return}0<We.length&&(ve=new Fe(ve,Ve,null,a,xe),ye.push({event:ve,listeners:We}))}}if(!(i&7)){e:{if(ve=n==="mouseover"||n==="pointerover",Fe=n==="mouseout"||n==="pointerout",ve&&a!==Ae&&(Ve=a.relatedTarget||a.fromElement)&&(Yr(Ve)||Ve[Hi]))break e;if((Fe||ve)&&(ve=xe.window===xe?xe:(ve=xe.ownerDocument)?ve.defaultView||ve.parentWindow:window,Fe?(Ve=a.relatedTarget||a.toElement,Fe=se,Ve=Ve?Yr(Ve):null,Ve!==null&&(en=Ln(Ve),Ve!==en||Ve.tag!==5&&Ve.tag!==6)&&(Ve=null)):(Fe=null,Ve=se),Fe!==Ve)){if(We=fh,Me="onMouseLeave",J="onMouseEnter",G="mouse",(n==="pointerout"||n==="pointerover")&&(We=hh,Me="onPointerLeave",J="onPointerEnter",G="pointer"),en=Fe==null?ve:Es(Fe),te=Ve==null?ve:Es(Ve),ve=new We(Me,G+"leave",Fe,a,xe),ve.target=en,ve.relatedTarget=te,Me=null,Yr(xe)===se&&(We=new We(J,G+"enter",Ve,a,xe),We.target=te,We.relatedTarget=en,Me=We),en=Me,Fe&&Ve)t:{for(We=Fe,J=Ve,G=0,te=We;te;te=Ss(te))G++;for(te=0,Me=J;Me;Me=Ss(Me))te++;for(;0<G-te;)We=Ss(We),G--;for(;0<te-G;)J=Ss(J),te--;for(;G--;){if(We===J||J!==null&&We===J.alternate)break t;We=Ss(We),J=Ss(J)}We=null}else We=null;Fe!==null&&zh(ye,ve,Fe,We,!1),Ve!==null&&en!==null&&zh(ye,en,Ve,We,!0)}}e:{if(ve=se?Es(se):window,Fe=ve.nodeName&&ve.nodeName.toLowerCase(),Fe==="select"||Fe==="input"&&ve.type==="file")var Ke=l0;else if(xh(ve))if(Sh)Ke=d0;else{Ke=c0;var tt=u0}else(Fe=ve.nodeName)&&Fe.toLowerCase()==="input"&&(ve.type==="checkbox"||ve.type==="radio")&&(Ke=f0);if(Ke&&(Ke=Ke(n,se))){yh(ye,Ke,a,xe);break e}tt&&tt(n,ve,se),n==="focusout"&&(tt=ve._wrapperState)&&tt.controlled&&ve.type==="number"&&Jt(ve,"number",ve.value)}switch(tt=se?Es(se):window,n){case"focusin":(xh(tt)||tt.contentEditable==="true")&&(xs=tt,Uu=se,La=null);break;case"focusout":La=Uu=xs=null;break;case"mousedown":Fu=!0;break;case"contextmenu":case"mouseup":case"dragend":Fu=!1,bh(ye,a,xe);break;case"selectionchange":if(m0)break;case"keydown":case"keyup":bh(ye,a,xe)}var nt;if(Lu)e:{switch(n){case"compositionstart":var at="onCompositionStart";break e;case"compositionend":at="onCompositionEnd";break e;case"compositionupdate":at="onCompositionUpdate";break e}at=void 0}else vs?_h(n,a)&&(at="onCompositionEnd"):n==="keydown"&&a.keyCode===229&&(at="onCompositionStart");at&&(ph&&a.locale!=="ko"&&(vs||at!=="onCompositionStart"?at==="onCompositionEnd"&&vs&&(nt=uh()):(cr=xe,wu="value"in cr?cr.value:cr.textContent,vs=!0)),tt=No(se,at),0<tt.length&&(at=new dh(at,n,null,a,xe),ye.push({event:at,listeners:tt}),nt?at.data=nt:(nt=vh(a),nt!==null&&(at.data=nt)))),(nt=i0?r0(n,a):s0(n,a))&&(se=No(se,"onBeforeInput"),0<se.length&&(xe=new dh("onBeforeInput","beforeinput",null,a,xe),ye.push({event:xe,listeners:se}),xe.data=nt))}Bh(ye,i)})}function Ia(n,i,a){return{instance:n,listener:i,currentTarget:a}}function No(n,i){for(var a=i+"Capture",u=[];n!==null;){var f=n,h=f.stateNode;f.tag===5&&h!==null&&(f=h,h=Dt(n,a),h!=null&&u.unshift(Ia(n,h,f)),h=Dt(n,i),h!=null&&u.push(Ia(n,h,f))),n=n.return}return u}function Ss(n){if(n===null)return null;do n=n.return;while(n&&n.tag!==5);return n||null}function zh(n,i,a,u,f){for(var h=i._reactName,w=[];a!==null&&a!==u;){var U=a,B=U.alternate,se=U.stateNode;if(B!==null&&B===u)break;U.tag===5&&se!==null&&(U=se,f?(B=Dt(a,h),B!=null&&w.unshift(Ia(a,B,U))):f||(B=Dt(a,h),B!=null&&w.push(Ia(a,B,U)))),a=a.return}w.length!==0&&n.push({event:i,listeners:w})}var x0=/\r\n?/g,y0=/\u0000|\uFFFD/g;function Vh(n){return(typeof n=="string"?n:""+n).replace(x0,`
`).replace(y0,"")}function Io(n,i,a){if(i=Vh(i),Vh(n)!==i&&a)throw Error(t(425))}function Uo(){}var Hu=null,Gu=null;function Wu(n,i){return n==="textarea"||n==="noscript"||typeof i.children=="string"||typeof i.children=="number"||typeof i.dangerouslySetInnerHTML=="object"&&i.dangerouslySetInnerHTML!==null&&i.dangerouslySetInnerHTML.__html!=null}var Xu=typeof setTimeout=="function"?setTimeout:void 0,S0=typeof clearTimeout=="function"?clearTimeout:void 0,Hh=typeof Promise=="function"?Promise:void 0,M0=typeof queueMicrotask=="function"?queueMicrotask:typeof Hh<"u"?function(n){return Hh.resolve(null).then(n).catch(E0)}:Xu;function E0(n){setTimeout(function(){throw n})}function Yu(n,i){var a=i,u=0;do{var f=a.nextSibling;if(n.removeChild(a),f&&f.nodeType===8)if(a=f.data,a==="/$"){if(u===0){n.removeChild(f),Ta(i);return}u--}else a!=="$"&&a!=="$?"&&a!=="$!"||u++;a=f}while(a);Ta(i)}function dr(n){for(;n!=null;n=n.nextSibling){var i=n.nodeType;if(i===1||i===3)break;if(i===8){if(i=n.data,i==="$"||i==="$!"||i==="$?")break;if(i==="/$")return null}}return n}function Gh(n){n=n.previousSibling;for(var i=0;n;){if(n.nodeType===8){var a=n.data;if(a==="$"||a==="$!"||a==="$?"){if(i===0)return n;i--}else a==="/$"&&i++}n=n.previousSibling}return null}var Ms=Math.random().toString(36).slice(2),Ai="__reactFiber$"+Ms,Ua="__reactProps$"+Ms,Hi="__reactContainer$"+Ms,qu="__reactEvents$"+Ms,T0="__reactListeners$"+Ms,w0="__reactHandles$"+Ms;function Yr(n){var i=n[Ai];if(i)return i;for(var a=n.parentNode;a;){if(i=a[Hi]||a[Ai]){if(a=i.alternate,i.child!==null||a!==null&&a.child!==null)for(n=Gh(n);n!==null;){if(a=n[Ai])return a;n=Gh(n)}return i}n=a,a=n.parentNode}return null}function Fa(n){return n=n[Ai]||n[Hi],!n||n.tag!==5&&n.tag!==6&&n.tag!==13&&n.tag!==3?null:n}function Es(n){if(n.tag===5||n.tag===6)return n.stateNode;throw Error(t(33))}function Fo(n){return n[Ua]||null}var Ku=[],Ts=-1;function hr(n){return{current:n}}function zt(n){0>Ts||(n.current=Ku[Ts],Ku[Ts]=null,Ts--)}function Ot(n,i){Ts++,Ku[Ts]=n.current,n.current=i}var pr={},Tn=hr(pr),zn=hr(!1),qr=pr;function ws(n,i){var a=n.type.contextTypes;if(!a)return pr;var u=n.stateNode;if(u&&u.__reactInternalMemoizedUnmaskedChildContext===i)return u.__reactInternalMemoizedMaskedChildContext;var f={},h;for(h in a)f[h]=i[h];return u&&(n=n.stateNode,n.__reactInternalMemoizedUnmaskedChildContext=i,n.__reactInternalMemoizedMaskedChildContext=f),f}function Vn(n){return n=n.childContextTypes,n!=null}function Oo(){zt(zn),zt(Tn)}function Wh(n,i,a){if(Tn.current!==pr)throw Error(t(168));Ot(Tn,i),Ot(zn,a)}function Xh(n,i,a){var u=n.stateNode;if(i=i.childContextTypes,typeof u.getChildContext!="function")return a;u=u.getChildContext();for(var f in u)if(!(f in i))throw Error(t(108,_e(n)||"Unknown",f));return oe({},a,u)}function Bo(n){return n=(n=n.stateNode)&&n.__reactInternalMemoizedMergedChildContext||pr,qr=Tn.current,Ot(Tn,n),Ot(zn,zn.current),!0}function Yh(n,i,a){var u=n.stateNode;if(!u)throw Error(t(169));a?(n=Xh(n,i,qr),u.__reactInternalMemoizedMergedChildContext=n,zt(zn),zt(Tn),Ot(Tn,n)):zt(zn),Ot(zn,a)}var Gi=null,ko=!1,$u=!1;function qh(n){Gi===null?Gi=[n]:Gi.push(n)}function A0(n){ko=!0,qh(n)}function mr(){if(!$u&&Gi!==null){$u=!0;var n=0,i=pt;try{var a=Gi;for(pt=1;n<a.length;n++){var u=a[n];do u=u(!0);while(u!==null)}Gi=null,ko=!1}catch(f){throw Gi!==null&&(Gi=Gi.slice(n+1)),Wr(xa,mr),f}finally{pt=i,$u=!1}}return null}var As=[],Rs=0,zo=null,Vo=0,ni=[],ii=0,Kr=null,Wi=1,Xi="";function $r(n,i){As[Rs++]=Vo,As[Rs++]=zo,zo=n,Vo=i}function Kh(n,i,a){ni[ii++]=Wi,ni[ii++]=Xi,ni[ii++]=Kr,Kr=n;var u=Wi;n=Xi;var f=32-Ee(u)-1;u&=~(1<<f),a+=1;var h=32-Ee(i)+f;if(30<h){var w=f-f%5;h=(u&(1<<w)-1).toString(32),u>>=w,f-=w,Wi=1<<32-Ee(i)+f|a<<f|u,Xi=h+n}else Wi=1<<h|a<<f|u,Xi=n}function Zu(n){n.return!==null&&($r(n,1),Kh(n,1,0))}function Qu(n){for(;n===zo;)zo=As[--Rs],As[Rs]=null,Vo=As[--Rs],As[Rs]=null;for(;n===Kr;)Kr=ni[--ii],ni[ii]=null,Xi=ni[--ii],ni[ii]=null,Wi=ni[--ii],ni[ii]=null}var $n=null,Zn=null,Xt=!1,mi=null;function $h(n,i){var a=oi(5,null,null,0);a.elementType="DELETED",a.stateNode=i,a.return=n,i=n.deletions,i===null?(n.deletions=[a],n.flags|=16):i.push(a)}function Zh(n,i){switch(n.tag){case 5:var a=n.type;return i=i.nodeType!==1||a.toLowerCase()!==i.nodeName.toLowerCase()?null:i,i!==null?(n.stateNode=i,$n=n,Zn=dr(i.firstChild),!0):!1;case 6:return i=n.pendingProps===""||i.nodeType!==3?null:i,i!==null?(n.stateNode=i,$n=n,Zn=null,!0):!1;case 13:return i=i.nodeType!==8?null:i,i!==null?(a=Kr!==null?{id:Wi,overflow:Xi}:null,n.memoizedState={dehydrated:i,treeContext:a,retryLane:1073741824},a=oi(18,null,null,0),a.stateNode=i,a.return=n,n.child=a,$n=n,Zn=null,!0):!1;default:return!1}}function Ju(n){return(n.mode&1)!==0&&(n.flags&128)===0}function ju(n){if(Xt){var i=Zn;if(i){var a=i;if(!Zh(n,i)){if(Ju(n))throw Error(t(418));i=dr(a.nextSibling);var u=$n;i&&Zh(n,i)?$h(u,a):(n.flags=n.flags&-4097|2,Xt=!1,$n=n)}}else{if(Ju(n))throw Error(t(418));n.flags=n.flags&-4097|2,Xt=!1,$n=n}}}function Qh(n){for(n=n.return;n!==null&&n.tag!==5&&n.tag!==3&&n.tag!==13;)n=n.return;$n=n}function Ho(n){if(n!==$n)return!1;if(!Xt)return Qh(n),Xt=!0,!1;var i;if((i=n.tag!==3)&&!(i=n.tag!==5)&&(i=n.type,i=i!=="head"&&i!=="body"&&!Wu(n.type,n.memoizedProps)),i&&(i=Zn)){if(Ju(n))throw Jh(),Error(t(418));for(;i;)$h(n,i),i=dr(i.nextSibling)}if(Qh(n),n.tag===13){if(n=n.memoizedState,n=n!==null?n.dehydrated:null,!n)throw Error(t(317));e:{for(n=n.nextSibling,i=0;n;){if(n.nodeType===8){var a=n.data;if(a==="/$"){if(i===0){Zn=dr(n.nextSibling);break e}i--}else a!=="$"&&a!=="$!"&&a!=="$?"||i++}n=n.nextSibling}Zn=null}}else Zn=$n?dr(n.stateNode.nextSibling):null;return!0}function Jh(){for(var n=Zn;n;)n=dr(n.nextSibling)}function Cs(){Zn=$n=null,Xt=!1}function ec(n){mi===null?mi=[n]:mi.push(n)}var R0=C.ReactCurrentBatchConfig;function Oa(n,i,a){if(n=a.ref,n!==null&&typeof n!="function"&&typeof n!="object"){if(a._owner){if(a=a._owner,a){if(a.tag!==1)throw Error(t(309));var u=a.stateNode}if(!u)throw Error(t(147,n));var f=u,h=""+n;return i!==null&&i.ref!==null&&typeof i.ref=="function"&&i.ref._stringRef===h?i.ref:(i=function(w){var U=f.refs;w===null?delete U[h]:U[h]=w},i._stringRef=h,i)}if(typeof n!="string")throw Error(t(284));if(!a._owner)throw Error(t(290,n))}return n}function Go(n,i){throw n=Object.prototype.toString.call(i),Error(t(31,n==="[object Object]"?"object with keys {"+Object.keys(i).join(", ")+"}":n))}function jh(n){var i=n._init;return i(n._payload)}function ep(n){function i(J,G){if(n){var te=J.deletions;te===null?(J.deletions=[G],J.flags|=16):te.push(G)}}function a(J,G){if(!n)return null;for(;G!==null;)i(J,G),G=G.sibling;return null}function u(J,G){for(J=new Map;G!==null;)G.key!==null?J.set(G.key,G):J.set(G.index,G),G=G.sibling;return J}function f(J,G){return J=Er(J,G),J.index=0,J.sibling=null,J}function h(J,G,te){return J.index=te,n?(te=J.alternate,te!==null?(te=te.index,te<G?(J.flags|=2,G):te):(J.flags|=2,G)):(J.flags|=1048576,G)}function w(J){return n&&J.alternate===null&&(J.flags|=2),J}function U(J,G,te,Me){return G===null||G.tag!==6?(G=Xc(te,J.mode,Me),G.return=J,G):(G=f(G,te),G.return=J,G)}function B(J,G,te,Me){var Ke=te.type;return Ke===O?xe(J,G,te.props.children,Me,te.key):G!==null&&(G.elementType===Ke||typeof Ke=="object"&&Ke!==null&&Ke.$$typeof===ue&&jh(Ke)===G.type)?(Me=f(G,te.props),Me.ref=Oa(J,G,te),Me.return=J,Me):(Me=hl(te.type,te.key,te.props,null,J.mode,Me),Me.ref=Oa(J,G,te),Me.return=J,Me)}function se(J,G,te,Me){return G===null||G.tag!==4||G.stateNode.containerInfo!==te.containerInfo||G.stateNode.implementation!==te.implementation?(G=Yc(te,J.mode,Me),G.return=J,G):(G=f(G,te.children||[]),G.return=J,G)}function xe(J,G,te,Me,Ke){return G===null||G.tag!==7?(G=is(te,J.mode,Me,Ke),G.return=J,G):(G=f(G,te),G.return=J,G)}function ye(J,G,te){if(typeof G=="string"&&G!==""||typeof G=="number")return G=Xc(""+G,J.mode,te),G.return=J,G;if(typeof G=="object"&&G!==null){switch(G.$$typeof){case I:return te=hl(G.type,G.key,G.props,null,J.mode,te),te.ref=Oa(J,null,G),te.return=J,te;case P:return G=Yc(G,J.mode,te),G.return=J,G;case ue:var Me=G._init;return ye(J,Me(G._payload),te)}if(Yt(G)||ae(G))return G=is(G,J.mode,te,null),G.return=J,G;Go(J,G)}return null}function ve(J,G,te,Me){var Ke=G!==null?G.key:null;if(typeof te=="string"&&te!==""||typeof te=="number")return Ke!==null?null:U(J,G,""+te,Me);if(typeof te=="object"&&te!==null){switch(te.$$typeof){case I:return te.key===Ke?B(J,G,te,Me):null;case P:return te.key===Ke?se(J,G,te,Me):null;case ue:return Ke=te._init,ve(J,G,Ke(te._payload),Me)}if(Yt(te)||ae(te))return Ke!==null?null:xe(J,G,te,Me,null);Go(J,te)}return null}function Fe(J,G,te,Me,Ke){if(typeof Me=="string"&&Me!==""||typeof Me=="number")return J=J.get(te)||null,U(G,J,""+Me,Ke);if(typeof Me=="object"&&Me!==null){switch(Me.$$typeof){case I:return J=J.get(Me.key===null?te:Me.key)||null,B(G,J,Me,Ke);case P:return J=J.get(Me.key===null?te:Me.key)||null,se(G,J,Me,Ke);case ue:var tt=Me._init;return Fe(J,G,te,tt(Me._payload),Ke)}if(Yt(Me)||ae(Me))return J=J.get(te)||null,xe(G,J,Me,Ke,null);Go(G,Me)}return null}function Ve(J,G,te,Me){for(var Ke=null,tt=null,nt=G,at=G=0,pn=null;nt!==null&&at<te.length;at++){nt.index>at?(pn=nt,nt=null):pn=nt.sibling;var Tt=ve(J,nt,te[at],Me);if(Tt===null){nt===null&&(nt=pn);break}n&&nt&&Tt.alternate===null&&i(J,nt),G=h(Tt,G,at),tt===null?Ke=Tt:tt.sibling=Tt,tt=Tt,nt=pn}if(at===te.length)return a(J,nt),Xt&&$r(J,at),Ke;if(nt===null){for(;at<te.length;at++)nt=ye(J,te[at],Me),nt!==null&&(G=h(nt,G,at),tt===null?Ke=nt:tt.sibling=nt,tt=nt);return Xt&&$r(J,at),Ke}for(nt=u(J,nt);at<te.length;at++)pn=Fe(nt,J,at,te[at],Me),pn!==null&&(n&&pn.alternate!==null&&nt.delete(pn.key===null?at:pn.key),G=h(pn,G,at),tt===null?Ke=pn:tt.sibling=pn,tt=pn);return n&&nt.forEach(function(Tr){return i(J,Tr)}),Xt&&$r(J,at),Ke}function We(J,G,te,Me){var Ke=ae(te);if(typeof Ke!="function")throw Error(t(150));if(te=Ke.call(te),te==null)throw Error(t(151));for(var tt=Ke=null,nt=G,at=G=0,pn=null,Tt=te.next();nt!==null&&!Tt.done;at++,Tt=te.next()){nt.index>at?(pn=nt,nt=null):pn=nt.sibling;var Tr=ve(J,nt,Tt.value,Me);if(Tr===null){nt===null&&(nt=pn);break}n&&nt&&Tr.alternate===null&&i(J,nt),G=h(Tr,G,at),tt===null?Ke=Tr:tt.sibling=Tr,tt=Tr,nt=pn}if(Tt.done)return a(J,nt),Xt&&$r(J,at),Ke;if(nt===null){for(;!Tt.done;at++,Tt=te.next())Tt=ye(J,Tt.value,Me),Tt!==null&&(G=h(Tt,G,at),tt===null?Ke=Tt:tt.sibling=Tt,tt=Tt);return Xt&&$r(J,at),Ke}for(nt=u(J,nt);!Tt.done;at++,Tt=te.next())Tt=Fe(nt,J,at,Tt.value,Me),Tt!==null&&(n&&Tt.alternate!==null&&nt.delete(Tt.key===null?at:Tt.key),G=h(Tt,G,at),tt===null?Ke=Tt:tt.sibling=Tt,tt=Tt);return n&&nt.forEach(function(av){return i(J,av)}),Xt&&$r(J,at),Ke}function en(J,G,te,Me){if(typeof te=="object"&&te!==null&&te.type===O&&te.key===null&&(te=te.props.children),typeof te=="object"&&te!==null){switch(te.$$typeof){case I:e:{for(var Ke=te.key,tt=G;tt!==null;){if(tt.key===Ke){if(Ke=te.type,Ke===O){if(tt.tag===7){a(J,tt.sibling),G=f(tt,te.props.children),G.return=J,J=G;break e}}else if(tt.elementType===Ke||typeof Ke=="object"&&Ke!==null&&Ke.$$typeof===ue&&jh(Ke)===tt.type){a(J,tt.sibling),G=f(tt,te.props),G.ref=Oa(J,tt,te),G.return=J,J=G;break e}a(J,tt);break}else i(J,tt);tt=tt.sibling}te.type===O?(G=is(te.props.children,J.mode,Me,te.key),G.return=J,J=G):(Me=hl(te.type,te.key,te.props,null,J.mode,Me),Me.ref=Oa(J,G,te),Me.return=J,J=Me)}return w(J);case P:e:{for(tt=te.key;G!==null;){if(G.key===tt)if(G.tag===4&&G.stateNode.containerInfo===te.containerInfo&&G.stateNode.implementation===te.implementation){a(J,G.sibling),G=f(G,te.children||[]),G.return=J,J=G;break e}else{a(J,G);break}else i(J,G);G=G.sibling}G=Yc(te,J.mode,Me),G.return=J,J=G}return w(J);case ue:return tt=te._init,en(J,G,tt(te._payload),Me)}if(Yt(te))return Ve(J,G,te,Me);if(ae(te))return We(J,G,te,Me);Go(J,te)}return typeof te=="string"&&te!==""||typeof te=="number"?(te=""+te,G!==null&&G.tag===6?(a(J,G.sibling),G=f(G,te),G.return=J,J=G):(a(J,G),G=Xc(te,J.mode,Me),G.return=J,J=G),w(J)):a(J,G)}return en}var bs=ep(!0),tp=ep(!1),Wo=hr(null),Xo=null,Ps=null,tc=null;function nc(){tc=Ps=Xo=null}function ic(n){var i=Wo.current;zt(Wo),n._currentValue=i}function rc(n,i,a){for(;n!==null;){var u=n.alternate;if((n.childLanes&i)!==i?(n.childLanes|=i,u!==null&&(u.childLanes|=i)):u!==null&&(u.childLanes&i)!==i&&(u.childLanes|=i),n===a)break;n=n.return}}function Ls(n,i){Xo=n,tc=Ps=null,n=n.dependencies,n!==null&&n.firstContext!==null&&(n.lanes&i&&(Hn=!0),n.firstContext=null)}function ri(n){var i=n._currentValue;if(tc!==n)if(n={context:n,memoizedValue:i,next:null},Ps===null){if(Xo===null)throw Error(t(308));Ps=n,Xo.dependencies={lanes:0,firstContext:n}}else Ps=Ps.next=n;return i}var Zr=null;function sc(n){Zr===null?Zr=[n]:Zr.push(n)}function np(n,i,a,u){var f=i.interleaved;return f===null?(a.next=a,sc(i)):(a.next=f.next,f.next=a),i.interleaved=a,Yi(n,u)}function Yi(n,i){n.lanes|=i;var a=n.alternate;for(a!==null&&(a.lanes|=i),a=n,n=n.return;n!==null;)n.childLanes|=i,a=n.alternate,a!==null&&(a.childLanes|=i),a=n,n=n.return;return a.tag===3?a.stateNode:null}var gr=!1;function ac(n){n.updateQueue={baseState:n.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,interleaved:null,lanes:0},effects:null}}function ip(n,i){n=n.updateQueue,i.updateQueue===n&&(i.updateQueue={baseState:n.baseState,firstBaseUpdate:n.firstBaseUpdate,lastBaseUpdate:n.lastBaseUpdate,shared:n.shared,effects:n.effects})}function qi(n,i){return{eventTime:n,lane:i,tag:0,payload:null,callback:null,next:null}}function _r(n,i,a){var u=n.updateQueue;if(u===null)return null;if(u=u.shared,Mt&2){var f=u.pending;return f===null?i.next=i:(i.next=f.next,f.next=i),u.pending=i,Yi(n,a)}return f=u.interleaved,f===null?(i.next=i,sc(u)):(i.next=f.next,f.next=i),u.interleaved=i,Yi(n,a)}function Yo(n,i,a){if(i=i.updateQueue,i!==null&&(i=i.shared,(a&4194240)!==0)){var u=i.lanes;u&=n.pendingLanes,a|=u,i.lanes=a,kn(n,a)}}function rp(n,i){var a=n.updateQueue,u=n.alternate;if(u!==null&&(u=u.updateQueue,a===u)){var f=null,h=null;if(a=a.firstBaseUpdate,a!==null){do{var w={eventTime:a.eventTime,lane:a.lane,tag:a.tag,payload:a.payload,callback:a.callback,next:null};h===null?f=h=w:h=h.next=w,a=a.next}while(a!==null);h===null?f=h=i:h=h.next=i}else f=h=i;a={baseState:u.baseState,firstBaseUpdate:f,lastBaseUpdate:h,shared:u.shared,effects:u.effects},n.updateQueue=a;return}n=a.lastBaseUpdate,n===null?a.firstBaseUpdate=i:n.next=i,a.lastBaseUpdate=i}function qo(n,i,a,u){var f=n.updateQueue;gr=!1;var h=f.firstBaseUpdate,w=f.lastBaseUpdate,U=f.shared.pending;if(U!==null){f.shared.pending=null;var B=U,se=B.next;B.next=null,w===null?h=se:w.next=se,w=B;var xe=n.alternate;xe!==null&&(xe=xe.updateQueue,U=xe.lastBaseUpdate,U!==w&&(U===null?xe.firstBaseUpdate=se:U.next=se,xe.lastBaseUpdate=B))}if(h!==null){var ye=f.baseState;w=0,xe=se=B=null,U=h;do{var ve=U.lane,Fe=U.eventTime;if((u&ve)===ve){xe!==null&&(xe=xe.next={eventTime:Fe,lane:0,tag:U.tag,payload:U.payload,callback:U.callback,next:null});e:{var Ve=n,We=U;switch(ve=i,Fe=a,We.tag){case 1:if(Ve=We.payload,typeof Ve=="function"){ye=Ve.call(Fe,ye,ve);break e}ye=Ve;break e;case 3:Ve.flags=Ve.flags&-65537|128;case 0:if(Ve=We.payload,ve=typeof Ve=="function"?Ve.call(Fe,ye,ve):Ve,ve==null)break e;ye=oe({},ye,ve);break e;case 2:gr=!0}}U.callback!==null&&U.lane!==0&&(n.flags|=64,ve=f.effects,ve===null?f.effects=[U]:ve.push(U))}else Fe={eventTime:Fe,lane:ve,tag:U.tag,payload:U.payload,callback:U.callback,next:null},xe===null?(se=xe=Fe,B=ye):xe=xe.next=Fe,w|=ve;if(U=U.next,U===null){if(U=f.shared.pending,U===null)break;ve=U,U=ve.next,ve.next=null,f.lastBaseUpdate=ve,f.shared.pending=null}}while(!0);if(xe===null&&(B=ye),f.baseState=B,f.firstBaseUpdate=se,f.lastBaseUpdate=xe,i=f.shared.interleaved,i!==null){f=i;do w|=f.lane,f=f.next;while(f!==i)}else h===null&&(f.shared.lanes=0);jr|=w,n.lanes=w,n.memoizedState=ye}}function sp(n,i,a){if(n=i.effects,i.effects=null,n!==null)for(i=0;i<n.length;i++){var u=n[i],f=u.callback;if(f!==null){if(u.callback=null,u=a,typeof f!="function")throw Error(t(191,f));f.call(u)}}}var Ba={},Ri=hr(Ba),ka=hr(Ba),za=hr(Ba);function Qr(n){if(n===Ba)throw Error(t(174));return n}function oc(n,i){switch(Ot(za,i),Ot(ka,n),Ot(Ri,Ba),n=i.nodeType,n){case 9:case 11:i=(i=i.documentElement)?i.namespaceURI:S(null,"");break;default:n=n===8?i.parentNode:i,i=n.namespaceURI||null,n=n.tagName,i=S(i,n)}zt(Ri),Ot(Ri,i)}function Ds(){zt(Ri),zt(ka),zt(za)}function ap(n){Qr(za.current);var i=Qr(Ri.current),a=S(i,n.type);i!==a&&(Ot(ka,n),Ot(Ri,a))}function lc(n){ka.current===n&&(zt(Ri),zt(ka))}var Kt=hr(0);function Ko(n){for(var i=n;i!==null;){if(i.tag===13){var a=i.memoizedState;if(a!==null&&(a=a.dehydrated,a===null||a.data==="$?"||a.data==="$!"))return i}else if(i.tag===19&&i.memoizedProps.revealOrder!==void 0){if(i.flags&128)return i}else if(i.child!==null){i.child.return=i,i=i.child;continue}if(i===n)break;for(;i.sibling===null;){if(i.return===null||i.return===n)return null;i=i.return}i.sibling.return=i.return,i=i.sibling}return null}var uc=[];function cc(){for(var n=0;n<uc.length;n++)uc[n]._workInProgressVersionPrimary=null;uc.length=0}var $o=C.ReactCurrentDispatcher,fc=C.ReactCurrentBatchConfig,Jr=0,$t=null,on=null,dn=null,Zo=!1,Va=!1,Ha=0,C0=0;function wn(){throw Error(t(321))}function dc(n,i){if(i===null)return!1;for(var a=0;a<i.length&&a<n.length;a++)if(!pi(n[a],i[a]))return!1;return!0}function hc(n,i,a,u,f,h){if(Jr=h,$t=i,i.memoizedState=null,i.updateQueue=null,i.lanes=0,$o.current=n===null||n.memoizedState===null?D0:N0,n=a(u,f),Va){h=0;do{if(Va=!1,Ha=0,25<=h)throw Error(t(301));h+=1,dn=on=null,i.updateQueue=null,$o.current=I0,n=a(u,f)}while(Va)}if($o.current=jo,i=on!==null&&on.next!==null,Jr=0,dn=on=$t=null,Zo=!1,i)throw Error(t(300));return n}function pc(){var n=Ha!==0;return Ha=0,n}function Ci(){var n={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return dn===null?$t.memoizedState=dn=n:dn=dn.next=n,dn}function si(){if(on===null){var n=$t.alternate;n=n!==null?n.memoizedState:null}else n=on.next;var i=dn===null?$t.memoizedState:dn.next;if(i!==null)dn=i,on=n;else{if(n===null)throw Error(t(310));on=n,n={memoizedState:on.memoizedState,baseState:on.baseState,baseQueue:on.baseQueue,queue:on.queue,next:null},dn===null?$t.memoizedState=dn=n:dn=dn.next=n}return dn}function Ga(n,i){return typeof i=="function"?i(n):i}function mc(n){var i=si(),a=i.queue;if(a===null)throw Error(t(311));a.lastRenderedReducer=n;var u=on,f=u.baseQueue,h=a.pending;if(h!==null){if(f!==null){var w=f.next;f.next=h.next,h.next=w}u.baseQueue=f=h,a.pending=null}if(f!==null){h=f.next,u=u.baseState;var U=w=null,B=null,se=h;do{var xe=se.lane;if((Jr&xe)===xe)B!==null&&(B=B.next={lane:0,action:se.action,hasEagerState:se.hasEagerState,eagerState:se.eagerState,next:null}),u=se.hasEagerState?se.eagerState:n(u,se.action);else{var ye={lane:xe,action:se.action,hasEagerState:se.hasEagerState,eagerState:se.eagerState,next:null};B===null?(U=B=ye,w=u):B=B.next=ye,$t.lanes|=xe,jr|=xe}se=se.next}while(se!==null&&se!==h);B===null?w=u:B.next=U,pi(u,i.memoizedState)||(Hn=!0),i.memoizedState=u,i.baseState=w,i.baseQueue=B,a.lastRenderedState=u}if(n=a.interleaved,n!==null){f=n;do h=f.lane,$t.lanes|=h,jr|=h,f=f.next;while(f!==n)}else f===null&&(a.lanes=0);return[i.memoizedState,a.dispatch]}function gc(n){var i=si(),a=i.queue;if(a===null)throw Error(t(311));a.lastRenderedReducer=n;var u=a.dispatch,f=a.pending,h=i.memoizedState;if(f!==null){a.pending=null;var w=f=f.next;do h=n(h,w.action),w=w.next;while(w!==f);pi(h,i.memoizedState)||(Hn=!0),i.memoizedState=h,i.baseQueue===null&&(i.baseState=h),a.lastRenderedState=h}return[h,u]}function op(){}function lp(n,i){var a=$t,u=si(),f=i(),h=!pi(u.memoizedState,f);if(h&&(u.memoizedState=f,Hn=!0),u=u.queue,_c(fp.bind(null,a,u,n),[n]),u.getSnapshot!==i||h||dn!==null&&dn.memoizedState.tag&1){if(a.flags|=2048,Wa(9,cp.bind(null,a,u,f,i),void 0,null),hn===null)throw Error(t(349));Jr&30||up(a,i,f)}return f}function up(n,i,a){n.flags|=16384,n={getSnapshot:i,value:a},i=$t.updateQueue,i===null?(i={lastEffect:null,stores:null},$t.updateQueue=i,i.stores=[n]):(a=i.stores,a===null?i.stores=[n]:a.push(n))}function cp(n,i,a,u){i.value=a,i.getSnapshot=u,dp(i)&&hp(n)}function fp(n,i,a){return a(function(){dp(i)&&hp(n)})}function dp(n){var i=n.getSnapshot;n=n.value;try{var a=i();return!pi(n,a)}catch{return!0}}function hp(n){var i=Yi(n,1);i!==null&&xi(i,n,1,-1)}function pp(n){var i=Ci();return typeof n=="function"&&(n=n()),i.memoizedState=i.baseState=n,n={pending:null,interleaved:null,lanes:0,dispatch:null,lastRenderedReducer:Ga,lastRenderedState:n},i.queue=n,n=n.dispatch=L0.bind(null,$t,n),[i.memoizedState,n]}function Wa(n,i,a,u){return n={tag:n,create:i,destroy:a,deps:u,next:null},i=$t.updateQueue,i===null?(i={lastEffect:null,stores:null},$t.updateQueue=i,i.lastEffect=n.next=n):(a=i.lastEffect,a===null?i.lastEffect=n.next=n:(u=a.next,a.next=n,n.next=u,i.lastEffect=n)),n}function mp(){return si().memoizedState}function Qo(n,i,a,u){var f=Ci();$t.flags|=n,f.memoizedState=Wa(1|i,a,void 0,u===void 0?null:u)}function Jo(n,i,a,u){var f=si();u=u===void 0?null:u;var h=void 0;if(on!==null){var w=on.memoizedState;if(h=w.destroy,u!==null&&dc(u,w.deps)){f.memoizedState=Wa(i,a,h,u);return}}$t.flags|=n,f.memoizedState=Wa(1|i,a,h,u)}function gp(n,i){return Qo(8390656,8,n,i)}function _c(n,i){return Jo(2048,8,n,i)}function _p(n,i){return Jo(4,2,n,i)}function vp(n,i){return Jo(4,4,n,i)}function xp(n,i){if(typeof i=="function")return n=n(),i(n),function(){i(null)};if(i!=null)return n=n(),i.current=n,function(){i.current=null}}function yp(n,i,a){return a=a!=null?a.concat([n]):null,Jo(4,4,xp.bind(null,i,n),a)}function vc(){}function Sp(n,i){var a=si();i=i===void 0?null:i;var u=a.memoizedState;return u!==null&&i!==null&&dc(i,u[1])?u[0]:(a.memoizedState=[n,i],n)}function Mp(n,i){var a=si();i=i===void 0?null:i;var u=a.memoizedState;return u!==null&&i!==null&&dc(i,u[1])?u[0]:(n=n(),a.memoizedState=[n,i],n)}function Ep(n,i,a){return Jr&21?(pi(a,i)||(a=Ue(),$t.lanes|=a,jr|=a,n.baseState=!0),i):(n.baseState&&(n.baseState=!1,Hn=!0),n.memoizedState=a)}function b0(n,i){var a=pt;pt=a!==0&&4>a?a:4,n(!0);var u=fc.transition;fc.transition={};try{n(!1),i()}finally{pt=a,fc.transition=u}}function Tp(){return si().memoizedState}function P0(n,i,a){var u=Sr(n);if(a={lane:u,action:a,hasEagerState:!1,eagerState:null,next:null},wp(n))Ap(i,a);else if(a=np(n,i,a,u),a!==null){var f=Nn();xi(a,n,u,f),Rp(a,i,u)}}function L0(n,i,a){var u=Sr(n),f={lane:u,action:a,hasEagerState:!1,eagerState:null,next:null};if(wp(n))Ap(i,f);else{var h=n.alternate;if(n.lanes===0&&(h===null||h.lanes===0)&&(h=i.lastRenderedReducer,h!==null))try{var w=i.lastRenderedState,U=h(w,a);if(f.hasEagerState=!0,f.eagerState=U,pi(U,w)){var B=i.interleaved;B===null?(f.next=f,sc(i)):(f.next=B.next,B.next=f),i.interleaved=f;return}}catch{}finally{}a=np(n,i,f,u),a!==null&&(f=Nn(),xi(a,n,u,f),Rp(a,i,u))}}function wp(n){var i=n.alternate;return n===$t||i!==null&&i===$t}function Ap(n,i){Va=Zo=!0;var a=n.pending;a===null?i.next=i:(i.next=a.next,a.next=i),n.pending=i}function Rp(n,i,a){if(a&4194240){var u=i.lanes;u&=n.pendingLanes,a|=u,i.lanes=a,kn(n,a)}}var jo={readContext:ri,useCallback:wn,useContext:wn,useEffect:wn,useImperativeHandle:wn,useInsertionEffect:wn,useLayoutEffect:wn,useMemo:wn,useReducer:wn,useRef:wn,useState:wn,useDebugValue:wn,useDeferredValue:wn,useTransition:wn,useMutableSource:wn,useSyncExternalStore:wn,useId:wn,unstable_isNewReconciler:!1},D0={readContext:ri,useCallback:function(n,i){return Ci().memoizedState=[n,i===void 0?null:i],n},useContext:ri,useEffect:gp,useImperativeHandle:function(n,i,a){return a=a!=null?a.concat([n]):null,Qo(4194308,4,xp.bind(null,i,n),a)},useLayoutEffect:function(n,i){return Qo(4194308,4,n,i)},useInsertionEffect:function(n,i){return Qo(4,2,n,i)},useMemo:function(n,i){var a=Ci();return i=i===void 0?null:i,n=n(),a.memoizedState=[n,i],n},useReducer:function(n,i,a){var u=Ci();return i=a!==void 0?a(i):i,u.memoizedState=u.baseState=i,n={pending:null,interleaved:null,lanes:0,dispatch:null,lastRenderedReducer:n,lastRenderedState:i},u.queue=n,n=n.dispatch=P0.bind(null,$t,n),[u.memoizedState,n]},useRef:function(n){var i=Ci();return n={current:n},i.memoizedState=n},useState:pp,useDebugValue:vc,useDeferredValue:function(n){return Ci().memoizedState=n},useTransition:function(){var n=pp(!1),i=n[0];return n=b0.bind(null,n[1]),Ci().memoizedState=n,[i,n]},useMutableSource:function(){},useSyncExternalStore:function(n,i,a){var u=$t,f=Ci();if(Xt){if(a===void 0)throw Error(t(407));a=a()}else{if(a=i(),hn===null)throw Error(t(349));Jr&30||up(u,i,a)}f.memoizedState=a;var h={value:a,getSnapshot:i};return f.queue=h,gp(fp.bind(null,u,h,n),[n]),u.flags|=2048,Wa(9,cp.bind(null,u,h,a,i),void 0,null),a},useId:function(){var n=Ci(),i=hn.identifierPrefix;if(Xt){var a=Xi,u=Wi;a=(u&~(1<<32-Ee(u)-1)).toString(32)+a,i=":"+i+"R"+a,a=Ha++,0<a&&(i+="H"+a.toString(32)),i+=":"}else a=C0++,i=":"+i+"r"+a.toString(32)+":";return n.memoizedState=i},unstable_isNewReconciler:!1},N0={readContext:ri,useCallback:Sp,useContext:ri,useEffect:_c,useImperativeHandle:yp,useInsertionEffect:_p,useLayoutEffect:vp,useMemo:Mp,useReducer:mc,useRef:mp,useState:function(){return mc(Ga)},useDebugValue:vc,useDeferredValue:function(n){var i=si();return Ep(i,on.memoizedState,n)},useTransition:function(){var n=mc(Ga)[0],i=si().memoizedState;return[n,i]},useMutableSource:op,useSyncExternalStore:lp,useId:Tp,unstable_isNewReconciler:!1},I0={readContext:ri,useCallback:Sp,useContext:ri,useEffect:_c,useImperativeHandle:yp,useInsertionEffect:_p,useLayoutEffect:vp,useMemo:Mp,useReducer:gc,useRef:mp,useState:function(){return gc(Ga)},useDebugValue:vc,useDeferredValue:function(n){var i=si();return on===null?i.memoizedState=n:Ep(i,on.memoizedState,n)},useTransition:function(){var n=gc(Ga)[0],i=si().memoizedState;return[n,i]},useMutableSource:op,useSyncExternalStore:lp,useId:Tp,unstable_isNewReconciler:!1};function gi(n,i){if(n&&n.defaultProps){i=oe({},i),n=n.defaultProps;for(var a in n)i[a]===void 0&&(i[a]=n[a]);return i}return i}function xc(n,i,a,u){i=n.memoizedState,a=a(u,i),a=a==null?i:oe({},i,a),n.memoizedState=a,n.lanes===0&&(n.updateQueue.baseState=a)}var el={isMounted:function(n){return(n=n._reactInternals)?Ln(n)===n:!1},enqueueSetState:function(n,i,a){n=n._reactInternals;var u=Nn(),f=Sr(n),h=qi(u,f);h.payload=i,a!=null&&(h.callback=a),i=_r(n,h,f),i!==null&&(xi(i,n,f,u),Yo(i,n,f))},enqueueReplaceState:function(n,i,a){n=n._reactInternals;var u=Nn(),f=Sr(n),h=qi(u,f);h.tag=1,h.payload=i,a!=null&&(h.callback=a),i=_r(n,h,f),i!==null&&(xi(i,n,f,u),Yo(i,n,f))},enqueueForceUpdate:function(n,i){n=n._reactInternals;var a=Nn(),u=Sr(n),f=qi(a,u);f.tag=2,i!=null&&(f.callback=i),i=_r(n,f,u),i!==null&&(xi(i,n,u,a),Yo(i,n,u))}};function Cp(n,i,a,u,f,h,w){return n=n.stateNode,typeof n.shouldComponentUpdate=="function"?n.shouldComponentUpdate(u,h,w):i.prototype&&i.prototype.isPureReactComponent?!Pa(a,u)||!Pa(f,h):!0}function bp(n,i,a){var u=!1,f=pr,h=i.contextType;return typeof h=="object"&&h!==null?h=ri(h):(f=Vn(i)?qr:Tn.current,u=i.contextTypes,h=(u=u!=null)?ws(n,f):pr),i=new i(a,h),n.memoizedState=i.state!==null&&i.state!==void 0?i.state:null,i.updater=el,n.stateNode=i,i._reactInternals=n,u&&(n=n.stateNode,n.__reactInternalMemoizedUnmaskedChildContext=f,n.__reactInternalMemoizedMaskedChildContext=h),i}function Pp(n,i,a,u){n=i.state,typeof i.componentWillReceiveProps=="function"&&i.componentWillReceiveProps(a,u),typeof i.UNSAFE_componentWillReceiveProps=="function"&&i.UNSAFE_componentWillReceiveProps(a,u),i.state!==n&&el.enqueueReplaceState(i,i.state,null)}function yc(n,i,a,u){var f=n.stateNode;f.props=a,f.state=n.memoizedState,f.refs={},ac(n);var h=i.contextType;typeof h=="object"&&h!==null?f.context=ri(h):(h=Vn(i)?qr:Tn.current,f.context=ws(n,h)),f.state=n.memoizedState,h=i.getDerivedStateFromProps,typeof h=="function"&&(xc(n,i,h,a),f.state=n.memoizedState),typeof i.getDerivedStateFromProps=="function"||typeof f.getSnapshotBeforeUpdate=="function"||typeof f.UNSAFE_componentWillMount!="function"&&typeof f.componentWillMount!="function"||(i=f.state,typeof f.componentWillMount=="function"&&f.componentWillMount(),typeof f.UNSAFE_componentWillMount=="function"&&f.UNSAFE_componentWillMount(),i!==f.state&&el.enqueueReplaceState(f,f.state,null),qo(n,a,f,u),f.state=n.memoizedState),typeof f.componentDidMount=="function"&&(n.flags|=4194308)}function Ns(n,i){try{var a="",u=i;do a+=ke(u),u=u.return;while(u);var f=a}catch(h){f=`
Error generating stack: `+h.message+`
`+h.stack}return{value:n,source:i,stack:f,digest:null}}function Sc(n,i,a){return{value:n,source:null,stack:a??null,digest:i??null}}function Mc(n,i){try{console.error(i.value)}catch(a){setTimeout(function(){throw a})}}var U0=typeof WeakMap=="function"?WeakMap:Map;function Lp(n,i,a){a=qi(-1,a),a.tag=3,a.payload={element:null};var u=i.value;return a.callback=function(){ol||(ol=!0,Oc=u),Mc(n,i)},a}function Dp(n,i,a){a=qi(-1,a),a.tag=3;var u=n.type.getDerivedStateFromError;if(typeof u=="function"){var f=i.value;a.payload=function(){return u(f)},a.callback=function(){Mc(n,i)}}var h=n.stateNode;return h!==null&&typeof h.componentDidCatch=="function"&&(a.callback=function(){Mc(n,i),typeof u!="function"&&(xr===null?xr=new Set([this]):xr.add(this));var w=i.stack;this.componentDidCatch(i.value,{componentStack:w!==null?w:""})}),a}function Np(n,i,a){var u=n.pingCache;if(u===null){u=n.pingCache=new U0;var f=new Set;u.set(i,f)}else f=u.get(i),f===void 0&&(f=new Set,u.set(i,f));f.has(a)||(f.add(a),n=$0.bind(null,n,i,a),i.then(n,n))}function Ip(n){do{var i;if((i=n.tag===13)&&(i=n.memoizedState,i=i!==null?i.dehydrated!==null:!0),i)return n;n=n.return}while(n!==null);return null}function Up(n,i,a,u,f){return n.mode&1?(n.flags|=65536,n.lanes=f,n):(n===i?n.flags|=65536:(n.flags|=128,a.flags|=131072,a.flags&=-52805,a.tag===1&&(a.alternate===null?a.tag=17:(i=qi(-1,1),i.tag=2,_r(a,i,1))),a.lanes|=1),n)}var F0=C.ReactCurrentOwner,Hn=!1;function Dn(n,i,a,u){i.child=n===null?tp(i,null,a,u):bs(i,n.child,a,u)}function Fp(n,i,a,u,f){a=a.render;var h=i.ref;return Ls(i,f),u=hc(n,i,a,u,h,f),a=pc(),n!==null&&!Hn?(i.updateQueue=n.updateQueue,i.flags&=-2053,n.lanes&=~f,Ki(n,i,f)):(Xt&&a&&Zu(i),i.flags|=1,Dn(n,i,u,f),i.child)}function Op(n,i,a,u,f){if(n===null){var h=a.type;return typeof h=="function"&&!Wc(h)&&h.defaultProps===void 0&&a.compare===null&&a.defaultProps===void 0?(i.tag=15,i.type=h,Bp(n,i,h,u,f)):(n=hl(a.type,null,u,i,i.mode,f),n.ref=i.ref,n.return=i,i.child=n)}if(h=n.child,!(n.lanes&f)){var w=h.memoizedProps;if(a=a.compare,a=a!==null?a:Pa,a(w,u)&&n.ref===i.ref)return Ki(n,i,f)}return i.flags|=1,n=Er(h,u),n.ref=i.ref,n.return=i,i.child=n}function Bp(n,i,a,u,f){if(n!==null){var h=n.memoizedProps;if(Pa(h,u)&&n.ref===i.ref)if(Hn=!1,i.pendingProps=u=h,(n.lanes&f)!==0)n.flags&131072&&(Hn=!0);else return i.lanes=n.lanes,Ki(n,i,f)}return Ec(n,i,a,u,f)}function kp(n,i,a){var u=i.pendingProps,f=u.children,h=n!==null?n.memoizedState:null;if(u.mode==="hidden")if(!(i.mode&1))i.memoizedState={baseLanes:0,cachePool:null,transitions:null},Ot(Us,Qn),Qn|=a;else{if(!(a&1073741824))return n=h!==null?h.baseLanes|a:a,i.lanes=i.childLanes=1073741824,i.memoizedState={baseLanes:n,cachePool:null,transitions:null},i.updateQueue=null,Ot(Us,Qn),Qn|=n,null;i.memoizedState={baseLanes:0,cachePool:null,transitions:null},u=h!==null?h.baseLanes:a,Ot(Us,Qn),Qn|=u}else h!==null?(u=h.baseLanes|a,i.memoizedState=null):u=a,Ot(Us,Qn),Qn|=u;return Dn(n,i,f,a),i.child}function zp(n,i){var a=i.ref;(n===null&&a!==null||n!==null&&n.ref!==a)&&(i.flags|=512,i.flags|=2097152)}function Ec(n,i,a,u,f){var h=Vn(a)?qr:Tn.current;return h=ws(i,h),Ls(i,f),a=hc(n,i,a,u,h,f),u=pc(),n!==null&&!Hn?(i.updateQueue=n.updateQueue,i.flags&=-2053,n.lanes&=~f,Ki(n,i,f)):(Xt&&u&&Zu(i),i.flags|=1,Dn(n,i,a,f),i.child)}function Vp(n,i,a,u,f){if(Vn(a)){var h=!0;Bo(i)}else h=!1;if(Ls(i,f),i.stateNode===null)nl(n,i),bp(i,a,u),yc(i,a,u,f),u=!0;else if(n===null){var w=i.stateNode,U=i.memoizedProps;w.props=U;var B=w.context,se=a.contextType;typeof se=="object"&&se!==null?se=ri(se):(se=Vn(a)?qr:Tn.current,se=ws(i,se));var xe=a.getDerivedStateFromProps,ye=typeof xe=="function"||typeof w.getSnapshotBeforeUpdate=="function";ye||typeof w.UNSAFE_componentWillReceiveProps!="function"&&typeof w.componentWillReceiveProps!="function"||(U!==u||B!==se)&&Pp(i,w,u,se),gr=!1;var ve=i.memoizedState;w.state=ve,qo(i,u,w,f),B=i.memoizedState,U!==u||ve!==B||zn.current||gr?(typeof xe=="function"&&(xc(i,a,xe,u),B=i.memoizedState),(U=gr||Cp(i,a,U,u,ve,B,se))?(ye||typeof w.UNSAFE_componentWillMount!="function"&&typeof w.componentWillMount!="function"||(typeof w.componentWillMount=="function"&&w.componentWillMount(),typeof w.UNSAFE_componentWillMount=="function"&&w.UNSAFE_componentWillMount()),typeof w.componentDidMount=="function"&&(i.flags|=4194308)):(typeof w.componentDidMount=="function"&&(i.flags|=4194308),i.memoizedProps=u,i.memoizedState=B),w.props=u,w.state=B,w.context=se,u=U):(typeof w.componentDidMount=="function"&&(i.flags|=4194308),u=!1)}else{w=i.stateNode,ip(n,i),U=i.memoizedProps,se=i.type===i.elementType?U:gi(i.type,U),w.props=se,ye=i.pendingProps,ve=w.context,B=a.contextType,typeof B=="object"&&B!==null?B=ri(B):(B=Vn(a)?qr:Tn.current,B=ws(i,B));var Fe=a.getDerivedStateFromProps;(xe=typeof Fe=="function"||typeof w.getSnapshotBeforeUpdate=="function")||typeof w.UNSAFE_componentWillReceiveProps!="function"&&typeof w.componentWillReceiveProps!="function"||(U!==ye||ve!==B)&&Pp(i,w,u,B),gr=!1,ve=i.memoizedState,w.state=ve,qo(i,u,w,f);var Ve=i.memoizedState;U!==ye||ve!==Ve||zn.current||gr?(typeof Fe=="function"&&(xc(i,a,Fe,u),Ve=i.memoizedState),(se=gr||Cp(i,a,se,u,ve,Ve,B)||!1)?(xe||typeof w.UNSAFE_componentWillUpdate!="function"&&typeof w.componentWillUpdate!="function"||(typeof w.componentWillUpdate=="function"&&w.componentWillUpdate(u,Ve,B),typeof w.UNSAFE_componentWillUpdate=="function"&&w.UNSAFE_componentWillUpdate(u,Ve,B)),typeof w.componentDidUpdate=="function"&&(i.flags|=4),typeof w.getSnapshotBeforeUpdate=="function"&&(i.flags|=1024)):(typeof w.componentDidUpdate!="function"||U===n.memoizedProps&&ve===n.memoizedState||(i.flags|=4),typeof w.getSnapshotBeforeUpdate!="function"||U===n.memoizedProps&&ve===n.memoizedState||(i.flags|=1024),i.memoizedProps=u,i.memoizedState=Ve),w.props=u,w.state=Ve,w.context=B,u=se):(typeof w.componentDidUpdate!="function"||U===n.memoizedProps&&ve===n.memoizedState||(i.flags|=4),typeof w.getSnapshotBeforeUpdate!="function"||U===n.memoizedProps&&ve===n.memoizedState||(i.flags|=1024),u=!1)}return Tc(n,i,a,u,h,f)}function Tc(n,i,a,u,f,h){zp(n,i);var w=(i.flags&128)!==0;if(!u&&!w)return f&&Yh(i,a,!1),Ki(n,i,h);u=i.stateNode,F0.current=i;var U=w&&typeof a.getDerivedStateFromError!="function"?null:u.render();return i.flags|=1,n!==null&&w?(i.child=bs(i,n.child,null,h),i.child=bs(i,null,U,h)):Dn(n,i,U,h),i.memoizedState=u.state,f&&Yh(i,a,!0),i.child}function Hp(n){var i=n.stateNode;i.pendingContext?Wh(n,i.pendingContext,i.pendingContext!==i.context):i.context&&Wh(n,i.context,!1),oc(n,i.containerInfo)}function Gp(n,i,a,u,f){return Cs(),ec(f),i.flags|=256,Dn(n,i,a,u),i.child}var wc={dehydrated:null,treeContext:null,retryLane:0};function Ac(n){return{baseLanes:n,cachePool:null,transitions:null}}function Wp(n,i,a){var u=i.pendingProps,f=Kt.current,h=!1,w=(i.flags&128)!==0,U;if((U=w)||(U=n!==null&&n.memoizedState===null?!1:(f&2)!==0),U?(h=!0,i.flags&=-129):(n===null||n.memoizedState!==null)&&(f|=1),Ot(Kt,f&1),n===null)return ju(i),n=i.memoizedState,n!==null&&(n=n.dehydrated,n!==null)?(i.mode&1?n.data==="$!"?i.lanes=8:i.lanes=1073741824:i.lanes=1,null):(w=u.children,n=u.fallback,h?(u=i.mode,h=i.child,w={mode:"hidden",children:w},!(u&1)&&h!==null?(h.childLanes=0,h.pendingProps=w):h=pl(w,u,0,null),n=is(n,u,a,null),h.return=i,n.return=i,h.sibling=n,i.child=h,i.child.memoizedState=Ac(a),i.memoizedState=wc,n):Rc(i,w));if(f=n.memoizedState,f!==null&&(U=f.dehydrated,U!==null))return O0(n,i,w,u,U,f,a);if(h){h=u.fallback,w=i.mode,f=n.child,U=f.sibling;var B={mode:"hidden",children:u.children};return!(w&1)&&i.child!==f?(u=i.child,u.childLanes=0,u.pendingProps=B,i.deletions=null):(u=Er(f,B),u.subtreeFlags=f.subtreeFlags&14680064),U!==null?h=Er(U,h):(h=is(h,w,a,null),h.flags|=2),h.return=i,u.return=i,u.sibling=h,i.child=u,u=h,h=i.child,w=n.child.memoizedState,w=w===null?Ac(a):{baseLanes:w.baseLanes|a,cachePool:null,transitions:w.transitions},h.memoizedState=w,h.childLanes=n.childLanes&~a,i.memoizedState=wc,u}return h=n.child,n=h.sibling,u=Er(h,{mode:"visible",children:u.children}),!(i.mode&1)&&(u.lanes=a),u.return=i,u.sibling=null,n!==null&&(a=i.deletions,a===null?(i.deletions=[n],i.flags|=16):a.push(n)),i.child=u,i.memoizedState=null,u}function Rc(n,i){return i=pl({mode:"visible",children:i},n.mode,0,null),i.return=n,n.child=i}function tl(n,i,a,u){return u!==null&&ec(u),bs(i,n.child,null,a),n=Rc(i,i.pendingProps.children),n.flags|=2,i.memoizedState=null,n}function O0(n,i,a,u,f,h,w){if(a)return i.flags&256?(i.flags&=-257,u=Sc(Error(t(422))),tl(n,i,w,u)):i.memoizedState!==null?(i.child=n.child,i.flags|=128,null):(h=u.fallback,f=i.mode,u=pl({mode:"visible",children:u.children},f,0,null),h=is(h,f,w,null),h.flags|=2,u.return=i,h.return=i,u.sibling=h,i.child=u,i.mode&1&&bs(i,n.child,null,w),i.child.memoizedState=Ac(w),i.memoizedState=wc,h);if(!(i.mode&1))return tl(n,i,w,null);if(f.data==="$!"){if(u=f.nextSibling&&f.nextSibling.dataset,u)var U=u.dgst;return u=U,h=Error(t(419)),u=Sc(h,u,void 0),tl(n,i,w,u)}if(U=(w&n.childLanes)!==0,Hn||U){if(u=hn,u!==null){switch(w&-w){case 4:f=2;break;case 16:f=8;break;case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:f=32;break;case 536870912:f=268435456;break;default:f=0}f=f&(u.suspendedLanes|w)?0:f,f!==0&&f!==h.retryLane&&(h.retryLane=f,Yi(n,f),xi(u,n,f,-1))}return Gc(),u=Sc(Error(t(421))),tl(n,i,w,u)}return f.data==="$?"?(i.flags|=128,i.child=n.child,i=Z0.bind(null,n),f._reactRetry=i,null):(n=h.treeContext,Zn=dr(f.nextSibling),$n=i,Xt=!0,mi=null,n!==null&&(ni[ii++]=Wi,ni[ii++]=Xi,ni[ii++]=Kr,Wi=n.id,Xi=n.overflow,Kr=i),i=Rc(i,u.children),i.flags|=4096,i)}function Xp(n,i,a){n.lanes|=i;var u=n.alternate;u!==null&&(u.lanes|=i),rc(n.return,i,a)}function Cc(n,i,a,u,f){var h=n.memoizedState;h===null?n.memoizedState={isBackwards:i,rendering:null,renderingStartTime:0,last:u,tail:a,tailMode:f}:(h.isBackwards=i,h.rendering=null,h.renderingStartTime=0,h.last=u,h.tail=a,h.tailMode=f)}function Yp(n,i,a){var u=i.pendingProps,f=u.revealOrder,h=u.tail;if(Dn(n,i,u.children,a),u=Kt.current,u&2)u=u&1|2,i.flags|=128;else{if(n!==null&&n.flags&128)e:for(n=i.child;n!==null;){if(n.tag===13)n.memoizedState!==null&&Xp(n,a,i);else if(n.tag===19)Xp(n,a,i);else if(n.child!==null){n.child.return=n,n=n.child;continue}if(n===i)break e;for(;n.sibling===null;){if(n.return===null||n.return===i)break e;n=n.return}n.sibling.return=n.return,n=n.sibling}u&=1}if(Ot(Kt,u),!(i.mode&1))i.memoizedState=null;else switch(f){case"forwards":for(a=i.child,f=null;a!==null;)n=a.alternate,n!==null&&Ko(n)===null&&(f=a),a=a.sibling;a=f,a===null?(f=i.child,i.child=null):(f=a.sibling,a.sibling=null),Cc(i,!1,f,a,h);break;case"backwards":for(a=null,f=i.child,i.child=null;f!==null;){if(n=f.alternate,n!==null&&Ko(n)===null){i.child=f;break}n=f.sibling,f.sibling=a,a=f,f=n}Cc(i,!0,a,null,h);break;case"together":Cc(i,!1,null,null,void 0);break;default:i.memoizedState=null}return i.child}function nl(n,i){!(i.mode&1)&&n!==null&&(n.alternate=null,i.alternate=null,i.flags|=2)}function Ki(n,i,a){if(n!==null&&(i.dependencies=n.dependencies),jr|=i.lanes,!(a&i.childLanes))return null;if(n!==null&&i.child!==n.child)throw Error(t(153));if(i.child!==null){for(n=i.child,a=Er(n,n.pendingProps),i.child=a,a.return=i;n.sibling!==null;)n=n.sibling,a=a.sibling=Er(n,n.pendingProps),a.return=i;a.sibling=null}return i.child}function B0(n,i,a){switch(i.tag){case 3:Hp(i),Cs();break;case 5:ap(i);break;case 1:Vn(i.type)&&Bo(i);break;case 4:oc(i,i.stateNode.containerInfo);break;case 10:var u=i.type._context,f=i.memoizedProps.value;Ot(Wo,u._currentValue),u._currentValue=f;break;case 13:if(u=i.memoizedState,u!==null)return u.dehydrated!==null?(Ot(Kt,Kt.current&1),i.flags|=128,null):a&i.child.childLanes?Wp(n,i,a):(Ot(Kt,Kt.current&1),n=Ki(n,i,a),n!==null?n.sibling:null);Ot(Kt,Kt.current&1);break;case 19:if(u=(a&i.childLanes)!==0,n.flags&128){if(u)return Yp(n,i,a);i.flags|=128}if(f=i.memoizedState,f!==null&&(f.rendering=null,f.tail=null,f.lastEffect=null),Ot(Kt,Kt.current),u)break;return null;case 22:case 23:return i.lanes=0,kp(n,i,a)}return Ki(n,i,a)}var qp,bc,Kp,$p;qp=function(n,i){for(var a=i.child;a!==null;){if(a.tag===5||a.tag===6)n.appendChild(a.stateNode);else if(a.tag!==4&&a.child!==null){a.child.return=a,a=a.child;continue}if(a===i)break;for(;a.sibling===null;){if(a.return===null||a.return===i)return;a=a.return}a.sibling.return=a.return,a=a.sibling}},bc=function(){},Kp=function(n,i,a,u){var f=n.memoizedProps;if(f!==u){n=i.stateNode,Qr(Ri.current);var h=null;switch(a){case"input":f=wt(n,f),u=wt(n,u),h=[];break;case"select":f=oe({},f,{value:void 0}),u=oe({},u,{value:void 0}),h=[];break;case"textarea":f=Gt(n,f),u=Gt(n,u),h=[];break;default:typeof f.onClick!="function"&&typeof u.onClick=="function"&&(n.onclick=Uo)}Xe(a,u);var w;a=null;for(se in f)if(!u.hasOwnProperty(se)&&f.hasOwnProperty(se)&&f[se]!=null)if(se==="style"){var U=f[se];for(w in U)U.hasOwnProperty(w)&&(a||(a={}),a[w]="")}else se!=="dangerouslySetInnerHTML"&&se!=="children"&&se!=="suppressContentEditableWarning"&&se!=="suppressHydrationWarning"&&se!=="autoFocus"&&(o.hasOwnProperty(se)?h||(h=[]):(h=h||[]).push(se,null));for(se in u){var B=u[se];if(U=f!=null?f[se]:void 0,u.hasOwnProperty(se)&&B!==U&&(B!=null||U!=null))if(se==="style")if(U){for(w in U)!U.hasOwnProperty(w)||B&&B.hasOwnProperty(w)||(a||(a={}),a[w]="");for(w in B)B.hasOwnProperty(w)&&U[w]!==B[w]&&(a||(a={}),a[w]=B[w])}else a||(h||(h=[]),h.push(se,a)),a=B;else se==="dangerouslySetInnerHTML"?(B=B?B.__html:void 0,U=U?U.__html:void 0,B!=null&&U!==B&&(h=h||[]).push(se,B)):se==="children"?typeof B!="string"&&typeof B!="number"||(h=h||[]).push(se,""+B):se!=="suppressContentEditableWarning"&&se!=="suppressHydrationWarning"&&(o.hasOwnProperty(se)?(B!=null&&se==="onScroll"&&kt("scroll",n),h||U===B||(h=[])):(h=h||[]).push(se,B))}a&&(h=h||[]).push("style",a);var se=h;(i.updateQueue=se)&&(i.flags|=4)}},$p=function(n,i,a,u){a!==u&&(i.flags|=4)};function Xa(n,i){if(!Xt)switch(n.tailMode){case"hidden":i=n.tail;for(var a=null;i!==null;)i.alternate!==null&&(a=i),i=i.sibling;a===null?n.tail=null:a.sibling=null;break;case"collapsed":a=n.tail;for(var u=null;a!==null;)a.alternate!==null&&(u=a),a=a.sibling;u===null?i||n.tail===null?n.tail=null:n.tail.sibling=null:u.sibling=null}}function An(n){var i=n.alternate!==null&&n.alternate.child===n.child,a=0,u=0;if(i)for(var f=n.child;f!==null;)a|=f.lanes|f.childLanes,u|=f.subtreeFlags&14680064,u|=f.flags&14680064,f.return=n,f=f.sibling;else for(f=n.child;f!==null;)a|=f.lanes|f.childLanes,u|=f.subtreeFlags,u|=f.flags,f.return=n,f=f.sibling;return n.subtreeFlags|=u,n.childLanes=a,i}function k0(n,i,a){var u=i.pendingProps;switch(Qu(i),i.tag){case 2:case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return An(i),null;case 1:return Vn(i.type)&&Oo(),An(i),null;case 3:return u=i.stateNode,Ds(),zt(zn),zt(Tn),cc(),u.pendingContext&&(u.context=u.pendingContext,u.pendingContext=null),(n===null||n.child===null)&&(Ho(i)?i.flags|=4:n===null||n.memoizedState.isDehydrated&&!(i.flags&256)||(i.flags|=1024,mi!==null&&(zc(mi),mi=null))),bc(n,i),An(i),null;case 5:lc(i);var f=Qr(za.current);if(a=i.type,n!==null&&i.stateNode!=null)Kp(n,i,a,u,f),n.ref!==i.ref&&(i.flags|=512,i.flags|=2097152);else{if(!u){if(i.stateNode===null)throw Error(t(166));return An(i),null}if(n=Qr(Ri.current),Ho(i)){u=i.stateNode,a=i.type;var h=i.memoizedProps;switch(u[Ai]=i,u[Ua]=h,n=(i.mode&1)!==0,a){case"dialog":kt("cancel",u),kt("close",u);break;case"iframe":case"object":case"embed":kt("load",u);break;case"video":case"audio":for(f=0;f<Da.length;f++)kt(Da[f],u);break;case"source":kt("error",u);break;case"img":case"image":case"link":kt("error",u),kt("load",u);break;case"details":kt("toggle",u);break;case"input":xt(u,h),kt("invalid",u);break;case"select":u._wrapperState={wasMultiple:!!h.multiple},kt("invalid",u);break;case"textarea":W(u,h),kt("invalid",u)}Xe(a,h),f=null;for(var w in h)if(h.hasOwnProperty(w)){var U=h[w];w==="children"?typeof U=="string"?u.textContent!==U&&(h.suppressHydrationWarning!==!0&&Io(u.textContent,U,n),f=["children",U]):typeof U=="number"&&u.textContent!==""+U&&(h.suppressHydrationWarning!==!0&&Io(u.textContent,U,n),f=["children",""+U]):o.hasOwnProperty(w)&&U!=null&&w==="onScroll"&&kt("scroll",u)}switch(a){case"input":je(u),Qt(u,h,!0);break;case"textarea":je(u),Et(u);break;case"select":case"option":break;default:typeof h.onClick=="function"&&(u.onclick=Uo)}u=f,i.updateQueue=u,u!==null&&(i.flags|=4)}else{w=f.nodeType===9?f:f.ownerDocument,n==="http://www.w3.org/1999/xhtml"&&(n=L(a)),n==="http://www.w3.org/1999/xhtml"?a==="script"?(n=w.createElement("div"),n.innerHTML="<script><\/script>",n=n.removeChild(n.firstChild)):typeof u.is=="string"?n=w.createElement(a,{is:u.is}):(n=w.createElement(a),a==="select"&&(w=n,u.multiple?w.multiple=!0:u.size&&(w.size=u.size))):n=w.createElementNS(n,a),n[Ai]=i,n[Ua]=u,qp(n,i,!1,!1),i.stateNode=n;e:{switch(w=Pe(a,u),a){case"dialog":kt("cancel",n),kt("close",n),f=u;break;case"iframe":case"object":case"embed":kt("load",n),f=u;break;case"video":case"audio":for(f=0;f<Da.length;f++)kt(Da[f],n);f=u;break;case"source":kt("error",n),f=u;break;case"img":case"image":case"link":kt("error",n),kt("load",n),f=u;break;case"details":kt("toggle",n),f=u;break;case"input":xt(n,u),f=wt(n,u),kt("invalid",n);break;case"option":f=u;break;case"select":n._wrapperState={wasMultiple:!!u.multiple},f=oe({},u,{value:void 0}),kt("invalid",n);break;case"textarea":W(n,u),f=Gt(n,u),kt("invalid",n);break;default:f=u}Xe(a,f),U=f;for(h in U)if(U.hasOwnProperty(h)){var B=U[h];h==="style"?pe(n,B):h==="dangerouslySetInnerHTML"?(B=B?B.__html:void 0,B!=null&&ne(n,B)):h==="children"?typeof B=="string"?(a!=="textarea"||B!=="")&&le(n,B):typeof B=="number"&&le(n,""+B):h!=="suppressContentEditableWarning"&&h!=="suppressHydrationWarning"&&h!=="autoFocus"&&(o.hasOwnProperty(h)?B!=null&&h==="onScroll"&&kt("scroll",n):B!=null&&N(n,h,B,w))}switch(a){case"input":je(n),Qt(n,u,!1);break;case"textarea":je(n),Et(n);break;case"option":u.value!=null&&n.setAttribute("value",""+he(u.value));break;case"select":n.multiple=!!u.multiple,h=u.value,h!=null?Ct(n,!!u.multiple,h,!1):u.defaultValue!=null&&Ct(n,!!u.multiple,u.defaultValue,!0);break;default:typeof f.onClick=="function"&&(n.onclick=Uo)}switch(a){case"button":case"input":case"select":case"textarea":u=!!u.autoFocus;break e;case"img":u=!0;break e;default:u=!1}}u&&(i.flags|=4)}i.ref!==null&&(i.flags|=512,i.flags|=2097152)}return An(i),null;case 6:if(n&&i.stateNode!=null)$p(n,i,n.memoizedProps,u);else{if(typeof u!="string"&&i.stateNode===null)throw Error(t(166));if(a=Qr(za.current),Qr(Ri.current),Ho(i)){if(u=i.stateNode,a=i.memoizedProps,u[Ai]=i,(h=u.nodeValue!==a)&&(n=$n,n!==null))switch(n.tag){case 3:Io(u.nodeValue,a,(n.mode&1)!==0);break;case 5:n.memoizedProps.suppressHydrationWarning!==!0&&Io(u.nodeValue,a,(n.mode&1)!==0)}h&&(i.flags|=4)}else u=(a.nodeType===9?a:a.ownerDocument).createTextNode(u),u[Ai]=i,i.stateNode=u}return An(i),null;case 13:if(zt(Kt),u=i.memoizedState,n===null||n.memoizedState!==null&&n.memoizedState.dehydrated!==null){if(Xt&&Zn!==null&&i.mode&1&&!(i.flags&128))Jh(),Cs(),i.flags|=98560,h=!1;else if(h=Ho(i),u!==null&&u.dehydrated!==null){if(n===null){if(!h)throw Error(t(318));if(h=i.memoizedState,h=h!==null?h.dehydrated:null,!h)throw Error(t(317));h[Ai]=i}else Cs(),!(i.flags&128)&&(i.memoizedState=null),i.flags|=4;An(i),h=!1}else mi!==null&&(zc(mi),mi=null),h=!0;if(!h)return i.flags&65536?i:null}return i.flags&128?(i.lanes=a,i):(u=u!==null,u!==(n!==null&&n.memoizedState!==null)&&u&&(i.child.flags|=8192,i.mode&1&&(n===null||Kt.current&1?ln===0&&(ln=3):Gc())),i.updateQueue!==null&&(i.flags|=4),An(i),null);case 4:return Ds(),bc(n,i),n===null&&Na(i.stateNode.containerInfo),An(i),null;case 10:return ic(i.type._context),An(i),null;case 17:return Vn(i.type)&&Oo(),An(i),null;case 19:if(zt(Kt),h=i.memoizedState,h===null)return An(i),null;if(u=(i.flags&128)!==0,w=h.rendering,w===null)if(u)Xa(h,!1);else{if(ln!==0||n!==null&&n.flags&128)for(n=i.child;n!==null;){if(w=Ko(n),w!==null){for(i.flags|=128,Xa(h,!1),u=w.updateQueue,u!==null&&(i.updateQueue=u,i.flags|=4),i.subtreeFlags=0,u=a,a=i.child;a!==null;)h=a,n=u,h.flags&=14680066,w=h.alternate,w===null?(h.childLanes=0,h.lanes=n,h.child=null,h.subtreeFlags=0,h.memoizedProps=null,h.memoizedState=null,h.updateQueue=null,h.dependencies=null,h.stateNode=null):(h.childLanes=w.childLanes,h.lanes=w.lanes,h.child=w.child,h.subtreeFlags=0,h.deletions=null,h.memoizedProps=w.memoizedProps,h.memoizedState=w.memoizedState,h.updateQueue=w.updateQueue,h.type=w.type,n=w.dependencies,h.dependencies=n===null?null:{lanes:n.lanes,firstContext:n.firstContext}),a=a.sibling;return Ot(Kt,Kt.current&1|2),i.child}n=n.sibling}h.tail!==null&&qt()>Fs&&(i.flags|=128,u=!0,Xa(h,!1),i.lanes=4194304)}else{if(!u)if(n=Ko(w),n!==null){if(i.flags|=128,u=!0,a=n.updateQueue,a!==null&&(i.updateQueue=a,i.flags|=4),Xa(h,!0),h.tail===null&&h.tailMode==="hidden"&&!w.alternate&&!Xt)return An(i),null}else 2*qt()-h.renderingStartTime>Fs&&a!==1073741824&&(i.flags|=128,u=!0,Xa(h,!1),i.lanes=4194304);h.isBackwards?(w.sibling=i.child,i.child=w):(a=h.last,a!==null?a.sibling=w:i.child=w,h.last=w)}return h.tail!==null?(i=h.tail,h.rendering=i,h.tail=i.sibling,h.renderingStartTime=qt(),i.sibling=null,a=Kt.current,Ot(Kt,u?a&1|2:a&1),i):(An(i),null);case 22:case 23:return Hc(),u=i.memoizedState!==null,n!==null&&n.memoizedState!==null!==u&&(i.flags|=8192),u&&i.mode&1?Qn&1073741824&&(An(i),i.subtreeFlags&6&&(i.flags|=8192)):An(i),null;case 24:return null;case 25:return null}throw Error(t(156,i.tag))}function z0(n,i){switch(Qu(i),i.tag){case 1:return Vn(i.type)&&Oo(),n=i.flags,n&65536?(i.flags=n&-65537|128,i):null;case 3:return Ds(),zt(zn),zt(Tn),cc(),n=i.flags,n&65536&&!(n&128)?(i.flags=n&-65537|128,i):null;case 5:return lc(i),null;case 13:if(zt(Kt),n=i.memoizedState,n!==null&&n.dehydrated!==null){if(i.alternate===null)throw Error(t(340));Cs()}return n=i.flags,n&65536?(i.flags=n&-65537|128,i):null;case 19:return zt(Kt),null;case 4:return Ds(),null;case 10:return ic(i.type._context),null;case 22:case 23:return Hc(),null;case 24:return null;default:return null}}var il=!1,Rn=!1,V0=typeof WeakSet=="function"?WeakSet:Set,Be=null;function Is(n,i){var a=n.ref;if(a!==null)if(typeof a=="function")try{a(null)}catch(u){jt(n,i,u)}else a.current=null}function Pc(n,i,a){try{a()}catch(u){jt(n,i,u)}}var Zp=!1;function H0(n,i){if(Hu=Eo,n=Ch(),Iu(n)){if("selectionStart"in n)var a={start:n.selectionStart,end:n.selectionEnd};else e:{a=(a=n.ownerDocument)&&a.defaultView||window;var u=a.getSelection&&a.getSelection();if(u&&u.rangeCount!==0){a=u.anchorNode;var f=u.anchorOffset,h=u.focusNode;u=u.focusOffset;try{a.nodeType,h.nodeType}catch{a=null;break e}var w=0,U=-1,B=-1,se=0,xe=0,ye=n,ve=null;t:for(;;){for(var Fe;ye!==a||f!==0&&ye.nodeType!==3||(U=w+f),ye!==h||u!==0&&ye.nodeType!==3||(B=w+u),ye.nodeType===3&&(w+=ye.nodeValue.length),(Fe=ye.firstChild)!==null;)ve=ye,ye=Fe;for(;;){if(ye===n)break t;if(ve===a&&++se===f&&(U=w),ve===h&&++xe===u&&(B=w),(Fe=ye.nextSibling)!==null)break;ye=ve,ve=ye.parentNode}ye=Fe}a=U===-1||B===-1?null:{start:U,end:B}}else a=null}a=a||{start:0,end:0}}else a=null;for(Gu={focusedElem:n,selectionRange:a},Eo=!1,Be=i;Be!==null;)if(i=Be,n=i.child,(i.subtreeFlags&1028)!==0&&n!==null)n.return=i,Be=n;else for(;Be!==null;){i=Be;try{var Ve=i.alternate;if(i.flags&1024)switch(i.tag){case 0:case 11:case 15:break;case 1:if(Ve!==null){var We=Ve.memoizedProps,en=Ve.memoizedState,J=i.stateNode,G=J.getSnapshotBeforeUpdate(i.elementType===i.type?We:gi(i.type,We),en);J.__reactInternalSnapshotBeforeUpdate=G}break;case 3:var te=i.stateNode.containerInfo;te.nodeType===1?te.textContent="":te.nodeType===9&&te.documentElement&&te.removeChild(te.documentElement);break;case 5:case 6:case 4:case 17:break;default:throw Error(t(163))}}catch(Me){jt(i,i.return,Me)}if(n=i.sibling,n!==null){n.return=i.return,Be=n;break}Be=i.return}return Ve=Zp,Zp=!1,Ve}function Ya(n,i,a){var u=i.updateQueue;if(u=u!==null?u.lastEffect:null,u!==null){var f=u=u.next;do{if((f.tag&n)===n){var h=f.destroy;f.destroy=void 0,h!==void 0&&Pc(i,a,h)}f=f.next}while(f!==u)}}function rl(n,i){if(i=i.updateQueue,i=i!==null?i.lastEffect:null,i!==null){var a=i=i.next;do{if((a.tag&n)===n){var u=a.create;a.destroy=u()}a=a.next}while(a!==i)}}function Lc(n){var i=n.ref;if(i!==null){var a=n.stateNode;switch(n.tag){case 5:n=a;break;default:n=a}typeof i=="function"?i(n):i.current=n}}function Qp(n){var i=n.alternate;i!==null&&(n.alternate=null,Qp(i)),n.child=null,n.deletions=null,n.sibling=null,n.tag===5&&(i=n.stateNode,i!==null&&(delete i[Ai],delete i[Ua],delete i[qu],delete i[T0],delete i[w0])),n.stateNode=null,n.return=null,n.dependencies=null,n.memoizedProps=null,n.memoizedState=null,n.pendingProps=null,n.stateNode=null,n.updateQueue=null}function Jp(n){return n.tag===5||n.tag===3||n.tag===4}function jp(n){e:for(;;){for(;n.sibling===null;){if(n.return===null||Jp(n.return))return null;n=n.return}for(n.sibling.return=n.return,n=n.sibling;n.tag!==5&&n.tag!==6&&n.tag!==18;){if(n.flags&2||n.child===null||n.tag===4)continue e;n.child.return=n,n=n.child}if(!(n.flags&2))return n.stateNode}}function Dc(n,i,a){var u=n.tag;if(u===5||u===6)n=n.stateNode,i?a.nodeType===8?a.parentNode.insertBefore(n,i):a.insertBefore(n,i):(a.nodeType===8?(i=a.parentNode,i.insertBefore(n,a)):(i=a,i.appendChild(n)),a=a._reactRootContainer,a!=null||i.onclick!==null||(i.onclick=Uo));else if(u!==4&&(n=n.child,n!==null))for(Dc(n,i,a),n=n.sibling;n!==null;)Dc(n,i,a),n=n.sibling}function Nc(n,i,a){var u=n.tag;if(u===5||u===6)n=n.stateNode,i?a.insertBefore(n,i):a.appendChild(n);else if(u!==4&&(n=n.child,n!==null))for(Nc(n,i,a),n=n.sibling;n!==null;)Nc(n,i,a),n=n.sibling}var vn=null,_i=!1;function vr(n,i,a){for(a=a.child;a!==null;)em(n,i,a),a=a.sibling}function em(n,i,a){if(Te&&typeof Te.onCommitFiberUnmount=="function")try{Te.onCommitFiberUnmount(j,a)}catch{}switch(a.tag){case 5:Rn||Is(a,i);case 6:var u=vn,f=_i;vn=null,vr(n,i,a),vn=u,_i=f,vn!==null&&(_i?(n=vn,a=a.stateNode,n.nodeType===8?n.parentNode.removeChild(a):n.removeChild(a)):vn.removeChild(a.stateNode));break;case 18:vn!==null&&(_i?(n=vn,a=a.stateNode,n.nodeType===8?Yu(n.parentNode,a):n.nodeType===1&&Yu(n,a),Ta(n)):Yu(vn,a.stateNode));break;case 4:u=vn,f=_i,vn=a.stateNode.containerInfo,_i=!0,vr(n,i,a),vn=u,_i=f;break;case 0:case 11:case 14:case 15:if(!Rn&&(u=a.updateQueue,u!==null&&(u=u.lastEffect,u!==null))){f=u=u.next;do{var h=f,w=h.destroy;h=h.tag,w!==void 0&&(h&2||h&4)&&Pc(a,i,w),f=f.next}while(f!==u)}vr(n,i,a);break;case 1:if(!Rn&&(Is(a,i),u=a.stateNode,typeof u.componentWillUnmount=="function"))try{u.props=a.memoizedProps,u.state=a.memoizedState,u.componentWillUnmount()}catch(U){jt(a,i,U)}vr(n,i,a);break;case 21:vr(n,i,a);break;case 22:a.mode&1?(Rn=(u=Rn)||a.memoizedState!==null,vr(n,i,a),Rn=u):vr(n,i,a);break;default:vr(n,i,a)}}function tm(n){var i=n.updateQueue;if(i!==null){n.updateQueue=null;var a=n.stateNode;a===null&&(a=n.stateNode=new V0),i.forEach(function(u){var f=Q0.bind(null,n,u);a.has(u)||(a.add(u),u.then(f,f))})}}function vi(n,i){var a=i.deletions;if(a!==null)for(var u=0;u<a.length;u++){var f=a[u];try{var h=n,w=i,U=w;e:for(;U!==null;){switch(U.tag){case 5:vn=U.stateNode,_i=!1;break e;case 3:vn=U.stateNode.containerInfo,_i=!0;break e;case 4:vn=U.stateNode.containerInfo,_i=!0;break e}U=U.return}if(vn===null)throw Error(t(160));em(h,w,f),vn=null,_i=!1;var B=f.alternate;B!==null&&(B.return=null),f.return=null}catch(se){jt(f,i,se)}}if(i.subtreeFlags&12854)for(i=i.child;i!==null;)nm(i,n),i=i.sibling}function nm(n,i){var a=n.alternate,u=n.flags;switch(n.tag){case 0:case 11:case 14:case 15:if(vi(i,n),bi(n),u&4){try{Ya(3,n,n.return),rl(3,n)}catch(We){jt(n,n.return,We)}try{Ya(5,n,n.return)}catch(We){jt(n,n.return,We)}}break;case 1:vi(i,n),bi(n),u&512&&a!==null&&Is(a,a.return);break;case 5:if(vi(i,n),bi(n),u&512&&a!==null&&Is(a,a.return),n.flags&32){var f=n.stateNode;try{le(f,"")}catch(We){jt(n,n.return,We)}}if(u&4&&(f=n.stateNode,f!=null)){var h=n.memoizedProps,w=a!==null?a.memoizedProps:h,U=n.type,B=n.updateQueue;if(n.updateQueue=null,B!==null)try{U==="input"&&h.type==="radio"&&h.name!=null&&_t(f,h),Pe(U,w);var se=Pe(U,h);for(w=0;w<B.length;w+=2){var xe=B[w],ye=B[w+1];xe==="style"?pe(f,ye):xe==="dangerouslySetInnerHTML"?ne(f,ye):xe==="children"?le(f,ye):N(f,xe,ye,se)}switch(U){case"input":Ht(f,h);break;case"textarea":gn(f,h);break;case"select":var ve=f._wrapperState.wasMultiple;f._wrapperState.wasMultiple=!!h.multiple;var Fe=h.value;Fe!=null?Ct(f,!!h.multiple,Fe,!1):ve!==!!h.multiple&&(h.defaultValue!=null?Ct(f,!!h.multiple,h.defaultValue,!0):Ct(f,!!h.multiple,h.multiple?[]:"",!1))}f[Ua]=h}catch(We){jt(n,n.return,We)}}break;case 6:if(vi(i,n),bi(n),u&4){if(n.stateNode===null)throw Error(t(162));f=n.stateNode,h=n.memoizedProps;try{f.nodeValue=h}catch(We){jt(n,n.return,We)}}break;case 3:if(vi(i,n),bi(n),u&4&&a!==null&&a.memoizedState.isDehydrated)try{Ta(i.containerInfo)}catch(We){jt(n,n.return,We)}break;case 4:vi(i,n),bi(n);break;case 13:vi(i,n),bi(n),f=n.child,f.flags&8192&&(h=f.memoizedState!==null,f.stateNode.isHidden=h,!h||f.alternate!==null&&f.alternate.memoizedState!==null||(Fc=qt())),u&4&&tm(n);break;case 22:if(xe=a!==null&&a.memoizedState!==null,n.mode&1?(Rn=(se=Rn)||xe,vi(i,n),Rn=se):vi(i,n),bi(n),u&8192){if(se=n.memoizedState!==null,(n.stateNode.isHidden=se)&&!xe&&n.mode&1)for(Be=n,xe=n.child;xe!==null;){for(ye=Be=xe;Be!==null;){switch(ve=Be,Fe=ve.child,ve.tag){case 0:case 11:case 14:case 15:Ya(4,ve,ve.return);break;case 1:Is(ve,ve.return);var Ve=ve.stateNode;if(typeof Ve.componentWillUnmount=="function"){u=ve,a=ve.return;try{i=u,Ve.props=i.memoizedProps,Ve.state=i.memoizedState,Ve.componentWillUnmount()}catch(We){jt(u,a,We)}}break;case 5:Is(ve,ve.return);break;case 22:if(ve.memoizedState!==null){sm(ye);continue}}Fe!==null?(Fe.return=ve,Be=Fe):sm(ye)}xe=xe.sibling}e:for(xe=null,ye=n;;){if(ye.tag===5){if(xe===null){xe=ye;try{f=ye.stateNode,se?(h=f.style,typeof h.setProperty=="function"?h.setProperty("display","none","important"):h.display="none"):(U=ye.stateNode,B=ye.memoizedProps.style,w=B!=null&&B.hasOwnProperty("display")?B.display:null,U.style.display=fe("display",w))}catch(We){jt(n,n.return,We)}}}else if(ye.tag===6){if(xe===null)try{ye.stateNode.nodeValue=se?"":ye.memoizedProps}catch(We){jt(n,n.return,We)}}else if((ye.tag!==22&&ye.tag!==23||ye.memoizedState===null||ye===n)&&ye.child!==null){ye.child.return=ye,ye=ye.child;continue}if(ye===n)break e;for(;ye.sibling===null;){if(ye.return===null||ye.return===n)break e;xe===ye&&(xe=null),ye=ye.return}xe===ye&&(xe=null),ye.sibling.return=ye.return,ye=ye.sibling}}break;case 19:vi(i,n),bi(n),u&4&&tm(n);break;case 21:break;default:vi(i,n),bi(n)}}function bi(n){var i=n.flags;if(i&2){try{e:{for(var a=n.return;a!==null;){if(Jp(a)){var u=a;break e}a=a.return}throw Error(t(160))}switch(u.tag){case 5:var f=u.stateNode;u.flags&32&&(le(f,""),u.flags&=-33);var h=jp(n);Nc(n,h,f);break;case 3:case 4:var w=u.stateNode.containerInfo,U=jp(n);Dc(n,U,w);break;default:throw Error(t(161))}}catch(B){jt(n,n.return,B)}n.flags&=-3}i&4096&&(n.flags&=-4097)}function G0(n,i,a){Be=n,im(n)}function im(n,i,a){for(var u=(n.mode&1)!==0;Be!==null;){var f=Be,h=f.child;if(f.tag===22&&u){var w=f.memoizedState!==null||il;if(!w){var U=f.alternate,B=U!==null&&U.memoizedState!==null||Rn;U=il;var se=Rn;if(il=w,(Rn=B)&&!se)for(Be=f;Be!==null;)w=Be,B=w.child,w.tag===22&&w.memoizedState!==null?am(f):B!==null?(B.return=w,Be=B):am(f);for(;h!==null;)Be=h,im(h),h=h.sibling;Be=f,il=U,Rn=se}rm(n)}else f.subtreeFlags&8772&&h!==null?(h.return=f,Be=h):rm(n)}}function rm(n){for(;Be!==null;){var i=Be;if(i.flags&8772){var a=i.alternate;try{if(i.flags&8772)switch(i.tag){case 0:case 11:case 15:Rn||rl(5,i);break;case 1:var u=i.stateNode;if(i.flags&4&&!Rn)if(a===null)u.componentDidMount();else{var f=i.elementType===i.type?a.memoizedProps:gi(i.type,a.memoizedProps);u.componentDidUpdate(f,a.memoizedState,u.__reactInternalSnapshotBeforeUpdate)}var h=i.updateQueue;h!==null&&sp(i,h,u);break;case 3:var w=i.updateQueue;if(w!==null){if(a=null,i.child!==null)switch(i.child.tag){case 5:a=i.child.stateNode;break;case 1:a=i.child.stateNode}sp(i,w,a)}break;case 5:var U=i.stateNode;if(a===null&&i.flags&4){a=U;var B=i.memoizedProps;switch(i.type){case"button":case"input":case"select":case"textarea":B.autoFocus&&a.focus();break;case"img":B.src&&(a.src=B.src)}}break;case 6:break;case 4:break;case 12:break;case 13:if(i.memoizedState===null){var se=i.alternate;if(se!==null){var xe=se.memoizedState;if(xe!==null){var ye=xe.dehydrated;ye!==null&&Ta(ye)}}}break;case 19:case 17:case 21:case 22:case 23:case 25:break;default:throw Error(t(163))}Rn||i.flags&512&&Lc(i)}catch(ve){jt(i,i.return,ve)}}if(i===n){Be=null;break}if(a=i.sibling,a!==null){a.return=i.return,Be=a;break}Be=i.return}}function sm(n){for(;Be!==null;){var i=Be;if(i===n){Be=null;break}var a=i.sibling;if(a!==null){a.return=i.return,Be=a;break}Be=i.return}}function am(n){for(;Be!==null;){var i=Be;try{switch(i.tag){case 0:case 11:case 15:var a=i.return;try{rl(4,i)}catch(B){jt(i,a,B)}break;case 1:var u=i.stateNode;if(typeof u.componentDidMount=="function"){var f=i.return;try{u.componentDidMount()}catch(B){jt(i,f,B)}}var h=i.return;try{Lc(i)}catch(B){jt(i,h,B)}break;case 5:var w=i.return;try{Lc(i)}catch(B){jt(i,w,B)}}}catch(B){jt(i,i.return,B)}if(i===n){Be=null;break}var U=i.sibling;if(U!==null){U.return=i.return,Be=U;break}Be=i.return}}var W0=Math.ceil,sl=C.ReactCurrentDispatcher,Ic=C.ReactCurrentOwner,ai=C.ReactCurrentBatchConfig,Mt=0,hn=null,rn=null,xn=0,Qn=0,Us=hr(0),ln=0,qa=null,jr=0,al=0,Uc=0,Ka=null,Gn=null,Fc=0,Fs=1/0,$i=null,ol=!1,Oc=null,xr=null,ll=!1,yr=null,ul=0,$a=0,Bc=null,cl=-1,fl=0;function Nn(){return Mt&6?qt():cl!==-1?cl:cl=qt()}function Sr(n){return n.mode&1?Mt&2&&xn!==0?xn&-xn:R0.transition!==null?(fl===0&&(fl=Ue()),fl):(n=pt,n!==0||(n=window.event,n=n===void 0?16:lh(n.type)),n):1}function xi(n,i,a,u){if(50<$a)throw $a=0,Bc=null,Error(t(185));ht(n,a,u),(!(Mt&2)||n!==hn)&&(n===hn&&(!(Mt&2)&&(al|=a),ln===4&&Mr(n,xn)),Wn(n,u),a===1&&Mt===0&&!(i.mode&1)&&(Fs=qt()+500,ko&&mr()))}function Wn(n,i){var a=n.callbackNode;bt(n,i);var u=Ft(n,n===hn?xn:0);if(u===0)a!==null&&va(a),n.callbackNode=null,n.callbackPriority=0;else if(i=u&-u,n.callbackPriority!==i){if(a!=null&&va(a),i===1)n.tag===0?A0(lm.bind(null,n)):qh(lm.bind(null,n)),M0(function(){!(Mt&6)&&mr()}),a=null;else{switch(Vi(u)){case 1:a=xa;break;case 4:a=A;break;case 16:a=X;break;case 536870912:a=ee;break;default:a=X}a=gm(a,om.bind(null,n))}n.callbackPriority=i,n.callbackNode=a}}function om(n,i){if(cl=-1,fl=0,Mt&6)throw Error(t(327));var a=n.callbackNode;if(Os()&&n.callbackNode!==a)return null;var u=Ft(n,n===hn?xn:0);if(u===0)return null;if(u&30||u&n.expiredLanes||i)i=dl(n,u);else{i=u;var f=Mt;Mt|=2;var h=cm();(hn!==n||xn!==i)&&($i=null,Fs=qt()+500,ts(n,i));do try{q0();break}catch(U){um(n,U)}while(!0);nc(),sl.current=h,Mt=f,rn!==null?i=0:(hn=null,xn=0,i=ln)}if(i!==0){if(i===2&&(f=nn(n),f!==0&&(u=f,i=kc(n,f))),i===1)throw a=qa,ts(n,0),Mr(n,u),Wn(n,qt()),a;if(i===6)Mr(n,u);else{if(f=n.current.alternate,!(u&30)&&!X0(f)&&(i=dl(n,u),i===2&&(h=nn(n),h!==0&&(u=h,i=kc(n,h))),i===1))throw a=qa,ts(n,0),Mr(n,u),Wn(n,qt()),a;switch(n.finishedWork=f,n.finishedLanes=u,i){case 0:case 1:throw Error(t(345));case 2:ns(n,Gn,$i);break;case 3:if(Mr(n,u),(u&130023424)===u&&(i=Fc+500-qt(),10<i)){if(Ft(n,0)!==0)break;if(f=n.suspendedLanes,(f&u)!==u){Nn(),n.pingedLanes|=n.suspendedLanes&f;break}n.timeoutHandle=Xu(ns.bind(null,n,Gn,$i),i);break}ns(n,Gn,$i);break;case 4:if(Mr(n,u),(u&4194240)===u)break;for(i=n.eventTimes,f=-1;0<u;){var w=31-Ee(u);h=1<<w,w=i[w],w>f&&(f=w),u&=~h}if(u=f,u=qt()-u,u=(120>u?120:480>u?480:1080>u?1080:1920>u?1920:3e3>u?3e3:4320>u?4320:1960*W0(u/1960))-u,10<u){n.timeoutHandle=Xu(ns.bind(null,n,Gn,$i),u);break}ns(n,Gn,$i);break;case 5:ns(n,Gn,$i);break;default:throw Error(t(329))}}}return Wn(n,qt()),n.callbackNode===a?om.bind(null,n):null}function kc(n,i){var a=Ka;return n.current.memoizedState.isDehydrated&&(ts(n,i).flags|=256),n=dl(n,i),n!==2&&(i=Gn,Gn=a,i!==null&&zc(i)),n}function zc(n){Gn===null?Gn=n:Gn.push.apply(Gn,n)}function X0(n){for(var i=n;;){if(i.flags&16384){var a=i.updateQueue;if(a!==null&&(a=a.stores,a!==null))for(var u=0;u<a.length;u++){var f=a[u],h=f.getSnapshot;f=f.value;try{if(!pi(h(),f))return!1}catch{return!1}}}if(a=i.child,i.subtreeFlags&16384&&a!==null)a.return=i,i=a;else{if(i===n)break;for(;i.sibling===null;){if(i.return===null||i.return===n)return!0;i=i.return}i.sibling.return=i.return,i=i.sibling}}return!0}function Mr(n,i){for(i&=~Uc,i&=~al,n.suspendedLanes|=i,n.pingedLanes&=~i,n=n.expirationTimes;0<i;){var a=31-Ee(i),u=1<<a;n[a]=-1,i&=~u}}function lm(n){if(Mt&6)throw Error(t(327));Os();var i=Ft(n,0);if(!(i&1))return Wn(n,qt()),null;var a=dl(n,i);if(n.tag!==0&&a===2){var u=nn(n);u!==0&&(i=u,a=kc(n,u))}if(a===1)throw a=qa,ts(n,0),Mr(n,i),Wn(n,qt()),a;if(a===6)throw Error(t(345));return n.finishedWork=n.current.alternate,n.finishedLanes=i,ns(n,Gn,$i),Wn(n,qt()),null}function Vc(n,i){var a=Mt;Mt|=1;try{return n(i)}finally{Mt=a,Mt===0&&(Fs=qt()+500,ko&&mr())}}function es(n){yr!==null&&yr.tag===0&&!(Mt&6)&&Os();var i=Mt;Mt|=1;var a=ai.transition,u=pt;try{if(ai.transition=null,pt=1,n)return n()}finally{pt=u,ai.transition=a,Mt=i,!(Mt&6)&&mr()}}function Hc(){Qn=Us.current,zt(Us)}function ts(n,i){n.finishedWork=null,n.finishedLanes=0;var a=n.timeoutHandle;if(a!==-1&&(n.timeoutHandle=-1,S0(a)),rn!==null)for(a=rn.return;a!==null;){var u=a;switch(Qu(u),u.tag){case 1:u=u.type.childContextTypes,u!=null&&Oo();break;case 3:Ds(),zt(zn),zt(Tn),cc();break;case 5:lc(u);break;case 4:Ds();break;case 13:zt(Kt);break;case 19:zt(Kt);break;case 10:ic(u.type._context);break;case 22:case 23:Hc()}a=a.return}if(hn=n,rn=n=Er(n.current,null),xn=Qn=i,ln=0,qa=null,Uc=al=jr=0,Gn=Ka=null,Zr!==null){for(i=0;i<Zr.length;i++)if(a=Zr[i],u=a.interleaved,u!==null){a.interleaved=null;var f=u.next,h=a.pending;if(h!==null){var w=h.next;h.next=f,u.next=w}a.pending=u}Zr=null}return n}function um(n,i){do{var a=rn;try{if(nc(),$o.current=jo,Zo){for(var u=$t.memoizedState;u!==null;){var f=u.queue;f!==null&&(f.pending=null),u=u.next}Zo=!1}if(Jr=0,dn=on=$t=null,Va=!1,Ha=0,Ic.current=null,a===null||a.return===null){ln=1,qa=i,rn=null;break}e:{var h=n,w=a.return,U=a,B=i;if(i=xn,U.flags|=32768,B!==null&&typeof B=="object"&&typeof B.then=="function"){var se=B,xe=U,ye=xe.tag;if(!(xe.mode&1)&&(ye===0||ye===11||ye===15)){var ve=xe.alternate;ve?(xe.updateQueue=ve.updateQueue,xe.memoizedState=ve.memoizedState,xe.lanes=ve.lanes):(xe.updateQueue=null,xe.memoizedState=null)}var Fe=Ip(w);if(Fe!==null){Fe.flags&=-257,Up(Fe,w,U,h,i),Fe.mode&1&&Np(h,se,i),i=Fe,B=se;var Ve=i.updateQueue;if(Ve===null){var We=new Set;We.add(B),i.updateQueue=We}else Ve.add(B);break e}else{if(!(i&1)){Np(h,se,i),Gc();break e}B=Error(t(426))}}else if(Xt&&U.mode&1){var en=Ip(w);if(en!==null){!(en.flags&65536)&&(en.flags|=256),Up(en,w,U,h,i),ec(Ns(B,U));break e}}h=B=Ns(B,U),ln!==4&&(ln=2),Ka===null?Ka=[h]:Ka.push(h),h=w;do{switch(h.tag){case 3:h.flags|=65536,i&=-i,h.lanes|=i;var J=Lp(h,B,i);rp(h,J);break e;case 1:U=B;var G=h.type,te=h.stateNode;if(!(h.flags&128)&&(typeof G.getDerivedStateFromError=="function"||te!==null&&typeof te.componentDidCatch=="function"&&(xr===null||!xr.has(te)))){h.flags|=65536,i&=-i,h.lanes|=i;var Me=Dp(h,U,i);rp(h,Me);break e}}h=h.return}while(h!==null)}dm(a)}catch(Ke){i=Ke,rn===a&&a!==null&&(rn=a=a.return);continue}break}while(!0)}function cm(){var n=sl.current;return sl.current=jo,n===null?jo:n}function Gc(){(ln===0||ln===3||ln===2)&&(ln=4),hn===null||!(jr&268435455)&&!(al&268435455)||Mr(hn,xn)}function dl(n,i){var a=Mt;Mt|=2;var u=cm();(hn!==n||xn!==i)&&($i=null,ts(n,i));do try{Y0();break}catch(f){um(n,f)}while(!0);if(nc(),Mt=a,sl.current=u,rn!==null)throw Error(t(261));return hn=null,xn=0,ln}function Y0(){for(;rn!==null;)fm(rn)}function q0(){for(;rn!==null&&!So();)fm(rn)}function fm(n){var i=mm(n.alternate,n,Qn);n.memoizedProps=n.pendingProps,i===null?dm(n):rn=i,Ic.current=null}function dm(n){var i=n;do{var a=i.alternate;if(n=i.return,i.flags&32768){if(a=z0(a,i),a!==null){a.flags&=32767,rn=a;return}if(n!==null)n.flags|=32768,n.subtreeFlags=0,n.deletions=null;else{ln=6,rn=null;return}}else if(a=k0(a,i,Qn),a!==null){rn=a;return}if(i=i.sibling,i!==null){rn=i;return}rn=i=n}while(i!==null);ln===0&&(ln=5)}function ns(n,i,a){var u=pt,f=ai.transition;try{ai.transition=null,pt=1,K0(n,i,a,u)}finally{ai.transition=f,pt=u}return null}function K0(n,i,a,u){do Os();while(yr!==null);if(Mt&6)throw Error(t(327));a=n.finishedWork;var f=n.finishedLanes;if(a===null)return null;if(n.finishedWork=null,n.finishedLanes=0,a===n.current)throw Error(t(177));n.callbackNode=null,n.callbackPriority=0;var h=a.lanes|a.childLanes;if(Bn(n,h),n===hn&&(rn=hn=null,xn=0),!(a.subtreeFlags&2064)&&!(a.flags&2064)||ll||(ll=!0,gm(X,function(){return Os(),null})),h=(a.flags&15990)!==0,a.subtreeFlags&15990||h){h=ai.transition,ai.transition=null;var w=pt;pt=1;var U=Mt;Mt|=4,Ic.current=null,H0(n,a),nm(a,n),p0(Gu),Eo=!!Hu,Gu=Hu=null,n.current=a,G0(a),Su(),Mt=U,pt=w,ai.transition=h}else n.current=a;if(ll&&(ll=!1,yr=n,ul=f),h=n.pendingLanes,h===0&&(xr=null),Oe(a.stateNode),Wn(n,qt()),i!==null)for(u=n.onRecoverableError,a=0;a<i.length;a++)f=i[a],u(f.value,{componentStack:f.stack,digest:f.digest});if(ol)throw ol=!1,n=Oc,Oc=null,n;return ul&1&&n.tag!==0&&Os(),h=n.pendingLanes,h&1?n===Bc?$a++:($a=0,Bc=n):$a=0,mr(),null}function Os(){if(yr!==null){var n=Vi(ul),i=ai.transition,a=pt;try{if(ai.transition=null,pt=16>n?16:n,yr===null)var u=!1;else{if(n=yr,yr=null,ul=0,Mt&6)throw Error(t(331));var f=Mt;for(Mt|=4,Be=n.current;Be!==null;){var h=Be,w=h.child;if(Be.flags&16){var U=h.deletions;if(U!==null){for(var B=0;B<U.length;B++){var se=U[B];for(Be=se;Be!==null;){var xe=Be;switch(xe.tag){case 0:case 11:case 15:Ya(8,xe,h)}var ye=xe.child;if(ye!==null)ye.return=xe,Be=ye;else for(;Be!==null;){xe=Be;var ve=xe.sibling,Fe=xe.return;if(Qp(xe),xe===se){Be=null;break}if(ve!==null){ve.return=Fe,Be=ve;break}Be=Fe}}}var Ve=h.alternate;if(Ve!==null){var We=Ve.child;if(We!==null){Ve.child=null;do{var en=We.sibling;We.sibling=null,We=en}while(We!==null)}}Be=h}}if(h.subtreeFlags&2064&&w!==null)w.return=h,Be=w;else e:for(;Be!==null;){if(h=Be,h.flags&2048)switch(h.tag){case 0:case 11:case 15:Ya(9,h,h.return)}var J=h.sibling;if(J!==null){J.return=h.return,Be=J;break e}Be=h.return}}var G=n.current;for(Be=G;Be!==null;){w=Be;var te=w.child;if(w.subtreeFlags&2064&&te!==null)te.return=w,Be=te;else e:for(w=G;Be!==null;){if(U=Be,U.flags&2048)try{switch(U.tag){case 0:case 11:case 15:rl(9,U)}}catch(Ke){jt(U,U.return,Ke)}if(U===w){Be=null;break e}var Me=U.sibling;if(Me!==null){Me.return=U.return,Be=Me;break e}Be=U.return}}if(Mt=f,mr(),Te&&typeof Te.onPostCommitFiberRoot=="function")try{Te.onPostCommitFiberRoot(j,n)}catch{}u=!0}return u}finally{pt=a,ai.transition=i}}return!1}function hm(n,i,a){i=Ns(a,i),i=Lp(n,i,1),n=_r(n,i,1),i=Nn(),n!==null&&(ht(n,1,i),Wn(n,i))}function jt(n,i,a){if(n.tag===3)hm(n,n,a);else for(;i!==null;){if(i.tag===3){hm(i,n,a);break}else if(i.tag===1){var u=i.stateNode;if(typeof i.type.getDerivedStateFromError=="function"||typeof u.componentDidCatch=="function"&&(xr===null||!xr.has(u))){n=Ns(a,n),n=Dp(i,n,1),i=_r(i,n,1),n=Nn(),i!==null&&(ht(i,1,n),Wn(i,n));break}}i=i.return}}function $0(n,i,a){var u=n.pingCache;u!==null&&u.delete(i),i=Nn(),n.pingedLanes|=n.suspendedLanes&a,hn===n&&(xn&a)===a&&(ln===4||ln===3&&(xn&130023424)===xn&&500>qt()-Fc?ts(n,0):Uc|=a),Wn(n,i)}function pm(n,i){i===0&&(n.mode&1?(i=Ye,Ye<<=1,!(Ye&130023424)&&(Ye=4194304)):i=1);var a=Nn();n=Yi(n,i),n!==null&&(ht(n,i,a),Wn(n,a))}function Z0(n){var i=n.memoizedState,a=0;i!==null&&(a=i.retryLane),pm(n,a)}function Q0(n,i){var a=0;switch(n.tag){case 13:var u=n.stateNode,f=n.memoizedState;f!==null&&(a=f.retryLane);break;case 19:u=n.stateNode;break;default:throw Error(t(314))}u!==null&&u.delete(i),pm(n,a)}var mm;mm=function(n,i,a){if(n!==null)if(n.memoizedProps!==i.pendingProps||zn.current)Hn=!0;else{if(!(n.lanes&a)&&!(i.flags&128))return Hn=!1,B0(n,i,a);Hn=!!(n.flags&131072)}else Hn=!1,Xt&&i.flags&1048576&&Kh(i,Vo,i.index);switch(i.lanes=0,i.tag){case 2:var u=i.type;nl(n,i),n=i.pendingProps;var f=ws(i,Tn.current);Ls(i,a),f=hc(null,i,u,n,f,a);var h=pc();return i.flags|=1,typeof f=="object"&&f!==null&&typeof f.render=="function"&&f.$$typeof===void 0?(i.tag=1,i.memoizedState=null,i.updateQueue=null,Vn(u)?(h=!0,Bo(i)):h=!1,i.memoizedState=f.state!==null&&f.state!==void 0?f.state:null,ac(i),f.updater=el,i.stateNode=f,f._reactInternals=i,yc(i,u,n,a),i=Tc(null,i,u,!0,h,a)):(i.tag=0,Xt&&h&&Zu(i),Dn(null,i,f,a),i=i.child),i;case 16:u=i.elementType;e:{switch(nl(n,i),n=i.pendingProps,f=u._init,u=f(u._payload),i.type=u,f=i.tag=j0(u),n=gi(u,n),f){case 0:i=Ec(null,i,u,n,a);break e;case 1:i=Vp(null,i,u,n,a);break e;case 11:i=Fp(null,i,u,n,a);break e;case 14:i=Op(null,i,u,gi(u.type,n),a);break e}throw Error(t(306,u,""))}return i;case 0:return u=i.type,f=i.pendingProps,f=i.elementType===u?f:gi(u,f),Ec(n,i,u,f,a);case 1:return u=i.type,f=i.pendingProps,f=i.elementType===u?f:gi(u,f),Vp(n,i,u,f,a);case 3:e:{if(Hp(i),n===null)throw Error(t(387));u=i.pendingProps,h=i.memoizedState,f=h.element,ip(n,i),qo(i,u,null,a);var w=i.memoizedState;if(u=w.element,h.isDehydrated)if(h={element:u,isDehydrated:!1,cache:w.cache,pendingSuspenseBoundaries:w.pendingSuspenseBoundaries,transitions:w.transitions},i.updateQueue.baseState=h,i.memoizedState=h,i.flags&256){f=Ns(Error(t(423)),i),i=Gp(n,i,u,a,f);break e}else if(u!==f){f=Ns(Error(t(424)),i),i=Gp(n,i,u,a,f);break e}else for(Zn=dr(i.stateNode.containerInfo.firstChild),$n=i,Xt=!0,mi=null,a=tp(i,null,u,a),i.child=a;a;)a.flags=a.flags&-3|4096,a=a.sibling;else{if(Cs(),u===f){i=Ki(n,i,a);break e}Dn(n,i,u,a)}i=i.child}return i;case 5:return ap(i),n===null&&ju(i),u=i.type,f=i.pendingProps,h=n!==null?n.memoizedProps:null,w=f.children,Wu(u,f)?w=null:h!==null&&Wu(u,h)&&(i.flags|=32),zp(n,i),Dn(n,i,w,a),i.child;case 6:return n===null&&ju(i),null;case 13:return Wp(n,i,a);case 4:return oc(i,i.stateNode.containerInfo),u=i.pendingProps,n===null?i.child=bs(i,null,u,a):Dn(n,i,u,a),i.child;case 11:return u=i.type,f=i.pendingProps,f=i.elementType===u?f:gi(u,f),Fp(n,i,u,f,a);case 7:return Dn(n,i,i.pendingProps,a),i.child;case 8:return Dn(n,i,i.pendingProps.children,a),i.child;case 12:return Dn(n,i,i.pendingProps.children,a),i.child;case 10:e:{if(u=i.type._context,f=i.pendingProps,h=i.memoizedProps,w=f.value,Ot(Wo,u._currentValue),u._currentValue=w,h!==null)if(pi(h.value,w)){if(h.children===f.children&&!zn.current){i=Ki(n,i,a);break e}}else for(h=i.child,h!==null&&(h.return=i);h!==null;){var U=h.dependencies;if(U!==null){w=h.child;for(var B=U.firstContext;B!==null;){if(B.context===u){if(h.tag===1){B=qi(-1,a&-a),B.tag=2;var se=h.updateQueue;if(se!==null){se=se.shared;var xe=se.pending;xe===null?B.next=B:(B.next=xe.next,xe.next=B),se.pending=B}}h.lanes|=a,B=h.alternate,B!==null&&(B.lanes|=a),rc(h.return,a,i),U.lanes|=a;break}B=B.next}}else if(h.tag===10)w=h.type===i.type?null:h.child;else if(h.tag===18){if(w=h.return,w===null)throw Error(t(341));w.lanes|=a,U=w.alternate,U!==null&&(U.lanes|=a),rc(w,a,i),w=h.sibling}else w=h.child;if(w!==null)w.return=h;else for(w=h;w!==null;){if(w===i){w=null;break}if(h=w.sibling,h!==null){h.return=w.return,w=h;break}w=w.return}h=w}Dn(n,i,f.children,a),i=i.child}return i;case 9:return f=i.type,u=i.pendingProps.children,Ls(i,a),f=ri(f),u=u(f),i.flags|=1,Dn(n,i,u,a),i.child;case 14:return u=i.type,f=gi(u,i.pendingProps),f=gi(u.type,f),Op(n,i,u,f,a);case 15:return Bp(n,i,i.type,i.pendingProps,a);case 17:return u=i.type,f=i.pendingProps,f=i.elementType===u?f:gi(u,f),nl(n,i),i.tag=1,Vn(u)?(n=!0,Bo(i)):n=!1,Ls(i,a),bp(i,u,f),yc(i,u,f,a),Tc(null,i,u,!0,n,a);case 19:return Yp(n,i,a);case 22:return kp(n,i,a)}throw Error(t(156,i.tag))};function gm(n,i){return Wr(n,i)}function J0(n,i,a,u){this.tag=n,this.key=a,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.ref=null,this.pendingProps=i,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=u,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function oi(n,i,a,u){return new J0(n,i,a,u)}function Wc(n){return n=n.prototype,!(!n||!n.isReactComponent)}function j0(n){if(typeof n=="function")return Wc(n)?1:0;if(n!=null){if(n=n.$$typeof,n===K)return 11;if(n===Q)return 14}return 2}function Er(n,i){var a=n.alternate;return a===null?(a=oi(n.tag,i,n.key,n.mode),a.elementType=n.elementType,a.type=n.type,a.stateNode=n.stateNode,a.alternate=n,n.alternate=a):(a.pendingProps=i,a.type=n.type,a.flags=0,a.subtreeFlags=0,a.deletions=null),a.flags=n.flags&14680064,a.childLanes=n.childLanes,a.lanes=n.lanes,a.child=n.child,a.memoizedProps=n.memoizedProps,a.memoizedState=n.memoizedState,a.updateQueue=n.updateQueue,i=n.dependencies,a.dependencies=i===null?null:{lanes:i.lanes,firstContext:i.firstContext},a.sibling=n.sibling,a.index=n.index,a.ref=n.ref,a}function hl(n,i,a,u,f,h){var w=2;if(u=n,typeof n=="function")Wc(n)&&(w=1);else if(typeof n=="string")w=5;else e:switch(n){case O:return is(a.children,f,h,i);case T:w=8,f|=8;break;case D:return n=oi(12,a,i,f|2),n.elementType=D,n.lanes=h,n;case ce:return n=oi(13,a,i,f),n.elementType=ce,n.lanes=h,n;case me:return n=oi(19,a,i,f),n.elementType=me,n.lanes=h,n;case $:return pl(a,f,h,i);default:if(typeof n=="object"&&n!==null)switch(n.$$typeof){case z:w=10;break e;case k:w=9;break e;case K:w=11;break e;case Q:w=14;break e;case ue:w=16,u=null;break e}throw Error(t(130,n==null?n:typeof n,""))}return i=oi(w,a,i,f),i.elementType=n,i.type=u,i.lanes=h,i}function is(n,i,a,u){return n=oi(7,n,u,i),n.lanes=a,n}function pl(n,i,a,u){return n=oi(22,n,u,i),n.elementType=$,n.lanes=a,n.stateNode={isHidden:!1},n}function Xc(n,i,a){return n=oi(6,n,null,i),n.lanes=a,n}function Yc(n,i,a){return i=oi(4,n.children!==null?n.children:[],n.key,i),i.lanes=a,i.stateNode={containerInfo:n.containerInfo,pendingChildren:null,implementation:n.implementation},i}function ev(n,i,a,u,f){this.tag=i,this.containerInfo=n,this.finishedWork=this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.pendingContext=this.context=null,this.callbackPriority=0,this.eventTimes=_n(0),this.expirationTimes=_n(-1),this.entangledLanes=this.finishedLanes=this.mutableReadLanes=this.expiredLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=_n(0),this.identifierPrefix=u,this.onRecoverableError=f,this.mutableSourceEagerHydrationData=null}function qc(n,i,a,u,f,h,w,U,B){return n=new ev(n,i,a,U,B),i===1?(i=1,h===!0&&(i|=8)):i=0,h=oi(3,null,null,i),n.current=h,h.stateNode=n,h.memoizedState={element:u,isDehydrated:a,cache:null,transitions:null,pendingSuspenseBoundaries:null},ac(h),n}function tv(n,i,a){var u=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:P,key:u==null?null:""+u,children:n,containerInfo:i,implementation:a}}function _m(n){if(!n)return pr;n=n._reactInternals;e:{if(Ln(n)!==n||n.tag!==1)throw Error(t(170));var i=n;do{switch(i.tag){case 3:i=i.stateNode.context;break e;case 1:if(Vn(i.type)){i=i.stateNode.__reactInternalMemoizedMergedChildContext;break e}}i=i.return}while(i!==null);throw Error(t(171))}if(n.tag===1){var a=n.type;if(Vn(a))return Xh(n,a,i)}return i}function vm(n,i,a,u,f,h,w,U,B){return n=qc(a,u,!0,n,f,h,w,U,B),n.context=_m(null),a=n.current,u=Nn(),f=Sr(a),h=qi(u,f),h.callback=i??null,_r(a,h,f),n.current.lanes=f,ht(n,f,u),Wn(n,u),n}function ml(n,i,a,u){var f=i.current,h=Nn(),w=Sr(f);return a=_m(a),i.context===null?i.context=a:i.pendingContext=a,i=qi(h,w),i.payload={element:n},u=u===void 0?null:u,u!==null&&(i.callback=u),n=_r(f,i,w),n!==null&&(xi(n,f,w,h),Yo(n,f,w)),w}function gl(n){if(n=n.current,!n.child)return null;switch(n.child.tag){case 5:return n.child.stateNode;default:return n.child.stateNode}}function xm(n,i){if(n=n.memoizedState,n!==null&&n.dehydrated!==null){var a=n.retryLane;n.retryLane=a!==0&&a<i?a:i}}function Kc(n,i){xm(n,i),(n=n.alternate)&&xm(n,i)}function nv(){return null}var ym=typeof reportError=="function"?reportError:function(n){console.error(n)};function $c(n){this._internalRoot=n}_l.prototype.render=$c.prototype.render=function(n){var i=this._internalRoot;if(i===null)throw Error(t(409));ml(n,i,null,null)},_l.prototype.unmount=$c.prototype.unmount=function(){var n=this._internalRoot;if(n!==null){this._internalRoot=null;var i=n.containerInfo;es(function(){ml(null,n,null,null)}),i[Hi]=null}};function _l(n){this._internalRoot=n}_l.prototype.unstable_scheduleHydration=function(n){if(n){var i=Pt();n={blockedOn:null,target:n,priority:i};for(var a=0;a<ur.length&&i!==0&&i<ur[a].priority;a++);ur.splice(a,0,n),a===0&&ah(n)}};function Zc(n){return!(!n||n.nodeType!==1&&n.nodeType!==9&&n.nodeType!==11)}function vl(n){return!(!n||n.nodeType!==1&&n.nodeType!==9&&n.nodeType!==11&&(n.nodeType!==8||n.nodeValue!==" react-mount-point-unstable "))}function Sm(){}function iv(n,i,a,u,f){if(f){if(typeof u=="function"){var h=u;u=function(){var se=gl(w);h.call(se)}}var w=vm(i,u,n,0,null,!1,!1,"",Sm);return n._reactRootContainer=w,n[Hi]=w.current,Na(n.nodeType===8?n.parentNode:n),es(),w}for(;f=n.lastChild;)n.removeChild(f);if(typeof u=="function"){var U=u;u=function(){var se=gl(B);U.call(se)}}var B=qc(n,0,!1,null,null,!1,!1,"",Sm);return n._reactRootContainer=B,n[Hi]=B.current,Na(n.nodeType===8?n.parentNode:n),es(function(){ml(i,B,a,u)}),B}function xl(n,i,a,u,f){var h=a._reactRootContainer;if(h){var w=h;if(typeof f=="function"){var U=f;f=function(){var B=gl(w);U.call(B)}}ml(i,w,n,f)}else w=iv(a,i,n,f,u);return gl(w)}Rt=function(n){switch(n.tag){case 3:var i=n.stateNode;if(i.current.memoizedState.isDehydrated){var a=yt(i.pendingLanes);a!==0&&(kn(i,a|1),Wn(i,qt()),!(Mt&6)&&(Fs=qt()+500,mr()))}break;case 13:es(function(){var u=Yi(n,1);if(u!==null){var f=Nn();xi(u,n,1,f)}}),Kc(n,1)}},Bt=function(n){if(n.tag===13){var i=Yi(n,134217728);if(i!==null){var a=Nn();xi(i,n,134217728,a)}Kc(n,134217728)}},di=function(n){if(n.tag===13){var i=Sr(n),a=Yi(n,i);if(a!==null){var u=Nn();xi(a,n,i,u)}Kc(n,i)}},Pt=function(){return pt},hi=function(n,i){var a=pt;try{return pt=n,i()}finally{pt=a}},et=function(n,i,a){switch(i){case"input":if(Ht(n,a),i=a.name,a.type==="radio"&&i!=null){for(a=n;a.parentNode;)a=a.parentNode;for(a=a.querySelectorAll("input[name="+JSON.stringify(""+i)+'][type="radio"]'),i=0;i<a.length;i++){var u=a[i];if(u!==n&&u.form===n.form){var f=Fo(u);if(!f)throw Error(t(90));Vt(u),Ht(u,f)}}}break;case"textarea":gn(n,a);break;case"select":i=a.value,i!=null&&Ct(n,!!a.multiple,i,!1)}},Le=Vc,ge=es;var rv={usingClientEntryPoint:!1,Events:[Fa,Es,Fo,de,Ce,Vc]},Za={findFiberByHostInstance:Yr,bundleType:0,version:"18.3.1",rendererPackageName:"react-dom"},sv={bundleType:Za.bundleType,version:Za.version,rendererPackageName:Za.rendererPackageName,rendererConfig:Za.rendererConfig,overrideHookState:null,overrideHookStateDeletePath:null,overrideHookStateRenamePath:null,overrideProps:null,overridePropsDeletePath:null,overridePropsRenamePath:null,setErrorHandler:null,setSuspenseHandler:null,scheduleUpdate:null,currentDispatcherRef:C.ReactCurrentDispatcher,findHostInstanceByFiber:function(n){return n=Gr(n),n===null?null:n.stateNode},findFiberByHostInstance:Za.findFiberByHostInstance||nv,findHostInstancesForRefresh:null,scheduleRefresh:null,scheduleRoot:null,setRefreshHandler:null,getCurrentFiber:null,reconcilerVersion:"18.3.1-next-f1338f8080-20240426"};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<"u"){var yl=__REACT_DEVTOOLS_GLOBAL_HOOK__;if(!yl.isDisabled&&yl.supportsFiber)try{j=yl.inject(sv),Te=yl}catch{}}return Xn.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=rv,Xn.createPortal=function(n,i){var a=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!Zc(i))throw Error(t(200));return tv(n,i,null,a)},Xn.createRoot=function(n,i){if(!Zc(n))throw Error(t(299));var a=!1,u="",f=ym;return i!=null&&(i.unstable_strictMode===!0&&(a=!0),i.identifierPrefix!==void 0&&(u=i.identifierPrefix),i.onRecoverableError!==void 0&&(f=i.onRecoverableError)),i=qc(n,1,!1,null,null,a,!1,u,f),n[Hi]=i.current,Na(n.nodeType===8?n.parentNode:n),new $c(i)},Xn.findDOMNode=function(n){if(n==null)return null;if(n.nodeType===1)return n;var i=n._reactInternals;if(i===void 0)throw typeof n.render=="function"?Error(t(188)):(n=Object.keys(n).join(","),Error(t(268,n)));return n=Gr(i),n=n===null?null:n.stateNode,n},Xn.flushSync=function(n){return es(n)},Xn.hydrate=function(n,i,a){if(!vl(i))throw Error(t(200));return xl(null,n,i,!0,a)},Xn.hydrateRoot=function(n,i,a){if(!Zc(n))throw Error(t(405));var u=a!=null&&a.hydratedSources||null,f=!1,h="",w=ym;if(a!=null&&(a.unstable_strictMode===!0&&(f=!0),a.identifierPrefix!==void 0&&(h=a.identifierPrefix),a.onRecoverableError!==void 0&&(w=a.onRecoverableError)),i=vm(i,null,n,1,a??null,f,!1,h,w),n[Hi]=i.current,Na(n),u)for(n=0;n<u.length;n++)a=u[n],f=a._getVersion,f=f(a._source),i.mutableSourceEagerHydrationData==null?i.mutableSourceEagerHydrationData=[a,f]:i.mutableSourceEagerHydrationData.push(a,f);return new _l(i)},Xn.render=function(n,i,a){if(!vl(i))throw Error(t(200));return xl(null,n,i,!1,a)},Xn.unmountComponentAtNode=function(n){if(!vl(n))throw Error(t(40));return n._reactRootContainer?(es(function(){xl(null,null,n,!1,function(){n._reactRootContainer=null,n[Hi]=null})}),!0):!1},Xn.unstable_batchedUpdates=Vc,Xn.unstable_renderSubtreeIntoContainer=function(n,i,a,u){if(!vl(a))throw Error(t(200));if(n==null||n._reactInternals===void 0)throw Error(t(38));return xl(n,i,a,!1,u)},Xn.version="18.3.1-next-f1338f8080-20240426",Xn}var Rm;function dv(){if(Rm)return Jc.exports;Rm=1;function s(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(s)}catch(e){console.error(e)}}return s(),Jc.exports=fv(),Jc.exports}var Cm;function hv(){if(Cm)return Sl;Cm=1;var s=dv();return Sl.createRoot=s.createRoot,Sl.hydrateRoot=s.hydrateRoot,Sl}var pv=hv();/**
 * @license
 * Copyright 2010-2026 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const Id="185",aa={ROTATE:0,DOLLY:1,PAN:2},ra={ROTATE:0,PAN:1,DOLLY_PAN:2,DOLLY_ROTATE:3},mv=0,bm=1,gv=2,Jl=1,_v=2,oo=3,Ur=0,On=1,Ni=2,nr=0,oa=1,zf=2,Pm=3,Lm=4,vv=5,ls=100,xv=101,yv=102,Sv=103,Mv=104,Ev=200,Tv=201,wv=202,Av=203,Vf=204,Hf=205,Rv=206,Cv=207,bv=208,Pv=209,Lv=210,Dv=211,Nv=212,Iv=213,Uv=214,Gf=0,Wf=1,Xf=2,ca=3,Yf=4,qf=5,Kf=6,$f=7,Ud=0,Fv=1,Ov=2,Oi=0,Gg=1,Wg=2,Xg=3,Yg=4,qg=5,Kg=6,$g=7,Zg=300,ds=301,fa=302,tf=303,nf=304,mu=306,Zf=1e3,tr=1001,Qf=1002,yn=1003,Bv=1004,Ml=1005,Pn=1006,rf=1007,cs=1008,ei=1009,Qg=1010,Jg=1011,uo=1012,Fd=1013,ki=1014,Ui=1015,rr=1016,Od=1017,Bd=1018,co=1020,jg=35902,e_=35899,t_=1021,n_=1022,Ei=1023,sr=1026,fs=1027,i_=1028,kd=1029,hs=1030,zd=1031,Vd=1033,jl=33776,eu=33777,tu=33778,nu=33779,Jf=35840,jf=35841,ed=35842,td=35843,nd=36196,id=37492,rd=37496,sd=37488,ad=37489,au=37490,od=37491,ld=37808,ud=37809,cd=37810,fd=37811,dd=37812,hd=37813,pd=37814,md=37815,gd=37816,_d=37817,vd=37818,xd=37819,yd=37820,Sd=37821,Md=36492,Ed=36494,Td=36495,wd=36283,Ad=36284,ou=36285,Rd=36286,kv=3200,Cd=0,zv=1,Dr="",Fn="srgb",lu="srgb-linear",uu="linear",Lt="srgb",Bs=7680,Dm=519,Vv=512,Hv=513,Gv=514,Hd=515,Wv=516,Xv=517,Gd=518,Yv=519,bd=35044,Nm="300 es",Fi=2e3,fo=2001;function qv(s){for(let e=s.length-1;e>=0;--e)if(s[e]>=65535)return!0;return!1}function ho(s){return document.createElementNS("http://www.w3.org/1999/xhtml",s)}function Kv(){const s=ho("canvas");return s.style.display="block",s}const Im={};function cu(...s){const e="THREE."+s.shift();console.log(e,...s)}function r_(s){const e=s[0];if(typeof e=="string"&&e.startsWith("TSL:")){const t=s[1];t&&t.isStackTrace?s[0]+=" "+t.getLocation():s[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return s}function rt(...s){s=r_(s);const e="THREE."+s.shift();{const t=s[0];t&&t.isStackTrace?console.warn(t.getError(e)):console.warn(e,...s)}}function St(...s){s=r_(s);const e="THREE."+s.shift();{const t=s[0];t&&t.isStackTrace?console.error(t.getError(e)):console.error(e,...s)}}function la(...s){const e=s.join(" ");e in Im||(Im[e]=!0,rt(...s))}function $v(s,e,t){return new Promise(function(r,o){function l(){switch(s.clientWaitSync(e,s.SYNC_FLUSH_COMMANDS_BIT,0)){case s.WAIT_FAILED:o();break;case s.TIMEOUT_EXPIRED:setTimeout(l,t);break;default:r()}}setTimeout(l,t)})}const Zv={[Gf]:Wf,[Xf]:Kf,[Yf]:$f,[ca]:qf,[Wf]:Gf,[Kf]:Xf,[$f]:Yf,[qf]:ca};class Br{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});const r=this._listeners;r[e]===void 0&&(r[e]=[]),r[e].indexOf(t)===-1&&r[e].push(t)}hasEventListener(e,t){const r=this._listeners;return r===void 0?!1:r[e]!==void 0&&r[e].indexOf(t)!==-1}removeEventListener(e,t){const r=this._listeners;if(r===void 0)return;const o=r[e];if(o!==void 0){const l=o.indexOf(t);l!==-1&&o.splice(l,1)}}dispatchEvent(e){const t=this._listeners;if(t===void 0)return;const r=t[e.type];if(r!==void 0){e.target=this;const o=r.slice(0);for(let l=0,c=o.length;l<c;l++)o[l].call(this,e);e.target=null}}}const Cn=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],iu=Math.PI/180,Pd=180/Math.PI;function Ir(){const s=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,r=Math.random()*4294967295|0;return(Cn[s&255]+Cn[s>>8&255]+Cn[s>>16&255]+Cn[s>>24&255]+"-"+Cn[e&255]+Cn[e>>8&255]+"-"+Cn[e>>16&15|64]+Cn[e>>24&255]+"-"+Cn[t&63|128]+Cn[t>>8&255]+"-"+Cn[t>>16&255]+Cn[t>>24&255]+Cn[r&255]+Cn[r>>8&255]+Cn[r>>16&255]+Cn[r>>24&255]).toLowerCase()}function gt(s,e,t){return Math.max(e,Math.min(t,s))}function Qv(s,e){return(s%e+e)%e}function sf(s,e,t){return(1-t)*s+t*e}function Ii(s,e){switch(e.constructor){case Float32Array:return s;case Uint32Array:return s/4294967295;case Uint16Array:return s/65535;case Uint8Array:return s/255;case Int32Array:return Math.max(s/2147483647,-1);case Int16Array:return Math.max(s/32767,-1);case Int8Array:return Math.max(s/127,-1);default:throw new Error("THREE.MathUtils: Invalid component type.")}}function Nt(s,e){switch(e.constructor){case Float32Array:return s;case Uint32Array:return Math.round(s*4294967295);case Uint16Array:return Math.round(s*65535);case Uint8Array:return Math.round(s*255);case Int32Array:return Math.round(s*2147483647);case Int16Array:return Math.round(s*32767);case Int8Array:return Math.round(s*127);default:throw new Error("THREE.MathUtils: Invalid component type.")}}const Jv={DEG2RAD:iu},eh=class eh{constructor(e=0,t=0){this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("THREE.Vector2: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const t=this.x,r=this.y,o=e.elements;return this.x=o[0]*t+o[3]*r+o[6],this.y=o[1]*t+o[4]*r+o[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=gt(this.x,e.x,t.x),this.y=gt(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=gt(this.x,e,t),this.y=gt(this.y,e,t),this}clampLength(e,t){const r=this.length();return this.divideScalar(r||1).multiplyScalar(gt(r,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const r=this.dot(e)/t;return Math.acos(gt(r,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,r=this.y-e.y;return t*t+r*r}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,r){return this.x=e.x+(t.x-e.x)*r,this.y=e.y+(t.y-e.y)*r,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){const r=Math.cos(t),o=Math.sin(t),l=this.x-e.x,c=this.y-e.y;return this.x=l*r-c*o+e.x,this.y=l*o+c*r+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}};eh.prototype.isVector2=!0;let Qe=eh;class Fr{constructor(e=0,t=0,r=0,o=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=r,this._w=o}static slerpFlat(e,t,r,o,l,c,d){let p=r[o+0],m=r[o+1],x=r[o+2],y=r[o+3],g=l[c+0],M=l[c+1],E=l[c+2],R=l[c+3];if(y!==R||p!==g||m!==M||x!==E){let v=p*g+m*M+x*E+y*R;v<0&&(g=-g,M=-M,E=-E,R=-R,v=-v);let _=1-d;if(v<.9995){const b=Math.acos(v),N=Math.sin(b);_=Math.sin(_*b)/N,d=Math.sin(d*b)/N,p=p*_+g*d,m=m*_+M*d,x=x*_+E*d,y=y*_+R*d}else{p=p*_+g*d,m=m*_+M*d,x=x*_+E*d,y=y*_+R*d;const b=1/Math.sqrt(p*p+m*m+x*x+y*y);p*=b,m*=b,x*=b,y*=b}}e[t]=p,e[t+1]=m,e[t+2]=x,e[t+3]=y}static multiplyQuaternionsFlat(e,t,r,o,l,c){const d=r[o],p=r[o+1],m=r[o+2],x=r[o+3],y=l[c],g=l[c+1],M=l[c+2],E=l[c+3];return e[t]=d*E+x*y+p*M-m*g,e[t+1]=p*E+x*g+m*y-d*M,e[t+2]=m*E+x*M+d*g-p*y,e[t+3]=x*E-d*y-p*g-m*M,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,r,o){return this._x=e,this._y=t,this._z=r,this._w=o,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){const r=e._x,o=e._y,l=e._z,c=e._order,d=Math.cos,p=Math.sin,m=d(r/2),x=d(o/2),y=d(l/2),g=p(r/2),M=p(o/2),E=p(l/2);switch(c){case"XYZ":this._x=g*x*y+m*M*E,this._y=m*M*y-g*x*E,this._z=m*x*E+g*M*y,this._w=m*x*y-g*M*E;break;case"YXZ":this._x=g*x*y+m*M*E,this._y=m*M*y-g*x*E,this._z=m*x*E-g*M*y,this._w=m*x*y+g*M*E;break;case"ZXY":this._x=g*x*y-m*M*E,this._y=m*M*y+g*x*E,this._z=m*x*E+g*M*y,this._w=m*x*y-g*M*E;break;case"ZYX":this._x=g*x*y-m*M*E,this._y=m*M*y+g*x*E,this._z=m*x*E-g*M*y,this._w=m*x*y+g*M*E;break;case"YZX":this._x=g*x*y+m*M*E,this._y=m*M*y+g*x*E,this._z=m*x*E-g*M*y,this._w=m*x*y-g*M*E;break;case"XZY":this._x=g*x*y-m*M*E,this._y=m*M*y-g*x*E,this._z=m*x*E+g*M*y,this._w=m*x*y+g*M*E;break;default:rt("Quaternion: .setFromEuler() encountered an unknown order: "+c)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){const r=t/2,o=Math.sin(r);return this._x=e.x*o,this._y=e.y*o,this._z=e.z*o,this._w=Math.cos(r),this._onChangeCallback(),this}setFromRotationMatrix(e){const t=e.elements,r=t[0],o=t[4],l=t[8],c=t[1],d=t[5],p=t[9],m=t[2],x=t[6],y=t[10],g=r+d+y;if(g>0){const M=.5/Math.sqrt(g+1);this._w=.25/M,this._x=(x-p)*M,this._y=(l-m)*M,this._z=(c-o)*M}else if(r>d&&r>y){const M=2*Math.sqrt(1+r-d-y);this._w=(x-p)/M,this._x=.25*M,this._y=(o+c)/M,this._z=(l+m)/M}else if(d>y){const M=2*Math.sqrt(1+d-r-y);this._w=(l-m)/M,this._x=(o+c)/M,this._y=.25*M,this._z=(p+x)/M}else{const M=2*Math.sqrt(1+y-r-d);this._w=(c-o)/M,this._x=(l+m)/M,this._y=(p+x)/M,this._z=.25*M}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let r=e.dot(t)+1;return r<1e-8?(r=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=r):(this._x=0,this._y=-e.z,this._z=e.y,this._w=r)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=r),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(gt(this.dot(e),-1,1)))}rotateTowards(e,t){const r=this.angleTo(e);if(r===0)return this;const o=Math.min(1,t/r);return this.slerp(e,o),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){const r=e._x,o=e._y,l=e._z,c=e._w,d=t._x,p=t._y,m=t._z,x=t._w;return this._x=r*x+c*d+o*m-l*p,this._y=o*x+c*p+l*d-r*m,this._z=l*x+c*m+r*p-o*d,this._w=c*x-r*d-o*p-l*m,this._onChangeCallback(),this}slerp(e,t){let r=e._x,o=e._y,l=e._z,c=e._w,d=this.dot(e);d<0&&(r=-r,o=-o,l=-l,c=-c,d=-d);let p=1-t;if(d<.9995){const m=Math.acos(d),x=Math.sin(m);p=Math.sin(p*m)/x,t=Math.sin(t*m)/x,this._x=this._x*p+r*t,this._y=this._y*p+o*t,this._z=this._z*p+l*t,this._w=this._w*p+c*t,this._onChangeCallback()}else this._x=this._x*p+r*t,this._y=this._y*p+o*t,this._z=this._z*p+l*t,this._w=this._w*p+c*t,this.normalize();return this}slerpQuaternions(e,t,r){return this.copy(e).slerp(t,r)}random(){const e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),r=Math.random(),o=Math.sqrt(1-r),l=Math.sqrt(r);return this.set(o*Math.sin(e),o*Math.cos(e),l*Math.sin(t),l*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}const th=class th{constructor(e=0,t=0,r=0){this.x=e,this.y=t,this.z=r}set(e,t,r){return r===void 0&&(r=this.z),this.x=e,this.y=t,this.z=r,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("THREE.Vector3: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(Um.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(Um.setFromAxisAngle(e,t))}applyMatrix3(e){const t=this.x,r=this.y,o=this.z,l=e.elements;return this.x=l[0]*t+l[3]*r+l[6]*o,this.y=l[1]*t+l[4]*r+l[7]*o,this.z=l[2]*t+l[5]*r+l[8]*o,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const t=this.x,r=this.y,o=this.z,l=e.elements,c=1/(l[3]*t+l[7]*r+l[11]*o+l[15]);return this.x=(l[0]*t+l[4]*r+l[8]*o+l[12])*c,this.y=(l[1]*t+l[5]*r+l[9]*o+l[13])*c,this.z=(l[2]*t+l[6]*r+l[10]*o+l[14])*c,this}applyQuaternion(e){const t=this.x,r=this.y,o=this.z,l=e.x,c=e.y,d=e.z,p=e.w,m=2*(c*o-d*r),x=2*(d*t-l*o),y=2*(l*r-c*t);return this.x=t+p*m+c*y-d*x,this.y=r+p*x+d*m-l*y,this.z=o+p*y+l*x-c*m,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const t=this.x,r=this.y,o=this.z,l=e.elements;return this.x=l[0]*t+l[4]*r+l[8]*o,this.y=l[1]*t+l[5]*r+l[9]*o,this.z=l[2]*t+l[6]*r+l[10]*o,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=gt(this.x,e.x,t.x),this.y=gt(this.y,e.y,t.y),this.z=gt(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=gt(this.x,e,t),this.y=gt(this.y,e,t),this.z=gt(this.z,e,t),this}clampLength(e,t){const r=this.length();return this.divideScalar(r||1).multiplyScalar(gt(r,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,r){return this.x=e.x+(t.x-e.x)*r,this.y=e.y+(t.y-e.y)*r,this.z=e.z+(t.z-e.z)*r,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){const r=e.x,o=e.y,l=e.z,c=t.x,d=t.y,p=t.z;return this.x=o*p-l*d,this.y=l*c-r*p,this.z=r*d-o*c,this}projectOnVector(e){const t=e.lengthSq();if(t===0)return this.set(0,0,0);const r=e.dot(this)/t;return this.copy(e).multiplyScalar(r)}projectOnPlane(e){return af.copy(this).projectOnVector(e),this.sub(af)}reflect(e){return this.sub(af.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const r=this.dot(e)/t;return Math.acos(gt(r,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,r=this.y-e.y,o=this.z-e.z;return t*t+r*r+o*o}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,r){const o=Math.sin(t)*e;return this.x=o*Math.sin(r),this.y=Math.cos(t)*e,this.z=o*Math.cos(r),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,r){return this.x=e*Math.sin(t),this.y=r,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){const t=this.setFromMatrixColumn(e,0).length(),r=this.setFromMatrixColumn(e,1).length(),o=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=r,this.z=o,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=Math.random()*Math.PI*2,t=Math.random()*2-1,r=Math.sqrt(1-t*t);return this.x=r*Math.cos(e),this.y=t,this.z=r*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}};th.prototype.isVector3=!0;let H=th;const af=new H,Um=new Fr,nh=class nh{constructor(e,t,r,o,l,c,d,p,m){this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,r,o,l,c,d,p,m)}set(e,t,r,o,l,c,d,p,m){const x=this.elements;return x[0]=e,x[1]=o,x[2]=d,x[3]=t,x[4]=l,x[5]=p,x[6]=r,x[7]=c,x[8]=m,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const t=this.elements,r=e.elements;return t[0]=r[0],t[1]=r[1],t[2]=r[2],t[3]=r[3],t[4]=r[4],t[5]=r[5],t[6]=r[6],t[7]=r[7],t[8]=r[8],this}extractBasis(e,t,r){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),r.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const r=e.elements,o=t.elements,l=this.elements,c=r[0],d=r[3],p=r[6],m=r[1],x=r[4],y=r[7],g=r[2],M=r[5],E=r[8],R=o[0],v=o[3],_=o[6],b=o[1],N=o[4],C=o[7],I=o[2],P=o[5],O=o[8];return l[0]=c*R+d*b+p*I,l[3]=c*v+d*N+p*P,l[6]=c*_+d*C+p*O,l[1]=m*R+x*b+y*I,l[4]=m*v+x*N+y*P,l[7]=m*_+x*C+y*O,l[2]=g*R+M*b+E*I,l[5]=g*v+M*N+E*P,l[8]=g*_+M*C+E*O,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){const e=this.elements,t=e[0],r=e[1],o=e[2],l=e[3],c=e[4],d=e[5],p=e[6],m=e[7],x=e[8];return t*c*x-t*d*m-r*l*x+r*d*p+o*l*m-o*c*p}invert(){const e=this.elements,t=e[0],r=e[1],o=e[2],l=e[3],c=e[4],d=e[5],p=e[6],m=e[7],x=e[8],y=x*c-d*m,g=d*p-x*l,M=m*l-c*p,E=t*y+r*g+o*M;if(E===0)return this.set(0,0,0,0,0,0,0,0,0);const R=1/E;return e[0]=y*R,e[1]=(o*m-x*r)*R,e[2]=(d*r-o*c)*R,e[3]=g*R,e[4]=(x*t-o*p)*R,e[5]=(o*l-d*t)*R,e[6]=M*R,e[7]=(r*p-m*t)*R,e[8]=(c*t-r*l)*R,this}transpose(){let e;const t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,r,o,l,c,d){const p=Math.cos(l),m=Math.sin(l);return this.set(r*p,r*m,-r*(p*c+m*d)+c+e,-o*m,o*p,-o*(-m*c+p*d)+d+t,0,0,1),this}scale(e,t){return la("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(of.makeScale(e,t)),this}rotate(e){return la("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(of.makeRotation(-e)),this}translate(e,t){return la("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(of.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){const t=Math.cos(e),r=Math.sin(e);return this.set(t,-r,0,r,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){const t=this.elements,r=e.elements;for(let o=0;o<9;o++)if(t[o]!==r[o])return!1;return!0}fromArray(e,t=0){for(let r=0;r<9;r++)this.elements[r]=e[r+t];return this}toArray(e=[],t=0){const r=this.elements;return e[t]=r[0],e[t+1]=r[1],e[t+2]=r[2],e[t+3]=r[3],e[t+4]=r[4],e[t+5]=r[5],e[t+6]=r[6],e[t+7]=r[7],e[t+8]=r[8],e}clone(){return new this.constructor().fromArray(this.elements)}};nh.prototype.isMatrix3=!0;let ut=nh;const of=new ut,Fm=new ut().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Om=new ut().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function jv(){const s={enabled:!0,workingColorSpace:lu,spaces:{},convert:function(o,l,c){return this.enabled===!1||l===c||!l||!c||(this.spaces[l].transfer===Lt&&(o.r=ir(o.r),o.g=ir(o.g),o.b=ir(o.b)),this.spaces[l].primaries!==this.spaces[c].primaries&&(o.applyMatrix3(this.spaces[l].toXYZ),o.applyMatrix3(this.spaces[c].fromXYZ)),this.spaces[c].transfer===Lt&&(o.r=ua(o.r),o.g=ua(o.g),o.b=ua(o.b))),o},workingToColorSpace:function(o,l){return this.convert(o,this.workingColorSpace,l)},colorSpaceToWorking:function(o,l){return this.convert(o,l,this.workingColorSpace)},getPrimaries:function(o){return this.spaces[o].primaries},getTransfer:function(o){return o===Dr?uu:this.spaces[o].transfer},getToneMappingMode:function(o){return this.spaces[o].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(o,l=this.workingColorSpace){return o.fromArray(this.spaces[l].luminanceCoefficients)},define:function(o){Object.assign(this.spaces,o)},_getMatrix:function(o,l,c){return o.copy(this.spaces[l].toXYZ).multiply(this.spaces[c].fromXYZ)},_getDrawingBufferColorSpace:function(o){return this.spaces[o].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(o=this.workingColorSpace){return this.spaces[o].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(o,l){return la("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),s.workingToColorSpace(o,l)},toWorkingColorSpace:function(o,l){return la("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),s.colorSpaceToWorking(o,l)}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],r=[.3127,.329];return s.define({[lu]:{primaries:e,whitePoint:r,transfer:uu,toXYZ:Fm,fromXYZ:Om,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:Fn},outputColorSpaceConfig:{drawingBufferColorSpace:Fn}},[Fn]:{primaries:e,whitePoint:r,transfer:Lt,toXYZ:Fm,fromXYZ:Om,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:Fn}}}),s}const vt=jv();function ir(s){return s<.04045?s*.0773993808:Math.pow(s*.9478672986+.0521327014,2.4)}function ua(s){return s<.0031308?s*12.92:1.055*Math.pow(s,.41666)-.055}let ks;class ex{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let r;if(e instanceof HTMLCanvasElement)r=e;else{ks===void 0&&(ks=ho("canvas")),ks.width=e.width,ks.height=e.height;const o=ks.getContext("2d");e instanceof ImageData?o.putImageData(e,0,0):o.drawImage(e,0,0,e.width,e.height),r=ks}return r.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const t=ho("canvas");t.width=e.width,t.height=e.height;const r=t.getContext("2d");r.drawImage(e,0,0,e.width,e.height);const o=r.getImageData(0,0,e.width,e.height),l=o.data;for(let c=0;c<l.length;c++)l[c]=ir(l[c]/255)*255;return r.putImageData(o,0,0),t}else if(e.data){const t=e.data.slice(0);for(let r=0;r<t.length;r++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[r]=Math.floor(ir(t[r]/255)*255):t[r]=ir(t[r]);return{data:t,width:e.width,height:e.height}}else return rt("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}let tx=0;class Wd{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:tx++}),this.uuid=Ir(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){const t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):typeof VideoFrame<"u"&&t instanceof VideoFrame?e.set(t.displayWidth,t.displayHeight,0):t!==null?e.set(t.width,t.height,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const r={uuid:this.uuid,url:""},o=this.data;if(o!==null){let l;if(Array.isArray(o)){l=[];for(let c=0,d=o.length;c<d;c++)o[c].isDataTexture?l.push(lf(o[c].image)):l.push(lf(o[c]))}else l=lf(o);r.url=l}return t||(e.images[this.uuid]=r),r}}function lf(s){return typeof HTMLImageElement<"u"&&s instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&s instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&s instanceof ImageBitmap?ex.getDataURL(s):s.data?{data:Array.from(s.data),width:s.width,height:s.height,type:s.data.constructor.name}:(rt("Texture: Unable to serialize Texture."),{})}let nx=0;const uf=new H;class Sn extends Br{constructor(e=Sn.DEFAULT_IMAGE,t=Sn.DEFAULT_MAPPING,r=tr,o=tr,l=Pn,c=cs,d=Ei,p=ei,m=Sn.DEFAULT_ANISOTROPY,x=Dr){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:nx++}),this.uuid=Ir(),this.name="",this.source=new Wd(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=r,this.wrapT=o,this.magFilter=l,this.minFilter=c,this.anisotropy=m,this.format=d,this.internalFormat=null,this.type=p,this.offset=new Qe(0,0),this.repeat=new Qe(1,1),this.center=new Qe(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new ut,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=x,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(uf).x}get height(){return this.source.getSize(uf).y}get depth(){return this.source.getSize(uf).z}get image(){return this.source.data}set image(e){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.normalized=e.normalized,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(const t in e){const r=e[t];if(r===void 0){rt(`Texture.setValues(): parameter '${t}' has value of undefined.`);continue}const o=this[t];if(o===void 0){rt(`Texture.setValues(): property '${t}' does not exist.`);continue}o&&r&&o.isVector2&&r.isVector2||o&&r&&o.isVector3&&r.isVector3||o&&r&&o.isMatrix3&&r.isMatrix3?o.copy(r):this[t]=r}}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const r={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(r.userData=this.userData),t||(e.textures[this.uuid]=r),r}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==Zg)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case Zf:e.x=e.x-Math.floor(e.x);break;case tr:e.x=e.x<0?0:1;break;case Qf:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case Zf:e.y=e.y-Math.floor(e.y);break;case tr:e.y=e.y<0?0:1;break;case Qf:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}}Sn.DEFAULT_IMAGE=null;Sn.DEFAULT_MAPPING=Zg;Sn.DEFAULT_ANISOTROPY=1;const ih=class ih{constructor(e=0,t=0,r=0,o=1){this.x=e,this.y=t,this.z=r,this.w=o}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,r,o){return this.x=e,this.y=t,this.z=r,this.w=o,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("THREE.Vector4: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const t=this.x,r=this.y,o=this.z,l=this.w,c=e.elements;return this.x=c[0]*t+c[4]*r+c[8]*o+c[12]*l,this.y=c[1]*t+c[5]*r+c[9]*o+c[13]*l,this.z=c[2]*t+c[6]*r+c[10]*o+c[14]*l,this.w=c[3]*t+c[7]*r+c[11]*o+c[15]*l,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,r,o,l;const p=e.elements,m=p[0],x=p[4],y=p[8],g=p[1],M=p[5],E=p[9],R=p[2],v=p[6],_=p[10];if(Math.abs(x-g)<.01&&Math.abs(y-R)<.01&&Math.abs(E-v)<.01){if(Math.abs(x+g)<.1&&Math.abs(y+R)<.1&&Math.abs(E+v)<.1&&Math.abs(m+M+_-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;const N=(m+1)/2,C=(M+1)/2,I=(_+1)/2,P=(x+g)/4,O=(y+R)/4,T=(E+v)/4;return N>C&&N>I?N<.01?(r=0,o=.707106781,l=.707106781):(r=Math.sqrt(N),o=P/r,l=O/r):C>I?C<.01?(r=.707106781,o=0,l=.707106781):(o=Math.sqrt(C),r=P/o,l=T/o):I<.01?(r=.707106781,o=.707106781,l=0):(l=Math.sqrt(I),r=O/l,o=T/l),this.set(r,o,l,t),this}let b=Math.sqrt((v-E)*(v-E)+(y-R)*(y-R)+(g-x)*(g-x));return Math.abs(b)<.001&&(b=1),this.x=(v-E)/b,this.y=(y-R)/b,this.z=(g-x)/b,this.w=Math.acos((m+M+_-1)/2),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=gt(this.x,e.x,t.x),this.y=gt(this.y,e.y,t.y),this.z=gt(this.z,e.z,t.z),this.w=gt(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=gt(this.x,e,t),this.y=gt(this.y,e,t),this.z=gt(this.z,e,t),this.w=gt(this.w,e,t),this}clampLength(e,t){const r=this.length();return this.divideScalar(r||1).multiplyScalar(gt(r,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,r){return this.x=e.x+(t.x-e.x)*r,this.y=e.y+(t.y-e.y)*r,this.z=e.z+(t.z-e.z)*r,this.w=e.w+(t.w-e.w)*r,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}};ih.prototype.isVector4=!0;let Zt=ih;class ix extends Br{constructor(e=1,t=1,r={}){super(),r=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Pn,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},r),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=r.depth,this.scissor=new Zt(0,0,e,t),this.scissorTest=!1,this.viewport=new Zt(0,0,e,t),this.textures=[];const o={width:e,height:t,depth:r.depth},l=new Sn(o),c=r.count;for(let d=0;d<c;d++)this.textures[d]=l.clone(),this.textures[d].isRenderTargetTexture=!0,this.textures[d].renderTarget=this;this._setTextureOptions(r),this.depthBuffer=r.depthBuffer,this.stencilBuffer=r.stencilBuffer,this.resolveDepthBuffer=r.resolveDepthBuffer,this.resolveStencilBuffer=r.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=r.depthTexture,this.samples=r.samples,this.multiview=r.multiview,this.useArrayDepthTexture=r.useArrayDepthTexture}_setTextureOptions(e={}){const t={minFilter:Pn,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let r=0;r<this.textures.length;r++)this.textures[r].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&(this._depthTexture.renderTarget=null),e!==null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,r=1){if(this.width!==e||this.height!==t||this.depth!==r){this.width=e,this.height=t,this.depth=r;for(let o=0,l=this.textures.length;o<l;o++)this.textures[o].image.width=e,this.textures[o].image.height=t,this.textures[o].image.depth=r,this.textures[o].isData3DTexture!==!0&&(this.textures[o].isArrayTexture=this.textures[o].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,r=e.textures.length;t<r;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;const o=Object.assign({},e.textures[t].image);this.textures[t].source=new Wd(o)}return this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this.multiview=e.multiview,this.useArrayDepthTexture=e.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}}class Bi extends ix{constructor(e=1,t=1,r={}){super(e,t,r),this.isWebGLRenderTarget=!0}}class s_ extends Sn{constructor(e=null,t=1,r=1,o=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:r,depth:o},this.magFilter=yn,this.minFilter=yn,this.wrapR=tr,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}}class rx extends Sn{constructor(e=null,t=1,r=1,o=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:r,depth:o},this.magFilter=yn,this.minFilter=yn,this.wrapR=tr,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}const pu=class pu{constructor(e,t,r,o,l,c,d,p,m,x,y,g,M,E,R,v){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,r,o,l,c,d,p,m,x,y,g,M,E,R,v)}set(e,t,r,o,l,c,d,p,m,x,y,g,M,E,R,v){const _=this.elements;return _[0]=e,_[4]=t,_[8]=r,_[12]=o,_[1]=l,_[5]=c,_[9]=d,_[13]=p,_[2]=m,_[6]=x,_[10]=y,_[14]=g,_[3]=M,_[7]=E,_[11]=R,_[15]=v,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new pu().fromArray(this.elements)}copy(e){const t=this.elements,r=e.elements;return t[0]=r[0],t[1]=r[1],t[2]=r[2],t[3]=r[3],t[4]=r[4],t[5]=r[5],t[6]=r[6],t[7]=r[7],t[8]=r[8],t[9]=r[9],t[10]=r[10],t[11]=r[11],t[12]=r[12],t[13]=r[13],t[14]=r[14],t[15]=r[15],this}copyPosition(e){const t=this.elements,r=e.elements;return t[12]=r[12],t[13]=r[13],t[14]=r[14],this}setFromMatrix3(e){const t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,r){return this.determinantAffine()===0?(e.set(1,0,0),t.set(0,1,0),r.set(0,0,1),this):(e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),r.setFromMatrixColumn(this,2),this)}makeBasis(e,t,r){return this.set(e.x,t.x,r.x,0,e.y,t.y,r.y,0,e.z,t.z,r.z,0,0,0,0,1),this}extractRotation(e){if(e.determinantAffine()===0)return this.identity();const t=this.elements,r=e.elements,o=1/zs.setFromMatrixColumn(e,0).length(),l=1/zs.setFromMatrixColumn(e,1).length(),c=1/zs.setFromMatrixColumn(e,2).length();return t[0]=r[0]*o,t[1]=r[1]*o,t[2]=r[2]*o,t[3]=0,t[4]=r[4]*l,t[5]=r[5]*l,t[6]=r[6]*l,t[7]=0,t[8]=r[8]*c,t[9]=r[9]*c,t[10]=r[10]*c,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){const t=this.elements,r=e.x,o=e.y,l=e.z,c=Math.cos(r),d=Math.sin(r),p=Math.cos(o),m=Math.sin(o),x=Math.cos(l),y=Math.sin(l);if(e.order==="XYZ"){const g=c*x,M=c*y,E=d*x,R=d*y;t[0]=p*x,t[4]=-p*y,t[8]=m,t[1]=M+E*m,t[5]=g-R*m,t[9]=-d*p,t[2]=R-g*m,t[6]=E+M*m,t[10]=c*p}else if(e.order==="YXZ"){const g=p*x,M=p*y,E=m*x,R=m*y;t[0]=g+R*d,t[4]=E*d-M,t[8]=c*m,t[1]=c*y,t[5]=c*x,t[9]=-d,t[2]=M*d-E,t[6]=R+g*d,t[10]=c*p}else if(e.order==="ZXY"){const g=p*x,M=p*y,E=m*x,R=m*y;t[0]=g-R*d,t[4]=-c*y,t[8]=E+M*d,t[1]=M+E*d,t[5]=c*x,t[9]=R-g*d,t[2]=-c*m,t[6]=d,t[10]=c*p}else if(e.order==="ZYX"){const g=c*x,M=c*y,E=d*x,R=d*y;t[0]=p*x,t[4]=E*m-M,t[8]=g*m+R,t[1]=p*y,t[5]=R*m+g,t[9]=M*m-E,t[2]=-m,t[6]=d*p,t[10]=c*p}else if(e.order==="YZX"){const g=c*p,M=c*m,E=d*p,R=d*m;t[0]=p*x,t[4]=R-g*y,t[8]=E*y+M,t[1]=y,t[5]=c*x,t[9]=-d*x,t[2]=-m*x,t[6]=M*y+E,t[10]=g-R*y}else if(e.order==="XZY"){const g=c*p,M=c*m,E=d*p,R=d*m;t[0]=p*x,t[4]=-y,t[8]=m*x,t[1]=g*y+R,t[5]=c*x,t[9]=M*y-E,t[2]=E*y-M,t[6]=d*x,t[10]=R*y+g}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(sx,e,ax)}lookAt(e,t,r){const o=this.elements;return Jn.subVectors(e,t),Jn.lengthSq()===0&&(Jn.z=1),Jn.normalize(),wr.crossVectors(r,Jn),wr.lengthSq()===0&&(Math.abs(r.z)===1?Jn.x+=1e-4:Jn.z+=1e-4,Jn.normalize(),wr.crossVectors(r,Jn)),wr.normalize(),El.crossVectors(Jn,wr),o[0]=wr.x,o[4]=El.x,o[8]=Jn.x,o[1]=wr.y,o[5]=El.y,o[9]=Jn.y,o[2]=wr.z,o[6]=El.z,o[10]=Jn.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const r=e.elements,o=t.elements,l=this.elements,c=r[0],d=r[4],p=r[8],m=r[12],x=r[1],y=r[5],g=r[9],M=r[13],E=r[2],R=r[6],v=r[10],_=r[14],b=r[3],N=r[7],C=r[11],I=r[15],P=o[0],O=o[4],T=o[8],D=o[12],z=o[1],k=o[5],K=o[9],ce=o[13],me=o[2],Q=o[6],ue=o[10],$=o[14],Y=o[3],ae=o[7],oe=o[11],F=o[15];return l[0]=c*P+d*z+p*me+m*Y,l[4]=c*O+d*k+p*Q+m*ae,l[8]=c*T+d*K+p*ue+m*oe,l[12]=c*D+d*ce+p*$+m*F,l[1]=x*P+y*z+g*me+M*Y,l[5]=x*O+y*k+g*Q+M*ae,l[9]=x*T+y*K+g*ue+M*oe,l[13]=x*D+y*ce+g*$+M*F,l[2]=E*P+R*z+v*me+_*Y,l[6]=E*O+R*k+v*Q+_*ae,l[10]=E*T+R*K+v*ue+_*oe,l[14]=E*D+R*ce+v*$+_*F,l[3]=b*P+N*z+C*me+I*Y,l[7]=b*O+N*k+C*Q+I*ae,l[11]=b*T+N*K+C*ue+I*oe,l[15]=b*D+N*ce+C*$+I*F,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){const e=this.elements,t=e[0],r=e[4],o=e[8],l=e[12],c=e[1],d=e[5],p=e[9],m=e[13],x=e[2],y=e[6],g=e[10],M=e[14],E=e[3],R=e[7],v=e[11],_=e[15],b=p*M-m*g,N=d*M-m*y,C=d*g-p*y,I=c*M-m*x,P=c*g-p*x,O=c*y-d*x;return t*(R*b-v*N+_*C)-r*(E*b-v*I+_*P)+o*(E*N-R*I+_*O)-l*(E*C-R*P+v*O)}determinantAffine(){const e=this.elements,t=e[0],r=e[4],o=e[8],l=e[1],c=e[5],d=e[9],p=e[2],m=e[6],x=e[10];return t*(c*x-d*m)-r*(l*x-d*p)+o*(l*m-c*p)}transpose(){const e=this.elements;let t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,r){const o=this.elements;return e.isVector3?(o[12]=e.x,o[13]=e.y,o[14]=e.z):(o[12]=e,o[13]=t,o[14]=r),this}invert(){const e=this.elements,t=e[0],r=e[1],o=e[2],l=e[3],c=e[4],d=e[5],p=e[6],m=e[7],x=e[8],y=e[9],g=e[10],M=e[11],E=e[12],R=e[13],v=e[14],_=e[15],b=t*d-r*c,N=t*p-o*c,C=t*m-l*c,I=r*p-o*d,P=r*m-l*d,O=o*m-l*p,T=x*R-y*E,D=x*v-g*E,z=x*_-M*E,k=y*v-g*R,K=y*_-M*R,ce=g*_-M*v,me=b*ce-N*K+C*k+I*z-P*D+O*T;if(me===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const Q=1/me;return e[0]=(d*ce-p*K+m*k)*Q,e[1]=(o*K-r*ce-l*k)*Q,e[2]=(R*O-v*P+_*I)*Q,e[3]=(g*P-y*O-M*I)*Q,e[4]=(p*z-c*ce-m*D)*Q,e[5]=(t*ce-o*z+l*D)*Q,e[6]=(v*C-E*O-_*N)*Q,e[7]=(x*O-g*C+M*N)*Q,e[8]=(c*K-d*z+m*T)*Q,e[9]=(r*z-t*K-l*T)*Q,e[10]=(E*P-R*C+_*b)*Q,e[11]=(y*C-x*P-M*b)*Q,e[12]=(d*D-c*k-p*T)*Q,e[13]=(t*k-r*D+o*T)*Q,e[14]=(R*N-E*I-v*b)*Q,e[15]=(x*I-y*N+g*b)*Q,this}scale(e){const t=this.elements,r=e.x,o=e.y,l=e.z;return t[0]*=r,t[4]*=o,t[8]*=l,t[1]*=r,t[5]*=o,t[9]*=l,t[2]*=r,t[6]*=o,t[10]*=l,t[3]*=r,t[7]*=o,t[11]*=l,this}getMaxScaleOnAxis(){const e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],r=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],o=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,r,o))}makeTranslation(e,t,r){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,r,0,0,0,1),this}makeRotationX(e){const t=Math.cos(e),r=Math.sin(e);return this.set(1,0,0,0,0,t,-r,0,0,r,t,0,0,0,0,1),this}makeRotationY(e){const t=Math.cos(e),r=Math.sin(e);return this.set(t,0,r,0,0,1,0,0,-r,0,t,0,0,0,0,1),this}makeRotationZ(e){const t=Math.cos(e),r=Math.sin(e);return this.set(t,-r,0,0,r,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){const r=Math.cos(t),o=Math.sin(t),l=1-r,c=e.x,d=e.y,p=e.z,m=l*c,x=l*d;return this.set(m*c+r,m*d-o*p,m*p+o*d,0,m*d+o*p,x*d+r,x*p-o*c,0,m*p-o*d,x*p+o*c,l*p*p+r,0,0,0,0,1),this}makeScale(e,t,r){return this.set(e,0,0,0,0,t,0,0,0,0,r,0,0,0,0,1),this}makeShear(e,t,r,o,l,c){return this.set(1,r,l,0,e,1,c,0,t,o,1,0,0,0,0,1),this}compose(e,t,r){const o=this.elements,l=t._x,c=t._y,d=t._z,p=t._w,m=l+l,x=c+c,y=d+d,g=l*m,M=l*x,E=l*y,R=c*x,v=c*y,_=d*y,b=p*m,N=p*x,C=p*y,I=r.x,P=r.y,O=r.z;return o[0]=(1-(R+_))*I,o[1]=(M+C)*I,o[2]=(E-N)*I,o[3]=0,o[4]=(M-C)*P,o[5]=(1-(g+_))*P,o[6]=(v+b)*P,o[7]=0,o[8]=(E+N)*O,o[9]=(v-b)*O,o[10]=(1-(g+R))*O,o[11]=0,o[12]=e.x,o[13]=e.y,o[14]=e.z,o[15]=1,this}decompose(e,t,r){const o=this.elements;e.x=o[12],e.y=o[13],e.z=o[14];const l=this.determinantAffine();if(l===0)return r.set(1,1,1),t.identity(),this;let c=zs.set(o[0],o[1],o[2]).length();const d=zs.set(o[4],o[5],o[6]).length(),p=zs.set(o[8],o[9],o[10]).length();l<0&&(c=-c),yi.copy(this);const m=1/c,x=1/d,y=1/p;return yi.elements[0]*=m,yi.elements[1]*=m,yi.elements[2]*=m,yi.elements[4]*=x,yi.elements[5]*=x,yi.elements[6]*=x,yi.elements[8]*=y,yi.elements[9]*=y,yi.elements[10]*=y,t.setFromRotationMatrix(yi),r.x=c,r.y=d,r.z=p,this}makePerspective(e,t,r,o,l,c,d=Fi,p=!1){const m=this.elements,x=2*l/(t-e),y=2*l/(r-o),g=(t+e)/(t-e),M=(r+o)/(r-o);let E,R;if(p)E=l/(c-l),R=c*l/(c-l);else if(d===Fi)E=-(c+l)/(c-l),R=-2*c*l/(c-l);else if(d===fo)E=-c/(c-l),R=-c*l/(c-l);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+d);return m[0]=x,m[4]=0,m[8]=g,m[12]=0,m[1]=0,m[5]=y,m[9]=M,m[13]=0,m[2]=0,m[6]=0,m[10]=E,m[14]=R,m[3]=0,m[7]=0,m[11]=-1,m[15]=0,this}makeOrthographic(e,t,r,o,l,c,d=Fi,p=!1){const m=this.elements,x=2/(t-e),y=2/(r-o),g=-(t+e)/(t-e),M=-(r+o)/(r-o);let E,R;if(p)E=1/(c-l),R=c/(c-l);else if(d===Fi)E=-2/(c-l),R=-(c+l)/(c-l);else if(d===fo)E=-1/(c-l),R=-l/(c-l);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+d);return m[0]=x,m[4]=0,m[8]=0,m[12]=g,m[1]=0,m[5]=y,m[9]=0,m[13]=M,m[2]=0,m[6]=0,m[10]=E,m[14]=R,m[3]=0,m[7]=0,m[11]=0,m[15]=1,this}equals(e){const t=this.elements,r=e.elements;for(let o=0;o<16;o++)if(t[o]!==r[o])return!1;return!0}fromArray(e,t=0){for(let r=0;r<16;r++)this.elements[r]=e[r+t];return this}toArray(e=[],t=0){const r=this.elements;return e[t]=r[0],e[t+1]=r[1],e[t+2]=r[2],e[t+3]=r[3],e[t+4]=r[4],e[t+5]=r[5],e[t+6]=r[6],e[t+7]=r[7],e[t+8]=r[8],e[t+9]=r[9],e[t+10]=r[10],e[t+11]=r[11],e[t+12]=r[12],e[t+13]=r[13],e[t+14]=r[14],e[t+15]=r[15],e}};pu.prototype.isMatrix4=!0;let Ut=pu;const zs=new H,yi=new Ut,sx=new H(0,0,0),ax=new H(1,1,1),wr=new H,El=new H,Jn=new H,Bm=new Ut,km=new Fr;class Or{constructor(e=0,t=0,r=0,o=Or.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=r,this._order=o}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,r,o=this._order){return this._x=e,this._y=t,this._z=r,this._order=o,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,r=!0){const o=e.elements,l=o[0],c=o[4],d=o[8],p=o[1],m=o[5],x=o[9],y=o[2],g=o[6],M=o[10];switch(t){case"XYZ":this._y=Math.asin(gt(d,-1,1)),Math.abs(d)<.9999999?(this._x=Math.atan2(-x,M),this._z=Math.atan2(-c,l)):(this._x=Math.atan2(g,m),this._z=0);break;case"YXZ":this._x=Math.asin(-gt(x,-1,1)),Math.abs(x)<.9999999?(this._y=Math.atan2(d,M),this._z=Math.atan2(p,m)):(this._y=Math.atan2(-y,l),this._z=0);break;case"ZXY":this._x=Math.asin(gt(g,-1,1)),Math.abs(g)<.9999999?(this._y=Math.atan2(-y,M),this._z=Math.atan2(-c,m)):(this._y=0,this._z=Math.atan2(p,l));break;case"ZYX":this._y=Math.asin(-gt(y,-1,1)),Math.abs(y)<.9999999?(this._x=Math.atan2(g,M),this._z=Math.atan2(p,l)):(this._x=0,this._z=Math.atan2(-c,m));break;case"YZX":this._z=Math.asin(gt(p,-1,1)),Math.abs(p)<.9999999?(this._x=Math.atan2(-x,m),this._y=Math.atan2(-y,l)):(this._x=0,this._y=Math.atan2(d,M));break;case"XZY":this._z=Math.asin(-gt(c,-1,1)),Math.abs(c)<.9999999?(this._x=Math.atan2(g,m),this._y=Math.atan2(d,l)):(this._x=Math.atan2(-x,M),this._y=0);break;default:rt("Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,r===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,r){return Bm.makeRotationFromQuaternion(e),this.setFromRotationMatrix(Bm,t,r)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return km.setFromEuler(this),this.setFromQuaternion(km,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}Or.DEFAULT_ORDER="XYZ";class a_{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let ox=0;const zm=new H,Vs=new Fr,Zi=new Ut,Tl=new H,Qa=new H,lx=new H,ux=new Fr,Vm=new H(1,0,0),Hm=new H(0,1,0),Gm=new H(0,0,1),Wm={type:"added"},cx={type:"removed"},Hs={type:"childadded",child:null},cf={type:"childremoved",child:null};class tn extends Br{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:ox++}),this.uuid=Ir(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=tn.DEFAULT_UP.clone();const e=new H,t=new Or,r=new Fr,o=new H(1,1,1);function l(){r.setFromEuler(t,!1)}function c(){t.setFromQuaternion(r,void 0,!1)}t._onChange(l),r._onChange(c),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:r},scale:{configurable:!0,enumerable:!0,value:o},modelViewMatrix:{value:new Ut},normalMatrix:{value:new ut}}),this.matrix=new Ut,this.matrixWorld=new Ut,this.matrixAutoUpdate=tn.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=tn.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new a_,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return Vs.setFromAxisAngle(e,t),this.quaternion.multiply(Vs),this}rotateOnWorldAxis(e,t){return Vs.setFromAxisAngle(e,t),this.quaternion.premultiply(Vs),this}rotateX(e){return this.rotateOnAxis(Vm,e)}rotateY(e){return this.rotateOnAxis(Hm,e)}rotateZ(e){return this.rotateOnAxis(Gm,e)}translateOnAxis(e,t){return zm.copy(e).applyQuaternion(this.quaternion),this.position.add(zm.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(Vm,e)}translateY(e){return this.translateOnAxis(Hm,e)}translateZ(e){return this.translateOnAxis(Gm,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(Zi.copy(this.matrixWorld).invert())}lookAt(e,t,r){e.isVector3?Tl.copy(e):Tl.set(e,t,r);const o=this.parent;this.updateWorldMatrix(!0,!1),Qa.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Zi.lookAt(Qa,Tl,this.up):Zi.lookAt(Tl,Qa,this.up),this.quaternion.setFromRotationMatrix(Zi),o&&(Zi.extractRotation(o.matrixWorld),Vs.setFromRotationMatrix(Zi),this.quaternion.premultiply(Vs.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(St("Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(Wm),Hs.child=e,this.dispatchEvent(Hs),Hs.child=null):St("Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let r=0;r<arguments.length;r++)this.remove(arguments[r]);return this}const t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(cx),cf.child=e,this.dispatchEvent(cf),cf.child=null),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),Zi.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),Zi.multiply(e.parent.matrixWorld)),e.applyMatrix4(Zi),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(Wm),Hs.child=e,this.dispatchEvent(Hs),Hs.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let r=0,o=this.children.length;r<o;r++){const c=this.children[r].getObjectByProperty(e,t);if(c!==void 0)return c}}getObjectsByProperty(e,t,r=[]){this[e]===t&&r.push(this);const o=this.children;for(let l=0,c=o.length;l<c;l++)o[l].getObjectsByProperty(e,t,r);return r}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Qa,e,lx),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Qa,ux,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);const t=this.children;for(let r=0,o=t.length;r<o;r++)t[r].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const t=this.children;for(let r=0,o=t.length;r<o;r++)t[r].traverseVisible(e)}traverseAncestors(e){const t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);const e=this.pivot;if(e!==null){const t=e.x,r=e.y,o=e.z,l=this.matrix.elements;l[12]+=t-l[0]*t-l[4]*r-l[8]*o,l[13]+=r-l[1]*t-l[5]*r-l[9]*o,l[14]+=o-l[2]*t-l[6]*r-l[10]*o}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);const t=this.children;for(let r=0,o=t.length;r<o;r++)t[r].updateMatrixWorld(e)}updateWorldMatrix(e,t,r=!1){const o=this.parent;if(e===!0&&o!==null&&o.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||r)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,r=!0),t===!0){const l=this.children;for(let c=0,d=l.length;c<d;c++)l[c].updateWorldMatrix(!1,!0,r)}}toJSON(e){const t=e===void 0||typeof e=="string",r={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},r.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});const o={};o.uuid=this.uuid,o.type=this.type,this.name!==""&&(o.name=this.name),this.castShadow===!0&&(o.castShadow=!0),this.receiveShadow===!0&&(o.receiveShadow=!0),this.visible===!1&&(o.visible=!1),this.frustumCulled===!1&&(o.frustumCulled=!1),this.renderOrder!==0&&(o.renderOrder=this.renderOrder),this.static!==!1&&(o.static=this.static),Object.keys(this.userData).length>0&&(o.userData=this.userData),o.layers=this.layers.mask,o.matrix=this.matrix.toArray(),o.up=this.up.toArray(),this.pivot!==null&&(o.pivot=this.pivot.toArray()),this.matrixAutoUpdate===!1&&(o.matrixAutoUpdate=!1),this.morphTargetDictionary!==void 0&&(o.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(o.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(o.type="InstancedMesh",o.count=this.count,o.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(o.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(o.type="BatchedMesh",o.perObjectFrustumCulled=this.perObjectFrustumCulled,o.sortObjects=this.sortObjects,o.drawRanges=this._drawRanges,o.reservedRanges=this._reservedRanges,o.geometryInfo=this._geometryInfo.map(d=>({...d,boundingBox:d.boundingBox?d.boundingBox.toJSON():void 0,boundingSphere:d.boundingSphere?d.boundingSphere.toJSON():void 0})),o.instanceInfo=this._instanceInfo.map(d=>({...d})),o.availableInstanceIds=this._availableInstanceIds.slice(),o.availableGeometryIds=this._availableGeometryIds.slice(),o.nextIndexStart=this._nextIndexStart,o.nextVertexStart=this._nextVertexStart,o.geometryCount=this._geometryCount,o.maxInstanceCount=this._maxInstanceCount,o.maxVertexCount=this._maxVertexCount,o.maxIndexCount=this._maxIndexCount,o.geometryInitialized=this._geometryInitialized,o.matricesTexture=this._matricesTexture.toJSON(e),o.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(o.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(o.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(o.boundingBox=this.boundingBox.toJSON()));function l(d,p){return d[p.uuid]===void 0&&(d[p.uuid]=p.toJSON(e)),p.uuid}if(this.isScene)this.background&&(this.background.isColor?o.background=this.background.toJSON():this.background.isTexture&&(o.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(o.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){o.geometry=l(e.geometries,this.geometry);const d=this.geometry.parameters;if(d!==void 0&&d.shapes!==void 0){const p=d.shapes;if(Array.isArray(p))for(let m=0,x=p.length;m<x;m++){const y=p[m];l(e.shapes,y)}else l(e.shapes,p)}}if(this.isSkinnedMesh&&(o.bindMode=this.bindMode,o.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(l(e.skeletons,this.skeleton),o.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const d=[];for(let p=0,m=this.material.length;p<m;p++)d.push(l(e.materials,this.material[p]));o.material=d}else o.material=l(e.materials,this.material);if(this.children.length>0){o.children=[];for(let d=0;d<this.children.length;d++)o.children.push(this.children[d].toJSON(e).object)}if(this.animations.length>0){o.animations=[];for(let d=0;d<this.animations.length;d++){const p=this.animations[d];o.animations.push(l(e.animations,p))}}if(t){const d=c(e.geometries),p=c(e.materials),m=c(e.textures),x=c(e.images),y=c(e.shapes),g=c(e.skeletons),M=c(e.animations),E=c(e.nodes);d.length>0&&(r.geometries=d),p.length>0&&(r.materials=p),m.length>0&&(r.textures=m),x.length>0&&(r.images=x),y.length>0&&(r.shapes=y),g.length>0&&(r.skeletons=g),M.length>0&&(r.animations=M),E.length>0&&(r.nodes=E)}return r.object=o,r;function c(d){const p=[];for(const m in d){const x=d[m];delete x.metadata,p.push(x)}return p}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.pivot=e.pivot!==null?e.pivot.clone():null,this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.static=e.static,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let r=0;r<e.children.length;r++){const o=e.children[r];this.add(o.clone())}return this}}tn.DEFAULT_UP=new H(0,1,0);tn.DEFAULT_MATRIX_AUTO_UPDATE=!0;tn.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;class sa extends tn{constructor(){super(),this.isGroup=!0,this.type="Group"}}const fx={type:"move"};class ff{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new sa,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new sa,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new H,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new H),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new sa,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new H,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new H,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const t=this._hand;if(t)for(const r of e.hand.values())this._getHandJoint(t,r)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,r){let o=null,l=null,c=null;const d=this._targetRay,p=this._grip,m=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(m&&e.hand){c=!0;for(const R of e.hand.values()){const v=t.getJointPose(R,r),_=this._getHandJoint(m,R);v!==null&&(_.matrix.fromArray(v.transform.matrix),_.matrix.decompose(_.position,_.rotation,_.scale),_.matrixWorldNeedsUpdate=!0,_.jointRadius=v.radius),_.visible=v!==null}const x=m.joints["index-finger-tip"],y=m.joints["thumb-tip"],g=x.position.distanceTo(y.position),M=.02,E=.005;m.inputState.pinching&&g>M+E?(m.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!m.inputState.pinching&&g<=M-E&&(m.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else p!==null&&e.gripSpace&&(l=t.getPose(e.gripSpace,r),l!==null&&(p.matrix.fromArray(l.transform.matrix),p.matrix.decompose(p.position,p.rotation,p.scale),p.matrixWorldNeedsUpdate=!0,l.linearVelocity?(p.hasLinearVelocity=!0,p.linearVelocity.copy(l.linearVelocity)):p.hasLinearVelocity=!1,l.angularVelocity?(p.hasAngularVelocity=!0,p.angularVelocity.copy(l.angularVelocity)):p.hasAngularVelocity=!1,p.eventsEnabled&&p.dispatchEvent({type:"gripUpdated",data:e,target:this})));d!==null&&(o=t.getPose(e.targetRaySpace,r),o===null&&l!==null&&(o=l),o!==null&&(d.matrix.fromArray(o.transform.matrix),d.matrix.decompose(d.position,d.rotation,d.scale),d.matrixWorldNeedsUpdate=!0,o.linearVelocity?(d.hasLinearVelocity=!0,d.linearVelocity.copy(o.linearVelocity)):d.hasLinearVelocity=!1,o.angularVelocity?(d.hasAngularVelocity=!0,d.angularVelocity.copy(o.angularVelocity)):d.hasAngularVelocity=!1,this.dispatchEvent(fx)))}return d!==null&&(d.visible=o!==null),p!==null&&(p.visible=l!==null),m!==null&&(m.visible=c!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){const r=new sa;r.matrixAutoUpdate=!1,r.visible=!1,e.joints[t.jointName]=r,e.add(r)}return e.joints[t.jointName]}}const o_={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Ar={h:0,s:0,l:0},wl={h:0,s:0,l:0};function df(s,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?s+(e-s)*6*t:t<1/2?e:t<2/3?s+(e-s)*6*(2/3-t):s}class dt{constructor(e,t,r){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,r)}set(e,t,r){if(t===void 0&&r===void 0){const o=e;o&&o.isColor?this.copy(o):typeof o=="number"?this.setHex(o):typeof o=="string"&&this.setStyle(o)}else this.setRGB(e,t,r);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=Fn){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,vt.colorSpaceToWorking(this,t),this}setRGB(e,t,r,o=vt.workingColorSpace){return this.r=e,this.g=t,this.b=r,vt.colorSpaceToWorking(this,o),this}setHSL(e,t,r,o=vt.workingColorSpace){if(e=Qv(e,1),t=gt(t,0,1),r=gt(r,0,1),t===0)this.r=this.g=this.b=r;else{const l=r<=.5?r*(1+t):r+t-r*t,c=2*r-l;this.r=df(c,l,e+1/3),this.g=df(c,l,e),this.b=df(c,l,e-1/3)}return vt.colorSpaceToWorking(this,o),this}setStyle(e,t=Fn){function r(l){l!==void 0&&parseFloat(l)<1&&rt("Color: Alpha component of "+e+" will be ignored.")}let o;if(o=/^(\w+)\(([^\)]*)\)/.exec(e)){let l;const c=o[1],d=o[2];switch(c){case"rgb":case"rgba":if(l=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(d))return r(l[4]),this.setRGB(Math.min(255,parseInt(l[1],10))/255,Math.min(255,parseInt(l[2],10))/255,Math.min(255,parseInt(l[3],10))/255,t);if(l=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(d))return r(l[4]),this.setRGB(Math.min(100,parseInt(l[1],10))/100,Math.min(100,parseInt(l[2],10))/100,Math.min(100,parseInt(l[3],10))/100,t);break;case"hsl":case"hsla":if(l=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(d))return r(l[4]),this.setHSL(parseFloat(l[1])/360,parseFloat(l[2])/100,parseFloat(l[3])/100,t);break;default:rt("Color: Unknown color model "+e)}}else if(o=/^\#([A-Fa-f\d]+)$/.exec(e)){const l=o[1],c=l.length;if(c===3)return this.setRGB(parseInt(l.charAt(0),16)/15,parseInt(l.charAt(1),16)/15,parseInt(l.charAt(2),16)/15,t);if(c===6)return this.setHex(parseInt(l,16),t);rt("Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=Fn){const r=o_[e.toLowerCase()];return r!==void 0?this.setHex(r,t):rt("Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=ir(e.r),this.g=ir(e.g),this.b=ir(e.b),this}copyLinearToSRGB(e){return this.r=ua(e.r),this.g=ua(e.g),this.b=ua(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=Fn){return vt.workingToColorSpace(bn.copy(this),e),Math.round(gt(bn.r*255,0,255))*65536+Math.round(gt(bn.g*255,0,255))*256+Math.round(gt(bn.b*255,0,255))}getHexString(e=Fn){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=vt.workingColorSpace){vt.workingToColorSpace(bn.copy(this),t);const r=bn.r,o=bn.g,l=bn.b,c=Math.max(r,o,l),d=Math.min(r,o,l);let p,m;const x=(d+c)/2;if(d===c)p=0,m=0;else{const y=c-d;switch(m=x<=.5?y/(c+d):y/(2-c-d),c){case r:p=(o-l)/y+(o<l?6:0);break;case o:p=(l-r)/y+2;break;case l:p=(r-o)/y+4;break}p/=6}return e.h=p,e.s=m,e.l=x,e}getRGB(e,t=vt.workingColorSpace){return vt.workingToColorSpace(bn.copy(this),t),e.r=bn.r,e.g=bn.g,e.b=bn.b,e}getStyle(e=Fn){vt.workingToColorSpace(bn.copy(this),e);const t=bn.r,r=bn.g,o=bn.b;return e!==Fn?`color(${e} ${t.toFixed(3)} ${r.toFixed(3)} ${o.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(r*255)},${Math.round(o*255)})`}offsetHSL(e,t,r){return this.getHSL(Ar),this.setHSL(Ar.h+e,Ar.s+t,Ar.l+r)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,r){return this.r=e.r+(t.r-e.r)*r,this.g=e.g+(t.g-e.g)*r,this.b=e.b+(t.b-e.b)*r,this}lerpHSL(e,t){this.getHSL(Ar),e.getHSL(wl);const r=sf(Ar.h,wl.h,t),o=sf(Ar.s,wl.s,t),l=sf(Ar.l,wl.l,t);return this.setHSL(r,o,l),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const t=this.r,r=this.g,o=this.b,l=e.elements;return this.r=l[0]*t+l[3]*r+l[6]*o,this.g=l[1]*t+l[4]*r+l[7]*o,this.b=l[2]*t+l[5]*r+l[8]*o,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const bn=new dt;dt.NAMES=o_;class dx extends tn{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Or,this.environmentIntensity=1,this.environmentRotation=new Or,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}}const Si=new H,Qi=new H,hf=new H,Ji=new H,Gs=new H,Ws=new H,Xm=new H,pf=new H,mf=new H,gf=new H,_f=new Zt,vf=new Zt,xf=new Zt;class fi{constructor(e=new H,t=new H,r=new H){this.a=e,this.b=t,this.c=r}static getNormal(e,t,r,o){o.subVectors(r,t),Si.subVectors(e,t),o.cross(Si);const l=o.lengthSq();return l>0?o.multiplyScalar(1/Math.sqrt(l)):o.set(0,0,0)}static getBarycoord(e,t,r,o,l){Si.subVectors(o,t),Qi.subVectors(r,t),hf.subVectors(e,t);const c=Si.dot(Si),d=Si.dot(Qi),p=Si.dot(hf),m=Qi.dot(Qi),x=Qi.dot(hf),y=c*m-d*d;if(y===0)return l.set(0,0,0),null;const g=1/y,M=(m*p-d*x)*g,E=(c*x-d*p)*g;return l.set(1-M-E,E,M)}static containsPoint(e,t,r,o){return this.getBarycoord(e,t,r,o,Ji)===null?!1:Ji.x>=0&&Ji.y>=0&&Ji.x+Ji.y<=1}static getInterpolation(e,t,r,o,l,c,d,p){return this.getBarycoord(e,t,r,o,Ji)===null?(p.x=0,p.y=0,"z"in p&&(p.z=0),"w"in p&&(p.w=0),null):(p.setScalar(0),p.addScaledVector(l,Ji.x),p.addScaledVector(c,Ji.y),p.addScaledVector(d,Ji.z),p)}static getInterpolatedAttribute(e,t,r,o,l,c){return _f.setScalar(0),vf.setScalar(0),xf.setScalar(0),_f.fromBufferAttribute(e,t),vf.fromBufferAttribute(e,r),xf.fromBufferAttribute(e,o),c.setScalar(0),c.addScaledVector(_f,l.x),c.addScaledVector(vf,l.y),c.addScaledVector(xf,l.z),c}static isFrontFacing(e,t,r,o){return Si.subVectors(r,t),Qi.subVectors(e,t),Si.cross(Qi).dot(o)<0}set(e,t,r){return this.a.copy(e),this.b.copy(t),this.c.copy(r),this}setFromPointsAndIndices(e,t,r,o){return this.a.copy(e[t]),this.b.copy(e[r]),this.c.copy(e[o]),this}setFromAttributeAndIndices(e,t,r,o){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,r),this.c.fromBufferAttribute(e,o),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return Si.subVectors(this.c,this.b),Qi.subVectors(this.a,this.b),Si.cross(Qi).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return fi.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return fi.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,r,o,l){return fi.getInterpolation(e,this.a,this.b,this.c,t,r,o,l)}containsPoint(e){return fi.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return fi.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){const r=this.a,o=this.b,l=this.c;let c,d;Gs.subVectors(o,r),Ws.subVectors(l,r),pf.subVectors(e,r);const p=Gs.dot(pf),m=Ws.dot(pf);if(p<=0&&m<=0)return t.copy(r);mf.subVectors(e,o);const x=Gs.dot(mf),y=Ws.dot(mf);if(x>=0&&y<=x)return t.copy(o);const g=p*y-x*m;if(g<=0&&p>=0&&x<=0)return c=p/(p-x),t.copy(r).addScaledVector(Gs,c);gf.subVectors(e,l);const M=Gs.dot(gf),E=Ws.dot(gf);if(E>=0&&M<=E)return t.copy(l);const R=M*m-p*E;if(R<=0&&m>=0&&E<=0)return d=m/(m-E),t.copy(r).addScaledVector(Ws,d);const v=x*E-M*y;if(v<=0&&y-x>=0&&M-E>=0)return Xm.subVectors(l,o),d=(y-x)/(y-x+(M-E)),t.copy(o).addScaledVector(Xm,d);const _=1/(v+R+g);return c=R*_,d=g*_,t.copy(r).addScaledVector(Gs,c).addScaledVector(Ws,d)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}class mo{constructor(e=new H(1/0,1/0,1/0),t=new H(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,r=e.length;t<r;t+=3)this.expandByPoint(Mi.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,r=e.count;t<r;t++)this.expandByPoint(Mi.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,r=e.length;t<r;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){const r=Mi.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(r),this.max.copy(e).add(r),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);const r=e.geometry;if(r!==void 0){const l=r.getAttribute("position");if(t===!0&&l!==void 0&&e.isInstancedMesh!==!0)for(let c=0,d=l.count;c<d;c++)e.isMesh===!0?e.getVertexPosition(c,Mi):Mi.fromBufferAttribute(l,c),Mi.applyMatrix4(e.matrixWorld),this.expandByPoint(Mi);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),Al.copy(e.boundingBox)):(r.boundingBox===null&&r.computeBoundingBox(),Al.copy(r.boundingBox)),Al.applyMatrix4(e.matrixWorld),this.union(Al)}const o=e.children;for(let l=0,c=o.length;l<c;l++)this.expandByObject(o[l],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,Mi),Mi.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,r;return e.normal.x>0?(t=e.normal.x*this.min.x,r=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,r=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,r+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,r+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,r+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,r+=e.normal.z*this.min.z),t<=-e.constant&&r>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(Ja),Rl.subVectors(this.max,Ja),Xs.subVectors(e.a,Ja),Ys.subVectors(e.b,Ja),qs.subVectors(e.c,Ja),Rr.subVectors(Ys,Xs),Cr.subVectors(qs,Ys),rs.subVectors(Xs,qs);let t=[0,-Rr.z,Rr.y,0,-Cr.z,Cr.y,0,-rs.z,rs.y,Rr.z,0,-Rr.x,Cr.z,0,-Cr.x,rs.z,0,-rs.x,-Rr.y,Rr.x,0,-Cr.y,Cr.x,0,-rs.y,rs.x,0];return!yf(t,Xs,Ys,qs,Rl)||(t=[1,0,0,0,1,0,0,0,1],!yf(t,Xs,Ys,qs,Rl))?!1:(Cl.crossVectors(Rr,Cr),t=[Cl.x,Cl.y,Cl.z],yf(t,Xs,Ys,qs,Rl))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,Mi).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(Mi).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(ji[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),ji[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),ji[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),ji[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),ji[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),ji[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),ji[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),ji[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(ji),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}}const ji=[new H,new H,new H,new H,new H,new H,new H,new H],Mi=new H,Al=new mo,Xs=new H,Ys=new H,qs=new H,Rr=new H,Cr=new H,rs=new H,Ja=new H,Rl=new H,Cl=new H,ss=new H;function yf(s,e,t,r,o){for(let l=0,c=s.length-3;l<=c;l+=3){ss.fromArray(s,l);const d=o.x*Math.abs(ss.x)+o.y*Math.abs(ss.y)+o.z*Math.abs(ss.z),p=e.dot(ss),m=t.dot(ss),x=r.dot(ss);if(Math.max(-Math.max(p,m,x),Math.min(p,m,x))>d)return!1}return!0}const sn=new H,bl=new Qe;let hx=0;class Ti extends Br{constructor(e,t,r=!1){if(super(),Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:hx++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=r,this.usage=bd,this.updateRanges=[],this.gpuType=Ui,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,r){e*=this.itemSize,r*=t.itemSize;for(let o=0,l=this.itemSize;o<l;o++)this.array[e+o]=t.array[r+o];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,r=this.count;t<r;t++)bl.fromBufferAttribute(this,t),bl.applyMatrix3(e),this.setXY(t,bl.x,bl.y);else if(this.itemSize===3)for(let t=0,r=this.count;t<r;t++)sn.fromBufferAttribute(this,t),sn.applyMatrix3(e),this.setXYZ(t,sn.x,sn.y,sn.z);return this}applyMatrix4(e){for(let t=0,r=this.count;t<r;t++)sn.fromBufferAttribute(this,t),sn.applyMatrix4(e),this.setXYZ(t,sn.x,sn.y,sn.z);return this}applyNormalMatrix(e){for(let t=0,r=this.count;t<r;t++)sn.fromBufferAttribute(this,t),sn.applyNormalMatrix(e),this.setXYZ(t,sn.x,sn.y,sn.z);return this}transformDirection(e){for(let t=0,r=this.count;t<r;t++)sn.fromBufferAttribute(this,t),sn.transformDirection(e),this.setXYZ(t,sn.x,sn.y,sn.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let r=this.array[e*this.itemSize+t];return this.normalized&&(r=Ii(r,this.array)),r}setComponent(e,t,r){return this.normalized&&(r=Nt(r,this.array)),this.array[e*this.itemSize+t]=r,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=Ii(t,this.array)),t}setX(e,t){return this.normalized&&(t=Nt(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=Ii(t,this.array)),t}setY(e,t){return this.normalized&&(t=Nt(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=Ii(t,this.array)),t}setZ(e,t){return this.normalized&&(t=Nt(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=Ii(t,this.array)),t}setW(e,t){return this.normalized&&(t=Nt(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,r){return e*=this.itemSize,this.normalized&&(t=Nt(t,this.array),r=Nt(r,this.array)),this.array[e+0]=t,this.array[e+1]=r,this}setXYZ(e,t,r,o){return e*=this.itemSize,this.normalized&&(t=Nt(t,this.array),r=Nt(r,this.array),o=Nt(o,this.array)),this.array[e+0]=t,this.array[e+1]=r,this.array[e+2]=o,this}setXYZW(e,t,r,o,l){return e*=this.itemSize,this.normalized&&(t=Nt(t,this.array),r=Nt(r,this.array),o=Nt(o,this.array),l=Nt(l,this.array)),this.array[e+0]=t,this.array[e+1]=r,this.array[e+2]=o,this.array[e+3]=l,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==bd&&(e.usage=this.usage),e}dispose(){this.dispatchEvent({type:"dispose"})}}class l_ extends Ti{constructor(e,t,r){super(new Uint16Array(e),t,r)}}class u_ extends Ti{constructor(e,t,r){super(new Uint32Array(e),t,r)}}class an extends Ti{constructor(e,t,r){super(new Float32Array(e),t,r)}}const px=new mo,ja=new H,Sf=new H;class go{constructor(e=new H,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){const r=this.center;t!==void 0?r.copy(t):px.setFromPoints(e).getCenter(r);let o=0;for(let l=0,c=e.length;l<c;l++)o=Math.max(o,r.distanceToSquared(e[l]));return this.radius=Math.sqrt(o),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){const r=this.center.distanceToSquared(e);return t.copy(e),r>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;ja.subVectors(e,this.center);const t=ja.lengthSq();if(t>this.radius*this.radius){const r=Math.sqrt(t),o=(r-this.radius)*.5;this.center.addScaledVector(ja,o/r),this.radius+=o}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(Sf.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(ja.copy(e.center).add(Sf)),this.expandByPoint(ja.copy(e.center).sub(Sf))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}}let mx=0;const li=new Ut,Mf=new tn,Ks=new H,jn=new mo,eo=new mo,mn=new H;class Mn extends Br{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:mx++}),this.uuid=Ir(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(qv(e)?u_:l_)(e,1):this.index=e,this}setIndirect(e,t=0){return this.indirect=e,this.indirectOffset=t,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,r=0){this.groups.push({start:e,count:t,materialIndex:r})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){const t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);const r=this.attributes.normal;if(r!==void 0){const l=new ut().getNormalMatrix(e);r.applyNormalMatrix(l),r.needsUpdate=!0}const o=this.attributes.tangent;return o!==void 0&&(o.transformDirection(e),o.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(e){return li.makeRotationFromQuaternion(e),this.applyMatrix4(li),this}rotateX(e){return li.makeRotationX(e),this.applyMatrix4(li),this}rotateY(e){return li.makeRotationY(e),this.applyMatrix4(li),this}rotateZ(e){return li.makeRotationZ(e),this.applyMatrix4(li),this}translate(e,t,r){return li.makeTranslation(e,t,r),this.applyMatrix4(li),this}scale(e,t,r){return li.makeScale(e,t,r),this.applyMatrix4(li),this}lookAt(e){return Mf.lookAt(e),Mf.updateMatrix(),this.applyMatrix4(Mf.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Ks).negate(),this.translate(Ks.x,Ks.y,Ks.z),this}setFromPoints(e){const t=this.getAttribute("position");if(t===void 0){const r=[];for(let o=0,l=e.length;o<l;o++){const c=e[o];r.push(c.x,c.y,c.z||0)}this.setAttribute("position",new an(r,3))}else{const r=Math.min(e.length,t.count);for(let o=0;o<r;o++){const l=e[o];t.setXYZ(o,l.x,l.y,l.z||0)}e.length>t.count&&rt("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new mo);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){St("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new H(-1/0,-1/0,-1/0),new H(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let r=0,o=t.length;r<o;r++){const l=t[r];jn.setFromBufferAttribute(l),this.morphTargetsRelative?(mn.addVectors(this.boundingBox.min,jn.min),this.boundingBox.expandByPoint(mn),mn.addVectors(this.boundingBox.max,jn.max),this.boundingBox.expandByPoint(mn)):(this.boundingBox.expandByPoint(jn.min),this.boundingBox.expandByPoint(jn.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&St('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new go);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){St("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new H,1/0);return}if(e){const r=this.boundingSphere.center;if(jn.setFromBufferAttribute(e),t)for(let l=0,c=t.length;l<c;l++){const d=t[l];eo.setFromBufferAttribute(d),this.morphTargetsRelative?(mn.addVectors(jn.min,eo.min),jn.expandByPoint(mn),mn.addVectors(jn.max,eo.max),jn.expandByPoint(mn)):(jn.expandByPoint(eo.min),jn.expandByPoint(eo.max))}jn.getCenter(r);let o=0;for(let l=0,c=e.count;l<c;l++)mn.fromBufferAttribute(e,l),o=Math.max(o,r.distanceToSquared(mn));if(t)for(let l=0,c=t.length;l<c;l++){const d=t[l],p=this.morphTargetsRelative;for(let m=0,x=d.count;m<x;m++)mn.fromBufferAttribute(d,m),p&&(Ks.fromBufferAttribute(e,m),mn.add(Ks)),o=Math.max(o,r.distanceToSquared(mn))}this.boundingSphere.radius=Math.sqrt(o),isNaN(this.boundingSphere.radius)&&St('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){St("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const r=t.position,o=t.normal,l=t.uv;let c=this.getAttribute("tangent");(c===void 0||c.count!==r.count)&&(c=new Ti(new Float32Array(4*r.count),4),this.setAttribute("tangent",c));const d=[],p=[];for(let T=0;T<r.count;T++)d[T]=new H,p[T]=new H;const m=new H,x=new H,y=new H,g=new Qe,M=new Qe,E=new Qe,R=new H,v=new H;function _(T,D,z){m.fromBufferAttribute(r,T),x.fromBufferAttribute(r,D),y.fromBufferAttribute(r,z),g.fromBufferAttribute(l,T),M.fromBufferAttribute(l,D),E.fromBufferAttribute(l,z),x.sub(m),y.sub(m),M.sub(g),E.sub(g);const k=1/(M.x*E.y-E.x*M.y);isFinite(k)&&(R.copy(x).multiplyScalar(E.y).addScaledVector(y,-M.y).multiplyScalar(k),v.copy(y).multiplyScalar(M.x).addScaledVector(x,-E.x).multiplyScalar(k),d[T].add(R),d[D].add(R),d[z].add(R),p[T].add(v),p[D].add(v),p[z].add(v))}let b=this.groups;b.length===0&&(b=[{start:0,count:e.count}]);for(let T=0,D=b.length;T<D;++T){const z=b[T],k=z.start,K=z.count;for(let ce=k,me=k+K;ce<me;ce+=3)_(e.getX(ce+0),e.getX(ce+1),e.getX(ce+2))}const N=new H,C=new H,I=new H,P=new H;function O(T){I.fromBufferAttribute(o,T),P.copy(I);const D=d[T];N.copy(D),N.sub(I.multiplyScalar(I.dot(D))).normalize(),C.crossVectors(P,D);const k=C.dot(p[T])<0?-1:1;c.setXYZW(T,N.x,N.y,N.z,k)}for(let T=0,D=b.length;T<D;++T){const z=b[T],k=z.start,K=z.count;for(let ce=k,me=k+K;ce<me;ce+=3)O(e.getX(ce+0)),O(e.getX(ce+1)),O(e.getX(ce+2))}this._transformed=!0}computeVertexNormals(){const e=this.index,t=this.getAttribute("position");if(t!==void 0){let r=this.getAttribute("normal");if(r===void 0||r.count!==t.count)r=new Ti(new Float32Array(t.count*3),3),this.setAttribute("normal",r);else for(let g=0,M=r.count;g<M;g++)r.setXYZ(g,0,0,0);const o=new H,l=new H,c=new H,d=new H,p=new H,m=new H,x=new H,y=new H;if(e)for(let g=0,M=e.count;g<M;g+=3){const E=e.getX(g+0),R=e.getX(g+1),v=e.getX(g+2);o.fromBufferAttribute(t,E),l.fromBufferAttribute(t,R),c.fromBufferAttribute(t,v),x.subVectors(c,l),y.subVectors(o,l),x.cross(y),d.fromBufferAttribute(r,E),p.fromBufferAttribute(r,R),m.fromBufferAttribute(r,v),d.add(x),p.add(x),m.add(x),r.setXYZ(E,d.x,d.y,d.z),r.setXYZ(R,p.x,p.y,p.z),r.setXYZ(v,m.x,m.y,m.z)}else for(let g=0,M=t.count;g<M;g+=3)o.fromBufferAttribute(t,g+0),l.fromBufferAttribute(t,g+1),c.fromBufferAttribute(t,g+2),x.subVectors(c,l),y.subVectors(o,l),x.cross(y),r.setXYZ(g+0,x.x,x.y,x.z),r.setXYZ(g+1,x.x,x.y,x.z),r.setXYZ(g+2,x.x,x.y,x.z);this.normalizeNormals(),r.needsUpdate=!0}}normalizeNormals(){const e=this.attributes.normal;for(let t=0,r=e.count;t<r;t++)mn.fromBufferAttribute(e,t),mn.normalize(),e.setXYZ(t,mn.x,mn.y,mn.z)}toNonIndexed(){function e(d,p){const m=d.array,x=d.itemSize,y=d.normalized,g=new m.constructor(p.length*x);let M=0,E=0;for(let R=0,v=p.length;R<v;R++){d.isInterleavedBufferAttribute?M=p[R]*d.data.stride+d.offset:M=p[R]*x;for(let _=0;_<x;_++)g[E++]=m[M++]}return new Ti(g,x,y)}if(this.index===null)return rt("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const t=new Mn,r=this.index.array,o=this.attributes;for(const d in o){const p=o[d],m=e(p,r);t.setAttribute(d,m)}const l=this.morphAttributes;for(const d in l){const p=[],m=l[d];for(let x=0,y=m.length;x<y;x++){const g=m[x],M=e(g,r);p.push(M)}t.morphAttributes[d]=p}t.morphTargetsRelative=this.morphTargetsRelative;const c=this.groups;for(let d=0,p=c.length;d<p;d++){const m=c[d];t.addGroup(m.start,m.count,m.materialIndex)}return t}toJSON(){const e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){const p=this.parameters;for(const m in p)p[m]!==void 0&&(e[m]=p[m]);return e}e.data={attributes:{}};const t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});const r=this.attributes;for(const p in r){const m=r[p];e.data.attributes[p]=m.toJSON(e.data)}const o={};let l=!1;for(const p in this.morphAttributes){const m=this.morphAttributes[p],x=[];for(let y=0,g=m.length;y<g;y++){const M=m[y];x.push(M.toJSON(e.data))}x.length>0&&(o[p]=x,l=!0)}l&&(e.data.morphAttributes=o,e.data.morphTargetsRelative=this.morphTargetsRelative);const c=this.groups;c.length>0&&(e.data.groups=JSON.parse(JSON.stringify(c)));const d=this.boundingSphere;return d!==null&&(e.data.boundingSphere=d.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const t={};this.name=e.name;const r=e.index;r!==null&&this.setIndex(r.clone());const o=e.attributes;for(const m in o){const x=o[m];this.setAttribute(m,x.clone(t))}const l=e.morphAttributes;for(const m in l){const x=[],y=l[m];for(let g=0,M=y.length;g<M;g++)x.push(y[g].clone(t));this.morphAttributes[m]=x}this.morphTargetsRelative=e.morphTargetsRelative;const c=e.groups;for(let m=0,x=c.length;m<x;m++){const y=c[m];this.addGroup(y.start,y.count,y.materialIndex)}const d=e.boundingBox;d!==null&&(this.boundingBox=d.clone());const p=e.boundingSphere;return p!==null&&(this.boundingSphere=p.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this._transformed=e._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}}class gx{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e!==void 0?e.length/t:0,this.usage=bd,this.updateRanges=[],this.version=0,this.uuid=Ir()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,r){e*=this.stride,r*=t.stride;for(let o=0,l=this.stride;o<l;o++)this.array[e+o]=t.array[r+o];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Ir()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);const t=new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),r=new this.constructor(t,this.stride);return r.setUsage(this.usage),r}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){return e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Ir()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer))),{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}}const In=new H;class fu{constructor(e,t,r,o=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=e,this.itemSize=t,this.offset=r,this.normalized=o}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,r=this.data.count;t<r;t++)In.fromBufferAttribute(this,t),In.applyMatrix4(e),this.setXYZ(t,In.x,In.y,In.z);return this}applyNormalMatrix(e){for(let t=0,r=this.count;t<r;t++)In.fromBufferAttribute(this,t),In.applyNormalMatrix(e),this.setXYZ(t,In.x,In.y,In.z);return this}transformDirection(e){for(let t=0,r=this.count;t<r;t++)In.fromBufferAttribute(this,t),In.transformDirection(e),this.setXYZ(t,In.x,In.y,In.z);return this}getComponent(e,t){let r=this.array[e*this.data.stride+this.offset+t];return this.normalized&&(r=Ii(r,this.array)),r}setComponent(e,t,r){return this.normalized&&(r=Nt(r,this.array)),this.data.array[e*this.data.stride+this.offset+t]=r,this}setX(e,t){return this.normalized&&(t=Nt(t,this.array)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=Nt(t,this.array)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=Nt(t,this.array)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=Nt(t,this.array)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=Ii(t,this.array)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=Ii(t,this.array)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=Ii(t,this.array)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=Ii(t,this.array)),t}setXY(e,t,r){return e=e*this.data.stride+this.offset,this.normalized&&(t=Nt(t,this.array),r=Nt(r,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=r,this}setXYZ(e,t,r,o){return e=e*this.data.stride+this.offset,this.normalized&&(t=Nt(t,this.array),r=Nt(r,this.array),o=Nt(o,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=r,this.data.array[e+2]=o,this}setXYZW(e,t,r,o,l){return e=e*this.data.stride+this.offset,this.normalized&&(t=Nt(t,this.array),r=Nt(r,this.array),o=Nt(o,this.array),l=Nt(l,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=r,this.data.array[e+2]=o,this.data.array[e+3]=l,this}clone(e){if(e===void 0){cu("InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");const t=[];for(let r=0;r<this.count;r++){const o=r*this.data.stride+this.offset;for(let l=0;l<this.itemSize;l++)t.push(this.data.array[o+l])}return new Ti(new this.array.constructor(t),this.itemSize,this.normalized)}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.clone(e)),new fu(e.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){cu("InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");const t=[];for(let r=0;r<this.count;r++){const o=r*this.data.stride+this.offset;for(let l=0;l<this.itemSize;l++)t.push(this.data.array[o+l])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:t,normalized:this.normalized}}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}}let _x=0;class kr extends Br{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:_x++}),this.uuid=Ir(),this.name="",this.type="Material",this.blending=oa,this.side=Ur,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Vf,this.blendDst=Hf,this.blendEquation=ls,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new dt(0,0,0),this.blendAlpha=0,this.depthFunc=ca,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Dm,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Bs,this.stencilZFail=Bs,this.stencilZPass=Bs,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const t in e){const r=e[t];if(r===void 0){rt(`Material: parameter '${t}' has value of undefined.`);continue}const o=this[t];if(o===void 0){rt(`Material: '${t}' is not a property of THREE.${this.type}.`);continue}o&&o.isColor?o.set(r):o&&o.isVector2&&r&&r.isVector2||o&&o.isEuler&&r&&r.isEuler||o&&o.isVector3&&r&&r.isVector3?o.copy(r):this[t]=r}}toJSON(e){const t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});const r={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};r.uuid=this.uuid,r.type=this.type,this.name!==""&&(r.name=this.name),this.color&&this.color.isColor&&(r.color=this.color.getHex()),this.roughness!==void 0&&(r.roughness=this.roughness),this.metalness!==void 0&&(r.metalness=this.metalness),this.sheen!==void 0&&(r.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(r.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(r.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(r.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(r.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(r.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(r.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(r.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(r.shininess=this.shininess),this.clearcoat!==void 0&&(r.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(r.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(r.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(r.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(r.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,r.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(r.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(r.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(r.dispersion=this.dispersion),this.iridescence!==void 0&&(r.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(r.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(r.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(r.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(r.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(r.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(r.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(r.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(r.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(r.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(r.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(r.lightMap=this.lightMap.toJSON(e).uuid,r.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(r.aoMap=this.aoMap.toJSON(e).uuid,r.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(r.bumpMap=this.bumpMap.toJSON(e).uuid,r.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(r.normalMap=this.normalMap.toJSON(e).uuid,r.normalMapType=this.normalMapType,r.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(r.displacementMap=this.displacementMap.toJSON(e).uuid,r.displacementScale=this.displacementScale,r.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(r.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(r.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(r.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(r.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(r.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(r.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(r.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(r.combine=this.combine)),this.envMapRotation!==void 0&&(r.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(r.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(r.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(r.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(r.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(r.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(r.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(r.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(r.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(r.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(r.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(r.size=this.size),this.shadowSide!==null&&(r.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(r.sizeAttenuation=this.sizeAttenuation),this.blending!==oa&&(r.blending=this.blending),this.side!==Ur&&(r.side=this.side),this.vertexColors===!0&&(r.vertexColors=!0),this.opacity<1&&(r.opacity=this.opacity),this.transparent===!0&&(r.transparent=!0),this.blendSrc!==Vf&&(r.blendSrc=this.blendSrc),this.blendDst!==Hf&&(r.blendDst=this.blendDst),this.blendEquation!==ls&&(r.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(r.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(r.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(r.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(r.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(r.blendAlpha=this.blendAlpha),this.depthFunc!==ca&&(r.depthFunc=this.depthFunc),this.depthTest===!1&&(r.depthTest=this.depthTest),this.depthWrite===!1&&(r.depthWrite=this.depthWrite),this.colorWrite===!1&&(r.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(r.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==Dm&&(r.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(r.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(r.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==Bs&&(r.stencilFail=this.stencilFail),this.stencilZFail!==Bs&&(r.stencilZFail=this.stencilZFail),this.stencilZPass!==Bs&&(r.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(r.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(r.rotation=this.rotation),this.polygonOffset===!0&&(r.polygonOffset=!0),this.polygonOffsetFactor!==0&&(r.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(r.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(r.linewidth=this.linewidth),this.dashSize!==void 0&&(r.dashSize=this.dashSize),this.gapSize!==void 0&&(r.gapSize=this.gapSize),this.scale!==void 0&&(r.scale=this.scale),this.dithering===!0&&(r.dithering=!0),this.alphaTest>0&&(r.alphaTest=this.alphaTest),this.alphaHash===!0&&(r.alphaHash=!0),this.alphaToCoverage===!0&&(r.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(r.premultipliedAlpha=!0),this.forceSinglePass===!0&&(r.forceSinglePass=!0),this.allowOverride===!1&&(r.allowOverride=!1),this.wireframe===!0&&(r.wireframe=!0),this.wireframeLinewidth>1&&(r.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(r.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(r.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(r.flatShading=!0),this.visible===!1&&(r.visible=!1),this.toneMapped===!1&&(r.toneMapped=!1),this.fog===!1&&(r.fog=!1),Object.keys(this.userData).length>0&&(r.userData=this.userData);function o(l){const c=[];for(const d in l){const p=l[d];delete p.metadata,c.push(p)}return c}if(t){const l=o(e.textures),c=o(e.images);l.length>0&&(r.textures=l),c.length>0&&(r.images=c)}return r}fromJSON(e,t){if(e.uuid!==void 0&&(this.uuid=e.uuid),e.name!==void 0&&(this.name=e.name),e.color!==void 0&&this.color!==void 0&&this.color.setHex(e.color),e.roughness!==void 0&&(this.roughness=e.roughness),e.metalness!==void 0&&(this.metalness=e.metalness),e.sheen!==void 0&&(this.sheen=e.sheen),e.sheenColor!==void 0&&(this.sheenColor=new dt().setHex(e.sheenColor)),e.sheenRoughness!==void 0&&(this.sheenRoughness=e.sheenRoughness),e.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(e.emissive),e.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(e.specular),e.specularIntensity!==void 0&&(this.specularIntensity=e.specularIntensity),e.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(e.specularColor),e.shininess!==void 0&&(this.shininess=e.shininess),e.clearcoat!==void 0&&(this.clearcoat=e.clearcoat),e.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=e.clearcoatRoughness),e.dispersion!==void 0&&(this.dispersion=e.dispersion),e.iridescence!==void 0&&(this.iridescence=e.iridescence),e.iridescenceIOR!==void 0&&(this.iridescenceIOR=e.iridescenceIOR),e.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessRange=e.iridescenceThicknessRange),e.transmission!==void 0&&(this.transmission=e.transmission),e.thickness!==void 0&&(this.thickness=e.thickness),e.attenuationDistance!==void 0&&(this.attenuationDistance=e.attenuationDistance),e.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(e.attenuationColor),e.anisotropy!==void 0&&(this.anisotropy=e.anisotropy),e.anisotropyRotation!==void 0&&(this.anisotropyRotation=e.anisotropyRotation),e.fog!==void 0&&(this.fog=e.fog),e.flatShading!==void 0&&(this.flatShading=e.flatShading),e.blending!==void 0&&(this.blending=e.blending),e.combine!==void 0&&(this.combine=e.combine),e.side!==void 0&&(this.side=e.side),e.shadowSide!==void 0&&(this.shadowSide=e.shadowSide),e.opacity!==void 0&&(this.opacity=e.opacity),e.transparent!==void 0&&(this.transparent=e.transparent),e.alphaTest!==void 0&&(this.alphaTest=e.alphaTest),e.alphaHash!==void 0&&(this.alphaHash=e.alphaHash),e.depthFunc!==void 0&&(this.depthFunc=e.depthFunc),e.depthTest!==void 0&&(this.depthTest=e.depthTest),e.depthWrite!==void 0&&(this.depthWrite=e.depthWrite),e.colorWrite!==void 0&&(this.colorWrite=e.colorWrite),e.blendSrc!==void 0&&(this.blendSrc=e.blendSrc),e.blendDst!==void 0&&(this.blendDst=e.blendDst),e.blendEquation!==void 0&&(this.blendEquation=e.blendEquation),e.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=e.blendSrcAlpha),e.blendDstAlpha!==void 0&&(this.blendDstAlpha=e.blendDstAlpha),e.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=e.blendEquationAlpha),e.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(e.blendColor),e.blendAlpha!==void 0&&(this.blendAlpha=e.blendAlpha),e.stencilWriteMask!==void 0&&(this.stencilWriteMask=e.stencilWriteMask),e.stencilFunc!==void 0&&(this.stencilFunc=e.stencilFunc),e.stencilRef!==void 0&&(this.stencilRef=e.stencilRef),e.stencilFuncMask!==void 0&&(this.stencilFuncMask=e.stencilFuncMask),e.stencilFail!==void 0&&(this.stencilFail=e.stencilFail),e.stencilZFail!==void 0&&(this.stencilZFail=e.stencilZFail),e.stencilZPass!==void 0&&(this.stencilZPass=e.stencilZPass),e.stencilWrite!==void 0&&(this.stencilWrite=e.stencilWrite),e.wireframe!==void 0&&(this.wireframe=e.wireframe),e.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=e.wireframeLinewidth),e.wireframeLinecap!==void 0&&(this.wireframeLinecap=e.wireframeLinecap),e.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=e.wireframeLinejoin),e.rotation!==void 0&&(this.rotation=e.rotation),e.linewidth!==void 0&&(this.linewidth=e.linewidth),e.dashSize!==void 0&&(this.dashSize=e.dashSize),e.gapSize!==void 0&&(this.gapSize=e.gapSize),e.scale!==void 0&&(this.scale=e.scale),e.polygonOffset!==void 0&&(this.polygonOffset=e.polygonOffset),e.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=e.polygonOffsetFactor),e.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=e.polygonOffsetUnits),e.dithering!==void 0&&(this.dithering=e.dithering),e.alphaToCoverage!==void 0&&(this.alphaToCoverage=e.alphaToCoverage),e.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=e.premultipliedAlpha),e.forceSinglePass!==void 0&&(this.forceSinglePass=e.forceSinglePass),e.allowOverride!==void 0&&(this.allowOverride=e.allowOverride),e.visible!==void 0&&(this.visible=e.visible),e.toneMapped!==void 0&&(this.toneMapped=e.toneMapped),e.userData!==void 0&&(this.userData=e.userData),e.vertexColors!==void 0&&(typeof e.vertexColors=="number"?this.vertexColors=e.vertexColors>0:this.vertexColors=e.vertexColors),e.size!==void 0&&(this.size=e.size),e.sizeAttenuation!==void 0&&(this.sizeAttenuation=e.sizeAttenuation),e.map!==void 0&&(this.map=t[e.map]||null),e.matcap!==void 0&&(this.matcap=t[e.matcap]||null),e.alphaMap!==void 0&&(this.alphaMap=t[e.alphaMap]||null),e.bumpMap!==void 0&&(this.bumpMap=t[e.bumpMap]||null),e.bumpScale!==void 0&&(this.bumpScale=e.bumpScale),e.normalMap!==void 0&&(this.normalMap=t[e.normalMap]||null),e.normalMapType!==void 0&&(this.normalMapType=e.normalMapType),e.normalScale!==void 0){let r=e.normalScale;Array.isArray(r)===!1&&(r=[r,r]),this.normalScale=new Qe().fromArray(r)}return e.displacementMap!==void 0&&(this.displacementMap=t[e.displacementMap]||null),e.displacementScale!==void 0&&(this.displacementScale=e.displacementScale),e.displacementBias!==void 0&&(this.displacementBias=e.displacementBias),e.roughnessMap!==void 0&&(this.roughnessMap=t[e.roughnessMap]||null),e.metalnessMap!==void 0&&(this.metalnessMap=t[e.metalnessMap]||null),e.emissiveMap!==void 0&&(this.emissiveMap=t[e.emissiveMap]||null),e.emissiveIntensity!==void 0&&(this.emissiveIntensity=e.emissiveIntensity),e.specularMap!==void 0&&(this.specularMap=t[e.specularMap]||null),e.specularIntensityMap!==void 0&&(this.specularIntensityMap=t[e.specularIntensityMap]||null),e.specularColorMap!==void 0&&(this.specularColorMap=t[e.specularColorMap]||null),e.envMap!==void 0&&(this.envMap=t[e.envMap]||null),e.envMapRotation!==void 0&&this.envMapRotation.fromArray(e.envMapRotation),e.envMapIntensity!==void 0&&(this.envMapIntensity=e.envMapIntensity),e.reflectivity!==void 0&&(this.reflectivity=e.reflectivity),e.refractionRatio!==void 0&&(this.refractionRatio=e.refractionRatio),e.lightMap!==void 0&&(this.lightMap=t[e.lightMap]||null),e.lightMapIntensity!==void 0&&(this.lightMapIntensity=e.lightMapIntensity),e.aoMap!==void 0&&(this.aoMap=t[e.aoMap]||null),e.aoMapIntensity!==void 0&&(this.aoMapIntensity=e.aoMapIntensity),e.gradientMap!==void 0&&(this.gradientMap=t[e.gradientMap]||null),e.clearcoatMap!==void 0&&(this.clearcoatMap=t[e.clearcoatMap]||null),e.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=t[e.clearcoatRoughnessMap]||null),e.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=t[e.clearcoatNormalMap]||null),e.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new Qe().fromArray(e.clearcoatNormalScale)),e.iridescenceMap!==void 0&&(this.iridescenceMap=t[e.iridescenceMap]||null),e.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=t[e.iridescenceThicknessMap]||null),e.transmissionMap!==void 0&&(this.transmissionMap=t[e.transmissionMap]||null),e.thicknessMap!==void 0&&(this.thicknessMap=t[e.thicknessMap]||null),e.anisotropyMap!==void 0&&(this.anisotropyMap=t[e.anisotropyMap]||null),e.sheenColorMap!==void 0&&(this.sheenColorMap=t[e.sheenColorMap]||null),e.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=t[e.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const t=e.clippingPlanes;let r=null;if(t!==null){const o=t.length;r=new Array(o);for(let l=0;l!==o;++l)r[l]=t[l].clone()}return this.clippingPlanes=r,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}}class c_ extends kr{constructor(e){super(),this.isSpriteMaterial=!0,this.type="SpriteMaterial",this.color=new dt(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.rotation=e.rotation,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}}let $s;const to=new H,Zs=new H,Qs=new H,Js=new Qe,no=new Qe,f_=new Ut,Pl=new H,io=new H,Ll=new H,Ym=new Qe,Ef=new Qe,qm=new Qe;class vx extends tn{constructor(e=new c_){if(super(),this.isSprite=!0,this.type="Sprite",$s===void 0){$s=new Mn;const t=new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),r=new gx(t,5);$s.setIndex([0,1,2,0,2,3]),$s.setAttribute("position",new fu(r,3,0,!1)),$s.setAttribute("uv",new fu(r,2,3,!1))}this.geometry=$s,this.material=e,this.center=new Qe(.5,.5),this.count=1}raycast(e,t){e.camera===null&&St('Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'),Zs.setFromMatrixScale(this.matrixWorld),f_.copy(e.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(e.camera.matrixWorldInverse,this.matrixWorld),Qs.setFromMatrixPosition(this.modelViewMatrix),e.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&Zs.multiplyScalar(-Qs.z);const r=this.material.rotation;let o,l;r!==0&&(l=Math.cos(r),o=Math.sin(r));const c=this.center;Dl(Pl.set(-.5,-.5,0),Qs,c,Zs,o,l),Dl(io.set(.5,-.5,0),Qs,c,Zs,o,l),Dl(Ll.set(.5,.5,0),Qs,c,Zs,o,l),Ym.set(0,0),Ef.set(1,0),qm.set(1,1);let d=e.ray.intersectTriangle(Pl,io,Ll,!1,to);if(d===null&&(Dl(io.set(-.5,.5,0),Qs,c,Zs,o,l),Ef.set(0,1),d=e.ray.intersectTriangle(Pl,Ll,io,!1,to),d===null))return;const p=e.ray.origin.distanceTo(to);p<e.near||p>e.far||t.push({distance:p,point:to.clone(),uv:fi.getInterpolation(to,Pl,io,Ll,Ym,Ef,qm,new Qe),face:null,object:this})}copy(e,t){return super.copy(e,t),e.center!==void 0&&this.center.copy(e.center),this.material=e.material,this}}function Dl(s,e,t,r,o,l){Js.subVectors(s,t).addScalar(.5).multiply(r),o!==void 0?(no.x=l*Js.x-o*Js.y,no.y=o*Js.x+l*Js.y):no.copy(Js),s.copy(e),s.x+=no.x,s.y+=no.y,s.applyMatrix4(f_)}const er=new H,Tf=new H,Nl=new H,br=new H,wf=new H,Il=new H,Af=new H;class gu{constructor(e=new H,t=new H(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,er)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);const r=t.dot(this.direction);return r<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,r)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const t=er.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(er.copy(this.origin).addScaledVector(this.direction,t),er.distanceToSquared(e))}distanceSqToSegment(e,t,r,o){Tf.copy(e).add(t).multiplyScalar(.5),Nl.copy(t).sub(e).normalize(),br.copy(this.origin).sub(Tf);const l=e.distanceTo(t)*.5,c=-this.direction.dot(Nl),d=br.dot(this.direction),p=-br.dot(Nl),m=br.lengthSq(),x=Math.abs(1-c*c);let y,g,M,E;if(x>0)if(y=c*p-d,g=c*d-p,E=l*x,y>=0)if(g>=-E)if(g<=E){const R=1/x;y*=R,g*=R,M=y*(y+c*g+2*d)+g*(c*y+g+2*p)+m}else g=l,y=Math.max(0,-(c*g+d)),M=-y*y+g*(g+2*p)+m;else g=-l,y=Math.max(0,-(c*g+d)),M=-y*y+g*(g+2*p)+m;else g<=-E?(y=Math.max(0,-(-c*l+d)),g=y>0?-l:Math.min(Math.max(-l,-p),l),M=-y*y+g*(g+2*p)+m):g<=E?(y=0,g=Math.min(Math.max(-l,-p),l),M=g*(g+2*p)+m):(y=Math.max(0,-(c*l+d)),g=y>0?l:Math.min(Math.max(-l,-p),l),M=-y*y+g*(g+2*p)+m);else g=c>0?-l:l,y=Math.max(0,-(c*g+d)),M=-y*y+g*(g+2*p)+m;return r&&r.copy(this.origin).addScaledVector(this.direction,y),o&&o.copy(Tf).addScaledVector(Nl,g),M}intersectSphere(e,t){er.subVectors(e.center,this.origin);const r=er.dot(this.direction),o=er.dot(er)-r*r,l=e.radius*e.radius;if(o>l)return null;const c=Math.sqrt(l-o),d=r-c,p=r+c;return p<0?null:d<0?this.at(p,t):this.at(d,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;const r=-(this.origin.dot(e.normal)+e.constant)/t;return r>=0?r:null}intersectPlane(e,t){const r=this.distanceToPlane(e);return r===null?null:this.at(r,t)}intersectsPlane(e){const t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let r,o,l,c,d,p;const m=1/this.direction.x,x=1/this.direction.y,y=1/this.direction.z,g=this.origin;return m>=0?(r=(e.min.x-g.x)*m,o=(e.max.x-g.x)*m):(r=(e.max.x-g.x)*m,o=(e.min.x-g.x)*m),x>=0?(l=(e.min.y-g.y)*x,c=(e.max.y-g.y)*x):(l=(e.max.y-g.y)*x,c=(e.min.y-g.y)*x),r>c||l>o||((l>r||isNaN(r))&&(r=l),(c<o||isNaN(o))&&(o=c),y>=0?(d=(e.min.z-g.z)*y,p=(e.max.z-g.z)*y):(d=(e.max.z-g.z)*y,p=(e.min.z-g.z)*y),r>p||d>o)||((d>r||r!==r)&&(r=d),(p<o||o!==o)&&(o=p),o<0)?null:this.at(r>=0?r:o,t)}intersectsBox(e){return this.intersectBox(e,er)!==null}intersectTriangle(e,t,r,o,l){wf.subVectors(t,e),Il.subVectors(r,e),Af.crossVectors(wf,Il);let c=this.direction.dot(Af),d;if(c>0){if(o)return null;d=1}else if(c<0)d=-1,c=-c;else return null;br.subVectors(this.origin,e);const p=d*this.direction.dot(Il.crossVectors(br,Il));if(p<0)return null;const m=d*this.direction.dot(wf.cross(br));if(m<0||p+m>c)return null;const x=-d*br.dot(Af);return x<0?null:this.at(x/c,l)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class da extends kr{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new dt(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Or,this.combine=Ud,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const Km=new Ut,as=new gu,Ul=new go,$m=new H,Fl=new H,Ol=new H,Bl=new H,Rf=new H,kl=new H,Zm=new H,zl=new H;class qn extends tn{constructor(e=new Mn,t=new da){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const t=this.geometry.morphAttributes,r=Object.keys(t);if(r.length>0){const o=t[r[0]];if(o!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let l=0,c=o.length;l<c;l++){const d=o[l].name||String(l);this.morphTargetInfluences.push(0),this.morphTargetDictionary[d]=l}}}}getVertexPosition(e,t){const r=this.geometry,o=r.attributes.position,l=r.morphAttributes.position,c=r.morphTargetsRelative;t.fromBufferAttribute(o,e);const d=this.morphTargetInfluences;if(l&&d){kl.set(0,0,0);for(let p=0,m=l.length;p<m;p++){const x=d[p],y=l[p];x!==0&&(Rf.fromBufferAttribute(y,e),c?kl.addScaledVector(Rf,x):kl.addScaledVector(Rf.sub(t),x))}t.add(kl)}return t}raycast(e,t){const r=this.geometry,o=this.material,l=this.matrixWorld;o!==void 0&&(r.boundingSphere===null&&r.computeBoundingSphere(),Ul.copy(r.boundingSphere),Ul.applyMatrix4(l),as.copy(e.ray).recast(e.near),!(Ul.containsPoint(as.origin)===!1&&(as.intersectSphere(Ul,$m)===null||as.origin.distanceToSquared($m)>(e.far-e.near)**2))&&(Km.copy(l).invert(),as.copy(e.ray).applyMatrix4(Km),!(r.boundingBox!==null&&as.intersectsBox(r.boundingBox)===!1)&&this._computeIntersections(e,t,as)))}_computeIntersections(e,t,r){let o;const l=this.geometry,c=this.material,d=l.index,p=l.attributes.position,m=l.attributes.uv,x=l.attributes.uv1,y=l.attributes.normal,g=l.groups,M=l.drawRange;if(d!==null)if(Array.isArray(c))for(let E=0,R=g.length;E<R;E++){const v=g[E],_=c[v.materialIndex],b=Math.max(v.start,M.start),N=Math.min(d.count,Math.min(v.start+v.count,M.start+M.count));for(let C=b,I=N;C<I;C+=3){const P=d.getX(C),O=d.getX(C+1),T=d.getX(C+2);o=Vl(this,_,e,r,m,x,y,P,O,T),o&&(o.faceIndex=Math.floor(C/3),o.face.materialIndex=v.materialIndex,t.push(o))}}else{const E=Math.max(0,M.start),R=Math.min(d.count,M.start+M.count);for(let v=E,_=R;v<_;v+=3){const b=d.getX(v),N=d.getX(v+1),C=d.getX(v+2);o=Vl(this,c,e,r,m,x,y,b,N,C),o&&(o.faceIndex=Math.floor(v/3),t.push(o))}}else if(p!==void 0)if(Array.isArray(c))for(let E=0,R=g.length;E<R;E++){const v=g[E],_=c[v.materialIndex],b=Math.max(v.start,M.start),N=Math.min(p.count,Math.min(v.start+v.count,M.start+M.count));for(let C=b,I=N;C<I;C+=3){const P=C,O=C+1,T=C+2;o=Vl(this,_,e,r,m,x,y,P,O,T),o&&(o.faceIndex=Math.floor(C/3),o.face.materialIndex=v.materialIndex,t.push(o))}}else{const E=Math.max(0,M.start),R=Math.min(p.count,M.start+M.count);for(let v=E,_=R;v<_;v+=3){const b=v,N=v+1,C=v+2;o=Vl(this,c,e,r,m,x,y,b,N,C),o&&(o.faceIndex=Math.floor(v/3),t.push(o))}}}}function xx(s,e,t,r,o,l,c,d){let p;if(e.side===On?p=r.intersectTriangle(c,l,o,!0,d):p=r.intersectTriangle(o,l,c,e.side===Ur,d),p===null)return null;zl.copy(d),zl.applyMatrix4(s.matrixWorld);const m=t.ray.origin.distanceTo(zl);return m<t.near||m>t.far?null:{distance:m,point:zl.clone(),object:s}}function Vl(s,e,t,r,o,l,c,d,p,m){s.getVertexPosition(d,Fl),s.getVertexPosition(p,Ol),s.getVertexPosition(m,Bl);const x=xx(s,e,t,r,Fl,Ol,Bl,Zm);if(x){const y=new H;fi.getBarycoord(Zm,Fl,Ol,Bl,y),o&&(x.uv=fi.getInterpolatedAttribute(o,d,p,m,y,new Qe)),l&&(x.uv1=fi.getInterpolatedAttribute(l,d,p,m,y,new Qe)),c&&(x.normal=fi.getInterpolatedAttribute(c,d,p,m,y,new H),x.normal.dot(r.direction)>0&&x.normal.multiplyScalar(-1));const g={a:d,b:p,c:m,normal:new H,materialIndex:0};fi.getNormal(Fl,Ol,Bl,g.normal),x.face=g,x.barycoord=y}return x}class yx extends Sn{constructor(e=null,t=1,r=1,o,l,c,d,p,m=yn,x=yn,y,g){super(null,c,d,p,m,x,o,l,y,g),this.isDataTexture=!0,this.image={data:e,width:t,height:r},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}const Cf=new H,Sx=new H,Mx=new ut;class Lr{constructor(e=new H(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,r,o){return this.normal.set(e,t,r),this.constant=o,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,r){const o=Cf.subVectors(r,t).cross(Sx.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(o,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t,r=!0){const o=e.delta(Cf),l=this.normal.dot(o);if(l===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;const c=-(e.start.dot(this.normal)+this.constant)/l;return r===!0&&(c<0||c>1)?null:t.copy(e.start).addScaledVector(o,c)}intersectsLine(e){const t=this.distanceToPoint(e.start),r=this.distanceToPoint(e.end);return t<0&&r>0||r<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){const r=t||Mx.getNormalMatrix(e),o=this.coplanarPoint(Cf).applyMatrix4(e),l=this.normal.applyMatrix3(r).normalize();return this.constant=-o.dot(l),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}}const os=new go,Ex=new Qe(.5,.5),Hl=new H;class Xd{constructor(e=new Lr,t=new Lr,r=new Lr,o=new Lr,l=new Lr,c=new Lr){this.planes=[e,t,r,o,l,c]}set(e,t,r,o,l,c){const d=this.planes;return d[0].copy(e),d[1].copy(t),d[2].copy(r),d[3].copy(o),d[4].copy(l),d[5].copy(c),this}copy(e){const t=this.planes;for(let r=0;r<6;r++)t[r].copy(e.planes[r]);return this}setFromProjectionMatrix(e,t=Fi,r=!1){const o=this.planes,l=e.elements,c=l[0],d=l[1],p=l[2],m=l[3],x=l[4],y=l[5],g=l[6],M=l[7],E=l[8],R=l[9],v=l[10],_=l[11],b=l[12],N=l[13],C=l[14],I=l[15];if(o[0].setComponents(m-c,M-x,_-E,I-b).normalize(),o[1].setComponents(m+c,M+x,_+E,I+b).normalize(),o[2].setComponents(m+d,M+y,_+R,I+N).normalize(),o[3].setComponents(m-d,M-y,_-R,I-N).normalize(),r)o[4].setComponents(p,g,v,C).normalize(),o[5].setComponents(m-p,M-g,_-v,I-C).normalize();else if(o[4].setComponents(m-p,M-g,_-v,I-C).normalize(),t===Fi)o[5].setComponents(m+p,M+g,_+v,I+C).normalize();else if(t===fo)o[5].setComponents(p,g,v,C).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),os.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),os.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(os)}intersectsSprite(e){os.center.set(0,0,0);const t=Ex.distanceTo(e.center);return os.radius=.7071067811865476+t,os.applyMatrix4(e.matrixWorld),this.intersectsSphere(os)}intersectsSphere(e){const t=this.planes,r=e.center,o=-e.radius;for(let l=0;l<6;l++)if(t[l].distanceToPoint(r)<o)return!1;return!0}intersectsBox(e){const t=this.planes;for(let r=0;r<6;r++){const o=t[r];if(Hl.x=o.normal.x>0?e.max.x:e.min.x,Hl.y=o.normal.y>0?e.max.y:e.min.y,Hl.z=o.normal.z>0?e.max.z:e.min.z,o.distanceToPoint(Hl)<0)return!1}return!0}containsPoint(e){const t=this.planes;for(let r=0;r<6;r++)if(t[r].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}class d_ extends kr{constructor(e){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new dt(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}}const du=new H,hu=new H,Qm=new Ut,ro=new gu,Gl=new go,bf=new H,Jm=new H;class Tx extends tn{constructor(e=new Mn,t=new d_){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,r=[0];for(let o=1,l=t.count;o<l;o++)du.fromBufferAttribute(t,o-1),hu.fromBufferAttribute(t,o),r[o]=r[o-1],r[o]+=du.distanceTo(hu);e.setAttribute("lineDistance",new an(r,1))}else rt("Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(e,t){const r=this.geometry,o=this.matrixWorld,l=e.params.Line.threshold,c=r.drawRange;if(r.boundingSphere===null&&r.computeBoundingSphere(),Gl.copy(r.boundingSphere),Gl.applyMatrix4(o),Gl.radius+=l,e.ray.intersectsSphere(Gl)===!1)return;Qm.copy(o).invert(),ro.copy(e.ray).applyMatrix4(Qm);const d=l/((this.scale.x+this.scale.y+this.scale.z)/3),p=d*d,m=this.isLineSegments?2:1,x=r.index,g=r.attributes.position;if(x!==null){const M=Math.max(0,c.start),E=Math.min(x.count,c.start+c.count);for(let R=M,v=E-1;R<v;R+=m){const _=x.getX(R),b=x.getX(R+1),N=Wl(this,e,ro,p,_,b,R);N&&t.push(N)}if(this.isLineLoop){const R=x.getX(E-1),v=x.getX(M),_=Wl(this,e,ro,p,R,v,E-1);_&&t.push(_)}}else{const M=Math.max(0,c.start),E=Math.min(g.count,c.start+c.count);for(let R=M,v=E-1;R<v;R+=m){const _=Wl(this,e,ro,p,R,R+1,R);_&&t.push(_)}if(this.isLineLoop){const R=Wl(this,e,ro,p,E-1,M,E-1);R&&t.push(R)}}}updateMorphTargets(){const t=this.geometry.morphAttributes,r=Object.keys(t);if(r.length>0){const o=t[r[0]];if(o!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let l=0,c=o.length;l<c;l++){const d=o[l].name||String(l);this.morphTargetInfluences.push(0),this.morphTargetDictionary[d]=l}}}}}function Wl(s,e,t,r,o,l,c){const d=s.geometry.attributes.position;if(du.fromBufferAttribute(d,o),hu.fromBufferAttribute(d,l),t.distanceSqToSegment(du,hu,bf,Jm)>r)return;bf.applyMatrix4(s.matrixWorld);const m=e.ray.origin.distanceTo(bf);if(!(m<e.near||m>e.far))return{distance:m,point:Jm.clone().applyMatrix4(s.matrixWorld),index:c,face:null,faceIndex:null,barycoord:null,object:s}}class h_ extends kr{constructor(e){super(),this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new dt(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}}const jm=new Ut,Ld=new gu,Xl=new go,Yl=new H;class wx extends tn{constructor(e=new Mn,t=new h_){super(),this.isPoints=!0,this.type="Points",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}raycast(e,t){const r=this.geometry,o=this.matrixWorld,l=e.params.Points.threshold,c=r.drawRange;if(r.boundingSphere===null&&r.computeBoundingSphere(),Xl.copy(r.boundingSphere),Xl.applyMatrix4(o),Xl.radius+=l,e.ray.intersectsSphere(Xl)===!1)return;jm.copy(o).invert(),Ld.copy(e.ray).applyMatrix4(jm);const d=l/((this.scale.x+this.scale.y+this.scale.z)/3),p=d*d,m=r.index,y=r.attributes.position;if(m!==null){const g=Math.max(0,c.start),M=Math.min(m.count,c.start+c.count);for(let E=g,R=M;E<R;E++){const v=m.getX(E);Yl.fromBufferAttribute(y,v),eg(Yl,v,p,o,e,t,this)}}else{const g=Math.max(0,c.start),M=Math.min(y.count,c.start+c.count);for(let E=g,R=M;E<R;E++)Yl.fromBufferAttribute(y,E),eg(Yl,E,p,o,e,t,this)}}updateMorphTargets(){const t=this.geometry.morphAttributes,r=Object.keys(t);if(r.length>0){const o=t[r[0]];if(o!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let l=0,c=o.length;l<c;l++){const d=o[l].name||String(l);this.morphTargetInfluences.push(0),this.morphTargetDictionary[d]=l}}}}}function eg(s,e,t,r,o,l,c){const d=Ld.distanceSqToPoint(s);if(d<t){const p=new H;Ld.closestPointToPoint(s,p),p.applyMatrix4(r);const m=o.ray.origin.distanceTo(p);if(m<o.near||m>o.far)return;l.push({distance:m,distanceToRay:Math.sqrt(d),point:p,index:e,face:null,faceIndex:null,barycoord:null,object:c})}}class p_ extends Sn{constructor(e=[],t=ds,r,o,l,c,d,p,m,x){super(e,t,r,o,l,c,d,p,m,x),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class Ax extends Sn{constructor(e,t,r,o,l,c,d,p,m){super(e,t,r,o,l,c,d,p,m),this.isCanvasTexture=!0,this.needsUpdate=!0}}class ha extends Sn{constructor(e,t,r=ki,o,l,c,d=yn,p=yn,m,x=sr,y=1){if(x!==sr&&x!==fs)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");const g={width:e,height:t,depth:y};super(g,o,l,c,d,p,x,r,m),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new Wd(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){const t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}}class Rx extends ha{constructor(e,t=ki,r=ds,o,l,c=yn,d=yn,p,m=sr){const x={width:e,height:e,depth:1},y=[x,x,x,x,x,x];super(e,e,t,r,o,l,c,d,p,m),this.image=y,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}}class m_ extends Sn{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}}class _o extends Mn{constructor(e=1,t=1,r=1,o=1,l=1,c=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:r,widthSegments:o,heightSegments:l,depthSegments:c};const d=this;o=Math.floor(o),l=Math.floor(l),c=Math.floor(c);const p=[],m=[],x=[],y=[];let g=0,M=0;E("z","y","x",-1,-1,r,t,e,c,l,0),E("z","y","x",1,-1,r,t,-e,c,l,1),E("x","z","y",1,1,e,r,t,o,c,2),E("x","z","y",1,-1,e,r,-t,o,c,3),E("x","y","z",1,-1,e,t,r,o,l,4),E("x","y","z",-1,-1,e,t,-r,o,l,5),this.setIndex(p),this.setAttribute("position",new an(m,3)),this.setAttribute("normal",new an(x,3)),this.setAttribute("uv",new an(y,2));function E(R,v,_,b,N,C,I,P,O,T,D){const z=C/O,k=I/T,K=C/2,ce=I/2,me=P/2,Q=O+1,ue=T+1;let $=0,Y=0;const ae=new H;for(let oe=0;oe<ue;oe++){const F=oe*k-ce;for(let Z=0;Z<Q;Z++){const Ne=Z*z-K;ae[R]=Ne*b,ae[v]=F*N,ae[_]=me,m.push(ae.x,ae.y,ae.z),ae[R]=0,ae[v]=0,ae[_]=P>0?1:-1,x.push(ae.x,ae.y,ae.z),y.push(Z/O),y.push(1-oe/T),$+=1}}for(let oe=0;oe<T;oe++)for(let F=0;F<O;F++){const Z=g+F+Q*oe,Ne=g+F+Q*(oe+1),qe=g+(F+1)+Q*(oe+1),ke=g+(F+1)+Q*oe;p.push(Z,Ne,ke),p.push(Ne,qe,ke),Y+=6}d.addGroup(M,Y,D),M+=Y,g+=$}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new _o(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}class Yd extends Mn{constructor(e=[],t=[],r=1,o=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:e,indices:t,radius:r,detail:o};const l=[],c=[];d(o),m(r),x(),this.setAttribute("position",new an(l,3)),this.setAttribute("normal",new an(l.slice(),3)),this.setAttribute("uv",new an(c,2)),o===0?this.computeVertexNormals():this.normalizeNormals();function d(b){const N=new H,C=new H,I=new H;for(let P=0;P<t.length;P+=3)M(t[P+0],N),M(t[P+1],C),M(t[P+2],I),p(N,C,I,b)}function p(b,N,C,I){const P=I+1,O=[];for(let T=0;T<=P;T++){O[T]=[];const D=b.clone().lerp(C,T/P),z=N.clone().lerp(C,T/P),k=P-T;for(let K=0;K<=k;K++)K===0&&T===P?O[T][K]=D:O[T][K]=D.clone().lerp(z,K/k)}for(let T=0;T<P;T++)for(let D=0;D<2*(P-T)-1;D++){const z=Math.floor(D/2);D%2===0?(g(O[T][z+1]),g(O[T+1][z]),g(O[T][z])):(g(O[T][z+1]),g(O[T+1][z+1]),g(O[T+1][z]))}}function m(b){const N=new H;for(let C=0;C<l.length;C+=3)N.x=l[C+0],N.y=l[C+1],N.z=l[C+2],N.normalize().multiplyScalar(b),l[C+0]=N.x,l[C+1]=N.y,l[C+2]=N.z}function x(){const b=new H;for(let N=0;N<l.length;N+=3){b.x=l[N+0],b.y=l[N+1],b.z=l[N+2];const C=v(b)/2/Math.PI+.5,I=_(b)/Math.PI+.5;c.push(C,1-I)}E(),y()}function y(){for(let b=0;b<c.length;b+=6){const N=c[b+0],C=c[b+2],I=c[b+4],P=Math.max(N,C,I),O=Math.min(N,C,I);P>.9&&O<.1&&(N<.2&&(c[b+0]+=1),C<.2&&(c[b+2]+=1),I<.2&&(c[b+4]+=1))}}function g(b){l.push(b.x,b.y,b.z)}function M(b,N){const C=b*3;N.x=e[C+0],N.y=e[C+1],N.z=e[C+2]}function E(){const b=new H,N=new H,C=new H,I=new H,P=new Qe,O=new Qe,T=new Qe;for(let D=0,z=0;D<l.length;D+=9,z+=6){b.set(l[D+0],l[D+1],l[D+2]),N.set(l[D+3],l[D+4],l[D+5]),C.set(l[D+6],l[D+7],l[D+8]),P.set(c[z+0],c[z+1]),O.set(c[z+2],c[z+3]),T.set(c[z+4],c[z+5]),I.copy(b).add(N).add(C).divideScalar(3);const k=v(I);R(P,z+0,b,k),R(O,z+2,N,k),R(T,z+4,C,k)}}function R(b,N,C,I){I<0&&b.x===1&&(c[N]=b.x-1),C.x===0&&C.z===0&&(c[N]=I/2/Math.PI+.5)}function v(b){return Math.atan2(b.z,-b.x)}function _(b){return Math.atan2(-b.y,Math.sqrt(b.x*b.x+b.z*b.z))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Yd(e.vertices,e.indices,e.radius,e.detail)}}class qd extends Yd{constructor(e=1,t=0){const r=[1,0,0,-1,0,0,0,1,0,0,-1,0,0,0,1,0,0,-1],o=[0,2,4,0,4,3,0,3,5,0,5,2,1,2,5,1,5,3,1,3,4,1,4,2];super(r,o,e,t),this.type="OctahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new qd(e.radius,e.detail)}}class _u extends Mn{constructor(e=1,t=1,r=1,o=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:r,heightSegments:o};const l=e/2,c=t/2,d=Math.floor(r),p=Math.floor(o),m=d+1,x=p+1,y=e/d,g=t/p,M=[],E=[],R=[],v=[];for(let _=0;_<x;_++){const b=_*g-c;for(let N=0;N<m;N++){const C=N*y-l;E.push(C,-b,0),R.push(0,0,1),v.push(N/d),v.push(1-_/p)}}for(let _=0;_<p;_++)for(let b=0;b<d;b++){const N=b+m*_,C=b+m*(_+1),I=b+1+m*(_+1),P=b+1+m*_;M.push(N,C,P),M.push(C,I,P)}this.setIndex(M),this.setAttribute("position",new an(E,3)),this.setAttribute("normal",new an(R,3)),this.setAttribute("uv",new an(v,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new _u(e.width,e.height,e.widthSegments,e.heightSegments)}}class Kd extends Mn{constructor(e=.5,t=1,r=32,o=1,l=0,c=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:e,outerRadius:t,thetaSegments:r,phiSegments:o,thetaStart:l,thetaLength:c},r=Math.max(3,r),o=Math.max(1,o);const d=[],p=[],m=[],x=[];let y=e;const g=(t-e)/o,M=new H,E=new Qe;for(let R=0;R<=o;R++){for(let v=0;v<=r;v++){const _=l+v/r*c;M.x=y*Math.cos(_),M.y=y*Math.sin(_),p.push(M.x,M.y,M.z),m.push(0,0,1),E.x=(M.x/t+1)/2,E.y=(M.y/t+1)/2,x.push(E.x,E.y)}y+=g}for(let R=0;R<o;R++){const v=R*(r+1);for(let _=0;_<r;_++){const b=_+v,N=b,C=b+r+1,I=b+r+2,P=b+1;d.push(N,C,P),d.push(C,I,P)}}this.setIndex(d),this.setAttribute("position",new an(p,3)),this.setAttribute("normal",new an(m,3)),this.setAttribute("uv",new an(x,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Kd(e.innerRadius,e.outerRadius,e.thetaSegments,e.phiSegments,e.thetaStart,e.thetaLength)}}class po extends Mn{constructor(e=1,t=32,r=16,o=0,l=Math.PI*2,c=0,d=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:r,phiStart:o,phiLength:l,thetaStart:c,thetaLength:d},t=Math.max(3,Math.floor(t)),r=Math.max(2,Math.floor(r));const p=Math.min(c+d,Math.PI);let m=0;const x=[],y=new H,g=new H,M=[],E=[],R=[],v=[];for(let _=0;_<=r;_++){const b=[],N=_/r,C=c+N*d,I=e*Math.cos(C),P=Math.sqrt(e*e-I*I);let O=0;_===0&&c===0?O=.5/t:_===r&&p===Math.PI&&(O=-.5/t);for(let T=0;T<=t;T++){const D=T/t,z=o+D*l;y.x=-P*Math.cos(z),y.y=I,y.z=P*Math.sin(z),E.push(y.x,y.y,y.z),g.copy(y).normalize(),R.push(g.x,g.y,g.z),v.push(D+O,1-N),b.push(m++)}x.push(b)}for(let _=0;_<r;_++)for(let b=0;b<t;b++){const N=x[_][b+1],C=x[_][b],I=x[_+1][b],P=x[_+1][b+1];(_!==0||c>0)&&M.push(N,C,P),(_!==r-1||p<Math.PI)&&M.push(C,I,P)}this.setIndex(M),this.setAttribute("position",new an(E,3)),this.setAttribute("normal",new an(R,3)),this.setAttribute("uv",new an(v,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new po(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}}function pa(s){const e={};for(const t in s){e[t]={};for(const r in s[t]){const o=s[t][r];if(tg(o))o.isRenderTargetTexture?(rt("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][r]=null):e[t][r]=o.clone();else if(Array.isArray(o))if(tg(o[0])){const l=[];for(let c=0,d=o.length;c<d;c++)l[c]=o[c].clone();e[t][r]=l}else e[t][r]=o.slice();else e[t][r]=o}}return e}function Un(s){const e={};for(let t=0;t<s.length;t++){const r=pa(s[t]);for(const o in r)e[o]=r[o]}return e}function tg(s){return s&&(s.isColor||s.isMatrix3||s.isMatrix4||s.isVector2||s.isVector3||s.isVector4||s.isTexture||s.isQuaternion)}function Cx(s){const e=[];for(let t=0;t<s.length;t++)e.push(s[t].clone());return e}function g_(s){const e=s.getRenderTarget();return e===null?s.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:vt.workingColorSpace}const bx={clone:pa,merge:Un};var Px=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Lx=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class zi extends kr{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Px,this.fragmentShader=Lx,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=pa(e.uniforms),this.uniformsGroups=Cx(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){const t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(const o in this.uniforms){const c=this.uniforms[o].value;c&&c.isTexture?t.uniforms[o]={type:"t",value:c.toJSON(e).uuid}:c&&c.isColor?t.uniforms[o]={type:"c",value:c.getHex()}:c&&c.isVector2?t.uniforms[o]={type:"v2",value:c.toArray()}:c&&c.isVector3?t.uniforms[o]={type:"v3",value:c.toArray()}:c&&c.isVector4?t.uniforms[o]={type:"v4",value:c.toArray()}:c&&c.isMatrix3?t.uniforms[o]={type:"m3",value:c.toArray()}:c&&c.isMatrix4?t.uniforms[o]={type:"m4",value:c.toArray()}:t.uniforms[o]={value:c}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;const r={};for(const o in this.extensions)this.extensions[o]===!0&&(r[o]=!0);return Object.keys(r).length>0&&(t.extensions=r),t}fromJSON(e,t){if(super.fromJSON(e,t),e.uniforms!==void 0)for(const r in e.uniforms){const o=e.uniforms[r];switch(this.uniforms[r]={},o.type){case"t":this.uniforms[r].value=t[o.value]||null;break;case"c":this.uniforms[r].value=new dt().setHex(o.value);break;case"v2":this.uniforms[r].value=new Qe().fromArray(o.value);break;case"v3":this.uniforms[r].value=new H().fromArray(o.value);break;case"v4":this.uniforms[r].value=new Zt().fromArray(o.value);break;case"m3":this.uniforms[r].value=new ut().fromArray(o.value);break;case"m4":this.uniforms[r].value=new Ut().fromArray(o.value);break;default:this.uniforms[r].value=o.value}}if(e.defines!==void 0&&(this.defines=e.defines),e.vertexShader!==void 0&&(this.vertexShader=e.vertexShader),e.fragmentShader!==void 0&&(this.fragmentShader=e.fragmentShader),e.glslVersion!==void 0&&(this.glslVersion=e.glslVersion),e.extensions!==void 0)for(const r in e.extensions)this.extensions[r]=e.extensions[r];return e.lights!==void 0&&(this.lights=e.lights),e.clipping!==void 0&&(this.clipping=e.clipping),this}}class Dx extends zi{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}}class Nx extends kr{constructor(e){super(),this.isMeshPhongMaterial=!0,this.type="MeshPhongMaterial",this.color=new dt(16777215),this.specular=new dt(1118481),this.shininess=30,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new dt(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Cd,this.normalScale=new Qe(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Or,this.combine=Ud,this.reflectivity=1,this.envMapIntensity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.specular.copy(e.specular),this.shininess=e.shininess,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.envMapIntensity=e.envMapIntensity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class Ix extends kr{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=kv,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class Ux extends kr{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}const Pf={enabled:!1,files:{},add:function(s,e){this.enabled!==!1&&(ng(s)||(this.files[s]=e))},get:function(s){if(this.enabled!==!1&&!ng(s))return this.files[s]},remove:function(s){delete this.files[s]},clear:function(){this.files={}}};function ng(s){try{const e=s.slice(s.indexOf(":")+1);return new URL(e).protocol==="blob:"}catch{return!1}}class Fx{constructor(e,t,r){const o=this;let l=!1,c=0,d=0,p;const m=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=r,this._abortController=null,this.itemStart=function(x){d++,l===!1&&o.onStart!==void 0&&o.onStart(x,c,d),l=!0},this.itemEnd=function(x){c++,o.onProgress!==void 0&&o.onProgress(x,c,d),c===d&&(l=!1,o.onLoad!==void 0&&o.onLoad())},this.itemError=function(x){o.onError!==void 0&&o.onError(x)},this.resolveURL=function(x){return x=x.normalize("NFC"),p?p(x):x},this.setURLModifier=function(x){return p=x,this},this.addHandler=function(x,y){return m.push(x,y),this},this.removeHandler=function(x){const y=m.indexOf(x);return y!==-1&&m.splice(y,2),this},this.getHandler=function(x){for(let y=0,g=m.length;y<g;y+=2){const M=m[y],E=m[y+1];if(M.global&&(M.lastIndex=0),M.test(x))return E}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||(this._abortController=new AbortController),this._abortController}}const Ox=new Fx;class $d{constructor(e){this.manager=e!==void 0?e:Ox,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(e,t){const r=this;return new Promise(function(o,l){r.load(e,o,t,l)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}abort(){return this}}$d.DEFAULT_MATERIAL_NAME="__DEFAULT";const js=new WeakMap;class Bx extends $d{constructor(e){super(e)}load(e,t,r,o){this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const l=this,c=Pf.get(`image:${e}`);if(c!==void 0){if(c.complete===!0)l.manager.itemStart(e),setTimeout(function(){t&&t(c),l.manager.itemEnd(e)},0);else{let y=js.get(c);y===void 0&&(y=[],js.set(c,y)),y.push({onLoad:t,onError:o})}return c}const d=ho("img");function p(){x(),t&&t(this);const y=js.get(this)||[];for(let g=0;g<y.length;g++){const M=y[g];M.onLoad&&M.onLoad(this)}js.delete(this),l.manager.itemEnd(e)}function m(y){x(),o&&o(y),Pf.remove(`image:${e}`);const g=js.get(this)||[];for(let M=0;M<g.length;M++){const E=g[M];E.onError&&E.onError(y)}js.delete(this),l.manager.itemError(e),l.manager.itemEnd(e)}function x(){d.removeEventListener("load",p,!1),d.removeEventListener("error",m,!1)}return d.addEventListener("load",p,!1),d.addEventListener("error",m,!1),e.slice(0,5)!=="data:"&&this.crossOrigin!==void 0&&(d.crossOrigin=this.crossOrigin),Pf.add(`image:${e}`,d),l.manager.itemStart(e),d.src=e,d}}class kx extends $d{constructor(e){super(e)}load(e,t,r,o){const l=new Sn,c=new Bx(this.manager);return c.setCrossOrigin(this.crossOrigin),c.setPath(this.path),c.load(e,function(d){l.image=d,l.needsUpdate=!0,t!==void 0&&t(l)},r,o),l}}class __ extends tn{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new dt(e),this.intensity=t}dispose(){this.dispatchEvent({type:"dispose"})}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){const t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,t}}class zx extends __{constructor(e,t,r){super(e,r),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(tn.DEFAULT_UP),this.updateMatrix(),this.groundColor=new dt(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}toJSON(e){const t=super.toJSON(e);return t.object.groundColor=this.groundColor.getHex(),t}}const Lf=new Ut,ig=new H,rg=new H;class Vx{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new Qe(512,512),this.mapType=ei,this.map=null,this.mapPass=null,this.matrix=new Ut,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Xd,this._frameExtents=new Qe(1,1),this._viewportCount=1,this._viewports=[new Zt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){const t=this.camera,r=this.matrix;ig.setFromMatrixPosition(e.matrixWorld),t.position.copy(ig),rg.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(rg),t.updateMatrixWorld(),Lf.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Lf,t.coordinateSystem,t.reversedDepth),t.coordinateSystem===fo||t.reversedDepth?r.set(.5,0,0,.5,0,.5,0,.5,0,0,1,0,0,0,0,1):r.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),r.multiply(Lf)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this.biasNode=e.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){const e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}}const ql=new H,Kl=new Fr,Pi=new H;class v_ extends tn{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Ut,this.projectionMatrix=new Ut,this.projectionMatrixInverse=new Ut,this.coordinateSystem=Fi,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorld.decompose(ql,Kl,Pi),Pi.x===1&&Pi.y===1&&Pi.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(ql,Kl,Pi.set(1,1,1)).invert()}updateWorldMatrix(e,t,r=!1){super.updateWorldMatrix(e,t,r),this.matrixWorld.decompose(ql,Kl,Pi),Pi.x===1&&Pi.y===1&&Pi.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(ql,Kl,Pi.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}}const Pr=new H,sg=new Qe,ag=new Qe;class ci extends v_{constructor(e=50,t=1,r=.1,o=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=r,this.far=o,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const t=.5*this.getFilmHeight()/e;this.fov=Pd*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(iu*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return Pd*2*Math.atan(Math.tan(iu*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,r){Pr.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(Pr.x,Pr.y).multiplyScalar(-e/Pr.z),Pr.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),r.set(Pr.x,Pr.y).multiplyScalar(-e/Pr.z)}getViewSize(e,t){return this.getViewBounds(e,sg,ag),t.subVectors(ag,sg)}setViewOffset(e,t,r,o,l,c){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=r,this.view.offsetY=o,this.view.width=l,this.view.height=c,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let t=e*Math.tan(iu*.5*this.fov)/this.zoom,r=2*t,o=this.aspect*r,l=-.5*o;const c=this.view;if(this.view!==null&&this.view.enabled){const p=c.fullWidth,m=c.fullHeight;l+=c.offsetX*o/p,t-=c.offsetY*r/m,o*=c.width/p,r*=c.height/m}const d=this.filmOffset;d!==0&&(l+=e*d/this.getFilmWidth()),this.projectionMatrix.makePerspective(l,l+o,t,t-r,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}}class Zd extends v_{constructor(e=-1,t=1,r=1,o=-1,l=.1,c=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=r,this.bottom=o,this.near=l,this.far=c,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,r,o,l,c){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=r,this.view.offsetY=o,this.view.width=l,this.view.height=c,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),r=(this.right+this.left)/2,o=(this.top+this.bottom)/2;let l=r-e,c=r+e,d=o+t,p=o-t;if(this.view!==null&&this.view.enabled){const m=(this.right-this.left)/this.view.fullWidth/this.zoom,x=(this.top-this.bottom)/this.view.fullHeight/this.zoom;l+=m*this.view.offsetX,c=l+m*this.view.width,d-=x*this.view.offsetY,p=d-x*this.view.height}this.projectionMatrix.makeOrthographic(l,c,d,p,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}}class Hx extends Vx{constructor(){super(new Zd(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class Gx extends __{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(tn.DEFAULT_UP),this.updateMatrix(),this.target=new tn,this.shadow=new Hx}dispose(){super.dispose(),this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}toJSON(e){const t=super.toJSON(e);return t.object.shadow=this.shadow.toJSON(),t.object.target=this.target.uuid,t}}const ea=-90,ta=1;class Wx extends tn{constructor(e,t,r){super(),this.type="CubeCamera",this.renderTarget=r,this.coordinateSystem=null,this.activeMipmapLevel=0;const o=new ci(ea,ta,e,t);o.layers=this.layers,this.add(o);const l=new ci(ea,ta,e,t);l.layers=this.layers,this.add(l);const c=new ci(ea,ta,e,t);c.layers=this.layers,this.add(c);const d=new ci(ea,ta,e,t);d.layers=this.layers,this.add(d);const p=new ci(ea,ta,e,t);p.layers=this.layers,this.add(p);const m=new ci(ea,ta,e,t);m.layers=this.layers,this.add(m)}updateCoordinateSystem(){const e=this.coordinateSystem,t=this.children.concat(),[r,o,l,c,d,p]=t;for(const m of t)this.remove(m);if(e===Fi)r.up.set(0,1,0),r.lookAt(1,0,0),o.up.set(0,1,0),o.lookAt(-1,0,0),l.up.set(0,0,-1),l.lookAt(0,1,0),c.up.set(0,0,1),c.lookAt(0,-1,0),d.up.set(0,1,0),d.lookAt(0,0,1),p.up.set(0,1,0),p.lookAt(0,0,-1);else if(e===fo)r.up.set(0,-1,0),r.lookAt(-1,0,0),o.up.set(0,-1,0),o.lookAt(1,0,0),l.up.set(0,0,1),l.lookAt(0,1,0),c.up.set(0,0,-1),c.lookAt(0,-1,0),d.up.set(0,-1,0),d.lookAt(0,0,1),p.up.set(0,-1,0),p.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const m of t)this.add(m),m.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();const{renderTarget:r,activeMipmapLevel:o}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[l,c,d,p,m,x]=this.children,y=e.getRenderTarget(),g=e.getActiveCubeFace(),M=e.getActiveMipmapLevel(),E=e.xr.enabled;e.xr.enabled=!1;const R=r.texture.generateMipmaps;r.texture.generateMipmaps=!1;let v=!1;e.isWebGLRenderer===!0?v=e.state.buffers.depth.getReversed():v=e.reversedDepthBuffer,e.setRenderTarget(r,0,o),v&&e.autoClear===!1&&e.clearDepth(),e.render(t,l),e.setRenderTarget(r,1,o),v&&e.autoClear===!1&&e.clearDepth(),e.render(t,c),e.setRenderTarget(r,2,o),v&&e.autoClear===!1&&e.clearDepth(),e.render(t,d),e.setRenderTarget(r,3,o),v&&e.autoClear===!1&&e.clearDepth(),e.render(t,p),e.setRenderTarget(r,4,o),v&&e.autoClear===!1&&e.clearDepth(),e.render(t,m),r.texture.generateMipmaps=R,e.setRenderTarget(r,5,o),v&&e.autoClear===!1&&e.clearDepth(),e.render(t,x),e.setRenderTarget(y,g,M),e.xr.enabled=E,r.texture.needsPMREMUpdate=!0}}class Xx extends ci{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}}class og{constructor(e=1,t=0,r=0){this.radius=e,this.phi=t,this.theta=r}set(e,t,r){return this.radius=e,this.phi=t,this.theta=r,this}copy(e){return this.radius=e.radius,this.phi=e.phi,this.theta=e.theta,this}makeSafe(){return this.phi=gt(this.phi,1e-6,Math.PI-1e-6),this}setFromVector3(e){return this.setFromCartesianCoords(e.x,e.y,e.z)}setFromCartesianCoords(e,t,r){return this.radius=Math.sqrt(e*e+t*t+r*r),this.radius===0?(this.theta=0,this.phi=0):(this.theta=Math.atan2(e,r),this.phi=Math.acos(gt(t/this.radius,-1,1))),this}clone(){return new this.constructor().copy(this)}}const rh=class rh{constructor(e,t,r,o){this.elements=[1,0,0,1],e!==void 0&&this.set(e,t,r,o)}identity(){return this.set(1,0,0,1),this}fromArray(e,t=0){for(let r=0;r<4;r++)this.elements[r]=e[r+t];return this}set(e,t,r,o){const l=this.elements;return l[0]=e,l[2]=t,l[1]=r,l[3]=o,this}};rh.prototype.isMatrix2=!0;let lg=rh;class Yx extends Br{constructor(e,t=null){super(),this.object=e,this.domElement=t,this.enabled=!0,this.state=-1,this.keys={},this.mouseButtons={LEFT:null,MIDDLE:null,RIGHT:null},this.touches={ONE:null,TWO:null}}connect(e){if(e===void 0){rt("Controls: connect() now requires an element.");return}this.domElement!==null&&this.disconnect(),this.domElement=e}disconnect(){}dispose(){}update(){}}function ug(s,e,t,r){const o=qx(r);switch(t){case t_:return s*e;case i_:return s*e/o.components*o.byteLength;case kd:return s*e/o.components*o.byteLength;case hs:return s*e*2/o.components*o.byteLength;case zd:return s*e*2/o.components*o.byteLength;case n_:return s*e*3/o.components*o.byteLength;case Ei:return s*e*4/o.components*o.byteLength;case Vd:return s*e*4/o.components*o.byteLength;case jl:case eu:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*8;case tu:case nu:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*16;case jf:case td:return Math.max(s,16)*Math.max(e,8)/4;case Jf:case ed:return Math.max(s,8)*Math.max(e,8)/2;case nd:case id:case sd:case ad:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*8;case rd:case au:case od:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*16;case ld:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*16;case ud:return Math.floor((s+4)/5)*Math.floor((e+3)/4)*16;case cd:return Math.floor((s+4)/5)*Math.floor((e+4)/5)*16;case fd:return Math.floor((s+5)/6)*Math.floor((e+4)/5)*16;case dd:return Math.floor((s+5)/6)*Math.floor((e+5)/6)*16;case hd:return Math.floor((s+7)/8)*Math.floor((e+4)/5)*16;case pd:return Math.floor((s+7)/8)*Math.floor((e+5)/6)*16;case md:return Math.floor((s+7)/8)*Math.floor((e+7)/8)*16;case gd:return Math.floor((s+9)/10)*Math.floor((e+4)/5)*16;case _d:return Math.floor((s+9)/10)*Math.floor((e+5)/6)*16;case vd:return Math.floor((s+9)/10)*Math.floor((e+7)/8)*16;case xd:return Math.floor((s+9)/10)*Math.floor((e+9)/10)*16;case yd:return Math.floor((s+11)/12)*Math.floor((e+9)/10)*16;case Sd:return Math.floor((s+11)/12)*Math.floor((e+11)/12)*16;case Md:case Ed:case Td:return Math.ceil(s/4)*Math.ceil(e/4)*16;case wd:case Ad:return Math.ceil(s/4)*Math.ceil(e/4)*8;case ou:case Rd:return Math.ceil(s/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function qx(s){switch(s){case ei:case Qg:return{byteLength:1,components:1};case uo:case Jg:case rr:return{byteLength:2,components:1};case Od:case Bd:return{byteLength:2,components:4};case ki:case Fd:case Ui:return{byteLength:4,components:1};case jg:case e_:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${s}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:Id}}));typeof window<"u"&&(window.__THREE__?rt("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=Id);/**
 * @license
 * Copyright 2010-2026 Three.js Authors
 * SPDX-License-Identifier: MIT
 */function x_(){let s=null,e=!1,t=null,r=null;function o(l,c){t(l,c),r=s.requestAnimationFrame(o)}return{start:function(){e!==!0&&t!==null&&s!==null&&(r=s.requestAnimationFrame(o),e=!0)},stop:function(){s!==null&&s.cancelAnimationFrame(r),e=!1},setAnimationLoop:function(l){t=l},setContext:function(l){s=l}}}function Kx(s){const e=new WeakMap;function t(d,p){const m=d.array,x=d.usage,y=m.byteLength,g=s.createBuffer();s.bindBuffer(p,g),s.bufferData(p,m,x),d.onUploadCallback();let M;if(m instanceof Float32Array)M=s.FLOAT;else if(typeof Float16Array<"u"&&m instanceof Float16Array)M=s.HALF_FLOAT;else if(m instanceof Uint16Array)d.isFloat16BufferAttribute?M=s.HALF_FLOAT:M=s.UNSIGNED_SHORT;else if(m instanceof Int16Array)M=s.SHORT;else if(m instanceof Uint32Array)M=s.UNSIGNED_INT;else if(m instanceof Int32Array)M=s.INT;else if(m instanceof Int8Array)M=s.BYTE;else if(m instanceof Uint8Array)M=s.UNSIGNED_BYTE;else if(m instanceof Uint8ClampedArray)M=s.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+m);return{buffer:g,type:M,bytesPerElement:m.BYTES_PER_ELEMENT,version:d.version,size:y}}function r(d,p,m){const x=p.array,y=p.updateRanges;if(s.bindBuffer(m,d),y.length===0)s.bufferSubData(m,0,x);else{y.sort((M,E)=>M.start-E.start);let g=0;for(let M=1;M<y.length;M++){const E=y[g],R=y[M];R.start<=E.start+E.count+1?E.count=Math.max(E.count,R.start+R.count-E.start):(++g,y[g]=R)}y.length=g+1;for(let M=0,E=y.length;M<E;M++){const R=y[M];s.bufferSubData(m,R.start*x.BYTES_PER_ELEMENT,x,R.start,R.count)}p.clearUpdateRanges()}p.onUploadCallback()}function o(d){return d.isInterleavedBufferAttribute&&(d=d.data),e.get(d)}function l(d){d.isInterleavedBufferAttribute&&(d=d.data);const p=e.get(d);p&&(s.deleteBuffer(p.buffer),e.delete(d))}function c(d,p){if(d.isInterleavedBufferAttribute&&(d=d.data),d.isGLBufferAttribute){const x=e.get(d);(!x||x.version<d.version)&&e.set(d,{buffer:d.buffer,type:d.type,bytesPerElement:d.elementSize,version:d.version});return}const m=e.get(d);if(m===void 0)e.set(d,t(d,p));else if(m.version<d.version){if(m.size!==d.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");r(m.buffer,d,p),m.version=d.version}}return{get:o,remove:l,update:c}}var $x=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Zx=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,Qx=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Jx=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,jx=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,ey=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,ty=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,ny=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,iy=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec4 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 );
	}
#endif`,ry=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,sy=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,ay=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,oy=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,ly=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,uy=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,cy=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,fy=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,dy=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,hy=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,py=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,my=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,gy=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,_y=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec4( 1.0 );
#endif
#ifdef USE_COLOR_ALPHA
	vColor *= color;
#elif defined( USE_COLOR )
	vColor.rgb *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.rgb *= instanceColor.rgb;
#endif
#ifdef USE_BATCHING_COLOR
	vColor *= getBatchingColor( getIndirectIndex( gl_DrawID ) );
#endif`,vy=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
#define inverseTransformDirection transformDirectionByInverseViewMatrix
vec3 transformNormalByInverseViewMatrix( in vec3 normal, in mat4 viewMatrix ) {
	return normalize( ( vec4( normal, 0.0 ) * viewMatrix ).xyz );
}
vec3 transformDirectionByInverseViewMatrix( in vec3 dir, in mat4 viewMatrix ) {
	return normalize( ( vec4( dir, 0.0 ) * viewMatrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,xy=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,yy=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
#endif`,Sy=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,My=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Ey=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,Ty=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,wy="gl_FragColor = linearToOutputTexel( gl_FragColor );",Ay=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,Ry=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * reflectVec );
		#ifdef ENVMAP_BLENDING_MULTIPLY
			outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_MIX )
			outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_ADD )
			outgoingLight += envColor.xyz * specularStrength * reflectivity;
		#endif
	#endif
#endif`,Cy=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,by=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,Py=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,Ly=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,Dy=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,Ny=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,Iy=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,Uy=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,Fy=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,Oy=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,By=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,ky=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,zy=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif
#include <lightprobes_pars_fragment>`,Vy=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = transformDirectionByInverseViewMatrix( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,Hy=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,Gy=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,Wy=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,Xy=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,Yy=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,qy=`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
		vec3 iridescenceFresnelDielectric;
		vec3 iridescenceFresnelMetallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		return 0.5 / max( gv + gl, EPSILON );
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
vec3 BRDF_GGX_Multiscatter( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 singleScatter = BRDF_GGX( lightDir, viewDir, normal, material );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 dfgV = texture2D( dfgLUT, vec2( material.roughness, dotNV ) ).rg;
	vec2 dfgL = texture2D( dfgLUT, vec2( material.roughness, dotNL ) ).rg;
	vec3 FssEss_V = material.specularColorBlended * dfgV.x + material.specularF90 * dfgV.y;
	vec3 FssEss_L = material.specularColorBlended * dfgL.x + material.specularF90 * dfgL.y;
	float Ess_V = dfgV.x + dfgV.y;
	float Ess_L = dfgL.x + dfgL.y;
	float Ems_V = 1.0 - Ess_V;
	float Ems_L = 1.0 - Ess_L;
	vec3 Favg = material.specularColorBlended + ( 1.0 - material.specularColorBlended ) * 0.047619;
	vec3 Fms = FssEss_V * FssEss_L * Favg / ( 1.0 - Ems_V * Ems_L * Favg + EPSILON );
	float compensationFactor = Ems_V * Ems_L;
	vec3 multiScatter = Fms * compensationFactor;
	return singleScatter + multiScatter;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
		#ifdef USE_CLEARCOAT
			vec3 Ncc = geometryClearcoatNormal;
			vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );
			vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );
			vec4 t2Clearcoat = texture2D( ltc_2, uvClearcoat );
			mat3 mInvClearcoat = mat3(
				vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),
				vec3(             0, 1,             0 ),
				vec3( t1Clearcoat.z, 0, t1Clearcoat.w )
			);
			vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;
			clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_Evaluate( Ncc, viewDir, position, mInvClearcoat, rectCoords );
		#endif
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
 
 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX_Multiscatter( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseContribution );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution );
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnelDielectric, material.roughness, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceFresnelMetallic, material.roughness, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( geometryNormal, geometryViewDir, material.diffuseColor, material.specularF90, material.roughness, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,Ky=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( material.iridescenceFresnelDielectric, material.iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
	#ifdef USE_LIGHT_PROBES_GRID
		vec3 probeWorldPos = ( ( vec4( geometryPosition, 1.0 ) - viewMatrix[ 3 ] ) * viewMatrix ).xyz;
		vec3 probeWorldNormal = transformNormalByInverseViewMatrix( geometryNormal, viewMatrix );
		irradiance += getLightProbeGridIrradiance( probeWorldPos, probeWorldNormal );
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,$y=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_CUBE_UV )
		#if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )
			iblIrradiance += getIBLIrradiance( geometryNormal );
		#endif
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,Zy=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,Qy=`#ifdef USE_LIGHT_PROBES_GRID
uniform highp sampler3D probesSH;
uniform vec3 probesMin;
uniform vec3 probesMax;
uniform vec3 probesResolution;
vec3 getLightProbeGridIrradiance( vec3 worldPos, vec3 worldNormal ) {
	vec3 res = probesResolution;
	vec3 gridRange = probesMax - probesMin;
	vec3 resMinusOne = res - 1.0;
	vec3 probeSpacing = gridRange / resMinusOne;
	vec3 samplePos = worldPos + worldNormal * probeSpacing * 0.5;
	vec3 uvw = clamp( ( samplePos - probesMin ) / gridRange, 0.0, 1.0 );
	uvw = uvw * resMinusOne / res + 0.5 / res;
	float nz          = res.z;
	float paddedSlices = nz + 2.0;
	float atlasDepth  = 7.0 * paddedSlices;
	float uvZBase     = uvw.z * nz + 1.0;
	vec4 s0 = texture( probesSH, vec3( uvw.xy, ( uvZBase                       ) / atlasDepth ) );
	vec4 s1 = texture( probesSH, vec3( uvw.xy, ( uvZBase +       paddedSlices   ) / atlasDepth ) );
	vec4 s2 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 2.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s3 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 3.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s4 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 4.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s5 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 5.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s6 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 6.0 * paddedSlices   ) / atlasDepth ) );
	vec3 c0 = s0.xyz;
	vec3 c1 = vec3( s0.w, s1.xy );
	vec3 c2 = vec3( s1.zw, s2.x );
	vec3 c3 = s2.yzw;
	vec3 c4 = s3.xyz;
	vec3 c5 = vec3( s3.w, s4.xy );
	vec3 c6 = vec3( s4.zw, s5.x );
	vec3 c7 = s5.yzw;
	vec3 c8 = s6.xyz;
	float x = worldNormal.x, y = worldNormal.y, z = worldNormal.z;
	vec3 result = c0 * 0.886227;
	result += c1 * 2.0 * 0.511664 * y;
	result += c2 * 2.0 * 0.511664 * z;
	result += c3 * 2.0 * 0.511664 * x;
	result += c4 * 2.0 * 0.429043 * x * y;
	result += c5 * 2.0 * 0.429043 * y * z;
	result += c6 * ( 0.743125 * z * z - 0.247708 );
	result += c7 * 2.0 * 0.429043 * x * z;
	result += c8 * 0.429043 * ( x * x - y * y );
	return max( result, vec3( 0.0 ) );
}
#endif`,Jy=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,jy=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,eS=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,tS=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,nS=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,iS=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,rS=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,sS=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,aS=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,oS=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,lS=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,uS=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,cS=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,fS=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,dS=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,hS=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#ifdef DOUBLE_SIDED
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#ifdef DOUBLE_SIDED
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,pS=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#if defined( USE_PACKED_NORMALMAP )
		mapN = vec3( mapN.xy, sqrt( saturate( 1.0 - dot( mapN.xy, mapN.xy ) ) ) );
	#endif
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,mS=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,gS=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,_S=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,vS=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,xS=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,yS=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,SS=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,MS=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,ES=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,TS=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	#ifdef USE_REVERSED_DEPTH_BUFFER
	
		return depth * ( far - near ) - far;
	#else
		return depth * ( near - far ) - near;
	#endif
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	
	#ifdef USE_REVERSED_DEPTH_BUFFER
		return ( near * far ) / ( ( near - far ) * depth - near );
	#else
		return ( near * far ) / ( ( far - near ) * depth - far );
	#endif
}`,wS=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,AS=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,RS=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,CS=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,bS=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,PS=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,LS=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			shadowCoord.z += shadowBias;
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				float radius = shadowRadius * texelSize.x;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			#ifdef USE_REVERSED_DEPTH_BUFFER
				float dp = ( shadowCameraNear * ( shadowCameraFar - viewSpaceZ ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp -= shadowBias;
			#else
				float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp += shadowBias;
			#endif
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
			vec2 sample0 = vogelDiskSample( 0, 5, phi );
			vec2 sample1 = vogelDiskSample( 1, 5, phi );
			vec2 sample2 = vogelDiskSample( 2, 5, phi );
			vec2 sample3 = vogelDiskSample( 3, 5, phi );
			vec2 sample4 = vogelDiskSample( 4, 5, phi );
			shadow = (
				texture( shadowMap, vec4( bd3D + ( tangent * sample0.x + bitangent * sample0.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample1.x + bitangent * sample1.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample2.x + bitangent * sample2.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample3.x + bitangent * sample3.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample4.x + bitangent * sample4.y ) * texelSize, dp ) )
			) * 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				depth = 1.0 - depth;
			#endif
			shadow = step( dp, depth );
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,DS=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,NS=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	#ifdef HAS_NORMAL
		vec3 shadowWorldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
	#else
		vec3 shadowWorldNormal = vec3( 0.0 );
	#endif
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,IS=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,US=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,FS=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,OS=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,BS=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,kS=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,zS=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,VS=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,HS=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,GS=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,WS=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,XS=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,YS=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,qS=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,KS=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const $S=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,ZS=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,QS=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,JS=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vWorldDirection );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,jS=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,eM=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,tM=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,nM=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,iM=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,rM=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,sM=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,aM=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,oM=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,lM=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,uM=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,cM=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,fM=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,dM=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,hM=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,pM=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,mM=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,gM=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,_M=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,vM=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,xM=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,yM=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
 	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,SM=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,MM=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,EM=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,TM=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,wM=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,AM=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,RM=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,CM=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,ft={alphahash_fragment:$x,alphahash_pars_fragment:Zx,alphamap_fragment:Qx,alphamap_pars_fragment:Jx,alphatest_fragment:jx,alphatest_pars_fragment:ey,aomap_fragment:ty,aomap_pars_fragment:ny,batching_pars_vertex:iy,batching_vertex:ry,begin_vertex:sy,beginnormal_vertex:ay,bsdfs:oy,iridescence_fragment:ly,bumpmap_pars_fragment:uy,clipping_planes_fragment:cy,clipping_planes_pars_fragment:fy,clipping_planes_pars_vertex:dy,clipping_planes_vertex:hy,color_fragment:py,color_pars_fragment:my,color_pars_vertex:gy,color_vertex:_y,common:vy,cube_uv_reflection_fragment:xy,defaultnormal_vertex:yy,displacementmap_pars_vertex:Sy,displacementmap_vertex:My,emissivemap_fragment:Ey,emissivemap_pars_fragment:Ty,colorspace_fragment:wy,colorspace_pars_fragment:Ay,envmap_fragment:Ry,envmap_common_pars_fragment:Cy,envmap_pars_fragment:by,envmap_pars_vertex:Py,envmap_physical_pars_fragment:Vy,envmap_vertex:Ly,fog_vertex:Dy,fog_pars_vertex:Ny,fog_fragment:Iy,fog_pars_fragment:Uy,gradientmap_pars_fragment:Fy,lightmap_pars_fragment:Oy,lights_lambert_fragment:By,lights_lambert_pars_fragment:ky,lights_pars_begin:zy,lights_toon_fragment:Hy,lights_toon_pars_fragment:Gy,lights_phong_fragment:Wy,lights_phong_pars_fragment:Xy,lights_physical_fragment:Yy,lights_physical_pars_fragment:qy,lights_fragment_begin:Ky,lights_fragment_maps:$y,lights_fragment_end:Zy,lightprobes_pars_fragment:Qy,logdepthbuf_fragment:Jy,logdepthbuf_pars_fragment:jy,logdepthbuf_pars_vertex:eS,logdepthbuf_vertex:tS,map_fragment:nS,map_pars_fragment:iS,map_particle_fragment:rS,map_particle_pars_fragment:sS,metalnessmap_fragment:aS,metalnessmap_pars_fragment:oS,morphinstance_vertex:lS,morphcolor_vertex:uS,morphnormal_vertex:cS,morphtarget_pars_vertex:fS,morphtarget_vertex:dS,normal_fragment_begin:hS,normal_fragment_maps:pS,normal_pars_fragment:mS,normal_pars_vertex:gS,normal_vertex:_S,normalmap_pars_fragment:vS,clearcoat_normal_fragment_begin:xS,clearcoat_normal_fragment_maps:yS,clearcoat_pars_fragment:SS,iridescence_pars_fragment:MS,opaque_fragment:ES,packing:TS,premultiplied_alpha_fragment:wS,project_vertex:AS,dithering_fragment:RS,dithering_pars_fragment:CS,roughnessmap_fragment:bS,roughnessmap_pars_fragment:PS,shadowmap_pars_fragment:LS,shadowmap_pars_vertex:DS,shadowmap_vertex:NS,shadowmask_pars_fragment:IS,skinbase_vertex:US,skinning_pars_vertex:FS,skinning_vertex:OS,skinnormal_vertex:BS,specularmap_fragment:kS,specularmap_pars_fragment:zS,tonemapping_fragment:VS,tonemapping_pars_fragment:HS,transmission_fragment:GS,transmission_pars_fragment:WS,uv_pars_fragment:XS,uv_pars_vertex:YS,uv_vertex:qS,worldpos_vertex:KS,background_vert:$S,background_frag:ZS,backgroundCube_vert:QS,backgroundCube_frag:JS,cube_vert:jS,cube_frag:eM,depth_vert:tM,depth_frag:nM,distance_vert:iM,distance_frag:rM,equirect_vert:sM,equirect_frag:aM,linedashed_vert:oM,linedashed_frag:lM,meshbasic_vert:uM,meshbasic_frag:cM,meshlambert_vert:fM,meshlambert_frag:dM,meshmatcap_vert:hM,meshmatcap_frag:pM,meshnormal_vert:mM,meshnormal_frag:gM,meshphong_vert:_M,meshphong_frag:vM,meshphysical_vert:xM,meshphysical_frag:yM,meshtoon_vert:SM,meshtoon_frag:MM,points_vert:EM,points_frag:TM,shadow_vert:wM,shadow_frag:AM,sprite_vert:RM,sprite_frag:CM},De={common:{diffuse:{value:new dt(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new ut},alphaMap:{value:null},alphaMapTransform:{value:new ut},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new ut}},envmap:{envMap:{value:null},envMapRotation:{value:new ut},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new ut}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new ut}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new ut},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new ut},normalScale:{value:new Qe(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new ut},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new ut}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new ut}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new ut}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new dt(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new H},probesMax:{value:new H},probesResolution:{value:new H}},points:{diffuse:{value:new dt(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new ut},alphaTest:{value:0},uvTransform:{value:new ut}},sprite:{diffuse:{value:new dt(16777215)},opacity:{value:1},center:{value:new Qe(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new ut},alphaMap:{value:null},alphaMapTransform:{value:new ut},alphaTest:{value:0}}},Di={basic:{uniforms:Un([De.common,De.specularmap,De.envmap,De.aomap,De.lightmap,De.fog]),vertexShader:ft.meshbasic_vert,fragmentShader:ft.meshbasic_frag},lambert:{uniforms:Un([De.common,De.specularmap,De.envmap,De.aomap,De.lightmap,De.emissivemap,De.bumpmap,De.normalmap,De.displacementmap,De.fog,De.lights,{emissive:{value:new dt(0)},envMapIntensity:{value:1}}]),vertexShader:ft.meshlambert_vert,fragmentShader:ft.meshlambert_frag},phong:{uniforms:Un([De.common,De.specularmap,De.envmap,De.aomap,De.lightmap,De.emissivemap,De.bumpmap,De.normalmap,De.displacementmap,De.fog,De.lights,{emissive:{value:new dt(0)},specular:{value:new dt(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:ft.meshphong_vert,fragmentShader:ft.meshphong_frag},standard:{uniforms:Un([De.common,De.envmap,De.aomap,De.lightmap,De.emissivemap,De.bumpmap,De.normalmap,De.displacementmap,De.roughnessmap,De.metalnessmap,De.fog,De.lights,{emissive:{value:new dt(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:ft.meshphysical_vert,fragmentShader:ft.meshphysical_frag},toon:{uniforms:Un([De.common,De.aomap,De.lightmap,De.emissivemap,De.bumpmap,De.normalmap,De.displacementmap,De.gradientmap,De.fog,De.lights,{emissive:{value:new dt(0)}}]),vertexShader:ft.meshtoon_vert,fragmentShader:ft.meshtoon_frag},matcap:{uniforms:Un([De.common,De.bumpmap,De.normalmap,De.displacementmap,De.fog,{matcap:{value:null}}]),vertexShader:ft.meshmatcap_vert,fragmentShader:ft.meshmatcap_frag},points:{uniforms:Un([De.points,De.fog]),vertexShader:ft.points_vert,fragmentShader:ft.points_frag},dashed:{uniforms:Un([De.common,De.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:ft.linedashed_vert,fragmentShader:ft.linedashed_frag},depth:{uniforms:Un([De.common,De.displacementmap]),vertexShader:ft.depth_vert,fragmentShader:ft.depth_frag},normal:{uniforms:Un([De.common,De.bumpmap,De.normalmap,De.displacementmap,{opacity:{value:1}}]),vertexShader:ft.meshnormal_vert,fragmentShader:ft.meshnormal_frag},sprite:{uniforms:Un([De.sprite,De.fog]),vertexShader:ft.sprite_vert,fragmentShader:ft.sprite_frag},background:{uniforms:{uvTransform:{value:new ut},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:ft.background_vert,fragmentShader:ft.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new ut}},vertexShader:ft.backgroundCube_vert,fragmentShader:ft.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:ft.cube_vert,fragmentShader:ft.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:ft.equirect_vert,fragmentShader:ft.equirect_frag},distance:{uniforms:Un([De.common,De.displacementmap,{referencePosition:{value:new H},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:ft.distance_vert,fragmentShader:ft.distance_frag},shadow:{uniforms:Un([De.lights,De.fog,{color:{value:new dt(0)},opacity:{value:1}}]),vertexShader:ft.shadow_vert,fragmentShader:ft.shadow_frag}};Di.physical={uniforms:Un([Di.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new ut},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new ut},clearcoatNormalScale:{value:new Qe(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new ut},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new ut},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new ut},sheen:{value:0},sheenColor:{value:new dt(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new ut},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new ut},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new ut},transmissionSamplerSize:{value:new Qe},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new ut},attenuationDistance:{value:0},attenuationColor:{value:new dt(0)},specularColor:{value:new dt(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new ut},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new ut},anisotropyVector:{value:new Qe},anisotropyMap:{value:null},anisotropyMapTransform:{value:new ut}}]),vertexShader:ft.meshphysical_vert,fragmentShader:ft.meshphysical_frag};const $l={r:0,b:0,g:0},bM=new Ut,y_=new ut;y_.set(-1,0,0,0,1,0,0,0,1);function PM(s,e,t,r,o,l){const c=new dt(0);let d=o===!0?0:1,p,m,x=null,y=0,g=null;function M(b){let N=b.isScene===!0?b.background:null;if(N&&N.isTexture){const C=b.backgroundBlurriness>0;N=e.get(N,C)}return N}function E(b){let N=!1;const C=M(b);C===null?v(c,d):C&&C.isColor&&(v(C,1),N=!0);const I=s.xr.getEnvironmentBlendMode();I==="additive"?t.buffers.color.setClear(0,0,0,1,l):I==="alpha-blend"&&t.buffers.color.setClear(0,0,0,0,l),(s.autoClear||N)&&(t.buffers.depth.setTest(!0),t.buffers.depth.setMask(!0),t.buffers.color.setMask(!0),s.clear(s.autoClearColor,s.autoClearDepth,s.autoClearStencil))}function R(b,N){const C=M(N);C&&(C.isCubeTexture||C.mapping===mu)?(m===void 0&&(m=new qn(new _o(1,1,1),new zi({name:"BackgroundCubeMaterial",uniforms:pa(Di.backgroundCube.uniforms),vertexShader:Di.backgroundCube.vertexShader,fragmentShader:Di.backgroundCube.fragmentShader,side:On,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),m.geometry.deleteAttribute("normal"),m.geometry.deleteAttribute("uv"),m.onBeforeRender=function(I,P,O){this.matrixWorld.copyPosition(O.matrixWorld)},Object.defineProperty(m.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),r.update(m)),m.material.uniforms.envMap.value=C,m.material.uniforms.backgroundBlurriness.value=N.backgroundBlurriness,m.material.uniforms.backgroundIntensity.value=N.backgroundIntensity,m.material.uniforms.backgroundRotation.value.setFromMatrix4(bM.makeRotationFromEuler(N.backgroundRotation)).transpose(),C.isCubeTexture&&C.isRenderTargetTexture===!1&&m.material.uniforms.backgroundRotation.value.premultiply(y_),m.material.toneMapped=vt.getTransfer(C.colorSpace)!==Lt,(x!==C||y!==C.version||g!==s.toneMapping)&&(m.material.needsUpdate=!0,x=C,y=C.version,g=s.toneMapping),m.layers.enableAll(),b.unshift(m,m.geometry,m.material,0,0,null)):C&&C.isTexture&&(p===void 0&&(p=new qn(new _u(2,2),new zi({name:"BackgroundMaterial",uniforms:pa(Di.background.uniforms),vertexShader:Di.background.vertexShader,fragmentShader:Di.background.fragmentShader,side:Ur,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),p.geometry.deleteAttribute("normal"),Object.defineProperty(p.material,"map",{get:function(){return this.uniforms.t2D.value}}),r.update(p)),p.material.uniforms.t2D.value=C,p.material.uniforms.backgroundIntensity.value=N.backgroundIntensity,p.material.toneMapped=vt.getTransfer(C.colorSpace)!==Lt,C.matrixAutoUpdate===!0&&C.updateMatrix(),p.material.uniforms.uvTransform.value.copy(C.matrix),(x!==C||y!==C.version||g!==s.toneMapping)&&(p.material.needsUpdate=!0,x=C,y=C.version,g=s.toneMapping),p.layers.enableAll(),b.unshift(p,p.geometry,p.material,0,0,null))}function v(b,N){b.getRGB($l,g_(s)),t.buffers.color.setClear($l.r,$l.g,$l.b,N,l)}function _(){m!==void 0&&(m.geometry.dispose(),m.material.dispose(),m=void 0),p!==void 0&&(p.geometry.dispose(),p.material.dispose(),p=void 0)}return{getClearColor:function(){return c},setClearColor:function(b,N=1){c.set(b),d=N,v(c,d)},getClearAlpha:function(){return d},setClearAlpha:function(b){d=b,v(c,d)},render:E,addToRenderList:R,dispose:_}}function LM(s,e){const t=s.getParameter(s.MAX_VERTEX_ATTRIBS),r={},o=g(null);let l=o,c=!1;function d(k,K,ce,me,Q){let ue=!1;const $=y(k,me,ce,K);l!==$&&(l=$,m(l.object)),ue=M(k,me,ce,Q),ue&&E(k,me,ce,Q),Q!==null&&e.update(Q,s.ELEMENT_ARRAY_BUFFER),(ue||c)&&(c=!1,C(k,K,ce,me),Q!==null&&s.bindBuffer(s.ELEMENT_ARRAY_BUFFER,e.get(Q).buffer))}function p(){return s.createVertexArray()}function m(k){return s.bindVertexArray(k)}function x(k){return s.deleteVertexArray(k)}function y(k,K,ce,me){const Q=me.wireframe===!0;let ue=r[K.id];ue===void 0&&(ue={},r[K.id]=ue);const $=k.isInstancedMesh===!0?k.id:0;let Y=ue[$];Y===void 0&&(Y={},ue[$]=Y);let ae=Y[ce.id];ae===void 0&&(ae={},Y[ce.id]=ae);let oe=ae[Q];return oe===void 0&&(oe=g(p()),ae[Q]=oe),oe}function g(k){const K=[],ce=[],me=[];for(let Q=0;Q<t;Q++)K[Q]=0,ce[Q]=0,me[Q]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:K,enabledAttributes:ce,attributeDivisors:me,object:k,attributes:{},index:null}}function M(k,K,ce,me){const Q=l.attributes,ue=K.attributes;let $=0;const Y=ce.getAttributes();for(const ae in Y)if(Y[ae].location>=0){const F=Q[ae];let Z=ue[ae];if(Z===void 0&&(ae==="instanceMatrix"&&k.instanceMatrix&&(Z=k.instanceMatrix),ae==="instanceColor"&&k.instanceColor&&(Z=k.instanceColor)),F===void 0||F.attribute!==Z||Z&&F.data!==Z.data)return!0;$++}return l.attributesNum!==$||l.index!==me}function E(k,K,ce,me){const Q={},ue=K.attributes;let $=0;const Y=ce.getAttributes();for(const ae in Y)if(Y[ae].location>=0){let F=ue[ae];F===void 0&&(ae==="instanceMatrix"&&k.instanceMatrix&&(F=k.instanceMatrix),ae==="instanceColor"&&k.instanceColor&&(F=k.instanceColor));const Z={};Z.attribute=F,F&&F.data&&(Z.data=F.data),Q[ae]=Z,$++}l.attributes=Q,l.attributesNum=$,l.index=me}function R(){const k=l.newAttributes;for(let K=0,ce=k.length;K<ce;K++)k[K]=0}function v(k){_(k,0)}function _(k,K){const ce=l.newAttributes,me=l.enabledAttributes,Q=l.attributeDivisors;ce[k]=1,me[k]===0&&(s.enableVertexAttribArray(k),me[k]=1),Q[k]!==K&&(s.vertexAttribDivisor(k,K),Q[k]=K)}function b(){const k=l.newAttributes,K=l.enabledAttributes;for(let ce=0,me=K.length;ce<me;ce++)K[ce]!==k[ce]&&(s.disableVertexAttribArray(ce),K[ce]=0)}function N(k,K,ce,me,Q,ue,$){$===!0?s.vertexAttribIPointer(k,K,ce,Q,ue):s.vertexAttribPointer(k,K,ce,me,Q,ue)}function C(k,K,ce,me){R();const Q=me.attributes,ue=ce.getAttributes(),$=K.defaultAttributeValues;for(const Y in ue){const ae=ue[Y];if(ae.location>=0){let oe=Q[Y];if(oe===void 0&&(Y==="instanceMatrix"&&k.instanceMatrix&&(oe=k.instanceMatrix),Y==="instanceColor"&&k.instanceColor&&(oe=k.instanceColor)),oe!==void 0){const F=oe.normalized,Z=oe.itemSize,Ne=e.get(oe);if(Ne===void 0)continue;const qe=Ne.buffer,ke=Ne.type,ie=Ne.bytesPerElement,_e=ke===s.INT||ke===s.UNSIGNED_INT||oe.gpuType===Fd;if(oe.isInterleavedBufferAttribute){const he=oe.data,Ie=he.stride,Je=oe.offset;if(he.isInstancedInterleavedBuffer){for(let je=0;je<ae.locationSize;je++)_(ae.location+je,he.meshPerAttribute);k.isInstancedMesh!==!0&&me._maxInstanceCount===void 0&&(me._maxInstanceCount=he.meshPerAttribute*he.count)}else for(let je=0;je<ae.locationSize;je++)v(ae.location+je);s.bindBuffer(s.ARRAY_BUFFER,qe);for(let je=0;je<ae.locationSize;je++)N(ae.location+je,Z/ae.locationSize,ke,F,Ie*ie,(Je+Z/ae.locationSize*je)*ie,_e)}else{if(oe.isInstancedBufferAttribute){for(let he=0;he<ae.locationSize;he++)_(ae.location+he,oe.meshPerAttribute);k.isInstancedMesh!==!0&&me._maxInstanceCount===void 0&&(me._maxInstanceCount=oe.meshPerAttribute*oe.count)}else for(let he=0;he<ae.locationSize;he++)v(ae.location+he);s.bindBuffer(s.ARRAY_BUFFER,qe);for(let he=0;he<ae.locationSize;he++)N(ae.location+he,Z/ae.locationSize,ke,F,Z*ie,Z/ae.locationSize*he*ie,_e)}}else if($!==void 0){const F=$[Y];if(F!==void 0)switch(F.length){case 2:s.vertexAttrib2fv(ae.location,F);break;case 3:s.vertexAttrib3fv(ae.location,F);break;case 4:s.vertexAttrib4fv(ae.location,F);break;default:s.vertexAttrib1fv(ae.location,F)}}}}b()}function I(){D();for(const k in r){const K=r[k];for(const ce in K){const me=K[ce];for(const Q in me){const ue=me[Q];for(const $ in ue)x(ue[$].object),delete ue[$];delete me[Q]}}delete r[k]}}function P(k){if(r[k.id]===void 0)return;const K=r[k.id];for(const ce in K){const me=K[ce];for(const Q in me){const ue=me[Q];for(const $ in ue)x(ue[$].object),delete ue[$];delete me[Q]}}delete r[k.id]}function O(k){for(const K in r){const ce=r[K];for(const me in ce){const Q=ce[me];if(Q[k.id]===void 0)continue;const ue=Q[k.id];for(const $ in ue)x(ue[$].object),delete ue[$];delete Q[k.id]}}}function T(k){for(const K in r){const ce=r[K],me=k.isInstancedMesh===!0?k.id:0,Q=ce[me];if(Q!==void 0){for(const ue in Q){const $=Q[ue];for(const Y in $)x($[Y].object),delete $[Y];delete Q[ue]}delete ce[me],Object.keys(ce).length===0&&delete r[K]}}}function D(){z(),c=!0,l!==o&&(l=o,m(l.object))}function z(){o.geometry=null,o.program=null,o.wireframe=!1}return{setup:d,reset:D,resetDefaultState:z,dispose:I,releaseStatesOfGeometry:P,releaseStatesOfObject:T,releaseStatesOfProgram:O,initAttributes:R,enableAttribute:v,disableUnusedAttributes:b}}function DM(s,e,t){let r;function o(p){r=p}function l(p,m){s.drawArrays(r,p,m),t.update(m,r,1)}function c(p,m,x){x!==0&&(s.drawArraysInstanced(r,p,m,x),t.update(m,r,x))}function d(p,m,x){if(x===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(r,p,0,m,0,x);let g=0;for(let M=0;M<x;M++)g+=m[M];t.update(g,r,1)}this.setMode=o,this.render=l,this.renderInstances=c,this.renderMultiDraw=d}function NM(s,e,t,r){let o;function l(){if(o!==void 0)return o;if(e.has("EXT_texture_filter_anisotropic")===!0){const O=e.get("EXT_texture_filter_anisotropic");o=s.getParameter(O.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else o=0;return o}function c(O){return!(O!==Ei&&r.convert(O)!==s.getParameter(s.IMPLEMENTATION_COLOR_READ_FORMAT))}function d(O){const T=O===rr&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(O!==ei&&r.convert(O)!==s.getParameter(s.IMPLEMENTATION_COLOR_READ_TYPE)&&O!==Ui&&!T)}function p(O){if(O==="highp"){if(s.getShaderPrecisionFormat(s.VERTEX_SHADER,s.HIGH_FLOAT).precision>0&&s.getShaderPrecisionFormat(s.FRAGMENT_SHADER,s.HIGH_FLOAT).precision>0)return"highp";O="mediump"}return O==="mediump"&&s.getShaderPrecisionFormat(s.VERTEX_SHADER,s.MEDIUM_FLOAT).precision>0&&s.getShaderPrecisionFormat(s.FRAGMENT_SHADER,s.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let m=t.precision!==void 0?t.precision:"highp";const x=p(m);x!==m&&(rt("WebGLRenderer:",m,"not supported, using",x,"instead."),m=x);const y=t.logarithmicDepthBuffer===!0,g=t.reversedDepthBuffer===!0&&e.has("EXT_clip_control");t.reversedDepthBuffer===!0&&g===!1&&rt("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.");const M=s.getParameter(s.MAX_TEXTURE_IMAGE_UNITS),E=s.getParameter(s.MAX_VERTEX_TEXTURE_IMAGE_UNITS),R=s.getParameter(s.MAX_TEXTURE_SIZE),v=s.getParameter(s.MAX_CUBE_MAP_TEXTURE_SIZE),_=s.getParameter(s.MAX_VERTEX_ATTRIBS),b=s.getParameter(s.MAX_VERTEX_UNIFORM_VECTORS),N=s.getParameter(s.MAX_VARYING_VECTORS),C=s.getParameter(s.MAX_FRAGMENT_UNIFORM_VECTORS),I=s.getParameter(s.MAX_SAMPLES),P=s.getParameter(s.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:l,getMaxPrecision:p,textureFormatReadable:c,textureTypeReadable:d,precision:m,logarithmicDepthBuffer:y,reversedDepthBuffer:g,maxTextures:M,maxVertexTextures:E,maxTextureSize:R,maxCubemapSize:v,maxAttributes:_,maxVertexUniforms:b,maxVaryings:N,maxFragmentUniforms:C,maxSamples:I,samples:P}}function IM(s){const e=this;let t=null,r=0,o=!1,l=!1;const c=new Lr,d=new ut,p={value:null,needsUpdate:!1};this.uniform=p,this.numPlanes=0,this.numIntersection=0,this.init=function(y,g){const M=y.length!==0||g||r!==0||o;return o=g,r=y.length,M},this.beginShadows=function(){l=!0,x(null)},this.endShadows=function(){l=!1},this.setGlobalState=function(y,g){t=x(y,g,0)},this.setState=function(y,g,M){const E=y.clippingPlanes,R=y.clipIntersection,v=y.clipShadows,_=s.get(y);if(!o||E===null||E.length===0||l&&!v)l?x(null):m();else{const b=l?0:r,N=b*4;let C=_.clippingState||null;p.value=C,C=x(E,g,N,M);for(let I=0;I!==N;++I)C[I]=t[I];_.clippingState=C,this.numIntersection=R?this.numPlanes:0,this.numPlanes+=b}};function m(){p.value!==t&&(p.value=t,p.needsUpdate=r>0),e.numPlanes=r,e.numIntersection=0}function x(y,g,M,E){const R=y!==null?y.length:0;let v=null;if(R!==0){if(v=p.value,E!==!0||v===null){const _=M+R*4,b=g.matrixWorldInverse;d.getNormalMatrix(b),(v===null||v.length<_)&&(v=new Float32Array(_));for(let N=0,C=M;N!==R;++N,C+=4)c.copy(y[N]).applyMatrix4(b,d),c.normal.toArray(v,C),v[C+3]=c.constant}p.value=v,p.needsUpdate=!0}return e.numPlanes=R,e.numIntersection=0,v}}const Nr=4,cg=[.125,.215,.35,.446,.526,.582],us=20,UM=256,so=new Zd,fg=new dt;let Df=null,Nf=0,If=0,Uf=!1;const FM=new H;class dg{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._sigmas=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(e,t=0,r=.1,o=100,l={}){const{size:c=256,position:d=FM}=l;Df=this._renderer.getRenderTarget(),Nf=this._renderer.getActiveCubeFace(),If=this._renderer.getActiveMipmapLevel(),Uf=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(c);const p=this._allocateTargets();return p.depthBuffer=!0,this._sceneToCubeUV(e,r,o,p,d),t>0&&this._blur(p,0,0,t),this._applyPMREM(p),this._cleanup(p),p}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=mg(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=pg(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodMeshes.length;e++)this._lodMeshes[e].geometry.dispose()}_cleanup(e){this._renderer.setRenderTarget(Df,Nf,If),this._renderer.xr.enabled=Uf,e.scissorTest=!1,na(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===ds||e.mapping===fa?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),Df=this._renderer.getRenderTarget(),Nf=this._renderer.getActiveCubeFace(),If=this._renderer.getActiveMipmapLevel(),Uf=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const r=t||this._allocateTargets();return this._textureToCubeUV(e,r),this._applyPMREM(r),this._cleanup(r),r}_allocateTargets(){const e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,r={magFilter:Pn,minFilter:Pn,generateMipmaps:!1,type:rr,format:Ei,colorSpace:lu,depthBuffer:!1},o=hg(e,t,r);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=hg(e,t,r);const{_lodMax:l}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods,sigmas:this._sigmas}=OM(l)),this._blurMaterial=kM(l,e,t),this._ggxMaterial=BM(l,e,t)}return o}_compileMaterial(e){const t=new qn(new Mn,e);this._renderer.compile(t,so)}_sceneToCubeUV(e,t,r,o,l){const p=new ci(90,1,t,r),m=[1,-1,1,1,1,1],x=[1,1,1,-1,-1,-1],y=this._renderer,g=y.autoClear,M=y.toneMapping;y.getClearColor(fg),y.toneMapping=Oi,y.autoClear=!1,y.state.buffers.depth.getReversed()&&(y.setRenderTarget(o),y.clearDepth(),y.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new qn(new _o,new da({name:"PMREM.Background",side:On,depthWrite:!1,depthTest:!1})));const R=this._backgroundBox,v=R.material;let _=!1;const b=e.background;b?b.isColor&&(v.color.copy(b),e.background=null,_=!0):(v.color.copy(fg),_=!0);for(let N=0;N<6;N++){const C=N%3;C===0?(p.up.set(0,m[N],0),p.position.set(l.x,l.y,l.z),p.lookAt(l.x+x[N],l.y,l.z)):C===1?(p.up.set(0,0,m[N]),p.position.set(l.x,l.y,l.z),p.lookAt(l.x,l.y+x[N],l.z)):(p.up.set(0,m[N],0),p.position.set(l.x,l.y,l.z),p.lookAt(l.x,l.y,l.z+x[N]));const I=this._cubeSize;na(o,C*I,N>2?I:0,I,I),y.setRenderTarget(o),_&&y.render(R,p),y.render(e,p)}y.toneMapping=M,y.autoClear=g,e.background=b}_textureToCubeUV(e,t){const r=this._renderer,o=e.mapping===ds||e.mapping===fa;o?(this._cubemapMaterial===null&&(this._cubemapMaterial=mg()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=pg());const l=o?this._cubemapMaterial:this._equirectMaterial,c=this._lodMeshes[0];c.material=l;const d=l.uniforms;d.envMap.value=e;const p=this._cubeSize;na(t,0,0,3*p,2*p),r.setRenderTarget(t),r.render(c,so)}_applyPMREM(e){const t=this._renderer,r=t.autoClear;t.autoClear=!1;const o=this._lodMeshes.length;for(let l=1;l<o;l++)this._applyGGXFilter(e,l-1,l);t.autoClear=r}_applyGGXFilter(e,t,r){const o=this._renderer,l=this._pingPongRenderTarget,c=this._ggxMaterial,d=this._lodMeshes[r];d.material=c;const p=c.uniforms,m=r/(this._lodMeshes.length-1),x=t/(this._lodMeshes.length-1),y=Math.sqrt(m*m-x*x),g=0+m*1.25,M=y*g,{_lodMax:E}=this,R=this._sizeLods[r],v=3*R*(r>E-Nr?r-E+Nr:0),_=4*(this._cubeSize-R);p.envMap.value=e.texture,p.roughness.value=M,p.mipInt.value=E-t,na(l,v,_,3*R,2*R),o.setRenderTarget(l),o.render(d,so),p.envMap.value=l.texture,p.roughness.value=0,p.mipInt.value=E-r,na(e,v,_,3*R,2*R),o.setRenderTarget(e),o.render(d,so)}_blur(e,t,r,o,l){const c=this._pingPongRenderTarget;this._halfBlur(e,c,t,r,o,"latitudinal",l),this._halfBlur(c,e,r,r,o,"longitudinal",l)}_halfBlur(e,t,r,o,l,c,d){const p=this._renderer,m=this._blurMaterial;c!=="latitudinal"&&c!=="longitudinal"&&St("blur direction must be either latitudinal or longitudinal!");const x=3,y=this._lodMeshes[o];y.material=m;const g=m.uniforms,M=this._sizeLods[r]-1,E=isFinite(l)?Math.PI/(2*M):2*Math.PI/(2*us-1),R=l/E,v=isFinite(l)?1+Math.floor(x*R):us;v>us&&rt(`sigmaRadians, ${l}, is too large and will clip, as it requested ${v} samples when the maximum is set to ${us}`);const _=[];let b=0;for(let O=0;O<us;++O){const T=O/R,D=Math.exp(-T*T/2);_.push(D),O===0?b+=D:O<v&&(b+=2*D)}for(let O=0;O<_.length;O++)_[O]=_[O]/b;g.envMap.value=e.texture,g.samples.value=v,g.weights.value=_,g.latitudinal.value=c==="latitudinal",d&&(g.poleAxis.value=d);const{_lodMax:N}=this;g.dTheta.value=E,g.mipInt.value=N-r;const C=this._sizeLods[o],I=3*C*(o>N-Nr?o-N+Nr:0),P=4*(this._cubeSize-C);na(t,I,P,3*C,2*C),p.setRenderTarget(t),p.render(y,so)}}function OM(s){const e=[],t=[],r=[];let o=s;const l=s-Nr+1+cg.length;for(let c=0;c<l;c++){const d=Math.pow(2,o);e.push(d);let p=1/d;c>s-Nr?p=cg[c-s+Nr-1]:c===0&&(p=0),t.push(p);const m=1/(d-2),x=-m,y=1+m,g=[x,x,y,x,y,y,x,x,y,y,x,y],M=6,E=6,R=3,v=2,_=1,b=new Float32Array(R*E*M),N=new Float32Array(v*E*M),C=new Float32Array(_*E*M);for(let P=0;P<M;P++){const O=P%3*2/3-1,T=P>2?0:-1,D=[O,T,0,O+2/3,T,0,O+2/3,T+1,0,O,T,0,O+2/3,T+1,0,O,T+1,0];b.set(D,R*E*P),N.set(g,v*E*P);const z=[P,P,P,P,P,P];C.set(z,_*E*P)}const I=new Mn;I.setAttribute("position",new Ti(b,R)),I.setAttribute("uv",new Ti(N,v)),I.setAttribute("faceIndex",new Ti(C,_)),r.push(new qn(I,null)),o>Nr&&o--}return{lodMeshes:r,sizeLods:e,sigmas:t}}function hg(s,e,t){const r=new Bi(s,e,t);return r.texture.mapping=mu,r.texture.name="PMREM.cubeUv",r.scissorTest=!0,r}function na(s,e,t,r,o){s.viewport.set(e,t,r,o),s.scissor.set(e,t,r,o)}function BM(s,e,t){return new zi({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:UM,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${s}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:vu(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float roughness;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359

			// Van der Corput radical inverse
			float radicalInverse_VdC(uint bits) {
				bits = (bits << 16u) | (bits >> 16u);
				bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);
				bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);
				bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);
				bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);
				return float(bits) * 2.3283064365386963e-10; // / 0x100000000
			}

			// Hammersley sequence
			vec2 hammersley(uint i, uint N) {
				return vec2(float(i) / float(N), radicalInverse_VdC(i));
			}

			// GGX VNDF importance sampling (Eric Heitz 2018)
			// "Sampling the GGX Distribution of Visible Normals"
			// https://jcgt.org/published/0007/04/01/
			vec3 importanceSampleGGX_VNDF(vec2 Xi, vec3 V, float roughness) {
				float alpha = roughness * roughness;

				// Section 4.1: Orthonormal basis
				vec3 T1 = vec3(1.0, 0.0, 0.0);
				vec3 T2 = cross(V, T1);

				// Section 4.2: Parameterization of projected area
				float r = sqrt(Xi.x);
				float phi = 2.0 * PI * Xi.y;
				float t1 = r * cos(phi);
				float t2 = r * sin(phi);
				float s = 0.5 * (1.0 + V.z);
				t2 = (1.0 - s) * sqrt(1.0 - t1 * t1) + s * t2;

				// Section 4.3: Reprojection onto hemisphere
				vec3 Nh = t1 * T1 + t2 * T2 + sqrt(max(0.0, 1.0 - t1 * t1 - t2 * t2)) * V;

				// Section 3.4: Transform back to ellipsoid configuration
				return normalize(vec3(alpha * Nh.x, alpha * Nh.y, max(0.0, Nh.z)));
			}

			void main() {
				vec3 N = normalize(vOutputDirection);
				vec3 V = N; // Assume view direction equals normal for pre-filtering

				vec3 prefilteredColor = vec3(0.0);
				float totalWeight = 0.0;

				// For very low roughness, just sample the environment directly
				if (roughness < 0.001) {
					gl_FragColor = vec4(bilinearCubeUV(envMap, N, mipInt), 1.0);
					return;
				}

				// Tangent space basis for VNDF sampling
				vec3 up = abs(N.z) < 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
				vec3 tangent = normalize(cross(up, N));
				vec3 bitangent = cross(N, tangent);

				for(uint i = 0u; i < uint(GGX_SAMPLES); i++) {
					vec2 Xi = hammersley(i, uint(GGX_SAMPLES));

					// For PMREM, V = N, so in tangent space V is always (0, 0, 1)
					vec3 H_tangent = importanceSampleGGX_VNDF(Xi, vec3(0.0, 0.0, 1.0), roughness);

					// Transform H back to world space
					vec3 H = normalize(tangent * H_tangent.x + bitangent * H_tangent.y + N * H_tangent.z);
					vec3 L = normalize(2.0 * dot(V, H) * H - V);

					float NdotL = max(dot(N, L), 0.0);

					if(NdotL > 0.0) {
						// Sample environment at fixed mip level
						// VNDF importance sampling handles the distribution filtering
						vec3 sampleColor = bilinearCubeUV(envMap, L, mipInt);

						// Weight by NdotL for the split-sum approximation
						// VNDF PDF naturally accounts for the visible microfacet distribution
						prefilteredColor += sampleColor * NdotL;
						totalWeight += NdotL;
					}
				}

				if (totalWeight > 0.0) {
					prefilteredColor = prefilteredColor / totalWeight;
				}

				gl_FragColor = vec4(prefilteredColor, 1.0);
			}
		`,blending:nr,depthTest:!1,depthWrite:!1})}function kM(s,e,t){const r=new Float32Array(us),o=new H(0,1,0);return new zi({name:"SphericalGaussianBlur",defines:{n:us,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${s}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:r},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:o}},vertexShader:vu(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:nr,depthTest:!1,depthWrite:!1})}function pg(){return new zi({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:vu(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:nr,depthTest:!1,depthWrite:!1})}function mg(){return new zi({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:vu(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:nr,depthTest:!1,depthWrite:!1})}function vu(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}class S_ extends Bi{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;const r={width:e,height:e,depth:1},o=[r,r,r,r,r,r];this.texture=new p_(o),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;const r={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},o=new _o(5,5,5),l=new zi({name:"CubemapFromEquirect",uniforms:pa(r.uniforms),vertexShader:r.vertexShader,fragmentShader:r.fragmentShader,side:On,blending:nr});l.uniforms.tEquirect.value=t;const c=new qn(o,l),d=t.minFilter;return t.minFilter===cs&&(t.minFilter=Pn),new Wx(1,10,this).update(e,c),t.minFilter=d,c.geometry.dispose(),c.material.dispose(),this}clear(e,t=!0,r=!0,o=!0){const l=e.getRenderTarget();for(let c=0;c<6;c++)e.setRenderTarget(this,c),e.clear(t,r,o);e.setRenderTarget(l)}}function zM(s){let e=new WeakMap,t=new WeakMap,r=null;function o(g,M=!1){return g==null?null:M?c(g):l(g)}function l(g){if(g&&g.isTexture){const M=g.mapping;if(M===tf||M===nf)if(e.has(g)){const E=e.get(g).texture;return d(E,g.mapping)}else{const E=g.image;if(E&&E.height>0){const R=new S_(E.height);return R.fromEquirectangularTexture(s,g),e.set(g,R),g.addEventListener("dispose",m),d(R.texture,g.mapping)}else return null}}return g}function c(g){if(g&&g.isTexture){const M=g.mapping,E=M===tf||M===nf,R=M===ds||M===fa;if(E||R){let v=t.get(g);const _=v!==void 0?v.texture.pmremVersion:0;if(g.isRenderTargetTexture&&g.pmremVersion!==_)return r===null&&(r=new dg(s)),v=E?r.fromEquirectangular(g,v):r.fromCubemap(g,v),v.texture.pmremVersion=g.pmremVersion,t.set(g,v),v.texture;if(v!==void 0)return v.texture;{const b=g.image;return E&&b&&b.height>0||R&&b&&p(b)?(r===null&&(r=new dg(s)),v=E?r.fromEquirectangular(g):r.fromCubemap(g),v.texture.pmremVersion=g.pmremVersion,t.set(g,v),g.addEventListener("dispose",x),v.texture):null}}}return g}function d(g,M){return M===tf?g.mapping=ds:M===nf&&(g.mapping=fa),g}function p(g){let M=0;const E=6;for(let R=0;R<E;R++)g[R]!==void 0&&M++;return M===E}function m(g){const M=g.target;M.removeEventListener("dispose",m);const E=e.get(M);E!==void 0&&(e.delete(M),E.dispose())}function x(g){const M=g.target;M.removeEventListener("dispose",x);const E=t.get(M);E!==void 0&&(t.delete(M),E.dispose())}function y(){e=new WeakMap,t=new WeakMap,r!==null&&(r.dispose(),r=null)}return{get:o,dispose:y}}function VM(s){const e={};function t(r){if(e[r]!==void 0)return e[r];const o=s.getExtension(r);return e[r]=o,o}return{has:function(r){return t(r)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(r){const o=t(r);return o===null&&la("WebGLRenderer: "+r+" extension not supported."),o}}}function HM(s,e,t,r){const o={},l=new WeakMap;function c(y){const g=y.target;g.index!==null&&e.remove(g.index);for(const E in g.attributes)e.remove(g.attributes[E]);g.removeEventListener("dispose",c),delete o[g.id];const M=l.get(g);M&&(e.remove(M),l.delete(g)),r.releaseStatesOfGeometry(g),g.isInstancedBufferGeometry===!0&&delete g._maxInstanceCount,t.memory.geometries--}function d(y,g){return o[g.id]===!0||(g.addEventListener("dispose",c),o[g.id]=!0,t.memory.geometries++),g}function p(y){const g=y.attributes;for(const M in g)e.update(g[M],s.ARRAY_BUFFER)}function m(y){const g=[],M=y.index,E=y.attributes.position;let R=0;if(E===void 0)return;if(M!==null){const b=M.array;R=M.version;for(let N=0,C=b.length;N<C;N+=3){const I=b[N+0],P=b[N+1],O=b[N+2];g.push(I,P,P,O,O,I)}}else{const b=E.array;R=E.version;for(let N=0,C=b.length/3-1;N<C;N+=3){const I=N+0,P=N+1,O=N+2;g.push(I,P,P,O,O,I)}}const v=new(E.count>=65535?u_:l_)(g,1);v.version=R;const _=l.get(y);_&&e.remove(_),l.set(y,v)}function x(y){const g=l.get(y);if(g){const M=y.index;M!==null&&g.version<M.version&&m(y)}else m(y);return l.get(y)}return{get:d,update:p,getWireframeAttribute:x}}function GM(s,e,t){let r;function o(y){r=y}let l,c;function d(y){l=y.type,c=y.bytesPerElement}function p(y,g){s.drawElements(r,g,l,y*c),t.update(g,r,1)}function m(y,g,M){M!==0&&(s.drawElementsInstanced(r,g,l,y*c,M),t.update(g,r,M))}function x(y,g,M){if(M===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(r,g,0,l,y,0,M);let R=0;for(let v=0;v<M;v++)R+=g[v];t.update(R,r,1)}this.setMode=o,this.setIndex=d,this.render=p,this.renderInstances=m,this.renderMultiDraw=x}function WM(s){const e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function r(l,c,d){switch(t.calls++,c){case s.TRIANGLES:t.triangles+=d*(l/3);break;case s.LINES:t.lines+=d*(l/2);break;case s.LINE_STRIP:t.lines+=d*(l-1);break;case s.LINE_LOOP:t.lines+=d*l;break;case s.POINTS:t.points+=d*l;break;default:St("WebGLInfo: Unknown draw mode:",c);break}}function o(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:o,update:r}}function XM(s,e,t){const r=new WeakMap,o=new Zt;function l(c,d,p){const m=c.morphTargetInfluences,x=d.morphAttributes.position||d.morphAttributes.normal||d.morphAttributes.color,y=x!==void 0?x.length:0;let g=r.get(d);if(g===void 0||g.count!==y){let z=function(){T.dispose(),r.delete(d),d.removeEventListener("dispose",z)};var M=z;g!==void 0&&g.texture.dispose();const E=d.morphAttributes.position!==void 0,R=d.morphAttributes.normal!==void 0,v=d.morphAttributes.color!==void 0,_=d.morphAttributes.position||[],b=d.morphAttributes.normal||[],N=d.morphAttributes.color||[];let C=0;E===!0&&(C=1),R===!0&&(C=2),v===!0&&(C=3);let I=d.attributes.position.count*C,P=1;I>e.maxTextureSize&&(P=Math.ceil(I/e.maxTextureSize),I=e.maxTextureSize);const O=new Float32Array(I*P*4*y),T=new s_(O,I,P,y);T.type=Ui,T.needsUpdate=!0;const D=C*4;for(let k=0;k<y;k++){const K=_[k],ce=b[k],me=N[k],Q=I*P*4*k;for(let ue=0;ue<K.count;ue++){const $=ue*D;E===!0&&(o.fromBufferAttribute(K,ue),O[Q+$+0]=o.x,O[Q+$+1]=o.y,O[Q+$+2]=o.z,O[Q+$+3]=0),R===!0&&(o.fromBufferAttribute(ce,ue),O[Q+$+4]=o.x,O[Q+$+5]=o.y,O[Q+$+6]=o.z,O[Q+$+7]=0),v===!0&&(o.fromBufferAttribute(me,ue),O[Q+$+8]=o.x,O[Q+$+9]=o.y,O[Q+$+10]=o.z,O[Q+$+11]=me.itemSize===4?o.w:1)}}g={count:y,texture:T,size:new Qe(I,P)},r.set(d,g),d.addEventListener("dispose",z)}if(c.isInstancedMesh===!0&&c.morphTexture!==null)p.getUniforms().setValue(s,"morphTexture",c.morphTexture,t);else{let E=0;for(let v=0;v<m.length;v++)E+=m[v];const R=d.morphTargetsRelative?1:1-E;p.getUniforms().setValue(s,"morphTargetBaseInfluence",R),p.getUniforms().setValue(s,"morphTargetInfluences",m)}p.getUniforms().setValue(s,"morphTargetsTexture",g.texture,t),p.getUniforms().setValue(s,"morphTargetsTextureSize",g.size)}return{update:l}}function YM(s,e,t,r,o){let l=new WeakMap;function c(m){const x=o.render.frame,y=m.geometry,g=e.get(m,y);if(l.get(g)!==x&&(e.update(g),l.set(g,x)),m.isInstancedMesh&&(m.hasEventListener("dispose",p)===!1&&m.addEventListener("dispose",p),l.get(m)!==x&&(t.update(m.instanceMatrix,s.ARRAY_BUFFER),m.instanceColor!==null&&t.update(m.instanceColor,s.ARRAY_BUFFER),l.set(m,x))),m.isSkinnedMesh){const M=m.skeleton;l.get(M)!==x&&(M.update(),l.set(M,x))}return g}function d(){l=new WeakMap}function p(m){const x=m.target;x.removeEventListener("dispose",p),r.releaseStatesOfObject(x),t.remove(x.instanceMatrix),x.instanceColor!==null&&t.remove(x.instanceColor)}return{update:c,dispose:d}}const qM={[Gg]:"LINEAR_TONE_MAPPING",[Wg]:"REINHARD_TONE_MAPPING",[Xg]:"CINEON_TONE_MAPPING",[Yg]:"ACES_FILMIC_TONE_MAPPING",[Kg]:"AGX_TONE_MAPPING",[$g]:"NEUTRAL_TONE_MAPPING",[qg]:"CUSTOM_TONE_MAPPING"};function KM(s,e,t,r,o,l){const c=new Bi(e,t,{type:s,depthBuffer:o,stencilBuffer:l,samples:r?4:0,depthTexture:o?new ha(e,t):void 0}),d=new Bi(e,t,{type:rr,depthBuffer:!1,stencilBuffer:!1}),p=new Mn;p.setAttribute("position",new an([-1,3,0,-1,-1,0,3,-1,0],3)),p.setAttribute("uv",new an([0,2,0,0,2,0],2));const m=new Dx({uniforms:{tDiffuse:{value:null}},vertexShader:`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,fragmentShader:`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),x=new qn(p,m),y=new Zd(-1,1,1,-1,0,1);let g=null,M=null,E=!1,R,v=null,_=[],b=!1;this.setSize=function(N,C){c.setSize(N,C),d.setSize(N,C);for(let I=0;I<_.length;I++){const P=_[I];P.setSize&&P.setSize(N,C)}},this.setEffects=function(N){_=N,b=_.length>0&&_[0].isRenderPass===!0;const C=c.width,I=c.height;for(let P=0;P<_.length;P++){const O=_[P];O.setSize&&O.setSize(C,I)}},this.begin=function(N,C){if(E||N.toneMapping===Oi&&_.length===0)return!1;if(v=C,C!==null){const I=C.width,P=C.height;(c.width!==I||c.height!==P)&&this.setSize(I,P)}return b===!1&&N.setRenderTarget(c),R=N.toneMapping,N.toneMapping=Oi,!0},this.hasRenderPass=function(){return b},this.end=function(N,C){N.toneMapping=R,E=!0;let I=c,P=d;for(let O=0;O<_.length;O++){const T=_[O];if(T.enabled!==!1&&(T.render(N,P,I,C),T.needsSwap!==!1)){const D=I;I=P,P=D}}if(g!==N.outputColorSpace||M!==N.toneMapping){g=N.outputColorSpace,M=N.toneMapping,m.defines={},vt.getTransfer(g)===Lt&&(m.defines.SRGB_TRANSFER="");const O=qM[M];O&&(m.defines[O]=""),m.needsUpdate=!0}m.uniforms.tDiffuse.value=I.texture,N.setRenderTarget(v),N.render(x,y),v=null,E=!1},this.isCompositing=function(){return E},this.dispose=function(){c.depthTexture&&c.depthTexture.dispose(),c.dispose(),d.dispose(),p.dispose(),m.dispose()}}const M_=new Sn,Dd=new ha(1,1),E_=new s_,T_=new rx,w_=new p_,gg=[],_g=[],vg=new Float32Array(16),xg=new Float32Array(9),yg=new Float32Array(4);function ma(s,e,t){const r=s[0];if(r<=0||r>0)return s;const o=e*t;let l=gg[o];if(l===void 0&&(l=new Float32Array(o),gg[o]=l),e!==0){r.toArray(l,0);for(let c=1,d=0;c!==e;++c)d+=t,s[c].toArray(l,d)}return l}function cn(s,e){if(s.length!==e.length)return!1;for(let t=0,r=s.length;t<r;t++)if(s[t]!==e[t])return!1;return!0}function fn(s,e){for(let t=0,r=e.length;t<r;t++)s[t]=e[t]}function xu(s,e){let t=_g[e];t===void 0&&(t=new Int32Array(e),_g[e]=t);for(let r=0;r!==e;++r)t[r]=s.allocateTextureUnit();return t}function $M(s,e){const t=this.cache;t[0]!==e&&(s.uniform1f(this.addr,e),t[0]=e)}function ZM(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(s.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(cn(t,e))return;s.uniform2fv(this.addr,e),fn(t,e)}}function QM(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(s.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(s.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(cn(t,e))return;s.uniform3fv(this.addr,e),fn(t,e)}}function JM(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(s.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(cn(t,e))return;s.uniform4fv(this.addr,e),fn(t,e)}}function jM(s,e){const t=this.cache,r=e.elements;if(r===void 0){if(cn(t,e))return;s.uniformMatrix2fv(this.addr,!1,e),fn(t,e)}else{if(cn(t,r))return;yg.set(r),s.uniformMatrix2fv(this.addr,!1,yg),fn(t,r)}}function eE(s,e){const t=this.cache,r=e.elements;if(r===void 0){if(cn(t,e))return;s.uniformMatrix3fv(this.addr,!1,e),fn(t,e)}else{if(cn(t,r))return;xg.set(r),s.uniformMatrix3fv(this.addr,!1,xg),fn(t,r)}}function tE(s,e){const t=this.cache,r=e.elements;if(r===void 0){if(cn(t,e))return;s.uniformMatrix4fv(this.addr,!1,e),fn(t,e)}else{if(cn(t,r))return;vg.set(r),s.uniformMatrix4fv(this.addr,!1,vg),fn(t,r)}}function nE(s,e){const t=this.cache;t[0]!==e&&(s.uniform1i(this.addr,e),t[0]=e)}function iE(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(s.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(cn(t,e))return;s.uniform2iv(this.addr,e),fn(t,e)}}function rE(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(s.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(cn(t,e))return;s.uniform3iv(this.addr,e),fn(t,e)}}function sE(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(s.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(cn(t,e))return;s.uniform4iv(this.addr,e),fn(t,e)}}function aE(s,e){const t=this.cache;t[0]!==e&&(s.uniform1ui(this.addr,e),t[0]=e)}function oE(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(s.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(cn(t,e))return;s.uniform2uiv(this.addr,e),fn(t,e)}}function lE(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(s.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(cn(t,e))return;s.uniform3uiv(this.addr,e),fn(t,e)}}function uE(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(s.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(cn(t,e))return;s.uniform4uiv(this.addr,e),fn(t,e)}}function cE(s,e,t){const r=this.cache,o=t.allocateTextureUnit();r[0]!==o&&(s.uniform1i(this.addr,o),r[0]=o);let l;this.type===s.SAMPLER_2D_SHADOW?(Dd.compareFunction=t.isReversedDepthBuffer()?Gd:Hd,l=Dd):l=M_,t.setTexture2D(e||l,o)}function fE(s,e,t){const r=this.cache,o=t.allocateTextureUnit();r[0]!==o&&(s.uniform1i(this.addr,o),r[0]=o),t.setTexture3D(e||T_,o)}function dE(s,e,t){const r=this.cache,o=t.allocateTextureUnit();r[0]!==o&&(s.uniform1i(this.addr,o),r[0]=o),t.setTextureCube(e||w_,o)}function hE(s,e,t){const r=this.cache,o=t.allocateTextureUnit();r[0]!==o&&(s.uniform1i(this.addr,o),r[0]=o),t.setTexture2DArray(e||E_,o)}function pE(s){switch(s){case 5126:return $M;case 35664:return ZM;case 35665:return QM;case 35666:return JM;case 35674:return jM;case 35675:return eE;case 35676:return tE;case 5124:case 35670:return nE;case 35667:case 35671:return iE;case 35668:case 35672:return rE;case 35669:case 35673:return sE;case 5125:return aE;case 36294:return oE;case 36295:return lE;case 36296:return uE;case 35678:case 36198:case 36298:case 36306:case 35682:return cE;case 35679:case 36299:case 36307:return fE;case 35680:case 36300:case 36308:case 36293:return dE;case 36289:case 36303:case 36311:case 36292:return hE}}function mE(s,e){s.uniform1fv(this.addr,e)}function gE(s,e){const t=ma(e,this.size,2);s.uniform2fv(this.addr,t)}function _E(s,e){const t=ma(e,this.size,3);s.uniform3fv(this.addr,t)}function vE(s,e){const t=ma(e,this.size,4);s.uniform4fv(this.addr,t)}function xE(s,e){const t=ma(e,this.size,4);s.uniformMatrix2fv(this.addr,!1,t)}function yE(s,e){const t=ma(e,this.size,9);s.uniformMatrix3fv(this.addr,!1,t)}function SE(s,e){const t=ma(e,this.size,16);s.uniformMatrix4fv(this.addr,!1,t)}function ME(s,e){s.uniform1iv(this.addr,e)}function EE(s,e){s.uniform2iv(this.addr,e)}function TE(s,e){s.uniform3iv(this.addr,e)}function wE(s,e){s.uniform4iv(this.addr,e)}function AE(s,e){s.uniform1uiv(this.addr,e)}function RE(s,e){s.uniform2uiv(this.addr,e)}function CE(s,e){s.uniform3uiv(this.addr,e)}function bE(s,e){s.uniform4uiv(this.addr,e)}function PE(s,e,t){const r=this.cache,o=e.length,l=xu(t,o);cn(r,l)||(s.uniform1iv(this.addr,l),fn(r,l));let c;this.type===s.SAMPLER_2D_SHADOW?c=Dd:c=M_;for(let d=0;d!==o;++d)t.setTexture2D(e[d]||c,l[d])}function LE(s,e,t){const r=this.cache,o=e.length,l=xu(t,o);cn(r,l)||(s.uniform1iv(this.addr,l),fn(r,l));for(let c=0;c!==o;++c)t.setTexture3D(e[c]||T_,l[c])}function DE(s,e,t){const r=this.cache,o=e.length,l=xu(t,o);cn(r,l)||(s.uniform1iv(this.addr,l),fn(r,l));for(let c=0;c!==o;++c)t.setTextureCube(e[c]||w_,l[c])}function NE(s,e,t){const r=this.cache,o=e.length,l=xu(t,o);cn(r,l)||(s.uniform1iv(this.addr,l),fn(r,l));for(let c=0;c!==o;++c)t.setTexture2DArray(e[c]||E_,l[c])}function IE(s){switch(s){case 5126:return mE;case 35664:return gE;case 35665:return _E;case 35666:return vE;case 35674:return xE;case 35675:return yE;case 35676:return SE;case 5124:case 35670:return ME;case 35667:case 35671:return EE;case 35668:case 35672:return TE;case 35669:case 35673:return wE;case 5125:return AE;case 36294:return RE;case 36295:return CE;case 36296:return bE;case 35678:case 36198:case 36298:case 36306:case 35682:return PE;case 35679:case 36299:case 36307:return LE;case 35680:case 36300:case 36308:case 36293:return DE;case 36289:case 36303:case 36311:case 36292:return NE}}class UE{constructor(e,t,r){this.id=e,this.addr=r,this.cache=[],this.type=t.type,this.setValue=pE(t.type)}}class FE{constructor(e,t,r){this.id=e,this.addr=r,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=IE(t.type)}}class OE{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,r){const o=this.seq;for(let l=0,c=o.length;l!==c;++l){const d=o[l];d.setValue(e,t[d.id],r)}}}const Ff=/(\w+)(\])?(\[|\.)?/g;function Sg(s,e){s.seq.push(e),s.map[e.id]=e}function BE(s,e,t){const r=s.name,o=r.length;for(Ff.lastIndex=0;;){const l=Ff.exec(r),c=Ff.lastIndex;let d=l[1];const p=l[2]==="]",m=l[3];if(p&&(d=d|0),m===void 0||m==="["&&c+2===o){Sg(t,m===void 0?new UE(d,s,e):new FE(d,s,e));break}else{let y=t.map[d];y===void 0&&(y=new OE(d),Sg(t,y)),t=y}}}class ru{constructor(e,t){this.seq=[],this.map={};const r=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let c=0;c<r;++c){const d=e.getActiveUniform(t,c),p=e.getUniformLocation(t,d.name);BE(d,p,this)}const o=[],l=[];for(const c of this.seq)c.type===e.SAMPLER_2D_SHADOW||c.type===e.SAMPLER_CUBE_SHADOW||c.type===e.SAMPLER_2D_ARRAY_SHADOW?o.push(c):l.push(c);o.length>0&&(this.seq=o.concat(l))}setValue(e,t,r,o){const l=this.map[t];l!==void 0&&l.setValue(e,r,o)}setOptional(e,t,r){const o=t[r];o!==void 0&&this.setValue(e,r,o)}static upload(e,t,r,o){for(let l=0,c=t.length;l!==c;++l){const d=t[l],p=r[d.id];p.needsUpdate!==!1&&d.setValue(e,p.value,o)}}static seqWithValue(e,t){const r=[];for(let o=0,l=e.length;o!==l;++o){const c=e[o];c.id in t&&r.push(c)}return r}}function Mg(s,e,t){const r=s.createShader(e);return s.shaderSource(r,t),s.compileShader(r),r}const kE=37297;let zE=0;function VE(s,e){const t=s.split(`
`),r=[],o=Math.max(e-6,0),l=Math.min(e+6,t.length);for(let c=o;c<l;c++){const d=c+1;r.push(`${d===e?">":" "} ${d}: ${t[c]}`)}return r.join(`
`)}const Eg=new ut;function HE(s){vt._getMatrix(Eg,vt.workingColorSpace,s);const e=`mat3( ${Eg.elements.map(t=>t.toFixed(4))} )`;switch(vt.getTransfer(s)){case uu:return[e,"LinearTransferOETF"];case Lt:return[e,"sRGBTransferOETF"];default:return rt("WebGLProgram: Unsupported color space: ",s),[e,"LinearTransferOETF"]}}function Tg(s,e,t){const r=s.getShaderParameter(e,s.COMPILE_STATUS),l=(s.getShaderInfoLog(e)||"").trim();if(r&&l==="")return"";const c=/ERROR: 0:(\d+)/.exec(l);if(c){const d=parseInt(c[1]);return t.toUpperCase()+`

`+l+`

`+VE(s.getShaderSource(e),d)}else return l}function GE(s,e){const t=HE(e);return[`vec4 ${s}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}const WE={[Gg]:"Linear",[Wg]:"Reinhard",[Xg]:"Cineon",[Yg]:"ACESFilmic",[Kg]:"AgX",[$g]:"Neutral",[qg]:"Custom"};function XE(s,e){const t=WE[e];return t===void 0?(rt("WebGLProgram: Unsupported toneMapping:",e),"vec3 "+s+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+s+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}const Zl=new H;function YE(){vt.getLuminanceCoefficients(Zl);const s=Zl.x.toFixed(4),e=Zl.y.toFixed(4),t=Zl.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${s}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function qE(s){return[s.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",s.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(lo).join(`
`)}function KE(s){const e=[];for(const t in s){const r=s[t];r!==!1&&e.push("#define "+t+" "+r)}return e.join(`
`)}function $E(s,e){const t={},r=s.getProgramParameter(e,s.ACTIVE_ATTRIBUTES);for(let o=0;o<r;o++){const l=s.getActiveAttrib(e,o),c=l.name;let d=1;l.type===s.FLOAT_MAT2&&(d=2),l.type===s.FLOAT_MAT3&&(d=3),l.type===s.FLOAT_MAT4&&(d=4),t[c]={type:l.type,location:s.getAttribLocation(e,c),locationSize:d}}return t}function lo(s){return s!==""}function wg(s,e){const t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return s.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function Ag(s,e){return s.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}const ZE=/^[ \t]*#include +<([\w\d./]+)>/gm;function Nd(s){return s.replace(ZE,JE)}const QE=new Map;function JE(s,e){let t=ft[e];if(t===void 0){const r=QE.get(e);if(r!==void 0)t=ft[r],rt('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,r);else throw new Error("THREE.WebGLProgram: Can not resolve #include <"+e+">")}return Nd(t)}const jE=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Rg(s){return s.replace(jE,eT)}function eT(s,e,t,r){let o="";for(let l=parseInt(e);l<parseInt(t);l++)o+=r.replace(/\[\s*i\s*\]/g,"[ "+l+" ]").replace(/UNROLLED_LOOP_INDEX/g,l);return o}function Cg(s){let e=`precision ${s.precision} float;
	precision ${s.precision} int;
	precision ${s.precision} sampler2D;
	precision ${s.precision} samplerCube;
	precision ${s.precision} sampler3D;
	precision ${s.precision} sampler2DArray;
	precision ${s.precision} sampler2DShadow;
	precision ${s.precision} samplerCubeShadow;
	precision ${s.precision} sampler2DArrayShadow;
	precision ${s.precision} isampler2D;
	precision ${s.precision} isampler3D;
	precision ${s.precision} isamplerCube;
	precision ${s.precision} isampler2DArray;
	precision ${s.precision} usampler2D;
	precision ${s.precision} usampler3D;
	precision ${s.precision} usamplerCube;
	precision ${s.precision} usampler2DArray;
	`;return s.precision==="highp"?e+=`
#define HIGH_PRECISION`:s.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:s.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}const tT={[Jl]:"SHADOWMAP_TYPE_PCF",[oo]:"SHADOWMAP_TYPE_VSM"};function nT(s){return tT[s.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}const iT={[ds]:"ENVMAP_TYPE_CUBE",[fa]:"ENVMAP_TYPE_CUBE",[mu]:"ENVMAP_TYPE_CUBE_UV"};function rT(s){return s.envMap===!1?"ENVMAP_TYPE_CUBE":iT[s.envMapMode]||"ENVMAP_TYPE_CUBE"}const sT={[fa]:"ENVMAP_MODE_REFRACTION"};function aT(s){return s.envMap===!1?"ENVMAP_MODE_REFLECTION":sT[s.envMapMode]||"ENVMAP_MODE_REFLECTION"}const oT={[Ud]:"ENVMAP_BLENDING_MULTIPLY",[Fv]:"ENVMAP_BLENDING_MIX",[Ov]:"ENVMAP_BLENDING_ADD"};function lT(s){return s.envMap===!1?"ENVMAP_BLENDING_NONE":oT[s.combine]||"ENVMAP_BLENDING_NONE"}function uT(s){const e=s.envMapCubeUVHeight;if(e===null)return null;const t=Math.log2(e)-2,r=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),7*16)),texelHeight:r,maxMip:t}}function cT(s,e,t,r){const o=s.getContext(),l=t.defines;let c=t.vertexShader,d=t.fragmentShader;const p=nT(t),m=rT(t),x=aT(t),y=lT(t),g=uT(t),M=qE(t),E=KE(l),R=o.createProgram();let v,_,b=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(v=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,E].filter(lo).join(`
`),v.length>0&&(v+=`
`),_=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,E].filter(lo).join(`
`),_.length>0&&(_+=`
`)):(v=[Cg(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,E,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+x:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexNormals?"#define HAS_NORMAL":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+p:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(lo).join(`
`),_=[Cg(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,E,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+m:"",t.envMap?"#define "+x:"",t.envMap?"#define "+y:"",g?"#define CUBEUV_TEXEL_WIDTH "+g.texelWidth:"",g?"#define CUBEUV_TEXEL_HEIGHT "+g.texelHeight:"",g?"#define CUBEUV_MAX_MIP "+g.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor?"#define USE_COLOR":"",t.vertexAlphas||t.batchingColor?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+p:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.numLightProbeGrids>0?"#define USE_LIGHT_PROBES_GRID":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==Oi?"#define TONE_MAPPING":"",t.toneMapping!==Oi?ft.tonemapping_pars_fragment:"",t.toneMapping!==Oi?XE("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",ft.colorspace_pars_fragment,GE("linearToOutputTexel",t.outputColorSpace),YE(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(lo).join(`
`)),c=Nd(c),c=wg(c,t),c=Ag(c,t),d=Nd(d),d=wg(d,t),d=Ag(d,t),c=Rg(c),d=Rg(d),t.isRawShaderMaterial!==!0&&(b=`#version 300 es
`,v=[M,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+v,_=["#define varying in",t.glslVersion===Nm?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===Nm?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+_);const N=b+v+c,C=b+_+d,I=Mg(o,o.VERTEX_SHADER,N),P=Mg(o,o.FRAGMENT_SHADER,C);o.attachShader(R,I),o.attachShader(R,P),t.index0AttributeName!==void 0?o.bindAttribLocation(R,0,t.index0AttributeName):t.hasPositionAttribute===!0&&o.bindAttribLocation(R,0,"position"),o.linkProgram(R);function O(k){if(s.debug.checkShaderErrors){const K=o.getProgramInfoLog(R)||"",ce=o.getShaderInfoLog(I)||"",me=o.getShaderInfoLog(P)||"",Q=K.trim(),ue=ce.trim(),$=me.trim();let Y=!0,ae=!0;if(o.getProgramParameter(R,o.LINK_STATUS)===!1)if(Y=!1,typeof s.debug.onShaderError=="function")s.debug.onShaderError(o,R,I,P);else{const oe=Tg(o,I,"vertex"),F=Tg(o,P,"fragment");St("WebGLProgram: Shader Error "+o.getError()+" - VALIDATE_STATUS "+o.getProgramParameter(R,o.VALIDATE_STATUS)+`

Material Name: `+k.name+`
Material Type: `+k.type+`

Program Info Log: `+Q+`
`+oe+`
`+F)}else Q!==""?rt("WebGLProgram: Program Info Log:",Q):(ue===""||$==="")&&(ae=!1);ae&&(k.diagnostics={runnable:Y,programLog:Q,vertexShader:{log:ue,prefix:v},fragmentShader:{log:$,prefix:_}})}o.deleteShader(I),o.deleteShader(P),T=new ru(o,R),D=$E(o,R)}let T;this.getUniforms=function(){return T===void 0&&O(this),T};let D;this.getAttributes=function(){return D===void 0&&O(this),D};let z=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return z===!1&&(z=o.getProgramParameter(R,kE)),z},this.destroy=function(){r.releaseStatesOfProgram(this),o.deleteProgram(R),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=zE++,this.cacheKey=e,this.usedTimes=1,this.program=R,this.vertexShader=I,this.fragmentShader=P,this}let fT=0;class dT{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e,t,r){const o=this._getShaderCacheForMaterial(e);return o.has(t)===!1&&(o.add(t),t.usedTimes++),o.has(r)===!1&&(o.add(r),r.usedTimes++),this}remove(e){const t=this.materialCache.get(e);for(const r of t)r.usedTimes--,r.usedTimes===0&&this.shaderCache.delete(r.code);return this.materialCache.delete(e),this}getVertexShaderStage(e){return this._getShaderStage(e.vertexShader)}getFragmentShaderStage(e){return this._getShaderStage(e.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const t=this.materialCache;let r=t.get(e);return r===void 0&&(r=new Set,t.set(e,r)),r}_getShaderStage(e){const t=this.shaderCache;let r=t.get(e);return r===void 0&&(r=new hT(e),t.set(e,r)),r}}class hT{constructor(e){this.id=fT++,this.code=e,this.usedTimes=0}}function pT(s){return s===hs||s===au||s===ou}function mT(s,e,t,r,o,l){const c=new a_,d=new dT,p=new Set,m=[],x=new Map,y=r.logarithmicDepthBuffer;let g=r.precision;const M={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function E(T){return p.add(T),T===0?"uv":`uv${T}`}function R(T,D,z,k,K,ce){const me=k.fog,Q=K.geometry,ue=T.isMeshStandardMaterial||T.isMeshLambertMaterial||T.isMeshPhongMaterial?k.environment:null,$=T.isMeshStandardMaterial||T.isMeshLambertMaterial&&!T.envMap||T.isMeshPhongMaterial&&!T.envMap,Y=e.get(T.envMap||ue,$),ae=Y&&Y.mapping===mu?Y.image.height:null,oe=M[T.type];T.precision!==null&&(g=r.getMaxPrecision(T.precision),g!==T.precision&&rt("WebGLProgram.getParameters:",T.precision,"not supported, using",g,"instead."));const F=Q.morphAttributes.position||Q.morphAttributes.normal||Q.morphAttributes.color,Z=F!==void 0?F.length:0;let Ne=0;Q.morphAttributes.position!==void 0&&(Ne=1),Q.morphAttributes.normal!==void 0&&(Ne=2),Q.morphAttributes.color!==void 0&&(Ne=3);let qe,ke,ie,_e;if(oe){const ze=Di[oe];qe=ze.vertexShader,ke=ze.fragmentShader}else{qe=T.vertexShader,ke=T.fragmentShader;const ze=d.getVertexShaderStage(T),Dt=d.getFragmentShaderStage(T);d.update(T,ze,Dt),ie=ze.id,_e=Dt.id}const he=s.getRenderTarget(),Ie=s.state.buffers.depth.getReversed(),Je=K.isInstancedMesh===!0,je=K.isBatchedMesh===!0,Vt=!!T.map,ct=!!T.matcap,wt=!!Y,xt=!!T.aoMap,_t=!!T.lightMap,Ht=!!T.bumpMap&&T.wireframe===!1,Qt=!!T.normalMap,Jt=!!T.displacementMap,Yt=!!T.emissiveMap,Ct=!!T.metalnessMap,Gt=!!T.roughnessMap,W=T.anisotropy>0,gn=T.clearcoat>0,Et=T.dispersion>0,L=T.iridescence>0,S=T.sheen>0,q=T.transmission>0,ne=W&&!!T.anisotropyMap,le=gn&&!!T.clearcoatMap,Se=gn&&!!T.clearcoatNormalMap,Re=gn&&!!T.clearcoatRoughnessMap,fe=L&&!!T.iridescenceMap,pe=L&&!!T.iridescenceThicknessMap,be=S&&!!T.sheenColorMap,Xe=S&&!!T.sheenRoughnessMap,Pe=!!T.specularMap,Ae=!!T.specularColorMap,Ze=!!T.specularIntensityMap,et=q&&!!T.transmissionMap,it=q&&!!T.thicknessMap,V=!!T.gradientMap,we=!!T.alphaMap,de=T.alphaTest>0,Ce=!!T.alphaHash,Le=!!T.extensions;let ge=Oi;T.toneMapped&&(he===null||he.isXRRenderTarget===!0)&&(ge=s.toneMapping);const He={shaderID:oe,shaderType:T.type,shaderName:T.name,vertexShader:qe,fragmentShader:ke,defines:T.defines,customVertexShaderID:ie,customFragmentShaderID:_e,isRawShaderMaterial:T.isRawShaderMaterial===!0,glslVersion:T.glslVersion,precision:g,batching:je,batchingColor:je&&K._colorsTexture!==null,instancing:Je,instancingColor:Je&&K.instanceColor!==null,instancingMorph:Je&&K.morphTexture!==null,outputColorSpace:he===null?s.outputColorSpace:he.isXRRenderTarget===!0?he.texture.colorSpace:vt.workingColorSpace,alphaToCoverage:!!T.alphaToCoverage,map:Vt,matcap:ct,envMap:wt,envMapMode:wt&&Y.mapping,envMapCubeUVHeight:ae,aoMap:xt,lightMap:_t,bumpMap:Ht,normalMap:Qt,displacementMap:Jt,emissiveMap:Yt,normalMapObjectSpace:Qt&&T.normalMapType===zv,normalMapTangentSpace:Qt&&T.normalMapType===Cd,packedNormalMap:Qt&&T.normalMapType===Cd&&pT(T.normalMap.format),metalnessMap:Ct,roughnessMap:Gt,anisotropy:W,anisotropyMap:ne,clearcoat:gn,clearcoatMap:le,clearcoatNormalMap:Se,clearcoatRoughnessMap:Re,dispersion:Et,iridescence:L,iridescenceMap:fe,iridescenceThicknessMap:pe,sheen:S,sheenColorMap:be,sheenRoughnessMap:Xe,specularMap:Pe,specularColorMap:Ae,specularIntensityMap:Ze,transmission:q,transmissionMap:et,thicknessMap:it,gradientMap:V,opaque:T.transparent===!1&&T.blending===oa&&T.alphaToCoverage===!1,alphaMap:we,alphaTest:de,alphaHash:Ce,combine:T.combine,mapUv:Vt&&E(T.map.channel),aoMapUv:xt&&E(T.aoMap.channel),lightMapUv:_t&&E(T.lightMap.channel),bumpMapUv:Ht&&E(T.bumpMap.channel),normalMapUv:Qt&&E(T.normalMap.channel),displacementMapUv:Jt&&E(T.displacementMap.channel),emissiveMapUv:Yt&&E(T.emissiveMap.channel),metalnessMapUv:Ct&&E(T.metalnessMap.channel),roughnessMapUv:Gt&&E(T.roughnessMap.channel),anisotropyMapUv:ne&&E(T.anisotropyMap.channel),clearcoatMapUv:le&&E(T.clearcoatMap.channel),clearcoatNormalMapUv:Se&&E(T.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:Re&&E(T.clearcoatRoughnessMap.channel),iridescenceMapUv:fe&&E(T.iridescenceMap.channel),iridescenceThicknessMapUv:pe&&E(T.iridescenceThicknessMap.channel),sheenColorMapUv:be&&E(T.sheenColorMap.channel),sheenRoughnessMapUv:Xe&&E(T.sheenRoughnessMap.channel),specularMapUv:Pe&&E(T.specularMap.channel),specularColorMapUv:Ae&&E(T.specularColorMap.channel),specularIntensityMapUv:Ze&&E(T.specularIntensityMap.channel),transmissionMapUv:et&&E(T.transmissionMap.channel),thicknessMapUv:it&&E(T.thicknessMap.channel),alphaMapUv:we&&E(T.alphaMap.channel),vertexTangents:!!Q.attributes.tangent&&(Qt||W),vertexNormals:!!Q.attributes.normal,vertexColors:T.vertexColors,vertexAlphas:T.vertexColors===!0&&!!Q.attributes.color&&Q.attributes.color.itemSize===4,pointsUvs:K.isPoints===!0&&!!Q.attributes.uv&&(Vt||we),fog:!!me,useFog:T.fog===!0,fogExp2:!!me&&me.isFogExp2,flatShading:T.wireframe===!1&&(T.flatShading===!0||Q.attributes.normal===void 0&&Qt===!1&&(T.isMeshLambertMaterial||T.isMeshPhongMaterial||T.isMeshStandardMaterial||T.isMeshPhysicalMaterial)),sizeAttenuation:T.sizeAttenuation===!0,logarithmicDepthBuffer:y,reversedDepthBuffer:Ie,skinning:K.isSkinnedMesh===!0,hasPositionAttribute:Q.attributes.position!==void 0,morphTargets:Q.morphAttributes.position!==void 0,morphNormals:Q.morphAttributes.normal!==void 0,morphColors:Q.morphAttributes.color!==void 0,morphTargetsCount:Z,morphTextureStride:Ne,numDirLights:D.directional.length,numPointLights:D.point.length,numSpotLights:D.spot.length,numSpotLightMaps:D.spotLightMap.length,numRectAreaLights:D.rectArea.length,numHemiLights:D.hemi.length,numDirLightShadows:D.directionalShadowMap.length,numPointLightShadows:D.pointShadowMap.length,numSpotLightShadows:D.spotShadowMap.length,numSpotLightShadowsWithMaps:D.numSpotLightShadowsWithMaps,numLightProbes:D.numLightProbes,numLightProbeGrids:ce.length,numClippingPlanes:l.numPlanes,numClipIntersection:l.numIntersection,dithering:T.dithering,shadowMapEnabled:s.shadowMap.enabled&&z.length>0,shadowMapType:s.shadowMap.type,toneMapping:ge,decodeVideoTexture:Vt&&T.map.isVideoTexture===!0&&vt.getTransfer(T.map.colorSpace)===Lt,decodeVideoTextureEmissive:Yt&&T.emissiveMap.isVideoTexture===!0&&vt.getTransfer(T.emissiveMap.colorSpace)===Lt,premultipliedAlpha:T.premultipliedAlpha,doubleSided:T.side===Ni,flipSided:T.side===On,useDepthPacking:T.depthPacking>=0,depthPacking:T.depthPacking||0,index0AttributeName:T.index0AttributeName,extensionClipCullDistance:Le&&T.extensions.clipCullDistance===!0&&t.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(Le&&T.extensions.multiDraw===!0||je)&&t.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:t.has("KHR_parallel_shader_compile"),customProgramCacheKey:T.customProgramCacheKey()};return He.vertexUv1s=p.has(1),He.vertexUv2s=p.has(2),He.vertexUv3s=p.has(3),p.clear(),He}function v(T){const D=[];if(T.shaderID?D.push(T.shaderID):(D.push(T.customVertexShaderID),D.push(T.customFragmentShaderID)),T.defines!==void 0)for(const z in T.defines)D.push(z),D.push(T.defines[z]);return T.isRawShaderMaterial===!1&&(_(D,T),b(D,T),D.push(s.outputColorSpace)),D.push(T.customProgramCacheKey),D.join()}function _(T,D){T.push(D.precision),T.push(D.outputColorSpace),T.push(D.envMapMode),T.push(D.envMapCubeUVHeight),T.push(D.mapUv),T.push(D.alphaMapUv),T.push(D.lightMapUv),T.push(D.aoMapUv),T.push(D.bumpMapUv),T.push(D.normalMapUv),T.push(D.displacementMapUv),T.push(D.emissiveMapUv),T.push(D.metalnessMapUv),T.push(D.roughnessMapUv),T.push(D.anisotropyMapUv),T.push(D.clearcoatMapUv),T.push(D.clearcoatNormalMapUv),T.push(D.clearcoatRoughnessMapUv),T.push(D.iridescenceMapUv),T.push(D.iridescenceThicknessMapUv),T.push(D.sheenColorMapUv),T.push(D.sheenRoughnessMapUv),T.push(D.specularMapUv),T.push(D.specularColorMapUv),T.push(D.specularIntensityMapUv),T.push(D.transmissionMapUv),T.push(D.thicknessMapUv),T.push(D.combine),T.push(D.fogExp2),T.push(D.sizeAttenuation),T.push(D.morphTargetsCount),T.push(D.morphAttributeCount),T.push(D.numDirLights),T.push(D.numPointLights),T.push(D.numSpotLights),T.push(D.numSpotLightMaps),T.push(D.numHemiLights),T.push(D.numRectAreaLights),T.push(D.numDirLightShadows),T.push(D.numPointLightShadows),T.push(D.numSpotLightShadows),T.push(D.numSpotLightShadowsWithMaps),T.push(D.numLightProbes),T.push(D.shadowMapType),T.push(D.toneMapping),T.push(D.numClippingPlanes),T.push(D.numClipIntersection),T.push(D.depthPacking)}function b(T,D){c.disableAll(),D.instancing&&c.enable(0),D.instancingColor&&c.enable(1),D.instancingMorph&&c.enable(2),D.matcap&&c.enable(3),D.envMap&&c.enable(4),D.normalMapObjectSpace&&c.enable(5),D.normalMapTangentSpace&&c.enable(6),D.clearcoat&&c.enable(7),D.iridescence&&c.enable(8),D.alphaTest&&c.enable(9),D.vertexColors&&c.enable(10),D.vertexAlphas&&c.enable(11),D.vertexUv1s&&c.enable(12),D.vertexUv2s&&c.enable(13),D.vertexUv3s&&c.enable(14),D.vertexTangents&&c.enable(15),D.anisotropy&&c.enable(16),D.alphaHash&&c.enable(17),D.batching&&c.enable(18),D.dispersion&&c.enable(19),D.batchingColor&&c.enable(20),D.gradientMap&&c.enable(21),D.packedNormalMap&&c.enable(22),D.vertexNormals&&c.enable(23),T.push(c.mask),c.disableAll(),D.fog&&c.enable(0),D.useFog&&c.enable(1),D.flatShading&&c.enable(2),D.logarithmicDepthBuffer&&c.enable(3),D.reversedDepthBuffer&&c.enable(4),D.skinning&&c.enable(5),D.morphTargets&&c.enable(6),D.morphNormals&&c.enable(7),D.morphColors&&c.enable(8),D.premultipliedAlpha&&c.enable(9),D.shadowMapEnabled&&c.enable(10),D.doubleSided&&c.enable(11),D.flipSided&&c.enable(12),D.useDepthPacking&&c.enable(13),D.dithering&&c.enable(14),D.transmission&&c.enable(15),D.sheen&&c.enable(16),D.opaque&&c.enable(17),D.pointsUvs&&c.enable(18),D.decodeVideoTexture&&c.enable(19),D.decodeVideoTextureEmissive&&c.enable(20),D.alphaToCoverage&&c.enable(21),D.numLightProbeGrids>0&&c.enable(22),D.hasPositionAttribute&&c.enable(23),T.push(c.mask)}function N(T){const D=M[T.type];let z;if(D){const k=Di[D];z=bx.clone(k.uniforms)}else z=T.uniforms;return z}function C(T,D){let z=x.get(D);return z!==void 0?++z.usedTimes:(z=new cT(s,D,T,o),m.push(z),x.set(D,z)),z}function I(T){if(--T.usedTimes===0){const D=m.indexOf(T);m[D]=m[m.length-1],m.pop(),x.delete(T.cacheKey),T.destroy()}}function P(T){d.remove(T)}function O(){d.dispose()}return{getParameters:R,getProgramCacheKey:v,getUniforms:N,acquireProgram:C,releaseProgram:I,releaseShaderCache:P,programs:m,dispose:O}}function gT(){let s=new WeakMap;function e(c){return s.has(c)}function t(c){let d=s.get(c);return d===void 0&&(d={},s.set(c,d)),d}function r(c){s.delete(c)}function o(c,d,p){s.get(c)[d]=p}function l(){s=new WeakMap}return{has:e,get:t,remove:r,update:o,dispose:l}}function _T(s,e){return s.groupOrder!==e.groupOrder?s.groupOrder-e.groupOrder:s.renderOrder!==e.renderOrder?s.renderOrder-e.renderOrder:s.material.id!==e.material.id?s.material.id-e.material.id:s.materialVariant!==e.materialVariant?s.materialVariant-e.materialVariant:s.z!==e.z?s.z-e.z:s.id-e.id}function bg(s,e){return s.groupOrder!==e.groupOrder?s.groupOrder-e.groupOrder:s.renderOrder!==e.renderOrder?s.renderOrder-e.renderOrder:s.z!==e.z?e.z-s.z:s.id-e.id}function Pg(){const s=[];let e=0;const t=[],r=[],o=[];function l(){e=0,t.length=0,r.length=0,o.length=0}function c(g){let M=0;return g.isInstancedMesh&&(M+=2),g.isSkinnedMesh&&(M+=1),M}function d(g,M,E,R,v,_){let b=s[e];return b===void 0?(b={id:g.id,object:g,geometry:M,material:E,materialVariant:c(g),groupOrder:R,renderOrder:g.renderOrder,z:v,group:_},s[e]=b):(b.id=g.id,b.object=g,b.geometry=M,b.material=E,b.materialVariant=c(g),b.groupOrder=R,b.renderOrder=g.renderOrder,b.z=v,b.group=_),e++,b}function p(g,M,E,R,v,_){const b=d(g,M,E,R,v,_);E.transmission>0?r.push(b):E.transparent===!0?o.push(b):t.push(b)}function m(g,M,E,R,v,_){const b=d(g,M,E,R,v,_);E.transmission>0?r.unshift(b):E.transparent===!0?o.unshift(b):t.unshift(b)}function x(g,M,E){t.length>1&&t.sort(g||_T),r.length>1&&r.sort(M||bg),o.length>1&&o.sort(M||bg),E&&(t.reverse(),r.reverse(),o.reverse())}function y(){for(let g=e,M=s.length;g<M;g++){const E=s[g];if(E.id===null)break;E.id=null,E.object=null,E.geometry=null,E.material=null,E.group=null}}return{opaque:t,transmissive:r,transparent:o,init:l,push:p,unshift:m,finish:y,sort:x}}function vT(){let s=new WeakMap;function e(r,o){const l=s.get(r);let c;return l===void 0?(c=new Pg,s.set(r,[c])):o>=l.length?(c=new Pg,l.push(c)):c=l[o],c}function t(){s=new WeakMap}return{get:e,dispose:t}}function xT(){const s={};return{get:function(e){if(s[e.id]!==void 0)return s[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new H,color:new dt};break;case"SpotLight":t={position:new H,direction:new H,color:new dt,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new H,color:new dt,distance:0,decay:0};break;case"HemisphereLight":t={direction:new H,skyColor:new dt,groundColor:new dt};break;case"RectAreaLight":t={color:new dt,position:new H,halfWidth:new H,halfHeight:new H};break}return s[e.id]=t,t}}}function yT(){const s={};return{get:function(e){if(s[e.id]!==void 0)return s[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Qe};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Qe};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Qe,shadowCameraNear:1,shadowCameraFar:1e3};break}return s[e.id]=t,t}}}let ST=0;function MT(s,e){return(e.castShadow?2:0)-(s.castShadow?2:0)+(e.map?1:0)-(s.map?1:0)}function ET(s){const e=new xT,t=yT(),r={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let m=0;m<9;m++)r.probe.push(new H);const o=new H,l=new Ut,c=new Ut;function d(m){let x=0,y=0,g=0;for(let D=0;D<9;D++)r.probe[D].set(0,0,0);let M=0,E=0,R=0,v=0,_=0,b=0,N=0,C=0,I=0,P=0,O=0;m.sort(MT);for(let D=0,z=m.length;D<z;D++){const k=m[D],K=k.color,ce=k.intensity,me=k.distance;let Q=null;if(k.shadow&&k.shadow.map&&(k.shadow.map.texture.format===hs?Q=k.shadow.map.texture:Q=k.shadow.map.depthTexture||k.shadow.map.texture),k.isAmbientLight)x+=K.r*ce,y+=K.g*ce,g+=K.b*ce;else if(k.isLightProbe){for(let ue=0;ue<9;ue++)r.probe[ue].addScaledVector(k.sh.coefficients[ue],ce);O++}else if(k.isDirectionalLight){const ue=e.get(k);if(ue.color.copy(k.color).multiplyScalar(k.intensity),k.castShadow){const $=k.shadow,Y=t.get(k);Y.shadowIntensity=$.intensity,Y.shadowBias=$.bias,Y.shadowNormalBias=$.normalBias,Y.shadowRadius=$.radius,Y.shadowMapSize=$.mapSize,r.directionalShadow[M]=Y,r.directionalShadowMap[M]=Q,r.directionalShadowMatrix[M]=k.shadow.matrix,b++}r.directional[M]=ue,M++}else if(k.isSpotLight){const ue=e.get(k);ue.position.setFromMatrixPosition(k.matrixWorld),ue.color.copy(K).multiplyScalar(ce),ue.distance=me,ue.coneCos=Math.cos(k.angle),ue.penumbraCos=Math.cos(k.angle*(1-k.penumbra)),ue.decay=k.decay,r.spot[R]=ue;const $=k.shadow;if(k.map&&(r.spotLightMap[I]=k.map,I++,$.updateMatrices(k),k.castShadow&&P++),r.spotLightMatrix[R]=$.matrix,k.castShadow){const Y=t.get(k);Y.shadowIntensity=$.intensity,Y.shadowBias=$.bias,Y.shadowNormalBias=$.normalBias,Y.shadowRadius=$.radius,Y.shadowMapSize=$.mapSize,r.spotShadow[R]=Y,r.spotShadowMap[R]=Q,C++}R++}else if(k.isRectAreaLight){const ue=e.get(k);ue.color.copy(K).multiplyScalar(ce),ue.halfWidth.set(k.width*.5,0,0),ue.halfHeight.set(0,k.height*.5,0),r.rectArea[v]=ue,v++}else if(k.isPointLight){const ue=e.get(k);if(ue.color.copy(k.color).multiplyScalar(k.intensity),ue.distance=k.distance,ue.decay=k.decay,k.castShadow){const $=k.shadow,Y=t.get(k);Y.shadowIntensity=$.intensity,Y.shadowBias=$.bias,Y.shadowNormalBias=$.normalBias,Y.shadowRadius=$.radius,Y.shadowMapSize=$.mapSize,Y.shadowCameraNear=$.camera.near,Y.shadowCameraFar=$.camera.far,r.pointShadow[E]=Y,r.pointShadowMap[E]=Q,r.pointShadowMatrix[E]=k.shadow.matrix,N++}r.point[E]=ue,E++}else if(k.isHemisphereLight){const ue=e.get(k);ue.skyColor.copy(k.color).multiplyScalar(ce),ue.groundColor.copy(k.groundColor).multiplyScalar(ce),r.hemi[_]=ue,_++}}v>0&&(s.has("OES_texture_float_linear")===!0?(r.rectAreaLTC1=De.LTC_FLOAT_1,r.rectAreaLTC2=De.LTC_FLOAT_2):(r.rectAreaLTC1=De.LTC_HALF_1,r.rectAreaLTC2=De.LTC_HALF_2)),r.ambient[0]=x,r.ambient[1]=y,r.ambient[2]=g;const T=r.hash;(T.directionalLength!==M||T.pointLength!==E||T.spotLength!==R||T.rectAreaLength!==v||T.hemiLength!==_||T.numDirectionalShadows!==b||T.numPointShadows!==N||T.numSpotShadows!==C||T.numSpotMaps!==I||T.numLightProbes!==O)&&(r.directional.length=M,r.spot.length=R,r.rectArea.length=v,r.point.length=E,r.hemi.length=_,r.directionalShadow.length=b,r.directionalShadowMap.length=b,r.pointShadow.length=N,r.pointShadowMap.length=N,r.spotShadow.length=C,r.spotShadowMap.length=C,r.directionalShadowMatrix.length=b,r.pointShadowMatrix.length=N,r.spotLightMatrix.length=C+I-P,r.spotLightMap.length=I,r.numSpotLightShadowsWithMaps=P,r.numLightProbes=O,T.directionalLength=M,T.pointLength=E,T.spotLength=R,T.rectAreaLength=v,T.hemiLength=_,T.numDirectionalShadows=b,T.numPointShadows=N,T.numSpotShadows=C,T.numSpotMaps=I,T.numLightProbes=O,r.version=ST++)}function p(m,x){let y=0,g=0,M=0,E=0,R=0;const v=x.matrixWorldInverse;for(let _=0,b=m.length;_<b;_++){const N=m[_];if(N.isDirectionalLight){const C=r.directional[y];C.direction.setFromMatrixPosition(N.matrixWorld),o.setFromMatrixPosition(N.target.matrixWorld),C.direction.sub(o),C.direction.transformDirection(v),y++}else if(N.isSpotLight){const C=r.spot[M];C.position.setFromMatrixPosition(N.matrixWorld),C.position.applyMatrix4(v),C.direction.setFromMatrixPosition(N.matrixWorld),o.setFromMatrixPosition(N.target.matrixWorld),C.direction.sub(o),C.direction.transformDirection(v),M++}else if(N.isRectAreaLight){const C=r.rectArea[E];C.position.setFromMatrixPosition(N.matrixWorld),C.position.applyMatrix4(v),c.identity(),l.copy(N.matrixWorld),l.premultiply(v),c.extractRotation(l),C.halfWidth.set(N.width*.5,0,0),C.halfHeight.set(0,N.height*.5,0),C.halfWidth.applyMatrix4(c),C.halfHeight.applyMatrix4(c),E++}else if(N.isPointLight){const C=r.point[g];C.position.setFromMatrixPosition(N.matrixWorld),C.position.applyMatrix4(v),g++}else if(N.isHemisphereLight){const C=r.hemi[R];C.direction.setFromMatrixPosition(N.matrixWorld),C.direction.transformDirection(v),R++}}}return{setup:d,setupView:p,state:r}}function Lg(s){const e=new ET(s),t=[],r=[],o=[];function l(g){y.camera=g,t.length=0,r.length=0,o.length=0}function c(g){t.push(g)}function d(g){r.push(g)}function p(g){o.push(g)}function m(){e.setup(t)}function x(g){e.setupView(t,g)}const y={lightsArray:t,shadowsArray:r,lightProbeGridArray:o,camera:null,lights:e,transmissionRenderTarget:{},textureUnits:0};return{init:l,state:y,setupLights:m,setupLightsView:x,pushLight:c,pushShadow:d,pushLightProbeGrid:p}}function TT(s){let e=new WeakMap;function t(o,l=0){const c=e.get(o);let d;return c===void 0?(d=new Lg(s),e.set(o,[d])):l>=c.length?(d=new Lg(s),c.push(d)):d=c[l],d}function r(){e=new WeakMap}return{get:t,dispose:r}}const wT=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,AT=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,RT=[new H(1,0,0),new H(-1,0,0),new H(0,1,0),new H(0,-1,0),new H(0,0,1),new H(0,0,-1)],CT=[new H(0,-1,0),new H(0,-1,0),new H(0,0,1),new H(0,0,-1),new H(0,-1,0),new H(0,-1,0)],Dg=new Ut,ao=new H,Of=new H;function bT(s,e,t){let r=new Xd;const o=new Qe,l=new Qe,c=new Zt,d=new Ix,p=new Ux,m={},x=t.maxTextureSize,y={[Ur]:On,[On]:Ur,[Ni]:Ni},g=new zi({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Qe},radius:{value:4}},vertexShader:wT,fragmentShader:AT}),M=g.clone();M.defines.HORIZONTAL_PASS=1;const E=new Mn;E.setAttribute("position",new Ti(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const R=new qn(E,g),v=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Jl;let _=this.type;this.render=function(P,O,T){if(v.enabled===!1||v.autoUpdate===!1&&v.needsUpdate===!1||P.length===0)return;this.type===_v&&(rt("WebGLShadowMap: PCFSoftShadowMap has been deprecated. Using PCFShadowMap instead."),this.type=Jl);const D=s.getRenderTarget(),z=s.getActiveCubeFace(),k=s.getActiveMipmapLevel(),K=s.state;K.setBlending(nr),K.buffers.depth.getReversed()===!0?K.buffers.color.setClear(0,0,0,0):K.buffers.color.setClear(1,1,1,1),K.buffers.depth.setTest(!0),K.setScissorTest(!1);const ce=_!==this.type;ce&&O.traverse(function(me){me.material&&(Array.isArray(me.material)?me.material.forEach(Q=>Q.needsUpdate=!0):me.material.needsUpdate=!0)});for(let me=0,Q=P.length;me<Q;me++){const ue=P[me],$=ue.shadow;if($===void 0){rt("WebGLShadowMap:",ue,"has no shadow.");continue}if($.autoUpdate===!1&&$.needsUpdate===!1)continue;o.copy($.mapSize);const Y=$.getFrameExtents();o.multiply(Y),l.copy($.mapSize),(o.x>x||o.y>x)&&(o.x>x&&(l.x=Math.floor(x/Y.x),o.x=l.x*Y.x,$.mapSize.x=l.x),o.y>x&&(l.y=Math.floor(x/Y.y),o.y=l.y*Y.y,$.mapSize.y=l.y));const ae=s.state.buffers.depth.getReversed();if($.camera._reversedDepth=ae,$.map===null||ce===!0){if($.map!==null&&($.map.depthTexture!==null&&($.map.depthTexture.dispose(),$.map.depthTexture=null),$.map.dispose()),this.type===oo){if(ue.isPointLight){rt("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}$.map=new Bi(o.x,o.y,{format:hs,type:rr,minFilter:Pn,magFilter:Pn,generateMipmaps:!1}),$.map.texture.name=ue.name+".shadowMap",$.map.depthTexture=new ha(o.x,o.y,Ui),$.map.depthTexture.name=ue.name+".shadowMapDepth",$.map.depthTexture.format=sr,$.map.depthTexture.compareFunction=null,$.map.depthTexture.minFilter=yn,$.map.depthTexture.magFilter=yn}else ue.isPointLight?($.map=new S_(o.x),$.map.depthTexture=new Rx(o.x,ki)):($.map=new Bi(o.x,o.y),$.map.depthTexture=new ha(o.x,o.y,ki)),$.map.depthTexture.name=ue.name+".shadowMap",$.map.depthTexture.format=sr,this.type===Jl?($.map.depthTexture.compareFunction=ae?Gd:Hd,$.map.depthTexture.minFilter=Pn,$.map.depthTexture.magFilter=Pn):($.map.depthTexture.compareFunction=null,$.map.depthTexture.minFilter=yn,$.map.depthTexture.magFilter=yn);$.camera.updateProjectionMatrix()}const oe=$.map.isWebGLCubeRenderTarget?6:1;for(let F=0;F<oe;F++){if($.map.isWebGLCubeRenderTarget)s.setRenderTarget($.map,F),s.clear();else{F===0&&(s.setRenderTarget($.map),s.clear());const Z=$.getViewport(F);c.set(l.x*Z.x,l.y*Z.y,l.x*Z.z,l.y*Z.w),K.viewport(c)}if(ue.isPointLight){const Z=$.camera,Ne=$.matrix,qe=ue.distance||Z.far;qe!==Z.far&&(Z.far=qe,Z.updateProjectionMatrix()),ao.setFromMatrixPosition(ue.matrixWorld),Z.position.copy(ao),Of.copy(Z.position),Of.add(RT[F]),Z.up.copy(CT[F]),Z.lookAt(Of),Z.updateMatrixWorld(),Ne.makeTranslation(-ao.x,-ao.y,-ao.z),Dg.multiplyMatrices(Z.projectionMatrix,Z.matrixWorldInverse),$._frustum.setFromProjectionMatrix(Dg,Z.coordinateSystem,Z.reversedDepth)}else $.updateMatrices(ue);r=$.getFrustum(),C(O,T,$.camera,ue,this.type)}$.isPointLightShadow!==!0&&this.type===oo&&b($,T),$.needsUpdate=!1}_=this.type,v.needsUpdate=!1,s.setRenderTarget(D,z,k)};function b(P,O){const T=e.update(R);g.defines.VSM_SAMPLES!==P.blurSamples&&(g.defines.VSM_SAMPLES=P.blurSamples,M.defines.VSM_SAMPLES=P.blurSamples,g.needsUpdate=!0,M.needsUpdate=!0),P.mapPass===null&&(P.mapPass=new Bi(o.x,o.y,{format:hs,type:rr})),g.uniforms.shadow_pass.value=P.map.depthTexture,g.uniforms.resolution.value=P.mapSize,g.uniforms.radius.value=P.radius,s.setRenderTarget(P.mapPass),s.clear(),s.renderBufferDirect(O,null,T,g,R,null),M.uniforms.shadow_pass.value=P.mapPass.texture,M.uniforms.resolution.value=P.mapSize,M.uniforms.radius.value=P.radius,s.setRenderTarget(P.map),s.clear(),s.renderBufferDirect(O,null,T,M,R,null)}function N(P,O,T,D){let z=null;const k=T.isPointLight===!0?P.customDistanceMaterial:P.customDepthMaterial;if(k!==void 0)z=k;else if(z=T.isPointLight===!0?p:d,s.localClippingEnabled&&O.clipShadows===!0&&Array.isArray(O.clippingPlanes)&&O.clippingPlanes.length!==0||O.displacementMap&&O.displacementScale!==0||O.alphaMap&&O.alphaTest>0||O.map&&O.alphaTest>0||O.alphaToCoverage===!0){const K=z.uuid,ce=O.uuid;let me=m[K];me===void 0&&(me={},m[K]=me);let Q=me[ce];Q===void 0&&(Q=z.clone(),me[ce]=Q,O.addEventListener("dispose",I)),z=Q}if(z.visible=O.visible,z.wireframe=O.wireframe,D===oo?z.side=O.shadowSide!==null?O.shadowSide:O.side:z.side=O.shadowSide!==null?O.shadowSide:y[O.side],z.alphaMap=O.alphaMap,z.alphaTest=O.alphaToCoverage===!0?.5:O.alphaTest,z.map=O.map,z.clipShadows=O.clipShadows,z.clippingPlanes=O.clippingPlanes,z.clipIntersection=O.clipIntersection,z.displacementMap=O.displacementMap,z.displacementScale=O.displacementScale,z.displacementBias=O.displacementBias,z.wireframeLinewidth=O.wireframeLinewidth,z.linewidth=O.linewidth,T.isPointLight===!0&&z.isMeshDistanceMaterial===!0){const K=s.properties.get(z);K.light=T}return z}function C(P,O,T,D,z){if(P.visible===!1)return;if(P.layers.test(O.layers)&&(P.isMesh||P.isLine||P.isPoints)&&(P.castShadow||P.receiveShadow&&z===oo)&&(!P.frustumCulled||r.intersectsObject(P))){P.modelViewMatrix.multiplyMatrices(T.matrixWorldInverse,P.matrixWorld);const ce=e.update(P),me=P.material;if(Array.isArray(me)){const Q=ce.groups;for(let ue=0,$=Q.length;ue<$;ue++){const Y=Q[ue],ae=me[Y.materialIndex];if(ae&&ae.visible){const oe=N(P,ae,D,z);P.onBeforeShadow(s,P,O,T,ce,oe,Y),s.renderBufferDirect(T,null,ce,oe,P,Y),P.onAfterShadow(s,P,O,T,ce,oe,Y)}}}else if(me.visible){const Q=N(P,me,D,z);P.onBeforeShadow(s,P,O,T,ce,Q,null),s.renderBufferDirect(T,null,ce,Q,P,null),P.onAfterShadow(s,P,O,T,ce,Q,null)}}const K=P.children;for(let ce=0,me=K.length;ce<me;ce++)C(K[ce],O,T,D,z)}function I(P){P.target.removeEventListener("dispose",I);for(const T in m){const D=m[T],z=P.target.uuid;z in D&&(D[z].dispose(),delete D[z])}}}function PT(s,e){function t(){let V=!1;const we=new Zt;let de=null;const Ce=new Zt(0,0,0,0);return{setMask:function(Le){de!==Le&&!V&&(s.colorMask(Le,Le,Le,Le),de=Le)},setLocked:function(Le){V=Le},setClear:function(Le,ge,He,ze,Dt){Dt===!0&&(Le*=ze,ge*=ze,He*=ze),we.set(Le,ge,He,ze),Ce.equals(we)===!1&&(s.clearColor(Le,ge,He,ze),Ce.copy(we))},reset:function(){V=!1,de=null,Ce.set(-1,0,0,0)}}}function r(){let V=!1,we=!1,de=null,Ce=null,Le=null;return{setReversed:function(ge){if(we!==ge){const He=e.get("EXT_clip_control");ge?He.clipControlEXT(He.LOWER_LEFT_EXT,He.ZERO_TO_ONE_EXT):He.clipControlEXT(He.LOWER_LEFT_EXT,He.NEGATIVE_ONE_TO_ONE_EXT),we=ge;const ze=Le;Le=null,this.setClear(ze)}},getReversed:function(){return we},setTest:function(ge){ge?he(s.DEPTH_TEST):Ie(s.DEPTH_TEST)},setMask:function(ge){de!==ge&&!V&&(s.depthMask(ge),de=ge)},setFunc:function(ge){if(we&&(ge=Zv[ge]),Ce!==ge){switch(ge){case Gf:s.depthFunc(s.NEVER);break;case Wf:s.depthFunc(s.ALWAYS);break;case Xf:s.depthFunc(s.LESS);break;case ca:s.depthFunc(s.LEQUAL);break;case Yf:s.depthFunc(s.EQUAL);break;case qf:s.depthFunc(s.GEQUAL);break;case Kf:s.depthFunc(s.GREATER);break;case $f:s.depthFunc(s.NOTEQUAL);break;default:s.depthFunc(s.LEQUAL)}Ce=ge}},setLocked:function(ge){V=ge},setClear:function(ge){Le!==ge&&(Le=ge,we&&(ge=1-ge),s.clearDepth(ge))},reset:function(){V=!1,de=null,Ce=null,Le=null,we=!1}}}function o(){let V=!1,we=null,de=null,Ce=null,Le=null,ge=null,He=null,ze=null,Dt=null;return{setTest:function(At){V||(At?he(s.STENCIL_TEST):Ie(s.STENCIL_TEST))},setMask:function(At){we!==At&&!V&&(s.stencilMask(At),we=At)},setFunc:function(At,En,ti){(de!==At||Ce!==En||Le!==ti)&&(s.stencilFunc(At,En,ti),de=At,Ce=En,Le=ti)},setOp:function(At,En,ti){(ge!==At||He!==En||ze!==ti)&&(s.stencilOp(At,En,ti),ge=At,He=En,ze=ti)},setLocked:function(At){V=At},setClear:function(At){Dt!==At&&(s.clearStencil(At),Dt=At)},reset:function(){V=!1,we=null,de=null,Ce=null,Le=null,ge=null,He=null,ze=null,Dt=null}}}const l=new t,c=new r,d=new o,p=new WeakMap,m=new WeakMap;let x={},y={},g={},M=new WeakMap,E=[],R=null,v=!1,_=null,b=null,N=null,C=null,I=null,P=null,O=null,T=new dt(0,0,0),D=0,z=!1,k=null,K=null,ce=null,me=null,Q=null;const ue=s.getParameter(s.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let $=!1,Y=0;const ae=s.getParameter(s.VERSION);ae.indexOf("WebGL")!==-1?(Y=parseFloat(/^WebGL (\d)/.exec(ae)[1]),$=Y>=1):ae.indexOf("OpenGL ES")!==-1&&(Y=parseFloat(/^OpenGL ES (\d)/.exec(ae)[1]),$=Y>=2);let oe=null,F={};const Z=s.getParameter(s.SCISSOR_BOX),Ne=s.getParameter(s.VIEWPORT),qe=new Zt().fromArray(Z),ke=new Zt().fromArray(Ne);function ie(V,we,de,Ce){const Le=new Uint8Array(4),ge=s.createTexture();s.bindTexture(V,ge),s.texParameteri(V,s.TEXTURE_MIN_FILTER,s.NEAREST),s.texParameteri(V,s.TEXTURE_MAG_FILTER,s.NEAREST);for(let He=0;He<de;He++)V===s.TEXTURE_3D||V===s.TEXTURE_2D_ARRAY?s.texImage3D(we,0,s.RGBA,1,1,Ce,0,s.RGBA,s.UNSIGNED_BYTE,Le):s.texImage2D(we+He,0,s.RGBA,1,1,0,s.RGBA,s.UNSIGNED_BYTE,Le);return ge}const _e={};_e[s.TEXTURE_2D]=ie(s.TEXTURE_2D,s.TEXTURE_2D,1),_e[s.TEXTURE_CUBE_MAP]=ie(s.TEXTURE_CUBE_MAP,s.TEXTURE_CUBE_MAP_POSITIVE_X,6),_e[s.TEXTURE_2D_ARRAY]=ie(s.TEXTURE_2D_ARRAY,s.TEXTURE_2D_ARRAY,1,1),_e[s.TEXTURE_3D]=ie(s.TEXTURE_3D,s.TEXTURE_3D,1,1),l.setClear(0,0,0,1),c.setClear(1),d.setClear(0),he(s.DEPTH_TEST),c.setFunc(ca),Ht(!1),Qt(bm),he(s.CULL_FACE),xt(nr);function he(V){x[V]!==!0&&(s.enable(V),x[V]=!0)}function Ie(V){x[V]!==!1&&(s.disable(V),x[V]=!1)}function Je(V,we){return g[V]!==we?(s.bindFramebuffer(V,we),g[V]=we,V===s.DRAW_FRAMEBUFFER&&(g[s.FRAMEBUFFER]=we),V===s.FRAMEBUFFER&&(g[s.DRAW_FRAMEBUFFER]=we),!0):!1}function je(V,we){let de=E,Ce=!1;if(V){de=M.get(we),de===void 0&&(de=[],M.set(we,de));const Le=V.textures;if(de.length!==Le.length||de[0]!==s.COLOR_ATTACHMENT0){for(let ge=0,He=Le.length;ge<He;ge++)de[ge]=s.COLOR_ATTACHMENT0+ge;de.length=Le.length,Ce=!0}}else de[0]!==s.BACK&&(de[0]=s.BACK,Ce=!0);Ce&&s.drawBuffers(de)}function Vt(V){return R!==V?(s.useProgram(V),R=V,!0):!1}const ct={[ls]:s.FUNC_ADD,[xv]:s.FUNC_SUBTRACT,[yv]:s.FUNC_REVERSE_SUBTRACT};ct[Sv]=s.MIN,ct[Mv]=s.MAX;const wt={[Ev]:s.ZERO,[Tv]:s.ONE,[wv]:s.SRC_COLOR,[Vf]:s.SRC_ALPHA,[Lv]:s.SRC_ALPHA_SATURATE,[bv]:s.DST_COLOR,[Rv]:s.DST_ALPHA,[Av]:s.ONE_MINUS_SRC_COLOR,[Hf]:s.ONE_MINUS_SRC_ALPHA,[Pv]:s.ONE_MINUS_DST_COLOR,[Cv]:s.ONE_MINUS_DST_ALPHA,[Dv]:s.CONSTANT_COLOR,[Nv]:s.ONE_MINUS_CONSTANT_COLOR,[Iv]:s.CONSTANT_ALPHA,[Uv]:s.ONE_MINUS_CONSTANT_ALPHA};function xt(V,we,de,Ce,Le,ge,He,ze,Dt,At){if(V===nr){v===!0&&(Ie(s.BLEND),v=!1);return}if(v===!1&&(he(s.BLEND),v=!0),V!==vv){if(V!==_||At!==z){if((b!==ls||I!==ls)&&(s.blendEquation(s.FUNC_ADD),b=ls,I=ls),At)switch(V){case oa:s.blendFuncSeparate(s.ONE,s.ONE_MINUS_SRC_ALPHA,s.ONE,s.ONE_MINUS_SRC_ALPHA);break;case zf:s.blendFunc(s.ONE,s.ONE);break;case Pm:s.blendFuncSeparate(s.ZERO,s.ONE_MINUS_SRC_COLOR,s.ZERO,s.ONE);break;case Lm:s.blendFuncSeparate(s.DST_COLOR,s.ONE_MINUS_SRC_ALPHA,s.ZERO,s.ONE);break;default:St("WebGLState: Invalid blending: ",V);break}else switch(V){case oa:s.blendFuncSeparate(s.SRC_ALPHA,s.ONE_MINUS_SRC_ALPHA,s.ONE,s.ONE_MINUS_SRC_ALPHA);break;case zf:s.blendFuncSeparate(s.SRC_ALPHA,s.ONE,s.ONE,s.ONE);break;case Pm:St("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case Lm:St("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:St("WebGLState: Invalid blending: ",V);break}N=null,C=null,P=null,O=null,T.set(0,0,0),D=0,_=V,z=At}return}Le=Le||we,ge=ge||de,He=He||Ce,(we!==b||Le!==I)&&(s.blendEquationSeparate(ct[we],ct[Le]),b=we,I=Le),(de!==N||Ce!==C||ge!==P||He!==O)&&(s.blendFuncSeparate(wt[de],wt[Ce],wt[ge],wt[He]),N=de,C=Ce,P=ge,O=He),(ze.equals(T)===!1||Dt!==D)&&(s.blendColor(ze.r,ze.g,ze.b,Dt),T.copy(ze),D=Dt),_=V,z=!1}function _t(V,we){V.side===Ni?Ie(s.CULL_FACE):he(s.CULL_FACE);let de=V.side===On;we&&(de=!de),Ht(de),V.blending===oa&&V.transparent===!1?xt(nr):xt(V.blending,V.blendEquation,V.blendSrc,V.blendDst,V.blendEquationAlpha,V.blendSrcAlpha,V.blendDstAlpha,V.blendColor,V.blendAlpha,V.premultipliedAlpha),c.setFunc(V.depthFunc),c.setTest(V.depthTest),c.setMask(V.depthWrite),l.setMask(V.colorWrite);const Ce=V.stencilWrite;d.setTest(Ce),Ce&&(d.setMask(V.stencilWriteMask),d.setFunc(V.stencilFunc,V.stencilRef,V.stencilFuncMask),d.setOp(V.stencilFail,V.stencilZFail,V.stencilZPass)),Yt(V.polygonOffset,V.polygonOffsetFactor,V.polygonOffsetUnits),V.alphaToCoverage===!0?he(s.SAMPLE_ALPHA_TO_COVERAGE):Ie(s.SAMPLE_ALPHA_TO_COVERAGE)}function Ht(V){k!==V&&(V?s.frontFace(s.CW):s.frontFace(s.CCW),k=V)}function Qt(V){V!==mv?(he(s.CULL_FACE),V!==K&&(V===bm?s.cullFace(s.BACK):V===gv?s.cullFace(s.FRONT):s.cullFace(s.FRONT_AND_BACK))):Ie(s.CULL_FACE),K=V}function Jt(V){V!==ce&&($&&s.lineWidth(V),ce=V)}function Yt(V,we,de){V?(he(s.POLYGON_OFFSET_FILL),(me!==we||Q!==de)&&(me=we,Q=de,c.getReversed()&&(we=-we),s.polygonOffset(we,de))):Ie(s.POLYGON_OFFSET_FILL)}function Ct(V){V?he(s.SCISSOR_TEST):Ie(s.SCISSOR_TEST)}function Gt(V){V===void 0&&(V=s.TEXTURE0+ue-1),oe!==V&&(s.activeTexture(V),oe=V)}function W(V,we,de){de===void 0&&(oe===null?de=s.TEXTURE0+ue-1:de=oe);let Ce=F[de];Ce===void 0&&(Ce={type:void 0,texture:void 0},F[de]=Ce),(Ce.type!==V||Ce.texture!==we)&&(oe!==de&&(s.activeTexture(de),oe=de),s.bindTexture(V,we||_e[V]),Ce.type=V,Ce.texture=we)}function gn(){const V=F[oe];V!==void 0&&V.type!==void 0&&(s.bindTexture(V.type,null),V.type=void 0,V.texture=void 0)}function Et(){try{s.compressedTexImage2D(...arguments)}catch(V){St("WebGLState:",V)}}function L(){try{s.compressedTexImage3D(...arguments)}catch(V){St("WebGLState:",V)}}function S(){try{s.texSubImage2D(...arguments)}catch(V){St("WebGLState:",V)}}function q(){try{s.texSubImage3D(...arguments)}catch(V){St("WebGLState:",V)}}function ne(){try{s.compressedTexSubImage2D(...arguments)}catch(V){St("WebGLState:",V)}}function le(){try{s.compressedTexSubImage3D(...arguments)}catch(V){St("WebGLState:",V)}}function Se(){try{s.texStorage2D(...arguments)}catch(V){St("WebGLState:",V)}}function Re(){try{s.texStorage3D(...arguments)}catch(V){St("WebGLState:",V)}}function fe(){try{s.texImage2D(...arguments)}catch(V){St("WebGLState:",V)}}function pe(){try{s.texImage3D(...arguments)}catch(V){St("WebGLState:",V)}}function be(V){return y[V]!==void 0?y[V]:s.getParameter(V)}function Xe(V,we){y[V]!==we&&(s.pixelStorei(V,we),y[V]=we)}function Pe(V){qe.equals(V)===!1&&(s.scissor(V.x,V.y,V.z,V.w),qe.copy(V))}function Ae(V){ke.equals(V)===!1&&(s.viewport(V.x,V.y,V.z,V.w),ke.copy(V))}function Ze(V,we){let de=m.get(we);de===void 0&&(de=new WeakMap,m.set(we,de));let Ce=de.get(V);Ce===void 0&&(Ce=s.getUniformBlockIndex(we,V.name),de.set(V,Ce))}function et(V,we){const Ce=m.get(we).get(V);p.get(we)!==Ce&&(s.uniformBlockBinding(we,Ce,V.__bindingPointIndex),p.set(we,Ce))}function it(){s.disable(s.BLEND),s.disable(s.CULL_FACE),s.disable(s.DEPTH_TEST),s.disable(s.POLYGON_OFFSET_FILL),s.disable(s.SCISSOR_TEST),s.disable(s.STENCIL_TEST),s.disable(s.SAMPLE_ALPHA_TO_COVERAGE),s.blendEquation(s.FUNC_ADD),s.blendFunc(s.ONE,s.ZERO),s.blendFuncSeparate(s.ONE,s.ZERO,s.ONE,s.ZERO),s.blendColor(0,0,0,0),s.colorMask(!0,!0,!0,!0),s.clearColor(0,0,0,0),s.depthMask(!0),s.depthFunc(s.LESS),c.setReversed(!1),s.clearDepth(1),s.stencilMask(4294967295),s.stencilFunc(s.ALWAYS,0,4294967295),s.stencilOp(s.KEEP,s.KEEP,s.KEEP),s.clearStencil(0),s.cullFace(s.BACK),s.frontFace(s.CCW),s.polygonOffset(0,0),s.activeTexture(s.TEXTURE0),s.bindFramebuffer(s.FRAMEBUFFER,null),s.bindFramebuffer(s.DRAW_FRAMEBUFFER,null),s.bindFramebuffer(s.READ_FRAMEBUFFER,null),s.useProgram(null),s.lineWidth(1),s.scissor(0,0,s.canvas.width,s.canvas.height),s.viewport(0,0,s.canvas.width,s.canvas.height),s.pixelStorei(s.PACK_ALIGNMENT,4),s.pixelStorei(s.UNPACK_ALIGNMENT,4),s.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,!1),s.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),s.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL,s.BROWSER_DEFAULT_WEBGL),s.pixelStorei(s.PACK_ROW_LENGTH,0),s.pixelStorei(s.PACK_SKIP_PIXELS,0),s.pixelStorei(s.PACK_SKIP_ROWS,0),s.pixelStorei(s.UNPACK_ROW_LENGTH,0),s.pixelStorei(s.UNPACK_IMAGE_HEIGHT,0),s.pixelStorei(s.UNPACK_SKIP_PIXELS,0),s.pixelStorei(s.UNPACK_SKIP_ROWS,0),s.pixelStorei(s.UNPACK_SKIP_IMAGES,0),x={},y={},oe=null,F={},g={},M=new WeakMap,E=[],R=null,v=!1,_=null,b=null,N=null,C=null,I=null,P=null,O=null,T=new dt(0,0,0),D=0,z=!1,k=null,K=null,ce=null,me=null,Q=null,qe.set(0,0,s.canvas.width,s.canvas.height),ke.set(0,0,s.canvas.width,s.canvas.height),l.reset(),c.reset(),d.reset()}return{buffers:{color:l,depth:c,stencil:d},enable:he,disable:Ie,bindFramebuffer:Je,drawBuffers:je,useProgram:Vt,setBlending:xt,setMaterial:_t,setFlipSided:Ht,setCullFace:Qt,setLineWidth:Jt,setPolygonOffset:Yt,setScissorTest:Ct,activeTexture:Gt,bindTexture:W,unbindTexture:gn,compressedTexImage2D:Et,compressedTexImage3D:L,texImage2D:fe,texImage3D:pe,pixelStorei:Xe,getParameter:be,updateUBOMapping:Ze,uniformBlockBinding:et,texStorage2D:Se,texStorage3D:Re,texSubImage2D:S,texSubImage3D:q,compressedTexSubImage2D:ne,compressedTexSubImage3D:le,scissor:Pe,viewport:Ae,reset:it}}function LT(s,e,t,r,o,l,c){const d=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,p=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),m=new Qe,x=new WeakMap,y=new Set;let g;const M=new WeakMap;let E=!1;try{E=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function R(L,S){return E?new OffscreenCanvas(L,S):ho("canvas")}function v(L,S,q){let ne=1;const le=Et(L);if((le.width>q||le.height>q)&&(ne=q/Math.max(le.width,le.height)),ne<1)if(typeof HTMLImageElement<"u"&&L instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&L instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&L instanceof ImageBitmap||typeof VideoFrame<"u"&&L instanceof VideoFrame){const Se=Math.floor(ne*le.width),Re=Math.floor(ne*le.height);g===void 0&&(g=R(Se,Re));const fe=S?R(Se,Re):g;return fe.width=Se,fe.height=Re,fe.getContext("2d").drawImage(L,0,0,Se,Re),rt("WebGLRenderer: Texture has been resized from ("+le.width+"x"+le.height+") to ("+Se+"x"+Re+")."),fe}else return"data"in L&&rt("WebGLRenderer: Image in DataTexture is too big ("+le.width+"x"+le.height+")."),L;return L}function _(L){return L.generateMipmaps}function b(L){s.generateMipmap(L)}function N(L){return L.isWebGLCubeRenderTarget?s.TEXTURE_CUBE_MAP:L.isWebGL3DRenderTarget?s.TEXTURE_3D:L.isWebGLArrayRenderTarget||L.isCompressedArrayTexture?s.TEXTURE_2D_ARRAY:s.TEXTURE_2D}function C(L,S,q,ne,le,Se=!1){if(L!==null){if(s[L]!==void 0)return s[L];rt("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+L+"'")}let Re;ne&&(Re=e.get("EXT_texture_norm16"),Re||rt("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let fe=S;if(S===s.RED&&(q===s.FLOAT&&(fe=s.R32F),q===s.HALF_FLOAT&&(fe=s.R16F),q===s.UNSIGNED_BYTE&&(fe=s.R8),q===s.UNSIGNED_SHORT&&Re&&(fe=Re.R16_EXT),q===s.SHORT&&Re&&(fe=Re.R16_SNORM_EXT)),S===s.RED_INTEGER&&(q===s.UNSIGNED_BYTE&&(fe=s.R8UI),q===s.UNSIGNED_SHORT&&(fe=s.R16UI),q===s.UNSIGNED_INT&&(fe=s.R32UI),q===s.BYTE&&(fe=s.R8I),q===s.SHORT&&(fe=s.R16I),q===s.INT&&(fe=s.R32I)),S===s.RG&&(q===s.FLOAT&&(fe=s.RG32F),q===s.HALF_FLOAT&&(fe=s.RG16F),q===s.UNSIGNED_BYTE&&(fe=s.RG8),q===s.UNSIGNED_SHORT&&Re&&(fe=Re.RG16_EXT),q===s.SHORT&&Re&&(fe=Re.RG16_SNORM_EXT)),S===s.RG_INTEGER&&(q===s.UNSIGNED_BYTE&&(fe=s.RG8UI),q===s.UNSIGNED_SHORT&&(fe=s.RG16UI),q===s.UNSIGNED_INT&&(fe=s.RG32UI),q===s.BYTE&&(fe=s.RG8I),q===s.SHORT&&(fe=s.RG16I),q===s.INT&&(fe=s.RG32I)),S===s.RGB_INTEGER&&(q===s.UNSIGNED_BYTE&&(fe=s.RGB8UI),q===s.UNSIGNED_SHORT&&(fe=s.RGB16UI),q===s.UNSIGNED_INT&&(fe=s.RGB32UI),q===s.BYTE&&(fe=s.RGB8I),q===s.SHORT&&(fe=s.RGB16I),q===s.INT&&(fe=s.RGB32I)),S===s.RGBA_INTEGER&&(q===s.UNSIGNED_BYTE&&(fe=s.RGBA8UI),q===s.UNSIGNED_SHORT&&(fe=s.RGBA16UI),q===s.UNSIGNED_INT&&(fe=s.RGBA32UI),q===s.BYTE&&(fe=s.RGBA8I),q===s.SHORT&&(fe=s.RGBA16I),q===s.INT&&(fe=s.RGBA32I)),S===s.RGB&&(q===s.UNSIGNED_SHORT&&Re&&(fe=Re.RGB16_EXT),q===s.SHORT&&Re&&(fe=Re.RGB16_SNORM_EXT),q===s.UNSIGNED_INT_5_9_9_9_REV&&(fe=s.RGB9_E5),q===s.UNSIGNED_INT_10F_11F_11F_REV&&(fe=s.R11F_G11F_B10F)),S===s.RGBA){const pe=Se?uu:vt.getTransfer(le);q===s.FLOAT&&(fe=s.RGBA32F),q===s.HALF_FLOAT&&(fe=s.RGBA16F),q===s.UNSIGNED_BYTE&&(fe=pe===Lt?s.SRGB8_ALPHA8:s.RGBA8),q===s.UNSIGNED_SHORT&&Re&&(fe=Re.RGBA16_EXT),q===s.SHORT&&Re&&(fe=Re.RGBA16_SNORM_EXT),q===s.UNSIGNED_SHORT_4_4_4_4&&(fe=s.RGBA4),q===s.UNSIGNED_SHORT_5_5_5_1&&(fe=s.RGB5_A1)}return(fe===s.R16F||fe===s.R32F||fe===s.RG16F||fe===s.RG32F||fe===s.RGBA16F||fe===s.RGBA32F)&&e.get("EXT_color_buffer_float"),fe}function I(L,S){let q;return L?S===null||S===ki||S===co?q=s.DEPTH24_STENCIL8:S===Ui?q=s.DEPTH32F_STENCIL8:S===uo&&(q=s.DEPTH24_STENCIL8,rt("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):S===null||S===ki||S===co?q=s.DEPTH_COMPONENT24:S===Ui?q=s.DEPTH_COMPONENT32F:S===uo&&(q=s.DEPTH_COMPONENT16),q}function P(L,S){return _(L)===!0||L.isFramebufferTexture&&L.minFilter!==yn&&L.minFilter!==Pn?Math.log2(Math.max(S.width,S.height))+1:L.mipmaps!==void 0&&L.mipmaps.length>0?L.mipmaps.length:L.isCompressedTexture&&Array.isArray(L.image)?S.mipmaps.length:1}function O(L){const S=L.target;S.removeEventListener("dispose",O),D(S),S.isVideoTexture&&x.delete(S),S.isHTMLTexture&&y.delete(S)}function T(L){const S=L.target;S.removeEventListener("dispose",T),k(S)}function D(L){const S=r.get(L);if(S.__webglInit===void 0)return;const q=L.source,ne=M.get(q);if(ne){const le=ne[S.__cacheKey];le.usedTimes--,le.usedTimes===0&&z(L),Object.keys(ne).length===0&&M.delete(q)}r.remove(L)}function z(L){const S=r.get(L);s.deleteTexture(S.__webglTexture);const q=L.source,ne=M.get(q);delete ne[S.__cacheKey],c.memory.textures--}function k(L){const S=r.get(L);if(L.depthTexture&&(L.depthTexture.dispose(),r.remove(L.depthTexture)),L.isWebGLCubeRenderTarget)for(let ne=0;ne<6;ne++){if(Array.isArray(S.__webglFramebuffer[ne]))for(let le=0;le<S.__webglFramebuffer[ne].length;le++)s.deleteFramebuffer(S.__webglFramebuffer[ne][le]);else s.deleteFramebuffer(S.__webglFramebuffer[ne]);S.__webglDepthbuffer&&s.deleteRenderbuffer(S.__webglDepthbuffer[ne])}else{if(Array.isArray(S.__webglFramebuffer))for(let ne=0;ne<S.__webglFramebuffer.length;ne++)s.deleteFramebuffer(S.__webglFramebuffer[ne]);else s.deleteFramebuffer(S.__webglFramebuffer);if(S.__webglDepthbuffer&&s.deleteRenderbuffer(S.__webglDepthbuffer),S.__webglMultisampledFramebuffer&&s.deleteFramebuffer(S.__webglMultisampledFramebuffer),S.__webglColorRenderbuffer)for(let ne=0;ne<S.__webglColorRenderbuffer.length;ne++)S.__webglColorRenderbuffer[ne]&&s.deleteRenderbuffer(S.__webglColorRenderbuffer[ne]);S.__webglDepthRenderbuffer&&s.deleteRenderbuffer(S.__webglDepthRenderbuffer)}const q=L.textures;for(let ne=0,le=q.length;ne<le;ne++){const Se=r.get(q[ne]);Se.__webglTexture&&(s.deleteTexture(Se.__webglTexture),c.memory.textures--),r.remove(q[ne])}r.remove(L)}let K=0;function ce(){K=0}function me(){return K}function Q(L){K=L}function ue(){const L=K;return L>=o.maxTextures&&rt("WebGLTextures: Trying to use "+L+" texture units while this GPU supports only "+o.maxTextures),K+=1,L}function $(L){const S=[];return S.push(L.wrapS),S.push(L.wrapT),S.push(L.wrapR||0),S.push(L.magFilter),S.push(L.minFilter),S.push(L.anisotropy),S.push(L.internalFormat),S.push(L.format),S.push(L.type),S.push(L.generateMipmaps),S.push(L.premultiplyAlpha),S.push(L.flipY),S.push(L.unpackAlignment),S.push(L.colorSpace),S.join()}function Y(L,S){const q=r.get(L);if(L.isVideoTexture&&W(L),L.isRenderTargetTexture===!1&&L.isExternalTexture!==!0&&L.version>0&&q.__version!==L.version){const ne=L.image;if(ne===null)rt("WebGLRenderer: Texture marked for update but no image data found.");else if(ne.complete===!1)rt("WebGLRenderer: Texture marked for update but image is incomplete");else{Ie(q,L,S);return}}else L.isExternalTexture&&(q.__webglTexture=L.sourceTexture?L.sourceTexture:null);t.bindTexture(s.TEXTURE_2D,q.__webglTexture,s.TEXTURE0+S)}function ae(L,S){const q=r.get(L);if(L.isRenderTargetTexture===!1&&L.version>0&&q.__version!==L.version){Ie(q,L,S);return}else L.isExternalTexture&&(q.__webglTexture=L.sourceTexture?L.sourceTexture:null);t.bindTexture(s.TEXTURE_2D_ARRAY,q.__webglTexture,s.TEXTURE0+S)}function oe(L,S){const q=r.get(L);if(L.isRenderTargetTexture===!1&&L.version>0&&q.__version!==L.version){Ie(q,L,S);return}t.bindTexture(s.TEXTURE_3D,q.__webglTexture,s.TEXTURE0+S)}function F(L,S){const q=r.get(L);if(L.isCubeDepthTexture!==!0&&L.version>0&&q.__version!==L.version){Je(q,L,S);return}t.bindTexture(s.TEXTURE_CUBE_MAP,q.__webglTexture,s.TEXTURE0+S)}const Z={[Zf]:s.REPEAT,[tr]:s.CLAMP_TO_EDGE,[Qf]:s.MIRRORED_REPEAT},Ne={[yn]:s.NEAREST,[Bv]:s.NEAREST_MIPMAP_NEAREST,[Ml]:s.NEAREST_MIPMAP_LINEAR,[Pn]:s.LINEAR,[rf]:s.LINEAR_MIPMAP_NEAREST,[cs]:s.LINEAR_MIPMAP_LINEAR},qe={[Vv]:s.NEVER,[Yv]:s.ALWAYS,[Hv]:s.LESS,[Hd]:s.LEQUAL,[Gv]:s.EQUAL,[Gd]:s.GEQUAL,[Wv]:s.GREATER,[Xv]:s.NOTEQUAL};function ke(L,S){if(S.type===Ui&&e.has("OES_texture_float_linear")===!1&&(S.magFilter===Pn||S.magFilter===rf||S.magFilter===Ml||S.magFilter===cs||S.minFilter===Pn||S.minFilter===rf||S.minFilter===Ml||S.minFilter===cs)&&rt("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),s.texParameteri(L,s.TEXTURE_WRAP_S,Z[S.wrapS]),s.texParameteri(L,s.TEXTURE_WRAP_T,Z[S.wrapT]),(L===s.TEXTURE_3D||L===s.TEXTURE_2D_ARRAY)&&s.texParameteri(L,s.TEXTURE_WRAP_R,Z[S.wrapR]),s.texParameteri(L,s.TEXTURE_MAG_FILTER,Ne[S.magFilter]),s.texParameteri(L,s.TEXTURE_MIN_FILTER,Ne[S.minFilter]),S.compareFunction&&(s.texParameteri(L,s.TEXTURE_COMPARE_MODE,s.COMPARE_REF_TO_TEXTURE),s.texParameteri(L,s.TEXTURE_COMPARE_FUNC,qe[S.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(S.magFilter===yn||S.minFilter!==Ml&&S.minFilter!==cs||S.type===Ui&&e.has("OES_texture_float_linear")===!1)return;if(S.anisotropy>1||r.get(S).__currentAnisotropy){const q=e.get("EXT_texture_filter_anisotropic");s.texParameterf(L,q.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(S.anisotropy,o.getMaxAnisotropy())),r.get(S).__currentAnisotropy=S.anisotropy}}}function ie(L,S){let q=!1;L.__webglInit===void 0&&(L.__webglInit=!0,S.addEventListener("dispose",O));const ne=S.source;let le=M.get(ne);le===void 0&&(le={},M.set(ne,le));const Se=$(S);if(Se!==L.__cacheKey){le[Se]===void 0&&(le[Se]={texture:s.createTexture(),usedTimes:0},c.memory.textures++,q=!0),le[Se].usedTimes++;const Re=le[L.__cacheKey];Re!==void 0&&(le[L.__cacheKey].usedTimes--,Re.usedTimes===0&&z(S)),L.__cacheKey=Se,L.__webglTexture=le[Se].texture}return q}function _e(L,S,q){return Math.floor(Math.floor(L/q)/S)}function he(L,S,q,ne){const Se=L.updateRanges;if(Se.length===0)t.texSubImage2D(s.TEXTURE_2D,0,0,0,S.width,S.height,q,ne,S.data);else{Se.sort((Xe,Pe)=>Xe.start-Pe.start);let Re=0;for(let Xe=1;Xe<Se.length;Xe++){const Pe=Se[Re],Ae=Se[Xe],Ze=Pe.start+Pe.count,et=_e(Ae.start,S.width,4),it=_e(Pe.start,S.width,4);Ae.start<=Ze+1&&et===it&&_e(Ae.start+Ae.count-1,S.width,4)===et?Pe.count=Math.max(Pe.count,Ae.start+Ae.count-Pe.start):(++Re,Se[Re]=Ae)}Se.length=Re+1;const fe=t.getParameter(s.UNPACK_ROW_LENGTH),pe=t.getParameter(s.UNPACK_SKIP_PIXELS),be=t.getParameter(s.UNPACK_SKIP_ROWS);t.pixelStorei(s.UNPACK_ROW_LENGTH,S.width);for(let Xe=0,Pe=Se.length;Xe<Pe;Xe++){const Ae=Se[Xe],Ze=Math.floor(Ae.start/4),et=Math.ceil(Ae.count/4),it=Ze%S.width,V=Math.floor(Ze/S.width),we=et,de=1;t.pixelStorei(s.UNPACK_SKIP_PIXELS,it),t.pixelStorei(s.UNPACK_SKIP_ROWS,V),t.texSubImage2D(s.TEXTURE_2D,0,it,V,we,de,q,ne,S.data)}L.clearUpdateRanges(),t.pixelStorei(s.UNPACK_ROW_LENGTH,fe),t.pixelStorei(s.UNPACK_SKIP_PIXELS,pe),t.pixelStorei(s.UNPACK_SKIP_ROWS,be)}}function Ie(L,S,q){let ne=s.TEXTURE_2D;(S.isDataArrayTexture||S.isCompressedArrayTexture)&&(ne=s.TEXTURE_2D_ARRAY),S.isData3DTexture&&(ne=s.TEXTURE_3D);const le=ie(L,S),Se=S.source;t.bindTexture(ne,L.__webglTexture,s.TEXTURE0+q);const Re=r.get(Se);if(Se.version!==Re.__version||le===!0){if(t.activeTexture(s.TEXTURE0+q),(typeof ImageBitmap<"u"&&S.image instanceof ImageBitmap)===!1){const de=vt.getPrimaries(vt.workingColorSpace),Ce=S.colorSpace===Dr?null:vt.getPrimaries(S.colorSpace),Le=S.colorSpace===Dr||de===Ce?s.NONE:s.BROWSER_DEFAULT_WEBGL;t.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,S.flipY),t.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,S.premultiplyAlpha),t.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL,Le)}t.pixelStorei(s.UNPACK_ALIGNMENT,S.unpackAlignment);let pe=v(S.image,!1,o.maxTextureSize);pe=gn(S,pe);const be=l.convert(S.format,S.colorSpace),Xe=l.convert(S.type);let Pe=C(S.internalFormat,be,Xe,S.normalized,S.colorSpace,S.isVideoTexture);ke(ne,S);let Ae;const Ze=S.mipmaps,et=S.isVideoTexture!==!0,it=Re.__version===void 0||le===!0,V=Se.dataReady,we=P(S,pe);if(S.isDepthTexture)Pe=I(S.format===fs,S.type),it&&(et?t.texStorage2D(s.TEXTURE_2D,1,Pe,pe.width,pe.height):t.texImage2D(s.TEXTURE_2D,0,Pe,pe.width,pe.height,0,be,Xe,null));else if(S.isDataTexture)if(Ze.length>0){et&&it&&t.texStorage2D(s.TEXTURE_2D,we,Pe,Ze[0].width,Ze[0].height);for(let de=0,Ce=Ze.length;de<Ce;de++)Ae=Ze[de],et?V&&t.texSubImage2D(s.TEXTURE_2D,de,0,0,Ae.width,Ae.height,be,Xe,Ae.data):t.texImage2D(s.TEXTURE_2D,de,Pe,Ae.width,Ae.height,0,be,Xe,Ae.data);S.generateMipmaps=!1}else et?(it&&t.texStorage2D(s.TEXTURE_2D,we,Pe,pe.width,pe.height),V&&he(S,pe,be,Xe)):t.texImage2D(s.TEXTURE_2D,0,Pe,pe.width,pe.height,0,be,Xe,pe.data);else if(S.isCompressedTexture)if(S.isCompressedArrayTexture){et&&it&&t.texStorage3D(s.TEXTURE_2D_ARRAY,we,Pe,Ze[0].width,Ze[0].height,pe.depth);for(let de=0,Ce=Ze.length;de<Ce;de++)if(Ae=Ze[de],S.format!==Ei)if(be!==null)if(et){if(V)if(S.layerUpdates.size>0){const Le=ug(Ae.width,Ae.height,S.format,S.type);for(const ge of S.layerUpdates){const He=Ae.data.subarray(ge*Le/Ae.data.BYTES_PER_ELEMENT,(ge+1)*Le/Ae.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(s.TEXTURE_2D_ARRAY,de,0,0,ge,Ae.width,Ae.height,1,be,He)}S.clearLayerUpdates()}else t.compressedTexSubImage3D(s.TEXTURE_2D_ARRAY,de,0,0,0,Ae.width,Ae.height,pe.depth,be,Ae.data)}else t.compressedTexImage3D(s.TEXTURE_2D_ARRAY,de,Pe,Ae.width,Ae.height,pe.depth,0,Ae.data,0,0);else rt("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else et?V&&t.texSubImage3D(s.TEXTURE_2D_ARRAY,de,0,0,0,Ae.width,Ae.height,pe.depth,be,Xe,Ae.data):t.texImage3D(s.TEXTURE_2D_ARRAY,de,Pe,Ae.width,Ae.height,pe.depth,0,be,Xe,Ae.data)}else{et&&it&&t.texStorage2D(s.TEXTURE_2D,we,Pe,Ze[0].width,Ze[0].height);for(let de=0,Ce=Ze.length;de<Ce;de++)Ae=Ze[de],S.format!==Ei?be!==null?et?V&&t.compressedTexSubImage2D(s.TEXTURE_2D,de,0,0,Ae.width,Ae.height,be,Ae.data):t.compressedTexImage2D(s.TEXTURE_2D,de,Pe,Ae.width,Ae.height,0,Ae.data):rt("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):et?V&&t.texSubImage2D(s.TEXTURE_2D,de,0,0,Ae.width,Ae.height,be,Xe,Ae.data):t.texImage2D(s.TEXTURE_2D,de,Pe,Ae.width,Ae.height,0,be,Xe,Ae.data)}else if(S.isDataArrayTexture)if(et){if(it&&t.texStorage3D(s.TEXTURE_2D_ARRAY,we,Pe,pe.width,pe.height,pe.depth),V)if(S.layerUpdates.size>0){const de=ug(pe.width,pe.height,S.format,S.type);for(const Ce of S.layerUpdates){const Le=pe.data.subarray(Ce*de/pe.data.BYTES_PER_ELEMENT,(Ce+1)*de/pe.data.BYTES_PER_ELEMENT);t.texSubImage3D(s.TEXTURE_2D_ARRAY,0,0,0,Ce,pe.width,pe.height,1,be,Xe,Le)}S.clearLayerUpdates()}else t.texSubImage3D(s.TEXTURE_2D_ARRAY,0,0,0,0,pe.width,pe.height,pe.depth,be,Xe,pe.data)}else t.texImage3D(s.TEXTURE_2D_ARRAY,0,Pe,pe.width,pe.height,pe.depth,0,be,Xe,pe.data);else if(S.isData3DTexture)et?(it&&t.texStorage3D(s.TEXTURE_3D,we,Pe,pe.width,pe.height,pe.depth),V&&t.texSubImage3D(s.TEXTURE_3D,0,0,0,0,pe.width,pe.height,pe.depth,be,Xe,pe.data)):t.texImage3D(s.TEXTURE_3D,0,Pe,pe.width,pe.height,pe.depth,0,be,Xe,pe.data);else if(S.isFramebufferTexture){if(it)if(et)t.texStorage2D(s.TEXTURE_2D,we,Pe,pe.width,pe.height);else{let de=pe.width,Ce=pe.height;for(let Le=0;Le<we;Le++)t.texImage2D(s.TEXTURE_2D,Le,Pe,de,Ce,0,be,Xe,null),de>>=1,Ce>>=1}}else if(S.isHTMLTexture){if("texElementImage2D"in s){const de=s.canvas;if(de.hasAttribute("layoutsubtree")||de.setAttribute("layoutsubtree","true"),pe.parentNode!==de){de.appendChild(pe),y.add(S),de.onpaint=Ce=>{const Le=Ce.changedElements;for(const ge of y)Le.includes(ge.image)&&(ge.needsUpdate=!0)},de.requestPaint();return}if(s.texElementImage2D.length===3)s.texElementImage2D(s.TEXTURE_2D,s.RGBA8,pe);else{const Le=s.RGBA,ge=s.RGBA,He=s.UNSIGNED_BYTE;s.texElementImage2D(s.TEXTURE_2D,0,Le,ge,He,pe)}s.texParameteri(s.TEXTURE_2D,s.TEXTURE_MIN_FILTER,s.LINEAR),s.texParameteri(s.TEXTURE_2D,s.TEXTURE_WRAP_S,s.CLAMP_TO_EDGE),s.texParameteri(s.TEXTURE_2D,s.TEXTURE_WRAP_T,s.CLAMP_TO_EDGE)}}else if(Ze.length>0){if(et&&it){const de=Et(Ze[0]);t.texStorage2D(s.TEXTURE_2D,we,Pe,de.width,de.height)}for(let de=0,Ce=Ze.length;de<Ce;de++)Ae=Ze[de],et?V&&t.texSubImage2D(s.TEXTURE_2D,de,0,0,be,Xe,Ae):t.texImage2D(s.TEXTURE_2D,de,Pe,be,Xe,Ae);S.generateMipmaps=!1}else if(et){if(it){const de=Et(pe);t.texStorage2D(s.TEXTURE_2D,we,Pe,de.width,de.height)}V&&t.texSubImage2D(s.TEXTURE_2D,0,0,0,be,Xe,pe)}else t.texImage2D(s.TEXTURE_2D,0,Pe,be,Xe,pe);_(S)&&b(ne),Re.__version=Se.version,S.onUpdate&&S.onUpdate(S)}L.__version=S.version}function Je(L,S,q){if(S.image.length!==6)return;const ne=ie(L,S),le=S.source;t.bindTexture(s.TEXTURE_CUBE_MAP,L.__webglTexture,s.TEXTURE0+q);const Se=r.get(le);if(le.version!==Se.__version||ne===!0){t.activeTexture(s.TEXTURE0+q);const Re=vt.getPrimaries(vt.workingColorSpace),fe=S.colorSpace===Dr?null:vt.getPrimaries(S.colorSpace),pe=S.colorSpace===Dr||Re===fe?s.NONE:s.BROWSER_DEFAULT_WEBGL;t.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,S.flipY),t.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,S.premultiplyAlpha),t.pixelStorei(s.UNPACK_ALIGNMENT,S.unpackAlignment),t.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL,pe);const be=S.isCompressedTexture||S.image[0].isCompressedTexture,Xe=S.image[0]&&S.image[0].isDataTexture,Pe=[];for(let ge=0;ge<6;ge++)!be&&!Xe?Pe[ge]=v(S.image[ge],!0,o.maxCubemapSize):Pe[ge]=Xe?S.image[ge].image:S.image[ge],Pe[ge]=gn(S,Pe[ge]);const Ae=Pe[0],Ze=l.convert(S.format,S.colorSpace),et=l.convert(S.type),it=C(S.internalFormat,Ze,et,S.normalized,S.colorSpace),V=S.isVideoTexture!==!0,we=Se.__version===void 0||ne===!0,de=le.dataReady;let Ce=P(S,Ae);ke(s.TEXTURE_CUBE_MAP,S);let Le;if(be){V&&we&&t.texStorage2D(s.TEXTURE_CUBE_MAP,Ce,it,Ae.width,Ae.height);for(let ge=0;ge<6;ge++){Le=Pe[ge].mipmaps;for(let He=0;He<Le.length;He++){const ze=Le[He];S.format!==Ei?Ze!==null?V?de&&t.compressedTexSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ge,He,0,0,ze.width,ze.height,Ze,ze.data):t.compressedTexImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ge,He,it,ze.width,ze.height,0,ze.data):rt("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):V?de&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ge,He,0,0,ze.width,ze.height,Ze,et,ze.data):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ge,He,it,ze.width,ze.height,0,Ze,et,ze.data)}}}else{if(Le=S.mipmaps,V&&we){Le.length>0&&Ce++;const ge=Et(Pe[0]);t.texStorage2D(s.TEXTURE_CUBE_MAP,Ce,it,ge.width,ge.height)}for(let ge=0;ge<6;ge++)if(Xe){V?de&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ge,0,0,0,Pe[ge].width,Pe[ge].height,Ze,et,Pe[ge].data):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ge,0,it,Pe[ge].width,Pe[ge].height,0,Ze,et,Pe[ge].data);for(let He=0;He<Le.length;He++){const Dt=Le[He].image[ge].image;V?de&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ge,He+1,0,0,Dt.width,Dt.height,Ze,et,Dt.data):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ge,He+1,it,Dt.width,Dt.height,0,Ze,et,Dt.data)}}else{V?de&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ge,0,0,0,Ze,et,Pe[ge]):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ge,0,it,Ze,et,Pe[ge]);for(let He=0;He<Le.length;He++){const ze=Le[He];V?de&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ge,He+1,0,0,Ze,et,ze.image[ge]):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ge,He+1,it,Ze,et,ze.image[ge])}}}_(S)&&b(s.TEXTURE_CUBE_MAP),Se.__version=le.version,S.onUpdate&&S.onUpdate(S)}L.__version=S.version}function je(L,S,q,ne,le,Se){const Re=l.convert(q.format,q.colorSpace),fe=l.convert(q.type),pe=C(q.internalFormat,Re,fe,q.normalized,q.colorSpace),be=r.get(S),Xe=r.get(q);if(Xe.__renderTarget=S,!be.__hasExternalTextures){const Pe=Math.max(1,S.width>>Se),Ae=Math.max(1,S.height>>Se);le===s.TEXTURE_3D||le===s.TEXTURE_2D_ARRAY?t.texImage3D(le,Se,pe,Pe,Ae,S.depth,0,Re,fe,null):t.texImage2D(le,Se,pe,Pe,Ae,0,Re,fe,null)}t.bindFramebuffer(s.FRAMEBUFFER,L),Gt(S)?d.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,ne,le,Xe.__webglTexture,0,Ct(S)):(le===s.TEXTURE_2D||le>=s.TEXTURE_CUBE_MAP_POSITIVE_X&&le<=s.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&s.framebufferTexture2D(s.FRAMEBUFFER,ne,le,Xe.__webglTexture,Se),t.bindFramebuffer(s.FRAMEBUFFER,null)}function Vt(L,S,q){if(s.bindRenderbuffer(s.RENDERBUFFER,L),S.depthBuffer){const ne=S.depthTexture,le=ne&&ne.isDepthTexture?ne.type:null,Se=I(S.stencilBuffer,le),Re=S.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT;Gt(S)?d.renderbufferStorageMultisampleEXT(s.RENDERBUFFER,Ct(S),Se,S.width,S.height):q?s.renderbufferStorageMultisample(s.RENDERBUFFER,Ct(S),Se,S.width,S.height):s.renderbufferStorage(s.RENDERBUFFER,Se,S.width,S.height),s.framebufferRenderbuffer(s.FRAMEBUFFER,Re,s.RENDERBUFFER,L)}else{const ne=S.textures;for(let le=0;le<ne.length;le++){const Se=ne[le],Re=l.convert(Se.format,Se.colorSpace),fe=l.convert(Se.type),pe=C(Se.internalFormat,Re,fe,Se.normalized,Se.colorSpace);Gt(S)?d.renderbufferStorageMultisampleEXT(s.RENDERBUFFER,Ct(S),pe,S.width,S.height):q?s.renderbufferStorageMultisample(s.RENDERBUFFER,Ct(S),pe,S.width,S.height):s.renderbufferStorage(s.RENDERBUFFER,pe,S.width,S.height)}}s.bindRenderbuffer(s.RENDERBUFFER,null)}function ct(L,S,q){const ne=S.isWebGLCubeRenderTarget===!0;if(t.bindFramebuffer(s.FRAMEBUFFER,L),!(S.depthTexture&&S.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");const le=r.get(S.depthTexture);if(le.__renderTarget=S,(!le.__webglTexture||S.depthTexture.image.width!==S.width||S.depthTexture.image.height!==S.height)&&(S.depthTexture.image.width=S.width,S.depthTexture.image.height=S.height,S.depthTexture.needsUpdate=!0),ne){if(le.__webglInit===void 0&&(le.__webglInit=!0,S.depthTexture.addEventListener("dispose",O)),le.__webglTexture===void 0){le.__webglTexture=s.createTexture(),t.bindTexture(s.TEXTURE_CUBE_MAP,le.__webglTexture),ke(s.TEXTURE_CUBE_MAP,S.depthTexture);const be=l.convert(S.depthTexture.format),Xe=l.convert(S.depthTexture.type);let Pe;S.depthTexture.format===sr?Pe=s.DEPTH_COMPONENT24:S.depthTexture.format===fs&&(Pe=s.DEPTH24_STENCIL8);for(let Ae=0;Ae<6;Ae++)s.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+Ae,0,Pe,S.width,S.height,0,be,Xe,null)}}else Y(S.depthTexture,0);const Se=le.__webglTexture,Re=Ct(S),fe=ne?s.TEXTURE_CUBE_MAP_POSITIVE_X+q:s.TEXTURE_2D,pe=S.depthTexture.format===fs?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT;if(S.depthTexture.format===sr)Gt(S)?d.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,pe,fe,Se,0,Re):s.framebufferTexture2D(s.FRAMEBUFFER,pe,fe,Se,0);else if(S.depthTexture.format===fs)Gt(S)?d.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,pe,fe,Se,0,Re):s.framebufferTexture2D(s.FRAMEBUFFER,pe,fe,Se,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function wt(L){const S=r.get(L),q=L.isWebGLCubeRenderTarget===!0;if(S.__boundDepthTexture!==L.depthTexture){const ne=L.depthTexture;if(S.__depthDisposeCallback&&S.__depthDisposeCallback(),ne){const le=()=>{delete S.__boundDepthTexture,delete S.__depthDisposeCallback,ne.removeEventListener("dispose",le)};ne.addEventListener("dispose",le),S.__depthDisposeCallback=le}S.__boundDepthTexture=ne}if(L.depthTexture&&!S.__autoAllocateDepthBuffer)if(q)for(let ne=0;ne<6;ne++)ct(S.__webglFramebuffer[ne],L,ne);else{const ne=L.texture.mipmaps;ne&&ne.length>0?ct(S.__webglFramebuffer[0],L,0):ct(S.__webglFramebuffer,L,0)}else if(q){S.__webglDepthbuffer=[];for(let ne=0;ne<6;ne++)if(t.bindFramebuffer(s.FRAMEBUFFER,S.__webglFramebuffer[ne]),S.__webglDepthbuffer[ne]===void 0)S.__webglDepthbuffer[ne]=s.createRenderbuffer(),Vt(S.__webglDepthbuffer[ne],L,!1);else{const le=L.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,Se=S.__webglDepthbuffer[ne];s.bindRenderbuffer(s.RENDERBUFFER,Se),s.framebufferRenderbuffer(s.FRAMEBUFFER,le,s.RENDERBUFFER,Se)}}else{const ne=L.texture.mipmaps;if(ne&&ne.length>0?t.bindFramebuffer(s.FRAMEBUFFER,S.__webglFramebuffer[0]):t.bindFramebuffer(s.FRAMEBUFFER,S.__webglFramebuffer),S.__webglDepthbuffer===void 0)S.__webglDepthbuffer=s.createRenderbuffer(),Vt(S.__webglDepthbuffer,L,!1);else{const le=L.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,Se=S.__webglDepthbuffer;s.bindRenderbuffer(s.RENDERBUFFER,Se),s.framebufferRenderbuffer(s.FRAMEBUFFER,le,s.RENDERBUFFER,Se)}}t.bindFramebuffer(s.FRAMEBUFFER,null)}function xt(L,S,q){const ne=r.get(L);S!==void 0&&je(ne.__webglFramebuffer,L,L.texture,s.COLOR_ATTACHMENT0,s.TEXTURE_2D,0),q!==void 0&&wt(L)}function _t(L){const S=L.texture,q=r.get(L),ne=r.get(S);L.addEventListener("dispose",T);const le=L.textures,Se=L.isWebGLCubeRenderTarget===!0,Re=le.length>1;if(Re||(ne.__webglTexture===void 0&&(ne.__webglTexture=s.createTexture()),ne.__version=S.version,c.memory.textures++),Se){q.__webglFramebuffer=[];for(let fe=0;fe<6;fe++)if(S.mipmaps&&S.mipmaps.length>0){q.__webglFramebuffer[fe]=[];for(let pe=0;pe<S.mipmaps.length;pe++)q.__webglFramebuffer[fe][pe]=s.createFramebuffer()}else q.__webglFramebuffer[fe]=s.createFramebuffer()}else{if(S.mipmaps&&S.mipmaps.length>0){q.__webglFramebuffer=[];for(let fe=0;fe<S.mipmaps.length;fe++)q.__webglFramebuffer[fe]=s.createFramebuffer()}else q.__webglFramebuffer=s.createFramebuffer();if(Re)for(let fe=0,pe=le.length;fe<pe;fe++){const be=r.get(le[fe]);be.__webglTexture===void 0&&(be.__webglTexture=s.createTexture(),c.memory.textures++)}if(L.samples>0&&Gt(L)===!1){q.__webglMultisampledFramebuffer=s.createFramebuffer(),q.__webglColorRenderbuffer=[],t.bindFramebuffer(s.FRAMEBUFFER,q.__webglMultisampledFramebuffer);for(let fe=0;fe<le.length;fe++){const pe=le[fe];q.__webglColorRenderbuffer[fe]=s.createRenderbuffer(),s.bindRenderbuffer(s.RENDERBUFFER,q.__webglColorRenderbuffer[fe]);const be=l.convert(pe.format,pe.colorSpace),Xe=l.convert(pe.type),Pe=C(pe.internalFormat,be,Xe,pe.normalized,pe.colorSpace,L.isXRRenderTarget===!0),Ae=Ct(L);s.renderbufferStorageMultisample(s.RENDERBUFFER,Ae,Pe,L.width,L.height),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+fe,s.RENDERBUFFER,q.__webglColorRenderbuffer[fe])}s.bindRenderbuffer(s.RENDERBUFFER,null),L.depthBuffer&&(q.__webglDepthRenderbuffer=s.createRenderbuffer(),Vt(q.__webglDepthRenderbuffer,L,!0)),t.bindFramebuffer(s.FRAMEBUFFER,null)}}if(Se){t.bindTexture(s.TEXTURE_CUBE_MAP,ne.__webglTexture),ke(s.TEXTURE_CUBE_MAP,S);for(let fe=0;fe<6;fe++)if(S.mipmaps&&S.mipmaps.length>0)for(let pe=0;pe<S.mipmaps.length;pe++)je(q.__webglFramebuffer[fe][pe],L,S,s.COLOR_ATTACHMENT0,s.TEXTURE_CUBE_MAP_POSITIVE_X+fe,pe);else je(q.__webglFramebuffer[fe],L,S,s.COLOR_ATTACHMENT0,s.TEXTURE_CUBE_MAP_POSITIVE_X+fe,0);_(S)&&b(s.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(Re){for(let fe=0,pe=le.length;fe<pe;fe++){const be=le[fe],Xe=r.get(be);let Pe=s.TEXTURE_2D;(L.isWebGL3DRenderTarget||L.isWebGLArrayRenderTarget)&&(Pe=L.isWebGL3DRenderTarget?s.TEXTURE_3D:s.TEXTURE_2D_ARRAY),t.bindTexture(Pe,Xe.__webglTexture),ke(Pe,be),je(q.__webglFramebuffer,L,be,s.COLOR_ATTACHMENT0+fe,Pe,0),_(be)&&b(Pe)}t.unbindTexture()}else{let fe=s.TEXTURE_2D;if((L.isWebGL3DRenderTarget||L.isWebGLArrayRenderTarget)&&(fe=L.isWebGL3DRenderTarget?s.TEXTURE_3D:s.TEXTURE_2D_ARRAY),t.bindTexture(fe,ne.__webglTexture),ke(fe,S),S.mipmaps&&S.mipmaps.length>0)for(let pe=0;pe<S.mipmaps.length;pe++)je(q.__webglFramebuffer[pe],L,S,s.COLOR_ATTACHMENT0,fe,pe);else je(q.__webglFramebuffer,L,S,s.COLOR_ATTACHMENT0,fe,0);_(S)&&b(fe),t.unbindTexture()}L.depthBuffer&&wt(L)}function Ht(L){const S=L.textures;for(let q=0,ne=S.length;q<ne;q++){const le=S[q];if(_(le)){const Se=N(L),Re=r.get(le).__webglTexture;t.bindTexture(Se,Re),b(Se),t.unbindTexture()}}}const Qt=[],Jt=[];function Yt(L){if(L.samples>0){if(Gt(L)===!1){const S=L.textures,q=L.width,ne=L.height;let le=s.COLOR_BUFFER_BIT;const Se=L.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,Re=r.get(L),fe=S.length>1;if(fe)for(let be=0;be<S.length;be++)t.bindFramebuffer(s.FRAMEBUFFER,Re.__webglMultisampledFramebuffer),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+be,s.RENDERBUFFER,null),t.bindFramebuffer(s.FRAMEBUFFER,Re.__webglFramebuffer),s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0+be,s.TEXTURE_2D,null,0);t.bindFramebuffer(s.READ_FRAMEBUFFER,Re.__webglMultisampledFramebuffer);const pe=L.texture.mipmaps;pe&&pe.length>0?t.bindFramebuffer(s.DRAW_FRAMEBUFFER,Re.__webglFramebuffer[0]):t.bindFramebuffer(s.DRAW_FRAMEBUFFER,Re.__webglFramebuffer);for(let be=0;be<S.length;be++){if(L.resolveDepthBuffer&&(L.depthBuffer&&(le|=s.DEPTH_BUFFER_BIT),L.stencilBuffer&&L.resolveStencilBuffer&&(le|=s.STENCIL_BUFFER_BIT)),fe){s.framebufferRenderbuffer(s.READ_FRAMEBUFFER,s.COLOR_ATTACHMENT0,s.RENDERBUFFER,Re.__webglColorRenderbuffer[be]);const Xe=r.get(S[be]).__webglTexture;s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0,s.TEXTURE_2D,Xe,0)}s.blitFramebuffer(0,0,q,ne,0,0,q,ne,le,s.NEAREST),p===!0&&(Qt.length=0,Jt.length=0,Qt.push(s.COLOR_ATTACHMENT0+be),L.depthBuffer&&L.resolveDepthBuffer===!1&&(Qt.push(Se),Jt.push(Se),s.invalidateFramebuffer(s.DRAW_FRAMEBUFFER,Jt)),s.invalidateFramebuffer(s.READ_FRAMEBUFFER,Qt))}if(t.bindFramebuffer(s.READ_FRAMEBUFFER,null),t.bindFramebuffer(s.DRAW_FRAMEBUFFER,null),fe)for(let be=0;be<S.length;be++){t.bindFramebuffer(s.FRAMEBUFFER,Re.__webglMultisampledFramebuffer),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+be,s.RENDERBUFFER,Re.__webglColorRenderbuffer[be]);const Xe=r.get(S[be]).__webglTexture;t.bindFramebuffer(s.FRAMEBUFFER,Re.__webglFramebuffer),s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0+be,s.TEXTURE_2D,Xe,0)}t.bindFramebuffer(s.DRAW_FRAMEBUFFER,Re.__webglMultisampledFramebuffer)}else if(L.depthBuffer&&L.resolveDepthBuffer===!1&&p){const S=L.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT;s.invalidateFramebuffer(s.DRAW_FRAMEBUFFER,[S])}}}function Ct(L){return Math.min(o.maxSamples,L.samples)}function Gt(L){const S=r.get(L);return L.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&S.__useRenderToTexture!==!1}function W(L){const S=c.render.frame;x.get(L)!==S&&(x.set(L,S),L.update())}function gn(L,S){const q=L.colorSpace,ne=L.format,le=L.type;return L.isCompressedTexture===!0||L.isVideoTexture===!0||q!==lu&&q!==Dr&&(vt.getTransfer(q)===Lt?(ne!==Ei||le!==ei)&&rt("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):St("WebGLTextures: Unsupported texture color space:",q)),S}function Et(L){return typeof HTMLImageElement<"u"&&L instanceof HTMLImageElement?(m.width=L.naturalWidth||L.width,m.height=L.naturalHeight||L.height):typeof VideoFrame<"u"&&L instanceof VideoFrame?(m.width=L.displayWidth,m.height=L.displayHeight):(m.width=L.width,m.height=L.height),m}this.allocateTextureUnit=ue,this.resetTextureUnits=ce,this.getTextureUnits=me,this.setTextureUnits=Q,this.setTexture2D=Y,this.setTexture2DArray=ae,this.setTexture3D=oe,this.setTextureCube=F,this.rebindTextures=xt,this.setupRenderTarget=_t,this.updateRenderTargetMipmap=Ht,this.updateMultisampleRenderTarget=Yt,this.setupDepthRenderbuffer=wt,this.setupFrameBufferTexture=je,this.useMultisampledRTT=Gt,this.isReversedDepthBuffer=function(){return t.buffers.depth.getReversed()}}function DT(s,e){function t(r,o=Dr){let l;const c=vt.getTransfer(o);if(r===ei)return s.UNSIGNED_BYTE;if(r===Od)return s.UNSIGNED_SHORT_4_4_4_4;if(r===Bd)return s.UNSIGNED_SHORT_5_5_5_1;if(r===jg)return s.UNSIGNED_INT_5_9_9_9_REV;if(r===e_)return s.UNSIGNED_INT_10F_11F_11F_REV;if(r===Qg)return s.BYTE;if(r===Jg)return s.SHORT;if(r===uo)return s.UNSIGNED_SHORT;if(r===Fd)return s.INT;if(r===ki)return s.UNSIGNED_INT;if(r===Ui)return s.FLOAT;if(r===rr)return s.HALF_FLOAT;if(r===t_)return s.ALPHA;if(r===n_)return s.RGB;if(r===Ei)return s.RGBA;if(r===sr)return s.DEPTH_COMPONENT;if(r===fs)return s.DEPTH_STENCIL;if(r===i_)return s.RED;if(r===kd)return s.RED_INTEGER;if(r===hs)return s.RG;if(r===zd)return s.RG_INTEGER;if(r===Vd)return s.RGBA_INTEGER;if(r===jl||r===eu||r===tu||r===nu)if(c===Lt)if(l=e.get("WEBGL_compressed_texture_s3tc_srgb"),l!==null){if(r===jl)return l.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(r===eu)return l.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(r===tu)return l.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(r===nu)return l.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(l=e.get("WEBGL_compressed_texture_s3tc"),l!==null){if(r===jl)return l.COMPRESSED_RGB_S3TC_DXT1_EXT;if(r===eu)return l.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(r===tu)return l.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(r===nu)return l.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(r===Jf||r===jf||r===ed||r===td)if(l=e.get("WEBGL_compressed_texture_pvrtc"),l!==null){if(r===Jf)return l.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(r===jf)return l.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(r===ed)return l.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(r===td)return l.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(r===nd||r===id||r===rd||r===sd||r===ad||r===au||r===od)if(l=e.get("WEBGL_compressed_texture_etc"),l!==null){if(r===nd||r===id)return c===Lt?l.COMPRESSED_SRGB8_ETC2:l.COMPRESSED_RGB8_ETC2;if(r===rd)return c===Lt?l.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:l.COMPRESSED_RGBA8_ETC2_EAC;if(r===sd)return l.COMPRESSED_R11_EAC;if(r===ad)return l.COMPRESSED_SIGNED_R11_EAC;if(r===au)return l.COMPRESSED_RG11_EAC;if(r===od)return l.COMPRESSED_SIGNED_RG11_EAC}else return null;if(r===ld||r===ud||r===cd||r===fd||r===dd||r===hd||r===pd||r===md||r===gd||r===_d||r===vd||r===xd||r===yd||r===Sd)if(l=e.get("WEBGL_compressed_texture_astc"),l!==null){if(r===ld)return c===Lt?l.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:l.COMPRESSED_RGBA_ASTC_4x4_KHR;if(r===ud)return c===Lt?l.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:l.COMPRESSED_RGBA_ASTC_5x4_KHR;if(r===cd)return c===Lt?l.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:l.COMPRESSED_RGBA_ASTC_5x5_KHR;if(r===fd)return c===Lt?l.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:l.COMPRESSED_RGBA_ASTC_6x5_KHR;if(r===dd)return c===Lt?l.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:l.COMPRESSED_RGBA_ASTC_6x6_KHR;if(r===hd)return c===Lt?l.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:l.COMPRESSED_RGBA_ASTC_8x5_KHR;if(r===pd)return c===Lt?l.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:l.COMPRESSED_RGBA_ASTC_8x6_KHR;if(r===md)return c===Lt?l.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:l.COMPRESSED_RGBA_ASTC_8x8_KHR;if(r===gd)return c===Lt?l.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:l.COMPRESSED_RGBA_ASTC_10x5_KHR;if(r===_d)return c===Lt?l.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:l.COMPRESSED_RGBA_ASTC_10x6_KHR;if(r===vd)return c===Lt?l.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:l.COMPRESSED_RGBA_ASTC_10x8_KHR;if(r===xd)return c===Lt?l.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:l.COMPRESSED_RGBA_ASTC_10x10_KHR;if(r===yd)return c===Lt?l.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:l.COMPRESSED_RGBA_ASTC_12x10_KHR;if(r===Sd)return c===Lt?l.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:l.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(r===Md||r===Ed||r===Td)if(l=e.get("EXT_texture_compression_bptc"),l!==null){if(r===Md)return c===Lt?l.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:l.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(r===Ed)return l.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(r===Td)return l.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(r===wd||r===Ad||r===ou||r===Rd)if(l=e.get("EXT_texture_compression_rgtc"),l!==null){if(r===wd)return l.COMPRESSED_RED_RGTC1_EXT;if(r===Ad)return l.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(r===ou)return l.COMPRESSED_RED_GREEN_RGTC2_EXT;if(r===Rd)return l.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return r===co?s.UNSIGNED_INT_24_8:s[r]!==void 0?s[r]:null}return{convert:t}}const NT=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,IT=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;class UT{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){const r=new m_(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=r}}getMesh(e){if(this.texture!==null&&this.mesh===null){const t=e.cameras[0].viewport,r=new zi({vertexShader:NT,fragmentShader:IT,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new qn(new _u(20,20),r)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class FT extends Br{constructor(e,t){super();const r=this;let o=null,l=1,c=null,d="local-floor",p=1,m=null,x=null,y=null,g=null,M=null,E=null;const R=typeof XRWebGLBinding<"u",v=new UT,_={},b=t.getContextAttributes();let N=null,C=null;const I=[],P=[],O=new Qe;let T=null;const D=new ci;D.viewport=new Zt;const z=new ci;z.viewport=new Zt;const k=[D,z],K=new Xx;let ce=null,me=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(ie){let _e=I[ie];return _e===void 0&&(_e=new ff,I[ie]=_e),_e.getTargetRaySpace()},this.getControllerGrip=function(ie){let _e=I[ie];return _e===void 0&&(_e=new ff,I[ie]=_e),_e.getGripSpace()},this.getHand=function(ie){let _e=I[ie];return _e===void 0&&(_e=new ff,I[ie]=_e),_e.getHandSpace()};function Q(ie){const _e=P.indexOf(ie.inputSource);if(_e===-1)return;const he=I[_e];he!==void 0&&(he.update(ie.inputSource,ie.frame,m||c),he.dispatchEvent({type:ie.type,data:ie.inputSource}))}function ue(){o.removeEventListener("select",Q),o.removeEventListener("selectstart",Q),o.removeEventListener("selectend",Q),o.removeEventListener("squeeze",Q),o.removeEventListener("squeezestart",Q),o.removeEventListener("squeezeend",Q),o.removeEventListener("end",ue),o.removeEventListener("inputsourceschange",$);for(let ie=0;ie<I.length;ie++){const _e=P[ie];_e!==null&&(P[ie]=null,I[ie].disconnect(_e))}ce=null,me=null,v.reset();for(const ie in _)delete _[ie];e.setRenderTarget(N),M=null,g=null,y=null,o=null,C=null,ke.stop(),r.isPresenting=!1,e.setPixelRatio(T),e.setSize(O.width,O.height,!1),r.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(ie){l=ie,r.isPresenting===!0&&rt("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(ie){d=ie,r.isPresenting===!0&&rt("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return m||c},this.setReferenceSpace=function(ie){m=ie},this.getBaseLayer=function(){return g!==null?g:M},this.getBinding=function(){return y===null&&R&&(y=new XRWebGLBinding(o,t)),y},this.getFrame=function(){return E},this.getSession=function(){return o},this.setSession=async function(ie){if(o=ie,o!==null){if(N=e.getRenderTarget(),o.addEventListener("select",Q),o.addEventListener("selectstart",Q),o.addEventListener("selectend",Q),o.addEventListener("squeeze",Q),o.addEventListener("squeezestart",Q),o.addEventListener("squeezeend",Q),o.addEventListener("end",ue),o.addEventListener("inputsourceschange",$),b.xrCompatible!==!0&&await t.makeXRCompatible(),T=e.getPixelRatio(),e.getSize(O),R&&"createProjectionLayer"in XRWebGLBinding.prototype){let he=null,Ie=null,Je=null;b.depth&&(Je=b.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,he=b.stencil?fs:sr,Ie=b.stencil?co:ki);const je={colorFormat:t.RGBA8,depthFormat:Je,scaleFactor:l};y=this.getBinding(),g=y.createProjectionLayer(je),o.updateRenderState({layers:[g]}),e.setPixelRatio(1),e.setSize(g.textureWidth,g.textureHeight,!1),C=new Bi(g.textureWidth,g.textureHeight,{format:Ei,type:ei,depthTexture:new ha(g.textureWidth,g.textureHeight,Ie,void 0,void 0,void 0,void 0,void 0,void 0,he),stencilBuffer:b.stencil,colorSpace:e.outputColorSpace,samples:b.antialias?4:0,resolveDepthBuffer:g.ignoreDepthValues===!1,resolveStencilBuffer:g.ignoreDepthValues===!1})}else{const he={antialias:b.antialias,alpha:!0,depth:b.depth,stencil:b.stencil,framebufferScaleFactor:l};M=new XRWebGLLayer(o,t,he),o.updateRenderState({baseLayer:M}),e.setPixelRatio(1),e.setSize(M.framebufferWidth,M.framebufferHeight,!1),C=new Bi(M.framebufferWidth,M.framebufferHeight,{format:Ei,type:ei,colorSpace:e.outputColorSpace,stencilBuffer:b.stencil,resolveDepthBuffer:M.ignoreDepthValues===!1,resolveStencilBuffer:M.ignoreDepthValues===!1})}C.isXRRenderTarget=!0,this.setFoveation(p),m=null,c=await o.requestReferenceSpace(d),ke.setContext(o),ke.start(),r.isPresenting=!0,r.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(o!==null)return o.environmentBlendMode},this.getDepthTexture=function(){return v.getDepthTexture()};function $(ie){for(let _e=0;_e<ie.removed.length;_e++){const he=ie.removed[_e],Ie=P.indexOf(he);Ie>=0&&(P[Ie]=null,I[Ie].disconnect(he))}for(let _e=0;_e<ie.added.length;_e++){const he=ie.added[_e];let Ie=P.indexOf(he);if(Ie===-1){for(let je=0;je<I.length;je++)if(je>=P.length){P.push(he),Ie=je;break}else if(P[je]===null){P[je]=he,Ie=je;break}if(Ie===-1)break}const Je=I[Ie];Je&&Je.connect(he)}}const Y=new H,ae=new H;function oe(ie,_e,he){Y.setFromMatrixPosition(_e.matrixWorld),ae.setFromMatrixPosition(he.matrixWorld);const Ie=Y.distanceTo(ae),Je=_e.projectionMatrix.elements,je=he.projectionMatrix.elements,Vt=Je[14]/(Je[10]-1),ct=Je[14]/(Je[10]+1),wt=(Je[9]+1)/Je[5],xt=(Je[9]-1)/Je[5],_t=(Je[8]-1)/Je[0],Ht=(je[8]+1)/je[0],Qt=Vt*_t,Jt=Vt*Ht,Yt=Ie/(-_t+Ht),Ct=Yt*-_t;if(_e.matrixWorld.decompose(ie.position,ie.quaternion,ie.scale),ie.translateX(Ct),ie.translateZ(Yt),ie.matrixWorld.compose(ie.position,ie.quaternion,ie.scale),ie.matrixWorldInverse.copy(ie.matrixWorld).invert(),Je[10]===-1)ie.projectionMatrix.copy(_e.projectionMatrix),ie.projectionMatrixInverse.copy(_e.projectionMatrixInverse);else{const Gt=Vt+Yt,W=ct+Yt,gn=Qt-Ct,Et=Jt+(Ie-Ct),L=wt*ct/W*Gt,S=xt*ct/W*Gt;ie.projectionMatrix.makePerspective(gn,Et,L,S,Gt,W),ie.projectionMatrixInverse.copy(ie.projectionMatrix).invert()}}function F(ie,_e){_e===null?ie.matrixWorld.copy(ie.matrix):ie.matrixWorld.multiplyMatrices(_e.matrixWorld,ie.matrix),ie.matrixWorldInverse.copy(ie.matrixWorld).invert()}this.updateCamera=function(ie){if(o===null)return;let _e=ie.near,he=ie.far;v.texture!==null&&(v.depthNear>0&&(_e=v.depthNear),v.depthFar>0&&(he=v.depthFar)),K.near=z.near=D.near=_e,K.far=z.far=D.far=he,(ce!==K.near||me!==K.far)&&(o.updateRenderState({depthNear:K.near,depthFar:K.far}),ce=K.near,me=K.far),K.layers.mask=ie.layers.mask|6,D.layers.mask=K.layers.mask&-5,z.layers.mask=K.layers.mask&-3;const Ie=ie.parent,Je=K.cameras;F(K,Ie);for(let je=0;je<Je.length;je++)F(Je[je],Ie);Je.length===2?oe(K,D,z):K.projectionMatrix.copy(D.projectionMatrix),Z(ie,K,Ie)};function Z(ie,_e,he){he===null?ie.matrix.copy(_e.matrixWorld):(ie.matrix.copy(he.matrixWorld),ie.matrix.invert(),ie.matrix.multiply(_e.matrixWorld)),ie.matrix.decompose(ie.position,ie.quaternion,ie.scale),ie.updateMatrixWorld(!0),ie.projectionMatrix.copy(_e.projectionMatrix),ie.projectionMatrixInverse.copy(_e.projectionMatrixInverse),ie.isPerspectiveCamera&&(ie.fov=Pd*2*Math.atan(1/ie.projectionMatrix.elements[5]),ie.zoom=1)}this.getCamera=function(){return K},this.getFoveation=function(){if(!(g===null&&M===null))return p},this.setFoveation=function(ie){p=ie,g!==null&&(g.fixedFoveation=ie),M!==null&&M.fixedFoveation!==void 0&&(M.fixedFoveation=ie)},this.hasDepthSensing=function(){return v.texture!==null},this.getDepthSensingMesh=function(){return v.getMesh(K)},this.getCameraTexture=function(ie){return _[ie]};let Ne=null;function qe(ie,_e){if(x=_e.getViewerPose(m||c),E=_e,x!==null){const he=x.views;M!==null&&(e.setRenderTargetFramebuffer(C,M.framebuffer),e.setRenderTarget(C));let Ie=!1;he.length!==K.cameras.length&&(K.cameras.length=0,Ie=!0);for(let ct=0;ct<he.length;ct++){const wt=he[ct];let xt=null;if(M!==null)xt=M.getViewport(wt);else{const Ht=y.getViewSubImage(g,wt);xt=Ht.viewport,ct===0&&(e.setRenderTargetTextures(C,Ht.colorTexture,Ht.depthStencilTexture),e.setRenderTarget(C))}let _t=k[ct];_t===void 0&&(_t=new ci,_t.layers.enable(ct),_t.viewport=new Zt,k[ct]=_t),_t.matrix.fromArray(wt.transform.matrix),_t.matrix.decompose(_t.position,_t.quaternion,_t.scale),_t.projectionMatrix.fromArray(wt.projectionMatrix),_t.projectionMatrixInverse.copy(_t.projectionMatrix).invert(),_t.viewport.set(xt.x,xt.y,xt.width,xt.height),ct===0&&(K.matrix.copy(_t.matrix),K.matrix.decompose(K.position,K.quaternion,K.scale)),Ie===!0&&K.cameras.push(_t)}const Je=o.enabledFeatures;if(Je&&Je.includes("depth-sensing")&&o.depthUsage=="gpu-optimized"&&R){y=r.getBinding();const ct=y.getDepthInformation(he[0]);ct&&ct.isValid&&ct.texture&&v.init(ct,o.renderState)}if(Je&&Je.includes("camera-access")&&R){e.state.unbindTexture(),y=r.getBinding();for(let ct=0;ct<he.length;ct++){const wt=he[ct].camera;if(wt){let xt=_[wt];xt||(xt=new m_,_[wt]=xt);const _t=y.getCameraImage(wt);xt.sourceTexture=_t}}}}for(let he=0;he<I.length;he++){const Ie=P[he],Je=I[he];Ie!==null&&Je!==void 0&&Je.update(Ie,_e,m||c)}Ne&&Ne(ie,_e),_e.detectedPlanes&&r.dispatchEvent({type:"planesdetected",data:_e}),E=null}const ke=new x_;ke.setAnimationLoop(qe),this.setAnimationLoop=function(ie){Ne=ie},this.dispose=function(){}}}const OT=new Ut,A_=new ut;A_.set(-1,0,0,0,1,0,0,0,1);function BT(s,e){function t(v,_){v.matrixAutoUpdate===!0&&v.updateMatrix(),_.value.copy(v.matrix)}function r(v,_){_.color.getRGB(v.fogColor.value,g_(s)),_.isFog?(v.fogNear.value=_.near,v.fogFar.value=_.far):_.isFogExp2&&(v.fogDensity.value=_.density)}function o(v,_,b,N,C){_.isNodeMaterial?_.uniformsNeedUpdate=!1:_.isMeshBasicMaterial?l(v,_):_.isMeshLambertMaterial?(l(v,_),_.envMap&&(v.envMapIntensity.value=_.envMapIntensity)):_.isMeshToonMaterial?(l(v,_),y(v,_)):_.isMeshPhongMaterial?(l(v,_),x(v,_),_.envMap&&(v.envMapIntensity.value=_.envMapIntensity)):_.isMeshStandardMaterial?(l(v,_),g(v,_),_.isMeshPhysicalMaterial&&M(v,_,C)):_.isMeshMatcapMaterial?(l(v,_),E(v,_)):_.isMeshDepthMaterial?l(v,_):_.isMeshDistanceMaterial?(l(v,_),R(v,_)):_.isMeshNormalMaterial?l(v,_):_.isLineBasicMaterial?(c(v,_),_.isLineDashedMaterial&&d(v,_)):_.isPointsMaterial?p(v,_,b,N):_.isSpriteMaterial?m(v,_):_.isShadowMaterial?(v.color.value.copy(_.color),v.opacity.value=_.opacity):_.isShaderMaterial&&(_.uniformsNeedUpdate=!1)}function l(v,_){v.opacity.value=_.opacity,_.color&&v.diffuse.value.copy(_.color),_.emissive&&v.emissive.value.copy(_.emissive).multiplyScalar(_.emissiveIntensity),_.map&&(v.map.value=_.map,t(_.map,v.mapTransform)),_.alphaMap&&(v.alphaMap.value=_.alphaMap,t(_.alphaMap,v.alphaMapTransform)),_.bumpMap&&(v.bumpMap.value=_.bumpMap,t(_.bumpMap,v.bumpMapTransform),v.bumpScale.value=_.bumpScale,_.side===On&&(v.bumpScale.value*=-1)),_.normalMap&&(v.normalMap.value=_.normalMap,t(_.normalMap,v.normalMapTransform),v.normalScale.value.copy(_.normalScale),_.side===On&&v.normalScale.value.negate()),_.displacementMap&&(v.displacementMap.value=_.displacementMap,t(_.displacementMap,v.displacementMapTransform),v.displacementScale.value=_.displacementScale,v.displacementBias.value=_.displacementBias),_.emissiveMap&&(v.emissiveMap.value=_.emissiveMap,t(_.emissiveMap,v.emissiveMapTransform)),_.specularMap&&(v.specularMap.value=_.specularMap,t(_.specularMap,v.specularMapTransform)),_.alphaTest>0&&(v.alphaTest.value=_.alphaTest);const b=e.get(_),N=b.envMap,C=b.envMapRotation;N&&(v.envMap.value=N,v.envMapRotation.value.setFromMatrix4(OT.makeRotationFromEuler(C)).transpose(),N.isCubeTexture&&N.isRenderTargetTexture===!1&&v.envMapRotation.value.premultiply(A_),v.reflectivity.value=_.reflectivity,v.ior.value=_.ior,v.refractionRatio.value=_.refractionRatio),_.lightMap&&(v.lightMap.value=_.lightMap,v.lightMapIntensity.value=_.lightMapIntensity,t(_.lightMap,v.lightMapTransform)),_.aoMap&&(v.aoMap.value=_.aoMap,v.aoMapIntensity.value=_.aoMapIntensity,t(_.aoMap,v.aoMapTransform))}function c(v,_){v.diffuse.value.copy(_.color),v.opacity.value=_.opacity,_.map&&(v.map.value=_.map,t(_.map,v.mapTransform))}function d(v,_){v.dashSize.value=_.dashSize,v.totalSize.value=_.dashSize+_.gapSize,v.scale.value=_.scale}function p(v,_,b,N){v.diffuse.value.copy(_.color),v.opacity.value=_.opacity,v.size.value=_.size*b,v.scale.value=N*.5,_.map&&(v.map.value=_.map,t(_.map,v.uvTransform)),_.alphaMap&&(v.alphaMap.value=_.alphaMap,t(_.alphaMap,v.alphaMapTransform)),_.alphaTest>0&&(v.alphaTest.value=_.alphaTest)}function m(v,_){v.diffuse.value.copy(_.color),v.opacity.value=_.opacity,v.rotation.value=_.rotation,_.map&&(v.map.value=_.map,t(_.map,v.mapTransform)),_.alphaMap&&(v.alphaMap.value=_.alphaMap,t(_.alphaMap,v.alphaMapTransform)),_.alphaTest>0&&(v.alphaTest.value=_.alphaTest)}function x(v,_){v.specular.value.copy(_.specular),v.shininess.value=Math.max(_.shininess,1e-4)}function y(v,_){_.gradientMap&&(v.gradientMap.value=_.gradientMap)}function g(v,_){v.metalness.value=_.metalness,_.metalnessMap&&(v.metalnessMap.value=_.metalnessMap,t(_.metalnessMap,v.metalnessMapTransform)),v.roughness.value=_.roughness,_.roughnessMap&&(v.roughnessMap.value=_.roughnessMap,t(_.roughnessMap,v.roughnessMapTransform)),_.envMap&&(v.envMapIntensity.value=_.envMapIntensity)}function M(v,_,b){v.ior.value=_.ior,_.sheen>0&&(v.sheenColor.value.copy(_.sheenColor).multiplyScalar(_.sheen),v.sheenRoughness.value=_.sheenRoughness,_.sheenColorMap&&(v.sheenColorMap.value=_.sheenColorMap,t(_.sheenColorMap,v.sheenColorMapTransform)),_.sheenRoughnessMap&&(v.sheenRoughnessMap.value=_.sheenRoughnessMap,t(_.sheenRoughnessMap,v.sheenRoughnessMapTransform))),_.clearcoat>0&&(v.clearcoat.value=_.clearcoat,v.clearcoatRoughness.value=_.clearcoatRoughness,_.clearcoatMap&&(v.clearcoatMap.value=_.clearcoatMap,t(_.clearcoatMap,v.clearcoatMapTransform)),_.clearcoatRoughnessMap&&(v.clearcoatRoughnessMap.value=_.clearcoatRoughnessMap,t(_.clearcoatRoughnessMap,v.clearcoatRoughnessMapTransform)),_.clearcoatNormalMap&&(v.clearcoatNormalMap.value=_.clearcoatNormalMap,t(_.clearcoatNormalMap,v.clearcoatNormalMapTransform),v.clearcoatNormalScale.value.copy(_.clearcoatNormalScale),_.side===On&&v.clearcoatNormalScale.value.negate())),_.dispersion>0&&(v.dispersion.value=_.dispersion),_.iridescence>0&&(v.iridescence.value=_.iridescence,v.iridescenceIOR.value=_.iridescenceIOR,v.iridescenceThicknessMinimum.value=_.iridescenceThicknessRange[0],v.iridescenceThicknessMaximum.value=_.iridescenceThicknessRange[1],_.iridescenceMap&&(v.iridescenceMap.value=_.iridescenceMap,t(_.iridescenceMap,v.iridescenceMapTransform)),_.iridescenceThicknessMap&&(v.iridescenceThicknessMap.value=_.iridescenceThicknessMap,t(_.iridescenceThicknessMap,v.iridescenceThicknessMapTransform))),_.transmission>0&&(v.transmission.value=_.transmission,v.transmissionSamplerMap.value=b.texture,v.transmissionSamplerSize.value.set(b.width,b.height),_.transmissionMap&&(v.transmissionMap.value=_.transmissionMap,t(_.transmissionMap,v.transmissionMapTransform)),v.thickness.value=_.thickness,_.thicknessMap&&(v.thicknessMap.value=_.thicknessMap,t(_.thicknessMap,v.thicknessMapTransform)),v.attenuationDistance.value=_.attenuationDistance,v.attenuationColor.value.copy(_.attenuationColor)),_.anisotropy>0&&(v.anisotropyVector.value.set(_.anisotropy*Math.cos(_.anisotropyRotation),_.anisotropy*Math.sin(_.anisotropyRotation)),_.anisotropyMap&&(v.anisotropyMap.value=_.anisotropyMap,t(_.anisotropyMap,v.anisotropyMapTransform))),v.specularIntensity.value=_.specularIntensity,v.specularColor.value.copy(_.specularColor),_.specularColorMap&&(v.specularColorMap.value=_.specularColorMap,t(_.specularColorMap,v.specularColorMapTransform)),_.specularIntensityMap&&(v.specularIntensityMap.value=_.specularIntensityMap,t(_.specularIntensityMap,v.specularIntensityMapTransform))}function E(v,_){_.matcap&&(v.matcap.value=_.matcap)}function R(v,_){const b=e.get(_).light;v.referencePosition.value.setFromMatrixPosition(b.matrixWorld),v.nearDistance.value=b.shadow.camera.near,v.farDistance.value=b.shadow.camera.far}return{refreshFogUniforms:r,refreshMaterialUniforms:o}}function kT(s,e,t,r){let o={},l={},c=[];const d=s.getParameter(s.MAX_UNIFORM_BUFFER_BINDINGS);function p(C,I){const P=I.program;r.uniformBlockBinding(C,P)}function m(C,I){let P=o[C.id];P===void 0&&(v(C),P=x(C),o[C.id]=P,C.addEventListener("dispose",b));const O=I.program;r.updateUBOMapping(C,O);const T=e.render.frame;l[C.id]!==T&&(g(C),l[C.id]=T)}function x(C){const I=y();C.__bindingPointIndex=I;const P=s.createBuffer(),O=C.__size,T=C.usage;return s.bindBuffer(s.UNIFORM_BUFFER,P),s.bufferData(s.UNIFORM_BUFFER,O,T),s.bindBuffer(s.UNIFORM_BUFFER,null),s.bindBufferBase(s.UNIFORM_BUFFER,I,P),P}function y(){for(let C=0;C<d;C++)if(c.indexOf(C)===-1)return c.push(C),C;return St("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function g(C){const I=o[C.id],P=C.uniforms,O=C.__cache;s.bindBuffer(s.UNIFORM_BUFFER,I);for(let T=0,D=P.length;T<D;T++){const z=P[T];if(Array.isArray(z))for(let k=0,K=z.length;k<K;k++)M(z[k],T,k,O);else M(z,T,0,O)}s.bindBuffer(s.UNIFORM_BUFFER,null)}function M(C,I,P,O){if(R(C,I,P,O)===!0){const T=C.__offset,D=C.value;if(Array.isArray(D)){let z=0;for(let k=0;k<D.length;k++){const K=D[k],ce=_(K);E(K,C.__data,z),typeof K!="number"&&typeof K!="boolean"&&!K.isMatrix3&&!ArrayBuffer.isView(K)&&(z+=ce.storage/Float32Array.BYTES_PER_ELEMENT)}}else E(D,C.__data,0);s.bufferSubData(s.UNIFORM_BUFFER,T,C.__data)}}function E(C,I,P){typeof C=="number"||typeof C=="boolean"?I[0]=C:C.isMatrix3?(I[0]=C.elements[0],I[1]=C.elements[1],I[2]=C.elements[2],I[3]=0,I[4]=C.elements[3],I[5]=C.elements[4],I[6]=C.elements[5],I[7]=0,I[8]=C.elements[6],I[9]=C.elements[7],I[10]=C.elements[8],I[11]=0):ArrayBuffer.isView(C)?I.set(new C.constructor(C.buffer,C.byteOffset,I.length)):C.toArray(I,P)}function R(C,I,P,O){const T=C.value,D=I+"_"+P;if(O[D]===void 0)return typeof T=="number"||typeof T=="boolean"?O[D]=T:ArrayBuffer.isView(T)?O[D]=T.slice():O[D]=T.clone(),!0;{const z=O[D];if(typeof T=="number"||typeof T=="boolean"){if(z!==T)return O[D]=T,!0}else{if(ArrayBuffer.isView(T))return!0;if(z.equals(T)===!1)return z.copy(T),!0}}return!1}function v(C){const I=C.uniforms;let P=0;const O=16;for(let D=0,z=I.length;D<z;D++){const k=Array.isArray(I[D])?I[D]:[I[D]];for(let K=0,ce=k.length;K<ce;K++){const me=k[K],Q=Array.isArray(me.value)?me.value:[me.value];for(let ue=0,$=Q.length;ue<$;ue++){const Y=Q[ue],ae=_(Y),oe=P%O,F=oe%ae.boundary,Z=oe+F;P+=F,Z!==0&&O-Z<ae.storage&&(P+=O-Z),me.__data=new Float32Array(ae.storage/Float32Array.BYTES_PER_ELEMENT),me.__offset=P,P+=ae.storage}}}const T=P%O;return T>0&&(P+=O-T),C.__size=P,C.__cache={},this}function _(C){const I={boundary:0,storage:0};return typeof C=="number"||typeof C=="boolean"?(I.boundary=4,I.storage=4):C.isVector2?(I.boundary=8,I.storage=8):C.isVector3||C.isColor?(I.boundary=16,I.storage=12):C.isVector4?(I.boundary=16,I.storage=16):C.isMatrix3?(I.boundary=48,I.storage=48):C.isMatrix4?(I.boundary=64,I.storage=64):C.isTexture?rt("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(C)?(I.boundary=16,I.storage=C.byteLength):rt("WebGLRenderer: Unsupported uniform value type.",C),I}function b(C){const I=C.target;I.removeEventListener("dispose",b);const P=c.indexOf(I.__bindingPointIndex);c.splice(P,1),s.deleteBuffer(o[I.id]),delete o[I.id],delete l[I.id]}function N(){for(const C in o)s.deleteBuffer(o[C]);c=[],o={},l={}}return{bind:p,update:m,dispose:N}}const zT=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]);let Li=null;function VT(){return Li===null&&(Li=new yx(zT,16,16,hs,rr),Li.name="DFG_LUT",Li.minFilter=Pn,Li.magFilter=Pn,Li.wrapS=tr,Li.wrapT=tr,Li.generateMipmaps=!1,Li.needsUpdate=!0),Li}class HT{constructor(e={}){const{canvas:t=Kv(),context:r=null,depth:o=!0,stencil:l=!1,alpha:c=!1,antialias:d=!1,premultipliedAlpha:p=!0,preserveDrawingBuffer:m=!1,powerPreference:x="default",failIfMajorPerformanceCaveat:y=!1,reversedDepthBuffer:g=!1,outputBufferType:M=ei}=e;this.isWebGLRenderer=!0;let E;if(r!==null){if(typeof WebGLRenderingContext<"u"&&r instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");E=r.getContextAttributes().alpha}else E=c;const R=M,v=new Set([Vd,zd,kd]),_=new Set([ei,ki,uo,co,Od,Bd]),b=new Uint32Array(4),N=new Int32Array(4),C=new H;let I=null,P=null;const O=[],T=[];let D=null;this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=Oi,this.toneMappingExposure=1,this.transmissionResolutionScale=1;const z=this;let k=!1,K=null,ce=null,me=null,Q=null;this._outputColorSpace=Fn;let ue=0,$=0,Y=null,ae=-1,oe=null;const F=new Zt,Z=new Zt;let Ne=null;const qe=new dt(0);let ke=0,ie=t.width,_e=t.height,he=1,Ie=null,Je=null;const je=new Zt(0,0,ie,_e),Vt=new Zt(0,0,ie,_e);let ct=!1;const wt=new Xd;let xt=!1,_t=!1;const Ht=new Ut,Qt=new H,Jt=new Zt,Yt={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let Ct=!1;function Gt(){return Y===null?he:1}let W=r;function gn(A,X){return t.getContext(A,X)}try{const A={alpha:!0,depth:o,stencil:l,antialias:d,premultipliedAlpha:p,preserveDrawingBuffer:m,powerPreference:x,failIfMajorPerformanceCaveat:y};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${Id}`),t.addEventListener("webglcontextlost",Dt,!1),t.addEventListener("webglcontextrestored",At,!1),t.addEventListener("webglcontextcreationerror",En,!1),W===null){const X="webgl2";if(W=gn(X,A),W===null)throw gn(X)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}}catch(A){throw St("WebGLRenderer: "+A.message),A}let Et,L,S,q,ne,le,Se,Re,fe,pe,be,Xe,Pe,Ae,Ze,et,it,V,we,de,Ce,Le,ge;function He(){Et=new VM(W),Et.init(),Ce=new DT(W,Et),L=new NM(W,Et,e,Ce),S=new PT(W,Et),L.reversedDepthBuffer&&g&&S.buffers.depth.setReversed(!0),ce=W.createFramebuffer(),me=W.createFramebuffer(),Q=W.createFramebuffer(),q=new WM(W),ne=new gT,le=new LT(W,Et,S,ne,L,Ce,q),Se=new zM(z),Re=new Kx(W),Le=new LM(W,Re),fe=new HM(W,Re,q,Le),pe=new YM(W,fe,Re,Le,q),V=new XM(W,L,le),Ze=new IM(ne),be=new mT(z,Se,Et,L,Le,Ze),Xe=new BT(z,ne),Pe=new vT,Ae=new TT(Et),it=new PM(z,Se,S,pe,E,p),et=new bT(z,pe,L),ge=new kT(W,q,L,S),we=new DM(W,Et,q),de=new GM(W,Et,q),q.programs=be.programs,z.capabilities=L,z.extensions=Et,z.properties=ne,z.renderLists=Pe,z.shadowMap=et,z.state=S,z.info=q}He(),R!==ei&&(D=new KM(R,t.width,t.height,d,o,l));const ze=new FT(z,W);this.xr=ze,this.getContext=function(){return W},this.getContextAttributes=function(){return W.getContextAttributes()},this.forceContextLoss=function(){const A=Et.get("WEBGL_lose_context");A&&A.loseContext()},this.forceContextRestore=function(){const A=Et.get("WEBGL_lose_context");A&&A.restoreContext()},this.getPixelRatio=function(){return he},this.setPixelRatio=function(A){A!==void 0&&(he=A,this.setSize(ie,_e,!1))},this.getSize=function(A){return A.set(ie,_e)},this.setSize=function(A,X,re=!0){if(ze.isPresenting){rt("WebGLRenderer: Can't change size while VR device is presenting.");return}ie=A,_e=X,t.width=Math.floor(A*he),t.height=Math.floor(X*he),re===!0&&(t.style.width=A+"px",t.style.height=X+"px"),D!==null&&D.setSize(t.width,t.height),this.setViewport(0,0,A,X)},this.getDrawingBufferSize=function(A){return A.set(ie*he,_e*he).floor()},this.setDrawingBufferSize=function(A,X,re){ie=A,_e=X,he=re,t.width=Math.floor(A*re),t.height=Math.floor(X*re),this.setViewport(0,0,A,X)},this.setEffects=function(A){if(R===ei){St("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(A){for(let X=0;X<A.length;X++)if(A[X].isOutputPass===!0){rt("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}D.setEffects(A||[])},this.getCurrentViewport=function(A){return A.copy(F)},this.getViewport=function(A){return A.copy(je)},this.setViewport=function(A,X,re,ee){A.isVector4?je.set(A.x,A.y,A.z,A.w):je.set(A,X,re,ee),S.viewport(F.copy(je).multiplyScalar(he).round())},this.getScissor=function(A){return A.copy(Vt)},this.setScissor=function(A,X,re,ee){A.isVector4?Vt.set(A.x,A.y,A.z,A.w):Vt.set(A,X,re,ee),S.scissor(Z.copy(Vt).multiplyScalar(he).round())},this.getScissorTest=function(){return ct},this.setScissorTest=function(A){S.setScissorTest(ct=A)},this.setOpaqueSort=function(A){Ie=A},this.setTransparentSort=function(A){Je=A},this.getClearColor=function(A){return A.copy(it.getClearColor())},this.setClearColor=function(){it.setClearColor(...arguments)},this.getClearAlpha=function(){return it.getClearAlpha()},this.setClearAlpha=function(){it.setClearAlpha(...arguments)},this.clear=function(A=!0,X=!0,re=!0){let ee=0;if(A){let j=!1;if(Y!==null){const Te=Y.texture.format;j=v.has(Te)}if(j){const Te=Y.texture.type,Oe=_.has(Te),Ee=it.getClearColor(),Ge=it.getClearAlpha(),$e=Ee.r,ot=Ee.g,lt=Ee.b;Oe?(b[0]=$e,b[1]=ot,b[2]=lt,b[3]=Ge,W.clearBufferuiv(W.COLOR,0,b)):(N[0]=$e,N[1]=ot,N[2]=lt,N[3]=Ge,W.clearBufferiv(W.COLOR,0,N))}else ee|=W.COLOR_BUFFER_BIT}X&&(ee|=W.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),re&&(ee|=W.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),ee!==0&&W.clear(ee)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(A){A.setRenderer(this),K=A},this.dispose=function(){t.removeEventListener("webglcontextlost",Dt,!1),t.removeEventListener("webglcontextrestored",At,!1),t.removeEventListener("webglcontextcreationerror",En,!1),it.dispose(),Pe.dispose(),Ae.dispose(),ne.dispose(),Se.dispose(),pe.dispose(),Le.dispose(),ge.dispose(),be.dispose(),ze.dispose(),ze.removeEventListener("sessionstart",vo),ze.removeEventListener("sessionend",xo),Ln.stop()};function Dt(A){A.preventDefault(),cu("WebGLRenderer: Context Lost."),k=!0}function At(){cu("WebGLRenderer: Context Restored."),k=!1;const A=q.autoReset,X=et.enabled,re=et.autoUpdate,ee=et.needsUpdate,j=et.type;He(),q.autoReset=A,et.enabled=X,et.autoUpdate=re,et.needsUpdate=ee,et.type=j}function En(A){St("WebGLRenderer: A WebGL context could not be created. Reason: ",A.statusMessage)}function ti(A){const X=A.target;X.removeEventListener("dispose",ti),zr(X)}function zr(A){ps(A),ne.remove(A)}function ps(A){const X=ne.get(A).programs;X!==void 0&&(X.forEach(function(re){be.releaseProgram(re)}),A.isShaderMaterial&&be.releaseShaderCache(A))}this.renderBufferDirect=function(A,X,re,ee,j,Te){X===null&&(X=Yt);const Oe=j.isMesh&&j.matrixWorld.determinantAffine()<0,Ee=qt(A,X,re,ee,j);S.setMaterial(ee,Oe);let Ge=re.index,$e=1;if(ee.wireframe===!0){if(Ge=fe.getWireframeAttribute(re),Ge===void 0)return;$e=2}const ot=re.drawRange,lt=re.attributes.position;let Ye=ot.start*$e,yt=(ot.start+ot.count)*$e;Te!==null&&(Ye=Math.max(Ye,Te.start*$e),yt=Math.min(yt,(Te.start+Te.count)*$e)),Ge!==null?(Ye=Math.max(Ye,0),yt=Math.min(yt,Ge.count)):lt!=null&&(Ye=Math.max(Ye,0),yt=Math.min(yt,lt.count));const Ft=yt-Ye;if(Ft<0||Ft===1/0)return;Le.setup(j,ee,Ee,re,Ge);let Wt,bt=we;if(Ge!==null&&(Wt=Re.get(Ge),bt=de,bt.setIndex(Wt)),j.isMesh)ee.wireframe===!0?(S.setLineWidth(ee.wireframeLinewidth*Gt()),bt.setMode(W.LINES)):bt.setMode(W.TRIANGLES);else if(j.isLine){let nn=ee.linewidth;nn===void 0&&(nn=1),S.setLineWidth(nn*Gt()),j.isLineSegments?bt.setMode(W.LINES):j.isLineLoop?bt.setMode(W.LINE_LOOP):bt.setMode(W.LINE_STRIP)}else j.isPoints?bt.setMode(W.POINTS):j.isSprite&&bt.setMode(W.TRIANGLES);if(j.isBatchedMesh)if(Et.get("WEBGL_multi_draw"))bt.renderMultiDraw(j._multiDrawStarts,j._multiDrawCounts,j._multiDrawCount);else{const nn=j._multiDrawStarts,Ue=j._multiDrawCounts,_n=j._multiDrawCount,ht=Ge?Re.get(Ge).bytesPerElement:1,Bn=ne.get(ee).currentProgram.getUniforms();for(let kn=0;kn<_n;kn++)Bn.setValue(W,"_gl_DrawID",kn),bt.render(nn[kn]/ht,Ue[kn])}else if(j.isInstancedMesh)bt.renderInstances(Ye,Ft,j.count);else if(re.isInstancedBufferGeometry){const nn=re._maxInstanceCount!==void 0?re._maxInstanceCount:1/0,Ue=Math.min(re.instanceCount,nn);bt.renderInstances(Ye,Ft,Ue)}else bt.render(Ye,Ft)};function Vr(A,X,re){A.transparent===!0&&A.side===Ni&&A.forceSinglePass===!1?(A.side=On,A.needsUpdate=!0,Wr(A,X,re),A.side=Ur,A.needsUpdate=!0,Wr(A,X,re),A.side=Ni):Wr(A,X,re)}this.compile=function(A,X,re=null){re===null&&(re=A),P=Ae.get(re),P.init(X),T.push(P),re.traverseVisible(function(j){j.isLight&&j.layers.test(X.layers)&&(P.pushLight(j),j.castShadow&&P.pushShadow(j))}),A!==re&&A.traverseVisible(function(j){j.isLight&&j.layers.test(X.layers)&&(P.pushLight(j),j.castShadow&&P.pushShadow(j))}),P.setupLights();const ee=new Set;return A.traverse(function(j){if(!(j.isMesh||j.isPoints||j.isLine||j.isSprite))return;const Te=j.material;if(Te)if(Array.isArray(Te))for(let Oe=0;Oe<Te.length;Oe++){const Ee=Te[Oe];Vr(Ee,re,j),ee.add(Ee)}else Vr(Te,re,j),ee.add(Te)}),P=T.pop(),ee},this.compileAsync=function(A,X,re=null){const ee=this.compile(A,X,re);return new Promise(j=>{function Te(){if(ee.forEach(function(Oe){ne.get(Oe).currentProgram.isReady()&&ee.delete(Oe)}),ee.size===0){j(A);return}setTimeout(Te,10)}Et.get("KHR_parallel_shader_compile")!==null?Te():setTimeout(Te,10)})};let Hr=null;function yu(A){Hr&&Hr(A)}function vo(){Ln.stop()}function xo(){Ln.start()}const Ln=new x_;Ln.setAnimationLoop(yu),typeof self<"u"&&Ln.setContext(self),this.setAnimationLoop=function(A){Hr=A,ze.setAnimationLoop(A),A===null?Ln.stop():Ln.start()},ze.addEventListener("sessionstart",vo),ze.addEventListener("sessionend",xo),this.render=function(A,X){if(X!==void 0&&X.isCamera!==!0){St("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(k===!0)return;K!==null&&K.renderStart(A,X);const re=ze.enabled===!0&&ze.isPresenting===!0,ee=D!==null&&(Y===null||re)&&D.begin(z,Y);if(A.matrixWorldAutoUpdate===!0&&A.updateMatrixWorld(),X.parent===null&&X.matrixWorldAutoUpdate===!0&&X.updateMatrixWorld(),ze.enabled===!0&&ze.isPresenting===!0&&(D===null||D.isCompositing()===!1)&&(ze.cameraAutoUpdate===!0&&ze.updateCamera(X),X=ze.getCamera()),A.isScene===!0&&A.onBeforeRender(z,A,X,Y),P=Ae.get(A,T.length),P.init(X),P.state.textureUnits=le.getTextureUnits(),T.push(P),Ht.multiplyMatrices(X.projectionMatrix,X.matrixWorldInverse),wt.setFromProjectionMatrix(Ht,Fi,X.reversedDepth),_t=this.localClippingEnabled,xt=Ze.init(this.clippingPlanes,_t),I=Pe.get(A,O.length),I.init(),O.push(I),ze.enabled===!0&&ze.isPresenting===!0){const Oe=z.xr.getDepthSensingMesh();Oe!==null&&ms(Oe,X,-1/0,z.sortObjects)}ms(A,X,0,z.sortObjects),I.finish(),z.sortObjects===!0&&I.sort(Ie,Je,X.reversedDepth),Ct=ze.enabled===!1||ze.isPresenting===!1||ze.hasDepthSensing()===!1,Ct&&it.addToRenderList(I,A),this.info.render.frame++,this.info.autoReset===!0&&this.info.reset(),xt===!0&&Ze.beginShadows();const j=P.state.shadowsArray;if(et.render(j,A,X),xt===!0&&Ze.endShadows(),(ee&&D.hasRenderPass())===!1){const Oe=I.opaque,Ee=I.transmissive;if(P.setupLights(),X.isArrayCamera){const Ge=X.cameras;if(Ee.length>0)for(let $e=0,ot=Ge.length;$e<ot;$e++){const lt=Ge[$e];yo(Oe,Ee,A,lt)}Ct&&it.render(A);for(let $e=0,ot=Ge.length;$e<ot;$e++){const lt=Ge[$e];ga(I,A,lt,lt.viewport)}}else Ee.length>0&&yo(Oe,Ee,A,X),Ct&&it.render(A),ga(I,A,X)}Y!==null&&$===0&&(le.updateMultisampleRenderTarget(Y),le.updateRenderTargetMipmap(Y)),ee&&D.end(z),A.isScene===!0&&A.onAfterRender(z,A,X),Le.resetDefaultState(),ae=-1,oe=null,T.pop(),T.length>0?(P=T[T.length-1],le.setTextureUnits(P.state.textureUnits),xt===!0&&Ze.setGlobalState(z.clippingPlanes,P.state.camera)):P=null,O.pop(),O.length>0?I=O[O.length-1]:I=null,K!==null&&K.renderEnd()};function ms(A,X,re,ee){if(A.visible===!1)return;if(A.layers.test(X.layers)){if(A.isGroup)re=A.renderOrder;else if(A.isLOD)A.autoUpdate===!0&&A.update(X);else if(A.isLightProbeGrid)P.pushLightProbeGrid(A);else if(A.isLight)P.pushLight(A),A.castShadow&&P.pushShadow(A);else if(A.isSprite){if(!A.frustumCulled||wt.intersectsSprite(A)){ee&&Jt.setFromMatrixPosition(A.matrixWorld).applyMatrix4(Ht);const Oe=pe.update(A),Ee=A.material;Ee.visible&&I.push(A,Oe,Ee,re,Jt.z,null)}}else if((A.isMesh||A.isLine||A.isPoints)&&(!A.frustumCulled||wt.intersectsObject(A))){const Oe=pe.update(A),Ee=A.material;if(ee&&(A.boundingSphere!==void 0?(A.boundingSphere===null&&A.computeBoundingSphere(),Jt.copy(A.boundingSphere.center)):(Oe.boundingSphere===null&&Oe.computeBoundingSphere(),Jt.copy(Oe.boundingSphere.center)),Jt.applyMatrix4(A.matrixWorld).applyMatrix4(Ht)),Array.isArray(Ee)){const Ge=Oe.groups;for(let $e=0,ot=Ge.length;$e<ot;$e++){const lt=Ge[$e],Ye=Ee[lt.materialIndex];Ye&&Ye.visible&&I.push(A,Oe,Ye,re,Jt.z,lt)}}else Ee.visible&&I.push(A,Oe,Ee,re,Jt.z,null)}}const Te=A.children;for(let Oe=0,Ee=Te.length;Oe<Ee;Oe++)ms(Te[Oe],X,re,ee)}function ga(A,X,re,ee){const{opaque:j,transmissive:Te,transparent:Oe}=A;P.setupLightsView(re),xt===!0&&Ze.setGlobalState(z.clippingPlanes,re),ee&&S.viewport(F.copy(ee)),j.length>0&&Gr(j,X,re),Te.length>0&&Gr(Te,X,re),Oe.length>0&&Gr(Oe,X,re),S.buffers.depth.setTest(!0),S.buffers.depth.setMask(!0),S.buffers.color.setMask(!0),S.setPolygonOffset(!1)}function yo(A,X,re,ee){if((re.isScene===!0?re.overrideMaterial:null)!==null)return;if(P.state.transmissionRenderTarget[ee.id]===void 0){const Ye=Et.has("EXT_color_buffer_half_float")||Et.has("EXT_color_buffer_float");P.state.transmissionRenderTarget[ee.id]=new Bi(1,1,{generateMipmaps:!0,type:Ye?rr:ei,minFilter:cs,samples:Math.max(4,L.samples),stencilBuffer:l,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:vt.workingColorSpace})}const Te=P.state.transmissionRenderTarget[ee.id],Oe=ee.viewport||F;Te.setSize(Oe.z*z.transmissionResolutionScale,Oe.w*z.transmissionResolutionScale);const Ee=z.getRenderTarget(),Ge=z.getActiveCubeFace(),$e=z.getActiveMipmapLevel();z.setRenderTarget(Te),z.getClearColor(qe),ke=z.getClearAlpha(),ke<1&&z.setClearColor(16777215,.5),z.clear(),Ct&&it.render(re);const ot=z.toneMapping;z.toneMapping=Oi;const lt=ee.viewport;if(ee.viewport!==void 0&&(ee.viewport=void 0),P.setupLightsView(ee),xt===!0&&Ze.setGlobalState(z.clippingPlanes,ee),Gr(A,re,ee),le.updateMultisampleRenderTarget(Te),le.updateRenderTargetMipmap(Te),Et.has("WEBGL_multisampled_render_to_texture")===!1){let Ye=!1;for(let yt=0,Ft=X.length;yt<Ft;yt++){const Wt=X[yt],{object:bt,geometry:nn,material:Ue,group:_n}=Wt;if(Ue.side===Ni&&bt.layers.test(ee.layers)){const ht=Ue.side;Ue.side=On,Ue.needsUpdate=!0,_a(bt,re,ee,nn,Ue,_n),Ue.side=ht,Ue.needsUpdate=!0,Ye=!0}}Ye===!0&&(le.updateMultisampleRenderTarget(Te),le.updateRenderTargetMipmap(Te))}z.setRenderTarget(Ee,Ge,$e),z.setClearColor(qe,ke),lt!==void 0&&(ee.viewport=lt),z.toneMapping=ot}function Gr(A,X,re){const ee=X.isScene===!0?X.overrideMaterial:null;for(let j=0,Te=A.length;j<Te;j++){const Oe=A[j],{object:Ee,geometry:Ge,group:$e}=Oe;let ot=Oe.material;ot.allowOverride===!0&&ee!==null&&(ot=ee),Ee.layers.test(re.layers)&&_a(Ee,X,re,Ge,ot,$e)}}function _a(A,X,re,ee,j,Te){A.onBeforeRender(z,X,re,ee,j,Te),A.modelViewMatrix.multiplyMatrices(re.matrixWorldInverse,A.matrixWorld),A.normalMatrix.getNormalMatrix(A.modelViewMatrix),j.onBeforeRender(z,X,re,ee,A,Te),j.transparent===!0&&j.side===Ni&&j.forceSinglePass===!1?(j.side=On,j.needsUpdate=!0,z.renderBufferDirect(re,X,ee,j,A,Te),j.side=Ur,j.needsUpdate=!0,z.renderBufferDirect(re,X,ee,j,A,Te),j.side=Ni):z.renderBufferDirect(re,X,ee,j,A,Te),A.onAfterRender(z,X,re,ee,j,Te)}function Wr(A,X,re){X.isScene!==!0&&(X=Yt);const ee=ne.get(A),j=P.state.lights,Te=P.state.shadowsArray,Oe=j.state.version,Ee=be.getParameters(A,j.state,Te,X,re,P.state.lightProbeGridArray),Ge=be.getProgramCacheKey(Ee);let $e=ee.programs;ee.environment=A.isMeshStandardMaterial||A.isMeshLambertMaterial||A.isMeshPhongMaterial?X.environment:null,ee.fog=X.fog;const ot=A.isMeshStandardMaterial||A.isMeshLambertMaterial&&!A.envMap||A.isMeshPhongMaterial&&!A.envMap;ee.envMap=Se.get(A.envMap||ee.environment,ot),ee.envMapRotation=ee.environment!==null&&A.envMap===null?X.environmentRotation:A.envMapRotation,$e===void 0&&(A.addEventListener("dispose",ti),$e=new Map,ee.programs=$e);let lt=$e.get(Ge);if(lt!==void 0){if(ee.currentProgram===lt&&ee.lightsStateVersion===Oe)return So(A,Ee),lt}else Ee.uniforms=be.getUniforms(A),K!==null&&A.isNodeMaterial&&K.build(A,re,Ee),A.onBeforeCompile(Ee,z),lt=be.acquireProgram(Ee,Ge),$e.set(Ge,lt),ee.uniforms=Ee.uniforms;const Ye=ee.uniforms;return(!A.isShaderMaterial&&!A.isRawShaderMaterial||A.clipping===!0)&&(Ye.clippingPlanes=Ze.uniform),So(A,Ee),ee.needsLights=xa(A),ee.lightsStateVersion=Oe,ee.needsLights&&(Ye.ambientLightColor.value=j.state.ambient,Ye.lightProbe.value=j.state.probe,Ye.directionalLights.value=j.state.directional,Ye.directionalLightShadows.value=j.state.directionalShadow,Ye.spotLights.value=j.state.spot,Ye.spotLightShadows.value=j.state.spotShadow,Ye.rectAreaLights.value=j.state.rectArea,Ye.ltc_1.value=j.state.rectAreaLTC1,Ye.ltc_2.value=j.state.rectAreaLTC2,Ye.pointLights.value=j.state.point,Ye.pointLightShadows.value=j.state.pointShadow,Ye.hemisphereLights.value=j.state.hemi,Ye.directionalShadowMatrix.value=j.state.directionalShadowMatrix,Ye.spotLightMatrix.value=j.state.spotLightMatrix,Ye.spotLightMap.value=j.state.spotLightMap,Ye.pointShadowMatrix.value=j.state.pointShadowMatrix),ee.lightProbeGrid=P.state.lightProbeGridArray.length>0,ee.currentProgram=lt,ee.uniformsList=null,lt}function va(A){if(A.uniformsList===null){const X=A.currentProgram.getUniforms();A.uniformsList=ru.seqWithValue(X.seq,A.uniforms)}return A.uniformsList}function So(A,X){const re=ne.get(A);re.outputColorSpace=X.outputColorSpace,re.batching=X.batching,re.batchingColor=X.batchingColor,re.instancing=X.instancing,re.instancingColor=X.instancingColor,re.instancingMorph=X.instancingMorph,re.skinning=X.skinning,re.morphTargets=X.morphTargets,re.morphNormals=X.morphNormals,re.morphColors=X.morphColors,re.morphTargetsCount=X.morphTargetsCount,re.numClippingPlanes=X.numClippingPlanes,re.numIntersection=X.numClipIntersection,re.vertexAlphas=X.vertexAlphas,re.vertexTangents=X.vertexTangents,re.toneMapping=X.toneMapping}function Su(A,X){if(A.length===0)return null;if(A.length===1)return A[0].texture!==null?A[0]:null;C.setFromMatrixPosition(X.matrixWorld);for(let re=0,ee=A.length;re<ee;re++){const j=A[re];if(j.texture!==null&&j.boundingBox.containsPoint(C))return j}return null}function qt(A,X,re,ee,j){X.isScene!==!0&&(X=Yt),le.resetTextureUnits();const Te=X.fog,Oe=ee.isMeshStandardMaterial||ee.isMeshLambertMaterial||ee.isMeshPhongMaterial?X.environment:null,Ee=Y===null?z.outputColorSpace:Y.isXRRenderTarget===!0?Y.texture.colorSpace:vt.workingColorSpace,Ge=ee.isMeshStandardMaterial||ee.isMeshLambertMaterial&&!ee.envMap||ee.isMeshPhongMaterial&&!ee.envMap,$e=Se.get(ee.envMap||Oe,Ge),ot=ee.vertexColors===!0&&!!re.attributes.color&&re.attributes.color.itemSize===4,lt=!!re.attributes.tangent&&(!!ee.normalMap||ee.anisotropy>0),Ye=!!re.morphAttributes.position,yt=!!re.morphAttributes.normal,Ft=!!re.morphAttributes.color;let Wt=Oi;ee.toneMapped&&(Y===null||Y.isXRRenderTarget===!0)&&(Wt=z.toneMapping);const bt=re.morphAttributes.position||re.morphAttributes.normal||re.morphAttributes.color,nn=bt!==void 0?bt.length:0,Ue=ne.get(ee),_n=P.state.lights;if(xt===!0&&(_t===!0||A!==oe)){const Pt=A===oe&&ee.id===ae;Ze.setState(ee,A,Pt)}let ht=!1;ee.version===Ue.__version?(Ue.needsLights&&Ue.lightsStateVersion!==_n.state.version||Ue.outputColorSpace!==Ee||j.isBatchedMesh&&Ue.batching===!1||!j.isBatchedMesh&&Ue.batching===!0||j.isBatchedMesh&&Ue.batchingColor===!0&&j.colorTexture===null||j.isBatchedMesh&&Ue.batchingColor===!1&&j.colorTexture!==null||j.isInstancedMesh&&Ue.instancing===!1||!j.isInstancedMesh&&Ue.instancing===!0||j.isSkinnedMesh&&Ue.skinning===!1||!j.isSkinnedMesh&&Ue.skinning===!0||j.isInstancedMesh&&Ue.instancingColor===!0&&j.instanceColor===null||j.isInstancedMesh&&Ue.instancingColor===!1&&j.instanceColor!==null||j.isInstancedMesh&&Ue.instancingMorph===!0&&j.morphTexture===null||j.isInstancedMesh&&Ue.instancingMorph===!1&&j.morphTexture!==null||Ue.envMap!==$e||ee.fog===!0&&Ue.fog!==Te||Ue.numClippingPlanes!==void 0&&(Ue.numClippingPlanes!==Ze.numPlanes||Ue.numIntersection!==Ze.numIntersection)||Ue.vertexAlphas!==ot||Ue.vertexTangents!==lt||Ue.morphTargets!==Ye||Ue.morphNormals!==yt||Ue.morphColors!==Ft||Ue.toneMapping!==Wt||Ue.morphTargetsCount!==nn||!!Ue.lightProbeGrid!=P.state.lightProbeGridArray.length>0)&&(ht=!0):(ht=!0,Ue.__version=ee.version);let Bn=Ue.currentProgram;ht===!0&&(Bn=Wr(ee,X,j),K&&ee.isNodeMaterial&&K.onUpdateProgram(ee,Bn,Ue));let kn=!1,pt=!1,Vi=!1;const Rt=Bn.getUniforms(),Bt=Ue.uniforms;if(S.useProgram(Bn.program)&&(kn=!0,pt=!0,Vi=!0),ee.id!==ae&&(ae=ee.id,pt=!0),Ue.needsLights){const Pt=Su(P.state.lightProbeGridArray,j);Ue.lightProbeGrid!==Pt&&(Ue.lightProbeGrid=Pt,pt=!0)}if(kn||oe!==A){S.buffers.depth.getReversed()&&A.reversedDepth!==!0&&(A._reversedDepth=!0,A.updateProjectionMatrix()),Rt.setValue(W,"projectionMatrix",A.projectionMatrix),Rt.setValue(W,"viewMatrix",A.matrixWorldInverse);const hi=Rt.map.cameraPosition;hi!==void 0&&hi.setValue(W,Qt.setFromMatrixPosition(A.matrixWorld)),L.logarithmicDepthBuffer&&Rt.setValue(W,"logDepthBufFC",2/(Math.log(A.far+1)/Math.LN2)),(ee.isMeshPhongMaterial||ee.isMeshToonMaterial||ee.isMeshLambertMaterial||ee.isMeshBasicMaterial||ee.isMeshStandardMaterial||ee.isShaderMaterial)&&Rt.setValue(W,"isOrthographic",A.isOrthographicCamera===!0),oe!==A&&(oe=A,pt=!0,Vi=!0)}if(Ue.needsLights&&(_n.state.directionalShadowMap.length>0&&Rt.setValue(W,"directionalShadowMap",_n.state.directionalShadowMap,le),_n.state.spotShadowMap.length>0&&Rt.setValue(W,"spotShadowMap",_n.state.spotShadowMap,le),_n.state.pointShadowMap.length>0&&Rt.setValue(W,"pointShadowMap",_n.state.pointShadowMap,le)),j.isSkinnedMesh){Rt.setOptional(W,j,"bindMatrix"),Rt.setOptional(W,j,"bindMatrixInverse");const Pt=j.skeleton;Pt&&(Pt.boneTexture===null&&Pt.computeBoneTexture(),Rt.setValue(W,"boneTexture",Pt.boneTexture,le))}j.isBatchedMesh&&(Rt.setOptional(W,j,"batchingTexture"),Rt.setValue(W,"batchingTexture",j._matricesTexture,le),Rt.setOptional(W,j,"batchingIdTexture"),Rt.setValue(W,"batchingIdTexture",j._indirectTexture,le),Rt.setOptional(W,j,"batchingColorTexture"),j._colorsTexture!==null&&Rt.setValue(W,"batchingColorTexture",j._colorsTexture,le));const di=re.morphAttributes;if((di.position!==void 0||di.normal!==void 0||di.color!==void 0)&&V.update(j,re,Bn),(pt||Ue.receiveShadow!==j.receiveShadow)&&(Ue.receiveShadow=j.receiveShadow,Rt.setValue(W,"receiveShadow",j.receiveShadow)),(ee.isMeshStandardMaterial||ee.isMeshLambertMaterial||ee.isMeshPhongMaterial)&&ee.envMap===null&&X.environment!==null&&(Bt.envMapIntensity.value=X.environmentIntensity),Bt.dfgLUT!==void 0&&(Bt.dfgLUT.value=VT()),pt){if(Rt.setValue(W,"toneMappingExposure",z.toneMappingExposure),Ue.needsLights&&Mu(Bt,Vi),Te&&ee.fog===!0&&Xe.refreshFogUniforms(Bt,Te),Xe.refreshMaterialUniforms(Bt,ee,he,_e,P.state.transmissionRenderTarget[A.id]),Ue.needsLights&&Ue.lightProbeGrid){const Pt=Ue.lightProbeGrid;Bt.probesSH.value=Pt.texture,Bt.probesMin.value.copy(Pt.boundingBox.min),Bt.probesMax.value.copy(Pt.boundingBox.max),Bt.probesResolution.value.copy(Pt.resolution)}ru.upload(W,va(Ue),Bt,le)}if(ee.isShaderMaterial&&ee.uniformsNeedUpdate===!0&&(ru.upload(W,va(Ue),Bt,le),ee.uniformsNeedUpdate=!1),ee.isSpriteMaterial&&Rt.setValue(W,"center",j.center),Rt.setValue(W,"modelViewMatrix",j.modelViewMatrix),Rt.setValue(W,"normalMatrix",j.normalMatrix),Rt.setValue(W,"modelMatrix",j.matrixWorld),ee.uniformsGroups!==void 0){const Pt=ee.uniformsGroups;for(let hi=0,wi=Pt.length;hi<wi;hi++){const Xr=Pt[hi];ge.update(Xr,Bn),ge.bind(Xr,Bn)}}return Bn}function Mu(A,X){A.ambientLightColor.needsUpdate=X,A.lightProbe.needsUpdate=X,A.directionalLights.needsUpdate=X,A.directionalLightShadows.needsUpdate=X,A.pointLights.needsUpdate=X,A.pointLightShadows.needsUpdate=X,A.spotLights.needsUpdate=X,A.spotLightShadows.needsUpdate=X,A.rectAreaLights.needsUpdate=X,A.hemisphereLights.needsUpdate=X}function xa(A){return A.isMeshLambertMaterial||A.isMeshToonMaterial||A.isMeshPhongMaterial||A.isMeshStandardMaterial||A.isShadowMaterial||A.isShaderMaterial&&A.lights===!0}this.getActiveCubeFace=function(){return ue},this.getActiveMipmapLevel=function(){return $},this.getRenderTarget=function(){return Y},this.setRenderTargetTextures=function(A,X,re){const ee=ne.get(A);ee.__autoAllocateDepthBuffer=A.resolveDepthBuffer===!1,ee.__autoAllocateDepthBuffer===!1&&(ee.__useRenderToTexture=!1),ne.get(A.texture).__webglTexture=X,ne.get(A.depthTexture).__webglTexture=ee.__autoAllocateDepthBuffer?void 0:re,ee.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(A,X){const re=ne.get(A);re.__webglFramebuffer=X,re.__useDefaultFramebuffer=X===void 0},this.setRenderTarget=function(A,X=0,re=0){Y=A,ue=X,$=re;let ee=null,j=!1,Te=!1;if(A){const Ee=ne.get(A);if(Ee.__useDefaultFramebuffer!==void 0){S.bindFramebuffer(W.FRAMEBUFFER,Ee.__webglFramebuffer),F.copy(A.viewport),Z.copy(A.scissor),Ne=A.scissorTest,S.viewport(F),S.scissor(Z),S.setScissorTest(Ne),ae=-1;return}else if(Ee.__webglFramebuffer===void 0)le.setupRenderTarget(A);else if(Ee.__hasExternalTextures)le.rebindTextures(A,ne.get(A.texture).__webglTexture,ne.get(A.depthTexture).__webglTexture);else if(A.depthBuffer){const ot=A.depthTexture;if(Ee.__boundDepthTexture!==ot){if(ot!==null&&ne.has(ot)&&(A.width!==ot.image.width||A.height!==ot.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");le.setupDepthRenderbuffer(A)}}const Ge=A.texture;(Ge.isData3DTexture||Ge.isDataArrayTexture||Ge.isCompressedArrayTexture)&&(Te=!0);const $e=ne.get(A).__webglFramebuffer;A.isWebGLCubeRenderTarget?(Array.isArray($e[X])?ee=$e[X][re]:ee=$e[X],j=!0):A.samples>0&&le.useMultisampledRTT(A)===!1?ee=ne.get(A).__webglMultisampledFramebuffer:Array.isArray($e)?ee=$e[re]:ee=$e,F.copy(A.viewport),Z.copy(A.scissor),Ne=A.scissorTest}else F.copy(je).multiplyScalar(he).floor(),Z.copy(Vt).multiplyScalar(he).floor(),Ne=ct;if(re!==0&&(ee=ce),S.bindFramebuffer(W.FRAMEBUFFER,ee)&&S.drawBuffers(A,ee),S.viewport(F),S.scissor(Z),S.setScissorTest(Ne),j){const Ee=ne.get(A.texture);W.framebufferTexture2D(W.FRAMEBUFFER,W.COLOR_ATTACHMENT0,W.TEXTURE_CUBE_MAP_POSITIVE_X+X,Ee.__webglTexture,re)}else if(Te){const Ee=X;for(let Ge=0;Ge<A.textures.length;Ge++){const $e=ne.get(A.textures[Ge]);W.framebufferTextureLayer(W.FRAMEBUFFER,W.COLOR_ATTACHMENT0+Ge,$e.__webglTexture,re,Ee)}}else if(A!==null&&re!==0){const Ee=ne.get(A.texture);W.framebufferTexture2D(W.FRAMEBUFFER,W.COLOR_ATTACHMENT0,W.TEXTURE_2D,Ee.__webglTexture,re)}ae=-1},this.readRenderTargetPixels=function(A,X,re,ee,j,Te,Oe,Ee=0){if(!(A&&A.isWebGLRenderTarget)){St("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Ge=ne.get(A).__webglFramebuffer;if(A.isWebGLCubeRenderTarget&&Oe!==void 0&&(Ge=Ge[Oe]),Ge){S.bindFramebuffer(W.FRAMEBUFFER,Ge);try{const $e=A.textures[Ee],ot=$e.format,lt=$e.type;if(A.textures.length>1&&W.readBuffer(W.COLOR_ATTACHMENT0+Ee),!L.textureFormatReadable(ot)){St("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!L.textureTypeReadable(lt)){St("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}X>=0&&X<=A.width-ee&&re>=0&&re<=A.height-j&&W.readPixels(X,re,ee,j,Ce.convert(ot),Ce.convert(lt),Te)}finally{const $e=Y!==null?ne.get(Y).__webglFramebuffer:null;S.bindFramebuffer(W.FRAMEBUFFER,$e)}}},this.readRenderTargetPixelsAsync=async function(A,X,re,ee,j,Te,Oe,Ee=0){if(!(A&&A.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Ge=ne.get(A).__webglFramebuffer;if(A.isWebGLCubeRenderTarget&&Oe!==void 0&&(Ge=Ge[Oe]),Ge)if(X>=0&&X<=A.width-ee&&re>=0&&re<=A.height-j){S.bindFramebuffer(W.FRAMEBUFFER,Ge);const $e=A.textures[Ee],ot=$e.format,lt=$e.type;if(A.textures.length>1&&W.readBuffer(W.COLOR_ATTACHMENT0+Ee),!L.textureFormatReadable(ot))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!L.textureTypeReadable(lt))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");const Ye=W.createBuffer();W.bindBuffer(W.PIXEL_PACK_BUFFER,Ye),W.bufferData(W.PIXEL_PACK_BUFFER,Te.byteLength,W.STREAM_READ),W.readPixels(X,re,ee,j,Ce.convert(ot),Ce.convert(lt),0);const yt=Y!==null?ne.get(Y).__webglFramebuffer:null;S.bindFramebuffer(W.FRAMEBUFFER,yt);const Ft=W.fenceSync(W.SYNC_GPU_COMMANDS_COMPLETE,0);return W.flush(),await $v(W,Ft,4),W.bindBuffer(W.PIXEL_PACK_BUFFER,Ye),W.getBufferSubData(W.PIXEL_PACK_BUFFER,0,Te),W.deleteBuffer(Ye),W.deleteSync(Ft),Te}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(A,X=null,re=0){const ee=Math.pow(2,-re),j=Math.floor(A.image.width*ee),Te=Math.floor(A.image.height*ee),Oe=X!==null?X.x:0,Ee=X!==null?X.y:0;le.setTexture2D(A,0),W.copyTexSubImage2D(W.TEXTURE_2D,re,0,0,Oe,Ee,j,Te),S.unbindTexture()},this.copyTextureToTexture=function(A,X,re=null,ee=null,j=0,Te=0){let Oe,Ee,Ge,$e,ot,lt,Ye,yt,Ft;const Wt=A.isCompressedTexture?A.mipmaps[Te]:A.image;if(re!==null)Oe=re.max.x-re.min.x,Ee=re.max.y-re.min.y,Ge=re.isBox3?re.max.z-re.min.z:1,$e=re.min.x,ot=re.min.y,lt=re.isBox3?re.min.z:0;else{const Bt=Math.pow(2,-j);Oe=Math.floor(Wt.width*Bt),Ee=Math.floor(Wt.height*Bt),A.isDataArrayTexture?Ge=Wt.depth:A.isData3DTexture?Ge=Math.floor(Wt.depth*Bt):Ge=1,$e=0,ot=0,lt=0}ee!==null?(Ye=ee.x,yt=ee.y,Ft=ee.z):(Ye=0,yt=0,Ft=0);const bt=Ce.convert(X.format),nn=Ce.convert(X.type);let Ue;X.isData3DTexture?(le.setTexture3D(X,0),Ue=W.TEXTURE_3D):X.isDataArrayTexture||X.isCompressedArrayTexture?(le.setTexture2DArray(X,0),Ue=W.TEXTURE_2D_ARRAY):(le.setTexture2D(X,0),Ue=W.TEXTURE_2D),S.activeTexture(W.TEXTURE0),S.pixelStorei(W.UNPACK_FLIP_Y_WEBGL,X.flipY),S.pixelStorei(W.UNPACK_PREMULTIPLY_ALPHA_WEBGL,X.premultiplyAlpha),S.pixelStorei(W.UNPACK_ALIGNMENT,X.unpackAlignment);const _n=S.getParameter(W.UNPACK_ROW_LENGTH),ht=S.getParameter(W.UNPACK_IMAGE_HEIGHT),Bn=S.getParameter(W.UNPACK_SKIP_PIXELS),kn=S.getParameter(W.UNPACK_SKIP_ROWS),pt=S.getParameter(W.UNPACK_SKIP_IMAGES);S.pixelStorei(W.UNPACK_ROW_LENGTH,Wt.width),S.pixelStorei(W.UNPACK_IMAGE_HEIGHT,Wt.height),S.pixelStorei(W.UNPACK_SKIP_PIXELS,$e),S.pixelStorei(W.UNPACK_SKIP_ROWS,ot),S.pixelStorei(W.UNPACK_SKIP_IMAGES,lt);const Vi=A.isDataArrayTexture||A.isData3DTexture,Rt=X.isDataArrayTexture||X.isData3DTexture;if(A.isDepthTexture){const Bt=ne.get(A),di=ne.get(X),Pt=ne.get(Bt.__renderTarget),hi=ne.get(di.__renderTarget);S.bindFramebuffer(W.READ_FRAMEBUFFER,Pt.__webglFramebuffer),S.bindFramebuffer(W.DRAW_FRAMEBUFFER,hi.__webglFramebuffer);for(let wi=0;wi<Ge;wi++)Vi&&(W.framebufferTextureLayer(W.READ_FRAMEBUFFER,W.COLOR_ATTACHMENT0,ne.get(A).__webglTexture,j,lt+wi),W.framebufferTextureLayer(W.DRAW_FRAMEBUFFER,W.COLOR_ATTACHMENT0,ne.get(X).__webglTexture,Te,Ft+wi)),W.blitFramebuffer($e,ot,Oe,Ee,Ye,yt,Oe,Ee,W.DEPTH_BUFFER_BIT,W.NEAREST);S.bindFramebuffer(W.READ_FRAMEBUFFER,null),S.bindFramebuffer(W.DRAW_FRAMEBUFFER,null)}else if(j!==0||A.isRenderTargetTexture||ne.has(A)){const Bt=ne.get(A),di=ne.get(X);S.bindFramebuffer(W.READ_FRAMEBUFFER,me),S.bindFramebuffer(W.DRAW_FRAMEBUFFER,Q);for(let Pt=0;Pt<Ge;Pt++)Vi?W.framebufferTextureLayer(W.READ_FRAMEBUFFER,W.COLOR_ATTACHMENT0,Bt.__webglTexture,j,lt+Pt):W.framebufferTexture2D(W.READ_FRAMEBUFFER,W.COLOR_ATTACHMENT0,W.TEXTURE_2D,Bt.__webglTexture,j),Rt?W.framebufferTextureLayer(W.DRAW_FRAMEBUFFER,W.COLOR_ATTACHMENT0,di.__webglTexture,Te,Ft+Pt):W.framebufferTexture2D(W.DRAW_FRAMEBUFFER,W.COLOR_ATTACHMENT0,W.TEXTURE_2D,di.__webglTexture,Te),j!==0?W.blitFramebuffer($e,ot,Oe,Ee,Ye,yt,Oe,Ee,W.COLOR_BUFFER_BIT,W.NEAREST):Rt?W.copyTexSubImage3D(Ue,Te,Ye,yt,Ft+Pt,$e,ot,Oe,Ee):W.copyTexSubImage2D(Ue,Te,Ye,yt,$e,ot,Oe,Ee);S.bindFramebuffer(W.READ_FRAMEBUFFER,null),S.bindFramebuffer(W.DRAW_FRAMEBUFFER,null)}else Rt?A.isDataTexture||A.isData3DTexture?W.texSubImage3D(Ue,Te,Ye,yt,Ft,Oe,Ee,Ge,bt,nn,Wt.data):X.isCompressedArrayTexture?W.compressedTexSubImage3D(Ue,Te,Ye,yt,Ft,Oe,Ee,Ge,bt,Wt.data):W.texSubImage3D(Ue,Te,Ye,yt,Ft,Oe,Ee,Ge,bt,nn,Wt):A.isDataTexture?W.texSubImage2D(W.TEXTURE_2D,Te,Ye,yt,Oe,Ee,bt,nn,Wt.data):A.isCompressedTexture?W.compressedTexSubImage2D(W.TEXTURE_2D,Te,Ye,yt,Wt.width,Wt.height,bt,Wt.data):W.texSubImage2D(W.TEXTURE_2D,Te,Ye,yt,Oe,Ee,bt,nn,Wt);S.pixelStorei(W.UNPACK_ROW_LENGTH,_n),S.pixelStorei(W.UNPACK_IMAGE_HEIGHT,ht),S.pixelStorei(W.UNPACK_SKIP_PIXELS,Bn),S.pixelStorei(W.UNPACK_SKIP_ROWS,kn),S.pixelStorei(W.UNPACK_SKIP_IMAGES,pt),Te===0&&X.generateMipmaps&&W.generateMipmap(Ue),S.unbindTexture()},this.initRenderTarget=function(A){ne.get(A).__webglFramebuffer===void 0&&le.setupRenderTarget(A)},this.initTexture=function(A){A.isCubeTexture?le.setTextureCube(A,0):A.isData3DTexture?le.setTexture3D(A,0):A.isDataArrayTexture||A.isCompressedArrayTexture?le.setTexture2DArray(A,0):le.setTexture2D(A,0),S.unbindTexture()},this.resetState=function(){ue=0,$=0,Y=null,S.reset(),Le.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Fi}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;const t=this.getContext();t.drawingBufferColorSpace=vt._getDrawingBufferColorSpace(e),t.unpackColorSpace=vt._getUnpackColorSpace()}}const Ng={type:"change"},Qd={type:"start"},R_={type:"end"},Ql=new gu,Ig=new Lr,GT=Math.cos(70*Jv.DEG2RAD),un=new H,Yn=2*Math.PI,It={NONE:-1,ROTATE:0,DOLLY:1,PAN:2,TOUCH_ROTATE:3,TOUCH_PAN:4,TOUCH_DOLLY_PAN:5,TOUCH_DOLLY_ROTATE:6},Bf=1e-6;class WT extends Yx{constructor(e,t=null){super(e,t),this.state=It.NONE,this.target=new H,this.cursor=new H,this.minDistance=0,this.maxDistance=1/0,this.minZoom=0,this.maxZoom=1/0,this.minTargetRadius=0,this.maxTargetRadius=1/0,this.minPolarAngle=0,this.maxPolarAngle=Math.PI,this.minAzimuthAngle=-1/0,this.maxAzimuthAngle=1/0,this.enableDamping=!1,this.dampingFactor=.05,this.enableZoom=!0,this.zoomSpeed=1,this.enableRotate=!0,this.rotateSpeed=1,this.keyRotateSpeed=1,this.enablePan=!0,this.panSpeed=1,this.screenSpacePanning=!0,this.keyPanSpeed=7,this.zoomToCursor=!1,this.autoRotate=!1,this.autoRotateSpeed=2,this.keys={LEFT:"ArrowLeft",UP:"ArrowUp",RIGHT:"ArrowRight",BOTTOM:"ArrowDown"},this.mouseButtons={LEFT:aa.ROTATE,MIDDLE:aa.DOLLY,RIGHT:aa.PAN},this.touches={ONE:ra.ROTATE,TWO:ra.DOLLY_PAN},this.target0=this.target.clone(),this.position0=this.object.position.clone(),this.zoom0=this.object.zoom,this._cursorStyle="auto",this._domElementKeyEvents=null,this._lastPosition=new H,this._lastQuaternion=new Fr,this._lastTargetPosition=new H,this._quat=new Fr().setFromUnitVectors(e.up,new H(0,1,0)),this._quatInverse=this._quat.clone().invert(),this._spherical=new og,this._sphericalDelta=new og,this._scale=1,this._panOffset=new H,this._rotateStart=new Qe,this._rotateEnd=new Qe,this._rotateDelta=new Qe,this._panStart=new Qe,this._panEnd=new Qe,this._panDelta=new Qe,this._dollyStart=new Qe,this._dollyEnd=new Qe,this._dollyDelta=new Qe,this._dollyDirection=new H,this._mouse=new Qe,this._performCursorZoom=!1,this._pointers=[],this._pointerPositions={},this._controlActive=!1,this._onPointerMove=YT.bind(this),this._onPointerDown=XT.bind(this),this._onPointerUp=qT.bind(this),this._onContextMenu=e1.bind(this),this._onMouseWheel=ZT.bind(this),this._onKeyDown=QT.bind(this),this._onTouchStart=JT.bind(this),this._onTouchMove=jT.bind(this),this._onMouseDown=KT.bind(this),this._onMouseMove=$T.bind(this),this._interceptControlDown=t1.bind(this),this._interceptControlUp=n1.bind(this),this.domElement!==null&&this.connect(this.domElement),this.update()}set cursorStyle(e){this._cursorStyle=e,e==="grab"?this.domElement.style.cursor="grab":this.domElement.style.cursor="auto"}get cursorStyle(){return this._cursorStyle}connect(e){super.connect(e),this.domElement.addEventListener("pointerdown",this._onPointerDown),this.domElement.addEventListener("pointercancel",this._onPointerUp),this.domElement.addEventListener("contextmenu",this._onContextMenu),this.domElement.addEventListener("wheel",this._onMouseWheel,{passive:!1}),this.domElement.getRootNode().addEventListener("keydown",this._interceptControlDown,{passive:!0,capture:!0}),this.domElement.style.touchAction="none"}disconnect(){this.domElement.removeEventListener("pointerdown",this._onPointerDown),this.domElement.ownerDocument.removeEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.removeEventListener("pointerup",this._onPointerUp),this.domElement.removeEventListener("pointercancel",this._onPointerUp),this.domElement.removeEventListener("wheel",this._onMouseWheel),this.domElement.removeEventListener("contextmenu",this._onContextMenu),this.stopListenToKeyEvents(),this.domElement.getRootNode().removeEventListener("keydown",this._interceptControlDown,{capture:!0}),this.domElement.style.touchAction=""}dispose(){this.disconnect()}getPolarAngle(){return this._spherical.phi}getAzimuthalAngle(){return this._spherical.theta}getDistance(){return this.object.position.distanceTo(this.target)}listenToKeyEvents(e){e.addEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=e}stopListenToKeyEvents(){this._domElementKeyEvents!==null&&(this._domElementKeyEvents.removeEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=null)}saveState(){this.target0.copy(this.target),this.position0.copy(this.object.position),this.zoom0=this.object.zoom}reset(){this.target.copy(this.target0),this.object.position.copy(this.position0),this.object.zoom=this.zoom0,this.object.updateProjectionMatrix(),this.dispatchEvent(Ng),this.update(),this.state=It.NONE}pan(e,t){this._pan(e,t),this.update()}dollyIn(e){this._dollyIn(e),this.update()}dollyOut(e){this._dollyOut(e),this.update()}rotateLeft(e){this._rotateLeft(e),this.update()}rotateUp(e){this._rotateUp(e),this.update()}update(e=null){const t=this.object.position;un.copy(t).sub(this.target),un.applyQuaternion(this._quat),this._spherical.setFromVector3(un),this.autoRotate&&this.state===It.NONE&&this._rotateLeft(this._getAutoRotationAngle(e)),this.enableDamping?(this._spherical.theta+=this._sphericalDelta.theta*this.dampingFactor,this._spherical.phi+=this._sphericalDelta.phi*this.dampingFactor):(this._spherical.theta+=this._sphericalDelta.theta,this._spherical.phi+=this._sphericalDelta.phi);let r=this.minAzimuthAngle,o=this.maxAzimuthAngle;isFinite(r)&&isFinite(o)&&(r<-Math.PI?r+=Yn:r>Math.PI&&(r-=Yn),o<-Math.PI?o+=Yn:o>Math.PI&&(o-=Yn),r<=o?this._spherical.theta=Math.max(r,Math.min(o,this._spherical.theta)):this._spherical.theta=this._spherical.theta>(r+o)/2?Math.max(r,this._spherical.theta):Math.min(o,this._spherical.theta)),this._spherical.phi=Math.max(this.minPolarAngle,Math.min(this.maxPolarAngle,this._spherical.phi)),this._spherical.makeSafe(),this.enableDamping===!0?this.target.addScaledVector(this._panOffset,this.dampingFactor):this.target.add(this._panOffset),this.target.sub(this.cursor),this.target.clampLength(this.minTargetRadius,this.maxTargetRadius),this.target.add(this.cursor);let l=!1;if(this.zoomToCursor&&this._performCursorZoom||this.object.isOrthographicCamera)this._spherical.radius=this._clampDistance(this._spherical.radius);else{const c=this._spherical.radius;this._spherical.radius=this._clampDistance(this._spherical.radius*this._scale),l=c!=this._spherical.radius}if(un.setFromSpherical(this._spherical),un.applyQuaternion(this._quatInverse),t.copy(this.target).add(un),this.object.lookAt(this.target),this.enableDamping===!0?(this._sphericalDelta.theta*=1-this.dampingFactor,this._sphericalDelta.phi*=1-this.dampingFactor,this._panOffset.multiplyScalar(1-this.dampingFactor)):(this._sphericalDelta.set(0,0,0),this._panOffset.set(0,0,0)),this.zoomToCursor&&this._performCursorZoom){let c=null;if(this.object.isPerspectiveCamera){const d=un.length();c=this._clampDistance(d*this._scale);const p=d-c;this.object.position.addScaledVector(this._dollyDirection,p),this.object.updateMatrixWorld(),l=!!p}else if(this.object.isOrthographicCamera){const d=new H(this._mouse.x,this._mouse.y,0);d.unproject(this.object);const p=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),this.object.updateProjectionMatrix(),l=p!==this.object.zoom;const m=new H(this._mouse.x,this._mouse.y,0);m.unproject(this.object),this.object.position.sub(m).add(d),this.object.updateMatrixWorld(),c=un.length()}else console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."),this.zoomToCursor=!1;c!==null&&(this.screenSpacePanning?this.target.set(0,0,-1).transformDirection(this.object.matrix).multiplyScalar(c).add(this.object.position):(Ql.origin.copy(this.object.position),Ql.direction.set(0,0,-1).transformDirection(this.object.matrix),Math.abs(this.object.up.dot(Ql.direction))<GT?this.object.lookAt(this.target):(Ig.setFromNormalAndCoplanarPoint(this.object.up,this.target),Ql.intersectPlane(Ig,this.target))))}else if(this.object.isOrthographicCamera){const c=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),c!==this.object.zoom&&(this.object.updateProjectionMatrix(),l=!0)}return this._scale=1,this._performCursorZoom=!1,l||this._lastPosition.distanceToSquared(this.object.position)>Bf||8*(1-this._lastQuaternion.dot(this.object.quaternion))>Bf||this._lastTargetPosition.distanceToSquared(this.target)>Bf?(this.dispatchEvent(Ng),this._lastPosition.copy(this.object.position),this._lastQuaternion.copy(this.object.quaternion),this._lastTargetPosition.copy(this.target),!0):!1}_getAutoRotationAngle(e){return e!==null?Yn/60*this.autoRotateSpeed*e:Yn/60/60*this.autoRotateSpeed}_getZoomScale(e){const t=Math.abs(e*.01);return Math.pow(.95,this.zoomSpeed*t)}_rotateLeft(e){this._sphericalDelta.theta-=e}_rotateUp(e){this._sphericalDelta.phi-=e}_panLeft(e,t){un.setFromMatrixColumn(t,0),un.multiplyScalar(-e),this._panOffset.add(un)}_panUp(e,t){this.screenSpacePanning===!0?un.setFromMatrixColumn(t,1):(un.setFromMatrixColumn(t,0),un.crossVectors(this.object.up,un)),un.multiplyScalar(e),this._panOffset.add(un)}_pan(e,t){const r=this.domElement;if(this.object.isPerspectiveCamera){const o=this.object.position;un.copy(o).sub(this.target);let l=un.length();l*=Math.tan(this.object.fov/2*Math.PI/180),this._panLeft(2*e*l/r.clientHeight,this.object.matrix),this._panUp(2*t*l/r.clientHeight,this.object.matrix)}else this.object.isOrthographicCamera?(this._panLeft(e*(this.object.right-this.object.left)/this.object.zoom/r.clientWidth,this.object.matrix),this._panUp(t*(this.object.top-this.object.bottom)/this.object.zoom/r.clientHeight,this.object.matrix)):(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."),this.enablePan=!1)}_dollyOut(e){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale/=e:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_dollyIn(e){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale*=e:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_updateZoomParameters(e,t){if(!this.zoomToCursor)return;this._performCursorZoom=!0;const r=this.domElement.getBoundingClientRect(),o=e-r.left,l=t-r.top,c=r.width,d=r.height;this._mouse.x=o/c*2-1,this._mouse.y=-(l/d)*2+1,this._dollyDirection.set(this._mouse.x,this._mouse.y,1).unproject(this.object).sub(this.object.position).normalize()}_clampDistance(e){return Math.max(this.minDistance,Math.min(this.maxDistance,e))}_handleMouseDownRotate(e){this._rotateStart.set(e.clientX,e.clientY)}_handleMouseDownDolly(e){this._updateZoomParameters(e.clientX,e.clientX),this._dollyStart.set(e.clientX,e.clientY)}_handleMouseDownPan(e){this._panStart.set(e.clientX,e.clientY)}_handleMouseMoveRotate(e){this._rotateEnd.set(e.clientX,e.clientY),this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);const t=this.domElement;this._rotateLeft(Yn*this._rotateDelta.x/t.clientHeight),this._rotateUp(Yn*this._rotateDelta.y/t.clientHeight),this._rotateStart.copy(this._rotateEnd),this.update()}_handleMouseMoveDolly(e){this._dollyEnd.set(e.clientX,e.clientY),this._dollyDelta.subVectors(this._dollyEnd,this._dollyStart),this._dollyDelta.y>0?this._dollyOut(this._getZoomScale(this._dollyDelta.y)):this._dollyDelta.y<0&&this._dollyIn(this._getZoomScale(this._dollyDelta.y)),this._dollyStart.copy(this._dollyEnd),this.update()}_handleMouseMovePan(e){this._panEnd.set(e.clientX,e.clientY),this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd),this.update()}_handleMouseWheel(e){this._updateZoomParameters(e.clientX,e.clientY),e.deltaY<0?this._dollyIn(this._getZoomScale(e.deltaY)):e.deltaY>0&&this._dollyOut(this._getZoomScale(e.deltaY)),this.update()}_handleKeyDown(e){let t=!1;switch(e.code){case this.keys.UP:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateUp(Yn*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,this.keyPanSpeed),t=!0;break;case this.keys.BOTTOM:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateUp(-Yn*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,-this.keyPanSpeed),t=!0;break;case this.keys.LEFT:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateLeft(Yn*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(this.keyPanSpeed,0),t=!0;break;case this.keys.RIGHT:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateLeft(-Yn*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(-this.keyPanSpeed,0),t=!0;break}t&&(e.preventDefault(),this.update())}_handleTouchStartRotate(e){if(this._pointers.length===1)this._rotateStart.set(e.pageX,e.pageY);else{const t=this._getSecondPointerPosition(e),r=.5*(e.pageX+t.x),o=.5*(e.pageY+t.y);this._rotateStart.set(r,o)}}_handleTouchStartPan(e){if(this._pointers.length===1)this._panStart.set(e.pageX,e.pageY);else{const t=this._getSecondPointerPosition(e),r=.5*(e.pageX+t.x),o=.5*(e.pageY+t.y);this._panStart.set(r,o)}}_handleTouchStartDolly(e){const t=this._getSecondPointerPosition(e),r=e.pageX-t.x,o=e.pageY-t.y,l=Math.sqrt(r*r+o*o);this._dollyStart.set(0,l)}_handleTouchStartDollyPan(e){this.enableZoom&&this._handleTouchStartDolly(e),this.enablePan&&this._handleTouchStartPan(e)}_handleTouchStartDollyRotate(e){this.enableZoom&&this._handleTouchStartDolly(e),this.enableRotate&&this._handleTouchStartRotate(e)}_handleTouchMoveRotate(e){if(this._pointers.length==1)this._rotateEnd.set(e.pageX,e.pageY);else{const r=this._getSecondPointerPosition(e),o=.5*(e.pageX+r.x),l=.5*(e.pageY+r.y);this._rotateEnd.set(o,l)}this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);const t=this.domElement;this._rotateLeft(Yn*this._rotateDelta.x/t.clientHeight),this._rotateUp(Yn*this._rotateDelta.y/t.clientHeight),this._rotateStart.copy(this._rotateEnd)}_handleTouchMovePan(e){if(this._pointers.length===1)this._panEnd.set(e.pageX,e.pageY);else{const t=this._getSecondPointerPosition(e),r=.5*(e.pageX+t.x),o=.5*(e.pageY+t.y);this._panEnd.set(r,o)}this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd)}_handleTouchMoveDolly(e){const t=this._getSecondPointerPosition(e),r=e.pageX-t.x,o=e.pageY-t.y,l=Math.sqrt(r*r+o*o);this._dollyEnd.set(0,l),this._dollyDelta.set(0,Math.pow(this._dollyEnd.y/this._dollyStart.y,this.zoomSpeed)),this._dollyOut(this._dollyDelta.y),this._dollyStart.copy(this._dollyEnd);const c=(e.pageX+t.x)*.5,d=(e.pageY+t.y)*.5;this._updateZoomParameters(c,d)}_handleTouchMoveDollyPan(e){this.enableZoom&&this._handleTouchMoveDolly(e),this.enablePan&&this._handleTouchMovePan(e)}_handleTouchMoveDollyRotate(e){this.enableZoom&&this._handleTouchMoveDolly(e),this.enableRotate&&this._handleTouchMoveRotate(e)}_addPointer(e){this._pointers.push(e.pointerId)}_removePointer(e){delete this._pointerPositions[e.pointerId];for(let t=0;t<this._pointers.length;t++)if(this._pointers[t]==e.pointerId){this._pointers.splice(t,1);return}}_isTrackingPointer(e){for(let t=0;t<this._pointers.length;t++)if(this._pointers[t]==e.pointerId)return!0;return!1}_trackPointer(e){let t=this._pointerPositions[e.pointerId];t===void 0&&(t=new Qe,this._pointerPositions[e.pointerId]=t),t.set(e.pageX,e.pageY)}_getSecondPointerPosition(e){const t=e.pointerId===this._pointers[0]?this._pointers[1]:this._pointers[0];return this._pointerPositions[t]}_customWheelEvent(e){const t=e.deltaMode,r={clientX:e.clientX,clientY:e.clientY,deltaY:e.deltaY};switch(t){case 1:r.deltaY*=16;break;case 2:r.deltaY*=100;break}return e.ctrlKey&&!this._controlActive&&(r.deltaY*=10),r}}function XT(s){this.enabled!==!1&&(this._pointers.length===0&&(this.domElement.setPointerCapture(s.pointerId),this.domElement.ownerDocument.addEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.addEventListener("pointerup",this._onPointerUp)),!this._isTrackingPointer(s)&&(this._addPointer(s),s.pointerType==="touch"?this._onTouchStart(s):this._onMouseDown(s),this._cursorStyle==="grab"&&(this.domElement.style.cursor="grabbing")))}function YT(s){this.enabled!==!1&&(s.pointerType==="touch"?this._onTouchMove(s):this._onMouseMove(s))}function qT(s){switch(this._removePointer(s),this._pointers.length){case 0:this.domElement.releasePointerCapture(s.pointerId),this.domElement.ownerDocument.removeEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.removeEventListener("pointerup",this._onPointerUp),this.dispatchEvent(R_),this.state=It.NONE,this._cursorStyle==="grab"&&(this.domElement.style.cursor="grab");break;case 1:const e=this._pointers[0],t=this._pointerPositions[e];this._onTouchStart({pointerId:e,pageX:t.x,pageY:t.y});break}}function KT(s){let e;switch(s.button){case 0:e=this.mouseButtons.LEFT;break;case 1:e=this.mouseButtons.MIDDLE;break;case 2:e=this.mouseButtons.RIGHT;break;default:e=-1}switch(e){case aa.DOLLY:if(this.enableZoom===!1)return;this._handleMouseDownDolly(s),this.state=It.DOLLY;break;case aa.ROTATE:if(s.ctrlKey||s.metaKey||s.shiftKey){if(this.enablePan===!1)return;this._handleMouseDownPan(s),this.state=It.PAN}else{if(this.enableRotate===!1)return;this._handleMouseDownRotate(s),this.state=It.ROTATE}break;case aa.PAN:if(s.ctrlKey||s.metaKey||s.shiftKey){if(this.enableRotate===!1)return;this._handleMouseDownRotate(s),this.state=It.ROTATE}else{if(this.enablePan===!1)return;this._handleMouseDownPan(s),this.state=It.PAN}break;default:this.state=It.NONE}this.state!==It.NONE&&this.dispatchEvent(Qd)}function $T(s){switch(this.state){case It.ROTATE:if(this.enableRotate===!1)return;this._handleMouseMoveRotate(s);break;case It.DOLLY:if(this.enableZoom===!1)return;this._handleMouseMoveDolly(s);break;case It.PAN:if(this.enablePan===!1)return;this._handleMouseMovePan(s);break}}function ZT(s){this.enabled===!1||this.enableZoom===!1||this.state!==It.NONE||(s.preventDefault(),this.dispatchEvent(Qd),this._handleMouseWheel(this._customWheelEvent(s)),this.dispatchEvent(R_))}function QT(s){this.enabled!==!1&&this._handleKeyDown(s)}function JT(s){switch(this._trackPointer(s),this._pointers.length){case 1:switch(this.touches.ONE){case ra.ROTATE:if(this.enableRotate===!1)return;this._handleTouchStartRotate(s),this.state=It.TOUCH_ROTATE;break;case ra.PAN:if(this.enablePan===!1)return;this._handleTouchStartPan(s),this.state=It.TOUCH_PAN;break;default:this.state=It.NONE}break;case 2:switch(this.touches.TWO){case ra.DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchStartDollyPan(s),this.state=It.TOUCH_DOLLY_PAN;break;case ra.DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchStartDollyRotate(s),this.state=It.TOUCH_DOLLY_ROTATE;break;default:this.state=It.NONE}break;default:this.state=It.NONE}this.state!==It.NONE&&this.dispatchEvent(Qd)}function jT(s){switch(this._trackPointer(s),this.state){case It.TOUCH_ROTATE:if(this.enableRotate===!1)return;this._handleTouchMoveRotate(s),this.update();break;case It.TOUCH_PAN:if(this.enablePan===!1)return;this._handleTouchMovePan(s),this.update();break;case It.TOUCH_DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchMoveDollyPan(s),this.update();break;case It.TOUCH_DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchMoveDollyRotate(s),this.update();break;default:this.state=It.NONE}}function e1(s){this.enabled!==!1&&s.preventDefault()}function t1(s){s.key==="Control"&&(this._controlActive=!0,this.domElement.getRootNode().addEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}function n1(s){s.key==="Control"&&(this._controlActive=!1,this.domElement.getRootNode().removeEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}class i1 extends tn{constructor(e=document.createElement("div")){super(),this.isCSS2DObject=!0,this.element=e,this.element.style.position="absolute",this.element.style.userSelect="none",this.element.setAttribute("draggable",!1),this.center=new Qe(.5,.5),this.addEventListener("removed",function(){this.traverse(function(t){t.element&&t.element instanceof t.element.ownerDocument.defaultView.Element&&t.element.parentNode!==null&&t.element.remove()})})}copy(e,t){return super.copy(e,t),this.element=e.element.cloneNode(!0),this.center=e.center,this}}const ia=new H,Ug=new Ut,Fg=new Ut,Og=new H,Bg=new H;class r1{constructor(e={}){const t=this;let r,o,l,c;const d={objects:new WeakMap},p=e.element!==void 0?e.element:document.createElement("div");p.style.overflow="hidden",this.domElement=p,this.sortObjects=!0,this.getSize=function(){return{width:r,height:o}},this.render=function(E,R){E.matrixWorldAutoUpdate===!0&&E.updateMatrixWorld(),R.parent===null&&R.matrixWorldAutoUpdate===!0&&R.updateMatrixWorld(),Ug.copy(R.matrixWorldInverse),Fg.multiplyMatrices(R.projectionMatrix,Ug),x(E,E,R),this.sortObjects&&M(E)},this.setSize=function(E,R){r=E,o=R,l=r/2,c=o/2,p.style.width=E+"px",p.style.height=R+"px"};function m(E){E.isCSS2DObject&&(E.element.style.display="none");for(let R=0,v=E.children.length;R<v;R++)m(E.children[R])}function x(E,R,v){if(E.visible===!1){m(E);return}if(E.isCSS2DObject){ia.setFromMatrixPosition(E.matrixWorld),ia.applyMatrix4(Fg);const _=ia.z>=-1&&ia.z<=1&&E.layers.test(v.layers)===!0,b=E.element;b.style.display=_===!0?"":"none",_===!0&&(E.onBeforeRender(t,R,v),b.style.transform="translate("+-100*E.center.x+"%,"+-100*E.center.y+"%)translate("+(ia.x*l+l)+"px,"+(-ia.y*c+c)+"px)",b.parentNode!==p&&p.appendChild(b),E.onAfterRender(t,R,v));const N={distanceToCameraSquared:y(v,E)};d.objects.set(E,N)}for(let _=0,b=E.children.length;_<b;_++)x(E.children[_],R,v)}function y(E,R){return Og.setFromMatrixPosition(E.matrixWorld),Bg.setFromMatrixPosition(R.matrixWorld),Og.distanceToSquared(Bg)}function g(E){const R=[];return E.traverseVisible(function(v){v.isCSS2DObject&&R.push(v)}),R}function M(E){const R=g(E).sort(function(_,b){if(_.renderOrder!==b.renderOrder)return b.renderOrder-_.renderOrder;const N=d.objects.get(_).distanceToCameraSquared,C=d.objects.get(b).distanceToCameraSquared;return N-C}),v=R.length;for(let _=0,b=R.length;_<b;_++)R[_].element.style.zIndex=v-_}}}const s1=6378137;function a1(s){const e=new dx;e.background=new dt(461069);const t=new ci(45,1,.01,500);t.position.set(2.6,1.5,2.4);const r=new HT({antialias:!0});r.setPixelRatio(Math.min(window.devicePixelRatio,2)),r.outputColorSpace=Fn,s.appendChild(r.domElement);const o=new r1;o.domElement.className="viewport-labels",s.appendChild(o.domElement);const l=new WT(t,o.domElement);l.enableDamping=!0,l.dampingFactor=.08,l.rotateSpeed=.55,l.minDistance=1.2,l.maxDistance=40,l.zoomSpeed=.9,l.enablePan=!0;const c=new sa,d=new sa;e.add(c),e.add(d);const p=o1(e),m=l1();e.add(t),t.add(m),c1(e),u1(d,r);const x=new ResizeObserver(g);x.observe(s);let y;M();function g(){const v=Math.max(s.clientWidth,1),_=Math.max(s.clientHeight,1);t.aspect=v/_,t.updateProjectionMatrix(),r.setSize(v,_,!1),o.setSize(v,_)}function M(){l.update(),r.render(e,t),o.render(e,t),y=requestAnimationFrame(M)}function E(v,_){var I;kg(c);const b=Number(v.earthRadius_m)||s1,N=_==="ECI"?"positionEci_m":"positionEcef_m";zg(v.satellites).forEach(P=>{h1(c,P,_,b),f1(c,P.name,P[N],b)}),zg(v.places).forEach(P=>{d1(c,P.name,P[N],b)}),m1(d,v.ecefToEciMatrix,_);const C=_==="ECI"?"unitDirectionEci":"unitDirectionEcef";p1(m,p,(I=v.sun)==null?void 0:I[C])}function R(){cancelAnimationFrame(y),x.disconnect(),l.dispose(),kg(c),m.material.map.dispose(),m.material.dispose(),r.dispose(),o.domElement.remove(),r.domElement.remove()}return{update:E,dispose:R}}function o1(s){s.add(new zx(10406911,397341,1.35));const e=new Gx(16777215,3.2);return e.position.set(4,2,3),s.add(e),e}function l1(){const s=document.createElement("canvas");s.width=128,s.height=128;const e=s.getContext("2d"),t=e.createRadialGradient(64,64,2,64,64,64);t.addColorStop(0,"rgba(255,255,255,1)"),t.addColorStop(.18,"rgba(255,250,224,1)"),t.addColorStop(.4,"rgba(255,232,150,0.72)"),t.addColorStop(.7,"rgba(255,200,80,0.22)"),t.addColorStop(1,"rgba(255,200,80,0)"),e.fillStyle=t,e.fillRect(0,0,128,128);const r=new Ax(s);r.colorSpace=Fn;const o=new vx(new c_({map:r,color:16777215,transparent:!0,blending:zf,depthWrite:!1,depthTest:!1,toneMapped:!1}));return o.position.set(1.1,.7,-3),o.scale.setScalar(.38),o.add(Jd("Sun · display proxy","object-label object-label--sun")),o.renderOrder=10,o}function u1(s,e){const t=new po(1,128,80),r=new Nx({color:16777215,specular:new dt(2107440),shininess:12});new kx().load("/textures/earth_atmos_2048.jpg",l=>{l.colorSpace=Fn,l.anisotropy=e.capabilities.getMaxAnisotropy(),r.map=l,r.needsUpdate=!0}),s.add(new qn(t,r));const o=new qn(new po(1.018,96,64),new da({color:4630783,transparent:!0,opacity:.12,side:On}));s.add(o)}function c1(s){const e=[];for(let r=0;r<1200;r+=1){const o=r*2.399963,l=1-2*r/1199,c=Math.sqrt(1-l*l);e.push(45*c*Math.cos(o),45*l,45*c*Math.sin(o))}const t=new Mn;t.setAttribute("position",new an(e,3)),s.add(new wx(t,new h_({color:12114175,size:.035,transparent:!0,opacity:.65})))}function f1(s,e,t,r){if(!Array.isArray(t)||t.length!==3)return;const o=jd(t,r),l=new qn(new po(.014,20,14),new da({color:14201434}));l.position.copy(o),l.add(Jd(e,"object-label object-label--satellite")),s.add(l)}function d1(s,e,t,r){if(!Array.isArray(t)||t.length!==3)return;const o=jd(t,r).normalize().multiplyScalar(1.006),l=new qn(new qd(.012),new da({color:14278374}));l.position.copy(o),l.add(Jd(e,"object-label object-label--place")),s.add(l);const c=new qn(new Kd(.02,.028,32),new da({color:5939416,side:Ni,transparent:!0,opacity:.85}));c.position.copy(o),c.lookAt(o.clone().multiplyScalar(2)),s.add(c)}function h1(s,e,t,r){const l=e[t==="ECI"?"orbitPathEci_m":"orbitPathEcef_m"];if(!Array.isArray(l)||l.length<2)return;const c=l.map(p=>jd(p,r)),d=new Tx(new Mn().setFromPoints(c),new d_({color:14201434,transparent:!0,opacity:.55}));s.add(d)}function Jd(s,e){const t=document.createElement("div");t.className=e,t.textContent=s;const r=new i1(t);return r.center.set(-.08,1.2),r}function jd(s,e){return new H(s[0]/e,s[2]/e,-s[1]/e)}function p1(s,e,t){const r=Array.isArray(t)&&t.length===3;if(s.visible=r,e.visible=r,!r)return;const o=su(t).normalize();e.position.copy(o.multiplyScalar(50))}function m1(s,e,t){if(s.matrixAutoUpdate=!0,s.quaternion.identity(),t!=="ECI"||!Array.isArray(e))return;const r=p=>new H(e[0][0]*p.x+e[0][1]*p.y+e[0][2]*p.z,e[1][0]*p.x+e[1][1]*p.y+e[1][2]*p.z,e[2][0]*p.x+e[2][1]*p.y+e[2][2]*p.z),o=su(r(new H(1,0,0))),l=su(r(new H(0,0,1))),c=su(r(new H(0,-1,0))),d=new Ut().makeBasis(o,l,c);s.quaternion.setFromRotationMatrix(d)}function su(s){return new H(s.x,s.z,-s.y)}function kg(s){for(;s.children.length>0;)s.children.pop().traverse(t=>{var r,o;t.isCSS2DObject&&t.element.remove(),(r=t.geometry)==null||r.dispose(),(o=t.material)==null||o.dispose()})}function zg(s){return s?Array.isArray(s)?s:[s]:[]}function g1({sceneData:s,referenceFrame:e}){const t=ui.useRef(null),r=ui.useRef(null);return ui.useEffect(()=>(r.current=a1(t.current),()=>r.current.dispose()),[]),ui.useEffect(()=>{s&&r.current&&r.current.update(s,e)},[s,e]),st.createElement("div",{className:"viewport",ref:t})}async function C_(s,e={}){const t=await fetch(s,{cache:"no-store",...e}),r=await t.json();if(!t.ok)throw new Error(r.message||`HTTP ${t.status}`);return r}function _1(){return C_("/api/scene")}function v1(s){return C_("/api/command",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({command:s})})}function x1(){var E;const[s,e]=ui.useState(null),[t,r]=ui.useState(-1),[o,l]=ui.useState("Connecting to MATLAB…"),[c,d]=ui.useState(!1),[p,m]=ui.useState("ECEF"),x=ui.useCallback(async()=>{try{const R=await _1();R.revision!==t&&(e(R.scene),r(R.revision)),l("MATLAB scenario synchronized")}catch(R){l(`MATLAB bridge unavailable: ${R.message}`)}},[t]);ui.useEffect(()=>{x();const R=window.setInterval(x,500);return()=>window.clearInterval(R)},[x]);async function y(R){d(!0),l("Applying command in MATLAB…");try{await v1(R),await x()}catch(v){l(`Command failed: ${v.message}`)}finally{d(!1)}}const g=Vg(s==null?void 0:s.satellites),M=Vg(s==null?void 0:s.places);return st.createElement("main",{className:"console"},st.createElement("header",{className:"topbar"},st.createElement("div",{className:"brand-mark"},"S"),st.createElement("div",null,st.createElement("h1",null,(s==null?void 0:s.scenarioName)??"Scenario Console"),st.createElement("p",null,"MATLAB · ",p," · metres")),st.createElement("div",{className:"connection"},st.createElement("span",null),o)),st.createElement("aside",{className:"object-browser panel"},st.createElement("h2",null,"Object Browser"),st.createElement(kf,{label:"Satellites",objects:g,symbol:"◈"}),st.createElement(kf,{label:"Places",objects:M,symbol:"⌖"}),st.createElement(kf,{label:"Celestial",objects:s!=null&&s.sun?[s.sun]:[],symbol:"☀"})),st.createElement("section",{className:"viewport-panel"},st.createElement(g1,{sceneData:s,referenceFrame:p}),st.createElement("div",{className:"frame-selector","aria-label":"Reference frame"},["ECEF","ECI"].map(R=>st.createElement("button",{className:p===R?"active":"",key:R,onClick:()=>m(R)},R))),st.createElement("div",{className:"viewport-badge"},p),st.createElement("div",{className:"viewport-help"},"Drag to orbit · Wheel to zoom")),st.createElement("aside",{className:"inspector panel"},st.createElement("h2",null,"Scenario"),st.createElement("dl",null,st.createElement("dt",null,"Epoch"),st.createElement("dd",null,(s==null?void 0:s.epoch)??"—"),st.createElement("dt",null,"Satellites"),st.createElement("dd",null,g.length),st.createElement("dt",null,"Places"),st.createElement("dd",null,M.length),st.createElement("dt",null,"Sun model"),st.createElement("dd",null,((E=s==null?void 0:s.sun)==null?void 0:E.model)??"—")),st.createElement("h3",null,"Create object"),st.createElement("button",{disabled:c,onClick:()=>y("addSatellite")},"Add satellite"),st.createElement("button",{disabled:c,onClick:()=>y("addPlace")},"Add Ohio place"),st.createElement("p",{className:"notice"},"Analysis remains authoritative in MATLAB.")),st.createElement("footer",{className:"timeline"},st.createElement("button",{className:"play",disabled:!0},"▶"),st.createElement("div",{className:"track"},st.createElement("span",null)),st.createElement("time",null,(s==null?void 0:s.epoch)??"No epoch loaded")))}function kf({label:s,objects:e,symbol:t}){return st.createElement("section",{className:"object-group"},st.createElement("h3",null,"⌄ ",s," ",st.createElement("small",null,e.length)),e.map(r=>st.createElement("div",{className:"object-row",key:r.name},st.createElement("span",null,t),r.name)))}function Vg(s){return s?Array.isArray(s)?s:[s]:[]}pv.createRoot(document.getElementById("root")).render(st.createElement(st.StrictMode,null,st.createElement(x1,null)));
