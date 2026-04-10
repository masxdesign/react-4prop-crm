import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { AlertCircle, CheckCircle, FileText, ArrowLeft, X, UserPlus, Loader2, Eye, EyeOff } from 'lucide-react';
import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { toast } from '@/components/ui/use-toast';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { acceptSelfBillingAgreement, createPlatformCustomer, getAdvertiserStripeStatus } from '../api';
import AdvertiserOnboarding from '../stripe/AdvertiserOnboarding';
import usePropertySubtypes from '@/hooks/usePropertySubtypes';
import { cn } from '@/lib/utils';
import {
  normalizeAdvertiserHostname,
  validateAdvertiserHostnameField,
} from '@/utils/normalizeAdvertiserHostname';

/** Labels + short descriptions for site mode cards (radiogroup). */
const SITE_MODE_CARD_OPTIONS = [
  {
    value: 'advertiser_site',
    label: 'Advertiser site',
    description: 'Agents list on your platform; you earn commission on qualifying deals.',
  },
  {
    value: '4prop_site',
    label: '4prop site',
    description: 'One shared catalogue for every agent’s listings.',
  },
  {
    value: 'agentab',
    label: 'AgentAB',
    description: 'Embeds on agent sites—own listings, others’, or both.',
  },
];

function pstidsStringToArray(pstids) {
  if (!pstids) return [];
  return String(pstids)
    .replace(/^,|,$/g, '')
    .split(',')
    .filter((id) => id.trim())
    .map((id) => id.trim());
}

/**
 * Advertiser booleans for property-pub grade workflow kinds `mass_enquiry` and `client_share`.
 * Align bizchat GET/POST/PUT + DB columns with these JSON keys (or map server-side).
 */
const GRADE_WORKFLOW_MASS_ENQUIRY_ENABLED = 'grade_workflow_mass_enquiry_enabled';
const GRADE_WORKFLOW_CLIENT_SHARE_ENABLED = 'grade_workflow_client_share_enabled';

/** New advertiser (create): default mode 4prop → both grade workflows on; other modes → mass on, client shortlist off. */
const CREATE_DEFAULT_SITE_MODE = '4prop_site';

/** MSSQL bit / JSON boolean; default when column omitted (before migration). */
function coerceWorkflowFlag(raw, defaultWhenMissing) {
  if (raw == null) return defaultWhenMissing;
  if (raw === false || raw === 0) return false;
  if (typeof raw === 'string' && raw.trim() === '0') return false;
  return Boolean(raw);
}

/** Shapes from react-hook-form `dirtyFields` → subset of `allValues` (only changed fields). */
function getDirtyValues(dirtyFields, allValues) {
  if (!dirtyFields || typeof dirtyFields !== 'object') {
    return {};
  }
  return Object.keys(dirtyFields).reduce((acc, key) => {
    const d = dirtyFields[key];
    const val = allValues[key];
    if (d === true) {
      acc[key] = val;
    } else if (Array.isArray(d)) {
      if (d.some(Boolean)) {
        acc[key] = val;
      }
    } else if (d && typeof d === 'object') {
      const nested = getDirtyValues(d, val);
      if (Object.keys(nested).length > 0) {
        acc[key] = nested;
      }
    }
    return acc;
  }, {});
}

