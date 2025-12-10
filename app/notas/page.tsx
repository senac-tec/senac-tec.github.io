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
import type { Enrollment, Student, Class } from "@/lib/types"

export default function NotasPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [filteredEnrollments, setFilteredEnrollments] = useState<Enrollment[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [editingEnrollment, setEditingEnrollment] = useState<Enrollment | null>(null)
  const [viewingEnrollment, setViewingEnrollment] = useState<Enrollment | null>(null)
  const [formData, setFormData] = useState({
    student_id: "",
    class_id: "",
    status: "active" as "active" | "completed" | "dropped",
    final_grade: "",
    attendance_rate: "",
  })

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    const filtered = enrollments.filter(
      (enrollment) =>
        enrollment.student?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        enrollment.class?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        enrollment.class?.grade.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredEnrollments(filtered)
  }, [searchTerm, enrollments])

  async function loadData() {
    try {
      const supabase = getSupabase()

      // Load enrollments with student and class info
      const { data: enrollmentsData, error: enrollmentsError } = await supabase
        .from("enrollments")
        .select(
          `
          *,
          student:students(*),
          class:classes(*, teacher:teachers(*))
        `,
        )
        .order("created_at", { ascending: false })

      if (enrollmentsError) throw enrollmentsError

      // Load all active students
      const { data: studentsData, error: studentsError } = await supabase
        .from("students")
        .select("*")
        .eq("status", "active")
        .order("name")

      if (studentsError) throw studentsError

      // Load all active classes
      const { data: classesData, error: classesError } = await supabase
        .from("classes")
        .select("*")
        .eq("status", "active")
        .order("name")

      if (classesError) throw classesError

      setEnrollments(enrollmentsData || [])
      setFilteredEnrollments(enrollmentsData || [])
      setStudents(studentsData || [])
      setClasses(classesData || [])
      setLoading(false)
    } catch (error) {
      console.error("[v0] Error loading data:", error)
      setLoading(false)
    }
  }

  function openCreateDialog() {
    setEditingEnrollment(null)
    setFormData({
      student_id: "",
      class_id: "",
      status: "active",
      final_grade: "",
      attendance_rate: "",
    })
    setIsDialogOpen(true)
  }

  function openEditDialog(enrollment: Enrollment) {
    setEditingEnrollment(enrollment)
    setFormData({
      student_id: enrollment.student_id,
      class_id: enrollment.class_id,
      status: enrollment.status,
      final_grade: enrollment.final_grade?.toString() || "",
      attendance_rate: enrollment.attendance_rate?.toString() || "",
    })
    setIsDialogOpen(true)
  }

  function openViewDialog(enrollment: Enrollment) {
    setViewingEnrollment(enrollment)
    setIsViewDialogOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    try {
      const supabase = getSupabase()

      const dataToSave = {
        student_id: formData.student_id,
        class_id: formData.class_id,
        status: formData.status,
        final_grade: formData.final_grade ? Number.parseFloat(formData.final_grade) : null,
        attendance_rate: formData.attendance_rate ? Number.parseFloat(formData.attendance_rate) : null,
      }

      if (editingEnrollment) {
        const { error } = await supabase
          .from("enrollments")
          .update({
            ...dataToSave,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingEnrollment.id)

        if (error) throw error
      } else {
        const { error } = await supabase.from("enrollments").insert([dataToSave])

        if (error) throw error
      }

      setIsDialogOpen(false)
      loadData()
    } catch (error) {
      console.error("[v0] Error saving enrollment:", error)
      alert("Erro ao salvar matrícula. Verifique os dados e tente novamente.")
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja excluir esta matrícula?")) return

    try {
      const supabase = getSupabase()
      const { error } = await supabase.from("enrollments").delete().eq("id", id)

      if (error) throw error
      loadData()
    } catch (error) {
      console.error("[v0] Error deleting enrollment:", error)
      alert("Erro ao excluir matrícula.")
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("pt-BR")
  }

  function getStatusBadge(status: string) {
    const colors = {
      active: "bg-green-100 text-green-800",
      completed: "bg-blue-100 text-blue-800",
      dropped: "bg-red-100 text-red-800",
    }
    const labels = {
      active: "Ativa",
      completed: "Concluída",
      dropped: "Cancelada",
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status as keyof typeof colors]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    )
  }

  function getGradeBadge(grade: number | null | undefined) {
    if (grade === null || grade === undefined) return <span className="text-muted-foreground">-</span>

    const color = grade >= 7 ? "text-green-600" : grade >= 5 ? "text-yellow-600" : "text-red-600"
    return <span className={`font-semibold ${color}`}>{grade.toFixed(1)}</span>
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando matrículas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header title="Notas e Matrículas" subtitle="Gerenciamento de matrículas e notas dos alunos" />

      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por aluno, turma ou série..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Button onClick={openCreateDialog}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Matrícula
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Aluno</TableHead>
                  <TableHead>Turma</TableHead>
                  <TableHead>Série</TableHead>
                  <TableHead>Nota Final</TableHead>
                  <TableHead>Frequência</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEnrollments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Nenhuma matrícula encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEnrollments.map((enrollment) => (
                    <TableRow key={enrollment.id}>
                      <TableCell className="font-medium">{enrollment.student?.name || "N/A"}</TableCell>
                      <TableCell>{enrollment.class?.name || "N/A"}</TableCell>
                      <TableCell>{enrollment.class?.grade || "N/A"}</TableCell>
                      <TableCell>{getGradeBadge(enrollment.final_grade)}</TableCell>
                      <TableCell>
                        {enrollment.attendance_rate ? `${enrollment.attendance_rate.toFixed(1)}%` : "-"}
                      </TableCell>
                      <TableCell>{getStatusBadge(enrollment.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openViewDialog(enrollment)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(enrollment)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(enrollment.id)}>
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
            <DialogTitle>{editingEnrollment ? "Editar Matrícula" : "Nova Matrícula"}</DialogTitle>
            <DialogDescription>
              {editingEnrollment ? "Atualize as informações da matrícula" : "Preencha os dados da nova matrícula"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div>
                <Label htmlFor="student_id">Aluno *</Label>
                <Select
                  value={formData.student_id}
                  onValueChange={(value) => setFormData({ ...formData, student_id: value })}
                  disabled={!!editingEnrollment}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um aluno" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.name} - {student.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="class_id">Turma *</Label>
                <Select
                  value={formData.class_id}
                  onValueChange={(value) => setFormData({ ...formData, class_id: value })}
                  disabled={!!editingEnrollment}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma turma" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name} - {cls.grade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="final_grade">Nota Final (0-10)</Label>
                <Input
                  id="final_grade"
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={formData.final_grade}
                  onChange={(e) => setFormData({ ...formData, final_grade: e.target.value })}
                  placeholder="Ex: 8.5"
                />
              </div>

              <div>
                <Label htmlFor="attendance_rate">Taxa de Frequência (%)</Label>
                <Input
                  id="attendance_rate"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={formData.attendance_rate}
                  onChange={(e) => setFormData({ ...formData, attendance_rate: e.target.value })}
                  placeholder="Ex: 95.5"
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
                    <SelectItem value="active">Ativa</SelectItem>
                    <SelectItem value="completed">Concluída</SelectItem>
                    <SelectItem value="dropped">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">{editingEnrollment ? "Atualizar" : "Criar"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Matrícula</DialogTitle>
          </DialogHeader>

          {viewingEnrollment && (
            <div className="grid grid-cols-2 gap-4 py-4">
              <div>
                <Label className="text-muted-foreground">Aluno</Label>
                <p className="font-medium">{viewingEnrollment.student?.name || "N/A"}</p>
              </div>

              <div>
                <Label className="text-muted-foreground">Email do Aluno</Label>
                <p className="font-medium">{viewingEnrollment.student?.email || "N/A"}</p>
              </div>

              <div>
                <Label className="text-muted-foreground">Turma</Label>
                <p className="font-medium">{viewingEnrollment.class?.name || "N/A"}</p>
              </div>

              <div>
                <Label className="text-muted-foreground">Série</Label>
                <p className="font-medium">{viewingEnrollment.class?.grade || "N/A"}</p>
              </div>

              <div>
                <Label className="text-muted-foreground">Professor</Label>
                <p className="font-medium">{viewingEnrollment.class?.teacher?.name || "Não atribuído"}</p>
              </div>

              <div>
                <Label className="text-muted-foreground">Turno</Label>
                <p className="font-medium">
                  {viewingEnrollment.class?.shift === "morning"
                    ? "Manhã"
                    : viewingEnrollment.class?.shift === "afternoon"
                      ? "Tarde"
                      : "Noite"}
                </p>
              </div>

              <div>
                <Label className="text-muted-foreground">Nota Final</Label>
                <div className="mt-1">{getGradeBadge(viewingEnrollment.final_grade)}</div>
              </div>

              <div>
                <Label className="text-muted-foreground">Taxa de Frequência</Label>
                <p className="font-medium">
                  {viewingEnrollment.attendance_rate ? `${viewingEnrollment.attendance_rate.toFixed(1)}%` : "-"}
                </p>
              </div>

              <div>
                <Label className="text-muted-foreground">Status</Label>
                <div className="mt-1">{getStatusBadge(viewingEnrollment.status)}</div>
              </div>

              <div>
                <Label className="text-muted-foreground">Data de Matrícula</Label>
                <p className="font-medium">{formatDate(viewingEnrollment.enrollment_date)}</p>
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
