export const APPEARANCE_KEY = "csspg.appearance";
export const ACCENT_KEY = "csspg.accent";

/**
 * Runs in <head> before first paint so the window opens directly in the
 * user's chosen appearance (no light→dark flash).
 */
export const APPEARANCE_BOOT_SCRIPT = `(function(){try{var d=document.documentElement;var a=localStorage.getItem("${APPEARANCE_KEY}")||"oled";var c=localStorage.getItem("${ACCENT_KEY}")||"blue";var r=a==="system"?"oled":a;d.setAttribute("data-theme",r);d.setAttribute("data-accent",c);d.style.colorScheme=(r==="light"||r==="cream")?"light":"dark";if(r==="dark"||r==="oled"||r==="nordic"){d.classList.add("dark");}else{d.classList.remove("dark");}}catch(e){}})()`;

