import { moviesApi } from '../api/movies';

export const movieService = {
  // Parse iframe code and extract data
  parseIframeCode(iframeCode) {
    let iframeSrc = iframeCode.trim();
    let iframeWidth = '100%';
    let iframeHeight = '100%';

    // Extract src
    const iframeMatch = iframeSrc.match(/src=["']([^"']+)["']/);
    if (iframeMatch) {
      iframeSrc = iframeMatch[1];
    }

    // Extract width and height
    const widthMatch = iframeCode.match(/width=["']([^"']+)["']/);
    const heightMatch = iframeCode.match(/height=["']([^"']+)["']/);
    if (widthMatch) iframeWidth = widthMatch[1];
    if (heightMatch) iframeHeight = heightMatch[1];

    // Build iframe HTML
    const iframeHtml = `<iframe 
      width="${iframeWidth}" 
      height="${iframeHeight}" 
      src="${iframeSrc}" 
      frameborder="0" 
      allow="autoplay; encrypted-media; fullscreen; picture-in-picture; microphone; camera"
      loading="lazy"
      referrerpolicy="no-referrer-when-downgrade"
      style="border: none;"
    ></iframe>`;

    return {
      iframe: iframeHtml,
      iframeSrc,
    };
  },

  // Create movie
  async createMovie(title, iframeCode) {
    if (!title?.trim()) {
      throw new Error('Please enter a movie title');
    }

    if (!iframeCode?.trim()) {
      throw new Error('Please enter iframe code');
    }

    const { iframe, iframeSrc } = this.parseIframeCode(iframeCode);

    const response = await moviesApi.create({
      title: title.trim(),
      iframe,
      iframeSrc,
    });

    return response.data;
  },

  // Delete movie
  async deleteMovie(id) {
    const response = await moviesApi.delete(id);
    return response.data;
  },
};

