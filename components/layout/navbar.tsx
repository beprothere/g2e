import NavbarClient from "./NavbarClient";
import { serverApiFetch } from "@/lib/server-api";

export async function Navbar() {
  let user = null;

  try {
    const response = await serverApiFetch<{ user: any | null }>("/api/auth/me", {
      method: "GET",
      authCookie: "auth_token",
    });

    if (response.success && response.data?.user) {
      const userData = response.data.user;
      user = {
        fullName: userData.fullName,
        email: userData.email,
        avatar: userData.avatar,
      };
    }
  } catch (err) {
    console.error("Navbar SSR Error:", err);
  }

  return <NavbarClient user={user} />;
}
