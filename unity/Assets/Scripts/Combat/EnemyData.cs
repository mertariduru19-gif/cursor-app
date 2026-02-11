using UnityEngine;
using Ashfall.Core;

namespace Ashfall.Combat
{
    [CreateAssetMenu(menuName = "Ashfall/Enemy Data")]
    public class EnemyData : ScriptableObject
    {
        public string id = "stalker";
        public string displayName = "Stalker";
        public EnemyRole role = EnemyRole.Melee;
        public bool isRobot;

        [Header("Base Stats")]
        public float baseMaxHp = 30f;
        public float baseDamage = 6f;
        public float baseSpeed = 3.2f;
        public float armor = 0f;

        [Header("Ranged")]
        public float range = 6f;
        public float shotRate = 1.2f;
        public float projectileSpeed = 14f;

        [Header("Rewards")]
        public int creditReward = 3;
        public int xpReward = 8;

        public Color color = new Color(0.85f, 0.38f, 0.38f, 1f);
    }
}
