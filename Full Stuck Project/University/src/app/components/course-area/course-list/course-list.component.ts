import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { inject } from '@angular/core';
import { CourseModel } from '../../../models/course.model';
import { CourseService } from '../../../services/course.service';
import { EnrollmentService } from '../../../services/enrollment.service';
import { Router, RouterModule } from '@angular/router';
import { NotifyService } from '../../../services/notify.service';
import { UserStore } from '../../../storage/user-store';
import { EnrollmentModel } from '../../../models/enrollment.model';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-course-list',
  standalone: true, 
  imports: [CommonModule, RouterModule],
  templateUrl: './course-list.component.html',
  styleUrls: ['./course-list.component.css']
})
export class CourseListComponent implements OnInit {
  // List of all courses
  public courses: CourseModel[] = [];
  
  // List of enrolled courses
  public enrolledCourses: EnrollmentModel[] = [];
  
  // Flag to indicate if the user can add a course
  public canAddCourse: boolean = false; 
  
  // Injected services
  public authService = inject(AuthService); 
  private userStore = inject(UserStore); 

  constructor(
    private courseService: CourseService,
    private enrollmentService: EnrollmentService, 
    private router: Router,
    private notifyService: NotifyService
  ) {}

  public async ngOnInit() {
    try {
      // Fetch all courses
      this.courses = await this.courseService.getAllCourses();
      
      // Load enrollments for the current user
      await this.loadEnrollments();
       
      // Check if the user can add a course
      this.canAddCourse = this.authService.hasRole(['Admin', 'Professor']);
    } catch (err: any) {
      this.notifyService.error(err);
    }
  }

  // Method to load enrollments for the current user
  private async loadEnrollments() {
    try {
      const user = this.userStore.user();
      if (!user) {
        this.notifyService.error('User not found');
        return;
      }
      for (let course of this.courses) {
        const isEnrolled = await this.enrollmentService.userAlreadyEnrolled(user.id, course.id);
        if (isEnrolled) {
          this.enrolledCourses.push({ userId: user.id, courseId: course.id, id: '', enrolledAt: new Date() });
        }
      }
    } catch (err: any) {
      this.notifyService.error(err);
    }
  }

  // Method to check if the user is enrolled in a course
  public isEnrolled(course: CourseModel): boolean {
    return this.enrolledCourses.some(enrollment => enrollment.courseId === course.id);
  }

  // Method to enroll the user in a course
  public async enroll(course: CourseModel) {
    try {
      const user = this.userStore.user();
      if (!user) {
        this.notifyService.error('User not found');
        return;
      }

      const enrollment: EnrollmentModel = {
        id: '', 
        userId: user.id, 
        courseId: course.id, 
        enrolledAt: new Date()
      };

      await this.enrollmentService.addEnrollment(enrollment);
      this.enrolledCourses.push(enrollment); // Update the list of enrolled courses

      this.notifyService.success(`Successfully enrolled in ${course.title}!`);
    } catch (err: any) {
      this.notifyService.error(err);
    }
  }
  
  // Method to check if the user can view the course
  public canViewCourse(): boolean {
    return this.authService.hasRole(['Admin', 'Professor']);
  }
}
