import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import { useEffect } from "react";
import api from "./api/axios";

function App() {

  useEffect(() => {
    api.get("/test")
      .then(res => console.log(res.data))
      .catch(err => console.log(err));
  }, []);

  return <div>Frontend Working</div>;
}

export default App;