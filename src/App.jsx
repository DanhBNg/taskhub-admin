import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { useEffect, useMemo, useState } from 'react';
import { auth } from './firebase';
import {
  fetchProjects,
  fetchStats,
  fetchTasks,
  fetchUsers,
  updateProjectStatus,
  updateUserRole,
} from './api/adminApi';

const tabs = [
  { id: 'overview', label: 'Tổng quan' },
  { id: 'users', label: 'Người dùng' },
  { id: 'projects', label: 'Dự án' },
  { id: 'tasks', label: 'Công việc' },
];

const statusLabels = {
  todo: 'Cần làm',
  in_progress: 'Đang làm',
  review: 'Chờ duyệt',
  done: 'Hoàn thành',
};

function formatDate(value) {
  if (!value) return 'Chưa có';
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function shortId(value) {
  if (!value) return 'Không có';
  return value.length > 10 ? `${value.slice(0, 6)}...${value.slice(-4)}` : value;
}

function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      onLogin?.();
    } catch (err) {
      setError('Đăng nhập thất bại. Kiểm tra email, mật khẩu hoặc quyền admin.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-panel">
        <div className="brand-mark">TH</div>
        <h1>TaskHub Admin</h1>
        <p>Đăng nhập bằng tài khoản Firebase có quyền quản trị hệ thống.</p>
        <form onSubmit={handleSubmit}>
          <label>
            Email
            <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="email" required />
          </label>
          <label>
            Mật khẩu
            <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" autoComplete="current-password" required />
          </label>
          {error && <div className="error-box">{error}</div>}
          <button className="primary-button" disabled={loading}>{loading ? 'Đang đăng nhập...' : 'Đăng nhập'}</button>
        </form>
      </section>
    </main>
  );
}

function StatCard({ label, value, tone }) {
  return (
    <article className={`stat-card ${tone || ''}`}>
      <span>{label}</span>
      <strong>{value ?? 0}</strong>
    </article>
  );
}

function Overview({ stats, users, projects, tasks }) {
  const statusCount = useMemo(() => tasks.reduce((acc, task) => {
    acc[task.status] = (acc[task.status] || 0) + 1;
    return acc;
  }, {}), [tasks]);

  return (
    <div className="content-stack">
      <section className="stats-grid">
        <StatCard label="Người dùng" value={stats.users} tone="blue" />
        <StatCard label="Dự án" value={stats.projects} tone="green" />
        <StatCard label="Công việc" value={stats.tasks} tone="amber" />
        <StatCard label="Tin nhắn" value={stats.messages} tone="violet" />
      </section>
      <section className="two-column">
        <div className="panel">
          <h2>Trạng thái công việc</h2>
          <div className="metric-list">
            {['todo', 'in_progress', 'review', 'done'].map((status) => (
              <div key={status}>
                <span>{statusLabels[status]}</span>
                <strong>{statusCount[status] || 0}</strong>
              </div>
            ))}
          </div>
        </div>
        <div className="panel">
          <h2>Hoạt động gần đây</h2>
          <div className="activity-list">
            {projects.slice(0, 5).map((project) => (
              <div key={project.id}>
                <strong>{project.name || 'Dự án chưa đặt tên'}</strong>
                <span>{project.memberCount} thành viên · {project.status}</span>
              </div>
            ))}
            {projects.length === 0 && <p className="muted">Chưa có dự án để hiển thị.</p>}
          </div>
        </div>
      </section>
      <section className="panel">
        <h2>Tóm tắt dữ liệu</h2>
        <p className="muted">Đang quản lý {users.length} người dùng, {projects.length} dự án và {tasks.length} công việc mới nhất được tải từ backend.</p>
      </section>
    </div>
  );
}

