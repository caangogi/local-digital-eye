'use server';

/**
 * @fileOverview Mock service for Google My Business (GMB) data.
 * IMPORTANT: This service simulates GMB data for development and prototyping.
 * Directly scraping Google My Business pages is against their Terms of Service.
 * For a production application, you MUST use the official Google Business Profile API.
 */

/**
 * Simulates fetching the HTML content of a GMB page for a given business.
 * In a real application, this would involve HTTP requests and parsing,
 * or preferably, calls to the Google Business Profile API.
 *
 * @param businessName The name of the business.
 * @param location The location of the business (e.g., city, address).
 * @returns A promise that resolves to a string containing mock HTML content.
 */
export async function fetchMockGmbPageContent(
  businessName: string,
  location: string
): Promise<string> {
  console.log(`[MockGmbService] Simulating GMB page content fetch for: "${businessName}" in "${location}"`);

  // Simulate a delay, as if fetching from a network
  await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 500));

  // Generate some mock HTML. This is highly simplified.
  // A real GMB page is vastly more complex.
  const mockRating = (3.5 + Math.random() * 1.5).toFixed(1);
  const mockReviewCount = Math.floor(Math.random() * 500) + 10;
  const categories = ['Restaurant', 'Cafe', 'Bakery', 'Local Store', 'Service Provider'];
  const mockCategory = categories[Math.floor(Math.random() * categories.length)];
  
  const positiveAdjectives = ["delicious", "excellent", "friendly", "great", "amazing", "wonderful", "quick", "cozy"];
  const negativeAdjectives = ["slow", "poor", "rude", "okay", "mediocre"];
  const foodItems = ["coffee", "cakes", "burgers", "service", "atmosphere", "pizza", "dishes"];

  const generateReview = () => {
    const isPositive = Math.random() > 0.3;
    const adjective = isPositive ? positiveAdjectives[Math.floor(Math.random() * positiveAdjectives.length)] : negativeAdjectives[Math.floor(Math.random() * negativeAdjectives.length)];
    const item = foodItems[Math.floor(Math.random() * foodItems.length)];
    return `The ${item} was ${adjective}. Staff were ${isPositive ? "helpful" : "not very attentive"}.`;
  }

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head><title>Mock GMB Page: ${businessName}</title></head>
    <body>
      <header>
        <h1>${businessName} - ${location} Branch</h1>
        <div class="category">${mockCategory}</div>
      </header>
      <section id="info">
        <div class="address">123 Main St, ${location}, USA</div>
        <div class="phone">(555) 123-4567</div>
        <div class="website">https://www.example-business.com</div>
        <div class="rating">
          <span class="average-rating">${mockRating}</span> stars
        </div>
        <div class="review-count">${mockReviewCount} reviews</div>
      </section>
      <section id="hours">
        <h2>Opening Hours</h2>
        <ul>
          <li>Monday: 9:00 AM - 6:00 PM</li>
          <li>Tuesday: 9:00 AM - 6:00 PM</li>
          <li>Wednesday: 9:00 AM - 6:00 PM</li>
          <li>Thursday: 9:00 AM - 8:00 PM</li>
          <li>Friday: 9:00 AM - 8:00 PM</li>
          <li>Saturday: 10:00 AM - 4:00 PM</li>
          <li>Sunday: Closed</li>
        </ul>
      </section>
      <section id="reviews">
        <h2>Customer Reviews</h2>
        <article class="review">
          <p class="review-text">${generateReview()}</p>
          <span class="review-rating">5 stars</span>
        </article>
        <article class="review">
          <p class="review-text">${generateReview()}</p>
          <span class="review-rating">${Math.random() > 0.5 ? '4' : '2'} stars</span>
        </article>
        <article class="review">
          <p class="review-text">A good place for a quick bite. ${generateReview()}</p>
          <span class="review-rating">4 stars</span>
        </article>
      </section>
      <footer>
        <p>This is a mock GMB page for ${businessName}.</p>
      </footer>
    </body>
    </html>
  `;
}
