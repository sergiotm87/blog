import nextra from "nextra";

const withNextra = nextra({
	defaultShowCopyCode: true,
	readingTime: true,
});

// Static export for GitHub Pages, served under https://sergiotm87.github.io/blog.
// Only on production builds: export mode forbids cookies(), which the dev-only
// drafts switch needs.
const isProd = process.env.NODE_ENV === "production";

export default withNextra({
	output: isProd ? "export" : undefined,
	basePath: "/blog",
	trailingSlash: true,
	images: { unoptimized: true },
	reactStrictMode: true,
	cleanDistDir: true,
});
