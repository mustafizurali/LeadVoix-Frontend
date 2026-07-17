import Sidebar from "./Sidebar";
import Header from "./Header";

interface DashboardLayoutProps {
  children?: React.ReactNode;
}

export default function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  return (
    <div className="flex h-screen bg-slate-100">
      <Sidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto p-6">
          {children ? (
            children
          ) : (
            <>
              <h1 className="text-3xl font-bold">
                LeadVoix Dashboard
              </h1>

              <p className="mt-2 text-gray-500">
                Welcome to LeadVoix OS 🚀
              </p>
            </>
          )}
        </main>
      </div>
    </div>
  );
}