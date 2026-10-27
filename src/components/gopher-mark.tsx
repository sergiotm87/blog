"use client";
// The header gopher. Reacts to the cookie banner (see src/lib/gopher.ts):
// waiting → the eyes follow the pointer or the cookie and it licks its lips,
// eating → chews the cookie that rolled into its mouth, doh → watches it roll away,
// watching → accepted: the eyes keep following the pointer.
// Eyes: the PNG pupils are covered with white and redrawn as SVG that can move
// (technique from https://buipalsulich.com/post/gopher-eyes/). Styles: src/styles/cookie-gopher.css.
import { CookieSvg } from "@/components/cookie-svg";
import { LOOK_ATTR, type Mood, SLOT_ATTR, setMood, useMood } from "@/lib/gopher";
import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

const HEAD = "/blog/logos/gopher-head.png";
const W = 201; // native size of gopher-head.png: 201 × 127
// Native coordinates: eye-white centre and original pupil centre
const EYES = [
	{ eye: [42.5, 68], pupil: [64, 69.5] },
	{ eye: [159, 67], pupil: [183.5, 67] },
] as const;
const TRAVEL = 26; // eye white radius (37.5) − pupil radius (9) − margin
const FULL_AT = 160; // CSS px from the eye where the pupil reaches the edge
const POINTER_MS = 4000; // the mouse wins over the cookie for this long after it moves
const TOUCH_MS = 1500;

export const EAT_MS = 2100; // = bubble end (780 + 1300) + margin
export const DOH_MS = 1700; // = bubble end (350 + 1300) + margin
const BITES_AT = [240, 420, 600]; // = --t-chomp + --chomp × n (jaw closes)

type Point = { x: number; y: number };

