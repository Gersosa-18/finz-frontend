export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type?: string;
}

export interface RefreshResponse {
  access_token: string;
  refresh_token?: string;
  token_type?: string;
}
