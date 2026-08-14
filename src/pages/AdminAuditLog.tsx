import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { getAuditLogs, type AuditLogEntry } from "@/api/auditLogApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PageHeader,
  DataTable,
  SearchInput,
  SkeletonTable,
  EmptyState,
  ErrorState,
  type TableColumn,
} from "@/components/shared";
import { spacing, cardVariants } from "@/lib/constants";
import { useDebouncedValue } from "@/hooks";

export default function AdminAuditLog() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);

  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["audit-logs", debouncedSearch],
    queryFn: () => getAuditLogs({ path: debouncedSearch || undefined, limit: 200 }),
  });

  const logs = data?.logs ?? [];

  const columns: TableColumn<AuditLogEntry>[] = [
    {
      key: "createdAt",
      label: t("date"),
      sortable: true,
      render: (v) =>
        new Date(v as string).toLocaleString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
    },
    {
      key: "actorName",
      label: t("adminActor", { defaultValue: "Admin" }),
      render: (v, row) => (v as string) || row.actorId,
    },
    {
      key: "method",
      label: t("method", { defaultValue: "Method" }),
      render: (v) => (
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
          {v as string}
        </span>
      ),
    },
    {
      key: "path",
      label: t("adminAuditPath", { defaultValue: "Path" }),
      render: (v) => (
        <span className="font-mono text-xs text-slate-500 dark:text-slate-400 block truncate max-w-[280px]" title={v as string}>
          {v as string}
        </span>
      ),
    },
    {
      key: "statusCode",
      label: t("adminAuditResult", { defaultValue: "Result" }),
      render: (v) => {
        const code = v as number;
        const ok = code >= 200 && code < 300;
        return (
          <span className={ok ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}>
            {code}
          </span>
        );
      },
    },
  ];

  return (
    <div className={`${spacing.pageContainer} space-y-6`}>
      <PageHeader
        title={t("adminAuditLog", { defaultValue: "Audit Log" })}
        subtitle={t("adminAuditLogSubtitle", {
          defaultValue: "Every create/update/delete action taken by an admin account.",
        })}
      />

      <Card className={`${cardVariants.default} border-0 shadow-none rounded-[2rem]`}>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <CardTitle className="text-lg font-semibold">
            {t("adminAuditLog", { defaultValue: "Audit Log" })}
          </CardTitle>
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder={t("adminAuditSearchPlaceholder", { defaultValue: "Filter by path…" })}
            className="w-full sm:w-64"
          />
        </CardHeader>
        <CardContent className={spacing.cardPadding}>
          {isLoading ? (
            <SkeletonTable columns={5} />
          ) : isError ? (
            <ErrorState onRetry={refetch} />
          ) : logs.length === 0 ? (
            <EmptyState description={t("adminAuditEmpty", { defaultValue: "No admin actions recorded yet." })} />
          ) : (
            <DataTable<AuditLogEntry> columns={columns} data={logs} pageSize={20} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
