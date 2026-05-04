import { useTranslation } from "react-i18next";

// Teacher subscription request approval is no longer needed.
// Payments are now automatically processed via Paymob webhook.
// This component is kept as a placeholder.

export default function TeacherDashboard() {
  const { t } = useTranslation();
  return (
    <div className="p-6 text-center">
      <h1 className="text-2xl font-bold mb-2">{t("teacherDashboardTitle")}</h1>
      <p className="text-slate-500">{t("teacherDashboardSubtitle")}</p>
    </div>
  );
}
