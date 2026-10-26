// Shared state between the cookie banner and the header gopher (logo).
// Both are client components in the same bundle, so a module-level store is enough.
import { useSyncExternalStore } from "react";

// still: plain logo · waiting: banner open, eyes follow the pointer or the cookie
// eating: the cookie reached the mouth · doh: the cookie rolled away (rejected)
export type Mood = "still" | "waiting" | "eating" | "doh";

let mood: Mood = "still";
const subs = new Set<() => void>();

export function setMood(next: Mood) {
	if (next === mood) return;
	mood = next;
	for (const fn of subs) fn();
}

export function useMood(): Mood {
	return useSyncExternalStore(
		(fn) => {
			subs.add(fn);
			return () => subs.delete(fn);
		},
		() => mood,
		() => "still",
	);
}

// What the eyes look at, by priority: the rolling cookie, the pointer, the cookie in the banner.
export const LOOK_ATTR = "data-gopher-look";
// Where the cookie lands in the logo (the eating cookie's box).
export const SLOT_ATTR = "data-gopher-slot";
