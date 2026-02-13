using UnityEngine;
using UnityEngine.UI;
using Ashfall.Core;
using Ashfall.Player;
using Ashfall.Combat;

namespace Ashfall.UI
{
    public class HUDController : MonoBehaviour
    {
        public Text levelText;
        public Text xpText;
        public Text hpText;
        public Text creditsText;
        public Text waveText;

        public PlayerController player;
        public WaveManager waveManager;

        private void Update()
        {
            if (GameBootstrap.Instance == null) return;

            var profile = GameBootstrap.Instance.Profile;
            if (levelText != null)
            {
                levelText.text = $"Seviye {profile.playerLevel}";
            }

            if (xpText != null)
            {
                xpText.text = $"XP {profile.playerXp}/{XpToNext(profile.playerLevel)}";
            }

            if (creditsText != null)
            {
                creditsText.text = $"Kredi {profile.credits}";
            }

            if (player != null && hpText != null)
            {
                hpText.text = $"HP {Mathf.RoundToInt(player.GetHpNormalized() * 100f)}%";
            }

            if (waveManager != null && waveText != null)
            {
                waveText.text = $"Dalga {waveManager.wave}";
            }
        }

        private int XpToNext(int level)
        {
            return 100 + (level - 1) * 40;
        }
    }
}
