/**
 * The hero object: a milled laptop, open, with an editor on the screen.
 * Raymarched as a signed distance field.
 *
 * ## Why a hand-written shader and not three.js
 *
 * `docs/NEUMORPHISM_EVALUATION.md` rejected React Three Fiber because it needs
 * `dynamic(ssr: false)` and therefore lands structurally *after* hydration —
 * the opposite of the static-first change that fixed this site's TTFB. And
 * `docs/CAST_HANDOVER.md` §9 disqualified the animejs.com delivery model
 * outright: 301 KB of non-deferred JS behind `.page { opacity: 0 }`.
 *
 * Both objections are about payload and blocking, not about 3D. A single
 * fullscreen triangle and one fragment shader need no geometry pipeline, no
 * loader, no scene graph and no dependency at all.
 *
 * ## Why the object looks the way it does
 *
 * It is the CSS material in three dimensions, so it obeys the same rules or the
 * two stop reading as one system:
 *
 * - **One light source, top left.** `LIGHT` is the 3D form of the direction
 *   every `.cast` box-shadow already uses. There is no light that follows the
 *   pointer — `CursorSpotlight` was deleted from this codebase for that reason.
 * - **`--cast-hi` lights, `--cast-lo` shadows, `--plate` is the body.**
 * - **The keyboard well and the trackpad are recesses.** Project tiles set
 *   their image *into* the plate; this does the same in 3D, so raised and
 *   sunken read as two poles of one material.
 * - **It is seated, not floating.** The ground plane exists only to catch the
 *   contact shadow, drawn as alpha so the CSS ground shows through untouched.
 *
 * ## The screen is an emitter, not a second light
 *
 * CAST allows exactly one light source, and the screen does not break that
 * rule — it is a different category. A key light illuminates surfaces from
 * outside; a display emits. So the screen is excluded from the diffuse term,
 * from ambient occlusion and from shadowing, and it spills a little light back
 * onto the deck, because a lid that gives off nothing reads as a sticker rather
 * than as a screen.
 *
 * The accent appears there, on a minority of tokens, and it is `--signal-bright`
 * rather than `--signal`: the screen is a dark surface in BOTH themes, so the
 * token colour has to be the graphics-tier accent. This is the one deliberate
 * loosening of the "accent is rationed" rule, on the grounds that syntax
 * colour is content rather than decoration.
 *
 * ## Coordinate spaces
 *
 * The ray is rotated into OBJECT space once in main(), and the march, the
 * normals and the lighting all happen there. The earlier version rotated every
 * sample point instead, which meant a mat3 multiply inside the innermost loop.
 * Only the ground plane stays in world space, since it does not rotate.
 */

export const VERTEX_SHADER = `#version 300 es
in vec2 aPos;
void main() {
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`

