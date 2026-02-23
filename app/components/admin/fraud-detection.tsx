'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, UserX, Eye, Loader2, SearchX } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getBlockedUsers } from '@/app/actions/get-blocked-users'
import Link from 'next/link'

interface BlockedUser {
  _id: string
  fullName: string
  email: string
  avatar: string
  status: string
  createdAt: string
}

export function FraudDetection() {
  const [users, setUsers] = useState<BlockedUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await getBlockedUsers()
        if (response.success) {
          setUsers(response.data ?? [])
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <Card className="space-y-6 px-6 py-10">
      <div className="flex flex-col gap-1 px-1">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <AlertTriangle className="h-6 w-6 text-destructive" />
          Blocked Users
        </h2>
        <p className="text-sm text-muted-foreground">
          Accounts blocked due to suspicious activity patterns.
        </p>
      </div>

      <div className="min-h-75 flex flex-col justify-start">
        {loading ? (
          <div className="w-full flex flex-col items-center justify-center py-20 bg-muted/5 rounded-2xl border border-dashed border-border">
            <Loader2 className="h-10 w-10 animate-spin text-destructive mb-3" />
            <p className="text-sm text-muted-foreground font-medium">Scanning Database...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="w-full flex flex-col items-center justify-center py-20 bg-muted/5 rounded-2xl border border-dashed border-border text-center px-4">
            <div className="bg-muted p-4 rounded-full mb-4">
              <SearchX className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">No Blocked Users</h3>
            <p className="text-sm text-muted-foreground max-w-62.5 mt-1">
              Hooray! Currently, there are no accounts flagged as blocked in your system.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-4">
            {users.map((user) => (
              <Card key={user._id} className="overflow-hidden flex flex-col justify-between border-destructive/10 hover:border-destructive/30 transition-all shadow-sm hover:shadow-md bg-card">
                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <Avatar className="h-12 w-12 border border-border">
                      <AvatarImage src={user.avatar} alt={user.fullName} />
                      <AvatarFallback className="bg-destructive/10 text-destructive font-bold">
                        {user.fullName?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <Badge variant="destructive" className="text-[10px] font-bold px-2 py-0.5">
                      {user.status}
                    </Badge>
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-bold text-base truncate text-foreground">
                      {user.fullName}
                    </h3>
                    <p className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>

                  <div className="mt-4 pt-4 border-t border-border/40 flex items-center justify-between text-[10px] text-muted-foreground uppercase tracking-widest">
                    <span>Detected At</span>
                    <span className="font-semibold text-foreground/80">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="px-4 pb-4">
                  <Button asChild variant="outline" size="sm" className="w-full gap-2 rounded-xl text-xs font-semibold hover:bg-destructive hover:text-white transition-all">
                    <Link href={`/admin/users/${user._id}`}>
                      <Eye className="h-3.5 w-3.5" />
                      View User Profile
                    </Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 rounded-2xl border border-border bg-muted/20 flex items-start gap-3">
        <UserX className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-[11px] font-semibold text-foreground uppercase tracking-wider">System Security Policy</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Automatic blocks occur after multiple failed verification attempts or VPN detection.
          </p>
        </div>
      </div>
    </Card>
  )
}
