import type { CustomMetadata } from "@/app/[[...mdxPath]]/page";
import { AiBanner } from "@/components/ai-banner";
import GiscusComments from "@/components/giscus-comments";
import { Posts } from "@/components/posts";
import { ReadingProgress } from "@/components/reading-progress";
import { formatDate } from "@/lib/format-date";
import { IconArrowBack, IconPoint } from "@tabler/icons-react";
import { Link } from "next-view-transitions";
// @flow
import type * as React from "react";

type Props = {
	metadata: CustomMetadata;
	children: React.ReactNode;
};

export function PostDetail({ metadata, children }: Props) {
	return (
		<>
			<ReadingProgress />
			<div className="flex items-center gap-4 text-sm mb-6">
				<Link
					href="/"
					className="hover:underline no-underline flex items-center gap-1"
				>
					<IconArrowBack className="w-4" />
					Back to Posts
				</Link>
				<IconPoint className="w-3" />
				<div>{formatDate(metadata.date)}</div>
			</div>

			<h1>{metadata.title as string}</h1>

			{children}

			<h2>Related</h2>
			<Posts
				tags={metadata.tags}
				excludeByTitle={metadata.title as string}
				first={5}
			/>

			{metadata.enableComment !== false && (
				<div className="pt-32">
					<GiscusComments />
				</div>
			)}

			{metadata.tags?.includes("AI-Assisted") && <AiBanner />}
		</>
	);
}
