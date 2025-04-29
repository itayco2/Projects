using FluentValidation;

namespace University_backend;

public class CourseDtoValidator : AbstractValidator<CourseDto>
{
    public CourseDtoValidator()
    {
        // Validation rules for the Title property
        RuleFor(course => course.Title)
            .NotEmpty().WithMessage("Missing title.") 
            .MinimumLength(5).WithMessage("Title must be minimum 5 characters.") 
            .MaximumLength(100).WithMessage("Title can't exceed 100 characters.");

        // Validation rules for the Description property
        RuleFor(course => course.Description)
            .NotEmpty().WithMessage("Missing description.")
            .MinimumLength(10).WithMessage("Description must be minimum 10 characters.") 
            .MaximumLength(500).WithMessage("Description can't exceed 500 characters."); 

        // Validation rule for the CreatedAt property
        RuleFor(course => course.CreatedAt)
            .NotEmpty().WithMessage("Creation date is required."); 
    }
}
