using FluentValidation;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace University_backend
{
    public class EnrollmentDtoValidator : AbstractValidator<EnrollmentDto>
    {
        private readonly EnrollmentService _enrollmentService;

        public EnrollmentDtoValidator(EnrollmentService enrollmentService)
        {
            _enrollmentService = enrollmentService;

            // Validation rules for the UserId property
            RuleFor(enrollment => enrollment.UserId)
                .NotEmpty().WithMessage("User ID is required.")
                .MustAsync(UserExistsAsync).WithMessage("User does not exist."); 

            // Validation rules for the CourseId property
            RuleFor(enrollment => enrollment.CourseId)
                .NotEmpty().WithMessage("Course ID is required.") 
                .MustAsync(CourseExistsAsync).WithMessage("Course does not exist."); 

            // Validation rule to ensure the user is not already enrolled in the course
            RuleFor(enrollment => new { enrollment.UserId, enrollment.CourseId })
                .MustAsync(EnrollmentDoesNotExistAsync).WithMessage("User is already enrolled in this course.");
        }

        // Asynchronous validation method to check if the user exists
        private async Task<bool> UserExistsAsync(Guid userId, CancellationToken cancellationToken)
        {
            bool userExists = await _enrollmentService.UserExists(userId);
            return userExists;
        }

        // Asynchronous validation method to check if the course exists
        private async Task<bool> CourseExistsAsync(Guid courseId, CancellationToken cancellationToken)
        {
            bool courseExists = await _enrollmentService.CourseExists(courseId);
            return courseExists;
        }

        // Asynchronous validation method to check if the user is already enrolled in the course
        private async Task<bool> EnrollmentDoesNotExistAsync(dynamic data, CancellationToken cancellationToken)
        {
            bool isAlreadyEnrolled = await _enrollmentService.IsUserAlreadyEnrolled(data.UserId, data.CourseId);
            return !isAlreadyEnrolled;
        }
    }
}
