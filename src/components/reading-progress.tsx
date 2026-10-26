"use client";

import { useEffect, useState } from "react";

export function ReadingProgress() {
	const [progress, setProgress] = useState(0);

	useEffect(() => {
		const onScroll = () => {
			const { scrollTop, scrollHeight, clientHeight } =
				document.documentElement;
			const scrollable = scrollHeight - clientHeight;
			setProgress(scrollable > 0 ? (scrollTop / scrollable) * 100 : 0);
		};

		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	return (
		<div className="fixed top-0 inset-x-0 z-50 h-0.5">
			<div
				className="h-full bg-neutral-400 dark:bg-neutral-500 transition-[width] duration-100 ease-out"
				style={{ width: `${progress}%` }}
			/>
		</div>
	);
}
