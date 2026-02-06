using UnityEngine;

namespace CityPuzzle.Core
{
    [CreateAssetMenu(menuName = "City Puzzle/Factory Definition", fileName = "FactoryDefinition")]
    public class FactoryDefinition : ScriptableObject
    {
        [SerializeField] private string id = "factory_id";
        [SerializeField] private ResourceDefinition outputResource;
        [SerializeField] private float baseProductionSeconds = 30f;
        [SerializeField] private int baseOutput = 5;
        [SerializeField] private float durationMultiplierPerLevel = 0.85f;
        [SerializeField] private float outputMultiplierPerLevel = 1.2f;
        [SerializeField] private int maxLevel = 10;

        public string Id => id;
        public ResourceDefinition OutputResource => outputResource;
        public float BaseProductionSeconds => baseProductionSeconds;
        public int BaseOutput => baseOutput;
        public float DurationMultiplierPerLevel => durationMultiplierPerLevel;
        public float OutputMultiplierPerLevel => outputMultiplierPerLevel;
        public int MaxLevel => maxLevel;

        public float GetDurationForLevel(int level)
        {
            var clampedLevel = Mathf.Clamp(level, 1, maxLevel);
            return baseProductionSeconds * Mathf.Pow(durationMultiplierPerLevel, clampedLevel - 1);
        }

        public int GetOutputForLevel(int level)
        {
            var clampedLevel = Mathf.Clamp(level, 1, maxLevel);
            return Mathf.Max(1, Mathf.RoundToInt(baseOutput * Mathf.Pow(outputMultiplierPerLevel, clampedLevel - 1)));
        }
    }
}
