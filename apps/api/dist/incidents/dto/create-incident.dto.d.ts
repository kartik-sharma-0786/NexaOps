export declare class CreateIncidentDto {
    title: string;
    description?: string;
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
}
