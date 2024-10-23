//TODO
//URLパラメーターからクラスとイベント名を取得し、レイアウトに表示するようにする
//このサービスはFesOrderという名前です 各ページへのリンクは/[eventName]/[circleName]/~~にしてください ログイン機能をつける予定なのでログインしている場合、名前が右上に表示されるようにしてください 左上にイベント名とサークル名を表示させてください 上のバーにはサービス名とサークル名とサークルアイコンを表示させてください


import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "@/app/globals.css"
import { Sidebar, SidebarContent, SidebarHeader, SidebarTrigger, SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { BarChart, UtensilsCrossed, Coffee, ClipboardList } from "lucide-react"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Food Service Management",
  description: "Manage your food service business efficiently",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SidebarProvider>
          <Sidebar>
            <SidebarHeader>
              <h1 className="text-xl font-bold px-4 py-2">Food Service Management</h1>
            </SidebarHeader>
            <SidebarContent>
              <nav className="space-y-2 px-2">
                <SidebarLink href="/dashboard" icon={<BarChart className="mr-2 h-4 w-4" />}>
                  Sales Dashboard
                </SidebarLink>
                <SidebarLink href="/menus" icon={<UtensilsCrossed className="mr-2 h-4 w-4" />}>
                  Menu Management
                </SidebarLink>
                <SidebarLink href="/orders" icon={<ClipboardList className="mr-2 h-4 w-4" />}>
                  Order Management
                </SidebarLink>
              </nav>
            </SidebarContent>
          </Sidebar>
          <SidebarInset>
            <header className="flex h-16 items-center gap-4 border-b px-6">
              <SidebarTrigger />
              <h2 className="text-lg font-semibold">Food Service Management</h2>
            </header>
            <main className="flex-1 overflow-auto">
              {children}
            </main>
          </SidebarInset>
        </SidebarProvider>
      </body>
    </html>
  )
}

function SidebarLink({ href, icon, children }: { href: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Button asChild variant="ghost" className="w-full justify-start">
      <Link href={href}>
        {icon}
        {children}
      </Link>
    </Button>
  )
}