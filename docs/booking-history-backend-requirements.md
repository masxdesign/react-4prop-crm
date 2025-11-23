# Booking History - Backend Requirements

## Overview
Create two new API endpoints to support the Booking History feature for advertisers and estate agents. These endpoints fetch all schedules (bookings) from the `a_magSchedulers` table that have active Stripe subscriptions (`subscription_id IS NOT NULL`).

**Note:** "Bookings" is an alias for "schedules" in the frontend. The actual database table is `a_magSchedulers`.

## Implementation File Structure
- **New file:** `api-mag-schedules-history.js` (recommended for consistency)
- **Alternative:** Add to existing `api-mag-schedules.js`
- **Route prefix:** `/api/crm/mag/schedules/history`

---

## Endpoint 1: Advertiser Booking History

### Route
```
GET /api/crm/mag/schedules/history/advertiser/:advertiserId
```

### Query Parameters
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `status` | string | No | `all` | Filter by booking status: `all`, `active`, `upcoming`, `past` |

### Path Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| `advertiserId` | integer | The advertiser's ID |

### Response Schema
```json
{
  "success": true,
  "data": [
    {
      "id": 123,
      "subscription_id": "sub_xxx",
      "pid": "prop123",
      "agent_company_name": "Smith Estate Agents Ltd",
      "start_date": "2025-01-15",
      "end_date": "2025-03-15",
      "week_no": 8,
      "fixed_week_rate": 50.00,
      "status": "active"
    }
  ]
}
```

### SQL Implementation

**Key Logic:**
- Join to `properties` table to get `CIDS` column
- Extract **first company ID** from comma-separated `CIDS` string
- Join to `a_rcCompany` table using the first company ID to get `agent_company_name`
- Filter by `subscription_id IS NOT NULL`

**SQL Example (MSSQL 2008 - Compatibility Level 100):**
```sql
SELECT
  s.id,
  s.subscription_id,
  s.pid,
  s.start_date,
  s.end_date,
  s.week_no,
  s.fixed_week_rate,
  -- Status calculation
  CASE
    WHEN s.start_date <= GETDATE() AND s.end_date >= GETDATE() THEN 'active'
    WHEN s.start_date > GETDATE() THEN 'upcoming'
    WHEN s.end_date < GETDATE() THEN 'past'
    ELSE 'unknown'
  END as status,
  -- Extract company name from first CIDS company ID
  c.name as agent_company_name
FROM a_magSchedulers s
JOIN properties p ON s.pid = p.id
-- Extract first company ID from comma-separated CIDS and join to companies
LEFT JOIN a_rcCompany c ON c.id = CAST(
  SUBSTRING(p.CIDS, 1, CHARINDEX(',', p.CIDS + ',') - 1) AS INT
)
WHERE
  s.advertiser_id = @advertiserId
  AND s.subscription_id IS NOT NULL
  AND (
    @status = 'all' OR
    (@status = 'active' AND s.start_date <= GETDATE() AND s.end_date >= GETDATE()) OR
    (@status = 'upcoming' AND s.start_date > GETDATE()) OR
    (@status = 'past' AND s.end_date < GETDATE())
  )
ORDER BY s.start_date DESC
```

**Important Notes for MSSQL 2008:**
- Use `a_magSchedulers` table (not `schedules`)
- Use `a_rcCompany` table (not `companies`)
- CHARINDEX, SUBSTRING, CAST are all supported in MSSQL 2008
- GETDATE() is supported for current date/time
- All syntax above is MSSQL 2008 compatible

### Edge Cases to Handle
1. **NULL or Empty CIDS**: If `p.CIDS` is NULL or empty, `agent_company_name` should be `null` or `"N/A"`
2. **Single Company ID**: CIDS like `"456"` (no comma) - CHARINDEX logic handles this correctly
3. **Invalid Company ID**: If the extracted company ID doesn't exist in `a_rcCompany` table, `agent_company_name` will be `null` (LEFT JOIN)
4. **No Subscriptions**: Return empty array if no bookings have `subscription_id`

---

## Endpoint 2: Estate Agent Booking History

### Route
```
GET /api/crm/mag/schedules/history/agent/:agentNid
```

### Query Parameters
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `status` | string | No | `all` | Filter by booking status: `all`, `active`, `upcoming`, `past` |

### Path Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| `agentNid` | integer | The estate agent's NID (neg_id) |

