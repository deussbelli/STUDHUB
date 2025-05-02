# azure_config.py

import msal
import os

# Налаштування для Azure AD (можна задати через змінні середовища або прямо тут)
AZURE_CLIENT_ID = os.environ.get("AZURE_CLIENT_ID", "f863a945-4655-4b9c-915a-df4efa0139e0")
AZURE_CLIENT_SECRET = os.environ.get("AZURE_CLIENT_SECRET", "Rfe8Q~QLwd6P16csd6BdhBjtm83G2wXLa2vrTbex")
AZURE_TENANT_ID = os.environ.get("AZURE_TENANT_ID", "5065d102-3127-4ad5-b4cd-331de41ef39c")  # або GUID, або домен типу studhub.onmicrosoft.com
AZURE_REDIRECT_URI = os.environ.get("AZURE_REDIRECT_URI", "http://localhost:5000/auth/azure/callback")

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
