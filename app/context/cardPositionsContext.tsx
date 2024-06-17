import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CardPosition } from '../components/PostCard/postcard';

interface CardPositionsProviderProps {
  children: ReactNode;
}

interface CardPositionsContextValue {
  cardPositions: Record<string, CardPosition>;
  setCardPosition: (cardId: string, position: CardPosition) => void;
  resetPositions: () => void; // Add the resetPositions function
}

const CardPositionsContext = createContext<CardPositionsContextValue>({
  cardPositions: {},
  setCardPosition: () => {},
  resetPositions: () => {}  // Add a default implementation for resetPositions
});

export function CardPositionsProvider({ children }: CardPositionsProviderProps) {
  const [cardPositions, setCardPositions] = useState<Record<string, CardPosition>>({});

  useEffect(() => {
    const storedPositionsString = localStorage.getItem('cardPositions');
    if (storedPositionsString) {
      try {
        const storedPositions: Record<string, CardPosition> = JSON.parse(storedPositionsString);
        setCardPositions(storedPositions);
      } catch (error) {
        console.error('Error parsing card positions from localStorage:', error);
      }
    }
  }, []);

  const handleSetCardPosition = (cardId: string, position: CardPosition) => {
    setCardPositions((prevPositions) => {
      const newPositions = { ...prevPositions, [cardId]: position };
      localStorage.setItem('cardPositions', JSON.stringify(newPositions));
      return newPositions;
    });
  };

  const handleResetPositions = () => { // This is the function we need to pass
    setCardPositions({});
    localStorage.removeItem('cardPositions');
  };

  return (
    <CardPositionsContext.Provider value={{ cardPositions, setCardPosition: handleSetCardPosition, resetPositions: handleResetPositions }}> {/* Pass handleResetPositions here */}
      {children}
    </CardPositionsContext.Provider>
  );
}

export const useCardPositions = () => useContext(CardPositionsContext);