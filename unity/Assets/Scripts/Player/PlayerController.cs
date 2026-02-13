using UnityEngine;
using Ashfall.Inputs;

namespace Ashfall.Player
{
    [RequireComponent(typeof(CharacterController))]
    public class PlayerController : MonoBehaviour, IDamageable
    {
        [Header("Movement")]
        public float moveSpeed = 4.5f;
        public VirtualJoystick joystick;
    public bool rotateToMovement = true;
    public float rotationSpeed = 12f;

        [Header("Health")]
        public float maxHp = 120f;
        public float invulnTime = 0.35f;

        private CharacterController controller;
        private float hp;
        private float invulnTimer;
        private Vector3 lastMoveDir = Vector3.forward;

        public Vector3 LastMoveDir => lastMoveDir;

        private void Awake()
        {
            controller = GetComponent<CharacterController>();
            hp = maxHp;
        }

        private void Update()
        {
            if (invulnTimer > 0f)
            {
                invulnTimer -= Time.deltaTime;
            }

            Vector2 input = GetMoveInput();
            Vector3 move = new Vector3(input.x, 0f, input.y);
            if (move.sqrMagnitude > 0.001f)
            {
                lastMoveDir = move.normalized;
            if (rotateToMovement)
            {
                var targetRotation = Quaternion.LookRotation(lastMoveDir, Vector3.up);
                transform.rotation = Quaternion.Slerp(
                    transform.rotation,
                    targetRotation,
                    rotationSpeed * Time.deltaTime
                );
            }
            }
            controller.Move(move * moveSpeed * Time.deltaTime);
        }

        private Vector2 GetMoveInput()
        {
            Vector2 input = Vector2.zero;
            if (joystick != null)
            {
                input = joystick.Value;
            }

            input.x += Input.GetAxisRaw("Horizontal");
            input.y += Input.GetAxisRaw("Vertical");
            return Vector2.ClampMagnitude(input, 1f);
        }

        public void TakeDamage(float amount)
        {
            if (invulnTimer > 0f) return;
            hp -= amount;
            invulnTimer = invulnTime;
            if (hp <= 0f)
            {
                hp = 0f;
                // Hook for game over event
            }
        }

        public float GetHpNormalized()
        {
            if (maxHp <= 0f) return 0f;
            return Mathf.Clamp01(hp / maxHp);
        }
    }

    public interface IDamageable
    {
        void TakeDamage(float amount);
    }
}
