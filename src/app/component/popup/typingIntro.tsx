import React from "react";
import { Code, MapPin, Briefcase, Linkedin, Github, Mail } from "lucide-react";
import { SiLeetcode } from "react-icons/si"; // for LeetCode icon

const DeveloperIntro = () => {
  return (
    <div className="w-full px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      
      <div className="text-center mb-8">
        {/* <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 p-0.5">
          <div className="w-full h-full rounded-full bg-white bg-opacity-20 backdrop-blur-sm flex items-center justify-center">
            <Code className="w-8 h-8 text-white" />
          </div>
        </div> */}

        <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2 tracking-tight">
          Nivase R{" "}
          <div className="flex items-center justify-center gap-1 text-white font-normal">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">Chennai, India</span>
          </div>
        </h3>

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/30 to-purple-500/30 backdrop-blur-sm border border-white/20 mb-4">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-black font-semibold text-sm sm:text-base ">
            Software Engineer - SDE 2
          </span>
        </div>

        {/* Description */}
        <p className="max-w-2xl mx-auto text-white text-left text-sm sm:text-base leading-relaxed">
          I have <span className="text-4xl font-bold">4+</span> years of
          experience as a software engineer, working from pre-seed startups to
          Fortune 500 companies. I enjoy building clean, readable, and
          maintainable code. Skilled in turning Figma designs into pixel-perfect
          UIs, handling API integrations, and structuring efficient folder
          architectures. I take ownership of complete frontend development and
          thrive on delivering scalable, user-friendly solutions.
        </p>
      </div>
      <div className="text-center mb-4">
        <p className="text-white/80 text-sm sm:text-base italic">
          💡 To know about my{" "}
          <span className="font-semibold text-white">technical skills</span>,
          please click the{" "}
          <span className="text-purple-300 font-medium">
            sleeping character
          </span>
          .
        </p>
      </div>
      {/* Career Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-500 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-md">
          <Briefcase className="w-6 h-6 text-blue-400 mb-3" />
          <h4 className="text-white font-semibold mb-1">
            Frontend Developer - TCS
          </h4>
          <p className="text-white/70 text-sm mb-2">2021 - 2023</p>
          <ul className="list-disc list-inside text-white/70 text-sm space-y-1">
            <li>Worked on enterprise frontend apps with React</li>
            <li>Learned corporate coding standards & Agile process</li>
            <li>Contributed to UI fixes, API integrations</li>
          </ul>
        </div>

        <div className="bg-gray-500 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-md">
          <Briefcase className="w-6 h-6 text-purple-400 mb-3" />
          <h4 className="text-white font-semibold mb-1">
            Software Engineer - Centaari AI
          </h4>
          <p className="text-white/70 text-sm mb-2">2023 - 2024</p>
          <ul className="list-disc list-inside text-white/70 text-sm space-y-1">
            <li>Built AI-driven web apps with Next.js & APIs</li>
            <li>Improved folder structure & performance</li>
            <li>Hands-on experience in fast-paced startup</li>
          </ul>
        </div>

        <div className="bg-gray-500 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-md">
          <Briefcase className="w-6 h-6 text-green-400 mb-3" />
          <h4 className="text-white font-semibold mb-1">
            Senior Software Engineer - Verizon
          </h4>
          <p className="text-white/70 text-sm mb-2">2024 - 2025</p>
          <ul className="list-disc list-inside text-white/70 text-sm space-y-1">
            <li>Leading frontend module development</li>
            <li>Mentored junior developers & improved code quality</li>
            <li>Focused on scalable, high-performance apps</li>
          </ul>
        </div>
      </div>

      {/* Links Section */}
      <div className="flex flex-wrap justify-center gap-4 mb-12">
        <a
          href="https://www.linkedin.com/in/nivase-r-090905176/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 text-white border border-white/20 hover:bg-white/20 transition"
        >
          <Linkedin className="w-5 h-5" /> LinkedIn
        </a>
        <a
          href="https://github.com/nivase56"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 text-white border border-white/20 hover:bg-white/20 transition"
        >
          <Github className="w-5 h-5" /> GitHub
        </a>
        <a
          href="https://leetcode.com/u/nivashraja/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 text-white border border-white/20 hover:bg-white/20 transition"
        >
          <SiLeetcode className="w-5 h-5" /> LeetCode
        </a>
        <a
          href="mailto:nivashrajar@gmail.com"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 text-white border border-white/20 hover:bg-white/20 transition"
        >
          <Mail className="w-5 h-5" /> Email
        </a>
      </div>
    </div>
  );
};

export default DeveloperIntro;
