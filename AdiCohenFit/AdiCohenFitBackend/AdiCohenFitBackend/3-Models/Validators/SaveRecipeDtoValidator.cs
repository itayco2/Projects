using AdiCohenFit;
using FluentValidation;

namespace AdiCohenFIt;

public class SaveRecipeDtoValidator : AbstractValidator<SaveRecipeRequestDto>
{
    public SaveRecipeDtoValidator()
    {
        RuleFor(x => x.RecipeId)
            .NotEmpty().WithMessage("Recipe ID is required");
    }
}