using System.Collections.Generic;
using UnityEngine;

namespace CityPuzzle.Puzzle
{
    public class PuzzleGrid
    {
        private readonly int width;
        private readonly int height;
        private readonly Dictionary<Vector2Int, RoadPiece> roads = new Dictionary<Vector2Int, RoadPiece>();
        private readonly HashSet<Vector2Int> blocked = new HashSet<Vector2Int>();
        private readonly List<RoadDirection> connectionBuffer = new List<RoadDirection>(4);

        public int Width => width;
        public int Height => height;

        public PuzzleGrid(int width, int height)
        {
            this.width = Mathf.Max(1, width);
            this.height = Mathf.Max(1, height);
        }

        public bool IsInside(Vector2Int position)
        {
            return position.x >= 0 && position.x < width && position.y >= 0 && position.y < height;
        }

        public void SetBlocked(Vector2Int position, bool isBlocked)
        {
            if (!IsInside(position))
            {
                return;
            }

            if (isBlocked)
            {
                blocked.Add(position);
                roads.Remove(position);
            }
            else
            {
                blocked.Remove(position);
            }
        }

        public void ClearRoad(Vector2Int position)
        {
            roads.Remove(position);
        }

        public void PlaceRoad(Vector2Int position, RoadPiece piece)
        {
            if (!IsInside(position) || blocked.Contains(position))
            {
                return;
            }

            roads[position] = piece;
        }

        public bool TryGetRoad(Vector2Int position, out RoadPiece piece)
        {
            return roads.TryGetValue(position, out piece);
        }

        public bool IsSolved(IReadOnlyList<Vector2Int> targets)
        {
            if (targets == null || targets.Count == 0)
            {
                return false;
            }

            var start = targets[0];
            if (!IsInside(start) || blocked.Contains(start))
            {
                return false;
            }

            if (!roads.TryGetValue(start, out var startPiece))
            {
                return false;
            }

            var visited = new HashSet<Vector2Int> { start };
            var queue = new Queue<Vector2Int>();
            queue.Enqueue(start);

            while (queue.Count > 0)
            {
                var current = queue.Dequeue();
                if (!roads.TryGetValue(current, out var piece))
                {
                    continue;
                }

                RoadPieceUtility.GetConnections(piece, connectionBuffer);
                foreach (var direction in connectionBuffer)
                {
                    if (!RoadPieceUtility.AllowsTravel(piece, direction))
                    {
                        continue;
                    }

                    var neighbor = current + direction.ToVector2Int();
                    if (!IsInside(neighbor) || blocked.Contains(neighbor))
                    {
                        continue;
                    }

                    if (!roads.TryGetValue(neighbor, out var neighborPiece))
                    {
                        continue;
                    }

                    var opposite = direction.Opposite();
                    if (!RoadPieceUtility.AllowsTravel(neighborPiece, opposite))
                    {
                        continue;
                    }

                    if (visited.Add(neighbor))
                    {
                        queue.Enqueue(neighbor);
                    }
                }
            }

            for (var i = 0; i < targets.Count; i += 1)
            {
                var target = targets[i];
                if (!visited.Contains(target))
                {
                    return false;
                }
            }

            return true;
        }
    }
}
