using Backend.Domain.Entities.Project;
using Infrastructure.Data;

namespace Backend.Application.General.Services
{
    public class GeneralService : IGeneralService
    {
        private readonly AppDbContext _context;

        public GeneralService(AppDbContext context)
        {
            _context = context;
        }
        public async Task<List<Project>> GetProjects()
        {
            var projects = _context.Projects.ToList();
            return projects;
        }
        public async Task<Project> GetProjectById(int id)
        {
            return _context.Projects.FirstOrDefault(p => p.Id == id);
        }
    }
}
