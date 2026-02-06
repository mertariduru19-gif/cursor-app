using UnityEngine;
using CityPuzzle.Core;

namespace CityPuzzle.Game
{
    public class ProgressionController : MonoBehaviour
    {
        [SerializeField] private GameConfig config;
        [SerializeField] private FactoryController factoryController;

        public void ApplyUnlocks(int playerLevel)
        {
            if (config == null || config.Progression == null || factoryController == null)
            {
                return;
            }

            foreach (var unlock in config.Progression.Unlocks)
            {
                if (unlock == null)
                {
                    continue;
                }

                if (playerLevel < unlock.Level)
                {
                    continue;
                }

                foreach (var factoryId in unlock.FactoryIds)
                {
                    factoryController.UnlockFactory(factoryId);
                }
            }
        }
    }
}
