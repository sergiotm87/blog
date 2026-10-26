import { normalizePages } from "nextra/normalize-pages";
import { getPageMap } from "nextra/page-map";

type GetPostsOptions = {
	first?: number;
	tags?: string[];
	excludeByTitle?: string;
};
export type PostItem = {
	title: string;
	name: string;
	route: string;
	type: string;
	frontMatter: {
		title: string;
		date: string;
		tags: string[];
		description: string;
		enableComment: boolean;
		filePath: string;
		timestamp: number;
		draft?: boolean;
	};
};

export async function getPosts(
	options: GetPostsOptions = {},
): Promise<PostItem[]> {
	const { first, tags, excludeByTitle } = options;

	// get
	const pageMap = await getPageMap("/posts");

	if (process.env.NODE_ENV === "development") {
		const { cookies } = await import("next/headers");
		const cookieStore = await cookies();
		const isDraftMode = cookieStore.get("draft_mode")?.value === "true";

		if (isDraftMode) {
			// Track which items are drafts, then strip display: hidden
			// so normalizePages doesn't filter them out.
			const draftNames = new Set<string>();
			const modifiedPageMap = pageMap.map((item: any) => {
				if (item.frontMatter?.display === "hidden") {
					draftNames.add(item.name);
					const { display, ...rest } = item.frontMatter;
					return { ...item, frontMatter: rest };
				}
				return item;
			});

			const { directories } = normalizePages({
				list: modifiedPageMap,
				route: "/posts",
			});

			// Re-add draft marker to items that had display: hidden
			const markedDirectories = directories.map((item: any) => {
				if (draftNames.has(item.name)) {
					return {
						...item,
						frontMatter: { ...item.frontMatter, draft: true },
					};
				}
				return item;
			});

			return processDirectories(markedDirectories, options);
		}
	}

	const { directories } = normalizePages({
		list: pageMap,
		route: "/posts",
	});

	return processDirectories(directories, options);
}

function processDirectories(
	directories: any[],
	options: GetPostsOptions,
): PostItem[] {
	const { first, tags, excludeByTitle } = options;

	// Sort posts by date
	let posts = directories
		.filter((post) => post.name !== "index")
		.sort((a, b) => {
			const dateA = new Date(a.frontMatter?.date || "");
			const dateB = new Date(b.frontMatter?.date || "");
			return dateB.getTime() - dateA.getTime();
		});

	// Filter by tags if provided
	if (tags && tags.length > 0) {
		posts = posts.filter((post) =>
			tags.some((tag) => post.frontMatter.tags?.includes(tag)),
		);
	}

	// Exclude by title if provided
	if (excludeByTitle) {
		posts = posts.filter((post) => post.title !== excludeByTitle);
	}

	// Apply first limit if provided
	if (first) {
		posts = posts.slice(0, first);
	}

	return posts as unknown as PostItem[];
}
