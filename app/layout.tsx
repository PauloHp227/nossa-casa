import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Plano Juntos",
  description: "Planejamento da nossa futura casa",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
