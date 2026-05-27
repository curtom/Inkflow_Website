import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type DashboardChartPoint = {
  day: number;
  label: string;
  viewsCount: number;
};

type Props = {
  data: DashboardChartPoint[];
};

export default function ViewsLineChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="rounded-2xl border border-border-cream bg-ivory p-6 text-sm text-stone shadow-whisper">
        No daily view data yet.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border-cream bg-ivory p-4 shadow-whisper">
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 12, right: 16, left: 6, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="4 4" stroke="#e8e6dc" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12, fill: "#87867f" }}
              tickLine={false}
              axisLine={{ stroke: "#e8e6dc" }}
              minTickGap={16}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "#87867f" }}
              tickLine={false}
              axisLine={{ stroke: "#e8e6dc" }}
              allowDecimals={false}
              width={38}
            />
            <Tooltip
              cursor={{ stroke: "#c96442", strokeWidth: 2, strokeOpacity: 0.35 }}
              contentStyle={{
                borderRadius: "0.75rem",
                borderColor: "#f0eee6",
                boxShadow: "0 8px 30px rgb(0 0 0 / 0.06)",
                background: "#faf9f5",
              }}
              labelStyle={{ color: "#141413", fontWeight: 600 }}
              formatter={(value) => {
                const numericValue = Array.isArray(value) ? value[0] ?? 0 : value ?? 0;
                return [`${numericValue} views`, "Views"];
              }}
            />
            <Line
              type="monotone"
              dataKey="viewsCount"
              stroke="#c96442"
              strokeWidth={3}
              dot={{ r: 3, stroke: "#c96442", fill: "#faf9f5", strokeWidth: 2 }}
              activeDot={{ r: 6, stroke: "#c96442", fill: "#faf9f5", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
