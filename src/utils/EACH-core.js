/* eslint-disable no-unused-expressions */

export const _g = 'g'
export const nU = '0'
export const xU = '../JSON/EACH/files/miro/'
export const PE = '/'
export const _s = '&nbsp;'
export const s_ = ' '
export const b2 = '}'
export const bR = '<br>'
export const Z0 = 'xR0'
export const Z1 = 'xR1'
export const P7 = '-'
export const PC = '"'
export const i_ = '`'
export const eq = '='
export const U_ = undefined
export const c_ = ','
export const ic = "'"
export const P8 = ">"
export const P9 = "<"
export const MO = '&#163;'
export const PS = '*'
export const SJ = '^'
export let N = 137
export let o = 936
export let f = '.'

export function S1(s, x) {return s ? s.join(x != U_ ? x : c_) : ''}
export function R2(a) {return S9(a + '') == 1 ? nU + a : a}
export function S3(s, x, y) {return s ? (s + '').substring(x ? x : 0, y ? y : 6) : ''}
export function FD() {return new Date()}
export function SK(d, x) {return x == 2 ? d.getMonth() : x == 1 ? d.getFullYear() : !x ? d.getDate() : d.getHours()}
export function R7(s,a,b,x,i){try{return s?s.replace(new RegExp(a,x?_g+(i?i:''):''),b?b:''):''}catch(e){return s}}
export function j5(a,b){return a.toString(b)}
export function SH(a) {return a && S9(a) ? a.shift() : ''}
export function S4(a, b) {return (a ? a : '').split(b != undefined ? b : '|')}
export function S6(s, x) {return s ? S3(s, 0, x ? x : 6) : ''}
export function S8(s) {return s ? s.toUpperCase() : ''}
export function S9(s){return s?s.length:0}
export function C8(s, x) {return s.charAt(x != U_ ? x : 1)}
export function Ht(s,i){return s.charCodeAt(i?i:0)}
export function j7(s){return String.fromCharCode(s)}
export function P3(a,b,c){if(a) if(c) a.unshift(b); else a.push(b)}
export function S7(s){return (s+'').toLowerCase()}
export function I9(x) {return x ? parseInt(x) : 0}
export function U8(m) {return U7(m ? m : 0, FD())}
export function U7(m, h) {return S3(SK(h, 1), 2, 4) + R2(SK(h, 2) + m) + R2(SK(h)) + R2(SK(h, 3)) + R2(h.getMinutes()) + R2(h.getSeconds())}
export function hY(x, y, z) {return I9(S3(x, y, z ? z : y + 2))}
export function hy(x) {
    x ? x : x = U8();
    var a = hY(x, 0)
      , y = hY(x, 4)
      , z = hY(x, 6)
      , Y = hY(x, 8)
      , Z = hY(x, 10);
    return (a < 10 ? a : j7(55 + a)) + j7(65 + hY(x, 2)) + (y < 10 ? y : j7(55 + y)) + (z < 10 ? z : j7(55 + z)) + (Y < 10 ? Y : j7((Y > 35 ? 6 : 0) + 55 + Y)) + (Z < 10 ? Z : j7((Z > 35 ? 6 : 0) + 55 + Z))
}
export function T9(s) {return R7(s, /^\s+|\s+$/, '', 1)}
export function R9(s, a, b, x, i) {
    if (!s)
        return '';
    for (i in a)
        s = R7(s + '', a[i], b[i], x);
    return s
}
export function De(a) {return a ? R9(a, [Z0, Z1, 'xR4', 'xR2', 'xR3', 'xR5', 'xSq'], [bR, ic, i_, P9, P8, MO, PS], 1) : ''}
export function G9(a) {return R9(T9(a), [_s, '–', '“', '”', b2, '\\^', bR, Z0], [s_, P7, PC, PC, '¬#', '#¬', b2, b2], 1)}
export function bZ(v, x, a, b) {
    a ? 0 : a = ['x5', 'x8', 'x9', 'x7'];
    b ? 0 : b = [i_, eq, PC, bR];
    return R9(v, x ? b : a, x ? a : b, 1)
}
export function en(c) {
    var x = 'charCodeAt', b, e = {}, f = S4(c, ''), d = [], a = SH(f), g = 256;
    for (b in f)
        c = f[b],
        e[a + c] ? a += c : (P3(d, 1 < S9(a) ? e[a] : a[x](0)),
        e[a + c] = g,
        g++,
        a = c);
    P3(d, 1 < S9(a) ? e[a] : a[x](0));
    N = S9(d);
    for (b = 0; b < N; b++)
        d[b] = j7(d[b]);
    return S1(d, '')
}
export function eN(b) {
    var a, e = {}, d = S4(b, ''), c = f = d[0], g = [c], h = o = 256;
    for (b = 1; b < S9(d); b++)
        a = Ht(d[b]),
        a = h > a ? d[b] : e[a] ? e[a] : f + c,
        P3(g, a),
        c = C8(a, 0),
        e[o] = f + c,
        o++,
        f = a;
    return S1(g, "")
}