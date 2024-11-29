import React, { createContext, useContext } from 'react';

// Mock user UUID
const mockUserId = '123e4567-e89b-12d3-a456-426614174000';

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
    return (
        <UserContext.Provider value={{ userId: mockUserId }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    return useContext(UserContext);
};
