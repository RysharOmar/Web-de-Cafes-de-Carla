import { useEffect, useRef, useState, useId } from "react";

/**
 * Preloader "Cafés de Carla"
 * - Dibujo progresivo de contornos -> crossfade a relleno carmelita -> hold -> fade -> loop
 * - Sin cambios respecto al index.html original: mismos paths, colores, delays y tiempos.
 * - Autocontenido: estilos e SVGs incluidos; solo depende de Google Fonts (va en @import).
 */

const ICON_PATHS: string[] = [
  `M2228 8629 c-19 -7 -36 -28 -54 -65 -26 -54 -27 -59 -21 -182 3 -70
13 -158 22 -197 26 -108 113 -381 147 -454 61 -137 148 -304 161 -309 4 -2 7
-8 7 -13 0 -9 27 -53 119 -194 53 -82 141 -199 153 -203 4 -2 8 -8 8 -13 0
-41 393 -430 576 -569 32 -25 66 -51 74 -59 16 -16 220 -151 228 -151 2 0 25
-15 51 -34 46 -34 88 -58 191 -112 30 -16 57 -31 60 -34 10 -12 263 -130 277
-130 4 0 25 -9 47 -19 130 -61 437 -164 646 -216 30 -8 75 -19 100 -25 43 -11
167 -35 335 -64 71 -13 380 -48 490 -56 115 -9 242 -25 276 -36 11 -3 19 -19
22 -42 19 -145 37 -354 37 -446 0 -220 -42 -722 -90 -1061 -18 -126 -49 -338
-70 -480 -8 -54 -36 -228 -50 -310 -11 -62 -53 -287 -79 -420 -11 -55 -27
-136 -35 -180 -9 -44 -20 -100 -25 -125 -6 -25 -17 -79 -25 -120 -9 -41 -32
-145 -51 -230 -19 -85 -47 -207 -61 -270 -15 -63 -33 -140 -41 -170 -28 -106
-45 -175 -50 -208 -3 -18 -9 -35 -14 -38 -5 -3 -9 -15 -9 -27 0 -12 -14 -67
-30 -122 -16 -55 -35 -122 -41 -150 -6 -27 -15 -54 -20 -59 -5 -6 -9 -20 -9
-33 0 -13 -4 -31 -9 -41 -5 -9 -30 -82 -56 -162 -25 -80 -50 -154 -54 -165 -5
-11 -16 -40 -24 -65 -36 -107 -81 -226 -89 -234 -4 -6 -8 -16 -8 -23 0 -7 -9
-32 -19 -56 -91 -200 -90 -197 -71 -197 6 0 33 47 60 105 28 58 56 105 63 105
8 0 19 23 26 52 21 83 69 236 81 258 6 11 17 20 26 20 11 0 12 4 5 18 -10 20
-3 72 10 72 5 0 9 9 9 20 0 11 9 43 20 72 11 29 20 61 20 72 0 12 5 16 15 12
18 -6 20 5 4 21 -8 8 0 47 30 139 22 71 52 172 67 224 15 52 31 100 36 106 4
6 11 39 14 72 5 44 11 63 23 67 12 3 16 17 16 50 0 27 6 49 14 54 10 7 10 12
0 28 -10 16 -9 28 6 66 9 25 24 48 32 51 11 5 13 16 8 50 -7 42 6 122 26 171
7 19 40 143 60 230 5 22 14 76 19 120 11 83 25 147 41 177 5 10 9 31 9 47 0
17 4 33 10 36 5 3 10 24 10 47 0 36 2 40 21 35 17 -5 19 -2 12 11 -10 22 -6
181 6 196 8 10 12 38 28 174 4 36 9 52 18 48 9 -3 12 12 13 54 0 32 5 67 10
77 6 10 15 58 22 107 6 49 17 94 24 100 19 16 27 44 13 49 -8 2 -8 30 1 113
18 168 36 253 58 270 14 11 15 17 7 20 -15 6 -19 134 -4 134 8 0 24 141 36
320 8 104 13 123 31 116 21 -8 28 13 10 33 -22 24 -23 163 -1 181 19 16 20 46
1 53 -11 4 -14 74 -19 359 -6 375 -10 407 -56 447 -24 21 -100 41 -158 41 -29
0 -33 2 -24 14 9 10 9 16 1 21 -7 4 -14 -2 -17 -14 -3 -14 -13 -21 -29 -21
-36 0 -29 24 14 44 20 10 66 36 101 59 56 36 64 39 73 24 12 -23 31 -11 23 14
-5 15 -1 19 14 19 14 0 21 6 21 19 0 28 77 91 112 91 47 0 34 -27 -57 -119
-95 -98 -105 -125 -56 -154 16 -9 51 -17 78 -18 39 0 45 -2 31 -11 -15 -11
-15 -14 0 -36 14 -21 16 -81 15 -496 0 -302 -4 -516 -12 -596 -21 -205 -30
-292 -36 -340 -3 -25 -10 -85 -16 -135 -6 -49 -19 -142 -30 -206 -10 -64 -24
-154 -29 -200 -22 -182 -39 -269 -61 -311 -5 -10 -9 -37 -9 -60 0 -49 -22
-169 -39 -211 -6 -16 -11 -46 -11 -68 0 -28 -4 -39 -15 -39 -9 0 -15 -9 -15
-25 0 -14 5 -25 10 -25 6 0 10 -11 10 -25 0 -14 -6 -25 -12 -25 -9 0 -13 -21
-14 -68 -1 -37 -9 -89 -18 -115 -9 -26 -16 -61 -16 -77 0 -15 -4 -30 -10 -32
-5 -1 -16 -48 -24 -103 -18 -131 -56 -307 -69 -323 -5 -7 -17 -59 -26 -115
-15 -92 -18 -102 -38 -105 -27 -4 -28 -6 -7 -37 15 -22 15 -30 -1 -87 -9 -35
-19 -76 -22 -93 -3 -16 -11 -37 -18 -45 -7 -8 -16 -35 -19 -60 -16 -106 -59
-271 -71 -266 -9 3 -14 -18 -18 -72 -2 -43 -12 -93 -20 -112 -8 -19 -30 -87
-48 -150 -18 -63 -46 -151 -62 -195 -16 -44 -33 -96 -37 -115 -5 -19 -32 -91
-60 -159 -27 -69 -50 -129 -50 -135 0 -6 -6 -23 -14 -37 -7 -15 -22 -51 -31
-80 -10 -30 -22 -59 -26 -65 -9 -11 -2 -24 13 -24 5 0 18 21 29 47 11 27 26
61 34 78 20 46 52 134 71 195 10 30 24 66 31 80 7 14 13 32 13 41 0 8 4 19 8
25 5 5 21 50 36 99 15 50 33 108 41 130 7 22 20 67 30 100 9 33 20 69 24 80 5
11 23 74 41 140 17 66 38 140 46 164 8 25 14 55 14 67 0 13 4 25 9 28 5 3 11
20 13 38 6 39 67 284 78 313 5 11 16 56 25 100 9 44 24 112 32 150 8 39 22 99
30 135 21 96 31 141 38 175 4 17 15 66 25 110 11 44 31 139 44 210 14 72 30
150 36 175 9 40 14 69 35 200 3 19 10 58 15 85 44 233 88 501 111 680 5 44 14
109 19 145 23 169 57 468 71 635 17 190 23 751 9 883 -7 67 -10 126 -6 130 4
4 92 9 194 12 111 3 195 10 206 17 23 13 -8 17 -256 33 -145 10 -283 26 -298
35 -4 3 33 46 84 97 150 153 180 195 283 402 56 110 77 166 64 166 -4 0 -32
-33 -62 -72 -94 -125 -77 -106 -250 -274 -121 -116 -286 -245 -348 -271 -43
-18 -197 -11 -291 13 -32 8 -96 21 -141 29 -197 33 -594 133 -694 175 -11 4
-58 20 -105 35 -47 15 -104 35 -127 46 -24 10 -48 19 -54 19 -6 0 -27 7 -47
16 -21 9 -46 20 -57 24 -40 16 -112 49 -209 94 -54 25 -102 46 -107 46 -5 0
-9 4 -9 9 0 4 -26 20 -57 35 -32 15 -71 34 -88 44 -16 10 -64 36 -105 59 -41
24 -113 70 -160 103 -47 33 -106 74 -132 92 -27 18 -48 36 -48 40 0 5 -5 8
-10 8 -6 0 -48 30 -93 67 -45 37 -93 77 -107 88 -14 11 -81 76 -149 145 -102
103 -189 203 -366 422 -26 31 -135 207 -135 217 0 5 -4 11 -8 13 -4 2 -21 29
-37 61 -17 32 -42 81 -57 110 -42 81 -39 93 30 107 31 6 70 15 86 21 16 5 39
9 51 9 36 0 289 87 415 143 98 43 170 81 320 168 14 8 27 16 30 19 3 3 25 21
50 40 25 19 55 47 68 62 34 40 82 53 151 39 31 -6 74 -13 96 -16 51 -6 156
-22 220 -34 28 -5 124 -18 215 -30 91 -12 201 -27 245 -33 109 -16 735 -17
835 -1 41 7 129 17 195 23 126 12 327 34 455 50 249 32 539 47 739 39 150 -7
192 -11 351 -40 53 -10 173 -47 235 -73 17 -7 46 -19 65 -26 19 -8 53 -25 74
-38 22 -14 61 -36 87 -51 46 -25 88 -58 198 -153 50 -45 81 -59 81 -40 0 5 -9
17 -20 27 -11 10 -20 26 -20 37 0 10 -6 18 -14 18 -8 0 -18 9 -21 21 -4 13
-12 18 -22 15 -20 -8 -52 11 -62 36 -11 30 -297 181 -383 201 -14 4 -41 19
-59 34 -28 24 -43 28 -138 34 -58 4 -146 13 -196 19 -164 23 -734 0 -1040 -40
-44 -6 -141 -14 -215 -19 -74 -4 -144 -12 -155 -18 -26 -14 -87 -23 -210 -34
-55 -4 -119 -11 -142 -15 -24 -3 -43 -2 -43 2 0 5 -103 9 -230 10 -225 1 -341
11 -595 51 -55 8 -127 19 -160 24 -33 4 -107 16 -165 25 -58 9 -157 19 -220
21 l-115 4 -20 -30 c-11 -17 -34 -38 -52 -48 -18 -10 -33 -23 -33 -30 0 -8
-12 -13 -30 -13 -23 0 -33 -6 -40 -25 -5 -14 -16 -25 -23 -25 -8 0 -24 -9 -37
-20 -13 -11 -33 -20 -44 -20 -12 0 -34 -13 -49 -30 -23 -24 -33 -28 -59 -23
-26 5 -30 3 -25 -9 4 -11 -12 -24 -61 -48 -85 -41 -99 -46 -147 -60 -22 -6
-49 -15 -60 -20 -88 -39 -217 -72 -360 -91 -72 -10 -85 -19 -85 -56 0 -47 75
-216 131 -294 10 -15 17 -34 13 -42 -3 -9 7 -28 25 -46 17 -18 31 -36 31 -41
0 -5 10 -19 23 -32 12 -13 33 -39 47 -58 13 -19 30 -41 37 -48 7 -7 20 -26 30
-42 9 -17 21 -30 25 -30 4 0 8 -7 8 -15 0 -8 4 -15 9 -15 11 0 37 -61 33 -78
-2 -10 3 -12 17 -7 17 5 21 2 21 -14 0 -14 6 -21 19 -21 23 0 111 -86 111
-109 0 -9 10 -22 21 -30 17 -10 19 -15 9 -21 -11 -7 -11 -11 -1 -24 17 -20 32
-21 25 -1 -4 8 -3 15 1 15 9 0 72 -68 79 -86 3 -8 10 -13 15 -9 5 3 12 -4 16
-15 3 -11 13 -20 21 -20 8 0 14 -7 14 -15 0 -8 7 -15 15 -15 8 0 15 -4 15 -10
0 -5 22 -21 48 -34 49 -25 79 -65 74 -98 -2 -10 2 -18 7 -18 6 0 10 3 10 8 -3
20 3 32 17 32 11 0 14 -5 9 -17 -17 -41 -17 -53 -2 -53 8 0 17 9 20 21 5 17 9
19 26 9 12 -6 21 -15 21 -20 0 -5 20 -18 45 -29 25 -11 55 -30 67 -43 23 -24
80 -61 131 -87 15 -8 27 -20 27 -26 0 -6 18 -19 40 -29 22 -10 40 -22 40 -27
0 -5 10 -9 23 -9 12 0 36 -7 52 -16 17 -9 55 -29 86 -45 32 -15 59 -33 61 -40
4 -11 20 -15 65 -18 7 -1 15 -11 18 -24 5 -20 12 -23 55 -23 36 0 69 -10 135
-43 47 -23 88 -48 91 -55 3 -7 16 -11 32 -8 31 4 137 -41 137 -59 0 -7 21 -13
56 -14 35 -2 83 -14 130 -34 40 -17 79 -31 86 -31 8 0 21 -4 31 -9 9 -6 44
-15 77 -20 33 -6 80 -16 105 -22 25 -5 63 -14 85 -19 22 -4 94 -20 160 -35 66
-14 172 -37 235 -51 63 -13 135 -30 160 -38 l45 -14 -70 0 c-62 -1 -125 5
-260 24 -22 3 -50 10 -63 17 -18 9 -25 8 -32 -3 -7 -11 -18 -11 -72 3 -34 9
-79 19 -98 22 -19 3 -57 12 -85 20 -27 7 -76 19 -109 26 -32 7 -60 18 -63 25
-2 6 -22 12 -43 12 -63 1 -310 67 -310 83 0 5 -15 9 -33 9 -18 0 -42 6 -53 14
-11 8 -37 17 -57 21 -43 8 -50 35 -14 54 22 11 21 11 -3 5 -48 -14 -106 -8
-160 15 -30 13 -68 29 -85 36 -16 7 -45 18 -63 25 -19 7 -40 24 -49 37 -9 13
-25 23 -38 23 -32 0 -56 10 -49 21 3 5 -8 9 -25 9 -17 0 -42 11 -60 26 -17 14
-37 27 -43 28 -28 4 -132 63 -165 93 -20 18 -42 33 -49 33 -7 0 -21 11 -30 25
-9 14 -26 25 -38 25 -31 0 -57 21 -59 48 -1 16 -8 22 -23 22 -13 0 -29 7 -38
15 -8 8 -26 19 -41 25 -14 5 -24 14 -21 19 7 11 -13 28 -39 33 -12 2 -20 11
-20 22 0 12 -11 23 -30 30 -44 16 -82 44 -88 66 -2 10 -15 20 -27 22 -13 1
-28 12 -34 22 -14 24 -48 61 -58 62 -5 1 -13 2 -18 3 -6 0 -8 12 -4 25 7 29
-16 55 -64 75 -40 17 -107 85 -107 109 0 9 -6 16 -14 14 -18 -4 -38 14 -77 72
-26 39 -31 53 -24 72 9 22 8 23 -10 12 -15 -10 -22 -10 -32 0 -9 9 -9 12 0 12
7 0 12 9 12 20 0 25 -15 26 -25 3 -6 -16 -9 -15 -31 10 -13 15 -24 35 -24 43
0 8 -4 14 -10 14 -5 0 -10 9 -10 20 0 10 -9 24 -19 30 -22 11 -45 72 -38 100
5 21 -19 36 -27 17 -8 -19 -36 23 -36 55 0 15 -5 28 -11 28 -19 0 -49 43 -96
140 -25 52 -54 107 -64 122 -11 14 -19 37 -19 51 0 24 -12 56 -59 160 -12 27
-25 72 -28 100 -3 29 -14 63 -23 77 -26 37 -50 180 -53 306 -2 99 0 114 18
135 16 18 17 21 3 16 -14 -5 -15 -2 -7 23 6 15 20 31 32 34 35 9 208 6 257 -5
25 -5 86 -15 135 -20 50 -6 144 -20 210 -31 66 -11 152 -24 190 -28 39 -5 102
-16 140 -25 39 -10 95 -21 125 -25 30 -4 107 -17 170 -28 63 -11 145 -23 183
-27 41 -5 70 -13 75 -21 7 -12 14 -12 42 -3 26 9 35 10 38 1 2 -7 14 -12 27
-12 13 0 27 -4 30 -10 3 -5 41 -10 83 -10 42 0 131 -9 197 -21 128 -21 193
-30 375 -52 141 -16 799 -16 905 1 59 9 72 9 81 -3 6 -8 20 -15 30 -15 18 1
18 1 1 14 -16 13 -9 15 60 20 43 4 110 11 148 16 39 5 106 13 150 16 44 4 85
10 90 14 6 5 42 10 80 12 39 3 169 13 291 23 195 16 243 17 415 6 262 -16 447
-47 547 -91 25 -11 51 -20 59 -20 22 0 113 -41 113 -51 0 -5 6 -9 14 -9 8 0
23 -11 34 -25 11 -14 28 -25 37 -25 21 0 115 -50 115 -61 0 -4 9 -10 20 -14
11 -3 19 -11 17 -18 -1 -6 7 -11 18 -12 12 0 20 -7 20 -17 0 -21 72 -88 89
-82 6 2 24 -9 39 -24 24 -25 26 -32 15 -43 -25 -27 -58 -78 -58 -90 0 -6 21
-41 48 -78 43 -61 79 -115 109 -166 38 -63 131 -229 161 -285 60 -114 96 -175
104 -178 4 -2 8 -11 8 -19 0 -8 15 -36 34 -62 18 -25 52 -77 75 -116 58 -96
177 -262 236 -329 6 -6 39 -47 75 -91 36 -44 83 -100 105 -124 22 -24 51 -57
65 -72 95 -106 188 -206 266 -288 75 -79 160 -177 268 -312 7 -9 33 -45 57
-80 24 -35 47 -66 50 -69 16 -14 109 -185 138 -255 60 -144 66 -162 85 -261
53 -273 -21 -522 -210 -706 -77 -74 -124 -108 -215 -151 -195 -94 -464 -109
-689 -37 -105 34 -269 117 -350 178 -78 58 -245 221 -291 282 -43 58 -95 134
-102 150 -4 8 -15 27 -25 42 -94 144 -236 455 -292 643 -7 22 -16 48 -21 57
-5 10 -9 27 -9 38 0 11 -4 20 -9 20 -8 0 -15 22 -28 98 -3 17 -9 32 -13 32 -4
0 -10 18 -14 40 -3 23 -10 49 -16 58 -8 17 -21 63 -42 152 -5 25 -14 63 -20
85 -5 22 -12 55 -15 73 -3 18 -10 35 -16 39 -12 7 -1 -289 14 -339 5 -18 9
-53 9 -77 0 -24 4 -60 9 -80 5 -20 15 -67 21 -106 24 -142 83 -365 119 -450 5
-11 26 -60 46 -110 21 -49 52 -115 71 -146 19 -31 34 -59 34 -63 0 -3 16 -31
36 -62 29 -45 35 -62 30 -88 -3 -17 -10 -66 -15 -108 -5 -43 -15 -112 -21
-155 -29 -200 -36 -266 -61 -568 -19 -235 -5 -709 30 -980 6 -44 15 -118 20
-165 6 -47 15 -101 21 -120 5 -19 16 -69 24 -110 22 -115 56 -240 86 -315 4
-11 15 -43 23 -72 47 -157 175 -408 304 -598 113 -165 139 -195 170 -195 36 0
27 44 -11 51 -10 2 -24 12 -30 23 -6 10 -22 31 -35 45 -44 48 -112 144 -148
210 -20 36 -43 74 -51 83 -11 13 -12 21 -4 31 8 9 4 21 -17 45 -16 17 -33 32
-38 32 -14 0 -37 71 -25 79 7 4 -3 27 -24 61 -18 29 -37 70 -40 89 -3 20 -14
48 -24 62 -21 30 -46 111 -56 183 -4 27 -15 64 -26 81 -10 18 -23 70 -29 116
-6 46 -19 119 -29 163 -13 55 -16 86 -9 103 6 15 5 31 -1 42 -55 104 -66 810
-21 1331 17 194 51 461 68 533 l16 69 -27 24 c-32 30 -72 107 -81 156 -4 20
-17 46 -30 58 -13 13 -27 35 -30 51 -4 16 -11 31 -16 34 -5 4 -9 15 -9 27 0
11 -9 31 -20 45 -11 14 -22 41 -26 62 -3 20 -13 52 -22 71 -9 19 -16 40 -17
45 0 6 -8 35 -17 65 -32 105 -38 138 -38 199 0 45 -4 61 -14 61 -15 0 -36 70
-36 120 0 25 4 31 18 28 11 -2 19 -16 24 -43 3 -22 13 -60 22 -85 8 -25 23
-70 31 -100 9 -30 20 -64 25 -75 5 -11 20 -50 34 -87 15 -37 42 -101 61 -143
19 -41 35 -86 35 -100 0 -14 7 -28 16 -32 8 -3 33 -42 54 -87 22 -44 50 -100
64 -123 26 -44 25 -47 -8 -43 -11 1 -15 -3 -12 -9 4 -6 18 -11 31 -11 17 0 25
-6 27 -22 2 -13 9 -22 16 -20 6 1 12 -4 12 -12 0 -8 7 -17 16 -20 10 -4 13
-13 9 -26 -4 -13 -2 -20 7 -20 8 0 22 -14 32 -30 10 -17 35 -48 57 -70 21 -21
39 -48 39 -59 0 -14 6 -21 19 -21 12 0 21 -9 25 -25 4 -17 13 -25 27 -25 19 0
21 -4 15 -30 -5 -28 -4 -30 23 -28 26 2 100 -41 109 -64 2 -4 11 -8 20 -8 10
0 39 -16 66 -35 27 -19 55 -35 61 -35 7 0 23 -8 36 -18 13 -10 47 -26 74 -36
28 -10 67 -29 87 -42 21 -13 50 -24 66 -24 16 0 75 -7 133 -16 107 -16 302
-14 351 5 13 5 41 14 63 21 22 6 73 27 113 46 40 19 76 34 80 34 4 0 18 9 32
20 14 11 31 20 38 20 20 0 103 62 99 74 -4 12 28 46 43 46 6 0 19 17 28 38 9
21 34 61 55 89 20 28 37 55 37 59 0 5 14 36 30 69 29 59 30 62 30 230 0 157
-16 304 -37 338 -4 6 -10 29 -14 52 -9 49 -30 107 -47 127 -6 8 -19 32 -27 53
-15 34 -15 37 -1 32 10 -4 16 -1 16 7 0 8 -6 14 -12 13 -33 -1 -48 4 -48 16 0
8 -10 25 -21 38 -12 13 -28 40 -36 59 -9 19 -25 47 -37 61 -20 25 -43 61 -74
116 -7 13 -20 23 -28 23 -7 0 -14 5 -14 10 0 6 8 10 18 10 14 0 13 4 -7 19
-14 10 -31 17 -38 14 -8 -3 -19 9 -28 31 -9 20 -26 41 -38 45 -12 5 -70 60
-128 123 -59 62 -128 136 -154 163 -25 28 -53 64 -61 82 -9 22 -19 31 -29 27
-11 -5 -15 1 -15 20 0 16 -6 26 -15 26 -8 0 -15 9 -15 20 0 11 -7 20 -16 20
-21 0 -84 49 -84 66 0 8 -22 35 -49 61 -27 27 -59 67 -71 91 -12 23 -28 42
-36 42 -8 0 -14 10 -14 23 0 13 -16 36 -41 57 -50 42 -109 127 -109 155 0 11
-9 26 -19 32 -11 7 -21 23 -23 35 -2 15 -9 22 -20 20 -10 -1 -19 6 -24 20 -3
13 -15 35 -25 50 -11 14 -19 37 -19 50 0 31 -10 41 -27 27 -10 -9 -13 -4 -13
25 0 20 -4 36 -10 36 -5 0 -10 13 -10 29 0 24 -3 28 -24 24 -20 -4 -25 0 -31
25 -3 16 -3 41 1 56 5 23 3 26 -16 24 -19 -3 -26 5 -40 42 -28 74 -32 83 -70
140 -56 84 -100 166 -100 184 0 10 -4 15 -9 12 -5 -3 -14 1 -21 8 -9 11 -9 20
0 36 6 12 8 29 5 38 -6 15 -8 14 -16 -5 -12 -32 -22 -29 -53 19 -21 32 -24 43
-14 49 7 5 14 14 14 21 1 7 2 19 3 26 0 6 7 12 15 12 17 0 66 -56 66 -76 0 -8
7 -14 15 -14 10 0 15 -11 16 -32 0 -18 5 -42 10 -53 l9 -20 -1 20 c-2 34 1 38
17 25 18 -16 44 -75 44 -101 0 -11 7 -19 15 -19 8 0 15 -5 15 -11 0 -6 11 -24
24 -40 21 -25 23 -34 15 -61 -13 -46 -12 -47 22 -46 33 1 46 -11 55 -52 3 -14
10 -33 15 -43 5 -10 7 -22 4 -27 -3 -5 0 -12 7 -17 17 -10 38 -49 38 -68 0 -8
6 -15 14 -15 8 0 16 -19 22 -52 7 -44 13 -54 32 -56 25 -4 46 -36 38 -58 -3
-8 0 -14 7 -14 13 0 121 -162 132 -197 3 -13 13 -23 21 -23 8 0 14 -7 14 -15
0 -9 16 -29 35 -46 19 -17 35 -39 35 -49 0 -10 32 -50 70 -89 39 -39 70 -78
70 -87 0 -10 5 -14 15 -10 11 4 15 -1 15 -19 0 -15 6 -25 14 -25 25 0 155
-150 162 -187 5 -24 11 -33 23 -31 27 4 44 -11 30 -28 -9 -11 -7 -14 10 -14
11 0 33 -14 48 -31 16 -18 45 -48 67 -68 21 -20 42 -46 47 -59 5 -12 19 -26
31 -31 13 -5 34 -24 48 -42 27 -38 64 -81 130 -151 25 -27 56 -69 70 -96 14
-26 37 -58 50 -73 51 -52 70 -80 72 -103 2 -16 7 -22 17 -18 11 4 13 -2 8 -31
-5 -31 -3 -37 13 -37 11 0 20 -10 24 -25 4 -14 14 -29 24 -32 24 -9 32 -23 32
-60 0 -20 7 -36 17 -41 11 -6 19 -28 23 -58 3 -31 10 -48 18 -46 8 1 12 -12
12 -38 0 -22 4 -40 8 -40 11 0 30 -102 42 -230 16 -171 16 -210 0 -220 -8 -5
-16 -22 -17 -37 -5 -62 -16 -113 -24 -119 -5 -3 -9 -13 -9 -24 0 -18 -36 -94
-55 -117 -5 -6 -26 -34 -45 -62 -19 -27 -43 -52 -53 -54 -10 -3 -15 -11 -12
-19 4 -9 -14 -31 -44 -56 -27 -23 -52 -42 -55 -42 -3 0 -25 -19 -49 -43 -47
-45 -58 -51 -157 -92 -36 -15 -74 -31 -85 -36 -80 -34 -144 -42 -320 -41 -236
2 -387 30 -473 88 -19 13 -48 24 -64 24 -32 0 -47 23 -28 45 9 11 8 19 -4 36
-13 20 -16 20 -22 6 -3 -9 -4 -24 0 -32 13 -35 -45 -12 -102 39 -19 17 -39 30
-44 28 -5 -1 -12 6 -15 17 -3 13 -11 17 -24 14 -13 -4 -19 0 -19 12 0 12 -5
15 -16 11 -11 -4 -18 1 -21 14 -3 11 -10 20 -15 20 -13 0 -63 51 -71 73 -4 10
-11 16 -17 12 -5 -3 -20 3 -32 14 -12 12 -24 21 -28 21 -3 0 -14 14 -23 30
-19 32 -35 38 -43 17 -4 -13 64 -88 147 -162 224 -199 470 -317 760 -364 85
-14 233 -14 301 0 171 35 332 99 395 159 12 11 26 20 30 20 11 0 110 88 173
153 63 64 145 204 171 291 11 39 26 84 32 100 6 16 11 104 11 200 1 164 -11
259 -43 341 -5 11 -14 38 -20 60 -19 62 -70 171 -118 256 -12 20 -27 47 -35
60 -7 13 -15 26 -18 29 -3 3 -11 17 -19 32 -28 54 -282 364 -401 489 -19 20
-66 72 -105 115 -38 43 -94 103 -123 133 -30 31 -77 83 -105 116 -28 33 -69
80 -92 105 -42 48 -88 104 -127 155 -12 17 -25 32 -28 35 -3 3 -22 28 -41 55
-18 28 -37 52 -40 55 -19 16 -176 274 -234 385 -46 88 -129 243 -159 299 -33
60 -144 228 -183 276 -49 62 -196 204 -258 251 -63 48 -203 137 -245 156 -218
102 -370 141 -628 163 -205 18 -558 6 -872 -30 -138 -16 -235 -27 -410 -45
-85 -9 -195 -20 -245 -25 -231 -25 -423 -31 -567 -20 -190 16 -280 25 -418 45
-63 9 -153 20 -200 25 -47 5 -112 14 -145 20 -33 6 -89 15 -125 20 -145 21
-265 39 -450 69 -200 33 -234 38 -380 66 -240 46 -442 77 -590 90 -189 17
-205 17 -242 4z`,
  `M6156 7748 c-3 -40 -11 -109 -17 -153 -26 -214 -20 -630 12 -750 39
-142 117 -254 204 -291 75 -31 159 -9 221 58 31 33 94 122 94 132 0 3 11 29
24 58 14 29 28 67 32 83 4 17 10 35 14 40 4 6 10 24 14 40 4 17 14 59 22 95 8
36 17 81 20 100 3 19 9 44 14 55 10 23 12 34 39 275 23 195 25 250 12 250 -10
0 -26 -42 -46 -124 -42 -168 -101 -356 -135 -431 -10 -22 -22 -51 -26 -65 -4
-14 -17 -47 -29 -75 -12 -27 -30 -70 -40 -95 -11 -25 -32 -67 -47 -93 -15 -26
-28 -52 -28 -57 0 -14 -77 -90 -92 -90 -16 0 -50 34 -66 66 -30 57 -80 252
-93 359 -5 39 -13 106 -18 150 -6 44 -17 136 -26 205 -8 69 -19 167 -24 218
-11 120 -26 137 -35 40z m23 -366 c1 -13 8 -31 17 -40 14 -13 16 -31 12 -104
-3 -48 -1 -89 3 -90 11 -4 39 -165 39 -224 0 -24 8 -51 18 -65 26 -34 52 -93
52 -118 0 -12 6 -21 14 -21 7 0 25 -9 39 -20 31 -25 107 -28 107 -5 0 8 12 17
28 21 51 11 51 11 45 48 -4 26 0 42 16 64 11 17 21 35 21 41 0 22 45 101 57
101 8 0 13 12 13 28 0 31 30 122 46 139 6 7 15 29 18 50 9 46 54 177 74 213
12 23 13 19 7 -40 -13 -137 -65 -338 -91 -353 -11 -6 -11 -12 -1 -28 10 -17 9
-22 -3 -29 -9 -5 -17 -25 -18 -46 -2 -20 -9 -46 -17 -58 -8 -11 -15 -27 -15
-35 0 -8 -21 -52 -47 -97 -48 -84 -88 -120 -124 -111 -12 3 -23 -2 -29 -14
-11 -20 -60 -27 -60 -9 0 6 -11 10 -25 10 -22 0 -80 41 -113 80 -31 37 -73
145 -68 173 3 16 1 38 -5 49 -26 48 -50 443 -32 529 7 33 7 33 14 9 4 -14 7
-35 8 -48z`,
  `M2615 6064 c-153 -46 -282 -141 -371 -274 -72 -109 -88 -165 -87
-317 1 -160 14 -196 109 -289 68 -68 129 -97 226 -109 91 -11 213 39 279 115
136 158 86 438 -94 524 -56 27 -127 44 -127 30 0 -12 49 -34 74 -34 17 0 18
-2 6 -10 -12 -8 -10 -10 11 -10 35 0 101 -65 135 -132 35 -70 43 -181 20 -261
-11 -37 -22 -57 -32 -57 -8 0 -14 -7 -12 -16 2 -10 -3 -19 -9 -21 -7 -3 -13 0
-13 7 0 6 -4 8 -10 5 -5 -3 -10 -15 -10 -25 0 -13 -19 -28 -62 -49 -83 -40
-100 -42 -107 -13 l-6 23 -17 -21 c-21 -24 -62 -26 -103 -4 -16 8 -40 14 -54
12 -30 -4 -40 17 -11 25 36 9 24 30 -15 24 -30 -5 -38 -1 -62 27 -58 68 -63
77 -63 106 0 17 -7 42 -16 56 -38 57 12 322 72 385 13 14 24 29 24 33 0 13 37
56 43 50 3 -3 8 3 11 13 3 11 25 31 49 46 23 15 50 36 60 47 12 15 24 19 42
14 19 -5 25 -2 25 10 0 9 8 19 18 22 9 3 26 10 37 14 80 35 240 49 355 32 36
-6 45 -12 51 -32 5 -20 8 -22 13 -9 9 20 38 15 78 -13 14 -10 29 -18 32 -18
17 0 119 -75 123 -91 3 -10 12 -19 19 -19 8 0 14 -7 14 -15 0 -8 7 -15 15 -15
8 0 15 -7 15 -15 0 -8 6 -15 13 -15 15 -1 67 -74 67 -95 0 -9 7 -18 15 -21 8
-4 15 -15 15 -26 0 -11 5 -28 10 -38 15 -29 50 -206 50 -256 0 -24 -5 -65 -11
-91 -14 -62 -60 -207 -68 -213 -3 -3 -12 -17 -20 -33 -8 -15 -19 -26 -25 -24
-15 5 -14 33 2 30 6 -2 12 4 12 12 0 20 -39 19 -47 0 -3 -9 2 -24 12 -35 10
-11 14 -26 11 -38 -10 -29 -76 -91 -92 -85 -10 3 -14 -2 -14 -18 0 -16 -13
-33 -39 -51 -22 -16 -44 -28 -49 -28 -6 0 -30 -11 -53 -25 -24 -14 -54 -25
-65 -25 -12 0 -27 -7 -34 -16 -15 -17 -74 -44 -97 -44 -27 0 -163 -94 -163
-113 0 -10 -6 -20 -14 -23 -24 -9 -39 -89 -34 -179 6 -95 1 -96 -49 -9 -25 45
-27 58 -28 159 0 106 1 110 22 113 19 3 21 6 10 23 -10 15 -9 25 4 47 8 15 23
26 32 26 9 -1 17 2 17 7 0 5 15 26 33 46 17 21 37 47 43 58 6 11 25 27 42 35
17 8 42 25 56 38 15 12 28 22 31 22 6 0 38 26 94 78 25 23 58 50 74 59 18 12
27 26 27 43 0 15 11 36 24 49 13 12 22 30 19 39 -2 10 3 31 11 47 23 43 20
149 -5 230 -11 37 -18 73 -15 81 3 9 -3 18 -17 23 -24 10 -61 48 -96 99 -22
31 -41 42 -41 23 0 -6 21 -38 48 -73 26 -35 53 -76 61 -93 7 -16 17 -38 22
-47 17 -33 22 -154 9 -209 -23 -97 -59 -158 -141 -238 -42 -42 -98 -92 -124
-111 -25 -19 -64 -54 -86 -77 -22 -24 -45 -43 -53 -43 -24 0 -68 -53 -100
-120 -27 -57 -31 -78 -34 -171 -4 -99 -2 -111 21 -158 15 -28 35 -61 47 -73
11 -12 20 -28 20 -35 0 -7 5 -13 10 -13 6 0 10 -7 10 -15 0 -8 5 -15 10 -15 6
0 10 -5 10 -10 0 -20 53 -91 60 -80 12 19 -2 113 -23 159 -42 90 -22 217 46
284 42 42 54 49 132 82 22 9 62 27 88 41 27 13 55 24 63 24 8 0 14 5 14 10 0
6 5 10 11 10 6 0 41 20 78 44 108 69 192 161 248 269 60 115 68 155 68 337 0
197 -8 232 -82 361 -80 139 -284 295 -413 315 -22 4 -43 11 -46 15 -9 15 -264
9 -319 -7z`,
  `M7837 4403 c-4 -3 -7 -26 -7 -50 0 -24 -4 -63 -9 -86 -24 -107 -31
-158 -37 -242 -3 -49 -10 -144 -16 -210 -22 -242 -4 -861 33 -1110 27 -184 63
-348 131 -600 17 -60 33 -124 37 -142 3 -17 16 -43 29 -58 33 -37 107 -182
122 -239 9 -31 20 -50 31 -53 10 -3 21 -15 25 -27 4 -11 22 -39 40 -62 19 -23
34 -45 34 -51 0 -5 16 -28 35 -50 19 -23 35 -48 35 -56 0 -8 7 -17 15 -20 8
-4 26 -24 40 -47 16 -25 33 -40 45 -40 26 0 25 19 -3 50 -47 51 -211 291 -253
370 -16 30 -32 57 -36 58 -5 2 -8 10 -8 17 0 8 -10 34 -23 57 -13 24 -38 79
-56 123 -19 44 -37 87 -41 95 -4 9 -11 31 -15 50 -4 19 -10 40 -14 45 -3 6
-14 39 -24 75 -10 36 -23 81 -28 100 -19 66 -49 215 -64 315 -44 287 -55 448
-55 775 0 270 6 386 41 750 10 113 19 220 19 238 0 30 -9 40 -23 25z`,
  `M2320 4010 c-440 -29 -651 -140 -758 -400 -48 -115 -71 -224 -103
-495 -17 -139 -23 -649 -9 -715 50 -236 156 -395 331 -502 87 -52 261 -138
281 -138 8 0 18 -4 23 -9 6 -5 37 -17 70 -26 33 -9 83 -22 112 -30 183 -51
592 -67 853 -35 163 20 362 78 510 148 88 41 228 141 268 191 20 25 40 48 43
51 3 3 23 37 44 75 21 39 43 77 48 86 9 14 114 69 132 69 32 0 196 103 252
158 45 45 95 125 131 209 35 82 45 224 26 385 -8 73 -18 142 -23 153 -5 11
-19 47 -32 80 -23 60 -77 155 -108 187 -56 61 -82 82 -128 109 -57 33 -70 36
-224 48 -121 10 -155 23 -180 69 -9 18 -29 47 -43 65 -14 17 -26 34 -26 38 0
13 -145 117 -198 142 -65 32 -160 56 -266 68 -206 25 -773 35 -1026 19z m978
-40 c54 -5 99 -16 132 -32 37 -18 50 -21 52 -11 2 10 16 6 53 -13 28 -15 62
-26 76 -25 18 1 41 -14 77 -47 29 -27 52 -54 52 -61 0 -6 11 -16 24 -21 13 -5
32 -23 42 -39 10 -17 21 -31 24 -31 3 0 23 -24 45 -54 l39 -54 131 -6 c71 -2
139 -5 150 -6 28 -1 65 -27 65 -45 0 -8 6 -16 13 -16 6 -1 17 -2 23 -3 6 0 18
-9 28 -18 10 -10 21 -18 26 -18 4 0 28 -30 53 -68 24 -37 52 -74 61 -81 12
-10 13 -17 6 -27 -8 -9 -7 -15 2 -21 34 -22 48 -85 27 -124 -9 -17 -7 -20 7
-17 50 9 57 -278 12 -472 -14 -60 -63 -141 -99 -166 -16 -10 -29 -28 -29 -39
0 -12 -13 -28 -33 -39 -71 -42 -204 -107 -237 -116 -58 -16 -97 -46 -126 -97
-44 -78 -93 -147 -132 -187 -40 -42 -115 -96 -131 -96 -6 0 -11 -7 -11 -15 0
-10 -10 -15 -32 -15 -25 0 -29 -3 -20 -12 14 -14 -27 -41 -89 -58 -24 -7 -65
-22 -92 -36 -62 -29 -194 -64 -246 -64 -21 0 -44 -6 -51 -15 -14 -17 -40 -18
-365 -19 -228 0 -490 17 -524 34 -9 5 -56 16 -105 26 -54 10 -96 24 -108 36
-10 10 -29 18 -42 18 -14 0 -27 4 -30 9 -3 4 -27 16 -53 26 -26 10 -91 44
-144 76 -53 33 -101 59 -107 59 -14 0 -18 27 -9 60 2 8 2 12 0 8 -2 -4 -10 -5
-18 -2 -7 3 -16 0 -20 -5 -9 -16 -23 -5 -40 32 -17 36 -34 65 -52 85 -7 7 -13
22 -13 31 0 10 -7 24 -15 31 -9 7 -14 15 -11 17 2 3 -7 37 -20 76 -15 44 -29
117 -36 187 -12 133 -5 607 10 660 6 19 15 67 22 105 28 178 63 308 91 339 11
11 19 28 19 38 0 37 37 96 100 156 35 34 69 62 73 62 5 0 22 10 39 21 75 54
286 90 638 109 170 9 697 3 828 -10z`,
  `M2295 3855 c-55 -7 -129 -21 -165 -30 -36 -10 -89 -20 -117 -22 -35
-3 -53 -9 -53 -18 0 -7 -15 -17 -32 -20 -59 -13 -100 -56 -103 -107 -1 -20 3
-28 15 -28 9 0 26 -11 39 -24 12 -12 41 -29 64 -36 23 -6 47 -16 53 -21 6 -5
37 -13 70 -18 32 -5 84 -16 114 -24 30 -8 57 -12 60 -7 3 4 30 4 60 -2 30 -5
246 -10 480 -10 459 -2 445 -3 680 57 121 31 176 67 186 122 7 37 -16 83 -41
83 -8 0 -15 5 -15 10 0 6 -7 10 -15 10 -17 0 -20 16 -5 25 12 8 13 25 1 25 -5
0 -11 -9 -14 -19 -4 -17 -9 -18 -53 -9 -27 5 -58 13 -69 18 -17 7 -87 18 -295
46 -97 13 -743 12 -845 -1z m853 -40 c147 -15 276 -37 332 -55 65 -22 141 -62
147 -78 8 -20 -41 -61 -99 -83 -169 -64 -274 -74 -808 -74 -441 0 -477 3 -645
41 -101 24 -215 79 -215 104 0 33 124 100 185 100 18 0 36 4 39 9 3 4 25 11
48 14 24 3 72 11 108 17 173 31 635 33 908 5z`,
  `M4070 3307 c-14 -6 -37 -23 -52 -36 -24 -21 -27 -29 -22 -65 3 -23 9
-50 14 -61 5 -11 11 -54 14 -95 7 -89 35 -444 35 -447 1 -2 6 -3 11 -3 13 0
13 157 0 280 -5 52 -16 157 -24 233 -9 76 -13 144 -9 152 8 23 91 19 132 -6
44 -27 66 -52 96 -113 49 -98 57 -261 18 -380 -19 -56 -91 -137 -162 -181 -42
-26 -44 -28 -26 -41 10 -8 23 -14 28 -14 5 0 37 29 70 64 34 35 73 67 86 71
15 5 20 10 12 14 -15 10 6 61 25 61 27 0 30 316 4 386 -6 14 -10 42 -11 62 0
36 -1 36 -11 12 l-11 -25 -6 30 c-4 19 -13 31 -26 34 -11 2 -37 19 -58 37 -20
19 -43 34 -50 34 -6 0 -21 2 -32 5 -11 2 -31 -1 -45 -8z`,
];
const CSS = `@import url("https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Manrope:wght@400;600&display=swap");
.cc-preloader {
      /* Referencia final: fondo blanco + logo carmelita grueso */
      --bg: #FAFAFA;
      --bg-deep: #F3F0EC;
      --ink: #5A3C28;
      --brand: #5A3C28;
      --white: #FFFFFF;
      --muted: rgba(90, 60, 40, 0.45);
    }

    .cc-preloader, .cc-preloader * { box-sizing: border-box; }

    .cc-preloader {
      margin: 0;
      min-height: 100%;
      background: radial-gradient(ellipse at center, var(--bg) 0%, var(--bg-deep) 100%);
      color: var(--ink);
    }

    .cc-preloader {
      min-height: 100vh;
      display: grid;
      place-items: center;
      font-family: "Manrope", system-ui, sans-serif;
      overflow: hidden;
    }

    .cc-preloader .preloader {
      position: relative;
      width: 100%;
      min-height: 100vh;
      display: grid;
      place-items: center;
      padding: 24px;
      isolation: isolate;
    }

    .cc-preloader .stage {
      width: min(760px, 92vw);
      display: grid;
      place-items: center;
      gap: 0;
    }

    .cc-preloader .logo {
      width: 100%;
      height: auto;
      display: block;
      overflow: visible;
    }

    /* Drawing strokes */
    .cc-preloader .draw-path {
      fill: none;
      stroke: var(--ink);
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .cc-preloader .draw-icon {
      stroke-width: 55;
    }

    .cc-preloader .draw-text {
      font-family: "Cormorant Garamond", Georgia, serif;
      font-weight: 700;
      fill: none;
      stroke: var(--ink);
      stroke-linecap: round;
      stroke-linejoin: round;
      paint-order: stroke fill;
    }

    .cc-preloader .draw-text-cafe {
      font-size: 118px;
      letter-spacing: 0.01em;
      stroke-width: 1;
    }

    .cc-preloader .draw-text-carla {
      font-size: 118px;
      letter-spacing: 0.01em;
      stroke-width: 1;
    }

    /* Filled state */
    .cc-preloader .fill-icon path {
      stroke: none;
    }

    .cc-preloader .fill-text {
      font-family: "Cormorant Garamond", Georgia, serif;
      font-weight: 700;
      fill: var(--ink);
      stroke: none;
    }

    .cc-preloader .fill-text-cafe { font-size: 118px; letter-spacing: 0.01em; }
    .cc-preloader .fill-text-carla { font-size: 118px; letter-spacing: 0.01em; }

    .cc-preloader .fill-accent path.cup-accent { fill: var(--coffee); }

    .cc-preloader .outline-group, .filled-group, .logo-group {
      will-change: opacity;
    }

    /* Controls */
    .cc-preloader .controls {
      position: absolute;
      right: 20px;
      bottom: 20px;
      display: flex;
      gap: 10px;
      z-index: 2;
    }

    .cc-preloader .control-btn {
      appearance: none;
      border: 1px solid rgba(97, 60, 42, 0.28);
      background: rgba(97, 60, 42, 0.04);
      color: var(--ink);
      font: 500 13px/1 "Manrope", system-ui, sans-serif;
      padding: 10px 14px;
      border-radius: 999px;
      cursor: pointer;
      transition: background 180ms ease, border-color 180ms ease, color 180ms ease;
      backdrop-filter: blur(6px);
      -webkit-backdrop-filter: blur(6px);
    }

    .cc-preloader .control-btn:hover {
      background: rgba(97, 60, 42, 0.08);
      border-color: rgba(97, 60, 42, 0.45);
    }

    .cc-preloader .control-btn:focus-visible {
      outline: 2px solid var(--ink);
      outline-offset: 2px;
    }

    .cc-preloader .control-btn[disabled] {
      opacity: 0.45;
      cursor: not-allowed;
    }

    .cc-preloader .sr-only {
      position: absolute !important;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }

    @media (max-width: 640px) {
      .stage { width: min(560px, 94vw); }
      .controls {
        right: 14px;
        bottom: 14px;
      }
      .control-btn {
        padding: 9px 12px;
        font-size: 12px;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .control-btn { transition: none; }
    }`;


