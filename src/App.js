import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
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
import "./App.css";

function App() {
  return (
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
          <Route path="/blogs" component={BlogsPage} />
          <Route path="/blog/:id" component={BlogDetails} />
        </Routes>
        <Footer />
        <ChatBox /> {/* Include ChatBox */}
      </div>
    </Router>
  );
}

export default App;
