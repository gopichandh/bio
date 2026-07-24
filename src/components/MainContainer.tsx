import { PropsWithChildren, useEffect, useState } from "react";
import About from "./About";
import Career from "./Career";
import Contact from "./Contact";
import Cursor from "./Cursor";
import Landing from "./Landing";
import Navbar from "./Navbar";
import SocialIcons from "./SocialIcons";
import WhatIDo from "./WhatIDo";
import setSplitText from "./utils/splitText";

import TechStack from "./TechStack";
import Resume from "./Resume";
import Credentials from "./Credentials";
import DataCenterBG from "./DataCenterBG";

// Batch 4 — interactive SRE features
import Achievements from "./Achievements";
import CableTrail from "./CableTrail";
import KonamiEasterEgg from "./KonamiEasterEgg";
import ChessEasterEgg from "./ChessEasterEgg";

// Batch 5 — futuristic interactive layer
import RoamingBot from "./RoamingBot";
import Football from "./Football";
import LiveStatus from "./LiveStatus";

const MainContainer = ({ children }: PropsWithChildren) => {
  const [isDesktopView, setIsDesktopView] = useState<boolean>(
    window.innerWidth > 1024
  );

  useEffect(() => {
    const resizeHandler = () => {
      setSplitText();
      setIsDesktopView(window.innerWidth > 1024);
    };
    resizeHandler();
    window.addEventListener("resize", resizeHandler);
    return () => {
      window.removeEventListener("resize", resizeHandler);
    };
  }, [isDesktopView]);

  return (
    <div className="container-main">
      <DataCenterBG />
      <Cursor />
      <CableTrail />
      <Resume />
      <Navbar />
      <SocialIcons />
      <LiveStatus />

      {/* Global overlays / listeners */}
      <Achievements />
      <KonamiEasterEgg />
      <ChessEasterEgg />

      {/* Futuristic interactive layer — roams the whole page */}
      <Football />
      <RoamingBot />

      {isDesktopView && children}
      <div id="smooth-wrapper">
        <div id="smooth-content">
          <div className="container-main">
            <Landing>{!isDesktopView && children}</Landing>
            <About />
            <TechStack />
            <Career />
            <WhatIDo />
            <Credentials />
            <Contact />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainContainer;
