using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataLayer.csv_scripts
{
    // PuzzleId,FEN,Moves,Rating,RatingDeviation,Popularity,NbPlays,Themes,GameUrl,OpeningTags
    public class PuzzleScript
    {
        public string PuzzleId { get; set; } // From CSV
        public string FEN { get; set; }
        public string Moves { get; set; }
        public int Rating { get; set; } 
        public int RatingDeviation { get; set; }
        public int Popularity { get; set; }
        public int NbPlays { get; set; }
        public string Themes { get; set; }
        public string GameUrl { get; set; }
        public string OpeningTags { get; set; }
    }
}
