export const Messages = {
  INVALID_CREDENTIALS: 'Invalid email or password!',
  UNAUTHORIZED_ACCESS: 'You are not authorized to access this resource.',

  // Connection Error
  TENANT_CONNECTION_ERROR: 'Tenant connection not established.',

  // Company Management
  COMPANY_NOT_FOUND: 'Company not found.',
  STATUS_UPDATED: 'Company status updated successfully.',
  INVALID_STATUS: 'Invalid status value. isActive must be a boolean.',
  COMPANY_CREATED: 'Company has been created successfully.',
  COMPANY_DELETED: 'Company has been deleted successfully.',
  COMPANY_UPDATED :'Company updated successfully',
  EMPLOYEE_CREATED :'Employee created successfully',
  EMPLOYEE_ID_REQUIRED: 'Employee ID is required.',
  EMPLOYEE_UPDATE_SUCCESS :'Employee updated successfully.',
  COMPANY_ID_NOT_FOUND: 'Company ID not found in request.',
  MISSING_COMPANY_OR_TENANT_ID: 'Company ID or Tenant ID not found in request.',
  DEPARTMENT_ID_REQUIRED: 'Department ID is required.',
  DEPARTMENT_NAME_REQUIRED: 'Department Name is required.',
  DEPARTMENT_CREATE_SUCCESS :'Department created successfully.',
  DEPARTMENT_UPDATE_SUCCESS :'Department Updated Successfully.',
  // Employee Messages
  USER_ID_NOT_FOUND: 'User ID not found.',
  USER_NOT_FOUND: 'User not found.',
  USER_EMAIL_NOT_FOUND: 'User email not found.',
  CHECK_IN_SUCCESS: 'Checked in successfully.',
  CHECK_OUT_SUCCESS: 'Checked out successfully.',
  LEAVE_NOT_FOUND : 'Leave not found',
  LEAVE_UPDATE_SUCCESS : 'Leave status updated successfully',
  MEETING_NOT_FOUND :'Meeting not found',
  PROJECT_NOT_FOUND :'Project not found',
  TASK_NOT_FOUND : 'Task not found',
  CHAT_CREATE_SUCCESS :'Chat created successfully.',

  // Payments & Subscriptions
  PAYMENT_FAILED: 'Payment processing failed.',
  PAYMENT_SUCCESS: 'Payment was successful.',
  SUBSCRIPTION_EXPIRED: 'Your subscription has expired.',
  SUBSCRIPTION_NOT_FOUND:"Subscription plan not found",
  INVALID_SUBSCRIPTION_ID : "Invalid subscription ID",
  // Validation & Errors
  WRONG_OTP: 'Wrong OTP!',
  MISSING_FIELDS: 'Required fields are missing.',
  INVALID_INPUT: 'Invalid input provided.',
  OTP_VERIFICATION_SUCCESS: 'OTP verification successful!',
  INTERNAL_SERVER_ERROR:
    'An unexpected error occurred. Please try again later.',
  COMPANY_ALREADY_REGISTERED: 'This company is already registered!',

  EMAIL_REQUIRED: 'Email is required',
  OTP_RESEND_FAILED: 'Failed to resend OTP',
  OTP_RESEND_SUCCESS: 'OTP resent successfully',

  EMAIL_NOT_REGISTERED: 'The email is not registered!',
  OTP_SENT_SUCCESS: 'The OTP has been sent to your email',
  TOKEN_VALID: 'Token is valid',
  INVALID_TOKEN: 'Invalid or expired token',
  NO_TOKENS: 'No tokens provided',
  INVALID_REFRESH: 'Invalid refresh token',
  AUTH_FAILED: 'Authentication failed',
  LOGOUT_SUCCESS: 'Logged out successfully',
PASSWORD_CHANGE_SUCCESS: 'Password Changed Successfully',
  STRIPE_WEBHOOK_SECRET_MISSING :'STRIPE_WEBHOOK_SECRET is not defined in environment variables',
  WEBHOOK_VERIFICATION_FAILED :'Webhook signature verification failed',
  MISSING_SESSION_ID :'Missing session ID',
  SESSION_NOT_FOUND :'Session not found',
  METADATA_MISSING : "Metadata is Missing"
};