export const FRAGMENT_SHADER = `#version 300 es
precision highp float;

uniform vec2  uRes;
uniform float uSpin;
uniform float uTilt;
uniform float uFov;
uniform float uOffsetX;
/** Vertical centring, solved against the PROJECTED extent. See lib/heroFraming. */
uniform float uOffsetY;
uniform float uTime;
/** Camera, all solved in lib/heroFraming.ts so nothing here can drift from it. */
uniform float uCenterY;
uniform float uCamLift;
uniform float uCamDist;
/** World-space height of the contact-shadow plane, from JS. */
uniform float uPlaneY;
uniform vec3  uPlate;
uniform vec3  uHi;
uniform vec3  uLo;
uniform vec3  uSignal;

out vec4 frag;

// Pre-normalised (-0.62, 0.74, 0.42): up and to the left, toward the viewer.
// The same direction --cast-hi comes from in every CSS shadow on the site.
const vec3 LIGHT = vec3(-0.5889, 0.7029, 0.3989);

// ── The laptop, in object space. The base's top face sits at y = 0. ──────
const vec3  BASE     = vec3(0.88, 0.045, 0.62);
const float BASE_R   = 0.030;
const vec3  WELL     = vec3(0.72, 0.030, 0.34);   // keyboard recess
const vec3  WELL_C   = vec3(0.0, 0.0, -0.16);
const vec3  PAD      = vec3(0.26, 0.026, 0.17);   // trackpad recess
const vec3  PAD_C    = vec3(0.0, 0.0, 0.34);
const vec3  LID      = vec3(0.86, 0.56, 0.020);
const float LID_R    = 0.016;
/** Lid lean back from vertical, radians. 0.30 ≈ 107° open. */
const float LID_TILT = 0.30;
const vec3  HINGE    = vec3(0.0, 0.0, -0.60);
/** Screen area on the lid's inner face, half-extents in lid-local xy. */
const vec2  SCREEN   = vec2(0.78, 0.485);
/** Etched mark on the lid's back, in MIRRORED lid-local xy. Origin, then size. */
const vec2  MARK_C   = vec2(-0.22, 0.04);
const vec2  MARK_S   = vec2(0.44, 0.28);
const vec2  WAVE_C   = vec2(-0.22, -0.13);
const vec2  WAVE_S   = vec2(0.44, 0.10);

// Bounding sphere, object space. Centre is the model's centroid and the radius
// reaches both extreme corners at 1.309; the margin covers the bevels.
const vec3  BOUND_C  = vec3(0.0, 0.49, -0.1555);
const float BOUND_R2 = 1.80;

// Screen palette. Linear, and deliberately NOT from the material tokens: a
// display's colour does not come from the surface it is set into, and the panel
// has to stay dark in both themes for the code to read at all.
const vec3 SCREEN_BG = vec3(0.018, 0.021, 0.026);
const vec3 INK_DIM   = vec3(0.055, 0.062, 0.072);
const vec3 INK_BASE  = vec3(0.340, 0.370, 0.420);
const vec3 GLOW      = vec3(0.420, 0.500, 0.620);
const float LINES    = 21.0;

const float TAU = 6.2831853;
// Real facing marks are FINE. An earlier 130/185 put about fourteen arcs some
// 25px apart across the deck, which reads as a decorative ripple rather than a
// machined finish. Measured cost then was 0.057 cycles per pixel, far below the
// 0.5 Nyquist limit, so there was ample headroom to make them finer.
const float RING_FREQ  = 380.0;
const float AXIAL_FREQ = 520.0;

// Lid frame. Assigned once per pixel in main(); GLSL ES cannot fold cos/sin
// into a const initialiser portably.
vec3 gLidUp;
vec3 gLidNrm;
vec3 gLidCtr;

mat3 rotY(float a) {
  float c = cos(a), s = sin(a);
  return mat3(c, 0.0, -s, 0.0, 1.0, 0.0, s, 0.0, c);
}

mat3 rotX(float a) {
  float c = cos(a), s = sin(a);
  return mat3(1.0, 0.0, 0.0, 0.0, c, s, 0.0, -s, c);
}

float hash11(float n) { return fract(sin(n * 78.233) * 43758.5453); }
float hash21(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

float sdRoundBox(vec3 p, vec3 b, float r) {
  vec3 d = abs(p) - b + r;
  return length(max(d, 0.0)) + min(max(d.x, max(d.y, d.z)), 0.0) - r;
}

/** Object point → lid-local, where +z is the screen side and +y runs up it. */
vec3 toLid(vec3 p) {
  vec3 d = p - gLidCtr;
  return vec3(d.x, dot(d, gLidUp), dot(d, gLidNrm));
}

/** Returns (distance, id). id 0 = base, 1 = lid. */
vec2 sdSceneId(vec3 p) {
  float base = sdRoundBox(p - vec3(0.0, -BASE.y, 0.0), BASE, BASE_R);
  base = max(base, -sdRoundBox(p - WELL_C, WELL, 0.020));
  base = max(base, -sdRoundBox(p - PAD_C, PAD, 0.020));

  float lid = sdRoundBox(toLid(p), LID, LID_R);

  return base < lid ? vec2(base, 0.0) : vec2(lid, 1.0);
}

float sdScene(vec3 p) { return sdSceneId(p).x; }

vec3 normalAt(vec3 p) {
  vec2 e = vec2(0.0014, 0.0);
  return normalize(vec3(
    sdScene(p + e.xyy) - sdScene(p - e.xyy),
    sdScene(p + e.yxy) - sdScene(p - e.yxy),
    sdScene(p + e.yyx) - sdScene(p - e.yyx)
  ));
}

// Machining marks. Concentric on horizontal faces, which is what a facing cut
// leaves; axial on the vertical ones, which is what an end-mill pass leaves.
// Perturbing the normal rather than the distance field keeps them free — they
// cost no marching steps and cannot break the field's Lipschitz bound.
//
// They are band-limited, and that is not optional. A mark is a normal
// perturbation, and specular response to a perturbed normal carries a far
// higher effective frequency than the pattern itself, so wherever a pixel spans
// several cycles an unattenuated pattern aliases into moiré rosettes.
//
// \`span\` is the world width of one pixel measured ALONG the surface, so it
// accounts for foreshortening. It is derived analytically rather than with
// fwidth() because neighbouring fragments in a quad may have missed the object
// entirely, which would poison a screen-space derivative.
vec3 millNormal(vec3 q, vec3 n, vec3 rd, float pxWorld) {
  float span = pxWorld / max(abs(dot(n, rd)), 0.08);
  // Nyquist is 0.5 cycles per pixel. The window starts at 0.28 rather than a
  // more cautious 0.20 because the canvas renders into a supersampled backing
  // store, so a shader pixel is finer than a display pixel.
  float ringFade = 1.0 - smoothstep(0.28, 0.50, span * RING_FREQ / TAU);
  float axialFade = 1.0 - smoothstep(0.28, 0.50, span * AXIAL_FREQ / TAU);

  float horizontal = smoothstep(0.55, 0.92, abs(n.y));
  float r = length(q.xz);
  vec3 radial = r > 1e-4 ? vec3(q.x, 0.0, q.z) / r : vec3(1.0, 0.0, 0.0);

  vec3 bump = mix(
    vec3(0.0, sin(q.y * AXIAL_FREQ) * axialFade, 0.0),
    radial * sin(r * RING_FREQ) * ringFade,
    horizontal
  );

  // Shallow: at this frequency a larger amplitude would corrugate the part
  // rather than let it catch the light.
  return normalize(n + bump * 0.016);
}

float ao(vec3 p, vec3 n) {
  float occ = 0.0;
  float sca = 1.0;
  for (int i = 0; i < 5; i++) {
    float h = 0.012 + 0.085 * float(i);
    occ += (h - sdScene(p + n * h)) * sca;
    sca *= 0.86;
  }
  return clamp(1.0 - 1.45 * occ, 0.0, 1.0);
}

float softShadow(vec3 ro, vec3 rd) {
  float res = 1.0;
  float t = 0.02;
  for (int i = 0; i < 16; i++) {
    float h = sdScene(ro + rd * t);
    res = min(res, h / (0.055 * t));
    t += clamp(h, 0.04, 0.30);
    if (res < -1.0 || t > 3.2) break;
  }
  res = max(res, -1.0);
  return 0.25 * (1.0 + res) * (1.0 + res) * (2.0 - res);
}

float march(vec3 ro, vec3 rd, float tNear, float tFar) {
  float t = tNear;
  for (int i = 0; i < 64; i++) {
    float d = sdScene(ro + rd * t);
    if (d < 0.0005 + 0.0004 * t) return t;
    t += d;
    if (t > tFar) break;
  }
  return -1.0;
}

/** 2D rounded-rectangle distance. Negative inside. */
float sdRoundRect2(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

/**
 * Keycaps in the keyboard well. Returns (cap, bevel):
 *
 *   cap   — 1 on a keycap, 0 in the seam, antialiased across about one pixel
 *   bevel — +1 at a cap's lit top rim, −1 at its shaded bottom rim, 0 in the
 *           middle, so every cap is a miniature .cast plate under the same
 *           single light source as the rest of the site
 *
 * A uniform grid was the first attempt and it read as a calculator. What makes
 * something a keyboard is that the rows DISAGREE: a half-height function row at
 * the back, a different key count on every row, a small stagger offsetting each
 * row against the one behind it, and one long space bar.
 *
 * The px argument is the width of one screen pixel expressed in CELL units, and
 * passing it in is the difference between crisp keys and mush. The first version
 * faded the seam over a fixed 0.26 of a cell, which is fine when the laptop fills
 * the stage and turns every key into a smudge when it does not. Deriving the feather
 * from the real pixel footprint keeps the seam one pixel wide at every size —
 * and lets the seams fade out deliberately, rather than alias, once the keyboard
 * is genuinely under-resolved.
 */
vec2 keycap(vec2 wp, float px) {
  float r = floor(wp.y * 6.0);
  float ry = fract(wp.y * 6.0);

  float cols, shift, top;
  if (r < 0.5)      { cols = 13.0; shift = 0.000; top = 0.44; }  // fn row, short
  else if (r < 1.5) { cols = 14.0; shift = 0.000; top = 0.10; }  // digits + del
  else if (r < 2.5) { cols = 13.0; shift = 0.028; top = 0.10; }  // tab row
  else if (r < 3.5) { cols = 12.0; shift = 0.052; top = 0.10; }  // home row
  else if (r < 4.5) { cols = 11.0; shift = 0.018; top = 0.10; }  // shift row
  else              { cols =  9.0; shift = 0.000; top = 0.10; }  // modifiers

  float cu = (wp.x - shift) * cols;
  float ci = floor(cu);
  float u = fract(cu);

  // The space bar: on the bottom row the middle three cells are one key.
  if (r > 4.5 && ci > 2.5 && ci < 5.5) u = fract((cu - 3.0) / 3.0);

  float v = (ry - top) / (1.0 - top - 0.10);
  if (v < -0.05 || v > 1.05) return vec2(0.0);

  // Cell-local, ±1 on each axis. The cap does not fill its cell — the margin
  // IS the seam, and it has to exist on all four sides for a key to read as a
  // separate object rather than as a tile in a grid.
  vec2 q = vec2(u, clamp(v, 0.0, 1.0)) * 2.0 - 1.0;
  float d = sdRoundRect2(q, vec2(0.80, 0.74), 0.26);

  float cell = px * cols * 2.0;
  float cap = 1.0 - smoothstep(-cell, cell, d);
  // Once a cell is narrower than a few pixels the seams cannot be resolved, so
  // they are faded out on purpose instead of being left to shimmer.
  cap = mix(1.0, cap, 1.0 - smoothstep(0.22, 0.55, cell));

  // Concentrated at the rim rather than spread across the cap: a keycap has a
  // bright top edge and a dark bottom edge, not a gradient.
  float rim = 1.0 - smoothstep(0.0, 0.40, -d);
  float bevel = cap * rim * clamp(-q.y * 1.8, -1.0, 1.0);

  return vec2(cap, bevel);
}

/**
 * "SW", an 11×7 bitmap, most significant bit leftmost: five columns of S, a
 * blank column, five of W. A chain of comparisons rather than a const array
 * because dynamic indexing of one is the sort of thing drivers disagree about.
 */
int monoRow(int r) {
  if (r == 0) return 913;
  if (r == 1) return 1105;
  if (r == 2) return 1041;
  if (r == 3) return 913;
  if (r == 4) return 85;
  if (r == 5) return 1115;
  return 906;   // W closes on two feet, not one flat bar
}

/**
 * The editor. Procedural, in lid-local xy.
 *
 * Layout is a tab strip, a file tree, a gutter and the code area, all sharing
 * one line grid so the tree, the line numbers and the code sit on the same
 * baseline. The code is built at CHARACTER scale rather than word scale — an
 * earlier version drew whole words as single bars and read as a bar chart.
 */
vec3 screenColor(vec2 lxy) {
  vec2 uv = vec2(
    (lxy.x + SCREEN.x) / (2.0 * SCREEN.x),
    1.0 - (lxy.y + SCREEN.y) / (2.0 * SCREEN.y)
  );

  vec3 col = SCREEN_BG;

  float inTabs = 1.0 - step(0.055, uv.y);
  float inTree = 1.0 - step(0.155, uv.x);

  col = mix(col, SCREEN_BG * 1.9, inTabs);
  if (inTabs > 0.5 && uv.x > 0.155 && uv.x < 0.34) col = SCREEN_BG * 3.0;
  col = mix(col, SCREEN_BG * 0.55, inTree * step(0.055, uv.y));

  float vy = (uv.y - 0.055) / 0.945;
  if (vy < 0.0) return col;

  float row = floor(vy * LINES);
  float rowT = fract(vy * LINES);
  float band = step(0.26, rowT) * (1.0 - step(0.74, rowT));

  if (inTree > 0.5) {
    float indent = 0.030 + 0.022 * floor(hash11(row * 5.3) * 2.0);
    float len = 0.050 + 0.055 * hash11(row * 9.1);
    float bar = step(indent, uv.x) * (1.0 - step(indent + len, uv.x));
    col = mix(col, INK_DIM * 2.2, bar * band * (1.0 - step(10.0, row)));
    return col;
  }

  if (uv.x < 0.205) {
    float g = (uv.x - 0.160) / 0.040;
    float tick = step(0.15, g) * (1.0 - step(0.78, g));
    col = mix(col, INK_DIM * 1.6, tick * band);
    return col;
  }

  float x = (uv.x - 0.215) / 0.785;
  float blank = step(0.86, hash11(row * 2.7 + 4.1));
  float indent = 0.055 * floor(hash11(row * 1.7) * 3.0);
  float len = 0.18 + 0.66 * hash11(row * 3.1);
  float inLine = step(indent, x) * (1.0 - step(indent + len, x)) * (1.0 - blank);

  float charW = 0.0135;
  float ci = floor((x - indent) / charW);
  float cf = fract((x - indent) / charW);
  float glyph = 1.0 - step(0.72, cf);
  float space = step(0.80, hash21(vec2(ci, row * 1.1 + 3.0)));
  float ink = band * inLine * glyph * (1.0 - space);

  // Token class per run of ~5 characters, so colour changes at word scale while
  // the shapes stay at character scale.
  float cls = hash11(floor(ci / 5.0) * 3.7 + row * 11.3);
  vec3 tok = INK_BASE;
  if (cls > 0.86) tok = uSignal;
  else if (cls < 0.16) tok = INK_DIM * 2.4;

  col = mix(col, tok, ink);

  // Caret, blinking, on one line. The object already rotates, but a caret is
  // what makes it read as a machine that is switched on.
  float caretRow = floor(hash11(9.7) * (LINES - 2.0)) + 1.0;
  if (abs(row - caretRow) < 0.5) {
    float cx = indent + len;
    float on = step(0.5, fract(uTime * 0.75));
    float bar = step(cx, x) * (1.0 - step(cx + 0.006, x));
    col = mix(col, INK_BASE * 1.7, bar * band * on * (1.0 - blank));
  }

  return col;
}

// Linear → sRGB. The lighting above is linear because that is the space oklch
// decodes into; this is the only place the transfer function is applied.
vec3 encode(vec3 c) {
  c = clamp(c, 0.0, 1.0);
  return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(vec3(0.0031308), c));
}

void main() {
  vec2 uv = (2.0 * gl_FragCoord.xy - uRes) / uRes.y;
  uv.x -= uOffsetX;
  uv.y += uOffsetY;

  float lc = cos(LID_TILT), ls = sin(LID_TILT);
  gLidUp = vec3(0.0, lc, -ls);
  gLidNrm = vec3(0.0, ls, lc);
  gLidCtr = HINGE + gLidUp * LID.y;

  mat3 rot = rotY(uSpin) * rotX(uTilt);

  // Camera, world space. Every term is supplied by JS: the object's extent
  // depends on the tilt, and the framing has to be solved against the stage's
  // aspect ratio, which this shader cannot know.
  vec3 ro = vec3(0.0, uCenterY + uCamLift, uCamDist);
  vec3 cw = normalize(vec3(0.0, uCenterY, 0.0) - ro);
  vec3 cu = normalize(cross(cw, vec3(0.0, 1.0, 0.0)));
  vec3 cv = cross(cu, cw);
  vec3 rd = normalize(uv.x * cu + uv.y * cv + uFov * cw);

  // Into object space once, rather than rotating every sample in the march.
  // The product "v * rot" is transpose(rot) * v, and rot is orthonormal, so
  // this is the inverse rotation; lengths and dot products are preserved.
  vec3 roO = ro * rot;
  vec3 rdO = rd * rot;
  vec3 lightO = LIGHT * rot;

  // Bounding-sphere reject. Most of a full-bleed hero is empty ground, and
  // marching those pixels was the single biggest cost in the frame.
  vec3 oc = roO - BOUND_C;
  float b = dot(oc, rdO);
  float disc = b * b - (dot(oc, oc) - BOUND_R2);

  float tHit = -1.0;
  if (disc > 0.0) {
    float sq = sqrt(disc);
    float tFar = -b + sq;
    if (tFar > 0.0) tHit = march(roO, rdO, max(-b - sq, 0.0), tFar);
  }

  if (tHit > 0.0) {
    vec3 p = roO + rdO * tHit;
    float id = sdSceneId(p).y;
    vec3 nRaw = normalAt(p);
    vec3 lp = toLid(p);

    // ── The screen: emitter, so none of the surface lighting applies ──
    bool onInnerFace = id > 0.5 && lp.z > LID.z - 0.010;
    if (onInnerFace && abs(lp.x) < SCREEN.x && abs(lp.y) < SCREEN.y) {
      vec3 col = screenColor(lp.xy);
      // Glass. A screen with no glancing reflection reads as printed on.
      col += uHi * pow(1.0 - abs(dot(nRaw, -rdO)), 5.0) * 0.20;
      frag = vec4(encode(col), 1.0);
      return;
    }

    // ── Everything else is milled aluminium ──────────────────────────
    float pxWorld = 2.0 * tHit / (uRes.y * uFov);
    vec3 n = millNormal(p, nRaw, rdO, pxWorld);

    float occ = ao(p, n);
    float sha = softShadow(p + n * 0.006, lightO);
    float dif = clamp(dot(n, lightO), 0.0, 1.0);
    float spe = pow(clamp(dot(n, normalize(lightO - rdO)), 0.0, 1.0), 58.0);
    float fres = pow(1.0 - clamp(dot(n, -rdO), 0.0, 1.0), 4.0);

    // The surface runs from the shadow pole THROUGH the plate to the light
    // pole. It does not scale --plate, and that distinction is the difference
    // between an object and an invisible one: scaling can only ever darken, and
    // --plate is 1.02:1 against --ground in dark mode, so a scaled term put the
    // brightest face exactly on the ground colour. The poles are the only
    // tokens with room in them, in both themes — --cast-lo sits below the
    // ground and --cast-hi above it.
    float lit = dif * mix(0.5, 1.0, sha);
    vec3 col = mix(uLo, uPlate, smoothstep(0.0, 0.58, lit));
    col = mix(col, uHi, smoothstep(0.58, 1.0, lit) * 0.62);
    col = mix(col, uLo, (1.0 - occ) * 0.55);

    // Bezel: the inner face outside the screen is darker than the body.
    if (onInnerFace) col = mix(col, uLo, 0.55);

    // ── The easter egg ───────────────────────────────────────────────────
    // Etched on the lid's BACK, so it is only there to be found once the laptop
    // has spun far enough to show it — which is to say, once you scroll.
    if (id > 0.5 && lp.z < -LID.z + 0.010) {
      // Mirrored in x. The mark is read from behind the lid, so without the
      // flip the monogram comes out backwards.
      vec2 q2 = vec2(-lp.x, lp.y);
      float etch = 0.0;

      vec2 m = (q2 - MARK_C) / MARK_S;
      if (m.x > 0.0 && m.x < 1.0 && m.y > 0.0 && m.y < 1.0) {
        int cx = clamp(int(m.x * 11.0), 0, 10);
        int cy = clamp(int((1.0 - m.y) * 7.0), 0, 6);
        etch = float((monoRow(cy) >> (10 - cx)) & 1);
      }

      // A clock line under the monogram. It is also the reason the mark stops
      // here: the depth limit from the old hero concept still stands, and a
      // square wave is the last honest thing above the level of the computer.
      vec2 wv = (q2 - WAVE_C) / WAVE_S;
      if (wv.x > 0.0 && wv.x < 1.0 && wv.y > 0.0 && wv.y < 1.0) {
        float ph = fract(wv.x * 4.0);
        float lvl = ph < 0.5 ? 0.72 : 0.28;
        float onH = abs(wv.y - lvl) < 0.10 ? 1.0 : 0.0;
        bool nearEdge = min(abs(ph - 0.5), min(ph, 1.0 - ph)) < 0.055;
        float onV = (nearEdge && wv.y > 0.18 && wv.y < 0.82) ? 1.0 : 0.0;
        etch = max(etch, max(onH, onV));
      }

      // Etched aluminium is a change of FINISH, not a groove — the surface
      // scatters more where the laser hit it, so it reads lighter. That is also
      // why it needs no normal perturbation and cannot alias.
      col = mix(col, mix(col, uHi, 0.45), etch);
    }

    // Keys, on the floor of the keyboard well.
    if (id < 0.5 && n.y > 0.5 && p.y < -0.014 &&
        abs(p.x) < WELL.x && abs(p.z - WELL_C.z) < WELL.z) {
      vec2 wp = vec2(
        (p.x + WELL.x) / (2.0 * WELL.x),
        (p.z - WELL_C.z + WELL.z) / (2.0 * WELL.z)
      );
      // Pixel footprint along the deck, in well units. The deck is seen at a
      // shallow angle, so the foreshortening term is what stops the seams from
      // collapsing toward the back of the keyboard.
      float pxWp = pxWorld / max(abs(dot(n, rdO)), 0.15) / (2.0 * WELL.x);
      vec2 kc = keycap(wp, pxWp);

      // The well floor between the caps sits in shadow. Deep, because this is
      // the only cue that separates one key from the next.
      col = mix(mix(col, uLo, 0.88), col, kc.x);
      // Then each cap catches the light on its top rim and falls into its own
      // shadow at the bottom — the same rule as every .cast surface.
      col = mix(col, kc.y > 0.0 ? uHi : uLo, abs(kc.y) * 0.55);
    }

    // Spill from the screen onto the deck. Small, and it falls off toward the
    // user — without it the lid reads as a sticker rather than as a display.
    if (id < 0.5 && n.y > 0.4) {
      col += GLOW * exp(-2.4 * clamp(p.z + 0.60, 0.0, 1.4)) * 0.055;
    }

    col += uHi * spe * (0.15 * sha);
    col += uHi * fres * 0.08;   // the .rim hairline, as real geometry

    // Nothing in this material may be brighter than its own light source.
    // Without this the specular lobe clipped to pure white, and pure white is a
    // colour the palette does not contain — --cast-hi is oklch(0.982).
    col = min(col, uHi);

    frag = vec4(encode(col), 1.0);
    return;
  }

  // Nothing floats in CAST. Rays that miss still land on the ground, and all
  // they pick up there is the contact shadow — written as alpha, so the page's
  // own --ground shows through and the canvas edge is invisible by construction
  // rather than by matching two colour pipelines.
  if (rd.y < -1e-4) {
    float tp = (uPlaneY - ro.y) / rd.y;
    if (tp > 0.0) {
      vec3 pp = ro + rd * tp;
      float occ = 1.0 - softShadow(pp * rot + vec3(0.0, 0.004, 0.0), lightO);
      float fade = exp(-0.10 * dot(pp.xz, pp.xz));   // no horizon line
      float a = clamp(occ * fade, 0.0, 1.0) * 0.60;
      if (a > 0.002) {
        frag = vec4(encode(uLo) * a, a);
        return;
      }
    }
  }

  frag = vec4(0.0);
}
`
