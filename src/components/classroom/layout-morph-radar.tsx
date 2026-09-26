"use client";

import * as React from "react";
import {
  LayoutGrid,
  LayoutDashboard,
  List,
  Layers,
  GalleryHorizontalEnd,
  Dna,
  X,
  Radio,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Award,
  ExternalLink,
  Code2,
} from "lucide-react";
import { StudentLiveState, LiveAssistanceSession } from "@/types";
import styles from "./layout-morph.module.css";

// -------------------------------------------------------------
// Math & Physics Constants
// -------------------------------------------------------------
function springConfig(duration: number, bounce: number) {
  const omega = (2 * Math.PI) / (1.2 * duration);
  const k = omega * omega;
  const c = 2 * Math.min(1, Math.max(0.05, 1 - bounce)) * Math.sqrt(k);
  return { k, c };
}

const G_SPRING = springConfig(0.55, 0.16); // Layout morph spring
const Y_SPRING = springConfig(0.22, 0);    // Fast snap spring
const S_SPRING = springConfig(0.35, 0.25); // Snappy spring
const L_SPRING = springConfig(0.48, 0.04); // Smooth spring
const Z_SPRING = springConfig(0.52, 0.1);  // Ring spring

const STAGGER_STEP = 0.024;
const THRESHOLDS = [
  0.08, 0.08, 0.08, 0.08, 0.08,
  0.0006, 0.0006, 0.0006, 0.05,
  0.08, 0.08, 0.08, 0.08, 0.05,
  0.002, 0.002, 0.002, 0.002, 0.002, 0.002,
];

const clamp = (val: number, min: number, max: number) =>
  Math.min(max, Math.max(min, val));

const smoothstep = (min: number, max: number, val: number) => {
  const x = clamp((val - min) / (max - min), 0, 1);
  return x * x * (3 - 2 * x);
};

const normAngle = (a: number) =>
  a - 2 * Math.round(a / (2 * Math.PI)) * Math.PI;

const rubberBand = (dist: number, max: number) =>
  (1 - 1 / ((0.55 * dist) / max + 1)) * max;

const clampRubber = (
  t: number,
  min: number,
  max: number,
  rb: number
) => {
  if (t < min) return min - rubberBand(min - t, rb);
  if (t > max) return max + rubberBand(t - max, rb);
  return t;
};

const round2 = (v: number) => Math.round(100 * v) / 100;
const round4 = (v: number) => Math.round(10000 * v) / 10000;

const rotX = (t: number) => {
  const c = Math.cos(t), s = Math.sin(t);
  return [1, 0, 0, 0, c, -s, 0, s, c];
};

const rotY = (t: number) => {
  const c = Math.cos(t), s = Math.sin(t);
  return [c, 0, s, 0, 1, 0, -s, 0, c];
};

const rotZ = (t: number) => {
  const c = Math.cos(t), s = Math.sin(t);
  return [c, -s, 0, s, c, 0, 0, 0, 1];
};

function matMul(a: number[], b: number[]) {
  const res = new Array(9);
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      res[3 * r + c] =
        a[3 * r] * b[c] +
        a[3 * r + 1] * b[3 + c] +
        a[3 * r + 2] * b[6 + c];
    }
  }
  return res;
}

const vecMul = (m: number[], x: number, y: number, z: number) => [
  m[0] * x + m[1] * y + m[2] * z,
  m[3] * x + m[4] * y + m[5] * z,
  m[6] * x + m[7] * y + m[8] * z,
];

const staggerOrder = (i: number) => (i === 2 ? 0 : i < 2 ? i + 1 : i);

function setPose(
  buf: Float32Array,
  idx: number,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  m: number[],
  opts: { z?: number; rx?: number; ry?: number; rz?: number } = {}
) {
  const o = 20 * idx;
  buf[o + 0] = x;
  buf[o + 1] = y;
  buf[o + 2] = opts.z ?? 0;
  buf[o + 3] = w;
  buf[o + 4] = h;
  buf[o + 5] = opts.rx ?? 0;
  buf[o + 6] = opts.ry ?? 0;
  buf[o + 7] = opts.rz ?? 0;
  buf[o + 8] = r;
  buf[o + 9] = m[0];
  buf[o + 10] = m[1];
  buf[o + 11] = m[2];
  buf[o + 12] = m[3];
  buf[o + 13] = m[4];
  buf[o + 14] = 1; // opacity
}

const insetBox = (w: number, h: number, pad: number, bpad: number, r: number) => [
  pad,
  pad,
  w - 2 * pad,
  h - 2 * pad - bpad,
  Math.max(r - pad, 4),
];

// -------------------------------------------------------------
// Engine Class for 3D Morph Physics
// -------------------------------------------------------------
interface EngineOptions {
  stage: HTMLElement;
  world: HTMLElement;
  tag: HTMLElement | null;
  cards: HTMLElement[];
  aspects: number[];
  onFront?: (idx: number) => void;
  onTag?: (idx: number) => void;
  onBackdrop?: () => void;
}

class LayoutMorphEngine {
  o: EngineOptions;
  n: number;
  cam = new Float64Array(6);
  camV = new Float64Array(6);
  camT = new Float64Array(6);
  pz = 0;
  ring: { R: number; step: number; f0: number; dy: number; tilt: number; cull: boolean } | null = null;
  panMinY = 0;
  lift = [30, 0];
  tagOn = false;
  fronts: Record<string, number> = { carousel: 2, helix: 6 };
  layout: "grid" | "masonry" | "list" | "stack" | "carousel" | "helix" = "grid";
  dealt = false;
  sw = 0;
  sh = 0;
  persp = 1200;
  hovered = -1;
  keyed = -1;
  opened = -1;
  time = 0;
  raf = 0;
  last = 0;
  visible = true;
  shown = true;
  reduced = false;
  drag: {
    id: number;
    x0: number;
    y0: number;
    active: boolean;
    phi0: number;
    px0: number;
    py0: number;
    t: number;
    v: number;
    vx: number;
    vy: number;
  } | null = null;
  suppress = false;
  backdrop = false;
  front = -1;
  tagP = [0, 0];
  tagV = [0, 0];
  tagShown = false;
  tagIdx = -1;
  tagSeen = 0;
  wheelTimer: any = null;

  pos: Float32Array;
  vel: Float32Array;
  tgt: Float32Array;
  pend: Float32Array;
  home: Float32Array;
  release: Float64Array;
  cap: Int8Array;
  pendCap: Int8Array;
  homeCap: Int8Array;
  angles: Float32Array;
  back: Int8Array;
  media: (HTMLElement | null)[];
  caps: HTMLElement[][];
  cache: string[][];
  ro: ResizeObserver;
  io: IntersectionObserver;

