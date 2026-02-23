import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import Payment from "@/lib/models/Payment"
import User from "@/lib/models/User"

export async function POST(req: Request) {
  await connectDB()
  const { id } = await req.json()

  const payment = await Payment.findById(id)
  if (!payment) {
    return NextResponse.json({ error: "Invalid payment" }, { status: 400 })
  }

  payment.status = "success"
  await payment.save()

  await User.findByIdAndUpdate(payment.userId, {
    isPaid: true,
  })

  return NextResponse.json({ success: true })
}
