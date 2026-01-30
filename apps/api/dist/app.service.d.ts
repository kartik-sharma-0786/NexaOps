export declare class AppService {
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
