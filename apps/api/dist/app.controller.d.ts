import { AppService } from './app.service';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    getHello(): Promise<{
        message: string;
        tenants: {
            id: string;
            name: string;
            slug: string;
            createdAt: Date;
            updatedAt: Date;
        }[];
        error?: undefined;
    } | {
        message: string;
        error: any;
        tenants?: undefined;
    }>;
}
