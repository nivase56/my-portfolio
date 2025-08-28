import GLBModelViewer from "./component/hero";
import Navbar from "./component/popup/navbar";
export default function Home() {
  return (
    <div className="h-screen w-full flex items-center justify-center bg-white">
      <Navbar />
      <GLBModelViewer />
    </div>
  );
}
