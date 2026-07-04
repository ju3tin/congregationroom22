document.addEventListener('DOMContentLoaded', function() {
    const progressBar = document.querySelector('.progress');
    const TOTAL_TIME = 60 * 60 * 24 * 7 * 3; // 3 weeks in seconds
    let elapsed = 0;

    function formatRemaining(seconds) {
        const days = Math.floor(seconds / (60 * 60 * 24));
        const hours = Math.floor((seconds % (60 * 60 * 24)) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${days}d ${hours}h ${minutes}m`;
    }

    const estimatedTimeEl = document.querySelector('.estimated-time');
    if (estimatedTimeEl) {
        estimatedTimeEl.textContent = 'Estimated Time: ' + formatRemaining(TOTAL_TIME);
    }

    const timer = setInterval(() => {
        elapsed += 1;
        const percent = (elapsed / TOTAL_TIME) * 100;
        progressBar.style.width = percent + '%';

        const remaining = Math.max(TOTAL_TIME - elapsed, 0);
        if (estimatedTimeEl) {
            estimatedTimeEl.textContent = 'Estimated Time: ' + formatRemaining(remaining);
        }

        if (elapsed >= TOTAL_TIME) {
            clearInterval(timer);
            if (estimatedTimeEl) {
                estimatedTimeEl.textContent = 'Maintenance Complete';
            }
        }
    }, 1000);

    // Add hover effect to maintenance icon
    const maintenanceIcon = document.querySelector('.maintenance-icon');
    maintenanceIcon.addEventListener('mouseenter', () => {
        maintenanceIcon.style.transform = 'scale(1.1)';
    });
    maintenanceIcon.addEventListener('mouseleave', () => {
        maintenanceIcon.style.transform = 'scale(1)';
    });

    // Add random background gradient animation
    setInterval(() => {
        const colors = ['#3498db', '#2ecc71', '#e74c3c', '#f1c40f'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        document.body.style.background = `linear-gradient(135deg, #2c3e50, ${randomColor})`;
    }, 5000);
});
