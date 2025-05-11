using FluentValidation;

namespace AdiCohenFit;

public class RecipeDtoValidator : AbstractValidator<RecipeDto>
{
    public RecipeDtoValidator()
    {
        RuleFor(x => x.RecipeName)
            .NotEmpty().WithMessage("The RecipeName field is required.")
            .MaximumLength(100).WithMessage("RecipeName must be at most 100 characters long.");

        RuleFor(x => x.RecipeDescription)
            .NotEmpty().WithMessage("The RecipeDescription field is required.")
            .MaximumLength(500).WithMessage("RecipeDescription must be at most 500 characters long.");

        RuleFor(x => x.Ingredients)
            .NotEmpty().WithMessage("Ingredients are required.")
            .MaximumLength(2000).WithMessage("Ingredients must be at most 2000 characters long.");

        RuleFor(x => x.Instructions)
            .NotEmpty().WithMessage("Instructions are required.")
            .MaximumLength(5000).WithMessage("Instructions must be at most 5000 characters long.");

        RuleFor(x => x.PrepTimeMinutes)
            .GreaterThanOrEqualTo(0).WithMessage("Preparation time must be 0 or more minutes.");

        RuleFor(x => x.CookTimeMinutes)
            .GreaterThanOrEqualTo(0).WithMessage("Cooking time must be 0 or more minutes.");

        RuleFor(x => x.Servings)
            .GreaterThan(0).WithMessage("Servings must be greater than 0.");

        RuleFor(x => x.ImageName)
            .NotEmpty().WithMessage("ImageName is required.");

        RuleFor(x => x.CategoryId)
            .NotEmpty().WithMessage("CategoryId is required.");
    }
}