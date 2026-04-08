import React, { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import TeacherDashboard from './components/TeacherDashboard'

function App() {
  const [user, setUser] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 세션 확인
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        setUser(session.user)
        
        // 사용자 역할 확인
        const { data: userData } = await supabase
          .from('users')
          .select('role, teacher_id')
          .eq('id', session.user.id)
          .single()
        
        if (userData) {
          setUserRole(userData.role)
        }
      }
      setLoading(false)
    }

    checkSession()

    // 인증 상태 변경 리스너
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          setUser(session.user)
          
          const { data: userData } = await supabase
            .from('users')
            .select('role, teacher_id')
            .eq('id', session.user.id)
            .single()
          
          if (userData) {
            setUserRole(userData.role)
          }
        } else {
          setUser(null)
          setUserRole(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setUserRole(null)
  }

  if (loading) {
    return <div className="loading">로딩 중...</div>
  }

  if (!user) {
    return <Login />
  }

  return (
    <div>
      <header className="header">
        <div className="header-content">
          <h1>금쪽이 관리자 - 채팅 내역 관리</h1>
          <div className="user-info">
            <span>{user.email} ({userRole === 'admin' ? '관리자' : '선생님'})</span>
            <button onClick={handleLogout} className="logout-btn">로그아웃</button>
          </div>
        </div>
      </header>
      
      {userRole === 'admin' ? (
        <Dashboard user={user} />
      ) : (
        <TeacherDashboard user={user} userRole={userRole} />
      )}
    </div>
  )
}

export default App
