import { Request } from 'express';

export interface AuthRequest extends Request {
    user?: any;
    token?: string;
}

export default AuthRequest;