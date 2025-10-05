// Admin Panel JavaScript
// Manages the social media database

let database = { users: [] };
let pictureFiles = [];
let videoFiles = [];

// Load database on page load
window.addEventListener('DOMContentLoaded', () => {
  loadDatabase();
  setupEventListeners();
  renderUsers();
  updateStats();
});

function loadDatabase() {
  // Load from socialMediaDatabase or localStorage
  const saved = localStorage.getItem('aegis_social_media_db');
  if (saved) {
    try {
      database = JSON.parse(saved);
    } catch (e) {
      console.error('Error loading database:', e);
    }
  } else if (typeof socialMediaDatabase !== 'undefined') {
    database = { users: [...socialMediaDatabase.users] };
  }
}

function saveDatabase() {
  localStorage.setItem('aegis_social_media_db', JSON.stringify(database));
  // Also update the global socialMediaDatabase if it exists
  if (typeof socialMediaDatabase !== 'undefined') {
    socialMediaDatabase.users = database.users;
  }
}

function setupEventListeners() {
  // Form submission
  document.getElementById('add-user-form').addEventListener('submit', addUser);

  // File upload areas
  const pictureUpload = document.getElementById('picture-upload');
  const videoUpload = document.getElementById('video-upload');
  const pictureInput = document.getElementById('pictures');
  const videoInput = document.getElementById('videos');

  pictureUpload.addEventListener('click', () => pictureInput.click());
  videoUpload.addEventListener('click', () => videoInput.click());

  pictureInput.addEventListener('change', (e) => handleFileSelect(e, 'picture'));
  videoInput.addEventListener('change', (e) => handleFileSelect(e, 'video'));

  // Drag and drop
  setupDragDrop(pictureUpload, pictureInput, 'picture');
  setupDragDrop(videoUpload, videoInput, 'video');

  // Search
  document.getElementById('search').addEventListener('input', (e) => {
    renderUsers(e.target.value);
  });
}

function setupDragDrop(area, input, type) {
  area.addEventListener('dragover', (e) => {
    e.preventDefault();
    area.classList.add('active');
  });

  area.addEventListener('dragleave', () => {
    area.classList.remove('active');
  });

  area.addEventListener('drop', (e) => {
    e.preventDefault();
    area.classList.remove('active');
    const files = Array.from(e.dataTransfer.files);
    addFilesToList(files, type);
  });
}

function handleFileSelect(e, type) {
  const files = Array.from(e.target.files);
  addFilesToList(files, type);
  e.target.value = ''; // Reset input
}

function addFilesToList(files, type) {
  const targetArray = type === 'picture' ? pictureFiles : videoFiles;
  const listElement = document.getElementById(type === 'picture' ? 'picture-list' : 'video-list');

  files.forEach(file => {
    targetArray.push(file);
    const fileItem = document.createElement('div');
    fileItem.className = 'file-item';
    fileItem.innerHTML = `
      <span>${file.name} (${formatFileSize(file.size)})</span>
      <button type="button" onclick="removeFile('${type}', ${targetArray.length - 1})">✕</button>
    `;
    listElement.appendChild(fileItem);
  });
}

function removeFile(type, index) {
  const targetArray = type === 'picture' ? pictureFiles : videoFiles;
  targetArray.splice(index, 1);
  renderFileList(type);
}

