using UnityEngine;

namespace Ashfall.Core
{
    public class GameBootstrap : MonoBehaviour
    {
        public static GameBootstrap Instance { get; private set; }

        public PlayerProfile Profile { get; private set; }
        public EconomyManager Economy { get; private set; }

        private const string SaveKey = "ashfall_profile_v1";

        private void Awake()
        {
            if (Instance != null)
            {
                Destroy(gameObject);
                return;
            }

            Instance = this;
            DontDestroyOnLoad(gameObject);

            Profile = LoadProfile();
            Economy = new EconomyManager(Profile);
        }

        public void SaveProfile()
        {
            var json = JsonUtility.ToJson(Profile);
            PlayerPrefs.SetString(SaveKey, json);
            PlayerPrefs.Save();
        }

        private PlayerProfile LoadProfile()
        {
            if (!PlayerPrefs.HasKey(SaveKey))
            {
                return PlayerProfile.CreateDefault();
            }

            var json = PlayerPrefs.GetString(SaveKey);
            if (string.IsNullOrEmpty(json))
            {
                return PlayerProfile.CreateDefault();
            }

            return JsonUtility.FromJson<PlayerProfile>(json) ?? PlayerProfile.CreateDefault();
        }

        private void OnApplicationPause(bool pause)
        {
            if (pause)
            {
                SaveProfile();
            }
        }

        private void OnApplicationQuit()
        {
            SaveProfile();
        }
    }
}
