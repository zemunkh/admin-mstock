import{c as p,o as l,a as d,r as i,n as o,u,b as _,g as f,d as k,e as m,f as c,h as g,w as s,i as n,_ as h,j as x,k as w}from"./index.d6815db1.js";const b={__name:"SectionFullScreen",props:{bg:{type:String,required:!0,validator:e=>["purplePink","pinkRed"].includes(e)}},setup(e){const a=e,r=p(()=>{if(_().darkMode)return f;switch(a.bg){case"purplePink":return m;case"pinkRed":return k}return""});return(t,S)=>(l(),d("div",{class:o(["flex min-h-screen items-center justify-center",u(r)])},[i(t.$slots,"default",{cardClass:"w-11/12 md:w-7/12 lg:w-6/12 xl:w-4/12 shadow-2xl"})],2))}},$={class:"bg-gray-50 dark:bg-slate-800 dark:text-slate-100"},y={__name:"LayoutGuest",setup(e){const a=_();return(r,t)=>(l(),d("div",{class:o({dark:u(a).darkMode})},[c("div",$,[i(r.$slots,"default")])],2))}},B=c("div",{class:"space-y-3"},[c("h1",{class:"text-2xl"},"Unhandled exception"),c("p",null,"An Error Occurred")],-1),P={__name:"ErrorView",setup(e){return(a,r)=>(l(),g(y,null,{default:s(()=>[n(b,{bg:"pinkRed"},{default:s(({cardClass:t})=>[n(h,{class:o(t)},{footer:s(()=>[n(x,null,{default:s(()=>[n(w,{label:"Done",to:"/dashboard",color:"danger"})]),_:1})]),default:s(()=>[B]),_:2},1032,["class"])]),_:1})]),_:1}))}};export{P as default};
