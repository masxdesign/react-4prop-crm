# Property API Documentation

This document outlines all endpoints and data transformation requirements for the Property Management System in the 4Prop CRM application.

## Base URLs

### Development Environment
- **4Prop Service**: `https://localhost:50443`
- **BizChat Service**: `https://localhost:8081`
- **Frontend Base Path**: `/crm`

### Production Environment
- **4Prop Service**: `https://www.4prop.com`
- **BizChat Service**: `https://bizchat.uk`
- **Frontend Base Path**: `/new/agentab_crm`

## Core Property Endpoints

### 1. Property Search and Retrieval

#### Search Properties
```
GET /api/search
```
**Parameters:**
- `pids` (string): Comma-separated property IDs
- `page` (number): Page number for pagination
- `perpage` (number): Items per page (default: 15)
- `limit` (number): Maximum results limit
- `enquiryMetric` (boolean): Include enquiry metrics
- `isSuitable` (boolean): Filter for suitable properties
- `enquiryChoicesIsNotNull` (boolean): Filter properties with enquiry choices
- `enquiryChoices` (string): Specific enquiry choice value
- `orderby` (number): Sorting order (9 = default suitable properties order)
- `i` (string): User hash for authentication
- `grade` (string): Property grades filter ("1" = inactive, "2,3,4" = active)
- `gradingUid` (number): User ID for grading context
- `filterByTagId` (string): Search reference tag filter
- `inactive` (boolean): Include inactive properties

**Response Structure:**
```json
{
  "results": [
    {
      "PID": "12345",
      "Types": "1,2",
      "PSTypes": "10,20,30",
      "Status": 0,
      "Price": 250000,
      "Rent": 1500,
      "RentPeriod": "2",
      "Tenure": 12,
      "SizeMin": 1000,
      "SizeMax": 1200,
      "SizeUnit": "1",
      "MinExternal": 0,
      "MaxExternal": 0,
      "SizeUnitExternal": "1",
      "MinIntSqft": 1000,
      "MaxIntSqft": 1200,
      "Images": "image1.jpg*image2.jpg*",
      "MatchPostcode": "SW1A 1AA",
      "TownCity": "London",
      "SuburbLocality": "Westminster",
      "Street": "Main Street",
      "StreetNumber": "123",
      "Building": "Tower Block",
      "BuildingNumber": "A",
      "CentreEstate": "Estate Name",
      "HideIdentity": 0,
      "Latitude": "51.5074",
      "Longitude": "-0.1278",
      "DealsWith": ",123,456,",
      "CIDs": ",10,20,30,",
      "Grade": 3,
      "GradingUpdated": "2023-01-01T10:00:00",
      "Grade_From_UID": 456,
      "Chat_ID": "chat123",
      "Tag_Name": "Prime Location",
      "Tag_ID": 5,
      "Enquiry_Choices": "interested",
      "Description": "Property description",
      "LocationDesc": "Location details",
      "Amenities": "Amenities list"
    }
  ],
  "companies": [
    {
      "CID": 10,
      "C": "COMP001",
      "B": "company-key",
      "Name": "Property Agency Ltd",
      "Phone": "+44 20 1234 5678",
      "Logo": {
        "original": "logos/company-logo.jpg"
      }
    }
  ]
}
```

#### Search Properties by PIDs
```
GET /api/search/properties?pids={comma_separated_pids}
```

#### Fetch Newly Graded Properties
```
GET /api/search/newlyGraded
```

### 2. Property Content and Details

#### Get Property Content
```
GET /api/each?reqPropContentByIds={comma_separated_pids}&isProp={boolean}
```
**Response:** Array of content arrays indexed by PID
```json
{
  "12345": ["description", "location_description", "amenities"],
  "12346": ["description", "location_description", "amenities"]
}
```

### 3. Property Types and Subtypes

#### Get Property Types
```
GET /new/variables/types{version}.json
```

#### Get Property Subtypes
```
GET /new/variables/subtypes{version}.json
```

#### Get Versions (for cache busting)
```
GET /new/variables/versions.json
```

## Magazine/Advertiser Management Endpoints (BizChat Service)

### 1. Agent Properties

#### Get Agent Properties
```
GET /api/crm/mag/agent/properties/{nid}
```

#### Get Agent Properties (Paginated)
```
GET /api/crm/mag/agent/paginated/{nid}?page={page}&pageSize={pageSize}
```

### 2. Advertiser Management

#### Get All Advertisers
```
GET /api/crm/mag/advertisers
```

