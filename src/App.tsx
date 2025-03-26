import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { HvProvider } from "@hitachivantara/uikit-react-core";
import { Container } from "./components/common/Container";
import { Header } from "./components/common/Header";
import { NavigationProvider } from "./context/NavigationContext";
import navigation from "./lib/navigation";
import Dashboard from './pages/Dashboard/Dashboard'
import "./lib/i18n";
import "virtual:uno.css";
import "./style/style.css";
import Timeline from "./components/common/Timeline/Timeline"

const App = () => (
  <Router>
    <HvProvider rootElementId="hv-root" theme="ds5" colorMode="wicked">
      <NavigationProvider navigation={navigation}>
        <Header />
        <Container maxWidth="xl">
          <div className="dashboard-container">
            <div className="canvas">Canvas</div>
            <div className="timeline"><Timeline/></div>
            <div className="info-container">
                <div className="info-section info-a">Info section A</div>
                <div className="info-section info-b">Info section B</div>
            </div>
          </div>
        </Container>
      </NavigationProvider>
    </HvProvider>
  </Router>
);
export default App;