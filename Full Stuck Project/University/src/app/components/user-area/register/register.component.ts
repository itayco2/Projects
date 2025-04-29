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
            roleControl: new FormControl("", [Validators.required])
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
                roleId: this.userFormGroup.get("roleControl")?.value
            } as UserModel; // Explicit type casting

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
                required: 'The Name field is required.',
                minlength: "Name can't be less than 2 characters.",
                maxlength: "Name can't exceed 50 characters.",
                extraSpacing: "Extra spacing is forbidden."
            },
            emailControl: {
                required: 'Email is required.',
                minlength: 'Email must be at least 2 characters long.',
                maxlength: "Email can't exceed 100 characters.",
                pattern: 'Invalid Email format.',
                extraSpacing: "Extra spacing is forbidden."
            },
            passwordControl: {
                required: 'Password is required.',
                minlength: 'Password must be at least 8 characters long.',
                maxlength: "Password can't exceed 100 characters.",
                pattern: 'Password must contain at least one uppercase letter, one digit, and one special character.',
                extraSpacing: "Extra spacing is forbidden."
            },
            roleControl: {
                required: 'Missing Role.'
            }
        };
    
        const firstErrorKey = Object.keys(control.errors)[0]; 
        return errorMessages[controlName][firstErrorKey] || 'Invalid input.';
    }
}
