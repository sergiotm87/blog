import { Posts } from "@/components/posts";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Posts",
	description: "All blog posts and articles.",
};

export default function PostsPage() {
	return (
		<div className="container mx-auto">
			<h1 className="text-3xl font-bold mb-8">Posts</h1>
			<Posts />
		</div>
	);
}
