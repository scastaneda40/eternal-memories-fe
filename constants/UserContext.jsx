import React, { createContext, useContext, useEffect, useState } from "react";
import { useUser as useClerkUser } from "@clerk/clerk-expo";

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const { user: clerkUser, isSignedIn } = useClerkUser();
  const [user, setUser] = useState(null);

  useEffect(() => {
      if (clerkUser && isSignedIn) {
          fetch("http://localhost:5000/get-or-create-user", {
              method: "POST",
              headers: {
                  "Content-Type": "application/json",
              },
              body: JSON.stringify({
                  clerk_user_id: clerkUser.id,
                  email: clerkUser.primaryEmailAddress?.emailAddress || null,
              }),
          })
              .then((res) => res.json())
              .then((data) => {
                  setUser({ id: data.uuid });
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

export const useUser = () => {
  return useContext(UserContext);
};
