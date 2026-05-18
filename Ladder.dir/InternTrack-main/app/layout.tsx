import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ladder · Career concierge for UC students",
  description:
    "Ladder is an AI career concierge for University of Canterbury students. Discover relevant internships, track every application, and rehearse company-specific interviews in one focused studio.",
  metadataBase: new URL("https://interntrack.app"),
  openGraph: {
    title: "Ladder · Career concierge for UC students",
    description:
      "AI-powered internship discovery, application tracking, and interview prep for University of Canterbury students.",
    url: "https://interntrack.app",
    siteName: "Ladder",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ladder · Career concierge for UC students",
    description:
      "AI-powered internship discovery, application tracking, and interview prep for University of Canterbury students.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f%5B%5D=gambarino@400&display=swap"
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
