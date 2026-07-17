using Backend.Domain.Entities.Chess.Games;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System.Globalization;
using CsvHelper;

namespace DataLayer.csv_scripts;

public static class CsvImportScript
{
    public static void Run(AppDbContext context)
    {
        using var reader = new StreamReader("Domain/Entities/Chess/lichess_db_puzzle.csv");
        using var csv = new CsvReader(reader, CultureInfo.InvariantCulture);

        const int batchSize = 10000;
        var batch = new List<Puzzle>();

        // Step 1: load existing tag name -> id map (plain ints, no tracked entities)
        var tagIdByName = context.Tags
            .AsNoTracking()
            .ToDictionary(t => t.Name, t => t.Id);

        var count = 0;
        foreach (var record in csv.GetRecords<PuzzleScript>())
        {
            var puzzle = new Puzzle
            {
                PuzzleId = record.PuzzleId,
                FEN = record.FEN,
                Moves = record.Moves,
                Rating = record.Rating,
                RatingDeviation = record.RatingDeviation,
                Popularity = record.Popularity,
                NbPlays = record.NbPlays,
                Themes = record.Themes,
                GameUrl = record.GameUrl,
                OpeningTags = record.OpeningTags
            };

            var splitThemes = record.Themes
                    .Split(' ', StringSplitOptions.RemoveEmptyEntries)
                    .Distinct()
                    .ToArray();
            foreach (var tagName in splitThemes)
            {
                if (!tagIdByName.TryGetValue(tagName, out var tagId))
                {
                    var newTag = new Tag { Name = tagName };
                    context.Tags.Add(newTag);
                    context.SaveChanges(); 
                    tagIdByName[tagName] = newTag.Id;
                    tagId = newTag.Id;
                }

                puzzle.PuzzleTags.Add(new PuzzleTag { TagId = tagId });
            }

            batch.Add(puzzle);

            if (batch.Count >= batchSize)
            {
                context.Puzzles.AddRange(batch);
                context.SaveChanges();
                context.ChangeTracker.Clear();
                batch.Clear();
                if (count > 10)
                {
                    break;
                }
                count++;
            }
        }

        if (batch.Count > 0)
        {
            context.Puzzles.AddRange(batch);
            context.SaveChanges();
            context.ChangeTracker.Clear();
        }
    }
}