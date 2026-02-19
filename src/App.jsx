import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { SignedOut, SignedIn, SignInButton, SignOutButton, UserButton } from '@clerk/clerk-react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <h1>wellcome to talent Iq</h1>

      <SignedOut>
        <SignInButton mode='modal' />
      </SignedOut>

      <SignedIn>
        <SignOutButton />
      </SignedIn>

      <UserButton />
    </>
  )
}

export default App
