import { getPosts } from "@/lib/get-posts";

export const dynamic = "force-static";

const CONFIG = {
	title: "Kammin",
	siteUrl: "https://sergiotm87.github.io/blog",
	description: "SRE, cloud, devops & platform engineering notes by Sergio Teran",
	lang: "en-us",
};

const escapeXml = (value: string = "") =>
	value
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;");

export async function GET() {
	const allPosts = await getPosts();
	const posts = allPosts
		.map(
			(post) => `    <item>
        <title>${escapeXml(post.title)}</title>
        <description>${escapeXml(post.frontMatter.description)}</description>
        <link>${CONFIG.siteUrl}${post.route}/</link>
        <pubDate>${new Date(post.frontMatter.date).toUTCString()}</pubDate>
    </item>`,
		)
		.join("\n");
	const xml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(CONFIG.title)}</title>
    <link>${CONFIG.siteUrl}</link>
    <description>${escapeXml(CONFIG.description)}</description>
    <language>${CONFIG.lang}</language>
${posts}
  </channel>
</rss>`;

	return new Response(xml, {
		headers: {
			"Content-Type": "application/rss+xml",
		},
	});
}
