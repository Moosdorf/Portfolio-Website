using System.ComponentModel.DataAnnotations;

namespace Backend.Application.Chess.DTO;

public class CreateBotChessModel
{
    [Required]
    public bool PickedWhite { get; set; }
}
