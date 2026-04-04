import AdminLoginForm from "@/app/components/AdminLoginForm"

export default function AdminLoginPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 overflow-hidden">
      
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center opacity-10 scale-105"
      />
      
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,_rgba(99,102,241,0.15)_0%,_transparent_70%)]" />

      <div className="relative z-10 w-full max-w-md p-4 animate-fadeInUp">
        <AdminLoginForm />
      </div>
    </div>
  )
}