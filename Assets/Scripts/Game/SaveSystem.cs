using UnityEngine;

namespace CityPuzzle.Game
{
    public static class SaveSystem
    {
        private const string SaveKey = "CityPuzzle.Save";

        public static void Save(GameState state)
        {
            if (state == null)
            {
                return;
            }

            state.LastSavedUtcTicks = System.DateTime.UtcNow.Ticks;
            var json = JsonUtility.ToJson(state);
            PlayerPrefs.SetString(SaveKey, json);
            PlayerPrefs.Save();
        }

        public static GameState Load()
        {
            if (!PlayerPrefs.HasKey(SaveKey))
            {
                return null;
            }

            var json = PlayerPrefs.GetString(SaveKey);
            if (string.IsNullOrWhiteSpace(json))
            {
                return null;
            }

            return JsonUtility.FromJson<GameState>(json);
        }

        public static void Clear()
        {
            PlayerPrefs.DeleteKey(SaveKey);
        }
    }
}
