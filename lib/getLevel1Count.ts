import User from "@/models/User";

export async function getVerifiedLevel1Count(user: any) {
  return User.countDocuments({
    referBy: user.referralCode,
    status: "Verified",
  });
}
