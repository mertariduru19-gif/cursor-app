using UnityEngine;

namespace CityPuzzle.Puzzle
{
    public class IsometricGrid : MonoBehaviour
    {
        [SerializeField] private Vector2 cellSize = new Vector2(1f, 0.5f);
        [SerializeField] private Vector2 origin = Vector2.zero;

        public Vector3 GridToWorld(Vector2Int cell)
        {
            var halfWidth = cellSize.x * 0.5f;
            var halfHeight = cellSize.y * 0.5f;
            var worldX = (cell.x - cell.y) * halfWidth;
            var worldY = (cell.x + cell.y) * halfHeight;
            return new Vector3(worldX + origin.x, worldY + origin.y, 0f);
        }

        public Vector2Int WorldToGrid(Vector3 worldPosition)
        {
            var halfWidth = cellSize.x * 0.5f;
            var halfHeight = cellSize.y * 0.5f;
            var localX = worldPosition.x - origin.x;
            var localY = worldPosition.y - origin.y;

            var gridX = (localY / halfHeight + localX / halfWidth) * 0.5f;
            var gridY = (localY / halfHeight - localX / halfWidth) * 0.5f;

            return new Vector2Int(Mathf.RoundToInt(gridX), Mathf.RoundToInt(gridY));
        }
    }
}
