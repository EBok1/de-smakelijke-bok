import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "De Smakelijke Bok",
  description: "Een gezellige verzameling heerlijke recepten",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
