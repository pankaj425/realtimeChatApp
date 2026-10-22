import React from "react";
import SideBar from "../components/SideBar";
import MessageArea from "../components/MessageArea";
import useMessages from "../hooks/useMessages";

function Home() {
  useMessages();

  return (
    <div className="flex h-[100dvh] w-full overflow-hidden bg-slate-200">
      <SideBar />
      <MessageArea />
    </div>
  );
}

export default Home;
