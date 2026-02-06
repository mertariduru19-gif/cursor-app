using System.Collections.Generic;
using UnityEngine;

namespace CityPuzzle.Core
{
    [CreateAssetMenu(menuName = "City Puzzle/Progression Definition", fileName = "ProgressionDefinition")]
    public class ProgressionDefinition : ScriptableObject
    {
        [SerializeField] private List<LevelUnlock> unlocks = new List<LevelUnlock>();

        public IReadOnlyList<LevelUnlock> Unlocks => unlocks;
    }

    [System.Serializable]
    public class LevelUnlock
    {
        [SerializeField] private int level;
        [SerializeField] private List<string> factoryIds = new List<string>();
        [SerializeField] private bool unlockTrafficFeatures;
        [SerializeField] private bool unlockSafetyBuildings;

        public int Level => level;
        public IReadOnlyList<string> FactoryIds => factoryIds;
        public bool UnlockTrafficFeatures => unlockTrafficFeatures;
        public bool UnlockSafetyBuildings => unlockSafetyBuildings;
    }
}
