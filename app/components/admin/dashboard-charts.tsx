'use client'

import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { Card } from '@/components/ui/card'

export function DashboardCharts({ userGrowthData, revenueData }: any) {
  return (
    <div className="space-y-6">
      <Card className="p-6 rounded-2xl">
        <h2 className="text-lg font-semibold">User Growth</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Total and active users trend
        </p>

        <div className="mt-6 -mx-2">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={userGrowthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line dataKey="users" stroke="var(--color-primary)" />
              <Line dataKey="active" stroke="var(--color-secondary)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-6 rounded-2xl">
        <h2 className="text-lg font-semibold">Revenue Overview</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Weekly deposits, withdrawals, and commissions
        </p>

        <div className="mt-6 -mx-2">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="deposits" fill="var(--color-primary)" />
              <Bar dataKey="withdrawals" fill="var(--color-accent)" />
              <Bar dataKey="commissions" fill="var(--color-secondary)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

    </div>
  )
}
