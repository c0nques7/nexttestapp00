import React, { useState, useEffect } from 'react';
import "@/app/styles/global.css"

const ToggleSwitch: React.FC<{
  label: string;
  settingKey: string;
  initialValue: boolean;
  onSaveSettings: (key: string, value: boolean) => void;
}> = ({ label, settingKey, initialValue, onSaveSettings }) => {
  const [isEnabled, setIsEnabled] = useState(initialValue);

  useEffect(() => {
    setIsEnabled(initialValue);
  }, [initialValue]);

  const handleChange = () => {
    const newState = !isEnabled;
    setIsEnabled(newState);
    onSaveSettings(settingKey, newState);
  };

  return (
    <div className="wrap__toggle"> {/* Container for the entire toggle */}
      <div className="wrap__toggle--setting"> {/* Label section */}
        <span>{label}</span>
      </div>
      <div className="wrap__toggle--toggler"> {/* Toggle switch itself */}
        <label htmlFor={settingKey}> {/* Label linked to the checkbox */}
          <input
            type="checkbox"
            className="checkBox neumorphic-toggle" 
            id={settingKey}
            checked={isEnabled}
            onChange={handleChange}
          />
          <span className="slider round neumorphic-slider"></span> {/* Custom slider appearance */}
        </label>
      </div>
    </div>
  );
};

export default ToggleSwitch;