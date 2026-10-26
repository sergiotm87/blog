import { GopherMark } from "@/components/gopher-mark";
import { Link } from "next-view-transitions";
import React from "react";

const Logo = ({ hasLink = true, title = "Go to home" }) => {
	const mark = <GopherMark />;

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
