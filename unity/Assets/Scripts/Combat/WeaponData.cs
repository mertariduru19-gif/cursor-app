using UnityEngine;
using Ashfall.Core;

namespace Ashfall.Combat
{
    [CreateAssetMenu(menuName = "Ashfall/Weapon Data")]
    public class WeaponData : ScriptableObject
    {
        public string id = "carapace";
        public string displayName = "Carapace Rifle";
        public Rarity rarity = Rarity.Common;
        public int unlockCost = 0;

        [Header("Base Stats")]
        public float baseDamage = 12f;
        public float baseFireRate = 4.5f;
        public float baseReload = 1.4f;
        public int baseMagazine = 12;
        public float projectileSpeed = 18f;
        public float spread = 0.02f;
        public int pelletCount = 1;
        public float pierce = 0.25f;

        [TextArea] public string specialDesc;
    }
}
