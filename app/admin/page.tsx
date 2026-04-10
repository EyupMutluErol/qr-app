import AdminDashboard from "@/app/components/AdminDashboard"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const activeEventsCount = await prisma.event.count(); // etkinliklerin sayısı
  
  // etkinlik listesi
  const eventsList = await prisma.event.findMany({
    orderBy: { createdAt: 'desc' }
  })

  // yoklama listesi
  const attendancesList = await prisma.attendance.findMany({
    include: {
      participant: true,
      event: true
    },
    orderBy: { timestamp: 'desc' }
  })


  const uniqueRollCallsCount = new Set(attendancesList.map(a => a.eventId)).size;

  return (
    <AdminDashboard 
      activeEvents={activeEventsCount} // etkinlik sayısı
      totalAttendances={uniqueRollCallsCount} // yoklama sayısı
      events={eventsList} // etkinlikler
      attendances={attendancesList} // yoklama listesi
    />
  )
}