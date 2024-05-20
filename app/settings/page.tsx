"use client";
import { useState, useEffect } from "react";
import { useUserContext } from "@/app/context/userContext"; // Adjust the path if necessary

export default function SettingsPage() {
  const { userId } = useUserContext();
  const [settings, setSettings] = useState<{ theme: string }>({ theme: "light" }); // Default settings
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch(`/api/settings?userId=${userId}`); // Fetch settings from API
        if (response.ok) {
          const data = await response.json();
          setSettings(data.settings || { theme: "light" }); // Update state
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

  return (
    <div>
      <h2>User Settings</h2>
      {isLoading ? (
        <p>Loading settings...</p>
      ) : (
        <form onSubmit={handleSaveSettings}>
          <div>
            <label htmlFor="theme">Theme:</label>
            <select id="theme" value={settings.theme} onChange={(e) => setSettings({ ...settings, theme: e.target.value })}>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
          {/* Add more settings fields as needed */}
          <button type="submit">Save Settings</button>
        </form>
      )}
    </div>
  );
}