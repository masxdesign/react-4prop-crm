import React from "react"
import { createFileRoute } from "@tanstack/react-router"
import { useAuth } from "@/components/Auth/Auth"
import PaymentSettings from "@/components/Magazine/PaymentSettings/PaymentSettings"

export const Route = createFileRoute("/_auth/_dashboard/mag/payment-settings")({
  beforeLoad: ({ context }) => {
    const auth = context.auth;

    // Prevent advertisers from accessing payment settings page
    if (auth?.isAdvertiser) {
      throw new Error('Advertisers cannot access payment settings')
    }
  },
  component: () => {
    const auth = useAuth()

    if (!auth.user.neg_id) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Invalid Agent ID
            </h2>
            <p className="text-gray-600">Agent ID is required.</p>
          </div>
        </div>
      )
    }

    return (
      <PaymentSettings />
    )
  },
})
