using System.Collections.Generic;
using UnityEngine;
using Ashfall.Player;

namespace Ashfall.Combat
{
    public class EnemyController : MonoBehaviour, IDamageable
    {
        private static readonly List<EnemyController> Active = new List<EnemyController>();

        public static IReadOnlyList<EnemyController> ActiveEnemies => Active;

        public static EnemyController FindNearest(Vector3 position)
        {
            EnemyController nearest = null;
            float best = float.MaxValue;
            for (int i = 0; i < Active.Count; i += 1)
            {
                var enemy = Active[i];
                float dist = Vector3.Distance(position, enemy.transform.position);
                if (dist < best)
                {
                    best = dist;
                    nearest = enemy;
                }
            }
            return nearest;
        }

        public EnemyData data;
        public Projectile projectilePrefab;

        private PlayerController player;
        private float hp;
        private float attackTimer;
        private float speed;
        private float damage;
        private float armor;

        public int CreditReward => data != null ? data.creditReward : 0;
        public int XpReward => data != null ? data.xpReward : 0;

        public event System.Action<EnemyController> OnDeath;

        private void OnEnable()
        {
            Active.Add(this);
        }

        private void OnDisable()
        {
            Active.Remove(this);
        }

        public void Initialize(EnemyData enemyData, int wave, float difficulty)
        {
            data = enemyData;
            if (data == null) return;

            float waveFactor = 1f + (wave - 1) * 0.08f;
            float finalFactor = waveFactor * difficulty;

            hp = data.baseMaxHp * finalFactor;
            speed = data.baseSpeed * (1f + (wave - 1) * 0.02f);
            damage = data.baseDamage * (1f + (wave - 1) * 0.04f);
            armor = data.armor;
            attackTimer = Random.Range(0.3f, 0.8f);
        }

        private void Start()
        {
            player = FindObjectOfType<PlayerController>();
        }

        private void Update()
        {
            if (player == null || data == null) return;

            if (data.role == Ashfall.Core.EnemyRole.Ranged)
            {
                UpdateRanged();
            }
            else
            {
                UpdateMelee();
            }
        }

        private void UpdateMelee()
        {
            Vector3 dir = (player.transform.position - transform.position).normalized;
            transform.position += dir * speed * Time.deltaTime;

            float dist = Vector3.Distance(transform.position, player.transform.position);
            if (dist <= 1.2f)
            {
                player.TakeDamage(damage);
            }
        }

        private void UpdateRanged()
        {
            float dist = Vector3.Distance(transform.position, player.transform.position);
            Vector3 dir = (player.transform.position - transform.position).normalized;

            if (dist > data.range * 1.05f)
            {
                transform.position += dir * speed * Time.deltaTime;
            }
            else if (dist < data.range * 0.75f)
            {
                transform.position -= dir * speed * Time.deltaTime;
            }

            attackTimer -= Time.deltaTime;
            if (attackTimer <= 0f && projectilePrefab != null)
            {
                var projectile = Instantiate(projectilePrefab, transform.position, Quaternion.identity);
                projectile.Configure(dir, data.projectileSpeed, damage, 0f);
                attackTimer = 1f / data.shotRate + Random.Range(0.1f, 0.3f);
            }
        }

        public void TakeDamage(float amount)
        {
            float finalDamage = amount * (1f - armor);
            hp -= finalDamage;
            if (hp <= 0f)
            {
                OnDeath?.Invoke(this);
                Destroy(gameObject);
            }
        }
    }
}
