"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, GraduationCap, BookOpen, TrendingUp } from "lucide-react"
import { getSupabase } from "@/lib/supabase"
import type { DashboardStats, RecentActivity, UpcomingEvent } from "@/lib/types"

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    activeTeachers: 0,
    activeClasses: 0,
    approvalRate: 0,
    studentGrowth: 0,
    teacherGrowth: 0,
    classDistribution: "",
    approvalGrowth: 0,
  })
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  async function loadDashboardData() {
    try {
      const supabase = getSupabase()

      // Get total students
      const { count: studentsCount } = await supabase
        .from("students")
        .select("*", { count: "exact", head: true })
        .eq("status", "active")

      // Get active teachers
      const { count: teachersCount } = await supabase
        .from("teachers")
        .select("*", { count: "exact", head: true })
        .eq("status", "active")

      // Get active classes
      const { count: classesCount } = await supabase
        .from("classes")
        .select("*", { count: "exact", head: true })
        .eq("status", "active")

      // Get approval rate (students with attendance >= 75%)
      const { data: enrollments } = await supabase.from("enrollments").select("attendance_rate").eq("status", "active")

      let approvalRate = 0
      if (enrollments && enrollments.length > 0) {
        const approved = enrollments.filter((e) => (e.attendance_rate || 0) >= 75).length
        approvalRate = (approved / enrollments.length) * 100
      }

      setStats({
        totalStudents: studentsCount || 0,
        activeTeachers: teachersCount || 0,
        activeClasses: classesCount || 0,
        approvalRate: approvalRate,
        studentGrowth: 12,
        teacherGrowth: 2,
        classDistribution: "3 turnos",
        approvalGrowth: 2.1,
      })

      // Mock recent activities
      setRecentActivities([
        {
          id: "1",
          type: "student",
          title: "Novo aluno matriculado",
          description: "João Silva - 9º Ano A",
          time: "2h atrás",
        },
        {
          id: "2",
          type: "grade",
          title: "Notas lançadas",
          description: "Matemática - 8º Ano B",
          time: "4h atrás",
        },
        {
          id: "3",
          type: "class",
          title: "Nova turma criada",
          description: "1º Ano C - Manhã",
          time: "1d atrás",
        },
      ])

      // Mock upcoming events
      setUpcomingEvents([
        {
          id: "1",
          title: "Reunião de Pais",
          description: "Todas as turmas - 19h",
          date: "2025-10-15",
          day: 15,
          color: "bg-blue-500",
        },
        {
          id: "2",
          title: "Conselho de Classe",
          description: "9º Ano - 14h",
          date: "2025-10-20",
          day: 20,
          color: "bg-green-500",
        },
        {
          id: "3",
          title: "Feira de Ciências",
          description: "Todo o dia - Pátio",
          date: "2025-10-25",
          day: 25,
          color: "bg-purple-500",
        },
      ])

      setLoading(false)
    } catch (error) {
      console.error("[v0] Error loading dashboard data:", error)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando dados...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header title="Painel de Controle" subtitle="Visão geral do sistema de gestão escolar" />

      <div className="p-8">
        <h2 className="text-3xl font-bold mb-8">Dashboard</h2>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total de Alunos</CardTitle>
              <Users className="w-5 h-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalStudents.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-2">+{stats.studentGrowth}% em relação ao mês passado</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Professores Ativos</CardTitle>
              <GraduationCap className="w-5 h-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.activeTeachers}</div>
              <p className="text-xs text-muted-foreground mt-2">+{stats.teacherGrowth} novos este mês</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Turmas Ativas</CardTitle>
              <BookOpen className="w-5 h-5 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.activeClasses}</div>
              <p className="text-xs text-muted-foreground mt-2">Distribuídas em {stats.classDistribution}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Taxa de Aprovação</CardTitle>
              <TrendingUp className="w-5 h-5 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.approvalRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground mt-2">+{stats.approvalGrowth}% em relação ao ano anterior</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activities and Upcoming Events */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Atividades Recentes</CardTitle>
              <CardDescription>Últimas ações realizadas no sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-4">
                    <div
                      className={`w-2 h-2 rounded-full mt-2 ${
                        activity.type === "student"
                          ? "bg-blue-500"
                          : activity.type === "grade"
                            ? "bg-green-500"
                            : "bg-purple-500"
                      }`}
                    />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{activity.title}</p>
                      <p className="text-sm text-muted-foreground">{activity.description}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{activity.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Próximos Eventos</CardTitle>
              <CardDescription>Agenda de eventos escolares</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 rounded-lg ${event.color} flex items-center justify-center text-white font-bold`}
                    >
                      {event.day}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{event.title}</p>
                      <p className="text-sm text-muted-foreground">{event.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
