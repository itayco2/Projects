using FluentValidation;
using System;

namespace University_backend
{
    public class ProgressDtoValidator : AbstractValidator<ProgressDto>
    {
        private readonly ProgressService _progressService;

        public ProgressDtoValidator(ProgressService progressService)
        {
            _progressService = progressService;

            // Validation rules for the UserId property
            RuleFor(progress => progress.UserId)
                .NotEmpty().WithMessage("Missing user id.")
                .MustAsync(async (userId, cancellation) => await UserExists(userId))
                .WithMessage("User does not exist."); 

            // Validation rules for the LessonId property
            RuleFor(progress => progress.LessonId)
                .NotEmpty().WithMessage("Missing lesson id.") 
                .MustAsync(async (lessonId, cancellation) => await LessonExists(lessonId))
                .WithMessage("Lesson does not exist."); 

            // Validation rule to ensure the progress record does not already exist for the lesson
            RuleFor(progress => new { progress.UserId, progress.LessonId })
                .MustAsync(async (data, cancellation) => !await ProgressExists(data.UserId, data.LessonId))
                .WithMessage("Progress already recorded for this lesson.");
        }

        // Asynchronous validation method to check if the user exists
        private async Task<bool> UserExists(Guid userId)
        {
            bool userExists = await _progressService.UserExists(userId);
            return userExists;
        }

        // Asynchronous validation method to check if the lesson exists
        private async Task<bool> LessonExists(Guid lessonId)
        {
            bool lessonExists = await _progressService.LessonExists(lessonId);
            return lessonExists;
        }

        // Asynchronous validation method to check if the progress record already exists for the lesson
        private async Task<bool> ProgressExists(Guid userId, Guid lessonId)
        {
            bool progressExists = await _progressService.ProgressExists(userId, lessonId);
            return progressExists;
        }
    }
}
