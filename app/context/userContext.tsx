import React, { createContext, useContext, useState } from "react";

interface UserContextProps {
  userId: string;
  setUserId: React.Dispatch<React.SetStateAction<string>>; // Function to update userId
}

const UserContext = createContext<UserContextProps>( {userId: '', setUserId: () => {} } );

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => { 
  const [userId, setUserId] = useState<string>(''); // Initialize userId with an empty string

  return (
    <UserContext.Provider value={{ userId, setUserId }}>
      {children} 
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
};