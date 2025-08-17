import "./globals.css";
import { LanguageProvider } from "@/hooks/LanguageContext";
import { IntlProvider } from "./providers";

export const metadata = {
	title: "yann's Portfolio",
	description: "designer, developer and web artist",
	openGraph: {
		siteName: "portfolio",
		title: "yann",
		description: "designer, developer and web artist",
		url: "https://yann.dev",
		images: [
			{
				url: "https://yann.dev/assets/embed.png",
			},
		],
	},
};

export default function RootLayout({
	children,
}: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<meta name="darkreader-lock" />
				<meta name="theme-color" content="#232121" />
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link
					rel="preconnect"
					href="https://fonts.gstatic.com"
					crossOrigin="anonymous"
				/>
				<link rel="preload" href="/assets/background.svg" as="image" />
				<link rel="preload" href="/assets/card.mp4" as="video" />
			</head>
			<body className="min-h-screen flex flex-col">
				<LanguageProvider>
					<IntlProvider>{children}</IntlProvider>
				</LanguageProvider>
			</body>
		</html>
	);
}