  constructor(opts: EngineOptions) {
    this.o = opts;
    const n = (this.n = opts.cards.length);
    this.pos = new Float32Array(20 * n);
    this.vel = new Float32Array(20 * n);
    this.tgt = new Float32Array(20 * n);
    this.pend = new Float32Array(20 * n);
    this.home = new Float32Array(20 * n);
    this.release = new Float64Array(n).fill(-1);
    this.cap = new Int8Array(n);
    this.pendCap = new Int8Array(n);
    this.homeCap = new Int8Array(n);
    this.angles = new Float32Array(n);
    this.back = new Int8Array(n);

    this.media = opts.cards.map((c) => c.querySelector('[data-part="media"]'));
    this.caps = opts.cards.map((c) =>
      Array.from(c.querySelectorAll('[data-part="cap"]'))
    );
    this.cache = opts.cards.map(() => []);

    for (let i = 0; i < n; i++) {
      const st = staggerOrder(i);
      setPose(
        this.pos,
        i,
        0,
        0,
        150,
        196,
        16,
        insetBox(150, 196, 5, 40, 16),
        {
          z: (n - st) * 0.6,
          rz: st === 0 ? 0 : (((7 * i) % 9 - 4) * 1.1 * Math.PI) / 180,
        }
      );
      this.pos[20 * i + 15] = 1;
    }
    this.tgt.set(this.pos);
    this.home.set(this.pos);

    const { stage } = opts;
    stage.addEventListener("pointerdown", this.onDown);
    stage.addEventListener("pointermove", this.onMove);
    stage.addEventListener("pointerup", this.onUp);
    stage.addEventListener("pointercancel", this.onUp);
    stage.addEventListener("wheel", this.onWheel, { passive: false });
    document.addEventListener("visibilitychange", this.onVisibility);

    this.ro = new ResizeObserver((entries) => {
      const rect = entries[0].contentRect;
      this.resize(rect.width || 1100, rect.height || 600);
    });
    this.ro.observe(stage);

    this.io = new IntersectionObserver(
      (entries) => {
        const last = entries[entries.length - 1];
        this.visible = last.isIntersecting;
        if (last.isIntersecting && !this.dealt) {
          this.deal();
        }
        this.kick();
      },
      { threshold: [0, 0.2] }
    );
    this.io.observe(stage);

    // Initial sizing safety trigger
    setTimeout(() => {
      const rect = stage.getBoundingClientRect();
      this.resize(rect.width || 1100, rect.height || 600);
      if (!this.dealt) this.deal();
    }, 50);
  }

  destroy() {
    const { stage } = this.o;
    cancelAnimationFrame(this.raf);
    clearTimeout(this.wheelTimer);
    this.ro.disconnect();
    this.io.disconnect();
    stage.removeEventListener("pointerdown", this.onDown);
    stage.removeEventListener("pointermove", this.onMove);
    stage.removeEventListener("pointerup", this.onUp);
    stage.removeEventListener("pointercancel", this.onUp);
    stage.removeEventListener("wheel", this.onWheel);
    document.removeEventListener("visibilitychange", this.onVisibility);
  }

  onVisibility = () => {
    this.shown = document.visibilityState === "visible";
    this.kick();
  };

  onDown = (e: PointerEvent) => {
    if (e.button !== 0) return;
    if (this.opened >= 0) {
      const card = this.o.cards[this.opened];
      const target = e.target as HTMLElement;
      this.backdrop = !card.contains(target) && !target.closest("button");
      return;
    }
    this.suppress = false;
    this.drag = {
      id: e.pointerId,
      x0: e.clientX,
      y0: e.clientY,
      active: false,
      phi0: this.cam[0],
      px0: this.cam[3],
      py0: this.cam[4],
      t: e.timeStamp,
      v: 0,
      vx: 0,
      vy: 0,
    };
  };

  onMove = (e: PointerEvent) => {
    const drag = this.drag;
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.x0;
    const dy = e.clientY - drag.y0;

    if (!drag.active) {
      if (Math.hypot(dx, dy) < 6) return;
      if (
        e.pointerType !== "mouse" &&
        Math.abs(dy) > Math.abs(dx) &&
        !(this.panMinY < 0 && !this.ring)
      ) {
        this.drag = null;
        return;
      }
      drag.active = true;
      drag.phi0 = this.cam[0];
      drag.px0 = this.cam[3];
      drag.py0 = this.cam[4];
      drag.x0 = e.clientX;
      drag.y0 = e.clientY;
      this.o.stage.setPointerCapture(e.pointerId);
      this.o.stage.dataset.dragging = "true";
      return;
    }

    const dt = Math.max(1, e.timeStamp - drag.t) / 1000;
    drag.t = e.timeStamp;

    if (this.ring) {
      const R = this.ring.R;
      const [minPhi, maxPhi] = this.phiBounds();
      const r =
        clampRubber((drag.phi0 + dx / R) * R, minPhi * R, maxPhi * R, 0.5 * this.sw) /
        R;
      drag.v = 0.75 * ((r - this.cam[0]) / dt) + 0.25 * drag.v;
      this.cam[0] = this.camT[0] = r;
      this.camV[0] = 0;
    } else {
      const tx = clampRubber(drag.px0 + dx, 0, 0, 0.6 * this.sw);
      const ty = clampRubber(drag.py0 + dy, this.panMinY, 0, 0.6 * this.sh);
      drag.vx = 0.75 * ((tx - this.cam[3]) / dt) + 0.25 * drag.vx;
      drag.vy = 0.75 * ((ty - this.cam[4]) / dt) + 0.25 * drag.vy;
      this.cam[3] = this.camT[3] = tx;
      this.cam[4] = this.camT[4] = ty;
      this.camV[3] = this.camV[4] = 0;
    }
    this.kick();
  };

  onUp = (e: PointerEvent) => {
    if (this.opened >= 0) {
      if (this.backdrop && e.type === "pointerup") {
        this.o.onBackdrop?.();
      }
      this.backdrop = false;
      return;
    }
    const drag = this.drag;
    if (!drag || e.pointerId !== drag.id) return;
    this.drag = null;
    if (!drag.active) return;

    this.suppress = true;
    if (this.o.stage.hasPointerCapture(e.pointerId)) {
      this.o.stage.releasePointerCapture(e.pointerId);
    }
    this.o.stage.dataset.dragging = "false";

    const isStale = e.timeStamp - drag.t > 90;
    if (this.ring) {
      const ring = this.ring;
      const flingV = isStale ? 0 : clamp(drag.v, -14, 14);
      const predictedPhi = this.cam[0] + 0.3 * flingV;
      const targetIdx = clamp(
        Math.round(ring.f0 - predictedPhi / ring.step),
        0,
        this.n - 1
      );
      this.camT[0] = (ring.f0 - targetIdx) * ring.step;
      this.camV[0] = this.reduced ? 0 : flingV;
    } else {
      this.camT[3] = 0;
      this.camT[4] = clamp(
        this.cam[4] + (isStale ? 0 : drag.vy) * 0.3,
        this.panMinY,
        0
      );
      this.camV[3] = this.reduced || isStale ? 0 : drag.vx;
      this.camV[4] = this.reduced || isStale ? 0 : drag.vy;
    }
    this.kick();
  };

  onWheel = (e: WheelEvent) => {
    if (this.opened >= 0) return;
    if (this.ring) {
      const dx =
        Math.abs(e.deltaX) > Math.abs(e.deltaY)
          ? e.deltaX
          : e.shiftKey
          ? e.deltaY
          : 0;
      if (!dx) return;
      e.preventDefault();
      const [minPhi, maxPhi] = this.phiBounds();
      const nextPhi = clamp(this.camT[0] - dx / this.ring.R, minPhi, maxPhi);
      this.camT[0] = nextPhi;
      if (this.reduced) this.cam[0] = nextPhi;

      clearTimeout(this.wheelTimer);
      this.wheelTimer = setTimeout(() => {
        if (!this.ring) return;
        const targetIdx = clamp(
          Math.round(this.ring.f0 - this.camT[0] / this.ring.step),
          0,
          this.n - 1
        );
        this.toFront(targetIdx);
      }, 140);
      this.kick();
    } else if (this.panMinY < 0 && Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      const nextY = clamp(this.camT[4] - e.deltaY, this.panMinY, 0);
      if (nextY === this.camT[4]) return;
      e.preventDefault();
      this.camT[4] = nextY;
      if (this.reduced) this.cam[4] = nextY;
      this.kick();
    }
  };

