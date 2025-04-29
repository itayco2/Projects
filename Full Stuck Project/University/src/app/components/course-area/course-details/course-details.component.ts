import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CourseService } from '../../../services/course.service';
import { LessonService } from '../../../services/lesson.service'; // Assuming you have a service for lessons
import { LessonModel } from '../../../models/lesson.model';
import { NotifyService } from '../../../services/notify.service';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service'; // Add AuthService to check roles

@Component({
  selector: 'app-course-details',
  imports: [CommonModule, RouterModule],
  templateUrl: './course-details.component.html',
  styleUrls: ['./course-details.component.css']
})
export class CourseDetailsComponent implements OnInit {
    
  public courseId: string = '';
  
  // List of lessons for the course
  public lessons: LessonModel[] = [];
  
  // Flag to indicate if the user can add a lesson
  public canAddLesson: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private courseService: CourseService,
    private lessonService: LessonService,
    private notifyService: NotifyService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Subscribe to route parameters to get the course ID
    this.route.paramMap.subscribe(params => {
      this.courseId = params.get('courseId')!;
      this.getLessonsForCourse();
      this.checkUserRole(); 
    });
  }

  // Method to fetch lessons for the course
  private async getLessonsForCourse() {
    try {
      this.lessons = await this.lessonService.getLessonsForCourse(this.courseId);
    } catch (err: any) {
      this.notifyService.error('Failed to load lessons for this course');
      console.error('Error fetching lessons:', err);
    }
  }



  // Method to delete a course
  public async deleteCourse(courseId: string) {
    try {
      const sure = confirm('Are you sure?');
      if (!sure) return;

      await this.courseService.deleteCourse(courseId);
      this.notifyService.success('Course has been deleted.');

      this.router.navigateByUrl('/courses');
    } catch (err: any) {
      this.notifyService.error('Failed to delete Course students already enrolled');
      console.error(err);
    }
  }

  // Method to check the user's role and set permissions
  private checkUserRole(): void {
    const roles = this.authService.getUserRoles(); 
    this.canAddLesson = roles.includes('Admin') || roles.includes('Professor');
  }
}
