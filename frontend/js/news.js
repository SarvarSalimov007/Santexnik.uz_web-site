// news.js – Dynamically loads news items and renders a simple carousel
export async function loadNews() {
  const response = await fetch('news.json');
  const newsItems = await response.json();
  const container = document.getElementById('news-carousel');
  if (!container) return;
  container.innerHTML = newsItems.map(item => `
    <div class="news-item">
      <h3>${item.title}</h3>
      <p>${item.summary}</p>
    </div>
  `).join('');
  // Simple auto‑scroll animation (CSS will handle transitions)
}

loadNews();
