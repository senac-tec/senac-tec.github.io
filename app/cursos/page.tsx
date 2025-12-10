"use client"

import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Award, Users, Calendar } from "lucide-react"

export default function CursosPage() {
  return (
    <div className="min-h-screen">
      <Header title="Cursos e Vestibulares" subtitle="Preparação para vestibulares e cursos extras" />

      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Cursos Ativos</CardTitle>
              <Award className="w-5 h-5 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">8</div>
              <p className="text-xs text-muted-foreground mt-2">Cursos preparatórios</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Alunos Inscritos</CardTitle>
              <Users className="w-5 h-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">234</div>
              <p className="text-xs text-muted-foreground mt-2">Participantes ativos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Próximos Vestibulares</CardTitle>
              <Calendar className="w-5 h-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">5</div>
              <p className="text-xs text-muted-foreground mt-2">Nos próximos 3 meses</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sistema de Cursos e Vestibulares</CardTitle>
            <CardDescription>
              O módulo completo está em desenvolvimento e incluirá gestão de cursos preparatórios, simulados, calendário
              de vestibulares e acompanhamento de desempenho.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  )
}
