using UnityEngine;

namespace Ashfall.CameraSystem
{
    public class IsometricCameraFollow : MonoBehaviour
    {
        public Transform target;
        public Vector3 offset = new Vector3(-8f, 10f, -8f);
        public float smoothTime = 0.2f;

        private Vector3 velocity;

        private void LateUpdate()
        {
            if (target == null) return;
            Vector3 desired = target.position + offset;
            transform.position = Vector3.SmoothDamp(transform.position, desired, ref velocity, smoothTime);
            transform.LookAt(target.position);
        }
    }
}
