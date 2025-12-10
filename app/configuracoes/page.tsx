"use client"

import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Settings, Shield, Database } from "lucide-react"

export default function ConfiguracoesPage() {
  return (
    <div className="min-h-screen">
      <Header title="Configurações" subtitle="Configurações do sistema" />

      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Sistema</CardTitle>
              <Settings className="w-5 h-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Configurações gerais do sistema</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Segurança</CardTitle>
              <Shield className="w-5 h-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Permissões e controle de acesso</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Banco de Dados</CardTitle>
              <Database className="w-5 h-5 text-purple-500" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Backup e manutenção</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Painel de Configurações</CardTitle>
            <CardDescription>
              O módulo completo de configurações está em desenvolvimento e incluirá personalização do sistema,
              gerenciamento de usuários, permissões e backup automático.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  )
}
