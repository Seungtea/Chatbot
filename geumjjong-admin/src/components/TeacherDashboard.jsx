import React, { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

function TeacherDashboard({ user }) {
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [chatLists, setChatLists] = useState({})

  useEffect(() => {
    fetchUserData()
  }, [user])

  const fetchUserData = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error
      setUserData(data)

      // 각 할당된 ID 에 대한 채팅 목록 조회
      if (data.assigned_ids && data.assigned_ids.length > 0) {
        fetchChatLists(data.assigned_ids)
      }
    } catch (err) {
      console.error('사용자 데이터 조회 오류:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchChatLists = async (assignedIds) => {
    const chatData = {}
    
    for (const studentId of assignedIds) {
      try {
        // 실제 채팅 데이터는 기존 시스템에서 가져오는 것으로 가정
        // 여기서는 데모용으로 mock 데이터를 사용
        chatData[studentId] = {
          lastMessage: '최근 메시지 로딩 중...',
          messageCount: 0,
          lastUpdated: new Date().toISOString()
        }
      } catch (err) {
        console.error(`${studentId} 채팅 목록 조회 오류:`, err)
      }
    }
    
    setChatLists(chatData)
  }

  const getChatLink = (studentId) => {
    // 기존 시스템의 URL 구조에 맞게 링크 생성
    return `https://edu.telliot.co.kr/device-chat-list/${studentId}`
  }

  if (loading) {
    return <div className="loading">로딩 중...</div>
  }

  if (!userData) {
    return <div className="empty-state">사용자 정보를 찾을 수 없습니다.</div>
  }

  const assignedIds = userData.assigned_ids || []

  return (
    <div className="container">
      <div className="card">
        <h2>환영합니다, {userData.teacher_id || '선생님'}!</h2>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          할당받은 학생들의 채팅 내역을 확인하실 수 있습니다.
        </p>
        
        <div className="stats-grid" style={{ marginBottom: '30px' }}>
          <div className="stat-card">
            <h3>할당된 학생 수</h3>
            <div className="number">{assignedIds.length}</div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2>내 학생들 ({assignedIds.length}명)</h2>
        
        {assignedIds.length === 0 ? (
          <div className="empty-state">
            할당된 학생이 없습니다.<br/>
            관리자에게 문의하세요.
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>학생 ID</th>
                <th>최근 활동</th>
                <th>메시지 수</th>
                <th> actions</th>
              </tr>
            </thead>
            <tbody>
              {assignedIds.map((studentId) => (
                <tr key={studentId}>
                  <td>
                    <strong>{studentId}</strong>
                  </td>
                  <td>
                    {chatLists[studentId]?.lastMessage || '데이터 없음'}
                  </td>
                  <td>
                    {chatLists[studentId]?.messageCount || 0}
                  </td>
                  <td>
                    <a 
                      href={getChatLink(studentId)} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="action-btn view"
                      style={{ display: 'inline-block', textDecoration: 'none' }}
                    >
                      채팅 보기
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card">
        <h2>이용 안내</h2>
        <ul style={{ paddingLeft: '20px', color: '#666', lineHeight: '1.8' }}>
          <li>상기 목록은 선생님께 할당된 학생 ID 들입니다.</li>
          <li>'채팅 보기' 버튼을 누르면 해당 학생의 채팅 내역을 볼 수 있습니다.</li>
          <li>채팅 내역은 기존 시스템에서 제공하는 페이지로 이동합니다.</li>
          <li>추가적인 학생 할당이 필요하시면 관리자에게 문의하세요.</li>
        </ul>
      </div>
    </div>
  )
}

export default TeacherDashboard
