import React from "react";
import Routes from "./Routes";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ToastProvider } from "./components/ui/Toast";
import OfflineStatus from "./components/ui/OfflineStatus";

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <Routes />
        <OfflineStatus />
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
