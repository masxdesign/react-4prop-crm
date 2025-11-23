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
import { useQuery, useMutation } from "@tanstack/react-query"
import { getAdvertiserStripeStatus, changeAdvertiserPassword } from "@/components/Magazine/api"
import { useToast } from "@/components/ui/use-toast"
import { useForm } from "react-hook-form"

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
    isLoading: stripeStatusLoading,
    refetch: refetchStripeStatus
  } = useQuery({
    queryKey: ['advertiser-stripe-status', auth.user?.advertiser_id],
    queryFn: () => getAdvertiserStripeStatus(auth.user?.advertiser_id),
    enabled: !!auth.user?.advertiser_id
  })

  const stripeStatus = stripeStatusData?.data
  const hasStripeAccount = !!stripeStatus?.account_id
  const selfBillingAccepted = !!stripeStatus?.self_billing_agreement

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
    <div className="p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600 mt-1">Manage your advertiser account settings</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid max-w-lg grid-cols-4">
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
            refetchStripeStatus={refetchStripeStatus}
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
  setDialogOpen,
  refetchStripeStatus
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
                {stripeStatus?.self_billing_agreed_at
                  ? new Date(stripeStatus.self_billing_agreed_at).toLocaleDateString()
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
          // Dialog component handles query invalidation, but also explicitly refetch
          refetchStripeStatus()
          setDialogOpen(false)
        }}
      />
    </>
  )
}

// Password Tab Component
function PasswordTab({ user }) {
  const { toast } = useToast()

  const { register, handleSubmit, formState: { errors }, watch, reset } = useForm({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    }
  })

  const newPassword = watch("newPassword")

  const passwordMutation = useMutation({
    mutationFn: (passwordData) => changeAdvertiserPassword(user.advertiser_id, passwordData),
    onSuccess: () => {
      toast({
        title: "Password Changed",
        description: "Your password has been successfully updated.",
      })
      // Clear form
      reset()
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.error || "Failed to change password. Please try again."
      toast({
        variant: "destructive",
        title: "Password Change Failed",
        description: errorMessage,
      })
    }
  })

  const onSubmit = (data) => {
    // Submit password change
    passwordMutation.mutate({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change Password</CardTitle>
        <CardDescription>Update your account password</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Current Password</label>
            <input
              type="password"
              {...register("currentPassword", {
                required: "Current password is required"
              })}
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={passwordMutation.isPending}
            />
            {errors.currentPassword && (
              <p className="text-red-500 text-sm mt-1">{errors.currentPassword.message}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">New Password</label>
            <input
              type="password"
              {...register("newPassword", {
                required: "New password is required",
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters"
                },
                validate: (value) => {
                  const currentPassword = watch("currentPassword")
                  if (value === currentPassword) {
                    return "New password must be different from current password"
                  }
                  return true
                }
              })}
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={passwordMutation.isPending}
            />
            {errors.newPassword && (
              <p className="text-red-500 text-sm mt-1">{errors.newPassword.message}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Confirm New Password</label>
            <input
              type="password"
              {...register("confirmPassword", {
                required: "Please confirm your password",
                validate: (value) => value === newPassword || "Passwords do not match"
              })}
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={passwordMutation.isPending}
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          {passwordMutation.isError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {passwordMutation.error?.response?.data?.error || "Failed to change password. Please try again."}
              </AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            disabled={passwordMutation.isPending}
            className="w-full"
          >
            {passwordMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Changing Password...
              </>
            ) : (
              "Change Password"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
