# Agency List Endpoint Specification

## Backend API Requirement for Statistics Feature

### Endpoint Details

**URL:** `GET /api/agencies`

**Service:** `property_pub` service
- **Dev:** `https://localhost:8080`
- **Prod:** `https://property.pub`

**Full URL Example:**
```
https://localhost:8080/api/agencies?sortBy=name&order=asc&page=1&limit=20
```

---

## Database Source

**Table:** `[all_public].[dbo].[4propCompanies]`

**Columns Used:**
- `id` → `cid` (Company ID - Primary identifier)
- `name` → `name` (Company/Agency name)
- `url` → `url` (Company website URL)
- `phone` → `phone` (Contact phone number)
- `email` → `email` (Contact email)
- `Type` → `type` (Company type/category)
- `images` → `logo` (Company logo/image path)

---

## Request Parameters

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `sortBy` | string | No | `name` | Field to sort by. Only `name` supported currently. |
| `order` | string | No | `asc` | Sort order: `asc` or `desc` |
| `page` | integer | No | `1` | Page number for pagination (1-indexed) |
| `limit` | integer | No | `20` | Number of items per page (max: 100) |
| `search` | string | No | - | Optional search query to filter agencies by name (case-insensitive) |

**TanStack Query Infinite Scroll Compatibility:**

For infinite scroll with `useInfiniteQuery`, the endpoint should support **cursor-based pagination** OR **offset-based pagination**:

**Option A: Offset-Based (Recommended for simplicity)**
```
GET /api/agencies?offset=0&limit=20
GET /api/agencies?offset=20&limit=20
GET /api/agencies?offset=40&limit=20
```

**Option B: Page-Based (Current spec - also compatible)**
```
GET /api/agencies?page=1&limit=20
GET /api/agencies?page=2&limit=20
GET /api/agencies?page=3&limit=20
```

---

## Response Format

### Success Response (200 OK)

```json
{
  "data": [
    {
      "cid": "95",
      "name": "EACH Property Services Ltd",
      "url": "https://www.each.co.uk",
      "phone": "020 7602 5947",
      "email": "info@each.co.uk",
      "type": "Estate Agent",
      "logo": "JSON/NIDs/DIDs/295/220025102156/1.png"
    },
    {
      "cid": "120",
      "name": "Premier Properties Ltd",
      "url": "https://www.premierproperties.com",
      "phone": "020 1234 5678",
      "email": "contact@premierprops.com",
      "type": "Letting Agent",
      "logo": null
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "total_pages": 8,
    "has_next": true,
    "has_prev": false
  }
}
```

### Response Fields

#### Agency Object (`data[]`)

| Field | Type | Required | Description | DB Column |
|-------|------|----------|-------------|-----------|
| `cid` | string | ✅ Yes | Company ID (agency identifier) - Primary key | `id` |
| `name` | string | ✅ Yes | Agency/Company name | `name` |
| `url` | string | No | Company website URL | `url` |
| `phone` | string | No | Primary contact phone number | `phone` |
| `email` | string | No | Primary contact email | `email` |
| `type` | string | No | Company type/category (e.g., "Estate Agent", "Letting Agent") | `Type` |
| `logo` | string | No | Relative path to company logo/image | `images` |

#### Pagination Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `page` | integer | ✅ Yes | Current page number (1-indexed) |
| `limit` | integer | ✅ Yes | Number of items per page |
| `total` | integer | ✅ Yes | Total number of agencies across all pages |
| `total_pages` | integer | ✅ Yes | Total number of pages |
| `has_next` | boolean | ✅ Yes | Whether there's a next page available |
| `has_prev` | boolean | ✅ Yes | Whether there's a previous page available |

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Invalid pagination parameters",
  "message": "limit must be between 1 and 100"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden",
  "message": "Insufficient permissions to view agencies"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
```

---

## Frontend Implementation

### TanStack Query Standard Query (Paginated)

```javascript
import { useQuery } from '@tanstack/react-query';
import { keepPreviousData } from '@tanstack/react-query';
import propertyPubClient from '@/services/propertyPubClient';

export const fetchAgencies = async ({ page = 1, limit = 20, search = '' }) => {
  const response = await propertyPubClient.get('/api/agencies', {
    params: {
      sortBy: 'name',
      order: 'asc',
      page,
      limit,
      ...(search && { search })
    }
  });
  return response.data;
};

// In component
const { data, isLoading, isFetching, isPlaceholderData } = useQuery({
  queryKey: ['agencies', page, limit, searchQuery],
  queryFn: () => fetchAgencies({ page, limit, search: searchQuery }),
  placeholderData: keepPreviousData, // Keeps old data while loading new page
});
```

---

### TanStack Query Infinite Scroll (useInfiniteQuery)

```javascript
import { useInfiniteQuery } from '@tanstack/react-query';
import propertyPubClient from '@/services/propertyPubClient';

export const fetchAgenciesInfinite = async ({ pageParam = 1, limit = 20, search = '' }) => {
  const response = await propertyPubClient.get('/api/agencies', {
    params: {
      sortBy: 'name',
      order: 'asc',
      page: pageParam,
      limit,
      ...(search && { search })
    }
  });
  return response.data;
};

// In component
const {
  data,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  isLoading,
} = useInfiniteQuery({
  queryKey: ['agencies-infinite', limit, searchQuery],
  queryFn: ({ pageParam = 1 }) =>
    fetchAgenciesInfinite({ pageParam, limit, search: searchQuery }),
  getNextPageParam: (lastPage) => {
    // Return next page number if has_next is true, otherwise undefined
    return lastPage.pagination.has_next
      ? lastPage.pagination.page + 1
      : undefined;
  },
  initialPageParam: 1,
});

