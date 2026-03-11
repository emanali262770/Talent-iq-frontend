
import { createContext, useEffect, useState } from "react";
import { getCurrentUser } from "./services/auth.api";




export const AuthContext =createContext();

export const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadCurrentUser = async () => {
            setLoading(true);
            try {
                const data = await getCurrentUser();
                setUser(data.user);
            } catch (error) {
                setUser(null);
                console.error("Get Current User Error:", error);
            } finally {
                setLoading(false);
            }
        };

        loadCurrentUser();
    }, []);

    return (
        <AuthContext.Provider value={{ user, setUser, loading, setLoading }}>
            {children}
        </AuthContext.Provider>
    );
};