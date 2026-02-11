using System;
using System.Collections.Generic;
using UnityEngine;

namespace Ashfall.Core
{
    [Serializable]
    public class PlayerProfile
    {
        public int credits;
        public int playerLevel;
        public int playerXp;
        public int skillPoints;
        public int skillDamage;
        public int skillHealth;
        public int skillSpeed;
        public string selectedCharacterId;
        public string selectedWeaponId;

        public List<string> unlockedCharacters = new List<string>();
        public List<string> unlockedWeapons = new List<string>();
        public List<StringIntPair> weaponLevels = new List<StringIntPair>();

        public static PlayerProfile CreateDefault()
        {
            var profile = new PlayerProfile
            {
                credits = 0,
                playerLevel = 1,
                playerXp = 0,
                skillPoints = 0,
                skillDamage = 0,
                skillHealth = 0,
                skillSpeed = 0,
                selectedCharacterId = "forge",
                selectedWeaponId = "carapace"
            };

            profile.unlockedCharacters.Add("forge");
            profile.unlockedWeapons.Add("carapace");
            profile.weaponLevels.Add(new StringIntPair("carapace", 1));
            return profile;
        }

        public int GetWeaponLevel(string id)
        {
            foreach (var pair in weaponLevels)
            {
                if (pair.key == id)
                {
                    return pair.value;
                }
            }
            return 1;
        }

        public void SetWeaponLevel(string id, int level)
        {
            for (int i = 0; i < weaponLevels.Count; i += 1)
            {
                if (weaponLevels[i].key == id)
                {
                    var pair = weaponLevels[i];
                    pair.value = level;
                    weaponLevels[i] = pair;
                    return;
                }
            }
            weaponLevels.Add(new StringIntPair(id, level));
        }

        public bool IsCharacterUnlocked(string id)
        {
            return unlockedCharacters.Contains(id);
        }

        public bool IsWeaponUnlocked(string id)
        {
            return unlockedWeapons.Contains(id);
        }
    }

    [Serializable]
    public struct StringIntPair
    {
        public string key;
        public int value;

        public StringIntPair(string key, int value)
        {
            this.key = key;
            this.value = value;
        }
    }
}
