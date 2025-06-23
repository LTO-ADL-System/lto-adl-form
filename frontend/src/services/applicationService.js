import apiService from './api.js';

class ApplicationService {
  // Submit complete application
  async submitCompleteApplication(applicationData) {
    const response = await apiService.post('/applications/submit-complete', applicationData);
    return response;
  }

  // Get user's applications with pagination
  async getUserApplications(skip = 0, limit = 20) {
    const response = await apiService.get(`/applications/?skip=${skip}&limit=${limit}`);
    return response;
  }

  // Get specific application by ID
  async getApplicationById(applicationId) {
    const response = await apiService.get(`/applications/${applicationId}`);
    return response;
  }

  // Get application status history
  async getApplicationHistory(applicationId) {
    const response = await apiService.get(`/applications/${applicationId}/history`);
    return response;
  }

  // Check required documents for application
  async getRequiredDocuments(applicationId) {
    const response = await apiService.get(`/applications/${applicationId}/required-documents`);
    return response;
  }

  // Helper method to format application data for submission
  formatApplicationData(formData) {
    return {
      application_type_id: formData.applicationType,
      vehicle_categories: formData.vehicleCategories,
      clutch_types: formData.clutchTypes || ['Manual'],
      additional_requirements: formData.additionalRequirements || '',
      personal_info: {
        family_name: formData.personalInfo.familyName,
        first_name: formData.personalInfo.firstName,
        middle_name: formData.personalInfo.middleName || '',
        address: formData.personalInfo.address,
        contact_num: formData.personalInfo.contactNum,
        nationality: formData.personalInfo.nationality || 'Filipino',
        birthdate: formData.personalInfo.birthdate,
        birthplace: formData.personalInfo.birthplace,
        height: parseFloat(formData.personalInfo.height),
        weight: parseFloat(formData.personalInfo.weight),
        eye_color: formData.personalInfo.eyeColor,
        civil_status: formData.personalInfo.civilStatus,
        educational_attainment: formData.personalInfo.educationalAttainment,
        blood_type: formData.personalInfo.bloodType,
        sex: formData.personalInfo.sex,
        is_organ_donor: formData.personalInfo.isOrganDonor || false
      },
      license_details: {
        existing_license_number: formData.licenseDetails?.existingLicenseNumber || null,
        license_expiry_date: formData.licenseDetails?.licenseExpiryDate || null,
        license_restrictions: formData.licenseDetails?.licenseRestrictions || null
      },
      documents: formData.documents || [],
      emergency_contacts: formData.emergencyContacts || [],
      employment_info: formData.employmentInfo || [],
      family_info: formData.familyInfo || []
    };
  }

  // Get application type display name
  getApplicationTypeDisplayName(typeId) {
    const types = {
      'ATID_NEW': 'New License',
      'ATID_REN': 'License Renewal',
      'ATID_DUP': 'Duplicate License'
    };
    return types[typeId] || typeId;
  }

  // Get application status display name
  getApplicationStatusDisplayName(statusId) {
    const statuses = {
      'ASID_PEN': 'Pending',
      'ASID_SFA': 'Subject for Approval',
      'ASID_APR': 'Approved',
      'ASID_REJ': 'Rejected',
      'ASID_RSB': 'Resubmission Required'
    };
    return statuses[statusId] || statusId;
  }

  // Get vehicle category display name
  getVehicleCategoryDisplayName(categoryId) {
    const categories = {
      'CAT_A': 'Motorcycle',
      'CAT_B': 'Car',
      'CAT_C': 'Truck',
      'CAT_D': 'Bus'
    };
    return categories[categoryId] || categoryId;
  }

  // Check if application can be edited
  canEditApplication(statusId) {
    const editableStatuses = ['ASID_PEN', 'ASID_RSB'];
    return editableStatuses.includes(statusId);
  }

  // Check if application is approved
  isApplicationApproved(statusId) {
    return statusId === 'ASID_APR';
  }

  // Check if application is rejected
  isApplicationRejected(statusId) {
    return statusId === 'ASID_REJ';
  }

  // Check if documents are complete
  areDocumentsComplete(requiredDocs) {
    return requiredDocs.missing_documents.length === 0;
  }
}

export default new ApplicationService(); 