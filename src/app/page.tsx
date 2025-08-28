"use client";
import { useState } from "react";
import GLBModelViewer from "./component/hero";
import Navbar from "./component/popup/navbar";
export default function Home() {
    const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="h-screen w-full flex items-center justify-center bg-white">
      {isLoaded && <Navbar />}
      <GLBModelViewer isLoaded={isLoaded} setIsLoaded={setIsLoaded} />
    </div>
  );
}
