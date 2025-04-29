import { Component, OnInit } from '@angular/core';
import { CourseModel } from '../../../models/course.model';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CourseService } from '../../../services/course.service';
import { NotifyService } from '../../../services/notify.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-course-edit',
  imports: [ReactiveFormsModule, CommonModule, MatFormFieldModule, MatButtonModule, MatInputModule],
  templateUrl: './course-edit.component.html',
  styleUrls: ['./course-edit.component.css']
})
export class CourseEditComponent implements OnInit {
  private courseModel = new CourseModel();
  public courseFormGroup: FormGroup;

  constructor(
    private courseService: CourseService,
    private router: Router,
    private formBuilder: FormBuilder,
    private notifyService: NotifyService,
    private route: ActivatedRoute // To get the course ID from the URL
  ) {}

  ngOnInit(): void {
    // Retrieve the course ID directly from the URL
    const courseId = this.route.snapshot.paramMap.get('id');

    if (courseId) {
      this.courseModel.id = courseId; // Set the course ID in the model
      this.loadCourse(courseId); // Load course details if needed
    }

    // Initialize the form group with form controls and validators
    this.courseFormGroup = this.formBuilder.group({
      titleControl: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]),
      descriptionControl: new FormControl('', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]),
    });
  }

  // Method to load course details if editing an existing course (Optional)
  private loadCourse(courseId: string): void {
    this.courseService.getOneCourse(courseId).then(
      (course) => {
        this.courseModel = course; // Preload course data into the model
        this.courseFormGroup.patchValue({
          titleControl: this.courseModel.title,
          descriptionControl: this.courseModel.description
        });
      }
    ).catch(
      (error) => {
        this.notifyService.error('Failed to load course details.');
      }
    );
  }

  // Method to handle form submission
  public async send() {
    try {
      // Assign form values to the course model
      this.courseModel.title = this.courseFormGroup.get('titleControl').value;
      this.courseModel.description = this.courseFormGroup.get('descriptionControl').value;

      // Call service to update the course using the course ID in the model
      await this.courseService.updateCourse(this.courseModel);

      this.notifyService.success('Course has been updated.');
      this.router.navigateByUrl('/courses');
    } catch (err: any) {
      this.notifyService.error(err);
    }
  }

  // Flag to indicate if the dialog was canceled
  public isCanceled = false;

  public dialogCanceled() {
    this.isCanceled = true;
  }
}
