import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { EnrollmentStore } from '../storage/enrollment-store';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { EnrollmentModel } from '../models/enrollment.model';

@Injectable({
  providedIn: 'root'
})
export class EnrollmentService {

    // Injected services
    private httpClient = inject(HttpClient);
    private enrollmentStore = inject(EnrollmentStore);

    // Method to add a new enrollment
    public async addEnrollment(enrollment: EnrollmentModel): Promise<void> {
        const dbEnrollment$ = this.httpClient.post<EnrollmentModel>(environment.enrollmentUrl, EnrollmentModel.toFormData(enrollment));
        const dbEnrollment = await firstValueFrom(dbEnrollment$);
        this.enrollmentStore.addEnrollment(dbEnrollment);
    }

    // Method to get enrollments by user ID
    public async getEnrollmentsByUserId(userId: string): Promise<EnrollmentModel[]> {
        const dbEnrollment$ = this.httpClient.get<EnrollmentModel[]>(`${environment.enrollmentUrl}/user/${userId}`);
        return await firstValueFrom(dbEnrollment$);
    }

    // Method to check if a user is already enrolled in a course
    public async userAlreadyEnrolled(userId: string, courseId: string): Promise<boolean> {
        if (!userId || !courseId) {
            throw new Error("Invalid user or course ID.");
        }
    
        const dbEnrollment$ = this.httpClient.get<boolean>(
            `${environment.enrollmentUrl}/is-enrolled/${userId}/${courseId}`
        );
    
        return await firstValueFrom(dbEnrollment$);
    }

    // Method to delete an enrollment by ID
    public async deleteEnrollment(enrollmentId: string): Promise<void> {
        const observable$ = this.httpClient.delete(`${environment.enrollmentUrl}/${enrollmentId}`);
        await firstValueFrom(observable$);
        this.enrollmentStore.deleteEnrollment(enrollmentId);
    }
}
