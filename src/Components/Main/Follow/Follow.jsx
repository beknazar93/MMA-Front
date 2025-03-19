import React from "react";
import { FaInstagram, FaTiktok } from "react-icons/fa";
import "./Follow.scss";

function Follow() {
  return (
    <section className="follow">
      <div className="container">
        <h1 className="follow__title">Follow MMA_Academy.Mashrapov</h1>
        <div className="follow__net">
          <a
            href="https://www.instagram.com/mma_academy.mashrapov/"
            target="_blank"
            rel="noopener noreferrer"
            className="follow__net-link"
          >
            <FaInstagram className="follow__net-icon" />
          </a>
          <a
            href="https://www.tiktok.com/@mm.academy.mashrapov?_t=8nuXWRTUqgB&_r=1"
            target="_blank"
            rel="noopener noreferrer"
            className="follow__net-link"
          >
            <FaTiktok className="follow__net-icon" />
          </a>
        </div>
      </div>
    </section>
  );
}

export default Follow;