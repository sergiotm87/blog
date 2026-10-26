"use client";

import { IconRobot } from "@tabler/icons-react";
import { useEffect, useState } from "react";

export function AiBanner() {
	const [visible, setVisible] = useState(true);

	useEffect(() => {
		const onScroll = () => {
			if (window.scrollY > 20) setVisible(false);
		};

		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	if (!visible) return null;

	return (
		<div className="fixed bottom-0 inset-x-0 z-50 flex items-center justify-center gap-2 border-t border-neutral-200 bg-neutral-50 px-4 py-2.5 text-xs text-neutral-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400">
			<IconRobot className="w-3.5 h-3.5 shrink-0" />
			<span>
				Written with AI assistance. A human guided the structure, reviewed the
				content, and approved every edit.
			</span>
		</div>
	);
}
