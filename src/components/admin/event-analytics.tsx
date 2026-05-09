"use client";

import {
  Bar,
  BarChart,
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

export function EventAnalytics({
  branchMetrics,
  issuedMetrics,
  statusMetrics,
  verifyMetrics,
}: EventAnalyticsProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-3xl border border-muted/50 bg-white/80 p-6 shadow-sm">
        <h3 className="font-heading text-lg text-foreground">
          Certificates per branch
        </h3>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={branchMetrics} layout="vertical">
              <XAxis type="number" hide />
              <YAxis dataKey="branch" type="category" width={80} />
              <Tooltip />
              <Bar dataKey="count" fill="#4285f4" radius={[6, 6, 6, 6]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-3xl border border-muted/50 bg-white/80 p-6 shadow-sm">
        <h3 className="font-heading text-lg text-foreground">
          Certificates issued over time
        </h3>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={issuedMetrics}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
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
      </div>

      <div className="rounded-3xl border border-muted/50 bg-white/80 p-6 shadow-sm">
        <h3 className="font-heading text-lg text-foreground">
          Status breakdown
        </h3>
        <div className="mt-4 h-64">
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
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-3xl border border-muted/50 bg-white/80 p-6 shadow-sm">
        <h3 className="font-heading text-lg text-foreground">
          Verification activity (30 days)
        </h3>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={verifyMetrics}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
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
      </div>
    </div>
  );
}
