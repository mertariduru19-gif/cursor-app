using System.Collections.Generic;
using UnityEngine;
using CityPuzzle.Core;

namespace CityPuzzle.Game
{
    public class FactoryController : MonoBehaviour
    {
        [SerializeField] private List<FactoryState> factories = new List<FactoryState>();
        private readonly Dictionary<string, FactoryDefinition> definitionLookup = new Dictionary<string, FactoryDefinition>();

        public IReadOnlyList<FactoryState> Factories => factories;

        public void Initialize(GameConfig config, List<FactoryState> savedFactories)
        {
            definitionLookup.Clear();
            if (config != null)
            {
                foreach (var definition in config.Factories)
                {
                    if (definition == null || string.IsNullOrWhiteSpace(definition.Id))
                    {
                        continue;
                    }

                    definitionLookup[definition.Id] = definition;
                }
            }

            factories.Clear();
            if (savedFactories != null && savedFactories.Count > 0)
            {
                foreach (var saved in savedFactories)
                {
                    if (saved == null || string.IsNullOrWhiteSpace(saved.FactoryId))
                    {
                        continue;
                    }

                    factories.Add(new FactoryState(saved));
                }
            }

            if (factories.Count == 0)
            {
                if (config != null)
                {
                    for (var index = 0; index < config.Factories.Count; index += 1)
                    {
                        var definition = config.Factories[index];
                        if (definition == null || string.IsNullOrWhiteSpace(definition.Id))
                        {
                            continue;
                        }

                        var unlocked = index == 0;
                        factories.Add(new FactoryState(definition.Id, 1, unlocked));
                    }
                }
            }
            else if (config != null)
            {
                foreach (var definition in config.Factories)
                {
                    if (definition == null || string.IsNullOrWhiteSpace(definition.Id))
                    {
                        continue;
                    }

                    var hasState = factories.Exists(state => state.FactoryId == definition.Id);
                    if (!hasState)
                    {
                        factories.Add(new FactoryState(definition.Id, 1, false));
                    }
                }
            }
        }

        public void Tick(float deltaSeconds, ResourceInventory inventory)
        {
            if (deltaSeconds <= 0f || inventory == null)
            {
                return;
            }

            foreach (var factory in factories)
            {
                if (factory == null || !factory.Unlocked)
                {
                    continue;
                }

                if (!definitionLookup.TryGetValue(factory.FactoryId, out var definition))
                {
                    continue;
                }

                if (definition.OutputResource == null)
                {
                    continue;
                }

                var duration = definition.GetDurationForLevel(factory.Level);
                if (duration <= 0f)
                {
                    continue;
                }

                factory.StoredSeconds += deltaSeconds;
                var availableCycles = Mathf.FloorToInt(factory.StoredSeconds / duration);
                if (availableCycles <= 0)
                {
                    continue;
                }

                var outputPerCycle = definition.GetOutputForLevel(factory.Level);
                var capacityRemaining = inventory.GetCapacityRemaining(definition.OutputResource.Id);
                var maxCycles = outputPerCycle > 0 ? capacityRemaining / outputPerCycle : 0;
                var cyclesToProduce = Mathf.Min(availableCycles, maxCycles);

                if (cyclesToProduce > 0)
                {
                    var totalOutput = cyclesToProduce * outputPerCycle;
                    inventory.Add(definition.OutputResource.Id, totalOutput);
                    factory.StoredSeconds -= cyclesToProduce * duration;
                }
                else
                {
                    factory.StoredSeconds = Mathf.Min(factory.StoredSeconds, duration);
                }
            }
        }

        public void ApplyOfflineProgress(double seconds, ResourceInventory inventory, int maxOfflineHours)
        {
            if (seconds <= 0d || inventory == null)
            {
                return;
            }

            var maxSeconds = Mathf.Max(0, maxOfflineHours) * 3600d;
            var cappedSeconds = maxSeconds > 0 ? System.Math.Min(seconds, maxSeconds) : seconds;
            Tick((float)cappedSeconds, inventory);
        }

        public bool UpgradeFactory(string factoryId)
        {
            if (string.IsNullOrWhiteSpace(factoryId))
            {
                return false;
            }

            var factory = factories.Find(state => state.FactoryId == factoryId);
            if (factory == null)
            {
                return false;
            }

            if (!definitionLookup.TryGetValue(factoryId, out var definition))
            {
                return false;
            }

            var nextLevel = Mathf.Clamp(factory.Level + 1, 1, definition.MaxLevel);
            var upgraded = nextLevel != factory.Level;
            factory.Level = nextLevel;
            factory.Unlocked = true;
            return upgraded;
        }

        public bool UnlockFactory(string factoryId)
        {
            var factory = factories.Find(state => state.FactoryId == factoryId);
            if (factory == null)
            {
                return false;
            }

            if (factory.Unlocked)
            {
                return false;
            }

            factory.Unlocked = true;
            return true;
        }

        public List<FactoryState> Export()
        {
            var exported = new List<FactoryState>(factories.Count);
            foreach (var factory in factories)
            {
                exported.Add(new FactoryState(factory));
            }

            return exported;
        }
    }
}
