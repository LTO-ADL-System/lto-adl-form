# LTO ADL Form Backend API - Frontend Developer Guide

## Quick Setup

1. **Activate Virtual Environment**: `.\venv\Scripts\activate`
2. **Install Dependencies**: `pip install -r requirements.txt`
3. **Run Server**: `uvicorn app.main:app --reload --host 0.0.0.0 --port 8080`
4. **Test API**: Open `http://localhost:8080/docs`

**Base URL**: `http://localhost:8080/api/v1/`

## User Flow & Authentication

### 1. Registration/Login Flow

| Endpoint | Method | Description | Auth | Request Body | Response |
|----------|--------|-------------|------|--------------|----------|
| `/auth-supabase/sign-up-request` | POST | Send signup OTP | No | `{email, password}` | OTP sent message |
| `/auth-supabase/login-request` | POST | Send login OTP | No | `{email, password}` | OTP sent message |
| `/auth-supabase/verify-otp` | POST | Verify OTP & complete auth | No | `{email, otp_code, action, password?}` | `{access_token, refresh_token, user}` |
| `/auth-supabase/refresh-token` | POST | Get new access token | No | `{refresh_token}` | New tokens |

**Frontend Implementation Notes:**
- Store `access_token` in localStorage/sessionStorage
- Include token in all authenticated requests: `Authorization: Bearer {token}`
- Admin users must use email: `madalto.official@gmail.com`

### 2. Application Submission Flow

| Endpoint | Method | Description | Auth | Request Body | Response |
|----------|--------|-------------|------|--------------|----------|
| `/applications/submit-complete` | POST | Submit complete application | Yes | Full application data | Application created with ID |
| `/applications/` | GET | Get user's applications | Yes | Query: `skip`, `limit` | Applications list with pagination |
| `/applications/{id}` | GET | Get specific application | Yes | None | Application details |
| `/applications/{id}/required-documents` | GET | Check document requirements | Yes | None | Required vs uploaded documents |

**Key Request Structure for Application Submission:**
```json
{
  "application_type_id": "ATID_NEW|ATID_REN|ATID_DUP",
  "vehicle_categories": ["CAT_A|CAT_B|CAT_C|CAT_D"],
  "personal_info": { /* personal details */ },
  "documents": [ /* document list */ ],
  "emergency_contacts": [ /* contacts */ ]
}
```

### 3. Document Management Flow

| Endpoint | Method | Description | Auth | Request Body | Response |
|----------|--------|-------------|------|--------------|----------|
| `/documents/upload` | POST | Upload document file | Yes | FormData: `application_id`, `document_type`, `file` | Document uploaded |
| `/documents/application/{application_id}` | GET | Get application documents | Yes | None | Documents list |
| `/documents/{document_id}` | DELETE | Delete document | Yes | None | Document deleted |

**Required Document Types:**
- Birth Certificate
- Valid ID 
- Medical Certificate
- Student Driver's Permit (new applications)
- PDC Certificate (specific categories)

### 4. Appointment Scheduling Flow

| Endpoint | Method | Description | Auth | Request Body | Response |
|----------|--------|-------------|------|--------------|----------|
| `/appointments/locations/{location_id}/available-slots` | GET | Get available time slots | Yes | Query: `appointment_date` | Available time slots array |
| `/appointments/` | POST | Schedule appointment | Yes | `{application_id, location_id, appointment_date, appointment_time}` | Appointment created |
| `/appointments/` | GET | Get user appointments | Yes | Query: `skip`, `limit` | Appointments list |
| `/appointments/{id}` | PUT | Reschedule appointment | Yes | `{appointment_date, appointment_time}` | Updated appointment |
| `/appointments/{id}` | DELETE | Cancel appointment | Yes | None | Appointment cancelled |

### 5. Profile Management

| Endpoint | Method | Description | Auth | Request Body | Response |
|----------|--------|-------------|------|--------------|----------|
| `/applicants/me` | GET | Get user profile | Yes | None | User profile data |
| `/applicants/me` | PUT | Update profile | Yes | Profile update data | Updated profile |
| `/applicants/emergency-contacts` | GET/POST | Manage emergency contacts | Yes | Contact data (POST) | Contacts list/created |
| `/applicants/employment` | GET/POST | Manage employment info | Yes | Employment data (POST) | Employment list/created |
| `/applicants/family` | GET/POST | Manage family info | Yes | Family data (POST) | Family list/created |

