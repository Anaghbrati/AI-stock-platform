
// import type { Metadata } from "next";
// import "./globals.css";
// import ThemeProvider from "../components/ThemeProvider";

// export const metadata: Metadata = {
//   title: "AI Stock Platform",
//   description:
//     "AI-powered stock analysis and market intelligence platform",
// };

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <html lang="en" suppressHydrationWarning>
//       <body>
//         <ThemeProvider>
//           {children}
//         </ThemeProvider>
//       </body>
//     </html>
//   );
// }



import type { Metadata } from "next";
import "./globals.css";
import ThemeProvider from "../components/ThemeProvider";

export const metadata: Metadata = {
  title: "AI Stock Platform",
  description:
    "AI-powered stock analysis and market intelligence platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
