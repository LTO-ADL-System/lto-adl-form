import apiService from './api.js';

class ApplicantService {
  // Get current user's profile
  async getCurrentUserProfile() {
    const response = await apiService.get('/applicants/me');
    return response;
  }

  // Update current user's profile
  async updateProfile(profileData) {
    const response = await apiService.put('/applicants/me', profileData);
    return response;
  }

  // Emergency Contacts Management
  async getEmergencyContacts() {
    const response = await apiService.get('/applicants/emergency-contacts');
    return response;
  }

  async addEmergencyContact(contactData) {
    const response = await apiService.post('/applicants/emergency-contact', contactData);
    return response;
  }

  // Employment Information Management
  async getEmploymentInfo() {
    const response = await apiService.get('/applicants/employment');
    return response;
  }

  async addEmploymentInfo(employmentData) {
    const response = await apiService.post('/applicants/employment', employmentData);
    return response;
  }

  // Family Information Management
  async getFamilyInfo() {
    const response = await apiService.get('/applicants/family');
    return response;
  }

  async addFamilyInfo(familyData) {
    const response = await apiService.post('/applicants/family', familyData);
    return response;
  }

  // Format profile data for update
  formatProfileData(formData) {
    return {
      family_name: formData.familyName,
      first_name: formData.firstName,
      middle_name: formData.middleName || '',
      address: formData.address,
      contact_num: formData.contactNum,
      nationality: formData.nationality || 'Filipino',
      birthdate: formData.birthdate,
      birthplace: formData.birthplace,
      height: parseFloat(formData.height),
      weight: parseFloat(formData.weight),
      eye_color: formData.eyeColor,
      civil_status: formData.civilStatus,
      educational_attainment: formData.educationalAttainment,
      blood_type: formData.bloodType,
      sex: formData.sex,
      is_organ_donor: formData.isOrganDonor || false
    };
  }

  // Format emergency contact data
  formatEmergencyContactData(formData) {
    return {
      full_name: formData.fullName,
      relation: formData.relation,
      contact_num: formData.contactNum,
      address: formData.address || ''
    };
  }

  // Format employment data
  formatEmploymentData(formData) {
    return {
      company_name: formData.companyName,
      position: formData.position,
      employment_type: formData.employmentType,
      start_date: formData.startDate,
      end_date: formData.endDate || null,
      salary: formData.salary ? parseFloat(formData.salary) : null,
      address: formData.address || ''
    };
  }

  // Format family data
  formatFamilyData(formData) {
    return {
      full_name: formData.fullName,
      relation_type: formData.relationType,
      contact_num: formData.contactNum || '',
      birthdate: formData.birthdate || null,
      occupation: formData.occupation || ''
    };
  }

