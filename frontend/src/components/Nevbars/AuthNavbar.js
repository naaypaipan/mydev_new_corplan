import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function Navbar() {
  return (
    <nav className="top-0  absolute z-50 w-full flex flex-wrap items-center justify-between  navbar-expand-lg">
      <div className="container px-4 py-2 mx-auto flex flex-wrap items-center justify-between ">
        <div className="w-full relative flex justify-between lg:w-auto lg:static lg:block lg:justify-start">
          <Link
            className="text-gray-600 text-sm font-bold leading-relaxed inline-block mr-4 py-2 whitespace-no-wrap uppercase"
            to="/"
          >
            CORE PLANE ERP
          </Link>
        </div>
      </div>
    </nav>
  );
}
