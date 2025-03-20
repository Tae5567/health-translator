import type { Metadata } from "next";
//import { Inter} from "next/font/google";
import { SpeechSupportProvider } from '@/components/SpeechSupportProvider';
import "./globals.css";

//const inter = Inter({subsets: ["latin"]});

export const metadata: Metadata = {
  title: "Health Talk Translation App",
  description: "Translate medical conversations in real-time",
};

/*export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={inter.className}
      >
        {children}
      </body>
    </html>
  );
} */

export default function RootLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
      <html lang="en">
        <body>
          <SpeechSupportProvider>
            {children}
          </SpeechSupportProvider>
        </body>
      </html>
    );
}
