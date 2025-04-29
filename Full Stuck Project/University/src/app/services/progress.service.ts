import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProgressModel } from '../models/progress.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProgressService {

  constructor(private httpClient: HttpClient) {}

  // Method to create progress (mark a lesson as watched)
  public createProgress(progress: ProgressModel): Observable<ProgressModel> {
    return this.httpClient.post<ProgressModel>(`${environment.progressUrl}`, progress);
  }

  // Method to get course progress for a user
  public getCourseProgress(userId: string, courseId: string): Observable<any> {
    return this.httpClient.get<any>(`${environment.progressUrl}/user/${userId}/course/${courseId}/progress`);
  }
}
