
import api from "../../../lib/AxiosInstance";

export async function register({ userName, email, password }) {
  try {
    const resposne = await api.post("/auth/register", {
      userName,
      email,
      password,
    });
    return resposne.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function login({ email, password }) {
  try {
    const resposne = await api.post("/auth/login", {
      email,
      password,
    });
    return resposne.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function logout() {
  try {
    const resposne = await api.get("/auth/logout");
    return resposne.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getCurrentUser() {
  try {
    const resposne = await api.get("/auth/get-me");
    return resposne.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
}