  frame = (time: number) => {
    this.raf = 0;
    const dt = Math.min(1 / 30, Math.max(0, (time - this.last) / 1000));
    this.last = time;
    if (this.tick(dt) && this.visible && this.shown) {
      this.raf = requestAnimationFrame(this.frame);
    }
  };

  kick() {
    if (!this.raf && this.visible && this.shown) {
      this.last = performance.now();
      this.raf = requestAnimationFrame(this.frame);
    }
  }

  setReduced(r: boolean) {
    this.reduced = r;
    if (r && !this.dealt && this.sw) this.deal();
    this.kick();
  }

  setLayout(
    mode: "grid" | "masonry" | "list" | "stack" | "carousel" | "helix",
    origin?: { item?: number; x?: number; y?: number } | null,
    force = false
  ) {
    const isSame = mode === this.layout && this.dealt;
    this.layout = mode;
    if ((!this.dealt && !this.sw) || (isSame && !force)) return;

    const itemIdx = origin && "item" in origin ? origin.item ?? -1 : -1;
    const screenPt =
      itemIdx >= 0
        ? this.screenOf(itemIdx, false)
        : origin && "x" in origin
        ? [origin.x ?? 0, origin.y ?? 0]
        : [0, 0];

    this.apply(itemIdx, screenPt, force || this.reduced, false);
  }

  deal() {
    this.dealt = true;
    if (this.sw) {
      this.apply(-1, [0, 0], this.reduced, true);
    }
  }

  screw(t: number) {
    const r = this.ring;
    return r && r.dy ? -(r.f0 - t / r.step - (this.n - 1) / 2) * r.dy : 0;
  }

  world(x: number, y: number, z: number, a = this.cam[0], s = this.cam) {
    const sy = this.screw(a) + s[2];
    const [rx, ry, rz] = vecMul(
      matMul(rotX(s[1]), rotY(a)),
      x,
      y + sy,
      z + this.pz
    );
    return [rx + s[3], ry + s[4], rz + s[5] - this.pz];
  }

  screenOf(idx: number, withLift: boolean) {
    const o = 20 * idx;
    const p = this.pos;
    const liftScale = p[o + 19];
    const [lx, ly, lz] = withLift
      ? vecMul(
          matMul(rotY(p[o + 6]), matMul(rotX(p[o + 5]), rotZ(p[o + 7]))),
          0,
          -p[o + 4] / 2 - this.lift[1] * liftScale,
          this.lift[0] * liftScale
        )
      : [0, 0, 0];

    const [wx, wy, wz] = this.world(p[o + 0] + lx, p[o + 1] + ly, p[o + 2] + lz);
    const c = this.persp / Math.max(1, this.persp - wz);
    return [wx * c, wy * c];
  }

  bake() {
    const cam = this.cam;
    const camV = this.camV;
    if (
      Math.abs(cam[0]) < 1e-6 &&
      Math.abs(cam[1]) < 1e-6 &&
      Math.abs(this.screw(cam[0]) + cam[2]) < 0.001 &&
      Math.abs(cam[3]) < 0.001 &&
      Math.abs(cam[4]) < 0.001 &&
      Math.abs(cam[5]) < 0.001
    ) {
      return;
    }

    const mat = matMul(rotX(cam[1]), rotY(cam[0]));

    for (let s = 0; s < this.n; s++) {
      const idx = 20 * s;
      const targets =
        this.release[s] >= 0
          ? [this.pos, this.tgt, this.pend]
          : [this.pos, this.tgt];

      for (const t of targets) {
        const [wx, wy, wz] = this.world(t[idx + 0], t[idx + 1], t[idx + 2]);
        const curMat = matMul(
          mat,
          matMul(rotY(t[idx + 6]), matMul(rotX(t[idx + 5]), rotZ(t[idx + 7])))
        );
        const pitch = Math.asin(clamp(-curMat[5], -1, 1));
        const [yaw, roll] =
          Math.abs(curMat[5]) < 0.99999
            ? [Math.atan2(curMat[2], curMat[8]), Math.atan2(curMat[3], curMat[4])]
            : [Math.atan2(-curMat[6], curMat[0]), 0];

        t[idx + 0] = wx;
        t[idx + 1] = wy;
        t[idx + 2] = wz;
        t[idx + 5] = pitch;
        t[idx + 6] = yaw;
        t[idx + 7] = roll;
      }
    }

    cam.fill(0);
    camV.fill(0);
    this.camT.fill(0);
    this.pz = 0;
  }

  apply(frontItem: number, originPt: number[], immediate: boolean, isDeal: boolean) {
    const n = this.n;
    this.opened = -1;
    this.bake();

    const initialFront =
      this.layout === "carousel" || this.layout === "helix"
        ? frontItem >= 0
          ? frontItem
          : this.fronts[this.layout] ?? 0
        : 0;

    // Calculate poses for the chosen layout
    const layoutRes = computeLayout(
      this.layout,
      this.o.aspects,
      this.sw || 1100,
      this.sh || 600,
      initialFront
    );

    this.ring = layoutRes.ring;
    this.panMinY = layoutRes.panMinY;
    this.lift = layoutRes.lift;
    this.tagOn = layoutRes.tag;
    this.pz = layoutRes.ring ? layoutRes.ring.R : 0;

    const ring = layoutRes.ring;
    this.cam[2] = ring ? (initialFront - (n - 1) / 2) * ring.dy : 0;
    this.camT[1] = ring ? ring.tilt : 0;
    this.camT[4] = ring ? ring.R * Math.sin(ring.tilt) : 0;

    this.o.stage.dataset.scroll = String(layoutRes.panMinY < 0);
    this.o.stage.dataset.layout = this.layout;

    const dists = new Float32Array(n);
    let maxDist = 1;
    for (let i = 0; i < n; i++) {
      const [sx, sy] = this.screenOf(i, false);
      dists[i] = Math.hypot(sx - originPt[0], sy - originPt[1]);
      maxDist = Math.max(maxDist, dists[i]);
    }

    for (let i = 0; i < n; i++) {
      const o = 20 * i;
      for (let k = 0; k <= 14; k++) {
        this.pend[o + k] = layoutRes.poses[o + k];
      }
      this.pend[o + 6] =
        this.pos[o + 6] + normAngle(this.pend[o + 6] - this.pos[o + 6]);
      this.pend[o + 7] =
        this.pos[o + 7] + normAngle(this.pend[o + 7] - this.pos[o + 7]);
      this.pendCap[i] = layoutRes.caps[i];
      this.angles[i] = layoutRes.poses[o + 6];

      for (let k = 0; k <= 14; k++) {
        this.home[o + k] = layoutRes.poses[o + k];
      }
      this.homeCap[i] = layoutRes.caps[i];

      const delay = isDeal
        ? (staggerOrder(i) / (n - 1)) * STAGGER_STEP * 1.6
        : (dists[i] / maxDist) * STAGGER_STEP;
      this.release[i] = immediate ? this.time : this.time + delay;
    }

    if (immediate) {
      for (let i = 0; i < n; i++) this.releaseItem(i, false);
      this.snapAll();
    }

    this.o.stage.dataset.open = "false";
    this.o.cards.forEach((c) => (c.dataset.active = "false"));
    this.updateFront();
    this.kick();
  }

  releaseItem(idx: number, withKick: boolean) {
    const o = 20 * idx;
    const dx = this.pend[o + 0] - this.pos[o + 0];
    const dy = this.pend[o + 1] - this.pos[o + 1];

    for (let k = 0; k <= 14; k++) {
      this.tgt[o + k] = this.pend[o + k];
    }
    if (this.opened >= 0 && idx !== this.opened) {
      this.tgt[o + 14] = 0.12;
    }
    this.cap[idx] = this.pendCap[idx];
    this.release[idx] = -1;

    if (withKick && !this.reduced) {
      const dist = Math.hypot(dx, dy);
      this.vel[o + 2] += Math.min(3 * dist, 2600);
      this.vel[o + 7] += 1.1 * clamp(dx / 600, -1.4, 1.4);
    }
  }

