"use client"

import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Users, Clock } from "lucide-react"

export default function BibliotecaPage() {
  return (
    <div className="min-h-screen">
      <Header title="Biblioteca" subtitle="Gerenciamento do acervo e empréstimos" />

      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total de Livros</CardTitle>
              <BookOpen className="w-5 h-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">2,847</div>
              <p className="text-xs text-muted-foreground mt-2">Livros no acervo</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Empréstimos Ativos</CardTitle>
              <Users className="w-5 h-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">156</div>
              <p className="text-xs text-muted-foreground mt-2">Livros emprestados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Devoluções Pendentes</CardTitle>
              <Clock className="w-5 h-5 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">12</div>
              <p className="text-xs text-muted-foreground mt-2">Livros com atraso</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sistema de Biblioteca</CardTitle>
            <CardDescription>
              O módulo completo de biblioteca está em desenvolvimento e incluirá cadastro de livros, controle de
              empréstimos, reservas e histórico de leituras.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  )
}
