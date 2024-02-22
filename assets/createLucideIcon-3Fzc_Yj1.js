import{$ as v,y as t,e as A,H as I,r as b}from"./index-GW0cDr1L.js";function L(o){const u=o+"CollectionProvider",[f,C]=v(u),[a,s]=f(u,{collectionRef:{current:null},itemMap:new Map}),$=n=>{const{scope:e,children:i}=n,r=t.useRef(null),c=t.useRef(new Map).current;return t.createElement(a,{scope:e,itemMap:c,collectionRef:r},i)},x=o+"CollectionSlot",d=t.forwardRef((n,e)=>{const{scope:i,children:r}=n,c=s(x,i),l=A(e,c.collectionRef);return t.createElement(I,{ref:l},r)}),R=o+"CollectionItemSlot",m="data-radix-collection-item",E=t.forwardRef((n,e)=>{const{scope:i,children:r,...c}=n,l=t.useRef(null),w=A(e,l),p=s(R,i);return t.useEffect(()=>(p.itemMap.set(l,{ref:l,...c}),()=>void p.itemMap.delete(l))),t.createElement(I,{[m]:"",ref:w},r)});function M(n){const e=s(o+"CollectionConsumer",n);return t.useCallback(()=>{const r=e.collectionRef.current;if(!r)return[];const c=Array.from(r.querySelectorAll(`[${m}]`));return Array.from(e.itemMap.values()).sort((p,h)=>c.indexOf(p.ref.current)-c.indexOf(h.ref.current))},[e.collectionRef,e.itemMap])}return[{Provider:$,Slot:d,ItemSlot:E},M,C]}/**
 * @license lucide-react v0.321.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var S={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.321.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const N=o=>o.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase().trim(),T=(o,u)=>{const f=b.forwardRef(({color:C="currentColor",size:a=24,strokeWidth:s=2,absoluteStrokeWidth:$,className:x="",children:d,...R},m)=>b.createElement("svg",{ref:m,...S,width:a,height:a,stroke:C,strokeWidth:$?Number(s)*24/Number(a):s,className:["lucide",`lucide-${N(o)}`,x].join(" "),...R},[...u.map(([E,M])=>b.createElement(E,M)),...Array.isArray(d)?d:[d]]));return f.displayName=`${o}`,f};export{L as $,T as c};
