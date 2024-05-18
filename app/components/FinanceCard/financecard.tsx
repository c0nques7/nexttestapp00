import React, { useState, useRef } from 'react'; // Import useRef
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import Draggable from 'react-draggable';

interface FinancialCardProps {
  data: { date: number; close: number }[];
  symbol: string;
}

const FinancialCard: React.FC<FinancialCardProps> = ({ data, symbol }) => {
    const nodeRef = useRef(null);
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
      </div>
    </Draggable>
  );
};

export default FinancialCard;