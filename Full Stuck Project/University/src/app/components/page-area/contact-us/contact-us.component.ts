import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NotifyService } from '../../../services/notify.service';

@Component({
  selector: 'app-contact-us',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, MatCheckboxModule, MatButtonModule, CommonModule, ReactiveFormsModule],
  templateUrl: './contact-us.component.html',
  styleUrls: ['./contact-us.component.css']
})
export class ContactUsComponent implements OnInit {
  // Form group for contact form
  public contactFormGroup: FormGroup;

  constructor(private formBuilder: FormBuilder, private notifyService: NotifyService) { }

  ngOnInit(): void {
    // Initialize the form group with form controls and validators
    this.contactFormGroup = this.formBuilder.group({
      nameControl: new FormControl('', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50)
      ]),
      emailControl: new FormControl('', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100),
        Validators.pattern('^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$')
      ]),
      messageControl: new FormControl('', [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(1000)
      ])
    });
  }

  // Flag to indicate if the dialog was canceled
  public isCanceled = false;

  // Method to handle dialog cancel action
  public dialogCanceled() {
    this.isCanceled = true;
  }
}
