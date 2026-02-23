import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import Payment from "@/lib/models/Payment"

export async function POST(req: Request) {
  await connectDB()
  const { userId, provider, phone } = await req.json()

  const payment = await Payment.create({
    userId,
    provider,
    phone,
    amount: 20,
    status: "pending",
  })

  return NextResponse.json({
    redirectUrl: `/payment-success?id=${payment._id}`,
  })
}
