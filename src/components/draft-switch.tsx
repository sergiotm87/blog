"use client";
import { Switch } from "@/components/ui/switch";
import { useRouter } from "next/navigation";
import * as React from "react";
const { useEffect, useState } = React;

export function DraftSwitch() {
	const router = useRouter();
	const [isDraft, setIsDraft] = useState(false);

	useEffect(() => {
		const match = document.cookie.match(/(^| )draft_mode=true/);
		setIsDraft(!!match);
	}, []);

	const toggle = (checked: boolean) => {
		setIsDraft(checked);
		document.cookie = `draft_mode=${checked}; path=/; max-age=31536000`; // 1 year
		router.refresh();
	};

	return (
		<div className="flex items-center space-x-2">
			<label
				htmlFor="draft-mode"
				className="text-sm cursor-pointer select-none text-muted-foreground"
			>
				Drafts
			</label>
			<Switch
				id="draft-mode"
				checked={isDraft}
				onCheckedChange={toggle}
				size="sm"
			/>
		</div>
	);
}
