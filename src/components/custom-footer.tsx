import { DraftSwitch } from "@/components/draft-switch";
import { Navbar } from "@/components/navbar";
import { Footer, ThemeSwitch } from "nextra-theme-blog";
import { Search } from "nextra/components";
import { getPageMap } from "nextra/page-map";
import React from "react";

const CustomFooter = async () => {
	return (
		<div className="pt-32">
			<div className="space-y-6">
				<Navbar pageMap={await getPageMap()} />

				<div className="flex justify-between items-center gap-4">
					<div className="flex gap-2 items-center">
						<ThemeSwitch />
						<div>© {new Date().getFullYear()} Sergio Teran</div>
						{process.env.NODE_ENV === "development" && <DraftSwitch />}
					</div>
					<Search placeholder="Search posts..." />
				</div>
			</div>
		</div>
	);
};

export default CustomFooter;
