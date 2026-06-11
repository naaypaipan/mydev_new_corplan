import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function AuthFooter() {
  return (
    <>
      <footer className=" relative lg:absolute w-full bottom-0 ">
        <div className="container mx-auto px-4 bg-transparent">
          <hr className="mb-6 border-b-1 border-gray-700" />
          <div className="flex flex-wrap items-center md:justify-between justify-center">
            <div className="w-full md:w-4/12 px-4">
              <div className="text-sm text-gray-600 font-normal py-1 text-center md:text-left">
                Copyright © {new Date().getFullYear()} , Coreplan.erp
                <br />
                Powered By Coreplan.erp team ver.{' '}
                {process.env.REACT_APP_VERSION_RELEASE}
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
