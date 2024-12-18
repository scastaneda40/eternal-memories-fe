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
    const fetchUser = async () => {
      const payload = {
        clerk_user_id: clerkUser.id,
        email: clerkUser.primaryEmailAddress?.emailAddress,
      };
  
      console.log("Payload being sent to backend:", payload);
  
      try {
        const response = await fetch("http://192.168.1.116:5000/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
  
        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }
  
        const data = await response.json();
        console.log("Response received from backend:", data);
        setUser(data);
      } catch (error) {
        console.error("Error fetching user UUID:", error.message);
      }
    };
  
    if (clerkUser && isSignedIn) {
      fetchUser();
    }
  }, [clerkUser, isSignedIn]);
  

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
