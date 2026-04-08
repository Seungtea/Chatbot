import React, { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import UserModal from './UserModal'

function Dashboard({ user }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('all')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          id,
          email,
          role,
          teacher_id,
          created_at,
          assigned_ids
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (err) {
      console.error('사용자 목록 조회 오류:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddUser = () => {
    setEditingUser(null)
    setShowModal(true)
  }

  const handleEditUser = (userToEdit) => {
    setEditingUser(userToEdit)
    setShowModal(true)
  }

  const handleDeleteUser = async (userId) => {
    if (!confirm('정말로 이 사용자를 삭제하시겠습니까?')) return

    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId)

      if (error) throw error
      fetchUsers()
    } catch (err) {
      alert('삭제 중 오류가 발생했습니다.')
    }
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingUser(null)
    fetchUsers()
  }

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         u.teacher_id?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === 'all' || u.role === filterRole
    return matchesSearch && matchesRole
  })

  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'admin').length,
    teachers: users.filter(u => u.role === 'teacher').length,
    totalAssignedIds: users.reduce((sum, u) => sum + (u.assigned_ids?.length || 0), 0)
  }

  return (
    <div className="container">
      <div className="stats-grid">
        <div className="stat-card">
          <h3>총 사용자</h3>
          <div className="number">{stats.total}</div>
        </div>
        <div className="stat-card">
          <h3>관리자</h3>
          <div className="number">{stats.admins}</div>
        </div>
        <div className="stat-card">
          <h3>선생님</h3>
          <div className="number">{stats.teachers}</div>
        </div>
        <div className="stat-card">
          <h3>할당된 ID 수</h3>
          <div className="number">{stats.totalAssignedIds}</div>
        </div>
      </div>

      <div className="card">
        <h2>사용자 관리</h2>
        
        <div className="search-box">
          <input
            type="text"
            placeholder="이메일 또는 선생님 ID 로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-buttons">
          <button 
            className={filterRole === 'all' ? 'active' : ''}
            onClick={() => setFilterRole('all')}
          >
            전체
          </button>
          <button 
            className={filterRole === 'admin' ? 'active' : ''}
            onClick={() => setFilterRole('admin')}
          >
            관리자
          </button>
          <button 
            className={filterRole === 'teacher' ? 'active' : ''}
            onClick={() => setFilterRole('teacher')}
          >
            선생님
          </button>
        </div>

        <button onClick={handleAddUser} className="btn" style={{ marginBottom: '20px' }}>
          + 새 사용자 추가
        </button>

        {loading ? (
          <div className="loading">로딩 중...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="empty-state">등록된 사용자가 없습니다.</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>이메일</th>
                <th>선생님 ID</th>
                <th>역할</th>
                <th>할당된 금쪽이 ID</th>
                <th>가입일</th>
                <th> actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id}>
                  <td>{u.email}</td>
                  <td>{u.teacher_id || '-'}</td>
                  <td>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      backgroundColor: u.role === 'admin' ? '#4a90d9' : '#ffc107',
                      color: u.role === 'admin' ? 'white' : '#333',
                      fontSize: '12px'
                    }}>
                      {u.role === 'admin' ? '관리자' : '선생님'}
                    </span>
                  </td>
                  <td>
                    {u.assigned_ids && u.assigned_ids.length > 0 ? (
                      <span title={u.assigned_ids.join(', ')}>
                        {u.assigned_ids.length}개
                      </span>
                    ) : '-'}
                  </td>
                  <td>{new Date(u.created_at).toLocaleDateString('ko-KR')}</td>
                  <td>
                    <button 
                      onClick={() => handleEditUser(u)} 
                      className="action-btn edit"
                    >
                      수정
                    </button>
                    {u.role !== 'admin' && (
                      <button 
                        onClick={() => handleDeleteUser(u.id)} 
                        className="action-btn delete"
                      >
                        삭제
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <UserModal
          user={editingUser}
          onClose={handleCloseModal}
        />
      )}
    </div>
  )
}

export default Dashboard
