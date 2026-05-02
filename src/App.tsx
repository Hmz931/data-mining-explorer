import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ScrollToTop } from "@/components/ScrollToTop";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import DataMining from "./pages/DataMining.tsx";
import About from "./pages/About.tsx";
import ACP from "./pages/methods/ACP.tsx";
import AFC from "./pages/methods/AFC.tsx";
import ACM from "./pages/methods/ACM.tsx";
import CAH from "./pages/methods/CAH.tsx";
import KMeans from "./pages/methods/KMeans.tsx";
import NoSQL from "./pages/NoSQL.tsx";
import NoSQLIntro from "./pages/nosql/Intro.tsx";
import NoSQLMongo from "./pages/nosql/MongoDB.tsx";
import NoSQLCrud from "./pages/nosql/CRUD.tsx";
import NoSQLAgg from "./pages/nosql/Aggregation.tsx";
import NoSQLTd from "./pages/nosql/TPModelisation.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <HashRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/data-mining" element={<DataMining />} />
            <Route path="/data-mining/acp" element={<ACP />} />
            <Route path="/data-mining/afc" element={<AFC />} />
            <Route path="/data-mining/acm" element={<ACM />} />
            <Route path="/data-mining/afcm" element={<ACM />} />
            <Route path="/data-mining/cah" element={<CAH />} />
            <Route path="/data-mining/kmeans" element={<KMeans />} />
            <Route path="/nosql" element={<NoSQL />} />
            <Route path="/nosql/intro" element={<NoSQLIntro />} />
            <Route path="/nosql/mongodb" element={<NoSQLMongo />} />
            <Route path="/nosql/crud" element={<NoSQLCrud />} />
            <Route path="/nosql/aggregation" element={<NoSQLAgg />} />
            <Route path="/nosql/td-modelisation" element={<NoSQLTd />} />
            <Route path="/about" element={<About />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </HashRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
