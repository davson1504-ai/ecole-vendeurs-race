import { AdminShell } from '@/components/admin-nav';import { CourseForm } from '@/components/course-form';import { requireAdmin } from '@/lib/auth/authorization';
export default async function NewCourse(){await requireAdmin('/admin/formations/nouvelle');return <AdminShell><h1 className="text-4xl font-extrabold text-[#071b3a]">Nouvelle formation</h1><CourseForm/></AdminShell>}
