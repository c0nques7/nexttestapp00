"use client";
import { useState, useEffect } from "react";
import { useUserContext } from "@/app/context/userContext";
import { useRouter } from "next/navigation";
import ToggleSwitch from "../components/ToggleSwitch/toggleswitch";
 

export default function SettingsPage() {
  const { userId } = useUserContext();
  const [settings, setSettings] = useState<{
    theme: string;
    isStockSearchEnabled: boolean;
    isRedditSearchEnabled: boolean;
    isNSFWFilterEnabled: boolean;
  }>({ theme: "light", isStockSearchEnabled: true, isRedditSearchEnabled: false, isNSFWFilterEnabled: false }); 
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch(`/api/settings?userId=${userId}`);
        if (response.ok) {
          const data = await response.json();
          setSettings(
            data.settings || { theme: "light", isStockSearchEnabled: true }
          );
        } else {
          // Handle error (e.g., show error message)
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, [userId]);

  const handleSaveSettings = async () => {
    try {
      const response = await fetch(`/api/settings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, settings }), // Send updated settings to API
      });

      if (response.ok) {
        // Success (e.g., show success message)
        
       
      } else {
        // Handle error
      }
    } catch (error) {
      console.error("Error saving settings:", error);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div>
      <div className={`neumorphic-sidebar ${isSidebarOpen ? 'expanded' : ''}`}>
        <button className="menu-button" onClick={toggleSidebar}>
          ☰
        </button>
        <div className="sidebar-content">
          <a href="/myhome" className="sidebar-link">
            Home
          </a>
          <a href="#" className="sidebar-link">
            Profile
          </a>
          <a href="/settings" className="sidebar-link">
            Settings
          </a>
        </div>
      </div>
      <h2>User Settings</h2>
      {isLoading ? (
        <p>Loading settings...</p>
      ) : (
        <form onSubmit={handleSaveSettings}>
          <div>
            <label htmlFor="theme">Theme:</label>
            <select
              id="theme"
              value={settings.theme}
              onChange={(e) =>
                setSettings({ ...settings, theme: e.target.value })
              }
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
          <ToggleSwitch
            label="Enable Stock Search"
            settingKey="isStockSearchEnabled"
            initialValue={settings.isStockSearchEnabled}
            onSaveSettings={(key, newValue) => {
              setSettings({
                ...settings,
                [key]: newValue, // Update the specific setting dynamically
              });
              handleSaveSettings(); // Save settings to the API immediately 
            }}
          />
          <ToggleSwitch
            label="Enable Reddit Search"
            settingKey="isRedditSearchEnabled"
            initialValue={settings.isRedditSearchEnabled}
            onSaveSettings={(key, newValue) => {
              setSettings({ ...settings, [key]: newValue });
              handleSaveSettings(); 
            }}
          />
          <ToggleSwitch
            label="Enable NSFW Filter"
            settingKey="isNSFWFilterEnabled"
            initialValue={settings.isNSFWFilterEnabled}
            onSaveSettings={(key, newValue) => {
              setSettings({ ...settings, [key]: newValue });
              handleSaveSettings(); 
            }}
          />

          <button type="submit">Save Settings</button>
        </form>
      )}
    </div>
  );
}