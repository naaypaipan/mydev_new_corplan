import React, { useEffect, useState } from 'react';
import axios from 'axios';

export function MainFooter() {
  return (
    <footer className="container mx-auto items-center bottom-0 z-10">
      <hr className="mb-4 border-b-1 border-gray-300" />
      <div className="flex flex-wrap items-center md:justify-between justify-center">
        <div className="w-full md:w-4/12 px-4">
          <div className="text-sm text-gray-600 font-normal py-1 text-center md:text-left">
            Copyright © {new Date().getFullYear()} , Coreplan.erp
            <br />
            Powered By codePro team ver. {process.env.REACT_APP_VERSION_RELEASE}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default MainFooter;
