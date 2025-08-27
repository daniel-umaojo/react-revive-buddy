"use client";
import React, { useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import { Search, List, AlertCircle, Calendar } from "lucide-react";
// import SidebarWidget from "./SidebarWidget";


const navItems = [
  {
    icon: <Search className="h-5 w-5" />,
    name: "Input and Volume",
    path: "?tab=input-and-volume",
  },
  {
    icon: <List className="h-5 w-5" />,
    name: "Prediction Tool",
    path: "?tab=prediction-tools",
  },
  {
    icon: <AlertCircle className="h-5 w-5" />,
    name: "Volume Chart",
    path: "?tab=volume-chart",
  },
  {
    icon: <Calendar className="h-5 w-5" />,
    name: "Settngs",
    path: "?tab=settings",
  },
];

const AppSidebar= () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab");

  const isActive = useCallback(
    (path) => {
      const tabParam = path.split("=")[1];
      return (
        currentTab === tabParam ||
        (!currentTab && path.includes("quick-screen"))
      ); // Default to quick-screen
    },
    [currentTab]
  );

  const renderMenuItems = (navItems) => (
    <ul className="flex flex-col gap-4">
      {navItems.map((nav) => (
        <li key={nav.name}>
          {nav.path && (
            <Link
              href={nav.path}
              className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                isActive(nav.path)
                  ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                  : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
              } ${
                !isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
              }`}
            >
              <span
                className={`flex-shrink-0 ${
                  isActive(nav.path)
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="text-sm font-medium">{nav.name}</span>
              )}
            </Link>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Logo Section - Restored */}
      <div className="py-8 flex justify-start">
        <Link href="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <Image
                className="dark:hidden"
                src="/images/logo.png"
                alt="Logo"
                width={150}
                height={40}
                priority
              />
              <Image
                className="hidden dark:block"
                src="/images/logo-white.png" // Make sure you have a dark version
                alt="Logo"
                width={150}
                height={40}
                priority
              />
            </>
          ) : (
            <Image
              src="/images/logo2.png" // Use a square icon version for collapsed state
              alt="Logo"
              width={32}
              height={32}
              priority
            />
          )}
        </Link>
      </div>

      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? "Screening" : "•••"}
              </h2>
              {renderMenuItems(navItems)}
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
