using System;

namespace Ashfall.Core
{
    public class EconomyManager
    {
        private readonly PlayerProfile profile;

        public event Action<int> OnCreditsChanged;

        public EconomyManager(PlayerProfile profile)
        {
            this.profile = profile;
        }

        public int Credits => profile.credits;

        public void AddCredits(int amount)
        {
            if (amount <= 0) return;
            profile.credits += amount;
            OnCreditsChanged?.Invoke(profile.credits);
        }

        public bool SpendCredits(int amount)
        {
            if (amount <= 0) return true;
            if (profile.credits < amount) return false;
            profile.credits -= amount;
            OnCreditsChanged?.Invoke(profile.credits);
            return true;
        }
    }
}
