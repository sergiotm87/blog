// Analytics consent (Google Analytics 4, "basic" consent mode): gtag.js is not
// loaded at all until the reader accepts. The choice lives in localStorage and
// expires after 24 months (AEPD cookie guide, 3.2.8).

export type Choice = "granted" | "denied";

export const GA_ID = "G-JD2MWCMBBB";
// Only the published site reports to GA, so local previews don't pollute it.
const GA_HOST = "sergiotm87.github.io";
export const OPEN_EVENT = "kammin:consent-open";

const KEY = "kammin:consent";
// Bump when the purposes or third parties change: everyone is asked again (AEPD 3.2.7).
const VERSION = 1;
const MAX_AGE_MS = 1000 * 60 * 60 * 24 * 730;

type Stored = { v: number; analytics: Choice; ts: number };

declare global {
	interface Window {
		dataLayer?: unknown[];
		gtag?: (...args: unknown[]) => void;
		__gaLoaded?: boolean;
	}
}

export function readConsent(): Choice | null {
	try {
		const raw = localStorage.getItem(KEY);
		if (!raw) return null;
		const s = JSON.parse(raw) as Stored;
		if (s.v !== VERSION || Date.now() - s.ts > MAX_AGE_MS) return null;
		return s.analytics === "granted" || s.analytics === "denied"
			? s.analytics
			: null;
	} catch {
		return null;
	}
}

export function writeConsent(choice: Choice) {
	try {
		const value: Stored = { v: VERSION, analytics: choice, ts: Date.now() };
		localStorage.setItem(KEY, JSON.stringify(value));
	} catch {
		// Storage blocked: GA still loads for this page view only if accepted.
	}
	if (choice === "granted") loadGA();
	else revoke();
}

export function loadGA() {
	if (
		process.env.NODE_ENV !== "production" ||
		location.hostname !== GA_HOST ||
		window.__gaLoaded
	)
		return;
	window.__gaLoaded = true;
	window.dataLayer = window.dataLayer || [];
	// gtag needs `arguments`, so this must be a plain function.
	window.gtag = function gtag() {
		// biome-ignore lint/style/noArguments: gtag.js reads the arguments object
		window.dataLayer?.push(arguments);
	};
	window.gtag("consent", "default", {
		analytics_storage: "granted",
		ad_storage: "denied",
		ad_user_data: "denied",
		ad_personalization: "denied",
	});
	window.gtag("js", new Date());
	window.gtag("config", GA_ID, {
		allow_google_signals: false,
		allow_ad_personalization_signals: false,
		cookie_expires: 60 * 60 * 24 * 395, // ~13 months for _ga and _ga_<id>
	});
	const script = document.createElement("script");
	script.async = true;
	script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
	document.head.appendChild(script);
}

// github.io is a public suffix, so GA cookies live on sergiotm87.github.io, path "/".
// Also called on every page load without consent: gtag.js can rewrite _ga_<id>
// while the page unloads after a withdrawal, so a one-off delete is not enough.
export function clearGaCookies() {
	const host = location.hostname;
	for (const part of document.cookie.split(";")) {
		const name = part.split("=")[0].trim();
		if (
			name === "_ga" ||
			name.startsWith("_ga_") ||
			name === "_gid" ||
			name.startsWith("_gat")
		) {
			for (const domain of ["", `; domain=${host}`, `; domain=.${host}`]) {
				document.cookie = `${name}=; Max-Age=0; path=/${domain}`;
			}
		}
	}
}

function revoke() {
	// Stop gtag.js from writing cookies again before the reload.
	window.gtag?.("consent", "update", { analytics_storage: "denied" });
	clearGaCookies();
	// gtag.js cannot be unloaded once running, so a reload is the only way to stop it.
	if (window.__gaLoaded) location.reload();
}
