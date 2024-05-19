import React, { useState, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import Draggable from 'react-draggable';
import { useUserContext } from '@/app/context/userContext';


interface FinancialCardProps {
  data: { date: number; close: number }[];
  symbol: string;
  onAddTicker: (newTickerSymbol: string, userId: string) => Promise<void>;
}

const FinancialCard: React.FC<FinancialCardProps> = ({
  data,
  symbol,
  onAddTicker,
}) => {
  const nodeRef = useRef(null);
  const { userId } = useUserContext(); // Call useUserContext here

  const handleAddTicker = async () => {
    try {
      await onAddTicker(symbol, userId); // Pass both symbol and userId
    } catch (error) {
      console.error("Error adding ticker:", error);
      // Handle errors appropriately (e.g., display an error message to the user)
    }
  };

  return (
    <Draggable nodeRef={nodeRef}>
      <div ref={nodeRef} className="neumorphic fin-card p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">{symbol} - 1 Year Chart</h2>
        <ResponsiveContainer width={450} height={250}>
          <LineChart width={450} height={250} data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="close" stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
        <button
          onClick={handleAddTicker}
          className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add Ticker
        </button>
      </div>
    </Draggable>
  );
};

export default FinancialCard;