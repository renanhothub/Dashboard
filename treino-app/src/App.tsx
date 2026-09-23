import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { BottomNav } from "./components/ui";
import { SvgDefs } from "./illustration/Figure";
import DevSheet from "./pages/DevSheet";
import ExercisePage from "./pages/ExercisePage";
import Favorites from "./pages/Favorites";
import Home from "./pages/Home";
import MusclePage from "./pages/MusclePage";

export default function App() {
  const { pathname } = useLocation();
  useEffect(() => window.scrollTo(0, 0), [pathname]);
  if (pathname === "/dev")
    return (
      <>
        <SvgDefs />
        <DevSheet />
      </>
    );
  return (
    <div className="mx-auto min-h-screen max-w-md pb-24">
      <SvgDefs />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/musculo/:id" element={<MusclePage />} />
        <Route path="/exercicio/:id" element={<ExercisePage />} />
        <Route path="/favoritos" element={<Favorites />} />
        <Route path="*" element={<Home />} />
      </Routes>
      <BottomNav />
    </div>
  );
}
