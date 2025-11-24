class App {
    constructor() {
        this.sidebar = document.getElementById('sidebar');
        this.overlay = document.getElementById('sidebarOverlay');
        this.currentChapter = 1;
        this.totalChapters = 9;
        
        this.init();
    }

    async init() {
        await this.loadTOC();
        this.bindEvents();
        this.loadChapter(this.currentChapter);
        this.updateFooterYear();
    }

    async loadTOC() {
        try {
            console.log('Loading TOC from: components/toc.html');

            const response = await fetch('assets/components/toc.html');
            if (!response.ok) {
                throw new Error(`TOC not found: ${response.status}`);
            }

            const tocHTML = await response.text();
            console.log('TOC HTML loaded:', tocHTML.length, 'characters');

            this.sidebar.innerHTML = tocHTML;
            console.log('TOC displayed successfully');

        } catch (error) {
            console.error('Ошибка загрузки оглавления:', error);
        }
    }

    bindEvents() {
        console.log('Binding events...');

        // Переключение меню
        document.getElementById('menuToggle').addEventListener('click', () => this.toggleMenu());
        this.overlay.addEventListener('click', () => this.toggleMenu());

        // Обработка ссылок в меню (делегирование событий)
        this.sidebar.addEventListener('click', (event) => {
            if (event.target.classList.contains('toc-link')) {
                event.preventDefault();
                const chapterNumber = event.target.dataset.chapter;
                console.log('TOC link clicked:', chapterNumber);
                this.navigateToChapter(chapterNumber);
            }
        });

        // Закрытие меню при клике вне его
        document.addEventListener('click', (event) => {
            const menuToggle = document.querySelector('.menu-toggle');
            if (!this.sidebar.contains(event.target) &&
                !menuToggle.contains(event.target) &&
                this.sidebar.classList.contains('active')) {
                this.toggleMenu();
            }
        });

        console.log('Events bound successfully');
    }

    toggleMenu() {
        this.sidebar.classList.toggle('active');
        this.overlay.classList.toggle('active');
    }

    navigateToChapter(chapter) {
        console.log('Navigating to chapter:', chapter);

        // Если chapter - число, обновляем currentChapter
        if (!isNaN(chapter)) {
            this.currentChapter = parseInt(chapter);
        }

        this.loadChapter(chapter);
        this.updateActiveMenuLink(chapter);

        // Закрыть меню на мобильных устройствах
        if (window.innerWidth <= 768) {
            this.toggleMenu();
        }
    }

    updateActiveMenuLink(chapter) {
        document.querySelectorAll('.toc-link').forEach(link => {
            link.classList.remove('active');
        });

        const activeLink = document.querySelector(`[data-chapter="${chapter}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }

    async loadChapter(chapter) {
        try {
            console.log('Loading chapter:', chapter);

            let url;
            let isGallery = false;

            // Определяем URL для загрузки
            if (chapter === 'gallery') {
                url = 'chapters/gallery.html';
                isGallery = true;
            } else {
                url = `chapters/chapter${chapter}.html`;
                isGallery = false;
            }

            // Пробуем разные пути
            const paths = [
                url,
                `./${url}`,
                `/${url}`
            ];

            let content = '';
            let loaded = false;

            for (const path of paths) {
                try {
                    const response = await fetch(path);
                    if (response.ok) {
                        content = await response.text();
                        console.log('Chapter loaded from:', path);
                        loaded = true;
                        break;
                    }
                } catch (error) {
                    console.warn('Failed to load from:', path, error);
                }
            }

            if (!loaded) {
                throw new Error(`Could not load chapter ${chapter} from any path`);
            }

            document.getElementById('chapter-container').innerHTML = content;

            // Обновляем навигацию
            this.updateNavigationButtons(chapter, isGallery);

            // Прокрутка к верху
            window.scrollTo({ top: 0, behavior: 'smooth' });

            console.log('Chapter loaded successfully');

        } catch (error) {
            console.error('Ошибка загрузки:', error);
            document.getElementById('chapter-container').innerHTML = `
                <div class="chapter-content">
                    <div class="chapter-main" style="text-align: center; padding: 60px 0;">
                        <h2 style="color: #ff6b6b; margin-bottom: 20px;">Ошибка загрузки</h2>
                        <p style="color: #b8b8d0; margin-bottom: 30px;">Не удалось загрузить содержимое. Пожалуйста, попробуйте позже.</p>
                        <p style="color: #8888aa; font-size: 14px; margin-bottom: 20px;">Ошибка: ${error.message}</p>
                        <button class="nav-button" onclick="app.loadChapter('${chapter}')">Попробовать снова</button>
                    </div>
                </div>
            `;
        }
    }

    updateNavigationButtons(chapter, isGallery = false) {
        const prevButton = document.querySelector('.prev-button');
        const nextButton = document.querySelector('.next-button');
        const indicator = document.querySelector('.chapter-indicator');

        if (chapter === 'gallery') {
            // Навигация для галереи
            if (prevButton) {
                prevButton.textContent = '← К первой главе';
                prevButton.onclick = () => this.navigateToChapter(1);
                prevButton.disabled = false;
                prevButton.style.display = 'block';
            }
            if (nextButton) {
                nextButton.style.display = 'none';
            }
            if (indicator) {
                indicator.textContent = 'Галерея изображений';
            }
        } else {
            // Навигация для обычных глав
            const chapterNum = parseInt(chapter);

            if (prevButton) {
                prevButton.textContent = '← Предыдущая глава';
                prevButton.onclick = () => this.navigateToChapter(chapterNum - 1);
                prevButton.disabled = chapterNum === 1;
                prevButton.style.display = 'block';
            }
            if (nextButton) {
                nextButton.textContent = 'Следующая глава →';
                nextButton.onclick = () => this.navigateToChapter(chapterNum + 1);
                nextButton.disabled = chapterNum === this.totalChapters;
                nextButton.style.display = 'block';
            }
            if (indicator) {
                indicator.textContent = `Глава ${chapterNum} из ${this.totalChapters}`;
            }
        }
    }

    updateFooterYear() {
        const yearElement = document.querySelector('.footer-left');
        if (yearElement) {
            const currentYear = new Date().getFullYear();
            yearElement.textContent = `© ${currentYear} QUASARUM`;
        }
    }
}

// Инициализация приложения
let app;
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing app...');
    app = new App();
});
