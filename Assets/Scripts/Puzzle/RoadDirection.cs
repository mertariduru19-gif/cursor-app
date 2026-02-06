using UnityEngine;

namespace CityPuzzle.Puzzle
{
    public enum RoadDirection
    {
        Up,
        Right,
        Down,
        Left
    }

    public static class RoadDirectionExtensions
    {
        public static Vector2Int ToVector2Int(this RoadDirection direction)
        {
            switch (direction)
            {
                case RoadDirection.Up:
                    return Vector2Int.up;
                case RoadDirection.Right:
                    return Vector2Int.right;
                case RoadDirection.Down:
                    return Vector2Int.down;
                case RoadDirection.Left:
                    return Vector2Int.left;
                default:
                    return Vector2Int.zero;
            }
        }

        public static RoadDirection Opposite(this RoadDirection direction)
        {
            switch (direction)
            {
                case RoadDirection.Up:
                    return RoadDirection.Down;
                case RoadDirection.Right:
                    return RoadDirection.Left;
                case RoadDirection.Down:
                    return RoadDirection.Up;
                case RoadDirection.Left:
                    return RoadDirection.Right;
                default:
                    return RoadDirection.Up;
            }
        }
    }
}
