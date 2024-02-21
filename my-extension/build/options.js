// Saves options to chrome.storage
const saveOptions = () => {
    const username = document.getElementById('username').value;
    chrome.storage.sync.set(
      { username: username},
      () => {
         // Update status to let user know options were saved.
         const status = document.getElementById('status');
         status.textContent = 'Options saved.';
         setTimeout(() => {
           status.textContent = '';
         }, 750);
      }
    );
  };

  // Restores textbox state using the preferences stored in chrome.storage.
  const restoreOptions = () => {
    chrome.storage.sync.get(
      { username: ''},
      (items) => {
        document.getElementById('username').value = items.username;
      }
    );
  };
  
  document.addEventListener('DOMContentLoaded', restoreOptions);
  document.getElementById('save').addEventListener('click', saveOptions);