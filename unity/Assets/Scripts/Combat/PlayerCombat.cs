using UnityEngine;
using Ashfall.Player;
using Ashfall.Core;

namespace Ashfall.Combat
{
    public class PlayerCombat : MonoBehaviour
    {
        public WeaponData weaponData;
        public Projectile projectilePrefab;
        public Transform firePoint;

        [Header("Runtime")]
        public int weaponLevel = 1;

        private PlayerController player;
        private float shotTimer;
        private float reloadTimer;
        private int ammo;
        private WeaponStats currentStats;

        private void Awake()
        {
            player = GetComponent<PlayerController>();
            RefreshWeapon();
        }

        public void RefreshWeapon()
        {
            if (weaponData == null) return;
            currentStats = WeaponRuntime.GetStats(weaponData, weaponLevel);
            ammo = currentStats.magazine;
        }

        private void Update()
        {
            if (weaponData == null || projectilePrefab == null) return;

            if (reloadTimer > 0f)
            {
                reloadTimer -= Time.deltaTime;
                if (reloadTimer <= 0f)
                {
                    ammo = currentStats.magazine;
                }
                return;
            }

            if (shotTimer > 0f)
            {
                shotTimer -= Time.deltaTime;
            }

            var target = EnemyController.FindNearest(transform.position);
            if (target == null) return;

            TryShoot(target);
        }

        private void TryShoot(EnemyController target)
        {
            if (shotTimer > 0f) return;

            if (ammo <= 0)
            {
                reloadTimer = currentStats.reload;
                return;
            }

            ammo -= 1;
            shotTimer = 1f / currentStats.fireRate;

            Vector3 origin = firePoint ? firePoint.position : transform.position;
            Vector3 dir = (target.transform.position - origin).normalized;
            float angleOffset = Random.Range(-currentStats.spread, currentStats.spread);
            dir = Quaternion.Euler(0f, angleOffset * Mathf.Rad2Deg, 0f) * dir;

            var projectile = Instantiate(projectilePrefab, origin, Quaternion.identity);
            projectile.Configure(dir, currentStats.projectileSpeed, currentStats.damage, currentStats.pierce);
        }
    }
}
