# LTO Application Testing Guide

## 🚀 Quick Start

1. **Start Backend:**
   ```bash
   cd backend
   python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

2. **Start Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Access Application:** http://localhost:5173

---

## 📝 Step-by-Step Sample Data

### **Step 1: Personal Information**

#### Basic Information:
- **Last Name:** Dela Cruz
- **First Name:** Juan Carlos  
- **Middle Name:** Santos
- **Sex:** Male
- **Birthdate:** 1995-03-15
- **Civil Status:** Single
- **Height:** 175 cm
- **Weight:** 70 kg
- **Contact Number:** +639123456789
- **Nationality:** Filipino
- **Educational Attainment:** College
- **Birthplace:** Manila, Philippines
- **TIN:** 123456789

#### Father's Information:
- **Family Name:** Dela Cruz
- **First Name:** Roberto
- **Middle Name:** Garcia
- **Deceased:** ❌ (unchecked)

#### Mother's Information:
- **Family Name:** Santos
- **First Name:** Maria  
- **Middle Name:** Lopez
- **Deceased:** ❌ (unchecked)

#### Spouse's Information:
- Leave all fields empty for single status
- **Deceased:** ❌ (unchecked)

#### Address Details:
- **Region:** National Capital Region (NCR)
- **Province:** Metro Manila
- **Municipality:** Manila
- **ZIP Code:** 1000
- **Barangay:** Ermita
- **Street/Subdivision/Purok:** P. Burgos Street
- **House No./Unit No./Lot/Bldg:** Unit 123, ABC Building

#### Employment Details:
- **Employer's Business Name:** ABC Corporation
- **Employer's Telephone:** +6328123456
- **Employer's Address:** Makati Business District, Makati City

#### Emergency Contact:
- **Name:** Maria Dela Cruz
- **Contact Number:** +639987654321
- **Same as Applicant Address:** ✅ (checked)

---

### **Step 2: License Details**

#### Application Type:
- **New Application:** ✅ (checked)
- All other options: ❌ (unchecked)

#### Organ Donation:
- **Organ Donor:** Yes
- **Organs:** Heart, Kidney (select multiple)
- **Blood Type:** A+

#### Driving Conditions:
- **Conditions:** None

#### Driving Skill Acquisition:
- **Driving Skill:** Driving School
- **Driver's License Number:** (leave empty for new application)
- **New Application:** ✅ (checked)

#### Vehicle Categories:
- Select **B** (Car/Light Vehicle)
- This will automatically map to `VCID_L6` in the backend

---

### **Step 3: Documents**

Upload sample PDF files for each required document:
- **Valid ID:** national_id.pdf
- **Medical Certificate:** medical_cert.pdf  
- **PDC Certificate:** pdc_cert.pdf
- **Student Driver's Permit:** student_permit.pdf

> **Note:** Use PDF files under 5MB each

---

### **Step 4: Finalize**

Review all information. The finalize page should now display:

#### ✅ Personal Information:
- Full name, contact details, address
- Father's name: Roberto Garcia Dela Cruz
- Mother's name: Maria Lopez Santos
- Employment and emergency contact info

#### ✅ License Details:
- Application type: New Application
- Vehicle category: B
- Organ donation: Yes (Heart, Kidney)
- Driving conditions: None
- Blood type: A+

#### ✅ Documents:
- All 4 documents should be listed as uploaded

#### ✅ Submit:
- Click "Submit Application"
- Should receive success message

---

## 🔧 Backend Data Mapping

The frontend data gets transformed to this backend format:

```json
{
  "application_type_id": "ATID_A",
  "vehicle_categories": ["VCID_L6"],
  "clutch_types": ["Manual"],
  "personal_info": {
    "family_name": "Dela Cruz",
    "first_name": "Juan Carlos",
    "middle_name": "Santos",
    "blood_type": "A+",
    "is_organ_donor": true
  },
  "emergency_contacts": [{
    "ec_name": "Maria Dela Cruz",
    "ec_contact_no": "+639987654321",
    "ec_address": "Unit 123, ABC Building, P. Burgos Street, Ermita, Manila, Metro Manila, National Capital Region (NCR), 1000"
  }],
  "employment_info": [{
    "employer_business_name": "ABC Corporation",
    "employer_telephone": "+6328123456", 
    "employer_address": "Makati Business District, Makati City"
  }],
  "family_info": [
    {
      "relation_type": "Father",
      "family_name": "Dela Cruz",
      "first_name": "Roberto",
      "middle_name": "Garcia"
    },
    {
      "relation_type": "Mother", 
      "family_name": "Santos",
      "first_name": "Maria",
      "middle_name": "Lopez"
    }
  ],
  "additional_data": {
    "drivingSkill": "driving_school",
    "organs": ["heart", "kidney"],
    "conditions": ["none"]
  }
}
```

---

## 🐛 Troubleshooting

### Common Issues:

1. **422 Validation Error:**
   - Check all required fields are filled
   - Ensure phone numbers are in +63XXXXXXXXXX format
   - Verify blood type is correctly selected

2. **500 Server Error:**
   - Check backend logs for detailed error messages
   - Ensure database is running
   - Verify all environment variables are set

3. **Fields Not Showing in Finalize:**
   - Check browser console for JavaScript errors
   - Verify session storage has the data
   - Ensure field names match the session state keys

### Debug Tips:

1. **Check Session Storage:**
   ```javascript
   // In browser console
   console.log(sessionStorage.getItem('lto_application_personal'));
   console.log(sessionStorage.getItem('lto_application_license')); 
   console.log(sessionStorage.getItem('lto_application_documents'));
   ```

2. **Backend Logs:**
   - Check terminal running the backend for detailed logging
   - Look for validation errors and data transformation logs

---

## 🎯 Expected Success Response

After successful submission, you should see:

```json
{
  "success": true,
  "message": "Welcome! Your application has been submitted successfully. You are now a registered applicant.",
  "data": {
    "application_id": "APPID_XXX",
    "applicant_id": "APP_XXX", 
    "submission_date": "2025-06-25T04:46:54.316Z",
    "summary": {
      "is_new_applicant": true,
      "vehicle_categories": 1,
      "emergency_contacts_added": 1,
      "employment_records_added": 1,
      "family_members_added": 2,
      "documents_to_upload": 4
    }
  }
}
``` 