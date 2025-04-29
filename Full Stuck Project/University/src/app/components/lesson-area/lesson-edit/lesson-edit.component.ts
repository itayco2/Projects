import { Component, OnInit } from '@angular/core';
import { LessonModel } from '../../../models/lesson.model';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LessonService } from '../../../services/lesson.service';
import { NotifyService } from '../../../services/notify.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { youtubeUrlValidator } from '../../../utils/validators';

@Component({
  selector: 'app-lesson-edit',
  imports: [ReactiveFormsModule, CommonModule, MatFormFieldModule, MatButtonModule, MatInputModule],
  templateUrl: './lesson-edit.component.html',
  styleUrl: './lesson-edit.component.css'
})
export class LessonEditComponent implements OnInit {

  // Model to hold lesson data
  private lessonModel = new LessonModel();
  
  // Form group for lesson form
  public lessonFormGroup: FormGroup;
  
  // ID of the course
  public courseId: string = '';
  
  // ID of the lesson
  public lessonId: string = '';

  constructor(
    private lessonService: LessonService,
    private notifyService: NotifyService,
    private router: Router,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute 
  ) {}

  ngOnInit(): void {
    // Get the lesson ID and course ID from the route parameters
    this.lessonId = this.route.snapshot.paramMap.get('id') || '';
    this.courseId = this.route.snapshot.paramMap.get('courseid') || '';       


    if(this.lessonId)
        this.loadLesson(this.lessonId)
    

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

  private loadLesson(lessonId: string): void {
    this.lessonService.getOneLesson(lessonId).then(
      (lesson) => {
        this.lessonModel = lesson; // Preload lesson data into the model
        this.lessonFormGroup.patchValue({
          titleControl: this.lessonModel.title,
          videoUrlControl: this.lessonModel.videoUrl
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
      // Assign form values to the lesson model
      this.lessonModel.id = this.lessonId;
      this.lessonModel.title = this.lessonFormGroup.get('titleControl')?.value;
      this.lessonModel.videoUrl = this.lessonFormGroup.get('videoUrlControl')?.value;
      this.lessonModel.courseId = this.courseId;
  
      // Check if all fields are filled
      if (!this.lessonModel.title || !this.lessonModel.videoUrl || !this.lessonModel.courseId) {
        this.notifyService.error('All fields are required');
        return;
      }
  
      // Call service to update the lesson
      await this.lessonService.updateLesson(this.lessonModel);
      this.notifyService.success('Lesson has been edited.');
  
      // Navigate to the lesson details page
      this.router.navigateByUrl(`/lesson-details/${this.lessonModel.id}`);
    } catch (err: any) {
      console.error('Error:', err);  // Log the full error for debugging
      this.notifyService.error('Error editing the lesson.');
    }
  }

  // Flag to indicate if the dialog was canceled
  public isCanceled = false;

  // Method to handle dialog cancel action
  public dialogCanceled() {
    this.isCanceled = true;
  }
}


