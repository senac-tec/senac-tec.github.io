"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  FileText,
  Calendar,
  Library,
  Settings,
  Award,
  MessageSquare,
  School,
} from "lucide-react"

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: Users, label: "Alunos", href: "/alunos" },
  { icon: GraduationCap, label: "Professores", href: "/professores" },
  { icon: BookOpen, label: "Turmas", href: "/turmas" },
  { icon: FileText, label: "Notas", href: "/notas" },
  { icon: Calendar, label: "Frequência", href: "/frequencia" },
  { icon: Library, label: "Biblioteca", href: "/biblioteca" },
  { icon: Award, label: "Cursos e Vestibulares", href: "/cursos" },
  { icon: MessageSquare, label: "Comunicação", href: "/comunicacao" },
  { icon: Settings, label: "Configurações", href: "/configuracoes" },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-60 bg-white border-r border-border h-screen fixed left-0 top-0 flex flex-col">
      <div className="p-6 border-b border-border">
        <Link href="/" className="flex items-center gap-2">
          <School className="w-6 h-6 text-primary" />
          <span className="font-semibold text-lg">EducaGestaoDF</span>
        </Link>
      </div>

      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}
