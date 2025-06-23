# app/utils/email.py
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

def send_email(
    to_email: str,
    subject: str,
    html_content: str,
    text_content: Optional[str] = None
) -> bool:
    """Send email using SMTP"""
    
    if not settings.SMTP_HOST or not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        logger.warning("Email settings not configured. Email not sent.")
        # For development, just log the email content
        logger.info(f"Would send email to {to_email}: {subject}")
        logger.info(f"Content: {html_content}")
        return True
    
    try:
        # Create message
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = f"{settings.EMAILS_FROM_NAME} <{settings.EMAILS_FROM_EMAIL or settings.SMTP_USER}>"
        msg['To'] = to_email
        
        # Add text content
        if text_content:
            text_part = MIMEText(text_content, 'plain')
            msg.attach(text_part)
        
        # Add HTML content
        html_part = MIMEText(html_content, 'html')
        msg.attach(html_part)
        
        # Send email
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            if settings.SMTP_TLS:
                server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.send_message(msg)
        
        logger.info(f"Email sent successfully to {to_email}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {str(e)}")
        return False

def send_otp_email(email: str, otp_code: str, otp_type: str) -> bool:
    """Send OTP verification email"""
    
    subject_map = {
        "registration": "Complete Your MadaLTO Registration",
        "login": "MadaLTO Login Verification",
        "password_reset": "Reset Your MadaLTO Password"
    }
    
    subject = subject_map.get(otp_type, "MadaLTO Verification Code")
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>{subject}</title>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background-color: #1e40af; color: white; padding: 20px; text-align: center; }}
            .content {{ padding: 20px; background-color: #f9fafb; }}
            .otp-code {{ 
                background-color: #1e40af; 
                color: white; 
                padding: 15px 30px; 
                font-size: 24px; 
                font-weight: bold; 
                text-align: center; 
                margin: 20px 0; 
                border-radius: 8px;
                letter-spacing: 3px;
            }}
            .footer {{ padding: 20px; text-align: center; font-size: 12px; color: #666; }}
            .warning {{ color: #dc2626; font-weight: bold; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>MadaLTO System</h1>
            </div>
            <div class="content">
                <h2>Verification Code</h2>
                <p>Hello,</p>
                <p>You have requested a verification code for your MadaLTO account. Please use the following code to complete your {otp_type}:</p>
                
                <div class="otp-code">{otp_code}</div>
                
                <p><strong>This code will expire in {settings.OTP_EXPIRE_MINUTES} minutes.</strong></p>
                
                <p class="warning">⚠️ Do not share this code with anyone. MadaLTO staff will never ask for your verification code.</p>
                
                <p>If you did not request this code, please ignore this email or contact our support team.</p>
                
                <p>Thank you,<br>
                The MadaLTO Team</p>
            </div>
            <div class="footer">
                <p>This is an automated message. Please do not reply to this email.</p>
                <p>&copy; 2024 MadaLTO System. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    text_content = f"""
    MadaLTO System - Verification Code
    
    Hello,
    
    You have requested a verification code for your MadaLTO account.
    Please use the following code to complete your {otp_type}:
    
    {otp_code}
    
    This code will expire in {settings.OTP_EXPIRE_MINUTES} minutes.
    
    Do not share this code with anyone. MadaLTO staff will never ask for your verification code.
    
    If you did not request this code, please ignore this email or contact our support team.
    
    Thank you,
    The MadaLTO Team
    """
    
    return send_email(email, subject, html_content, text_content) 