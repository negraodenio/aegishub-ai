import { EmployeeManagement } from "../../../features/rh-dashboard/components/EmployeeManagement";

export default function TeamPage() {
  return (
    <div className="p-8 md:p-12 min-h-screen bg-[#050505]">
      <div className="max-w-[1440px] mx-auto">
        <EmployeeManagement />
      </div>
    </div>
  );
}
