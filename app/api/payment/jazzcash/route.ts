import PaymentSession from "@/lib/models/PaymentSession"
import crypto from "crypto"
import { connectDB } from "@/lib/db"

export async function POST(req: Request) {
  await connectDB()
  const { sessionId } = await req.json()

  const session = await PaymentSession.findById(sessionId)

  const data = {
    pp_MerchantID: process.env.JAZZCASH_MERCHANT_ID!,
    pp_Password: process.env.JAZZCASH_PASSWORD!,
    pp_TxnAmount: "2000",
    pp_TxnCurrency: "PKR",
    pp_TxnRefNo: `TXN_${sessionId}`,
    pp_ReturnURL: process.env.JAZZCASH_RETURN_URL!,
  }

  const sorted = Object.keys(data)
    .sort()
    .map(k => `${k}=${data[k as keyof typeof data]}`)
    .join("&")

  const secureHash = crypto
    .createHmac("sha256", process.env.JAZZCASH_INTEGRITY_SALT!)
    .update(sorted)
    .digest("hex")

  return Response.json({ ...data, pp_SecureHash: secureHash })
}
