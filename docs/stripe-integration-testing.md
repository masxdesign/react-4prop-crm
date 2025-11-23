# Stripe Integration Testing Guide

This document provides comprehensive testing scenarios for the Stripe integration in the Magazine module.

## Prerequisites

### Environment Setup

1. **Ensure Stripe publishable key is configured:**
   ```bash
   # In .env.development
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51SA9OP45nPftQZEX... # Get from backend team
   ```

2. **Backend server must be running:**
   ```bash
   # The bizchat service should be running on localhost:8081
   npm run dev  # This starts both frontend and backend services
   ```

3. **Verify Stripe is in test mode:**
   - All test card numbers will work
   - No real money will be charged
   - Check Stripe Dashboard is in test mode

---

## Test Cards

Use these test cards in Stripe test mode:

### Successful Payment
- **Card Number:** `4242 4242 4242 4242`
- **Expiry:** Any future date (e.g., 12/25)
- **CVC:** Any 3 digits (e.g., 123)
- **ZIP:** Any 5 digits (e.g., 12345)

### Payment Fails
- **Card Number:** `4000 0000 0000 0002`
- **Expiry:** Any future date
- **CVC:** Any 3 digits
- **ZIP:** Any 5 digits

### 3D Secure Authentication Required
- **Card Number:** `4000 0025 0000 3155`
- **Expiry:** Any future date
- **CVC:** Any 3 digits
- **ZIP:** Any 5 digits

---

## Complete End-to-End Test Scenarios

### Scenario 1: First-Time Agent Setup

**Objective:** Agent adds their first payment method

**Steps:**
1. Navigate to `/crm/mag/payment-settings`
2. Verify you see "No payment methods yet" message
3. Click "Add Your First Payment Method" button
4. Wait for Stripe Elements to load (payment form appears)
5. Enter test card: `4242 4242 4242 4242`
6. Enter expiry: `12/25`, CVC: `123`, ZIP: `12345`
7. Click "Save Payment Method"
8. Verify success and return to payment settings page
9. Verify card appears in the list showing `VISA ****4242`
10. Verify card is marked as "Default"

**Expected Results:**
- Payment method successfully added
- Card displays with correct last 4 digits
- Card is automatically set as default (first card)
- No errors in console

**Error Scenarios to Test:**
- Close dialog before submitting → Should cancel gracefully
- Use invalid card `4000 0000 0000 0002` → Should show error message
- Leave Stripe Elements incomplete → Button should be disabled

---

### Scenario 2: Advertiser Stripe Onboarding

**Objective:** Connect an advertiser to Stripe to receive payments

**Steps:**
1. Navigate to `/crm/mag/manage-advertisers`
2. Find an advertiser card with "Setup Stripe" badge
3. Click "Setup Stripe" link
4. Verify onboarding dialog opens
5. Read the "What happens next" instructions
6. Click "Start Stripe Onboarding"
7. Verify redirect to Stripe Connect onboarding page
8. **On Stripe's page:**
   - Select account type: "Individual" (for testing)
   - Fill in business details (use test data):
     - Business name: "Test Advertiser Ltd"
     - Email: test@example.com
     - Country: United Kingdom
   - Complete bank account details (use Stripe test routing numbers)
   - Submit form
9. Verify redirect back to `/crm/mag/manage-advertisers`
10. Verify advertiser card now shows "Stripe Connected" with green checkmark

**Expected Results:**
- Successful redirect to Stripe
- Successful redirect back to app
- Onboarding status updates to "complete"
- Green checkmark appears on advertiser card

**Test Data for Stripe Onboarding (UK):**
- Sort Code: `10-88-00`
- Account Number: `00012345`
- All other fields: Use any test data

**Error Scenarios to Test:**
- Close Stripe window without completing → Should be able to restart onboarding
- Incomplete onboarding → Should show "Additional information required" alert

---

### Scenario 3: Complete Subscription Workflow (Happy Path)

**Objective:** Test the complete flow from schedule creation to subscription activation