// Flatten all pages into single array
const allAgencies = data?.pages.flatMap(page => page.data) ?? [];
```

---

## Search/Filter Functionality

### Frontend Implementation

**Debounced Search Input:**

```javascript
import { useState, useEffect } from 'react';
import { useDebouncedValue } from '@/hooks/use-debounce'; // Or implement debounce

function AgencySearchList() {
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebouncedValue(searchInput, 500); // 500ms delay

  const { data, isLoading } = useQuery({
    queryKey: ['agencies', 1, 20, debouncedSearch],
    queryFn: () => fetchAgencies({ page: 1, limit: 20, search: debouncedSearch }),
    placeholderData: keepPreviousData,
  });

  return (
    <div>
      <input
        type="text"
        placeholder="Search agencies..."
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        className="px-4 py-2 border rounded-md"
      />

      {isLoading && <div>Loading...</div>}

      <div className="mt-4">
        {data?.data.map(agency => (
          <div key={agency.cid} className="p-4 border rounded mb-2">
            <h3 className="font-semibold">{agency.name}</h3>
            <p className="text-sm text-gray-600">{agency.phone}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

**Backend Search Logic:**

The `search` parameter should perform case-insensitive partial matching on the `name` field:

```sql
-- MSSQL Query Example
DECLARE @offset INT = (@page - 1) * @limit;

SELECT
  id AS cid,
  name,
  url,
  phone,
  email,
  Type AS type,
  images AS logo
FROM [all_public].[dbo].[4propCompanies]
WHERE LOWER(name) LIKE LOWER('%' + @search + '%')
ORDER BY name ASC
OFFSET @offset ROWS
FETCH NEXT @limit ROWS ONLY;

-- Get total count for pagination
SELECT COUNT(*) AS total
FROM [all_public].[dbo].[4propCompanies]
WHERE LOWER(name) LIKE LOWER('%' + @search + '%');
```

**Notes:**
- Use `OFFSET...FETCH NEXT` for pagination (MSSQL 2012+)
- Map database column names to API response field names
- `Type` column should be aliased as `type` in response
- `images` column should be aliased as `logo` in response
- `id` column should be returned as `cid` (Company ID)

---

## Testing the Endpoint

### cURL Examples

**1. Basic request (first page, default sort):**
```bash
curl -X GET "https://localhost:8080/api/agencies?sortBy=name&order=asc&page=1&limit=20" \
  -H "Cookie: session=your_session_cookie"
```

**2. With search filter:**
```bash
curl -X GET "https://localhost:8080/api/agencies?search=premier&page=1&limit=20" \
  -H "Cookie: session=your_session_cookie"
```

**3. Second page:**
```bash
curl -X GET "https://localhost:8080/api/agencies?page=2&limit=20" \
  -H "Cookie: session=your_session_cookie"
```

---

## Performance Considerations

1. **Indexing:** Ensure database index on `name` column for fast sorting and searching
   ```sql
   CREATE INDEX IX_4propCompanies_Name ON [all_public].[dbo].[4propCompanies](name);
   ```
2. **Caching:** Consider caching the agency list (it changes infrequently)
3. **Pagination:** Limit max page size to 100 to prevent performance issues
4. **Search Optimization:** Use full-text search if available for better performance on large datasets
5. **MSSQL Compatibility:** Database is MSSQL 2017 with compatibility level 100 (SQL Server 2008)

---

## Implementation Checklist

- [ ] Create `GET /api/agencies` endpoint in property_pub service
- [ ] Query `[all_public].[dbo].[4propCompanies]` table
- [ ] Map database columns: `id` → `cid`, `Type` → `type`, `images` → `logo`
- [ ] Implement alphabetical sorting by `name` column (default)
- [ ] Add pagination support using `OFFSET...FETCH NEXT` (MSSQL 2012+)
- [ ] Add search filter functionality (case-insensitive `LIKE` on `name` column)
- [ ] Calculate pagination metadata (`total`, `total_pages`, `has_next`, `has_prev`)
- [ ] Return proper response format with `data` and `pagination` objects
- [ ] Add authentication/authorization checks (withCredentials: true)
- [ ] Test with various page sizes and search queries
- [ ] Consider adding database index on `name` column for performance
- [ ] Document in API documentation

---

## Summary

**Endpoint:** `GET /api/agencies`
**Service:** property_pub (`https://localhost:8080` dev, `https://property.pub` prod)

**TanStack Query Compatibility:**
- ✅ **Standard Pagination:** Use `useQuery` with `page` parameter and `keepPreviousData`
- ✅ **Infinite Scroll:** Use `useInfiniteQuery` with `getNextPageParam` based on `pagination.has_next`

**Search/Filter:**
- ✅ Use `search` query parameter for case-insensitive name filtering
- ✅ Frontend: Debounce search input (500ms) to reduce API calls
- ✅ Backend: Partial match on agency name field

**Required Response Fields:**
- `data[]` - Array of agency objects with at minimum: `cid` (from `id`), `name`
- Optional fields: `url`, `phone`, `email`, `type` (from `Type`), `logo` (from `images`)
- `pagination` - Object with: `page`, `limit`, `total`, `total_pages`, `has_next`, `has_prev`

**Database Mapping:**
- Table: `[all_public].[dbo].[4propCompanies]`
- Column mapping: `id` → `cid`, `Type` → `type`, `images` → `logo`
