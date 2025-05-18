import Layout from "./Layout.jsx";

import Onboarding from "./Onboarding";

import Dashboard from "./Dashboard";

import Sources from "./Sources";

import Transactions from "./Transactions";

import Home from "./Home";

import ComingSoon from "./ComingSoon";

import CategoryTransactions from "./CategoryTransactions";

import home from "./home";

import Goals from "./Goals";

import AddSource from "./AddSource";

import Register from "./Register";

import Documentation from "./Documentation";

import ExportGuide from "./ExportGuide";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Onboarding: Onboarding,
    
    Dashboard: Dashboard,
    
    Sources: Sources,
    
    Transactions: Transactions,
    
    Home: Home,
    
    ComingSoon: ComingSoon,
    
    CategoryTransactions: CategoryTransactions,
    
    home: home,
    
    Goals: Goals,
    
    AddSource: AddSource,
    
    Register: Register,
    
    Documentation: Documentation,
    
    ExportGuide: ExportGuide,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Onboarding />} />
                
                
                <Route path="/Onboarding" element={<Onboarding />} />
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/Sources" element={<Sources />} />
                
                <Route path="/Transactions" element={<Transactions />} />
                
                <Route path="/Home" element={<Home />} />
                
                <Route path="/ComingSoon" element={<ComingSoon />} />
                
                <Route path="/CategoryTransactions" element={<CategoryTransactions />} />
                
                <Route path="/home" element={<home />} />
                
                <Route path="/Goals" element={<Goals />} />
                
                <Route path="/AddSource" element={<AddSource />} />
                
                <Route path="/Register" element={<Register />} />
                
                <Route path="/Documentation" element={<Documentation />} />
                
                <Route path="/ExportGuide" element={<ExportGuide />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}