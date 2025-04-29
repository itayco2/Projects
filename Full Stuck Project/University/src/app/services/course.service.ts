import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { CourseStore } from '../storage/course-store';
import { CourseModel } from '../models/course.model';
import { environment } from '../../environments/environment';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CourseService {

  // Injected services
  private httpClient = inject(HttpClient);
  private courseStore = inject(CourseStore);

  // Method to get all courses
  public async getAllCourses(): Promise<CourseModel[]> {
    // Check if courses are already in the store
    if (this.courseStore.count()) return this.courseStore.courses();

    // Fetch courses from the backend
    const dbCourses$ = this.httpClient.get<CourseModel[]>(environment.courseUrl);
    const dbCourses = await firstValueFrom(dbCourses$);

    // Initialize the course store with fetched courses
    this.courseStore.initCourse(dbCourses);
    return dbCourses;
  }

  // Method to get a single course by ID
  public async getOneCourse(courseId: string): Promise<CourseModel> {
    // Check if the course is already in the store
    const storedCourse = this.courseStore.courses().find(course => course.id === courseId);
    if (storedCourse) return storedCourse;

    // Fetch the course from the backend
    const course$ = this.httpClient.get<CourseModel>(`${environment.courseUrl}/${courseId}`);
    const dbCourse = await firstValueFrom(course$);
    return dbCourse;
  }

  // Method to add a new course
  public async addCourse(course: CourseModel): Promise<void> {
    // Send the new course to the backend
    const dbCourse$ = this.httpClient.post<CourseModel>(environment.courseUrl, CourseModel.toFormData(course));
    const dbCourse = await firstValueFrom(dbCourse$);

    // Add the new course to the store
    this.courseStore.addCourse(dbCourse);
  }

  public async updateCourse(course : CourseModel): Promise<void>{
    const dbCourse$ = this.httpClient.put<CourseModel>(environment.courseUrl+"/"+course.id, CourseModel.toFormData(course));
    const dbCourse = await firstValueFrom(dbCourse$);
    this.courseStore.updateCourse(dbCourse)
  }

  // Method to delete a course by ID
  public async deleteCourse(courseId: string): Promise<void> {
    // Send the delete request to the backend
    const observable$ = this.httpClient.delete(`${environment.courseUrl}/${courseId}`);
    await firstValueFrom(observable$);

    // Remove the course from the store
    this.courseStore.deleteCourse(courseId);
  }
}
