const API_BASE_URL = window.location.hostname === "localhost" 
    ? "http://localhost:1500" 
    : "https://fs-quiz-app.onrender.com";

export default API_BASE_URL;