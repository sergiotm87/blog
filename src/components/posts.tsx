import { formatDate } from "@/lib/format-date";
import { type PostItem, getPosts } from "@/lib/get-posts";
import { IconArrowNarrowRight, IconTags } from "@tabler/icons-react";
import { Link } from "next-view-transitions";
import * as React from "react";

type Props = {
	posts?: PostItem[];
	tags?: string[];
	excludeByTitle?: string;
	first?: number;
	showViewAllButton?: boolean;
};

export async function Posts({
	posts,
	tags,
	excludeByTitle,
	first,
	showViewAllButton,
}: Props) {
	const displayPosts =
		posts ?? (await getPosts({ tags, excludeByTitle, first }));
	return (
		<div className="space-y-6 not-prose">
			{displayPosts.map((post) => {
				return (
					<div key={post.route} className="flex flex-wrap">
						<div className="w-[calc(100%-100px)]">
							<div className="font-bold flex items-center gap-2">
								<Link href={post.route} className="hover:underline">
									{post.title}
								</Link>
								{post.frontMatter.draft && (
									<span className="text-xs font-medium bg-amber-500/20 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded">
										DRAFT
									</span>
								)}
							</div>
							<div className="flex gap-1 text-sm">
								<IconTags className="w-4 min-w-4 -translate-y-0.5 text-muted-foreground" />
								<div className="flex flex-wrap gap-x-1">
									{post.frontMatter.tags.map((tagName, index: number) => {
										return (
											<Link
												key={tagName}
												href={`/tags/${tagName}`}
												className="text-sm text-muted-foreground hover:underline"
											>
												<span>
													{tagName}
													{index < post.frontMatter.tags.length - 1 && ", "}
												</span>
											</Link>
										);
									})}
								</div>
							</div>
						</div>

						<div className="w-[100px] text-right">
							<div className="text-sm text-muted-foreground pt-1">
								<div>{formatDate(post.frontMatter.date)}</div>
							</div>
						</div>
					</div>
				);
			})}

			{showViewAllButton === true && (
				<Link href="/posts" className="flex gap-1 items-center hover:underline">
					View all posts <IconArrowNarrowRight className="w-4" />
				</Link>
			)}
		</div>
	);
}
