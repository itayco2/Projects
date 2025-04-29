using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;

namespace AdiCohenFit;

public class WorkshopService:IDisposable
{

    private readonly WebsiteContext _db;
    private readonly IMapper _mapper;
    public WorkshopService(WebsiteContext db, IMapper mapper)
    {
        _db = db;
        _mapper = mapper;
    }

    public async Task<List<WorkshopDto>> GetAllWorkshops()
    {
        return await _db.Workshops
            .AsNoTracking()
            .ProjectTo<WorkshopDto>(_mapper.ConfigurationProvider)
            .ToListAsync();
    }

    public async Task<WorkshopDto?> GetOneWorkshop(Guid id)
    {
        return await _db.Workshops
            .AsNoTracking()
            .ProjectTo<WorkshopDto>(_mapper.ConfigurationProvider)
            .FirstOrDefaultAsync(w => w.Id == id);

    }

    public async Task<WorkshopDto> AddWorkshop(WorkshopDto workshopDto)
    {
        Workshop workshop = _mapper.Map<Workshop>(workshopDto);

        // Ensure the workshop ID is valid
        if (workshop.Id == Guid.Empty)
            workshop.Id = Guid.NewGuid();

        // Save the uploaded image
        if (workshopDto.Image != null)
        {
            workshop.ImageName = ImageHelper.SaveImage(workshopDto.Image);
        }

        await _db.Workshops.AddAsync(workshop);
        await _db.SaveChangesAsync();

        return _mapper.Map<WorkshopDto>(workshop);
    }


    public async Task<WorkshopDto?> UpdateWorkshopAsync(WorkshopDto dto)
    {
        Workshop? dbWorkshop = await _db.Workshops.FindAsync(dto.Id);
        if (dbWorkshop == null) return null;

        // Update properties from DTO
        dbWorkshop.WorkshopName = dto.WorkshopName;
        dbWorkshop.WorkshopDescription = dto.WorkshopDescription;
        dbWorkshop.WorkshopPrice = dto.WorkshopPrice;
        dbWorkshop.WorkshopPlacesLeft = dto.WorkshopPlacesLeft;
        dbWorkshop.WorkshopDate = dto.WorkshopDate;
        dbWorkshop.PaymentLink = dto.PaymentLink;


        // Handle image update
        if (dto.Image != null)
        {
            dbWorkshop.ImageName = ImageHelper.UpdateImage(dto.Image, dbWorkshop.ImageName);
        }

        await _db.SaveChangesAsync();

        return _mapper.Map<WorkshopDto>(dbWorkshop);
    }


    public async Task<bool> DeleteWorkshopAsync(Guid id)
    {
        Workshop? dbWorkshop = await _db.Workshops.FindAsync(id);
        if (dbWorkshop == null) return false;

        ImageHelper.DeleteImage(dbWorkshop.ImageName);

        _db.Workshops.Remove(dbWorkshop);
        await _db.SaveChangesAsync();

        return true;
    }

    public void Dispose()
    {
        _db.Dispose();
    }
}
