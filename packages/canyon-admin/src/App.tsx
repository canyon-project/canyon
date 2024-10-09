// import { Button } from "@/components/ui/button"

 import {Dashboard} from "@/components/Dashboard.tsx";

function App() {
  return (
    <div>
      <div className="min-h-screen bg-background text-foreground w-[100vw]">
        <header className="border-b">
          <div className="container mx-auto flex items-center justify-between py-4">
            <h1 className="text-2xl font-bold">数据库大盘</h1>
            <span></span>
          </div>
        </header>
        <main className="container mx-auto py-8">
          <Dashboard/>
        </main>
      </div>
    </div>
  )
 }

export default App

