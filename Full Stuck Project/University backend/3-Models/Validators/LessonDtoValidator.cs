using FluentValidation;

namespace University_backend;

public class LessonDtoValidator : AbstractValidator<LessonDto>
{
    public LessonDtoValidator()
    {
        RuleFor(lesson => lesson.Title)
            .NotEmpty().WithMessage("Title is required.")
            .MinimumLength(5).WithMessage("Title must be at least 5 characters long.")
            .MaximumLength(200).WithMessage("Title can't exceed 200 characters.");

        RuleFor(lesson => lesson.VideoUrl)
            .NotEmpty().WithMessage("Video URL is required.")
            .Matches(@"^(https?|ftp)://[^\s/$.?#].[^\s]*$").WithMessage("Invalid video URL format.");

        RuleFor(lesson => lesson.CourseId)
            .NotEmpty().WithMessage("Course ID is required.");
    }
}