  snapAll() {
    this.pos.set(this.tgt);
    this.vel.fill(0);
    for (let i = 0; i < this.n; i++) {
      for (let k = 0; k < 4; k++) {
        this.pos[20 * i + 15 + k] = +(k === this.cap[i]);
      }
    }
    this.cam.set(this.camT);
    this.camV.fill(0);
  }

  resize(w: number, h: number) {
    if (w < 1 || h < 1 || (Math.abs(w - this.sw) < 0.5 && Math.abs(h - this.sh) < 0.5))
      return;
    const isInit = !this.sw;
    this.sw = w;
    this.sh = h;
    this.persp = clamp(1.15 * w, 900, 1500);
    this.o.stage.style.perspective = `${this.persp}px`;
    this.o.stage.dataset.narrow = String(w < 720);

    if (isInit) {
      if (this.dealt) this.apply(-1, [0, 0], this.reduced, !this.reduced);
      return;
    }
    if (!this.dealt) return;

    const op = this.opened;
    const fr = this.ring ? this.front : -1;
    this.apply(fr, [0, 0], true, false);
    if (op >= 0) this.open(op, true);
  }

  hover(idx: number) {
    if (this.hovered !== idx) {
      this.hovered = idx;
      this.kick();
    }
  }

  unhover(idx: number) {
    if (this.hovered === idx) {
      this.hovered = -1;
      this.kick();
    }
  }

  focusItem(idx: number, isFocus: boolean, snap = true) {
    this.keyed = isFocus ? idx : -1;
    if (isFocus && snap && idx >= 0 && this.ring && this.opened < 0) {
      this.toFront(idx);
    }
    this.kick();
  }

  blurItem(idx: number) {
    if (this.keyed === idx) {
      this.keyed = -1;
      this.kick();
    }
  }

  frontIndex() {
    return this.front;
  }

  takeClick() {
    const s = this.suppress;
    this.suppress = false;
    return s;
  }

  toFront(idx: number) {
    const r = this.ring;
    if (r) {
      this.camT[0] = (r.f0 - idx) * r.step;
      if (this.reduced) {
        this.cam[0] = this.camT[0];
        this.camV[0] = 0;
      }
      this.kick();
    }
  }

  open(idx: number, immediate = false) {
    if (this.drag?.active) return;
    this.opened = idx;
    this.hovered = -1;
    this.keyed = -1;

    // Sheet dimensions
    const sheetDims =
      this.sw < 720
        ? {
            w: this.sw - 24,
            h: this.sh - 24,
            r: 24,
            m: [8, 8, this.sw - 16, Math.round(0.46 * (this.sh - 24)), 18],
          }
        : {
            w: Math.min(this.sw - 48, 660),
            h: Math.min(this.sh - 40, 420),
            r: 28,
            m: [20, 20, 196, 236, 16],
          };

    this.camT[5] = -360;
    const [vx, vy, vz] = vecMul(
      matMul(rotY(-this.camT[0]), rotX(-this.camT[1])),
      -this.camT[3],
      -this.camT[4],
      -(this.camT[5] - this.pz)
    );

    const sy = this.screw(this.camT[0]) + this.camT[2];
    const o = 20 * idx;
    this.release[idx] = -1;

    const tgt = this.tgt;
    tgt[o + 0] = vx;
    tgt[o + 1] = vy - sy;
    tgt[o + 2] = vz - this.pz;
    tgt[o + 3] = sheetDims.w;
    tgt[o + 4] = sheetDims.h;
    tgt[o + 8] = sheetDims.r;
    tgt[o + 5] = -this.camT[1];
    tgt[o + 6] = this.pos[o + 6] + normAngle(-this.camT[0] - this.pos[o + 6]);
    tgt[o + 7] = this.pos[o + 7] + normAngle(-this.pos[o + 7]);
    tgt[o + 9] = sheetDims.m[0];
    tgt[o + 10] = sheetDims.m[1];
    tgt[o + 11] = sheetDims.m[2];
    tgt[o + 12] = sheetDims.m[3];
    tgt[o + 13] = sheetDims.m[4];
    tgt[o + 14] = 1;
    this.cap[idx] = 3; // Sheet caption

    for (let i = 0; i < this.n; i++) {
      if (i !== idx) {
        this.tgt[20 * i + 14] = 0.12;
        if (this.release[i] >= 0) this.pend[20 * i + 14] = 1;
      }
    }

    if (!this.reduced && !immediate) {
      this.vel[o + 2] += 900;
    }
    if (this.reduced || immediate) {
      this.cam[5] = this.camT[5];
      this.pos.set(this.tgt.subarray(o, o + 15), o);
      this.vel.fill(0, o, o + 20);
    }

    this.o.stage.dataset.open = "true";
    this.o.cards.forEach((c, i) => (c.dataset.active = String(i === idx)));
    this.kick();
  }

  close() {
    const idx = this.opened;
    if (idx < 0) return;
    this.opened = -1;

    const o = 20 * idx;
    for (let k = 0; k <= 14; k++) {
      this.tgt[o + k] = this.home[o + k];
    }
    this.tgt[o + 6] =
      this.pos[o + 6] + normAngle(this.home[o + 6] - this.pos[o + 6]);
    this.tgt[o + 7] =
      this.pos[o + 7] + normAngle(this.home[o + 7] - this.pos[o + 7]);
    this.cap[idx] = this.homeCap[idx];

    for (let i = 0; i < this.n; i++) {
      if (i !== idx && this.release[i] < 0) {
        this.tgt[20 * i + 14] = this.home[20 * i + 14];
      }
    }

    this.camT[5] = 0;
    if (this.reduced) {
      this.cam[5] = 0;
      this.pos.set(this.tgt.subarray(o, o + 15), o);
      this.vel.fill(0, o, o + 20);
    }

    this.o.stage.dataset.open = "false";
    this.o.cards.forEach((c) => (c.dataset.active = "false"));
    this.kick();
  }

  phiBounds() {
    const r = this.ring;
    if (!r) return [0, 0];
    return [(r.f0 - (this.n - 1)) * r.step, r.f0 * r.step];
  }

  updateFront() {
    const r = this.ring;
    if (!r) {
      this.front = -1;
      return;
    }
    const curIdx = clamp(
      Math.round(r.f0 - this.cam[0] / r.step),
      0,
      this.n - 1
    );
    if (curIdx !== this.front) {
      this.front = curIdx;
      this.fronts[this.layout] = curIdx;
      this.o.onFront?.(curIdx);
    }
  }

