import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { LessonModel } from '../../../models/lesson.model';
import { LessonService } from '../../../services/lesson.service';
import { NotifyService } from '../../../services/notify.service';
import { UserStore } from '../../../storage/user-store';  // Assuming you have a UserStore service

@Component({
  selector: 'app-lesson-list',
  imports: [CommonModule, RouterModule],
  templateUrl: './lesson-list.component.html',
  styleUrls: ['./lesson-list.component.css']
})
export class LessonListComponent implements OnInit {

    // List of lessons
    public lessons: LessonModel[] = [];
    
    // ID of the user
    public userId: string = '';
    
    // List of course IDs the user is enrolled in
    public enrolledCourseIds: string[] = [];  

    // Injecting UserStore to get the user's enrollment status
    private userStore = inject(UserStore); 

    public constructor(
        private activatedRoute: ActivatedRoute,
        private lessonService: LessonService,
        private router: Router,
        private notifyService: NotifyService
    ) {}

    public async ngOnInit() {
        try {
            // Fetch all lessons
            this.lessons = await this.lessonService.getAllLessons();

            // Get the user ID from UserStore
            this.userId = this.userStore.user()?.id || '';

            // Fetch enrolled courses for the user
            this.enrolledCourseIds = await this.getUserEnrolledCourses(this.userId);

        } catch (err: any) {
            this.notifyService.error('Failed to load lessons');
            console.error(err);
        }
    }

    // Check if the user is enrolled in the course associated with the lesson
    public isEnrolled(lesson: LessonModel): boolean {
        return this.enrolledCourseIds.includes(lesson.courseId);
    }

    // Mock-up method to get the enrolled courses for a user
    // Replace this with your actual service call
    private async getUserEnrolledCourses(userId: string): Promise<string[]> {
        // Here you would make a call to the backend to get the user's enrolled courses
        return ['courseId1', 'courseId2'];  // Example enrolled course IDs
    }
}
