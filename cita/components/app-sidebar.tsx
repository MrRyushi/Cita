'use client'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { auth } from "@/firebase/firebase";
import { signOut } from "firebase/auth";
import { Home, UserRoundPen, Heart, LogOut, MessageCircle } from "lucide-react";

export function AppSidebar() {
  function userLogout() {
    try {
      signOut(auth);
    } catch (e) {
      console.log(e);
    }
  }

  const items = [
    {
      title: "Home",
      url: "#",
      icon: Home,
    },
    {
      title: "Matches",
      url: "#",
      icon: Heart,
    },
    {
      title: "Messages",
      url: "#",
      icon: MessageCircle,
    },
    {
      title: "Profile",
      url: "#",
      icon: UserRoundPen,
    },
    {
      title: "Logout",
      url: "#",
      icon: LogOut,
      action: userLogout,
    },
  ];

  return (
    <Sidebar>
      <SidebarContent className="py-4">
        <SidebarGroup className="space-y-8">
          <SidebarGroupLabel className="text-3xl">Cita</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-5">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    {item.action ? (
                      <button
                        onClick={item.action}
                        className="flex items-center gap-2 text-xl w-full text-left"
                      >
                        <item.icon strokeWidth={2} />
                        <span>{item.title}</span>
                      </button>
                    ) : (
                      <a
                        href={item.url}
                        className="flex items-center gap-2 text-xl"
                      >
                        <item.icon strokeWidth={2} />
                        <span>{item.title}</span>
                      </a>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
