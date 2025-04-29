import { Injectable } from '@angular/core';
import { Notyf } from 'notyf';
import 'notyf/notyf.min.css';

@Injectable({
    providedIn: 'root'
})
export class NotifyService {
    // Initialize Notyf with custom configuration
    private notyf = new Notyf({
        duration: 3000,
        position: { 
            x: "center", 
            y: "top" 
        },
        dismissible: true,
        ripple: true,
        types: [
            {
                type: 'success',
                background: 'green',
                icon: {
                    className: 'material-icons',
                    tagName: 'i',
                    text: 'check'
                }
            },
            {
                type: 'error',
                background: 'red',
                icon: {
                    className: 'material-icons',
                    tagName: 'i',
                    text: 'error'
                }
            }
        ]
    });

    // Method to display a success notification
    public success(message: string): void {
        this.notyf.success({
            message,
            dismissible: true
        });
    }

    // Method to display an error notification
    public error(error: any): void {
        const message = this.extractError(error);
        this.notyf.error({
            message,
            dismissible: true
        });
    }

    // Method to extract error message from different error types
    private extractError(error: any): string {
        if (typeof error === "string") return error;
        if (typeof error?.error === "string") return error.error;
        if (typeof error?.message === "string") return error.message;
        return "Some error, please try again.";
    }
}