### Response Schema
```json
{
  "success": true,
  "data": [
    {
      "id": 123,
      "subscription_id": "sub_xxx",
      "pid": "prop123",
      "advertiser_company": "ABC Marketing Ltd",
      "start_date": "2025-01-15",
      "end_date": "2025-03-15",
      "week_no": 8,
      "fixed_week_rate": 50.00,
      "status": "active"
    }
  ]
}
```

### SQL Implementation

**Key Logic:**
- Join to `advertisers` table to get `company` field
- Filter by `subscription_id IS NOT NULL`
- Simpler than advertiser endpoint (no CIDS parsing needed)

**SQL Example (MSSQL 2008 - Compatibility Level 100):**
```sql
SELECT
  s.id,
  s.subscription_id,
  s.pid,
  s.start_date,
  s.end_date,
  s.week_no,
  s.fixed_week_rate,
  -- Status calculation
  CASE
    WHEN s.start_date <= GETDATE() AND s.end_date >= GETDATE() THEN 'active'
    WHEN s.start_date > GETDATE() THEN 'upcoming'
    WHEN s.end_date < GETDATE() THEN 'past'
    ELSE 'unknown'
  END as status,
  adv.company as advertiser_company
FROM a_magSchedulers s
JOIN advertisers adv ON s.advertiser_id = adv.id
WHERE
  s.agent_id = @agentNid
  AND s.subscription_id IS NOT NULL
  AND (
    @status = 'all' OR
    (@status = 'active' AND s.start_date <= GETDATE() AND s.end_date >= GETDATE()) OR
    (@status = 'upcoming' AND s.start_date > GETDATE()) OR
    (@status = 'past' AND s.end_date < GETDATE())
  )
ORDER BY s.start_date DESC
```

**Important Notes for MSSQL 2008:**
- Use `a_magSchedulers` table (not `schedules`)
- All SQL functions used are MSSQL 2008 compatible
- Standard JOIN syntax is supported

### Edge Cases to Handle
1. **Missing Advertiser**: If advertiser was deleted, join will fail - use LEFT JOIN and return `null` for `advertiser_company`
2. **No Subscriptions**: Return empty array if no bookings have `subscription_id`

---

## Status Classification Logic

The `status` field should be calculated by the backend based on booking dates:

| Status | Condition |
|--------|-----------|
| `active` | `start_date <= TODAY AND end_date >= TODAY` |
| `upcoming` | `start_date > TODAY` |
| `past` | `end_date < TODAY` |

**Note:** Use `GETDATE()` in SQL for current date/time comparison.

---

## Field Descriptions

### Common Fields (Both Endpoints)
| Field | Type | Description |
|-------|------|-------------|
| `id` | integer | Schedule/booking ID (primary key) |
| `subscription_id` | string | Stripe subscription ID (must not be NULL) |
| `pid` | string | Property ID |
| `start_date` | string | Booking start date (ISO 8601: `YYYY-MM-DD`) |
| `end_date` | string | Booking end date (ISO 8601: `YYYY-MM-DD`) |
| `week_no` | integer | Number of weeks for the booking |
| `fixed_week_rate` | decimal | Weekly rate in GBP |
| `status` | string | Calculated status: `active`, `upcoming`, or `past` |

### Advertiser-Specific Fields
| Field | Type | Description |
|-------|------|-------------|
| `agent_company_name` | string/null | Estate agent company name from first CIDS company ID |

### Agent-Specific Fields
| Field | Type | Description |
|-------|------|-------------|
| `advertiser_company` | string/null | Advertiser company name from advertisers table |

---

## Testing Checklist

### Advertiser Endpoint Testing
- [ ] Returns bookings for correct advertiser
- [ ] Only returns bookings with `subscription_id` present
- [ ] `agent_company_name` extracted from first CIDS company ID
- [ ] Handles NULL CIDS (returns null or "N/A")
- [ ] Handles empty CIDS (returns null or "N/A")
- [ ] Handles single company ID in CIDS (no comma)
- [ ] Handles multiple company IDs in CIDS (extracts first)
- [ ] Invalid company ID returns null for company name
- [ ] Status filter `all` returns all bookings
- [ ] Status filter `active` returns only current bookings
- [ ] Status filter `upcoming` returns only future bookings
- [ ] Status filter `past` returns only completed bookings
- [ ] Results sorted by `start_date DESC`
- [ ] Returns empty array when no bookings found