  tick(dt: number) {
    const { n, pos, vel, tgt } = this;
    this.time += dt;

    let isBusy = Boolean(this.drag?.active);

    for (let i = 0; i < n; i++) {
      if (this.release[i] >= 0) {
        isBusy = true;
        if (this.release[i] <= this.time) {
          this.releaseItem(i, true);
        }
      }
    }

    const activeHover =
      this.drag?.active || this.opened >= 0
        ? -2
        : this.hovered >= 0
        ? this.hovered
        : this.keyed;

    for (let i = 0; i < n; i++) {
      const o = 20 * i;
      const tw = Math.max(1, tgt[o + 3]);
      const th = Math.max(1, tgt[o + 4]);
      const matchScale = clamp(
        1 -
          3.2 *
            (Math.abs(pos[o + 3] - tw) / tw +
              Math.abs(pos[o + 4] - th) / th +
              Math.hypot(pos[o + 0] - tgt[o + 0], pos[o + 1] - tgt[o + 1]) / 500),
        0,
        1
      );

      for (let k = 0; k < 4; k++) {
        tgt[o + 15 + k] = k === this.cap[i] ? matchScale : 0;
      }
      tgt[o + 19] = +(i === activeHover);
    }

    if (this.reduced) {
      pos.set(tgt);
      vel.fill(0);
      this.cam.set(this.camT);
      this.camV.fill(0);
    } else {
      const steps = Math.max(1, Math.ceil(120 * dt));
      const subDt = dt / steps;

      for (let s = 0; s < steps; s++) {
        for (let i = 0; i < 20 * n; i++) {
          const mod = i % 20;
          const spring = mod < 14 ? G_SPRING : mod < 19 ? Y_SPRING : S_SPRING;
          const acc = -spring.k * (pos[i] - tgt[i]) - spring.c * vel[i];
          vel[i] += acc * subDt;
          pos[i] += vel[i] * subDt;
        }

        for (let c = 0; c < 6; c++) {
          if (this.drag?.active && (c === 0 || c === 3 || c === 4)) continue;
          const spring = c === 0 ? Z_SPRING : L_SPRING;
          const acc =
            -spring.k * (this.cam[c] - this.camT[c]) - spring.c * this.camV[c];
          this.camV[c] += acc * subDt;
          this.cam[c] += this.camV[c] * subDt;
        }
      }
    }

    // Check convergence thresholds
    for (let i = 0; i < 20 * n; i++) {
      const th = THRESHOLDS[i % 20];
      if (Math.abs(pos[i] - tgt[i]) > th || Math.abs(vel[i]) > 10 * th) {
        isBusy = true;
      } else {
        pos[i] = tgt[i];
        vel[i] = 0;
      }
    }

    for (let c = 0; c < 6; c++) {
      const th = c === 0 || c === 1 ? 0.0002 : 0.05;
      if (Math.abs(this.cam[c] - this.camT[c]) > th || Math.abs(this.camV[c]) > 10 * th) {
        isBusy = true;
      } else if (!this.drag?.active || (c !== 0 && c !== 3 && c !== 4)) {
        this.cam[c] = this.camT[c];
        this.camV[c] = 0;
      }
    }

    this.updateFront();
    this.write();
    if (this.moveTag(dt)) isBusy = true;

    return isBusy;
  }

  write() {
    const { n, pos, cam } = this;
    const [liftZ, liftY] = this.lift;
    const sy = this.screw(cam[0]) + cam[2];

    this.o.world.style.transform = `translate3d(${round2(cam[3])}px,${round2(
      cam[4]
    )}px,${round2(cam[5] - this.pz)}px) rotateX(${round4(cam[1])}rad) rotateY(${round4(
      cam[0]
    )}rad) translate3d(0,${round2(sy)}px,${round2(this.pz)}px)`;

    const mat = matMul(rotX(cam[1]), rotY(cam[0]));

    for (let i = 0; i < n; i++) {
      const o = 20 * i;
      const card = this.o.cards[i];
      const media = this.media[i];
      const cache = this.cache[i];

      const w = pos[o + 3];
      const h = pos[o + 4];
      const lift = pos[o + 19];

      let xform = `translate3d(${round2(pos[o + 0] - w / 2)}px,${round2(
        pos[o + 1] - h / 2
      )}px,${round2(pos[o + 2])}px) rotateY(${round4(pos[o + 6])}rad) rotateX(${round4(
        pos[o + 5]
      )}rad) rotateZ(${round4(pos[o + 7])}rad)`;

      if (lift > 0.001) {
        xform += ` translate3d(0,${round2(-lift * liftY)}px,${round2(
          lift * liftZ
        )}px)`;
      }

      let cullAlpha = 1;
      if (this.ring?.cull && i !== this.opened) {
        cullAlpha = 1 - smoothstep(0.8, 1.15, Math.abs(this.angles[i] + cam[0]));
      }

      const [wx, wy, wz] = this.world(pos[o + 0], pos[o + 1], pos[o + 2]);
      const cp = Math.cos(pos[o + 5]);
      const [nx, ny, nz] = vecMul(
        mat,
        cp * Math.sin(pos[o + 6]),
        -Math.sin(pos[o + 5]),
        cp * Math.cos(pos[o + 6])
      );

      const isBack = -(nx * wx) - ny * wy + nz * (this.persp - wz) < 0;
      const finalAlpha = clamp(pos[o + 14] * cullAlpha * (isBack ? 0.72 : 1), 0, 1);

      const cardProps = [
        xform,
        `${round2(w)}px`,
        `${round2(h)}px`,
        `${round2(pos[o + 8])}px`,
        `translate(${round2(pos[o + 9])}px,${round2(pos[o + 10])}px)`,
        `${round2(pos[o + 11])}px`,
        `${round2(pos[o + 12])}px`,
        `${round2(pos[o + 13])}px`,
        String(round4(finalAlpha)),
        String(round4(lift)),
      ];

      const targets = [
        card.style, card.style, card.style, card.style,
        media ? media.style : null,
        media ? media.style : null,
        media ? media.style : null,
        media ? media.style : null,
        card.style,
      ];
      const styleKeys = [
        "transform", "width", "height", "borderRadius",
        "transform", "width", "height", "borderRadius",
        "opacity",
      ];

      for (let s = 0; s < styleKeys.length; s++) {
        const target = targets[s];
        if (target && cache[s] !== cardProps[s]) {
          cache[s] = cardProps[s];
          (target as any)[styleKeys[s]] = cardProps[s];
        }
      }

      if (cache[9] !== cardProps[9]) {
        cache[9] = cardProps[9];
        card.style.setProperty("--lift", cardProps[9]);
      }

      const pe = finalAlpha < 0.02 ? "none" : "";
      if (cache[10] !== pe) {
        cache[10] = pe;
        card.style.pointerEvents = pe;
      }

      if (this.back[i] !== +isBack) {
        this.back[i] = +isBack;
        card.dataset.back = String(isBack);
      }

      // Update caption opacities
      for (let c = 0; c < 4; c++) {
        const capEl = this.caps[i][c];
        if (capEl) {
          const capVal = String(round4(pos[o + 15 + c]));
          if (cache[11 + c] !== capVal) {
            cache[11 + c] = capVal;
            capEl.style.opacity = capVal;
          }
        }
      }
    }
  }

  moveTag(dt: number) {
    const tag = this.o.tag;
    if (!tag) return false;

    let targetIdx =
      this.hovered >= 0 ? this.hovered : this.keyed;
    if (targetIdx >= 0) {
      this.tagSeen = this.time;
    } else if (this.tagIdx >= 0 && this.time - this.tagSeen < 0.16) {
      targetIdx = this.tagIdx;
    }

    const canShow =
      this.tagOn &&
      targetIdx >= 0 &&
      this.opened < 0 &&
      !this.drag?.active &&
      !this.back[targetIdx] &&
      this.release[targetIdx] < 0;

    if (canShow !== this.tagShown) {
      this.tagShown = canShow;
      tag.dataset.show = String(canShow);
    }
    if (!canShow) {
      this.tagIdx = -1;
      return false;
    }

    const [sx, sy] = this.screenOf(targetIdx, true);
    const targetX = this.sw / 2 + sx;
    const targetY = this.sh / 2 + sy;

    if (this.tagIdx < 0 || this.reduced) {
      this.tagP = [targetX, targetY];
      this.tagV = [0, 0];
    }
    if (targetIdx !== this.tagIdx) {
      this.o.onTag?.(targetIdx);
    }
    this.tagIdx = targetIdx;

    const steps = Math.max(1, Math.ceil(120 * dt));
    const subDt = dt / steps;
    for (let s = 0; s < steps; s++) {
      for (let c = 0; c < 2; c++) {
        const target = c === 0 ? targetX : targetY;
        const acc =
          -G_SPRING.k * (this.tagP[c] - target) - G_SPRING.c * this.tagV[c];
        this.tagV[c] += acc * subDt;
        this.tagP[c] += this.tagV[c] * subDt;
      }
    }

    tag.style.transform = `translate3d(${round2(this.tagP[0])}px,${round2(
      this.tagP[1]
    )}px,0)`;

    return (
      Math.abs(this.tagP[0] - targetX) > 0.1 ||
      Math.abs(this.tagP[1] - targetY) > 0.1
    );
  }
}

