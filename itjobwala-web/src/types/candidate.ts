export interface CandidateRegisterRequest {
  full_name: string;
  email: string;
  mobile: string;
  password: string;
  work_status: string;
  terms_accepted: boolean;
}

export interface CandidateRegisterResponse {
  success: boolean;
  message: string;
}

export interface CandidateSigninRequest {
  email: string;
  password: string;
}

export interface CandidateSigninResponse {
  success: boolean;
  message: string;
  token: string;
}