// Advertiser Form Component - Updated for week-based system
// isSelfService: true = advertiser signed in, completing their own profile / onboarding
// isSelfService: false = super admin viewing advertiser record and onboarding progress
// isUpdate: true = edit existing advertiser; false = add new. Defaults to !!advertiser (same shell, one form).
const AdvertiserForm = ({
  open,
  onOpenChange,
  advertiser,
  onClose,
  onSubmit,
  isLoading,
  error,
  isSelfService = false,
  isUpdate: isUpdateProp,
}) => {
  const isUpdate = typeof isUpdateProp === 'boolean' ? isUpdateProp : !!advertiser;
  const isCreate = !isUpdate;
  const [showSelfBillingContent, setShowSelfBillingContent] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [subtypeSearchTerm, setSubtypeSearchTerm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  /** Edit form: fetch Stripe status only after Stripe settings accordion is expanded. */
  const [morAccordionExpanded, setMorAccordionExpanded] = useState(false);
  const queryClient = useQueryClient();

  // Get property subtypes using the custom hook
  const { subtypeOptions, groupedPropertyTypes } = usePropertySubtypes();

  // Filter subtypes based on search term
  const filteredGroupedPropertyTypes = useMemo(() => {
    const searchLower = subtypeSearchTerm.toLowerCase().trim();
    if (!searchLower) return groupedPropertyTypes;

    return groupedPropertyTypes
      .map(type => ({
        ...type,
        subtypes: type.subtypes.filter(subtype =>
          subtype.label.toLowerCase().includes(searchLower) ||
          type.label.toLowerCase().includes(searchLower)
        )
      }))
      .filter(type => type.subtypes.length > 0);
  }, [groupedPropertyTypes, subtypeSearchTerm]);

  const allCatalogSubtypeIds = useMemo(() => {
    const ids = [];
    groupedPropertyTypes.forEach((type) => {
      type.subtypes.forEach((s) => ids.push(String(s.id)));
    });
    return ids;
  }, [groupedPropertyTypes]);

  // Content-addressed snapshot so useForm `values` does not reset every parent render (new advertiser
  // object ref from React Query). Otherwise site_mode and other fields snap back to server defaults on submit.
  const advertiserSnapshot = useMemo(
    () => (advertiser ? JSON.stringify(advertiser) : null),
    [advertiser]
  );

  const editFormValues = useMemo(() => {
    if (!advertiserSnapshot) return null;
    const adv = JSON.parse(advertiserSnapshot);
    const wr = adv.week_rate;
    const weekRateVal =
      wr != null && wr !== '' ? wr : '';
    const cp = adv.commission_percent;
    const commissionVal =
      cp != null && cp !== '' ? cp : 50;
    return {
      ...adv,
      pstids: pstidsStringToArray(adv.pstids),
      site_mode: adv.site_mode || 'advertiser_site',
      hostname: normalizeAdvertiserHostname(adv.hostname || ''),
      email: adv.email || '',
      password: '',
      week_rate: weekRateVal,
      commission_percent: commissionVal,
      [GRADE_WORKFLOW_MASS_ENQUIRY_ENABLED]: coerceWorkflowFlag(
        adv[GRADE_WORKFLOW_MASS_ENQUIRY_ENABLED],
        true
      ),
      [GRADE_WORKFLOW_CLIENT_SHARE_ENABLED]:
        (adv.site_mode || 'advertiser_site') === '4prop_site'
          ? coerceWorkflowFlag(adv[GRADE_WORKFLOW_CLIENT_SHARE_ENABLED], true)
          : false,
    };
  }, [advertiserSnapshot]);

  const createFormValues = useMemo(
    () => ({
      company: '',
      email: '',
      password: '',
      confirmPassword: '',
      pstids: [],
      site_mode: CREATE_DEFAULT_SITE_MODE,
      hostname: '',
      week_rate: '',
      vat_registered: false,
      vat_number: '',
      commission_percent: 50,
      [GRADE_WORKFLOW_MASS_ENQUIRY_ENABLED]: true,
      [GRADE_WORKFLOW_CLIENT_SHARE_ENABLED]: CREATE_DEFAULT_SITE_MODE === '4prop_site',
    }),
    []
  );

  const { register, handleSubmit, formState: { errors, dirtyFields, isDirty }, watch, control, unregister, setValue } = useForm({
    values: isUpdate ? editFormValues : createFormValues,
  });

  const hostnameField = register('hostname', { validate: validateAdvertiserHostnameField });

  // Create flow registers confirmPassword; update flow does not — unregister so it does not linger after switching modes.
  useEffect(() => {
    if (isUpdate) {
      unregister('confirmPassword');
    }
  }, [isUpdate, unregister]);

  const advertiserOnboarded = true

  const isVatRegistered = watch('vat_registered');
  const password = watch('password');
  const siteMode = watch('site_mode');
  const hostnameWatch = watch('hostname');
  const pstidsWatch = watch('pstids');
  const isAdvertiserSiteMode = siteMode === 'advertiser_site';

  const propertySubtypesHelp = useMemo(() => {
    switch (siteMode) {
      case 'advertiser_site':
        return {
          collapsed:
            'Advertiser catalogue and agents listing on this platform (site and magazine)',
          expanded:
            'These subtypes scope which property kinds apply to this advertiser’s catalogue and to agents who list with them—what can appear on the site and how listings feed magazine scheduling.',
        };
      case '4prop_site':
        return {
          collapsed: 'Agents’ listings in the shared 4prop catalogue (and magazine)',
          expanded:
            'In 4prop site mode, subtypes apply to agents’ listings in the shared catalogue and related magazine flows. They are not limited to this advertiser row alone.',
        };
      case 'agentab':
        return {
          collapsed: 'Property kinds agents may show via AgentAB website embeds',
          expanded:
            'In AgentAB mode, subtypes scope which property kinds agents can surface through embeds on their sites (their listings, other agents’, or both), depending on your configuration.',
        };
      default:
        return {
          collapsed: 'Listing categories—scope depends on mode above',
          expanded:
            'Property subtypes apply to this record in different ways depending on mode: the advertiser’s own catalogue and their agents, the shared 4prop catalogue, or AgentAB embeds.',
        };
    }
  }, [siteMode]);
  const companyWatch = watch('company');
  const emailWatch = watch('email');
  /** Admin + 4prop site: minimal fields — same for add new and edit (credentials only; no company, subtypes, MoR). */
  const is4propAdminMinimal = Boolean(!isSelfService && siteMode === '4prop_site');
  /** Grade workflow: CRM admin only; shown for every mode including 4prop minimal. */
  const showGradeWorkflowSection = !isSelfService;
  /** Client shortlist (`client_share`) is configurable only in 4prop site mode; otherwise off and read-only. */
  const is4propSiteMode = siteMode === '4prop_site';
  const clientShortlistEditable = is4propSiteMode;
  const gradeMassEnquiryEnabled = watch(GRADE_WORKFLOW_MASS_ENQUIRY_ENABLED);
  const gradeClientShareEnabled = watch(GRADE_WORKFLOW_CLIENT_SHARE_ENABLED);

  const siteModePrevForGradeRef = useRef(null);
  useEffect(() => {
    siteModePrevForGradeRef.current = null;
  }, [open, advertiser?.id, isUpdate]);

  useEffect(() => {
    if (!showGradeWorkflowSection) return;
    const prev = siteModePrevForGradeRef.current;
    siteModePrevForGradeRef.current = siteMode;
    if (prev === null) return;
    if (prev === siteMode) return;
    if (siteMode === '4prop_site') {
      setValue(GRADE_WORKFLOW_CLIENT_SHARE_ENABLED, true, { shouldDirty: true });
    } else {
      setValue(GRADE_WORKFLOW_CLIENT_SHARE_ENABLED, false, { shouldDirty: true });
    }
  }, [siteMode, showGradeWorkflowSection, setValue]);

  /** Edit drawer title: show who is being edited when Account details is collapsed. */
  const editDrawerTitlePrimary = useMemo(() => {
    if (!isUpdate) return '';
    const co = String(companyWatch ?? advertiser?.company ?? '').trim();
    const em = String(emailWatch ?? advertiser?.email ?? '').trim();
    if (co) return co;
    if (em) return em;
    return 'Advertiser';
  }, [isUpdate, companyWatch, emailWatch, advertiser?.company, advertiser?.email]);

  const editDrawerTitleSecondary = useMemo(() => {
    if (!isUpdate) return '';
    const co = String(companyWatch ?? advertiser?.company ?? '').trim();
    const em = String(emailWatch ?? advertiser?.email ?? '').trim();
    if (co && em) return em;
    return '';
  }, [isUpdate, companyWatch, emailWatch, advertiser?.company, advertiser?.email]);

  /** Prefer API `advertiser_id`; fall back to `id`. */
  const editDrawerAdvertiserIdLabel = useMemo(() => {
    if (!isUpdate || !advertiser) return null;
    const raw = advertiser.advertiser_id ?? advertiser.id;
    if (raw == null || raw === '') return null;
    return String(raw);
  }, [isUpdate, advertiser?.advertiser_id, advertiser?.id]);

  /** Mode is not in the accordion. Update: other sections collapsed. New: account / website_settings / property subtypes / mor open as applicable. */
  const defaultAccordionOpen = useMemo(() => {
    if (isUpdate) return [];
    const open = ['account', 'website_settings'];
    if (!is4propAdminMinimal) open.push('website');
    if (isAdvertiserSiteMode) open.push('mor');
    return open;
  }, [isUpdate, is4propAdminMinimal, isAdvertiserSiteMode]);

  /** One-line preview of fields inside each accordion (shown when section is collapsed). */
  const accountSectionSummary = useMemo(() => {
    const parts = [];
    if (!is4propAdminMinimal) parts.push('Company name');
    parts.push('Email');
    if (isCreate) {
      parts.push('Password', 'Confirm password');
    } else {
      parts.push('Password (optional change)');
    }
    return parts.join(' · ');
  }, [is4propAdminMinimal, isCreate]);

  const morSectionSummary = useMemo(() => {
    const parts = [];
    if (advertiser) {
      parts.push('Self-billing onboarding', 'Self-billing agreement');
    }
    if (!isSelfService) {
      parts.push('Week rate', 'Commission %');
    }
    parts.push('VAT registration', 'VAT number');
    return parts.join(' · ');
  }, [advertiser, isSelfService]);

  const accountSectionRef = useRef(null);
  const websiteSettingsSectionRef = useRef(null);
  const websiteSectionRef = useRef(null);
  const morSectionRef = useRef(null);
  const accordionOpenPrevRef = useRef(defaultAccordionOpen);
  const defaultAccordionOpenRef = useRef(defaultAccordionOpen);
  defaultAccordionOpenRef.current = defaultAccordionOpen;

  /** Keep in sync with Radix default when dialog opens, record changes, or add/edit mode switches (esp. update: all start closed). */
  useEffect(() => {
    if (!open) return;
    accordionOpenPrevRef.current = defaultAccordionOpenRef.current;
  }, [open, advertiser?.id, isUpdate]);

  useEffect(() => {
    if (!open) return;
    setMorAccordionExpanded(false);
  }, [open, advertiser?.id, isUpdate]);

  const stripeStatusQueryEnabled =
    !!advertiser?.id && (!isUpdate || morAccordionExpanded);

  const handleAccordionValueChange = useCallback((next) => {
    setMorAccordionExpanded(next.includes('mor'));
    const prev = accordionOpenPrevRef.current;
    const newlyOpened = next.filter((v) => !prev.includes(v));
    accordionOpenPrevRef.current = next;
    if (newlyOpened.length === 0) return;

    const value = newlyOpened[0];
    const refMap = {
      account: accountSectionRef,
      website_settings: websiteSettingsSectionRef,
      website: websiteSectionRef,
      mor: morSectionRef,
    };
    const el = refMap[value]?.current;
    if (!el) return;

    // Let Radix/CSS finish accordion-down (0.2s in index.css / tailwind) before scrolling — same for add + update.
    requestAnimationFrame(() => {
      window.setTimeout(() => {
        el.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
      }, 230);
    });
  }, []);

  // Fetch advertiser Stripe status
  const {
    data: stripeStatusData,
    isLoading: stripeStatusLoading
  } = useQuery({
    queryKey: ['advertiser-stripe-status', advertiser?.id],
    queryFn: () => getAdvertiserStripeStatus(advertiser?.id),
    enabled: stripeStatusQueryEnabled,
  });

  const stripeStatus = stripeStatusData?.data;
  const hasStripeAccount = !!stripeStatus?.account_id;
  const hasPlatformCustomer = !!stripeStatus?.platform_customer_id;

  const acceptMutation = useMutation({
    mutationFn: () => acceptSelfBillingAgreement(advertiser?.id),
    onSuccess: () => {
      // Invalidate queries to refresh advertiser data
      queryClient.invalidateQueries({ queryKey: ['advertiser-stripe-status', advertiser?.id] });
      queryClient.invalidateQueries({ queryKey: ['advertisers'] });

      toast({
        title: 'Agreement Accepted',
        description: 'Self-billing agreement has been accepted. You can now activate the subscription.',
      });

      // Reset to main form - the form will automatically show the updated status
      // because the parent component will re-render with fresh data from the invalidated query
      setShowSelfBillingContent(false);
      setAgreed(false);
    },
    onError: (error) => {
      console.error('Failed to accept self-billing agreement:', error);
    }
  });

  const createPlatformCustomerMutation = useMutation({
    mutationFn: () => createPlatformCustomer(advertiser?.id),
    onSuccess: (data) => {
      // Invalidate queries to refresh advertiser data
      queryClient.invalidateQueries({ queryKey: ['advertiser-stripe-status', advertiser?.id] });
      queryClient.invalidateQueries({ queryKey: ['advertisers'] });

      if (data?.data?.already_exists) {
        toast({
          title: 'Already Exists',
          description: 'Self-billing Stripe customer already exists for this advertiser',
        });
      } else {
        toast({
          title: 'Success',
          description: 'Self-billing Stripe customer created successfully',
        });
      }
    },
    onError: (error) => {
      console.error('Failed to create platform customer:', error);
      toast({
        variant: 'destructive',
        title: 'Creation Failed',
        description: error?.response?.data?.error || 'Failed to create self-billing Stripe customer. Please try again.',
      });
    }
  });

  const onSubmitInvalid = useCallback((formErrors) => {
    const entries = Object.entries(formErrors).filter(
      ([key]) => !(isUpdate && key === 'confirmPassword')
    );
    if (entries.length === 0) {
      return;
    }
    const first = entries[0]?.[1];
    const msg =
      typeof first?.message === 'string'
        ? first.message
        : entries[0]
          ? `Check ${String(entries[0][0]).replace(/_/g, ' ')}`
          : 'Please fix the highlighted fields';
    toast({
      variant: 'destructive',
      title: 'Form incomplete',
      description: msg,
    });
  }, [isUpdate]);

  const handleFormSubmit = (data) => {
    // Validate password match on create only (password fields not shown on update)
    if (isCreate && data.password !== data.confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Passwords do not match',
        description: 'Confirm your password matches.',
      });
      return;
    }

    const advSite = (data.site_mode || 'advertiser_site') === 'advertiser_site';

    // Format pstids to ensure proper comma-delimited format with leading and trailing commas
    const formattedData = {
      ...data,
      pstids: Array.isArray(data.pstids) && data.pstids.length > 0
        ? `,${data.pstids.join(',')},`
        : '',
      hostname: normalizeAdvertiserHostname(data.hostname || ''),
    };

    if (showGradeWorkflowSection) {
      formattedData[GRADE_WORKFLOW_MASS_ENQUIRY_ENABLED] = Boolean(
        data[GRADE_WORKFLOW_MASS_ENQUIRY_ENABLED]
      );
      const dataSiteMode = data.site_mode || 'advertiser_site';
      formattedData[GRADE_WORKFLOW_CLIENT_SHARE_ENABLED] =
        dataSiteMode === '4prop_site'
          ? Boolean(data[GRADE_WORKFLOW_CLIENT_SHARE_ENABLED])
          : false;
    } else {
      delete formattedData[GRADE_WORKFLOW_MASS_ENQUIRY_ENABLED];
      delete formattedData[GRADE_WORKFLOW_CLIENT_SHARE_ENABLED];
    }

    if (advSite) {
      formattedData.week_rate = parseFloat(data.week_rate);
      formattedData.commission_percent = parseFloat(data.commission_percent);
      formattedData.vat_registered = Boolean(data.vat_registered);
      formattedData.vat_number = data.vat_registered ? data.vat_number : '';
    } else {
      delete formattedData.week_rate;
      delete formattedData.commission_percent;
      delete formattedData.vat_registered;
      delete formattedData.vat_number;
    }

    if (!isSelfService) {
      formattedData.site_mode = data.site_mode || 'advertiser_site';
    } else {
      delete formattedData.site_mode;
    }

    // Only include email and password if they have values
    if (data.email && data.email.trim()) {
      formattedData.email = data.email.trim();
    } else {
      delete formattedData.email;
    }

    if (data.password && data.password.trim()) {
      formattedData.password = data.password.trim();
    } else {
      delete formattedData.password;
    }

    // Remove confirmPassword from the submitted data
    delete formattedData.confirmPassword;

    if (isCreate) {
      onSubmit(formattedData);
      return;
    }

    // Update: only send fields the user changed (backend must merge partial PUT body).
    const dirtyPayload = getDirtyValues(dirtyFields, data);
    if (Object.keys(dirtyPayload).length === 0) {
      return;
    }

    const dirtyKeys = Object.keys(dirtyPayload);
    const partial = {};
    for (const key of dirtyKeys) {
      if (key === 'confirmPassword') continue;
      if (key === 'password') {
        if (formattedData.password) partial.password = formattedData.password;
        continue;
      }
      if (key === 'email') {
        if (formattedData.email) partial.email = formattedData.email;
        continue;
      }
      if (key === 'site_mode' && isSelfService) continue;
      if (Object.prototype.hasOwnProperty.call(formattedData, key)) {
        partial[key] = formattedData[key];
      }
    }

    if (dirtyPayload.vat_registered === false) {
      partial.vat_registered = false;
      partial.vat_number = '';
    }

    if (Object.keys(partial).length === 0) {
      return;
    }

    onSubmit(partial);
  };

  const handleAcceptAgreement = () => {
    if (agreed) {
      acceptMutation.mutate();
    }
  };

  const handleBackToForm = () => {
    setShowSelfBillingContent(false);
    setAgreed(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex h-full w-full flex-col gap-0 overflow-hidden border-l p-0 sm:max-w-2xl"
      >
        {!showSelfBillingContent ? (
          <>
            <SheetHeader className="shrink-0 space-y-2 border-b border-border px-6 py-5 text-left">
              <SheetTitle className="text-left font-normal leading-snug text-foreground">
                {isUpdate ? (
                  <span className="flex flex-col gap-1.5">
                    <span className="text-[11px] font-normal leading-none text-muted-foreground/75">
                      {editDrawerAdvertiserIdLabel ? (
                        <>
                          Edit
                          <span className="text-muted-foreground/50"> · </span>
                          <span className="tabular-nums">ID {editDrawerAdvertiserIdLabel}</span>
                        </>
                      ) : (
                        'Edit advertiser'
                      )}
                    </span>
                    <span className="line-clamp-2 break-words pr-8 text-base font-medium">
                      {editDrawerTitlePrimary}
                    </span>
                    {editDrawerTitleSecondary ? (
                      <span className="text-xs font-normal text-muted-foreground/90 line-clamp-1">
                        {editDrawerTitleSecondary}
                      </span>
                    ) : null}
                  </span>
                ) : (
                  <span className="text-lg font-semibold">Add New Advertiser</span>
                )}
              </SheetTitle>
              <SheetDescription>
                {isSelfService
                  ? 'Complete your profile and self-billing onboarding in your account. Required for Platform Merchant of Record (MoR).'
                  : isUpdate
                    ? 'Advertiser details and onboarding progress. Advertisers complete self-billing onboarding when signed in to their own account.'
                    : 'Add an advertiser record. MoR settings apply when mode is Advertiser site.'}
              </SheetDescription>
            </SheetHeader>

            <form
              onSubmit={handleSubmit(handleFormSubmit, onSubmitInvalid)}
              noValidate
              className="flex min-h-0 flex-1 flex-col"
            >
              <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 pb-8 pt-4">
                <div className="min-w-0 w-full">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Mode</h3>
                  <fieldset disabled={isSelfService} className="min-w-0">
                    <Controller
                      name="site_mode"
                      control={control}
                      render={({ field }) => (
                        <div
                          className="flex w-full flex-row items-stretch gap-2.5 overflow-x-auto pb-0.5 sm:overflow-visible sm:pb-0"
                          role="radiogroup"
                          aria-label="Advertiser mode"
                          aria-readonly={isSelfService || undefined}
                        >
                          {SITE_MODE_CARD_OPTIONS.map((opt) => {
                            const selected = field.value === opt.value;
                            return (
                              <label
                                key={opt.value}
                                className={cn(
                                  'flex min-w-[9.25rem] flex-1 cursor-pointer flex-col gap-2 rounded-lg border p-2.5 transition-colors sm:min-w-0 sm:p-3',
                                  selected
                                    ? 'border-blue-500 bg-blue-50/60 ring-1 ring-blue-500/25'
                                    : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/80',
                                  isSelfService && 'cursor-default opacity-95'
                                )}
                              >
                                <div className="flex items-center gap-2">
                                  <input
                                    type="radio"
                                    name={field.name}
                                    value={opt.value}
                                    checked={selected}
                                    onChange={() => field.onChange(opt.value)}
                                    className="h-4 w-4 shrink-0 border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-60"
                                  />
                                  <span className="min-w-0 text-sm font-medium leading-tight text-gray-900">
                                    {opt.label}
                                  </span>
                                </div>
                                <p className="text-[11px] leading-snug text-gray-500 sm:text-xs sm:leading-relaxed pl-6 sm:pl-7">
                                  {opt.description}
                                </p>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    />
                  </fieldset>
                  <p className="text-xs text-gray-500 mt-3">
                    {isSelfService
                      ? 'Mode is set by your administrator.'
                      : 'Choose where this advertiser’s listings appear and how commission applies.'}
                  </p>
                </div>

                <Accordion
                  key={`${isUpdate ? 'accordion-update' : 'accordion-new'}-${isUpdate ? String(advertiser?.id ?? '') : 'new'}`}
                  type="multiple"
                  defaultValue={defaultAccordionOpen}
                  onValueChange={handleAccordionValueChange}
                  className="w-full space-y-3"
                >
                  <AccordionItem
                    ref={accountSectionRef}
                    value="account"
                    className="scroll-mt-3 overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-sm border-b-0"
                  >
                    <AccordionTrigger className="group px-4 py-3.5 text-left hover:no-underline flex flex-1 items-start justify-between gap-2 font-medium text-gray-700 outline-none [&[data-state=open]>svg]:rotate-180 hover:bg-muted/40">
                      <div className="flex min-w-0 flex-1 flex-col gap-0.5 pr-2">
                        <span className="text-sm font-semibold">Account details</span>
                        <span className="text-xs font-normal leading-snug text-gray-500 group-data-[state=open]:hidden">
                          {accountSectionSummary}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="border-t border-border/60 bg-muted/20 px-4 pt-3">
                <div>

                  {!is4propAdminMinimal && (
                    <div className="mb-3">
                      <label className="block text-sm font-medium mb-1">Company Name *</label>
                      <input
                        type="text"
                        {...register('company', { required: 'Company name is required' })}
                        className="w-full h-9 px-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter company name"
                      />
                      {errors.company && (
                        <p className="text-red-500 text-sm mt-1">{errors.company.message}</p>
                      )}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Email Address {isCreate && '*'}
                    </label>
                    <input
                      type="email"
                      {...register('email', {
                        required: isCreate ? 'Email is required' : false,
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Please enter a valid email address'
                        }
                      })}
                      className="w-full h-9 px-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="advertiser@example.com"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {isUpdate ? 'Update email address (leave as is to keep current)' : 'Used for advertiser login'}
                    </p>
                  </div>

                  {isCreate && (
                    <>
                      <div className="mt-3">
                        <label className="block text-sm font-medium mb-1">Password *</label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            {...register('password', {
                              required: 'Password is required',
                              validate: (val) => {
                                const v = val != null ? String(val).trim() : '';
                                if (v.length < 8) {
                                  return 'Password must be at least 8 characters';
                                }
                                return true;
                              },
                            })}
                            className="w-full h-9 px-3 pr-10 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        {errors.password && (
                          <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
                      </div>

                      <div className="mt-3">
                        <label className="block text-sm font-medium mb-1">Confirm Password *</label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            {...register('confirmPassword', {
                              required: 'Please confirm your password',
                              validate: (value) => value === password || 'Passwords do not match',
                            })}
                            className="w-full h-9 px-3 pr-10 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Re-enter password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        {errors.confirmPassword && (
                          <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
                        )}
                      </div>
                    </>
                  )}

                  {isUpdate && (
                    <div className="mt-3">
                      <label className="block text-sm font-medium mb-1">Password</label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          {...register('password', {
                            validate: (val) => {
                              const v = val != null ? String(val).trim() : '';
                              if (v.length > 0 && v.length < 8) {
                                return 'Password must be at least 8 characters';
                              }
                              return true;
                            },
                          })}
                          className="w-full h-9 px-3 pr-10 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="••••••••"
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Leave blank to keep current password
                      </p>
                    </div>
                  )}
                </div>
                    </AccordionContent>
                  </AccordionItem>

                <AccordionItem
                  ref={websiteSettingsSectionRef}
                  value="website_settings"
                  className="scroll-mt-3 overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-sm border-b-0"
                >
                  <AccordionTrigger className="group px-4 py-3.5 text-left hover:no-underline flex flex-1 items-start justify-between gap-2 font-medium text-gray-700 outline-none [&[data-state=open]>svg]:rotate-180 hover:bg-muted/40">
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5 pr-2">
                      <span className="text-sm font-semibold">Website settings</span>
                      <span className="text-xs font-normal leading-snug text-gray-500 group-data-[state=open]:hidden">
                        {hostnameWatch ? hostnameWatch : 'No hostname set'}
                        {showGradeWorkflowSection && (
                          <>
                            <span className="text-gray-400"> · </span>
                            Mass enquiry {gradeMassEnquiryEnabled ? 'on' : 'off'}
                            <span className="text-gray-400"> · </span>
                            Client shortlist{' '}
                            {is4propSiteMode
                              ? gradeClientShareEnabled ? 'on' : 'off'
                              : 'off (shared catalogue only)'}
                          </>
                        )}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="border-t border-border/60 bg-muted/20 px-4 pt-3">
                    <div className="pb-3">
                      <label className="block text-sm font-medium mb-1">Website hostname</label>
                      <input
                        type="text"
                        {...hostnameField}
                        className="w-full h-9 px-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="example.com"
                        autoComplete="url"
                        inputMode="url"
                        onBlur={(e) => {
                          const n = normalizeAdvertiserHostname(e.target.value);
                          setValue('hostname', n, { shouldValidate: true, shouldDirty: true });
                          hostnameField.onBlur(e);
                        }}
                        onPaste={(e) => {
                          hostnameField.onPaste?.(e);
                          setTimeout(() => {
                            const el = e.target;
                            const n = normalizeAdvertiserHostname(el.value);
                            if (n !== el.value) {
                              setValue('hostname', n, { shouldValidate: true, shouldDirty: true });
                            }
                          }, 0);
                        }}
                      />
                      {errors.hostname && (
                        <p className="text-red-500 text-sm mt-1">{errors.hostname.message}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Apex domain only (e.g. <span className="font-medium text-foreground/80">example.com</span>) — not{' '}
                        <code className="rounded bg-muted px-0.5 text-[11px]">www.</code> or other subdomains (we strip{' '}
                        <code className="rounded bg-muted px-0.5 text-[11px]">www.</code> when pasted). HTTPS assumed; full URLs trim to the host.
                      </p>
                    </div>

                    {showGradeWorkflowSection && (
                      <div className="border-t border-border/60 pt-3">
                        <p className="text-xs text-muted-foreground mb-2.5 leading-snug">
                          Grade workflow — same flows agents see on the listings site. Client shortlist can only be on when{' '}
                          <span className="font-medium text-foreground/85">Mode</span> is{' '}
                          <span className="font-medium text-foreground/85">4prop site</span>.
                        </p>
                        <div
                          className={cn(
                            'divide-y divide-border/70 rounded-lg border border-border/80 bg-background/80',
                            !clientShortlistEditable && '[&>div:last-child]:opacity-75'
                          )}
                        >
                          <div className="flex items-center justify-between gap-3 px-3 py-2.5">
                            <div className="min-w-0 flex-1 pr-2">
                              <Label
                                htmlFor={GRADE_WORKFLOW_MASS_ENQUIRY_ENABLED}
                                className="cursor-pointer text-sm font-medium text-gray-800"
                              >
                                Mass enquiry
                              </Label>
                              <p className="text-[11px] leading-snug text-muted-foreground">
                                Batch grading, one combined enquiry.
                              </p>
                            </div>
                            <Controller
                              name={GRADE_WORKFLOW_MASS_ENQUIRY_ENABLED}
                              control={control}
                              render={({ field }) => (
                                <Switch
                                  id={GRADE_WORKFLOW_MASS_ENQUIRY_ENABLED}
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  disabled={isLoading}
                                  className="shrink-0"
                                />
                              )}
                            />
                          </div>
                          <div className="flex items-center justify-between gap-3 px-3 py-2.5">
                            <div className="min-w-0 flex-1 pr-2">
                              <Label
                                htmlFor={GRADE_WORKFLOW_CLIENT_SHARE_ENABLED}
                                className={cn(
                                  'text-sm font-medium text-gray-800',
                                  clientShortlistEditable && 'cursor-pointer'
                                )}
                              >
                                Client shortlist
                              </Label>
                              <p className="text-[11px] leading-snug text-muted-foreground">
                                {clientShortlistEditable
                                  ? 'Matches "Share with client" on the listings site.'
                                  : '4prop site only; locked off for other modes.'}
                              </p>
                            </div>
                            <Controller
                              name={GRADE_WORKFLOW_CLIENT_SHARE_ENABLED}
                              control={control}
                              render={({ field }) => (
                                <Switch
                                  id={GRADE_WORKFLOW_CLIENT_SHARE_ENABLED}
                                  checked={clientShortlistEditable ? field.value : false}
                                  onCheckedChange={field.onChange}
                                  disabled={isLoading || !clientShortlistEditable}
                                  className="shrink-0"
                                />
                              )}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>

                {!is4propAdminMinimal && (
                  <AccordionItem
                    ref={websiteSectionRef}
                    value="website"
                    className="scroll-mt-3 overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-sm border-b-0"
                  >
                    <AccordionTrigger className="group px-4 py-3.5 text-left hover:no-underline flex flex-1 items-start justify-between gap-2 font-medium text-gray-700 outline-none [&[data-state=open]>svg]:rotate-180 hover:bg-muted/40">
                      <div className="flex min-w-0 flex-1 flex-col gap-0.5 pr-2">
                        <span className="text-sm font-semibold text-gray-900">Property subtypes</span>
                        <span className="text-xs font-normal leading-snug text-gray-500 group-data-[state=open]:hidden">
                          {pstidsWatch?.length > 0
                            ? (() => {
                                const first = subtypeOptions.find(o => String(o.id) === String(pstidsWatch[0]))?.label;
                                return first
                                  ? `${first}${pstidsWatch.length > 1 ? ` +${pstidsWatch.length - 1}` : ''}`
                                  : propertySubtypesHelp.collapsed;
                              })()
                            : propertySubtypesHelp.collapsed}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="border-t border-border/60 bg-muted/20 px-4 pt-3">
                  <div className="space-y-2">
                    <p className="text-xs text-gray-500 leading-snug mb-1">
                      {propertySubtypesHelp.expanded}
                    </p>
                    <Controller
                    name="pstids"
                    control={control}
                    render={({ field }) => {
                      const selected = field.value || [];
                      const selectedSet = new Set(selected.map((id) => String(id)));

                      const toggleId = (id) => {
                        const sid = String(id);
                        if (selectedSet.has(sid)) {
                          field.onChange(selected.filter((x) => String(x) !== sid));
                        } else {
                          field.onChange([...selected, sid]);
                        }
                      };

                      const selectAllCatalog = () => {
                        field.onChange([...allCatalogSubtypeIds]);
                      };

                      const deselectAll = () => {
                        field.onChange([]);
                      };

                      const selectAllInType = (type) => {
                        const add = type.subtypes.map((s) => String(s.id));
                        field.onChange([...new Set([...selected.map(String), ...add])]);
                      };

                      const clearType = (type) => {
                        const remove = new Set(type.subtypes.map((s) => String(s.id)));
                        field.onChange(selected.filter((x) => !remove.has(String(x))));
                      };

                      return (
                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder="Search subtypes or main types..."
                          value={subtypeSearchTerm}
                          onChange={(e) => setSubtypeSearchTerm(e.target.value)}
                          className="w-full h-9 px-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />

                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={selectAllCatalog}
                            className="h-8 px-2.5 text-xs font-medium rounded-md border border-gray-300 bg-white hover:bg-gray-50"
                          >
                            Select all
                          </button>
                          <button
                            type="button"
                            onClick={deselectAll}
                            className="h-8 px-2.5 text-xs font-medium rounded-md border border-gray-300 bg-white hover:bg-gray-50"
                          >
                            Deselect all
                          </button>
                        </div>

                        <div className="max-h-[min(320px,45vh)] overflow-y-auto rounded-md border border-gray-200 bg-white p-2 space-y-3">
                          {filteredGroupedPropertyTypes.length > 0 ? (
                            filteredGroupedPropertyTypes.map((type) => (
                              <div
                                key={type.id}
                                className="rounded-md border border-gray-100 bg-muted/15 p-2.5 space-y-2"
                              >
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <span className="text-sm font-medium text-gray-800">{type.label}</span>
                                  <div className="flex flex-wrap gap-1.5 shrink-0">
                                    <button
                                      type="button"
                                      onClick={() => selectAllInType(type)}
                                      className="h-7 px-2 text-xs font-medium rounded border border-gray-200 bg-white hover:bg-gray-50"
                                    >
                                      All in type
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => clearType(type)}
                                      className="h-7 px-2 text-xs font-medium rounded border border-gray-200 bg-white hover:bg-gray-50"
                                    >
                                      Clear type
                                    </button>
                                  </div>
                                </div>
                                <div className="space-y-1.5 pl-0.5">
                                  {type.subtypes.map((subtype) => {
                                    const sid = String(subtype.id);
                                    const checked = selectedSet.has(sid);
                                    return (
                                      <label
                                        key={sid}
                                        className="flex cursor-pointer items-start gap-2.5 text-sm text-gray-800 leading-snug"
                                      >
                                        <input
                                          type="checkbox"
                                          checked={checked}
                                          onChange={() => toggleId(subtype.id)}
                                          className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span>{subtype.label}</span>
                                      </label>
                                    );
                                  })}
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-gray-500 py-4 text-center">No subtypes found</p>
                          )}
                        </div>

                        {/* Selected subtypes display */}
                        {field.value && field.value.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {field.value.map(pstid => {
                              const subtype = subtypeOptions.find(opt => opt.id === pstid);
                              return subtype ? (
                                <span
                                  key={pstid}
                                  className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                                >
                                  {subtype.label}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newValue = field.value.filter(
                                        (id) => String(id) !== String(pstid)
                                      );
                                      field.onChange(newValue);
                                    }}
                                    className="hover:bg-blue-200 rounded-full p-0.5"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </span>
                              ) : null;
                            })}
                          </div>
                        )}
                      </div>
                      );
                    }}
                  />
                    <p className="text-xs text-gray-500 mt-1">
                      Use checkboxes or bulk actions. Leave none selected to include all subtypes. Scope follows
                      the mode selected at the top of this form.
                    </p>
                  </div>
                    </AccordionContent>
                  </AccordionItem>
                )}

                {/* Stripe settings (MoR / self-billing) — advertiser_site only */}
                {isAdvertiserSiteMode && (
                  <AccordionItem
                    ref={morSectionRef}
                    value="mor"
                    className="scroll-mt-3 overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-sm border-b-0"
                  >
                    <AccordionTrigger className="group px-4 py-3.5 text-left hover:no-underline flex flex-1 items-start justify-between gap-2 font-medium text-gray-700 outline-none [&[data-state=open]>svg]:rotate-180 hover:bg-muted/40">
                      <div className="flex min-w-0 flex-1 flex-col gap-0.5 pr-2">
                        <span className="text-sm font-semibold">Stripe settings</span>
                        <span className="text-xs font-normal leading-snug text-gray-500 group-data-[state=open]:hidden">
                          {morSectionSummary}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="border-t border-border/60 bg-muted/20 px-4 pt-3">

                  {/* Self-billing onboarding: platform customer + Stripe Connect (same flow; superadmin can run Connect here) */}
                  {advertiser && (
                    <div className="mb-4 pb-4 border-b border-gray-100">
                      <label className="block text-sm font-medium mb-1">Self-billing onboarding</label>
                      <p className="text-xs text-gray-500 mb-3">
                        {isSelfService
                          ? 'Sign in to your account and complete this step so self-billing invoices can be issued under MoR. Stripe Connect onboarding is part of this same flow.'
                          : 'This is the same self-billing onboarding step advertisers complete in their account; as superadmin you can run Stripe Connect onboarding for them here.'}
                      </p>

                      {morAccordionExpanded && stripeStatusLoading ? (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Checking status...</span>
                        </div>
                      ) : morAccordionExpanded && hasPlatformCustomer ? (
                        <div className="space-y-2">
                          <Alert className="border-green-200 bg-green-50">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <AlertDescription className="text-green-800 text-sm">
                              Self-billing Stripe customer created
                              {stripeStatus?.platform_customer_id && (
                                <span className="block text-xs text-green-700 mt-1 font-mono">
                                  {stripeStatus.platform_customer_id}
                                </span>
                              )}
                            </AlertDescription>
                          </Alert>
                        </div>
                      ) : morAccordionExpanded && hasStripeAccount ? (
                        <div className="space-y-2">
                          {!isSelfService && (
                            <p className="text-xs text-gray-500">
                              Optional: create on their behalf for support. Advertisers normally complete this themselves after signing in.
                            </p>
                          )}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => createPlatformCustomerMutation.mutate()}
                            disabled={createPlatformCustomerMutation.isPending}
                            className="w-full sm:w-auto"
                          >
                            {createPlatformCustomerMutation.isPending ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Creating...
                              </>
                            ) : (
                              <>
                                <UserPlus className="h-4 w-4 mr-2" />
                                Create Stripe customer
                              </>
                            )}
                          </Button>
                        </div>
                      ) : morAccordionExpanded ? (
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription className="text-sm">
                            {isSelfService
                              ? 'Complete Stripe Connect onboarding first, then create your self-billing Stripe customer here.'
                              : 'Complete Stripe Connect for this advertiser in the section below (same self-billing onboarding step), then create the self-billing Stripe customer.'}
                          </AlertDescription>
                        </Alert>
                      ) : null}

                      {isUpdate && advertiser?.id && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <AdvertiserOnboarding
                            advertiserId={advertiser.id}
                            advertiserName={
                              String(companyWatch ?? advertiser?.company ?? '').trim() ||
                              String(emailWatch ?? advertiser?.email ?? '').trim() ||
                              'Advertiser'
                            }
                            statusQueryEnabled={morAccordionExpanded}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Self-billing agreement — status (same MoR area as onboarding) */}
                  {advertiser && (
                    <div className="mb-4 pb-4 border-b border-gray-100">
                      <label className="block text-sm font-medium mb-1">Self-billing agreement</label>
                      <p className="text-xs text-gray-500 mb-3">
                        {isSelfService
                          ? 'Accept the agreement to activate Platform MoR.'
                          : 'Shows whether the advertiser has accepted. They accept when signed in to their account.'}
                      </p>
                      {!advertiser?.self_billing_agreement && advertiserOnboarded && (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            {isSelfService ? (
                              <>
                                Accept the self-billing agreement before Platform MoR activation.
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setShowSelfBillingContent(true)}
                                  className="ml-2 mt-2"
                                >
                                  Accept Agreement
                                </Button>
                              </>
                            ) : (
                              'The advertiser must accept the self-billing agreement before Platform MoR activation. They can accept when signed in to their account.'
                            )}
                          </AlertDescription>
                        </Alert>
                      )}
                      {advertiser?.self_billing_agreement && (
                        <Alert className="border-green-200 bg-green-50">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <AlertDescription className="text-green-800">
                            Self-billing agreement accepted
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  )}

                  {/* Week Rate - Hidden for self-service (advertiser-only) */}
                  {!isSelfService && (
                    <div>
                      <label className="block text-sm font-medium mb-1">Week Rate (£) *</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        {...register('week_rate', {
                          required: !isSelfService ? 'Week rate is required' : false,
                          min: { value: 0, message: 'Week rate must be positive' }
                        })}
                        className="w-full h-9 px-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0.00"
                      />
                      {errors.week_rate && (
                        <p className="text-red-500 text-sm mt-1">{errors.week_rate.message}</p>
                      )}
                    </div>
                  )}

                  {/* Commission Percentage - Hidden for self-service (advertiser-only) */}
                  {!isSelfService && (
                    <div className="mt-3">
                      <label className="block text-sm font-medium mb-1">Commission Percentage *</label>
                      <input
                        type="number"
                        step="1"
                        min="0"
                        max="100"
                        {...register('commission_percent', {
                          required: !isSelfService ? 'Commission percentage is required' : false,
                          min: { value: 0, message: 'Commission must be 0 or greater' },
                          max: { value: 100, message: 'Commission cannot exceed 100%' }
                        })}
                        className="w-full h-9 px-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="50"
                      />
                      {errors.commission_percent && (
                        <p className="text-red-500 text-sm mt-1">{errors.commission_percent.message}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Platform commission percentage (default: 50%)
                      </p>
                    </div>
                  )}

                  <div className="mt-3">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        {...register('vat_registered')}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium">VAT Registered (UK)</span>
                    </label>
                  </div>

                  {isVatRegistered && (
                    <div className="mt-3">
                      <label className="block text-sm font-medium mb-1">VAT Number</label>
                      <input
                        type="text"
                        {...register('vat_number', {
                          required: isVatRegistered ? 'VAT number is required when VAT registered' : false,
                          pattern: {
                            value: /^GB[0-9]{9}$/,
                            message: 'VAT number must be in format: GB123456789'
                          }
                        })}
                        className="w-full h-9 px-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="GB123456789"
                      />
                      {errors.vat_number && (
                        <p className="text-red-500 text-sm mt-1">{errors.vat_number.message}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        UK VAT number (e.g., GB123456789)
                      </p>
                    </div>
                  )}
                    </AccordionContent>
                  </AccordionItem>
                )}

                </Accordion>

                {error && (
                  <div className="text-red-500 text-sm p-2 bg-red-50 rounded">
                    {error.response?.data?.error || 'An error occurred'}
                  </div>
                )}
              </div>

              <div className="flex shrink-0 gap-2 border-t border-border bg-background px-6 py-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 h-9 px-4 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || (isUpdate && !isDirty)}
                  className="flex-1 h-9 px-4 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
                >
                  {isLoading ? 'Saving...' : (isUpdate ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </>
        ) : (
          <>
            {/* Self-Billing Agreement Content */}
            <SheetHeader className="shrink-0 space-y-2 border-b border-border px-6 py-5 text-left">
              <SheetTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5" />
                Self-Billing Agreement
              </SheetTitle>
              <SheetDescription>
                Required for Platform Merchant of Record (MoR) model
              </SheetDescription>
            </SheetHeader>

            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-4">
              {/* Back Button */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleBackToForm}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Edit Advertiser
              </Button>

              {/* Info Alert */}
              <Alert className="border-blue-200 bg-blue-50">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800 text-sm">
                  This is a one-time agreement required before your first Platform MoR subscription can be activated.
                </AlertDescription>
              </Alert>

              {/* Agreement Content */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-64 overflow-y-auto">
                <h3 className="font-semibold text-gray-900 mb-3">Self-Billing Agreement Terms</h3>

                <div className="text-sm text-gray-700 space-y-3">
                  <p>
                    By accepting this agreement, <strong>{advertiser?.company}</strong> authorizes BizChat Ltd to:
                  </p>

                  <ul className="list-disc list-inside space-y-2 ml-2">
                    <li>
                      <strong>Issue VAT invoices</strong> on your behalf for revenue share payments under UK VAT self-billing regulations
                    </li>
                    <li>
                      <strong>Collect payments</strong> from estate agents on your behalf as the Platform Merchant of Record
                    </li>
                    <li>
                      <strong>Deduct platform commission</strong> (as agreed in your advertiser terms) from collected payments
                    </li>
                    <li>
                      <strong>Transfer net proceeds</strong> to your connected Stripe account after commission deduction
                    </li>
                    <li>
                      <strong>Generate self-billing invoices</strong> showing the revenue share amount and applicable VAT
                    </li>
                  </ul>

                  <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mt-3">
                    <p className="text-sm text-yellow-800">
                      <strong>Important:</strong> You remain responsible for:
                    </p>
                    <ul className="list-disc list-inside mt-1 text-sm text-yellow-700 ml-2">
                      <li>Maintaining accurate VAT registration (if applicable)</li>
                      <li>Declaring self-billed invoice amounts in your VAT returns</li>
                      <li>Keeping records of all self-billing transactions</li>
                    </ul>
                  </div>

                  <p className="text-xs text-gray-600 mt-4">
                    This agreement complies with HMRC VAT Notice 700/62 regarding self-billing arrangements.
                    You may revoke this agreement at any time, but doing so will prevent new Platform MoR subscriptions.
                  </p>
                </div>
              </div>

              {/* Acceptance Checkbox */}
              <div className="flex items-start space-x-2 pt-2">
                <Checkbox
                  id="agree"
                  checked={agreed}
                  onCheckedChange={setAgreed}
                  disabled={acceptMutation.isPending}
                />
                <label
                  htmlFor="agree"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I have read and accept the self-billing agreement on behalf of {advertiser?.company}
                </label>
              </div>

              {/* Error Display */}
              {acceptMutation.isError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {acceptMutation.error?.response?.data?.error || 'Failed to accept agreement. Please try again.'}
                  </AlertDescription>
                </Alert>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBackToForm}
                  disabled={acceptMutation.isPending}
                  className="flex-1"
                >
                  Return
                </Button>
                <Button
                  type="button"
                  onClick={handleAcceptAgreement}
                  disabled={!agreed || acceptMutation.isPending}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {acceptMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Accepting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Accept & Continue
                    </>
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
};

export default AdvertiserForm;