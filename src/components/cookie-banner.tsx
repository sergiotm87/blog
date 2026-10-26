"use client";
// Cookie consent banner, mounted through <Layout banner={...}> so it sits outside
// the theme's prose <article>. Styles live in src/styles/cookie-gopher.css.
import {
	type Choice,
	OPEN_EVENT,
	clearGaCookies,
	loadGA,
	readConsent,
	writeConsent,
} from "@/lib/consent";
// The theme renders the banner outside <ViewTransitions>, so use next/link here:
// the view-transitions Link would hang until the browser times out.
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import type { CSSProperties } from "react";

const BASE_PATH = "/blog";
const HEAD = `${BASE_PATH}/logos/gopher-head.png`; // same asset as the header logo → already cached
const ACCEPT_MS = 1500; // = --t-exit (1250) + 250 ms exit, ≤ 1.5 s
const DECLINE_MS = 500; // neutral: cookie put away 0–260, card exits 250–500
const BITES_AT = [420, 600, 780]; // = --t-chomp + --chomp × n (jaw closes)
type Phase = "unknown" | "idle" | "eating" | "declining" | "done";

export function CookieBanner() {
	const [phase, setPhase] = useState<Phase>("unknown");
	const [message, setMessage] = useState("");
	const [bites, setBites] = useState(0);
	const timers = useRef<number[]>([]);
	const prior = useRef<Choice | null>(null); // choice in force when the banner was shown
	const returnFocus = useRef<HTMLElement | null>(null); // where focus was before it entered the banner
	const firstBtn = useRef<HTMLButtonElement>(null);
	const card = useRef<HTMLDivElement>(null);
	const focusOnShow = useRef(false);
	const maskId = useId(); // React 19.2: "_R_…_" → safe inside url(#…)

	const clearTimers = () => {
		timers.current.forEach(clearTimeout);
		timers.current = [];
	};

	// Static export: decide only after mount (no hydration mismatch).
	useEffect(() => {
		const c = readConsent();
		prior.current = c;
		if (c === "granted") loadGA(); // returning reader who already accepted
		else clearGaCookies(); // leftovers from a withdrawal or an expired choice
		setPhase(c ? "done" : "idle");
		const reopen = () => {
			clearTimers();
			prior.current = readConsent();
			returnFocus.current = document.activeElement as HTMLElement | null; // the footer button
			focusOnShow.current = true; // user asked for it → moving focus is not "stealing" it
			setMessage("");
			setBites(0);
			setPhase("idle");
		};
		window.addEventListener(OPEN_EVENT, reopen);
		return () => {
			window.removeEventListener(OPEN_EVENT, reopen);
			clearTimers();
		};
	}, []);

	const visible = phase === "idle" || phase === "eating" || phase === "declining";

	// Reopen from the footer: focus the first button once it exists.
	useEffect(() => {
		if (phase === "idle" && focusOnShow.current) {
			focusOnShow.current = false;
			firstBtn.current?.focus();
		}
	}, [phase]);

	// WCAG 2.4.11 / technique C43: while the fixed banner is up, reserve its height so it never covers
	// the focused element or the end of the page.
	useEffect(() => {
		if (!visible || !card.current) return;
		const root = document.documentElement;
		const ro = new ResizeObserver(([e]) => root.style.setProperty("--cg-h", `${Math.ceil(e.borderBoxSize[0].blockSize) + 16}px`));
		ro.observe(card.current);
		root.classList.add("cg-open");
		return () => {
			ro.disconnect();
			root.classList.remove("cg-open");
			root.style.removeProperty("--cg-h");
		};
	}, [visible]);

	function choose(choice: Choice) {
		if (phase !== "idle") return;
		const was = prior.current;
		writeConsent(choice); // side effects now; GA never waits for the animation (may reload on revoke)
		setMessage(choice === "granted" ? "Analytics cookies accepted." : "Analytics cookies rejected.");
		const focusWasInside = card.current?.contains(document.activeElement) ?? false;
		const finish = () => {
			setPhase("done");
			if (!focusWasInside) return;
			const back = returnFocus.current;
			returnFocus.current = null;
			if (back?.isConnected) back.focus({ preventScroll: true });
			else (document.activeElement as HTMLElement | null)?.blur(); // → <body>
		};
		const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
		const animateAccept = choice === "granted" && was !== "granted"; // re-accepting is not rewarded again
		const animateDecline = choice === "denied" && was === null; // first answer only; denied→denied just closes
		if (reduced || (!animateAccept && !animateDecline)) return finish();
		setPhase(animateAccept ? "eating" : "declining");
		timers.current.push(window.setTimeout(finish, animateAccept ? ACCEPT_MS : DECLINE_MS));
		// Bites via data-bites instead of CSS animations inside <mask> (precaution, not a verified WebKit bug)
		if (animateAccept) BITES_AT.forEach((t, i) => timers.current.push(window.setTimeout(() => setBites(i + 1), t)));
	}

	const busy = phase !== "idle";
	return (
		<>
			{/* Always mounted so the announcement survives the banner unmounting */}
			<div className="sr-only" role="status" aria-live="polite">
				{message}
			</div>

			{visible && (
				<section className="cg-banner not-prose" data-phase={phase} aria-label="Cookie consent" data-pagefind-ignore="all">
					<div
						className="cg-card"
						ref={card}
						onFocus={(e) => {
							const from = e.relatedTarget as HTMLElement | null;
							if (from && !card.current?.contains(from) && !returnFocus.current) returnFocus.current = from;
						}}
					>
						<div className="cg-figure" aria-hidden="true">
							<div className="cg-stage">
								<img className="cg-layer cg-base" src={HEAD} alt="" width={201} height={127} draggable={false} />
								<div className="cg-layer cg-mouth" />
								<div className="cg-cookie" data-bites={bites}>
									<CookieSvg maskId={maskId} />
								</div>
								<img className="cg-layer cg-jaw" src={HEAD} alt="" width={201} height={127} draggable={false} />
								<img className="cg-layer cg-muzzle" src={HEAD} alt="" width={201} height={127} draggable={false} />
								<div className="cg-crumbs">
									{CRUMBS.map((c, i) => (
										<i key={i} style={{ "--b": c[0], "--dx": `${c[1]}px`, "--up": `${c[2]}px` } as CSSProperties} />
									))}
								</div>
							</div>
							<span className="cg-yum">Yum!</span>
						</div>

						<div className="cg-copy">
							<strong>Cookies?</strong>
							<p>
								With your permission, this blog uses third-party cookies from Google Analytics to count visits and see
								which posts get read. Google may also use this data for its own purposes, and it may be transferred to the
								US. No analytics cookies are set unless you accept. You can change your mind anytime via &ldquo;Cookie
								settings&rdquo; in the footer. <Link href="/privacy/">Cookie policy</Link>
							</p>
						</div>

						<div className="cg-actions">
							{/* identical style; Reject first in DOM; aria-disabled (not disabled) keeps focus in place mid-animation */}
							<button ref={firstBtn} type="button" className="cg-btn" aria-disabled={busy} onClick={() => choose("denied")}>
								Reject
							</button>
							<button type="button" className="cg-btn" aria-disabled={busy} onClick={() => choose("granted")}>
								Accept
							</button>
						</div>
					</div>
				</section>
			)}
		</>
	);
}

