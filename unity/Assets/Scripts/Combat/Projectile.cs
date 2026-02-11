using UnityEngine;
using Ashfall.Player;

namespace Ashfall.Combat
{
    public class Projectile : MonoBehaviour
    {
        public float lifeTime = 2.4f;

        private Vector3 velocity;
        private float damage;
        private float pierce;
        private float timer;

        public void Configure(Vector3 direction, float speed, float damage, float pierce)
        {
            velocity = direction.normalized * speed;
            this.damage = damage;
            this.pierce = pierce;
            timer = lifeTime;
        }

        private void Update()
        {
            transform.position += velocity * Time.deltaTime;
            timer -= Time.deltaTime;
            if (timer <= 0f)
            {
                Destroy(gameObject);
            }
        }

        private void OnTriggerEnter(Collider other)
        {
            var damageable = other.GetComponent<IDamageable>();
            if (damageable == null) return;

            damageable.TakeDamage(damage);
            if (pierce <= 0f)
            {
                Destroy(gameObject);
            }
        }
    }
}
