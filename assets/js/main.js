class App {
    constructor() {
        this.sidebar = document.getElementById('sidebar');
        this.overlay = document.getElementById('sidebarOverlay');
        this.currentChapter = 1;
        this.totalChapters = 6;
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadChapter(this.currentChapter);
        this.updateFooterYear();
    }

    bindEvents() {
        // Переключение меню
        document.getElementById('menuToggle').addEventListener('click', () => this.toggleMenu());
        this.overlay.addEventListener('click', () => this.toggleMenu());

        // Закрытие меню при клике вне его
        document.addEventListener('click', (event) => {
            const menuToggle = document.querySelector('.menu-toggle');
            if (!this.sidebar.contains(event.target) && 
                !menuToggle.contains(event.target) && 
                this.sidebar.classList.contains('active')) {
                this.toggleMenu();
            }
        });

        // Обработка ссылок в меню
        document.querySelectorAll('.toc-link').forEach(link => {
            link.addEventListener('click', (event) => {
                event.preventDefault();
                const chapterNumber = parseInt(event.target.dataset.chapter);
                this.navigateToChapter(chapterNumber);
            });
        });
    }

    toggleMenu() {
        this.sidebar.classList.toggle('active');
        this.overlay.classList.toggle('active');
    }

    navigateToChapter(chapterNumber) {
        this.currentChapter = chapterNumber;
        this.loadChapter(chapterNumber);
        this.updateActiveMenuLink(chapterNumber);

        // Закрыть меню на мобильных устройствах
        if (window.innerWidth <= 768) {
            this.toggleMenu();
        }
    }

    updateActiveMenuLink(chapterNumber) {
        document.querySelectorAll('.toc-link').forEach(link => {
            link.classList.remove('active');
        });

        const activeLink = document.querySelector(`[data-chapter="${chapterNumber}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }

    updateFooterYear() {
        const yearElement = document.querySelector('.footer-left');
        if (yearElement) {
            const currentYear = new Date().getFullYear();
            yearElement.textContent = `© ${currentYear} QUASARUM`;
        }
    }

    async loadChapter(chapterNumber) {
        try {
            const response = await fetch(`chapters/chapter${chapterNumber}.html`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const content = await response.text();

            // Обновляем контейнер
            document.getElementById('chapter-container').innerHTML = content;

            // Обновляем состояние кнопок навигации
            this.updateNavigationButtons(chapterNumber);

            // Прокрутка к верху
            window.scrollTo({ top: 0, behavior: 'smooth' });

        } catch (error) {
            console.error('Ошибка загрузки главы:', error);
            document.getElementById('chapter-container').innerHTML = `
                <div class="chapter-content">
                    <div class="chapter-scrollable" style="text-align: center; padding: 40px 0;">
                        <h2 style="color: #ff6b6b; margin-bottom: 20px;">Ошибка загрузки</h2>
                        <p style="color: #b8b8d0; margin-bottom: 30px;">Не удалось загрузить главу ${chapterNumber}. Пожалуйста, попробуйте позже.</p>
                        <button class="nav-button" onclick="app.loadChapter(${chapterNumber})">Попробовать снова</button>
                    </div>
                    <div class="chapter-navigation">
                        <button class="nav-button prev-button" ${chapterNumber === 1 ? 'disabled' : ''}>← Предыдущая глава</button>
                        <div class="chapter-indicator">Глава ${chapterNumber} из ${this.totalChapters}</div>
                        <button class="nav-button next-button" ${chapterNumber === this.totalChapters ? 'disabled' : ''}>Следующая глава →</button>
                    </div>
                </div>
            `;
            this.updateNavigationButtons(chapterNumber);
        }
    }

    updateNavigationButtons(chapterNumber) {
        // Добавляем обработчики для кнопок навигации
        document.querySelector('.prev-button')?.addEventListener('click', () => {
            if (this.currentChapter > 1) {
                this.navigateToChapter(this.currentChapter - 1);
            }
        });

        document.querySelector('.next-button')?.addEventListener('click', () => {
            if (this.currentChapter < this.totalChapters) {
                this.navigateToChapter(this.currentChapter + 1);
            }
        });

        // Обновляем индикатор текущей главы
        const indicator = document.querySelector('.chapter-indicator');
        if (indicator) {
            indicator.textContent = `Глава ${chapterNumber} из ${this.totalChapters}`;
        }

        // Обновляем состояние кнопок
        document.querySelector('.prev-button')?.toggleAttribute('disabled', chapterNumber === 1);
        document.querySelector('.next-button')?.toggleAttribute('disabled', chapterNumber === this.totalChapters);
    }
}

// Создаем глобальную переменную для обработчиков
let app;

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    app = new App();
});
