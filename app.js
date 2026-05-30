// Router and Interactive Manager for Hospital ICT Service Management App

const routes = {
    '': 'login.html',
    '#/': 'login.html',
    '#/login': 'login.html',
    '#/dashboard': 'dashboard.html',
    '#/biomedical': 'biomedical.html',
    '#/super-admin-dashboard': 'super-admin-dashboard.html',
    '#/tickets': 'tickets.html',
    '#/tickets-legacy': 'tickets-legacy.html',
    '#/requests': 'requests.html',
    '#/inventory': 'inventory.html',
    '#/inventory-legacy': 'inventory-legacy.html',
    '#/maintenance': 'maintenance.html',
    '#/procurement': 'procurement.html',
    '#/departments': 'departments.html',
    '#/reports': 'reports.html',
    '#/users': 'users.html',
    '#/notifications': 'notifications.html',
    '#/audit-logs': 'audit-logs.html',
    '#/settings': 'settings.html',
    '#/404': '404.html',
    '#/500': '500.html',
    '#/access-denied': 'access-denied.html',
    '#/offline': 'offline.html',
    '#/loading': 'loading.html',
    '#/empty-state': 'empty-state.html'
};

// Map of route path to sidebar nav element ID
const sidebarMap = {
    '#/dashboard': 'nav-dashboard',
    '#/tickets': 'nav-tickets',
    '#/requests': 'nav-requests',
    '#/inventory': 'nav-inventory',
    '#/procurement': 'nav-procurement',
    '#/maintenance': 'nav-maintenance',
    '#/biomedical': 'nav-biomedical',
    '#/departments': 'nav-departments',
    '#/reports': 'nav-reports',
    '#/users': 'nav-users',
    '#/notifications': 'nav-notifications',
    '#/audit-logs': 'nav-audit-logs',
    '#/settings': 'nav-settings'
};

// Active sidebar classes
const activeClasses = ['bg-secondary-container', 'text-on-secondary-container', 'font-bold', 'rounded-lg', 'scale-95', 'dark:bg-secondary', 'dark:text-on-secondary'];

// Global state variables
let currentHash = '';

// Main Router function
async function router() {
    const hash = window.location.hash || '#/login';
    currentHash = hash;
    
    // Check if route exists
    const file = routes[hash] || '404.html';
    
    const appShell = document.getElementById('app-shell');
    const loginContainer = document.getElementById('login-container');
    const appMain = document.getElementById('app-main');
    
    // Handle Login page vs App pages
    if (hash === '' || hash === '#/' || hash === '#/login') {
        appShell.classList.add('hidden');
        loginContainer.classList.remove('hidden');
        await loadPageContent(file, loginContainer, false);
    } else {
        loginContainer.classList.add('hidden');
        appShell.classList.remove('hidden');
        
        // Smooth transition fade-out
        appMain.classList.add('fade-out');
        
        // Load target file and inject only the <main> part
        setTimeout(async () => {
            await loadPageContent(file, appMain, true);
            updateSidebar(hash);
            appMain.classList.remove('fade-out');
        }, 150);
    }
}

// Fetch and load page content
async function loadPageContent(url, container, extractMain = false) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const html = await response.text();
        
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        if (extractMain) {
            const targetMain = doc.querySelector('main');
            if (targetMain) {
                container.innerHTML = targetMain.innerHTML;
                // Preserve body classes for theme styling
                container.className = targetMain.className + ' p-container-padding bg-background dark:bg-inverse-surface overflow-y-auto h-[calc(100vh-64px)] w-full';
            } else {
                container.innerHTML = `<div class="p-lg">Error: Screen content format incorrect.</div>`;
            }
        } else {
            // In case of login or standalone card
            const targetBody = doc.querySelector('body');
            if (targetBody) {
                container.innerHTML = targetBody.innerHTML;
                container.className = targetBody.className;
            } else {
                container.innerHTML = html;
            }
        }
        
        // Run any inline script tags that were in the original file (e.g. sparklines, CSS charts)
        const scripts = doc.querySelectorAll('script');
        scripts.forEach(script => {
            if (script.id !== 'tailwind-config' && !script.src.includes('app.js')) {
                const newScript = document.createElement('script');
                if (script.src) {
                    newScript.src = script.src;
                } else {
                    newScript.textContent = script.textContent;
                }
                document.body.appendChild(newScript);
                // Remove script to keep DOM clean
                setTimeout(() => newScript.remove(), 1000);
            }
        });
        
        // Re-bind interactive form elements inside container
        bindPageInteractions(container);
        
    } catch (err) {
        console.error('Failed to load page content:', err);
        container.innerHTML = `
            <div class="p-lg flex flex-col items-center justify-center text-center">
                <span class="material-symbols-outlined text-[64px] text-error mb-md">report_problem</span>
                <h2 class="text-headline-md font-bold mb-xs">Failed to load content</h2>
                <p class="text-body-md text-on-surface-variant mb-md">${err.message}</p>
                <a href="#/dashboard" class="bg-primary text-on-primary px-4 py-2 rounded-lg text-label-md font-bold hover:bg-primary-container transition-colors">Go to Dashboard</a>
            </div>
        `;
    }
}