#### Create Advertiser
```
POST /api/crm/mag/advertisers
Content-Type: application/json

{
  "company": "Advertiser Company Name",
  "contact_name": "John Doe",
  "email": "john@company.com",
  "phone": "+44 20 1234 5678"
}
```

#### Update Advertiser
```
PUT /api/crm/mag/advertisers/{id}
Content-Type: application/json

{
  "company": "Updated Company Name",
  "contact_name": "Jane Doe",
  "email": "jane@company.com",
  "phone": "+44 20 8765 4321"
}
```

#### Delete Advertiser
```
DELETE /api/crm/mag/advertisers/{id}
```

#### Get Advertisers by Property Subtype IDs
```
GET /api/crm/mag/advertisers/by_pstids?pstids={comma_separated_pstids}
```

#### Get Advertiser Properties
```
GET /api/crm/mag/advertisers/{advertiserId}/properties
```

### 3. Schedule Management

#### Get Property Schedules
```
GET /api/crm/mag/schedules/{propertyId}
```

#### Get Property Schedules Summary
```
GET /api/crm/mag/schedules/{propertyId}/summary
```

#### Create Schedule
```
POST /api/crm/mag/schedules/{nid}
Content-Type: application/json

{
  "advertiser_id": 123,
  "start_date": "2023-06-01",
  "end_date": ["2023-06-30"],
  "status": "pending",
  "price": 500.00
}
```

#### Update Schedule
```
PUT /api/crm/mag/schedules/update/{scheduleId}
Content-Type: application/json

{
  "status": "approved",
  "price": 550.00
}
```

#### Approve Schedule
```
POST /api/crm/mag/schedules/{scheduleId}/approve
Content-Type: application/json

{
  "approved_by": 456,
  "approval_date": "2023-05-15T10:00:00Z"
}
```

#### Pay Schedule
```
POST /api/crm/mag/schedules/{scheduleId}/pay
```

#### Assign Approver
```
PUT /api/crm/mag/schedules/{scheduleId}/assign-approver
Content-Type: application/json

{
  "approver_id": 789
}
```

### 4. User and Agent Management

#### Search Agents
```
GET /api/crm/agents/search?email={searchTerm}
```

#### Get Users by NIDs
```
POST /api/users
Content-Type: application/json

{
  "ids": "123,456,789"
}
```

#### Get Schedule Status Options
```
GET /data/mag_schedule_status.json
```

### 5. Magazine Listing Data
```
GET /api/crm/mag/advertiser/{advertiserId}
```

## Authentication Endpoints (4Prop Service)

### Login
```
POST /api/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "each_password": "generated_hash"
}
```

### Who's Online Check
```
POST /api/login?i={hash}
```

### Logout
```
POST /api/account/logout
```

### Fetch User
```
POST /api/account/fetch-user
Content-Type: application/json

{
  "id": 12345
}
```

## CRM Endpoints (4Prop Service)

### Negotiators Management

#### Get Negotiators (Paginated)
```
GET /api/crud/CRM--EACH_db
```
**Parameters:**
- `page` (number): Page number
- `perpage` (number): Items per page
- `include` (string): Fields to include
- `orderBy` (string): Sort field
- `direction` (string): Sort direction ("asc" or "desc")
- `search` (array): Search values
- `column` (array): Search columns
- `ids` (string): Specific IDs to fetch

#### Get Single Negotiator
```
GET /api/crud/CRM--EACH_db/{nid}?include={fields}
```

#### Create Contact Note
```
POST /api/crud/CRM--EACH_db/__createContactNote/{id}
Content-Type: application/json

{
  "type": "3",
  "next": "2023-06-01T10:00:00",
  "note": "Follow up call scheduled"
}
```

#### Create Note
```
POST /api/crud/CRM--EACH_db/__createNote/{nid}
Content-Type: application/json

{
  "type": "0",
  "note": "General note content"
}
```

#### Get Notes
```
GET /api/crud/CRM--EACH_db/__notes/{id}
```

### Property Grading

#### Update Grade
```
PUT /api/records/gradings?i={hash}
Content-Type: application/json

{
  "pid": "12345",
  "grade": 3,
  "autoSearchReference": true,
  "tag_id": 5
}
```

#### Get Facets
```
GET /api/crud/CRM--EACH_db?group=true&column={column}
```

## Data Transformation Requirements

### 1. Property Data Normalization

All property objects must be processed through `lowerKeyObject()` utility to convert all keys to lowercase before use in the frontend.

### 2. Property Data Enhancement

Raw property data must be enhanced using the `propertyCombiner()` function which:

#### Required Dependencies:
- Property types and subtypes data
- Property content (description, location, amenities)
- Company data
- User authentication context (optional)

