import cron from "node-cron";
import User from "@/models/User";
import { connectDB } from "@/lib/db";

cron.schedule("0 0 * * *", async () => {
  await connectDB();
  const now = new Date();

  const users = await User.find({
    plan: { $ne: "Free" },
    hasClaimed: false,
    planEndDate: { $lte: now },
  });

  for (const user of users) {
    user.availableWithdraw += user.planPrice;
    user.plan = "Free";
    user.planPrice = 0;
    user.commissionRate = 30;
    user.hasClaimed = true;
    user.planStatus = "Completed";
    await user.save();
  }
});