  // Validate profile data
  validateProfileData(profileData) {
    const errors = {};

    if (!profileData.familyName?.trim()) {
      errors.familyName = 'Family name is required';
    }

    if (!profileData.firstName?.trim()) {
      errors.firstName = 'First name is required';
    }

    if (!profileData.address?.trim()) {
      errors.address = 'Address is required';
    }

    if (!profileData.contactNum?.trim()) {
      errors.contactNum = 'Contact number is required';
    } else if (!/^\+?63\d{10}$/.test(profileData.contactNum.replace(/\s/g, ''))) {
      errors.contactNum = 'Invalid Philippine phone number format';
    }

    if (!profileData.birthdate) {
      errors.birthdate = 'Birthdate is required';
    } else {
      const birthDate = new Date(profileData.birthdate);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      
      if (age < 16) {
        errors.birthdate = 'Must be at least 16 years old';
      } else if (age > 100) {
        errors.birthdate = 'Invalid age';
      }
    }

    if (!profileData.birthplace?.trim()) {
      errors.birthplace = 'Birthplace is required';
    }

    if (!profileData.height || profileData.height < 100 || profileData.height > 250) {
      errors.height = 'Height must be between 100-250 cm';
    }

    if (!profileData.weight || profileData.weight < 30 || profileData.weight > 300) {
      errors.weight = 'Weight must be between 30-300 kg';
    }

    if (!profileData.eyeColor?.trim()) {
      errors.eyeColor = 'Eye color is required';
    }

    if (!profileData.civilStatus?.trim()) {
      errors.civilStatus = 'Civil status is required';
    }

    if (!profileData.educationalAttainment?.trim()) {
      errors.educationalAttainment = 'Educational attainment is required';
    }

    if (!profileData.bloodType?.trim()) {
      errors.bloodType = 'Blood type is required';
    }

    if (!profileData.sex?.trim()) {
      errors.sex = 'Sex is required';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  // Validate emergency contact data
  validateEmergencyContactData(contactData) {
    const errors = {};

    if (!contactData.fullName?.trim()) {
      errors.fullName = 'Full name is required';
    }

    if (!contactData.relation?.trim()) {
      errors.relation = 'Relation is required';
    }

    if (!contactData.contactNum?.trim()) {
      errors.contactNum = 'Contact number is required';
    } else if (!/^\+?63\d{10}$/.test(contactData.contactNum.replace(/\s/g, ''))) {
      errors.contactNum = 'Invalid Philippine phone number format';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  // Validate employment data
  validateEmploymentData(employmentData) {
    const errors = {};

    if (!employmentData.companyName?.trim()) {
      errors.companyName = 'Company name is required';
    }

    if (!employmentData.position?.trim()) {
      errors.position = 'Position is required';
    }

    if (!employmentData.employmentType?.trim()) {
      errors.employmentType = 'Employment type is required';
    }

    if (!employmentData.startDate) {
      errors.startDate = 'Start date is required';
    } else {
      const startDate = new Date(employmentData.startDate);
      const today = new Date();
      
      if (startDate > today) {
        errors.startDate = 'Start date cannot be in the future';
      }
    }

    if (employmentData.endDate) {
      const startDate = new Date(employmentData.startDate);
      const endDate = new Date(employmentData.endDate);
      
      if (endDate <= startDate) {
        errors.endDate = 'End date must be after start date';
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  // Validate family data
  validateFamilyData(familyData) {
    const errors = {};

    if (!familyData.fullName?.trim()) {
      errors.fullName = 'Full name is required';
    }

    if (!familyData.relationType?.trim()) {
      errors.relationType = 'Relation type is required';
    }

    if (familyData.contactNum && !/^\+?63\d{10}$/.test(familyData.contactNum.replace(/\s/g, ''))) {
      errors.contactNum = 'Invalid Philippine phone number format';
    }

    if (familyData.birthdate) {
      const birthDate = new Date(familyData.birthdate);
      const today = new Date();
      
      if (birthDate > today) {
        errors.birthdate = 'Birthdate cannot be in the future';
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  // Calculate age from birthdate
  calculateAge(birthdate) {
    const birth = new Date(birthdate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  }

  // Format phone number for display
  formatPhoneNumber(phoneNumber) {
    if (!phoneNumber) return '';
    
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    if (cleaned.startsWith('63')) {
      return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
    } else if (cleaned.length === 11 && cleaned.startsWith('09')) {
      return `+63 ${cleaned.slice(1, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
    }
    
    return phoneNumber;
  }

  // Get full name from profile
  getFullName(profile) {
    if (!profile) return '';
    
    const parts = [profile.first_name, profile.middle_name, profile.family_name].filter(Boolean);
    return parts.join(' ');
  }

  // Check if profile is complete
  isProfileComplete(profile) {
    const requiredFields = [
      'family_name', 'first_name', 'address', 'contact_num',
      'birthdate', 'birthplace', 'height', 'weight', 'eye_color',
      'civil_status', 'educational_attainment', 'blood_type', 'sex'
    ];

    return requiredFields.every(field => profile[field] !== null && profile[field] !== '');
  }
}

export default new ApplicantService(); 