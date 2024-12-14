import React, { createContext, useContext, useState } from "react";

const ProfileContext = createContext();

export const ProfileProvider = ({ children }) => {
  const [profile, setProfile] = useState(null);

  const setDefaultProfile = (profiles) => {
    if (!profile && profiles.length > 0) {
      setProfile(profiles[0]); // Automatically set the first profile
    }
  };

  return (
    <ProfileContext.Provider value={{ profile, setProfile, setDefaultProfile }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
};

