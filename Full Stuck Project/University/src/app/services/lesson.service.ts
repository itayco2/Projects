import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { LessonStore } from '../storage/lesson-store';
import { LessonModel } from '../models/lesson.model';
import { environment } from '../../environments/environment';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LessonService {

  // Injected services
  private httpClient = inject(HttpClient);
  private lessonStore = inject(LessonStore);

  // Method to get all lessons
  public async getAllLessons(): Promise<LessonModel[]> {
    // Check if lessons are already in the store
    if (this.lessonStore.count()) return this.lessonStore.lessons();
    
    // Fetch lessons from the backend
    const dbLessons$ = this.httpClient.get<LessonModel[]>(environment.lessonUrl);
    const dbLessons = await firstValueFrom(dbLessons$);
    
    // Initialize the lesson store with fetched lessons
    this.lessonStore.initLessons(dbLessons);
    return dbLessons;
  }

  // Method to get lessons for a specific course
  public async getLessonsForCourse(courseId: string): Promise<LessonModel[]> {
    const lessons = this.lessonStore.lessons();
    if (lessons.length) return lessons.filter(lesson => lesson.courseId === courseId);
    
    // Fetch lessons from the backend
    const lessons$ = this.httpClient.get<LessonModel[]>(`${environment.lessonUrl}?courseId=${courseId}`);
    const dbLessons = await firstValueFrom(lessons$);
    
    // Initialize the lesson store with fetched lessons
    this.lessonStore.initLessons(dbLessons);
    return dbLessons.filter(lesson => lesson.courseId === courseId);
  }

  // Method to get a single lesson by ID
  public async getOneLesson(lessonId: string): Promise<LessonModel> {
    // Check if the lesson is already in the store
    const storedLesson = this.lessonStore.lessons().find(lesson => lesson.id === lessonId);
    if (storedLesson) return storedLesson;
    
    const lesson$ = this.httpClient.get<LessonModel>(`${environment.lessonUrl}/${lessonId}`);
    const dbLesson = await firstValueFrom(lesson$);
    return dbLesson;
  } 

  // Method to update a lesson
  public async updateLesson(lesson: LessonModel): Promise<void> {
    const url = `${environment.lessonUrl}/${lesson.courseId}/${lesson.id}`;
    
    // Send the updated lesson to the backend
    const dbLesson$ = this.httpClient.put<LessonModel>(url, lesson);
    const dbLesson = await firstValueFrom(dbLesson$);
    
    // Update the lesson in the store
    this.lessonStore.updateLesson(dbLesson);
  }

  // Method to add a new lesson
  public async addLesson(lesson: LessonModel): Promise<void> {
    // Send the new lesson to the backend
    const dbLesson$ = this.httpClient.post<LessonModel>(environment.lessonUrl, lesson, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const dbLesson = await firstValueFrom(dbLesson$);
    
    // Add the new lesson to the store
    this.lessonStore.addLesson(dbLesson);
  }

  // Method to delete a lesson by ID
  public async deleteLesson(lessonId: string): Promise<void> {
    // Send the delete request to the backend
    const dbLesson$ = this.httpClient.delete<LessonModel>(`${environment.lessonUrl}/${lessonId}`);
    await firstValueFrom(dbLesson$);
    
    // Remove the lesson from the store
    this.lessonStore.deleteLesson(lessonId);
  }
}