**Prerequisites:**
- Agent has payment method added (Scenario 1 completed)
- Advertiser has completed Stripe onboarding (Scenario 2 completed)

**Steps:**

#### Part A: Create Schedule
1. Navigate to Magazine properties list
2. Select a property
3. Click "Schedule" or "Add Schedule"
4. Fill in schedule details:
   - Select advertiser (one with Stripe Connected status)
   - Select start date (future date)
   - Select duration: 4 weeks
   - Verify weekly rate displays
5. Create schedule
6. Verify schedule appears with status "🔴 Assign Approver" (status_id: 0)

#### Part B: Assign Approver
7. On the schedule card, verify "Assign" button appears
8. Click "Assign" button
9. Search for an approver by email
10. Select approver from dropdown
11. Click "Assign Approver"
12. Verify schedule status changes to "🟡 Pending Approval" (status_id: 1)
13. Verify workflow timeline shows:
    - ✅ Schedule Created (with creator name)
    - ⚪ Pending Approval (with approver name)

#### Part C: Approve Schedule (Login as Approver)
14. Login as the assigned approver
15. Navigate to the property with the schedule
16. Verify "Approve" button appears (green)
17. Click "Approve" button
18. Approve dialog opens
19. Search and select a payer (agent with payment method)
20. Click "Approve & Assign Payer"
21. Verify schedule status changes to "🟣 Awaiting Activation" (status_id: 2)
22. Verify workflow timeline shows:
    - ✅ Schedule Created
    - ✅ Schedule Approved (with timestamp)
    - ⚪ Awaiting Activation (with payer name)

#### Part D: Activate Subscription (Login as Payer)
23. Login as the assigned payer
24. Navigate to the property with the schedule
25. Verify "Pay" button appears (blue, labeled with card icon)
26. Click "Pay" button
27. Activate Subscription dialog opens showing:
    - Subscription Details (advertiser, weekly rate, duration, total)
    - Billing start date
    - ✅ Payment method configured alert (showing card brand and last 4)
    - ✅ Advertiser onboarding complete alert
    - "What happens next" information box
28. Click "Activate Subscription" button
29. Wait for backend processing
30. Verify success and dialog closes
31. Verify schedule status changes to "🟢 Active Subscription" (status_id: 3)
32. Verify workflow timeline shows:
    - ✅ Schedule Created
    - ✅ Schedule Approved
    - ✅ Subscription Activated (with timestamp)

**Expected Results:**
- Subscription successfully activated
- `subscription_schedule_id` is populated in schedule data
- `activated_at` timestamp is set
- Weekly billing scheduled in Stripe
- No errors in console

**Backend Verification (Optional):**
- Check Stripe Dashboard → Subscriptions
- Verify subscription schedule was created
- Verify customer and payment method linked
- Verify billing schedule (weekly payments × 4 weeks)

---

### Scenario 4: Error Handling - Missing Payment Method

**Objective:** Test error handling when payer hasn't set up payment method

**Steps:**
1. Complete Parts A-C of Scenario 3 (create, assign, approve)
2. Assign a payer who has NOT added a payment method
3. Login as that payer
4. Navigate to the schedule
5. Click "Pay" button
6. Verify Activate Subscription dialog shows:
   - ❌ "You need to add a payment method" error alert (red)
   - ✅ Advertiser onboarding complete (green)
   - "Activate Subscription" button is DISABLED
7. Click "Cancel"
8. Navigate to `/crm/mag/payment-settings`
9. Add a payment method
10. Return to the schedule
11. Click "Pay" button again
12. Verify ✅ "Payment method configured" now appears
13. Verify "Activate Subscription" button is now ENABLED
14. Complete activation successfully

**Expected Results:**
- Clear error message about missing payment method
- Activation button properly disabled
- After adding payment method, flow continues normally
- No crashes or console errors

---

### Scenario 5: Error Handling - Advertiser Not Onboarded

**Objective:** Test error handling when advertiser hasn't completed Stripe onboarding

