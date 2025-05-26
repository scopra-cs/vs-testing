namespace Codescene.VSExtension.CodeSmells.Issues.CSharp
{
    public class UserAccountManager
    {
        private Dictionary<string, string> userPasswords = new Dictionary<string, string>();
        private Dictionary<string, string> userEmails = new Dictionary<string, string>();
        private Dictionary<string, bool> userActivationStatus = new Dictionary<string, bool>();
        private Dictionary<string, string> userRoles = new Dictionary<string, string>();

        public void RegisterUser(string username, string password, string email, string role, bool isActive)
        {
            userPasswords[username] = password;
            userEmails[username] = email;
            userRoles[username] = role;
            userActivationStatus[username] = isActive;
        }

        public bool Authenticate(string username, string password)
        {
            if (!userPasswords.ContainsKey(username)) return false;
            return userPasswords[username] == password;
        }

        public void UpdateEmail(string username, string newEmail)
        {
            if (userEmails.ContainsKey(username))
            {
                userEmails[username] = newEmail;
            }
        }

        public void ChangePassword(string username, string newPassword)
        {
            if (userPasswords.ContainsKey(username))
            {
                userPasswords[username] = newPassword;
            }
        }

        public void AssignRole(string username, string role)
        {
            if (userRoles.ContainsKey(username))
            {
                userRoles[username] = role;
            }
        }

        public void SetActiveStatus(string username, bool isActive)
        {
            if (userActivationStatus.ContainsKey(username))
            {
                userActivationStatus[username] = isActive;
            }
        }

        public string GetUserInfo(string username)
        {
            return $"Username: {username}, Email: {userEmails.GetValueOrDefault(username)}, Role: {userRoles.GetValueOrDefault(username)}, Active: {userActivationStatus.GetValueOrDefault(username)}";
        }
    }

}
