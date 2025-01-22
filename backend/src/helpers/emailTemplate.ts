export const companyApprovalTemplates = {
    approved: (companyName: string) => `
      Dear ${companyName},
  
      We are pleased to inform you that your request to register your company on WorkSphere has been **approved**. You can
      now access all the features and opportunities available on our platform.
  
      If you have any questions, feel free to contact our support team.
  
      Best regards,  
      The WorkSphere Team
    `,
  
    rejected: (companyName: string, reason: string) => `
      Dear ${companyName},
  
      Thank you for your interest in registering your company on WorkSphere. After reviewing your application, we regret to
      inform you that your request has been **rejected** due to the following reason:
  
      **${reason}**
  
      We appreciate your time and effort in applying. If you have any questions or believe this was a misunderstanding,
      feel free to reach out to our support team.
  
      Best regards,  
      The WorkSphere Team
    `
  };
  