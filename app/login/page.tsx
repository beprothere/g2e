import React, { Suspense } from 'react'
import Login from './Login'

const LoginPage = () => {
  return (
    <Suspense fallback={null}>
      <Login />
    </Suspense>
  )
}

export default LoginPage