function UsersTable({ users, onChangeRole, currentUid }) {
  return (
    <section className="panel table-panel">
      <div className="panel-heading">
        <h2>Người dùng</h2>
        <span>{users.length} bản ghi</span>
      </div>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Họ tên</th>
              <th>Email</th>
              <th>Vai trò hệ thống</th>
              <th>Ngày tạo</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const role = String(user.systemRole || 'user').toLowerCase();
              const nextRole = role === 'admin' ? 'user' : 'admin';
              return (
                <tr key={user.id}>
                  <td>
                    <div className="identity-cell">
                      <span className="avatar">{(user.fullName || user.email || '?').slice(0, 1).toUpperCase()}</span>
                      <div>
                        <strong>{user.fullName || 'Chưa có tên'}</strong>
                        <small>{shortId(user.id)}</small>
                      </div>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td><span className={`pill ${role === 'admin' ? 'danger' : 'neutral'}`}>{role}</span></td>
                  <td>{formatDate(user.createdAt)}</td>
                  <td>
                    <button className="ghost-button" disabled={user.id === currentUid} onClick={() => onChangeRole(user.id, nextRole)}>
                      Chuyển thành {nextRole}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function ProjectsTable({ projects, onChangeStatus }) {
  return (
    <section className="panel table-panel">
      <div className="panel-heading">
        <h2>Dự án</h2>
        <span>{projects.length} bản ghi</span>
      </div>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Tên dự án</th>
              <th>Owner</th>
              <th>Thành viên</th>
              <th>Trạng thái</th>
              <th>Ngày tạo</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => {
              const status = String(project.status || 'active').toLowerCase();
              const nextStatus = status === 'archived' ? 'active' : 'archived';
              return (
                <tr key={project.id}>
                  <td>
                    <strong>{project.name || 'Dự án chưa đặt tên'}</strong>
                    <small>{project.description || shortId(project.id)}</small>
                  </td>
                  <td>{shortId(project.ownerId)}</td>
                  <td>{project.memberCount}</td>
                  <td><span className={`pill ${status === 'archived' ? 'warning' : 'success'}`}>{status}</span></td>
                  <td>{formatDate(project.createdAt)}</td>
                  <td><button className="ghost-button" onClick={() => onChangeStatus(project.id, nextStatus)}>{nextStatus === 'archived' ? 'Archive' : 'Mở lại'}</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function TasksTable({ tasks, projects }) {
  const projectNameById = useMemo(() => Object.fromEntries(projects.map((project) => [project.id, project.name])), [projects]);

  return (
    <section className="panel table-panel">
      <div className="panel-heading">
        <h2>Công việc</h2>
        <span>{tasks.length} bản ghi</span>
      </div>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Task</th>
              <th>Dự án</th>
              <th>Trạng thái</th>
              <th>Ưu tiên</th>
              <th>Người thực hiện</th>
              <th>Deadline</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id}>
                <td>
                  <strong>{task.title || 'Task chưa đặt tên'}</strong>
                  <small>{task.description || shortId(task.id)}</small>
                </td>
                <td>{projectNameById[task.projectId] || shortId(task.projectId)}</td>
                <td><span className="pill neutral">{statusLabels[task.status] || task.status}</span></td>
                <td>{task.priority}</td>
                <td>{task.assigneeNames?.length ? task.assigneeNames.join(', ') : 'Chưa giao'}</td>
                <td>{formatDate(task.dueDate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function AdminShell({ user }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({ users: 0, projects: 0, tasks: 0, messages: 0 });
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  async function getToken() {
    return user.getIdToken();
  }

  async function loadData() {
    setError('');
    setLoading(true);
    try {
      const token = await getToken();
      const [statsResult, usersResult, projectsResult, tasksResult] = await Promise.all([
        fetchStats(token),
        fetchUsers(token),
        fetchProjects(token),
        fetchTasks(token),
      ]);
      setStats(statsResult);
      setUsers(usersResult.users || []);
      setProjects(projectsResult.projects || []);
      setTasks(tasksResult.tasks || []);
    } catch (err) {
      setError(err.message || 'Không thể tải dữ liệu quản trị.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleChangeRole(uid, systemRole) {
    setNotice('');
    try {
      const token = await getToken();
      await updateUserRole(token, uid, systemRole);
      setNotice('Đã cập nhật quyền người dùng.');
      await loadData();
    } catch (err) {
      setError(err.message || 'Không thể cập nhật quyền người dùng.');
    }
  }

  async function handleChangeProjectStatus(projectId, status) {
    setNotice('');
    try {
      const token = await getToken();
      await updateProjectStatus(token, projectId, status);
      setNotice('Đã cập nhật trạng thái dự án.');
      await loadData();
    } catch (err) {
      setError(err.message || 'Không thể cập nhật trạng thái dự án.');
    }
  }

  return (
    <div className="admin-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-mark small">TH</div>
          <div>
            <strong>TaskHub</strong>
            <span>Admin Console</span>
          </div>
        </div>
        <nav>
          {tabs.map((tab) => (
            <button key={tab.id} className={activeTab === tab.id ? 'active' : ''} onClick={() => setActiveTab(tab.id)}>{tab.label}</button>
          ))}
        </nav>
      </aside>
      <main className="admin-main">
        <header className="topbar">
          <div>
            <p>Quản trị hệ thống</p>
            <h1>{tabs.find((tab) => tab.id === activeTab)?.label}</h1>
          </div>
          <div className="topbar-actions">
            <span>{user.email}</span>
            <button className="ghost-button" onClick={loadData}>Tải lại</button>
            <button className="danger-button" onClick={() => signOut(auth)}>Đăng xuất</button>
          </div>
        </header>
        {error && <div className="error-box wide">{error}</div>}
        {notice && <div className="notice-box">{notice}</div>}
        {loading ? (
          <div className="loading-panel">Đang tải dữ liệu quản trị...</div>
        ) : (
          <>
            {activeTab === 'overview' && <Overview stats={stats} users={users} projects={projects} tasks={tasks} />}
            {activeTab === 'users' && <UsersTable users={users} currentUid={user.uid} onChangeRole={handleChangeRole} />}
            {activeTab === 'projects' && <ProjectsTable projects={projects} onChangeStatus={handleChangeProjectStatus} />}
            {activeTab === 'tasks' && <TasksTable tasks={tasks} projects={projects} />}
          </>
        )}
      </main>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setCheckingAuth(false);
    });
    return unsubscribe;
  }, []);

  if (checkingAuth) {
    return <div className="loading-page">Đang kiểm tra phiên đăng nhập...</div>;
  }

  if (!user) {
    return <LoginScreen />;
  }

  return <AdminShell user={user} />;
}