// -------------------------------------------------------------
// Layout Math Generator
// -------------------------------------------------------------
function computeLayout(
  mode: string,
  aspects: number[],
  W: number,
  H: number,
  initialFront: number
) {
  const count = aspects.length;
  const poses = new Float32Array(20 * count);
  const caps = new Int8Array(count).fill(-1);

  const isSmall = W < 520;
  const pad = isSmall ? 14 : 24;
  const gap = isSmall ? 8 : 14;
  const availW = W - 2 * pad;
  const availH = H - 2 * pad;

  const result = {
    poses,
    caps,
    ring: null as any,
    panMinY: 0,
    lift: [0, 0],
    tag: true,
  };

  if (mode === "grid") {
    let best = { score: -1, cols: 4, w: 60, hasCap: false };
    for (let cols = 3; cols <= 10; cols++) {
      const rows = Math.ceil(count / cols);
      for (const hasCap of [true, false]) {
        const itemW = Math.floor(
          Math.min(
            (availW - (cols - 1) * gap) / cols,
            (availH - (rows - 1) * gap) / rows - (hasCap ? 40 : 0)
          )
        );
        if (hasCap && itemW < 112) continue;
        const score = itemW * (hasCap ? 1.15 : 1);
        if (score > best.score) {
          best = { score, cols, w: itemW, hasCap };
        }
      }
    }

    const { cols, w, hasCap } = best;
    const h = w + (hasCap ? 40 : 0);
    const rows = Math.ceil(count / cols);
    const radius = hasCap ? 16 : isSmall ? 10 : 12;
    const startX = -(cols * w + (cols - 1) * gap) / 2 + w / 2;
    const startY = -(rows * h + (rows - 1) * gap) / 2 + h / 2;

    for (let i = 0; i < count; i++) {
      const x = startX + (i % cols) * (w + gap);
      const y = startY + Math.floor(i / cols) * (h + gap);
      setPose(
        poses,
        i,
        x,
        y,
        w,
        h,
        radius,
        hasCap ? insetBox(w, h, 5, 40, radius) : [0, 0, w, h, radius]
      );
      caps[i] = hasCap ? 0 : -1;
    }
    result.tag = !hasCap;
  } else if (mode === "masonry") {
    const cols = W >= 1000 ? 8 : W >= 760 ? 6 : W >= 520 ? 5 : 4;
    const itemW = (availW - (cols - 1) * gap) / cols;
    const colHeights = new Array(cols).fill(0);

    const items = aspects.map((asp, i) => {
      const shortestCol = colHeights.indexOf(Math.min(...colHeights));
      const top = colHeights[shortestCol];
      const itemH = itemW * (asp || 1.3);
      colHeights[shortestCol] += itemH + gap;
      return { col: shortestCol, top, h: itemH };
    });

    const totalH = Math.max(...colHeights) - gap;
    const scale = Math.min(1, availH / totalH);
    const radius = isSmall ? 10 : 12;
    const startX = -(cols * itemW + (cols - 1) * gap) / 2 + itemW / 2;

    items.forEach((item, i) => {
      const scaledH = item.h * scale;
      setPose(
        poses,
        i,
        startX + item.col * (itemW + gap),
        -(totalH * scale) / 2 + item.top * scale + scaledH / 2,
        itemW,
        scaledH,
        radius,
        [0, 0, itemW, scaledH, radius]
      );
    });
  } else if (mode === "list") {
    const cols = clamp(Math.floor((availW + gap) / (290 + gap)), 1, 3);
    const rows = Math.ceil(count / cols);
    const itemW = (availW - (cols - 1) * gap) / cols;
    const listH = 56 * rows + (rows - 1) * 8;
    const fits = listH <= availH;
    const startY = fits ? -listH / 2 : -H / 2 + pad;

    for (let i = 0; i < count; i++) {
      const c = Math.floor(i / rows);
      const r = i % rows;
      setPose(
        poses,
        i,
        -availW / 2 + c * (itemW + gap) + itemW / 2,
        startY + 64 * r + 28,
        itemW,
        56,
        14,
        [6, 6, 44, 44, 9]
      );
      caps[i] = 1; // row caption
    }
    result.panMinY = fits ? 0 : -(listH - availH);
    result.tag = false;
    result.lift = [0, 0];
  } else if (mode === "stack") {
    const cardW = Math.round(clamp(0.19 * W, 96, 200));
    const cardH = Math.round(1.36 * cardW);
    const fanRadius = 2.3 * cardH;
    const fanAngle = Math.min(
      1.3,
      2 *
        Math.asin(
          Math.min(1, (isSmall ? availW - 1.6 * cardW : availW - cardW) / (2 * fanRadius))
        )
    );
    const offsetY =
      -(
        -fanRadius -
        cardH / 2 +
        (-fanRadius * Math.cos(fanAngle / 2) +
          (cardH / 2) * Math.cos(fanAngle / 2) +
          (cardW / 2) * Math.sin(fanAngle / 2))
      ) / 2;

    for (let i = 0; i < count; i++) {
      const ang = -fanAngle / 2 + (i * fanAngle) / (count - 1);
      setPose(
        poses,
        i,
        fanRadius * Math.sin(ang),
        offsetY - fanRadius * Math.cos(ang),
        cardW,
        cardH,
        14,
        [0, 0, cardW, cardH, 14],
        { rz: ang, z: 0.8 * i }
      );
    }
    result.lift = [36, Math.round(0.22 * cardH)];
  } else {
    // carousel or helix
    const isHelix = mode === "helix";
    const cardW = isHelix
      ? Math.round(clamp(0.15 * W, 66, 160))
      : Math.round(clamp(0.3 * W, 210, 320));
    const cardH = isHelix ? Math.round(1.3 * cardW) : cardW + 76;
    const step = isHelix
      ? (2 * Math.PI) / 10
      : (cardW + 1.6 * gap) / Math.max(1.1 * W, 720);
    const R = isHelix
      ? (cardW + gap) / (2 * Math.sin(step / 2))
      : Math.max(1.1 * W, 720);
    const spiralAscent = isHelix ? ((cardH + gap) * 1.5) / 10 : 0;
    const radius = isHelix ? (isSmall ? 9 : 12) : 22;

    for (let i = 0; i < count; i++) {
      const angle = (i - initialFront) * step;
      setPose(
        poses,
        i,
        R * Math.sin(angle),
        (i - (count - 1) / 2) * spiralAscent,
        cardW,
        cardH,
        radius,
        isHelix
          ? [0, 0, cardW, cardH, radius]
          : [8, 8, cardW - 16, cardW - 16, 15],
        { z: R * Math.cos(angle) - R, ry: angle }
      );
      caps[i] = isHelix ? -1 : 2; // detail caption
    }

    result.ring = {
      R,
      step,
      f0: initialFront,
      dy: spiralAscent,
      tilt: isHelix ? -0.24 : 0,
      cull: !isHelix,
    };
    result.tag = isHelix;
    result.lift = [isHelix ? 28 : 0, 0];
  }

  return result;
}

