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
import type { Class, Teacher } from "@/lib/types"

export default function TurmasPage() {
  const [classes, setClasses] = useState<Class[]>([])
  const [filteredClasses, setFilteredClasses] = useState<Class[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [editingClass, setEditingClass] = useState<Class | null>(null)
  const [viewingClass, setViewingClass] = useState<Class | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    grade: "",
    shift: "morning" as "morning" | "afternoon" | "evening",
    teacher_id: "0", // Updated default value to be a non-empty string
    capacity: 30,
    year: new Date().getFullYear(),
    status: "active" as "active" | "inactive" | "completed",
  })

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    const filtered = classes.filter(
      (cls) =>
        cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cls.grade.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cls.teacher?.name && cls.teacher.name.toLowerCase().includes(searchTerm.toLowerCase())),
    )
    setFilteredClasses(filtered)
  }, [searchTerm, classes])

  async function loadData() {
    try {
      const supabase = getSupabase()

      // Load classes with teacher info
      const { data: classesData, error: classesError } = await supabase
        .from("classes")
        .select(
          `
          *,
          teacher:teachers(*)
        `,
        )
        .order("created_at", { ascending: false })

      if (classesError) throw classesError

      // Load all active teachers for the dropdown
      const { data: teachersData, error: teachersError } = await supabase
        .from("teachers")
        .select("*")
        .eq("status", "active")
        .order("name")

      if (teachersError) throw teachersError

      setClasses(classesData || [])
      setFilteredClasses(classesData || [])
      setTeachers(teachersData || [])
      setLoading(false)
    } catch (error) {
      console.error("[v0] Error loading data:", error)
      setLoading(false)
    }
  }

  function openCreateDialog() {
    setEditingClass(null)
    setFormData({
      name: "",
      grade: "",
      shift: "morning",
      teacher_id: "0", // Updated default value to be a non-empty string
      capacity: 30,
      year: new Date().getFullYear(),
      status: "active",
    })
    setIsDialogOpen(true)
  }

  function openEditDialog(cls: Class) {
    setEditingClass(cls)
    setFormData({
      name: cls.name,
      grade: cls.grade,
      shift: cls.shift,
      teacher_id: cls.teacher_id || "0", // Updated default value to be a non-empty string
      capacity: cls.capacity,
      year: cls.year,
      status: cls.status,
    })
    setIsDialogOpen(true)
  }

  function openViewDialog(cls: Class) {
    setViewingClass(cls)
    setIsViewDialogOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    try {
      const supabase = getSupabase()

      const dataToSave = {
        ...formData,
        teacher_id: formData.teacher_id || null,
      }

      if (editingClass) {
        const { error } = await supabase
          .from("classes")
          .update({
            ...dataToSave,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingClass.id)

        if (error) throw error
      } else {
        const { error } = await supabase.from("classes").insert([dataToSave])

        if (error) throw error
      }

      setIsDialogOpen(false)
      loadData()
    } catch (error) {
      console.error("[v0] Error saving class:", error)
      alert("Erro ao salvar turma. Verifique os dados e tente novamente.")
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja excluir esta turma?")) return

    try {
      const supabase = getSupabase()
      const { error } = await supabase.from("classes").delete().eq("id", id)

      if (error) throw error
      loadData()
    } catch (error) {
      console.error("[v0] Error deleting class:", error)
      alert("Erro ao excluir turma.")
    }
  }

  function getShiftLabel(shift: string) {
    const labels = {
      morning: "Manhã",
      afternoon: "Tarde",
      evening: "Noite",
    }
    return labels[shift as keyof typeof labels]
  }

  function getStatusBadge(status: string) {
    const colors = {
      active: "bg-green-100 text-green-800",
      inactive: "bg-gray-100 text-gray-800",
      completed: "bg-blue-100 text-blue-800",
    }
    const labels = {
      active: "Ativa",
      inactive: "Inativa",
      completed: "Concluída",
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
          <p className="text-muted-foreground">Carregando turmas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header title="Turmas" subtitle="Gerenciamento de turmas e classes" />

      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, série ou professor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Button onClick={openCreateDialog}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Turma
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Série</TableHead>
                  <TableHead>Turno</TableHead>
                  <TableHead>Professor</TableHead>
                  <TableHead>Capacidade</TableHead>
                  <TableHead>Ano</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClasses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Nenhuma turma encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredClasses.map((cls) => (
                    <TableRow key={cls.id}>
                      <TableCell className="font-medium">{cls.name}</TableCell>
                      <TableCell>{cls.grade}</TableCell>
                      <TableCell>{getShiftLabel(cls.shift)}</TableCell>
                      <TableCell>{cls.teacher?.name || "Não atribuído"}</TableCell>
                      <TableCell>{cls.capacity} alunos</TableCell>
                      <TableCell>{cls.year}</TableCell>
                      <TableCell>{getStatusBadge(cls.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openViewDialog(cls)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(cls)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(cls.id)}>
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
            <DialogTitle>{editingClass ? "Editar Turma" : "Nova Turma"}</DialogTitle>
            <DialogDescription>
              {editingClass ? "Atualize as informações da turma" : "Preencha os dados da nova turma"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="col-span-2">
                <Label htmlFor="name">Nome da Turma *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: 9º Ano A"
                  required
                />
              </div>

              <div>
                <Label htmlFor="grade">Série *</Label>
                <Input
                  id="grade"
                  value={formData.grade}
                  onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                  placeholder="Ex: 9º Ano"
                  required
                />
              </div>

              <div>
                <Label htmlFor="shift">Turno *</Label>
                <Select
                  value={formData.shift}
                  onValueChange={(value: any) => setFormData({ ...formData, shift: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">Manhã</SelectItem>
                    <SelectItem value="afternoon">Tarde</SelectItem>
                    <SelectItem value="evening">Noite</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="teacher_id">Professor Responsável</Label>
                <Select
                  value={formData.teacher_id}
                  onValueChange={(value) => setFormData({ ...formData, teacher_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um professor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Nenhum</SelectItem> {/* Updated value to be a non-empty string */}
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.name} - {teacher.specialization}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="capacity">Capacidade *</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: Number.parseInt(e.target.value) })}
                  min="1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="year">Ano *</Label>
                <Input
                  id="year"
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: Number.parseInt(e.target.value) })}
                  min="2020"
                  max="2030"
                  required
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
                    <SelectItem value="active">Ativa</SelectItem>
                    <SelectItem value="inactive">Inativa</SelectItem>
                    <SelectItem value="completed">Concluída</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">{editingClass ? "Atualizar" : "Criar"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Turma</DialogTitle>
          </DialogHeader>

          {viewingClass && (
            <div className="grid grid-cols-2 gap-4 py-4">
              <div>
                <Label className="text-muted-foreground">Nome da Turma</Label>
                <p className="font-medium">{viewingClass.name}</p>
              </div>

              <div>
                <Label className="text-muted-foreground">Série</Label>
                <p className="font-medium">{viewingClass.grade}</p>
              </div>

              <div>
                <Label className="text-muted-foreground">Turno</Label>
                <p className="font-medium">{getShiftLabel(viewingClass.shift)}</p>
              </div>

              <div>
                <Label className="text-muted-foreground">Professor Responsável</Label>
                <p className="font-medium">{viewingClass.teacher?.name || "Não atribuído"}</p>
              </div>

              <div>
                <Label className="text-muted-foreground">Capacidade</Label>
                <p className="font-medium">{viewingClass.capacity} alunos</p>
              </div>

              <div>
                <Label className="text-muted-foreground">Ano</Label>
                <p className="font-medium">{viewingClass.year}</p>
              </div>

              <div>
                <Label className="text-muted-foreground">Status</Label>
                <div className="mt-1">{getStatusBadge(viewingClass.status)}</div>
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
