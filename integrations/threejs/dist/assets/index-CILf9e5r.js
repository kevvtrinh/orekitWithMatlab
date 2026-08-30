(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))r(a);new MutationObserver(a=>{for(const l of a)if(l.type==="childList")for(const c of l.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&r(c)}).observe(document,{childList:!0,subtree:!0});function t(a){const l={};return a.integrity&&(l.integrity=a.integrity),a.referrerPolicy&&(l.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?l.credentials="include":a.crossOrigin==="anonymous"?l.credentials="omit":l.credentials="same-origin",l}function r(a){if(a.ep)return;a.ep=!0;const l=t(a);fetch(a.href,l)}})();function Uv(s){return s&&s.__esModule&&Object.prototype.hasOwnProperty.call(s,"default")?s.default:s}var Ic={exports:{}},dt={};/**
 * @license Reac
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var Yp;function Iv(){if(Yp)return dt;Yp=1;var s=Symbol.for("react.element"),e=Symbol.for("react.portal"),t=Symbol.for("react.fragment"),r=Symbol.for("react.strict_mode"),a=Symbol.for("react.profiler"),l=Symbol.for("react.provider"),c=Symbol.for("react.context"),d=Symbol.for("react.forward_ref"),h=Symbol.for("react.suspense"),g=Symbol.for("react.memo"),_=Symbol.for("react.lazy"),x=Symbol.iterator;function y(N){return N===null||typeof N!="object"?null:(N=x&&N[x]||N["@@iterator"],typeof N=="function"?N:null)}var S={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},E=Object.assign,T={};function v(N,ne,De){this.props=N,this.context=ne,this.refs=T,this.updater=De||S}v.prototype.isReactComponent={},v.prototype.setState=function(N,ne){if(typeof N!="object"&&typeof N!="function"&&N!=null)throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,N,ne,"setState")},v.prototype.forceUpdate=function(N){this.updater.enqueueForceUpdate(this,N,"forceUpdate")};function m(){}m.prototype=v.prototype;function P(N,ne,De){this.props=N,this.context=ne,this.refs=T,this.updater=De||S}var L=P.prototype=new m;L.constructor=P,E(L,v.prototype),L.isPureReactComponent=!0;var R=Array.isArray,j=Object.prototype.hasOwnProperty,I={current:null},F={key:!0,ref:!0,__self:!0,__source:!0};function H(N,ne,De){var Z,ue={},Me=null,ve=null;if(ne!=null)for(Z in ne.ref!==void 0&&(ve=ne.ref),ne.key!==void 0&&(Me=""+ne.key),ne)j.call(ne,Z)&&!F.hasOwnProperty(Z)&&(ue[Z]=ne[Z]);var we=arguments.length-2;if(we===1)ue.children=De;else if(1<we){for(var Ue=Array(we),Ze=0;Ze<we;Ze++)Ue[Ze]=arguments[Ze+2];ue.children=Ue}if(N&&N.defaultProps)for(Z in we=N.defaultProps,we)ue[Z]===void 0&&(ue[Z]=we[Z]);return{$$typeof:s,type:N,key:Me,ref:ve,props:ue,_owner:I.current}}function b(N,ne){return{$$typeof:s,type:N.type,key:ne,ref:N.ref,props:N.props,_owner:N._owner}}function A(N){return typeof N=="object"&&N!==null&&N.$$typeof===s}function z(N){var ne={"=":"=0",":":"=2"};return"$"+N.replace(/[=:]/g,function(De){return ne[De]})}var se=/\/+/g;function te(N,ne){return typeof N=="object"&&N!==null&&N.key!=null?z(""+N.key):ne.toString(36)}function fe(N,ne,De,Z,ue){var Me=typeof N;(Me==="undefined"||Me==="boolean")&&(N=null);var ve=!1;if(N===null)ve=!0;else switch(Me){case"string":case"number":ve=!0;break;case"object":switch(N.$$typeof){case s:case e:ve=!0}}if(ve)return ve=N,ue=ue(ve),N=Z===""?"."+te(ve,0):Z,R(ue)?(De="",N!=null&&(De=N.replace(se,"$&/")+"/"),fe(ue,ne,De,"",function(Ze){return Ze})):ue!=null&&(A(ue)&&(ue=b(ue,De+(!ue.key||ve&&ve.key===ue.key?"":(""+ue.key).replace(se,"$&/")+"/")+N)),ne.push(ue)),1;if(ve=0,Z=Z===""?".":Z+":",R(N))for(var we=0;we<N.length;we++){Me=N[we];var Ue=Z+te(Me,we);ve+=fe(Me,ne,De,Ue,ue)}else if(Ue=y(N),typeof Ue=="function")for(N=Ue.call(N),we=0;!(Me=N.next()).done;)Me=Me.value,Ue=Z+te(Me,we++),ve+=fe(Me,ne,De,Ue,ue);else if(Me==="object")throw ne=String(N),Error("Objects are not valid as a React child (found: "+(ne==="[object Object]"?"object with keys {"+Object.keys(N).join(", ")+"}":ne)+"). If you meant to render a collection of children, use an array instead.");return ve}function he(N,ne,De){if(N==null)return N;var Z=[],ue=0;return fe(N,Z,"","",function(Me){return ne.call(De,Me,ue++)}),Z}function oe(N){if(N._status===-1){var ne=N._result;ne=ne(),ne.then(function(De){(N._status===0||N._status===-1)&&(N._status=1,N._result=De)},function(De){(N._status===0||N._status===-1)&&(N._status=2,N._result=De)}),N._status===-1&&(N._status=0,N._result=ne)}if(N._status===1)return N._result.default;throw N._result}var le={current:null},k={transition:null},ae={ReactCurrentDispatcher:le,ReactCurrentBatchConfig:k,ReactCurrentOwner:I};function re(){throw Error("act(...) is not supported in production builds of React.")}return dt.Children={map:he,forEach:function(N,ne,De){he(N,function(){ne.apply(this,arguments)},De)},count:function(N){var ne=0;return he(N,function(){ne++}),ne},toArray:function(N){return he(N,function(ne){return ne})||[]},only:function(N){if(!A(N))throw Error("React.Children.only expected to receive a single React element child.");return N}},dt.Component=v,dt.Fragment=t,dt.Profiler=a,dt.PureComponent=P,dt.StrictMode=r,dt.Suspense=h,dt.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=ae,dt.act=re,dt.cloneElement=function(N,ne,De){if(N==null)throw Error("React.cloneElement(...): The argument must be a React element, but you passed "+N+".");var Z=E({},N.props),ue=N.key,Me=N.ref,ve=N._owner;if(ne!=null){if(ne.ref!==void 0&&(Me=ne.ref,ve=I.current),ne.key!==void 0&&(ue=""+ne.key),N.type&&N.type.defaultProps)var we=N.type.defaultProps;for(Ue in ne)j.call(ne,Ue)&&!F.hasOwnProperty(Ue)&&(Z[Ue]=ne[Ue]===void 0&&we!==void 0?we[Ue]:ne[Ue])}var Ue=arguments.length-2;if(Ue===1)Z.children=De;else if(1<Ue){we=Array(Ue);for(var Ze=0;Ze<Ue;Ze++)we[Ze]=arguments[Ze+2];Z.children=we}return{$$typeof:s,type:N.type,key:ue,ref:Me,props:Z,_owner:ve}},dt.createContext=function(N){return N={$$typeof:c,_currentValue:N,_currentValue2:N,_threadCount:0,Provider:null,Consumer:null,_defaultValue:null,_globalName:null},N.Provider={$$typeof:l,_context:N},N.Consumer=N},dt.createElement=H,dt.createFactory=function(N){var ne=H.bind(null,N);return ne.type=N,ne},dt.createRef=function(){return{current:null}},dt.forwardRef=function(N){return{$$typeof:d,render:N}},dt.isValidElement=A,dt.lazy=function(N){return{$$typeof:_,_payload:{_status:-1,_result:N},_init:oe}},dt.memo=function(N,ne){return{$$typeof:g,type:N,compare:ne===void 0?null:ne}},dt.startTransition=function(N){var ne=k.transition;k.transition={};try{N()}finally{k.transition=ne}},dt.unstable_act=re,dt.useCallback=function(N,ne){return le.current.useCallback(N,ne)},dt.useContext=function(N){return le.current.useContext(N)},dt.useDebugValue=function(){},dt.useDeferredValue=function(N){return le.current.useDeferredValue(N)},dt.useEffect=function(N,ne){return le.current.useEffect(N,ne)},dt.useId=function(){return le.current.useId()},dt.useImperativeHandle=function(N,ne,De){return le.current.useImperativeHandle(N,ne,De)},dt.useInsertionEffect=function(N,ne){return le.current.useInsertionEffect(N,ne)},dt.useLayoutEffect=function(N,ne){return le.current.useLayoutEffect(N,ne)},dt.useMemo=function(N,ne){return le.current.useMemo(N,ne)},dt.useReducer=function(N,ne,De){return le.current.useReducer(N,ne,De)},dt.useRef=function(N){return le.current.useRef(N)},dt.useState=function(N){return le.current.useState(N)},dt.useSyncExternalStore=function(N,ne,De){return le.current.useSyncExternalStore(N,ne,De)},dt.useTransition=function(){return le.current.useTransition()},dt.version="18.3.1",dt}var jp;function mg(){return jp||(jp=1,Ic.exports=Iv()),Ic.exports}var Jn=mg();const et=Uv(Jn);var ul={},Nc={exports:{}},Nn={},Fc={exports:{}},Oc={};/**
 * @license Reac
 * scheduler.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var qp;function Nv(){return qp||(qp=1,function(s){function e(k,ae){var re=k.length;k.push(ae);e:for(;0<re;){var N=re-1>>>1,ne=k[N];if(0<a(ne,ae))k[N]=ae,k[re]=ne,re=N;else break e}}function t(k){return k.length===0?null:k[0]}function r(k){if(k.length===0)return null;var ae=k[0],re=k.pop();if(re!==ae){k[0]=re;e:for(var N=0,ne=k.length,De=ne>>>1;N<De;){var Z=2*(N+1)-1,ue=k[Z],Me=Z+1,ve=k[Me];if(0>a(ue,re))Me<ne&&0>a(ve,ue)?(k[N]=ve,k[Me]=re,N=Me):(k[N]=ue,k[Z]=re,N=Z);else if(Me<ne&&0>a(ve,re))k[N]=ve,k[Me]=re,N=Me;else break e}}return ae}function a(k,ae){var re=k.sortIndex-ae.sortIndex;return re!==0?re:k.id-ae.id}if(typeof performance=="object"&&typeof performance.now=="function"){var l=performance;s.unstable_now=function(){return l.now()}}else{var c=Date,d=c.now();s.unstable_now=function(){return c.now()-d}}var h=[],g=[],_=1,x=null,y=3,S=!1,E=!1,T=!1,v=typeof setTimeout=="function"?setTimeout:null,m=typeof clearTimeout=="function"?clearTimeout:null,P=typeof setImmediate<"u"?setImmediate:null;typeof navigator<"u"&&navigator.scheduling!==void 0&&navigator.scheduling.isInputPending!==void 0&&navigator.scheduling.isInputPending.bind(navigator.scheduling);function L(k){for(var ae=t(g);ae!==null;){if(ae.callback===null)r(g);else if(ae.startTime<=k)r(g),ae.sortIndex=ae.expirationTime,e(h,ae);else break;ae=t(g)}}function R(k){if(T=!1,L(k),!E)if(t(h)!==null)E=!0,oe(j);else{var ae=t(g);ae!==null&&le(R,ae.startTime-k)}}function j(k,ae){E=!1,T&&(T=!1,m(H),H=-1),S=!0;var re=y;try{for(L(ae),x=t(h);x!==null&&(!(x.expirationTime>ae)||k&&!z());){var N=x.callback;if(typeof N=="function"){x.callback=null,y=x.priorityLevel;var ne=N(x.expirationTime<=ae);ae=s.unstable_now(),typeof ne=="function"?x.callback=ne:x===t(h)&&r(h),L(ae)}else r(h);x=t(h)}if(x!==null)var De=!0;else{var Z=t(g);Z!==null&&le(R,Z.startTime-ae),De=!1}return De}finally{x=null,y=re,S=!1}}var I=!1,F=null,H=-1,b=5,A=-1;function z(){return!(s.unstable_now()-A<b)}function se(){if(F!==null){var k=s.unstable_now();A=k;var ae=!0;try{ae=F(!0,k)}finally{ae?te():(I=!1,F=null)}}else I=!1}var te;if(typeof P=="function")te=function(){P(se)};else if(typeof MessageChannel<"u"){var fe=new MessageChannel,he=fe.port2;fe.port1.onmessage=se,te=function(){he.postMessage(null)}}else te=function(){v(se,0)};function oe(k){F=k,I||(I=!0,te())}function le(k,ae){H=v(function(){k(s.unstable_now())},ae)}s.unstable_IdlePriority=5,s.unstable_ImmediatePriority=1,s.unstable_LowPriority=4,s.unstable_NormalPriority=3,s.unstable_Profiling=null,s.unstable_UserBlockingPriority=2,s.unstable_cancelCallback=function(k){k.callback=null},s.unstable_continueExecution=function(){E||S||(E=!0,oe(j))},s.unstable_forceFrameRate=function(k){0>k||125<k?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):b=0<k?Math.floor(1e3/k):5},s.unstable_getCurrentPriorityLevel=function(){return y},s.unstable_getFirstCallbackNode=function(){return t(h)},s.unstable_next=function(k){switch(y){case 1:case 2:case 3:var ae=3;break;default:ae=y}var re=y;y=ae;try{return k()}finally{y=re}},s.unstable_pauseExecution=function(){},s.unstable_requestPaint=function(){},s.unstable_runWithPriority=function(k,ae){switch(k){case 1:case 2:case 3:case 4:case 5:break;default:k=3}var re=y;y=k;try{return ae()}finally{y=re}},s.unstable_scheduleCallback=function(k,ae,re){var N=s.unstable_now();switch(typeof re=="object"&&re!==null?(re=re.delay,re=typeof re=="number"&&0<re?N+re:N):re=N,k){case 1:var ne=-1;break;case 2:ne=250;break;case 5:ne=1073741823;break;case 4:ne=1e4;break;default:ne=5e3}return ne=re+ne,k={id:_++,callback:ae,priorityLevel:k,startTime:re,expirationTime:ne,sortIndex:-1},re>N?(k.sortIndex=re,e(g,k),t(h)===null&&k===t(g)&&(T?(m(H),H=-1):T=!0,le(R,re-N))):(k.sortIndex=ne,e(h,k),E||S||(E=!0,oe(j))),k},s.unstable_shouldYield=z,s.unstable_wrapCallback=function(k){var ae=y;return function(){var re=y;y=ae;try{return k.apply(this,arguments)}finally{y=re}}}}(Oc)),Oc}var $p;function Fv(){return $p||($p=1,Fc.exports=Nv()),Fc.exports}/**
 * @license Reac
 * react-dom.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var Kp;function Ov(){if(Kp)return Nn;Kp=1;var s=mg(),e=Fv();function t(n){for(var i="https://reactjs.org/docs/error-decoder.html?invariant="+n,o=1;o<arguments.length;o++)i+="&args[]="+encodeURIComponent(arguments[o]);return"Minified React error #"+n+"; visit "+i+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}var r=new Set,a={};function l(n,i){c(n,i),c(n+"Capture",i)}function c(n,i){for(a[n]=i,n=0;n<i.length;n++)r.add(i[n])}var d=!(typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"),h=Object.prototype.hasOwnProperty,g=/^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/,_={},x={};function y(n){return h.call(x,n)?!0:h.call(_,n)?!1:g.test(n)?x[n]=!0:(_[n]=!0,!1)}function S(n,i,o,u){if(o!==null&&o.type===0)return!1;switch(typeof i){case"function":case"symbol":return!0;case"boolean":return u?!1:o!==null?!o.acceptsBooleans:(n=n.toLowerCase().slice(0,5),n!=="data-"&&n!=="aria-");default:return!1}}function E(n,i,o,u){if(i===null||typeof i>"u"||S(n,i,o,u))return!0;if(u)return!1;if(o!==null)switch(o.type){case 3:return!i;case 4:return i===!1;case 5:return isNaN(i);case 6:return isNaN(i)||1>i}return!1}function T(n,i,o,u,f,p,M){this.acceptsBooleans=i===2||i===3||i===4,this.attributeName=u,this.attributeNamespace=f,this.mustUseProperty=o,this.propertyName=n,this.type=i,this.sanitizeURL=p,this.removeEmptyString=M}var v={};"children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ").forEach(function(n){v[n]=new T(n,0,!1,n,null,!1,!1)}),[["acceptCharset","accept-charset"],["className","class"],["htmlFor","for"],["httpEquiv","http-equiv"]].forEach(function(n){var i=n[0];v[i]=new T(i,1,!1,n[1],null,!1,!1)}),["contentEditable","draggable","spellCheck","value"].forEach(function(n){v[n]=new T(n,2,!1,n.toLowerCase(),null,!1,!1)}),["autoReverse","externalResourcesRequired","focusable","preserveAlpha"].forEach(function(n){v[n]=new T(n,2,!1,n,null,!1,!1)}),"allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function(n){v[n]=new T(n,3,!1,n.toLowerCase(),null,!1,!1)}),["checked","multiple","muted","selected"].forEach(function(n){v[n]=new T(n,3,!0,n,null,!1,!1)}),["capture","download"].forEach(function(n){v[n]=new T(n,4,!1,n,null,!1,!1)}),["cols","rows","size","span"].forEach(function(n){v[n]=new T(n,6,!1,n,null,!1,!1)}),["rowSpan","start"].forEach(function(n){v[n]=new T(n,5,!1,n.toLowerCase(),null,!1,!1)});var m=/[\-:]([a-z])/g;function P(n){return n[1].toUpperCase()}"accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height".split(" ").forEach(function(n){var i=n.replace(m,P);v[i]=new T(i,1,!1,n,null,!1,!1)}),"xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(n){var i=n.replace(m,P);v[i]=new T(i,1,!1,n,"http://www.w3.org/1999/xlink",!1,!1)}),["xml:base","xml:lang","xml:space"].forEach(function(n){var i=n.replace(m,P);v[i]=new T(i,1,!1,n,"http://www.w3.org/XML/1998/namespace",!1,!1)}),["tabIndex","crossOrigin"].forEach(function(n){v[n]=new T(n,1,!1,n.toLowerCase(),null,!1,!1)}),v.xlinkHref=new T("xlinkHref",1,!1,"xlink:href","http://www.w3.org/1999/xlink",!0,!1),["src","href","action","formAction"].forEach(function(n){v[n]=new T(n,1,!1,n.toLowerCase(),null,!0,!0)});function L(n,i,o,u){var f=v.hasOwnProperty(i)?v[i]:null;(f!==null?f.type!==0:u||!(2<i.length)||i[0]!=="o"&&i[0]!=="O"||i[1]!=="n"&&i[1]!=="N")&&(E(i,o,f,u)&&(o=null),u||f===null?y(i)&&(o===null?n.removeAttribute(i):n.setAttribute(i,""+o)):f.mustUseProperty?n[f.propertyName]=o===null?f.type===3?!1:"":o:(i=f.attributeName,u=f.attributeNamespace,o===null?n.removeAttribute(i):(f=f.type,o=f===3||f===4&&o===!0?"":""+o,u?n.setAttributeNS(u,i,o):n.setAttribute(i,o))))}var R=s.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,j=Symbol.for("react.element"),I=Symbol.for("react.portal"),F=Symbol.for("react.fragment"),H=Symbol.for("react.strict_mode"),b=Symbol.for("react.profiler"),A=Symbol.for("react.provider"),z=Symbol.for("react.context"),se=Symbol.for("react.forward_ref"),te=Symbol.for("react.suspense"),fe=Symbol.for("react.suspense_list"),he=Symbol.for("react.memo"),oe=Symbol.for("react.lazy"),le=Symbol.for("react.offscreen"),k=Symbol.iterator;function ae(n){return n===null||typeof n!="object"?null:(n=k&&n[k]||n["@@iterator"],typeof n=="function"?n:null)}var re=Object.assign,N;function ne(n){if(N===void 0)try{throw Error()}catch(o){var i=o.stack.trim().match(/\n( *(at )?)/);N=i&&i[1]||""}return`
`+N+n}var De=!1;function Z(n,i){if(!n||De)return"";De=!0;var o=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{if(i)if(i=function(){throw Error()},Object.defineProperty(i.prototype,"props",{set:function(){throw Error()}}),typeof Reflect=="object"&&Reflect.construct){try{Reflect.construct(i,[])}catch(Q){var u=Q}Reflect.construct(n,[],i)}else{try{i.call()}catch(Q){u=Q}n.call(i.prototype)}else{try{throw Error()}catch(Q){u=Q}n()}}catch(Q){if(Q&&u&&typeof Q.stack=="string"){for(var f=Q.stack.split(`
`),p=u.stack.split(`
`),M=f.length-1,U=p.length-1;1<=M&&0<=U&&f[M]!==p[U];)U--;for(;1<=M&&0<=U;M--,U--)if(f[M]!==p[U]){if(M!==1||U!==1)do if(M--,U--,0>U||f[M]!==p[U]){var O=`
`+f[M].replace(" at new "," at ");return n.displayName&&O.includes("<anonymous>")&&(O=O.replace("<anonymous>",n.displayName)),O}while(1<=M&&0<=U);break}}}finally{De=!1,Error.prepareStackTrace=o}return(n=n?n.displayName||n.name:"")?ne(n):""}function ue(n){switch(n.tag){case 5:return ne(n.type);case 16:return ne("Lazy");case 13:return ne("Suspense");case 19:return ne("SuspenseList");case 0:case 2:case 15:return n=Z(n.type,!1),n;case 11:return n=Z(n.type.render,!1),n;case 1:return n=Z(n.type,!0),n;default:return""}}function Me(n){if(n==null)return null;if(typeof n=="function")return n.displayName||n.name||null;if(typeof n=="string")return n;switch(n){case F:return"Fragment";case I:return"Portal";case b:return"Profiler";case H:return"StrictMode";case te:return"Suspense";case fe:return"SuspenseList"}if(typeof n=="object")switch(n.$$typeof){case z:return(n.displayName||"Context")+".Consumer";case A:return(n._context.displayName||"Context")+".Provider";case se:var i=n.render;return n=n.displayName,n||(n=i.displayName||i.name||"",n=n!==""?"ForwardRef("+n+")":"ForwardRef"),n;case he:return i=n.displayName||null,i!==null?i:Me(n.type)||"Memo";case oe:i=n._payload,n=n._init;try{return Me(n(i))}catch{}}return null}function ve(n){var i=n.type;switch(n.tag){case 24:return"Cache";case 9:return(i.displayName||"Context")+".Consumer";case 10:return(i._context.displayName||"Context")+".Provider";case 18:return"DehydratedFragment";case 11:return n=i.render,n=n.displayName||n.name||"",i.displayName||(n!==""?"ForwardRef("+n+")":"ForwardRef");case 7:return"Fragment";case 5:return i;case 4:return"Portal";case 3:return"Root";case 6:return"Text";case 16:return Me(i);case 8:return i===H?"StrictMode":"Mode";case 22:return"Offscreen";case 12:return"Profiler";case 21:return"Scope";case 13:return"Suspense";case 19:return"SuspenseList";case 25:return"TracingMarker";case 1:case 0:case 17:case 2:case 14:case 15:if(typeof i=="function")return i.displayName||i.name||null;if(typeof i=="string")return i}return null}function we(n){switch(typeof n){case"boolean":case"number":case"string":case"undefined":return n;case"object":return n;default:return""}}function Ue(n){var i=n.type;return(n=n.nodeName)&&n.toLowerCase()==="input"&&(i==="checkbox"||i==="radio")}function Ze(n){var i=Ue(n)?"checked":"value",o=Object.getOwnPropertyDescriptor(n.constructor.prototype,i),u=""+n[i];if(!n.hasOwnProperty(i)&&typeof o<"u"&&typeof o.get=="function"&&typeof o.set=="function"){var f=o.get,p=o.set;return Object.defineProperty(n,i,{configurable:!0,get:function(){return f.call(this)},set:function(M){u=""+M,p.call(this,M)}}),Object.defineProperty(n,i,{enumerable:o.enumerable}),{getValue:function(){return u},setValue:function(M){u=""+M},stopTracking:function(){n._valueTracker=null,delete n[i]}}}}function Ct(n){n._valueTracker||(n._valueTracker=Ze(n))}function mt(n){if(!n)return!1;var i=n._valueTracker;if(!i)return!0;var o=i.getValue(),u="";return n&&(u=Ue(n)?n.checked?"true":"false":n.value),n=u,n!==o?(i.setValue(n),!0):!1}function Ut(n){if(n=n||(typeof document<"u"?document:void 0),typeof n>"u")return null;try{return n.activeElement||n.body}catch{return n.body}}function Y(n,i){var o=i.checked;return re({},i,{defaultChecked:void 0,defaultValue:void 0,value:void 0,checked:o??n._wrapperState.initialChecked})}function _n(n,i){var o=i.defaultValue==null?"":i.defaultValue,u=i.checked!=null?i.checked:i.defaultChecked;o=we(i.value!=null?i.value:o),n._wrapperState={initialChecked:u,initialValue:o,controlled:i.type==="checkbox"||i.type==="radio"?i.checked!=null:i.value!=null}}function ht(n,i){i=i.checked,i!=null&&L(n,"checked",i,!1)}function ct(n,i){ht(n,i);var o=we(i.value),u=i.type;if(o!=null)u==="number"?(o===0&&n.value===""||n.value!=o)&&(n.value=""+o):n.value!==""+o&&(n.value=""+o);else if(u==="submit"||u==="reset"){n.removeAttribute("value");return}i.hasOwnProperty("value")?wt(n,i.type,o):i.hasOwnProperty("defaultValue")&&wt(n,i.type,we(i.defaultValue)),i.checked==null&&i.defaultChecked!=null&&(n.defaultChecked=!!i.defaultChecked)}function qe(n,i,o){if(i.hasOwnProperty("value")||i.hasOwnProperty("defaultValue")){var u=i.type;if(!(u!=="submit"&&u!=="reset"||i.value!==void 0&&i.value!==null))return;i=""+n._wrapperState.initialValue,o||i===n.value||(n.value=i),n.defaultValue=i}o=n.name,o!==""&&(n.name=""),n.defaultChecked=!!n._wrapperState.initialChecked,o!==""&&(n.name=o)}function wt(n,i,o){(i!=="number"||Ut(n.ownerDocument)!==n)&&(o==null?n.defaultValue=""+n._wrapperState.initialValue:n.defaultValue!==""+o&&(n.defaultValue=""+o))}var Ye=Array.isArray;function D(n,i,o,u){if(n=n.options,i){i={};for(var f=0;f<o.length;f++)i["$"+o[f]]=!0;for(o=0;o<n.length;o++)f=i.hasOwnProperty("$"+n[o].value),n[o].selected!==f&&(n[o].selected=f),f&&u&&(n[o].defaultSelected=!0)}else{for(o=""+we(o),i=null,f=0;f<n.length;f++){if(n[f].value===o){n[f].selected=!0,u&&(n[f].defaultSelected=!0);return}i!==null||n[f].disabled||(i=n[f])}i!==null&&(i.selected=!0)}}function w(n,i){if(i.dangerouslySetInnerHTML!=null)throw Error(t(91));return re({},i,{value:void 0,defaultValue:void 0,children:""+n._wrapperState.initialValue})}function K(n,i){var o=i.value;if(o==null){if(o=i.children,i=i.defaultValue,o!=null){if(i!=null)throw Error(t(92));if(Ye(o)){if(1<o.length)throw Error(t(93));o=o[0]}i=o}i==null&&(i=""),o=i}n._wrapperState={initialValue:we(o)}}function pe(n,i){var o=we(i.value),u=we(i.defaultValue);o!=null&&(o=""+o,o!==n.value&&(n.value=o),i.defaultValue==null&&n.defaultValue!==o&&(n.defaultValue=o)),u!=null&&(n.defaultValue=""+u)}function ge(n){var i=n.textContent;i===n._wrapperState.initialValue&&i!==""&&i!==null&&(n.value=i)}function ce(n){switch(n){case"svg":return"http://www.w3.org/2000/svg";case"math":return"http://www.w3.org/1998/Math/MathML";default:return"http://www.w3.org/1999/xhtml"}}function He(n,i){return n==null||n==="http://www.w3.org/1999/xhtml"?ce(i):n==="http://www.w3.org/2000/svg"&&i==="foreignObject"?"http://www.w3.org/1999/xhtml":n}var Ae,Ie=function(n){return typeof MSApp<"u"&&MSApp.execUnsafeLocalFunction?function(i,o,u,f){MSApp.execUnsafeLocalFunction(function(){return n(i,o,u,f)})}:n}(function(n,i){if(n.namespaceURI!=="http://www.w3.org/2000/svg"||"innerHTML"in n)n.innerHTML=i;else{for(Ae=Ae||document.createElement("div"),Ae.innerHTML="<svg>"+i.valueOf().toString()+"</svg>",i=Ae.firstChild;n.firstChild;)n.removeChild(n.firstChild);for(;i.firstChild;)n.appendChild(i.firstChild)}});function ut(n,i){if(i){var o=n.firstChild;if(o&&o===n.lastChild&&o.nodeType===3){o.nodeValue=i;return}}n.textContent=i}var ye={animationIterationCount:!0,aspectRatio:!0,borderImageOutset:!0,borderImageSlice:!0,borderImageWidth:!0,boxFlex:!0,boxFlexGroup:!0,boxOrdinalGroup:!0,columnCount:!0,columns:!0,flex:!0,flexGrow:!0,flexPositive:!0,flexShrink:!0,flexNegative:!0,flexOrder:!0,gridArea:!0,gridRow:!0,gridRowEnd:!0,gridRowSpan:!0,gridRowStart:!0,gridColumn:!0,gridColumnEnd:!0,gridColumnSpan:!0,gridColumnStart:!0,fontWeight:!0,lineClamp:!0,lineHeight:!0,opacity:!0,order:!0,orphans:!0,tabSize:!0,widows:!0,zIndex:!0,zoom:!0,fillOpacity:!0,floodOpacity:!0,stopOpacity:!0,strokeDasharray:!0,strokeDashoffset:!0,strokeMiterlimit:!0,strokeOpacity:!0,strokeWidth:!0},Fe=["Webkit","ms","Moz","O"];Object.keys(ye).forEach(function(n){Fe.forEach(function(i){i=i+n.charAt(0).toUpperCase()+n.substring(1),ye[i]=ye[n]})});function Qe(n,i,o){return i==null||typeof i=="boolean"||i===""?"":o||typeof i!="number"||i===0||ye.hasOwnProperty(n)&&ye[n]?(""+i).trim():i+"px"}function Je(n,i){n=n.style;for(var o in i)if(i.hasOwnProperty(o)){var u=o.indexOf("--")===0,f=Qe(o,i[o],u);o==="float"&&(o="cssFloat"),u?n.setProperty(o,f):n[o]=f}}var Oe=re({menuitem:!0},{area:!0,base:!0,br:!0,col:!0,embed:!0,hr:!0,img:!0,input:!0,keygen:!0,link:!0,meta:!0,param:!0,source:!0,track:!0,wbr:!0});function ft(n,i){if(i){if(Oe[n]&&(i.children!=null||i.dangerouslySetInnerHTML!=null))throw Error(t(137,n));if(i.dangerouslySetInnerHTML!=null){if(i.children!=null)throw Error(t(60));if(typeof i.dangerouslySetInnerHTML!="object"||!("__html"in i.dangerouslySetInnerHTML))throw Error(t(61))}if(i.style!=null&&typeof i.style!="object")throw Error(t(62))}}function rt(n,i){if(n.indexOf("-")===-1)return typeof i.is=="string";switch(n){case"annotation-xml":case"color-profile":case"font-face":case"font-face-src":case"font-face-uri":case"font-face-format":case"font-face-name":case"missing-glyph":return!1;default:return!0}}var Tt=null;function V(n){return n=n.target||n.srcElement||window,n.correspondingUseElement&&(n=n.correspondingUseElement),n.nodeType===3?n.parentNode:n}var Ce=null,ie=null,de=null;function be(n){if(n=Ao(n)){if(typeof Ce!="function")throw Error(t(280));var i=n.stateNode;i&&(i=Ta(i),Ce(n.stateNode,n.type,i))}}function Pe(n){ie?de?de.push(n):de=[n]:ie=n}function st(){if(ie){var n=ie,i=de;if(de=ie=null,be(n),i)for(n=0;n<i.length;n++)be(i[n])}}function Nt(n,i){return n(i)}function jt(){}var vt=!1;function Rn(n,i,o){if(vt)return n(i,o);vt=!0;try{return Nt(n,i,o)}finally{vt=!1,(ie!==null||de!==null)&&(jt(),st())}}function vn(n,i){var o=n.stateNode;if(o===null)return null;var u=Ta(o);if(u===null)return null;o=u[i];e:switch(i){case"onClick":case"onClickCapture":case"onDoubleClick":case"onDoubleClickCapture":case"onMouseDown":case"onMouseDownCapture":case"onMouseMove":case"onMouseMoveCapture":case"onMouseUp":case"onMouseUpCapture":case"onMouseEnter":(u=!u.disabled)||(n=n.type,u=!(n==="button"||n==="input"||n==="select"||n==="textarea")),n=!u;break e;default:n=!1}if(n)return null;if(o&&typeof o!="function")throw Error(t(231,i,typeof o));return o}var rs=!1;if(d)try{var qi={};Object.defineProperty(qi,"passive",{get:function(){rs=!0}}),window.addEventListener("test",qi,qi),window.removeEventListener("test",qi,qi)}catch{rs=!1}function Ci(n,i,o,u,f,p,M,U,O){var Q=Array.prototype.slice.call(arguments,3);try{i.apply(o,Q)}catch(_e){this.onError(_e)}}var Ri=!1,Pr=null,br=!1,$i=null,ra={onError:function(n){Ri=!0,Pr=n}};function ss(n,i,o,u,f,p,M,U,O){Ri=!1,Pr=null,Ci.apply(ra,arguments)}function sa(n,i,o,u,f,p,M,U,O){if(ss.apply(this,arguments),Ri){if(Ri){var Q=Pr;Ri=!1,Pr=null}else throw Error(t(198));br||(br=!0,$i=Q)}}function gi(n){var i=n,o=n;if(n.alternate)for(;i.return;)i=i.return;else{n=i;do i=n,i.flags&4098&&(o=i.return),n=i.return;while(n)}return i.tag===3?o:null}function oa(n){if(n.tag===13){var i=n.memoizedState;if(i===null&&(n=n.alternate,n!==null&&(i=n.memoizedState)),i!==null)return i.dehydrated}return null}function aa(n){if(gi(n)!==n)throw Error(t(188))}function nu(n){var i=n.alternate;if(!i){if(i=gi(n),i===null)throw Error(t(188));return i!==n?null:n}for(var o=n,u=i;;){var f=o.return;if(f===null)break;var p=f.alternate;if(p===null){if(u=f.return,u!==null){o=u;continue}break}if(f.child===p.child){for(p=f.child;p;){if(p===o)return aa(f),n;if(p===u)return aa(f),i;p=p.sibling}throw Error(t(188))}if(o.return!==u.return)o=f,u=p;else{for(var M=!1,U=f.child;U;){if(U===o){M=!0,o=f,u=p;break}if(U===u){M=!0,u=f,o=p;break}U=U.sibling}if(!M){for(U=p.child;U;){if(U===o){M=!0,o=p,u=f;break}if(U===u){M=!0,u=p,o=f;break}U=U.sibling}if(!M)throw Error(t(189))}}if(o.alternate!==u)throw Error(t(190))}if(o.tag!==3)throw Error(t(188));return o.stateNode.current===o?n:i}function C(n){return n=nu(n),n!==null?W(n):null}function W(n){if(n.tag===5||n.tag===6)return n;for(n=n.child;n!==null;){var i=W(n);if(i!==null)return i;n=n.sibling}return null}var J=e.unstable_scheduleCallback,ee=e.unstable_cancelCallback,X=e.unstable_shouldYield,Te=e.unstable_requestPaint,Se=e.unstable_now,Ve=e.unstable_getCurrentPriorityLevel,ke=e.unstable_ImmediatePriority,tt=e.unstable_UserBlockingPriority,it=e.unstable_NormalPriority,Ge=e.unstable_LowPriority,_t=e.unstable_IdlePriority,Et=null,gt=null;function ln(n){if(gt&&typeof gt.onCommitFiberRoot=="function")try{gt.onCommitFiberRoot(Et,n,void 0,(n.current.flags&128)===128)}catch{}}var ot=Math.clz32?Math.clz32:St,Xe=Math.log,ni=Math.LN2;function St(n){return n>>>=0,n===0?32:31-(Xe(n)/ni|0)|0}var un=64,ii=4194304;function qt(n){switch(n&-n){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return n&4194240;case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:return n&130023424;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 1073741824;default:return n}}function _i(n,i){var o=n.pendingLanes;if(o===0)return 0;var u=0,f=n.suspendedLanes,p=n.pingedLanes,M=o&268435455;if(M!==0){var U=M&~f;U!==0?u=qt(U):(p&=M,p!==0&&(u=qt(p)))}else M=o&~f,M!==0?u=qt(M):p!==0&&(u=qt(p));if(u===0)return 0;if(i!==0&&i!==u&&!(i&f)&&(f=u&-u,p=i&-i,f>=p||f===16&&(p&4194240)!==0))return i;if(u&4&&(u|=o&16),i=n.entangledLanes,i!==0)for(n=n.entanglements,i&=u;0<i;)o=31-ot(i),f=1<<o,u|=n[o],i&=~f;return u}function Dt(n,i){switch(n){case 1:case 2:case 4:return i+250;case 8:case 16:case 32:case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return i+5e3;case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:return-1;case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function Wn(n,i){for(var o=n.suspendedLanes,u=n.pingedLanes,f=n.expirationTimes,p=n.pendingLanes;0<p;){var M=31-ot(p),U=1<<M,O=f[M];O===-1?(!(U&o)||U&u)&&(f[M]=Dt(U,i)):O<=i&&(n.expiredLanes|=U),p&=~U}}function Pi(n){return n=n.pendingLanes&-1073741825,n!==0?n:n&1073741824?1073741824:0}function xn(){var n=un;return un<<=1,!(un&4194240)&&(un=64),n}function Xn(n){for(var i=[],o=0;31>o;o++)i.push(n);return i}function Pn(n,i,o){n.pendingLanes|=i,i!==536870912&&(n.suspendedLanes=0,n.pingedLanes=0),n=n.eventTimes,i=31-ot(i),n[i]=o}function la(n,i){var o=n.pendingLanes&~i;n.pendingLanes=i,n.suspendedLanes=0,n.pingedLanes=0,n.expiredLanes&=i,n.mutableReadLanes&=i,n.entangledLanes&=i,i=n.entanglements;var u=n.eventTimes;for(n=n.expirationTimes;0<o;){var f=31-ot(o),p=1<<f;i[f]=0,u[f]=-1,n[f]=-1,o&=~p}}function iu(n,i){var o=n.entangledLanes|=i;for(n=n.entanglements;o;){var u=31-ot(o),f=1<<u;f&i|n[u]&i&&(n[u]|=i),o&=~f}}var At=0;function Td(n){return n&=-n,1<n?4<n?n&268435455?16:536870912:4:1}var wd,ru,Ad,Cd,Rd,su=!1,ua=[],Ki=null,Zi=null,Qi=null,uo=new Map,co=new Map,Ji=[],t_="mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(" ");function Pd(n,i){switch(n){case"focusin":case"focusout":Ki=null;break;case"dragenter":case"dragleave":Zi=null;break;case"mouseover":case"mouseout":Qi=null;break;case"pointerover":case"pointerout":uo.delete(i.pointerId);break;case"gotpointercapture":case"lostpointercapture":co.delete(i.pointerId)}}function fo(n,i,o,u,f,p){return n===null||n.nativeEvent!==p?(n={blockedOn:i,domEventName:o,eventSystemFlags:u,nativeEvent:p,targetContainers:[f]},i!==null&&(i=Ao(i),i!==null&&ru(i)),n):(n.eventSystemFlags|=u,i=n.targetContainers,f!==null&&i.indexOf(f)===-1&&i.push(f),n)}function n_(n,i,o,u,f){switch(i){case"focusin":return Ki=fo(Ki,n,i,o,u,f),!0;case"dragenter":return Zi=fo(Zi,n,i,o,u,f),!0;case"mouseover":return Qi=fo(Qi,n,i,o,u,f),!0;case"pointerover":var p=f.pointerId;return uo.set(p,fo(uo.get(p)||null,n,i,o,u,f)),!0;case"gotpointercapture":return p=f.pointerId,co.set(p,fo(co.get(p)||null,n,i,o,u,f)),!0}return!1}function bd(n){var i=Lr(n.target);if(i!==null){var o=gi(i);if(o!==null){if(i=o.tag,i===13){if(i=oa(o),i!==null){n.blockedOn=i,Rd(n.priority,function(){Ad(o)});return}}else if(i===3&&o.stateNode.current.memoizedState.isDehydrated){n.blockedOn=o.tag===3?o.stateNode.containerInfo:null;return}}}n.blockedOn=null}function ca(n){if(n.blockedOn!==null)return!1;for(var i=n.targetContainers;0<i.length;){var o=au(n.domEventName,n.eventSystemFlags,i[0],n.nativeEvent);if(o===null){o=n.nativeEvent;var u=new o.constructor(o.type,o);Tt=u,o.target.dispatchEvent(u),Tt=null}else return i=Ao(o),i!==null&&ru(i),n.blockedOn=o,!1;i.shift()}return!0}function Ld(n,i,o){ca(n)&&o.delete(i)}function i_(){su=!1,Ki!==null&&ca(Ki)&&(Ki=null),Zi!==null&&ca(Zi)&&(Zi=null),Qi!==null&&ca(Qi)&&(Qi=null),uo.forEach(Ld),co.forEach(Ld)}function ho(n,i){n.blockedOn===i&&(n.blockedOn=null,su||(su=!0,e.unstable_scheduleCallback(e.unstable_NormalPriority,i_)))}function po(n){function i(f){return ho(f,n)}if(0<ua.length){ho(ua[0],n);for(var o=1;o<ua.length;o++){var u=ua[o];u.blockedOn===n&&(u.blockedOn=null)}}for(Ki!==null&&ho(Ki,n),Zi!==null&&ho(Zi,n),Qi!==null&&ho(Qi,n),uo.forEach(i),co.forEach(i),o=0;o<Ji.length;o++)u=Ji[o],u.blockedOn===n&&(u.blockedOn=null);for(;0<Ji.length&&(o=Ji[0],o.blockedOn===null);)bd(o),o.blockedOn===null&&Ji.shift()}var os=R.ReactCurrentBatchConfig,fa=!0;function r_(n,i,o,u){var f=At,p=os.transition;os.transition=null;try{At=1,ou(n,i,o,u)}finally{At=f,os.transition=p}}function s_(n,i,o,u){var f=At,p=os.transition;os.transition=null;try{At=4,ou(n,i,o,u)}finally{At=f,os.transition=p}}function ou(n,i,o,u){if(fa){var f=au(n,i,o,u);if(f===null)Tu(n,i,u,da,o),Pd(n,u);else if(n_(f,n,i,o,u))u.stopPropagation();else if(Pd(n,u),i&4&&-1<t_.indexOf(n)){for(;f!==null;){var p=Ao(f);if(p!==null&&wd(p),p=au(n,i,o,u),p===null&&Tu(n,i,u,da,o),p===f)break;f=p}f!==null&&u.stopPropagation()}else Tu(n,i,u,null,o)}}var da=null;function au(n,i,o,u){if(da=null,n=V(u),n=Lr(n),n!==null)if(i=gi(n),i===null)n=null;else if(o=i.tag,o===13){if(n=oa(i),n!==null)return n;n=null}else if(o===3){if(i.stateNode.current.memoizedState.isDehydrated)return i.tag===3?i.stateNode.containerInfo:null;n=null}else i!==n&&(n=null);return da=n,null}function Dd(n){switch(n){case"cancel":case"click":case"close":case"contextmenu":case"copy":case"cut":case"auxclick":case"dblclick":case"dragend":case"dragstart":case"drop":case"focusin":case"focusout":case"input":case"invalid":case"keydown":case"keypress":case"keyup":case"mousedown":case"mouseup":case"paste":case"pause":case"play":case"pointercancel":case"pointerdown":case"pointerup":case"ratechange":case"reset":case"resize":case"seeked":case"submit":case"touchcancel":case"touchend":case"touchstart":case"volumechange":case"change":case"selectionchange":case"textInput":case"compositionstart":case"compositionend":case"compositionupdate":case"beforeblur":case"afterblur":case"beforeinput":case"blur":case"fullscreenchange":case"focus":case"hashchange":case"popstate":case"select":case"selectstart":return 1;case"drag":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"mousemove":case"mouseout":case"mouseover":case"pointermove":case"pointerout":case"pointerover":case"scroll":case"toggle":case"touchmove":case"wheel":case"mouseenter":case"mouseleave":case"pointerenter":case"pointerleave":return 4;case"message":switch(Ve()){case ke:return 1;case tt:return 4;case it:case Ge:return 16;case _t:return 536870912;default:return 16}default:return 16}}var er=null,lu=null,ha=null;function Ud(){if(ha)return ha;var n,i=lu,o=i.length,u,f="value"in er?er.value:er.textContent,p=f.length;for(n=0;n<o&&i[n]===f[n];n++);var M=o-n;for(u=1;u<=M&&i[o-u]===f[p-u];u++);return ha=f.slice(n,1<u?1-u:void 0)}function pa(n){var i=n.keyCode;return"charCode"in n?(n=n.charCode,n===0&&i===13&&(n=13)):n=i,n===10&&(n=13),32<=n||n===13?n:0}function ma(){return!0}function Id(){return!1}function zn(n){function i(o,u,f,p,M){this._reactName=o,this._targetInst=f,this.type=u,this.nativeEvent=p,this.target=M,this.currentTarget=null;for(var U in n)n.hasOwnProperty(U)&&(o=n[U],this[U]=o?o(p):p[U]);return this.isDefaultPrevented=(p.defaultPrevented!=null?p.defaultPrevented:p.returnValue===!1)?ma:Id,this.isPropagationStopped=Id,this}return re(i.prototype,{preventDefault:function(){this.defaultPrevented=!0;var o=this.nativeEvent;o&&(o.preventDefault?o.preventDefault():typeof o.returnValue!="unknown"&&(o.returnValue=!1),this.isDefaultPrevented=ma)},stopPropagation:function(){var o=this.nativeEvent;o&&(o.stopPropagation?o.stopPropagation():typeof o.cancelBubble!="unknown"&&(o.cancelBubble=!0),this.isPropagationStopped=ma)},persist:function(){},isPersistent:ma}),i}var as={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(n){return n.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},uu=zn(as),mo=re({},as,{view:0,detail:0}),o_=zn(mo),cu,fu,go,ga=re({},mo,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:hu,button:0,buttons:0,relatedTarget:function(n){return n.relatedTarget===void 0?n.fromElement===n.srcElement?n.toElement:n.fromElement:n.relatedTarget},movementX:function(n){return"movementX"in n?n.movementX:(n!==go&&(go&&n.type==="mousemove"?(cu=n.screenX-go.screenX,fu=n.screenY-go.screenY):fu=cu=0,go=n),cu)},movementY:function(n){return"movementY"in n?n.movementY:fu}}),Nd=zn(ga),a_=re({},ga,{dataTransfer:0}),l_=zn(a_),u_=re({},mo,{relatedTarget:0}),du=zn(u_),c_=re({},as,{animationName:0,elapsedTime:0,pseudoElement:0}),f_=zn(c_),d_=re({},as,{clipboardData:function(n){return"clipboardData"in n?n.clipboardData:window.clipboardData}}),h_=zn(d_),p_=re({},as,{data:0}),Fd=zn(p_),m_={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},g_={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},__={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};function v_(n){var i=this.nativeEvent;return i.getModifierState?i.getModifierState(n):(n=__[n])?!!i[n]:!1}function hu(){return v_}var x_=re({},mo,{key:function(n){if(n.key){var i=m_[n.key]||n.key;if(i!=="Unidentified")return i}return n.type==="keypress"?(n=pa(n),n===13?"Enter":String.fromCharCode(n)):n.type==="keydown"||n.type==="keyup"?g_[n.keyCode]||"Unidentified":""},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:hu,charCode:function(n){return n.type==="keypress"?pa(n):0},keyCode:function(n){return n.type==="keydown"||n.type==="keyup"?n.keyCode:0},which:function(n){return n.type==="keypress"?pa(n):n.type==="keydown"||n.type==="keyup"?n.keyCode:0}}),y_=zn(x_),S_=re({},ga,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0}),Od=zn(S_),M_=re({},mo,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:hu}),E_=zn(M_),T_=re({},as,{propertyName:0,elapsedTime:0,pseudoElement:0}),w_=zn(T_),A_=re({},ga,{deltaX:function(n){return"deltaX"in n?n.deltaX:"wheelDeltaX"in n?-n.wheelDeltaX:0},deltaY:function(n){return"deltaY"in n?n.deltaY:"wheelDeltaY"in n?-n.wheelDeltaY:"wheelDelta"in n?-n.wheelDelta:0},deltaZ:0,deltaMode:0}),C_=zn(A_),R_=[9,13,27,32],pu=d&&"CompositionEvent"in window,_o=null;d&&"documentMode"in document&&(_o=document.documentMode);var P_=d&&"TextEvent"in window&&!_o,zd=d&&(!pu||_o&&8<_o&&11>=_o),kd=" ",Bd=!1;function Hd(n,i){switch(n){case"keyup":return R_.indexOf(i.keyCode)!==-1;case"keydown":return i.keyCode!==229;case"keypress":case"mousedown":case"focusout":return!0;default:return!1}}function Vd(n){return n=n.detail,typeof n=="object"&&"data"in n?n.data:null}var ls=!1;function b_(n,i){switch(n){case"compositionend":return Vd(i);case"keypress":return i.which!==32?null:(Bd=!0,kd);case"textInput":return n=i.data,n===kd&&Bd?null:n;default:return null}}function L_(n,i){if(ls)return n==="compositionend"||!pu&&Hd(n,i)?(n=Ud(),ha=lu=er=null,ls=!1,n):null;switch(n){case"paste":return null;case"keypress":if(!(i.ctrlKey||i.altKey||i.metaKey)||i.ctrlKey&&i.altKey){if(i.char&&1<i.char.length)return i.char;if(i.which)return String.fromCharCode(i.which)}return null;case"compositionend":return zd&&i.locale!=="ko"?null:i.data;default:return null}}var D_={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function Gd(n){var i=n&&n.nodeName&&n.nodeName.toLowerCase();return i==="input"?!!D_[n.type]:i==="textarea"}function Wd(n,i,o,u){Pe(u),i=Sa(i,"onChange"),0<i.length&&(o=new uu("onChange","change",null,o,u),n.push({event:o,listeners:i}))}var vo=null,xo=null;function U_(n){lh(n,0)}function _a(n){var i=hs(n);if(mt(i))return n}function I_(n,i){if(n==="change")return i}var Xd=!1;if(d){var mu;if(d){var gu="oninput"in document;if(!gu){var Yd=document.createElement("div");Yd.setAttribute("oninput","return;"),gu=typeof Yd.oninput=="function"}mu=gu}else mu=!1;Xd=mu&&(!document.documentMode||9<document.documentMode)}function jd(){vo&&(vo.detachEvent("onpropertychange",qd),xo=vo=null)}function qd(n){if(n.propertyName==="value"&&_a(xo)){var i=[];Wd(i,xo,n,V(n)),Rn(U_,i)}}function N_(n,i,o){n==="focusin"?(jd(),vo=i,xo=o,vo.attachEvent("onpropertychange",qd)):n==="focusout"&&jd()}function F_(n){if(n==="selectionchange"||n==="keyup"||n==="keydown")return _a(xo)}function O_(n,i){if(n==="click")return _a(i)}function z_(n,i){if(n==="input"||n==="change")return _a(i)}function k_(n,i){return n===i&&(n!==0||1/n===1/i)||n!==n&&i!==i}var ri=typeof Object.is=="function"?Object.is:k_;function yo(n,i){if(ri(n,i))return!0;if(typeof n!="object"||n===null||typeof i!="object"||i===null)return!1;var o=Object.keys(n),u=Object.keys(i);if(o.length!==u.length)return!1;for(u=0;u<o.length;u++){var f=o[u];if(!h.call(i,f)||!ri(n[f],i[f]))return!1}return!0}function $d(n){for(;n&&n.firstChild;)n=n.firstChild;return n}function Kd(n,i){var o=$d(n);n=0;for(var u;o;){if(o.nodeType===3){if(u=n+o.textContent.length,n<=i&&u>=i)return{node:o,offset:i-n};n=u}e:{for(;o;){if(o.nextSibling){o=o.nextSibling;break e}o=o.parentNode}o=void 0}o=$d(o)}}function Zd(n,i){return n&&i?n===i?!0:n&&n.nodeType===3?!1:i&&i.nodeType===3?Zd(n,i.parentNode):"contains"in n?n.contains(i):n.compareDocumentPosition?!!(n.compareDocumentPosition(i)&16):!1:!1}function Qd(){for(var n=window,i=Ut();i instanceof n.HTMLIFrameElement;){try{var o=typeof i.contentWindow.location.href=="string"}catch{o=!1}if(o)n=i.contentWindow;else break;i=Ut(n.document)}return i}function _u(n){var i=n&&n.nodeName&&n.nodeName.toLowerCase();return i&&(i==="input"&&(n.type==="text"||n.type==="search"||n.type==="tel"||n.type==="url"||n.type==="password")||i==="textarea"||n.contentEditable==="true")}function B_(n){var i=Qd(),o=n.focusedElem,u=n.selectionRange;if(i!==o&&o&&o.ownerDocument&&Zd(o.ownerDocument.documentElement,o)){if(u!==null&&_u(o)){if(i=u.start,n=u.end,n===void 0&&(n=i),"selectionStart"in o)o.selectionStart=i,o.selectionEnd=Math.min(n,o.value.length);else if(n=(i=o.ownerDocument||document)&&i.defaultView||window,n.getSelection){n=n.getSelection();var f=o.textContent.length,p=Math.min(u.start,f);u=u.end===void 0?p:Math.min(u.end,f),!n.extend&&p>u&&(f=u,u=p,p=f),f=Kd(o,p);var M=Kd(o,u);f&&M&&(n.rangeCount!==1||n.anchorNode!==f.node||n.anchorOffset!==f.offset||n.focusNode!==M.node||n.focusOffset!==M.offset)&&(i=i.createRange(),i.setStart(f.node,f.offset),n.removeAllRanges(),p>u?(n.addRange(i),n.extend(M.node,M.offset)):(i.setEnd(M.node,M.offset),n.addRange(i)))}}for(i=[],n=o;n=n.parentNode;)n.nodeType===1&&i.push({element:n,left:n.scrollLeft,top:n.scrollTop});for(typeof o.focus=="function"&&o.focus(),o=0;o<i.length;o++)n=i[o],n.element.scrollLeft=n.left,n.element.scrollTop=n.top}}var H_=d&&"documentMode"in document&&11>=document.documentMode,us=null,vu=null,So=null,xu=!1;function Jd(n,i,o){var u=o.window===o?o.document:o.nodeType===9?o:o.ownerDocument;xu||us==null||us!==Ut(u)||(u=us,"selectionStart"in u&&_u(u)?u={start:u.selectionStart,end:u.selectionEnd}:(u=(u.ownerDocument&&u.ownerDocument.defaultView||window).getSelection(),u={anchorNode:u.anchorNode,anchorOffset:u.anchorOffset,focusNode:u.focusNode,focusOffset:u.focusOffset}),So&&yo(So,u)||(So=u,u=Sa(vu,"onSelect"),0<u.length&&(i=new uu("onSelect","select",null,i,o),n.push({event:i,listeners:u}),i.target=us)))}function va(n,i){var o={};return o[n.toLowerCase()]=i.toLowerCase(),o["Webkit"+n]="webkit"+i,o["Moz"+n]="moz"+i,o}var cs={animationend:va("Animation","AnimationEnd"),animationiteration:va("Animation","AnimationIteration"),animationstart:va("Animation","AnimationStart"),transitionend:va("Transition","TransitionEnd")},yu={},eh={};d&&(eh=document.createElement("div").style,"AnimationEvent"in window||(delete cs.animationend.animation,delete cs.animationiteration.animation,delete cs.animationstart.animation),"TransitionEvent"in window||delete cs.transitionend.transition);function xa(n){if(yu[n])return yu[n];if(!cs[n])return n;var i=cs[n],o;for(o in i)if(i.hasOwnProperty(o)&&o in eh)return yu[n]=i[o];return n}var th=xa("animationend"),nh=xa("animationiteration"),ih=xa("animationstart"),rh=xa("transitionend"),sh=new Map,oh="abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");function tr(n,i){sh.set(n,i),l(i,[n])}for(var Su=0;Su<oh.length;Su++){var Mu=oh[Su],V_=Mu.toLowerCase(),G_=Mu[0].toUpperCase()+Mu.slice(1);tr(V_,"on"+G_)}tr(th,"onAnimationEnd"),tr(nh,"onAnimationIteration"),tr(ih,"onAnimationStart"),tr("dblclick","onDoubleClick"),tr("focusin","onFocus"),tr("focusout","onBlur"),tr(rh,"onTransitionEnd"),c("onMouseEnter",["mouseout","mouseover"]),c("onMouseLeave",["mouseout","mouseover"]),c("onPointerEnter",["pointerout","pointerover"]),c("onPointerLeave",["pointerout","pointerover"]),l("onChange","change click focusin focusout input keydown keyup selectionchange".split(" ")),l("onSelect","focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" ")),l("onBeforeInput",["compositionend","keypress","textInput","paste"]),l("onCompositionEnd","compositionend focusout keydown keypress keyup mousedown".split(" ")),l("onCompositionStart","compositionstart focusout keydown keypress keyup mousedown".split(" ")),l("onCompositionUpdate","compositionupdate focusout keydown keypress keyup mousedown".split(" "));var Mo="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),W_=new Set("cancel close invalid load scroll toggle".split(" ").concat(Mo));function ah(n,i,o){var u=n.type||"unknown-event";n.currentTarget=o,sa(u,i,void 0,n),n.currentTarget=null}function lh(n,i){i=(i&4)!==0;for(var o=0;o<n.length;o++){var u=n[o],f=u.event;u=u.listeners;e:{var p=void 0;if(i)for(var M=u.length-1;0<=M;M--){var U=u[M],O=U.instance,Q=U.currentTarget;if(U=U.listener,O!==p&&f.isPropagationStopped())break e;ah(f,U,Q),p=O}else for(M=0;M<u.length;M++){if(U=u[M],O=U.instance,Q=U.currentTarget,U=U.listener,O!==p&&f.isPropagationStopped())break e;ah(f,U,Q),p=O}}}if(br)throw n=$i,br=!1,$i=null,n}function Ft(n,i){var o=i[bu];o===void 0&&(o=i[bu]=new Set);var u=n+"__bubble";o.has(u)||(uh(i,n,2,!1),o.add(u))}function Eu(n,i,o){var u=0;i&&(u|=4),uh(o,n,u,i)}var ya="_reactListening"+Math.random().toString(36).slice(2);function Eo(n){if(!n[ya]){n[ya]=!0,r.forEach(function(o){o!=="selectionchange"&&(W_.has(o)||Eu(o,!1,n),Eu(o,!0,n))});var i=n.nodeType===9?n:n.ownerDocument;i===null||i[ya]||(i[ya]=!0,Eu("selectionchange",!1,i))}}function uh(n,i,o,u){switch(Dd(i)){case 1:var f=r_;break;case 4:f=s_;break;default:f=ou}o=f.bind(null,i,o,n),f=void 0,!rs||i!=="touchstart"&&i!=="touchmove"&&i!=="wheel"||(f=!0),u?f!==void 0?n.addEventListener(i,o,{capture:!0,passive:f}):n.addEventListener(i,o,!0):f!==void 0?n.addEventListener(i,o,{passive:f}):n.addEventListener(i,o,!1)}function Tu(n,i,o,u,f){var p=u;if(!(i&1)&&!(i&2)&&u!==null)e:for(;;){if(u===null)return;var M=u.tag;if(M===3||M===4){var U=u.stateNode.containerInfo;if(U===f||U.nodeType===8&&U.parentNode===f)break;if(M===4)for(M=u.return;M!==null;){var O=M.tag;if((O===3||O===4)&&(O=M.stateNode.containerInfo,O===f||O.nodeType===8&&O.parentNode===f))return;M=M.return}for(;U!==null;){if(M=Lr(U),M===null)return;if(O=M.tag,O===5||O===6){u=p=M;continue e}U=U.parentNode}}u=u.return}Rn(function(){var Q=p,_e=V(o),xe=[];e:{var me=sh.get(n);if(me!==void 0){var Le=uu,ze=n;switch(n){case"keypress":if(pa(o)===0)break e;case"keydown":case"keyup":Le=y_;break;case"focusin":ze="focus",Le=du;break;case"focusout":ze="blur",Le=du;break;case"beforeblur":case"afterblur":Le=du;break;case"click":if(o.button===2)break e;case"auxclick":case"dblclick":case"mousedown":case"mousemove":case"mouseup":case"mouseout":case"mouseover":case"contextmenu":Le=Nd;break;case"drag":case"dragend":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"dragstart":case"drop":Le=l_;break;case"touchcancel":case"touchend":case"touchmove":case"touchstart":Le=E_;break;case th:case nh:case ih:Le=f_;break;case rh:Le=w_;break;case"scroll":Le=o_;break;case"wheel":Le=C_;break;case"copy":case"cut":case"paste":Le=h_;break;case"gotpointercapture":case"lostpointercapture":case"pointercancel":case"pointerdown":case"pointermove":case"pointerout":case"pointerover":case"pointerup":Le=Od}var Be=(i&4)!==0,Gt=!Be&&n==="scroll",q=Be?me!==null?me+"Capture":null:me;Be=[];for(var B=Q,$;B!==null;){$=B;var Ee=$.stateNode;if($.tag===5&&Ee!==null&&($=Ee,q!==null&&(Ee=vn(B,q),Ee!=null&&Be.push(To(B,Ee,$)))),Gt)break;B=B.return}0<Be.length&&(me=new Le(me,ze,null,o,_e),xe.push({event:me,listeners:Be}))}}if(!(i&7)){e:{if(me=n==="mouseover"||n==="pointerover",Le=n==="mouseout"||n==="pointerout",me&&o!==Tt&&(ze=o.relatedTarget||o.fromElement)&&(Lr(ze)||ze[bi]))break e;if((Le||me)&&(me=_e.window===_e?_e:(me=_e.ownerDocument)?me.defaultView||me.parentWindow:window,Le?(ze=o.relatedTarget||o.toElement,Le=Q,ze=ze?Lr(ze):null,ze!==null&&(Gt=gi(ze),ze!==Gt||ze.tag!==5&&ze.tag!==6)&&(ze=null)):(Le=null,ze=Q),Le!==ze)){if(Be=Nd,Ee="onMouseLeave",q="onMouseEnter",B="mouse",(n==="pointerout"||n==="pointerover")&&(Be=Od,Ee="onPointerLeave",q="onPointerEnter",B="pointer"),Gt=Le==null?me:hs(Le),$=ze==null?me:hs(ze),me=new Be(Ee,B+"leave",Le,o,_e),me.target=Gt,me.relatedTarget=$,Ee=null,Lr(_e)===Q&&(Be=new Be(q,B+"enter",ze,o,_e),Be.target=$,Be.relatedTarget=Gt,Ee=Be),Gt=Ee,Le&&ze)t:{for(Be=Le,q=ze,B=0,$=Be;$;$=fs($))B++;for($=0,Ee=q;Ee;Ee=fs(Ee))$++;for(;0<B-$;)Be=fs(Be),B--;for(;0<$-B;)q=fs(q),$--;for(;B--;){if(Be===q||q!==null&&Be===q.alternate)break t;Be=fs(Be),q=fs(q)}Be=null}else Be=null;Le!==null&&ch(xe,me,Le,Be,!1),ze!==null&&Gt!==null&&ch(xe,Gt,ze,Be,!0)}}e:{if(me=Q?hs(Q):window,Le=me.nodeName&&me.nodeName.toLowerCase(),Le==="select"||Le==="input"&&me.type==="file")var We=I_;else if(Gd(me))if(Xd)We=z_;else{We=F_;var $e=N_}else(Le=me.nodeName)&&Le.toLowerCase()==="input"&&(me.type==="checkbox"||me.type==="radio")&&(We=O_);if(We&&(We=We(n,Q))){Wd(xe,We,o,_e);break e}$e&&$e(n,me,Q),n==="focusout"&&($e=me._wrapperState)&&$e.controlled&&me.type==="number"&&wt(me,"number",me.value)}switch($e=Q?hs(Q):window,n){case"focusin":(Gd($e)||$e.contentEditable==="true")&&(us=$e,vu=Q,So=null);break;case"focusout":So=vu=us=null;break;case"mousedown":xu=!0;break;case"contextmenu":case"mouseup":case"dragend":xu=!1,Jd(xe,o,_e);break;case"selectionchange":if(H_)break;case"keydown":case"keyup":Jd(xe,o,_e)}var Ke;if(pu)e:{switch(n){case"compositionstart":var nt="onCompositionStart";break e;case"compositionend":nt="onCompositionEnd";break e;case"compositionupdate":nt="onCompositionUpdate";break e}nt=void 0}else ls?Hd(n,o)&&(nt="onCompositionEnd"):n==="keydown"&&o.keyCode===229&&(nt="onCompositionStart");nt&&(zd&&o.locale!=="ko"&&(ls||nt!=="onCompositionStart"?nt==="onCompositionEnd"&&ls&&(Ke=Ud()):(er=_e,lu="value"in er?er.value:er.textContent,ls=!0)),$e=Sa(Q,nt),0<$e.length&&(nt=new Fd(nt,n,null,o,_e),xe.push({event:nt,listeners:$e}),Ke?nt.data=Ke:(Ke=Vd(o),Ke!==null&&(nt.data=Ke)))),(Ke=P_?b_(n,o):L_(n,o))&&(Q=Sa(Q,"onBeforeInput"),0<Q.length&&(_e=new Fd("onBeforeInput","beforeinput",null,o,_e),xe.push({event:_e,listeners:Q}),_e.data=Ke))}lh(xe,i)})}function To(n,i,o){return{instance:n,listener:i,currentTarget:o}}function Sa(n,i){for(var o=i+"Capture",u=[];n!==null;){var f=n,p=f.stateNode;f.tag===5&&p!==null&&(f=p,p=vn(n,o),p!=null&&u.unshift(To(n,p,f)),p=vn(n,i),p!=null&&u.push(To(n,p,f))),n=n.return}return u}function fs(n){if(n===null)return null;do n=n.return;while(n&&n.tag!==5);return n||null}function ch(n,i,o,u,f){for(var p=i._reactName,M=[];o!==null&&o!==u;){var U=o,O=U.alternate,Q=U.stateNode;if(O!==null&&O===u)break;U.tag===5&&Q!==null&&(U=Q,f?(O=vn(o,p),O!=null&&M.unshift(To(o,O,U))):f||(O=vn(o,p),O!=null&&M.push(To(o,O,U)))),o=o.return}M.length!==0&&n.push({event:i,listeners:M})}var X_=/\r\n?/g,Y_=/\u0000|\uFFFD/g;function fh(n){return(typeof n=="string"?n:""+n).replace(X_,`
`).replace(Y_,"")}function Ma(n,i,o){if(i=fh(i),fh(n)!==i&&o)throw Error(t(425))}function Ea(){}var wu=null,Au=null;function Cu(n,i){return n==="textarea"||n==="noscript"||typeof i.children=="string"||typeof i.children=="number"||typeof i.dangerouslySetInnerHTML=="object"&&i.dangerouslySetInnerHTML!==null&&i.dangerouslySetInnerHTML.__html!=null}var Ru=typeof setTimeout=="function"?setTimeout:void 0,j_=typeof clearTimeout=="function"?clearTimeout:void 0,dh=typeof Promise=="function"?Promise:void 0,q_=typeof queueMicrotask=="function"?queueMicrotask:typeof dh<"u"?function(n){return dh.resolve(null).then(n).catch($_)}:Ru;function $_(n){setTimeout(function(){throw n})}function Pu(n,i){var o=i,u=0;do{var f=o.nextSibling;if(n.removeChild(o),f&&f.nodeType===8)if(o=f.data,o==="/$"){if(u===0){n.removeChild(f),po(i);return}u--}else o!=="$"&&o!=="$?"&&o!=="$!"||u++;o=f}while(o);po(i)}function nr(n){for(;n!=null;n=n.nextSibling){var i=n.nodeType;if(i===1||i===3)break;if(i===8){if(i=n.data,i==="$"||i==="$!"||i==="$?")break;if(i==="/$")return null}}return n}function hh(n){n=n.previousSibling;for(var i=0;n;){if(n.nodeType===8){var o=n.data;if(o==="$"||o==="$!"||o==="$?"){if(i===0)return n;i--}else o==="/$"&&i++}n=n.previousSibling}return null}var ds=Math.random().toString(36).slice(2),vi="__reactFiber$"+ds,wo="__reactProps$"+ds,bi="__reactContainer$"+ds,bu="__reactEvents$"+ds,K_="__reactListeners$"+ds,Z_="__reactHandles$"+ds;function Lr(n){var i=n[vi];if(i)return i;for(var o=n.parentNode;o;){if(i=o[bi]||o[vi]){if(o=i.alternate,i.child!==null||o!==null&&o.child!==null)for(n=hh(n);n!==null;){if(o=n[vi])return o;n=hh(n)}return i}n=o,o=n.parentNode}return null}function Ao(n){return n=n[vi]||n[bi],!n||n.tag!==5&&n.tag!==6&&n.tag!==13&&n.tag!==3?null:n}function hs(n){if(n.tag===5||n.tag===6)return n.stateNode;throw Error(t(33))}function Ta(n){return n[wo]||null}var Lu=[],ps=-1;function ir(n){return{current:n}}function Ot(n){0>ps||(n.current=Lu[ps],Lu[ps]=null,ps--)}function It(n,i){ps++,Lu[ps]=n.current,n.current=i}var rr={},cn=ir(rr),bn=ir(!1),Dr=rr;function ms(n,i){var o=n.type.contextTypes;if(!o)return rr;var u=n.stateNode;if(u&&u.__reactInternalMemoizedUnmaskedChildContext===i)return u.__reactInternalMemoizedMaskedChildContext;var f={},p;for(p in o)f[p]=i[p];return u&&(n=n.stateNode,n.__reactInternalMemoizedUnmaskedChildContext=i,n.__reactInternalMemoizedMaskedChildContext=f),f}function Ln(n){return n=n.childContextTypes,n!=null}function wa(){Ot(bn),Ot(cn)}function ph(n,i,o){if(cn.current!==rr)throw Error(t(168));It(cn,i),It(bn,o)}function mh(n,i,o){var u=n.stateNode;if(i=i.childContextTypes,typeof u.getChildContext!="function")return o;u=u.getChildContext();for(var f in u)if(!(f in i))throw Error(t(108,ve(n)||"Unknown",f));return re({},o,u)}function Aa(n){return n=(n=n.stateNode)&&n.__reactInternalMemoizedMergedChildContext||rr,Dr=cn.current,It(cn,n),It(bn,bn.current),!0}function gh(n,i,o){var u=n.stateNode;if(!u)throw Error(t(169));o?(n=mh(n,i,Dr),u.__reactInternalMemoizedMergedChildContext=n,Ot(bn),Ot(cn),It(cn,n)):Ot(bn),It(bn,o)}var Li=null,Ca=!1,Du=!1;function _h(n){Li===null?Li=[n]:Li.push(n)}function Q_(n){Ca=!0,_h(n)}function sr(){if(!Du&&Li!==null){Du=!0;var n=0,i=At;try{var o=Li;for(At=1;n<o.length;n++){var u=o[n];do u=u(!0);while(u!==null)}Li=null,Ca=!1}catch(f){throw Li!==null&&(Li=Li.slice(n+1)),J(ke,sr),f}finally{At=i,Du=!1}}return null}var gs=[],_s=0,Ra=null,Pa=0,Yn=[],jn=0,Ur=null,Di=1,Ui="";function Ir(n,i){gs[_s++]=Pa,gs[_s++]=Ra,Ra=n,Pa=i}function vh(n,i,o){Yn[jn++]=Di,Yn[jn++]=Ui,Yn[jn++]=Ur,Ur=n;var u=Di;n=Ui;var f=32-ot(u)-1;u&=~(1<<f),o+=1;var p=32-ot(i)+f;if(30<p){var M=f-f%5;p=(u&(1<<M)-1).toString(32),u>>=M,f-=M,Di=1<<32-ot(i)+f|o<<f|u,Ui=p+n}else Di=1<<p|o<<f|u,Ui=n}function Uu(n){n.return!==null&&(Ir(n,1),vh(n,1,0))}function Iu(n){for(;n===Ra;)Ra=gs[--_s],gs[_s]=null,Pa=gs[--_s],gs[_s]=null;for(;n===Ur;)Ur=Yn[--jn],Yn[jn]=null,Ui=Yn[--jn],Yn[jn]=null,Di=Yn[--jn],Yn[jn]=null}var kn=null,Bn=null,zt=!1,si=null;function xh(n,i){var o=Zn(5,null,null,0);o.elementType="DELETED",o.stateNode=i,o.return=n,i=n.deletions,i===null?(n.deletions=[o],n.flags|=16):i.push(o)}function yh(n,i){switch(n.tag){case 5:var o=n.type;return i=i.nodeType!==1||o.toLowerCase()!==i.nodeName.toLowerCase()?null:i,i!==null?(n.stateNode=i,kn=n,Bn=nr(i.firstChild),!0):!1;case 6:return i=n.pendingProps===""||i.nodeType!==3?null:i,i!==null?(n.stateNode=i,kn=n,Bn=null,!0):!1;case 13:return i=i.nodeType!==8?null:i,i!==null?(o=Ur!==null?{id:Di,overflow:Ui}:null,n.memoizedState={dehydrated:i,treeContext:o,retryLane:1073741824},o=Zn(18,null,null,0),o.stateNode=i,o.return=n,n.child=o,kn=n,Bn=null,!0):!1;default:return!1}}function Nu(n){return(n.mode&1)!==0&&(n.flags&128)===0}function Fu(n){if(zt){var i=Bn;if(i){var o=i;if(!yh(n,i)){if(Nu(n))throw Error(t(418));i=nr(o.nextSibling);var u=kn;i&&yh(n,i)?xh(u,o):(n.flags=n.flags&-4097|2,zt=!1,kn=n)}}else{if(Nu(n))throw Error(t(418));n.flags=n.flags&-4097|2,zt=!1,kn=n}}}function Sh(n){for(n=n.return;n!==null&&n.tag!==5&&n.tag!==3&&n.tag!==13;)n=n.return;kn=n}function ba(n){if(n!==kn)return!1;if(!zt)return Sh(n),zt=!0,!1;var i;if((i=n.tag!==3)&&!(i=n.tag!==5)&&(i=n.type,i=i!=="head"&&i!=="body"&&!Cu(n.type,n.memoizedProps)),i&&(i=Bn)){if(Nu(n))throw Mh(),Error(t(418));for(;i;)xh(n,i),i=nr(i.nextSibling)}if(Sh(n),n.tag===13){if(n=n.memoizedState,n=n!==null?n.dehydrated:null,!n)throw Error(t(317));e:{for(n=n.nextSibling,i=0;n;){if(n.nodeType===8){var o=n.data;if(o==="/$"){if(i===0){Bn=nr(n.nextSibling);break e}i--}else o!=="$"&&o!=="$!"&&o!=="$?"||i++}n=n.nextSibling}Bn=null}}else Bn=kn?nr(n.stateNode.nextSibling):null;return!0}function Mh(){for(var n=Bn;n;)n=nr(n.nextSibling)}function vs(){Bn=kn=null,zt=!1}function Ou(n){si===null?si=[n]:si.push(n)}var J_=R.ReactCurrentBatchConfig;function Co(n,i,o){if(n=o.ref,n!==null&&typeof n!="function"&&typeof n!="object"){if(o._owner){if(o=o._owner,o){if(o.tag!==1)throw Error(t(309));var u=o.stateNode}if(!u)throw Error(t(147,n));var f=u,p=""+n;return i!==null&&i.ref!==null&&typeof i.ref=="function"&&i.ref._stringRef===p?i.ref:(i=function(M){var U=f.refs;M===null?delete U[p]:U[p]=M},i._stringRef=p,i)}if(typeof n!="string")throw Error(t(284));if(!o._owner)throw Error(t(290,n))}return n}function La(n,i){throw n=Object.prototype.toString.call(i),Error(t(31,n==="[object Object]"?"object with keys {"+Object.keys(i).join(", ")+"}":n))}function Eh(n){var i=n._init;return i(n._payload)}function Th(n){function i(q,B){if(n){var $=q.deletions;$===null?(q.deletions=[B],q.flags|=16):$.push(B)}}function o(q,B){if(!n)return null;for(;B!==null;)i(q,B),B=B.sibling;return null}function u(q,B){for(q=new Map;B!==null;)B.key!==null?q.set(B.key,B):q.set(B.index,B),B=B.sibling;return q}function f(q,B){return q=hr(q,B),q.index=0,q.sibling=null,q}function p(q,B,$){return q.index=$,n?($=q.alternate,$!==null?($=$.index,$<B?(q.flags|=2,B):$):(q.flags|=2,B)):(q.flags|=1048576,B)}function M(q){return n&&q.alternate===null&&(q.flags|=2),q}function U(q,B,$,Ee){return B===null||B.tag!==6?(B=Rc($,q.mode,Ee),B.return=q,B):(B=f(B,$),B.return=q,B)}function O(q,B,$,Ee){var We=$.type;return We===F?_e(q,B,$.props.children,Ee,$.key):B!==null&&(B.elementType===We||typeof We=="object"&&We!==null&&We.$$typeof===oe&&Eh(We)===B.type)?(Ee=f(B,$.props),Ee.ref=Co(q,B,$),Ee.return=q,Ee):(Ee=tl($.type,$.key,$.props,null,q.mode,Ee),Ee.ref=Co(q,B,$),Ee.return=q,Ee)}function Q(q,B,$,Ee){return B===null||B.tag!==4||B.stateNode.containerInfo!==$.containerInfo||B.stateNode.implementation!==$.implementation?(B=Pc($,q.mode,Ee),B.return=q,B):(B=f(B,$.children||[]),B.return=q,B)}function _e(q,B,$,Ee,We){return B===null||B.tag!==7?(B=Vr($,q.mode,Ee,We),B.return=q,B):(B=f(B,$),B.return=q,B)}function xe(q,B,$){if(typeof B=="string"&&B!==""||typeof B=="number")return B=Rc(""+B,q.mode,$),B.return=q,B;if(typeof B=="object"&&B!==null){switch(B.$$typeof){case j:return $=tl(B.type,B.key,B.props,null,q.mode,$),$.ref=Co(q,null,B),$.return=q,$;case I:return B=Pc(B,q.mode,$),B.return=q,B;case oe:var Ee=B._init;return xe(q,Ee(B._payload),$)}if(Ye(B)||ae(B))return B=Vr(B,q.mode,$,null),B.return=q,B;La(q,B)}return null}function me(q,B,$,Ee){var We=B!==null?B.key:null;if(typeof $=="string"&&$!==""||typeof $=="number")return We!==null?null:U(q,B,""+$,Ee);if(typeof $=="object"&&$!==null){switch($.$$typeof){case j:return $.key===We?O(q,B,$,Ee):null;case I:return $.key===We?Q(q,B,$,Ee):null;case oe:return We=$._init,me(q,B,We($._payload),Ee)}if(Ye($)||ae($))return We!==null?null:_e(q,B,$,Ee,null);La(q,$)}return null}function Le(q,B,$,Ee,We){if(typeof Ee=="string"&&Ee!==""||typeof Ee=="number")return q=q.get($)||null,U(B,q,""+Ee,We);if(typeof Ee=="object"&&Ee!==null){switch(Ee.$$typeof){case j:return q=q.get(Ee.key===null?$:Ee.key)||null,O(B,q,Ee,We);case I:return q=q.get(Ee.key===null?$:Ee.key)||null,Q(B,q,Ee,We);case oe:var $e=Ee._init;return Le(q,B,$,$e(Ee._payload),We)}if(Ye(Ee)||ae(Ee))return q=q.get($)||null,_e(B,q,Ee,We,null);La(B,Ee)}return null}function ze(q,B,$,Ee){for(var We=null,$e=null,Ke=B,nt=B=0,nn=null;Ke!==null&&nt<$.length;nt++){Ke.index>nt?(nn=Ke,Ke=null):nn=Ke.sibling;var Mt=me(q,Ke,$[nt],Ee);if(Mt===null){Ke===null&&(Ke=nn);break}n&&Ke&&Mt.alternate===null&&i(q,Ke),B=p(Mt,B,nt),$e===null?We=Mt:$e.sibling=Mt,$e=Mt,Ke=nn}if(nt===$.length)return o(q,Ke),zt&&Ir(q,nt),We;if(Ke===null){for(;nt<$.length;nt++)Ke=xe(q,$[nt],Ee),Ke!==null&&(B=p(Ke,B,nt),$e===null?We=Ke:$e.sibling=Ke,$e=Ke);return zt&&Ir(q,nt),We}for(Ke=u(q,Ke);nt<$.length;nt++)nn=Le(Ke,q,nt,$[nt],Ee),nn!==null&&(n&&nn.alternate!==null&&Ke.delete(nn.key===null?nt:nn.key),B=p(nn,B,nt),$e===null?We=nn:$e.sibling=nn,$e=nn);return n&&Ke.forEach(function(pr){return i(q,pr)}),zt&&Ir(q,nt),We}function Be(q,B,$,Ee){var We=ae($);if(typeof We!="function")throw Error(t(150));if($=We.call($),$==null)throw Error(t(151));for(var $e=We=null,Ke=B,nt=B=0,nn=null,Mt=$.next();Ke!==null&&!Mt.done;nt++,Mt=$.next()){Ke.index>nt?(nn=Ke,Ke=null):nn=Ke.sibling;var pr=me(q,Ke,Mt.value,Ee);if(pr===null){Ke===null&&(Ke=nn);break}n&&Ke&&pr.alternate===null&&i(q,Ke),B=p(pr,B,nt),$e===null?We=pr:$e.sibling=pr,$e=pr,Ke=nn}if(Mt.done)return o(q,Ke),zt&&Ir(q,nt),We;if(Ke===null){for(;!Mt.done;nt++,Mt=$.next())Mt=xe(q,Mt.value,Ee),Mt!==null&&(B=p(Mt,B,nt),$e===null?We=Mt:$e.sibling=Mt,$e=Mt);return zt&&Ir(q,nt),We}for(Ke=u(q,Ke);!Mt.done;nt++,Mt=$.next())Mt=Le(Ke,q,nt,Mt.value,Ee),Mt!==null&&(n&&Mt.alternate!==null&&Ke.delete(Mt.key===null?nt:Mt.key),B=p(Mt,B,nt),$e===null?We=Mt:$e.sibling=Mt,$e=Mt);return n&&Ke.forEach(function(Dv){return i(q,Dv)}),zt&&Ir(q,nt),We}function Gt(q,B,$,Ee){if(typeof $=="object"&&$!==null&&$.type===F&&$.key===null&&($=$.props.children),typeof $=="object"&&$!==null){switch($.$$typeof){case j:e:{for(var We=$.key,$e=B;$e!==null;){if($e.key===We){if(We=$.type,We===F){if($e.tag===7){o(q,$e.sibling),B=f($e,$.props.children),B.return=q,q=B;break e}}else if($e.elementType===We||typeof We=="object"&&We!==null&&We.$$typeof===oe&&Eh(We)===$e.type){o(q,$e.sibling),B=f($e,$.props),B.ref=Co(q,$e,$),B.return=q,q=B;break e}o(q,$e);break}else i(q,$e);$e=$e.sibling}$.type===F?(B=Vr($.props.children,q.mode,Ee,$.key),B.return=q,q=B):(Ee=tl($.type,$.key,$.props,null,q.mode,Ee),Ee.ref=Co(q,B,$),Ee.return=q,q=Ee)}return M(q);case I:e:{for($e=$.key;B!==null;){if(B.key===$e)if(B.tag===4&&B.stateNode.containerInfo===$.containerInfo&&B.stateNode.implementation===$.implementation){o(q,B.sibling),B=f(B,$.children||[]),B.return=q,q=B;break e}else{o(q,B);break}else i(q,B);B=B.sibling}B=Pc($,q.mode,Ee),B.return=q,q=B}return M(q);case oe:return $e=$._init,Gt(q,B,$e($._payload),Ee)}if(Ye($))return ze(q,B,$,Ee);if(ae($))return Be(q,B,$,Ee);La(q,$)}return typeof $=="string"&&$!==""||typeof $=="number"?($=""+$,B!==null&&B.tag===6?(o(q,B.sibling),B=f(B,$),B.return=q,q=B):(o(q,B),B=Rc($,q.mode,Ee),B.return=q,q=B),M(q)):o(q,B)}return Gt}var xs=Th(!0),wh=Th(!1),Da=ir(null),Ua=null,ys=null,zu=null;function ku(){zu=ys=Ua=null}function Bu(n){var i=Da.current;Ot(Da),n._currentValue=i}function Hu(n,i,o){for(;n!==null;){var u=n.alternate;if((n.childLanes&i)!==i?(n.childLanes|=i,u!==null&&(u.childLanes|=i)):u!==null&&(u.childLanes&i)!==i&&(u.childLanes|=i),n===o)break;n=n.return}}function Ss(n,i){Ua=n,zu=ys=null,n=n.dependencies,n!==null&&n.firstContext!==null&&(n.lanes&i&&(Dn=!0),n.firstContext=null)}function qn(n){var i=n._currentValue;if(zu!==n)if(n={context:n,memoizedValue:i,next:null},ys===null){if(Ua===null)throw Error(t(308));ys=n,Ua.dependencies={lanes:0,firstContext:n}}else ys=ys.next=n;return i}var Nr=null;function Vu(n){Nr===null?Nr=[n]:Nr.push(n)}function Ah(n,i,o,u){var f=i.interleaved;return f===null?(o.next=o,Vu(i)):(o.next=f.next,f.next=o),i.interleaved=o,Ii(n,u)}function Ii(n,i){n.lanes|=i;var o=n.alternate;for(o!==null&&(o.lanes|=i),o=n,n=n.return;n!==null;)n.childLanes|=i,o=n.alternate,o!==null&&(o.childLanes|=i),o=n,n=n.return;return o.tag===3?o.stateNode:null}var or=!1;function Gu(n){n.updateQueue={baseState:n.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,interleaved:null,lanes:0},effects:null}}function Ch(n,i){n=n.updateQueue,i.updateQueue===n&&(i.updateQueue={baseState:n.baseState,firstBaseUpdate:n.firstBaseUpdate,lastBaseUpdate:n.lastBaseUpdate,shared:n.shared,effects:n.effects})}function Ni(n,i){return{eventTime:n,lane:i,tag:0,payload:null,callback:null,next:null}}function ar(n,i,o){var u=n.updateQueue;if(u===null)return null;if(u=u.shared,xt&2){var f=u.pending;return f===null?i.next=i:(i.next=f.next,f.next=i),u.pending=i,Ii(n,o)}return f=u.interleaved,f===null?(i.next=i,Vu(u)):(i.next=f.next,f.next=i),u.interleaved=i,Ii(n,o)}function Ia(n,i,o){if(i=i.updateQueue,i!==null&&(i=i.shared,(o&4194240)!==0)){var u=i.lanes;u&=n.pendingLanes,o|=u,i.lanes=o,iu(n,o)}}function Rh(n,i){var o=n.updateQueue,u=n.alternate;if(u!==null&&(u=u.updateQueue,o===u)){var f=null,p=null;if(o=o.firstBaseUpdate,o!==null){do{var M={eventTime:o.eventTime,lane:o.lane,tag:o.tag,payload:o.payload,callback:o.callback,next:null};p===null?f=p=M:p=p.next=M,o=o.next}while(o!==null);p===null?f=p=i:p=p.next=i}else f=p=i;o={baseState:u.baseState,firstBaseUpdate:f,lastBaseUpdate:p,shared:u.shared,effects:u.effects},n.updateQueue=o;return}n=o.lastBaseUpdate,n===null?o.firstBaseUpdate=i:n.next=i,o.lastBaseUpdate=i}function Na(n,i,o,u){var f=n.updateQueue;or=!1;var p=f.firstBaseUpdate,M=f.lastBaseUpdate,U=f.shared.pending;if(U!==null){f.shared.pending=null;var O=U,Q=O.next;O.next=null,M===null?p=Q:M.next=Q,M=O;var _e=n.alternate;_e!==null&&(_e=_e.updateQueue,U=_e.lastBaseUpdate,U!==M&&(U===null?_e.firstBaseUpdate=Q:U.next=Q,_e.lastBaseUpdate=O))}if(p!==null){var xe=f.baseState;M=0,_e=Q=O=null,U=p;do{var me=U.lane,Le=U.eventTime;if((u&me)===me){_e!==null&&(_e=_e.next={eventTime:Le,lane:0,tag:U.tag,payload:U.payload,callback:U.callback,next:null});e:{var ze=n,Be=U;switch(me=i,Le=o,Be.tag){case 1:if(ze=Be.payload,typeof ze=="function"){xe=ze.call(Le,xe,me);break e}xe=ze;break e;case 3:ze.flags=ze.flags&-65537|128;case 0:if(ze=Be.payload,me=typeof ze=="function"?ze.call(Le,xe,me):ze,me==null)break e;xe=re({},xe,me);break e;case 2:or=!0}}U.callback!==null&&U.lane!==0&&(n.flags|=64,me=f.effects,me===null?f.effects=[U]:me.push(U))}else Le={eventTime:Le,lane:me,tag:U.tag,payload:U.payload,callback:U.callback,next:null},_e===null?(Q=_e=Le,O=xe):_e=_e.next=Le,M|=me;if(U=U.next,U===null){if(U=f.shared.pending,U===null)break;me=U,U=me.next,me.next=null,f.lastBaseUpdate=me,f.shared.pending=null}}while(!0);if(_e===null&&(O=xe),f.baseState=O,f.firstBaseUpdate=Q,f.lastBaseUpdate=_e,i=f.shared.interleaved,i!==null){f=i;do M|=f.lane,f=f.next;while(f!==i)}else p===null&&(f.shared.lanes=0);zr|=M,n.lanes=M,n.memoizedState=xe}}function Ph(n,i,o){if(n=i.effects,i.effects=null,n!==null)for(i=0;i<n.length;i++){var u=n[i],f=u.callback;if(f!==null){if(u.callback=null,u=o,typeof f!="function")throw Error(t(191,f));f.call(u)}}}var Ro={},xi=ir(Ro),Po=ir(Ro),bo=ir(Ro);function Fr(n){if(n===Ro)throw Error(t(174));return n}function Wu(n,i){switch(It(bo,i),It(Po,n),It(xi,Ro),n=i.nodeType,n){case 9:case 11:i=(i=i.documentElement)?i.namespaceURI:He(null,"");break;default:n=n===8?i.parentNode:i,i=n.namespaceURI||null,n=n.tagName,i=He(i,n)}Ot(xi),It(xi,i)}function Ms(){Ot(xi),Ot(Po),Ot(bo)}function bh(n){Fr(bo.current);var i=Fr(xi.current),o=He(i,n.type);i!==o&&(It(Po,n),It(xi,o))}function Xu(n){Po.current===n&&(Ot(xi),Ot(Po))}var kt=ir(0);function Fa(n){for(var i=n;i!==null;){if(i.tag===13){var o=i.memoizedState;if(o!==null&&(o=o.dehydrated,o===null||o.data==="$?"||o.data==="$!"))return i}else if(i.tag===19&&i.memoizedProps.revealOrder!==void 0){if(i.flags&128)return i}else if(i.child!==null){i.child.return=i,i=i.child;continue}if(i===n)break;for(;i.sibling===null;){if(i.return===null||i.return===n)return null;i=i.return}i.sibling.return=i.return,i=i.sibling}return null}var Yu=[];function ju(){for(var n=0;n<Yu.length;n++)Yu[n]._workInProgressVersionPrimary=null;Yu.length=0}var Oa=R.ReactCurrentDispatcher,qu=R.ReactCurrentBatchConfig,Or=0,Bt=null,$t=null,en=null,za=!1,Lo=!1,Do=0,ev=0;function fn(){throw Error(t(321))}function $u(n,i){if(i===null)return!1;for(var o=0;o<i.length&&o<n.length;o++)if(!ri(n[o],i[o]))return!1;return!0}function Ku(n,i,o,u,f,p){if(Or=p,Bt=i,i.memoizedState=null,i.updateQueue=null,i.lanes=0,Oa.current=n===null||n.memoizedState===null?rv:sv,n=o(u,f),Lo){p=0;do{if(Lo=!1,Do=0,25<=p)throw Error(t(301));p+=1,en=$t=null,i.updateQueue=null,Oa.current=ov,n=o(u,f)}while(Lo)}if(Oa.current=Ha,i=$t!==null&&$t.next!==null,Or=0,en=$t=Bt=null,za=!1,i)throw Error(t(300));return n}function Zu(){var n=Do!==0;return Do=0,n}function yi(){var n={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return en===null?Bt.memoizedState=en=n:en=en.next=n,en}function $n(){if($t===null){var n=Bt.alternate;n=n!==null?n.memoizedState:null}else n=$t.next;var i=en===null?Bt.memoizedState:en.next;if(i!==null)en=i,$t=n;else{if(n===null)throw Error(t(310));$t=n,n={memoizedState:$t.memoizedState,baseState:$t.baseState,baseQueue:$t.baseQueue,queue:$t.queue,next:null},en===null?Bt.memoizedState=en=n:en=en.next=n}return en}function Uo(n,i){return typeof i=="function"?i(n):i}function Qu(n){var i=$n(),o=i.queue;if(o===null)throw Error(t(311));o.lastRenderedReducer=n;var u=$t,f=u.baseQueue,p=o.pending;if(p!==null){if(f!==null){var M=f.next;f.next=p.next,p.next=M}u.baseQueue=f=p,o.pending=null}if(f!==null){p=f.next,u=u.baseState;var U=M=null,O=null,Q=p;do{var _e=Q.lane;if((Or&_e)===_e)O!==null&&(O=O.next={lane:0,action:Q.action,hasEagerState:Q.hasEagerState,eagerState:Q.eagerState,next:null}),u=Q.hasEagerState?Q.eagerState:n(u,Q.action);else{var xe={lane:_e,action:Q.action,hasEagerState:Q.hasEagerState,eagerState:Q.eagerState,next:null};O===null?(U=O=xe,M=u):O=O.next=xe,Bt.lanes|=_e,zr|=_e}Q=Q.next}while(Q!==null&&Q!==p);O===null?M=u:O.next=U,ri(u,i.memoizedState)||(Dn=!0),i.memoizedState=u,i.baseState=M,i.baseQueue=O,o.lastRenderedState=u}if(n=o.interleaved,n!==null){f=n;do p=f.lane,Bt.lanes|=p,zr|=p,f=f.next;while(f!==n)}else f===null&&(o.lanes=0);return[i.memoizedState,o.dispatch]}function Ju(n){var i=$n(),o=i.queue;if(o===null)throw Error(t(311));o.lastRenderedReducer=n;var u=o.dispatch,f=o.pending,p=i.memoizedState;if(f!==null){o.pending=null;var M=f=f.next;do p=n(p,M.action),M=M.next;while(M!==f);ri(p,i.memoizedState)||(Dn=!0),i.memoizedState=p,i.baseQueue===null&&(i.baseState=p),o.lastRenderedState=p}return[p,u]}function Lh(){}function Dh(n,i){var o=Bt,u=$n(),f=i(),p=!ri(u.memoizedState,f);if(p&&(u.memoizedState=f,Dn=!0),u=u.queue,ec(Nh.bind(null,o,u,n),[n]),u.getSnapshot!==i||p||en!==null&&en.memoizedState.tag&1){if(o.flags|=2048,Io(9,Ih.bind(null,o,u,f,i),void 0,null),tn===null)throw Error(t(349));Or&30||Uh(o,i,f)}return f}function Uh(n,i,o){n.flags|=16384,n={getSnapshot:i,value:o},i=Bt.updateQueue,i===null?(i={lastEffect:null,stores:null},Bt.updateQueue=i,i.stores=[n]):(o=i.stores,o===null?i.stores=[n]:o.push(n))}function Ih(n,i,o,u){i.value=o,i.getSnapshot=u,Fh(i)&&Oh(n)}function Nh(n,i,o){return o(function(){Fh(i)&&Oh(n)})}function Fh(n){var i=n.getSnapshot;n=n.value;try{var o=i();return!ri(n,o)}catch{return!0}}function Oh(n){var i=Ii(n,1);i!==null&&ui(i,n,1,-1)}function zh(n){var i=yi();return typeof n=="function"&&(n=n()),i.memoizedState=i.baseState=n,n={pending:null,interleaved:null,lanes:0,dispatch:null,lastRenderedReducer:Uo,lastRenderedState:n},i.queue=n,n=n.dispatch=iv.bind(null,Bt,n),[i.memoizedState,n]}function Io(n,i,o,u){return n={tag:n,create:i,destroy:o,deps:u,next:null},i=Bt.updateQueue,i===null?(i={lastEffect:null,stores:null},Bt.updateQueue=i,i.lastEffect=n.next=n):(o=i.lastEffect,o===null?i.lastEffect=n.next=n:(u=o.next,o.next=n,n.next=u,i.lastEffect=n)),n}function kh(){return $n().memoizedState}function ka(n,i,o,u){var f=yi();Bt.flags|=n,f.memoizedState=Io(1|i,o,void 0,u===void 0?null:u)}function Ba(n,i,o,u){var f=$n();u=u===void 0?null:u;var p=void 0;if($t!==null){var M=$t.memoizedState;if(p=M.destroy,u!==null&&$u(u,M.deps)){f.memoizedState=Io(i,o,p,u);return}}Bt.flags|=n,f.memoizedState=Io(1|i,o,p,u)}function Bh(n,i){return ka(8390656,8,n,i)}function ec(n,i){return Ba(2048,8,n,i)}function Hh(n,i){return Ba(4,2,n,i)}function Vh(n,i){return Ba(4,4,n,i)}function Gh(n,i){if(typeof i=="function")return n=n(),i(n),function(){i(null)};if(i!=null)return n=n(),i.current=n,function(){i.current=null}}function Wh(n,i,o){return o=o!=null?o.concat([n]):null,Ba(4,4,Gh.bind(null,i,n),o)}function tc(){}function Xh(n,i){var o=$n();i=i===void 0?null:i;var u=o.memoizedState;return u!==null&&i!==null&&$u(i,u[1])?u[0]:(o.memoizedState=[n,i],n)}function Yh(n,i){var o=$n();i=i===void 0?null:i;var u=o.memoizedState;return u!==null&&i!==null&&$u(i,u[1])?u[0]:(n=n(),o.memoizedState=[n,i],n)}function jh(n,i,o){return Or&21?(ri(o,i)||(o=xn(),Bt.lanes|=o,zr|=o,n.baseState=!0),i):(n.baseState&&(n.baseState=!1,Dn=!0),n.memoizedState=o)}function tv(n,i){var o=At;At=o!==0&&4>o?o:4,n(!0);var u=qu.transition;qu.transition={};try{n(!1),i()}finally{At=o,qu.transition=u}}function qh(){return $n().memoizedState}function nv(n,i,o){var u=fr(n);if(o={lane:u,action:o,hasEagerState:!1,eagerState:null,next:null},$h(n))Kh(i,o);else if(o=Ah(n,i,o,u),o!==null){var f=Sn();ui(o,n,u,f),Zh(o,i,u)}}function iv(n,i,o){var u=fr(n),f={lane:u,action:o,hasEagerState:!1,eagerState:null,next:null};if($h(n))Kh(i,f);else{var p=n.alternate;if(n.lanes===0&&(p===null||p.lanes===0)&&(p=i.lastRenderedReducer,p!==null))try{var M=i.lastRenderedState,U=p(M,o);if(f.hasEagerState=!0,f.eagerState=U,ri(U,M)){var O=i.interleaved;O===null?(f.next=f,Vu(i)):(f.next=O.next,O.next=f),i.interleaved=f;return}}catch{}finally{}o=Ah(n,i,f,u),o!==null&&(f=Sn(),ui(o,n,u,f),Zh(o,i,u))}}function $h(n){var i=n.alternate;return n===Bt||i!==null&&i===Bt}function Kh(n,i){Lo=za=!0;var o=n.pending;o===null?i.next=i:(i.next=o.next,o.next=i),n.pending=i}function Zh(n,i,o){if(o&4194240){var u=i.lanes;u&=n.pendingLanes,o|=u,i.lanes=o,iu(n,o)}}var Ha={readContext:qn,useCallback:fn,useContext:fn,useEffect:fn,useImperativeHandle:fn,useInsertionEffect:fn,useLayoutEffect:fn,useMemo:fn,useReducer:fn,useRef:fn,useState:fn,useDebugValue:fn,useDeferredValue:fn,useTransition:fn,useMutableSource:fn,useSyncExternalStore:fn,useId:fn,unstable_isNewReconciler:!1},rv={readContext:qn,useCallback:function(n,i){return yi().memoizedState=[n,i===void 0?null:i],n},useContext:qn,useEffect:Bh,useImperativeHandle:function(n,i,o){return o=o!=null?o.concat([n]):null,ka(4194308,4,Gh.bind(null,i,n),o)},useLayoutEffect:function(n,i){return ka(4194308,4,n,i)},useInsertionEffect:function(n,i){return ka(4,2,n,i)},useMemo:function(n,i){var o=yi();return i=i===void 0?null:i,n=n(),o.memoizedState=[n,i],n},useReducer:function(n,i,o){var u=yi();return i=o!==void 0?o(i):i,u.memoizedState=u.baseState=i,n={pending:null,interleaved:null,lanes:0,dispatch:null,lastRenderedReducer:n,lastRenderedState:i},u.queue=n,n=n.dispatch=nv.bind(null,Bt,n),[u.memoizedState,n]},useRef:function(n){var i=yi();return n={current:n},i.memoizedState=n},useState:zh,useDebugValue:tc,useDeferredValue:function(n){return yi().memoizedState=n},useTransition:function(){var n=zh(!1),i=n[0];return n=tv.bind(null,n[1]),yi().memoizedState=n,[i,n]},useMutableSource:function(){},useSyncExternalStore:function(n,i,o){var u=Bt,f=yi();if(zt){if(o===void 0)throw Error(t(407));o=o()}else{if(o=i(),tn===null)throw Error(t(349));Or&30||Uh(u,i,o)}f.memoizedState=o;var p={value:o,getSnapshot:i};return f.queue=p,Bh(Nh.bind(null,u,p,n),[n]),u.flags|=2048,Io(9,Ih.bind(null,u,p,o,i),void 0,null),o},useId:function(){var n=yi(),i=tn.identifierPrefix;if(zt){var o=Ui,u=Di;o=(u&~(1<<32-ot(u)-1)).toString(32)+o,i=":"+i+"R"+o,o=Do++,0<o&&(i+="H"+o.toString(32)),i+=":"}else o=ev++,i=":"+i+"r"+o.toString(32)+":";return n.memoizedState=i},unstable_isNewReconciler:!1},sv={readContext:qn,useCallback:Xh,useContext:qn,useEffect:ec,useImperativeHandle:Wh,useInsertionEffect:Hh,useLayoutEffect:Vh,useMemo:Yh,useReducer:Qu,useRef:kh,useState:function(){return Qu(Uo)},useDebugValue:tc,useDeferredValue:function(n){var i=$n();return jh(i,$t.memoizedState,n)},useTransition:function(){var n=Qu(Uo)[0],i=$n().memoizedState;return[n,i]},useMutableSource:Lh,useSyncExternalStore:Dh,useId:qh,unstable_isNewReconciler:!1},ov={readContext:qn,useCallback:Xh,useContext:qn,useEffect:ec,useImperativeHandle:Wh,useInsertionEffect:Hh,useLayoutEffect:Vh,useMemo:Yh,useReducer:Ju,useRef:kh,useState:function(){return Ju(Uo)},useDebugValue:tc,useDeferredValue:function(n){var i=$n();return $t===null?i.memoizedState=n:jh(i,$t.memoizedState,n)},useTransition:function(){var n=Ju(Uo)[0],i=$n().memoizedState;return[n,i]},useMutableSource:Lh,useSyncExternalStore:Dh,useId:qh,unstable_isNewReconciler:!1};function oi(n,i){if(n&&n.defaultProps){i=re({},i),n=n.defaultProps;for(var o in n)i[o]===void 0&&(i[o]=n[o]);return i}return i}function nc(n,i,o,u){i=n.memoizedState,o=o(u,i),o=o==null?i:re({},i,o),n.memoizedState=o,n.lanes===0&&(n.updateQueue.baseState=o)}var Va={isMounted:function(n){return(n=n._reactInternals)?gi(n)===n:!1},enqueueSetState:function(n,i,o){n=n._reactInternals;var u=Sn(),f=fr(n),p=Ni(u,f);p.payload=i,o!=null&&(p.callback=o),i=ar(n,p,f),i!==null&&(ui(i,n,f,u),Ia(i,n,f))},enqueueReplaceState:function(n,i,o){n=n._reactInternals;var u=Sn(),f=fr(n),p=Ni(u,f);p.tag=1,p.payload=i,o!=null&&(p.callback=o),i=ar(n,p,f),i!==null&&(ui(i,n,f,u),Ia(i,n,f))},enqueueForceUpdate:function(n,i){n=n._reactInternals;var o=Sn(),u=fr(n),f=Ni(o,u);f.tag=2,i!=null&&(f.callback=i),i=ar(n,f,u),i!==null&&(ui(i,n,u,o),Ia(i,n,u))}};function Qh(n,i,o,u,f,p,M){return n=n.stateNode,typeof n.shouldComponentUpdate=="function"?n.shouldComponentUpdate(u,p,M):i.prototype&&i.prototype.isPureReactComponent?!yo(o,u)||!yo(f,p):!0}function Jh(n,i,o){var u=!1,f=rr,p=i.contextType;return typeof p=="object"&&p!==null?p=qn(p):(f=Ln(i)?Dr:cn.current,u=i.contextTypes,p=(u=u!=null)?ms(n,f):rr),i=new i(o,p),n.memoizedState=i.state!==null&&i.state!==void 0?i.state:null,i.updater=Va,n.stateNode=i,i._reactInternals=n,u&&(n=n.stateNode,n.__reactInternalMemoizedUnmaskedChildContext=f,n.__reactInternalMemoizedMaskedChildContext=p),i}function ep(n,i,o,u){n=i.state,typeof i.componentWillReceiveProps=="function"&&i.componentWillReceiveProps(o,u),typeof i.UNSAFE_componentWillReceiveProps=="function"&&i.UNSAFE_componentWillReceiveProps(o,u),i.state!==n&&Va.enqueueReplaceState(i,i.state,null)}function ic(n,i,o,u){var f=n.stateNode;f.props=o,f.state=n.memoizedState,f.refs={},Gu(n);var p=i.contextType;typeof p=="object"&&p!==null?f.context=qn(p):(p=Ln(i)?Dr:cn.current,f.context=ms(n,p)),f.state=n.memoizedState,p=i.getDerivedStateFromProps,typeof p=="function"&&(nc(n,i,p,o),f.state=n.memoizedState),typeof i.getDerivedStateFromProps=="function"||typeof f.getSnapshotBeforeUpdate=="function"||typeof f.UNSAFE_componentWillMount!="function"&&typeof f.componentWillMount!="function"||(i=f.state,typeof f.componentWillMount=="function"&&f.componentWillMount(),typeof f.UNSAFE_componentWillMount=="function"&&f.UNSAFE_componentWillMount(),i!==f.state&&Va.enqueueReplaceState(f,f.state,null),Na(n,o,f,u),f.state=n.memoizedState),typeof f.componentDidMount=="function"&&(n.flags|=4194308)}function Es(n,i){try{var o="",u=i;do o+=ue(u),u=u.return;while(u);var f=o}catch(p){f=`
Error generating stack: `+p.message+`
`+p.stack}return{value:n,source:i,stack:f,digest:null}}function rc(n,i,o){return{value:n,source:null,stack:o??null,digest:i??null}}function sc(n,i){try{console.error(i.value)}catch(o){setTimeout(function(){throw o})}}var av=typeof WeakMap=="function"?WeakMap:Map;function tp(n,i,o){o=Ni(-1,o),o.tag=3,o.payload={element:null};var u=i.value;return o.callback=function(){$a||($a=!0,yc=u),sc(n,i)},o}function np(n,i,o){o=Ni(-1,o),o.tag=3;var u=n.type.getDerivedStateFromError;if(typeof u=="function"){var f=i.value;o.payload=function(){return u(f)},o.callback=function(){sc(n,i)}}var p=n.stateNode;return p!==null&&typeof p.componentDidCatch=="function"&&(o.callback=function(){sc(n,i),typeof u!="function"&&(ur===null?ur=new Set([this]):ur.add(this));var M=i.stack;this.componentDidCatch(i.value,{componentStack:M!==null?M:""})}),o}function ip(n,i,o){var u=n.pingCache;if(u===null){u=n.pingCache=new av;var f=new Set;u.set(i,f)}else f=u.get(i),f===void 0&&(f=new Set,u.set(i,f));f.has(o)||(f.add(o),n=Sv.bind(null,n,i,o),i.then(n,n))}function rp(n){do{var i;if((i=n.tag===13)&&(i=n.memoizedState,i=i!==null?i.dehydrated!==null:!0),i)return n;n=n.return}while(n!==null);return null}function sp(n,i,o,u,f){return n.mode&1?(n.flags|=65536,n.lanes=f,n):(n===i?n.flags|=65536:(n.flags|=128,o.flags|=131072,o.flags&=-52805,o.tag===1&&(o.alternate===null?o.tag=17:(i=Ni(-1,1),i.tag=2,ar(o,i,1))),o.lanes|=1),n)}var lv=R.ReactCurrentOwner,Dn=!1;function yn(n,i,o,u){i.child=n===null?wh(i,null,o,u):xs(i,n.child,o,u)}function op(n,i,o,u,f){o=o.render;var p=i.ref;return Ss(i,f),u=Ku(n,i,o,u,p,f),o=Zu(),n!==null&&!Dn?(i.updateQueue=n.updateQueue,i.flags&=-2053,n.lanes&=~f,Fi(n,i,f)):(zt&&o&&Uu(i),i.flags|=1,yn(n,i,u,f),i.child)}function ap(n,i,o,u,f){if(n===null){var p=o.type;return typeof p=="function"&&!Cc(p)&&p.defaultProps===void 0&&o.compare===null&&o.defaultProps===void 0?(i.tag=15,i.type=p,lp(n,i,p,u,f)):(n=tl(o.type,null,u,i,i.mode,f),n.ref=i.ref,n.return=i,i.child=n)}if(p=n.child,!(n.lanes&f)){var M=p.memoizedProps;if(o=o.compare,o=o!==null?o:yo,o(M,u)&&n.ref===i.ref)return Fi(n,i,f)}return i.flags|=1,n=hr(p,u),n.ref=i.ref,n.return=i,i.child=n}function lp(n,i,o,u,f){if(n!==null){var p=n.memoizedProps;if(yo(p,u)&&n.ref===i.ref)if(Dn=!1,i.pendingProps=u=p,(n.lanes&f)!==0)n.flags&131072&&(Dn=!0);else return i.lanes=n.lanes,Fi(n,i,f)}return oc(n,i,o,u,f)}function up(n,i,o){var u=i.pendingProps,f=u.children,p=n!==null?n.memoizedState:null;if(u.mode==="hidden")if(!(i.mode&1))i.memoizedState={baseLanes:0,cachePool:null,transitions:null},It(ws,Hn),Hn|=o;else{if(!(o&1073741824))return n=p!==null?p.baseLanes|o:o,i.lanes=i.childLanes=1073741824,i.memoizedState={baseLanes:n,cachePool:null,transitions:null},i.updateQueue=null,It(ws,Hn),Hn|=n,null;i.memoizedState={baseLanes:0,cachePool:null,transitions:null},u=p!==null?p.baseLanes:o,It(ws,Hn),Hn|=u}else p!==null?(u=p.baseLanes|o,i.memoizedState=null):u=o,It(ws,Hn),Hn|=u;return yn(n,i,f,o),i.child}function cp(n,i){var o=i.ref;(n===null&&o!==null||n!==null&&n.ref!==o)&&(i.flags|=512,i.flags|=2097152)}function oc(n,i,o,u,f){var p=Ln(o)?Dr:cn.current;return p=ms(i,p),Ss(i,f),o=Ku(n,i,o,u,p,f),u=Zu(),n!==null&&!Dn?(i.updateQueue=n.updateQueue,i.flags&=-2053,n.lanes&=~f,Fi(n,i,f)):(zt&&u&&Uu(i),i.flags|=1,yn(n,i,o,f),i.child)}function fp(n,i,o,u,f){if(Ln(o)){var p=!0;Aa(i)}else p=!1;if(Ss(i,f),i.stateNode===null)Wa(n,i),Jh(i,o,u),ic(i,o,u,f),u=!0;else if(n===null){var M=i.stateNode,U=i.memoizedProps;M.props=U;var O=M.context,Q=o.contextType;typeof Q=="object"&&Q!==null?Q=qn(Q):(Q=Ln(o)?Dr:cn.current,Q=ms(i,Q));var _e=o.getDerivedStateFromProps,xe=typeof _e=="function"||typeof M.getSnapshotBeforeUpdate=="function";xe||typeof M.UNSAFE_componentWillReceiveProps!="function"&&typeof M.componentWillReceiveProps!="function"||(U!==u||O!==Q)&&ep(i,M,u,Q),or=!1;var me=i.memoizedState;M.state=me,Na(i,u,M,f),O=i.memoizedState,U!==u||me!==O||bn.current||or?(typeof _e=="function"&&(nc(i,o,_e,u),O=i.memoizedState),(U=or||Qh(i,o,U,u,me,O,Q))?(xe||typeof M.UNSAFE_componentWillMount!="function"&&typeof M.componentWillMount!="function"||(typeof M.componentWillMount=="function"&&M.componentWillMount(),typeof M.UNSAFE_componentWillMount=="function"&&M.UNSAFE_componentWillMount()),typeof M.componentDidMount=="function"&&(i.flags|=4194308)):(typeof M.componentDidMount=="function"&&(i.flags|=4194308),i.memoizedProps=u,i.memoizedState=O),M.props=u,M.state=O,M.context=Q,u=U):(typeof M.componentDidMount=="function"&&(i.flags|=4194308),u=!1)}else{M=i.stateNode,Ch(n,i),U=i.memoizedProps,Q=i.type===i.elementType?U:oi(i.type,U),M.props=Q,xe=i.pendingProps,me=M.context,O=o.contextType,typeof O=="object"&&O!==null?O=qn(O):(O=Ln(o)?Dr:cn.current,O=ms(i,O));var Le=o.getDerivedStateFromProps;(_e=typeof Le=="function"||typeof M.getSnapshotBeforeUpdate=="function")||typeof M.UNSAFE_componentWillReceiveProps!="function"&&typeof M.componentWillReceiveProps!="function"||(U!==xe||me!==O)&&ep(i,M,u,O),or=!1,me=i.memoizedState,M.state=me,Na(i,u,M,f);var ze=i.memoizedState;U!==xe||me!==ze||bn.current||or?(typeof Le=="function"&&(nc(i,o,Le,u),ze=i.memoizedState),(Q=or||Qh(i,o,Q,u,me,ze,O)||!1)?(_e||typeof M.UNSAFE_componentWillUpdate!="function"&&typeof M.componentWillUpdate!="function"||(typeof M.componentWillUpdate=="function"&&M.componentWillUpdate(u,ze,O),typeof M.UNSAFE_componentWillUpdate=="function"&&M.UNSAFE_componentWillUpdate(u,ze,O)),typeof M.componentDidUpdate=="function"&&(i.flags|=4),typeof M.getSnapshotBeforeUpdate=="function"&&(i.flags|=1024)):(typeof M.componentDidUpdate!="function"||U===n.memoizedProps&&me===n.memoizedState||(i.flags|=4),typeof M.getSnapshotBeforeUpdate!="function"||U===n.memoizedProps&&me===n.memoizedState||(i.flags|=1024),i.memoizedProps=u,i.memoizedState=ze),M.props=u,M.state=ze,M.context=O,u=Q):(typeof M.componentDidUpdate!="function"||U===n.memoizedProps&&me===n.memoizedState||(i.flags|=4),typeof M.getSnapshotBeforeUpdate!="function"||U===n.memoizedProps&&me===n.memoizedState||(i.flags|=1024),u=!1)}return ac(n,i,o,u,p,f)}function ac(n,i,o,u,f,p){cp(n,i);var M=(i.flags&128)!==0;if(!u&&!M)return f&&gh(i,o,!1),Fi(n,i,p);u=i.stateNode,lv.current=i;var U=M&&typeof o.getDerivedStateFromError!="function"?null:u.render();return i.flags|=1,n!==null&&M?(i.child=xs(i,n.child,null,p),i.child=xs(i,null,U,p)):yn(n,i,U,p),i.memoizedState=u.state,f&&gh(i,o,!0),i.child}function dp(n){var i=n.stateNode;i.pendingContext?ph(n,i.pendingContext,i.pendingContext!==i.context):i.context&&ph(n,i.context,!1),Wu(n,i.containerInfo)}function hp(n,i,o,u,f){return vs(),Ou(f),i.flags|=256,yn(n,i,o,u),i.child}var lc={dehydrated:null,treeContext:null,retryLane:0};function uc(n){return{baseLanes:n,cachePool:null,transitions:null}}function pp(n,i,o){var u=i.pendingProps,f=kt.current,p=!1,M=(i.flags&128)!==0,U;if((U=M)||(U=n!==null&&n.memoizedState===null?!1:(f&2)!==0),U?(p=!0,i.flags&=-129):(n===null||n.memoizedState!==null)&&(f|=1),It(kt,f&1),n===null)return Fu(i),n=i.memoizedState,n!==null&&(n=n.dehydrated,n!==null)?(i.mode&1?n.data==="$!"?i.lanes=8:i.lanes=1073741824:i.lanes=1,null):(M=u.children,n=u.fallback,p?(u=i.mode,p=i.child,M={mode:"hidden",children:M},!(u&1)&&p!==null?(p.childLanes=0,p.pendingProps=M):p=nl(M,u,0,null),n=Vr(n,u,o,null),p.return=i,n.return=i,p.sibling=n,i.child=p,i.child.memoizedState=uc(o),i.memoizedState=lc,n):cc(i,M));if(f=n.memoizedState,f!==null&&(U=f.dehydrated,U!==null))return uv(n,i,M,u,U,f,o);if(p){p=u.fallback,M=i.mode,f=n.child,U=f.sibling;var O={mode:"hidden",children:u.children};return!(M&1)&&i.child!==f?(u=i.child,u.childLanes=0,u.pendingProps=O,i.deletions=null):(u=hr(f,O),u.subtreeFlags=f.subtreeFlags&14680064),U!==null?p=hr(U,p):(p=Vr(p,M,o,null),p.flags|=2),p.return=i,u.return=i,u.sibling=p,i.child=u,u=p,p=i.child,M=n.child.memoizedState,M=M===null?uc(o):{baseLanes:M.baseLanes|o,cachePool:null,transitions:M.transitions},p.memoizedState=M,p.childLanes=n.childLanes&~o,i.memoizedState=lc,u}return p=n.child,n=p.sibling,u=hr(p,{mode:"visible",children:u.children}),!(i.mode&1)&&(u.lanes=o),u.return=i,u.sibling=null,n!==null&&(o=i.deletions,o===null?(i.deletions=[n],i.flags|=16):o.push(n)),i.child=u,i.memoizedState=null,u}function cc(n,i){return i=nl({mode:"visible",children:i},n.mode,0,null),i.return=n,n.child=i}function Ga(n,i,o,u){return u!==null&&Ou(u),xs(i,n.child,null,o),n=cc(i,i.pendingProps.children),n.flags|=2,i.memoizedState=null,n}function uv(n,i,o,u,f,p,M){if(o)return i.flags&256?(i.flags&=-257,u=rc(Error(t(422))),Ga(n,i,M,u)):i.memoizedState!==null?(i.child=n.child,i.flags|=128,null):(p=u.fallback,f=i.mode,u=nl({mode:"visible",children:u.children},f,0,null),p=Vr(p,f,M,null),p.flags|=2,u.return=i,p.return=i,u.sibling=p,i.child=u,i.mode&1&&xs(i,n.child,null,M),i.child.memoizedState=uc(M),i.memoizedState=lc,p);if(!(i.mode&1))return Ga(n,i,M,null);if(f.data==="$!"){if(u=f.nextSibling&&f.nextSibling.dataset,u)var U=u.dgst;return u=U,p=Error(t(419)),u=rc(p,u,void 0),Ga(n,i,M,u)}if(U=(M&n.childLanes)!==0,Dn||U){if(u=tn,u!==null){switch(M&-M){case 4:f=2;break;case 16:f=8;break;case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:f=32;break;case 536870912:f=268435456;break;default:f=0}f=f&(u.suspendedLanes|M)?0:f,f!==0&&f!==p.retryLane&&(p.retryLane=f,Ii(n,f),ui(u,n,f,-1))}return Ac(),u=rc(Error(t(421))),Ga(n,i,M,u)}return f.data==="$?"?(i.flags|=128,i.child=n.child,i=Mv.bind(null,n),f._reactRetry=i,null):(n=p.treeContext,Bn=nr(f.nextSibling),kn=i,zt=!0,si=null,n!==null&&(Yn[jn++]=Di,Yn[jn++]=Ui,Yn[jn++]=Ur,Di=n.id,Ui=n.overflow,Ur=i),i=cc(i,u.children),i.flags|=4096,i)}function mp(n,i,o){n.lanes|=i;var u=n.alternate;u!==null&&(u.lanes|=i),Hu(n.return,i,o)}function fc(n,i,o,u,f){var p=n.memoizedState;p===null?n.memoizedState={isBackwards:i,rendering:null,renderingStartTime:0,last:u,tail:o,tailMode:f}:(p.isBackwards=i,p.rendering=null,p.renderingStartTime=0,p.last=u,p.tail=o,p.tailMode=f)}function gp(n,i,o){var u=i.pendingProps,f=u.revealOrder,p=u.tail;if(yn(n,i,u.children,o),u=kt.current,u&2)u=u&1|2,i.flags|=128;else{if(n!==null&&n.flags&128)e:for(n=i.child;n!==null;){if(n.tag===13)n.memoizedState!==null&&mp(n,o,i);else if(n.tag===19)mp(n,o,i);else if(n.child!==null){n.child.return=n,n=n.child;continue}if(n===i)break e;for(;n.sibling===null;){if(n.return===null||n.return===i)break e;n=n.return}n.sibling.return=n.return,n=n.sibling}u&=1}if(It(kt,u),!(i.mode&1))i.memoizedState=null;else switch(f){case"forwards":for(o=i.child,f=null;o!==null;)n=o.alternate,n!==null&&Fa(n)===null&&(f=o),o=o.sibling;o=f,o===null?(f=i.child,i.child=null):(f=o.sibling,o.sibling=null),fc(i,!1,f,o,p);break;case"backwards":for(o=null,f=i.child,i.child=null;f!==null;){if(n=f.alternate,n!==null&&Fa(n)===null){i.child=f;break}n=f.sibling,f.sibling=o,o=f,f=n}fc(i,!0,o,null,p);break;case"together":fc(i,!1,null,null,void 0);break;default:i.memoizedState=null}return i.child}function Wa(n,i){!(i.mode&1)&&n!==null&&(n.alternate=null,i.alternate=null,i.flags|=2)}function Fi(n,i,o){if(n!==null&&(i.dependencies=n.dependencies),zr|=i.lanes,!(o&i.childLanes))return null;if(n!==null&&i.child!==n.child)throw Error(t(153));if(i.child!==null){for(n=i.child,o=hr(n,n.pendingProps),i.child=o,o.return=i;n.sibling!==null;)n=n.sibling,o=o.sibling=hr(n,n.pendingProps),o.return=i;o.sibling=null}return i.child}function cv(n,i,o){switch(i.tag){case 3:dp(i),vs();break;case 5:bh(i);break;case 1:Ln(i.type)&&Aa(i);break;case 4:Wu(i,i.stateNode.containerInfo);break;case 10:var u=i.type._context,f=i.memoizedProps.value;It(Da,u._currentValue),u._currentValue=f;break;case 13:if(u=i.memoizedState,u!==null)return u.dehydrated!==null?(It(kt,kt.current&1),i.flags|=128,null):o&i.child.childLanes?pp(n,i,o):(It(kt,kt.current&1),n=Fi(n,i,o),n!==null?n.sibling:null);It(kt,kt.current&1);break;case 19:if(u=(o&i.childLanes)!==0,n.flags&128){if(u)return gp(n,i,o);i.flags|=128}if(f=i.memoizedState,f!==null&&(f.rendering=null,f.tail=null,f.lastEffect=null),It(kt,kt.current),u)break;return null;case 22:case 23:return i.lanes=0,up(n,i,o)}return Fi(n,i,o)}var _p,dc,vp,xp;_p=function(n,i){for(var o=i.child;o!==null;){if(o.tag===5||o.tag===6)n.appendChild(o.stateNode);else if(o.tag!==4&&o.child!==null){o.child.return=o,o=o.child;continue}if(o===i)break;for(;o.sibling===null;){if(o.return===null||o.return===i)return;o=o.return}o.sibling.return=o.return,o=o.sibling}},dc=function(){},vp=function(n,i,o,u){var f=n.memoizedProps;if(f!==u){n=i.stateNode,Fr(xi.current);var p=null;switch(o){case"input":f=Y(n,f),u=Y(n,u),p=[];break;case"select":f=re({},f,{value:void 0}),u=re({},u,{value:void 0}),p=[];break;case"textarea":f=w(n,f),u=w(n,u),p=[];break;default:typeof f.onClick!="function"&&typeof u.onClick=="function"&&(n.onclick=Ea)}ft(o,u);var M;o=null;for(Q in f)if(!u.hasOwnProperty(Q)&&f.hasOwnProperty(Q)&&f[Q]!=null)if(Q==="style"){var U=f[Q];for(M in U)U.hasOwnProperty(M)&&(o||(o={}),o[M]="")}else Q!=="dangerouslySetInnerHTML"&&Q!=="children"&&Q!=="suppressContentEditableWarning"&&Q!=="suppressHydrationWarning"&&Q!=="autoFocus"&&(a.hasOwnProperty(Q)?p||(p=[]):(p=p||[]).push(Q,null));for(Q in u){var O=u[Q];if(U=f!=null?f[Q]:void 0,u.hasOwnProperty(Q)&&O!==U&&(O!=null||U!=null))if(Q==="style")if(U){for(M in U)!U.hasOwnProperty(M)||O&&O.hasOwnProperty(M)||(o||(o={}),o[M]="");for(M in O)O.hasOwnProperty(M)&&U[M]!==O[M]&&(o||(o={}),o[M]=O[M])}else o||(p||(p=[]),p.push(Q,o)),o=O;else Q==="dangerouslySetInnerHTML"?(O=O?O.__html:void 0,U=U?U.__html:void 0,O!=null&&U!==O&&(p=p||[]).push(Q,O)):Q==="children"?typeof O!="string"&&typeof O!="number"||(p=p||[]).push(Q,""+O):Q!=="suppressContentEditableWarning"&&Q!=="suppressHydrationWarning"&&(a.hasOwnProperty(Q)?(O!=null&&Q==="onScroll"&&Ft("scroll",n),p||U===O||(p=[])):(p=p||[]).push(Q,O))}o&&(p=p||[]).push("style",o);var Q=p;(i.updateQueue=Q)&&(i.flags|=4)}},xp=function(n,i,o,u){o!==u&&(i.flags|=4)};function No(n,i){if(!zt)switch(n.tailMode){case"hidden":i=n.tail;for(var o=null;i!==null;)i.alternate!==null&&(o=i),i=i.sibling;o===null?n.tail=null:o.sibling=null;break;case"collapsed":o=n.tail;for(var u=null;o!==null;)o.alternate!==null&&(u=o),o=o.sibling;u===null?i||n.tail===null?n.tail=null:n.tail.sibling=null:u.sibling=null}}function dn(n){var i=n.alternate!==null&&n.alternate.child===n.child,o=0,u=0;if(i)for(var f=n.child;f!==null;)o|=f.lanes|f.childLanes,u|=f.subtreeFlags&14680064,u|=f.flags&14680064,f.return=n,f=f.sibling;else for(f=n.child;f!==null;)o|=f.lanes|f.childLanes,u|=f.subtreeFlags,u|=f.flags,f.return=n,f=f.sibling;return n.subtreeFlags|=u,n.childLanes=o,i}function fv(n,i,o){var u=i.pendingProps;switch(Iu(i),i.tag){case 2:case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return dn(i),null;case 1:return Ln(i.type)&&wa(),dn(i),null;case 3:return u=i.stateNode,Ms(),Ot(bn),Ot(cn),ju(),u.pendingContext&&(u.context=u.pendingContext,u.pendingContext=null),(n===null||n.child===null)&&(ba(i)?i.flags|=4:n===null||n.memoizedState.isDehydrated&&!(i.flags&256)||(i.flags|=1024,si!==null&&(Ec(si),si=null))),dc(n,i),dn(i),null;case 5:Xu(i);var f=Fr(bo.current);if(o=i.type,n!==null&&i.stateNode!=null)vp(n,i,o,u,f),n.ref!==i.ref&&(i.flags|=512,i.flags|=2097152);else{if(!u){if(i.stateNode===null)throw Error(t(166));return dn(i),null}if(n=Fr(xi.current),ba(i)){u=i.stateNode,o=i.type;var p=i.memoizedProps;switch(u[vi]=i,u[wo]=p,n=(i.mode&1)!==0,o){case"dialog":Ft("cancel",u),Ft("close",u);break;case"iframe":case"object":case"embed":Ft("load",u);break;case"video":case"audio":for(f=0;f<Mo.length;f++)Ft(Mo[f],u);break;case"source":Ft("error",u);break;case"img":case"image":case"link":Ft("error",u),Ft("load",u);break;case"details":Ft("toggle",u);break;case"input":_n(u,p),Ft("invalid",u);break;case"select":u._wrapperState={wasMultiple:!!p.multiple},Ft("invalid",u);break;case"textarea":K(u,p),Ft("invalid",u)}ft(o,p),f=null;for(var M in p)if(p.hasOwnProperty(M)){var U=p[M];M==="children"?typeof U=="string"?u.textContent!==U&&(p.suppressHydrationWarning!==!0&&Ma(u.textContent,U,n),f=["children",U]):typeof U=="number"&&u.textContent!==""+U&&(p.suppressHydrationWarning!==!0&&Ma(u.textContent,U,n),f=["children",""+U]):a.hasOwnProperty(M)&&U!=null&&M==="onScroll"&&Ft("scroll",u)}switch(o){case"input":Ct(u),qe(u,p,!0);break;case"textarea":Ct(u),ge(u);break;case"select":case"option":break;default:typeof p.onClick=="function"&&(u.onclick=Ea)}u=f,i.updateQueue=u,u!==null&&(i.flags|=4)}else{M=f.nodeType===9?f:f.ownerDocument,n==="http://www.w3.org/1999/xhtml"&&(n=ce(o)),n==="http://www.w3.org/1999/xhtml"?o==="script"?(n=M.createElement("div"),n.innerHTML="<script><\/script>",n=n.removeChild(n.firstChild)):typeof u.is=="string"?n=M.createElement(o,{is:u.is}):(n=M.createElement(o),o==="select"&&(M=n,u.multiple?M.multiple=!0:u.size&&(M.size=u.size))):n=M.createElementNS(n,o),n[vi]=i,n[wo]=u,_p(n,i,!1,!1),i.stateNode=n;e:{switch(M=rt(o,u),o){case"dialog":Ft("cancel",n),Ft("close",n),f=u;break;case"iframe":case"object":case"embed":Ft("load",n),f=u;break;case"video":case"audio":for(f=0;f<Mo.length;f++)Ft(Mo[f],n);f=u;break;case"source":Ft("error",n),f=u;break;case"img":case"image":case"link":Ft("error",n),Ft("load",n),f=u;break;case"details":Ft("toggle",n),f=u;break;case"input":_n(n,u),f=Y(n,u),Ft("invalid",n);break;case"option":f=u;break;case"select":n._wrapperState={wasMultiple:!!u.multiple},f=re({},u,{value:void 0}),Ft("invalid",n);break;case"textarea":K(n,u),f=w(n,u),Ft("invalid",n);break;default:f=u}ft(o,f),U=f;for(p in U)if(U.hasOwnProperty(p)){var O=U[p];p==="style"?Je(n,O):p==="dangerouslySetInnerHTML"?(O=O?O.__html:void 0,O!=null&&Ie(n,O)):p==="children"?typeof O=="string"?(o!=="textarea"||O!=="")&&ut(n,O):typeof O=="number"&&ut(n,""+O):p!=="suppressContentEditableWarning"&&p!=="suppressHydrationWarning"&&p!=="autoFocus"&&(a.hasOwnProperty(p)?O!=null&&p==="onScroll"&&Ft("scroll",n):O!=null&&L(n,p,O,M))}switch(o){case"input":Ct(n),qe(n,u,!1);break;case"textarea":Ct(n),ge(n);break;case"option":u.value!=null&&n.setAttribute("value",""+we(u.value));break;case"select":n.multiple=!!u.multiple,p=u.value,p!=null?D(n,!!u.multiple,p,!1):u.defaultValue!=null&&D(n,!!u.multiple,u.defaultValue,!0);break;default:typeof f.onClick=="function"&&(n.onclick=Ea)}switch(o){case"button":case"input":case"select":case"textarea":u=!!u.autoFocus;break e;case"img":u=!0;break e;default:u=!1}}u&&(i.flags|=4)}i.ref!==null&&(i.flags|=512,i.flags|=2097152)}return dn(i),null;case 6:if(n&&i.stateNode!=null)xp(n,i,n.memoizedProps,u);else{if(typeof u!="string"&&i.stateNode===null)throw Error(t(166));if(o=Fr(bo.current),Fr(xi.current),ba(i)){if(u=i.stateNode,o=i.memoizedProps,u[vi]=i,(p=u.nodeValue!==o)&&(n=kn,n!==null))switch(n.tag){case 3:Ma(u.nodeValue,o,(n.mode&1)!==0);break;case 5:n.memoizedProps.suppressHydrationWarning!==!0&&Ma(u.nodeValue,o,(n.mode&1)!==0)}p&&(i.flags|=4)}else u=(o.nodeType===9?o:o.ownerDocument).createTextNode(u),u[vi]=i,i.stateNode=u}return dn(i),null;case 13:if(Ot(kt),u=i.memoizedState,n===null||n.memoizedState!==null&&n.memoizedState.dehydrated!==null){if(zt&&Bn!==null&&i.mode&1&&!(i.flags&128))Mh(),vs(),i.flags|=98560,p=!1;else if(p=ba(i),u!==null&&u.dehydrated!==null){if(n===null){if(!p)throw Error(t(318));if(p=i.memoizedState,p=p!==null?p.dehydrated:null,!p)throw Error(t(317));p[vi]=i}else vs(),!(i.flags&128)&&(i.memoizedState=null),i.flags|=4;dn(i),p=!1}else si!==null&&(Ec(si),si=null),p=!0;if(!p)return i.flags&65536?i:null}return i.flags&128?(i.lanes=o,i):(u=u!==null,u!==(n!==null&&n.memoizedState!==null)&&u&&(i.child.flags|=8192,i.mode&1&&(n===null||kt.current&1?Kt===0&&(Kt=3):Ac())),i.updateQueue!==null&&(i.flags|=4),dn(i),null);case 4:return Ms(),dc(n,i),n===null&&Eo(i.stateNode.containerInfo),dn(i),null;case 10:return Bu(i.type._context),dn(i),null;case 17:return Ln(i.type)&&wa(),dn(i),null;case 19:if(Ot(kt),p=i.memoizedState,p===null)return dn(i),null;if(u=(i.flags&128)!==0,M=p.rendering,M===null)if(u)No(p,!1);else{if(Kt!==0||n!==null&&n.flags&128)for(n=i.child;n!==null;){if(M=Fa(n),M!==null){for(i.flags|=128,No(p,!1),u=M.updateQueue,u!==null&&(i.updateQueue=u,i.flags|=4),i.subtreeFlags=0,u=o,o=i.child;o!==null;)p=o,n=u,p.flags&=14680066,M=p.alternate,M===null?(p.childLanes=0,p.lanes=n,p.child=null,p.subtreeFlags=0,p.memoizedProps=null,p.memoizedState=null,p.updateQueue=null,p.dependencies=null,p.stateNode=null):(p.childLanes=M.childLanes,p.lanes=M.lanes,p.child=M.child,p.subtreeFlags=0,p.deletions=null,p.memoizedProps=M.memoizedProps,p.memoizedState=M.memoizedState,p.updateQueue=M.updateQueue,p.type=M.type,n=M.dependencies,p.dependencies=n===null?null:{lanes:n.lanes,firstContext:n.firstContext}),o=o.sibling;return It(kt,kt.current&1|2),i.child}n=n.sibling}p.tail!==null&&Se()>As&&(i.flags|=128,u=!0,No(p,!1),i.lanes=4194304)}else{if(!u)if(n=Fa(M),n!==null){if(i.flags|=128,u=!0,o=n.updateQueue,o!==null&&(i.updateQueue=o,i.flags|=4),No(p,!0),p.tail===null&&p.tailMode==="hidden"&&!M.alternate&&!zt)return dn(i),null}else 2*Se()-p.renderingStartTime>As&&o!==1073741824&&(i.flags|=128,u=!0,No(p,!1),i.lanes=4194304);p.isBackwards?(M.sibling=i.child,i.child=M):(o=p.last,o!==null?o.sibling=M:i.child=M,p.last=M)}return p.tail!==null?(i=p.tail,p.rendering=i,p.tail=i.sibling,p.renderingStartTime=Se(),i.sibling=null,o=kt.current,It(kt,u?o&1|2:o&1),i):(dn(i),null);case 22:case 23:return wc(),u=i.memoizedState!==null,n!==null&&n.memoizedState!==null!==u&&(i.flags|=8192),u&&i.mode&1?Hn&1073741824&&(dn(i),i.subtreeFlags&6&&(i.flags|=8192)):dn(i),null;case 24:return null;case 25:return null}throw Error(t(156,i.tag))}function dv(n,i){switch(Iu(i),i.tag){case 1:return Ln(i.type)&&wa(),n=i.flags,n&65536?(i.flags=n&-65537|128,i):null;case 3:return Ms(),Ot(bn),Ot(cn),ju(),n=i.flags,n&65536&&!(n&128)?(i.flags=n&-65537|128,i):null;case 5:return Xu(i),null;case 13:if(Ot(kt),n=i.memoizedState,n!==null&&n.dehydrated!==null){if(i.alternate===null)throw Error(t(340));vs()}return n=i.flags,n&65536?(i.flags=n&-65537|128,i):null;case 19:return Ot(kt),null;case 4:return Ms(),null;case 10:return Bu(i.type._context),null;case 22:case 23:return wc(),null;case 24:return null;default:return null}}var Xa=!1,hn=!1,hv=typeof WeakSet=="function"?WeakSet:Set,Ne=null;function Ts(n,i){var o=n.ref;if(o!==null)if(typeof o=="function")try{o(null)}catch(u){Ht(n,i,u)}else o.current=null}function hc(n,i,o){try{o()}catch(u){Ht(n,i,u)}}var yp=!1;function pv(n,i){if(wu=fa,n=Qd(),_u(n)){if("selectionStart"in n)var o={start:n.selectionStart,end:n.selectionEnd};else e:{o=(o=n.ownerDocument)&&o.defaultView||window;var u=o.getSelection&&o.getSelection();if(u&&u.rangeCount!==0){o=u.anchorNode;var f=u.anchorOffset,p=u.focusNode;u=u.focusOffset;try{o.nodeType,p.nodeType}catch{o=null;break e}var M=0,U=-1,O=-1,Q=0,_e=0,xe=n,me=null;t:for(;;){for(var Le;xe!==o||f!==0&&xe.nodeType!==3||(U=M+f),xe!==p||u!==0&&xe.nodeType!==3||(O=M+u),xe.nodeType===3&&(M+=xe.nodeValue.length),(Le=xe.firstChild)!==null;)me=xe,xe=Le;for(;;){if(xe===n)break t;if(me===o&&++Q===f&&(U=M),me===p&&++_e===u&&(O=M),(Le=xe.nextSibling)!==null)break;xe=me,me=xe.parentNode}xe=Le}o=U===-1||O===-1?null:{start:U,end:O}}else o=null}o=o||{start:0,end:0}}else o=null;for(Au={focusedElem:n,selectionRange:o},fa=!1,Ne=i;Ne!==null;)if(i=Ne,n=i.child,(i.subtreeFlags&1028)!==0&&n!==null)n.return=i,Ne=n;else for(;Ne!==null;){i=Ne;try{var ze=i.alternate;if(i.flags&1024)switch(i.tag){case 0:case 11:case 15:break;case 1:if(ze!==null){var Be=ze.memoizedProps,Gt=ze.memoizedState,q=i.stateNode,B=q.getSnapshotBeforeUpdate(i.elementType===i.type?Be:oi(i.type,Be),Gt);q.__reactInternalSnapshotBeforeUpdate=B}break;case 3:var $=i.stateNode.containerInfo;$.nodeType===1?$.textContent="":$.nodeType===9&&$.documentElement&&$.removeChild($.documentElement);break;case 5:case 6:case 4:case 17:break;default:throw Error(t(163))}}catch(Ee){Ht(i,i.return,Ee)}if(n=i.sibling,n!==null){n.return=i.return,Ne=n;break}Ne=i.return}return ze=yp,yp=!1,ze}function Fo(n,i,o){var u=i.updateQueue;if(u=u!==null?u.lastEffect:null,u!==null){var f=u=u.next;do{if((f.tag&n)===n){var p=f.destroy;f.destroy=void 0,p!==void 0&&hc(i,o,p)}f=f.next}while(f!==u)}}function Ya(n,i){if(i=i.updateQueue,i=i!==null?i.lastEffect:null,i!==null){var o=i=i.next;do{if((o.tag&n)===n){var u=o.create;o.destroy=u()}o=o.next}while(o!==i)}}function pc(n){var i=n.ref;if(i!==null){var o=n.stateNode;switch(n.tag){case 5:n=o;break;default:n=o}typeof i=="function"?i(n):i.current=n}}function Sp(n){var i=n.alternate;i!==null&&(n.alternate=null,Sp(i)),n.child=null,n.deletions=null,n.sibling=null,n.tag===5&&(i=n.stateNode,i!==null&&(delete i[vi],delete i[wo],delete i[bu],delete i[K_],delete i[Z_])),n.stateNode=null,n.return=null,n.dependencies=null,n.memoizedProps=null,n.memoizedState=null,n.pendingProps=null,n.stateNode=null,n.updateQueue=null}function Mp(n){return n.tag===5||n.tag===3||n.tag===4}function Ep(n){e:for(;;){for(;n.sibling===null;){if(n.return===null||Mp(n.return))return null;n=n.return}for(n.sibling.return=n.return,n=n.sibling;n.tag!==5&&n.tag!==6&&n.tag!==18;){if(n.flags&2||n.child===null||n.tag===4)continue e;n.child.return=n,n=n.child}if(!(n.flags&2))return n.stateNode}}function mc(n,i,o){var u=n.tag;if(u===5||u===6)n=n.stateNode,i?o.nodeType===8?o.parentNode.insertBefore(n,i):o.insertBefore(n,i):(o.nodeType===8?(i=o.parentNode,i.insertBefore(n,o)):(i=o,i.appendChild(n)),o=o._reactRootContainer,o!=null||i.onclick!==null||(i.onclick=Ea));else if(u!==4&&(n=n.child,n!==null))for(mc(n,i,o),n=n.sibling;n!==null;)mc(n,i,o),n=n.sibling}function gc(n,i,o){var u=n.tag;if(u===5||u===6)n=n.stateNode,i?o.insertBefore(n,i):o.appendChild(n);else if(u!==4&&(n=n.child,n!==null))for(gc(n,i,o),n=n.sibling;n!==null;)gc(n,i,o),n=n.sibling}var on=null,ai=!1;function lr(n,i,o){for(o=o.child;o!==null;)Tp(n,i,o),o=o.sibling}function Tp(n,i,o){if(gt&&typeof gt.onCommitFiberUnmount=="function")try{gt.onCommitFiberUnmount(Et,o)}catch{}switch(o.tag){case 5:hn||Ts(o,i);case 6:var u=on,f=ai;on=null,lr(n,i,o),on=u,ai=f,on!==null&&(ai?(n=on,o=o.stateNode,n.nodeType===8?n.parentNode.removeChild(o):n.removeChild(o)):on.removeChild(o.stateNode));break;case 18:on!==null&&(ai?(n=on,o=o.stateNode,n.nodeType===8?Pu(n.parentNode,o):n.nodeType===1&&Pu(n,o),po(n)):Pu(on,o.stateNode));break;case 4:u=on,f=ai,on=o.stateNode.containerInfo,ai=!0,lr(n,i,o),on=u,ai=f;break;case 0:case 11:case 14:case 15:if(!hn&&(u=o.updateQueue,u!==null&&(u=u.lastEffect,u!==null))){f=u=u.next;do{var p=f,M=p.destroy;p=p.tag,M!==void 0&&(p&2||p&4)&&hc(o,i,M),f=f.next}while(f!==u)}lr(n,i,o);break;case 1:if(!hn&&(Ts(o,i),u=o.stateNode,typeof u.componentWillUnmount=="function"))try{u.props=o.memoizedProps,u.state=o.memoizedState,u.componentWillUnmount()}catch(U){Ht(o,i,U)}lr(n,i,o);break;case 21:lr(n,i,o);break;case 22:o.mode&1?(hn=(u=hn)||o.memoizedState!==null,lr(n,i,o),hn=u):lr(n,i,o);break;default:lr(n,i,o)}}function wp(n){var i=n.updateQueue;if(i!==null){n.updateQueue=null;var o=n.stateNode;o===null&&(o=n.stateNode=new hv),i.forEach(function(u){var f=Ev.bind(null,n,u);o.has(u)||(o.add(u),u.then(f,f))})}}function li(n,i){var o=i.deletions;if(o!==null)for(var u=0;u<o.length;u++){var f=o[u];try{var p=n,M=i,U=M;e:for(;U!==null;){switch(U.tag){case 5:on=U.stateNode,ai=!1;break e;case 3:on=U.stateNode.containerInfo,ai=!0;break e;case 4:on=U.stateNode.containerInfo,ai=!0;break e}U=U.return}if(on===null)throw Error(t(160));Tp(p,M,f),on=null,ai=!1;var O=f.alternate;O!==null&&(O.return=null),f.return=null}catch(Q){Ht(f,i,Q)}}if(i.subtreeFlags&12854)for(i=i.child;i!==null;)Ap(i,n),i=i.sibling}function Ap(n,i){var o=n.alternate,u=n.flags;switch(n.tag){case 0:case 11:case 14:case 15:if(li(i,n),Si(n),u&4){try{Fo(3,n,n.return),Ya(3,n)}catch(Be){Ht(n,n.return,Be)}try{Fo(5,n,n.return)}catch(Be){Ht(n,n.return,Be)}}break;case 1:li(i,n),Si(n),u&512&&o!==null&&Ts(o,o.return);break;case 5:if(li(i,n),Si(n),u&512&&o!==null&&Ts(o,o.return),n.flags&32){var f=n.stateNode;try{ut(f,"")}catch(Be){Ht(n,n.return,Be)}}if(u&4&&(f=n.stateNode,f!=null)){var p=n.memoizedProps,M=o!==null?o.memoizedProps:p,U=n.type,O=n.updateQueue;if(n.updateQueue=null,O!==null)try{U==="input"&&p.type==="radio"&&p.name!=null&&ht(f,p),rt(U,M);var Q=rt(U,p);for(M=0;M<O.length;M+=2){var _e=O[M],xe=O[M+1];_e==="style"?Je(f,xe):_e==="dangerouslySetInnerHTML"?Ie(f,xe):_e==="children"?ut(f,xe):L(f,_e,xe,Q)}switch(U){case"input":ct(f,p);break;case"textarea":pe(f,p);break;case"select":var me=f._wrapperState.wasMultiple;f._wrapperState.wasMultiple=!!p.multiple;var Le=p.value;Le!=null?D(f,!!p.multiple,Le,!1):me!==!!p.multiple&&(p.defaultValue!=null?D(f,!!p.multiple,p.defaultValue,!0):D(f,!!p.multiple,p.multiple?[]:"",!1))}f[wo]=p}catch(Be){Ht(n,n.return,Be)}}break;case 6:if(li(i,n),Si(n),u&4){if(n.stateNode===null)throw Error(t(162));f=n.stateNode,p=n.memoizedProps;try{f.nodeValue=p}catch(Be){Ht(n,n.return,Be)}}break;case 3:if(li(i,n),Si(n),u&4&&o!==null&&o.memoizedState.isDehydrated)try{po(i.containerInfo)}catch(Be){Ht(n,n.return,Be)}break;case 4:li(i,n),Si(n);break;case 13:li(i,n),Si(n),f=n.child,f.flags&8192&&(p=f.memoizedState!==null,f.stateNode.isHidden=p,!p||f.alternate!==null&&f.alternate.memoizedState!==null||(xc=Se())),u&4&&wp(n);break;case 22:if(_e=o!==null&&o.memoizedState!==null,n.mode&1?(hn=(Q=hn)||_e,li(i,n),hn=Q):li(i,n),Si(n),u&8192){if(Q=n.memoizedState!==null,(n.stateNode.isHidden=Q)&&!_e&&n.mode&1)for(Ne=n,_e=n.child;_e!==null;){for(xe=Ne=_e;Ne!==null;){switch(me=Ne,Le=me.child,me.tag){case 0:case 11:case 14:case 15:Fo(4,me,me.return);break;case 1:Ts(me,me.return);var ze=me.stateNode;if(typeof ze.componentWillUnmount=="function"){u=me,o=me.return;try{i=u,ze.props=i.memoizedProps,ze.state=i.memoizedState,ze.componentWillUnmount()}catch(Be){Ht(u,o,Be)}}break;case 5:Ts(me,me.return);break;case 22:if(me.memoizedState!==null){Pp(xe);continue}}Le!==null?(Le.return=me,Ne=Le):Pp(xe)}_e=_e.sibling}e:for(_e=null,xe=n;;){if(xe.tag===5){if(_e===null){_e=xe;try{f=xe.stateNode,Q?(p=f.style,typeof p.setProperty=="function"?p.setProperty("display","none","important"):p.display="none"):(U=xe.stateNode,O=xe.memoizedProps.style,M=O!=null&&O.hasOwnProperty("display")?O.display:null,U.style.display=Qe("display",M))}catch(Be){Ht(n,n.return,Be)}}}else if(xe.tag===6){if(_e===null)try{xe.stateNode.nodeValue=Q?"":xe.memoizedProps}catch(Be){Ht(n,n.return,Be)}}else if((xe.tag!==22&&xe.tag!==23||xe.memoizedState===null||xe===n)&&xe.child!==null){xe.child.return=xe,xe=xe.child;continue}if(xe===n)break e;for(;xe.sibling===null;){if(xe.return===null||xe.return===n)break e;_e===xe&&(_e=null),xe=xe.return}_e===xe&&(_e=null),xe.sibling.return=xe.return,xe=xe.sibling}}break;case 19:li(i,n),Si(n),u&4&&wp(n);break;case 21:break;default:li(i,n),Si(n)}}function Si(n){var i=n.flags;if(i&2){try{e:{for(var o=n.return;o!==null;){if(Mp(o)){var u=o;break e}o=o.return}throw Error(t(160))}switch(u.tag){case 5:var f=u.stateNode;u.flags&32&&(ut(f,""),u.flags&=-33);var p=Ep(n);gc(n,p,f);break;case 3:case 4:var M=u.stateNode.containerInfo,U=Ep(n);mc(n,U,M);break;default:throw Error(t(161))}}catch(O){Ht(n,n.return,O)}n.flags&=-3}i&4096&&(n.flags&=-4097)}function mv(n,i,o){Ne=n,Cp(n)}function Cp(n,i,o){for(var u=(n.mode&1)!==0;Ne!==null;){var f=Ne,p=f.child;if(f.tag===22&&u){var M=f.memoizedState!==null||Xa;if(!M){var U=f.alternate,O=U!==null&&U.memoizedState!==null||hn;U=Xa;var Q=hn;if(Xa=M,(hn=O)&&!Q)for(Ne=f;Ne!==null;)M=Ne,O=M.child,M.tag===22&&M.memoizedState!==null?bp(f):O!==null?(O.return=M,Ne=O):bp(f);for(;p!==null;)Ne=p,Cp(p),p=p.sibling;Ne=f,Xa=U,hn=Q}Rp(n)}else f.subtreeFlags&8772&&p!==null?(p.return=f,Ne=p):Rp(n)}}function Rp(n){for(;Ne!==null;){var i=Ne;if(i.flags&8772){var o=i.alternate;try{if(i.flags&8772)switch(i.tag){case 0:case 11:case 15:hn||Ya(5,i);break;case 1:var u=i.stateNode;if(i.flags&4&&!hn)if(o===null)u.componentDidMount();else{var f=i.elementType===i.type?o.memoizedProps:oi(i.type,o.memoizedProps);u.componentDidUpdate(f,o.memoizedState,u.__reactInternalSnapshotBeforeUpdate)}var p=i.updateQueue;p!==null&&Ph(i,p,u);break;case 3:var M=i.updateQueue;if(M!==null){if(o=null,i.child!==null)switch(i.child.tag){case 5:o=i.child.stateNode;break;case 1:o=i.child.stateNode}Ph(i,M,o)}break;case 5:var U=i.stateNode;if(o===null&&i.flags&4){o=U;var O=i.memoizedProps;switch(i.type){case"button":case"input":case"select":case"textarea":O.autoFocus&&o.focus();break;case"img":O.src&&(o.src=O.src)}}break;case 6:break;case 4:break;case 12:break;case 13:if(i.memoizedState===null){var Q=i.alternate;if(Q!==null){var _e=Q.memoizedState;if(_e!==null){var xe=_e.dehydrated;xe!==null&&po(xe)}}}break;case 19:case 17:case 21:case 22:case 23:case 25:break;default:throw Error(t(163))}hn||i.flags&512&&pc(i)}catch(me){Ht(i,i.return,me)}}if(i===n){Ne=null;break}if(o=i.sibling,o!==null){o.return=i.return,Ne=o;break}Ne=i.return}}function Pp(n){for(;Ne!==null;){var i=Ne;if(i===n){Ne=null;break}var o=i.sibling;if(o!==null){o.return=i.return,Ne=o;break}Ne=i.return}}function bp(n){for(;Ne!==null;){var i=Ne;try{switch(i.tag){case 0:case 11:case 15:var o=i.return;try{Ya(4,i)}catch(O){Ht(i,o,O)}break;case 1:var u=i.stateNode;if(typeof u.componentDidMount=="function"){var f=i.return;try{u.componentDidMount()}catch(O){Ht(i,f,O)}}var p=i.return;try{pc(i)}catch(O){Ht(i,p,O)}break;case 5:var M=i.return;try{pc(i)}catch(O){Ht(i,M,O)}}}catch(O){Ht(i,i.return,O)}if(i===n){Ne=null;break}var U=i.sibling;if(U!==null){U.return=i.return,Ne=U;break}Ne=i.return}}var gv=Math.ceil,ja=R.ReactCurrentDispatcher,_c=R.ReactCurrentOwner,Kn=R.ReactCurrentBatchConfig,xt=0,tn=null,Wt=null,an=0,Hn=0,ws=ir(0),Kt=0,Oo=null,zr=0,qa=0,vc=0,zo=null,Un=null,xc=0,As=1/0,Oi=null,$a=!1,yc=null,ur=null,Ka=!1,cr=null,Za=0,ko=0,Sc=null,Qa=-1,Ja=0;function Sn(){return xt&6?Se():Qa!==-1?Qa:Qa=Se()}function fr(n){return n.mode&1?xt&2&&an!==0?an&-an:J_.transition!==null?(Ja===0&&(Ja=xn()),Ja):(n=At,n!==0||(n=window.event,n=n===void 0?16:Dd(n.type)),n):1}function ui(n,i,o,u){if(50<ko)throw ko=0,Sc=null,Error(t(185));Pn(n,o,u),(!(xt&2)||n!==tn)&&(n===tn&&(!(xt&2)&&(qa|=o),Kt===4&&dr(n,an)),In(n,u),o===1&&xt===0&&!(i.mode&1)&&(As=Se()+500,Ca&&sr()))}function In(n,i){var o=n.callbackNode;Wn(n,i);var u=_i(n,n===tn?an:0);if(u===0)o!==null&&ee(o),n.callbackNode=null,n.callbackPriority=0;else if(i=u&-u,n.callbackPriority!==i){if(o!=null&&ee(o),i===1)n.tag===0?Q_(Dp.bind(null,n)):_h(Dp.bind(null,n)),q_(function(){!(xt&6)&&sr()}),o=null;else{switch(Td(u)){case 1:o=ke;break;case 4:o=tt;break;case 16:o=it;break;case 536870912:o=_t;break;default:o=it}o=Bp(o,Lp.bind(null,n))}n.callbackPriority=i,n.callbackNode=o}}function Lp(n,i){if(Qa=-1,Ja=0,xt&6)throw Error(t(327));var o=n.callbackNode;if(Cs()&&n.callbackNode!==o)return null;var u=_i(n,n===tn?an:0);if(u===0)return null;if(u&30||u&n.expiredLanes||i)i=el(n,u);else{i=u;var f=xt;xt|=2;var p=Ip();(tn!==n||an!==i)&&(Oi=null,As=Se()+500,Br(n,i));do try{xv();break}catch(U){Up(n,U)}while(!0);ku(),ja.current=p,xt=f,Wt!==null?i=0:(tn=null,an=0,i=Kt)}if(i!==0){if(i===2&&(f=Pi(n),f!==0&&(u=f,i=Mc(n,f))),i===1)throw o=Oo,Br(n,0),dr(n,u),In(n,Se()),o;if(i===6)dr(n,u);else{if(f=n.current.alternate,!(u&30)&&!_v(f)&&(i=el(n,u),i===2&&(p=Pi(n),p!==0&&(u=p,i=Mc(n,p))),i===1))throw o=Oo,Br(n,0),dr(n,u),In(n,Se()),o;switch(n.finishedWork=f,n.finishedLanes=u,i){case 0:case 1:throw Error(t(345));case 2:Hr(n,Un,Oi);break;case 3:if(dr(n,u),(u&130023424)===u&&(i=xc+500-Se(),10<i)){if(_i(n,0)!==0)break;if(f=n.suspendedLanes,(f&u)!==u){Sn(),n.pingedLanes|=n.suspendedLanes&f;break}n.timeoutHandle=Ru(Hr.bind(null,n,Un,Oi),i);break}Hr(n,Un,Oi);break;case 4:if(dr(n,u),(u&4194240)===u)break;for(i=n.eventTimes,f=-1;0<u;){var M=31-ot(u);p=1<<M,M=i[M],M>f&&(f=M),u&=~p}if(u=f,u=Se()-u,u=(120>u?120:480>u?480:1080>u?1080:1920>u?1920:3e3>u?3e3:4320>u?4320:1960*gv(u/1960))-u,10<u){n.timeoutHandle=Ru(Hr.bind(null,n,Un,Oi),u);break}Hr(n,Un,Oi);break;case 5:Hr(n,Un,Oi);break;default:throw Error(t(329))}}}return In(n,Se()),n.callbackNode===o?Lp.bind(null,n):null}function Mc(n,i){var o=zo;return n.current.memoizedState.isDehydrated&&(Br(n,i).flags|=256),n=el(n,i),n!==2&&(i=Un,Un=o,i!==null&&Ec(i)),n}function Ec(n){Un===null?Un=n:Un.push.apply(Un,n)}function _v(n){for(var i=n;;){if(i.flags&16384){var o=i.updateQueue;if(o!==null&&(o=o.stores,o!==null))for(var u=0;u<o.length;u++){var f=o[u],p=f.getSnapshot;f=f.value;try{if(!ri(p(),f))return!1}catch{return!1}}}if(o=i.child,i.subtreeFlags&16384&&o!==null)o.return=i,i=o;else{if(i===n)break;for(;i.sibling===null;){if(i.return===null||i.return===n)return!0;i=i.return}i.sibling.return=i.return,i=i.sibling}}return!0}function dr(n,i){for(i&=~vc,i&=~qa,n.suspendedLanes|=i,n.pingedLanes&=~i,n=n.expirationTimes;0<i;){var o=31-ot(i),u=1<<o;n[o]=-1,i&=~u}}function Dp(n){if(xt&6)throw Error(t(327));Cs();var i=_i(n,0);if(!(i&1))return In(n,Se()),null;var o=el(n,i);if(n.tag!==0&&o===2){var u=Pi(n);u!==0&&(i=u,o=Mc(n,u))}if(o===1)throw o=Oo,Br(n,0),dr(n,i),In(n,Se()),o;if(o===6)throw Error(t(345));return n.finishedWork=n.current.alternate,n.finishedLanes=i,Hr(n,Un,Oi),In(n,Se()),null}function Tc(n,i){var o=xt;xt|=1;try{return n(i)}finally{xt=o,xt===0&&(As=Se()+500,Ca&&sr())}}function kr(n){cr!==null&&cr.tag===0&&!(xt&6)&&Cs();var i=xt;xt|=1;var o=Kn.transition,u=At;try{if(Kn.transition=null,At=1,n)return n()}finally{At=u,Kn.transition=o,xt=i,!(xt&6)&&sr()}}function wc(){Hn=ws.current,Ot(ws)}function Br(n,i){n.finishedWork=null,n.finishedLanes=0;var o=n.timeoutHandle;if(o!==-1&&(n.timeoutHandle=-1,j_(o)),Wt!==null)for(o=Wt.return;o!==null;){var u=o;switch(Iu(u),u.tag){case 1:u=u.type.childContextTypes,u!=null&&wa();break;case 3:Ms(),Ot(bn),Ot(cn),ju();break;case 5:Xu(u);break;case 4:Ms();break;case 13:Ot(kt);break;case 19:Ot(kt);break;case 10:Bu(u.type._context);break;case 22:case 23:wc()}o=o.return}if(tn=n,Wt=n=hr(n.current,null),an=Hn=i,Kt=0,Oo=null,vc=qa=zr=0,Un=zo=null,Nr!==null){for(i=0;i<Nr.length;i++)if(o=Nr[i],u=o.interleaved,u!==null){o.interleaved=null;var f=u.next,p=o.pending;if(p!==null){var M=p.next;p.next=f,u.next=M}o.pending=u}Nr=null}return n}function Up(n,i){do{var o=Wt;try{if(ku(),Oa.current=Ha,za){for(var u=Bt.memoizedState;u!==null;){var f=u.queue;f!==null&&(f.pending=null),u=u.next}za=!1}if(Or=0,en=$t=Bt=null,Lo=!1,Do=0,_c.current=null,o===null||o.return===null){Kt=1,Oo=i,Wt=null;break}e:{var p=n,M=o.return,U=o,O=i;if(i=an,U.flags|=32768,O!==null&&typeof O=="object"&&typeof O.then=="function"){var Q=O,_e=U,xe=_e.tag;if(!(_e.mode&1)&&(xe===0||xe===11||xe===15)){var me=_e.alternate;me?(_e.updateQueue=me.updateQueue,_e.memoizedState=me.memoizedState,_e.lanes=me.lanes):(_e.updateQueue=null,_e.memoizedState=null)}var Le=rp(M);if(Le!==null){Le.flags&=-257,sp(Le,M,U,p,i),Le.mode&1&&ip(p,Q,i),i=Le,O=Q;var ze=i.updateQueue;if(ze===null){var Be=new Set;Be.add(O),i.updateQueue=Be}else ze.add(O);break e}else{if(!(i&1)){ip(p,Q,i),Ac();break e}O=Error(t(426))}}else if(zt&&U.mode&1){var Gt=rp(M);if(Gt!==null){!(Gt.flags&65536)&&(Gt.flags|=256),sp(Gt,M,U,p,i),Ou(Es(O,U));break e}}p=O=Es(O,U),Kt!==4&&(Kt=2),zo===null?zo=[p]:zo.push(p),p=M;do{switch(p.tag){case 3:p.flags|=65536,i&=-i,p.lanes|=i;var q=tp(p,O,i);Rh(p,q);break e;case 1:U=O;var B=p.type,$=p.stateNode;if(!(p.flags&128)&&(typeof B.getDerivedStateFromError=="function"||$!==null&&typeof $.componentDidCatch=="function"&&(ur===null||!ur.has($)))){p.flags|=65536,i&=-i,p.lanes|=i;var Ee=np(p,U,i);Rh(p,Ee);break e}}p=p.return}while(p!==null)}Fp(o)}catch(We){i=We,Wt===o&&o!==null&&(Wt=o=o.return);continue}break}while(!0)}function Ip(){var n=ja.current;return ja.current=Ha,n===null?Ha:n}function Ac(){(Kt===0||Kt===3||Kt===2)&&(Kt=4),tn===null||!(zr&268435455)&&!(qa&268435455)||dr(tn,an)}function el(n,i){var o=xt;xt|=2;var u=Ip();(tn!==n||an!==i)&&(Oi=null,Br(n,i));do try{vv();break}catch(f){Up(n,f)}while(!0);if(ku(),xt=o,ja.current=u,Wt!==null)throw Error(t(261));return tn=null,an=0,Kt}function vv(){for(;Wt!==null;)Np(Wt)}function xv(){for(;Wt!==null&&!X();)Np(Wt)}function Np(n){var i=kp(n.alternate,n,Hn);n.memoizedProps=n.pendingProps,i===null?Fp(n):Wt=i,_c.current=null}function Fp(n){var i=n;do{var o=i.alternate;if(n=i.return,i.flags&32768){if(o=dv(o,i),o!==null){o.flags&=32767,Wt=o;return}if(n!==null)n.flags|=32768,n.subtreeFlags=0,n.deletions=null;else{Kt=6,Wt=null;return}}else if(o=fv(o,i,Hn),o!==null){Wt=o;return}if(i=i.sibling,i!==null){Wt=i;return}Wt=i=n}while(i!==null);Kt===0&&(Kt=5)}function Hr(n,i,o){var u=At,f=Kn.transition;try{Kn.transition=null,At=1,yv(n,i,o,u)}finally{Kn.transition=f,At=u}return null}function yv(n,i,o,u){do Cs();while(cr!==null);if(xt&6)throw Error(t(327));o=n.finishedWork;var f=n.finishedLanes;if(o===null)return null;if(n.finishedWork=null,n.finishedLanes=0,o===n.current)throw Error(t(177));n.callbackNode=null,n.callbackPriority=0;var p=o.lanes|o.childLanes;if(la(n,p),n===tn&&(Wt=tn=null,an=0),!(o.subtreeFlags&2064)&&!(o.flags&2064)||Ka||(Ka=!0,Bp(it,function(){return Cs(),null})),p=(o.flags&15990)!==0,o.subtreeFlags&15990||p){p=Kn.transition,Kn.transition=null;var M=At;At=1;var U=xt;xt|=4,_c.current=null,pv(n,o),Ap(o,n),B_(Au),fa=!!wu,Au=wu=null,n.current=o,mv(o),Te(),xt=U,At=M,Kn.transition=p}else n.current=o;if(Ka&&(Ka=!1,cr=n,Za=f),p=n.pendingLanes,p===0&&(ur=null),ln(o.stateNode),In(n,Se()),i!==null)for(u=n.onRecoverableError,o=0;o<i.length;o++)f=i[o],u(f.value,{componentStack:f.stack,digest:f.digest});if($a)throw $a=!1,n=yc,yc=null,n;return Za&1&&n.tag!==0&&Cs(),p=n.pendingLanes,p&1?n===Sc?ko++:(ko=0,Sc=n):ko=0,sr(),null}function Cs(){if(cr!==null){var n=Td(Za),i=Kn.transition,o=At;try{if(Kn.transition=null,At=16>n?16:n,cr===null)var u=!1;else{if(n=cr,cr=null,Za=0,xt&6)throw Error(t(331));var f=xt;for(xt|=4,Ne=n.current;Ne!==null;){var p=Ne,M=p.child;if(Ne.flags&16){var U=p.deletions;if(U!==null){for(var O=0;O<U.length;O++){var Q=U[O];for(Ne=Q;Ne!==null;){var _e=Ne;switch(_e.tag){case 0:case 11:case 15:Fo(8,_e,p)}var xe=_e.child;if(xe!==null)xe.return=_e,Ne=xe;else for(;Ne!==null;){_e=Ne;var me=_e.sibling,Le=_e.return;if(Sp(_e),_e===Q){Ne=null;break}if(me!==null){me.return=Le,Ne=me;break}Ne=Le}}}var ze=p.alternate;if(ze!==null){var Be=ze.child;if(Be!==null){ze.child=null;do{var Gt=Be.sibling;Be.sibling=null,Be=Gt}while(Be!==null)}}Ne=p}}if(p.subtreeFlags&2064&&M!==null)M.return=p,Ne=M;else e:for(;Ne!==null;){if(p=Ne,p.flags&2048)switch(p.tag){case 0:case 11:case 15:Fo(9,p,p.return)}var q=p.sibling;if(q!==null){q.return=p.return,Ne=q;break e}Ne=p.return}}var B=n.current;for(Ne=B;Ne!==null;){M=Ne;var $=M.child;if(M.subtreeFlags&2064&&$!==null)$.return=M,Ne=$;else e:for(M=B;Ne!==null;){if(U=Ne,U.flags&2048)try{switch(U.tag){case 0:case 11:case 15:Ya(9,U)}}catch(We){Ht(U,U.return,We)}if(U===M){Ne=null;break e}var Ee=U.sibling;if(Ee!==null){Ee.return=U.return,Ne=Ee;break e}Ne=U.return}}if(xt=f,sr(),gt&&typeof gt.onPostCommitFiberRoot=="function")try{gt.onPostCommitFiberRoot(Et,n)}catch{}u=!0}return u}finally{At=o,Kn.transition=i}}return!1}function Op(n,i,o){i=Es(o,i),i=tp(n,i,1),n=ar(n,i,1),i=Sn(),n!==null&&(Pn(n,1,i),In(n,i))}function Ht(n,i,o){if(n.tag===3)Op(n,n,o);else for(;i!==null;){if(i.tag===3){Op(i,n,o);break}else if(i.tag===1){var u=i.stateNode;if(typeof i.type.getDerivedStateFromError=="function"||typeof u.componentDidCatch=="function"&&(ur===null||!ur.has(u))){n=Es(o,n),n=np(i,n,1),i=ar(i,n,1),n=Sn(),i!==null&&(Pn(i,1,n),In(i,n));break}}i=i.return}}function Sv(n,i,o){var u=n.pingCache;u!==null&&u.delete(i),i=Sn(),n.pingedLanes|=n.suspendedLanes&o,tn===n&&(an&o)===o&&(Kt===4||Kt===3&&(an&130023424)===an&&500>Se()-xc?Br(n,0):vc|=o),In(n,i)}function zp(n,i){i===0&&(n.mode&1?(i=ii,ii<<=1,!(ii&130023424)&&(ii=4194304)):i=1);var o=Sn();n=Ii(n,i),n!==null&&(Pn(n,i,o),In(n,o))}function Mv(n){var i=n.memoizedState,o=0;i!==null&&(o=i.retryLane),zp(n,o)}function Ev(n,i){var o=0;switch(n.tag){case 13:var u=n.stateNode,f=n.memoizedState;f!==null&&(o=f.retryLane);break;case 19:u=n.stateNode;break;default:throw Error(t(314))}u!==null&&u.delete(i),zp(n,o)}var kp;kp=function(n,i,o){if(n!==null)if(n.memoizedProps!==i.pendingProps||bn.current)Dn=!0;else{if(!(n.lanes&o)&&!(i.flags&128))return Dn=!1,cv(n,i,o);Dn=!!(n.flags&131072)}else Dn=!1,zt&&i.flags&1048576&&vh(i,Pa,i.index);switch(i.lanes=0,i.tag){case 2:var u=i.type;Wa(n,i),n=i.pendingProps;var f=ms(i,cn.current);Ss(i,o),f=Ku(null,i,u,n,f,o);var p=Zu();return i.flags|=1,typeof f=="object"&&f!==null&&typeof f.render=="function"&&f.$$typeof===void 0?(i.tag=1,i.memoizedState=null,i.updateQueue=null,Ln(u)?(p=!0,Aa(i)):p=!1,i.memoizedState=f.state!==null&&f.state!==void 0?f.state:null,Gu(i),f.updater=Va,i.stateNode=f,f._reactInternals=i,ic(i,u,n,o),i=ac(null,i,u,!0,p,o)):(i.tag=0,zt&&p&&Uu(i),yn(null,i,f,o),i=i.child),i;case 16:u=i.elementType;e:{switch(Wa(n,i),n=i.pendingProps,f=u._init,u=f(u._payload),i.type=u,f=i.tag=wv(u),n=oi(u,n),f){case 0:i=oc(null,i,u,n,o);break e;case 1:i=fp(null,i,u,n,o);break e;case 11:i=op(null,i,u,n,o);break e;case 14:i=ap(null,i,u,oi(u.type,n),o);break e}throw Error(t(306,u,""))}return i;case 0:return u=i.type,f=i.pendingProps,f=i.elementType===u?f:oi(u,f),oc(n,i,u,f,o);case 1:return u=i.type,f=i.pendingProps,f=i.elementType===u?f:oi(u,f),fp(n,i,u,f,o);case 3:e:{if(dp(i),n===null)throw Error(t(387));u=i.pendingProps,p=i.memoizedState,f=p.element,Ch(n,i),Na(i,u,null,o);var M=i.memoizedState;if(u=M.element,p.isDehydrated)if(p={element:u,isDehydrated:!1,cache:M.cache,pendingSuspenseBoundaries:M.pendingSuspenseBoundaries,transitions:M.transitions},i.updateQueue.baseState=p,i.memoizedState=p,i.flags&256){f=Es(Error(t(423)),i),i=hp(n,i,u,o,f);break e}else if(u!==f){f=Es(Error(t(424)),i),i=hp(n,i,u,o,f);break e}else for(Bn=nr(i.stateNode.containerInfo.firstChild),kn=i,zt=!0,si=null,o=wh(i,null,u,o),i.child=o;o;)o.flags=o.flags&-3|4096,o=o.sibling;else{if(vs(),u===f){i=Fi(n,i,o);break e}yn(n,i,u,o)}i=i.child}return i;case 5:return bh(i),n===null&&Fu(i),u=i.type,f=i.pendingProps,p=n!==null?n.memoizedProps:null,M=f.children,Cu(u,f)?M=null:p!==null&&Cu(u,p)&&(i.flags|=32),cp(n,i),yn(n,i,M,o),i.child;case 6:return n===null&&Fu(i),null;case 13:return pp(n,i,o);case 4:return Wu(i,i.stateNode.containerInfo),u=i.pendingProps,n===null?i.child=xs(i,null,u,o):yn(n,i,u,o),i.child;case 11:return u=i.type,f=i.pendingProps,f=i.elementType===u?f:oi(u,f),op(n,i,u,f,o);case 7:return yn(n,i,i.pendingProps,o),i.child;case 8:return yn(n,i,i.pendingProps.children,o),i.child;case 12:return yn(n,i,i.pendingProps.children,o),i.child;case 10:e:{if(u=i.type._context,f=i.pendingProps,p=i.memoizedProps,M=f.value,It(Da,u._currentValue),u._currentValue=M,p!==null)if(ri(p.value,M)){if(p.children===f.children&&!bn.current){i=Fi(n,i,o);break e}}else for(p=i.child,p!==null&&(p.return=i);p!==null;){var U=p.dependencies;if(U!==null){M=p.child;for(var O=U.firstContext;O!==null;){if(O.context===u){if(p.tag===1){O=Ni(-1,o&-o),O.tag=2;var Q=p.updateQueue;if(Q!==null){Q=Q.shared;var _e=Q.pending;_e===null?O.next=O:(O.next=_e.next,_e.next=O),Q.pending=O}}p.lanes|=o,O=p.alternate,O!==null&&(O.lanes|=o),Hu(p.return,o,i),U.lanes|=o;break}O=O.next}}else if(p.tag===10)M=p.type===i.type?null:p.child;else if(p.tag===18){if(M=p.return,M===null)throw Error(t(341));M.lanes|=o,U=M.alternate,U!==null&&(U.lanes|=o),Hu(M,o,i),M=p.sibling}else M=p.child;if(M!==null)M.return=p;else for(M=p;M!==null;){if(M===i){M=null;break}if(p=M.sibling,p!==null){p.return=M.return,M=p;break}M=M.return}p=M}yn(n,i,f.children,o),i=i.child}return i;case 9:return f=i.type,u=i.pendingProps.children,Ss(i,o),f=qn(f),u=u(f),i.flags|=1,yn(n,i,u,o),i.child;case 14:return u=i.type,f=oi(u,i.pendingProps),f=oi(u.type,f),ap(n,i,u,f,o);case 15:return lp(n,i,i.type,i.pendingProps,o);case 17:return u=i.type,f=i.pendingProps,f=i.elementType===u?f:oi(u,f),Wa(n,i),i.tag=1,Ln(u)?(n=!0,Aa(i)):n=!1,Ss(i,o),Jh(i,u,f),ic(i,u,f,o),ac(null,i,u,!0,n,o);case 19:return gp(n,i,o);case 22:return up(n,i,o)}throw Error(t(156,i.tag))};function Bp(n,i){return J(n,i)}function Tv(n,i,o,u){this.tag=n,this.key=o,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.ref=null,this.pendingProps=i,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=u,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function Zn(n,i,o,u){return new Tv(n,i,o,u)}function Cc(n){return n=n.prototype,!(!n||!n.isReactComponent)}function wv(n){if(typeof n=="function")return Cc(n)?1:0;if(n!=null){if(n=n.$$typeof,n===se)return 11;if(n===he)return 14}return 2}function hr(n,i){var o=n.alternate;return o===null?(o=Zn(n.tag,i,n.key,n.mode),o.elementType=n.elementType,o.type=n.type,o.stateNode=n.stateNode,o.alternate=n,n.alternate=o):(o.pendingProps=i,o.type=n.type,o.flags=0,o.subtreeFlags=0,o.deletions=null),o.flags=n.flags&14680064,o.childLanes=n.childLanes,o.lanes=n.lanes,o.child=n.child,o.memoizedProps=n.memoizedProps,o.memoizedState=n.memoizedState,o.updateQueue=n.updateQueue,i=n.dependencies,o.dependencies=i===null?null:{lanes:i.lanes,firstContext:i.firstContext},o.sibling=n.sibling,o.index=n.index,o.ref=n.ref,o}function tl(n,i,o,u,f,p){var M=2;if(u=n,typeof n=="function")Cc(n)&&(M=1);else if(typeof n=="string")M=5;else e:switch(n){case F:return Vr(o.children,f,p,i);case H:M=8,f|=8;break;case b:return n=Zn(12,o,i,f|2),n.elementType=b,n.lanes=p,n;case te:return n=Zn(13,o,i,f),n.elementType=te,n.lanes=p,n;case fe:return n=Zn(19,o,i,f),n.elementType=fe,n.lanes=p,n;case le:return nl(o,f,p,i);default:if(typeof n=="object"&&n!==null)switch(n.$$typeof){case A:M=10;break e;case z:M=9;break e;case se:M=11;break e;case he:M=14;break e;case oe:M=16,u=null;break e}throw Error(t(130,n==null?n:typeof n,""))}return i=Zn(M,o,i,f),i.elementType=n,i.type=u,i.lanes=p,i}function Vr(n,i,o,u){return n=Zn(7,n,u,i),n.lanes=o,n}function nl(n,i,o,u){return n=Zn(22,n,u,i),n.elementType=le,n.lanes=o,n.stateNode={isHidden:!1},n}function Rc(n,i,o){return n=Zn(6,n,null,i),n.lanes=o,n}function Pc(n,i,o){return i=Zn(4,n.children!==null?n.children:[],n.key,i),i.lanes=o,i.stateNode={containerInfo:n.containerInfo,pendingChildren:null,implementation:n.implementation},i}function Av(n,i,o,u,f){this.tag=i,this.containerInfo=n,this.finishedWork=this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.pendingContext=this.context=null,this.callbackPriority=0,this.eventTimes=Xn(0),this.expirationTimes=Xn(-1),this.entangledLanes=this.finishedLanes=this.mutableReadLanes=this.expiredLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=Xn(0),this.identifierPrefix=u,this.onRecoverableError=f,this.mutableSourceEagerHydrationData=null}function bc(n,i,o,u,f,p,M,U,O){return n=new Av(n,i,o,U,O),i===1?(i=1,p===!0&&(i|=8)):i=0,p=Zn(3,null,null,i),n.current=p,p.stateNode=n,p.memoizedState={element:u,isDehydrated:o,cache:null,transitions:null,pendingSuspenseBoundaries:null},Gu(p),n}function Cv(n,i,o){var u=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:I,key:u==null?null:""+u,children:n,containerInfo:i,implementation:o}}function Hp(n){if(!n)return rr;n=n._reactInternals;e:{if(gi(n)!==n||n.tag!==1)throw Error(t(170));var i=n;do{switch(i.tag){case 3:i=i.stateNode.context;break e;case 1:if(Ln(i.type)){i=i.stateNode.__reactInternalMemoizedMergedChildContext;break e}}i=i.return}while(i!==null);throw Error(t(171))}if(n.tag===1){var o=n.type;if(Ln(o))return mh(n,o,i)}return i}function Vp(n,i,o,u,f,p,M,U,O){return n=bc(o,u,!0,n,f,p,M,U,O),n.context=Hp(null),o=n.current,u=Sn(),f=fr(o),p=Ni(u,f),p.callback=i??null,ar(o,p,f),n.current.lanes=f,Pn(n,f,u),In(n,u),n}function il(n,i,o,u){var f=i.current,p=Sn(),M=fr(f);return o=Hp(o),i.context===null?i.context=o:i.pendingContext=o,i=Ni(p,M),i.payload={element:n},u=u===void 0?null:u,u!==null&&(i.callback=u),n=ar(f,i,M),n!==null&&(ui(n,f,M,p),Ia(n,f,M)),M}function rl(n){if(n=n.current,!n.child)return null;switch(n.child.tag){case 5:return n.child.stateNode;default:return n.child.stateNode}}function Gp(n,i){if(n=n.memoizedState,n!==null&&n.dehydrated!==null){var o=n.retryLane;n.retryLane=o!==0&&o<i?o:i}}function Lc(n,i){Gp(n,i),(n=n.alternate)&&Gp(n,i)}function Rv(){return null}var Wp=typeof reportError=="function"?reportError:function(n){console.error(n)};function Dc(n){this._internalRoot=n}sl.prototype.render=Dc.prototype.render=function(n){var i=this._internalRoot;if(i===null)throw Error(t(409));il(n,i,null,null)},sl.prototype.unmount=Dc.prototype.unmount=function(){var n=this._internalRoot;if(n!==null){this._internalRoot=null;var i=n.containerInfo;kr(function(){il(null,n,null,null)}),i[bi]=null}};function sl(n){this._internalRoot=n}sl.prototype.unstable_scheduleHydration=function(n){if(n){var i=Cd();n={blockedOn:null,target:n,priority:i};for(var o=0;o<Ji.length&&i!==0&&i<Ji[o].priority;o++);Ji.splice(o,0,n),o===0&&bd(n)}};function Uc(n){return!(!n||n.nodeType!==1&&n.nodeType!==9&&n.nodeType!==11)}function ol(n){return!(!n||n.nodeType!==1&&n.nodeType!==9&&n.nodeType!==11&&(n.nodeType!==8||n.nodeValue!==" react-mount-point-unstable "))}function Xp(){}function Pv(n,i,o,u,f){if(f){if(typeof u=="function"){var p=u;u=function(){var Q=rl(M);p.call(Q)}}var M=Vp(i,u,n,0,null,!1,!1,"",Xp);return n._reactRootContainer=M,n[bi]=M.current,Eo(n.nodeType===8?n.parentNode:n),kr(),M}for(;f=n.lastChild;)n.removeChild(f);if(typeof u=="function"){var U=u;u=function(){var Q=rl(O);U.call(Q)}}var O=bc(n,0,!1,null,null,!1,!1,"",Xp);return n._reactRootContainer=O,n[bi]=O.current,Eo(n.nodeType===8?n.parentNode:n),kr(function(){il(i,O,o,u)}),O}function al(n,i,o,u,f){var p=o._reactRootContainer;if(p){var M=p;if(typeof f=="function"){var U=f;f=function(){var O=rl(M);U.call(O)}}il(i,M,n,f)}else M=Pv(o,i,n,f,u);return rl(M)}wd=function(n){switch(n.tag){case 3:var i=n.stateNode;if(i.current.memoizedState.isDehydrated){var o=qt(i.pendingLanes);o!==0&&(iu(i,o|1),In(i,Se()),!(xt&6)&&(As=Se()+500,sr()))}break;case 13:kr(function(){var u=Ii(n,1);if(u!==null){var f=Sn();ui(u,n,1,f)}}),Lc(n,1)}},ru=function(n){if(n.tag===13){var i=Ii(n,134217728);if(i!==null){var o=Sn();ui(i,n,134217728,o)}Lc(n,134217728)}},Ad=function(n){if(n.tag===13){var i=fr(n),o=Ii(n,i);if(o!==null){var u=Sn();ui(o,n,i,u)}Lc(n,i)}},Cd=function(){return At},Rd=function(n,i){var o=At;try{return At=n,i()}finally{At=o}},Ce=function(n,i,o){switch(i){case"input":if(ct(n,o),i=o.name,o.type==="radio"&&i!=null){for(o=n;o.parentNode;)o=o.parentNode;for(o=o.querySelectorAll("input[name="+JSON.stringify(""+i)+'][type="radio"]'),i=0;i<o.length;i++){var u=o[i];if(u!==n&&u.form===n.form){var f=Ta(u);if(!f)throw Error(t(90));mt(u),ct(u,f)}}}break;case"textarea":pe(n,o);break;case"select":i=o.value,i!=null&&D(n,!!o.multiple,i,!1)}},Nt=Tc,jt=kr;var bv={usingClientEntryPoint:!1,Events:[Ao,hs,Ta,Pe,st,Tc]},Bo={findFiberByHostInstance:Lr,bundleType:0,version:"18.3.1",rendererPackageName:"react-dom"},Lv={bundleType:Bo.bundleType,version:Bo.version,rendererPackageName:Bo.rendererPackageName,rendererConfig:Bo.rendererConfig,overrideHookState:null,overrideHookStateDeletePath:null,overrideHookStateRenamePath:null,overrideProps:null,overridePropsDeletePath:null,overridePropsRenamePath:null,setErrorHandler:null,setSuspenseHandler:null,scheduleUpdate:null,currentDispatcherRef:R.ReactCurrentDispatcher,findHostInstanceByFiber:function(n){return n=C(n),n===null?null:n.stateNode},findFiberByHostInstance:Bo.findFiberByHostInstance||Rv,findHostInstancesForRefresh:null,scheduleRefresh:null,scheduleRoot:null,setRefreshHandler:null,getCurrentFiber:null,reconcilerVersion:"18.3.1-next-f1338f8080-20240426"};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<"u"){var ll=__REACT_DEVTOOLS_GLOBAL_HOOK__;if(!ll.isDisabled&&ll.supportsFiber)try{Et=ll.inject(Lv),gt=ll}catch{}}return Nn.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=bv,Nn.createPortal=function(n,i){var o=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!Uc(i))throw Error(t(200));return Cv(n,i,null,o)},Nn.createRoot=function(n,i){if(!Uc(n))throw Error(t(299));var o=!1,u="",f=Wp;return i!=null&&(i.unstable_strictMode===!0&&(o=!0),i.identifierPrefix!==void 0&&(u=i.identifierPrefix),i.onRecoverableError!==void 0&&(f=i.onRecoverableError)),i=bc(n,1,!1,null,null,o,!1,u,f),n[bi]=i.current,Eo(n.nodeType===8?n.parentNode:n),new Dc(i)},Nn.findDOMNode=function(n){if(n==null)return null;if(n.nodeType===1)return n;var i=n._reactInternals;if(i===void 0)throw typeof n.render=="function"?Error(t(188)):(n=Object.keys(n).join(","),Error(t(268,n)));return n=C(i),n=n===null?null:n.stateNode,n},Nn.flushSync=function(n){return kr(n)},Nn.hydrate=function(n,i,o){if(!ol(i))throw Error(t(200));return al(null,n,i,!0,o)},Nn.hydrateRoot=function(n,i,o){if(!Uc(n))throw Error(t(405));var u=o!=null&&o.hydratedSources||null,f=!1,p="",M=Wp;if(o!=null&&(o.unstable_strictMode===!0&&(f=!0),o.identifierPrefix!==void 0&&(p=o.identifierPrefix),o.onRecoverableError!==void 0&&(M=o.onRecoverableError)),i=Vp(i,null,n,1,o??null,f,!1,p,M),n[bi]=i.current,Eo(n),u)for(n=0;n<u.length;n++)o=u[n],f=o._getVersion,f=f(o._source),i.mutableSourceEagerHydrationData==null?i.mutableSourceEagerHydrationData=[o,f]:i.mutableSourceEagerHydrationData.push(o,f);return new sl(i)},Nn.render=function(n,i,o){if(!ol(i))throw Error(t(200));return al(null,n,i,!1,o)},Nn.unmountComponentAtNode=function(n){if(!ol(n))throw Error(t(40));return n._reactRootContainer?(kr(function(){al(null,null,n,!1,function(){n._reactRootContainer=null,n[bi]=null})}),!0):!1},Nn.unstable_batchedUpdates=Tc,Nn.unstable_renderSubtreeIntoContainer=function(n,i,o,u){if(!ol(o))throw Error(t(200));if(n==null||n._reactInternals===void 0)throw Error(t(38));return al(n,i,o,!1,u)},Nn.version="18.3.1-next-f1338f8080-20240426",Nn}var Zp;function zv(){if(Zp)return Nc.exports;Zp=1;function s(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(s)}catch(e){console.error(e)}}return s(),Nc.exports=Ov(),Nc.exports}var Qp;function kv(){if(Qp)return ul;Qp=1;var s=zv();return ul.createRoot=s.createRoot,ul.hydrateRoot=s.hydrateRoot,ul}var Bv=kv();/**
 * @license
 * Copyright 2010-2024 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const ld="170",Ks={ROTATE:0,DOLLY:1,PAN:2},js={ROTATE:0,PAN:1,DOLLY_PAN:2,DOLLY_ROTATE:3},Hv=0,Jp=1,Vv=2,gg=1,Gv=2,Gi=3,Ar=0,An=1,Ei=2,Er=0,Zs=1,em=2,tm=3,nm=4,Wv=5,Kr=100,Xv=101,Yv=102,jv=103,qv=104,$v=200,Kv=201,Zv=202,Qv=203,xf=204,yf=205,Jv=206,e0=207,t0=208,n0=209,i0=210,r0=211,s0=212,o0=213,a0=214,Sf=0,Mf=1,Ef=2,eo=3,Tf=4,wf=5,Af=6,Cf=7,ud=0,l0=1,u0=2,Tr=0,c0=1,f0=2,d0=3,h0=4,p0=5,m0=6,g0=7,_g=300,to=301,no=302,Rf=303,Pf=304,Zl=306,bf=1e3,Qr=1001,Lf=1002,pi=1003,_0=1004,cl=1005,wi=1006,zc=1007,Jr=1008,ji=1009,vg=1010,xg=1011,Zo=1012,cd=1013,es=1014,Wi=1015,ea=1016,fd=1017,dd=1018,io=1020,yg=35902,Sg=1021,Mg=1022,hi=1023,Eg=1024,Tg=1025,Qs=1026,ro=1027,wg=1028,hd=1029,Ag=1030,pd=1031,md=1033,kl=33776,Bl=33777,Hl=33778,Vl=33779,Df=35840,Uf=35841,If=35842,Nf=35843,Ff=36196,Of=37492,zf=37496,kf=37808,Bf=37809,Hf=37810,Vf=37811,Gf=37812,Wf=37813,Xf=37814,Yf=37815,jf=37816,qf=37817,$f=37818,Kf=37819,Zf=37820,Qf=37821,Gl=36492,Jf=36494,ed=36495,Cg=36283,td=36284,nd=36285,id=36286,v0=3200,x0=3201,Rg=0,y0=1,Mr="",Tn="srgb",ao="srgb-linear",Ql="linear",Rt="srgb",Rs=7680,im=519,S0=512,M0=513,E0=514,Pg=515,T0=516,w0=517,A0=518,C0=519,rd=35044,rm="300 es",Xi=2e3,jl=2001;class is{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});const r=this._listeners;r[e]===void 0&&(r[e]=[]),r[e].indexOf(t)===-1&&r[e].push(t)}hasEventListener(e,t){if(this._listeners===void 0)return!1;const r=this._listeners;return r[e]!==void 0&&r[e].indexOf(t)!==-1}removeEventListener(e,t){if(this._listeners===void 0)return;const a=this._listeners[e];if(a!==void 0){const l=a.indexOf(t);l!==-1&&a.splice(l,1)}}dispatchEvent(e){if(this._listeners===void 0)return;const r=this._listeners[e.type];if(r!==void 0){e.target=this;const a=r.slice(0);for(let l=0,c=a.length;l<c;l++)a[l].call(this,e);e.target=null}}}const pn=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],Wl=Math.PI/180,sd=180/Math.PI;function wr(){const s=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,r=Math.random()*4294967295|0;return(pn[s&255]+pn[s>>8&255]+pn[s>>16&255]+pn[s>>24&255]+"-"+pn[e&255]+pn[e>>8&255]+"-"+pn[e>>16&15|64]+pn[e>>24&255]+"-"+pn[t&63|128]+pn[t>>8&255]+"-"+pn[t>>16&255]+pn[t>>24&255]+pn[r&255]+pn[r>>8&255]+pn[r>>16&255]+pn[r>>24&255]).toLowerCase()}function wn(s,e,t){return Math.max(e,Math.min(t,s))}function R0(s,e){return(s%e+e)%e}function kc(s,e,t){return(1-t)*s+t*e}function Ti(s,e){switch(e.constructor){case Float32Array:return s;case Uint32Array:return s/4294967295;case Uint16Array:return s/65535;case Uint8Array:return s/255;case Int32Array:return Math.max(s/2147483647,-1);case Int16Array:return Math.max(s/32767,-1);case Int8Array:return Math.max(s/127,-1);default:throw new Error("Invalid component type.")}}function Pt(s,e){switch(e.constructor){case Float32Array:return s;case Uint32Array:return Math.round(s*4294967295);case Uint16Array:return Math.round(s*65535);case Uint8Array:return Math.round(s*255);case Int32Array:return Math.round(s*2147483647);case Int16Array:return Math.round(s*32767);case Int8Array:return Math.round(s*127);default:throw new Error("Invalid component type.")}}const P0={DEG2RAD:Wl};class je{constructor(e=0,t=0){je.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const t=this.x,r=this.y,a=e.elements;return this.x=a[0]*t+a[3]*r+a[6],this.y=a[1]*t+a[4]*r+a[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this}clampLength(e,t){const r=this.length();return this.divideScalar(r||1).multiplyScalar(Math.max(e,Math.min(t,r)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const r=this.dot(e)/t;return Math.acos(wn(r,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,r=this.y-e.y;return t*t+r*r}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,r){return this.x=e.x+(t.x-e.x)*r,this.y=e.y+(t.y-e.y)*r,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){const r=Math.cos(t),a=Math.sin(t),l=this.x-e.x,c=this.y-e.y;return this.x=l*r-c*a+e.x,this.y=l*a+c*r+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class at{constructor(e,t,r,a,l,c,d,h,g){at.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,r,a,l,c,d,h,g)}set(e,t,r,a,l,c,d,h,g){const _=this.elements;return _[0]=e,_[1]=a,_[2]=d,_[3]=t,_[4]=l,_[5]=h,_[6]=r,_[7]=c,_[8]=g,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const t=this.elements,r=e.elements;return t[0]=r[0],t[1]=r[1],t[2]=r[2],t[3]=r[3],t[4]=r[4],t[5]=r[5],t[6]=r[6],t[7]=r[7],t[8]=r[8],this}extractBasis(e,t,r){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),r.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const r=e.elements,a=t.elements,l=this.elements,c=r[0],d=r[3],h=r[6],g=r[1],_=r[4],x=r[7],y=r[2],S=r[5],E=r[8],T=a[0],v=a[3],m=a[6],P=a[1],L=a[4],R=a[7],j=a[2],I=a[5],F=a[8];return l[0]=c*T+d*P+h*j,l[3]=c*v+d*L+h*I,l[6]=c*m+d*R+h*F,l[1]=g*T+_*P+x*j,l[4]=g*v+_*L+x*I,l[7]=g*m+_*R+x*F,l[2]=y*T+S*P+E*j,l[5]=y*v+S*L+E*I,l[8]=y*m+S*R+E*F,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){const e=this.elements,t=e[0],r=e[1],a=e[2],l=e[3],c=e[4],d=e[5],h=e[6],g=e[7],_=e[8];return t*c*_-t*d*g-r*l*_+r*d*h+a*l*g-a*c*h}invert(){const e=this.elements,t=e[0],r=e[1],a=e[2],l=e[3],c=e[4],d=e[5],h=e[6],g=e[7],_=e[8],x=_*c-d*g,y=d*h-_*l,S=g*l-c*h,E=t*x+r*y+a*S;if(E===0)return this.set(0,0,0,0,0,0,0,0,0);const T=1/E;return e[0]=x*T,e[1]=(a*g-_*r)*T,e[2]=(d*r-a*c)*T,e[3]=y*T,e[4]=(_*t-a*h)*T,e[5]=(a*l-d*t)*T,e[6]=S*T,e[7]=(r*h-g*t)*T,e[8]=(c*t-r*l)*T,this}transpose(){let e;const t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,r,a,l,c,d){const h=Math.cos(l),g=Math.sin(l);return this.set(r*h,r*g,-r*(h*c+g*d)+c+e,-a*g,a*h,-a*(-g*c+h*d)+d+t,0,0,1),this}scale(e,t){return this.premultiply(Bc.makeScale(e,t)),this}rotate(e){return this.premultiply(Bc.makeRotation(-e)),this}translate(e,t){return this.premultiply(Bc.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){const t=Math.cos(e),r=Math.sin(e);return this.set(t,-r,0,r,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){const t=this.elements,r=e.elements;for(let a=0;a<9;a++)if(t[a]!==r[a])return!1;return!0}fromArray(e,t=0){for(let r=0;r<9;r++)this.elements[r]=e[r+t];return this}toArray(e=[],t=0){const r=this.elements;return e[t]=r[0],e[t+1]=r[1],e[t+2]=r[2],e[t+3]=r[3],e[t+4]=r[4],e[t+5]=r[5],e[t+6]=r[6],e[t+7]=r[7],e[t+8]=r[8],e}clone(){return new this.constructor().fromArray(this.elements)}}const Bc=new at;function bg(s){for(let e=s.length-1;e>=0;--e)if(s[e]>=65535)return!0;return!1}function Qo(s){return document.createElementNS("http://www.w3.org/1999/xhtml",s)}function b0(){const s=Qo("canvas");return s.style.display="block",s}const sm={};function $o(s){s in sm||(sm[s]=!0,console.warn(s))}function L0(s,e,t){return new Promise(function(r,a){function l(){switch(s.clientWaitSync(e,s.SYNC_FLUSH_COMMANDS_BIT,0)){case s.WAIT_FAILED:a();break;case s.TIMEOUT_EXPIRED:setTimeout(l,t);break;default:r()}}setTimeout(l,t)})}function D0(s){const e=s.elements;e[2]=.5*e[2]+.5*e[3],e[6]=.5*e[6]+.5*e[7],e[10]=.5*e[10]+.5*e[11],e[14]=.5*e[14]+.5*e[15]}function U0(s){const e=s.elements;e[11]===-1?(e[10]=-e[10]-1,e[14]=-e[14]):(e[10]=-e[10],e[14]=-e[14]+1)}const yt={enabled:!0,workingColorSpace:ao,spaces:{},convert:function(s,e,t){return this.enabled===!1||e===t||!e||!t||(this.spaces[e].transfer===Rt&&(s.r=Yi(s.r),s.g=Yi(s.g),s.b=Yi(s.b)),this.spaces[e].primaries!==this.spaces[t].primaries&&(s.applyMatrix3(this.spaces[e].toXYZ),s.applyMatrix3(this.spaces[t].fromXYZ)),this.spaces[t].transfer===Rt&&(s.r=Js(s.r),s.g=Js(s.g),s.b=Js(s.b))),s},fromWorkingColorSpace:function(s,e){return this.convert(s,this.workingColorSpace,e)},toWorkingColorSpace:function(s,e){return this.convert(s,e,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===Mr?Ql:this.spaces[s].transfer},getLuminanceCoefficients:function(s,e=this.workingColorSpace){return s.fromArray(this.spaces[e].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,e,t){return s.copy(this.spaces[e].toXYZ).multiply(this.spaces[t].fromXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace}};function Yi(s){return s<.04045?s*.0773993808:Math.pow(s*.9478672986+.0521327014,2.4)}function Js(s){return s<.0031308?s*12.92:1.055*Math.pow(s,.41666)-.055}const om=[.64,.33,.3,.6,.15,.06],am=[.2126,.7152,.0722],lm=[.3127,.329],um=new at().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),cm=new at().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);yt.define({[ao]:{primaries:om,whitePoint:lm,transfer:Ql,toXYZ:um,fromXYZ:cm,luminanceCoefficients:am,workingColorSpaceConfig:{unpackColorSpace:Tn},outputColorSpaceConfig:{drawingBufferColorSpace:Tn}},[Tn]:{primaries:om,whitePoint:lm,transfer:Rt,toXYZ:um,fromXYZ:cm,luminanceCoefficients:am,outputColorSpaceConfig:{drawingBufferColorSpace:Tn}}});let Ps;class I0{static getDataURL(e){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let t;if(e instanceof HTMLCanvasElement)t=e;else{Ps===void 0&&(Ps=Qo("canvas")),Ps.width=e.width,Ps.height=e.height;const r=Ps.getContext("2d");e instanceof ImageData?r.putImageData(e,0,0):r.drawImage(e,0,0,e.width,e.height),t=Ps}return t.width>2048||t.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",e),t.toDataURL("image/jpeg",.6)):t.toDataURL("image/png")}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const t=Qo("canvas");t.width=e.width,t.height=e.height;const r=t.getContext("2d");r.drawImage(e,0,0,e.width,e.height);const a=r.getImageData(0,0,e.width,e.height),l=a.data;for(let c=0;c<l.length;c++)l[c]=Yi(l[c]/255)*255;return r.putImageData(a,0,0),t}else if(e.data){const t=e.data.slice(0);for(let r=0;r<t.length;r++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[r]=Math.floor(Yi(t[r]/255)*255):t[r]=Yi(t[r]);return{data:t,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}let N0=0;class Lg{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:N0++}),this.uuid=wr(),this.data=e,this.dataReady=!0,this.version=0}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const r={uuid:this.uuid,url:""},a=this.data;if(a!==null){let l;if(Array.isArray(a)){l=[];for(let c=0,d=a.length;c<d;c++)a[c].isDataTexture?l.push(Hc(a[c].image)):l.push(Hc(a[c]))}else l=Hc(a);r.url=l}return t||(e.images[this.uuid]=r),r}}function Hc(s){return typeof HTMLImageElement<"u"&&s instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&s instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&s instanceof ImageBitmap?I0.getDataURL(s):s.data?{data:Array.from(s.data),width:s.width,height:s.height,type:s.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}let F0=0;class gn extends is{constructor(e=gn.DEFAULT_IMAGE,t=gn.DEFAULT_MAPPING,r=Qr,a=Qr,l=wi,c=Jr,d=hi,h=ji,g=gn.DEFAULT_ANISOTROPY,_=Mr){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:F0++}),this.uuid=wr(),this.name="",this.source=new Lg(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=r,this.wrapT=a,this.magFilter=l,this.minFilter=c,this.anisotropy=g,this.format=d,this.internalFormat=null,this.type=h,this.offset=new je(0,0),this.repeat=new je(1,1),this.center=new je(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new at,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=_,this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.pmremVersion=0}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const r={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(r.userData=this.userData),t||(e.textures[this.uuid]=r),r}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==_g)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case bf:e.x=e.x-Math.floor(e.x);break;case Qr:e.x=e.x<0?0:1;break;case Lf:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case bf:e.y=e.y-Math.floor(e.y);break;case Qr:e.y=e.y<0?0:1;break;case Lf:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}}gn.DEFAULT_IMAGE=null;gn.DEFAULT_MAPPING=_g;gn.DEFAULT_ANISOTROPY=1;class Vt{constructor(e=0,t=0,r=0,a=1){Vt.prototype.isVector4=!0,this.x=e,this.y=t,this.z=r,this.w=a}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,r,a){return this.x=e,this.y=t,this.z=r,this.w=a,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const t=this.x,r=this.y,a=this.z,l=this.w,c=e.elements;return this.x=c[0]*t+c[4]*r+c[8]*a+c[12]*l,this.y=c[1]*t+c[5]*r+c[9]*a+c[13]*l,this.z=c[2]*t+c[6]*r+c[10]*a+c[14]*l,this.w=c[3]*t+c[7]*r+c[11]*a+c[15]*l,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,r,a,l;const h=e.elements,g=h[0],_=h[4],x=h[8],y=h[1],S=h[5],E=h[9],T=h[2],v=h[6],m=h[10];if(Math.abs(_-y)<.01&&Math.abs(x-T)<.01&&Math.abs(E-v)<.01){if(Math.abs(_+y)<.1&&Math.abs(x+T)<.1&&Math.abs(E+v)<.1&&Math.abs(g+S+m-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;const L=(g+1)/2,R=(S+1)/2,j=(m+1)/2,I=(_+y)/4,F=(x+T)/4,H=(E+v)/4;return L>R&&L>j?L<.01?(r=0,a=.707106781,l=.707106781):(r=Math.sqrt(L),a=I/r,l=F/r):R>j?R<.01?(r=.707106781,a=0,l=.707106781):(a=Math.sqrt(R),r=I/a,l=H/a):j<.01?(r=.707106781,a=.707106781,l=0):(l=Math.sqrt(j),r=F/l,a=H/l),this.set(r,a,l,t),this}let P=Math.sqrt((v-E)*(v-E)+(x-T)*(x-T)+(y-_)*(y-_));return Math.abs(P)<.001&&(P=1),this.x=(v-E)/P,this.y=(x-T)/P,this.z=(y-_)/P,this.w=Math.acos((g+S+m-1)/2),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this.w=Math.max(e.w,Math.min(t.w,this.w)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this.w=Math.max(e,Math.min(t,this.w)),this}clampLength(e,t){const r=this.length();return this.divideScalar(r||1).multiplyScalar(Math.max(e,Math.min(t,r)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,r){return this.x=e.x+(t.x-e.x)*r,this.y=e.y+(t.y-e.y)*r,this.z=e.z+(t.z-e.z)*r,this.w=e.w+(t.w-e.w)*r,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class O0 extends is{constructor(e=1,t=1,r={}){super(),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=1,this.scissor=new Vt(0,0,e,t),this.scissorTest=!1,this.viewport=new Vt(0,0,e,t);const a={width:e,height:t,depth:1};r=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:wi,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1},r);const l=new gn(a,r.mapping,r.wrapS,r.wrapT,r.magFilter,r.minFilter,r.format,r.type,r.anisotropy,r.colorSpace);l.flipY=!1,l.generateMipmaps=r.generateMipmaps,l.internalFormat=r.internalFormat,this.textures=[];const c=r.count;for(let d=0;d<c;d++)this.textures[d]=l.clone(),this.textures[d].isRenderTargetTexture=!0;this.depthBuffer=r.depthBuffer,this.stencilBuffer=r.stencilBuffer,this.resolveDepthBuffer=r.resolveDepthBuffer,this.resolveStencilBuffer=r.resolveStencilBuffer,this.depthTexture=r.depthTexture,this.samples=r.samples}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}setSize(e,t,r=1){if(this.width!==e||this.height!==t||this.depth!==r){this.width=e,this.height=t,this.depth=r;for(let a=0,l=this.textures.length;a<l;a++)this.textures[a].image.width=e,this.textures[a].image.height=t,this.textures[a].image.depth=r;this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let r=0,a=e.textures.length;r<a;r++)this.textures[r]=e.textures[r].clone(),this.textures[r].isRenderTargetTexture=!0;const t=Object.assign({},e.texture.image);return this.texture.source=new Lg(t),this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class ts extends O0{constructor(e=1,t=1,r={}){super(e,t,r),this.isWebGLRenderTarget=!0}}class Dg extends gn{constructor(e=null,t=1,r=1,a=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:r,depth:a},this.magFilter=pi,this.minFilter=pi,this.wrapR=Qr,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}}class z0 extends gn{constructor(e=null,t=1,r=1,a=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:r,depth:a},this.magFilter=pi,this.minFilter=pi,this.wrapR=Qr,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class ns{constructor(e=0,t=0,r=0,a=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=r,this._w=a}static slerpFlat(e,t,r,a,l,c,d){let h=r[a+0],g=r[a+1],_=r[a+2],x=r[a+3];const y=l[c+0],S=l[c+1],E=l[c+2],T=l[c+3];if(d===0){e[t+0]=h,e[t+1]=g,e[t+2]=_,e[t+3]=x;return}if(d===1){e[t+0]=y,e[t+1]=S,e[t+2]=E,e[t+3]=T;return}if(x!==T||h!==y||g!==S||_!==E){let v=1-d;const m=h*y+g*S+_*E+x*T,P=m>=0?1:-1,L=1-m*m;if(L>Number.EPSILON){const j=Math.sqrt(L),I=Math.atan2(j,m*P);v=Math.sin(v*I)/j,d=Math.sin(d*I)/j}const R=d*P;if(h=h*v+y*R,g=g*v+S*R,_=_*v+E*R,x=x*v+T*R,v===1-d){const j=1/Math.sqrt(h*h+g*g+_*_+x*x);h*=j,g*=j,_*=j,x*=j}}e[t]=h,e[t+1]=g,e[t+2]=_,e[t+3]=x}static multiplyQuaternionsFlat(e,t,r,a,l,c){const d=r[a],h=r[a+1],g=r[a+2],_=r[a+3],x=l[c],y=l[c+1],S=l[c+2],E=l[c+3];return e[t]=d*E+_*x+h*S-g*y,e[t+1]=h*E+_*y+g*x-d*S,e[t+2]=g*E+_*S+d*y-h*x,e[t+3]=_*E-d*x-h*y-g*S,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,r,a){return this._x=e,this._y=t,this._z=r,this._w=a,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){const r=e._x,a=e._y,l=e._z,c=e._order,d=Math.cos,h=Math.sin,g=d(r/2),_=d(a/2),x=d(l/2),y=h(r/2),S=h(a/2),E=h(l/2);switch(c){case"XYZ":this._x=y*_*x+g*S*E,this._y=g*S*x-y*_*E,this._z=g*_*E+y*S*x,this._w=g*_*x-y*S*E;break;case"YXZ":this._x=y*_*x+g*S*E,this._y=g*S*x-y*_*E,this._z=g*_*E-y*S*x,this._w=g*_*x+y*S*E;break;case"ZXY":this._x=y*_*x-g*S*E,this._y=g*S*x+y*_*E,this._z=g*_*E+y*S*x,this._w=g*_*x-y*S*E;break;case"ZYX":this._x=y*_*x-g*S*E,this._y=g*S*x+y*_*E,this._z=g*_*E-y*S*x,this._w=g*_*x+y*S*E;break;case"YZX":this._x=y*_*x+g*S*E,this._y=g*S*x+y*_*E,this._z=g*_*E-y*S*x,this._w=g*_*x-y*S*E;break;case"XZY":this._x=y*_*x-g*S*E,this._y=g*S*x-y*_*E,this._z=g*_*E+y*S*x,this._w=g*_*x+y*S*E;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+c)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){const r=t/2,a=Math.sin(r);return this._x=e.x*a,this._y=e.y*a,this._z=e.z*a,this._w=Math.cos(r),this._onChangeCallback(),this}setFromRotationMatrix(e){const t=e.elements,r=t[0],a=t[4],l=t[8],c=t[1],d=t[5],h=t[9],g=t[2],_=t[6],x=t[10],y=r+d+x;if(y>0){const S=.5/Math.sqrt(y+1);this._w=.25/S,this._x=(_-h)*S,this._y=(l-g)*S,this._z=(c-a)*S}else if(r>d&&r>x){const S=2*Math.sqrt(1+r-d-x);this._w=(_-h)/S,this._x=.25*S,this._y=(a+c)/S,this._z=(l+g)/S}else if(d>x){const S=2*Math.sqrt(1+d-r-x);this._w=(l-g)/S,this._x=(a+c)/S,this._y=.25*S,this._z=(h+_)/S}else{const S=2*Math.sqrt(1+x-r-d);this._w=(c-a)/S,this._x=(l+g)/S,this._y=(h+_)/S,this._z=.25*S}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let r=e.dot(t)+1;return r<Number.EPSILON?(r=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=r):(this._x=0,this._y=-e.z,this._z=e.y,this._w=r)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=r),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(wn(this.dot(e),-1,1)))}rotateTowards(e,t){const r=this.angleTo(e);if(r===0)return this;const a=Math.min(1,t/r);return this.slerp(e,a),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){const r=e._x,a=e._y,l=e._z,c=e._w,d=t._x,h=t._y,g=t._z,_=t._w;return this._x=r*_+c*d+a*g-l*h,this._y=a*_+c*h+l*d-r*g,this._z=l*_+c*g+r*h-a*d,this._w=c*_-r*d-a*h-l*g,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);const r=this._x,a=this._y,l=this._z,c=this._w;let d=c*e._w+r*e._x+a*e._y+l*e._z;if(d<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,d=-d):this.copy(e),d>=1)return this._w=c,this._x=r,this._y=a,this._z=l,this;const h=1-d*d;if(h<=Number.EPSILON){const S=1-t;return this._w=S*c+t*this._w,this._x=S*r+t*this._x,this._y=S*a+t*this._y,this._z=S*l+t*this._z,this.normalize(),this}const g=Math.sqrt(h),_=Math.atan2(g,d),x=Math.sin((1-t)*_)/g,y=Math.sin(t*_)/g;return this._w=c*x+this._w*y,this._x=r*x+this._x*y,this._y=a*x+this._y*y,this._z=l*x+this._z*y,this._onChangeCallback(),this}slerpQuaternions(e,t,r){return this.copy(e).slerp(t,r)}random(){const e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),r=Math.random(),a=Math.sqrt(1-r),l=Math.sqrt(r);return this.set(a*Math.sin(e),a*Math.cos(e),l*Math.sin(t),l*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class G{constructor(e=0,t=0,r=0){G.prototype.isVector3=!0,this.x=e,this.y=t,this.z=r}set(e,t,r){return r===void 0&&(r=this.z),this.x=e,this.y=t,this.z=r,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(fm.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(fm.setFromAxisAngle(e,t))}applyMatrix3(e){const t=this.x,r=this.y,a=this.z,l=e.elements;return this.x=l[0]*t+l[3]*r+l[6]*a,this.y=l[1]*t+l[4]*r+l[7]*a,this.z=l[2]*t+l[5]*r+l[8]*a,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const t=this.x,r=this.y,a=this.z,l=e.elements,c=1/(l[3]*t+l[7]*r+l[11]*a+l[15]);return this.x=(l[0]*t+l[4]*r+l[8]*a+l[12])*c,this.y=(l[1]*t+l[5]*r+l[9]*a+l[13])*c,this.z=(l[2]*t+l[6]*r+l[10]*a+l[14])*c,this}applyQuaternion(e){const t=this.x,r=this.y,a=this.z,l=e.x,c=e.y,d=e.z,h=e.w,g=2*(c*a-d*r),_=2*(d*t-l*a),x=2*(l*r-c*t);return this.x=t+h*g+c*x-d*_,this.y=r+h*_+d*g-l*x,this.z=a+h*x+l*_-c*g,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const t=this.x,r=this.y,a=this.z,l=e.elements;return this.x=l[0]*t+l[4]*r+l[8]*a,this.y=l[1]*t+l[5]*r+l[9]*a,this.z=l[2]*t+l[6]*r+l[10]*a,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this}clampLength(e,t){const r=this.length();return this.divideScalar(r||1).multiplyScalar(Math.max(e,Math.min(t,r)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,r){return this.x=e.x+(t.x-e.x)*r,this.y=e.y+(t.y-e.y)*r,this.z=e.z+(t.z-e.z)*r,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){const r=e.x,a=e.y,l=e.z,c=t.x,d=t.y,h=t.z;return this.x=a*h-l*d,this.y=l*c-r*h,this.z=r*d-a*c,this}projectOnVector(e){const t=e.lengthSq();if(t===0)return this.set(0,0,0);const r=e.dot(this)/t;return this.copy(e).multiplyScalar(r)}projectOnPlane(e){return Vc.copy(this).projectOnVector(e),this.sub(Vc)}reflect(e){return this.sub(Vc.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const r=this.dot(e)/t;return Math.acos(wn(r,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,r=this.y-e.y,a=this.z-e.z;return t*t+r*r+a*a}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,r){const a=Math.sin(t)*e;return this.x=a*Math.sin(r),this.y=Math.cos(t)*e,this.z=a*Math.cos(r),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,r){return this.x=e*Math.sin(t),this.y=r,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){const t=this.setFromMatrixColumn(e,0).length(),r=this.setFromMatrixColumn(e,1).length(),a=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=r,this.z=a,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=Math.random()*Math.PI*2,t=Math.random()*2-1,r=Math.sqrt(1-t*t);return this.x=r*Math.cos(e),this.y=t,this.z=r*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const Vc=new G,fm=new ns;class ta{constructor(e=new G(1/0,1/0,1/0),t=new G(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,r=e.length;t<r;t+=3)this.expandByPoint(ci.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,r=e.count;t<r;t++)this.expandByPoint(ci.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,r=e.length;t<r;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){const r=ci.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(r),this.max.copy(e).add(r),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);const r=e.geometry;if(r!==void 0){const l=r.getAttribute("position");if(t===!0&&l!==void 0&&e.isInstancedMesh!==!0)for(let c=0,d=l.count;c<d;c++)e.isMesh===!0?e.getVertexPosition(c,ci):ci.fromBufferAttribute(l,c),ci.applyMatrix4(e.matrixWorld),this.expandByPoint(ci);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),fl.copy(e.boundingBox)):(r.boundingBox===null&&r.computeBoundingBox(),fl.copy(r.boundingBox)),fl.applyMatrix4(e.matrixWorld),this.union(fl)}const a=e.children;for(let l=0,c=a.length;l<c;l++)this.expandByObject(a[l],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,ci),ci.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,r;return e.normal.x>0?(t=e.normal.x*this.min.x,r=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,r=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,r+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,r+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,r+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,r+=e.normal.z*this.min.z),t<=-e.constant&&r>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(Ho),dl.subVectors(this.max,Ho),bs.subVectors(e.a,Ho),Ls.subVectors(e.b,Ho),Ds.subVectors(e.c,Ho),mr.subVectors(Ls,bs),gr.subVectors(Ds,Ls),Gr.subVectors(bs,Ds);let t=[0,-mr.z,mr.y,0,-gr.z,gr.y,0,-Gr.z,Gr.y,mr.z,0,-mr.x,gr.z,0,-gr.x,Gr.z,0,-Gr.x,-mr.y,mr.x,0,-gr.y,gr.x,0,-Gr.y,Gr.x,0];return!Gc(t,bs,Ls,Ds,dl)||(t=[1,0,0,0,1,0,0,0,1],!Gc(t,bs,Ls,Ds,dl))?!1:(hl.crossVectors(mr,gr),t=[hl.x,hl.y,hl.z],Gc(t,bs,Ls,Ds,dl))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,ci).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(ci).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(zi[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),zi[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),zi[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),zi[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),zi[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),zi[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),zi[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),zi[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(zi),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}}const zi=[new G,new G,new G,new G,new G,new G,new G,new G],ci=new G,fl=new ta,bs=new G,Ls=new G,Ds=new G,mr=new G,gr=new G,Gr=new G,Ho=new G,dl=new G,hl=new G,Wr=new G;function Gc(s,e,t,r,a){for(let l=0,c=s.length-3;l<=c;l+=3){Wr.fromArray(s,l);const d=a.x*Math.abs(Wr.x)+a.y*Math.abs(Wr.y)+a.z*Math.abs(Wr.z),h=e.dot(Wr),g=t.dot(Wr),_=r.dot(Wr);if(Math.max(-Math.max(h,g,_),Math.min(h,g,_))>d)return!1}return!0}const k0=new ta,Vo=new G,Wc=new G;class na{constructor(e=new G,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){const r=this.center;t!==void 0?r.copy(t):k0.setFromPoints(e).getCenter(r);let a=0;for(let l=0,c=e.length;l<c;l++)a=Math.max(a,r.distanceToSquared(e[l]));return this.radius=Math.sqrt(a),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){const r=this.center.distanceToSquared(e);return t.copy(e),r>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;Vo.subVectors(e,this.center);const t=Vo.lengthSq();if(t>this.radius*this.radius){const r=Math.sqrt(t),a=(r-this.radius)*.5;this.center.addScaledVector(Vo,a/r),this.radius+=a}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(Wc.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(Vo.copy(e.center).add(Wc)),this.expandByPoint(Vo.copy(e.center).sub(Wc))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}}const ki=new G,Xc=new G,pl=new G,_r=new G,Yc=new G,ml=new G,jc=new G;class Jl{constructor(e=new G,t=new G(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,ki)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);const r=t.dot(this.direction);return r<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,r)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const t=ki.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(ki.copy(this.origin).addScaledVector(this.direction,t),ki.distanceToSquared(e))}distanceSqToSegment(e,t,r,a){Xc.copy(e).add(t).multiplyScalar(.5),pl.copy(t).sub(e).normalize(),_r.copy(this.origin).sub(Xc);const l=e.distanceTo(t)*.5,c=-this.direction.dot(pl),d=_r.dot(this.direction),h=-_r.dot(pl),g=_r.lengthSq(),_=Math.abs(1-c*c);let x,y,S,E;if(_>0)if(x=c*h-d,y=c*d-h,E=l*_,x>=0)if(y>=-E)if(y<=E){const T=1/_;x*=T,y*=T,S=x*(x+c*y+2*d)+y*(c*x+y+2*h)+g}else y=l,x=Math.max(0,-(c*y+d)),S=-x*x+y*(y+2*h)+g;else y=-l,x=Math.max(0,-(c*y+d)),S=-x*x+y*(y+2*h)+g;else y<=-E?(x=Math.max(0,-(-c*l+d)),y=x>0?-l:Math.min(Math.max(-l,-h),l),S=-x*x+y*(y+2*h)+g):y<=E?(x=0,y=Math.min(Math.max(-l,-h),l),S=y*(y+2*h)+g):(x=Math.max(0,-(c*l+d)),y=x>0?l:Math.min(Math.max(-l,-h),l),S=-x*x+y*(y+2*h)+g);else y=c>0?-l:l,x=Math.max(0,-(c*y+d)),S=-x*x+y*(y+2*h)+g;return r&&r.copy(this.origin).addScaledVector(this.direction,x),a&&a.copy(Xc).addScaledVector(pl,y),S}intersectSphere(e,t){ki.subVectors(e.center,this.origin);const r=ki.dot(this.direction),a=ki.dot(ki)-r*r,l=e.radius*e.radius;if(a>l)return null;const c=Math.sqrt(l-a),d=r-c,h=r+c;return h<0?null:d<0?this.at(h,t):this.at(d,t)}intersectsSphere(e){return this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;const r=-(this.origin.dot(e.normal)+e.constant)/t;return r>=0?r:null}intersectPlane(e,t){const r=this.distanceToPlane(e);return r===null?null:this.at(r,t)}intersectsPlane(e){const t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let r,a,l,c,d,h;const g=1/this.direction.x,_=1/this.direction.y,x=1/this.direction.z,y=this.origin;return g>=0?(r=(e.min.x-y.x)*g,a=(e.max.x-y.x)*g):(r=(e.max.x-y.x)*g,a=(e.min.x-y.x)*g),_>=0?(l=(e.min.y-y.y)*_,c=(e.max.y-y.y)*_):(l=(e.max.y-y.y)*_,c=(e.min.y-y.y)*_),r>c||l>a||((l>r||isNaN(r))&&(r=l),(c<a||isNaN(a))&&(a=c),x>=0?(d=(e.min.z-y.z)*x,h=(e.max.z-y.z)*x):(d=(e.max.z-y.z)*x,h=(e.min.z-y.z)*x),r>h||d>a)||((d>r||r!==r)&&(r=d),(h<a||a!==a)&&(a=h),a<0)?null:this.at(r>=0?r:a,t)}intersectsBox(e){return this.intersectBox(e,ki)!==null}intersectTriangle(e,t,r,a,l){Yc.subVectors(t,e),ml.subVectors(r,e),jc.crossVectors(Yc,ml);let c=this.direction.dot(jc),d;if(c>0){if(a)return null;d=1}else if(c<0)d=-1,c=-c;else return null;_r.subVectors(this.origin,e);const h=d*this.direction.dot(ml.crossVectors(_r,ml));if(h<0)return null;const g=d*this.direction.dot(Yc.cross(_r));if(g<0||h+g>c)return null;const _=-d*_r.dot(jc);return _<0?null:this.at(_/c,l)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class Lt{constructor(e,t,r,a,l,c,d,h,g,_,x,y,S,E,T,v){Lt.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,r,a,l,c,d,h,g,_,x,y,S,E,T,v)}set(e,t,r,a,l,c,d,h,g,_,x,y,S,E,T,v){const m=this.elements;return m[0]=e,m[4]=t,m[8]=r,m[12]=a,m[1]=l,m[5]=c,m[9]=d,m[13]=h,m[2]=g,m[6]=_,m[10]=x,m[14]=y,m[3]=S,m[7]=E,m[11]=T,m[15]=v,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new Lt().fromArray(this.elements)}copy(e){const t=this.elements,r=e.elements;return t[0]=r[0],t[1]=r[1],t[2]=r[2],t[3]=r[3],t[4]=r[4],t[5]=r[5],t[6]=r[6],t[7]=r[7],t[8]=r[8],t[9]=r[9],t[10]=r[10],t[11]=r[11],t[12]=r[12],t[13]=r[13],t[14]=r[14],t[15]=r[15],this}copyPosition(e){const t=this.elements,r=e.elements;return t[12]=r[12],t[13]=r[13],t[14]=r[14],this}setFromMatrix3(e){const t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,r){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),r.setFromMatrixColumn(this,2),this}makeBasis(e,t,r){return this.set(e.x,t.x,r.x,0,e.y,t.y,r.y,0,e.z,t.z,r.z,0,0,0,0,1),this}extractRotation(e){const t=this.elements,r=e.elements,a=1/Us.setFromMatrixColumn(e,0).length(),l=1/Us.setFromMatrixColumn(e,1).length(),c=1/Us.setFromMatrixColumn(e,2).length();return t[0]=r[0]*a,t[1]=r[1]*a,t[2]=r[2]*a,t[3]=0,t[4]=r[4]*l,t[5]=r[5]*l,t[6]=r[6]*l,t[7]=0,t[8]=r[8]*c,t[9]=r[9]*c,t[10]=r[10]*c,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){const t=this.elements,r=e.x,a=e.y,l=e.z,c=Math.cos(r),d=Math.sin(r),h=Math.cos(a),g=Math.sin(a),_=Math.cos(l),x=Math.sin(l);if(e.order==="XYZ"){const y=c*_,S=c*x,E=d*_,T=d*x;t[0]=h*_,t[4]=-h*x,t[8]=g,t[1]=S+E*g,t[5]=y-T*g,t[9]=-d*h,t[2]=T-y*g,t[6]=E+S*g,t[10]=c*h}else if(e.order==="YXZ"){const y=h*_,S=h*x,E=g*_,T=g*x;t[0]=y+T*d,t[4]=E*d-S,t[8]=c*g,t[1]=c*x,t[5]=c*_,t[9]=-d,t[2]=S*d-E,t[6]=T+y*d,t[10]=c*h}else if(e.order==="ZXY"){const y=h*_,S=h*x,E=g*_,T=g*x;t[0]=y-T*d,t[4]=-c*x,t[8]=E+S*d,t[1]=S+E*d,t[5]=c*_,t[9]=T-y*d,t[2]=-c*g,t[6]=d,t[10]=c*h}else if(e.order==="ZYX"){const y=c*_,S=c*x,E=d*_,T=d*x;t[0]=h*_,t[4]=E*g-S,t[8]=y*g+T,t[1]=h*x,t[5]=T*g+y,t[9]=S*g-E,t[2]=-g,t[6]=d*h,t[10]=c*h}else if(e.order==="YZX"){const y=c*h,S=c*g,E=d*h,T=d*g;t[0]=h*_,t[4]=T-y*x,t[8]=E*x+S,t[1]=x,t[5]=c*_,t[9]=-d*_,t[2]=-g*_,t[6]=S*x+E,t[10]=y-T*x}else if(e.order==="XZY"){const y=c*h,S=c*g,E=d*h,T=d*g;t[0]=h*_,t[4]=-x,t[8]=g*_,t[1]=y*x+T,t[5]=c*_,t[9]=S*x-E,t[2]=E*x-S,t[6]=d*_,t[10]=T*x+y}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(B0,e,H0)}lookAt(e,t,r){const a=this.elements;return Vn.subVectors(e,t),Vn.lengthSq()===0&&(Vn.z=1),Vn.normalize(),vr.crossVectors(r,Vn),vr.lengthSq()===0&&(Math.abs(r.z)===1?Vn.x+=1e-4:Vn.z+=1e-4,Vn.normalize(),vr.crossVectors(r,Vn)),vr.normalize(),gl.crossVectors(Vn,vr),a[0]=vr.x,a[4]=gl.x,a[8]=Vn.x,a[1]=vr.y,a[5]=gl.y,a[9]=Vn.y,a[2]=vr.z,a[6]=gl.z,a[10]=Vn.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const r=e.elements,a=t.elements,l=this.elements,c=r[0],d=r[4],h=r[8],g=r[12],_=r[1],x=r[5],y=r[9],S=r[13],E=r[2],T=r[6],v=r[10],m=r[14],P=r[3],L=r[7],R=r[11],j=r[15],I=a[0],F=a[4],H=a[8],b=a[12],A=a[1],z=a[5],se=a[9],te=a[13],fe=a[2],he=a[6],oe=a[10],le=a[14],k=a[3],ae=a[7],re=a[11],N=a[15];return l[0]=c*I+d*A+h*fe+g*k,l[4]=c*F+d*z+h*he+g*ae,l[8]=c*H+d*se+h*oe+g*re,l[12]=c*b+d*te+h*le+g*N,l[1]=_*I+x*A+y*fe+S*k,l[5]=_*F+x*z+y*he+S*ae,l[9]=_*H+x*se+y*oe+S*re,l[13]=_*b+x*te+y*le+S*N,l[2]=E*I+T*A+v*fe+m*k,l[6]=E*F+T*z+v*he+m*ae,l[10]=E*H+T*se+v*oe+m*re,l[14]=E*b+T*te+v*le+m*N,l[3]=P*I+L*A+R*fe+j*k,l[7]=P*F+L*z+R*he+j*ae,l[11]=P*H+L*se+R*oe+j*re,l[15]=P*b+L*te+R*le+j*N,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){const e=this.elements,t=e[0],r=e[4],a=e[8],l=e[12],c=e[1],d=e[5],h=e[9],g=e[13],_=e[2],x=e[6],y=e[10],S=e[14],E=e[3],T=e[7],v=e[11],m=e[15];return E*(+l*h*x-a*g*x-l*d*y+r*g*y+a*d*S-r*h*S)+T*(+t*h*S-t*g*y+l*c*y-a*c*S+a*g*_-l*h*_)+v*(+t*g*x-t*d*S-l*c*x+r*c*S+l*d*_-r*g*_)+m*(-a*d*_-t*h*x+t*d*y+a*c*x-r*c*y+r*h*_)}transpose(){const e=this.elements;let t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,r){const a=this.elements;return e.isVector3?(a[12]=e.x,a[13]=e.y,a[14]=e.z):(a[12]=e,a[13]=t,a[14]=r),this}invert(){const e=this.elements,t=e[0],r=e[1],a=e[2],l=e[3],c=e[4],d=e[5],h=e[6],g=e[7],_=e[8],x=e[9],y=e[10],S=e[11],E=e[12],T=e[13],v=e[14],m=e[15],P=x*v*g-T*y*g+T*h*S-d*v*S-x*h*m+d*y*m,L=E*y*g-_*v*g-E*h*S+c*v*S+_*h*m-c*y*m,R=_*T*g-E*x*g+E*d*S-c*T*S-_*d*m+c*x*m,j=E*x*h-_*T*h-E*d*y+c*T*y+_*d*v-c*x*v,I=t*P+r*L+a*R+l*j;if(I===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const F=1/I;return e[0]=P*F,e[1]=(T*y*l-x*v*l-T*a*S+r*v*S+x*a*m-r*y*m)*F,e[2]=(d*v*l-T*h*l+T*a*g-r*v*g-d*a*m+r*h*m)*F,e[3]=(x*h*l-d*y*l-x*a*g+r*y*g+d*a*S-r*h*S)*F,e[4]=L*F,e[5]=(_*v*l-E*y*l+E*a*S-t*v*S-_*a*m+t*y*m)*F,e[6]=(E*h*l-c*v*l-E*a*g+t*v*g+c*a*m-t*h*m)*F,e[7]=(c*y*l-_*h*l+_*a*g-t*y*g-c*a*S+t*h*S)*F,e[8]=R*F,e[9]=(E*x*l-_*T*l-E*r*S+t*T*S+_*r*m-t*x*m)*F,e[10]=(c*T*l-E*d*l+E*r*g-t*T*g-c*r*m+t*d*m)*F,e[11]=(_*d*l-c*x*l-_*r*g+t*x*g+c*r*S-t*d*S)*F,e[12]=j*F,e[13]=(_*T*a-E*x*a+E*r*y-t*T*y-_*r*v+t*x*v)*F,e[14]=(E*d*a-c*T*a-E*r*h+t*T*h+c*r*v-t*d*v)*F,e[15]=(c*x*a-_*d*a+_*r*h-t*x*h-c*r*y+t*d*y)*F,this}scale(e){const t=this.elements,r=e.x,a=e.y,l=e.z;return t[0]*=r,t[4]*=a,t[8]*=l,t[1]*=r,t[5]*=a,t[9]*=l,t[2]*=r,t[6]*=a,t[10]*=l,t[3]*=r,t[7]*=a,t[11]*=l,this}getMaxScaleOnAxis(){const e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],r=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],a=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,r,a))}makeTranslation(e,t,r){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,r,0,0,0,1),this}makeRotationX(e){const t=Math.cos(e),r=Math.sin(e);return this.set(1,0,0,0,0,t,-r,0,0,r,t,0,0,0,0,1),this}makeRotationY(e){const t=Math.cos(e),r=Math.sin(e);return this.set(t,0,r,0,0,1,0,0,-r,0,t,0,0,0,0,1),this}makeRotationZ(e){const t=Math.cos(e),r=Math.sin(e);return this.set(t,-r,0,0,r,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){const r=Math.cos(t),a=Math.sin(t),l=1-r,c=e.x,d=e.y,h=e.z,g=l*c,_=l*d;return this.set(g*c+r,g*d-a*h,g*h+a*d,0,g*d+a*h,_*d+r,_*h-a*c,0,g*h-a*d,_*h+a*c,l*h*h+r,0,0,0,0,1),this}makeScale(e,t,r){return this.set(e,0,0,0,0,t,0,0,0,0,r,0,0,0,0,1),this}makeShear(e,t,r,a,l,c){return this.set(1,r,l,0,e,1,c,0,t,a,1,0,0,0,0,1),this}compose(e,t,r){const a=this.elements,l=t._x,c=t._y,d=t._z,h=t._w,g=l+l,_=c+c,x=d+d,y=l*g,S=l*_,E=l*x,T=c*_,v=c*x,m=d*x,P=h*g,L=h*_,R=h*x,j=r.x,I=r.y,F=r.z;return a[0]=(1-(T+m))*j,a[1]=(S+R)*j,a[2]=(E-L)*j,a[3]=0,a[4]=(S-R)*I,a[5]=(1-(y+m))*I,a[6]=(v+P)*I,a[7]=0,a[8]=(E+L)*F,a[9]=(v-P)*F,a[10]=(1-(y+T))*F,a[11]=0,a[12]=e.x,a[13]=e.y,a[14]=e.z,a[15]=1,this}decompose(e,t,r){const a=this.elements;let l=Us.set(a[0],a[1],a[2]).length();const c=Us.set(a[4],a[5],a[6]).length(),d=Us.set(a[8],a[9],a[10]).length();this.determinant()<0&&(l=-l),e.x=a[12],e.y=a[13],e.z=a[14],fi.copy(this);const g=1/l,_=1/c,x=1/d;return fi.elements[0]*=g,fi.elements[1]*=g,fi.elements[2]*=g,fi.elements[4]*=_,fi.elements[5]*=_,fi.elements[6]*=_,fi.elements[8]*=x,fi.elements[9]*=x,fi.elements[10]*=x,t.setFromRotationMatrix(fi),r.x=l,r.y=c,r.z=d,this}makePerspective(e,t,r,a,l,c,d=Xi){const h=this.elements,g=2*l/(t-e),_=2*l/(r-a),x=(t+e)/(t-e),y=(r+a)/(r-a);let S,E;if(d===Xi)S=-(c+l)/(c-l),E=-2*c*l/(c-l);else if(d===jl)S=-c/(c-l),E=-c*l/(c-l);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+d);return h[0]=g,h[4]=0,h[8]=x,h[12]=0,h[1]=0,h[5]=_,h[9]=y,h[13]=0,h[2]=0,h[6]=0,h[10]=S,h[14]=E,h[3]=0,h[7]=0,h[11]=-1,h[15]=0,this}makeOrthographic(e,t,r,a,l,c,d=Xi){const h=this.elements,g=1/(t-e),_=1/(r-a),x=1/(c-l),y=(t+e)*g,S=(r+a)*_;let E,T;if(d===Xi)E=(c+l)*x,T=-2*x;else if(d===jl)E=l*x,T=-1*x;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+d);return h[0]=2*g,h[4]=0,h[8]=0,h[12]=-y,h[1]=0,h[5]=2*_,h[9]=0,h[13]=-S,h[2]=0,h[6]=0,h[10]=T,h[14]=-E,h[3]=0,h[7]=0,h[11]=0,h[15]=1,this}equals(e){const t=this.elements,r=e.elements;for(let a=0;a<16;a++)if(t[a]!==r[a])return!1;return!0}fromArray(e,t=0){for(let r=0;r<16;r++)this.elements[r]=e[r+t];return this}toArray(e=[],t=0){const r=this.elements;return e[t]=r[0],e[t+1]=r[1],e[t+2]=r[2],e[t+3]=r[3],e[t+4]=r[4],e[t+5]=r[5],e[t+6]=r[6],e[t+7]=r[7],e[t+8]=r[8],e[t+9]=r[9],e[t+10]=r[10],e[t+11]=r[11],e[t+12]=r[12],e[t+13]=r[13],e[t+14]=r[14],e[t+15]=r[15],e}}const Us=new G,fi=new Lt,B0=new G(0,0,0),H0=new G(1,1,1),vr=new G,gl=new G,Vn=new G,dm=new Lt,hm=new ns;class Ai{constructor(e=0,t=0,r=0,a=Ai.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=r,this._order=a}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,r,a=this._order){return this._x=e,this._y=t,this._z=r,this._order=a,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,r=!0){const a=e.elements,l=a[0],c=a[4],d=a[8],h=a[1],g=a[5],_=a[9],x=a[2],y=a[6],S=a[10];switch(t){case"XYZ":this._y=Math.asin(wn(d,-1,1)),Math.abs(d)<.9999999?(this._x=Math.atan2(-_,S),this._z=Math.atan2(-c,l)):(this._x=Math.atan2(y,g),this._z=0);break;case"YXZ":this._x=Math.asin(-wn(_,-1,1)),Math.abs(_)<.9999999?(this._y=Math.atan2(d,S),this._z=Math.atan2(h,g)):(this._y=Math.atan2(-x,l),this._z=0);break;case"ZXY":this._x=Math.asin(wn(y,-1,1)),Math.abs(y)<.9999999?(this._y=Math.atan2(-x,S),this._z=Math.atan2(-c,g)):(this._y=0,this._z=Math.atan2(h,l));break;case"ZYX":this._y=Math.asin(-wn(x,-1,1)),Math.abs(x)<.9999999?(this._x=Math.atan2(y,S),this._z=Math.atan2(h,l)):(this._x=0,this._z=Math.atan2(-c,g));break;case"YZX":this._z=Math.asin(wn(h,-1,1)),Math.abs(h)<.9999999?(this._x=Math.atan2(-_,g),this._y=Math.atan2(-x,l)):(this._x=0,this._y=Math.atan2(d,S));break;case"XZY":this._z=Math.asin(-wn(c,-1,1)),Math.abs(c)<.9999999?(this._x=Math.atan2(y,g),this._y=Math.atan2(d,l)):(this._x=Math.atan2(-_,S),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,r===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,r){return dm.makeRotationFromQuaternion(e),this.setFromRotationMatrix(dm,t,r)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return hm.setFromEuler(this),this.setFromQuaternion(hm,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}Ai.DEFAULT_ORDER="XYZ";class Ug{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let V0=0;const pm=new G,Is=new ns,Bi=new Lt,_l=new G,Go=new G,G0=new G,W0=new ns,mm=new G(1,0,0),gm=new G(0,1,0),_m=new G(0,0,1),vm={type:"added"},X0={type:"removed"},Ns={type:"childadded",child:null},qc={type:"childremoved",child:null};class Yt extends is{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:V0++}),this.uuid=wr(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=Yt.DEFAULT_UP.clone();const e=new G,t=new Ai,r=new ns,a=new G(1,1,1);function l(){r.setFromEuler(t,!1)}function c(){t.setFromQuaternion(r,void 0,!1)}t._onChange(l),r._onChange(c),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:r},scale:{configurable:!0,enumerable:!0,value:a},modelViewMatrix:{value:new Lt},normalMatrix:{value:new at}}),this.matrix=new Lt,this.matrixWorld=new Lt,this.matrixAutoUpdate=Yt.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=Yt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Ug,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return Is.setFromAxisAngle(e,t),this.quaternion.multiply(Is),this}rotateOnWorldAxis(e,t){return Is.setFromAxisAngle(e,t),this.quaternion.premultiply(Is),this}rotateX(e){return this.rotateOnAxis(mm,e)}rotateY(e){return this.rotateOnAxis(gm,e)}rotateZ(e){return this.rotateOnAxis(_m,e)}translateOnAxis(e,t){return pm.copy(e).applyQuaternion(this.quaternion),this.position.add(pm.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(mm,e)}translateY(e){return this.translateOnAxis(gm,e)}translateZ(e){return this.translateOnAxis(_m,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(Bi.copy(this.matrixWorld).invert())}lookAt(e,t,r){e.isVector3?_l.copy(e):_l.set(e,t,r);const a=this.parent;this.updateWorldMatrix(!0,!1),Go.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Bi.lookAt(Go,_l,this.up):Bi.lookAt(_l,Go,this.up),this.quaternion.setFromRotationMatrix(Bi),a&&(Bi.extractRotation(a.matrixWorld),Is.setFromRotationMatrix(Bi),this.quaternion.premultiply(Is.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(vm),Ns.child=e,this.dispatchEvent(Ns),Ns.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let r=0;r<arguments.length;r++)this.remove(arguments[r]);return this}const t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(X0),qc.child=e,this.dispatchEvent(qc),qc.child=null),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),Bi.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),Bi.multiply(e.parent.matrixWorld)),e.applyMatrix4(Bi),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(vm),Ns.child=e,this.dispatchEvent(Ns),Ns.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let r=0,a=this.children.length;r<a;r++){const c=this.children[r].getObjectByProperty(e,t);if(c!==void 0)return c}}getObjectsByProperty(e,t,r=[]){this[e]===t&&r.push(this);const a=this.children;for(let l=0,c=a.length;l<c;l++)a[l].getObjectsByProperty(e,t,r);return r}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Go,e,G0),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Go,W0,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);const t=this.children;for(let r=0,a=t.length;r<a;r++)t[r].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const t=this.children;for(let r=0,a=t.length;r<a;r++)t[r].traverseVisible(e)}traverseAncestors(e){const t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);const t=this.children;for(let r=0,a=t.length;r<a;r++)t[r].updateMatrixWorld(e)}updateWorldMatrix(e,t){const r=this.parent;if(e===!0&&r!==null&&r.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),t===!0){const a=this.children;for(let l=0,c=a.length;l<c;l++)a[l].updateWorldMatrix(!1,!0)}}toJSON(e){const t=e===void 0||typeof e=="string",r={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},r.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});const a={};a.uuid=this.uuid,a.type=this.type,this.name!==""&&(a.name=this.name),this.castShadow===!0&&(a.castShadow=!0),this.receiveShadow===!0&&(a.receiveShadow=!0),this.visible===!1&&(a.visible=!1),this.frustumCulled===!1&&(a.frustumCulled=!1),this.renderOrder!==0&&(a.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(a.userData=this.userData),a.layers=this.layers.mask,a.matrix=this.matrix.toArray(),a.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(a.matrixAutoUpdate=!1),this.isInstancedMesh&&(a.type="InstancedMesh",a.count=this.count,a.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(a.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(a.type="BatchedMesh",a.perObjectFrustumCulled=this.perObjectFrustumCulled,a.sortObjects=this.sortObjects,a.drawRanges=this._drawRanges,a.reservedRanges=this._reservedRanges,a.visibility=this._visibility,a.active=this._active,a.bounds=this._bounds.map(d=>({boxInitialized:d.boxInitialized,boxMin:d.box.min.toArray(),boxMax:d.box.max.toArray(),sphereInitialized:d.sphereInitialized,sphereRadius:d.sphere.radius,sphereCenter:d.sphere.center.toArray()})),a.maxInstanceCount=this._maxInstanceCount,a.maxVertexCount=this._maxVertexCount,a.maxIndexCount=this._maxIndexCount,a.geometryInitialized=this._geometryInitialized,a.geometryCount=this._geometryCount,a.matricesTexture=this._matricesTexture.toJSON(e),this._colorsTexture!==null&&(a.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(a.boundingSphere={center:a.boundingSphere.center.toArray(),radius:a.boundingSphere.radius}),this.boundingBox!==null&&(a.boundingBox={min:a.boundingBox.min.toArray(),max:a.boundingBox.max.toArray()}));function l(d,h){return d[h.uuid]===void 0&&(d[h.uuid]=h.toJSON(e)),h.uuid}if(this.isScene)this.background&&(this.background.isColor?a.background=this.background.toJSON():this.background.isTexture&&(a.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(a.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){a.geometry=l(e.geometries,this.geometry);const d=this.geometry.parameters;if(d!==void 0&&d.shapes!==void 0){const h=d.shapes;if(Array.isArray(h))for(let g=0,_=h.length;g<_;g++){const x=h[g];l(e.shapes,x)}else l(e.shapes,h)}}if(this.isSkinnedMesh&&(a.bindMode=this.bindMode,a.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(l(e.skeletons,this.skeleton),a.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const d=[];for(let h=0,g=this.material.length;h<g;h++)d.push(l(e.materials,this.material[h]));a.material=d}else a.material=l(e.materials,this.material);if(this.children.length>0){a.children=[];for(let d=0;d<this.children.length;d++)a.children.push(this.children[d].toJSON(e).object)}if(this.animations.length>0){a.animations=[];for(let d=0;d<this.animations.length;d++){const h=this.animations[d];a.animations.push(l(e.animations,h))}}if(t){const d=c(e.geometries),h=c(e.materials),g=c(e.textures),_=c(e.images),x=c(e.shapes),y=c(e.skeletons),S=c(e.animations),E=c(e.nodes);d.length>0&&(r.geometries=d),h.length>0&&(r.materials=h),g.length>0&&(r.textures=g),_.length>0&&(r.images=_),x.length>0&&(r.shapes=x),y.length>0&&(r.skeletons=y),S.length>0&&(r.animations=S),E.length>0&&(r.nodes=E)}return r.object=a,r;function c(d){const h=[];for(const g in d){const _=d[g];delete _.metadata,h.push(_)}return h}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let r=0;r<e.children.length;r++){const a=e.children[r];this.add(a.clone())}return this}}Yt.DEFAULT_UP=new G(0,1,0);Yt.DEFAULT_MATRIX_AUTO_UPDATE=!0;Yt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const di=new G,Hi=new G,$c=new G,Vi=new G,Fs=new G,Os=new G,xm=new G,Kc=new G,Zc=new G,Qc=new G,Jc=new Vt,ef=new Vt,tf=new Vt;class ti{constructor(e=new G,t=new G,r=new G){this.a=e,this.b=t,this.c=r}static getNormal(e,t,r,a){a.subVectors(r,t),di.subVectors(e,t),a.cross(di);const l=a.lengthSq();return l>0?a.multiplyScalar(1/Math.sqrt(l)):a.set(0,0,0)}static getBarycoord(e,t,r,a,l){di.subVectors(a,t),Hi.subVectors(r,t),$c.subVectors(e,t);const c=di.dot(di),d=di.dot(Hi),h=di.dot($c),g=Hi.dot(Hi),_=Hi.dot($c),x=c*g-d*d;if(x===0)return l.set(0,0,0),null;const y=1/x,S=(g*h-d*_)*y,E=(c*_-d*h)*y;return l.set(1-S-E,E,S)}static containsPoint(e,t,r,a){return this.getBarycoord(e,t,r,a,Vi)===null?!1:Vi.x>=0&&Vi.y>=0&&Vi.x+Vi.y<=1}static getInterpolation(e,t,r,a,l,c,d,h){return this.getBarycoord(e,t,r,a,Vi)===null?(h.x=0,h.y=0,"z"in h&&(h.z=0),"w"in h&&(h.w=0),null):(h.setScalar(0),h.addScaledVector(l,Vi.x),h.addScaledVector(c,Vi.y),h.addScaledVector(d,Vi.z),h)}static getInterpolatedAttribute(e,t,r,a,l,c){return Jc.setScalar(0),ef.setScalar(0),tf.setScalar(0),Jc.fromBufferAttribute(e,t),ef.fromBufferAttribute(e,r),tf.fromBufferAttribute(e,a),c.setScalar(0),c.addScaledVector(Jc,l.x),c.addScaledVector(ef,l.y),c.addScaledVector(tf,l.z),c}static isFrontFacing(e,t,r,a){return di.subVectors(r,t),Hi.subVectors(e,t),di.cross(Hi).dot(a)<0}set(e,t,r){return this.a.copy(e),this.b.copy(t),this.c.copy(r),this}setFromPointsAndIndices(e,t,r,a){return this.a.copy(e[t]),this.b.copy(e[r]),this.c.copy(e[a]),this}setFromAttributeAndIndices(e,t,r,a){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,r),this.c.fromBufferAttribute(e,a),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return di.subVectors(this.c,this.b),Hi.subVectors(this.a,this.b),di.cross(Hi).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return ti.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return ti.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,r,a,l){return ti.getInterpolation(e,this.a,this.b,this.c,t,r,a,l)}containsPoint(e){return ti.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return ti.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){const r=this.a,a=this.b,l=this.c;let c,d;Fs.subVectors(a,r),Os.subVectors(l,r),Kc.subVectors(e,r);const h=Fs.dot(Kc),g=Os.dot(Kc);if(h<=0&&g<=0)return t.copy(r);Zc.subVectors(e,a);const _=Fs.dot(Zc),x=Os.dot(Zc);if(_>=0&&x<=_)return t.copy(a);const y=h*x-_*g;if(y<=0&&h>=0&&_<=0)return c=h/(h-_),t.copy(r).addScaledVector(Fs,c);Qc.subVectors(e,l);const S=Fs.dot(Qc),E=Os.dot(Qc);if(E>=0&&S<=E)return t.copy(l);const T=S*g-h*E;if(T<=0&&g>=0&&E<=0)return d=g/(g-E),t.copy(r).addScaledVector(Os,d);const v=_*E-S*x;if(v<=0&&x-_>=0&&S-E>=0)return xm.subVectors(l,a),d=(x-_)/(x-_+(S-E)),t.copy(a).addScaledVector(xm,d);const m=1/(v+T+y);return c=T*m,d=y*m,t.copy(r).addScaledVector(Fs,c).addScaledVector(Os,d)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}const Ig={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},xr={h:0,s:0,l:0},vl={h:0,s:0,l:0};function nf(s,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?s+(e-s)*6*t:t<1/2?e:t<2/3?s+(e-s)*6*(2/3-t):s}class pt{constructor(e,t,r){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,r)}set(e,t,r){if(t===void 0&&r===void 0){const a=e;a&&a.isColor?this.copy(a):typeof a=="number"?this.setHex(a):typeof a=="string"&&this.setStyle(a)}else this.setRGB(e,t,r);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=Tn){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,yt.toWorkingColorSpace(this,t),this}setRGB(e,t,r,a=yt.workingColorSpace){return this.r=e,this.g=t,this.b=r,yt.toWorkingColorSpace(this,a),this}setHSL(e,t,r,a=yt.workingColorSpace){if(e=R0(e,1),t=wn(t,0,1),r=wn(r,0,1),t===0)this.r=this.g=this.b=r;else{const l=r<=.5?r*(1+t):r+t-r*t,c=2*r-l;this.r=nf(c,l,e+1/3),this.g=nf(c,l,e),this.b=nf(c,l,e-1/3)}return yt.toWorkingColorSpace(this,a),this}setStyle(e,t=Tn){function r(l){l!==void 0&&parseFloat(l)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let a;if(a=/^(\w+)\(([^\)]*)\)/.exec(e)){let l;const c=a[1],d=a[2];switch(c){case"rgb":case"rgba":if(l=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(d))return r(l[4]),this.setRGB(Math.min(255,parseInt(l[1],10))/255,Math.min(255,parseInt(l[2],10))/255,Math.min(255,parseInt(l[3],10))/255,t);if(l=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(d))return r(l[4]),this.setRGB(Math.min(100,parseInt(l[1],10))/100,Math.min(100,parseInt(l[2],10))/100,Math.min(100,parseInt(l[3],10))/100,t);break;case"hsl":case"hsla":if(l=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(d))return r(l[4]),this.setHSL(parseFloat(l[1])/360,parseFloat(l[2])/100,parseFloat(l[3])/100,t);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(a=/^\#([A-Fa-f\d]+)$/.exec(e)){const l=a[1],c=l.length;if(c===3)return this.setRGB(parseInt(l.charAt(0),16)/15,parseInt(l.charAt(1),16)/15,parseInt(l.charAt(2),16)/15,t);if(c===6)return this.setHex(parseInt(l,16),t);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=Tn){const r=Ig[e.toLowerCase()];return r!==void 0?this.setHex(r,t):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=Yi(e.r),this.g=Yi(e.g),this.b=Yi(e.b),this}copyLinearToSRGB(e){return this.r=Js(e.r),this.g=Js(e.g),this.b=Js(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=Tn){return yt.fromWorkingColorSpace(mn.copy(this),e),Math.round(wn(mn.r*255,0,255))*65536+Math.round(wn(mn.g*255,0,255))*256+Math.round(wn(mn.b*255,0,255))}getHexString(e=Tn){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=yt.workingColorSpace){yt.fromWorkingColorSpace(mn.copy(this),t);const r=mn.r,a=mn.g,l=mn.b,c=Math.max(r,a,l),d=Math.min(r,a,l);let h,g;const _=(d+c)/2;if(d===c)h=0,g=0;else{const x=c-d;switch(g=_<=.5?x/(c+d):x/(2-c-d),c){case r:h=(a-l)/x+(a<l?6:0);break;case a:h=(l-r)/x+2;break;case l:h=(r-a)/x+4;break}h/=6}return e.h=h,e.s=g,e.l=_,e}getRGB(e,t=yt.workingColorSpace){return yt.fromWorkingColorSpace(mn.copy(this),t),e.r=mn.r,e.g=mn.g,e.b=mn.b,e}getStyle(e=Tn){yt.fromWorkingColorSpace(mn.copy(this),e);const t=mn.r,r=mn.g,a=mn.b;return e!==Tn?`color(${e} ${t.toFixed(3)} ${r.toFixed(3)} ${a.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(r*255)},${Math.round(a*255)})`}offsetHSL(e,t,r){return this.getHSL(xr),this.setHSL(xr.h+e,xr.s+t,xr.l+r)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,r){return this.r=e.r+(t.r-e.r)*r,this.g=e.g+(t.g-e.g)*r,this.b=e.b+(t.b-e.b)*r,this}lerpHSL(e,t){this.getHSL(xr),e.getHSL(vl);const r=kc(xr.h,vl.h,t),a=kc(xr.s,vl.s,t),l=kc(xr.l,vl.l,t);return this.setHSL(r,a,l),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const t=this.r,r=this.g,a=this.b,l=e.elements;return this.r=l[0]*t+l[3]*r+l[6]*a,this.g=l[1]*t+l[4]*r+l[7]*a,this.b=l[2]*t+l[5]*r+l[8]*a,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const mn=new pt;pt.NAMES=Ig;let Y0=0;class Rr extends is{static get type(){return"Material"}get type(){return this.constructor.type}set type(e){}constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Y0++}),this.uuid=wr(),this.name="",this.blending=Zs,this.side=Ar,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=xf,this.blendDst=yf,this.blendEquation=Kr,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new pt(0,0,0),this.blendAlpha=0,this.depthFunc=eo,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=im,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Rs,this.stencilZFail=Rs,this.stencilZPass=Rs,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const t in e){const r=e[t];if(r===void 0){console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);continue}const a=this[t];if(a===void 0){console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);continue}a&&a.isColor?a.set(r):a&&a.isVector3&&r&&r.isVector3?a.copy(r):this[t]=r}}toJSON(e){const t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});const r={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};r.uuid=this.uuid,r.type=this.type,this.name!==""&&(r.name=this.name),this.color&&this.color.isColor&&(r.color=this.color.getHex()),this.roughness!==void 0&&(r.roughness=this.roughness),this.metalness!==void 0&&(r.metalness=this.metalness),this.sheen!==void 0&&(r.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(r.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(r.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(r.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(r.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(r.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(r.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(r.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(r.shininess=this.shininess),this.clearcoat!==void 0&&(r.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(r.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(r.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(r.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(r.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,r.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.dispersion!==void 0&&(r.dispersion=this.dispersion),this.iridescence!==void 0&&(r.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(r.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(r.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(r.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(r.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(r.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(r.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(r.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(r.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(r.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(r.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(r.lightMap=this.lightMap.toJSON(e).uuid,r.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(r.aoMap=this.aoMap.toJSON(e).uuid,r.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(r.bumpMap=this.bumpMap.toJSON(e).uuid,r.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(r.normalMap=this.normalMap.toJSON(e).uuid,r.normalMapType=this.normalMapType,r.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(r.displacementMap=this.displacementMap.toJSON(e).uuid,r.displacementScale=this.displacementScale,r.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(r.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(r.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(r.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(r.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(r.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(r.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(r.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(r.combine=this.combine)),this.envMapRotation!==void 0&&(r.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(r.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(r.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(r.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(r.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(r.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(r.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(r.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(r.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(r.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(r.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(r.size=this.size),this.shadowSide!==null&&(r.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(r.sizeAttenuation=this.sizeAttenuation),this.blending!==Zs&&(r.blending=this.blending),this.side!==Ar&&(r.side=this.side),this.vertexColors===!0&&(r.vertexColors=!0),this.opacity<1&&(r.opacity=this.opacity),this.transparent===!0&&(r.transparent=!0),this.blendSrc!==xf&&(r.blendSrc=this.blendSrc),this.blendDst!==yf&&(r.blendDst=this.blendDst),this.blendEquation!==Kr&&(r.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(r.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(r.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(r.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(r.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(r.blendAlpha=this.blendAlpha),this.depthFunc!==eo&&(r.depthFunc=this.depthFunc),this.depthTest===!1&&(r.depthTest=this.depthTest),this.depthWrite===!1&&(r.depthWrite=this.depthWrite),this.colorWrite===!1&&(r.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(r.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==im&&(r.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(r.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(r.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==Rs&&(r.stencilFail=this.stencilFail),this.stencilZFail!==Rs&&(r.stencilZFail=this.stencilZFail),this.stencilZPass!==Rs&&(r.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(r.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(r.rotation=this.rotation),this.polygonOffset===!0&&(r.polygonOffset=!0),this.polygonOffsetFactor!==0&&(r.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(r.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(r.linewidth=this.linewidth),this.dashSize!==void 0&&(r.dashSize=this.dashSize),this.gapSize!==void 0&&(r.gapSize=this.gapSize),this.scale!==void 0&&(r.scale=this.scale),this.dithering===!0&&(r.dithering=!0),this.alphaTest>0&&(r.alphaTest=this.alphaTest),this.alphaHash===!0&&(r.alphaHash=!0),this.alphaToCoverage===!0&&(r.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(r.premultipliedAlpha=!0),this.forceSinglePass===!0&&(r.forceSinglePass=!0),this.wireframe===!0&&(r.wireframe=!0),this.wireframeLinewidth>1&&(r.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(r.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(r.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(r.flatShading=!0),this.visible===!1&&(r.visible=!1),this.toneMapped===!1&&(r.toneMapped=!1),this.fog===!1&&(r.fog=!1),Object.keys(this.userData).length>0&&(r.userData=this.userData);function a(l){const c=[];for(const d in l){const h=l[d];delete h.metadata,c.push(h)}return c}if(t){const l=a(e.textures),c=a(e.images);l.length>0&&(r.textures=l),c.length>0&&(r.images=c)}return r}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const t=e.clippingPlanes;let r=null;if(t!==null){const a=t.length;r=new Array(a);for(let l=0;l!==a;++l)r[l]=t[l].clone()}return this.clippingPlanes=r,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}onBuild(){console.warn("Material: onBuild() has been removed.")}}class so extends Rr{static get type(){return"MeshBasicMaterial"}constructor(e){super(),this.isMeshBasicMaterial=!0,this.color=new pt(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Ai,this.combine=ud,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const Xt=new G,xl=new je;class mi{constructor(e,t,r=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=r,this.usage=rd,this.updateRanges=[],this.gpuType=Wi,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,r){e*=this.itemSize,r*=t.itemSize;for(let a=0,l=this.itemSize;a<l;a++)this.array[e+a]=t.array[r+a];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,r=this.count;t<r;t++)xl.fromBufferAttribute(this,t),xl.applyMatrix3(e),this.setXY(t,xl.x,xl.y);else if(this.itemSize===3)for(let t=0,r=this.count;t<r;t++)Xt.fromBufferAttribute(this,t),Xt.applyMatrix3(e),this.setXYZ(t,Xt.x,Xt.y,Xt.z);return this}applyMatrix4(e){for(let t=0,r=this.count;t<r;t++)Xt.fromBufferAttribute(this,t),Xt.applyMatrix4(e),this.setXYZ(t,Xt.x,Xt.y,Xt.z);return this}applyNormalMatrix(e){for(let t=0,r=this.count;t<r;t++)Xt.fromBufferAttribute(this,t),Xt.applyNormalMatrix(e),this.setXYZ(t,Xt.x,Xt.y,Xt.z);return this}transformDirection(e){for(let t=0,r=this.count;t<r;t++)Xt.fromBufferAttribute(this,t),Xt.transformDirection(e),this.setXYZ(t,Xt.x,Xt.y,Xt.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let r=this.array[e*this.itemSize+t];return this.normalized&&(r=Ti(r,this.array)),r}setComponent(e,t,r){return this.normalized&&(r=Pt(r,this.array)),this.array[e*this.itemSize+t]=r,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=Ti(t,this.array)),t}setX(e,t){return this.normalized&&(t=Pt(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=Ti(t,this.array)),t}setY(e,t){return this.normalized&&(t=Pt(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=Ti(t,this.array)),t}setZ(e,t){return this.normalized&&(t=Pt(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=Ti(t,this.array)),t}setW(e,t){return this.normalized&&(t=Pt(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,r){return e*=this.itemSize,this.normalized&&(t=Pt(t,this.array),r=Pt(r,this.array)),this.array[e+0]=t,this.array[e+1]=r,this}setXYZ(e,t,r,a){return e*=this.itemSize,this.normalized&&(t=Pt(t,this.array),r=Pt(r,this.array),a=Pt(a,this.array)),this.array[e+0]=t,this.array[e+1]=r,this.array[e+2]=a,this}setXYZW(e,t,r,a,l){return e*=this.itemSize,this.normalized&&(t=Pt(t,this.array),r=Pt(r,this.array),a=Pt(a,this.array),l=Pt(l,this.array)),this.array[e+0]=t,this.array[e+1]=r,this.array[e+2]=a,this.array[e+3]=l,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==rd&&(e.usage=this.usage),e}}class Ng extends mi{constructor(e,t,r){super(new Uint16Array(e),t,r)}}class Fg extends mi{constructor(e,t,r){super(new Uint32Array(e),t,r)}}class sn extends mi{constructor(e,t,r){super(new Float32Array(e),t,r)}}let j0=0;const Qn=new Lt,rf=new Yt,zs=new G,Gn=new ta,Wo=new ta,rn=new G;class Cn extends is{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:j0++}),this.uuid=wr(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(bg(e)?Fg:Ng)(e,1):this.index=e,this}setIndirect(e){return this.indirect=e,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,r=0){this.groups.push({start:e,count:t,materialIndex:r})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){const t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);const r=this.attributes.normal;if(r!==void 0){const l=new at().getNormalMatrix(e);r.applyNormalMatrix(l),r.needsUpdate=!0}const a=this.attributes.tangent;return a!==void 0&&(a.transformDirection(e),a.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return Qn.makeRotationFromQuaternion(e),this.applyMatrix4(Qn),this}rotateX(e){return Qn.makeRotationX(e),this.applyMatrix4(Qn),this}rotateY(e){return Qn.makeRotationY(e),this.applyMatrix4(Qn),this}rotateZ(e){return Qn.makeRotationZ(e),this.applyMatrix4(Qn),this}translate(e,t,r){return Qn.makeTranslation(e,t,r),this.applyMatrix4(Qn),this}scale(e,t,r){return Qn.makeScale(e,t,r),this.applyMatrix4(Qn),this}lookAt(e){return rf.lookAt(e),rf.updateMatrix(),this.applyMatrix4(rf.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(zs).negate(),this.translate(zs.x,zs.y,zs.z),this}setFromPoints(e){const t=this.getAttribute("position");if(t===void 0){const r=[];for(let a=0,l=e.length;a<l;a++){const c=e[a];r.push(c.x,c.y,c.z||0)}this.setAttribute("position",new sn(r,3))}else{for(let r=0,a=t.count;r<a;r++){const l=e[r];t.setXYZ(r,l.x,l.y,l.z||0)}e.length>t.count&&console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new ta);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new G(-1/0,-1/0,-1/0),new G(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let r=0,a=t.length;r<a;r++){const l=t[r];Gn.setFromBufferAttribute(l),this.morphTargetsRelative?(rn.addVectors(this.boundingBox.min,Gn.min),this.boundingBox.expandByPoint(rn),rn.addVectors(this.boundingBox.max,Gn.max),this.boundingBox.expandByPoint(rn)):(this.boundingBox.expandByPoint(Gn.min),this.boundingBox.expandByPoint(Gn.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new na);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new G,1/0);return}if(e){const r=this.boundingSphere.center;if(Gn.setFromBufferAttribute(e),t)for(let l=0,c=t.length;l<c;l++){const d=t[l];Wo.setFromBufferAttribute(d),this.morphTargetsRelative?(rn.addVectors(Gn.min,Wo.min),Gn.expandByPoint(rn),rn.addVectors(Gn.max,Wo.max),Gn.expandByPoint(rn)):(Gn.expandByPoint(Wo.min),Gn.expandByPoint(Wo.max))}Gn.getCenter(r);let a=0;for(let l=0,c=e.count;l<c;l++)rn.fromBufferAttribute(e,l),a=Math.max(a,r.distanceToSquared(rn));if(t)for(let l=0,c=t.length;l<c;l++){const d=t[l],h=this.morphTargetsRelative;for(let g=0,_=d.count;g<_;g++)rn.fromBufferAttribute(d,g),h&&(zs.fromBufferAttribute(e,g),rn.add(zs)),a=Math.max(a,r.distanceToSquared(rn))}this.boundingSphere.radius=Math.sqrt(a),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const r=t.position,a=t.normal,l=t.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new mi(new Float32Array(4*r.count),4));const c=this.getAttribute("tangent"),d=[],h=[];for(let H=0;H<r.count;H++)d[H]=new G,h[H]=new G;const g=new G,_=new G,x=new G,y=new je,S=new je,E=new je,T=new G,v=new G;function m(H,b,A){g.fromBufferAttribute(r,H),_.fromBufferAttribute(r,b),x.fromBufferAttribute(r,A),y.fromBufferAttribute(l,H),S.fromBufferAttribute(l,b),E.fromBufferAttribute(l,A),_.sub(g),x.sub(g),S.sub(y),E.sub(y);const z=1/(S.x*E.y-E.x*S.y);isFinite(z)&&(T.copy(_).multiplyScalar(E.y).addScaledVector(x,-S.y).multiplyScalar(z),v.copy(x).multiplyScalar(S.x).addScaledVector(_,-E.x).multiplyScalar(z),d[H].add(T),d[b].add(T),d[A].add(T),h[H].add(v),h[b].add(v),h[A].add(v))}let P=this.groups;P.length===0&&(P=[{start:0,count:e.count}]);for(let H=0,b=P.length;H<b;++H){const A=P[H],z=A.start,se=A.count;for(let te=z,fe=z+se;te<fe;te+=3)m(e.getX(te+0),e.getX(te+1),e.getX(te+2))}const L=new G,R=new G,j=new G,I=new G;function F(H){j.fromBufferAttribute(a,H),I.copy(j);const b=d[H];L.copy(b),L.sub(j.multiplyScalar(j.dot(b))).normalize(),R.crossVectors(I,b);const z=R.dot(h[H])<0?-1:1;c.setXYZW(H,L.x,L.y,L.z,z)}for(let H=0,b=P.length;H<b;++H){const A=P[H],z=A.start,se=A.count;for(let te=z,fe=z+se;te<fe;te+=3)F(e.getX(te+0)),F(e.getX(te+1)),F(e.getX(te+2))}}computeVertexNormals(){const e=this.index,t=this.getAttribute("position");if(t!==void 0){let r=this.getAttribute("normal");if(r===void 0)r=new mi(new Float32Array(t.count*3),3),this.setAttribute("normal",r);else for(let y=0,S=r.count;y<S;y++)r.setXYZ(y,0,0,0);const a=new G,l=new G,c=new G,d=new G,h=new G,g=new G,_=new G,x=new G;if(e)for(let y=0,S=e.count;y<S;y+=3){const E=e.getX(y+0),T=e.getX(y+1),v=e.getX(y+2);a.fromBufferAttribute(t,E),l.fromBufferAttribute(t,T),c.fromBufferAttribute(t,v),_.subVectors(c,l),x.subVectors(a,l),_.cross(x),d.fromBufferAttribute(r,E),h.fromBufferAttribute(r,T),g.fromBufferAttribute(r,v),d.add(_),h.add(_),g.add(_),r.setXYZ(E,d.x,d.y,d.z),r.setXYZ(T,h.x,h.y,h.z),r.setXYZ(v,g.x,g.y,g.z)}else for(let y=0,S=t.count;y<S;y+=3)a.fromBufferAttribute(t,y+0),l.fromBufferAttribute(t,y+1),c.fromBufferAttribute(t,y+2),_.subVectors(c,l),x.subVectors(a,l),_.cross(x),r.setXYZ(y+0,_.x,_.y,_.z),r.setXYZ(y+1,_.x,_.y,_.z),r.setXYZ(y+2,_.x,_.y,_.z);this.normalizeNormals(),r.needsUpdate=!0}}normalizeNormals(){const e=this.attributes.normal;for(let t=0,r=e.count;t<r;t++)rn.fromBufferAttribute(e,t),rn.normalize(),e.setXYZ(t,rn.x,rn.y,rn.z)}toNonIndexed(){function e(d,h){const g=d.array,_=d.itemSize,x=d.normalized,y=new g.constructor(h.length*_);let S=0,E=0;for(let T=0,v=h.length;T<v;T++){d.isInterleavedBufferAttribute?S=h[T]*d.data.stride+d.offset:S=h[T]*_;for(let m=0;m<_;m++)y[E++]=g[S++]}return new mi(y,_,x)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const t=new Cn,r=this.index.array,a=this.attributes;for(const d in a){const h=a[d],g=e(h,r);t.setAttribute(d,g)}const l=this.morphAttributes;for(const d in l){const h=[],g=l[d];for(let _=0,x=g.length;_<x;_++){const y=g[_],S=e(y,r);h.push(S)}t.morphAttributes[d]=h}t.morphTargetsRelative=this.morphTargetsRelative;const c=this.groups;for(let d=0,h=c.length;d<h;d++){const g=c[d];t.addGroup(g.start,g.count,g.materialIndex)}return t}toJSON(){const e={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){const h=this.parameters;for(const g in h)h[g]!==void 0&&(e[g]=h[g]);return e}e.data={attributes:{}};const t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});const r=this.attributes;for(const h in r){const g=r[h];e.data.attributes[h]=g.toJSON(e.data)}const a={};let l=!1;for(const h in this.morphAttributes){const g=this.morphAttributes[h],_=[];for(let x=0,y=g.length;x<y;x++){const S=g[x];_.push(S.toJSON(e.data))}_.length>0&&(a[h]=_,l=!0)}l&&(e.data.morphAttributes=a,e.data.morphTargetsRelative=this.morphTargetsRelative);const c=this.groups;c.length>0&&(e.data.groups=JSON.parse(JSON.stringify(c)));const d=this.boundingSphere;return d!==null&&(e.data.boundingSphere={center:d.center.toArray(),radius:d.radius}),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const t={};this.name=e.name;const r=e.index;r!==null&&this.setIndex(r.clone(t));const a=e.attributes;for(const g in a){const _=a[g];this.setAttribute(g,_.clone(t))}const l=e.morphAttributes;for(const g in l){const _=[],x=l[g];for(let y=0,S=x.length;y<S;y++)_.push(x[y].clone(t));this.morphAttributes[g]=_}this.morphTargetsRelative=e.morphTargetsRelative;const c=e.groups;for(let g=0,_=c.length;g<_;g++){const x=c[g];this.addGroup(x.start,x.count,x.materialIndex)}const d=e.boundingBox;d!==null&&(this.boundingBox=d.clone());const h=e.boundingSphere;return h!==null&&(this.boundingSphere=h.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const ym=new Lt,Xr=new Jl,yl=new na,Sm=new G,Sl=new G,Ml=new G,El=new G,sf=new G,Tl=new G,Mm=new G,wl=new G;class On extends Yt{constructor(e=new Cn,t=new so){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const t=this.geometry.morphAttributes,r=Object.keys(t);if(r.length>0){const a=t[r[0]];if(a!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let l=0,c=a.length;l<c;l++){const d=a[l].name||String(l);this.morphTargetInfluences.push(0),this.morphTargetDictionary[d]=l}}}}getVertexPosition(e,t){const r=this.geometry,a=r.attributes.position,l=r.morphAttributes.position,c=r.morphTargetsRelative;t.fromBufferAttribute(a,e);const d=this.morphTargetInfluences;if(l&&d){Tl.set(0,0,0);for(let h=0,g=l.length;h<g;h++){const _=d[h],x=l[h];_!==0&&(sf.fromBufferAttribute(x,e),c?Tl.addScaledVector(sf,_):Tl.addScaledVector(sf.sub(t),_))}t.add(Tl)}return t}raycast(e,t){const r=this.geometry,a=this.material,l=this.matrixWorld;a!==void 0&&(r.boundingSphere===null&&r.computeBoundingSphere(),yl.copy(r.boundingSphere),yl.applyMatrix4(l),Xr.copy(e.ray).recast(e.near),!(yl.containsPoint(Xr.origin)===!1&&(Xr.intersectSphere(yl,Sm)===null||Xr.origin.distanceToSquared(Sm)>(e.far-e.near)**2))&&(ym.copy(l).invert(),Xr.copy(e.ray).applyMatrix4(ym),!(r.boundingBox!==null&&Xr.intersectsBox(r.boundingBox)===!1)&&this._computeIntersections(e,t,Xr)))}_computeIntersections(e,t,r){let a;const l=this.geometry,c=this.material,d=l.index,h=l.attributes.position,g=l.attributes.uv,_=l.attributes.uv1,x=l.attributes.normal,y=l.groups,S=l.drawRange;if(d!==null)if(Array.isArray(c))for(let E=0,T=y.length;E<T;E++){const v=y[E],m=c[v.materialIndex],P=Math.max(v.start,S.start),L=Math.min(d.count,Math.min(v.start+v.count,S.start+S.count));for(let R=P,j=L;R<j;R+=3){const I=d.getX(R),F=d.getX(R+1),H=d.getX(R+2);a=Al(this,m,e,r,g,_,x,I,F,H),a&&(a.faceIndex=Math.floor(R/3),a.face.materialIndex=v.materialIndex,t.push(a))}}else{const E=Math.max(0,S.start),T=Math.min(d.count,S.start+S.count);for(let v=E,m=T;v<m;v+=3){const P=d.getX(v),L=d.getX(v+1),R=d.getX(v+2);a=Al(this,c,e,r,g,_,x,P,L,R),a&&(a.faceIndex=Math.floor(v/3),t.push(a))}}else if(h!==void 0)if(Array.isArray(c))for(let E=0,T=y.length;E<T;E++){const v=y[E],m=c[v.materialIndex],P=Math.max(v.start,S.start),L=Math.min(h.count,Math.min(v.start+v.count,S.start+S.count));for(let R=P,j=L;R<j;R+=3){const I=R,F=R+1,H=R+2;a=Al(this,m,e,r,g,_,x,I,F,H),a&&(a.faceIndex=Math.floor(R/3),a.face.materialIndex=v.materialIndex,t.push(a))}}else{const E=Math.max(0,S.start),T=Math.min(h.count,S.start+S.count);for(let v=E,m=T;v<m;v+=3){const P=v,L=v+1,R=v+2;a=Al(this,c,e,r,g,_,x,P,L,R),a&&(a.faceIndex=Math.floor(v/3),t.push(a))}}}}function q0(s,e,t,r,a,l,c,d){let h;if(e.side===An?h=r.intersectTriangle(c,l,a,!0,d):h=r.intersectTriangle(a,l,c,e.side===Ar,d),h===null)return null;wl.copy(d),wl.applyMatrix4(s.matrixWorld);const g=t.ray.origin.distanceTo(wl);return g<t.near||g>t.far?null:{distance:g,point:wl.clone(),object:s}}function Al(s,e,t,r,a,l,c,d,h,g){s.getVertexPosition(d,Sl),s.getVertexPosition(h,Ml),s.getVertexPosition(g,El);const _=q0(s,e,t,r,Sl,Ml,El,Mm);if(_){const x=new G;ti.getBarycoord(Mm,Sl,Ml,El,x),a&&(_.uv=ti.getInterpolatedAttribute(a,d,h,g,x,new je)),l&&(_.uv1=ti.getInterpolatedAttribute(l,d,h,g,x,new je)),c&&(_.normal=ti.getInterpolatedAttribute(c,d,h,g,x,new G),_.normal.dot(r.direction)>0&&_.normal.multiplyScalar(-1));const y={a:d,b:h,c:g,normal:new G,materialIndex:0};ti.getNormal(Sl,Ml,El,y.normal),_.face=y,_.barycoord=x}return _}class ia extends Cn{constructor(e=1,t=1,r=1,a=1,l=1,c=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:r,widthSegments:a,heightSegments:l,depthSegments:c};const d=this;a=Math.floor(a),l=Math.floor(l),c=Math.floor(c);const h=[],g=[],_=[],x=[];let y=0,S=0;E("z","y","x",-1,-1,r,t,e,c,l,0),E("z","y","x",1,-1,r,t,-e,c,l,1),E("x","z","y",1,1,e,r,t,a,c,2),E("x","z","y",1,-1,e,r,-t,a,c,3),E("x","y","z",1,-1,e,t,r,a,l,4),E("x","y","z",-1,-1,e,t,-r,a,l,5),this.setIndex(h),this.setAttribute("position",new sn(g,3)),this.setAttribute("normal",new sn(_,3)),this.setAttribute("uv",new sn(x,2));function E(T,v,m,P,L,R,j,I,F,H,b){const A=R/F,z=j/H,se=R/2,te=j/2,fe=I/2,he=F+1,oe=H+1;let le=0,k=0;const ae=new G;for(let re=0;re<oe;re++){const N=re*z-te;for(let ne=0;ne<he;ne++){const De=ne*A-se;ae[T]=De*P,ae[v]=N*L,ae[m]=fe,g.push(ae.x,ae.y,ae.z),ae[T]=0,ae[v]=0,ae[m]=I>0?1:-1,_.push(ae.x,ae.y,ae.z),x.push(ne/F),x.push(1-re/H),le+=1}}for(let re=0;re<H;re++)for(let N=0;N<F;N++){const ne=y+N+he*re,De=y+N+he*(re+1),Z=y+(N+1)+he*(re+1),ue=y+(N+1)+he*re;h.push(ne,De,ue),h.push(De,Z,ue),k+=6}d.addGroup(S,k,b),S+=k,y+=le}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new ia(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}function oo(s){const e={};for(const t in s){e[t]={};for(const r in s[t]){const a=s[t][r];a&&(a.isColor||a.isMatrix3||a.isMatrix4||a.isVector2||a.isVector3||a.isVector4||a.isTexture||a.isQuaternion)?a.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][r]=null):e[t][r]=a.clone():Array.isArray(a)?e[t][r]=a.slice():e[t][r]=a}}return e}function En(s){const e={};for(let t=0;t<s.length;t++){const r=oo(s[t]);for(const a in r)e[a]=r[a]}return e}function $0(s){const e=[];for(let t=0;t<s.length;t++)e.push(s[t].clone());return e}function Og(s){const e=s.getRenderTarget();return e===null?s.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:yt.workingColorSpace}const K0={clone:oo,merge:En};var Z0=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Q0=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class Cr extends Rr{static get type(){return"ShaderMaterial"}constructor(e){super(),this.isShaderMaterial=!0,this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Z0,this.fragmentShader=Q0,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=oo(e.uniforms),this.uniformsGroups=$0(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){const t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(const a in this.uniforms){const c=this.uniforms[a].value;c&&c.isTexture?t.uniforms[a]={type:"t",value:c.toJSON(e).uuid}:c&&c.isColor?t.uniforms[a]={type:"c",value:c.getHex()}:c&&c.isVector2?t.uniforms[a]={type:"v2",value:c.toArray()}:c&&c.isVector3?t.uniforms[a]={type:"v3",value:c.toArray()}:c&&c.isVector4?t.uniforms[a]={type:"v4",value:c.toArray()}:c&&c.isMatrix3?t.uniforms[a]={type:"m3",value:c.toArray()}:c&&c.isMatrix4?t.uniforms[a]={type:"m4",value:c.toArray()}:t.uniforms[a]={value:c}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;const r={};for(const a in this.extensions)this.extensions[a]===!0&&(r[a]=!0);return Object.keys(r).length>0&&(t.extensions=r),t}}class zg extends Yt{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Lt,this.projectionMatrix=new Lt,this.projectionMatrixInverse=new Lt,this.coordinateSystem=Xi}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}const yr=new G,Em=new je,Tm=new je;class ei extends zg{constructor(e=50,t=1,r=.1,a=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=r,this.far=a,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const t=.5*this.getFilmHeight()/e;this.fov=sd*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(Wl*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return sd*2*Math.atan(Math.tan(Wl*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,r){yr.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(yr.x,yr.y).multiplyScalar(-e/yr.z),yr.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),r.set(yr.x,yr.y).multiplyScalar(-e/yr.z)}getViewSize(e,t){return this.getViewBounds(e,Em,Tm),t.subVectors(Tm,Em)}setViewOffset(e,t,r,a,l,c){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=r,this.view.offsetY=a,this.view.width=l,this.view.height=c,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let t=e*Math.tan(Wl*.5*this.fov)/this.zoom,r=2*t,a=this.aspect*r,l=-.5*a;const c=this.view;if(this.view!==null&&this.view.enabled){const h=c.fullWidth,g=c.fullHeight;l+=c.offsetX*a/h,t-=c.offsetY*r/g,a*=c.width/h,r*=c.height/g}const d=this.filmOffset;d!==0&&(l+=e*d/this.getFilmWidth()),this.projectionMatrix.makePerspective(l,l+a,t,t-r,e,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}}const ks=-90,Bs=1;class J0 extends Yt{constructor(e,t,r){super(),this.type="CubeCamera",this.renderTarget=r,this.coordinateSystem=null,this.activeMipmapLevel=0;const a=new ei(ks,Bs,e,t);a.layers=this.layers,this.add(a);const l=new ei(ks,Bs,e,t);l.layers=this.layers,this.add(l);const c=new ei(ks,Bs,e,t);c.layers=this.layers,this.add(c);const d=new ei(ks,Bs,e,t);d.layers=this.layers,this.add(d);const h=new ei(ks,Bs,e,t);h.layers=this.layers,this.add(h);const g=new ei(ks,Bs,e,t);g.layers=this.layers,this.add(g)}updateCoordinateSystem(){const e=this.coordinateSystem,t=this.children.concat(),[r,a,l,c,d,h]=t;for(const g of t)this.remove(g);if(e===Xi)r.up.set(0,1,0),r.lookAt(1,0,0),a.up.set(0,1,0),a.lookAt(-1,0,0),l.up.set(0,0,-1),l.lookAt(0,1,0),c.up.set(0,0,1),c.lookAt(0,-1,0),d.up.set(0,1,0),d.lookAt(0,0,1),h.up.set(0,1,0),h.lookAt(0,0,-1);else if(e===jl)r.up.set(0,-1,0),r.lookAt(-1,0,0),a.up.set(0,-1,0),a.lookAt(1,0,0),l.up.set(0,0,1),l.lookAt(0,1,0),c.up.set(0,0,-1),c.lookAt(0,-1,0),d.up.set(0,-1,0),d.lookAt(0,0,1),h.up.set(0,-1,0),h.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const g of t)this.add(g),g.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();const{renderTarget:r,activeMipmapLevel:a}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[l,c,d,h,g,_]=this.children,x=e.getRenderTarget(),y=e.getActiveCubeFace(),S=e.getActiveMipmapLevel(),E=e.xr.enabled;e.xr.enabled=!1;const T=r.texture.generateMipmaps;r.texture.generateMipmaps=!1,e.setRenderTarget(r,0,a),e.render(t,l),e.setRenderTarget(r,1,a),e.render(t,c),e.setRenderTarget(r,2,a),e.render(t,d),e.setRenderTarget(r,3,a),e.render(t,h),e.setRenderTarget(r,4,a),e.render(t,g),r.texture.generateMipmaps=T,e.setRenderTarget(r,5,a),e.render(t,_),e.setRenderTarget(x,y,S),e.xr.enabled=E,r.texture.needsPMREMUpdate=!0}}class kg extends gn{constructor(e,t,r,a,l,c,d,h,g,_){e=e!==void 0?e:[],t=t!==void 0?t:to,super(e,t,r,a,l,c,d,h,g,_),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class ex extends ts{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;const r={width:e,height:e,depth:1},a=[r,r,r,r,r,r];this.texture=new kg(a,t.mapping,t.wrapS,t.wrapT,t.magFilter,t.minFilter,t.format,t.type,t.anisotropy,t.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=t.generateMipmaps!==void 0?t.generateMipmaps:!1,this.texture.minFilter=t.minFilter!==void 0?t.minFilter:wi}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;const r={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},a=new ia(5,5,5),l=new Cr({name:"CubemapFromEquirect",uniforms:oo(r.uniforms),vertexShader:r.vertexShader,fragmentShader:r.fragmentShader,side:An,blending:Er});l.uniforms.tEquirect.value=t;const c=new On(a,l),d=t.minFilter;return t.minFilter===Jr&&(t.minFilter=wi),new J0(1,10,this).update(e,c),t.minFilter=d,c.geometry.dispose(),c.material.dispose(),this}clear(e,t,r,a){const l=e.getRenderTarget();for(let c=0;c<6;c++)e.setRenderTarget(this,c),e.clear(t,r,a);e.setRenderTarget(l)}}const of=new G,tx=new G,nx=new at;class Sr{constructor(e=new G(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,r,a){return this.normal.set(e,t,r),this.constant=a,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,r){const a=of.subVectors(r,t).cross(tx.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(a,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){const r=e.delta(of),a=this.normal.dot(r);if(a===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;const l=-(e.start.dot(this.normal)+this.constant)/a;return l<0||l>1?null:t.copy(e.start).addScaledVector(r,l)}intersectsLine(e){const t=this.distanceToPoint(e.start),r=this.distanceToPoint(e.end);return t<0&&r>0||r<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){const r=t||nx.getNormalMatrix(e),a=this.coplanarPoint(of).applyMatrix4(e),l=this.normal.applyMatrix3(r).normalize();return this.constant=-a.dot(l),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}}const Yr=new na,Cl=new G;class gd{constructor(e=new Sr,t=new Sr,r=new Sr,a=new Sr,l=new Sr,c=new Sr){this.planes=[e,t,r,a,l,c]}set(e,t,r,a,l,c){const d=this.planes;return d[0].copy(e),d[1].copy(t),d[2].copy(r),d[3].copy(a),d[4].copy(l),d[5].copy(c),this}copy(e){const t=this.planes;for(let r=0;r<6;r++)t[r].copy(e.planes[r]);return this}setFromProjectionMatrix(e,t=Xi){const r=this.planes,a=e.elements,l=a[0],c=a[1],d=a[2],h=a[3],g=a[4],_=a[5],x=a[6],y=a[7],S=a[8],E=a[9],T=a[10],v=a[11],m=a[12],P=a[13],L=a[14],R=a[15];if(r[0].setComponents(h-l,y-g,v-S,R-m).normalize(),r[1].setComponents(h+l,y+g,v+S,R+m).normalize(),r[2].setComponents(h+c,y+_,v+E,R+P).normalize(),r[3].setComponents(h-c,y-_,v-E,R-P).normalize(),r[4].setComponents(h-d,y-x,v-T,R-L).normalize(),t===Xi)r[5].setComponents(h+d,y+x,v+T,R+L).normalize();else if(t===jl)r[5].setComponents(d,x,T,L).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),Yr.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),Yr.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(Yr)}intersectsSprite(e){return Yr.center.set(0,0,0),Yr.radius=.7071067811865476,Yr.applyMatrix4(e.matrixWorld),this.intersectsSphere(Yr)}intersectsSphere(e){const t=this.planes,r=e.center,a=-e.radius;for(let l=0;l<6;l++)if(t[l].distanceToPoint(r)<a)return!1;return!0}intersectsBox(e){const t=this.planes;for(let r=0;r<6;r++){const a=t[r];if(Cl.x=a.normal.x>0?e.max.x:e.min.x,Cl.y=a.normal.y>0?e.max.y:e.min.y,Cl.z=a.normal.z>0?e.max.z:e.min.z,a.distanceToPoint(Cl)<0)return!1}return!0}containsPoint(e){const t=this.planes;for(let r=0;r<6;r++)if(t[r].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}function Bg(){let s=null,e=!1,t=null,r=null;function a(l,c){t(l,c),r=s.requestAnimationFrame(a)}return{start:function(){e!==!0&&t!==null&&(r=s.requestAnimationFrame(a),e=!0)},stop:function(){s.cancelAnimationFrame(r),e=!1},setAnimationLoop:function(l){t=l},setContext:function(l){s=l}}}function ix(s){const e=new WeakMap;function t(d,h){const g=d.array,_=d.usage,x=g.byteLength,y=s.createBuffer();s.bindBuffer(h,y),s.bufferData(h,g,_),d.onUploadCallback();let S;if(g instanceof Float32Array)S=s.FLOAT;else if(g instanceof Uint16Array)d.isFloat16BufferAttribute?S=s.HALF_FLOAT:S=s.UNSIGNED_SHORT;else if(g instanceof Int16Array)S=s.SHORT;else if(g instanceof Uint32Array)S=s.UNSIGNED_INT;else if(g instanceof Int32Array)S=s.INT;else if(g instanceof Int8Array)S=s.BYTE;else if(g instanceof Uint8Array)S=s.UNSIGNED_BYTE;else if(g instanceof Uint8ClampedArray)S=s.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+g);return{buffer:y,type:S,bytesPerElement:g.BYTES_PER_ELEMENT,version:d.version,size:x}}function r(d,h,g){const _=h.array,x=h.updateRanges;if(s.bindBuffer(g,d),x.length===0)s.bufferSubData(g,0,_);else{x.sort((S,E)=>S.start-E.start);let y=0;for(let S=1;S<x.length;S++){const E=x[y],T=x[S];T.start<=E.start+E.count+1?E.count=Math.max(E.count,T.start+T.count-E.start):(++y,x[y]=T)}x.length=y+1;for(let S=0,E=x.length;S<E;S++){const T=x[S];s.bufferSubData(g,T.start*_.BYTES_PER_ELEMENT,_,T.start,T.count)}h.clearUpdateRanges()}h.onUploadCallback()}function a(d){return d.isInterleavedBufferAttribute&&(d=d.data),e.get(d)}function l(d){d.isInterleavedBufferAttribute&&(d=d.data);const h=e.get(d);h&&(s.deleteBuffer(h.buffer),e.delete(d))}function c(d,h){if(d.isInterleavedBufferAttribute&&(d=d.data),d.isGLBufferAttribute){const _=e.get(d);(!_||_.version<d.version)&&e.set(d,{buffer:d.buffer,type:d.type,bytesPerElement:d.elementSize,version:d.version});return}const g=e.get(d);if(g===void 0)e.set(d,t(d,h));else if(g.version<d.version){if(g.size!==d.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");r(g.buffer,d,h),g.version=d.version}}return{get:a,remove:l,update:c}}class eu extends Cn{constructor(e=1,t=1,r=1,a=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:r,heightSegments:a};const l=e/2,c=t/2,d=Math.floor(r),h=Math.floor(a),g=d+1,_=h+1,x=e/d,y=t/h,S=[],E=[],T=[],v=[];for(let m=0;m<_;m++){const P=m*y-c;for(let L=0;L<g;L++){const R=L*x-l;E.push(R,-P,0),T.push(0,0,1),v.push(L/d),v.push(1-m/h)}}for(let m=0;m<h;m++)for(let P=0;P<d;P++){const L=P+g*m,R=P+g*(m+1),j=P+1+g*(m+1),I=P+1+g*m;S.push(L,R,I),S.push(R,j,I)}this.setIndex(S),this.setAttribute("position",new sn(E,3)),this.setAttribute("normal",new sn(T,3)),this.setAttribute("uv",new sn(v,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new eu(e.width,e.height,e.widthSegments,e.heightSegments)}}var rx=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,sx=`#ifdef USE_ALPHAHASH
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
#endif`,ox=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,ax=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,lx=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,ux=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,cx=`#ifdef USE_AOMAP
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
#endif`,fx=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,dx=`#ifdef USE_BATCHING
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
#endif`,hx=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,px=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,mx=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,gx=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,_x=`#ifdef USE_IRIDESCENCE
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
#endif`,vx=`#ifdef USE_BUMPMAP
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
#endif`,xx=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_star
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
			#pragma unroll_loop_star
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
		#pragma unroll_loop_star
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_star
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,yx=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Sx=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Mx=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Ex=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,Tx=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,wx=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,Ax=`#if defined( USE_COLOR_ALPHA )
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
#endif`,Cx=`#define PI 3.141592653589793
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
} // validated`,Rx=`#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif`,Px=`vec3 transformedNormal = objectNormal;
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
#endif`,bx=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,Lx=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Dx=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,Ux=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Ix="gl_FragColor = linearToOutputTexel( gl_FragColor );",Nx=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,Fx=`#ifdef USE_ENVMAP
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
#endif`,Ox=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif

#endif`,zx=`#ifdef USE_ENVMAP
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
#endif`,kx=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS

		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,Bx=`#ifdef USE_ENVMAP
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
#endif`,Hx=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,Vx=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,Gx=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,Wx=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,Xx=`#ifdef USE_GRADIENTMAP
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
}`,Yx=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,jx=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,qx=`varying vec3 vViewPosition;
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
#define RE_Direct				RE_Direct_Lamber
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,$x=`uniform bool receiveShadow;
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
#endif`,Kx=`#ifdef USE_ENVMAP
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
#endif`,Zx=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,Qx=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,Jx=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,ey=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,ty=`PhysicalMaterial material;
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
#endif`,ny=`struct PhysicalMaterial {
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
}`,iy=`
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
	#pragma unroll_loop_star
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
	#pragma unroll_loop_star
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
	#pragma unroll_loop_star
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
	#pragma unroll_loop_star
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
		#pragma unroll_loop_star
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,ry=`#if defined( RE_IndirectDiffuse )
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
#endif`,sy=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,oy=`#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,ay=`#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,ly=`#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,uy=`#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,cy=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,fy=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,dy=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,hy=`#if defined( USE_POINTS_UV )
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
#endif`,py=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,my=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,gy=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,_y=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,vy=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,xy=`#ifdef USE_MORPHTARGETS
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
#endif`,yy=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Sy=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,My=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,Ey=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Ty=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,wy=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,Ay=`#ifdef USE_NORMALMAP
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
#endif`,Cy=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,Ry=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,Py=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,by=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,Ly=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,Dy=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,Uy=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,Iy=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,Ny=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,Fy=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,Oy=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,zy=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,ky=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,By=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,Hy=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_star
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_star
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_star
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,Vy=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_star
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_star
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_star
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,Gy=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,Wy=`#ifdef USE_SKINNING
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
#endif`,Xy=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,Yy=`#ifdef USE_SKINNING
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
#endif`,jy=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,qy=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,$y=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,Ky=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,Zy=`#ifdef USE_TRANSMISSION
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
#endif`,Qy=`#ifdef USE_TRANSMISSION
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
#endif`,Jy=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,eS=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,tS=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,nS=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const iS=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,rS=`uniform sampler2D t2D;
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
}`,sS=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,oS=`#ifdef ENVMAP_TYPE_CUBE
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
}`,aS=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,lS=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,uS=`#include <common>
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
}`,cS=`#if DEPTH_PACKING == 3200
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
}`,fS=`#define DISTANCE
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
}`,dS=`#define DISTANCE
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
}`,hS=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,pS=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,mS=`uniform float scale;
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
}`,gS=`uniform vec3 diffuse;
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
}`,_S=`#include <common>
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
}`,vS=`uniform vec3 diffuse;
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
}`,xS=`#define LAMBERT
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
}`,yS=`#define LAMBERT
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
}`,SS=`#define MATCAP
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
}`,MS=`#define MATCAP
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
}`,ES=`#define NORMAL
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
}`,TS=`#define NORMAL
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
}`,wS=`#define PHONG
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
}`,AS=`#define PHONG
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
}`,CS=`#define STANDARD
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
}`,RS=`#define STANDARD
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
}`,PS=`#define TOON
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
}`,bS=`#define TOON
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
}`,LS=`uniform float size;
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
}`,DS=`uniform vec3 diffuse;
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
}`,US=`#include <common>
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
}`,IS=`uniform vec3 color;
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
}`,NS=`uniform float rotation;
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
}`,FS=`uniform vec3 diffuse;
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
}`,lt={alphahash_fragment:rx,alphahash_pars_fragment:sx,alphamap_fragment:ox,alphamap_pars_fragment:ax,alphatest_fragment:lx,alphatest_pars_fragment:ux,aomap_fragment:cx,aomap_pars_fragment:fx,batching_pars_vertex:dx,batching_vertex:hx,begin_vertex:px,beginnormal_vertex:mx,bsdfs:gx,iridescence_fragment:_x,bumpmap_pars_fragment:vx,clipping_planes_fragment:xx,clipping_planes_pars_fragment:yx,clipping_planes_pars_vertex:Sx,clipping_planes_vertex:Mx,color_fragment:Ex,color_pars_fragment:Tx,color_pars_vertex:wx,color_vertex:Ax,common:Cx,cube_uv_reflection_fragment:Rx,defaultnormal_vertex:Px,displacementmap_pars_vertex:bx,displacementmap_vertex:Lx,emissivemap_fragment:Dx,emissivemap_pars_fragment:Ux,colorspace_fragment:Ix,colorspace_pars_fragment:Nx,envmap_fragment:Fx,envmap_common_pars_fragment:Ox,envmap_pars_fragment:zx,envmap_pars_vertex:kx,envmap_physical_pars_fragment:Kx,envmap_vertex:Bx,fog_vertex:Hx,fog_pars_vertex:Vx,fog_fragment:Gx,fog_pars_fragment:Wx,gradientmap_pars_fragment:Xx,lightmap_pars_fragment:Yx,lights_lambert_fragment:jx,lights_lambert_pars_fragment:qx,lights_pars_begin:$x,lights_toon_fragment:Zx,lights_toon_pars_fragment:Qx,lights_phong_fragment:Jx,lights_phong_pars_fragment:ey,lights_physical_fragment:ty,lights_physical_pars_fragment:ny,lights_fragment_begin:iy,lights_fragment_maps:ry,lights_fragment_end:sy,logdepthbuf_fragment:oy,logdepthbuf_pars_fragment:ay,logdepthbuf_pars_vertex:ly,logdepthbuf_vertex:uy,map_fragment:cy,map_pars_fragment:fy,map_particle_fragment:dy,map_particle_pars_fragment:hy,metalnessmap_fragment:py,metalnessmap_pars_fragment:my,morphinstance_vertex:gy,morphcolor_vertex:_y,morphnormal_vertex:vy,morphtarget_pars_vertex:xy,morphtarget_vertex:yy,normal_fragment_begin:Sy,normal_fragment_maps:My,normal_pars_fragment:Ey,normal_pars_vertex:Ty,normal_vertex:wy,normalmap_pars_fragment:Ay,clearcoat_normal_fragment_begin:Cy,clearcoat_normal_fragment_maps:Ry,clearcoat_pars_fragment:Py,iridescence_pars_fragment:by,opaque_fragment:Ly,packing:Dy,premultiplied_alpha_fragment:Uy,project_vertex:Iy,dithering_fragment:Ny,dithering_pars_fragment:Fy,roughnessmap_fragment:Oy,roughnessmap_pars_fragment:zy,shadowmap_pars_fragment:ky,shadowmap_pars_vertex:By,shadowmap_vertex:Hy,shadowmask_pars_fragment:Vy,skinbase_vertex:Gy,skinning_pars_vertex:Wy,skinning_vertex:Xy,skinnormal_vertex:Yy,specularmap_fragment:jy,specularmap_pars_fragment:qy,tonemapping_fragment:$y,tonemapping_pars_fragment:Ky,transmission_fragment:Zy,transmission_pars_fragment:Qy,uv_pars_fragment:Jy,uv_pars_vertex:eS,uv_vertex:tS,worldpos_vertex:nS,background_vert:iS,background_frag:rS,backgroundCube_vert:sS,backgroundCube_frag:oS,cube_vert:aS,cube_frag:lS,depth_vert:uS,depth_frag:cS,distanceRGBA_vert:fS,distanceRGBA_frag:dS,equirect_vert:hS,equirect_frag:pS,linedashed_vert:mS,linedashed_frag:gS,meshbasic_vert:_S,meshbasic_frag:vS,meshlambert_vert:xS,meshlambert_frag:yS,meshmatcap_vert:SS,meshmatcap_frag:MS,meshnormal_vert:ES,meshnormal_frag:TS,meshphong_vert:wS,meshphong_frag:AS,meshphysical_vert:CS,meshphysical_frag:RS,meshtoon_vert:PS,meshtoon_frag:bS,points_vert:LS,points_frag:DS,shadow_vert:US,shadow_frag:IS,sprite_vert:NS,sprite_frag:FS},Re={common:{diffuse:{value:new pt(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new at},alphaMap:{value:null},alphaMapTransform:{value:new at},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new at}},envmap:{envMap:{value:null},envMapRotation:{value:new at},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new at}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new at}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new at},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new at},normalScale:{value:new je(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new at},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new at}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new at}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new at}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new pt(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new pt(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new at},alphaTest:{value:0},uvTransform:{value:new at}},sprite:{diffuse:{value:new pt(16777215)},opacity:{value:1},center:{value:new je(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new at},alphaMap:{value:null},alphaMapTransform:{value:new at},alphaTest:{value:0}}},Mi={basic:{uniforms:En([Re.common,Re.specularmap,Re.envmap,Re.aomap,Re.lightmap,Re.fog]),vertexShader:lt.meshbasic_vert,fragmentShader:lt.meshbasic_frag},lambert:{uniforms:En([Re.common,Re.specularmap,Re.envmap,Re.aomap,Re.lightmap,Re.emissivemap,Re.bumpmap,Re.normalmap,Re.displacementmap,Re.fog,Re.lights,{emissive:{value:new pt(0)}}]),vertexShader:lt.meshlambert_vert,fragmentShader:lt.meshlambert_frag},phong:{uniforms:En([Re.common,Re.specularmap,Re.envmap,Re.aomap,Re.lightmap,Re.emissivemap,Re.bumpmap,Re.normalmap,Re.displacementmap,Re.fog,Re.lights,{emissive:{value:new pt(0)},specular:{value:new pt(1118481)},shininess:{value:30}}]),vertexShader:lt.meshphong_vert,fragmentShader:lt.meshphong_frag},standard:{uniforms:En([Re.common,Re.envmap,Re.aomap,Re.lightmap,Re.emissivemap,Re.bumpmap,Re.normalmap,Re.displacementmap,Re.roughnessmap,Re.metalnessmap,Re.fog,Re.lights,{emissive:{value:new pt(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:lt.meshphysical_vert,fragmentShader:lt.meshphysical_frag},toon:{uniforms:En([Re.common,Re.aomap,Re.lightmap,Re.emissivemap,Re.bumpmap,Re.normalmap,Re.displacementmap,Re.gradientmap,Re.fog,Re.lights,{emissive:{value:new pt(0)}}]),vertexShader:lt.meshtoon_vert,fragmentShader:lt.meshtoon_frag},matcap:{uniforms:En([Re.common,Re.bumpmap,Re.normalmap,Re.displacementmap,Re.fog,{matcap:{value:null}}]),vertexShader:lt.meshmatcap_vert,fragmentShader:lt.meshmatcap_frag},points:{uniforms:En([Re.points,Re.fog]),vertexShader:lt.points_vert,fragmentShader:lt.points_frag},dashed:{uniforms:En([Re.common,Re.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:lt.linedashed_vert,fragmentShader:lt.linedashed_frag},depth:{uniforms:En([Re.common,Re.displacementmap]),vertexShader:lt.depth_vert,fragmentShader:lt.depth_frag},normal:{uniforms:En([Re.common,Re.bumpmap,Re.normalmap,Re.displacementmap,{opacity:{value:1}}]),vertexShader:lt.meshnormal_vert,fragmentShader:lt.meshnormal_frag},sprite:{uniforms:En([Re.sprite,Re.fog]),vertexShader:lt.sprite_vert,fragmentShader:lt.sprite_frag},background:{uniforms:{uvTransform:{value:new at},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:lt.background_vert,fragmentShader:lt.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new at}},vertexShader:lt.backgroundCube_vert,fragmentShader:lt.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:lt.cube_vert,fragmentShader:lt.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:lt.equirect_vert,fragmentShader:lt.equirect_frag},distanceRGBA:{uniforms:En([Re.common,Re.displacementmap,{referencePosition:{value:new G},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:lt.distanceRGBA_vert,fragmentShader:lt.distanceRGBA_frag},shadow:{uniforms:En([Re.lights,Re.fog,{color:{value:new pt(0)},opacity:{value:1}}]),vertexShader:lt.shadow_vert,fragmentShader:lt.shadow_frag}};Mi.physical={uniforms:En([Mi.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new at},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new at},clearcoatNormalScale:{value:new je(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new at},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new at},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new at},sheen:{value:0},sheenColor:{value:new pt(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new at},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new at},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new at},transmissionSamplerSize:{value:new je},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new at},attenuationDistance:{value:0},attenuationColor:{value:new pt(0)},specularColor:{value:new pt(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new at},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new at},anisotropyVector:{value:new je},anisotropyMap:{value:null},anisotropyMapTransform:{value:new at}}]),vertexShader:lt.meshphysical_vert,fragmentShader:lt.meshphysical_frag};const Rl={r:0,b:0,g:0},jr=new Ai,OS=new Lt;function zS(s,e,t,r,a,l,c){const d=new pt(0);let h=l===!0?0:1,g,_,x=null,y=0,S=null;function E(P){let L=P.isScene===!0?P.background:null;return L&&L.isTexture&&(L=(P.backgroundBlurriness>0?t:e).get(L)),L}function T(P){let L=!1;const R=E(P);R===null?m(d,h):R&&R.isColor&&(m(R,1),L=!0);const j=s.xr.getEnvironmentBlendMode();j==="additive"?r.buffers.color.setClear(0,0,0,1,c):j==="alpha-blend"&&r.buffers.color.setClear(0,0,0,0,c),(s.autoClear||L)&&(r.buffers.depth.setTest(!0),r.buffers.depth.setMask(!0),r.buffers.color.setMask(!0),s.clear(s.autoClearColor,s.autoClearDepth,s.autoClearStencil))}function v(P,L){const R=E(L);R&&(R.isCubeTexture||R.mapping===Zl)?(_===void 0&&(_=new On(new ia(1,1,1),new Cr({name:"BackgroundCubeMaterial",uniforms:oo(Mi.backgroundCube.uniforms),vertexShader:Mi.backgroundCube.vertexShader,fragmentShader:Mi.backgroundCube.fragmentShader,side:An,depthTest:!1,depthWrite:!1,fog:!1})),_.geometry.deleteAttribute("normal"),_.geometry.deleteAttribute("uv"),_.onBeforeRender=function(j,I,F){this.matrixWorld.copyPosition(F.matrixWorld)},Object.defineProperty(_.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),a.update(_)),jr.copy(L.backgroundRotation),jr.x*=-1,jr.y*=-1,jr.z*=-1,R.isCubeTexture&&R.isRenderTargetTexture===!1&&(jr.y*=-1,jr.z*=-1),_.material.uniforms.envMap.value=R,_.material.uniforms.flipEnvMap.value=R.isCubeTexture&&R.isRenderTargetTexture===!1?-1:1,_.material.uniforms.backgroundBlurriness.value=L.backgroundBlurriness,_.material.uniforms.backgroundIntensity.value=L.backgroundIntensity,_.material.uniforms.backgroundRotation.value.setFromMatrix4(OS.makeRotationFromEuler(jr)),_.material.toneMapped=yt.getTransfer(R.colorSpace)!==Rt,(x!==R||y!==R.version||S!==s.toneMapping)&&(_.material.needsUpdate=!0,x=R,y=R.version,S=s.toneMapping),_.layers.enableAll(),P.unshift(_,_.geometry,_.material,0,0,null)):R&&R.isTexture&&(g===void 0&&(g=new On(new eu(2,2),new Cr({name:"BackgroundMaterial",uniforms:oo(Mi.background.uniforms),vertexShader:Mi.background.vertexShader,fragmentShader:Mi.background.fragmentShader,side:Ar,depthTest:!1,depthWrite:!1,fog:!1})),g.geometry.deleteAttribute("normal"),Object.defineProperty(g.material,"map",{get:function(){return this.uniforms.t2D.value}}),a.update(g)),g.material.uniforms.t2D.value=R,g.material.uniforms.backgroundIntensity.value=L.backgroundIntensity,g.material.toneMapped=yt.getTransfer(R.colorSpace)!==Rt,R.matrixAutoUpdate===!0&&R.updateMatrix(),g.material.uniforms.uvTransform.value.copy(R.matrix),(x!==R||y!==R.version||S!==s.toneMapping)&&(g.material.needsUpdate=!0,x=R,y=R.version,S=s.toneMapping),g.layers.enableAll(),P.unshift(g,g.geometry,g.material,0,0,null))}function m(P,L){P.getRGB(Rl,Og(s)),r.buffers.color.setClear(Rl.r,Rl.g,Rl.b,L,c)}return{getClearColor:function(){return d},setClearColor:function(P,L=1){d.set(P),h=L,m(d,h)},getClearAlpha:function(){return h},setClearAlpha:function(P){h=P,m(d,h)},render:T,addToRenderList:v}}function kS(s,e){const t=s.getParameter(s.MAX_VERTEX_ATTRIBS),r={},a=y(null);let l=a,c=!1;function d(A,z,se,te,fe){let he=!1;const oe=x(te,se,z);l!==oe&&(l=oe,g(l.object)),he=S(A,te,se,fe),he&&E(A,te,se,fe),fe!==null&&e.update(fe,s.ELEMENT_ARRAY_BUFFER),(he||c)&&(c=!1,R(A,z,se,te),fe!==null&&s.bindBuffer(s.ELEMENT_ARRAY_BUFFER,e.get(fe).buffer))}function h(){return s.createVertexArray()}function g(A){return s.bindVertexArray(A)}function _(A){return s.deleteVertexArray(A)}function x(A,z,se){const te=se.wireframe===!0;let fe=r[A.id];fe===void 0&&(fe={},r[A.id]=fe);let he=fe[z.id];he===void 0&&(he={},fe[z.id]=he);let oe=he[te];return oe===void 0&&(oe=y(h()),he[te]=oe),oe}function y(A){const z=[],se=[],te=[];for(let fe=0;fe<t;fe++)z[fe]=0,se[fe]=0,te[fe]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:z,enabledAttributes:se,attributeDivisors:te,object:A,attributes:{},index:null}}function S(A,z,se,te){const fe=l.attributes,he=z.attributes;let oe=0;const le=se.getAttributes();for(const k in le)if(le[k].location>=0){const re=fe[k];let N=he[k];if(N===void 0&&(k==="instanceMatrix"&&A.instanceMatrix&&(N=A.instanceMatrix),k==="instanceColor"&&A.instanceColor&&(N=A.instanceColor)),re===void 0||re.attribute!==N||N&&re.data!==N.data)return!0;oe++}return l.attributesNum!==oe||l.index!==te}function E(A,z,se,te){const fe={},he=z.attributes;let oe=0;const le=se.getAttributes();for(const k in le)if(le[k].location>=0){let re=he[k];re===void 0&&(k==="instanceMatrix"&&A.instanceMatrix&&(re=A.instanceMatrix),k==="instanceColor"&&A.instanceColor&&(re=A.instanceColor));const N={};N.attribute=re,re&&re.data&&(N.data=re.data),fe[k]=N,oe++}l.attributes=fe,l.attributesNum=oe,l.index=te}function T(){const A=l.newAttributes;for(let z=0,se=A.length;z<se;z++)A[z]=0}function v(A){m(A,0)}function m(A,z){const se=l.newAttributes,te=l.enabledAttributes,fe=l.attributeDivisors;se[A]=1,te[A]===0&&(s.enableVertexAttribArray(A),te[A]=1),fe[A]!==z&&(s.vertexAttribDivisor(A,z),fe[A]=z)}function P(){const A=l.newAttributes,z=l.enabledAttributes;for(let se=0,te=z.length;se<te;se++)z[se]!==A[se]&&(s.disableVertexAttribArray(se),z[se]=0)}function L(A,z,se,te,fe,he,oe){oe===!0?s.vertexAttribIPointer(A,z,se,fe,he):s.vertexAttribPointer(A,z,se,te,fe,he)}function R(A,z,se,te){T();const fe=te.attributes,he=se.getAttributes(),oe=z.defaultAttributeValues;for(const le in he){const k=he[le];if(k.location>=0){let ae=fe[le];if(ae===void 0&&(le==="instanceMatrix"&&A.instanceMatrix&&(ae=A.instanceMatrix),le==="instanceColor"&&A.instanceColor&&(ae=A.instanceColor)),ae!==void 0){const re=ae.normalized,N=ae.itemSize,ne=e.get(ae);if(ne===void 0)continue;const De=ne.buffer,Z=ne.type,ue=ne.bytesPerElement,Me=Z===s.INT||Z===s.UNSIGNED_INT||ae.gpuType===cd;if(ae.isInterleavedBufferAttribute){const ve=ae.data,we=ve.stride,Ue=ae.offset;if(ve.isInstancedInterleavedBuffer){for(let Ze=0;Ze<k.locationSize;Ze++)m(k.location+Ze,ve.meshPerAttribute);A.isInstancedMesh!==!0&&te._maxInstanceCount===void 0&&(te._maxInstanceCount=ve.meshPerAttribute*ve.count)}else for(let Ze=0;Ze<k.locationSize;Ze++)v(k.location+Ze);s.bindBuffer(s.ARRAY_BUFFER,De);for(let Ze=0;Ze<k.locationSize;Ze++)L(k.location+Ze,N/k.locationSize,Z,re,we*ue,(Ue+N/k.locationSize*Ze)*ue,Me)}else{if(ae.isInstancedBufferAttribute){for(let ve=0;ve<k.locationSize;ve++)m(k.location+ve,ae.meshPerAttribute);A.isInstancedMesh!==!0&&te._maxInstanceCount===void 0&&(te._maxInstanceCount=ae.meshPerAttribute*ae.count)}else for(let ve=0;ve<k.locationSize;ve++)v(k.location+ve);s.bindBuffer(s.ARRAY_BUFFER,De);for(let ve=0;ve<k.locationSize;ve++)L(k.location+ve,N/k.locationSize,Z,re,N*ue,N/k.locationSize*ve*ue,Me)}}else if(oe!==void 0){const re=oe[le];if(re!==void 0)switch(re.length){case 2:s.vertexAttrib2fv(k.location,re);break;case 3:s.vertexAttrib3fv(k.location,re);break;case 4:s.vertexAttrib4fv(k.location,re);break;default:s.vertexAttrib1fv(k.location,re)}}}}P()}function j(){H();for(const A in r){const z=r[A];for(const se in z){const te=z[se];for(const fe in te)_(te[fe].object),delete te[fe];delete z[se]}delete r[A]}}function I(A){if(r[A.id]===void 0)return;const z=r[A.id];for(const se in z){const te=z[se];for(const fe in te)_(te[fe].object),delete te[fe];delete z[se]}delete r[A.id]}function F(A){for(const z in r){const se=r[z];if(se[A.id]===void 0)continue;const te=se[A.id];for(const fe in te)_(te[fe].object),delete te[fe];delete se[A.id]}}function H(){b(),c=!0,l!==a&&(l=a,g(l.object))}function b(){a.geometry=null,a.program=null,a.wireframe=!1}return{setup:d,reset:H,resetDefaultState:b,dispose:j,releaseStatesOfGeometry:I,releaseStatesOfProgram:F,initAttributes:T,enableAttribute:v,disableUnusedAttributes:P}}function BS(s,e,t){let r;function a(g){r=g}function l(g,_){s.drawArrays(r,g,_),t.update(_,r,1)}function c(g,_,x){x!==0&&(s.drawArraysInstanced(r,g,_,x),t.update(_,r,x))}function d(g,_,x){if(x===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(r,g,0,_,0,x);let S=0;for(let E=0;E<x;E++)S+=_[E];t.update(S,r,1)}function h(g,_,x,y){if(x===0)return;const S=e.get("WEBGL_multi_draw");if(S===null)for(let E=0;E<g.length;E++)c(g[E],_[E],y[E]);else{S.multiDrawArraysInstancedWEBGL(r,g,0,_,0,y,0,x);let E=0;for(let T=0;T<x;T++)E+=_[T]*y[T];t.update(E,r,1)}}this.setMode=a,this.render=l,this.renderInstances=c,this.renderMultiDraw=d,this.renderMultiDrawInstances=h}function HS(s,e,t,r){let a;function l(){if(a!==void 0)return a;if(e.has("EXT_texture_filter_anisotropic")===!0){const F=e.get("EXT_texture_filter_anisotropic");a=s.getParameter(F.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else a=0;return a}function c(F){return!(F!==hi&&r.convert(F)!==s.getParameter(s.IMPLEMENTATION_COLOR_READ_FORMAT))}function d(F){const H=F===ea&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(F!==ji&&r.convert(F)!==s.getParameter(s.IMPLEMENTATION_COLOR_READ_TYPE)&&F!==Wi&&!H)}function h(F){if(F==="highp"){if(s.getShaderPrecisionFormat(s.VERTEX_SHADER,s.HIGH_FLOAT).precision>0&&s.getShaderPrecisionFormat(s.FRAGMENT_SHADER,s.HIGH_FLOAT).precision>0)return"highp";F="mediump"}return F==="mediump"&&s.getShaderPrecisionFormat(s.VERTEX_SHADER,s.MEDIUM_FLOAT).precision>0&&s.getShaderPrecisionFormat(s.FRAGMENT_SHADER,s.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let g=t.precision!==void 0?t.precision:"highp";const _=h(g);_!==g&&(console.warn("THREE.WebGLRenderer:",g,"not supported, using",_,"instead."),g=_);const x=t.logarithmicDepthBuffer===!0,y=t.reverseDepthBuffer===!0&&e.has("EXT_clip_control"),S=s.getParameter(s.MAX_TEXTURE_IMAGE_UNITS),E=s.getParameter(s.MAX_VERTEX_TEXTURE_IMAGE_UNITS),T=s.getParameter(s.MAX_TEXTURE_SIZE),v=s.getParameter(s.MAX_CUBE_MAP_TEXTURE_SIZE),m=s.getParameter(s.MAX_VERTEX_ATTRIBS),P=s.getParameter(s.MAX_VERTEX_UNIFORM_VECTORS),L=s.getParameter(s.MAX_VARYING_VECTORS),R=s.getParameter(s.MAX_FRAGMENT_UNIFORM_VECTORS),j=E>0,I=s.getParameter(s.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:l,getMaxPrecision:h,textureFormatReadable:c,textureTypeReadable:d,precision:g,logarithmicDepthBuffer:x,reverseDepthBuffer:y,maxTextures:S,maxVertexTextures:E,maxTextureSize:T,maxCubemapSize:v,maxAttributes:m,maxVertexUniforms:P,maxVaryings:L,maxFragmentUniforms:R,vertexTextures:j,maxSamples:I}}function VS(s){const e=this;let t=null,r=0,a=!1,l=!1;const c=new Sr,d=new at,h={value:null,needsUpdate:!1};this.uniform=h,this.numPlanes=0,this.numIntersection=0,this.init=function(x,y){const S=x.length!==0||y||r!==0||a;return a=y,r=x.length,S},this.beginShadows=function(){l=!0,_(null)},this.endShadows=function(){l=!1},this.setGlobalState=function(x,y){t=_(x,y,0)},this.setState=function(x,y,S){const E=x.clippingPlanes,T=x.clipIntersection,v=x.clipShadows,m=s.get(x);if(!a||E===null||E.length===0||l&&!v)l?_(null):g();else{const P=l?0:r,L=P*4;let R=m.clippingState||null;h.value=R,R=_(E,y,L,S);for(let j=0;j!==L;++j)R[j]=t[j];m.clippingState=R,this.numIntersection=T?this.numPlanes:0,this.numPlanes+=P}};function g(){h.value!==t&&(h.value=t,h.needsUpdate=r>0),e.numPlanes=r,e.numIntersection=0}function _(x,y,S,E){const T=x!==null?x.length:0;let v=null;if(T!==0){if(v=h.value,E!==!0||v===null){const m=S+T*4,P=y.matrixWorldInverse;d.getNormalMatrix(P),(v===null||v.length<m)&&(v=new Float32Array(m));for(let L=0,R=S;L!==T;++L,R+=4)c.copy(x[L]).applyMatrix4(P,d),c.normal.toArray(v,R),v[R+3]=c.constant}h.value=v,h.needsUpdate=!0}return e.numPlanes=T,e.numIntersection=0,v}}function GS(s){let e=new WeakMap;function t(c,d){return d===Rf?c.mapping=to:d===Pf&&(c.mapping=no),c}function r(c){if(c&&c.isTexture){const d=c.mapping;if(d===Rf||d===Pf)if(e.has(c)){const h=e.get(c).texture;return t(h,c.mapping)}else{const h=c.image;if(h&&h.height>0){const g=new ex(h.height);return g.fromEquirectangularTexture(s,c),e.set(c,g),c.addEventListener("dispose",a),t(g.texture,c.mapping)}else return null}}return c}function a(c){const d=c.target;d.removeEventListener("dispose",a);const h=e.get(d);h!==void 0&&(e.delete(d),h.dispose())}function l(){e=new WeakMap}return{get:r,dispose:l}}class Hg extends zg{constructor(e=-1,t=1,r=1,a=-1,l=.1,c=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=r,this.bottom=a,this.near=l,this.far=c,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,r,a,l,c){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=r,this.view.offsetY=a,this.view.width=l,this.view.height=c,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),r=(this.right+this.left)/2,a=(this.top+this.bottom)/2;let l=r-e,c=r+e,d=a+t,h=a-t;if(this.view!==null&&this.view.enabled){const g=(this.right-this.left)/this.view.fullWidth/this.zoom,_=(this.top-this.bottom)/this.view.fullHeight/this.zoom;l+=g*this.view.offsetX,c=l+g*this.view.width,d-=_*this.view.offsetY,h=d-_*this.view.height}this.projectionMatrix.makeOrthographic(l,c,d,h,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}}const qs=4,wm=[.125,.215,.35,.446,.526,.582],Zr=20,af=new Hg,Am=new pt;let lf=null,uf=0,cf=0,ff=!1;const $r=(1+Math.sqrt(5))/2,Hs=1/$r,Cm=[new G(-$r,Hs,0),new G($r,Hs,0),new G(-Hs,0,$r),new G(Hs,0,$r),new G(0,$r,-Hs),new G(0,$r,Hs),new G(-1,1,-1),new G(1,1,-1),new G(-1,1,1),new G(1,1,1)];class Rm{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,r=.1,a=100){lf=this._renderer.getRenderTarget(),uf=this._renderer.getActiveCubeFace(),cf=this._renderer.getActiveMipmapLevel(),ff=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(256);const l=this._allocateTargets();return l.depthBuffer=!0,this._sceneToCubeUV(e,r,a,l),t>0&&this._blur(l,0,0,t),this._applyPMREM(l),this._cleanup(l),l}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Lm(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=bm(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(lf,uf,cf),this._renderer.xr.enabled=ff,e.scissorTest=!1,Pl(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===to||e.mapping===no?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),lf=this._renderer.getRenderTarget(),uf=this._renderer.getActiveCubeFace(),cf=this._renderer.getActiveMipmapLevel(),ff=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const r=t||this._allocateTargets();return this._textureToCubeUV(e,r),this._applyPMREM(r),this._cleanup(r),r}_allocateTargets(){const e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,r={magFilter:wi,minFilter:wi,generateMipmaps:!1,type:ea,format:hi,colorSpace:ao,depthBuffer:!1},a=Pm(e,t,r);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Pm(e,t,r);const{_lodMax:l}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=WS(l)),this._blurMaterial=XS(l,e,t)}return a}_compileMaterial(e){const t=new On(this._lodPlanes[0],e);this._renderer.compile(t,af)}_sceneToCubeUV(e,t,r,a){const d=new ei(90,1,t,r),h=[1,-1,1,1,1,1],g=[1,1,1,-1,-1,-1],_=this._renderer,x=_.autoClear,y=_.toneMapping;_.getClearColor(Am),_.toneMapping=Tr,_.autoClear=!1;const S=new so({name:"PMREM.Background",side:An,depthWrite:!1,depthTest:!1}),E=new On(new ia,S);let T=!1;const v=e.background;v?v.isColor&&(S.color.copy(v),e.background=null,T=!0):(S.color.copy(Am),T=!0);for(let m=0;m<6;m++){const P=m%3;P===0?(d.up.set(0,h[m],0),d.lookAt(g[m],0,0)):P===1?(d.up.set(0,0,h[m]),d.lookAt(0,g[m],0)):(d.up.set(0,h[m],0),d.lookAt(0,0,g[m]));const L=this._cubeSize;Pl(a,P*L,m>2?L:0,L,L),_.setRenderTarget(a),T&&_.render(E,d),_.render(e,d)}E.geometry.dispose(),E.material.dispose(),_.toneMapping=y,_.autoClear=x,e.background=v}_textureToCubeUV(e,t){const r=this._renderer,a=e.mapping===to||e.mapping===no;a?(this._cubemapMaterial===null&&(this._cubemapMaterial=Lm()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=bm());const l=a?this._cubemapMaterial:this._equirectMaterial,c=new On(this._lodPlanes[0],l),d=l.uniforms;d.envMap.value=e;const h=this._cubeSize;Pl(t,0,0,3*h,2*h),r.setRenderTarget(t),r.render(c,af)}_applyPMREM(e){const t=this._renderer,r=t.autoClear;t.autoClear=!1;const a=this._lodPlanes.length;for(let l=1;l<a;l++){const c=Math.sqrt(this._sigmas[l]*this._sigmas[l]-this._sigmas[l-1]*this._sigmas[l-1]),d=Cm[(a-l-1)%Cm.length];this._blur(e,l-1,l,c,d)}t.autoClear=r}_blur(e,t,r,a,l){const c=this._pingPongRenderTarget;this._halfBlur(e,c,t,r,a,"latitudinal",l),this._halfBlur(c,e,r,r,a,"longitudinal",l)}_halfBlur(e,t,r,a,l,c,d){const h=this._renderer,g=this._blurMaterial;c!=="latitudinal"&&c!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");const _=3,x=new On(this._lodPlanes[a],g),y=g.uniforms,S=this._sizeLods[r]-1,E=isFinite(l)?Math.PI/(2*S):2*Math.PI/(2*Zr-1),T=l/E,v=isFinite(l)?1+Math.floor(_*T):Zr;v>Zr&&console.warn(`sigmaRadians, ${l}, is too large and will clip, as it requested ${v} samples when the maximum is set to ${Zr}`);const m=[];let P=0;for(let F=0;F<Zr;++F){const H=F/T,b=Math.exp(-H*H/2);m.push(b),F===0?P+=b:F<v&&(P+=2*b)}for(let F=0;F<m.length;F++)m[F]=m[F]/P;y.envMap.value=e.texture,y.samples.value=v,y.weights.value=m,y.latitudinal.value=c==="latitudinal",d&&(y.poleAxis.value=d);const{_lodMax:L}=this;y.dTheta.value=E,y.mipInt.value=L-r;const R=this._sizeLods[a],j=3*R*(a>L-qs?a-L+qs:0),I=4*(this._cubeSize-R);Pl(t,j,I,3*R,2*R),h.setRenderTarget(t),h.render(x,af)}}function WS(s){const e=[],t=[],r=[];let a=s;const l=s-qs+1+wm.length;for(let c=0;c<l;c++){const d=Math.pow(2,a);t.push(d);let h=1/d;c>s-qs?h=wm[c-s+qs-1]:c===0&&(h=0),r.push(h);const g=1/(d-2),_=-g,x=1+g,y=[_,_,x,_,x,x,_,_,x,x,_,x],S=6,E=6,T=3,v=2,m=1,P=new Float32Array(T*E*S),L=new Float32Array(v*E*S),R=new Float32Array(m*E*S);for(let I=0;I<S;I++){const F=I%3*2/3-1,H=I>2?0:-1,b=[F,H,0,F+2/3,H,0,F+2/3,H+1,0,F,H,0,F+2/3,H+1,0,F,H+1,0];P.set(b,T*E*I),L.set(y,v*E*I);const A=[I,I,I,I,I,I];R.set(A,m*E*I)}const j=new Cn;j.setAttribute("position",new mi(P,T)),j.setAttribute("uv",new mi(L,v)),j.setAttribute("faceIndex",new mi(R,m)),e.push(j),a>qs&&a--}return{lodPlanes:e,sizeLods:t,sigmas:r}}function Pm(s,e,t){const r=new ts(s,e,t);return r.texture.mapping=Zl,r.texture.name="PMREM.cubeUv",r.scissorTest=!0,r}function Pl(s,e,t,r,a){s.viewport.set(e,t,r,a),s.scissor.set(e,t,r,a)}function XS(s,e,t){const r=new Float32Array(Zr),a=new G(0,1,0);return new Cr({name:"SphericalGaussianBlur",defines:{n:Zr,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${s}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:r},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:a}},vertexShader:_d(),fragmentShader:`

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
		`,blending:Er,depthTest:!1,depthWrite:!1})}function bm(){return new Cr({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:_d(),fragmentShader:`

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
		`,blending:Er,depthTest:!1,depthWrite:!1})}function Lm(){return new Cr({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:_d(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Er,depthTest:!1,depthWrite:!1})}function _d(){return`

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
	`}function YS(s){let e=new WeakMap,t=null;function r(d){if(d&&d.isTexture){const h=d.mapping,g=h===Rf||h===Pf,_=h===to||h===no;if(g||_){let x=e.get(d);const y=x!==void 0?x.texture.pmremVersion:0;if(d.isRenderTargetTexture&&d.pmremVersion!==y)return t===null&&(t=new Rm(s)),x=g?t.fromEquirectangular(d,x):t.fromCubemap(d,x),x.texture.pmremVersion=d.pmremVersion,e.set(d,x),x.texture;if(x!==void 0)return x.texture;{const S=d.image;return g&&S&&S.height>0||_&&S&&a(S)?(t===null&&(t=new Rm(s)),x=g?t.fromEquirectangular(d):t.fromCubemap(d),x.texture.pmremVersion=d.pmremVersion,e.set(d,x),d.addEventListener("dispose",l),x.texture):null}}}return d}function a(d){let h=0;const g=6;for(let _=0;_<g;_++)d[_]!==void 0&&h++;return h===g}function l(d){const h=d.target;h.removeEventListener("dispose",l);const g=e.get(h);g!==void 0&&(e.delete(h),g.dispose())}function c(){e=new WeakMap,t!==null&&(t.dispose(),t=null)}return{get:r,dispose:c}}function jS(s){const e={};function t(r){if(e[r]!==void 0)return e[r];let a;switch(r){case"WEBGL_depth_texture":a=s.getExtension("WEBGL_depth_texture")||s.getExtension("MOZ_WEBGL_depth_texture")||s.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":a=s.getExtension("EXT_texture_filter_anisotropic")||s.getExtension("MOZ_EXT_texture_filter_anisotropic")||s.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":a=s.getExtension("WEBGL_compressed_texture_s3tc")||s.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||s.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":a=s.getExtension("WEBGL_compressed_texture_pvrtc")||s.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:a=s.getExtension(r)}return e[r]=a,a}return{has:function(r){return t(r)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(r){const a=t(r);return a===null&&$o("THREE.WebGLRenderer: "+r+" extension not supported."),a}}}function qS(s,e,t,r){const a={},l=new WeakMap;function c(x){const y=x.target;y.index!==null&&e.remove(y.index);for(const E in y.attributes)e.remove(y.attributes[E]);for(const E in y.morphAttributes){const T=y.morphAttributes[E];for(let v=0,m=T.length;v<m;v++)e.remove(T[v])}y.removeEventListener("dispose",c),delete a[y.id];const S=l.get(y);S&&(e.remove(S),l.delete(y)),r.releaseStatesOfGeometry(y),y.isInstancedBufferGeometry===!0&&delete y._maxInstanceCount,t.memory.geometries--}function d(x,y){return a[y.id]===!0||(y.addEventListener("dispose",c),a[y.id]=!0,t.memory.geometries++),y}function h(x){const y=x.attributes;for(const E in y)e.update(y[E],s.ARRAY_BUFFER);const S=x.morphAttributes;for(const E in S){const T=S[E];for(let v=0,m=T.length;v<m;v++)e.update(T[v],s.ARRAY_BUFFER)}}function g(x){const y=[],S=x.index,E=x.attributes.position;let T=0;if(S!==null){const P=S.array;T=S.version;for(let L=0,R=P.length;L<R;L+=3){const j=P[L+0],I=P[L+1],F=P[L+2];y.push(j,I,I,F,F,j)}}else if(E!==void 0){const P=E.array;T=E.version;for(let L=0,R=P.length/3-1;L<R;L+=3){const j=L+0,I=L+1,F=L+2;y.push(j,I,I,F,F,j)}}else return;const v=new(bg(y)?Fg:Ng)(y,1);v.version=T;const m=l.get(x);m&&e.remove(m),l.set(x,v)}function _(x){const y=l.get(x);if(y){const S=x.index;S!==null&&y.version<S.version&&g(x)}else g(x);return l.get(x)}return{get:d,update:h,getWireframeAttribute:_}}function $S(s,e,t){let r;function a(y){r=y}let l,c;function d(y){l=y.type,c=y.bytesPerElement}function h(y,S){s.drawElements(r,S,l,y*c),t.update(S,r,1)}function g(y,S,E){E!==0&&(s.drawElementsInstanced(r,S,l,y*c,E),t.update(S,r,E))}function _(y,S,E){if(E===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(r,S,0,l,y,0,E);let v=0;for(let m=0;m<E;m++)v+=S[m];t.update(v,r,1)}function x(y,S,E,T){if(E===0)return;const v=e.get("WEBGL_multi_draw");if(v===null)for(let m=0;m<y.length;m++)g(y[m]/c,S[m],T[m]);else{v.multiDrawElementsInstancedWEBGL(r,S,0,l,y,0,T,0,E);let m=0;for(let P=0;P<E;P++)m+=S[P]*T[P];t.update(m,r,1)}}this.setMode=a,this.setIndex=d,this.render=h,this.renderInstances=g,this.renderMultiDraw=_,this.renderMultiDrawInstances=x}function KS(s){const e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function r(l,c,d){switch(t.calls++,c){case s.TRIANGLES:t.triangles+=d*(l/3);break;case s.LINES:t.lines+=d*(l/2);break;case s.LINE_STRIP:t.lines+=d*(l-1);break;case s.LINE_LOOP:t.lines+=d*l;break;case s.POINTS:t.points+=d*l;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",c);break}}function a(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:a,update:r}}function ZS(s,e,t){const r=new WeakMap,a=new Vt;function l(c,d,h){const g=c.morphTargetInfluences,_=d.morphAttributes.position||d.morphAttributes.normal||d.morphAttributes.color,x=_!==void 0?_.length:0;let y=r.get(d);if(y===void 0||y.count!==x){let A=function(){H.dispose(),r.delete(d),d.removeEventListener("dispose",A)};var S=A;y!==void 0&&y.texture.dispose();const E=d.morphAttributes.position!==void 0,T=d.morphAttributes.normal!==void 0,v=d.morphAttributes.color!==void 0,m=d.morphAttributes.position||[],P=d.morphAttributes.normal||[],L=d.morphAttributes.color||[];let R=0;E===!0&&(R=1),T===!0&&(R=2),v===!0&&(R=3);let j=d.attributes.position.count*R,I=1;j>e.maxTextureSize&&(I=Math.ceil(j/e.maxTextureSize),j=e.maxTextureSize);const F=new Float32Array(j*I*4*x),H=new Dg(F,j,I,x);H.type=Wi,H.needsUpdate=!0;const b=R*4;for(let z=0;z<x;z++){const se=m[z],te=P[z],fe=L[z],he=j*I*4*z;for(let oe=0;oe<se.count;oe++){const le=oe*b;E===!0&&(a.fromBufferAttribute(se,oe),F[he+le+0]=a.x,F[he+le+1]=a.y,F[he+le+2]=a.z,F[he+le+3]=0),T===!0&&(a.fromBufferAttribute(te,oe),F[he+le+4]=a.x,F[he+le+5]=a.y,F[he+le+6]=a.z,F[he+le+7]=0),v===!0&&(a.fromBufferAttribute(fe,oe),F[he+le+8]=a.x,F[he+le+9]=a.y,F[he+le+10]=a.z,F[he+le+11]=fe.itemSize===4?a.w:1)}}y={count:x,texture:H,size:new je(j,I)},r.set(d,y),d.addEventListener("dispose",A)}if(c.isInstancedMesh===!0&&c.morphTexture!==null)h.getUniforms().setValue(s,"morphTexture",c.morphTexture,t);else{let E=0;for(let v=0;v<g.length;v++)E+=g[v];const T=d.morphTargetsRelative?1:1-E;h.getUniforms().setValue(s,"morphTargetBaseInfluence",T),h.getUniforms().setValue(s,"morphTargetInfluences",g)}h.getUniforms().setValue(s,"morphTargetsTexture",y.texture,t),h.getUniforms().setValue(s,"morphTargetsTextureSize",y.size)}return{update:l}}function QS(s,e,t,r){let a=new WeakMap;function l(h){const g=r.render.frame,_=h.geometry,x=e.get(h,_);if(a.get(x)!==g&&(e.update(x),a.set(x,g)),h.isInstancedMesh&&(h.hasEventListener("dispose",d)===!1&&h.addEventListener("dispose",d),a.get(h)!==g&&(t.update(h.instanceMatrix,s.ARRAY_BUFFER),h.instanceColor!==null&&t.update(h.instanceColor,s.ARRAY_BUFFER),a.set(h,g))),h.isSkinnedMesh){const y=h.skeleton;a.get(y)!==g&&(y.update(),a.set(y,g))}return x}function c(){a=new WeakMap}function d(h){const g=h.target;g.removeEventListener("dispose",d),t.remove(g.instanceMatrix),g.instanceColor!==null&&t.remove(g.instanceColor)}return{update:l,dispose:c}}class Vg extends gn{constructor(e,t,r,a,l,c,d,h,g,_=Qs){if(_!==Qs&&_!==ro)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");r===void 0&&_===Qs&&(r=es),r===void 0&&_===ro&&(r=io),super(null,a,l,c,d,h,_,r,g),this.isDepthTexture=!0,this.image={width:e,height:t},this.magFilter=d!==void 0?d:pi,this.minFilter=h!==void 0?h:pi,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.compareFunction=e.compareFunction,this}toJSON(e){const t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}}const Gg=new gn,Dm=new Vg(1,1),Wg=new Dg,Xg=new z0,Yg=new kg,Um=[],Im=[],Nm=new Float32Array(16),Fm=new Float32Array(9),Om=new Float32Array(4);function lo(s,e,t){const r=s[0];if(r<=0||r>0)return s;const a=e*t;let l=Um[a];if(l===void 0&&(l=new Float32Array(a),Um[a]=l),e!==0){r.toArray(l,0);for(let c=1,d=0;c!==e;++c)d+=t,s[c].toArray(l,d)}return l}function Qt(s,e){if(s.length!==e.length)return!1;for(let t=0,r=s.length;t<r;t++)if(s[t]!==e[t])return!1;return!0}function Jt(s,e){for(let t=0,r=e.length;t<r;t++)s[t]=e[t]}function tu(s,e){let t=Im[e];t===void 0&&(t=new Int32Array(e),Im[e]=t);for(let r=0;r!==e;++r)t[r]=s.allocateTextureUnit();return t}function JS(s,e){const t=this.cache;t[0]!==e&&(s.uniform1f(this.addr,e),t[0]=e)}function eM(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(s.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Qt(t,e))return;s.uniform2fv(this.addr,e),Jt(t,e)}}function tM(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(s.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(s.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(Qt(t,e))return;s.uniform3fv(this.addr,e),Jt(t,e)}}function nM(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(s.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Qt(t,e))return;s.uniform4fv(this.addr,e),Jt(t,e)}}function iM(s,e){const t=this.cache,r=e.elements;if(r===void 0){if(Qt(t,e))return;s.uniformMatrix2fv(this.addr,!1,e),Jt(t,e)}else{if(Qt(t,r))return;Om.set(r),s.uniformMatrix2fv(this.addr,!1,Om),Jt(t,r)}}function rM(s,e){const t=this.cache,r=e.elements;if(r===void 0){if(Qt(t,e))return;s.uniformMatrix3fv(this.addr,!1,e),Jt(t,e)}else{if(Qt(t,r))return;Fm.set(r),s.uniformMatrix3fv(this.addr,!1,Fm),Jt(t,r)}}function sM(s,e){const t=this.cache,r=e.elements;if(r===void 0){if(Qt(t,e))return;s.uniformMatrix4fv(this.addr,!1,e),Jt(t,e)}else{if(Qt(t,r))return;Nm.set(r),s.uniformMatrix4fv(this.addr,!1,Nm),Jt(t,r)}}function oM(s,e){const t=this.cache;t[0]!==e&&(s.uniform1i(this.addr,e),t[0]=e)}function aM(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(s.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Qt(t,e))return;s.uniform2iv(this.addr,e),Jt(t,e)}}function lM(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(s.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Qt(t,e))return;s.uniform3iv(this.addr,e),Jt(t,e)}}function uM(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(s.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Qt(t,e))return;s.uniform4iv(this.addr,e),Jt(t,e)}}function cM(s,e){const t=this.cache;t[0]!==e&&(s.uniform1ui(this.addr,e),t[0]=e)}function fM(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(s.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Qt(t,e))return;s.uniform2uiv(this.addr,e),Jt(t,e)}}function dM(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(s.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Qt(t,e))return;s.uniform3uiv(this.addr,e),Jt(t,e)}}function hM(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(s.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Qt(t,e))return;s.uniform4uiv(this.addr,e),Jt(t,e)}}function pM(s,e,t){const r=this.cache,a=t.allocateTextureUnit();r[0]!==a&&(s.uniform1i(this.addr,a),r[0]=a);let l;this.type===s.SAMPLER_2D_SHADOW?(Dm.compareFunction=Pg,l=Dm):l=Gg,t.setTexture2D(e||l,a)}function mM(s,e,t){const r=this.cache,a=t.allocateTextureUnit();r[0]!==a&&(s.uniform1i(this.addr,a),r[0]=a),t.setTexture3D(e||Xg,a)}function gM(s,e,t){const r=this.cache,a=t.allocateTextureUnit();r[0]!==a&&(s.uniform1i(this.addr,a),r[0]=a),t.setTextureCube(e||Yg,a)}function _M(s,e,t){const r=this.cache,a=t.allocateTextureUnit();r[0]!==a&&(s.uniform1i(this.addr,a),r[0]=a),t.setTexture2DArray(e||Wg,a)}function vM(s){switch(s){case 5126:return JS;case 35664:return eM;case 35665:return tM;case 35666:return nM;case 35674:return iM;case 35675:return rM;case 35676:return sM;case 5124:case 35670:return oM;case 35667:case 35671:return aM;case 35668:case 35672:return lM;case 35669:case 35673:return uM;case 5125:return cM;case 36294:return fM;case 36295:return dM;case 36296:return hM;case 35678:case 36198:case 36298:case 36306:case 35682:return pM;case 35679:case 36299:case 36307:return mM;case 35680:case 36300:case 36308:case 36293:return gM;case 36289:case 36303:case 36311:case 36292:return _M}}function xM(s,e){s.uniform1fv(this.addr,e)}function yM(s,e){const t=lo(e,this.size,2);s.uniform2fv(this.addr,t)}function SM(s,e){const t=lo(e,this.size,3);s.uniform3fv(this.addr,t)}function MM(s,e){const t=lo(e,this.size,4);s.uniform4fv(this.addr,t)}function EM(s,e){const t=lo(e,this.size,4);s.uniformMatrix2fv(this.addr,!1,t)}function TM(s,e){const t=lo(e,this.size,9);s.uniformMatrix3fv(this.addr,!1,t)}function wM(s,e){const t=lo(e,this.size,16);s.uniformMatrix4fv(this.addr,!1,t)}function AM(s,e){s.uniform1iv(this.addr,e)}function CM(s,e){s.uniform2iv(this.addr,e)}function RM(s,e){s.uniform3iv(this.addr,e)}function PM(s,e){s.uniform4iv(this.addr,e)}function bM(s,e){s.uniform1uiv(this.addr,e)}function LM(s,e){s.uniform2uiv(this.addr,e)}function DM(s,e){s.uniform3uiv(this.addr,e)}function UM(s,e){s.uniform4uiv(this.addr,e)}function IM(s,e,t){const r=this.cache,a=e.length,l=tu(t,a);Qt(r,l)||(s.uniform1iv(this.addr,l),Jt(r,l));for(let c=0;c!==a;++c)t.setTexture2D(e[c]||Gg,l[c])}function NM(s,e,t){const r=this.cache,a=e.length,l=tu(t,a);Qt(r,l)||(s.uniform1iv(this.addr,l),Jt(r,l));for(let c=0;c!==a;++c)t.setTexture3D(e[c]||Xg,l[c])}function FM(s,e,t){const r=this.cache,a=e.length,l=tu(t,a);Qt(r,l)||(s.uniform1iv(this.addr,l),Jt(r,l));for(let c=0;c!==a;++c)t.setTextureCube(e[c]||Yg,l[c])}function OM(s,e,t){const r=this.cache,a=e.length,l=tu(t,a);Qt(r,l)||(s.uniform1iv(this.addr,l),Jt(r,l));for(let c=0;c!==a;++c)t.setTexture2DArray(e[c]||Wg,l[c])}function zM(s){switch(s){case 5126:return xM;case 35664:return yM;case 35665:return SM;case 35666:return MM;case 35674:return EM;case 35675:return TM;case 35676:return wM;case 5124:case 35670:return AM;case 35667:case 35671:return CM;case 35668:case 35672:return RM;case 35669:case 35673:return PM;case 5125:return bM;case 36294:return LM;case 36295:return DM;case 36296:return UM;case 35678:case 36198:case 36298:case 36306:case 35682:return IM;case 35679:case 36299:case 36307:return NM;case 35680:case 36300:case 36308:case 36293:return FM;case 36289:case 36303:case 36311:case 36292:return OM}}class kM{constructor(e,t,r){this.id=e,this.addr=r,this.cache=[],this.type=t.type,this.setValue=vM(t.type)}}class BM{constructor(e,t,r){this.id=e,this.addr=r,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=zM(t.type)}}class HM{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,r){const a=this.seq;for(let l=0,c=a.length;l!==c;++l){const d=a[l];d.setValue(e,t[d.id],r)}}}const df=/(\w+)(\])?(\[|\.)?/g;function zm(s,e){s.seq.push(e),s.map[e.id]=e}function VM(s,e,t){const r=s.name,a=r.length;for(df.lastIndex=0;;){const l=df.exec(r),c=df.lastIndex;let d=l[1];const h=l[2]==="]",g=l[3];if(h&&(d=d|0),g===void 0||g==="["&&c+2===a){zm(t,g===void 0?new kM(d,s,e):new BM(d,s,e));break}else{let x=t.map[d];x===void 0&&(x=new HM(d),zm(t,x)),t=x}}}class Xl{constructor(e,t){this.seq=[],this.map={};const r=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let a=0;a<r;++a){const l=e.getActiveUniform(t,a),c=e.getUniformLocation(t,l.name);VM(l,c,this)}}setValue(e,t,r,a){const l=this.map[t];l!==void 0&&l.setValue(e,r,a)}setOptional(e,t,r){const a=t[r];a!==void 0&&this.setValue(e,r,a)}static upload(e,t,r,a){for(let l=0,c=t.length;l!==c;++l){const d=t[l],h=r[d.id];h.needsUpdate!==!1&&d.setValue(e,h.value,a)}}static seqWithValue(e,t){const r=[];for(let a=0,l=e.length;a!==l;++a){const c=e[a];c.id in t&&r.push(c)}return r}}function km(s,e,t){const r=s.createShader(e);return s.shaderSource(r,t),s.compileShader(r),r}const GM=37297;let WM=0;function XM(s,e){const t=s.split(`
`),r=[],a=Math.max(e-6,0),l=Math.min(e+6,t.length);for(let c=a;c<l;c++){const d=c+1;r.push(`${d===e?">":" "} ${d}: ${t[c]}`)}return r.join(`
`)}const Bm=new at;function YM(s){yt._getMatrix(Bm,yt.workingColorSpace,s);const e=`mat3( ${Bm.elements.map(t=>t.toFixed(4))} )`;switch(yt.getTransfer(s)){case Ql:return[e,"LinearTransferOETF"];case Rt:return[e,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space: ",s),[e,"LinearTransferOETF"]}}function Hm(s,e,t){const r=s.getShaderParameter(e,s.COMPILE_STATUS),a=s.getShaderInfoLog(e).trim();if(r&&a==="")return"";const l=/ERROR: 0:(\d+)/.exec(a);if(l){const c=parseInt(l[1]);return t.toUpperCase()+`

`+a+`

`+XM(s.getShaderSource(e),c)}else return a}function jM(s,e){const t=YM(e);return[`vec4 ${s}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}function qM(s,e){let t;switch(e){case c0:t="Linear";break;case f0:t="Reinhard";break;case d0:t="Cineon";break;case h0:t="ACESFilmic";break;case m0:t="AgX";break;case g0:t="Neutral";break;case p0:t="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),t="Linear"}return"vec3 "+s+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}const bl=new G;function $M(){yt.getLuminanceCoefficients(bl);const s=bl.x.toFixed(4),e=bl.y.toFixed(4),t=bl.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${s}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function KM(s){return[s.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",s.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Ko).join(`
`)}function ZM(s){const e=[];for(const t in s){const r=s[t];r!==!1&&e.push("#define "+t+" "+r)}return e.join(`
`)}function QM(s,e){const t={},r=s.getProgramParameter(e,s.ACTIVE_ATTRIBUTES);for(let a=0;a<r;a++){const l=s.getActiveAttrib(e,a),c=l.name;let d=1;l.type===s.FLOAT_MAT2&&(d=2),l.type===s.FLOAT_MAT3&&(d=3),l.type===s.FLOAT_MAT4&&(d=4),t[c]={type:l.type,location:s.getAttribLocation(e,c),locationSize:d}}return t}function Ko(s){return s!==""}function Vm(s,e){const t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return s.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function Gm(s,e){return s.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}const JM=/^[ \t]*#include +<([\w\d./]+)>/gm;function od(s){return s.replace(JM,tE)}const eE=new Map;function tE(s,e){let t=lt[e];if(t===void 0){const r=eE.get(e);if(r!==void 0)t=lt[r],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,r);else throw new Error("Can not resolve #include <"+e+">")}return od(t)}const nE=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Wm(s){return s.replace(nE,iE)}function iE(s,e,t,r){let a="";for(let l=parseInt(e);l<parseInt(t);l++)a+=r.replace(/\[\s*i\s*\]/g,"[ "+l+" ]").replace(/UNROLLED_LOOP_INDEX/g,l);return a}function Xm(s){let e=`precision ${s.precision} float;
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
#define LOW_PRECISION`),e}function rE(s){let e="SHADOWMAP_TYPE_BASIC";return s.shadowMapType===gg?e="SHADOWMAP_TYPE_PCF":s.shadowMapType===Gv?e="SHADOWMAP_TYPE_PCF_SOFT":s.shadowMapType===Gi&&(e="SHADOWMAP_TYPE_VSM"),e}function sE(s){let e="ENVMAP_TYPE_CUBE";if(s.envMap)switch(s.envMapMode){case to:case no:e="ENVMAP_TYPE_CUBE";break;case Zl:e="ENVMAP_TYPE_CUBE_UV";break}return e}function oE(s){let e="ENVMAP_MODE_REFLECTION";if(s.envMap)switch(s.envMapMode){case no:e="ENVMAP_MODE_REFRACTION";break}return e}function aE(s){let e="ENVMAP_BLENDING_NONE";if(s.envMap)switch(s.combine){case ud:e="ENVMAP_BLENDING_MULTIPLY";break;case l0:e="ENVMAP_BLENDING_MIX";break;case u0:e="ENVMAP_BLENDING_ADD";break}return e}function lE(s){const e=s.envMapCubeUVHeight;if(e===null)return null;const t=Math.log2(e)-2,r=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),7*16)),texelHeight:r,maxMip:t}}function uE(s,e,t,r){const a=s.getContext(),l=t.defines;let c=t.vertexShader,d=t.fragmentShader;const h=rE(t),g=sE(t),_=oE(t),x=aE(t),y=lE(t),S=KM(t),E=ZM(l),T=a.createProgram();let v,m,P=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(v=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,E].filter(Ko).join(`
`),v.length>0&&(v+=`
`),m=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,E].filter(Ko).join(`
`),m.length>0&&(m+=`
`)):(v=[Xm(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,E,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+_:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+h:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Ko).join(`
`),m=[Xm(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,E,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+g:"",t.envMap?"#define "+_:"",t.envMap?"#define "+x:"",y?"#define CUBEUV_TEXEL_WIDTH "+y.texelWidth:"",y?"#define CUBEUV_TEXEL_HEIGHT "+y.texelHeight:"",y?"#define CUBEUV_MAX_MIP "+y.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor||t.batchingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+h:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==Tr?"#define TONE_MAPPING":"",t.toneMapping!==Tr?lt.tonemapping_pars_fragment:"",t.toneMapping!==Tr?qM("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",lt.colorspace_pars_fragment,jM("linearToOutputTexel",t.outputColorSpace),$M(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(Ko).join(`
`)),c=od(c),c=Vm(c,t),c=Gm(c,t),d=od(d),d=Vm(d,t),d=Gm(d,t),c=Wm(c),d=Wm(d),t.isRawShaderMaterial!==!0&&(P=`#version 300 es
`,v=[S,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+v,m=["#define varying in",t.glslVersion===rm?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===rm?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+m);const L=P+v+c,R=P+m+d,j=km(a,a.VERTEX_SHADER,L),I=km(a,a.FRAGMENT_SHADER,R);a.attachShader(T,j),a.attachShader(T,I),t.index0AttributeName!==void 0?a.bindAttribLocation(T,0,t.index0AttributeName):t.morphTargets===!0&&a.bindAttribLocation(T,0,"position"),a.linkProgram(T);function F(z){if(s.debug.checkShaderErrors){const se=a.getProgramInfoLog(T).trim(),te=a.getShaderInfoLog(j).trim(),fe=a.getShaderInfoLog(I).trim();let he=!0,oe=!0;if(a.getProgramParameter(T,a.LINK_STATUS)===!1)if(he=!1,typeof s.debug.onShaderError=="function")s.debug.onShaderError(a,T,j,I);else{const le=Hm(a,j,"vertex"),k=Hm(a,I,"fragment");console.error("THREE.WebGLProgram: Shader Error "+a.getError()+" - VALIDATE_STATUS "+a.getProgramParameter(T,a.VALIDATE_STATUS)+`

Material Name: `+z.name+`
Material Type: `+z.type+`

Program Info Log: `+se+`
`+le+`
`+k)}else se!==""?console.warn("THREE.WebGLProgram: Program Info Log:",se):(te===""||fe==="")&&(oe=!1);oe&&(z.diagnostics={runnable:he,programLog:se,vertexShader:{log:te,prefix:v},fragmentShader:{log:fe,prefix:m}})}a.deleteShader(j),a.deleteShader(I),H=new Xl(a,T),b=QM(a,T)}let H;this.getUniforms=function(){return H===void 0&&F(this),H};let b;this.getAttributes=function(){return b===void 0&&F(this),b};let A=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return A===!1&&(A=a.getProgramParameter(T,GM)),A},this.destroy=function(){r.releaseStatesOfProgram(this),a.deleteProgram(T),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=WM++,this.cacheKey=e,this.usedTimes=1,this.program=T,this.vertexShader=j,this.fragmentShader=I,this}let cE=0;class fE{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){const t=e.vertexShader,r=e.fragmentShader,a=this._getShaderStage(t),l=this._getShaderStage(r),c=this._getShaderCacheForMaterial(e);return c.has(a)===!1&&(c.add(a),a.usedTimes++),c.has(l)===!1&&(c.add(l),l.usedTimes++),this}remove(e){const t=this.materialCache.get(e);for(const r of t)r.usedTimes--,r.usedTimes===0&&this.shaderCache.delete(r.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const t=this.materialCache;let r=t.get(e);return r===void 0&&(r=new Set,t.set(e,r)),r}_getShaderStage(e){const t=this.shaderCache;let r=t.get(e);return r===void 0&&(r=new dE(e),t.set(e,r)),r}}class dE{constructor(e){this.id=cE++,this.code=e,this.usedTimes=0}}function hE(s,e,t,r,a,l,c){const d=new Ug,h=new fE,g=new Set,_=[],x=a.logarithmicDepthBuffer,y=a.vertexTextures;let S=a.precision;const E={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function T(b){return g.add(b),b===0?"uv":`uv${b}`}function v(b,A,z,se,te){const fe=se.fog,he=te.geometry,oe=b.isMeshStandardMaterial?se.environment:null,le=(b.isMeshStandardMaterial?t:e).get(b.envMap||oe),k=le&&le.mapping===Zl?le.image.height:null,ae=E[b.type];b.precision!==null&&(S=a.getMaxPrecision(b.precision),S!==b.precision&&console.warn("THREE.WebGLProgram.getParameters:",b.precision,"not supported, using",S,"instead."));const re=he.morphAttributes.position||he.morphAttributes.normal||he.morphAttributes.color,N=re!==void 0?re.length:0;let ne=0;he.morphAttributes.position!==void 0&&(ne=1),he.morphAttributes.normal!==void 0&&(ne=2),he.morphAttributes.color!==void 0&&(ne=3);let De,Z,ue,Me;if(ae){const vt=Mi[ae];De=vt.vertexShader,Z=vt.fragmentShader}else De=b.vertexShader,Z=b.fragmentShader,h.update(b),ue=h.getVertexShaderID(b),Me=h.getFragmentShaderID(b);const ve=s.getRenderTarget(),we=s.state.buffers.depth.getReversed(),Ue=te.isInstancedMesh===!0,Ze=te.isBatchedMesh===!0,Ct=!!b.map,mt=!!b.matcap,Ut=!!le,Y=!!b.aoMap,_n=!!b.lightMap,ht=!!b.bumpMap,ct=!!b.normalMap,qe=!!b.displacementMap,wt=!!b.emissiveMap,Ye=!!b.metalnessMap,D=!!b.roughnessMap,w=b.anisotropy>0,K=b.clearcoat>0,pe=b.dispersion>0,ge=b.iridescence>0,ce=b.sheen>0,He=b.transmission>0,Ae=w&&!!b.anisotropyMap,Ie=K&&!!b.clearcoatMap,ut=K&&!!b.clearcoatNormalMap,ye=K&&!!b.clearcoatRoughnessMap,Fe=ge&&!!b.iridescenceMap,Qe=ge&&!!b.iridescenceThicknessMap,Je=ce&&!!b.sheenColorMap,Oe=ce&&!!b.sheenRoughnessMap,ft=!!b.specularMap,rt=!!b.specularColorMap,Tt=!!b.specularIntensityMap,V=He&&!!b.transmissionMap,Ce=He&&!!b.thicknessMap,ie=!!b.gradientMap,de=!!b.alphaMap,be=b.alphaTest>0,Pe=!!b.alphaHash,st=!!b.extensions;let Nt=Tr;b.toneMapped&&(ve===null||ve.isXRRenderTarget===!0)&&(Nt=s.toneMapping);const jt={shaderID:ae,shaderType:b.type,shaderName:b.name,vertexShader:De,fragmentShader:Z,defines:b.defines,customVertexShaderID:ue,customFragmentShaderID:Me,isRawShaderMaterial:b.isRawShaderMaterial===!0,glslVersion:b.glslVersion,precision:S,batching:Ze,batchingColor:Ze&&te._colorsTexture!==null,instancing:Ue,instancingColor:Ue&&te.instanceColor!==null,instancingMorph:Ue&&te.morphTexture!==null,supportsVertexTextures:y,outputColorSpace:ve===null?s.outputColorSpace:ve.isXRRenderTarget===!0?ve.texture.colorSpace:ao,alphaToCoverage:!!b.alphaToCoverage,map:Ct,matcap:mt,envMap:Ut,envMapMode:Ut&&le.mapping,envMapCubeUVHeight:k,aoMap:Y,lightMap:_n,bumpMap:ht,normalMap:ct,displacementMap:y&&qe,emissiveMap:wt,normalMapObjectSpace:ct&&b.normalMapType===y0,normalMapTangentSpace:ct&&b.normalMapType===Rg,metalnessMap:Ye,roughnessMap:D,anisotropy:w,anisotropyMap:Ae,clearcoat:K,clearcoatMap:Ie,clearcoatNormalMap:ut,clearcoatRoughnessMap:ye,dispersion:pe,iridescence:ge,iridescenceMap:Fe,iridescenceThicknessMap:Qe,sheen:ce,sheenColorMap:Je,sheenRoughnessMap:Oe,specularMap:ft,specularColorMap:rt,specularIntensityMap:Tt,transmission:He,transmissionMap:V,thicknessMap:Ce,gradientMap:ie,opaque:b.transparent===!1&&b.blending===Zs&&b.alphaToCoverage===!1,alphaMap:de,alphaTest:be,alphaHash:Pe,combine:b.combine,mapUv:Ct&&T(b.map.channel),aoMapUv:Y&&T(b.aoMap.channel),lightMapUv:_n&&T(b.lightMap.channel),bumpMapUv:ht&&T(b.bumpMap.channel),normalMapUv:ct&&T(b.normalMap.channel),displacementMapUv:qe&&T(b.displacementMap.channel),emissiveMapUv:wt&&T(b.emissiveMap.channel),metalnessMapUv:Ye&&T(b.metalnessMap.channel),roughnessMapUv:D&&T(b.roughnessMap.channel),anisotropyMapUv:Ae&&T(b.anisotropyMap.channel),clearcoatMapUv:Ie&&T(b.clearcoatMap.channel),clearcoatNormalMapUv:ut&&T(b.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:ye&&T(b.clearcoatRoughnessMap.channel),iridescenceMapUv:Fe&&T(b.iridescenceMap.channel),iridescenceThicknessMapUv:Qe&&T(b.iridescenceThicknessMap.channel),sheenColorMapUv:Je&&T(b.sheenColorMap.channel),sheenRoughnessMapUv:Oe&&T(b.sheenRoughnessMap.channel),specularMapUv:ft&&T(b.specularMap.channel),specularColorMapUv:rt&&T(b.specularColorMap.channel),specularIntensityMapUv:Tt&&T(b.specularIntensityMap.channel),transmissionMapUv:V&&T(b.transmissionMap.channel),thicknessMapUv:Ce&&T(b.thicknessMap.channel),alphaMapUv:de&&T(b.alphaMap.channel),vertexTangents:!!he.attributes.tangent&&(ct||w),vertexColors:b.vertexColors,vertexAlphas:b.vertexColors===!0&&!!he.attributes.color&&he.attributes.color.itemSize===4,pointsUvs:te.isPoints===!0&&!!he.attributes.uv&&(Ct||de),fog:!!fe,useFog:b.fog===!0,fogExp2:!!fe&&fe.isFogExp2,flatShading:b.flatShading===!0,sizeAttenuation:b.sizeAttenuation===!0,logarithmicDepthBuffer:x,reverseDepthBuffer:we,skinning:te.isSkinnedMesh===!0,morphTargets:he.morphAttributes.position!==void 0,morphNormals:he.morphAttributes.normal!==void 0,morphColors:he.morphAttributes.color!==void 0,morphTargetsCount:N,morphTextureStride:ne,numDirLights:A.directional.length,numPointLights:A.point.length,numSpotLights:A.spot.length,numSpotLightMaps:A.spotLightMap.length,numRectAreaLights:A.rectArea.length,numHemiLights:A.hemi.length,numDirLightShadows:A.directionalShadowMap.length,numPointLightShadows:A.pointShadowMap.length,numSpotLightShadows:A.spotShadowMap.length,numSpotLightShadowsWithMaps:A.numSpotLightShadowsWithMaps,numLightProbes:A.numLightProbes,numClippingPlanes:c.numPlanes,numClipIntersection:c.numIntersection,dithering:b.dithering,shadowMapEnabled:s.shadowMap.enabled&&z.length>0,shadowMapType:s.shadowMap.type,toneMapping:Nt,decodeVideoTexture:Ct&&b.map.isVideoTexture===!0&&yt.getTransfer(b.map.colorSpace)===Rt,decodeVideoTextureEmissive:wt&&b.emissiveMap.isVideoTexture===!0&&yt.getTransfer(b.emissiveMap.colorSpace)===Rt,premultipliedAlpha:b.premultipliedAlpha,doubleSided:b.side===Ei,flipSided:b.side===An,useDepthPacking:b.depthPacking>=0,depthPacking:b.depthPacking||0,index0AttributeName:b.index0AttributeName,extensionClipCullDistance:st&&b.extensions.clipCullDistance===!0&&r.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(st&&b.extensions.multiDraw===!0||Ze)&&r.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:r.has("KHR_parallel_shader_compile"),customProgramCacheKey:b.customProgramCacheKey()};return jt.vertexUv1s=g.has(1),jt.vertexUv2s=g.has(2),jt.vertexUv3s=g.has(3),g.clear(),jt}function m(b){const A=[];if(b.shaderID?A.push(b.shaderID):(A.push(b.customVertexShaderID),A.push(b.customFragmentShaderID)),b.defines!==void 0)for(const z in b.defines)A.push(z),A.push(b.defines[z]);return b.isRawShaderMaterial===!1&&(P(A,b),L(A,b),A.push(s.outputColorSpace)),A.push(b.customProgramCacheKey),A.join()}function P(b,A){b.push(A.precision),b.push(A.outputColorSpace),b.push(A.envMapMode),b.push(A.envMapCubeUVHeight),b.push(A.mapUv),b.push(A.alphaMapUv),b.push(A.lightMapUv),b.push(A.aoMapUv),b.push(A.bumpMapUv),b.push(A.normalMapUv),b.push(A.displacementMapUv),b.push(A.emissiveMapUv),b.push(A.metalnessMapUv),b.push(A.roughnessMapUv),b.push(A.anisotropyMapUv),b.push(A.clearcoatMapUv),b.push(A.clearcoatNormalMapUv),b.push(A.clearcoatRoughnessMapUv),b.push(A.iridescenceMapUv),b.push(A.iridescenceThicknessMapUv),b.push(A.sheenColorMapUv),b.push(A.sheenRoughnessMapUv),b.push(A.specularMapUv),b.push(A.specularColorMapUv),b.push(A.specularIntensityMapUv),b.push(A.transmissionMapUv),b.push(A.thicknessMapUv),b.push(A.combine),b.push(A.fogExp2),b.push(A.sizeAttenuation),b.push(A.morphTargetsCount),b.push(A.morphAttributeCount),b.push(A.numDirLights),b.push(A.numPointLights),b.push(A.numSpotLights),b.push(A.numSpotLightMaps),b.push(A.numHemiLights),b.push(A.numRectAreaLights),b.push(A.numDirLightShadows),b.push(A.numPointLightShadows),b.push(A.numSpotLightShadows),b.push(A.numSpotLightShadowsWithMaps),b.push(A.numLightProbes),b.push(A.shadowMapType),b.push(A.toneMapping),b.push(A.numClippingPlanes),b.push(A.numClipIntersection),b.push(A.depthPacking)}function L(b,A){d.disableAll(),A.supportsVertexTextures&&d.enable(0),A.instancing&&d.enable(1),A.instancingColor&&d.enable(2),A.instancingMorph&&d.enable(3),A.matcap&&d.enable(4),A.envMap&&d.enable(5),A.normalMapObjectSpace&&d.enable(6),A.normalMapTangentSpace&&d.enable(7),A.clearcoat&&d.enable(8),A.iridescence&&d.enable(9),A.alphaTest&&d.enable(10),A.vertexColors&&d.enable(11),A.vertexAlphas&&d.enable(12),A.vertexUv1s&&d.enable(13),A.vertexUv2s&&d.enable(14),A.vertexUv3s&&d.enable(15),A.vertexTangents&&d.enable(16),A.anisotropy&&d.enable(17),A.alphaHash&&d.enable(18),A.batching&&d.enable(19),A.dispersion&&d.enable(20),A.batchingColor&&d.enable(21),b.push(d.mask),d.disableAll(),A.fog&&d.enable(0),A.useFog&&d.enable(1),A.flatShading&&d.enable(2),A.logarithmicDepthBuffer&&d.enable(3),A.reverseDepthBuffer&&d.enable(4),A.skinning&&d.enable(5),A.morphTargets&&d.enable(6),A.morphNormals&&d.enable(7),A.morphColors&&d.enable(8),A.premultipliedAlpha&&d.enable(9),A.shadowMapEnabled&&d.enable(10),A.doubleSided&&d.enable(11),A.flipSided&&d.enable(12),A.useDepthPacking&&d.enable(13),A.dithering&&d.enable(14),A.transmission&&d.enable(15),A.sheen&&d.enable(16),A.opaque&&d.enable(17),A.pointsUvs&&d.enable(18),A.decodeVideoTexture&&d.enable(19),A.decodeVideoTextureEmissive&&d.enable(20),A.alphaToCoverage&&d.enable(21),b.push(d.mask)}function R(b){const A=E[b.type];let z;if(A){const se=Mi[A];z=K0.clone(se.uniforms)}else z=b.uniforms;return z}function j(b,A){let z;for(let se=0,te=_.length;se<te;se++){const fe=_[se];if(fe.cacheKey===A){z=fe,++z.usedTimes;break}}return z===void 0&&(z=new uE(s,A,b,l),_.push(z)),z}function I(b){if(--b.usedTimes===0){const A=_.indexOf(b);_[A]=_[_.length-1],_.pop(),b.destroy()}}function F(b){h.remove(b)}function H(){h.dispose()}return{getParameters:v,getProgramCacheKey:m,getUniforms:R,acquireProgram:j,releaseProgram:I,releaseShaderCache:F,programs:_,dispose:H}}function pE(){let s=new WeakMap;function e(c){return s.has(c)}function t(c){let d=s.get(c);return d===void 0&&(d={},s.set(c,d)),d}function r(c){s.delete(c)}function a(c,d,h){s.get(c)[d]=h}function l(){s=new WeakMap}return{has:e,get:t,remove:r,update:a,dispose:l}}function mE(s,e){return s.groupOrder!==e.groupOrder?s.groupOrder-e.groupOrder:s.renderOrder!==e.renderOrder?s.renderOrder-e.renderOrder:s.material.id!==e.material.id?s.material.id-e.material.id:s.z!==e.z?s.z-e.z:s.id-e.id}function Ym(s,e){return s.groupOrder!==e.groupOrder?s.groupOrder-e.groupOrder:s.renderOrder!==e.renderOrder?s.renderOrder-e.renderOrder:s.z!==e.z?e.z-s.z:s.id-e.id}function jm(){const s=[];let e=0;const t=[],r=[],a=[];function l(){e=0,t.length=0,r.length=0,a.length=0}function c(x,y,S,E,T,v){let m=s[e];return m===void 0?(m={id:x.id,object:x,geometry:y,material:S,groupOrder:E,renderOrder:x.renderOrder,z:T,group:v},s[e]=m):(m.id=x.id,m.object=x,m.geometry=y,m.material=S,m.groupOrder=E,m.renderOrder=x.renderOrder,m.z=T,m.group=v),e++,m}function d(x,y,S,E,T,v){const m=c(x,y,S,E,T,v);S.transmission>0?r.push(m):S.transparent===!0?a.push(m):t.push(m)}function h(x,y,S,E,T,v){const m=c(x,y,S,E,T,v);S.transmission>0?r.unshift(m):S.transparent===!0?a.unshift(m):t.unshift(m)}function g(x,y){t.length>1&&t.sort(x||mE),r.length>1&&r.sort(y||Ym),a.length>1&&a.sort(y||Ym)}function _(){for(let x=e,y=s.length;x<y;x++){const S=s[x];if(S.id===null)break;S.id=null,S.object=null,S.geometry=null,S.material=null,S.group=null}}return{opaque:t,transmissive:r,transparent:a,init:l,push:d,unshift:h,finish:_,sort:g}}function gE(){let s=new WeakMap;function e(r,a){const l=s.get(r);let c;return l===void 0?(c=new jm,s.set(r,[c])):a>=l.length?(c=new jm,l.push(c)):c=l[a],c}function t(){s=new WeakMap}return{get:e,dispose:t}}function _E(){const s={};return{get:function(e){if(s[e.id]!==void 0)return s[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new G,color:new pt};break;case"SpotLight":t={position:new G,direction:new G,color:new pt,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new G,color:new pt,distance:0,decay:0};break;case"HemisphereLight":t={direction:new G,skyColor:new pt,groundColor:new pt};break;case"RectAreaLight":t={color:new pt,position:new G,halfWidth:new G,halfHeight:new G};break}return s[e.id]=t,t}}}function vE(){const s={};return{get:function(e){if(s[e.id]!==void 0)return s[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new je};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new je};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new je,shadowCameraNear:1,shadowCameraFar:1e3};break}return s[e.id]=t,t}}}let xE=0;function yE(s,e){return(e.castShadow?2:0)-(s.castShadow?2:0)+(e.map?1:0)-(s.map?1:0)}function SE(s){const e=new _E,t=vE(),r={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let g=0;g<9;g++)r.probe.push(new G);const a=new G,l=new Lt,c=new Lt;function d(g){let _=0,x=0,y=0;for(let b=0;b<9;b++)r.probe[b].set(0,0,0);let S=0,E=0,T=0,v=0,m=0,P=0,L=0,R=0,j=0,I=0,F=0;g.sort(yE);for(let b=0,A=g.length;b<A;b++){const z=g[b],se=z.color,te=z.intensity,fe=z.distance,he=z.shadow&&z.shadow.map?z.shadow.map.texture:null;if(z.isAmbientLight)_+=se.r*te,x+=se.g*te,y+=se.b*te;else if(z.isLightProbe){for(let oe=0;oe<9;oe++)r.probe[oe].addScaledVector(z.sh.coefficients[oe],te);F++}else if(z.isDirectionalLight){const oe=e.get(z);if(oe.color.copy(z.color).multiplyScalar(z.intensity),z.castShadow){const le=z.shadow,k=t.get(z);k.shadowIntensity=le.intensity,k.shadowBias=le.bias,k.shadowNormalBias=le.normalBias,k.shadowRadius=le.radius,k.shadowMapSize=le.mapSize,r.directionalShadow[S]=k,r.directionalShadowMap[S]=he,r.directionalShadowMatrix[S]=z.shadow.matrix,P++}r.directional[S]=oe,S++}else if(z.isSpotLight){const oe=e.get(z);oe.position.setFromMatrixPosition(z.matrixWorld),oe.color.copy(se).multiplyScalar(te),oe.distance=fe,oe.coneCos=Math.cos(z.angle),oe.penumbraCos=Math.cos(z.angle*(1-z.penumbra)),oe.decay=z.decay,r.spot[T]=oe;const le=z.shadow;if(z.map&&(r.spotLightMap[j]=z.map,j++,le.updateMatrices(z),z.castShadow&&I++),r.spotLightMatrix[T]=le.matrix,z.castShadow){const k=t.get(z);k.shadowIntensity=le.intensity,k.shadowBias=le.bias,k.shadowNormalBias=le.normalBias,k.shadowRadius=le.radius,k.shadowMapSize=le.mapSize,r.spotShadow[T]=k,r.spotShadowMap[T]=he,R++}T++}else if(z.isRectAreaLight){const oe=e.get(z);oe.color.copy(se).multiplyScalar(te),oe.halfWidth.set(z.width*.5,0,0),oe.halfHeight.set(0,z.height*.5,0),r.rectArea[v]=oe,v++}else if(z.isPointLight){const oe=e.get(z);if(oe.color.copy(z.color).multiplyScalar(z.intensity),oe.distance=z.distance,oe.decay=z.decay,z.castShadow){const le=z.shadow,k=t.get(z);k.shadowIntensity=le.intensity,k.shadowBias=le.bias,k.shadowNormalBias=le.normalBias,k.shadowRadius=le.radius,k.shadowMapSize=le.mapSize,k.shadowCameraNear=le.camera.near,k.shadowCameraFar=le.camera.far,r.pointShadow[E]=k,r.pointShadowMap[E]=he,r.pointShadowMatrix[E]=z.shadow.matrix,L++}r.point[E]=oe,E++}else if(z.isHemisphereLight){const oe=e.get(z);oe.skyColor.copy(z.color).multiplyScalar(te),oe.groundColor.copy(z.groundColor).multiplyScalar(te),r.hemi[m]=oe,m++}}v>0&&(s.has("OES_texture_float_linear")===!0?(r.rectAreaLTC1=Re.LTC_FLOAT_1,r.rectAreaLTC2=Re.LTC_FLOAT_2):(r.rectAreaLTC1=Re.LTC_HALF_1,r.rectAreaLTC2=Re.LTC_HALF_2)),r.ambient[0]=_,r.ambient[1]=x,r.ambient[2]=y;const H=r.hash;(H.directionalLength!==S||H.pointLength!==E||H.spotLength!==T||H.rectAreaLength!==v||H.hemiLength!==m||H.numDirectionalShadows!==P||H.numPointShadows!==L||H.numSpotShadows!==R||H.numSpotMaps!==j||H.numLightProbes!==F)&&(r.directional.length=S,r.spot.length=T,r.rectArea.length=v,r.point.length=E,r.hemi.length=m,r.directionalShadow.length=P,r.directionalShadowMap.length=P,r.pointShadow.length=L,r.pointShadowMap.length=L,r.spotShadow.length=R,r.spotShadowMap.length=R,r.directionalShadowMatrix.length=P,r.pointShadowMatrix.length=L,r.spotLightMatrix.length=R+j-I,r.spotLightMap.length=j,r.numSpotLightShadowsWithMaps=I,r.numLightProbes=F,H.directionalLength=S,H.pointLength=E,H.spotLength=T,H.rectAreaLength=v,H.hemiLength=m,H.numDirectionalShadows=P,H.numPointShadows=L,H.numSpotShadows=R,H.numSpotMaps=j,H.numLightProbes=F,r.version=xE++)}function h(g,_){let x=0,y=0,S=0,E=0,T=0;const v=_.matrixWorldInverse;for(let m=0,P=g.length;m<P;m++){const L=g[m];if(L.isDirectionalLight){const R=r.directional[x];R.direction.setFromMatrixPosition(L.matrixWorld),a.setFromMatrixPosition(L.target.matrixWorld),R.direction.sub(a),R.direction.transformDirection(v),x++}else if(L.isSpotLight){const R=r.spot[S];R.position.setFromMatrixPosition(L.matrixWorld),R.position.applyMatrix4(v),R.direction.setFromMatrixPosition(L.matrixWorld),a.setFromMatrixPosition(L.target.matrixWorld),R.direction.sub(a),R.direction.transformDirection(v),S++}else if(L.isRectAreaLight){const R=r.rectArea[E];R.position.setFromMatrixPosition(L.matrixWorld),R.position.applyMatrix4(v),c.identity(),l.copy(L.matrixWorld),l.premultiply(v),c.extractRotation(l),R.halfWidth.set(L.width*.5,0,0),R.halfHeight.set(0,L.height*.5,0),R.halfWidth.applyMatrix4(c),R.halfHeight.applyMatrix4(c),E++}else if(L.isPointLight){const R=r.point[y];R.position.setFromMatrixPosition(L.matrixWorld),R.position.applyMatrix4(v),y++}else if(L.isHemisphereLight){const R=r.hemi[T];R.direction.setFromMatrixPosition(L.matrixWorld),R.direction.transformDirection(v),T++}}}return{setup:d,setupView:h,state:r}}function qm(s){const e=new SE(s),t=[],r=[];function a(_){g.camera=_,t.length=0,r.length=0}function l(_){t.push(_)}function c(_){r.push(_)}function d(){e.setup(t)}function h(_){e.setupView(t,_)}const g={lightsArray:t,shadowsArray:r,camera:null,lights:e,transmissionRenderTarget:{}};return{init:a,state:g,setupLights:d,setupLightsView:h,pushLight:l,pushShadow:c}}function ME(s){let e=new WeakMap;function t(a,l=0){const c=e.get(a);let d;return c===void 0?(d=new qm(s),e.set(a,[d])):l>=c.length?(d=new qm(s),c.push(d)):d=c[l],d}function r(){e=new WeakMap}return{get:t,dispose:r}}class EE extends Rr{static get type(){return"MeshDepthMaterial"}constructor(e){super(),this.isMeshDepthMaterial=!0,this.depthPacking=v0,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class TE extends Rr{static get type(){return"MeshDistanceMaterial"}constructor(e){super(),this.isMeshDistanceMaterial=!0,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}const wE=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,AE=`uniform sampler2D shadow_pass;
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
}`;function CE(s,e,t){let r=new gd;const a=new je,l=new je,c=new Vt,d=new EE({depthPacking:x0}),h=new TE,g={},_=t.maxTextureSize,x={[Ar]:An,[An]:Ar,[Ei]:Ei},y=new Cr({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new je},radius:{value:4}},vertexShader:wE,fragmentShader:AE}),S=y.clone();S.defines.HORIZONTAL_PASS=1;const E=new Cn;E.setAttribute("position",new mi(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const T=new On(E,y),v=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=gg;let m=this.type;this.render=function(I,F,H){if(v.enabled===!1||v.autoUpdate===!1&&v.needsUpdate===!1||I.length===0)return;const b=s.getRenderTarget(),A=s.getActiveCubeFace(),z=s.getActiveMipmapLevel(),se=s.state;se.setBlending(Er),se.buffers.color.setClear(1,1,1,1),se.buffers.depth.setTest(!0),se.setScissorTest(!1);const te=m!==Gi&&this.type===Gi,fe=m===Gi&&this.type!==Gi;for(let he=0,oe=I.length;he<oe;he++){const le=I[he],k=le.shadow;if(k===void 0){console.warn("THREE.WebGLShadowMap:",le,"has no shadow.");continue}if(k.autoUpdate===!1&&k.needsUpdate===!1)continue;a.copy(k.mapSize);const ae=k.getFrameExtents();if(a.multiply(ae),l.copy(k.mapSize),(a.x>_||a.y>_)&&(a.x>_&&(l.x=Math.floor(_/ae.x),a.x=l.x*ae.x,k.mapSize.x=l.x),a.y>_&&(l.y=Math.floor(_/ae.y),a.y=l.y*ae.y,k.mapSize.y=l.y)),k.map===null||te===!0||fe===!0){const N=this.type!==Gi?{minFilter:pi,magFilter:pi}:{};k.map!==null&&k.map.dispose(),k.map=new ts(a.x,a.y,N),k.map.texture.name=le.name+".shadowMap",k.camera.updateProjectionMatrix()}s.setRenderTarget(k.map),s.clear();const re=k.getViewportCount();for(let N=0;N<re;N++){const ne=k.getViewport(N);c.set(l.x*ne.x,l.y*ne.y,l.x*ne.z,l.y*ne.w),se.viewport(c),k.updateMatrices(le,N),r=k.getFrustum(),R(F,H,k.camera,le,this.type)}k.isPointLightShadow!==!0&&this.type===Gi&&P(k,H),k.needsUpdate=!1}m=this.type,v.needsUpdate=!1,s.setRenderTarget(b,A,z)};function P(I,F){const H=e.update(T);y.defines.VSM_SAMPLES!==I.blurSamples&&(y.defines.VSM_SAMPLES=I.blurSamples,S.defines.VSM_SAMPLES=I.blurSamples,y.needsUpdate=!0,S.needsUpdate=!0),I.mapPass===null&&(I.mapPass=new ts(a.x,a.y)),y.uniforms.shadow_pass.value=I.map.texture,y.uniforms.resolution.value=I.mapSize,y.uniforms.radius.value=I.radius,s.setRenderTarget(I.mapPass),s.clear(),s.renderBufferDirect(F,null,H,y,T,null),S.uniforms.shadow_pass.value=I.mapPass.texture,S.uniforms.resolution.value=I.mapSize,S.uniforms.radius.value=I.radius,s.setRenderTarget(I.map),s.clear(),s.renderBufferDirect(F,null,H,S,T,null)}function L(I,F,H,b){let A=null;const z=H.isPointLight===!0?I.customDistanceMaterial:I.customDepthMaterial;if(z!==void 0)A=z;else if(A=H.isPointLight===!0?h:d,s.localClippingEnabled&&F.clipShadows===!0&&Array.isArray(F.clippingPlanes)&&F.clippingPlanes.length!==0||F.displacementMap&&F.displacementScale!==0||F.alphaMap&&F.alphaTest>0||F.map&&F.alphaTest>0){const se=A.uuid,te=F.uuid;let fe=g[se];fe===void 0&&(fe={},g[se]=fe);let he=fe[te];he===void 0&&(he=A.clone(),fe[te]=he,F.addEventListener("dispose",j)),A=he}if(A.visible=F.visible,A.wireframe=F.wireframe,b===Gi?A.side=F.shadowSide!==null?F.shadowSide:F.side:A.side=F.shadowSide!==null?F.shadowSide:x[F.side],A.alphaMap=F.alphaMap,A.alphaTest=F.alphaTest,A.map=F.map,A.clipShadows=F.clipShadows,A.clippingPlanes=F.clippingPlanes,A.clipIntersection=F.clipIntersection,A.displacementMap=F.displacementMap,A.displacementScale=F.displacementScale,A.displacementBias=F.displacementBias,A.wireframeLinewidth=F.wireframeLinewidth,A.linewidth=F.linewidth,H.isPointLight===!0&&A.isMeshDistanceMaterial===!0){const se=s.properties.get(A);se.light=H}return A}function R(I,F,H,b,A){if(I.visible===!1)return;if(I.layers.test(F.layers)&&(I.isMesh||I.isLine||I.isPoints)&&(I.castShadow||I.receiveShadow&&A===Gi)&&(!I.frustumCulled||r.intersectsObject(I))){I.modelViewMatrix.multiplyMatrices(H.matrixWorldInverse,I.matrixWorld);const te=e.update(I),fe=I.material;if(Array.isArray(fe)){const he=te.groups;for(let oe=0,le=he.length;oe<le;oe++){const k=he[oe],ae=fe[k.materialIndex];if(ae&&ae.visible){const re=L(I,ae,b,A);I.onBeforeShadow(s,I,F,H,te,re,k),s.renderBufferDirect(H,null,te,re,I,k),I.onAfterShadow(s,I,F,H,te,re,k)}}}else if(fe.visible){const he=L(I,fe,b,A);I.onBeforeShadow(s,I,F,H,te,he,null),s.renderBufferDirect(H,null,te,he,I,null),I.onAfterShadow(s,I,F,H,te,he,null)}}const se=I.children;for(let te=0,fe=se.length;te<fe;te++)R(se[te],F,H,b,A)}function j(I){I.target.removeEventListener("dispose",j);for(const H in g){const b=g[H],A=I.target.uuid;A in b&&(b[A].dispose(),delete b[A])}}}const RE={[Sf]:Mf,[Ef]:Af,[Tf]:Cf,[eo]:wf,[Mf]:Sf,[Af]:Ef,[Cf]:Tf,[wf]:eo};function PE(s,e){function t(){let V=!1;const Ce=new Vt;let ie=null;const de=new Vt(0,0,0,0);return{setMask:function(be){ie!==be&&!V&&(s.colorMask(be,be,be,be),ie=be)},setLocked:function(be){V=be},setClear:function(be,Pe,st,Nt,jt){jt===!0&&(be*=Nt,Pe*=Nt,st*=Nt),Ce.set(be,Pe,st,Nt),de.equals(Ce)===!1&&(s.clearColor(be,Pe,st,Nt),de.copy(Ce))},reset:function(){V=!1,ie=null,de.set(-1,0,0,0)}}}function r(){let V=!1,Ce=!1,ie=null,de=null,be=null;return{setReversed:function(Pe){if(Ce!==Pe){const st=e.get("EXT_clip_control");Ce?st.clipControlEXT(st.LOWER_LEFT_EXT,st.ZERO_TO_ONE_EXT):st.clipControlEXT(st.LOWER_LEFT_EXT,st.NEGATIVE_ONE_TO_ONE_EXT);const Nt=be;be=null,this.setClear(Nt)}Ce=Pe},getReversed:function(){return Ce},setTest:function(Pe){Pe?ve(s.DEPTH_TEST):we(s.DEPTH_TEST)},setMask:function(Pe){ie!==Pe&&!V&&(s.depthMask(Pe),ie=Pe)},setFunc:function(Pe){if(Ce&&(Pe=RE[Pe]),de!==Pe){switch(Pe){case Sf:s.depthFunc(s.NEVER);break;case Mf:s.depthFunc(s.ALWAYS);break;case Ef:s.depthFunc(s.LESS);break;case eo:s.depthFunc(s.LEQUAL);break;case Tf:s.depthFunc(s.EQUAL);break;case wf:s.depthFunc(s.GEQUAL);break;case Af:s.depthFunc(s.GREATER);break;case Cf:s.depthFunc(s.NOTEQUAL);break;default:s.depthFunc(s.LEQUAL)}de=Pe}},setLocked:function(Pe){V=Pe},setClear:function(Pe){be!==Pe&&(Ce&&(Pe=1-Pe),s.clearDepth(Pe),be=Pe)},reset:function(){V=!1,ie=null,de=null,be=null,Ce=!1}}}function a(){let V=!1,Ce=null,ie=null,de=null,be=null,Pe=null,st=null,Nt=null,jt=null;return{setTest:function(vt){V||(vt?ve(s.STENCIL_TEST):we(s.STENCIL_TEST))},setMask:function(vt){Ce!==vt&&!V&&(s.stencilMask(vt),Ce=vt)},setFunc:function(vt,Rn,vn){(ie!==vt||de!==Rn||be!==vn)&&(s.stencilFunc(vt,Rn,vn),ie=vt,de=Rn,be=vn)},setOp:function(vt,Rn,vn){(Pe!==vt||st!==Rn||Nt!==vn)&&(s.stencilOp(vt,Rn,vn),Pe=vt,st=Rn,Nt=vn)},setLocked:function(vt){V=vt},setClear:function(vt){jt!==vt&&(s.clearStencil(vt),jt=vt)},reset:function(){V=!1,Ce=null,ie=null,de=null,be=null,Pe=null,st=null,Nt=null,jt=null}}}const l=new t,c=new r,d=new a,h=new WeakMap,g=new WeakMap;let _={},x={},y=new WeakMap,S=[],E=null,T=!1,v=null,m=null,P=null,L=null,R=null,j=null,I=null,F=new pt(0,0,0),H=0,b=!1,A=null,z=null,se=null,te=null,fe=null;const he=s.getParameter(s.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let oe=!1,le=0;const k=s.getParameter(s.VERSION);k.indexOf("WebGL")!==-1?(le=parseFloat(/^WebGL (\d)/.exec(k)[1]),oe=le>=1):k.indexOf("OpenGL ES")!==-1&&(le=parseFloat(/^OpenGL ES (\d)/.exec(k)[1]),oe=le>=2);let ae=null,re={};const N=s.getParameter(s.SCISSOR_BOX),ne=s.getParameter(s.VIEWPORT),De=new Vt().fromArray(N),Z=new Vt().fromArray(ne);function ue(V,Ce,ie,de){const be=new Uint8Array(4),Pe=s.createTexture();s.bindTexture(V,Pe),s.texParameteri(V,s.TEXTURE_MIN_FILTER,s.NEAREST),s.texParameteri(V,s.TEXTURE_MAG_FILTER,s.NEAREST);for(let st=0;st<ie;st++)V===s.TEXTURE_3D||V===s.TEXTURE_2D_ARRAY?s.texImage3D(Ce,0,s.RGBA,1,1,de,0,s.RGBA,s.UNSIGNED_BYTE,be):s.texImage2D(Ce+st,0,s.RGBA,1,1,0,s.RGBA,s.UNSIGNED_BYTE,be);return Pe}const Me={};Me[s.TEXTURE_2D]=ue(s.TEXTURE_2D,s.TEXTURE_2D,1),Me[s.TEXTURE_CUBE_MAP]=ue(s.TEXTURE_CUBE_MAP,s.TEXTURE_CUBE_MAP_POSITIVE_X,6),Me[s.TEXTURE_2D_ARRAY]=ue(s.TEXTURE_2D_ARRAY,s.TEXTURE_2D_ARRAY,1,1),Me[s.TEXTURE_3D]=ue(s.TEXTURE_3D,s.TEXTURE_3D,1,1),l.setClear(0,0,0,1),c.setClear(1),d.setClear(0),ve(s.DEPTH_TEST),c.setFunc(eo),ht(!1),ct(Jp),ve(s.CULL_FACE),Y(Er);function ve(V){_[V]!==!0&&(s.enable(V),_[V]=!0)}function we(V){_[V]!==!1&&(s.disable(V),_[V]=!1)}function Ue(V,Ce){return x[V]!==Ce?(s.bindFramebuffer(V,Ce),x[V]=Ce,V===s.DRAW_FRAMEBUFFER&&(x[s.FRAMEBUFFER]=Ce),V===s.FRAMEBUFFER&&(x[s.DRAW_FRAMEBUFFER]=Ce),!0):!1}function Ze(V,Ce){let ie=S,de=!1;if(V){ie=y.get(Ce),ie===void 0&&(ie=[],y.set(Ce,ie));const be=V.textures;if(ie.length!==be.length||ie[0]!==s.COLOR_ATTACHMENT0){for(let Pe=0,st=be.length;Pe<st;Pe++)ie[Pe]=s.COLOR_ATTACHMENT0+Pe;ie.length=be.length,de=!0}}else ie[0]!==s.BACK&&(ie[0]=s.BACK,de=!0);de&&s.drawBuffers(ie)}function Ct(V){return E!==V?(s.useProgram(V),E=V,!0):!1}const mt={[Kr]:s.FUNC_ADD,[Xv]:s.FUNC_SUBTRACT,[Yv]:s.FUNC_REVERSE_SUBTRACT};mt[jv]=s.MIN,mt[qv]=s.MAX;const Ut={[$v]:s.ZERO,[Kv]:s.ONE,[Zv]:s.SRC_COLOR,[xf]:s.SRC_ALPHA,[i0]:s.SRC_ALPHA_SATURATE,[t0]:s.DST_COLOR,[Jv]:s.DST_ALPHA,[Qv]:s.ONE_MINUS_SRC_COLOR,[yf]:s.ONE_MINUS_SRC_ALPHA,[n0]:s.ONE_MINUS_DST_COLOR,[e0]:s.ONE_MINUS_DST_ALPHA,[r0]:s.CONSTANT_COLOR,[s0]:s.ONE_MINUS_CONSTANT_COLOR,[o0]:s.CONSTANT_ALPHA,[a0]:s.ONE_MINUS_CONSTANT_ALPHA};function Y(V,Ce,ie,de,be,Pe,st,Nt,jt,vt){if(V===Er){T===!0&&(we(s.BLEND),T=!1);return}if(T===!1&&(ve(s.BLEND),T=!0),V!==Wv){if(V!==v||vt!==b){if((m!==Kr||R!==Kr)&&(s.blendEquation(s.FUNC_ADD),m=Kr,R=Kr),vt)switch(V){case Zs:s.blendFuncSeparate(s.ONE,s.ONE_MINUS_SRC_ALPHA,s.ONE,s.ONE_MINUS_SRC_ALPHA);break;case em:s.blendFunc(s.ONE,s.ONE);break;case tm:s.blendFuncSeparate(s.ZERO,s.ONE_MINUS_SRC_COLOR,s.ZERO,s.ONE);break;case nm:s.blendFuncSeparate(s.ZERO,s.SRC_COLOR,s.ZERO,s.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",V);break}else switch(V){case Zs:s.blendFuncSeparate(s.SRC_ALPHA,s.ONE_MINUS_SRC_ALPHA,s.ONE,s.ONE_MINUS_SRC_ALPHA);break;case em:s.blendFunc(s.SRC_ALPHA,s.ONE);break;case tm:s.blendFuncSeparate(s.ZERO,s.ONE_MINUS_SRC_COLOR,s.ZERO,s.ONE);break;case nm:s.blendFunc(s.ZERO,s.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",V);break}P=null,L=null,j=null,I=null,F.set(0,0,0),H=0,v=V,b=vt}return}be=be||Ce,Pe=Pe||ie,st=st||de,(Ce!==m||be!==R)&&(s.blendEquationSeparate(mt[Ce],mt[be]),m=Ce,R=be),(ie!==P||de!==L||Pe!==j||st!==I)&&(s.blendFuncSeparate(Ut[ie],Ut[de],Ut[Pe],Ut[st]),P=ie,L=de,j=Pe,I=st),(Nt.equals(F)===!1||jt!==H)&&(s.blendColor(Nt.r,Nt.g,Nt.b,jt),F.copy(Nt),H=jt),v=V,b=!1}function _n(V,Ce){V.side===Ei?we(s.CULL_FACE):ve(s.CULL_FACE);let ie=V.side===An;Ce&&(ie=!ie),ht(ie),V.blending===Zs&&V.transparent===!1?Y(Er):Y(V.blending,V.blendEquation,V.blendSrc,V.blendDst,V.blendEquationAlpha,V.blendSrcAlpha,V.blendDstAlpha,V.blendColor,V.blendAlpha,V.premultipliedAlpha),c.setFunc(V.depthFunc),c.setTest(V.depthTest),c.setMask(V.depthWrite),l.setMask(V.colorWrite);const de=V.stencilWrite;d.setTest(de),de&&(d.setMask(V.stencilWriteMask),d.setFunc(V.stencilFunc,V.stencilRef,V.stencilFuncMask),d.setOp(V.stencilFail,V.stencilZFail,V.stencilZPass)),wt(V.polygonOffset,V.polygonOffsetFactor,V.polygonOffsetUnits),V.alphaToCoverage===!0?ve(s.SAMPLE_ALPHA_TO_COVERAGE):we(s.SAMPLE_ALPHA_TO_COVERAGE)}function ht(V){A!==V&&(V?s.frontFace(s.CW):s.frontFace(s.CCW),A=V)}function ct(V){V!==Hv?(ve(s.CULL_FACE),V!==z&&(V===Jp?s.cullFace(s.BACK):V===Vv?s.cullFace(s.FRONT):s.cullFace(s.FRONT_AND_BACK))):we(s.CULL_FACE),z=V}function qe(V){V!==se&&(oe&&s.lineWidth(V),se=V)}function wt(V,Ce,ie){V?(ve(s.POLYGON_OFFSET_FILL),(te!==Ce||fe!==ie)&&(s.polygonOffset(Ce,ie),te=Ce,fe=ie)):we(s.POLYGON_OFFSET_FILL)}function Ye(V){V?ve(s.SCISSOR_TEST):we(s.SCISSOR_TEST)}function D(V){V===void 0&&(V=s.TEXTURE0+he-1),ae!==V&&(s.activeTexture(V),ae=V)}function w(V,Ce,ie){ie===void 0&&(ae===null?ie=s.TEXTURE0+he-1:ie=ae);let de=re[ie];de===void 0&&(de={type:void 0,texture:void 0},re[ie]=de),(de.type!==V||de.texture!==Ce)&&(ae!==ie&&(s.activeTexture(ie),ae=ie),s.bindTexture(V,Ce||Me[V]),de.type=V,de.texture=Ce)}function K(){const V=re[ae];V!==void 0&&V.type!==void 0&&(s.bindTexture(V.type,null),V.type=void 0,V.texture=void 0)}function pe(){try{s.compressedTexImage2D.apply(s,arguments)}catch(V){console.error("THREE.WebGLState:",V)}}function ge(){try{s.compressedTexImage3D.apply(s,arguments)}catch(V){console.error("THREE.WebGLState:",V)}}function ce(){try{s.texSubImage2D.apply(s,arguments)}catch(V){console.error("THREE.WebGLState:",V)}}function He(){try{s.texSubImage3D.apply(s,arguments)}catch(V){console.error("THREE.WebGLState:",V)}}function Ae(){try{s.compressedTexSubImage2D.apply(s,arguments)}catch(V){console.error("THREE.WebGLState:",V)}}function Ie(){try{s.compressedTexSubImage3D.apply(s,arguments)}catch(V){console.error("THREE.WebGLState:",V)}}function ut(){try{s.texStorage2D.apply(s,arguments)}catch(V){console.error("THREE.WebGLState:",V)}}function ye(){try{s.texStorage3D.apply(s,arguments)}catch(V){console.error("THREE.WebGLState:",V)}}function Fe(){try{s.texImage2D.apply(s,arguments)}catch(V){console.error("THREE.WebGLState:",V)}}function Qe(){try{s.texImage3D.apply(s,arguments)}catch(V){console.error("THREE.WebGLState:",V)}}function Je(V){De.equals(V)===!1&&(s.scissor(V.x,V.y,V.z,V.w),De.copy(V))}function Oe(V){Z.equals(V)===!1&&(s.viewport(V.x,V.y,V.z,V.w),Z.copy(V))}function ft(V,Ce){let ie=g.get(Ce);ie===void 0&&(ie=new WeakMap,g.set(Ce,ie));let de=ie.get(V);de===void 0&&(de=s.getUniformBlockIndex(Ce,V.name),ie.set(V,de))}function rt(V,Ce){const de=g.get(Ce).get(V);h.get(Ce)!==de&&(s.uniformBlockBinding(Ce,de,V.__bindingPointIndex),h.set(Ce,de))}function Tt(){s.disable(s.BLEND),s.disable(s.CULL_FACE),s.disable(s.DEPTH_TEST),s.disable(s.POLYGON_OFFSET_FILL),s.disable(s.SCISSOR_TEST),s.disable(s.STENCIL_TEST),s.disable(s.SAMPLE_ALPHA_TO_COVERAGE),s.blendEquation(s.FUNC_ADD),s.blendFunc(s.ONE,s.ZERO),s.blendFuncSeparate(s.ONE,s.ZERO,s.ONE,s.ZERO),s.blendColor(0,0,0,0),s.colorMask(!0,!0,!0,!0),s.clearColor(0,0,0,0),s.depthMask(!0),s.depthFunc(s.LESS),c.setReversed(!1),s.clearDepth(1),s.stencilMask(4294967295),s.stencilFunc(s.ALWAYS,0,4294967295),s.stencilOp(s.KEEP,s.KEEP,s.KEEP),s.clearStencil(0),s.cullFace(s.BACK),s.frontFace(s.CCW),s.polygonOffset(0,0),s.activeTexture(s.TEXTURE0),s.bindFramebuffer(s.FRAMEBUFFER,null),s.bindFramebuffer(s.DRAW_FRAMEBUFFER,null),s.bindFramebuffer(s.READ_FRAMEBUFFER,null),s.useProgram(null),s.lineWidth(1),s.scissor(0,0,s.canvas.width,s.canvas.height),s.viewport(0,0,s.canvas.width,s.canvas.height),_={},ae=null,re={},x={},y=new WeakMap,S=[],E=null,T=!1,v=null,m=null,P=null,L=null,R=null,j=null,I=null,F=new pt(0,0,0),H=0,b=!1,A=null,z=null,se=null,te=null,fe=null,De.set(0,0,s.canvas.width,s.canvas.height),Z.set(0,0,s.canvas.width,s.canvas.height),l.reset(),c.reset(),d.reset()}return{buffers:{color:l,depth:c,stencil:d},enable:ve,disable:we,bindFramebuffer:Ue,drawBuffers:Ze,useProgram:Ct,setBlending:Y,setMaterial:_n,setFlipSided:ht,setCullFace:ct,setLineWidth:qe,setPolygonOffset:wt,setScissorTest:Ye,activeTexture:D,bindTexture:w,unbindTexture:K,compressedTexImage2D:pe,compressedTexImage3D:ge,texImage2D:Fe,texImage3D:Qe,updateUBOMapping:ft,uniformBlockBinding:rt,texStorage2D:ut,texStorage3D:ye,texSubImage2D:ce,texSubImage3D:He,compressedTexSubImage2D:Ae,compressedTexSubImage3D:Ie,scissor:Je,viewport:Oe,reset:Tt}}function $m(s,e,t,r){const a=bE(r);switch(t){case Sg:return s*e;case Eg:return s*e;case Tg:return s*e*2;case wg:return s*e/a.components*a.byteLength;case hd:return s*e/a.components*a.byteLength;case Ag:return s*e*2/a.components*a.byteLength;case pd:return s*e*2/a.components*a.byteLength;case Mg:return s*e*3/a.components*a.byteLength;case hi:return s*e*4/a.components*a.byteLength;case md:return s*e*4/a.components*a.byteLength;case kl:case Bl:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*8;case Hl:case Vl:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*16;case Uf:case Nf:return Math.max(s,16)*Math.max(e,8)/4;case Df:case If:return Math.max(s,8)*Math.max(e,8)/2;case Ff:case Of:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*8;case zf:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*16;case kf:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*16;case Bf:return Math.floor((s+4)/5)*Math.floor((e+3)/4)*16;case Hf:return Math.floor((s+4)/5)*Math.floor((e+4)/5)*16;case Vf:return Math.floor((s+5)/6)*Math.floor((e+4)/5)*16;case Gf:return Math.floor((s+5)/6)*Math.floor((e+5)/6)*16;case Wf:return Math.floor((s+7)/8)*Math.floor((e+4)/5)*16;case Xf:return Math.floor((s+7)/8)*Math.floor((e+5)/6)*16;case Yf:return Math.floor((s+7)/8)*Math.floor((e+7)/8)*16;case jf:return Math.floor((s+9)/10)*Math.floor((e+4)/5)*16;case qf:return Math.floor((s+9)/10)*Math.floor((e+5)/6)*16;case $f:return Math.floor((s+9)/10)*Math.floor((e+7)/8)*16;case Kf:return Math.floor((s+9)/10)*Math.floor((e+9)/10)*16;case Zf:return Math.floor((s+11)/12)*Math.floor((e+9)/10)*16;case Qf:return Math.floor((s+11)/12)*Math.floor((e+11)/12)*16;case Gl:case Jf:case ed:return Math.ceil(s/4)*Math.ceil(e/4)*16;case Cg:case td:return Math.ceil(s/4)*Math.ceil(e/4)*8;case nd:case id:return Math.ceil(s/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function bE(s){switch(s){case ji:case vg:return{byteLength:1,components:1};case Zo:case xg:case ea:return{byteLength:2,components:1};case fd:case dd:return{byteLength:2,components:4};case es:case cd:case Wi:return{byteLength:4,components:1};case yg:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${s}.`)}function LE(s,e,t,r,a,l,c){const d=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,h=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),g=new je,_=new WeakMap;let x;const y=new WeakMap;let S=!1;try{S=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function E(D,w){return S?new OffscreenCanvas(D,w):Qo("canvas")}function T(D,w,K){let pe=1;const ge=Ye(D);if((ge.width>K||ge.height>K)&&(pe=K/Math.max(ge.width,ge.height)),pe<1)if(typeof HTMLImageElement<"u"&&D instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&D instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&D instanceof ImageBitmap||typeof VideoFrame<"u"&&D instanceof VideoFrame){const ce=Math.floor(pe*ge.width),He=Math.floor(pe*ge.height);x===void 0&&(x=E(ce,He));const Ae=w?E(ce,He):x;return Ae.width=ce,Ae.height=He,Ae.getContext("2d").drawImage(D,0,0,ce,He),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+ge.width+"x"+ge.height+") to ("+ce+"x"+He+")."),Ae}else return"data"in D&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+ge.width+"x"+ge.height+")."),D;return D}function v(D){return D.generateMipmaps}function m(D){s.generateMipmap(D)}function P(D){return D.isWebGLCubeRenderTarget?s.TEXTURE_CUBE_MAP:D.isWebGL3DRenderTarget?s.TEXTURE_3D:D.isWebGLArrayRenderTarget||D.isCompressedArrayTexture?s.TEXTURE_2D_ARRAY:s.TEXTURE_2D}function L(D,w,K,pe,ge=!1){if(D!==null){if(s[D]!==void 0)return s[D];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+D+"'")}let ce=w;if(w===s.RED&&(K===s.FLOAT&&(ce=s.R32F),K===s.HALF_FLOAT&&(ce=s.R16F),K===s.UNSIGNED_BYTE&&(ce=s.R8)),w===s.RED_INTEGER&&(K===s.UNSIGNED_BYTE&&(ce=s.R8UI),K===s.UNSIGNED_SHORT&&(ce=s.R16UI),K===s.UNSIGNED_INT&&(ce=s.R32UI),K===s.BYTE&&(ce=s.R8I),K===s.SHORT&&(ce=s.R16I),K===s.INT&&(ce=s.R32I)),w===s.RG&&(K===s.FLOAT&&(ce=s.RG32F),K===s.HALF_FLOAT&&(ce=s.RG16F),K===s.UNSIGNED_BYTE&&(ce=s.RG8)),w===s.RG_INTEGER&&(K===s.UNSIGNED_BYTE&&(ce=s.RG8UI),K===s.UNSIGNED_SHORT&&(ce=s.RG16UI),K===s.UNSIGNED_INT&&(ce=s.RG32UI),K===s.BYTE&&(ce=s.RG8I),K===s.SHORT&&(ce=s.RG16I),K===s.INT&&(ce=s.RG32I)),w===s.RGB_INTEGER&&(K===s.UNSIGNED_BYTE&&(ce=s.RGB8UI),K===s.UNSIGNED_SHORT&&(ce=s.RGB16UI),K===s.UNSIGNED_INT&&(ce=s.RGB32UI),K===s.BYTE&&(ce=s.RGB8I),K===s.SHORT&&(ce=s.RGB16I),K===s.INT&&(ce=s.RGB32I)),w===s.RGBA_INTEGER&&(K===s.UNSIGNED_BYTE&&(ce=s.RGBA8UI),K===s.UNSIGNED_SHORT&&(ce=s.RGBA16UI),K===s.UNSIGNED_INT&&(ce=s.RGBA32UI),K===s.BYTE&&(ce=s.RGBA8I),K===s.SHORT&&(ce=s.RGBA16I),K===s.INT&&(ce=s.RGBA32I)),w===s.RGB&&K===s.UNSIGNED_INT_5_9_9_9_REV&&(ce=s.RGB9_E5),w===s.RGBA){const He=ge?Ql:yt.getTransfer(pe);K===s.FLOAT&&(ce=s.RGBA32F),K===s.HALF_FLOAT&&(ce=s.RGBA16F),K===s.UNSIGNED_BYTE&&(ce=He===Rt?s.SRGB8_ALPHA8:s.RGBA8),K===s.UNSIGNED_SHORT_4_4_4_4&&(ce=s.RGBA4),K===s.UNSIGNED_SHORT_5_5_5_1&&(ce=s.RGB5_A1)}return(ce===s.R16F||ce===s.R32F||ce===s.RG16F||ce===s.RG32F||ce===s.RGBA16F||ce===s.RGBA32F)&&e.get("EXT_color_buffer_float"),ce}function R(D,w){let K;return D?w===null||w===es||w===io?K=s.DEPTH24_STENCIL8:w===Wi?K=s.DEPTH32F_STENCIL8:w===Zo&&(K=s.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):w===null||w===es||w===io?K=s.DEPTH_COMPONENT24:w===Wi?K=s.DEPTH_COMPONENT32F:w===Zo&&(K=s.DEPTH_COMPONENT16),K}function j(D,w){return v(D)===!0||D.isFramebufferTexture&&D.minFilter!==pi&&D.minFilter!==wi?Math.log2(Math.max(w.width,w.height))+1:D.mipmaps!==void 0&&D.mipmaps.length>0?D.mipmaps.length:D.isCompressedTexture&&Array.isArray(D.image)?w.mipmaps.length:1}function I(D){const w=D.target;w.removeEventListener("dispose",I),H(w),w.isVideoTexture&&_.delete(w)}function F(D){const w=D.target;w.removeEventListener("dispose",F),A(w)}function H(D){const w=r.get(D);if(w.__webglInit===void 0)return;const K=D.source,pe=y.get(K);if(pe){const ge=pe[w.__cacheKey];ge.usedTimes--,ge.usedTimes===0&&b(D),Object.keys(pe).length===0&&y.delete(K)}r.remove(D)}function b(D){const w=r.get(D);s.deleteTexture(w.__webglTexture);const K=D.source,pe=y.get(K);delete pe[w.__cacheKey],c.memory.textures--}function A(D){const w=r.get(D);if(D.depthTexture&&(D.depthTexture.dispose(),r.remove(D.depthTexture)),D.isWebGLCubeRenderTarget)for(let pe=0;pe<6;pe++){if(Array.isArray(w.__webglFramebuffer[pe]))for(let ge=0;ge<w.__webglFramebuffer[pe].length;ge++)s.deleteFramebuffer(w.__webglFramebuffer[pe][ge]);else s.deleteFramebuffer(w.__webglFramebuffer[pe]);w.__webglDepthbuffer&&s.deleteRenderbuffer(w.__webglDepthbuffer[pe])}else{if(Array.isArray(w.__webglFramebuffer))for(let pe=0;pe<w.__webglFramebuffer.length;pe++)s.deleteFramebuffer(w.__webglFramebuffer[pe]);else s.deleteFramebuffer(w.__webglFramebuffer);if(w.__webglDepthbuffer&&s.deleteRenderbuffer(w.__webglDepthbuffer),w.__webglMultisampledFramebuffer&&s.deleteFramebuffer(w.__webglMultisampledFramebuffer),w.__webglColorRenderbuffer)for(let pe=0;pe<w.__webglColorRenderbuffer.length;pe++)w.__webglColorRenderbuffer[pe]&&s.deleteRenderbuffer(w.__webglColorRenderbuffer[pe]);w.__webglDepthRenderbuffer&&s.deleteRenderbuffer(w.__webglDepthRenderbuffer)}const K=D.textures;for(let pe=0,ge=K.length;pe<ge;pe++){const ce=r.get(K[pe]);ce.__webglTexture&&(s.deleteTexture(ce.__webglTexture),c.memory.textures--),r.remove(K[pe])}r.remove(D)}let z=0;function se(){z=0}function te(){const D=z;return D>=a.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+D+" texture units while this GPU supports only "+a.maxTextures),z+=1,D}function fe(D){const w=[];return w.push(D.wrapS),w.push(D.wrapT),w.push(D.wrapR||0),w.push(D.magFilter),w.push(D.minFilter),w.push(D.anisotropy),w.push(D.internalFormat),w.push(D.format),w.push(D.type),w.push(D.generateMipmaps),w.push(D.premultiplyAlpha),w.push(D.flipY),w.push(D.unpackAlignment),w.push(D.colorSpace),w.join()}function he(D,w){const K=r.get(D);if(D.isVideoTexture&&qe(D),D.isRenderTargetTexture===!1&&D.version>0&&K.__version!==D.version){const pe=D.image;if(pe===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(pe.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{Z(K,D,w);return}}t.bindTexture(s.TEXTURE_2D,K.__webglTexture,s.TEXTURE0+w)}function oe(D,w){const K=r.get(D);if(D.version>0&&K.__version!==D.version){Z(K,D,w);return}t.bindTexture(s.TEXTURE_2D_ARRAY,K.__webglTexture,s.TEXTURE0+w)}function le(D,w){const K=r.get(D);if(D.version>0&&K.__version!==D.version){Z(K,D,w);return}t.bindTexture(s.TEXTURE_3D,K.__webglTexture,s.TEXTURE0+w)}function k(D,w){const K=r.get(D);if(D.version>0&&K.__version!==D.version){ue(K,D,w);return}t.bindTexture(s.TEXTURE_CUBE_MAP,K.__webglTexture,s.TEXTURE0+w)}const ae={[bf]:s.REPEAT,[Qr]:s.CLAMP_TO_EDGE,[Lf]:s.MIRRORED_REPEAT},re={[pi]:s.NEAREST,[_0]:s.NEAREST_MIPMAP_NEAREST,[cl]:s.NEAREST_MIPMAP_LINEAR,[wi]:s.LINEAR,[zc]:s.LINEAR_MIPMAP_NEAREST,[Jr]:s.LINEAR_MIPMAP_LINEAR},N={[S0]:s.NEVER,[C0]:s.ALWAYS,[M0]:s.LESS,[Pg]:s.LEQUAL,[E0]:s.EQUAL,[A0]:s.GEQUAL,[T0]:s.GREATER,[w0]:s.NOTEQUAL};function ne(D,w){if(w.type===Wi&&e.has("OES_texture_float_linear")===!1&&(w.magFilter===wi||w.magFilter===zc||w.magFilter===cl||w.magFilter===Jr||w.minFilter===wi||w.minFilter===zc||w.minFilter===cl||w.minFilter===Jr)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),s.texParameteri(D,s.TEXTURE_WRAP_S,ae[w.wrapS]),s.texParameteri(D,s.TEXTURE_WRAP_T,ae[w.wrapT]),(D===s.TEXTURE_3D||D===s.TEXTURE_2D_ARRAY)&&s.texParameteri(D,s.TEXTURE_WRAP_R,ae[w.wrapR]),s.texParameteri(D,s.TEXTURE_MAG_FILTER,re[w.magFilter]),s.texParameteri(D,s.TEXTURE_MIN_FILTER,re[w.minFilter]),w.compareFunction&&(s.texParameteri(D,s.TEXTURE_COMPARE_MODE,s.COMPARE_REF_TO_TEXTURE),s.texParameteri(D,s.TEXTURE_COMPARE_FUNC,N[w.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(w.magFilter===pi||w.minFilter!==cl&&w.minFilter!==Jr||w.type===Wi&&e.has("OES_texture_float_linear")===!1)return;if(w.anisotropy>1||r.get(w).__currentAnisotropy){const K=e.get("EXT_texture_filter_anisotropic");s.texParameterf(D,K.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(w.anisotropy,a.getMaxAnisotropy())),r.get(w).__currentAnisotropy=w.anisotropy}}}function De(D,w){let K=!1;D.__webglInit===void 0&&(D.__webglInit=!0,w.addEventListener("dispose",I));const pe=w.source;let ge=y.get(pe);ge===void 0&&(ge={},y.set(pe,ge));const ce=fe(w);if(ce!==D.__cacheKey){ge[ce]===void 0&&(ge[ce]={texture:s.createTexture(),usedTimes:0},c.memory.textures++,K=!0),ge[ce].usedTimes++;const He=ge[D.__cacheKey];He!==void 0&&(ge[D.__cacheKey].usedTimes--,He.usedTimes===0&&b(w)),D.__cacheKey=ce,D.__webglTexture=ge[ce].texture}return K}function Z(D,w,K){let pe=s.TEXTURE_2D;(w.isDataArrayTexture||w.isCompressedArrayTexture)&&(pe=s.TEXTURE_2D_ARRAY),w.isData3DTexture&&(pe=s.TEXTURE_3D);const ge=De(D,w),ce=w.source;t.bindTexture(pe,D.__webglTexture,s.TEXTURE0+K);const He=r.get(ce);if(ce.version!==He.__version||ge===!0){t.activeTexture(s.TEXTURE0+K);const Ae=yt.getPrimaries(yt.workingColorSpace),Ie=w.colorSpace===Mr?null:yt.getPrimaries(w.colorSpace),ut=w.colorSpace===Mr||Ae===Ie?s.NONE:s.BROWSER_DEFAULT_WEBGL;s.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,w.flipY),s.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,w.premultiplyAlpha),s.pixelStorei(s.UNPACK_ALIGNMENT,w.unpackAlignment),s.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL,ut);let ye=T(w.image,!1,a.maxTextureSize);ye=wt(w,ye);const Fe=l.convert(w.format,w.colorSpace),Qe=l.convert(w.type);let Je=L(w.internalFormat,Fe,Qe,w.colorSpace,w.isVideoTexture);ne(pe,w);let Oe;const ft=w.mipmaps,rt=w.isVideoTexture!==!0,Tt=He.__version===void 0||ge===!0,V=ce.dataReady,Ce=j(w,ye);if(w.isDepthTexture)Je=R(w.format===ro,w.type),Tt&&(rt?t.texStorage2D(s.TEXTURE_2D,1,Je,ye.width,ye.height):t.texImage2D(s.TEXTURE_2D,0,Je,ye.width,ye.height,0,Fe,Qe,null));else if(w.isDataTexture)if(ft.length>0){rt&&Tt&&t.texStorage2D(s.TEXTURE_2D,Ce,Je,ft[0].width,ft[0].height);for(let ie=0,de=ft.length;ie<de;ie++)Oe=ft[ie],rt?V&&t.texSubImage2D(s.TEXTURE_2D,ie,0,0,Oe.width,Oe.height,Fe,Qe,Oe.data):t.texImage2D(s.TEXTURE_2D,ie,Je,Oe.width,Oe.height,0,Fe,Qe,Oe.data);w.generateMipmaps=!1}else rt?(Tt&&t.texStorage2D(s.TEXTURE_2D,Ce,Je,ye.width,ye.height),V&&t.texSubImage2D(s.TEXTURE_2D,0,0,0,ye.width,ye.height,Fe,Qe,ye.data)):t.texImage2D(s.TEXTURE_2D,0,Je,ye.width,ye.height,0,Fe,Qe,ye.data);else if(w.isCompressedTexture)if(w.isCompressedArrayTexture){rt&&Tt&&t.texStorage3D(s.TEXTURE_2D_ARRAY,Ce,Je,ft[0].width,ft[0].height,ye.depth);for(let ie=0,de=ft.length;ie<de;ie++)if(Oe=ft[ie],w.format!==hi)if(Fe!==null)if(rt){if(V)if(w.layerUpdates.size>0){const be=$m(Oe.width,Oe.height,w.format,w.type);for(const Pe of w.layerUpdates){const st=Oe.data.subarray(Pe*be/Oe.data.BYTES_PER_ELEMENT,(Pe+1)*be/Oe.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(s.TEXTURE_2D_ARRAY,ie,0,0,Pe,Oe.width,Oe.height,1,Fe,st)}w.clearLayerUpdates()}else t.compressedTexSubImage3D(s.TEXTURE_2D_ARRAY,ie,0,0,0,Oe.width,Oe.height,ye.depth,Fe,Oe.data)}else t.compressedTexImage3D(s.TEXTURE_2D_ARRAY,ie,Je,Oe.width,Oe.height,ye.depth,0,Oe.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else rt?V&&t.texSubImage3D(s.TEXTURE_2D_ARRAY,ie,0,0,0,Oe.width,Oe.height,ye.depth,Fe,Qe,Oe.data):t.texImage3D(s.TEXTURE_2D_ARRAY,ie,Je,Oe.width,Oe.height,ye.depth,0,Fe,Qe,Oe.data)}else{rt&&Tt&&t.texStorage2D(s.TEXTURE_2D,Ce,Je,ft[0].width,ft[0].height);for(let ie=0,de=ft.length;ie<de;ie++)Oe=ft[ie],w.format!==hi?Fe!==null?rt?V&&t.compressedTexSubImage2D(s.TEXTURE_2D,ie,0,0,Oe.width,Oe.height,Fe,Oe.data):t.compressedTexImage2D(s.TEXTURE_2D,ie,Je,Oe.width,Oe.height,0,Oe.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):rt?V&&t.texSubImage2D(s.TEXTURE_2D,ie,0,0,Oe.width,Oe.height,Fe,Qe,Oe.data):t.texImage2D(s.TEXTURE_2D,ie,Je,Oe.width,Oe.height,0,Fe,Qe,Oe.data)}else if(w.isDataArrayTexture)if(rt){if(Tt&&t.texStorage3D(s.TEXTURE_2D_ARRAY,Ce,Je,ye.width,ye.height,ye.depth),V)if(w.layerUpdates.size>0){const ie=$m(ye.width,ye.height,w.format,w.type);for(const de of w.layerUpdates){const be=ye.data.subarray(de*ie/ye.data.BYTES_PER_ELEMENT,(de+1)*ie/ye.data.BYTES_PER_ELEMENT);t.texSubImage3D(s.TEXTURE_2D_ARRAY,0,0,0,de,ye.width,ye.height,1,Fe,Qe,be)}w.clearLayerUpdates()}else t.texSubImage3D(s.TEXTURE_2D_ARRAY,0,0,0,0,ye.width,ye.height,ye.depth,Fe,Qe,ye.data)}else t.texImage3D(s.TEXTURE_2D_ARRAY,0,Je,ye.width,ye.height,ye.depth,0,Fe,Qe,ye.data);else if(w.isData3DTexture)rt?(Tt&&t.texStorage3D(s.TEXTURE_3D,Ce,Je,ye.width,ye.height,ye.depth),V&&t.texSubImage3D(s.TEXTURE_3D,0,0,0,0,ye.width,ye.height,ye.depth,Fe,Qe,ye.data)):t.texImage3D(s.TEXTURE_3D,0,Je,ye.width,ye.height,ye.depth,0,Fe,Qe,ye.data);else if(w.isFramebufferTexture){if(Tt)if(rt)t.texStorage2D(s.TEXTURE_2D,Ce,Je,ye.width,ye.height);else{let ie=ye.width,de=ye.height;for(let be=0;be<Ce;be++)t.texImage2D(s.TEXTURE_2D,be,Je,ie,de,0,Fe,Qe,null),ie>>=1,de>>=1}}else if(ft.length>0){if(rt&&Tt){const ie=Ye(ft[0]);t.texStorage2D(s.TEXTURE_2D,Ce,Je,ie.width,ie.height)}for(let ie=0,de=ft.length;ie<de;ie++)Oe=ft[ie],rt?V&&t.texSubImage2D(s.TEXTURE_2D,ie,0,0,Fe,Qe,Oe):t.texImage2D(s.TEXTURE_2D,ie,Je,Fe,Qe,Oe);w.generateMipmaps=!1}else if(rt){if(Tt){const ie=Ye(ye);t.texStorage2D(s.TEXTURE_2D,Ce,Je,ie.width,ie.height)}V&&t.texSubImage2D(s.TEXTURE_2D,0,0,0,Fe,Qe,ye)}else t.texImage2D(s.TEXTURE_2D,0,Je,Fe,Qe,ye);v(w)&&m(pe),He.__version=ce.version,w.onUpdate&&w.onUpdate(w)}D.__version=w.version}function ue(D,w,K){if(w.image.length!==6)return;const pe=De(D,w),ge=w.source;t.bindTexture(s.TEXTURE_CUBE_MAP,D.__webglTexture,s.TEXTURE0+K);const ce=r.get(ge);if(ge.version!==ce.__version||pe===!0){t.activeTexture(s.TEXTURE0+K);const He=yt.getPrimaries(yt.workingColorSpace),Ae=w.colorSpace===Mr?null:yt.getPrimaries(w.colorSpace),Ie=w.colorSpace===Mr||He===Ae?s.NONE:s.BROWSER_DEFAULT_WEBGL;s.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,w.flipY),s.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,w.premultiplyAlpha),s.pixelStorei(s.UNPACK_ALIGNMENT,w.unpackAlignment),s.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL,Ie);const ut=w.isCompressedTexture||w.image[0].isCompressedTexture,ye=w.image[0]&&w.image[0].isDataTexture,Fe=[];for(let de=0;de<6;de++)!ut&&!ye?Fe[de]=T(w.image[de],!0,a.maxCubemapSize):Fe[de]=ye?w.image[de].image:w.image[de],Fe[de]=wt(w,Fe[de]);const Qe=Fe[0],Je=l.convert(w.format,w.colorSpace),Oe=l.convert(w.type),ft=L(w.internalFormat,Je,Oe,w.colorSpace),rt=w.isVideoTexture!==!0,Tt=ce.__version===void 0||pe===!0,V=ge.dataReady;let Ce=j(w,Qe);ne(s.TEXTURE_CUBE_MAP,w);let ie;if(ut){rt&&Tt&&t.texStorage2D(s.TEXTURE_CUBE_MAP,Ce,ft,Qe.width,Qe.height);for(let de=0;de<6;de++){ie=Fe[de].mipmaps;for(let be=0;be<ie.length;be++){const Pe=ie[be];w.format!==hi?Je!==null?rt?V&&t.compressedTexSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+de,be,0,0,Pe.width,Pe.height,Je,Pe.data):t.compressedTexImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+de,be,ft,Pe.width,Pe.height,0,Pe.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):rt?V&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+de,be,0,0,Pe.width,Pe.height,Je,Oe,Pe.data):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+de,be,ft,Pe.width,Pe.height,0,Je,Oe,Pe.data)}}}else{if(ie=w.mipmaps,rt&&Tt){ie.length>0&&Ce++;const de=Ye(Fe[0]);t.texStorage2D(s.TEXTURE_CUBE_MAP,Ce,ft,de.width,de.height)}for(let de=0;de<6;de++)if(ye){rt?V&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+de,0,0,0,Fe[de].width,Fe[de].height,Je,Oe,Fe[de].data):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+de,0,ft,Fe[de].width,Fe[de].height,0,Je,Oe,Fe[de].data);for(let be=0;be<ie.length;be++){const st=ie[be].image[de].image;rt?V&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+de,be+1,0,0,st.width,st.height,Je,Oe,st.data):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+de,be+1,ft,st.width,st.height,0,Je,Oe,st.data)}}else{rt?V&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+de,0,0,0,Je,Oe,Fe[de]):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+de,0,ft,Je,Oe,Fe[de]);for(let be=0;be<ie.length;be++){const Pe=ie[be];rt?V&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+de,be+1,0,0,Je,Oe,Pe.image[de]):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+de,be+1,ft,Je,Oe,Pe.image[de])}}}v(w)&&m(s.TEXTURE_CUBE_MAP),ce.__version=ge.version,w.onUpdate&&w.onUpdate(w)}D.__version=w.version}function Me(D,w,K,pe,ge,ce){const He=l.convert(K.format,K.colorSpace),Ae=l.convert(K.type),Ie=L(K.internalFormat,He,Ae,K.colorSpace),ut=r.get(w),ye=r.get(K);if(ye.__renderTarget=w,!ut.__hasExternalTextures){const Fe=Math.max(1,w.width>>ce),Qe=Math.max(1,w.height>>ce);ge===s.TEXTURE_3D||ge===s.TEXTURE_2D_ARRAY?t.texImage3D(ge,ce,Ie,Fe,Qe,w.depth,0,He,Ae,null):t.texImage2D(ge,ce,Ie,Fe,Qe,0,He,Ae,null)}t.bindFramebuffer(s.FRAMEBUFFER,D),ct(w)?d.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,pe,ge,ye.__webglTexture,0,ht(w)):(ge===s.TEXTURE_2D||ge>=s.TEXTURE_CUBE_MAP_POSITIVE_X&&ge<=s.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&s.framebufferTexture2D(s.FRAMEBUFFER,pe,ge,ye.__webglTexture,ce),t.bindFramebuffer(s.FRAMEBUFFER,null)}function ve(D,w,K){if(s.bindRenderbuffer(s.RENDERBUFFER,D),w.depthBuffer){const pe=w.depthTexture,ge=pe&&pe.isDepthTexture?pe.type:null,ce=R(w.stencilBuffer,ge),He=w.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,Ae=ht(w);ct(w)?d.renderbufferStorageMultisampleEXT(s.RENDERBUFFER,Ae,ce,w.width,w.height):K?s.renderbufferStorageMultisample(s.RENDERBUFFER,Ae,ce,w.width,w.height):s.renderbufferStorage(s.RENDERBUFFER,ce,w.width,w.height),s.framebufferRenderbuffer(s.FRAMEBUFFER,He,s.RENDERBUFFER,D)}else{const pe=w.textures;for(let ge=0;ge<pe.length;ge++){const ce=pe[ge],He=l.convert(ce.format,ce.colorSpace),Ae=l.convert(ce.type),Ie=L(ce.internalFormat,He,Ae,ce.colorSpace),ut=ht(w);K&&ct(w)===!1?s.renderbufferStorageMultisample(s.RENDERBUFFER,ut,Ie,w.width,w.height):ct(w)?d.renderbufferStorageMultisampleEXT(s.RENDERBUFFER,ut,Ie,w.width,w.height):s.renderbufferStorage(s.RENDERBUFFER,Ie,w.width,w.height)}}s.bindRenderbuffer(s.RENDERBUFFER,null)}function we(D,w){if(w&&w.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(t.bindFramebuffer(s.FRAMEBUFFER,D),!(w.depthTexture&&w.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");const pe=r.get(w.depthTexture);pe.__renderTarget=w,(!pe.__webglTexture||w.depthTexture.image.width!==w.width||w.depthTexture.image.height!==w.height)&&(w.depthTexture.image.width=w.width,w.depthTexture.image.height=w.height,w.depthTexture.needsUpdate=!0),he(w.depthTexture,0);const ge=pe.__webglTexture,ce=ht(w);if(w.depthTexture.format===Qs)ct(w)?d.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,s.DEPTH_ATTACHMENT,s.TEXTURE_2D,ge,0,ce):s.framebufferTexture2D(s.FRAMEBUFFER,s.DEPTH_ATTACHMENT,s.TEXTURE_2D,ge,0);else if(w.depthTexture.format===ro)ct(w)?d.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,s.DEPTH_STENCIL_ATTACHMENT,s.TEXTURE_2D,ge,0,ce):s.framebufferTexture2D(s.FRAMEBUFFER,s.DEPTH_STENCIL_ATTACHMENT,s.TEXTURE_2D,ge,0);else throw new Error("Unknown depthTexture format")}function Ue(D){const w=r.get(D),K=D.isWebGLCubeRenderTarget===!0;if(w.__boundDepthTexture!==D.depthTexture){const pe=D.depthTexture;if(w.__depthDisposeCallback&&w.__depthDisposeCallback(),pe){const ge=()=>{delete w.__boundDepthTexture,delete w.__depthDisposeCallback,pe.removeEventListener("dispose",ge)};pe.addEventListener("dispose",ge),w.__depthDisposeCallback=ge}w.__boundDepthTexture=pe}if(D.depthTexture&&!w.__autoAllocateDepthBuffer){if(K)throw new Error("target.depthTexture not supported in Cube render targets");we(w.__webglFramebuffer,D)}else if(K){w.__webglDepthbuffer=[];for(let pe=0;pe<6;pe++)if(t.bindFramebuffer(s.FRAMEBUFFER,w.__webglFramebuffer[pe]),w.__webglDepthbuffer[pe]===void 0)w.__webglDepthbuffer[pe]=s.createRenderbuffer(),ve(w.__webglDepthbuffer[pe],D,!1);else{const ge=D.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,ce=w.__webglDepthbuffer[pe];s.bindRenderbuffer(s.RENDERBUFFER,ce),s.framebufferRenderbuffer(s.FRAMEBUFFER,ge,s.RENDERBUFFER,ce)}}else if(t.bindFramebuffer(s.FRAMEBUFFER,w.__webglFramebuffer),w.__webglDepthbuffer===void 0)w.__webglDepthbuffer=s.createRenderbuffer(),ve(w.__webglDepthbuffer,D,!1);else{const pe=D.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,ge=w.__webglDepthbuffer;s.bindRenderbuffer(s.RENDERBUFFER,ge),s.framebufferRenderbuffer(s.FRAMEBUFFER,pe,s.RENDERBUFFER,ge)}t.bindFramebuffer(s.FRAMEBUFFER,null)}function Ze(D,w,K){const pe=r.get(D);w!==void 0&&Me(pe.__webglFramebuffer,D,D.texture,s.COLOR_ATTACHMENT0,s.TEXTURE_2D,0),K!==void 0&&Ue(D)}function Ct(D){const w=D.texture,K=r.get(D),pe=r.get(w);D.addEventListener("dispose",F);const ge=D.textures,ce=D.isWebGLCubeRenderTarget===!0,He=ge.length>1;if(He||(pe.__webglTexture===void 0&&(pe.__webglTexture=s.createTexture()),pe.__version=w.version,c.memory.textures++),ce){K.__webglFramebuffer=[];for(let Ae=0;Ae<6;Ae++)if(w.mipmaps&&w.mipmaps.length>0){K.__webglFramebuffer[Ae]=[];for(let Ie=0;Ie<w.mipmaps.length;Ie++)K.__webglFramebuffer[Ae][Ie]=s.createFramebuffer()}else K.__webglFramebuffer[Ae]=s.createFramebuffer()}else{if(w.mipmaps&&w.mipmaps.length>0){K.__webglFramebuffer=[];for(let Ae=0;Ae<w.mipmaps.length;Ae++)K.__webglFramebuffer[Ae]=s.createFramebuffer()}else K.__webglFramebuffer=s.createFramebuffer();if(He)for(let Ae=0,Ie=ge.length;Ae<Ie;Ae++){const ut=r.get(ge[Ae]);ut.__webglTexture===void 0&&(ut.__webglTexture=s.createTexture(),c.memory.textures++)}if(D.samples>0&&ct(D)===!1){K.__webglMultisampledFramebuffer=s.createFramebuffer(),K.__webglColorRenderbuffer=[],t.bindFramebuffer(s.FRAMEBUFFER,K.__webglMultisampledFramebuffer);for(let Ae=0;Ae<ge.length;Ae++){const Ie=ge[Ae];K.__webglColorRenderbuffer[Ae]=s.createRenderbuffer(),s.bindRenderbuffer(s.RENDERBUFFER,K.__webglColorRenderbuffer[Ae]);const ut=l.convert(Ie.format,Ie.colorSpace),ye=l.convert(Ie.type),Fe=L(Ie.internalFormat,ut,ye,Ie.colorSpace,D.isXRRenderTarget===!0),Qe=ht(D);s.renderbufferStorageMultisample(s.RENDERBUFFER,Qe,Fe,D.width,D.height),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+Ae,s.RENDERBUFFER,K.__webglColorRenderbuffer[Ae])}s.bindRenderbuffer(s.RENDERBUFFER,null),D.depthBuffer&&(K.__webglDepthRenderbuffer=s.createRenderbuffer(),ve(K.__webglDepthRenderbuffer,D,!0)),t.bindFramebuffer(s.FRAMEBUFFER,null)}}if(ce){t.bindTexture(s.TEXTURE_CUBE_MAP,pe.__webglTexture),ne(s.TEXTURE_CUBE_MAP,w);for(let Ae=0;Ae<6;Ae++)if(w.mipmaps&&w.mipmaps.length>0)for(let Ie=0;Ie<w.mipmaps.length;Ie++)Me(K.__webglFramebuffer[Ae][Ie],D,w,s.COLOR_ATTACHMENT0,s.TEXTURE_CUBE_MAP_POSITIVE_X+Ae,Ie);else Me(K.__webglFramebuffer[Ae],D,w,s.COLOR_ATTACHMENT0,s.TEXTURE_CUBE_MAP_POSITIVE_X+Ae,0);v(w)&&m(s.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(He){for(let Ae=0,Ie=ge.length;Ae<Ie;Ae++){const ut=ge[Ae],ye=r.get(ut);t.bindTexture(s.TEXTURE_2D,ye.__webglTexture),ne(s.TEXTURE_2D,ut),Me(K.__webglFramebuffer,D,ut,s.COLOR_ATTACHMENT0+Ae,s.TEXTURE_2D,0),v(ut)&&m(s.TEXTURE_2D)}t.unbindTexture()}else{let Ae=s.TEXTURE_2D;if((D.isWebGL3DRenderTarget||D.isWebGLArrayRenderTarget)&&(Ae=D.isWebGL3DRenderTarget?s.TEXTURE_3D:s.TEXTURE_2D_ARRAY),t.bindTexture(Ae,pe.__webglTexture),ne(Ae,w),w.mipmaps&&w.mipmaps.length>0)for(let Ie=0;Ie<w.mipmaps.length;Ie++)Me(K.__webglFramebuffer[Ie],D,w,s.COLOR_ATTACHMENT0,Ae,Ie);else Me(K.__webglFramebuffer,D,w,s.COLOR_ATTACHMENT0,Ae,0);v(w)&&m(Ae),t.unbindTexture()}D.depthBuffer&&Ue(D)}function mt(D){const w=D.textures;for(let K=0,pe=w.length;K<pe;K++){const ge=w[K];if(v(ge)){const ce=P(D),He=r.get(ge).__webglTexture;t.bindTexture(ce,He),m(ce),t.unbindTexture()}}}const Ut=[],Y=[];function _n(D){if(D.samples>0){if(ct(D)===!1){const w=D.textures,K=D.width,pe=D.height;let ge=s.COLOR_BUFFER_BIT;const ce=D.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,He=r.get(D),Ae=w.length>1;if(Ae)for(let Ie=0;Ie<w.length;Ie++)t.bindFramebuffer(s.FRAMEBUFFER,He.__webglMultisampledFramebuffer),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+Ie,s.RENDERBUFFER,null),t.bindFramebuffer(s.FRAMEBUFFER,He.__webglFramebuffer),s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0+Ie,s.TEXTURE_2D,null,0);t.bindFramebuffer(s.READ_FRAMEBUFFER,He.__webglMultisampledFramebuffer),t.bindFramebuffer(s.DRAW_FRAMEBUFFER,He.__webglFramebuffer);for(let Ie=0;Ie<w.length;Ie++){if(D.resolveDepthBuffer&&(D.depthBuffer&&(ge|=s.DEPTH_BUFFER_BIT),D.stencilBuffer&&D.resolveStencilBuffer&&(ge|=s.STENCIL_BUFFER_BIT)),Ae){s.framebufferRenderbuffer(s.READ_FRAMEBUFFER,s.COLOR_ATTACHMENT0,s.RENDERBUFFER,He.__webglColorRenderbuffer[Ie]);const ut=r.get(w[Ie]).__webglTexture;s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0,s.TEXTURE_2D,ut,0)}s.blitFramebuffer(0,0,K,pe,0,0,K,pe,ge,s.NEAREST),h===!0&&(Ut.length=0,Y.length=0,Ut.push(s.COLOR_ATTACHMENT0+Ie),D.depthBuffer&&D.resolveDepthBuffer===!1&&(Ut.push(ce),Y.push(ce),s.invalidateFramebuffer(s.DRAW_FRAMEBUFFER,Y)),s.invalidateFramebuffer(s.READ_FRAMEBUFFER,Ut))}if(t.bindFramebuffer(s.READ_FRAMEBUFFER,null),t.bindFramebuffer(s.DRAW_FRAMEBUFFER,null),Ae)for(let Ie=0;Ie<w.length;Ie++){t.bindFramebuffer(s.FRAMEBUFFER,He.__webglMultisampledFramebuffer),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+Ie,s.RENDERBUFFER,He.__webglColorRenderbuffer[Ie]);const ut=r.get(w[Ie]).__webglTexture;t.bindFramebuffer(s.FRAMEBUFFER,He.__webglFramebuffer),s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0+Ie,s.TEXTURE_2D,ut,0)}t.bindFramebuffer(s.DRAW_FRAMEBUFFER,He.__webglMultisampledFramebuffer)}else if(D.depthBuffer&&D.resolveDepthBuffer===!1&&h){const w=D.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT;s.invalidateFramebuffer(s.DRAW_FRAMEBUFFER,[w])}}}function ht(D){return Math.min(a.maxSamples,D.samples)}function ct(D){const w=r.get(D);return D.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&w.__useRenderToTexture!==!1}function qe(D){const w=c.render.frame;_.get(D)!==w&&(_.set(D,w),D.update())}function wt(D,w){const K=D.colorSpace,pe=D.format,ge=D.type;return D.isCompressedTexture===!0||D.isVideoTexture===!0||K!==ao&&K!==Mr&&(yt.getTransfer(K)===Rt?(pe!==hi||ge!==ji)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",K)),w}function Ye(D){return typeof HTMLImageElement<"u"&&D instanceof HTMLImageElement?(g.width=D.naturalWidth||D.width,g.height=D.naturalHeight||D.height):typeof VideoFrame<"u"&&D instanceof VideoFrame?(g.width=D.displayWidth,g.height=D.displayHeight):(g.width=D.width,g.height=D.height),g}this.allocateTextureUnit=te,this.resetTextureUnits=se,this.setTexture2D=he,this.setTexture2DArray=oe,this.setTexture3D=le,this.setTextureCube=k,this.rebindTextures=Ze,this.setupRenderTarget=Ct,this.updateRenderTargetMipmap=mt,this.updateMultisampleRenderTarget=_n,this.setupDepthRenderbuffer=Ue,this.setupFrameBufferTexture=Me,this.useMultisampledRTT=ct}function DE(s,e){function t(r,a=Mr){let l;const c=yt.getTransfer(a);if(r===ji)return s.UNSIGNED_BYTE;if(r===fd)return s.UNSIGNED_SHORT_4_4_4_4;if(r===dd)return s.UNSIGNED_SHORT_5_5_5_1;if(r===yg)return s.UNSIGNED_INT_5_9_9_9_REV;if(r===vg)return s.BYTE;if(r===xg)return s.SHORT;if(r===Zo)return s.UNSIGNED_SHORT;if(r===cd)return s.INT;if(r===es)return s.UNSIGNED_INT;if(r===Wi)return s.FLOAT;if(r===ea)return s.HALF_FLOAT;if(r===Sg)return s.ALPHA;if(r===Mg)return s.RGB;if(r===hi)return s.RGBA;if(r===Eg)return s.LUMINANCE;if(r===Tg)return s.LUMINANCE_ALPHA;if(r===Qs)return s.DEPTH_COMPONENT;if(r===ro)return s.DEPTH_STENCIL;if(r===wg)return s.RED;if(r===hd)return s.RED_INTEGER;if(r===Ag)return s.RG;if(r===pd)return s.RG_INTEGER;if(r===md)return s.RGBA_INTEGER;if(r===kl||r===Bl||r===Hl||r===Vl)if(c===Rt)if(l=e.get("WEBGL_compressed_texture_s3tc_srgb"),l!==null){if(r===kl)return l.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(r===Bl)return l.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(r===Hl)return l.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(r===Vl)return l.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(l=e.get("WEBGL_compressed_texture_s3tc"),l!==null){if(r===kl)return l.COMPRESSED_RGB_S3TC_DXT1_EXT;if(r===Bl)return l.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(r===Hl)return l.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(r===Vl)return l.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(r===Df||r===Uf||r===If||r===Nf)if(l=e.get("WEBGL_compressed_texture_pvrtc"),l!==null){if(r===Df)return l.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(r===Uf)return l.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(r===If)return l.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(r===Nf)return l.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(r===Ff||r===Of||r===zf)if(l=e.get("WEBGL_compressed_texture_etc"),l!==null){if(r===Ff||r===Of)return c===Rt?l.COMPRESSED_SRGB8_ETC2:l.COMPRESSED_RGB8_ETC2;if(r===zf)return c===Rt?l.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:l.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(r===kf||r===Bf||r===Hf||r===Vf||r===Gf||r===Wf||r===Xf||r===Yf||r===jf||r===qf||r===$f||r===Kf||r===Zf||r===Qf)if(l=e.get("WEBGL_compressed_texture_astc"),l!==null){if(r===kf)return c===Rt?l.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:l.COMPRESSED_RGBA_ASTC_4x4_KHR;if(r===Bf)return c===Rt?l.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:l.COMPRESSED_RGBA_ASTC_5x4_KHR;if(r===Hf)return c===Rt?l.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:l.COMPRESSED_RGBA_ASTC_5x5_KHR;if(r===Vf)return c===Rt?l.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:l.COMPRESSED_RGBA_ASTC_6x5_KHR;if(r===Gf)return c===Rt?l.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:l.COMPRESSED_RGBA_ASTC_6x6_KHR;if(r===Wf)return c===Rt?l.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:l.COMPRESSED_RGBA_ASTC_8x5_KHR;if(r===Xf)return c===Rt?l.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:l.COMPRESSED_RGBA_ASTC_8x6_KHR;if(r===Yf)return c===Rt?l.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:l.COMPRESSED_RGBA_ASTC_8x8_KHR;if(r===jf)return c===Rt?l.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:l.COMPRESSED_RGBA_ASTC_10x5_KHR;if(r===qf)return c===Rt?l.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:l.COMPRESSED_RGBA_ASTC_10x6_KHR;if(r===$f)return c===Rt?l.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:l.COMPRESSED_RGBA_ASTC_10x8_KHR;if(r===Kf)return c===Rt?l.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:l.COMPRESSED_RGBA_ASTC_10x10_KHR;if(r===Zf)return c===Rt?l.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:l.COMPRESSED_RGBA_ASTC_12x10_KHR;if(r===Qf)return c===Rt?l.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:l.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(r===Gl||r===Jf||r===ed)if(l=e.get("EXT_texture_compression_bptc"),l!==null){if(r===Gl)return c===Rt?l.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:l.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(r===Jf)return l.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(r===ed)return l.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(r===Cg||r===td||r===nd||r===id)if(l=e.get("EXT_texture_compression_rgtc"),l!==null){if(r===Gl)return l.COMPRESSED_RED_RGTC1_EXT;if(r===td)return l.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(r===nd)return l.COMPRESSED_RED_GREEN_RGTC2_EXT;if(r===id)return l.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return r===io?s.UNSIGNED_INT_24_8:s[r]!==void 0?s[r]:null}return{convert:t}}class UE extends ei{constructor(e=[]){super(),this.isArrayCamera=!0,this.cameras=e}}class $s extends Yt{constructor(){super(),this.isGroup=!0,this.type="Group"}}const IE={type:"move"};class hf{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new $s,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new $s,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new G,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new G),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new $s,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new G,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new G),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const t=this._hand;if(t)for(const r of e.hand.values())this._getHandJoint(t,r)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,r){let a=null,l=null,c=null;const d=this._targetRay,h=this._grip,g=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(g&&e.hand){c=!0;for(const T of e.hand.values()){const v=t.getJointPose(T,r),m=this._getHandJoint(g,T);v!==null&&(m.matrix.fromArray(v.transform.matrix),m.matrix.decompose(m.position,m.rotation,m.scale),m.matrixWorldNeedsUpdate=!0,m.jointRadius=v.radius),m.visible=v!==null}const _=g.joints["index-finger-tip"],x=g.joints["thumb-tip"],y=_.position.distanceTo(x.position),S=.02,E=.005;g.inputState.pinching&&y>S+E?(g.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!g.inputState.pinching&&y<=S-E&&(g.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else h!==null&&e.gripSpace&&(l=t.getPose(e.gripSpace,r),l!==null&&(h.matrix.fromArray(l.transform.matrix),h.matrix.decompose(h.position,h.rotation,h.scale),h.matrixWorldNeedsUpdate=!0,l.linearVelocity?(h.hasLinearVelocity=!0,h.linearVelocity.copy(l.linearVelocity)):h.hasLinearVelocity=!1,l.angularVelocity?(h.hasAngularVelocity=!0,h.angularVelocity.copy(l.angularVelocity)):h.hasAngularVelocity=!1));d!==null&&(a=t.getPose(e.targetRaySpace,r),a===null&&l!==null&&(a=l),a!==null&&(d.matrix.fromArray(a.transform.matrix),d.matrix.decompose(d.position,d.rotation,d.scale),d.matrixWorldNeedsUpdate=!0,a.linearVelocity?(d.hasLinearVelocity=!0,d.linearVelocity.copy(a.linearVelocity)):d.hasLinearVelocity=!1,a.angularVelocity?(d.hasAngularVelocity=!0,d.angularVelocity.copy(a.angularVelocity)):d.hasAngularVelocity=!1,this.dispatchEvent(IE)))}return d!==null&&(d.visible=a!==null),h!==null&&(h.visible=l!==null),g!==null&&(g.visible=c!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){const r=new $s;r.matrixAutoUpdate=!1,r.visible=!1,e.joints[t.jointName]=r,e.add(r)}return e.joints[t.jointName]}}const NE=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,FE=`
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

}`;class OE{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t,r){if(this.texture===null){const a=new gn,l=e.properties.get(a);l.__webglTexture=t.texture,(t.depthNear!=r.depthNear||t.depthFar!=r.depthFar)&&(this.depthNear=t.depthNear,this.depthFar=t.depthFar),this.texture=a}}getMesh(e){if(this.texture!==null&&this.mesh===null){const t=e.cameras[0].viewport,r=new Cr({vertexShader:NE,fragmentShader:FE,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new On(new eu(20,20),r)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class zE extends is{constructor(e,t){super();const r=this;let a=null,l=1,c=null,d="local-floor",h=1,g=null,_=null,x=null,y=null,S=null,E=null;const T=new OE,v=t.getContextAttributes();let m=null,P=null;const L=[],R=[],j=new je;let I=null;const F=new ei;F.viewport=new Vt;const H=new ei;H.viewport=new Vt;const b=[F,H],A=new UE;let z=null,se=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(Z){let ue=L[Z];return ue===void 0&&(ue=new hf,L[Z]=ue),ue.getTargetRaySpace()},this.getControllerGrip=function(Z){let ue=L[Z];return ue===void 0&&(ue=new hf,L[Z]=ue),ue.getGripSpace()},this.getHand=function(Z){let ue=L[Z];return ue===void 0&&(ue=new hf,L[Z]=ue),ue.getHandSpace()};function te(Z){const ue=R.indexOf(Z.inputSource);if(ue===-1)return;const Me=L[ue];Me!==void 0&&(Me.update(Z.inputSource,Z.frame,g||c),Me.dispatchEvent({type:Z.type,data:Z.inputSource}))}function fe(){a.removeEventListener("select",te),a.removeEventListener("selectstart",te),a.removeEventListener("selectend",te),a.removeEventListener("squeeze",te),a.removeEventListener("squeezestart",te),a.removeEventListener("squeezeend",te),a.removeEventListener("end",fe),a.removeEventListener("inputsourceschange",he);for(let Z=0;Z<L.length;Z++){const ue=R[Z];ue!==null&&(R[Z]=null,L[Z].disconnect(ue))}z=null,se=null,T.reset(),e.setRenderTarget(m),S=null,y=null,x=null,a=null,P=null,De.stop(),r.isPresenting=!1,e.setPixelRatio(I),e.setSize(j.width,j.height,!1),r.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(Z){l=Z,r.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(Z){d=Z,r.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return g||c},this.setReferenceSpace=function(Z){g=Z},this.getBaseLayer=function(){return y!==null?y:S},this.getBinding=function(){return x},this.getFrame=function(){return E},this.getSession=function(){return a},this.setSession=async function(Z){if(a=Z,a!==null){if(m=e.getRenderTarget(),a.addEventListener("select",te),a.addEventListener("selectstart",te),a.addEventListener("selectend",te),a.addEventListener("squeeze",te),a.addEventListener("squeezestart",te),a.addEventListener("squeezeend",te),a.addEventListener("end",fe),a.addEventListener("inputsourceschange",he),v.xrCompatible!==!0&&await t.makeXRCompatible(),I=e.getPixelRatio(),e.getSize(j),a.renderState.layers===void 0){const ue={antialias:v.antialias,alpha:!0,depth:v.depth,stencil:v.stencil,framebufferScaleFactor:l};S=new XRWebGLLayer(a,t,ue),a.updateRenderState({baseLayer:S}),e.setPixelRatio(1),e.setSize(S.framebufferWidth,S.framebufferHeight,!1),P=new ts(S.framebufferWidth,S.framebufferHeight,{format:hi,type:ji,colorSpace:e.outputColorSpace,stencilBuffer:v.stencil})}else{let ue=null,Me=null,ve=null;v.depth&&(ve=v.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,ue=v.stencil?ro:Qs,Me=v.stencil?io:es);const we={colorFormat:t.RGBA8,depthFormat:ve,scaleFactor:l};x=new XRWebGLBinding(a,t),y=x.createProjectionLayer(we),a.updateRenderState({layers:[y]}),e.setPixelRatio(1),e.setSize(y.textureWidth,y.textureHeight,!1),P=new ts(y.textureWidth,y.textureHeight,{format:hi,type:ji,depthTexture:new Vg(y.textureWidth,y.textureHeight,Me,void 0,void 0,void 0,void 0,void 0,void 0,ue),stencilBuffer:v.stencil,colorSpace:e.outputColorSpace,samples:v.antialias?4:0,resolveDepthBuffer:y.ignoreDepthValues===!1})}P.isXRRenderTarget=!0,this.setFoveation(h),g=null,c=await a.requestReferenceSpace(d),De.setContext(a),De.start(),r.isPresenting=!0,r.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(a!==null)return a.environmentBlendMode},this.getDepthTexture=function(){return T.getDepthTexture()};function he(Z){for(let ue=0;ue<Z.removed.length;ue++){const Me=Z.removed[ue],ve=R.indexOf(Me);ve>=0&&(R[ve]=null,L[ve].disconnect(Me))}for(let ue=0;ue<Z.added.length;ue++){const Me=Z.added[ue];let ve=R.indexOf(Me);if(ve===-1){for(let Ue=0;Ue<L.length;Ue++)if(Ue>=R.length){R.push(Me),ve=Ue;break}else if(R[Ue]===null){R[Ue]=Me,ve=Ue;break}if(ve===-1)break}const we=L[ve];we&&we.connect(Me)}}const oe=new G,le=new G;function k(Z,ue,Me){oe.setFromMatrixPosition(ue.matrixWorld),le.setFromMatrixPosition(Me.matrixWorld);const ve=oe.distanceTo(le),we=ue.projectionMatrix.elements,Ue=Me.projectionMatrix.elements,Ze=we[14]/(we[10]-1),Ct=we[14]/(we[10]+1),mt=(we[9]+1)/we[5],Ut=(we[9]-1)/we[5],Y=(we[8]-1)/we[0],_n=(Ue[8]+1)/Ue[0],ht=Ze*Y,ct=Ze*_n,qe=ve/(-Y+_n),wt=qe*-Y;if(ue.matrixWorld.decompose(Z.position,Z.quaternion,Z.scale),Z.translateX(wt),Z.translateZ(qe),Z.matrixWorld.compose(Z.position,Z.quaternion,Z.scale),Z.matrixWorldInverse.copy(Z.matrixWorld).invert(),we[10]===-1)Z.projectionMatrix.copy(ue.projectionMatrix),Z.projectionMatrixInverse.copy(ue.projectionMatrixInverse);else{const Ye=Ze+qe,D=Ct+qe,w=ht-wt,K=ct+(ve-wt),pe=mt*Ct/D*Ye,ge=Ut*Ct/D*Ye;Z.projectionMatrix.makePerspective(w,K,pe,ge,Ye,D),Z.projectionMatrixInverse.copy(Z.projectionMatrix).invert()}}function ae(Z,ue){ue===null?Z.matrixWorld.copy(Z.matrix):Z.matrixWorld.multiplyMatrices(ue.matrixWorld,Z.matrix),Z.matrixWorldInverse.copy(Z.matrixWorld).invert()}this.updateCamera=function(Z){if(a===null)return;let ue=Z.near,Me=Z.far;T.texture!==null&&(T.depthNear>0&&(ue=T.depthNear),T.depthFar>0&&(Me=T.depthFar)),A.near=H.near=F.near=ue,A.far=H.far=F.far=Me,(z!==A.near||se!==A.far)&&(a.updateRenderState({depthNear:A.near,depthFar:A.far}),z=A.near,se=A.far),F.layers.mask=Z.layers.mask|2,H.layers.mask=Z.layers.mask|4,A.layers.mask=F.layers.mask|H.layers.mask;const ve=Z.parent,we=A.cameras;ae(A,ve);for(let Ue=0;Ue<we.length;Ue++)ae(we[Ue],ve);we.length===2?k(A,F,H):A.projectionMatrix.copy(F.projectionMatrix),re(Z,A,ve)};function re(Z,ue,Me){Me===null?Z.matrix.copy(ue.matrixWorld):(Z.matrix.copy(Me.matrixWorld),Z.matrix.invert(),Z.matrix.multiply(ue.matrixWorld)),Z.matrix.decompose(Z.position,Z.quaternion,Z.scale),Z.updateMatrixWorld(!0),Z.projectionMatrix.copy(ue.projectionMatrix),Z.projectionMatrixInverse.copy(ue.projectionMatrixInverse),Z.isPerspectiveCamera&&(Z.fov=sd*2*Math.atan(1/Z.projectionMatrix.elements[5]),Z.zoom=1)}this.getCamera=function(){return A},this.getFoveation=function(){if(!(y===null&&S===null))return h},this.setFoveation=function(Z){h=Z,y!==null&&(y.fixedFoveation=Z),S!==null&&S.fixedFoveation!==void 0&&(S.fixedFoveation=Z)},this.hasDepthSensing=function(){return T.texture!==null},this.getDepthSensingMesh=function(){return T.getMesh(A)};let N=null;function ne(Z,ue){if(_=ue.getViewerPose(g||c),E=ue,_!==null){const Me=_.views;S!==null&&(e.setRenderTargetFramebuffer(P,S.framebuffer),e.setRenderTarget(P));let ve=!1;Me.length!==A.cameras.length&&(A.cameras.length=0,ve=!0);for(let Ue=0;Ue<Me.length;Ue++){const Ze=Me[Ue];let Ct=null;if(S!==null)Ct=S.getViewport(Ze);else{const Ut=x.getViewSubImage(y,Ze);Ct=Ut.viewport,Ue===0&&(e.setRenderTargetTextures(P,Ut.colorTexture,y.ignoreDepthValues?void 0:Ut.depthStencilTexture),e.setRenderTarget(P))}let mt=b[Ue];mt===void 0&&(mt=new ei,mt.layers.enable(Ue),mt.viewport=new Vt,b[Ue]=mt),mt.matrix.fromArray(Ze.transform.matrix),mt.matrix.decompose(mt.position,mt.quaternion,mt.scale),mt.projectionMatrix.fromArray(Ze.projectionMatrix),mt.projectionMatrixInverse.copy(mt.projectionMatrix).invert(),mt.viewport.set(Ct.x,Ct.y,Ct.width,Ct.height),Ue===0&&(A.matrix.copy(mt.matrix),A.matrix.decompose(A.position,A.quaternion,A.scale)),ve===!0&&A.cameras.push(mt)}const we=a.enabledFeatures;if(we&&we.includes("depth-sensing")){const Ue=x.getDepthInformation(Me[0]);Ue&&Ue.isValid&&Ue.texture&&T.init(e,Ue,a.renderState)}}for(let Me=0;Me<L.length;Me++){const ve=R[Me],we=L[Me];ve!==null&&we!==void 0&&we.update(ve,ue,g||c)}N&&N(Z,ue),ue.detectedPlanes&&r.dispatchEvent({type:"planesdetected",data:ue}),E=null}const De=new Bg;De.setAnimationLoop(ne),this.setAnimationLoop=function(Z){N=Z},this.dispose=function(){}}}const qr=new Ai,kE=new Lt;function BE(s,e){function t(v,m){v.matrixAutoUpdate===!0&&v.updateMatrix(),m.value.copy(v.matrix)}function r(v,m){m.color.getRGB(v.fogColor.value,Og(s)),m.isFog?(v.fogNear.value=m.near,v.fogFar.value=m.far):m.isFogExp2&&(v.fogDensity.value=m.density)}function a(v,m,P,L,R){m.isMeshBasicMaterial||m.isMeshLambertMaterial?l(v,m):m.isMeshToonMaterial?(l(v,m),x(v,m)):m.isMeshPhongMaterial?(l(v,m),_(v,m)):m.isMeshStandardMaterial?(l(v,m),y(v,m),m.isMeshPhysicalMaterial&&S(v,m,R)):m.isMeshMatcapMaterial?(l(v,m),E(v,m)):m.isMeshDepthMaterial?l(v,m):m.isMeshDistanceMaterial?(l(v,m),T(v,m)):m.isMeshNormalMaterial?l(v,m):m.isLineBasicMaterial?(c(v,m),m.isLineDashedMaterial&&d(v,m)):m.isPointsMaterial?h(v,m,P,L):m.isSpriteMaterial?g(v,m):m.isShadowMaterial?(v.color.value.copy(m.color),v.opacity.value=m.opacity):m.isShaderMaterial&&(m.uniformsNeedUpdate=!1)}function l(v,m){v.opacity.value=m.opacity,m.color&&v.diffuse.value.copy(m.color),m.emissive&&v.emissive.value.copy(m.emissive).multiplyScalar(m.emissiveIntensity),m.map&&(v.map.value=m.map,t(m.map,v.mapTransform)),m.alphaMap&&(v.alphaMap.value=m.alphaMap,t(m.alphaMap,v.alphaMapTransform)),m.bumpMap&&(v.bumpMap.value=m.bumpMap,t(m.bumpMap,v.bumpMapTransform),v.bumpScale.value=m.bumpScale,m.side===An&&(v.bumpScale.value*=-1)),m.normalMap&&(v.normalMap.value=m.normalMap,t(m.normalMap,v.normalMapTransform),v.normalScale.value.copy(m.normalScale),m.side===An&&v.normalScale.value.negate()),m.displacementMap&&(v.displacementMap.value=m.displacementMap,t(m.displacementMap,v.displacementMapTransform),v.displacementScale.value=m.displacementScale,v.displacementBias.value=m.displacementBias),m.emissiveMap&&(v.emissiveMap.value=m.emissiveMap,t(m.emissiveMap,v.emissiveMapTransform)),m.specularMap&&(v.specularMap.value=m.specularMap,t(m.specularMap,v.specularMapTransform)),m.alphaTest>0&&(v.alphaTest.value=m.alphaTest);const P=e.get(m),L=P.envMap,R=P.envMapRotation;L&&(v.envMap.value=L,qr.copy(R),qr.x*=-1,qr.y*=-1,qr.z*=-1,L.isCubeTexture&&L.isRenderTargetTexture===!1&&(qr.y*=-1,qr.z*=-1),v.envMapRotation.value.setFromMatrix4(kE.makeRotationFromEuler(qr)),v.flipEnvMap.value=L.isCubeTexture&&L.isRenderTargetTexture===!1?-1:1,v.reflectivity.value=m.reflectivity,v.ior.value=m.ior,v.refractionRatio.value=m.refractionRatio),m.lightMap&&(v.lightMap.value=m.lightMap,v.lightMapIntensity.value=m.lightMapIntensity,t(m.lightMap,v.lightMapTransform)),m.aoMap&&(v.aoMap.value=m.aoMap,v.aoMapIntensity.value=m.aoMapIntensity,t(m.aoMap,v.aoMapTransform))}function c(v,m){v.diffuse.value.copy(m.color),v.opacity.value=m.opacity,m.map&&(v.map.value=m.map,t(m.map,v.mapTransform))}function d(v,m){v.dashSize.value=m.dashSize,v.totalSize.value=m.dashSize+m.gapSize,v.scale.value=m.scale}function h(v,m,P,L){v.diffuse.value.copy(m.color),v.opacity.value=m.opacity,v.size.value=m.size*P,v.scale.value=L*.5,m.map&&(v.map.value=m.map,t(m.map,v.uvTransform)),m.alphaMap&&(v.alphaMap.value=m.alphaMap,t(m.alphaMap,v.alphaMapTransform)),m.alphaTest>0&&(v.alphaTest.value=m.alphaTest)}function g(v,m){v.diffuse.value.copy(m.color),v.opacity.value=m.opacity,v.rotation.value=m.rotation,m.map&&(v.map.value=m.map,t(m.map,v.mapTransform)),m.alphaMap&&(v.alphaMap.value=m.alphaMap,t(m.alphaMap,v.alphaMapTransform)),m.alphaTest>0&&(v.alphaTest.value=m.alphaTest)}function _(v,m){v.specular.value.copy(m.specular),v.shininess.value=Math.max(m.shininess,1e-4)}function x(v,m){m.gradientMap&&(v.gradientMap.value=m.gradientMap)}function y(v,m){v.metalness.value=m.metalness,m.metalnessMap&&(v.metalnessMap.value=m.metalnessMap,t(m.metalnessMap,v.metalnessMapTransform)),v.roughness.value=m.roughness,m.roughnessMap&&(v.roughnessMap.value=m.roughnessMap,t(m.roughnessMap,v.roughnessMapTransform)),m.envMap&&(v.envMapIntensity.value=m.envMapIntensity)}function S(v,m,P){v.ior.value=m.ior,m.sheen>0&&(v.sheenColor.value.copy(m.sheenColor).multiplyScalar(m.sheen),v.sheenRoughness.value=m.sheenRoughness,m.sheenColorMap&&(v.sheenColorMap.value=m.sheenColorMap,t(m.sheenColorMap,v.sheenColorMapTransform)),m.sheenRoughnessMap&&(v.sheenRoughnessMap.value=m.sheenRoughnessMap,t(m.sheenRoughnessMap,v.sheenRoughnessMapTransform))),m.clearcoat>0&&(v.clearcoat.value=m.clearcoat,v.clearcoatRoughness.value=m.clearcoatRoughness,m.clearcoatMap&&(v.clearcoatMap.value=m.clearcoatMap,t(m.clearcoatMap,v.clearcoatMapTransform)),m.clearcoatRoughnessMap&&(v.clearcoatRoughnessMap.value=m.clearcoatRoughnessMap,t(m.clearcoatRoughnessMap,v.clearcoatRoughnessMapTransform)),m.clearcoatNormalMap&&(v.clearcoatNormalMap.value=m.clearcoatNormalMap,t(m.clearcoatNormalMap,v.clearcoatNormalMapTransform),v.clearcoatNormalScale.value.copy(m.clearcoatNormalScale),m.side===An&&v.clearcoatNormalScale.value.negate())),m.dispersion>0&&(v.dispersion.value=m.dispersion),m.iridescence>0&&(v.iridescence.value=m.iridescence,v.iridescenceIOR.value=m.iridescenceIOR,v.iridescenceThicknessMinimum.value=m.iridescenceThicknessRange[0],v.iridescenceThicknessMaximum.value=m.iridescenceThicknessRange[1],m.iridescenceMap&&(v.iridescenceMap.value=m.iridescenceMap,t(m.iridescenceMap,v.iridescenceMapTransform)),m.iridescenceThicknessMap&&(v.iridescenceThicknessMap.value=m.iridescenceThicknessMap,t(m.iridescenceThicknessMap,v.iridescenceThicknessMapTransform))),m.transmission>0&&(v.transmission.value=m.transmission,v.transmissionSamplerMap.value=P.texture,v.transmissionSamplerSize.value.set(P.width,P.height),m.transmissionMap&&(v.transmissionMap.value=m.transmissionMap,t(m.transmissionMap,v.transmissionMapTransform)),v.thickness.value=m.thickness,m.thicknessMap&&(v.thicknessMap.value=m.thicknessMap,t(m.thicknessMap,v.thicknessMapTransform)),v.attenuationDistance.value=m.attenuationDistance,v.attenuationColor.value.copy(m.attenuationColor)),m.anisotropy>0&&(v.anisotropyVector.value.set(m.anisotropy*Math.cos(m.anisotropyRotation),m.anisotropy*Math.sin(m.anisotropyRotation)),m.anisotropyMap&&(v.anisotropyMap.value=m.anisotropyMap,t(m.anisotropyMap,v.anisotropyMapTransform))),v.specularIntensity.value=m.specularIntensity,v.specularColor.value.copy(m.specularColor),m.specularColorMap&&(v.specularColorMap.value=m.specularColorMap,t(m.specularColorMap,v.specularColorMapTransform)),m.specularIntensityMap&&(v.specularIntensityMap.value=m.specularIntensityMap,t(m.specularIntensityMap,v.specularIntensityMapTransform))}function E(v,m){m.matcap&&(v.matcap.value=m.matcap)}function T(v,m){const P=e.get(m).light;v.referencePosition.value.setFromMatrixPosition(P.matrixWorld),v.nearDistance.value=P.shadow.camera.near,v.farDistance.value=P.shadow.camera.far}return{refreshFogUniforms:r,refreshMaterialUniforms:a}}function HE(s,e,t,r){let a={},l={},c=[];const d=s.getParameter(s.MAX_UNIFORM_BUFFER_BINDINGS);function h(P,L){const R=L.program;r.uniformBlockBinding(P,R)}function g(P,L){let R=a[P.id];R===void 0&&(E(P),R=_(P),a[P.id]=R,P.addEventListener("dispose",v));const j=L.program;r.updateUBOMapping(P,j);const I=e.render.frame;l[P.id]!==I&&(y(P),l[P.id]=I)}function _(P){const L=x();P.__bindingPointIndex=L;const R=s.createBuffer(),j=P.__size,I=P.usage;return s.bindBuffer(s.UNIFORM_BUFFER,R),s.bufferData(s.UNIFORM_BUFFER,j,I),s.bindBuffer(s.UNIFORM_BUFFER,null),s.bindBufferBase(s.UNIFORM_BUFFER,L,R),R}function x(){for(let P=0;P<d;P++)if(c.indexOf(P)===-1)return c.push(P),P;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function y(P){const L=a[P.id],R=P.uniforms,j=P.__cache;s.bindBuffer(s.UNIFORM_BUFFER,L);for(let I=0,F=R.length;I<F;I++){const H=Array.isArray(R[I])?R[I]:[R[I]];for(let b=0,A=H.length;b<A;b++){const z=H[b];if(S(z,I,b,j)===!0){const se=z.__offset,te=Array.isArray(z.value)?z.value:[z.value];let fe=0;for(let he=0;he<te.length;he++){const oe=te[he],le=T(oe);typeof oe=="number"||typeof oe=="boolean"?(z.__data[0]=oe,s.bufferSubData(s.UNIFORM_BUFFER,se+fe,z.__data)):oe.isMatrix3?(z.__data[0]=oe.elements[0],z.__data[1]=oe.elements[1],z.__data[2]=oe.elements[2],z.__data[3]=0,z.__data[4]=oe.elements[3],z.__data[5]=oe.elements[4],z.__data[6]=oe.elements[5],z.__data[7]=0,z.__data[8]=oe.elements[6],z.__data[9]=oe.elements[7],z.__data[10]=oe.elements[8],z.__data[11]=0):(oe.toArray(z.__data,fe),fe+=le.storage/Float32Array.BYTES_PER_ELEMENT)}s.bufferSubData(s.UNIFORM_BUFFER,se,z.__data)}}}s.bindBuffer(s.UNIFORM_BUFFER,null)}function S(P,L,R,j){const I=P.value,F=L+"_"+R;if(j[F]===void 0)return typeof I=="number"||typeof I=="boolean"?j[F]=I:j[F]=I.clone(),!0;{const H=j[F];if(typeof I=="number"||typeof I=="boolean"){if(H!==I)return j[F]=I,!0}else if(H.equals(I)===!1)return H.copy(I),!0}return!1}function E(P){const L=P.uniforms;let R=0;const j=16;for(let F=0,H=L.length;F<H;F++){const b=Array.isArray(L[F])?L[F]:[L[F]];for(let A=0,z=b.length;A<z;A++){const se=b[A],te=Array.isArray(se.value)?se.value:[se.value];for(let fe=0,he=te.length;fe<he;fe++){const oe=te[fe],le=T(oe),k=R%j,ae=k%le.boundary,re=k+ae;R+=ae,re!==0&&j-re<le.storage&&(R+=j-re),se.__data=new Float32Array(le.storage/Float32Array.BYTES_PER_ELEMENT),se.__offset=R,R+=le.storage}}}const I=R%j;return I>0&&(R+=j-I),P.__size=R,P.__cache={},this}function T(P){const L={boundary:0,storage:0};return typeof P=="number"||typeof P=="boolean"?(L.boundary=4,L.storage=4):P.isVector2?(L.boundary=8,L.storage=8):P.isVector3||P.isColor?(L.boundary=16,L.storage=12):P.isVector4?(L.boundary=16,L.storage=16):P.isMatrix3?(L.boundary=48,L.storage=48):P.isMatrix4?(L.boundary=64,L.storage=64):P.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",P),L}function v(P){const L=P.target;L.removeEventListener("dispose",v);const R=c.indexOf(L.__bindingPointIndex);c.splice(R,1),s.deleteBuffer(a[L.id]),delete a[L.id],delete l[L.id]}function m(){for(const P in a)s.deleteBuffer(a[P]);c=[],a={},l={}}return{bind:h,update:g,dispose:m}}class VE{constructor(e={}){const{canvas:t=b0(),context:r=null,depth:a=!0,stencil:l=!1,alpha:c=!1,antialias:d=!1,premultipliedAlpha:h=!0,preserveDrawingBuffer:g=!1,powerPreference:_="default",failIfMajorPerformanceCaveat:x=!1,reverseDepthBuffer:y=!1}=e;this.isWebGLRenderer=!0;let S;if(r!==null){if(typeof WebGLRenderingContext<"u"&&r instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");S=r.getContextAttributes().alpha}else S=c;const E=new Uint32Array(4),T=new Int32Array(4);let v=null,m=null;const P=[],L=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=Tn,this.toneMapping=Tr,this.toneMappingExposure=1;const R=this;let j=!1,I=0,F=0,H=null,b=-1,A=null;const z=new Vt,se=new Vt;let te=null;const fe=new pt(0);let he=0,oe=t.width,le=t.height,k=1,ae=null,re=null;const N=new Vt(0,0,oe,le),ne=new Vt(0,0,oe,le);let De=!1;const Z=new gd;let ue=!1,Me=!1;const ve=new Lt,we=new Lt,Ue=new G,Ze=new Vt,Ct={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let mt=!1;function Ut(){return H===null?k:1}let Y=r;function _n(C,W){return t.getContext(C,W)}try{const C={alpha:!0,depth:a,stencil:l,antialias:d,premultipliedAlpha:h,preserveDrawingBuffer:g,powerPreference:_,failIfMajorPerformanceCaveat:x};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${ld}`),t.addEventListener("webglcontextlost",de,!1),t.addEventListener("webglcontextrestored",be,!1),t.addEventListener("webglcontextcreationerror",Pe,!1),Y===null){const W="webgl2";if(Y=_n(W,C),Y===null)throw _n(W)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(C){throw console.error("THREE.WebGLRenderer: "+C.message),C}let ht,ct,qe,wt,Ye,D,w,K,pe,ge,ce,He,Ae,Ie,ut,ye,Fe,Qe,Je,Oe,ft,rt,Tt,V;function Ce(){ht=new jS(Y),ht.init(),rt=new DE(Y,ht),ct=new HS(Y,ht,e,rt),qe=new PE(Y,ht),ct.reverseDepthBuffer&&y&&qe.buffers.depth.setReversed(!0),wt=new KS(Y),Ye=new pE,D=new LE(Y,ht,qe,Ye,ct,rt,wt),w=new GS(R),K=new YS(R),pe=new ix(Y),Tt=new kS(Y,pe),ge=new qS(Y,pe,wt,Tt),ce=new QS(Y,ge,pe,wt),Je=new ZS(Y,ct,D),ye=new VS(Ye),He=new hE(R,w,K,ht,ct,Tt,ye),Ae=new BE(R,Ye),Ie=new gE,ut=new ME(ht),Qe=new zS(R,w,K,qe,ce,S,h),Fe=new CE(R,ce,ct),V=new HE(Y,wt,ct,qe),Oe=new BS(Y,ht,wt),ft=new $S(Y,ht,wt),wt.programs=He.programs,R.capabilities=ct,R.extensions=ht,R.properties=Ye,R.renderLists=Ie,R.shadowMap=Fe,R.state=qe,R.info=wt}Ce();const ie=new zE(R,Y);this.xr=ie,this.getContext=function(){return Y},this.getContextAttributes=function(){return Y.getContextAttributes()},this.forceContextLoss=function(){const C=ht.get("WEBGL_lose_context");C&&C.loseContext()},this.forceContextRestore=function(){const C=ht.get("WEBGL_lose_context");C&&C.restoreContext()},this.getPixelRatio=function(){return k},this.setPixelRatio=function(C){C!==void 0&&(k=C,this.setSize(oe,le,!1))},this.getSize=function(C){return C.set(oe,le)},this.setSize=function(C,W,J=!0){if(ie.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}oe=C,le=W,t.width=Math.floor(C*k),t.height=Math.floor(W*k),J===!0&&(t.style.width=C+"px",t.style.height=W+"px"),this.setViewport(0,0,C,W)},this.getDrawingBufferSize=function(C){return C.set(oe*k,le*k).floor()},this.setDrawingBufferSize=function(C,W,J){oe=C,le=W,k=J,t.width=Math.floor(C*J),t.height=Math.floor(W*J),this.setViewport(0,0,C,W)},this.getCurrentViewport=function(C){return C.copy(z)},this.getViewport=function(C){return C.copy(N)},this.setViewport=function(C,W,J,ee){C.isVector4?N.set(C.x,C.y,C.z,C.w):N.set(C,W,J,ee),qe.viewport(z.copy(N).multiplyScalar(k).round())},this.getScissor=function(C){return C.copy(ne)},this.setScissor=function(C,W,J,ee){C.isVector4?ne.set(C.x,C.y,C.z,C.w):ne.set(C,W,J,ee),qe.scissor(se.copy(ne).multiplyScalar(k).round())},this.getScissorTest=function(){return De},this.setScissorTest=function(C){qe.setScissorTest(De=C)},this.setOpaqueSort=function(C){ae=C},this.setTransparentSort=function(C){re=C},this.getClearColor=function(C){return C.copy(Qe.getClearColor())},this.setClearColor=function(){Qe.setClearColor.apply(Qe,arguments)},this.getClearAlpha=function(){return Qe.getClearAlpha()},this.setClearAlpha=function(){Qe.setClearAlpha.apply(Qe,arguments)},this.clear=function(C=!0,W=!0,J=!0){let ee=0;if(C){let X=!1;if(H!==null){const Te=H.texture.format;X=Te===md||Te===pd||Te===hd}if(X){const Te=H.texture.type,Se=Te===ji||Te===es||Te===Zo||Te===io||Te===fd||Te===dd,Ve=Qe.getClearColor(),ke=Qe.getClearAlpha(),tt=Ve.r,it=Ve.g,Ge=Ve.b;Se?(E[0]=tt,E[1]=it,E[2]=Ge,E[3]=ke,Y.clearBufferuiv(Y.COLOR,0,E)):(T[0]=tt,T[1]=it,T[2]=Ge,T[3]=ke,Y.clearBufferiv(Y.COLOR,0,T))}else ee|=Y.COLOR_BUFFER_BIT}W&&(ee|=Y.DEPTH_BUFFER_BIT),J&&(ee|=Y.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),Y.clear(ee)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",de,!1),t.removeEventListener("webglcontextrestored",be,!1),t.removeEventListener("webglcontextcreationerror",Pe,!1),Ie.dispose(),ut.dispose(),Ye.dispose(),w.dispose(),K.dispose(),ce.dispose(),Tt.dispose(),V.dispose(),He.dispose(),ie.dispose(),ie.removeEventListener("sessionstart",rs),ie.removeEventListener("sessionend",qi),Ci.stop()};function de(C){C.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),j=!0}function be(){console.log("THREE.WebGLRenderer: Context Restored."),j=!1;const C=wt.autoReset,W=Fe.enabled,J=Fe.autoUpdate,ee=Fe.needsUpdate,X=Fe.type;Ce(),wt.autoReset=C,Fe.enabled=W,Fe.autoUpdate=J,Fe.needsUpdate=ee,Fe.type=X}function Pe(C){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",C.statusMessage)}function st(C){const W=C.target;W.removeEventListener("dispose",st),Nt(W)}function Nt(C){jt(C),Ye.remove(C)}function jt(C){const W=Ye.get(C).programs;W!==void 0&&(W.forEach(function(J){He.releaseProgram(J)}),C.isShaderMaterial&&He.releaseShaderCache(C))}this.renderBufferDirect=function(C,W,J,ee,X,Te){W===null&&(W=Ct);const Se=X.isMesh&&X.matrixWorld.determinant()<0,Ve=oa(C,W,J,ee,X);qe.setMaterial(ee,Se);let ke=J.index,tt=1;if(ee.wireframe===!0){if(ke=ge.getWireframeAttribute(J),ke===void 0)return;tt=2}const it=J.drawRange,Ge=J.attributes.position;let _t=it.start*tt,Et=(it.start+it.count)*tt;Te!==null&&(_t=Math.max(_t,Te.start*tt),Et=Math.min(Et,(Te.start+Te.count)*tt)),ke!==null?(_t=Math.max(_t,0),Et=Math.min(Et,ke.count)):Ge!=null&&(_t=Math.max(_t,0),Et=Math.min(Et,Ge.count));const gt=Et-_t;if(gt<0||gt===1/0)return;Tt.setup(X,ee,Ve,J,ke);let ln,ot=Oe;if(ke!==null&&(ln=pe.get(ke),ot=ft,ot.setIndex(ln)),X.isMesh)ee.wireframe===!0?(qe.setLineWidth(ee.wireframeLinewidth*Ut()),ot.setMode(Y.LINES)):ot.setMode(Y.TRIANGLES);else if(X.isLine){let Xe=ee.linewidth;Xe===void 0&&(Xe=1),qe.setLineWidth(Xe*Ut()),X.isLineSegments?ot.setMode(Y.LINES):X.isLineLoop?ot.setMode(Y.LINE_LOOP):ot.setMode(Y.LINE_STRIP)}else X.isPoints?ot.setMode(Y.POINTS):X.isSprite&&ot.setMode(Y.TRIANGLES);if(X.isBatchedMesh)if(X._multiDrawInstances!==null)ot.renderMultiDrawInstances(X._multiDrawStarts,X._multiDrawCounts,X._multiDrawCount,X._multiDrawInstances);else if(ht.get("WEBGL_multi_draw"))ot.renderMultiDraw(X._multiDrawStarts,X._multiDrawCounts,X._multiDrawCount);else{const Xe=X._multiDrawStarts,ni=X._multiDrawCounts,St=X._multiDrawCount,un=ke?pe.get(ke).bytesPerElement:1,ii=Ye.get(ee).currentProgram.getUniforms();for(let qt=0;qt<St;qt++)ii.setValue(Y,"_gl_DrawID",qt),ot.render(Xe[qt]/un,ni[qt])}else if(X.isInstancedMesh)ot.renderInstances(_t,gt,X.count);else if(J.isInstancedBufferGeometry){const Xe=J._maxInstanceCount!==void 0?J._maxInstanceCount:1/0,ni=Math.min(J.instanceCount,Xe);ot.renderInstances(_t,gt,ni)}else ot.render(_t,gt)};function vt(C,W,J){C.transparent===!0&&C.side===Ei&&C.forceSinglePass===!1?(C.side=An,C.needsUpdate=!0,ss(C,W,J),C.side=Ar,C.needsUpdate=!0,ss(C,W,J),C.side=Ei):ss(C,W,J)}this.compile=function(C,W,J=null){J===null&&(J=C),m=ut.get(J),m.init(W),L.push(m),J.traverseVisible(function(X){X.isLight&&X.layers.test(W.layers)&&(m.pushLight(X),X.castShadow&&m.pushShadow(X))}),C!==J&&C.traverseVisible(function(X){X.isLight&&X.layers.test(W.layers)&&(m.pushLight(X),X.castShadow&&m.pushShadow(X))}),m.setupLights();const ee=new Set;return C.traverse(function(X){if(!(X.isMesh||X.isPoints||X.isLine||X.isSprite))return;const Te=X.material;if(Te)if(Array.isArray(Te))for(let Se=0;Se<Te.length;Se++){const Ve=Te[Se];vt(Ve,J,X),ee.add(Ve)}else vt(Te,J,X),ee.add(Te)}),L.pop(),m=null,ee},this.compileAsync=function(C,W,J=null){const ee=this.compile(C,W,J);return new Promise(X=>{function Te(){if(ee.forEach(function(Se){Ye.get(Se).currentProgram.isReady()&&ee.delete(Se)}),ee.size===0){X(C);return}setTimeout(Te,10)}ht.get("KHR_parallel_shader_compile")!==null?Te():setTimeout(Te,10)})};let Rn=null;function vn(C){Rn&&Rn(C)}function rs(){Ci.stop()}function qi(){Ci.start()}const Ci=new Bg;Ci.setAnimationLoop(vn),typeof self<"u"&&Ci.setContext(self),this.setAnimationLoop=function(C){Rn=C,ie.setAnimationLoop(C),C===null?Ci.stop():Ci.start()},ie.addEventListener("sessionstart",rs),ie.addEventListener("sessionend",qi),this.render=function(C,W){if(W!==void 0&&W.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(j===!0)return;if(C.matrixWorldAutoUpdate===!0&&C.updateMatrixWorld(),W.parent===null&&W.matrixWorldAutoUpdate===!0&&W.updateMatrixWorld(),ie.enabled===!0&&ie.isPresenting===!0&&(ie.cameraAutoUpdate===!0&&ie.updateCamera(W),W=ie.getCamera()),C.isScene===!0&&C.onBeforeRender(R,C,W,H),m=ut.get(C,L.length),m.init(W),L.push(m),we.multiplyMatrices(W.projectionMatrix,W.matrixWorldInverse),Z.setFromProjectionMatrix(we),Me=this.localClippingEnabled,ue=ye.init(this.clippingPlanes,Me),v=Ie.get(C,P.length),v.init(),P.push(v),ie.enabled===!0&&ie.isPresenting===!0){const Te=R.xr.getDepthSensingMesh();Te!==null&&Ri(Te,W,-1/0,R.sortObjects)}Ri(C,W,0,R.sortObjects),v.finish(),R.sortObjects===!0&&v.sort(ae,re),mt=ie.enabled===!1||ie.isPresenting===!1||ie.hasDepthSensing()===!1,mt&&Qe.addToRenderList(v,C),this.info.render.frame++,ue===!0&&ye.beginShadows();const J=m.state.shadowsArray;Fe.render(J,C,W),ue===!0&&ye.endShadows(),this.info.autoReset===!0&&this.info.reset();const ee=v.opaque,X=v.transmissive;if(m.setupLights(),W.isArrayCamera){const Te=W.cameras;if(X.length>0)for(let Se=0,Ve=Te.length;Se<Ve;Se++){const ke=Te[Se];br(ee,X,C,ke)}mt&&Qe.render(C);for(let Se=0,Ve=Te.length;Se<Ve;Se++){const ke=Te[Se];Pr(v,C,ke,ke.viewport)}}else X.length>0&&br(ee,X,C,W),mt&&Qe.render(C),Pr(v,C,W);H!==null&&(D.updateMultisampleRenderTarget(H),D.updateRenderTargetMipmap(H)),C.isScene===!0&&C.onAfterRender(R,C,W),Tt.resetDefaultState(),b=-1,A=null,L.pop(),L.length>0?(m=L[L.length-1],ue===!0&&ye.setGlobalState(R.clippingPlanes,m.state.camera)):m=null,P.pop(),P.length>0?v=P[P.length-1]:v=null};function Ri(C,W,J,ee){if(C.visible===!1)return;if(C.layers.test(W.layers)){if(C.isGroup)J=C.renderOrder;else if(C.isLOD)C.autoUpdate===!0&&C.update(W);else if(C.isLight)m.pushLight(C),C.castShadow&&m.pushShadow(C);else if(C.isSprite){if(!C.frustumCulled||Z.intersectsSprite(C)){ee&&Ze.setFromMatrixPosition(C.matrixWorld).applyMatrix4(we);const Se=ce.update(C),Ve=C.material;Ve.visible&&v.push(C,Se,Ve,J,Ze.z,null)}}else if((C.isMesh||C.isLine||C.isPoints)&&(!C.frustumCulled||Z.intersectsObject(C))){const Se=ce.update(C),Ve=C.material;if(ee&&(C.boundingSphere!==void 0?(C.boundingSphere===null&&C.computeBoundingSphere(),Ze.copy(C.boundingSphere.center)):(Se.boundingSphere===null&&Se.computeBoundingSphere(),Ze.copy(Se.boundingSphere.center)),Ze.applyMatrix4(C.matrixWorld).applyMatrix4(we)),Array.isArray(Ve)){const ke=Se.groups;for(let tt=0,it=ke.length;tt<it;tt++){const Ge=ke[tt],_t=Ve[Ge.materialIndex];_t&&_t.visible&&v.push(C,Se,_t,J,Ze.z,Ge)}}else Ve.visible&&v.push(C,Se,Ve,J,Ze.z,null)}}const Te=C.children;for(let Se=0,Ve=Te.length;Se<Ve;Se++)Ri(Te[Se],W,J,ee)}function Pr(C,W,J,ee){const X=C.opaque,Te=C.transmissive,Se=C.transparent;m.setupLightsView(J),ue===!0&&ye.setGlobalState(R.clippingPlanes,J),ee&&qe.viewport(z.copy(ee)),X.length>0&&$i(X,W,J),Te.length>0&&$i(Te,W,J),Se.length>0&&$i(Se,W,J),qe.buffers.depth.setTest(!0),qe.buffers.depth.setMask(!0),qe.buffers.color.setMask(!0),qe.setPolygonOffset(!1)}function br(C,W,J,ee){if((J.isScene===!0?J.overrideMaterial:null)!==null)return;m.state.transmissionRenderTarget[ee.id]===void 0&&(m.state.transmissionRenderTarget[ee.id]=new ts(1,1,{generateMipmaps:!0,type:ht.has("EXT_color_buffer_half_float")||ht.has("EXT_color_buffer_float")?ea:ji,minFilter:Jr,samples:4,stencilBuffer:l,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:yt.workingColorSpace}));const Te=m.state.transmissionRenderTarget[ee.id],Se=ee.viewport||z;Te.setSize(Se.z,Se.w);const Ve=R.getRenderTarget();R.setRenderTarget(Te),R.getClearColor(fe),he=R.getClearAlpha(),he<1&&R.setClearColor(16777215,.5),R.clear(),mt&&Qe.render(J);const ke=R.toneMapping;R.toneMapping=Tr;const tt=ee.viewport;if(ee.viewport!==void 0&&(ee.viewport=void 0),m.setupLightsView(ee),ue===!0&&ye.setGlobalState(R.clippingPlanes,ee),$i(C,J,ee),D.updateMultisampleRenderTarget(Te),D.updateRenderTargetMipmap(Te),ht.has("WEBGL_multisampled_render_to_texture")===!1){let it=!1;for(let Ge=0,_t=W.length;Ge<_t;Ge++){const Et=W[Ge],gt=Et.object,ln=Et.geometry,ot=Et.material,Xe=Et.group;if(ot.side===Ei&&gt.layers.test(ee.layers)){const ni=ot.side;ot.side=An,ot.needsUpdate=!0,ra(gt,J,ee,ln,ot,Xe),ot.side=ni,ot.needsUpdate=!0,it=!0}}it===!0&&(D.updateMultisampleRenderTarget(Te),D.updateRenderTargetMipmap(Te))}R.setRenderTarget(Ve),R.setClearColor(fe,he),tt!==void 0&&(ee.viewport=tt),R.toneMapping=ke}function $i(C,W,J){const ee=W.isScene===!0?W.overrideMaterial:null;for(let X=0,Te=C.length;X<Te;X++){const Se=C[X],Ve=Se.object,ke=Se.geometry,tt=ee===null?Se.material:ee,it=Se.group;Ve.layers.test(J.layers)&&ra(Ve,W,J,ke,tt,it)}}function ra(C,W,J,ee,X,Te){C.onBeforeRender(R,W,J,ee,X,Te),C.modelViewMatrix.multiplyMatrices(J.matrixWorldInverse,C.matrixWorld),C.normalMatrix.getNormalMatrix(C.modelViewMatrix),X.onBeforeRender(R,W,J,ee,C,Te),X.transparent===!0&&X.side===Ei&&X.forceSinglePass===!1?(X.side=An,X.needsUpdate=!0,R.renderBufferDirect(J,W,ee,X,C,Te),X.side=Ar,X.needsUpdate=!0,R.renderBufferDirect(J,W,ee,X,C,Te),X.side=Ei):R.renderBufferDirect(J,W,ee,X,C,Te),C.onAfterRender(R,W,J,ee,X,Te)}function ss(C,W,J){W.isScene!==!0&&(W=Ct);const ee=Ye.get(C),X=m.state.lights,Te=m.state.shadowsArray,Se=X.state.version,Ve=He.getParameters(C,X.state,Te,W,J),ke=He.getProgramCacheKey(Ve);let tt=ee.programs;ee.environment=C.isMeshStandardMaterial?W.environment:null,ee.fog=W.fog,ee.envMap=(C.isMeshStandardMaterial?K:w).get(C.envMap||ee.environment),ee.envMapRotation=ee.environment!==null&&C.envMap===null?W.environmentRotation:C.envMapRotation,tt===void 0&&(C.addEventListener("dispose",st),tt=new Map,ee.programs=tt);let it=tt.get(ke);if(it!==void 0){if(ee.currentProgram===it&&ee.lightsStateVersion===Se)return gi(C,Ve),it}else Ve.uniforms=He.getUniforms(C),C.onBeforeCompile(Ve,R),it=He.acquireProgram(Ve,ke),tt.set(ke,it),ee.uniforms=Ve.uniforms;const Ge=ee.uniforms;return(!C.isShaderMaterial&&!C.isRawShaderMaterial||C.clipping===!0)&&(Ge.clippingPlanes=ye.uniform),gi(C,Ve),ee.needsLights=nu(C),ee.lightsStateVersion=Se,ee.needsLights&&(Ge.ambientLightColor.value=X.state.ambient,Ge.lightProbe.value=X.state.probe,Ge.directionalLights.value=X.state.directional,Ge.directionalLightShadows.value=X.state.directionalShadow,Ge.spotLights.value=X.state.spot,Ge.spotLightShadows.value=X.state.spotShadow,Ge.rectAreaLights.value=X.state.rectArea,Ge.ltc_1.value=X.state.rectAreaLTC1,Ge.ltc_2.value=X.state.rectAreaLTC2,Ge.pointLights.value=X.state.point,Ge.pointLightShadows.value=X.state.pointShadow,Ge.hemisphereLights.value=X.state.hemi,Ge.directionalShadowMap.value=X.state.directionalShadowMap,Ge.directionalShadowMatrix.value=X.state.directionalShadowMatrix,Ge.spotShadowMap.value=X.state.spotShadowMap,Ge.spotLightMatrix.value=X.state.spotLightMatrix,Ge.spotLightMap.value=X.state.spotLightMap,Ge.pointShadowMap.value=X.state.pointShadowMap,Ge.pointShadowMatrix.value=X.state.pointShadowMatrix),ee.currentProgram=it,ee.uniformsList=null,it}function sa(C){if(C.uniformsList===null){const W=C.currentProgram.getUniforms();C.uniformsList=Xl.seqWithValue(W.seq,C.uniforms)}return C.uniformsList}function gi(C,W){const J=Ye.get(C);J.outputColorSpace=W.outputColorSpace,J.batching=W.batching,J.batchingColor=W.batchingColor,J.instancing=W.instancing,J.instancingColor=W.instancingColor,J.instancingMorph=W.instancingMorph,J.skinning=W.skinning,J.morphTargets=W.morphTargets,J.morphNormals=W.morphNormals,J.morphColors=W.morphColors,J.morphTargetsCount=W.morphTargetsCount,J.numClippingPlanes=W.numClippingPlanes,J.numIntersection=W.numClipIntersection,J.vertexAlphas=W.vertexAlphas,J.vertexTangents=W.vertexTangents,J.toneMapping=W.toneMapping}function oa(C,W,J,ee,X){W.isScene!==!0&&(W=Ct),D.resetTextureUnits();const Te=W.fog,Se=ee.isMeshStandardMaterial?W.environment:null,Ve=H===null?R.outputColorSpace:H.isXRRenderTarget===!0?H.texture.colorSpace:ao,ke=(ee.isMeshStandardMaterial?K:w).get(ee.envMap||Se),tt=ee.vertexColors===!0&&!!J.attributes.color&&J.attributes.color.itemSize===4,it=!!J.attributes.tangent&&(!!ee.normalMap||ee.anisotropy>0),Ge=!!J.morphAttributes.position,_t=!!J.morphAttributes.normal,Et=!!J.morphAttributes.color;let gt=Tr;ee.toneMapped&&(H===null||H.isXRRenderTarget===!0)&&(gt=R.toneMapping);const ln=J.morphAttributes.position||J.morphAttributes.normal||J.morphAttributes.color,ot=ln!==void 0?ln.length:0,Xe=Ye.get(ee),ni=m.state.lights;if(ue===!0&&(Me===!0||C!==A)){const xn=C===A&&ee.id===b;ye.setState(ee,C,xn)}let St=!1;ee.version===Xe.__version?(Xe.needsLights&&Xe.lightsStateVersion!==ni.state.version||Xe.outputColorSpace!==Ve||X.isBatchedMesh&&Xe.batching===!1||!X.isBatchedMesh&&Xe.batching===!0||X.isBatchedMesh&&Xe.batchingColor===!0&&X.colorTexture===null||X.isBatchedMesh&&Xe.batchingColor===!1&&X.colorTexture!==null||X.isInstancedMesh&&Xe.instancing===!1||!X.isInstancedMesh&&Xe.instancing===!0||X.isSkinnedMesh&&Xe.skinning===!1||!X.isSkinnedMesh&&Xe.skinning===!0||X.isInstancedMesh&&Xe.instancingColor===!0&&X.instanceColor===null||X.isInstancedMesh&&Xe.instancingColor===!1&&X.instanceColor!==null||X.isInstancedMesh&&Xe.instancingMorph===!0&&X.morphTexture===null||X.isInstancedMesh&&Xe.instancingMorph===!1&&X.morphTexture!==null||Xe.envMap!==ke||ee.fog===!0&&Xe.fog!==Te||Xe.numClippingPlanes!==void 0&&(Xe.numClippingPlanes!==ye.numPlanes||Xe.numIntersection!==ye.numIntersection)||Xe.vertexAlphas!==tt||Xe.vertexTangents!==it||Xe.morphTargets!==Ge||Xe.morphNormals!==_t||Xe.morphColors!==Et||Xe.toneMapping!==gt||Xe.morphTargetsCount!==ot)&&(St=!0):(St=!0,Xe.__version=ee.version);let un=Xe.currentProgram;St===!0&&(un=ss(ee,W,X));let ii=!1,qt=!1,_i=!1;const Dt=un.getUniforms(),Wn=Xe.uniforms;if(qe.useProgram(un.program)&&(ii=!0,qt=!0,_i=!0),ee.id!==b&&(b=ee.id,qt=!0),ii||A!==C){qe.buffers.depth.getReversed()?(ve.copy(C.projectionMatrix),D0(ve),U0(ve),Dt.setValue(Y,"projectionMatrix",ve)):Dt.setValue(Y,"projectionMatrix",C.projectionMatrix),Dt.setValue(Y,"viewMatrix",C.matrixWorldInverse);const Xn=Dt.map.cameraPosition;Xn!==void 0&&Xn.setValue(Y,Ue.setFromMatrixPosition(C.matrixWorld)),ct.logarithmicDepthBuffer&&Dt.setValue(Y,"logDepthBufFC",2/(Math.log(C.far+1)/Math.LN2)),(ee.isMeshPhongMaterial||ee.isMeshToonMaterial||ee.isMeshLambertMaterial||ee.isMeshBasicMaterial||ee.isMeshStandardMaterial||ee.isShaderMaterial)&&Dt.setValue(Y,"isOrthographic",C.isOrthographicCamera===!0),A!==C&&(A=C,qt=!0,_i=!0)}if(X.isSkinnedMesh){Dt.setOptional(Y,X,"bindMatrix"),Dt.setOptional(Y,X,"bindMatrixInverse");const xn=X.skeleton;xn&&(xn.boneTexture===null&&xn.computeBoneTexture(),Dt.setValue(Y,"boneTexture",xn.boneTexture,D))}X.isBatchedMesh&&(Dt.setOptional(Y,X,"batchingTexture"),Dt.setValue(Y,"batchingTexture",X._matricesTexture,D),Dt.setOptional(Y,X,"batchingIdTexture"),Dt.setValue(Y,"batchingIdTexture",X._indirectTexture,D),Dt.setOptional(Y,X,"batchingColorTexture"),X._colorsTexture!==null&&Dt.setValue(Y,"batchingColorTexture",X._colorsTexture,D));const Pi=J.morphAttributes;if((Pi.position!==void 0||Pi.normal!==void 0||Pi.color!==void 0)&&Je.update(X,J,un),(qt||Xe.receiveShadow!==X.receiveShadow)&&(Xe.receiveShadow=X.receiveShadow,Dt.setValue(Y,"receiveShadow",X.receiveShadow)),ee.isMeshGouraudMaterial&&ee.envMap!==null&&(Wn.envMap.value=ke,Wn.flipEnvMap.value=ke.isCubeTexture&&ke.isRenderTargetTexture===!1?-1:1),ee.isMeshStandardMaterial&&ee.envMap===null&&W.environment!==null&&(Wn.envMapIntensity.value=W.environmentIntensity),qt&&(Dt.setValue(Y,"toneMappingExposure",R.toneMappingExposure),Xe.needsLights&&aa(Wn,_i),Te&&ee.fog===!0&&Ae.refreshFogUniforms(Wn,Te),Ae.refreshMaterialUniforms(Wn,ee,k,le,m.state.transmissionRenderTarget[C.id]),Xl.upload(Y,sa(Xe),Wn,D)),ee.isShaderMaterial&&ee.uniformsNeedUpdate===!0&&(Xl.upload(Y,sa(Xe),Wn,D),ee.uniformsNeedUpdate=!1),ee.isSpriteMaterial&&Dt.setValue(Y,"center",X.center),Dt.setValue(Y,"modelViewMatrix",X.modelViewMatrix),Dt.setValue(Y,"normalMatrix",X.normalMatrix),Dt.setValue(Y,"modelMatrix",X.matrixWorld),ee.isShaderMaterial||ee.isRawShaderMaterial){const xn=ee.uniformsGroups;for(let Xn=0,Pn=xn.length;Xn<Pn;Xn++){const la=xn[Xn];V.update(la,un),V.bind(la,un)}}return un}function aa(C,W){C.ambientLightColor.needsUpdate=W,C.lightProbe.needsUpdate=W,C.directionalLights.needsUpdate=W,C.directionalLightShadows.needsUpdate=W,C.pointLights.needsUpdate=W,C.pointLightShadows.needsUpdate=W,C.spotLights.needsUpdate=W,C.spotLightShadows.needsUpdate=W,C.rectAreaLights.needsUpdate=W,C.hemisphereLights.needsUpdate=W}function nu(C){return C.isMeshLambertMaterial||C.isMeshToonMaterial||C.isMeshPhongMaterial||C.isMeshStandardMaterial||C.isShadowMaterial||C.isShaderMaterial&&C.lights===!0}this.getActiveCubeFace=function(){return I},this.getActiveMipmapLevel=function(){return F},this.getRenderTarget=function(){return H},this.setRenderTargetTextures=function(C,W,J){Ye.get(C.texture).__webglTexture=W,Ye.get(C.depthTexture).__webglTexture=J;const ee=Ye.get(C);ee.__hasExternalTextures=!0,ee.__autoAllocateDepthBuffer=J===void 0,ee.__autoAllocateDepthBuffer||ht.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),ee.__useRenderToTexture=!1)},this.setRenderTargetFramebuffer=function(C,W){const J=Ye.get(C);J.__webglFramebuffer=W,J.__useDefaultFramebuffer=W===void 0},this.setRenderTarget=function(C,W=0,J=0){H=C,I=W,F=J;let ee=!0,X=null,Te=!1,Se=!1;if(C){const ke=Ye.get(C);if(ke.__useDefaultFramebuffer!==void 0)qe.bindFramebuffer(Y.FRAMEBUFFER,null),ee=!1;else if(ke.__webglFramebuffer===void 0)D.setupRenderTarget(C);else if(ke.__hasExternalTextures)D.rebindTextures(C,Ye.get(C.texture).__webglTexture,Ye.get(C.depthTexture).__webglTexture);else if(C.depthBuffer){const Ge=C.depthTexture;if(ke.__boundDepthTexture!==Ge){if(Ge!==null&&Ye.has(Ge)&&(C.width!==Ge.image.width||C.height!==Ge.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");D.setupDepthRenderbuffer(C)}}const tt=C.texture;(tt.isData3DTexture||tt.isDataArrayTexture||tt.isCompressedArrayTexture)&&(Se=!0);const it=Ye.get(C).__webglFramebuffer;C.isWebGLCubeRenderTarget?(Array.isArray(it[W])?X=it[W][J]:X=it[W],Te=!0):C.samples>0&&D.useMultisampledRTT(C)===!1?X=Ye.get(C).__webglMultisampledFramebuffer:Array.isArray(it)?X=it[J]:X=it,z.copy(C.viewport),se.copy(C.scissor),te=C.scissorTest}else z.copy(N).multiplyScalar(k).floor(),se.copy(ne).multiplyScalar(k).floor(),te=De;if(qe.bindFramebuffer(Y.FRAMEBUFFER,X)&&ee&&qe.drawBuffers(C,X),qe.viewport(z),qe.scissor(se),qe.setScissorTest(te),Te){const ke=Ye.get(C.texture);Y.framebufferTexture2D(Y.FRAMEBUFFER,Y.COLOR_ATTACHMENT0,Y.TEXTURE_CUBE_MAP_POSITIVE_X+W,ke.__webglTexture,J)}else if(Se){const ke=Ye.get(C.texture),tt=W||0;Y.framebufferTextureLayer(Y.FRAMEBUFFER,Y.COLOR_ATTACHMENT0,ke.__webglTexture,J||0,tt)}b=-1},this.readRenderTargetPixels=function(C,W,J,ee,X,Te,Se){if(!(C&&C.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Ve=Ye.get(C).__webglFramebuffer;if(C.isWebGLCubeRenderTarget&&Se!==void 0&&(Ve=Ve[Se]),Ve){qe.bindFramebuffer(Y.FRAMEBUFFER,Ve);try{const ke=C.texture,tt=ke.format,it=ke.type;if(!ct.textureFormatReadable(tt)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!ct.textureTypeReadable(it)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}W>=0&&W<=C.width-ee&&J>=0&&J<=C.height-X&&Y.readPixels(W,J,ee,X,rt.convert(tt),rt.convert(it),Te)}finally{const ke=H!==null?Ye.get(H).__webglFramebuffer:null;qe.bindFramebuffer(Y.FRAMEBUFFER,ke)}}},this.readRenderTargetPixelsAsync=async function(C,W,J,ee,X,Te,Se){if(!(C&&C.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Ve=Ye.get(C).__webglFramebuffer;if(C.isWebGLCubeRenderTarget&&Se!==void 0&&(Ve=Ve[Se]),Ve){const ke=C.texture,tt=ke.format,it=ke.type;if(!ct.textureFormatReadable(tt))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!ct.textureTypeReadable(it))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");if(W>=0&&W<=C.width-ee&&J>=0&&J<=C.height-X){qe.bindFramebuffer(Y.FRAMEBUFFER,Ve);const Ge=Y.createBuffer();Y.bindBuffer(Y.PIXEL_PACK_BUFFER,Ge),Y.bufferData(Y.PIXEL_PACK_BUFFER,Te.byteLength,Y.STREAM_READ),Y.readPixels(W,J,ee,X,rt.convert(tt),rt.convert(it),0);const _t=H!==null?Ye.get(H).__webglFramebuffer:null;qe.bindFramebuffer(Y.FRAMEBUFFER,_t);const Et=Y.fenceSync(Y.SYNC_GPU_COMMANDS_COMPLETE,0);return Y.flush(),await L0(Y,Et,4),Y.bindBuffer(Y.PIXEL_PACK_BUFFER,Ge),Y.getBufferSubData(Y.PIXEL_PACK_BUFFER,0,Te),Y.deleteBuffer(Ge),Y.deleteSync(Et),Te}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")}},this.copyFramebufferToTexture=function(C,W=null,J=0){C.isTexture!==!0&&($o("WebGLRenderer: copyFramebufferToTexture function signature has changed."),W=arguments[0]||null,C=arguments[1]);const ee=Math.pow(2,-J),X=Math.floor(C.image.width*ee),Te=Math.floor(C.image.height*ee),Se=W!==null?W.x:0,Ve=W!==null?W.y:0;D.setTexture2D(C,0),Y.copyTexSubImage2D(Y.TEXTURE_2D,J,0,0,Se,Ve,X,Te),qe.unbindTexture()},this.copyTextureToTexture=function(C,W,J=null,ee=null,X=0){C.isTexture!==!0&&($o("WebGLRenderer: copyTextureToTexture function signature has changed."),ee=arguments[0]||null,C=arguments[1],W=arguments[2],X=arguments[3]||0,J=null);let Te,Se,Ve,ke,tt,it,Ge,_t,Et;const gt=C.isCompressedTexture?C.mipmaps[X]:C.image;J!==null?(Te=J.max.x-J.min.x,Se=J.max.y-J.min.y,Ve=J.isBox3?J.max.z-J.min.z:1,ke=J.min.x,tt=J.min.y,it=J.isBox3?J.min.z:0):(Te=gt.width,Se=gt.height,Ve=gt.depth||1,ke=0,tt=0,it=0),ee!==null?(Ge=ee.x,_t=ee.y,Et=ee.z):(Ge=0,_t=0,Et=0);const ln=rt.convert(W.format),ot=rt.convert(W.type);let Xe;W.isData3DTexture?(D.setTexture3D(W,0),Xe=Y.TEXTURE_3D):W.isDataArrayTexture||W.isCompressedArrayTexture?(D.setTexture2DArray(W,0),Xe=Y.TEXTURE_2D_ARRAY):(D.setTexture2D(W,0),Xe=Y.TEXTURE_2D),Y.pixelStorei(Y.UNPACK_FLIP_Y_WEBGL,W.flipY),Y.pixelStorei(Y.UNPACK_PREMULTIPLY_ALPHA_WEBGL,W.premultiplyAlpha),Y.pixelStorei(Y.UNPACK_ALIGNMENT,W.unpackAlignment);const ni=Y.getParameter(Y.UNPACK_ROW_LENGTH),St=Y.getParameter(Y.UNPACK_IMAGE_HEIGHT),un=Y.getParameter(Y.UNPACK_SKIP_PIXELS),ii=Y.getParameter(Y.UNPACK_SKIP_ROWS),qt=Y.getParameter(Y.UNPACK_SKIP_IMAGES);Y.pixelStorei(Y.UNPACK_ROW_LENGTH,gt.width),Y.pixelStorei(Y.UNPACK_IMAGE_HEIGHT,gt.height),Y.pixelStorei(Y.UNPACK_SKIP_PIXELS,ke),Y.pixelStorei(Y.UNPACK_SKIP_ROWS,tt),Y.pixelStorei(Y.UNPACK_SKIP_IMAGES,it);const _i=C.isDataArrayTexture||C.isData3DTexture,Dt=W.isDataArrayTexture||W.isData3DTexture;if(C.isRenderTargetTexture||C.isDepthTexture){const Wn=Ye.get(C),Pi=Ye.get(W),xn=Ye.get(Wn.__renderTarget),Xn=Ye.get(Pi.__renderTarget);qe.bindFramebuffer(Y.READ_FRAMEBUFFER,xn.__webglFramebuffer),qe.bindFramebuffer(Y.DRAW_FRAMEBUFFER,Xn.__webglFramebuffer);for(let Pn=0;Pn<Ve;Pn++)_i&&Y.framebufferTextureLayer(Y.READ_FRAMEBUFFER,Y.COLOR_ATTACHMENT0,Ye.get(C).__webglTexture,X,it+Pn),C.isDepthTexture?(Dt&&Y.framebufferTextureLayer(Y.DRAW_FRAMEBUFFER,Y.COLOR_ATTACHMENT0,Ye.get(W).__webglTexture,X,Et+Pn),Y.blitFramebuffer(ke,tt,Te,Se,Ge,_t,Te,Se,Y.DEPTH_BUFFER_BIT,Y.NEAREST)):Dt?Y.copyTexSubImage3D(Xe,X,Ge,_t,Et+Pn,ke,tt,Te,Se):Y.copyTexSubImage2D(Xe,X,Ge,_t,Et+Pn,ke,tt,Te,Se);qe.bindFramebuffer(Y.READ_FRAMEBUFFER,null),qe.bindFramebuffer(Y.DRAW_FRAMEBUFFER,null)}else Dt?C.isDataTexture||C.isData3DTexture?Y.texSubImage3D(Xe,X,Ge,_t,Et,Te,Se,Ve,ln,ot,gt.data):W.isCompressedArrayTexture?Y.compressedTexSubImage3D(Xe,X,Ge,_t,Et,Te,Se,Ve,ln,gt.data):Y.texSubImage3D(Xe,X,Ge,_t,Et,Te,Se,Ve,ln,ot,gt):C.isDataTexture?Y.texSubImage2D(Y.TEXTURE_2D,X,Ge,_t,Te,Se,ln,ot,gt.data):C.isCompressedTexture?Y.compressedTexSubImage2D(Y.TEXTURE_2D,X,Ge,_t,gt.width,gt.height,ln,gt.data):Y.texSubImage2D(Y.TEXTURE_2D,X,Ge,_t,Te,Se,ln,ot,gt);Y.pixelStorei(Y.UNPACK_ROW_LENGTH,ni),Y.pixelStorei(Y.UNPACK_IMAGE_HEIGHT,St),Y.pixelStorei(Y.UNPACK_SKIP_PIXELS,un),Y.pixelStorei(Y.UNPACK_SKIP_ROWS,ii),Y.pixelStorei(Y.UNPACK_SKIP_IMAGES,qt),X===0&&W.generateMipmaps&&Y.generateMipmap(Xe),qe.unbindTexture()},this.copyTextureToTexture3D=function(C,W,J=null,ee=null,X=0){return C.isTexture!==!0&&($o("WebGLRenderer: copyTextureToTexture3D function signature has changed."),J=arguments[0]||null,ee=arguments[1]||null,C=arguments[2],W=arguments[3],X=arguments[4]||0),$o('WebGLRenderer: copyTextureToTexture3D function has been deprecated. Use "copyTextureToTexture" instead.'),this.copyTextureToTexture(C,W,J,ee,X)},this.initRenderTarget=function(C){Ye.get(C).__webglFramebuffer===void 0&&D.setupRenderTarget(C)},this.initTexture=function(C){C.isCubeTexture?D.setTextureCube(C,0):C.isData3DTexture?D.setTexture3D(C,0):C.isDataArrayTexture||C.isCompressedArrayTexture?D.setTexture2DArray(C,0):D.setTexture2D(C,0),qe.unbindTexture()},this.resetState=function(){I=0,F=0,H=null,qe.reset(),Tt.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Xi}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;const t=this.getContext();t.drawingBufferColorspace=yt._getDrawingBufferColorSpace(e),t.unpackColorSpace=yt._getUnpackColorSpace()}}class GE extends Yt{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Ai,this.environmentIntensity=1,this.environmentRotation=new Ai,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}}class WE{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e!==void 0?e.length/t:0,this.usage=rd,this.updateRanges=[],this.version=0,this.uuid=wr()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,r){e*=this.stride,r*=t.stride;for(let a=0,l=this.stride;a<l;a++)this.array[e+a]=t.array[r+a];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=wr()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);const t=new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),r=new this.constructor(t,this.stride);return r.setUsage(this.usage),r}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){return e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=wr()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer))),{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}}const Mn=new G;class ql{constructor(e,t,r,a=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=e,this.itemSize=t,this.offset=r,this.normalized=a}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,r=this.data.count;t<r;t++)Mn.fromBufferAttribute(this,t),Mn.applyMatrix4(e),this.setXYZ(t,Mn.x,Mn.y,Mn.z);return this}applyNormalMatrix(e){for(let t=0,r=this.count;t<r;t++)Mn.fromBufferAttribute(this,t),Mn.applyNormalMatrix(e),this.setXYZ(t,Mn.x,Mn.y,Mn.z);return this}transformDirection(e){for(let t=0,r=this.count;t<r;t++)Mn.fromBufferAttribute(this,t),Mn.transformDirection(e),this.setXYZ(t,Mn.x,Mn.y,Mn.z);return this}getComponent(e,t){let r=this.array[e*this.data.stride+this.offset+t];return this.normalized&&(r=Ti(r,this.array)),r}setComponent(e,t,r){return this.normalized&&(r=Pt(r,this.array)),this.data.array[e*this.data.stride+this.offset+t]=r,this}setX(e,t){return this.normalized&&(t=Pt(t,this.array)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=Pt(t,this.array)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=Pt(t,this.array)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=Pt(t,this.array)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=Ti(t,this.array)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=Ti(t,this.array)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=Ti(t,this.array)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=Ti(t,this.array)),t}setXY(e,t,r){return e=e*this.data.stride+this.offset,this.normalized&&(t=Pt(t,this.array),r=Pt(r,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=r,this}setXYZ(e,t,r,a){return e=e*this.data.stride+this.offset,this.normalized&&(t=Pt(t,this.array),r=Pt(r,this.array),a=Pt(a,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=r,this.data.array[e+2]=a,this}setXYZW(e,t,r,a,l){return e=e*this.data.stride+this.offset,this.normalized&&(t=Pt(t,this.array),r=Pt(r,this.array),a=Pt(a,this.array),l=Pt(l,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=r,this.data.array[e+2]=a,this.data.array[e+3]=l,this}clone(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");const t=[];for(let r=0;r<this.count;r++){const a=r*this.data.stride+this.offset;for(let l=0;l<this.itemSize;l++)t.push(this.data.array[a+l])}return new mi(new this.array.constructor(t),this.itemSize,this.normalized)}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.clone(e)),new ql(e.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");const t=[];for(let r=0;r<this.count;r++){const a=r*this.data.stride+this.offset;for(let l=0;l<this.itemSize;l++)t.push(this.data.array[a+l])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:t,normalized:this.normalized}}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}}class jg extends Rr{static get type(){return"SpriteMaterial"}constructor(e){super(),this.isSpriteMaterial=!0,this.color=new pt(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.rotation=e.rotation,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}}let Vs;const Xo=new G,Gs=new G,Ws=new G,Xs=new je,Yo=new je,qg=new Lt,Ll=new G,jo=new G,Dl=new G,Km=new je,pf=new je,Zm=new je;class XE extends Yt{constructor(e=new jg){if(super(),this.isSprite=!0,this.type="Sprite",Vs===void 0){Vs=new Cn;const t=new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),r=new WE(t,5);Vs.setIndex([0,1,2,0,2,3]),Vs.setAttribute("position",new ql(r,3,0,!1)),Vs.setAttribute("uv",new ql(r,2,3,!1))}this.geometry=Vs,this.material=e,this.center=new je(.5,.5)}raycast(e,t){e.camera===null&&console.error('THREE.Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'),Gs.setFromMatrixScale(this.matrixWorld),qg.copy(e.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(e.camera.matrixWorldInverse,this.matrixWorld),Ws.setFromMatrixPosition(this.modelViewMatrix),e.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&Gs.multiplyScalar(-Ws.z);const r=this.material.rotation;let a,l;r!==0&&(l=Math.cos(r),a=Math.sin(r));const c=this.center;Ul(Ll.set(-.5,-.5,0),Ws,c,Gs,a,l),Ul(jo.set(.5,-.5,0),Ws,c,Gs,a,l),Ul(Dl.set(.5,.5,0),Ws,c,Gs,a,l),Km.set(0,0),pf.set(1,0),Zm.set(1,1);let d=e.ray.intersectTriangle(Ll,jo,Dl,!1,Xo);if(d===null&&(Ul(jo.set(-.5,.5,0),Ws,c,Gs,a,l),pf.set(0,1),d=e.ray.intersectTriangle(Ll,Dl,jo,!1,Xo),d===null))return;const h=e.ray.origin.distanceTo(Xo);h<e.near||h>e.far||t.push({distance:h,point:Xo.clone(),uv:ti.getInterpolation(Xo,Ll,jo,Dl,Km,pf,Zm,new je),face:null,object:this})}copy(e,t){return super.copy(e,t),e.center!==void 0&&this.center.copy(e.center),this.material=e.material,this}}function Ul(s,e,t,r,a,l){Xs.subVectors(s,t).addScalar(.5).multiply(r),a!==void 0?(Yo.x=l*Xs.x-a*Xs.y,Yo.y=a*Xs.x+l*Xs.y):Yo.copy(Xs),s.copy(e),s.x+=Yo.x,s.y+=Yo.y,s.applyMatrix4(qg)}class $g extends Rr{static get type(){return"LineBasicMaterial"}constructor(e){super(),this.isLineBasicMaterial=!0,this.color=new pt(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}}const $l=new G,Kl=new G,Qm=new Lt,qo=new Jl,Il=new na,mf=new G,Jm=new G;class YE extends Yt{constructor(e=new Cn,t=new $g){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,r=[0];for(let a=1,l=t.count;a<l;a++)$l.fromBufferAttribute(t,a-1),Kl.fromBufferAttribute(t,a),r[a]=r[a-1],r[a]+=$l.distanceTo(Kl);e.setAttribute("lineDistance",new sn(r,1))}else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(e,t){const r=this.geometry,a=this.matrixWorld,l=e.params.Line.threshold,c=r.drawRange;if(r.boundingSphere===null&&r.computeBoundingSphere(),Il.copy(r.boundingSphere),Il.applyMatrix4(a),Il.radius+=l,e.ray.intersectsSphere(Il)===!1)return;Qm.copy(a).invert(),qo.copy(e.ray).applyMatrix4(Qm);const d=l/((this.scale.x+this.scale.y+this.scale.z)/3),h=d*d,g=this.isLineSegments?2:1,_=r.index,y=r.attributes.position;if(_!==null){const S=Math.max(0,c.start),E=Math.min(_.count,c.start+c.count);for(let T=S,v=E-1;T<v;T+=g){const m=_.getX(T),P=_.getX(T+1),L=Nl(this,e,qo,h,m,P);L&&t.push(L)}if(this.isLineLoop){const T=_.getX(E-1),v=_.getX(S),m=Nl(this,e,qo,h,T,v);m&&t.push(m)}}else{const S=Math.max(0,c.start),E=Math.min(y.count,c.start+c.count);for(let T=S,v=E-1;T<v;T+=g){const m=Nl(this,e,qo,h,T,T+1);m&&t.push(m)}if(this.isLineLoop){const T=Nl(this,e,qo,h,E-1,S);T&&t.push(T)}}}updateMorphTargets(){const t=this.geometry.morphAttributes,r=Object.keys(t);if(r.length>0){const a=t[r[0]];if(a!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let l=0,c=a.length;l<c;l++){const d=a[l].name||String(l);this.morphTargetInfluences.push(0),this.morphTargetDictionary[d]=l}}}}}function Nl(s,e,t,r,a,l){const c=s.geometry.attributes.position;if($l.fromBufferAttribute(c,a),Kl.fromBufferAttribute(c,l),t.distanceSqToSegment($l,Kl,mf,Jm)>r)return;mf.applyMatrix4(s.matrixWorld);const h=e.ray.origin.distanceTo(mf);if(!(h<e.near||h>e.far))return{distance:h,point:Jm.clone().applyMatrix4(s.matrixWorld),index:a,face:null,faceIndex:null,barycoord:null,object:s}}class Kg extends Rr{static get type(){return"PointsMaterial"}constructor(e){super(),this.isPointsMaterial=!0,this.color=new pt(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}}const eg=new Lt,ad=new Jl,Fl=new na,Ol=new G;class jE extends Yt{constructor(e=new Cn,t=new Kg){super(),this.isPoints=!0,this.type="Points",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}raycast(e,t){const r=this.geometry,a=this.matrixWorld,l=e.params.Points.threshold,c=r.drawRange;if(r.boundingSphere===null&&r.computeBoundingSphere(),Fl.copy(r.boundingSphere),Fl.applyMatrix4(a),Fl.radius+=l,e.ray.intersectsSphere(Fl)===!1)return;eg.copy(a).invert(),ad.copy(e.ray).applyMatrix4(eg);const d=l/((this.scale.x+this.scale.y+this.scale.z)/3),h=d*d,g=r.index,x=r.attributes.position;if(g!==null){const y=Math.max(0,c.start),S=Math.min(g.count,c.start+c.count);for(let E=y,T=S;E<T;E++){const v=g.getX(E);Ol.fromBufferAttribute(x,v),tg(Ol,v,h,a,e,t,this)}}else{const y=Math.max(0,c.start),S=Math.min(x.count,c.start+c.count);for(let E=y,T=S;E<T;E++)Ol.fromBufferAttribute(x,E),tg(Ol,E,h,a,e,t,this)}}updateMorphTargets(){const t=this.geometry.morphAttributes,r=Object.keys(t);if(r.length>0){const a=t[r[0]];if(a!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let l=0,c=a.length;l<c;l++){const d=a[l].name||String(l);this.morphTargetInfluences.push(0),this.morphTargetDictionary[d]=l}}}}}function tg(s,e,t,r,a,l,c){const d=ad.distanceSqToPoint(s);if(d<t){const h=new G;ad.closestPointToPoint(s,h),h.applyMatrix4(r);const g=a.ray.origin.distanceTo(h);if(g<a.near||g>a.far)return;l.push({distance:g,distanceToRay:Math.sqrt(d),point:h,index:e,face:null,faceIndex:null,barycoord:null,object:c})}}class qE extends gn{constructor(e,t,r,a,l,c,d,h,g){super(e,t,r,a,l,c,d,h,g),this.isCanvasTexture=!0,this.needsUpdate=!0}}class vd extends Cn{constructor(e=[],t=[],r=1,a=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:e,indices:t,radius:r,detail:a};const l=[],c=[];d(a),g(r),_(),this.setAttribute("position",new sn(l,3)),this.setAttribute("normal",new sn(l.slice(),3)),this.setAttribute("uv",new sn(c,2)),a===0?this.computeVertexNormals():this.normalizeNormals();function d(P){const L=new G,R=new G,j=new G;for(let I=0;I<t.length;I+=3)S(t[I+0],L),S(t[I+1],R),S(t[I+2],j),h(L,R,j,P)}function h(P,L,R,j){const I=j+1,F=[];for(let H=0;H<=I;H++){F[H]=[];const b=P.clone().lerp(R,H/I),A=L.clone().lerp(R,H/I),z=I-H;for(let se=0;se<=z;se++)se===0&&H===I?F[H][se]=b:F[H][se]=b.clone().lerp(A,se/z)}for(let H=0;H<I;H++)for(let b=0;b<2*(I-H)-1;b++){const A=Math.floor(b/2);b%2===0?(y(F[H][A+1]),y(F[H+1][A]),y(F[H][A])):(y(F[H][A+1]),y(F[H+1][A+1]),y(F[H+1][A]))}}function g(P){const L=new G;for(let R=0;R<l.length;R+=3)L.x=l[R+0],L.y=l[R+1],L.z=l[R+2],L.normalize().multiplyScalar(P),l[R+0]=L.x,l[R+1]=L.y,l[R+2]=L.z}function _(){const P=new G;for(let L=0;L<l.length;L+=3){P.x=l[L+0],P.y=l[L+1],P.z=l[L+2];const R=v(P)/2/Math.PI+.5,j=m(P)/Math.PI+.5;c.push(R,1-j)}E(),x()}function x(){for(let P=0;P<c.length;P+=6){const L=c[P+0],R=c[P+2],j=c[P+4],I=Math.max(L,R,j),F=Math.min(L,R,j);I>.9&&F<.1&&(L<.2&&(c[P+0]+=1),R<.2&&(c[P+2]+=1),j<.2&&(c[P+4]+=1))}}function y(P){l.push(P.x,P.y,P.z)}function S(P,L){const R=P*3;L.x=e[R+0],L.y=e[R+1],L.z=e[R+2]}function E(){const P=new G,L=new G,R=new G,j=new G,I=new je,F=new je,H=new je;for(let b=0,A=0;b<l.length;b+=9,A+=6){P.set(l[b+0],l[b+1],l[b+2]),L.set(l[b+3],l[b+4],l[b+5]),R.set(l[b+6],l[b+7],l[b+8]),I.set(c[A+0],c[A+1]),F.set(c[A+2],c[A+3]),H.set(c[A+4],c[A+5]),j.copy(P).add(L).add(R).divideScalar(3);const z=v(j);T(I,A+0,P,z),T(F,A+2,L,z),T(H,A+4,R,z)}}function T(P,L,R,j){j<0&&P.x===1&&(c[L]=P.x-1),R.x===0&&R.z===0&&(c[L]=j/2/Math.PI+.5)}function v(P){return Math.atan2(P.z,-P.x)}function m(P){return Math.atan2(-P.y,Math.sqrt(P.x*P.x+P.z*P.z))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new vd(e.vertices,e.indices,e.radius,e.details)}}class xd extends vd{constructor(e=1,t=0){const r=[1,0,0,-1,0,0,0,1,0,0,-1,0,0,0,1,0,0,-1],a=[0,2,4,0,4,3,0,3,5,0,5,2,1,2,5,1,5,3,1,3,4,1,4,2];super(r,a,e,t),this.type="OctahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new xd(e.radius,e.detail)}}class yd extends Cn{constructor(e=.5,t=1,r=32,a=1,l=0,c=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:e,outerRadius:t,thetaSegments:r,phiSegments:a,thetaStart:l,thetaLength:c},r=Math.max(3,r),a=Math.max(1,a);const d=[],h=[],g=[],_=[];let x=e;const y=(t-e)/a,S=new G,E=new je;for(let T=0;T<=a;T++){for(let v=0;v<=r;v++){const m=l+v/r*c;S.x=x*Math.cos(m),S.y=x*Math.sin(m),h.push(S.x,S.y,S.z),g.push(0,0,1),E.x=(S.x/t+1)/2,E.y=(S.y/t+1)/2,_.push(E.x,E.y)}x+=y}for(let T=0;T<a;T++){const v=T*(r+1);for(let m=0;m<r;m++){const P=m+v,L=P,R=P+r+1,j=P+r+2,I=P+1;d.push(L,R,I),d.push(R,j,I)}}this.setIndex(d),this.setAttribute("position",new sn(h,3)),this.setAttribute("normal",new sn(g,3)),this.setAttribute("uv",new sn(_,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new yd(e.innerRadius,e.outerRadius,e.thetaSegments,e.phiSegments,e.thetaStart,e.thetaLength)}}class Jo extends Cn{constructor(e=1,t=32,r=16,a=0,l=Math.PI*2,c=0,d=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:r,phiStart:a,phiLength:l,thetaStart:c,thetaLength:d},t=Math.max(3,Math.floor(t)),r=Math.max(2,Math.floor(r));const h=Math.min(c+d,Math.PI);let g=0;const _=[],x=new G,y=new G,S=[],E=[],T=[],v=[];for(let m=0;m<=r;m++){const P=[],L=m/r;let R=0;m===0&&c===0?R=.5/t:m===r&&h===Math.PI&&(R=-.5/t);for(let j=0;j<=t;j++){const I=j/t;x.x=-e*Math.cos(a+I*l)*Math.sin(c+L*d),x.y=e*Math.cos(c+L*d),x.z=e*Math.sin(a+I*l)*Math.sin(c+L*d),E.push(x.x,x.y,x.z),y.copy(x).normalize(),T.push(y.x,y.y,y.z),v.push(I+R,1-L),P.push(g++)}_.push(P)}for(let m=0;m<r;m++)for(let P=0;P<t;P++){const L=_[m][P+1],R=_[m][P],j=_[m+1][P],I=_[m+1][P+1];(m!==0||c>0)&&S.push(L,R,I),(m!==r-1||h<Math.PI)&&S.push(R,j,I)}this.setIndex(S),this.setAttribute("position",new sn(E,3)),this.setAttribute("normal",new sn(T,3)),this.setAttribute("uv",new sn(v,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Jo(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}}class $E extends Rr{static get type(){return"MeshPhongMaterial"}constructor(e){super(),this.isMeshPhongMaterial=!0,this.color=new pt(16777215),this.specular=new pt(1118481),this.shininess=30,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new pt(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Rg,this.normalScale=new je(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Ai,this.combine=ud,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.specular.copy(e.specular),this.shininess=e.shininess,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}const ng={enabled:!1,files:{},add:function(s,e){this.enabled!==!1&&(this.files[s]=e)},get:function(s){if(this.enabled!==!1)return this.files[s]},remove:function(s){delete this.files[s]},clear:function(){this.files={}}};class KE{constructor(e,t,r){const a=this;let l=!1,c=0,d=0,h;const g=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=r,this.itemStart=function(_){d++,l===!1&&a.onStart!==void 0&&a.onStart(_,c,d),l=!0},this.itemEnd=function(_){c++,a.onProgress!==void 0&&a.onProgress(_,c,d),c===d&&(l=!1,a.onLoad!==void 0&&a.onLoad())},this.itemError=function(_){a.onError!==void 0&&a.onError(_)},this.resolveURL=function(_){return h?h(_):_},this.setURLModifier=function(_){return h=_,this},this.addHandler=function(_,x){return g.push(_,x),this},this.removeHandler=function(_){const x=g.indexOf(_);return x!==-1&&g.splice(x,2),this},this.getHandler=function(_){for(let x=0,y=g.length;x<y;x+=2){const S=g[x],E=g[x+1];if(S.global&&(S.lastIndex=0),S.test(_))return E}return null}}}const ZE=new KE;class Sd{constructor(e){this.manager=e!==void 0?e:ZE,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={}}load(){}loadAsync(e,t){const r=this;return new Promise(function(a,l){r.load(e,a,t,l)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}}Sd.DEFAULT_MATERIAL_NAME="__DEFAULT";class QE extends Sd{constructor(e){super(e)}load(e,t,r,a){this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const l=this,c=ng.get(e);if(c!==void 0)return l.manager.itemStart(e),setTimeout(function(){t&&t(c),l.manager.itemEnd(e)},0),c;const d=Qo("img");function h(){_(),ng.add(e,this),t&&t(this),l.manager.itemEnd(e)}function g(x){_(),a&&a(x),l.manager.itemError(e),l.manager.itemEnd(e)}function _(){d.removeEventListener("load",h,!1),d.removeEventListener("error",g,!1)}return d.addEventListener("load",h,!1),d.addEventListener("error",g,!1),e.slice(0,5)!=="data:"&&this.crossOrigin!==void 0&&(d.crossOrigin=this.crossOrigin),l.manager.itemStart(e),d.src=e,d}}class JE extends Sd{constructor(e){super(e)}load(e,t,r,a){const l=new gn,c=new QE(this.manager);return c.setCrossOrigin(this.crossOrigin),c.setPath(this.path),c.load(e,function(d){l.image=d,l.needsUpdate=!0,t!==void 0&&t(l)},r,a),l}}class Zg extends Yt{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new pt(e),this.intensity=t}dispose(){}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){const t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,this.groundColor!==void 0&&(t.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(t.object.distance=this.distance),this.angle!==void 0&&(t.object.angle=this.angle),this.decay!==void 0&&(t.object.decay=this.decay),this.penumbra!==void 0&&(t.object.penumbra=this.penumbra),this.shadow!==void 0&&(t.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(t.object.target=this.target.uuid),t}}const gf=new Lt,ig=new G,rg=new G;class eT{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new je(512,512),this.map=null,this.mapPass=null,this.matrix=new Lt,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new gd,this._frameExtents=new je(1,1),this._viewportCount=1,this._viewports=[new Vt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){const t=this.camera,r=this.matrix;ig.setFromMatrixPosition(e.matrixWorld),t.position.copy(ig),rg.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(rg),t.updateMatrixWorld(),gf.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(gf),r.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),r.multiply(gf)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){const e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}}class tT extends eT{constructor(){super(new Hg(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class nT extends Zg{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Yt.DEFAULT_UP),this.updateMatrix(),this.target=new Yt,this.shadow=new tT}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}}class iT extends Zg{constructor(e,t){super(e,t),this.isAmbientLight=!0,this.type="AmbientLight"}}class sg{constructor(e=1,t=0,r=0){return this.radius=e,this.phi=t,this.theta=r,this}set(e,t,r){return this.radius=e,this.phi=t,this.theta=r,this}copy(e){return this.radius=e.radius,this.phi=e.phi,this.theta=e.theta,this}makeSafe(){return this.phi=Math.max(1e-6,Math.min(Math.PI-1e-6,this.phi)),this}setFromVector3(e){return this.setFromCartesianCoords(e.x,e.y,e.z)}setFromCartesianCoords(e,t,r){return this.radius=Math.sqrt(e*e+t*t+r*r),this.radius===0?(this.theta=0,this.phi=0):(this.theta=Math.atan2(e,r),this.phi=Math.acos(wn(t/this.radius,-1,1))),this}clone(){return new this.constructor().copy(this)}}class rT extends is{constructor(e,t=null){super(),this.object=e,this.domElement=t,this.enabled=!0,this.state=-1,this.keys={},this.mouseButtons={LEFT:null,MIDDLE:null,RIGHT:null},this.touches={ONE:null,TWO:null}}connect(){}disconnect(){}dispose(){}update(){}}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:ld}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=ld);const og={type:"change"},Md={type:"start"},Qg={type:"end"},zl=new Jl,ag=new Sr,sT=Math.cos(70*P0.DEG2RAD),Zt=new G,Fn=2*Math.PI,bt={NONE:-1,ROTATE:0,DOLLY:1,PAN:2,TOUCH_ROTATE:3,TOUCH_PAN:4,TOUCH_DOLLY_PAN:5,TOUCH_DOLLY_ROTATE:6},_f=1e-6;class oT extends rT{constructor(e,t=null){super(e,t),this.state=bt.NONE,this.enabled=!0,this.target=new G,this.cursor=new G,this.minDistance=0,this.maxDistance=1/0,this.minZoom=0,this.maxZoom=1/0,this.minTargetRadius=0,this.maxTargetRadius=1/0,this.minPolarAngle=0,this.maxPolarAngle=Math.PI,this.minAzimuthAngle=-1/0,this.maxAzimuthAngle=1/0,this.enableDamping=!1,this.dampingFactor=.05,this.enableZoom=!0,this.zoomSpeed=1,this.enableRotate=!0,this.rotateSpeed=1,this.enablePan=!0,this.panSpeed=1,this.screenSpacePanning=!0,this.keyPanSpeed=7,this.zoomToCursor=!1,this.autoRotate=!1,this.autoRotateSpeed=2,this.keys={LEFT:"ArrowLeft",UP:"ArrowUp",RIGHT:"ArrowRight",BOTTOM:"ArrowDown"},this.mouseButtons={LEFT:Ks.ROTATE,MIDDLE:Ks.DOLLY,RIGHT:Ks.PAN},this.touches={ONE:js.ROTATE,TWO:js.DOLLY_PAN},this.target0=this.target.clone(),this.position0=this.object.position.clone(),this.zoom0=this.object.zoom,this._domElementKeyEvents=null,this._lastPosition=new G,this._lastQuaternion=new ns,this._lastTargetPosition=new G,this._quat=new ns().setFromUnitVectors(e.up,new G(0,1,0)),this._quatInverse=this._quat.clone().invert(),this._spherical=new sg,this._sphericalDelta=new sg,this._scale=1,this._panOffset=new G,this._rotateStart=new je,this._rotateEnd=new je,this._rotateDelta=new je,this._panStart=new je,this._panEnd=new je,this._panDelta=new je,this._dollyStart=new je,this._dollyEnd=new je,this._dollyDelta=new je,this._dollyDirection=new G,this._mouse=new je,this._performCursorZoom=!1,this._pointers=[],this._pointerPositions={},this._controlActive=!1,this._onPointerMove=lT.bind(this),this._onPointerDown=aT.bind(this),this._onPointerUp=uT.bind(this),this._onContextMenu=gT.bind(this),this._onMouseWheel=dT.bind(this),this._onKeyDown=hT.bind(this),this._onTouchStart=pT.bind(this),this._onTouchMove=mT.bind(this),this._onMouseDown=cT.bind(this),this._onMouseMove=fT.bind(this),this._interceptControlDown=_T.bind(this),this._interceptControlUp=vT.bind(this),this.domElement!==null&&this.connect(),this.update()}connect(){this.domElement.addEventListener("pointerdown",this._onPointerDown),this.domElement.addEventListener("pointercancel",this._onPointerUp),this.domElement.addEventListener("contextmenu",this._onContextMenu),this.domElement.addEventListener("wheel",this._onMouseWheel,{passive:!1}),this.domElement.getRootNode().addEventListener("keydown",this._interceptControlDown,{passive:!0,capture:!0}),this.domElement.style.touchAction="none"}disconnect(){this.domElement.removeEventListener("pointerdown",this._onPointerDown),this.domElement.removeEventListener("pointermove",this._onPointerMove),this.domElement.removeEventListener("pointerup",this._onPointerUp),this.domElement.removeEventListener("pointercancel",this._onPointerUp),this.domElement.removeEventListener("wheel",this._onMouseWheel),this.domElement.removeEventListener("contextmenu",this._onContextMenu),this.stopListenToKeyEvents(),this.domElement.getRootNode().removeEventListener("keydown",this._interceptControlDown,{capture:!0}),this.domElement.style.touchAction="auto"}dispose(){this.disconnect()}getPolarAngle(){return this._spherical.phi}getAzimuthalAngle(){return this._spherical.theta}getDistance(){return this.object.position.distanceTo(this.target)}listenToKeyEvents(e){e.addEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=e}stopListenToKeyEvents(){this._domElementKeyEvents!==null&&(this._domElementKeyEvents.removeEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=null)}saveState(){this.target0.copy(this.target),this.position0.copy(this.object.position),this.zoom0=this.object.zoom}reset(){this.target.copy(this.target0),this.object.position.copy(this.position0),this.object.zoom=this.zoom0,this.object.updateProjectionMatrix(),this.dispatchEvent(og),this.update(),this.state=bt.NONE}update(e=null){const t=this.object.position;Zt.copy(t).sub(this.target),Zt.applyQuaternion(this._quat),this._spherical.setFromVector3(Zt),this.autoRotate&&this.state===bt.NONE&&this._rotateLeft(this._getAutoRotationAngle(e)),this.enableDamping?(this._spherical.theta+=this._sphericalDelta.theta*this.dampingFactor,this._spherical.phi+=this._sphericalDelta.phi*this.dampingFactor):(this._spherical.theta+=this._sphericalDelta.theta,this._spherical.phi+=this._sphericalDelta.phi);let r=this.minAzimuthAngle,a=this.maxAzimuthAngle;isFinite(r)&&isFinite(a)&&(r<-Math.PI?r+=Fn:r>Math.PI&&(r-=Fn),a<-Math.PI?a+=Fn:a>Math.PI&&(a-=Fn),r<=a?this._spherical.theta=Math.max(r,Math.min(a,this._spherical.theta)):this._spherical.theta=this._spherical.theta>(r+a)/2?Math.max(r,this._spherical.theta):Math.min(a,this._spherical.theta)),this._spherical.phi=Math.max(this.minPolarAngle,Math.min(this.maxPolarAngle,this._spherical.phi)),this._spherical.makeSafe(),this.enableDamping===!0?this.target.addScaledVector(this._panOffset,this.dampingFactor):this.target.add(this._panOffset),this.target.sub(this.cursor),this.target.clampLength(this.minTargetRadius,this.maxTargetRadius),this.target.add(this.cursor);let l=!1;if(this.zoomToCursor&&this._performCursorZoom||this.object.isOrthographicCamera)this._spherical.radius=this._clampDistance(this._spherical.radius);else{const c=this._spherical.radius;this._spherical.radius=this._clampDistance(this._spherical.radius*this._scale),l=c!=this._spherical.radius}if(Zt.setFromSpherical(this._spherical),Zt.applyQuaternion(this._quatInverse),t.copy(this.target).add(Zt),this.object.lookAt(this.target),this.enableDamping===!0?(this._sphericalDelta.theta*=1-this.dampingFactor,this._sphericalDelta.phi*=1-this.dampingFactor,this._panOffset.multiplyScalar(1-this.dampingFactor)):(this._sphericalDelta.set(0,0,0),this._panOffset.set(0,0,0)),this.zoomToCursor&&this._performCursorZoom){let c=null;if(this.object.isPerspectiveCamera){const d=Zt.length();c=this._clampDistance(d*this._scale);const h=d-c;this.object.position.addScaledVector(this._dollyDirection,h),this.object.updateMatrixWorld(),l=!!h}else if(this.object.isOrthographicCamera){const d=new G(this._mouse.x,this._mouse.y,0);d.unproject(this.object);const h=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),this.object.updateProjectionMatrix(),l=h!==this.object.zoom;const g=new G(this._mouse.x,this._mouse.y,0);g.unproject(this.object),this.object.position.sub(g).add(d),this.object.updateMatrixWorld(),c=Zt.length()}else console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."),this.zoomToCursor=!1;c!==null&&(this.screenSpacePanning?this.target.set(0,0,-1).transformDirection(this.object.matrix).multiplyScalar(c).add(this.object.position):(zl.origin.copy(this.object.position),zl.direction.set(0,0,-1).transformDirection(this.object.matrix),Math.abs(this.object.up.dot(zl.direction))<sT?this.object.lookAt(this.target):(ag.setFromNormalAndCoplanarPoint(this.object.up,this.target),zl.intersectPlane(ag,this.target))))}else if(this.object.isOrthographicCamera){const c=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),c!==this.object.zoom&&(this.object.updateProjectionMatrix(),l=!0)}return this._scale=1,this._performCursorZoom=!1,l||this._lastPosition.distanceToSquared(this.object.position)>_f||8*(1-this._lastQuaternion.dot(this.object.quaternion))>_f||this._lastTargetPosition.distanceToSquared(this.target)>_f?(this.dispatchEvent(og),this._lastPosition.copy(this.object.position),this._lastQuaternion.copy(this.object.quaternion),this._lastTargetPosition.copy(this.target),!0):!1}_getAutoRotationAngle(e){return e!==null?Fn/60*this.autoRotateSpeed*e:Fn/60/60*this.autoRotateSpeed}_getZoomScale(e){const t=Math.abs(e*.01);return Math.pow(.95,this.zoomSpeed*t)}_rotateLeft(e){this._sphericalDelta.theta-=e}_rotateUp(e){this._sphericalDelta.phi-=e}_panLeft(e,t){Zt.setFromMatrixColumn(t,0),Zt.multiplyScalar(-e),this._panOffset.add(Zt)}_panUp(e,t){this.screenSpacePanning===!0?Zt.setFromMatrixColumn(t,1):(Zt.setFromMatrixColumn(t,0),Zt.crossVectors(this.object.up,Zt)),Zt.multiplyScalar(e),this._panOffset.add(Zt)}_pan(e,t){const r=this.domElement;if(this.object.isPerspectiveCamera){const a=this.object.position;Zt.copy(a).sub(this.target);let l=Zt.length();l*=Math.tan(this.object.fov/2*Math.PI/180),this._panLeft(2*e*l/r.clientHeight,this.object.matrix),this._panUp(2*t*l/r.clientHeight,this.object.matrix)}else this.object.isOrthographicCamera?(this._panLeft(e*(this.object.right-this.object.left)/this.object.zoom/r.clientWidth,this.object.matrix),this._panUp(t*(this.object.top-this.object.bottom)/this.object.zoom/r.clientHeight,this.object.matrix)):(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."),this.enablePan=!1)}_dollyOut(e){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale/=e:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_dollyIn(e){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale*=e:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_updateZoomParameters(e,t){if(!this.zoomToCursor)return;this._performCursorZoom=!0;const r=this.domElement.getBoundingClientRect(),a=e-r.left,l=t-r.top,c=r.width,d=r.height;this._mouse.x=a/c*2-1,this._mouse.y=-(l/d)*2+1,this._dollyDirection.set(this._mouse.x,this._mouse.y,1).unproject(this.object).sub(this.object.position).normalize()}_clampDistance(e){return Math.max(this.minDistance,Math.min(this.maxDistance,e))}_handleMouseDownRotate(e){this._rotateStart.set(e.clientX,e.clientY)}_handleMouseDownDolly(e){this._updateZoomParameters(e.clientX,e.clientX),this._dollyStart.set(e.clientX,e.clientY)}_handleMouseDownPan(e){this._panStart.set(e.clientX,e.clientY)}_handleMouseMoveRotate(e){this._rotateEnd.set(e.clientX,e.clientY),this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);const t=this.domElement;this._rotateLeft(Fn*this._rotateDelta.x/t.clientHeight),this._rotateUp(Fn*this._rotateDelta.y/t.clientHeight),this._rotateStart.copy(this._rotateEnd),this.update()}_handleMouseMoveDolly(e){this._dollyEnd.set(e.clientX,e.clientY),this._dollyDelta.subVectors(this._dollyEnd,this._dollyStart),this._dollyDelta.y>0?this._dollyOut(this._getZoomScale(this._dollyDelta.y)):this._dollyDelta.y<0&&this._dollyIn(this._getZoomScale(this._dollyDelta.y)),this._dollyStart.copy(this._dollyEnd),this.update()}_handleMouseMovePan(e){this._panEnd.set(e.clientX,e.clientY),this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd),this.update()}_handleMouseWheel(e){this._updateZoomParameters(e.clientX,e.clientY),e.deltaY<0?this._dollyIn(this._getZoomScale(e.deltaY)):e.deltaY>0&&this._dollyOut(this._getZoomScale(e.deltaY)),this.update()}_handleKeyDown(e){let t=!1;switch(e.code){case this.keys.UP:e.ctrlKey||e.metaKey||e.shiftKey?this._rotateUp(Fn*this.rotateSpeed/this.domElement.clientHeight):this._pan(0,this.keyPanSpeed),t=!0;break;case this.keys.BOTTOM:e.ctrlKey||e.metaKey||e.shiftKey?this._rotateUp(-Fn*this.rotateSpeed/this.domElement.clientHeight):this._pan(0,-this.keyPanSpeed),t=!0;break;case this.keys.LEFT:e.ctrlKey||e.metaKey||e.shiftKey?this._rotateLeft(Fn*this.rotateSpeed/this.domElement.clientHeight):this._pan(this.keyPanSpeed,0),t=!0;break;case this.keys.RIGHT:e.ctrlKey||e.metaKey||e.shiftKey?this._rotateLeft(-Fn*this.rotateSpeed/this.domElement.clientHeight):this._pan(-this.keyPanSpeed,0),t=!0;break}t&&(e.preventDefault(),this.update())}_handleTouchStartRotate(e){if(this._pointers.length===1)this._rotateStart.set(e.pageX,e.pageY);else{const t=this._getSecondPointerPosition(e),r=.5*(e.pageX+t.x),a=.5*(e.pageY+t.y);this._rotateStart.set(r,a)}}_handleTouchStartPan(e){if(this._pointers.length===1)this._panStart.set(e.pageX,e.pageY);else{const t=this._getSecondPointerPosition(e),r=.5*(e.pageX+t.x),a=.5*(e.pageY+t.y);this._panStart.set(r,a)}}_handleTouchStartDolly(e){const t=this._getSecondPointerPosition(e),r=e.pageX-t.x,a=e.pageY-t.y,l=Math.sqrt(r*r+a*a);this._dollyStart.set(0,l)}_handleTouchStartDollyPan(e){this.enableZoom&&this._handleTouchStartDolly(e),this.enablePan&&this._handleTouchStartPan(e)}_handleTouchStartDollyRotate(e){this.enableZoom&&this._handleTouchStartDolly(e),this.enableRotate&&this._handleTouchStartRotate(e)}_handleTouchMoveRotate(e){if(this._pointers.length==1)this._rotateEnd.set(e.pageX,e.pageY);else{const r=this._getSecondPointerPosition(e),a=.5*(e.pageX+r.x),l=.5*(e.pageY+r.y);this._rotateEnd.set(a,l)}this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);const t=this.domElement;this._rotateLeft(Fn*this._rotateDelta.x/t.clientHeight),this._rotateUp(Fn*this._rotateDelta.y/t.clientHeight),this._rotateStart.copy(this._rotateEnd)}_handleTouchMovePan(e){if(this._pointers.length===1)this._panEnd.set(e.pageX,e.pageY);else{const t=this._getSecondPointerPosition(e),r=.5*(e.pageX+t.x),a=.5*(e.pageY+t.y);this._panEnd.set(r,a)}this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd)}_handleTouchMoveDolly(e){const t=this._getSecondPointerPosition(e),r=e.pageX-t.x,a=e.pageY-t.y,l=Math.sqrt(r*r+a*a);this._dollyEnd.set(0,l),this._dollyDelta.set(0,Math.pow(this._dollyEnd.y/this._dollyStart.y,this.zoomSpeed)),this._dollyOut(this._dollyDelta.y),this._dollyStart.copy(this._dollyEnd);const c=(e.pageX+t.x)*.5,d=(e.pageY+t.y)*.5;this._updateZoomParameters(c,d)}_handleTouchMoveDollyPan(e){this.enableZoom&&this._handleTouchMoveDolly(e),this.enablePan&&this._handleTouchMovePan(e)}_handleTouchMoveDollyRotate(e){this.enableZoom&&this._handleTouchMoveDolly(e),this.enableRotate&&this._handleTouchMoveRotate(e)}_addPointer(e){this._pointers.push(e.pointerId)}_removePointer(e){delete this._pointerPositions[e.pointerId];for(let t=0;t<this._pointers.length;t++)if(this._pointers[t]==e.pointerId){this._pointers.splice(t,1);return}}_isTrackingPointer(e){for(let t=0;t<this._pointers.length;t++)if(this._pointers[t]==e.pointerId)return!0;return!1}_trackPointer(e){let t=this._pointerPositions[e.pointerId];t===void 0&&(t=new je,this._pointerPositions[e.pointerId]=t),t.set(e.pageX,e.pageY)}_getSecondPointerPosition(e){const t=e.pointerId===this._pointers[0]?this._pointers[1]:this._pointers[0];return this._pointerPositions[t]}_customWheelEvent(e){const t=e.deltaMode,r={clientX:e.clientX,clientY:e.clientY,deltaY:e.deltaY};switch(t){case 1:r.deltaY*=16;break;case 2:r.deltaY*=100;break}return e.ctrlKey&&!this._controlActive&&(r.deltaY*=10),r}}function aT(s){this.enabled!==!1&&(this._pointers.length===0&&(this.domElement.setPointerCapture(s.pointerId),this.domElement.addEventListener("pointermove",this._onPointerMove),this.domElement.addEventListener("pointerup",this._onPointerUp)),!this._isTrackingPointer(s)&&(this._addPointer(s),s.pointerType==="touch"?this._onTouchStart(s):this._onMouseDown(s)))}function lT(s){this.enabled!==!1&&(s.pointerType==="touch"?this._onTouchMove(s):this._onMouseMove(s))}function uT(s){switch(this._removePointer(s),this._pointers.length){case 0:this.domElement.releasePointerCapture(s.pointerId),this.domElement.removeEventListener("pointermove",this._onPointerMove),this.domElement.removeEventListener("pointerup",this._onPointerUp),this.dispatchEvent(Qg),this.state=bt.NONE;break;case 1:const e=this._pointers[0],t=this._pointerPositions[e];this._onTouchStart({pointerId:e,pageX:t.x,pageY:t.y});break}}function cT(s){let e;switch(s.button){case 0:e=this.mouseButtons.LEFT;break;case 1:e=this.mouseButtons.MIDDLE;break;case 2:e=this.mouseButtons.RIGHT;break;default:e=-1}switch(e){case Ks.DOLLY:if(this.enableZoom===!1)return;this._handleMouseDownDolly(s),this.state=bt.DOLLY;break;case Ks.ROTATE:if(s.ctrlKey||s.metaKey||s.shiftKey){if(this.enablePan===!1)return;this._handleMouseDownPan(s),this.state=bt.PAN}else{if(this.enableRotate===!1)return;this._handleMouseDownRotate(s),this.state=bt.ROTATE}break;case Ks.PAN:if(s.ctrlKey||s.metaKey||s.shiftKey){if(this.enableRotate===!1)return;this._handleMouseDownRotate(s),this.state=bt.ROTATE}else{if(this.enablePan===!1)return;this._handleMouseDownPan(s),this.state=bt.PAN}break;default:this.state=bt.NONE}this.state!==bt.NONE&&this.dispatchEvent(Md)}function fT(s){switch(this.state){case bt.ROTATE:if(this.enableRotate===!1)return;this._handleMouseMoveRotate(s);break;case bt.DOLLY:if(this.enableZoom===!1)return;this._handleMouseMoveDolly(s);break;case bt.PAN:if(this.enablePan===!1)return;this._handleMouseMovePan(s);break}}function dT(s){this.enabled===!1||this.enableZoom===!1||this.state!==bt.NONE||(s.preventDefault(),this.dispatchEvent(Md),this._handleMouseWheel(this._customWheelEvent(s)),this.dispatchEvent(Qg))}function hT(s){this.enabled===!1||this.enablePan===!1||this._handleKeyDown(s)}function pT(s){switch(this._trackPointer(s),this._pointers.length){case 1:switch(this.touches.ONE){case js.ROTATE:if(this.enableRotate===!1)return;this._handleTouchStartRotate(s),this.state=bt.TOUCH_ROTATE;break;case js.PAN:if(this.enablePan===!1)return;this._handleTouchStartPan(s),this.state=bt.TOUCH_PAN;break;default:this.state=bt.NONE}break;case 2:switch(this.touches.TWO){case js.DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchStartDollyPan(s),this.state=bt.TOUCH_DOLLY_PAN;break;case js.DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchStartDollyRotate(s),this.state=bt.TOUCH_DOLLY_ROTATE;break;default:this.state=bt.NONE}break;default:this.state=bt.NONE}this.state!==bt.NONE&&this.dispatchEvent(Md)}function mT(s){switch(this._trackPointer(s),this.state){case bt.TOUCH_ROTATE:if(this.enableRotate===!1)return;this._handleTouchMoveRotate(s),this.update();break;case bt.TOUCH_PAN:if(this.enablePan===!1)return;this._handleTouchMovePan(s),this.update();break;case bt.TOUCH_DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchMoveDollyPan(s),this.update();break;case bt.TOUCH_DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchMoveDollyRotate(s),this.update();break;default:this.state=bt.NONE}}function gT(s){this.enabled!==!1&&s.preventDefault()}function _T(s){s.key==="Control"&&(this._controlActive=!0,this.domElement.getRootNode().addEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}function vT(s){s.key==="Control"&&(this._controlActive=!1,this.domElement.getRootNode().removeEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}class xT extends Yt{constructor(e=document.createElement("div")){super(),this.isCSS2DObject=!0,this.element=e,this.element.style.position="absolute",this.element.style.userSelect="none",this.element.setAttribute("draggable",!1),this.center=new je(.5,.5),this.addEventListener("removed",function(){this.traverse(function(t){t.element instanceof t.element.ownerDocument.defaultView.Element&&t.element.parentNode!==null&&t.element.remove()})})}copy(e,t){return super.copy(e,t),this.element=e.element.cloneNode(!0),this.center=e.center,this}}const Ys=new G,lg=new Lt,ug=new Lt,cg=new G,fg=new G;class yT{constructor(e={}){const t=this;let r,a,l,c;const d={objects:new WeakMap},h=e.element!==void 0?e.element:document.createElement("div");h.style.overflow="hidden",this.domElement=h,this.getSize=function(){return{width:r,height:a}},this.render=function(E,T){E.matrixWorldAutoUpdate===!0&&E.updateMatrixWorld(),T.parent===null&&T.matrixWorldAutoUpdate===!0&&T.updateMatrixWorld(),lg.copy(T.matrixWorldInverse),ug.multiplyMatrices(T.projectionMatrix,lg),_(E,E,T),S(E)},this.setSize=function(E,T){r=E,a=T,l=r/2,c=a/2,h.style.width=E+"px",h.style.height=T+"px"};function g(E){E.isCSS2DObject&&(E.element.style.display="none");for(let T=0,v=E.children.length;T<v;T++)g(E.children[T])}function _(E,T,v){if(E.visible===!1){g(E);return}if(E.isCSS2DObject){Ys.setFromMatrixPosition(E.matrixWorld),Ys.applyMatrix4(ug);const m=Ys.z>=-1&&Ys.z<=1&&E.layers.test(v.layers)===!0,P=E.element;P.style.display=m===!0?"":"none",m===!0&&(E.onBeforeRender(t,T,v),P.style.transform="translate("+-100*E.center.x+"%,"+-100*E.center.y+"%)translate("+(Ys.x*l+l)+"px,"+(-Ys.y*c+c)+"px)",P.parentNode!==h&&h.appendChild(P),E.onAfterRender(t,T,v));const L={distanceToCameraSquared:x(v,E)};d.objects.set(E,L)}for(let m=0,P=E.children.length;m<P;m++)_(E.children[m],T,v)}function x(E,T){return cg.setFromMatrixPosition(E.matrixWorld),fg.setFromMatrixPosition(T.matrixWorld),cg.distanceToSquared(fg)}function y(E){const T=[];return E.traverseVisible(function(v){v.isCSS2DObject&&T.push(v)}),T}function S(E){const T=y(E).sort(function(m,P){if(m.renderOrder!==P.renderOrder)return P.renderOrder-m.renderOrder;const L=d.objects.get(m).distanceToCameraSquared,R=d.objects.get(P).distanceToCameraSquared;return L-R}),v=T.length;for(let m=0,P=T.length;m<P;m++)T[m].element.style.zIndex=v-m}}}const ST=6378137;function MT(s){const e=new GE;e.background=new pt(461069);const t=new ei(45,1,.01,500);t.position.set(2.6,1.5,2.4);const r=new VE({antialias:!0});r.setPixelRatio(Math.min(window.devicePixelRatio,2)),r.outputColorSpace=Tn,s.appendChild(r.domElement);const a=new yT;a.domElement.className="viewport-labels",s.appendChild(a.domElement);const l=new oT(t,a.domElement);l.enableDamping=!0,l.dampingFactor=.08,l.rotateSpeed=.55,l.minDistance=1.2,l.maxDistance=40,l.zoomSpeed=.9,l.enablePan=!0;const c=new $s,d=new $s;e.add(c),e.add(d);const h=ET(e),g=TT();e.add(g),AT(e),wT(d,r);const _=new ResizeObserver(y);_.observe(s);let x;S();function y(){const v=Math.max(s.clientWidth,1),m=Math.max(s.clientHeight,1);t.aspect=v/m,t.updateProjectionMatrix(),r.setSize(v,m,!1),a.setSize(v,m)}function S(){l.update(),r.render(e,t),a.render(e,t),x=requestAnimationFrame(S)}function E(v,m){var j;dg(c);const P=Number(v.earthRadius_m)||ST,L=m==="ECI"?"positionEci_m":"positionEcef_m";hg(v.satellites).forEach(I=>{PT(c,I,m,P),CT(c,I.name,I[L],P)}),hg(v.places).forEach(I=>{RT(c,I.name,I[L],P)}),LT(d,v.ecefToEciMatrix,m);const R=m==="ECI"?"unitDirectionEci":"unitDirectionEcef";bT(g,h,(j=v.sun)==null?void 0:j[R])}function T(){cancelAnimationFrame(x),_.disconnect(),l.dispose(),dg(c),g.material.map.dispose(),g.material.dispose(),r.dispose(),a.domElement.remove(),r.domElement.remove()}return{update:E,dispose:T}}function ET(s){s.add(new iT(3159100,1.6));const e=new nT(16774368,2.4);return s.add(e),e}function TT(){const s=document.createElement("canvas");s.width=128,s.height=128;const e=s.getContext("2d"),t=e.createRadialGradient(64,64,4,64,64,64);t.addColorStop(0,"rgba(255,248,224,1)"),t.addColorStop(.25,"rgba(255,236,170,0.85)"),t.addColorStop(.6,"rgba(255,214,110,0.25)"),t.addColorStop(1,"rgba(255,200,80,0)"),e.fillStyle=t,e.fillRect(0,0,128,128);const r=new qE(s);r.colorSpace=Tn;const a=new XE(new jg({map:r,transparent:!0,depthWrite:!1}));return a.scale.setScalar(14),a}function wT(s,e){const t=new Jo(1,128,80),r=new $E({color:16777215,specular:new pt(2107440),shininess:12});new JE().load("/textures/earth_atmos_2048.jpg",l=>{l.colorSpace=Tn,l.anisotropy=e.capabilities.getMaxAnisotropy(),r.map=l,r.needsUpdate=!0}),s.add(new On(t,r));const a=new On(new Jo(1.018,96,64),new so({color:4630783,transparent:!0,opacity:.12,side:An}));s.add(a)}function AT(s){const e=[];for(let r=0;r<1200;r+=1){const a=r*2.399963,l=1-2*r/1199,c=Math.sqrt(1-l*l);e.push(45*c*Math.cos(a),45*l,45*c*Math.sin(a))}const t=new Cn;t.setAttribute("position",new sn(e,3)),s.add(new jE(t,new Kg({color:12114175,size:.035,transparent:!0,opacity:.65})))}function CT(s,e,t,r){if(!Array.isArray(t)||t.length!==3)return;const a=Ed(t,r),l=new On(new Jo(.014,20,14),new so({color:14201434}));l.position.copy(a),l.add(Jg(e,"object-label object-label--satellite")),s.add(l)}function RT(s,e,t,r){if(!Array.isArray(t)||t.length!==3)return;const a=Ed(t,r).normalize().multiplyScalar(1.006),l=new On(new xd(.012),new so({color:14278374}));l.position.copy(a),l.add(Jg(e,"object-label object-label--place")),s.add(l);const c=new On(new yd(.02,.028,32),new so({color:5939416,side:Ei,transparent:!0,opacity:.85}));c.position.copy(a),c.lookAt(a.clone().multiplyScalar(2)),s.add(c)}function PT(s,e,t,r){const l=e[t==="ECI"?"orbitPathEci_m":"orbitPathEcef_m"];if(!Array.isArray(l)||l.length<2)return;const c=l.map(h=>Ed(h,r)),d=new YE(new Cn().setFromPoints(c),new $g({color:14201434,transparent:!0,opacity:.55}));s.add(d)}function Jg(s,e){const t=document.createElement("div");t.className=e,t.textContent=s;const r=new xT(t);return r.center.set(-.08,1.2),r}function Ed(s,e){return new G(s[0]/e,s[2]/e,-s[1]/e)}function bT(s,e,t){const r=Array.isArray(t)&&t.length===3;if(s.visible=r,e.visible=r,!r)return;const a=new G(...t),l=Yl(a).normalize();e.position.copy(l).multiplyScalar(50),s.position.copy(l.multiplyScalar(100))}function LT(s,e,t){if(s.matrixAutoUpdate=!0,s.quaternion.identity(),t!=="ECI"||!Array.isArray(e))return;const r=h=>new G(e[0][0]*h.x+e[0][1]*h.y+e[0][2]*h.z,e[1][0]*h.x+e[1][1]*h.y+e[1][2]*h.z,e[2][0]*h.x+e[2][1]*h.y+e[2][2]*h.z),a=Yl(r(new G(1,0,0))),l=Yl(r(new G(0,0,1))),c=Yl(r(new G(0,-1,0))),d=new Lt().makeBasis(a,l,c);s.quaternion.setFromRotationMatrix(d)}function Yl(s){return new G(s.x,s.z,-s.y)}function dg(s){for(;s.children.length>0;)s.children.pop().traverse(t=>{var r,a;t.isCSS2DObject&&t.element.remove(),(r=t.geometry)==null||r.dispose(),(a=t.material)==null||a.dispose()})}function hg(s){return s?Array.isArray(s)?s:[s]:[]}function DT({sceneData:s,referenceFrame:e}){const t=Jn.useRef(null),r=Jn.useRef(null);return Jn.useEffect(()=>(r.current=MT(t.current),()=>r.current.dispose()),[]),Jn.useEffect(()=>{s&&r.current&&r.current.update(s,e)},[s,e]),et.createElement("div",{className:"viewport",ref:t})}async function e_(s,e={}){const t=await fetch(s,{cache:"no-store",...e}),r=await t.json();if(!t.ok)throw new Error(r.message||`HTTP ${t.status}`);return r}function UT(){return e_("/api/scene")}function IT(s){return e_("/api/command",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({command:s})})}function NT(){var E;const[s,e]=Jn.useState(null),[t,r]=Jn.useState(-1),[a,l]=Jn.useState("Connecting to MATLAB…"),[c,d]=Jn.useState(!1),[h,g]=Jn.useState("ECEF"),_=Jn.useCallback(async()=>{try{const T=await UT();T.revision!==t&&(e(T.scene),r(T.revision)),l("MATLAB scenario synchronized")}catch(T){l(`MATLAB bridge unavailable: ${T.message}`)}},[t]);Jn.useEffect(()=>{_();const T=window.setInterval(_,500);return()=>window.clearInterval(T)},[_]);async function x(T){d(!0),l("Applying command in MATLAB…");try{await IT(T),await _()}catch(v){l(`Command failed: ${v.message}`)}finally{d(!1)}}const y=pg(s==null?void 0:s.satellites),S=pg(s==null?void 0:s.places);return et.createElement("main",{className:"console"},et.createElement("header",{className:"topbar"},et.createElement("div",{className:"brand-mark"},"S"),et.createElement("div",null,et.createElement("h1",null,(s==null?void 0:s.scenarioName)??"Scenario Console"),et.createElement("p",null,"MATLAB · ",h," · metres")),et.createElement("div",{className:"connection"},et.createElement("span",null),a)),et.createElement("aside",{className:"object-browser panel"},et.createElement("h2",null,"Object Browser"),et.createElement(vf,{label:"Satellites",objects:y,symbol:"◈"}),et.createElement(vf,{label:"Places",objects:S,symbol:"⌖"}),et.createElement(vf,{label:"Celestial",objects:s!=null&&s.sun?[s.sun]:[],symbol:"☀"})),et.createElement("section",{className:"viewport-panel"},et.createElement(DT,{sceneData:s,referenceFrame:h}),et.createElement("div",{className:"frame-selector","aria-label":"Reference frame"},["ECEF","ECI"].map(T=>et.createElement("button",{className:h===T?"active":"",key:T,onClick:()=>g(T)},T))),et.createElement("div",{className:"viewport-badge"},h),et.createElement("div",{className:"viewport-help"},"Drag to orbit · Wheel to zoom")),et.createElement("aside",{className:"inspector panel"},et.createElement("h2",null,"Scenario"),et.createElement("dl",null,et.createElement("dt",null,"Epoch"),et.createElement("dd",null,(s==null?void 0:s.epoch)??"—"),et.createElement("dt",null,"Satellites"),et.createElement("dd",null,y.length),et.createElement("dt",null,"Places"),et.createElement("dd",null,S.length),et.createElement("dt",null,"Sun model"),et.createElement("dd",null,((E=s==null?void 0:s.sun)==null?void 0:E.model)??"—")),et.createElement("h3",null,"Create object"),et.createElement("button",{disabled:c,onClick:()=>x("addSatellite")},"Add satellite"),et.createElement("button",{disabled:c,onClick:()=>x("addPlace")},"Add Ohio place"),et.createElement("p",{className:"notice"},"Analysis remains authoritative in MATLAB.")),et.createElement("footer",{className:"timeline"},et.createElement("button",{className:"play",disabled:!0},"▶"),et.createElement("div",{className:"track"},et.createElement("span",null)),et.createElement("time",null,(s==null?void 0:s.epoch)??"No epoch loaded")))}function vf({label:s,objects:e,symbol:t}){return et.createElement("section",{className:"object-group"},et.createElement("h3",null,"⌄ ",s," ",et.createElement("small",null,e.length)),e.map(r=>et.createElement("div",{className:"object-row",key:r.name},et.createElement("span",null,t),r.name)))}function pg(s){return s?Array.isArray(s)?s:[s]:[]}Bv.createRoot(document.getElementById("root")).render(et.createElement(et.StrictMode,null,et.createElement(NT,null)));
