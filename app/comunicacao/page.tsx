"use client"

import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, Send, Users } from "lucide-react"

export default function ComunicacaoPage() {
  return (
    <div className="min-h-screen">
      <Header title="Comunicação" subtitle="Central de comunicação com alunos e responsáveis" />

      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Mensagens Enviadas</CardTitle>
              <Send className="w-5 h-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">1,247</div>
              <p className="text-xs text-muted-foreground mt-2">Este mês</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Taxa de Leitura</CardTitle>
              <MessageSquare className="w-5 h-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">94%</div>
              <p className="text-xs text-muted-foreground mt-2">Mensagens lidas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Contatos Ativos</CardTitle>
              <Users className="w-5 h-5 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">2,468</div>
              <p className="text-xs text-muted-foreground mt-2">Responsáveis cadastrados</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sistema de Comunicação</CardTitle>
            <CardDescription>
              O módulo completo de comunicação está em desenvolvimento e incluirá envio de mensagens, notificações,
              avisos importantes e comunicados gerais.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  )
}
