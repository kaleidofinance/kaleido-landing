"use client";

import { navLinks } from "@/constants";
import { useState, useEffect } from "react";
import { useWeb3 } from "@/providers/Web3Provider";
import EditXUsernameModal from "./common/EditXUsernameModal";
import { useXUsernameEdit } from "@/hooks/useXUsernameEdit";
import type { RegistrationData } from '@/types/registration';
import Link from "next/link";

const Navbar = () => {
  const [active, setActive] = useState("Open dApp");
  const [toggle, setToggle] = useState(false);
  const { account } = useWeb3();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState<RegistrationData | null>(null);
  const { 
    isModalOpen, 
    currentUsername, 
    openModal, 
    closeModal, 
    updateUsername 
  } = useXUsernameEdit(userData?.xUsername);

  // Check if user is logged in and fetch user data
  useEffect(() => {
    const checkUserStatus = async () => {
      if (account) {
        try {
          const response = await fetch(`/api/testnet/user?walletAddress=${account}`);
          if (response.ok) {
            const data = await response.json();
            if (data.registration) {
              setIsLoggedIn(true);
              setUserData(data.registration);
              // Log the username for debugging
              console.log('User X username:', data.registration.xUsername);
            } else {
              setIsLoggedIn(false);
              setUserData(null);
            }
          } else {
            setIsLoggedIn(false);
            setUserData(null);
          }
        } catch (error) {
          console.error('Error checking user status:', error);
          setIsLoggedIn(false);
          setUserData(null);
        }
      } else {
        setIsLoggedIn(false);
        setUserData(null);
      }
    };

    checkUserStatus();
  }, [account]);

  // Listen for the custom edit-x-username event
  useEffect(() => {
    const handleEditXUsername = () => {
      openModal();
    };

    window.addEventListener('edit-x-username', handleEditXUsername);

    return () => {
      window.removeEventListener('edit-x-username', handleEditXUsername);
    };
  }, [openModal]);

  return (
    <nav className="w-full flex py-6 justify-between items-center">
      {/* Logo Section */}
      <div className="flex items-center gap-2">
        <Link href="/">
          <img src="/white-word.png" alt="Brand Name" className="w-30 h-10 cursor-pointer" />
        </Link>
      </div>

      {/* Desktop Navigation */}
      <ul className="hidden sm:flex items-center gap-10">
        {navLinks.filter(nav => nav.title.toLowerCase() !== 'content' && nav.id.toLowerCase() !== '/content').map((nav, index) => (
          <li key={nav.id} className="relative">
            <a
              href={nav.id}
              target={nav.id.startsWith('http') ? "_blank" : "_self"}
              rel={nav.id.startsWith('http') ? "noopener noreferrer" : ""}
              className={`font-medium text-[16px] transition-all duration-300 ${
                nav.title === "Testnet"
                  ? "border-2 border-[#00dd72] text-[#00dd72] hover:bg-[#00dd72] hover:text-white px-5 py-2 rounded-lg"
                  : active === nav.title
                  ? "text-[#00dd72]"
                  : "text-white hover:text-[#00dd72]"
              }`}
              onClick={() => setActive(nav.title)}
            >
              {nav.title}
              {/* Add LIVE tag for Open dApp */}
              {nav.title === "Open dApp" && (
                <span className="absolute -top-3 -right-10 bg-[#00dd72] text-black text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                  LIVE
                </span>
              )}
              {nav.isNew && (
                <span className="absolute -top-3 -right-6 bg-[#00dd72] text-black text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                  NEW
                </span>
              )}
            </a>
          </li>
        ))}
        
        {/* Link X Account Button - Show if logged in but X not linked */}
        {isLoggedIn && !userData?.xId && (
          <li className="relative">
            <button
              onClick={() => {
                if (account) {
                  window.location.href = `/api/testnet/x-auth?wallet=${account}`;
                } else {
                  alert('Please connect your wallet first.');
                }
              }}
              className="font-medium text-[16px] text-white flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 group hover:bg-[#00dd72] hover:text-white focus:outline-none"
              style={{ position: 'relative' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 1200 1227" fill="none">
                <g>
                  <path fill="currentColor" d="M1199.14 0H944.93L600.01 455.36L255.07 0H0l462.36 613.19L0 1227h254.21l345.8-466.13L945.79 1227H1201L736.98 601.5 1199.14 0ZM300.6 112.36l299.41 397.13 299.41-397.13h151.13L750.13 601.5l300.42 401.14h-151.13L600.01 805.86 299.41 1002.64H148.28l300.42-401.14L148.28 112.36H300.6Z"/>
                </g>
              </svg>
              Link X Account
              <span className="ml-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse group-hover:bg-white group-hover:text-red-500 transition-colors">HOT</span>
            </button>
          </li>
        )}
      </ul>

      {/* Mobile Navigation */}
      <div className="sm:hidden flex items-center">
        <img
          src={toggle ? "/close.svg" : "/menu.svg"}
          alt={toggle ? "Close Menu" : "Open Menu"}
          className="w-7 h-7 object-contain cursor-pointer"
          onClick={() => setToggle(!toggle)}
        />

        {toggle && (
          <div className="p-6 bg-black-gradient absolute top-20 z-50 right-0 mx-4 my-2 min-w-[140px] rounded-xl sidebar">
            <ul className="flex flex-col items-start gap-4">
              {navLinks.filter(nav => nav.title.toLowerCase() !== 'content' && nav.id.toLowerCase() !== '/content').map((nav) => (
                <li key={nav.id} className="w-full relative">
                  <a
                    href={nav.id}
                    target={nav.id.startsWith('http') ? "_blank" : "_self"}
                    rel={nav.id.startsWith('http') ? "noopener noreferrer" : ""}
                    className={`font-medium text-[16px] block transition-all duration-300 ${
                      nav.title === "Testnet"
                        ? "border-2 border-[#00dd72] text-[#00dd72] hover:bg-[#00dd72] hover:text-white px-5 py-2 rounded-lg text-center"
                        : active === nav.title
                        ? "text-[#00dd72]"
                        : "text-white hover:text-[#00dd72]"
                    }`}
                    onClick={() => {
                      setActive(nav.title);
                      setToggle(false);
                    }}
                  >
                    {nav.title}
                    {/* Add LIVE tag for Open dApp */}
                    {nav.title === "Open dApp" && (
                      <span className="absolute -top-3 -right-10 bg-[#00dd72] text-black text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                        LIVE
                      </span>
                    )}
                    {nav.isNew && (
                      <span className="absolute -top-3 -right-6 bg-[#00dd72] text-black text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                        NEW
                      </span>
                    )}
                  </a>
                </li>
              ))}
              
              {/* Link X Account Button for Mobile - Show if logged in but X not linked */}
              {isLoggedIn && !userData?.xId && (
                <li className="w-full">
                  <button
                    onClick={() => {
                      setToggle(false);
                      if (account) {
                        window.location.href = `/api/testnet/x-auth?wallet=${account}`;
                      } else {
                        alert('Please connect your wallet first.');
                      }
                    }}
                    className="font-medium text-[16px] text-white flex items-center gap-2 w-full px-4 py-2 rounded-lg transition-all duration-300 group hover:bg-[#00dd72] hover:text-white focus:outline-none"
                    style={{ position: 'relative' }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 1200 1227" fill="none">
                      <g>
                        <path fill="currentColor" d="M1199.14 0H944.93L600.01 455.36L255.07 0H0l462.36 613.19L0 1227h254.21l345.8-466.13L945.79 1227H1201L736.98 601.5 1199.14 0ZM300.6 112.36l299.41 397.13 299.41-397.13h151.13L750.13 601.5l300.42 401.14h-151.13L600.01 805.86 299.41 1002.64H148.28l300.42-401.14L148.28 112.36H300.6Z"/>
                      </g>
                    </svg>
                    Link X Account
                    <span className="ml-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse group-hover:bg-white group-hover:text-red-500 transition-colors">HOT</span>
                  </button>
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
