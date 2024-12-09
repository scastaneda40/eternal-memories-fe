import React, { createContext, useContext, useEffect, useState } from "react";
import { useUser as useClerkUser } from "@clerk/clerk-expo";

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const { user: clerkUser, isSignedIn } = useClerkUser();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log("Clerk user:", clerkUser); // Debug log to check clerk user
    console.log("User is signed in:", isSignedIn);

    if (clerkUser && isSignedIn) {
      setUser({
        id: clerkUser.id,
        email: clerkUser.primaryEmailAddress?.emailAddress || null,
      });
    } else {
      setUser(null);
    }
    setIsLoading(false);
  }, [clerkUser, isSignedIn]);

  return (
    <UserContext.Provider value={{ user, isLoading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  return useContext(UserContext);
};
