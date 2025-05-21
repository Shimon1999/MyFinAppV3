import Layout from "./Layout.jsx";
import Onboarding from "./Onboarding";
import Dashboard from "./Dashboard";
import Sources from "./Sources";
import Transactions from "./Transactions";
import ComingSoon from "./ComingSoon";
import CategoryTransactions from "./CategoryTransactions";
import Home from "./home";
import Goals from "./Goals";
import AddSource from "./AddSource";
import Register from "./Register";
import Documentation from "./Documentation";

import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";

const PAGES = {
  Onboarding,
  Dashboard,
  Sources,
  Transactions,
  Home,
  ComingSoon,
  CategoryTransactions,
  Goals,
  AddSource,
  Register,
  Documentation,
};

function _getCurrentPage(url) {
  if (url.endsWith("/")) {
    url = url.slice(0, -1);
  }
  let urlLastPart = url.split("/").pop();
  if (urlLastPart.includes("?")) {
    urlLastPart = urlLastPart.split("?")[0];
  }
  const pageName = Object.keys(PAGES).find(
    (page) => page.toLowerCase() === urlLastPart.toLowerCase()
  );
  return pageName || Object.keys(PAGES)[0];
}

function PagesContent() {
  const location = useLocation();
  const currentPage = _getCurrentPage(location.pathname);

  return (
    <Layout currentPageName={currentPage}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Onboarding" element={<Onboarding />} />
        <Route path="/Dashboard" element={<Dashboard />} />
        <Route path="/Sources" element={<Sources />} />
        <Route path="/Transactions" element={<Transactions />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/ComingSoon" element={<ComingSoon />} />
        <Route path="/CategoryTransactions" element={<CategoryTransactions />} />
        <Route path="/home" element={<Home />} />
        <Route path="/Goals" element={<Goals />} />
        <Route path="/AddSource" element={<AddSource />} />
        <Route path="/Register" element={<Register />} />
        <Route path="/Documentation" element={<Documentation />} />
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