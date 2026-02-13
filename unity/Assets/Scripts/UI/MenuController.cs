using UnityEngine;
using UnityEngine.UI;
using Ashfall.Core;

namespace Ashfall.UI
{
    public class MenuController : MonoBehaviour
    {
        public Text characterText;
        public Text weaponText;
        public Text creditsText;
        public GameObject menuRoot;

        public void Refresh()
        {
            if (GameBootstrap.Instance == null) return;
            var profile = GameBootstrap.Instance.Profile;

            if (characterText != null)
            {
                characterText.text = $"Karakter: {profile.selectedCharacterId}";
            }
            if (weaponText != null)
            {
                weaponText.text = $"Silah: {profile.selectedWeaponId}";
            }
            if (creditsText != null)
            {
                creditsText.text = $"Kredi: {profile.credits}";
            }
        }

        public void StartRun()
        {
            if (menuRoot != null)
            {
                menuRoot.SetActive(false);
            }
        }

        public void OpenMenu()
        {
            if (menuRoot != null)
            {
                menuRoot.SetActive(true);
            }
            Refresh();
        }
    }
}
