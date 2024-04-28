"use strict";var _=Object.defineProperty;var A=(e,n,t)=>n in e?_(e,n,{enumerable:!0,configurable:!0,writable:!0,value:t}):e[n]=t;var y=(e,n,t)=>(A(e,typeof n!="symbol"?n+"":n,t),t),x=(e,n,t)=>{if(!n.has(e))throw TypeError("Cannot "+t)};var c=(e,n,t)=>(x(e,n,"read from private field"),t?t.call(e):n.get(e)),E=(e,n,t)=>{if(n.has(e))throw TypeError("Cannot add the same private member more than once");n instanceof WeakSet?n.add(e):n.set(e,t)},w=(e,n,t,i)=>(x(e,n,"write to private field"),i?i.call(e,t):n.set(e,t),t);/*!
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
 */var h,s,d;function getLineColFromPtr(e,n){let t=e.slice(0,n).split(/\r\n|\n|\r/g);return[t.length,t.pop().length+1]}function makeCodeBlock(e,n,t){let i=e.split(/\r\n|\n|\r/g),l="",o=(Math.log10(n+1)|0)+1;for(let f=n-1;f<=n+1;f++){let a=i[f-1];a&&(l+=f.toString().padEnd(o," "),l+=":  ",l+=a,l+=`
`,f===n&&(l+=" ".repeat(o+t+2),l+=`^
`))}return l}class TomlError extends Error{constructor(t,i){const[l,o]=getLineColFromPtr(i.toml,i.ptr),f=makeCodeBlock(i.toml,l,o);super(`Invalid TOML document: ${t}

${f}`,i);y(this,"line");y(this,"column");y(this,"codeblock");this.line=l,this.column=o,this.codeblock=f}}/*!
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
 */let DATE_TIME_RE=/^(\d{4}-\d{2}-\d{2})?[T ]?(?:(\d{2}):\d{2}:\d{2}(?:\.\d+)?)?(Z|[-+]\d{2}:\d{2})?$/i;const g=class g extends Date{constructor(t){let i=!0,l=!0,o="Z";if(typeof t=="string"){let f=t.match(DATE_TIME_RE);f?(f[1]||(i=!1,t=`0000-01-01T${t}`),l=!!f[2],f[2]&&+f[2]>23?t="":(o=f[3]||null,t=t.toUpperCase(),o||(t+="Z"))):t=""}super(t);E(this,h,!1);E(this,s,!1);E(this,d,null);isNaN(this.getTime())||(w(this,h,i),w(this,s,l),w(this,d,o))}isDateTime(){return c(this,h)&&c(this,s)}isLocal(){return!c(this,h)||!c(this,s)||!c(this,d)}isDate(){return c(this,h)&&!c(this,s)}isTime(){return c(this,s)&&!c(this,h)}isValid(){return c(this,h)||c(this,s)}toISOString(){let t=super.toISOString();if(this.isDate())return t.slice(0,10);if(this.isTime())return t.slice(11,23);if(c(this,d)===null)return t.slice(0,-1);if(c(this,d)==="Z")return t;let i=+c(this,d).slice(1,3)*60+ +c(this,d).slice(4,6);return i=c(this,d)[0]==="-"?i:-i,new Date(this.getTime()-i*6e4).toISOString().slice(0,-1)+c(this,d)}static wrapAsOffsetDateTime(t,i="Z"){let l=new g(t);return w(l,d,i),l}static wrapAsLocalDateTime(t){let i=new g(t);return w(i,d,null),i}static wrapAsLocalDate(t){let i=new g(t);return w(i,s,!1),w(i,d,null),i}static wrapAsLocalTime(t){let i=new g(t);return w(i,h,!1),w(i,d,null),i}};h=new WeakMap,s=new WeakMap,d=new WeakMap;let TomlDate=g;/*!
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
 */function indexOfNewline(e,n=0,t=e.length){let i=e.indexOf(`
`,n);return e[i-1]==="\r"&&i--,i<=t?i:-1}function skipComment(e,n){for(let t=n;t<e.length;t++){let i=e[t];if(i===`
`)return t;if(i==="\r"&&e[t+1]===`
`)return t+1;if(i<" "&&i!=="	"||i==="\x7F")throw new TomlError("control characters are not allowed in comments",{toml:e,ptr:n})}return e.length}function skipVoid(e,n,t,i){let l;for(;(l=e[n])===" "||l==="	"||!t&&(l===`
`||l==="\r"&&e[n+1]===`
`);)n++;return i||l!=="#"?n:skipVoid(e,skipComment(e,n),t)}function skipUntil(e,n,t,i,l=!1){if(!i)return n=indexOfNewline(e,n),n<0?e.length:n;for(let o=n;o<e.length;o++){let f=e[o];if(f==="#")o=indexOfNewline(e,o);else{if(f===t)return o+1;if(f===i)return o;if(l&&(f===`
`||f==="\r"&&e[o+1]===`
`))return o}}throw new TomlError("cannot find end of structure",{toml:e,ptr:n})}function getStringEnd(e,n){let t=e[n],i=t===e[n+1]&&e[n+1]===e[n+2]?e.slice(n,n+3):t;n+=i.length-1;do n=e.indexOf(i,++n);while(n>-1&&t!=="'"&&e[n-1]==="\\"&&e[n-2]!=="\\");return n>-1&&(n+=i.length,i.length>1&&(e[n]===t&&n++,e[n]===t&&n++)),n}/*!
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
 */let INT_REGEX=/^((0x[0-9a-fA-F](_?[0-9a-fA-F])*)|(([+-]|0[ob])?\d(_?\d)*))$/,FLOAT_REGEX=/^[+-]?\d(_?\d)*(\.\d(_?\d)*)?([eE][+-]?\d(_?\d)*)?$/,LEADING_ZERO=/^[+-]?0[0-9_]/,ESCAPE_REGEX=/^[0-9a-f]{4,8}$/i,ESC_MAP={b:"\b",t:"	",n:`
`,f:"\f",r:"\r",'"':'"',"\\":"\\"};function parseString(e,n=0,t=e.length){let i=e[n]==="'",l=e[n++]===e[n]&&e[n]===e[n+1];l&&(t-=2,e[n+=2]==="\r"&&n++,e[n]===`
`&&n++);let o=0,f,a="",r=n;for(;n<t-1;){let u=e[n++];if(u===`
`||u==="\r"&&e[n]===`
`){if(!l)throw new TomlError("newlines are not allowed in strings",{toml:e,ptr:n-1})}else if(u<" "&&u!=="	"||u==="\x7F")throw new TomlError("control characters are not allowed in strings",{toml:e,ptr:n-1});if(f){if(f=!1,u==="u"||u==="U"){let m=e.slice(n,n+=u==="u"?4:8);if(!ESCAPE_REGEX.test(m))throw new TomlError("invalid unicode escape",{toml:e,ptr:o});try{a+=String.fromCodePoint(parseInt(m,16))}catch{throw new TomlError("invalid unicode escape",{toml:e,ptr:o})}}else if(l&&(u===`
`||u===" "||u==="	"||u==="\r")){if(n=skipVoid(e,n-1,!0),e[n]!==`
`&&e[n]!=="\r")throw new TomlError("invalid escape: only line-ending whitespace may be escaped",{toml:e,ptr:o});n=skipVoid(e,n)}else if(u in ESC_MAP)a+=ESC_MAP[u];else throw new TomlError("unrecognized escape sequence",{toml:e,ptr:o});r=n}else!i&&u==="\\"&&(o=n-1,f=!0,a+=e.slice(r,o))}return a+e.slice(r,t-1)}function parseValue(e,n,t){if(e==="true")return!0;if(e==="false")return!1;if(e==="-inf")return-1/0;if(e==="inf"||e==="+inf")return 1/0;if(e==="nan"||e==="+nan"||e==="-nan")return NaN;if(e==="-0")return 0;let i;if((i=INT_REGEX.test(e))||FLOAT_REGEX.test(e)){if(LEADING_ZERO.test(e))throw new TomlError("leading zeroes are not allowed",{toml:n,ptr:t});let o=+e.replace(/_/g,"");if(isNaN(o))throw new TomlError("invalid number",{toml:n,ptr:t});if(i&&!Number.isSafeInteger(o))throw new TomlError("integer value cannot be represented losslessly",{toml:n,ptr:t});return o}let l=new TomlDate(e);if(!l.isValid())throw new TomlError("invalid value",{toml:n,ptr:t});return l}/*!
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
 */function sliceAndTrimEndOf(e,n,t,i){let l=e.slice(n,t),o=l.indexOf("#");o>-1&&(skipComment(e,o),l=l.slice(0,o));let f=l.trimEnd();if(!i){let a=l.indexOf(`
`,f.length);if(a>-1)throw new TomlError("newlines are not allowed in inline tables",{toml:e,ptr:n+a})}return[f,o]}function extractValue(e,n,t){let i=e[n];if(i==="["||i==="{"){let[f,a]=i==="["?parseArray(e,n):parseInlineTable(e,n),r=skipUntil(e,a,",",t);if(t==="}"){let u=indexOfNewline(e,a,r);if(u>-1)throw new TomlError("newlines are not allowed in inline tables",{toml:e,ptr:u})}return[f,r]}let l;if(i==='"'||i==="'"){l=getStringEnd(e,n);let f=parseString(e,n,l);if(t){if(l=skipVoid(e,l,t!=="]"),e[l]&&e[l]!==","&&e[l]!==t&&e[l]!==`
`&&e[l]!=="\r")throw new TomlError("unexpected character encountered",{toml:e,ptr:l});l+=+(e[l]===",")}return[f,l]}l=skipUntil(e,n,",",t);let o=sliceAndTrimEndOf(e,n,l-+(e[l-1]===","),t==="]");if(!o[0])throw new TomlError("incomplete key-value declaration: no value specified",{toml:e,ptr:n});return t&&o[1]>-1&&(l=skipVoid(e,n+o[1]),l+=+(e[l]===",")),[parseValue(o[0],e,n),l]}/*!
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
 */let KEY_PART_RE=/^[a-zA-Z0-9-_]+[ \t]*$/;function parseKey(e,n,t="="){let i=n-1,l=[],o=e.indexOf(t,n);if(o<0)throw new TomlError("incomplete key-value: cannot find end of key",{toml:e,ptr:n});do{let f=e[n=++i];if(f!==" "&&f!=="	")if(f==='"'||f==="'"){if(f===e[n+1]&&f===e[n+2])throw new TomlError("multiline strings are not allowed in keys",{toml:e,ptr:n});let a=getStringEnd(e,n);if(a<0)throw new TomlError("unfinished string encountered",{toml:e,ptr:n});i=e.indexOf(".",a);let r=e.slice(a,i<0||i>o?o:i),u=indexOfNewline(r);if(u>-1)throw new TomlError("newlines are not allowed in keys",{toml:e,ptr:n+i+u});if(r.trimStart())throw new TomlError("found extra tokens after the string part",{toml:e,ptr:a});if(o<a&&(o=e.indexOf(t,a),o<0))throw new TomlError("incomplete key-value: cannot find end of key",{toml:e,ptr:n});l.push(parseString(e,n,a))}else{i=e.indexOf(".",n);let a=e.slice(n,i<0||i>o?o:i);if(!KEY_PART_RE.test(a))throw new TomlError("only letter, numbers, dashes and underscores are allowed in keys",{toml:e,ptr:n});l.push(a.trimEnd())}}while(i+1&&i<o);return[l,skipVoid(e,o+1,!0,!0)]}function parseInlineTable(e,n){let t={},i=new Set,l,o=0;for(n++;(l=e[n++])!=="}"&&l;){if(l===`
`)throw new TomlError("newlines are not allowed in inline tables",{toml:e,ptr:n-1});if(l==="#")throw new TomlError("inline tables cannot contain comments",{toml:e,ptr:n-1});if(l===",")throw new TomlError("expected key-value, found comma",{toml:e,ptr:n-1});if(l!==" "&&l!=="	"){let f,a=t,r=!1,[u,m]=parseKey(e,n-1);for(let b=0;b<u.length;b++){if(b&&(a=r?a[f]:a[f]={}),f=u[b],(r=Object.hasOwn(a,f))&&(typeof a[f]!="object"||i.has(a[f])))throw new TomlError("trying to redefine an already defined value",{toml:e,ptr:n});!r&&f==="__proto__"&&Object.defineProperty(a,f,{enumerable:!0,configurable:!0,writable:!0})}if(r)throw new TomlError("trying to redefine an already defined value",{toml:e,ptr:n});let[O,T]=extractValue(e,m,"}");i.add(O),a[f]=O,n=T,o=e[n-1]===","?n-1:0}}if(o)throw new TomlError("trailing commas are not allowed in inline tables",{toml:e,ptr:o});if(!l)throw new TomlError("unfinished table encountered",{toml:e,ptr:n});return[t,n]}function parseArray(e,n){let t=[],i;for(n++;(i=e[n++])!=="]"&&i;){if(i===",")throw new TomlError("expected value, found comma",{toml:e,ptr:n-1});if(i==="#")n=skipComment(e,n);else if(i!==" "&&i!=="	"&&i!==`
`&&i!=="\r"){let l=extractValue(e,n-1,"]");t.push(l[0]),n=l[1]}}if(!i)throw new TomlError("unfinished array encountered",{toml:e,ptr:n});return[t,n]}/*!
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
 */function peekTable(e,n,t,i){let l=n,o=t,f,a=!1,r;for(let u=0;u<e.length;u++){if(u){if(l=a?l[f]:l[f]={},o=(r=o[f]).c,i===0&&(r.t===1||r.t===2))return null;if(r.t===2){let m=l.length-1;l=l[m],o=o[m].c}}if(f=e[u],(a=Object.hasOwn(l,f))&&o[f]?.t===0&&o[f]?.d)return null;a||(f==="__proto__"&&(Object.defineProperty(l,f,{enumerable:!0,configurable:!0,writable:!0}),Object.defineProperty(o,f,{enumerable:!0,configurable:!0,writable:!0})),o[f]={t:u<e.length-1&&i===2?3:i,d:!1,i:0,c:{}})}if(r=o[f],r.t!==i&&!(i===1&&r.t===3)||(i===2&&(r.d||(r.d=!0,l[f]=[]),l[f].push(l={}),r.c[r.i++]=r={t:1,d:!1,i:0,c:{}}),r.d))return null;if(r.d=!0,i===1)l=a?l[f]:l[f]={};else if(i===0&&a)return null;return[f,l,r.c]}function parse(e){let n={},t={},i=n,l=t;for(let o=skipVoid(e,0);o<e.length;){if(e[o]==="["){let f=e[++o]==="[",a=parseKey(e,o+=+f,"]");if(f){if(e[a[1]-1]!=="]")throw new TomlError("expected end of table declaration",{toml:e,ptr:a[1]-1});a[1]++}let r=peekTable(a[0],n,t,f?2:1);if(!r)throw new TomlError("trying to redefine an already defined table or value",{toml:e,ptr:o});l=r[2],i=r[1],o=a[1]}else{let f=parseKey(e,o),a=peekTable(f[0],i,l,0);if(!a)throw new TomlError("trying to redefine an already defined table or value",{toml:e,ptr:o});let r=extractValue(e,f[1]);a[1][a[0]]=r[0],o=r[1]}if(o=skipVoid(e,o,!0),e[o]&&e[o]!==`
`&&e[o]!=="\r")throw new TomlError("each key-value declaration must be followed by an end-of-line",{toml:e,ptr:o});o=skipVoid(e,o)}return n}function parseTOML(e){return parse(e)}exports.parseTOML=parseTOML;
