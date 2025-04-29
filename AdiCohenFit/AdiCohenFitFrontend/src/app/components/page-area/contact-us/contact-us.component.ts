import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NotifyService } from '../../../services/notify.service';
import emailjs from '@emailjs/browser';

@Component({
  selector: 'app-contact-us',
  imports: [MatFormFieldModule, MatInputModule, MatCheckboxModule, MatButtonModule, CommonModule, ReactiveFormsModule],
  templateUrl: './contact-us.component.html',
  styleUrl: './contact-us.component.css'
})
export class ContactUsComponent implements OnInit {


  
    contactFormGroup!: FormGroup;

    constructor(private formBuilder: FormBuilder, private notifyService: NotifyService) {
      this.contactFormGroup = this.formBuilder.group({
        nameControl: '',
        emailControl: '',
        messageControl: ''
      });
    }
    
  
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

     async send(){
        try{
            emailjs.init('2JnqjigKBL2YnXF38');
        let response = await emailjs.send("service_y2fnc3s","template_txqkc0d",{
            nameControl: this.contactFormGroup.get('nameControl')?.value,
            emailControl: this.contactFormGroup.get('emailControl')?.value,
            messageControl: this.contactFormGroup.get('messageControl')?.value,
            });
            this.notifyService.success("הטופס נשלח בהצלחה");
            this.contactFormGroup.reset();
        }
        catch(error :any){
            this.notifyService.error("בעיה בשליחת הטופס");
        }
    }
  
    // Flag to indicate if the dialog was canceled
    public isCanceled = false;
  
    // Method to handle dialog cancel action
    public dialogCanceled() {
      this.isCanceled = true;
    }
  }
  