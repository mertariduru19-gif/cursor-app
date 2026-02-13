using UnityEngine;
using Ashfall.Player;

namespace Ashfall.Combat
{
    public class Projectile : MonoBehaviour
    {
        public float lifeTime = 2.4f;
        public TrailRenderer trail;
        public float trailTime = 0.18f;
        public float trailStartWidth = 0.08f;
        public float trailEndWidth = 0f;
        public Color trailColor = new Color(1f, 0.9f, 0.6f, 1f);

        private Vector3 velocity;
        private float damage;
        private float pierce;
        private float timer;

        private void Awake()
        {
            if (trail == null)
            {
                trail = GetComponent<TrailRenderer>();
            }

            if (trail != null)
            {
                trail.time = trailTime;
                trail.startWidth = trailStartWidth;
                trail.endWidth = trailEndWidth;
                trail.startColor = trailColor;
                trail.endColor = new Color(trailColor.r, trailColor.g, trailColor.b, 0f);
            }
        }

        public void Configure(Vector3 direction, float speed, float damage, float pierce)
        {
            velocity = direction.normalized * speed;
            this.damage = damage;
            this.pierce = pierce;
            timer = lifeTime;
            if (trail != null)
            {
                trail.Clear();
            }
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
