# User/Agent Object Structure Documentation

This document defines the structure of user/agent objects used throughout the application.

## User Object Structure

The user object is returned from authentication and user-related API endpoints.

### Complete Structure

```javascript
{
    "id": "161",                    // User ID (string)
    "first": "Anthony",             // First name
    "last": "Fowler",              // Last name
    "email": "afeach@gmail.com",   // Email address
    "phone": "",                    // Phone number (optional)
    "hash": "190c00f1",            // User hash
    "role": "30",                   // Role ID (string)
    "avatar": "/JSON/NIDs/NID/45500/5/1.jpg",      // Full avatar URL
    "avatar_sm": "/JSON/NIDs/NID/45500/5/2.jpg",   // Small avatar URL
    "neg_id": "45500",             // Negotiator ID (primary identifier)
    "did": "430",                   // Department ID
    "cid": "95",                    // Company ID
    "display_name": "Anthony Fowler", // Display name (derived from first + last)
    "need_to_login": false,         // Login requirement flag
    "bz_hash": "N190c00f1",        // Bizchat hash
    "company": {                    // Company object
        "name": "EACH",
        "phone": "020 7602 5947",
        "did": "430",
        "logo": "JSON/NIDs/DIDs/295/220025102156/1.png"
    }
}
```

### Field Details

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `id` | string | ✅ | User ID | "161" |
| `first` | string | ✅ | First name | "Anthony" |
| `last` | string | ✅ | Last name | "Fowler" |
| `email` | string | ✅ | Email address | "afeach@gmail.com" |
| `phone` | string | ❌ | Phone number | "" |
| `hash` | string | ✅ | User hash | "190c00f1" |
| `role` | string | ✅ | Role ID | "30" |
| `avatar` | string | ❌ | Full avatar URL | "/JSON/NIDs/NID/45500/5/1.jpg" |
| `avatar_sm` | string | ❌ | Small avatar URL | "/JSON/NIDs/NID/45500/5/2.jpg" |
| `neg_id` | string | ✅ | Negotiator ID (NID) | "45500" |
| `did` | string | ✅ | Department ID | "430" |
| `cid` | string | ✅ | Company ID | "95" |
| `display_name` | string | ✅ | Display name | "Anthony Fowler" |
| `need_to_login` | boolean | ✅ | Login requirement | false |
| `bz_hash` | string | ✅ | Bizchat hash | "N190c00f1" |
| `company` | object | ✅ | Company information | See below |

### Company Object Structure

```javascript
{
    "name": "EACH",                                    // Company name
    "phone": "020 7602 5947",                         // Company phone
    "did": "430",                                      // Department ID
    "logo": "JSON/NIDs/DIDs/295/220025102156/1.png"  // Company logo URL
}
```

---

## Usage Examples

### Accessing User Name

```javascript
// ✅ CORRECT - Use first and last
const fullName = `${user.first} ${user.last}`;
// Result: "Anthony Fowler"

// ✅ CORRECT - Use display_name
const displayName = user.display_name;
// Result: "Anthony Fowler"

// ❌ INCORRECT - firstname/surname don't exist
const wrongName = `${user.firstname} ${user.surname}`; // undefined undefined
```

### Accessing User ID

```javascript
// ✅ CORRECT - Use neg_id for agent operations
const agentId = user.neg_id;
// Result: "45500"

// ⚠️ CAUTION - user.id is different from neg_id
const userId = user.id;
// Result: "161" (not the same as neg_id!)
```

### Accessing Avatar

```javascript
// ✅ CORRECT - Use avatar for full size
const avatarUrl = user.avatar;
// Result: "/JSON/NIDs/NID/45500/5/1.jpg"

// ✅ CORRECT - Use avatar_sm for thumbnails
const thumbnailUrl = user.avatar_sm;
// Result: "/JSON/NIDs/NID/45500/5/2.jpg"
```

### Getting User Initials

```javascript
// ✅ CORRECT
const initials = `${user.first.charAt(0)}${user.last.charAt(0)}`.toUpperCase();
// Result: "AF"

// ❌ INCORRECT
const wrongInitials = `${user.firstname?.charAt(0)}${user.surname?.charAt(0)}`;
// Result: "undefinedundefined"
```

---

## Common Patterns

### Full Name Display

