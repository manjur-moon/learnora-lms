import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router";
import App from "./App";
import "./index.css";
import "./styles/hero.css";
import "./styles/about.css";
import "./styles/featured-courses.css";
import "./styles/course-explorer.css";
import "./styles/catalog.css";
import "./styles/course-details.css";
import "./styles/admin.css";
import "./styles/learning-gallery.css";
import "./styles/site-footer.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
