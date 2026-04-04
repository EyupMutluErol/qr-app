import AdminDashboard from "@/app/components/AdminDashboard";
import {prisma} from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const activeEventsCount = await prisma.event.count();
  const totalAttendancesCount = await prisma.attendance.count();

  return <AdminDashboard activeEvents={activeEventsCount} totalAttendances={totalAttendancesCount} />
}