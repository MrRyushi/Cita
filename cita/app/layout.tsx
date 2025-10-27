import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "../providers/AuthProvider";
import { Toaster } from "@/components/ui/sonner"; 

export const metadata: Metadata = {
  title: "Cita Dating App",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className=""
      >
        <AuthProvider>
          {children}
          <Toaster position="top-center" richColors/>
        </AuthProvider>
      </body>
    </html>
  );
}
