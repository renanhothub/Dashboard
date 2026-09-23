import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { BottomNav } from "./components/ui";
import { SvgDefs } from "./illustration/Figure";
import DevSheet from "./pages/DevSheet";
import ExercisePage from "./pages/ExercisePage";
import Favorites from "./pages/Favorites";
import Home from "./pages/Home";
import MusclePage from "./pages/MusclePage";
import History from "./pages/History";
import SessionPage from "./pages/SessionPage";
import WorkoutEdit from "./pages/WorkoutEdit";
import Workouts from "./pages/Workouts";
import AccountPage from "./pages/AccountPage";
import Friends from "./pages/Friends";
import GroupPage from "./pages/GroupPage";
import InvitePage from "./pages/InvitePage";
import "./account";

export default function App() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  if (pathname === "/dev")
    return (
      <>
        <SvgDefs />
        <DevSheet />
      </>
    );
  return (
    <div className="mx-auto min-h-screen max-w-md pb-36">
      <SvgDefs />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/musculo/:id" element={<MusclePage />} />
        <Route path="/exercicio/:id" element={<ExercisePage />} />
        <Route path="/favoritos" element={<Favorites />} />
        <Route path="/treinos" element={<Workouts />} />
        <Route path="/treinos/:id" element={<WorkoutEdit />} />
        <Route path="/sessao" element={<SessionPage />} />
        <Route path="/historico" element={<History />} />
        <Route path="/conta" element={<AccountPage />} />
        <Route path="/amigos" element={<Friends />} />
        <Route path="/amigos/:id" element={<GroupPage />} />
        <Route path="/convite/:code" element={<InvitePage />} />
        <Route path="*" element={<Home />} />
      </Routes>
      <BottomNav />
    </div>
  );
}
