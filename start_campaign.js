// ============================================================
//  start_campaign.js  –  UIU Friends Network
// ============================================================

// Simulated array of uploaded files (starts with preloaded ones in HTML)
var uploadedFiles = [
  { name: 'medical_report.pdf', type: 'pdf' },
  { name: 'hospital_bill.jpg', type: 'image' }
];

// ---- Format Text in Story Editor ----
function formatText(style) {
  var textarea = document.getElementById('story-text');
  var start = textarea.selectionStart;
  var end = textarea.selectionEnd;
  var text = textarea.value;
  var selectedText = text.substring(start, end);
  var replacement = "";

  if (style === 'bold') {
    replacement = "**" + selectedText + "**";
  } else if (style === 'italic') {
    replacement = "_" + selectedText + "_";
  }

  textarea.value = text.substring(0, start) + replacement + text.substring(end);
  textarea.focus();
  textarea.setSelectionRange(start + 2, start + 2 + selectedText.length);
}

// ---- Insert List in Editor ----
function insertList() {
  var textarea = document.getElementById('story-text');
  var start = textarea.selectionStart;
  var end = textarea.selectionEnd;
  var text = textarea.value;
  var selectedText = text.substring(start, end);
  
  var replacement = "\n- " + selectedText;
  textarea.value = text.substring(0, start) + replacement + text.substring(end);
  textarea.focus();
}

// ---- Insert Link in Editor ----
function insertLink() {
  var textarea = document.getElementById('story-text');
  var start = textarea.selectionStart;
  var end = textarea.selectionEnd;
  var text = textarea.value;
  
  var url = prompt("Enter the URL:", "https://");
  if (url) {
    var selectedText = text.substring(start, end) || "link text";
    var replacement = "[" + selectedText + "](" + url + ")";
    textarea.value = text.substring(0, start) + replacement + text.substring(end);
  }
  textarea.focus();
}

// ---- Insert Image in Editor ----
function triggerImageUpload() {
  var textarea = document.getElementById('story-text');
  var start = textarea.selectionStart;
  var end = textarea.selectionEnd;
  var text = textarea.value;

  var imageUrl = prompt("Enter Image URL:", "https://example.com/image.jpg");
  if (imageUrl) {
    var replacement = "![image description](" + imageUrl + ")";
    textarea.value = text.substring(0, start) + replacement + text.substring(end);
  }
  textarea.focus();
}

// ---- File Upload Actions ----
function triggerFileInput() {
  document.getElementById('file-input').click();
}

function handleDragOver(e) {
  e.preventDefault();
  document.getElementById('drop-zone').classList.add('drag-over');
}

function handleDrop(e) {
  e.preventDefault();
  document.getElementById('drop-zone').classList.remove('drag-over');
  
  var files = e.dataTransfer.files;
  addFilesToList(files);
}

function handleFileSelect(e) {
  var files = e.target.files;
  addFilesToList(files);
}

// Process files and update UI list
function addFilesToList(files) {
  var listContainer = document.getElementById('files-list');

  for (var i = 0; i < files.length; i++) {
    var file = files[i];
    
    // Check file size (5MB Limit)
    if (file.size > 5 * 1024 * 1024) {
      alert("File '" + file.name + "' exceeds the 5MB size limit.");
      continue;
    }

    // Determine type icon
    var isPdf = file.name.toLowerCase().endsWith('.pdf');
    var iconName = isPdf ? 'picture_as_pdf' : 'image';

    // Prevent duplicate entries
    var exists = false;
    for (var j = 0; j < uploadedFiles.length; j++) {
      if (uploadedFiles[j].name === file.name) {
        exists = true;
        break;
      }
    }

    if (exists) {
      alert("File '" + file.name + "' is already uploaded.");
      continue;
    }

    // Save to list
    uploadedFiles.push({ name: file.name, type: isPdf ? 'pdf' : 'image' });

    // Create chip HTML
    var chip = document.createElement('div');
    chip.className = 'file-chip';
    chip.id = 'file-' + file.name;
    chip.innerHTML = `
      <span class="material-symbols-outlined file-icon">${iconName}</span>
      <span class="file-name">${file.name}</span>
      <button class="file-remove" onclick="removeFile('${file.name}')">
        <span class="material-symbols-outlined">close</span>
      </button>
    `;
    listContainer.appendChild(chip);
  }
}

// Remove File Chip
function removeFile(fileName) {
  // Remove from array
  uploadedFiles = uploadedFiles.filter(function (file) {
    return file.name !== fileName;
  });

  // Remove from DOM
  var element = document.getElementById('file-' + fileName);
  if (element) {
    element.parentNode.removeChild(element);
  }
}

// ---- Footer Nav Action - Back ----
function goBack() {
  window.history.back();
}

// ---- Footer Nav Action - Next Step ----
function goNext() {
  var title = document.getElementById('campaign-title').value.trim();
  var amount = document.getElementById('target-amount').value.trim();
  var story = document.getElementById('story-text').value.trim();

  if (!title) {
    alert("Please enter a Campaign Title.");
    document.getElementById('campaign-title').focus();
    return;
  }

  if (!amount || isNaN(amount.replace(/,/g, '')) || parseFloat(amount.replace(/,/g, '')) <= 0) {
    alert("Please enter a valid Target Amount.");
    document.getElementById('target-amount').focus();
    return;
  }

  if (!story) {
    alert("Please tell your story in the Story section.");
    document.getElementById('story-text').focus();
    return;
  }

  if (uploadedFiles.length === 0) {
    alert("Please upload at least one Proof of Necessity verification document.");
    return;
  }

  // Visual success feedback
  var nextBtn = document.getElementById('next-btn');
  nextBtn.innerHTML = '<span>Processing...</span> <span class="material-symbols-outlined">hourglass_empty</span>';
  nextBtn.style.background = '#10B981';

  setTimeout(function() {
    alert("Campaign basics, story, and proof verified successfully! Advancing to Step 3: Review & Submit.");
    nextBtn.innerHTML = '<span>Next Step: Review</span> <span class="material-symbols-outlined">arrow_forward</span>';
    nextBtn.style.background = '';
    // Typically here you would redirect or go to the next step
    // window.location.href = "campaign_review.html";
  }, 1000);
}
