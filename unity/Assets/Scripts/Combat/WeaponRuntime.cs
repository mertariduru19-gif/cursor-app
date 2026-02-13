using UnityEngine;

namespace Ashfall.Combat
{
    [System.Serializable]
    public struct WeaponStats
    {
        public float damage;
        public float fireRate;
        public float reload;
        public int magazine;
        public float projectileSpeed;
        public float spread;
        public int pelletCount;
        public float pierce;
    }

    public static class WeaponRuntime
    {
        public static WeaponStats GetStats(WeaponData data, int level)
        {
            int levelOffset = Mathf.Max(0, level - 1);
            float damage = data.baseDamage * (1f + levelOffset * 0.07f);
            float fireRate = data.baseFireRate * (1f + levelOffset * 0.02f);
            float reload = Mathf.Max(0.6f, data.baseReload * (1f - levelOffset * 0.01f));
            int magazine = data.baseMagazine + Mathf.FloorToInt(levelOffset / 4f);
            float projectileSpeed = data.projectileSpeed + levelOffset * 0.25f;

            return new WeaponStats
            {
                damage = damage,
                fireRate = fireRate,
                reload = reload,
                magazine = magazine,
                projectileSpeed = projectileSpeed,
                spread = data.spread,
                pelletCount = Mathf.Max(1, data.pelletCount),
                pierce = data.pierce
            };
        }
    }
}
