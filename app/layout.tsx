import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const baseUrl =
  process.env.NEXT_PUBLIC_BASE_URL || "https://tryskillbridge.com";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "SkillBridge — AI Career Blueprint Architect",
    template: "%s | SkillBridge",
  },
  description:
    "Generate a personalized 3-phase career roadmap in 10 seconds. From foundation skills to industry authority — free, no signup required.",
  keywords: [
    "career roadmap",
    "career planning",
    "skill gap analysis",
    "career development",
    "career blueprint",
    "tech career",
    "engineering career path",
    "career transition",
    "professional development",
    "upskilling",
  ],
  authors: [{ name: "SkillBridge" }],
  creator: "SkillBridge",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: baseUrl,
    siteName: "SkillBridge",
    title: "SkillBridge — AI Career Blueprint Architect",
    description:
      "Generate a personalized 3-phase career roadmap in 10 seconds. Foundation → Execution → Authority.",
    images: [
      {
        url: `${baseUrl}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: "SkillBridge — Career Blueprint Architect",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SkillBridge — AI Career Blueprint Architect",
    description:
      "Generate a personalized 3-phase career roadmap in 10 seconds. Free, no signup required.",
    images: [`${baseUrl}/opengraph-image`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: baseUrl,
  },
};

// JSON-LD structured data
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "SkillBridge",
  description:
    "Generate a personalized 3-phase career roadmap. From foundation skills to industry authority in minutes.",
  url: baseUrl,
  applicationCategory: "BusinessApplication",
  operatingSystem: "Any",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    description: "Free career blueprint generation",
  },
  featureList: [
    "Personalized career roadmaps",
    "3-phase skill development plans",
    "15+ career path profiles",
    "Shareable blueprint links",
    "Mock interview preparation",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* Umami Analytics — privacy-friendly, no cookies */}
        <script
          defer
          data-website-id="08b8a72d-8500-4cfd-aac5-21454827fa92"
          src="https://cloud.umami.is/script.js"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
