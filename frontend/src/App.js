import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "../src/components/store";
import Navbar from "./components/Navbar";
import HomePage from "./components/HomePage";
import LoginPage from "./components/LoginPage";
import SignupPage from "./components/SignupPage";
import ProfilePictureUpload from "./components/ProfilePicture";
import ProfilePage from "./components/ProfilePage";
import Achievements from "./components/Achievements";
import Leaderboard from "./components/Leaderboard";
import Badges from "./components/Badges";
import Notifications from "./components/Notifications";
import AccountPage from "./components/AccountPage";
import Donations from "./components/Donations";
import Campaigns from "./components/Campaigns";
import AboutUs from "./components/AboutUs";
import Footer from "./components/Footer";
import ChatBox from "./components/ChatBox";
import TokenHandler from "./components/TokenHandler";
import BlogsPage from "./components/BlogsPage";
import BlogDetails from "./components/BlogDetails";
import CookieBanner from "./components/CookieBanner"; 
import "./App.css";
import ResetPassword from "./components/ResetPassword";

function App() {
  return (
    <Provider store={store}>
      {" "}
      {/* Provide the Redux store */}
      <Router>
        <div className="App">
          <TokenHandler /> {/* Include TokenHandler */}
          <div className="nav">
            <Navbar />
          </div>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route
              path="/upload-profile-picture"
              element={<ProfilePictureUpload />}
            />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/achievements" element={<Achievements />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/badges" element={<Badges />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="/donations" element={<Donations />} />
            <Route path="/campaigns" element={<Campaigns />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/blogs" element={<BlogsPage />} /> 
            <Route path="/reset-password" element={<ResetPassword />} /> 
            <Route path="/blog/:id" element={<BlogDetails />} />{" "}
          </Routes>
          <Footer />
          <ChatBox />
          <CookieBanner /> {/* Add CookieBanner here */}
        </div>
      </Router>
    </Provider>
  );
}

export default App;
