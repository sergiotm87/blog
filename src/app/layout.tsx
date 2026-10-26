import { Head } from "nextra/components";
import "nextra-theme-blog/style.css";
import "@/styles/globals.css";
import CustomFooter from "@/components/custom-footer";
import CustomHeader from "@/components/custom-header";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Layout } from "nextra-theme-blog";

export const metadata: Metadata = {
	title: {
		default: "Kammin",
		template: "%s | Kammin",
	},
	description:
		"Sergio Teran's blog: SRE, cloud, devops and platform engineering notes, and the Kajuna side project.",
};

const bodyFont = Inter({
	subsets: ["latin"],
});

export default async function RootLayout({ children }) {
	return (
		<html
			// Not required, but good for SEO
			lang="en"
			// Required to be set
			dir="ltr"
			// Suggested by `next-themes` package https://github.com/pacocoursey/next-themes#with-app
			suppressHydrationWarning
			className={bodyFont.className}
		>
			<Head backgroundColor={{ dark: "#15120d", light: "#faf5e9" }} />
			<body className="min-h-screen">
				<Layout>
					<CustomHeader />

					{children}

					<CustomFooter />
				</Layout>
			</body>
		</html>
	);
}