function centre(el: Element | null): Point | null {
	if (!el) return null;
	const r = el.getBoundingClientRect();
	return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

export function GopherMark() {
	const mood = useMood();
	const [bites, setBites] = useState(0);
	const box = useRef<HTMLSpanElement>(null);
	const pupils = useRef<(SVGGElement | null)[]>([]);

	// Eating and d'oh timelines; the gopher goes back to still on its own.
	useEffect(() => {
		if (mood === "eating") {
			setBites(0);
			const ts = BITES_AT.map((t, i) => window.setTimeout(() => setBites(i + 1), t));
			ts.push(window.setTimeout(() => setMood("watching"), EAT_MS));
			return () => ts.forEach(clearTimeout);
		}
		if (mood === "doh") {
			const t = window.setTimeout(() => setMood("still"), DOH_MS);
			return () => clearTimeout(t);
		}
	}, [mood]);

	// Eyes
	useEffect(() => {
		const aim = (target: Point | null) => {
			const r = box.current?.getBoundingClientRect();
			EYES.forEach(({ eye, pupil }, i) => {
				const g = pupils.current[i];
				if (!g) return;
				if (!target || !r) {
					g.style.transform = "";
					return;
				}
				const s = r.width / W;
				const vx = target.x - (r.left + eye[0] * s);
				const vy = target.y - (r.top + eye[1] * s);
				const d = Math.hypot(vx, vy) || 1;
				const m = Math.min(1, d / FULL_AT) * TRAVEL;
				const dx = eye[0] + (vx / d) * m - pupil[0];
				const dy = eye[1] + (vy / d) * m - pupil[1];
				g.style.transform = `translate(${dx.toFixed(2)}px, ${dy.toFixed(2)}px)`;
			});
		};
		if (mood === "still") return aim(null);
		const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

		// Accepted: the eyes keep following the pointer, driven by events (no rAF loop on every page).
		// The mouse is followed to its last position; a touch is looked at briefly; leaving the window → rest.
		if (mood === "watching") {
			if (reduced) return aim(null);
			let last: Point | null = null;
			let frame = 0;
			let reset = 0;
			const draw = () => {
				if (!frame) frame = requestAnimationFrame(() => {
					frame = 0;
					aim(last);
				});
			};
			const onPointer = (e: PointerEvent) => {
				last = { x: e.clientX, y: e.clientY };
				draw();
				clearTimeout(reset);
				if (e.pointerType === "touch")
					reset = window.setTimeout(() => {
						last = null;
						draw();
					}, TOUCH_MS);
			};
			const onLeave = (e: PointerEvent) => {
				if (e.pointerType === "touch") return; // lifting the finger is not leaving
				last = null;
				draw();
			};
			const onScroll = () => last && draw(); // the gopher moved under a still pointer
			const root = document.documentElement;
			window.addEventListener("pointermove", onPointer, { passive: true });
			window.addEventListener("pointerdown", onPointer, { passive: true });
			root.addEventListener("pointerleave", onLeave);
			window.addEventListener("scroll", onScroll, { passive: true });
			return () => {
				cancelAnimationFrame(frame);
				clearTimeout(reset);
				window.removeEventListener("pointermove", onPointer);
				window.removeEventListener("pointerdown", onPointer);
				root.removeEventListener("pointerleave", onLeave);
				window.removeEventListener("scroll", onScroll);
			};
		}

		let pointer: (Point & { t: number; touch: boolean }) | null = null;
		const target = (): Point | null => {
			const fly = centre(document.querySelector(`[${LOOK_ATTR}="fly"]`));
			if (fly) return fly;
			if (mood === "eating") return centre(document.querySelector(`[${SLOT_ATTR}]`));
			if (pointer && performance.now() - pointer.t < (pointer.touch ? TOUCH_MS : POINTER_MS)) return pointer;
			return centre(document.querySelector(`[${LOOK_ATTR}="banner"]`));
		};

		// Reduced motion: one static glance at the cookie, no tracking.
		if (reduced) return aim(target());

		const onPointer = (e: PointerEvent) => {
			pointer = { x: e.clientX, y: e.clientY, t: performance.now(), touch: e.pointerType === "touch" };
		};
		window.addEventListener("pointermove", onPointer, { passive: true });
		window.addEventListener("pointerdown", onPointer, { passive: true });
		let raf = 0;
		const tick = () => {
			aim(target());
			raf = requestAnimationFrame(tick);
		};
		raf = requestAnimationFrame(tick);
		return () => {
			cancelAnimationFrame(raf);
			window.removeEventListener("pointermove", onPointer);
			window.removeEventListener("pointerdown", onPointer);
		};
	}, [mood]);

	const slotProps = mood === "eating" ? { [LOOK_ATTR]: "slot" } : {};
	return (
		<span ref={box} className="gm not-prose" data-mood={mood} aria-hidden="true">
			<span className="gm-head">
				<img className="gm-layer" src={HEAD} alt="" width={201} height={127} draggable={false} />
				<span className="gm-layer gm-mouth" />
				<svg className="gm-layer gm-eyes" viewBox="0 0 201 127" focusable="false">
					{EYES.map(({ pupil: [x, y] }, i) => (
						<g key={x}>
							<circle cx={x} cy={y} r={10.6} fill="#fff" />
							<g
								className="gm-pupil"
								ref={(el) => {
									pupils.current[i] = el;
								}}
							>
								<circle cx={x} cy={y} r={9} fill="#1d1d1b" />
								<circle cx={x - 2.5} cy={y - 4} r={2.2} fill="#fff" />
							</g>
						</g>
					))}
				</svg>
				<span className="gm-tongue" />
				<span className="gm-cookie" {...{ [SLOT_ATTR]: "" }} {...slotProps}>
					<CookieSvg bites={mood === "eating" ? bites : 0} />
				</span>
				<img className="gm-layer gm-jaw" src={HEAD} alt="" width={201} height={127} draggable={false} />
				<img className="gm-layer gm-muzzle" src={HEAD} alt="" width={201} height={127} draggable={false} />
			</span>
			<span className="gm-crumbs">
				{CRUMBS.map((c, i) => (
					<i key={i} style={{ "--b": c[0], "--dx": `${c[1]}px`, "--up": `${c[2]}px` } as CSSProperties} />
				))}
			</span>
			<span className="gm-bubble">{BUBBLE[mood]}</span>
		</span>
	);
}

const BUBBLE: Record<Mood, string> = { still: "", waiting: "", eating: "Yum!", doh: "D'oh!", watching: "" };

// [bite, dx, up] — 3 crumbs per bite (CSS px, the logo is small)
const CRUMBS: [number, number, number][] = [
	[1, -8, -6], [1, 6, -4], [1, -2, -8],
	[2, 7, -7], [2, -6, -4], [2, 2, -9],
	[3, -9, -5], [3, 8, -7], [3, -1, -5],
];
