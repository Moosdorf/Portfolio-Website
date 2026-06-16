using Backend.Domain.Entities.Project;

namespace Backend.Application.General.Services
{
    public interface IGeneralService
    {

        public Task<Project> GetProjectById(int id);
        public Task<List<Project>> GetProjects();
    }
}
