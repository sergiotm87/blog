"use client";

import { OPEN_EVENT } from "@/lib/consent";

// Reopens the consent banner so readers can change or withdraw their choice.
export function CookieSettingsButton() {
	return (
		<button
			type="button"
			className="hover:underline cursor-pointer"
			onClick={() => window.dispatchEvent(new Event(OPEN_EVENT))}
		>
			Cookie settings
		</button>
	);
}
