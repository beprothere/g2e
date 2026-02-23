import { AlertTriangle, Shield, Lock, Eye } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { getSecurityStats } from '@/app/actions/security'

export async function SecurityStats() {
  const data = await getSecurityStats();

  const stats = [
    {
      title: 'Active Threats',
      value: data?.activeThreats || '0',
      icon: <AlertTriangle className="h-6 w-6 text-destructive" />,
      bgColor: 'bg-destructive/10',
      detail: `${data?.criticalThreats || 0} pending review`,
    },
    {
      title: 'Blocked Users',
      value: data?.blockedCount || '0',
      icon: <Lock className="h-6 w-6 text-accent" />,
      bgColor: 'bg-accent/10',
      detail: 'Total blocked',
    },
    {
      title: 'Duplicate IPs',
      value: data?.duplicateIPs || '0',
      icon: <Eye className="h-6 w-6 text-primary" />,
      bgColor: 'bg-primary/10',
      detail: 'Multiple accounts',
    },
    {
      title: 'Security Score',
      value: `${data?.securityScore || 100}%`,
      icon: <Shield className="h-6 w-6 text-secondary" />,
      bgColor: 'bg-secondary/10',
      detail: data?.scoreDetail || 'Excellent',
      detailColor: data?.scoreColor
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={index} className="p-6 rounded-2xl border-none shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium">{stat.title}</p>
              <p className="text-2xl font-bold text-foreground mt-2">{stat.value}</p>
              <p className={`text-xs mt-2 ${stat.detailColor ? stat.detailColor : 'text-muted-foreground'}`}>
                {stat.detail}
              </p>
            </div>
            <div className={`p-3 rounded-lg ${stat.bgColor}`}>
              {stat.icon}
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}