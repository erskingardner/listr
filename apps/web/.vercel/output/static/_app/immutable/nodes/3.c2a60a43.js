import{s as j,f as y,g as $,h as N,d as m,j as h,i as S,y as k,z as H,o as Z,Q as le,e as M,T as ne,l as ae,a as D,m as oe,c as U,x as g,n as ue,R as Q,S as ie,r as fe,u as ce,v as de,w as _e,b as pe}from"../chunks/scheduler.d926ef25.js";import{S as x,i as ee,t as w,c as te,a as E,g as se,b as V,d as L,m as R,e as A}from"../chunks/index.d0db5775.js";import{n as re,S as be,N as me,b as he,e as G,q as T,f as ge,c as ke}from"../chunks/currentUserFollows.1b7aaca4.js";import{p as ve}from"../chunks/stores.83cdea14.js";import{a as ye}from"../chunks/navigation.1c19c233.js";import{U as $e,F as we,A as Ee,a as De}from"../chunks/UserDetails.9d64d9ac.js";function J(n,e,t){const s=n.slice();return s[7]=e[t],s}function W(n){let e,t=G(n[1]),s=[];for(let r=0;r<t.length;r+=1)s[r]=X(J(n,t,r));return{c(){for(let r=0;r<s.length;r+=1)s[r].c();e=M()},l(r){for(let a=0;a<s.length;a+=1)s[a].l(r);e=M()},m(r,a){for(let l=0;l<s.length;l+=1)s[l]&&s[l].m(r,a);S(r,e,a)},p(r,a){if(a&19){t=G(r[1]);let l;for(l=0;l<t.length;l+=1){const o=J(r,t,l);s[l]?s[l].p(o,a):(s[l]=X(o),s[l].c(),s[l].m(e.parentNode,e))}for(;l<s.length;l+=1)s[l].d(1);s.length=t.length}},d(r){r&&m(e),ne(s,r)}}}function X(n){let e,t=n[7].name+"",s,r,a,l;return{c(){e=y("a"),s=ae(t),r=D(),this.h()},l(o){e=$(o,"A",{href:!0,class:!0});var f=N(e);s=oe(f,t),r=U(f),f.forEach(m),this.h()},h(){h(e,"href",a="/"+T.npubEncode(n[0])+"/"+n[7].kind+"/"+n[7].encode()),h(e,"class",l="p-2 hover:bg-gray-100 font-semibold "+(n[4].url.pathname===`/${T.npubEncode(n[0])}/${n[7].kind}/${n[7].encode()}`?"bg-gray-100":"")+" w-full block rounded-md text-left truncate")},m(o,f){S(o,e,f),g(e,s),g(e,r)},p(o,f){f&2&&t!==(t=o[7].name+"")&&ue(s,t),f&3&&a!==(a="/"+T.npubEncode(o[0])+"/"+o[7].kind+"/"+o[7].encode())&&h(e,"href",a),f&19&&l!==(l="p-2 hover:bg-gray-100 font-semibold "+(o[4].url.pathname===`/${T.npubEncode(o[0])}/${o[7].kind}/${o[7].encode()}`?"bg-gray-100":"")+" w-full block rounded-md text-left truncate")&&h(e,"class",l)},d(o){o&&m(e)}}}function Ue(n){let e,t=n[1]&&W(n);return{c(){e=y("div"),t&&t.c(),this.h()},l(s){e=$(s,"DIV",{class:!0});var r=N(e);t&&t.l(r),r.forEach(m),this.h()},h(){h(e,"class","flex flex-col gap-0.5")},m(s,r){S(s,e,r),t&&t.m(e,null)},p(s,[r]){s[1]?t?t.p(s,r):(t=W(s),t.c(),t.m(e,null)):t&&(t.d(1),t=null)},i:k,o:k,d(s){s&&m(e),t&&t.d()}}}function Se(n,e,t){let s,r=k,a=()=>(r(),r=Q(c,d=>t(5,s=d)),c),l,o=k,f=()=>(o(),o=Q(u,d=>t(1,l=d)),u),_,v;H(n,re,d=>t(6,_=d)),H(n,ve,d=>t(4,v=d)),n.$$.on_destroy.push(()=>r()),n.$$.on_destroy.push(()=>o());let{userPubkey:p}=e,u,c;return Z(()=>{f(t(2,u=_.storeSubscribe({kinds:be,authors:[p]},{closeOnEose:!1},me))),a(t(3,c=_.storeSubscribe({kinds:[he.EventDeletion],authors:[p]})))}),le(()=>{u==null||u.unsubscribe(),c==null||c.unsubscribe()}),n.$$set=d=>{"userPubkey"in d&&t(0,p=d.userPubkey)},n.$$.update=()=>{n.$$.dirty&34&&l&&ie(u,l=ge(l,s),l)},[p,l,u,c,v,s]}class qe extends x{constructor(e){super(),ee(this,e,Se,Ue,j,{userPubkey:0})}}function Ie(n){let e,t=n[0].pubkey,s,r=Y(n);return{c(){e=y("div"),r.c(),this.h()},l(a){e=$(a,"DIV",{class:!0});var l=N(e);r.l(l),l.forEach(m),this.h()},h(){h(e,"class","text-sm flex flex-col gap-2 border border-gray-300 rounded-md shadow-md p-4 w-[18rem] shrink-0 svelte-dtwd0q")},m(a,l){S(a,e,l),r.m(e,null),s=!0},p(a,l){l&1&&j(t,t=a[0].pubkey)?(se(),w(r,1,1,k),te(),r=Y(a),r.c(),E(r,1),r.m(e,null)):r.p(a,l)},i(a){s||(E(r),s=!0)},o(a){w(r),s=!1},d(a){a&&m(e),r.d(a)}}}function Ne(n){return{c:k,l:k,m:k,p:k,i:k,o:k,d:k}}function Y(n){let e,t,s,r,a,l,o,f,_,v,p,u,c,d,P,B,q,K;return t=new $e({props:{user:n[1],npubCopy:!0,avatarSize:"16"}}),o=new we({props:{user:n[1]}}),_=new Ee({props:{user:n[1]}}),c=new De({props:{user:n[1]}}),q=new qe({props:{userPubkey:n[0].pubkey}}),{c(){e=y("div"),V(t.$$.fragment),s=D(),r=y("hr"),a=D(),l=y("div"),V(o.$$.fragment),f=D(),V(_.$$.fragment),v=D(),p=y("hr"),u=D(),V(c.$$.fragment),d=D(),P=y("hr"),B=D(),V(q.$$.fragment),this.h()},l(i){e=$(i,"DIV",{class:!0});var b=N(e);L(t.$$.fragment,b),s=U(b),r=$(b,"HR",{class:!0}),a=U(b),l=$(b,"DIV",{class:!0});var I=N(l);L(o.$$.fragment,I),f=U(I),L(_.$$.fragment,I),I.forEach(m),v=U(b),p=$(b,"HR",{class:!0}),u=U(b),L(c.$$.fragment,b),b.forEach(m),d=U(i),P=$(i,"HR",{class:!0}),B=U(i),L(q.$$.fragment,i),this.h()},h(){h(r,"class","svelte-dtwd0q"),h(l,"class","flex flex-row gap-2 justify-between items-stretch svelte-dtwd0q"),h(p,"class","svelte-dtwd0q"),h(e,"class","flex flex-col gap-2 svelte-dtwd0q"),h(P,"class","svelte-dtwd0q")},m(i,b){S(i,e,b),R(t,e,null),g(e,s),g(e,r),g(e,a),g(e,l),R(o,l,null),g(l,f),R(_,l,null),g(e,v),g(e,p),g(e,u),R(c,e,null),S(i,d,b),S(i,P,b),S(i,B,b),R(q,i,b),K=!0},p(i,b){const I={};b&2&&(I.user=i[1]),t.$set(I);const z={};b&2&&(z.user=i[1]),o.$set(z);const C={};b&2&&(C.user=i[1]),_.$set(C);const F={};b&2&&(F.user=i[1]),c.$set(F);const O={};b&1&&(O.userPubkey=i[0].pubkey),q.$set(O)},i(i){K||(E(t.$$.fragment,i),E(o.$$.fragment,i),E(_.$$.fragment,i),E(c.$$.fragment,i),E(q.$$.fragment,i),K=!0)},o(i){w(t.$$.fragment,i),w(o.$$.fragment,i),w(_.$$.fragment,i),w(c.$$.fragment,i),w(q.$$.fragment,i),K=!1},d(i){i&&(m(e),m(d),m(P),m(B)),A(t),A(o),A(_),A(c),A(q,i)}}}function Pe(n){let e,t,s,r,a,l;const o=[Ne,Ie],f=[];function _(u,c){var d;return((d=u[2])==null?void 0:d.npub)===u[1].npub?0:1}t=_(n),s=f[t]=o[t](n);const v=n[4].default,p=fe(v,n,n[3],null);return{c(){e=y("div"),s.c(),r=D(),a=y("div"),p&&p.c(),this.h()},l(u){e=$(u,"DIV",{class:!0});var c=N(e);s.l(c),r=U(c),a=$(c,"DIV",{class:!0});var d=N(a);p&&p.l(d),d.forEach(m),c.forEach(m),this.h()},h(){h(a,"class","flex flex-col gap-2 border border-gray-300 rounded-md shadow-md p-4 grow svelte-dtwd0q"),h(e,"class","flex flex-row gap-6 svelte-dtwd0q")},m(u,c){S(u,e,c),f[t].m(e,null),g(e,r),g(e,a),p&&p.m(a,null),l=!0},p(u,[c]){let d=t;t=_(u),t===d?f[t].p(u,c):(se(),w(f[d],1,1,()=>{f[d]=null}),te(),s=f[t],s?s.p(u,c):(s=f[t]=o[t](u),s.c()),E(s,1),s.m(e,r)),p&&p.p&&(!l||c&8)&&ce(p,v,u,u[3],l?_e(v,u[3],c,null):de(u[3]),null)},i(u){l||(E(s),E(p,u),l=!0)},o(u){w(s),w(p,u),l=!1},d(u){u&&m(e),f[t].d(),p&&p.d(u)}}}function Ve(n,e,t){let s,r;H(n,re,_=>t(5,s=_)),H(n,ke,_=>t(2,r=_));let{$$slots:a={},$$scope:l}=e,{data:o}=e,f=s.getUser({hexpubkey:o.pubkey});return Z(()=>{t(1,f=s.getUser({hexpubkey:o.pubkey}))}),pe(()=>{f.hexpubkey!==o.pubkey&&t(1,f=s.getUser({hexpubkey:o.pubkey}))}),ye(()=>{f.hexpubkey!==o.pubkey&&t(1,f=s.getUser({hexpubkey:o.pubkey}))}),n.$$set=_=>{"data"in _&&t(0,o=_.data),"$$scope"in _&&t(3,l=_.$$scope)},[o,f,r,l,a]}class He extends x{constructor(e){super(),ee(this,e,Ve,Pe,j,{data:0})}}export{He as component};
