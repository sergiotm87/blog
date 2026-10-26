import { useId } from "react";

// The cookie, shared by the banner, the rolling cookie and the gopher's mouth.
// `bites` (0–3) removes bites from the side that faces the gopher.
export function CookieSvg({ bites = 0 }: { bites?: number }) {
	const maskId = useId(); // React 19.2: "_R_…_" → safe inside url(#…)
	return (
		<svg viewBox="0 0 48 48" focusable="false" aria-hidden="true" data-bites={bites} className="cookie-svg">
			<defs>
				<mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="48" height="48">
					<rect width="48" height="48" fill="#fff" />
					{/* each bite = two buck-tooth scallops on the left side */}
					<g className="cookie-bite cookie-bite-1" fill="#000"><circle cx="3" cy="17" r="5.6" /><circle cx="2.5" cy="25" r="5.6" /></g>
					<g className="cookie-bite cookie-bite-2" fill="#000"><circle cx="9" cy="8" r="5.6" /><circle cx="16" cy="3" r="5.6" /></g>
					<g className="cookie-bite cookie-bite-3" fill="#000"><circle cx="6" cy="33" r="5.6" /><circle cx="11" cy="40" r="5.6" /></g>
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
