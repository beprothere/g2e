"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Copy, Check, Users, TrendingUp } from "lucide-react";
import Link from "next/link";
import { QRCodeCanvas } from "qrcode.react";

export default function ReferralClientUI({ initialData }: { initialData: any }) {
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState(initialData.stats);
  const [referralTree, setReferralTree] = useState(initialData.referralTree);
  const referralLink = initialData.referralLink;

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`/api/referral/overview?t=${Date.now()}`, {
          cache: "no-store",
        });
        const json = await res.json();

        if (json.success) {
          const l1Sum = (json.referralTree || []).reduce((a: any, b: any) => a + (b.earnings || 0), 0);
          const l2Sum = (json.referralTree || []).reduce((acc: any, curr: any) => 
            acc + (curr.children || []).reduce((childSum: number, child: any) => childSum + (child.earnings || 0), 0), 0
          );

          setStats([
            {
              label: "Level 1 Referrals",
              value: String(json.stats.level1Count),
              earnings: `$${l1Sum.toFixed(2)}`,
              icon: "Users",
            },
            {
              label: "Level 2 Referrals",
              value: String(json.stats.level2Count),
              earnings: `$${l2Sum.toFixed(2)}`,
              icon: "TrendingUp",
            },
            {
              label: "Total Earnings",
              value: `$${Number(json.stats.totalWithdrawBalance).toFixed(2)}`,
              icon: "Users",
            },
          ]);

          const formattedTree = json.referralTree.map((l1: any) => ({
            ...l1,
            date: new Date(l1.date).toLocaleDateString(),
            earnings: Number(l1.earnings).toFixed(2),
            children: (l1.children || []).map((l2: any) => ({
              ...l2,
              date: new Date(l2.date).toLocaleDateString(),
              earnings: Number(l2.earnings).toFixed(2),
            }))
          }));
          
          setReferralTree(formattedTree);
        }
      } catch (e) {
        console.error("Polling error:", e);
      }
    };

    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareAction = (type: string) => {
    if (type === "tg") window.open(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}`, "_blank");
    if (type === "wa") window.open(`https://wa.me/?text=${encodeURIComponent(referralLink)}`, "_blank");
    if (type === "mail") window.location.href = `mailto:?subject=Join Glow2Earn&body=${encodeURIComponent(referralLink)}`;
    if (type === "other") {
      if (navigator.share) navigator.share({ title: "Glow2Earn", url: referralLink });
      else copyToClipboard();
    }
  };

  const iconMap: any = { Users, TrendingUp };

  return (
    <DashboardLayout>
      <div className="space-y-6 md:space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Your Referral Program</h1>
          <p className="text-foreground/70">Share your link and earn commissions</p>
        </div>

        <Card className="glass border-primary/20 p-4 sm:p-6 md:p-8">
          <h3 className="text-base sm:text-lg font-bold mb-4">Your Unique Referral Link</h3>
          <div className="space-y-4">
            <div className="bg-white p-3 rounded-xl shadow border border-gray-100 w-fit">
              <QRCodeCanvas value={referralLink} size={140} level="H" />
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={referralLink}
                readOnly
                className="flex-1 px-4 py-2 rounded-lg bg-muted/50 border border-border font-mono text-sm"
              />
              <Button onClick={copyToClipboard} className={copied ? "bg-accent" : "bg-primary"}>
                {copied ? <Check size={18} /> : <Copy size={18} />}
              </Button>
            </div>
          </div>
          {/* Social Buttons */}
          <div className="mt-6 pt-6 border-t border-border">
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => shareAction("tg")}>Telegram</Button>
              <Button size="sm" variant="outline" onClick={() => shareAction("wa")}>WhatsApp</Button>
              <Button size="sm" variant="outline" onClick={() => shareAction("mail")}>Email</Button>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.map((stat: any, i: number) => {
            const Icon = iconMap[stat.icon] || Users;
            return (
              <Card key={i} className="glass border-primary/20 p-4 sm:p-6">
                <Icon size={24} className="text-primary mb-3" />
                <p className="text-xs text-foreground/60">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-green-600 font-semibold">{stat.earnings} earned</p>
              </Card>
            );
          })}
        </div>

        <Card className="glass border-primary/20 p-4 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold">Your Referral Network</h3>
            <Button variant="outline" size="sm" asChild><Link href="/team">View All</Link></Button>
          </div>

          <div className="space-y-4">
            {referralTree.map((referral: any, i: number) => (
              <div key={i} className="space-y-4">
                <div className="bg-linear-to-r from-primary/10 to-transparent rounded-lg p-4 border border-primary/20">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">{referral.name}</p>
                      <p className="text-xs text-foreground/60">{referral.email}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs bg-primary/20 px-2 py-1 rounded">Level 1</span>
                      <p className="text-green-600 font-bold">${referral.earnings}</p>
                    </div>
                  </div>
                </div>

                {referral.children && referral.children.length > 0 && (
                  <div className="ml-6 border-l-2 border-primary/30 pl-4 space-y-2">
                    {referral.children.map((child: any, j: number) => (
                      <div key={j} className="bg-secondary/5 rounded-lg p-3 border border-secondary/20 flex justify-between">
                        <div>
                          <p className="font-semibold text-sm">{child.name}</p>
                          <p className="text-xs text-foreground/60">Joined: {child.date}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs bg-secondary/20 px-2 py-1 rounded">Level 2</span>
                          <p className="text-green-600 font-bold text-sm">${child.earnings}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}