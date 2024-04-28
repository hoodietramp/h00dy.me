var C=Object.defineProperty;var R=(e,n,t)=>n in e?C(e,n,{enumerable:!0,configurable:!0,writable:!0,value:t}):e[n]=t;var x=(e,n,t)=>(R(e,typeof n!="symbol"?n+"":n,t),t),p=(e,n,t)=>{if(!n.has(e))throw TypeError("Cannot "+t)};var d=(e,n,t)=>(p(e,n,"read from private field"),t?t.call(e):n.get(e)),O=(e,n,t)=>{if(n.has(e))throw TypeError("Cannot add the same private member more than once");n instanceof WeakSet?n.add(e):n.set(e,t)},h=(e,n,t,i)=>(p(e,n,"write to private field"),i?i.call(e,t):n.set(e,t),t);/*!
 * Copyright (c) Squirrel Chat et al., All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 * 3. Neither the name of the copyright holder nor the names of its contributors
 *    may be used to endorse or promote products derived from this software without
 *    specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */var s,m,w;function Z(e,n){let t=e.slice(0,n).split(/\r\n|\n|\r/g);return[t.length,t.pop().length+1]}function j(e,n,t){let i=e.split(/\r\n|\n|\r/g),l="",o=(Math.log10(n+1)|0)+1;for(let f=n-1;f<=n+1;f++){let a=i[f-1];a&&(l+=f.toString().padEnd(o," "),l+=":  ",l+=a,l+=`
`,f===n&&(l+=" ".repeat(o+t+2),l+=`^
`))}return l}class u extends Error{constructor(t,i){const[l,o]=Z(i.toml,i.ptr),f=j(i.toml,l,o);super(`Invalid TOML document: ${t}

${f}`,i);x(this,"line");x(this,"column");x(this,"codeblock");this.line=l,this.column=o,this.codeblock=f}}/*!
 * Copyright (c) Squirrel Chat et al., All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 * 3. Neither the name of the copyright holder nor the names of its contributors
 *    may be used to endorse or promote products derived from this software without
 *    specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */let M=/^(\d{4}-\d{2}-\d{2})?[T ]?(?:(\d{2}):\d{2}:\d{2}(?:\.\d+)?)?(Z|[-+]\d{2}:\d{2})?$/i;const y=class y extends Date{constructor(t){let i=!0,l=!0,o="Z";if(typeof t=="string"){let f=t.match(M);f?(f[1]||(i=!1,t=`0000-01-01T${t}`),l=!!f[2],f[2]&&+f[2]>23?t="":(o=f[3]||null,t=t.toUpperCase(),o||(t+="Z"))):t=""}super(t);O(this,s,!1);O(this,m,!1);O(this,w,null);isNaN(this.getTime())||(h(this,s,i),h(this,m,l),h(this,w,o))}isDateTime(){return d(this,s)&&d(this,m)}isLocal(){return!d(this,s)||!d(this,m)||!d(this,w)}isDate(){return d(this,s)&&!d(this,m)}isTime(){return d(this,m)&&!d(this,s)}isValid(){return d(this,s)||d(this,m)}toISOString(){let t=super.toISOString();if(this.isDate())return t.slice(0,10);if(this.isTime())return t.slice(11,23);if(d(this,w)===null)return t.slice(0,-1);if(d(this,w)==="Z")return t;let i=+d(this,w).slice(1,3)*60+ +d(this,w).slice(4,6);return i=d(this,w)[0]==="-"?i:-i,new Date(this.getTime()-i*6e4).toISOString().slice(0,-1)+d(this,w)}static wrapAsOffsetDateTime(t,i="Z"){let l=new y(t);return h(l,w,i),l}static wrapAsLocalDateTime(t){let i=new y(t);return h(i,w,null),i}static wrapAsLocalDate(t){let i=new y(t);return h(i,m,!1),h(i,w,null),i}static wrapAsLocalTime(t){let i=new y(t);return h(i,s,!1),h(i,w,null),i}};s=new WeakMap,m=new WeakMap,w=new WeakMap;let _=y;/*!
 * Copyright (c) Squirrel Chat et al., All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 * 3. Neither the name of the copyright holder nor the names of its contributors
 *    may be used to endorse or promote products derived from this software without
 *    specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */function T(e,n=0,t=e.length){let i=e.indexOf(`
`,n);return e[i-1]==="\r"&&i--,i<=t?i:-1}function A(e,n){for(let t=n;t<e.length;t++){let i=e[t];if(i===`
`)return t;if(i==="\r"&&e[t+1]===`
`)return t+1;if(i<" "&&i!=="	"||i==="\x7F")throw new u("control characters are not allowed in comments",{toml:e,ptr:n})}return e.length}function g(e,n,t,i){let l;for(;(l=e[n])===" "||l==="	"||!t&&(l===`
`||l==="\r"&&e[n+1]===`
`);)n++;return i||l!=="#"?n:g(e,A(e,n),t)}function L(e,n,t,i,l=!1){if(!i)return n=T(e,n),n<0?e.length:n;for(let o=n;o<e.length;o++){let f=e[o];if(f==="#")o=T(e,o);else{if(f===t)return o+1;if(f===i)return o;if(l&&(f===`
`||f==="\r"&&e[o+1]===`
`))return o}}throw new u("cannot find end of structure",{toml:e,ptr:n})}function v(e,n){let t=e[n],i=t===e[n+1]&&e[n+1]===e[n+2]?e.slice(n,n+3):t;n+=i.length-1;do n=e.indexOf(i,++n);while(n>-1&&t!=="'"&&e[n-1]==="\\"&&e[n-2]!=="\\");return n>-1&&(n+=i.length,i.length>1&&(e[n]===t&&n++,e[n]===t&&n++)),n}/*!
 * Copyright (c) Squirrel Chat et al., All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 * 3. Neither the name of the copyright holder nor the names of its contributors
 *    may be used to endorse or promote products derived from this software without
 *    specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */let V=/^((0x[0-9a-fA-F](_?[0-9a-fA-F])*)|(([+-]|0[ob])?\d(_?\d)*))$/,F=/^[+-]?\d(_?\d)*(\.\d(_?\d)*)?([eE][+-]?\d(_?\d)*)?$/,G=/^[+-]?0[0-9_]/,z=/^[0-9a-f]{4,8}$/i,P={b:"\b",t:"	",n:`
`,f:"\f",r:"\r",'"':'"',"\\":"\\"};function N(e,n=0,t=e.length){let i=e[n]==="'",l=e[n++]===e[n]&&e[n]===e[n+1];l&&(t-=2,e[n+=2]==="\r"&&n++,e[n]===`
`&&n++);let o=0,f,a="",r=n;for(;n<t-1;){let c=e[n++];if(c===`
`||c==="\r"&&e[n]===`
`){if(!l)throw new u("newlines are not allowed in strings",{toml:e,ptr:n-1})}else if(c<" "&&c!=="	"||c==="\x7F")throw new u("control characters are not allowed in strings",{toml:e,ptr:n-1});if(f){if(f=!1,c==="u"||c==="U"){let b=e.slice(n,n+=c==="u"?4:8);if(!z.test(b))throw new u("invalid unicode escape",{toml:e,ptr:o});try{a+=String.fromCodePoint(parseInt(b,16))}catch{throw new u("invalid unicode escape",{toml:e,ptr:o})}}else if(l&&(c===`
`||c===" "||c==="	"||c==="\r")){if(n=g(e,n-1,!0),e[n]!==`
`&&e[n]!=="\r")throw new u("invalid escape: only line-ending whitespace may be escaped",{toml:e,ptr:o});n=g(e,n)}else if(c in P)a+=P[c];else throw new u("unrecognized escape sequence",{toml:e,ptr:o});r=n}else!i&&c==="\\"&&(o=n-1,f=!0,a+=e.slice(r,o))}return a+e.slice(r,t-1)}function U(e,n,t){if(e==="true")return!0;if(e==="false")return!1;if(e==="-inf")return-1/0;if(e==="inf"||e==="+inf")return 1/0;if(e==="nan"||e==="+nan"||e==="-nan")return NaN;if(e==="-0")return 0;let i;if((i=V.test(e))||F.test(e)){if(G.test(e))throw new u("leading zeroes are not allowed",{toml:n,ptr:t});let o=+e.replace(/_/g,"");if(isNaN(o))throw new u("invalid number",{toml:n,ptr:t});if(i&&!Number.isSafeInteger(o))throw new u("integer value cannot be represented losslessly",{toml:n,ptr:t});return o}let l=new _(e);if(!l.isValid())throw new u("invalid value",{toml:n,ptr:t});return l}/*!
 * Copyright (c) Squirrel Chat et al., All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 * 3. Neither the name of the copyright holder nor the names of its contributors
 *    may be used to endorse or promote products derived from this software without
 *    specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */function X(e,n,t,i){let l=e.slice(n,t),o=l.indexOf("#");o>-1&&(A(e,o),l=l.slice(0,o));let f=l.trimEnd();if(!i){let a=l.indexOf(`
`,f.length);if(a>-1)throw new u("newlines are not allowed in inline tables",{toml:e,ptr:n+a})}return[f,o]}function S(e,n,t){let i=e[n];if(i==="["||i==="{"){let[f,a]=i==="["?B(e,n):q(e,n),r=L(e,a,",",t);if(t==="}"){let c=T(e,a,r);if(c>-1)throw new u("newlines are not allowed in inline tables",{toml:e,ptr:c})}return[f,r]}let l;if(i==='"'||i==="'"){l=v(e,n);let f=N(e,n,l);if(t){if(l=g(e,l,t!=="]"),e[l]&&e[l]!==","&&e[l]!==t&&e[l]!==`
`&&e[l]!=="\r")throw new u("unexpected character encountered",{toml:e,ptr:l});l+=+(e[l]===",")}return[f,l]}l=L(e,n,",",t);let o=X(e,n,l-+(e[l-1]===","),t==="]");if(!o[0])throw new u("incomplete key-value declaration: no value specified",{toml:e,ptr:n});return t&&o[1]>-1&&(l=g(e,n+o[1]),l+=+(e[l]===",")),[U(o[0],e,n),l]}/*!
 * Copyright (c) Squirrel Chat et al., All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 * 3. Neither the name of the copyright holder nor the names of its contributors
 *    may be used to endorse or promote products derived from this software without
 *    specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */let K=/^[a-zA-Z0-9-_]+[ \t]*$/;function I(e,n,t="="){let i=n-1,l=[],o=e.indexOf(t,n);if(o<0)throw new u("incomplete key-value: cannot find end of key",{toml:e,ptr:n});do{let f=e[n=++i];if(f!==" "&&f!=="	")if(f==='"'||f==="'"){if(f===e[n+1]&&f===e[n+2])throw new u("multiline strings are not allowed in keys",{toml:e,ptr:n});let a=v(e,n);if(a<0)throw new u("unfinished string encountered",{toml:e,ptr:n});i=e.indexOf(".",a);let r=e.slice(a,i<0||i>o?o:i),c=T(r);if(c>-1)throw new u("newlines are not allowed in keys",{toml:e,ptr:n+i+c});if(r.trimStart())throw new u("found extra tokens after the string part",{toml:e,ptr:a});if(o<a&&(o=e.indexOf(t,a),o<0))throw new u("incomplete key-value: cannot find end of key",{toml:e,ptr:n});l.push(N(e,n,a))}else{i=e.indexOf(".",n);let a=e.slice(n,i<0||i>o?o:i);if(!K.test(a))throw new u("only letter, numbers, dashes and underscores are allowed in keys",{toml:e,ptr:n});l.push(a.trimEnd())}}while(i+1&&i<o);return[l,g(e,o+1,!0,!0)]}function q(e,n){let t={},i=new Set,l,o=0;for(n++;(l=e[n++])!=="}"&&l;){if(l===`
`)throw new u("newlines are not allowed in inline tables",{toml:e,ptr:n-1});if(l==="#")throw new u("inline tables cannot contain comments",{toml:e,ptr:n-1});if(l===",")throw new u("expected key-value, found comma",{toml:e,ptr:n-1});if(l!==" "&&l!=="	"){let f,a=t,r=!1,[c,b]=I(e,n-1);for(let E=0;E<c.length;E++){if(E&&(a=r?a[f]:a[f]={}),f=c[E],(r=Object.hasOwn(a,f))&&(typeof a[f]!="object"||i.has(a[f])))throw new u("trying to redefine an already defined value",{toml:e,ptr:n});!r&&f==="__proto__"&&Object.defineProperty(a,f,{enumerable:!0,configurable:!0,writable:!0})}if(r)throw new u("trying to redefine an already defined value",{toml:e,ptr:n});let[D,k]=S(e,b,"}");i.add(D),a[f]=D,n=k,o=e[n-1]===","?n-1:0}}if(o)throw new u("trailing commas are not allowed in inline tables",{toml:e,ptr:o});if(!l)throw new u("unfinished table encountered",{toml:e,ptr:n});return[t,n]}function B(e,n){let t=[],i;for(n++;(i=e[n++])!=="]"&&i;){if(i===",")throw new u("expected value, found comma",{toml:e,ptr:n-1});if(i==="#")n=A(e,n);else if(i!==" "&&i!=="	"&&i!==`
`&&i!=="\r"){let l=S(e,n-1,"]");t.push(l[0]),n=l[1]}}if(!i)throw new u("unfinished array encountered",{toml:e,ptr:n});return[t,n]}/*!
 * Copyright (c) Squirrel Chat et al., All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 * 3. Neither the name of the copyright holder nor the names of its contributors
 *    may be used to endorse or promote products derived from this software without
 *    specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */function $(e,n,t,i){let l=n,o=t,f,a=!1,r;for(let c=0;c<e.length;c++){if(c){if(l=a?l[f]:l[f]={},o=(r=o[f]).c,i===0&&(r.t===1||r.t===2))return null;if(r.t===2){let b=l.length-1;l=l[b],o=o[b].c}}if(f=e[c],(a=Object.hasOwn(l,f))&&o[f]?.t===0&&o[f]?.d)return null;a||(f==="__proto__"&&(Object.defineProperty(l,f,{enumerable:!0,configurable:!0,writable:!0}),Object.defineProperty(o,f,{enumerable:!0,configurable:!0,writable:!0})),o[f]={t:c<e.length-1&&i===2?3:i,d:!1,i:0,c:{}})}if(r=o[f],r.t!==i&&!(i===1&&r.t===3)||(i===2&&(r.d||(r.d=!0,l[f]=[]),l[f].push(l={}),r.c[r.i++]=r={t:1,d:!1,i:0,c:{}}),r.d))return null;if(r.d=!0,i===1)l=a?l[f]:l[f]={};else if(i===0&&a)return null;return[f,l,r.c]}function Y(e){let n={},t={},i=n,l=t;for(let o=g(e,0);o<e.length;){if(e[o]==="["){let f=e[++o]==="[",a=I(e,o+=+f,"]");if(f){if(e[a[1]-1]!=="]")throw new u("expected end of table declaration",{toml:e,ptr:a[1]-1});a[1]++}let r=$(a[0],n,t,f?2:1);if(!r)throw new u("trying to redefine an already defined table or value",{toml:e,ptr:o});l=r[2],i=r[1],o=a[1]}else{let f=I(e,o),a=$(f[0],i,l,0);if(!a)throw new u("trying to redefine an already defined table or value",{toml:e,ptr:o});let r=S(e,f[1]);a[1][a[0]]=r[0],o=r[1]}if(o=g(e,o,!0),e[o]&&e[o]!==`
`&&e[o]!=="\r")throw new u("each key-value declaration must be followed by an end-of-line",{toml:e,ptr:o});o=g(e,o)}return n}function H(e){return Y(e)}export{H as parseTOML};
