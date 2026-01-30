import { LoginDto, RegisterDto } from './dto/auth.dto';
export declare class AuthService {
    private jwtService;
    constructor(jwtService: JwtServi, ce: any);
    register(dto: RegisterDto): Promise<{
        access_token: any;
        user: {
            id: string;
            email: string;
            role: string;
            tenantId: string;
        };
    }>;
    login(dto: LoginDto): Promise<{
        access_token: any;
        user: {
            id: string;
            email: string;
            role: string;
            tenantId: string;
        };
    }>;
    private generateToken;
}
