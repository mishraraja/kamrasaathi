const fs = require('fs');
const path = require('path');

const contentPath = path.join(__dirname, '..', 'data', 'content.json');
const usersPath = path.join(__dirname, '..', 'data', 'users.json');

function readJson(filePath, fallback) {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

function getContent() {
  return readJson(contentPath, {});
}

function saveContent(content) {
  writeJson(contentPath, content);
}

function getUsers() {
  return readJson(usersPath, []);
}

function saveUsers(users) {
  writeJson(usersPath, users);
}

module.exports = {
  contentPath,
  usersPath,
  getContent,
  saveContent,
  getUsers,
  saveUsers,
};
