using System.ComponentModel.DataAnnotations;

namespace Backend.Domain.Entities.Project
{
    public class Project
    {
        public int Id { get; set; } 
        [Required]
        public string Title { get; set; } = string.Empty; 
        [Required]
        public string Description { get; set; } = string.Empty;
        public string Path { get; set; } = string.Empty;
    }
}
