using UnityEngine;
using Ashfall.Core;

namespace Ashfall.Combat
{
    [CreateAssetMenu(menuName = "Ashfall/Character Data")]
    public class CharacterData : ScriptableObject
    {
        public string id = "forge";
        public string displayName = "Mara Forge";
        public Rarity rarity = Rarity.Common;
        public int unlockCost = 0;

        [Header("Base Stats")]
        public float baseMaxHp = 120f;
        public float baseSpeed = 4.5f;
        public float damageMultiplier = 1f;
        public float critChance = 0.05f;

        [Header("Ability")]
        public float abilityCooldown = 16f;
        public float abilityDuration = 6f;
        [TextArea] public string passiveDesc;
        [TextArea] public string activeDesc;
    }
}
