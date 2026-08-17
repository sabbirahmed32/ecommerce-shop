import{c as o,j as r,s as n}from"./index-o8jQAD_T.js";/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const f=o("StarHalf",[["path",{d:"M12 18.338a2.1 2.1 0 0 0-.987.244L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.12 2.12 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.12 2.12 0 0 0 1.597-1.16l2.309-4.679A.53.53 0 0 1 12 2",key:"2ksp49"}]]);function u({value:c=0,size:s=16,className:m=""}){const a=Number(c)||0,t=Math.floor(a),l=a-t>=.25&&a-t<.75?.5:a-t>=.75?1:0;return r.jsx("div",{className:`flex items-center gap-0.5 ${m}`,"aria-label":`Rated ${a} out of 5`,children:[1,2,3,4,5].map(e=>e<=t+l?r.jsx(n,{size:s,className:"fill-amber-400 text-amber-400"},e):e===t+1&&l===.5?r.jsx(f,{size:s,className:"fill-amber-400 text-amber-400"},e):r.jsx(n,{size:s,className:"text-zinc-300"},e))})}export{u as R};
