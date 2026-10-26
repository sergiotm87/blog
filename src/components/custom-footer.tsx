import { CookieSettingsButton } from "@/components/cookie-settings-button";
import { DraftSwitch } from "@/components/draft-switch";
import { Navbar } from "@/components/navbar";
import { Link } from "next-view-transitions";
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

				<div
					className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground"
					data-pagefind-ignore="all"
				>
					<CookieSettingsButton />
					<Link href="/privacy/" className="no-underline hover:underline">
						Privacy &amp; cookies
					</Link>
					<span>
						Gopher by{" "}
						<a
							href="https://go.dev/blog/gopher"
							target="_blank"
							rel="noopener noreferrer"
							className="hover:underline"
						>
							Renée French
						</a>{" "}
						(
						<a
							href="https://creativecommons.org/licenses/by/4.0/"
							target="_blank"
							rel="noopener noreferrer"
							className="hover:underline"
						>
							CC BY 4.0
						</a>
						), modified
					</span>
				</div>
			</div>
		</div>
	);
};

export default CustomFooter;
