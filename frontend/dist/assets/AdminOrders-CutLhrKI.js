import{c as K,u as Q,r as l,Y as g,e as b,j as e,d as Z,C as v,Z as y,_ as I,I as G,O as N,J as z,K as w,o as n,L as W}from"./index-o8jQAD_T.js";import{P as X}from"./Pagination-CZ2eztU-.js";import{E as ee}from"./EmptyState-ygVo0XmV.js";import{M as te}from"./Modal-C69JpBgw.js";import{B as S}from"./Button-Dsnlw7Gd.js";import{S as se}from"./shopping-cart-t70aA3XK.js";import{E as ae}from"./eye-B3ZO2ZTE.js";import"./chevron-left-ClP3Y4Zv.js";import"./chevron-right-BLg8t3c0.js";/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ie=K("Printer",[["path",{d:"M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2",key:"143wyd"}],["path",{d:"M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6",key:"1itne7"}],["rect",{x:"6",y:"14",width:"12",height:"8",rx:"1",key:"1ue0tg"}]]);function he(){const p=Q(),[_,f]=l.useState([]),[o,M]=l.useState(null),[R,$]=l.useState(!0),[j,C]=l.useState(""),[T,k]=l.useState(""),[h,E]=l.useState(""),[u,P]=l.useState(""),[A,x]=l.useState(1),[s,m]=l.useState(null),[L,O]=l.useState(null);l.useEffect(()=>{let t=!0;return $(!0),g.orders({search:j||void 0,status:h||void 0,payment_status:u||void 0,page:A}).then(({data:a})=>{t&&(f(a.data.orders),M(a.data.pagination))}).catch(a=>p.error(b(a))).finally(()=>t&&$(!1)),()=>t=!1},[j,h,u,A]);const Y=t=>{t.preventDefault(),x(1),C(T.trim())},U=async(t,a)=>{O(t);try{const{data:i}=await g.updateOrderStatus(t,a);f(c=>c.map(r=>r.id===t?i.data.order:r)),(s==null?void 0:s.id)===t&&m(i.data.order),p.success("Order status updated.")}catch(i){p.error(b(i))}finally{O(null)}},V=async(t,a)=>{try{const{data:i}=await g.updateOrderPaymentStatus(t,a);f(c=>c.map(r=>r.id===t?i.data.order:r)),(s==null?void 0:s.id)===t&&m(i.data.order),p.success("Payment status updated.")}catch(i){p.error(b(i))}},B=async t=>{try{const{data:a}=await g.order(t);m(a.data.order)}catch(a){p.error(b(a))}},q=t=>{var c,r,D,F;const a=`
<!DOCTYPE html>
<html>
<head>
  <title>Invoice #${t.order_number}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #1a1a1a; max-width: 800px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #111; padding-bottom: 20px; margin-bottom: 30px; }
    .brand { font-size: 28px; font-weight: 800; letter-spacing: -0.5px; }
    .invoice-label { font-size: 14px; color: #666; text-align: right; }
    .invoice-number { font-size: 22px; font-weight: 700; margin-top: 4px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px; }
    .section h3 { font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #888; margin-bottom: 8px; }
    .section p { font-size: 14px; line-height: 1.6; }
    .section .name { font-weight: 700; font-size: 15px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    th { background: #f5f5f5; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #666; padding: 10px 12px; }
    td { padding: 12px; border-bottom: 1px solid #eee; font-size: 14px; }
    .totals { margin-left: auto; width: 300px; }
    .totals .row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; }
    .totals .total { border-top: 2px solid #111; margin-top: 8px; padding-top: 8px; font-size: 18px; font-weight: 800; }
    .status { display: inline-block; padding: 3px 10px; border-radius: 99px; font-size: 12px; font-weight: 600; }
    .status-paid { background: #ecfdf5; color: #059669; }
    .status-pending { background: #fef9c3; color: #ca8a04; }
    .footer { border-top: 1px solid #eee; padding-top: 20px; text-align: center; font-size: 12px; color: #999; margin-top: 40px; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">NOVA</div>
      <div class="invoice-label">eCommerce Store</div>
    </div>
    <div class="invoice-label">
      <div>INVOICE</div>
      <div class="invoice-number">#${t.order_number}</div>
      <div style="margin-top:4px">${w(t.created_at)}</div>
    </div>
  </div>
  <div class="grid">
    <div class="section">
      <h3>Bill To</h3>
      <p class="name">${t.shipping.name}</p>
      <p>${t.shipping.address||""}</p>
      <p>${t.shipping.city||""}${t.shipping.state?", "+t.shipping.state:""} ${t.shipping.postal_code||""}</p>
      <p>${t.shipping.country||""}</p>
      <p style="margin-top:8px">${t.shipping.email}</p>
      <p>${t.shipping.phone||""}</p>
    </div>
    <div class="section">
      <h3>Payment Details</h3>
      <p>Method: ${((c=t.payment_method)==null?void 0:c.replace(/_/g," ").replace(/\b\w/g,d=>d.toUpperCase()))||"N/A"}</p>
      <p style="margin-top:6px">Status: <span class="status status-${t.payment_status==="paid"?"paid":"pending"}">${(r=t.payment_status)==null?void 0:r.toUpperCase()}</span></p>
      <p style="margin-top:12px">Order Status: <strong>${((D=t.status)==null?void 0:D.charAt(0).toUpperCase())+((F=t.status)==null?void 0:F.slice(1))}</strong></p>
      ${t.coupon_code?`<p style="margin-top:6px">Coupon: <strong>${t.coupon_code}</strong></p>`:""}
    </div>
  </div>
  <table>
    <thead>
      <tr>
        <th>Item</th>
        <th>Price</th>
        <th>Qty</th>
        <th style="text-align:right">Total</th>
      </tr>
    </thead>
    <tbody>
      ${(t.items||[]).map(d=>`
        <tr>
          <td><strong>${d.name}</strong></td>
          <td>${n(d.price)}</td>
          <td>${d.quantity}</td>
          <td style="text-align:right;font-weight:600">${n(d.total)}</td>
        </tr>
      `).join("")}
    </tbody>
  </table>
  <div class="totals">
    <div class="row"><span>Subtotal</span><span>${n(t.subtotal)}</span></div>
    ${t.discount>0?`<div class="row" style="color:#059669"><span>Discount</span><span>-${n(t.discount)}</span></div>`:""}
    <div class="row"><span>Shipping</span><span>${t.shipping_fee===0?"FREE":n(t.shipping_fee)}</span></div>
    <div class="row"><span>Tax</span><span>${n(t.tax)}</span></div>
    <div class="row total"><span>Total</span><span>${n(t.total)}</span></div>
  </div>
  <div class="footer">
    <p>Thank you for your purchase!</p>
    <p style="margin-top:4px">Nova eCommerce &mdash; This is a system-generated invoice.</p>
  </div>
</body>
</html>`,i=window.open("","_blank");i.document.write(a),i.document.close(),i.focus(),setTimeout(()=>i.print(),500)},H=()=>{C(""),k(""),E(""),P(""),x(1)},J=j||h||u;return e.jsxs("div",{className:"space-y-6",children:[e.jsx("div",{className:"flex flex-wrap items-center justify-between gap-3",children:e.jsxs("div",{children:[e.jsx("h2",{className:"text-2xl font-extrabold tracking-tight text-zinc-900",children:"Orders"}),e.jsxs("p",{className:"mt-1 text-sm text-zinc-500",children:[(o==null?void 0:o.total)??0," orders"]})]})}),e.jsx("div",{className:"card space-y-3 p-4",children:e.jsxs("form",{onSubmit:Y,className:"flex flex-wrap gap-3",children:[e.jsxs("div",{className:"relative flex-1",children:[e.jsx(Z,{size:17,className:"pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"}),e.jsx("input",{value:T,onChange:t=>k(t.target.value),placeholder:"Search order #, name or email…",className:"w-full rounded-lg border border-zinc-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"})]}),e.jsxs("div",{className:"relative",children:[e.jsx(v,{size:15,className:"pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400"}),e.jsxs("select",{value:h,onChange:t=>{E(t.target.value),x(1)},className:"appearance-none rounded-lg border border-zinc-200 bg-white py-2.5 pl-4 pr-9 text-sm focus:border-brand-500 focus:outline-none",children:[e.jsx("option",{value:"",children:"All statuses"}),y.map(t=>e.jsx("option",{value:t,children:t.charAt(0).toUpperCase()+t.slice(1)},t))]})]}),e.jsxs("div",{className:"relative",children:[e.jsx(v,{size:15,className:"pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400"}),e.jsxs("select",{value:u,onChange:t=>{P(t.target.value),x(1)},className:"appearance-none rounded-lg border border-zinc-200 bg-white py-2.5 pl-4 pr-9 text-sm focus:border-brand-500 focus:outline-none",children:[e.jsx("option",{value:"",children:"All payments"}),I.map(t=>e.jsx("option",{value:t,children:t.charAt(0).toUpperCase()+t.slice(1)},t))]})]}),e.jsx(S,{type:"submit",variant:"primary",children:"Search"}),J&&e.jsx(S,{type:"button",variant:"secondary",onClick:H,children:"Clear"})]})}),R?e.jsx("div",{className:"flex justify-center py-20",children:e.jsx(G,{})}):_.length===0?e.jsx(ee,{icon:se,title:"No orders found",description:"Orders placed by customers will appear here."}):e.jsxs("div",{className:"card overflow-hidden",children:[e.jsx("div",{className:"overflow-x-auto",children:e.jsxs("table",{className:"w-full text-left text-sm",children:[e.jsx("thead",{children:e.jsxs("tr",{className:"border-b border-zinc-100 bg-zinc-50/60 text-xs uppercase tracking-wider text-zinc-500",children:[e.jsx("th",{className:"px-6 py-3 font-semibold",children:"Order"}),e.jsx("th",{className:"px-6 py-3 font-semibold",children:"Customer"}),e.jsx("th",{className:"px-6 py-3 font-semibold",children:"Date"}),e.jsx("th",{className:"px-6 py-3 font-semibold",children:"Payment"}),e.jsx("th",{className:"px-6 py-3 font-semibold",children:"Status"}),e.jsx("th",{className:"px-6 py-3 text-right font-semibold",children:"Total"}),e.jsx("th",{className:"px-6 py-3"})]})}),e.jsx("tbody",{children:_.map(t=>{const a=N[t.status]||{},i=z[t.payment_status]||{};return e.jsxs("tr",{className:"border-b border-zinc-50 hover:bg-zinc-50/50",children:[e.jsxs("td",{className:"px-6 py-3.5 font-semibold text-zinc-900",children:["#",t.order_number]}),e.jsxs("td",{className:"px-6 py-3.5",children:[e.jsx("p",{className:"font-medium text-zinc-700",children:t.shipping.name}),e.jsx("p",{className:"text-xs text-zinc-400",children:t.shipping.email})]}),e.jsx("td",{className:"px-6 py-3.5 text-zinc-500",children:w(t.created_at)}),e.jsx("td",{className:"px-6 py-3.5",children:e.jsx("span",{className:`chip ring-1 ${i.className||"bg-zinc-100 text-zinc-500 ring-zinc-200"}`,children:i.label||t.payment_status})}),e.jsx("td",{className:"px-6 py-3.5",children:e.jsxs("div",{className:"relative inline-block",children:[e.jsx("select",{value:t.status,disabled:L===t.id,onChange:c=>U(t.id,c.target.value),className:`appearance-none rounded-full py-1.5 pl-3 pr-8 text-xs font-semibold ring-1 transition disabled:opacity-60 ${a.className}`,children:y.map(c=>e.jsx("option",{value:c,className:"bg-white text-zinc-900",children:c.charAt(0).toUpperCase()+c.slice(1)},c))}),e.jsx(v,{size:13,className:"pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400"})]})}),e.jsx("td",{className:"px-6 py-3.5 text-right font-bold text-zinc-900",children:n(t.total)}),e.jsx("td",{className:"px-6 py-3.5",children:e.jsx("button",{onClick:()=>B(t.id),className:"flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-brand-50 hover:text-brand-700","aria-label":"View order",children:e.jsx(ae,{size:16})})})]},t.id)})})]})}),o&&e.jsx("div",{className:"border-t border-zinc-100 p-4",children:e.jsx(X,{page:o.current_page,lastPage:o.last_page,onChange:x})})]}),e.jsx(te,{open:!!s,onClose:()=>m(null),title:`Order #${(s==null?void 0:s.order_number)??""}`,size:"lg",children:s&&e.jsxs("div",{className:"space-y-5",children:[e.jsxs("div",{className:"flex flex-wrap items-center justify-between gap-3",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:`chip ring-1 ${(N[s.status]||{}).className}`,children:(N[s.status]||{}).label}),e.jsxs("span",{className:`chip ring-1 ${(z[s.payment_status]||{}).className}`,children:["Payment: ",(z[s.payment_status]||{}).label||s.payment_status]}),e.jsx("span",{className:"text-sm text-zinc-500",children:w(s.created_at)})]}),e.jsxs("div",{className:"text-right",children:[e.jsx("p",{className:"text-xs text-zinc-500",children:"Total"}),e.jsx("p",{className:"text-xl font-extrabold text-zinc-900",children:n(s.total)})]})]}),e.jsxs("div",{className:"grid gap-4 sm:grid-cols-2",children:[e.jsxs("div",{className:"rounded-2xl bg-zinc-50 p-4",children:[e.jsx("h4",{className:"text-xs font-bold uppercase tracking-wider text-zinc-500",children:"Customer"}),s.user?e.jsxs("div",{className:"mt-2",children:[e.jsx("p",{className:"text-sm font-semibold text-zinc-900",children:s.user.name}),e.jsx("p",{className:"text-sm text-zinc-600",children:s.user.email}),s.user.phone&&e.jsx("p",{className:"text-sm text-zinc-600",children:s.user.phone}),e.jsx(W,{to:"/admin/customers",onClick:()=>m(null),className:"mt-2 inline-block text-xs font-semibold text-brand-600 hover:text-brand-800",children:"View customer profile"})]}):e.jsxs("div",{className:"mt-2",children:[e.jsx("p",{className:"text-sm font-semibold text-zinc-900",children:s.shipping.name}),e.jsx("p",{className:"text-sm text-zinc-600",children:s.shipping.email})]})]}),e.jsxs("div",{className:"rounded-2xl bg-zinc-50 p-4",children:[e.jsx("h4",{className:"text-xs font-bold uppercase tracking-wider text-zinc-500",children:"Shipping Address"}),e.jsx("p",{className:"mt-2 text-sm text-zinc-600",children:s.shipping.address}),e.jsxs("p",{className:"text-sm text-zinc-600",children:[s.shipping.city,s.shipping.state?`, ${s.shipping.state}`:""," ",s.shipping.postal_code]}),e.jsx("p",{className:"text-sm text-zinc-600",children:s.shipping.country}),e.jsx("p",{className:"mt-1 text-sm text-zinc-600",children:s.shipping.phone}),e.jsxs("p",{className:"mt-1 text-sm capitalize text-zinc-500",children:[s.shipping_method," delivery"]})]})]}),e.jsx("div",{className:"space-y-3",children:(s.items||[]).map(t=>e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("img",{src:t.image,alt:"",className:"h-14 w-14 rounded-xl bg-zinc-100 object-cover",onError:a=>a.currentTarget.style.opacity=.15}),e.jsxs("div",{className:"min-w-0 flex-1",children:[e.jsx("p",{className:"truncate text-sm font-semibold text-zinc-900",children:t.name}),e.jsxs("p",{className:"text-xs text-zinc-500",children:[n(t.price)," × ",t.quantity]})]}),e.jsx("p",{className:"text-sm font-bold text-zinc-900",children:n(t.total)})]},t.id))}),e.jsxs("div",{className:"space-y-2 border-t border-dashed border-zinc-200 pt-4 text-sm",children:[e.jsxs("div",{className:"flex justify-between text-zinc-600",children:[e.jsx("span",{children:"Subtotal"}),e.jsx("span",{children:n(s.subtotal)})]}),s.discount>0&&e.jsxs("div",{className:"flex justify-between text-emerald-600",children:[e.jsxs("span",{children:["Discount ",s.coupon_code?`(${s.coupon_code})`:""]}),e.jsxs("span",{children:["−",n(s.discount)]})]}),e.jsxs("div",{className:"flex justify-between text-zinc-600",children:[e.jsx("span",{children:"Shipping"}),e.jsx("span",{children:s.shipping_fee===0?"FREE":n(s.shipping_fee)})]}),e.jsxs("div",{className:"flex justify-between text-zinc-600",children:[e.jsx("span",{children:"Tax"}),e.jsx("span",{children:n(s.tax)})]}),e.jsxs("div",{className:"flex justify-between border-t border-zinc-200 pt-2 text-base font-extrabold text-zinc-900",children:[e.jsx("span",{children:"Total"}),e.jsx("span",{children:n(s.total)})]})]}),e.jsxs("div",{className:"grid gap-4 sm:grid-cols-2",children:[e.jsxs("div",{children:[e.jsx("h4",{className:"mb-2 text-xs font-bold uppercase tracking-wider text-zinc-500",children:"Update Order Status"}),e.jsx("div",{className:"flex flex-wrap gap-2",children:y.map(t=>e.jsx("button",{onClick:()=>U(s.id,t),disabled:s.status===t,className:`rounded-full px-4 py-2 text-xs font-semibold transition ${s.status===t?"bg-zinc-900 text-white":"bg-zinc-100 text-zinc-600 hover:bg-zinc-200"}`,children:t.charAt(0).toUpperCase()+t.slice(1)},t))})]}),e.jsxs("div",{children:[e.jsx("h4",{className:"mb-2 text-xs font-bold uppercase tracking-wider text-zinc-500",children:"Update Payment Status"}),e.jsx("div",{className:"flex flex-wrap gap-2",children:I.map(t=>e.jsx("button",{onClick:()=>V(s.id,t),disabled:s.payment_status===t,className:`rounded-full px-4 py-2 text-xs font-semibold transition ${s.payment_status===t?"bg-zinc-900 text-white":"bg-zinc-100 text-zinc-600 hover:bg-zinc-200"}`,children:t.charAt(0).toUpperCase()+t.slice(1)},t))})]})]}),e.jsx("div",{className:"flex justify-end border-t border-zinc-100 pt-4",children:e.jsx(S,{variant:"secondary",icon:ie,onClick:()=>q(s),children:"Print Invoice"})})]})})]})}export{he as default};
