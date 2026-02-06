using System;
using System.Collections.Generic;
using UnityEngine;

namespace CityPuzzle.Puzzle
{
    public class PuzzleController : MonoBehaviour
    {
        [SerializeField] private Vector2Int gridSize = new Vector2Int(6, 6);
        [SerializeField] private List<Vector2Int> targetNodes = new List<Vector2Int>();
        [SerializeField] private List<Vector2Int> blockedNodes = new List<Vector2Int>();

        private PuzzleGrid grid;
        private bool solved;

        public event Action PuzzleSolved;

        public bool IsSolved => solved;

        private void Awake()
        {
            BuildGrid();
        }

        public void ResetPuzzle()
        {
            BuildGrid();
            solved = false;
        }

        public void PlaceRoad(Vector2Int position, RoadPiece piece)
        {
            if (grid == null)
            {
                return;
            }

            grid.PlaceRoad(position, piece);
            CheckSolved();
        }

        public void ClearRoad(Vector2Int position)
        {
            if (grid == null)
            {
                return;
            }

            grid.ClearRoad(position);
            CheckSolved();
        }

        private void BuildGrid()
        {
            grid = new PuzzleGrid(gridSize.x, gridSize.y);
            foreach (var node in blockedNodes)
            {
                grid.SetBlocked(node, true);
            }
        }

        private void CheckSolved()
        {
            if (solved || grid == null)
            {
                return;
            }

            if (grid.IsSolved(targetNodes))
            {
                solved = true;
                PuzzleSolved?.Invoke();
            }
        }
    }
}
