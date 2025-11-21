// Основные функции управления интерфейсом
class App {
    constructor() {
        this.sidebar = document.getElementById('sidebar');
        this.overlay = document.getElementById('sidebarOverlay');
        this.menuToggle = document.getElementById('menuToggle');
        this.mainContent = document.getElementById('mainContent');
        this.currentChapter = 1;
        this.totalChapters = 6;

        this.init();
    }

    init() {
        this.bindEvents();
        this.loadChapter(this.currentChapter);
        this.addCosmicElements();
    }

    addCosmicElements() {
        // Добавляем декоративные элементы прямо в body
        const cosmic1 = document.createElement('div');
        cosmic1.className = 'cosmic-element';

        const cosmic2 = document.createElement('div');
        cosmic2.className = 'cosmic-element';

        document.body.appendChild(cosmic1);
        document.body.appendChild(cosmic2);
    }

    bindEvents() {
        // Переключение меню
        this.menuToggle.addEventListener('click', () => this.toggleMenu());
        this.overlay.addEventListener('click', () => this.toggleMenu());

        // Закрытие меню при клике вне его
        document.addEventListener('click', (event) => {
            if (!this.sidebar.contains(event.target) &&
                !this.menuToggle.contains(event.target) &&
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

    async loadChapter(chapterNumber) {
        try {
            // Показываем индикатор загрузки
            this.showLoadingState();

            const response = await fetch(`chapters/chapter${chapterNumber}.html`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const content = await response.text();

            document.getElementById('chapter-container').innerHTML = content;

            // Добавляем навигацию после загрузки контента
            this.addNavigationToContent();

            // Прокрутка к верху страницы
            window.scrollTo({ top: 0, behavior: 'smooth' });

        } catch (error) {
            console.error('Ошибка загрузки главы:', error);
            this.showErrorState(chapterNumber);
        }
    }

    showLoadingState() {
        document.getElementById('chapter-container').innerHTML = `
            <div class="loading-state">
                <h2>Загрузка главы...</h2>
                <div class="loading-spinner"></div>
            </div>
        `;
    }

    showErrorState(chapterNumber) {
        document.getElementById('chapter-container').innerHTML = `
            <div class="error-message">
                <h2>Ошибка загрузки</h2>
                <p>Не удалось загрузить главу ${chapterNumber}. Пожалуйста, попробуйте позже.</p>
                <button class="nav-button" onclick="app.loadChapter(${chapterNumber})">Попробовать снова</button>
            </div>
        `;
    }

    addNavigationToContent() {
        const navigationHTML = `
            <div class="chapter-navigation">
                <button class="nav-button prev-button" id="prevChapter"
                    ${this.currentChapter === 1 ? 'disabled' : ''}>
                    ← Предыдущая глава
                </button>

                <div class="chapter-indicator">
                    Глава ${this.currentChapter} из ${this.totalChapters}
                </div>

                <button class="nav-button next-button" id="nextChapter"
                    ${this.currentChapter === this.totalChapters ? 'disabled' : ''}>
                    Следующая глава →
                </button>
            </div>
        `;

        document.getElementById('chapter-container').insertAdjacentHTML('beforeend', navigationHTML);

        // Добавляем обработчики для кнопок навигации
        document.getElementById('prevChapter')?.addEventListener('click', () => {
            if (this.currentChapter > 1) {
                this.navigateToChapter(this.currentChapter - 1);
            }
        });

        document.getElementById('nextChapter')?.addEventListener('click', () => {
            if (this.currentChapter < this.totalChapters) {
                this.navigateToChapter(this.currentChapter + 1);
            }
        });
    }
}

// Делаем app глобальной для обработчиков в HTML
let app;

// Инициализация приложения при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    app = new App();
});
