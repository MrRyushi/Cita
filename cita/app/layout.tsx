import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "../providers/AuthProvider";
import { Toaster } from "@/components/ui/sonner";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

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
      <body className="">
        <AuthProvider>
          <SidebarProvider>
            <AppSidebar />
            <main>
              <SidebarTrigger />
              {children}
              <Toaster position="top-center" richColors />
            </main>
          </SidebarProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