**Steps:**
1. Create a new advertiser (NOT onboarded to Stripe)
2. Create a schedule with this advertiser
3. Complete assign → approve flow
4. Login as payer (with payment method)
5. Click "Pay" button
6. Verify Activate Subscription dialog shows:
   - ✅ Payment method configured (green)
   - ❌ "Advertiser has not completed Stripe onboarding" error alert (red)
   - "Activate Subscription" button is DISABLED
7. Cancel dialog
8. Complete advertiser onboarding (Scenario 2)
9. Return to schedule and click "Pay" again
10. Verify both checks are now green ✅
11. Complete activation successfully

**Expected Results:**
- Clear error message about missing advertiser onboarding
- Activation button properly disabled
- After advertiser completes onboarding, flow continues
- No crashes or console errors

---

### Scenario 6: Multiple Payment Methods Management

**Objective:** Test adding multiple payment methods and switching default

**Steps:**
1. Navigate to `/crm/mag/payment-settings`
2. Add first payment method (VISA `4242 4242 4242 4242`)
3. Verify it's marked as "Default"
4. Click "Add Payment Method" again
5. Add second card (Mastercard `5555 5555 5555 4444`)
6. Verify both cards appear in list
7. Verify first card is still marked "Default"
8. On the second card, click "Set Default" button
9. Verify second card is now marked "Default"
10. Verify first card no longer shows "Default" badge
11. Create and activate a subscription
12. Verify the default card is used

**Expected Results:**
- Multiple cards can be added
- Only one card marked as default at a time
- Default can be switched
- Subscription uses the default card
- Card displays show correct brand colors (Visa = blue, Mastercard = orange)

---

### Scenario 7: Stripe Elements Validation

**Objective:** Test Stripe's built-in validation

**Steps:**
1. Navigate to `/crm/mag/payment-settings`
2. Click "Add Payment Method"
3. Test invalid inputs:
   - Enter incomplete card number: `4242 4242`
   - Verify Stripe shows validation error
   - Enter expired date: `12/20`
   - Verify Stripe shows expiry error
   - Enter invalid CVC: `12`
   - Verify Stripe shows CVC error
4. Enter valid complete data
5. Verify "Save Payment Method" button becomes enabled
6. Submit successfully

**Expected Results:**
- Stripe Elements shows inline validation errors
- Submit button disabled until form is valid
- All validation messages clear and user-friendly

---

### Scenario 8: Workflow Timeline Display

**Objective:** Test timeline displays correct workflow states

**Steps:**
1. Create a new schedule
2. Expand workflow timeline
3. Verify shows:
   - ✅ Schedule Created (green, with creator name and timestamp)
   - ⚪ No other steps (gray)
4. Assign approver
5. Refresh timeline
6. Verify shows:
   - ✅ Schedule Created
   - ⚪ Pending Approval (gray, with approver name, no timestamp)
7. Approve schedule
8. Refresh timeline
9. Verify shows:
   - ✅ Schedule Created
   - ✅ Schedule Approved (green, with timestamp)
   - ⚪ Awaiting Activation (gray, with payer name)
10. Activate subscription
11. Refresh timeline
12. Verify shows:
    - ✅ Schedule Created
    - ✅ Schedule Approved
    - ✅ Subscription Activated (green, with timestamp)
13. Collapse timeline
14. Verify shows only current step in collapsed view
15. Click expand again
16. Verify full timeline reappears

**Expected Results:**
- Timeline accurately reflects current state
- Timestamps display correctly (e.g., "@2:30pm (3 hours ago)")
- Agent names and avatars display correctly
- Expand/collapse works smoothly

---

### Scenario 9: Schedule Status Badge Updates

**Objective:** Test status badges update correctly throughout workflow

**Steps:**
1. Create schedule → Verify badge shows "🔴 Assign Approver"
2. Assign approver → Verify badge shows "🟡 Pending Approval"
3. Approve schedule → Verify badge shows "🟣 Awaiting Activation"
4. Activate subscription → Verify badge shows "🟢 Active Subscription"
5. Wait until schedule becomes active (start_date reached)
6. Verify badge shows "🔵 Scheduled" or "🟢 Active"
7. Wait until schedule expires
8. Verify badge shows "⚫ Finished" (if has subscription_schedule_id) or "⚫ Expired"

