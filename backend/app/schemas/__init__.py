# app/schemas/__init__.py
from .applicant import (
    ApplicantCreate,
    ApplicantUpdate,
    ApplicantResponse,
    ApplicantProfile,
    MinimalApplicantCreate
)
from .admin import (
    AdminCreate,
    AdminUpdate,
    AdminResponse,
    DashboardStats,
    ApplicationApproval,
    ApplicationRejection,
    DocumentVerification
)
from .auth import (
    Token,
    TokenData,
    UserLogin,
    UserRegister,
    SimpleUserRegister,
    RequestOTP,
    VerifyOTP,
    RegisterWithOTP,
    SimpleRegisterWithOTP,
    LoginWithOTP,
    OTPResponse
)
from .application import (
    LicenseApplicationCreate,
    LicenseApplicationUpdate,
    LicenseApplicationResponse,
    ApplicationStatusResponse,
    ApplicationTypeResponse,
    ApplicationStatusHistoryResponse
)
from .appointment import (
    AppointmentCreate,
    AppointmentUpdate,
    AppointmentResponse
)
from .document import (
    DocumentUpload,
    DocumentResponse
)
from .family import (
    FamilyInformationCreate,
    FamilyInformationResponse
)
from .employment import (
    EmploymentCreate,
    EmploymentResponse
)
from .emergency import (
    EmergencyContactCreate,
    EmergencyContactResponse
)
from .donation import (
    DonationCreate,
    DonationResponse,
    OrganResponse
)
from .vehicle import (
    VehicleCategoryResponse,
    ApplicationVehicleCategoryCreate,
    ApplicationVehicleCategoryResponse
)
