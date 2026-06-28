import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import TodoList from './pages/TodoList.jsx'
import TodoDetail from './pages/TodoDetail.jsx'
import styles from './App.module.css'

export default function App() {
  return (
    <BrowserRouter>
      <div className={styles.shell}>
        <nav className={styles.nav}>
          <NavLink to="/" className={styles.logo}>
            <span className={styles.logoIcon}>✓</span>
            <span>TaskFlow</span>
          </NavLink>
          <div className={styles.navLinks}>
            <NavLink to="/" end className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link}>
              All Todos
            </NavLink>
          </div>
        </nav>

        <main className={styles.main}>
          <Routes>
            <Route path="/" element={<TodoList />} />
            <Route path="/todo" element={<TodoDetail />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