**Expected Results:**
- Badge colors and icons match status
- Transitions happen immediately after actions
- Labels are clear and descriptive

---

### Scenario 10: Permission-Based Button Visibility

**Objective:** Verify action buttons only appear for authorized users

**Steps:**
1. **As Creator (status_id: 0):**
   - Create a schedule
   - Verify "Assign" button appears
   - Verify NO "Approve" or "Pay" buttons
2. **As Non-Creator (status_id: 0):**
   - View same schedule
   - Verify NO buttons appear
3. **As Approver (status_id: 1):**
   - Assign yourself as approver
   - Login as that approver
   - Verify "Approve" button appears
   - Verify NO "Assign" or "Pay" buttons
4. **As Non-Approver (status_id: 1):**
   - Login as different user
   - Verify NO buttons appear
5. **As Payer (status_id: 2):**
   - Approve and assign yourself as payer
   - Verify "Pay" button appears
   - Verify NO "Assign" or "Approve" buttons
6. **As Non-Payer (status_id: 2):**
   - Login as different user
   - Verify NO buttons appear
7. **After Activation (status_id: 3):**
   - Verify NO action buttons appear for anyone

**Expected Results:**
- Buttons only visible to authorized users
- No unauthorized actions possible
- Clean UI when no actions available

---

## Monitoring & Debugging

### Frontend Debugging

**Console Logs to Check:**
```javascript
// In browser console, check for:
- Stripe initialization messages
- API request/response logs
- React Query cache updates
- Error messages
```

**React Query DevTools:**
1. Open React Query DevTools (bottom left icon)
2. Check query states:
   - `agent-payment-methods` - Should show payment methods
   - `advertiser-stripe-status` - Should show onboarding status
   - `property-schedules` - Should show updated schedule data
3. Verify queries refetch after mutations

**Network Tab:**
1. Open Chrome DevTools → Network tab
2. Filter: XHR
3. Check API calls:
   - `POST /api/crm/mag/stripe/agents/{nid}/setup-payment` - Returns client_secret
   - `GET /api/crm/mag/stripe/agents/{nid}/payment-methods` - Returns payment methods
   - `POST /api/crm/mag/schedules/{id}/activate-subscription` - Activates subscription
   - `GET /api/crm/mag/stripe/advertisers/{id}/status` - Returns onboarding status

### Backend Verification (Ask Backend Team)

**Stripe Dashboard Checks:**
1. Navigate to Stripe Dashboard (test mode)
2. Check Customers → Verify agent customer created
3. Check Payment Methods → Verify card attached to customer
4. Check Subscriptions → Verify subscription schedule created
5. Check Connect Accounts → Verify advertiser account created

**Webhook Monitoring:**
```bash
# Backend team can use Stripe CLI to monitor webhooks
stripe listen --forward-to localhost:8081/api/crm/mag/stripe/webhooks

# Expected webhook events:
- invoice.payment_succeeded (weekly)
- invoice.payment_failed (if card declines)
- subscription_schedule.completed (after all weeks)
- customer.subscription.deleted (if cancelled)
```

---

## Common Issues & Solutions

### Issue 1: "Stripe is not configured"
**Cause:** Stripe publishable key not set in .env file
**Solution:**
```bash
# Add to .env.development:
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51SA9OP45nPftQZEX...
# Restart dev server: npm run dev
```

### Issue 2: Payment method setup fails silently
**Cause:** Backend not returning proper client_secret
**Solution:** Check backend logs, verify `/api/crm/mag/stripe/agents/{nid}/setup-payment` endpoint is working

### Issue 3: "Advertiser has not completed Stripe onboarding"
**Cause:** Advertiser onboarding incomplete or stuck
**Solution:**
1. Click "Setup Stripe" again on advertiser card
2. Complete all required fields in Stripe Connect
3. Use test data for all fields
4. Verify return URL redirects back to app