#### Transformation Process:
1. **Address Text Generation**: Convert raw address fields into display-ready text
2. **Type/Subtype Parsing**: Match type/subtype IDs to readable labels
3. **Size Calculation**: Process size fields into display format
4. **Tenure Processing**: Convert tenure flags into readable text and pricing
5. **Image Processing**: Convert image strings into structured image URLs
6. **Company Association**: Link properties to their managing companies
7. **Content Enhancement**: Sanitize and format property descriptions

#### Key Transformations:

**Address Text:**
```javascript
// Input
{
  "hideidentity": 0,
  "centreestate": "Estate Name",
  "buildingnumber": "A",
  "building": "Tower Block", 
  "streetnumber": "123",
  "street": "Main Street",
  "towncity": "London",
  "suburblocality": "Westminster",
  "matchpostcode": "SW1A 1AA"
}

// Output
"Estate Name, 123 Main Street, Westminster, London, SW1A 1AA"
```

**Image Processing:**
```javascript
// Input
"images": "1|image1.jpg|Caption 1||123|456*2|image2.jpg|Caption 2||123|456*"

// Output
{
  "count": 2,
  "previews": ["https://4prop.com/JSON/NIDs/456/1/3.image1.jpg", ...],
  "thumbs": ["https://4prop.com/JSON/NIDs/456/1/t.image1.jpg", ...],
  "full": ["https://4prop.com/JSON/NIDs/456/1/0.image1.jpg", ...],
  "captions": ["Caption 1", "Caption 2"]
}
```

**Type/Subtype Processing:**
```javascript
// Input
{
  "types": "1,2,3",
  "pstids": "10,20,30"
}

// Output (requires types/subtypes reference data)
{
  "types": [
    {"id": 1, "label": "Office"},
    {"id": 2, "label": "Retail"}
  ],
  "subtypes": [
    {"id": 10, "label": "Modern Office"},
    {"id": 20, "label": "Shop Unit"}
  ]
}
```

**Size Processing:**
```javascript
// Input
{
  "sizemin": 1000,
  "sizemax": 1200,
  "sizeunit": "1",
  "minexternal": 500,
  "maxexternal": 600,
  "sizeunitexternal": "1"
}

// Output
{
  "isIn": true,
  "min": 1000,
  "max": 1200,
  "unit": "sqft",
  "isExt": true,
  "land": {
    "min": 500,
    "max": 600,
    "unit": "sqft"
  }
}
```

**Tenure Processing:**
```javascript
// Input
{
  "tenure": 12, // Binary flags: 4=freehold, 8=long leasehold
  "price": 250000,
  "rent": 1500,
  "rentperiod": "2" // 2=monthly
}

// Output
{
  "isSale": true,
  "isRent": false,
  "price": "£250,000",
  "rent": "",
  "text": "Sale",
  "value": 12
}
```

### 3. Schedule Data Normalization

Schedule data requires normalization through `normalizeScheduleData()`:

```javascript
// Input
{
  "data": {
    "advertiser_id": "123",
    "end_date": ["2023-06-30", "2023-07-31"] // May be array or string
  }
}

// Output
{
  "advertiser_id": "123",
  "advertiser_company": "Company Name", // Resolved from advertisers list
  "end_date": "2023-06-30" // First element if array
}
```

## Error Handling

All endpoints should implement consistent error responses:

```json
{
  "error": true,
  "message": "Error description",
  "code": "ERROR_CODE",
  "details": {}
}
```

## Performance Considerations

1. **Caching**: Property types, subtypes, and versions should be cached
2. **Pagination**: Large datasets must support pagination
3. **Batch Operations**: Multiple property fetches should be batched
4. **Image Optimization**: Images should support multiple sizes (thumb, preview, full)

## Security Requirements

1. **Authentication**: All endpoints require proper session management
2. **Authorization**: User permissions must be validated
3. **CORS**: Proper CORS headers for cross-origin requests
4. **HTTPS**: All production endpoints must use HTTPS
5. **Input Validation**: All input parameters must be validated and sanitized

## Data Relationships

```
Properties
├── Types (M:M via types field)
├── Subtypes (M:M via pstids field)  
├── Companies (M:M via cids field)
├── Agents (M:M via dealswith field)
├── Content (1:1 via PID)
├── Schedules (1:M)
└── Advertisers (M:M via Schedules)

Advertisers
├── Schedules (1:M)
└── Properties (M:M via Schedules)

Schedules
├── Property (M:1)
├── Advertiser (M:1)
└── User/Agent (M:1)
```

This documentation provides the complete API specification needed to implement the backend services that support the 4Prop CRM property management system.