"use client";
// Cookie consent banner at the top of the page, mounted through <Layout banner={...}> so it sits
// outside the theme's prose <article>, right above the header. The cookie on its right is for the
// header gopher (src/components/gopher-mark.tsx): accept → the banner goes away and the cookie rolls
// into its mouth; reject → it rolls off to the right. Styles: src/styles/cookie-gopher.css.
import { CookieSvg } from "@/components/cookie-svg";
import {
	type Choice,
	OPEN_EVENT,
	clearGaCookies,
	loadGA,
	readConsent,
	writeConsent,
} from "@/lib/consent";
import { LOOK_ATTR, SLOT_ATTR, setMood } from "@/lib/gopher";
// The theme renders the banner outside <ViewTransitions>, so use next/link here:
// the view-transitions Link would hang until the browser times out.
import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

const COLLAPSE_MS = 300; // banner fades and folds away
const HOP_MS = 480; // cookie hops from the banner onto the header row
const AWAY_MS = 700; // reject: cookie rolls off the right edge
type Phase = "unknown" | "idle" | "leaving" | "done";
type Flight = { kind: "eat" | "away"; x: number; y: number; size: number };

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export function CookieBanner() {
	const [phase, setPhase] = useState<Phase>("unknown");
	const [message, setMessage] = useState("");
	const [flight, setFlight] = useState<Flight | null>(null);
	const prior = useRef<Choice | null>(null); // choice in force when the banner was shown
	const returnFocus = useRef<HTMLElement | null>(null); // where focus was before it entered the banner
	const focusWasInside = useRef(false);
	const focusOnShow = useRef(false);
	const firstBtn = useRef<HTMLButtonElement>(null);
	const section = useRef<HTMLElement>(null);
	const cookie = useRef<HTMLSpanElement>(null);
	const fly = useRef<HTMLDivElement>(null);

	// Static export: decide only after mount (no hydration mismatch).
	useEffect(() => {
		const c = readConsent();
		prior.current = c;
		if (c === "granted") loadGA(); // returning reader who already accepted
		else clearGaCookies(); // leftovers from a withdrawal or an expired choice
		setPhase(c ? "done" : "idle");
		setMood(c === "granted" ? "watching" : c ? "still" : "waiting");
		const reopen = () => {
			prior.current = readConsent();
			returnFocus.current = document.activeElement as HTMLElement | null; // the footer button
			focusOnShow.current = true; // user asked for it → moving focus is not "stealing" it
			setFlight(null);
			setMessage("");
			setPhase("idle");
			setMood("waiting");
		};
		window.addEventListener(OPEN_EVENT, reopen);
		return () => window.removeEventListener(OPEN_EVENT, reopen);
	}, []);

	// Reopened from the footer: go up to the banner (and the gopher) and focus the first button.
	useEffect(() => {
		if (phase === "idle" && focusOnShow.current) {
			focusOnShow.current = false;
			firstBtn.current?.focus({ preventScroll: true });
			const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
			window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
		}
	}, [phase]);

	const closeBanner = () => {
		setPhase("done");
		if (!focusWasInside.current) return;
		const back = returnFocus.current;
		returnFocus.current = null;
		if (back?.isConnected) back.focus({ preventScroll: true });
		else (document.activeElement as HTMLElement | null)?.blur(); // → <body>
	};

	function choose(choice: Choice) {
		if (phase !== "idle") return;
		const was = prior.current;
		writeConsent(choice); // side effects now; GA never waits for the animation (may reload on revoke)
		setMessage(choice === "granted" ? "Analytics cookies accepted." : "Analytics cookies rejected.");
		focusWasInside.current = section.current?.contains(document.activeElement) ?? false;
		const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
		// First answer only: re-accepting is not rewarded again, denied→denied just closes
		const animate = choice === "granted" ? was !== "granted" : was === null;
		const from = cookie.current?.getBoundingClientRect();
		if (reduced || !animate || !from) {
			setMood(choice === "granted" ? "watching" : "still");
			return closeBanner();
		}
		setFlight({ kind: choice === "granted" ? "eat" : "away", x: from.left, y: from.top, size: from.width });
		setPhase("leaving");
		if (choice === "denied") setMood("doh"); // the gopher watches it roll away
	}

	// The cookie's trip. Layout effect: the flying copy replaces the banner one before paint.
	useLayoutEffect(() => {
		if (!flight) return;
		const sec = section.current;
		const el = fly.current;
		if (!sec || !el) return;
		let alive = true;
		const anims: Animation[] = [];
		const run = (a: Animation) => {
			anims.push(a);
			return a.finished;
		};
		const { kind, x, y, size } = flight;

		(async () => {
			const collapse = run(
				sec.animate(
					[
						{ opacity: 1, height: `${sec.offsetHeight}px`, paddingTop: getComputedStyle(sec).paddingTop },
						{ opacity: 0, height: "0px", paddingTop: "0px" },
					],
					{ duration: COLLAPSE_MS, easing: "cubic-bezier(.4,0,.2,1)", fill: "forwards" },
				),
			);

			if (kind === "away") {
				const dist = window.innerWidth - x + 8;
				const turns = Math.max(1, Math.round(dist / (Math.PI * size)));
				const roll = run(
					el.animate(
						[
							{ transform: "translate(0px, 0px) rotate(0deg)", opacity: 1 },
							{ opacity: 1, offset: 0.8 },
							{ transform: `translate(${dist}px, 0px) rotate(${turns * 360}deg)`, opacity: 0 },
						],
						{ duration: AWAY_MS, easing: "cubic-bezier(.45,0,.8,.5)", fill: "forwards" },
					),
				);
				await collapse;
				if (!alive) return;
				closeBanner();
				await roll;
				if (alive) setFlight(null);
				return;
			}

			await collapse;
			if (!alive) return;
			closeBanner();
			// Measured after the banner is gone: the header has moved up into its place.
			const t = document.querySelector(`[${SLOT_ATTR}]`)?.getBoundingClientRect();
			if (!t || t.width === 0 || t.bottom < 0 || t.top > window.innerHeight) {
				// Gopher out of sight: no trip, the cookie just fades.
				await run(el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, fill: "forwards" }));
				if (alive) {
					setFlight(null);
					setMood("watching"); // accepted anyway
				}
				return;
			}
			const k = t.width / size; // shrink to the gopher's scale
			const dx = t.left + t.width / 2 - (x + size / 2);
			const dy = t.top + t.height / 2 - (y + size / 2);
			const peak = Math.min(0, dy) - 28;
			const sq = size * k * 0.08; // keeps the bottom on the ground while squashed
			await run(
				el.animate(
					[
						{ transform: "translate(0px, 0px) rotate(0deg) scale(1)", easing: "ease-out" },
						{ transform: `translate(0px, ${peak}px) rotate(0deg) scale(${(1 + k) / 2})`, offset: 0.45, easing: "ease-in" },
						{ transform: `translate(0px, ${dy}px) rotate(0deg) scale(${k})`, offset: 0.82 },
						{ transform: `translate(0px, ${dy + sq}px) rotate(0deg) scale(${k * 1.12}, ${k * 0.84})`, offset: 0.9 },
						{ transform: `translate(0px, ${dy}px) rotate(0deg) scale(${k})` },
					],
					{ duration: HOP_MS, fill: "forwards" },
				),
			);
			if (!alive) return;
			// Whole turns, so the cookie lands in the same orientation as the one in the gopher's mouth.
			const turns = Math.max(1, Math.round(Math.abs(dx) / (Math.PI * size * k)));
			await run(
				el.animate(
					[
						{ transform: `translate(0px, ${dy}px) rotate(0deg) scale(${k})` },
						{ transform: `translate(${dx}px, ${dy}px) rotate(${-turns * 360}deg) scale(${k})` },
					],
					{ duration: clamp(Math.abs(dx) * 1.3, 450, 1100), easing: "cubic-bezier(.25,.1,.35,1)", fill: "forwards" },
				),
			);
			if (!alive) return;
			setMood("eating"); // the gopher's own cookie takes over, under its teeth
			setFlight(null);
		})().catch(() => {
			// animation cancelled (unmount or reopen)
		});

		return () => {
			alive = false;
			for (const a of anims) a.cancel();
		};
		// closeBanner only touches refs and setters
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [flight]);

	const visible = phase === "idle" || phase === "leaving";
	const busy = phase !== "idle";
	return (
		<>
			{/* Always mounted so the announcement survives the banner unmounting */}
			<div className="sr-only" role="status" aria-live="polite">
				{message}
			</div>

			{visible && (
				<section
					ref={section}
					className="cg-banner not-prose"
					data-phase={phase}
					aria-label="Cookie consent"
					data-pagefind-ignore="all"
					onFocus={(e) => {
						const from = e.relatedTarget as HTMLElement | null;
						if (from && !section.current?.contains(from) && !returnFocus.current) returnFocus.current = from;
					}}
				>
					<div className="cg-card">
						<strong className="cg-title">Cookies?</strong>
						<p className="cg-text">
							With your permission, this blog uses third-party cookies from Google Analytics to count visits and see
							which posts get read. Google may also use this data for its own purposes, and it may be transferred to the
							US. No analytics cookies are set unless you accept. You can change your mind anytime via &ldquo;Cookie
							settings&rdquo; in the footer. <Link href="/privacy/">Cookie policy</Link>
						</p>
						<div className="cg-actions">
							{/* identical style; Reject first in DOM; aria-disabled (not disabled) keeps focus in place mid-animation */}
							<button ref={firstBtn} type="button" className="cg-btn" aria-disabled={busy} onClick={() => choose("denied")}>
								Reject
							</button>
							<button type="button" className="cg-btn" aria-disabled={busy} onClick={() => choose("granted")}>
								Accept
							</button>
						</div>
						<span className="cg-plate" ref={cookie} aria-hidden="true" {...{ [LOOK_ATTR]: "banner" }}>
							<CookieSvg />
						</span>
					</div>
				</section>
			)}

			{flight && (
				<div
					ref={fly}
					className="cg-fly"
					aria-hidden="true"
					{...{ [LOOK_ATTR]: "fly" }}
					style={{ left: flight.x, top: flight.y, width: flight.size, height: flight.size }}
				>
					<CookieSvg />
				</div>
			)}
		</>
	);
}
