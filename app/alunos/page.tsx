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
import type { Student } from "@/lib/types"

export default function AlunosPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    cpf: "",
    birth_date: "",
    phone: "",
    address: "",
    status: "active" as "active" | "inactive" | "graduated",
  })

  useEffect(() => {
    loadStudents()
  }, [])

  useEffect(() => {
    const filtered = students.filter(
      (student) =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.cpf.includes(searchTerm),
    )
    setFilteredStudents(filtered)
  }, [searchTerm, students])

  async function loadStudents() {
    try {
      const supabase = getSupabase()
      const { data, error } = await supabase.from("students").select("*").order("created_at", { ascending: false })

      if (error) throw error
      setStudents(data || [])
      setFilteredStudents(data || [])
      setLoading(false)
    } catch (error) {
      console.error("[v0] Error loading students:", error)
      setLoading(false)
    }
  }

  function openCreateDialog() {
    setEditingStudent(null)
    setFormData({
      name: "",
      email: "",
      cpf: "",
      birth_date: "",
      phone: "",
      address: "",
      status: "active",
    })
    setIsDialogOpen(true)
  }

  function openEditDialog(student: Student) {
    setEditingStudent(student)
    setFormData({
      name: student.name,
      email: student.email,
      cpf: student.cpf,
      birth_date: student.birth_date,
      phone: student.phone || "",
      address: student.address || "",
      status: student.status,
    })
    setIsDialogOpen(true)
  }

  function openViewDialog(student: Student) {
    setViewingStudent(student)
    setIsViewDialogOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    try {
      const supabase = getSupabase()

      if (editingStudent) {
        const { error } = await supabase
          .from("students")
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingStudent.id)

        if (error) throw error
      } else {
        const { error } = await supabase.from("students").insert([formData])

        if (error) throw error
      }

      setIsDialogOpen(false)
      loadStudents()
    } catch (error) {
      console.error("[v0] Error saving student:", error)
      alert("Erro ao salvar aluno. Verifique os dados e tente novamente.")
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja excluir este aluno?")) return

    try {
      const supabase = getSupabase()
      const { error } = await supabase.from("students").delete().eq("id", id)

      if (error) throw error
      loadStudents()
    } catch (error) {
      console.error("[v0] Error deleting student:", error)
      alert("Erro ao excluir aluno.")
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("pt-BR")
  }

  function getStatusBadge(status: string) {
    const colors = {
      active: "bg-green-100 text-green-800",
      inactive: "bg-gray-100 text-gray-800",
      graduated: "bg-blue-100 text-blue-800",
    }
    const labels = {
      active: "Ativo",
      inactive: "Inativo",
      graduated: "Formado",
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
          <p className="text-muted-foreground">Carregando alunos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header title="Alunos" subtitle="Gerenciamento de alunos matriculados" />

      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, email ou CPF..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Button onClick={openCreateDialog}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Aluno
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
                  <TableHead>Data de Nascimento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Nenhum aluno encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>{student.cpf}</TableCell>
                      <TableCell>{formatDate(student.birth_date)}</TableCell>
                      <TableCell>{getStatusBadge(student.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openViewDialog(student)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(student)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(student.id)}>
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
            <DialogTitle>{editingStudent ? "Editar Aluno" : "Novo Aluno"}</DialogTitle>
            <DialogDescription>
              {editingStudent ? "Atualize as informações do aluno" : "Preencha os dados do novo aluno"}
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
                <Label htmlFor="birth_date">Data de Nascimento *</Label>
                <Input
                  id="birth_date"
                  type="date"
                  value={formData.birth_date}
                  onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
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

              <div className="col-span-2">
                <Label htmlFor="address">Endereço</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <div>
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
                    <SelectItem value="graduated">Formado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">{editingStudent ? "Atualizar" : "Criar"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Aluno</DialogTitle>
          </DialogHeader>

          {viewingStudent && (
            <div className="grid grid-cols-2 gap-4 py-4">
              <div>
                <Label className="text-muted-foreground">Nome Completo</Label>
                <p className="font-medium">{viewingStudent.name}</p>
              </div>

              <div>
                <Label className="text-muted-foreground">Email</Label>
                <p className="font-medium">{viewingStudent.email}</p>
              </div>

              <div>
                <Label className="text-muted-foreground">CPF</Label>
                <p className="font-medium">{viewingStudent.cpf}</p>
              </div>

              <div>
                <Label className="text-muted-foreground">Data de Nascimento</Label>
                <p className="font-medium">{formatDate(viewingStudent.birth_date)}</p>
              </div>

              <div>
                <Label className="text-muted-foreground">Telefone</Label>
                <p className="font-medium">{viewingStudent.phone || "Não informado"}</p>
              </div>

              <div>
                <Label className="text-muted-foreground">Status</Label>
                <div className="mt-1">{getStatusBadge(viewingStudent.status)}</div>
              </div>

              <div className="col-span-2">
                <Label className="text-muted-foreground">Endereço</Label>
                <p className="font-medium">{viewingStudent.address || "Não informado"}</p>
              </div>

              <div>
                <Label className="text-muted-foreground">Data de Matrícula</Label>
                <p className="font-medium">{formatDate(viewingStudent.enrollment_date)}</p>
              </div>

              <div>
                <Label className="text-muted-foreground">Cadastrado em</Label>
                <p className="font-medium">{formatDate(viewingStudent.created_at)}</p>
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
