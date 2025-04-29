import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { UserModel } from '../../../models/user.model';
import { UserService } from '../../../services/user.service';
import { Router } from '@angular/router';
import { NotifyService } from '../../../services/notify.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { extraSpacing } from '../../../utils/validators';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSelectModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
    // Form group for user registration form
    public userFormGroup!: FormGroup;

    public constructor(
        private userService: UserService,
        private router: Router,
        private formBuilder: FormBuilder, 
        private notifyService: NotifyService
    ) {}

    ngOnInit(): void {
       // Initialize the form group with form controls and validators
       this.userFormGroup = this.formBuilder.group({
            nameControl: new FormControl("", [
                Validators.required, 
                Validators.minLength(2), 
                Validators.maxLength(50),
                extraSpacing()
            ]),
            emailControl: new FormControl("", [
                Validators.required,
                Validators.minLength(2),
                Validators.maxLength(100),
                Validators.pattern('^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$'),
                extraSpacing()
            ]),
            passwordControl: new FormControl("", [
                Validators.required,
                Validators.minLength(8),
                Validators.maxLength(100),
                Validators.pattern('^(?=.*[A-Z])(?=.*\\d)(?=.*[\\W_]).{8,}$'),
                extraSpacing()
            ]),
            telephoneControl: new FormControl("", [
                Validators.required,
            ])
       });
    }

    // Method to handle form submission
    public async send(): Promise<void> {
        // Check if the form is invalid
        if (this.userFormGroup.invalid) {
            this.notifyService.error('Please fill in all fields correctly.');
            return;
        }

        try {
            // Create a new user object from form values
            const newUser: UserModel = {
                name: this.userFormGroup.get("nameControl")?.value,
                email: this.userFormGroup.get("emailControl")?.value,
                password: this.userFormGroup.get("passwordControl")?.value,
                phone: this.userFormGroup.get("telephoneControl")?.value,

            } as UserModel;

            // Call service to register the user            
            await this.userService.register(newUser);
            this.notifyService.success(`Welcome ${newUser.name}`);
            this.router.navigateByUrl("/home");
        } catch (err: any) {
            const errorMessage = err?.message || 'An error occurred during registration.';
            this.notifyService.error(errorMessage);
        }
    }

    // Method to get the first error message for a form control
    public getFirstErrorMessage(controlName: string): string | null {
        const control = this.userFormGroup.get(controlName);
        if (!control || !control.errors) return null;
    
        const errorMessages: { [key: string]: { [key: string]: string } } = {
            nameControl: {
                required: 'שדה זה חובה',
                minlength: "שם צריך להיות ארוך מ 2 תווים",
                maxlength: "שם לא יכול להיות ארוך מ 50 תווים",
                extraSpacing: "אסור רווחים מיותרים"
            },
            emailControl: {
                required: 'שדה זה חובה',
                minlength: 'אימייל צריך להיות יותר מ 2 תווים',
                maxlength: "אימייל לא יכול להיות ארוך מ 100 תווים",
                pattern: 'אימייל בפורמט לא תקין',
                extraSpacing: "אסור רווחים מיותרים"
            },
            passwordControl: {
                required: 'שדה זה חובה',
                minlength: 'סיסמא צריכה להיות לפחות 8 תווים',
                maxlength: "סיסמא לא יכולה ליהות ארוכה מ 100 תווים",
                pattern: 'סיסמא צריכה להכיל אות גדולה אות קטנה וסמל מיוחד',
                extraSpacing: "אסור רווחים מיותרים"
            },
            telephoneControl:{
                required: 'שדה זה חובה',

            }

        };
    
        const firstErrorKey = Object.keys(control.errors)[0]; 
        return errorMessages[controlName][firstErrorKey] || 'Invalid input.';
    }
}
