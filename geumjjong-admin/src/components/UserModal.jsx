import React, { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

function UserModal({ user, onClose }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('teacher')
  const [teacherId, setTeacherId] = useState('')
  const [assignedIds, setAssignedIds] = useState([])
  const [newIdInput, setNewIdInput] = useState('')
  const [idRangeStart, setIdRangeStart] = useState('')
  const [idRangeEnd, setIdRangeEnd] = useState('')
  const [idPrefix, setIdPrefix] = useState('n')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user) {
      setEmail(user.email || '')
      setRole(user.role || 'teacher')
      setTeacherId(user.teacher_id || '')
      setAssignedIds(user.assigned_ids || [])
    }
  }, [user])

  const handleAddSingleId = () => {
    if (newIdInput.trim() && !assignedIds.includes(newIdInput.trim())) {
      setAssignedIds([...assignedIds, newIdInput.trim()])
      setNewIdInput('')
    }
  }

  const handleAddRangeIds = () => {
    if (!idRangeStart || !idRangeEnd) return

    const startNum = parseInt(idRangeStart.replace(/^\D+/, ''))
    const endNum = parseInt(idRangeEnd.replace(/^\D+/, ''))
    const prefix = idPrefix

    if (isNaN(startNum) || isNaN(endNum) || startNum > endNum) {
      alert('올바른 범위를 입력해주세요.')
      return
    }

    const newIds = []
    for (let i = startNum; i <= endNum; i++) {
      const numStr = i.toString().padStart(
        idRangeStart.length - 1, 
        '0'
      )
      const newId = `${prefix}${numStr}`
      if (!assignedIds.includes(newId)) {
        newIds.push(newId)
      }
    }

    setAssignedIds([...assignedIds, ...newIds])
    setIdRangeStart('')
    setIdRangeEnd('')
  }

  const handleRemoveId = (idToRemove) => {
    setAssignedIds(assignedIds.filter(id => id !== idToRemove))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (user) {
        // 기존 사용자 수정
        const { error } = await supabase
          .from('users')
          .update({
            teacher_id: teacherId,
            role: role,
            assigned_ids: assignedIds
          })
          .eq('id', user.id)

        if (error) throw error
      } else {
        // 새 사용자 생성
        // 1. Supabase Auth 에 사용자 생성
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: email,
          password: password,
          email_confirm: true
        })

        if (authError) throw authError

        // 2. users 테이블에 정보 저장
        const { error: dbError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            email: email,
            teacher_id: teacherId,
            role: role,
            assigned_ids: assignedIds
          })

        if (dbError) {
          // Auth 사용자는 생성되었지만 DB 실패 시 정리
          await supabase.auth.admin.deleteUser(authData.user.id)
          throw dbError
        }
      }

      onClose()
    } catch (err) {
      setError(err.message || '오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{user ? '사용자 수정' : '새 사용자 추가'}</h2>
        
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">이메일</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일"
              required
              disabled={!!user}
            />
          </div>

          {!user && (
            <div className="form-group">
              <label htmlFor="password">비밀번호</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호"
                required
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="role">역할</label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                fontSize: '16px'
              }}
            >
              <option value="admin">관리자</option>
              <option value="teacher">선생님</option>
            </select>
          </div>

          {role === 'teacher' && (
            <>
              <div className="form-group">
                <label htmlFor="teacherId">선생님 ID (표시용)</label>
                <input
                  type="text"
                  id="teacherId"
                  value={teacherId}
                  onChange={(e) => setTeacherId(e.target.value)}
                  placeholder="예: Tea019"
                />
              </div>

              <div className="card" style={{ marginTop: '20px' }}>
                <h3 style={{ fontSize: '16px', marginBottom: '15px' }}>금쪽이 ID 할당</h3>
                
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ fontSize: '14px', marginBottom: '10px' }}>단일 ID 추가</h4>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input
                      type="text"
                      value={newIdInput}
                      onChange={(e) => setNewIdInput(e.target.value)}
                      placeholder="예: n369"
                      style={{ flex: 1, padding: '8px', border: '1px solid #ddd', borderRadius: '5px' }}
                    />
                    <button 
                      type="button" 
                      onClick={handleAddSingleId}
                      className="btn"
                      style={{ width: 'auto', padding: '8px 16px' }}
                    >
                      추가
                    </button>
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ fontSize: '14px', marginBottom: '10px' }}>범위로 추가</h4>
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                    <select
                      value={idPrefix}
                      onChange={(e) => setIdPrefix(e.target.value)}
                      style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '5px' }}
                    >
                      <option value="n">n</option>
                      <option value="k">k</option>
                    </select>
                    <input
                      type="text"
                      value={idRangeStart}
                      onChange={(e) => setIdRangeStart(e.target.value)}
                      placeholder="시작 (예: 001)"
                      style={{ flex: 1, padding: '8px', border: '1px solid #ddd', borderRadius: '5px' }}
                    />
                    <span style={{ alignSelf: 'center' }}>~</span>
                    <input
                      type="text"
                      value={idRangeEnd}
                      onChange={(e) => setIdRangeEnd(e.target.value)}
                      placeholder="끝 (예: 020)"
                      style={{ flex: 1, padding: '8px', border: '1px solid #ddd', borderRadius: '5px' }}
                    />
                  </div>
                  <button 
                    type="button" 
                    onClick={handleAddRangeIds}
                    className="btn btn-secondary"
                    style={{ width: 'auto', padding: '8px 16px' }}
                  >
                    범위 추가
                  </button>
                </div>

                {assignedIds.length > 0 && (
                  <div>
                    <h4 style={{ fontSize: '14px', marginBottom: '10px' }}>
                      할당된 ID ({assignedIds.length}개)
                    </h4>
                    <div style={{ 
                      display: 'flex', 
                      flexWrap: 'wrap', 
                      gap: '8px',
                      maxHeight: '200px',
                      overflowY: 'auto'
                    }}>
                      {assignedIds.map((id) => (
                        <span
                          key={id}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '4px 8px',
                            backgroundColor: '#e9ecef',
                            borderRadius: '4px',
                            fontSize: '13px'
                          }}
                        >
                          {id}
                          <button
                            type="button"
                            onClick={() => handleRemoveId(id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              color: '#dc3545',
                              fontSize: '16px',
                              padding: '0 2px'
                            }}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              취소
            </button>
            <button type="submit" className="btn" disabled={loading}>
              {loading ? '저장 중...' : (user ? '수정' : '추가')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default UserModal
