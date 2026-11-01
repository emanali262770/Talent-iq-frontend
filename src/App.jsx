import { ToastContainer } from "react-toastify";
import Router from "./app.routes";
import { AuthProvider } from "./Features/auth/auth.context";
import { InterviewProvider } from "./Features/interview-ai/interview.context";

const App = () => {
  return (
    <AuthProvider>
      <InterviewProvider>
        <Router />
      </InterviewProvider>
      <ToastContainer
        position="top-right"
        autoClose={3500}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="dark"
      />
    </AuthProvider>
  );
};

export default App;
