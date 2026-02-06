using System;
using UnityEngine;
using CityPuzzle.Core;

namespace CityPuzzle.Game
{
    public class GameManager : MonoBehaviour
    {
        [SerializeField] private GameConfig config;
        [SerializeField] private ResourceInventory inventory;
        [SerializeField] private FactoryController factoryController;
        [SerializeField] private ProgressionController progressionController;

        private GameState state;

        public GameConfig Config => config;
        public ResourceInventory Inventory => inventory;
        public FactoryController FactoryController => factoryController;
        public int PlayerLevel => state != null ? state.PlayerLevel : 1;

        private void Awake()
        {
            if (config == null)
            {
                Debug.LogError("GameConfig is not assigned.");
                enabled = false;
                return;
            }

            if (inventory == null || factoryController == null)
            {
                Debug.LogError("Inventory or FactoryController is missing.");
                enabled = false;
                return;
            }

            state = SaveSystem.Load() ?? new GameState();

            if (state.Resources == null || state.Resources.Count == 0)
            {
                inventory.InitializeDefaults(config.Resources, config.DefaultStorageCapacity);
            }
            else
            {
                inventory.LoadFrom(state.Resources);
                inventory.SyncWithDefinitions(config.Resources, config.DefaultStorageCapacity);
            }

            factoryController.Initialize(config, state.Factories);
            ApplyOfflineProgress();
            if (progressionController != null)
            {
                progressionController.ApplyUnlocks(state.PlayerLevel);
            }
        }

        private void Update()
        {
            if (factoryController == null || inventory == null)
            {
                return;
            }

            factoryController.Tick(Time.unscaledDeltaTime, inventory);
        }

        private void OnApplicationPause(bool pause)
        {
            if (pause)
            {
                Save();
            }
        }

        private void OnApplicationQuit()
        {
            Save();
        }

        private void ApplyOfflineProgress()
        {
            if (state == null || state.LastSavedUtcTicks <= 0)
            {
                return;
            }

            var lastSaved = new DateTime(state.LastSavedUtcTicks, DateTimeKind.Utc);
            var delta = DateTime.UtcNow - lastSaved;
            factoryController.ApplyOfflineProgress(delta.TotalSeconds, inventory, config.MaxOfflineHours);
        }

        private void Save()
        {
            if (state == null)
            {
                return;
            }

            state.Resources = inventory.Export();
            state.Factories = factoryController.Export();
            SaveSystem.Save(state);
        }
    }
}
