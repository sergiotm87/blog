"use client";

import { IconPlayerPlayFilled } from "@tabler/icons-react";
import { useState } from "react";

type Props = {
	id: string;
	title: string;
};

// Click-to-load YouTube embed: nothing is requested from YouTube or Google
// until the reader presses play (see /privacy/).
export function YouTube({ id, title }: Props) {
	const [loaded, setLoaded] = useState(false);

	return (
		<div className="not-prose relative my-6 aspect-video w-full overflow-hidden rounded-lg bg-neutral-900">
			{loaded ? (
				<iframe
					src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1`}
					title={title}
					className="absolute inset-0 h-full w-full border-0"
					allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
					allowFullScreen
				/>
			) : (
				<button
					type="button"
					onClick={() => setLoaded(true)}
					className="absolute inset-0 flex h-full w-full cursor-pointer flex-col items-center justify-center gap-3 p-4 text-center text-neutral-100 hover:bg-neutral-800 focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-white"
				>
					<span className="flex h-14 w-14 items-center justify-center rounded-full bg-red-600">
						<IconPlayerPlayFilled className="h-7 w-7" aria-hidden="true" />
					</span>
					<span className="font-medium">Play video: {title}</span>
					<span className="max-w-md text-xs text-neutral-300">
						Loads the player from YouTube (Google), which can store data in your
						browser.
					</span>
				</button>
			)}
		</div>
	);
}
