using UnityEngine;

namespace CityPuzzle.Core
{
    [CreateAssetMenu(menuName = "City Puzzle/Resource Definition", fileName = "ResourceDefinition")]
    public class ResourceDefinition : ScriptableObject
    {
        [SerializeField] private string id = "resource_id";
        [SerializeField] private string displayName = "Resource";
        [SerializeField] private Color color = Color.white;

        public string Id => id;
        public string DisplayName => displayName;
        public Color Color => color;
    }
}