## Admin Endpoints (Admin Only)

| Endpoint | Method | Description | Auth | Request Body | Response |
|----------|--------|-------------|------|--------------|----------|
| `/admin/dashboard` | GET | Dashboard statistics | Admin | None | Statistics summary |
| `/admin/applications` | GET | All applications | Admin | Query: `skip`, `limit`, `search_query` | Applications list |
| `/admin/applications/filtered` | GET | Advanced filtering | Admin | Query: `type_filter`, `status_filter`, `sort_by` | Filtered applications |
| `/admin/applications/{id}/approve` | POST | Approve application | Admin | `{application_id}` | Approval confirmation |
| `/admin/applications/{id}/reject` | POST | Reject application | Admin | `{rejection_reason, additional_notes}` | Rejection confirmation |
| `/admin/applications/bulk-approve` | POST | Bulk approve | Admin | `{application_ids[]}` | Bulk operation results |
| `/admin/applications/bulk-reject` | POST | Bulk reject | Admin | `{application_ids[], rejection_reason}` | Bulk operation results |

## Reference Data Endpoints (Public)

| Endpoint | Method | Description | Response Data |
|----------|--------|-------------|---------------|
| `/public/application-types` | GET | Get application types | `[{application_type_id, type_name, description}]` |
| `/public/vehicle-categories` | GET | Get vehicle categories | `[{category_id, category_name, description}]` |
| `/public/locations` | GET | Get LTO locations | `[{location_id, location_name, address}]` |
| `/public/application-statuses` | GET | Get status options | `[{application_status_id, status_name, description}]` |
| `/public/health` | GET | API health check | `{status: "healthy"}` |

## Frontend Constants

### Application Types
- `ATID_NEW`: New License
- `ATID_REN`: License Renewal  
- `ATID_DUP`: Duplicate License

### Application Statuses
- `ASID_PEN`: Pending
- `ASID_SFA`: Subject for Approval
- `ASID_APR`: Approved
- `ASID_REJ`: Rejected
- `ASID_RSB`: Resubmission Required

### Vehicle Categories
- `CAT_A`: Motorcycle
- `CAT_B`: Car
- `CAT_C`: Truck
- `CAT_D`: Bus

## Error Handling

All endpoints return consistent structure:

**Success Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* response data */ }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error description", 
  "data": null
}
```

**Common HTTP Status Codes:**
- `200`: Success
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden (Admin required)
- `404`: Not Found
- `422`: Validation Error
- `500`: Server Error

## File Upload Requirements

- **Max Size**: 10MB per file
- **Formats**: PDF, PNG, JPG, JPEG
- **Upload Method**: FormData with `multipart/form-data`

## Frontend Development Tips

1. **Token Management**: Store JWT in localStorage, auto-refresh when needed
2. **Error Display**: Show `message` field from API responses to users
3. **Loading States**: Handle async operations with proper loading indicators
4. **Form Validation**: Validate required fields before API calls
5. **File Uploads**: Use FormData for document uploads
6. **Pagination**: Use `skip` and `limit` parameters for lists
7. **Admin Detection**: Check if user email is `madalto.official@gmail.com`

## Sample Frontend Flow

```javascript
// 1. Login
const loginResponse = await fetch('/api/v1/auth-supabase/verify-otp', {
  method: 'POST',
  body: JSON.stringify({email, otp_code, action: 'login', password})
});

// 2. Store token
localStorage.setItem('token', loginResponse.data.access_token);

// 3. Make authenticated requests
const headers = {
  'Authorization': `Bearer ${localStorage.getItem('token')}`,
  'Content-Type': 'application/json'
};

// 4. Submit application
const appResponse = await fetch('/api/v1/applications/submit-complete', {
  method: 'POST',
  headers,
  body: JSON.stringify(applicationData)
});

// 5. Upload documents
const formData = new FormData();
formData.append('application_id', appResponse.data.application_id);
formData.append('document_type', 'Birth Certificate');
formData.append('file', fileInput.files[0]);

await fetch('/api/v1/documents/upload', {
  method: 'POST',
  headers: {'Authorization': `Bearer ${token}`},
  body: formData
});
```