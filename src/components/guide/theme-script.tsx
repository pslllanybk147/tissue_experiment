// ต้องเป็น inline script ที่รันก่อน React hydrate ไม่งั้นหน้าจะกระพริบจากสว่างเป็นมืด
const script = `(function(){try{var t=localStorage.getItem("pl-theme");if(t==="dark"||t==="light"){document.documentElement.setAttribute("data-theme",t);}}catch(e){}})();`;

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
