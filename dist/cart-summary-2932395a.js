(window.webpackJsonpCheckout=window.webpackJsonpCheckout||[]).push([[6],{1619:function(e,t,a){"use strict";a.r(t);var r=a(3),n=a(0),c=a.n(n);var i=a(431),s=function(e){var t=e.children;return c.a.createElement("header",{className:"cart-header"},c.a.createElement("h3",{className:"cart-title optimizedCheckout-headingSecondary"},c.a.createElement(i.a,{id:"cart.cart_heading"})),t)},l=a(1511),o=a(1509),u=a(1512),d=a(1510);t.default=function(e){var t=e.storeCurrency,a=e.shopperCurrency,i=e.headerLink,m=e.additionalLineItems,h=e.lineItems,p=e.total,f=Object(r.__rest)(e,["storeCurrency","shopperCurrency","headerLink","additionalLineItems","lineItems","total"]),_=Object(n.useMemo)((function(){return function(e){return Object(r.__assign)(Object(r.__assign)({},e),{physicalItems:e.physicalItems.filter((function(e){return"string"!=typeof e.parentId})),digitalItems:e.digitalItems.filter((function(e){return"string"!=typeof e.parentId}))})}(h)}),[h]);return c.a.createElement("article",{className:"cart optimizedCheckout-orderSummary","data-test":"cart"},c.a.createElement(s,null,i),c.a.createElement(o.a,null,c.a.createElement(l.a,{items:_})),c.a.createElement(o.a,null,c.a.createElement(u.a,Object(r.__assign)({},f)),m),c.a.createElement(o.a,null,c.a.createElement(d.a,{orderAmount:p,shopperCurrencyCode:a.code,storeCurrencyCode:t.code})))}},1658:function(e,t,a){"use strict";a.r(t);var r=a(3),n=a(0),c=a.n(n),i=a(430),s=a(1619),l=a(1610),o=a(1621),u=a(1609);t.default=Object(i.a)(l.a)((function(e){var t=e.cartUrl,a=Object(r.__rest)(e,["cartUrl"]);return Object(o.a)(s.default)(Object(r.__assign)(Object(r.__assign)({},a),{cartUrl:t,headerLink:c.a.createElement(u.a,{url:t})}))}))}}]);
//# sourceMappingURL=cart-summary-2932395a.js.map