// Update sidebar active link state
function updateSidebar(hash) {
    const activeId = sidebarMap[hash];
    
    // Clear all active classes from all links
    const sidebarNav = document.getElementById('sidebar-nav');
    if (sidebarNav) {
        sidebarNav.querySelectorAll('a').forEach(a => {
            activeClasses.forEach(c => a.classList.remove(c));
            // Add inactive hover classes
            a.classList.add('text-on-surface-variant', 'hover:bg-surface-container-high', 'hover:text-on-surface');
            // Reset icons
            const icon = a.querySelector('.material-symbols-outlined');
            if (icon) icon.classList.remove('icon-fill');
        });
        
        // Add active classes to the matching ID
        if (activeId) {
            const activeLink = document.getElementById(activeId);
            if (activeLink) {
                activeLink.classList.remove('text-on-surface-variant', 'hover:bg-surface-container-high', 'hover:text-on-surface');
                activeClasses.forEach(c => activeLink.classList.add(c));
                // Add fill variation to active icon
                const icon = activeLink.querySelector('.material-symbols-outlined');
                if (icon) icon.classList.add('icon-fill');
            }
        }
    }
}

// Bind form submissions and button clicks in loaded contents
function bindPageInteractions(container) {
    // 1. Handle login form submission
    const loginForm = container.querySelector('form');
    if (loginForm && (currentHash === '#/login' || currentHash === '')) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            showToast('Authentication Successful! Logging in...', 'success');
            setTimeout(() => {
                window.location.hash = '#/dashboard';
            }, 1000);
        });
        
        const googleBtn = container.querySelector('button[type="button"]');
        if (googleBtn && googleBtn.innerText.includes('Google')) {
            googleBtn.addEventListener('click', function(e) {
                e.preventDefault();
                showToast('SSO Authorized. Logging in...', 'success');
                setTimeout(() => {
                    window.location.hash = '#/dashboard';
                }, 1000);
            });
        }
    }
    
    // 2. Handle inner modal forms
    const modalForm = document.querySelector('#modal-wrapper form');
    if (modalForm) {
        modalForm.addEventListener('submit', function(e) {
            e.preventDefault();
            showToast('Form submitted successfully!', 'success');
            closeModal();
        });
    }
}

// Global modal elements
const modalOverlay = document.getElementById('modal-overlay');
const modalWrapper = document.getElementById('modal-wrapper');
const appShell = document.getElementById('app-shell');

