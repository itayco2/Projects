using FluentValidation;

namespace AdiCohenFit;

public class RecipeCategoryDtoValidator : AbstractValidator<RecipeCategoryDto>
{
    public RecipeCategoryDtoValidator()
    {
        RuleFor(x => x.CategoryName)
            .NotEmpty().WithMessage("The CategoryName field is required.")
            .MaximumLength(50).WithMessage("CategoryName must be at most 50 characters long.");

        RuleFor(x => x.CategoryDescription)
            .MaximumLength(200).WithMessage("CategoryDescription must be at most 200 characters long.");
    }
}