using System.Collections.Generic;
using UnityEngine;

namespace CityPuzzle.Puzzle
{
    public enum RoadPieceType
    {
        Straight,
        Corner
    }

    [System.Serializable]
    public struct RoadPiece
    {
        public RoadPieceType Type;
        [Range(0, 3)] public int Rotation;
        public bool OneWay;
        public RoadDirection OneWayDirection;
    }

    public static class RoadPieceUtility
    {
        public static bool HasConnection(RoadPiece piece, RoadDirection direction)
        {
            var rotation = NormalizeRotation(piece.Rotation);
            if (piece.Type == RoadPieceType.Straight)
            {
                if (rotation % 2 == 0)
                {
                    return direction == RoadDirection.Up || direction == RoadDirection.Down;
                }

                return direction == RoadDirection.Left || direction == RoadDirection.Right;
            }

            switch (rotation)
            {
                case 0:
                    return direction == RoadDirection.Up || direction == RoadDirection.Right;
                case 1:
                    return direction == RoadDirection.Right || direction == RoadDirection.Down;
                case 2:
                    return direction == RoadDirection.Down || direction == RoadDirection.Left;
                case 3:
                    return direction == RoadDirection.Left || direction == RoadDirection.Up;
                default:
                    return false;
            }
        }

        public static bool AllowsTravel(RoadPiece piece, RoadDirection direction)
        {
            if (!HasConnection(piece, direction))
            {
                return false;
            }

            if (!piece.OneWay)
            {
                return true;
            }

            return piece.OneWayDirection == direction;
        }

        public static void GetConnections(RoadPiece piece, List<RoadDirection> results)
        {
            results.Clear();
            foreach (RoadDirection direction in System.Enum.GetValues(typeof(RoadDirection)))
            {
                if (HasConnection(piece, direction))
                {
                    results.Add(direction);
                }
            }
        }

        private static int NormalizeRotation(int rotation)
        {
            var normalized = rotation % 4;
            return normalized < 0 ? normalized + 4 : normalized;
        }
    }
}
