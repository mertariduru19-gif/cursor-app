using System;
using System.Collections.Generic;
using UnityEngine;
using CityPuzzle.Core;

namespace CityPuzzle.Game
{
    [Serializable]
    public class ResourceBucket
    {
        public string ResourceId;
        public int Amount;
        public int Capacity;

        public ResourceBucket(string resourceId, int amount, int capacity)
        {
            ResourceId = resourceId;
            Amount = amount;
            Capacity = capacity;
        }

        public ResourceBucket(ResourceBucket other)
        {
            ResourceId = other.ResourceId;
            Amount = other.Amount;
            Capacity = other.Capacity;
        }
    }

    public class ResourceInventory : MonoBehaviour
    {
        [SerializeField] private List<ResourceBucket> buckets = new List<ResourceBucket>();
        private readonly Dictionary<string, ResourceBucket> lookup = new Dictionary<string, ResourceBucket>();

        public void InitializeDefaults(IEnumerable<ResourceDefinition> definitions, int defaultCapacity)
        {
            buckets.Clear();
            foreach (var definition in definitions)
            {
                if (definition == null || string.IsNullOrWhiteSpace(definition.Id))
                {
                    continue;
                }

                buckets.Add(new ResourceBucket(definition.Id, 0, defaultCapacity));
            }

            BuildLookup();
        }

        public void LoadFrom(List<ResourceBucket> saved)
        {
            buckets.Clear();
            if (saved != null)
            {
                foreach (var bucket in saved)
                {
                    if (bucket == null || string.IsNullOrWhiteSpace(bucket.ResourceId))
                    {
                        continue;
                    }

                    buckets.Add(new ResourceBucket(bucket));
                }
            }

            BuildLookup();
        }

        public void SyncWithDefinitions(IEnumerable<ResourceDefinition> definitions, int defaultCapacity)
        {
            foreach (var definition in definitions)
            {
                if (definition == null || string.IsNullOrWhiteSpace(definition.Id))
                {
                    continue;
                }

                if (!lookup.TryGetValue(definition.Id, out var bucket))
                {
                    buckets.Add(new ResourceBucket(definition.Id, 0, defaultCapacity));
                    continue;
                }

                if (bucket.Capacity <= 0)
                {
                    bucket.Capacity = defaultCapacity;
                }
            }

            BuildLookup();
        }

        public List<ResourceBucket> Export()
        {
            var exported = new List<ResourceBucket>(buckets.Count);
            foreach (var bucket in buckets)
            {
                exported.Add(new ResourceBucket(bucket));
            }

            return exported;
        }

        public int Add(string resourceId, int amount)
        {
            if (amount <= 0 || string.IsNullOrWhiteSpace(resourceId))
            {
                return 0;
            }

            if (!lookup.TryGetValue(resourceId, out var bucket))
            {
                return 0;
            }

            var remaining = Mathf.Max(0, bucket.Capacity - bucket.Amount);
            var added = Mathf.Min(remaining, amount);
            bucket.Amount += added;
            return added;
        }

        public int GetAmount(string resourceId)
        {
            return lookup.TryGetValue(resourceId, out var bucket) ? bucket.Amount : 0;
        }

        public int GetCapacity(string resourceId)
        {
            return lookup.TryGetValue(resourceId, out var bucket) ? bucket.Capacity : 0;
        }

        public int GetCapacityRemaining(string resourceId)
        {
            if (!lookup.TryGetValue(resourceId, out var bucket))
            {
                return 0;
            }

            return Mathf.Max(0, bucket.Capacity - bucket.Amount);
        }

        public void SetCapacity(string resourceId, int capacity)
        {
            if (!lookup.TryGetValue(resourceId, out var bucket))
            {
                return;
            }

            bucket.Capacity = Mathf.Max(0, capacity);
            bucket.Amount = Mathf.Min(bucket.Amount, bucket.Capacity);
        }

        public void SetAmount(string resourceId, int amount)
        {
            if (!lookup.TryGetValue(resourceId, out var bucket))
            {
                return;
            }

            bucket.Amount = Mathf.Clamp(amount, 0, bucket.Capacity);
        }

        private void BuildLookup()
        {
            lookup.Clear();
            foreach (var bucket in buckets)
            {
                if (bucket == null || string.IsNullOrWhiteSpace(bucket.ResourceId))
                {
                    continue;
                }

                lookup[bucket.ResourceId] = bucket;
            }
        }
    }
}
