namespace Backend.Application.Chess.Mapping;

using AutoMapper;
using Backend.Application.Chess.DTO;
using Backend.Domain.Entities.Chess.Games;

public class PuzzleMappingProfile : Profile
{
    public PuzzleMappingProfile()
    {
        CreateMap<PuzzleAttempt, PuzzleAttemptDTO>();
    }
}
