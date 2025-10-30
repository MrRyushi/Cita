import Navbar from "@/components/Navbar";


export default function WithNavbarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
 <div className="flex flex-col md:h-screen overflow-hidden">
      <Navbar />
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