### Estate Agent Endpoint Testing
- [ ] Returns bookings for correct agent (by neg_id)
- [ ] Only returns bookings with `subscription_id` present
- [ ] `advertiser_company` correctly joined from advertisers table
- [ ] Handles missing advertiser (deleted) gracefully
- [ ] Status filter `all` returns all bookings
- [ ] Status filter `active` returns only current bookings
- [ ] Status filter `upcoming` returns only future bookings
- [ ] Status filter `past` returns only completed bookings
- [ ] Results sorted by `start_date DESC`
- [ ] Returns empty array when no bookings found

---

## Error Handling

### 400 Bad Request
- Invalid `status` query parameter (not one of: all, active, upcoming, past)
- Invalid `advertiserId` or `agentNid` (non-numeric)

### 404 Not Found
- Advertiser ID does not exist
- Agent NID does not exist

### 500 Internal Server Error
- Database connection issues
- Unexpected SQL errors

**Example Error Response:**
```json
{
  "success": false,
  "error": "Invalid status parameter. Must be one of: all, active, upcoming, past"
}
```

---

## Notes for Implementation

1. **Database Compatibility**: SQL examples use MSSQL 2008 syntax (compatibility level 100)
2. **Table Name**: Use `a_magSchedulers` (not `schedules`)
3. **File Structure**: Create new file `api-mag-schedules-history.js` or add to existing `api-mag-schedules.js`
4. **Route Prefix**: Use `/api/crm/mag/schedules/history` to align with existing Magazine schedule endpoints
5. **CIDS Parsing**: The `CHARINDEX` trick `CHARINDEX(',', p.CIDS + ',') - 1` works for both:
   - Single ID: `"456"` → extracts `"456"`
   - Multiple IDs: `"456,789,012"` → extracts `"456"`
6. **Performance**: Consider adding index on `a_magSchedulers.subscription_id` if not already indexed
7. **NULL Handling**: Use LEFT JOIN for `a_rcCompany` to handle missing/invalid company IDs gracefully
8. **Date Comparison**: Use `GETDATE()` consistently for status classification
9. **Sorting**: Default sort by `start_date DESC` (newest first)

---

## Example API Calls

### Advertiser - Get All Bookings
```bash
GET /api/crm/mag/schedules/history/advertiser/123?status=all
```

### Advertiser - Get Active Bookings Only
```bash
GET /api/crm/mag/schedules/history/advertiser/123?status=active
```

### Estate Agent - Get All Bookings
```bash
GET /api/crm/mag/schedules/history/agent/456?status=all
```

### Estate Agent - Get Upcoming Bookings Only
```bash
GET /api/crm/mag/schedules/history/agent/456?status=upcoming
```

---

## Frontend Integration

The frontend will call these endpoints via:
```javascript
// For advertisers
fetchAdvertiserBookings(advertiserId, status)

// For estate agents
fetchAgentBookings(agentNid, status)
```

Both functions use axios with `params` object for query parameters.

---

## Quick Reference Summary

### Endpoints to Create
1. `GET /api/crm/mag/schedules/history/advertiser/:advertiserId?status=all`
2. `GET /api/crm/mag/schedules/history/agent/:agentNid?status=all`

### Database Tables
- **Schedules Table:** `a_magSchedulers` (NOT `schedules`)
- **Companies Table:** `a_rcCompany` (NOT `companies`)
- **Filter:** `subscription_id IS NOT NULL`

### Key Implementation Details
- **File:** `api-mag-schedules-history.js` (new) or `api-mag-schedules.js` (existing)
- **Database:** MSSQL 2008 (Compatibility Level 100)
- **CIDS Parsing:** Extract first company ID from comma-separated property CIDS for advertiser endpoint
- **Status Logic:** Calculate `active`, `upcoming`, or `past` based on start_date and end_date vs GETDATE()
- **Sorting:** ORDER BY start_date DESC (newest first)

### Response Fields
**Advertiser Endpoint:**
- id, subscription_id, pid, agent_company_name (from CIDS), start_date, end_date, week_no, fixed_week_rate, status

**Agent Endpoint:**
- id, subscription_id, pid, advertiser_company (from advertisers table), start_date, end_date, week_no, fixed_week_rate, status
