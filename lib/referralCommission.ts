import User from "@/models/User";
import Transaction from "@/models/Transaction";

function getLevel1Rate(balance: number) {
  if (balance >= 500) return 0.60;
  if (balance >= 200) return 0.50;
  if (balance >= 100) return 0.40;
  return 0.40;
}

export async function applyReferralCommission(earnerId: string) {
  const earner: any = await User.findById(earnerId);
  if (!earner || !earner.referBy) return;

  const depositAmount = earner.latestDepositAmount;
  if (!depositAmount || depositAmount <= 0) return;

  const level1User: any = await User.findOne({
    referralCode: earner.referBy,
  });
  if (!level1User) return;

  const level1Rate = getLevel1Rate(level1User.depositBalance || 0);
  const level1Amount = Number(
    (depositAmount * level1Rate).toFixed(2)
  );

  const l1Key = `L1-${earner._id}-${depositAmount}`;

  const l1Exists = await Transaction.findOne({ commissionKey: l1Key });
  if (!l1Exists) {
    level1User.withdrawBalance += level1Amount;
    await level1User.save();

    await Transaction.create({
      userId: level1User._id,
      type: "Level 1 Referral",
      amount: level1Amount,
      status: "Completed",
      from: earner.fullName,
      commissionKey: l1Key,
    });
  }

  if (!level1User.referBy) return;

  const mainUser: any = await User.findOne({
    referralCode: level1User.referBy,
  });
  if (!mainUser) return;

  const firstFive = await User.find({
    referBy: level1User.referralCode,
  })
    .sort({ createdAt: 1 })
    .limit(5);

  const eligible = firstFive.some(
    (u: any) => u._id.toString() === earner._id.toString()
  );
  if (!eligible) return;

  const level2Amount = Number(
    (depositAmount * 0.05).toFixed(2)
  );

  const l2Key = `L2-${earner._id}-${depositAmount}`;

  const l2Exists = await Transaction.findOne({ commissionKey: l2Key });
  if (!l2Exists) {
    mainUser.withdrawBalance += level2Amount;
    await mainUser.save();

    await Transaction.create({
      userId: mainUser._id,
      type: "Level 2 Referral",
      amount: level2Amount,
      status: "Completed",
      from: earner.fullName,
      commissionKey: l2Key,
    });
  }
}
