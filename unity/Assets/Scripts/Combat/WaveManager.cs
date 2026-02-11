using System.Collections.Generic;
using UnityEngine;
using Ashfall.Core;

namespace Ashfall.Combat
{
    public class WaveManager : MonoBehaviour
    {
        [System.Serializable]
        public class EnemySpawnEntry
        {
            public EnemyData data;
            public EnemyController prefab;
            public int minWave = 1;
        }

        public List<EnemySpawnEntry> enemies = new List<EnemySpawnEntry>();
        public EnemySpawnEntry bossEntry;
        public Transform[] spawnPoints;

        public int wave = 1;
        public float difficultyFactor = 1f;
        public float targetWaveTime = 26f;

        private float waveStartTime;
        private float waveDelay;
        private bool waveCleared;

        private void Start()
        {
            StartWave();
        }

        private void Update()
        {
            if (EnemyController.ActiveEnemies.Count > 0)
            {
                return;
            }

            if (!waveCleared)
            {
                waveCleared = true;
                float waveTime = Time.time - waveStartTime;
                if (waveTime < targetWaveTime - 6f)
                {
                    difficultyFactor = Mathf.Min(1.3f, difficultyFactor + 0.05f);
                }
                else if (waveTime > targetWaveTime + 6f)
                {
                    difficultyFactor = Mathf.Max(0.85f, difficultyFactor - 0.05f);
                }
                waveDelay = 2f;
            }
            else
            {
                waveDelay -= Time.deltaTime;
                if (waveDelay <= 0f)
                {
                    wave += 1;
                    StartWave();
                }
            }
        }

        private void StartWave()
        {
            waveStartTime = Time.time;
            waveCleared = false;

            int baseCount = 5 + Mathf.FloorToInt(wave * 2.2f);
            bool isBoss = wave % 5 == 0;

            if (isBoss && bossEntry != null && bossEntry.prefab != null)
            {
                SpawnEnemy(bossEntry);
                int minions = Mathf.Max(4, Mathf.FloorToInt(baseCount * 0.6f));
                for (int i = 0; i < minions; i += 1)
                {
                    SpawnEnemyFromPool();
                }
            }
            else
            {
                for (int i = 0; i < baseCount; i += 1)
                {
                    SpawnEnemyFromPool();
                }
            }
        }

        private void SpawnEnemyFromPool()
        {
            var pool = GetPoolForWave();
            if (pool.Count == 0) return;
            var entry = pool[Random.Range(0, pool.Count)];
            SpawnEnemy(entry);
        }

        private List<EnemySpawnEntry> GetPoolForWave()
        {
            var pool = new List<EnemySpawnEntry>();
            for (int i = 0; i < enemies.Count; i += 1)
            {
                if (enemies[i] != null && wave >= enemies[i].minWave)
                {
                    pool.Add(enemies[i]);
                }
            }
            return pool;
        }

        private void SpawnEnemy(EnemySpawnEntry entry)
        {
            if (entry == null || entry.prefab == null || entry.data == null) return;
            Transform spawn = GetSpawnPoint();
            var enemy = Instantiate(entry.prefab, spawn.position, Quaternion.identity);
            enemy.Initialize(entry.data, wave, difficultyFactor);
            enemy.OnDeath += HandleEnemyDeath;
        }

        private Transform GetSpawnPoint()
        {
            if (spawnPoints == null || spawnPoints.Length == 0)
            {
                return transform;
            }
            return spawnPoints[Random.Range(0, spawnPoints.Length)];
        }

        private void HandleEnemyDeath(EnemyController enemy)
        {
            var economy = GameBootstrap.Instance ? GameBootstrap.Instance.Economy : null;
            if (economy != null)
            {
                economy.AddCredits(enemy.CreditReward);
            }
        }
    }
}
