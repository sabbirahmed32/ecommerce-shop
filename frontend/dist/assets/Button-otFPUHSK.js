import{c as o,j as t}from"./index-6Vaa7jlb.js";/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const m=o("LoaderCircle",[["path",{d:"M21 12a9 9 0 1 1-6.219-8.56",key:"13zald"}]]),x={primary:"btn-primary",accent:"btn-accent",secondary:"btn-secondary",ghost:"btn-ghost",danger:"btn-danger"};function l({variant:n="primary",size:r="md",loading:e,icon:s,children:c,className:i="",...a}){const d={sm:"px-4 py-2 text-xs",md:"px-5 py-3 text-sm",lg:"px-7 py-3.5 text-base"};return t.jsxs("button",{className:`${x[n]} ${d[r]} ${i}`,disabled:e||a.disabled,...a,children:[e?t.jsx(m,{size:18,className:"animate-spin"}):s?t.jsx(s,{size:18}):null,c]})}export{l as B};
