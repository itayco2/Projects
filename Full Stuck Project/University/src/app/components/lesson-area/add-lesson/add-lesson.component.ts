import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { LessonService } from '../../../services/lesson.service';
import { NotifyService } from '../../../services/notify.service';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LessonModel } from '../../../models/lesson.model';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { youtubeUrlValidator } from '../../../utils/validators';

@Component({
  selector: 'app-add-lesson',
  imports: [ReactiveFormsModule, CommonModule, MatFormFieldModule, MatButtonModule, MatInputModule],
  templateUrl: './add-lesson.component.html',
  styleUrl: './add-lesson.component.css'
})
export class AddLessonComponent implements OnInit {
  // Model to hold lesson data
  private lessonModel = new LessonModel();
  
  // Form group for lesson form
  public lessonFormGroup: FormGroup;
  
  // ID of the course
  public courseId: string = '';

  constructor(
    private lessonService: LessonService,
    private notifyService: NotifyService,
    private router: Router,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute 
  ) {}

  ngOnInit(): void {
    // Get the course ID from the route parameters
    this.courseId = this.route.snapshot.paramMap.get('id') || '';

    // Initialize the form group with form controls and validators
    this.lessonFormGroup = this.formBuilder.group({
      titleControl: new FormControl('', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100),
      ]),
      videoUrlControl: new FormControl('', [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(1000),
        youtubeUrlValidator
      ]),
    });
  }

  // Method to handle form submission
  public async send() {
    try {
      // Assign form values to the lesson model
      this.lessonModel.title = this.lessonFormGroup.get('titleControl')?.value;
      this.lessonModel.videoUrl = this.lessonFormGroup.get('videoUrlControl')?.value;
      this.lessonModel.courseId = this.courseId;

      // Check if all fields are filled
      if (!this.lessonModel.title || !this.lessonModel.videoUrl || !this.lessonModel.courseId) {
        this.notifyService.error('All fields are required');
        return;
      }

      // Call service to add the lesson
      await this.lessonService.addLesson(this.lessonModel);
      this.notifyService.success('Lesson has been added.');

      this.router.navigateByUrl(`/course-details/${this.courseId}/lessons`);
    } catch (err: any) {
      console.error('Error:', err);  
      this.notifyService.error('Error adding the lesson.');
    }
  }

  public isCanceled = false;

  // Method to handle dialog cancel action
  public dialogCanceled() {
    this.isCanceled = true;
  }
}
