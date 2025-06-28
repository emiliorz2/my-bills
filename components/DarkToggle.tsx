'use client';
export default function DarkToggle() {
  const toggle = () => {
    const html = document.documentElement;
    html.classList.toggle('dark');
  };
  return (
    <button onClick={toggle} className="px-2 py-1">
      🌓
    </button>
  );
}
