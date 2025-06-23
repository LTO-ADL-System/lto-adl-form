# LTO ADL Form Backend

## Revised Application Flow

### Overview
After successful registration or login, users can immediately submit complete applications (New, Renewal, or Duplicate) using a single comprehensive endpoint that processes everything at once.

### Application Flow

#### 1. **User Registration/Login** ✅
- User authenticates via Supabase Auth
- Receives access token
- **No applicant record created yet**

#### 2. **Choose Application Type**
Users can immediately choose to submit:
- **New License Application**
- **License Renewal**  
- **Duplicate License**

#### 3. **Complete Application Form**
Users fill out comprehensive form including:
- Personal Information
- License Details (for renewal/duplicate)
- Emergency Contacts
- Employment Information
- Family Information
- Document Information

#### 4. **Finalize & Submit**
On the finalize page, users review all information and submit everything at once using:

**`POST /api/v1/applications/submit-complete`**

### Complete Application Submission

#### Request Schema
```json
{
  "application_type_id": "ATID_NEW",
  "vehicle_categories": ["CAT_B"],
  "clutch_types": ["Manual"],
  "additional_requirements": "First time applicant",
  
  "personal_info": {
    "family_name": "Curada",
    "first_name": "John Paul",
    "middle_name": "Middle",
    "address": "123 Main St, Manila, Philippines",
    "contact_num": "+639123456789",
    "nationality": "Filipino",
    "birthdate": "1990-01-01",
    "birthplace": "Manila",
    "height": 175.0,
    "weight": 70.0,
    "eye_color": "Brown",
    "civil_status": "Single",
    "educational_attainment": "College",
    "blood_type": "O+",
    "sex": "Male",
    "is_organ_donor": false
  },
  
  "license_details": {
    "existing_license_number": "L12-34-567890",
    "license_expiry_date": "2025-12-31",
    "license_restrictions": "None"
  },
  
  "documents": [
    {
      "document_type_id": "DTID_BIRTH_CERT",
      "document_name": "Birth Certificate",
      "notes": "Original copy"
    },
    {
      "document_type_id": "DTID_VALID_ID",
      "document_name": "National ID",
      "notes": "Government issued"
    }
  ],
  
  "emergency_contacts": [
    {
      "full_name": "Jane Curada",
      "relation": "Spouse",
      "contact_num": "+639987654321",
      "address": "Same as applicant"
    }
  ],
  
  "employment_info": [
    {
      "company_name": "ABC Corporation",
      "position": "Software Developer",
      "employment_type": "Full-time",
      "start_date": "2020-01-01"
    }
  ],
  
  "family_info": [
    {
      "full_name": "Jane Curada",
      "relation_type": "Spouse",
      "contact_num": "+639987654321"
    }
  ]
}
```

#### Backend Processing (Atomic Transaction)
1. **Create/Update Applicant** - From personal_info
2. **Create Application** - Main application record
3. **Add Vehicle Categories** - With clutch types
4. **Create Status History** - Initial pending status
5. **Process Emergency Contacts** - If provided
6. **Process Employment Info** - If provided
7. **Process Family Info** - If provided
8. **Create Document Records** - For file upload tracking
9. **Update License Details** - For renewal/duplicate

#### Response
```json
{
  "success": true,
  "message": "Welcome! Your application has been submitted successfully. You are now a registered applicant.",
  "data": {
    "application_id": "APP_001_20241225",
    "applicant_id": "APP_001",
    "application_type_id": "ATID_NEW",
    "application_status_id": "ASID_PEN",
    "submission_date": "2024-12-25T10:30:00Z",
    "message": "Application processed successfully",
    "summary": {
      "is_new_applicant": true,
      "total_applications": 1,
      "emergency_contacts_added": 1,
      "employment_records_added": 1,
      "family_members_added": 1,
      "documents_to_upload": 2,
      "vehicle_categories": 1
    }
  }
}
```

### Key Benefits

✅ **Single Transaction** - All or nothing approach
✅ **Complete Data** - Everything processed at once
✅ **Atomic Operations** - Rollback on any failure
✅ **Comprehensive Validation** - All data validated together
✅ **Clear User Flow** - Simple finalize → submit process
✅ **Flexible** - Works for New, Renewal, Duplicate applications
✅ **Backward Compatible** - Legacy endpoint still available

### API Endpoints

#### Primary Endpoint
- `POST /api/v1/applications/submit-complete` - Complete application submission

#### Secondary Endpoints (after submission)
- `GET /api/v1/applicants/me` - View profile (now works)
- `GET /api/v1/applications/` - View applications
- `PUT /api/v1/applicants/me` - Update profile
- `POST /api/v1/documents/upload` - Upload document files

### Application Types Supported
- **ATID_NEW** - New License
- **ATID_REN** - License Renewal  
- **ATID_DUP** - Duplicate License