function renderFileList(type) {
  const targetArray = type === 'picture' ? pictureFiles : videoFiles;
  const listElement = document.getElementById(type === 'picture' ? 'picture-list' : 'video-list');
  listElement.innerHTML = '';

  targetArray.forEach((file, index) => {
    const fileItem = document.createElement('div');
    fileItem.className = 'file-item';
    fileItem.innerHTML = `
      <span>${file.name} (${formatFileSize(file.size)})</span>
      <button type="button" onclick="removeFile('${type}', ${index})">✕</button>
    `;
    listElement.appendChild(fileItem);
  });
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function addUser(e) {
  e.preventDefault();

  const username = document.getElementById('username').value.trim();
  const platform = document.getElementById('platform').value;
  const hashtags = document.getElementById('hashtags').value.trim();
  const comments = document.getElementById('comments').value.trim();
  const followers = parseInt(document.getElementById('followers').value) || 0;
  const engagement = document.getElementById('engagement').value;

  if (!username || !platform) {
    showAlert('Please fill in all required fields!', 'error');
    return;
  }

  // Create user object
  const newUser = {
    id: Date.now(),
    username: username,
    platform: platform,
    pictures: pictureFiles.map(file => ({
      name: file.name,
      size: file.size,
      type: file.type,
      uploadDate: new Date().toISOString().split('T')[0]
    })),
    videos: videoFiles.map(file => ({
      name: file.name,
      size: file.size,
      type: file.type,
      uploadDate: new Date().toISOString().split('T')[0]
    })),
    hashtags: hashtags,
    comments: comments,
    followers: followers,
    engagement: engagement
  };

  // Add to database
  database.users.push(newUser);
  saveDatabase();

  // Reset form
  resetForm();
  renderUsers();
  updateStats();

  showAlert(`User @${username} added successfully!`, 'success');
}

function deleteUser(id) {
  if (confirm('Are you sure you want to delete this user?')) {
    database.users = database.users.filter(user => user.id !== id);
    saveDatabase();
    renderUsers();
    updateStats();
    showAlert('User deleted successfully!', 'success');
  }
}

function editUser(id) {
  const user = database.users.find(u => u.id === id);
  if (!user) return;

  // Populate form with user data
  document.getElementById('username').value = user.username;
  document.getElementById('platform').value = user.platform;
  document.getElementById('hashtags').value = user.hashtags;
  document.getElementById('comments').value = user.comments;
  document.getElementById('followers').value = user.followers;
  document.getElementById('engagement').value = user.engagement;

  // Delete the user (will be re-added with new data)
  database.users = database.users.filter(u => u.id !== id);
  saveDatabase();
  renderUsers();
  updateStats();

  showAlert('Edit mode: Modify the form and click Add User to save changes', 'success');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderUsers(searchTerm = '') {
  const userList = document.getElementById('user-list');
  let users = database.users;

  // Filter by search term
  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    users = users.filter(user =>
      user.username.toLowerCase().includes(term) ||
      user.platform.toLowerCase().includes(term) ||
      user.hashtags.toLowerCase().includes(term) ||
      user.comments.toLowerCase().includes(term)
    );
  }

  if (users.length === 0) {
    userList.innerHTML = '<p style="text-align:center;color:#999;padding:40px;">No users found</p>';
    return;
  }

  userList.innerHTML = users.map(user => `
    <div class="user-card">
      <div class="user-card-header">
        <h3>@${user.username}</h3>
        <span class="platform-badge">${user.platform}</span>
      </div>
      <div class="user-card-body">
        <div class="hashtags">${user.hashtags || 'No hashtags'}</div>
        <div style="margin-top:5px;">${user.comments || 'No comments'}</div>
      </div>
      <div class="user-card-footer">
        <div class="media-count">
          <span>📷 ${user.pictures.length}</span>
          <span>🎥 ${user.videos.length}</span>
          <span>👥 ${user.followers.toLocaleString()}</span>
          <span>📊 ${user.engagement}</span>
        </div>
        <div class="user-actions">
          <button class="btn btn-primary" onclick="editUser(${user.id})">✏️ Edit</button>
          <button class="btn btn-danger" onclick="deleteUser(${user.id})">🗑️ Delete</button>
        </div>
      </div>
    </div>
  `).join('');
}

function updateStats() {
  document.getElementById('total-users').textContent = database.users.length;
  const totalMedia = database.users.reduce((sum, user) => 
    sum + user.pictures.length + user.videos.length, 0
  );
  document.getElementById('total-media').textContent = totalMedia;
}

function resetForm() {
  document.getElementById('add-user-form').reset();
  pictureFiles = [];
  videoFiles = [];
  document.getElementById('picture-list').innerHTML = '';
  document.getElementById('video-list').innerHTML = '';
}

function showAlert(message, type) {
  const alert = document.getElementById('alert');
  alert.textContent = message;
  alert.className = `alert alert-${type} show`;
  setTimeout(() => {
    alert.classList.remove('show');
  }, 5000);
}

function exportToJSON() {
  const dataStr = JSON.stringify(database, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  downloadFile(blob, 'social-media-database.json');
  showAlert('Database exported as JSON!', 'success');
}

function exportToCSV() {
  const headers = ['ID', 'Username', 'Platform', 'Pictures', 'Videos', 'Hashtags', 'Comments', 'Followers', 'Engagement'];
  const rows = database.users.map(user => [
    user.id,
    user.username,
    user.platform,
    user.pictures.length,
    user.videos.length,
    user.hashtags,
    user.comments,
    user.followers,
    user.engagement
  ]);

  const csv = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  downloadFile(blob, 'social-media-database.csv');
  showAlert('Database exported as CSV!', 'success');
}

function backupDatabase() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const dataStr = JSON.stringify(database, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  downloadFile(blob, `database-backup-${timestamp}.json`);
  showAlert('Database backup created!', 'success');
}

function downloadFile(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Sync database with main app
setInterval(() => {
  saveDatabase();
}, 30000); // Auto-save every 30 seconds
