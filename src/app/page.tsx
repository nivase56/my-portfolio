import GLBModelViewer from "./component/hero";
import FBXViewer from "./component/heroComponent";

export default function Home() {
  
  return (
    <div className="h-100vh w-full flex items-center justify-center bg-white">
      {/* <FBXViewer /> */}

      <GLBModelViewer />
    </div>
  );
}
