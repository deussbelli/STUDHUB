# azure_config.py

import msal
import os

# Налаштування для Azure AD (можна задати через змінні середовища або прямо тут)
AZURE_CLIENT_ID = os.environ.get("AZURE_CLIENT_ID")
AZURE_CLIENT_SECRET = os.environ.get("AZURE_CLIENT_SECRET")
AZURE_TENANT_ID = os.environ.get("AZURE_TENANT_ID")  # або GUID, або домен типу studhub.onmicrosoft.com
AZURE_REDIRECT_URI = os.environ.get("AZURE_REDIRECT_URI")

# Authority URL (важливо: має бути валідний TENANT_ID!)
AZURE_AUTHORITY = f"https://login.microsoftonline.com/{AZURE_TENANT_ID}"

# Які дозволи будуть запитуватись
AZURE_SCOPE = ["User.Read"]

def get_msal_app(cache=None):
    """
    Створює екземпляр MSAL ConfidentialClientApplication.
    """
    return msal.ConfidentialClientApplication(
        client_id=AZURE_CLIENT_ID,
        authority=AZURE_AUTHORITY,
        client_credential=AZURE_CLIENT_SECRET,
        token_cache=cache
    )
