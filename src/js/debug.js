// Add this debug script to help identify issues
window.onerror = function(message, source, lineno, colno, error) {
    console.error('ERROR:', message);
    console.error('Source:', source);
    console.error('Line:', lineno, 'Column:', colno);
    console.error('Error object:', error);
    
    // Add visible error display for debugging
    const errorDisplay = document.createElement('div');
    errorDisplay.style.position = 'fixed';
    errorDisplay.style.top = '10px';
    errorDisplay.style.left = '10px';
    errorDisplay.style.backgroundColor = 'rgba(255,0,0,0.8)';
    errorDisplay.style.color = 'white';
    errorDisplay.style.padding = '10px';
    errorDisplay.style.borderRadius = '5px';
    errorDisplay.style.zIndex = '9999';
    errorDisplay.style.maxWidth = '80%';
    errorDisplay.style.maxHeight = '80%';
    errorDisplay.style.overflow = 'auto';
    errorDisplay.innerHTML = `<strong>Error:</strong> ${message}<br><strong>Source:</strong> ${source}<br><strong>Line:</strong> ${lineno}, <strong>Column:</strong> ${colno}`;
    
    document.body.appendChild(errorDisplay);
    
    // Add close button
    const closeBtn = document.createElement('button');
    closeBtn.innerText = 'Close';
    closeBtn.style.marginTop = '10px';
    closeBtn.onclick = function() {
        document.body.removeChild(errorDisplay);
    };
    errorDisplay.appendChild(closeBtn);
    
    return false; // Let default error handling continue
};
