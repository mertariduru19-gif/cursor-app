using UnityEngine;
using CityPuzzle.Puzzle;

namespace CityPuzzle.Game
{
    public class PuzzleRewarder : MonoBehaviour
    {
        [SerializeField] private PuzzleController puzzleController;
        [SerializeField] private FactoryController factoryController;
        [SerializeField] private string factoryIdToUpgrade = "factory_id";

        private void OnEnable()
        {
            if (puzzleController != null)
            {
                puzzleController.PuzzleSolved += HandlePuzzleSolved;
            }
        }

        private void OnDisable()
        {
            if (puzzleController != null)
            {
                puzzleController.PuzzleSolved -= HandlePuzzleSolved;
            }
        }

        private void HandlePuzzleSolved()
        {
            if (factoryController == null)
            {
                Debug.LogWarning("FactoryController is missing for puzzle rewards.");
                return;
            }

            factoryController.UpgradeFactory(factoryIdToUpgrade);
        }
    }
}