// Open modal page dynamically as an overlay
async function openModal(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const html = await response.text();
        
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Find modal box container inside the absolute overlay wrapper
        const modalBox = doc.querySelector('.absolute.inset-0.z-50 > div:not(.absolute)') || 
                         doc.querySelector('[class*="bg-surface-container-lowest"]') ||
                         doc.querySelector('.max-w-3xl');
                         
        if (modalBox) {
            // Remove background dummy content transition properties that conflict with dragging
            modalBox.classList.remove('transform', 'transition-all');
            
            // Clean inline translations to start centering cleanly
            modalBox.style.transform = 'translate(0px, 0px)';
            modalBox.style.margin = '0 auto';
            
            // Enforce height limits to avoid clipping the top/bottom on small screens
            // Give it a max-height of 80vh and let the body scroll internally
            modalBox.style.maxHeight = '80vh';
            modalBox.style.display = 'flex';
            modalBox.style.flexDirection = 'col';
            
            // Find body inside modal and configure it
            const modalBody = modalBox.querySelector('.overflow-y-auto') || modalBox.querySelector('div:nth-child(2)');
            if (modalBody) {
                modalBody.classList.add('overflow-y-auto');
                modalBody.style.flex = '1';
            }
            
            // Inject content
            modalWrapper.innerHTML = '';
            modalWrapper.appendChild(modalBox);
            
            // Show modal and apply blur to background shell
            modalOverlay.classList.remove('hidden');
            appShell.classList.add('blur-sm', 'pointer-events-none');
            
            // Hook up draggable logic
            const header = modalBox.querySelector('.border-b') || modalBox.firstElementChild;
            if (header) {
                makeDraggable(modalBox, header);
            }
            
            // Bind inner form submit
            bindPageInteractions(modalWrapper);
            
        } else {
            console.error('Could not parse modal content box from URL:', url);
            showToast('Failed to open modal overlay.', 'error');
        }
    } catch (err) {
        console.error('Failed to open modal:', err);
        showToast('Error opening modal: ' + err.message, 'error');
    }
}

// Close active modal
function closeModal() {
    modalOverlay.classList.add('hidden');
    appShell.classList.remove('blur-sm', 'pointer-events-none');
    modalWrapper.innerHTML = '';
}

// Make element draggable by dragging its header handle
function makeDraggable(modalBox, header) {
    header.style.cursor = 'move';
    header.style.userSelect = 'none';
    
    let active = false;
    let currentX = 0;
    let currentY = 0;
    let initialX = 0;
    let initialY = 0;
    
    // Read starting style transform if present
    const transformStyle = window.getComputedStyle(modalBox).transform;
    let xOffset = 0;
    let yOffset = 0;
    
    if (transformStyle && transformStyle !== 'none') {
        const matrixValues = transformStyle.split('(')[1].split(')')[0].split(',');
        xOffset = parseInt(matrixValues[4]) || 0;
        yOffset = parseInt(matrixValues[5]) || 0;
    }

    header.addEventListener('mousedown', dragStart);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', dragEnd);

    header.addEventListener('touchstart', dragStart, { passive: true });
    document.addEventListener('touchmove', drag, { passive: false });
    document.addEventListener('touchend', dragEnd);

    function dragStart(e) {
        let event = e;
        if (e.type === 'touchstart') {
            event = e.touches[0];
        }
        
        // Only drag with left mouse click
        if (e.type === 'mousedown' && e.button !== 0) return;

        // If clicking input, buttons, or form controls, do not drag
        if (['input', 'select', 'textarea', 'button', 'a', 'span'].includes(e.target.tagName.toLowerCase())) {
            // Allow clicking close/cancel buttons
            if (e.target.tagName.toLowerCase() !== 'span') return;
        }

        initialX = event.clientX - xOffset;
        initialY = event.clientY - yOffset;
        
        active = true;
    }

    function drag(e) {
        if (!active) return;
        
        let event = e;
        if (e.type === 'touchmove') {
            event = e.touches[0];
            e.preventDefault();
        }

        currentX = event.clientX - initialX;
        currentY = event.clientY - initialY;

        xOffset = currentX;
        yOffset = currentY;

        setTranslate(currentX, currentY, modalBox);
    }

    function dragEnd() {
        active = false;
    }

    function setTranslate(x, y, el) {
        el.style.transform = `translate(${x}px, ${y}px)`;
    }
}

