using FluentValidation;

namespace AdiCohenFit;

public class WorkshopDtoValidator : AbstractValidator<WorkshopDto>
{
    public WorkshopDtoValidator()
    {
        RuleFor(x => x.WorkshopName)
            .NotEmpty().WithMessage("The WorkshopName field is required.")
            .MaximumLength(100).WithMessage("WorkshopName must be at most 100 characters long.");

        RuleFor(x => x.WorkshopDescription)
            .NotEmpty().WithMessage("The WorkshopDescription field is required.")
            .MaximumLength(500).WithMessage("WorkshopDescription must be at most 500 characters long.");

        RuleFor(x => x.WorkshopPrice)
            .GreaterThanOrEqualTo(0).WithMessage("WorkshopPrice must be a positive value.");

        RuleFor(x => x.WorkshopPlacesLeft)
            .GreaterThanOrEqualTo(0).WithMessage("WorkshopPlacesLeft must be 0 or more.");

        RuleFor(x => x.ImageName)
            .NotEmpty().WithMessage("ImageName is required.");

        RuleFor(x => x.PaymentLink)
    .NotEmpty().WithMessage("PaymentLink is required.");
    }
}
