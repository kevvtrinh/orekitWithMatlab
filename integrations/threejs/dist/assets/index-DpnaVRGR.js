(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))r(a);new MutationObserver(a=>{for(const l of a)if(l.type==="childList")for(const c of l.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&r(c)}).observe(document,{childList:!0,subtree:!0});function t(a){const l={};return a.integrity&&(l.integrity=a.integrity),a.referrerPolicy&&(l.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?l.credentials="include":a.crossOrigin==="anonymous"?l.credentials="omit":l.credentials="same-origin",l}function r(a){if(a.ep)return;a.ep=!0;const l=t(a);fetch(a.href,l)}})();function Gv(s){return s&&s.__esModule&&Object.prototype.hasOwnProperty.call(s,"default")?s.default:s}var Oc={exports:{}},dt={};/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var em;function Wv(){if(em)return dt;em=1;var s=Symbol.for("react.element"),e=Symbol.for("react.portal"),t=Symbol.for("react.fragment"),r=Symbol.for("react.strict_mode"),a=Symbol.for("react.profiler"),l=Symbol.for("react.provider"),c=Symbol.for("react.context"),f=Symbol.for("react.forward_ref"),h=Symbol.for("react.suspense"),m=Symbol.for("react.memo"),_=Symbol.for("react.lazy"),x=Symbol.iterator;function y(N){return N===null||typeof N!="object"?null:(N=x&&N[x]||N["@@iterator"],typeof N=="function"?N:null)}var S={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},M=Object.assign,T={};function v(N,ie,De){this.props=N,this.context=ie,this.refs=T,this.updater=De||S}v.prototype.isReactComponent={},v.prototype.setState=function(N,ie){if(typeof N!="object"&&typeof N!="function"&&N!=null)throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,N,ie,"setState")},v.prototype.forceUpdate=function(N){this.updater.enqueueForceUpdate(this,N,"forceUpdate")};function g(){}g.prototype=v.prototype;function P(N,ie,De){this.props=N,this.context=ie,this.refs=T,this.updater=De||S}var L=P.prototype=new g;L.constructor=P,M(L,v.prototype),L.isPureReactComponent=!0;var C=Array.isArray,W=Object.prototype.hasOwnProperty,F={current:null},I={key:!0,ref:!0,__self:!0,__source:!0};function B(N,ie,De){var Q,fe={},Ee=null,xe=null;if(ie!=null)for(Q in ie.ref!==void 0&&(xe=ie.ref),ie.key!==void 0&&(Ee=""+ie.key),ie)W.call(ie,Q)&&!I.hasOwnProperty(Q)&&(fe[Q]=ie[Q]);var Ae=arguments.length-2;if(Ae===1)fe.children=De;else if(1<Ae){for(var Ie=Array(Ae),Qe=0;Qe<Ae;Qe++)Ie[Qe]=arguments[Qe+2];fe.children=Ie}if(N&&N.defaultProps)for(Q in Ae=N.defaultProps,Ae)fe[Q]===void 0&&(fe[Q]=Ae[Q]);return{$$typeof:s,type:N,key:Ee,ref:xe,props:fe,_owner:F.current}}function b(N,ie){return{$$typeof:s,type:N.type,key:ie,ref:N.ref,props:N.props,_owner:N._owner}}function A(N){return typeof N=="object"&&N!==null&&N.$$typeof===s}function O(N){var ie={"=":"=0",":":"=2"};return"$"+N.replace(/[=:]/g,function(De){return ie[De]})}var se=/\/+/g;function J(N,ie){return typeof N=="object"&&N!==null&&N.key!=null?O(""+N.key):ie.toString(36)}function ue(N,ie,De,Q,fe){var Ee=typeof N;(Ee==="undefined"||Ee==="boolean")&&(N=null);var xe=!1;if(N===null)xe=!0;else switch(Ee){case"string":case"number":xe=!0;break;case"object":switch(N.$$typeof){case s:case e:xe=!0}}if(xe)return xe=N,fe=fe(xe),N=Q===""?"."+J(xe,0):Q,C(fe)?(De="",N!=null&&(De=N.replace(se,"$&/")+"/"),ue(fe,ie,De,"",function(Qe){return Qe})):fe!=null&&(A(fe)&&(fe=b(fe,De+(!fe.key||xe&&xe.key===fe.key?"":(""+fe.key).replace(se,"$&/")+"/")+N)),ie.push(fe)),1;if(xe=0,Q=Q===""?".":Q+":",C(N))for(var Ae=0;Ae<N.length;Ae++){Ee=N[Ae];var Ie=Q+J(Ee,Ae);xe+=ue(Ee,ie,De,Ie,fe)}else if(Ie=y(N),typeof Ie=="function")for(N=Ie.call(N),Ae=0;!(Ee=N.next()).done;)Ee=Ee.value,Ie=Q+J(Ee,Ae++),xe+=ue(Ee,ie,De,Ie,fe);else if(Ee==="object")throw ie=String(N),Error("Objects are not valid as a React child (found: "+(ie==="[object Object]"?"object with keys {"+Object.keys(N).join(", ")+"}":ie)+"). If you meant to render a collection of children, use an array instead.");return xe}function ce(N,ie,De){if(N==null)return N;var Q=[],fe=0;return ue(N,Q,"","",function(Ee){return ie.call(De,Ee,fe++)}),Q}function $(N){if(N._status===-1){var ie=N._result;ie=ie(),ie.then(function(De){(N._status===0||N._status===-1)&&(N._status=1,N._result=De)},function(De){(N._status===0||N._status===-1)&&(N._status=2,N._result=De)}),N._status===-1&&(N._status=0,N._result=ie)}if(N._status===1)return N._result.default;throw N._result}var oe={current:null},k={transition:null},le={ReactCurrentDispatcher:oe,ReactCurrentBatchConfig:k,ReactCurrentOwner:F};function re(){throw Error("act(...) is not supported in production builds of React.")}return dt.Children={map:ce,forEach:function(N,ie,De){ce(N,function(){ie.apply(this,arguments)},De)},count:function(N){var ie=0;return ce(N,function(){ie++}),ie},toArray:function(N){return ce(N,function(ie){return ie})||[]},only:function(N){if(!A(N))throw Error("React.Children.only expected to receive a single React element child.");return N}},dt.Component=v,dt.Fragment=t,dt.Profiler=a,dt.PureComponent=P,dt.StrictMode=r,dt.Suspense=h,dt.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=le,dt.act=re,dt.cloneElement=function(N,ie,De){if(N==null)throw Error("React.cloneElement(...): The argument must be a React element, but you passed "+N+".");var Q=M({},N.props),fe=N.key,Ee=N.ref,xe=N._owner;if(ie!=null){if(ie.ref!==void 0&&(Ee=ie.ref,xe=F.current),ie.key!==void 0&&(fe=""+ie.key),N.type&&N.type.defaultProps)var Ae=N.type.defaultProps;for(Ie in ie)W.call(ie,Ie)&&!I.hasOwnProperty(Ie)&&(Q[Ie]=ie[Ie]===void 0&&Ae!==void 0?Ae[Ie]:ie[Ie])}var Ie=arguments.length-2;if(Ie===1)Q.children=De;else if(1<Ie){Ae=Array(Ie);for(var Qe=0;Qe<Ie;Qe++)Ae[Qe]=arguments[Qe+2];Q.children=Ae}return{$$typeof:s,type:N.type,key:fe,ref:Ee,props:Q,_owner:xe}},dt.createContext=function(N){return N={$$typeof:c,_currentValue:N,_currentValue2:N,_threadCount:0,Provider:null,Consumer:null,_defaultValue:null,_globalName:null},N.Provider={$$typeof:l,_context:N},N.Consumer=N},dt.createElement=B,dt.createFactory=function(N){var ie=B.bind(null,N);return ie.type=N,ie},dt.createRef=function(){return{current:null}},dt.forwardRef=function(N){return{$$typeof:f,render:N}},dt.isValidElement=A,dt.lazy=function(N){return{$$typeof:_,_payload:{_status:-1,_result:N},_init:$}},dt.memo=function(N,ie){return{$$typeof:m,type:N,compare:ie===void 0?null:ie}},dt.startTransition=function(N){var ie=k.transition;k.transition={};try{N()}finally{k.transition=ie}},dt.unstable_act=re,dt.useCallback=function(N,ie){return oe.current.useCallback(N,ie)},dt.useContext=function(N){return oe.current.useContext(N)},dt.useDebugValue=function(){},dt.useDeferredValue=function(N){return oe.current.useDeferredValue(N)},dt.useEffect=function(N,ie){return oe.current.useEffect(N,ie)},dt.useId=function(){return oe.current.useId()},dt.useImperativeHandle=function(N,ie,De){return oe.current.useImperativeHandle(N,ie,De)},dt.useInsertionEffect=function(N,ie){return oe.current.useInsertionEffect(N,ie)},dt.useLayoutEffect=function(N,ie){return oe.current.useLayoutEffect(N,ie)},dt.useMemo=function(N,ie){return oe.current.useMemo(N,ie)},dt.useReducer=function(N,ie,De){return oe.current.useReducer(N,ie,De)},dt.useRef=function(N){return oe.current.useRef(N)},dt.useState=function(N){return oe.current.useState(N)},dt.useSyncExternalStore=function(N,ie,De){return oe.current.useSyncExternalStore(N,ie,De)},dt.useTransition=function(){return oe.current.useTransition()},dt.version="18.3.1",dt}var tm;function Tg(){return tm||(tm=1,Oc.exports=Wv()),Oc.exports}var jt=Tg();const me=Gv(jt);var fl={},zc={exports:{}},On={},kc={exports:{}},Bc={};/**
 * @license React
 * scheduler.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var nm;function Xv(){return nm||(nm=1,function(s){function e(k,le){var re=k.length;k.push(le);e:for(;0<re;){var N=re-1>>>1,ie=k[N];if(0<a(ie,le))k[N]=le,k[re]=ie,re=N;else break e}}function t(k){return k.length===0?null:k[0]}function r(k){if(k.length===0)return null;var le=k[0],re=k.pop();if(re!==le){k[0]=re;e:for(var N=0,ie=k.length,De=ie>>>1;N<De;){var Q=2*(N+1)-1,fe=k[Q],Ee=Q+1,xe=k[Ee];if(0>a(fe,re))Ee<ie&&0>a(xe,fe)?(k[N]=xe,k[Ee]=re,N=Ee):(k[N]=fe,k[Q]=re,N=Q);else if(Ee<ie&&0>a(xe,re))k[N]=xe,k[Ee]=re,N=Ee;else break e}}return le}function a(k,le){var re=k.sortIndex-le.sortIndex;return re!==0?re:k.id-le.id}if(typeof performance=="object"&&typeof performance.now=="function"){var l=performance;s.unstable_now=function(){return l.now()}}else{var c=Date,f=c.now();s.unstable_now=function(){return c.now()-f}}var h=[],m=[],_=1,x=null,y=3,S=!1,M=!1,T=!1,v=typeof setTimeout=="function"?setTimeout:null,g=typeof clearTimeout=="function"?clearTimeout:null,P=typeof setImmediate<"u"?setImmediate:null;typeof navigator<"u"&&navigator.scheduling!==void 0&&navigator.scheduling.isInputPending!==void 0&&navigator.scheduling.isInputPending.bind(navigator.scheduling);function L(k){for(var le=t(m);le!==null;){if(le.callback===null)r(m);else if(le.startTime<=k)r(m),le.sortIndex=le.expirationTime,e(h,le);else break;le=t(m)}}function C(k){if(T=!1,L(k),!M)if(t(h)!==null)M=!0,$(W);else{var le=t(m);le!==null&&oe(C,le.startTime-k)}}function W(k,le){M=!1,T&&(T=!1,g(B),B=-1),S=!0;var re=y;try{for(L(le),x=t(h);x!==null&&(!(x.expirationTime>le)||k&&!O());){var N=x.callback;if(typeof N=="function"){x.callback=null,y=x.priorityLevel;var ie=N(x.expirationTime<=le);le=s.unstable_now(),typeof ie=="function"?x.callback=ie:x===t(h)&&r(h),L(le)}else r(h);x=t(h)}if(x!==null)var De=!0;else{var Q=t(m);Q!==null&&oe(C,Q.startTime-le),De=!1}return De}finally{x=null,y=re,S=!1}}var F=!1,I=null,B=-1,b=5,A=-1;function O(){return!(s.unstable_now()-A<b)}function se(){if(I!==null){var k=s.unstable_now();A=k;var le=!0;try{le=I(!0,k)}finally{le?J():(F=!1,I=null)}}else F=!1}var J;if(typeof P=="function")J=function(){P(se)};else if(typeof MessageChannel<"u"){var ue=new MessageChannel,ce=ue.port2;ue.port1.onmessage=se,J=function(){ce.postMessage(null)}}else J=function(){v(se,0)};function $(k){I=k,F||(F=!0,J())}function oe(k,le){B=v(function(){k(s.unstable_now())},le)}s.unstable_IdlePriority=5,s.unstable_ImmediatePriority=1,s.unstable_LowPriority=4,s.unstable_NormalPriority=3,s.unstable_Profiling=null,s.unstable_UserBlockingPriority=2,s.unstable_cancelCallback=function(k){k.callback=null},s.unstable_continueExecution=function(){M||S||(M=!0,$(W))},s.unstable_forceFrameRate=function(k){0>k||125<k?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):b=0<k?Math.floor(1e3/k):5},s.unstable_getCurrentPriorityLevel=function(){return y},s.unstable_getFirstCallbackNode=function(){return t(h)},s.unstable_next=function(k){switch(y){case 1:case 2:case 3:var le=3;break;default:le=y}var re=y;y=le;try{return k()}finally{y=re}},s.unstable_pauseExecution=function(){},s.unstable_requestPaint=function(){},s.unstable_runWithPriority=function(k,le){switch(k){case 1:case 2:case 3:case 4:case 5:break;default:k=3}var re=y;y=k;try{return le()}finally{y=re}},s.unstable_scheduleCallback=function(k,le,re){var N=s.unstable_now();switch(typeof re=="object"&&re!==null?(re=re.delay,re=typeof re=="number"&&0<re?N+re:N):re=N,k){case 1:var ie=-1;break;case 2:ie=250;break;case 5:ie=1073741823;break;case 4:ie=1e4;break;default:ie=5e3}return ie=re+ie,k={id:_++,callback:le,priorityLevel:k,startTime:re,expirationTime:ie,sortIndex:-1},re>N?(k.sortIndex=re,e(m,k),t(h)===null&&k===t(m)&&(T?(g(B),B=-1):T=!0,oe(C,re-N))):(k.sortIndex=ie,e(h,k),M||S||(M=!0,$(W))),k},s.unstable_shouldYield=O,s.unstable_wrapCallback=function(k){var le=y;return function(){var re=y;y=le;try{return k.apply(this,arguments)}finally{y=re}}}}(Bc)),Bc}var im;function jv(){return im||(im=1,kc.exports=Xv()),kc.exports}/**
 * @license React
 * react-dom.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var rm;function Yv(){if(rm)return On;rm=1;var s=Tg(),e=jv();function t(n){for(var i="https://reactjs.org/docs/error-decoder.html?invariant="+n,o=1;o<arguments.length;o++)i+="&args[]="+encodeURIComponent(arguments[o]);return"Minified React error #"+n+"; visit "+i+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}var r=new Set,a={};function l(n,i){c(n,i),c(n+"Capture",i)}function c(n,i){for(a[n]=i,n=0;n<i.length;n++)r.add(i[n])}var f=!(typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"),h=Object.prototype.hasOwnProperty,m=/^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/,_={},x={};function y(n){return h.call(x,n)?!0:h.call(_,n)?!1:m.test(n)?x[n]=!0:(_[n]=!0,!1)}function S(n,i,o,u){if(o!==null&&o.type===0)return!1;switch(typeof i){case"function":case"symbol":return!0;case"boolean":return u?!1:o!==null?!o.acceptsBooleans:(n=n.toLowerCase().slice(0,5),n!=="data-"&&n!=="aria-");default:return!1}}function M(n,i,o,u){if(i===null||typeof i>"u"||S(n,i,o,u))return!0;if(u)return!1;if(o!==null)switch(o.type){case 3:return!i;case 4:return i===!1;case 5:return isNaN(i);case 6:return isNaN(i)||1>i}return!1}function T(n,i,o,u,d,p,E){this.acceptsBooleans=i===2||i===3||i===4,this.attributeName=u,this.attributeNamespace=d,this.mustUseProperty=o,this.propertyName=n,this.type=i,this.sanitizeURL=p,this.removeEmptyString=E}var v={};"children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ").forEach(function(n){v[n]=new T(n,0,!1,n,null,!1,!1)}),[["acceptCharset","accept-charset"],["className","class"],["htmlFor","for"],["httpEquiv","http-equiv"]].forEach(function(n){var i=n[0];v[i]=new T(i,1,!1,n[1],null,!1,!1)}),["contentEditable","draggable","spellCheck","value"].forEach(function(n){v[n]=new T(n,2,!1,n.toLowerCase(),null,!1,!1)}),["autoReverse","externalResourcesRequired","focusable","preserveAlpha"].forEach(function(n){v[n]=new T(n,2,!1,n,null,!1,!1)}),"allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function(n){v[n]=new T(n,3,!1,n.toLowerCase(),null,!1,!1)}),["checked","multiple","muted","selected"].forEach(function(n){v[n]=new T(n,3,!0,n,null,!1,!1)}),["capture","download"].forEach(function(n){v[n]=new T(n,4,!1,n,null,!1,!1)}),["cols","rows","size","span"].forEach(function(n){v[n]=new T(n,6,!1,n,null,!1,!1)}),["rowSpan","start"].forEach(function(n){v[n]=new T(n,5,!1,n.toLowerCase(),null,!1,!1)});var g=/[\-:]([a-z])/g;function P(n){return n[1].toUpperCase()}"accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height".split(" ").forEach(function(n){var i=n.replace(g,P);v[i]=new T(i,1,!1,n,null,!1,!1)}),"xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(n){var i=n.replace(g,P);v[i]=new T(i,1,!1,n,"http://www.w3.org/1999/xlink",!1,!1)}),["xml:base","xml:lang","xml:space"].forEach(function(n){var i=n.replace(g,P);v[i]=new T(i,1,!1,n,"http://www.w3.org/XML/1998/namespace",!1,!1)}),["tabIndex","crossOrigin"].forEach(function(n){v[n]=new T(n,1,!1,n.toLowerCase(),null,!1,!1)}),v.xlinkHref=new T("xlinkHref",1,!1,"xlink:href","http://www.w3.org/1999/xlink",!0,!1),["src","href","action","formAction"].forEach(function(n){v[n]=new T(n,1,!1,n.toLowerCase(),null,!0,!0)});function L(n,i,o,u){var d=v.hasOwnProperty(i)?v[i]:null;(d!==null?d.type!==0:u||!(2<i.length)||i[0]!=="o"&&i[0]!=="O"||i[1]!=="n"&&i[1]!=="N")&&(M(i,o,d,u)&&(o=null),u||d===null?y(i)&&(o===null?n.removeAttribute(i):n.setAttribute(i,""+o)):d.mustUseProperty?n[d.propertyName]=o===null?d.type===3?!1:"":o:(i=d.attributeName,u=d.attributeNamespace,o===null?n.removeAttribute(i):(d=d.type,o=d===3||d===4&&o===!0?"":""+o,u?n.setAttributeNS(u,i,o):n.setAttribute(i,o))))}var C=s.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,W=Symbol.for("react.element"),F=Symbol.for("react.portal"),I=Symbol.for("react.fragment"),B=Symbol.for("react.strict_mode"),b=Symbol.for("react.profiler"),A=Symbol.for("react.provider"),O=Symbol.for("react.context"),se=Symbol.for("react.forward_ref"),J=Symbol.for("react.suspense"),ue=Symbol.for("react.suspense_list"),ce=Symbol.for("react.memo"),$=Symbol.for("react.lazy"),oe=Symbol.for("react.offscreen"),k=Symbol.iterator;function le(n){return n===null||typeof n!="object"?null:(n=k&&n[k]||n["@@iterator"],typeof n=="function"?n:null)}var re=Object.assign,N;function ie(n){if(N===void 0)try{throw Error()}catch(o){var i=o.stack.trim().match(/\n( *(at )?)/);N=i&&i[1]||""}return`
`+N+n}var De=!1;function Q(n,i){if(!n||De)return"";De=!0;var o=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{if(i)if(i=function(){throw Error()},Object.defineProperty(i.prototype,"props",{set:function(){throw Error()}}),typeof Reflect=="object"&&Reflect.construct){try{Reflect.construct(i,[])}catch(ee){var u=ee}Reflect.construct(n,[],i)}else{try{i.call()}catch(ee){u=ee}n.call(i.prototype)}else{try{throw Error()}catch(ee){u=ee}n()}}catch(ee){if(ee&&u&&typeof ee.stack=="string"){for(var d=ee.stack.split(`
`),p=u.stack.split(`
`),E=d.length-1,U=p.length-1;1<=E&&0<=U&&d[E]!==p[U];)U--;for(;1<=E&&0<=U;E--,U--)if(d[E]!==p[U]){if(E!==1||U!==1)do if(E--,U--,0>U||d[E]!==p[U]){var z=`
`+d[E].replace(" at new "," at ");return n.displayName&&z.includes("<anonymous>")&&(z=z.replace("<anonymous>",n.displayName)),z}while(1<=E&&0<=U);break}}}finally{De=!1,Error.prepareStackTrace=o}return(n=n?n.displayName||n.name:"")?ie(n):""}function fe(n){switch(n.tag){case 5:return ie(n.type);case 16:return ie("Lazy");case 13:return ie("Suspense");case 19:return ie("SuspenseList");case 0:case 2:case 15:return n=Q(n.type,!1),n;case 11:return n=Q(n.type.render,!1),n;case 1:return n=Q(n.type,!0),n;default:return""}}function Ee(n){if(n==null)return null;if(typeof n=="function")return n.displayName||n.name||null;if(typeof n=="string")return n;switch(n){case I:return"Fragment";case F:return"Portal";case b:return"Profiler";case B:return"StrictMode";case J:return"Suspense";case ue:return"SuspenseList"}if(typeof n=="object")switch(n.$$typeof){case O:return(n.displayName||"Context")+".Consumer";case A:return(n._context.displayName||"Context")+".Provider";case se:var i=n.render;return n=n.displayName,n||(n=i.displayName||i.name||"",n=n!==""?"ForwardRef("+n+")":"ForwardRef"),n;case ce:return i=n.displayName||null,i!==null?i:Ee(n.type)||"Memo";case $:i=n._payload,n=n._init;try{return Ee(n(i))}catch{}}return null}function xe(n){var i=n.type;switch(n.tag){case 24:return"Cache";case 9:return(i.displayName||"Context")+".Consumer";case 10:return(i._context.displayName||"Context")+".Provider";case 18:return"DehydratedFragment";case 11:return n=i.render,n=n.displayName||n.name||"",i.displayName||(n!==""?"ForwardRef("+n+")":"ForwardRef");case 7:return"Fragment";case 5:return i;case 4:return"Portal";case 3:return"Root";case 6:return"Text";case 16:return Ee(i);case 8:return i===B?"StrictMode":"Mode";case 22:return"Offscreen";case 12:return"Profiler";case 21:return"Scope";case 13:return"Suspense";case 19:return"SuspenseList";case 25:return"TracingMarker";case 1:case 0:case 17:case 2:case 14:case 15:if(typeof i=="function")return i.displayName||i.name||null;if(typeof i=="string")return i}return null}function Ae(n){switch(typeof n){case"boolean":case"number":case"string":case"undefined":return n;case"object":return n;default:return""}}function Ie(n){var i=n.type;return(n=n.nodeName)&&n.toLowerCase()==="input"&&(i==="checkbox"||i==="radio")}function Qe(n){var i=Ie(n)?"checked":"value",o=Object.getOwnPropertyDescriptor(n.constructor.prototype,i),u=""+n[i];if(!n.hasOwnProperty(i)&&typeof o<"u"&&typeof o.get=="function"&&typeof o.set=="function"){var d=o.get,p=o.set;return Object.defineProperty(n,i,{configurable:!0,get:function(){return d.call(this)},set:function(E){u=""+E,p.call(this,E)}}),Object.defineProperty(n,i,{enumerable:o.enumerable}),{getValue:function(){return u},setValue:function(E){u=""+E},stopTracking:function(){n._valueTracker=null,delete n[i]}}}}function Ct(n){n._valueTracker||(n._valueTracker=Qe(n))}function mt(n){if(!n)return!1;var i=n._valueTracker;if(!i)return!0;var o=i.getValue(),u="";return n&&(u=Ie(n)?n.checked?"true":"false":n.value),n=u,n!==o?(i.setValue(n),!0):!1}function Ut(n){if(n=n||(typeof document<"u"?document:void 0),typeof n>"u")return null;try{return n.activeElement||n.body}catch{return n.body}}function Y(n,i){var o=i.checked;return re({},i,{defaultChecked:void 0,defaultValue:void 0,value:void 0,checked:o??n._wrapperState.initialChecked})}function vn(n,i){var o=i.defaultValue==null?"":i.defaultValue,u=i.checked!=null?i.checked:i.defaultChecked;o=Ae(i.value!=null?i.value:o),n._wrapperState={initialChecked:u,initialValue:o,controlled:i.type==="checkbox"||i.type==="radio"?i.checked!=null:i.value!=null}}function ht(n,i){i=i.checked,i!=null&&L(n,"checked",i,!1)}function ct(n,i){ht(n,i);var o=Ae(i.value),u=i.type;if(o!=null)u==="number"?(o===0&&n.value===""||n.value!=o)&&(n.value=""+o):n.value!==""+o&&(n.value=""+o);else if(u==="submit"||u==="reset"){n.removeAttribute("value");return}i.hasOwnProperty("value")?wt(n,i.type,o):i.hasOwnProperty("defaultValue")&&wt(n,i.type,Ae(i.defaultValue)),i.checked==null&&i.defaultChecked!=null&&(n.defaultChecked=!!i.defaultChecked)}function $e(n,i,o){if(i.hasOwnProperty("value")||i.hasOwnProperty("defaultValue")){var u=i.type;if(!(u!=="submit"&&u!=="reset"||i.value!==void 0&&i.value!==null))return;i=""+n._wrapperState.initialValue,o||i===n.value||(n.value=i),n.defaultValue=i}o=n.name,o!==""&&(n.name=""),n.defaultChecked=!!n._wrapperState.initialChecked,o!==""&&(n.name=o)}function wt(n,i,o){(i!=="number"||Ut(n.ownerDocument)!==n)&&(o==null?n.defaultValue=""+n._wrapperState.initialValue:n.defaultValue!==""+o&&(n.defaultValue=""+o))}var Ye=Array.isArray;function D(n,i,o,u){if(n=n.options,i){i={};for(var d=0;d<o.length;d++)i["$"+o[d]]=!0;for(o=0;o<n.length;o++)d=i.hasOwnProperty("$"+n[o].value),n[o].selected!==d&&(n[o].selected=d),d&&u&&(n[o].defaultSelected=!0)}else{for(o=""+Ae(o),i=null,d=0;d<n.length;d++){if(n[d].value===o){n[d].selected=!0,u&&(n[d].defaultSelected=!0);return}i!==null||n[d].disabled||(i=n[d])}i!==null&&(i.selected=!0)}}function w(n,i){if(i.dangerouslySetInnerHTML!=null)throw Error(t(91));return re({},i,{value:void 0,defaultValue:void 0,children:""+n._wrapperState.initialValue})}function Z(n,i){var o=i.value;if(o==null){if(o=i.children,i=i.defaultValue,o!=null){if(i!=null)throw Error(t(92));if(Ye(o)){if(1<o.length)throw Error(t(93));o=o[0]}i=o}i==null&&(i=""),o=i}n._wrapperState={initialValue:Ae(o)}}function pe(n,i){var o=Ae(i.value),u=Ae(i.defaultValue);o!=null&&(o=""+o,o!==n.value&&(n.value=o),i.defaultValue==null&&n.defaultValue!==o&&(n.defaultValue=o)),u!=null&&(n.defaultValue=""+u)}function _e(n){var i=n.textContent;i===n._wrapperState.initialValue&&i!==""&&i!==null&&(n.value=i)}function de(n){switch(n){case"svg":return"http://www.w3.org/2000/svg";case"math":return"http://www.w3.org/1998/Math/MathML";default:return"http://www.w3.org/1999/xhtml"}}function Ve(n,i){return n==null||n==="http://www.w3.org/1999/xhtml"?de(i):n==="http://www.w3.org/2000/svg"&&i==="foreignObject"?"http://www.w3.org/1999/xhtml":n}var Ce,Ne=function(n){return typeof MSApp<"u"&&MSApp.execUnsafeLocalFunction?function(i,o,u,d){MSApp.execUnsafeLocalFunction(function(){return n(i,o,u,d)})}:n}(function(n,i){if(n.namespaceURI!=="http://www.w3.org/2000/svg"||"innerHTML"in n)n.innerHTML=i;else{for(Ce=Ce||document.createElement("div"),Ce.innerHTML="<svg>"+i.valueOf().toString()+"</svg>",i=Ce.firstChild;n.firstChild;)n.removeChild(n.firstChild);for(;i.firstChild;)n.appendChild(i.firstChild)}});function ut(n,i){if(i){var o=n.firstChild;if(o&&o===n.lastChild&&o.nodeType===3){o.nodeValue=i;return}}n.textContent=i}var Se={animationIterationCount:!0,aspectRatio:!0,borderImageOutset:!0,borderImageSlice:!0,borderImageWidth:!0,boxFlex:!0,boxFlexGroup:!0,boxOrdinalGroup:!0,columnCount:!0,columns:!0,flex:!0,flexGrow:!0,flexPositive:!0,flexShrink:!0,flexNegative:!0,flexOrder:!0,gridArea:!0,gridRow:!0,gridRowEnd:!0,gridRowSpan:!0,gridRowStart:!0,gridColumn:!0,gridColumnEnd:!0,gridColumnSpan:!0,gridColumnStart:!0,fontWeight:!0,lineClamp:!0,lineHeight:!0,opacity:!0,order:!0,orphans:!0,tabSize:!0,widows:!0,zIndex:!0,zoom:!0,fillOpacity:!0,floodOpacity:!0,stopOpacity:!0,strokeDasharray:!0,strokeDashoffset:!0,strokeMiterlimit:!0,strokeOpacity:!0,strokeWidth:!0},Oe=["Webkit","ms","Moz","O"];Object.keys(Se).forEach(function(n){Oe.forEach(function(i){i=i+n.charAt(0).toUpperCase()+n.substring(1),Se[i]=Se[n]})});function Je(n,i,o){return i==null||typeof i=="boolean"||i===""?"":o||typeof i!="number"||i===0||Se.hasOwnProperty(n)&&Se[n]?(""+i).trim():i+"px"}function et(n,i){n=n.style;for(var o in i)if(i.hasOwnProperty(o)){var u=o.indexOf("--")===0,d=Je(o,i[o],u);o==="float"&&(o="cssFloat"),u?n.setProperty(o,d):n[o]=d}}var ze=re({menuitem:!0},{area:!0,base:!0,br:!0,col:!0,embed:!0,hr:!0,img:!0,input:!0,keygen:!0,link:!0,meta:!0,param:!0,source:!0,track:!0,wbr:!0});function ft(n,i){if(i){if(ze[n]&&(i.children!=null||i.dangerouslySetInnerHTML!=null))throw Error(t(137,n));if(i.dangerouslySetInnerHTML!=null){if(i.children!=null)throw Error(t(60));if(typeof i.dangerouslySetInnerHTML!="object"||!("__html"in i.dangerouslySetInnerHTML))throw Error(t(61))}if(i.style!=null&&typeof i.style!="object")throw Error(t(62))}}function rt(n,i){if(n.indexOf("-")===-1)return typeof i.is=="string";switch(n){case"annotation-xml":case"color-profile":case"font-face":case"font-face-src":case"font-face-uri":case"font-face-format":case"font-face-name":case"missing-glyph":return!1;default:return!0}}var Tt=null;function V(n){return n=n.target||n.srcElement||window,n.correspondingUseElement&&(n=n.correspondingUseElement),n.nodeType===3?n.parentNode:n}var Re=null,ae=null,he=null;function Le(n){if(n=Ro(n)){if(typeof Re!="function")throw Error(t(280));var i=n.stateNode;i&&(i=Aa(i),Re(n.stateNode,n.type,i))}}function Pe(n){ae?he?he.push(n):he=[n]:ae=n}function st(){if(ae){var n=ae,i=he;if(he=ae=null,Le(n),i)for(n=0;n<i.length;n++)Le(i[n])}}function Nt(n,i){return n(i)}function qt(){}var vt=!1;function Pn(n,i,o){if(vt)return n(i,o);vt=!0;try{return Nt(n,i,o)}finally{vt=!1,(ae!==null||he!==null)&&(qt(),st())}}function xn(n,i){var o=n.stateNode;if(o===null)return null;var u=Aa(o);if(u===null)return null;o=u[i];e:switch(i){case"onClick":case"onClickCapture":case"onDoubleClick":case"onDoubleClickCapture":case"onMouseDown":case"onMouseDownCapture":case"onMouseMove":case"onMouseMoveCapture":case"onMouseUp":case"onMouseUpCapture":case"onMouseEnter":(u=!u.disabled)||(n=n.type,u=!(n==="button"||n==="input"||n==="select"||n==="textarea")),n=!u;break e;default:n=!1}if(n)return null;if(o&&typeof o!="function")throw Error(t(231,i,typeof o));return o}var as=!1;if(f)try{var Ki={};Object.defineProperty(Ki,"passive",{get:function(){as=!0}}),window.addEventListener("test",Ki,Ki),window.removeEventListener("test",Ki,Ki)}catch{as=!1}function Ri(n,i,o,u,d,p,E,U,z){var ee=Array.prototype.slice.call(arguments,3);try{i.apply(o,ee)}catch(ve){this.onError(ve)}}var bi=!1,Ur=null,Ir=!1,Zi=null,oa={onError:function(n){bi=!0,Ur=n}};function ls(n,i,o,u,d,p,E,U,z){bi=!1,Ur=null,Ri.apply(oa,arguments)}function aa(n,i,o,u,d,p,E,U,z){if(ls.apply(this,arguments),bi){if(bi){var ee=Ur;bi=!1,Ur=null}else throw Error(t(198));Ir||(Ir=!0,Zi=ee)}}function _i(n){var i=n,o=n;if(n.alternate)for(;i.return;)i=i.return;else{n=i;do i=n,i.flags&4098&&(o=i.return),n=i.return;while(n)}return i.tag===3?o:null}function la(n){if(n.tag===13){var i=n.memoizedState;if(i===null&&(n=n.alternate,n!==null&&(i=n.memoizedState)),i!==null)return i.dehydrated}return null}function ua(n){if(_i(n)!==n)throw Error(t(188))}function su(n){var i=n.alternate;if(!i){if(i=_i(n),i===null)throw Error(t(188));return i!==n?null:n}for(var o=n,u=i;;){var d=o.return;if(d===null)break;var p=d.alternate;if(p===null){if(u=d.return,u!==null){o=u;continue}break}if(d.child===p.child){for(p=d.child;p;){if(p===o)return ua(d),n;if(p===u)return ua(d),i;p=p.sibling}throw Error(t(188))}if(o.return!==u.return)o=d,u=p;else{for(var E=!1,U=d.child;U;){if(U===o){E=!0,o=d,u=p;break}if(U===u){E=!0,u=d,o=p;break}U=U.sibling}if(!E){for(U=p.child;U;){if(U===o){E=!0,o=p,u=d;break}if(U===u){E=!0,u=p,o=d;break}U=U.sibling}if(!E)throw Error(t(189))}}if(o.alternate!==u)throw Error(t(190))}if(o.tag!==3)throw Error(t(188));return o.stateNode.current===o?n:i}function R(n){return n=su(n),n!==null?X(n):null}function X(n){if(n.tag===5||n.tag===6)return n;for(n=n.child;n!==null;){var i=X(n);if(i!==null)return i;n=n.sibling}return null}var te=e.unstable_scheduleCallback,ne=e.unstable_cancelCallback,j=e.unstable_shouldYield,we=e.unstable_requestPaint,Me=e.unstable_now,Ge=e.unstable_getCurrentPriorityLevel,Be=e.unstable_ImmediatePriority,tt=e.unstable_UserBlockingPriority,it=e.unstable_NormalPriority,We=e.unstable_LowPriority,_t=e.unstable_IdlePriority,Et=null,gt=null;function un(n){if(gt&&typeof gt.onCommitFiberRoot=="function")try{gt.onCommitFiberRoot(Et,n,void 0,(n.current.flags&128)===128)}catch{}}var ot=Math.clz32?Math.clz32:St,je=Math.log,ii=Math.LN2;function St(n){return n>>>=0,n===0?32:31-(je(n)/ii|0)|0}var cn=64,ri=4194304;function $t(n){switch(n&-n){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return n&4194240;case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:return n&130023424;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 1073741824;default:return n}}function vi(n,i){var o=n.pendingLanes;if(o===0)return 0;var u=0,d=n.suspendedLanes,p=n.pingedLanes,E=o&268435455;if(E!==0){var U=E&~d;U!==0?u=$t(U):(p&=E,p!==0&&(u=$t(p)))}else E=o&~d,E!==0?u=$t(E):p!==0&&(u=$t(p));if(u===0)return 0;if(i!==0&&i!==u&&!(i&d)&&(d=u&-u,p=i&-i,d>=p||d===16&&(p&4194240)!==0))return i;if(u&4&&(u|=o&16),i=n.entangledLanes,i!==0)for(n=n.entanglements,i&=u;0<i;)o=31-ot(i),d=1<<o,u|=n[o],i&=~d;return u}function Dt(n,i){switch(n){case 1:case 2:case 4:return i+250;case 8:case 16:case 32:case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return i+5e3;case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:return-1;case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function jn(n,i){for(var o=n.suspendedLanes,u=n.pingedLanes,d=n.expirationTimes,p=n.pendingLanes;0<p;){var E=31-ot(p),U=1<<E,z=d[E];z===-1?(!(U&o)||U&u)&&(d[E]=Dt(U,i)):z<=i&&(n.expiredLanes|=U),p&=~U}}function Pi(n){return n=n.pendingLanes&-1073741825,n!==0?n:n&1073741824?1073741824:0}function yn(){var n=cn;return cn<<=1,!(cn&4194240)&&(cn=64),n}function Yn(n){for(var i=[],o=0;31>o;o++)i.push(n);return i}function Ln(n,i,o){n.pendingLanes|=i,i!==536870912&&(n.suspendedLanes=0,n.pingedLanes=0),n=n.eventTimes,i=31-ot(i),n[i]=o}function ca(n,i){var o=n.pendingLanes&~i;n.pendingLanes=i,n.suspendedLanes=0,n.pingedLanes=0,n.expiredLanes&=i,n.mutableReadLanes&=i,n.entangledLanes&=i,i=n.entanglements;var u=n.eventTimes;for(n=n.expirationTimes;0<o;){var d=31-ot(o),p=1<<d;i[d]=0,u[d]=-1,n[d]=-1,o&=~p}}function ou(n,i){var o=n.entangledLanes|=i;for(n=n.entanglements;o;){var u=31-ot(o),d=1<<u;d&i|n[u]&i&&(n[u]|=i),o&=~d}}var At=0;function Dd(n){return n&=-n,1<n?4<n?n&268435455?16:536870912:4:1}var Ud,au,Id,Nd,Fd,lu=!1,fa=[],Qi=null,Ji=null,er=null,fo=new Map,ho=new Map,tr=[],f_="mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(" ");function Od(n,i){switch(n){case"focusin":case"focusout":Qi=null;break;case"dragenter":case"dragleave":Ji=null;break;case"mouseover":case"mouseout":er=null;break;case"pointerover":case"pointerout":fo.delete(i.pointerId);break;case"gotpointercapture":case"lostpointercapture":ho.delete(i.pointerId)}}function po(n,i,o,u,d,p){return n===null||n.nativeEvent!==p?(n={blockedOn:i,domEventName:o,eventSystemFlags:u,nativeEvent:p,targetContainers:[d]},i!==null&&(i=Ro(i),i!==null&&au(i)),n):(n.eventSystemFlags|=u,i=n.targetContainers,d!==null&&i.indexOf(d)===-1&&i.push(d),n)}function d_(n,i,o,u,d){switch(i){case"focusin":return Qi=po(Qi,n,i,o,u,d),!0;case"dragenter":return Ji=po(Ji,n,i,o,u,d),!0;case"mouseover":return er=po(er,n,i,o,u,d),!0;case"pointerover":var p=d.pointerId;return fo.set(p,po(fo.get(p)||null,n,i,o,u,d)),!0;case"gotpointercapture":return p=d.pointerId,ho.set(p,po(ho.get(p)||null,n,i,o,u,d)),!0}return!1}function zd(n){var i=Nr(n.target);if(i!==null){var o=_i(i);if(o!==null){if(i=o.tag,i===13){if(i=la(o),i!==null){n.blockedOn=i,Fd(n.priority,function(){Id(o)});return}}else if(i===3&&o.stateNode.current.memoizedState.isDehydrated){n.blockedOn=o.tag===3?o.stateNode.containerInfo:null;return}}}n.blockedOn=null}function da(n){if(n.blockedOn!==null)return!1;for(var i=n.targetContainers;0<i.length;){var o=cu(n.domEventName,n.eventSystemFlags,i[0],n.nativeEvent);if(o===null){o=n.nativeEvent;var u=new o.constructor(o.type,o);Tt=u,o.target.dispatchEvent(u),Tt=null}else return i=Ro(o),i!==null&&au(i),n.blockedOn=o,!1;i.shift()}return!0}function kd(n,i,o){da(n)&&o.delete(i)}function h_(){lu=!1,Qi!==null&&da(Qi)&&(Qi=null),Ji!==null&&da(Ji)&&(Ji=null),er!==null&&da(er)&&(er=null),fo.forEach(kd),ho.forEach(kd)}function mo(n,i){n.blockedOn===i&&(n.blockedOn=null,lu||(lu=!0,e.unstable_scheduleCallback(e.unstable_NormalPriority,h_)))}function go(n){function i(d){return mo(d,n)}if(0<fa.length){mo(fa[0],n);for(var o=1;o<fa.length;o++){var u=fa[o];u.blockedOn===n&&(u.blockedOn=null)}}for(Qi!==null&&mo(Qi,n),Ji!==null&&mo(Ji,n),er!==null&&mo(er,n),fo.forEach(i),ho.forEach(i),o=0;o<tr.length;o++)u=tr[o],u.blockedOn===n&&(u.blockedOn=null);for(;0<tr.length&&(o=tr[0],o.blockedOn===null);)zd(o),o.blockedOn===null&&tr.shift()}var us=C.ReactCurrentBatchConfig,ha=!0;function p_(n,i,o,u){var d=At,p=us.transition;us.transition=null;try{At=1,uu(n,i,o,u)}finally{At=d,us.transition=p}}function m_(n,i,o,u){var d=At,p=us.transition;us.transition=null;try{At=4,uu(n,i,o,u)}finally{At=d,us.transition=p}}function uu(n,i,o,u){if(ha){var d=cu(n,i,o,u);if(d===null)Cu(n,i,u,pa,o),Od(n,u);else if(d_(d,n,i,o,u))u.stopPropagation();else if(Od(n,u),i&4&&-1<f_.indexOf(n)){for(;d!==null;){var p=Ro(d);if(p!==null&&Ud(p),p=cu(n,i,o,u),p===null&&Cu(n,i,u,pa,o),p===d)break;d=p}d!==null&&u.stopPropagation()}else Cu(n,i,u,null,o)}}var pa=null;function cu(n,i,o,u){if(pa=null,n=V(u),n=Nr(n),n!==null)if(i=_i(n),i===null)n=null;else if(o=i.tag,o===13){if(n=la(i),n!==null)return n;n=null}else if(o===3){if(i.stateNode.current.memoizedState.isDehydrated)return i.tag===3?i.stateNode.containerInfo:null;n=null}else i!==n&&(n=null);return pa=n,null}function Bd(n){switch(n){case"cancel":case"click":case"close":case"contextmenu":case"copy":case"cut":case"auxclick":case"dblclick":case"dragend":case"dragstart":case"drop":case"focusin":case"focusout":case"input":case"invalid":case"keydown":case"keypress":case"keyup":case"mousedown":case"mouseup":case"paste":case"pause":case"play":case"pointercancel":case"pointerdown":case"pointerup":case"ratechange":case"reset":case"resize":case"seeked":case"submit":case"touchcancel":case"touchend":case"touchstart":case"volumechange":case"change":case"selectionchange":case"textInput":case"compositionstart":case"compositionend":case"compositionupdate":case"beforeblur":case"afterblur":case"beforeinput":case"blur":case"fullscreenchange":case"focus":case"hashchange":case"popstate":case"select":case"selectstart":return 1;case"drag":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"mousemove":case"mouseout":case"mouseover":case"pointermove":case"pointerout":case"pointerover":case"scroll":case"toggle":case"touchmove":case"wheel":case"mouseenter":case"mouseleave":case"pointerenter":case"pointerleave":return 4;case"message":switch(Ge()){case Be:return 1;case tt:return 4;case it:case We:return 16;case _t:return 536870912;default:return 16}default:return 16}}var nr=null,fu=null,ma=null;function Hd(){if(ma)return ma;var n,i=fu,o=i.length,u,d="value"in nr?nr.value:nr.textContent,p=d.length;for(n=0;n<o&&i[n]===d[n];n++);var E=o-n;for(u=1;u<=E&&i[o-u]===d[p-u];u++);return ma=d.slice(n,1<u?1-u:void 0)}function ga(n){var i=n.keyCode;return"charCode"in n?(n=n.charCode,n===0&&i===13&&(n=13)):n=i,n===10&&(n=13),32<=n||n===13?n:0}function _a(){return!0}function Vd(){return!1}function Bn(n){function i(o,u,d,p,E){this._reactName=o,this._targetInst=d,this.type=u,this.nativeEvent=p,this.target=E,this.currentTarget=null;for(var U in n)n.hasOwnProperty(U)&&(o=n[U],this[U]=o?o(p):p[U]);return this.isDefaultPrevented=(p.defaultPrevented!=null?p.defaultPrevented:p.returnValue===!1)?_a:Vd,this.isPropagationStopped=Vd,this}return re(i.prototype,{preventDefault:function(){this.defaultPrevented=!0;var o=this.nativeEvent;o&&(o.preventDefault?o.preventDefault():typeof o.returnValue!="unknown"&&(o.returnValue=!1),this.isDefaultPrevented=_a)},stopPropagation:function(){var o=this.nativeEvent;o&&(o.stopPropagation?o.stopPropagation():typeof o.cancelBubble!="unknown"&&(o.cancelBubble=!0),this.isPropagationStopped=_a)},persist:function(){},isPersistent:_a}),i}var cs={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(n){return n.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},du=Bn(cs),_o=re({},cs,{view:0,detail:0}),g_=Bn(_o),hu,pu,vo,va=re({},_o,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:gu,button:0,buttons:0,relatedTarget:function(n){return n.relatedTarget===void 0?n.fromElement===n.srcElement?n.toElement:n.fromElement:n.relatedTarget},movementX:function(n){return"movementX"in n?n.movementX:(n!==vo&&(vo&&n.type==="mousemove"?(hu=n.screenX-vo.screenX,pu=n.screenY-vo.screenY):pu=hu=0,vo=n),hu)},movementY:function(n){return"movementY"in n?n.movementY:pu}}),Gd=Bn(va),__=re({},va,{dataTransfer:0}),v_=Bn(__),x_=re({},_o,{relatedTarget:0}),mu=Bn(x_),y_=re({},cs,{animationName:0,elapsedTime:0,pseudoElement:0}),S_=Bn(y_),M_=re({},cs,{clipboardData:function(n){return"clipboardData"in n?n.clipboardData:window.clipboardData}}),E_=Bn(M_),T_=re({},cs,{data:0}),Wd=Bn(T_),w_={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},A_={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},C_={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};function R_(n){var i=this.nativeEvent;return i.getModifierState?i.getModifierState(n):(n=C_[n])?!!i[n]:!1}function gu(){return R_}var b_=re({},_o,{key:function(n){if(n.key){var i=w_[n.key]||n.key;if(i!=="Unidentified")return i}return n.type==="keypress"?(n=ga(n),n===13?"Enter":String.fromCharCode(n)):n.type==="keydown"||n.type==="keyup"?A_[n.keyCode]||"Unidentified":""},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:gu,charCode:function(n){return n.type==="keypress"?ga(n):0},keyCode:function(n){return n.type==="keydown"||n.type==="keyup"?n.keyCode:0},which:function(n){return n.type==="keypress"?ga(n):n.type==="keydown"||n.type==="keyup"?n.keyCode:0}}),P_=Bn(b_),L_=re({},va,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0}),Xd=Bn(L_),D_=re({},_o,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:gu}),U_=Bn(D_),I_=re({},cs,{propertyName:0,elapsedTime:0,pseudoElement:0}),N_=Bn(I_),F_=re({},va,{deltaX:function(n){return"deltaX"in n?n.deltaX:"wheelDeltaX"in n?-n.wheelDeltaX:0},deltaY:function(n){return"deltaY"in n?n.deltaY:"wheelDeltaY"in n?-n.wheelDeltaY:"wheelDelta"in n?-n.wheelDelta:0},deltaZ:0,deltaMode:0}),O_=Bn(F_),z_=[9,13,27,32],_u=f&&"CompositionEvent"in window,xo=null;f&&"documentMode"in document&&(xo=document.documentMode);var k_=f&&"TextEvent"in window&&!xo,jd=f&&(!_u||xo&&8<xo&&11>=xo),Yd=" ",qd=!1;function $d(n,i){switch(n){case"keyup":return z_.indexOf(i.keyCode)!==-1;case"keydown":return i.keyCode!==229;case"keypress":case"mousedown":case"focusout":return!0;default:return!1}}function Kd(n){return n=n.detail,typeof n=="object"&&"data"in n?n.data:null}var fs=!1;function B_(n,i){switch(n){case"compositionend":return Kd(i);case"keypress":return i.which!==32?null:(qd=!0,Yd);case"textInput":return n=i.data,n===Yd&&qd?null:n;default:return null}}function H_(n,i){if(fs)return n==="compositionend"||!_u&&$d(n,i)?(n=Hd(),ma=fu=nr=null,fs=!1,n):null;switch(n){case"paste":return null;case"keypress":if(!(i.ctrlKey||i.altKey||i.metaKey)||i.ctrlKey&&i.altKey){if(i.char&&1<i.char.length)return i.char;if(i.which)return String.fromCharCode(i.which)}return null;case"compositionend":return jd&&i.locale!=="ko"?null:i.data;default:return null}}var V_={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function Zd(n){var i=n&&n.nodeName&&n.nodeName.toLowerCase();return i==="input"?!!V_[n.type]:i==="textarea"}function Qd(n,i,o,u){Pe(u),i=Ea(i,"onChange"),0<i.length&&(o=new du("onChange","change",null,o,u),n.push({event:o,listeners:i}))}var yo=null,So=null;function G_(n){gh(n,0)}function xa(n){var i=gs(n);if(mt(i))return n}function W_(n,i){if(n==="change")return i}var Jd=!1;if(f){var vu;if(f){var xu="oninput"in document;if(!xu){var eh=document.createElement("div");eh.setAttribute("oninput","return;"),xu=typeof eh.oninput=="function"}vu=xu}else vu=!1;Jd=vu&&(!document.documentMode||9<document.documentMode)}function th(){yo&&(yo.detachEvent("onpropertychange",nh),So=yo=null)}function nh(n){if(n.propertyName==="value"&&xa(So)){var i=[];Qd(i,So,n,V(n)),Pn(G_,i)}}function X_(n,i,o){n==="focusin"?(th(),yo=i,So=o,yo.attachEvent("onpropertychange",nh)):n==="focusout"&&th()}function j_(n){if(n==="selectionchange"||n==="keyup"||n==="keydown")return xa(So)}function Y_(n,i){if(n==="click")return xa(i)}function q_(n,i){if(n==="input"||n==="change")return xa(i)}function $_(n,i){return n===i&&(n!==0||1/n===1/i)||n!==n&&i!==i}var si=typeof Object.is=="function"?Object.is:$_;function Mo(n,i){if(si(n,i))return!0;if(typeof n!="object"||n===null||typeof i!="object"||i===null)return!1;var o=Object.keys(n),u=Object.keys(i);if(o.length!==u.length)return!1;for(u=0;u<o.length;u++){var d=o[u];if(!h.call(i,d)||!si(n[d],i[d]))return!1}return!0}function ih(n){for(;n&&n.firstChild;)n=n.firstChild;return n}function rh(n,i){var o=ih(n);n=0;for(var u;o;){if(o.nodeType===3){if(u=n+o.textContent.length,n<=i&&u>=i)return{node:o,offset:i-n};n=u}e:{for(;o;){if(o.nextSibling){o=o.nextSibling;break e}o=o.parentNode}o=void 0}o=ih(o)}}function sh(n,i){return n&&i?n===i?!0:n&&n.nodeType===3?!1:i&&i.nodeType===3?sh(n,i.parentNode):"contains"in n?n.contains(i):n.compareDocumentPosition?!!(n.compareDocumentPosition(i)&16):!1:!1}function oh(){for(var n=window,i=Ut();i instanceof n.HTMLIFrameElement;){try{var o=typeof i.contentWindow.location.href=="string"}catch{o=!1}if(o)n=i.contentWindow;else break;i=Ut(n.document)}return i}function yu(n){var i=n&&n.nodeName&&n.nodeName.toLowerCase();return i&&(i==="input"&&(n.type==="text"||n.type==="search"||n.type==="tel"||n.type==="url"||n.type==="password")||i==="textarea"||n.contentEditable==="true")}function K_(n){var i=oh(),o=n.focusedElem,u=n.selectionRange;if(i!==o&&o&&o.ownerDocument&&sh(o.ownerDocument.documentElement,o)){if(u!==null&&yu(o)){if(i=u.start,n=u.end,n===void 0&&(n=i),"selectionStart"in o)o.selectionStart=i,o.selectionEnd=Math.min(n,o.value.length);else if(n=(i=o.ownerDocument||document)&&i.defaultView||window,n.getSelection){n=n.getSelection();var d=o.textContent.length,p=Math.min(u.start,d);u=u.end===void 0?p:Math.min(u.end,d),!n.extend&&p>u&&(d=u,u=p,p=d),d=rh(o,p);var E=rh(o,u);d&&E&&(n.rangeCount!==1||n.anchorNode!==d.node||n.anchorOffset!==d.offset||n.focusNode!==E.node||n.focusOffset!==E.offset)&&(i=i.createRange(),i.setStart(d.node,d.offset),n.removeAllRanges(),p>u?(n.addRange(i),n.extend(E.node,E.offset)):(i.setEnd(E.node,E.offset),n.addRange(i)))}}for(i=[],n=o;n=n.parentNode;)n.nodeType===1&&i.push({element:n,left:n.scrollLeft,top:n.scrollTop});for(typeof o.focus=="function"&&o.focus(),o=0;o<i.length;o++)n=i[o],n.element.scrollLeft=n.left,n.element.scrollTop=n.top}}var Z_=f&&"documentMode"in document&&11>=document.documentMode,ds=null,Su=null,Eo=null,Mu=!1;function ah(n,i,o){var u=o.window===o?o.document:o.nodeType===9?o:o.ownerDocument;Mu||ds==null||ds!==Ut(u)||(u=ds,"selectionStart"in u&&yu(u)?u={start:u.selectionStart,end:u.selectionEnd}:(u=(u.ownerDocument&&u.ownerDocument.defaultView||window).getSelection(),u={anchorNode:u.anchorNode,anchorOffset:u.anchorOffset,focusNode:u.focusNode,focusOffset:u.focusOffset}),Eo&&Mo(Eo,u)||(Eo=u,u=Ea(Su,"onSelect"),0<u.length&&(i=new du("onSelect","select",null,i,o),n.push({event:i,listeners:u}),i.target=ds)))}function ya(n,i){var o={};return o[n.toLowerCase()]=i.toLowerCase(),o["Webkit"+n]="webkit"+i,o["Moz"+n]="moz"+i,o}var hs={animationend:ya("Animation","AnimationEnd"),animationiteration:ya("Animation","AnimationIteration"),animationstart:ya("Animation","AnimationStart"),transitionend:ya("Transition","TransitionEnd")},Eu={},lh={};f&&(lh=document.createElement("div").style,"AnimationEvent"in window||(delete hs.animationend.animation,delete hs.animationiteration.animation,delete hs.animationstart.animation),"TransitionEvent"in window||delete hs.transitionend.transition);function Sa(n){if(Eu[n])return Eu[n];if(!hs[n])return n;var i=hs[n],o;for(o in i)if(i.hasOwnProperty(o)&&o in lh)return Eu[n]=i[o];return n}var uh=Sa("animationend"),ch=Sa("animationiteration"),fh=Sa("animationstart"),dh=Sa("transitionend"),hh=new Map,ph="abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");function ir(n,i){hh.set(n,i),l(i,[n])}for(var Tu=0;Tu<ph.length;Tu++){var wu=ph[Tu],Q_=wu.toLowerCase(),J_=wu[0].toUpperCase()+wu.slice(1);ir(Q_,"on"+J_)}ir(uh,"onAnimationEnd"),ir(ch,"onAnimationIteration"),ir(fh,"onAnimationStart"),ir("dblclick","onDoubleClick"),ir("focusin","onFocus"),ir("focusout","onBlur"),ir(dh,"onTransitionEnd"),c("onMouseEnter",["mouseout","mouseover"]),c("onMouseLeave",["mouseout","mouseover"]),c("onPointerEnter",["pointerout","pointerover"]),c("onPointerLeave",["pointerout","pointerover"]),l("onChange","change click focusin focusout input keydown keyup selectionchange".split(" ")),l("onSelect","focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" ")),l("onBeforeInput",["compositionend","keypress","textInput","paste"]),l("onCompositionEnd","compositionend focusout keydown keypress keyup mousedown".split(" ")),l("onCompositionStart","compositionstart focusout keydown keypress keyup mousedown".split(" ")),l("onCompositionUpdate","compositionupdate focusout keydown keypress keyup mousedown".split(" "));var To="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),ev=new Set("cancel close invalid load scroll toggle".split(" ").concat(To));function mh(n,i,o){var u=n.type||"unknown-event";n.currentTarget=o,aa(u,i,void 0,n),n.currentTarget=null}function gh(n,i){i=(i&4)!==0;for(var o=0;o<n.length;o++){var u=n[o],d=u.event;u=u.listeners;e:{var p=void 0;if(i)for(var E=u.length-1;0<=E;E--){var U=u[E],z=U.instance,ee=U.currentTarget;if(U=U.listener,z!==p&&d.isPropagationStopped())break e;mh(d,U,ee),p=z}else for(E=0;E<u.length;E++){if(U=u[E],z=U.instance,ee=U.currentTarget,U=U.listener,z!==p&&d.isPropagationStopped())break e;mh(d,U,ee),p=z}}}if(Ir)throw n=Zi,Ir=!1,Zi=null,n}function Ft(n,i){var o=i[Uu];o===void 0&&(o=i[Uu]=new Set);var u=n+"__bubble";o.has(u)||(_h(i,n,2,!1),o.add(u))}function Au(n,i,o){var u=0;i&&(u|=4),_h(o,n,u,i)}var Ma="_reactListening"+Math.random().toString(36).slice(2);function wo(n){if(!n[Ma]){n[Ma]=!0,r.forEach(function(o){o!=="selectionchange"&&(ev.has(o)||Au(o,!1,n),Au(o,!0,n))});var i=n.nodeType===9?n:n.ownerDocument;i===null||i[Ma]||(i[Ma]=!0,Au("selectionchange",!1,i))}}function _h(n,i,o,u){switch(Bd(i)){case 1:var d=p_;break;case 4:d=m_;break;default:d=uu}o=d.bind(null,i,o,n),d=void 0,!as||i!=="touchstart"&&i!=="touchmove"&&i!=="wheel"||(d=!0),u?d!==void 0?n.addEventListener(i,o,{capture:!0,passive:d}):n.addEventListener(i,o,!0):d!==void 0?n.addEventListener(i,o,{passive:d}):n.addEventListener(i,o,!1)}function Cu(n,i,o,u,d){var p=u;if(!(i&1)&&!(i&2)&&u!==null)e:for(;;){if(u===null)return;var E=u.tag;if(E===3||E===4){var U=u.stateNode.containerInfo;if(U===d||U.nodeType===8&&U.parentNode===d)break;if(E===4)for(E=u.return;E!==null;){var z=E.tag;if((z===3||z===4)&&(z=E.stateNode.containerInfo,z===d||z.nodeType===8&&z.parentNode===d))return;E=E.return}for(;U!==null;){if(E=Nr(U),E===null)return;if(z=E.tag,z===5||z===6){u=p=E;continue e}U=U.parentNode}}u=u.return}Pn(function(){var ee=p,ve=V(o),ye=[];e:{var ge=hh.get(n);if(ge!==void 0){var Ue=du,ke=n;switch(n){case"keypress":if(ga(o)===0)break e;case"keydown":case"keyup":Ue=P_;break;case"focusin":ke="focus",Ue=mu;break;case"focusout":ke="blur",Ue=mu;break;case"beforeblur":case"afterblur":Ue=mu;break;case"click":if(o.button===2)break e;case"auxclick":case"dblclick":case"mousedown":case"mousemove":case"mouseup":case"mouseout":case"mouseover":case"contextmenu":Ue=Gd;break;case"drag":case"dragend":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"dragstart":case"drop":Ue=v_;break;case"touchcancel":case"touchend":case"touchmove":case"touchstart":Ue=U_;break;case uh:case ch:case fh:Ue=S_;break;case dh:Ue=N_;break;case"scroll":Ue=g_;break;case"wheel":Ue=O_;break;case"copy":case"cut":case"paste":Ue=E_;break;case"gotpointercapture":case"lostpointercapture":case"pointercancel":case"pointerdown":case"pointermove":case"pointerout":case"pointerover":case"pointerup":Ue=Xd}var He=(i&4)!==0,Gt=!He&&n==="scroll",q=He?ge!==null?ge+"Capture":null:ge;He=[];for(var H=ee,K;H!==null;){K=H;var Te=K.stateNode;if(K.tag===5&&Te!==null&&(K=Te,q!==null&&(Te=xn(H,q),Te!=null&&He.push(Ao(H,Te,K)))),Gt)break;H=H.return}0<He.length&&(ge=new Ue(ge,ke,null,o,ve),ye.push({event:ge,listeners:He}))}}if(!(i&7)){e:{if(ge=n==="mouseover"||n==="pointerover",Ue=n==="mouseout"||n==="pointerout",ge&&o!==Tt&&(ke=o.relatedTarget||o.fromElement)&&(Nr(ke)||ke[Li]))break e;if((Ue||ge)&&(ge=ve.window===ve?ve:(ge=ve.ownerDocument)?ge.defaultView||ge.parentWindow:window,Ue?(ke=o.relatedTarget||o.toElement,Ue=ee,ke=ke?Nr(ke):null,ke!==null&&(Gt=_i(ke),ke!==Gt||ke.tag!==5&&ke.tag!==6)&&(ke=null)):(Ue=null,ke=ee),Ue!==ke)){if(He=Gd,Te="onMouseLeave",q="onMouseEnter",H="mouse",(n==="pointerout"||n==="pointerover")&&(He=Xd,Te="onPointerLeave",q="onPointerEnter",H="pointer"),Gt=Ue==null?ge:gs(Ue),K=ke==null?ge:gs(ke),ge=new He(Te,H+"leave",Ue,o,ve),ge.target=Gt,ge.relatedTarget=K,Te=null,Nr(ve)===ee&&(He=new He(q,H+"enter",ke,o,ve),He.target=K,He.relatedTarget=Gt,Te=He),Gt=Te,Ue&&ke)t:{for(He=Ue,q=ke,H=0,K=He;K;K=ps(K))H++;for(K=0,Te=q;Te;Te=ps(Te))K++;for(;0<H-K;)He=ps(He),H--;for(;0<K-H;)q=ps(q),K--;for(;H--;){if(He===q||q!==null&&He===q.alternate)break t;He=ps(He),q=ps(q)}He=null}else He=null;Ue!==null&&vh(ye,ge,Ue,He,!1),ke!==null&&Gt!==null&&vh(ye,Gt,ke,He,!0)}}e:{if(ge=ee?gs(ee):window,Ue=ge.nodeName&&ge.nodeName.toLowerCase(),Ue==="select"||Ue==="input"&&ge.type==="file")var Xe=W_;else if(Zd(ge))if(Jd)Xe=q_;else{Xe=j_;var Ke=X_}else(Ue=ge.nodeName)&&Ue.toLowerCase()==="input"&&(ge.type==="checkbox"||ge.type==="radio")&&(Xe=Y_);if(Xe&&(Xe=Xe(n,ee))){Qd(ye,Xe,o,ve);break e}Ke&&Ke(n,ge,ee),n==="focusout"&&(Ke=ge._wrapperState)&&Ke.controlled&&ge.type==="number"&&wt(ge,"number",ge.value)}switch(Ke=ee?gs(ee):window,n){case"focusin":(Zd(Ke)||Ke.contentEditable==="true")&&(ds=Ke,Su=ee,Eo=null);break;case"focusout":Eo=Su=ds=null;break;case"mousedown":Mu=!0;break;case"contextmenu":case"mouseup":case"dragend":Mu=!1,ah(ye,o,ve);break;case"selectionchange":if(Z_)break;case"keydown":case"keyup":ah(ye,o,ve)}var Ze;if(_u)e:{switch(n){case"compositionstart":var nt="onCompositionStart";break e;case"compositionend":nt="onCompositionEnd";break e;case"compositionupdate":nt="onCompositionUpdate";break e}nt=void 0}else fs?$d(n,o)&&(nt="onCompositionEnd"):n==="keydown"&&o.keyCode===229&&(nt="onCompositionStart");nt&&(jd&&o.locale!=="ko"&&(fs||nt!=="onCompositionStart"?nt==="onCompositionEnd"&&fs&&(Ze=Hd()):(nr=ve,fu="value"in nr?nr.value:nr.textContent,fs=!0)),Ke=Ea(ee,nt),0<Ke.length&&(nt=new Wd(nt,n,null,o,ve),ye.push({event:nt,listeners:Ke}),Ze?nt.data=Ze:(Ze=Kd(o),Ze!==null&&(nt.data=Ze)))),(Ze=k_?B_(n,o):H_(n,o))&&(ee=Ea(ee,"onBeforeInput"),0<ee.length&&(ve=new Wd("onBeforeInput","beforeinput",null,o,ve),ye.push({event:ve,listeners:ee}),ve.data=Ze))}gh(ye,i)})}function Ao(n,i,o){return{instance:n,listener:i,currentTarget:o}}function Ea(n,i){for(var o=i+"Capture",u=[];n!==null;){var d=n,p=d.stateNode;d.tag===5&&p!==null&&(d=p,p=xn(n,o),p!=null&&u.unshift(Ao(n,p,d)),p=xn(n,i),p!=null&&u.push(Ao(n,p,d))),n=n.return}return u}function ps(n){if(n===null)return null;do n=n.return;while(n&&n.tag!==5);return n||null}function vh(n,i,o,u,d){for(var p=i._reactName,E=[];o!==null&&o!==u;){var U=o,z=U.alternate,ee=U.stateNode;if(z!==null&&z===u)break;U.tag===5&&ee!==null&&(U=ee,d?(z=xn(o,p),z!=null&&E.unshift(Ao(o,z,U))):d||(z=xn(o,p),z!=null&&E.push(Ao(o,z,U)))),o=o.return}E.length!==0&&n.push({event:i,listeners:E})}var tv=/\r\n?/g,nv=/\u0000|\uFFFD/g;function xh(n){return(typeof n=="string"?n:""+n).replace(tv,`
`).replace(nv,"")}function Ta(n,i,o){if(i=xh(i),xh(n)!==i&&o)throw Error(t(425))}function wa(){}var Ru=null,bu=null;function Pu(n,i){return n==="textarea"||n==="noscript"||typeof i.children=="string"||typeof i.children=="number"||typeof i.dangerouslySetInnerHTML=="object"&&i.dangerouslySetInnerHTML!==null&&i.dangerouslySetInnerHTML.__html!=null}var Lu=typeof setTimeout=="function"?setTimeout:void 0,iv=typeof clearTimeout=="function"?clearTimeout:void 0,yh=typeof Promise=="function"?Promise:void 0,rv=typeof queueMicrotask=="function"?queueMicrotask:typeof yh<"u"?function(n){return yh.resolve(null).then(n).catch(sv)}:Lu;function sv(n){setTimeout(function(){throw n})}function Du(n,i){var o=i,u=0;do{var d=o.nextSibling;if(n.removeChild(o),d&&d.nodeType===8)if(o=d.data,o==="/$"){if(u===0){n.removeChild(d),go(i);return}u--}else o!=="$"&&o!=="$?"&&o!=="$!"||u++;o=d}while(o);go(i)}function rr(n){for(;n!=null;n=n.nextSibling){var i=n.nodeType;if(i===1||i===3)break;if(i===8){if(i=n.data,i==="$"||i==="$!"||i==="$?")break;if(i==="/$")return null}}return n}function Sh(n){n=n.previousSibling;for(var i=0;n;){if(n.nodeType===8){var o=n.data;if(o==="$"||o==="$!"||o==="$?"){if(i===0)return n;i--}else o==="/$"&&i++}n=n.previousSibling}return null}var ms=Math.random().toString(36).slice(2),xi="__reactFiber$"+ms,Co="__reactProps$"+ms,Li="__reactContainer$"+ms,Uu="__reactEvents$"+ms,ov="__reactListeners$"+ms,av="__reactHandles$"+ms;function Nr(n){var i=n[xi];if(i)return i;for(var o=n.parentNode;o;){if(i=o[Li]||o[xi]){if(o=i.alternate,i.child!==null||o!==null&&o.child!==null)for(n=Sh(n);n!==null;){if(o=n[xi])return o;n=Sh(n)}return i}n=o,o=n.parentNode}return null}function Ro(n){return n=n[xi]||n[Li],!n||n.tag!==5&&n.tag!==6&&n.tag!==13&&n.tag!==3?null:n}function gs(n){if(n.tag===5||n.tag===6)return n.stateNode;throw Error(t(33))}function Aa(n){return n[Co]||null}var Iu=[],_s=-1;function sr(n){return{current:n}}function Ot(n){0>_s||(n.current=Iu[_s],Iu[_s]=null,_s--)}function It(n,i){_s++,Iu[_s]=n.current,n.current=i}var or={},fn=sr(or),Dn=sr(!1),Fr=or;function vs(n,i){var o=n.type.contextTypes;if(!o)return or;var u=n.stateNode;if(u&&u.__reactInternalMemoizedUnmaskedChildContext===i)return u.__reactInternalMemoizedMaskedChildContext;var d={},p;for(p in o)d[p]=i[p];return u&&(n=n.stateNode,n.__reactInternalMemoizedUnmaskedChildContext=i,n.__reactInternalMemoizedMaskedChildContext=d),d}function Un(n){return n=n.childContextTypes,n!=null}function Ca(){Ot(Dn),Ot(fn)}function Mh(n,i,o){if(fn.current!==or)throw Error(t(168));It(fn,i),It(Dn,o)}function Eh(n,i,o){var u=n.stateNode;if(i=i.childContextTypes,typeof u.getChildContext!="function")return o;u=u.getChildContext();for(var d in u)if(!(d in i))throw Error(t(108,xe(n)||"Unknown",d));return re({},o,u)}function Ra(n){return n=(n=n.stateNode)&&n.__reactInternalMemoizedMergedChildContext||or,Fr=fn.current,It(fn,n),It(Dn,Dn.current),!0}function Th(n,i,o){var u=n.stateNode;if(!u)throw Error(t(169));o?(n=Eh(n,i,Fr),u.__reactInternalMemoizedMergedChildContext=n,Ot(Dn),Ot(fn),It(fn,n)):Ot(Dn),It(Dn,o)}var Di=null,ba=!1,Nu=!1;function wh(n){Di===null?Di=[n]:Di.push(n)}function lv(n){ba=!0,wh(n)}function ar(){if(!Nu&&Di!==null){Nu=!0;var n=0,i=At;try{var o=Di;for(At=1;n<o.length;n++){var u=o[n];do u=u(!0);while(u!==null)}Di=null,ba=!1}catch(d){throw Di!==null&&(Di=Di.slice(n+1)),te(Be,ar),d}finally{At=i,Nu=!1}}return null}var xs=[],ys=0,Pa=null,La=0,qn=[],$n=0,Or=null,Ui=1,Ii="";function zr(n,i){xs[ys++]=La,xs[ys++]=Pa,Pa=n,La=i}function Ah(n,i,o){qn[$n++]=Ui,qn[$n++]=Ii,qn[$n++]=Or,Or=n;var u=Ui;n=Ii;var d=32-ot(u)-1;u&=~(1<<d),o+=1;var p=32-ot(i)+d;if(30<p){var E=d-d%5;p=(u&(1<<E)-1).toString(32),u>>=E,d-=E,Ui=1<<32-ot(i)+d|o<<d|u,Ii=p+n}else Ui=1<<p|o<<d|u,Ii=n}function Fu(n){n.return!==null&&(zr(n,1),Ah(n,1,0))}function Ou(n){for(;n===Pa;)Pa=xs[--ys],xs[ys]=null,La=xs[--ys],xs[ys]=null;for(;n===Or;)Or=qn[--$n],qn[$n]=null,Ii=qn[--$n],qn[$n]=null,Ui=qn[--$n],qn[$n]=null}var Hn=null,Vn=null,zt=!1,oi=null;function Ch(n,i){var o=Jn(5,null,null,0);o.elementType="DELETED",o.stateNode=i,o.return=n,i=n.deletions,i===null?(n.deletions=[o],n.flags|=16):i.push(o)}function Rh(n,i){switch(n.tag){case 5:var o=n.type;return i=i.nodeType!==1||o.toLowerCase()!==i.nodeName.toLowerCase()?null:i,i!==null?(n.stateNode=i,Hn=n,Vn=rr(i.firstChild),!0):!1;case 6:return i=n.pendingProps===""||i.nodeType!==3?null:i,i!==null?(n.stateNode=i,Hn=n,Vn=null,!0):!1;case 13:return i=i.nodeType!==8?null:i,i!==null?(o=Or!==null?{id:Ui,overflow:Ii}:null,n.memoizedState={dehydrated:i,treeContext:o,retryLane:1073741824},o=Jn(18,null,null,0),o.stateNode=i,o.return=n,n.child=o,Hn=n,Vn=null,!0):!1;default:return!1}}function zu(n){return(n.mode&1)!==0&&(n.flags&128)===0}function ku(n){if(zt){var i=Vn;if(i){var o=i;if(!Rh(n,i)){if(zu(n))throw Error(t(418));i=rr(o.nextSibling);var u=Hn;i&&Rh(n,i)?Ch(u,o):(n.flags=n.flags&-4097|2,zt=!1,Hn=n)}}else{if(zu(n))throw Error(t(418));n.flags=n.flags&-4097|2,zt=!1,Hn=n}}}function bh(n){for(n=n.return;n!==null&&n.tag!==5&&n.tag!==3&&n.tag!==13;)n=n.return;Hn=n}function Da(n){if(n!==Hn)return!1;if(!zt)return bh(n),zt=!0,!1;var i;if((i=n.tag!==3)&&!(i=n.tag!==5)&&(i=n.type,i=i!=="head"&&i!=="body"&&!Pu(n.type,n.memoizedProps)),i&&(i=Vn)){if(zu(n))throw Ph(),Error(t(418));for(;i;)Ch(n,i),i=rr(i.nextSibling)}if(bh(n),n.tag===13){if(n=n.memoizedState,n=n!==null?n.dehydrated:null,!n)throw Error(t(317));e:{for(n=n.nextSibling,i=0;n;){if(n.nodeType===8){var o=n.data;if(o==="/$"){if(i===0){Vn=rr(n.nextSibling);break e}i--}else o!=="$"&&o!=="$!"&&o!=="$?"||i++}n=n.nextSibling}Vn=null}}else Vn=Hn?rr(n.stateNode.nextSibling):null;return!0}function Ph(){for(var n=Vn;n;)n=rr(n.nextSibling)}function Ss(){Vn=Hn=null,zt=!1}function Bu(n){oi===null?oi=[n]:oi.push(n)}var uv=C.ReactCurrentBatchConfig;function bo(n,i,o){if(n=o.ref,n!==null&&typeof n!="function"&&typeof n!="object"){if(o._owner){if(o=o._owner,o){if(o.tag!==1)throw Error(t(309));var u=o.stateNode}if(!u)throw Error(t(147,n));var d=u,p=""+n;return i!==null&&i.ref!==null&&typeof i.ref=="function"&&i.ref._stringRef===p?i.ref:(i=function(E){var U=d.refs;E===null?delete U[p]:U[p]=E},i._stringRef=p,i)}if(typeof n!="string")throw Error(t(284));if(!o._owner)throw Error(t(290,n))}return n}function Ua(n,i){throw n=Object.prototype.toString.call(i),Error(t(31,n==="[object Object]"?"object with keys {"+Object.keys(i).join(", ")+"}":n))}function Lh(n){var i=n._init;return i(n._payload)}function Dh(n){function i(q,H){if(n){var K=q.deletions;K===null?(q.deletions=[H],q.flags|=16):K.push(H)}}function o(q,H){if(!n)return null;for(;H!==null;)i(q,H),H=H.sibling;return null}function u(q,H){for(q=new Map;H!==null;)H.key!==null?q.set(H.key,H):q.set(H.index,H),H=H.sibling;return q}function d(q,H){return q=mr(q,H),q.index=0,q.sibling=null,q}function p(q,H,K){return q.index=K,n?(K=q.alternate,K!==null?(K=K.index,K<H?(q.flags|=2,H):K):(q.flags|=2,H)):(q.flags|=1048576,H)}function E(q){return n&&q.alternate===null&&(q.flags|=2),q}function U(q,H,K,Te){return H===null||H.tag!==6?(H=Lc(K,q.mode,Te),H.return=q,H):(H=d(H,K),H.return=q,H)}function z(q,H,K,Te){var Xe=K.type;return Xe===I?ve(q,H,K.props.children,Te,K.key):H!==null&&(H.elementType===Xe||typeof Xe=="object"&&Xe!==null&&Xe.$$typeof===$&&Lh(Xe)===H.type)?(Te=d(H,K.props),Te.ref=bo(q,H,K),Te.return=q,Te):(Te=il(K.type,K.key,K.props,null,q.mode,Te),Te.ref=bo(q,H,K),Te.return=q,Te)}function ee(q,H,K,Te){return H===null||H.tag!==4||H.stateNode.containerInfo!==K.containerInfo||H.stateNode.implementation!==K.implementation?(H=Dc(K,q.mode,Te),H.return=q,H):(H=d(H,K.children||[]),H.return=q,H)}function ve(q,H,K,Te,Xe){return H===null||H.tag!==7?(H=jr(K,q.mode,Te,Xe),H.return=q,H):(H=d(H,K),H.return=q,H)}function ye(q,H,K){if(typeof H=="string"&&H!==""||typeof H=="number")return H=Lc(""+H,q.mode,K),H.return=q,H;if(typeof H=="object"&&H!==null){switch(H.$$typeof){case W:return K=il(H.type,H.key,H.props,null,q.mode,K),K.ref=bo(q,null,H),K.return=q,K;case F:return H=Dc(H,q.mode,K),H.return=q,H;case $:var Te=H._init;return ye(q,Te(H._payload),K)}if(Ye(H)||le(H))return H=jr(H,q.mode,K,null),H.return=q,H;Ua(q,H)}return null}function ge(q,H,K,Te){var Xe=H!==null?H.key:null;if(typeof K=="string"&&K!==""||typeof K=="number")return Xe!==null?null:U(q,H,""+K,Te);if(typeof K=="object"&&K!==null){switch(K.$$typeof){case W:return K.key===Xe?z(q,H,K,Te):null;case F:return K.key===Xe?ee(q,H,K,Te):null;case $:return Xe=K._init,ge(q,H,Xe(K._payload),Te)}if(Ye(K)||le(K))return Xe!==null?null:ve(q,H,K,Te,null);Ua(q,K)}return null}function Ue(q,H,K,Te,Xe){if(typeof Te=="string"&&Te!==""||typeof Te=="number")return q=q.get(K)||null,U(H,q,""+Te,Xe);if(typeof Te=="object"&&Te!==null){switch(Te.$$typeof){case W:return q=q.get(Te.key===null?K:Te.key)||null,z(H,q,Te,Xe);case F:return q=q.get(Te.key===null?K:Te.key)||null,ee(H,q,Te,Xe);case $:var Ke=Te._init;return Ue(q,H,K,Ke(Te._payload),Xe)}if(Ye(Te)||le(Te))return q=q.get(K)||null,ve(H,q,Te,Xe,null);Ua(H,Te)}return null}function ke(q,H,K,Te){for(var Xe=null,Ke=null,Ze=H,nt=H=0,rn=null;Ze!==null&&nt<K.length;nt++){Ze.index>nt?(rn=Ze,Ze=null):rn=Ze.sibling;var Mt=ge(q,Ze,K[nt],Te);if(Mt===null){Ze===null&&(Ze=rn);break}n&&Ze&&Mt.alternate===null&&i(q,Ze),H=p(Mt,H,nt),Ke===null?Xe=Mt:Ke.sibling=Mt,Ke=Mt,Ze=rn}if(nt===K.length)return o(q,Ze),zt&&zr(q,nt),Xe;if(Ze===null){for(;nt<K.length;nt++)Ze=ye(q,K[nt],Te),Ze!==null&&(H=p(Ze,H,nt),Ke===null?Xe=Ze:Ke.sibling=Ze,Ke=Ze);return zt&&zr(q,nt),Xe}for(Ze=u(q,Ze);nt<K.length;nt++)rn=Ue(Ze,q,nt,K[nt],Te),rn!==null&&(n&&rn.alternate!==null&&Ze.delete(rn.key===null?nt:rn.key),H=p(rn,H,nt),Ke===null?Xe=rn:Ke.sibling=rn,Ke=rn);return n&&Ze.forEach(function(gr){return i(q,gr)}),zt&&zr(q,nt),Xe}function He(q,H,K,Te){var Xe=le(K);if(typeof Xe!="function")throw Error(t(150));if(K=Xe.call(K),K==null)throw Error(t(151));for(var Ke=Xe=null,Ze=H,nt=H=0,rn=null,Mt=K.next();Ze!==null&&!Mt.done;nt++,Mt=K.next()){Ze.index>nt?(rn=Ze,Ze=null):rn=Ze.sibling;var gr=ge(q,Ze,Mt.value,Te);if(gr===null){Ze===null&&(Ze=rn);break}n&&Ze&&gr.alternate===null&&i(q,Ze),H=p(gr,H,nt),Ke===null?Xe=gr:Ke.sibling=gr,Ke=gr,Ze=rn}if(Mt.done)return o(q,Ze),zt&&zr(q,nt),Xe;if(Ze===null){for(;!Mt.done;nt++,Mt=K.next())Mt=ye(q,Mt.value,Te),Mt!==null&&(H=p(Mt,H,nt),Ke===null?Xe=Mt:Ke.sibling=Mt,Ke=Mt);return zt&&zr(q,nt),Xe}for(Ze=u(q,Ze);!Mt.done;nt++,Mt=K.next())Mt=Ue(Ze,q,nt,Mt.value,Te),Mt!==null&&(n&&Mt.alternate!==null&&Ze.delete(Mt.key===null?nt:Mt.key),H=p(Mt,H,nt),Ke===null?Xe=Mt:Ke.sibling=Mt,Ke=Mt);return n&&Ze.forEach(function(Vv){return i(q,Vv)}),zt&&zr(q,nt),Xe}function Gt(q,H,K,Te){if(typeof K=="object"&&K!==null&&K.type===I&&K.key===null&&(K=K.props.children),typeof K=="object"&&K!==null){switch(K.$$typeof){case W:e:{for(var Xe=K.key,Ke=H;Ke!==null;){if(Ke.key===Xe){if(Xe=K.type,Xe===I){if(Ke.tag===7){o(q,Ke.sibling),H=d(Ke,K.props.children),H.return=q,q=H;break e}}else if(Ke.elementType===Xe||typeof Xe=="object"&&Xe!==null&&Xe.$$typeof===$&&Lh(Xe)===Ke.type){o(q,Ke.sibling),H=d(Ke,K.props),H.ref=bo(q,Ke,K),H.return=q,q=H;break e}o(q,Ke);break}else i(q,Ke);Ke=Ke.sibling}K.type===I?(H=jr(K.props.children,q.mode,Te,K.key),H.return=q,q=H):(Te=il(K.type,K.key,K.props,null,q.mode,Te),Te.ref=bo(q,H,K),Te.return=q,q=Te)}return E(q);case F:e:{for(Ke=K.key;H!==null;){if(H.key===Ke)if(H.tag===4&&H.stateNode.containerInfo===K.containerInfo&&H.stateNode.implementation===K.implementation){o(q,H.sibling),H=d(H,K.children||[]),H.return=q,q=H;break e}else{o(q,H);break}else i(q,H);H=H.sibling}H=Dc(K,q.mode,Te),H.return=q,q=H}return E(q);case $:return Ke=K._init,Gt(q,H,Ke(K._payload),Te)}if(Ye(K))return ke(q,H,K,Te);if(le(K))return He(q,H,K,Te);Ua(q,K)}return typeof K=="string"&&K!==""||typeof K=="number"?(K=""+K,H!==null&&H.tag===6?(o(q,H.sibling),H=d(H,K),H.return=q,q=H):(o(q,H),H=Lc(K,q.mode,Te),H.return=q,q=H),E(q)):o(q,H)}return Gt}var Ms=Dh(!0),Uh=Dh(!1),Ia=sr(null),Na=null,Es=null,Hu=null;function Vu(){Hu=Es=Na=null}function Gu(n){var i=Ia.current;Ot(Ia),n._currentValue=i}function Wu(n,i,o){for(;n!==null;){var u=n.alternate;if((n.childLanes&i)!==i?(n.childLanes|=i,u!==null&&(u.childLanes|=i)):u!==null&&(u.childLanes&i)!==i&&(u.childLanes|=i),n===o)break;n=n.return}}function Ts(n,i){Na=n,Hu=Es=null,n=n.dependencies,n!==null&&n.firstContext!==null&&(n.lanes&i&&(In=!0),n.firstContext=null)}function Kn(n){var i=n._currentValue;if(Hu!==n)if(n={context:n,memoizedValue:i,next:null},Es===null){if(Na===null)throw Error(t(308));Es=n,Na.dependencies={lanes:0,firstContext:n}}else Es=Es.next=n;return i}var kr=null;function Xu(n){kr===null?kr=[n]:kr.push(n)}function Ih(n,i,o,u){var d=i.interleaved;return d===null?(o.next=o,Xu(i)):(o.next=d.next,d.next=o),i.interleaved=o,Ni(n,u)}function Ni(n,i){n.lanes|=i;var o=n.alternate;for(o!==null&&(o.lanes|=i),o=n,n=n.return;n!==null;)n.childLanes|=i,o=n.alternate,o!==null&&(o.childLanes|=i),o=n,n=n.return;return o.tag===3?o.stateNode:null}var lr=!1;function ju(n){n.updateQueue={baseState:n.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,interleaved:null,lanes:0},effects:null}}function Nh(n,i){n=n.updateQueue,i.updateQueue===n&&(i.updateQueue={baseState:n.baseState,firstBaseUpdate:n.firstBaseUpdate,lastBaseUpdate:n.lastBaseUpdate,shared:n.shared,effects:n.effects})}function Fi(n,i){return{eventTime:n,lane:i,tag:0,payload:null,callback:null,next:null}}function ur(n,i,o){var u=n.updateQueue;if(u===null)return null;if(u=u.shared,xt&2){var d=u.pending;return d===null?i.next=i:(i.next=d.next,d.next=i),u.pending=i,Ni(n,o)}return d=u.interleaved,d===null?(i.next=i,Xu(u)):(i.next=d.next,d.next=i),u.interleaved=i,Ni(n,o)}function Fa(n,i,o){if(i=i.updateQueue,i!==null&&(i=i.shared,(o&4194240)!==0)){var u=i.lanes;u&=n.pendingLanes,o|=u,i.lanes=o,ou(n,o)}}function Fh(n,i){var o=n.updateQueue,u=n.alternate;if(u!==null&&(u=u.updateQueue,o===u)){var d=null,p=null;if(o=o.firstBaseUpdate,o!==null){do{var E={eventTime:o.eventTime,lane:o.lane,tag:o.tag,payload:o.payload,callback:o.callback,next:null};p===null?d=p=E:p=p.next=E,o=o.next}while(o!==null);p===null?d=p=i:p=p.next=i}else d=p=i;o={baseState:u.baseState,firstBaseUpdate:d,lastBaseUpdate:p,shared:u.shared,effects:u.effects},n.updateQueue=o;return}n=o.lastBaseUpdate,n===null?o.firstBaseUpdate=i:n.next=i,o.lastBaseUpdate=i}function Oa(n,i,o,u){var d=n.updateQueue;lr=!1;var p=d.firstBaseUpdate,E=d.lastBaseUpdate,U=d.shared.pending;if(U!==null){d.shared.pending=null;var z=U,ee=z.next;z.next=null,E===null?p=ee:E.next=ee,E=z;var ve=n.alternate;ve!==null&&(ve=ve.updateQueue,U=ve.lastBaseUpdate,U!==E&&(U===null?ve.firstBaseUpdate=ee:U.next=ee,ve.lastBaseUpdate=z))}if(p!==null){var ye=d.baseState;E=0,ve=ee=z=null,U=p;do{var ge=U.lane,Ue=U.eventTime;if((u&ge)===ge){ve!==null&&(ve=ve.next={eventTime:Ue,lane:0,tag:U.tag,payload:U.payload,callback:U.callback,next:null});e:{var ke=n,He=U;switch(ge=i,Ue=o,He.tag){case 1:if(ke=He.payload,typeof ke=="function"){ye=ke.call(Ue,ye,ge);break e}ye=ke;break e;case 3:ke.flags=ke.flags&-65537|128;case 0:if(ke=He.payload,ge=typeof ke=="function"?ke.call(Ue,ye,ge):ke,ge==null)break e;ye=re({},ye,ge);break e;case 2:lr=!0}}U.callback!==null&&U.lane!==0&&(n.flags|=64,ge=d.effects,ge===null?d.effects=[U]:ge.push(U))}else Ue={eventTime:Ue,lane:ge,tag:U.tag,payload:U.payload,callback:U.callback,next:null},ve===null?(ee=ve=Ue,z=ye):ve=ve.next=Ue,E|=ge;if(U=U.next,U===null){if(U=d.shared.pending,U===null)break;ge=U,U=ge.next,ge.next=null,d.lastBaseUpdate=ge,d.shared.pending=null}}while(!0);if(ve===null&&(z=ye),d.baseState=z,d.firstBaseUpdate=ee,d.lastBaseUpdate=ve,i=d.shared.interleaved,i!==null){d=i;do E|=d.lane,d=d.next;while(d!==i)}else p===null&&(d.shared.lanes=0);Vr|=E,n.lanes=E,n.memoizedState=ye}}function Oh(n,i,o){if(n=i.effects,i.effects=null,n!==null)for(i=0;i<n.length;i++){var u=n[i],d=u.callback;if(d!==null){if(u.callback=null,u=o,typeof d!="function")throw Error(t(191,d));d.call(u)}}}var Po={},yi=sr(Po),Lo=sr(Po),Do=sr(Po);function Br(n){if(n===Po)throw Error(t(174));return n}function Yu(n,i){switch(It(Do,i),It(Lo,n),It(yi,Po),n=i.nodeType,n){case 9:case 11:i=(i=i.documentElement)?i.namespaceURI:Ve(null,"");break;default:n=n===8?i.parentNode:i,i=n.namespaceURI||null,n=n.tagName,i=Ve(i,n)}Ot(yi),It(yi,i)}function ws(){Ot(yi),Ot(Lo),Ot(Do)}function zh(n){Br(Do.current);var i=Br(yi.current),o=Ve(i,n.type);i!==o&&(It(Lo,n),It(yi,o))}function qu(n){Lo.current===n&&(Ot(yi),Ot(Lo))}var kt=sr(0);function za(n){for(var i=n;i!==null;){if(i.tag===13){var o=i.memoizedState;if(o!==null&&(o=o.dehydrated,o===null||o.data==="$?"||o.data==="$!"))return i}else if(i.tag===19&&i.memoizedProps.revealOrder!==void 0){if(i.flags&128)return i}else if(i.child!==null){i.child.return=i,i=i.child;continue}if(i===n)break;for(;i.sibling===null;){if(i.return===null||i.return===n)return null;i=i.return}i.sibling.return=i.return,i=i.sibling}return null}var $u=[];function Ku(){for(var n=0;n<$u.length;n++)$u[n]._workInProgressVersionPrimary=null;$u.length=0}var ka=C.ReactCurrentDispatcher,Zu=C.ReactCurrentBatchConfig,Hr=0,Bt=null,Kt=null,tn=null,Ba=!1,Uo=!1,Io=0,cv=0;function dn(){throw Error(t(321))}function Qu(n,i){if(i===null)return!1;for(var o=0;o<i.length&&o<n.length;o++)if(!si(n[o],i[o]))return!1;return!0}function Ju(n,i,o,u,d,p){if(Hr=p,Bt=i,i.memoizedState=null,i.updateQueue=null,i.lanes=0,ka.current=n===null||n.memoizedState===null?pv:mv,n=o(u,d),Uo){p=0;do{if(Uo=!1,Io=0,25<=p)throw Error(t(301));p+=1,tn=Kt=null,i.updateQueue=null,ka.current=gv,n=o(u,d)}while(Uo)}if(ka.current=Ga,i=Kt!==null&&Kt.next!==null,Hr=0,tn=Kt=Bt=null,Ba=!1,i)throw Error(t(300));return n}function ec(){var n=Io!==0;return Io=0,n}function Si(){var n={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return tn===null?Bt.memoizedState=tn=n:tn=tn.next=n,tn}function Zn(){if(Kt===null){var n=Bt.alternate;n=n!==null?n.memoizedState:null}else n=Kt.next;var i=tn===null?Bt.memoizedState:tn.next;if(i!==null)tn=i,Kt=n;else{if(n===null)throw Error(t(310));Kt=n,n={memoizedState:Kt.memoizedState,baseState:Kt.baseState,baseQueue:Kt.baseQueue,queue:Kt.queue,next:null},tn===null?Bt.memoizedState=tn=n:tn=tn.next=n}return tn}function No(n,i){return typeof i=="function"?i(n):i}function tc(n){var i=Zn(),o=i.queue;if(o===null)throw Error(t(311));o.lastRenderedReducer=n;var u=Kt,d=u.baseQueue,p=o.pending;if(p!==null){if(d!==null){var E=d.next;d.next=p.next,p.next=E}u.baseQueue=d=p,o.pending=null}if(d!==null){p=d.next,u=u.baseState;var U=E=null,z=null,ee=p;do{var ve=ee.lane;if((Hr&ve)===ve)z!==null&&(z=z.next={lane:0,action:ee.action,hasEagerState:ee.hasEagerState,eagerState:ee.eagerState,next:null}),u=ee.hasEagerState?ee.eagerState:n(u,ee.action);else{var ye={lane:ve,action:ee.action,hasEagerState:ee.hasEagerState,eagerState:ee.eagerState,next:null};z===null?(U=z=ye,E=u):z=z.next=ye,Bt.lanes|=ve,Vr|=ve}ee=ee.next}while(ee!==null&&ee!==p);z===null?E=u:z.next=U,si(u,i.memoizedState)||(In=!0),i.memoizedState=u,i.baseState=E,i.baseQueue=z,o.lastRenderedState=u}if(n=o.interleaved,n!==null){d=n;do p=d.lane,Bt.lanes|=p,Vr|=p,d=d.next;while(d!==n)}else d===null&&(o.lanes=0);return[i.memoizedState,o.dispatch]}function nc(n){var i=Zn(),o=i.queue;if(o===null)throw Error(t(311));o.lastRenderedReducer=n;var u=o.dispatch,d=o.pending,p=i.memoizedState;if(d!==null){o.pending=null;var E=d=d.next;do p=n(p,E.action),E=E.next;while(E!==d);si(p,i.memoizedState)||(In=!0),i.memoizedState=p,i.baseQueue===null&&(i.baseState=p),o.lastRenderedState=p}return[p,u]}function kh(){}function Bh(n,i){var o=Bt,u=Zn(),d=i(),p=!si(u.memoizedState,d);if(p&&(u.memoizedState=d,In=!0),u=u.queue,ic(Gh.bind(null,o,u,n),[n]),u.getSnapshot!==i||p||tn!==null&&tn.memoizedState.tag&1){if(o.flags|=2048,Fo(9,Vh.bind(null,o,u,d,i),void 0,null),nn===null)throw Error(t(349));Hr&30||Hh(o,i,d)}return d}function Hh(n,i,o){n.flags|=16384,n={getSnapshot:i,value:o},i=Bt.updateQueue,i===null?(i={lastEffect:null,stores:null},Bt.updateQueue=i,i.stores=[n]):(o=i.stores,o===null?i.stores=[n]:o.push(n))}function Vh(n,i,o,u){i.value=o,i.getSnapshot=u,Wh(i)&&Xh(n)}function Gh(n,i,o){return o(function(){Wh(i)&&Xh(n)})}function Wh(n){var i=n.getSnapshot;n=n.value;try{var o=i();return!si(n,o)}catch{return!0}}function Xh(n){var i=Ni(n,1);i!==null&&ci(i,n,1,-1)}function jh(n){var i=Si();return typeof n=="function"&&(n=n()),i.memoizedState=i.baseState=n,n={pending:null,interleaved:null,lanes:0,dispatch:null,lastRenderedReducer:No,lastRenderedState:n},i.queue=n,n=n.dispatch=hv.bind(null,Bt,n),[i.memoizedState,n]}function Fo(n,i,o,u){return n={tag:n,create:i,destroy:o,deps:u,next:null},i=Bt.updateQueue,i===null?(i={lastEffect:null,stores:null},Bt.updateQueue=i,i.lastEffect=n.next=n):(o=i.lastEffect,o===null?i.lastEffect=n.next=n:(u=o.next,o.next=n,n.next=u,i.lastEffect=n)),n}function Yh(){return Zn().memoizedState}function Ha(n,i,o,u){var d=Si();Bt.flags|=n,d.memoizedState=Fo(1|i,o,void 0,u===void 0?null:u)}function Va(n,i,o,u){var d=Zn();u=u===void 0?null:u;var p=void 0;if(Kt!==null){var E=Kt.memoizedState;if(p=E.destroy,u!==null&&Qu(u,E.deps)){d.memoizedState=Fo(i,o,p,u);return}}Bt.flags|=n,d.memoizedState=Fo(1|i,o,p,u)}function qh(n,i){return Ha(8390656,8,n,i)}function ic(n,i){return Va(2048,8,n,i)}function $h(n,i){return Va(4,2,n,i)}function Kh(n,i){return Va(4,4,n,i)}function Zh(n,i){if(typeof i=="function")return n=n(),i(n),function(){i(null)};if(i!=null)return n=n(),i.current=n,function(){i.current=null}}function Qh(n,i,o){return o=o!=null?o.concat([n]):null,Va(4,4,Zh.bind(null,i,n),o)}function rc(){}function Jh(n,i){var o=Zn();i=i===void 0?null:i;var u=o.memoizedState;return u!==null&&i!==null&&Qu(i,u[1])?u[0]:(o.memoizedState=[n,i],n)}function ep(n,i){var o=Zn();i=i===void 0?null:i;var u=o.memoizedState;return u!==null&&i!==null&&Qu(i,u[1])?u[0]:(n=n(),o.memoizedState=[n,i],n)}function tp(n,i,o){return Hr&21?(si(o,i)||(o=yn(),Bt.lanes|=o,Vr|=o,n.baseState=!0),i):(n.baseState&&(n.baseState=!1,In=!0),n.memoizedState=o)}function fv(n,i){var o=At;At=o!==0&&4>o?o:4,n(!0);var u=Zu.transition;Zu.transition={};try{n(!1),i()}finally{At=o,Zu.transition=u}}function np(){return Zn().memoizedState}function dv(n,i,o){var u=hr(n);if(o={lane:u,action:o,hasEagerState:!1,eagerState:null,next:null},ip(n))rp(i,o);else if(o=Ih(n,i,o,u),o!==null){var d=Mn();ci(o,n,u,d),sp(o,i,u)}}function hv(n,i,o){var u=hr(n),d={lane:u,action:o,hasEagerState:!1,eagerState:null,next:null};if(ip(n))rp(i,d);else{var p=n.alternate;if(n.lanes===0&&(p===null||p.lanes===0)&&(p=i.lastRenderedReducer,p!==null))try{var E=i.lastRenderedState,U=p(E,o);if(d.hasEagerState=!0,d.eagerState=U,si(U,E)){var z=i.interleaved;z===null?(d.next=d,Xu(i)):(d.next=z.next,z.next=d),i.interleaved=d;return}}catch{}finally{}o=Ih(n,i,d,u),o!==null&&(d=Mn(),ci(o,n,u,d),sp(o,i,u))}}function ip(n){var i=n.alternate;return n===Bt||i!==null&&i===Bt}function rp(n,i){Uo=Ba=!0;var o=n.pending;o===null?i.next=i:(i.next=o.next,o.next=i),n.pending=i}function sp(n,i,o){if(o&4194240){var u=i.lanes;u&=n.pendingLanes,o|=u,i.lanes=o,ou(n,o)}}var Ga={readContext:Kn,useCallback:dn,useContext:dn,useEffect:dn,useImperativeHandle:dn,useInsertionEffect:dn,useLayoutEffect:dn,useMemo:dn,useReducer:dn,useRef:dn,useState:dn,useDebugValue:dn,useDeferredValue:dn,useTransition:dn,useMutableSource:dn,useSyncExternalStore:dn,useId:dn,unstable_isNewReconciler:!1},pv={readContext:Kn,useCallback:function(n,i){return Si().memoizedState=[n,i===void 0?null:i],n},useContext:Kn,useEffect:qh,useImperativeHandle:function(n,i,o){return o=o!=null?o.concat([n]):null,Ha(4194308,4,Zh.bind(null,i,n),o)},useLayoutEffect:function(n,i){return Ha(4194308,4,n,i)},useInsertionEffect:function(n,i){return Ha(4,2,n,i)},useMemo:function(n,i){var o=Si();return i=i===void 0?null:i,n=n(),o.memoizedState=[n,i],n},useReducer:function(n,i,o){var u=Si();return i=o!==void 0?o(i):i,u.memoizedState=u.baseState=i,n={pending:null,interleaved:null,lanes:0,dispatch:null,lastRenderedReducer:n,lastRenderedState:i},u.queue=n,n=n.dispatch=dv.bind(null,Bt,n),[u.memoizedState,n]},useRef:function(n){var i=Si();return n={current:n},i.memoizedState=n},useState:jh,useDebugValue:rc,useDeferredValue:function(n){return Si().memoizedState=n},useTransition:function(){var n=jh(!1),i=n[0];return n=fv.bind(null,n[1]),Si().memoizedState=n,[i,n]},useMutableSource:function(){},useSyncExternalStore:function(n,i,o){var u=Bt,d=Si();if(zt){if(o===void 0)throw Error(t(407));o=o()}else{if(o=i(),nn===null)throw Error(t(349));Hr&30||Hh(u,i,o)}d.memoizedState=o;var p={value:o,getSnapshot:i};return d.queue=p,qh(Gh.bind(null,u,p,n),[n]),u.flags|=2048,Fo(9,Vh.bind(null,u,p,o,i),void 0,null),o},useId:function(){var n=Si(),i=nn.identifierPrefix;if(zt){var o=Ii,u=Ui;o=(u&~(1<<32-ot(u)-1)).toString(32)+o,i=":"+i+"R"+o,o=Io++,0<o&&(i+="H"+o.toString(32)),i+=":"}else o=cv++,i=":"+i+"r"+o.toString(32)+":";return n.memoizedState=i},unstable_isNewReconciler:!1},mv={readContext:Kn,useCallback:Jh,useContext:Kn,useEffect:ic,useImperativeHandle:Qh,useInsertionEffect:$h,useLayoutEffect:Kh,useMemo:ep,useReducer:tc,useRef:Yh,useState:function(){return tc(No)},useDebugValue:rc,useDeferredValue:function(n){var i=Zn();return tp(i,Kt.memoizedState,n)},useTransition:function(){var n=tc(No)[0],i=Zn().memoizedState;return[n,i]},useMutableSource:kh,useSyncExternalStore:Bh,useId:np,unstable_isNewReconciler:!1},gv={readContext:Kn,useCallback:Jh,useContext:Kn,useEffect:ic,useImperativeHandle:Qh,useInsertionEffect:$h,useLayoutEffect:Kh,useMemo:ep,useReducer:nc,useRef:Yh,useState:function(){return nc(No)},useDebugValue:rc,useDeferredValue:function(n){var i=Zn();return Kt===null?i.memoizedState=n:tp(i,Kt.memoizedState,n)},useTransition:function(){var n=nc(No)[0],i=Zn().memoizedState;return[n,i]},useMutableSource:kh,useSyncExternalStore:Bh,useId:np,unstable_isNewReconciler:!1};function ai(n,i){if(n&&n.defaultProps){i=re({},i),n=n.defaultProps;for(var o in n)i[o]===void 0&&(i[o]=n[o]);return i}return i}function sc(n,i,o,u){i=n.memoizedState,o=o(u,i),o=o==null?i:re({},i,o),n.memoizedState=o,n.lanes===0&&(n.updateQueue.baseState=o)}var Wa={isMounted:function(n){return(n=n._reactInternals)?_i(n)===n:!1},enqueueSetState:function(n,i,o){n=n._reactInternals;var u=Mn(),d=hr(n),p=Fi(u,d);p.payload=i,o!=null&&(p.callback=o),i=ur(n,p,d),i!==null&&(ci(i,n,d,u),Fa(i,n,d))},enqueueReplaceState:function(n,i,o){n=n._reactInternals;var u=Mn(),d=hr(n),p=Fi(u,d);p.tag=1,p.payload=i,o!=null&&(p.callback=o),i=ur(n,p,d),i!==null&&(ci(i,n,d,u),Fa(i,n,d))},enqueueForceUpdate:function(n,i){n=n._reactInternals;var o=Mn(),u=hr(n),d=Fi(o,u);d.tag=2,i!=null&&(d.callback=i),i=ur(n,d,u),i!==null&&(ci(i,n,u,o),Fa(i,n,u))}};function op(n,i,o,u,d,p,E){return n=n.stateNode,typeof n.shouldComponentUpdate=="function"?n.shouldComponentUpdate(u,p,E):i.prototype&&i.prototype.isPureReactComponent?!Mo(o,u)||!Mo(d,p):!0}function ap(n,i,o){var u=!1,d=or,p=i.contextType;return typeof p=="object"&&p!==null?p=Kn(p):(d=Un(i)?Fr:fn.current,u=i.contextTypes,p=(u=u!=null)?vs(n,d):or),i=new i(o,p),n.memoizedState=i.state!==null&&i.state!==void 0?i.state:null,i.updater=Wa,n.stateNode=i,i._reactInternals=n,u&&(n=n.stateNode,n.__reactInternalMemoizedUnmaskedChildContext=d,n.__reactInternalMemoizedMaskedChildContext=p),i}function lp(n,i,o,u){n=i.state,typeof i.componentWillReceiveProps=="function"&&i.componentWillReceiveProps(o,u),typeof i.UNSAFE_componentWillReceiveProps=="function"&&i.UNSAFE_componentWillReceiveProps(o,u),i.state!==n&&Wa.enqueueReplaceState(i,i.state,null)}function oc(n,i,o,u){var d=n.stateNode;d.props=o,d.state=n.memoizedState,d.refs={},ju(n);var p=i.contextType;typeof p=="object"&&p!==null?d.context=Kn(p):(p=Un(i)?Fr:fn.current,d.context=vs(n,p)),d.state=n.memoizedState,p=i.getDerivedStateFromProps,typeof p=="function"&&(sc(n,i,p,o),d.state=n.memoizedState),typeof i.getDerivedStateFromProps=="function"||typeof d.getSnapshotBeforeUpdate=="function"||typeof d.UNSAFE_componentWillMount!="function"&&typeof d.componentWillMount!="function"||(i=d.state,typeof d.componentWillMount=="function"&&d.componentWillMount(),typeof d.UNSAFE_componentWillMount=="function"&&d.UNSAFE_componentWillMount(),i!==d.state&&Wa.enqueueReplaceState(d,d.state,null),Oa(n,o,d,u),d.state=n.memoizedState),typeof d.componentDidMount=="function"&&(n.flags|=4194308)}function As(n,i){try{var o="",u=i;do o+=fe(u),u=u.return;while(u);var d=o}catch(p){d=`
Error generating stack: `+p.message+`
`+p.stack}return{value:n,source:i,stack:d,digest:null}}function ac(n,i,o){return{value:n,source:null,stack:o??null,digest:i??null}}function lc(n,i){try{console.error(i.value)}catch(o){setTimeout(function(){throw o})}}var _v=typeof WeakMap=="function"?WeakMap:Map;function up(n,i,o){o=Fi(-1,o),o.tag=3,o.payload={element:null};var u=i.value;return o.callback=function(){Za||(Za=!0,Ec=u),lc(n,i)},o}function cp(n,i,o){o=Fi(-1,o),o.tag=3;var u=n.type.getDerivedStateFromError;if(typeof u=="function"){var d=i.value;o.payload=function(){return u(d)},o.callback=function(){lc(n,i)}}var p=n.stateNode;return p!==null&&typeof p.componentDidCatch=="function"&&(o.callback=function(){lc(n,i),typeof u!="function"&&(fr===null?fr=new Set([this]):fr.add(this));var E=i.stack;this.componentDidCatch(i.value,{componentStack:E!==null?E:""})}),o}function fp(n,i,o){var u=n.pingCache;if(u===null){u=n.pingCache=new _v;var d=new Set;u.set(i,d)}else d=u.get(i),d===void 0&&(d=new Set,u.set(i,d));d.has(o)||(d.add(o),n=Lv.bind(null,n,i,o),i.then(n,n))}function dp(n){do{var i;if((i=n.tag===13)&&(i=n.memoizedState,i=i!==null?i.dehydrated!==null:!0),i)return n;n=n.return}while(n!==null);return null}function hp(n,i,o,u,d){return n.mode&1?(n.flags|=65536,n.lanes=d,n):(n===i?n.flags|=65536:(n.flags|=128,o.flags|=131072,o.flags&=-52805,o.tag===1&&(o.alternate===null?o.tag=17:(i=Fi(-1,1),i.tag=2,ur(o,i,1))),o.lanes|=1),n)}var vv=C.ReactCurrentOwner,In=!1;function Sn(n,i,o,u){i.child=n===null?Uh(i,null,o,u):Ms(i,n.child,o,u)}function pp(n,i,o,u,d){o=o.render;var p=i.ref;return Ts(i,d),u=Ju(n,i,o,u,p,d),o=ec(),n!==null&&!In?(i.updateQueue=n.updateQueue,i.flags&=-2053,n.lanes&=~d,Oi(n,i,d)):(zt&&o&&Fu(i),i.flags|=1,Sn(n,i,u,d),i.child)}function mp(n,i,o,u,d){if(n===null){var p=o.type;return typeof p=="function"&&!Pc(p)&&p.defaultProps===void 0&&o.compare===null&&o.defaultProps===void 0?(i.tag=15,i.type=p,gp(n,i,p,u,d)):(n=il(o.type,null,u,i,i.mode,d),n.ref=i.ref,n.return=i,i.child=n)}if(p=n.child,!(n.lanes&d)){var E=p.memoizedProps;if(o=o.compare,o=o!==null?o:Mo,o(E,u)&&n.ref===i.ref)return Oi(n,i,d)}return i.flags|=1,n=mr(p,u),n.ref=i.ref,n.return=i,i.child=n}function gp(n,i,o,u,d){if(n!==null){var p=n.memoizedProps;if(Mo(p,u)&&n.ref===i.ref)if(In=!1,i.pendingProps=u=p,(n.lanes&d)!==0)n.flags&131072&&(In=!0);else return i.lanes=n.lanes,Oi(n,i,d)}return uc(n,i,o,u,d)}function _p(n,i,o){var u=i.pendingProps,d=u.children,p=n!==null?n.memoizedState:null;if(u.mode==="hidden")if(!(i.mode&1))i.memoizedState={baseLanes:0,cachePool:null,transitions:null},It(Rs,Gn),Gn|=o;else{if(!(o&1073741824))return n=p!==null?p.baseLanes|o:o,i.lanes=i.childLanes=1073741824,i.memoizedState={baseLanes:n,cachePool:null,transitions:null},i.updateQueue=null,It(Rs,Gn),Gn|=n,null;i.memoizedState={baseLanes:0,cachePool:null,transitions:null},u=p!==null?p.baseLanes:o,It(Rs,Gn),Gn|=u}else p!==null?(u=p.baseLanes|o,i.memoizedState=null):u=o,It(Rs,Gn),Gn|=u;return Sn(n,i,d,o),i.child}function vp(n,i){var o=i.ref;(n===null&&o!==null||n!==null&&n.ref!==o)&&(i.flags|=512,i.flags|=2097152)}function uc(n,i,o,u,d){var p=Un(o)?Fr:fn.current;return p=vs(i,p),Ts(i,d),o=Ju(n,i,o,u,p,d),u=ec(),n!==null&&!In?(i.updateQueue=n.updateQueue,i.flags&=-2053,n.lanes&=~d,Oi(n,i,d)):(zt&&u&&Fu(i),i.flags|=1,Sn(n,i,o,d),i.child)}function xp(n,i,o,u,d){if(Un(o)){var p=!0;Ra(i)}else p=!1;if(Ts(i,d),i.stateNode===null)ja(n,i),ap(i,o,u),oc(i,o,u,d),u=!0;else if(n===null){var E=i.stateNode,U=i.memoizedProps;E.props=U;var z=E.context,ee=o.contextType;typeof ee=="object"&&ee!==null?ee=Kn(ee):(ee=Un(o)?Fr:fn.current,ee=vs(i,ee));var ve=o.getDerivedStateFromProps,ye=typeof ve=="function"||typeof E.getSnapshotBeforeUpdate=="function";ye||typeof E.UNSAFE_componentWillReceiveProps!="function"&&typeof E.componentWillReceiveProps!="function"||(U!==u||z!==ee)&&lp(i,E,u,ee),lr=!1;var ge=i.memoizedState;E.state=ge,Oa(i,u,E,d),z=i.memoizedState,U!==u||ge!==z||Dn.current||lr?(typeof ve=="function"&&(sc(i,o,ve,u),z=i.memoizedState),(U=lr||op(i,o,U,u,ge,z,ee))?(ye||typeof E.UNSAFE_componentWillMount!="function"&&typeof E.componentWillMount!="function"||(typeof E.componentWillMount=="function"&&E.componentWillMount(),typeof E.UNSAFE_componentWillMount=="function"&&E.UNSAFE_componentWillMount()),typeof E.componentDidMount=="function"&&(i.flags|=4194308)):(typeof E.componentDidMount=="function"&&(i.flags|=4194308),i.memoizedProps=u,i.memoizedState=z),E.props=u,E.state=z,E.context=ee,u=U):(typeof E.componentDidMount=="function"&&(i.flags|=4194308),u=!1)}else{E=i.stateNode,Nh(n,i),U=i.memoizedProps,ee=i.type===i.elementType?U:ai(i.type,U),E.props=ee,ye=i.pendingProps,ge=E.context,z=o.contextType,typeof z=="object"&&z!==null?z=Kn(z):(z=Un(o)?Fr:fn.current,z=vs(i,z));var Ue=o.getDerivedStateFromProps;(ve=typeof Ue=="function"||typeof E.getSnapshotBeforeUpdate=="function")||typeof E.UNSAFE_componentWillReceiveProps!="function"&&typeof E.componentWillReceiveProps!="function"||(U!==ye||ge!==z)&&lp(i,E,u,z),lr=!1,ge=i.memoizedState,E.state=ge,Oa(i,u,E,d);var ke=i.memoizedState;U!==ye||ge!==ke||Dn.current||lr?(typeof Ue=="function"&&(sc(i,o,Ue,u),ke=i.memoizedState),(ee=lr||op(i,o,ee,u,ge,ke,z)||!1)?(ve||typeof E.UNSAFE_componentWillUpdate!="function"&&typeof E.componentWillUpdate!="function"||(typeof E.componentWillUpdate=="function"&&E.componentWillUpdate(u,ke,z),typeof E.UNSAFE_componentWillUpdate=="function"&&E.UNSAFE_componentWillUpdate(u,ke,z)),typeof E.componentDidUpdate=="function"&&(i.flags|=4),typeof E.getSnapshotBeforeUpdate=="function"&&(i.flags|=1024)):(typeof E.componentDidUpdate!="function"||U===n.memoizedProps&&ge===n.memoizedState||(i.flags|=4),typeof E.getSnapshotBeforeUpdate!="function"||U===n.memoizedProps&&ge===n.memoizedState||(i.flags|=1024),i.memoizedProps=u,i.memoizedState=ke),E.props=u,E.state=ke,E.context=z,u=ee):(typeof E.componentDidUpdate!="function"||U===n.memoizedProps&&ge===n.memoizedState||(i.flags|=4),typeof E.getSnapshotBeforeUpdate!="function"||U===n.memoizedProps&&ge===n.memoizedState||(i.flags|=1024),u=!1)}return cc(n,i,o,u,p,d)}function cc(n,i,o,u,d,p){vp(n,i);var E=(i.flags&128)!==0;if(!u&&!E)return d&&Th(i,o,!1),Oi(n,i,p);u=i.stateNode,vv.current=i;var U=E&&typeof o.getDerivedStateFromError!="function"?null:u.render();return i.flags|=1,n!==null&&E?(i.child=Ms(i,n.child,null,p),i.child=Ms(i,null,U,p)):Sn(n,i,U,p),i.memoizedState=u.state,d&&Th(i,o,!0),i.child}function yp(n){var i=n.stateNode;i.pendingContext?Mh(n,i.pendingContext,i.pendingContext!==i.context):i.context&&Mh(n,i.context,!1),Yu(n,i.containerInfo)}function Sp(n,i,o,u,d){return Ss(),Bu(d),i.flags|=256,Sn(n,i,o,u),i.child}var fc={dehydrated:null,treeContext:null,retryLane:0};function dc(n){return{baseLanes:n,cachePool:null,transitions:null}}function Mp(n,i,o){var u=i.pendingProps,d=kt.current,p=!1,E=(i.flags&128)!==0,U;if((U=E)||(U=n!==null&&n.memoizedState===null?!1:(d&2)!==0),U?(p=!0,i.flags&=-129):(n===null||n.memoizedState!==null)&&(d|=1),It(kt,d&1),n===null)return ku(i),n=i.memoizedState,n!==null&&(n=n.dehydrated,n!==null)?(i.mode&1?n.data==="$!"?i.lanes=8:i.lanes=1073741824:i.lanes=1,null):(E=u.children,n=u.fallback,p?(u=i.mode,p=i.child,E={mode:"hidden",children:E},!(u&1)&&p!==null?(p.childLanes=0,p.pendingProps=E):p=rl(E,u,0,null),n=jr(n,u,o,null),p.return=i,n.return=i,p.sibling=n,i.child=p,i.child.memoizedState=dc(o),i.memoizedState=fc,n):hc(i,E));if(d=n.memoizedState,d!==null&&(U=d.dehydrated,U!==null))return xv(n,i,E,u,U,d,o);if(p){p=u.fallback,E=i.mode,d=n.child,U=d.sibling;var z={mode:"hidden",children:u.children};return!(E&1)&&i.child!==d?(u=i.child,u.childLanes=0,u.pendingProps=z,i.deletions=null):(u=mr(d,z),u.subtreeFlags=d.subtreeFlags&14680064),U!==null?p=mr(U,p):(p=jr(p,E,o,null),p.flags|=2),p.return=i,u.return=i,u.sibling=p,i.child=u,u=p,p=i.child,E=n.child.memoizedState,E=E===null?dc(o):{baseLanes:E.baseLanes|o,cachePool:null,transitions:E.transitions},p.memoizedState=E,p.childLanes=n.childLanes&~o,i.memoizedState=fc,u}return p=n.child,n=p.sibling,u=mr(p,{mode:"visible",children:u.children}),!(i.mode&1)&&(u.lanes=o),u.return=i,u.sibling=null,n!==null&&(o=i.deletions,o===null?(i.deletions=[n],i.flags|=16):o.push(n)),i.child=u,i.memoizedState=null,u}function hc(n,i){return i=rl({mode:"visible",children:i},n.mode,0,null),i.return=n,n.child=i}function Xa(n,i,o,u){return u!==null&&Bu(u),Ms(i,n.child,null,o),n=hc(i,i.pendingProps.children),n.flags|=2,i.memoizedState=null,n}function xv(n,i,o,u,d,p,E){if(o)return i.flags&256?(i.flags&=-257,u=ac(Error(t(422))),Xa(n,i,E,u)):i.memoizedState!==null?(i.child=n.child,i.flags|=128,null):(p=u.fallback,d=i.mode,u=rl({mode:"visible",children:u.children},d,0,null),p=jr(p,d,E,null),p.flags|=2,u.return=i,p.return=i,u.sibling=p,i.child=u,i.mode&1&&Ms(i,n.child,null,E),i.child.memoizedState=dc(E),i.memoizedState=fc,p);if(!(i.mode&1))return Xa(n,i,E,null);if(d.data==="$!"){if(u=d.nextSibling&&d.nextSibling.dataset,u)var U=u.dgst;return u=U,p=Error(t(419)),u=ac(p,u,void 0),Xa(n,i,E,u)}if(U=(E&n.childLanes)!==0,In||U){if(u=nn,u!==null){switch(E&-E){case 4:d=2;break;case 16:d=8;break;case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:d=32;break;case 536870912:d=268435456;break;default:d=0}d=d&(u.suspendedLanes|E)?0:d,d!==0&&d!==p.retryLane&&(p.retryLane=d,Ni(n,d),ci(u,n,d,-1))}return bc(),u=ac(Error(t(421))),Xa(n,i,E,u)}return d.data==="$?"?(i.flags|=128,i.child=n.child,i=Dv.bind(null,n),d._reactRetry=i,null):(n=p.treeContext,Vn=rr(d.nextSibling),Hn=i,zt=!0,oi=null,n!==null&&(qn[$n++]=Ui,qn[$n++]=Ii,qn[$n++]=Or,Ui=n.id,Ii=n.overflow,Or=i),i=hc(i,u.children),i.flags|=4096,i)}function Ep(n,i,o){n.lanes|=i;var u=n.alternate;u!==null&&(u.lanes|=i),Wu(n.return,i,o)}function pc(n,i,o,u,d){var p=n.memoizedState;p===null?n.memoizedState={isBackwards:i,rendering:null,renderingStartTime:0,last:u,tail:o,tailMode:d}:(p.isBackwards=i,p.rendering=null,p.renderingStartTime=0,p.last=u,p.tail=o,p.tailMode=d)}function Tp(n,i,o){var u=i.pendingProps,d=u.revealOrder,p=u.tail;if(Sn(n,i,u.children,o),u=kt.current,u&2)u=u&1|2,i.flags|=128;else{if(n!==null&&n.flags&128)e:for(n=i.child;n!==null;){if(n.tag===13)n.memoizedState!==null&&Ep(n,o,i);else if(n.tag===19)Ep(n,o,i);else if(n.child!==null){n.child.return=n,n=n.child;continue}if(n===i)break e;for(;n.sibling===null;){if(n.return===null||n.return===i)break e;n=n.return}n.sibling.return=n.return,n=n.sibling}u&=1}if(It(kt,u),!(i.mode&1))i.memoizedState=null;else switch(d){case"forwards":for(o=i.child,d=null;o!==null;)n=o.alternate,n!==null&&za(n)===null&&(d=o),o=o.sibling;o=d,o===null?(d=i.child,i.child=null):(d=o.sibling,o.sibling=null),pc(i,!1,d,o,p);break;case"backwards":for(o=null,d=i.child,i.child=null;d!==null;){if(n=d.alternate,n!==null&&za(n)===null){i.child=d;break}n=d.sibling,d.sibling=o,o=d,d=n}pc(i,!0,o,null,p);break;case"together":pc(i,!1,null,null,void 0);break;default:i.memoizedState=null}return i.child}function ja(n,i){!(i.mode&1)&&n!==null&&(n.alternate=null,i.alternate=null,i.flags|=2)}function Oi(n,i,o){if(n!==null&&(i.dependencies=n.dependencies),Vr|=i.lanes,!(o&i.childLanes))return null;if(n!==null&&i.child!==n.child)throw Error(t(153));if(i.child!==null){for(n=i.child,o=mr(n,n.pendingProps),i.child=o,o.return=i;n.sibling!==null;)n=n.sibling,o=o.sibling=mr(n,n.pendingProps),o.return=i;o.sibling=null}return i.child}function yv(n,i,o){switch(i.tag){case 3:yp(i),Ss();break;case 5:zh(i);break;case 1:Un(i.type)&&Ra(i);break;case 4:Yu(i,i.stateNode.containerInfo);break;case 10:var u=i.type._context,d=i.memoizedProps.value;It(Ia,u._currentValue),u._currentValue=d;break;case 13:if(u=i.memoizedState,u!==null)return u.dehydrated!==null?(It(kt,kt.current&1),i.flags|=128,null):o&i.child.childLanes?Mp(n,i,o):(It(kt,kt.current&1),n=Oi(n,i,o),n!==null?n.sibling:null);It(kt,kt.current&1);break;case 19:if(u=(o&i.childLanes)!==0,n.flags&128){if(u)return Tp(n,i,o);i.flags|=128}if(d=i.memoizedState,d!==null&&(d.rendering=null,d.tail=null,d.lastEffect=null),It(kt,kt.current),u)break;return null;case 22:case 23:return i.lanes=0,_p(n,i,o)}return Oi(n,i,o)}var wp,mc,Ap,Cp;wp=function(n,i){for(var o=i.child;o!==null;){if(o.tag===5||o.tag===6)n.appendChild(o.stateNode);else if(o.tag!==4&&o.child!==null){o.child.return=o,o=o.child;continue}if(o===i)break;for(;o.sibling===null;){if(o.return===null||o.return===i)return;o=o.return}o.sibling.return=o.return,o=o.sibling}},mc=function(){},Ap=function(n,i,o,u){var d=n.memoizedProps;if(d!==u){n=i.stateNode,Br(yi.current);var p=null;switch(o){case"input":d=Y(n,d),u=Y(n,u),p=[];break;case"select":d=re({},d,{value:void 0}),u=re({},u,{value:void 0}),p=[];break;case"textarea":d=w(n,d),u=w(n,u),p=[];break;default:typeof d.onClick!="function"&&typeof u.onClick=="function"&&(n.onclick=wa)}ft(o,u);var E;o=null;for(ee in d)if(!u.hasOwnProperty(ee)&&d.hasOwnProperty(ee)&&d[ee]!=null)if(ee==="style"){var U=d[ee];for(E in U)U.hasOwnProperty(E)&&(o||(o={}),o[E]="")}else ee!=="dangerouslySetInnerHTML"&&ee!=="children"&&ee!=="suppressContentEditableWarning"&&ee!=="suppressHydrationWarning"&&ee!=="autoFocus"&&(a.hasOwnProperty(ee)?p||(p=[]):(p=p||[]).push(ee,null));for(ee in u){var z=u[ee];if(U=d!=null?d[ee]:void 0,u.hasOwnProperty(ee)&&z!==U&&(z!=null||U!=null))if(ee==="style")if(U){for(E in U)!U.hasOwnProperty(E)||z&&z.hasOwnProperty(E)||(o||(o={}),o[E]="");for(E in z)z.hasOwnProperty(E)&&U[E]!==z[E]&&(o||(o={}),o[E]=z[E])}else o||(p||(p=[]),p.push(ee,o)),o=z;else ee==="dangerouslySetInnerHTML"?(z=z?z.__html:void 0,U=U?U.__html:void 0,z!=null&&U!==z&&(p=p||[]).push(ee,z)):ee==="children"?typeof z!="string"&&typeof z!="number"||(p=p||[]).push(ee,""+z):ee!=="suppressContentEditableWarning"&&ee!=="suppressHydrationWarning"&&(a.hasOwnProperty(ee)?(z!=null&&ee==="onScroll"&&Ft("scroll",n),p||U===z||(p=[])):(p=p||[]).push(ee,z))}o&&(p=p||[]).push("style",o);var ee=p;(i.updateQueue=ee)&&(i.flags|=4)}},Cp=function(n,i,o,u){o!==u&&(i.flags|=4)};function Oo(n,i){if(!zt)switch(n.tailMode){case"hidden":i=n.tail;for(var o=null;i!==null;)i.alternate!==null&&(o=i),i=i.sibling;o===null?n.tail=null:o.sibling=null;break;case"collapsed":o=n.tail;for(var u=null;o!==null;)o.alternate!==null&&(u=o),o=o.sibling;u===null?i||n.tail===null?n.tail=null:n.tail.sibling=null:u.sibling=null}}function hn(n){var i=n.alternate!==null&&n.alternate.child===n.child,o=0,u=0;if(i)for(var d=n.child;d!==null;)o|=d.lanes|d.childLanes,u|=d.subtreeFlags&14680064,u|=d.flags&14680064,d.return=n,d=d.sibling;else for(d=n.child;d!==null;)o|=d.lanes|d.childLanes,u|=d.subtreeFlags,u|=d.flags,d.return=n,d=d.sibling;return n.subtreeFlags|=u,n.childLanes=o,i}function Sv(n,i,o){var u=i.pendingProps;switch(Ou(i),i.tag){case 2:case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return hn(i),null;case 1:return Un(i.type)&&Ca(),hn(i),null;case 3:return u=i.stateNode,ws(),Ot(Dn),Ot(fn),Ku(),u.pendingContext&&(u.context=u.pendingContext,u.pendingContext=null),(n===null||n.child===null)&&(Da(i)?i.flags|=4:n===null||n.memoizedState.isDehydrated&&!(i.flags&256)||(i.flags|=1024,oi!==null&&(Ac(oi),oi=null))),mc(n,i),hn(i),null;case 5:qu(i);var d=Br(Do.current);if(o=i.type,n!==null&&i.stateNode!=null)Ap(n,i,o,u,d),n.ref!==i.ref&&(i.flags|=512,i.flags|=2097152);else{if(!u){if(i.stateNode===null)throw Error(t(166));return hn(i),null}if(n=Br(yi.current),Da(i)){u=i.stateNode,o=i.type;var p=i.memoizedProps;switch(u[xi]=i,u[Co]=p,n=(i.mode&1)!==0,o){case"dialog":Ft("cancel",u),Ft("close",u);break;case"iframe":case"object":case"embed":Ft("load",u);break;case"video":case"audio":for(d=0;d<To.length;d++)Ft(To[d],u);break;case"source":Ft("error",u);break;case"img":case"image":case"link":Ft("error",u),Ft("load",u);break;case"details":Ft("toggle",u);break;case"input":vn(u,p),Ft("invalid",u);break;case"select":u._wrapperState={wasMultiple:!!p.multiple},Ft("invalid",u);break;case"textarea":Z(u,p),Ft("invalid",u)}ft(o,p),d=null;for(var E in p)if(p.hasOwnProperty(E)){var U=p[E];E==="children"?typeof U=="string"?u.textContent!==U&&(p.suppressHydrationWarning!==!0&&Ta(u.textContent,U,n),d=["children",U]):typeof U=="number"&&u.textContent!==""+U&&(p.suppressHydrationWarning!==!0&&Ta(u.textContent,U,n),d=["children",""+U]):a.hasOwnProperty(E)&&U!=null&&E==="onScroll"&&Ft("scroll",u)}switch(o){case"input":Ct(u),$e(u,p,!0);break;case"textarea":Ct(u),_e(u);break;case"select":case"option":break;default:typeof p.onClick=="function"&&(u.onclick=wa)}u=d,i.updateQueue=u,u!==null&&(i.flags|=4)}else{E=d.nodeType===9?d:d.ownerDocument,n==="http://www.w3.org/1999/xhtml"&&(n=de(o)),n==="http://www.w3.org/1999/xhtml"?o==="script"?(n=E.createElement("div"),n.innerHTML="<script><\/script>",n=n.removeChild(n.firstChild)):typeof u.is=="string"?n=E.createElement(o,{is:u.is}):(n=E.createElement(o),o==="select"&&(E=n,u.multiple?E.multiple=!0:u.size&&(E.size=u.size))):n=E.createElementNS(n,o),n[xi]=i,n[Co]=u,wp(n,i,!1,!1),i.stateNode=n;e:{switch(E=rt(o,u),o){case"dialog":Ft("cancel",n),Ft("close",n),d=u;break;case"iframe":case"object":case"embed":Ft("load",n),d=u;break;case"video":case"audio":for(d=0;d<To.length;d++)Ft(To[d],n);d=u;break;case"source":Ft("error",n),d=u;break;case"img":case"image":case"link":Ft("error",n),Ft("load",n),d=u;break;case"details":Ft("toggle",n),d=u;break;case"input":vn(n,u),d=Y(n,u),Ft("invalid",n);break;case"option":d=u;break;case"select":n._wrapperState={wasMultiple:!!u.multiple},d=re({},u,{value:void 0}),Ft("invalid",n);break;case"textarea":Z(n,u),d=w(n,u),Ft("invalid",n);break;default:d=u}ft(o,d),U=d;for(p in U)if(U.hasOwnProperty(p)){var z=U[p];p==="style"?et(n,z):p==="dangerouslySetInnerHTML"?(z=z?z.__html:void 0,z!=null&&Ne(n,z)):p==="children"?typeof z=="string"?(o!=="textarea"||z!=="")&&ut(n,z):typeof z=="number"&&ut(n,""+z):p!=="suppressContentEditableWarning"&&p!=="suppressHydrationWarning"&&p!=="autoFocus"&&(a.hasOwnProperty(p)?z!=null&&p==="onScroll"&&Ft("scroll",n):z!=null&&L(n,p,z,E))}switch(o){case"input":Ct(n),$e(n,u,!1);break;case"textarea":Ct(n),_e(n);break;case"option":u.value!=null&&n.setAttribute("value",""+Ae(u.value));break;case"select":n.multiple=!!u.multiple,p=u.value,p!=null?D(n,!!u.multiple,p,!1):u.defaultValue!=null&&D(n,!!u.multiple,u.defaultValue,!0);break;default:typeof d.onClick=="function"&&(n.onclick=wa)}switch(o){case"button":case"input":case"select":case"textarea":u=!!u.autoFocus;break e;case"img":u=!0;break e;default:u=!1}}u&&(i.flags|=4)}i.ref!==null&&(i.flags|=512,i.flags|=2097152)}return hn(i),null;case 6:if(n&&i.stateNode!=null)Cp(n,i,n.memoizedProps,u);else{if(typeof u!="string"&&i.stateNode===null)throw Error(t(166));if(o=Br(Do.current),Br(yi.current),Da(i)){if(u=i.stateNode,o=i.memoizedProps,u[xi]=i,(p=u.nodeValue!==o)&&(n=Hn,n!==null))switch(n.tag){case 3:Ta(u.nodeValue,o,(n.mode&1)!==0);break;case 5:n.memoizedProps.suppressHydrationWarning!==!0&&Ta(u.nodeValue,o,(n.mode&1)!==0)}p&&(i.flags|=4)}else u=(o.nodeType===9?o:o.ownerDocument).createTextNode(u),u[xi]=i,i.stateNode=u}return hn(i),null;case 13:if(Ot(kt),u=i.memoizedState,n===null||n.memoizedState!==null&&n.memoizedState.dehydrated!==null){if(zt&&Vn!==null&&i.mode&1&&!(i.flags&128))Ph(),Ss(),i.flags|=98560,p=!1;else if(p=Da(i),u!==null&&u.dehydrated!==null){if(n===null){if(!p)throw Error(t(318));if(p=i.memoizedState,p=p!==null?p.dehydrated:null,!p)throw Error(t(317));p[xi]=i}else Ss(),!(i.flags&128)&&(i.memoizedState=null),i.flags|=4;hn(i),p=!1}else oi!==null&&(Ac(oi),oi=null),p=!0;if(!p)return i.flags&65536?i:null}return i.flags&128?(i.lanes=o,i):(u=u!==null,u!==(n!==null&&n.memoizedState!==null)&&u&&(i.child.flags|=8192,i.mode&1&&(n===null||kt.current&1?Zt===0&&(Zt=3):bc())),i.updateQueue!==null&&(i.flags|=4),hn(i),null);case 4:return ws(),mc(n,i),n===null&&wo(i.stateNode.containerInfo),hn(i),null;case 10:return Gu(i.type._context),hn(i),null;case 17:return Un(i.type)&&Ca(),hn(i),null;case 19:if(Ot(kt),p=i.memoizedState,p===null)return hn(i),null;if(u=(i.flags&128)!==0,E=p.rendering,E===null)if(u)Oo(p,!1);else{if(Zt!==0||n!==null&&n.flags&128)for(n=i.child;n!==null;){if(E=za(n),E!==null){for(i.flags|=128,Oo(p,!1),u=E.updateQueue,u!==null&&(i.updateQueue=u,i.flags|=4),i.subtreeFlags=0,u=o,o=i.child;o!==null;)p=o,n=u,p.flags&=14680066,E=p.alternate,E===null?(p.childLanes=0,p.lanes=n,p.child=null,p.subtreeFlags=0,p.memoizedProps=null,p.memoizedState=null,p.updateQueue=null,p.dependencies=null,p.stateNode=null):(p.childLanes=E.childLanes,p.lanes=E.lanes,p.child=E.child,p.subtreeFlags=0,p.deletions=null,p.memoizedProps=E.memoizedProps,p.memoizedState=E.memoizedState,p.updateQueue=E.updateQueue,p.type=E.type,n=E.dependencies,p.dependencies=n===null?null:{lanes:n.lanes,firstContext:n.firstContext}),o=o.sibling;return It(kt,kt.current&1|2),i.child}n=n.sibling}p.tail!==null&&Me()>bs&&(i.flags|=128,u=!0,Oo(p,!1),i.lanes=4194304)}else{if(!u)if(n=za(E),n!==null){if(i.flags|=128,u=!0,o=n.updateQueue,o!==null&&(i.updateQueue=o,i.flags|=4),Oo(p,!0),p.tail===null&&p.tailMode==="hidden"&&!E.alternate&&!zt)return hn(i),null}else 2*Me()-p.renderingStartTime>bs&&o!==1073741824&&(i.flags|=128,u=!0,Oo(p,!1),i.lanes=4194304);p.isBackwards?(E.sibling=i.child,i.child=E):(o=p.last,o!==null?o.sibling=E:i.child=E,p.last=E)}return p.tail!==null?(i=p.tail,p.rendering=i,p.tail=i.sibling,p.renderingStartTime=Me(),i.sibling=null,o=kt.current,It(kt,u?o&1|2:o&1),i):(hn(i),null);case 22:case 23:return Rc(),u=i.memoizedState!==null,n!==null&&n.memoizedState!==null!==u&&(i.flags|=8192),u&&i.mode&1?Gn&1073741824&&(hn(i),i.subtreeFlags&6&&(i.flags|=8192)):hn(i),null;case 24:return null;case 25:return null}throw Error(t(156,i.tag))}function Mv(n,i){switch(Ou(i),i.tag){case 1:return Un(i.type)&&Ca(),n=i.flags,n&65536?(i.flags=n&-65537|128,i):null;case 3:return ws(),Ot(Dn),Ot(fn),Ku(),n=i.flags,n&65536&&!(n&128)?(i.flags=n&-65537|128,i):null;case 5:return qu(i),null;case 13:if(Ot(kt),n=i.memoizedState,n!==null&&n.dehydrated!==null){if(i.alternate===null)throw Error(t(340));Ss()}return n=i.flags,n&65536?(i.flags=n&-65537|128,i):null;case 19:return Ot(kt),null;case 4:return ws(),null;case 10:return Gu(i.type._context),null;case 22:case 23:return Rc(),null;case 24:return null;default:return null}}var Ya=!1,pn=!1,Ev=typeof WeakSet=="function"?WeakSet:Set,Fe=null;function Cs(n,i){var o=n.ref;if(o!==null)if(typeof o=="function")try{o(null)}catch(u){Ht(n,i,u)}else o.current=null}function gc(n,i,o){try{o()}catch(u){Ht(n,i,u)}}var Rp=!1;function Tv(n,i){if(Ru=ha,n=oh(),yu(n)){if("selectionStart"in n)var o={start:n.selectionStart,end:n.selectionEnd};else e:{o=(o=n.ownerDocument)&&o.defaultView||window;var u=o.getSelection&&o.getSelection();if(u&&u.rangeCount!==0){o=u.anchorNode;var d=u.anchorOffset,p=u.focusNode;u=u.focusOffset;try{o.nodeType,p.nodeType}catch{o=null;break e}var E=0,U=-1,z=-1,ee=0,ve=0,ye=n,ge=null;t:for(;;){for(var Ue;ye!==o||d!==0&&ye.nodeType!==3||(U=E+d),ye!==p||u!==0&&ye.nodeType!==3||(z=E+u),ye.nodeType===3&&(E+=ye.nodeValue.length),(Ue=ye.firstChild)!==null;)ge=ye,ye=Ue;for(;;){if(ye===n)break t;if(ge===o&&++ee===d&&(U=E),ge===p&&++ve===u&&(z=E),(Ue=ye.nextSibling)!==null)break;ye=ge,ge=ye.parentNode}ye=Ue}o=U===-1||z===-1?null:{start:U,end:z}}else o=null}o=o||{start:0,end:0}}else o=null;for(bu={focusedElem:n,selectionRange:o},ha=!1,Fe=i;Fe!==null;)if(i=Fe,n=i.child,(i.subtreeFlags&1028)!==0&&n!==null)n.return=i,Fe=n;else for(;Fe!==null;){i=Fe;try{var ke=i.alternate;if(i.flags&1024)switch(i.tag){case 0:case 11:case 15:break;case 1:if(ke!==null){var He=ke.memoizedProps,Gt=ke.memoizedState,q=i.stateNode,H=q.getSnapshotBeforeUpdate(i.elementType===i.type?He:ai(i.type,He),Gt);q.__reactInternalSnapshotBeforeUpdate=H}break;case 3:var K=i.stateNode.containerInfo;K.nodeType===1?K.textContent="":K.nodeType===9&&K.documentElement&&K.removeChild(K.documentElement);break;case 5:case 6:case 4:case 17:break;default:throw Error(t(163))}}catch(Te){Ht(i,i.return,Te)}if(n=i.sibling,n!==null){n.return=i.return,Fe=n;break}Fe=i.return}return ke=Rp,Rp=!1,ke}function zo(n,i,o){var u=i.updateQueue;if(u=u!==null?u.lastEffect:null,u!==null){var d=u=u.next;do{if((d.tag&n)===n){var p=d.destroy;d.destroy=void 0,p!==void 0&&gc(i,o,p)}d=d.next}while(d!==u)}}function qa(n,i){if(i=i.updateQueue,i=i!==null?i.lastEffect:null,i!==null){var o=i=i.next;do{if((o.tag&n)===n){var u=o.create;o.destroy=u()}o=o.next}while(o!==i)}}function _c(n){var i=n.ref;if(i!==null){var o=n.stateNode;switch(n.tag){case 5:n=o;break;default:n=o}typeof i=="function"?i(n):i.current=n}}function bp(n){var i=n.alternate;i!==null&&(n.alternate=null,bp(i)),n.child=null,n.deletions=null,n.sibling=null,n.tag===5&&(i=n.stateNode,i!==null&&(delete i[xi],delete i[Co],delete i[Uu],delete i[ov],delete i[av])),n.stateNode=null,n.return=null,n.dependencies=null,n.memoizedProps=null,n.memoizedState=null,n.pendingProps=null,n.stateNode=null,n.updateQueue=null}function Pp(n){return n.tag===5||n.tag===3||n.tag===4}function Lp(n){e:for(;;){for(;n.sibling===null;){if(n.return===null||Pp(n.return))return null;n=n.return}for(n.sibling.return=n.return,n=n.sibling;n.tag!==5&&n.tag!==6&&n.tag!==18;){if(n.flags&2||n.child===null||n.tag===4)continue e;n.child.return=n,n=n.child}if(!(n.flags&2))return n.stateNode}}function vc(n,i,o){var u=n.tag;if(u===5||u===6)n=n.stateNode,i?o.nodeType===8?o.parentNode.insertBefore(n,i):o.insertBefore(n,i):(o.nodeType===8?(i=o.parentNode,i.insertBefore(n,o)):(i=o,i.appendChild(n)),o=o._reactRootContainer,o!=null||i.onclick!==null||(i.onclick=wa));else if(u!==4&&(n=n.child,n!==null))for(vc(n,i,o),n=n.sibling;n!==null;)vc(n,i,o),n=n.sibling}function xc(n,i,o){var u=n.tag;if(u===5||u===6)n=n.stateNode,i?o.insertBefore(n,i):o.appendChild(n);else if(u!==4&&(n=n.child,n!==null))for(xc(n,i,o),n=n.sibling;n!==null;)xc(n,i,o),n=n.sibling}var an=null,li=!1;function cr(n,i,o){for(o=o.child;o!==null;)Dp(n,i,o),o=o.sibling}function Dp(n,i,o){if(gt&&typeof gt.onCommitFiberUnmount=="function")try{gt.onCommitFiberUnmount(Et,o)}catch{}switch(o.tag){case 5:pn||Cs(o,i);case 6:var u=an,d=li;an=null,cr(n,i,o),an=u,li=d,an!==null&&(li?(n=an,o=o.stateNode,n.nodeType===8?n.parentNode.removeChild(o):n.removeChild(o)):an.removeChild(o.stateNode));break;case 18:an!==null&&(li?(n=an,o=o.stateNode,n.nodeType===8?Du(n.parentNode,o):n.nodeType===1&&Du(n,o),go(n)):Du(an,o.stateNode));break;case 4:u=an,d=li,an=o.stateNode.containerInfo,li=!0,cr(n,i,o),an=u,li=d;break;case 0:case 11:case 14:case 15:if(!pn&&(u=o.updateQueue,u!==null&&(u=u.lastEffect,u!==null))){d=u=u.next;do{var p=d,E=p.destroy;p=p.tag,E!==void 0&&(p&2||p&4)&&gc(o,i,E),d=d.next}while(d!==u)}cr(n,i,o);break;case 1:if(!pn&&(Cs(o,i),u=o.stateNode,typeof u.componentWillUnmount=="function"))try{u.props=o.memoizedProps,u.state=o.memoizedState,u.componentWillUnmount()}catch(U){Ht(o,i,U)}cr(n,i,o);break;case 21:cr(n,i,o);break;case 22:o.mode&1?(pn=(u=pn)||o.memoizedState!==null,cr(n,i,o),pn=u):cr(n,i,o);break;default:cr(n,i,o)}}function Up(n){var i=n.updateQueue;if(i!==null){n.updateQueue=null;var o=n.stateNode;o===null&&(o=n.stateNode=new Ev),i.forEach(function(u){var d=Uv.bind(null,n,u);o.has(u)||(o.add(u),u.then(d,d))})}}function ui(n,i){var o=i.deletions;if(o!==null)for(var u=0;u<o.length;u++){var d=o[u];try{var p=n,E=i,U=E;e:for(;U!==null;){switch(U.tag){case 5:an=U.stateNode,li=!1;break e;case 3:an=U.stateNode.containerInfo,li=!0;break e;case 4:an=U.stateNode.containerInfo,li=!0;break e}U=U.return}if(an===null)throw Error(t(160));Dp(p,E,d),an=null,li=!1;var z=d.alternate;z!==null&&(z.return=null),d.return=null}catch(ee){Ht(d,i,ee)}}if(i.subtreeFlags&12854)for(i=i.child;i!==null;)Ip(i,n),i=i.sibling}function Ip(n,i){var o=n.alternate,u=n.flags;switch(n.tag){case 0:case 11:case 14:case 15:if(ui(i,n),Mi(n),u&4){try{zo(3,n,n.return),qa(3,n)}catch(He){Ht(n,n.return,He)}try{zo(5,n,n.return)}catch(He){Ht(n,n.return,He)}}break;case 1:ui(i,n),Mi(n),u&512&&o!==null&&Cs(o,o.return);break;case 5:if(ui(i,n),Mi(n),u&512&&o!==null&&Cs(o,o.return),n.flags&32){var d=n.stateNode;try{ut(d,"")}catch(He){Ht(n,n.return,He)}}if(u&4&&(d=n.stateNode,d!=null)){var p=n.memoizedProps,E=o!==null?o.memoizedProps:p,U=n.type,z=n.updateQueue;if(n.updateQueue=null,z!==null)try{U==="input"&&p.type==="radio"&&p.name!=null&&ht(d,p),rt(U,E);var ee=rt(U,p);for(E=0;E<z.length;E+=2){var ve=z[E],ye=z[E+1];ve==="style"?et(d,ye):ve==="dangerouslySetInnerHTML"?Ne(d,ye):ve==="children"?ut(d,ye):L(d,ve,ye,ee)}switch(U){case"input":ct(d,p);break;case"textarea":pe(d,p);break;case"select":var ge=d._wrapperState.wasMultiple;d._wrapperState.wasMultiple=!!p.multiple;var Ue=p.value;Ue!=null?D(d,!!p.multiple,Ue,!1):ge!==!!p.multiple&&(p.defaultValue!=null?D(d,!!p.multiple,p.defaultValue,!0):D(d,!!p.multiple,p.multiple?[]:"",!1))}d[Co]=p}catch(He){Ht(n,n.return,He)}}break;case 6:if(ui(i,n),Mi(n),u&4){if(n.stateNode===null)throw Error(t(162));d=n.stateNode,p=n.memoizedProps;try{d.nodeValue=p}catch(He){Ht(n,n.return,He)}}break;case 3:if(ui(i,n),Mi(n),u&4&&o!==null&&o.memoizedState.isDehydrated)try{go(i.containerInfo)}catch(He){Ht(n,n.return,He)}break;case 4:ui(i,n),Mi(n);break;case 13:ui(i,n),Mi(n),d=n.child,d.flags&8192&&(p=d.memoizedState!==null,d.stateNode.isHidden=p,!p||d.alternate!==null&&d.alternate.memoizedState!==null||(Mc=Me())),u&4&&Up(n);break;case 22:if(ve=o!==null&&o.memoizedState!==null,n.mode&1?(pn=(ee=pn)||ve,ui(i,n),pn=ee):ui(i,n),Mi(n),u&8192){if(ee=n.memoizedState!==null,(n.stateNode.isHidden=ee)&&!ve&&n.mode&1)for(Fe=n,ve=n.child;ve!==null;){for(ye=Fe=ve;Fe!==null;){switch(ge=Fe,Ue=ge.child,ge.tag){case 0:case 11:case 14:case 15:zo(4,ge,ge.return);break;case 1:Cs(ge,ge.return);var ke=ge.stateNode;if(typeof ke.componentWillUnmount=="function"){u=ge,o=ge.return;try{i=u,ke.props=i.memoizedProps,ke.state=i.memoizedState,ke.componentWillUnmount()}catch(He){Ht(u,o,He)}}break;case 5:Cs(ge,ge.return);break;case 22:if(ge.memoizedState!==null){Op(ye);continue}}Ue!==null?(Ue.return=ge,Fe=Ue):Op(ye)}ve=ve.sibling}e:for(ve=null,ye=n;;){if(ye.tag===5){if(ve===null){ve=ye;try{d=ye.stateNode,ee?(p=d.style,typeof p.setProperty=="function"?p.setProperty("display","none","important"):p.display="none"):(U=ye.stateNode,z=ye.memoizedProps.style,E=z!=null&&z.hasOwnProperty("display")?z.display:null,U.style.display=Je("display",E))}catch(He){Ht(n,n.return,He)}}}else if(ye.tag===6){if(ve===null)try{ye.stateNode.nodeValue=ee?"":ye.memoizedProps}catch(He){Ht(n,n.return,He)}}else if((ye.tag!==22&&ye.tag!==23||ye.memoizedState===null||ye===n)&&ye.child!==null){ye.child.return=ye,ye=ye.child;continue}if(ye===n)break e;for(;ye.sibling===null;){if(ye.return===null||ye.return===n)break e;ve===ye&&(ve=null),ye=ye.return}ve===ye&&(ve=null),ye.sibling.return=ye.return,ye=ye.sibling}}break;case 19:ui(i,n),Mi(n),u&4&&Up(n);break;case 21:break;default:ui(i,n),Mi(n)}}function Mi(n){var i=n.flags;if(i&2){try{e:{for(var o=n.return;o!==null;){if(Pp(o)){var u=o;break e}o=o.return}throw Error(t(160))}switch(u.tag){case 5:var d=u.stateNode;u.flags&32&&(ut(d,""),u.flags&=-33);var p=Lp(n);xc(n,p,d);break;case 3:case 4:var E=u.stateNode.containerInfo,U=Lp(n);vc(n,U,E);break;default:throw Error(t(161))}}catch(z){Ht(n,n.return,z)}n.flags&=-3}i&4096&&(n.flags&=-4097)}function wv(n,i,o){Fe=n,Np(n)}function Np(n,i,o){for(var u=(n.mode&1)!==0;Fe!==null;){var d=Fe,p=d.child;if(d.tag===22&&u){var E=d.memoizedState!==null||Ya;if(!E){var U=d.alternate,z=U!==null&&U.memoizedState!==null||pn;U=Ya;var ee=pn;if(Ya=E,(pn=z)&&!ee)for(Fe=d;Fe!==null;)E=Fe,z=E.child,E.tag===22&&E.memoizedState!==null?zp(d):z!==null?(z.return=E,Fe=z):zp(d);for(;p!==null;)Fe=p,Np(p),p=p.sibling;Fe=d,Ya=U,pn=ee}Fp(n)}else d.subtreeFlags&8772&&p!==null?(p.return=d,Fe=p):Fp(n)}}function Fp(n){for(;Fe!==null;){var i=Fe;if(i.flags&8772){var o=i.alternate;try{if(i.flags&8772)switch(i.tag){case 0:case 11:case 15:pn||qa(5,i);break;case 1:var u=i.stateNode;if(i.flags&4&&!pn)if(o===null)u.componentDidMount();else{var d=i.elementType===i.type?o.memoizedProps:ai(i.type,o.memoizedProps);u.componentDidUpdate(d,o.memoizedState,u.__reactInternalSnapshotBeforeUpdate)}var p=i.updateQueue;p!==null&&Oh(i,p,u);break;case 3:var E=i.updateQueue;if(E!==null){if(o=null,i.child!==null)switch(i.child.tag){case 5:o=i.child.stateNode;break;case 1:o=i.child.stateNode}Oh(i,E,o)}break;case 5:var U=i.stateNode;if(o===null&&i.flags&4){o=U;var z=i.memoizedProps;switch(i.type){case"button":case"input":case"select":case"textarea":z.autoFocus&&o.focus();break;case"img":z.src&&(o.src=z.src)}}break;case 6:break;case 4:break;case 12:break;case 13:if(i.memoizedState===null){var ee=i.alternate;if(ee!==null){var ve=ee.memoizedState;if(ve!==null){var ye=ve.dehydrated;ye!==null&&go(ye)}}}break;case 19:case 17:case 21:case 22:case 23:case 25:break;default:throw Error(t(163))}pn||i.flags&512&&_c(i)}catch(ge){Ht(i,i.return,ge)}}if(i===n){Fe=null;break}if(o=i.sibling,o!==null){o.return=i.return,Fe=o;break}Fe=i.return}}function Op(n){for(;Fe!==null;){var i=Fe;if(i===n){Fe=null;break}var o=i.sibling;if(o!==null){o.return=i.return,Fe=o;break}Fe=i.return}}function zp(n){for(;Fe!==null;){var i=Fe;try{switch(i.tag){case 0:case 11:case 15:var o=i.return;try{qa(4,i)}catch(z){Ht(i,o,z)}break;case 1:var u=i.stateNode;if(typeof u.componentDidMount=="function"){var d=i.return;try{u.componentDidMount()}catch(z){Ht(i,d,z)}}var p=i.return;try{_c(i)}catch(z){Ht(i,p,z)}break;case 5:var E=i.return;try{_c(i)}catch(z){Ht(i,E,z)}}}catch(z){Ht(i,i.return,z)}if(i===n){Fe=null;break}var U=i.sibling;if(U!==null){U.return=i.return,Fe=U;break}Fe=i.return}}var Av=Math.ceil,$a=C.ReactCurrentDispatcher,yc=C.ReactCurrentOwner,Qn=C.ReactCurrentBatchConfig,xt=0,nn=null,Wt=null,ln=0,Gn=0,Rs=sr(0),Zt=0,ko=null,Vr=0,Ka=0,Sc=0,Bo=null,Nn=null,Mc=0,bs=1/0,zi=null,Za=!1,Ec=null,fr=null,Qa=!1,dr=null,Ja=0,Ho=0,Tc=null,el=-1,tl=0;function Mn(){return xt&6?Me():el!==-1?el:el=Me()}function hr(n){return n.mode&1?xt&2&&ln!==0?ln&-ln:uv.transition!==null?(tl===0&&(tl=yn()),tl):(n=At,n!==0||(n=window.event,n=n===void 0?16:Bd(n.type)),n):1}function ci(n,i,o,u){if(50<Ho)throw Ho=0,Tc=null,Error(t(185));Ln(n,o,u),(!(xt&2)||n!==nn)&&(n===nn&&(!(xt&2)&&(Ka|=o),Zt===4&&pr(n,ln)),Fn(n,u),o===1&&xt===0&&!(i.mode&1)&&(bs=Me()+500,ba&&ar()))}function Fn(n,i){var o=n.callbackNode;jn(n,i);var u=vi(n,n===nn?ln:0);if(u===0)o!==null&&ne(o),n.callbackNode=null,n.callbackPriority=0;else if(i=u&-u,n.callbackPriority!==i){if(o!=null&&ne(o),i===1)n.tag===0?lv(Bp.bind(null,n)):wh(Bp.bind(null,n)),rv(function(){!(xt&6)&&ar()}),o=null;else{switch(Dd(u)){case 1:o=Be;break;case 4:o=tt;break;case 16:o=it;break;case 536870912:o=_t;break;default:o=it}o=qp(o,kp.bind(null,n))}n.callbackPriority=i,n.callbackNode=o}}function kp(n,i){if(el=-1,tl=0,xt&6)throw Error(t(327));var o=n.callbackNode;if(Ps()&&n.callbackNode!==o)return null;var u=vi(n,n===nn?ln:0);if(u===0)return null;if(u&30||u&n.expiredLanes||i)i=nl(n,u);else{i=u;var d=xt;xt|=2;var p=Vp();(nn!==n||ln!==i)&&(zi=null,bs=Me()+500,Wr(n,i));do try{bv();break}catch(U){Hp(n,U)}while(!0);Vu(),$a.current=p,xt=d,Wt!==null?i=0:(nn=null,ln=0,i=Zt)}if(i!==0){if(i===2&&(d=Pi(n),d!==0&&(u=d,i=wc(n,d))),i===1)throw o=ko,Wr(n,0),pr(n,u),Fn(n,Me()),o;if(i===6)pr(n,u);else{if(d=n.current.alternate,!(u&30)&&!Cv(d)&&(i=nl(n,u),i===2&&(p=Pi(n),p!==0&&(u=p,i=wc(n,p))),i===1))throw o=ko,Wr(n,0),pr(n,u),Fn(n,Me()),o;switch(n.finishedWork=d,n.finishedLanes=u,i){case 0:case 1:throw Error(t(345));case 2:Xr(n,Nn,zi);break;case 3:if(pr(n,u),(u&130023424)===u&&(i=Mc+500-Me(),10<i)){if(vi(n,0)!==0)break;if(d=n.suspendedLanes,(d&u)!==u){Mn(),n.pingedLanes|=n.suspendedLanes&d;break}n.timeoutHandle=Lu(Xr.bind(null,n,Nn,zi),i);break}Xr(n,Nn,zi);break;case 4:if(pr(n,u),(u&4194240)===u)break;for(i=n.eventTimes,d=-1;0<u;){var E=31-ot(u);p=1<<E,E=i[E],E>d&&(d=E),u&=~p}if(u=d,u=Me()-u,u=(120>u?120:480>u?480:1080>u?1080:1920>u?1920:3e3>u?3e3:4320>u?4320:1960*Av(u/1960))-u,10<u){n.timeoutHandle=Lu(Xr.bind(null,n,Nn,zi),u);break}Xr(n,Nn,zi);break;case 5:Xr(n,Nn,zi);break;default:throw Error(t(329))}}}return Fn(n,Me()),n.callbackNode===o?kp.bind(null,n):null}function wc(n,i){var o=Bo;return n.current.memoizedState.isDehydrated&&(Wr(n,i).flags|=256),n=nl(n,i),n!==2&&(i=Nn,Nn=o,i!==null&&Ac(i)),n}function Ac(n){Nn===null?Nn=n:Nn.push.apply(Nn,n)}function Cv(n){for(var i=n;;){if(i.flags&16384){var o=i.updateQueue;if(o!==null&&(o=o.stores,o!==null))for(var u=0;u<o.length;u++){var d=o[u],p=d.getSnapshot;d=d.value;try{if(!si(p(),d))return!1}catch{return!1}}}if(o=i.child,i.subtreeFlags&16384&&o!==null)o.return=i,i=o;else{if(i===n)break;for(;i.sibling===null;){if(i.return===null||i.return===n)return!0;i=i.return}i.sibling.return=i.return,i=i.sibling}}return!0}function pr(n,i){for(i&=~Sc,i&=~Ka,n.suspendedLanes|=i,n.pingedLanes&=~i,n=n.expirationTimes;0<i;){var o=31-ot(i),u=1<<o;n[o]=-1,i&=~u}}function Bp(n){if(xt&6)throw Error(t(327));Ps();var i=vi(n,0);if(!(i&1))return Fn(n,Me()),null;var o=nl(n,i);if(n.tag!==0&&o===2){var u=Pi(n);u!==0&&(i=u,o=wc(n,u))}if(o===1)throw o=ko,Wr(n,0),pr(n,i),Fn(n,Me()),o;if(o===6)throw Error(t(345));return n.finishedWork=n.current.alternate,n.finishedLanes=i,Xr(n,Nn,zi),Fn(n,Me()),null}function Cc(n,i){var o=xt;xt|=1;try{return n(i)}finally{xt=o,xt===0&&(bs=Me()+500,ba&&ar())}}function Gr(n){dr!==null&&dr.tag===0&&!(xt&6)&&Ps();var i=xt;xt|=1;var o=Qn.transition,u=At;try{if(Qn.transition=null,At=1,n)return n()}finally{At=u,Qn.transition=o,xt=i,!(xt&6)&&ar()}}function Rc(){Gn=Rs.current,Ot(Rs)}function Wr(n,i){n.finishedWork=null,n.finishedLanes=0;var o=n.timeoutHandle;if(o!==-1&&(n.timeoutHandle=-1,iv(o)),Wt!==null)for(o=Wt.return;o!==null;){var u=o;switch(Ou(u),u.tag){case 1:u=u.type.childContextTypes,u!=null&&Ca();break;case 3:ws(),Ot(Dn),Ot(fn),Ku();break;case 5:qu(u);break;case 4:ws();break;case 13:Ot(kt);break;case 19:Ot(kt);break;case 10:Gu(u.type._context);break;case 22:case 23:Rc()}o=o.return}if(nn=n,Wt=n=mr(n.current,null),ln=Gn=i,Zt=0,ko=null,Sc=Ka=Vr=0,Nn=Bo=null,kr!==null){for(i=0;i<kr.length;i++)if(o=kr[i],u=o.interleaved,u!==null){o.interleaved=null;var d=u.next,p=o.pending;if(p!==null){var E=p.next;p.next=d,u.next=E}o.pending=u}kr=null}return n}function Hp(n,i){do{var o=Wt;try{if(Vu(),ka.current=Ga,Ba){for(var u=Bt.memoizedState;u!==null;){var d=u.queue;d!==null&&(d.pending=null),u=u.next}Ba=!1}if(Hr=0,tn=Kt=Bt=null,Uo=!1,Io=0,yc.current=null,o===null||o.return===null){Zt=1,ko=i,Wt=null;break}e:{var p=n,E=o.return,U=o,z=i;if(i=ln,U.flags|=32768,z!==null&&typeof z=="object"&&typeof z.then=="function"){var ee=z,ve=U,ye=ve.tag;if(!(ve.mode&1)&&(ye===0||ye===11||ye===15)){var ge=ve.alternate;ge?(ve.updateQueue=ge.updateQueue,ve.memoizedState=ge.memoizedState,ve.lanes=ge.lanes):(ve.updateQueue=null,ve.memoizedState=null)}var Ue=dp(E);if(Ue!==null){Ue.flags&=-257,hp(Ue,E,U,p,i),Ue.mode&1&&fp(p,ee,i),i=Ue,z=ee;var ke=i.updateQueue;if(ke===null){var He=new Set;He.add(z),i.updateQueue=He}else ke.add(z);break e}else{if(!(i&1)){fp(p,ee,i),bc();break e}z=Error(t(426))}}else if(zt&&U.mode&1){var Gt=dp(E);if(Gt!==null){!(Gt.flags&65536)&&(Gt.flags|=256),hp(Gt,E,U,p,i),Bu(As(z,U));break e}}p=z=As(z,U),Zt!==4&&(Zt=2),Bo===null?Bo=[p]:Bo.push(p),p=E;do{switch(p.tag){case 3:p.flags|=65536,i&=-i,p.lanes|=i;var q=up(p,z,i);Fh(p,q);break e;case 1:U=z;var H=p.type,K=p.stateNode;if(!(p.flags&128)&&(typeof H.getDerivedStateFromError=="function"||K!==null&&typeof K.componentDidCatch=="function"&&(fr===null||!fr.has(K)))){p.flags|=65536,i&=-i,p.lanes|=i;var Te=cp(p,U,i);Fh(p,Te);break e}}p=p.return}while(p!==null)}Wp(o)}catch(Xe){i=Xe,Wt===o&&o!==null&&(Wt=o=o.return);continue}break}while(!0)}function Vp(){var n=$a.current;return $a.current=Ga,n===null?Ga:n}function bc(){(Zt===0||Zt===3||Zt===2)&&(Zt=4),nn===null||!(Vr&268435455)&&!(Ka&268435455)||pr(nn,ln)}function nl(n,i){var o=xt;xt|=2;var u=Vp();(nn!==n||ln!==i)&&(zi=null,Wr(n,i));do try{Rv();break}catch(d){Hp(n,d)}while(!0);if(Vu(),xt=o,$a.current=u,Wt!==null)throw Error(t(261));return nn=null,ln=0,Zt}function Rv(){for(;Wt!==null;)Gp(Wt)}function bv(){for(;Wt!==null&&!j();)Gp(Wt)}function Gp(n){var i=Yp(n.alternate,n,Gn);n.memoizedProps=n.pendingProps,i===null?Wp(n):Wt=i,yc.current=null}function Wp(n){var i=n;do{var o=i.alternate;if(n=i.return,i.flags&32768){if(o=Mv(o,i),o!==null){o.flags&=32767,Wt=o;return}if(n!==null)n.flags|=32768,n.subtreeFlags=0,n.deletions=null;else{Zt=6,Wt=null;return}}else if(o=Sv(o,i,Gn),o!==null){Wt=o;return}if(i=i.sibling,i!==null){Wt=i;return}Wt=i=n}while(i!==null);Zt===0&&(Zt=5)}function Xr(n,i,o){var u=At,d=Qn.transition;try{Qn.transition=null,At=1,Pv(n,i,o,u)}finally{Qn.transition=d,At=u}return null}function Pv(n,i,o,u){do Ps();while(dr!==null);if(xt&6)throw Error(t(327));o=n.finishedWork;var d=n.finishedLanes;if(o===null)return null;if(n.finishedWork=null,n.finishedLanes=0,o===n.current)throw Error(t(177));n.callbackNode=null,n.callbackPriority=0;var p=o.lanes|o.childLanes;if(ca(n,p),n===nn&&(Wt=nn=null,ln=0),!(o.subtreeFlags&2064)&&!(o.flags&2064)||Qa||(Qa=!0,qp(it,function(){return Ps(),null})),p=(o.flags&15990)!==0,o.subtreeFlags&15990||p){p=Qn.transition,Qn.transition=null;var E=At;At=1;var U=xt;xt|=4,yc.current=null,Tv(n,o),Ip(o,n),K_(bu),ha=!!Ru,bu=Ru=null,n.current=o,wv(o),we(),xt=U,At=E,Qn.transition=p}else n.current=o;if(Qa&&(Qa=!1,dr=n,Ja=d),p=n.pendingLanes,p===0&&(fr=null),un(o.stateNode),Fn(n,Me()),i!==null)for(u=n.onRecoverableError,o=0;o<i.length;o++)d=i[o],u(d.value,{componentStack:d.stack,digest:d.digest});if(Za)throw Za=!1,n=Ec,Ec=null,n;return Ja&1&&n.tag!==0&&Ps(),p=n.pendingLanes,p&1?n===Tc?Ho++:(Ho=0,Tc=n):Ho=0,ar(),null}function Ps(){if(dr!==null){var n=Dd(Ja),i=Qn.transition,o=At;try{if(Qn.transition=null,At=16>n?16:n,dr===null)var u=!1;else{if(n=dr,dr=null,Ja=0,xt&6)throw Error(t(331));var d=xt;for(xt|=4,Fe=n.current;Fe!==null;){var p=Fe,E=p.child;if(Fe.flags&16){var U=p.deletions;if(U!==null){for(var z=0;z<U.length;z++){var ee=U[z];for(Fe=ee;Fe!==null;){var ve=Fe;switch(ve.tag){case 0:case 11:case 15:zo(8,ve,p)}var ye=ve.child;if(ye!==null)ye.return=ve,Fe=ye;else for(;Fe!==null;){ve=Fe;var ge=ve.sibling,Ue=ve.return;if(bp(ve),ve===ee){Fe=null;break}if(ge!==null){ge.return=Ue,Fe=ge;break}Fe=Ue}}}var ke=p.alternate;if(ke!==null){var He=ke.child;if(He!==null){ke.child=null;do{var Gt=He.sibling;He.sibling=null,He=Gt}while(He!==null)}}Fe=p}}if(p.subtreeFlags&2064&&E!==null)E.return=p,Fe=E;else e:for(;Fe!==null;){if(p=Fe,p.flags&2048)switch(p.tag){case 0:case 11:case 15:zo(9,p,p.return)}var q=p.sibling;if(q!==null){q.return=p.return,Fe=q;break e}Fe=p.return}}var H=n.current;for(Fe=H;Fe!==null;){E=Fe;var K=E.child;if(E.subtreeFlags&2064&&K!==null)K.return=E,Fe=K;else e:for(E=H;Fe!==null;){if(U=Fe,U.flags&2048)try{switch(U.tag){case 0:case 11:case 15:qa(9,U)}}catch(Xe){Ht(U,U.return,Xe)}if(U===E){Fe=null;break e}var Te=U.sibling;if(Te!==null){Te.return=U.return,Fe=Te;break e}Fe=U.return}}if(xt=d,ar(),gt&&typeof gt.onPostCommitFiberRoot=="function")try{gt.onPostCommitFiberRoot(Et,n)}catch{}u=!0}return u}finally{At=o,Qn.transition=i}}return!1}function Xp(n,i,o){i=As(o,i),i=up(n,i,1),n=ur(n,i,1),i=Mn(),n!==null&&(Ln(n,1,i),Fn(n,i))}function Ht(n,i,o){if(n.tag===3)Xp(n,n,o);else for(;i!==null;){if(i.tag===3){Xp(i,n,o);break}else if(i.tag===1){var u=i.stateNode;if(typeof i.type.getDerivedStateFromError=="function"||typeof u.componentDidCatch=="function"&&(fr===null||!fr.has(u))){n=As(o,n),n=cp(i,n,1),i=ur(i,n,1),n=Mn(),i!==null&&(Ln(i,1,n),Fn(i,n));break}}i=i.return}}function Lv(n,i,o){var u=n.pingCache;u!==null&&u.delete(i),i=Mn(),n.pingedLanes|=n.suspendedLanes&o,nn===n&&(ln&o)===o&&(Zt===4||Zt===3&&(ln&130023424)===ln&&500>Me()-Mc?Wr(n,0):Sc|=o),Fn(n,i)}function jp(n,i){i===0&&(n.mode&1?(i=ri,ri<<=1,!(ri&130023424)&&(ri=4194304)):i=1);var o=Mn();n=Ni(n,i),n!==null&&(Ln(n,i,o),Fn(n,o))}function Dv(n){var i=n.memoizedState,o=0;i!==null&&(o=i.retryLane),jp(n,o)}function Uv(n,i){var o=0;switch(n.tag){case 13:var u=n.stateNode,d=n.memoizedState;d!==null&&(o=d.retryLane);break;case 19:u=n.stateNode;break;default:throw Error(t(314))}u!==null&&u.delete(i),jp(n,o)}var Yp;Yp=function(n,i,o){if(n!==null)if(n.memoizedProps!==i.pendingProps||Dn.current)In=!0;else{if(!(n.lanes&o)&&!(i.flags&128))return In=!1,yv(n,i,o);In=!!(n.flags&131072)}else In=!1,zt&&i.flags&1048576&&Ah(i,La,i.index);switch(i.lanes=0,i.tag){case 2:var u=i.type;ja(n,i),n=i.pendingProps;var d=vs(i,fn.current);Ts(i,o),d=Ju(null,i,u,n,d,o);var p=ec();return i.flags|=1,typeof d=="object"&&d!==null&&typeof d.render=="function"&&d.$$typeof===void 0?(i.tag=1,i.memoizedState=null,i.updateQueue=null,Un(u)?(p=!0,Ra(i)):p=!1,i.memoizedState=d.state!==null&&d.state!==void 0?d.state:null,ju(i),d.updater=Wa,i.stateNode=d,d._reactInternals=i,oc(i,u,n,o),i=cc(null,i,u,!0,p,o)):(i.tag=0,zt&&p&&Fu(i),Sn(null,i,d,o),i=i.child),i;case 16:u=i.elementType;e:{switch(ja(n,i),n=i.pendingProps,d=u._init,u=d(u._payload),i.type=u,d=i.tag=Nv(u),n=ai(u,n),d){case 0:i=uc(null,i,u,n,o);break e;case 1:i=xp(null,i,u,n,o);break e;case 11:i=pp(null,i,u,n,o);break e;case 14:i=mp(null,i,u,ai(u.type,n),o);break e}throw Error(t(306,u,""))}return i;case 0:return u=i.type,d=i.pendingProps,d=i.elementType===u?d:ai(u,d),uc(n,i,u,d,o);case 1:return u=i.type,d=i.pendingProps,d=i.elementType===u?d:ai(u,d),xp(n,i,u,d,o);case 3:e:{if(yp(i),n===null)throw Error(t(387));u=i.pendingProps,p=i.memoizedState,d=p.element,Nh(n,i),Oa(i,u,null,o);var E=i.memoizedState;if(u=E.element,p.isDehydrated)if(p={element:u,isDehydrated:!1,cache:E.cache,pendingSuspenseBoundaries:E.pendingSuspenseBoundaries,transitions:E.transitions},i.updateQueue.baseState=p,i.memoizedState=p,i.flags&256){d=As(Error(t(423)),i),i=Sp(n,i,u,o,d);break e}else if(u!==d){d=As(Error(t(424)),i),i=Sp(n,i,u,o,d);break e}else for(Vn=rr(i.stateNode.containerInfo.firstChild),Hn=i,zt=!0,oi=null,o=Uh(i,null,u,o),i.child=o;o;)o.flags=o.flags&-3|4096,o=o.sibling;else{if(Ss(),u===d){i=Oi(n,i,o);break e}Sn(n,i,u,o)}i=i.child}return i;case 5:return zh(i),n===null&&ku(i),u=i.type,d=i.pendingProps,p=n!==null?n.memoizedProps:null,E=d.children,Pu(u,d)?E=null:p!==null&&Pu(u,p)&&(i.flags|=32),vp(n,i),Sn(n,i,E,o),i.child;case 6:return n===null&&ku(i),null;case 13:return Mp(n,i,o);case 4:return Yu(i,i.stateNode.containerInfo),u=i.pendingProps,n===null?i.child=Ms(i,null,u,o):Sn(n,i,u,o),i.child;case 11:return u=i.type,d=i.pendingProps,d=i.elementType===u?d:ai(u,d),pp(n,i,u,d,o);case 7:return Sn(n,i,i.pendingProps,o),i.child;case 8:return Sn(n,i,i.pendingProps.children,o),i.child;case 12:return Sn(n,i,i.pendingProps.children,o),i.child;case 10:e:{if(u=i.type._context,d=i.pendingProps,p=i.memoizedProps,E=d.value,It(Ia,u._currentValue),u._currentValue=E,p!==null)if(si(p.value,E)){if(p.children===d.children&&!Dn.current){i=Oi(n,i,o);break e}}else for(p=i.child,p!==null&&(p.return=i);p!==null;){var U=p.dependencies;if(U!==null){E=p.child;for(var z=U.firstContext;z!==null;){if(z.context===u){if(p.tag===1){z=Fi(-1,o&-o),z.tag=2;var ee=p.updateQueue;if(ee!==null){ee=ee.shared;var ve=ee.pending;ve===null?z.next=z:(z.next=ve.next,ve.next=z),ee.pending=z}}p.lanes|=o,z=p.alternate,z!==null&&(z.lanes|=o),Wu(p.return,o,i),U.lanes|=o;break}z=z.next}}else if(p.tag===10)E=p.type===i.type?null:p.child;else if(p.tag===18){if(E=p.return,E===null)throw Error(t(341));E.lanes|=o,U=E.alternate,U!==null&&(U.lanes|=o),Wu(E,o,i),E=p.sibling}else E=p.child;if(E!==null)E.return=p;else for(E=p;E!==null;){if(E===i){E=null;break}if(p=E.sibling,p!==null){p.return=E.return,E=p;break}E=E.return}p=E}Sn(n,i,d.children,o),i=i.child}return i;case 9:return d=i.type,u=i.pendingProps.children,Ts(i,o),d=Kn(d),u=u(d),i.flags|=1,Sn(n,i,u,o),i.child;case 14:return u=i.type,d=ai(u,i.pendingProps),d=ai(u.type,d),mp(n,i,u,d,o);case 15:return gp(n,i,i.type,i.pendingProps,o);case 17:return u=i.type,d=i.pendingProps,d=i.elementType===u?d:ai(u,d),ja(n,i),i.tag=1,Un(u)?(n=!0,Ra(i)):n=!1,Ts(i,o),ap(i,u,d),oc(i,u,d,o),cc(null,i,u,!0,n,o);case 19:return Tp(n,i,o);case 22:return _p(n,i,o)}throw Error(t(156,i.tag))};function qp(n,i){return te(n,i)}function Iv(n,i,o,u){this.tag=n,this.key=o,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.ref=null,this.pendingProps=i,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=u,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function Jn(n,i,o,u){return new Iv(n,i,o,u)}function Pc(n){return n=n.prototype,!(!n||!n.isReactComponent)}function Nv(n){if(typeof n=="function")return Pc(n)?1:0;if(n!=null){if(n=n.$$typeof,n===se)return 11;if(n===ce)return 14}return 2}function mr(n,i){var o=n.alternate;return o===null?(o=Jn(n.tag,i,n.key,n.mode),o.elementType=n.elementType,o.type=n.type,o.stateNode=n.stateNode,o.alternate=n,n.alternate=o):(o.pendingProps=i,o.type=n.type,o.flags=0,o.subtreeFlags=0,o.deletions=null),o.flags=n.flags&14680064,o.childLanes=n.childLanes,o.lanes=n.lanes,o.child=n.child,o.memoizedProps=n.memoizedProps,o.memoizedState=n.memoizedState,o.updateQueue=n.updateQueue,i=n.dependencies,o.dependencies=i===null?null:{lanes:i.lanes,firstContext:i.firstContext},o.sibling=n.sibling,o.index=n.index,o.ref=n.ref,o}function il(n,i,o,u,d,p){var E=2;if(u=n,typeof n=="function")Pc(n)&&(E=1);else if(typeof n=="string")E=5;else e:switch(n){case I:return jr(o.children,d,p,i);case B:E=8,d|=8;break;case b:return n=Jn(12,o,i,d|2),n.elementType=b,n.lanes=p,n;case J:return n=Jn(13,o,i,d),n.elementType=J,n.lanes=p,n;case ue:return n=Jn(19,o,i,d),n.elementType=ue,n.lanes=p,n;case oe:return rl(o,d,p,i);default:if(typeof n=="object"&&n!==null)switch(n.$$typeof){case A:E=10;break e;case O:E=9;break e;case se:E=11;break e;case ce:E=14;break e;case $:E=16,u=null;break e}throw Error(t(130,n==null?n:typeof n,""))}return i=Jn(E,o,i,d),i.elementType=n,i.type=u,i.lanes=p,i}function jr(n,i,o,u){return n=Jn(7,n,u,i),n.lanes=o,n}function rl(n,i,o,u){return n=Jn(22,n,u,i),n.elementType=oe,n.lanes=o,n.stateNode={isHidden:!1},n}function Lc(n,i,o){return n=Jn(6,n,null,i),n.lanes=o,n}function Dc(n,i,o){return i=Jn(4,n.children!==null?n.children:[],n.key,i),i.lanes=o,i.stateNode={containerInfo:n.containerInfo,pendingChildren:null,implementation:n.implementation},i}function Fv(n,i,o,u,d){this.tag=i,this.containerInfo=n,this.finishedWork=this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.pendingContext=this.context=null,this.callbackPriority=0,this.eventTimes=Yn(0),this.expirationTimes=Yn(-1),this.entangledLanes=this.finishedLanes=this.mutableReadLanes=this.expiredLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=Yn(0),this.identifierPrefix=u,this.onRecoverableError=d,this.mutableSourceEagerHydrationData=null}function Uc(n,i,o,u,d,p,E,U,z){return n=new Fv(n,i,o,U,z),i===1?(i=1,p===!0&&(i|=8)):i=0,p=Jn(3,null,null,i),n.current=p,p.stateNode=n,p.memoizedState={element:u,isDehydrated:o,cache:null,transitions:null,pendingSuspenseBoundaries:null},ju(p),n}function Ov(n,i,o){var u=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:F,key:u==null?null:""+u,children:n,containerInfo:i,implementation:o}}function $p(n){if(!n)return or;n=n._reactInternals;e:{if(_i(n)!==n||n.tag!==1)throw Error(t(170));var i=n;do{switch(i.tag){case 3:i=i.stateNode.context;break e;case 1:if(Un(i.type)){i=i.stateNode.__reactInternalMemoizedMergedChildContext;break e}}i=i.return}while(i!==null);throw Error(t(171))}if(n.tag===1){var o=n.type;if(Un(o))return Eh(n,o,i)}return i}function Kp(n,i,o,u,d,p,E,U,z){return n=Uc(o,u,!0,n,d,p,E,U,z),n.context=$p(null),o=n.current,u=Mn(),d=hr(o),p=Fi(u,d),p.callback=i??null,ur(o,p,d),n.current.lanes=d,Ln(n,d,u),Fn(n,u),n}function sl(n,i,o,u){var d=i.current,p=Mn(),E=hr(d);return o=$p(o),i.context===null?i.context=o:i.pendingContext=o,i=Fi(p,E),i.payload={element:n},u=u===void 0?null:u,u!==null&&(i.callback=u),n=ur(d,i,E),n!==null&&(ci(n,d,E,p),Fa(n,d,E)),E}function ol(n){if(n=n.current,!n.child)return null;switch(n.child.tag){case 5:return n.child.stateNode;default:return n.child.stateNode}}function Zp(n,i){if(n=n.memoizedState,n!==null&&n.dehydrated!==null){var o=n.retryLane;n.retryLane=o!==0&&o<i?o:i}}function Ic(n,i){Zp(n,i),(n=n.alternate)&&Zp(n,i)}function zv(){return null}var Qp=typeof reportError=="function"?reportError:function(n){console.error(n)};function Nc(n){this._internalRoot=n}al.prototype.render=Nc.prototype.render=function(n){var i=this._internalRoot;if(i===null)throw Error(t(409));sl(n,i,null,null)},al.prototype.unmount=Nc.prototype.unmount=function(){var n=this._internalRoot;if(n!==null){this._internalRoot=null;var i=n.containerInfo;Gr(function(){sl(null,n,null,null)}),i[Li]=null}};function al(n){this._internalRoot=n}al.prototype.unstable_scheduleHydration=function(n){if(n){var i=Nd();n={blockedOn:null,target:n,priority:i};for(var o=0;o<tr.length&&i!==0&&i<tr[o].priority;o++);tr.splice(o,0,n),o===0&&zd(n)}};function Fc(n){return!(!n||n.nodeType!==1&&n.nodeType!==9&&n.nodeType!==11)}function ll(n){return!(!n||n.nodeType!==1&&n.nodeType!==9&&n.nodeType!==11&&(n.nodeType!==8||n.nodeValue!==" react-mount-point-unstable "))}function Jp(){}function kv(n,i,o,u,d){if(d){if(typeof u=="function"){var p=u;u=function(){var ee=ol(E);p.call(ee)}}var E=Kp(i,u,n,0,null,!1,!1,"",Jp);return n._reactRootContainer=E,n[Li]=E.current,wo(n.nodeType===8?n.parentNode:n),Gr(),E}for(;d=n.lastChild;)n.removeChild(d);if(typeof u=="function"){var U=u;u=function(){var ee=ol(z);U.call(ee)}}var z=Uc(n,0,!1,null,null,!1,!1,"",Jp);return n._reactRootContainer=z,n[Li]=z.current,wo(n.nodeType===8?n.parentNode:n),Gr(function(){sl(i,z,o,u)}),z}function ul(n,i,o,u,d){var p=o._reactRootContainer;if(p){var E=p;if(typeof d=="function"){var U=d;d=function(){var z=ol(E);U.call(z)}}sl(i,E,n,d)}else E=kv(o,i,n,d,u);return ol(E)}Ud=function(n){switch(n.tag){case 3:var i=n.stateNode;if(i.current.memoizedState.isDehydrated){var o=$t(i.pendingLanes);o!==0&&(ou(i,o|1),Fn(i,Me()),!(xt&6)&&(bs=Me()+500,ar()))}break;case 13:Gr(function(){var u=Ni(n,1);if(u!==null){var d=Mn();ci(u,n,1,d)}}),Ic(n,1)}},au=function(n){if(n.tag===13){var i=Ni(n,134217728);if(i!==null){var o=Mn();ci(i,n,134217728,o)}Ic(n,134217728)}},Id=function(n){if(n.tag===13){var i=hr(n),o=Ni(n,i);if(o!==null){var u=Mn();ci(o,n,i,u)}Ic(n,i)}},Nd=function(){return At},Fd=function(n,i){var o=At;try{return At=n,i()}finally{At=o}},Re=function(n,i,o){switch(i){case"input":if(ct(n,o),i=o.name,o.type==="radio"&&i!=null){for(o=n;o.parentNode;)o=o.parentNode;for(o=o.querySelectorAll("input[name="+JSON.stringify(""+i)+'][type="radio"]'),i=0;i<o.length;i++){var u=o[i];if(u!==n&&u.form===n.form){var d=Aa(u);if(!d)throw Error(t(90));mt(u),ct(u,d)}}}break;case"textarea":pe(n,o);break;case"select":i=o.value,i!=null&&D(n,!!o.multiple,i,!1)}},Nt=Cc,qt=Gr;var Bv={usingClientEntryPoint:!1,Events:[Ro,gs,Aa,Pe,st,Cc]},Vo={findFiberByHostInstance:Nr,bundleType:0,version:"18.3.1",rendererPackageName:"react-dom"},Hv={bundleType:Vo.bundleType,version:Vo.version,rendererPackageName:Vo.rendererPackageName,rendererConfig:Vo.rendererConfig,overrideHookState:null,overrideHookStateDeletePath:null,overrideHookStateRenamePath:null,overrideProps:null,overridePropsDeletePath:null,overridePropsRenamePath:null,setErrorHandler:null,setSuspenseHandler:null,scheduleUpdate:null,currentDispatcherRef:C.ReactCurrentDispatcher,findHostInstanceByFiber:function(n){return n=R(n),n===null?null:n.stateNode},findFiberByHostInstance:Vo.findFiberByHostInstance||zv,findHostInstancesForRefresh:null,scheduleRefresh:null,scheduleRoot:null,setRefreshHandler:null,getCurrentFiber:null,reconcilerVersion:"18.3.1-next-f1338f8080-20240426"};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<"u"){var cl=__REACT_DEVTOOLS_GLOBAL_HOOK__;if(!cl.isDisabled&&cl.supportsFiber)try{Et=cl.inject(Hv),gt=cl}catch{}}return On.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=Bv,On.createPortal=function(n,i){var o=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!Fc(i))throw Error(t(200));return Ov(n,i,null,o)},On.createRoot=function(n,i){if(!Fc(n))throw Error(t(299));var o=!1,u="",d=Qp;return i!=null&&(i.unstable_strictMode===!0&&(o=!0),i.identifierPrefix!==void 0&&(u=i.identifierPrefix),i.onRecoverableError!==void 0&&(d=i.onRecoverableError)),i=Uc(n,1,!1,null,null,o,!1,u,d),n[Li]=i.current,wo(n.nodeType===8?n.parentNode:n),new Nc(i)},On.findDOMNode=function(n){if(n==null)return null;if(n.nodeType===1)return n;var i=n._reactInternals;if(i===void 0)throw typeof n.render=="function"?Error(t(188)):(n=Object.keys(n).join(","),Error(t(268,n)));return n=R(i),n=n===null?null:n.stateNode,n},On.flushSync=function(n){return Gr(n)},On.hydrate=function(n,i,o){if(!ll(i))throw Error(t(200));return ul(null,n,i,!0,o)},On.hydrateRoot=function(n,i,o){if(!Fc(n))throw Error(t(405));var u=o!=null&&o.hydratedSources||null,d=!1,p="",E=Qp;if(o!=null&&(o.unstable_strictMode===!0&&(d=!0),o.identifierPrefix!==void 0&&(p=o.identifierPrefix),o.onRecoverableError!==void 0&&(E=o.onRecoverableError)),i=Kp(i,null,n,1,o??null,d,!1,p,E),n[Li]=i.current,wo(n),u)for(n=0;n<u.length;n++)o=u[n],d=o._getVersion,d=d(o._source),i.mutableSourceEagerHydrationData==null?i.mutableSourceEagerHydrationData=[o,d]:i.mutableSourceEagerHydrationData.push(o,d);return new al(i)},On.render=function(n,i,o){if(!ll(i))throw Error(t(200));return ul(null,n,i,!1,o)},On.unmountComponentAtNode=function(n){if(!ll(n))throw Error(t(40));return n._reactRootContainer?(Gr(function(){ul(null,null,n,!1,function(){n._reactRootContainer=null,n[Li]=null})}),!0):!1},On.unstable_batchedUpdates=Cc,On.unstable_renderSubtreeIntoContainer=function(n,i,o,u){if(!ll(o))throw Error(t(200));if(n==null||n._reactInternals===void 0)throw Error(t(38));return ul(n,i,o,!1,u)},On.version="18.3.1-next-f1338f8080-20240426",On}var sm;function qv(){if(sm)return zc.exports;sm=1;function s(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(s)}catch(e){console.error(e)}}return s(),zc.exports=Yv(),zc.exports}var om;function $v(){if(om)return fl;om=1;var s=qv();return fl.createRoot=s.createRoot,fl.hydrateRoot=s.hydrateRoot,fl}var Kv=$v();function Zv({dialog:s,scene:e,isBusy:t,onClose:r,onSubmit:a}){if(!s)return null;const l={newScenario:me.createElement(Qv,{scene:e,isBusy:t,onSubmit:a}),addSatellite:me.createElement(Jv,{scene:e,isBusy:t,onSubmit:a}),addPlace:me.createElement(e0,{isBusy:t,onSubmit:a})},c={newScenario:"New scenario",addSatellite:"Add satellite",addPlace:"Add place"};return me.createElement("div",{className:"dialog-backdrop",role:"presentation",onMouseDown:r},me.createElement("section",{className:"authoring-dialog",role:"dialog","aria-modal":"true","aria-label":c[s],onMouseDown:f=>f.stopPropagation()},me.createElement("header",null,me.createElement("div",null,me.createElement("p",null,"Scenario authoring"),me.createElement("h2",null,c[s])),me.createElement("button",{className:"dialog-close",disabled:t,onClick:r,"aria-label":"Close"},"×")),l[s]))}function Qv({scene:s,isBusy:e,onSubmit:t}){const r=Number(s==null?void 0:s.startEpochUnix_s)||Date.now()/1e3,a=Number(s==null?void 0:s.stopEpochUnix_s)||r+6*3600;function l(c){c.preventDefault();const f=new FormData(c.currentTarget);t("newScenario",{Name:f.get("name"),StartEpochUnix_s:wf(f.get("startEpoch")),StopEpochUnix_s:wf(f.get("stopEpoch"))})}return me.createElement("form",{onSubmit:l},me.createElement(wn,{label:"Name",name:"name",defaultValue:"Untitled Scenario"}),me.createElement("div",{className:"form-grid form-grid--two"},me.createElement(wn,{label:"Start epoch (UTC)",name:"startEpoch",type:"datetime-local",defaultValue:Tf(r)}),me.createElement(wn,{label:"Stop epoch (UTC)",name:"stopEpoch",type:"datetime-local",defaultValue:Tf(a)})),me.createElement(md,{label:"Create scenario",busyLabel:"Creating scenario…",isBusy:e}))}function Jv({scene:s,isBusy:e,onSubmit:t}){const r=t0(s==null?void 0:s.satellites).length,a=Number(s==null?void 0:s.startEpochUnix_s)||Date.now()/1e3;function l(c){c.preventDefault();const f=new FormData(c.currentTarget);t("addSatellite",{Name:f.get("name"),EpochUnix_s:wf(f.get("epoch")),Altitude_m:Xi(f,"altitude_km")*1e3,Eccentricity:Xi(f,"eccentricity"),Inclination_deg:Xi(f,"inclination_deg"),Raan_deg:Xi(f,"raan_deg"),ArgumentOfPerigee_deg:Xi(f,"argumentOfPerigee_deg"),TrueAnomaly_deg:Xi(f,"trueAnomaly_deg")})}return me.createElement("form",{onSubmit:l},me.createElement("div",{className:"form-grid form-grid--two"},me.createElement(wn,{label:"Name",name:"name",defaultValue:`Satellite ${r+1}`}),me.createElement(wn,{label:"Epoch (UTC)",name:"epoch",type:"datetime-local",defaultValue:Tf(a)})),me.createElement("p",{className:"form-section-title"},"Classical orbital elements"),me.createElement("div",{className:"form-grid form-grid--two"},me.createElement(wn,{label:"Altitude (km)",name:"altitude_km",defaultValue:"500"}),me.createElement(wn,{label:"Eccentricity",name:"eccentricity",defaultValue:"0",step:"any"}),me.createElement(wn,{label:"Inclination (deg)",name:"inclination_deg",defaultValue:"51.6",step:"any"}),me.createElement(wn,{label:"RAAN (deg)",name:"raan_deg",defaultValue:"0",step:"any"}),me.createElement(wn,{label:"Argument of perigee (deg)",name:"argumentOfPerigee_deg",defaultValue:"0",step:"any"}),me.createElement(wn,{label:"True anomaly (deg)",name:"trueAnomaly_deg",defaultValue:"0",step:"any"})),me.createElement("p",{className:"form-help"},"Altitude is the semi-major-axis altitude above the WGS84 equator. MATLAB uses Orekit to create the authoritative ITRF state."),me.createElement(md,{label:"Add satellite",busyLabel:"Creating satellite…",isBusy:e}))}function e0({isBusy:s,onSubmit:e}){function t(r){r.preventDefault();const a=new FormData(r.currentTarget);e("addPlace",{Name:a.get("name"),Latitude_deg:Xi(a,"latitude_deg"),Longitude_deg:Xi(a,"longitude_deg"),Altitude_m:Xi(a,"altitude_m")})}return me.createElement("form",{onSubmit:t},me.createElement(wn,{label:"Name",name:"name",defaultValue:"Columbus, Ohio"}),me.createElement("div",{className:"form-grid form-grid--three"},me.createElement(wn,{label:"Latitude (deg)",name:"latitude_deg",defaultValue:"39.9612",step:"any"}),me.createElement(wn,{label:"Longitude (deg)",name:"longitude_deg",defaultValue:"-82.9988",step:"any"}),me.createElement(wn,{label:"Altitude (m)",name:"altitude_m",defaultValue:"275",step:"any"})),me.createElement(md,{label:"Add place",busyLabel:"Adding place…",isBusy:s}))}function wn({label:s,name:e,type:t,...r}){const a=t??(e==="name"?"text":"number");return me.createElement("label",{className:"form-field"},me.createElement("span",null,s),me.createElement("input",{name:e,type:a,required:!0,...r}))}function md({label:s,busyLabel:e,isBusy:t}){return me.createElement("footer",{className:"dialog-actions"},t&&me.createElement("span",{className:"command-progress"},"MATLAB is updating…"),me.createElement("button",{className:"primary-action",type:"submit",disabled:t},t?e:s))}function Xi(s,e){return Number(s.get(e))}function Tf(s){return new Date(s*1e3).toISOString().slice(0,16)}function wf(s){return new Date(`${s}Z`).getTime()/1e3}function t0(s){return s?Array.isArray(s)?s:[s]:[]}/**
 * @license
 * Copyright 2010-2024 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const gd="170",wr={ROTATE:0,DOLLY:1,PAN:2},Ks={ROTATE:0,PAN:1,DOLLY_PAN:2,DOLLY_ROTATE:3},n0=0,am=1,i0=2,wg=1,r0=2,Wi=3,br=0,Rn=1,Ti=2,Ar=0,Js=1,lm=2,um=3,cm=4,s0=5,es=100,o0=101,a0=102,l0=103,u0=104,c0=200,f0=201,d0=202,h0=203,Af=204,Cf=205,p0=206,m0=207,g0=208,_0=209,v0=210,x0=211,y0=212,S0=213,M0=214,Rf=0,bf=1,Pf=2,no=3,Lf=4,Df=5,Uf=6,If=7,_d=0,E0=1,T0=2,Cr=0,w0=1,A0=2,C0=3,R0=4,b0=5,P0=6,L0=7,Ag=300,io=301,ro=302,Nf=303,Ff=304,eu=306,Of=1e3,ns=1001,zf=1002,mi=1003,D0=1004,dl=1005,Ai=1006,Hc=1007,is=1008,$i=1009,Cg=1010,Rg=1011,Jo=1012,vd=1013,rs=1014,ji=1015,na=1016,xd=1017,yd=1018,so=1020,bg=35902,Pg=1021,Lg=1022,pi=1023,Dg=1024,Ug=1025,eo=1026,oo=1027,Ig=1028,Sd=1029,Ng=1030,Md=1031,Ed=1033,Hl=33776,Vl=33777,Gl=33778,Wl=33779,kf=35840,Bf=35841,Hf=35842,Vf=35843,Gf=36196,Wf=37492,Xf=37496,jf=37808,Yf=37809,qf=37810,$f=37811,Kf=37812,Zf=37813,Qf=37814,Jf=37815,ed=37816,td=37817,nd=37818,id=37819,rd=37820,sd=37821,Xl=36492,od=36494,ad=36495,Fg=36283,ld=36284,ud=36285,cd=36286,U0=3200,I0=3201,Og=0,N0=1,Tr="",An="srgb",uo="srgb-linear",tu="linear",Rt="srgb",Ls=7680,fm=519,F0=512,O0=513,z0=514,zg=515,k0=516,B0=517,H0=518,V0=519,fd=35044,dm="300 es",Yi=2e3,$l=2001;class os{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});const r=this._listeners;r[e]===void 0&&(r[e]=[]),r[e].indexOf(t)===-1&&r[e].push(t)}hasEventListener(e,t){if(this._listeners===void 0)return!1;const r=this._listeners;return r[e]!==void 0&&r[e].indexOf(t)!==-1}removeEventListener(e,t){if(this._listeners===void 0)return;const a=this._listeners[e];if(a!==void 0){const l=a.indexOf(t);l!==-1&&a.splice(l,1)}}dispatchEvent(e){if(this._listeners===void 0)return;const r=this._listeners[e.type];if(r!==void 0){e.target=this;const a=r.slice(0);for(let l=0,c=a.length;l<c;l++)a[l].call(this,e);e.target=null}}}const mn=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],jl=Math.PI/180,dd=180/Math.PI;function Rr(){const s=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,r=Math.random()*4294967295|0;return(mn[s&255]+mn[s>>8&255]+mn[s>>16&255]+mn[s>>24&255]+"-"+mn[e&255]+mn[e>>8&255]+"-"+mn[e>>16&15|64]+mn[e>>24&255]+"-"+mn[t&63|128]+mn[t>>8&255]+"-"+mn[t>>16&255]+mn[t>>24&255]+mn[r&255]+mn[r>>8&255]+mn[r>>16&255]+mn[r>>24&255]).toLowerCase()}function Cn(s,e,t){return Math.max(e,Math.min(t,s))}function G0(s,e){return(s%e+e)%e}function Vc(s,e,t){return(1-t)*s+t*e}function wi(s,e){switch(e.constructor){case Float32Array:return s;case Uint32Array:return s/4294967295;case Uint16Array:return s/65535;case Uint8Array:return s/255;case Int32Array:return Math.max(s/2147483647,-1);case Int16Array:return Math.max(s/32767,-1);case Int8Array:return Math.max(s/127,-1);default:throw new Error("Invalid component type.")}}function bt(s,e){switch(e.constructor){case Float32Array:return s;case Uint32Array:return Math.round(s*4294967295);case Uint16Array:return Math.round(s*65535);case Uint8Array:return Math.round(s*255);case Int32Array:return Math.round(s*2147483647);case Int16Array:return Math.round(s*32767);case Int8Array:return Math.round(s*127);default:throw new Error("Invalid component type.")}}const W0={DEG2RAD:jl};class qe{constructor(e=0,t=0){qe.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const t=this.x,r=this.y,a=e.elements;return this.x=a[0]*t+a[3]*r+a[6],this.y=a[1]*t+a[4]*r+a[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this}clampLength(e,t){const r=this.length();return this.divideScalar(r||1).multiplyScalar(Math.max(e,Math.min(t,r)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const r=this.dot(e)/t;return Math.acos(Cn(r,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,r=this.y-e.y;return t*t+r*r}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,r){return this.x=e.x+(t.x-e.x)*r,this.y=e.y+(t.y-e.y)*r,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){const r=Math.cos(t),a=Math.sin(t),l=this.x-e.x,c=this.y-e.y;return this.x=l*r-c*a+e.x,this.y=l*a+c*r+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class at{constructor(e,t,r,a,l,c,f,h,m){at.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,r,a,l,c,f,h,m)}set(e,t,r,a,l,c,f,h,m){const _=this.elements;return _[0]=e,_[1]=a,_[2]=f,_[3]=t,_[4]=l,_[5]=h,_[6]=r,_[7]=c,_[8]=m,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const t=this.elements,r=e.elements;return t[0]=r[0],t[1]=r[1],t[2]=r[2],t[3]=r[3],t[4]=r[4],t[5]=r[5],t[6]=r[6],t[7]=r[7],t[8]=r[8],this}extractBasis(e,t,r){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),r.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const r=e.elements,a=t.elements,l=this.elements,c=r[0],f=r[3],h=r[6],m=r[1],_=r[4],x=r[7],y=r[2],S=r[5],M=r[8],T=a[0],v=a[3],g=a[6],P=a[1],L=a[4],C=a[7],W=a[2],F=a[5],I=a[8];return l[0]=c*T+f*P+h*W,l[3]=c*v+f*L+h*F,l[6]=c*g+f*C+h*I,l[1]=m*T+_*P+x*W,l[4]=m*v+_*L+x*F,l[7]=m*g+_*C+x*I,l[2]=y*T+S*P+M*W,l[5]=y*v+S*L+M*F,l[8]=y*g+S*C+M*I,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){const e=this.elements,t=e[0],r=e[1],a=e[2],l=e[3],c=e[4],f=e[5],h=e[6],m=e[7],_=e[8];return t*c*_-t*f*m-r*l*_+r*f*h+a*l*m-a*c*h}invert(){const e=this.elements,t=e[0],r=e[1],a=e[2],l=e[3],c=e[4],f=e[5],h=e[6],m=e[7],_=e[8],x=_*c-f*m,y=f*h-_*l,S=m*l-c*h,M=t*x+r*y+a*S;if(M===0)return this.set(0,0,0,0,0,0,0,0,0);const T=1/M;return e[0]=x*T,e[1]=(a*m-_*r)*T,e[2]=(f*r-a*c)*T,e[3]=y*T,e[4]=(_*t-a*h)*T,e[5]=(a*l-f*t)*T,e[6]=S*T,e[7]=(r*h-m*t)*T,e[8]=(c*t-r*l)*T,this}transpose(){let e;const t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,r,a,l,c,f){const h=Math.cos(l),m=Math.sin(l);return this.set(r*h,r*m,-r*(h*c+m*f)+c+e,-a*m,a*h,-a*(-m*c+h*f)+f+t,0,0,1),this}scale(e,t){return this.premultiply(Gc.makeScale(e,t)),this}rotate(e){return this.premultiply(Gc.makeRotation(-e)),this}translate(e,t){return this.premultiply(Gc.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){const t=Math.cos(e),r=Math.sin(e);return this.set(t,-r,0,r,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){const t=this.elements,r=e.elements;for(let a=0;a<9;a++)if(t[a]!==r[a])return!1;return!0}fromArray(e,t=0){for(let r=0;r<9;r++)this.elements[r]=e[r+t];return this}toArray(e=[],t=0){const r=this.elements;return e[t]=r[0],e[t+1]=r[1],e[t+2]=r[2],e[t+3]=r[3],e[t+4]=r[4],e[t+5]=r[5],e[t+6]=r[6],e[t+7]=r[7],e[t+8]=r[8],e}clone(){return new this.constructor().fromArray(this.elements)}}const Gc=new at;function kg(s){for(let e=s.length-1;e>=0;--e)if(s[e]>=65535)return!0;return!1}function ea(s){return document.createElementNS("http://www.w3.org/1999/xhtml",s)}function X0(){const s=ea("canvas");return s.style.display="block",s}const hm={};function Zo(s){s in hm||(hm[s]=!0,console.warn(s))}function j0(s,e,t){return new Promise(function(r,a){function l(){switch(s.clientWaitSync(e,s.SYNC_FLUSH_COMMANDS_BIT,0)){case s.WAIT_FAILED:a();break;case s.TIMEOUT_EXPIRED:setTimeout(l,t);break;default:r()}}setTimeout(l,t)})}function Y0(s){const e=s.elements;e[2]=.5*e[2]+.5*e[3],e[6]=.5*e[6]+.5*e[7],e[10]=.5*e[10]+.5*e[11],e[14]=.5*e[14]+.5*e[15]}function q0(s){const e=s.elements;e[11]===-1?(e[10]=-e[10]-1,e[14]=-e[14]):(e[10]=-e[10],e[14]=-e[14]+1)}const yt={enabled:!0,workingColorSpace:uo,spaces:{},convert:function(s,e,t){return this.enabled===!1||e===t||!e||!t||(this.spaces[e].transfer===Rt&&(s.r=qi(s.r),s.g=qi(s.g),s.b=qi(s.b)),this.spaces[e].primaries!==this.spaces[t].primaries&&(s.applyMatrix3(this.spaces[e].toXYZ),s.applyMatrix3(this.spaces[t].fromXYZ)),this.spaces[t].transfer===Rt&&(s.r=to(s.r),s.g=to(s.g),s.b=to(s.b))),s},fromWorkingColorSpace:function(s,e){return this.convert(s,this.workingColorSpace,e)},toWorkingColorSpace:function(s,e){return this.convert(s,e,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===Tr?tu:this.spaces[s].transfer},getLuminanceCoefficients:function(s,e=this.workingColorSpace){return s.fromArray(this.spaces[e].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,e,t){return s.copy(this.spaces[e].toXYZ).multiply(this.spaces[t].fromXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace}};function qi(s){return s<.04045?s*.0773993808:Math.pow(s*.9478672986+.0521327014,2.4)}function to(s){return s<.0031308?s*12.92:1.055*Math.pow(s,.41666)-.055}const pm=[.64,.33,.3,.6,.15,.06],mm=[.2126,.7152,.0722],gm=[.3127,.329],_m=new at().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),vm=new at().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);yt.define({[uo]:{primaries:pm,whitePoint:gm,transfer:tu,toXYZ:_m,fromXYZ:vm,luminanceCoefficients:mm,workingColorSpaceConfig:{unpackColorSpace:An},outputColorSpaceConfig:{drawingBufferColorSpace:An}},[An]:{primaries:pm,whitePoint:gm,transfer:Rt,toXYZ:_m,fromXYZ:vm,luminanceCoefficients:mm,outputColorSpaceConfig:{drawingBufferColorSpace:An}}});let Ds;class $0{static getDataURL(e){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let t;if(e instanceof HTMLCanvasElement)t=e;else{Ds===void 0&&(Ds=ea("canvas")),Ds.width=e.width,Ds.height=e.height;const r=Ds.getContext("2d");e instanceof ImageData?r.putImageData(e,0,0):r.drawImage(e,0,0,e.width,e.height),t=Ds}return t.width>2048||t.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",e),t.toDataURL("image/jpeg",.6)):t.toDataURL("image/png")}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const t=ea("canvas");t.width=e.width,t.height=e.height;const r=t.getContext("2d");r.drawImage(e,0,0,e.width,e.height);const a=r.getImageData(0,0,e.width,e.height),l=a.data;for(let c=0;c<l.length;c++)l[c]=qi(l[c]/255)*255;return r.putImageData(a,0,0),t}else if(e.data){const t=e.data.slice(0);for(let r=0;r<t.length;r++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[r]=Math.floor(qi(t[r]/255)*255):t[r]=qi(t[r]);return{data:t,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}let K0=0;class Bg{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:K0++}),this.uuid=Rr(),this.data=e,this.dataReady=!0,this.version=0}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const r={uuid:this.uuid,url:""},a=this.data;if(a!==null){let l;if(Array.isArray(a)){l=[];for(let c=0,f=a.length;c<f;c++)a[c].isDataTexture?l.push(Wc(a[c].image)):l.push(Wc(a[c]))}else l=Wc(a);r.url=l}return t||(e.images[this.uuid]=r),r}}function Wc(s){return typeof HTMLImageElement<"u"&&s instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&s instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&s instanceof ImageBitmap?$0.getDataURL(s):s.data?{data:Array.from(s.data),width:s.width,height:s.height,type:s.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}let Z0=0;class _n extends os{constructor(e=_n.DEFAULT_IMAGE,t=_n.DEFAULT_MAPPING,r=ns,a=ns,l=Ai,c=is,f=pi,h=$i,m=_n.DEFAULT_ANISOTROPY,_=Tr){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Z0++}),this.uuid=Rr(),this.name="",this.source=new Bg(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=r,this.wrapT=a,this.magFilter=l,this.minFilter=c,this.anisotropy=m,this.format=f,this.internalFormat=null,this.type=h,this.offset=new qe(0,0),this.repeat=new qe(1,1),this.center=new qe(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new at,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=_,this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.pmremVersion=0}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const r={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(r.userData=this.userData),t||(e.textures[this.uuid]=r),r}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==Ag)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case Of:e.x=e.x-Math.floor(e.x);break;case ns:e.x=e.x<0?0:1;break;case zf:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case Of:e.y=e.y-Math.floor(e.y);break;case ns:e.y=e.y<0?0:1;break;case zf:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}}_n.DEFAULT_IMAGE=null;_n.DEFAULT_MAPPING=Ag;_n.DEFAULT_ANISOTROPY=1;class Vt{constructor(e=0,t=0,r=0,a=1){Vt.prototype.isVector4=!0,this.x=e,this.y=t,this.z=r,this.w=a}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,r,a){return this.x=e,this.y=t,this.z=r,this.w=a,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const t=this.x,r=this.y,a=this.z,l=this.w,c=e.elements;return this.x=c[0]*t+c[4]*r+c[8]*a+c[12]*l,this.y=c[1]*t+c[5]*r+c[9]*a+c[13]*l,this.z=c[2]*t+c[6]*r+c[10]*a+c[14]*l,this.w=c[3]*t+c[7]*r+c[11]*a+c[15]*l,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,r,a,l;const h=e.elements,m=h[0],_=h[4],x=h[8],y=h[1],S=h[5],M=h[9],T=h[2],v=h[6],g=h[10];if(Math.abs(_-y)<.01&&Math.abs(x-T)<.01&&Math.abs(M-v)<.01){if(Math.abs(_+y)<.1&&Math.abs(x+T)<.1&&Math.abs(M+v)<.1&&Math.abs(m+S+g-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;const L=(m+1)/2,C=(S+1)/2,W=(g+1)/2,F=(_+y)/4,I=(x+T)/4,B=(M+v)/4;return L>C&&L>W?L<.01?(r=0,a=.707106781,l=.707106781):(r=Math.sqrt(L),a=F/r,l=I/r):C>W?C<.01?(r=.707106781,a=0,l=.707106781):(a=Math.sqrt(C),r=F/a,l=B/a):W<.01?(r=.707106781,a=.707106781,l=0):(l=Math.sqrt(W),r=I/l,a=B/l),this.set(r,a,l,t),this}let P=Math.sqrt((v-M)*(v-M)+(x-T)*(x-T)+(y-_)*(y-_));return Math.abs(P)<.001&&(P=1),this.x=(v-M)/P,this.y=(x-T)/P,this.z=(y-_)/P,this.w=Math.acos((m+S+g-1)/2),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this.w=Math.max(e.w,Math.min(t.w,this.w)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this.w=Math.max(e,Math.min(t,this.w)),this}clampLength(e,t){const r=this.length();return this.divideScalar(r||1).multiplyScalar(Math.max(e,Math.min(t,r)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,r){return this.x=e.x+(t.x-e.x)*r,this.y=e.y+(t.y-e.y)*r,this.z=e.z+(t.z-e.z)*r,this.w=e.w+(t.w-e.w)*r,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class Q0 extends os{constructor(e=1,t=1,r={}){super(),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=1,this.scissor=new Vt(0,0,e,t),this.scissorTest=!1,this.viewport=new Vt(0,0,e,t);const a={width:e,height:t,depth:1};r=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Ai,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1},r);const l=new _n(a,r.mapping,r.wrapS,r.wrapT,r.magFilter,r.minFilter,r.format,r.type,r.anisotropy,r.colorSpace);l.flipY=!1,l.generateMipmaps=r.generateMipmaps,l.internalFormat=r.internalFormat,this.textures=[];const c=r.count;for(let f=0;f<c;f++)this.textures[f]=l.clone(),this.textures[f].isRenderTargetTexture=!0;this.depthBuffer=r.depthBuffer,this.stencilBuffer=r.stencilBuffer,this.resolveDepthBuffer=r.resolveDepthBuffer,this.resolveStencilBuffer=r.resolveStencilBuffer,this.depthTexture=r.depthTexture,this.samples=r.samples}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}setSize(e,t,r=1){if(this.width!==e||this.height!==t||this.depth!==r){this.width=e,this.height=t,this.depth=r;for(let a=0,l=this.textures.length;a<l;a++)this.textures[a].image.width=e,this.textures[a].image.height=t,this.textures[a].image.depth=r;this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let r=0,a=e.textures.length;r<a;r++)this.textures[r]=e.textures[r].clone(),this.textures[r].isRenderTargetTexture=!0;const t=Object.assign({},e.texture.image);return this.texture.source=new Bg(t),this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class ss extends Q0{constructor(e=1,t=1,r={}){super(e,t,r),this.isWebGLRenderTarget=!0}}class Hg extends _n{constructor(e=null,t=1,r=1,a=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:r,depth:a},this.magFilter=mi,this.minFilter=mi,this.wrapR=ns,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}}class J0 extends _n{constructor(e=null,t=1,r=1,a=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:r,depth:a},this.magFilter=mi,this.minFilter=mi,this.wrapR=ns,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class Pr{constructor(e=0,t=0,r=0,a=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=r,this._w=a}static slerpFlat(e,t,r,a,l,c,f){let h=r[a+0],m=r[a+1],_=r[a+2],x=r[a+3];const y=l[c+0],S=l[c+1],M=l[c+2],T=l[c+3];if(f===0){e[t+0]=h,e[t+1]=m,e[t+2]=_,e[t+3]=x;return}if(f===1){e[t+0]=y,e[t+1]=S,e[t+2]=M,e[t+3]=T;return}if(x!==T||h!==y||m!==S||_!==M){let v=1-f;const g=h*y+m*S+_*M+x*T,P=g>=0?1:-1,L=1-g*g;if(L>Number.EPSILON){const W=Math.sqrt(L),F=Math.atan2(W,g*P);v=Math.sin(v*F)/W,f=Math.sin(f*F)/W}const C=f*P;if(h=h*v+y*C,m=m*v+S*C,_=_*v+M*C,x=x*v+T*C,v===1-f){const W=1/Math.sqrt(h*h+m*m+_*_+x*x);h*=W,m*=W,_*=W,x*=W}}e[t]=h,e[t+1]=m,e[t+2]=_,e[t+3]=x}static multiplyQuaternionsFlat(e,t,r,a,l,c){const f=r[a],h=r[a+1],m=r[a+2],_=r[a+3],x=l[c],y=l[c+1],S=l[c+2],M=l[c+3];return e[t]=f*M+_*x+h*S-m*y,e[t+1]=h*M+_*y+m*x-f*S,e[t+2]=m*M+_*S+f*y-h*x,e[t+3]=_*M-f*x-h*y-m*S,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,r,a){return this._x=e,this._y=t,this._z=r,this._w=a,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){const r=e._x,a=e._y,l=e._z,c=e._order,f=Math.cos,h=Math.sin,m=f(r/2),_=f(a/2),x=f(l/2),y=h(r/2),S=h(a/2),M=h(l/2);switch(c){case"XYZ":this._x=y*_*x+m*S*M,this._y=m*S*x-y*_*M,this._z=m*_*M+y*S*x,this._w=m*_*x-y*S*M;break;case"YXZ":this._x=y*_*x+m*S*M,this._y=m*S*x-y*_*M,this._z=m*_*M-y*S*x,this._w=m*_*x+y*S*M;break;case"ZXY":this._x=y*_*x-m*S*M,this._y=m*S*x+y*_*M,this._z=m*_*M+y*S*x,this._w=m*_*x-y*S*M;break;case"ZYX":this._x=y*_*x-m*S*M,this._y=m*S*x+y*_*M,this._z=m*_*M-y*S*x,this._w=m*_*x+y*S*M;break;case"YZX":this._x=y*_*x+m*S*M,this._y=m*S*x+y*_*M,this._z=m*_*M-y*S*x,this._w=m*_*x-y*S*M;break;case"XZY":this._x=y*_*x-m*S*M,this._y=m*S*x-y*_*M,this._z=m*_*M+y*S*x,this._w=m*_*x+y*S*M;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+c)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){const r=t/2,a=Math.sin(r);return this._x=e.x*a,this._y=e.y*a,this._z=e.z*a,this._w=Math.cos(r),this._onChangeCallback(),this}setFromRotationMatrix(e){const t=e.elements,r=t[0],a=t[4],l=t[8],c=t[1],f=t[5],h=t[9],m=t[2],_=t[6],x=t[10],y=r+f+x;if(y>0){const S=.5/Math.sqrt(y+1);this._w=.25/S,this._x=(_-h)*S,this._y=(l-m)*S,this._z=(c-a)*S}else if(r>f&&r>x){const S=2*Math.sqrt(1+r-f-x);this._w=(_-h)/S,this._x=.25*S,this._y=(a+c)/S,this._z=(l+m)/S}else if(f>x){const S=2*Math.sqrt(1+f-r-x);this._w=(l-m)/S,this._x=(a+c)/S,this._y=.25*S,this._z=(h+_)/S}else{const S=2*Math.sqrt(1+x-r-f);this._w=(c-a)/S,this._x=(l+m)/S,this._y=(h+_)/S,this._z=.25*S}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let r=e.dot(t)+1;return r<Number.EPSILON?(r=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=r):(this._x=0,this._y=-e.z,this._z=e.y,this._w=r)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=r),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(Cn(this.dot(e),-1,1)))}rotateTowards(e,t){const r=this.angleTo(e);if(r===0)return this;const a=Math.min(1,t/r);return this.slerp(e,a),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){const r=e._x,a=e._y,l=e._z,c=e._w,f=t._x,h=t._y,m=t._z,_=t._w;return this._x=r*_+c*f+a*m-l*h,this._y=a*_+c*h+l*f-r*m,this._z=l*_+c*m+r*h-a*f,this._w=c*_-r*f-a*h-l*m,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);const r=this._x,a=this._y,l=this._z,c=this._w;let f=c*e._w+r*e._x+a*e._y+l*e._z;if(f<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,f=-f):this.copy(e),f>=1)return this._w=c,this._x=r,this._y=a,this._z=l,this;const h=1-f*f;if(h<=Number.EPSILON){const S=1-t;return this._w=S*c+t*this._w,this._x=S*r+t*this._x,this._y=S*a+t*this._y,this._z=S*l+t*this._z,this.normalize(),this}const m=Math.sqrt(h),_=Math.atan2(m,f),x=Math.sin((1-t)*_)/m,y=Math.sin(t*_)/m;return this._w=c*x+this._w*y,this._x=r*x+this._x*y,this._y=a*x+this._y*y,this._z=l*x+this._z*y,this._onChangeCallback(),this}slerpQuaternions(e,t,r){return this.copy(e).slerp(t,r)}random(){const e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),r=Math.random(),a=Math.sqrt(1-r),l=Math.sqrt(r);return this.set(a*Math.sin(e),a*Math.cos(e),l*Math.sin(t),l*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class G{constructor(e=0,t=0,r=0){G.prototype.isVector3=!0,this.x=e,this.y=t,this.z=r}set(e,t,r){return r===void 0&&(r=this.z),this.x=e,this.y=t,this.z=r,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(xm.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(xm.setFromAxisAngle(e,t))}applyMatrix3(e){const t=this.x,r=this.y,a=this.z,l=e.elements;return this.x=l[0]*t+l[3]*r+l[6]*a,this.y=l[1]*t+l[4]*r+l[7]*a,this.z=l[2]*t+l[5]*r+l[8]*a,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const t=this.x,r=this.y,a=this.z,l=e.elements,c=1/(l[3]*t+l[7]*r+l[11]*a+l[15]);return this.x=(l[0]*t+l[4]*r+l[8]*a+l[12])*c,this.y=(l[1]*t+l[5]*r+l[9]*a+l[13])*c,this.z=(l[2]*t+l[6]*r+l[10]*a+l[14])*c,this}applyQuaternion(e){const t=this.x,r=this.y,a=this.z,l=e.x,c=e.y,f=e.z,h=e.w,m=2*(c*a-f*r),_=2*(f*t-l*a),x=2*(l*r-c*t);return this.x=t+h*m+c*x-f*_,this.y=r+h*_+f*m-l*x,this.z=a+h*x+l*_-c*m,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const t=this.x,r=this.y,a=this.z,l=e.elements;return this.x=l[0]*t+l[4]*r+l[8]*a,this.y=l[1]*t+l[5]*r+l[9]*a,this.z=l[2]*t+l[6]*r+l[10]*a,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this}clampLength(e,t){const r=this.length();return this.divideScalar(r||1).multiplyScalar(Math.max(e,Math.min(t,r)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,r){return this.x=e.x+(t.x-e.x)*r,this.y=e.y+(t.y-e.y)*r,this.z=e.z+(t.z-e.z)*r,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){const r=e.x,a=e.y,l=e.z,c=t.x,f=t.y,h=t.z;return this.x=a*h-l*f,this.y=l*c-r*h,this.z=r*f-a*c,this}projectOnVector(e){const t=e.lengthSq();if(t===0)return this.set(0,0,0);const r=e.dot(this)/t;return this.copy(e).multiplyScalar(r)}projectOnPlane(e){return Xc.copy(this).projectOnVector(e),this.sub(Xc)}reflect(e){return this.sub(Xc.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const r=this.dot(e)/t;return Math.acos(Cn(r,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,r=this.y-e.y,a=this.z-e.z;return t*t+r*r+a*a}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,r){const a=Math.sin(t)*e;return this.x=a*Math.sin(r),this.y=Math.cos(t)*e,this.z=a*Math.cos(r),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,r){return this.x=e*Math.sin(t),this.y=r,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){const t=this.setFromMatrixColumn(e,0).length(),r=this.setFromMatrixColumn(e,1).length(),a=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=r,this.z=a,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=Math.random()*Math.PI*2,t=Math.random()*2-1,r=Math.sqrt(1-t*t);return this.x=r*Math.cos(e),this.y=t,this.z=r*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const Xc=new G,xm=new Pr;class ia{constructor(e=new G(1/0,1/0,1/0),t=new G(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,r=e.length;t<r;t+=3)this.expandByPoint(fi.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,r=e.count;t<r;t++)this.expandByPoint(fi.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,r=e.length;t<r;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){const r=fi.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(r),this.max.copy(e).add(r),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);const r=e.geometry;if(r!==void 0){const l=r.getAttribute("position");if(t===!0&&l!==void 0&&e.isInstancedMesh!==!0)for(let c=0,f=l.count;c<f;c++)e.isMesh===!0?e.getVertexPosition(c,fi):fi.fromBufferAttribute(l,c),fi.applyMatrix4(e.matrixWorld),this.expandByPoint(fi);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),hl.copy(e.boundingBox)):(r.boundingBox===null&&r.computeBoundingBox(),hl.copy(r.boundingBox)),hl.applyMatrix4(e.matrixWorld),this.union(hl)}const a=e.children;for(let l=0,c=a.length;l<c;l++)this.expandByObject(a[l],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,fi),fi.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,r;return e.normal.x>0?(t=e.normal.x*this.min.x,r=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,r=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,r+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,r+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,r+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,r+=e.normal.z*this.min.z),t<=-e.constant&&r>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(Go),pl.subVectors(this.max,Go),Us.subVectors(e.a,Go),Is.subVectors(e.b,Go),Ns.subVectors(e.c,Go),_r.subVectors(Is,Us),vr.subVectors(Ns,Is),Yr.subVectors(Us,Ns);let t=[0,-_r.z,_r.y,0,-vr.z,vr.y,0,-Yr.z,Yr.y,_r.z,0,-_r.x,vr.z,0,-vr.x,Yr.z,0,-Yr.x,-_r.y,_r.x,0,-vr.y,vr.x,0,-Yr.y,Yr.x,0];return!jc(t,Us,Is,Ns,pl)||(t=[1,0,0,0,1,0,0,0,1],!jc(t,Us,Is,Ns,pl))?!1:(ml.crossVectors(_r,vr),t=[ml.x,ml.y,ml.z],jc(t,Us,Is,Ns,pl))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,fi).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(fi).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(ki[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),ki[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),ki[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),ki[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),ki[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),ki[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),ki[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),ki[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(ki),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}}const ki=[new G,new G,new G,new G,new G,new G,new G,new G],fi=new G,hl=new ia,Us=new G,Is=new G,Ns=new G,_r=new G,vr=new G,Yr=new G,Go=new G,pl=new G,ml=new G,qr=new G;function jc(s,e,t,r,a){for(let l=0,c=s.length-3;l<=c;l+=3){qr.fromArray(s,l);const f=a.x*Math.abs(qr.x)+a.y*Math.abs(qr.y)+a.z*Math.abs(qr.z),h=e.dot(qr),m=t.dot(qr),_=r.dot(qr);if(Math.max(-Math.max(h,m,_),Math.min(h,m,_))>f)return!1}return!0}const ex=new ia,Wo=new G,Yc=new G;class ra{constructor(e=new G,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){const r=this.center;t!==void 0?r.copy(t):ex.setFromPoints(e).getCenter(r);let a=0;for(let l=0,c=e.length;l<c;l++)a=Math.max(a,r.distanceToSquared(e[l]));return this.radius=Math.sqrt(a),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){const r=this.center.distanceToSquared(e);return t.copy(e),r>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;Wo.subVectors(e,this.center);const t=Wo.lengthSq();if(t>this.radius*this.radius){const r=Math.sqrt(t),a=(r-this.radius)*.5;this.center.addScaledVector(Wo,a/r),this.radius+=a}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(Yc.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(Wo.copy(e.center).add(Yc)),this.expandByPoint(Wo.copy(e.center).sub(Yc))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}}const Bi=new G,qc=new G,gl=new G,xr=new G,$c=new G,_l=new G,Kc=new G;class nu{constructor(e=new G,t=new G(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,Bi)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);const r=t.dot(this.direction);return r<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,r)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const t=Bi.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(Bi.copy(this.origin).addScaledVector(this.direction,t),Bi.distanceToSquared(e))}distanceSqToSegment(e,t,r,a){qc.copy(e).add(t).multiplyScalar(.5),gl.copy(t).sub(e).normalize(),xr.copy(this.origin).sub(qc);const l=e.distanceTo(t)*.5,c=-this.direction.dot(gl),f=xr.dot(this.direction),h=-xr.dot(gl),m=xr.lengthSq(),_=Math.abs(1-c*c);let x,y,S,M;if(_>0)if(x=c*h-f,y=c*f-h,M=l*_,x>=0)if(y>=-M)if(y<=M){const T=1/_;x*=T,y*=T,S=x*(x+c*y+2*f)+y*(c*x+y+2*h)+m}else y=l,x=Math.max(0,-(c*y+f)),S=-x*x+y*(y+2*h)+m;else y=-l,x=Math.max(0,-(c*y+f)),S=-x*x+y*(y+2*h)+m;else y<=-M?(x=Math.max(0,-(-c*l+f)),y=x>0?-l:Math.min(Math.max(-l,-h),l),S=-x*x+y*(y+2*h)+m):y<=M?(x=0,y=Math.min(Math.max(-l,-h),l),S=y*(y+2*h)+m):(x=Math.max(0,-(c*l+f)),y=x>0?l:Math.min(Math.max(-l,-h),l),S=-x*x+y*(y+2*h)+m);else y=c>0?-l:l,x=Math.max(0,-(c*y+f)),S=-x*x+y*(y+2*h)+m;return r&&r.copy(this.origin).addScaledVector(this.direction,x),a&&a.copy(qc).addScaledVector(gl,y),S}intersectSphere(e,t){Bi.subVectors(e.center,this.origin);const r=Bi.dot(this.direction),a=Bi.dot(Bi)-r*r,l=e.radius*e.radius;if(a>l)return null;const c=Math.sqrt(l-a),f=r-c,h=r+c;return h<0?null:f<0?this.at(h,t):this.at(f,t)}intersectsSphere(e){return this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;const r=-(this.origin.dot(e.normal)+e.constant)/t;return r>=0?r:null}intersectPlane(e,t){const r=this.distanceToPlane(e);return r===null?null:this.at(r,t)}intersectsPlane(e){const t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let r,a,l,c,f,h;const m=1/this.direction.x,_=1/this.direction.y,x=1/this.direction.z,y=this.origin;return m>=0?(r=(e.min.x-y.x)*m,a=(e.max.x-y.x)*m):(r=(e.max.x-y.x)*m,a=(e.min.x-y.x)*m),_>=0?(l=(e.min.y-y.y)*_,c=(e.max.y-y.y)*_):(l=(e.max.y-y.y)*_,c=(e.min.y-y.y)*_),r>c||l>a||((l>r||isNaN(r))&&(r=l),(c<a||isNaN(a))&&(a=c),x>=0?(f=(e.min.z-y.z)*x,h=(e.max.z-y.z)*x):(f=(e.max.z-y.z)*x,h=(e.min.z-y.z)*x),r>h||f>a)||((f>r||r!==r)&&(r=f),(h<a||a!==a)&&(a=h),a<0)?null:this.at(r>=0?r:a,t)}intersectsBox(e){return this.intersectBox(e,Bi)!==null}intersectTriangle(e,t,r,a,l){$c.subVectors(t,e),_l.subVectors(r,e),Kc.crossVectors($c,_l);let c=this.direction.dot(Kc),f;if(c>0){if(a)return null;f=1}else if(c<0)f=-1,c=-c;else return null;xr.subVectors(this.origin,e);const h=f*this.direction.dot(_l.crossVectors(xr,_l));if(h<0)return null;const m=f*this.direction.dot($c.cross(xr));if(m<0||h+m>c)return null;const _=-f*xr.dot(Kc);return _<0?null:this.at(_/c,l)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class Lt{constructor(e,t,r,a,l,c,f,h,m,_,x,y,S,M,T,v){Lt.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,r,a,l,c,f,h,m,_,x,y,S,M,T,v)}set(e,t,r,a,l,c,f,h,m,_,x,y,S,M,T,v){const g=this.elements;return g[0]=e,g[4]=t,g[8]=r,g[12]=a,g[1]=l,g[5]=c,g[9]=f,g[13]=h,g[2]=m,g[6]=_,g[10]=x,g[14]=y,g[3]=S,g[7]=M,g[11]=T,g[15]=v,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new Lt().fromArray(this.elements)}copy(e){const t=this.elements,r=e.elements;return t[0]=r[0],t[1]=r[1],t[2]=r[2],t[3]=r[3],t[4]=r[4],t[5]=r[5],t[6]=r[6],t[7]=r[7],t[8]=r[8],t[9]=r[9],t[10]=r[10],t[11]=r[11],t[12]=r[12],t[13]=r[13],t[14]=r[14],t[15]=r[15],this}copyPosition(e){const t=this.elements,r=e.elements;return t[12]=r[12],t[13]=r[13],t[14]=r[14],this}setFromMatrix3(e){const t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,r){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),r.setFromMatrixColumn(this,2),this}makeBasis(e,t,r){return this.set(e.x,t.x,r.x,0,e.y,t.y,r.y,0,e.z,t.z,r.z,0,0,0,0,1),this}extractRotation(e){const t=this.elements,r=e.elements,a=1/Fs.setFromMatrixColumn(e,0).length(),l=1/Fs.setFromMatrixColumn(e,1).length(),c=1/Fs.setFromMatrixColumn(e,2).length();return t[0]=r[0]*a,t[1]=r[1]*a,t[2]=r[2]*a,t[3]=0,t[4]=r[4]*l,t[5]=r[5]*l,t[6]=r[6]*l,t[7]=0,t[8]=r[8]*c,t[9]=r[9]*c,t[10]=r[10]*c,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){const t=this.elements,r=e.x,a=e.y,l=e.z,c=Math.cos(r),f=Math.sin(r),h=Math.cos(a),m=Math.sin(a),_=Math.cos(l),x=Math.sin(l);if(e.order==="XYZ"){const y=c*_,S=c*x,M=f*_,T=f*x;t[0]=h*_,t[4]=-h*x,t[8]=m,t[1]=S+M*m,t[5]=y-T*m,t[9]=-f*h,t[2]=T-y*m,t[6]=M+S*m,t[10]=c*h}else if(e.order==="YXZ"){const y=h*_,S=h*x,M=m*_,T=m*x;t[0]=y+T*f,t[4]=M*f-S,t[8]=c*m,t[1]=c*x,t[5]=c*_,t[9]=-f,t[2]=S*f-M,t[6]=T+y*f,t[10]=c*h}else if(e.order==="ZXY"){const y=h*_,S=h*x,M=m*_,T=m*x;t[0]=y-T*f,t[4]=-c*x,t[8]=M+S*f,t[1]=S+M*f,t[5]=c*_,t[9]=T-y*f,t[2]=-c*m,t[6]=f,t[10]=c*h}else if(e.order==="ZYX"){const y=c*_,S=c*x,M=f*_,T=f*x;t[0]=h*_,t[4]=M*m-S,t[8]=y*m+T,t[1]=h*x,t[5]=T*m+y,t[9]=S*m-M,t[2]=-m,t[6]=f*h,t[10]=c*h}else if(e.order==="YZX"){const y=c*h,S=c*m,M=f*h,T=f*m;t[0]=h*_,t[4]=T-y*x,t[8]=M*x+S,t[1]=x,t[5]=c*_,t[9]=-f*_,t[2]=-m*_,t[6]=S*x+M,t[10]=y-T*x}else if(e.order==="XZY"){const y=c*h,S=c*m,M=f*h,T=f*m;t[0]=h*_,t[4]=-x,t[8]=m*_,t[1]=y*x+T,t[5]=c*_,t[9]=S*x-M,t[2]=M*x-S,t[6]=f*_,t[10]=T*x+y}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(tx,e,nx)}lookAt(e,t,r){const a=this.elements;return Wn.subVectors(e,t),Wn.lengthSq()===0&&(Wn.z=1),Wn.normalize(),yr.crossVectors(r,Wn),yr.lengthSq()===0&&(Math.abs(r.z)===1?Wn.x+=1e-4:Wn.z+=1e-4,Wn.normalize(),yr.crossVectors(r,Wn)),yr.normalize(),vl.crossVectors(Wn,yr),a[0]=yr.x,a[4]=vl.x,a[8]=Wn.x,a[1]=yr.y,a[5]=vl.y,a[9]=Wn.y,a[2]=yr.z,a[6]=vl.z,a[10]=Wn.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const r=e.elements,a=t.elements,l=this.elements,c=r[0],f=r[4],h=r[8],m=r[12],_=r[1],x=r[5],y=r[9],S=r[13],M=r[2],T=r[6],v=r[10],g=r[14],P=r[3],L=r[7],C=r[11],W=r[15],F=a[0],I=a[4],B=a[8],b=a[12],A=a[1],O=a[5],se=a[9],J=a[13],ue=a[2],ce=a[6],$=a[10],oe=a[14],k=a[3],le=a[7],re=a[11],N=a[15];return l[0]=c*F+f*A+h*ue+m*k,l[4]=c*I+f*O+h*ce+m*le,l[8]=c*B+f*se+h*$+m*re,l[12]=c*b+f*J+h*oe+m*N,l[1]=_*F+x*A+y*ue+S*k,l[5]=_*I+x*O+y*ce+S*le,l[9]=_*B+x*se+y*$+S*re,l[13]=_*b+x*J+y*oe+S*N,l[2]=M*F+T*A+v*ue+g*k,l[6]=M*I+T*O+v*ce+g*le,l[10]=M*B+T*se+v*$+g*re,l[14]=M*b+T*J+v*oe+g*N,l[3]=P*F+L*A+C*ue+W*k,l[7]=P*I+L*O+C*ce+W*le,l[11]=P*B+L*se+C*$+W*re,l[15]=P*b+L*J+C*oe+W*N,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){const e=this.elements,t=e[0],r=e[4],a=e[8],l=e[12],c=e[1],f=e[5],h=e[9],m=e[13],_=e[2],x=e[6],y=e[10],S=e[14],M=e[3],T=e[7],v=e[11],g=e[15];return M*(+l*h*x-a*m*x-l*f*y+r*m*y+a*f*S-r*h*S)+T*(+t*h*S-t*m*y+l*c*y-a*c*S+a*m*_-l*h*_)+v*(+t*m*x-t*f*S-l*c*x+r*c*S+l*f*_-r*m*_)+g*(-a*f*_-t*h*x+t*f*y+a*c*x-r*c*y+r*h*_)}transpose(){const e=this.elements;let t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,r){const a=this.elements;return e.isVector3?(a[12]=e.x,a[13]=e.y,a[14]=e.z):(a[12]=e,a[13]=t,a[14]=r),this}invert(){const e=this.elements,t=e[0],r=e[1],a=e[2],l=e[3],c=e[4],f=e[5],h=e[6],m=e[7],_=e[8],x=e[9],y=e[10],S=e[11],M=e[12],T=e[13],v=e[14],g=e[15],P=x*v*m-T*y*m+T*h*S-f*v*S-x*h*g+f*y*g,L=M*y*m-_*v*m-M*h*S+c*v*S+_*h*g-c*y*g,C=_*T*m-M*x*m+M*f*S-c*T*S-_*f*g+c*x*g,W=M*x*h-_*T*h-M*f*y+c*T*y+_*f*v-c*x*v,F=t*P+r*L+a*C+l*W;if(F===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const I=1/F;return e[0]=P*I,e[1]=(T*y*l-x*v*l-T*a*S+r*v*S+x*a*g-r*y*g)*I,e[2]=(f*v*l-T*h*l+T*a*m-r*v*m-f*a*g+r*h*g)*I,e[3]=(x*h*l-f*y*l-x*a*m+r*y*m+f*a*S-r*h*S)*I,e[4]=L*I,e[5]=(_*v*l-M*y*l+M*a*S-t*v*S-_*a*g+t*y*g)*I,e[6]=(M*h*l-c*v*l-M*a*m+t*v*m+c*a*g-t*h*g)*I,e[7]=(c*y*l-_*h*l+_*a*m-t*y*m-c*a*S+t*h*S)*I,e[8]=C*I,e[9]=(M*x*l-_*T*l-M*r*S+t*T*S+_*r*g-t*x*g)*I,e[10]=(c*T*l-M*f*l+M*r*m-t*T*m-c*r*g+t*f*g)*I,e[11]=(_*f*l-c*x*l-_*r*m+t*x*m+c*r*S-t*f*S)*I,e[12]=W*I,e[13]=(_*T*a-M*x*a+M*r*y-t*T*y-_*r*v+t*x*v)*I,e[14]=(M*f*a-c*T*a-M*r*h+t*T*h+c*r*v-t*f*v)*I,e[15]=(c*x*a-_*f*a+_*r*h-t*x*h-c*r*y+t*f*y)*I,this}scale(e){const t=this.elements,r=e.x,a=e.y,l=e.z;return t[0]*=r,t[4]*=a,t[8]*=l,t[1]*=r,t[5]*=a,t[9]*=l,t[2]*=r,t[6]*=a,t[10]*=l,t[3]*=r,t[7]*=a,t[11]*=l,this}getMaxScaleOnAxis(){const e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],r=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],a=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,r,a))}makeTranslation(e,t,r){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,r,0,0,0,1),this}makeRotationX(e){const t=Math.cos(e),r=Math.sin(e);return this.set(1,0,0,0,0,t,-r,0,0,r,t,0,0,0,0,1),this}makeRotationY(e){const t=Math.cos(e),r=Math.sin(e);return this.set(t,0,r,0,0,1,0,0,-r,0,t,0,0,0,0,1),this}makeRotationZ(e){const t=Math.cos(e),r=Math.sin(e);return this.set(t,-r,0,0,r,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){const r=Math.cos(t),a=Math.sin(t),l=1-r,c=e.x,f=e.y,h=e.z,m=l*c,_=l*f;return this.set(m*c+r,m*f-a*h,m*h+a*f,0,m*f+a*h,_*f+r,_*h-a*c,0,m*h-a*f,_*h+a*c,l*h*h+r,0,0,0,0,1),this}makeScale(e,t,r){return this.set(e,0,0,0,0,t,0,0,0,0,r,0,0,0,0,1),this}makeShear(e,t,r,a,l,c){return this.set(1,r,l,0,e,1,c,0,t,a,1,0,0,0,0,1),this}compose(e,t,r){const a=this.elements,l=t._x,c=t._y,f=t._z,h=t._w,m=l+l,_=c+c,x=f+f,y=l*m,S=l*_,M=l*x,T=c*_,v=c*x,g=f*x,P=h*m,L=h*_,C=h*x,W=r.x,F=r.y,I=r.z;return a[0]=(1-(T+g))*W,a[1]=(S+C)*W,a[2]=(M-L)*W,a[3]=0,a[4]=(S-C)*F,a[5]=(1-(y+g))*F,a[6]=(v+P)*F,a[7]=0,a[8]=(M+L)*I,a[9]=(v-P)*I,a[10]=(1-(y+T))*I,a[11]=0,a[12]=e.x,a[13]=e.y,a[14]=e.z,a[15]=1,this}decompose(e,t,r){const a=this.elements;let l=Fs.set(a[0],a[1],a[2]).length();const c=Fs.set(a[4],a[5],a[6]).length(),f=Fs.set(a[8],a[9],a[10]).length();this.determinant()<0&&(l=-l),e.x=a[12],e.y=a[13],e.z=a[14],di.copy(this);const m=1/l,_=1/c,x=1/f;return di.elements[0]*=m,di.elements[1]*=m,di.elements[2]*=m,di.elements[4]*=_,di.elements[5]*=_,di.elements[6]*=_,di.elements[8]*=x,di.elements[9]*=x,di.elements[10]*=x,t.setFromRotationMatrix(di),r.x=l,r.y=c,r.z=f,this}makePerspective(e,t,r,a,l,c,f=Yi){const h=this.elements,m=2*l/(t-e),_=2*l/(r-a),x=(t+e)/(t-e),y=(r+a)/(r-a);let S,M;if(f===Yi)S=-(c+l)/(c-l),M=-2*c*l/(c-l);else if(f===$l)S=-c/(c-l),M=-c*l/(c-l);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+f);return h[0]=m,h[4]=0,h[8]=x,h[12]=0,h[1]=0,h[5]=_,h[9]=y,h[13]=0,h[2]=0,h[6]=0,h[10]=S,h[14]=M,h[3]=0,h[7]=0,h[11]=-1,h[15]=0,this}makeOrthographic(e,t,r,a,l,c,f=Yi){const h=this.elements,m=1/(t-e),_=1/(r-a),x=1/(c-l),y=(t+e)*m,S=(r+a)*_;let M,T;if(f===Yi)M=(c+l)*x,T=-2*x;else if(f===$l)M=l*x,T=-1*x;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+f);return h[0]=2*m,h[4]=0,h[8]=0,h[12]=-y,h[1]=0,h[5]=2*_,h[9]=0,h[13]=-S,h[2]=0,h[6]=0,h[10]=T,h[14]=-M,h[3]=0,h[7]=0,h[11]=0,h[15]=1,this}equals(e){const t=this.elements,r=e.elements;for(let a=0;a<16;a++)if(t[a]!==r[a])return!1;return!0}fromArray(e,t=0){for(let r=0;r<16;r++)this.elements[r]=e[r+t];return this}toArray(e=[],t=0){const r=this.elements;return e[t]=r[0],e[t+1]=r[1],e[t+2]=r[2],e[t+3]=r[3],e[t+4]=r[4],e[t+5]=r[5],e[t+6]=r[6],e[t+7]=r[7],e[t+8]=r[8],e[t+9]=r[9],e[t+10]=r[10],e[t+11]=r[11],e[t+12]=r[12],e[t+13]=r[13],e[t+14]=r[14],e[t+15]=r[15],e}}const Fs=new G,di=new Lt,tx=new G(0,0,0),nx=new G(1,1,1),yr=new G,vl=new G,Wn=new G,ym=new Lt,Sm=new Pr;class Ci{constructor(e=0,t=0,r=0,a=Ci.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=r,this._order=a}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,r,a=this._order){return this._x=e,this._y=t,this._z=r,this._order=a,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,r=!0){const a=e.elements,l=a[0],c=a[4],f=a[8],h=a[1],m=a[5],_=a[9],x=a[2],y=a[6],S=a[10];switch(t){case"XYZ":this._y=Math.asin(Cn(f,-1,1)),Math.abs(f)<.9999999?(this._x=Math.atan2(-_,S),this._z=Math.atan2(-c,l)):(this._x=Math.atan2(y,m),this._z=0);break;case"YXZ":this._x=Math.asin(-Cn(_,-1,1)),Math.abs(_)<.9999999?(this._y=Math.atan2(f,S),this._z=Math.atan2(h,m)):(this._y=Math.atan2(-x,l),this._z=0);break;case"ZXY":this._x=Math.asin(Cn(y,-1,1)),Math.abs(y)<.9999999?(this._y=Math.atan2(-x,S),this._z=Math.atan2(-c,m)):(this._y=0,this._z=Math.atan2(h,l));break;case"ZYX":this._y=Math.asin(-Cn(x,-1,1)),Math.abs(x)<.9999999?(this._x=Math.atan2(y,S),this._z=Math.atan2(h,l)):(this._x=0,this._z=Math.atan2(-c,m));break;case"YZX":this._z=Math.asin(Cn(h,-1,1)),Math.abs(h)<.9999999?(this._x=Math.atan2(-_,m),this._y=Math.atan2(-x,l)):(this._x=0,this._y=Math.atan2(f,S));break;case"XZY":this._z=Math.asin(-Cn(c,-1,1)),Math.abs(c)<.9999999?(this._x=Math.atan2(y,m),this._y=Math.atan2(f,l)):(this._x=Math.atan2(-_,S),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,r===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,r){return ym.makeRotationFromQuaternion(e),this.setFromRotationMatrix(ym,t,r)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return Sm.setFromEuler(this),this.setFromQuaternion(Sm,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}Ci.DEFAULT_ORDER="XYZ";class Vg{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let ix=0;const Mm=new G,Os=new Pr,Hi=new Lt,xl=new G,Xo=new G,rx=new G,sx=new Pr,Em=new G(1,0,0),Tm=new G(0,1,0),wm=new G(0,0,1),Am={type:"added"},ox={type:"removed"},zs={type:"childadded",child:null},Zc={type:"childremoved",child:null};class Yt extends os{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:ix++}),this.uuid=Rr(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=Yt.DEFAULT_UP.clone();const e=new G,t=new Ci,r=new Pr,a=new G(1,1,1);function l(){r.setFromEuler(t,!1)}function c(){t.setFromQuaternion(r,void 0,!1)}t._onChange(l),r._onChange(c),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:r},scale:{configurable:!0,enumerable:!0,value:a},modelViewMatrix:{value:new Lt},normalMatrix:{value:new at}}),this.matrix=new Lt,this.matrixWorld=new Lt,this.matrixAutoUpdate=Yt.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=Yt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Vg,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return Os.setFromAxisAngle(e,t),this.quaternion.multiply(Os),this}rotateOnWorldAxis(e,t){return Os.setFromAxisAngle(e,t),this.quaternion.premultiply(Os),this}rotateX(e){return this.rotateOnAxis(Em,e)}rotateY(e){return this.rotateOnAxis(Tm,e)}rotateZ(e){return this.rotateOnAxis(wm,e)}translateOnAxis(e,t){return Mm.copy(e).applyQuaternion(this.quaternion),this.position.add(Mm.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(Em,e)}translateY(e){return this.translateOnAxis(Tm,e)}translateZ(e){return this.translateOnAxis(wm,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(Hi.copy(this.matrixWorld).invert())}lookAt(e,t,r){e.isVector3?xl.copy(e):xl.set(e,t,r);const a=this.parent;this.updateWorldMatrix(!0,!1),Xo.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Hi.lookAt(Xo,xl,this.up):Hi.lookAt(xl,Xo,this.up),this.quaternion.setFromRotationMatrix(Hi),a&&(Hi.extractRotation(a.matrixWorld),Os.setFromRotationMatrix(Hi),this.quaternion.premultiply(Os.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(Am),zs.child=e,this.dispatchEvent(zs),zs.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let r=0;r<arguments.length;r++)this.remove(arguments[r]);return this}const t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(ox),Zc.child=e,this.dispatchEvent(Zc),Zc.child=null),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),Hi.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),Hi.multiply(e.parent.matrixWorld)),e.applyMatrix4(Hi),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(Am),zs.child=e,this.dispatchEvent(zs),zs.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let r=0,a=this.children.length;r<a;r++){const c=this.children[r].getObjectByProperty(e,t);if(c!==void 0)return c}}getObjectsByProperty(e,t,r=[]){this[e]===t&&r.push(this);const a=this.children;for(let l=0,c=a.length;l<c;l++)a[l].getObjectsByProperty(e,t,r);return r}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Xo,e,rx),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Xo,sx,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);const t=this.children;for(let r=0,a=t.length;r<a;r++)t[r].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const t=this.children;for(let r=0,a=t.length;r<a;r++)t[r].traverseVisible(e)}traverseAncestors(e){const t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);const t=this.children;for(let r=0,a=t.length;r<a;r++)t[r].updateMatrixWorld(e)}updateWorldMatrix(e,t){const r=this.parent;if(e===!0&&r!==null&&r.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),t===!0){const a=this.children;for(let l=0,c=a.length;l<c;l++)a[l].updateWorldMatrix(!1,!0)}}toJSON(e){const t=e===void 0||typeof e=="string",r={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},r.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});const a={};a.uuid=this.uuid,a.type=this.type,this.name!==""&&(a.name=this.name),this.castShadow===!0&&(a.castShadow=!0),this.receiveShadow===!0&&(a.receiveShadow=!0),this.visible===!1&&(a.visible=!1),this.frustumCulled===!1&&(a.frustumCulled=!1),this.renderOrder!==0&&(a.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(a.userData=this.userData),a.layers=this.layers.mask,a.matrix=this.matrix.toArray(),a.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(a.matrixAutoUpdate=!1),this.isInstancedMesh&&(a.type="InstancedMesh",a.count=this.count,a.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(a.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(a.type="BatchedMesh",a.perObjectFrustumCulled=this.perObjectFrustumCulled,a.sortObjects=this.sortObjects,a.drawRanges=this._drawRanges,a.reservedRanges=this._reservedRanges,a.visibility=this._visibility,a.active=this._active,a.bounds=this._bounds.map(f=>({boxInitialized:f.boxInitialized,boxMin:f.box.min.toArray(),boxMax:f.box.max.toArray(),sphereInitialized:f.sphereInitialized,sphereRadius:f.sphere.radius,sphereCenter:f.sphere.center.toArray()})),a.maxInstanceCount=this._maxInstanceCount,a.maxVertexCount=this._maxVertexCount,a.maxIndexCount=this._maxIndexCount,a.geometryInitialized=this._geometryInitialized,a.geometryCount=this._geometryCount,a.matricesTexture=this._matricesTexture.toJSON(e),this._colorsTexture!==null&&(a.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(a.boundingSphere={center:a.boundingSphere.center.toArray(),radius:a.boundingSphere.radius}),this.boundingBox!==null&&(a.boundingBox={min:a.boundingBox.min.toArray(),max:a.boundingBox.max.toArray()}));function l(f,h){return f[h.uuid]===void 0&&(f[h.uuid]=h.toJSON(e)),h.uuid}if(this.isScene)this.background&&(this.background.isColor?a.background=this.background.toJSON():this.background.isTexture&&(a.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(a.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){a.geometry=l(e.geometries,this.geometry);const f=this.geometry.parameters;if(f!==void 0&&f.shapes!==void 0){const h=f.shapes;if(Array.isArray(h))for(let m=0,_=h.length;m<_;m++){const x=h[m];l(e.shapes,x)}else l(e.shapes,h)}}if(this.isSkinnedMesh&&(a.bindMode=this.bindMode,a.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(l(e.skeletons,this.skeleton),a.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const f=[];for(let h=0,m=this.material.length;h<m;h++)f.push(l(e.materials,this.material[h]));a.material=f}else a.material=l(e.materials,this.material);if(this.children.length>0){a.children=[];for(let f=0;f<this.children.length;f++)a.children.push(this.children[f].toJSON(e).object)}if(this.animations.length>0){a.animations=[];for(let f=0;f<this.animations.length;f++){const h=this.animations[f];a.animations.push(l(e.animations,h))}}if(t){const f=c(e.geometries),h=c(e.materials),m=c(e.textures),_=c(e.images),x=c(e.shapes),y=c(e.skeletons),S=c(e.animations),M=c(e.nodes);f.length>0&&(r.geometries=f),h.length>0&&(r.materials=h),m.length>0&&(r.textures=m),_.length>0&&(r.images=_),x.length>0&&(r.shapes=x),y.length>0&&(r.skeletons=y),S.length>0&&(r.animations=S),M.length>0&&(r.nodes=M)}return r.object=a,r;function c(f){const h=[];for(const m in f){const _=f[m];delete _.metadata,h.push(_)}return h}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let r=0;r<e.children.length;r++){const a=e.children[r];this.add(a.clone())}return this}}Yt.DEFAULT_UP=new G(0,1,0);Yt.DEFAULT_MATRIX_AUTO_UPDATE=!0;Yt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const hi=new G,Vi=new G,Qc=new G,Gi=new G,ks=new G,Bs=new G,Cm=new G,Jc=new G,ef=new G,tf=new G,nf=new Vt,rf=new Vt,sf=new Vt;class ni{constructor(e=new G,t=new G,r=new G){this.a=e,this.b=t,this.c=r}static getNormal(e,t,r,a){a.subVectors(r,t),hi.subVectors(e,t),a.cross(hi);const l=a.lengthSq();return l>0?a.multiplyScalar(1/Math.sqrt(l)):a.set(0,0,0)}static getBarycoord(e,t,r,a,l){hi.subVectors(a,t),Vi.subVectors(r,t),Qc.subVectors(e,t);const c=hi.dot(hi),f=hi.dot(Vi),h=hi.dot(Qc),m=Vi.dot(Vi),_=Vi.dot(Qc),x=c*m-f*f;if(x===0)return l.set(0,0,0),null;const y=1/x,S=(m*h-f*_)*y,M=(c*_-f*h)*y;return l.set(1-S-M,M,S)}static containsPoint(e,t,r,a){return this.getBarycoord(e,t,r,a,Gi)===null?!1:Gi.x>=0&&Gi.y>=0&&Gi.x+Gi.y<=1}static getInterpolation(e,t,r,a,l,c,f,h){return this.getBarycoord(e,t,r,a,Gi)===null?(h.x=0,h.y=0,"z"in h&&(h.z=0),"w"in h&&(h.w=0),null):(h.setScalar(0),h.addScaledVector(l,Gi.x),h.addScaledVector(c,Gi.y),h.addScaledVector(f,Gi.z),h)}static getInterpolatedAttribute(e,t,r,a,l,c){return nf.setScalar(0),rf.setScalar(0),sf.setScalar(0),nf.fromBufferAttribute(e,t),rf.fromBufferAttribute(e,r),sf.fromBufferAttribute(e,a),c.setScalar(0),c.addScaledVector(nf,l.x),c.addScaledVector(rf,l.y),c.addScaledVector(sf,l.z),c}static isFrontFacing(e,t,r,a){return hi.subVectors(r,t),Vi.subVectors(e,t),hi.cross(Vi).dot(a)<0}set(e,t,r){return this.a.copy(e),this.b.copy(t),this.c.copy(r),this}setFromPointsAndIndices(e,t,r,a){return this.a.copy(e[t]),this.b.copy(e[r]),this.c.copy(e[a]),this}setFromAttributeAndIndices(e,t,r,a){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,r),this.c.fromBufferAttribute(e,a),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return hi.subVectors(this.c,this.b),Vi.subVectors(this.a,this.b),hi.cross(Vi).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return ni.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return ni.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,r,a,l){return ni.getInterpolation(e,this.a,this.b,this.c,t,r,a,l)}containsPoint(e){return ni.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return ni.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){const r=this.a,a=this.b,l=this.c;let c,f;ks.subVectors(a,r),Bs.subVectors(l,r),Jc.subVectors(e,r);const h=ks.dot(Jc),m=Bs.dot(Jc);if(h<=0&&m<=0)return t.copy(r);ef.subVectors(e,a);const _=ks.dot(ef),x=Bs.dot(ef);if(_>=0&&x<=_)return t.copy(a);const y=h*x-_*m;if(y<=0&&h>=0&&_<=0)return c=h/(h-_),t.copy(r).addScaledVector(ks,c);tf.subVectors(e,l);const S=ks.dot(tf),M=Bs.dot(tf);if(M>=0&&S<=M)return t.copy(l);const T=S*m-h*M;if(T<=0&&m>=0&&M<=0)return f=m/(m-M),t.copy(r).addScaledVector(Bs,f);const v=_*M-S*x;if(v<=0&&x-_>=0&&S-M>=0)return Cm.subVectors(l,a),f=(x-_)/(x-_+(S-M)),t.copy(a).addScaledVector(Cm,f);const g=1/(v+T+y);return c=T*g,f=y*g,t.copy(r).addScaledVector(ks,c).addScaledVector(Bs,f)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}const Gg={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Sr={h:0,s:0,l:0},yl={h:0,s:0,l:0};function of(s,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?s+(e-s)*6*t:t<1/2?e:t<2/3?s+(e-s)*6*(2/3-t):s}class pt{constructor(e,t,r){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,r)}set(e,t,r){if(t===void 0&&r===void 0){const a=e;a&&a.isColor?this.copy(a):typeof a=="number"?this.setHex(a):typeof a=="string"&&this.setStyle(a)}else this.setRGB(e,t,r);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=An){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,yt.toWorkingColorSpace(this,t),this}setRGB(e,t,r,a=yt.workingColorSpace){return this.r=e,this.g=t,this.b=r,yt.toWorkingColorSpace(this,a),this}setHSL(e,t,r,a=yt.workingColorSpace){if(e=G0(e,1),t=Cn(t,0,1),r=Cn(r,0,1),t===0)this.r=this.g=this.b=r;else{const l=r<=.5?r*(1+t):r+t-r*t,c=2*r-l;this.r=of(c,l,e+1/3),this.g=of(c,l,e),this.b=of(c,l,e-1/3)}return yt.toWorkingColorSpace(this,a),this}setStyle(e,t=An){function r(l){l!==void 0&&parseFloat(l)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let a;if(a=/^(\w+)\(([^\)]*)\)/.exec(e)){let l;const c=a[1],f=a[2];switch(c){case"rgb":case"rgba":if(l=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(f))return r(l[4]),this.setRGB(Math.min(255,parseInt(l[1],10))/255,Math.min(255,parseInt(l[2],10))/255,Math.min(255,parseInt(l[3],10))/255,t);if(l=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(f))return r(l[4]),this.setRGB(Math.min(100,parseInt(l[1],10))/100,Math.min(100,parseInt(l[2],10))/100,Math.min(100,parseInt(l[3],10))/100,t);break;case"hsl":case"hsla":if(l=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(f))return r(l[4]),this.setHSL(parseFloat(l[1])/360,parseFloat(l[2])/100,parseFloat(l[3])/100,t);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(a=/^\#([A-Fa-f\d]+)$/.exec(e)){const l=a[1],c=l.length;if(c===3)return this.setRGB(parseInt(l.charAt(0),16)/15,parseInt(l.charAt(1),16)/15,parseInt(l.charAt(2),16)/15,t);if(c===6)return this.setHex(parseInt(l,16),t);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=An){const r=Gg[e.toLowerCase()];return r!==void 0?this.setHex(r,t):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=qi(e.r),this.g=qi(e.g),this.b=qi(e.b),this}copyLinearToSRGB(e){return this.r=to(e.r),this.g=to(e.g),this.b=to(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=An){return yt.fromWorkingColorSpace(gn.copy(this),e),Math.round(Cn(gn.r*255,0,255))*65536+Math.round(Cn(gn.g*255,0,255))*256+Math.round(Cn(gn.b*255,0,255))}getHexString(e=An){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=yt.workingColorSpace){yt.fromWorkingColorSpace(gn.copy(this),t);const r=gn.r,a=gn.g,l=gn.b,c=Math.max(r,a,l),f=Math.min(r,a,l);let h,m;const _=(f+c)/2;if(f===c)h=0,m=0;else{const x=c-f;switch(m=_<=.5?x/(c+f):x/(2-c-f),c){case r:h=(a-l)/x+(a<l?6:0);break;case a:h=(l-r)/x+2;break;case l:h=(r-a)/x+4;break}h/=6}return e.h=h,e.s=m,e.l=_,e}getRGB(e,t=yt.workingColorSpace){return yt.fromWorkingColorSpace(gn.copy(this),t),e.r=gn.r,e.g=gn.g,e.b=gn.b,e}getStyle(e=An){yt.fromWorkingColorSpace(gn.copy(this),e);const t=gn.r,r=gn.g,a=gn.b;return e!==An?`color(${e} ${t.toFixed(3)} ${r.toFixed(3)} ${a.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(r*255)},${Math.round(a*255)})`}offsetHSL(e,t,r){return this.getHSL(Sr),this.setHSL(Sr.h+e,Sr.s+t,Sr.l+r)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,r){return this.r=e.r+(t.r-e.r)*r,this.g=e.g+(t.g-e.g)*r,this.b=e.b+(t.b-e.b)*r,this}lerpHSL(e,t){this.getHSL(Sr),e.getHSL(yl);const r=Vc(Sr.h,yl.h,t),a=Vc(Sr.s,yl.s,t),l=Vc(Sr.l,yl.l,t);return this.setHSL(r,a,l),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const t=this.r,r=this.g,a=this.b,l=e.elements;return this.r=l[0]*t+l[3]*r+l[6]*a,this.g=l[1]*t+l[4]*r+l[7]*a,this.b=l[2]*t+l[5]*r+l[8]*a,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const gn=new pt;pt.NAMES=Gg;let ax=0;class Dr extends os{static get type(){return"Material"}get type(){return this.constructor.type}set type(e){}constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:ax++}),this.uuid=Rr(),this.name="",this.blending=Js,this.side=br,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Af,this.blendDst=Cf,this.blendEquation=es,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new pt(0,0,0),this.blendAlpha=0,this.depthFunc=no,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=fm,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Ls,this.stencilZFail=Ls,this.stencilZPass=Ls,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const t in e){const r=e[t];if(r===void 0){console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);continue}const a=this[t];if(a===void 0){console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);continue}a&&a.isColor?a.set(r):a&&a.isVector3&&r&&r.isVector3?a.copy(r):this[t]=r}}toJSON(e){const t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});const r={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};r.uuid=this.uuid,r.type=this.type,this.name!==""&&(r.name=this.name),this.color&&this.color.isColor&&(r.color=this.color.getHex()),this.roughness!==void 0&&(r.roughness=this.roughness),this.metalness!==void 0&&(r.metalness=this.metalness),this.sheen!==void 0&&(r.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(r.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(r.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(r.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(r.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(r.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(r.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(r.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(r.shininess=this.shininess),this.clearcoat!==void 0&&(r.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(r.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(r.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(r.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(r.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,r.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.dispersion!==void 0&&(r.dispersion=this.dispersion),this.iridescence!==void 0&&(r.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(r.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(r.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(r.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(r.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(r.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(r.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(r.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(r.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(r.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(r.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(r.lightMap=this.lightMap.toJSON(e).uuid,r.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(r.aoMap=this.aoMap.toJSON(e).uuid,r.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(r.bumpMap=this.bumpMap.toJSON(e).uuid,r.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(r.normalMap=this.normalMap.toJSON(e).uuid,r.normalMapType=this.normalMapType,r.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(r.displacementMap=this.displacementMap.toJSON(e).uuid,r.displacementScale=this.displacementScale,r.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(r.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(r.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(r.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(r.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(r.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(r.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(r.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(r.combine=this.combine)),this.envMapRotation!==void 0&&(r.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(r.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(r.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(r.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(r.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(r.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(r.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(r.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(r.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(r.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(r.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(r.size=this.size),this.shadowSide!==null&&(r.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(r.sizeAttenuation=this.sizeAttenuation),this.blending!==Js&&(r.blending=this.blending),this.side!==br&&(r.side=this.side),this.vertexColors===!0&&(r.vertexColors=!0),this.opacity<1&&(r.opacity=this.opacity),this.transparent===!0&&(r.transparent=!0),this.blendSrc!==Af&&(r.blendSrc=this.blendSrc),this.blendDst!==Cf&&(r.blendDst=this.blendDst),this.blendEquation!==es&&(r.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(r.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(r.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(r.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(r.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(r.blendAlpha=this.blendAlpha),this.depthFunc!==no&&(r.depthFunc=this.depthFunc),this.depthTest===!1&&(r.depthTest=this.depthTest),this.depthWrite===!1&&(r.depthWrite=this.depthWrite),this.colorWrite===!1&&(r.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(r.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==fm&&(r.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(r.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(r.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==Ls&&(r.stencilFail=this.stencilFail),this.stencilZFail!==Ls&&(r.stencilZFail=this.stencilZFail),this.stencilZPass!==Ls&&(r.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(r.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(r.rotation=this.rotation),this.polygonOffset===!0&&(r.polygonOffset=!0),this.polygonOffsetFactor!==0&&(r.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(r.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(r.linewidth=this.linewidth),this.dashSize!==void 0&&(r.dashSize=this.dashSize),this.gapSize!==void 0&&(r.gapSize=this.gapSize),this.scale!==void 0&&(r.scale=this.scale),this.dithering===!0&&(r.dithering=!0),this.alphaTest>0&&(r.alphaTest=this.alphaTest),this.alphaHash===!0&&(r.alphaHash=!0),this.alphaToCoverage===!0&&(r.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(r.premultipliedAlpha=!0),this.forceSinglePass===!0&&(r.forceSinglePass=!0),this.wireframe===!0&&(r.wireframe=!0),this.wireframeLinewidth>1&&(r.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(r.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(r.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(r.flatShading=!0),this.visible===!1&&(r.visible=!1),this.toneMapped===!1&&(r.toneMapped=!1),this.fog===!1&&(r.fog=!1),Object.keys(this.userData).length>0&&(r.userData=this.userData);function a(l){const c=[];for(const f in l){const h=l[f];delete h.metadata,c.push(h)}return c}if(t){const l=a(e.textures),c=a(e.images);l.length>0&&(r.textures=l),c.length>0&&(r.images=c)}return r}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const t=e.clippingPlanes;let r=null;if(t!==null){const a=t.length;r=new Array(a);for(let l=0;l!==a;++l)r[l]=t[l].clone()}return this.clippingPlanes=r,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}onBuild(){console.warn("Material: onBuild() has been removed.")}}class ao extends Dr{static get type(){return"MeshBasicMaterial"}constructor(e){super(),this.isMeshBasicMaterial=!0,this.color=new pt(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Ci,this.combine=_d,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const Xt=new G,Sl=new qe;class gi{constructor(e,t,r=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=r,this.usage=fd,this.updateRanges=[],this.gpuType=ji,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,r){e*=this.itemSize,r*=t.itemSize;for(let a=0,l=this.itemSize;a<l;a++)this.array[e+a]=t.array[r+a];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,r=this.count;t<r;t++)Sl.fromBufferAttribute(this,t),Sl.applyMatrix3(e),this.setXY(t,Sl.x,Sl.y);else if(this.itemSize===3)for(let t=0,r=this.count;t<r;t++)Xt.fromBufferAttribute(this,t),Xt.applyMatrix3(e),this.setXYZ(t,Xt.x,Xt.y,Xt.z);return this}applyMatrix4(e){for(let t=0,r=this.count;t<r;t++)Xt.fromBufferAttribute(this,t),Xt.applyMatrix4(e),this.setXYZ(t,Xt.x,Xt.y,Xt.z);return this}applyNormalMatrix(e){for(let t=0,r=this.count;t<r;t++)Xt.fromBufferAttribute(this,t),Xt.applyNormalMatrix(e),this.setXYZ(t,Xt.x,Xt.y,Xt.z);return this}transformDirection(e){for(let t=0,r=this.count;t<r;t++)Xt.fromBufferAttribute(this,t),Xt.transformDirection(e),this.setXYZ(t,Xt.x,Xt.y,Xt.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let r=this.array[e*this.itemSize+t];return this.normalized&&(r=wi(r,this.array)),r}setComponent(e,t,r){return this.normalized&&(r=bt(r,this.array)),this.array[e*this.itemSize+t]=r,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=wi(t,this.array)),t}setX(e,t){return this.normalized&&(t=bt(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=wi(t,this.array)),t}setY(e,t){return this.normalized&&(t=bt(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=wi(t,this.array)),t}setZ(e,t){return this.normalized&&(t=bt(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=wi(t,this.array)),t}setW(e,t){return this.normalized&&(t=bt(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,r){return e*=this.itemSize,this.normalized&&(t=bt(t,this.array),r=bt(r,this.array)),this.array[e+0]=t,this.array[e+1]=r,this}setXYZ(e,t,r,a){return e*=this.itemSize,this.normalized&&(t=bt(t,this.array),r=bt(r,this.array),a=bt(a,this.array)),this.array[e+0]=t,this.array[e+1]=r,this.array[e+2]=a,this}setXYZW(e,t,r,a,l){return e*=this.itemSize,this.normalized&&(t=bt(t,this.array),r=bt(r,this.array),a=bt(a,this.array),l=bt(l,this.array)),this.array[e+0]=t,this.array[e+1]=r,this.array[e+2]=a,this.array[e+3]=l,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==fd&&(e.usage=this.usage),e}}class Wg extends gi{constructor(e,t,r){super(new Uint16Array(e),t,r)}}class Xg extends gi{constructor(e,t,r){super(new Uint32Array(e),t,r)}}class on extends gi{constructor(e,t,r){super(new Float32Array(e),t,r)}}let lx=0;const ei=new Lt,af=new Yt,Hs=new G,Xn=new ia,jo=new ia,sn=new G;class bn extends os{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:lx++}),this.uuid=Rr(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(kg(e)?Xg:Wg)(e,1):this.index=e,this}setIndirect(e){return this.indirect=e,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,r=0){this.groups.push({start:e,count:t,materialIndex:r})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){const t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);const r=this.attributes.normal;if(r!==void 0){const l=new at().getNormalMatrix(e);r.applyNormalMatrix(l),r.needsUpdate=!0}const a=this.attributes.tangent;return a!==void 0&&(a.transformDirection(e),a.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return ei.makeRotationFromQuaternion(e),this.applyMatrix4(ei),this}rotateX(e){return ei.makeRotationX(e),this.applyMatrix4(ei),this}rotateY(e){return ei.makeRotationY(e),this.applyMatrix4(ei),this}rotateZ(e){return ei.makeRotationZ(e),this.applyMatrix4(ei),this}translate(e,t,r){return ei.makeTranslation(e,t,r),this.applyMatrix4(ei),this}scale(e,t,r){return ei.makeScale(e,t,r),this.applyMatrix4(ei),this}lookAt(e){return af.lookAt(e),af.updateMatrix(),this.applyMatrix4(af.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Hs).negate(),this.translate(Hs.x,Hs.y,Hs.z),this}setFromPoints(e){const t=this.getAttribute("position");if(t===void 0){const r=[];for(let a=0,l=e.length;a<l;a++){const c=e[a];r.push(c.x,c.y,c.z||0)}this.setAttribute("position",new on(r,3))}else{for(let r=0,a=t.count;r<a;r++){const l=e[r];t.setXYZ(r,l.x,l.y,l.z||0)}e.length>t.count&&console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new ia);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new G(-1/0,-1/0,-1/0),new G(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let r=0,a=t.length;r<a;r++){const l=t[r];Xn.setFromBufferAttribute(l),this.morphTargetsRelative?(sn.addVectors(this.boundingBox.min,Xn.min),this.boundingBox.expandByPoint(sn),sn.addVectors(this.boundingBox.max,Xn.max),this.boundingBox.expandByPoint(sn)):(this.boundingBox.expandByPoint(Xn.min),this.boundingBox.expandByPoint(Xn.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new ra);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new G,1/0);return}if(e){const r=this.boundingSphere.center;if(Xn.setFromBufferAttribute(e),t)for(let l=0,c=t.length;l<c;l++){const f=t[l];jo.setFromBufferAttribute(f),this.morphTargetsRelative?(sn.addVectors(Xn.min,jo.min),Xn.expandByPoint(sn),sn.addVectors(Xn.max,jo.max),Xn.expandByPoint(sn)):(Xn.expandByPoint(jo.min),Xn.expandByPoint(jo.max))}Xn.getCenter(r);let a=0;for(let l=0,c=e.count;l<c;l++)sn.fromBufferAttribute(e,l),a=Math.max(a,r.distanceToSquared(sn));if(t)for(let l=0,c=t.length;l<c;l++){const f=t[l],h=this.morphTargetsRelative;for(let m=0,_=f.count;m<_;m++)sn.fromBufferAttribute(f,m),h&&(Hs.fromBufferAttribute(e,m),sn.add(Hs)),a=Math.max(a,r.distanceToSquared(sn))}this.boundingSphere.radius=Math.sqrt(a),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const r=t.position,a=t.normal,l=t.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new gi(new Float32Array(4*r.count),4));const c=this.getAttribute("tangent"),f=[],h=[];for(let B=0;B<r.count;B++)f[B]=new G,h[B]=new G;const m=new G,_=new G,x=new G,y=new qe,S=new qe,M=new qe,T=new G,v=new G;function g(B,b,A){m.fromBufferAttribute(r,B),_.fromBufferAttribute(r,b),x.fromBufferAttribute(r,A),y.fromBufferAttribute(l,B),S.fromBufferAttribute(l,b),M.fromBufferAttribute(l,A),_.sub(m),x.sub(m),S.sub(y),M.sub(y);const O=1/(S.x*M.y-M.x*S.y);isFinite(O)&&(T.copy(_).multiplyScalar(M.y).addScaledVector(x,-S.y).multiplyScalar(O),v.copy(x).multiplyScalar(S.x).addScaledVector(_,-M.x).multiplyScalar(O),f[B].add(T),f[b].add(T),f[A].add(T),h[B].add(v),h[b].add(v),h[A].add(v))}let P=this.groups;P.length===0&&(P=[{start:0,count:e.count}]);for(let B=0,b=P.length;B<b;++B){const A=P[B],O=A.start,se=A.count;for(let J=O,ue=O+se;J<ue;J+=3)g(e.getX(J+0),e.getX(J+1),e.getX(J+2))}const L=new G,C=new G,W=new G,F=new G;function I(B){W.fromBufferAttribute(a,B),F.copy(W);const b=f[B];L.copy(b),L.sub(W.multiplyScalar(W.dot(b))).normalize(),C.crossVectors(F,b);const O=C.dot(h[B])<0?-1:1;c.setXYZW(B,L.x,L.y,L.z,O)}for(let B=0,b=P.length;B<b;++B){const A=P[B],O=A.start,se=A.count;for(let J=O,ue=O+se;J<ue;J+=3)I(e.getX(J+0)),I(e.getX(J+1)),I(e.getX(J+2))}}computeVertexNormals(){const e=this.index,t=this.getAttribute("position");if(t!==void 0){let r=this.getAttribute("normal");if(r===void 0)r=new gi(new Float32Array(t.count*3),3),this.setAttribute("normal",r);else for(let y=0,S=r.count;y<S;y++)r.setXYZ(y,0,0,0);const a=new G,l=new G,c=new G,f=new G,h=new G,m=new G,_=new G,x=new G;if(e)for(let y=0,S=e.count;y<S;y+=3){const M=e.getX(y+0),T=e.getX(y+1),v=e.getX(y+2);a.fromBufferAttribute(t,M),l.fromBufferAttribute(t,T),c.fromBufferAttribute(t,v),_.subVectors(c,l),x.subVectors(a,l),_.cross(x),f.fromBufferAttribute(r,M),h.fromBufferAttribute(r,T),m.fromBufferAttribute(r,v),f.add(_),h.add(_),m.add(_),r.setXYZ(M,f.x,f.y,f.z),r.setXYZ(T,h.x,h.y,h.z),r.setXYZ(v,m.x,m.y,m.z)}else for(let y=0,S=t.count;y<S;y+=3)a.fromBufferAttribute(t,y+0),l.fromBufferAttribute(t,y+1),c.fromBufferAttribute(t,y+2),_.subVectors(c,l),x.subVectors(a,l),_.cross(x),r.setXYZ(y+0,_.x,_.y,_.z),r.setXYZ(y+1,_.x,_.y,_.z),r.setXYZ(y+2,_.x,_.y,_.z);this.normalizeNormals(),r.needsUpdate=!0}}normalizeNormals(){const e=this.attributes.normal;for(let t=0,r=e.count;t<r;t++)sn.fromBufferAttribute(e,t),sn.normalize(),e.setXYZ(t,sn.x,sn.y,sn.z)}toNonIndexed(){function e(f,h){const m=f.array,_=f.itemSize,x=f.normalized,y=new m.constructor(h.length*_);let S=0,M=0;for(let T=0,v=h.length;T<v;T++){f.isInterleavedBufferAttribute?S=h[T]*f.data.stride+f.offset:S=h[T]*_;for(let g=0;g<_;g++)y[M++]=m[S++]}return new gi(y,_,x)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const t=new bn,r=this.index.array,a=this.attributes;for(const f in a){const h=a[f],m=e(h,r);t.setAttribute(f,m)}const l=this.morphAttributes;for(const f in l){const h=[],m=l[f];for(let _=0,x=m.length;_<x;_++){const y=m[_],S=e(y,r);h.push(S)}t.morphAttributes[f]=h}t.morphTargetsRelative=this.morphTargetsRelative;const c=this.groups;for(let f=0,h=c.length;f<h;f++){const m=c[f];t.addGroup(m.start,m.count,m.materialIndex)}return t}toJSON(){const e={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){const h=this.parameters;for(const m in h)h[m]!==void 0&&(e[m]=h[m]);return e}e.data={attributes:{}};const t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});const r=this.attributes;for(const h in r){const m=r[h];e.data.attributes[h]=m.toJSON(e.data)}const a={};let l=!1;for(const h in this.morphAttributes){const m=this.morphAttributes[h],_=[];for(let x=0,y=m.length;x<y;x++){const S=m[x];_.push(S.toJSON(e.data))}_.length>0&&(a[h]=_,l=!0)}l&&(e.data.morphAttributes=a,e.data.morphTargetsRelative=this.morphTargetsRelative);const c=this.groups;c.length>0&&(e.data.groups=JSON.parse(JSON.stringify(c)));const f=this.boundingSphere;return f!==null&&(e.data.boundingSphere={center:f.center.toArray(),radius:f.radius}),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const t={};this.name=e.name;const r=e.index;r!==null&&this.setIndex(r.clone(t));const a=e.attributes;for(const m in a){const _=a[m];this.setAttribute(m,_.clone(t))}const l=e.morphAttributes;for(const m in l){const _=[],x=l[m];for(let y=0,S=x.length;y<S;y++)_.push(x[y].clone(t));this.morphAttributes[m]=_}this.morphTargetsRelative=e.morphTargetsRelative;const c=e.groups;for(let m=0,_=c.length;m<_;m++){const x=c[m];this.addGroup(x.start,x.count,x.materialIndex)}const f=e.boundingBox;f!==null&&(this.boundingBox=f.clone());const h=e.boundingSphere;return h!==null&&(this.boundingSphere=h.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const Rm=new Lt,$r=new nu,Ml=new ra,bm=new G,El=new G,Tl=new G,wl=new G,lf=new G,Al=new G,Pm=new G,Cl=new G;class kn extends Yt{constructor(e=new bn,t=new ao){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const t=this.geometry.morphAttributes,r=Object.keys(t);if(r.length>0){const a=t[r[0]];if(a!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let l=0,c=a.length;l<c;l++){const f=a[l].name||String(l);this.morphTargetInfluences.push(0),this.morphTargetDictionary[f]=l}}}}getVertexPosition(e,t){const r=this.geometry,a=r.attributes.position,l=r.morphAttributes.position,c=r.morphTargetsRelative;t.fromBufferAttribute(a,e);const f=this.morphTargetInfluences;if(l&&f){Al.set(0,0,0);for(let h=0,m=l.length;h<m;h++){const _=f[h],x=l[h];_!==0&&(lf.fromBufferAttribute(x,e),c?Al.addScaledVector(lf,_):Al.addScaledVector(lf.sub(t),_))}t.add(Al)}return t}raycast(e,t){const r=this.geometry,a=this.material,l=this.matrixWorld;a!==void 0&&(r.boundingSphere===null&&r.computeBoundingSphere(),Ml.copy(r.boundingSphere),Ml.applyMatrix4(l),$r.copy(e.ray).recast(e.near),!(Ml.containsPoint($r.origin)===!1&&($r.intersectSphere(Ml,bm)===null||$r.origin.distanceToSquared(bm)>(e.far-e.near)**2))&&(Rm.copy(l).invert(),$r.copy(e.ray).applyMatrix4(Rm),!(r.boundingBox!==null&&$r.intersectsBox(r.boundingBox)===!1)&&this._computeIntersections(e,t,$r)))}_computeIntersections(e,t,r){let a;const l=this.geometry,c=this.material,f=l.index,h=l.attributes.position,m=l.attributes.uv,_=l.attributes.uv1,x=l.attributes.normal,y=l.groups,S=l.drawRange;if(f!==null)if(Array.isArray(c))for(let M=0,T=y.length;M<T;M++){const v=y[M],g=c[v.materialIndex],P=Math.max(v.start,S.start),L=Math.min(f.count,Math.min(v.start+v.count,S.start+S.count));for(let C=P,W=L;C<W;C+=3){const F=f.getX(C),I=f.getX(C+1),B=f.getX(C+2);a=Rl(this,g,e,r,m,_,x,F,I,B),a&&(a.faceIndex=Math.floor(C/3),a.face.materialIndex=v.materialIndex,t.push(a))}}else{const M=Math.max(0,S.start),T=Math.min(f.count,S.start+S.count);for(let v=M,g=T;v<g;v+=3){const P=f.getX(v),L=f.getX(v+1),C=f.getX(v+2);a=Rl(this,c,e,r,m,_,x,P,L,C),a&&(a.faceIndex=Math.floor(v/3),t.push(a))}}else if(h!==void 0)if(Array.isArray(c))for(let M=0,T=y.length;M<T;M++){const v=y[M],g=c[v.materialIndex],P=Math.max(v.start,S.start),L=Math.min(h.count,Math.min(v.start+v.count,S.start+S.count));for(let C=P,W=L;C<W;C+=3){const F=C,I=C+1,B=C+2;a=Rl(this,g,e,r,m,_,x,F,I,B),a&&(a.faceIndex=Math.floor(C/3),a.face.materialIndex=v.materialIndex,t.push(a))}}else{const M=Math.max(0,S.start),T=Math.min(h.count,S.start+S.count);for(let v=M,g=T;v<g;v+=3){const P=v,L=v+1,C=v+2;a=Rl(this,c,e,r,m,_,x,P,L,C),a&&(a.faceIndex=Math.floor(v/3),t.push(a))}}}}function ux(s,e,t,r,a,l,c,f){let h;if(e.side===Rn?h=r.intersectTriangle(c,l,a,!0,f):h=r.intersectTriangle(a,l,c,e.side===br,f),h===null)return null;Cl.copy(f),Cl.applyMatrix4(s.matrixWorld);const m=t.ray.origin.distanceTo(Cl);return m<t.near||m>t.far?null:{distance:m,point:Cl.clone(),object:s}}function Rl(s,e,t,r,a,l,c,f,h,m){s.getVertexPosition(f,El),s.getVertexPosition(h,Tl),s.getVertexPosition(m,wl);const _=ux(s,e,t,r,El,Tl,wl,Pm);if(_){const x=new G;ni.getBarycoord(Pm,El,Tl,wl,x),a&&(_.uv=ni.getInterpolatedAttribute(a,f,h,m,x,new qe)),l&&(_.uv1=ni.getInterpolatedAttribute(l,f,h,m,x,new qe)),c&&(_.normal=ni.getInterpolatedAttribute(c,f,h,m,x,new G),_.normal.dot(r.direction)>0&&_.normal.multiplyScalar(-1));const y={a:f,b:h,c:m,normal:new G,materialIndex:0};ni.getNormal(El,Tl,wl,y.normal),_.face=y,_.barycoord=x}return _}class sa extends bn{constructor(e=1,t=1,r=1,a=1,l=1,c=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:r,widthSegments:a,heightSegments:l,depthSegments:c};const f=this;a=Math.floor(a),l=Math.floor(l),c=Math.floor(c);const h=[],m=[],_=[],x=[];let y=0,S=0;M("z","y","x",-1,-1,r,t,e,c,l,0),M("z","y","x",1,-1,r,t,-e,c,l,1),M("x","z","y",1,1,e,r,t,a,c,2),M("x","z","y",1,-1,e,r,-t,a,c,3),M("x","y","z",1,-1,e,t,r,a,l,4),M("x","y","z",-1,-1,e,t,-r,a,l,5),this.setIndex(h),this.setAttribute("position",new on(m,3)),this.setAttribute("normal",new on(_,3)),this.setAttribute("uv",new on(x,2));function M(T,v,g,P,L,C,W,F,I,B,b){const A=C/I,O=W/B,se=C/2,J=W/2,ue=F/2,ce=I+1,$=B+1;let oe=0,k=0;const le=new G;for(let re=0;re<$;re++){const N=re*O-J;for(let ie=0;ie<ce;ie++){const De=ie*A-se;le[T]=De*P,le[v]=N*L,le[g]=ue,m.push(le.x,le.y,le.z),le[T]=0,le[v]=0,le[g]=F>0?1:-1,_.push(le.x,le.y,le.z),x.push(ie/I),x.push(1-re/B),oe+=1}}for(let re=0;re<B;re++)for(let N=0;N<I;N++){const ie=y+N+ce*re,De=y+N+ce*(re+1),Q=y+(N+1)+ce*(re+1),fe=y+(N+1)+ce*re;h.push(ie,De,fe),h.push(De,Q,fe),k+=6}f.addGroup(S,k,b),S+=k,y+=oe}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new sa(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}function lo(s){const e={};for(const t in s){e[t]={};for(const r in s[t]){const a=s[t][r];a&&(a.isColor||a.isMatrix3||a.isMatrix4||a.isVector2||a.isVector3||a.isVector4||a.isTexture||a.isQuaternion)?a.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][r]=null):e[t][r]=a.clone():Array.isArray(a)?e[t][r]=a.slice():e[t][r]=a}}return e}function Tn(s){const e={};for(let t=0;t<s.length;t++){const r=lo(s[t]);for(const a in r)e[a]=r[a]}return e}function cx(s){const e=[];for(let t=0;t<s.length;t++)e.push(s[t].clone());return e}function jg(s){const e=s.getRenderTarget();return e===null?s.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:yt.workingColorSpace}const fx={clone:lo,merge:Tn};var dx=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,hx=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class Lr extends Dr{static get type(){return"ShaderMaterial"}constructor(e){super(),this.isShaderMaterial=!0,this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=dx,this.fragmentShader=hx,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=lo(e.uniforms),this.uniformsGroups=cx(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){const t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(const a in this.uniforms){const c=this.uniforms[a].value;c&&c.isTexture?t.uniforms[a]={type:"t",value:c.toJSON(e).uuid}:c&&c.isColor?t.uniforms[a]={type:"c",value:c.getHex()}:c&&c.isVector2?t.uniforms[a]={type:"v2",value:c.toArray()}:c&&c.isVector3?t.uniforms[a]={type:"v3",value:c.toArray()}:c&&c.isVector4?t.uniforms[a]={type:"v4",value:c.toArray()}:c&&c.isMatrix3?t.uniforms[a]={type:"m3",value:c.toArray()}:c&&c.isMatrix4?t.uniforms[a]={type:"m4",value:c.toArray()}:t.uniforms[a]={value:c}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;const r={};for(const a in this.extensions)this.extensions[a]===!0&&(r[a]=!0);return Object.keys(r).length>0&&(t.extensions=r),t}}class Yg extends Yt{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Lt,this.projectionMatrix=new Lt,this.projectionMatrixInverse=new Lt,this.coordinateSystem=Yi}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}const Mr=new G,Lm=new qe,Dm=new qe;class ti extends Yg{constructor(e=50,t=1,r=.1,a=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=r,this.far=a,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const t=.5*this.getFilmHeight()/e;this.fov=dd*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(jl*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return dd*2*Math.atan(Math.tan(jl*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,r){Mr.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(Mr.x,Mr.y).multiplyScalar(-e/Mr.z),Mr.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),r.set(Mr.x,Mr.y).multiplyScalar(-e/Mr.z)}getViewSize(e,t){return this.getViewBounds(e,Lm,Dm),t.subVectors(Dm,Lm)}setViewOffset(e,t,r,a,l,c){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=r,this.view.offsetY=a,this.view.width=l,this.view.height=c,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let t=e*Math.tan(jl*.5*this.fov)/this.zoom,r=2*t,a=this.aspect*r,l=-.5*a;const c=this.view;if(this.view!==null&&this.view.enabled){const h=c.fullWidth,m=c.fullHeight;l+=c.offsetX*a/h,t-=c.offsetY*r/m,a*=c.width/h,r*=c.height/m}const f=this.filmOffset;f!==0&&(l+=e*f/this.getFilmWidth()),this.projectionMatrix.makePerspective(l,l+a,t,t-r,e,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}}const Vs=-90,Gs=1;class px extends Yt{constructor(e,t,r){super(),this.type="CubeCamera",this.renderTarget=r,this.coordinateSystem=null,this.activeMipmapLevel=0;const a=new ti(Vs,Gs,e,t);a.layers=this.layers,this.add(a);const l=new ti(Vs,Gs,e,t);l.layers=this.layers,this.add(l);const c=new ti(Vs,Gs,e,t);c.layers=this.layers,this.add(c);const f=new ti(Vs,Gs,e,t);f.layers=this.layers,this.add(f);const h=new ti(Vs,Gs,e,t);h.layers=this.layers,this.add(h);const m=new ti(Vs,Gs,e,t);m.layers=this.layers,this.add(m)}updateCoordinateSystem(){const e=this.coordinateSystem,t=this.children.concat(),[r,a,l,c,f,h]=t;for(const m of t)this.remove(m);if(e===Yi)r.up.set(0,1,0),r.lookAt(1,0,0),a.up.set(0,1,0),a.lookAt(-1,0,0),l.up.set(0,0,-1),l.lookAt(0,1,0),c.up.set(0,0,1),c.lookAt(0,-1,0),f.up.set(0,1,0),f.lookAt(0,0,1),h.up.set(0,1,0),h.lookAt(0,0,-1);else if(e===$l)r.up.set(0,-1,0),r.lookAt(-1,0,0),a.up.set(0,-1,0),a.lookAt(1,0,0),l.up.set(0,0,1),l.lookAt(0,1,0),c.up.set(0,0,-1),c.lookAt(0,-1,0),f.up.set(0,-1,0),f.lookAt(0,0,1),h.up.set(0,-1,0),h.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const m of t)this.add(m),m.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();const{renderTarget:r,activeMipmapLevel:a}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[l,c,f,h,m,_]=this.children,x=e.getRenderTarget(),y=e.getActiveCubeFace(),S=e.getActiveMipmapLevel(),M=e.xr.enabled;e.xr.enabled=!1;const T=r.texture.generateMipmaps;r.texture.generateMipmaps=!1,e.setRenderTarget(r,0,a),e.render(t,l),e.setRenderTarget(r,1,a),e.render(t,c),e.setRenderTarget(r,2,a),e.render(t,f),e.setRenderTarget(r,3,a),e.render(t,h),e.setRenderTarget(r,4,a),e.render(t,m),r.texture.generateMipmaps=T,e.setRenderTarget(r,5,a),e.render(t,_),e.setRenderTarget(x,y,S),e.xr.enabled=M,r.texture.needsPMREMUpdate=!0}}class qg extends _n{constructor(e,t,r,a,l,c,f,h,m,_){e=e!==void 0?e:[],t=t!==void 0?t:io,super(e,t,r,a,l,c,f,h,m,_),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class mx extends ss{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;const r={width:e,height:e,depth:1},a=[r,r,r,r,r,r];this.texture=new qg(a,t.mapping,t.wrapS,t.wrapT,t.magFilter,t.minFilter,t.format,t.type,t.anisotropy,t.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=t.generateMipmaps!==void 0?t.generateMipmaps:!1,this.texture.minFilter=t.minFilter!==void 0?t.minFilter:Ai}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;const r={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},a=new sa(5,5,5),l=new Lr({name:"CubemapFromEquirect",uniforms:lo(r.uniforms),vertexShader:r.vertexShader,fragmentShader:r.fragmentShader,side:Rn,blending:Ar});l.uniforms.tEquirect.value=t;const c=new kn(a,l),f=t.minFilter;return t.minFilter===is&&(t.minFilter=Ai),new px(1,10,this).update(e,c),t.minFilter=f,c.geometry.dispose(),c.material.dispose(),this}clear(e,t,r,a){const l=e.getRenderTarget();for(let c=0;c<6;c++)e.setRenderTarget(this,c),e.clear(t,r,a);e.setRenderTarget(l)}}const uf=new G,gx=new G,_x=new at;class Er{constructor(e=new G(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,r,a){return this.normal.set(e,t,r),this.constant=a,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,r){const a=uf.subVectors(r,t).cross(gx.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(a,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){const r=e.delta(uf),a=this.normal.dot(r);if(a===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;const l=-(e.start.dot(this.normal)+this.constant)/a;return l<0||l>1?null:t.copy(e.start).addScaledVector(r,l)}intersectsLine(e){const t=this.distanceToPoint(e.start),r=this.distanceToPoint(e.end);return t<0&&r>0||r<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){const r=t||_x.getNormalMatrix(e),a=this.coplanarPoint(uf).applyMatrix4(e),l=this.normal.applyMatrix3(r).normalize();return this.constant=-a.dot(l),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}}const Kr=new ra,bl=new G;class Td{constructor(e=new Er,t=new Er,r=new Er,a=new Er,l=new Er,c=new Er){this.planes=[e,t,r,a,l,c]}set(e,t,r,a,l,c){const f=this.planes;return f[0].copy(e),f[1].copy(t),f[2].copy(r),f[3].copy(a),f[4].copy(l),f[5].copy(c),this}copy(e){const t=this.planes;for(let r=0;r<6;r++)t[r].copy(e.planes[r]);return this}setFromProjectionMatrix(e,t=Yi){const r=this.planes,a=e.elements,l=a[0],c=a[1],f=a[2],h=a[3],m=a[4],_=a[5],x=a[6],y=a[7],S=a[8],M=a[9],T=a[10],v=a[11],g=a[12],P=a[13],L=a[14],C=a[15];if(r[0].setComponents(h-l,y-m,v-S,C-g).normalize(),r[1].setComponents(h+l,y+m,v+S,C+g).normalize(),r[2].setComponents(h+c,y+_,v+M,C+P).normalize(),r[3].setComponents(h-c,y-_,v-M,C-P).normalize(),r[4].setComponents(h-f,y-x,v-T,C-L).normalize(),t===Yi)r[5].setComponents(h+f,y+x,v+T,C+L).normalize();else if(t===$l)r[5].setComponents(f,x,T,L).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),Kr.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),Kr.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(Kr)}intersectsSprite(e){return Kr.center.set(0,0,0),Kr.radius=.7071067811865476,Kr.applyMatrix4(e.matrixWorld),this.intersectsSphere(Kr)}intersectsSphere(e){const t=this.planes,r=e.center,a=-e.radius;for(let l=0;l<6;l++)if(t[l].distanceToPoint(r)<a)return!1;return!0}intersectsBox(e){const t=this.planes;for(let r=0;r<6;r++){const a=t[r];if(bl.x=a.normal.x>0?e.max.x:e.min.x,bl.y=a.normal.y>0?e.max.y:e.min.y,bl.z=a.normal.z>0?e.max.z:e.min.z,a.distanceToPoint(bl)<0)return!1}return!0}containsPoint(e){const t=this.planes;for(let r=0;r<6;r++)if(t[r].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}function $g(){let s=null,e=!1,t=null,r=null;function a(l,c){t(l,c),r=s.requestAnimationFrame(a)}return{start:function(){e!==!0&&t!==null&&(r=s.requestAnimationFrame(a),e=!0)},stop:function(){s.cancelAnimationFrame(r),e=!1},setAnimationLoop:function(l){t=l},setContext:function(l){s=l}}}function vx(s){const e=new WeakMap;function t(f,h){const m=f.array,_=f.usage,x=m.byteLength,y=s.createBuffer();s.bindBuffer(h,y),s.bufferData(h,m,_),f.onUploadCallback();let S;if(m instanceof Float32Array)S=s.FLOAT;else if(m instanceof Uint16Array)f.isFloat16BufferAttribute?S=s.HALF_FLOAT:S=s.UNSIGNED_SHORT;else if(m instanceof Int16Array)S=s.SHORT;else if(m instanceof Uint32Array)S=s.UNSIGNED_INT;else if(m instanceof Int32Array)S=s.INT;else if(m instanceof Int8Array)S=s.BYTE;else if(m instanceof Uint8Array)S=s.UNSIGNED_BYTE;else if(m instanceof Uint8ClampedArray)S=s.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+m);return{buffer:y,type:S,bytesPerElement:m.BYTES_PER_ELEMENT,version:f.version,size:x}}function r(f,h,m){const _=h.array,x=h.updateRanges;if(s.bindBuffer(m,f),x.length===0)s.bufferSubData(m,0,_);else{x.sort((S,M)=>S.start-M.start);let y=0;for(let S=1;S<x.length;S++){const M=x[y],T=x[S];T.start<=M.start+M.count+1?M.count=Math.max(M.count,T.start+T.count-M.start):(++y,x[y]=T)}x.length=y+1;for(let S=0,M=x.length;S<M;S++){const T=x[S];s.bufferSubData(m,T.start*_.BYTES_PER_ELEMENT,_,T.start,T.count)}h.clearUpdateRanges()}h.onUploadCallback()}function a(f){return f.isInterleavedBufferAttribute&&(f=f.data),e.get(f)}function l(f){f.isInterleavedBufferAttribute&&(f=f.data);const h=e.get(f);h&&(s.deleteBuffer(h.buffer),e.delete(f))}function c(f,h){if(f.isInterleavedBufferAttribute&&(f=f.data),f.isGLBufferAttribute){const _=e.get(f);(!_||_.version<f.version)&&e.set(f,{buffer:f.buffer,type:f.type,bytesPerElement:f.elementSize,version:f.version});return}const m=e.get(f);if(m===void 0)e.set(f,t(f,h));else if(m.version<f.version){if(m.size!==f.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");r(m.buffer,f,h),m.version=f.version}}return{get:a,remove:l,update:c}}class iu extends bn{constructor(e=1,t=1,r=1,a=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:r,heightSegments:a};const l=e/2,c=t/2,f=Math.floor(r),h=Math.floor(a),m=f+1,_=h+1,x=e/f,y=t/h,S=[],M=[],T=[],v=[];for(let g=0;g<_;g++){const P=g*y-c;for(let L=0;L<m;L++){const C=L*x-l;M.push(C,-P,0),T.push(0,0,1),v.push(L/f),v.push(1-g/h)}}for(let g=0;g<h;g++)for(let P=0;P<f;P++){const L=P+m*g,C=P+m*(g+1),W=P+1+m*(g+1),F=P+1+m*g;S.push(L,C,F),S.push(C,W,F)}this.setIndex(S),this.setAttribute("position",new on(M,3)),this.setAttribute("normal",new on(T,3)),this.setAttribute("uv",new on(v,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new iu(e.width,e.height,e.widthSegments,e.heightSegments)}}var xx=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,yx=`#ifdef USE_ALPHAHASH
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
#endif`,Sx=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Mx=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Ex=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,Tx=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,wx=`#ifdef USE_AOMAP
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
#endif`,Ax=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Cx=`#ifdef USE_BATCHING
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
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,Rx=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,bx=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,Px=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Lx=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,Dx=`#ifdef USE_IRIDESCENCE
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
#endif`,Ux=`#ifdef USE_BUMPMAP
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
#endif`,Ix=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,Nx=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Fx=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Ox=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,zx=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,kx=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,Bx=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,Hx=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`,Vx=`#define PI 3.141592653589793
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
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
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
} // validated`,Gx=`#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif`,Wx=`vec3 transformedNormal = objectNormal;
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
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,Xx=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,jx=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Yx=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,qx=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,$x="gl_FragColor = linearToOutputTexel( gl_FragColor );",Kx=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,Zx=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,Qx=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif

#endif`,Jx=`#ifdef USE_ENVMAP
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
#endif`,ey=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS

		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,ty=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,ny=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,iy=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,ry=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,sy=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,oy=`#ifdef USE_GRADIENTMAP
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
}`,ay=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,ly=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,uy=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,cy=`uniform bool receiveShadow;
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
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
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
#endif`,fy=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
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
#endif`,dy=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,hy=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,py=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,my=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,gy=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
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
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
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
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
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
#endif`,_y=`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
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
		float v = 0.5 / ( gv + gl );
		return saturate(v);
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
	vec3 f0 = material.specularColor;
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
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
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
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
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
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
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
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,vy=`
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
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
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
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
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
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,xy=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
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
#endif`,yy=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,Sy=`#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,My=`#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Ey=`#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Ty=`#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,wy=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,Ay=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Cy=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,Ry=`#if defined( USE_POINTS_UV )
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
#endif`,by=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Py=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Ly=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,Dy=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,Uy=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Iy=`#ifdef USE_MORPHTARGETS
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
#endif`,Ny=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Fy=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
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
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,Oy=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,zy=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,ky=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,By=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,Hy=`#ifdef USE_NORMALMAP
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
#endif`,Vy=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,Gy=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,Wy=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,Xy=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,jy=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,Yy=`vec3 packNormalToRGB( const in vec3 normal ) {
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
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,qy=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,$y=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,Ky=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,Zy=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,Qy=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,Jy=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,eS=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
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
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
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
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
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
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		return step( compare, unpackRGBAToDepth( texture2D( depths, uv ) ) );
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow (sampler2D shadow, vec2 uv, float compare ){
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		float hard_shadow = step( compare , distribution.x );
		if (hard_shadow != 1.0 ) {
			float distance = compare - distribution.x ;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;

		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
#endif`,tS=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,nS=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
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
#endif`,iS=`float getShadowMask() {
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
	#if NUM_POINT_LIGHT_SHADOWS > 0
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
}`,rS=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,sS=`#ifdef USE_SKINNING
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
#endif`,oS=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,aS=`#ifdef USE_SKINNING
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
#endif`,lS=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,uS=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,cS=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,fS=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,dS=`#ifdef USE_TRANSMISSION
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
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,hS=`#ifdef USE_TRANSMISSION
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
#endif`,pS=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,mS=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,gS=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,_S=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const vS=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,xS=`uniform sampler2D t2D;
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
}`,yS=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,SS=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,MS=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,ES=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,TS=`#include <common>
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
}`,wS=`#if DEPTH_PACKING == 3200
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
	float fragCoordZ = 0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5;
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,AS=`#define DISTANCE
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
}`,CS=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,RS=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,bS=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,PS=`uniform float scale;
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
}`,LS=`uniform vec3 diffuse;
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
}`,DS=`#include <common>
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
}`,US=`uniform vec3 diffuse;
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
}`,IS=`#define LAMBERT
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
}`,NS=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
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
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
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
}`,FS=`#define MATCAP
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
}`,OS=`#define MATCAP
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
}`,zS=`#define NORMAL
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
}`,kS=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
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
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,BS=`#define PHONG
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
}`,HS=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
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
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
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
}`,VS=`#define STANDARD
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
}`,GS=`#define STANDARD
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
#include <packing>
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
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
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
}`,WS=`#define TOON
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
}`,XS=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
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
}`,jS=`uniform float size;
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
}`,YS=`uniform vec3 diffuse;
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
}`,qS=`#include <common>
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
}`,$S=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
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
}`,KS=`uniform float rotation;
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
}`,ZS=`uniform vec3 diffuse;
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
}`,lt={alphahash_fragment:xx,alphahash_pars_fragment:yx,alphamap_fragment:Sx,alphamap_pars_fragment:Mx,alphatest_fragment:Ex,alphatest_pars_fragment:Tx,aomap_fragment:wx,aomap_pars_fragment:Ax,batching_pars_vertex:Cx,batching_vertex:Rx,begin_vertex:bx,beginnormal_vertex:Px,bsdfs:Lx,iridescence_fragment:Dx,bumpmap_pars_fragment:Ux,clipping_planes_fragment:Ix,clipping_planes_pars_fragment:Nx,clipping_planes_pars_vertex:Fx,clipping_planes_vertex:Ox,color_fragment:zx,color_pars_fragment:kx,color_pars_vertex:Bx,color_vertex:Hx,common:Vx,cube_uv_reflection_fragment:Gx,defaultnormal_vertex:Wx,displacementmap_pars_vertex:Xx,displacementmap_vertex:jx,emissivemap_fragment:Yx,emissivemap_pars_fragment:qx,colorspace_fragment:$x,colorspace_pars_fragment:Kx,envmap_fragment:Zx,envmap_common_pars_fragment:Qx,envmap_pars_fragment:Jx,envmap_pars_vertex:ey,envmap_physical_pars_fragment:fy,envmap_vertex:ty,fog_vertex:ny,fog_pars_vertex:iy,fog_fragment:ry,fog_pars_fragment:sy,gradientmap_pars_fragment:oy,lightmap_pars_fragment:ay,lights_lambert_fragment:ly,lights_lambert_pars_fragment:uy,lights_pars_begin:cy,lights_toon_fragment:dy,lights_toon_pars_fragment:hy,lights_phong_fragment:py,lights_phong_pars_fragment:my,lights_physical_fragment:gy,lights_physical_pars_fragment:_y,lights_fragment_begin:vy,lights_fragment_maps:xy,lights_fragment_end:yy,logdepthbuf_fragment:Sy,logdepthbuf_pars_fragment:My,logdepthbuf_pars_vertex:Ey,logdepthbuf_vertex:Ty,map_fragment:wy,map_pars_fragment:Ay,map_particle_fragment:Cy,map_particle_pars_fragment:Ry,metalnessmap_fragment:by,metalnessmap_pars_fragment:Py,morphinstance_vertex:Ly,morphcolor_vertex:Dy,morphnormal_vertex:Uy,morphtarget_pars_vertex:Iy,morphtarget_vertex:Ny,normal_fragment_begin:Fy,normal_fragment_maps:Oy,normal_pars_fragment:zy,normal_pars_vertex:ky,normal_vertex:By,normalmap_pars_fragment:Hy,clearcoat_normal_fragment_begin:Vy,clearcoat_normal_fragment_maps:Gy,clearcoat_pars_fragment:Wy,iridescence_pars_fragment:Xy,opaque_fragment:jy,packing:Yy,premultiplied_alpha_fragment:qy,project_vertex:$y,dithering_fragment:Ky,dithering_pars_fragment:Zy,roughnessmap_fragment:Qy,roughnessmap_pars_fragment:Jy,shadowmap_pars_fragment:eS,shadowmap_pars_vertex:tS,shadowmap_vertex:nS,shadowmask_pars_fragment:iS,skinbase_vertex:rS,skinning_pars_vertex:sS,skinning_vertex:oS,skinnormal_vertex:aS,specularmap_fragment:lS,specularmap_pars_fragment:uS,tonemapping_fragment:cS,tonemapping_pars_fragment:fS,transmission_fragment:dS,transmission_pars_fragment:hS,uv_pars_fragment:pS,uv_pars_vertex:mS,uv_vertex:gS,worldpos_vertex:_S,background_vert:vS,background_frag:xS,backgroundCube_vert:yS,backgroundCube_frag:SS,cube_vert:MS,cube_frag:ES,depth_vert:TS,depth_frag:wS,distanceRGBA_vert:AS,distanceRGBA_frag:CS,equirect_vert:RS,equirect_frag:bS,linedashed_vert:PS,linedashed_frag:LS,meshbasic_vert:DS,meshbasic_frag:US,meshlambert_vert:IS,meshlambert_frag:NS,meshmatcap_vert:FS,meshmatcap_frag:OS,meshnormal_vert:zS,meshnormal_frag:kS,meshphong_vert:BS,meshphong_frag:HS,meshphysical_vert:VS,meshphysical_frag:GS,meshtoon_vert:WS,meshtoon_frag:XS,points_vert:jS,points_frag:YS,shadow_vert:qS,shadow_frag:$S,sprite_vert:KS,sprite_frag:ZS},be={common:{diffuse:{value:new pt(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new at},alphaMap:{value:null},alphaMapTransform:{value:new at},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new at}},envmap:{envMap:{value:null},envMapRotation:{value:new at},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new at}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new at}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new at},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new at},normalScale:{value:new qe(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new at},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new at}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new at}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new at}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new pt(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new pt(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new at},alphaTest:{value:0},uvTransform:{value:new at}},sprite:{diffuse:{value:new pt(16777215)},opacity:{value:1},center:{value:new qe(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new at},alphaMap:{value:null},alphaMapTransform:{value:new at},alphaTest:{value:0}}},Ei={basic:{uniforms:Tn([be.common,be.specularmap,be.envmap,be.aomap,be.lightmap,be.fog]),vertexShader:lt.meshbasic_vert,fragmentShader:lt.meshbasic_frag},lambert:{uniforms:Tn([be.common,be.specularmap,be.envmap,be.aomap,be.lightmap,be.emissivemap,be.bumpmap,be.normalmap,be.displacementmap,be.fog,be.lights,{emissive:{value:new pt(0)}}]),vertexShader:lt.meshlambert_vert,fragmentShader:lt.meshlambert_frag},phong:{uniforms:Tn([be.common,be.specularmap,be.envmap,be.aomap,be.lightmap,be.emissivemap,be.bumpmap,be.normalmap,be.displacementmap,be.fog,be.lights,{emissive:{value:new pt(0)},specular:{value:new pt(1118481)},shininess:{value:30}}]),vertexShader:lt.meshphong_vert,fragmentShader:lt.meshphong_frag},standard:{uniforms:Tn([be.common,be.envmap,be.aomap,be.lightmap,be.emissivemap,be.bumpmap,be.normalmap,be.displacementmap,be.roughnessmap,be.metalnessmap,be.fog,be.lights,{emissive:{value:new pt(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:lt.meshphysical_vert,fragmentShader:lt.meshphysical_frag},toon:{uniforms:Tn([be.common,be.aomap,be.lightmap,be.emissivemap,be.bumpmap,be.normalmap,be.displacementmap,be.gradientmap,be.fog,be.lights,{emissive:{value:new pt(0)}}]),vertexShader:lt.meshtoon_vert,fragmentShader:lt.meshtoon_frag},matcap:{uniforms:Tn([be.common,be.bumpmap,be.normalmap,be.displacementmap,be.fog,{matcap:{value:null}}]),vertexShader:lt.meshmatcap_vert,fragmentShader:lt.meshmatcap_frag},points:{uniforms:Tn([be.points,be.fog]),vertexShader:lt.points_vert,fragmentShader:lt.points_frag},dashed:{uniforms:Tn([be.common,be.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:lt.linedashed_vert,fragmentShader:lt.linedashed_frag},depth:{uniforms:Tn([be.common,be.displacementmap]),vertexShader:lt.depth_vert,fragmentShader:lt.depth_frag},normal:{uniforms:Tn([be.common,be.bumpmap,be.normalmap,be.displacementmap,{opacity:{value:1}}]),vertexShader:lt.meshnormal_vert,fragmentShader:lt.meshnormal_frag},sprite:{uniforms:Tn([be.sprite,be.fog]),vertexShader:lt.sprite_vert,fragmentShader:lt.sprite_frag},background:{uniforms:{uvTransform:{value:new at},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:lt.background_vert,fragmentShader:lt.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new at}},vertexShader:lt.backgroundCube_vert,fragmentShader:lt.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:lt.cube_vert,fragmentShader:lt.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:lt.equirect_vert,fragmentShader:lt.equirect_frag},distanceRGBA:{uniforms:Tn([be.common,be.displacementmap,{referencePosition:{value:new G},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:lt.distanceRGBA_vert,fragmentShader:lt.distanceRGBA_frag},shadow:{uniforms:Tn([be.lights,be.fog,{color:{value:new pt(0)},opacity:{value:1}}]),vertexShader:lt.shadow_vert,fragmentShader:lt.shadow_frag}};Ei.physical={uniforms:Tn([Ei.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new at},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new at},clearcoatNormalScale:{value:new qe(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new at},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new at},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new at},sheen:{value:0},sheenColor:{value:new pt(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new at},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new at},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new at},transmissionSamplerSize:{value:new qe},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new at},attenuationDistance:{value:0},attenuationColor:{value:new pt(0)},specularColor:{value:new pt(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new at},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new at},anisotropyVector:{value:new qe},anisotropyMap:{value:null},anisotropyMapTransform:{value:new at}}]),vertexShader:lt.meshphysical_vert,fragmentShader:lt.meshphysical_frag};const Pl={r:0,b:0,g:0},Zr=new Ci,QS=new Lt;function JS(s,e,t,r,a,l,c){const f=new pt(0);let h=l===!0?0:1,m,_,x=null,y=0,S=null;function M(P){let L=P.isScene===!0?P.background:null;return L&&L.isTexture&&(L=(P.backgroundBlurriness>0?t:e).get(L)),L}function T(P){let L=!1;const C=M(P);C===null?g(f,h):C&&C.isColor&&(g(C,1),L=!0);const W=s.xr.getEnvironmentBlendMode();W==="additive"?r.buffers.color.setClear(0,0,0,1,c):W==="alpha-blend"&&r.buffers.color.setClear(0,0,0,0,c),(s.autoClear||L)&&(r.buffers.depth.setTest(!0),r.buffers.depth.setMask(!0),r.buffers.color.setMask(!0),s.clear(s.autoClearColor,s.autoClearDepth,s.autoClearStencil))}function v(P,L){const C=M(L);C&&(C.isCubeTexture||C.mapping===eu)?(_===void 0&&(_=new kn(new sa(1,1,1),new Lr({name:"BackgroundCubeMaterial",uniforms:lo(Ei.backgroundCube.uniforms),vertexShader:Ei.backgroundCube.vertexShader,fragmentShader:Ei.backgroundCube.fragmentShader,side:Rn,depthTest:!1,depthWrite:!1,fog:!1})),_.geometry.deleteAttribute("normal"),_.geometry.deleteAttribute("uv"),_.onBeforeRender=function(W,F,I){this.matrixWorld.copyPosition(I.matrixWorld)},Object.defineProperty(_.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),a.update(_)),Zr.copy(L.backgroundRotation),Zr.x*=-1,Zr.y*=-1,Zr.z*=-1,C.isCubeTexture&&C.isRenderTargetTexture===!1&&(Zr.y*=-1,Zr.z*=-1),_.material.uniforms.envMap.value=C,_.material.uniforms.flipEnvMap.value=C.isCubeTexture&&C.isRenderTargetTexture===!1?-1:1,_.material.uniforms.backgroundBlurriness.value=L.backgroundBlurriness,_.material.uniforms.backgroundIntensity.value=L.backgroundIntensity,_.material.uniforms.backgroundRotation.value.setFromMatrix4(QS.makeRotationFromEuler(Zr)),_.material.toneMapped=yt.getTransfer(C.colorSpace)!==Rt,(x!==C||y!==C.version||S!==s.toneMapping)&&(_.material.needsUpdate=!0,x=C,y=C.version,S=s.toneMapping),_.layers.enableAll(),P.unshift(_,_.geometry,_.material,0,0,null)):C&&C.isTexture&&(m===void 0&&(m=new kn(new iu(2,2),new Lr({name:"BackgroundMaterial",uniforms:lo(Ei.background.uniforms),vertexShader:Ei.background.vertexShader,fragmentShader:Ei.background.fragmentShader,side:br,depthTest:!1,depthWrite:!1,fog:!1})),m.geometry.deleteAttribute("normal"),Object.defineProperty(m.material,"map",{get:function(){return this.uniforms.t2D.value}}),a.update(m)),m.material.uniforms.t2D.value=C,m.material.uniforms.backgroundIntensity.value=L.backgroundIntensity,m.material.toneMapped=yt.getTransfer(C.colorSpace)!==Rt,C.matrixAutoUpdate===!0&&C.updateMatrix(),m.material.uniforms.uvTransform.value.copy(C.matrix),(x!==C||y!==C.version||S!==s.toneMapping)&&(m.material.needsUpdate=!0,x=C,y=C.version,S=s.toneMapping),m.layers.enableAll(),P.unshift(m,m.geometry,m.material,0,0,null))}function g(P,L){P.getRGB(Pl,jg(s)),r.buffers.color.setClear(Pl.r,Pl.g,Pl.b,L,c)}return{getClearColor:function(){return f},setClearColor:function(P,L=1){f.set(P),h=L,g(f,h)},getClearAlpha:function(){return h},setClearAlpha:function(P){h=P,g(f,h)},render:T,addToRenderList:v}}function eM(s,e){const t=s.getParameter(s.MAX_VERTEX_ATTRIBS),r={},a=y(null);let l=a,c=!1;function f(A,O,se,J,ue){let ce=!1;const $=x(J,se,O);l!==$&&(l=$,m(l.object)),ce=S(A,J,se,ue),ce&&M(A,J,se,ue),ue!==null&&e.update(ue,s.ELEMENT_ARRAY_BUFFER),(ce||c)&&(c=!1,C(A,O,se,J),ue!==null&&s.bindBuffer(s.ELEMENT_ARRAY_BUFFER,e.get(ue).buffer))}function h(){return s.createVertexArray()}function m(A){return s.bindVertexArray(A)}function _(A){return s.deleteVertexArray(A)}function x(A,O,se){const J=se.wireframe===!0;let ue=r[A.id];ue===void 0&&(ue={},r[A.id]=ue);let ce=ue[O.id];ce===void 0&&(ce={},ue[O.id]=ce);let $=ce[J];return $===void 0&&($=y(h()),ce[J]=$),$}function y(A){const O=[],se=[],J=[];for(let ue=0;ue<t;ue++)O[ue]=0,se[ue]=0,J[ue]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:O,enabledAttributes:se,attributeDivisors:J,object:A,attributes:{},index:null}}function S(A,O,se,J){const ue=l.attributes,ce=O.attributes;let $=0;const oe=se.getAttributes();for(const k in oe)if(oe[k].location>=0){const re=ue[k];let N=ce[k];if(N===void 0&&(k==="instanceMatrix"&&A.instanceMatrix&&(N=A.instanceMatrix),k==="instanceColor"&&A.instanceColor&&(N=A.instanceColor)),re===void 0||re.attribute!==N||N&&re.data!==N.data)return!0;$++}return l.attributesNum!==$||l.index!==J}function M(A,O,se,J){const ue={},ce=O.attributes;let $=0;const oe=se.getAttributes();for(const k in oe)if(oe[k].location>=0){let re=ce[k];re===void 0&&(k==="instanceMatrix"&&A.instanceMatrix&&(re=A.instanceMatrix),k==="instanceColor"&&A.instanceColor&&(re=A.instanceColor));const N={};N.attribute=re,re&&re.data&&(N.data=re.data),ue[k]=N,$++}l.attributes=ue,l.attributesNum=$,l.index=J}function T(){const A=l.newAttributes;for(let O=0,se=A.length;O<se;O++)A[O]=0}function v(A){g(A,0)}function g(A,O){const se=l.newAttributes,J=l.enabledAttributes,ue=l.attributeDivisors;se[A]=1,J[A]===0&&(s.enableVertexAttribArray(A),J[A]=1),ue[A]!==O&&(s.vertexAttribDivisor(A,O),ue[A]=O)}function P(){const A=l.newAttributes,O=l.enabledAttributes;for(let se=0,J=O.length;se<J;se++)O[se]!==A[se]&&(s.disableVertexAttribArray(se),O[se]=0)}function L(A,O,se,J,ue,ce,$){$===!0?s.vertexAttribIPointer(A,O,se,ue,ce):s.vertexAttribPointer(A,O,se,J,ue,ce)}function C(A,O,se,J){T();const ue=J.attributes,ce=se.getAttributes(),$=O.defaultAttributeValues;for(const oe in ce){const k=ce[oe];if(k.location>=0){let le=ue[oe];if(le===void 0&&(oe==="instanceMatrix"&&A.instanceMatrix&&(le=A.instanceMatrix),oe==="instanceColor"&&A.instanceColor&&(le=A.instanceColor)),le!==void 0){const re=le.normalized,N=le.itemSize,ie=e.get(le);if(ie===void 0)continue;const De=ie.buffer,Q=ie.type,fe=ie.bytesPerElement,Ee=Q===s.INT||Q===s.UNSIGNED_INT||le.gpuType===vd;if(le.isInterleavedBufferAttribute){const xe=le.data,Ae=xe.stride,Ie=le.offset;if(xe.isInstancedInterleavedBuffer){for(let Qe=0;Qe<k.locationSize;Qe++)g(k.location+Qe,xe.meshPerAttribute);A.isInstancedMesh!==!0&&J._maxInstanceCount===void 0&&(J._maxInstanceCount=xe.meshPerAttribute*xe.count)}else for(let Qe=0;Qe<k.locationSize;Qe++)v(k.location+Qe);s.bindBuffer(s.ARRAY_BUFFER,De);for(let Qe=0;Qe<k.locationSize;Qe++)L(k.location+Qe,N/k.locationSize,Q,re,Ae*fe,(Ie+N/k.locationSize*Qe)*fe,Ee)}else{if(le.isInstancedBufferAttribute){for(let xe=0;xe<k.locationSize;xe++)g(k.location+xe,le.meshPerAttribute);A.isInstancedMesh!==!0&&J._maxInstanceCount===void 0&&(J._maxInstanceCount=le.meshPerAttribute*le.count)}else for(let xe=0;xe<k.locationSize;xe++)v(k.location+xe);s.bindBuffer(s.ARRAY_BUFFER,De);for(let xe=0;xe<k.locationSize;xe++)L(k.location+xe,N/k.locationSize,Q,re,N*fe,N/k.locationSize*xe*fe,Ee)}}else if($!==void 0){const re=$[oe];if(re!==void 0)switch(re.length){case 2:s.vertexAttrib2fv(k.location,re);break;case 3:s.vertexAttrib3fv(k.location,re);break;case 4:s.vertexAttrib4fv(k.location,re);break;default:s.vertexAttrib1fv(k.location,re)}}}}P()}function W(){B();for(const A in r){const O=r[A];for(const se in O){const J=O[se];for(const ue in J)_(J[ue].object),delete J[ue];delete O[se]}delete r[A]}}function F(A){if(r[A.id]===void 0)return;const O=r[A.id];for(const se in O){const J=O[se];for(const ue in J)_(J[ue].object),delete J[ue];delete O[se]}delete r[A.id]}function I(A){for(const O in r){const se=r[O];if(se[A.id]===void 0)continue;const J=se[A.id];for(const ue in J)_(J[ue].object),delete J[ue];delete se[A.id]}}function B(){b(),c=!0,l!==a&&(l=a,m(l.object))}function b(){a.geometry=null,a.program=null,a.wireframe=!1}return{setup:f,reset:B,resetDefaultState:b,dispose:W,releaseStatesOfGeometry:F,releaseStatesOfProgram:I,initAttributes:T,enableAttribute:v,disableUnusedAttributes:P}}function tM(s,e,t){let r;function a(m){r=m}function l(m,_){s.drawArrays(r,m,_),t.update(_,r,1)}function c(m,_,x){x!==0&&(s.drawArraysInstanced(r,m,_,x),t.update(_,r,x))}function f(m,_,x){if(x===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(r,m,0,_,0,x);let S=0;for(let M=0;M<x;M++)S+=_[M];t.update(S,r,1)}function h(m,_,x,y){if(x===0)return;const S=e.get("WEBGL_multi_draw");if(S===null)for(let M=0;M<m.length;M++)c(m[M],_[M],y[M]);else{S.multiDrawArraysInstancedWEBGL(r,m,0,_,0,y,0,x);let M=0;for(let T=0;T<x;T++)M+=_[T]*y[T];t.update(M,r,1)}}this.setMode=a,this.render=l,this.renderInstances=c,this.renderMultiDraw=f,this.renderMultiDrawInstances=h}function nM(s,e,t,r){let a;function l(){if(a!==void 0)return a;if(e.has("EXT_texture_filter_anisotropic")===!0){const I=e.get("EXT_texture_filter_anisotropic");a=s.getParameter(I.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else a=0;return a}function c(I){return!(I!==pi&&r.convert(I)!==s.getParameter(s.IMPLEMENTATION_COLOR_READ_FORMAT))}function f(I){const B=I===na&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(I!==$i&&r.convert(I)!==s.getParameter(s.IMPLEMENTATION_COLOR_READ_TYPE)&&I!==ji&&!B)}function h(I){if(I==="highp"){if(s.getShaderPrecisionFormat(s.VERTEX_SHADER,s.HIGH_FLOAT).precision>0&&s.getShaderPrecisionFormat(s.FRAGMENT_SHADER,s.HIGH_FLOAT).precision>0)return"highp";I="mediump"}return I==="mediump"&&s.getShaderPrecisionFormat(s.VERTEX_SHADER,s.MEDIUM_FLOAT).precision>0&&s.getShaderPrecisionFormat(s.FRAGMENT_SHADER,s.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let m=t.precision!==void 0?t.precision:"highp";const _=h(m);_!==m&&(console.warn("THREE.WebGLRenderer:",m,"not supported, using",_,"instead."),m=_);const x=t.logarithmicDepthBuffer===!0,y=t.reverseDepthBuffer===!0&&e.has("EXT_clip_control"),S=s.getParameter(s.MAX_TEXTURE_IMAGE_UNITS),M=s.getParameter(s.MAX_VERTEX_TEXTURE_IMAGE_UNITS),T=s.getParameter(s.MAX_TEXTURE_SIZE),v=s.getParameter(s.MAX_CUBE_MAP_TEXTURE_SIZE),g=s.getParameter(s.MAX_VERTEX_ATTRIBS),P=s.getParameter(s.MAX_VERTEX_UNIFORM_VECTORS),L=s.getParameter(s.MAX_VARYING_VECTORS),C=s.getParameter(s.MAX_FRAGMENT_UNIFORM_VECTORS),W=M>0,F=s.getParameter(s.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:l,getMaxPrecision:h,textureFormatReadable:c,textureTypeReadable:f,precision:m,logarithmicDepthBuffer:x,reverseDepthBuffer:y,maxTextures:S,maxVertexTextures:M,maxTextureSize:T,maxCubemapSize:v,maxAttributes:g,maxVertexUniforms:P,maxVaryings:L,maxFragmentUniforms:C,vertexTextures:W,maxSamples:F}}function iM(s){const e=this;let t=null,r=0,a=!1,l=!1;const c=new Er,f=new at,h={value:null,needsUpdate:!1};this.uniform=h,this.numPlanes=0,this.numIntersection=0,this.init=function(x,y){const S=x.length!==0||y||r!==0||a;return a=y,r=x.length,S},this.beginShadows=function(){l=!0,_(null)},this.endShadows=function(){l=!1},this.setGlobalState=function(x,y){t=_(x,y,0)},this.setState=function(x,y,S){const M=x.clippingPlanes,T=x.clipIntersection,v=x.clipShadows,g=s.get(x);if(!a||M===null||M.length===0||l&&!v)l?_(null):m();else{const P=l?0:r,L=P*4;let C=g.clippingState||null;h.value=C,C=_(M,y,L,S);for(let W=0;W!==L;++W)C[W]=t[W];g.clippingState=C,this.numIntersection=T?this.numPlanes:0,this.numPlanes+=P}};function m(){h.value!==t&&(h.value=t,h.needsUpdate=r>0),e.numPlanes=r,e.numIntersection=0}function _(x,y,S,M){const T=x!==null?x.length:0;let v=null;if(T!==0){if(v=h.value,M!==!0||v===null){const g=S+T*4,P=y.matrixWorldInverse;f.getNormalMatrix(P),(v===null||v.length<g)&&(v=new Float32Array(g));for(let L=0,C=S;L!==T;++L,C+=4)c.copy(x[L]).applyMatrix4(P,f),c.normal.toArray(v,C),v[C+3]=c.constant}h.value=v,h.needsUpdate=!0}return e.numPlanes=T,e.numIntersection=0,v}}function rM(s){let e=new WeakMap;function t(c,f){return f===Nf?c.mapping=io:f===Ff&&(c.mapping=ro),c}function r(c){if(c&&c.isTexture){const f=c.mapping;if(f===Nf||f===Ff)if(e.has(c)){const h=e.get(c).texture;return t(h,c.mapping)}else{const h=c.image;if(h&&h.height>0){const m=new mx(h.height);return m.fromEquirectangularTexture(s,c),e.set(c,m),c.addEventListener("dispose",a),t(m.texture,c.mapping)}else return null}}return c}function a(c){const f=c.target;f.removeEventListener("dispose",a);const h=e.get(f);h!==void 0&&(e.delete(f),h.dispose())}function l(){e=new WeakMap}return{get:r,dispose:l}}class Kg extends Yg{constructor(e=-1,t=1,r=1,a=-1,l=.1,c=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=r,this.bottom=a,this.near=l,this.far=c,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,r,a,l,c){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=r,this.view.offsetY=a,this.view.width=l,this.view.height=c,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),r=(this.right+this.left)/2,a=(this.top+this.bottom)/2;let l=r-e,c=r+e,f=a+t,h=a-t;if(this.view!==null&&this.view.enabled){const m=(this.right-this.left)/this.view.fullWidth/this.zoom,_=(this.top-this.bottom)/this.view.fullHeight/this.zoom;l+=m*this.view.offsetX,c=l+m*this.view.width,f-=_*this.view.offsetY,h=f-_*this.view.height}this.projectionMatrix.makeOrthographic(l,c,f,h,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}}const Zs=4,Um=[.125,.215,.35,.446,.526,.582],ts=20,cf=new Kg,Im=new pt;let ff=null,df=0,hf=0,pf=!1;const Jr=(1+Math.sqrt(5))/2,Ws=1/Jr,Nm=[new G(-Jr,Ws,0),new G(Jr,Ws,0),new G(-Ws,0,Jr),new G(Ws,0,Jr),new G(0,Jr,-Ws),new G(0,Jr,Ws),new G(-1,1,-1),new G(1,1,-1),new G(-1,1,1),new G(1,1,1)];class Fm{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,r=.1,a=100){ff=this._renderer.getRenderTarget(),df=this._renderer.getActiveCubeFace(),hf=this._renderer.getActiveMipmapLevel(),pf=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(256);const l=this._allocateTargets();return l.depthBuffer=!0,this._sceneToCubeUV(e,r,a,l),t>0&&this._blur(l,0,0,t),this._applyPMREM(l),this._cleanup(l),l}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=km(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=zm(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(ff,df,hf),this._renderer.xr.enabled=pf,e.scissorTest=!1,Ll(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===io||e.mapping===ro?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),ff=this._renderer.getRenderTarget(),df=this._renderer.getActiveCubeFace(),hf=this._renderer.getActiveMipmapLevel(),pf=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const r=t||this._allocateTargets();return this._textureToCubeUV(e,r),this._applyPMREM(r),this._cleanup(r),r}_allocateTargets(){const e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,r={magFilter:Ai,minFilter:Ai,generateMipmaps:!1,type:na,format:pi,colorSpace:uo,depthBuffer:!1},a=Om(e,t,r);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Om(e,t,r);const{_lodMax:l}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=sM(l)),this._blurMaterial=oM(l,e,t)}return a}_compileMaterial(e){const t=new kn(this._lodPlanes[0],e);this._renderer.compile(t,cf)}_sceneToCubeUV(e,t,r,a){const f=new ti(90,1,t,r),h=[1,-1,1,1,1,1],m=[1,1,1,-1,-1,-1],_=this._renderer,x=_.autoClear,y=_.toneMapping;_.getClearColor(Im),_.toneMapping=Cr,_.autoClear=!1;const S=new ao({name:"PMREM.Background",side:Rn,depthWrite:!1,depthTest:!1}),M=new kn(new sa,S);let T=!1;const v=e.background;v?v.isColor&&(S.color.copy(v),e.background=null,T=!0):(S.color.copy(Im),T=!0);for(let g=0;g<6;g++){const P=g%3;P===0?(f.up.set(0,h[g],0),f.lookAt(m[g],0,0)):P===1?(f.up.set(0,0,h[g]),f.lookAt(0,m[g],0)):(f.up.set(0,h[g],0),f.lookAt(0,0,m[g]));const L=this._cubeSize;Ll(a,P*L,g>2?L:0,L,L),_.setRenderTarget(a),T&&_.render(M,f),_.render(e,f)}M.geometry.dispose(),M.material.dispose(),_.toneMapping=y,_.autoClear=x,e.background=v}_textureToCubeUV(e,t){const r=this._renderer,a=e.mapping===io||e.mapping===ro;a?(this._cubemapMaterial===null&&(this._cubemapMaterial=km()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=zm());const l=a?this._cubemapMaterial:this._equirectMaterial,c=new kn(this._lodPlanes[0],l),f=l.uniforms;f.envMap.value=e;const h=this._cubeSize;Ll(t,0,0,3*h,2*h),r.setRenderTarget(t),r.render(c,cf)}_applyPMREM(e){const t=this._renderer,r=t.autoClear;t.autoClear=!1;const a=this._lodPlanes.length;for(let l=1;l<a;l++){const c=Math.sqrt(this._sigmas[l]*this._sigmas[l]-this._sigmas[l-1]*this._sigmas[l-1]),f=Nm[(a-l-1)%Nm.length];this._blur(e,l-1,l,c,f)}t.autoClear=r}_blur(e,t,r,a,l){const c=this._pingPongRenderTarget;this._halfBlur(e,c,t,r,a,"latitudinal",l),this._halfBlur(c,e,r,r,a,"longitudinal",l)}_halfBlur(e,t,r,a,l,c,f){const h=this._renderer,m=this._blurMaterial;c!=="latitudinal"&&c!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");const _=3,x=new kn(this._lodPlanes[a],m),y=m.uniforms,S=this._sizeLods[r]-1,M=isFinite(l)?Math.PI/(2*S):2*Math.PI/(2*ts-1),T=l/M,v=isFinite(l)?1+Math.floor(_*T):ts;v>ts&&console.warn(`sigmaRadians, ${l}, is too large and will clip, as it requested ${v} samples when the maximum is set to ${ts}`);const g=[];let P=0;for(let I=0;I<ts;++I){const B=I/T,b=Math.exp(-B*B/2);g.push(b),I===0?P+=b:I<v&&(P+=2*b)}for(let I=0;I<g.length;I++)g[I]=g[I]/P;y.envMap.value=e.texture,y.samples.value=v,y.weights.value=g,y.latitudinal.value=c==="latitudinal",f&&(y.poleAxis.value=f);const{_lodMax:L}=this;y.dTheta.value=M,y.mipInt.value=L-r;const C=this._sizeLods[a],W=3*C*(a>L-Zs?a-L+Zs:0),F=4*(this._cubeSize-C);Ll(t,W,F,3*C,2*C),h.setRenderTarget(t),h.render(x,cf)}}function sM(s){const e=[],t=[],r=[];let a=s;const l=s-Zs+1+Um.length;for(let c=0;c<l;c++){const f=Math.pow(2,a);t.push(f);let h=1/f;c>s-Zs?h=Um[c-s+Zs-1]:c===0&&(h=0),r.push(h);const m=1/(f-2),_=-m,x=1+m,y=[_,_,x,_,x,x,_,_,x,x,_,x],S=6,M=6,T=3,v=2,g=1,P=new Float32Array(T*M*S),L=new Float32Array(v*M*S),C=new Float32Array(g*M*S);for(let F=0;F<S;F++){const I=F%3*2/3-1,B=F>2?0:-1,b=[I,B,0,I+2/3,B,0,I+2/3,B+1,0,I,B,0,I+2/3,B+1,0,I,B+1,0];P.set(b,T*M*F),L.set(y,v*M*F);const A=[F,F,F,F,F,F];C.set(A,g*M*F)}const W=new bn;W.setAttribute("position",new gi(P,T)),W.setAttribute("uv",new gi(L,v)),W.setAttribute("faceIndex",new gi(C,g)),e.push(W),a>Zs&&a--}return{lodPlanes:e,sizeLods:t,sigmas:r}}function Om(s,e,t){const r=new ss(s,e,t);return r.texture.mapping=eu,r.texture.name="PMREM.cubeUv",r.scissorTest=!0,r}function Ll(s,e,t,r,a){s.viewport.set(e,t,r,a),s.scissor.set(e,t,r,a)}function oM(s,e,t){const r=new Float32Array(ts),a=new G(0,1,0);return new Lr({name:"SphericalGaussianBlur",defines:{n:ts,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${s}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:r},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:a}},vertexShader:wd(),fragmentShader:`

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
		`,blending:Ar,depthTest:!1,depthWrite:!1})}function zm(){return new Lr({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:wd(),fragmentShader:`

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
		`,blending:Ar,depthTest:!1,depthWrite:!1})}function km(){return new Lr({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:wd(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Ar,depthTest:!1,depthWrite:!1})}function wd(){return`

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
	`}function aM(s){let e=new WeakMap,t=null;function r(f){if(f&&f.isTexture){const h=f.mapping,m=h===Nf||h===Ff,_=h===io||h===ro;if(m||_){let x=e.get(f);const y=x!==void 0?x.texture.pmremVersion:0;if(f.isRenderTargetTexture&&f.pmremVersion!==y)return t===null&&(t=new Fm(s)),x=m?t.fromEquirectangular(f,x):t.fromCubemap(f,x),x.texture.pmremVersion=f.pmremVersion,e.set(f,x),x.texture;if(x!==void 0)return x.texture;{const S=f.image;return m&&S&&S.height>0||_&&S&&a(S)?(t===null&&(t=new Fm(s)),x=m?t.fromEquirectangular(f):t.fromCubemap(f),x.texture.pmremVersion=f.pmremVersion,e.set(f,x),f.addEventListener("dispose",l),x.texture):null}}}return f}function a(f){let h=0;const m=6;for(let _=0;_<m;_++)f[_]!==void 0&&h++;return h===m}function l(f){const h=f.target;h.removeEventListener("dispose",l);const m=e.get(h);m!==void 0&&(e.delete(h),m.dispose())}function c(){e=new WeakMap,t!==null&&(t.dispose(),t=null)}return{get:r,dispose:c}}function lM(s){const e={};function t(r){if(e[r]!==void 0)return e[r];let a;switch(r){case"WEBGL_depth_texture":a=s.getExtension("WEBGL_depth_texture")||s.getExtension("MOZ_WEBGL_depth_texture")||s.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":a=s.getExtension("EXT_texture_filter_anisotropic")||s.getExtension("MOZ_EXT_texture_filter_anisotropic")||s.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":a=s.getExtension("WEBGL_compressed_texture_s3tc")||s.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||s.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":a=s.getExtension("WEBGL_compressed_texture_pvrtc")||s.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:a=s.getExtension(r)}return e[r]=a,a}return{has:function(r){return t(r)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(r){const a=t(r);return a===null&&Zo("THREE.WebGLRenderer: "+r+" extension not supported."),a}}}function uM(s,e,t,r){const a={},l=new WeakMap;function c(x){const y=x.target;y.index!==null&&e.remove(y.index);for(const M in y.attributes)e.remove(y.attributes[M]);for(const M in y.morphAttributes){const T=y.morphAttributes[M];for(let v=0,g=T.length;v<g;v++)e.remove(T[v])}y.removeEventListener("dispose",c),delete a[y.id];const S=l.get(y);S&&(e.remove(S),l.delete(y)),r.releaseStatesOfGeometry(y),y.isInstancedBufferGeometry===!0&&delete y._maxInstanceCount,t.memory.geometries--}function f(x,y){return a[y.id]===!0||(y.addEventListener("dispose",c),a[y.id]=!0,t.memory.geometries++),y}function h(x){const y=x.attributes;for(const M in y)e.update(y[M],s.ARRAY_BUFFER);const S=x.morphAttributes;for(const M in S){const T=S[M];for(let v=0,g=T.length;v<g;v++)e.update(T[v],s.ARRAY_BUFFER)}}function m(x){const y=[],S=x.index,M=x.attributes.position;let T=0;if(S!==null){const P=S.array;T=S.version;for(let L=0,C=P.length;L<C;L+=3){const W=P[L+0],F=P[L+1],I=P[L+2];y.push(W,F,F,I,I,W)}}else if(M!==void 0){const P=M.array;T=M.version;for(let L=0,C=P.length/3-1;L<C;L+=3){const W=L+0,F=L+1,I=L+2;y.push(W,F,F,I,I,W)}}else return;const v=new(kg(y)?Xg:Wg)(y,1);v.version=T;const g=l.get(x);g&&e.remove(g),l.set(x,v)}function _(x){const y=l.get(x);if(y){const S=x.index;S!==null&&y.version<S.version&&m(x)}else m(x);return l.get(x)}return{get:f,update:h,getWireframeAttribute:_}}function cM(s,e,t){let r;function a(y){r=y}let l,c;function f(y){l=y.type,c=y.bytesPerElement}function h(y,S){s.drawElements(r,S,l,y*c),t.update(S,r,1)}function m(y,S,M){M!==0&&(s.drawElementsInstanced(r,S,l,y*c,M),t.update(S,r,M))}function _(y,S,M){if(M===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(r,S,0,l,y,0,M);let v=0;for(let g=0;g<M;g++)v+=S[g];t.update(v,r,1)}function x(y,S,M,T){if(M===0)return;const v=e.get("WEBGL_multi_draw");if(v===null)for(let g=0;g<y.length;g++)m(y[g]/c,S[g],T[g]);else{v.multiDrawElementsInstancedWEBGL(r,S,0,l,y,0,T,0,M);let g=0;for(let P=0;P<M;P++)g+=S[P]*T[P];t.update(g,r,1)}}this.setMode=a,this.setIndex=f,this.render=h,this.renderInstances=m,this.renderMultiDraw=_,this.renderMultiDrawInstances=x}function fM(s){const e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function r(l,c,f){switch(t.calls++,c){case s.TRIANGLES:t.triangles+=f*(l/3);break;case s.LINES:t.lines+=f*(l/2);break;case s.LINE_STRIP:t.lines+=f*(l-1);break;case s.LINE_LOOP:t.lines+=f*l;break;case s.POINTS:t.points+=f*l;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",c);break}}function a(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:a,update:r}}function dM(s,e,t){const r=new WeakMap,a=new Vt;function l(c,f,h){const m=c.morphTargetInfluences,_=f.morphAttributes.position||f.morphAttributes.normal||f.morphAttributes.color,x=_!==void 0?_.length:0;let y=r.get(f);if(y===void 0||y.count!==x){let A=function(){B.dispose(),r.delete(f),f.removeEventListener("dispose",A)};var S=A;y!==void 0&&y.texture.dispose();const M=f.morphAttributes.position!==void 0,T=f.morphAttributes.normal!==void 0,v=f.morphAttributes.color!==void 0,g=f.morphAttributes.position||[],P=f.morphAttributes.normal||[],L=f.morphAttributes.color||[];let C=0;M===!0&&(C=1),T===!0&&(C=2),v===!0&&(C=3);let W=f.attributes.position.count*C,F=1;W>e.maxTextureSize&&(F=Math.ceil(W/e.maxTextureSize),W=e.maxTextureSize);const I=new Float32Array(W*F*4*x),B=new Hg(I,W,F,x);B.type=ji,B.needsUpdate=!0;const b=C*4;for(let O=0;O<x;O++){const se=g[O],J=P[O],ue=L[O],ce=W*F*4*O;for(let $=0;$<se.count;$++){const oe=$*b;M===!0&&(a.fromBufferAttribute(se,$),I[ce+oe+0]=a.x,I[ce+oe+1]=a.y,I[ce+oe+2]=a.z,I[ce+oe+3]=0),T===!0&&(a.fromBufferAttribute(J,$),I[ce+oe+4]=a.x,I[ce+oe+5]=a.y,I[ce+oe+6]=a.z,I[ce+oe+7]=0),v===!0&&(a.fromBufferAttribute(ue,$),I[ce+oe+8]=a.x,I[ce+oe+9]=a.y,I[ce+oe+10]=a.z,I[ce+oe+11]=ue.itemSize===4?a.w:1)}}y={count:x,texture:B,size:new qe(W,F)},r.set(f,y),f.addEventListener("dispose",A)}if(c.isInstancedMesh===!0&&c.morphTexture!==null)h.getUniforms().setValue(s,"morphTexture",c.morphTexture,t);else{let M=0;for(let v=0;v<m.length;v++)M+=m[v];const T=f.morphTargetsRelative?1:1-M;h.getUniforms().setValue(s,"morphTargetBaseInfluence",T),h.getUniforms().setValue(s,"morphTargetInfluences",m)}h.getUniforms().setValue(s,"morphTargetsTexture",y.texture,t),h.getUniforms().setValue(s,"morphTargetsTextureSize",y.size)}return{update:l}}function hM(s,e,t,r){let a=new WeakMap;function l(h){const m=r.render.frame,_=h.geometry,x=e.get(h,_);if(a.get(x)!==m&&(e.update(x),a.set(x,m)),h.isInstancedMesh&&(h.hasEventListener("dispose",f)===!1&&h.addEventListener("dispose",f),a.get(h)!==m&&(t.update(h.instanceMatrix,s.ARRAY_BUFFER),h.instanceColor!==null&&t.update(h.instanceColor,s.ARRAY_BUFFER),a.set(h,m))),h.isSkinnedMesh){const y=h.skeleton;a.get(y)!==m&&(y.update(),a.set(y,m))}return x}function c(){a=new WeakMap}function f(h){const m=h.target;m.removeEventListener("dispose",f),t.remove(m.instanceMatrix),m.instanceColor!==null&&t.remove(m.instanceColor)}return{update:l,dispose:c}}class Zg extends _n{constructor(e,t,r,a,l,c,f,h,m,_=eo){if(_!==eo&&_!==oo)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");r===void 0&&_===eo&&(r=rs),r===void 0&&_===oo&&(r=so),super(null,a,l,c,f,h,_,r,m),this.isDepthTexture=!0,this.image={width:e,height:t},this.magFilter=f!==void 0?f:mi,this.minFilter=h!==void 0?h:mi,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.compareFunction=e.compareFunction,this}toJSON(e){const t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}}const Qg=new _n,Bm=new Zg(1,1),Jg=new Hg,e_=new J0,t_=new qg,Hm=[],Vm=[],Gm=new Float32Array(16),Wm=new Float32Array(9),Xm=new Float32Array(4);function co(s,e,t){const r=s[0];if(r<=0||r>0)return s;const a=e*t;let l=Hm[a];if(l===void 0&&(l=new Float32Array(a),Hm[a]=l),e!==0){r.toArray(l,0);for(let c=1,f=0;c!==e;++c)f+=t,s[c].toArray(l,f)}return l}function Jt(s,e){if(s.length!==e.length)return!1;for(let t=0,r=s.length;t<r;t++)if(s[t]!==e[t])return!1;return!0}function en(s,e){for(let t=0,r=e.length;t<r;t++)s[t]=e[t]}function ru(s,e){let t=Vm[e];t===void 0&&(t=new Int32Array(e),Vm[e]=t);for(let r=0;r!==e;++r)t[r]=s.allocateTextureUnit();return t}function pM(s,e){const t=this.cache;t[0]!==e&&(s.uniform1f(this.addr,e),t[0]=e)}function mM(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(s.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Jt(t,e))return;s.uniform2fv(this.addr,e),en(t,e)}}function gM(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(s.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(s.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(Jt(t,e))return;s.uniform3fv(this.addr,e),en(t,e)}}function _M(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(s.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Jt(t,e))return;s.uniform4fv(this.addr,e),en(t,e)}}function vM(s,e){const t=this.cache,r=e.elements;if(r===void 0){if(Jt(t,e))return;s.uniformMatrix2fv(this.addr,!1,e),en(t,e)}else{if(Jt(t,r))return;Xm.set(r),s.uniformMatrix2fv(this.addr,!1,Xm),en(t,r)}}function xM(s,e){const t=this.cache,r=e.elements;if(r===void 0){if(Jt(t,e))return;s.uniformMatrix3fv(this.addr,!1,e),en(t,e)}else{if(Jt(t,r))return;Wm.set(r),s.uniformMatrix3fv(this.addr,!1,Wm),en(t,r)}}function yM(s,e){const t=this.cache,r=e.elements;if(r===void 0){if(Jt(t,e))return;s.uniformMatrix4fv(this.addr,!1,e),en(t,e)}else{if(Jt(t,r))return;Gm.set(r),s.uniformMatrix4fv(this.addr,!1,Gm),en(t,r)}}function SM(s,e){const t=this.cache;t[0]!==e&&(s.uniform1i(this.addr,e),t[0]=e)}function MM(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(s.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Jt(t,e))return;s.uniform2iv(this.addr,e),en(t,e)}}function EM(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(s.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Jt(t,e))return;s.uniform3iv(this.addr,e),en(t,e)}}function TM(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(s.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Jt(t,e))return;s.uniform4iv(this.addr,e),en(t,e)}}function wM(s,e){const t=this.cache;t[0]!==e&&(s.uniform1ui(this.addr,e),t[0]=e)}function AM(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(s.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Jt(t,e))return;s.uniform2uiv(this.addr,e),en(t,e)}}function CM(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(s.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Jt(t,e))return;s.uniform3uiv(this.addr,e),en(t,e)}}function RM(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(s.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Jt(t,e))return;s.uniform4uiv(this.addr,e),en(t,e)}}function bM(s,e,t){const r=this.cache,a=t.allocateTextureUnit();r[0]!==a&&(s.uniform1i(this.addr,a),r[0]=a);let l;this.type===s.SAMPLER_2D_SHADOW?(Bm.compareFunction=zg,l=Bm):l=Qg,t.setTexture2D(e||l,a)}function PM(s,e,t){const r=this.cache,a=t.allocateTextureUnit();r[0]!==a&&(s.uniform1i(this.addr,a),r[0]=a),t.setTexture3D(e||e_,a)}function LM(s,e,t){const r=this.cache,a=t.allocateTextureUnit();r[0]!==a&&(s.uniform1i(this.addr,a),r[0]=a),t.setTextureCube(e||t_,a)}function DM(s,e,t){const r=this.cache,a=t.allocateTextureUnit();r[0]!==a&&(s.uniform1i(this.addr,a),r[0]=a),t.setTexture2DArray(e||Jg,a)}function UM(s){switch(s){case 5126:return pM;case 35664:return mM;case 35665:return gM;case 35666:return _M;case 35674:return vM;case 35675:return xM;case 35676:return yM;case 5124:case 35670:return SM;case 35667:case 35671:return MM;case 35668:case 35672:return EM;case 35669:case 35673:return TM;case 5125:return wM;case 36294:return AM;case 36295:return CM;case 36296:return RM;case 35678:case 36198:case 36298:case 36306:case 35682:return bM;case 35679:case 36299:case 36307:return PM;case 35680:case 36300:case 36308:case 36293:return LM;case 36289:case 36303:case 36311:case 36292:return DM}}function IM(s,e){s.uniform1fv(this.addr,e)}function NM(s,e){const t=co(e,this.size,2);s.uniform2fv(this.addr,t)}function FM(s,e){const t=co(e,this.size,3);s.uniform3fv(this.addr,t)}function OM(s,e){const t=co(e,this.size,4);s.uniform4fv(this.addr,t)}function zM(s,e){const t=co(e,this.size,4);s.uniformMatrix2fv(this.addr,!1,t)}function kM(s,e){const t=co(e,this.size,9);s.uniformMatrix3fv(this.addr,!1,t)}function BM(s,e){const t=co(e,this.size,16);s.uniformMatrix4fv(this.addr,!1,t)}function HM(s,e){s.uniform1iv(this.addr,e)}function VM(s,e){s.uniform2iv(this.addr,e)}function GM(s,e){s.uniform3iv(this.addr,e)}function WM(s,e){s.uniform4iv(this.addr,e)}function XM(s,e){s.uniform1uiv(this.addr,e)}function jM(s,e){s.uniform2uiv(this.addr,e)}function YM(s,e){s.uniform3uiv(this.addr,e)}function qM(s,e){s.uniform4uiv(this.addr,e)}function $M(s,e,t){const r=this.cache,a=e.length,l=ru(t,a);Jt(r,l)||(s.uniform1iv(this.addr,l),en(r,l));for(let c=0;c!==a;++c)t.setTexture2D(e[c]||Qg,l[c])}function KM(s,e,t){const r=this.cache,a=e.length,l=ru(t,a);Jt(r,l)||(s.uniform1iv(this.addr,l),en(r,l));for(let c=0;c!==a;++c)t.setTexture3D(e[c]||e_,l[c])}function ZM(s,e,t){const r=this.cache,a=e.length,l=ru(t,a);Jt(r,l)||(s.uniform1iv(this.addr,l),en(r,l));for(let c=0;c!==a;++c)t.setTextureCube(e[c]||t_,l[c])}function QM(s,e,t){const r=this.cache,a=e.length,l=ru(t,a);Jt(r,l)||(s.uniform1iv(this.addr,l),en(r,l));for(let c=0;c!==a;++c)t.setTexture2DArray(e[c]||Jg,l[c])}function JM(s){switch(s){case 5126:return IM;case 35664:return NM;case 35665:return FM;case 35666:return OM;case 35674:return zM;case 35675:return kM;case 35676:return BM;case 5124:case 35670:return HM;case 35667:case 35671:return VM;case 35668:case 35672:return GM;case 35669:case 35673:return WM;case 5125:return XM;case 36294:return jM;case 36295:return YM;case 36296:return qM;case 35678:case 36198:case 36298:case 36306:case 35682:return $M;case 35679:case 36299:case 36307:return KM;case 35680:case 36300:case 36308:case 36293:return ZM;case 36289:case 36303:case 36311:case 36292:return QM}}class eE{constructor(e,t,r){this.id=e,this.addr=r,this.cache=[],this.type=t.type,this.setValue=UM(t.type)}}class tE{constructor(e,t,r){this.id=e,this.addr=r,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=JM(t.type)}}class nE{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,r){const a=this.seq;for(let l=0,c=a.length;l!==c;++l){const f=a[l];f.setValue(e,t[f.id],r)}}}const mf=/(\w+)(\])?(\[|\.)?/g;function jm(s,e){s.seq.push(e),s.map[e.id]=e}function iE(s,e,t){const r=s.name,a=r.length;for(mf.lastIndex=0;;){const l=mf.exec(r),c=mf.lastIndex;let f=l[1];const h=l[2]==="]",m=l[3];if(h&&(f=f|0),m===void 0||m==="["&&c+2===a){jm(t,m===void 0?new eE(f,s,e):new tE(f,s,e));break}else{let x=t.map[f];x===void 0&&(x=new nE(f),jm(t,x)),t=x}}}class Yl{constructor(e,t){this.seq=[],this.map={};const r=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let a=0;a<r;++a){const l=e.getActiveUniform(t,a),c=e.getUniformLocation(t,l.name);iE(l,c,this)}}setValue(e,t,r,a){const l=this.map[t];l!==void 0&&l.setValue(e,r,a)}setOptional(e,t,r){const a=t[r];a!==void 0&&this.setValue(e,r,a)}static upload(e,t,r,a){for(let l=0,c=t.length;l!==c;++l){const f=t[l],h=r[f.id];h.needsUpdate!==!1&&f.setValue(e,h.value,a)}}static seqWithValue(e,t){const r=[];for(let a=0,l=e.length;a!==l;++a){const c=e[a];c.id in t&&r.push(c)}return r}}function Ym(s,e,t){const r=s.createShader(e);return s.shaderSource(r,t),s.compileShader(r),r}const rE=37297;let sE=0;function oE(s,e){const t=s.split(`
`),r=[],a=Math.max(e-6,0),l=Math.min(e+6,t.length);for(let c=a;c<l;c++){const f=c+1;r.push(`${f===e?">":" "} ${f}: ${t[c]}`)}return r.join(`
`)}const qm=new at;function aE(s){yt._getMatrix(qm,yt.workingColorSpace,s);const e=`mat3( ${qm.elements.map(t=>t.toFixed(4))} )`;switch(yt.getTransfer(s)){case tu:return[e,"LinearTransferOETF"];case Rt:return[e,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space: ",s),[e,"LinearTransferOETF"]}}function $m(s,e,t){const r=s.getShaderParameter(e,s.COMPILE_STATUS),a=s.getShaderInfoLog(e).trim();if(r&&a==="")return"";const l=/ERROR: 0:(\d+)/.exec(a);if(l){const c=parseInt(l[1]);return t.toUpperCase()+`

`+a+`

`+oE(s.getShaderSource(e),c)}else return a}function lE(s,e){const t=aE(e);return[`vec4 ${s}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}function uE(s,e){let t;switch(e){case w0:t="Linear";break;case A0:t="Reinhard";break;case C0:t="Cineon";break;case R0:t="ACESFilmic";break;case P0:t="AgX";break;case L0:t="Neutral";break;case b0:t="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),t="Linear"}return"vec3 "+s+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}const Dl=new G;function cE(){yt.getLuminanceCoefficients(Dl);const s=Dl.x.toFixed(4),e=Dl.y.toFixed(4),t=Dl.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${s}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function fE(s){return[s.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",s.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Qo).join(`
`)}function dE(s){const e=[];for(const t in s){const r=s[t];r!==!1&&e.push("#define "+t+" "+r)}return e.join(`
`)}function hE(s,e){const t={},r=s.getProgramParameter(e,s.ACTIVE_ATTRIBUTES);for(let a=0;a<r;a++){const l=s.getActiveAttrib(e,a),c=l.name;let f=1;l.type===s.FLOAT_MAT2&&(f=2),l.type===s.FLOAT_MAT3&&(f=3),l.type===s.FLOAT_MAT4&&(f=4),t[c]={type:l.type,location:s.getAttribLocation(e,c),locationSize:f}}return t}function Qo(s){return s!==""}function Km(s,e){const t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return s.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function Zm(s,e){return s.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}const pE=/^[ \t]*#include +<([\w\d./]+)>/gm;function hd(s){return s.replace(pE,gE)}const mE=new Map;function gE(s,e){let t=lt[e];if(t===void 0){const r=mE.get(e);if(r!==void 0)t=lt[r],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,r);else throw new Error("Can not resolve #include <"+e+">")}return hd(t)}const _E=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Qm(s){return s.replace(_E,vE)}function vE(s,e,t,r){let a="";for(let l=parseInt(e);l<parseInt(t);l++)a+=r.replace(/\[\s*i\s*\]/g,"[ "+l+" ]").replace(/UNROLLED_LOOP_INDEX/g,l);return a}function Jm(s){let e=`precision ${s.precision} float;
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
#define LOW_PRECISION`),e}function xE(s){let e="SHADOWMAP_TYPE_BASIC";return s.shadowMapType===wg?e="SHADOWMAP_TYPE_PCF":s.shadowMapType===r0?e="SHADOWMAP_TYPE_PCF_SOFT":s.shadowMapType===Wi&&(e="SHADOWMAP_TYPE_VSM"),e}function yE(s){let e="ENVMAP_TYPE_CUBE";if(s.envMap)switch(s.envMapMode){case io:case ro:e="ENVMAP_TYPE_CUBE";break;case eu:e="ENVMAP_TYPE_CUBE_UV";break}return e}function SE(s){let e="ENVMAP_MODE_REFLECTION";if(s.envMap)switch(s.envMapMode){case ro:e="ENVMAP_MODE_REFRACTION";break}return e}function ME(s){let e="ENVMAP_BLENDING_NONE";if(s.envMap)switch(s.combine){case _d:e="ENVMAP_BLENDING_MULTIPLY";break;case E0:e="ENVMAP_BLENDING_MIX";break;case T0:e="ENVMAP_BLENDING_ADD";break}return e}function EE(s){const e=s.envMapCubeUVHeight;if(e===null)return null;const t=Math.log2(e)-2,r=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),7*16)),texelHeight:r,maxMip:t}}function TE(s,e,t,r){const a=s.getContext(),l=t.defines;let c=t.vertexShader,f=t.fragmentShader;const h=xE(t),m=yE(t),_=SE(t),x=ME(t),y=EE(t),S=fE(t),M=dE(l),T=a.createProgram();let v,g,P=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(v=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,M].filter(Qo).join(`
`),v.length>0&&(v+=`
`),g=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,M].filter(Qo).join(`
`),g.length>0&&(g+=`
`)):(v=[Jm(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,M,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+_:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+h:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Qo).join(`
`),g=[Jm(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,M,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+m:"",t.envMap?"#define "+_:"",t.envMap?"#define "+x:"",y?"#define CUBEUV_TEXEL_WIDTH "+y.texelWidth:"",y?"#define CUBEUV_TEXEL_HEIGHT "+y.texelHeight:"",y?"#define CUBEUV_MAX_MIP "+y.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor||t.batchingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+h:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==Cr?"#define TONE_MAPPING":"",t.toneMapping!==Cr?lt.tonemapping_pars_fragment:"",t.toneMapping!==Cr?uE("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",lt.colorspace_pars_fragment,lE("linearToOutputTexel",t.outputColorSpace),cE(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(Qo).join(`
`)),c=hd(c),c=Km(c,t),c=Zm(c,t),f=hd(f),f=Km(f,t),f=Zm(f,t),c=Qm(c),f=Qm(f),t.isRawShaderMaterial!==!0&&(P=`#version 300 es
`,v=[S,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+v,g=["#define varying in",t.glslVersion===dm?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===dm?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+g);const L=P+v+c,C=P+g+f,W=Ym(a,a.VERTEX_SHADER,L),F=Ym(a,a.FRAGMENT_SHADER,C);a.attachShader(T,W),a.attachShader(T,F),t.index0AttributeName!==void 0?a.bindAttribLocation(T,0,t.index0AttributeName):t.morphTargets===!0&&a.bindAttribLocation(T,0,"position"),a.linkProgram(T);function I(O){if(s.debug.checkShaderErrors){const se=a.getProgramInfoLog(T).trim(),J=a.getShaderInfoLog(W).trim(),ue=a.getShaderInfoLog(F).trim();let ce=!0,$=!0;if(a.getProgramParameter(T,a.LINK_STATUS)===!1)if(ce=!1,typeof s.debug.onShaderError=="function")s.debug.onShaderError(a,T,W,F);else{const oe=$m(a,W,"vertex"),k=$m(a,F,"fragment");console.error("THREE.WebGLProgram: Shader Error "+a.getError()+" - VALIDATE_STATUS "+a.getProgramParameter(T,a.VALIDATE_STATUS)+`

Material Name: `+O.name+`
Material Type: `+O.type+`

Program Info Log: `+se+`
`+oe+`
`+k)}else se!==""?console.warn("THREE.WebGLProgram: Program Info Log:",se):(J===""||ue==="")&&($=!1);$&&(O.diagnostics={runnable:ce,programLog:se,vertexShader:{log:J,prefix:v},fragmentShader:{log:ue,prefix:g}})}a.deleteShader(W),a.deleteShader(F),B=new Yl(a,T),b=hE(a,T)}let B;this.getUniforms=function(){return B===void 0&&I(this),B};let b;this.getAttributes=function(){return b===void 0&&I(this),b};let A=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return A===!1&&(A=a.getProgramParameter(T,rE)),A},this.destroy=function(){r.releaseStatesOfProgram(this),a.deleteProgram(T),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=sE++,this.cacheKey=e,this.usedTimes=1,this.program=T,this.vertexShader=W,this.fragmentShader=F,this}let wE=0;class AE{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){const t=e.vertexShader,r=e.fragmentShader,a=this._getShaderStage(t),l=this._getShaderStage(r),c=this._getShaderCacheForMaterial(e);return c.has(a)===!1&&(c.add(a),a.usedTimes++),c.has(l)===!1&&(c.add(l),l.usedTimes++),this}remove(e){const t=this.materialCache.get(e);for(const r of t)r.usedTimes--,r.usedTimes===0&&this.shaderCache.delete(r.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const t=this.materialCache;let r=t.get(e);return r===void 0&&(r=new Set,t.set(e,r)),r}_getShaderStage(e){const t=this.shaderCache;let r=t.get(e);return r===void 0&&(r=new CE(e),t.set(e,r)),r}}class CE{constructor(e){this.id=wE++,this.code=e,this.usedTimes=0}}function RE(s,e,t,r,a,l,c){const f=new Vg,h=new AE,m=new Set,_=[],x=a.logarithmicDepthBuffer,y=a.vertexTextures;let S=a.precision;const M={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function T(b){return m.add(b),b===0?"uv":`uv${b}`}function v(b,A,O,se,J){const ue=se.fog,ce=J.geometry,$=b.isMeshStandardMaterial?se.environment:null,oe=(b.isMeshStandardMaterial?t:e).get(b.envMap||$),k=oe&&oe.mapping===eu?oe.image.height:null,le=M[b.type];b.precision!==null&&(S=a.getMaxPrecision(b.precision),S!==b.precision&&console.warn("THREE.WebGLProgram.getParameters:",b.precision,"not supported, using",S,"instead."));const re=ce.morphAttributes.position||ce.morphAttributes.normal||ce.morphAttributes.color,N=re!==void 0?re.length:0;let ie=0;ce.morphAttributes.position!==void 0&&(ie=1),ce.morphAttributes.normal!==void 0&&(ie=2),ce.morphAttributes.color!==void 0&&(ie=3);let De,Q,fe,Ee;if(le){const vt=Ei[le];De=vt.vertexShader,Q=vt.fragmentShader}else De=b.vertexShader,Q=b.fragmentShader,h.update(b),fe=h.getVertexShaderID(b),Ee=h.getFragmentShaderID(b);const xe=s.getRenderTarget(),Ae=s.state.buffers.depth.getReversed(),Ie=J.isInstancedMesh===!0,Qe=J.isBatchedMesh===!0,Ct=!!b.map,mt=!!b.matcap,Ut=!!oe,Y=!!b.aoMap,vn=!!b.lightMap,ht=!!b.bumpMap,ct=!!b.normalMap,$e=!!b.displacementMap,wt=!!b.emissiveMap,Ye=!!b.metalnessMap,D=!!b.roughnessMap,w=b.anisotropy>0,Z=b.clearcoat>0,pe=b.dispersion>0,_e=b.iridescence>0,de=b.sheen>0,Ve=b.transmission>0,Ce=w&&!!b.anisotropyMap,Ne=Z&&!!b.clearcoatMap,ut=Z&&!!b.clearcoatNormalMap,Se=Z&&!!b.clearcoatRoughnessMap,Oe=_e&&!!b.iridescenceMap,Je=_e&&!!b.iridescenceThicknessMap,et=de&&!!b.sheenColorMap,ze=de&&!!b.sheenRoughnessMap,ft=!!b.specularMap,rt=!!b.specularColorMap,Tt=!!b.specularIntensityMap,V=Ve&&!!b.transmissionMap,Re=Ve&&!!b.thicknessMap,ae=!!b.gradientMap,he=!!b.alphaMap,Le=b.alphaTest>0,Pe=!!b.alphaHash,st=!!b.extensions;let Nt=Cr;b.toneMapped&&(xe===null||xe.isXRRenderTarget===!0)&&(Nt=s.toneMapping);const qt={shaderID:le,shaderType:b.type,shaderName:b.name,vertexShader:De,fragmentShader:Q,defines:b.defines,customVertexShaderID:fe,customFragmentShaderID:Ee,isRawShaderMaterial:b.isRawShaderMaterial===!0,glslVersion:b.glslVersion,precision:S,batching:Qe,batchingColor:Qe&&J._colorsTexture!==null,instancing:Ie,instancingColor:Ie&&J.instanceColor!==null,instancingMorph:Ie&&J.morphTexture!==null,supportsVertexTextures:y,outputColorSpace:xe===null?s.outputColorSpace:xe.isXRRenderTarget===!0?xe.texture.colorSpace:uo,alphaToCoverage:!!b.alphaToCoverage,map:Ct,matcap:mt,envMap:Ut,envMapMode:Ut&&oe.mapping,envMapCubeUVHeight:k,aoMap:Y,lightMap:vn,bumpMap:ht,normalMap:ct,displacementMap:y&&$e,emissiveMap:wt,normalMapObjectSpace:ct&&b.normalMapType===N0,normalMapTangentSpace:ct&&b.normalMapType===Og,metalnessMap:Ye,roughnessMap:D,anisotropy:w,anisotropyMap:Ce,clearcoat:Z,clearcoatMap:Ne,clearcoatNormalMap:ut,clearcoatRoughnessMap:Se,dispersion:pe,iridescence:_e,iridescenceMap:Oe,iridescenceThicknessMap:Je,sheen:de,sheenColorMap:et,sheenRoughnessMap:ze,specularMap:ft,specularColorMap:rt,specularIntensityMap:Tt,transmission:Ve,transmissionMap:V,thicknessMap:Re,gradientMap:ae,opaque:b.transparent===!1&&b.blending===Js&&b.alphaToCoverage===!1,alphaMap:he,alphaTest:Le,alphaHash:Pe,combine:b.combine,mapUv:Ct&&T(b.map.channel),aoMapUv:Y&&T(b.aoMap.channel),lightMapUv:vn&&T(b.lightMap.channel),bumpMapUv:ht&&T(b.bumpMap.channel),normalMapUv:ct&&T(b.normalMap.channel),displacementMapUv:$e&&T(b.displacementMap.channel),emissiveMapUv:wt&&T(b.emissiveMap.channel),metalnessMapUv:Ye&&T(b.metalnessMap.channel),roughnessMapUv:D&&T(b.roughnessMap.channel),anisotropyMapUv:Ce&&T(b.anisotropyMap.channel),clearcoatMapUv:Ne&&T(b.clearcoatMap.channel),clearcoatNormalMapUv:ut&&T(b.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:Se&&T(b.clearcoatRoughnessMap.channel),iridescenceMapUv:Oe&&T(b.iridescenceMap.channel),iridescenceThicknessMapUv:Je&&T(b.iridescenceThicknessMap.channel),sheenColorMapUv:et&&T(b.sheenColorMap.channel),sheenRoughnessMapUv:ze&&T(b.sheenRoughnessMap.channel),specularMapUv:ft&&T(b.specularMap.channel),specularColorMapUv:rt&&T(b.specularColorMap.channel),specularIntensityMapUv:Tt&&T(b.specularIntensityMap.channel),transmissionMapUv:V&&T(b.transmissionMap.channel),thicknessMapUv:Re&&T(b.thicknessMap.channel),alphaMapUv:he&&T(b.alphaMap.channel),vertexTangents:!!ce.attributes.tangent&&(ct||w),vertexColors:b.vertexColors,vertexAlphas:b.vertexColors===!0&&!!ce.attributes.color&&ce.attributes.color.itemSize===4,pointsUvs:J.isPoints===!0&&!!ce.attributes.uv&&(Ct||he),fog:!!ue,useFog:b.fog===!0,fogExp2:!!ue&&ue.isFogExp2,flatShading:b.flatShading===!0,sizeAttenuation:b.sizeAttenuation===!0,logarithmicDepthBuffer:x,reverseDepthBuffer:Ae,skinning:J.isSkinnedMesh===!0,morphTargets:ce.morphAttributes.position!==void 0,morphNormals:ce.morphAttributes.normal!==void 0,morphColors:ce.morphAttributes.color!==void 0,morphTargetsCount:N,morphTextureStride:ie,numDirLights:A.directional.length,numPointLights:A.point.length,numSpotLights:A.spot.length,numSpotLightMaps:A.spotLightMap.length,numRectAreaLights:A.rectArea.length,numHemiLights:A.hemi.length,numDirLightShadows:A.directionalShadowMap.length,numPointLightShadows:A.pointShadowMap.length,numSpotLightShadows:A.spotShadowMap.length,numSpotLightShadowsWithMaps:A.numSpotLightShadowsWithMaps,numLightProbes:A.numLightProbes,numClippingPlanes:c.numPlanes,numClipIntersection:c.numIntersection,dithering:b.dithering,shadowMapEnabled:s.shadowMap.enabled&&O.length>0,shadowMapType:s.shadowMap.type,toneMapping:Nt,decodeVideoTexture:Ct&&b.map.isVideoTexture===!0&&yt.getTransfer(b.map.colorSpace)===Rt,decodeVideoTextureEmissive:wt&&b.emissiveMap.isVideoTexture===!0&&yt.getTransfer(b.emissiveMap.colorSpace)===Rt,premultipliedAlpha:b.premultipliedAlpha,doubleSided:b.side===Ti,flipSided:b.side===Rn,useDepthPacking:b.depthPacking>=0,depthPacking:b.depthPacking||0,index0AttributeName:b.index0AttributeName,extensionClipCullDistance:st&&b.extensions.clipCullDistance===!0&&r.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(st&&b.extensions.multiDraw===!0||Qe)&&r.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:r.has("KHR_parallel_shader_compile"),customProgramCacheKey:b.customProgramCacheKey()};return qt.vertexUv1s=m.has(1),qt.vertexUv2s=m.has(2),qt.vertexUv3s=m.has(3),m.clear(),qt}function g(b){const A=[];if(b.shaderID?A.push(b.shaderID):(A.push(b.customVertexShaderID),A.push(b.customFragmentShaderID)),b.defines!==void 0)for(const O in b.defines)A.push(O),A.push(b.defines[O]);return b.isRawShaderMaterial===!1&&(P(A,b),L(A,b),A.push(s.outputColorSpace)),A.push(b.customProgramCacheKey),A.join()}function P(b,A){b.push(A.precision),b.push(A.outputColorSpace),b.push(A.envMapMode),b.push(A.envMapCubeUVHeight),b.push(A.mapUv),b.push(A.alphaMapUv),b.push(A.lightMapUv),b.push(A.aoMapUv),b.push(A.bumpMapUv),b.push(A.normalMapUv),b.push(A.displacementMapUv),b.push(A.emissiveMapUv),b.push(A.metalnessMapUv),b.push(A.roughnessMapUv),b.push(A.anisotropyMapUv),b.push(A.clearcoatMapUv),b.push(A.clearcoatNormalMapUv),b.push(A.clearcoatRoughnessMapUv),b.push(A.iridescenceMapUv),b.push(A.iridescenceThicknessMapUv),b.push(A.sheenColorMapUv),b.push(A.sheenRoughnessMapUv),b.push(A.specularMapUv),b.push(A.specularColorMapUv),b.push(A.specularIntensityMapUv),b.push(A.transmissionMapUv),b.push(A.thicknessMapUv),b.push(A.combine),b.push(A.fogExp2),b.push(A.sizeAttenuation),b.push(A.morphTargetsCount),b.push(A.morphAttributeCount),b.push(A.numDirLights),b.push(A.numPointLights),b.push(A.numSpotLights),b.push(A.numSpotLightMaps),b.push(A.numHemiLights),b.push(A.numRectAreaLights),b.push(A.numDirLightShadows),b.push(A.numPointLightShadows),b.push(A.numSpotLightShadows),b.push(A.numSpotLightShadowsWithMaps),b.push(A.numLightProbes),b.push(A.shadowMapType),b.push(A.toneMapping),b.push(A.numClippingPlanes),b.push(A.numClipIntersection),b.push(A.depthPacking)}function L(b,A){f.disableAll(),A.supportsVertexTextures&&f.enable(0),A.instancing&&f.enable(1),A.instancingColor&&f.enable(2),A.instancingMorph&&f.enable(3),A.matcap&&f.enable(4),A.envMap&&f.enable(5),A.normalMapObjectSpace&&f.enable(6),A.normalMapTangentSpace&&f.enable(7),A.clearcoat&&f.enable(8),A.iridescence&&f.enable(9),A.alphaTest&&f.enable(10),A.vertexColors&&f.enable(11),A.vertexAlphas&&f.enable(12),A.vertexUv1s&&f.enable(13),A.vertexUv2s&&f.enable(14),A.vertexUv3s&&f.enable(15),A.vertexTangents&&f.enable(16),A.anisotropy&&f.enable(17),A.alphaHash&&f.enable(18),A.batching&&f.enable(19),A.dispersion&&f.enable(20),A.batchingColor&&f.enable(21),b.push(f.mask),f.disableAll(),A.fog&&f.enable(0),A.useFog&&f.enable(1),A.flatShading&&f.enable(2),A.logarithmicDepthBuffer&&f.enable(3),A.reverseDepthBuffer&&f.enable(4),A.skinning&&f.enable(5),A.morphTargets&&f.enable(6),A.morphNormals&&f.enable(7),A.morphColors&&f.enable(8),A.premultipliedAlpha&&f.enable(9),A.shadowMapEnabled&&f.enable(10),A.doubleSided&&f.enable(11),A.flipSided&&f.enable(12),A.useDepthPacking&&f.enable(13),A.dithering&&f.enable(14),A.transmission&&f.enable(15),A.sheen&&f.enable(16),A.opaque&&f.enable(17),A.pointsUvs&&f.enable(18),A.decodeVideoTexture&&f.enable(19),A.decodeVideoTextureEmissive&&f.enable(20),A.alphaToCoverage&&f.enable(21),b.push(f.mask)}function C(b){const A=M[b.type];let O;if(A){const se=Ei[A];O=fx.clone(se.uniforms)}else O=b.uniforms;return O}function W(b,A){let O;for(let se=0,J=_.length;se<J;se++){const ue=_[se];if(ue.cacheKey===A){O=ue,++O.usedTimes;break}}return O===void 0&&(O=new TE(s,A,b,l),_.push(O)),O}function F(b){if(--b.usedTimes===0){const A=_.indexOf(b);_[A]=_[_.length-1],_.pop(),b.destroy()}}function I(b){h.remove(b)}function B(){h.dispose()}return{getParameters:v,getProgramCacheKey:g,getUniforms:C,acquireProgram:W,releaseProgram:F,releaseShaderCache:I,programs:_,dispose:B}}function bE(){let s=new WeakMap;function e(c){return s.has(c)}function t(c){let f=s.get(c);return f===void 0&&(f={},s.set(c,f)),f}function r(c){s.delete(c)}function a(c,f,h){s.get(c)[f]=h}function l(){s=new WeakMap}return{has:e,get:t,remove:r,update:a,dispose:l}}function PE(s,e){return s.groupOrder!==e.groupOrder?s.groupOrder-e.groupOrder:s.renderOrder!==e.renderOrder?s.renderOrder-e.renderOrder:s.material.id!==e.material.id?s.material.id-e.material.id:s.z!==e.z?s.z-e.z:s.id-e.id}function eg(s,e){return s.groupOrder!==e.groupOrder?s.groupOrder-e.groupOrder:s.renderOrder!==e.renderOrder?s.renderOrder-e.renderOrder:s.z!==e.z?e.z-s.z:s.id-e.id}function tg(){const s=[];let e=0;const t=[],r=[],a=[];function l(){e=0,t.length=0,r.length=0,a.length=0}function c(x,y,S,M,T,v){let g=s[e];return g===void 0?(g={id:x.id,object:x,geometry:y,material:S,groupOrder:M,renderOrder:x.renderOrder,z:T,group:v},s[e]=g):(g.id=x.id,g.object=x,g.geometry=y,g.material=S,g.groupOrder=M,g.renderOrder=x.renderOrder,g.z=T,g.group=v),e++,g}function f(x,y,S,M,T,v){const g=c(x,y,S,M,T,v);S.transmission>0?r.push(g):S.transparent===!0?a.push(g):t.push(g)}function h(x,y,S,M,T,v){const g=c(x,y,S,M,T,v);S.transmission>0?r.unshift(g):S.transparent===!0?a.unshift(g):t.unshift(g)}function m(x,y){t.length>1&&t.sort(x||PE),r.length>1&&r.sort(y||eg),a.length>1&&a.sort(y||eg)}function _(){for(let x=e,y=s.length;x<y;x++){const S=s[x];if(S.id===null)break;S.id=null,S.object=null,S.geometry=null,S.material=null,S.group=null}}return{opaque:t,transmissive:r,transparent:a,init:l,push:f,unshift:h,finish:_,sort:m}}function LE(){let s=new WeakMap;function e(r,a){const l=s.get(r);let c;return l===void 0?(c=new tg,s.set(r,[c])):a>=l.length?(c=new tg,l.push(c)):c=l[a],c}function t(){s=new WeakMap}return{get:e,dispose:t}}function DE(){const s={};return{get:function(e){if(s[e.id]!==void 0)return s[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new G,color:new pt};break;case"SpotLight":t={position:new G,direction:new G,color:new pt,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new G,color:new pt,distance:0,decay:0};break;case"HemisphereLight":t={direction:new G,skyColor:new pt,groundColor:new pt};break;case"RectAreaLight":t={color:new pt,position:new G,halfWidth:new G,halfHeight:new G};break}return s[e.id]=t,t}}}function UE(){const s={};return{get:function(e){if(s[e.id]!==void 0)return s[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new qe};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new qe};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new qe,shadowCameraNear:1,shadowCameraFar:1e3};break}return s[e.id]=t,t}}}let IE=0;function NE(s,e){return(e.castShadow?2:0)-(s.castShadow?2:0)+(e.map?1:0)-(s.map?1:0)}function FE(s){const e=new DE,t=UE(),r={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let m=0;m<9;m++)r.probe.push(new G);const a=new G,l=new Lt,c=new Lt;function f(m){let _=0,x=0,y=0;for(let b=0;b<9;b++)r.probe[b].set(0,0,0);let S=0,M=0,T=0,v=0,g=0,P=0,L=0,C=0,W=0,F=0,I=0;m.sort(NE);for(let b=0,A=m.length;b<A;b++){const O=m[b],se=O.color,J=O.intensity,ue=O.distance,ce=O.shadow&&O.shadow.map?O.shadow.map.texture:null;if(O.isAmbientLight)_+=se.r*J,x+=se.g*J,y+=se.b*J;else if(O.isLightProbe){for(let $=0;$<9;$++)r.probe[$].addScaledVector(O.sh.coefficients[$],J);I++}else if(O.isDirectionalLight){const $=e.get(O);if($.color.copy(O.color).multiplyScalar(O.intensity),O.castShadow){const oe=O.shadow,k=t.get(O);k.shadowIntensity=oe.intensity,k.shadowBias=oe.bias,k.shadowNormalBias=oe.normalBias,k.shadowRadius=oe.radius,k.shadowMapSize=oe.mapSize,r.directionalShadow[S]=k,r.directionalShadowMap[S]=ce,r.directionalShadowMatrix[S]=O.shadow.matrix,P++}r.directional[S]=$,S++}else if(O.isSpotLight){const $=e.get(O);$.position.setFromMatrixPosition(O.matrixWorld),$.color.copy(se).multiplyScalar(J),$.distance=ue,$.coneCos=Math.cos(O.angle),$.penumbraCos=Math.cos(O.angle*(1-O.penumbra)),$.decay=O.decay,r.spot[T]=$;const oe=O.shadow;if(O.map&&(r.spotLightMap[W]=O.map,W++,oe.updateMatrices(O),O.castShadow&&F++),r.spotLightMatrix[T]=oe.matrix,O.castShadow){const k=t.get(O);k.shadowIntensity=oe.intensity,k.shadowBias=oe.bias,k.shadowNormalBias=oe.normalBias,k.shadowRadius=oe.radius,k.shadowMapSize=oe.mapSize,r.spotShadow[T]=k,r.spotShadowMap[T]=ce,C++}T++}else if(O.isRectAreaLight){const $=e.get(O);$.color.copy(se).multiplyScalar(J),$.halfWidth.set(O.width*.5,0,0),$.halfHeight.set(0,O.height*.5,0),r.rectArea[v]=$,v++}else if(O.isPointLight){const $=e.get(O);if($.color.copy(O.color).multiplyScalar(O.intensity),$.distance=O.distance,$.decay=O.decay,O.castShadow){const oe=O.shadow,k=t.get(O);k.shadowIntensity=oe.intensity,k.shadowBias=oe.bias,k.shadowNormalBias=oe.normalBias,k.shadowRadius=oe.radius,k.shadowMapSize=oe.mapSize,k.shadowCameraNear=oe.camera.near,k.shadowCameraFar=oe.camera.far,r.pointShadow[M]=k,r.pointShadowMap[M]=ce,r.pointShadowMatrix[M]=O.shadow.matrix,L++}r.point[M]=$,M++}else if(O.isHemisphereLight){const $=e.get(O);$.skyColor.copy(O.color).multiplyScalar(J),$.groundColor.copy(O.groundColor).multiplyScalar(J),r.hemi[g]=$,g++}}v>0&&(s.has("OES_texture_float_linear")===!0?(r.rectAreaLTC1=be.LTC_FLOAT_1,r.rectAreaLTC2=be.LTC_FLOAT_2):(r.rectAreaLTC1=be.LTC_HALF_1,r.rectAreaLTC2=be.LTC_HALF_2)),r.ambient[0]=_,r.ambient[1]=x,r.ambient[2]=y;const B=r.hash;(B.directionalLength!==S||B.pointLength!==M||B.spotLength!==T||B.rectAreaLength!==v||B.hemiLength!==g||B.numDirectionalShadows!==P||B.numPointShadows!==L||B.numSpotShadows!==C||B.numSpotMaps!==W||B.numLightProbes!==I)&&(r.directional.length=S,r.spot.length=T,r.rectArea.length=v,r.point.length=M,r.hemi.length=g,r.directionalShadow.length=P,r.directionalShadowMap.length=P,r.pointShadow.length=L,r.pointShadowMap.length=L,r.spotShadow.length=C,r.spotShadowMap.length=C,r.directionalShadowMatrix.length=P,r.pointShadowMatrix.length=L,r.spotLightMatrix.length=C+W-F,r.spotLightMap.length=W,r.numSpotLightShadowsWithMaps=F,r.numLightProbes=I,B.directionalLength=S,B.pointLength=M,B.spotLength=T,B.rectAreaLength=v,B.hemiLength=g,B.numDirectionalShadows=P,B.numPointShadows=L,B.numSpotShadows=C,B.numSpotMaps=W,B.numLightProbes=I,r.version=IE++)}function h(m,_){let x=0,y=0,S=0,M=0,T=0;const v=_.matrixWorldInverse;for(let g=0,P=m.length;g<P;g++){const L=m[g];if(L.isDirectionalLight){const C=r.directional[x];C.direction.setFromMatrixPosition(L.matrixWorld),a.setFromMatrixPosition(L.target.matrixWorld),C.direction.sub(a),C.direction.transformDirection(v),x++}else if(L.isSpotLight){const C=r.spot[S];C.position.setFromMatrixPosition(L.matrixWorld),C.position.applyMatrix4(v),C.direction.setFromMatrixPosition(L.matrixWorld),a.setFromMatrixPosition(L.target.matrixWorld),C.direction.sub(a),C.direction.transformDirection(v),S++}else if(L.isRectAreaLight){const C=r.rectArea[M];C.position.setFromMatrixPosition(L.matrixWorld),C.position.applyMatrix4(v),c.identity(),l.copy(L.matrixWorld),l.premultiply(v),c.extractRotation(l),C.halfWidth.set(L.width*.5,0,0),C.halfHeight.set(0,L.height*.5,0),C.halfWidth.applyMatrix4(c),C.halfHeight.applyMatrix4(c),M++}else if(L.isPointLight){const C=r.point[y];C.position.setFromMatrixPosition(L.matrixWorld),C.position.applyMatrix4(v),y++}else if(L.isHemisphereLight){const C=r.hemi[T];C.direction.setFromMatrixPosition(L.matrixWorld),C.direction.transformDirection(v),T++}}}return{setup:f,setupView:h,state:r}}function ng(s){const e=new FE(s),t=[],r=[];function a(_){m.camera=_,t.length=0,r.length=0}function l(_){t.push(_)}function c(_){r.push(_)}function f(){e.setup(t)}function h(_){e.setupView(t,_)}const m={lightsArray:t,shadowsArray:r,camera:null,lights:e,transmissionRenderTarget:{}};return{init:a,state:m,setupLights:f,setupLightsView:h,pushLight:l,pushShadow:c}}function OE(s){let e=new WeakMap;function t(a,l=0){const c=e.get(a);let f;return c===void 0?(f=new ng(s),e.set(a,[f])):l>=c.length?(f=new ng(s),c.push(f)):f=c[l],f}function r(){e=new WeakMap}return{get:t,dispose:r}}class zE extends Dr{static get type(){return"MeshDepthMaterial"}constructor(e){super(),this.isMeshDepthMaterial=!0,this.depthPacking=U0,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class kE extends Dr{static get type(){return"MeshDistanceMaterial"}constructor(e){super(),this.isMeshDistanceMaterial=!0,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}const BE=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,HE=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function VE(s,e,t){let r=new Td;const a=new qe,l=new qe,c=new Vt,f=new zE({depthPacking:I0}),h=new kE,m={},_=t.maxTextureSize,x={[br]:Rn,[Rn]:br,[Ti]:Ti},y=new Lr({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new qe},radius:{value:4}},vertexShader:BE,fragmentShader:HE}),S=y.clone();S.defines.HORIZONTAL_PASS=1;const M=new bn;M.setAttribute("position",new gi(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const T=new kn(M,y),v=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=wg;let g=this.type;this.render=function(F,I,B){if(v.enabled===!1||v.autoUpdate===!1&&v.needsUpdate===!1||F.length===0)return;const b=s.getRenderTarget(),A=s.getActiveCubeFace(),O=s.getActiveMipmapLevel(),se=s.state;se.setBlending(Ar),se.buffers.color.setClear(1,1,1,1),se.buffers.depth.setTest(!0),se.setScissorTest(!1);const J=g!==Wi&&this.type===Wi,ue=g===Wi&&this.type!==Wi;for(let ce=0,$=F.length;ce<$;ce++){const oe=F[ce],k=oe.shadow;if(k===void 0){console.warn("THREE.WebGLShadowMap:",oe,"has no shadow.");continue}if(k.autoUpdate===!1&&k.needsUpdate===!1)continue;a.copy(k.mapSize);const le=k.getFrameExtents();if(a.multiply(le),l.copy(k.mapSize),(a.x>_||a.y>_)&&(a.x>_&&(l.x=Math.floor(_/le.x),a.x=l.x*le.x,k.mapSize.x=l.x),a.y>_&&(l.y=Math.floor(_/le.y),a.y=l.y*le.y,k.mapSize.y=l.y)),k.map===null||J===!0||ue===!0){const N=this.type!==Wi?{minFilter:mi,magFilter:mi}:{};k.map!==null&&k.map.dispose(),k.map=new ss(a.x,a.y,N),k.map.texture.name=oe.name+".shadowMap",k.camera.updateProjectionMatrix()}s.setRenderTarget(k.map),s.clear();const re=k.getViewportCount();for(let N=0;N<re;N++){const ie=k.getViewport(N);c.set(l.x*ie.x,l.y*ie.y,l.x*ie.z,l.y*ie.w),se.viewport(c),k.updateMatrices(oe,N),r=k.getFrustum(),C(I,B,k.camera,oe,this.type)}k.isPointLightShadow!==!0&&this.type===Wi&&P(k,B),k.needsUpdate=!1}g=this.type,v.needsUpdate=!1,s.setRenderTarget(b,A,O)};function P(F,I){const B=e.update(T);y.defines.VSM_SAMPLES!==F.blurSamples&&(y.defines.VSM_SAMPLES=F.blurSamples,S.defines.VSM_SAMPLES=F.blurSamples,y.needsUpdate=!0,S.needsUpdate=!0),F.mapPass===null&&(F.mapPass=new ss(a.x,a.y)),y.uniforms.shadow_pass.value=F.map.texture,y.uniforms.resolution.value=F.mapSize,y.uniforms.radius.value=F.radius,s.setRenderTarget(F.mapPass),s.clear(),s.renderBufferDirect(I,null,B,y,T,null),S.uniforms.shadow_pass.value=F.mapPass.texture,S.uniforms.resolution.value=F.mapSize,S.uniforms.radius.value=F.radius,s.setRenderTarget(F.map),s.clear(),s.renderBufferDirect(I,null,B,S,T,null)}function L(F,I,B,b){let A=null;const O=B.isPointLight===!0?F.customDistanceMaterial:F.customDepthMaterial;if(O!==void 0)A=O;else if(A=B.isPointLight===!0?h:f,s.localClippingEnabled&&I.clipShadows===!0&&Array.isArray(I.clippingPlanes)&&I.clippingPlanes.length!==0||I.displacementMap&&I.displacementScale!==0||I.alphaMap&&I.alphaTest>0||I.map&&I.alphaTest>0){const se=A.uuid,J=I.uuid;let ue=m[se];ue===void 0&&(ue={},m[se]=ue);let ce=ue[J];ce===void 0&&(ce=A.clone(),ue[J]=ce,I.addEventListener("dispose",W)),A=ce}if(A.visible=I.visible,A.wireframe=I.wireframe,b===Wi?A.side=I.shadowSide!==null?I.shadowSide:I.side:A.side=I.shadowSide!==null?I.shadowSide:x[I.side],A.alphaMap=I.alphaMap,A.alphaTest=I.alphaTest,A.map=I.map,A.clipShadows=I.clipShadows,A.clippingPlanes=I.clippingPlanes,A.clipIntersection=I.clipIntersection,A.displacementMap=I.displacementMap,A.displacementScale=I.displacementScale,A.displacementBias=I.displacementBias,A.wireframeLinewidth=I.wireframeLinewidth,A.linewidth=I.linewidth,B.isPointLight===!0&&A.isMeshDistanceMaterial===!0){const se=s.properties.get(A);se.light=B}return A}function C(F,I,B,b,A){if(F.visible===!1)return;if(F.layers.test(I.layers)&&(F.isMesh||F.isLine||F.isPoints)&&(F.castShadow||F.receiveShadow&&A===Wi)&&(!F.frustumCulled||r.intersectsObject(F))){F.modelViewMatrix.multiplyMatrices(B.matrixWorldInverse,F.matrixWorld);const J=e.update(F),ue=F.material;if(Array.isArray(ue)){const ce=J.groups;for(let $=0,oe=ce.length;$<oe;$++){const k=ce[$],le=ue[k.materialIndex];if(le&&le.visible){const re=L(F,le,b,A);F.onBeforeShadow(s,F,I,B,J,re,k),s.renderBufferDirect(B,null,J,re,F,k),F.onAfterShadow(s,F,I,B,J,re,k)}}}else if(ue.visible){const ce=L(F,ue,b,A);F.onBeforeShadow(s,F,I,B,J,ce,null),s.renderBufferDirect(B,null,J,ce,F,null),F.onAfterShadow(s,F,I,B,J,ce,null)}}const se=F.children;for(let J=0,ue=se.length;J<ue;J++)C(se[J],I,B,b,A)}function W(F){F.target.removeEventListener("dispose",W);for(const B in m){const b=m[B],A=F.target.uuid;A in b&&(b[A].dispose(),delete b[A])}}}const GE={[Rf]:bf,[Pf]:Uf,[Lf]:If,[no]:Df,[bf]:Rf,[Uf]:Pf,[If]:Lf,[Df]:no};function WE(s,e){function t(){let V=!1;const Re=new Vt;let ae=null;const he=new Vt(0,0,0,0);return{setMask:function(Le){ae!==Le&&!V&&(s.colorMask(Le,Le,Le,Le),ae=Le)},setLocked:function(Le){V=Le},setClear:function(Le,Pe,st,Nt,qt){qt===!0&&(Le*=Nt,Pe*=Nt,st*=Nt),Re.set(Le,Pe,st,Nt),he.equals(Re)===!1&&(s.clearColor(Le,Pe,st,Nt),he.copy(Re))},reset:function(){V=!1,ae=null,he.set(-1,0,0,0)}}}function r(){let V=!1,Re=!1,ae=null,he=null,Le=null;return{setReversed:function(Pe){if(Re!==Pe){const st=e.get("EXT_clip_control");Re?st.clipControlEXT(st.LOWER_LEFT_EXT,st.ZERO_TO_ONE_EXT):st.clipControlEXT(st.LOWER_LEFT_EXT,st.NEGATIVE_ONE_TO_ONE_EXT);const Nt=Le;Le=null,this.setClear(Nt)}Re=Pe},getReversed:function(){return Re},setTest:function(Pe){Pe?xe(s.DEPTH_TEST):Ae(s.DEPTH_TEST)},setMask:function(Pe){ae!==Pe&&!V&&(s.depthMask(Pe),ae=Pe)},setFunc:function(Pe){if(Re&&(Pe=GE[Pe]),he!==Pe){switch(Pe){case Rf:s.depthFunc(s.NEVER);break;case bf:s.depthFunc(s.ALWAYS);break;case Pf:s.depthFunc(s.LESS);break;case no:s.depthFunc(s.LEQUAL);break;case Lf:s.depthFunc(s.EQUAL);break;case Df:s.depthFunc(s.GEQUAL);break;case Uf:s.depthFunc(s.GREATER);break;case If:s.depthFunc(s.NOTEQUAL);break;default:s.depthFunc(s.LEQUAL)}he=Pe}},setLocked:function(Pe){V=Pe},setClear:function(Pe){Le!==Pe&&(Re&&(Pe=1-Pe),s.clearDepth(Pe),Le=Pe)},reset:function(){V=!1,ae=null,he=null,Le=null,Re=!1}}}function a(){let V=!1,Re=null,ae=null,he=null,Le=null,Pe=null,st=null,Nt=null,qt=null;return{setTest:function(vt){V||(vt?xe(s.STENCIL_TEST):Ae(s.STENCIL_TEST))},setMask:function(vt){Re!==vt&&!V&&(s.stencilMask(vt),Re=vt)},setFunc:function(vt,Pn,xn){(ae!==vt||he!==Pn||Le!==xn)&&(s.stencilFunc(vt,Pn,xn),ae=vt,he=Pn,Le=xn)},setOp:function(vt,Pn,xn){(Pe!==vt||st!==Pn||Nt!==xn)&&(s.stencilOp(vt,Pn,xn),Pe=vt,st=Pn,Nt=xn)},setLocked:function(vt){V=vt},setClear:function(vt){qt!==vt&&(s.clearStencil(vt),qt=vt)},reset:function(){V=!1,Re=null,ae=null,he=null,Le=null,Pe=null,st=null,Nt=null,qt=null}}}const l=new t,c=new r,f=new a,h=new WeakMap,m=new WeakMap;let _={},x={},y=new WeakMap,S=[],M=null,T=!1,v=null,g=null,P=null,L=null,C=null,W=null,F=null,I=new pt(0,0,0),B=0,b=!1,A=null,O=null,se=null,J=null,ue=null;const ce=s.getParameter(s.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let $=!1,oe=0;const k=s.getParameter(s.VERSION);k.indexOf("WebGL")!==-1?(oe=parseFloat(/^WebGL (\d)/.exec(k)[1]),$=oe>=1):k.indexOf("OpenGL ES")!==-1&&(oe=parseFloat(/^OpenGL ES (\d)/.exec(k)[1]),$=oe>=2);let le=null,re={};const N=s.getParameter(s.SCISSOR_BOX),ie=s.getParameter(s.VIEWPORT),De=new Vt().fromArray(N),Q=new Vt().fromArray(ie);function fe(V,Re,ae,he){const Le=new Uint8Array(4),Pe=s.createTexture();s.bindTexture(V,Pe),s.texParameteri(V,s.TEXTURE_MIN_FILTER,s.NEAREST),s.texParameteri(V,s.TEXTURE_MAG_FILTER,s.NEAREST);for(let st=0;st<ae;st++)V===s.TEXTURE_3D||V===s.TEXTURE_2D_ARRAY?s.texImage3D(Re,0,s.RGBA,1,1,he,0,s.RGBA,s.UNSIGNED_BYTE,Le):s.texImage2D(Re+st,0,s.RGBA,1,1,0,s.RGBA,s.UNSIGNED_BYTE,Le);return Pe}const Ee={};Ee[s.TEXTURE_2D]=fe(s.TEXTURE_2D,s.TEXTURE_2D,1),Ee[s.TEXTURE_CUBE_MAP]=fe(s.TEXTURE_CUBE_MAP,s.TEXTURE_CUBE_MAP_POSITIVE_X,6),Ee[s.TEXTURE_2D_ARRAY]=fe(s.TEXTURE_2D_ARRAY,s.TEXTURE_2D_ARRAY,1,1),Ee[s.TEXTURE_3D]=fe(s.TEXTURE_3D,s.TEXTURE_3D,1,1),l.setClear(0,0,0,1),c.setClear(1),f.setClear(0),xe(s.DEPTH_TEST),c.setFunc(no),ht(!1),ct(am),xe(s.CULL_FACE),Y(Ar);function xe(V){_[V]!==!0&&(s.enable(V),_[V]=!0)}function Ae(V){_[V]!==!1&&(s.disable(V),_[V]=!1)}function Ie(V,Re){return x[V]!==Re?(s.bindFramebuffer(V,Re),x[V]=Re,V===s.DRAW_FRAMEBUFFER&&(x[s.FRAMEBUFFER]=Re),V===s.FRAMEBUFFER&&(x[s.DRAW_FRAMEBUFFER]=Re),!0):!1}function Qe(V,Re){let ae=S,he=!1;if(V){ae=y.get(Re),ae===void 0&&(ae=[],y.set(Re,ae));const Le=V.textures;if(ae.length!==Le.length||ae[0]!==s.COLOR_ATTACHMENT0){for(let Pe=0,st=Le.length;Pe<st;Pe++)ae[Pe]=s.COLOR_ATTACHMENT0+Pe;ae.length=Le.length,he=!0}}else ae[0]!==s.BACK&&(ae[0]=s.BACK,he=!0);he&&s.drawBuffers(ae)}function Ct(V){return M!==V?(s.useProgram(V),M=V,!0):!1}const mt={[es]:s.FUNC_ADD,[o0]:s.FUNC_SUBTRACT,[a0]:s.FUNC_REVERSE_SUBTRACT};mt[l0]=s.MIN,mt[u0]=s.MAX;const Ut={[c0]:s.ZERO,[f0]:s.ONE,[d0]:s.SRC_COLOR,[Af]:s.SRC_ALPHA,[v0]:s.SRC_ALPHA_SATURATE,[g0]:s.DST_COLOR,[p0]:s.DST_ALPHA,[h0]:s.ONE_MINUS_SRC_COLOR,[Cf]:s.ONE_MINUS_SRC_ALPHA,[_0]:s.ONE_MINUS_DST_COLOR,[m0]:s.ONE_MINUS_DST_ALPHA,[x0]:s.CONSTANT_COLOR,[y0]:s.ONE_MINUS_CONSTANT_COLOR,[S0]:s.CONSTANT_ALPHA,[M0]:s.ONE_MINUS_CONSTANT_ALPHA};function Y(V,Re,ae,he,Le,Pe,st,Nt,qt,vt){if(V===Ar){T===!0&&(Ae(s.BLEND),T=!1);return}if(T===!1&&(xe(s.BLEND),T=!0),V!==s0){if(V!==v||vt!==b){if((g!==es||C!==es)&&(s.blendEquation(s.FUNC_ADD),g=es,C=es),vt)switch(V){case Js:s.blendFuncSeparate(s.ONE,s.ONE_MINUS_SRC_ALPHA,s.ONE,s.ONE_MINUS_SRC_ALPHA);break;case lm:s.blendFunc(s.ONE,s.ONE);break;case um:s.blendFuncSeparate(s.ZERO,s.ONE_MINUS_SRC_COLOR,s.ZERO,s.ONE);break;case cm:s.blendFuncSeparate(s.ZERO,s.SRC_COLOR,s.ZERO,s.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",V);break}else switch(V){case Js:s.blendFuncSeparate(s.SRC_ALPHA,s.ONE_MINUS_SRC_ALPHA,s.ONE,s.ONE_MINUS_SRC_ALPHA);break;case lm:s.blendFunc(s.SRC_ALPHA,s.ONE);break;case um:s.blendFuncSeparate(s.ZERO,s.ONE_MINUS_SRC_COLOR,s.ZERO,s.ONE);break;case cm:s.blendFunc(s.ZERO,s.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",V);break}P=null,L=null,W=null,F=null,I.set(0,0,0),B=0,v=V,b=vt}return}Le=Le||Re,Pe=Pe||ae,st=st||he,(Re!==g||Le!==C)&&(s.blendEquationSeparate(mt[Re],mt[Le]),g=Re,C=Le),(ae!==P||he!==L||Pe!==W||st!==F)&&(s.blendFuncSeparate(Ut[ae],Ut[he],Ut[Pe],Ut[st]),P=ae,L=he,W=Pe,F=st),(Nt.equals(I)===!1||qt!==B)&&(s.blendColor(Nt.r,Nt.g,Nt.b,qt),I.copy(Nt),B=qt),v=V,b=!1}function vn(V,Re){V.side===Ti?Ae(s.CULL_FACE):xe(s.CULL_FACE);let ae=V.side===Rn;Re&&(ae=!ae),ht(ae),V.blending===Js&&V.transparent===!1?Y(Ar):Y(V.blending,V.blendEquation,V.blendSrc,V.blendDst,V.blendEquationAlpha,V.blendSrcAlpha,V.blendDstAlpha,V.blendColor,V.blendAlpha,V.premultipliedAlpha),c.setFunc(V.depthFunc),c.setTest(V.depthTest),c.setMask(V.depthWrite),l.setMask(V.colorWrite);const he=V.stencilWrite;f.setTest(he),he&&(f.setMask(V.stencilWriteMask),f.setFunc(V.stencilFunc,V.stencilRef,V.stencilFuncMask),f.setOp(V.stencilFail,V.stencilZFail,V.stencilZPass)),wt(V.polygonOffset,V.polygonOffsetFactor,V.polygonOffsetUnits),V.alphaToCoverage===!0?xe(s.SAMPLE_ALPHA_TO_COVERAGE):Ae(s.SAMPLE_ALPHA_TO_COVERAGE)}function ht(V){A!==V&&(V?s.frontFace(s.CW):s.frontFace(s.CCW),A=V)}function ct(V){V!==n0?(xe(s.CULL_FACE),V!==O&&(V===am?s.cullFace(s.BACK):V===i0?s.cullFace(s.FRONT):s.cullFace(s.FRONT_AND_BACK))):Ae(s.CULL_FACE),O=V}function $e(V){V!==se&&($&&s.lineWidth(V),se=V)}function wt(V,Re,ae){V?(xe(s.POLYGON_OFFSET_FILL),(J!==Re||ue!==ae)&&(s.polygonOffset(Re,ae),J=Re,ue=ae)):Ae(s.POLYGON_OFFSET_FILL)}function Ye(V){V?xe(s.SCISSOR_TEST):Ae(s.SCISSOR_TEST)}function D(V){V===void 0&&(V=s.TEXTURE0+ce-1),le!==V&&(s.activeTexture(V),le=V)}function w(V,Re,ae){ae===void 0&&(le===null?ae=s.TEXTURE0+ce-1:ae=le);let he=re[ae];he===void 0&&(he={type:void 0,texture:void 0},re[ae]=he),(he.type!==V||he.texture!==Re)&&(le!==ae&&(s.activeTexture(ae),le=ae),s.bindTexture(V,Re||Ee[V]),he.type=V,he.texture=Re)}function Z(){const V=re[le];V!==void 0&&V.type!==void 0&&(s.bindTexture(V.type,null),V.type=void 0,V.texture=void 0)}function pe(){try{s.compressedTexImage2D.apply(s,arguments)}catch(V){console.error("THREE.WebGLState:",V)}}function _e(){try{s.compressedTexImage3D.apply(s,arguments)}catch(V){console.error("THREE.WebGLState:",V)}}function de(){try{s.texSubImage2D.apply(s,arguments)}catch(V){console.error("THREE.WebGLState:",V)}}function Ve(){try{s.texSubImage3D.apply(s,arguments)}catch(V){console.error("THREE.WebGLState:",V)}}function Ce(){try{s.compressedTexSubImage2D.apply(s,arguments)}catch(V){console.error("THREE.WebGLState:",V)}}function Ne(){try{s.compressedTexSubImage3D.apply(s,arguments)}catch(V){console.error("THREE.WebGLState:",V)}}function ut(){try{s.texStorage2D.apply(s,arguments)}catch(V){console.error("THREE.WebGLState:",V)}}function Se(){try{s.texStorage3D.apply(s,arguments)}catch(V){console.error("THREE.WebGLState:",V)}}function Oe(){try{s.texImage2D.apply(s,arguments)}catch(V){console.error("THREE.WebGLState:",V)}}function Je(){try{s.texImage3D.apply(s,arguments)}catch(V){console.error("THREE.WebGLState:",V)}}function et(V){De.equals(V)===!1&&(s.scissor(V.x,V.y,V.z,V.w),De.copy(V))}function ze(V){Q.equals(V)===!1&&(s.viewport(V.x,V.y,V.z,V.w),Q.copy(V))}function ft(V,Re){let ae=m.get(Re);ae===void 0&&(ae=new WeakMap,m.set(Re,ae));let he=ae.get(V);he===void 0&&(he=s.getUniformBlockIndex(Re,V.name),ae.set(V,he))}function rt(V,Re){const he=m.get(Re).get(V);h.get(Re)!==he&&(s.uniformBlockBinding(Re,he,V.__bindingPointIndex),h.set(Re,he))}function Tt(){s.disable(s.BLEND),s.disable(s.CULL_FACE),s.disable(s.DEPTH_TEST),s.disable(s.POLYGON_OFFSET_FILL),s.disable(s.SCISSOR_TEST),s.disable(s.STENCIL_TEST),s.disable(s.SAMPLE_ALPHA_TO_COVERAGE),s.blendEquation(s.FUNC_ADD),s.blendFunc(s.ONE,s.ZERO),s.blendFuncSeparate(s.ONE,s.ZERO,s.ONE,s.ZERO),s.blendColor(0,0,0,0),s.colorMask(!0,!0,!0,!0),s.clearColor(0,0,0,0),s.depthMask(!0),s.depthFunc(s.LESS),c.setReversed(!1),s.clearDepth(1),s.stencilMask(4294967295),s.stencilFunc(s.ALWAYS,0,4294967295),s.stencilOp(s.KEEP,s.KEEP,s.KEEP),s.clearStencil(0),s.cullFace(s.BACK),s.frontFace(s.CCW),s.polygonOffset(0,0),s.activeTexture(s.TEXTURE0),s.bindFramebuffer(s.FRAMEBUFFER,null),s.bindFramebuffer(s.DRAW_FRAMEBUFFER,null),s.bindFramebuffer(s.READ_FRAMEBUFFER,null),s.useProgram(null),s.lineWidth(1),s.scissor(0,0,s.canvas.width,s.canvas.height),s.viewport(0,0,s.canvas.width,s.canvas.height),_={},le=null,re={},x={},y=new WeakMap,S=[],M=null,T=!1,v=null,g=null,P=null,L=null,C=null,W=null,F=null,I=new pt(0,0,0),B=0,b=!1,A=null,O=null,se=null,J=null,ue=null,De.set(0,0,s.canvas.width,s.canvas.height),Q.set(0,0,s.canvas.width,s.canvas.height),l.reset(),c.reset(),f.reset()}return{buffers:{color:l,depth:c,stencil:f},enable:xe,disable:Ae,bindFramebuffer:Ie,drawBuffers:Qe,useProgram:Ct,setBlending:Y,setMaterial:vn,setFlipSided:ht,setCullFace:ct,setLineWidth:$e,setPolygonOffset:wt,setScissorTest:Ye,activeTexture:D,bindTexture:w,unbindTexture:Z,compressedTexImage2D:pe,compressedTexImage3D:_e,texImage2D:Oe,texImage3D:Je,updateUBOMapping:ft,uniformBlockBinding:rt,texStorage2D:ut,texStorage3D:Se,texSubImage2D:de,texSubImage3D:Ve,compressedTexSubImage2D:Ce,compressedTexSubImage3D:Ne,scissor:et,viewport:ze,reset:Tt}}function ig(s,e,t,r){const a=XE(r);switch(t){case Pg:return s*e;case Dg:return s*e;case Ug:return s*e*2;case Ig:return s*e/a.components*a.byteLength;case Sd:return s*e/a.components*a.byteLength;case Ng:return s*e*2/a.components*a.byteLength;case Md:return s*e*2/a.components*a.byteLength;case Lg:return s*e*3/a.components*a.byteLength;case pi:return s*e*4/a.components*a.byteLength;case Ed:return s*e*4/a.components*a.byteLength;case Hl:case Vl:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*8;case Gl:case Wl:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*16;case Bf:case Vf:return Math.max(s,16)*Math.max(e,8)/4;case kf:case Hf:return Math.max(s,8)*Math.max(e,8)/2;case Gf:case Wf:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*8;case Xf:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*16;case jf:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*16;case Yf:return Math.floor((s+4)/5)*Math.floor((e+3)/4)*16;case qf:return Math.floor((s+4)/5)*Math.floor((e+4)/5)*16;case $f:return Math.floor((s+5)/6)*Math.floor((e+4)/5)*16;case Kf:return Math.floor((s+5)/6)*Math.floor((e+5)/6)*16;case Zf:return Math.floor((s+7)/8)*Math.floor((e+4)/5)*16;case Qf:return Math.floor((s+7)/8)*Math.floor((e+5)/6)*16;case Jf:return Math.floor((s+7)/8)*Math.floor((e+7)/8)*16;case ed:return Math.floor((s+9)/10)*Math.floor((e+4)/5)*16;case td:return Math.floor((s+9)/10)*Math.floor((e+5)/6)*16;case nd:return Math.floor((s+9)/10)*Math.floor((e+7)/8)*16;case id:return Math.floor((s+9)/10)*Math.floor((e+9)/10)*16;case rd:return Math.floor((s+11)/12)*Math.floor((e+9)/10)*16;case sd:return Math.floor((s+11)/12)*Math.floor((e+11)/12)*16;case Xl:case od:case ad:return Math.ceil(s/4)*Math.ceil(e/4)*16;case Fg:case ld:return Math.ceil(s/4)*Math.ceil(e/4)*8;case ud:case cd:return Math.ceil(s/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function XE(s){switch(s){case $i:case Cg:return{byteLength:1,components:1};case Jo:case Rg:case na:return{byteLength:2,components:1};case xd:case yd:return{byteLength:2,components:4};case rs:case vd:case ji:return{byteLength:4,components:1};case bg:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${s}.`)}function jE(s,e,t,r,a,l,c){const f=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,h=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),m=new qe,_=new WeakMap;let x;const y=new WeakMap;let S=!1;try{S=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function M(D,w){return S?new OffscreenCanvas(D,w):ea("canvas")}function T(D,w,Z){let pe=1;const _e=Ye(D);if((_e.width>Z||_e.height>Z)&&(pe=Z/Math.max(_e.width,_e.height)),pe<1)if(typeof HTMLImageElement<"u"&&D instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&D instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&D instanceof ImageBitmap||typeof VideoFrame<"u"&&D instanceof VideoFrame){const de=Math.floor(pe*_e.width),Ve=Math.floor(pe*_e.height);x===void 0&&(x=M(de,Ve));const Ce=w?M(de,Ve):x;return Ce.width=de,Ce.height=Ve,Ce.getContext("2d").drawImage(D,0,0,de,Ve),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+_e.width+"x"+_e.height+") to ("+de+"x"+Ve+")."),Ce}else return"data"in D&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+_e.width+"x"+_e.height+")."),D;return D}function v(D){return D.generateMipmaps}function g(D){s.generateMipmap(D)}function P(D){return D.isWebGLCubeRenderTarget?s.TEXTURE_CUBE_MAP:D.isWebGL3DRenderTarget?s.TEXTURE_3D:D.isWebGLArrayRenderTarget||D.isCompressedArrayTexture?s.TEXTURE_2D_ARRAY:s.TEXTURE_2D}function L(D,w,Z,pe,_e=!1){if(D!==null){if(s[D]!==void 0)return s[D];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+D+"'")}let de=w;if(w===s.RED&&(Z===s.FLOAT&&(de=s.R32F),Z===s.HALF_FLOAT&&(de=s.R16F),Z===s.UNSIGNED_BYTE&&(de=s.R8)),w===s.RED_INTEGER&&(Z===s.UNSIGNED_BYTE&&(de=s.R8UI),Z===s.UNSIGNED_SHORT&&(de=s.R16UI),Z===s.UNSIGNED_INT&&(de=s.R32UI),Z===s.BYTE&&(de=s.R8I),Z===s.SHORT&&(de=s.R16I),Z===s.INT&&(de=s.R32I)),w===s.RG&&(Z===s.FLOAT&&(de=s.RG32F),Z===s.HALF_FLOAT&&(de=s.RG16F),Z===s.UNSIGNED_BYTE&&(de=s.RG8)),w===s.RG_INTEGER&&(Z===s.UNSIGNED_BYTE&&(de=s.RG8UI),Z===s.UNSIGNED_SHORT&&(de=s.RG16UI),Z===s.UNSIGNED_INT&&(de=s.RG32UI),Z===s.BYTE&&(de=s.RG8I),Z===s.SHORT&&(de=s.RG16I),Z===s.INT&&(de=s.RG32I)),w===s.RGB_INTEGER&&(Z===s.UNSIGNED_BYTE&&(de=s.RGB8UI),Z===s.UNSIGNED_SHORT&&(de=s.RGB16UI),Z===s.UNSIGNED_INT&&(de=s.RGB32UI),Z===s.BYTE&&(de=s.RGB8I),Z===s.SHORT&&(de=s.RGB16I),Z===s.INT&&(de=s.RGB32I)),w===s.RGBA_INTEGER&&(Z===s.UNSIGNED_BYTE&&(de=s.RGBA8UI),Z===s.UNSIGNED_SHORT&&(de=s.RGBA16UI),Z===s.UNSIGNED_INT&&(de=s.RGBA32UI),Z===s.BYTE&&(de=s.RGBA8I),Z===s.SHORT&&(de=s.RGBA16I),Z===s.INT&&(de=s.RGBA32I)),w===s.RGB&&Z===s.UNSIGNED_INT_5_9_9_9_REV&&(de=s.RGB9_E5),w===s.RGBA){const Ve=_e?tu:yt.getTransfer(pe);Z===s.FLOAT&&(de=s.RGBA32F),Z===s.HALF_FLOAT&&(de=s.RGBA16F),Z===s.UNSIGNED_BYTE&&(de=Ve===Rt?s.SRGB8_ALPHA8:s.RGBA8),Z===s.UNSIGNED_SHORT_4_4_4_4&&(de=s.RGBA4),Z===s.UNSIGNED_SHORT_5_5_5_1&&(de=s.RGB5_A1)}return(de===s.R16F||de===s.R32F||de===s.RG16F||de===s.RG32F||de===s.RGBA16F||de===s.RGBA32F)&&e.get("EXT_color_buffer_float"),de}function C(D,w){let Z;return D?w===null||w===rs||w===so?Z=s.DEPTH24_STENCIL8:w===ji?Z=s.DEPTH32F_STENCIL8:w===Jo&&(Z=s.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):w===null||w===rs||w===so?Z=s.DEPTH_COMPONENT24:w===ji?Z=s.DEPTH_COMPONENT32F:w===Jo&&(Z=s.DEPTH_COMPONENT16),Z}function W(D,w){return v(D)===!0||D.isFramebufferTexture&&D.minFilter!==mi&&D.minFilter!==Ai?Math.log2(Math.max(w.width,w.height))+1:D.mipmaps!==void 0&&D.mipmaps.length>0?D.mipmaps.length:D.isCompressedTexture&&Array.isArray(D.image)?w.mipmaps.length:1}function F(D){const w=D.target;w.removeEventListener("dispose",F),B(w),w.isVideoTexture&&_.delete(w)}function I(D){const w=D.target;w.removeEventListener("dispose",I),A(w)}function B(D){const w=r.get(D);if(w.__webglInit===void 0)return;const Z=D.source,pe=y.get(Z);if(pe){const _e=pe[w.__cacheKey];_e.usedTimes--,_e.usedTimes===0&&b(D),Object.keys(pe).length===0&&y.delete(Z)}r.remove(D)}function b(D){const w=r.get(D);s.deleteTexture(w.__webglTexture);const Z=D.source,pe=y.get(Z);delete pe[w.__cacheKey],c.memory.textures--}function A(D){const w=r.get(D);if(D.depthTexture&&(D.depthTexture.dispose(),r.remove(D.depthTexture)),D.isWebGLCubeRenderTarget)for(let pe=0;pe<6;pe++){if(Array.isArray(w.__webglFramebuffer[pe]))for(let _e=0;_e<w.__webglFramebuffer[pe].length;_e++)s.deleteFramebuffer(w.__webglFramebuffer[pe][_e]);else s.deleteFramebuffer(w.__webglFramebuffer[pe]);w.__webglDepthbuffer&&s.deleteRenderbuffer(w.__webglDepthbuffer[pe])}else{if(Array.isArray(w.__webglFramebuffer))for(let pe=0;pe<w.__webglFramebuffer.length;pe++)s.deleteFramebuffer(w.__webglFramebuffer[pe]);else s.deleteFramebuffer(w.__webglFramebuffer);if(w.__webglDepthbuffer&&s.deleteRenderbuffer(w.__webglDepthbuffer),w.__webglMultisampledFramebuffer&&s.deleteFramebuffer(w.__webglMultisampledFramebuffer),w.__webglColorRenderbuffer)for(let pe=0;pe<w.__webglColorRenderbuffer.length;pe++)w.__webglColorRenderbuffer[pe]&&s.deleteRenderbuffer(w.__webglColorRenderbuffer[pe]);w.__webglDepthRenderbuffer&&s.deleteRenderbuffer(w.__webglDepthRenderbuffer)}const Z=D.textures;for(let pe=0,_e=Z.length;pe<_e;pe++){const de=r.get(Z[pe]);de.__webglTexture&&(s.deleteTexture(de.__webglTexture),c.memory.textures--),r.remove(Z[pe])}r.remove(D)}let O=0;function se(){O=0}function J(){const D=O;return D>=a.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+D+" texture units while this GPU supports only "+a.maxTextures),O+=1,D}function ue(D){const w=[];return w.push(D.wrapS),w.push(D.wrapT),w.push(D.wrapR||0),w.push(D.magFilter),w.push(D.minFilter),w.push(D.anisotropy),w.push(D.internalFormat),w.push(D.format),w.push(D.type),w.push(D.generateMipmaps),w.push(D.premultiplyAlpha),w.push(D.flipY),w.push(D.unpackAlignment),w.push(D.colorSpace),w.join()}function ce(D,w){const Z=r.get(D);if(D.isVideoTexture&&$e(D),D.isRenderTargetTexture===!1&&D.version>0&&Z.__version!==D.version){const pe=D.image;if(pe===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(pe.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{Q(Z,D,w);return}}t.bindTexture(s.TEXTURE_2D,Z.__webglTexture,s.TEXTURE0+w)}function $(D,w){const Z=r.get(D);if(D.version>0&&Z.__version!==D.version){Q(Z,D,w);return}t.bindTexture(s.TEXTURE_2D_ARRAY,Z.__webglTexture,s.TEXTURE0+w)}function oe(D,w){const Z=r.get(D);if(D.version>0&&Z.__version!==D.version){Q(Z,D,w);return}t.bindTexture(s.TEXTURE_3D,Z.__webglTexture,s.TEXTURE0+w)}function k(D,w){const Z=r.get(D);if(D.version>0&&Z.__version!==D.version){fe(Z,D,w);return}t.bindTexture(s.TEXTURE_CUBE_MAP,Z.__webglTexture,s.TEXTURE0+w)}const le={[Of]:s.REPEAT,[ns]:s.CLAMP_TO_EDGE,[zf]:s.MIRRORED_REPEAT},re={[mi]:s.NEAREST,[D0]:s.NEAREST_MIPMAP_NEAREST,[dl]:s.NEAREST_MIPMAP_LINEAR,[Ai]:s.LINEAR,[Hc]:s.LINEAR_MIPMAP_NEAREST,[is]:s.LINEAR_MIPMAP_LINEAR},N={[F0]:s.NEVER,[V0]:s.ALWAYS,[O0]:s.LESS,[zg]:s.LEQUAL,[z0]:s.EQUAL,[H0]:s.GEQUAL,[k0]:s.GREATER,[B0]:s.NOTEQUAL};function ie(D,w){if(w.type===ji&&e.has("OES_texture_float_linear")===!1&&(w.magFilter===Ai||w.magFilter===Hc||w.magFilter===dl||w.magFilter===is||w.minFilter===Ai||w.minFilter===Hc||w.minFilter===dl||w.minFilter===is)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),s.texParameteri(D,s.TEXTURE_WRAP_S,le[w.wrapS]),s.texParameteri(D,s.TEXTURE_WRAP_T,le[w.wrapT]),(D===s.TEXTURE_3D||D===s.TEXTURE_2D_ARRAY)&&s.texParameteri(D,s.TEXTURE_WRAP_R,le[w.wrapR]),s.texParameteri(D,s.TEXTURE_MAG_FILTER,re[w.magFilter]),s.texParameteri(D,s.TEXTURE_MIN_FILTER,re[w.minFilter]),w.compareFunction&&(s.texParameteri(D,s.TEXTURE_COMPARE_MODE,s.COMPARE_REF_TO_TEXTURE),s.texParameteri(D,s.TEXTURE_COMPARE_FUNC,N[w.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(w.magFilter===mi||w.minFilter!==dl&&w.minFilter!==is||w.type===ji&&e.has("OES_texture_float_linear")===!1)return;if(w.anisotropy>1||r.get(w).__currentAnisotropy){const Z=e.get("EXT_texture_filter_anisotropic");s.texParameterf(D,Z.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(w.anisotropy,a.getMaxAnisotropy())),r.get(w).__currentAnisotropy=w.anisotropy}}}function De(D,w){let Z=!1;D.__webglInit===void 0&&(D.__webglInit=!0,w.addEventListener("dispose",F));const pe=w.source;let _e=y.get(pe);_e===void 0&&(_e={},y.set(pe,_e));const de=ue(w);if(de!==D.__cacheKey){_e[de]===void 0&&(_e[de]={texture:s.createTexture(),usedTimes:0},c.memory.textures++,Z=!0),_e[de].usedTimes++;const Ve=_e[D.__cacheKey];Ve!==void 0&&(_e[D.__cacheKey].usedTimes--,Ve.usedTimes===0&&b(w)),D.__cacheKey=de,D.__webglTexture=_e[de].texture}return Z}function Q(D,w,Z){let pe=s.TEXTURE_2D;(w.isDataArrayTexture||w.isCompressedArrayTexture)&&(pe=s.TEXTURE_2D_ARRAY),w.isData3DTexture&&(pe=s.TEXTURE_3D);const _e=De(D,w),de=w.source;t.bindTexture(pe,D.__webglTexture,s.TEXTURE0+Z);const Ve=r.get(de);if(de.version!==Ve.__version||_e===!0){t.activeTexture(s.TEXTURE0+Z);const Ce=yt.getPrimaries(yt.workingColorSpace),Ne=w.colorSpace===Tr?null:yt.getPrimaries(w.colorSpace),ut=w.colorSpace===Tr||Ce===Ne?s.NONE:s.BROWSER_DEFAULT_WEBGL;s.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,w.flipY),s.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,w.premultiplyAlpha),s.pixelStorei(s.UNPACK_ALIGNMENT,w.unpackAlignment),s.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL,ut);let Se=T(w.image,!1,a.maxTextureSize);Se=wt(w,Se);const Oe=l.convert(w.format,w.colorSpace),Je=l.convert(w.type);let et=L(w.internalFormat,Oe,Je,w.colorSpace,w.isVideoTexture);ie(pe,w);let ze;const ft=w.mipmaps,rt=w.isVideoTexture!==!0,Tt=Ve.__version===void 0||_e===!0,V=de.dataReady,Re=W(w,Se);if(w.isDepthTexture)et=C(w.format===oo,w.type),Tt&&(rt?t.texStorage2D(s.TEXTURE_2D,1,et,Se.width,Se.height):t.texImage2D(s.TEXTURE_2D,0,et,Se.width,Se.height,0,Oe,Je,null));else if(w.isDataTexture)if(ft.length>0){rt&&Tt&&t.texStorage2D(s.TEXTURE_2D,Re,et,ft[0].width,ft[0].height);for(let ae=0,he=ft.length;ae<he;ae++)ze=ft[ae],rt?V&&t.texSubImage2D(s.TEXTURE_2D,ae,0,0,ze.width,ze.height,Oe,Je,ze.data):t.texImage2D(s.TEXTURE_2D,ae,et,ze.width,ze.height,0,Oe,Je,ze.data);w.generateMipmaps=!1}else rt?(Tt&&t.texStorage2D(s.TEXTURE_2D,Re,et,Se.width,Se.height),V&&t.texSubImage2D(s.TEXTURE_2D,0,0,0,Se.width,Se.height,Oe,Je,Se.data)):t.texImage2D(s.TEXTURE_2D,0,et,Se.width,Se.height,0,Oe,Je,Se.data);else if(w.isCompressedTexture)if(w.isCompressedArrayTexture){rt&&Tt&&t.texStorage3D(s.TEXTURE_2D_ARRAY,Re,et,ft[0].width,ft[0].height,Se.depth);for(let ae=0,he=ft.length;ae<he;ae++)if(ze=ft[ae],w.format!==pi)if(Oe!==null)if(rt){if(V)if(w.layerUpdates.size>0){const Le=ig(ze.width,ze.height,w.format,w.type);for(const Pe of w.layerUpdates){const st=ze.data.subarray(Pe*Le/ze.data.BYTES_PER_ELEMENT,(Pe+1)*Le/ze.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(s.TEXTURE_2D_ARRAY,ae,0,0,Pe,ze.width,ze.height,1,Oe,st)}w.clearLayerUpdates()}else t.compressedTexSubImage3D(s.TEXTURE_2D_ARRAY,ae,0,0,0,ze.width,ze.height,Se.depth,Oe,ze.data)}else t.compressedTexImage3D(s.TEXTURE_2D_ARRAY,ae,et,ze.width,ze.height,Se.depth,0,ze.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else rt?V&&t.texSubImage3D(s.TEXTURE_2D_ARRAY,ae,0,0,0,ze.width,ze.height,Se.depth,Oe,Je,ze.data):t.texImage3D(s.TEXTURE_2D_ARRAY,ae,et,ze.width,ze.height,Se.depth,0,Oe,Je,ze.data)}else{rt&&Tt&&t.texStorage2D(s.TEXTURE_2D,Re,et,ft[0].width,ft[0].height);for(let ae=0,he=ft.length;ae<he;ae++)ze=ft[ae],w.format!==pi?Oe!==null?rt?V&&t.compressedTexSubImage2D(s.TEXTURE_2D,ae,0,0,ze.width,ze.height,Oe,ze.data):t.compressedTexImage2D(s.TEXTURE_2D,ae,et,ze.width,ze.height,0,ze.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):rt?V&&t.texSubImage2D(s.TEXTURE_2D,ae,0,0,ze.width,ze.height,Oe,Je,ze.data):t.texImage2D(s.TEXTURE_2D,ae,et,ze.width,ze.height,0,Oe,Je,ze.data)}else if(w.isDataArrayTexture)if(rt){if(Tt&&t.texStorage3D(s.TEXTURE_2D_ARRAY,Re,et,Se.width,Se.height,Se.depth),V)if(w.layerUpdates.size>0){const ae=ig(Se.width,Se.height,w.format,w.type);for(const he of w.layerUpdates){const Le=Se.data.subarray(he*ae/Se.data.BYTES_PER_ELEMENT,(he+1)*ae/Se.data.BYTES_PER_ELEMENT);t.texSubImage3D(s.TEXTURE_2D_ARRAY,0,0,0,he,Se.width,Se.height,1,Oe,Je,Le)}w.clearLayerUpdates()}else t.texSubImage3D(s.TEXTURE_2D_ARRAY,0,0,0,0,Se.width,Se.height,Se.depth,Oe,Je,Se.data)}else t.texImage3D(s.TEXTURE_2D_ARRAY,0,et,Se.width,Se.height,Se.depth,0,Oe,Je,Se.data);else if(w.isData3DTexture)rt?(Tt&&t.texStorage3D(s.TEXTURE_3D,Re,et,Se.width,Se.height,Se.depth),V&&t.texSubImage3D(s.TEXTURE_3D,0,0,0,0,Se.width,Se.height,Se.depth,Oe,Je,Se.data)):t.texImage3D(s.TEXTURE_3D,0,et,Se.width,Se.height,Se.depth,0,Oe,Je,Se.data);else if(w.isFramebufferTexture){if(Tt)if(rt)t.texStorage2D(s.TEXTURE_2D,Re,et,Se.width,Se.height);else{let ae=Se.width,he=Se.height;for(let Le=0;Le<Re;Le++)t.texImage2D(s.TEXTURE_2D,Le,et,ae,he,0,Oe,Je,null),ae>>=1,he>>=1}}else if(ft.length>0){if(rt&&Tt){const ae=Ye(ft[0]);t.texStorage2D(s.TEXTURE_2D,Re,et,ae.width,ae.height)}for(let ae=0,he=ft.length;ae<he;ae++)ze=ft[ae],rt?V&&t.texSubImage2D(s.TEXTURE_2D,ae,0,0,Oe,Je,ze):t.texImage2D(s.TEXTURE_2D,ae,et,Oe,Je,ze);w.generateMipmaps=!1}else if(rt){if(Tt){const ae=Ye(Se);t.texStorage2D(s.TEXTURE_2D,Re,et,ae.width,ae.height)}V&&t.texSubImage2D(s.TEXTURE_2D,0,0,0,Oe,Je,Se)}else t.texImage2D(s.TEXTURE_2D,0,et,Oe,Je,Se);v(w)&&g(pe),Ve.__version=de.version,w.onUpdate&&w.onUpdate(w)}D.__version=w.version}function fe(D,w,Z){if(w.image.length!==6)return;const pe=De(D,w),_e=w.source;t.bindTexture(s.TEXTURE_CUBE_MAP,D.__webglTexture,s.TEXTURE0+Z);const de=r.get(_e);if(_e.version!==de.__version||pe===!0){t.activeTexture(s.TEXTURE0+Z);const Ve=yt.getPrimaries(yt.workingColorSpace),Ce=w.colorSpace===Tr?null:yt.getPrimaries(w.colorSpace),Ne=w.colorSpace===Tr||Ve===Ce?s.NONE:s.BROWSER_DEFAULT_WEBGL;s.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,w.flipY),s.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,w.premultiplyAlpha),s.pixelStorei(s.UNPACK_ALIGNMENT,w.unpackAlignment),s.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL,Ne);const ut=w.isCompressedTexture||w.image[0].isCompressedTexture,Se=w.image[0]&&w.image[0].isDataTexture,Oe=[];for(let he=0;he<6;he++)!ut&&!Se?Oe[he]=T(w.image[he],!0,a.maxCubemapSize):Oe[he]=Se?w.image[he].image:w.image[he],Oe[he]=wt(w,Oe[he]);const Je=Oe[0],et=l.convert(w.format,w.colorSpace),ze=l.convert(w.type),ft=L(w.internalFormat,et,ze,w.colorSpace),rt=w.isVideoTexture!==!0,Tt=de.__version===void 0||pe===!0,V=_e.dataReady;let Re=W(w,Je);ie(s.TEXTURE_CUBE_MAP,w);let ae;if(ut){rt&&Tt&&t.texStorage2D(s.TEXTURE_CUBE_MAP,Re,ft,Je.width,Je.height);for(let he=0;he<6;he++){ae=Oe[he].mipmaps;for(let Le=0;Le<ae.length;Le++){const Pe=ae[Le];w.format!==pi?et!==null?rt?V&&t.compressedTexSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+he,Le,0,0,Pe.width,Pe.height,et,Pe.data):t.compressedTexImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+he,Le,ft,Pe.width,Pe.height,0,Pe.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):rt?V&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+he,Le,0,0,Pe.width,Pe.height,et,ze,Pe.data):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+he,Le,ft,Pe.width,Pe.height,0,et,ze,Pe.data)}}}else{if(ae=w.mipmaps,rt&&Tt){ae.length>0&&Re++;const he=Ye(Oe[0]);t.texStorage2D(s.TEXTURE_CUBE_MAP,Re,ft,he.width,he.height)}for(let he=0;he<6;he++)if(Se){rt?V&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+he,0,0,0,Oe[he].width,Oe[he].height,et,ze,Oe[he].data):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+he,0,ft,Oe[he].width,Oe[he].height,0,et,ze,Oe[he].data);for(let Le=0;Le<ae.length;Le++){const st=ae[Le].image[he].image;rt?V&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+he,Le+1,0,0,st.width,st.height,et,ze,st.data):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+he,Le+1,ft,st.width,st.height,0,et,ze,st.data)}}else{rt?V&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+he,0,0,0,et,ze,Oe[he]):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+he,0,ft,et,ze,Oe[he]);for(let Le=0;Le<ae.length;Le++){const Pe=ae[Le];rt?V&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+he,Le+1,0,0,et,ze,Pe.image[he]):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+he,Le+1,ft,et,ze,Pe.image[he])}}}v(w)&&g(s.TEXTURE_CUBE_MAP),de.__version=_e.version,w.onUpdate&&w.onUpdate(w)}D.__version=w.version}function Ee(D,w,Z,pe,_e,de){const Ve=l.convert(Z.format,Z.colorSpace),Ce=l.convert(Z.type),Ne=L(Z.internalFormat,Ve,Ce,Z.colorSpace),ut=r.get(w),Se=r.get(Z);if(Se.__renderTarget=w,!ut.__hasExternalTextures){const Oe=Math.max(1,w.width>>de),Je=Math.max(1,w.height>>de);_e===s.TEXTURE_3D||_e===s.TEXTURE_2D_ARRAY?t.texImage3D(_e,de,Ne,Oe,Je,w.depth,0,Ve,Ce,null):t.texImage2D(_e,de,Ne,Oe,Je,0,Ve,Ce,null)}t.bindFramebuffer(s.FRAMEBUFFER,D),ct(w)?f.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,pe,_e,Se.__webglTexture,0,ht(w)):(_e===s.TEXTURE_2D||_e>=s.TEXTURE_CUBE_MAP_POSITIVE_X&&_e<=s.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&s.framebufferTexture2D(s.FRAMEBUFFER,pe,_e,Se.__webglTexture,de),t.bindFramebuffer(s.FRAMEBUFFER,null)}function xe(D,w,Z){if(s.bindRenderbuffer(s.RENDERBUFFER,D),w.depthBuffer){const pe=w.depthTexture,_e=pe&&pe.isDepthTexture?pe.type:null,de=C(w.stencilBuffer,_e),Ve=w.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,Ce=ht(w);ct(w)?f.renderbufferStorageMultisampleEXT(s.RENDERBUFFER,Ce,de,w.width,w.height):Z?s.renderbufferStorageMultisample(s.RENDERBUFFER,Ce,de,w.width,w.height):s.renderbufferStorage(s.RENDERBUFFER,de,w.width,w.height),s.framebufferRenderbuffer(s.FRAMEBUFFER,Ve,s.RENDERBUFFER,D)}else{const pe=w.textures;for(let _e=0;_e<pe.length;_e++){const de=pe[_e],Ve=l.convert(de.format,de.colorSpace),Ce=l.convert(de.type),Ne=L(de.internalFormat,Ve,Ce,de.colorSpace),ut=ht(w);Z&&ct(w)===!1?s.renderbufferStorageMultisample(s.RENDERBUFFER,ut,Ne,w.width,w.height):ct(w)?f.renderbufferStorageMultisampleEXT(s.RENDERBUFFER,ut,Ne,w.width,w.height):s.renderbufferStorage(s.RENDERBUFFER,Ne,w.width,w.height)}}s.bindRenderbuffer(s.RENDERBUFFER,null)}function Ae(D,w){if(w&&w.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(t.bindFramebuffer(s.FRAMEBUFFER,D),!(w.depthTexture&&w.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");const pe=r.get(w.depthTexture);pe.__renderTarget=w,(!pe.__webglTexture||w.depthTexture.image.width!==w.width||w.depthTexture.image.height!==w.height)&&(w.depthTexture.image.width=w.width,w.depthTexture.image.height=w.height,w.depthTexture.needsUpdate=!0),ce(w.depthTexture,0);const _e=pe.__webglTexture,de=ht(w);if(w.depthTexture.format===eo)ct(w)?f.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,s.DEPTH_ATTACHMENT,s.TEXTURE_2D,_e,0,de):s.framebufferTexture2D(s.FRAMEBUFFER,s.DEPTH_ATTACHMENT,s.TEXTURE_2D,_e,0);else if(w.depthTexture.format===oo)ct(w)?f.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,s.DEPTH_STENCIL_ATTACHMENT,s.TEXTURE_2D,_e,0,de):s.framebufferTexture2D(s.FRAMEBUFFER,s.DEPTH_STENCIL_ATTACHMENT,s.TEXTURE_2D,_e,0);else throw new Error("Unknown depthTexture format")}function Ie(D){const w=r.get(D),Z=D.isWebGLCubeRenderTarget===!0;if(w.__boundDepthTexture!==D.depthTexture){const pe=D.depthTexture;if(w.__depthDisposeCallback&&w.__depthDisposeCallback(),pe){const _e=()=>{delete w.__boundDepthTexture,delete w.__depthDisposeCallback,pe.removeEventListener("dispose",_e)};pe.addEventListener("dispose",_e),w.__depthDisposeCallback=_e}w.__boundDepthTexture=pe}if(D.depthTexture&&!w.__autoAllocateDepthBuffer){if(Z)throw new Error("target.depthTexture not supported in Cube render targets");Ae(w.__webglFramebuffer,D)}else if(Z){w.__webglDepthbuffer=[];for(let pe=0;pe<6;pe++)if(t.bindFramebuffer(s.FRAMEBUFFER,w.__webglFramebuffer[pe]),w.__webglDepthbuffer[pe]===void 0)w.__webglDepthbuffer[pe]=s.createRenderbuffer(),xe(w.__webglDepthbuffer[pe],D,!1);else{const _e=D.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,de=w.__webglDepthbuffer[pe];s.bindRenderbuffer(s.RENDERBUFFER,de),s.framebufferRenderbuffer(s.FRAMEBUFFER,_e,s.RENDERBUFFER,de)}}else if(t.bindFramebuffer(s.FRAMEBUFFER,w.__webglFramebuffer),w.__webglDepthbuffer===void 0)w.__webglDepthbuffer=s.createRenderbuffer(),xe(w.__webglDepthbuffer,D,!1);else{const pe=D.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,_e=w.__webglDepthbuffer;s.bindRenderbuffer(s.RENDERBUFFER,_e),s.framebufferRenderbuffer(s.FRAMEBUFFER,pe,s.RENDERBUFFER,_e)}t.bindFramebuffer(s.FRAMEBUFFER,null)}function Qe(D,w,Z){const pe=r.get(D);w!==void 0&&Ee(pe.__webglFramebuffer,D,D.texture,s.COLOR_ATTACHMENT0,s.TEXTURE_2D,0),Z!==void 0&&Ie(D)}function Ct(D){const w=D.texture,Z=r.get(D),pe=r.get(w);D.addEventListener("dispose",I);const _e=D.textures,de=D.isWebGLCubeRenderTarget===!0,Ve=_e.length>1;if(Ve||(pe.__webglTexture===void 0&&(pe.__webglTexture=s.createTexture()),pe.__version=w.version,c.memory.textures++),de){Z.__webglFramebuffer=[];for(let Ce=0;Ce<6;Ce++)if(w.mipmaps&&w.mipmaps.length>0){Z.__webglFramebuffer[Ce]=[];for(let Ne=0;Ne<w.mipmaps.length;Ne++)Z.__webglFramebuffer[Ce][Ne]=s.createFramebuffer()}else Z.__webglFramebuffer[Ce]=s.createFramebuffer()}else{if(w.mipmaps&&w.mipmaps.length>0){Z.__webglFramebuffer=[];for(let Ce=0;Ce<w.mipmaps.length;Ce++)Z.__webglFramebuffer[Ce]=s.createFramebuffer()}else Z.__webglFramebuffer=s.createFramebuffer();if(Ve)for(let Ce=0,Ne=_e.length;Ce<Ne;Ce++){const ut=r.get(_e[Ce]);ut.__webglTexture===void 0&&(ut.__webglTexture=s.createTexture(),c.memory.textures++)}if(D.samples>0&&ct(D)===!1){Z.__webglMultisampledFramebuffer=s.createFramebuffer(),Z.__webglColorRenderbuffer=[],t.bindFramebuffer(s.FRAMEBUFFER,Z.__webglMultisampledFramebuffer);for(let Ce=0;Ce<_e.length;Ce++){const Ne=_e[Ce];Z.__webglColorRenderbuffer[Ce]=s.createRenderbuffer(),s.bindRenderbuffer(s.RENDERBUFFER,Z.__webglColorRenderbuffer[Ce]);const ut=l.convert(Ne.format,Ne.colorSpace),Se=l.convert(Ne.type),Oe=L(Ne.internalFormat,ut,Se,Ne.colorSpace,D.isXRRenderTarget===!0),Je=ht(D);s.renderbufferStorageMultisample(s.RENDERBUFFER,Je,Oe,D.width,D.height),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+Ce,s.RENDERBUFFER,Z.__webglColorRenderbuffer[Ce])}s.bindRenderbuffer(s.RENDERBUFFER,null),D.depthBuffer&&(Z.__webglDepthRenderbuffer=s.createRenderbuffer(),xe(Z.__webglDepthRenderbuffer,D,!0)),t.bindFramebuffer(s.FRAMEBUFFER,null)}}if(de){t.bindTexture(s.TEXTURE_CUBE_MAP,pe.__webglTexture),ie(s.TEXTURE_CUBE_MAP,w);for(let Ce=0;Ce<6;Ce++)if(w.mipmaps&&w.mipmaps.length>0)for(let Ne=0;Ne<w.mipmaps.length;Ne++)Ee(Z.__webglFramebuffer[Ce][Ne],D,w,s.COLOR_ATTACHMENT0,s.TEXTURE_CUBE_MAP_POSITIVE_X+Ce,Ne);else Ee(Z.__webglFramebuffer[Ce],D,w,s.COLOR_ATTACHMENT0,s.TEXTURE_CUBE_MAP_POSITIVE_X+Ce,0);v(w)&&g(s.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(Ve){for(let Ce=0,Ne=_e.length;Ce<Ne;Ce++){const ut=_e[Ce],Se=r.get(ut);t.bindTexture(s.TEXTURE_2D,Se.__webglTexture),ie(s.TEXTURE_2D,ut),Ee(Z.__webglFramebuffer,D,ut,s.COLOR_ATTACHMENT0+Ce,s.TEXTURE_2D,0),v(ut)&&g(s.TEXTURE_2D)}t.unbindTexture()}else{let Ce=s.TEXTURE_2D;if((D.isWebGL3DRenderTarget||D.isWebGLArrayRenderTarget)&&(Ce=D.isWebGL3DRenderTarget?s.TEXTURE_3D:s.TEXTURE_2D_ARRAY),t.bindTexture(Ce,pe.__webglTexture),ie(Ce,w),w.mipmaps&&w.mipmaps.length>0)for(let Ne=0;Ne<w.mipmaps.length;Ne++)Ee(Z.__webglFramebuffer[Ne],D,w,s.COLOR_ATTACHMENT0,Ce,Ne);else Ee(Z.__webglFramebuffer,D,w,s.COLOR_ATTACHMENT0,Ce,0);v(w)&&g(Ce),t.unbindTexture()}D.depthBuffer&&Ie(D)}function mt(D){const w=D.textures;for(let Z=0,pe=w.length;Z<pe;Z++){const _e=w[Z];if(v(_e)){const de=P(D),Ve=r.get(_e).__webglTexture;t.bindTexture(de,Ve),g(de),t.unbindTexture()}}}const Ut=[],Y=[];function vn(D){if(D.samples>0){if(ct(D)===!1){const w=D.textures,Z=D.width,pe=D.height;let _e=s.COLOR_BUFFER_BIT;const de=D.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,Ve=r.get(D),Ce=w.length>1;if(Ce)for(let Ne=0;Ne<w.length;Ne++)t.bindFramebuffer(s.FRAMEBUFFER,Ve.__webglMultisampledFramebuffer),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+Ne,s.RENDERBUFFER,null),t.bindFramebuffer(s.FRAMEBUFFER,Ve.__webglFramebuffer),s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0+Ne,s.TEXTURE_2D,null,0);t.bindFramebuffer(s.READ_FRAMEBUFFER,Ve.__webglMultisampledFramebuffer),t.bindFramebuffer(s.DRAW_FRAMEBUFFER,Ve.__webglFramebuffer);for(let Ne=0;Ne<w.length;Ne++){if(D.resolveDepthBuffer&&(D.depthBuffer&&(_e|=s.DEPTH_BUFFER_BIT),D.stencilBuffer&&D.resolveStencilBuffer&&(_e|=s.STENCIL_BUFFER_BIT)),Ce){s.framebufferRenderbuffer(s.READ_FRAMEBUFFER,s.COLOR_ATTACHMENT0,s.RENDERBUFFER,Ve.__webglColorRenderbuffer[Ne]);const ut=r.get(w[Ne]).__webglTexture;s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0,s.TEXTURE_2D,ut,0)}s.blitFramebuffer(0,0,Z,pe,0,0,Z,pe,_e,s.NEAREST),h===!0&&(Ut.length=0,Y.length=0,Ut.push(s.COLOR_ATTACHMENT0+Ne),D.depthBuffer&&D.resolveDepthBuffer===!1&&(Ut.push(de),Y.push(de),s.invalidateFramebuffer(s.DRAW_FRAMEBUFFER,Y)),s.invalidateFramebuffer(s.READ_FRAMEBUFFER,Ut))}if(t.bindFramebuffer(s.READ_FRAMEBUFFER,null),t.bindFramebuffer(s.DRAW_FRAMEBUFFER,null),Ce)for(let Ne=0;Ne<w.length;Ne++){t.bindFramebuffer(s.FRAMEBUFFER,Ve.__webglMultisampledFramebuffer),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+Ne,s.RENDERBUFFER,Ve.__webglColorRenderbuffer[Ne]);const ut=r.get(w[Ne]).__webglTexture;t.bindFramebuffer(s.FRAMEBUFFER,Ve.__webglFramebuffer),s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0+Ne,s.TEXTURE_2D,ut,0)}t.bindFramebuffer(s.DRAW_FRAMEBUFFER,Ve.__webglMultisampledFramebuffer)}else if(D.depthBuffer&&D.resolveDepthBuffer===!1&&h){const w=D.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT;s.invalidateFramebuffer(s.DRAW_FRAMEBUFFER,[w])}}}function ht(D){return Math.min(a.maxSamples,D.samples)}function ct(D){const w=r.get(D);return D.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&w.__useRenderToTexture!==!1}function $e(D){const w=c.render.frame;_.get(D)!==w&&(_.set(D,w),D.update())}function wt(D,w){const Z=D.colorSpace,pe=D.format,_e=D.type;return D.isCompressedTexture===!0||D.isVideoTexture===!0||Z!==uo&&Z!==Tr&&(yt.getTransfer(Z)===Rt?(pe!==pi||_e!==$i)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",Z)),w}function Ye(D){return typeof HTMLImageElement<"u"&&D instanceof HTMLImageElement?(m.width=D.naturalWidth||D.width,m.height=D.naturalHeight||D.height):typeof VideoFrame<"u"&&D instanceof VideoFrame?(m.width=D.displayWidth,m.height=D.displayHeight):(m.width=D.width,m.height=D.height),m}this.allocateTextureUnit=J,this.resetTextureUnits=se,this.setTexture2D=ce,this.setTexture2DArray=$,this.setTexture3D=oe,this.setTextureCube=k,this.rebindTextures=Qe,this.setupRenderTarget=Ct,this.updateRenderTargetMipmap=mt,this.updateMultisampleRenderTarget=vn,this.setupDepthRenderbuffer=Ie,this.setupFrameBufferTexture=Ee,this.useMultisampledRTT=ct}function YE(s,e){function t(r,a=Tr){let l;const c=yt.getTransfer(a);if(r===$i)return s.UNSIGNED_BYTE;if(r===xd)return s.UNSIGNED_SHORT_4_4_4_4;if(r===yd)return s.UNSIGNED_SHORT_5_5_5_1;if(r===bg)return s.UNSIGNED_INT_5_9_9_9_REV;if(r===Cg)return s.BYTE;if(r===Rg)return s.SHORT;if(r===Jo)return s.UNSIGNED_SHORT;if(r===vd)return s.INT;if(r===rs)return s.UNSIGNED_INT;if(r===ji)return s.FLOAT;if(r===na)return s.HALF_FLOAT;if(r===Pg)return s.ALPHA;if(r===Lg)return s.RGB;if(r===pi)return s.RGBA;if(r===Dg)return s.LUMINANCE;if(r===Ug)return s.LUMINANCE_ALPHA;if(r===eo)return s.DEPTH_COMPONENT;if(r===oo)return s.DEPTH_STENCIL;if(r===Ig)return s.RED;if(r===Sd)return s.RED_INTEGER;if(r===Ng)return s.RG;if(r===Md)return s.RG_INTEGER;if(r===Ed)return s.RGBA_INTEGER;if(r===Hl||r===Vl||r===Gl||r===Wl)if(c===Rt)if(l=e.get("WEBGL_compressed_texture_s3tc_srgb"),l!==null){if(r===Hl)return l.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(r===Vl)return l.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(r===Gl)return l.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(r===Wl)return l.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(l=e.get("WEBGL_compressed_texture_s3tc"),l!==null){if(r===Hl)return l.COMPRESSED_RGB_S3TC_DXT1_EXT;if(r===Vl)return l.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(r===Gl)return l.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(r===Wl)return l.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(r===kf||r===Bf||r===Hf||r===Vf)if(l=e.get("WEBGL_compressed_texture_pvrtc"),l!==null){if(r===kf)return l.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(r===Bf)return l.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(r===Hf)return l.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(r===Vf)return l.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(r===Gf||r===Wf||r===Xf)if(l=e.get("WEBGL_compressed_texture_etc"),l!==null){if(r===Gf||r===Wf)return c===Rt?l.COMPRESSED_SRGB8_ETC2:l.COMPRESSED_RGB8_ETC2;if(r===Xf)return c===Rt?l.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:l.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(r===jf||r===Yf||r===qf||r===$f||r===Kf||r===Zf||r===Qf||r===Jf||r===ed||r===td||r===nd||r===id||r===rd||r===sd)if(l=e.get("WEBGL_compressed_texture_astc"),l!==null){if(r===jf)return c===Rt?l.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:l.COMPRESSED_RGBA_ASTC_4x4_KHR;if(r===Yf)return c===Rt?l.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:l.COMPRESSED_RGBA_ASTC_5x4_KHR;if(r===qf)return c===Rt?l.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:l.COMPRESSED_RGBA_ASTC_5x5_KHR;if(r===$f)return c===Rt?l.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:l.COMPRESSED_RGBA_ASTC_6x5_KHR;if(r===Kf)return c===Rt?l.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:l.COMPRESSED_RGBA_ASTC_6x6_KHR;if(r===Zf)return c===Rt?l.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:l.COMPRESSED_RGBA_ASTC_8x5_KHR;if(r===Qf)return c===Rt?l.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:l.COMPRESSED_RGBA_ASTC_8x6_KHR;if(r===Jf)return c===Rt?l.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:l.COMPRESSED_RGBA_ASTC_8x8_KHR;if(r===ed)return c===Rt?l.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:l.COMPRESSED_RGBA_ASTC_10x5_KHR;if(r===td)return c===Rt?l.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:l.COMPRESSED_RGBA_ASTC_10x6_KHR;if(r===nd)return c===Rt?l.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:l.COMPRESSED_RGBA_ASTC_10x8_KHR;if(r===id)return c===Rt?l.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:l.COMPRESSED_RGBA_ASTC_10x10_KHR;if(r===rd)return c===Rt?l.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:l.COMPRESSED_RGBA_ASTC_12x10_KHR;if(r===sd)return c===Rt?l.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:l.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(r===Xl||r===od||r===ad)if(l=e.get("EXT_texture_compression_bptc"),l!==null){if(r===Xl)return c===Rt?l.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:l.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(r===od)return l.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(r===ad)return l.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(r===Fg||r===ld||r===ud||r===cd)if(l=e.get("EXT_texture_compression_rgtc"),l!==null){if(r===Xl)return l.COMPRESSED_RED_RGTC1_EXT;if(r===ld)return l.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(r===ud)return l.COMPRESSED_RED_GREEN_RGTC2_EXT;if(r===cd)return l.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return r===so?s.UNSIGNED_INT_24_8:s[r]!==void 0?s[r]:null}return{convert:t}}class qE extends ti{constructor(e=[]){super(),this.isArrayCamera=!0,this.cameras=e}}class Qs extends Yt{constructor(){super(),this.isGroup=!0,this.type="Group"}}const $E={type:"move"};class gf{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Qs,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Qs,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new G,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new G),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Qs,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new G,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new G),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const t=this._hand;if(t)for(const r of e.hand.values())this._getHandJoint(t,r)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,r){let a=null,l=null,c=null;const f=this._targetRay,h=this._grip,m=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(m&&e.hand){c=!0;for(const T of e.hand.values()){const v=t.getJointPose(T,r),g=this._getHandJoint(m,T);v!==null&&(g.matrix.fromArray(v.transform.matrix),g.matrix.decompose(g.position,g.rotation,g.scale),g.matrixWorldNeedsUpdate=!0,g.jointRadius=v.radius),g.visible=v!==null}const _=m.joints["index-finger-tip"],x=m.joints["thumb-tip"],y=_.position.distanceTo(x.position),S=.02,M=.005;m.inputState.pinching&&y>S+M?(m.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!m.inputState.pinching&&y<=S-M&&(m.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else h!==null&&e.gripSpace&&(l=t.getPose(e.gripSpace,r),l!==null&&(h.matrix.fromArray(l.transform.matrix),h.matrix.decompose(h.position,h.rotation,h.scale),h.matrixWorldNeedsUpdate=!0,l.linearVelocity?(h.hasLinearVelocity=!0,h.linearVelocity.copy(l.linearVelocity)):h.hasLinearVelocity=!1,l.angularVelocity?(h.hasAngularVelocity=!0,h.angularVelocity.copy(l.angularVelocity)):h.hasAngularVelocity=!1));f!==null&&(a=t.getPose(e.targetRaySpace,r),a===null&&l!==null&&(a=l),a!==null&&(f.matrix.fromArray(a.transform.matrix),f.matrix.decompose(f.position,f.rotation,f.scale),f.matrixWorldNeedsUpdate=!0,a.linearVelocity?(f.hasLinearVelocity=!0,f.linearVelocity.copy(a.linearVelocity)):f.hasLinearVelocity=!1,a.angularVelocity?(f.hasAngularVelocity=!0,f.angularVelocity.copy(a.angularVelocity)):f.hasAngularVelocity=!1,this.dispatchEvent($E)))}return f!==null&&(f.visible=a!==null),h!==null&&(h.visible=l!==null),m!==null&&(m.visible=c!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){const r=new Qs;r.matrixAutoUpdate=!1,r.visible=!1,e.joints[t.jointName]=r,e.add(r)}return e.joints[t.jointName]}}const KE=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,ZE=`
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

}`;class QE{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t,r){if(this.texture===null){const a=new _n,l=e.properties.get(a);l.__webglTexture=t.texture,(t.depthNear!=r.depthNear||t.depthFar!=r.depthFar)&&(this.depthNear=t.depthNear,this.depthFar=t.depthFar),this.texture=a}}getMesh(e){if(this.texture!==null&&this.mesh===null){const t=e.cameras[0].viewport,r=new Lr({vertexShader:KE,fragmentShader:ZE,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new kn(new iu(20,20),r)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class JE extends os{constructor(e,t){super();const r=this;let a=null,l=1,c=null,f="local-floor",h=1,m=null,_=null,x=null,y=null,S=null,M=null;const T=new QE,v=t.getContextAttributes();let g=null,P=null;const L=[],C=[],W=new qe;let F=null;const I=new ti;I.viewport=new Vt;const B=new ti;B.viewport=new Vt;const b=[I,B],A=new qE;let O=null,se=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(Q){let fe=L[Q];return fe===void 0&&(fe=new gf,L[Q]=fe),fe.getTargetRaySpace()},this.getControllerGrip=function(Q){let fe=L[Q];return fe===void 0&&(fe=new gf,L[Q]=fe),fe.getGripSpace()},this.getHand=function(Q){let fe=L[Q];return fe===void 0&&(fe=new gf,L[Q]=fe),fe.getHandSpace()};function J(Q){const fe=C.indexOf(Q.inputSource);if(fe===-1)return;const Ee=L[fe];Ee!==void 0&&(Ee.update(Q.inputSource,Q.frame,m||c),Ee.dispatchEvent({type:Q.type,data:Q.inputSource}))}function ue(){a.removeEventListener("select",J),a.removeEventListener("selectstart",J),a.removeEventListener("selectend",J),a.removeEventListener("squeeze",J),a.removeEventListener("squeezestart",J),a.removeEventListener("squeezeend",J),a.removeEventListener("end",ue),a.removeEventListener("inputsourceschange",ce);for(let Q=0;Q<L.length;Q++){const fe=C[Q];fe!==null&&(C[Q]=null,L[Q].disconnect(fe))}O=null,se=null,T.reset(),e.setRenderTarget(g),S=null,y=null,x=null,a=null,P=null,De.stop(),r.isPresenting=!1,e.setPixelRatio(F),e.setSize(W.width,W.height,!1),r.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(Q){l=Q,r.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(Q){f=Q,r.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return m||c},this.setReferenceSpace=function(Q){m=Q},this.getBaseLayer=function(){return y!==null?y:S},this.getBinding=function(){return x},this.getFrame=function(){return M},this.getSession=function(){return a},this.setSession=async function(Q){if(a=Q,a!==null){if(g=e.getRenderTarget(),a.addEventListener("select",J),a.addEventListener("selectstart",J),a.addEventListener("selectend",J),a.addEventListener("squeeze",J),a.addEventListener("squeezestart",J),a.addEventListener("squeezeend",J),a.addEventListener("end",ue),a.addEventListener("inputsourceschange",ce),v.xrCompatible!==!0&&await t.makeXRCompatible(),F=e.getPixelRatio(),e.getSize(W),a.renderState.layers===void 0){const fe={antialias:v.antialias,alpha:!0,depth:v.depth,stencil:v.stencil,framebufferScaleFactor:l};S=new XRWebGLLayer(a,t,fe),a.updateRenderState({baseLayer:S}),e.setPixelRatio(1),e.setSize(S.framebufferWidth,S.framebufferHeight,!1),P=new ss(S.framebufferWidth,S.framebufferHeight,{format:pi,type:$i,colorSpace:e.outputColorSpace,stencilBuffer:v.stencil})}else{let fe=null,Ee=null,xe=null;v.depth&&(xe=v.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,fe=v.stencil?oo:eo,Ee=v.stencil?so:rs);const Ae={colorFormat:t.RGBA8,depthFormat:xe,scaleFactor:l};x=new XRWebGLBinding(a,t),y=x.createProjectionLayer(Ae),a.updateRenderState({layers:[y]}),e.setPixelRatio(1),e.setSize(y.textureWidth,y.textureHeight,!1),P=new ss(y.textureWidth,y.textureHeight,{format:pi,type:$i,depthTexture:new Zg(y.textureWidth,y.textureHeight,Ee,void 0,void 0,void 0,void 0,void 0,void 0,fe),stencilBuffer:v.stencil,colorSpace:e.outputColorSpace,samples:v.antialias?4:0,resolveDepthBuffer:y.ignoreDepthValues===!1})}P.isXRRenderTarget=!0,this.setFoveation(h),m=null,c=await a.requestReferenceSpace(f),De.setContext(a),De.start(),r.isPresenting=!0,r.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(a!==null)return a.environmentBlendMode},this.getDepthTexture=function(){return T.getDepthTexture()};function ce(Q){for(let fe=0;fe<Q.removed.length;fe++){const Ee=Q.removed[fe],xe=C.indexOf(Ee);xe>=0&&(C[xe]=null,L[xe].disconnect(Ee))}for(let fe=0;fe<Q.added.length;fe++){const Ee=Q.added[fe];let xe=C.indexOf(Ee);if(xe===-1){for(let Ie=0;Ie<L.length;Ie++)if(Ie>=C.length){C.push(Ee),xe=Ie;break}else if(C[Ie]===null){C[Ie]=Ee,xe=Ie;break}if(xe===-1)break}const Ae=L[xe];Ae&&Ae.connect(Ee)}}const $=new G,oe=new G;function k(Q,fe,Ee){$.setFromMatrixPosition(fe.matrixWorld),oe.setFromMatrixPosition(Ee.matrixWorld);const xe=$.distanceTo(oe),Ae=fe.projectionMatrix.elements,Ie=Ee.projectionMatrix.elements,Qe=Ae[14]/(Ae[10]-1),Ct=Ae[14]/(Ae[10]+1),mt=(Ae[9]+1)/Ae[5],Ut=(Ae[9]-1)/Ae[5],Y=(Ae[8]-1)/Ae[0],vn=(Ie[8]+1)/Ie[0],ht=Qe*Y,ct=Qe*vn,$e=xe/(-Y+vn),wt=$e*-Y;if(fe.matrixWorld.decompose(Q.position,Q.quaternion,Q.scale),Q.translateX(wt),Q.translateZ($e),Q.matrixWorld.compose(Q.position,Q.quaternion,Q.scale),Q.matrixWorldInverse.copy(Q.matrixWorld).invert(),Ae[10]===-1)Q.projectionMatrix.copy(fe.projectionMatrix),Q.projectionMatrixInverse.copy(fe.projectionMatrixInverse);else{const Ye=Qe+$e,D=Ct+$e,w=ht-wt,Z=ct+(xe-wt),pe=mt*Ct/D*Ye,_e=Ut*Ct/D*Ye;Q.projectionMatrix.makePerspective(w,Z,pe,_e,Ye,D),Q.projectionMatrixInverse.copy(Q.projectionMatrix).invert()}}function le(Q,fe){fe===null?Q.matrixWorld.copy(Q.matrix):Q.matrixWorld.multiplyMatrices(fe.matrixWorld,Q.matrix),Q.matrixWorldInverse.copy(Q.matrixWorld).invert()}this.updateCamera=function(Q){if(a===null)return;let fe=Q.near,Ee=Q.far;T.texture!==null&&(T.depthNear>0&&(fe=T.depthNear),T.depthFar>0&&(Ee=T.depthFar)),A.near=B.near=I.near=fe,A.far=B.far=I.far=Ee,(O!==A.near||se!==A.far)&&(a.updateRenderState({depthNear:A.near,depthFar:A.far}),O=A.near,se=A.far),I.layers.mask=Q.layers.mask|2,B.layers.mask=Q.layers.mask|4,A.layers.mask=I.layers.mask|B.layers.mask;const xe=Q.parent,Ae=A.cameras;le(A,xe);for(let Ie=0;Ie<Ae.length;Ie++)le(Ae[Ie],xe);Ae.length===2?k(A,I,B):A.projectionMatrix.copy(I.projectionMatrix),re(Q,A,xe)};function re(Q,fe,Ee){Ee===null?Q.matrix.copy(fe.matrixWorld):(Q.matrix.copy(Ee.matrixWorld),Q.matrix.invert(),Q.matrix.multiply(fe.matrixWorld)),Q.matrix.decompose(Q.position,Q.quaternion,Q.scale),Q.updateMatrixWorld(!0),Q.projectionMatrix.copy(fe.projectionMatrix),Q.projectionMatrixInverse.copy(fe.projectionMatrixInverse),Q.isPerspectiveCamera&&(Q.fov=dd*2*Math.atan(1/Q.projectionMatrix.elements[5]),Q.zoom=1)}this.getCamera=function(){return A},this.getFoveation=function(){if(!(y===null&&S===null))return h},this.setFoveation=function(Q){h=Q,y!==null&&(y.fixedFoveation=Q),S!==null&&S.fixedFoveation!==void 0&&(S.fixedFoveation=Q)},this.hasDepthSensing=function(){return T.texture!==null},this.getDepthSensingMesh=function(){return T.getMesh(A)};let N=null;function ie(Q,fe){if(_=fe.getViewerPose(m||c),M=fe,_!==null){const Ee=_.views;S!==null&&(e.setRenderTargetFramebuffer(P,S.framebuffer),e.setRenderTarget(P));let xe=!1;Ee.length!==A.cameras.length&&(A.cameras.length=0,xe=!0);for(let Ie=0;Ie<Ee.length;Ie++){const Qe=Ee[Ie];let Ct=null;if(S!==null)Ct=S.getViewport(Qe);else{const Ut=x.getViewSubImage(y,Qe);Ct=Ut.viewport,Ie===0&&(e.setRenderTargetTextures(P,Ut.colorTexture,y.ignoreDepthValues?void 0:Ut.depthStencilTexture),e.setRenderTarget(P))}let mt=b[Ie];mt===void 0&&(mt=new ti,mt.layers.enable(Ie),mt.viewport=new Vt,b[Ie]=mt),mt.matrix.fromArray(Qe.transform.matrix),mt.matrix.decompose(mt.position,mt.quaternion,mt.scale),mt.projectionMatrix.fromArray(Qe.projectionMatrix),mt.projectionMatrixInverse.copy(mt.projectionMatrix).invert(),mt.viewport.set(Ct.x,Ct.y,Ct.width,Ct.height),Ie===0&&(A.matrix.copy(mt.matrix),A.matrix.decompose(A.position,A.quaternion,A.scale)),xe===!0&&A.cameras.push(mt)}const Ae=a.enabledFeatures;if(Ae&&Ae.includes("depth-sensing")){const Ie=x.getDepthInformation(Ee[0]);Ie&&Ie.isValid&&Ie.texture&&T.init(e,Ie,a.renderState)}}for(let Ee=0;Ee<L.length;Ee++){const xe=C[Ee],Ae=L[Ee];xe!==null&&Ae!==void 0&&Ae.update(xe,fe,m||c)}N&&N(Q,fe),fe.detectedPlanes&&r.dispatchEvent({type:"planesdetected",data:fe}),M=null}const De=new $g;De.setAnimationLoop(ie),this.setAnimationLoop=function(Q){N=Q},this.dispose=function(){}}}const Qr=new Ci,eT=new Lt;function tT(s,e){function t(v,g){v.matrixAutoUpdate===!0&&v.updateMatrix(),g.value.copy(v.matrix)}function r(v,g){g.color.getRGB(v.fogColor.value,jg(s)),g.isFog?(v.fogNear.value=g.near,v.fogFar.value=g.far):g.isFogExp2&&(v.fogDensity.value=g.density)}function a(v,g,P,L,C){g.isMeshBasicMaterial||g.isMeshLambertMaterial?l(v,g):g.isMeshToonMaterial?(l(v,g),x(v,g)):g.isMeshPhongMaterial?(l(v,g),_(v,g)):g.isMeshStandardMaterial?(l(v,g),y(v,g),g.isMeshPhysicalMaterial&&S(v,g,C)):g.isMeshMatcapMaterial?(l(v,g),M(v,g)):g.isMeshDepthMaterial?l(v,g):g.isMeshDistanceMaterial?(l(v,g),T(v,g)):g.isMeshNormalMaterial?l(v,g):g.isLineBasicMaterial?(c(v,g),g.isLineDashedMaterial&&f(v,g)):g.isPointsMaterial?h(v,g,P,L):g.isSpriteMaterial?m(v,g):g.isShadowMaterial?(v.color.value.copy(g.color),v.opacity.value=g.opacity):g.isShaderMaterial&&(g.uniformsNeedUpdate=!1)}function l(v,g){v.opacity.value=g.opacity,g.color&&v.diffuse.value.copy(g.color),g.emissive&&v.emissive.value.copy(g.emissive).multiplyScalar(g.emissiveIntensity),g.map&&(v.map.value=g.map,t(g.map,v.mapTransform)),g.alphaMap&&(v.alphaMap.value=g.alphaMap,t(g.alphaMap,v.alphaMapTransform)),g.bumpMap&&(v.bumpMap.value=g.bumpMap,t(g.bumpMap,v.bumpMapTransform),v.bumpScale.value=g.bumpScale,g.side===Rn&&(v.bumpScale.value*=-1)),g.normalMap&&(v.normalMap.value=g.normalMap,t(g.normalMap,v.normalMapTransform),v.normalScale.value.copy(g.normalScale),g.side===Rn&&v.normalScale.value.negate()),g.displacementMap&&(v.displacementMap.value=g.displacementMap,t(g.displacementMap,v.displacementMapTransform),v.displacementScale.value=g.displacementScale,v.displacementBias.value=g.displacementBias),g.emissiveMap&&(v.emissiveMap.value=g.emissiveMap,t(g.emissiveMap,v.emissiveMapTransform)),g.specularMap&&(v.specularMap.value=g.specularMap,t(g.specularMap,v.specularMapTransform)),g.alphaTest>0&&(v.alphaTest.value=g.alphaTest);const P=e.get(g),L=P.envMap,C=P.envMapRotation;L&&(v.envMap.value=L,Qr.copy(C),Qr.x*=-1,Qr.y*=-1,Qr.z*=-1,L.isCubeTexture&&L.isRenderTargetTexture===!1&&(Qr.y*=-1,Qr.z*=-1),v.envMapRotation.value.setFromMatrix4(eT.makeRotationFromEuler(Qr)),v.flipEnvMap.value=L.isCubeTexture&&L.isRenderTargetTexture===!1?-1:1,v.reflectivity.value=g.reflectivity,v.ior.value=g.ior,v.refractionRatio.value=g.refractionRatio),g.lightMap&&(v.lightMap.value=g.lightMap,v.lightMapIntensity.value=g.lightMapIntensity,t(g.lightMap,v.lightMapTransform)),g.aoMap&&(v.aoMap.value=g.aoMap,v.aoMapIntensity.value=g.aoMapIntensity,t(g.aoMap,v.aoMapTransform))}function c(v,g){v.diffuse.value.copy(g.color),v.opacity.value=g.opacity,g.map&&(v.map.value=g.map,t(g.map,v.mapTransform))}function f(v,g){v.dashSize.value=g.dashSize,v.totalSize.value=g.dashSize+g.gapSize,v.scale.value=g.scale}function h(v,g,P,L){v.diffuse.value.copy(g.color),v.opacity.value=g.opacity,v.size.value=g.size*P,v.scale.value=L*.5,g.map&&(v.map.value=g.map,t(g.map,v.uvTransform)),g.alphaMap&&(v.alphaMap.value=g.alphaMap,t(g.alphaMap,v.alphaMapTransform)),g.alphaTest>0&&(v.alphaTest.value=g.alphaTest)}function m(v,g){v.diffuse.value.copy(g.color),v.opacity.value=g.opacity,v.rotation.value=g.rotation,g.map&&(v.map.value=g.map,t(g.map,v.mapTransform)),g.alphaMap&&(v.alphaMap.value=g.alphaMap,t(g.alphaMap,v.alphaMapTransform)),g.alphaTest>0&&(v.alphaTest.value=g.alphaTest)}function _(v,g){v.specular.value.copy(g.specular),v.shininess.value=Math.max(g.shininess,1e-4)}function x(v,g){g.gradientMap&&(v.gradientMap.value=g.gradientMap)}function y(v,g){v.metalness.value=g.metalness,g.metalnessMap&&(v.metalnessMap.value=g.metalnessMap,t(g.metalnessMap,v.metalnessMapTransform)),v.roughness.value=g.roughness,g.roughnessMap&&(v.roughnessMap.value=g.roughnessMap,t(g.roughnessMap,v.roughnessMapTransform)),g.envMap&&(v.envMapIntensity.value=g.envMapIntensity)}function S(v,g,P){v.ior.value=g.ior,g.sheen>0&&(v.sheenColor.value.copy(g.sheenColor).multiplyScalar(g.sheen),v.sheenRoughness.value=g.sheenRoughness,g.sheenColorMap&&(v.sheenColorMap.value=g.sheenColorMap,t(g.sheenColorMap,v.sheenColorMapTransform)),g.sheenRoughnessMap&&(v.sheenRoughnessMap.value=g.sheenRoughnessMap,t(g.sheenRoughnessMap,v.sheenRoughnessMapTransform))),g.clearcoat>0&&(v.clearcoat.value=g.clearcoat,v.clearcoatRoughness.value=g.clearcoatRoughness,g.clearcoatMap&&(v.clearcoatMap.value=g.clearcoatMap,t(g.clearcoatMap,v.clearcoatMapTransform)),g.clearcoatRoughnessMap&&(v.clearcoatRoughnessMap.value=g.clearcoatRoughnessMap,t(g.clearcoatRoughnessMap,v.clearcoatRoughnessMapTransform)),g.clearcoatNormalMap&&(v.clearcoatNormalMap.value=g.clearcoatNormalMap,t(g.clearcoatNormalMap,v.clearcoatNormalMapTransform),v.clearcoatNormalScale.value.copy(g.clearcoatNormalScale),g.side===Rn&&v.clearcoatNormalScale.value.negate())),g.dispersion>0&&(v.dispersion.value=g.dispersion),g.iridescence>0&&(v.iridescence.value=g.iridescence,v.iridescenceIOR.value=g.iridescenceIOR,v.iridescenceThicknessMinimum.value=g.iridescenceThicknessRange[0],v.iridescenceThicknessMaximum.value=g.iridescenceThicknessRange[1],g.iridescenceMap&&(v.iridescenceMap.value=g.iridescenceMap,t(g.iridescenceMap,v.iridescenceMapTransform)),g.iridescenceThicknessMap&&(v.iridescenceThicknessMap.value=g.iridescenceThicknessMap,t(g.iridescenceThicknessMap,v.iridescenceThicknessMapTransform))),g.transmission>0&&(v.transmission.value=g.transmission,v.transmissionSamplerMap.value=P.texture,v.transmissionSamplerSize.value.set(P.width,P.height),g.transmissionMap&&(v.transmissionMap.value=g.transmissionMap,t(g.transmissionMap,v.transmissionMapTransform)),v.thickness.value=g.thickness,g.thicknessMap&&(v.thicknessMap.value=g.thicknessMap,t(g.thicknessMap,v.thicknessMapTransform)),v.attenuationDistance.value=g.attenuationDistance,v.attenuationColor.value.copy(g.attenuationColor)),g.anisotropy>0&&(v.anisotropyVector.value.set(g.anisotropy*Math.cos(g.anisotropyRotation),g.anisotropy*Math.sin(g.anisotropyRotation)),g.anisotropyMap&&(v.anisotropyMap.value=g.anisotropyMap,t(g.anisotropyMap,v.anisotropyMapTransform))),v.specularIntensity.value=g.specularIntensity,v.specularColor.value.copy(g.specularColor),g.specularColorMap&&(v.specularColorMap.value=g.specularColorMap,t(g.specularColorMap,v.specularColorMapTransform)),g.specularIntensityMap&&(v.specularIntensityMap.value=g.specularIntensityMap,t(g.specularIntensityMap,v.specularIntensityMapTransform))}function M(v,g){g.matcap&&(v.matcap.value=g.matcap)}function T(v,g){const P=e.get(g).light;v.referencePosition.value.setFromMatrixPosition(P.matrixWorld),v.nearDistance.value=P.shadow.camera.near,v.farDistance.value=P.shadow.camera.far}return{refreshFogUniforms:r,refreshMaterialUniforms:a}}function nT(s,e,t,r){let a={},l={},c=[];const f=s.getParameter(s.MAX_UNIFORM_BUFFER_BINDINGS);function h(P,L){const C=L.program;r.uniformBlockBinding(P,C)}function m(P,L){let C=a[P.id];C===void 0&&(M(P),C=_(P),a[P.id]=C,P.addEventListener("dispose",v));const W=L.program;r.updateUBOMapping(P,W);const F=e.render.frame;l[P.id]!==F&&(y(P),l[P.id]=F)}function _(P){const L=x();P.__bindingPointIndex=L;const C=s.createBuffer(),W=P.__size,F=P.usage;return s.bindBuffer(s.UNIFORM_BUFFER,C),s.bufferData(s.UNIFORM_BUFFER,W,F),s.bindBuffer(s.UNIFORM_BUFFER,null),s.bindBufferBase(s.UNIFORM_BUFFER,L,C),C}function x(){for(let P=0;P<f;P++)if(c.indexOf(P)===-1)return c.push(P),P;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function y(P){const L=a[P.id],C=P.uniforms,W=P.__cache;s.bindBuffer(s.UNIFORM_BUFFER,L);for(let F=0,I=C.length;F<I;F++){const B=Array.isArray(C[F])?C[F]:[C[F]];for(let b=0,A=B.length;b<A;b++){const O=B[b];if(S(O,F,b,W)===!0){const se=O.__offset,J=Array.isArray(O.value)?O.value:[O.value];let ue=0;for(let ce=0;ce<J.length;ce++){const $=J[ce],oe=T($);typeof $=="number"||typeof $=="boolean"?(O.__data[0]=$,s.bufferSubData(s.UNIFORM_BUFFER,se+ue,O.__data)):$.isMatrix3?(O.__data[0]=$.elements[0],O.__data[1]=$.elements[1],O.__data[2]=$.elements[2],O.__data[3]=0,O.__data[4]=$.elements[3],O.__data[5]=$.elements[4],O.__data[6]=$.elements[5],O.__data[7]=0,O.__data[8]=$.elements[6],O.__data[9]=$.elements[7],O.__data[10]=$.elements[8],O.__data[11]=0):($.toArray(O.__data,ue),ue+=oe.storage/Float32Array.BYTES_PER_ELEMENT)}s.bufferSubData(s.UNIFORM_BUFFER,se,O.__data)}}}s.bindBuffer(s.UNIFORM_BUFFER,null)}function S(P,L,C,W){const F=P.value,I=L+"_"+C;if(W[I]===void 0)return typeof F=="number"||typeof F=="boolean"?W[I]=F:W[I]=F.clone(),!0;{const B=W[I];if(typeof F=="number"||typeof F=="boolean"){if(B!==F)return W[I]=F,!0}else if(B.equals(F)===!1)return B.copy(F),!0}return!1}function M(P){const L=P.uniforms;let C=0;const W=16;for(let I=0,B=L.length;I<B;I++){const b=Array.isArray(L[I])?L[I]:[L[I]];for(let A=0,O=b.length;A<O;A++){const se=b[A],J=Array.isArray(se.value)?se.value:[se.value];for(let ue=0,ce=J.length;ue<ce;ue++){const $=J[ue],oe=T($),k=C%W,le=k%oe.boundary,re=k+le;C+=le,re!==0&&W-re<oe.storage&&(C+=W-re),se.__data=new Float32Array(oe.storage/Float32Array.BYTES_PER_ELEMENT),se.__offset=C,C+=oe.storage}}}const F=C%W;return F>0&&(C+=W-F),P.__size=C,P.__cache={},this}function T(P){const L={boundary:0,storage:0};return typeof P=="number"||typeof P=="boolean"?(L.boundary=4,L.storage=4):P.isVector2?(L.boundary=8,L.storage=8):P.isVector3||P.isColor?(L.boundary=16,L.storage=12):P.isVector4?(L.boundary=16,L.storage=16):P.isMatrix3?(L.boundary=48,L.storage=48):P.isMatrix4?(L.boundary=64,L.storage=64):P.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",P),L}function v(P){const L=P.target;L.removeEventListener("dispose",v);const C=c.indexOf(L.__bindingPointIndex);c.splice(C,1),s.deleteBuffer(a[L.id]),delete a[L.id],delete l[L.id]}function g(){for(const P in a)s.deleteBuffer(a[P]);c=[],a={},l={}}return{bind:h,update:m,dispose:g}}class iT{constructor(e={}){const{canvas:t=X0(),context:r=null,depth:a=!0,stencil:l=!1,alpha:c=!1,antialias:f=!1,premultipliedAlpha:h=!0,preserveDrawingBuffer:m=!1,powerPreference:_="default",failIfMajorPerformanceCaveat:x=!1,reverseDepthBuffer:y=!1}=e;this.isWebGLRenderer=!0;let S;if(r!==null){if(typeof WebGLRenderingContext<"u"&&r instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");S=r.getContextAttributes().alpha}else S=c;const M=new Uint32Array(4),T=new Int32Array(4);let v=null,g=null;const P=[],L=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=An,this.toneMapping=Cr,this.toneMappingExposure=1;const C=this;let W=!1,F=0,I=0,B=null,b=-1,A=null;const O=new Vt,se=new Vt;let J=null;const ue=new pt(0);let ce=0,$=t.width,oe=t.height,k=1,le=null,re=null;const N=new Vt(0,0,$,oe),ie=new Vt(0,0,$,oe);let De=!1;const Q=new Td;let fe=!1,Ee=!1;const xe=new Lt,Ae=new Lt,Ie=new G,Qe=new Vt,Ct={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let mt=!1;function Ut(){return B===null?k:1}let Y=r;function vn(R,X){return t.getContext(R,X)}try{const R={alpha:!0,depth:a,stencil:l,antialias:f,premultipliedAlpha:h,preserveDrawingBuffer:m,powerPreference:_,failIfMajorPerformanceCaveat:x};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${gd}`),t.addEventListener("webglcontextlost",he,!1),t.addEventListener("webglcontextrestored",Le,!1),t.addEventListener("webglcontextcreationerror",Pe,!1),Y===null){const X="webgl2";if(Y=vn(X,R),Y===null)throw vn(X)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(R){throw console.error("THREE.WebGLRenderer: "+R.message),R}let ht,ct,$e,wt,Ye,D,w,Z,pe,_e,de,Ve,Ce,Ne,ut,Se,Oe,Je,et,ze,ft,rt,Tt,V;function Re(){ht=new lM(Y),ht.init(),rt=new YE(Y,ht),ct=new nM(Y,ht,e,rt),$e=new WE(Y,ht),ct.reverseDepthBuffer&&y&&$e.buffers.depth.setReversed(!0),wt=new fM(Y),Ye=new bE,D=new jE(Y,ht,$e,Ye,ct,rt,wt),w=new rM(C),Z=new aM(C),pe=new vx(Y),Tt=new eM(Y,pe),_e=new uM(Y,pe,wt,Tt),de=new hM(Y,_e,pe,wt),et=new dM(Y,ct,D),Se=new iM(Ye),Ve=new RE(C,w,Z,ht,ct,Tt,Se),Ce=new tT(C,Ye),Ne=new LE,ut=new OE(ht),Je=new JS(C,w,Z,$e,de,S,h),Oe=new VE(C,de,ct),V=new nT(Y,wt,ct,$e),ze=new tM(Y,ht,wt),ft=new cM(Y,ht,wt),wt.programs=Ve.programs,C.capabilities=ct,C.extensions=ht,C.properties=Ye,C.renderLists=Ne,C.shadowMap=Oe,C.state=$e,C.info=wt}Re();const ae=new JE(C,Y);this.xr=ae,this.getContext=function(){return Y},this.getContextAttributes=function(){return Y.getContextAttributes()},this.forceContextLoss=function(){const R=ht.get("WEBGL_lose_context");R&&R.loseContext()},this.forceContextRestore=function(){const R=ht.get("WEBGL_lose_context");R&&R.restoreContext()},this.getPixelRatio=function(){return k},this.setPixelRatio=function(R){R!==void 0&&(k=R,this.setSize($,oe,!1))},this.getSize=function(R){return R.set($,oe)},this.setSize=function(R,X,te=!0){if(ae.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}$=R,oe=X,t.width=Math.floor(R*k),t.height=Math.floor(X*k),te===!0&&(t.style.width=R+"px",t.style.height=X+"px"),this.setViewport(0,0,R,X)},this.getDrawingBufferSize=function(R){return R.set($*k,oe*k).floor()},this.setDrawingBufferSize=function(R,X,te){$=R,oe=X,k=te,t.width=Math.floor(R*te),t.height=Math.floor(X*te),this.setViewport(0,0,R,X)},this.getCurrentViewport=function(R){return R.copy(O)},this.getViewport=function(R){return R.copy(N)},this.setViewport=function(R,X,te,ne){R.isVector4?N.set(R.x,R.y,R.z,R.w):N.set(R,X,te,ne),$e.viewport(O.copy(N).multiplyScalar(k).round())},this.getScissor=function(R){return R.copy(ie)},this.setScissor=function(R,X,te,ne){R.isVector4?ie.set(R.x,R.y,R.z,R.w):ie.set(R,X,te,ne),$e.scissor(se.copy(ie).multiplyScalar(k).round())},this.getScissorTest=function(){return De},this.setScissorTest=function(R){$e.setScissorTest(De=R)},this.setOpaqueSort=function(R){le=R},this.setTransparentSort=function(R){re=R},this.getClearColor=function(R){return R.copy(Je.getClearColor())},this.setClearColor=function(){Je.setClearColor.apply(Je,arguments)},this.getClearAlpha=function(){return Je.getClearAlpha()},this.setClearAlpha=function(){Je.setClearAlpha.apply(Je,arguments)},this.clear=function(R=!0,X=!0,te=!0){let ne=0;if(R){let j=!1;if(B!==null){const we=B.texture.format;j=we===Ed||we===Md||we===Sd}if(j){const we=B.texture.type,Me=we===$i||we===rs||we===Jo||we===so||we===xd||we===yd,Ge=Je.getClearColor(),Be=Je.getClearAlpha(),tt=Ge.r,it=Ge.g,We=Ge.b;Me?(M[0]=tt,M[1]=it,M[2]=We,M[3]=Be,Y.clearBufferuiv(Y.COLOR,0,M)):(T[0]=tt,T[1]=it,T[2]=We,T[3]=Be,Y.clearBufferiv(Y.COLOR,0,T))}else ne|=Y.COLOR_BUFFER_BIT}X&&(ne|=Y.DEPTH_BUFFER_BIT),te&&(ne|=Y.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),Y.clear(ne)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",he,!1),t.removeEventListener("webglcontextrestored",Le,!1),t.removeEventListener("webglcontextcreationerror",Pe,!1),Ne.dispose(),ut.dispose(),Ye.dispose(),w.dispose(),Z.dispose(),de.dispose(),Tt.dispose(),V.dispose(),Ve.dispose(),ae.dispose(),ae.removeEventListener("sessionstart",as),ae.removeEventListener("sessionend",Ki),Ri.stop()};function he(R){R.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),W=!0}function Le(){console.log("THREE.WebGLRenderer: Context Restored."),W=!1;const R=wt.autoReset,X=Oe.enabled,te=Oe.autoUpdate,ne=Oe.needsUpdate,j=Oe.type;Re(),wt.autoReset=R,Oe.enabled=X,Oe.autoUpdate=te,Oe.needsUpdate=ne,Oe.type=j}function Pe(R){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",R.statusMessage)}function st(R){const X=R.target;X.removeEventListener("dispose",st),Nt(X)}function Nt(R){qt(R),Ye.remove(R)}function qt(R){const X=Ye.get(R).programs;X!==void 0&&(X.forEach(function(te){Ve.releaseProgram(te)}),R.isShaderMaterial&&Ve.releaseShaderCache(R))}this.renderBufferDirect=function(R,X,te,ne,j,we){X===null&&(X=Ct);const Me=j.isMesh&&j.matrixWorld.determinant()<0,Ge=la(R,X,te,ne,j);$e.setMaterial(ne,Me);let Be=te.index,tt=1;if(ne.wireframe===!0){if(Be=_e.getWireframeAttribute(te),Be===void 0)return;tt=2}const it=te.drawRange,We=te.attributes.position;let _t=it.start*tt,Et=(it.start+it.count)*tt;we!==null&&(_t=Math.max(_t,we.start*tt),Et=Math.min(Et,(we.start+we.count)*tt)),Be!==null?(_t=Math.max(_t,0),Et=Math.min(Et,Be.count)):We!=null&&(_t=Math.max(_t,0),Et=Math.min(Et,We.count));const gt=Et-_t;if(gt<0||gt===1/0)return;Tt.setup(j,ne,Ge,te,Be);let un,ot=ze;if(Be!==null&&(un=pe.get(Be),ot=ft,ot.setIndex(un)),j.isMesh)ne.wireframe===!0?($e.setLineWidth(ne.wireframeLinewidth*Ut()),ot.setMode(Y.LINES)):ot.setMode(Y.TRIANGLES);else if(j.isLine){let je=ne.linewidth;je===void 0&&(je=1),$e.setLineWidth(je*Ut()),j.isLineSegments?ot.setMode(Y.LINES):j.isLineLoop?ot.setMode(Y.LINE_LOOP):ot.setMode(Y.LINE_STRIP)}else j.isPoints?ot.setMode(Y.POINTS):j.isSprite&&ot.setMode(Y.TRIANGLES);if(j.isBatchedMesh)if(j._multiDrawInstances!==null)ot.renderMultiDrawInstances(j._multiDrawStarts,j._multiDrawCounts,j._multiDrawCount,j._multiDrawInstances);else if(ht.get("WEBGL_multi_draw"))ot.renderMultiDraw(j._multiDrawStarts,j._multiDrawCounts,j._multiDrawCount);else{const je=j._multiDrawStarts,ii=j._multiDrawCounts,St=j._multiDrawCount,cn=Be?pe.get(Be).bytesPerElement:1,ri=Ye.get(ne).currentProgram.getUniforms();for(let $t=0;$t<St;$t++)ri.setValue(Y,"_gl_DrawID",$t),ot.render(je[$t]/cn,ii[$t])}else if(j.isInstancedMesh)ot.renderInstances(_t,gt,j.count);else if(te.isInstancedBufferGeometry){const je=te._maxInstanceCount!==void 0?te._maxInstanceCount:1/0,ii=Math.min(te.instanceCount,je);ot.renderInstances(_t,gt,ii)}else ot.render(_t,gt)};function vt(R,X,te){R.transparent===!0&&R.side===Ti&&R.forceSinglePass===!1?(R.side=Rn,R.needsUpdate=!0,ls(R,X,te),R.side=br,R.needsUpdate=!0,ls(R,X,te),R.side=Ti):ls(R,X,te)}this.compile=function(R,X,te=null){te===null&&(te=R),g=ut.get(te),g.init(X),L.push(g),te.traverseVisible(function(j){j.isLight&&j.layers.test(X.layers)&&(g.pushLight(j),j.castShadow&&g.pushShadow(j))}),R!==te&&R.traverseVisible(function(j){j.isLight&&j.layers.test(X.layers)&&(g.pushLight(j),j.castShadow&&g.pushShadow(j))}),g.setupLights();const ne=new Set;return R.traverse(function(j){if(!(j.isMesh||j.isPoints||j.isLine||j.isSprite))return;const we=j.material;if(we)if(Array.isArray(we))for(let Me=0;Me<we.length;Me++){const Ge=we[Me];vt(Ge,te,j),ne.add(Ge)}else vt(we,te,j),ne.add(we)}),L.pop(),g=null,ne},this.compileAsync=function(R,X,te=null){const ne=this.compile(R,X,te);return new Promise(j=>{function we(){if(ne.forEach(function(Me){Ye.get(Me).currentProgram.isReady()&&ne.delete(Me)}),ne.size===0){j(R);return}setTimeout(we,10)}ht.get("KHR_parallel_shader_compile")!==null?we():setTimeout(we,10)})};let Pn=null;function xn(R){Pn&&Pn(R)}function as(){Ri.stop()}function Ki(){Ri.start()}const Ri=new $g;Ri.setAnimationLoop(xn),typeof self<"u"&&Ri.setContext(self),this.setAnimationLoop=function(R){Pn=R,ae.setAnimationLoop(R),R===null?Ri.stop():Ri.start()},ae.addEventListener("sessionstart",as),ae.addEventListener("sessionend",Ki),this.render=function(R,X){if(X!==void 0&&X.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(W===!0)return;if(R.matrixWorldAutoUpdate===!0&&R.updateMatrixWorld(),X.parent===null&&X.matrixWorldAutoUpdate===!0&&X.updateMatrixWorld(),ae.enabled===!0&&ae.isPresenting===!0&&(ae.cameraAutoUpdate===!0&&ae.updateCamera(X),X=ae.getCamera()),R.isScene===!0&&R.onBeforeRender(C,R,X,B),g=ut.get(R,L.length),g.init(X),L.push(g),Ae.multiplyMatrices(X.projectionMatrix,X.matrixWorldInverse),Q.setFromProjectionMatrix(Ae),Ee=this.localClippingEnabled,fe=Se.init(this.clippingPlanes,Ee),v=Ne.get(R,P.length),v.init(),P.push(v),ae.enabled===!0&&ae.isPresenting===!0){const we=C.xr.getDepthSensingMesh();we!==null&&bi(we,X,-1/0,C.sortObjects)}bi(R,X,0,C.sortObjects),v.finish(),C.sortObjects===!0&&v.sort(le,re),mt=ae.enabled===!1||ae.isPresenting===!1||ae.hasDepthSensing()===!1,mt&&Je.addToRenderList(v,R),this.info.render.frame++,fe===!0&&Se.beginShadows();const te=g.state.shadowsArray;Oe.render(te,R,X),fe===!0&&Se.endShadows(),this.info.autoReset===!0&&this.info.reset();const ne=v.opaque,j=v.transmissive;if(g.setupLights(),X.isArrayCamera){const we=X.cameras;if(j.length>0)for(let Me=0,Ge=we.length;Me<Ge;Me++){const Be=we[Me];Ir(ne,j,R,Be)}mt&&Je.render(R);for(let Me=0,Ge=we.length;Me<Ge;Me++){const Be=we[Me];Ur(v,R,Be,Be.viewport)}}else j.length>0&&Ir(ne,j,R,X),mt&&Je.render(R),Ur(v,R,X);B!==null&&(D.updateMultisampleRenderTarget(B),D.updateRenderTargetMipmap(B)),R.isScene===!0&&R.onAfterRender(C,R,X),Tt.resetDefaultState(),b=-1,A=null,L.pop(),L.length>0?(g=L[L.length-1],fe===!0&&Se.setGlobalState(C.clippingPlanes,g.state.camera)):g=null,P.pop(),P.length>0?v=P[P.length-1]:v=null};function bi(R,X,te,ne){if(R.visible===!1)return;if(R.layers.test(X.layers)){if(R.isGroup)te=R.renderOrder;else if(R.isLOD)R.autoUpdate===!0&&R.update(X);else if(R.isLight)g.pushLight(R),R.castShadow&&g.pushShadow(R);else if(R.isSprite){if(!R.frustumCulled||Q.intersectsSprite(R)){ne&&Qe.setFromMatrixPosition(R.matrixWorld).applyMatrix4(Ae);const Me=de.update(R),Ge=R.material;Ge.visible&&v.push(R,Me,Ge,te,Qe.z,null)}}else if((R.isMesh||R.isLine||R.isPoints)&&(!R.frustumCulled||Q.intersectsObject(R))){const Me=de.update(R),Ge=R.material;if(ne&&(R.boundingSphere!==void 0?(R.boundingSphere===null&&R.computeBoundingSphere(),Qe.copy(R.boundingSphere.center)):(Me.boundingSphere===null&&Me.computeBoundingSphere(),Qe.copy(Me.boundingSphere.center)),Qe.applyMatrix4(R.matrixWorld).applyMatrix4(Ae)),Array.isArray(Ge)){const Be=Me.groups;for(let tt=0,it=Be.length;tt<it;tt++){const We=Be[tt],_t=Ge[We.materialIndex];_t&&_t.visible&&v.push(R,Me,_t,te,Qe.z,We)}}else Ge.visible&&v.push(R,Me,Ge,te,Qe.z,null)}}const we=R.children;for(let Me=0,Ge=we.length;Me<Ge;Me++)bi(we[Me],X,te,ne)}function Ur(R,X,te,ne){const j=R.opaque,we=R.transmissive,Me=R.transparent;g.setupLightsView(te),fe===!0&&Se.setGlobalState(C.clippingPlanes,te),ne&&$e.viewport(O.copy(ne)),j.length>0&&Zi(j,X,te),we.length>0&&Zi(we,X,te),Me.length>0&&Zi(Me,X,te),$e.buffers.depth.setTest(!0),$e.buffers.depth.setMask(!0),$e.buffers.color.setMask(!0),$e.setPolygonOffset(!1)}function Ir(R,X,te,ne){if((te.isScene===!0?te.overrideMaterial:null)!==null)return;g.state.transmissionRenderTarget[ne.id]===void 0&&(g.state.transmissionRenderTarget[ne.id]=new ss(1,1,{generateMipmaps:!0,type:ht.has("EXT_color_buffer_half_float")||ht.has("EXT_color_buffer_float")?na:$i,minFilter:is,samples:4,stencilBuffer:l,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:yt.workingColorSpace}));const we=g.state.transmissionRenderTarget[ne.id],Me=ne.viewport||O;we.setSize(Me.z,Me.w);const Ge=C.getRenderTarget();C.setRenderTarget(we),C.getClearColor(ue),ce=C.getClearAlpha(),ce<1&&C.setClearColor(16777215,.5),C.clear(),mt&&Je.render(te);const Be=C.toneMapping;C.toneMapping=Cr;const tt=ne.viewport;if(ne.viewport!==void 0&&(ne.viewport=void 0),g.setupLightsView(ne),fe===!0&&Se.setGlobalState(C.clippingPlanes,ne),Zi(R,te,ne),D.updateMultisampleRenderTarget(we),D.updateRenderTargetMipmap(we),ht.has("WEBGL_multisampled_render_to_texture")===!1){let it=!1;for(let We=0,_t=X.length;We<_t;We++){const Et=X[We],gt=Et.object,un=Et.geometry,ot=Et.material,je=Et.group;if(ot.side===Ti&&gt.layers.test(ne.layers)){const ii=ot.side;ot.side=Rn,ot.needsUpdate=!0,oa(gt,te,ne,un,ot,je),ot.side=ii,ot.needsUpdate=!0,it=!0}}it===!0&&(D.updateMultisampleRenderTarget(we),D.updateRenderTargetMipmap(we))}C.setRenderTarget(Ge),C.setClearColor(ue,ce),tt!==void 0&&(ne.viewport=tt),C.toneMapping=Be}function Zi(R,X,te){const ne=X.isScene===!0?X.overrideMaterial:null;for(let j=0,we=R.length;j<we;j++){const Me=R[j],Ge=Me.object,Be=Me.geometry,tt=ne===null?Me.material:ne,it=Me.group;Ge.layers.test(te.layers)&&oa(Ge,X,te,Be,tt,it)}}function oa(R,X,te,ne,j,we){R.onBeforeRender(C,X,te,ne,j,we),R.modelViewMatrix.multiplyMatrices(te.matrixWorldInverse,R.matrixWorld),R.normalMatrix.getNormalMatrix(R.modelViewMatrix),j.onBeforeRender(C,X,te,ne,R,we),j.transparent===!0&&j.side===Ti&&j.forceSinglePass===!1?(j.side=Rn,j.needsUpdate=!0,C.renderBufferDirect(te,X,ne,j,R,we),j.side=br,j.needsUpdate=!0,C.renderBufferDirect(te,X,ne,j,R,we),j.side=Ti):C.renderBufferDirect(te,X,ne,j,R,we),R.onAfterRender(C,X,te,ne,j,we)}function ls(R,X,te){X.isScene!==!0&&(X=Ct);const ne=Ye.get(R),j=g.state.lights,we=g.state.shadowsArray,Me=j.state.version,Ge=Ve.getParameters(R,j.state,we,X,te),Be=Ve.getProgramCacheKey(Ge);let tt=ne.programs;ne.environment=R.isMeshStandardMaterial?X.environment:null,ne.fog=X.fog,ne.envMap=(R.isMeshStandardMaterial?Z:w).get(R.envMap||ne.environment),ne.envMapRotation=ne.environment!==null&&R.envMap===null?X.environmentRotation:R.envMapRotation,tt===void 0&&(R.addEventListener("dispose",st),tt=new Map,ne.programs=tt);let it=tt.get(Be);if(it!==void 0){if(ne.currentProgram===it&&ne.lightsStateVersion===Me)return _i(R,Ge),it}else Ge.uniforms=Ve.getUniforms(R),R.onBeforeCompile(Ge,C),it=Ve.acquireProgram(Ge,Be),tt.set(Be,it),ne.uniforms=Ge.uniforms;const We=ne.uniforms;return(!R.isShaderMaterial&&!R.isRawShaderMaterial||R.clipping===!0)&&(We.clippingPlanes=Se.uniform),_i(R,Ge),ne.needsLights=su(R),ne.lightsStateVersion=Me,ne.needsLights&&(We.ambientLightColor.value=j.state.ambient,We.lightProbe.value=j.state.probe,We.directionalLights.value=j.state.directional,We.directionalLightShadows.value=j.state.directionalShadow,We.spotLights.value=j.state.spot,We.spotLightShadows.value=j.state.spotShadow,We.rectAreaLights.value=j.state.rectArea,We.ltc_1.value=j.state.rectAreaLTC1,We.ltc_2.value=j.state.rectAreaLTC2,We.pointLights.value=j.state.point,We.pointLightShadows.value=j.state.pointShadow,We.hemisphereLights.value=j.state.hemi,We.directionalShadowMap.value=j.state.directionalShadowMap,We.directionalShadowMatrix.value=j.state.directionalShadowMatrix,We.spotShadowMap.value=j.state.spotShadowMap,We.spotLightMatrix.value=j.state.spotLightMatrix,We.spotLightMap.value=j.state.spotLightMap,We.pointShadowMap.value=j.state.pointShadowMap,We.pointShadowMatrix.value=j.state.pointShadowMatrix),ne.currentProgram=it,ne.uniformsList=null,it}function aa(R){if(R.uniformsList===null){const X=R.currentProgram.getUniforms();R.uniformsList=Yl.seqWithValue(X.seq,R.uniforms)}return R.uniformsList}function _i(R,X){const te=Ye.get(R);te.outputColorSpace=X.outputColorSpace,te.batching=X.batching,te.batchingColor=X.batchingColor,te.instancing=X.instancing,te.instancingColor=X.instancingColor,te.instancingMorph=X.instancingMorph,te.skinning=X.skinning,te.morphTargets=X.morphTargets,te.morphNormals=X.morphNormals,te.morphColors=X.morphColors,te.morphTargetsCount=X.morphTargetsCount,te.numClippingPlanes=X.numClippingPlanes,te.numIntersection=X.numClipIntersection,te.vertexAlphas=X.vertexAlphas,te.vertexTangents=X.vertexTangents,te.toneMapping=X.toneMapping}function la(R,X,te,ne,j){X.isScene!==!0&&(X=Ct),D.resetTextureUnits();const we=X.fog,Me=ne.isMeshStandardMaterial?X.environment:null,Ge=B===null?C.outputColorSpace:B.isXRRenderTarget===!0?B.texture.colorSpace:uo,Be=(ne.isMeshStandardMaterial?Z:w).get(ne.envMap||Me),tt=ne.vertexColors===!0&&!!te.attributes.color&&te.attributes.color.itemSize===4,it=!!te.attributes.tangent&&(!!ne.normalMap||ne.anisotropy>0),We=!!te.morphAttributes.position,_t=!!te.morphAttributes.normal,Et=!!te.morphAttributes.color;let gt=Cr;ne.toneMapped&&(B===null||B.isXRRenderTarget===!0)&&(gt=C.toneMapping);const un=te.morphAttributes.position||te.morphAttributes.normal||te.morphAttributes.color,ot=un!==void 0?un.length:0,je=Ye.get(ne),ii=g.state.lights;if(fe===!0&&(Ee===!0||R!==A)){const yn=R===A&&ne.id===b;Se.setState(ne,R,yn)}let St=!1;ne.version===je.__version?(je.needsLights&&je.lightsStateVersion!==ii.state.version||je.outputColorSpace!==Ge||j.isBatchedMesh&&je.batching===!1||!j.isBatchedMesh&&je.batching===!0||j.isBatchedMesh&&je.batchingColor===!0&&j.colorTexture===null||j.isBatchedMesh&&je.batchingColor===!1&&j.colorTexture!==null||j.isInstancedMesh&&je.instancing===!1||!j.isInstancedMesh&&je.instancing===!0||j.isSkinnedMesh&&je.skinning===!1||!j.isSkinnedMesh&&je.skinning===!0||j.isInstancedMesh&&je.instancingColor===!0&&j.instanceColor===null||j.isInstancedMesh&&je.instancingColor===!1&&j.instanceColor!==null||j.isInstancedMesh&&je.instancingMorph===!0&&j.morphTexture===null||j.isInstancedMesh&&je.instancingMorph===!1&&j.morphTexture!==null||je.envMap!==Be||ne.fog===!0&&je.fog!==we||je.numClippingPlanes!==void 0&&(je.numClippingPlanes!==Se.numPlanes||je.numIntersection!==Se.numIntersection)||je.vertexAlphas!==tt||je.vertexTangents!==it||je.morphTargets!==We||je.morphNormals!==_t||je.morphColors!==Et||je.toneMapping!==gt||je.morphTargetsCount!==ot)&&(St=!0):(St=!0,je.__version=ne.version);let cn=je.currentProgram;St===!0&&(cn=ls(ne,X,j));let ri=!1,$t=!1,vi=!1;const Dt=cn.getUniforms(),jn=je.uniforms;if($e.useProgram(cn.program)&&(ri=!0,$t=!0,vi=!0),ne.id!==b&&(b=ne.id,$t=!0),ri||A!==R){$e.buffers.depth.getReversed()?(xe.copy(R.projectionMatrix),Y0(xe),q0(xe),Dt.setValue(Y,"projectionMatrix",xe)):Dt.setValue(Y,"projectionMatrix",R.projectionMatrix),Dt.setValue(Y,"viewMatrix",R.matrixWorldInverse);const Yn=Dt.map.cameraPosition;Yn!==void 0&&Yn.setValue(Y,Ie.setFromMatrixPosition(R.matrixWorld)),ct.logarithmicDepthBuffer&&Dt.setValue(Y,"logDepthBufFC",2/(Math.log(R.far+1)/Math.LN2)),(ne.isMeshPhongMaterial||ne.isMeshToonMaterial||ne.isMeshLambertMaterial||ne.isMeshBasicMaterial||ne.isMeshStandardMaterial||ne.isShaderMaterial)&&Dt.setValue(Y,"isOrthographic",R.isOrthographicCamera===!0),A!==R&&(A=R,$t=!0,vi=!0)}if(j.isSkinnedMesh){Dt.setOptional(Y,j,"bindMatrix"),Dt.setOptional(Y,j,"bindMatrixInverse");const yn=j.skeleton;yn&&(yn.boneTexture===null&&yn.computeBoneTexture(),Dt.setValue(Y,"boneTexture",yn.boneTexture,D))}j.isBatchedMesh&&(Dt.setOptional(Y,j,"batchingTexture"),Dt.setValue(Y,"batchingTexture",j._matricesTexture,D),Dt.setOptional(Y,j,"batchingIdTexture"),Dt.setValue(Y,"batchingIdTexture",j._indirectTexture,D),Dt.setOptional(Y,j,"batchingColorTexture"),j._colorsTexture!==null&&Dt.setValue(Y,"batchingColorTexture",j._colorsTexture,D));const Pi=te.morphAttributes;if((Pi.position!==void 0||Pi.normal!==void 0||Pi.color!==void 0)&&et.update(j,te,cn),($t||je.receiveShadow!==j.receiveShadow)&&(je.receiveShadow=j.receiveShadow,Dt.setValue(Y,"receiveShadow",j.receiveShadow)),ne.isMeshGouraudMaterial&&ne.envMap!==null&&(jn.envMap.value=Be,jn.flipEnvMap.value=Be.isCubeTexture&&Be.isRenderTargetTexture===!1?-1:1),ne.isMeshStandardMaterial&&ne.envMap===null&&X.environment!==null&&(jn.envMapIntensity.value=X.environmentIntensity),$t&&(Dt.setValue(Y,"toneMappingExposure",C.toneMappingExposure),je.needsLights&&ua(jn,vi),we&&ne.fog===!0&&Ce.refreshFogUniforms(jn,we),Ce.refreshMaterialUniforms(jn,ne,k,oe,g.state.transmissionRenderTarget[R.id]),Yl.upload(Y,aa(je),jn,D)),ne.isShaderMaterial&&ne.uniformsNeedUpdate===!0&&(Yl.upload(Y,aa(je),jn,D),ne.uniformsNeedUpdate=!1),ne.isSpriteMaterial&&Dt.setValue(Y,"center",j.center),Dt.setValue(Y,"modelViewMatrix",j.modelViewMatrix),Dt.setValue(Y,"normalMatrix",j.normalMatrix),Dt.setValue(Y,"modelMatrix",j.matrixWorld),ne.isShaderMaterial||ne.isRawShaderMaterial){const yn=ne.uniformsGroups;for(let Yn=0,Ln=yn.length;Yn<Ln;Yn++){const ca=yn[Yn];V.update(ca,cn),V.bind(ca,cn)}}return cn}function ua(R,X){R.ambientLightColor.needsUpdate=X,R.lightProbe.needsUpdate=X,R.directionalLights.needsUpdate=X,R.directionalLightShadows.needsUpdate=X,R.pointLights.needsUpdate=X,R.pointLightShadows.needsUpdate=X,R.spotLights.needsUpdate=X,R.spotLightShadows.needsUpdate=X,R.rectAreaLights.needsUpdate=X,R.hemisphereLights.needsUpdate=X}function su(R){return R.isMeshLambertMaterial||R.isMeshToonMaterial||R.isMeshPhongMaterial||R.isMeshStandardMaterial||R.isShadowMaterial||R.isShaderMaterial&&R.lights===!0}this.getActiveCubeFace=function(){return F},this.getActiveMipmapLevel=function(){return I},this.getRenderTarget=function(){return B},this.setRenderTargetTextures=function(R,X,te){Ye.get(R.texture).__webglTexture=X,Ye.get(R.depthTexture).__webglTexture=te;const ne=Ye.get(R);ne.__hasExternalTextures=!0,ne.__autoAllocateDepthBuffer=te===void 0,ne.__autoAllocateDepthBuffer||ht.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),ne.__useRenderToTexture=!1)},this.setRenderTargetFramebuffer=function(R,X){const te=Ye.get(R);te.__webglFramebuffer=X,te.__useDefaultFramebuffer=X===void 0},this.setRenderTarget=function(R,X=0,te=0){B=R,F=X,I=te;let ne=!0,j=null,we=!1,Me=!1;if(R){const Be=Ye.get(R);if(Be.__useDefaultFramebuffer!==void 0)$e.bindFramebuffer(Y.FRAMEBUFFER,null),ne=!1;else if(Be.__webglFramebuffer===void 0)D.setupRenderTarget(R);else if(Be.__hasExternalTextures)D.rebindTextures(R,Ye.get(R.texture).__webglTexture,Ye.get(R.depthTexture).__webglTexture);else if(R.depthBuffer){const We=R.depthTexture;if(Be.__boundDepthTexture!==We){if(We!==null&&Ye.has(We)&&(R.width!==We.image.width||R.height!==We.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");D.setupDepthRenderbuffer(R)}}const tt=R.texture;(tt.isData3DTexture||tt.isDataArrayTexture||tt.isCompressedArrayTexture)&&(Me=!0);const it=Ye.get(R).__webglFramebuffer;R.isWebGLCubeRenderTarget?(Array.isArray(it[X])?j=it[X][te]:j=it[X],we=!0):R.samples>0&&D.useMultisampledRTT(R)===!1?j=Ye.get(R).__webglMultisampledFramebuffer:Array.isArray(it)?j=it[te]:j=it,O.copy(R.viewport),se.copy(R.scissor),J=R.scissorTest}else O.copy(N).multiplyScalar(k).floor(),se.copy(ie).multiplyScalar(k).floor(),J=De;if($e.bindFramebuffer(Y.FRAMEBUFFER,j)&&ne&&$e.drawBuffers(R,j),$e.viewport(O),$e.scissor(se),$e.setScissorTest(J),we){const Be=Ye.get(R.texture);Y.framebufferTexture2D(Y.FRAMEBUFFER,Y.COLOR_ATTACHMENT0,Y.TEXTURE_CUBE_MAP_POSITIVE_X+X,Be.__webglTexture,te)}else if(Me){const Be=Ye.get(R.texture),tt=X||0;Y.framebufferTextureLayer(Y.FRAMEBUFFER,Y.COLOR_ATTACHMENT0,Be.__webglTexture,te||0,tt)}b=-1},this.readRenderTargetPixels=function(R,X,te,ne,j,we,Me){if(!(R&&R.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Ge=Ye.get(R).__webglFramebuffer;if(R.isWebGLCubeRenderTarget&&Me!==void 0&&(Ge=Ge[Me]),Ge){$e.bindFramebuffer(Y.FRAMEBUFFER,Ge);try{const Be=R.texture,tt=Be.format,it=Be.type;if(!ct.textureFormatReadable(tt)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!ct.textureTypeReadable(it)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}X>=0&&X<=R.width-ne&&te>=0&&te<=R.height-j&&Y.readPixels(X,te,ne,j,rt.convert(tt),rt.convert(it),we)}finally{const Be=B!==null?Ye.get(B).__webglFramebuffer:null;$e.bindFramebuffer(Y.FRAMEBUFFER,Be)}}},this.readRenderTargetPixelsAsync=async function(R,X,te,ne,j,we,Me){if(!(R&&R.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Ge=Ye.get(R).__webglFramebuffer;if(R.isWebGLCubeRenderTarget&&Me!==void 0&&(Ge=Ge[Me]),Ge){const Be=R.texture,tt=Be.format,it=Be.type;if(!ct.textureFormatReadable(tt))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!ct.textureTypeReadable(it))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");if(X>=0&&X<=R.width-ne&&te>=0&&te<=R.height-j){$e.bindFramebuffer(Y.FRAMEBUFFER,Ge);const We=Y.createBuffer();Y.bindBuffer(Y.PIXEL_PACK_BUFFER,We),Y.bufferData(Y.PIXEL_PACK_BUFFER,we.byteLength,Y.STREAM_READ),Y.readPixels(X,te,ne,j,rt.convert(tt),rt.convert(it),0);const _t=B!==null?Ye.get(B).__webglFramebuffer:null;$e.bindFramebuffer(Y.FRAMEBUFFER,_t);const Et=Y.fenceSync(Y.SYNC_GPU_COMMANDS_COMPLETE,0);return Y.flush(),await j0(Y,Et,4),Y.bindBuffer(Y.PIXEL_PACK_BUFFER,We),Y.getBufferSubData(Y.PIXEL_PACK_BUFFER,0,we),Y.deleteBuffer(We),Y.deleteSync(Et),we}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")}},this.copyFramebufferToTexture=function(R,X=null,te=0){R.isTexture!==!0&&(Zo("WebGLRenderer: copyFramebufferToTexture function signature has changed."),X=arguments[0]||null,R=arguments[1]);const ne=Math.pow(2,-te),j=Math.floor(R.image.width*ne),we=Math.floor(R.image.height*ne),Me=X!==null?X.x:0,Ge=X!==null?X.y:0;D.setTexture2D(R,0),Y.copyTexSubImage2D(Y.TEXTURE_2D,te,0,0,Me,Ge,j,we),$e.unbindTexture()},this.copyTextureToTexture=function(R,X,te=null,ne=null,j=0){R.isTexture!==!0&&(Zo("WebGLRenderer: copyTextureToTexture function signature has changed."),ne=arguments[0]||null,R=arguments[1],X=arguments[2],j=arguments[3]||0,te=null);let we,Me,Ge,Be,tt,it,We,_t,Et;const gt=R.isCompressedTexture?R.mipmaps[j]:R.image;te!==null?(we=te.max.x-te.min.x,Me=te.max.y-te.min.y,Ge=te.isBox3?te.max.z-te.min.z:1,Be=te.min.x,tt=te.min.y,it=te.isBox3?te.min.z:0):(we=gt.width,Me=gt.height,Ge=gt.depth||1,Be=0,tt=0,it=0),ne!==null?(We=ne.x,_t=ne.y,Et=ne.z):(We=0,_t=0,Et=0);const un=rt.convert(X.format),ot=rt.convert(X.type);let je;X.isData3DTexture?(D.setTexture3D(X,0),je=Y.TEXTURE_3D):X.isDataArrayTexture||X.isCompressedArrayTexture?(D.setTexture2DArray(X,0),je=Y.TEXTURE_2D_ARRAY):(D.setTexture2D(X,0),je=Y.TEXTURE_2D),Y.pixelStorei(Y.UNPACK_FLIP_Y_WEBGL,X.flipY),Y.pixelStorei(Y.UNPACK_PREMULTIPLY_ALPHA_WEBGL,X.premultiplyAlpha),Y.pixelStorei(Y.UNPACK_ALIGNMENT,X.unpackAlignment);const ii=Y.getParameter(Y.UNPACK_ROW_LENGTH),St=Y.getParameter(Y.UNPACK_IMAGE_HEIGHT),cn=Y.getParameter(Y.UNPACK_SKIP_PIXELS),ri=Y.getParameter(Y.UNPACK_SKIP_ROWS),$t=Y.getParameter(Y.UNPACK_SKIP_IMAGES);Y.pixelStorei(Y.UNPACK_ROW_LENGTH,gt.width),Y.pixelStorei(Y.UNPACK_IMAGE_HEIGHT,gt.height),Y.pixelStorei(Y.UNPACK_SKIP_PIXELS,Be),Y.pixelStorei(Y.UNPACK_SKIP_ROWS,tt),Y.pixelStorei(Y.UNPACK_SKIP_IMAGES,it);const vi=R.isDataArrayTexture||R.isData3DTexture,Dt=X.isDataArrayTexture||X.isData3DTexture;if(R.isRenderTargetTexture||R.isDepthTexture){const jn=Ye.get(R),Pi=Ye.get(X),yn=Ye.get(jn.__renderTarget),Yn=Ye.get(Pi.__renderTarget);$e.bindFramebuffer(Y.READ_FRAMEBUFFER,yn.__webglFramebuffer),$e.bindFramebuffer(Y.DRAW_FRAMEBUFFER,Yn.__webglFramebuffer);for(let Ln=0;Ln<Ge;Ln++)vi&&Y.framebufferTextureLayer(Y.READ_FRAMEBUFFER,Y.COLOR_ATTACHMENT0,Ye.get(R).__webglTexture,j,it+Ln),R.isDepthTexture?(Dt&&Y.framebufferTextureLayer(Y.DRAW_FRAMEBUFFER,Y.COLOR_ATTACHMENT0,Ye.get(X).__webglTexture,j,Et+Ln),Y.blitFramebuffer(Be,tt,we,Me,We,_t,we,Me,Y.DEPTH_BUFFER_BIT,Y.NEAREST)):Dt?Y.copyTexSubImage3D(je,j,We,_t,Et+Ln,Be,tt,we,Me):Y.copyTexSubImage2D(je,j,We,_t,Et+Ln,Be,tt,we,Me);$e.bindFramebuffer(Y.READ_FRAMEBUFFER,null),$e.bindFramebuffer(Y.DRAW_FRAMEBUFFER,null)}else Dt?R.isDataTexture||R.isData3DTexture?Y.texSubImage3D(je,j,We,_t,Et,we,Me,Ge,un,ot,gt.data):X.isCompressedArrayTexture?Y.compressedTexSubImage3D(je,j,We,_t,Et,we,Me,Ge,un,gt.data):Y.texSubImage3D(je,j,We,_t,Et,we,Me,Ge,un,ot,gt):R.isDataTexture?Y.texSubImage2D(Y.TEXTURE_2D,j,We,_t,we,Me,un,ot,gt.data):R.isCompressedTexture?Y.compressedTexSubImage2D(Y.TEXTURE_2D,j,We,_t,gt.width,gt.height,un,gt.data):Y.texSubImage2D(Y.TEXTURE_2D,j,We,_t,we,Me,un,ot,gt);Y.pixelStorei(Y.UNPACK_ROW_LENGTH,ii),Y.pixelStorei(Y.UNPACK_IMAGE_HEIGHT,St),Y.pixelStorei(Y.UNPACK_SKIP_PIXELS,cn),Y.pixelStorei(Y.UNPACK_SKIP_ROWS,ri),Y.pixelStorei(Y.UNPACK_SKIP_IMAGES,$t),j===0&&X.generateMipmaps&&Y.generateMipmap(je),$e.unbindTexture()},this.copyTextureToTexture3D=function(R,X,te=null,ne=null,j=0){return R.isTexture!==!0&&(Zo("WebGLRenderer: copyTextureToTexture3D function signature has changed."),te=arguments[0]||null,ne=arguments[1]||null,R=arguments[2],X=arguments[3],j=arguments[4]||0),Zo('WebGLRenderer: copyTextureToTexture3D function has been deprecated. Use "copyTextureToTexture" instead.'),this.copyTextureToTexture(R,X,te,ne,j)},this.initRenderTarget=function(R){Ye.get(R).__webglFramebuffer===void 0&&D.setupRenderTarget(R)},this.initTexture=function(R){R.isCubeTexture?D.setTextureCube(R,0):R.isData3DTexture?D.setTexture3D(R,0):R.isDataArrayTexture||R.isCompressedArrayTexture?D.setTexture2DArray(R,0):D.setTexture2D(R,0),$e.unbindTexture()},this.resetState=function(){F=0,I=0,B=null,$e.reset(),Tt.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Yi}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;const t=this.getContext();t.drawingBufferColorspace=yt._getDrawingBufferColorSpace(e),t.unpackColorSpace=yt._getUnpackColorSpace()}}class rT extends Yt{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Ci,this.environmentIntensity=1,this.environmentRotation=new Ci,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}}class sT{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e!==void 0?e.length/t:0,this.usage=fd,this.updateRanges=[],this.version=0,this.uuid=Rr()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,r){e*=this.stride,r*=t.stride;for(let a=0,l=this.stride;a<l;a++)this.array[e+a]=t.array[r+a];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Rr()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);const t=new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),r=new this.constructor(t,this.stride);return r.setUsage(this.usage),r}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){return e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Rr()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer))),{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}}const En=new G;class Kl{constructor(e,t,r,a=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=e,this.itemSize=t,this.offset=r,this.normalized=a}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,r=this.data.count;t<r;t++)En.fromBufferAttribute(this,t),En.applyMatrix4(e),this.setXYZ(t,En.x,En.y,En.z);return this}applyNormalMatrix(e){for(let t=0,r=this.count;t<r;t++)En.fromBufferAttribute(this,t),En.applyNormalMatrix(e),this.setXYZ(t,En.x,En.y,En.z);return this}transformDirection(e){for(let t=0,r=this.count;t<r;t++)En.fromBufferAttribute(this,t),En.transformDirection(e),this.setXYZ(t,En.x,En.y,En.z);return this}getComponent(e,t){let r=this.array[e*this.data.stride+this.offset+t];return this.normalized&&(r=wi(r,this.array)),r}setComponent(e,t,r){return this.normalized&&(r=bt(r,this.array)),this.data.array[e*this.data.stride+this.offset+t]=r,this}setX(e,t){return this.normalized&&(t=bt(t,this.array)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=bt(t,this.array)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=bt(t,this.array)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=bt(t,this.array)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=wi(t,this.array)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=wi(t,this.array)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=wi(t,this.array)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=wi(t,this.array)),t}setXY(e,t,r){return e=e*this.data.stride+this.offset,this.normalized&&(t=bt(t,this.array),r=bt(r,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=r,this}setXYZ(e,t,r,a){return e=e*this.data.stride+this.offset,this.normalized&&(t=bt(t,this.array),r=bt(r,this.array),a=bt(a,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=r,this.data.array[e+2]=a,this}setXYZW(e,t,r,a,l){return e=e*this.data.stride+this.offset,this.normalized&&(t=bt(t,this.array),r=bt(r,this.array),a=bt(a,this.array),l=bt(l,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=r,this.data.array[e+2]=a,this.data.array[e+3]=l,this}clone(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");const t=[];for(let r=0;r<this.count;r++){const a=r*this.data.stride+this.offset;for(let l=0;l<this.itemSize;l++)t.push(this.data.array[a+l])}return new gi(new this.array.constructor(t),this.itemSize,this.normalized)}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.clone(e)),new Kl(e.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");const t=[];for(let r=0;r<this.count;r++){const a=r*this.data.stride+this.offset;for(let l=0;l<this.itemSize;l++)t.push(this.data.array[a+l])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:t,normalized:this.normalized}}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}}class n_ extends Dr{static get type(){return"SpriteMaterial"}constructor(e){super(),this.isSpriteMaterial=!0,this.color=new pt(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.rotation=e.rotation,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}}let Xs;const Yo=new G,js=new G,Ys=new G,qs=new qe,qo=new qe,i_=new Lt,Ul=new G,$o=new G,Il=new G,rg=new qe,_f=new qe,sg=new qe;class oT extends Yt{constructor(e=new n_){if(super(),this.isSprite=!0,this.type="Sprite",Xs===void 0){Xs=new bn;const t=new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),r=new sT(t,5);Xs.setIndex([0,1,2,0,2,3]),Xs.setAttribute("position",new Kl(r,3,0,!1)),Xs.setAttribute("uv",new Kl(r,2,3,!1))}this.geometry=Xs,this.material=e,this.center=new qe(.5,.5)}raycast(e,t){e.camera===null&&console.error('THREE.Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'),js.setFromMatrixScale(this.matrixWorld),i_.copy(e.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(e.camera.matrixWorldInverse,this.matrixWorld),Ys.setFromMatrixPosition(this.modelViewMatrix),e.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&js.multiplyScalar(-Ys.z);const r=this.material.rotation;let a,l;r!==0&&(l=Math.cos(r),a=Math.sin(r));const c=this.center;Nl(Ul.set(-.5,-.5,0),Ys,c,js,a,l),Nl($o.set(.5,-.5,0),Ys,c,js,a,l),Nl(Il.set(.5,.5,0),Ys,c,js,a,l),rg.set(0,0),_f.set(1,0),sg.set(1,1);let f=e.ray.intersectTriangle(Ul,$o,Il,!1,Yo);if(f===null&&(Nl($o.set(-.5,.5,0),Ys,c,js,a,l),_f.set(0,1),f=e.ray.intersectTriangle(Ul,Il,$o,!1,Yo),f===null))return;const h=e.ray.origin.distanceTo(Yo);h<e.near||h>e.far||t.push({distance:h,point:Yo.clone(),uv:ni.getInterpolation(Yo,Ul,$o,Il,rg,_f,sg,new qe),face:null,object:this})}copy(e,t){return super.copy(e,t),e.center!==void 0&&this.center.copy(e.center),this.material=e.material,this}}function Nl(s,e,t,r,a,l){qs.subVectors(s,t).addScalar(.5).multiply(r),a!==void 0?(qo.x=l*qs.x-a*qs.y,qo.y=a*qs.x+l*qs.y):qo.copy(qs),s.copy(e),s.x+=qo.x,s.y+=qo.y,s.applyMatrix4(i_)}class r_ extends Dr{static get type(){return"LineBasicMaterial"}constructor(e){super(),this.isLineBasicMaterial=!0,this.color=new pt(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}}const Zl=new G,Ql=new G,og=new Lt,Ko=new nu,Fl=new ra,vf=new G,ag=new G;class aT extends Yt{constructor(e=new bn,t=new r_){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,r=[0];for(let a=1,l=t.count;a<l;a++)Zl.fromBufferAttribute(t,a-1),Ql.fromBufferAttribute(t,a),r[a]=r[a-1],r[a]+=Zl.distanceTo(Ql);e.setAttribute("lineDistance",new on(r,1))}else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(e,t){const r=this.geometry,a=this.matrixWorld,l=e.params.Line.threshold,c=r.drawRange;if(r.boundingSphere===null&&r.computeBoundingSphere(),Fl.copy(r.boundingSphere),Fl.applyMatrix4(a),Fl.radius+=l,e.ray.intersectsSphere(Fl)===!1)return;og.copy(a).invert(),Ko.copy(e.ray).applyMatrix4(og);const f=l/((this.scale.x+this.scale.y+this.scale.z)/3),h=f*f,m=this.isLineSegments?2:1,_=r.index,y=r.attributes.position;if(_!==null){const S=Math.max(0,c.start),M=Math.min(_.count,c.start+c.count);for(let T=S,v=M-1;T<v;T+=m){const g=_.getX(T),P=_.getX(T+1),L=Ol(this,e,Ko,h,g,P);L&&t.push(L)}if(this.isLineLoop){const T=_.getX(M-1),v=_.getX(S),g=Ol(this,e,Ko,h,T,v);g&&t.push(g)}}else{const S=Math.max(0,c.start),M=Math.min(y.count,c.start+c.count);for(let T=S,v=M-1;T<v;T+=m){const g=Ol(this,e,Ko,h,T,T+1);g&&t.push(g)}if(this.isLineLoop){const T=Ol(this,e,Ko,h,M-1,S);T&&t.push(T)}}}updateMorphTargets(){const t=this.geometry.morphAttributes,r=Object.keys(t);if(r.length>0){const a=t[r[0]];if(a!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let l=0,c=a.length;l<c;l++){const f=a[l].name||String(l);this.morphTargetInfluences.push(0),this.morphTargetDictionary[f]=l}}}}}function Ol(s,e,t,r,a,l){const c=s.geometry.attributes.position;if(Zl.fromBufferAttribute(c,a),Ql.fromBufferAttribute(c,l),t.distanceSqToSegment(Zl,Ql,vf,ag)>r)return;vf.applyMatrix4(s.matrixWorld);const h=e.ray.origin.distanceTo(vf);if(!(h<e.near||h>e.far))return{distance:h,point:ag.clone().applyMatrix4(s.matrixWorld),index:a,face:null,faceIndex:null,barycoord:null,object:s}}class s_ extends Dr{static get type(){return"PointsMaterial"}constructor(e){super(),this.isPointsMaterial=!0,this.color=new pt(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}}const lg=new Lt,pd=new nu,zl=new ra,kl=new G;class lT extends Yt{constructor(e=new bn,t=new s_){super(),this.isPoints=!0,this.type="Points",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}raycast(e,t){const r=this.geometry,a=this.matrixWorld,l=e.params.Points.threshold,c=r.drawRange;if(r.boundingSphere===null&&r.computeBoundingSphere(),zl.copy(r.boundingSphere),zl.applyMatrix4(a),zl.radius+=l,e.ray.intersectsSphere(zl)===!1)return;lg.copy(a).invert(),pd.copy(e.ray).applyMatrix4(lg);const f=l/((this.scale.x+this.scale.y+this.scale.z)/3),h=f*f,m=r.index,x=r.attributes.position;if(m!==null){const y=Math.max(0,c.start),S=Math.min(m.count,c.start+c.count);for(let M=y,T=S;M<T;M++){const v=m.getX(M);kl.fromBufferAttribute(x,v),ug(kl,v,h,a,e,t,this)}}else{const y=Math.max(0,c.start),S=Math.min(x.count,c.start+c.count);for(let M=y,T=S;M<T;M++)kl.fromBufferAttribute(x,M),ug(kl,M,h,a,e,t,this)}}updateMorphTargets(){const t=this.geometry.morphAttributes,r=Object.keys(t);if(r.length>0){const a=t[r[0]];if(a!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let l=0,c=a.length;l<c;l++){const f=a[l].name||String(l);this.morphTargetInfluences.push(0),this.morphTargetDictionary[f]=l}}}}}function ug(s,e,t,r,a,l,c){const f=pd.distanceSqToPoint(s);if(f<t){const h=new G;pd.closestPointToPoint(s,h),h.applyMatrix4(r);const m=a.ray.origin.distanceTo(h);if(m<a.near||m>a.far)return;l.push({distance:m,distanceToRay:Math.sqrt(f),point:h,index:e,face:null,faceIndex:null,barycoord:null,object:c})}}class uT extends _n{constructor(e,t,r,a,l,c,f,h,m){super(e,t,r,a,l,c,f,h,m),this.isCanvasTexture=!0,this.needsUpdate=!0}}class Ad extends bn{constructor(e=[],t=[],r=1,a=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:e,indices:t,radius:r,detail:a};const l=[],c=[];f(a),m(r),_(),this.setAttribute("position",new on(l,3)),this.setAttribute("normal",new on(l.slice(),3)),this.setAttribute("uv",new on(c,2)),a===0?this.computeVertexNormals():this.normalizeNormals();function f(P){const L=new G,C=new G,W=new G;for(let F=0;F<t.length;F+=3)S(t[F+0],L),S(t[F+1],C),S(t[F+2],W),h(L,C,W,P)}function h(P,L,C,W){const F=W+1,I=[];for(let B=0;B<=F;B++){I[B]=[];const b=P.clone().lerp(C,B/F),A=L.clone().lerp(C,B/F),O=F-B;for(let se=0;se<=O;se++)se===0&&B===F?I[B][se]=b:I[B][se]=b.clone().lerp(A,se/O)}for(let B=0;B<F;B++)for(let b=0;b<2*(F-B)-1;b++){const A=Math.floor(b/2);b%2===0?(y(I[B][A+1]),y(I[B+1][A]),y(I[B][A])):(y(I[B][A+1]),y(I[B+1][A+1]),y(I[B+1][A]))}}function m(P){const L=new G;for(let C=0;C<l.length;C+=3)L.x=l[C+0],L.y=l[C+1],L.z=l[C+2],L.normalize().multiplyScalar(P),l[C+0]=L.x,l[C+1]=L.y,l[C+2]=L.z}function _(){const P=new G;for(let L=0;L<l.length;L+=3){P.x=l[L+0],P.y=l[L+1],P.z=l[L+2];const C=v(P)/2/Math.PI+.5,W=g(P)/Math.PI+.5;c.push(C,1-W)}M(),x()}function x(){for(let P=0;P<c.length;P+=6){const L=c[P+0],C=c[P+2],W=c[P+4],F=Math.max(L,C,W),I=Math.min(L,C,W);F>.9&&I<.1&&(L<.2&&(c[P+0]+=1),C<.2&&(c[P+2]+=1),W<.2&&(c[P+4]+=1))}}function y(P){l.push(P.x,P.y,P.z)}function S(P,L){const C=P*3;L.x=e[C+0],L.y=e[C+1],L.z=e[C+2]}function M(){const P=new G,L=new G,C=new G,W=new G,F=new qe,I=new qe,B=new qe;for(let b=0,A=0;b<l.length;b+=9,A+=6){P.set(l[b+0],l[b+1],l[b+2]),L.set(l[b+3],l[b+4],l[b+5]),C.set(l[b+6],l[b+7],l[b+8]),F.set(c[A+0],c[A+1]),I.set(c[A+2],c[A+3]),B.set(c[A+4],c[A+5]),W.copy(P).add(L).add(C).divideScalar(3);const O=v(W);T(F,A+0,P,O),T(I,A+2,L,O),T(B,A+4,C,O)}}function T(P,L,C,W){W<0&&P.x===1&&(c[L]=P.x-1),C.x===0&&C.z===0&&(c[L]=W/2/Math.PI+.5)}function v(P){return Math.atan2(P.z,-P.x)}function g(P){return Math.atan2(-P.y,Math.sqrt(P.x*P.x+P.z*P.z))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Ad(e.vertices,e.indices,e.radius,e.details)}}class Cd extends Ad{constructor(e=1,t=0){const r=[1,0,0,-1,0,0,0,1,0,0,-1,0,0,0,1,0,0,-1],a=[0,2,4,0,4,3,0,3,5,0,5,2,1,2,5,1,5,3,1,3,4,1,4,2];super(r,a,e,t),this.type="OctahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new Cd(e.radius,e.detail)}}class Rd extends bn{constructor(e=.5,t=1,r=32,a=1,l=0,c=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:e,outerRadius:t,thetaSegments:r,phiSegments:a,thetaStart:l,thetaLength:c},r=Math.max(3,r),a=Math.max(1,a);const f=[],h=[],m=[],_=[];let x=e;const y=(t-e)/a,S=new G,M=new qe;for(let T=0;T<=a;T++){for(let v=0;v<=r;v++){const g=l+v/r*c;S.x=x*Math.cos(g),S.y=x*Math.sin(g),h.push(S.x,S.y,S.z),m.push(0,0,1),M.x=(S.x/t+1)/2,M.y=(S.y/t+1)/2,_.push(M.x,M.y)}x+=y}for(let T=0;T<a;T++){const v=T*(r+1);for(let g=0;g<r;g++){const P=g+v,L=P,C=P+r+1,W=P+r+2,F=P+1;f.push(L,C,F),f.push(C,W,F)}}this.setIndex(f),this.setAttribute("position",new on(h,3)),this.setAttribute("normal",new on(m,3)),this.setAttribute("uv",new on(_,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Rd(e.innerRadius,e.outerRadius,e.thetaSegments,e.phiSegments,e.thetaStart,e.thetaLength)}}class ta extends bn{constructor(e=1,t=32,r=16,a=0,l=Math.PI*2,c=0,f=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:r,phiStart:a,phiLength:l,thetaStart:c,thetaLength:f},t=Math.max(3,Math.floor(t)),r=Math.max(2,Math.floor(r));const h=Math.min(c+f,Math.PI);let m=0;const _=[],x=new G,y=new G,S=[],M=[],T=[],v=[];for(let g=0;g<=r;g++){const P=[],L=g/r;let C=0;g===0&&c===0?C=.5/t:g===r&&h===Math.PI&&(C=-.5/t);for(let W=0;W<=t;W++){const F=W/t;x.x=-e*Math.cos(a+F*l)*Math.sin(c+L*f),x.y=e*Math.cos(c+L*f),x.z=e*Math.sin(a+F*l)*Math.sin(c+L*f),M.push(x.x,x.y,x.z),y.copy(x).normalize(),T.push(y.x,y.y,y.z),v.push(F+C,1-L),P.push(m++)}_.push(P)}for(let g=0;g<r;g++)for(let P=0;P<t;P++){const L=_[g][P+1],C=_[g][P],W=_[g+1][P],F=_[g+1][P+1];(g!==0||c>0)&&S.push(L,C,F),(g!==r-1||h<Math.PI)&&S.push(C,W,F)}this.setIndex(S),this.setAttribute("position",new on(M,3)),this.setAttribute("normal",new on(T,3)),this.setAttribute("uv",new on(v,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new ta(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}}class cT extends Dr{static get type(){return"MeshPhongMaterial"}constructor(e){super(),this.isMeshPhongMaterial=!0,this.color=new pt(16777215),this.specular=new pt(1118481),this.shininess=30,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new pt(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Og,this.normalScale=new qe(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Ci,this.combine=_d,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.specular.copy(e.specular),this.shininess=e.shininess,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}const cg={enabled:!1,files:{},add:function(s,e){this.enabled!==!1&&(this.files[s]=e)},get:function(s){if(this.enabled!==!1)return this.files[s]},remove:function(s){delete this.files[s]},clear:function(){this.files={}}};class fT{constructor(e,t,r){const a=this;let l=!1,c=0,f=0,h;const m=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=r,this.itemStart=function(_){f++,l===!1&&a.onStart!==void 0&&a.onStart(_,c,f),l=!0},this.itemEnd=function(_){c++,a.onProgress!==void 0&&a.onProgress(_,c,f),c===f&&(l=!1,a.onLoad!==void 0&&a.onLoad())},this.itemError=function(_){a.onError!==void 0&&a.onError(_)},this.resolveURL=function(_){return h?h(_):_},this.setURLModifier=function(_){return h=_,this},this.addHandler=function(_,x){return m.push(_,x),this},this.removeHandler=function(_){const x=m.indexOf(_);return x!==-1&&m.splice(x,2),this},this.getHandler=function(_){for(let x=0,y=m.length;x<y;x+=2){const S=m[x],M=m[x+1];if(S.global&&(S.lastIndex=0),S.test(_))return M}return null}}}const dT=new fT;class bd{constructor(e){this.manager=e!==void 0?e:dT,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={}}load(){}loadAsync(e,t){const r=this;return new Promise(function(a,l){r.load(e,a,t,l)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}}bd.DEFAULT_MATERIAL_NAME="__DEFAULT";class hT extends bd{constructor(e){super(e)}load(e,t,r,a){this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const l=this,c=cg.get(e);if(c!==void 0)return l.manager.itemStart(e),setTimeout(function(){t&&t(c),l.manager.itemEnd(e)},0),c;const f=ea("img");function h(){_(),cg.add(e,this),t&&t(this),l.manager.itemEnd(e)}function m(x){_(),a&&a(x),l.manager.itemError(e),l.manager.itemEnd(e)}function _(){f.removeEventListener("load",h,!1),f.removeEventListener("error",m,!1)}return f.addEventListener("load",h,!1),f.addEventListener("error",m,!1),e.slice(0,5)!=="data:"&&this.crossOrigin!==void 0&&(f.crossOrigin=this.crossOrigin),l.manager.itemStart(e),f.src=e,f}}class pT extends bd{constructor(e){super(e)}load(e,t,r,a){const l=new _n,c=new hT(this.manager);return c.setCrossOrigin(this.crossOrigin),c.setPath(this.path),c.load(e,function(f){l.image=f,l.needsUpdate=!0,t!==void 0&&t(l)},r,a),l}}class o_ extends Yt{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new pt(e),this.intensity=t}dispose(){}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){const t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,this.groundColor!==void 0&&(t.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(t.object.distance=this.distance),this.angle!==void 0&&(t.object.angle=this.angle),this.decay!==void 0&&(t.object.decay=this.decay),this.penumbra!==void 0&&(t.object.penumbra=this.penumbra),this.shadow!==void 0&&(t.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(t.object.target=this.target.uuid),t}}const xf=new Lt,fg=new G,dg=new G;class mT{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new qe(512,512),this.map=null,this.mapPass=null,this.matrix=new Lt,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Td,this._frameExtents=new qe(1,1),this._viewportCount=1,this._viewports=[new Vt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){const t=this.camera,r=this.matrix;fg.setFromMatrixPosition(e.matrixWorld),t.position.copy(fg),dg.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(dg),t.updateMatrixWorld(),xf.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(xf),r.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),r.multiply(xf)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){const e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}}class gT extends mT{constructor(){super(new Kg(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class _T extends o_{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Yt.DEFAULT_UP),this.updateMatrix(),this.target=new Yt,this.shadow=new gT}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}}class vT extends o_{constructor(e,t){super(e,t),this.isAmbientLight=!0,this.type="AmbientLight"}}class hg{constructor(e=1,t=0,r=0){return this.radius=e,this.phi=t,this.theta=r,this}set(e,t,r){return this.radius=e,this.phi=t,this.theta=r,this}copy(e){return this.radius=e.radius,this.phi=e.phi,this.theta=e.theta,this}makeSafe(){return this.phi=Math.max(1e-6,Math.min(Math.PI-1e-6,this.phi)),this}setFromVector3(e){return this.setFromCartesianCoords(e.x,e.y,e.z)}setFromCartesianCoords(e,t,r){return this.radius=Math.sqrt(e*e+t*t+r*r),this.radius===0?(this.theta=0,this.phi=0):(this.theta=Math.atan2(e,r),this.phi=Math.acos(Cn(t/this.radius,-1,1))),this}clone(){return new this.constructor().copy(this)}}class xT extends os{constructor(e,t=null){super(),this.object=e,this.domElement=t,this.enabled=!0,this.state=-1,this.keys={},this.mouseButtons={LEFT:null,MIDDLE:null,RIGHT:null},this.touches={ONE:null,TWO:null}}connect(){}disconnect(){}dispose(){}update(){}}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:gd}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=gd);const pg={type:"change"},Pd={type:"start"},a_={type:"end"},Bl=new nu,mg=new Er,yT=Math.cos(70*W0.DEG2RAD),Qt=new G,zn=2*Math.PI,Pt={NONE:-1,ROTATE:0,DOLLY:1,PAN:2,TOUCH_ROTATE:3,TOUCH_PAN:4,TOUCH_DOLLY_PAN:5,TOUCH_DOLLY_ROTATE:6},yf=1e-6;class ST extends xT{constructor(e,t=null){super(e,t),this.state=Pt.NONE,this.enabled=!0,this.target=new G,this.cursor=new G,this.minDistance=0,this.maxDistance=1/0,this.minZoom=0,this.maxZoom=1/0,this.minTargetRadius=0,this.maxTargetRadius=1/0,this.minPolarAngle=0,this.maxPolarAngle=Math.PI,this.minAzimuthAngle=-1/0,this.maxAzimuthAngle=1/0,this.enableDamping=!1,this.dampingFactor=.05,this.enableZoom=!0,this.zoomSpeed=1,this.enableRotate=!0,this.rotateSpeed=1,this.enablePan=!0,this.panSpeed=1,this.screenSpacePanning=!0,this.keyPanSpeed=7,this.zoomToCursor=!1,this.autoRotate=!1,this.autoRotateSpeed=2,this.keys={LEFT:"ArrowLeft",UP:"ArrowUp",RIGHT:"ArrowRight",BOTTOM:"ArrowDown"},this.mouseButtons={LEFT:wr.ROTATE,MIDDLE:wr.DOLLY,RIGHT:wr.PAN},this.touches={ONE:Ks.ROTATE,TWO:Ks.DOLLY_PAN},this.target0=this.target.clone(),this.position0=this.object.position.clone(),this.zoom0=this.object.zoom,this._domElementKeyEvents=null,this._lastPosition=new G,this._lastQuaternion=new Pr,this._lastTargetPosition=new G,this._quat=new Pr().setFromUnitVectors(e.up,new G(0,1,0)),this._quatInverse=this._quat.clone().invert(),this._spherical=new hg,this._sphericalDelta=new hg,this._scale=1,this._panOffset=new G,this._rotateStart=new qe,this._rotateEnd=new qe,this._rotateDelta=new qe,this._panStart=new qe,this._panEnd=new qe,this._panDelta=new qe,this._dollyStart=new qe,this._dollyEnd=new qe,this._dollyDelta=new qe,this._dollyDirection=new G,this._mouse=new qe,this._performCursorZoom=!1,this._pointers=[],this._pointerPositions={},this._controlActive=!1,this._onPointerMove=ET.bind(this),this._onPointerDown=MT.bind(this),this._onPointerUp=TT.bind(this),this._onContextMenu=LT.bind(this),this._onMouseWheel=CT.bind(this),this._onKeyDown=RT.bind(this),this._onTouchStart=bT.bind(this),this._onTouchMove=PT.bind(this),this._onMouseDown=wT.bind(this),this._onMouseMove=AT.bind(this),this._interceptControlDown=DT.bind(this),this._interceptControlUp=UT.bind(this),this.domElement!==null&&this.connect(),this.update()}connect(){this.domElement.addEventListener("pointerdown",this._onPointerDown),this.domElement.addEventListener("pointercancel",this._onPointerUp),this.domElement.addEventListener("contextmenu",this._onContextMenu),this.domElement.addEventListener("wheel",this._onMouseWheel,{passive:!1}),this.domElement.getRootNode().addEventListener("keydown",this._interceptControlDown,{passive:!0,capture:!0}),this.domElement.style.touchAction="none"}disconnect(){this.domElement.removeEventListener("pointerdown",this._onPointerDown),this.domElement.removeEventListener("pointermove",this._onPointerMove),this.domElement.removeEventListener("pointerup",this._onPointerUp),this.domElement.removeEventListener("pointercancel",this._onPointerUp),this.domElement.removeEventListener("wheel",this._onMouseWheel),this.domElement.removeEventListener("contextmenu",this._onContextMenu),this.stopListenToKeyEvents(),this.domElement.getRootNode().removeEventListener("keydown",this._interceptControlDown,{capture:!0}),this.domElement.style.touchAction="auto"}dispose(){this.disconnect()}getPolarAngle(){return this._spherical.phi}getAzimuthalAngle(){return this._spherical.theta}getDistance(){return this.object.position.distanceTo(this.target)}listenToKeyEvents(e){e.addEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=e}stopListenToKeyEvents(){this._domElementKeyEvents!==null&&(this._domElementKeyEvents.removeEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=null)}saveState(){this.target0.copy(this.target),this.position0.copy(this.object.position),this.zoom0=this.object.zoom}reset(){this.target.copy(this.target0),this.object.position.copy(this.position0),this.object.zoom=this.zoom0,this.object.updateProjectionMatrix(),this.dispatchEvent(pg),this.update(),this.state=Pt.NONE}update(e=null){const t=this.object.position;Qt.copy(t).sub(this.target),Qt.applyQuaternion(this._quat),this._spherical.setFromVector3(Qt),this.autoRotate&&this.state===Pt.NONE&&this._rotateLeft(this._getAutoRotationAngle(e)),this.enableDamping?(this._spherical.theta+=this._sphericalDelta.theta*this.dampingFactor,this._spherical.phi+=this._sphericalDelta.phi*this.dampingFactor):(this._spherical.theta+=this._sphericalDelta.theta,this._spherical.phi+=this._sphericalDelta.phi);let r=this.minAzimuthAngle,a=this.maxAzimuthAngle;isFinite(r)&&isFinite(a)&&(r<-Math.PI?r+=zn:r>Math.PI&&(r-=zn),a<-Math.PI?a+=zn:a>Math.PI&&(a-=zn),r<=a?this._spherical.theta=Math.max(r,Math.min(a,this._spherical.theta)):this._spherical.theta=this._spherical.theta>(r+a)/2?Math.max(r,this._spherical.theta):Math.min(a,this._spherical.theta)),this._spherical.phi=Math.max(this.minPolarAngle,Math.min(this.maxPolarAngle,this._spherical.phi)),this._spherical.makeSafe(),this.enableDamping===!0?this.target.addScaledVector(this._panOffset,this.dampingFactor):this.target.add(this._panOffset),this.target.sub(this.cursor),this.target.clampLength(this.minTargetRadius,this.maxTargetRadius),this.target.add(this.cursor);let l=!1;if(this.zoomToCursor&&this._performCursorZoom||this.object.isOrthographicCamera)this._spherical.radius=this._clampDistance(this._spherical.radius);else{const c=this._spherical.radius;this._spherical.radius=this._clampDistance(this._spherical.radius*this._scale),l=c!=this._spherical.radius}if(Qt.setFromSpherical(this._spherical),Qt.applyQuaternion(this._quatInverse),t.copy(this.target).add(Qt),this.object.lookAt(this.target),this.enableDamping===!0?(this._sphericalDelta.theta*=1-this.dampingFactor,this._sphericalDelta.phi*=1-this.dampingFactor,this._panOffset.multiplyScalar(1-this.dampingFactor)):(this._sphericalDelta.set(0,0,0),this._panOffset.set(0,0,0)),this.zoomToCursor&&this._performCursorZoom){let c=null;if(this.object.isPerspectiveCamera){const f=Qt.length();c=this._clampDistance(f*this._scale);const h=f-c;this.object.position.addScaledVector(this._dollyDirection,h),this.object.updateMatrixWorld(),l=!!h}else if(this.object.isOrthographicCamera){const f=new G(this._mouse.x,this._mouse.y,0);f.unproject(this.object);const h=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),this.object.updateProjectionMatrix(),l=h!==this.object.zoom;const m=new G(this._mouse.x,this._mouse.y,0);m.unproject(this.object),this.object.position.sub(m).add(f),this.object.updateMatrixWorld(),c=Qt.length()}else console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."),this.zoomToCursor=!1;c!==null&&(this.screenSpacePanning?this.target.set(0,0,-1).transformDirection(this.object.matrix).multiplyScalar(c).add(this.object.position):(Bl.origin.copy(this.object.position),Bl.direction.set(0,0,-1).transformDirection(this.object.matrix),Math.abs(this.object.up.dot(Bl.direction))<yT?this.object.lookAt(this.target):(mg.setFromNormalAndCoplanarPoint(this.object.up,this.target),Bl.intersectPlane(mg,this.target))))}else if(this.object.isOrthographicCamera){const c=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),c!==this.object.zoom&&(this.object.updateProjectionMatrix(),l=!0)}return this._scale=1,this._performCursorZoom=!1,l||this._lastPosition.distanceToSquared(this.object.position)>yf||8*(1-this._lastQuaternion.dot(this.object.quaternion))>yf||this._lastTargetPosition.distanceToSquared(this.target)>yf?(this.dispatchEvent(pg),this._lastPosition.copy(this.object.position),this._lastQuaternion.copy(this.object.quaternion),this._lastTargetPosition.copy(this.target),!0):!1}_getAutoRotationAngle(e){return e!==null?zn/60*this.autoRotateSpeed*e:zn/60/60*this.autoRotateSpeed}_getZoomScale(e){const t=Math.abs(e*.01);return Math.pow(.95,this.zoomSpeed*t)}_rotateLeft(e){this._sphericalDelta.theta-=e}_rotateUp(e){this._sphericalDelta.phi-=e}_panLeft(e,t){Qt.setFromMatrixColumn(t,0),Qt.multiplyScalar(-e),this._panOffset.add(Qt)}_panUp(e,t){this.screenSpacePanning===!0?Qt.setFromMatrixColumn(t,1):(Qt.setFromMatrixColumn(t,0),Qt.crossVectors(this.object.up,Qt)),Qt.multiplyScalar(e),this._panOffset.add(Qt)}_pan(e,t){const r=this.domElement;if(this.object.isPerspectiveCamera){const a=this.object.position;Qt.copy(a).sub(this.target);let l=Qt.length();l*=Math.tan(this.object.fov/2*Math.PI/180),this._panLeft(2*e*l/r.clientHeight,this.object.matrix),this._panUp(2*t*l/r.clientHeight,this.object.matrix)}else this.object.isOrthographicCamera?(this._panLeft(e*(this.object.right-this.object.left)/this.object.zoom/r.clientWidth,this.object.matrix),this._panUp(t*(this.object.top-this.object.bottom)/this.object.zoom/r.clientHeight,this.object.matrix)):(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."),this.enablePan=!1)}_dollyOut(e){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale/=e:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_dollyIn(e){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale*=e:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_updateZoomParameters(e,t){if(!this.zoomToCursor)return;this._performCursorZoom=!0;const r=this.domElement.getBoundingClientRect(),a=e-r.left,l=t-r.top,c=r.width,f=r.height;this._mouse.x=a/c*2-1,this._mouse.y=-(l/f)*2+1,this._dollyDirection.set(this._mouse.x,this._mouse.y,1).unproject(this.object).sub(this.object.position).normalize()}_clampDistance(e){return Math.max(this.minDistance,Math.min(this.maxDistance,e))}_handleMouseDownRotate(e){this._rotateStart.set(e.clientX,e.clientY)}_handleMouseDownDolly(e){this._updateZoomParameters(e.clientX,e.clientX),this._dollyStart.set(e.clientX,e.clientY)}_handleMouseDownPan(e){this._panStart.set(e.clientX,e.clientY)}_handleMouseMoveRotate(e){this._rotateEnd.set(e.clientX,e.clientY),this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);const t=this.domElement;this._rotateLeft(zn*this._rotateDelta.x/t.clientHeight),this._rotateUp(zn*this._rotateDelta.y/t.clientHeight),this._rotateStart.copy(this._rotateEnd),this.update()}_handleMouseMoveDolly(e){this._dollyEnd.set(e.clientX,e.clientY),this._dollyDelta.subVectors(this._dollyEnd,this._dollyStart),this._dollyDelta.y>0?this._dollyOut(this._getZoomScale(this._dollyDelta.y)):this._dollyDelta.y<0&&this._dollyIn(this._getZoomScale(this._dollyDelta.y)),this._dollyStart.copy(this._dollyEnd),this.update()}_handleMouseMovePan(e){this._panEnd.set(e.clientX,e.clientY),this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd),this.update()}_handleMouseWheel(e){this._updateZoomParameters(e.clientX,e.clientY),e.deltaY<0?this._dollyIn(this._getZoomScale(e.deltaY)):e.deltaY>0&&this._dollyOut(this._getZoomScale(e.deltaY)),this.update()}_handleKeyDown(e){let t=!1;switch(e.code){case this.keys.UP:e.ctrlKey||e.metaKey||e.shiftKey?this._rotateUp(zn*this.rotateSpeed/this.domElement.clientHeight):this._pan(0,this.keyPanSpeed),t=!0;break;case this.keys.BOTTOM:e.ctrlKey||e.metaKey||e.shiftKey?this._rotateUp(-zn*this.rotateSpeed/this.domElement.clientHeight):this._pan(0,-this.keyPanSpeed),t=!0;break;case this.keys.LEFT:e.ctrlKey||e.metaKey||e.shiftKey?this._rotateLeft(zn*this.rotateSpeed/this.domElement.clientHeight):this._pan(this.keyPanSpeed,0),t=!0;break;case this.keys.RIGHT:e.ctrlKey||e.metaKey||e.shiftKey?this._rotateLeft(-zn*this.rotateSpeed/this.domElement.clientHeight):this._pan(-this.keyPanSpeed,0),t=!0;break}t&&(e.preventDefault(),this.update())}_handleTouchStartRotate(e){if(this._pointers.length===1)this._rotateStart.set(e.pageX,e.pageY);else{const t=this._getSecondPointerPosition(e),r=.5*(e.pageX+t.x),a=.5*(e.pageY+t.y);this._rotateStart.set(r,a)}}_handleTouchStartPan(e){if(this._pointers.length===1)this._panStart.set(e.pageX,e.pageY);else{const t=this._getSecondPointerPosition(e),r=.5*(e.pageX+t.x),a=.5*(e.pageY+t.y);this._panStart.set(r,a)}}_handleTouchStartDolly(e){const t=this._getSecondPointerPosition(e),r=e.pageX-t.x,a=e.pageY-t.y,l=Math.sqrt(r*r+a*a);this._dollyStart.set(0,l)}_handleTouchStartDollyPan(e){this.enableZoom&&this._handleTouchStartDolly(e),this.enablePan&&this._handleTouchStartPan(e)}_handleTouchStartDollyRotate(e){this.enableZoom&&this._handleTouchStartDolly(e),this.enableRotate&&this._handleTouchStartRotate(e)}_handleTouchMoveRotate(e){if(this._pointers.length==1)this._rotateEnd.set(e.pageX,e.pageY);else{const r=this._getSecondPointerPosition(e),a=.5*(e.pageX+r.x),l=.5*(e.pageY+r.y);this._rotateEnd.set(a,l)}this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);const t=this.domElement;this._rotateLeft(zn*this._rotateDelta.x/t.clientHeight),this._rotateUp(zn*this._rotateDelta.y/t.clientHeight),this._rotateStart.copy(this._rotateEnd)}_handleTouchMovePan(e){if(this._pointers.length===1)this._panEnd.set(e.pageX,e.pageY);else{const t=this._getSecondPointerPosition(e),r=.5*(e.pageX+t.x),a=.5*(e.pageY+t.y);this._panEnd.set(r,a)}this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd)}_handleTouchMoveDolly(e){const t=this._getSecondPointerPosition(e),r=e.pageX-t.x,a=e.pageY-t.y,l=Math.sqrt(r*r+a*a);this._dollyEnd.set(0,l),this._dollyDelta.set(0,Math.pow(this._dollyEnd.y/this._dollyStart.y,this.zoomSpeed)),this._dollyOut(this._dollyDelta.y),this._dollyStart.copy(this._dollyEnd);const c=(e.pageX+t.x)*.5,f=(e.pageY+t.y)*.5;this._updateZoomParameters(c,f)}_handleTouchMoveDollyPan(e){this.enableZoom&&this._handleTouchMoveDolly(e),this.enablePan&&this._handleTouchMovePan(e)}_handleTouchMoveDollyRotate(e){this.enableZoom&&this._handleTouchMoveDolly(e),this.enableRotate&&this._handleTouchMoveRotate(e)}_addPointer(e){this._pointers.push(e.pointerId)}_removePointer(e){delete this._pointerPositions[e.pointerId];for(let t=0;t<this._pointers.length;t++)if(this._pointers[t]==e.pointerId){this._pointers.splice(t,1);return}}_isTrackingPointer(e){for(let t=0;t<this._pointers.length;t++)if(this._pointers[t]==e.pointerId)return!0;return!1}_trackPointer(e){let t=this._pointerPositions[e.pointerId];t===void 0&&(t=new qe,this._pointerPositions[e.pointerId]=t),t.set(e.pageX,e.pageY)}_getSecondPointerPosition(e){const t=e.pointerId===this._pointers[0]?this._pointers[1]:this._pointers[0];return this._pointerPositions[t]}_customWheelEvent(e){const t=e.deltaMode,r={clientX:e.clientX,clientY:e.clientY,deltaY:e.deltaY};switch(t){case 1:r.deltaY*=16;break;case 2:r.deltaY*=100;break}return e.ctrlKey&&!this._controlActive&&(r.deltaY*=10),r}}function MT(s){this.enabled!==!1&&(this._pointers.length===0&&(this.domElement.setPointerCapture(s.pointerId),this.domElement.addEventListener("pointermove",this._onPointerMove),this.domElement.addEventListener("pointerup",this._onPointerUp)),!this._isTrackingPointer(s)&&(this._addPointer(s),s.pointerType==="touch"?this._onTouchStart(s):this._onMouseDown(s)))}function ET(s){this.enabled!==!1&&(s.pointerType==="touch"?this._onTouchMove(s):this._onMouseMove(s))}function TT(s){switch(this._removePointer(s),this._pointers.length){case 0:this.domElement.releasePointerCapture(s.pointerId),this.domElement.removeEventListener("pointermove",this._onPointerMove),this.domElement.removeEventListener("pointerup",this._onPointerUp),this.dispatchEvent(a_),this.state=Pt.NONE;break;case 1:const e=this._pointers[0],t=this._pointerPositions[e];this._onTouchStart({pointerId:e,pageX:t.x,pageY:t.y});break}}function wT(s){let e;switch(s.button){case 0:e=this.mouseButtons.LEFT;break;case 1:e=this.mouseButtons.MIDDLE;break;case 2:e=this.mouseButtons.RIGHT;break;default:e=-1}switch(e){case wr.DOLLY:if(this.enableZoom===!1)return;this._handleMouseDownDolly(s),this.state=Pt.DOLLY;break;case wr.ROTATE:if(s.ctrlKey||s.metaKey||s.shiftKey){if(this.enablePan===!1)return;this._handleMouseDownPan(s),this.state=Pt.PAN}else{if(this.enableRotate===!1)return;this._handleMouseDownRotate(s),this.state=Pt.ROTATE}break;case wr.PAN:if(s.ctrlKey||s.metaKey||s.shiftKey){if(this.enableRotate===!1)return;this._handleMouseDownRotate(s),this.state=Pt.ROTATE}else{if(this.enablePan===!1)return;this._handleMouseDownPan(s),this.state=Pt.PAN}break;default:this.state=Pt.NONE}this.state!==Pt.NONE&&this.dispatchEvent(Pd)}function AT(s){switch(this.state){case Pt.ROTATE:if(this.enableRotate===!1)return;this._handleMouseMoveRotate(s);break;case Pt.DOLLY:if(this.enableZoom===!1)return;this._handleMouseMoveDolly(s);break;case Pt.PAN:if(this.enablePan===!1)return;this._handleMouseMovePan(s);break}}function CT(s){this.enabled===!1||this.enableZoom===!1||this.state!==Pt.NONE||(s.preventDefault(),this.dispatchEvent(Pd),this._handleMouseWheel(this._customWheelEvent(s)),this.dispatchEvent(a_))}function RT(s){this.enabled===!1||this.enablePan===!1||this._handleKeyDown(s)}function bT(s){switch(this._trackPointer(s),this._pointers.length){case 1:switch(this.touches.ONE){case Ks.ROTATE:if(this.enableRotate===!1)return;this._handleTouchStartRotate(s),this.state=Pt.TOUCH_ROTATE;break;case Ks.PAN:if(this.enablePan===!1)return;this._handleTouchStartPan(s),this.state=Pt.TOUCH_PAN;break;default:this.state=Pt.NONE}break;case 2:switch(this.touches.TWO){case Ks.DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchStartDollyPan(s),this.state=Pt.TOUCH_DOLLY_PAN;break;case Ks.DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchStartDollyRotate(s),this.state=Pt.TOUCH_DOLLY_ROTATE;break;default:this.state=Pt.NONE}break;default:this.state=Pt.NONE}this.state!==Pt.NONE&&this.dispatchEvent(Pd)}function PT(s){switch(this._trackPointer(s),this.state){case Pt.TOUCH_ROTATE:if(this.enableRotate===!1)return;this._handleTouchMoveRotate(s),this.update();break;case Pt.TOUCH_PAN:if(this.enablePan===!1)return;this._handleTouchMovePan(s),this.update();break;case Pt.TOUCH_DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchMoveDollyPan(s),this.update();break;case Pt.TOUCH_DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchMoveDollyRotate(s),this.update();break;default:this.state=Pt.NONE}}function LT(s){this.enabled!==!1&&s.preventDefault()}function DT(s){s.key==="Control"&&(this._controlActive=!0,this.domElement.getRootNode().addEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}function UT(s){s.key==="Control"&&(this._controlActive=!1,this.domElement.getRootNode().removeEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}class IT extends Yt{constructor(e=document.createElement("div")){super(),this.isCSS2DObject=!0,this.element=e,this.element.style.position="absolute",this.element.style.userSelect="none",this.element.setAttribute("draggable",!1),this.center=new qe(.5,.5),this.addEventListener("removed",function(){this.traverse(function(t){t.element instanceof t.element.ownerDocument.defaultView.Element&&t.element.parentNode!==null&&t.element.remove()})})}copy(e,t){return super.copy(e,t),this.element=e.element.cloneNode(!0),this.center=e.center,this}}const $s=new G,gg=new Lt,_g=new Lt,vg=new G,xg=new G;class NT{constructor(e={}){const t=this;let r,a,l,c;const f={objects:new WeakMap},h=e.element!==void 0?e.element:document.createElement("div");h.style.overflow="hidden",this.domElement=h,this.getSize=function(){return{width:r,height:a}},this.render=function(M,T){M.matrixWorldAutoUpdate===!0&&M.updateMatrixWorld(),T.parent===null&&T.matrixWorldAutoUpdate===!0&&T.updateMatrixWorld(),gg.copy(T.matrixWorldInverse),_g.multiplyMatrices(T.projectionMatrix,gg),_(M,M,T),S(M)},this.setSize=function(M,T){r=M,a=T,l=r/2,c=a/2,h.style.width=M+"px",h.style.height=T+"px"};function m(M){M.isCSS2DObject&&(M.element.style.display="none");for(let T=0,v=M.children.length;T<v;T++)m(M.children[T])}function _(M,T,v){if(M.visible===!1){m(M);return}if(M.isCSS2DObject){$s.setFromMatrixPosition(M.matrixWorld),$s.applyMatrix4(_g);const g=$s.z>=-1&&$s.z<=1&&M.layers.test(v.layers)===!0,P=M.element;P.style.display=g===!0?"":"none",g===!0&&(M.onBeforeRender(t,T,v),P.style.transform="translate("+-100*M.center.x+"%,"+-100*M.center.y+"%)translate("+($s.x*l+l)+"px,"+(-$s.y*c+c)+"px)",P.parentNode!==h&&h.appendChild(P),M.onAfterRender(t,T,v));const L={distanceToCameraSquared:x(v,M)};f.objects.set(M,L)}for(let g=0,P=M.children.length;g<P;g++)_(M.children[g],T,v)}function x(M,T){return vg.setFromMatrixPosition(M.matrixWorld),xg.setFromMatrixPosition(T.matrixWorld),vg.distanceToSquared(xg)}function y(M){const T=[];return M.traverseVisible(function(v){v.isCSS2DObject&&T.push(v)}),T}function S(M){const T=y(M).sort(function(g,P){if(g.renderOrder!==P.renderOrder)return P.renderOrder-g.renderOrder;const L=f.objects.get(g).distanceToCameraSquared,C=f.objects.get(P).distanceToCameraSquared;return L-C}),v=T.length;for(let g=0,P=T.length;g<P;g++)T[g].element.style.zIndex=v-g}}}const yg=6378137;function FT(s){const e=new rT;e.background=new pt(461069);const t=new ti(45,1,.01,500);t.position.set(2.6,1.5,2.4);const r=new iT({antialias:!0});r.setPixelRatio(Math.min(window.devicePixelRatio,2)),r.outputColorSpace=An,s.appendChild(r.domElement);const a=new NT;a.domElement.className="viewport-labels",s.appendChild(a.domElement);const l=new ST(t,a.domElement);l.enableDamping=!0,l.dampingFactor=.08,l.rotateSpeed=.55,l.minDistance=1.2,l.maxDistance=40,l.zoomSpeed=.9,l.enablePan=!1,l.mouseButtons.LEFT=wr.ROTATE,l.mouseButtons.RIGHT=wr.ROTATE;const c=new Qs,f=new Qs;e.add(c),e.add(f);const h=OT(e),m=zT();e.add(m),BT(e),kT(f,r);const _=new ResizeObserver(v);_.observe(s);let x=null,y=null,S=[],M=[],T;g();function v(){const I=Math.max(s.clientWidth,1),B=Math.max(s.clientHeight,1);t.aspect=I/B,t.updateProjectionMatrix(),r.setSize(I,B,!1),a.setSize(I,B)}function g(){P(),T=requestAnimationFrame(g)}function P(){l.update(),r.render(e,t),a.render(e,t)}function L(I,B,b=0){(I!==x||B!==y)&&(C(I,B),x=I,y=B),W(I,B,b),P()}function C(I,B){Eg(c),S=[],M=[];const b=Number(I.earthRadius_m)||yg;Sf(I.satellites).forEach(A=>{XT(c,A,B,b);const O=HT(c,A.name);S.push({marker:O,satellite:A})}),Sf(I.places).forEach(A=>{const O=VT(c,A.name);M.push({...O,place:A})})}function W(I,B,b){var ce,$,oe,k;const A=Sf(I.timeSamples),O=jT(b,A.length),se=Number(I.earthRadius_m)||yg;S.forEach(({marker:le,satellite:re})=>{const N=Sg(re,B,O);GT(le,N,se)}),M.forEach(({marker:le,ring:re,place:N})=>{const ie=Sg(N,B,O);WT(le,re,ie,se)}),qT(f,(ce=A[O.lowerIndex])==null?void 0:ce.ecefToEciMatrix,($=A[O.upperIndex])==null?void 0:$.ecefToEciMatrix,O.fraction,B);const J=B==="ECI"?"sunDirectionEci":"sunDirectionEcef",ue=u_((oe=A[O.lowerIndex])==null?void 0:oe[J],(k=A[O.upperIndex])==null?void 0:k[J],O.fraction);YT(m,h,ue)}function F(){cancelAnimationFrame(T),_.disconnect(),l.dispose(),Eg(c),m.material.map.dispose(),m.material.dispose(),r.dispose(),a.domElement.remove(),r.domElement.remove()}return{update:L,dispose:F}}function OT(s){s.add(new vT(3159100,1.6));const e=new _T(16774368,2.4);return s.add(e),e}function zT(){const s=document.createElement("canvas");s.width=128,s.height=128;const e=s.getContext("2d"),t=e.createRadialGradient(64,64,4,64,64,64);t.addColorStop(0,"rgba(255,248,224,1)"),t.addColorStop(.25,"rgba(255,236,170,0.85)"),t.addColorStop(.6,"rgba(255,214,110,0.25)"),t.addColorStop(1,"rgba(255,200,80,0)"),e.fillStyle=t,e.fillRect(0,0,128,128);const r=new uT(s);r.colorSpace=An;const a=new oT(new n_({map:r,transparent:!0,depthWrite:!1}));return a.scale.setScalar(14),a}function kT(s,e){const t=new ta(1,128,80),r=new cT({color:16777215,specular:new pt(2107440),shininess:12});new pT().load("/textures/earth_atmos_2048.jpg",l=>{l.colorSpace=An,l.anisotropy=e.capabilities.getMaxAnisotropy(),r.map=l,r.needsUpdate=!0}),s.add(new kn(t,r));const a=new kn(new ta(1.018,96,64),new ao({color:4630783,transparent:!0,opacity:.12,side:Rn}));s.add(a)}function BT(s){const e=[];for(let r=0;r<1200;r+=1){const a=r*2.399963,l=1-2*r/1199,c=Math.sqrt(1-l*l);e.push(45*c*Math.cos(a),45*l,45*c*Math.sin(a))}const t=new bn;t.setAttribute("position",new on(e,3)),s.add(new lT(t,new s_({color:12114175,size:.035,transparent:!0,opacity:.65})))}function HT(s,e){const t=new kn(new ta(.014,20,14),new ao({color:14201434}));return t.add(l_(e,"object-label object-label--satellite")),s.add(t),t}function VT(s,e){const t=new kn(new Cd(.012),new ao({color:14278374}));t.add(l_(e,"object-label object-label--place")),s.add(t);const r=new kn(new Rd(.02,.028,32),new ao({color:5939416,side:Ti,transparent:!0,opacity:.85}));return s.add(r),{marker:t,ring:r}}function GT(s,e,t){s.visible=Jl(e),s.visible&&s.position.copy(Ld(e,t))}function WT(s,e,t,r){const a=Jl(t);if(s.visible=a,e.visible=a,!a)return;const l=Ld(t,r).normalize().multiplyScalar(1.006);s.position.copy(l),e.position.copy(l),e.lookAt(l.clone().multiplyScalar(2))}function XT(s,e,t,r){const l=e[t==="ECI"?"orbitPathEci_m":"orbitPathEcef_m"];if(!Array.isArray(l)||l.length<2)return;const c=l.map(h=>Ld(h,r)),f=new aT(new bn().setFromPoints(c),new r_({color:14201434,transparent:!0,opacity:.55}));s.add(f)}function l_(s,e){const t=document.createElement("div");t.className=e,t.textContent=s;const r=new IT(t);return r.center.set(-.08,1.2),r}function Ld(s,e){return new G(s[0]/e,s[2]/e,-s[1]/e)}function Sg(s,e,t){const r=e==="ECI"?"positionSamplesEci_m":"positionSamplesEcef_m",a=e==="ECI"?"positionEci_m":"positionEcef_m",l=s[r];return Array.isArray(l==null?void 0:l[t.lowerIndex])?u_(l[t.lowerIndex],l[t.upperIndex],t.fraction):s[a]}function jT(s,e){const t=Math.max(e-1,0),r=Math.min(Math.max(Number(s)||0,0),t),a=Math.floor(r);return{lowerIndex:a,upperIndex:Math.min(a+1,t),fraction:r-a}}function u_(s,e,t){return!Jl(s)||!Jl(e)?s:s.map((r,a)=>r+t*(e[a]-r))}function Jl(s){return Array.isArray(s)&&s.length===3}function YT(s,e,t){const r=Array.isArray(t)&&t.length===3;if(s.visible=r,e.visible=r,!r)return;const a=new G(...t),l=ql(a).normalize();e.position.copy(l).multiplyScalar(50),s.position.copy(l.multiplyScalar(100))}function qT(s,e,t,r,a){if(s.matrixAutoUpdate=!0,s.quaternion.identity(),a!=="ECI"||!Array.isArray(e))return;const l=Mg(e),c=Array.isArray(t)?Mg(t):l;s.quaternion.copy(l).slerp(c,r)}function Mg(s){const e=c=>new G(s[0][0]*c.x+s[0][1]*c.y+s[0][2]*c.z,s[1][0]*c.x+s[1][1]*c.y+s[1][2]*c.z,s[2][0]*c.x+s[2][1]*c.y+s[2][2]*c.z),t=ql(e(new G(1,0,0))),r=ql(e(new G(0,0,1))),a=ql(e(new G(0,-1,0))),l=new Lt().makeBasis(t,r,a);return new Pr().setFromRotationMatrix(l)}function ql(s){return new G(s.x,s.z,-s.y)}function Eg(s){for(;s.children.length>0;)s.children.pop().traverse(t=>{var r,a;t.isCSS2DObject&&t.element.remove(),(r=t.geometry)==null||r.dispose(),(a=t.material)==null||a.dispose()})}function Sf(s){return s?Array.isArray(s)?s:[s]:[]}function $T({sceneData:s,referenceFrame:e,samplePosition:t}){const r=jt.useRef(null),a=jt.useRef(null);return jt.useEffect(()=>(a.current=FT(r.current),()=>a.current.dispose()),[]),jt.useEffect(()=>{s&&a.current&&a.current.update(s,e,t)},[s,e,t]),me.createElement("div",{className:"viewport",ref:r})}function KT({isBusy:s,onNewScenario:e,onSaveScenario:t,onLoadScenario:r,onAddSatellite:a,onAddPlace:l}){const c=jt.useRef(null);async function f(h){var _;const m=(_=h.target.files)==null?void 0:_[0];h.target.value="",m&&await r(m)}return me.createElement("nav",{className:"scenario-menu","aria-label":"Scenario commands"},me.createElement("div",{className:"menu-group"},me.createElement("span",null,"Scenario"),me.createElement("button",{disabled:s,onClick:e},"New"),me.createElement("button",{disabled:s,onClick:t},"Save"),me.createElement("button",{disabled:s,onClick:()=>{var h;return(h=c.current)==null?void 0:h.click()}},"Load"),me.createElement("input",{ref:c,className:"file-input",type:"file",accept:".json,application/json",onChange:f})),me.createElement("div",{className:"menu-group"},me.createElement("span",null,"Insert"),me.createElement("button",{disabled:s,onClick:a},"Satellite"),me.createElement("button",{disabled:s,onClick:l},"Place")))}async function c_(s,e={}){const t=await fetch(s,{cache:"no-store",...e}),r=await t.json();if(!t.ok)throw new Error(r.message||`HTTP ${t.status}`);return r}function ZT(){return c_("/api/scene")}function QT(s,e={}){return c_("/api/command",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({command:s,payload:e})})}const JT=[60,240,600,1200,2400];function ew(){var ce;const[s,e]=jt.useState(null),[t,r]=jt.useState(-1),[a,l]=jt.useState("Connecting to MATLAB…"),[c,f]=jt.useState(!1),[h,m]=jt.useState("ECEF"),[_,x]=jt.useState(0),[y,S]=jt.useState(!1),[M,T]=jt.useState(240),[v,g]=jt.useState(null),P=jt.useRef(null),L=jt.useCallback(async()=>{try{const $=await ZT();$.revision!==t&&(e($.scene),r($.revision)),l("MATLAB scenario synchronized")}catch($){l(`MATLAB bridge unavailable: ${$.message}`)}},[t]);jt.useEffect(()=>{if(c)return;L();const $=window.setInterval(L,500);return()=>window.clearInterval($)},[c,L]),jt.useEffect(()=>{x(0),S(!1),T(Number(s==null?void 0:s.playbackRate)||240)},[s]);const C=Ef(s==null?void 0:s.timeSamples),W=C.length,F=iw(C,_,s==null?void 0:s.epoch);jt.useEffect(()=>{if(!y||W<2)return;P.current=window.performance.now();let $;function oe(k){const le=P.current,re=(k-le)/1e3;P.current=k;const N=re*M/Number(s.sampleInterval_s);x(ie=>{const De=ie+N;return De>=W-1?(S(!1),W-1):De}),$=window.requestAnimationFrame(oe)}return $=window.requestAnimationFrame(oe),()=>window.cancelAnimationFrame($)},[y,M,W,s]);async function I($,oe={}){f(!0),l("Applying command in MATLAB…");try{const k=await QT($,oe);return await L(),k.result}catch(k){l(`Command failed: ${k.message}`)}finally{f(!1)}return null}async function B($,oe){await I($,oe)&&g(null)}async function b(){const $=await I("saveScenario");$&&(tw($),l("Scenario definition saved"))}async function A($){try{const oe=JSON.parse(await $.text());await I("loadScenario",{Definition:oe})}catch(oe){l(`Load failed: ${oe.message}`)}}const O=Ef(s==null?void 0:s.satellites),se=Ef(s==null?void 0:s.places);function J(){_>=W-1&&x(0),S($=>!$)}function ue($){S(!1),x(Number($.target.value))}return me.createElement("main",{className:"console"},me.createElement("header",{className:"topbar"},me.createElement("div",{className:"brand-mark"},"S"),me.createElement("div",null,me.createElement("h1",null,(s==null?void 0:s.scenarioName)??"Scenario Console"),me.createElement("p",null,"MATLAB · ",h," · metres")),me.createElement(KT,{isBusy:c,onNewScenario:()=>g("newScenario"),onSaveScenario:b,onLoadScenario:A,onAddSatellite:()=>g("addSatellite"),onAddPlace:()=>g("addPlace")}),me.createElement("div",{className:"connection"},me.createElement("span",null),a)),me.createElement("aside",{className:"object-browser panel"},me.createElement("h2",null,"Object Browser"),me.createElement(Mf,{label:"Satellites",objects:O,symbol:"◈"}),me.createElement(Mf,{label:"Places",objects:se,symbol:"⌖"}),me.createElement(Mf,{label:"Celestial",objects:s!=null&&s.sun?[s.sun]:[],symbol:"☀"})),me.createElement("section",{className:"viewport-panel"},me.createElement($T,{sceneData:s,referenceFrame:h,samplePosition:_}),me.createElement("div",{className:"frame-selector","aria-label":"Reference frame"},["ECEF","ECI"].map($=>me.createElement("button",{className:h===$?"active":"",key:$,onClick:()=>m($)},$))),me.createElement("div",{className:"viewport-badge"},h),me.createElement("div",{className:"viewport-help"},"Left drag: spin globe · Right drag: rotate view · Wheel: zoom")),me.createElement("aside",{className:"inspector panel"},me.createElement("h2",null,"Scenario"),me.createElement("dl",null,me.createElement("dt",null,"Epoch"),me.createElement("dd",null,F??"—"),me.createElement("dt",null,"Satellites"),me.createElement("dd",null,O.length),me.createElement("dt",null,"Places"),me.createElement("dd",null,se.length),me.createElement("dt",null,"Sun model"),me.createElement("dd",null,((ce=s==null?void 0:s.sun)==null?void 0:ce.model)??"—")),me.createElement("h3",null,"Authoring"),me.createElement("p",{className:"inspector-copy"},"Use the Scenario and Insert menus above to edit this composition."),me.createElement("p",{className:"notice"},"Analysis remains authoritative in MATLAB.")),me.createElement("footer",{className:"timeline"},me.createElement("button",{className:"play",disabled:W<2,onClick:J,"aria-label":y?"Pause scenario":"Play scenario"},y?"❚❚":"▶"),me.createElement("input",{className:"timeline-range",type:"range",min:"0",max:Math.max(W-1,0),step:"0.01",value:Math.min(_,Math.max(W-1,0)),disabled:W<2,onChange:ue,"aria-label":"Scenario epoch"}),me.createElement("select",{className:"playback-speed",value:M,onChange:$=>T(Number($.target.value)),"aria-label":"Playback speed"},JT.map($=>me.createElement("option",{key:$,value:$},$,"×"))),me.createElement("time",null,F??"No epoch loaded")),me.createElement(Zv,{dialog:v,scene:s,isBusy:c,onClose:()=>g(null),onSubmit:B}))}function tw(s){const e=JSON.stringify(s,null,2),t=new Blob([e],{type:"application/json"}),r=URL.createObjectURL(t),a=document.createElement("a");a.href=r,a.download=`${nw(s.Name)}.scenario.json`,document.body.appendChild(a),a.click(),a.remove(),window.setTimeout(()=>URL.revokeObjectURL(r),0)}function nw(s){return String(s||"scenario").trim().replace(/[^a-z0-9_-]+/gi,"-")||"scenario"}function Mf({label:s,objects:e,symbol:t}){return me.createElement("section",{className:"object-group"},me.createElement("h3",null,"⌄ ",s," ",me.createElement("small",null,e.length)),e.map(r=>me.createElement("div",{className:"object-row",key:r.name},me.createElement("span",null,t),r.name)))}function Ef(s){return s?Array.isArray(s)?s:[s]:[]}function iw(s,e,t){if(s.length===0)return t;const r=Math.min(Math.floor(e),s.length-1),a=Math.min(r+1,s.length-1),l=e-r,c=Number(s[r].epochUnix_s),f=Number(s[a].epochUnix_s),h=c+l*(f-c);if(!Number.isFinite(h))return s[r].epoch;const m=new Date(Math.round(h)*1e3).toISOString();return`${m.slice(0,10)} ${m.slice(11,19)} UTC`}Kv.createRoot(document.getElementById("root")).render(me.createElement(me.StrictMode,null,me.createElement(ew,null)));
