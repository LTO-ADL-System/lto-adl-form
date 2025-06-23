import apiService from './api.js';

class PublicService {
  // Cache for reference data to avoid repeated API calls
  cache = {};

  // Get API health status
  async getHealthStatus() {
    const response = await apiService.get('/public/health', false);
    return response;
  }

  // Get welcome message and API info
  async getWelcomeMessage() {
    const response = await apiService.get('/public/', false);
    return response;
  }

  // Get all application types
  async getApplicationTypes() {
    if (this.cache.applicationTypes) {
      return this.cache.applicationTypes;
    }

    const response = await apiService.get('/public/application-types', false);
    this.cache.applicationTypes = response;
    return response;
  }

  // Get all application statuses
  async getApplicationStatuses() {
    if (this.cache.applicationStatuses) {
      return this.cache.applicationStatuses;
    }

    const response = await apiService.get('/public/application-statuses', false);
    this.cache.applicationStatuses = response;
    return response;
  }

  // Get all vehicle categories
  async getVehicleCategories() {
    if (this.cache.vehicleCategories) {
      return this.cache.vehicleCategories;
    }

    const response = await apiService.get('/public/vehicle-categories', false);
    this.cache.vehicleCategories = response;
    return response;
  }

  // Get all LTO office locations
  async getLocations() {
    if (this.cache.locations) {
      return this.cache.locations;
    }

    const response = await apiService.get('/public/locations', false);
    this.cache.locations = response;
    return response;
  }

  // Get organ types for donation
  async getOrganTypes() {
    if (this.cache.organTypes) {
      return this.cache.organTypes;
    }

    const response = await apiService.get('/public/organ-types', false);
    this.cache.organTypes = response;
    return response;
  }

  // Clear cache (useful when data might have been updated)
  clearCache() {
    this.cache = {};
  }

  // Get formatted options for dropdowns
  async getApplicationTypeOptions() {
    const response = await this.getApplicationTypes();
    return response.data.map(type => ({
      value: type.application_type_id,
      label: type.type_name,
      description: type.description
    }));
  }

  async getVehicleCategoryOptions() {
    const response = await this.getVehicleCategories();
    return response.data.map(category => ({
      value: category.category_id,
      label: category.category_name,
      description: category.description
    }));
  }

  async getLocationOptions() {
    const response = await this.getLocations();
    return response.data.map(location => ({
      value: location.location_id,
      label: location.location_name,
      address: location.address
    }));
  }

  async getOrganTypeOptions() {
    const response = await this.getOrganTypes();
    return response.data.map(organ => ({
      value: organ.organ_type_id,
      label: organ.organ_name,
      description: organ.description
    }));
  }

  // Get specific application type by ID
  async getApplicationTypeById(applicationTypeId) {
    const response = await this.getApplicationTypes();
    return response.data.find(type => type.application_type_id === applicationTypeId);
  }

  // Get specific vehicle category by ID
  async getVehicleCategoryById(categoryId) {
    const response = await this.getVehicleCategories();
    return response.data.find(category => category.category_id === categoryId);
  }

  // Get specific location by ID
  async getLocationById(locationId) {
    const response = await this.getLocations();
    return response.data.find(location => location.location_id === locationId);
  }

  // Get blood type options (static data)
  getBloodTypeOptions() {
    return [
      { value: 'A+', label: 'A+' },
      { value: 'A-', label: 'A-' },
      { value: 'B+', label: 'B+' },
      { value: 'B-', label: 'B-' },
      { value: 'AB+', label: 'AB+' },
      { value: 'AB-', label: 'AB-' },
      { value: 'O+', label: 'O+' },
      { value: 'O-', label: 'O-' }
    ];
  }

  // Get civil status options (static data)
  getCivilStatusOptions() {
    return [
      { value: 'Single', label: 'Single' },
      { value: 'Married', label: 'Married' },
      { value: 'Divorced', label: 'Divorced' },
      { value: 'Widowed', label: 'Widowed' },
      { value: 'Separated', label: 'Separated' }
    ];
  }

  // Get educational attainment options (static data)
  getEducationalAttainmentOptions() {
    return [
      { value: 'Elementary', label: 'Elementary' },
      { value: 'High School', label: 'High School' },
      { value: 'Vocational', label: 'Vocational' },
      { value: 'College', label: 'College' },
      { value: 'Post Graduate', label: 'Post Graduate' }
    ];
  }

  // Get sex/gender options (static data)
  getSexOptions() {
    return [
      { value: 'Male', label: 'Male' },
      { value: 'Female', label: 'Female' }
    ];
  }

  // Get eye color options (static data)
  getEyeColorOptions() {
    return [
      { value: 'Black', label: 'Black' },
      { value: 'Brown', label: 'Brown' },
      { value: 'Blue', label: 'Blue' },
      { value: 'Green', label: 'Green' },
      { value: 'Gray', label: 'Gray' },
      { value: 'Hazel', label: 'Hazel' }
    ];
  }

  // Get clutch type options (static data)
  getClutchTypeOptions() {
    return [
      { value: 'Manual', label: 'Manual Transmission' },
      { value: 'Automatic', label: 'Automatic Transmission' }
    ];
  }

  // Get employment type options (static data)
  getEmploymentTypeOptions() {
    return [
      { value: 'Full-time', label: 'Full-time' },
      { value: 'Part-time', label: 'Part-time' },
      { value: 'Contract', label: 'Contract' },
      { value: 'Self-employed', label: 'Self-employed' },
      { value: 'Unemployed', label: 'Unemployed' },
      { value: 'Student', label: 'Student' },
      { value: 'Retired', label: 'Retired' }
    ];
  }

  // Get family relation options (static data)
  getFamilyRelationOptions() {
    return [
      { value: 'Spouse', label: 'Spouse' },
      { value: 'Parent', label: 'Parent' },
      { value: 'Child', label: 'Child' },
      { value: 'Sibling', label: 'Sibling' },
      { value: 'Guardian', label: 'Guardian' },
      { value: 'Other', label: 'Other' }
    ];
  }

  // Get emergency contact relation options (static data)
  getEmergencyContactRelationOptions() {
    return [
      { value: 'Spouse', label: 'Spouse' },
      { value: 'Parent', label: 'Parent' },
      { value: 'Child', label: 'Child' },
      { value: 'Sibling', label: 'Sibling' },
      { value: 'Friend', label: 'Friend' },
      { value: 'Colleague', label: 'Colleague' },
      { value: 'Other', label: 'Other' }
    ];
  }
}

export default new PublicService(); 