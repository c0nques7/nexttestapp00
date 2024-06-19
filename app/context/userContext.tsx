import { createContext, useContext, useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import jwt from 'jsonwebtoken';

interface UserContextProps {
  userId: string;
  setUserId: React.Dispatch<React.SetStateAction<string>>;
  viewerUserId: string; 
  setViewerUserId: React.Dispatch<React.SetStateAction<string>>;
  username: string;       // Added for username
  setUsername: React.Dispatch<React.SetStateAction<string>>; // To update username
}

const UserContext = createContext<UserContextProps>({
  userId: "",
  setUserId: () => {},
  viewerUserId: "",
  setViewerUserId: () => {},
  username: "",  // Initialize username to empty string
  setUsername: () => {},
});

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [userId, setUserId] = useState<string>("");
  const [viewerUserId, setViewerUserId] = useState<string>("");
  const [username, setUsername] = useState<string>(""); // State for username

  useEffect(() => {
    const token = Cookies.get('token');
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string, username: string };
        setUserId(decoded.userId);
        setViewerUserId(decoded.userId); 
        setUsername(decoded.username); // Set username from JWT
      } catch (error) {
        console.error('Error verifying JWT:', error);
        // Handle token verification errors (e.g., logout user)
      }
    }
  }, [setUserId, setViewerUserId, setUsername]); // Include dependencies

  return (
    <UserContext.Provider
      value={{ userId, setUserId, viewerUserId, setViewerUserId, username, setUsername }}
    >
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