// -------------------------------------------------------------
// Rolling Digit Reel Component
// -------------------------------------------------------------
function RollingDigitReel({ text }: { text: string }) {
  const chars = [...text];
  return (
    <span className={styles.roll}>
      <span className={styles.srOnly}>{text}</span>
      <span className={styles.rollVisual} aria-hidden="true">
        {chars.map((ch, idx) => {
          const invIdx = chars.length - 1 - idx;
          if (ch < "0" || ch > "9") {
            return (
              <span key={`s${invIdx}`} className={styles.sym}>
                {ch}
              </span>
            );
          }
          return (
            <span key={`d${invIdx}`} className={styles.wheel}>
              <span
                className={styles.strip}
                style={{ "--d": ch, "--i": idx } as any}
              >
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
                  <span key={d}>{d}</span>
                ))}
              </span>
            </span>
          );
        })}
      </span>
    </span>
  );
}

// -------------------------------------------------------------
// Main LayoutMorphRadar Component
// -------------------------------------------------------------
interface LayoutMorphRadarProps {
  students: StudentLiveState[];
  onStartSession?: (session: LiveAssistanceSession) => void;
  onGradeStudent?: (studentId: string, grade: number, feedback: string) => void;
  className?: string;
}

const LAYOUT_TABS = [
  { id: "grid", label: "Izgara", Icon: LayoutGrid, hint: "Kartı incelemek için tıkla" },
  { id: "masonry", label: "Mozaik", Icon: LayoutDashboard, hint: "Her öğrenci kartı canlı oranını korur" },
  { id: "list", label: "Liste", Icon: List, hint: "Detaylı liste, kod durumu ve veriler" },
  { id: "stack", label: "Yelpaze", Icon: Layers, hint: "Kartı yukarı çekmek için üzerine gel" },
  { id: "carousel", label: "3D Silindir", Icon: GalleryHorizontalEnd, hint: "Sürükle veya kaydır, en yakın karta kilitlenir" },
  { id: "helix", label: "3D Sarmal", Icon: Dna, hint: "3D döndürmek için çek, bırak ve savur" },
] as const;

