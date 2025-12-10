"use client"

import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Users, TrendingUp } from "lucide-react"

export default function FrequenciaPage() {
  return (
    <div className="min-h-screen">
      <Header title="Frequência" subtitle="Controle de presença dos alunos" />

      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Presença Hoje</CardTitle>
              <Users className="w-5 h-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">87%</div>
              <p className="text-xs text-muted-foreground mt-2">1,073 de 1,234 alunos presentes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Média Mensal</CardTitle>
              <Calendar className="w-5 h-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">92.5%</div>
              <p className="text-xs text-muted-foreground mt-2">Frequência média do mês</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Tendência</CardTitle>
              <TrendingUp className="w-5 h-5 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">+2.3%</div>
              <p className="text-xs text-muted-foreground mt-2">Em relação ao mês anterior</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sistema de Frequência</CardTitle>
            <CardDescription>
              O módulo completo de frequência está em desenvolvimento e incluirá registro diário de presença, relatórios
              detalhados e alertas automáticos.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  )
}
