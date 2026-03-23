import { useAuth } from "@/context/AuthContext";

export function SideNavBar() {
  const { logout } = useAuth();

  return (
    <aside className="flex flex-col h-full sticky left-0 top-0 overflow-y-auto bg-zinc-950 h-screen w-64 border-r border-zinc-800/15 font-headline text-sm font-medium duration-300 ease-in-out shrink-0">
      <div className="px-8 py-10">
        <div className="text-lg font-black text-zinc-100 tracking-tighter">Contract Ledger</div>
        <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mt-1">The Sovereign Vault</div>
      </div>
      
      <nav className="flex-1 px-4 space-y-1">
        <a className="flex items-center gap-3 text-indigo-400 bg-indigo-500/10 border-r-2 border-indigo-500 px-4 py-3 transition-all" href="/">
          <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 0"}}>dashboard</span>
          <span>Dashboard</span>
        </a>
        <a className="flex items-center gap-3 text-zinc-500 px-4 py-3 hover:text-zinc-200 hover:bg-zinc-900/50 transition-all" href="/contracts">
          <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 0"}}>description</span>
          <span>Contracts</span>
        </a>
        <a className="flex items-center gap-3 text-zinc-500 px-4 py-3 hover:text-zinc-200 hover:bg-zinc-900/50 transition-all" href="#">
          <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 0"}}>insights</span>
          <span>Analytics</span>
        </a>
        <a className="flex items-center gap-3 text-zinc-500 px-4 py-3 hover:text-zinc-200 hover:bg-zinc-900/50 transition-all" href="#">
          <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 0"}}>gavel</span>
          <span>Compliance</span>
        </a>
        <a className="flex items-center gap-3 text-zinc-500 px-4 py-3 hover:text-zinc-200 hover:bg-zinc-900/50 transition-all" href="#">
          <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 0"}}>settings</span>
          <span>Settings</span>
        </a>
      </nav>

      <div className="mt-auto px-6 py-8">
        <button className="w-full bg-gradient-to-br from-primary to-primary-dim text-on-primary-container font-semibold py-3 rounded-xl text-sm hover:scale-105 transition-transform">
          New Contract
        </button>
        <div className="mt-8 space-y-2">
          <a className="flex items-center gap-3 text-zinc-500 px-2 py-2 hover:text-zinc-200 transition-colors" href="#">
            <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 0"}}>help</span>
            <span>Support</span>
          </a>
          <button 
            onClick={() => logout()}
            className="w-full flex items-center gap-3 text-zinc-500 px-2 py-2 hover:text-zinc-200 transition-colors"
          >
            <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 0"}}>logout</span>
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

