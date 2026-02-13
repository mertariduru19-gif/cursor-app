using UnityEngine;
using UnityEngine.EventSystems;

namespace Ashfall.Inputs
{
    public class VirtualJoystick : MonoBehaviour, IPointerDownHandler, IDragHandler, IPointerUpHandler
    {
        public RectTransform handle;
        public float maxRadius = 60f;

        private RectTransform rectTransform;
        private Vector2 input;
        private Vector2 startPos;

        public Vector2 Value => input;

        private void Awake()
        {
            rectTransform = GetComponent<RectTransform>();
            if (handle != null)
            {
                startPos = handle.anchoredPosition;
            }
        }

        public void OnPointerDown(PointerEventData eventData)
        {
            UpdateHandle(eventData);
        }

        public void OnDrag(PointerEventData eventData)
        {
            UpdateHandle(eventData);
        }

        public void OnPointerUp(PointerEventData eventData)
        {
            input = Vector2.zero;
            if (handle != null)
            {
                handle.anchoredPosition = startPos;
            }
        }

        private void UpdateHandle(PointerEventData eventData)
        {
            if (rectTransform == null || handle == null) return;
            Vector2 localPoint;
            RectTransformUtility.ScreenPointToLocalPointInRectangle(
                rectTransform,
                eventData.position,
                eventData.pressEventCamera,
                out localPoint
            );
            Vector2 clamped = Vector2.ClampMagnitude(localPoint, maxRadius);
            handle.anchoredPosition = clamped;
            input = clamped / maxRadius;
        }
    }
}
