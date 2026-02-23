import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Package, Truck, CheckCircle2, Clock } from "lucide-react"

export default function OrdersPage() {
  const orders = [
    {
      id: "ORD-2024-001",
      product: "Premium Serum",
      amount: "$20.00",
      date: "Dec 10, 2024",
      status: "Delivered",
      tracking: "SHP-2024-98765",
      steps: [
        { label: "Order Placed", completed: true, date: "Dec 10" },
        { label: "Processing", completed: true, date: "Dec 11" },
        { label: "Shipped", completed: true, date: "Dec 12" },
        { label: "Delivered", completed: true, date: "Dec 14" },
      ],
    },
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Delivered":
        return <CheckCircle2 size={20} className="text-accent" />
      case "Shipped":
        return <Truck size={20} className="text-secondary" />
      case "Processing":
        return <Package size={20} className="text-primary" />
      default:
        return <Clock size={20} className="text-foreground/60" />
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Orders & Shipments</h1>
          <p className="text-foreground/70">Track your serum delivery and past orders</p>
        </div>

        {orders.map((order, i) => (
          <Card key={i} className="glass border-primary/20 p-8">
            <div className="flex items-start justify-between mb-8 pb-6 border-b border-border">
              <div>
                <p className="text-sm text-foreground/60 mb-1">Order ID</p>
                <p className="font-mono font-semibold text-lg">{order.id}</p>
              </div>

              <div className="flex items-center gap-3">
                {getStatusIcon(order.status)}
                <div className="text-right">
                  <p className="text-sm text-foreground/60">Status</p>
                  <p className="font-bold text-lg">{order.status}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <p className="text-sm text-foreground/60 mb-2">Product</p>
                <p className="font-semibold text-lg mb-4">{order.product}</p>

                <p className="text-sm text-foreground/60 mb-2">Order Date</p>
                <p className="font-semibold">{order.date}</p>
              </div>

              <div>
                <p className="text-sm text-foreground/60 mb-2">Amount Paid</p>
                <p className="font-bold text-2xl text-primary mb-4">{order.amount}</p>

                <p className="text-sm text-foreground/60 mb-2">Tracking Number</p>
                <div className="flex items-center gap-2">
                  <p className="font-mono font-semibold">{order.tracking}</p>
                  <Button size="sm" variant="outline" className="bg-transparent">
                    Copy
                  </Button>
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm text-foreground/60 mb-6 font-semibold">Delivery Timeline</p>

              <div className="space-y-4">
                {order.steps.map((step, j) => (
                  <div key={j} className="flex items-center gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                          step.completed ? "bg-accent text-white" : "bg-muted text-foreground/60"
                        }`}
                      >
                        {step.completed ? "✓" : j + 1}
                      </div>
                      {j < order.steps.length - 1 && (
                        <div className={`w-1 h-8 my-1 ${step.completed ? "bg-accent" : "bg-muted"}`}></div>
                      )}
                    </div>

                    <div className="flex-1">
                      <p className={`font-semibold ${step.completed ? "text-foreground" : "text-foreground/60"}`}>
                        {step.label}
                      </p>
                      <p className="text-xs text-foreground/60">{step.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-border flex gap-3">
              <Button variant="outline" className="bg-transparent" asChild>
                View Receipt
              </Button>
              <Button variant="outline" className="bg-transparent" asChild>
                Contact Support
              </Button>
            </div>
          </Card>
        ))}

        <Card className="glass border-accent/20 bg-accent/5 p-6">
          <h3 className="font-bold mb-2">Delivery Information</h3>
          <p className="text-sm text-foreground/70 mb-3">
            Your serum is processed and shipped within 2-3 business days of order confirmation. Once shipped, you'll
            receive a tracking number via email.
          </p>
          <ul className="text-sm text-foreground/70 space-y-2 list-disc list-inside">
            <li>Standard shipping takes 3-5 business days</li>
            <li>You can track your package using the tracking number</li>
            <li>Items are shipped securely in discrete packaging</li>
            <li>30-day money-back guarantee if you're not satisfied</li>
          </ul>
        </Card>
      </div>
    </DashboardLayout>
  )
}