// [bite, dx, up] — 3 crumbs per bite
const CRUMBS: [number, number, number][] = [
	[1, -14, -10], [1, 9, -7], [1, -4, -13],
	[2, 12, -11], [2, -10, -6], [2, 3, -14],
	[3, -16, -9], [3, 14, -12], [3, -2, -8],
];

function CookieSvg({ maskId }: { maskId: string }) {
	return (
		<svg viewBox="0 0 48 48" focusable="false">
			<defs>
				<mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="48" height="48">
					<rect width="48" height="48" fill="#fff" />
					{/* each bite = two buck-tooth scallops on the side facing the gopher */}
					<g className="cg-bite cg-bite-1" fill="#000"><circle cx="3" cy="17" r="5.6" /><circle cx="2.5" cy="25" r="5.6" /></g>
					<g className="cg-bite cg-bite-2" fill="#000"><circle cx="9" cy="8" r="5.6" /><circle cx="16" cy="3" r="5.6" /></g>
					<g className="cg-bite cg-bite-3" fill="#000"><circle cx="6" cy="33" r="5.6" /><circle cx="11" cy="40" r="5.6" /></g>
				</mask>
			</defs>
			<g mask={`url(#${maskId})`}>
				<circle cx="24" cy="24" r="21.5" fill="#d9a35e" />
				<circle cx="24" cy="24" r="21.5" fill="none" stroke="#a8692e" strokeWidth="2" />
				<circle cx="21" cy="21" r="15" fill="#e6b877" opacity=".55" />
				<g fill="#4e3020">
					<ellipse cx="17" cy="15" rx="3" ry="2.4" transform="rotate(-20 17 15)" />
					<ellipse cx="30" cy="13" rx="2.6" ry="2.1" transform="rotate(25 30 13)" />
					<ellipse cx="34" cy="27" rx="3" ry="2.4" transform="rotate(10 34 27)" />
					<ellipse cx="22" cy="28" rx="2.8" ry="2.2" transform="rotate(-35 22 28)" />
					<ellipse cx="13" cy="31" rx="2.2" ry="1.8" />
					<ellipse cx="27" cy="37" rx="2.6" ry="2" transform="rotate(15 27 37)" />
					<ellipse cx="10" cy="22" rx="1.8" ry="1.5" />
				</g>
				<g fill="#f3d3a0" opacity=".7"><circle cx="25" cy="20" r=".9" /><circle cx="35" cy="20" r=".8" /><circle cx="18" cy="36" r=".8" /></g>
			</g>
		</svg>
	);
}
