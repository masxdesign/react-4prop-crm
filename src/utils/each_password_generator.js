import {
    _g,
    R7,
    j5,
    S9,
    Ht,
    j7,
    P3,
    S7
} from "./EACH-core"

function each_password_generator(m) {
    function R(n, s) {
        return (n << s) | (n >>> (32 - s))
    }
    function X(V) {
        var s = '', i = 7, v;
        for (i; i >= 0; i--) {
            v = (V >>> (i * 4)) & 0x0f;
            s += j5(v, 16)
        }
        return s
    }
    var Z, i, j, W = new Array(80), H0 = 0x67452301, H1 = 0xEFCDAB89, H2 = 0x98BADCFE, H3 = 0x10325476, H4 = 0xC3D2E1F0, A, B, C, D, E, Y, t = '', n = 0, c, T = [], L;
    m = R7(m, /\r\n/, '\n', 1);
    for (n; n < S9(m); n++) {
        c = Ht(m, n);
        t += c < 128 ? j7(c) : (c > 127) && (c < 2048) ? j7((c >> 6) | 192) + j7((c & 63) | 128) : j7((c >> 12) | 224) + j7(((c >> 6) & 63) | 128) + j7((c & 63) | 128)
    }
    L = S9(m);
    for (i = 0; i < L - 3; i += 4) {
        j = Ht(m, i) << 24 | Ht(m, i + 1) << 16 | Ht(m, i + 2) << 8 | Ht(m, i + 3);
        P3(T, j)
    }
    j = L % 4;
    P3(T, j == 0 ? 0x080000000 : j == 1 ? Ht(m, L - 1) << 24 | 0x0800000 : j == 2 ? Ht(m, L - 2) << 24 | Ht(m, L - 1) << 16 | 0x08000 : j == 3 ? Ht(m, L - 3) << 24 | Ht(m, L - 2) << 16 | Ht(m, L - 1) << 8 | 0x80 : i);
    while ((S9(T) % 16) != 14)
        P3(T, 0);
    P3(T, L >>> 29);
    P3(T, (L << 3) & 0x0ffffffff);
    for (Z = 0; Z < S9(T); Z += 16) {
        for (i = 0; i < 16; i++)
            W[i] = T[Z + i];
        for (i = 16; i <= 79; i++)
            W[i] = R(W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16], 1);
        A = H0;
        B = H1;
        C = H2;
        D = H3;
        E = H4;
        for (i = 0; i <= 19; i++) {
            Y = (R(A, 5) + ((B & C) | (~B & D)) + E + W[i] + 0x5A827999) & 0x0ffffffff;
            E = D;
            D = C;
            C = R(B, 30);
            B = A;
            A = Y
        }
        for (i = 20; i <= 39; i++) {
            Y = (R(A, 5) + (B ^ C ^ D) + E + W[i] + 0x6ED9EBA1) & 0x0ffffffff;
            E = D;
            D = C;
            C = R(B, 30);
            B = A;
            A = Y
        }
        for (i = 40; i <= 59; i++) {
            Y = (R(A, 5) + ((B & C) | (B & D) | (C & D)) + E + W[i] + 0x8F1BBCDC) & 0x0ffffffff;
            E = D;
            D = C;
            C = R(B, 30);
            B = A;
            A = Y
        }
        for (i = 60; i <= 79; i++) {
            Y = (R(A, 5) + (B ^ C ^ D) + E + W[i] + 0xCA62C1D6) & 0x0ffffffff;
            E = D;
            D = C;
            C = R(B, 30);
            B = A;
            A = Y
        }
        H0 = (H0 + A) & 0x0ffffffff;
        H1 = (H1 + B) & 0x0ffffffff;
        H2 = (H2 + C) & 0x0ffffffff;
        H3 = (H3 + D) & 0x0ffffffff;
        H4 = (H4 + E) & 0x0ffffffff
    }
    Y = X(H0) + X(H1) + X(H2) + X(H3) + X(H4);
    
    return S7(Y)
}

export default each_password_generator