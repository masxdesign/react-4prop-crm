import React, { useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { useAuth } from "@/components/Auth/Auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Building2, CreditCard, Lock, FileText } from "lucide-react"
import AdvertiserOnboarding from "@/components/Magazine/stripe/AdvertiserOnboarding"
import SelfBillingAgreementDialog from "@/components/Magazine/dialogs/SelfBillingAgreementDialog"
import { useQuery } from "@tanstack/react-query"
import { getAdvertiserStripeStatus } from "@/components/Magazine/api"

export const Route = createFileRoute("/_auth/_dashboard/advertiser-profile")({
  beforeLoad: ({ context }) => {
    const auth = context.auth

    // Only advertisers can access this page
    if (!auth?.isAdvertiser) {
      throw new Error('This page is only accessible to advertisers')
    }
  },
  component: AdvertiserProfilePage,
})

function AdvertiserProfilePage() {
  const auth = useAuth()
  const [activeTab, setActiveTab] = useState("profile")
  const [agreementDialogOpen, setAgreementDialogOpen] = useState(false)

  // Fetch advertiser Stripe status
  const {
    data: stripeStatusData,
    isLoading: stripeStatusLoading
  } = useQuery({
    queryKey: ['advertiser-stripe-status', auth.user?.advertiser_id],
    queryFn: () => getAdvertiserStripeStatus(auth.user?.advertiser_id),
    enabled: !!auth.user?.advertiser_id
  })

  const stripeStatus = stripeStatusData?.data
  const hasStripeAccount = !!stripeStatus?.account_id
  const selfBillingAccepted = !!stripeStatus?.self_billing_accepted

  if (!auth.user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Unable to load user information. Please refresh the page.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600 mt-1">Manage your advertiser account settings</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">
            <Building2 className="h-4 w-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="onboarding">
            <CreditCard className="h-4 w-4 mr-2" />
            Payments
          </TabsTrigger>
          <TabsTrigger value="agreement">
            <FileText className="h-4 w-4 mr-2" />
            Agreement
          </TabsTrigger>
          <TabsTrigger value="password">
            <Lock className="h-4 w-4 mr-2" />
            Password
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <ProfileTab user={auth.user} />
        </TabsContent>

        <TabsContent value="onboarding" className="mt-6">
          <OnboardingTab
            advertiserId={auth.user.advertiser_id}
            hasStripeAccount={hasStripeAccount}
            stripeStatus={stripeStatus}
            isLoading={stripeStatusLoading}
          />
        </TabsContent>

        <TabsContent value="agreement" className="mt-6">
          <AgreementTab
            selfBillingAccepted={selfBillingAccepted}
            stripeStatus={stripeStatus}
            isLoading={stripeStatusLoading}
            advertiserId={auth.user.advertiser_id}
            advertiserName={auth.user.company?.name}
            dialogOpen={agreementDialogOpen}
            setDialogOpen={setAgreementDialogOpen}
          />
        </TabsContent>

        <TabsContent value="password" className="mt-6">
          <PasswordTab user={auth.user} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Profile Tab Component
function ProfileTab({ user }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>View your account details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Company Name</label>
            <p className="text-gray-900 mt-1">{user.company?.name || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <p className="text-gray-900 mt-1">{user.email}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">First Name</label>
            <p className="text-gray-900 mt-1">{user.first}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Last Name</label>
            <p className="text-gray-900 mt-1">{user.last}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">User ID</label>
            <p className="text-gray-900 mt-1">{user.id}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Role</label>
            <p className="text-gray-900 mt-1">Advertiser</p>
          </div>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            To update your profile information, please contact support.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}

// Onboarding Tab Component
function OnboardingTab({ advertiserId, hasStripeAccount, stripeStatus, isLoading }) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading payment settings...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Setup</CardTitle>
        <CardDescription>
          Connect your Stripe account to receive payments
        </CardDescription>
      </CardHeader>
      <CardContent>
        {hasStripeAccount ? (
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Your Stripe account is connected. Account ID: {stripeStatus?.account_id}
            </AlertDescription>
          </Alert>
        ) : (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You haven't completed Stripe onboarding yet. Complete the setup to start receiving payments.
            </AlertDescription>
          </Alert>
        )}

        <AdvertiserOnboarding
          advertiserId={advertiserId}
          onSuccess={() => {
            // Refresh the page or show success message
            window.location.reload()
          }}
        />
      </CardContent>
    </Card>
  )
}

// Agreement Tab Component
function AgreementTab({
  selfBillingAccepted,
  stripeStatus,
  isLoading,
  advertiserId,
  advertiserName,
  dialogOpen,
  setDialogOpen
}) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading agreement status...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Self-Billing Agreement</CardTitle>
          <CardDescription>Review and accept the self-billing agreement</CardDescription>
        </CardHeader>
        <CardContent>
          {selfBillingAccepted ? (
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You have accepted the self-billing agreement on{' '}
                {stripeStatus?.self_billing_accepted_at
                  ? new Date(stripeStatus.self_billing_accepted_at).toLocaleDateString()
                  : 'N/A'
                }
              </AlertDescription>
            </Alert>
          ) : (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You haven't accepted the self-billing agreement yet. This is required to activate subscriptions.
              </AlertDescription>
            </Alert>
          )}

          <div className="prose max-w-none mb-6">
            <h3 className="text-lg font-semibold mb-2">Self-Billing Agreement</h3>
            <p className="text-sm text-gray-600">
              This agreement allows the platform to issue invoices on your behalf for the services you provide.
              By accepting this agreement, you authorize the platform to handle billing and payment processing.
            </p>
          </div>

          {selfBillingAccepted ? (
            <p className="text-sm text-gray-500 italic">Agreement already accepted</p>
          ) : (
            <Button
              onClick={() => setDialogOpen(true)}
              className="w-full sm:w-auto"
            >
              <FileText className="h-4 w-4 mr-2" />
              Review and Accept Agreement
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Self-Billing Agreement Dialog */}
      <SelfBillingAgreementDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        advertiserId={advertiserId}
        advertiserName={advertiserName}
        onAccepted={() => {
          // Dialog component handles query invalidation
          setDialogOpen(false)
        }}
      />
    </>
  )
}

// Password Tab Component
function PasswordTab({ user }) {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const handlePasswordChange = (e) => {
    e.preventDefault()
    // TODO: Implement password change logic
    console.log("Password change requested")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change Password</CardTitle>
        <CardDescription>Update your account password</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Password change functionality is currently under development. Please contact support to change your password.
            </AlertDescription>
          </Alert>

          <Button type="submit" disabled className="w-full">
            Change Password (Coming Soon)
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
