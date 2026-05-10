import type { Metadata } from "next";
import { JetBrains_Mono, Manrope, Space_Grotesk } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import Link from "next/link";

const bodyFont = Manrope({
	variable: "--font-sans",
	subsets: ["latin"],
});

const headingFont = Space_Grotesk({
	variable: "--font-heading",
	subsets: ["latin"],
});

const monoFont = JetBrains_Mono({
	variable: "--font-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "GDG on Campus - Certificate Verification",
	description:
		"Verify GDG on Campus certificates from Roorkee Institute of Technology.",
	manifest : { 
		
	}
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="en"
			suppressHydrationWarning
			className={`${bodyFont.variable} ${headingFont.variable} ${monoFont.variable} h-full antialiased`}
		>
			<body className="min-h-full flex flex-col">
				<script
					dangerouslySetInnerHTML={{
						__html: `(() => {
  try {
    const root = document.documentElement;
    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme = stored === "light" || stored === "dark" ? stored : (prefersDark ? "dark" : "light");
    root.classList.toggle("dark", theme === "dark");
    root.style.colorScheme = theme;
  } catch {}
})();`,
					}}
				/>
				{children}
				<Toaster />
				<footer className="flex h-28 w-full items-center justify-center bg-black">
					<div className="text-white">
						<span>
							Ideated by{" "}
							<Link href="https://www.linkedin.com/in/ashwani-raj-57480028a/" className="font-medium underline">
								Ashwani
							</Link>
						</span>
						{" "}&{" "}
						<span>
							Built by{" "}
							<Link href="http://linkedin.com/in/astro-adityaraj/" className="font-medium underline">
								Aditya
							</Link>

							

						</span>
            {" "}
            with 💖 
					</div>
				</footer>
			</body>
		</html>
	);
}
