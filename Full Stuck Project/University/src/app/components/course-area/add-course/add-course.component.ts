import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CourseModel } from '../../../models/course.model';
import { CourseService } from '../../../services/course.service';
import { Router } from '@angular/router';
import { NotifyService } from '../../../services/notify.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-add-course',
  imports: [ReactiveFormsModule, CommonModule, MatFormFieldModule, MatButtonModule, MatInputModule],
  templateUrl: './add-course.component.html',
  styleUrl: './add-course.component.css'
})
export class AddCourseComponent implements OnInit {

    private courseModel = new CourseModel();
    public courseFormGroup: FormGroup;

    public constructor(
        private courseService: CourseService,
        private router: Router,
        private formBuilder: FormBuilder, 
        private notifyService: NotifyService
    ){}

    public ngOnInit(): void {
        // Initialize the form group with form controls and validators
        this.courseFormGroup = this.formBuilder.group({
            titleControl: new FormControl("", [Validators.required, Validators.minLength(2), Validators.maxLength(100)]),
            descriptionControl: new FormControl("", [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]),
        });
    }

    // Method to handle form submission
    public async send() {
        try {
            // Assign form values to the course model
            this.courseModel.title = this.courseFormGroup.get("titleControl").value;
            this.courseModel.description = this.courseFormGroup.get("descriptionControl").value;
            
            // Call service to add the course
            await this.courseService.addCourse(this.courseModel);
            
            this.notifyService.success("Course has been added.");
            this.router.navigateByUrl("/courses");
        }
        catch (err: any) {
            this.notifyService.error(err);
        }
    }

    // Flag to indicate if the dialog was canceled
    public isCanceled = false;

    public dialogCanceled() {
        this.isCanceled = true;
    }

}
