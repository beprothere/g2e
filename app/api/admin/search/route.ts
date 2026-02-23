import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Transaction from "@/models/Transaction";
import SerumOrder from "@/models/SerumOrder";
import InvestmentPlan from "@/models/InvestmentPlan";

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    if (!query || query.length < 2) return NextResponse.json([]);

    const searchRegex = { $regex: query, $options: "i" };
    const isObjectId = query.length === 24;

    const [users, transactions, serumOrders, investments] = await Promise.all([
      User.find({
        $or: [
          { name: searchRegex },
          { email: searchRegex },
          ...(isObjectId ? [{ _id: query }] : [])
        ]
      }).limit(3).select("name email avatar").lean(),

      isObjectId ? Transaction.find({ _id: query }).limit(2).lean() : [],

      SerumOrder.find({
        $or: [
          { serumName: searchRegex },
          { userEmail: searchRegex },
          { trackingNumber: searchRegex },
          ...(isObjectId ? [{ _id: query }] : [])
        ]
      }).limit(3).lean(),

      InvestmentPlan.find({
        $or: [
          { investorEmail: searchRegex },
          ...(isObjectId ? [{ _id: query }] : [])
        ]
      }).limit(3).lean()
    ]);

    const results = [
      ...users.map((u: any) => ({ 
        id: u._id, title: u.name, subTitle: u.email, type: "User", link: `/admin/users/${u._id}`, icon: "user" 
      })),
      ...transactions.map((t: any) => ({ 
        id: t._id, title: `TXN: ${t._id.toString().slice(-8)}`, subTitle: `Amount: $${t.amount}`, type: "Transaction", link: `/admin/wallets`, icon: "wallet" 
      })),
      ...serumOrders.map((s: any) => ({ 
        id: s._id, title: s.serumName, subTitle: `ID: ${s._id.toString().slice(-8)}`, type: "Serum Order", link: `/admin/serum-order`, icon: "package" 
      })),
      ...investments.map((i: any) => ({ 
        id: i._id, title: "Investment Plan", subTitle: i.investorEmail, type: "Investment", link: `/admin/investments`, icon: "trending" 
      }))
    ];

    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}