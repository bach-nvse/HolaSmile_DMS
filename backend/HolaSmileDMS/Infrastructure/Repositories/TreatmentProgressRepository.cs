using Application.Interfaces;
using HDMS_API.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
namespace Infrastructure.Repositories;

public class TreatmentProgressRepository : ITreatmentProgressRepository
{
    private readonly ApplicationDbContext _context;

    public TreatmentProgressRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<TreatmentProgress>> GetByTreatmentRecordIdAsync(int treatmentRecordId, CancellationToken cancellationToken)
    {
        return await _context.TreatmentProgresses
            .Include(tp => tp.Dentist).ThenInclude(d => d.User) 
            .Include(tp => tp.Patient).ThenInclude(p  => p .User) 
            .Where(tp => tp.TreatmentRecordID == treatmentRecordId)
            .ToListAsync(cancellationToken);
    }
    public async System.Threading.Tasks.Task CreateAsync(TreatmentProgress progress)
    {
        _context.TreatmentProgresses.Add(progress);
        await _context.SaveChangesAsync();
    }

    public async Task<TreatmentProgress?> GetByIdAsync(int id, CancellationToken cancellationToken)
    {
        return await _context.TreatmentProgresses.FindAsync(new object[] { id }, cancellationToken);
    }

    public async Task<bool> UpdateAsync(TreatmentProgress progress, CancellationToken cancellationToken)
    {
        _context.TreatmentProgresses.Update(progress);
        return await _context.SaveChangesAsync(cancellationToken) > 0;
    }
    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken)
    {
        var progress = await GetByIdAsync(id, cancellationToken);
        if (progress == null) return false;

        _context.TreatmentProgresses.Remove(progress);
        return await _context.SaveChangesAsync(cancellationToken) > 0;
    }
}