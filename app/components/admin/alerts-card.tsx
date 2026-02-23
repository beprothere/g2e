'use client'

import React from "react"

import { AlertCircle, TrendingUp, Zap } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Alert {
  id: string
  title: string
  description: string
  type: 'warning' | 'critical' | 'info'
  icon: React.ReactNode
  timestamp: string
}

export function AlertsCard() {
  const alerts: Alert[] = [
    {
      id: '1',
      title: 'Duplicate IP Detected',
      description: '5 signups from same IP address in last 2 hours',
      type: 'critical',
      icon: <AlertCircle className="h-4 w-4" />,
      timestamp: '5 min ago',
    },
    {
      id: '2',
      title: 'Large Withdrawal Request',
      description: 'User requested $50,000 withdrawal - needs approval',
      type: 'warning',
      icon: <TrendingUp className="h-4 w-4 rotate-180" />,
      timestamp: '12 min ago',
    },
    {
      id: '3',
      title: 'Suspicious Referral Chain',
      description: '3 consecutive users from same device - potential fraud',
      type: 'critical',
      icon: <Zap className="h-4 w-4" />,
      timestamp: '25 min ago',
    },
    {
      id: '4',
      title: 'Payment Gateway Issue',
      description: 'JazzCash API responding with delays',
      type: 'warning',
      icon: <AlertCircle className="h-4 w-4" />,
      timestamp: '1 hour ago',
    },
  ]

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'critical':
        return 'bg-destructive/10 text-destructive'
      case 'warning':
        return 'bg-accent/10 text-accent'
      default:
        return 'bg-primary/10 text-primary'
    }
  }

  return (
    <Card className="p-6 rounded-2xl">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-foreground">Critical Alerts</h2>
        <p className="text-sm text-muted-foreground mt-1">Recent system and security alerts</p>
      </div>

      <div className="space-y-4">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className="p-4 rounded-lg border border-border hover:border-primary/50 transition-colors cursor-pointer"
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${getBadgeColor(alert.type)}`}>
                {alert.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-foreground text-sm">{alert.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{alert.description}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-xs shrink-0 ${
                      alert.type === 'critical'
                        ? 'border-destructive/20 bg-destructive/5 text-destructive'
                        : 'border-accent/20 bg-accent/5 text-accent'
                    }`}
                  >
                    {alert.type}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-2">{alert.timestamp}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button className="w-full mt-4 py-2 text-sm font-medium text-primary hover:bg-primary/5 rounded-lg transition-colors">
        View All Alerts
      </button>
    </Card>
  )
}
