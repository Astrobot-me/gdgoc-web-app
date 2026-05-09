"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";
import { AdminSectionCard } from "@/components/admin/admin-section-card";

export type BranchMetric = { branch: string; count: number };
export type TimeMetric = { date: string; count: number };
export type StatusMetric = { label: string; count: number };

type EventAnalyticsProps = {
  branchMetrics: BranchMetric[];
  issuedMetrics: TimeMetric[];
  statusMetrics: StatusMetric[];
  verifyMetrics: TimeMetric[];
};

const statusColors = ["#34a853", "#ea4335"];
const axisColor = "var(--color-muted-foreground)";
const tooltipStyles = {
  backgroundColor: "color-mix(in oklab, var(--color-card) 92%, transparent)",
  border: "1px solid var(--color-border)",
  borderRadius: "18px",
  boxShadow: "0 12px 32px rgba(15, 23, 42, 0.12)",
};

export function EventAnalytics({
  branchMetrics,
  issuedMetrics,
  statusMetrics,
  verifyMetrics,
}: EventAnalyticsProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <AdminSectionCard title="Certificates per branch" contentClassName="pt-0">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={branchMetrics} layout="vertical">
              <CartesianGrid horizontal={false} stroke="var(--color-border)" />
              <XAxis type="number" hide />
              <YAxis
                dataKey="branch"
                type="category"
                width={80}
                axisLine={false}
                tickLine={false}
                tick={{ fill: axisColor, fontSize: 12 }}
              />
              <Tooltip
                cursor={{ fill: "var(--color-muted)", opacity: 0.4 }}
                contentStyle={tooltipStyles}
              />
              <Bar dataKey="count" fill="#4285f4" radius={[6, 6, 6, 6]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </AdminSectionCard>

      <AdminSectionCard title="Certificates issued over time" contentClassName="pt-0">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={issuedMetrics}>
              <CartesianGrid stroke="var(--color-border)" vertical={false} />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: axisColor, fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: axisColor, fontSize: 12 }}
              />
              <Tooltip contentStyle={tooltipStyles} />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#4285f4"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </AdminSectionCard>

      <AdminSectionCard title="Status breakdown" contentClassName="pt-0">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusMetrics}
                dataKey="count"
                nameKey="label"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={4}
              >
                {statusMetrics.map((entry, index) => (
                  <Cell
                    key={entry.label}
                    fill={statusColors[index % statusColors.length]}
                  />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyles} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </AdminSectionCard>

      <AdminSectionCard title="Verification activity (30 days)" contentClassName="pt-0">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={verifyMetrics}>
              <CartesianGrid stroke="var(--color-border)" vertical={false} />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: axisColor, fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: axisColor, fontSize: 12 }}
              />
              <Tooltip contentStyle={tooltipStyles} />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#34a853"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </AdminSectionCard>
    </div>
  );
}
