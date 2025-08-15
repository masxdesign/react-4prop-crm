# Agent Email Search API Specification

## Overview
This document specifies the API endpoint required for the `AgentEmailSearchField` component, which allows users to search for agents by typing part of an email address and select from a dropdown list of matching agent profiles.

## API Endpoint

### GET `/api/crm/agents/search`

**Purpose**: Search for agents based on partial email match

**Query Parameters**:
- `email` (string, required): Partial email string to search for
- `limit` (integer, optional): Maximum number of results to return (default: 10)

**Request Example**:
```http
GET /api/crm/agents/search?email=john&limit=10
```

## Database Query

**Source Table**: `a_rpNegotiator` table (referred to as agents table in documentation)

**Required Fields**: The endpoint should return the following fields from the a_rpNegotiator table:

| Field Name | Type | Required | Notes |
|------------|------|----------|-------|
| NID | varchar(20) | YES | Primary key - this is the value returned by the form field |
| email | varchar(75) | YES | Used for search matching |
| firstname | nvarchar(50) | YES | Agent's first name |
| surname | nvarchar(50) | YES | Agent's last name |
| Position | varchar(50) | NO | Job title/position (displayed as secondary info) |

**Search Logic**:
- Perform case-insensitive partial match on the `email` field
- Use `LIKE '%{searchTerm}%'` or similar pattern matching
- Order results by email similarity or alphabetically
- Limit results to prevent performance issues

**SQL Example**:
```sql
SELECT NID, email, firstname, surname, Position 
FROM a_rpNegotiator 
WHERE email LIKE '%{searchTerm}%' 
ORDER BY email 
LIMIT 10;
```

## Response Format

**Success Response (200)**:
```json
[
  {
    "NID": "12345",
    "email": "john.doe@example.com",
    "firstname": "John",
    "surname": "Doe", 
    "Position": "Senior Sales Agent"
  },
  {
    "NID": "12346",
    "email": "john.smith@example.com",
    "firstname": "John",
    "surname": "Smith",
    "Position": "Property Manager"
  }
]
```

**Empty Results (200)**:
```json
[]
```

**Error Response (400)**:
```json
{
  "error": "Missing required parameter: email"
}
```

**Error Response (500)**:
```json
{
  "error": "Internal server error"
}
```

## Performance Considerations

1. **Database Indexing**: Consider adding an index on the `email` column for faster searches
2. **Query Optimization**: Limit results to reasonable number (10-20 agents max)
3. **Caching**: Consider caching frequent searches if performance becomes an issue
4. **Rate Limiting**: Implement rate limiting to prevent abuse

## Security Considerations

1. **Input Validation**: Sanitize the email parameter to prevent SQL injection
2. **Authorization**: Ensure the requesting user has permission to search agents
3. **Data Filtering**: Only return active/enabled agents if applicable

## Integration Notes

- The frontend component debounces search requests with a 300ms delay
- Minimum search term length is 2 characters before API calls are made
- The component expects the response to be a JSON array of agent objects
- The `NID` field is used as the form field value when an agent is selected
- Display format in dropdown: `{firstname} {surname}` (primary), `{email}` (secondary), `{Position}` (tertiary)

## Testing

**Test Cases**:
1. Search with valid partial email (e.g., "john") - should return matching agents
2. Search with exact email - should return exact match
3. Search with non-existent email - should return empty array
4. Search with special characters - should handle safely
5. Search with very short term (1 char) - should return appropriate response
6. Search with empty parameter - should return 400 error

**Example Test Data**:
```sql
INSERT INTO a_rpNegotiator (NID, email, firstname, surname, Position) VALUES
('AG001', 'john.doe@4prop.com', 'John', 'Doe', 'Senior Agent'),
('AG002', 'jane.smith@4prop.com', 'Jane', 'Smith', 'Property Manager'),
('AG003', 'bob.johnson@4prop.com', 'Bob', 'Johnson', 'Sales Associate');
```