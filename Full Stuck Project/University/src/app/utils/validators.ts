import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export function extraSpacing(): ValidatorFn {

    return (control: AbstractControl): ValidationErrors => {

        // If there is no value - all is good: 
        if (!control.value) return null; // No error.

        // If there is an extra spacing: 
        if (control.value.includes("  ")) return { extraSpacing: "Extra spacing is forbidden." }

        // All is good: 
        return null;
    };
}

export function youtubeUrlValidator(control: AbstractControl): ValidationErrors | null {
    const url: string = control.value;
    if (!url) return null; // Allow empty values (handled by required validator)
  
    const regex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})(&.*)?$/;
    return regex.test(url) ? null : { invalidYouTubeUrl: true };
  }