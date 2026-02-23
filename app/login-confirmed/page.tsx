import React, { Suspense } from "react";
import LoginConfirmed from "./LoginConifrm";

const LoginConfirmPage = () => {
  return (
    <Suspense fallback={"laoding..."}>
      <LoginConfirmed />
    </Suspense>
  );
};

export default LoginConfirmPage;
