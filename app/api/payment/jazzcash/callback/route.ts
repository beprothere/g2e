import { connectDB } from "@/lib/db"
import PaymentSession from "@/lib/models/PaymentSession"
import User from "@/lib/models/User"
import { hashPassword } from "@/utils/hashPassword"
import { generateReferralCode } from "@/utils/generateReferral"
import crypto from "crypto"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  await connectDB()
  const body = await req.formData()

  const txnRef = body.get("pp_TxnRefNo") as string
  const sessionId = txnRef.replace("TXN_", "")

  const session = await PaymentSession.findById(sessionId)
  if (!session) return NextResponse.json({ error: "Invalid session" })

  let myCode = generateReferralCode()
  while (await User.findOne({ referralCode: myCode })) {
    myCode = generateReferralCode()
  }

  let referredBy = null
  if (session.referral) {
    const ref = await User.findOne({ referralCode: session.referral })
    if (ref) referredBy = ref._id
  }

  await User.create({
    fullName: session.fullName,
    email: session.email,
    password: await hashPassword(session.password),
    referralCode: myCode,
    referredBy,
    ipAddress: session.ipAddress,
    deviceFingerprint: session.deviceFingerprint,
    isPaid: true,
  })

  session.status = "success"
  await session.save()

  return NextResponse.redirect("https://yourdomain.com/success")
}
