using System.Collections.Generic;
using UnityEngine;

namespace CityPuzzle.Core
{
    [CreateAssetMenu(menuName = "City Puzzle/Game Config", fileName = "GameConfig")]
    public class GameConfig : ScriptableObject
    {
        [Header("Resources")]
        [SerializeField] private List<ResourceDefinition> resources = new List<ResourceDefinition>();
        [SerializeField] private int defaultStorageCapacity = 50;

        [Header("Factories")]
        [SerializeField] private List<FactoryDefinition> factories = new List<FactoryDefinition>();

        [Header("Progression")]
        [SerializeField] private ProgressionDefinition progression;

        [Header("Offline Production")]
        [SerializeField] private int maxOfflineHours = 12;

        public IReadOnlyList<ResourceDefinition> Resources => resources;
        public IReadOnlyList<FactoryDefinition> Factories => factories;
        public int DefaultStorageCapacity => defaultStorageCapacity;
        public ProgressionDefinition Progression => progression;
        public int MaxOfflineHours => maxOfflineHours;
    }
}
