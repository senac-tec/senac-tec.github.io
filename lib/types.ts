export interface Student {
  id: string
  name: string
  email: string
  cpf: string
  birth_date: string
  phone?: string
  address?: string
  enrollment_date: string
  status: "active" | "inactive" | "graduated"
  created_at: string
  updated_at: string
}

export interface Teacher {
  id: string
  name: string
  email: string
  cpf: string
  phone?: string
  specialization?: string
  hire_date: string
  status: "active" | "inactive" | "on_leave"
  created_at: string
  updated_at: string
}

export interface Class {
  id: string
  name: string
  grade: string
  shift: "morning" | "afternoon" | "evening"
  teacher_id?: string
  teacher?: Teacher
  capacity: number
  year: number
  status: "active" | "inactive" | "completed"
  created_at: string
  updated_at: string
}

export interface Enrollment {
  id: string
  student_id: string
  class_id: string
  student?: Student
  class?: Class
  enrollment_date: string
  status: "active" | "completed" | "dropped"
  final_grade?: number
  attendance_rate?: number
  created_at: string
  updated_at: string
}

export interface DashboardStats {
  totalStudents: number
  activeTeachers: number
  activeClasses: number
  approvalRate: number
  studentGrowth: number
  teacherGrowth: number
  classDistribution: string
  approvalGrowth: number
}

export interface RecentActivity {
  id: string
  type: "student" | "grade" | "class"
  title: string
  description: string
  time: string
}

export interface UpcomingEvent {
  id: string
  title: string
  description: string
  date: string
  day: number
  color: string
}
