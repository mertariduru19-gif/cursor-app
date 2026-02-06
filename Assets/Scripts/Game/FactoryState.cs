using System;

namespace CityPuzzle.Game
{
    [Serializable]
    public class FactoryState
    {
        public string FactoryId;
        public int Level = 1;
        public float StoredSeconds;
        public bool Unlocked;

        public FactoryState(string factoryId, int level, bool unlocked)
        {
            FactoryId = factoryId;
            Level = level;
            Unlocked = unlocked;
            StoredSeconds = 0f;
        }

        public FactoryState(FactoryState other)
        {
            FactoryId = other.FactoryId;
            Level = other.Level;
            StoredSeconds = other.StoredSeconds;
            Unlocked = other.Unlocked;
        }
    }
}
