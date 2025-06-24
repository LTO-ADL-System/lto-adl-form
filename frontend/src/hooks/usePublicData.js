import { useState, useEffect, useCallback } from 'react';
import publicService from '../services/publicService.js';

// Hook for fetching and managing all public reference data
export const usePublicData = () => {
  const [data, setData] = useState({
    applicationTypes: [],
    applicationStatuses: [],
    vehicleCategories: [],
    locations: [],
    organTypes: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);

  // Fetch all public data
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [
        applicationTypesResponse,
        applicationStatusesResponse,
        vehicleCategoriesResponse,
        locationsResponse,
        organTypesResponse
      ] = await Promise.all([
        publicService.getApplicationTypes(),
        publicService.getApplicationStatuses(),
        publicService.getVehicleCategories(),
        publicService.getLocations(),
        publicService.getOrganTypes()
      ]);

      setData({
        applicationTypes: applicationTypesResponse.data,
        applicationStatuses: applicationStatusesResponse.data,
        vehicleCategories: vehicleCategoriesResponse.data,
        locations: locationsResponse.data,
        organTypes: organTypesResponse.data
      });

      setInitialized(true);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear cache and refetch
  const refresh = async () => {
    publicService.clearCache();
    return fetchAllData();
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // Auto-fetch on mount
  useEffect(() => {
    if (!initialized) {
      fetchAllData();
    }
  }, [initialized, fetchAllData]);

  return {
    data,
    loading,
    error,
    initialized,
    fetchAllData,
    refresh,
    clearError
  };
};

// Hook for application types
export const useApplicationTypes = () => {
  const [applicationTypes, setApplicationTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch application types
  const fetchApplicationTypes = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await publicService.getApplicationTypes();
      setApplicationTypes(response.data);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get formatted options for dropdown
  const getOptions = useCallback(async () => {
    try {
      return await publicService.getApplicationTypeOptions();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Get application type by ID
  const getById = useCallback(async (applicationTypeId) => {
    try {
      return await publicService.getApplicationTypeById(applicationTypeId);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // Auto-fetch on mount
  useEffect(() => {
    fetchApplicationTypes();
  }, [fetchApplicationTypes]);

  return {
    applicationTypes,
    loading,
    error,
    fetchApplicationTypes,
    getOptions,
    getById,
    clearError
  };
};

// Hook for vehicle categories
export const useVehicleCategories = () => {
  const [vehicleCategories, setVehicleCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch vehicle categories
  const fetchVehicleCategories = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await publicService.getVehicleCategories();
      setVehicleCategories(response.data);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get formatted options for dropdown
  const getOptions = useCallback(async () => {
    try {
      return await publicService.getVehicleCategoryOptions();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Get vehicle category by ID
  const getById = useCallback(async (categoryId) => {
    try {
      return await publicService.getVehicleCategoryById(categoryId);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // Auto-fetch on mount
  useEffect(() => {
    fetchVehicleCategories();
  }, [fetchVehicleCategories]);

  return {
    vehicleCategories,
    loading,
    error,
    fetchVehicleCategories,
    getOptions,
    getById,
    clearError
  };
};

// Hook for LTO locations
export const useLocations = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch locations
  const fetchLocations = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await publicService.getLocations();
      setLocations(response.data);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get formatted options for dropdown
  const getOptions = useCallback(async () => {
    try {
      return await publicService.getLocationOptions();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Get location by ID
  const getById = useCallback(async (locationId) => {
    try {
      return await publicService.getLocationById(locationId);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // Auto-fetch on mount
  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  return {
    locations,
    loading,
    error,
    fetchLocations,
    getOptions,
    getById,
    clearError
  };
};

// Hook for static form options
export const useFormOptions = () => {
  // Get all static options
  const getBloodTypeOptions = () => publicService.getBloodTypeOptions();
  const getCivilStatusOptions = () => publicService.getCivilStatusOptions();
  const getEducationalAttainmentOptions = () => publicService.getEducationalAttainmentOptions();
  const getSexOptions = () => publicService.getSexOptions();
  const getEyeColorOptions = () => publicService.getEyeColorOptions();
  const getClutchTypeOptions = () => publicService.getClutchTypeOptions();
  const getEmploymentTypeOptions = () => publicService.getEmploymentTypeOptions();
  const getFamilyRelationOptions = () => publicService.getFamilyRelationOptions();
  const getEmergencyContactRelationOptions = () => publicService.getEmergencyContactRelationOptions();

  return {
    getBloodTypeOptions,
    getCivilStatusOptions,
    getEducationalAttainmentOptions,
    getSexOptions,
    getEyeColorOptions,
    getClutchTypeOptions,
    getEmploymentTypeOptions,
    getFamilyRelationOptions,
    getEmergencyContactRelationOptions
  };
};

// Hook for API health check
export const useApiHealth = () => {
  const [healthStatus, setHealthStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check API health
  const checkHealth = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await publicService.getHealthStatus();
      setHealthStatus(response.data);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get welcome message
  const getWelcomeMessage = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await publicService.getWelcomeMessage();
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear error
  const clearError = () => {
    setError(null);
  };

  return {
    healthStatus,
    loading,
    error,
    checkHealth,
    getWelcomeMessage,
    clearError
  };
};

// Hook for organ types (donation)
export const useOrganTypes = () => {
  const [organTypes, setOrganTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch organ types
  const fetchOrganTypes = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await publicService.getOrganTypes();
      setOrganTypes(response.data);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get formatted options for dropdown
  const getOptions = useCallback(async () => {
    try {
      return await publicService.getOrganTypeOptions();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // Auto-fetch on mount
  useEffect(() => {
    fetchOrganTypes();
  }, [fetchOrganTypes]);

  return {
    organTypes,
    loading,
    error,
    fetchOrganTypes,
    getOptions,
    clearError
  };
}; 