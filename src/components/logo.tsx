import { Link } from "next-view-transitions";
import React from "react";

const BASE_PATH = "/blog";

const Logo = ({ hasLink = true, title = "Go to home" }) => {
	const mark = (
		<img
			src={`${BASE_PATH}/logos/gopher-head.png`}
			alt=""
			width={67}
			height={42}
			className="h-[42px] w-auto"
		/>
	);

	if (!hasLink) return mark;

	return (
		<Link
			href="/"
			title={title}
			className="flex items-center gap-3 no-underline text-black dark:text-white"
		>
			{mark}
			<span className="text-3xl font-semibold tracking-tight">Kammin</span>
		</Link>
	);
};

export default Logo;
