const { cpSync, mkdirSync } = require("node:fs");
for (const name of ["main", "preload", "shared", "services"]) cpSync(`build/src/${name}`, `build/${name}`, { recursive: true });
mkdirSync("build/renderer", { recursive: true });
cpSync("build/browser", "build/renderer", { recursive: true });
for (const name of ["index.html", "style.css"]) cpSync(`src/renderer/${name}`, `build/renderer/${name}`);
cpSync("assets/services", "build/renderer/services-icons", { recursive: true });
cpSync("assets/icons/64x64.png", "build/renderer/app-icon.png");
console.log("Built main process, isolated preload and renderer.");
