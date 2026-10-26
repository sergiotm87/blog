import { Badge } from "@/components/ui/badge";
import { getTags } from "@/lib/get-tags";
import { Link } from "next-view-transitions";
import * as React from "react";

type Props = {};

export async function Tags(props: Props) {
	const tags = await getTags();

	return (
		<div className="not-prose flex flex-wrap gap-1">
			{tags.map((tag) => (
				<Badge key={tag.name} variant="outline" asChild>
					<Link href={`/tags/${tag.name}`}>
						{tag.name} <span className="opacity-50">({tag.count})</span>
					</Link>
				</Badge>
			))}
		</div>
	);
}
