"use client";

import Giscus from "@giscus/react";
import React from "react";

const GiscusComments = () => {
	return (
		<Giscus
			repo="sergiotm87/blog"
			repoId="MDEwOlJlcG9zaXRvcnkzMDY3MDQxMjk="
			category="Announcements"
			categoryId="DIC_kwDOEkfvAc4DJpwQ"
			mapping="pathname"
			strict="0"
			reactionsEnabled="1"
			emitMetadata="0"
			inputPosition="bottom"
			theme="preferred_color_scheme"
			lang="en"
			loading="lazy"
		/>
	);
};

export default GiscusComments;
