import { Route, Routes } from "react-router-dom";
import DevSheet from "./pages/DevSheet";

export default function App() {
  return (
    <Routes>
      <Route path="/dev" element={<DevSheet />} />
    </Routes>
  );
}
