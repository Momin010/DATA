module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const limit = parseInt(req.query.limit) || 20;

  try {
    const [response1, response2] = await Promise.all([
      fetch('https://tapahtumat.tampere.fi/api/collection/634844c32f41a024ee51a234/content?country=FI&hashtagsForContentSelection=&lang=fi&mode=event&sort=startDate&strictLang=true'),
      fetch('https://tapahtumat.tampere.fi/api/collection/634844c32f41a024ee51a234/content?areas=&country=FI&hashtagsForContentSelection=&lang=fi&mode=event&sort=countViews&strictLang=true')
    ]);

    if (!response1.ok || !response2.ok) {
      throw new Error('Failed to fetch from API');
    }

    const data1 = await response1.json();
    const data2 = await response2.json();

    // Limit to first 10 from each
    const events1 = Array.isArray(data1.pages) ? data1.pages.slice(0, 10) : [];
    const events2 = Array.isArray(data2.pages) ? data2.pages.slice(0, 10) : [];

    // Combine
    const allEvents = [...events1, ...events2];

    // Apply limit
    const limitedEvents = allEvents.slice(0, limit);

    // Clean and structure the data
    const cleanedEvents = limitedEvents.map(event => ({
      title: event.name || 'No Title',
      description: event.descriptionShort || event.descriptionLong || 'No Description',
      startDate: event.defaultStartDate || event.event?.dates?.[0]?.start || 'Unknown',
      endDate: event.defaultEndDate || event.event?.dates?.[0]?.end || 'Unknown',
      location: event.locations?.[0]?.address || 'Unknown',
      url: event.originalUrl || event.event?.urlPurchaseTicket || ''
    }));

    res.status(200).json(cleanedEvents);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
}