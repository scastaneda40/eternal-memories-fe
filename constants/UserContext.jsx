import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUser as useClerkUser } from "@clerk/clerk-expo";

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const { user: clerkUser, isSignedIn } = useClerkUser();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUserFromStorage = async () => {
      const storedUser = await AsyncStorage.getItem("user");
      if (storedUser) setUser(JSON.parse(storedUser));
    };
    loadUserFromStorage();
  }, []);

  useEffect(() => {
    if (clerkUser && isSignedIn) {
      fetch("http://192.168.1.55/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clerk_user_id: clerkUser.id,
          email: clerkUser.primaryEmailAddress?.emailAddress || null,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          const userData = {
            id: data.id,
            name: data.name || "Anonymous",
            email: data.email,
            avatar_url: data.avatar_url || null
          }
          console.log('user data', userData)
          setUser(userData);
          AsyncStorage.setItem("user", JSON.stringify(userData));
        })
        .catch((err) => console.error("Error fetching user UUID:", err));
    }
  }, [clerkUser, isSignedIn]);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