// Global Toast Notification Manager
function showToast(message, type = 'success') {
    // Create toast container if not already exists
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.className = 'fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none';
        document.body.appendChild(toastContainer);
    }
    
    // Create toast card
    const toast = document.createElement('div');
    toast.className = 'px-lg py-md rounded-lg shadow-lg border text-label-md font-bold flex items-center gap-2 pointer-events-auto transition-all duration-300 transform translate-y-10 opacity-0';
    
    if (type === 'success') {
        toast.className += ' bg-green-500 text-white border-green-600';
        toast.innerHTML = `<span class="material-symbols-outlined text-[18px] icon-fill">check_circle</span> ${message}`;
    } else if (type === 'error') {
        toast.className += ' bg-error text-white border-error-container';
        toast.innerHTML = `<span class="material-symbols-outlined text-[18px] icon-fill">warning</span> ${message}`;
    } else {
        toast.className += ' bg-surface-container text-on-surface border-outline-variant';
        toast.innerHTML = `<span class="material-symbols-outlined text-[18px]">info</span> ${message}`;
    }
    
    toastContainer.appendChild(toast);
    
    // Animate slide-in
    setTimeout(() => {
        toast.classList.remove('translate-y-10', 'opacity-0');
    }, 10);
    
    // Animate fade-out and remove
    setTimeout(() => {
        toast.classList.add('opacity-0', 'scale-90');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Event Delegation for links & modal actions
document.addEventListener('click', function(e) {
    // 1. Dynamic modal trigger buttons
    const btn = e.target.closest('button');
    if (btn) {
        const text = btn.innerText.toLowerCase().trim();
        const iconElement = btn.querySelector('.material-symbols-outlined');
        const iconText = iconElement ? iconElement.innerText.toLowerCase().trim() : '';
        
        // Check for specific buttons
        if (text.includes('new ticket') || iconText === 'add' && text.includes('ticket')) {
            e.preventDefault();
            openModal('new-ticket-modal.html');
            return;
        }
        if (text.includes('add user') || text.includes('person_add')) {
            e.preventDefault();
            openModal('add-user-modal.html');
            return;
        }
        if (text.includes('role matrix') || text.includes('admin_panel_settings')) {
            e.preventDefault();
            openModal('role-matrix-modal.html');
            return;
        }
        if (text.includes('add department') || text.includes('domain')) {
            e.preventDefault();
            openModal('add-department-modal.html');
            return;
        }
        if (text.includes('add inventory') || text.includes('inventory_2') && text.includes('add')) {
            e.preventDefault();
            openModal('add-inventory-modal.html');
            return;
        }
        if (text.includes('new request') || text.includes('assignment_returned') && text.includes('new')) {
            e.preventDefault();
            openModal('new-request-modal.html');
            return;
        }
        if (text.includes('new purchase order') || text.includes('new po') || text.includes('shopping_cart') && text.includes('new')) {
            e.preventDefault();
            openModal('new-purchase-order-modal.html');
            return;
        }
    }
    
    // 2. Clickable table rows in subpages
    const tr = e.target.closest('tr');
    if (tr && !e.target.closest('a') && !e.target.closest('button') && !e.target.closest('input')) {
        const hash = window.location.hash;
        if (hash.startsWith('#/users')) {
            e.preventDefault();
            openModal('user-detail-modal.html');
            return;
        }
        if (hash.startsWith('#/audit-logs')) {
            e.preventDefault();
            openModal('audit-detail-modal.html');
            return;
        }
        if (hash.startsWith('#/tickets')) {
            e.preventDefault();
            openModal('new-ticket-modal.html'); // open details modal
            return;
        }
    }
});

// Modal dismiss events
modalOverlay.addEventListener('click', function(e) {
    if (e.target === modalOverlay || e.target.id === 'modal-backdrop') {
        closeModal();
    }
});

// Intercept dismiss inside modal box (X and Cancel buttons)
modalWrapper.addEventListener('click', function(e) {
    const btn = e.target.closest('button');
    if (btn) {
        const text = btn.innerText.toLowerCase().trim();
        const iconElement = btn.querySelector('.material-symbols-outlined');
        const iconText = iconElement ? iconElement.innerText.toLowerCase().trim() : '';
        
        if (text.includes('cancel') || text.includes('close') || iconText === 'close') {
            closeModal();
        }
    }
});

// Theme toggle button setup
document.getElementById('nav-btn-theme').addEventListener('click', function() {
    document.documentElement.classList.toggle('dark');
    showToast('Theme mode toggled!', 'info');
});

// Header quick button alert binds
document.getElementById('nav-btn-terminal').addEventListener('click', () => showToast('Opening Terminal Console...', 'info'));
document.getElementById('nav-btn-notifications').addEventListener('click', () => showToast('Viewing recent system notifications...', 'info'));
document.getElementById('nav-btn-help').addEventListener('click', () => { window.location.hash = '#/empty-state'; });
document.getElementById('nav-btn-profile').addEventListener('click', () => { window.location.hash = '#/settings'; });
document.getElementById('nav-btn-generate-report').addEventListener('click', () => showToast('Generating custom scheduled report...', 'info'));

// Global Event Listeners for Routing
window.addEventListener('hashchange', router);
window.addEventListener('load', router);
