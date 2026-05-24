export interface CompanyInfo {
  company: string;
  companyLogo: string;
  companyColorClass: string;
  companyType: 'startup' | 'mnc' | 'product' | 'service';
}

export interface CompanyDetail {
  companySize: string;
  companyFounded: string;
  companyIndustry: string;
  companyWebsite: string;
  aboutCompany: string;
}
