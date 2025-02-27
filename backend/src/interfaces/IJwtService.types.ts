export interface IPayload {
  email: string;
  role: string;
  tenantId: string;
  iat?: number;
  exp?: number;
}

export interface IJwtService {
  generateRefreshToken(data: IPayload): Promise<string>;
  generateAccessToken(data: IPayload): Promise<string>;
  verifyJwtToken(token: string): Promise<IPayload>;
}
