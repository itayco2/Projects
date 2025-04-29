import { Component, inject, OnInit, signal } from '@angular/core';
import { ProgressService } from '../../../services/progress.service';
import { EnrollmentService } from '../../../services/enrollment.service';
import { UserStore } from '../../../storage/user-store';
import { CourseService } from '../../../services/course.service';
import { CourseModel } from '../../../models/course.model';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { NotifyService } from '../../../services/notify.service';

@Component({
    selector: 'app-progress',
    imports: [CommonModule, RouterModule],
    templateUrl: './progress.component.html',
    styleUrls: ['./progress.component.css']
})
export class ProgressComponent implements OnInit {

    // List of courses the user is enrolled in
    public courses = signal<CourseModel[]>([]);
    
    // ID of the user
    public userId: string = '';
    
    // List of course progress data
    public courseProgress: { courseId: string, totalLessons: number, watchedLessons: number, progressPercentage: number }[] = [];

    // Injected services
    private progressService = inject(ProgressService);
    private enrollmentService = inject(EnrollmentService);
    private userStore = inject(UserStore);
    private courseService = inject(CourseService);
    private notifyService = inject(NotifyService);
    private router = inject(Router);

    async ngOnInit(): Promise<void> {
        const user = this.userStore.user();
        this.userId = user?.id || '';

        if (this.userId) {
            try {
                // Fetch enrollments and courses
                const enrollments = await this.enrollmentService.getEnrollmentsByUserId(this.userId);
                const courses = await this.courseService.getAllCourses();
                if (enrollments == null) return;

                // Filter courses based on enrollments
                this.courses.set(courses.filter(course =>
                    enrollments.some(enrollment => enrollment.courseId === course.id)
                ));

                // Calculate progress for each course
                for (const course of this.courses()) {
                    const progressData = await this.progressService.getCourseProgress(this.userId, course.id).toPromise();

                    const totalLessons = progressData.totalLessons || 0;
                    const watchedLessons = progressData.watchedLessons || 0;

                    let progressPercentage = 0;
                    if (totalLessons > 0) {
                        progressPercentage = (watchedLessons / totalLessons) * 100;
                    }

                    this.courseProgress.push({
                        courseId: course.id,
                        totalLessons,
                        watchedLessons,
                        progressPercentage: Math.round(progressPercentage)
                    });
                }
            } catch (error) {
                console.error('Error loading enrollments, courses or progress:', error);
            }
        }
    }

    // Method to get the completion percentage of a course
    getCourseCompletionPercentage(courseId: string): number {
        const progress = this.courseProgress.find(p => p.courseId === courseId);
        return progress ? progress.progressPercentage : 0;
    }

    // Flag to indicate if an enrollment is being deleted
    private isDeleting = false;

    // Method to delete an enrollment
    public async deleteEnrollment(courseId: string) {
        if (this.isDeleting) return;
        this.isDeleting = true;

        try {
            const sure = confirm('Are you sure?');
            if (!sure) return;

            // Call service to delete the enrollment
            await this.enrollmentService.deleteEnrollment(courseId);

            // Update the list of courses
            this.courses.update(courses => courses.filter(c => c.id !== courseId));

            this.notifyService.success('Enrollment has been deleted.');
        } 
        catch (err: any) {
            console.error('Failed to delete enrollment:', err);
            this.notifyService.error('Failed to delete enrollment.');
        }
        finally {
            this.isDeleting = false;
        }
    }
}
