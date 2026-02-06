using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using CityPuzzle.Core;
using CityPuzzle.Game;

namespace CityPuzzle.UI
{
    public class RuntimeHud : MonoBehaviour
    {
        [SerializeField] private GameManager gameManager;
        [SerializeField] private float refreshInterval = 0.5f;
        [SerializeField] private Vector2 panelOffset = new Vector2(16f, -16f);

        private readonly List<ResourceEntry> resourceEntries = new List<ResourceEntry>();
        private Text levelText;
        private float refreshTimer;

        private void Awake()
        {
            if (gameManager == null)
            {
                gameManager = FindObjectOfType<GameManager>();
            }

            BuildUi();
            Refresh();
        }

        private void Update()
        {
            refreshTimer += Time.unscaledDeltaTime;
            if (refreshTimer >= refreshInterval)
            {
                refreshTimer = 0f;
                Refresh();
            }
        }

        private void BuildUi()
        {
            var canvas = FindObjectOfType<Canvas>();
            if (canvas == null)
            {
                canvas = CreateCanvas();
            }

            EnsureEventSystem();

            var panel = CreatePanel(canvas.transform);
            var font = Resources.GetBuiltinResource<Font>("Arial.ttf");

            levelText = CreateLabel(panel.transform, font, "Level: 1");

            resourceEntries.Clear();
            var config = gameManager != null ? gameManager.Config : null;
            if (config != null)
            {
                foreach (var resource in config.Resources)
                {
                    if (resource == null || string.IsNullOrWhiteSpace(resource.Id))
                    {
                        continue;
                    }

                    var label = string.IsNullOrWhiteSpace(resource.DisplayName)
                        ? resource.Id
                        : resource.DisplayName;
                    var text = CreateLabel(panel.transform, font, $"{label}: 0/0");
                    resourceEntries.Add(new ResourceEntry(resource.Id, label, text));
                }
            }

            var button = CreateButton(panel.transform, font, "Puzzle Baslat");
            button.onClick.AddListener(HandlePuzzlePressed);
        }

        private void Refresh()
        {
            if (gameManager == null)
            {
                return;
            }

            if (levelText != null)
            {
                levelText.text = $"Level: {gameManager.PlayerLevel}";
            }

            var inventory = gameManager.Inventory;
            if (inventory == null)
            {
                return;
            }

            foreach (var entry in resourceEntries)
            {
                if (entry.Text == null)
                {
                    continue;
                }

                var amount = inventory.GetAmount(entry.ResourceId);
                var capacity = inventory.GetCapacity(entry.ResourceId);
                entry.Text.text = $"{entry.Label}: {amount}/{capacity}";
            }
        }

        private void HandlePuzzlePressed()
        {
            Debug.Log("Puzzle baslat istegi alindi (UI stub).");
        }

        private Canvas CreateCanvas()
        {
            var canvasObject = new GameObject("HUDCanvas", typeof(RectTransform), typeof(Canvas), typeof(CanvasScaler), typeof(GraphicRaycaster));
            var canvas = canvasObject.GetComponent<Canvas>();
            canvas.renderMode = RenderMode.ScreenSpaceOverlay;
            var scaler = canvasObject.GetComponent<CanvasScaler>();
            scaler.uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize;
            scaler.referenceResolution = new Vector2(1920f, 1080f);
            scaler.matchWidthOrHeight = 1f;
            return canvas;
        }

        private void EnsureEventSystem()
        {
            var existing = FindObjectOfType<UnityEngine.EventSystems.EventSystem>();
            if (existing != null)
            {
                return;
            }

            var eventObject = new GameObject("EventSystem", typeof(UnityEngine.EventSystems.EventSystem), typeof(UnityEngine.EventSystems.StandaloneInputModule));
            DontDestroyOnLoad(eventObject);
        }

        private RectTransform CreatePanel(Transform parent)
        {
            var panelObject = new GameObject("HUDPanel", typeof(RectTransform), typeof(VerticalLayoutGroup), typeof(ContentSizeFitter));
            panelObject.transform.SetParent(parent, false);
            var rect = panelObject.GetComponent<RectTransform>();
            rect.anchorMin = new Vector2(0f, 1f);
            rect.anchorMax = new Vector2(0f, 1f);
            rect.pivot = new Vector2(0f, 1f);
            rect.anchoredPosition = panelOffset;

            var layout = panelObject.GetComponent<VerticalLayoutGroup>();
            layout.padding = new RectOffset(12, 12, 12, 12);
            layout.spacing = 6f;
            layout.childAlignment = TextAnchor.UpperLeft;
            layout.childControlHeight = true;
            layout.childControlWidth = true;
            layout.childForceExpandHeight = false;
            layout.childForceExpandWidth = false;

            var fitter = panelObject.GetComponent<ContentSizeFitter>();
            fitter.horizontalFit = ContentSizeFitter.FitMode.PreferredSize;
            fitter.verticalFit = ContentSizeFitter.FitMode.PreferredSize;

            return rect;
        }

        private Text CreateLabel(Transform parent, Font font, string text)
        {
            var labelObject = new GameObject("Label", typeof(RectTransform), typeof(Text));
            labelObject.transform.SetParent(parent, false);
            var label = labelObject.GetComponent<Text>();
            label.text = text;
            label.font = font;
            label.fontSize = 28;
            label.color = Color.white;
            label.alignment = TextAnchor.MiddleLeft;
            label.raycastTarget = false;
            return label;
        }

        private Button CreateButton(Transform parent, Font font, string text)
        {
            var buttonObject = new GameObject("PuzzleButton", typeof(RectTransform), typeof(Image), typeof(Button));
            buttonObject.transform.SetParent(parent, false);
            var image = buttonObject.GetComponent<Image>();
            image.color = new Color(0.88f, 0.35f, 0.35f, 1f);

            var button = buttonObject.GetComponent<Button>();
            button.targetGraphic = image;

            var labelObject = new GameObject("Text", typeof(RectTransform), typeof(Text));
            labelObject.transform.SetParent(buttonObject.transform, false);
            var label = labelObject.GetComponent<Text>();
            label.text = text;
            label.font = font;
            label.fontSize = 26;
            label.alignment = TextAnchor.MiddleCenter;
            label.color = Color.white;

            var rect = labelObject.GetComponent<RectTransform>();
            rect.anchorMin = Vector2.zero;
            rect.anchorMax = Vector2.one;
            rect.offsetMin = Vector2.zero;
            rect.offsetMax = Vector2.zero;

            var buttonRect = buttonObject.GetComponent<RectTransform>();
            buttonRect.sizeDelta = new Vector2(260f, 56f);

            return button;
        }

        private class ResourceEntry
        {
            public string ResourceId;
            public string Label;
            public Text Text;

            public ResourceEntry(string resourceId, string label, Text text)
            {
                ResourceId = resourceId;
                Label = label;
                Text = text;
            }
        }
    }
}
