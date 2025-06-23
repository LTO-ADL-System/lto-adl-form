# app/crud/analytics.py
from typing import Dict, List, Any
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, extract
from datetime import datetime, date, timedelta
from app.models.applicant import Applicant
from app.models.application import LicenseApplication, ApplicationType
from app.models.appointment import Appointment

class CRUDAnalytics:
    """Analytics and reporting operations"""
    
    def get_dashboard_stats(self, db: Session) -> Dict[str, Any]:
        """Get comprehensive dashboard statistics"""
        
        # Application statistics
        total_applications = db.query(LicenseApplication).count()
        
        pending_applications = db.query(LicenseApplication).filter(
            LicenseApplication.application_status_id.in_(["ASID_PEN", "ASID_REV"])
        ).count()
        
        approved_applications = db.query(LicenseApplication).filter(
            LicenseApplication.application_status_id == "ASID_APP"
        ).count()
        
        rejected_applications = db.query(LicenseApplication).filter(
            LicenseApplication.application_status_id == "ASID_REJ"
        ).count()
        
        # Applicant statistics
        total_applicants = db.query(Applicant).count()
        
        # Time-based statistics
        today = date.today()
        applications_today = db.query(LicenseApplication).filter(
            func.date(LicenseApplication.submission_date) == today
        ).count()
        
        start_of_month = today.replace(day=1)
        applications_this_month = db.query(LicenseApplication).filter(
            LicenseApplication.submission_date >= start_of_month
        ).count()
        
        # Appointment statistics
        upcoming_appointments = db.query(Appointment).filter(
            and_(
                Appointment.appointment_date >= today,
                Appointment.status == "Scheduled"
            )
        ).count()
        
        return {
            "total_applications": total_applications,
            "pending_applications": pending_applications,
            "approved_applications": approved_applications,
            "rejected_applications": rejected_applications,
            "total_applicants": total_applicants,
            "applications_today": applications_today,
            "applications_this_month": applications_this_month,
            "upcoming_appointments": upcoming_appointments,
            "approval_rate": round((approved_applications / total_applications * 100), 2) if total_applications > 0 else 0
        }
    
    def get_application_trends(self, db: Session, days: int = 30) -> List[Dict[str, Any]]:
        """Get application submission trends over specified days"""
        end_date = date.today()
        start_date = end_date - timedelta(days=days)
        
        # Get daily application counts
        daily_stats = db.query(
            func.date(LicenseApplication.submission_date).label('date'),
            func.count(LicenseApplication.application_id).label('count')
        ).filter(
            and_(
                func.date(LicenseApplication.submission_date) >= start_date,
                func.date(LicenseApplication.submission_date) <= end_date
            )
        ).group_by(
            func.date(LicenseApplication.submission_date)
        ).order_by('date').all()
        
        return [{"date": str(stat.date), "applications": stat.count} for stat in daily_stats]
    
    def get_application_type_distribution(self, db: Session) -> List[Dict[str, Any]]:
        """Get distribution of application types"""
        stats = db.query(
            ApplicationType.type_category,
            func.count(LicenseApplication.application_id).label('count')
        ).join(
            LicenseApplication, ApplicationType.application_type_id == LicenseApplication.application_type_id
        ).group_by(
            ApplicationType.type_category
        ).all()
        
        return [{"type": stat.type_category, "count": stat.count} for stat in stats]
    
    def get_age_demographics(self, db: Session) -> List[Dict[str, Any]]:
        """Get age distribution of applicants"""
        today = date.today()
        
        # Define age groups
        age_groups = [
            ("15-20", 15, 20),
            ("21-30", 21, 30),
            ("31-40", 31, 40),
            ("41-50", 41, 50),
            ("51-60", 51, 60),
            ("60+", 61, 100)
        ]
        
        demographics = []
        for group_name, min_age, max_age in age_groups:
            min_birth_date = today - timedelta(days=max_age * 365.25)
            max_birth_date = today - timedelta(days=min_age * 365.25)
            
            count = db.query(Applicant).filter(
                and_(
                    Applicant.birthdate >= min_birth_date,
                    Applicant.birthdate <= max_birth_date
                )
            ).count()
            
            demographics.append({"age_group": group_name, "count": count})
        
        return demographics
    
    def get_monthly_statistics(self, db: Session, year: int = None) -> List[Dict[str, Any]]:
        """Get monthly application statistics for a year"""
        if year is None:
            year = date.today().year
        
        monthly_stats = db.query(
            extract('month', LicenseApplication.submission_date).label('month'),
            func.count(LicenseApplication.application_id).label('total'),
            func.sum(
                func.case(
                    [(LicenseApplication.application_status_id == "ASID_APP", 1)],
                    else_=0
                )
            ).label('approved'),
            func.sum(
                func.case(
                    [(LicenseApplication.application_status_id == "ASID_REJ", 1)],
                    else_=0
                )
            ).label('rejected')
        ).filter(
            extract('year', LicenseApplication.submission_date) == year
        ).group_by(
            extract('month', LicenseApplication.submission_date)
        ).order_by('month').all()
        
        months = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ]
        
        result = []
        for stat in monthly_stats:
            month_name = months[int(stat.month) - 1]
            result.append({
                "month": month_name,
                "total_applications": int(stat.total) if stat.total else 0,
                "approved": int(stat.approved) if stat.approved else 0,
                "rejected": int(stat.rejected) if stat.rejected else 0
            })
        
        return result
    
    def get_location_statistics(self, db: Session) -> List[Dict[str, Any]]:
        """Get appointment statistics by location"""
        from app.models.location import Location
        
        stats = db.query(
            Location.location_name,
            func.count(Appointment.appointment_id).label('total_appointments'),
            func.sum(
                func.case(
                    [(Appointment.status == "Completed", 1)],
                    else_=0
                )
            ).label('completed'),
            func.sum(
                func.case(
                    [(Appointment.status == "Cancelled", 1)],
                    else_=0
                )
            ).label('cancelled')
        ).join(
            Appointment, Location.location_id == Appointment.location_id
        ).group_by(
            Location.location_name
        ).all()
        
        return [
            {
                "location": stat.location_name,
                "total_appointments": int(stat.total_appointments) if stat.total_appointments else 0,
                "completed": int(stat.completed) if stat.completed else 0,
                "cancelled": int(stat.cancelled) if stat.cancelled else 0
            }
            for stat in stats
        ]

crud_analytics = CRUDAnalytics() 