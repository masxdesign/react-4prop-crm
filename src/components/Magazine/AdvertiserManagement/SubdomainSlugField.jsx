import { useEffect, useRef, useState } from 'react';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { checkSubdomainAvailability } from '@/components/Magazine/api';

const SUBDOMAIN_SLUG_REGEX = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;

// Mirror of the server-side list in api-mag-advertisers.js. Keep in sync.
const RESERVED_SUBDOMAIN_SLUGS = new Set([
  'www', 'api', 'app', 'admin', 'staging', 'dev', 'test', 'mail', 'email',
  'static', 'assets', 'cdn', 'auth', 'login', 'signin', 'signup',
  'blog', 'docs', 'help', 'support', 'status',
]);

/**
 * Local validation. Returns null if valid, or an error message.
 * Empty values are valid (the column is nullable).
 */
function validateLocal(value) {
  if (!value) return null;
  if (!SUBDOMAIN_SLUG_REGEX.test(value)) {
    return 'Lowercase letters, digits, and hyphens only. 2–63 characters. No leading or trailing hyphen.';
  }
  if (RESERVED_SUBDOMAIN_SLUGS.has(value)) {
    return `"${value}" is reserved`;
  }
  return null;
}

/**
 * Subdomain slug field for the advertiser form.
 *
 * Local validation runs synchronously on every keystroke. Remote uniqueness
 * check runs after a 400ms debounce once the value passes local validation.
 *
 * Integrates with react-hook-form via `register` semantics — pass `field`
 * (from register('subdomain_slug')) and `setValue` so the component can
 * normalize input (lowercase + hyphenate) without fighting RHF.
 */
export default function SubdomainSlugField({
  field,
  value,
  setValue,
  excludeId,
  rhfError,
}) {
  const [remoteState, setRemoteState] = useState({ status: 'idle', reason: null });
  const requestIdRef = useRef(0);

  const localError = validateLocal(value);

  useEffect(() => {
    // No remote check if local validation fails or value is empty.
    if (!value || localError) {
      setRemoteState({ status: 'idle', reason: null });
      return undefined;
    }

    setRemoteState({ status: 'checking', reason: null });
    const myRequestId = ++requestIdRef.current;

    const timer = setTimeout(async () => {
      try {
        const result = await checkSubdomainAvailability(value, excludeId);
        // Drop stale responses if the user kept typing.
        if (requestIdRef.current !== myRequestId) return;
        setRemoteState({
          status: result.available ? 'available' : 'unavailable',
          reason: result.reason ?? null,
        });
      } catch {
        if (requestIdRef.current !== myRequestId) return;
        setRemoteState({ status: 'error', reason: null });
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [value, localError, excludeId]);

  const showSuccess = !localError && remoteState.status === 'available';
  const showSpinner = !localError && remoteState.status === 'checking';
  const remoteMessage = (() => {
    if (localError) return null;
    if (remoteState.status === 'unavailable') {
      switch (remoteState.reason) {
        case 'taken':    return 'This subdomain is already taken.';
        case 'reserved': return 'This subdomain is reserved.';
        case 'invalid':  return 'Invalid subdomain.';
        default:         return 'Not available.';
      }
    }
    if (remoteState.status === 'error') {
      return 'Could not verify availability. It will be re-checked on save.';
    }
    return null;
  })();

  const errorText = rhfError?.message ?? localError ?? remoteMessage;
  const showError = Boolean(errorText) && remoteState.status !== 'checking';

  return (
    <div>
      <label className="block text-sm font-medium mb-1">Subdomain on property.pub</label>
      <div className="relative">
        <input
          type="text"
          {...field}
          value={value ?? ''}
          className="w-full h-9 pl-3 pr-9 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="shopproperty"
          autoComplete="off"
          inputMode="url"
          maxLength={63}
          onChange={(e) => {
            // Normalize as the user types: lowercase, strip whitespace, allow only [a-z0-9-].
            const normalized = e.target.value
              .toLowerCase()
              .replace(/\s+/g, '-')
              .replace(/[^a-z0-9-]/g, '');
            setValue('subdomain_slug', normalized, { shouldValidate: true, shouldDirty: true });
          }}
          onBlur={field.onBlur}
        />
        <span className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
          {showSpinner && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
          {showSuccess && <CheckCircle2 className="h-4 w-4 text-green-600" />}
          {showError   && <AlertCircle className="h-4 w-4 text-red-500" />}
        </span>
      </div>

      {showError && (
        <p className="text-red-500 text-sm mt-1">{errorText}</p>
      )}

      <p className="text-xs text-gray-500 mt-1">
        Optional. Hosts the advertiser at{' '}
        <span className="font-medium text-foreground/80">
          {value ? `${value}.property.pub` : '<subdomain>.property.pub'}
        </span>
        . Leave blank to use the path-based form (<code className="rounded bg-muted px-0.5 text-[11px]">property.pub/&lt;id&gt;</code>) or a custom domain.
      </p>
    </div>
  );
}
