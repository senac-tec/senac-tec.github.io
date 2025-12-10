"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Edit, Trash2, Eye } from "lucide-react"
import { getSupabase } from "@/lib/supabase"
import type { Teacher } from "@/lib/types"

export default function ProfessoresPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null)
  const [viewingTeacher, setViewingTeacher] = useState<Teacher | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    cpf: "",
    phone: "",
    specialization: "",
    status: "active" as "active" | "inactive" | "on_leave",
  })

  useEffect(() => {
    loadTeachers()
  }, [])

  useEffect(() => {
    const filtered = teachers.filter(
      (teacher) =>
        teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.cpf.includes(searchTerm) ||
        (teacher.specialization && teacher.specialization.toLowerCase().includes(searchTerm.toLowerCase())),
    )
    setFilteredTeachers(filtered)
  }, [searchTerm, teachers])

  async function loadTeachers() {
    try {
      const supabase = getSupabase()
      const { data, error } = await supabase.from("teachers").select("*").order("created_at", { ascending: false })

      if (error) throw error
      setTeachers(data || [])
      setFilteredTeachers(data || [])
      setLoading(false)
    } catch (error) {
      console.error("[v0] Error loading teachers:", error)
      setLoading(false)
    }
  }

  function openCreateDialog() {
    setEditingTeacher(null)
    setFormData({
      name: "",
      email: "",
      cpf: "",
      phone: "",
      specialization: "",
      status: "active",
    })
    setIsDialogOpen(true)
  }

  function openEditDialog(teacher: Teacher) {
    setEditingTeacher(teacher)
    setFormData({
      name: teacher.name,
      email: teacher.email,
      cpf: teacher.cpf,
      phone: teacher.phone || "",
      specialization: teacher.specialization || "",
      status: teacher.status,
    })
    setIsDialogOpen(true)
  }

  function openViewDialog(teacher: Teacher) {
    setViewingTeacher(teacher)
    setIsViewDialogOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    try {
      const supabase = getSupabase()

      if (editingTeacher) {
        const { error } = await supabase
          .from("teachers")
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingTeacher.id)

        if (error) throw error
      } else {
        const { error } = await supabase.from("teachers").insert([formData])

        if (error) throw error
      }

      setIsDialogOpen(false)
      loadTeachers()
    } catch (error) {
      console.error("[v0] Error saving teacher:", error)
      alert("Erro ao salvar professor. Verifique os dados e tente novamente.")
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja excluir este professor?")) return

    try {
      const supabase = getSupabase()
      const { error } = await supabase.from("teachers").delete().eq("id", id)

      if (error) throw error
      loadTeachers()
    } catch (error) {
      console.error("[v0] Error deleting teacher:", error)
      alert("Erro ao excluir professor.")
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("pt-BR")
  }

  function getStatusBadge(status: string) {
    const colors = {
      active: "bg-green-100 text-green-800",
      inactive: "bg-gray-100 text-gray-800",
      on_leave: "bg-yellow-100 text-yellow-800",
    }
    const labels = {
      active: "Ativo",
      inactive: "Inativo",
      on_leave: "Afastado",
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status as keyof typeof colors]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando professores...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header title="Professores" subtitle="Gerenciamento do corpo docente" />

      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, email, CPF ou especialização..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Button onClick={openCreateDialog}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Professor
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>Especialização</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTeachers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Nenhum professor encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTeachers.map((teacher) => (
                    <TableRow key={teacher.id}>
                      <TableCell className="font-medium">{teacher.name}</TableCell>
                      <TableCell>{teacher.email}</TableCell>
                      <TableCell>{teacher.cpf}</TableCell>
                      <TableCell>{teacher.specialization || "Não informado"}</TableCell>
                      <TableCell>{getStatusBadge(teacher.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openViewDialog(teacher)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(teacher)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(teacher.id)}>
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingTeacher ? "Editar Professor" : "Novo Professor"}</DialogTitle>
            <DialogDescription>
              {editingTeacher ? "Atualize as informações do professor" : "Preencha os dados do novo professor"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="col-span-2">
                <Label htmlFor="name">Nome Completo *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="cpf">CPF *</Label>
                <Input
                  id="cpf"
                  value={formData.cpf}
                  onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                  placeholder="000.000.000-00"
                  required
                />
              </div>

              <div>
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(00) 00000-0000"
                />
              </div>

              <div>
                <Label htmlFor="specialization">Especialização</Label>
                <Input
                  id="specialization"
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  placeholder="Ex: Matemática, Português..."
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                    <SelectItem value="on_leave">Afastado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">{editingTeacher ? "Atualizar" : "Criar"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Professor</DialogTitle>
          </DialogHeader>

          {viewingTeacher && (
            <div className="grid grid-cols-2 gap-4 py-4">
              <div>
                <Label className="text-muted-foreground">Nome Completo</Label>
                <p className="font-medium">{viewingTeacher.name}</p>
              </div>

              <div>
                <Label className="text-muted-foreground">Email</Label>
                <p className="font-medium">{viewingTeacher.email}</p>
              </div>

              <div>
                <Label className="text-muted-foreground">CPF</Label>
                <p className="font-medium">{viewingTeacher.cpf}</p>
              </div>

              <div>
                <Label className="text-muted-foreground">Telefone</Label>
                <p className="font-medium">{viewingTeacher.phone || "Não informado"}</p>
              </div>

              <div>
                <Label className="text-muted-foreground">Especialização</Label>
                <p className="font-medium">{viewingTeacher.specialization || "Não informado"}</p>
              </div>

              <div>
                <Label className="text-muted-foreground">Status</Label>
                <div className="mt-1">{getStatusBadge(viewingTeacher.status)}</div>
              </div>

              <div>
                <Label className="text-muted-foreground">Data de Contratação</Label>
                <p className="font-medium">{formatDate(viewingTeacher.hire_date)}</p>
              </div>

              <div>
                <Label className="text-muted-foreground">Cadastrado em</Label>
                <p className="font-medium">{formatDate(viewingTeacher.created_at)}</p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
