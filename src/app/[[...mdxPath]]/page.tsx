import { PostDetail } from "@/components/post-detail";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { generateStaticParamsFor, importPage } from "nextra/pages";
import type React from "react";
import { useMDXComponents as getMDXComponents } from "../../../mdx-components";

// Define types for params and metadata
type PageParams = {
	mdxPath: string[];
};

type PageProps = {
	params: Promise<PageParams>;
};

export type CustomMetadata = Metadata & {
	date?: string;
	enableComment?: boolean;
	tags?: string[];
	display?: string;
};

const _generateStaticParams = generateStaticParamsFor("mdxPath");

export const generateStaticParams = async () => {
	const allParams = await _generateStaticParams();
	// In development, include all routes (drafts accessible via switch).
	// In production, exclude drafts so they 404 statically.
	if (process.env.NODE_ENV === "development") return allParams;
	const filtered = [];
	for (const param of allParams) {
		try {
			const { metadata } = await importPage(param.mdxPath as string[]);
			if ((metadata as CustomMetadata).display === "hidden") continue;
		} catch {
			/* include on error */
		}
		filtered.push(param);
	}
	return filtered;
};

export const dynamicParams = false;

export async function generateMetadata(props: PageProps): Promise<Metadata> {
	const params = await props.params;
	const { metadata } = await importPage(params.mdxPath);
	return metadata;
}

const Wrapper = getMDXComponents().wrapper;

export default async function Page(props: PageProps) {
	const params = await props.params;
	const result = await importPage(params.mdxPath);
	const {
		default: MDXContent,
		toc,
		metadata,
	} = result as {
		default: React.ComponentType<any>;
		toc: any;
		metadata: CustomMetadata;
	};

	// Block access to draft posts unless in dev with draft mode ON
	if (metadata.display === "hidden") {
		if (process.env.NODE_ENV !== "development") {
			notFound();
		}
		const { cookies } = await import("next/headers");
		const cookieStore = await cookies();
		const isDraftMode = cookieStore.get("draft_mode")?.value === "true";
		if (!isDraftMode) {
			notFound();
		}
	}

	const isPostPage =
		params.mdxPath &&
		params.mdxPath.length > 1 &&
		params.mdxPath.includes("posts");

	return (
		// @ts-ignore
		<Wrapper toc={toc} metadata={metadata}>
			<div
				{...(metadata.display === "hidden"
					? { "data-pagefind-ignore": "all" }
					: {})}
			>
				{isPostPage && (
					<PostDetail metadata={metadata}>
						<MDXContent {...props} params={params} />
					</PostDetail>
				)}

				{!isPostPage && (
					<>
						<MDXContent {...props} params={params} />
					</>
				)}
			</div>
		</Wrapper>
	);
}
