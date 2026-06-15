"use client";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface DayRow { day: string; scheduled: number; completed: number }

export default function WeekBarChart({
  data, scheduledLabel, completedLabel,
}: { data: DayRow[]; scheduledLabel: string; completedLabel: string }) {
  return (
    <div className="mt-2 h-44 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="day" stroke="#64748b" fontSize={12} />
          <YAxis allowDecimals={false} stroke="#64748b" fontSize={12} />
          <Tooltip />
          <Bar dataKey="scheduled" name={scheduledLabel} fill="#cbd5e1" radius={[4, 4, 0, 0]} />
          <Bar dataKey="completed" name={completedLabel} fill="#10B981" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
