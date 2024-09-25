import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar'; 
import Sidebar from './components/Sidebar'; 
import Dashboard from './components/Dashboard'; 
import Donations from './components/Donations';
import CreateBlog from './components/CreateBlog';
import AllBlogs from './components/AllBlogs';
// import EditBlog from './components/EditBlog';
// import DonationCharts from './components/DonationCharts';
// import TransactionTable from './components/TransactionTable';
import './App.css';

const App = () => {
    return (
        <Router>
            <Navbar />
            <Sidebar />
            <div className="content">
                <Routes>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/donations" element={<Donations />} />
                    <Route path="/create-blog" element={<CreateBlog />} />
                    <Route path="/all-blogs" element={<AllBlogs />} />
                    {/* <Route path="/edit-blog" element={<EditBlog />} /> */}
                    {/* <Route path="/donation-charts" element={<DonationCharts />} /> */}
                    {/* <Route path="/transactions" element={<TransactionTable />} /> */}
                </Routes>
            </div>
        </Router>
    );
};

export default App;
