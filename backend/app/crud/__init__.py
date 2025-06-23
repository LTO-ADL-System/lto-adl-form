from .base import CRUDBase
from .applicant import crud_applicant
from .application import crud_application, crud_application_status, crud_application_type
from .appointment import crud_appointment
from .document import crud_document
from .family import crud_family
from .employment import crud_employment
from .emergency import crud_emergency
from .donation import crud_donation, crud_organ
from .vehicle import crud_vehicle_category
from .location import crud_location
from .license_condition import crud_license_condition
from .driving_skill import crud_driving_skill
from .user import crud_user
from .analytics import crud_analytics
from .admin import crud_admin
from .otp import crud_email_otp