```javascript
// Pattern 1: Using first + last
function getUserFullName(user) {
    return `${user.first || ''} ${user.last || ''}`.trim();
}

// Pattern 2: Using display_name (preferred)
function getUserFullName(user) {
    return user.display_name || `${user.first} ${user.last}`;
}
```

### Avatar with Fallback

```javascript
function getUserAvatar(user, size = 'full') {
    const avatarUrl = size === 'small' ? user.avatar_sm : user.avatar;
    const initials = `${user.first.charAt(0)}${user.last.charAt(0)}`.toUpperCase();

    return (
        <div className="avatar">
            {avatarUrl ? (
                <img src={avatarUrl} alt={user.display_name} />
            ) : (
                <div className="avatar-initials">{initials}</div>
            )}
        </div>
    );
}
```

### User Identification

```javascript
// ✅ Use neg_id for most operations
function isCurrentUser(user, currentUserNegId) {
    return user.neg_id === currentUserNegId;
}

// ⚠️ Be careful with user.id vs neg_id
// user.id = "161" (user table ID)
// user.neg_id = "45500" (negotiator/agent ID)
```

---

## API Endpoints That Return User Objects

### Authentication
```javascript
// POST /api/login
// Response includes user object
const auth = await login(credentials);
const user = auth.user; // User object
```

### User Lookup
```javascript
// POST /api/users
// Body: { ids: "45500,45501,45502" }
const users = await fetchUsersByNids(nids);
// Returns array of user objects
```

### Magazine Agent Search
```javascript
// GET /api/crm/agents/search?email=anthony
const agents = await searchAgents('anthony');
// Returns array of user objects
```

---

## Differences: Auth User vs API User

### Auth User (from Auth Context)
```javascript
const auth = useAuth();
const user = auth.user;
// Structure: Same as documented above
// Source: Authentication endpoint
```

### API User (from fetchUsersByNids)
```javascript
const { getUserByNid } = useUsersByNids(nids);
const user = getUserByNid('45500');
// Structure: Same as documented above
// Source: User lookup endpoint
```

**Note**: Both sources return the same user object structure with `first` and `last` fields.

---

## Migration from Legacy Field Names

If you encounter legacy code using `firstname` or `surname`:

```javascript
// ❌ OLD CODE (incorrect)
const agent = {
    firstname: user.first,
    surname: user.last
};

// ✅ NEW CODE (correct)
const agent = {
    first: user.first,
    last: user.last
};
```

### Common Migration Cases

```javascript
// Case 1: Display name
- `${user.firstname} ${user.surname}`
+ `${user.first} ${user.last}`

// Case 2: Initials
- `${user.firstname?.charAt(0)}${user.surname?.charAt(0)}`
+ `${user.first?.charAt(0)}${user.last?.charAt(0)}`

// Case 3: Alt text
- alt={`${agent.firstname} ${agent.surname}`}
+ alt={`${agent.first} ${agent.last}`}
```

---

## Type Definitions (TypeScript Reference)

```typescript
interface Company {
    name: string;
    phone: string;
    did: string;
    logo: string;
}

interface User {
    id: string;
    first: string;
    last: string;
    email: string;
    phone?: string;
    hash: string;
    role: string;
    avatar?: string;
    avatar_sm?: string;
    neg_id: string;
    did: string;
    cid: string;
    display_name: string;
    need_to_login: boolean;
    bz_hash: string;
    company: Company;
}
```

---

## Testing

### Sample User Object for Testing

```javascript
const mockUser = {
    id: "161",
    first: "Anthony",
    last: "Fowler",
    email: "afeach@gmail.com",
    phone: "",
    hash: "190c00f1",
    role: "30",
    avatar: "/JSON/NIDs/NID/45500/5/1.jpg",
    avatar_sm: "/JSON/NIDs/NID/45500/5/2.jpg",
    neg_id: "45500",
    did: "430",
    cid: "95",
    display_name: "Anthony Fowler",
    need_to_login: false,
    bz_hash: "N190c00f1",
    company: {
        name: "EACH",
        phone: "020 7602 5947",
        did: "430",
        logo: "JSON/NIDs/DIDs/295/220025102156/1.png"
    }
};
```

---

## Related Documentation

- [Authentication Documentation](./authentication.md) (if exists)
- [API Documentation](./property-api-documentation.md)
- [Stripe Integration Testing](./stripe-integration-testing.md)

---

*Last Updated: 2025-10-02*
*Version: 1.0*
*Based on actual user object from production API*