const TRANSFORM = "translate(0,236) scale(0.0230769,-0.0230769)";
const ICON_OFFSET = "translate(44,42)";

const DURATION = 5600;
const DRAW_END = 2650;
const FILL_START = 3100;
const FILL_END = 3800;
const HOLD_END = 5000;
const FADE_END = 5600;

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}
function ease(v: number) {
  const x = clamp(v, 0, 1);
  return 0.5 - 0.5 * Math.cos(Math.PI * x);
}

type DrawItem = { el: SVGElement; delay: number; type: "icon" | "text"; length: number };

export default function CafesDeCarlaPreloader() {
  const uid = useId().replace(/:/g, "");
  const outlineRef = useRef<SVGGElement>(null);
  const filledRef = useRef<SVGGElement>(null);
  const logoRef = useRef<SVGGElement>(null);
  const iconOutlineRef = useRef<SVGGElement>(null);
  const textOutlineRef = useRef<SVGGElement>(null);
  const preloaderRef = useRef<HTMLDivElement>(null);
  const toggleBtnRef = useRef<HTMLButtonElement>(null);
  const replayBtnRef = useRef<HTMLButtonElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  const [paused, setPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() =>
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  const stateRef = useRef({
    rafId: null as number | null,
    startTime: 0,
    elapsedOffset: 0,
    paused: false,
    pausedAt: 0,
    visible: true,
    inViewport: true,
    reducedApplied: false,
    prefersReducedMotion: false,
    drawItems: [] as DrawItem[],
  });
  const s = stateRef.current;

  const titleId = `logoTitle-${uid}`;
  const descId = `logoDesc-${uid}`;

  function prepareDrawables() {
    const items: DrawItem[] = [];
    const iconEls = Array.from(iconOutlineRef.current?.querySelectorAll("path") ?? []);
    const textEls = Array.from(textOutlineRef.current?.querySelectorAll("text") ?? []);

    iconEls.forEach((el, i) => items.push({ el, delay: i * 45, type: "icon", length: 0 }));
    textEls.forEach((el, i) => items.push({ el, delay: 220 + i * 180, type: "text", length: 0 }));

    items.forEach((item) => {
      const el = item.el as SVGPathElement | SVGTextElement;
      let length = 0;
      try {
        if (el.tagName.toLowerCase() === "text") {
          const bbox = (el as SVGTextElement).getBBox();
          length = (bbox.width + bbox.height) * 5;
        } else if (typeof (el as SVGPathElement).getTotalLength === "function") {
          length = (el as SVGPathElement).getTotalLength();
        } else {
          const bbox = el.getBBox();
          length = (bbox.width + bbox.height) * 3.2;
        }
      } catch (_) {
        const bbox = el.getBBox();
        length = (bbox.width + bbox.height) * 3;
      }
      if (!isFinite(length) || length <= 0) length = 1000;
      item.length = length;
      el.style.strokeDasharray = String(length);
      el.style.strokeDashoffset = String(length);
    });

    s.drawItems = items;
  }

  function setReducedState(on: boolean) {
    if (toggleBtnRef.current) {
      toggleBtnRef.current.disabled = on;
      toggleBtnRef.current.textContent = "Pausar";
      toggleBtnRef.current.setAttribute("aria-pressed", "false");
    }
    if (replayBtnRef.current) replayBtnRef.current.disabled = on;
    if (outlineRef.current) outlineRef.current.style.opacity = on ? "0" : "";
    if (filledRef.current) filledRef.current.style.opacity = on ? "1" : "";
    if (logoRef.current) logoRef.current.style.opacity = "1";
    s.drawItems.forEach((item) => { item.el.style.strokeDashoffset = on ? "0" : ""; });
    if (statusRef.current)
      statusRef.current.textContent = on ? "Animacion reducida: logo mostrado en estado final." : "";
  }

  function render(now: number) {
    if (s.prefersReducedMotion) {
      if (!s.reducedApplied) { setReducedState(true); s.reducedApplied = true; }
      return;
    }
    s.reducedApplied = false;

    const elapsed = (now - s.startTime + s.elapsedOffset) % DURATION;

    s.drawItems.forEach((item) => {
      const local = elapsed - item.delay;
      const p = ease(local / DRAW_END);
      const offset = item.length * (1 - p);
      item.el.style.strokeDashoffset = String(offset);
    });

    let fillP = 0;
    if (elapsed >= FILL_START) fillP = ease((elapsed - FILL_START) / (FILL_END - FILL_START));
    if (elapsed > FILL_END) fillP = 1;
    if (filledRef.current) filledRef.current.style.opacity = String(fillP);
    if (outlineRef.current) outlineRef.current.style.opacity = String(1 - fillP);

    let logoOpacity = 1;
    if (elapsed >= HOLD_END) logoOpacity = 1 - ease((elapsed - HOLD_END) / (FADE_END - HOLD_END));
    if (logoRef.current) logoRef.current.style.opacity = String(logoOpacity);
  }

  function stopLoop() {
    if (s.rafId != null) { cancelAnimationFrame(s.rafId); s.rafId = null; }
  }

  function tick(now: number) {
    if (s.paused || !s.visible || !s.inViewport || s.prefersReducedMotion) {
      s.rafId = null;
      return;
    }
    render(now);
    s.rafId = requestAnimationFrame(tick);
  }

  function ensureRunning() {
    if (s.prefersReducedMotion || s.paused || !s.visible || !s.inViewport || s.rafId != null) return;
    s.startTime = performance.now();
    s.rafId = requestAnimationFrame(tick);
  }

  function pause() {
    if (s.paused || s.prefersReducedMotion) return;
    s.paused = true;
    s.pausedAt = performance.now();
    setPaused(true);
    if (toggleBtnRef.current) {
      toggleBtnRef.current.textContent = "Reproducir";
      toggleBtnRef.current.setAttribute("aria-pressed", "true");
    }
    stopLoop();
  }

  function play() {
    if (!s.paused || s.prefersReducedMotion) return;
    const now = performance.now();
    s.elapsedOffset += s.pausedAt - now;
    s.paused = false;
    setPaused(false);
    if (toggleBtnRef.current) {
      toggleBtnRef.current.textContent = "Pausar";
      toggleBtnRef.current.setAttribute("aria-pressed", "false");
    }
    ensureRunning();
  }

  function replay() {
    if (s.prefersReducedMotion) return;
    s.elapsedOffset = 0;
    s.startTime = performance.now();
    s.paused = false;
    setPaused(false);
    if (toggleBtnRef.current) {
      toggleBtnRef.current.textContent = "Pausar";
      toggleBtnRef.current.setAttribute("aria-pressed", "false");
    }
    render(s.startTime);
    ensureRunning();
  }

  useEffect(() => {
    let cancelled = false;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    s.prefersReducedMotion = mq.matches;

    function onMotionChange(e: MediaQueryListEvent) {
      const now = performance.now();
      s.prefersReducedMotion = e.matches;
      setPrefersReducedMotion(e.matches);
      if (e.matches) {
        stopLoop();
        setReducedState(true);
      } else {
        setReducedState(false);
        s.reducedApplied = false;
        s.elapsedOffset = 0;
        s.startTime = now;
        s.paused = false;
        setPaused(false);
        if (toggleBtnRef.current) {
          toggleBtnRef.current.textContent = "Pausar";
          toggleBtnRef.current.setAttribute("aria-pressed", "false");
        }
        prepareDrawables();
        ensureRunning();
      }
    }

    function onVisibility() {
      const now = performance.now();
      if (document.hidden) {
        if (!s.paused && s.visible) s.pausedAt = now;
        s.visible = false;
        stopLoop();
      } else {
        s.visible = true;
        if (!s.paused) s.elapsedOffset -= now - (s.pausedAt || now);
        ensureRunning();
      }
    }

    let io: IntersectionObserver | null = null;
    if ("IntersectionObserver" in window && preloaderRef.current) {
      io = new IntersectionObserver((entries) => {
        const entry = entries[0];
        const now = performance.now();
        if (entry.isIntersecting) {
          s.inViewport = true;
          if (!s.paused) s.elapsedOffset -= now - (s.pausedAt || now);
          ensureRunning();
        } else {
          if (!s.paused && s.inViewport) s.pausedAt = now;
          s.inViewport = false;
          stopLoop();
        }
      }, { threshold: 0.01 });
      io.observe(preloaderRef.current);
    }

    let resizeTimer: ReturnType<typeof setTimeout>;
    function onResize() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => { if (!s.prefersReducedMotion) prepareDrawables(); }, 150);
    }

    async function init() {
      if (document.fonts && document.fonts.ready) {
        try { await document.fonts.ready; } catch (_) {}
      }
      if (cancelled) return;
      prepareDrawables();
      if (s.prefersReducedMotion) {
        setReducedState(true);
        s.reducedApplied = true;
      } else {
        s.startTime = performance.now();
        render(s.startTime);
        ensureRunning();
      }
    }
    init();

    if (mq.addEventListener) mq.addEventListener("change", onMotionChange);
    else mq.addListener(onMotionChange);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("resize", onResize);

    return () => {
      cancelled = true;
      stopLoop();
      clearTimeout(resizeTimer);
      if (mq.removeEventListener) mq.removeEventListener("change", onMotionChange);
      else mq.removeListener(onMotionChange);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("resize", onResize);
      io?.disconnect();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="cc-preloader" ref={preloaderRef}>
      <style>{CSS}</style>

      <div className="stage">
        <svg
          className="logo"
          viewBox="0 0 860 320"
          role="img"
          aria-labelledby={`${titleId} ${descId}`}
          xmlns="http://www.w3.org/2000/svg"
        >
          <title id={titleId}>Cafés de Carla</title>
          <desc id={descId}>Logotipo de Cafés de Carla con un perro y una taza de caf?.</desc>

          <g ref={logoRef} className="logo-group">
            <g ref={outlineRef} className="outline-group">
              <g transform={ICON_OFFSET} ref={iconOutlineRef}>
                <g transform={TRANSFORM}>
                  {ICON_PATHS.map((d, i) => (
                    <path key={i} className="draw-path draw-icon" d={d} />
                  ))}
                </g>
              </g>
              <g ref={textOutlineRef} id={`textOutline-${uid}`}>
                <text className="draw-text draw-text-cafe" x={320} y={148}>Cafés de</text>
                <text className="draw-text draw-text-carla" x={320} y={248}>Carla</text>
              </g>
            </g>

            <g ref={filledRef} className="filled-group" opacity={0}>
              <g transform={ICON_OFFSET} className="fill-icon">
                <g transform={TRANSFORM} fillRule="nonzero">
                  {ICON_PATHS.map((d, i) => (
                    <path key={i} fill="var(--ink)" stroke="none" d={d} />
                  ))}
                </g>
              </g>
              <g>
                <text className="fill-text fill-text-cafe" x={320} y={148}>Cafés de</text>
                <text className="fill-text fill-text-carla" x={320} y={248}>Carla</text>
              </g>
            </g>
          </g>
        </svg>
      </div>

      <div className="controls" aria-label="Controles del preloader">
        <button
          className="control-btn"
          ref={toggleBtnRef}
          type="button"
          aria-pressed={false}
          onClick={() => (paused ? play() : pause())}
          disabled={prefersReducedMotion}
        >
          Pausar
        </button>
        <button
          className="control-btn"
          ref={replayBtnRef}
          type="button"
          onClick={replay}
          disabled={prefersReducedMotion}
        >
          Repetir
        </button>
      </div>

      <div className="sr-only" ref={statusRef} aria-live="polite" />
    </div>
  );
}