export function LayoutMorphRadar({
  students,
  onStartSession,
  onGradeStudent,
  className,
}: LayoutMorphRadarProps) {
  const [activeLayout, setActiveLayout] = React.useState<
    "grid" | "masonry" | "list" | "stack" | "carousel" | "helix"
  >("grid");
  const [openedIndex, setOpenedIndex] = React.useState<number>(-1);
  const [hoveredIndex, setHoveredIndex] = React.useState<number>(-1);
  const [frontIndex, setFrontIndex] = React.useState<number>(2);

  const stageRef = React.useRef<HTMLDivElement>(null);
  const worldRef = React.useRef<HTMLDivElement>(null);
  const tagRef = React.useRef<HTMLDivElement>(null);
  const cardsRef = React.useRef<(HTMLButtonElement | null)[]>([]);
  const engineRef = React.useRef<LayoutMorphEngine | null>(null);

  // Organic aspect ratios for masonry
  const aspects = React.useMemo(() => {
    return students.map((_, i) => 1.2 + ((i * 7) % 5) * 0.08);
  }, [students]);

  // Initialize engine
  React.useEffect(() => {
    if (!stageRef.current || !worldRef.current) return;
    const cards = cardsRef.current.filter(Boolean) as HTMLElement[];
    if (cards.length === 0) return;

    const engine = new LayoutMorphEngine({
      stage: stageRef.current,
      world: worldRef.current,
      tag: tagRef.current,
      cards,
      aspects,
      onFront: (idx) => setFrontIndex(idx),
      onTag: (idx) => setHoveredIndex(idx),
      onBackdrop: () => handleClose(),
    });

    engineRef.current = engine;
    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, [students, aspects]);

  const handleLayoutSwitch = (
    mode: "grid" | "masonry" | "list" | "stack" | "carousel" | "helix"
  ) => {
    if (mode === activeLayout) return;
    if (openedIndex >= 0) setOpenedIndex(-1);
    setActiveLayout(mode);
    engineRef.current?.setLayout(mode);
  };

  const handleCardClick = (idx: number) => {
    const engine = engineRef.current;
    if (!engine || engine.takeClick()) return;
    if (openedIndex >= 0) return;

    if (activeLayout === "carousel" && engine.frontIndex() !== idx) {
      engine.toFront(idx);
      return;
    }

    setOpenedIndex(idx);
    engine.open(idx);
  };

  const handleClose = () => {
    if (openedIndex < 0) return;
    engineRef.current?.close();
    setOpenedIndex(-1);
  };

  const openedStudent = openedIndex >= 0 ? students[openedIndex] : null;
  const activeStudent =
    openedIndex >= 0
      ? students[openedIndex]
      : hoveredIndex >= 0
      ? students[hoveredIndex]
      : frontIndex >= 0
      ? students[frontIndex]
      : students[0];

  const currentHint =
    LAYOUT_TABS.find((t) => t.id === activeLayout)?.hint || "";

  return (
    <section className={`${styles.root} ${className || ""}`}>
      {/* Top Controls Toolbar */}
      <div className={styles.toolbar}>
        {/* Layout Switcher Tabs */}
        <div role="radiogroup" aria-label="Görünüm Modları" className={styles.tabs}>
          {LAYOUT_TABS.map((tab) => {
            const isActive = tab.id === activeLayout;
            const Icon = tab.Icon;
            return (
              <button
                key={tab.id}
                type="button"
                role="radio"
                aria-checked={isActive}
                className={styles.tab}
                onClick={() => handleLayoutSwitch(tab.id)}
              >
                {isActive && <span className={styles.tabPill} />}
                <Icon className={styles.tabIcon} />
                <span className={styles.tabLabel}>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Live Interaction Hint */}
        <p className={styles.hint}>
          <span className={styles.swap} key={activeLayout}>
            {currentHint}
          </span>
        </p>
      </div>

      {/* 3D Stage Canvas */}
      <div
        ref={stageRef}
        className={styles.stage}
        style={{ height: 600, minHeight: 520 }}
        role="group"
        aria-roledescription="gallery"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Escape" && openedIndex >= 0) {
            e.preventDefault();
            handleClose();
          }
        }}
      >
        {/* World 3D Pivot Container */}
        <div ref={worldRef} className={styles.world}>
          {students.map((student, idx) => {
            const isHelp = student.status === "needs_help";
            const isSubmitted = student.status === "submitted";

            return (
              <button
                key={student.studentId}
                ref={(el) => {
                  cardsRef.current[idx] = el;
                }}
                type="button"
                className={styles.card}
                data-card="true"
                data-index={idx}
                tabIndex={openedIndex < 0 ? 0 : -1}
                onClick={() => handleCardClick(idx)}
                onPointerEnter={(e) => {
                  if (e.pointerType === "mouse") {
                    setHoveredIndex(idx);
                    engineRef.current?.hover(idx);
                  }
                }}
                onPointerLeave={() => {
                  setHoveredIndex(-1);
                  engineRef.current?.unhover(idx);
                }}
                onFocus={() => {
                  setHoveredIndex(idx);
                  engineRef.current?.focusItem(idx, true);
                }}
                onBlur={() => {
                  setHoveredIndex(-1);
                  engineRef.current?.blurItem(idx);
                }}
              >
                {/* Media Container (Avatar / Work Preview) */}
                <span className={styles.media} data-part="media">
                  <img
                    src={student.avatarUrl}
                    alt={student.studentName}
                    className={styles.img}
                    loading="lazy"
                  />
                  {/* Status Indicator Dot */}
                  <span
                    className={`absolute top-2 right-2 size-3 rounded-full border-2 border-surface shadow-mac-xs ${
                      isHelp
                        ? "bg-red-500 animate-pulse"
                        : isSubmitted
                        ? "bg-blue-500"
                        : "bg-emerald-500"
                    }`}
                  />
                </span>

                {/* Caption: Compact View (Grid, Masonry, Stack) */}
                <span className={`${styles.cap} ${styles.capCompact}`} data-part="cap">
                  <span className={styles.capTitle}>{student.studentName}</span>
                  <span className={styles.capMeta}>
                    %{student.visualMatch} Eşleşme • {student.linesCount} Satır
                  </span>
                </span>

                {/* Caption: Row View (List) */}
                <span className={`${styles.cap} ${styles.capRow}`} data-part="cap">
                  <span className={styles.rowText}>
                    <span className={styles.rowTitle}>{student.studentName}</span>
                    <span className={styles.capMeta}>
                      {isHelp ? (
                        <span className="text-red-500 font-semibold">🚨 Yardım İstiyor</span>
                      ) : isSubmitted ? (
                        <span className="text-blue-500 font-semibold">🏁 Teslim Etti</span>
                      ) : (
                        <span>⚡ Kod Yazıyor</span>
                      )}{" "}
                      • {student.linesCount} Satır
                    </span>
                  </span>
                  <span className={`${styles.rowValue} font-mono font-bold text-label`}>
                    %{student.visualMatch} Eşleşme
                  </span>
                </span>

                {/* Caption: Detail View (Carousel, Helix) */}
                <span className={`${styles.cap} ${styles.capDetail}`} data-part="cap">
                  <div className={styles.detailTop}>
                    <span className={styles.detailTitle}>{student.studentName}</span>
                    <span className={styles.detailValue}>%{student.visualMatch}</span>
                  </div>
                  <span className={styles.capMeta}>
                    {student.linesCount} Satır CSS • {student.status}
                  </span>
                </span>

                {/* Caption: Detail Sheet (Expanded when Clicked) */}
                <span className={`${styles.cap} ${styles.sheet}`} data-part="cap">
                  <div className={styles.sheetTitle}>
                    <span>{student.studentName}</span>
                    <span
                      className={`pill text-[11px] font-mono ${
                        isHelp
                          ? "bg-red-500/10 text-red-500 border border-red-500/20"
                          : isSubmitted
                          ? "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                          : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                      }`}
                    >
                      {isHelp
                        ? "🚨 Yardım Talebi"
                        : isSubmitted
                        ? "Teslim Edildi"
                        : "Canlı Kod Yazıyor"}
                    </span>
                  </div>

                  <span className={styles.sheetBy}>
                    CSS-302 İleri Arayüz Laboratuvarı • Masa #{idx + 1}
                  </span>

                  {isHelp && student.helpTopic ? (
                    <div className="rounded-[12px] bg-red-500/10 border border-red-500/25 p-3 text-red-600 dark:text-red-400 text-[12px]">
                      <strong>Yardım Konusu:</strong> {student.helpTopic}
                    </div>
                  ) : (
                    <p className={styles.sheetDesc}>
                      Öğrenci aktif olarak CSS kurallarını düzenliyor. Canlı DOM ve
                      satır güncellemeleri 300ms aralıklarla izlenmektedir.
                    </p>
                  )}

                  {/* Facts Grid */}
                  <div className={styles.facts}>
                    <div className={styles.fact}>
                      <span className={styles.factKey}>Görsel Eşleşme</span>
                      <span className={styles.factValue}>%{student.visualMatch}</span>
                    </div>
                    <div className={styles.fact}>
                      <span className={styles.factKey}>Kod Hijyeni</span>
                      <span className={styles.factValue}>
                        %{student.cleanScore || 98}
                      </span>
                    </div>
                    <div className={styles.fact}>
                      <span className={styles.factKey}>Satır Sayısı</span>
                      <span className={styles.factValue}>
                        {student.linesCount} Satır
                      </span>
                    </div>
                    <div className={styles.fact}>
                      <span className={styles.factKey}>Durum</span>
                      <span className={`${styles.factValue} capitalize`}>
                        {student.status}
                      </span>
                    </div>
                  </div>
                </span>
              </button>
            );
          })}
        </div>

        {/* Floating Tooltip Pill following Card in 3D */}
        <div ref={tagRef} className={styles.tag} aria-hidden="true">
          {activeStudent && (
            <>
              <span className={styles.tagName}>{activeStudent.studentName}</span>
              <span className={styles.tagMeta}>
                %{activeStudent.visualMatch} Eşleşme • {activeStudent.linesCount} Satır
              </span>
            </>
          )}
        </div>

        {/* Morph Open Overlay Actions */}
        <div
          className={styles.overlay}
          data-show={openedIndex >= 0}
          role="dialog"
          aria-hidden={openedIndex < 0}
        >
          {openedStudent && (
            <>
              <button
                type="button"
                className={styles.close}
                aria-label="Kapat"
                onClick={handleClose}
              >
                <X />
              </button>

              <button
                type="button"
                className={styles.action}
                onClick={() => {
                  if (onStartSession) {
                    onStartSession({
                      studentId: openedStudent.studentId,
                      studentName: openedStudent.studentName,
                      studentNo: openedStudent.studentNo,
                      avatarUrl: openedStudent.avatarUrl,
                      mode: "observe",
                      helpTopic: openedStudent.helpTopic,
                    });
                  } else if (onGradeStudent) {
                    onGradeStudent(
                      openedStudent.studentId,
                      Math.round(openedStudent.visualMatch),
                      ""
                    );
                  }
                  handleClose();
                }}
              >
                <Radio className="size-4 animate-pulse" />
                <span>Canlı Müdahale Et</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Bottom Telemetry Panel with Rolling Number Tickers */}
      <div className={styles.panel}>
        <div className={styles.panelWho}>
          <span className={styles.swap} key={activeStudent?.studentId || "summary"}>
            <span className={styles.panelName}>
              {activeStudent ? activeStudent.studentName : "Sınıf Özeti"}
            </span>
            <span className={styles.panelMeta}>
              {activeStudent
                ? activeStudent.status === "needs_help"
                  ? "🚨 Yardım Talebi Aktif"
                  : activeStudent.status === "submitted"
                  ? "🏁 Görev Teslim Edildi"
                  : "⚡ Canlı Kod Yazıyor"
                : "Öğrenci detayları için kartın üzerine gel veya tıkla"}
            </span>
          </span>
        </div>

        <div className={styles.stat}>
          <span className={styles.statLabel}>Görsel Eşleşme</span>
          <span className={styles.statValue}>
            {activeStudent ? (
              <RollingDigitReel
                text={`%${activeStudent.visualMatch.toFixed(1)}`}
              />
            ) : (
              <RollingDigitReel text="%94.8" />
            )}
          </span>
        </div>

        <div className={styles.stat}>
          <span className={styles.statLabel}>Kod Satırı</span>
          <span className={styles.statValue}>
            {activeStudent ? (
              <RollingDigitReel text={String(activeStudent.linesCount || 42)} />
            ) : (
              <RollingDigitReel text="48" />
            )}
          </span>
        </div>

        <div className={styles.stat}>
          <span className={styles.statLabel}>Canlı Öğrenci</span>
          <span className={styles.statValue}>
            <RollingDigitReel text={`${students.length}`} />
          </span>
        </div>
      </div>
    </section>
  );
}