### Issue 4: Subscription activation fails
**Cause:** Multiple possible causes
**Check:**
- Agent has payment method? → Visit `/crm/mag/payment-settings`
- Advertiser onboarded? → Check advertiser card for green checkmark
- Backend API working? → Check Network tab for error responses
- Stripe test mode? → Verify using test cards

### Issue 5: Timeline not updating
**Cause:** React Query not refetching
**Solution:**
```javascript
// Check if mutations are invalidating queries:
queryClient.invalidateQueries({ queryKey: ['property-schedules', propertyId] });
```

---

## Testing Checklist

Use this checklist to ensure comprehensive testing:

### Setup Phase
- [ ] Stripe dependencies installed
- [ ] Environment variables configured
- [ ] Backend server running (localhost:8081)
- [ ] Frontend dev server running
- [ ] Stripe Dashboard accessible (test mode)

### Agent Setup
- [ ] Can navigate to `/crm/mag/payment-settings`
- [ ] Can add first payment method
- [ ] Can add multiple payment methods
- [ ] Can set default payment method
- [ ] Payment methods display correctly
- [ ] Stripe Elements validation works

### Advertiser Setup
- [ ] Can view advertisers at `/crm/mag/manage-advertisers`
- [ ] Onboarding status displays correctly
- [ ] "Setup Stripe" link appears for non-onboarded advertisers
- [ ] Can click and redirect to Stripe
- [ ] Can complete onboarding with test data
- [ ] Returns to app after onboarding
- [ ] Status updates to "Stripe Connected"

### Schedule Workflow
- [ ] Can create schedule (status 0)
- [ ] Can assign approver (status 0 → 1)
- [ ] Can approve schedule (status 1 → 2)
- [ ] Can activate subscription (status 2 → 3)
- [ ] Status badges update correctly
- [ ] Workflow timeline updates correctly
- [ ] Action buttons only show for authorized users

### Error Handling
- [ ] Missing payment method blocks activation
- [ ] Missing advertiser onboarding blocks activation
- [ ] Invalid cards show error messages
- [ ] Network errors handled gracefully
- [ ] All user-facing errors are clear and actionable

### Data Integrity
- [ ] `activated_at` timestamp set correctly
- [ ] `subscription_schedule_id` populated
- [ ] Weekly rate calculated correctly
- [ ] Total amount calculated correctly
- [ ] Billing start date matches schedule start_date

### UI/UX
- [ ] All dialogs open and close properly
- [ ] Loading states display during async operations
- [ ] Success messages appear after actions
- [ ] Error messages are clear and helpful
- [ ] Mobile responsive (test on smaller screens)
- [ ] Keyboard navigation works
- [ ] No console errors or warnings

---

## Test Data Summary

### Test Card Numbers
```
Success:      4242 4242 4242 4242
Decline:      4000 0000 0000 0002
3D Secure:    4000 0025 0000 3155
Mastercard:   5555 5555 5555 4444
```

### UK Bank Account (for advertiser onboarding)
```
Sort Code:    10-88-00
Account:      00012345
```

### Test User Emails (for agent search)
Use actual agent emails from your database for testing agent assignment.

---

## Next Steps After Testing

1. **Report Issues:** Create tickets for any bugs found
2. **Document Edge Cases:** Add any discovered edge cases to this document
3. **Performance Testing:** Test with large numbers of schedules/payment methods
4. **Production Deployment:**
   - Get production Stripe keys from backend team
   - Update `.env` with production keys
   - Test one complete flow in production with real card (then refund)
5. **User Training:** Create user guide based on these test scenarios

---

## Support Contacts

**For Stripe Integration Questions:**
- Backend Team: [Backend developer contact]
- Stripe Documentation: https://stripe.com/docs

**For Frontend Issues:**
- React/Component Issues: [Frontend team contact]
- Stripe Elements: https://stripe.com/docs/stripe-js

---

*Last Updated: 2025-10-02*
*Version: 1.0*
