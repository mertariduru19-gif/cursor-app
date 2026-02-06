using System;
using System.Collections.Generic;

namespace CityPuzzle.Game
{
    [Serializable]
    public class GameState
    {
        public int PlayerLevel = 1;
        public int PuzzlesSolved;
        public List<ResourceBucket> Resources = new List<ResourceBucket>();
        public List<FactoryState> Factories = new List<FactoryState>();
        public long LastSavedUtcTicks;
    }
}
