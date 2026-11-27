import { Header } from './components/header'
import { Home } from './components/home'
import { Apresentacao } from './components/apresentacao'
import { Revista } from './components/revista'
import { Footer } from './components/footer'
import './App.css'

export function App() {
  return (
    <>
      <Header />
      <main>
        <Home />
        <Apresentacao />
        <Revista />
      </main>
      <Footer />
    </>
  )
}

export default App
