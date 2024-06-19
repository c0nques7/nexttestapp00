import React, { createContext, useContext, useState } from "react";

interface UserContextProps {
  userId: string; // Existing property for the post's author ID
  setUserId: React.Dispatch<React.SetStateAction<string>>;
  viewerUserId: string;  // New property for viewer's ID
  setViewerUserId: React.Dispatch<React.SetStateAction<string>>; // To update viewer's ID
}

const UserContext = createContext<UserContextProps>({
  userId: "",
  setUserId: () => {},
  viewerUserId: "", // Initialize with an empty string
  setViewerUserId: () => {},
});

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [userId, setUserId] = useState<string>("");
  const [viewerUserId, setViewerUserId] = useState<string>(""); // New state

  return (
    <UserContext.Provider value={{ userId, setUserId, viewerUserId, setViewerUserId }}>
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