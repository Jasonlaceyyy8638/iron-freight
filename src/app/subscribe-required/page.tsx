'use client'

import Link from 'next/link'
import { Logo } from '@/components/Logo'

export default function SubscribeRequiredPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-iron-950 px-4">
      <Link href="/" className="mb-8">
        <Logo className="h-10 text-iron-100" />
      </Link>
      <div className="w-full max-w-md rounded-xl border border-iron-700 bg-iron-900 p-8 text-center">
        <h1 className="font-display text-xl font-bold text-iron-100">Subscription required</h1>
        <p className="mt-3 text-body-md text-iron-400">
          Your 7-day free trial has ended. To keep using IronFreight, choose a plan below. You’ll lose access to the dashboard until your subscription is active.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <Link
            href="/login"
            className="rounded-lg bg-primary py-3 text-center font-medium text-black hover:opacity-95"
          >
            Go to login and choose a plan
          </Link>
          <Link href="/" className="text-body-sm text-iron-500 hover:text-iron-300">
            Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
