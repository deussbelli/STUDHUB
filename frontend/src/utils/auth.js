// utils/auth.js
export function isAuthenticated() {
  const token = localStorage.getItem("fake-jwt");
  return !!token;
}

export async function login(email, password) {
  try {
    const response = await fetch("http://localhost:5000/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.status === 403) {
      return {
        success: false,
        unverified: true,
        message: data.error || "Ваш акаунт не верифікований!"
      };
    }

    if (!response.ok) {
      throw new Error(data.error || "Помилка логіну");
    }

    if (data.token) {
      localStorage.setItem("fake-jwt", data.token);
      localStorage.setItem("is_admin", data.is_admin === 1 ? "1" : "0"); 
      return { success: true };
    } else {
      throw new Error("Відсутній токен у відповіді");
    }
  } catch (err) {
    return { success: false, message: err.message };
  }
}

export async function registerUser(userData) {
  try {
    const response = await fetch("http://localhost:5000/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData)
    });
    const data = await response.json();
    return data; 
  } catch (err) {
    return { success: false, message: err.message };
  }
}

export const isAdmin = () => {
  return localStorage.getItem("is_admin") === "1";
};

export async function verifyEmail(email, verification_code) {
  try {
    const response = await fetch("http://localhost:5000/api/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, verification_code })
    });
    const data = await response.json();
    return data; 
  } catch (err) {
    return { success: false, message: err.message };
  }
}

export function logout() {
  localStorage.removeItem("fake-jwt");
  localStorage.removeItem("is_admin");
}